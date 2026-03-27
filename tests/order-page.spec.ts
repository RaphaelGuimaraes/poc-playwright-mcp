import { test, expect } from '@playwright/test';

test('Wendys order page loads (chrome)', async ({ page }) => {
  await page.goto('/us/en', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(/\/us\/en/);
  await expect(page.getByRole('document')).toBeVisible();
});

