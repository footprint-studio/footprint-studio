/**
 * 足迹地球 · 弹窗单例管理
 * 契约依据：《Sprint 1 执行方案》§7 S1-9
 */

import type * as maplibregl from 'maplibre-gl';

type MaplibreModule = typeof maplibregl;
type PopupInstance = {
  remove: () => void;
  setLngLat: (c: [number, number]) => unknown;
  setText: (t: string) => unknown;
  addTo: (m: unknown) => unknown;
};

export class PopupManager {
  private maplibre: MaplibreModule;
  private active: PopupInstance | null = null;

  constructor(maplibre: MaplibreModule) {
    this.maplibre = maplibre;
  }

  open(map: unknown, coords: [number, number], text: string): void {
    this.close();
    const popup = new this.maplibre.Popup({
      offset: 8,
      closeButton: false,
      closeOnMove: false,
      focusAfterOpen: false,
    }) as unknown as PopupInstance;
    popup.setLngLat(coords);
    popup.setText(text);
    popup.addTo(map);
    this.active = popup;
  }

  close(): void {
    if (!this.active) return;
    try {
      this.active.remove();
    } catch {
      /* noop */
    }
    this.active = null;
  }

  destroy(): void {
    this.close();
  }
}
