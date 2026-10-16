import { describe, it, expect } from 'vitest';
import { MarkerLayer } from '../../src/marker-layer';
import { PopupManager } from '../../src/popup-manager';
import { createMockMaplibre } from '../mocks/maplibre';
import { configBasic, configMulti } from '../fixtures/config-basic';

function setup() {
  const handle = createMockMaplibre();
  const map = new handle.maplibre.Map({ container: document.createElement('div') });
  const popup = new PopupManager(handle.maplibre as never);
  const layer = new MarkerLayer({
    maplibre: handle.maplibre as never,
    map,
    popup,
  });
  return { handle, layer, map, popup };
}

describe('MarkerLayer', () => {
  it('renders one marker per pin', () => {
    const { handle, layer } = setup();
    layer.render(configBasic.categories);
    expect(layer.getElements()).toHaveLength(3);
    expect(handle.getMarkers()).toHaveLength(3);
  });

  it('sets --fp-marker-color per category', () => {
    const { layer } = setup();
    layer.render(configMulti.categories);
    const els = layer.getElements();
    expect(els[0]!.style.getPropertyValue('--fp-marker-color')).toBe('#2563eb');
    expect(els[1]!.style.getPropertyValue('--fp-marker-color')).toBe('#f97316');
  });

  it('sets aria-label to pin name', () => {
    const { layer } = setup();
    layer.render(configBasic.categories);
    const els = layer.getElements();
    expect(els[0]!.getAttribute('aria-label')).toBe('东京');
  });

  it('uses <button> element for semantics', () => {
    const { layer } = setup();
    layer.render(configBasic.categories);
    const el = layer.getElements()[0]!;
    expect(el.tagName).toBe('BUTTON');
    expect(el.type).toBe('button');
  });

  it('opens popup on mouseenter', () => {
    const { layer, handle } = setup();
    layer.render(configBasic.categories);
    const el = layer.getElements()[0]!;
    el.dispatchEvent(new MouseEvent('mouseenter'));
    expect(handle.getPopups()).toHaveLength(1);
    expect(handle.getPopups()[0]!.text).toBe('东京');
  });

  it('closes popup on mouseleave', () => {
    const { layer, handle } = setup();
    layer.render(configBasic.categories);
    const el = layer.getElements()[0]!;
    el.dispatchEvent(new MouseEvent('mouseenter'));
    el.dispatchEvent(new MouseEvent('mouseleave'));
    expect(handle.getPopups()).toHaveLength(0);
  });

  it('opens popup on focus (keyboard)', () => {
    const { layer, handle } = setup();
    layer.render(configBasic.categories);
    layer.getElements()[0]!.dispatchEvent(new FocusEvent('focus'));
    expect(handle.getPopups()).toHaveLength(1);
  });

  it('clear removes DOM', () => {
    const { layer } = setup();
    layer.render(configBasic.categories);
    layer.clear();
    expect(layer.getElements()).toHaveLength(0);
  });

  it('re-render replaces markers', () => {
    const { layer, handle } = setup();
    layer.render(configBasic.categories);
    layer.render(configMulti.categories);
    expect(layer.getElements()).toHaveLength(2);
    expect(handle.getMarkers().length).toBe(5); // 累计但不重复渲染
  });
});
