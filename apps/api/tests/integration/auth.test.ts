import { randomBytes } from 'node:crypto';
import express from 'express';
import request from 'supertest';
import { expect, it, vi } from 'vitest';
import type pg from 'pg';
import { createApp } from '../../src/app.js';
import { createAuthentication, AUTH_MS, PREAUTH_MS } from '../../src/auth/authentication.js';
import { migrate } from '../../src/persistence/migrate.js';
import { generateCredentials, seed, seedAccounts } from '../../src/persistence/seed.js';
import { withTestSchema } from './isolation.js';

const origin = 'http://127.0.0.1:5173';
type Auth = Awaited<ReturnType<typeof createAuthentication>>;
type Fixture = {
  app: ReturnType<typeof createApp>; auth: Auth; pool: pg.Pool; schema: string;
  config: { secret: string; origin: string; secure: boolean };
  clock: { value: number }; credentials: ReturnType<typeof generateCredentials>;
};
async function fixture(fn: (f: Fixture) => Promise<void>) {
  await withTestSchema(async (pool,schema) => {
    await migrate(pool,schema);
    const credentials=generateCredentials(); await seed(pool,credentials);
    const clock={value:Date.now()};
    const config={secret:randomBytes(32).toString('hex'),origin,secure:false};
    const auth=await createAuthentication({pool,schema,config,now:()=>clock.value});
    try { await fn({app:createApp({authRouter:auth.router}),auth,pool,schema,config,clock,credentials}); }
    finally { auth.close(); }
  });
}
function cookie(response: request.Response): string {
  const values=response.headers['set-cookie'] as unknown as string[] | undefined;
  const value=values?.filter(x=>x.startsWith('chamba.sid=')).at(-1);
  if(!value)throw new Error('Falta cookie de sesión');
  return value.split(';')[0]!;
}
async function csrf(f:Fixture) {
  const r=await request(f.app).get('/api/auth/csrf').expect(200);
  return {cookie:cookie(r),token:r.body.csrfToken as string};
}
async function login(f:Fixture, pre?:Awaited<ReturnType<typeof csrf>>) {
  const previous=pre??await csrf(f);
  const r=await request(f.app).post('/api/auth/login').set('Cookie',previous.cookie)
    .set('Origin',origin).set('X-CSRF-Token',previous.token).send(f.credentials[0]).expect(200);
  return {cookie:cookie(r),body:r.body,previous};
}
function post(f:Fixture,pre:Awaited<ReturnType<typeof csrf>>) {
  return request(f.app).post('/api/auth/login').set('Cookie',pre.cookie).set('Origin',origin).set('X-CSRF-Token',pre.token);
}

it('autentica Argon2 real, normaliza correo y no expone secretos; cookie y no-store', async()=>{
  await fixture(async f=>{
    const pre=await csrf(f);
    const r=await post(f,pre).send({...f.credentials[0],correo:'  '+f.credentials[0]!.correo.toUpperCase()+'  '}).expect(200);
    expect(r.body.user).toEqual({id:seedAccounts[0].id,nombre:seedAccounts[0].nombre,correo:seedAccounts[0].correo,rol:'solicitante'});
    expect(Object.keys(r.body).sort()).toEqual(['expiresAt','user']);
    expect(new Date(r.body.expiresAt).getTime()).toBe(f.clock.value+AUTH_MS);
    const c=(r.headers['set-cookie'] as unknown as string[]).join(';');
    expect(c).toContain('HttpOnly');expect(c).toContain('SameSite=Lax');expect(c).toContain('Path=/');
    expect(c).not.toContain('Domain=');expect(c).not.toContain('Secure');
    expect(r.headers['cache-control']).toBe('no-store');
    const me=await request(f.app).get('/api/auth/me').set('Cookie',cookie(r)).expect(200);
    expect(me.body).toEqual(r.body);
    expect(r.text).not.toContain(f.credentials[0]!.password);
  });
});
it('correo inexistente y contraseña errónea producen el mismo 401',async()=>{
  await fixture(async f=>{
    const pre=await csrf(f);
    const wrong=await post(f,pre).send({...f.credentials[0],password:'incorrecta'}).expect(401);
    const missing=await post(f,pre).send({correo:'ausente@example.com',password:'incorrecta'}).expect(401);
    expect(wrong.body).toEqual(missing.body);expect(missing.headers['cache-control']).toBe('no-store');
  });
});
it('rechaza campos extra, contraseña vacía/larga, JSON inválido y cuerpo excesivo',async()=>{
  await fixture(async f=>{
    const pre=await csrf(f);
    for(const body of [{...f.credentials[0],rol:'revisor'},{...f.credentials[0],id:seedAccounts[1].id},
      {...f.credentials[0],password:''},{...f.credentials[0],password:'x'.repeat(1025)},
      {...f.credentials[0],correo:'x'.repeat(255)+'@example.com'}])await post(f,pre).send(body).expect(400);
    await post(f,pre).set('Content-Type','application/json').send('{').expect(400);
    await post(f,pre).send({correo:'a@example.com',password:'x'.repeat(17000)}).expect(413);
  });
});
it('la contraseña no se recorta',async()=>{
  await fixture(async f=>{ const pre=await csrf(f);await post(f,pre).send({...f.credentials[0],password:' '+f.credentials[0]!.password}).expect(401); });
});
it('CSRF ausente, incorrecto y de otra sesión se rechazan',async()=>{
  await fixture(async f=>{
    const a=await csrf(f),b=await csrf(f);
    for(const token of [undefined,'incorrecto',b.token]){
      const r=request(f.app).post('/api/auth/login').set('Cookie',a.cookie).set('Origin',origin);
      if(token)r.set('X-CSRF-Token',token);
      await r.send(f.credentials[0]).expect(403);
    }
  });
});
it('valida Origin y Referer sin confiar en Host',async()=>{
  await fixture(async f=>{
    const pre=await csrf(f);
    for(const headers of [{Origin:'https://evil.example'}, {Origin:'null',Referer:origin+'/acceso'}, {Host:'127.0.0.1:5173'}, {Referer:'invalido'}]){
      await request(f.app).post('/api/auth/login').set('Cookie',pre.cookie).set('X-CSRF-Token',pre.token).set(headers).send(f.credentials[0]).expect(403);
    }
    await request(f.app).post('/api/auth/login').set('Cookie',pre.cookie).set('X-CSRF-Token',pre.token).set('Referer',origin+'/acceso').send(f.credentials[0]).expect(200);
  });
});
it('regenera SID, rechaza el token anterior y no permite login sobre sesión autenticada',async()=>{
  await fixture(async f=>{
    const result=await login(f);
    expect(result.cookie).not.toBe(result.previous.cookie);
    await request(f.app).get('/api/auth/me').set('Cookie',result.previous.cookie).expect(401);
    await request(f.app).post('/api/auth/logout').set('Cookie',result.cookie).set('Origin',origin).set('X-CSRF-Token',result.previous.token).expect(403);
    const r=await request(f.app).get('/api/auth/csrf').set('Cookie',result.cookie).expect(200);
    expect(r.body.csrfToken).not.toBe(result.previous.token);
    await post(f,{cookie:result.cookie,token:r.body.csrfToken}).send(f.credentials[1]).expect(409);
  });
});
it('me sin cookie, con firma manipulada y sesión caducada devuelve 401',async()=>{
  await fixture(async f=>{
    await request(f.app).get('/api/auth/me').expect(401);
    const result=await login(f);
    await request(f.app).get('/api/auth/me').set('Cookie',result.cookie+'alterada').expect(401);
    f.clock.value+=AUTH_MS;
    await request(f.app).get('/api/auth/me').set('Cookie',result.cookie).expect(401);
  });
});
it('actividad y csrf no amplían ocho horas ni vencimiento persistido',async()=>{
  await fixture(async f=>{
    const result=await login(f);
    const before=(await f.pool.query('SELECT sid,expire,sess FROM sesiones')).rows;
    expect(before).toHaveLength(1);
    f.clock.value+=AUTH_MS-1000;
    const me=await request(f.app).get('/api/auth/me').set('Cookie',result.cookie).expect(200);
    expect(me.body.expiresAt).toBe(result.body.expiresAt);
    await request(f.app).get('/api/auth/csrf').set('Cookie',result.cookie).expect(200);
    expect((await f.pool.query('SELECT sid,expire,sess FROM sesiones')).rows).toEqual(before);
    f.clock.value+=1000;await request(f.app).get('/api/auth/me').set('Cookie',result.cookie).expect(401);
  });
});
it('sesión previa caduca a los quince minutos sin renovación por csrf',async()=>{
  await fixture(async f=>{
    const pre=await csrf(f);const before=(await f.pool.query('SELECT expire,sess FROM sesiones')).rows;
    f.clock.value+=PREAUTH_MS-1;
    const again=await request(f.app).get('/api/auth/csrf').set('Cookie',pre.cookie).expect(200);
    expect(again.body.csrfToken).toBe(pre.token);
    expect((await f.pool.query('SELECT expire,sess FROM sesiones')).rows).toEqual(before);
    f.clock.value+=1;await post(f,pre).send(f.credentials[0]).expect(403);
  });
});
it('logout destruye PostgreSQL, limpia cookie y el SID anterior no autentica',async()=>{
  await fixture(async f=>{
    const result=await login(f);
    const token=await request(f.app).get('/api/auth/csrf').set('Cookie',result.cookie);
    const out=await request(f.app).post('/api/auth/logout').set('Cookie',result.cookie).set('Origin',origin).set('X-CSRF-Token',token.body.csrfToken).expect(204);
    expect((out.headers['set-cookie'] as unknown as string[]).join()).toContain('Expires=Thu, 01 Jan 1970');
    expect((await f.pool.query('SELECT count(*)::int AS n FROM sesiones')).rows[0].n).toBe(0);
    await request(f.app).get('/api/auth/me').set('Cookie',result.cookie).expect(401);
    await request(f.app).post('/api/auth/logout').expect(401);
  });
});
it('otra aplicación con store PostgreSQL y secreto iguales recupera la sesión',async()=>{
  await fixture(async f=>{
    const result=await login(f);f.auth.close();
    const second=await createAuthentication({pool:f.pool,schema:f.schema,config:f.config,now:()=>f.clock.value});
    try{await request(createApp({authRouter:second.router})).get('/api/auth/me').set('Cookie',result.cookie).expect(200);}
    finally{second.close();}
  });
});
it('usuario eliminado invalida sesión; rol se consulta en servidor',async()=>{
  await fixture(async f=>{
    const result=await login(f);
    await f.pool.query("UPDATE usuarios SET rol='revisor' WHERE id=$1",[seedAccounts[0].id]);
    const me=await request(f.app).get('/api/auth/me').set('Cookie',result.cookie).expect(200);
    expect(me.body.user.rol).toBe('revisor');
    await f.pool.query('DELETE FROM usuarios WHERE id=$1',[seedAccounts[0].id]);
    await request(f.app).get('/api/auth/me').set('Cookie',result.cookie).expect(401);
  });
});
it('fallo real del store da 503 sin fallback; health sigue independiente',async()=>{
  await fixture(async f=>{
    const result=await login(f);
    await f.pool.query('ALTER TABLE sesiones RENAME TO sesiones_no_disponibles');
    await request(f.app).get('/api/auth/me').set('Cookie',result.cookie).expect(503);
    await request(f.app).get('/api/auth/csrf').expect(503);
    await request(f.app).get('/api/health').expect(200,{status:'ok'});
  });
});
it('fallo al guardar login nunca responde éxito ni emite cookie autenticada',async()=>{
  await fixture(async f=>{
    const pre=await csrf(f);
    const spy=vi.spyOn(f.auth.store,'set').mockImplementation((_sid,_data,callback)=>callback?.(new Error('detalle privado')));
    try {
      const r=await post(f,pre).send(f.credentials[0]).expect(503);
      expect(r.text).not.toContain('detalle privado');expect(r.headers['set-cookie']).toBeUndefined();
    }finally{spy.mockRestore();}
    await request(f.app).get('/api/auth/me').set('Cookie',pre.cookie).expect(401);
  });
});
it('fallo de consulta de usuario o invalidación no se disfraza de credenciales incorrectas',async()=>{
  await fixture(async f=>{
    const result=await login(f);
    const token=await request(f.app).get('/api/auth/csrf').set('Cookie',result.cookie);
    const spy=vi.spyOn(f.auth.store,'destroy').mockImplementation((_sid,callback)=>callback?.(new Error('fallo privado')));
    try{await request(f.app).post('/api/auth/logout').set('Cookie',result.cookie).set('Origin',origin).set('X-CSRF-Token',token.body.csrfToken).expect(503);}
    finally{spy.mockRestore();}
    await request(f.app).get('/api/auth/me').set('Cookie',result.cookie).expect(200);
    await f.pool.query('ALTER TABLE usuarios RENAME TO usuarios_no_disponibles');
    await request(f.app).get('/api/auth/me').set('Cookie',result.cookie).expect(503);
  });
});
it('límite de fallos no se reinicia con otra sesión y recupera tras ventana',async()=>{
  await fixture(async f=>{
    let pre=await csrf(f);
    for(let i=0;i<10;i++)await post(f,pre).send({...f.credentials[0],password:'incorrecta'}).expect(401);
    pre=await csrf(f);
    const r=await post(f,pre).send(f.credentials[0]).expect(429);
    expect(Number(r.headers['retry-after'])).toBeGreaterThan(0);
    f.clock.value+=PREAUTH_MS+1;
    pre=await csrf(f);await post(f,pre).send(f.credentials[0]).expect(200);
  });
});
it('límite IP cuenta también peticiones sin CSRF ni sesión',async()=>{
  await fixture(async f=>{
    for(let i=0;i<60;i++)await request(f.app).post('/api/auth/login').send({}).expect(403);
    const r=await request(f.app).post('/api/auth/login').send({}).expect(429);
    expect(r.headers['retry-after']).toBeDefined();expect(r.headers['cache-control']).toBe('no-store');
    f.clock.value+=PREAUTH_MS+1;
    await request(f.app).post('/api/auth/login').send({}).expect(403);
  });
});
it('emite Secure cuando el transporte de Express es HTTPS',async()=>{
  await fixture(async f=>{
    const secure=await createAuthentication({pool:f.pool,schema:f.schema,config:{...f.config,secure:true,origin:'https://example.com'}});
    const tlsApp=express();
    // Emula únicamente la propiedad del transporte en esta prueba; producción no confía en X-Forwarded-Proto.
    tlsApp.use((req,_res,next)=>{Object.defineProperty(req,'secure',{value:true});next();});
    tlsApp.use(createApp({authRouter:secure.router}));
    try{const r=await request(tlsApp).get('/api/auth/csrf').expect(200);expect((r.headers['set-cookie'] as unknown as string[]).join()).toContain('Secure');}
    finally{secure.close();}
  });
});