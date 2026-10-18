# 简介

<script setup>
import { onMounted } from 'vue';

onMounted(async () => {
  // 合并后的 footprint-globe 单包自带 register（除 maplibre 按需 CDN 加载外自包含）
  const { register } = await import(
    'https://cdn.jsdelivr.net/npm/footprint-globe@1/dist/index.js'
  );
  register();
});
</script>

**足迹地球（Footprint Globe）** 把旅行与居住足迹变成可交互的 3D 地球，可嵌入博客、主页、简历、年度总结。

- 基于 [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/)（开源 BSD-3）
- **无 token、无第三方 key**
- 三种接入方式：Web Component / auto-init / iframe
- 数据本地处理，隐私优先
- 核心包 gzip < 15KB（不含 MapLibre）

## 效果

<div style="margin: 1.5rem 0; border-radius: 12px; overflow: hidden;">
  <footprint-globe
    data-src="/demo/pins.json"
    height="420px"
    legend="true"></footprint-globe>
</div>

## 适合谁

| 画像 | 场景 | 你能得到 |
|---|---|---|
| 旅行博主 | 关于页、年度总结 | 好看、可交互、复制粘贴即用 |
| 独立开发者 | 个人主页 | 无 token、可自托管、可定制 |
| 数字游民 | 简历、主页 | 展示居住轨迹、隐私可控 |
| 团队负责人 | 团队分布页 | 多人数据、统一风格 |
| 内容平台 | 插件 / 集成 | 标准数据格式、稳定 API |

## 特性

| 特性 | 说明 |
|---|---|
| 3D 地球 | globe 投影，可拖拽旋转、缩放 |
| 多分类标记 | 橙色 = 旅行，蓝色 = 居住，颜色可配 |
| 弹窗交互 | 悬停 / 键盘聚焦 / 点击显示地点名 |
| 动态图例 | 根据分类自动生成 |
| 完全可配置 | 分类、颜色、主题、视角、图例、自动旋转 |
| 三种接入 | Web Component / auto-init / iframe |
| 隐私模式 | 坐标模糊、仅显示城市 |
| 优雅降级 | WebGL 不可用时显示列表视图 |

## 下一步

- [快速开始](/guide/quick-start) — 5 分钟完成接入
- [配置协议](/guide/config-protocol) — 所有可配置字段
- [在线 Builder](https://footprint-studio.pages.dev/builder/) — 零代码生成

## 品牌与许可

- 组织：**Footprint Studio**（足迹工作室）
- 产品：**足迹地球 / Footprint Globe**
- 许可：MIT
