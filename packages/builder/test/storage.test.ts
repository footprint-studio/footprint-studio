import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  clearDraft,
  createDebouncedSaver,
  isStorageAvailable,
  loadDraft,
  saveDraft,
} from '../src/storage';
import { initialState } from '../src/state';

function stateWith(raw: string) {
  return { ...initialState(), raw, config: null };
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('isStorageAvailable', () => {
    it('returns true in jsdom', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('returns false when setItem throws', () => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('quota');
      };
      expect(isStorageAvailable()).toBe(false);
      Storage.prototype.setItem = orig;
    });
  });

  describe('saveDraft / loadDraft', () => {
    it('saves and loads draft', () => {
      const s = stateWith('{"version":1,"categories":[]}');
      expect(saveDraft(s)).toBe(true);
      const d = loadDraft();
      expect(d).not.toBeNull();
      expect(d!.raw).toBe(s.raw);
      expect(d!.version).toBe(1);
      expect(d!.source).toBe('json');
    });

    it('returns false for empty state', () => {
      const s = initialState();
      expect(saveDraft(s)).toBe(false);
    });

    it('returns null when no draft', () => {
      expect(loadDraft()).toBeNull();
    });

    it('returns null on corrupted JSON', () => {
      localStorage.setItem('footprint-studio:builder:draft', '{not json');
      expect(loadDraft()).toBeNull();
    });

    it('returns null on wrong version', () => {
      localStorage.setItem(
        'footprint-studio:builder:draft',
        JSON.stringify({ version: 99, raw: 'x' }),
      );
      expect(loadDraft()).toBeNull();
    });

    it('returns null when raw not a string', () => {
      localStorage.setItem(
        'footprint-studio:builder:draft',
        JSON.stringify({ version: 1, raw: 42 }),
      );
      expect(loadDraft()).toBeNull();
    });

    it('saves preview and exportType', () => {
      const s = {
        ...initialState(),
        raw: 'x',
        preview: { theme: 'dark' as const },
        exportType: 'iframe' as const,
      };
      saveDraft(s);
      const d = loadDraft();
      expect(d!.preview).toEqual({ theme: 'dark' });
      expect(d!.exportType).toBe('iframe');
    });

    it('refuses payload > 100KB', () => {
      const huge = 'x'.repeat(120 * 1024);
      expect(saveDraft(stateWith(huge))).toBe(false);
    });
  });

  describe('clearDraft', () => {
    it('removes the draft', () => {
      saveDraft(stateWith('data'));
      clearDraft();
      expect(loadDraft()).toBeNull();
    });

    it('is idempotent', () => {
      clearDraft();
      clearDraft();
      expect(loadDraft()).toBeNull();
    });
  });

  describe('createDebouncedSaver', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('writes after debounce delay', () => {
      const s = stateWith('payload');
      const saver = createDebouncedSaver(100);
      saver.save(s);
      expect(loadDraft()).toBeNull();
      vi.advanceTimersByTime(150);
      expect(loadDraft()).not.toBeNull();
    });

    it('cancels previous timer on new save', () => {
      const s1 = stateWith('first');
      const s2 = stateWith('second');
      const saver = createDebouncedSaver(100);
      saver.save(s1);
      vi.advanceTimersByTime(50);
      saver.save(s2);
      vi.advanceTimersByTime(100);
      const d = loadDraft();
      expect(d!.raw).toBe('second');
    });

    it('flush writes immediately', () => {
      const s = stateWith('flush-me');
      const saver = createDebouncedSaver(1000);
      saver.save(s);
      const ok = saver.flush(s);
      expect(ok).toBe(true);
      expect(loadDraft()).not.toBeNull();
      // 之后再走到期时间也不会重复写
      vi.advanceTimersByTime(2000);
      expect(loadDraft()!.raw).toBe('flush-me');
    });

    it('cancel prevents write', () => {
      const s = stateWith('cancel-me');
      const saver = createDebouncedSaver(100);
      saver.save(s);
      saver.cancel();
      vi.advanceTimersByTime(500);
      expect(loadDraft()).toBeNull();
    });
  });
});
