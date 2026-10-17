import { describe, it, expect } from 'vitest';
import type { FootprintConfig } from 'footprint-globe';
import { generateWebComponent, generateIframe, generateNpm, toBase64Url } from '../src/templates';

const config: FootprintConfig = {
  version: 1,
  categories: [
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [{ name: '东京', coords: [139.759, 35.682] }],
    },
  ],
  config: {
    theme: 'light',
    projection: 'globe',
    center: [100, 30],
    zoom: 1.2,
    legend: true,
  },
};

describe('generateWebComponent', () => {
  it('produces a script tag + footprint-globe element', () => {
    const out = generateWebComponent({ config, recommendation: 'inline' });
    expect(out).toContain('<script type="module"');
    expect(out).toContain('footprint-globe@1/dist/auto.js');
    expect(out).toContain('<footprint-globe');
    expect(out).toContain('data-pins=');
    expect(out).toContain('theme="light"');
    expect(out).toContain('projection="globe"');
  });

  it('escapes single quotes in inline JSON', () => {
    const withQuote: FootprintConfig = {
      ...config,
      categories: [
        {
          id: 'travel',
          label: "O'Brien",
          color: '#f97316',
          pins: [],
        },
      ],
    };
    const out = generateWebComponent({ config: withQuote, recommendation: 'inline' });
    expect(out).toContain('&#39;');
    // 单引号被转义后不会破坏 data-pins='...' 属性
    const attr = out.match(/data-pins='([^']*)'/);
    expect(attr).not.toBeNull();
  });

  it('uses data-src when recommendation is src', () => {
    const out = generateWebComponent({
      config,
      recommendation: 'src',
      srcUrl: 'https://example.com/pins.json',
    });
    expect(out).toContain('data-src="https://example.com/pins.json"');
    expect(out).not.toContain('data-pins=');
  });

  it('uses data-id when recommendation is id', () => {
    const withId = { ...config, dataId: 'aBc12XyZ' };
    const out = generateWebComponent({ config: withId, recommendation: 'id' });
    expect(out).toContain('data-id="aBc12XyZ"');
  });

  it('falls back to inline when id recommended but no dataId', () => {
    const out = generateWebComponent({ config, recommendation: 'id' });
    expect(out).toContain('data-pins=');
  });

  it('includes height attribute when provided', () => {
    const out = generateWebComponent({ config, recommendation: 'inline', height: 520 });
    expect(out).toContain('height="520px"');
  });

  it('omits unknown theme', () => {
    const noTheme: FootprintConfig = {
      ...config,
      config: { ...config.config, theme: undefined },
    };
    const out = generateWebComponent({ config: noTheme, recommendation: 'inline' });
    expect(out).not.toContain('theme=');
  });
});

describe('generateIframe', () => {
  it('produces iframe with embed URL', () => {
    const out = generateIframe({ config, recommendation: 'inline' });
    expect(out).toContain('<iframe');
    expect(out).toContain('https://embed.footprint-studio.dev/');
    expect(out).toContain('title="我的足迹"');
  });

  it('encodes inline data as base64url', () => {
    const out = generateIframe({ config, recommendation: 'inline' });
    expect(out).toContain('data=');
    // base64url 中不应出现 '+' 或 '/'
    const m = out.match(/data=([^&"]+)/);
    expect(m).not.toBeNull();
    expect(m![1]).not.toMatch(/[+/]/);
  });

  it('uses ?src= when recommendation is src', () => {
    const out = generateIframe({
      config,
      recommendation: 'src',
      srcUrl: 'https://example.com/p.json',
    });
    expect(out).toContain('src=https');
    expect(out).not.toContain('data=');
  });

  it('uses ?id= when recommendation is id', () => {
    const withId = { ...config, dataId: 'aBc12XyZ' };
    const out = generateIframe({ config: withId, recommendation: 'id' });
    expect(out).toContain('id=aBc12XyZ');
  });

  it('converts & to &amp; in URL for HTML safety', () => {
    const out = generateIframe({ config, recommendation: 'inline' });
    const srcMatch = out.match(/src="([^"]+)"/);
    expect(srcMatch).not.toBeNull();
    expect(srcMatch![1]).toContain('&amp;');
  });

  it('uses custom height', () => {
    const out = generateIframe({ config, recommendation: 'inline', height: 600 });
    expect(out).toContain('height="600"');
    expect(out).toContain('height=600');
  });
});

describe('generateNpm', () => {
  it('imports FootprintGlobe and maplibre', () => {
    const out = generateNpm({ config });
    expect(out).toContain("import { FootprintGlobe } from 'footprint-globe'");
    expect(out).toContain("import maplibregl from 'maplibre-gl'");
    expect(out).toContain("import 'footprint-globe/dist/footprint-globe.css'");
  });

  it('includes config JSON', () => {
    const out = generateNpm({ config });
    expect(out).toContain('"version": 1');
    expect(out).toContain('"id": "travel"');
  });

  it('uses default container id', () => {
    const out = generateNpm({ config });
    expect(out).toContain("getElementById('globe')");
  });

  it('uses custom container id', () => {
    const out = generateNpm({ config, containerId: 'my-map' });
    expect(out).toContain("getElementById('my-map')");
  });

  it('includes destroy / update hints in comments', () => {
    const out = generateNpm({ config });
    expect(out).toContain('globe.destroy()');
    expect(out).toContain('globe.update');
  });
});

describe('toBase64Url', () => {
  it('produces URL-safe characters only', () => {
    const out = toBase64Url('hello world with special: +/= chars');
    expect(out).not.toMatch(/[+/=]/);
  });

  it('round-trips ASCII', () => {
    const s = 'hello';
    expect(atob(toBase64Url(s).replace(/-/g, '+').replace(/_/g, '/'))).toBe(s);
  });

  it('handles UTF-8', () => {
    const s = '足迹地球';
    const b64 = toBase64Url(s);
    const binary = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    expect(new TextDecoder().decode(bytes)).toBe(s);
  });

  it('handles large input without stack overflow', () => {
    const big = 'a'.repeat(200_000);
    expect(() => toBase64Url(big)).not.toThrow();
  });
});
