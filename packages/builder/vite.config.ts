import { defineConfig } from 'vite';

export default defineConfig({
  // 站点把 builder 挂在 /builder/ 下（见 scripts/build-site.mjs），
  // 此时必须以 /builder/ 为 base，否则 index.html 与动态 chunk 里写死的
  // /assets/... 会 404，整页白屏。本地 dev / preview 不传该变量，保持根路径。
  base: process.env.BUILDER_BASE || '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['footprint-globe'],
  },
});
