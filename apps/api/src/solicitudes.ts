import express from 'express';
import { z } from 'zod';
import type pg from 'pg';
import { AuthError, type PublicUser, type createAuthentication } from './auth/authentication.js';
import { transaction } from './persistence/database.js';

const invalid = (message: string) => new AuthError(400, 'INVALID_INPUT', message);
const missing = () => new AuthError(404, 'NOT_FOUND', 'Solicitud no encontrada.');
const plain = (value: string) => !/[\uD800-\uDFFF]/u.test(value) && !value.includes('\0') && !/<\/?[a-z][^>]*>/iu.test(value);
const text = (min: number, max: number) => z.string().refine(v => plain(v) && Array.from(v).length >= min && Array.from(v).length <= max);
const fields = {
  titulo: z.string().transform(v => v.trim()).pipe(text(3, 120)),
  tipo_codigo: text(1, 50),
  descripcion: text(0, 3000),
};
const creation = z.strictObject({ ...fields, descripcion: fields.descripcion.default('') });
const editing = z.strictObject({ titulo: fields.titulo.optional(), tipo_codigo: fields.tipo_codigo.optional(), descripcion: fields.descripcion.optional() })
  .refine(v => Object.keys(v).length > 0);
const integer = (max: number, fallback: string) => z.string().regex(/^[1-9][0-9]*$/).default(fallback)
  .transform(Number).refine(n => Number.isSafeInteger(n) && n <= max);
const pagination = z.strictObject({ pagina: integer(1000000, '1'), tamano: integer(100, '20') });
const noQuery = z.strictObject({});
const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
// El mismo ámbito en lista y detalle conserva la visibilidad definitiva del brief.
const visible = "((autor_id=$1 AND $2='solicitante') OR (responsable_id=$1 AND $2='revisor' AND enviada_en IS NOT NULL AND estado<>'borrador'))";
function parse<T>(schema: z.ZodType<T>, value: unknown, message: string): T {
  const result = schema.safeParse(value);
  if (!result.success) throw invalid(message);
  return result.data;
}
const bodyMessage = 'Revisa los campos: título de 3 a 120 caracteres, tipo disponible y descripción de hasta 3000; solo texto plano y sin campos adicionales.';
async function validType(client: pg.PoolClient, codigo: string) {
  if (!(await client.query('SELECT codigo FROM tipos_solicitud WHERE codigo=$1', [codigo])).rowCount) {
    throw invalid('Selecciona un tipo de solicitud disponible.');
  }
}
export function createSolicitudes(pool: pg.Pool, auth: Awaited<ReturnType<typeof createAuthentication>>) {
  const router = express.Router();
  router.use(['/tipos-solicitud', '/solicitudes'], auth.createPrivateRouter());
  router.get('/tipos-solicitud', async (req, res) => {
    parse(noQuery, req.query, 'El catálogo no admite parámetros.');
    res.json({ tipos: (await pool.query('SELECT codigo,nombre FROM tipos_solicitud ORDER BY codigo')).rows });
  });
  router.post('/solicitudes', auth.protectWrite, async (req, res) => {
    parse(noQuery, req.query, 'La creación no admite parámetros.');
    const user = res.locals.user as PublicUser;
    if (user.rol !== 'solicitante') throw new AuthError(403, 'FORBIDDEN', 'Solo un solicitante puede crear borradores.');
    const input = parse(creation, req.body, bodyMessage);
    const solicitud = await transaction(pool, async client => {
      await validType(client, input.tipo_codigo);
      const result = await client.query(
        'INSERT INTO solicitudes (autor_id,titulo,tipo_codigo,descripcion) VALUES ($1,$2,$3,$4) RETURNING *',
        [user.id, input.titulo, input.tipo_codigo, input.descripcion]);
      const row = result.rows[0] as { id: string };
      await client.query("INSERT INTO eventos_solicitud (solicitud_id,actor_id,accion,estado_posterior) VALUES ($1,$2,'creacion','borrador')", [row.id, user.id]);
      return row;
    });
    res.location('/api/solicitudes/' + solicitud.id).status(201).json({ solicitud });
  });
  router.get('/solicitudes', async (req, res) => {
    const { pagina, tamano } = parse(pagination, req.query, 'Usa pagina entre 1 y 1000000 y tamano entre 1 y 100, sin otros parámetros.');
    const user = res.locals.user as PublicUser;
    const result = await pool.query(
      `WITH visibles AS (SELECT * FROM solicitudes WHERE ${visible})
       SELECT (SELECT count(*)::int FROM visibles) AS total,
         COALESCE((SELECT json_agg(p ORDER BY p.creada_en DESC,p.id DESC) FROM
           (SELECT * FROM visibles ORDER BY creada_en DESC,id DESC LIMIT $3 OFFSET $4) p),'[]'::json) AS solicitudes`,
      [user.id, user.rol, tamano, (pagina - 1) * tamano]);
    const row = result.rows[0] as { total: number; solicitudes: unknown[] };
    res.json({ solicitudes: row.solicitudes, paginacion: { pagina, tamano, total: row.total, paginas: Math.ceil(row.total / tamano) } });
  });
  router.get('/solicitudes/:id', async (req, res) => {
    parse(noQuery, req.query, 'El detalle no admite parámetros.');
    const id = parse(uuid, req.params.id, 'El identificador de solicitud no es válido.');
    const user = res.locals.user as PublicUser;
    const result = await pool.query(`SELECT * FROM solicitudes WHERE ${visible} AND id=$3`, [user.id, user.rol, id]);
    if (!result.rowCount) throw missing();
    const history = await pool.query(
      `SELECT e.* FROM eventos_solicitud e JOIN solicitudes s ON s.id=e.solicitud_id
       WHERE ${visible} AND s.id=$3 ORDER BY e.id`, [user.id, user.rol, id]);
    res.json({ solicitud: result.rows[0], historial: history.rows });
  });
  router.patch('/solicitudes/:id', auth.protectWrite, async (req, res) => {
    parse(noQuery, req.query, 'La edición no admite parámetros.');
    const id = parse(uuid, req.params.id, 'El identificador de solicitud no es válido.');
    const input = parse(editing, req.body, bodyMessage);
    const user = res.locals.user as PublicUser;
    const solicitud = await transaction(pool, async client => {
      const locked = await client.query("SELECT * FROM solicitudes WHERE id=$1 AND autor_id=$2 AND $3='solicitante' FOR UPDATE", [id, user.id, user.rol]);
      if (!locked.rowCount) throw missing();
      const row = locked.rows[0] as { estado: string; titulo: string; tipo_codigo: string; descripcion: string };
      if (row.estado !== 'borrador') throw new AuthError(409, 'INVALID_STATE', 'Solo se pueden editar solicitudes en borrador.');
      if (input.tipo_codigo !== undefined) await validType(client, input.tipo_codigo);
      return (await client.query(
        'UPDATE solicitudes SET titulo=$2,tipo_codigo=$3,descripcion=$4,actualizada_en=clock_timestamp() WHERE id=$1 AND autor_id=$5 RETURNING *',
        [id, input.titulo ?? row.titulo, input.tipo_codigo ?? row.tipo_codigo, input.descripcion ?? row.descripcion, user.id])).rows[0] as unknown;
    });
    res.json({ solicitud });
  });
  router.use(auth.handleError);
  return router;
}
