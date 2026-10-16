/**
 * 足迹地球 · MapLibre 封装
 * 契约依据：ADR-0001 决策 7、《Sprint 1 执行方案》§7 S1-7
 * 唯一直接调用 maplibregl 的模块。
 */

import { DEFAULT_FOG } from './config/defaults';
import type { RenderConfig } from './config/schema';
import { FootprintError } from './errors';
import type * as maplibregl from 'maplibre-gl';

type MaplibreModule = typeof maplibregl;

interface FootprintGlobeOptionsLike {
  maplibre?: MaplibreModule;
  maplibreUrl?: string;
}

const DEFAULT_MAPLIBRE_URL = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5/dist/maplibre-gl.js';

const MAPLIBRE_CSS_URL = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5/dist/maplibre-gl.css';

/** 动态加载 maplibre-gl CSS（仅一次） */
function ensureMaplibreCss(url = MAPLIBRE_CSS_URL): void {
  const marker = 'data-fp-maplibre-css';
  if (document.querySelector(`link[${marker}]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.setAttribute(marker, '1');
  document.head.appendChild(link);
}

/** 动态加载 maplibre-gl JS */
function loadMaplibreFromUrl(url: string): Promise<MaplibreModule> {
  const g = globalThis as unknown as { maplibregl?: MaplibreModule };
  if (g.maplibregl) {
    ensureMaplibreCss();
    return Promise.resolve(g.maplibregl);
  }

  return new Promise((resolve, reject) => {
    const marker = 'data-fp-maplibre-js';
    const existing = document.querySelector<HTMLScriptElement>(`script[${marker}]`);

    const done = () => {
      if (g.maplibregl) {
        ensureMaplibreCss();
        resolve(g.maplibregl);
      } else {
        reject(new FootprintError('MAPLIBRE_MISSING', 'maplibregl 未挂载到 window'));
      }
    };

    if (existing) {
      existing.addEventListener('load', done, { once: true });
      existing.addEventListener(
        'error',
        () => reject(new FootprintError('MAPLIBRE_MISSING', 'script 加载失败')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.setAttribute(marker, '1');
    script.addEventListener('load', done, { once: true });
    script.addEventListener(
      'error',
      () => reject(new FootprintError('MAPLIBRE_MISSING', 'script 加载失败')),
      { once: true },
    );
    document.head.appendChild(script);
  });
}

/**
 * 运行时解析 MapLibre 模块。
 * 优先级（ADR-0001 决策 7）：
 *   1. options.maplibre（显式传入）
 *   2. window.maplibregl（全局）
 *   3. options.maplibreUrl / config.maplibreUrl（CDN）
 *   4. 失败 → 抛出 MAPLIBRE_MISSING
 */
export async function resolveMaplibre(
  options: FootprintGlobeOptionsLike,
  config: RenderConfig = {},
): Promise<MaplibreModule> {
  if (options.maplibre) {
    ensureMaplibreCss();
    return options.maplibre;
  }
  const g = globalThis as unknown as { maplibregl?: MaplibreModule };
  if (g.maplibregl) {
    ensureMaplibreCss();
    return g.maplibregl;
  }
  const url = options.maplibreUrl ?? config.maplibreUrl ?? DEFAULT_MAPLIBRE_URL;
  return loadMaplibreFromUrl(url);
}

export class MapController {
  private container: HTMLElement;
  private maplibre: MaplibreModule;
  private config: RenderConfig;
  private map: unknown = null;

  constructor(container: HTMLElement, maplibre: MaplibreModule, config: RenderConfig) {
    this.container = container;
    this.maplibre = maplibre;
    this.config = config;
  }

  init(): void {
    const Map = this.maplibre.Map;
    const map = new Map({
      container: this.container,
      style: this.config.style!,
      center: this.config.center!,
      zoom: this.config.zoom!,
      pitch: this.config.pitch ?? 0,
      bearing: this.config.bearing ?? 0,
      dragRotate: true,
      touchPitch: true,
      attributionControl: { compact: true },
    });

    this.map = map;

    // style.load 后再设置投影与 fog
    (map as { on: (ev: string, cb: () => void) => void }).on('style.load', () => {
      this.applyProjection(this.config.projection ?? 'globe');
      this.applyFog(this.config.fog ?? DEFAULT_FOG);
    });
  }

  applyProjection(type: 'globe' | 'mercator'): void {
    if (!this.map) return;
    (this.map as { setProjection: (o: { type: string }) => void }).setProjection({ type });
  }

  applyFog(fog: RenderConfig['fog']): void {
    if (!this.map || !fog) return;
    // MapLibre GL v5 移除了 setFog（大气效果改由 setSky 承担），且两者属性名不同：
    //   fog:  color / high-color / space-color / horizon-blend
    //   sky:  horizon-color / sky-color / fog-color / horizon-fog-blend
    // 能力探测：优先 setFog（v4 及兼容层），降级 setSky（v5，做属性名映射），均无则跳过。
    const m = this.map as unknown as {
      setFog?: (o: unknown) => void;
      setSky?: (o: unknown) => void;
    };
    try {
      if (typeof m.setFog === 'function') {
        m.setFog({
          color: fog.color ?? 'rgba(0,0,0,0)',
          'high-color': fog['high-color'] ?? 'rgba(255,255,255,0.1)',
          'space-color': fog['space-color'] ?? 'rgba(0,0,0,0)',
          'horizon-blend': fog['horizon-blend'] ?? 0,
        });
      } else if (typeof m.setSky === 'function') {
        m.setSky({
          'horizon-color': fog.color ?? 'rgba(0,0,0,0)',
          'sky-color': fog['high-color'] ?? 'rgba(0,0,0,0)',
          'fog-color': fog['space-color'] ?? 'rgba(0,0,0,0)',
          'horizon-fog-blend': fog['horizon-blend'] ?? 0,
        });
      }
    } catch {
      // 大气效果失败不阻断地图初始化
    }
  }

  getMap(): unknown {
    return this.map;
  }

  destroy(): void {
    if (!this.map) return;
    try {
      (this.map as { remove: () => void }).remove();
    } catch {
      /* noop */
    }
    this.map = null;
  }
}
