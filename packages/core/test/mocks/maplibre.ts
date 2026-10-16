/**
 * 足迹地球 · MapLibre mock
 * 契约依据：《Sprint 1 执行方案》§8 S1-15
 * - setMaplibre(impl) 注入，不污染 window
 * - on('style.load') 初始化后自动 emit
 * - 提供 getMapOptions / getMarkers / getPopups / reset
 */

export interface MockMapOptions {
  container: HTMLElement;
  style?: string;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  dragRotate?: boolean;
  touchPitch?: boolean;
  attributionControl?: unknown;
}

export class MockMarker {
  element: HTMLElement;
  lnglat: [number, number] | null = null;
  map: unknown = null;
  removed = false;
  constructor(options: { element: HTMLElement; anchor?: string }) {
    this.element = options.element;
  }
  setLngLat(c: [number, number]): this {
    this.lnglat = c;
    return this;
  }
  addTo(map: unknown): this {
    this.map = map;
    return this;
  }
  remove(): this {
    this.removed = true;
    return this;
  }
}

export class MockPopup {
  options: Record<string, unknown>;
  text = '';
  lnglat: [number, number] | null = null;
  added = false;
  constructor(options: Record<string, unknown> = {}) {
    this.options = options;
  }
  setText(t: string): this {
    this.text = t;
    return this;
  }
  setLngLat(c: [number, number]): this {
    this.lnglat = c;
    return this;
  }
  addTo(_map: unknown): this {
    this.added = true;
    return this;
  }
  remove(): this {
    this.added = false;
    return this;
  }
}

export class MockMap {
  options: MockMapOptions;
  handlers = new Map<string, Array<() => void>>();
  removed = false;
  projection: unknown = null;
  fog: unknown = null;

  constructor(options: MockMapOptions) {
    this.options = options;
  }
  on(ev: string, cb: () => void): this {
    if (!this.handlers.has(ev)) this.handlers.set(ev, []);
    this.handlers.get(ev)!.push(cb);
    if (ev === 'style.load') {
      // 初始化后自动 emit，覆盖投影/fog 逻辑
      queueMicrotask(() => {
        try {
          cb();
        } catch {
          /* noop */
        }
      });
    }
    return this;
  }
  emit(ev: string): this {
    (this.handlers.get(ev) ?? []).forEach((cb) => cb());
    return this;
  }
  setProjection(o: unknown): this {
    this.projection = o;
    return this;
  }
  setFog(o: unknown): this {
    this.fog = o;
    return this;
  }
  remove(): this {
    this.removed = true;
    return this;
  }
}

export interface MockMaplibreHandle {
  maplibre: {
    Map: typeof MockMap;
    Marker: typeof MockMarker;
    Popup: typeof MockPopup;
  };
  getMapOptions: () => MockMapOptions | null;
  getMarkers: () => MockMarker[];
  getPopups: () => MockPopup[];
  reset: () => void;
}

/**
 * 创建 mock maplibre 句柄。
 * 每次测试调用一次，隔离状态。
 */
export function createMockMaplibre(): MockMaplibreHandle {
  const markers: MockMarker[] = [];
  const popups: MockPopup[] = [];
  let lastMap: MockMap | null = null;

  /* eslint-disable @typescript-eslint/no-this-alias */
  class TrackedMap extends MockMap {
    constructor(options: MockMapOptions) {
      super(options);
      lastMap = this;
    }
  }
  /* eslint-enable @typescript-eslint/no-this-alias */

  class TrackedMarker extends MockMarker {
    override addTo(map: unknown): this {
      super.addTo(map);
      markers.push(this);
      return this;
    }
  }

  class TrackedPopup extends MockPopup {
    override addTo(map: unknown): this {
      super.addTo(map);
      if (!popups.includes(this)) popups.push(this);
      return this;
    }
  }

  return {
    maplibre: {
      Map: TrackedMap as unknown as typeof MockMap,
      Marker: TrackedMarker as unknown as typeof MockMarker,
      Popup: TrackedPopup as unknown as typeof MockPopup,
    },
    getMapOptions: () => lastMap?.options ?? null,
    getMarkers: () => markers.slice(),
    getPopups: () => popups.filter((p) => p.added),
    reset: () => {
      markers.length = 0;
      popups.length = 0;
      lastMap = null;
    },
  };
}
