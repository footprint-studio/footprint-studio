import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { register } from '../../src/web/element';
import type { FootprintGlobeElement } from '../../src/web/element';

function disableWebGL() {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
}

const VALID_PINS = JSON.stringify({
  version: 1,
  categories: [
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [{ name: '东京', coords: [139.759, 35.682] }],
    },
  ],
});

/**
 * 挂载元素并让 core 走「WebGL 可用 + mock maplibre」的完整 ready 路径。
 * 需要：1) getContext 返回伪对象；2) window.maplibregl 注入 mock。
 */
async function enableMaplibreAndWait(el: FootprintGlobeElement): Promise<void> {
  disableWebGL();
  HTMLCanvasElement.prototype.getContext = vi
    .fn()
    .mockReturnValue(
      {} as unknown as RenderingContext,
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  const { createMockMaplibre } = await import('../mocks/maplibre');
  const handle = createMockMaplibre();
  (globalThis as { maplibregl?: unknown }).maplibregl = handle.maplibre;

  document.body.appendChild(el);
  await new Promise((r) => setTimeout(r, 50));
}

describe('FootprintGlobeElement · theme & a11y', () => {
  beforeEach(() => {
    register();
    vi.restoreAllMocks();
    disableWebGL();
    delete (globalThis as { maplibregl?: unknown }).maplibregl;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    delete (globalThis as { maplibregl?: unknown }).maplibregl;
  });

  it('defaults role="region" and aria-label', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    document.body.appendChild(e);
    expect(e.getAttribute('role')).toBe('region');
    expect(e.getAttribute('aria-label')).toBe('足迹地球');
  });

  it('respects custom aria-label', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('aria-label', '我的旅行足迹');
    document.body.appendChild(e);
    expect(e.getAttribute('aria-label')).toBe('我的旅行足迹');
  });

  it('respects custom role', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('role', 'figure');
    document.body.appendChild(e);
    expect(e.getAttribute('role')).toBe('figure');
  });

  it('shadow root has part="globe"', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    expect(e.shadowRoot!.querySelector('[part="globe"]')).not.toBeNull();
  });

  it('injects host style with --fp-* variables', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    const style = e.shadowRoot!.querySelector('style')!;
    expect(style.textContent).toMatch(/--fp-globe-height/);
    expect(style.textContent).toMatch(/--fp-marker-color/);
  });

  it('error element has part="error" and role="alert"', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 20));
    const err = e.shadowRoot!.querySelector('[part="error"]');
    expect(err).not.toBeNull();
    expect(err!.getAttribute('role')).toBe('alert');
  });

  it('applies theme attribute to config', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('data-pins', VALID_PINS);
    e.setAttribute('theme', 'dark');
    document.body.appendChild(e);
    await enableMaplibreAndWait(e);

    const container = e.shadowRoot!.querySelector<HTMLElement>('[part="globe"]')!;
    // 主题通过 data-fp-theme 施加在容器上（由 ThemeManager）
    expect(container.getAttribute('data-fp-theme')).toBe('dark');
  });

  it('dispatches fp-ready when WebGL is available', async () => {
    const el = document.createElement('footprint-globe') as FootprintGlobeElement;
    el.setAttribute('data-pins', VALID_PINS);
    const onReady = vi.fn();
    el.addEventListener('fp-ready', onReady);
    await enableMaplibreAndWait(el);

    expect(onReady).toHaveBeenCalled();
    expect(el.getInstance()).not.toBeNull();
  });

  it('attributeChangedCallback syncs config after ready', async () => {
    const el = document.createElement('footprint-globe') as FootprintGlobeElement;
    el.setAttribute('data-pins', VALID_PINS);
    await enableMaplibreAndWait(el);

    const instance = el.getInstance()!;
    expect(instance).not.toBeNull();
    el.setAttribute('legend', 'false');
    // update 已被调用，config.legend 应变为 false
    expect(instance.getConfig().config?.legend).toBe(false);
  });

  it('attributeChangedCallback also syncs height after ready', async () => {
    const el = document.createElement('footprint-globe') as FootprintGlobeElement;
    el.setAttribute('data-pins', VALID_PINS);
    await enableMaplibreAndWait(el);

    const container = el.shadowRoot!.querySelector<HTMLElement>('[part="globe"]')!;
    el.setAttribute('height', '520px');
    expect(container.style.getPropertyValue('--fp-globe-height')).toBe('520px');
  });

  it('destroy removes data-fp-theme through instance teardown', async () => {
    const el = document.createElement('footprint-globe') as FootprintGlobeElement;
    el.setAttribute('data-pins', VALID_PINS);
    await enableMaplibreAndWait(el);

    const container = el.shadowRoot!.querySelector<HTMLElement>('[part="globe"]')!;
    expect(container.getAttribute('data-fp-theme')).toBe('light');

    el.destroy();
    expect(el.getInstance()).toBeNull();
    expect(container.getAttribute('data-fp-theme')).toBeNull();
  });

  it('destroy clears the pending init token so late load is ignored', async () => {
    const el = document.createElement('footprint-globe') as FootprintGlobeElement;
    el.setAttribute('data-pins', VALID_PINS);
    document.body.appendChild(el);
    // 立刻 destroy，未等待异步 init 完成
    el.destroy();
    await new Promise((r) => setTimeout(r, 30));
    expect(el.getInstance()).toBeNull();
  });
});
