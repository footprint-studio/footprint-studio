/**
 * 足迹地球 · 自定义元素 <footprint-globe>
 * 契约依据：《Sprint 2 执行方案》§4.1、§6 S2-1 / S2-4、§8 S2-12
 * 决策：S2-Q1 Shadow DOM open；S2-Q9 disconnect 自动 destroy
 */

import { FootprintGlobe, loadData, validateConfig, type FootprintConfig } from 'footprint-globe';
import { mergeAttributeConfig, parseAttributes } from './attributes';
import { getShadowStyle } from './styles';

const DEFAULT_ARIA_LABEL = '足迹地球';

export class FootprintGlobeElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return [
      'data-id',
      'data-pins',
      'data-src',
      'maplibre-url',
      'theme',
      'projection',
      'center',
      'zoom',
      'height',
      'legend',
      'autorotate',
      'attribution',
      'privacy-blur',
      'privacy-city-only',
    ];
  }

  private root: ShadowRoot;
  private container: HTMLElement;
  private instance: FootprintGlobe | null = null;
  private initToken = 0;
  private ready = false;

  constructor() {
    super();

    this.root = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = getShadowStyle();
    this.root.appendChild(style);

    this.container = document.createElement('div');
    this.container.className = 'footprint-globe';
    this.container.setAttribute('part', 'globe');
    this.root.appendChild(this.container);
  }

  connectedCallback(): void {
    // a11y：默认 role 与 aria-label（可被宿主覆盖）
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'region');
    }
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', DEFAULT_ARIA_LABEL);
    }
    void this.init();
  }

  disconnectedCallback(): void {
    this.destroy();
  }

  attributeChangedCallback(): void {
    if (!this.instance || !this.ready) return;
    // 简化：属性变更时只同步 config（数据源变更需手动重挂载）
    const attrs = parseAttributes(this);
    if (attrs.config) {
      this.instance.update({ config: attrs.config });
    }
    if (attrs.height) {
      this.container.style.setProperty('--fp-globe-height', attrs.height);
    }
  }

  private async init(): Promise<void> {
    if (this.ready || this.instance) return;
    const token = ++this.initToken;

    try {
      const attrs = parseAttributes(this);
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
          this.renderError('未提供数据源：请设置 data-pins、data-src 或 window.FOOTPRINT_PINS');
          return;
        }
        const r = await loadData({ globalVar: 'FOOTPRINT_PINS' });
        baseConfig = r.config;
      }

      if (token !== this.initToken) return; // 已取消

      const config = mergeAttributeConfig(baseConfig, attrs);

      const errs = validateConfig(config);
      if (errs.length > 0) {
        this.renderError(errs[0]!.userMessage);
        return;
      }

      if (attrs.height) {
        this.container.style.setProperty('--fp-globe-height', attrs.height);
      }

      this.instance = new FootprintGlobe(this.container, {
        config,
        maplibreUrl: attrs.maplibreUrl,
        onReady: () => {
          this.ready = true;
          this.dispatchEvent(new CustomEvent('fp-ready', { bubbles: true }));
        },
        onError: (err) => {
          this.dispatchEvent(new CustomEvent('fp-error', { detail: err, bubbles: true }));
        },
      });
    } catch (e) {
      if (token !== this.initToken) return;
      const msg = e instanceof Error ? e.message : String(e);
      this.renderError(msg);
    }
  }

  private renderError(msg: string): void {
    this.container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'footprint-error';
    div.setAttribute('part', 'error');
    div.setAttribute('role', 'alert');
    div.textContent = msg;
    this.container.appendChild(div);
  }

  // ===== 对外方法（S2-4） =====

  update(config: Partial<FootprintConfig>): void {
    this.instance?.update(config);
  }

  destroy(): void {
    this.initToken++;
    this.ready = false;
    this.instance?.destroy();
    this.instance = null;
  }

  getInstance(): FootprintGlobe | null {
    return this.instance;
  }
}

export function register(): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get('footprint-globe')) {
    customElements.define('footprint-globe', FootprintGlobeElement);
  }
}
