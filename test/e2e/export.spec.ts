/**
 * 足迹地球 · 导出代码静态验证
 * 契约依据：《Sprint 3 执行方案》§10 S3-11、§11 C5
 *
 * 说明：完整「复制代码 → 独立页面运行」的验证在用户测试中执行；
 * E2E 只验证导出结构正确。
 */

import { test, expect } from '@playwright/test';
import { SIMPLE_JSON, blockExternalCdn, fillData } from './helpers';

test.beforeEach(async ({ page }) => {
  await blockExternalCdn(page);
});

test('X1 · Web Component export contains expected attributes', async ({ page }) => {
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);
  await page.locator('.builder-tab[data-export-type="web-component"]').click();

  const code = await page.locator('.builder-code code').textContent();
  expect(code).toBeTruthy();
  expect(code!).toContain('<script type="module"');
  expect(code!).toContain('footprint-globe@1/dist/auto.js');
  expect(code!).toContain('<footprint-globe');
  expect(code!).toContain('data-pins=');
  expect(code!).toContain('theme="light"');
  expect(code!).toContain('projection="globe"');
});

test('X2 · iframe export encodes data as base64url', async ({ page }) => {
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);
  await page.locator('.builder-tab[data-export-type="iframe"]').click();

  const code = await page.locator('.builder-code code').textContent();
  expect(code).toBeTruthy();

  const m = code!.match(/src="([^"]+)"/);
  expect(m).not.toBeNull();
  const url = m![1]!.replace(/&amp;/g, '&');

  expect(url).toContain('footprint-studio-embed.pages.dev');
  expect(url).toMatch(/[?&]data=/);
  // base64url 中不应出现 '+' 或 '/'
  const dataMatch = url.match(/[?&]data=([^&]+)/);
  expect(dataMatch).not.toBeNull();
  expect(dataMatch![1]).not.toMatch(/[+/]/);
});

test('X3 · NPM export contains import statements', async ({ page }) => {
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);
  await page.locator('.builder-tab[data-export-type="npm"]').click();

  const code = await page.locator('.builder-code code').textContent();
  expect(code).toBeTruthy();
  expect(code!).toContain("import { FootprintGlobe } from 'footprint-globe'");
  expect(code!).toContain("import maplibregl from 'maplibre-gl'");
  expect(code!).toContain("import 'maplibre-gl/dist/maplibre-gl.css'");
  expect(code!).toContain('new FootprintGlobe(');
  expect(code!).toContain('globe.destroy()');
});

test('X4 · recommendation banner reflects data size', async ({ page }) => {
  await page.goto('/');
  await fillData(page, SIMPLE_JSON);

  const banner = page.locator('.builder-recommend');
  await expect(banner).toBeVisible();
  // 小数据 → 推荐 inline
  await expect(banner).toContainText('data-pins');
});
