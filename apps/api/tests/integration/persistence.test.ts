import { copyFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { expect, it, vi } from 'vitest';
import type pg from 'pg';
import { createPool, requireUrl, transaction } from '../../src/persistence/database.js';
import { migrate, migrationsDirectory } from '../../src/persistence/migrate.js';
import { generateCredentials, seed, seedAccounts } from '../../src/persistence/seed.js';
import { withTestSchema } from './isolation.js';
const author = seedAccounts[0].id;
const reviewer = seedAccounts[2].id;
async function fixture(fn: (pool: pg.Pool) => Promise<void>) {
  await withTestSchema(async (pool, schema) => { await migrate(pool, schema); await seed(pool, generateCredentials()); await fn(pool); });
}
async function draft(pool: pg.Pool) {
  const r = await pool.query<{ id: string }>('INSERT INTO solicitudes(autor_id,tipo_codigo,titulo) VALUES($1,$2,$3) RETURNING id', [author,'material','Petición de material']);
  return r.rows[0]!.id;
}

it('aplica y registra migraciones una sola vez', async () => {
  await withTestSchema(async (pool, schema) => {
    expect(await migrate(pool,schema)).toHaveLength(2);
    expect(await migrate(pool,schema)).toHaveLength(0);
    expect((await pool.query('SELECT count(*)::int AS n FROM pgmigrations')).rows[0].n).toBe(2);
  });
});

it('revierte el DDL y registro de una migración fallida', async () => {
  const dir = await mkdtemp(join(tmpdir(),'p02-migrations-'));
  try {
    await copyFile(join(migrationsDirectory,'202611120001_initial.sql'),join(dir,'202611120001_initial.sql'));
    await copyFile(join(migrationsDirectory,'202611120002_sessions.sql'),join(dir,'202611120002_sessions.sql'));
    await writeFile(join(dir,'202611120003_failure.sql'),'-- Up Migration\nCREATE TABLE fallo_temporal(id integer);\nSELECT 1/0;\n');
    await withTestSchema(async (pool,schema) => {
      await migrate(pool,schema);
      await expect(migrate(pool,schema,dir)).rejects.toMatchObject({code: '22012'});
      expect((await pool.query('SELECT to_regclass($1) AS table_name',[`${schema}.fallo_temporal`])).rows[0].table_name).toBeNull();
      expect((await pool.query('SELECT count(*)::int AS n FROM pgmigrations')).rows[0].n).toBe(2);
    });
  } finally {
    if(dirname(resolve(dir))===resolve(tmpdir())&&basename(dir).startsWith('p02-migrations-'))await rm(dir,{recursive:true,force:true});
  }
});

it('persiste y recupera borradores con creación NULL a borrador', async () => {
  await fixture(async pool => {
    const id=await draft(pool);
    await pool.query('INSERT INTO eventos_solicitud(solicitud_id,actor_id,accion,estado_anterior,estado_posterior) VALUES($1,$2,$3,NULL,$4)',[id,author,'creacion','borrador']);
    const row=(await pool.query('SELECT * FROM solicitudes WHERE id=$1',[id])).rows[0];
    expect(row.estado).toBe('borrador');expect(row.responsable_id).toBeNull();expect(row.enviada_en).toBeNull();
    const event=(await pool.query('SELECT * FROM eventos_solicitud WHERE solicitud_id=$1 ORDER BY id',[id])).rows[0];
    expect(event.estado_anterior).toBeNull();expect(event.estado_posterior).toBe('borrador');
  });
});

it('admite envío, resoluciones y ambas formas de cancelación', async () => {
  await fixture(async pool => {
    for(const state of ['pendiente','aprobada','rechazada','cancelada']){
      const result=await pool.query('INSERT INTO solicitudes(autor_id,tipo_codigo,titulo,descripcion,estado,responsable_id,enviada_en,finalizada_en) VALUES($1,$2,$3,$4,$5,$6,now(),CASE WHEN $5::text=$7 THEN NULL ELSE now() END) RETURNING *',[author,'material','Petición enviada','Descripción válida',state,reviewer,'pendiente']);
      expect(result.rows[0].estado).toBe(state);expect(result.rows[0].enviada_en).not.toBeNull();
    }
    const cancelled=await pool.query('INSERT INTO solicitudes(autor_id,tipo_codigo,titulo,estado,finalizada_en) VALUES($1,$2,$3,$4,now()) RETURNING *',[author,'material','Borrador cancelado','cancelada']);
    expect(cancelled.rows[0].enviada_en).toBeNull();expect(cancelled.rows[0].responsable_id).toBeNull();
  });
});

it('rechaza correos duplicados, no normalizados y roles desconocidos', async () => {
  await fixture(async pool => {
    await expect(pool.query('UPDATE usuarios SET correo=$1 WHERE id=$2',[seedAccounts[0].correo,seedAccounts[1].id])).rejects.toMatchObject({code:'23505'});
    await expect(pool.query('UPDATE usuarios SET correo=$1 WHERE id=$2',['UPPER@example.com',author])).rejects.toMatchObject({code:'23514'});
    await expect(pool.query('UPDATE usuarios SET rol=$1 WHERE id=$2',['admin',author])).rejects.toMatchObject({code:'23514'});
  });
});

it('rechaza estados y combinaciones incompatibles, incluyendo fechas', async () => {
  await fixture(async pool => {
    const id=await draft(pool);
    for(const sql of [
      "UPDATE solicitudes SET estado='otro' WHERE id=$1",
      "UPDATE solicitudes SET estado='pendiente' WHERE id=$1",
      "UPDATE solicitudes SET responsable_id=autor_id WHERE id=$1",
      "UPDATE solicitudes SET estado='cancelada' WHERE id=$1",
      "UPDATE solicitudes SET estado='aprobada',finalizada_en=now() WHERE id=$1",
      "UPDATE solicitudes SET actualizada_en=creada_en-interval '1 day' WHERE id=$1",
      "UPDATE solicitudes SET estado='cancelada',finalizada_en=now(),responsable_id=autor_id WHERE id=$1",
    ]) await expect(pool.query(sql,[id])).rejects.toMatchObject({code:'23514'});
  });
});

it('aplica límites de título y descripción según envío', async () => {
  await fixture(async pool => {
    const id=await draft(pool);
    for(const title of ['ab',' x válido','x'.repeat(121)])await expect(pool.query('UPDATE solicitudes SET titulo=$1 WHERE id=$2',[title,id])).rejects.toMatchObject({code:'23514'});
    await expect(pool.query('UPDATE solicitudes SET descripcion=$1 WHERE id=$2',['x'.repeat(3001),id])).rejects.toMatchObject({code:'23514'});
    await expect(pool.query("UPDATE solicitudes SET estado='pendiente',responsable_id=$1,enviada_en=creada_en WHERE id=$2",[reviewer,id])).rejects.toMatchObject({code:'23514'});
    await pool.query('UPDATE solicitudes SET titulo=$1,descripcion=$2 WHERE id=$3',['á'.repeat(120),'x'.repeat(3000),id]);
  });
});

it('protege claves foráneas y no borra historial en cascada', async () => {
  await fixture(async pool => {
    const id=await draft(pool);
    await pool.query("INSERT INTO eventos_solicitud(solicitud_id,actor_id,accion,estado_posterior) VALUES($1,$2,'creacion','borrador')",[id,author]);
    await expect(pool.query('DELETE FROM usuarios WHERE id=$1',[author])).rejects.toMatchObject({code:'23001'});
    await expect(pool.query('DELETE FROM solicitudes WHERE id=$1',[id])).rejects.toMatchObject({code:'23001'});
    await expect(pool.query("UPDATE solicitudes SET responsable_id=$1,estado='pendiente',descripcion='Texto suficiente',enviada_en=creada_en WHERE id=$2",['ffffffff-ffff-4fff-8fff-ffffffffffff',id])).rejects.toMatchObject({code:'23503'});
    await expect(pool.query('UPDATE tipos_solicitud SET revisor_id=$1 WHERE codigo=$2',['ffffffff-ffff-4fff-8fff-ffffffffffff','material'])).rejects.toMatchObject({code:'23503'});
  });
});

it('valida acciones, estados y motivo del historial', async () => {
  await fixture(async pool => {
    const id=await draft(pool);
    const sql='INSERT INTO eventos_solicitud(solicitud_id,actor_id,accion,estado_anterior,estado_posterior,comentario) VALUES($1,$2,$3,$4,$5,$6)';
    for(const args of [['rechazo','pendiente','rechazada',null],['rechazo','pendiente','rechazada','corto'],['rechazo',null,'rechazada','Motivo correcto'],['envio','aprobada','pendiente',null],['aprobacion','pendiente','aprobada','x'.repeat(1001)]])await expect(pool.query(sql,[id,reviewer,...args])).rejects.toMatchObject({code:'23514'});
    await pool.query(sql,[id,reviewer,'rechazo','pendiente','rechazada','Motivo válido']);
    await pool.query(sql,[id,reviewer,'aprobacion','pendiente','aprobada',null]);
  });
});

it('confirma dos escrituras relacionadas en una sola conexión', async () => {
  await fixture(async pool => {
    const id=await transaction(pool,async client=>{
      const row=await client.query('INSERT INTO solicitudes(autor_id,tipo_codigo,titulo) VALUES($1,$2,$3) RETURNING id',[author,'material','Solicitud atómica']);
      const id=row.rows[0].id as string;
      await client.query("INSERT INTO eventos_solicitud(solicitud_id,actor_id,accion,estado_posterior) VALUES($1,$2,'creacion','borrador')",[id,author]);return id;
    });
    expect((await pool.query('SELECT count(*)::int AS n FROM eventos_solicitud WHERE solicitud_id=$1',[id])).rows[0].n).toBe(1);
  });
});

it('revierte la primera escritura cuando falla la segunda y libera la conexión', async () => {
  await fixture(async pool => {
    await expect(transaction(pool,async client=>{
      const row=await client.query('INSERT INTO solicitudes(autor_id,tipo_codigo,titulo) VALUES($1,$2,$3) RETURNING id',[author,'material','No debe persistir']);
      await client.query("INSERT INTO eventos_solicitud(solicitud_id,actor_id,accion,estado_posterior) VALUES($1,$2,'creacion','aprobada')",[row.rows[0].id,author]);
    })).rejects.toMatchObject({code:'23514'});
    expect((await pool.query('SELECT count(*)::int AS n FROM solicitudes')).rows[0].n).toBe(0);
    expect(pool.totalCount).toBe(pool.idleCount);
  });
});

it('revierte también ante un error de la operación sin error SQL', async () => {
  await fixture(async pool => {
    await expect(transaction(pool,async client=>{
      await client.query('UPDATE usuarios SET nombre=$1 WHERE id=$2',['Cambio temporal',author]);throw new Error('operación cancelada');
    })).rejects.toThrow('operación cancelada');
    expect((await pool.query('SELECT nombre FROM usuarios WHERE id=$1',[author])).rows[0].nombre).toBe(seedAccounts[0].nombre);
  });
});

it('repite el seed sin cambiar hashes, IDs, fechas o asignaciones', async () => {
  await withTestSchema(async(pool,schema)=>{
    await migrate(pool,schema);const credentials=generateCredentials();await seed(pool,credentials);
    const before=(await pool.query('SELECT * FROM usuarios ORDER BY id')).rows;
    const types=(await pool.query('SELECT * FROM tipos_solicitud ORDER BY codigo')).rows;
    await seed(pool,credentials);
    expect((await pool.query('SELECT * FROM usuarios ORDER BY id')).rows).toEqual(before);
    expect((await pool.query('SELECT * FROM tipos_solicitud ORDER BY codigo')).rows).toEqual(types);
    expect(before).toHaveLength(4);expect(types).toHaveLength(3);
    expect(before.every(row=>(row.password_hash as string).startsWith('$argon2id$v=19$m=65536,t=3,p=1$'))).toBe(true);
    expect((await pool.query('SELECT count(*)::int AS n FROM solicitudes')).rows[0].n).toBe(0);
  });
});

it('detecta conflictos de usuario y de asignación sin sobrescribirlos', async () => {
  await withTestSchema(async(pool,schema)=>{
    await migrate(pool,schema);const credentials=generateCredentials();await seed(pool,credentials);
    await pool.query('UPDATE usuarios SET rol=$1 WHERE id=$2',['revisor',author]);
    await expect(seed(pool,credentials)).rejects.toThrow('Conflicto');
    expect((await pool.query('SELECT rol FROM usuarios WHERE id=$1',[author])).rows[0].rol).toBe('revisor');
    await pool.query('UPDATE usuarios SET rol=$1 WHERE id=$2',['solicitante',author]);
    await pool.query('UPDATE tipos_solicitud SET revisor_id=$1 WHERE codigo=$2',[seedAccounts[3].id,'material']);
    await expect(seed(pool,credentials)).rejects.toThrow('Conflicto');
    expect((await pool.query('SELECT revisor_id FROM tipos_solicitud WHERE codigo=$1',['material'])).rows[0].revisor_id).toBe(seedAccounts[3].id);
  });
});

it('rechaza el destino de desarrollo por su identidad real, incluso con URL alternativa', async () => {
  const dev = requireUrl('DATABASE_URL');
  const alias = new URL(dev);alias.searchParams.set('application_name','isolation-proof');
  const beforePool=createPool(dev);
  try{
    const before=(await beforePool.query("SELECT nspname FROM pg_namespace WHERE nspname LIKE 'p02_test_%' ORDER BY nspname")).rows;
    let invoked=false;
    await expect(withTestSchema(async()=>{invoked=true;},alias.toString())).rejects.toThrow('Destino rechazado');
    expect(invoked).toBe(false);
    expect((await beforePool.query("SELECT nspname FROM pg_namespace WHERE nspname LIKE 'p02_test_%' ORDER BY nspname")).rows).toEqual(before);
  }finally{await beforePool.end();}
});

it('exige TEST_DATABASE_URL y conserva esquemas de otras ejecuciones', async () => {
  vi.stubEnv('TEST_DATABASE_URL','');
  try{await expect(withTestSchema(async()=>{})).rejects.toThrow('Falta TEST_DATABASE_URL');}finally{vi.unstubAllEnvs();}
  await withTestSchema(async(outer,outerSchema)=>{
    await outer.query('CREATE TABLE testigo(id integer)');
    await withTestSchema(async(inner)=>{await inner.query('CREATE TABLE efimera(id integer)');});
    expect((await outer.query('SELECT to_regclass($1) AS name',[`${outerSchema}.testigo`])).rows[0].name).not.toBeNull();
  });
});
