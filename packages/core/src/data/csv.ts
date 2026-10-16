/**
 * 足迹地球 · CSV 解析
 * 契约依据：ADR-0001 决策 6、《Sprint 1 执行方案》§6 S1-5
 */

import { DEFAULT_CATEGORY_COLORS, DEFAULT_CATEGORY_LABELS, LIMITS } from '../config/defaults';
import type { Category, FootprintConfig, LoadResult, Pin } from '../config/schema';
import { dataError } from '../errors';

/** 解析一行 CSV，处理引号包裹的字段 */
function parseRow(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

function pickColor(id: string): string {
  return DEFAULT_CATEGORY_COLORS[id] ?? DEFAULT_CATEGORY_COLORS.default!;
}

function pickLabel(id: string): string {
  return DEFAULT_CATEGORY_LABELS[id] ?? id;
}

/**
 * 解析 CSV 文本为 LoadResult。
 * 支持列：name / lng / lat / category / date / note / photos（多值以 | 分隔）
 */
export function parseCsv(text: string): LoadResult {
  const warnings: string[] = [];

  if (text.length > LIMITS.MAX_FILE_SIZE) {
    throw dataError('CSV 文件超过 1MB 上限');
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) throw dataError('CSV 为空');

  const header = parseRow(lines[0]!).map((h) => h.trim().toLowerCase());
  const idx = {
    name: header.indexOf('name'),
    lng: header.indexOf('lng'),
    lat: header.indexOf('lat'),
    category: header.indexOf('category'),
    date: header.indexOf('date'),
    note: header.indexOf('note'),
    photos: header.indexOf('photos'),
  };

  if (idx.name < 0 || idx.lng < 0 || idx.lat < 0) {
    throw dataError('CSV 缺少必填列：name / lng / lat');
  }

  const dataLines = lines.slice(1);
  if (dataLines.length > LIMITS.MAX_PINS) {
    warnings.push(`CSV 超过 ${LIMITS.MAX_PINS} 行，已截断`);
  }

  const grouped = new Map<string, Pin[]>();
  const limit = Math.min(dataLines.length, LIMITS.MAX_PINS);

  for (let i = 0; i < limit; i++) {
    const row = parseRow(dataLines[i]!);
    const name = (row[idx.name] ?? '').trim();
    if (!name) {
      warnings.push(`第 ${i + 2} 行缺少 name，已跳过`);
      continue;
    }

    const lng = Number(row[idx.lng]);
    const lat = Number(row[idx.lat]);
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      warnings.push(`第 ${i + 2} 行经度越界，已跳过`);
      continue;
    }
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      warnings.push(`第 ${i + 2} 行纬度越界，已跳过`);
      continue;
    }

    let catId = 'default';
    if (idx.category >= 0) {
      const raw = (row[idx.category] ?? '').trim();
      if (raw) {
        if (/^[a-z][a-z0-9-]*$/.test(raw)) catId = raw;
        else {
          warnings.push(`第 ${i + 2} 行分类不合法，已归入 default`);
        }
      }
    }

    const pin: Pin = { name: name.slice(0, LIMITS.MAX_NAME_LEN), coords: [lng, lat] };

    if (idx.date >= 0) {
      const d = (row[idx.date] ?? '').trim();
      if (d) pin.date = d;
    }
    if (idx.note >= 0) {
      const n = (row[idx.note] ?? '').trim();
      if (n) pin.note = n.slice(0, LIMITS.MAX_NOTE_LEN);
    }
    if (idx.photos >= 0) {
      const p = (row[idx.photos] ?? '').trim();
      if (p) {
        const list = p
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, LIMITS.MAX_PHOTOS);
        if (list.length > 0) pin.photos = list;
      }
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

  // 保证 id 顺序稳定（按首次出现顺序）
  const config: FootprintConfig = {
    version: 1,
    categories,
  };

  return { config, warnings };
}
