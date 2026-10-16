import { describe, it, expect } from 'vitest';
import { normalizeConfig } from '../../src/config/normalize';
import {
  DEFAULT_CENTER,
  DEFAULT_MAPLIBRE_URL,
  DEFAULT_STYLE,
  DEFAULT_ZOOM,
} from '../../src/config/defaults';
import { configBasic } from '../fixtures/config-basic';
import { configLegacy, configLegacyOnlyTravel } from '../fixtures/config-legacy';

describe('normalizeConfig', () => {
  it('normalizes legacy { residence, travel }', () => {
    const cfg = normalizeConfig(configLegacy);
    expect(cfg.version).toBe(1);
    expect(cfg.categories).toHaveLength(2);
    const ids = cfg.categories.map((c) => c.id);
    expect(ids).toEqual(['residence', 'travel']);
    expect(cfg.categories[0]!.pins).toHaveLength(2);
    expect(cfg.categories[1]!.pins).toHaveLength(3);
  });

  it('handles legacy with only travel', () => {
    const cfg = normalizeConfig(configLegacyOnlyTravel);
    expect(cfg.categories).toHaveLength(1);
    expect(cfg.categories[0]!.id).toBe('travel');
  });

  it('keeps v1 config structure', () => {
    const cfg = normalizeConfig(configBasic);
    expect(cfg.categories).toHaveLength(1);
    expect(cfg.categories[0]!.pins).toHaveLength(3);
  });

  it('fills default RenderConfig', () => {
    const cfg = normalizeConfig(configBasic);
    const rc = cfg.config!;
    expect(rc.projection).toBe('globe');
    expect(rc.theme).toBe('light');
    expect(rc.style).toBe(DEFAULT_STYLE);
    expect(rc.maplibreUrl).toBe(DEFAULT_MAPLIBRE_URL);
    expect(rc.center).toEqual(DEFAULT_CENTER);
    expect(rc.zoom).toBe(DEFAULT_ZOOM);
    expect(rc.legend).toBe(true);
    expect(rc.autorotate).toBe(false);
    expect(rc.privacy).toEqual({ blur: 0, cityOnly: false });
  });

  it('preserves dataId if provided', () => {
    const cfg = normalizeConfig({ ...configBasic, dataId: 'aBc12XyZ' });
    expect(cfg.dataId).toBe('aBc12XyZ');
  });

  it('does not mutate input', () => {
    const input = JSON.parse(JSON.stringify(configLegacy));
    normalizeConfig(input);
    expect(input.residence).toHaveLength(2);
    expect(input.travel).toHaveLength(3);
  });

  it('returns empty categories for unknown input', () => {
    const cfg = normalizeConfig(42);
    expect(cfg.version).toBe(1);
    expect(cfg.categories).toEqual([]);
  });

  it('drops invalid pins silently', () => {
    const cfg = normalizeConfig({
      version: 1,
      categories: [
        {
          id: 'x',
          label: 'x',
          color: '#000',
          pins: [{ name: 'ok', coords: [0, 0] }, { name: 'bad', coords: [0] }, { coords: [0, 0] }],
        },
      ],
    });
    expect(cfg.categories[0]!.pins).toHaveLength(1);
  });

  it('keeps pin date / note / photos from legacy input', () => {
    const cfg = normalizeConfig({
      travel: [
        {
          name: '东京',
          coords: [139.759, 35.682],
          date: '2019-04',
          note: '赏樱',
          photos: ['https://a.jpg', 42, 'https://b.jpg'],
        },
      ],
    });
    const pin = cfg.categories[0]!.pins[0]!;
    expect(pin.date).toBe('2019-04');
    expect(pin.note).toBe('赏樱');
    expect(pin.photos).toEqual(['https://a.jpg', 'https://b.jpg']);
  });

  it('preserves category icon when valid', () => {
    const cfg = normalizeConfig({
      version: 1,
      categories: [{ id: 'x', label: 'x', color: '#000', icon: 'star', pins: [] }],
    });
    expect(cfg.categories[0]!.icon).toBe('star');
  });

  it('drops invalid category entries', () => {
    const cfg = normalizeConfig({
      version: 1,
      categories: [null, { id: 'x' }, { id: 'y', label: 'y', color: '#000', pins: [] }],
    });
    expect(cfg.categories).toHaveLength(1);
    expect(cfg.categories[0]!.id).toBe('y');
  });

  it('preserves routes when provided', () => {
    const cfg = normalizeConfig({
      version: 1,
      categories: [],
      routes: [{ from: [0, 0], to: [1, 1], type: 'flight' }],
    });
    expect(cfg.routes).toHaveLength(1);
  });

  it('returns empty categories when both residence and travel missing', () => {
    const cfg = normalizeConfig({ version: 1, categories: undefined });
    expect(cfg.categories).toEqual([]);
  });
});
