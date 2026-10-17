/**
 * 足迹地球 · Web Component 模板
 * 契约依据：《Sprint 3 执行方案》§4.2
 */

import type { FootprintConfig } from 'footprint-globe';
import type { Recommendation } from '../recommend';

const CDN_AUTO = 'https://cdn.jsdelivr.net/npm/footprint-globe@1/dist/auto.js';

export interface WebComponentTemplateOptions {
  config: FootprintConfig;
  /** 数据传递方式（inline / src / id），影响生成片段 */
  recommendation: Recommendation;
  /** 当 recommendation === 'src' 时，用户提供的 JSON URL */
  srcUrl?: string;
  /** 用户自定义高度（px） */
  height?: number;
}

/** 从 config 中提取渲染相关属性 */
function attrsFromConfig(config: FootprintConfig, height?: number): string[] {
  const rc = config.config ?? {};
  const attrs: string[] = [];

  if (rc.theme) attrs.push(`  theme="${rc.theme}"`);
  if (rc.projection) attrs.push(`  projection="${rc.projection}"`);
  if (rc.center) attrs.push(`  center="${rc.center[0]},${rc.center[1]}"`);
  if (rc.zoom !== undefined) attrs.push(`  zoom="${rc.zoom}"`);
  if (rc.legend !== undefined) attrs.push(`  legend="${rc.legend}"`);
  if (rc.autorotate !== undefined) attrs.push(`  autorotate="${rc.autorotate}"`);
  if (height !== undefined) attrs.push(`  height="${height}px"`);

  return attrs;
}

export function generateWebComponent(options: WebComponentTemplateOptions): string {
  const { config, recommendation, srcUrl, height } = options;
  const attrs = attrsFromConfig(config, height);

  let dataAttr: string;
  if (recommendation === 'inline') {
    const json = JSON.stringify(config);
    // 转义单引号（避免破坏 HTML 属性）
    const safe = json.replace(/'/g, '&#39;');
    dataAttr = `  data-pins='${safe}'`;
  } else if (recommendation === 'src' && srcUrl) {
    dataAttr = `  data-src="${escapeAttr(srcUrl)}"`;
  } else if (recommendation === 'id' && config.dataId) {
    dataAttr = `  data-id="${escapeAttr(config.dataId)}"`;
  } else {
    // 退化：inline
    const json = JSON.stringify(config);
    const safe = json.replace(/'/g, '&#39;');
    dataAttr = `  data-pins='${safe}'`;
  }

  const lines = [
    `<script type="module" src="${CDN_AUTO}"></script>`,
    '',
    `<footprint-globe`,
    dataAttr,
    ...attrs,
    `></footprint-globe>`,
  ];

  return lines.join('\n');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
