# FootprintGlobe 类

核心渲染类。无框架依赖。

## 构造函数

```ts
new FootprintGlobe(container: HTMLElement, options: FootprintGlobeOptions)
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `container` | HTMLElement | 是 | 渲染容器 |
| `options` | FootprintGlobeOptions | 是 | 见下 |

**示例：**

```ts
import { FootprintGlobe } from 'footprint-globe';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'footprint-globe/dist/footprint-globe.css';

const globe = new FootprintGlobe(document.getElementById('globe')!, {
  config: myConfig,
  maplibre: maplibregl,
  onReady: () => console.log('ready'),
  onError: (err) => console.error(err),
});
```

---

## FootprintGlobeOptions

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `config` | FootprintConfig | 是 | 配置对象 |
| `maplibre` | `typeof import('maplibre-gl')` | 否 | 显式传入 MapLibre 模块 |
| `maplibreUrl` | string | 否 | 未传 `maplibre` 时的 CDN 地址 |
| `onReady` | `(instance: FootprintGlobe) => void` | 否 | 初始化完成回调 |
| `onError` | `(err: FootprintError) => void` | 否 | 错误回调 |

**MapLibre 解析优先级：**

1. `options.maplibre`（显式传入）
2. `window.maplibregl`（全局）
3. `options.maplibreUrl` / `config.maplibreUrl`（默认 jsDelivr `maplibre-gl@5`）
4. 失败 → 降级到列表视图

---

## 方法

### `update(config)`

差异更新配置。不重建地图实例。

```ts
globe.update({
  categories: [ /* 新分类 */ ],
  config: { theme: 'dark' },
});
```

**参数：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `dataId` | string? | 覆盖 dataId |
| `categories` | Category[]? | 覆盖分类（全量替换） |
| `config` | RenderConfig? | 合并到现有 config |
| `routes` | Route[]? | 覆盖路线 |

**行为：** 校验配置 → 应用隐私 → 重渲染标记与图例 → 应用主题、投影、fog。

### `destroy()`

销毁实例。释放 MapLibre、DOM、事件监听。

```ts
globe.destroy();
```

**幂等**，多次调用无副作用。SPA 路由切换时应调用。

### `getMap()`

返回底层 MapLibre `Map` 实例（进阶用法）。

```ts
const map = globe.getMap();
```

**返回：** `Map | null`（未初始化时为 null）

### `getConfig()`

返回当前标准化配置（只读）。

```ts
const cfg = globe.getConfig();
```

**注意：** 初始化未完成时抛错。

### `on(event, handler)`

订阅事件。返回取消订阅函数。

```ts
const off = globe.on('ready', () => {
  console.log('ready');
});
// 取消订阅
off();
```

---

## 事件

| 事件 | 参数 | 触发时机 |
|---|---|---|
| `ready` | — | 初始化完成 |
| `error` | `FootprintError` | 发生错误（含降级） |
| `marker:click` | `(pin: Pin, category: Category)` | 点击标记 |

**示例：**

```ts
globe.on('marker:click', (pin, category) => {
  console.log(`点击了 ${pin.name}（${category.label}）`);
});
```

---

## 完整示例

```ts
import { FootprintGlobe } from 'footprint-globe';
import type { FootprintConfig } from 'footprint-globe';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'footprint-globe/dist/footprint-globe.css';

const config: FootprintConfig = {
  version: 1,
  categories: [
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [{ name: '东京', coords: [139.759, 35.682] }],
    },
  ],
  config: {
    projection: 'globe',
    theme: 'light',
    center: [100, 30],
    zoom: 1.2,
    legend: true,
  },
};

const container = document.getElementById('globe')!;

const globe = new FootprintGlobe(container, {
  config,
  maplibre: maplibregl,
  onReady: () => console.log('footprint-globe ready'),
  onError: (err) => console.error('[footprint-globe]', err),
});

globe.on('marker:click', (pin, category) => {
  console.log(`点击：${pin.name} / ${category.label}`);
});

// 更新
setTimeout(() => {
  globe.update({ config: { theme: 'dark' } });
}, 3000);

// 销毁
// globe.destroy();
```
