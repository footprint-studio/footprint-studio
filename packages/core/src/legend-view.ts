/**
 * 足迹地球 · 图例
 * 契约依据：《Sprint 1 执行方案》§7 S1-10、《Sprint 3 执行方案》§6 S3-0a
 */

import type { Category } from './config/schema';

export class LegendView {
  private container: HTMLElement;
  private root: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(categories: Category[]): void {
    this.destroy();

    const root = document.createElement('div');
    root.className = 'footprint-legend';
    root.setAttribute('role', 'list');
    root.setAttribute('part', 'legend'); // S3-0a
    root.setAttribute('aria-label', '图例');

    for (const cat of categories) {
      const item = document.createElement('span');
      item.className = 'footprint-legend__item';
      item.setAttribute('role', 'listitem');

      const dot = document.createElement('i');
      dot.className = 'footprint-legend__dot';
      dot.setAttribute('aria-hidden', 'true');
      dot.style.setProperty('--fp-marker-color', cat.color);

      const label = document.createElement('span');
      label.textContent = cat.label;

      item.appendChild(dot);
      item.appendChild(label);
      root.appendChild(item);
    }

    this.container.appendChild(root);
    this.root = root;
  }

  destroy(): void {
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
  }
}
