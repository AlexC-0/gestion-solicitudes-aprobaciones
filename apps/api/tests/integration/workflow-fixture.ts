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
