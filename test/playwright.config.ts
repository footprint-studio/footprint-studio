import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },

  projects: [
    // ===== 视觉快照（沿用 Sprint 2 项目名，保持基线文件名兼容）=====
    // WebGL canvas 在 CI 软件渲染（SwiftShader）下逐次运行存在 6%~12% 的
    // 像素抖动，精确快照门禁不可行。视觉项目统一禁用 WebGL，让组件走
    // 确定性的 DOM 降级视图（图例 / 列表 / 布局），3D 渲染正确性由
    // 单元测试与 e2e-chromium 功能测试覆盖。
    {
      name: 'chromium',
      testDir: './visual',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4173',
        launchOptions: { args: ['--disable-webgl', '--disable-webgl2'] },
      },
    },
    {
      name: 'firefox',
      testDir: './visual',
      use: { ...devices['Desktop Firefox'], baseURL: 'http://127.0.0.1:4173' },
    },
    {
      name: 'webkit',
      testDir: './visual',
      use: { ...devices['Desktop Safari'], baseURL: 'http://127.0.0.1:4173' },
    },

    // ===== E2E =====
    {
      name: 'e2e-chromium',
      testDir: './e2e',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4174' },
    },
  ],

  webServer: [
    {
      command: 'pnpm exec serve ../ -l 4173 --no-clipboard',
      url: 'http://127.0.0.1:4173/test/visual/fixtures/',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      // 需先执行 pnpm build（Builder dist 必须存在）
      command:
        'pnpm --filter @footprint-studio/builder exec vite preview --host 127.0.0.1 --port 4174 --strictPort',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
