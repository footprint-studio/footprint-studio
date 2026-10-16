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
    {
      name: 'chromium',
      testDir: './visual',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4173' },
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
