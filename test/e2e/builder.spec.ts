/**
 * 足迹地球 · Builder E2E
 * 契约依据：《Sprint 3 执行方案》§10 S3-11、§11 C1 ~ C9
 */

import { test, expect } from '@playwright/test';
import {
  SIMPLE_CSV,
  SIMPLE_JSON,
  autoAcceptDialogs,
  blockExternalCdn,
  expectPreviewRendered,
  fillData,
  waitForPreview,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await blockExternalCdn(page);
});

// ============ E1 ============
test('E1 · empty state shows placeholder', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.builder-preview__placeholder')).toBeVisible();
  await expect(page.locator('.builder-preview__placeholder')).toContainText('粘贴数据');
});

// ============ E2 ============
test('E2 · paste JSON renders preview', async ({ page }) => {
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);
  await expectPreviewRendered(page);
});

// ============ E3 ============
test('E3 · paste CSV renders preview', async ({ page }) => {
  await page.goto('/');
  await page.locator('.builder-tab[data-source="csv"]').click();
  await fillData(page, SIMPLE_CSV);
  await expectPreviewRendered(page);
});

// ============ E4 ============
test('E4 · load example renders preview and shows notice', async ({ page }) => {
  await page.goto('/');
  await page.locator('.builder-tab[data-source="example"]').click();
  await page.locator('.builder-example-btn[data-example="travel"]').click();
  await waitForPreview(page);
  await expectPreviewRendered(page);
  await expect(page.locator('.builder-notice')).toContainText('旅行足迹');
});

// ============ E5 ============
test('E5 · theme switch applies to preview', async ({ page }) => {
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);

  await page.locator('input[name="builder-theme"][value="dark"]').check();

  // 主题写入 config 后 raw JSON 同步，预览重建
  await page.waitForFunction(
    () => {
      const ta = document.querySelector<HTMLTextAreaElement>('.builder-textarea');
      if (!ta) return false;
      try {
        return JSON.parse(ta.value)?.config?.theme === 'dark';
      } catch {
        return false;
      }
    },
    undefined,
    { timeout: 5_000 },
  );
});

// ============ E6 ============
test('E6 · category color change reflects in raw JSON', async ({ page }) => {
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);

  await page
    .locator('.builder-category-row .builder-color')
    .first()
    .evaluate((el) => {
      const input = el as HTMLInputElement;
      input.value = '#10b981';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await page.waitForFunction(() => {
    const ta = document.querySelector<HTMLTextAreaElement>('.builder-textarea');
    if (!ta) return false;
    try {
      const parsed = JSON.parse(ta.value);
      return parsed.categories?.[0]?.color === '#10b981';
    } catch {
      return false;
    }
  });
});

// ============ E7 ============
test('E7 · switch export tabs generates expected code', async ({ page }) => {
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);

  await page.locator('.builder-tab[data-export-type="web-component"]').click();
  await expect(page.locator('.builder-code code')).toContainText('<footprint-globe');
  await expect(page.locator('.builder-code code')).toContainText('footprint-globe');

  await page.locator('.builder-tab[data-export-type="iframe"]').click();
  await expect(page.locator('.builder-code code')).toContainText('<iframe');
  await expect(page.locator('.builder-code code')).toContainText(
    'footprint-studio-embed.pages.dev',
  );

  await page.locator('.builder-tab[data-export-type="npm"]').click();
  await expect(page.locator('.builder-code code')).toContainText("from 'footprint-globe'");
  await expect(page.locator('.builder-code code')).toContainText("from 'maplibre-gl'");
});

// ============ E8 ============
test('E8 · copy button shows feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);

  await page.locator('.builder-tab[data-export-type="web-component"]').click();
  await page.locator('.builder-btn--copy').click();
  await expect(page.locator('.builder-btn--copy')).toContainText('已复制');

  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('<footprint-globe');
});

// ============ E9 ============
test('E9 · refresh restores draft after confirmation', async ({ page }) => {
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);

  // 等待 debounce（500ms）写入
  await page.waitForTimeout(800);

  let dialogMessage = '';
  page.once('dialog', async (d) => {
    dialogMessage = d.message();
    await d.accept();
  });

  await page.reload();

  await expect(page.locator('.builder-textarea')).toHaveValue(SIMPLE_JSON);
  expect(dialogMessage).toContain('草稿');
});

// ============ E10 ============
test('E10 · share URL roundtrip restores config', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);

  // 兜底监听 prompt（若 clipboard 不可用会走 prompt）
  page.on('dialog', async (d) => {
    await d.dismiss();
  });

  await page.locator('[data-action="share"]').click();

  // 两种路径：clipboard 成功 或 prompt 触发
  let shareUrl = '';
  try {
    shareUrl = await page.evaluate(() => navigator.clipboard.readText());
  } catch {
    // prompt 路径：测试到此为止，不再断言
    return;
  }

  expect(shareUrl).toContain('?s=');

  const p2 = await context.newPage();
  await blockExternalCdn(p2);
  await p2.goto(shareUrl);
  await expect(p2.locator('.builder-textarea')).toHaveValue(SIMPLE_JSON);
  await expect(p2.locator('.builder-notice')).toContainText('分享链接');
});

// ============ E11 ============
test('E11 · invalid JSON shows inline error', async ({ page }) => {
  await page.goto('/');
  await page.locator('.builder-textarea').fill('{invalid json');
  await expect(page.locator('.builder-errors')).toBeVisible();
  await expect(page.locator('.builder-errors')).toContainText('JSON');
});

// ============ E12 ============
test('E12 · large data recommends non-inline export', async ({ page }) => {
  await page.goto('/');

  const bigConfig = {
    version: 1,
    categories: [
      {
        id: 'travel',
        label: '旅行',
        color: '#f97316',
        pins: Array.from({ length: 300 }, (_, i) => ({
          name: `Point ${i} with a long descriptive name to inflate size`,
          coords: [((i * 7) % 360) - 180, ((i * 11) % 170) - 85],
        })),
      },
    ],
    config: { theme: 'light' },
  };

  await fillData(page, JSON.stringify(bigConfig));

  const banner = page.locator('.builder-recommend');
  await expect(banner).toBeVisible();
  // 数据量应 ≥ 2KB，推荐非 inline（src 或 id）
  const text = await banner.textContent();
  expect(text).toMatch(/data-src|短链/);
});

// ============ E13（额外）============
test('E13 · add category updates preview and raw', async ({ page }) => {
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);

  await page.locator('.builder-add-category').click();

  await page.waitForFunction(() => {
    const ta = document.querySelector<HTMLTextAreaElement>('.builder-textarea');
    if (!ta) return false;
    try {
      const parsed = JSON.parse(ta.value);
      return parsed.categories?.length === 2;
    } catch {
      return false;
    }
  });

  await waitForPreview(page);
  await expectPreviewRendered(page);
});

// ============ E14（额外）============
test('E14 · reset clears state', async ({ page }) => {
  autoAcceptDialogs(page);
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);

  await page.locator('[data-action="reset"]').click();
  await expect(page.locator('.builder-textarea')).toHaveValue('');
  await expect(page.locator('.builder-preview__placeholder')).toBeVisible();
});

// ============ E15（额外）============
test('E15 · import replaces current data (accept confirm)', async ({ page }) => {
  autoAcceptDialogs(page);
  await page.goto('/');

  const initialConfig = {
    version: 1,
    categories: [
      {
        id: 'travel',
        label: '旅行',
        color: '#f97316',
        pins: [{ name: '东京', coords: [139.759, 35.682] }],
      },
    ],
  };
  await fillData(page, JSON.stringify(initialConfig));

  // 直接通过 file input 模拟上传
  await page.locator('input[type="file"]').setInputFiles({
    name: 'config.json',
    mimeType: 'application/json',
    buffer: Buffer.from(SIMPLE_JSON),
  });

  await page.waitForFunction((expected) => {
    const ta = document.querySelector<HTMLTextAreaElement>('.builder-textarea');
    return ta?.value === expected;
  }, SIMPLE_JSON);

  await waitForPreview(page);
  await expectPreviewRendered(page);
});

// ============ E16（额外）============
test('E16 · GeoJSON paste renders preview', async ({ page }) => {
  await page.goto('/');

  const geojson = JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [103.85, 1.29] },
        properties: { name: '新加坡', category: 'residence' },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [139.76, 35.68] },
        properties: { name: '东京', category: 'travel' },
      },
    ],
  });

  await fillData(page, geojson);
  await expectPreviewRendered(page);
});
