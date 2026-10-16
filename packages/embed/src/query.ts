/**
 * 足迹地球 · Embed query 解析
 * 契约依据：《Sprint 2 执行方案》§4.4
 *
 * 支持参数：
 *   ?id=<nanoid>         短链（v1.1）
 *   &src=<https-url>     自托管 JSON
 *   &data=<base64>       inline JSON（< 4KB）
 *   &theme=light|dark|auto
 *   &projection=globe|mercator
 *   &zoom=<number>
 *   &legend=0|1
 *   &autorotate=0|1
 *   &height=<number>
 */

import type { RenderConfig } from 'footprint-globe';

export interface EmbedQuery {
  id?: string;
  src?: string;
  data?: string;
  config?: Partial<RenderConfig>;
  height?: number;
}

function parseBool(v: string | null): boolean | undefined {
  if (v === null) return undefined;
  if (v === '1' || v === 'true' || v === '') return true;
  if (v === '0' || v === 'false') return false;
  return undefined;
}

function parseNumber(v: string | null): number | undefined {
  if (v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** 解析 search 字符串（含前导 ?）为结构化 query */
export function parseQuery(search: string): EmbedQuery {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const out: EmbedQuery = {};

  const id = params.get('id');
  if (id) out.id = id;

  const src = params.get('src');
  if (src) out.src = src;

  const data = params.get('data');
  if (data) out.data = data;

  const cfg: Partial<RenderConfig> = {};

  const theme = params.get('theme');
  if (theme === 'light' || theme === 'dark' || theme === 'auto') cfg.theme = theme;

  const projection = params.get('projection');
  if (projection === 'globe' || projection === 'mercator') cfg.projection = projection;

  const zoom = parseNumber(params.get('zoom'));
  if (zoom !== undefined) cfg.zoom = zoom;

  const legend = parseBool(params.get('legend'));
  if (legend !== undefined) cfg.legend = legend;

  const autorotate = parseBool(params.get('autorotate'));
  if (autorotate !== undefined) cfg.autorotate = autorotate;

  if (Object.keys(cfg).length > 0) out.config = cfg;

  const height = parseNumber(params.get('height'));
  if (height !== undefined) out.height = height;

  return out;
}

/** 解码 base64（兼容 URL-safe 变体与 UTF-8） */
export function decodeBase64Data(b64: string): string {
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  // 处理 UTF-8
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}
