/**
 * 足迹地球 · 主类
 * 契约依据：《Sprint 1 执行方案》§4.2、§7 S1-14
 */

import { normalizeConfig } from './config/normalize';
import type { Category, FootprintConfig, Pin, RenderConfig } from './config/schema';
import { validateConfig } from './config/validate';
import { FootprintError } from './errors';
import { ListView } from './fallback/list-view';
import { LegendView } from './legend-view';
import { MapController, resolveMaplibre } from './map-controller';
import { MarkerLayer } from './marker-layer';
import { PopupManager } from './popup-manager';
import { applyPrivacy } from './privacy';
import { ThemeManager } from './theme-manager';
import type * as maplibregl from 'maplibre-gl';

type MaplibreModule = typeof maplibregl;

export interface FootprintGlobeOptions {
  config: FootprintConfig;
  maplibre?: MaplibreModule;
  maplibreUrl?: string;
  onError?: (err: FootprintError) => void;
  onReady?: (instance: FootprintGlobe) => void;
}

type EventName = 'ready' | 'error' | 'marker:click';
type Handler = (...args: never[]) => void;

/** 检测 WebGL 支持 */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const g = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!g;
  } catch {
    return false;
  }
}

export class FootprintGlobe {
  private container: HTMLElement;
  private options: FootprintGlobeOptions;
  private config: FootprintConfig | null = null;

  private mapController: MapController | null = null;
  private markerLayer: MarkerLayer | null = null;
  private popupManager: PopupManager | null = null;
  private legendView: LegendView | null = null;
  private themeManager: ThemeManager | null = null;
  private listView: ListView | null = null;

  private listeners = new Map<EventName, Set<Handler>>();
  private destroyed = false;
  private ready = false;

  constructor(container: HTMLElement, options: FootprintGlobeOptions) {
    this.container = container;
    this.options = options;
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      const errs = validateConfig(this.options.config);
      if (errs.length > 0) {
        this.fail(errs[0]!);
        return;
      }

      let config = normalizeConfig(this.options.config);

      // 应用隐私
      const privacy = config.config?.privacy;
      if (privacy && ((privacy.blur ?? 0) > 0 || privacy.cityOnly)) {
        config = {
          ...config,
          categories: config.categories.map((c) => ({
            ...c,
            pins: applyPrivacy(c.pins, privacy),
          })),
        };
      }
      this.config = config;

      // WebGL 检测
      if (!detectWebGL()) {
        this.renderFallback('当前浏览器不支持 3D 渲染，已切换为列表视图。');
        this.emitError(new FootprintError('WEBGL_UNSUPPORTED'));
        return;
      }

      // 解析 MapLibre
      let maplibre: MaplibreModule;
      try {
        maplibre = await resolveMaplibre(
          { maplibre: this.options.maplibre, maplibreUrl: this.options.maplibreUrl },
          config.config ?? {},
        );
      } catch (e) {
        const err = e instanceof FootprintError ? e : new FootprintError('MAPLIBRE_MISSING', e);
        this.renderFallback('地图引擎加载失败，已切换为列表视图。');
        this.emitError(err);
        return;
      }

      if (this.destroyed) return;

      // 初始化地图
      this.mapController = new MapController(this.container, maplibre, config.config ?? {});
      this.mapController.init();

      // 主题
      this.themeManager = new ThemeManager(this.container);
      this.themeManager.apply(config.config?.theme ?? 'light');

      // Popup
      this.popupManager = new PopupManager(maplibre);

      // 标记
      this.markerLayer = new MarkerLayer({
        maplibre,
        map: this.mapController.getMap(),
        popup: this.popupManager,
        onPinClick: (pin, category) => this.emit('marker:click', pin, category),
      });
      this.markerLayer.render(config.categories);

      // 图例
      if (config.config?.legend !== false) {
        this.legendView = new LegendView(this.container);
        this.legendView.render(config.categories);
      }

      // 点击空白关闭
      const map = this.mapController.getMap() as { on?: (ev: string, cb: () => void) => void };
      map?.on?.('click', () => this.popupManager?.close());

      // 底图/瓦片加载失败诊断（如网络不可达 tiles.openfreemap.org）
      let styleErrorReported = false;
      map?.on?.('error', (...args: unknown[]) => {
        if (styleErrorReported) return;
        const e = args[0] as { error?: Error } | undefined;
        const msg = e?.error?.message ?? '';
        if (!/style|tile|fetch|network|Failed/i.test(msg)) return;
        styleErrorReported = true;
        this.emitError(
          new FootprintError(
            'DATA_LOAD_FAILED',
            e?.error ?? new Error(msg),
            `底图加载失败：当前网络可能无法访问默认瓦片源（tiles.openfreemap.org）。可在配置 config.style 中切换为可访问的瓦片样式，或自托管瓦片。`,
          ),
        );
      });

      this.ready = true;
      this.emit('ready');
      this.options.onReady?.(this);

      // 首帧后校正一次画布尺寸：
      // 容器若在初始化瞬间被浏览器缩放/字体加载等影响而误测，
      // canvas 会残留错误的内联 px 尺寸，这里强制对齐当前容器。
      requestAnimationFrame(() => {
        if (this.destroyed) return;
        try {
          (map as { resize?: () => void }).resize?.();
        } catch {
          /* noop */
        }
      });
    } catch (e) {
      this.fail(e);
    }
  }

  private renderFallback(reason: string): void {
    if (!this.config) return;
    this.listView = new ListView({
      container: this.container,
      categories: this.config.categories,
      reason,
    });
    this.listView.render();
  }

  private fail(e: unknown): void {
    const err = e instanceof FootprintError ? e : new FootprintError('RENDER_FAILED', e);
    console.error('[footprint-globe]', err);
    this.emitError(err);
  }

  /** 触发 error 事件并回调 onError */
  private emitError(err: FootprintError): void {
    this.emit('error', err);
    this.options.onError?.(err);
  }

  update(partial: Partial<FootprintConfig>): void {
    if (this.destroyed || !this.config) return;
    if (!this.ready) return;

    const merged: FootprintConfig = {
      version: 1,
      dataId: partial.dataId ?? this.config.dataId,
      categories: partial.categories ?? this.config.categories,
      config: { ...(this.config.config ?? {}), ...(partial.config ?? {}) },
      routes: partial.routes ?? this.config.routes,
    };

    const errs = validateConfig(merged);
    if (errs.length > 0) {
      this.fail(errs[0]!);
      return;
    }

    let next = normalizeConfig(merged);
    const privacy = next.config?.privacy;
    if (privacy && ((privacy.blur ?? 0) > 0 || privacy.cityOnly)) {
      next = {
        ...next,
        categories: next.categories.map((c) => ({
          ...c,
          pins: applyPrivacy(c.pins, privacy),
        })),
      };
    }
    this.config = next;

    // 重渲染
    this.markerLayer?.render(next.categories);
    if (this.legendView) {
      this.legendView.render(next.categories);
    } else if (next.config?.legend !== false) {
      this.legendView = new LegendView(this.container);
      this.legendView.render(next.categories);
    } else {
      this.legendView = null;
    }

    const theme = next.config?.theme ?? 'light';
    this.themeManager?.apply(theme);

    const projection = next.config?.projection ?? 'globe';
    this.mapController?.applyProjection(projection);
    this.mapController?.applyFog(next.config?.fog);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.markerLayer?.destroy();
    this.markerLayer = null;

    this.legendView?.destroy();
    this.legendView = null;

    this.popupManager?.destroy();
    this.popupManager = null;

    this.themeManager?.destroy();
    this.themeManager = null;

    this.listView?.destroy();
    this.listView = null;

    this.mapController?.destroy();
    this.mapController = null;

    this.listeners.clear();
    this.ready = false;
  }

  getMap(): unknown {
    return this.mapController?.getMap() ?? null;
  }

  getConfig(): Readonly<FootprintConfig> {
    if (!this.ready || !this.config) throw new Error('FootprintGlobe not initialized');
    return this.config;
  }

  on(event: 'ready', handler: () => void): () => void;
  on(event: 'error', handler: (err: FootprintError) => void): () => void;
  on(event: 'marker:click', handler: (pin: Pin, category: Category) => void): () => void;
  on(event: EventName, handler: Handler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  private emit(event: EventName, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((h) => {
      try {
        (h as (...a: unknown[]) => void)(...args);
      } catch (e) {
        console.error('[footprint-globe] listener error', e);
      }
    });
  }
}

export type { RenderConfig };
