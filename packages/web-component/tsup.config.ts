import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const here = dirname(fileURLToPath(import.meta.url));

// 读取 core 的 CSS，作为 Shadow DOM 内联样式注入
const coreCss = readFileSync(resolve(here, '../core/src/styles/footprint-globe.css'), 'utf-8');

// 双轨制：
// 1. index —— 供 Vite/Webpack 等构建工具使用，footprint-globe / maplibre-gl 保持 external，
//    由使用方安装并去重。
// 2. auto —— 浏览器直接 <script type="module"> 引用，必须完全自包含：
//    把 footprint-globe 打进产物，无需 importmap。
//    （maplibre-gl 不需要打包：core 全部为 `import type`，运行时由 CDN 动态加载）
const common = {
  format: ['esm', 'cjs'],
  sourcemap: true,
  target: 'es2022',
  treeshake: true,
  define: {
    __FP_SHADOW_CSS__: JSON.stringify(coreCss),
  },
} as const;

export default defineConfig([
  {
    ...common,
    entry: { index: 'src/index.ts' },
    dts: true,
    clean: true,
    external: ['maplibre-gl', 'footprint-globe'],
  },
  {
    ...common,
    entry: { auto: 'src/auto-entry.ts' },
    dts: false,
    clean: false,
    noExternal: ['footprint-globe'],
  },
]);
