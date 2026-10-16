import { describe, it, expect } from 'vitest';
import {
  byteLength,
  formatBytes,
  recommend,
  recommendedExportType,
  recommendText,
} from '../src/recommend';

describe('byteLength', () => {
  it('counts ASCII as 1 byte each', () => {
    expect(byteLength('hello')).toBe(5);
  });

  it('counts Chinese as 3 bytes each', () => {
    expect(byteLength('足迹')).toBe(6);
  });

  it('handles emoji as 4 bytes', () => {
    expect(byteLength('🚀')).toBe(4);
  });

  it('handles empty string', () => {
    expect(byteLength('')).toBe(0);
  });
});

describe('recommend', () => {
  it('returns inline for small data', () => {
    const small = JSON.stringify({ version: 1, categories: [] });
    expect(recommend(small)).toBe('inline');
  });

  it('returns src for medium data (>= 2KB)', () => {
    const chunk = 'a'.repeat(2500);
    expect(recommend(JSON.stringify({ x: chunk }))).toBe('src');
  });

  it('returns id for large data (>= 50KB)', () => {
    const chunk = 'a'.repeat(60_000);
    expect(recommend(JSON.stringify({ x: chunk }))).toBe('id');
  });

  it('boundary: exactly 2KB is src', () => {
    const s = 'a'.repeat(2 * 1024);
    expect(recommend(s)).toBe('src');
  });

  it('boundary: just below 2KB is inline', () => {
    const s = 'a'.repeat(2 * 1024 - 1);
    expect(recommend(s)).toBe('inline');
  });

  it('boundary: just below 50KB is src', () => {
    const s = 'a'.repeat(50 * 1024 - 1);
    expect(recommend(s)).toBe('src');
  });

  it('boundary: exactly 50KB is id', () => {
    const s = 'a'.repeat(50 * 1024);
    expect(recommend(s)).toBe('id');
  });
});

describe('recommendText', () => {
  it('inline mention data-pins', () => {
    expect(recommendText('inline', 500)).toContain('data-pins');
  });

  it('src mention data-src', () => {
    expect(recommendText('src', 10_000)).toContain('data-src');
  });

  it('id mention v1.1', () => {
    expect(recommendText('id', 100_000)).toContain('v1.1');
  });
});

describe('formatBytes', () => {
  it('B for < 1KB', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('KB for < 1MB', () => {
    expect(formatBytes(2048)).toBe('2.0 KB');
  });

  it('MB for >= 1MB', () => {
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.00 MB');
  });
});

describe('recommendedExportType', () => {
  it('inline → web-component', () => {
    expect(recommendedExportType('inline')).toBe('web-component');
  });

  it('src → web-component', () => {
    expect(recommendedExportType('src')).toBe('web-component');
  });

  it('id → iframe', () => {
    expect(recommendedExportType('id')).toBe('iframe');
  });
});
