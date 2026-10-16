/**
 * 足迹地球 · 隐私处理
 * 契约依据：《Sprint 1 执行方案》§7 S1-12、§15 S1-Q1（固定 seed 保证可复现）
 */

import type { Pin, PrivacyConfig } from './config/schema';

/** FNV-1a 字符串哈希，作为确定性种子 */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG，返回 [0, 1) */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KM_PER_DEG_LAT = 111.32;

/** 四舍五入到 2 位小数（约 1km 精度，城市级） */
function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * 对 pins 应用隐私处理。
 * - blur：在 km 为单位的半径内做确定性随机偏移
 * - cityOnly：坐标保留 2 位小数
 * 两者可叠加。
 */
export function applyPrivacy(pins: Pin[], options: PrivacyConfig): Pin[] {
  const blur = options.blur ?? 0;
  const cityOnly = options.cityOnly ?? false;

  if (blur <= 0 && !cityOnly) return pins;

  return pins.map((pin) => {
    let [lng, lat] = pin.coords;

    if (blur > 0) {
      const seed = hashString(`${pin.name}:${lng}:${lat}`);
      const rand = mulberry32(seed);
      const angle = rand() * Math.PI * 2;
      const radius = Math.sqrt(rand()) * blur; // 均匀分布

      const dLat = (radius * Math.cos(angle)) / KM_PER_DEG_LAT;
      const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 0.01);
      const dLng = (radius * Math.sin(angle)) / (KM_PER_DEG_LAT * cosLat);

      lat = lat + dLat;
      lng = lng + dLng;

      // clamp
      lng = Math.max(-180, Math.min(180, lng));
      lat = Math.max(-90, Math.min(90, lat));
    }

    if (cityOnly) {
      lng = roundTo2(lng);
      lat = roundTo2(lat);
    }

    return { ...pin, coords: [lng, lat] };
  });
}
