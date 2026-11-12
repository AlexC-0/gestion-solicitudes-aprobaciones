import { extname, resolve } from 'node:path';
import express from 'express';
import { errorHandler, notFound } from './errors.js';

export function createApp(options: { webDistPath?: string } = {}) {
  const app = express();
  app.disable('x-powered-by');

  app.get('/api/health', (_request, response) => {
    response.set('Cache-Control', 'no-store').json({ status: 'ok' });
  });
  // Resolver la API antes de cualquier archivo estático o fallback de navegación.
  app.use('/api', notFound);

  if (options.webDistPath !== undefined) {
    const webDistPath = resolve(options.webDistPath);
    app.use('/assets', express.static(resolve(webDistPath, 'assets')), notFound);
    app.use(express.static(webDistPath, { index: false, redirect: false }));
    app.get('/{*path}', (request, response, next) => {
      const isFile = extname(request.path) !== '';
      const isHidden = request.path.split('/').some((part) => part.startsWith('.'));
      if (isFile || isHidden || !request.accepts('html')) {
        next();
        return;
      }
      response.set('Cache-Control', 'no-cache');
      response.sendFile(resolve(webDistPath, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
