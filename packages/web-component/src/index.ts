/**
 * 足迹地球 · Web Component 包入口
 * 契约依据：《Sprint 2 执行方案》§6 / §7
 *
 * 使用：
 *   // 仅注册自定义元素
 *   import { register } from '@footprint-studio/web-component';
 *   register();
 *
 *   // 或：注册 + 自动扫描 .footprint-globe
 *   import '@footprint-studio/web-component/auto';
 */

export { FootprintGlobeElement, register } from './element';
export { autoInit, boot } from './auto-init';
export { parseAttributes, mergeAttributeConfig } from './attributes';
export { getShadowStyle, SHADOW_CSS } from './styles';

export const WC_VERSION = '0.0.0';
