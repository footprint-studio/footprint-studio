/**
 * 足迹地球 · 降级列表视图
 * 契约依据：ADR-0001 决策 3、《Sprint 1 执行方案》§7 S1-21
 * WebGL 不可用或 MapLibre 缺失时渲染。
 */

import type { Category } from '../config/schema';

export interface ListViewOptions {
  container: HTMLElement;
  categories: Category[];
  reason: string;
}

export class ListView {
  private container: HTMLElement;
  private categories: Category[];
  private reason: string;
  private root: HTMLElement | null = null;

  constructor(opts: ListViewOptions) {
    this.container = opts.container;
    this.categories = opts.categories;
    this.reason = opts.reason;
  }

  render(): void {
    this.destroy();

    const root = document.createElement('div');
    root.className = 'footprint-list';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', '足迹列表');
    root.setAttribute('part', 'list'); // S3-0a

    const notice = document.createElement('p');
    notice.className = 'footprint-list__notice';
    notice.textContent = this.reason;
    root.appendChild(notice);

    for (const cat of this.categories) {
      if (cat.pins.length === 0) continue;

      const group = document.createElement('section');
      group.className = 'footprint-list__group';
      group.style.setProperty('--fp-marker-color', cat.color);

      const heading = document.createElement('h3');
      heading.className = 'footprint-list__heading';

      const dot = document.createElement('i');
      dot.className = 'footprint-legend__dot';
      dot.setAttribute('aria-hidden', 'true');

      heading.appendChild(dot);
      heading.appendChild(document.createTextNode(cat.label));
      group.appendChild(heading);

      const ul = document.createElement('ul');
      ul.className = 'footprint-list__items';

      for (const pin of cat.pins) {
        const li = document.createElement('li');
        li.className = 'footprint-list__item';
        li.textContent = pin.name;
        if (pin.note) {
          li.title = pin.note;
        }
        ul.appendChild(li);
      }

      group.appendChild(ul);
      root.appendChild(group);
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
