import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node', include: ['apps/api/tests/integration/**/*.test.ts'],
    globalSetup: [fileURLToPath(new URL('./tests/integration/preflight.ts', import.meta.url))],
    fileParallelism: false, testTimeout: 30000, hookTimeout: 30000,
  },
});
