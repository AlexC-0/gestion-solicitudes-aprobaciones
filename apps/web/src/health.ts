import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false },
      mutations: { retry: false },
    },
  });
}

export async function checkHealth(signal: AbortSignal): Promise<{ status: 'ok' }> {
  const response = await fetch('/api/health', { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('No se pudo comprobar la conexión.');
  const data: unknown = await response.json();
  if (typeof data !== 'object' || data === null || !('status' in data) || data.status !== 'ok') {
    throw new Error('La respuesta del servidor no es válida.');
  }
  return { status: 'ok' };
}
