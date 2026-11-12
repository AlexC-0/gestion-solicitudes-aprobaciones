import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

export class Limited extends Error {
  constructor(readonly retryAfter: number) { super('Límite temporal de acceso.'); }
}
const WINDOW = 15 * 60 * 1000;
// El registro limita el número de contadores de la biblioteca; nunca expulsa uno activo.
export function createLoginLimits(now = Date.now, capacity = 20000) {
  const ip = new RateLimiterMemory({ points: 60, duration: WINDOW / 1000 });
  const pair = new RateLimiterMemory({ points: 10, duration: WINDOW / 1000 });
  const entries = new Map<string, { end: number; limiter: RateLimiterMemory }>();
  const prune = () => {
    for (const [key, entry] of entries) if (entry.end <= now()) {
      void entry.limiter.delete(key); entries.delete(key);
    }
  };
  const timer = setInterval(prune, 60000);
  timer.unref();
  function reserve(key: string, limiter: RateLimiterMemory) {
    const entry = entries.get(key);
    if (entry && entry.end <= now()) { void limiter.delete(key); entries.delete(key); }
    if (!entries.has(key)) {
      if (entries.size >= capacity) prune();
      if (entries.size >= capacity) throw new Limited(60);
      entries.set(key, { end: now() + WINDOW, limiter });
    }
  }
  async function consume(key: string, limiter: RateLimiterMemory) {
    reserve(key, limiter);
    try { await limiter.consume(key); }
    catch (error) {
      if (error instanceof RateLimiterRes) throw new Limited(Math.max(1, Math.ceil(error.msBeforeNext / 1000)));
      throw error;
    }
  }
  return {
    attempt: (address: string) => consume('ip:' + address, ip),
    async checkFailure(address: string, email: string) {
      const key = 'pair:' + JSON.stringify([address, email]);
      reserve(key, pair);
      const result = await pair.get(key);
      if (result && result.consumedPoints >= 10) {
        throw new Limited(Math.max(1, Math.ceil((entries.get(key)!.end - now()) / 1000)));
      }
    },
    async failed(address: string, email: string) {
      // penalty cuenta el fallo, sin ampliar la ventana ni bloquear permanentemente.
      const key = 'pair:' + JSON.stringify([address, email]);
      reserve(key, pair);
      await pair.penalty(key);
    },
    close() {
      clearInterval(timer);
      for (const [key, entry] of entries) void entry.limiter.delete(key);
      entries.clear();
    },
  };
}