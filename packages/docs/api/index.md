# API 总览

`footprint-globe` 提供三种使用形态，选择适合你的：

| 形态 | 入口 | 适合 |
|---|---|---|
| **核心类** | `import { FootprintGlobe } from 'footprint-globe'` | 有构建工具的开发者 |
| **Web Component** | `<footprint-globe>` 标签 | 零构建，直接放 HTML |
| **iframe** | `https://embed.footprint-studio.dev/` | 平台过滤 HTML 时 |

## 导出内容

```ts
// 核心类
import { FootprintGlobe } from 'footprint-globe';

// 配置工具
import {
  validateConfig,
  normalizeConfig,
  loadData,
  parseCsv,
  parseGeoJson,
} from 'footprint-globe';

// 常量
import {
  DEFAULT_STYLE,
  DEFAULT_MAPLIBRE_URL,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  DEFAULT_FOG,
  LIMITS,
} from 'footprint-globe';

// 错误
import { FootprintError, isFootprintError } from 'footprint-globe';

// 类型
import type {
  FootprintConfig,
  Category,
  Pin,
  RenderConfig,
  Route,
  LoadResult,
  LoadOptions,
  FootprintGlobeOptions,
  FootprintErrorCode,
} from 'footprint-globe';
```

## 子路径

| 导入路径 | 内容 |
|---|---|
| `footprint-globe` | 核心类 + 工具函数 + Web Component（`register()`） |
| `footprint-globe/auto` | auto-init 入口（副作用，注册并扫描页面元素） |
| `footprint-globe/dist/footprint-globe.css` | 样式 |

## 详细文档

- [FootprintGlobe 类](/api/footprint-globe)
- [Web Component](/api/web-component)
- [类型定义](/api/types)
