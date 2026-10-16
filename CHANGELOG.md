# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/) 与 [SemVer](https://semver.org/)。

## [1.0.0] - 2025

首个正式版本。

### Added

- **核心引擎**（`footprint-globe`）
  - 3D 地球渲染（globe 投影），基于 MapLibre GL JS
  - 多分类标记、动态图例、单例弹窗
  - 配置协议 v1：分类、颜色、主题、投影、视角、隐私
  - 数据加载：JSON / CSV / GeoJSON / 旧格式兼容
  - 隐私模式：坐标模糊、仅城市
  - 降级：WebGL 不可用时列表视图
  - 生命周期：`update` / `destroy`
  - 事件：`ready` / `error` / `marker:click`

- **Web Component**（`@footprint-studio/web-component`）
  - `<footprint-globe>` 自定义元素
  - Shadow DOM 隔离
  - 属性映射（`data-id` / `data-pins` / `data-src` / `theme` / `projection` / …）
  - `auto-init.js` 扫描 `.footprint-globe`
  - CSS Parts 与 `--fp-*` 变量

- **在线 Builder**
  - 数据面板（JSON / CSV / 示例）
  - 配置面板（分类 / 主题 / 视角 / 隐私）
  - 实时预览
  - 三种导出模板（Web Component / iframe / NPM）
  - 数据量推荐
  - 本地草稿、导入导出 JSON、分享链接

- **iframe Embed**
  - 数据入口：`?id=` > `?src=` > `?data=`
  - 高度自适应（postMessage）

- **文档与示例**
  - 文档站：简介、快速开始、配置协议、数据格式、隐私、FAQ、API
  - 示例库：旅行博客 / 开发者主页 / 团队分布 / 简历

### 已知限制

- `data-id` 短链托管为协议占位，v1.1 实装
- UMD 模板 v1.1 提供
- 时间轴 / 路线弧线 / 地理编码 v1.1 提供
- 文档站目前仅中文

## [Unreleased]

### Planned for v1.1

- 短链托管服务
- UMD 单文件接入
- 时间轴播放
- 路线弧线
- 地理编码辅助
- 英文文档
