/**
 * 足迹地球 · 主题
 * 契约依据：《Sprint 1 执行方案》§7 S1-11、§15 S1-Q2 / S1-Q9
 */

export type ThemeName = 'light' | 'dark' | 'auto';

const DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark-matter';
const LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/positron';

export class ThemeManager {
  private container: HTMLElement;
  private mediaQuery: MediaQueryList | null = null;
  private mediaHandler: ((e: MediaQueryListEvent) => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  apply(theme: ThemeName): void {
    this.detachMedia();

    if (theme === 'auto') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const sync = () => {
          const dark = this.mediaQuery!.matches;
          this.container.setAttribute('data-fp-theme', dark ? 'dark' : 'light');
        };
        sync();
        this.mediaHandler = sync;
        this.mediaQuery.addEventListener('change', this.mediaHandler);
      } else {
        this.container.setAttribute('data-fp-theme', 'light');
      }
      return;
    }

    this.container.setAttribute('data-fp-theme', theme);
  }

  private detachMedia(): void {
    if (this.mediaQuery && this.mediaHandler) {
      this.mediaQuery.removeEventListener('change', this.mediaHandler);
    }
    this.mediaQuery = null;
    this.mediaHandler = null;
  }

  destroy(): void {
    this.detachMedia();
    this.container.removeAttribute('data-fp-theme');
  }
}

/** 提供按主题取底图样式的辅助 */
export function styleForTheme(theme: ThemeName): string {
  return theme === 'dark' ? DARK_STYLE : LIGHT_STYLE;
}
