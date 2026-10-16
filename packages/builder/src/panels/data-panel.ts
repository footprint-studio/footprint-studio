/**
 * 足迹地球 · Builder 数据面板
 * 契约依据：《Sprint 3 执行方案》§6 S3-2
 */

import type { BuilderState, DataSource } from '../state';
import { listExamples } from '../examples';

export interface DataPanelHandlers {
  onRawChange: (raw: string, source: DataSource) => void;
  onSourceChange: (source: DataSource) => void;
  onLoadExample: (id: string) => void;
}

export class DataPanel {
  private root: HTMLElement;
  private handlers: DataPanelHandlers;
  private textarea: HTMLTextAreaElement | null = null;
  private errorsEl: HTMLElement | null = null;
  private warningsEl: HTMLElement | null = null;
  private debounceTimer: number | null = null;

  constructor(handlers: DataPanelHandlers) {
    this.handlers = handlers;
    this.root = document.createElement('section');
    this.root.className = 'builder-panel';
    this.root.setAttribute('aria-label', '数据面板');
  }

  get element(): HTMLElement {
    return this.root;
  }

  mount(): void {
    this.root.innerHTML = `
      <header class="builder-panel__header">
        <h2 class="builder-panel__title">数据</h2>
        <div class="builder-tabs" role="tablist">
          <button type="button" class="builder-tab" data-source="json" role="tab">JSON</button>
          <button type="button" class="builder-tab" data-source="csv" role="tab">CSV</button>
          <button type="button" class="builder-tab" data-source="example" role="tab">示例</button>
        </div>
      </header>
      <div class="builder-panel__body">
        <div class="builder-data-input">
          <textarea
            class="builder-textarea"
            rows="10"
            spellcheck="false"
            placeholder="粘贴 JSON 或 CSV 数据，或切换到「示例」标签加载模板。"
            aria-label="数据输入"></textarea>
        </div>
        <div class="builder-data-examples" hidden>
          <p class="builder-hint">选择一个示例模板快速开始：</p>
          <div class="builder-example-list"></div>
        </div>
        <div class="builder-errors" role="alert" aria-live="polite" hidden></div>
        <div class="builder-warnings" role="status" aria-live="polite" hidden></div>
      </div>
    `;

    this.textarea = this.root.querySelector<HTMLTextAreaElement>('.builder-textarea');
    this.errorsEl = this.root.querySelector<HTMLElement>('.builder-errors');
    this.warningsEl = this.root.querySelector<HTMLElement>('.builder-warnings');

    this.bindEvents();
    this.renderExamples();
  }

  private bindEvents(): void {
    this.root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      const tab = target.closest<HTMLButtonElement>('.builder-tab');
      if (tab) {
        const source = tab.dataset.source as DataSource | undefined;
        if (source) this.handlers.onSourceChange(source);
        return;
      }

      const exampleBtn = target.closest<HTMLButtonElement>('.builder-example-btn');
      if (exampleBtn) {
        const id = exampleBtn.dataset.example;
        if (id) this.handlers.onLoadExample(id);
      }
    });

    this.textarea?.addEventListener('input', () => {
      if (this.debounceTimer !== null) window.clearTimeout(this.debounceTimer);
      const source = this.currentSource();
      this.debounceTimer = window.setTimeout(() => {
        this.handlers.onRawChange(this.textarea!.value, source);
      }, 300);
    });
  }

  private currentSource(): DataSource {
    const active = this.root.querySelector<HTMLElement>('.builder-tab[data-active="1"]');
    return (active?.dataset.source as DataSource) ?? 'json';
  }

  private renderExamples(): void {
    const list = this.root.querySelector<HTMLElement>('.builder-example-list');
    if (!list) return;
    const examples = listExamples();
    list.innerHTML = '';
    for (const ex of examples) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'builder-example-btn';
      btn.dataset.example = ex.id;
      btn.innerHTML = `
        <span class="builder-example-btn__label">${ex.label}</span>
        <span class="builder-example-btn__desc">${ex.description}</span>
      `;
      list.appendChild(btn);
    }
  }

  update(state: BuilderState): void {
    // Tab 激活态
    this.root.querySelectorAll<HTMLElement>('.builder-tab').forEach((tab) => {
      if (tab.dataset.source === state.source) {
        tab.dataset.active = '1';
        tab.setAttribute('aria-selected', 'true');
      } else {
        delete tab.dataset.active;
        tab.setAttribute('aria-selected', 'false');
      }
    });

    // 数据区显隐
    const dataInput = this.root.querySelector<HTMLElement>('.builder-data-input');
    const examples = this.root.querySelector<HTMLElement>('.builder-data-examples');
    if (dataInput && examples) {
      const isExample = state.source === 'example';
      dataInput.hidden = isExample;
      examples.hidden = !isExample;
    }

    // 文本内容
    if (this.textarea && this.textarea.value !== state.raw) {
      this.textarea.value = state.raw;
    }

    // 错误
    if (this.errorsEl) {
      if (state.errors.length > 0) {
        this.errorsEl.hidden = false;
        this.errorsEl.innerHTML = state.errors
          .map((e) => `<div class="builder-error-item">${escapeHtml(e.userMessage)}</div>`)
          .join('');
      } else {
        this.errorsEl.hidden = true;
        this.errorsEl.innerHTML = '';
      }
    }

    // 警告
    if (this.warningsEl) {
      if (state.warnings.length > 0) {
        this.warningsEl.hidden = false;
        this.warningsEl.innerHTML = state.warnings
          .map((w) => `<div class="builder-warning-item">${escapeHtml(w)}</div>`)
          .join('');
      } else {
        this.warningsEl.hidden = true;
        this.warningsEl.innerHTML = '';
      }
    }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
