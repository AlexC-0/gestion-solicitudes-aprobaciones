import { randomBytes } from 'node:crypto';
import request from 'supertest';

import { createApp } from '../../src/app.js';
import { createAuthentication } from '../../src/auth/authentication.js';
import { createSolicitudes } from '../../src/solicitudes.js';
import { migrate } from '../../src/persistence/migrate.js';
import { generateCredentials, seed } from '../../src/persistence/seed.js';
import { withTestSchema } from './isolation.js';

export const origin='http://127.0.0.1:5173';


function cookie(r:request.Response){
  const c=(r.headers['set-cookie'] as unknown as string[]|undefined)?.find(v=>v.startsWith('chamba.sid='));
  if(!c)throw new Error('Falta sesión de prueba');return c.split(';')[0]!;
}
export async function fixture(fn:(f:{
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

export type Fixture = Parameters<Parameters<typeof fixture>[0]>[0];

export async function waitBlocked(f:Fixture,pid:number,count:number){
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
export async function race(f:Fixture,id:string,first:()=>request.Test,second:()=>request.Test){
  const gate=await f.pool.connect();
  try{
    await gate.query('BEGIN');await gate.query('SELECT id FROM solicitudes WHERE id=$1 FOR UPDATE',[id]);
    const pid=(await gate.query('SELECT pg_backend_pid() pid')).rows[0].pid as number;
    const one=first().then(r=>r);await waitBlocked(f,pid,1);
    const two=second().then(r=>r);await waitBlocked(f,pid,2);
    await gate.query('COMMIT');return await Promise.all([one,two]);
  }finally{await gate.query('ROLLBACK');gate.release();}
}
