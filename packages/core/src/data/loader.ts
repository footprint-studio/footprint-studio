/**
 * 足迹地球 · 数据加载
 * 契约依据：ADR-0001 决策 2、《Sprint 1 执行方案》§6 S1-4
 */

import { normalizeConfig } from '../config/normalize';
import type { FootprintConfig, LoadOptions, LoadResult } from '../config/schema';
import { validateConfig } from '../config/validate';
import { dataError, FootprintError } from '../errors';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

async function fetchJson(url: string): Promise<unknown> {
  if (!url.startsWith('https://')) {
    throw dataError('数据源必须使用 HTTPS');
  }
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    throw dataError('网络请求失败', e);
  }
  if (!res.ok) {
    throw dataError(`请求失败：HTTP ${res.status}`, res.status);
  }
  try {
    return await res.json();
  } catch (e) {
    throw dataError('响应不是有效的 JSON', e);
  }
}

/**
 * 加载并归一化数据。
 * 优先级：id > src > data > globalVar（ADR-0001 决策 2）
 */
export async function loadData(options: LoadOptions = {}): Promise<LoadResult> {
  const warnings: string[] = [];

  // 1. id（v1.1 托管）
  if (options.id) {
    throw dataError('短链托管尚未实现（计划 v1.1 提供）');
  }

  // 2. src
  if (options.src) {
    const raw = await fetchJson(options.src);
    return finalize(raw, warnings);
  }

  // 3. data（inline JSON）
  if (options.data) {
    let raw: unknown;
    try {
      raw = JSON.parse(options.data);
    } catch (e) {
      throw dataError('inline JSON 解析失败', e);
    }
    return finalize(raw, warnings);
  }

  // 4. 全局变量
  const varName = options.globalVar ?? 'FOOTPRINT_PINS';
  const g = globalThis as unknown as Record<string, unknown>;
  const raw = g[varName];
  if (raw === undefined) {
    throw dataError(`未找到全局变量 window.${varName}`);
  }

  return finalize(raw, warnings);
}

function finalize(raw: unknown, warnings: string[]): LoadResult {
  const config = normalizeConfig(raw);

  // 截断保护
  let total = 0;
  for (const cat of config.categories) total += cat.pins.length;
  if (total > 1000) {
    warnings.push(`标记总数 ${total} 超过 1000，已截断`);
    let kept = 0;
    for (const cat of config.categories) {
      const room = 1000 - kept;
      if (cat.pins.length > room) {
        cat.pins = cat.pins.slice(0, Math.max(0, room));
      }
      kept += cat.pins.length;
    }
  }

  const errs = validateConfig(config);
  if (errs.length > 0) {
    const first = errs[0]!;
    throw new FootprintError(
      first.code,
      { ...(isObject(first.detail) ? first.detail : {}), all: errs },
      first.userMessage,
    );
  }

  return { config, warnings };
}

export type { FootprintConfig, LoadResult };
