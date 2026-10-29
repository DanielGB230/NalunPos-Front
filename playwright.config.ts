import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'NalunPos-Web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200',
      },
      testMatch: /.*nalunpos-web\.smoke\.spec\.ts/,
    },
    {
      name: 'NalunPos-Admin-Web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4201',
      },
      testMatch: /.*nalunpos-admin-web\.smoke\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: 'npx nx run NalunPos-Web:serve-static',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
      timeout: 120 * 1000,
    },
    {
      command: 'npx nx run NalunPos-Admin-Web:serve-static',
      url: 'http://localhost:4201',
      reuseExistingServer: !process.env['CI'],
      timeout: 120 * 1000,
    },
  ],
});
