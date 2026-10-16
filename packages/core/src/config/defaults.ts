/**
 * 足迹地球 · 默认值常量
 */

import type { FogConfig } from './schema';

export const DEFAULT_STYLE = 'https://tiles.openfreemap.org/styles/positron';

export const DEFAULT_MAPLIBRE_URL =
  'https://cdn.jsdelivr.net/npm/maplibre-gl@5/dist/maplibre-gl.js';

export const DEFAULT_CENTER: [number, number] = [100, 30];
export const DEFAULT_ZOOM = 1.2;

export const DEFAULT_FOG: FogConfig = {
  color: 'rgba(0,0,0,0)',
  'high-color': 'rgba(255,255,255,0.1)',
  'space-color': 'rgba(0,0,0,0)',
  'horizon-blend': 0,
};

/** 已知分类的默认颜色（用于旧格式转换 / CSV / GeoJSON） */
export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  residence: '#2563eb',
  travel: '#f97316',
  default: '#6b7280',
};

/** 已知分类的默认标签 */
export const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  residence: '居住',
  travel: '旅行',
  default: '其他',
};

/** 数据边界（ADR-0001 决策 6） */
export const LIMITS = {
  MAX_PINS: 1000,
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  MAX_NAME_LEN: 200,
  MAX_NOTE_LEN: 500,
  MAX_PHOTOS: 5,
  MAX_CATEGORIES: 8,
} as const;
