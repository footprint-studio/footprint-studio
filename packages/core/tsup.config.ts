import { copyFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

// 读取组件 CSS，构建时内联为 __FP_SHADOW_CSS__（供 web/styles.ts 注入 Shadow DOM）
const shadowCss = JSON.stringify(readFileSync('src/styles/footprint-globe.css', 'utf-8'));

// 双轨制：
// 1. index —— 核心库 + Web Component API，maplibre-gl 保持 external，
//    由构建工具用户自行安装并去重。
// 2. auto —— 浏览器直接 <script type="module"> 引用，必须完全自包含：
//    打包除 maplibre-gl 外的全部代码（含 Web Component 与 auto-init）。
//    （maplibre-gl 不打包：源码全部为 `import type`，运行时由 CDN 动态加载）
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    target: 'es2022',
    treeshake: true,
    external: ['maplibre-gl'],
    clean: true,
    define: {
      __FP_SHADOW_CSS__: shadowCss,
    },
    onSuccess: async () => {
      await mkdir('dist', { recursive: true });
      await copyFile('src/styles/footprint-globe.css', 'dist/footprint-globe.css');
    },
  },
  {
    entry: { auto: 'src/web/auto-entry.ts' },
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: true,
    target: 'es2022',
    treeshake: true,
    clean: false,
    define: {
      __FP_SHADOW_CSS__: shadowCss,
    },
  },
]);
