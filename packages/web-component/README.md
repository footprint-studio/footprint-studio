# @footprint-studio/web-component

足迹地球的 Web Component 封装。`<footprint-globe>` 自定义元素，Shadow DOM 隔离。

[![npm](https://img.shields.io/npm/v/@footprint-studio/web-component.svg)](https://www.npmjs.com/package/@footprint-studio/web-component)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 用法

### 零配置（auto-init）

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@footprint-studio/web-component@1/dist/auto.js"></script>

<footprint-globe
  data-src="./pins.json"
  height="480px"
  legend="true">
</footprint-globe>
```

`auto.js` 是**自包含**产物（`footprint-globe` 已打包在内），浏览器直接引入即可，**无需 importmap**。

### 手动注册（构建工具场景）

在 Vite / Webpack 项目中通过 npm 引入并按需注册，依赖去重交给构建工具：

```html
<script type="module">
  import { register } from '@footprint-studio/web-component';
  register();
</script>
```

> 不用构建工具但想手动注册时，仍可走下面的 importmap 方式（推荐优先用上面的 `auto.js`，可省去 importmap）：

```html
<script type="importmap">
{ "imports": { "footprint-globe": "https://cdn.jsdelivr.net/npm/footprint-globe@1/dist/index.js" } }
</script>
<script type="module">
  import { register } from 'https://cdn.jsdelivr.net/npm/@footprint-studio/web-component@1/dist/index.js';
  register();
</script>
```

## 属性

| 属性                | 类型                        | 说明              |
| ------------------- | --------------------------- | ----------------- |
| `data-id`           | string                      | 短链（v1.1）      |
| `data-pins`         | string                      | inline JSON       |
| `data-src`          | string                      | JSON URL（HTTPS，本地调试支持 `http://localhost`） |
| `maplibre-url`      | string                      | MapLibre CDN      |
| `theme`             | `light` \| `dark` \| `auto` | 主题              |
| `projection`        | `globe` \| `mercator`       | 投影              |
| `center`            | `"lng,lat"`                 | 初始中心          |
| `zoom`              | number                      | 初始缩放          |
| `height`            | string                      | 容器高度          |
| `legend`            | `"true"` \| `"false"`       | 图例              |
| `autorotate`        | `"true"` \| `"false"`       | 自动旋转          |
| `privacy-blur`      | number                      | 坐标模糊半径      |
| `privacy-city-only` | `"true"` \| `"false"`       | 仅城市            |

## 方法

- `update(config)` — 差异更新
- `destroy()` — 销毁
- `getInstance()` — 获取核心实例

## 事件

- `fp-ready`
- `fp-error`

## CSS 变量与 Parts

通过 `--fp-*` 变量定制样式：

```css
:root {
  --fp-globe-radius: 24px;
  --fp-marker-size: 10px;
}
```

通过 `::part()` 定制 Shadow DOM 内部元素：

```css
footprint-globe::part(legend) { border: 1px solid #e5e7eb; }
footprint-globe::part(list) { padding: 2rem; }
```

支持 parts：`globe` / `legend` / `list` / `error`。

## 文档

- [完整文档](https://footprint-studio.pages.dev/)
- [Web Component API](https://footprint-studio.pages.dev/api/web-component)

## 许可

MIT © 2025 Footprint Studio
