/**
 * 足迹地球 · 模板统一入口
 */

export type TemplateKind = 'web-component' | 'iframe' | 'npm';

export { generateWebComponent, type WebComponentTemplateOptions } from './web-component';
export { generateIframe, toBase64Url, type IframeTemplateOptions } from './iframe';
export { generateNpm, type NpmTemplateOptions } from './npm';

export const TEMPLATE_LABELS: Record<TemplateKind, string> = {
  'web-component': 'Web Component',
  iframe: 'iframe',
  npm: 'NPM',
};

export const TEMPLATE_DESCRIPTIONS: Record<TemplateKind, string> = {
  'web-component': '推荐。零构建，直接放入 HTML，样式自动隔离（Shadow DOM）。',
  iframe: '兼容性最好。通过 iframe 嵌入，高度自适应。',
  npm: '适合 React / Vue / Astro 等有构建工具的项目。',
};
