import { describe, it, expect } from 'vitest';
import { decodeBase64Data, parseQuery } from '../src/query';

describe('parseQuery', () => {
  it('parses id', () => {
    expect(parseQuery('?id=aBc12XyZ').id).toBe('aBc12XyZ');
  });

  it('parses src', () => {
    expect(parseQuery('?src=https://x/y.json').src).toBe('https://x/y.json');
  });

  it('parses data', () => {
    expect(parseQuery('?data=abc').data).toBe('abc');
  });

  it('parses theme / projection', () => {
    const q = parseQuery('?theme=dark&projection=mercator');
    expect(q.config?.theme).toBe('dark');
    expect(q.config?.projection).toBe('mercator');
  });

  it('ignores invalid theme / projection', () => {
    const q = parseQuery('?theme=neon&projection=flat');
    expect(q.config).toBeUndefined();
  });

  it('parses zoom as number', () => {
    expect(parseQuery('?zoom=2.5').config?.zoom).toBe(2.5);
  });

  it('parses legend / autorotate boolean', () => {
    expect(parseQuery('?legend=1&autorotate=0').config?.legend).toBe(true);
    expect(parseQuery('?legend=1&autorotate=0').config?.autorotate).toBe(false);
  });

  it('accepts "true" / "false" spellings', () => {
    expect(parseQuery('?legend=true').config?.legend).toBe(true);
    expect(parseQuery('?legend=false').config?.legend).toBe(false);
  });

  it('parses height', () => {
    expect(parseQuery('?height=480').height).toBe(480);
  });

  it('returns empty for empty query', () => {
    expect(parseQuery('')).toEqual({});
  });

  it('handles query without leading ?', () => {
    expect(parseQuery('theme=dark').config?.theme).toBe('dark');
  });
});

describe('decodeBase64Data', () => {
  it('decodes ASCII base64', () => {
    const original = 'hello';
    const b64 = btoa(original);
    expect(decodeBase64Data(b64)).toBe(original);
  });

  it('decodes UTF-8 Chinese', () => {
    const original = '足迹地球';
    const bytes = new TextEncoder().encode(original);
    const binary = String.fromCharCode(...bytes);
    const b64 = btoa(binary);
    expect(decodeBase64Data(b64)).toBe(original);
  });

  it('handles URL-safe base64', () => {
    const original = 'a+b/c';
    const b64 = btoa(original).replace(/\+/g, '-').replace(/\//g, '_');
    expect(decodeBase64Data(b64)).toBe(original);
  });

  it('handles missing padding', () => {
    const original = 'hi';
    const b64 = btoa(original).replace(/=+$/, '');
    expect(decodeBase64Data(b64)).toBe(original);
  });
});
