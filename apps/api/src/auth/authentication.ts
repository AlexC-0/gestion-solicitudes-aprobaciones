import { randomBytes } from 'node:crypto';
import express, { type Request, type Response, type RequestHandler, type ErrorRequestHandler } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { csrfSync } from 'csrf-sync';
import argon2 from 'argon2';
import { z } from 'zod';
import type pg from 'pg';
import { schemaName } from '../persistence/database.js';
import type { AuthConfig } from './config.js';
import { createLoginLimits, Limited } from './limits.js';

declare module 'express-session' {
  interface SessionData { userId?: string; expiresAt?: number }
}
export const PREAUTH_MS = 15 * 60 * 1000;
export const AUTH_MS = 8 * 60 * 60 * 1000;
export const COOKIE = 'chamba.sid';
export interface PublicUser { id: string; nombre: string; correo: string; rol: 'solicitante' | 'revisor' }
class AuthError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); }
}
const loginInput = z.strictObject({
  correo: z.string().trim().toLowerCase().max(254).email(),
  password: z.string().min(1).max(1024),
});
const denied = () => new AuthError(401, 'UNAUTHENTICATED', 'No hay una sesión válida.');
const save = (req: Request) => new Promise<void>((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
const regenerate = (req: Request) => new Promise<void>((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
const destroy = (req: Request) => new Promise<void>((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));

export async function createAuthentication(options: {
  pool: pg.Pool; schema?: string; config: AuthConfig; now?: () => number; limitCapacity?: number;
}) {
  const { pool, config } = options;
  const now = options.now ?? Date.now;
  const Store = connectPgSimple(session);
  const store = new Store({
    pool, schemaName: schemaName(options.schema ?? 'app'), tableName: 'sesiones',
    createTableIfMissing: false, disableTouch: true, pruneSessionInterval: 60,
    errorLog: () => { console.error('No se pudieron limpiar las sesiones caducadas.'); },
  });
  const limits = createLoginLimits(now, options.limitCapacity);
  const dummyHash = await argon2.hash(randomBytes(32), {
    type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1, hashLength: 32,
  });
  const csrf = csrfSync({ getTokenFromRequest: req => req.get('X-CSRF-Token'), size: 32 });
  const cookie = { httpOnly: true, sameSite: 'lax' as const, path: '/', secure: config.secure };
  function fixedExpiry(req: Request) {
    const current = req.session;
    const touch = () => {
      current.cookie.expires = new Date(current.expiresAt!);
      return current;
    };
    // express-session llama touch antes de responder: no debe convertir la caducidad en deslizante.
    Object.defineProperty(current, 'touch', { value: touch, configurable: true });
    touch();
  }
  async function identity(req: Request): Promise<PublicUser> {
    if (!req.session?.userId || !req.session.expiresAt || req.session.expiresAt <= now()) throw denied();
    const result = await pool.query<PublicUser>('SELECT id,nombre,correo,rol FROM usuarios WHERE id=$1', [req.session.userId]);
    const user = result.rows[0];
    if (!user) { await destroy(req); throw denied(); }
    return user;
  }
  const requireAuthentication: RequestHandler = async (req, res, next) => {
    try { res.locals.user = await identity(req); next(); }
    catch (error) {
      if (error instanceof AuthError && error.status === 401) res.clearCookie(COOKIE, cookie);
      next(error);
    }
  };
  const protectWrite: RequestHandler = (req, _res, next) => {
    let origin = req.get('Origin');
    if (origin === undefined) {
      try { origin = new URL(req.get('Referer') ?? '').origin; } catch { origin = undefined; }
    }
    if (origin !== config.origin || !csrf.isRequestValid(req)) {
      next(new AuthError(403, 'FORBIDDEN', 'Origen o token de seguridad no válido.')); return;
    }
    next();
  };
  const router = express.Router();
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.post('/login', async (req, _res, next) => {
    await limits.attempt(req.ip ?? 'unknown'); next();
  });
  const sessionMiddleware = session({
    name: COOKIE, secret: config.secret, store, resave: false, saveUninitialized: false,
    rolling: false, cookie,
  });
  router.use(sessionMiddleware);
  router.use(async (req, res, next) => {
    if ((req.session.expiresAt !== undefined && req.session.expiresAt <= now()) ||
        (req.session.userId && !req.session.expiresAt)) {
      await regenerate(req); res.clearCookie(COOKIE, cookie);
    }
    if (req.session.expiresAt) fixedExpiry(req);
    next();
  });
  router.use(express.json({ limit: '16kb', strict: true }));
  router.get('/csrf', async (req, res) => {
    if (req.session.userId) await identity(req);
    const changed = !req.session.expiresAt || !req.session.csrfToken;
    if (!req.session.expiresAt) req.session.expiresAt = now() + PREAUTH_MS;
    fixedExpiry(req);
    const csrfToken = csrf.generateToken(req);
    if (changed) await save(req);
    res.json({ csrfToken });
  });
  router.post('/login', protectWrite, async (req, res) => {
    if (req.session.userId) throw new AuthError(409, 'ALREADY_AUTHENTICATED', 'Cierra la sesión actual antes de cambiar de cuenta.');
    const parsed = loginInput.safeParse(req.body);
    if (!parsed.success) throw new AuthError(400, 'INVALID_INPUT', 'Introduce un correo y una contraseña válidos, sin campos adicionales.');
    const { correo, password } = parsed.data;
    const address = req.ip ?? 'unknown';
    await limits.checkFailure(address, correo);
    const result = await pool.query<PublicUser & { password_hash: string }>(
      'SELECT id,nombre,correo,rol,password_hash FROM usuarios WHERE correo=$1', [correo]);
    const user = result.rows[0];
    const valid = await argon2.verify(user?.password_hash ?? dummyHash, password);
    if (!user || !valid) {
      await limits.failed(address, correo);
      throw new AuthError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.');
    }
    await regenerate(req);
    req.session.userId = user.id;
    req.session.expiresAt = now() + AUTH_MS;
    fixedExpiry(req);
    csrf.generateToken(req, true);
    await save(req);
    res.json({ user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol },
      expiresAt: new Date(req.session.expiresAt).toISOString() });
  });
  router.get('/me', requireAuthentication, (req, res) => {
    res.json({ user: res.locals.user, expiresAt: new Date(req.session.expiresAt!).toISOString() });
  });
  router.post('/logout', requireAuthentication, protectWrite, async (req, res) => {
    await destroy(req);
    res.clearCookie(COOKIE, cookie).status(204).end();
  });
  const handleError: ErrorRequestHandler = (error: unknown, req, res, next) => {
    if (res.headersSent) { next(error); return; }
    // Evita cualquier guardado automático posterior a un fallo, incluido save del login.
    Reflect.deleteProperty(req, 'session');
    if (error instanceof AuthError) {
      if (error.status === 401 && error.code === 'UNAUTHENTICATED') res.clearCookie(COOKIE, cookie);
      res.status(error.status).json({ error: { code: error.code, message: error.message } });
    } else if (error instanceof Limited) {
      res.set('Retry-After', String(error.retryAfter)).status(429).json({ error: { code: 'RATE_LIMITED', message: 'Demasiados intentos. Espera antes de volver a intentarlo.' } });
    } else if (typeof error === 'object' && error !== null && 'type' in error &&
        ['entity.too.large', 'entity.parse.failed'].includes(String(error.type))) {
      res.status(error.type === 'entity.too.large' ? 413 : 400).json({ error: { code: 'INVALID_INPUT', message: 'Cuerpo JSON no válido o demasiado grande.' } });
    } else res.status(503).json({ error: { code: 'AUTH_UNAVAILABLE', message: 'No se puede comprobar la sesión en este momento.' } });
  };
  router.use(handleError);
  return { router, sessionMiddleware, requireAuthentication, protectWrite, store, close: () => { limits.close(); store.close(); } };
}