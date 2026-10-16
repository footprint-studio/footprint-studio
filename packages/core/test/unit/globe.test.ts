import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FootprintGlobe } from '../../src/globe';
import { createMockMaplibre } from '../mocks/maplibre';
import { configBasic, configMulti } from '../fixtures/config-basic';

/** 让 detectWebGL 返回 true */
function enableWebGL() {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((type: string) =>
    type === 'webgl' || type === 'experimental-webgl' ? ({} as never) : null,
  );
}

/** 让 detectWebGL 返回 false */
function disableWebGL() {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
}

describe('FootprintGlobe', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls onError for invalid config', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onError = vi.fn();
    new FootprintGlobe(container, {
      config: { version: 1, categories: [] },
      onError,
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(onError).toHaveBeenCalled();
  });

  it('falls back to ListView when WebGL unsupported', async () => {
    disableWebGL();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onError = vi.fn();
    new FootprintGlobe(container, {
      config: configBasic,
      onError,
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(container.querySelector('.footprint-list')).not.toBeNull();
    expect(onError).toHaveBeenCalled();
  });

  it('initializes with mock maplibre', async () => {
    enableWebGL();
    const handle = createMockMaplibre();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onReady = vi.fn();
    const globe = new FootprintGlobe(container, {
      config: configBasic,
      maplibre: handle.maplibre as never,
      onReady,
    });
    await new Promise((r) => setTimeout(r, 10));
    expect(onReady).toHaveBeenCalled();
    expect(handle.getMarkers()).toHaveLength(3);
    expect(container.querySelector('.footprint-legend')).not.toBeNull();
    globe.destroy();
  });

  it('applies theme data attribute', async () => {
    enableWebGL();
    const handle = createMockMaplibre();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const globe = new FootprintGlobe(container, {
      config: { ...configBasic, config: { theme: 'dark' } },
      maplibre: handle.maplibre as never,
    });
    await new Promise((r) => setTimeout(r, 10));
    expect(container.getAttribute('data-fp-theme')).toBe('dark');
    globe.destroy();
  });

  it('update re-renders markers', async () => {
    enableWebGL();
    const handle = createMockMaplibre();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const globe = new FootprintGlobe(container, {
      config: configBasic,
      maplibre: handle.maplibre as never,
    });
    await new Promise((r) => setTimeout(r, 10));
    globe.update({ categories: configMulti.categories });
    const legendItems = container.querySelectorAll('.footprint-legend__item');
    expect(legendItems).toHaveLength(2);
    globe.destroy();
  });

  it('destroy removes all DOM and listeners', async () => {
    enableWebGL();
    const handle = createMockMaplibre();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const globe = new FootprintGlobe(container, {
      config: configBasic,
      maplibre: handle.maplibre as never,
    });
    await new Promise((r) => setTimeout(r, 10));
    globe.destroy();
    expect(container.querySelector('.footprint-legend')).toBeNull();
  });

  it('on returns unsubscribe function', () => {
    const container = document.createElement('div');
    const globe = new FootprintGlobe(container, {
      config: configBasic,
      maplibre: createMockMaplibre().maplibre as never,
    });
    const unsub = globe.on('ready', () => {});
    expect(typeof unsub).toBe('function');
    unsub();
    globe.destroy();
  });

  it('getConfig throws before init complete', () => {
    const container = document.createElement('div');
    const globe = new FootprintGlobe(container, {
      config: configBasic,
      maplibre: createMockMaplibre().maplibre as never,
    });
    // 初始化是异步的，这里立刻调用会抛错或返回空
    expect(() => globe.getConfig()).toThrow();
    globe.destroy();
  });
});
