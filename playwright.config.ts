import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: false, // Sequential execution for data scraping
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Single worker for sequential state processing
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  timeout: 120000, // 2 minutes per test
  expect: {
    timeout: 30000
  },

  use: {
    baseURL: 'https://vahan.parivahan.gov.in',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Browser context options
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,

    // Download handling
    acceptDownloads: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 500, // Slow down for stability with government sites
        }
      },
    },
  ],

  outputDir: 'test-results/',
});
