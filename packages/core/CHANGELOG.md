# footprint-globe

## 1.1.0

### Minor Changes

- 5aaa111: feat: 合并 Web Component，单一包、双轨产物

  - 合并 @footprint-studio/web-component 进本包（1.0.0 只有 core，无 Web Component）：`<footprint-globe>` 自定义元素、auto-init、`register()` 统一由 footprint-globe 提供，单一 npm 包、单一版本线
  - 新增 `exports` 子路径 `./auto`：`dist/auto.js` 为完全自包含产物，零构建用户直接 `<script type="module">` 引入，无需 importmap
  - 修复 `dist/auto.js` 裸模块导入（此前把所有入口都设成 external，浏览器直接加载会报错）
  - 修复数据源 HTTPS 校验：相对路径（如 `data-src="./pins.json"`）按当前页面地址解析后再校验（此前相对路径一律被拒）；放行本地开发环境 http://localhost / 127.0.0.1 / [::1]，生产仍强制 HTTPS
  - package.json：补 `./package.json` 导出，便于工具读取元数据
