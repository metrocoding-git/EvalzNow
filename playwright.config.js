const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-results.json' }], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:3000',
    headless: true,
    launchOptions: { executablePath: process.env.CHROMIUM || undefined },
    trace: 'off',
    video: 'on',
    screenshot: 'on',
  },
});
