/**
 * 足迹地球 · 公共 API
 * 契约依据：ADR-0001、《Sprint 1 执行方案》§4
 */

export const VERSION = '0.0.0';

// 类型
export type {
  FootprintConfig,
  Category,
  Pin,
  RenderConfig,
  Route,
  FogConfig,
  PrivacyConfig,
  LoadResult,
  LoadOptions,
} from './config/schema';
export type { FootprintGlobeOptions } from './globe';

// 错误
export { FootprintError, isFootprintError, configError, dataError } from './errors';
export type { FootprintErrorCode } from './errors';

// 配置
export { validateConfig, assertValidConfig } from './config/validate';
export { normalizeConfig } from './config/normalize';
export {
  DEFAULT_STYLE,
  DEFAULT_MAPLIBRE_URL,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  DEFAULT_FOG,
  DEFAULT_CATEGORY_COLORS,
  DEFAULT_CATEGORY_LABELS,
  LIMITS,
} from './config/defaults';

// 数据
export { loadData } from './data/loader';
export { parseCsv } from './data/csv';
export { parseGeoJson } from './data/geojson';

// 核心类
export { FootprintGlobe } from './globe';

// 子模块（进阶用法）
export { resolveMaplibre } from './map-controller';
export { applyPrivacy } from './privacy';
export { ListView } from './fallback/list-view';
export { ThemeManager, styleForTheme } from './theme-manager';

// Web Component（原 @footprint-studio/web-component，v1 起合并进本包）
export { FootprintGlobeElement, register } from './web/element';
export { autoInit, boot } from './web/auto-init';
export { parseAttributes, mergeAttributeConfig } from './web/attributes';
export { getShadowStyle, SHADOW_CSS } from './web/styles';
