import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function readPort(name: string, fallback: number): number {
  const value = process.env[name];
  if (value === undefined) return fallback;
  if (!/^[0-9]+$/.test(value) || Number(value) < 1 || Number(value) > 65535) {
    throw new Error(`${name} debe ser un entero entre 1 y 65535.`);
  }
  return Number(value);
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: readPort('WEB_PORT', 5173),
    strictPort: true,
    proxy: { '/api': { target: `http://127.0.0.1:${readPort('API_PORT', 3000)}` } },
  },
});
