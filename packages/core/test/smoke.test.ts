import { describe, it, expect } from 'vitest';
import { VERSION } from '../src/index';
import type { FootprintConfig } from '../src/index';

describe('core smoke', () => {
  it('exports VERSION', () => {
    expect(typeof VERSION).toBe('string');
    expect(VERSION).toBe('0.0.0');
  });

  it('FootprintConfig type is structurally usable', () => {
    const cfg: FootprintConfig = {
      version: 1,
      dataId: 'aBc12XyZ',
      categories: [
        {
          id: 'travel',
          label: '旅行',
          color: '#f97316',
          pins: [{ name: '东京', coords: [139.759, 35.682] }],
        },
      ],
      config: {
        maplibreUrl: 'https://cdn.jsdelivr.net/npm/maplibre-gl@5/dist/maplibre-gl.js',
      },
    };
    expect(cfg.categories).toHaveLength(1);
    expect(cfg.categories[0]!.pins[0]!.coords[0]).toBeCloseTo(139.759);
    expect(cfg.dataId).toBe('aBc12XyZ');
  });
});
