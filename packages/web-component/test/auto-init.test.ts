import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { autoInit } from '../src/auto-init';
import { register } from '../src/element';

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

describe('autoInit', () => {
  beforeEach(() => {
    register();
    vi.restoreAllMocks();
    disableWebGL();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    delete (globalThis as { FOOTPRINT_PINS?: unknown }).FOOTPRINT_PINS;
  });

  it('marks scanned elements with data-fp-bound', async () => {
    const div = document.createElement('div');
    div.className = 'footprint-globe';
    div.setAttribute('data-pins', VALID_PINS);
    document.body.appendChild(div);

    autoInit();
    expect(div.hasAttribute('data-fp-bound')).toBe(true);
  });

  it('is idempotent (does not re-init)', () => {
    const div = document.createElement('div');
    div.className = 'footprint-globe';
    div.setAttribute('data-pins', VALID_PINS);
    document.body.appendChild(div);

    autoInit();
    autoInit();
    autoInit();
    expect(div.getAttribute('data-fp-bound')).toBe('1');
  });

  it('skips <footprint-globe> custom element', () => {
    const el = document.createElement('footprint-globe');
    el.className = 'footprint-globe';
    el.setAttribute('data-pins', VALID_PINS);
    document.body.appendChild(el);

    autoInit();
    expect(el.hasAttribute('data-fp-bound')).toBe(true);
    // 不应对自定义元素再做 FootprintGlobe 实例（由元素自身接管）
  });

  it('renders error when no data source', async () => {
    const div = document.createElement('div');
    div.className = 'footprint-globe';
    document.body.appendChild(div);

    autoInit();
    await new Promise((r) => setTimeout(r, 20));

    expect(div.querySelector('.footprint-error')).not.toBeNull();
  });

  it('renders fallback list when WebGL disabled with data-pins', async () => {
    const div = document.createElement('div');
    div.className = 'footprint-globe';
    div.setAttribute('data-pins', VALID_PINS);
    document.body.appendChild(div);

    autoInit();
    await new Promise((r) => setTimeout(r, 30));

    expect(div.querySelector('.footprint-list')).not.toBeNull();
  });

  it('applies height attribute', async () => {
    const div = document.createElement('div');
    div.className = 'footprint-globe';
    div.setAttribute('data-pins', VALID_PINS);
    div.setAttribute('height', '320px');
    document.body.appendChild(div);

    autoInit();
    await new Promise((r) => setTimeout(r, 30));

    expect(div.style.getPropertyValue('--fp-globe-height')).toBe('320px');
  });

  it('scans nested elements under a root node', () => {
    const wrapper = document.createElement('div');
    const inner = document.createElement('div');
    inner.className = 'footprint-globe';
    inner.setAttribute('data-pins', VALID_PINS);
    wrapper.appendChild(inner);

    autoInit(wrapper);
    expect(inner.hasAttribute('data-fp-bound')).toBe(true);
  });

  it('uses window.FOOTPRINT_PINS when no data attribute present', async () => {
    (globalThis as { FOOTPRINT_PINS?: unknown }).FOOTPRINT_PINS = JSON.parse(VALID_PINS);
    const div = document.createElement('div');
    div.className = 'footprint-globe';
    document.body.appendChild(div);

    autoInit();
    await new Promise((r) => setTimeout(r, 30));

    expect(div.querySelector('.footprint-list')).not.toBeNull();
  });

  it('renders error for invalid data-pins', async () => {
    const div = document.createElement('div');
    div.className = 'footprint-globe';
    div.setAttribute('data-pins', '{invalid');
    document.body.appendChild(div);

    autoInit();
    await new Promise((r) => setTimeout(r, 20));

    expect(div.querySelector('.footprint-error')).not.toBeNull();
  });

  it('renders error for config failing validation', async () => {
    const div = document.createElement('div');
    div.className = 'footprint-globe';
    div.setAttribute('data-pins', JSON.stringify({ version: 1, categories: [] }));
    document.body.appendChild(div);

    autoInit();
    await new Promise((r) => setTimeout(r, 20));

    expect(div.querySelector('.footprint-error')).not.toBeNull();
  });

  it('scans multiple elements in one pass', () => {
    const a = document.createElement('div');
    a.className = 'footprint-globe';
    a.setAttribute('data-pins', VALID_PINS);
    const b = document.createElement('div');
    b.className = 'footprint-globe';
    b.setAttribute('data-pins', VALID_PINS);
    document.body.append(a, b);

    autoInit();
    expect(a.hasAttribute('data-fp-bound')).toBe(true);
    expect(b.hasAttribute('data-fp-bound')).toBe(true);
  });
});
