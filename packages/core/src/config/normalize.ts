/**
 * 足迹地球 · 配置归一化
 * 契约依据：PRD v1.1 §4.5、《Sprint 1 执行方案》§6 S1-3
 */

import {
  DEFAULT_CATEGORY_COLORS,
  DEFAULT_CATEGORY_LABELS,
  DEFAULT_CENTER,
  DEFAULT_FOG,
  DEFAULT_MAPLIBRE_URL,
  DEFAULT_STYLE,
  DEFAULT_ZOOM,
} from './defaults';
import type { Category, FootprintConfig, Pin, RenderConfig } from './schema';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** 检测旧格式 { residence: [], travel: [] } */
function isLegacyFormat(input: unknown): input is { residence?: unknown; travel?: unknown } {
  if (!isObject(input)) return false;
  if (input.version === 1) return false;
  if (Array.isArray(input.categories)) return false;
  return Array.isArray(input.residence) || Array.isArray(input.travel);
}

/** 将旧格式的 pins 归一化为 Pin[] */
function normalizePins(raw: unknown): Pin[] {
  if (!Array.isArray(raw)) return [];
  const out: Pin[] = [];
  for (const item of raw) {
    if (!isObject(item)) continue;
    if (typeof item.name !== 'string') continue;
    if (!Array.isArray(item.coords) || item.coords.length !== 2) continue;
    const [lng, lat] = item.coords;
    if (typeof lng !== 'number' || typeof lat !== 'number') continue;
    const pin: Pin = { name: item.name, coords: [lng, lat] };
    if (typeof item.date === 'string') pin.date = item.date;
    if (typeof item.note === 'string') pin.note = item.note;
    if (Array.isArray(item.photos)) {
      pin.photos = item.photos.filter((p): p is string => typeof p === 'string');
    }
    out.push(pin);
  }
  return out;
}

/** 旧格式 → v1 categories */
function normalizeLegacy(input: { residence?: unknown; travel?: unknown }): Category[] {
  const cats: Category[] = [];
  if (Array.isArray(input.residence) && input.residence.length > 0) {
    cats.push({
      id: 'residence',
      label: DEFAULT_CATEGORY_LABELS.residence!,
      color: DEFAULT_CATEGORY_COLORS.residence!,
      pins: normalizePins(input.residence),
    });
  }
  if (Array.isArray(input.travel) && input.travel.length > 0) {
    cats.push({
      id: 'travel',
      label: DEFAULT_CATEGORY_LABELS.travel!,
      color: DEFAULT_CATEGORY_COLORS.travel!,
      pins: normalizePins(input.travel),
    });
  }
  return cats;
}

/** 将 v1 分类补全为完整 Category */
function normalizeCategory(raw: unknown): Category | null {
  if (!isObject(raw)) return null;
  if (typeof raw.id !== 'string' || typeof raw.label !== 'string') return null;
  if (typeof raw.color !== 'string') return null;
  const cat: Category = {
    id: raw.id,
    label: raw.label,
    color: raw.color,
    pins: normalizePins(raw.pins),
  };
  if (raw.icon === 'dot' || raw.icon === 'pin' || raw.icon === 'star') {
    cat.icon = raw.icon;
  }
  return cat;
}

/** 填充 RenderConfig 默认值 */
function normalizeRenderConfig(raw: unknown): RenderConfig {
  const rc: RenderConfig = isObject(raw) ? { ...raw } : {};
  rc.projection ??= 'globe';
  rc.theme ??= 'light';
  rc.style ??= DEFAULT_STYLE;
  rc.maplibreUrl ??= DEFAULT_MAPLIBRE_URL;
  rc.center ??= DEFAULT_CENTER;
  rc.zoom ??= DEFAULT_ZOOM;
  rc.pitch ??= 0;
  rc.bearing ??= 0;
  rc.legend ??= true;
  rc.autorotate ??= false;
  rc.attribution ??= false;
  rc.fog ??= DEFAULT_FOG;
  rc.privacy ??= { blur: 0, cityOnly: false };
  return rc;
}

/**
 * 将任意输入归一化为 v1 FootprintConfig。
 * - 已 v1：补默认值
 * - 旧格式：转换 + 补默认值
 * - 其他：尽力转换（交给 validate 兜底）
 */
export function normalizeConfig(input: unknown): FootprintConfig {
  if (isLegacyFormat(input)) {
    return {
      version: 1,
      categories: normalizeLegacy(input),
      config: normalizeRenderConfig(undefined),
    };
  }

  if (isObject(input) && Array.isArray(input.categories)) {
    const cfg: FootprintConfig = {
      version: 1,
      categories: input.categories.map(normalizeCategory).filter((c): c is Category => c !== null),
      config: normalizeRenderConfig(input.config),
    };
    if (typeof input.dataId === 'string') cfg.dataId = input.dataId;
    if (Array.isArray(input.routes)) cfg.routes = input.routes as FootprintConfig['routes'];
    return cfg;
  }

  return {
    version: 1,
    categories: [],
    config: normalizeRenderConfig(undefined),
  };
}
