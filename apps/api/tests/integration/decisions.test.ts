import request from 'supertest';
import { expect, it } from 'vitest';
import { AUTH_MS } from '../../src/auth/authentication.js';
import { seedAccounts } from '../../src/persistence/seed.js';
import { fixture, race, origin, type Fixture } from './workflow-fixture.js';

type Session=Awaited<ReturnType<Fixture['login']>>;
const absent='11111111-1111-4111-8111-111111111111';
const validReason='Motivo suficientemente detallado';
const call=(f:Fixture,s:Session,id:string,action:string,body:object)=>f.write(s,'solicitudes/'+id+'/'+action).send(body);
const get=async(f:Fixture,s:Session,id:string)=>(await f.get(s,'solicitudes/'+id).expect(200)).body;
async function pending(f:Fixture,a:Session){
  const id=(await f.write(a).send({titulo:'Solicitud a resolver',tipo_codigo:'material',descripcion:'Descripción suficiente para el envío.'}).expect(201)).body.solicitud.id as string;
  await call(f,a,id,'enviar',{}).expect(200);return id;
}
it('aprueba con comentario omitido, vacío o normalizado y conserva metadatos de envío',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2);
    for(const body of [{},{comentario:' \t\n '},{comentario:' \u00a0Conforme.\nSegunda línea.\t'}]){
      const id=await pending(f,a),before=(await get(f,a,id)).solicitud;
      const response=await call(f,r,id,'aprobar',body).expect(200);
      expect(response.headers['cache-control']).toBe('no-store');
      const d=await get(f,a,id);
      expect(d.solicitud.estado).toBe('aprobada');
      for(const key of ['autor_id','titulo','descripcion','tipo_codigo','responsable_id','enviada_en','creada_en'])expect(d.solicitud[key]).toBe(before[key]);
      const event=d.historial.at(-1);
      expect(event).toMatchObject({accion:'aprobacion',actor_id:seedAccounts[2].id,estado_anterior:'pendiente',estado_posterior:'aprobada',comentario:body.comentario?.trim()||null});
      expect(event.creada_en).toBe(d.solicitud.finalizada_en);
      expect(d.solicitud.finalizada_en).toBe(d.solicitud.actualizada_en);
      expect(d.historial).toHaveLength(3);
      expect(await get(f,r,id)).toEqual(d);
      expect((await f.get(a,'solicitudes?estado=aprobada')).body.solicitudes.some((s:{id:string})=>s.id===id)).toBe(true);
    }
  });
});
it('rechaza con motivo normalizado, visible para autor y responsable solo en el evento',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2),id=await pending(f,a);
    await call(f,r,id,'rechazar',{motivo:'  Necesita más detalle.\nSegunda línea.  '}).expect(200);
    const d=await get(f,a,id);
    expect(d.solicitud.estado).toBe('rechazada');
    expect(d.solicitud).not.toHaveProperty('motivo');expect(d.solicitud).not.toHaveProperty('comentario');
    expect(d.historial.at(-1)).toMatchObject({accion:'rechazo',comentario:'Necesita más detalle.\nSegunda línea.',actor_id:seedAccounts[2].id});
    expect(d.historial.at(-1).creada_en).toBe(d.solicitud.finalizada_en);
    expect(await get(f,r,id)).toEqual(d);
    expect((await f.get(r,'solicitudes?estado=rechazada')).body.solicitudes.map((s:{id:string})=>s.id)).toEqual([id]);
  });
});
it('límites Unicode por puntos de código, trim y texto plano sin NFC',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2);
    for(const action of ['aprobar','rechazar']){
      const id=await pending(f,a),key=action==='aprobar'?'comentario':'motivo';
      for(const text of ['😀'.repeat(1001),'\uD800 texto largo','Texto\0 suficientemente largo','<b>Texto largo</b>']){
        await call(f,r,id,action,{[key]:text}).expect(400);
      }
      await call(f,r,id,action,{[key]:'\u00a0'+('😀'.repeat(1000))+'\t'}).expect(200);
      const saved=(await f.pool.query('SELECT char_length(comentario) n FROM eventos_solicitud WHERE solicitud_id=$1 ORDER BY id DESC LIMIT 1',[id])).rows[0];
      expect(saved.n).toBe(1000);
    }
    const id=await pending(f,a);
    await call(f,r,id,'rechazar',{motivo:'😀'.repeat(9)}).expect(400);
    await call(f,r,id,'rechazar',{motivo:' e\u0301'.trim().repeat(5)}).expect(200);
    expect((await get(f,r,id)).historial.at(-1).comentario).toBe('e\u0301'.repeat(5));
  });
});
it('motivo ausente/vacío/blanco/corto y tipos incorrectos no modifican la pendiente',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2),id=await pending(f,a),before=await get(f,r,id);
    for(const body of [{},{motivo:''},{motivo:'  \n\t\u00a0 '},{motivo:'123456789'},{motivo:10},{motivo:null},{motivo:[]}]){
      await call(f,r,id,'rechazar',body).expect(400);
    }
    for(const body of [{comentario:10},{comentario:null},{comentario:[]}]){
      await call(f,r,id,'aprobar',body).expect(400);
    }
    expect(await get(f,r,id)).toEqual(before);
  });
});
it('JSON estricto, propiedades extra, parámetros, UUID y tamaño validados en ambas decisiones',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2),id=await pending(f,a);
    for(const action of ['aprobar','rechazar']){
      const path='solicitudes/'+id+'/'+action,body=action==='aprobar'?{}:{motivo:validReason};
      for(const key of ['id','autor_id','responsable_id','rol','estado','actor_id','creada_en','enviada_en','finalizada_en','actualizada_en','extra']){
        await call(f,r,id,action,{...body,[key]:'manipulado'}).expect(400);
      }
      await f.write(r,path).expect(400);
      for(const value of ['null','[]','{'])await f.write(r,path).set('Content-Type','application/json').send(value).expect(400);
      await f.write(r,path).set('Content-Type','text/plain').send('{}').expect(400);
      await f.write(r,path+'?estado=pendiente').send(body).expect(400);
      await f.write(r,'solicitudes/no-uuid/'+action).send(body).expect(400);
      await call(f,r,id,action,{comentario:'x'.repeat(17000)}).expect(413);
    }
  });
});
it('dos solicitantes y dos revisores: resolución solo asignada, borradores y canceladas sin envío ocultos',async()=>{
  await fixture(async f=>{
    const a=await f.login(),b=await f.login(1),r=await f.login(2),other=await f.login(3),id=await pending(f,a);
    for(const stranger of [a,b,other])for(const action of ['aprobar','rechazar']){
      const body=action==='aprobar'?{}:{motivo:validReason};
      const denied=await call(f,stranger,id,action,body).expect(404);
      expect(denied.body).toEqual((await call(f,stranger,absent,action,body).expect(404)).body);
    }
    const draft=(await f.write(a).send({titulo:'Borrador privado',tipo_codigo:'material'})).body.solicitud.id;
    for(const state of ['borrador','cancelada']){
      if(state==='cancelada')await call(f,a,draft,'cancelar',{}).expect(200);
      for(const reviewer of [r,other]){
        await f.get(reviewer,'solicitudes/'+draft).expect(404);
        for(const action of ['aprobar','rechazar'])await call(f,reviewer,draft,action,action==='aprobar'?{}:{motivo:validReason}).expect(404);
      }
    }
    await call(f,r,id,'aprobar',{comentario:'Solo participantes'}).expect(200);
    await get(f,a,id);await get(f,r,id);
    for(const stranger of [b,other]){
      await f.get(stranger,'solicitudes/'+id).expect(404);
      expect((await f.get(stranger,'solicitudes?estado=aprobada')).body.solicitudes).toEqual([]);
    }
  });
});
it('terminales y repeticiones no cambian decisión, comentario, fechas ni eventos',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2);
    for(const winner of ['aprobar','rechazar','cancelar']){
      const id=await pending(f,a);
      await call(f,winner==='cancelar'?a:r,id,winner,winner==='rechazar'?{motivo:validReason}:winner==='aprobar'?{comentario:'Decisión original'}:{}).expect(200);
      const before=await get(f,r,id);
      for(const action of ['aprobar','rechazar'])await call(f,r,id,action,action==='aprobar'?{comentario:'No guardar'}:{motivo:'No sustituir el motivo original'}).expect(409);
      await call(f,a,id,'cancelar',{}).expect(409);
      await f.write(a,'solicitudes/'+id,'patch').send({titulo:'No editable'}).expect(409);
      expect(await get(f,r,id)).toEqual(before);
    }
  });
});
it('cada decisión exige sesión, CSRF/origen y conserva la caducidad absoluta',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2);
    const before=(await f.pool.query("SELECT expire,sess FROM sesiones WHERE sess->>'userId'=$1",[seedAccounts[2].id])).rows[0];
    for(const action of ['aprobar','rechazar']){
      const id=await pending(f,a),body=action==='aprobar'?{}:{motivo:validReason},path='/api/solicitudes/'+id+'/'+action;
      await request(f.app).post(path).send(body).expect(401);
      for(const token of [undefined,'incorrecto']){
        const req=request(f.app).post(path).set('Cookie',r.cookie).set('Origin',origin);
        if(token)req.set('X-CSRF-Token',token);await req.send(body).expect(403);
      }
      await request(f.app).post(path).set('Cookie',r.cookie).set('Origin','https://ajeno.example').set('X-CSRF-Token',r.token).send(body).expect(403);
      f.clock.value+=60000;
      expect((await call(f,r,id,action,body).expect(200)).headers['cache-control']).toBe('no-store');
    }
    const after=(await f.pool.query("SELECT expire,sess FROM sesiones WHERE sess->>'userId'=$1",[seedAccounts[2].id])).rows[0];
    expect(after.expire).toEqual(before.expire);expect(after.sess.expiresAt).toBe(before.sess.expiresAt);
    const id=await pending(f,a);f.clock.value+=AUTH_MS;
    for(const action of ['aprobar','rechazar'])await call(f,r,id,action,action==='aprobar'?{}:{motivo:validReason}).expect(401);
  });
});
it('fallar el evento revierte estado, fechas y comentario de ambas decisiones',async()=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2);
    for(const action of ['aprobar','rechazar']){
      const id=await pending(f,a),before=await get(f,r,id);
      const event=action==='aprobar'?'aprobacion':'rechazo';
      await f.pool.query(`ALTER TABLE eventos_solicitud ADD CONSTRAINT fallo_decision CHECK (solicitud_id<>'${id}'::uuid OR accion<>'${event}')`);
      const response=await call(f,r,id,action,action==='aprobar'?{comentario:'No persistir'}:{motivo:validReason}).expect(503);
      expect(response.text).not.toMatch(/INSERT|fallo_decision|constraint|password/i);
      expect(await get(f,r,id)).toEqual(before);
      await f.pool.query('ALTER TABLE eventos_solicitud DROP CONSTRAINT fallo_decision');
    }
  });
});
it.each([
  ['aprobar','aprobar'],['rechazar','rechazar'],
  ['aprobar','rechazar'],['rechazar','aprobar'],
  ['aprobar','cancelar'],['cancelar','aprobar'],
  ['rechazar','cancelar'],['cancelar','rechazar'],
])('concurrencia real: %s gana frente a %s, un único evento terminal',async(first,second)=>{
  await fixture(async f=>{
    const a=await f.login(),r=await f.login(2),id=await pending(f,a);
    const payload=(action:string,marker:string)=>action==='aprobar'?{comentario:'Comentario '+marker}:action==='rechazar'?{motivo:'Motivo de rechazo '+marker}:{};
    const response=await race(f,id,
      ()=>call(f,first==='cancelar'?a:r,id,first,payload(first,'ganador')),
      ()=>call(f,second==='cancelar'?a:r,id,second,payload(second,'perdedor')));
    expect(response.map(res=>res.status)).toEqual([200,409]);
    const d=await get(f,r,id),terminal=d.historial.filter((e:{accion:string})=>['aprobacion','rechazo','cancelacion'].includes(e.accion));
    expect(terminal).toHaveLength(1);expect(d.historial).toHaveLength(3);
    expect(terminal[0].estado_posterior).toBe(d.solicitud.estado);
    expect(terminal[0].comentario).toBe(first==='cancelar'?null:first==='aprobar'?'Comentario ganador':'Motivo de rechazo ganador');
    expect(terminal[0].actor_id).toBe(first==='cancelar'?seedAccounts[0].id:seedAccounts[2].id);
    expect(terminal[0].creada_en).toBe(d.solicitud.finalizada_en);
    // Compara dentro de PostgreSQL: JSON/Date truncaría la precisión a milisegundos.
    const precision=await f.pool.query(
      "SELECT e.creada_en=s.finalizada_en AND s.finalizada_en=s.actualizada_en AND s.finalizada_en>=s.enviada_en AS exacta FROM solicitudes s JOIN eventos_solicitud e ON e.solicitud_id=s.id WHERE s.id=$1 AND e.accion IN ('aprobacion','rechazo','cancelacion')",[id]);
    expect(precision.rows).toEqual([{exacta:true}]);
    expect(await get(f,a,id)).toEqual(d);
  });
});
