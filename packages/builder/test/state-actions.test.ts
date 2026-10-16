import { describe, it, expect } from 'vitest';
import { reducer, initialState, type BuilderState } from '../src/state';

const VALID_JSON = JSON.stringify({
  version: 1,
  categories: [
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [{ name: '东京', coords: [139.759, 35.682] }],
    },
  ],
  config: { theme: 'light', zoom: 1.2, legend: true },
});

function loadState(): BuilderState {
  return reducer(initialState(), { type: 'set-raw', raw: VALID_JSON });
}

describe('builder reducer · config actions', () => {
  describe('update-category', () => {
    it('updates category color', () => {
      let s = loadState();
      s = reducer(s, {
        type: 'update-category',
        id: 'travel',
        patch: { color: '#10b981' },
      });
      expect(s.config!.categories[0]!.color).toBe('#10b981');
    });

    it('updates category label', () => {
      let s = loadState();
      s = reducer(s, {
        type: 'update-category',
        id: 'travel',
        patch: { label: '足迹' },
      });
      expect(s.config!.categories[0]!.label).toBe('足迹');
    });

    it('rejects invalid color and keeps old state', () => {
      let s = loadState();
      s = reducer(s, {
        type: 'update-category',
        id: 'travel',
        patch: { color: 'red' },
      });
      // reducer 校验失败时保留旧 config，errors 非空
      expect(s.errors.length).toBeGreaterThan(0);
      expect(s.config!.categories[0]!.color).toBe('#f97316');
    });

    it('syncs raw back to JSON', () => {
      let s = loadState();
      s = reducer(s, {
        type: 'update-category',
        id: 'travel',
        patch: { color: '#10b981' },
      });
      const parsed = JSON.parse(s.raw);
      expect(parsed.categories[0].color).toBe('#10b981');
      expect(s.source).toBe('json');
    });

    it('no-op when no config', () => {
      const s0 = initialState();
      const s1 = reducer(s0, {
        type: 'update-category',
        id: 'x',
        patch: { color: '#fff' },
      });
      expect(s1).toBe(s0);
    });
  });

  describe('add-category', () => {
    it('adds a new category with unique id', () => {
      let s = loadState();
      s = reducer(s, { type: 'add-category' });
      expect(s.config!.categories).toHaveLength(2);
      expect(s.config!.categories[1]!.id).toBe('category-1');
      expect(s.config!.categories[1]!.pins).toEqual([]);
    });

    it('rejects when already 8 categories', () => {
      let s = loadState();
      for (let i = 0; i < 7; i++) s = reducer(s, { type: 'add-category' });
      expect(s.config!.categories).toHaveLength(8);
      const before = s.config!.categories.length;
      s = reducer(s, { type: 'add-category' });
      expect(s.config!.categories).toHaveLength(before);
      expect(s.notice).toContain('最多 8');
    });
  });

  describe('remove-category', () => {
    it('removes the given category', () => {
      let s = loadState();
      s = reducer(s, { type: 'add-category' });
      s = reducer(s, { type: 'remove-category', id: 'category-1' });
      expect(s.config!.categories).toHaveLength(1);
      expect(s.config!.categories[0]!.id).toBe('travel');
    });

    it('rejects removing the last category', () => {
      let s = loadState();
      const before = s.config!.categories.length;
      s = reducer(s, { type: 'remove-category', id: 'travel' });
      expect(s.config!.categories).toHaveLength(before);
      expect(s.notice).toContain('至少');
    });
  });

  describe('set-config', () => {
    it('merges config patch', () => {
      let s = loadState();
      s = reducer(s, { type: 'set-config', patch: { theme: 'dark' } });
      expect(s.config!.config!.theme).toBe('dark');
    });

    it('updates center', () => {
      let s = loadState();
      s = reducer(s, { type: 'set-config', patch: { center: [-10, 40] } });
      expect(s.config!.config!.center).toEqual([-10, 40]);
    });

    it('updates zoom', () => {
      let s = loadState();
      s = reducer(s, { type: 'set-config', patch: { zoom: 2.5 } });
      expect(s.config!.config!.zoom).toBe(2.5);
    });

    it('updates legend toggle', () => {
      let s = loadState();
      s = reducer(s, { type: 'set-config', patch: { legend: false } });
      expect(s.config!.config!.legend).toBe(false);
    });

    it('updates privacy blur', () => {
      let s = loadState();
      s = reducer(s, { type: 'set-config', patch: { privacy: { blur: 10 } } });
      expect(s.config!.config!.privacy!.blur).toBe(10);
    });

    it('syncs raw back to JSON', () => {
      let s = loadState();
      s = reducer(s, { type: 'set-config', patch: { theme: 'dark' } });
      const parsed = JSON.parse(s.raw);
      expect(parsed.config.theme).toBe('dark');
    });

    it('no-op when no config', () => {
      const s0 = initialState();
      const s1 = reducer(s0, { type: 'set-config', patch: { theme: 'dark' } });
      expect(s1).toBe(s0);
    });
  });

  describe('integration', () => {
    it('edit category → edit config → both reflected in raw', () => {
      let s = loadState();
      s = reducer(s, {
        type: 'update-category',
        id: 'travel',
        patch: { color: '#10b981' },
      });
      s = reducer(s, { type: 'set-config', patch: { theme: 'dark' } });
      const parsed = JSON.parse(s.raw);
      expect(parsed.categories[0].color).toBe('#10b981');
      expect(parsed.config.theme).toBe('dark');
    });

    it('editing after CSV switches to JSON', () => {
      const csv = `name,lng,lat,category\n东京,139.759,35.682,travel\n`;
      let s = reducer(initialState(), { type: 'set-raw', raw: csv, source: 'csv' });
      expect(s.source).toBe('csv');
      s = reducer(s, { type: 'set-config', patch: { theme: 'dark' } });
      expect(s.source).toBe('json');
    });
  });
});
