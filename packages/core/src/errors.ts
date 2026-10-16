/**
 * 足迹地球 · 错误体系
 * 契约：每个错误码有对应中文 userMessage，可直接展示给用户。
 */

export type FootprintErrorCode =
  | 'CONFIG_INVALID'
  | 'DATA_LOAD_FAILED'
  | 'WEBGL_UNSUPPORTED'
  | 'MAPLIBRE_MISSING'
  | 'RENDER_FAILED';

const USER_MESSAGES: Record<FootprintErrorCode, string> = {
  CONFIG_INVALID: '配置格式有误，请检查数据后重试。',
  DATA_LOAD_FAILED: '数据加载失败，请检查链接或网络后重试。',
  WEBGL_UNSUPPORTED: '当前浏览器不支持 3D 渲染，已切换为列表视图。',
  MAPLIBRE_MISSING: '地图引擎加载失败，已切换为列表视图。',
  RENDER_FAILED: '地图渲染失败，请刷新页面后重试。',
};

export class FootprintError extends Error {
  readonly code: FootprintErrorCode;
  readonly detail?: unknown;
  readonly userMessage: string;

  constructor(code: FootprintErrorCode, detail?: unknown, overrideMessage?: string) {
    const message = overrideMessage ?? USER_MESSAGES[code];
    super(`[${code}] ${message}`);
    this.name = 'FootprintError';
    this.code = code;
    this.detail = detail;
    this.userMessage = message;
  }
}

export function isFootprintError(e: unknown): e is FootprintError {
  return e instanceof FootprintError;
}

export function configError(field: string, reason: string): FootprintError {
  return new FootprintError(
    'CONFIG_INVALID',
    { field, reason },
    `配置字段 "${field}" 无效：${reason}`,
  );
}

export function dataError(reason: string, detail?: unknown): FootprintError {
  return new FootprintError('DATA_LOAD_FAILED', detail ?? reason, `数据加载失败：${reason}`);
}
