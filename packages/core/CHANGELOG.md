# footprint-globe

## 1.2.0

### Minor Changes

- 4decf33: auto 产物内联 maplibre-gl CSS：构建时将压缩后的 `maplibre-gl.css` 打入 `auto.js`，运行时自动注入 `<style>`，零构建用户只需一行 `<script>` 标签即可完全开箱即用，不再依赖 CDN 上的 CSS 文件（也消除了 CSS 加载竞态）。`<link>` CDN 加载保留为兜底路径；`index` 产物行为不变，构建工具用户仍自行 `import 'maplibre-gl/dist/maplibre-gl.css'`。

## 1.1.0

### Minor Changes

- 5aaa111: feat: 合并 Web Component，单一包、双轨产物

  - 合并 @footprint-studio/web-component 进本包（1.0.0 只有 core，无 Web Component）：`<footprint-globe>` 自定义元素、auto-init、`register()` 统一由 footprint-globe 提供，单一 npm 包、单一版本线
  - 新增 `exports` 子路径 `./auto`：`dist/auto.js` 为完全自包含产物，零构建用户直接 `<script type="module">` 引入，无需 importmap
  - 修复 `dist/auto.js` 裸模块导入（此前把所有入口都设成 external，浏览器直接加载会报错）
  - 修复数据源 HTTPS 校验：相对路径（如 `data-src="./pins.json"`）按当前页面地址解析后再校验（此前相对路径一律被拒）；放行本地开发环境 http://localhost / 127.0.0.1 / [::1]，生产仍强制 HTTPS
  - package.json：补 `./package.json` 导出，便于工具读取元数据
