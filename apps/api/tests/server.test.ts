import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { expect, it } from 'vitest';

it('falla sin anunciar disponibilidad ni cerrar el proceso que ocupa el puerto', async () => {
  const occupied = createServer();
  occupied.listen(0, '127.0.0.1');
  await once(occupied, 'listening');
  const address = occupied.address();
  if (!address || typeof address === 'string') throw new Error('Puerto temporal no disponible');
  const child = spawn(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
    env: { ...process.env, API_PORT: String(address.port) },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk: Buffer) => { output += chunk.toString(); });
  child.stderr.on('data', (chunk: Buffer) => { output += chunk.toString(); });
  const deadline = setTimeout(() => { child.kill(); }, 8000);
  try {
    const [code] = await once(child, 'exit');
    expect(code).toBe(1);
    expect(output).toContain('Puerto ocupado');
    expect(output).not.toContain('Servidor disponible');
    expect(occupied.listening).toBe(true);
  } finally {
    clearTimeout(deadline);
    await new Promise<void>((resolve, reject) => {
      occupied.close((error) => { if (error) reject(error); else resolve(); });
    });
  }
}, 10000);
