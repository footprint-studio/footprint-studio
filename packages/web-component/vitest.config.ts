import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = dirname(fileURLToPath(import.meta.url));

// 与 tsup.config.ts 的 define 保持等价：测试直接跑 src，
// 需要把 core 的 CSS 作为 __FP_SHADOW_CSS__ 注入，才能验证 Shadow 样式真实内容。
const coreCss = readFileSync(resolve(here, '../core/src/styles/footprint-globe.css'), 'utf-8');

export default defineConfig({
  define: {
    __FP_SHADOW_CSS__: JSON.stringify(coreCss),
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.ts'],
      // auto-entry.ts 只有一行副作用调用 boot()，无分支可测
      exclude: ['src/index.ts', 'src/auto-entry.ts', 'src/**/*.d.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
