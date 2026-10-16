import { describe, it, expect } from 'vitest';
import { parseGeoJson } from '../../src/data/geojson';
import { geojsonBasic, geojsonMixed } from '../fixtures/config-geojson';

describe('parseGeoJson', () => {
  it('parses a valid FeatureCollection', () => {
    const r = parseGeoJson(geojsonBasic);
    expect(r.warnings).toEqual([]);
    const ids = r.config.categories.map((c) => c.id).sort();
    expect(ids).toEqual(['residence', 'travel']);
  });

  it('throws on non-object', () => {
    expect(() => parseGeoJson(42)).toThrow(/对象/);
  });

  it('throws on missing FeatureCollection type', () => {
    expect(() => parseGeoJson({ type: 'Feature', features: [] })).toThrow(/FeatureCollection/);
  });

  it('throws on missing features', () => {
    expect(() => parseGeoJson({ type: 'FeatureCollection' })).toThrow(/features/);
  });

  it('skips non-Point features with warnings', () => {
    const r = parseGeoJson(geojsonMixed);
    expect(r.warnings.some((w) => w.includes('不是 Point'))).toBe(true);
  });

  it('skips out-of-range coordinates with warnings', () => {
    const r = parseGeoJson(geojsonMixed);
    expect(r.warnings.some((w) => w.includes('越界'))).toBe(true);
  });

  it('uses 未命名 when name missing', () => {
    const r = parseGeoJson(geojsonMixed);
    const allPins = r.config.categories.flatMap((c) => c.pins);
    expect(allPins.some((p) => p.name === '未命名')).toBe(true);
  });

  it('defaults category to "default" when missing', () => {
    const r = parseGeoJson(geojsonMixed);
    const ids = r.config.categories.map((c) => c.id);
    expect(ids).toContain('default');
  });

  it('skips features that are not Feature objects', () => {
    const r = parseGeoJson({
      type: 'FeatureCollection',
      features: [
        42,
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { name: 'a' },
        },
      ],
    });
    expect(r.warnings.some((w) => w.includes('不是 Feature'))).toBe(true);
  });

  it('skips features with invalid coordinates array', () => {
    const r = parseGeoJson({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [1] }, properties: {} },
      ],
    });
    expect(r.warnings.some((w) => w.includes('坐标无效'))).toBe(true);
  });

  it('skips non-numeric coordinates', () => {
    const r = parseGeoJson({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: ['a', 'b'] }, properties: {} },
      ],
    });
    expect(r.warnings.some((w) => w.includes('越界'))).toBe(true);
  });

  it('truncates > MAX_PINS features', () => {
    const features = Array.from({ length: 1100 }, (_, i) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { name: `p${i}` },
    }));
    const r = parseGeoJson({ type: 'FeatureCollection', features });
    expect(r.warnings.some((w) => w.includes('截断'))).toBe(true);
  });

  it('reads date / note / photos from properties', () => {
    const r = parseGeoJson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            name: 'a',
            date: '2019-04',
            note: 'n',
            photos: ['https://a.jpg', 1],
          },
        },
      ],
    });
    const pin = r.config.categories[0]!.pins[0]!;
    expect(pin.date).toBe('2019-04');
    expect(pin.note).toBe('n');
    expect(pin.photos).toEqual(['https://a.jpg']);
  });

  it('falls back invalid category name to default', () => {
    const r = parseGeoJson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { name: 'a', category: 'BAD' },
        },
      ],
    });
    expect(r.config.categories[0]!.id).toBe('default');
  });
});
