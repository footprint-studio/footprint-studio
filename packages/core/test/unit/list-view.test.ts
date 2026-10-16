import { describe, it, expect } from 'vitest';
import { ListView } from '../../src/fallback/list-view';
import { configMulti } from '../fixtures/config-basic';

describe('ListView', () => {
  it('renders group per category with pins', () => {
    const container = document.createElement('div');
    const lv = new ListView({
      container,
      categories: configMulti.categories,
      reason: '测试原因',
    });
    lv.render();
    const groups = container.querySelectorAll('.footprint-list__group');
    expect(groups).toHaveLength(2);
    lv.destroy();
  });

  it('renders reason as notice', () => {
    const container = document.createElement('div');
    const lv = new ListView({
      container,
      categories: configMulti.categories,
      reason: '当前浏览器不支持 3D 渲染，已切换为列表视图。',
    });
    lv.render();
    const notice = container.querySelector('.footprint-list__notice');
    expect(notice?.textContent).toContain('3D');
    lv.destroy();
  });

  it('renders pin names in list items', () => {
    const container = document.createElement('div');
    const lv = new ListView({
      container,
      categories: configMulti.categories,
      reason: 'test',
    });
    lv.render();
    const items = container.querySelectorAll('.footprint-list__item');
    expect(items[0]!.textContent).toBe('2023.10 新加坡');
    lv.destroy();
  });

  it('skips categories with no pins', () => {
    const container = document.createElement('div');
    const lv = new ListView({
      container,
      categories: [
        { id: 'empty', label: '空', color: '#000', pins: [] },
        ...configMulti.categories,
      ],
      reason: 'test',
    });
    lv.render();
    const groups = container.querySelectorAll('.footprint-list__group');
    expect(groups).toHaveLength(2);
    lv.destroy();
  });

  it('uses region role for accessibility', () => {
    const container = document.createElement('div');
    const lv = new ListView({
      container,
      categories: configMulti.categories,
      reason: 'test',
    });
    lv.render();
    const root = container.querySelector('.footprint-list');
    expect(root?.getAttribute('role')).toBe('region');
    lv.destroy();
  });

  it('destroy removes DOM', () => {
    const container = document.createElement('div');
    const lv = new ListView({
      container,
      categories: configMulti.categories,
      reason: 'test',
    });
    lv.render();
    lv.destroy();
    expect(container.querySelector('.footprint-list')).toBeNull();
  });
});
