/**
 * 足迹地球 · Builder 预览面板
 * 契约依据：《Sprint 3 执行方案》§7 S3-4
 */

import { FootprintGlobe, type FootprintConfig, type RenderConfig } from 'footprint-globe';

const RENDER_DEBOUNCE_MS = 150;

export class PreviewPanel {
  private root: HTMLElement;
  private container: HTMLElement;
  private globe: FootprintGlobe | null = null;
  private lastKey = '';
  private renderTimer: number | null = null;

  constructor() {
    this.root = document.createElement('section');
    this.root.className = 'builder-preview';
    this.root.setAttribute('aria-label', '预览');

    this.container = document.createElement('div');
    this.container.className = 'builder-preview__container';

    const frame = document.createElement('div');
    frame.className = 'builder-preview__frame';
    frame.appendChild(this.container);

    this.root.appendChild(frame);
  }

  /** 在预览顶部显示一次性警告条（如底图瓦片加载失败） */
  private showWarning(msg: string): void {
    if (this.root.querySelector('.builder-preview__warning')) return;
    const bar = document.createElement('div');
    bar.className = 'builder-preview__warning';
    bar.setAttribute('role', 'alert');
    bar.textContent = `⚠ ${msg}`;
    bar.addEventListener('click', () => bar.remove());
    this.root.prepend(bar);
  }

  get element(): HTMLElement {
    return this.root;
  }

  update(config: FootprintConfig | null, preview: Partial<RenderConfig>): void {
    if (!config || config.categories.length === 0) {
      this.cancelPending();
      this.destroyGlobe();
      this.renderPlaceholder('请在左侧粘贴数据或加载示例。');
      this.lastKey = '';
      return;
    }

    const merged: FootprintConfig = {
      ...config,
      config: { ...config.config, ...preview },
    };

    const key = JSON.stringify(merged);
    if (key === this.lastKey) return;
    this.lastKey = key;

    this.cancelPending();
    this.renderTimer = window.setTimeout(() => {
      this.renderTimer = null;
      this.renderNow(merged);
    }, RENDER_DEBOUNCE_MS);
  }

  private renderNow(config: FootprintConfig): void {
    this.destroyGlobe();
    this.container.innerHTML = '';

    this.globe = new FootprintGlobe(this.container, {
      config,
      onError: (err) => {
        // 无 WebGL 时 core 会降级列表，不阻断编辑
        console.warn('[builder] preview error:', err);
        if (err.code === 'DATA_LOAD_FAILED') {
          this.showWarning(err.userMessage);
        }
      },
    });
  }

  private renderPlaceholder(msg: string): void {
    this.container.innerHTML = '';
    const p = document.createElement('div');
    p.className = 'builder-preview__placeholder';
    p.textContent = msg;
    this.container.appendChild(p);
  }

  private cancelPending(): void {
    if (this.renderTimer !== null) {
      window.clearTimeout(this.renderTimer);
      this.renderTimer = null;
    }
  }

  private destroyGlobe(): void {
    if (this.globe) {
      try {
        this.globe.destroy();
      } catch {
        /* noop */
      }
      this.globe = null;
    }
  }

  destroy(): void {
    this.cancelPending();
    this.destroyGlobe();
  }
}
