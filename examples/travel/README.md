# 旅行博客示例

单分类、暖色调。适合旅行博客的「关于」页或年度总结。

## 文件

- `index.html` — 页面结构 + 样式
- `data/pins.json` — 数据

## 修改

1. 编辑 `data/pins.json`，替换 `pins` 数组为你的城市列表
2. `coords` 为 `[经度, 纬度]`（可在 Google Maps 右键获取）
3. 调整 `.eyebrow`、`h1`、`.lede` 文案
4. 修改 `.stats` 中的统计数字

## 风格要点

- 背景色 `#fefaf6`（暖白）
- 主色 `#ea580c`（橙）
- 地球容器阴影偏暖
- 圆形边框 20px

## 部署

作为静态文件部署即可。若使用 Hexo / Hugo，可将 `index.html` 转为主题模板。
