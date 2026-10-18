/**
 * 足迹地球 · iframe 模板
 * 契约依据：《Sprint 3 执行方案》§4.2、ADR-0001 决策 2
 */

import type { FootprintConfig } from 'footprint-globe';
import type { Recommendation } from '../recommend';

// 当前实际部署地址（footprint-studio.dev 尚未接入 DNS，写死会造成死链）
const DEFAULT_EMBED_BASE = 'https://footprint-studio-embed.pages.dev/';

export interface IframeTemplateOptions {
  config: FootprintConfig;
  recommendation: Recommendation;
  /** 当 recommendation === 'src' 时，用户提供的 JSON URL */
  srcUrl?: string;
  /** iframe 高度（px） */
  height?: number;
}

/** UTF-8 安全 base64url 编码 */
export function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  // 分块避免栈溢出
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, i + CHUNK);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateIframe(options: IframeTemplateOptions): string {
  const { config, recommendation, srcUrl, height } = options;
  const h = height ?? 480;

  const params = new URLSearchParams();

  if (recommendation === 'id' && config.dataId) {
    params.set('id', config.dataId);
  } else if (recommendation === 'src' && srcUrl) {
    params.set('src', srcUrl);
  } else {
    // inline base64
    params.set('data', toBase64Url(JSON.stringify(config)));
  }

  const rc = config.config ?? {};
  if (rc.theme) params.set('theme', rc.theme);
  if (rc.projection) params.set('projection', rc.projection);
  if (rc.zoom !== undefined) params.set('zoom', String(rc.zoom));
  if (rc.legend !== undefined) params.set('legend', rc.legend ? '1' : '0');
  if (rc.autorotate !== undefined) params.set('autorotate', rc.autorotate ? '1' : '0');
  params.set('height', String(h));

  // 拼接 URL：用 &amp; 保证 HTML 合法
  const query = params.toString().replace(/&/g, '&amp;');
  const url = `${DEFAULT_EMBED_BASE}?${query}`;

  const lines = [
    `<iframe`,
    `  src="${url}"`,
    `  width="100%"`,
    `  height="${h}"`,
    `  style="border:0;border-radius:12px"`,
    `  loading="lazy"`,
    `  title="我的足迹">`,
    `</iframe>`,
  ];

  return lines.join('\n');
}
