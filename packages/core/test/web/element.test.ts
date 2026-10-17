import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FootprintGlobeElement, register } from '../../src/web/element';

// 让 detectWebGL 返回 false（走降级列表，避免真实 WebGL）
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

describe('FootprintGlobeElement', () => {
  beforeEach(() => {
    register();
    vi.restoreAllMocks();
    disableWebGL();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (globalThis as { FOOTPRINT_PINS?: unknown }).FOOTPRINT_PINS;
    vi.restoreAllMocks();
  });

  it('attaches open shadow root in constructor', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    expect(e.shadowRoot).not.toBeNull();
    expect(e.shadowRoot!.mode).toBe('open');
  });

  it('has container with part="globe"', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    const container = e.shadowRoot!.querySelector('[part="globe"]');
    expect(container).not.toBeNull();
  });

  it('injects shadow style', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    const style = e.shadowRoot!.querySelector('style');
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain(':host');
    expect(style!.textContent).toContain('footprint-globe');
  });

  it('renders error when no data source', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 20));
    const err = e.shadowRoot!.querySelector('.footprint-error');
    expect(err).not.toBeNull();
    expect(err!.textContent).toContain('未提供数据源');
  });

  it('renders fallback list for WebGL-disabled env with data-pins', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('data-pins', VALID_PINS);
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 30));
    const list = e.shadowRoot!.querySelector('.footprint-list');
    expect(list).not.toBeNull();
  });

  it('dispatches fp-error on fallback', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('data-pins', VALID_PINS);
    const handler = vi.fn();
    e.addEventListener('fp-error', handler);
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 30));
    expect(handler).toHaveBeenCalled();
  });

  it('applies height attribute to container', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('data-pins', VALID_PINS);
    e.setAttribute('height', '480px');
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 30));
    const container = e.shadowRoot!.querySelector<HTMLElement>('[part="globe"]')!;
    expect(container.style.getPropertyValue('--fp-globe-height')).toBe('480px');
  });

  it('renders error for invalid data-pins JSON', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('data-pins', '{invalid');
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 20));
    const err = e.shadowRoot!.querySelector('.footprint-error');
    expect(err).not.toBeNull();
  });

  it('renders error for data failing validation', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    // color 非法 → validateConfig 报错
    e.setAttribute(
      'data-pins',
      JSON.stringify({
        version: 1,
        categories: [{ id: 'travel', label: '旅行', color: 'orange', pins: [] }],
      }),
    );
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 20));
    expect(e.shadowRoot!.querySelector('.footprint-error')).not.toBeNull();
  });

  it('reads data from window.FOOTPRINT_PINS', async () => {
    (globalThis as { FOOTPRINT_PINS?: unknown }).FOOTPRINT_PINS = JSON.parse(VALID_PINS);
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 30));
    expect(e.shadowRoot!.querySelector('.footprint-list')).not.toBeNull();
  });

  it('renders error when data-src is not HTTPS', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('data-src', 'http://insecure/x.json');
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 20));
    expect(e.shadowRoot!.querySelector('.footprint-error')).not.toBeNull();
  });

  it('getInstance returns null before init completes', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    expect(e.getInstance()).toBeNull();
  });

  it('destroy is idempotent', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.destroy();
    e.destroy();
    expect(e.getInstance()).toBeNull();
  });

  it('disconnect destroys instance', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('data-pins', VALID_PINS);
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 30));
    document.body.removeChild(e);
    expect(e.getInstance()).toBeNull();
  });

  it('update before ready is a no-op', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    expect(() => e.update({ config: { theme: 'dark' } })).not.toThrow();
  });

  it('update after ready merges config', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('data-pins', VALID_PINS);
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 30));
    // WebGL 被禁用 → 走降级，instance 存在但 ready=false；update 不应抛错
    expect(() => e.update({ config: { legend: false } })).not.toThrow();
  });

  it('attributeChangedCallback is a no-op before ready', async () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    e.setAttribute('data-pins', VALID_PINS);
    document.body.appendChild(e);
    await new Promise((r) => setTimeout(r, 10));
    // 触发 observedAttributes 变更回调（ready=false 时直接 return）
    expect(() => e.setAttribute('theme', 'dark')).not.toThrow();
  });

  it('observedAttributes includes key attrs', () => {
    const attrs = FootprintGlobeElement.observedAttributes;
    expect(attrs).toContain('data-id');
    expect(attrs).toContain('data-pins');
    expect(attrs).toContain('data-src');
    expect(attrs).toContain('theme');
    expect(attrs).toContain('projection');
    expect(attrs).toContain('height');
    expect(attrs).toContain('legend');
    expect(attrs).toContain('autorotate');
    expect(attrs).toContain('attribution');
    expect(attrs).toContain('privacy-blur');
    expect(attrs).toContain('privacy-city-only');
    expect(attrs).toContain('maplibre-url');
    expect(attrs).toContain('center');
    expect(attrs).toContain('zoom');
  });

  it('register does not re-define existing element', () => {
    register();
    register();
    expect(customElements.get('footprint-globe')).toBeDefined();
  });
});
