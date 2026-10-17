/**
 * 足迹地球 · Shadow DOM 样式注入
 * 契约依据：《Sprint 2 执行方案》§6 S2-2
 *
 * 构建时通过 tsup define 把 core 的 CSS 注入为 __FP_SHADOW_CSS__。
 * 运行时把 `:root` 改写为 `:host, :root`，使变量在 Shadow DOM 内生效。
 */

declare const __FP_SHADOW_CSS__: string | undefined;

const RAW: string = typeof __FP_SHADOW_CSS__ !== 'undefined' ? __FP_SHADOW_CSS__ : '';

/** 把顶层 `:root` 选择器改写为 `:host, :root`，兼容 Shadow DOM */
function adaptRootSelector(css: string): string {
  return css.replace(/(^|[^\w-]):root(\b)/g, '$1:host, :root$2');
}

export const SHADOW_CSS: string = adaptRootSelector(RAW);

/** 额外补充：Shadow DOM 内的容器基础样式（core CSS 里给的是 .footprint-globe，这里补 :host） */
const HOST_CSS = `
:host {
  display: block;
  width: 100%;
  min-height: var(--fp-globe-height, 400px);
  border-radius: var(--fp-globe-radius, 12px);
  overflow: hidden;
  background: var(--fp-globe-bg, #eef2f7);
}
`;

export function getShadowStyle(): string {
  return HOST_CSS + '\n' + SHADOW_CSS;
}
