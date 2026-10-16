/**
 * 足迹地球 · Builder 状态管理
 * 契约依据：《Sprint 3 执行方案》§4.1
 */

import {
  FootprintError,
  normalizeConfig,
  parseCsv,
  parseGeoJson,
  validateConfig,
  type Category,
  type FootprintConfig,
  type RenderConfig,
} from 'footprint-globe';
import { getExample, type ExampleId } from './examples';

export type DataSource = 'json' | 'csv' | 'example';
export type ExportType = 'web-component' | 'iframe' | 'npm';

export interface BuilderState {
  source: DataSource;
  raw: string;
  config: FootprintConfig | null;
  errors: FootprintError[];
  warnings: string[];
  preview: Partial<RenderConfig>;
  exportType: ExportType;
  notice: string | null;
}

export type BuilderAction =
  | { type: 'set-raw'; raw: string; source?: DataSource }
  | { type: 'set-source'; source: DataSource }
  | { type: 'set-preview'; preview: Partial<RenderConfig> }
  | { type: 'set-export-type'; exportType: ExportType }
  | { type: 'load-example'; id: ExampleId }
  | { type: 'set-notice'; notice: string | null }
  | {
      type: 'update-category';
      id: string;
      patch: Partial<Pick<Category, 'label' | 'color' | 'icon'>>;
    }
  | { type: 'add-category' }
  | { type: 'remove-category'; id: string }
  | { type: 'set-config'; patch: Partial<RenderConfig> }
  | { type: 'reset' };

export function initialState(): BuilderState {
  return {
    source: 'json',
    raw: '',
    config: null,
    errors: [],
    warnings: [],
    preview: {},
    exportType: 'web-component',
    notice: null,
  };
}

/** 解析 raw 文本为 config（按 source 分流） */
function parseRaw(
  source: DataSource,
  raw: string,
): { config: FootprintConfig | null; errors: FootprintError[]; warnings: string[] } {
  if (!raw.trim()) {
    return { config: null, errors: [], warnings: [] };
  }

  try {
    if (source === 'csv') {
      const r = parseCsv(raw);
      const errs = validateConfig(r.config);
      return { config: r.config, errors: errs, warnings: r.warnings };
    }

    if (source === 'json') {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        return {
          config: null,
          errors: [new FootprintError('CONFIG_INVALID', e, 'JSON 解析失败：请检查格式。')],
          warnings: [],
        };
      }

      // GeoJSON 兼容
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        (parsed as { type?: string }).type === 'FeatureCollection'
      ) {
        const r = parseGeoJson(parsed);
        const errs = validateConfig(r.config);
        return { config: r.config, errors: errs, warnings: r.warnings };
      }

      const normalized = normalizeConfig(parsed);
      const errs = validateConfig(normalized);
      return { config: normalized, errors: errs, warnings: [] };
    }

    // example
    return { config: null, errors: [], warnings: [] };
  } catch (e) {
    return {
      config: null,
      errors: [e instanceof FootprintError ? e : new FootprintError('CONFIG_INVALID', e)],
      warnings: [],
    };
  }
}

/** 把编辑后的 config 同步回 raw（JSON），切换到 json source */
function syncFromConfig(state: BuilderState, nextConfig: FootprintConfig): BuilderState {
  return {
    ...state,
    source: 'json',
    raw: JSON.stringify(nextConfig, null, 2),
    config: nextConfig,
    errors: [],
    warnings: [],
    notice: null,
  };
}

/** 生成不与现有分类冲突的新 id */
function nextCategoryId(categories: Category[]): string {
  const existing = new Set(categories.map((c) => c.id));
  let i = 1;
  while (existing.has(`category-${i}`)) i++;
  return `category-${i}`;
}

/** 分类调色板：新分类默认色 */
const PALETTE = ['#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#ef4444'];

function pickColor(categories: Category[]): string {
  return PALETTE[categories.length % PALETTE.length]!;
}

export function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'set-raw': {
      const source = action.source ?? state.source;
      const { config, errors, warnings } = parseRaw(source, action.raw);
      return { ...state, source, raw: action.raw, config, errors, warnings, notice: null };
    }

    case 'set-source': {
      const { config, errors, warnings } = parseRaw(action.source, state.raw);
      return { ...state, source: action.source, config, errors, warnings, notice: null };
    }

    case 'set-preview':
      return { ...state, preview: { ...state.preview, ...action.preview }, notice: null };

    case 'set-export-type':
      return { ...state, exportType: action.exportType };

    case 'load-example': {
      const example = getExample(action.id);
      if (!example) return state;
      const raw = JSON.stringify(example.config, null, 2);
      const { config, errors, warnings } = parseRaw('json', raw);
      return {
        ...state,
        source: 'json',
        raw,
        config,
        errors,
        warnings,
        notice: `已加载示例：${example.label}`,
      };
    }

    case 'set-notice':
      return { ...state, notice: action.notice };

    case 'update-category': {
      if (!state.config) return state;
      const categories = state.config.categories.map((c) =>
        c.id === action.id ? { ...c, ...action.patch } : c,
      );
      const nextConfig: FootprintConfig = { ...state.config, categories };
      const errs = validateConfig(nextConfig);
      if (errs.length > 0) {
        return { ...state, errors: errs };
      }
      return syncFromConfig(state, nextConfig);
    }

    case 'add-category': {
      if (!state.config) return state;
      if (state.config.categories.length >= 8) {
        return { ...state, notice: '最多 8 个分类' };
      }
      const newCategory: Category = {
        id: nextCategoryId(state.config.categories),
        label: '新分类',
        color: pickColor(state.config.categories),
        pins: [],
      };
      const nextConfig: FootprintConfig = {
        ...state.config,
        categories: [...state.config.categories, newCategory],
      };
      return syncFromConfig(state, nextConfig);
    }

    case 'remove-category': {
      if (!state.config) return state;
      if (state.config.categories.length <= 1) {
        return { ...state, notice: '至少保留 1 个分类' };
      }
      const categories = state.config.categories.filter((c) => c.id !== action.id);
      const nextConfig: FootprintConfig = { ...state.config, categories };
      return syncFromConfig(state, nextConfig);
    }

    case 'set-config': {
      if (!state.config) return state;
      const nextConfig: FootprintConfig = {
        ...state.config,
        config: { ...state.config.config, ...action.patch },
      };
      const errs = validateConfig(nextConfig);
      if (errs.length > 0) {
        return { ...state, errors: errs };
      }
      return syncFromConfig(state, nextConfig);
    }

    case 'reset':
      return initialState();
  }
}
