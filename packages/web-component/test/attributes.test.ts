import { describe, it, expect } from 'vitest';
import { parseAttributes, mergeAttributeConfig } from '../src/attributes';
import type { FootprintConfig } from 'footprint-globe';

function el(html: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.firstElementChild as HTMLElement;
}

describe('parseAttributes', () => {
  it('parses data-id', () => {
    const e = el(`<div data-id="aBc12XyZ"></div>`);
    expect(parseAttributes(e).id).toBe('aBc12XyZ');
  });

  it('parses data-pins / data-src', () => {
    const e = el(
      `<div data-pins='{"version":1,"categories":[]}' data-src="https://x/y.json"></div>`,
    );
    const a = parseAttributes(e);
    expect(a.pins).toBe('{"version":1,"categories":[]}');
    expect(a.src).toBe('https://x/y.json');
  });

  it('parses maplibre-url', () => {
    const e = el(`<div maplibre-url="https://cdn/x.js"></div>`);
    expect(parseAttributes(e).maplibreUrl).toBe('https://cdn/x.js');
  });

  it('parses theme / projection', () => {
    const e = el(`<div theme="dark" projection="mercator"></div>`);
    const a = parseAttributes(e);
    expect(a.config?.theme).toBe('dark');
    expect(a.config?.projection).toBe('mercator');
  });

  it('ignores invalid theme / projection', () => {
    const e = el(`<div theme="neon" projection="flat"></div>`);
    expect(parseAttributes(e).config).toBeUndefined();
  });

  it('parses center as lng,lat', () => {
    const e = el(`<div center="100,30"></div>`);
    expect(parseAttributes(e).config?.center).toEqual([100, 30]);
  });

  it('ignores invalid center', () => {
    const e = el(`<div center="abc"></div>`);
    expect(parseAttributes(e).config?.center).toBeUndefined();
  });

  it('ignores center with wrong arity', () => {
    const e = el(`<div center="100,30,5"></div>`);
    expect(parseAttributes(e).config).toBeUndefined();
  });

  it('parses zoom', () => {
    const e = el(`<div zoom="2.5"></div>`);
    expect(parseAttributes(e).config?.zoom).toBe(2.5);
  });

  it('ignores non-numeric zoom', () => {
    const e = el(`<div zoom="big"></div>`);
    expect(parseAttributes(e).config).toBeUndefined();
  });

  it('parses boolean attributes', () => {
    const e = el(`<div legend="true" autorotate="0" attribution></div>`);
    const a = parseAttributes(e);
    expect(a.config?.legend).toBe(true);
    expect(a.config?.autorotate).toBe(false);
    expect(a.config?.attribution).toBe(true);
  });

  it('parses height', () => {
    const e = el(`<div height="480px"></div>`);
    expect(parseAttributes(e).height).toBe('480px');
  });

  it('parses privacy blur / cityOnly', () => {
    const e = el(`<div privacy-blur="10" privacy-city-only="true"></div>`);
    expect(parseAttributes(e).config?.privacy).toEqual({ blur: 10, cityOnly: true });
  });

  it('returns empty object for element without attrs', () => {
    const e = el(`<div></div>`);
    expect(parseAttributes(e)).toEqual({});
  });
});

describe('mergeAttributeConfig', () => {
  const base: FootprintConfig = {
    version: 1,
    categories: [],
    config: { theme: 'light', zoom: 1 },
  };

  it('returns base when attrs.config missing', () => {
    expect(mergeAttributeConfig(base, {})).toBe(base);
  });

  it('merges attributes over base', () => {
    const merged = mergeAttributeConfig(base, { config: { theme: 'dark' } });
    expect(merged.config?.theme).toBe('dark');
    expect(merged.config?.zoom).toBe(1);
  });

  it('fills config when base has none', () => {
    const bare: FootprintConfig = { version: 1, categories: [] };
    const merged = mergeAttributeConfig(bare, { config: { legend: false } });
    expect(merged.config).toEqual({ legend: false });
  });
});
