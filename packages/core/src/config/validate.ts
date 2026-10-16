/**
 * 足迹地球 · 配置校验
 * 契约依据：ADR-0001 决策 6、《Sprint 1 执行方案》§6 S1-2
 */

import { configError, type FootprintError } from '../errors';
import { LIMITS } from './defaults';
import type { Category, FootprintConfig, Pin } from './schema';

const CATEGORY_ID_RE = /^[a-z][a-z0-9-]*$/;
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const DATA_ID_RE = /^[0-9a-zA-Z_-]{8}$/;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function validatePin(pin: unknown, categoryId: string, index: number): FootprintError[] {
  const errs: FootprintError[] = [];
  const path = `categories[${categoryId}].pins[${index}]`;

  if (!isObject(pin)) {
    errs.push(configError(path, '必须是对象'));
    return errs;
  }

  if (typeof pin.name !== 'string' || pin.name.length === 0) {
    errs.push(configError(`${path}.name`, '必须是非空字符串'));
  } else if (pin.name.length > LIMITS.MAX_NAME_LEN) {
    errs.push(configError(`${path}.name`, `长度不得超过 ${LIMITS.MAX_NAME_LEN}`));
  }

  if (!Array.isArray(pin.coords) || pin.coords.length !== 2) {
    errs.push(configError(`${path}.coords`, '必须是 [经度, 纬度] 数组'));
  } else {
    const [lng, lat] = pin.coords;
    if (!isFiniteNumber(lng) || lng < -180 || lng > 180) {
      errs.push(configError(`${path}.coords[0]`, '经度必须在 [-180, 180]'));
    }
    if (!isFiniteNumber(lat) || lat < -90 || lat > 90) {
      errs.push(configError(`${path}.coords[1]`, '纬度必须在 [-90, 90]'));
    }
  }

  if (pin.note !== undefined) {
    if (typeof pin.note !== 'string') {
      errs.push(configError(`${path}.note`, '必须是字符串'));
    } else if (pin.note.length > LIMITS.MAX_NOTE_LEN) {
      errs.push(configError(`${path}.note`, `长度不得超过 ${LIMITS.MAX_NOTE_LEN}`));
    }
  }

  if (pin.photos !== undefined) {
    if (!Array.isArray(pin.photos)) {
      errs.push(configError(`${path}.photos`, '必须是数组'));
    } else if (pin.photos.length > LIMITS.MAX_PHOTOS) {
      errs.push(configError(`${path}.photos`, `最多 ${LIMITS.MAX_PHOTOS} 张`));
    } else if (!pin.photos.every((p) => typeof p === 'string')) {
      errs.push(configError(`${path}.photos`, '数组元素必须是字符串'));
    }
  }

  return errs;
}

function validateCategory(cat: unknown, index: number): FootprintError[] {
  const errs: FootprintError[] = [];
  const path = `categories[${index}]`;

  if (!isObject(cat)) {
    errs.push(configError(path, '必须是对象'));
    return errs;
  }

  if (typeof cat.id !== 'string' || !CATEGORY_ID_RE.test(cat.id)) {
    errs.push(configError(`${path}.id`, '必须匹配 ^[a-z][a-z0-9-]*$'));
  }

  if (typeof cat.label !== 'string' || cat.label.length === 0) {
    errs.push(configError(`${path}.label`, '必须是非空字符串'));
  }

  if (typeof cat.color !== 'string' || !HEX_COLOR_RE.test(cat.color)) {
    errs.push(configError(`${path}.color`, '必须是 #RGB 或 #RRGGBB'));
  }

  if (cat.icon !== undefined) {
    const valid = ['dot', 'pin', 'star'];
    if (typeof cat.icon !== 'string' || !valid.includes(cat.icon)) {
      errs.push(configError(`${path}.icon`, `必须是 ${valid.join(' / ')}`));
    }
  }

  if (!Array.isArray(cat.pins)) {
    errs.push(configError(`${path}.pins`, '必须是数组'));
  } else {
    const catId = typeof cat.id === 'string' ? cat.id : String(index);
    cat.pins.forEach((p: unknown, i: number) => {
      errs.push(...validatePin(p, catId, i));
    });
  }

  return errs;
}

function validateRenderConfig(rc: unknown): FootprintError[] {
  const errs: FootprintError[] = [];
  if (!isObject(rc)) return errs;

  if (rc.projection !== undefined) {
    if (rc.projection !== 'globe' && rc.projection !== 'mercator') {
      errs.push(configError('config.projection', '必须是 globe 或 mercator'));
    }
  }
  if (rc.theme !== undefined) {
    const valid = ['light', 'dark', 'auto'];
    if (typeof rc.theme !== 'string' || !valid.includes(rc.theme)) {
      errs.push(configError('config.theme', `必须是 ${valid.join(' / ')}`));
    }
  }
  if (rc.style !== undefined && typeof rc.style !== 'string') {
    errs.push(configError('config.style', '必须是字符串'));
  }
  if (rc.maplibreUrl !== undefined && typeof rc.maplibreUrl !== 'string') {
    errs.push(configError('config.maplibreUrl', '必须是字符串'));
  }
  if (rc.zoom !== undefined && !isFiniteNumber(rc.zoom)) {
    errs.push(configError('config.zoom', '必须是数字'));
  }
  if (rc.legend !== undefined && typeof rc.legend !== 'boolean') {
    errs.push(configError('config.legend', '必须是布尔值'));
  }
  if (rc.autorotate !== undefined && typeof rc.autorotate !== 'boolean') {
    errs.push(configError('config.autorotate', '必须是布尔值'));
  }
  if (rc.privacy !== undefined && isObject(rc.privacy)) {
    if (rc.privacy.blur !== undefined && !isFiniteNumber(rc.privacy.blur)) {
      errs.push(configError('config.privacy.blur', '必须是数字'));
    }
    if (rc.privacy.cityOnly !== undefined && typeof rc.privacy.cityOnly !== 'boolean') {
      errs.push(configError('config.privacy.cityOnly', '必须是布尔值'));
    }
  }

  return errs;
}

/**
 * 校验配置对象，返回所有错误。空数组表示通过。
 */
export function validateConfig(input: unknown): FootprintError[] {
  const errs: FootprintError[] = [];

  if (!isObject(input)) {
    errs.push(configError('root', '必须是对象'));
    return errs;
  }

  if (input.version !== 1) {
    errs.push(configError('version', '必须为 1'));
  }

  if (input.dataId !== undefined) {
    if (typeof input.dataId !== 'string' || !DATA_ID_RE.test(input.dataId)) {
      errs.push(configError('dataId', '必须是 8 位 [0-9a-zA-Z_-]'));
    }
  }

  if (!Array.isArray(input.categories)) {
    errs.push(configError('categories', '必须是数组'));
  } else {
    if (input.categories.length === 0) {
      errs.push(configError('categories', '至少 1 个分类'));
    }
    if (input.categories.length > LIMITS.MAX_CATEGORIES) {
      errs.push(configError('categories', `最多 ${LIMITS.MAX_CATEGORIES} 个分类`));
    }
    input.categories.forEach((c: unknown, i: number) => {
      errs.push(...validateCategory(c, i));
    });

    // 检查总 pin 数
    const total = input.categories.reduce((sum: number, c: unknown) => {
      if (isObject(c) && Array.isArray(c.pins)) return sum + c.pins.length;
      return sum;
    }, 0);
    if (total > LIMITS.MAX_PINS) {
      errs.push(configError('categories.pins', `总标记数不得超过 ${LIMITS.MAX_PINS}`));
    }
  }

  if (input.config !== undefined) {
    errs.push(...validateRenderConfig(input.config));
  }

  return errs;
}

/** 断言配置合法，否则抛出第一个错误 */
export function assertValidConfig(input: unknown): asserts input is FootprintConfig {
  const errs = validateConfig(input);
  if (errs.length > 0) {
    throw errs[0]!;
  }
}

// 供外部引用类型（避免 TS 未使用告警）
export type { FootprintConfig, Category, Pin };
