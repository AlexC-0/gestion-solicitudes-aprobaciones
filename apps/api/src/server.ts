import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { readPort } from './config.js';
import { readAuthConfig } from './auth/config.js';
import { createAuthentication } from './auth/authentication.js';
import { createPool, requireUrl } from './persistence/database.js';

// Solo este proceso Backend carga el archivo privado. Vite no recibe sus variables.
const envPath = fileURLToPath(new URL('../../../.env', import.meta.url));
if (existsSync(envPath)) loadEnvFile(envPath);
const port = readPort(process.env.API_PORT);
const serveWeb = process.argv.includes('--serve-web');
const webDistPath = fileURLToPath(new URL('../../web/dist/', import.meta.url));
if (serveWeb && !existsSync(new URL('../../web/dist/index.html', import.meta.url))) {
  throw new Error('Falta el frontend compilado. Ejecuta npm run build desde la raíz.');
}
const config = readAuthConfig(process.env, serveWeb);
const pool = createPool(requireUrl('DATABASE_URL'));
const auth = await createAuthentication({ pool, config });
const app = createApp({ ...(serveWeb ? { webDistPath } : {}), authRouter: auth.router });
const server = createServer(app);
server.listen(port, '127.0.0.1', () => {
  console.log('Servidor disponible en http://127.0.0.1:' + port);
});
let closing = false;
async function release() { auth.close(); await pool.end(); }
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Puerto ocupado. Cambia API_PORT o detén tu propio proceso anterior.'
    : 'No se pudo iniciar el servidor HTTP.');
  process.exitCode = 1;
  void release();
});
function shutdown() {
  if (closing) return;
  closing = true;
  const deadline = setTimeout(() => {
    console.error('Se agotó el plazo de cierre del servidor.');
    server.closeAllConnections(); process.exitCode = 1;
  }, 5000);
  deadline.unref();
  server.close(error => {
    if (error) process.exitCode = 1;
    void release().finally(() => {
      clearTimeout(deadline);
      console.log('Servidor HTTP, sesiones y pool cerrados.');
    });
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);