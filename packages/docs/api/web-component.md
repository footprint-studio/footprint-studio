# Web Component

`<footprint-globe>` 自定义元素。样式隔离（Shadow DOM），跨框架可用。

## 引入

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@footprint-studio/web-component@1/dist/auto.js"></script>
```

或按需引入（手动注册）：

```html
<script type="importmap">
{ "imports": { "footprint-globe": "https://cdn.jsdelivr.net/npm/footprint-globe@1/dist/index.js" } }
</script>
<script type="module">
  import { register } from 'https://cdn.jsdelivr.net/npm/@footprint-studio/web-component@1/dist/index.js';
  register();
</script>
```

---

## 属性

| 属性 | 类型 | 对应配置 | 说明 |
|---|---|---|---|
| `data-id` | string | `dataId` | Nanoid 8 位（v1.1 托管） |
| `data-pins` | string | — | inline JSON |
| `data-src` | string | — | 自托管 JSON URL（HTTPS） |
| `maplibre-url` | string | `config.maplibreUrl` | MapLibre CDN 地址 |
| `theme` | `light` \| `dark` \| `auto` | `config.theme` | 主题 |
| `projection` | `globe` \| `mercator` | `config.projection` | 投影 |
| `center` | `"lng,lat"` | `config.center` | 初始中心 |
| `zoom` | number | `config.zoom` | 初始缩放 |
| `height` | string（CSS 长度） | — | 容器高度 |
| `legend` | `"true"` \| `"false"` | `config.legend` | 图例 |
| `autorotate` | `"true"` \| `"false"` | `config.autorotate` | 自动旋转 |
| `attribution` | `"true"` \| `"false"` | `config.attribution` | 版权 |
| `privacy-blur` | number | `config.privacy.blur` | 坐标模糊半径 |
| `privacy-city-only` | `"true"` \| `"false"` | `config.privacy.cityOnly` | 仅城市 |

**数据入口优先级：** `data-id` > `data-src` > `data-pins` > `window.FOOTPRINT_PINS`

**非法属性值静默忽略**，由默认值兜底。

---

## 方法

| 方法 | 返回 | 说明 |
|---|---|---|
| `update(config)` | void | 差异更新配置 |
| `destroy()` | void | 销毁实例（断开连接时自动调用） |
| `getInstance()` | `FootprintGlobe \| null` | 获取核心实例 |

**示例：**

```html
<footprint-globe id="globe" data-src="./pins.json" height="480px"></footprint-globe>
<script type="module">
  import { register } from 'https://cdn.jsdelivr.net/npm/@footprint-studio/web-component@1/dist/index.js';
  register();

  const el = document.getElementById('globe');
  el.update({ config: { theme: 'dark' } });
</script>
```

---

## 事件

| 事件 | 触发时机 |
|---|---|
| `fp-ready` | 初始化完成 |
| `fp-error` | 发生错误（含降级） |

**示例：**

```js
const el = document.getElementById('globe');

el.addEventListener('fp-ready', () => {
  console.log('ready');
});

el.addEventListener('fp-error', (e) => {
  console.warn('error:', e.detail);
});
```

---

## CSS 变量

通过覆盖 `--fp-*` 变量定制样式。CSS 变量会穿透 Shadow DOM。

| 变量 | 默认 | 说明 |
|---|---|---|
| `--fp-globe-height` | `400px` | 容器高度 |
| `--fp-globe-radius` | `12px` | 圆角 |
| `--fp-globe-bg` | `#eef2f7` | 背景色 |
| `--fp-marker-size` | `8px` | 标记大小 |
| `--fp-marker-color` | `#2563eb` | 标记颜色（由分类动态注入） |
| `--fp-marker-border` | `#fff` | 标记边框色 |
| `--fp-marker-hover-scale` | `1.15` | 悬停缩放 |
| `--fp-marker-shadow` | （阴影） | 标记阴影 |
| `--fp-legend-bg` | `rgba(255,255,255,0.9)` | 图例背景 |
| `--fp-legend-color` | `#111827` | 图例文字 |
| `--fp-legend-radius` | `9999px` | 图例圆角 |
| `--fp-legend-gap` | `0.75rem` | 图例间距 |
| `--fp-legend-shadow` | （阴影） | 图例阴影 |

**示例：**

```css
:root {
  --fp-globe-radius: 24px;
  --fp-marker-size: 10px;
  --fp-legend-bg: #ffe4c4;
}
```

---

## CSS Parts

通过 `::part()` 定制 Shadow DOM 内部元素：

| Part | 说明 |
|---|---|
| `globe` | 容器 |
| `legend` | 图例 |
| `list` | 降级列表 |
| `error` | 错误提示 |

**示例：**

```css
footprint-globe::part(legend) {
  border: 1px solid #e5e7eb;
}

footprint-globe::part(list) {
  padding: 2rem;
}
```

---

## auto-init

引入 `auto.js` 后，会自动扫描 `.footprint-globe` 并初始化：

```html
<div class="footprint-globe" data-src="./pins.json" height="480px"></div>
<script type="module" src="https://cdn.jsdelivr.net/npm/@footprint-studio/web-component@1/dist/auto.js"></script>
```

**跳过已初始化：** 元素会自动添加 `data-fp-bound="1"` 属性。

---

## 完整示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>我的足迹</title>
  <style>
    body { max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
    footprint-globe { --fp-globe-radius: 16px; }
  </style>
</head>
<body>
  <h1>我的足迹</h1>

  <footprint-globe
    id="globe"
    data-src="./pins.json"
    height="480px"
    theme="light"
    projection="globe"
    legend="true"></footprint-globe>

  <script type="module">
    import { register } from 'https://cdn.jsdelivr.net/npm/@footprint-studio/web-component@1/dist/index.js';
    register();

    const el = document.getElementById('globe');
    el.addEventListener('fp-ready', () => console.log('ready'));
    el.addEventListener('fp-error', (e) => console.warn('error:', e.detail));
  </script>
</body>
</html>
```
