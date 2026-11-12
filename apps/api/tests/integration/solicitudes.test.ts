import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { createAuthentication, AUTH_MS } from '../../src/auth/authentication.js';
import { createSolicitudes } from '../../src/solicitudes.js';
import { migrate } from '../../src/persistence/migrate.js';
import { generateCredentials, seed, seedAccounts } from '../../src/persistence/seed.js';
import { withTestSchema } from './isolation.js';

const origin='http://127.0.0.1:5173';
const draft={titulo:'Material de prueba',tipo_codigo:'material',descripcion:''};
const absent='11111111-1111-4111-8111-111111111111';
function cookie(r:request.Response){
  const c=(r.headers['set-cookie'] as unknown as string[]|undefined)?.find(v=>v.startsWith('chamba.sid='));
  if(!c)throw new Error('Falta sesión de prueba');return c.split(';')[0]!;
}
async function fixture(fn:(f:{
  pool:Parameters<Parameters<typeof withTestSchema>[0]>[0];
  app:ReturnType<typeof createApp>;clock:{value:number};
  login:(index?:number)=>Promise<{cookie:string;token:string}>;
  get:(session:{cookie:string},path:string)=>request.Test;
  write:(session:{cookie:string;token:string},path?:string,method?:'post'|'patch')=>request.Test;
})=>Promise<void>){
  await withTestSchema(async(pool,schema)=>{
    await migrate(pool,schema);const credentials=generateCredentials();await seed(pool,credentials);
    const clock={value:Date.now()};
    const auth=await createAuthentication({pool,schema,now:()=>clock.value,config:{origin,secure:false,secret:randomBytes(32).toString('hex')}});
    const app=createApp({authRouter:auth.router,solicitudesRouter:createSolicitudes(pool,auth)});
    async function login(index=0){
      const pre=await request(app).get('/api/auth/csrf').expect(200);
      const r=await request(app).post('/api/auth/login').set('Cookie',cookie(pre)).set('Origin',origin)
        .set('X-CSRF-Token',pre.body.csrfToken).send(credentials[index]).expect(200);
      const c=cookie(r);const token=await request(app).get('/api/auth/csrf').set('Cookie',c).expect(200);
      return {cookie:c,token:token.body.csrfToken as string};
    }
    try{await fn({pool,app,clock,login,
      get:(s,path)=>request(app).get('/api/'+path).set('Cookie',s.cookie),
      write:(s,path='solicitudes',method='post')=>request(app)[method]('/api/'+path).set('Cookie',s.cookie).set('Origin',origin).set('X-CSRF-Token',s.token),
    });}finally{auth.close();}
  });
}
it('catálogo mínimo, crea y consulta borrador/evento; edita sin añadir eventos',async()=>{
  await fixture(async f=>{
    const a=await f.login();
    const types=await f.get(a,'tipos-solicitud').expect(200);
    expect(types.body.tipos).toHaveLength(3);
    expect(types.body.tipos.every((t:object)=>Object.keys(t).sort().join(',')==='codigo,nombre')).toBe(true);
    const created=await f.write(a).send({...draft,titulo:'  Nuevo material  '}).expect(201);
    const s=created.body.solicitud;
    expect(created.headers.location).toBe('/api/solicitudes/'+s.id);
    expect(s).toMatchObject({titulo:'Nuevo material',autor_id:seedAccounts[0].id,estado:'borrador',responsable_id:null,enviada_en:null,finalizada_en:null});
    const detail=await f.get(a,'solicitudes/'+s.id).expect(200);
    expect(detail.body.historial).toHaveLength(1);
    expect(detail.body.historial[0]).toMatchObject({accion:'creacion',actor_id:seedAccounts[0].id,estado_anterior:null,estado_posterior:'borrador',comentario:null});
    const edited=await f.write(a,'solicitudes/'+s.id,'patch').send({descripcion:'Descripción modificada',tipo_codigo:'software'}).expect(200);
    expect(edited.body.solicitud.titulo).toBe('Nuevo material');
    expect(new Date(edited.body.solicitud.actualizada_en).getTime()).toBeGreaterThanOrEqual(new Date(s.actualizada_en).getTime());
    expect((await f.get(a,'solicitudes/'+s.id)).body.historial).toHaveLength(1);
    expect(edited.headers['cache-control']).toBe('no-store');
  });
});
it('aislamiento de dos solicitantes y revisor en lista, detalle, edición y creación',async()=>{
  await fixture(async f=>{
    const a=await f.login(),b=await f.login(1),r=await f.login(2);
    const first=(await f.write(a).send(draft).expect(201)).body.solicitud;
    const second=(await f.write(b).send({...draft,titulo:'Privada segunda'}).expect(201)).body.solicitud;
    for(const outsider of [b,r]){
      expect((await f.get(outsider,'solicitudes/'+first.id).expect(404)).body)
        .toEqual((await f.get(outsider,'solicitudes/'+absent).expect(404)).body);
      await f.write(outsider,'solicitudes/'+first.id,'patch').send({titulo:'Intrusión'}).expect(404);
    }
    expect((await f.get(a,'solicitudes').expect(200)).body.solicitudes.map((s:{id:string})=>s.id)).toEqual([first.id]);
    expect((await f.get(b,'solicitudes').expect(200)).body.solicitudes.map((s:{id:string})=>s.id)).toEqual([second.id]);
    expect((await f.get(r,'solicitudes').expect(200)).body.solicitudes).toEqual([]);
    await f.write(r).send(draft).expect(403);
  });
});
it('rechaza todos los campos controlados por servidor en creación y edición',async()=>{
  await fixture(async f=>{
    const a=await f.login();const id=(await f.write(a).send(draft)).body.solicitud.id;
    for(const key of ['id','autor_id','responsable_id','rol','estado','creada_en','actualizada_en','enviada_en','finalizada_en','extra']){
      await f.write(a).send({...draft,[key]:'manipulado'}).expect(400);
      await f.write(a,'solicitudes/'+id,'patch').send({titulo:'Otro título',[key]:'manipulado'}).expect(400);
    }
    expect((await f.get(a,'solicitudes')).body.paginacion.total).toBe(1);
  });
});
it('valida límites Unicode coherentes con PostgreSQL y normaliza solo título',async()=>{
  await fixture(async f=>{
    const a=await f.login();
    for(const title of ['ab','😀'.repeat(121),'\uD800ab','<b>título</b>','abc\0']){
      await f.write(a).send({...draft,titulo:title}).expect(400);
    }
    for(const description of ['😀'.repeat(3001),'\uDC00','<script>alert(1)</script>','\0']){
      await f.write(a).send({...draft,descripcion:description}).expect(400);
    }
    for(const titulo of ['😀ab','😀'.repeat(120),'e\u0301x']){
      const r=await f.write(a).send({...draft,titulo:'\u00a0'+titulo+'\t',descripcion:'😀'.repeat(3000)}).expect(201);
      const lengths=await f.pool.query('SELECT char_length(titulo) t,char_length(descripcion) d FROM solicitudes WHERE id=$1',[r.body.solicitud.id]);
      expect(lengths.rows[0]).toEqual({t:Array.from(titulo).length,d:3000});
      expect(r.body.solicitud.titulo).toBe(titulo);
    }
    const literal=await f.write(a).send({...draft,descripcion:'  2 < 3\n  '}).expect(201);
    expect(literal.body.solicitud.descripcion).toBe('  2 < 3\n  ');
  });
});
it('rechaza tipo desconocido, JSON/cuerpo/UUID/query inválidos y PATCH vacío',async()=>{
  await fixture(async f=>{
    const a=await f.login();const id=(await f.write(a).send(draft)).body.solicitud.id;
    await f.write(a).send({...draft,tipo_codigo:'ausente'}).expect(400);
    await f.write(a,'solicitudes/'+id,'patch').send({tipo_codigo:'ausente'}).expect(400);
    await f.write(a,'solicitudes/'+id,'patch').send({}).expect(400);
    await f.write(a).set('Content-Type','application/json').send('{').expect(400);
    await f.write(a).send({...draft,descripcion:'x'.repeat(17000)}).expect(413);
    await f.get(a,'solicitudes/no-uuid').expect(400);
    for(const q of ['pagina=0','pagina=-1','pagina=01','pagina=1.5','pagina=1000001','tamano=101','tamano=0','tamano=1&tamano=2','autor_id='+seedAccounts[1].id]){
      await f.get(a,'solicitudes?'+q).expect(400);
    }
    await f.get(a,'tipos-solicitud?extra=x').expect(400);
    await f.get(a,'solicitudes/'+id+'?extra=x').expect(400);
    await f.write(a,'solicitudes?extra=x').send(draft).expect(400);
  });
});
it('paginación predeterminada/máxima, desempate estable y aislamiento incluso fuera del total',async()=>{
  await fixture(async f=>{
    const a=await f.login();
    await f.pool.query("INSERT INTO solicitudes (autor_id,titulo,tipo_codigo) SELECT $1,'Prueba '||n,'material' FROM generate_series(1,23) n",[seedAccounts[0].id]);
    await f.pool.query("INSERT INTO solicitudes (autor_id,titulo,tipo_codigo) VALUES ($1,'Ajena','material')",[seedAccounts[1].id]);
    const expected=(await f.pool.query('SELECT id FROM solicitudes WHERE autor_id=$1 ORDER BY creada_en DESC,id DESC',[seedAccounts[0].id])).rows.map(r=>r.id);
    const first=await f.get(a,'solicitudes').expect(200);
    const second=await f.get(a,'solicitudes?pagina=2').expect(200);
    expect(first.body.paginacion).toEqual({pagina:1,tamano:20,total:23,paginas:2});
    expect([...first.body.solicitudes,...second.body.solicitudes].map((r:{id:string})=>r.id)).toEqual(expected);
    expect((await f.get(a,'solicitudes?tamano=100')).body.solicitudes).toHaveLength(23);
    const empty=await f.get(a,'solicitudes?pagina=99').expect(200);
    expect(empty.body.solicitudes).toEqual([]);expect(empty.body.paginacion.total).toBe(23);
  });
});
it('rollback revierte solicitud cuando falla evento inicial',async()=>{
  await fixture(async f=>{
    const a=await f.login();
    await f.pool.query("ALTER TABLE eventos_solicitud ADD CONSTRAINT fallo_prueba CHECK (accion <> 'creacion')");
    const failure=await f.write(a).send(draft).expect(503);
    expect(failure.text).not.toMatch(/fallo_prueba|INSERT|constraint|password/i);
    expect((await f.pool.query('SELECT count(*)::int n FROM solicitudes')).rows[0].n).toBe(0);
    expect((await f.pool.query('SELECT count(*)::int n FROM eventos_solicitud')).rows[0].n).toBe(0);
  });
});
it('propia fuera de borrador devuelve 409; conserva visibilidad tras envío y cancelación',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2),other=await f.login(3);
    const id=(await f.write(a).send({...draft,descripcion:'Descripción suficientemente larga'})).body.solicitud.id;
    await f.pool.query("UPDATE solicitudes SET estado='cancelada',finalizada_en=creada_en WHERE id=$1",[id]);
    await f.write(a,'solicitudes/'+id,'patch').send({titulo:'No editable'}).expect(409);
    await f.get(r,'solicitudes/'+id).expect(404);
    await f.pool.query('UPDATE solicitudes SET responsable_id=$2,enviada_en=creada_en WHERE id=$1',[id,seedAccounts[2].id]);
    await f.get(r,'solicitudes/'+id).expect(200);
    expect((await f.get(r,'solicitudes')).body.paginacion.total).toBe(1);
    await f.get(other,'solicitudes/'+id).expect(404);
    await f.write(r,'solicitudes/'+id,'patch').send({titulo:'No editable'}).expect(404);
  });
});
it('ediciones concurrentes preservan campos disjuntos y no crean eventos',async()=>{
  await fixture(async f=>{
    const a=await f.login();const id=(await f.write(a).send(draft)).body.solicitud.id;
    await Promise.all([
      f.write(a,'solicitudes/'+id,'patch').send({titulo:'Título concurrente'}).expect(200),
      f.write(a,'solicitudes/'+id,'patch').send({descripcion:'Texto concurrente'}).expect(200),
    ]);
    const detail=(await f.get(a,'solicitudes/'+id)).body;
    expect(detail.solicitud).toMatchObject({titulo:'Título concurrente',descripcion:'Texto concurrente'});
    expect(detail.historial).toHaveLength(1);
  });
});
it('estado concurrente confirmado antes del bloqueo impide una edición desfasada',async()=>{
  await fixture(async f=>{
    const a=await f.login();const id=(await f.write(a).send(draft)).body.solicitud.id;
    const lock=await f.pool.connect();
    try{
      await lock.query('BEGIN');
      await lock.query(
        `WITH momento AS MATERIALIZED (SELECT clock_timestamp() AS fecha)
         UPDATE solicitudes s SET estado='cancelada',finalizada_en=m.fecha,actualizada_en=m.fecha
         FROM momento m WHERE s.id=$1`,[id]);
      const pending=f.write(a,'solicitudes/'+id,'patch').send({titulo:'No debe persistir'}).expect(409).then(r=>r);
      const pid=(await lock.query('SELECT pg_backend_pid() pid')).rows[0].pid as number;
      const deadline=Date.now()+5000;
      let blocked=false;
      while(Date.now()<deadline){
        blocked=(await f.pool.query('SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE $1=ANY(pg_blocking_pids(pid))) blocked',[pid])).rows[0].blocked as boolean;
        if(blocked)break;
        await new Promise(resolve=>setTimeout(resolve,20));
      }
      expect(blocked).toBe(true);
      await lock.query('COMMIT');await pending;
      expect((await f.get(a,'solicitudes/'+id)).body.solicitud.titulo).toBe(draft.titulo);
      // Comparación en PostgreSQL: Date/JSON perdería precisión de microsegundos.
      expect((await f.pool.query(
        'SELECT finalizada_en=actualizada_en AS fechas_iguales FROM solicitudes WHERE id=$1',[id]
      )).rows).toEqual([{fechas_iguales:true}]);
    }finally{await lock.query('ROLLBACK');lock.release();}
  });
});
it('rutas nuevas exigen sesión, CSRF/origen y mantienen expiración absoluta',async()=>{
  await fixture(async f=>{
    const a=await f.login();
    const id=(await f.write(a).send(draft)).body.solicitud.id;
    for(const path of ['tipos-solicitud','solicitudes','solicitudes/'+id]){
      const r=await request(f.app).get('/api/'+path).expect(401);expect(r.headers['cache-control']).toBe('no-store');
    }
    for(const method of ['post','patch'] as const){
      const path='/api/solicitudes'+(method==='patch'?'/'+id:'');
      await request(f.app)[method](path).send(draft).expect(401);
      await request(f.app)[method](path).set('Cookie',a.cookie).set('Origin',origin).send(draft).expect(403);
      await request(f.app)[method](path).set('Cookie',a.cookie).set('Origin','https://ajeno.example').set('X-CSRF-Token',a.token).send(draft).expect(403);
    }
    const before=(await f.pool.query('SELECT expire,sess FROM sesiones WHERE sess::jsonb ? \'userId\'')).rows[0];
    f.clock.value+=60*60000;
    await f.get(a,'solicitudes').expect(200);
    await f.write(a,'solicitudes/'+id,'patch').send({titulo:'Actividad válida'}).expect(200);
    const after=(await f.pool.query('SELECT expire,sess FROM sesiones WHERE sess::jsonb ? \'userId\'')).rows[0];
    expect(after.expire).toEqual(before.expire);expect(after.sess.expiresAt).toBe(before.sess.expiresAt);
    f.clock.value+=AUTH_MS;
    await f.get(a,'solicitudes').expect(401);
    await f.write(a).send(draft).expect(401);
    await f.write(a,'solicitudes/'+id,'patch').send({titulo:'Caducada'}).expect(401);
  });
});
it('errores de lectura/edición son técnicos y health conserva independencia',async()=>{
  await fixture(async f=>{
    const a=await f.login();const id=(await f.write(a).send(draft)).body.solicitud.id;
    await f.pool.query('ALTER TABLE solicitudes RENAME TO solicitudes_indisponibles');
    for(const path of ['solicitudes','solicitudes/'+id]){
      const r=await f.get(a,path).expect(503);expect(r.headers['cache-control']).toBe('no-store');
      expect(r.text).not.toMatch(/relation|SELECT|solicitudes_indisponibles/i);
    }
    await f.write(a,'solicitudes/'+id,'patch').send({titulo:'Error técnico'}).expect(503);
    await f.pool.query('ALTER TABLE sesiones RENAME TO sesiones_indisponibles');
    await f.get(a,'tipos-solicitud').expect(503);
    await request(f.app).get('/api/health').expect(200,{status:'ok'});
    await request(f.app).get('/api/desconocida').expect(404);
  });
});
