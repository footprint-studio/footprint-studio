import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const here = dirname(fileURLToPath(import.meta.url));

// 读取 core 的 CSS，作为 Shadow DOM 内联样式注入
const coreCss = readFileSync(resolve(here, '../core/src/styles/footprint-globe.css'), 'utf-8');

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    auto: 'src/auto-entry.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  treeshake: true,
  external: ['maplibre-gl', 'footprint-globe'],
  define: {
    __FP_SHADOW_CSS__: JSON.stringify(coreCss),
  },
});
