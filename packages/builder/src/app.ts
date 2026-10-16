/**
 * 足迹地球 · Builder 应用
 * 契约依据：《Sprint 3 执行方案》§6 S3-1、§7 S3-3、§8 S3-6、§9 S3-7 / S3-8 / S3-10
 */

import {
  initialState,
  reducer,
  type BuilderAction,
  type BuilderState,
  type DataSource,
} from './state';
import type { Category, FootprintConfig, RenderConfig } from 'footprint-globe';
import { DataPanel } from './panels/data-panel';
import { ConfigPanel } from './panels/config-panel';
import { PreviewPanel } from './panels/preview-panel';
import { ExportPanel } from './panels/export-panel';
import { HeaderActions } from './panels/header-actions';
import { clearDraft, createDebouncedSaver, loadDraft } from './storage';
import { decodeShare } from './share';

export class BuilderApp {
  private root: HTMLElement;
  private state: BuilderState;
  private dataPanel: DataPanel;
  private configPanel: ConfigPanel;
  private previewPanel: PreviewPanel;
  private exportPanel: ExportPanel;
  private headerActions: HeaderActions;
  private listeners = new Set<() => void>();
  private noticeEl: HTMLElement | null = null;
  private saver = createDebouncedSaver(500);
  private loadedFromUrl = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.state = initialState();

    this.dataPanel = new DataPanel({
      onRawChange: (raw, source) => this.dispatch({ type: 'set-raw', raw, source }),
      onSourceChange: (source) => this.dispatch({ type: 'set-source', source }),
      onLoadExample: (id) =>
        this.dispatch({ type: 'load-example', id: id as 'travel' | 'residence' | 'team' }),
    });

    this.configPanel = new ConfigPanel({
      onUpdateCategory: (id, patch) => this.dispatch({ type: 'update-category', id, patch }),
      onAddCategory: () => this.dispatch({ type: 'add-category' }),
      onRemoveCategory: (id) => this.dispatch({ type: 'remove-category', id }),
      onSetConfig: (patch) => this.dispatch({ type: 'set-config', patch }),
    });

    this.previewPanel = new PreviewPanel();

    this.exportPanel = new ExportPanel({
      onExportTypeChange: (exportType) => this.dispatch({ type: 'set-export-type', exportType }),
    });

    this.headerActions = new HeaderActions({
      onImportFile: (file) => void this.handleImport(file),
      onExportFile: () => this.handleExport(),
      onReset: () => this.handleReset(),
      onNotice: (msg) => this.setNotice(msg),
    });

    // 分享链接初始加载
    this.tryLoadFromUrl();
  }

  mount(): void {
    this.root.innerHTML = `
      <header class="builder-header">
        <div class="builder-header__brand">
          <h1 class="builder-header__title">足迹地球</h1>
          <span class="builder-header__subtitle">Builder</span>
        </div>
      </header>
      <div class="builder-notice" role="status" aria-live="polite" hidden></div>
      <div class="builder-body">
        <aside class="builder-sidebar"></aside>
        <main class="builder-main"></main>
      </div>
    `;

    const header = this.root.querySelector<HTMLElement>('.builder-header')!;
    this.headerActions.mount();
    header.appendChild(this.headerActions.element);

    this.noticeEl = this.root.querySelector<HTMLElement>('.builder-notice');

    this.dataPanel.mount();
    this.configPanel.mount();
    this.exportPanel.mount();

    const sidebar = this.root.querySelector<HTMLElement>('.builder-sidebar')!;
    sidebar.appendChild(this.dataPanel.element);
    sidebar.appendChild(this.configPanel.element);

    const main = this.root.querySelector<HTMLElement>('.builder-main')!;
    main.appendChild(this.previewPanel.element);
    main.appendChild(this.exportPanel.element);

    this.subscribe(() => this.render());
    this.render();

    // 从 URL 加载成功后无需再弹草稿
    if (!this.loadedFromUrl) {
      this.tryRestoreDraft();
    }

    // 卸载前 flush 草稿
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  private tryLoadFromUrl(): void {
    if (typeof location === 'undefined') return;
    const payload = decodeShare(location.search);
    if (!payload) return;

    this.state = reducer(this.state, { type: 'set-raw', raw: payload.raw });
    if (payload.source && payload.source !== 'json') {
      this.state = reducer(this.state, { type: 'set-source', source: payload.source });
    }
    if (payload.exportType) {
      this.state = reducer(this.state, {
        type: 'set-export-type',
        exportType: payload.exportType,
      });
    }
    if (payload.preview && Object.keys(payload.preview).length > 0) {
      this.state = reducer(this.state, { type: 'set-preview', preview: payload.preview });
    }
    this.loadedFromUrl = true;
    this.state = { ...this.state, notice: '已从分享链接加载配置' };
  }

  private tryRestoreDraft(): void {
    const draft = loadDraft();
    if (!draft) return;
    if (!draft.raw.trim() && Object.keys(draft.preview ?? {}).length === 0) return;

    const when = new Date(draft.savedAt).toLocaleString();
    if (!window.confirm(`检测到上次未完成的草稿（${when}），是否恢复？`)) {
      clearDraft();
      return;
    }

    this.state = reducer(this.state, { type: 'set-raw', raw: draft.raw });
    if (draft.source && draft.source !== 'json') {
      this.state = reducer(this.state, { type: 'set-source', source: draft.source });
    }
    if (draft.exportType) {
      this.state = reducer(this.state, {
        type: 'set-export-type',
        exportType: draft.exportType,
      });
    }
    if (draft.preview && Object.keys(draft.preview).length > 0) {
      this.state = reducer(this.state, { type: 'set-preview', preview: draft.preview });
    }
    this.state = { ...this.state, notice: '已恢复草稿' };
    this.render();
  }

  private async handleImport(file: File): Promise<void> {
    try {
      const text = await file.text();

      if (this.state.raw.trim() && !window.confirm('导入将覆盖当前内容，是否继续？')) {
        return;
      }

      this.dispatch({ type: 'set-raw', raw: text });
      this.setNotice(`已导入：${file.name}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.setNotice(`导入失败：${msg}`);
    }
  }

  private handleExport(): void {
    if (!this.state.config) {
      this.setNotice('无可导出的配置');
      return;
    }
    try {
      const json = JSON.stringify(this.state.config, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `footprint-config-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.setNotice('已导出 JSON');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.setNotice(`导出失败：${msg}`);
    }
  }

  private handleReset(): void {
    if (!window.confirm('确定清空当前配置吗？')) return;
    clearDraft();
    this.dispatch({ type: 'reset' });
    this.setNotice('已清空');
  }

  private handleBeforeUnload = (): void => {
    this.saver.flush(this.state);
  };

  private dispatch(action: BuilderAction): void {
    const next = reducer(this.state, action);
    if (next === this.state) return;
    this.state = next;
    this.saver.save(this.state);
    this.listeners.forEach((l) => l());
  }

  private setNotice(msg: string): void {
    this.state = { ...this.state, notice: msg };
    this.render();
  }

  private subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private render(): void {
    this.dataPanel.update(this.state);
    this.configPanel.update(this.state);
    this.previewPanel.update(this.state.config, this.state.preview);
    this.exportPanel.update(this.state);
    this.headerActions.update(this.state);

    if (this.noticeEl) {
      if (this.state.notice) {
        this.noticeEl.hidden = false;
        this.noticeEl.textContent = this.state.notice;
      } else {
        this.noticeEl.hidden = true;
        this.noticeEl.textContent = '';
      }
    }
  }

  destroy(): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    this.saver.cancel();
    this.previewPanel.destroy();
    this.listeners.clear();
  }
}

export type { BuilderState, BuilderAction, Category, FootprintConfig, RenderConfig, DataSource };
