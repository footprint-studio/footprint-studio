import { describe, it, expect } from 'vitest';
import { reducer, initialState } from '../src/state';
import type { FootprintConfig } from 'footprint-globe';

const validJson = JSON.stringify({
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

const legacyJson = JSON.stringify({
  residence: [{ name: '新加坡', coords: [103.85, 1.29] }],
  travel: [{ name: '东京', coords: [139.759, 35.682] }],
});

const csv = `name,lng,lat,category
东京,139.759,35.682,travel
京都,135.756,35.021,travel
`;

describe('builder reducer', () => {
  it('initial state is empty', () => {
    const s = initialState();
    expect(s.raw).toBe('');
    expect(s.config).toBeNull();
    expect(s.errors).toEqual([]);
    expect(s.source).toBe('json');
  });

  it('set-raw parses valid JSON', () => {
    const s = reducer(initialState(), { type: 'set-raw', raw: validJson });
    expect(s.config).not.toBeNull();
    expect(s.config!.categories).toHaveLength(1);
    expect(s.errors).toEqual([]);
  });

  it('set-raw handles legacy {residence, travel}', () => {
    const s = reducer(initialState(), { type: 'set-raw', raw: legacyJson });
    expect(s.config!.categories).toHaveLength(2);
    const ids = s.config!.categories.map((c) => c.id);
    expect(ids).toEqual(['residence', 'travel']);
  });

  it('set-raw reports JSON parse error', () => {
    const s = reducer(initialState(), { type: 'set-raw', raw: '{invalid' });
    expect(s.config).toBeNull();
    expect(s.errors.length).toBeGreaterThan(0);
    expect(s.errors[0]!.userMessage).toContain('JSON');
  });

  it('set-raw with empty string resets config', () => {
    let s = reducer(initialState(), { type: 'set-raw', raw: validJson });
    s = reducer(s, { type: 'set-raw', raw: '' });
    expect(s.config).toBeNull();
    expect(s.errors).toEqual([]);
  });

  it('set-source switches to CSV and reparses', () => {
    let s = reducer(initialState(), { type: 'set-raw', raw: csv });
    s = reducer(s, { type: 'set-source', source: 'csv' });
    expect(s.source).toBe('csv');
    expect(s.config).not.toBeNull();
    expect(s.config!.categories[0]!.pins).toHaveLength(2);
  });

  it('set-raw with source=csv parses CSV', () => {
    const s = reducer(initialState(), { type: 'set-raw', raw: csv, source: 'csv' });
    expect(s.source).toBe('csv');
    expect(s.config!.categories[0]!.pins).toHaveLength(2);
  });

  it('invalid config produces validate errors', () => {
    const bad = JSON.stringify({
      version: 1,
      categories: [{ id: 'Travel', label: 'x', color: 'red', pins: [] }],
    });
    const s = reducer(initialState(), { type: 'set-raw', raw: bad });
    expect(s.errors.length).toBeGreaterThan(0);
  });

  it('load-example loads travel template', () => {
    const s = reducer(initialState(), { type: 'load-example', id: 'travel' });
    expect(s.config).not.toBeNull();
    expect(s.config!.categories).toHaveLength(1);
    expect(s.notice).toContain('旅行');
  });

  it('load-example residence has two categories', () => {
    const s = reducer(initialState(), { type: 'load-example', id: 'residence' });
    expect(s.config!.categories).toHaveLength(2);
  });

  it('load-example team loads team config', () => {
    const s = reducer(initialState(), { type: 'load-example', id: 'team' });
    expect(s.config!.categories[0]!.id).toBe('team');
  });

  it('load-example unknown id is no-op', () => {
    const s0 = initialState();
    const s = reducer(s0, { type: 'load-example', id: 'unknown' as 'travel' });
    expect(s).toBe(s0);
  });

  it('set-preview merges preview', () => {
    let s = reducer(initialState(), { type: 'set-preview', preview: { theme: 'dark' } });
    s = reducer(s, { type: 'set-preview', preview: { zoom: 2 } });
    expect(s.preview).toEqual({ theme: 'dark', zoom: 2 });
  });

  it('set-export-type updates type', () => {
    const s = reducer(initialState(), { type: 'set-export-type', exportType: 'iframe' });
    expect(s.exportType).toBe('iframe');
  });

  it('set-notice updates notice', () => {
    const s = reducer(initialState(), { type: 'set-notice', notice: 'hello' });
    expect(s.notice).toBe('hello');
  });

  it('reset clears state', () => {
    let s = reducer(initialState(), { type: 'set-raw', raw: validJson });
    s = reducer(s, { type: 'reset' });
    expect(s).toEqual(initialState());
  });

  it('action does not mutate state', () => {
    const s0 = initialState();
    const s1 = reducer(s0, { type: 'set-raw', raw: validJson });
    expect(s0).not.toBe(s1);
    expect(s0.raw).toBe('');
  });

  it('parses GeoJSON FeatureCollection', () => {
    const geo = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [103.85, 1.29] },
          properties: { name: '新加坡', category: 'residence' },
        },
      ],
    });
    const s = reducer(initialState(), { type: 'set-raw', raw: geo });
    expect(s.config).not.toBeNull();
    expect(s.config!.categories[0]!.id).toBe('residence');
  });

  it('config output is FootprintConfig shape', () => {
    const s = reducer(initialState(), { type: 'set-raw', raw: validJson });
    const cfg = s.config as FootprintConfig;
    expect(cfg.version).toBe(1);
    expect(Array.isArray(cfg.categories)).toBe(true);
  });
});
