const { defineConfig } = require('@playwright/test');

// Rodar com navegador visível (headed) para você ver a execução no Chrome.
// Você pode sobrescrever via variável de ambiente: `HEADLESS=true`.
const headless = process.env.HEADLESS ? process.env.HEADLESS === 'true' : false;

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = defineConfig({
  testDir: './tests',
  // 5s é pouco para E2E real (e até o teardown pode estourar).
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'https://order.wendys.com',
    headless,
    actionTimeout: 5000,
    navigationTimeout: 5000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});

