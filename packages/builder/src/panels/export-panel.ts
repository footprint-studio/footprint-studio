/**
 * 足迹地球 · Builder 导出面板
 * 契约依据：《Sprint 3 执行方案》§8 S3-6 / S3-6a / S3-6b
 */

import type { FootprintConfig } from 'footprint-globe';
import type { BuilderState, ExportType } from '../state';
import {
  generateIframe,
  generateNpm,
  generateWebComponent,
  TEMPLATE_DESCRIPTIONS,
  TEMPLATE_LABELS,
  type TemplateKind,
} from '../templates';
import {
  byteLength,
  formatBytes,
  recommend,
  recommendedExportType,
  recommendText,
  type Recommendation,
} from '../recommend';

export interface ExportPanelHandlers {
  onExportTypeChange: (type: ExportType) => void;
}

const ORDER: TemplateKind[] = ['web-component', 'iframe', 'npm'];

export class ExportPanel {
  private root: HTMLElement;
  private handlers: ExportPanelHandlers;
  private codeEl: HTMLElement | null = null;
  private tabsEl: HTMLElement | null = null;
  private bannerEl: HTMLElement | null = null;
  private copyBtn: HTMLButtonElement | null = null;
  private lastCode = '';
  private copyTimer: number | null = null;
  private currentType: ExportType = 'web-component';

  constructor(handlers: ExportPanelHandlers) {
    this.handlers = handlers;
    this.root = document.createElement('section');
    this.root.className = 'builder-panel builder-panel--export';
    this.root.setAttribute('aria-label', '导出面板');
  }

  get element(): HTMLElement {
    return this.root;
  }

  mount(): void {
    this.root.innerHTML = `
      <header class="builder-panel__header">
        <h2 class="builder-panel__title">导出</h2>
      </header>
      <div class="builder-panel__body">
        <div class="builder-recommend" role="status" aria-live="polite" hidden></div>
        <div class="builder-tabs builder-tabs--full" role="tablist"></div>
        <p class="builder-export-desc"></p>
        <div class="builder-code-wrap">
          <pre class="builder-code" tabindex="0"><code></code></pre>
          <button
            type="button"
            class="builder-btn builder-btn--copy"
            aria-label="复制代码">复制</button>
        </div>
      </div>
    `;

    this.tabsEl = this.root.querySelector<HTMLElement>('.builder-tabs');
    this.codeEl = this.root.querySelector<HTMLElement>('.builder-code code');
    this.bannerEl = this.root.querySelector<HTMLElement>('.builder-recommend');
    this.copyBtn = this.root.querySelector<HTMLButtonElement>('.builder-btn--copy');

    this.renderTabs();
    this.bindEvents();
  }

  private renderTabs(): void {
    if (!this.tabsEl) return;
    this.tabsEl.innerHTML = '';
    for (const kind of ORDER) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'builder-tab';
      btn.dataset.exportType = kind;
      btn.setAttribute('role', 'tab');
      btn.textContent = TEMPLATE_LABELS[kind];
      this.tabsEl.appendChild(btn);
    }
  }

  private bindEvents(): void {
    this.root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      const tab = target.closest<HTMLButtonElement>('.builder-tab');
      if (tab?.dataset.exportType) {
        this.handlers.onExportTypeChange(tab.dataset.exportType as ExportType);
        return;
      }

      if (target.closest('.builder-btn--copy')) {
        void this.copy();
      }
    });
  }

  private async copy(): Promise<void> {
    if (!this.lastCode) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(this.lastCode);
      } else {
        this.fallbackCopy(this.lastCode);
      }
      this.showCopyFeedback('已复制');
    } catch {
      this.fallbackCopy(this.lastCode);
      this.showCopyFeedback('已复制');
    }
  }

  private fallbackCopy(text: string): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch {
      /* noop */
    }
    document.body.removeChild(ta);
  }

  private showCopyFeedback(msg: string): void {
    if (!this.copyBtn) return;
    const original = this.copyBtn.textContent ?? '复制';
    this.copyBtn.textContent = msg;
    if (this.copyTimer !== null) window.clearTimeout(this.copyTimer);
    this.copyTimer = window.setTimeout(() => {
      if (this.copyBtn) this.copyBtn.textContent = original;
      this.copyTimer = null;
    }, 1500);
  }

  update(state: BuilderState): void {
    this.currentType = state.exportType;
    const config = state.config;

    // Tab 激活态
    if (this.tabsEl) {
      this.tabsEl.querySelectorAll<HTMLElement>('.builder-tab').forEach((tab) => {
        if (tab.dataset.exportType === state.exportType) {
          tab.dataset.active = '1';
          tab.setAttribute('aria-selected', 'true');
        } else {
          delete tab.dataset.active;
          tab.setAttribute('aria-selected', 'false');
        }
      });
    }

    // 说明
    const descEl = this.root.querySelector<HTMLElement>('.builder-export-desc');
    if (descEl) {
      descEl.textContent = TEMPLATE_DESCRIPTIONS[state.exportType as TemplateKind] ?? '';
    }

    // 推荐横幅
    this.renderBanner(config);

    // 代码
    if (!config || config.categories.length === 0) {
      this.lastCode = '';
      if (this.codeEl) this.codeEl.textContent = '请先在左侧输入数据。';
      return;
    }

    const code = this.generate(state);
    this.lastCode = code;
    if (this.codeEl) this.codeEl.textContent = code;
  }

  private renderBanner(config: FootprintConfig | null): void {
    if (!this.bannerEl) return;
    if (!config || config.categories.length === 0) {
      this.bannerEl.hidden = true;
      return;
    }

    const json = JSON.stringify(config);
    const bytes = byteLength(json);
    const rec = recommend(json);
    const recommendedType = recommendedExportType(rec);

    this.bannerEl.hidden = false;
    this.bannerEl.dataset.recommendation = rec;

    const isMatch = this.currentType === recommendedType;
    const actionHtml = !isMatch
      ? `<button type="button" class="builder-btn builder-btn--mini" data-recommend-action="${recommendedType}">切换到推荐</button>`
      : '';

    this.bannerEl.innerHTML = `
      <span class="builder-recommend__size">${formatBytes(bytes)}</span>
      <span class="builder-recommend__text">${recommendText(rec, bytes)}</span>
      ${actionHtml}
    `;

    // 绑定「切换到推荐」
    const btn = this.bannerEl.querySelector<HTMLButtonElement>('[data-recommend-action]');
    btn?.addEventListener('click', () => {
      const t = btn.dataset.recommendAction as ExportType | undefined;
      if (t) this.handlers.onExportTypeChange(t);
    });
  }

  private generate(state: BuilderState): string {
    const config = state.config!;
    const json = JSON.stringify(config);
    const rec: Recommendation = recommend(json);

    switch (state.exportType) {
      case 'web-component':
        return generateWebComponent({ config, recommendation: rec });
      case 'iframe':
        return generateIframe({ config, recommendation: rec });
      case 'npm':
        return generateNpm({ config });
    }
  }
}
