import { describe, it, expect } from 'vitest';
import {
  buildShareUrl,
  decodeBase64Url,
  decodeShare,
  encodeBase64Url,
  encodeShare,
} from '../src/share';
import { initialState } from '../src/state';

function stateWith(
  raw: string,
  preview: Record<string, unknown> = {},
  exportType: 'web-component' | 'iframe' | 'npm' = 'web-component',
) {
  return {
    ...initialState(),
    raw,
    preview,
    exportType,
  };
}

describe('encodeBase64Url / decodeBase64Url', () => {
  it('round-trips ASCII', () => {
    const s = 'hello world';
    expect(decodeBase64Url(encodeBase64Url(s))).toBe(s);
  });

  it('round-trips UTF-8', () => {
    const s = '足迹地球 · Footprint Studio';
    expect(decodeBase64Url(encodeBase64Url(s))).toBe(s);
  });

  it('produces URL-safe chars', () => {
    const out = encodeBase64Url('test with +/= chars that get encoded');
    expect(out).not.toMatch(/[+/=]/);
  });

  it('handles large input without throwing', () => {
    const big = 'a'.repeat(100_000);
    expect(() => encodeBase64Url(big)).not.toThrow();
  });
});

describe('encodeShare', () => {
  it('returns ok for non-empty state', () => {
    const result = encodeShare(stateWith('{"version":1,"categories":[]}'));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hash.startsWith('?s=')).toBe(true);
    }
  });

  it('rejects empty state', () => {
    const result = encodeShare(initialState());
    expect(result.ok).toBe(false);
  });

  it('rejects when encoded > 4KB', () => {
    const huge = 'x'.repeat(10 * 1024);
    const result = encodeShare(stateWith(huge));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('4KB');
  });

  it('omits default source and exportType from payload', () => {
    const result = encodeShare(stateWith('data'));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const payload = decodeShare(result.hash);
      expect(payload).not.toBeNull();
      expect(payload!.source).toBeUndefined();
      expect(payload!.exportType).toBeUndefined();
    }
  });

  it('includes non-default exportType', () => {
    const result = encodeShare(stateWith('data', {}, 'iframe'));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const payload = decodeShare(result.hash);
      expect(payload!.exportType).toBe('iframe');
    }
  });

  it('includes preview when non-empty', () => {
    const result = encodeShare(stateWith('data', { theme: 'dark' }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const payload = decodeShare(result.hash);
      expect(payload!.preview).toEqual({ theme: 'dark' });
    }
  });
});

describe('decodeShare', () => {
  it('decodes round-trip', () => {
    const original = stateWith('{"version":1,"categories":[]}', { theme: 'dark' });
    const enc = encodeShare(original);
    expect(enc.ok).toBe(true);
    if (enc.ok) {
      const decoded = decodeShare(enc.hash);
      expect(decoded!.raw).toBe(original.raw);
      expect(decoded!.preview).toEqual({ theme: 'dark' });
    }
  });

  it('accepts full URL', () => {
    const enc = encodeShare(stateWith('hello'));
    if (enc.ok) {
      const url = `https://footprint-studio.pages.dev/builder/${enc.hash}`;
      const decoded = decodeShare(url);
      expect(decoded).not.toBeNull();
      expect(decoded!.raw).toBe('hello');
    }
  });

  it('accepts query without leading ?', () => {
    const enc = encodeShare(stateWith('hello'));
    if (enc.ok) {
      const withoutQ = enc.hash.slice(1);
      const decoded = decodeShare(withoutQ);
      expect(decoded).not.toBeNull();
    }
  });

  it('returns null for empty input', () => {
    expect(decodeShare('')).toBeNull();
  });

  it('returns null for missing param', () => {
    expect(decodeShare('?foo=bar')).toBeNull();
  });

  it('returns null for corrupted base64', () => {
    expect(decodeShare('?s=not!valid!base64')).toBeNull();
  });

  it('returns null when JSON lacks raw', () => {
    const encoded = encodeBase64Url(JSON.stringify({ preview: {} }));
    expect(decodeShare(`?s=${encoded}`)).toBeNull();
  });
});

describe('buildShareUrl', () => {
  it('concatenates base with hash', () => {
    const url = buildShareUrl('?s=abc');
    expect(url).toContain('?s=abc');
    expect(url.startsWith('http')).toBe(true);
  });
});
