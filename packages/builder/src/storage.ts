/**
 * 足迹地球 · Builder 本地草稿
 * 契约依据：《Sprint 3 执行方案》§9 S3-7
 * 决策：S3-Q6=B（恢复时弹提示）
 */

import type { BuilderState } from './state';

const STORAGE_KEY = 'footprint-studio:builder:draft';
const MAX_BYTES = 100 * 1024; // 100KB
const DEBOUNCE_MS = 500;

export interface DraftPayload {
  version: 1;
  savedAt: number;
  source: BuilderState['source'];
  raw: string;
  preview: BuilderState['preview'];
  exportType: BuilderState['exportType'];
}

/** 检测 localStorage 是否可用（隐私模式可能禁用） */
export function isStorageAvailable(): boolean {
  try {
    const key = '__fp_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function byteLength(s: string): number {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
  return s.length;
}

/** 保存草稿，超出上限时静默失败（返回 false） */
export function saveDraft(state: BuilderState): boolean {
  if (!isStorageAvailable()) return false;
  // 空状态不写
  if (!state.raw.trim() && Object.keys(state.preview).length === 0) return false;

  const payload: DraftPayload = {
    version: 1,
    savedAt: Date.now(),
    source: state.source,
    raw: state.raw,
    preview: state.preview,
    exportType: state.exportType,
  };

  const json = JSON.stringify(payload);
  if (byteLength(json) > MAX_BYTES) return false;

  try {
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch {
    return false;
  }
}

/** 读取草稿，无或损坏时返回 null */
export function loadDraft(): DraftPayload | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as { version?: unknown }).version !== 1
    ) {
      return null;
    }
    const p = parsed as DraftPayload;
    if (typeof p.raw !== 'string') return null;
    return p;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

/** 带防抖的保存器 */
export function createDebouncedSaver(delay: number = DEBOUNCE_MS): {
  save: (state: BuilderState) => void;
  flush: (state: BuilderState) => boolean;
  cancel: () => void;
} {
  let timer: number | null = null;
  let pending: BuilderState | null = null;

  return {
    save(state) {
      pending = state;
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = null;
        if (pending) {
          saveDraft(pending);
          pending = null;
        }
      }, delay);
    },
    flush(state) {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      pending = null;
      return saveDraft(state);
    },
    cancel() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      pending = null;
    },
  };
}
