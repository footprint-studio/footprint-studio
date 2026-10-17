/**
 * 足迹地球 · Web Component 属性解析
 * 契约依据：《Sprint 2 执行方案》§4.1、§6 S2-3
 */

import type { FootprintConfig, RenderConfig } from '../index';

export interface ParsedAttributes {
  id?: string;
  pins?: string;
  src?: string;
  maplibreUrl?: string;
  config?: Partial<RenderConfig>;
  height?: string;
}

function parseBool(v: string | null): boolean | undefined {
  if (v === null) return undefined;
  if (v === 'true' || v === '1' || v === '') return true;
  if (v === 'false' || v === '0') return false;
  return undefined;
}

function parseNumber(v: string | null): number | undefined {
  if (v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseCenter(v: string | null): [number, number] | undefined {
  if (!v) return undefined;
  const parts = v.split(',').map((s) => Number(s.trim()));
  if (parts.length !== 2) return undefined;
  const [lng, lat] = parts;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return undefined;
  return [lng!, lat!];
}

/**
 * 从宿主元素读取所有 footprint-globe 相关属性。
 * 非法值静默忽略，由 core 使用默认值兜底。
 */
export function parseAttributes(el: HTMLElement): ParsedAttributes {
  const out: ParsedAttributes = {};

  const id = el.getAttribute('data-id');
  if (id) out.id = id;

  const pins = el.getAttribute('data-pins');
  if (pins) out.pins = pins;

  const src = el.getAttribute('data-src');
  if (src) out.src = src;

  const maplibreUrl = el.getAttribute('maplibre-url');
  if (maplibreUrl) out.maplibreUrl = maplibreUrl;

  const height = el.getAttribute('height');
  if (height) out.height = height;

  const cfg: Partial<RenderConfig> = {};

  const theme = el.getAttribute('theme');
  if (theme === 'light' || theme === 'dark' || theme === 'auto') cfg.theme = theme;

  const projection = el.getAttribute('projection');
  if (projection === 'globe' || projection === 'mercator') cfg.projection = projection;

  const center = parseCenter(el.getAttribute('center'));
  if (center) cfg.center = center;

  const zoom = parseNumber(el.getAttribute('zoom'));
  if (zoom !== undefined) cfg.zoom = zoom;

  const legend = parseBool(el.getAttribute('legend'));
  if (legend !== undefined) cfg.legend = legend;

  const autorotate = parseBool(el.getAttribute('autorotate'));
  if (autorotate !== undefined) cfg.autorotate = autorotate;

  const attribution = parseBool(el.getAttribute('attribution'));
  if (attribution !== undefined) cfg.attribution = attribution;

  const privacy: { blur?: number; cityOnly?: boolean } = {};
  const blur = parseNumber(el.getAttribute('privacy-blur'));
  if (blur !== undefined) privacy.blur = blur;
  const cityOnly = parseBool(el.getAttribute('privacy-city-only'));
  if (cityOnly !== undefined) privacy.cityOnly = cityOnly;
  if (Object.keys(privacy).length > 0) cfg.privacy = privacy;

  if (Object.keys(cfg).length > 0) out.config = cfg;

  return out;
}

/** 合并属性 config 到已有 config（属性优先） */
export function mergeAttributeConfig(
  base: FootprintConfig,
  attrs: ParsedAttributes,
): FootprintConfig {
  if (!attrs.config) return base;
  return {
    ...base,
    config: { ...(base.config ?? {}), ...attrs.config },
  };
}
