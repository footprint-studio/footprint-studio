/**
 * 足迹地球 · GeoJSON 解析
 * 契约依据：ADR-0001 决策 6、《Sprint 1 执行方案》§6 S1-6
 */

import { DEFAULT_CATEGORY_COLORS, DEFAULT_CATEGORY_LABELS, LIMITS } from '../config/defaults';
import type { Category, FootprintConfig, LoadResult, Pin } from '../config/schema';
import { dataError } from '../errors';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function pickColor(id: string): string {
  return DEFAULT_CATEGORY_COLORS[id] ?? DEFAULT_CATEGORY_COLORS.default!;
}

function pickLabel(id: string): string {
  return DEFAULT_CATEGORY_LABELS[id] ?? id;
}

/**
 * 解析 GeoJSON 为 LoadResult。
 * 只处理 FeatureCollection 中的 Point；其他类型跳过并警告。
 */
export function parseGeoJson(input: unknown): LoadResult {
  const warnings: string[] = [];

  if (!isObject(input)) {
    throw dataError('GeoJSON 必须是对象');
  }
  if (input.type !== 'FeatureCollection') {
    throw dataError('GeoJSON 顶层必须是 FeatureCollection');
  }
  if (!Array.isArray(input.features)) {
    throw dataError('GeoJSON 缺少 features 数组');
  }

  const grouped = new Map<string, Pin[]>();
  const features = input.features;
  const limit = Math.min(features.length, LIMITS.MAX_PINS);

  if (features.length > LIMITS.MAX_PINS) {
    warnings.push(`GeoJSON 超过 ${LIMITS.MAX_PINS} 个 feature，已截断`);
  }

  for (let i = 0; i < limit; i++) {
    const f = features[i];
    if (!isObject(f) || f.type !== 'Feature') {
      warnings.push(`第 ${i} 个 feature 不是 Feature，已跳过`);
      continue;
    }
    const geom = f.geometry;
    if (!isObject(geom) || geom.type !== 'Point') {
      warnings.push(`第 ${i} 个 feature 不是 Point，已跳过`);
      continue;
    }
    const coords = geom.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      warnings.push(`第 ${i} 个 feature 坐标无效，已跳过`);
      continue;
    }
    const lng = coords[0];
    const lat = coords[1];
    if (
      typeof lng !== 'number' ||
      typeof lat !== 'number' ||
      lng < -180 ||
      lng > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      warnings.push(`第 ${i} 个 feature 坐标越界，已跳过`);
      continue;
    }

    const props = isObject(f.properties) ? f.properties : {};
    const rawName = typeof props.name === 'string' && props.name.trim() ? props.name : '未命名';
    const rawCat =
      typeof props.category === 'string' && props.category.trim() ? props.category : 'default';
    const catId = /^[a-z][a-z0-9-]*$/.test(rawCat) ? rawCat : 'default';

    const pin: Pin = {
      name: rawName.slice(0, LIMITS.MAX_NAME_LEN),
      coords: [lng, lat],
    };
    if (typeof props.date === 'string') pin.date = props.date;
    if (typeof props.note === 'string') pin.note = props.note.slice(0, LIMITS.MAX_NOTE_LEN);
    if (Array.isArray(props.photos)) {
      const list = props.photos
        .filter((p): p is string => typeof p === 'string')
        .slice(0, LIMITS.MAX_PHOTOS);
      if (list.length > 0) pin.photos = list;
    }

    const arr = grouped.get(catId) ?? [];
    arr.push(pin);
    grouped.set(catId, arr);
  }

  const categories: Category[] = [];
  for (const [id, pins] of grouped) {
    categories.push({
      id,
      label: pickLabel(id),
      color: pickColor(id),
      pins,
    });
  }

  const config: FootprintConfig = {
    version: 1,
    categories,
  };

  return { config, warnings };
}
