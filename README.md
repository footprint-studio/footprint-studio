# 足迹地球 · Footprint Globe

> 把旅行与居住足迹变成可交互的 3D 地球，嵌入博客、主页与简历。

[![CI](https://github.com/footprint-studio/footprint-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/footprint-studio/footprint-studio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/footprint-globe.svg)](https://www.npmjs.com/package/footprint-globe)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/footprint-globe.svg)](https://www.jsdelivr.com/package/npm/footprint-globe)

![演示](https://footprint-studio.pages.dev/demo/screenshot.png)

- 基于 [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/)
- **无 token、无第三方 key**
- 三种接入方式：Web Component / auto-init / iframe
- 数据本地处理，隐私优先
- WebGL 不可用时优雅降级

---

## 快速开始

### 方式一：Web Component（推荐）

零构建、样式隔离（Shadow DOM）。直接粘贴到 HTML（auto.js 自包含，含 Web Component、auto-init 与 maplibre-gl CSS，一行引入即可）：

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

**数据格式：**

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

`coords` 为 `[经度, 纬度]`。

### 方式二：NPM（开发者）

```bash
npm i footprint-globe maplibre-gl
```

```ts
import { FootprintGlobe } from 'footprint-globe';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'footprint-globe/dist/footprint-globe.css';

const globe = new FootprintGlobe(document.getElementById('globe')!, {
  config: myConfig,
  maplibre: maplibregl,
});

// 更新
globe.update({ config: { theme: 'dark' } });

// 销毁
globe.destroy();
```

### 方式三：iframe

宿主页面**零依赖**：

```html
<iframe
  src="https://footprint-studio-embed.pages.dev/?src=https://example.com/pins.json&height=480"
  width="100%"
  height="480"
  style="border:0;border-radius:12px"
  loading="lazy"
  title="我的足迹">
</iframe>
```

### 不会写代码？

用 [**在线 Builder**](https://footprint-studio.pages.dev/builder/)：

1. 粘贴城市列表
2. 选主题、颜色
3. 复制生成的代码
4. 贴进博客

5 分钟完成。

---

## 特性

| 特性 | 说明 |
|---|---|
| 3D 地球 | globe 投影，可拖拽旋转、缩放 |
| 多分类标记 | 颜色可配，图例自动生成 |
| 弹窗交互 | 悬停 / 键盘聚焦 / 点击显示地点名 |
| 完全可配置 | 分类、颜色、主题、视角、图例、自动旋转 |
| 三种接入 | Web Component / auto-init / iframe / NPM |
| 数据格式 | JSON / CSV / GeoJSON |
| 隐私模式 | 坐标模糊、仅显示城市 |
| 优雅降级 | WebGL 不可用时显示列表视图 |
| 轻量 | 核心包 gzip < 15KB（不含 MapLibre） |
| 可访问性 | 键盘可达、aria-label、focus 管理 |

---

## 文档与示例

- **文档站**：https://footprint-studio.pages.dev/
  - [快速开始](https://footprint-studio.pages.dev/guide/quick-start)
  - [配置协议](https://footprint-studio.pages.dev/guide/config-protocol)
  - [数据格式](https://footprint-studio.pages.dev/guide/data-formats)
  - [API](https://footprint-studio.pages.dev/api/)
- **示例库**：https://footprint-studio.pages.dev/examples/
  - [旅行博客](https://footprint-studio.pages.dev/examples/travel)
  - [开发者主页](https://footprint-studio.pages.dev/examples/developer)
  - [团队分布](https://footprint-studio.pages.dev/examples/team)
  - [简历](https://footprint-studio.pages.dev/examples/resume)

---

## 常见问题

**需要申请 token 吗？**
不需要，无任何第三方 key 依赖。

**支持哪些浏览器？**
Chrome / Firefox / Safari / Edge 最近 2 个版本；iOS Safari 14+ / Android Chrome 90+。

**移动端为什么有时显示列表？**
设备不支持 WebGL 时会自动降级为列表视图（旧设备、隐私模式、企业策略）。

**会不会泄露我的位置？**
不会。所有数据默认在浏览器本地处理，不上传任何位置信息。可用隐私模式进一步模糊坐标。

**数据量大怎么办？**
< 2KB 内联；2–50KB 用 `data-src` 引用外部 JSON；更大用 iframe 或等 v1.1 短链托管。

**支持中文吗？**
完全支持。中文标签、中文数据、中文文档。

**是否收费？**
完全免费，MIT 许可。核心开源部分永远免费。

更多问题见 [FAQ](https://footprint-studio.pages.dev/guide/faq)。

---

## 项目结构

本仓库是 Footprint Studio 的 monorepo：

```
packages/
├── core/             # 渲染引擎（footprint-globe）
├── web-component/    # Web Component（@footprint-studio/web-component）
├── builder/          # 在线配置工具
├── embed/            # iframe 嵌入页
└── docs/             # 文档站
examples/             # 示例库
scripts/              # 发布与部署脚本
test/                 # E2E 与视觉快照
```

---

## 开发

```bash
# 环境：Node ≥ 20，pnpm 9
pnpm install
pnpm dev            # 启动 Builder + 文档
pnpm build          # 全量构建
pnpm test           # 单元测试
pnpm lint           # 代码规范
pnpm typecheck      # 类型检查
```

更多见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

---

## 路线图

**v1.0**（当前）

- 3D 地球、三种接入、Builder、文档站、示例库

**v1.1**（计划）

- 短链托管（`data-id`）
- UMD 单文件接入
- 时间轴播放
- 路线弧线
- 地理编码辅助
- 英文文档

**v2**（探索）

- 多产品线（时间轴、卡片）
- 插件生态（WordPress / Hexo / Astro / Obsidian）
- 团队版

---

## 贡献

欢迎 Issue 与 PR。见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)。

---

## 许可

MIT © 2025 Footprint Studio

由 [Footprint Studio](https://github.com/footprint-studio) 维护。
