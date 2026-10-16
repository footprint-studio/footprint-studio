# 配置协议 v1

配置对象（`FootprintConfig`）的完整规范。协议 v1 在 1.x 内保持不变。

## 顶层结构

```json
{
  "version": 1,
  "dataId": "aBc12XyZ",
  "categories": [ /* ... */ ],
  "config": { /* ... */ },
  "routes": [ /* ... 可选 */ ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `version` | `1` | 是 | 协议版本，当前固定为 `1` |
| `dataId` | string | 否 | 短链标识（Nanoid 8 位，`[0-9a-zA-Z_-]`），v1.1 起托管 |
| `categories` | Category[] | 是 | 分类列表，1–8 个 |
| `config` | RenderConfig | 否 | 渲染配置，省略时用默认值 |
| `routes` | Route[] | 否 | 路线（v1.1 实装） |

---

## categories

每个分类代表一组标记（如"居住"、"旅行"、"想去"）。

```json
{
  "id": "travel",
  "label": "旅行",
  "color": "#f97316",
  "icon": "dot",
  "pins": [
    {
      "name": "2019.04 东京",
      "coords": [139.759, 35.682],
      "date": "2019-04",
      "note": "春天看樱花",
      "photos": ["https://example.com/a.jpg"]
    }
  ]
}
```

| 字段 | 类型 | 必填 | 约束 |
|---|---|---|---|
| `id` | string | 是 | 匹配 `^[a-z][a-z0-9-]*$`，唯一 |
| `label` | string | 是 | 图例显示名称 |
| `color` | string | 是 | `#RGB` 或 `#RRGGBB` |
| `icon` | `'dot'` \| `'pin'` \| `'star'` | 否 | 默认 `dot` |
| `pins` | Pin[] | 是 | 标记列表 |

### Pin

| 字段 | 类型 | 必填 | 约束 |
|---|---|---|---|
| `name` | string | 是 | 长度 ≤ 200 |
| `coords` | `[lng, lat]` | 是 | 经度 `[-180, 180]`，纬度 `[-90, 90]` |
| `date` | string | 否 | ISO 日期，如 `"2019-04"` |
| `note` | string | 否 | 长度 ≤ 500 |
| `photos` | string[] | 否 | 最多 5 个 URL |

**约束：** 总标记数 ≤ 1000；分类数 ≤ 8。

---

## config

```json
{
  "projection": "globe",
  "theme": "light",
  "style": "https://tiles.openfreemap.org/styles/positron",
  "maplibreUrl": "https://cdn.jsdelivr.net/npm/maplibre-gl@5/dist/maplibre-gl.js",
  "center": [100, 30],
  "zoom": 1.2,
  "pitch": 0,
  "bearing": 0,
  "legend": true,
  "autorotate": false,
  "attribution": false,
  "fog": { /* 见下 */ },
  "privacy": { "blur": 0, "cityOnly": false }
}
```

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `projection` | `globe` \| `mercator` | `globe` | 3D 地球或平面地图 |
| `theme` | `light` \| `dark` \| `auto` | `light` | 主题 |
| `style` | string | OpenFreeMap positron | 底图样式 URL |
| `maplibreUrl` | string | jsDelivr `maplibre-gl@5` | MapLibre CDN 地址 |
| `center` | `[lng, lat]` | `[100, 30]` | 初始中心（亚太视角） |
| `zoom` | number | `1.2` | 初始缩放 |
| `pitch` | number | `0` | 初始俯仰 |
| `bearing` | number | `0` | 初始方位 |
| `legend` | boolean | `true` | 是否显示图例 |
| `autorotate` | boolean | `false` | 是否自动旋转 |
| `attribution` | boolean | `false` | 是否显示版权 |
| `fog` | object | 见下 | 大气效果 |
| `privacy` | object | 见下 | 隐私设置 |

### fog

```json
{
  "color": "rgba(0,0,0,0)",
  "high-color": "rgba(255,255,255,0.1)",
  "space-color": "rgba(0,0,0,0)",
  "horizon-blend": 0
}
```

### privacy

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `blur` | number | `0` | 坐标随机偏移（公里），0 表示关闭 |
| `cityOnly` | boolean | `false` | 仅显示城市级坐标（保留 2 位小数） |

详见 [隐私与安全](/guide/privacy)。

---

## routes（v1.1）

```json
[
  {
    "from": [139.759, 35.682],
    "to": [103.85, 1.29],
    "type": "flight",
    "date": "2023-10",
    "color": "#f97316"
  }
]
```

**v1 只定义协议，不渲染。**

---

## 完整示例

```json
{
  "version": 1,
  "categories": [
    {
      "id": "residence",
      "label": "居住",
      "color": "#2563eb",
      "pins": [
        { "name": "2023.10 新加坡", "coords": [103.851959, 1.29027] }
      ]
    },
    {
      "id": "travel",
      "label": "旅行",
      "color": "#f97316",
      "pins": [
        { "name": "2019.04 东京", "coords": [139.759, 35.682] },
        { "name": "2022.12 巴黎", "coords": [2.32, 48.86] }
      ]
    }
  ],
  "config": {
    "projection": "globe",
    "theme": "light",
    "center": [100, 30],
    "zoom": 1.2,
    "legend": true
  }
}
```

---

## 旧格式兼容

以下旧格式会被自动识别并转换：

```js
window.FOOTPRINT_PINS = {
  residence: [{ name: "新加坡", coords: [103.85, 1.29] }],
  travel: [{ name: "东京", coords: [139.759, 35.682] }]
};
```

转换规则：

- `residence` → `{id: "residence", label: "居住", color: "#2563eb"}`
- `travel` → `{id: "travel", label: "旅行", color: "#f97316"}`
- 其余字段使用默认值

---

## 版本策略

| 版本 | 兼容性 | 说明 |
|---|---|---|
| v1 | 当前 | 本文档 |
| v1.x | 向后兼容 | 新增可选字段 |
| v2 | 破坏性 | 提供迁移工具 + 公告 |
