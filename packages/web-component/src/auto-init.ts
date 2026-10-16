/**
 * 足迹地球 · auto-init 扫描
 * 契约依据：《Sprint 2 执行方案》§4.3、§7 S2-5
 *
 * 用法：
 *   <script type="module" src=".../embed.js"></script>
 *   <div class="footprint-globe" data-pins="..."></div>
 *
 * 行为：
 * - 扫描 .footprint-globe
 * - 若为 <footprint-globe>，跳过（由自定义元素接管）
 * - 否则作为容器挂载 FootprintGlobe 实例
 * - 用 data-fp-bound 防止重复初始化
 * - 不监听 DOM 变化（v1.1 加 MutationObserver）
 */

import { FootprintGlobe, loadData, validateConfig, type FootprintConfig } from 'footprint-globe';
import { mergeAttributeConfig, parseAttributes } from './attributes';
import { register } from './element';

const BOUND_ATTR = 'data-fp-bound';
const SELECTOR = '.footprint-globe';

function isCustomElement(el: Element): boolean {
  return el.tagName.toLowerCase() === 'footprint-globe';
}

function renderError(container: HTMLElement, msg: string): void {
  container.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'footprint-error';
  div.textContent = msg;
  container.appendChild(div);
}

async function initOne(el: HTMLElement): Promise<void> {
  if (el.hasAttribute(BOUND_ATTR)) return;
  el.setAttribute(BOUND_ATTR, '1');

  if (isCustomElement(el)) return;

  try {
    const attrs = parseAttributes(el);
    let baseConfig: FootprintConfig;

    if (attrs.id || attrs.src || attrs.pins) {
      const r = await loadData({
        id: attrs.id,
        src: attrs.src,
        data: attrs.pins,
      });
      baseConfig = r.config;
    } else {
      const g = (globalThis as { FOOTPRINT_PINS?: unknown }).FOOTPRINT_PINS;
      if (!g) {
        renderError(el, '未提供数据源：请设置 data-pins、data-src 或 window.FOOTPRINT_PINS');
        return;
      }
      const r = await loadData({ globalVar: 'FOOTPRINT_PINS' });
      baseConfig = r.config;
    }

    const config = mergeAttributeConfig(baseConfig, attrs);

    const errs = validateConfig(config);
    if (errs.length > 0) {
      renderError(el, errs[0]!.userMessage);
      return;
    }

    if (attrs.height) {
      el.style.setProperty('--fp-globe-height', attrs.height);
    }

    new FootprintGlobe(el, {
      config,
      maplibreUrl: attrs.maplibreUrl,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    renderError(el, msg);
  }
}

/** 扫描并初始化所有未绑定的 .footprint-globe */
export function autoInit(root: ParentNode = document): void {
  const nodes = root.querySelectorAll<HTMLElement>(SELECTOR);
  nodes.forEach((el) => void initOne(el));
}

/** 引导入口：注册自定义元素 + 自动扫描 */
export function boot(): void {
  register();

  if (typeof document === 'undefined') return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoInit(), { once: true });
  } else {
    autoInit();
  }
}
