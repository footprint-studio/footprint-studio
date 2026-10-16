import { test, expect } from '@playwright/test';

const FIXTURES = 'test/visual/fixtures';

async function waitForReady(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.getAttribute('data-fp-ready') !== '0', {
    timeout: 10_000,
  });
}

test.describe('Web Component 视觉快照', () => {
  test('renders <footprint-globe> with legend', async ({ page }) => {
    await page.goto(`${FIXTURES}/web-component.html`);
    await waitForReady(page);
    await page.waitForTimeout(500); // 等待地图渲染
    await expect(page).toHaveScreenshot('web-component.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('auto-init scans .footprint-globe', async ({ page }) => {
    await page.goto(`${FIXTURES}/auto-init.html`);
    await waitForReady(page);
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('auto-init.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('iframe embed with postMessage height', async ({ page }) => {
    await page.goto(`${FIXTURES}/iframe.html`);
    await waitForReady(page);
    await page.waitForTimeout(800);
    await expect(page).toHaveScreenshot('iframe.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('dark theme', async ({ page }) => {
    await page.goto(`${FIXTURES}/dark.html`);
    await waitForReady(page);
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('dark.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('fallback list when WebGL disabled', async ({ page }) => {
    await page.goto(`${FIXTURES}/fallback.html`);
    await waitForReady(page);
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('fallback.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
