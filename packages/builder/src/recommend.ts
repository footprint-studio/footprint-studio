/**
 * 足迹地球 · 数据量推荐
 * 契约依据：《Sprint 3 执行方案》§4.3、§8 S3-6a
 */

export type Recommendation = 'inline' | 'src' | 'id';

const INLINE_LIMIT = 2 * 1024; // 2 KB
const SRC_LIMIT = 50 * 1024; // 50 KB

/** 计算字符串的 UTF-8 字节长度 */
export function byteLength(s: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(s).length;
  }
  // fallback：近似估算（中文按 3 字节）
  let len = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code < 0x80) len += 1;
    else if (code < 0x800) len += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      len += 4;
      i++;
    } else len += 3;
  }
  return len;
}

/** 根据 JSON 字符串长度给出推荐 */
export function recommend(json: string): Recommendation {
  const bytes = byteLength(json);
  if (bytes < INLINE_LIMIT) return 'inline';
  if (bytes < SRC_LIMIT) return 'src';
  return 'id';
}

/** 推荐对应的中文说明 */
export function recommendText(rec: Recommendation, bytes: number): string {
  const size = formatBytes(bytes);
  switch (rec) {
    case 'inline':
      return `数据约 ${size}，推荐使用 data-pins 直接内联到 HTML。`;
    case 'src':
      return `数据约 ${size}，推荐将 JSON 部署到静态服务器，通过 data-src 引用。`;
    case 'id':
      return `数据约 ${size}，推荐使用短链托管（v1.1）或 data-src 引用外部 JSON。`;
  }
}

/** 可读的字节显示 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** 推荐对应的导出类型（仅提示，不强制） */
export function recommendedExportType(rec: Recommendation): 'web-component' | 'iframe' {
  return rec === 'id' ? 'iframe' : 'web-component';
}
