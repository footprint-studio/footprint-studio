---
'footprint-globe': minor
---

auto 产物内联 maplibre-gl CSS：构建时将压缩后的 `maplibre-gl.css` 打入 `auto.js`，运行时自动注入 `<style>`，零构建用户只需一行 `<script>` 标签即可完全开箱即用，不再依赖 CDN 上的 CSS 文件（也消除了 CSS 加载竞态）。`<link>` CDN 加载保留为兜底路径；`index` 产物行为不变，构建工具用户仍自行 `import 'maplibre-gl/dist/maplibre-gl.css'`。
