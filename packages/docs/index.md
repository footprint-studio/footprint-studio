---
layout: home

hero:
  name: 足迹地球
  text: 把足迹变成 3D 地球
  tagline: 无 token、开源、可嵌入。5 分钟把你的旅行与居住地变成可交互的地球。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 在线配置（Builder）
      link: https://builder.footprint-studio.dev/
    - theme: alt
      text: GitHub
      link: https://github.com/footprint-studio/footprint-studio

features:
  - icon: 🌍
    title: 3D 地球
    details: 基于 MapLibre GL JS，globe 投影，无 token、无第三方 key。地球可拖拽旋转、缩放，视觉接近原站体验。
  - icon: 🧩
    title: 三种接入
    details: Web Component / auto-init / iframe。非开发者复制粘贴即用，开发者 import 即接。
  - icon: 🔒
    title: 隐私优先
    details: 数据默认本地处理，不上传任何位置。支持坐标模糊与仅显示城市级坐标。
  - icon: 🎨
    title: 完全可配置
    details: 分类、颜色、主题、投影、视角、图例、自动旋转——一切通过配置对象驱动。
  - icon: 🪶
    title: 轻量
    details: 核心包 gzip < 15KB（不含 MapLibre）。不引入任何运行时第三方依赖。
  - icon: 🛟
    title: 优雅降级
    details: WebGL 不可用时自动切换为列表视图，不白屏、不报错。
---

<script setup>
import { onMounted } from 'vue';

onMounted(async () => {
  // 确保存在 footprint-globe 的 importmap（客户端注入，规避 md 内多 script 限制）
  if (!document.querySelector('script[type="importmap"]')) {
    const im = document.createElement('script');
    im.type = 'importmap';
    im.textContent = JSON.stringify({
      imports: { 'footprint-globe': 'https://cdn.jsdelivr.net/npm/footprint-globe@1/dist/index.js' },
    });
    document.head.appendChild(im);
  }
  const { register } = await import(
    'https://cdn.jsdelivr.net/npm/@footprint-studio/web-component@1/dist/index.js'
  );
  register();
});
</script>

## 效果

> 下方为实际渲染效果。若当前环境不支持 WebGL，会自动降级为列表视图。

<div style="margin: 1.5rem 0; border-radius: 12px; overflow: hidden;">
  <footprint-globe
    data-src="/demo/pins.json"
    height="480px"
    theme="light"
    legend="true"></footprint-globe>
</div>

## 三步开始

::: code-group

```html [Web Component（推荐）]
<script type="module" src="https://cdn.jsdelivr.net/npm/@footprint-studio/web-component@1/dist/auto.js"></script>

<footprint-globe
  data-src="./my-pins.json"
  height="480px"
  legend="true">
</footprint-globe>
```

```ts [NPM]
import { FootprintGlobe } from 'footprint-globe';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'footprint-globe/dist/footprint-globe.css';

const globe = new FootprintGlobe(document.getElementById('globe')!, {
  config: myConfig,
  maplibre: maplibregl,
});
```

```html [iframe]
<iframe
  src="https://embed.footprint-studio.dev/?src=https://example.com/pins.json&height=480"
  width="100%"
  height="480"
  style="border:0;border-radius:12px"
  loading="lazy"
  title="我的足迹">
</iframe>
```

:::

## 下一步

- [快速开始](/guide/quick-start)：三种接入方式完整示例
- [配置协议](/guide/config-protocol)：所有可配置字段
- [在线 Builder](https://builder.footprint-studio.dev/)：零代码生成嵌入代码
- [示例库](/examples/)：4 个真实场景

## 许可

MIT © 2025 Footprint Studio
