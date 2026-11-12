import { expect, it } from 'vitest';
import { readAuthConfig } from '../src/auth/config.js';
const base = { SESSION_SECRET: 'a'.repeat(64), SESSION_ALLOW_HTTP: 'true',
  AUTH_ORIGIN_DEV: 'http://127.0.0.1:5173', AUTH_ORIGIN_COMPILED: 'http://127.0.0.1:3000' };
it('selecciona origen explícito de desarrollo o compilado sin Host', () => {
  expect(readAuthConfig(base,false)).toMatchObject({ origin:base.AUTH_ORIGIN_DEV,secure:false });
  expect(readAuthConfig(base,true).origin).toBe(base.AUTH_ORIGIN_COMPILED);
});
it('exige secreto y no acepta HTTP remoto o en producción', () => {
  for (const changes of [{ SESSION_SECRET:'' },{ SESSION_SECRET:'corto' },
    { AUTH_ORIGIN_DEV:'http://example.com' },{ NODE_ENV:'production' },{ SESSION_ALLOW_HTTP:'false' },
    { AUTH_ORIGIN_DEV:'http://127.0.0.1:5173/ruta' }]) {
    expect(()=>readAuthConfig({...base,...changes},false)).toThrow();
  }
});
it('HTTPS exige cookie Secure sin confiar en proxies', () => {
  expect(readAuthConfig({...base,AUTH_ORIGIN_DEV:'https://example.com',NODE_ENV:'production'},false).secure).toBe(true);
});