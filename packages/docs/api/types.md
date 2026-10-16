# 类型定义

所有导出的 TypeScript 类型。

## FootprintConfig

```ts
interface FootprintConfig {
  version: 1;
  dataId?: string;
  categories: Category[];
  config?: RenderConfig;
  routes?: Route[];
}
```

## Category

```ts
interface Category {
  id: string;
  label: string;
  color: string;
  icon?: 'dot' | 'pin' | 'star';
  pins: Pin[];
}
```

## Pin

```ts
interface Pin {
  name: string;
  coords: [number, number];
  date?: string;
  note?: string;
  photos?: string[];
}
```

## RenderConfig

```ts
interface RenderConfig {
  projection?: 'globe' | 'mercator';
  theme?: 'light' | 'dark' | 'auto';
  style?: string;
  maplibreUrl?: string;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  legend?: boolean;
  autorotate?: boolean;
  attribution?: boolean;
  fog?: FogConfig;
  privacy?: PrivacyConfig;
}
```

## FogConfig

```ts
interface FogConfig {
  color?: string;
  'high-color'?: string;
  'space-color'?: string;
  'horizon-blend'?: number;
}
```

## PrivacyConfig

```ts
interface PrivacyConfig {
  blur?: number;
  cityOnly?: boolean;
}
```

## Route

```ts
interface Route {
  from: [number, number];
  to: [number, number];
  type: 'flight' | 'train' | 'drive';
  date?: string;
  color?: string;
}
```

## LoadOptions

```ts
interface LoadOptions {
  id?: string;
  src?: string;
  data?: string;
  globalVar?: string;
}
```

## LoadResult

```ts
interface LoadResult {
  config: FootprintConfig;
  warnings: string[];
}
```

## FootprintGlobeOptions

```ts
interface FootprintGlobeOptions {
  config: FootprintConfig;
  maplibre?: typeof import('maplibre-gl');
  maplibreUrl?: string;
  onError?: (err: FootprintError) => void;
  onReady?: (instance: FootprintGlobe) => void;
}
```

## FootprintError

```ts
class FootprintError extends Error {
  readonly code: FootprintErrorCode;
  readonly detail?: unknown;
  readonly userMessage: string;
}

type FootprintErrorCode =
  | 'CONFIG_INVALID'
  | 'DATA_LOAD_FAILED'
  | 'WEBGL_UNSUPPORTED'
  | 'MAPLIBRE_MISSING'
  | 'RENDER_FAILED';
```

## 常量

```ts
const DEFAULT_STYLE: string;
const DEFAULT_MAPLIBRE_URL: string;
const DEFAULT_CENTER: [number, number];
const DEFAULT_ZOOM: number;
const DEFAULT_FOG: FogConfig;
const DEFAULT_CATEGORY_COLORS: Record<string, string>;
const DEFAULT_CATEGORY_LABELS: Record<string, string>;
const LIMITS: {
  MAX_PINS: 1000;
  MAX_FILE_SIZE: 1048576;
  MAX_NAME_LEN: 200;
  MAX_NOTE_LEN: 500;
  MAX_PHOTOS: 5;
  MAX_CATEGORIES: 8;
};
```

## 工具函数

```ts
function validateConfig(input: unknown): FootprintError[];
function normalizeConfig(input: unknown): FootprintConfig;
function loadData(options?: LoadOptions): Promise<LoadResult>;
function parseCsv(text: string): LoadResult;
function parseGeoJson(input: unknown): LoadResult;
function isFootprintError(e: unknown): e is FootprintError;
```
