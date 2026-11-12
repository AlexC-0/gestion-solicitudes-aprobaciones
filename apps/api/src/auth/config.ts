export interface AuthConfig { secret: string; origin: string; secure: boolean }
export function readAuthConfig(env: NodeJS.ProcessEnv, compiled: boolean): AuthConfig {
  const secret = env.SESSION_SECRET;
  if (!secret || !/^[a-f0-9]{64,}$/i.test(secret) || secret.length % 2 !== 0) {
    throw new Error('SESSION_SECRET debe contener al menos 32 bytes aleatorios en hexadecimal.');
  }
  const name = compiled ? 'AUTH_ORIGIN_COMPILED' : 'AUTH_ORIGIN_DEV';
  let url: URL;
  try { url = new URL(env[name] ?? ''); } catch { throw new Error(name + ' debe ser un origen explícito.'); }
  if (url.origin !== env[name] || url.username || url.password || !['https:', 'http:'].includes(url.protocol)) {
    throw new Error(name + ' debe contener solo esquema, host y puerto.');
  }
  const secure = url.protocol === 'https:';
  if (!secure && (env.SESSION_ALLOW_HTTP !== 'true' || env.NODE_ENV === 'production' ||
      !['127.0.0.1', '[::1]', 'localhost'].includes(url.hostname))) {
    throw new Error('HTTP de sesión solo se permite explícitamente en desarrollo loopback.');
  }
  return { secret, origin: url.origin, secure };
}