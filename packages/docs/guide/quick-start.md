# 快速开始

三种接入方式，选一种。

::: tip 零基础推荐
先用 [在线 Builder](https://builder.footprint-studio.dev/) 生成代码，再复制到你的博客。
:::

## 准备数据

最小数据格式（JSON）：

```json
{
  "version": 1,
  "categories": [
    {
      "id": "travel",
      "label": "旅行",
      "color": "#f97316",
      "pins": [
        { "name": "2019.04 东京", "coords": [139.759, 35.682] },
        { "name": "2022.12 巴黎", "coords": [2.32, 48.86] }
      ]
    }
  ]
}
```

- `coords` 为 `[经度, 纬度]`
- 完整字段见 [配置协议](/guide/config-protocol)
- 也支持 CSV / GeoJSON，见 [数据格式](/guide/data-formats)

---

## 方式一：Web Component（推荐）

**零构建、样式隔离（Shadow DOM）。** 直接粘贴到 HTML：

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/footprint-globe@1/dist/auto.js"></script>

<footprint-globe
  data-src="./my-pins.json"
  theme="light"
  projection="globe"
  height="480px"
  legend="true">
</footprint-globe>
```

**要点：**

- `auto.js` 是**完全自包含**的产物，`footprint-globe` 已打包在内，**无需 importmap、无需任何额外配置**
- `data-src` 指向你的 JSON 文件（相对或绝对 URL，需 HTTPS；本地调试可用 `http://localhost` / `http://127.0.0.1`）
- 也可以直接用 `data-pins='{...}'` 内联 JSON
- 引入 `auto.js` 后，所有 `.footprint-globe` 元素都会自动初始化
- 地图引擎（maplibre-gl）默认按需从 CDN 加载，也可用 `maplibre-url` 指定自托管地址

**数据内联写法（小数据，< 2KB）：**

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/footprint-globe@1/dist/auto.js"></script>

<footprint-globe
  data-pins='{"version":1,"categories":[{"id":"travel","label":"旅行","color":"#f97316","pins":[{"name":"东京","coords":[139.759,35.682]}]}]}'
  height="480px"
  legend="true">
</footprint-globe>
```

---

## 方式二：auto-init（零代码）

不需要自定义元素语法，普通 `div` 加 class 即可：

```html
<div
  class="footprint-globe"
  data-src="./my-pins.json"
  height="480px"
  legend="true"></div>

<script type="module" src="https://cdn.jsdelivr.net/npm/footprint-globe@1/dist/auto.js"></script>
```

**优势：** 适合 Hexo / WordPress 等平台，HTML 更简单。

---

## 方式三：iframe

兼容性最好。**零依赖**——宿主页面不需要引入任何脚本：

```html
<iframe
  src="https://embed.footprint-studio.dev/?src=https://example.com/pins.json&theme=light&height=480"
  width="100%"
  height="480"
  style="border:0;border-radius:12px"
  loading="lazy"
  title="我的足迹">
</iframe>
```

**高度自适应（推荐）：**

```html
<iframe id="fp" src="..." style="width:100%;border:0"></iframe>
<script>
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'footprint:height') {
      document.getElementById('fp').style.height = e.data.height + 'px';
    }
  });
</script>
```

**数据入口优先级：** `?id=`（v1.1 短链）> `?src=` > `?data=`（base64，< 4KB）。

---

## 方式四：NPM（开发者）

```bash
npm i footprint-globe maplibre-gl
```

```ts
import { FootprintGlobe } from 'footprint-globe';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'footprint-globe/dist/footprint-globe.css';

const config = {
  version: 1,
  categories: [
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [{ name: '东京', coords: [139.759, 35.682] }],
    },
  ],
};

const globe = new FootprintGlobe(document.getElementById('globe')!, {
  config,
  maplibre: maplibregl,
});

// 更新
globe.update({ config: { theme: 'dark' } });

// 销毁（SPA 路由切换时）
globe.destroy();
```

**注意：** `maplibre-gl` 是 **peer dependency**，需要自行安装。

---

## 常见下一步

| 想做什么 | 看哪 |
|---|---|
| 自定义颜色、主题、视角 | [配置协议](/guide/config-protocol) |
| 从 CSV / GeoJSON 导入 | [数据格式](/guide/data-formats) |
| 隐藏某些坐标 | [隐私与安全](/guide/privacy) |
| 遇到问题 | [常见问题](/guide/faq) |

---

## 问题排查

| 现象 | 可能原因 | 处理 |
|---|---|---|
| 白屏 | 数据路径 404 或 JSON 格式错误 | 打开控制台查看错误 |
| 显示列表视图 | 浏览器不支持 WebGL | 正常降级，换浏览器或忽略 |
| 提示 "地图引擎加载失败" | jsDelivr 不可达 | 检查网络，或用 `maplibre-url` 指定自托管地址 |
| 地图无标记 | `coords` 顺序反了 | 必须是 `[经度, 纬度]` |
| 地图区域空白 / 纯色、图例正常 | 默认瓦片源（tiles.openfreemap.org）不可达 | 控制台看 `DATA_LOAD_FAILED` 提示；用 `config.style` 换可达瓦片源，见 [FAQ](/guide/faq#为什么预览是一片深色-地球不显示) |
