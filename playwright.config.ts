import { defineConfig, devices } from '@playwright/test'

/**
 * Runs against the production build: `pnpm build && pnpm test:e2e`.
 * Build first with test env in .env.local (all NEXT_PUBLIC_ vars are inlined at build time):
 *   NEXT_PUBLIC_KEYSTATIC_STORAGE=local   so /keystatic loads without GitHub
 *   NEXT_PUBLIC_WEB3FORMS_KEY=dummy       so the contact form renders (requests are mocked)
 */
const PORT = 3100

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /smoke\.spec\.ts/ },
  ],
})
