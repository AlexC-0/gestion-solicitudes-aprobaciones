import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/errors.js';

it('responde al contrato de health sin comprobar servicios externos', async () => {
  const response = await request(createApp()).get('/api/health');
  expect(response.status).toBe(200);
  expect(response.type).toBe('application/json');
  expect(response.body).toEqual({ status: 'ok' });
  expect(response.headers['cache-control']).toBe('no-store');
});

it('devuelve 404 JSON para una API desconocida', async () => {
  const response = await request(createApp()).get('/api/no-existe');
  expect(response.status).toBe(404);
  expect(response.type).toBe('application/json');
  expect(response.body.error.code).toBe('NOT_FOUND');
});

it('oculta los detalles internos de un error inesperado', async () => {
  const app = express();
  app.get('/fallo', () => { throw new Error('detalle interno reservado'); });
  app.use(errorHandler);
  const response = await request(app).get('/fallo');
  expect(response.status).toBe(500);
  expect(response.body).toEqual({ error: {
    code: 'INTERNAL_ERROR', message: 'No se pudo completar la petición.',
  } });
  expect(response.text).not.toContain('detalle interno reservado');
});

describe('servicio del frontend compilado', () => {
  let webDistPath: string;
  beforeAll(async () => {
    webDistPath = await mkdtemp(join(tmpdir(), 'solicitudes-web-'));
    await mkdir(join(webDistPath, 'assets'));
    await writeFile(join(webDistPath, 'index.html'), '<!doctype html><title>Aplicación</title>');
    await writeFile(join(webDistPath, 'assets', 'app.js'), 'console.log("frontend");');
  });
  afterAll(async () => {
    if (webDistPath && dirname(resolve(webDistPath)) === resolve(tmpdir()) &&
        basename(webDistPath).startsWith('solicitudes-web-')) {
      await rm(webDistPath, { recursive: true, force: true });
    }
  });

  it('sirve el HTML para inicio y navegación del cliente', async () => {
    for (const path of ['/', '/ruta-del-cliente']) {
      const response = await request(createApp({ webDistPath })).get(path).accept('html');
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('<title>Aplicación</title>');
    }
  });

  it('sirve un asset existente con su contenido y tipo', async () => {
    const response = await request(createApp({ webDistPath })).get('/assets/app.js');
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/javascript/);
    expect(response.text).toContain('console.log');
  });

  it('no devuelve index.html para APIs, assets o archivos inexistentes', async () => {
    for (const path of ['/api', '/api/no-existe', '/assets/perdido', '/assets/falta.js', '/falta.css', '/.env']) {
      const response = await request(createApp({ webDistPath })).get(path).accept('html');
      expect(response.status, path).toBe(404);
      expect(response.type, path).toBe('application/json');
      expect(response.body.error.code).toBe('NOT_FOUND');
    }
  });

  it('no aplica el fallback a métodos de escritura', async () => {
    const response = await request(createApp({ webDistPath })).post('/ruta-del-cliente');
    expect(response.status).toBe(404);
    expect(response.type).toBe('application/json');
  });
});
