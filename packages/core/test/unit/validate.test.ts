import { describe, it, expect } from 'vitest';
import { validateConfig, assertValidConfig } from '../../src/config/validate';
import type { FootprintError } from '../../src/errors';
import { configBasic, configMulti } from '../fixtures/config-basic';
import { configFull } from '../fixtures/config-full';

function fields(errs: FootprintError[]): string[] {
  return errs
    .map((e) => (e.detail as { field?: string } | undefined)?.field)
    .filter((f): f is string => typeof f === 'string');
}

describe('validateConfig', () => {
  it('passes for basic config', () => {
    expect(validateConfig(configBasic)).toEqual([]);
  });

  it('passes for multi-category config with dataId', () => {
    expect(validateConfig(configMulti)).toEqual([]);
  });

  it('passes for full config', () => {
    expect(validateConfig(configFull)).toEqual([]);
  });

  it('rejects non-object', () => {
    const errs = validateConfig(null);
    expect(errs.length).toBeGreaterThan(0);
    expect(fields(errs)).toContain('root');
  });

  it('rejects wrong version', () => {
    const errs = validateConfig({ ...configBasic, version: 2 });
    expect(fields(errs)).toContain('version');
  });

  it('rejects invalid dataId', () => {
    const errs = validateConfig({ ...configBasic, dataId: 'short' });
    expect(fields(errs)).toContain('dataId');
  });

  it('rejects empty categories', () => {
    const errs = validateConfig({ version: 1, categories: [] });
    expect(fields(errs)).toContain('categories');
  });

  it('rejects too many categories', () => {
    const cats = Array.from({ length: 9 }, (_, i) => ({
      id: `cat-${i}`,
      label: `分类 ${i}`,
      color: '#000000',
      pins: [],
    }));
    const errs = validateConfig({ version: 1, categories: cats });
    expect(fields(errs)).toContain('categories');
  });

  it('rejects invalid category id', () => {
    const bad = {
      ...configBasic,
      categories: [{ ...configBasic.categories[0], id: 'BadId' }],
    };
    const errs = validateConfig(bad);
    expect(fields(errs).some((f) => f.endsWith('.id'))).toBe(true);
  });

  it('rejects invalid color', () => {
    const bad = {
      ...configBasic,
      categories: [{ ...configBasic.categories[0], color: 'red' }],
    };
    const errs = validateConfig(bad);
    expect(fields(errs).some((f) => f.endsWith('.color'))).toBe(true);
  });

  it('rejects pin name too long', () => {
    const longName = 'a'.repeat(201);
    const bad = {
      ...configBasic,
      categories: [
        {
          ...configBasic.categories[0],
          pins: [{ name: longName, coords: [0, 0] }],
        },
      ],
    };
    const errs = validateConfig(bad);
    expect(fields(errs).some((f) => f.endsWith('.name'))).toBe(true);
  });

  it('rejects lng out of range', () => {
    const bad = {
      ...configBasic,
      categories: [
        {
          ...configBasic.categories[0],
          pins: [{ name: 'x', coords: [200, 0] }],
        },
      ],
    };
    const errs = validateConfig(bad);
    expect(fields(errs).some((f) => f.includes('.coords[0]'))).toBe(true);
  });

  it('rejects lat out of range', () => {
    const bad = {
      ...configBasic,
      categories: [
        {
          ...configBasic.categories[0],
          pins: [{ name: 'x', coords: [0, 100] }],
        },
      ],
    };
    const errs = validateConfig(bad);
    expect(fields(errs).some((f) => f.includes('.coords[1]'))).toBe(true);
  });

  it('rejects note too long', () => {
    const bad = {
      ...configBasic,
      categories: [
        {
          ...configBasic.categories[0],
          pins: [{ name: 'x', coords: [0, 0], note: 'a'.repeat(501) }],
        },
      ],
    };
    const errs = validateConfig(bad);
    expect(fields(errs).some((f) => f.endsWith('.note'))).toBe(true);
  });

  it('rejects photos > 5', () => {
    const bad = {
      ...configBasic,
      categories: [
        {
          ...configBasic.categories[0],
          pins: [
            {
              name: 'x',
              coords: [0, 0],
              photos: ['1', '2', '3', '4', '5', '6'],
            },
          ],
        },
      ],
    };
    const errs = validateConfig(bad);
    expect(fields(errs).some((f) => f.endsWith('.photos'))).toBe(true);
  });

  it('rejects > 1000 total pins', () => {
    const pins = Array.from({ length: 1001 }, (_, i) => ({
      name: `p${i}`,
      coords: [0, 0] as [number, number],
    }));
    const bad = {
      version: 1,
      categories: [{ id: 'x', label: 'x', color: '#000000', pins }],
    };
    const errs = validateConfig(bad);
    expect(fields(errs).some((f) => f.includes('pins'))).toBe(true);
  });

  it('rejects invalid projection', () => {
    const bad = { ...configBasic, config: { projection: 'flat' } };
    const errs = validateConfig(bad);
    expect(fields(errs)).toContain('config.projection');
  });

  it('rejects invalid theme', () => {
    const bad = { ...configBasic, config: { theme: 'neon' } };
    const errs = validateConfig(bad);
    expect(fields(errs)).toContain('config.theme');
  });

  it('each error has Chinese userMessage', () => {
    const errs = validateConfig({ version: 2, categories: [] });
    for (const e of errs) {
      expect(e.userMessage.length).toBeGreaterThan(0);
      expect(e.code).toBe('CONFIG_INVALID');
    }
  });

  it('rejects non-array categories', () => {
    const errs = validateConfig({ version: 1, categories: 'nope' });
    expect(fields(errs)).toContain('categories');
  });

  it('rejects category that is not an object', () => {
    const errs = validateConfig({ version: 1, categories: [42] });
    expect(fields(errs).some((f) => f.endsWith('categories[0]'))).toBe(true);
  });

  it('rejects category missing label', () => {
    const errs = validateConfig({
      version: 1,
      categories: [{ id: 'x', color: '#000', pins: [] }],
    });
    expect(fields(errs).some((f) => f.endsWith('.label'))).toBe(true);
  });

  it('rejects invalid icon', () => {
    const errs = validateConfig({
      version: 1,
      categories: [{ id: 'x', label: 'x', color: '#000', icon: 'bad', pins: [] }],
    });
    expect(fields(errs).some((f) => f.endsWith('.icon'))).toBe(true);
  });

  it('rejects non-array pins', () => {
    const errs = validateConfig({
      version: 1,
      categories: [{ id: 'x', label: 'x', color: '#000', pins: 'nope' }],
    });
    expect(fields(errs).some((f) => f.endsWith('.pins'))).toBe(true);
  });

  it('rejects pin that is not an object', () => {
    const errs = validateConfig({
      version: 1,
      categories: [{ id: 'x', label: 'x', color: '#000', pins: [42] }],
    });
    expect(fields(errs).some((f) => f.includes('pins[0]'))).toBe(true);
  });

  it('rejects pin with non-array coords', () => {
    const errs = validateConfig({
      version: 1,
      categories: [{ id: 'x', label: 'x', color: '#000', pins: [{ name: 'a', coords: 1 }] }],
    });
    expect(fields(errs).some((f) => f.includes('.coords'))).toBe(true);
  });

  it('rejects pin with non-string note', () => {
    const errs = validateConfig({
      version: 1,
      categories: [
        { id: 'x', label: 'x', color: '#000', pins: [{ name: 'a', coords: [0, 0], note: 5 }] },
      ],
    });
    expect(fields(errs).some((f) => f.endsWith('.note'))).toBe(true);
  });

  it('rejects non-array photos', () => {
    const errs = validateConfig({
      version: 1,
      categories: [
        { id: 'x', label: 'x', color: '#000', pins: [{ name: 'a', coords: [0, 0], photos: 'x' }] },
      ],
    });
    expect(fields(errs).some((f) => f.endsWith('.photos'))).toBe(true);
  });

  it('rejects photos with non-string elements', () => {
    const errs = validateConfig({
      version: 1,
      categories: [
        {
          id: 'x',
          label: 'x',
          color: '#000',
          pins: [{ name: 'a', coords: [0, 0], photos: [1, 2] }],
        },
      ],
    });
    expect(fields(errs).some((f) => f.endsWith('.photos'))).toBe(true);
  });

  it('rejects non-string style / maplibreUrl', () => {
    const errs = validateConfig({ ...configBasic, config: { style: 5, maplibreUrl: 6 } });
    expect(fields(errs)).toContain('config.style');
    expect(fields(errs)).toContain('config.maplibreUrl');
  });

  it('rejects non-number zoom / non-boolean legend / autorotate', () => {
    const errs = validateConfig({
      ...configBasic,
      config: { zoom: 'x', legend: 'y', autorotate: 'z' },
    });
    expect(fields(errs)).toContain('config.zoom');
    expect(fields(errs)).toContain('config.legend');
    expect(fields(errs)).toContain('config.autorotate');
  });

  it('rejects invalid privacy fields', () => {
    const errs = validateConfig({
      ...configBasic,
      config: { privacy: { blur: 'x', cityOnly: 'y' } },
    });
    expect(fields(errs)).toContain('config.privacy.blur');
    expect(fields(errs)).toContain('config.privacy.cityOnly');
  });

  it('accepts 3-digit hex color', () => {
    const errs = validateConfig({
      version: 1,
      categories: [{ id: 'x', label: 'x', color: '#abc', pins: [] }],
    });
    expect(errs).toEqual([]);
  });

  it('assertValidConfig throws first error', () => {
    expect(() => assertValidConfig({ version: 2, categories: [] })).toThrow();
  });

  it('assertValidConfig passes valid input', () => {
    expect(() => assertValidConfig(configBasic)).not.toThrow();
  });
});
