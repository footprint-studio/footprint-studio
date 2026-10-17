import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadData } from '../../src/data/loader';
import { configBasic } from '../fixtures/config-basic';
import { configLegacy } from '../fixtures/config-legacy';

describe('loadData', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('throws on id (v1.1 not implemented)', async () => {
    await expect(loadData({ id: 'aBc12XyZ' })).rejects.toThrow(/短链/);
  });

  it('loads from src (fetch)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(configBasic),
    }) as unknown as typeof fetch;

    const r = await loadData({ src: 'https://example.com/pins.json' });
    expect(r.config.categories).toHaveLength(1);
  });

  it('rejects non-HTTPS src (except localhost)', async () => {
    await expect(loadData({ src: 'http://example.com/pins.json' })).rejects.toThrow(/HTTPS/);
    await expect(loadData({ src: 'ftp://example.com/pins.json' })).rejects.toThrow(/HTTPS/);
  });

  it('resolves relative src against page URL and allows it', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(configBasic),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const r = await loadData({ src: './pins.json' });
    expect(r.config.categories).toHaveLength(1);
    const calledUrl = String(fetchMock.mock.calls[0]![0]);
    expect(calledUrl).toMatch(/^http:\/\/localhost(:\d+)?\/pins\.json$/);
  });

  it('allows localhost http for local development', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(configBasic),
    }) as unknown as typeof fetch;

    for (const url of [
      'http://localhost:8080/pins.json',
      'http://127.0.0.1:3000/pins.json',
      'http://[::1]:4000/pins.json',
    ]) {
      const r = await loadData({ src: url });
      expect(r.config.categories).toHaveLength(1);
    }
  });

  it('handles fetch failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;
    await expect(loadData({ src: 'https://example.com/pins.json' })).rejects.toThrow(
      /网络请求失败/,
    );
  });

  it('handles non-OK response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }) as unknown as typeof fetch;
    await expect(loadData({ src: 'https://example.com/pins.json' })).rejects.toThrow(/HTTP 404/);
  });

  it('loads from inline data', async () => {
    const r = await loadData({ data: JSON.stringify(configLegacy) });
    expect(r.config.categories).toHaveLength(2);
  });

  it('handles invalid inline JSON', async () => {
    await expect(loadData({ data: '{invalid' })).rejects.toThrow(/JSON/);
  });

  it('loads from global variable', async () => {
    (globalThis as Record<string, unknown>).FOOTPRINT_PINS = configBasic;
    const r = await loadData({});
    expect(r.config.categories).toHaveLength(1);
    delete (globalThis as Record<string, unknown>).FOOTPRINT_PINS;
  });

  it('throws when global variable missing', async () => {
    await expect(loadData({ globalVar: 'NOT_EXIST_VAR' })).rejects.toThrow(/未找到全局变量/);
  });

  it('handles non-JSON response body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('bad json')),
    }) as unknown as typeof fetch;
    await expect(loadData({ src: 'https://example.com/pins.json' })).rejects.toThrow(/JSON/);
  });

  it('truncates total pins over 1000 with warning', async () => {
    const pins = Array.from({ length: 1200 }, (_, i) => ({
      name: `p${i}`,
      coords: [0, 0] as [number, number],
    }));
    const raw = { version: 1, categories: [{ id: 'x', label: 'x', color: '#000', pins }] };
    const r = await loadData({ data: JSON.stringify(raw) });
    const total = r.config.categories.reduce((s, c) => s + c.pins.length, 0);
    expect(total).toBe(1000);
    expect(r.warnings.some((w) => w.includes('截断'))).toBe(true);
  });

  it('throws CONFIG_INVALID when data fails validation', async () => {
    await expect(
      loadData({ data: JSON.stringify({ version: 2, categories: [] }) }),
    ).rejects.toThrow(/version|配置/);
  });
});
