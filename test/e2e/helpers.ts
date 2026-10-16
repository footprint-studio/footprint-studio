/**
 * 足迹地球 · E2E 公共工具
 */

import { type Page, expect } from '@playwright/test';

export const SIMPLE_CONFIG = {
  version: 1,
  categories: [
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [
        { name: '东京', coords: [139.759, 35.682] },
        { name: '巴黎', coords: [2.32, 48.86] },
      ],
    },
  ],
  config: { theme: 'light', projection: 'globe', legend: true },
} as const;

export const SIMPLE_JSON = JSON.stringify(SIMPLE_CONFIG);

export const SIMPLE_CSV = `name,lng,lat,category
东京,139.759,35.682,travel
巴黎,2.32,48.86,travel
`;

/**
 * 阻断外部 CDN，使预览确定性降级到列表视图。
 * 由 beforeEach 调用；CI 若需测真实地图可设置 E2E_BLOCK_CDN=0。
 */
export async function blockExternalCdn(page: Page): Promise<void> {
  if (process.env.E2E_BLOCK_CDN === '0') return;
  await page.route(/cdn\.jsdelivr\.net|tiles\.openfreemap\.org|demotiles\.maplibre\.org/, (route) =>
    route.abort(),
  );
}

/** 等待预览渲染完成（地图就绪或降级列表就绪） */
export async function waitForPreview(page: Page, timeout = 10_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const c = document.querySelector('.builder-preview__container');
      if (!c) return false;
      return !!(
        c.querySelector('.maplibregl-map') ||
        c.querySelector('.footprint-list') ||
        c.querySelector('.footprint-error')
      );
    },
    undefined,
    { timeout },
  );
}

/** 断言预览已渲染（列表或地图任一） */
export async function expectPreviewRendered(page: Page): Promise<void> {
  const container = page.locator('.builder-preview__container');
  const hasList = await container.locator('.footprint-list').count();
  const hasMap = await container.locator('.maplibregl-map').count();
  expect(hasList + hasMap).toBeGreaterThan(0);
}

/** 在文本域中输入数据并等待预览 */
export async function fillData(page: Page, data: string): Promise<void> {
  await page.locator('.builder-textarea').fill(data);
  await waitForPreview(page);
}

/** 处理 confirm 对话框（accept） */
export function autoAcceptDialogs(page: Page): void {
  page.on('dialog', (d) => {
    void d.accept();
  });
}
