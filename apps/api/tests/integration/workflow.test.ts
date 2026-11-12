import request from 'supertest';
import { expect, it } from 'vitest';
import { AUTH_MS } from '../../src/auth/authentication.js';
import { seedAccounts } from '../../src/persistence/seed.js';
import { fixture, origin, type Fixture } from './workflow-fixture.js';

const draft={titulo:'Petición de material',tipo_codigo:'material',descripcion:'Descripción suficiente para enviar.'};
const absent='11111111-1111-4111-8111-111111111111';
type Session=Awaited<ReturnType<Fixture['login']>>;
async function create(f:Fixture,a:Session,input:object=draft){return (await f.write(a).send(input).expect(201)).body.solicitud.id as string;}
const action=(f:Fixture,a:Session,id:string,verb='enviar')=>f.write(a,'solicitudes/'+id+'/'+verb).send({});
async function detail(f:Fixture,a:Session,id:string){return (await f.get(a,'solicitudes/'+id).expect(200)).body;}
async function waitBlocked(f:Fixture,pid:number,count:number){
  const until=Date.now()+6000;
  while(Date.now()<until){
    // Incluye quien espera al primer competidor de la cola del bloqueo por fila.
    const result=await f.pool.query(
      `WITH RECURSIVE blocked AS (
         SELECT pid FROM pg_stat_activity WHERE $1=ANY(pg_blocking_pids(pid))
         UNION
         SELECT a.pid FROM pg_stat_activity a JOIN blocked b ON b.pid=ANY(pg_blocking_pids(a.pid))
       ) SELECT count(DISTINCT pid)::int n FROM blocked`,[pid]);
    if(result.rows[0].n>=count)return;
    await new Promise(resolve=>setTimeout(resolve,20));
  }
  throw Error('No se observó la espera concurrente esperada');
}
async function race(f:Fixture,id:string,first:()=>request.Test,second:()=>request.Test){
  const gate=await f.pool.connect();
  try{
    await gate.query('BEGIN');await gate.query('SELECT id FROM solicitudes WHERE id=$1 FOR UPDATE',[id]);
    const pid=(await gate.query('SELECT pg_backend_pid() pid')).rows[0].pid as number;
    const one=first().then(r=>r);await waitBlocked(f,pid,1);
    const two=second().then(r=>r);await waitBlocked(f,pid,2);
    await gate.query('COMMIT');return await Promise.all([one,two]);
  }finally{await gate.query('ROLLBACK');gate.release();}
}
function checkHistory(d:Awaited<ReturnType<typeof detail>>,actions:string[]){
  expect(d.historial.map((e:{accion:string})=>e.accion)).toEqual(actions);
  expect(d.historial.at(-1).estado_posterior).toBe(d.solicitud.estado);
  for(let i=1;i<d.historial.length;i++){
    expect(d.historial[i].estado_anterior).toBe(d.historial[i-1].estado_posterior);
    expect(Date.parse(d.historial[i].creada_en)).toBeGreaterThanOrEqual(Date.parse(d.historial[i-1].creada_en));
  }
}
it('envío valida contenido, asigna según tipo guardado y mantiene fechas/evento coherentes',async()=>{
  await fixture(async f=>{
    const a=await f.login();const id=await create(f,a,{...draft,descripcion:'😀'.repeat(9)});
    await action(f,a,id).expect(400);
    expect((await detail(f,a,id)).solicitud.estado).toBe('borrador');
    await f.write(a,'solicitudes/'+id,'patch').send({tipo_codigo:'formacion',descripcion:'😀'.repeat(10)}).expect(200);
    const sent=await action(f,a,id).expect(200);
    expect(sent.body.solicitud).toMatchObject({estado:'pendiente',responsable_id:seedAccounts[3].id,finalizada_en:null});
    expect(sent.body.solicitud.enviada_en).toBe(sent.body.solicitud.actualizada_en);
    const d=await detail(f,a,id);checkHistory(d,['creacion','envio']);
    expect(d.solicitud.autor_nombre).toBe(seedAccounts[0].nombre);
    expect(d.solicitud.responsable_nombre).toBe(seedAccounts[3].nombre);
    expect(d.historial[1].actor_nombre).toBe(seedAccounts[0].nombre);
    expect(d.historial[1].creada_en).toBe(d.solicitud.enviada_en);
    expect(JSON.stringify(d)).not.toMatch(/@example|password_hash/);
    await action(f,a,id).expect(409);
    await f.write(a,'solicitudes/'+id,'patch').send({titulo:'No editable'}).expect(409);
    checkHistory(await detail(f,a,id),['creacion','envio']);
  });
});
it('revalida texto guardado y configuración inválida sin cambiar el borrador',async()=>{
  await fixture(async f=>{
    const a=await f.login(),id=await create(f,a);
    await f.pool.query("UPDATE solicitudes SET titulo='<b>Texto</b>' WHERE id=$1",[id]);
    await action(f,a,id).expect(400);
    await f.pool.query('UPDATE solicitudes SET titulo=$2 WHERE id=$1',[id,draft.titulo]);
    await f.pool.query("UPDATE usuarios SET rol='solicitante' WHERE id=$1",[seedAccounts[2].id]);
    const before=await detail(f,a,id);
    const r=await action(f,a,id).expect(409);
    expect(r.body.error.code).toBe('ASSIGNMENT_UNAVAILABLE');
    expect(await detail(f,a,id)).toEqual(before);
  });
});
it('cancela antes y después del envío conservando asignación/visibilidad correctas',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2),other=await f.login(3);
    const id=await create(f,a);
    await action(f,a,id,'cancelar').expect(200);
    const early=await detail(f,a,id);checkHistory(early,['creacion','cancelacion']);
    expect(early.solicitud).toMatchObject({estado:'cancelada',responsable_id:null,enviada_en:null});
    expect(early.solicitud.finalizada_en).toBe(early.solicitud.actualizada_en);
    await f.get(r,'solicitudes/'+id).expect(404);
    await action(f,a,id,'cancelar').expect(409);await action(f,a,id).expect(409);
    const sent=await create(f,a);await action(f,a,sent).expect(200);
    const before=await detail(f,a,sent);
    await action(f,a,sent,'cancelar').expect(200);
    const late=await detail(f,r,sent);checkHistory(late,['creacion','envio','cancelacion']);
    expect(late.solicitud.responsable_id).toBe(before.solicitud.responsable_id);
    expect(late.solicitud.enviada_en).toBe(before.solicitud.enviada_en);
    await f.get(other,'solicitudes/'+sent).expect(404);
    expect((await f.get(r,'solicitudes?estado=cancelada')).body.solicitudes.map((s:{id:string})=>s.id)).toEqual([sent]);
  });
});
it('dos solicitantes y dos revisores no actúan fuera de autoría ni descubren borradores',async()=>{
  await fixture(async f=>{
    const a=await f.login(),b=await f.login(1),r=await f.login(2),other=await f.login(3);
    const id=await create(f,a);
    for(const stranger of [b,r,other])for(const verb of ['enviar','cancelar']){
      const denied=await action(f,stranger,id,verb).expect(404);
      expect(denied.body).toEqual((await action(f,stranger,absent,verb).expect(404)).body);
    }
    await action(f,a,id).expect(200);await f.get(r,'solicitudes/'+id).expect(200);
    for(const stranger of [b,r,other]){
      await action(f,stranger,id,'cancelar').expect(404);
      if(stranger!==r)await f.get(stranger,'solicitudes/'+id).expect(404);
    }
    expect((await detail(f,a,id)).solicitud.estado).toBe('pendiente');
  });
});
it('ningún estado terminal permite cancelación, envío, edición ni otro evento',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2);
    for(const state of ['aprobada','rechazada','cancelada']){
      const id=await create(f,a);await action(f,a,id).expect(200);
      await f.pool.query('UPDATE solicitudes SET estado=$2,finalizada_en=enviada_en WHERE id=$1',[id,state]);
      const before=await detail(f,a,id);
      await action(f,a,id,'cancelar').expect(409);await action(f,a,id).expect(409);
      await f.write(a,'solicitudes/'+id,'patch').send({titulo:'No permitido'}).expect(409);
      expect(await detail(f,a,id)).toEqual(before);
      await f.get(r,'solicitudes/'+id).expect(200);
    }
  });
});
it('acciones solo aceptan ausencia de cuerpo o JSON vacío, UUID/query válidos y campos del servidor rechazados',async()=>{
  await fixture(async f=>{
    const a=await f.login(),id=await create(f,a);
    for(const verb of ['enviar','cancelar']){
      const path='solicitudes/'+id+'/'+verb;
      for(const body of [{autor_id:seedAccounts[1].id},{responsable_id:seedAccounts[3].id},{estado:'pendiente'},
        {id},{rol:'revisor'},{enviada_en:new Date().toISOString()},{finalizada_en:new Date().toISOString()},{titulo:'Otro'},[]]){
        await f.write(a,path).send(body).expect(400);
      }
      await f.write(a,path).set('Content-Type','application/json').send('null').expect(400);
      await f.write(a,path).set('Content-Type','text/plain').send('{}').expect(400);
      await f.write(a,path).set('Content-Type','application/json').send('{').expect(400);
      await f.write(a,path).send({dato:'x'.repeat(17000)}).expect(413);
      await f.write(a,path+'?estado=pendiente').send({}).expect(400);
      await f.write(a,'solicitudes/no-uuid/'+verb).send({}).expect(400);
    }
    await f.write(a,'solicitudes/'+id+'/enviar').expect(200);
    await action(f,a,id,'cancelar').expect(200);
  });
});
it('cada acción exige sesión, CSRF/origen y respeta caducidad absoluta',async()=>{
  await fixture(async f=>{
    const a=await f.login(),id=await create(f,a);
    const before=(await f.pool.query("SELECT expire,sess FROM sesiones WHERE sess::jsonb ? 'userId'")).rows[0];
    for(const verb of ['enviar','cancelar']){
      const path='/api/solicitudes/'+id+'/'+verb;
      await request(f.app).post(path).send({}).expect(401);
      for(const token of [undefined,'incorrecto']){
        const r=request(f.app).post(path).set('Cookie',a.cookie).set('Origin',origin);
        if(token)r.set('X-CSRF-Token',token);await r.send({}).expect(403);
      }
      await request(f.app).post(path).set('Cookie',a.cookie).set('Origin','https://ajeno.example').set('X-CSRF-Token',a.token).send({}).expect(403);
    }
    f.clock.value+=60000;
    expect((await action(f,a,id).expect(200)).headers['cache-control']).toBe('no-store');
    await action(f,a,id,'cancelar').expect(200);
    const after=(await f.pool.query("SELECT expire,sess FROM sesiones WHERE sess::jsonb ? 'userId'")).rows[0];
    expect(after.expire).toEqual(before.expire);expect(after.sess.expiresAt).toBe(before.sess.expiresAt);
    f.clock.value+=AUTH_MS;
    for(const verb of ['enviar','cancelar'])await action(f,a,id,verb).expect(401);
  });
});
it('filtros/paginación aplican el mismo ámbito y total para autores y revisores',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2),other=await f.login(3);
    await f.pool.query(
      `INSERT INTO solicitudes(autor_id,titulo,tipo_codigo,descripcion,estado,responsable_id,enviada_en)
       SELECT CASE WHEN n<=23 THEN $1::uuid ELSE $2::uuid END,'Solicitud '||n,'material','Descripción válida','pendiente',
       CASE WHEN n<=25 THEN $3::uuid ELSE $4::uuid END,now() FROM generate_series(1,28) n`,
      seedAccounts.map(u=>u.id));
    await create(f,a);
    const first=(await f.get(a,'solicitudes?estado=pendiente').expect(200)).body;
    const second=(await f.get(a,'solicitudes?estado=pendiente&pagina=2').expect(200)).body;
    expect(first.paginacion).toEqual({pagina:1,tamano:20,total:23,paginas:2});expect(second.solicitudes).toHaveLength(3);
    const expected=(await f.pool.query("SELECT id FROM solicitudes WHERE autor_id=$1 AND estado='pendiente' ORDER BY creada_en DESC,id DESC",[seedAccounts[0].id])).rows.map(s=>s.id);
    expect([...first.solicitudes,...second.solicitudes].map(s=>s.id)).toEqual(expected);
    expect((await f.get(r,'solicitudes?estado=pendiente&tamano=100')).body.paginacion.total).toBe(25);
    expect((await f.get(other,'solicitudes?estado=pendiente')).body.paginacion.total).toBe(3);
    expect((await f.get(r,'solicitudes?estado=borrador')).body.solicitudes).toEqual([]);
    for(const q of ['estado=','estado=inventado','estado=pendiente&estado=borrador','autor_id='+seedAccounts[1].id,'responsable_id='+seedAccounts[3].id]){
      await f.get(a,'solicitudes?'+q).expect(400);
    }
  });
});
it('fallo de evento revierte envío y cancelación con todos sus metadatos',async()=>{
  await fixture(async f=>{
    const a=await f.login();
    for(const mode of ['envio','cancelacion-borrador','cancelacion-pendiente']){
      const id=await create(f,a);
      if(mode==='cancelacion-pendiente')await action(f,a,id).expect(200);
      const before=await detail(f,a,id),verb=mode==='envio'?'enviar':'cancelar';
      const event=mode==='envio'?'envio':'cancelacion';
      // Fallo solo en el evento de esta solicitud; conserva los anteriores del fixture.
      await f.pool.query(`ALTER TABLE eventos_solicitud ADD CONSTRAINT fallo_evento CHECK (solicitud_id<>'${id}'::uuid OR accion<>'${event}')`);
      const failure=await action(f,a,id,verb).expect(503);
      expect(failure.text).not.toMatch(/fallo_evento|constraint|INSERT|password/i);
      expect(await detail(f,a,id)).toEqual(before);
      await f.pool.query('ALTER TABLE eventos_solicitud DROP CONSTRAINT fallo_evento');
    }
  });
});
it('dos envíos solapados: exactamente un envío y evento',async()=>{
  await fixture(async f=>{
    const a=await f.login(),id=await create(f,a);
    const results=await race(f,id,()=>action(f,a,id),()=>action(f,a,id));
    expect(results.map(r=>r.status)).toEqual([200,409]);
    checkHistory(await detail(f,a,id),['creacion','envio']);
  });
});
it('dos cancelaciones solapadas: una confirmación y un evento',async()=>{
  await fixture(async f=>{
    const a=await f.login(),id=await create(f,a);await action(f,a,id).expect(200);
    const results=await race(f,id,()=>action(f,a,id,'cancelar'),()=>action(f,a,id,'cancelar'));
    expect(results.map(r=>r.status)).toEqual([200,409]);
    checkHistory(await detail(f,a,id),['creacion','envio','cancelacion']);
  });
});
it('edición gana el bloqueo: envío valida contenido y tipo recién editados',async()=>{
  await fixture(async f=>{
    const a=await f.login(),id=await create(f,a,{...draft,descripcion:''});
    const results=await race(f,id,
      ()=>f.write(a,'solicitudes/'+id,'patch').send({descripcion:'Texto actualizado suficiente',tipo_codigo:'formacion'}),
      ()=>action(f,a,id));
    expect(results.map(r=>r.status)).toEqual([200,200]);
    const d=await detail(f,a,id);
    expect(d.solicitud).toMatchObject({descripcion:'Texto actualizado suficiente',responsable_id:seedAccounts[3].id});
    checkHistory(d,['creacion','envio']);
  });
});
it('envío gana el bloqueo: edición solapada devuelve 409',async()=>{
  await fixture(async f=>{
    const a=await f.login(),id=await create(f,a);
    const results=await race(f,id,()=>action(f,a,id),
      ()=>f.write(a,'solicitudes/'+id,'patch').send({descripcion:'No debe guardarse'}));
    expect(results.map(r=>r.status)).toEqual([200,409]);
    expect((await detail(f,a,id)).solicitud.descripcion).toBe(draft.descripcion);
  });
});
it('cancelación de borrador gana: envío solapado no ocurre',async()=>{
  await fixture(async f=>{
    const a=await f.login(),id=await create(f,a);
    const results=await race(f,id,()=>action(f,a,id,'cancelar'),()=>action(f,a,id));
    expect(results.map(r=>r.status)).toEqual([200,409]);
    checkHistory(await detail(f,a,id),['creacion','cancelacion']);
  });
});
it('envío gana: cancelación solapada de pendiente confirma historial completo',async()=>{
  await fixture(async f=>{
    const a=await f.login(),id=await create(f,a);
    const results=await race(f,id,()=>action(f,a,id),()=>action(f,a,id,'cancelar'));
    expect(results.map(r=>r.status)).toEqual([200,200]);
    const d=await detail(f,a,id);checkHistory(d,['creacion','envio','cancelacion']);
    expect(Date.parse(d.solicitud.finalizada_en)).toBeGreaterThanOrEqual(Date.parse(d.solicitud.enviada_en));
    expect(d.solicitud.responsable_id).toBe(seedAccounts[2].id);
  });
});
it('detalle e historial son coherentes mientras una transición concurrente espera',async()=>{
  await fixture(async f=>{
    const a=await f.login(),id=await create(f,a),gate=await f.pool.connect();
    try{
      await gate.query('BEGIN');await gate.query('LOCK TABLE eventos_solicitud IN ACCESS EXCLUSIVE MODE');
      const pid=(await gate.query('SELECT pg_backend_pid() pid')).rows[0].pid as number;
      const reading=f.get(a,'solicitudes/'+id).then(r=>r);await waitBlocked(f,pid,1);
      const sending=action(f,a,id).then(r=>r);await waitBlocked(f,pid,2);
      await gate.query('COMMIT');
      const [read,sent]=await Promise.all([reading,sending]);
      expect(read.status).toBe(200);expect(sent.status).toBe(200);
      checkHistory(read.body,read.body.solicitud.estado==='borrador'?['creacion']:['creacion','envio']);
      checkHistory(await detail(f,a,id),['creacion','envio']);
    }finally{await gate.query('ROLLBACK');gate.release();}
  });
});
