import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { register } from '../../src/web/element';
import type { FootprintGlobeElement } from '../../src/web/element';
import { getShadowStyle } from '../../src/web/styles';

describe('Shadow DOM isolation', () => {
  beforeEach(() => {
    register();
    vi.restoreAllMocks();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('shadow style contains :host selector', () => {
    const css = getShadowStyle();
    expect(css).toContain(':host');
  });

  it('shadow style rewrites :root to :host, :root', () => {
    const css = getShadowStyle();
    expect(css).toContain(':host, :root');
    expect(css).not.toMatch(/^\s*:root\s*\{/m);
  });

  it('shadow style contains footprint- class names', () => {
    const css = getShadowStyle();
    expect(css).toContain('footprint-marker');
    expect(css).toContain('footprint-legend');
  });

  it('shadow style uses --fp- variables', () => {
    const css = getShadowStyle();
    expect(css).toMatch(/--fp-/);
  });

  it('host element inside shadow does not leak to document', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    document.body.appendChild(e);

    // Shadow DOM 内的元素不应出现在 document 查询中
    const inDocument = document.querySelector('.footprint-globe');
    const inShadow = e.shadowRoot!.querySelector('.footprint-globe');

    expect(inShadow).not.toBeNull();
    // document 中只有一个宿主自定义元素本身
    expect(inDocument?.tagName.toLowerCase()).not.toBe('div');
  });

  it('does not define global styles', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    document.body.appendChild(e);
    // 宿主 body 上不应被注入组件样式
    const computed = getComputedStyle(document.body);
    expect(computed.getPropertyValue('--fp-globe-height')).toBe('');
  });

  it('does not inject style or link into document head', () => {
    const before = document.head.querySelectorAll('link[data-fp-maplibre-css]').length;
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    document.body.appendChild(e);
    // 组件样式只在 shadow root 内，head 里没有 link[data-fp-maplibre-css]
    expect(document.head.querySelectorAll('link[data-fp-maplibre-css]').length).toBe(before);
  });

  it('adoptedStyleSheets-free: uses a single <style> node', () => {
    const e = document.createElement('footprint-globe') as FootprintGlobeElement;
    const styles = e.shadowRoot!.querySelectorAll('style');
    expect(styles.length).toBe(1);
  });
});
