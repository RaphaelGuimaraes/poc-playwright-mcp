import { test, expect } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

async function setCookieToAvoidDisplayingOneTrustBanner(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'OptanonAlertBoxClosed',
      value: new Date().toISOString(),
      domain: '.wendys.com',
      path: '/',
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

test.beforeEach(async ({ context, page }) => {
  await setCookieToAvoidDisplayingOneTrustBanner(context);

  await page.addInitScript(() => {
    const dismissOneTrust = () => {
      const acceptAllButton = document.getElementById('onetrust-accept-btn-handler');
      const banner = document.getElementById('onetrust-banner-sdk');

      if (acceptAllButton instanceof HTMLElement) {
        acceptAllButton.click();
      }

      if (banner instanceof HTMLElement) {
        banner.style.display = 'none';
        banner.style.visibility = 'hidden';
        banner.setAttribute('aria-hidden', 'true');
      }
    };

    dismissOneTrust();

    const observer = new MutationObserver(() => {
      dismissOneTrust();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
});

async function dismissOneTrustIfPresent(page: Page) {
  const banner = page.locator('#onetrust-banner-sdk');
  const acceptAllButton = page.locator('#onetrust-accept-btn-handler');

  // The banner may appear shortly after the page renders.
  await banner.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

  if (await banner.isVisible().catch(() => false)) {
    await expect(acceptAllButton).toBeVisible({ timeout: 5000 });

    await page.evaluate(() => {
      const acceptAllButton = document.getElementById('onetrust-accept-btn-handler');
      const banner = document.getElementById('onetrust-banner-sdk');

      if (acceptAllButton instanceof HTMLElement) {
        acceptAllButton.click();
      }

      if (banner instanceof HTMLElement) {
        banner.style.display = 'none';
        banner.style.visibility = 'hidden';
        banner.setAttribute('aria-hidden', 'true');
      }
    });

    await expect(banner).toBeHidden({ timeout: 10000 });
  }
}

function getZipInput(page: Page) {
  return page.getByRole('textbox', { name: /City, State, or Zipcode/i }).first();
}

function getSearchButton(page: Page) {
  return page.getByRole('button', { name: /^search$/i }).first();
}

function getAddressOption(page: Page) {
  return page.getByRole('button', { name: /6850 HOSPITAL DRIVE/i }).first();
}

async function continueAsGuest(page: Page) {
  // Start from a clean state each time.
  await page.goto('/us/en/sign-in', { waitUntil: 'domcontentloaded' });
  await dismissOneTrustIfPresent(page);

  await test.step('Click Continue as Guest', async () => {
    const cta = page.getByRole('button', { name: /continue as guest/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();
  });

  await dismissOneTrustIfPresent(page);
  await expect(getZipInput(page)).toBeVisible({ timeout: 15000 });
}

test('Continue as Guest navigates to guest flow', async ({ page }) => {
  await continueAsGuest(page);

  const zipInput = getZipInput(page);
  await expect(zipInput).toBeVisible();
});

test('Guest flow shows validation when submitting with empty/invalid ZIP', async ({ page }) => {
  await continueAsGuest(page);

  const zipInput = getZipInput(page);
  const submitButton = getSearchButton(page);

  await test.step('Validation: empty ZIP', async () => {
    await zipInput.fill('');
    await submitButton.click();
    await expect(page.getByText(/please enter an address, city, state, or zip code/i)).toBeVisible();
  });

  await test.step('Validation: invalid ZIP', async () => {
    await zipInput.fill('abcde');
    await submitButton.click();
    await expect(page.getByText(/sorry, we got lost\./i)).toBeVisible();
    await expect(page.getByText(/try searching by city, state, or zip/i)).toBeVisible();
  });
});

test('Guest flow fills ZIP=43017 and selects 6850 Hospital Drive', async ({ page }) => {
  await continueAsGuest(page);

  const zipInput = getZipInput(page);
  await zipInput.fill('43017');

  await getSearchButton(page).click();

  // Address selection: click with force because an overlay may intercept clicks.
  await getAddressOption(page).click({ force: true });

  await expect(page.getByRole('heading', { name: /6850 HOSPITAL DRIVE/i }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /order here/i }).first()).toBeVisible();
});

