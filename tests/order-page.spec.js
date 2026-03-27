const { test, expect } = require('@playwright/test');

test('Wendys order page loads (chromium)', async ({ page }) => {
  await page.goto('/us/en', { waitUntil: 'domcontentloaded' });

  // Basic sanity checks: URL and that the page body is present/visible.
  await expect(page).toHaveURL(/\/us\/en/);
  await expect(page.locator('body')).toBeVisible();
});

