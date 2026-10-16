import { describe, it, expect } from 'vitest';
import { parseQuery, decodeBase64Data } from '../src/query';

describe('embed query · 集成边界', () => {
  it('prioritizes id over src over data', () => {
    const q = parseQuery('?id=aBc12XyZ&src=https://x/y.json&data=abc');
    expect(q.id).toBe('aBc12XyZ');
    expect(q.src).toBe('https://x/y.json');
    expect(q.data).toBe('abc');
  });

  it('combines config params', () => {
    const q = parseQuery('?theme=dark&projection=globe&zoom=2&legend=1&autorotate=1');
    expect(q.config).toEqual({
      theme: 'dark',
      projection: 'globe',
      zoom: 2,
      legend: true,
      autorotate: true,
    });
  });

  it('height is number', () => {
    expect(parseQuery('?height=520').height).toBe(520);
  });

  it('ignores non-numeric height', () => {
    expect(parseQuery('?height=abc').height).toBeUndefined();
  });

  it('round-trips base64 data', () => {
    const cfg = { version: 1, categories: [] };
    const b64 = btoa(JSON.stringify(cfg));
    const decoded = decodeBase64Data(b64);
    expect(JSON.parse(decoded)).toEqual(cfg);
  });

  it('handles unicode in base64', () => {
    const json = JSON.stringify({ name: '东京塔' });
    const bytes = new TextEncoder().encode(json);
    const binary = String.fromCharCode(...bytes);
    const b64 = btoa(binary);
    expect(decodeBase64Data(b64)).toBe(json);
  });
});
