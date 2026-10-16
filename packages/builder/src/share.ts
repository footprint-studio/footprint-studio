/**
 * 足迹地球 · Builder 分享链接
 * 契约依据：《Sprint 3 执行方案》§4.4、§9 S3-10
 * 决策：S3-Q5=A（参数名 s）
 */

import type { BuilderState } from './state';

const SHARE_PARAM = 's';
const MAX_BYTES = 4 * 1024; // 4KB

export interface SharePayload {
  raw: string;
  preview: BuilderState['preview'];
  source?: BuilderState['source'];
  exportType?: BuilderState['exportType'];
}

export type EncodeResult = { ok: true; hash: string } | { ok: false; reason: string };

/** 计算 UTF-8 字节长度 */
function byteLength(s: string): number {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
  return s.length;
}

/** UTF-8 安全 base64url 编码 */
export function encodeBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, i + CHUNK);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** base64url 解码为 UTF-8 字符串 */
export function decodeBase64Url(s: string): string {
  const normalized = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

/** 从 state 编码为分享参数（`?s=xxx` 的 `xxx` 部分） */
export function encodeShare(state: BuilderState): EncodeResult {
  if (!state.raw.trim() && Object.keys(state.preview).length === 0) {
    return { ok: false, reason: '暂无可分享的内容' };
  }

  const payload: SharePayload = {
    raw: state.raw,
    preview: state.preview,
  };
  if (state.source && state.source !== 'json') payload.source = state.source;
  if (state.exportType && state.exportType !== 'web-component') {
    payload.exportType = state.exportType;
  }

  const json = JSON.stringify(payload);
  const encoded = encodeBase64Url(json);
  if (byteLength(encoded) > MAX_BYTES) {
    return { ok: false, reason: '配置过大（> 4KB），请改用「导出 JSON」分享' };
  }
  return { ok: true, hash: `?${SHARE_PARAM}=${encoded}` };
}

/** 从 URL 解码分享参数（接受含 `?` 或不含） */
export function decodeShare(input: string): SharePayload | null {
  let encoded = '';
  try {
    const url = input.startsWith('http')
      ? new URL(input)
      : new URL(input.startsWith('?') ? input : `?${input}`, 'https://placeholder.local');
    encoded = url.searchParams.get(SHARE_PARAM) ?? '';
  } catch {
    return null;
  }
  if (!encoded) return null;

  try {
    const json = decodeBase64Url(encoded);
    const parsed = JSON.parse(json) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as { raw?: unknown }).raw !== 'string'
    ) {
      return null;
    }
    return parsed as SharePayload;
  } catch {
    return null;
  }
}

/** 构造完整分享 URL（基于当前 location） */
export function buildShareUrl(hash: string): string {
  const base =
    typeof location !== 'undefined'
      ? `${location.origin}${location.pathname}`
      : 'https://builder.footprint-studio.dev/';
  return `${base}${hash}`;
}
