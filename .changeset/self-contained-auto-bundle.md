---
'footprint-globe': patch
---

fix: v1 发版前架构定稿

- 合并 @footprint-studio/web-component 进本包：Web Component、auto-init、`<footprint-globe>` 自定义元素统一由 footprint-globe 提供，单一 npm 包、单一版本线
- dist/auto.js 改为完全自包含产物，零构建用户直接 `<script type="module">` 引入，无需 importmap
- 数据源 HTTPS 校验修复：相对路径（如 `data-src="./pins.json"`）按当前页面地址解析后再校验（此前相对路径一律被拒）；放行本地开发环境 http://localhost / 127.0.0.1 / [::1]，生产仍强制 HTTPS
- 新增 exports 子路径 `./auto`；去除 fixed 版本组与 workspace:* 依赖改写环节
