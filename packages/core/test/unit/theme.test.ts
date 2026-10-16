import { describe, it, expect, vi, afterEach } from 'vitest';
import { ThemeManager, styleForTheme } from '../../src/theme-manager';

describe('ThemeManager', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies light theme attribute', () => {
    const container = document.createElement('div');
    const tm = new ThemeManager(container);
    tm.apply('light');
    expect(container.getAttribute('data-fp-theme')).toBe('light');
    tm.destroy();
  });

  it('applies dark theme attribute', () => {
    const container = document.createElement('div');
    const tm = new ThemeManager(container);
    tm.apply('dark');
    expect(container.getAttribute('data-fp-theme')).toBe('dark');
    tm.destroy();
  });

  it('auto follows prefers-color-scheme and reacts to change', () => {
    let handler: ((e: MediaQueryListEvent) => void) | null = null;
    const mql = {
      matches: false,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        handler = cb;
      },
      removeEventListener: vi.fn(),
    };
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList);

    const container = document.createElement('div');
    const tm = new ThemeManager(container);
    tm.apply('auto');
    expect(container.getAttribute('data-fp-theme')).toBe('light');

    // 模拟系统切换为深色
    mql.matches = true;
    handler!({} as MediaQueryListEvent);
    expect(container.getAttribute('data-fp-theme')).toBe('dark');

    tm.destroy();
  });

  it('auto falls back to light when matchMedia missing', () => {
    const original = window.matchMedia;
    // @ts-expect-error 模拟无 matchMedia 环境
    delete window.matchMedia;
    const container = document.createElement('div');
    const tm = new ThemeManager(container);
    tm.apply('auto');
    expect(container.getAttribute('data-fp-theme')).toBe('light');
    tm.destroy();
    window.matchMedia = original;
  });

  it('destroy removes theme attribute and detaches media listener', () => {
    const removeSpy = vi.fn();
    const mql = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: removeSpy,
    };
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList);
    const container = document.createElement('div');
    const tm = new ThemeManager(container);
    tm.apply('auto');
    tm.destroy();
    expect(container.getAttribute('data-fp-theme')).toBeNull();
    expect(removeSpy).toHaveBeenCalled();
  });

  it('styleForTheme returns matching style URL', () => {
    expect(styleForTheme('dark')).toContain('dark-matter');
    expect(styleForTheme('light')).toContain('positron');
    expect(styleForTheme('auto')).toContain('positron');
  });
});
