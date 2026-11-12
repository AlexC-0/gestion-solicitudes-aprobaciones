import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 60000,
  globalTimeout: 240000,
  expect: { timeout: 10000 },
  reporter: './tests/e2e/reporter.ts',
  outputDir: 'test-results/e2e',
  use: { trace: 'off', screenshot: 'off', video: 'off' },
});
