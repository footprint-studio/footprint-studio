# Legacy 复刻示例（new API）

用 `footprint-globe` 新 API 复刻 `examples/legacy` 的原始效果。

## 与 legacy 的差异

| 项 | legacy | new-api |
|---|---|---|
| MapLibre 初始化 | 手写 `new maplibregl.Map(...)` | `new FootprintGlobe(...)` |
| 标记 | 手写 `new maplibregl.Marker(...)` | 内部 `MarkerLayer` |
| 弹窗 | 手写 `new maplibregl.Popup(...)` | 内部 `PopupManager` |
| hover / focus / click | 逐个 `addEventListener` | 内部统一处理 |
| 图例 | HTML 写死 | 内部 `LegendView` 动态生成 |
| 数据格式 | `{ residence, travel }` | 同上，由 `loadData` 自动归一化 |
| 降级 | 无 | WebGL 不可用时列表视图 |
| 主题 | 无 | `light` / `dark` / `auto` |

## 运行

需要先构建 core：

```bash
cd packages/core
pnpm build
```

然后在浏览器打开 `examples/new-api/index.html`。

**注意：** 由于使用 ES Module 引用 `../../packages/core/dist/index.js`，需通过 HTTP 服务打开（不能 `file://`）：

```bash
# 在仓库根目录
npx serve .
# 或
python3 -m http.server 8080
```

访问 `http://localhost:8080/examples/new-api/`。

## 对照验证

并排打开：

- `examples/legacy/index.html`
- `examples/new-api/index.html`

**应一致：**
- 3D 地球外观（globe 投影、初始视角、zoom）
- 标记颜色（居住蓝、旅行橙）
- 悬停 / 聚焦 / 点击行为
- 点击地图空白关闭弹窗
- 图例内容

**允许差异：**
- CSS 类名从 `mapbox-*` → `footprint-*`
- DOM 结构由组件生成，非手写
- 兼容别名 `.mapbox-globe` 仍可用

## 故障排查

| 现象                     | 原因              | 处理                      |
| ------------------------ | ----------------- | ------------------------- |
| 白屏，控制台报 MIME 错误 | 用 `file://` 打开 | 用 HTTP 服务              |
| 控制台报 404             | core 未构建       | `pnpm build`              |
| 显示列表而非地球         | WebGL 不可用      | 正常降级，换浏览器        |
| 显示"地图引擎加载失败"   | jsDelivr 不可达   | 检查网络或自托管 maplibre |
