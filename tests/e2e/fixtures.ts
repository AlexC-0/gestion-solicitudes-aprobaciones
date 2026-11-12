import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test as base, expect, chromium, type Page } from '@playwright/test';
import { withTestSchema } from '../../apps/api/tests/integration/isolation.js';

type Credentials = { correo: string; password: string }[];
type App = { origin: string; credentials: Credentials };
type Actors = { open: (index: number, mobile?: boolean) => Promise<Page>; login: (page: Page, index: number) => Promise<void> };

async function compiled() {
  try { await access(new URL('../../apps/web/dist/index.html', import.meta.url)); }
  catch { throw new Error('E2E: falta el frontend compilado; ejecuta npm run build.'); }
  try {
    const app: typeof import('../../apps/api/src/app.js') = await import(new URL('../../apps/api/dist/app.js', import.meta.url).href);
    const auth: typeof import('../../apps/api/src/auth/authentication.js') = await import(new URL('../../apps/api/dist/auth/authentication.js', import.meta.url).href);
    const requests: typeof import('../../apps/api/src/solicitudes.js') = await import(new URL('../../apps/api/dist/solicitudes.js', import.meta.url).href);
    const migrations: typeof import('../../apps/api/src/persistence/migrate.js') = await import(new URL('../../apps/api/dist/persistence/migrate.js', import.meta.url).href);
    const seed: typeof import('../../apps/api/src/persistence/seed.js') = await import(new URL('../../apps/api/dist/persistence/seed.js', import.meta.url).href);
    return { ...app, ...auth, ...requests, ...migrations, ...seed };
  } catch { throw new Error('E2E: falta la API compilada o sus dependencias; ejecuta npm ci y npm run build.'); }
}

export const test = base.extend<{ app: App; actors: Actors }>({
  app: async ({}, use) => {
    const modules = await compiled();
    let entered = false;
    try {
      await withTestSchema(async (pool, schema) => {
        entered = true;
        const server = createServer();
        let auth: Awaited<ReturnType<typeof modules.createAuthentication>> | undefined;
        try {
          await modules.migrate(pool, schema);
          expect(await modules.migrate(pool, schema)).toHaveLength(0);
          const credentials = modules.generateCredentials();
          await modules.seed(pool, credentials);
          // Puerto asignado exclusivamente por el SO, nunca reutiliza otro servidor.
          await new Promise<void>((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
          });
          const address = server.address();
          if (!address || typeof address === 'string') throw new Error('E2E: no se obtuvo puerto loopback.');
          const origin = 'http://127.0.0.1:' + address.port;
          auth = await modules.createAuthentication({
            pool, schema, config: { origin, secure: false, secret: randomBytes(32).toString('hex') },
          });
          server.on('request', modules.createApp({
            webDistPath: fileURLToPath(new URL('../../apps/web/dist/', import.meta.url)),
            authRouter: auth.router, solicitudesRouter: modules.createSolicitudes(pool, auth),
          }));
          await use({ origin, credentials });
        } finally {
          try {
            if (server.listening) await new Promise<void>((resolve, reject) => {
              server.close(error => error ? reject(error) : resolve());
              server.closeAllConnections();
            });
          } finally { auth?.close(); }
          // withTestSchema cierra pool y comprueba current_database antes del DROP propio.
        }
      });
    } catch (error) {
      if (!entered) throw new Error('E2E: exige TEST_DATABASE_URL y PostgreSQL disponible en gestion_solicitudes_aprobaciones_test; no se preparó ningún esquema.');
      throw error;
    }
  },
  actors: async ({ app }, use) => {
    const browser = await chromium.launch({ headless: true });
    async function login(page: Page, index: number) {
      const account = app.credentials[index];
      if (!account) throw new Error('E2E: cuenta ficticia desconocida.');
      try {
        await page.goto(app.origin + '/acceso');
        await page.getByLabel('Correo electrónico').fill(account.correo);
        await page.getByLabel('Contraseña', { exact: true }).fill(account.password);
        await page.getByRole('button', { name: 'Acceder', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Tu cuenta' })).toBeVisible();
        await expect(page.getByText(account.correo, { exact: true })).toBeVisible();
      } catch { throw new Error('E2E: no se pudo acceder por la interfaz con la cuenta ficticia; credenciales omitidas.'); }
    }
    try {
      await use({
        login,
        open: async (index, mobile = false) => {
          const context = await browser.newContext({
            baseURL: app.origin,
            viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 },
          });
          const page = await context.newPage();
          await login(page, index);
          return page;
        },
      });
    } finally {
      // Navegador y contextos cierran antes de HTTP/auth/pool y del esquema.
      await browser.close();
    }
  },
});
export { expect };
