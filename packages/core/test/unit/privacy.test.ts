import { describe, it, expect } from 'vitest';
import { applyPrivacy } from '../../src/privacy';
import type { Pin } from '../../src/config/schema';

const pins: Pin[] = [
  { name: '东京', coords: [139.7594549, 35.6828387] },
  { name: '新加坡', coords: [103.851959, 1.29027] },
];

describe('applyPrivacy', () => {
  it('returns original pins when no options', () => {
    const out = applyPrivacy(pins, {});
    expect(out).toEqual(pins);
  });

  it('blur produces deterministic offset', () => {
    const a = applyPrivacy(pins, { blur: 10 });
    const b = applyPrivacy(pins, { blur: 10 });
    expect(a[0]!.coords).toEqual(b[0]!.coords);
  });

  it('blur offset within radius', () => {
    const out = applyPrivacy(pins, { blur: 50 });
    const [lng, lat] = out[0]!.coords;
    const dLng = Math.abs(lng - 139.7594549);
    const dLat = Math.abs(lat - 35.6828387);
    // 50km 约 0.45 度纬度，经度因纬度而放大
    expect(dLat).toBeLessThan(0.5);
    expect(dLng).toBeLessThan(1);
  });

  it('cityOnly rounds to 2 decimal places', () => {
    const out = applyPrivacy(pins, { cityOnly: true });
    const [lng, lat] = out[0]!.coords;
    expect(lng).toBe(139.76);
    expect(lat).toBe(35.68);
  });

  it('blur + cityOnly combine', () => {
    const out = applyPrivacy(pins, { blur: 5, cityOnly: true });
    const [lng, lat] = out[0]!.coords;
    expect(lng).toBe(Math.round(lng * 100) / 100);
    expect(lat).toBe(Math.round(lat * 100) / 100);
  });

  it('does not mutate input pins', () => {
    const original = JSON.parse(JSON.stringify(pins));
    applyPrivacy(pins, { blur: 10 });
    expect(pins).toEqual(original);
  });
});
