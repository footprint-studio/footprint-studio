import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// 与 tsup 构建一致：把组件 CSS 内联为 __FP_SHADOW_CSS__，供 web/styles.ts 在测试中使用
const shadowCss = JSON.stringify(readFileSync('src/styles/footprint-globe.css', 'utf-8'));

export default defineConfig({
  define: {
    __FP_SHADOW_CSS__: shadowCss,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/**/*.d.ts', 'src/globe.ts', 'src/map-controller.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
