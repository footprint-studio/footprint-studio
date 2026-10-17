---
'footprint-globe': patch
'@footprint-studio/web-component': patch
---

fix: dist/auto.js 改为完全自包含产物，footprint-globe 打包进浏览器入口，零构建用户无需 importmap 即可直接 `<script type="module">` 引入；数据源 HTTPS 校验放行本地开发环境（http://localhost、127.0.0.1、[::1]）
