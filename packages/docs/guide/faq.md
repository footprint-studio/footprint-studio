# 常见问题

## 为什么预览是一片深色 / 地球不显示？

最常见原因是**网络无法访问默认底图瓦片源**（`tiles.openfreemap.org`，国内网络时常不可达）。表现：页面布局正常、图例存在，但地图区域空白或纯色。

**排查：** 打开浏览器控制台，若看到 `[footprint-globe] [DATA_LOAD_FAILED] 底图加载失败…` 即为此原因。

**解决：**

1. 换一个可达的瓦片样式，例如 Carto：
   ```json
   { "config": { "style": "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" } }
   ```
2. 或自托管瓦片（PMTiles / Protomaps），用 `config.style` 指向本地样式。

## 为什么用 MapLibre 而非 Mapbox？

- Mapbox GL JS v2+ 需要付费 token
- MapLibre 是 Mapbox 的社区开源分支（BSD-3），API 几乎一致，支持 globe 投影
- 完全免费、无需 token，适合开源项目与个人站点

## 需要申请 token 吗？

**不需要。** 无任何第三方 key 依赖。

## 支持哪些浏览器？

- Chrome / Firefox / Safari / Edge 最近 2 个版本
- 移动端：iOS Safari 14+ / Android Chrome 90+

## 移动端为什么有时显示列表？

如果设备不支持 WebGL（旧设备、隐私模式、企业策略），组件会**自动降级为列表视图**，显示所有地点名称。

这是预期行为，不是 bug。

## 数据量大怎么办？

按数据量选择：

| 数据量 | 推荐 |
|---|---|
| < 2 KB | 内联到 `data-pins` |
| 2–50 KB | 部署 JSON，用 `data-src` |
| > 50 KB | iframe + `data-src`，或等 v1.1 短链托管 |

[在线 Builder](https://footprint-studio.pages.dev/builder/) 会自动推荐。

## 如何自定义颜色？

两种方式：

**方式 1：分类色（每个分类一个色）**

```json
{
  "categories": [
    { "id": "travel", "color": "#f97316" }
  ]
}
```

**方式 2：全局 CSS 变量覆盖**

```css
:root {
  --fp-globe-radius: 24px;
  --fp-marker-size: 10px;
  --fp-legend-bg: #ffe4c4;
}
```

变量清单见 [Web Component API](/api/web-component#css-变量)。

## 如何隐藏图例？

```json
{
  "config": { "legend": false }
}
```

或在 Web Component 上：

```html
<footprint-globe legend="false" ...></footprint-globe>
```

## 如何嵌入 WordPress / Hexo？

**WordPress：** 使用"自定义 HTML"区块，粘贴 Web Component 或 iframe 代码。

**Hexo：** 在文章 Markdown 中直接使用 HTML（需要主题允许 HTML）。或用 iframe 方式。

**注意：** 若平台会过滤 `<script>` 标签，改用 iframe 方式。

## 会不会泄露我的位置？

**不会。** 所有数据默认在浏览器本地处理。详见 [隐私与安全](/guide/privacy)。

如果你担心展示精确坐标，用隐私模式：

```json
{
  "config": { "privacy": { "blur": 10 } }
}
```

## 支持中文吗？

- 中文标签默认支持（取决于底图样式）
- 中文数据完全支持
- 文档站 v1 为中文；v1.1 补英文

## 可以离线用吗？

可以，但需自托管：

1. 下载 `maplibre-gl.js` / `maplibre-gl.css`
2. 用 `maplibre-url` 属性指向本地
3. 数据用 `data-pins` 内联

底图瓦片离线需要自托管瓦片服务（PMTiles / Protomaps）。

## 如何贡献？

见 [CONTRIBUTING.md](https://github.com/footprint-studio/footprint-studio/blob/main/CONTRIBUTING.md)。

## 是否收费？

**完全免费、MIT 许可。**

路线图（v1.1 计划）：

- 短链托管（**免费额度 + 可选 Pro**）
- UMD 模板
- 时间轴播放
- 路线弧线
- 地理编码辅助

**核心开源部分永远免费。**

## 为什么某些功能还没做？

v1 目标是**把核心做到可靠**。v1.1 会补：

- 短链托管服务
- UMD 单文件接入
- 时间轴、路线弧线
- 地理编码（输入城市名自动转坐标）
- 英文文档

## 如何反馈问题？

- GitHub Issue：https://github.com/footprint-studio/footprint-studio/issues
- 提交前请先搜索是否已存在相同问题
