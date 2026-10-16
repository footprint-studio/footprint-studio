/**
 * 足迹地球 · 配置协议 v1 类型定义
 * 契约依据：ADR-0001、PRD v1.1 §4
 */

export interface FogConfig {
  color?: string;
  'high-color'?: string;
  'space-color'?: string;
  'horizon-blend'?: number;
}

export interface Pin {
  name: string;
  coords: [number, number];
  date?: string;
  note?: string;
  photos?: string[];
}

export interface Category {
  id: string;
  label: string;
  color: string;
  icon?: 'dot' | 'pin' | 'star';
  pins: Pin[];
}

export interface Route {
  from: [number, number];
  to: [number, number];
  type: 'flight' | 'train' | 'drive';
  date?: string;
  color?: string;
}

export interface PrivacyConfig {
  blur?: number;
  cityOnly?: boolean;
}

export interface RenderConfig {
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

export interface FootprintConfig {
  version: 1;
  dataId?: string;
  categories: Category[];
  config?: RenderConfig;
  routes?: Route[];
}

/** 数据加载返回结构 */
export interface LoadResult {
  config: FootprintConfig;
  warnings: string[];
}

/** 数据加载入口选项（ADR-0001 决策 2） */
export interface LoadOptions {
  /** 短链 ID（v1.1 实现，v1 抛未支持） */
  id?: string;
  /** 自托管 JSON URL（必须 HTTPS） */
  src?: string;
  /** inline JSON 字符串 */
  data?: string;
  /** 全局变量名，默认 'FOOTPRINT_PINS' */
  globalVar?: string;
}
