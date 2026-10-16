/**
 * 足迹地球 · 标记渲染与交互
 * 契约依据：《Sprint 1 执行方案》§7 S1-8、§15 S1-Q4（使用 <button>）
 */

import type { Category, Pin } from './config/schema';
import type { PopupManager } from './popup-manager';
import type * as maplibregl from 'maplibre-gl';

type MaplibreModule = typeof maplibregl;

interface MarkerLayerOptions {
  maplibre: MaplibreModule;
  map: unknown;
  popup: PopupManager;
  onPinClick?: (pin: Pin, category: Category) => void;
}

interface MarkerHandle {
  el: HTMLButtonElement;
  destroy: () => void;
}

export class MarkerLayer {
  private maplibre: MaplibreModule;
  private map: unknown;
  private popup: PopupManager;
  private onPinClick?: (pin: Pin, category: Category) => void;
  private handles: MarkerHandle[] = [];

  constructor(opts: MarkerLayerOptions) {
    this.maplibre = opts.maplibre;
    this.map = opts.map;
    this.popup = opts.popup;
    this.onPinClick = opts.onPinClick;
  }

  render(categories: Category[]): void {
    this.clear();

    for (const category of categories) {
      for (const pin of category.pins) {
        this.addMarker(pin, category);
      }
    }
  }

  private addMarker(pin: Pin, category: Category): void {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'footprint-marker';
    el.style.setProperty('--fp-marker-color', category.color);
    el.setAttribute('aria-label', pin.name);
    el.dataset.category = category.id;

    const open = () => {
      this.popup.open(this.map, pin.coords, pin.name);
    };
    const close = () => {
      this.popup.close();
    };
    const onClick = (e: MouseEvent) => {
      e.stopPropagation();
      open();
      this.onPinClick?.(pin, category);
    };

    el.addEventListener('mouseenter', open);
    el.addEventListener('mouseleave', close);
    el.addEventListener('focus', open);
    el.addEventListener('blur', close);
    el.addEventListener('click', onClick);

    const marker = new this.maplibre.Marker({ element: el, anchor: 'center' });
    marker.setLngLat(pin.coords).addTo(this.map as never);

    this.handles.push({
      el,
      destroy: () => {
        el.removeEventListener('mouseenter', open);
        el.removeEventListener('mouseleave', close);
        el.removeEventListener('focus', open);
        el.removeEventListener('blur', close);
        el.removeEventListener('click', onClick);
        el.remove();
      },
    });
  }

  clear(): void {
    for (const h of this.handles) h.destroy();
    this.handles = [];
  }

  /** 当前渲染的 marker 元素（测试用） */
  getElements(): HTMLButtonElement[] {
    return this.handles.map((h) => h.el);
  }

  destroy(): void {
    this.clear();
  }
}
