/**
 * 足迹地球 · Builder 顶栏操作
 * 契约依据：《Sprint 3 执行方案》§9 S3-8 / S3-10
 * 决策：S3-Q7=B（导入前提示确认）
 */

import type { BuilderState } from '../state';
import { encodeShare, buildShareUrl } from '../share';

export interface HeaderActionsHandlers {
  onImportFile: (file: File) => void;
  onExportFile: () => void;
  onReset: () => void;
  onNotice: (msg: string) => void;
}

export class HeaderActions {
  private root: HTMLElement;
  private handlers: HeaderActionsHandlers;
  private shareBtn: HTMLButtonElement | null = null;
  private fileInput: HTMLInputElement | null = null;
  private _state: BuilderState | null = null;

  constructor(handlers: HeaderActionsHandlers) {
    this.handlers = handlers;
    this.root = document.createElement('div');
    this.root.className = 'builder-header__actions';
  }

  get element(): HTMLElement {
    return this.root;
  }

  mount(): void {
    this.root.innerHTML = `
      <button type="button" class="builder-btn" data-action="share">分享链接</button>
      <button type="button" class="builder-btn" data-action="import">导入</button>
      <button type="button" class="builder-btn" data-action="export">导出 JSON</button>
      <button type="button" class="builder-btn" data-action="reset">清空</button>
      <input type="file" accept="application/json,.json" hidden />
    `;

    this.shareBtn = this.root.querySelector<HTMLButtonElement>('[data-action="share"]');
    this.fileInput = this.root.querySelector<HTMLInputElement>('input[type="file"]');

    this.root.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      switch (action) {
        case 'share':
          void this.handleShare();
          break;
        case 'import':
          this.fileInput?.click();
          break;
        case 'export':
          this.handlers.onExportFile();
          break;
        case 'reset':
          this.handlers.onReset();
          break;
      }
    });

    this.fileInput?.addEventListener('change', () => {
      const file = this.fileInput?.files?.[0];
      if (file) this.handlers.onImportFile(file);
      // 清空 value 允许再次选择同一文件
      if (this.fileInput) this.fileInput.value = '';
    });
  }

  private async handleShare(): Promise<void> {
    const state = this._state;
    if (!state) return;

    const result = encodeShare(state);
    if (!result.ok) {
      this.handlers.onNotice(result.reason);
      return;
    }

    const url = buildShareUrl(result.hash);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        this.handlers.onNotice('分享链接已复制到剪贴板');
      } else {
        // 兜底：弹 prompt
        window.prompt('复制下方链接：', url);
      }
    } catch {
      window.prompt('复制下方链接：', url);
    }
  }

  update(state: BuilderState): void {
    this._state = state;
    const hasContent = !!state.raw.trim() || state.config !== null;
    if (this.shareBtn) this.shareBtn.disabled = !hasContent;
  }
}
