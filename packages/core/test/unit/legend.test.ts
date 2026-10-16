import { describe, it, expect } from 'vitest';
import { LegendView } from '../../src/legend-view';
import { configBasic, configMulti } from '../fixtures/config-basic';

describe('LegendView', () => {
  it('renders one item per category', () => {
    const container = document.createElement('div');
    const lv = new LegendView(container);
    lv.render(configMulti.categories);
    const items = container.querySelectorAll('.footprint-legend__item');
    expect(items).toHaveLength(2);
    lv.destroy();
  });

  it('renders labels in order', () => {
    const container = document.createElement('div');
    const lv = new LegendView(container);
    lv.render(configMulti.categories);
    const labels = Array.from(container.querySelectorAll('.footprint-legend__item')).map(
      (el) => el.lastElementChild?.textContent,
    );
    expect(labels).toEqual(['居住', '旅行']);
    lv.destroy();
  });

  it('injects --fp-marker-color per category', () => {
    const container = document.createElement('div');
    const lv = new LegendView(container);
    lv.render(configBasic.categories);
    const dot = container.querySelector<HTMLElement>('.footprint-legend__dot')!;
    expect(dot.style.getPropertyValue('--fp-marker-color')).toBe('#f97316');
    lv.destroy();
  });

  it('destroy removes DOM', () => {
    const container = document.createElement('div');
    const lv = new LegendView(container);
    lv.render(configBasic.categories);
    lv.destroy();
    expect(container.querySelector('.footprint-legend')).toBeNull();
  });

  it('re-render replaces previous', () => {
    const container = document.createElement('div');
    const lv = new LegendView(container);
    lv.render(configBasic.categories);
    lv.render(configMulti.categories);
    expect(container.querySelectorAll('.footprint-legend')).toHaveLength(1);
    lv.destroy();
  });
});
