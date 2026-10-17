# footprint-globe

足迹地球核心引擎。3D 地球，无 token，可嵌入。

[![npm](https://img.shields.io/npm/v/footprint-globe.svg)](https://www.npmjs.com/package/footprint-globe)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 安装

```bash
npm i footprint-globe maplibre-gl
```

`maplibre-gl` 是 peer dependency。

## 用法

### 零构建（浏览器直接引入，推荐）

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/footprint-globe@1/dist/auto.js"></script>

<footprint-globe
  data-src="./pins.json"
  height="480px"
  legend="true">
</footprint-globe>
```

`dist/auto.js` 是**自包含**产物（含 Web Component 与 auto-init），无需 importmap。零构建用户**不需要**安装 maplibre-gl（引擎按需从 CDN 加载，可用 `maplibre-url` 自托管）。

### 构建工具（Vite / Webpack）

```ts
import { FootprintGlobe } from 'footprint-globe';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'footprint-globe/dist/footprint-globe.css';

const globe = new FootprintGlobe(document.getElementById('globe')!, {
  config: {
    version: 1,
    categories: [
      {
        id: 'travel',
        label: '旅行',
        color: '#f97316',
        pins: [{ name: '东京', coords: [139.759, 35.682] }],
      },
    ],
  },
  maplibre: maplibregl,
});

// globe.update({ config: { theme: 'dark' } });
// globe.destroy();
```

## 导出

- 类：`FootprintGlobe` / `FootprintGlobeElement`
- Web Component：`register` / `autoInit` / `boot`
- 工具：`validateConfig` / `normalizeConfig` / `loadData` / `parseCsv` / `parseGeoJson`
- 错误：`FootprintError` / `isFootprintError`
- 类型：`FootprintConfig` / `Category` / `Pin` / `RenderConfig` / `FootprintGlobeOptions` 等
- 常量：`DEFAULT_STYLE` / `DEFAULT_CENTER` / `DEFAULT_ZOOM` / `LIMITS` 等

## 特性

- 3D 地球（globe 投影）
- 多分类标记、动态图例、单例弹窗
- 配置协议 v1
- 数据格式：JSON / CSV / GeoJSON
- 隐私模式（坐标模糊、仅城市）
- 优雅降级（WebGL 不可用时列表视图）
- 事件：`ready` / `error` / `marker:click`

## 文档

- [完整文档](https://footprint-studio.pages.dev/)
- [API](https://footprint-studio.pages.dev/api/footprint-globe)
- [配置协议](https://footprint-studio.pages.dev/guide/config-protocol)

## 许可

MIT © 2025 Footprint Studio
