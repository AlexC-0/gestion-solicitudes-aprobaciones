import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { readPort } from './config.js';

const port = readPort(process.env.API_PORT);
const serveWeb = process.argv.includes('--serve-web');
const webDistPath = fileURLToPath(new URL('../../web/dist/', import.meta.url));
if (serveWeb && !existsSync(new URL('../../web/dist/index.html', import.meta.url))) {
  throw new Error('Falta el frontend compilado. Ejecuta npm run build desde la raíz.');
}

const app = createApp(serveWeb ? { webDistPath } : {});
const server = createServer(app);
server.listen(port, '127.0.0.1', () => {
  console.log(`Servidor disponible en http://127.0.0.1:${port}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Puerto ocupado. Cambia API_PORT o detén tu propio proceso anterior.'
    : 'No se pudo iniciar el servidor HTTP.');
  process.exitCode = 1;
});

let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  const deadline = setTimeout(() => {
    console.error('Se agotó el plazo de cierre del servidor.');
    server.closeAllConnections();
    process.exitCode = 1;
  }, 5000);
  deadline.unref();
  server.close((error) => {
    clearTimeout(deadline);
    if (error) process.exitCode = 1;
    console.log('Servidor HTTP cerrado.');
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
