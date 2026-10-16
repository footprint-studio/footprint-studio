import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataPanel } from '../src/panels/data-panel';
import { ConfigPanel } from '../src/panels/config-panel';
import { ExportPanel } from '../src/panels/export-panel';
import { HeaderActions } from '../src/panels/header-actions';
import { initialState, reducer, type BuilderState } from '../src/state';
import type { FootprintConfig } from 'footprint-globe';

const VALID_JSON = JSON.stringify({
  version: 1,
  categories: [
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [{ name: '东京', coords: [139.759, 35.682] }],
    },
  ],
  config: { theme: 'light', zoom: 1.2, legend: true },
});

function loadedState(): BuilderState {
  return reducer(initialState(), { type: 'set-raw', raw: VALID_JSON });
}

describe('DataPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('mounts with tabs and textarea', () => {
    const panel = new DataPanel({
      onRawChange: vi.fn(),
      onSourceChange: vi.fn(),
      onLoadExample: vi.fn(),
    });
    document.body.appendChild(panel.element);
    panel.mount();
    expect(panel.element.querySelectorAll('.builder-tab').length).toBe(3);
    expect(panel.element.querySelector('.builder-textarea')).toBeTruthy();
  });

  it('emits onSourceChange when tab clicked', () => {
    const onSourceChange = vi.fn();
    const panel = new DataPanel({
      onRawChange: vi.fn(),
      onSourceChange,
      onLoadExample: vi.fn(),
    });
    document.body.appendChild(panel.element);
    panel.mount();
    const tab = panel.element.querySelector<HTMLButtonElement>('.builder-tab[data-source="csv"]')!;
    tab.click();
    expect(onSourceChange).toHaveBeenCalledWith('csv');
  });

  it('debounces raw input by 300ms', () => {
    const onRawChange = vi.fn();
    const panel = new DataPanel({
      onRawChange,
      onSourceChange: vi.fn(),
      onLoadExample: vi.fn(),
    });
    document.body.appendChild(panel.element);
    panel.mount();
    const ta = panel.element.querySelector<HTMLTextAreaElement>('.builder-textarea')!;
    ta.value = '{"version":1}';
    ta.dispatchEvent(new Event('input'));
    expect(onRawChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(350);
    expect(onRawChange).toHaveBeenCalledWith('{"version":1}', 'json');
  });

  it('update syncs textarea value and error visibility', () => {
    const panel = new DataPanel({
      onRawChange: vi.fn(),
      onSourceChange: vi.fn(),
      onLoadExample: vi.fn(),
    });
    document.body.appendChild(panel.element);
    panel.mount();

    panel.update(loadedState());
    const ta = panel.element.querySelector<HTMLTextAreaElement>('.builder-textarea')!;
    expect(ta.value).toContain('travel');
    expect((panel.element.querySelector('.builder-errors') as HTMLElement).hidden).toBe(true);

    panel.update(reducer(loadedState(), { type: 'set-raw', raw: '{bad' }));
    const errors = panel.element.querySelector('.builder-errors') as HTMLElement;
    expect(errors.hidden).toBe(false);
    expect(errors.textContent).toContain('JSON');

    // 切到 example source：输入区隐藏，示例列表显示
    panel.update(reducer(initialState(), { type: 'set-source', source: 'example' }));
    expect((panel.element.querySelector('.builder-data-input') as HTMLElement).hidden).toBe(true);
    expect((panel.element.querySelector('.builder-data-examples') as HTMLElement).hidden).toBe(
      false,
    );
    expect(panel.element.querySelectorAll('.builder-example-btn').length).toBe(3);
  });

  it('emits onLoadExample when example button clicked', () => {
    const onLoadExample = vi.fn();
    const panel = new DataPanel({
      onRawChange: vi.fn(),
      onSourceChange: vi.fn(),
      onLoadExample,
    });
    document.body.appendChild(panel.element);
    panel.mount();
    const btn = panel.element.querySelector<HTMLButtonElement>(
      '.builder-example-btn[data-example="travel"]',
    )!;
    btn.click();
    expect(onLoadExample).toHaveBeenCalledWith('travel');
  });
});

describe('ConfigPanel', () => {
  function makePanel() {
    const handlers = {
      onUpdateCategory: vi.fn(),
      onAddCategory: vi.fn(),
      onRemoveCategory: vi.fn(),
      onSetConfig: vi.fn(),
    };
    const panel = new ConfigPanel(handlers);
    document.body.appendChild(panel.element);
    panel.mount();
    return { panel, handlers };
  }

  it('mounts with radio groups', () => {
    const { panel } = makePanel();
    expect(panel.element.querySelectorAll('input[name="builder-theme"]').length).toBe(3);
    expect(panel.element.querySelectorAll('input[name="builder-projection"]').length).toBe(2);
  });

  it('update renders category rows and syncs fields', () => {
    const { panel } = makePanel();
    panel.update(loadedState());
    expect(panel.element.querySelectorAll('.builder-category-row').length).toBe(1);
    const color = panel.element.querySelector<HTMLInputElement>('.builder-color')!;
    expect(color.value).toBe('#f97316');
    const zoom = panel.element.querySelector<HTMLInputElement>('[data-field="zoom"]')!;
    expect(Number(zoom.value)).toBe(1.2);
    const legend = panel.element.querySelector<HTMLInputElement>('[data-field="legend"]')!;
    expect(legend.checked).toBe(true);
  });

  it('update clears rows when no config', () => {
    const { panel } = makePanel();
    panel.update(loadedState());
    panel.update(initialState());
    expect(panel.element.querySelectorAll('.builder-category-row').length).toBe(0);
  });

  it('emits onUpdateCategory on label input', () => {
    const { panel, handlers } = makePanel();
    panel.update(loadedState());
    const label = panel.element.querySelector<HTMLInputElement>('[data-cat-field="label"]')!;
    label.value = '新标签';
    label.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handlers.onUpdateCategory).toHaveBeenCalledWith('travel', { label: '新标签' });
  });

  it('emits onSetConfig on theme radio change', () => {
    const { panel, handlers } = makePanel();
    panel.update(loadedState());
    const dark = panel.element.querySelector<HTMLInputElement>(
      'input[name="builder-theme"][value="dark"]',
    )!;
    dark.checked = true;
    dark.dispatchEvent(new Event('change', { bubbles: true }));
    expect(handlers.onSetConfig).toHaveBeenCalledWith({ theme: 'dark' });
  });

  it('emits onSetConfig on zoom / legend / privacy inputs', () => {
    const { panel, handlers } = makePanel();
    panel.update(loadedState());

    const zoom = panel.element.querySelector<HTMLInputElement>('[data-field="zoom"]')!;
    zoom.value = '3';
    zoom.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handlers.onSetConfig).toHaveBeenCalledWith({ zoom: 3 });

    const legend = panel.element.querySelector<HTMLInputElement>('[data-field="legend"]')!;
    legend.checked = false;
    legend.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handlers.onSetConfig).toHaveBeenCalledWith({ legend: false });

    const blur = panel.element.querySelector<HTMLInputElement>('[data-field="privacy-blur"]')!;
    blur.value = '5';
    blur.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handlers.onSetConfig).toHaveBeenCalledWith({ privacy: { blur: 5 } });

    const cityOnly = panel.element.querySelector<HTMLInputElement>(
      '[data-field="privacy-city-only"]',
    )!;
    cityOnly.checked = true;
    cityOnly.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handlers.onSetConfig).toHaveBeenCalledWith({ privacy: { cityOnly: true } });
  });

  it('emits center update from lng/lat inputs', () => {
    const { panel, handlers } = makePanel();
    panel.update(loadedState());
    const lng = panel.element.querySelector<HTMLInputElement>('[data-field="center-lng"]')!;
    lng.value = '10';
    lng.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handlers.onSetConfig).toHaveBeenCalledWith({ center: [10, 30] });
  });

  it('emits add / remove category on button click', () => {
    const { panel, handlers } = makePanel();
    panel.update(loadedState());
    (panel.element.querySelector('.builder-add-category') as HTMLButtonElement).click();
    expect(handlers.onAddCategory).toHaveBeenCalled();

    const remove = panel.element.querySelector<HTMLButtonElement>('.builder-remove-category')!;
    remove.click();
    expect(handlers.onRemoveCategory).toHaveBeenCalledWith('travel');
  });
});

describe('ExportPanel', () => {
  function makePanel() {
    const handlers = { onExportTypeChange: vi.fn() };
    const panel = new ExportPanel(handlers);
    document.body.appendChild(panel.element);
    panel.mount();
    return { panel, handlers };
  }

  it('renders empty hint without config', () => {
    const { panel } = makePanel();
    panel.update(initialState());
    const code = panel.element.querySelector('.builder-code code')!;
    expect(code.textContent).toContain('请先在左侧输入数据');
    expect((panel.element.querySelector('.builder-recommend') as HTMLElement).hidden).toBe(true);
  });

  it('generates web-component code by default', () => {
    const { panel } = makePanel();
    panel.update(loadedState());
    const code = panel.element.querySelector('.builder-code code')!;
    expect(code.textContent).toContain('<footprint-globe');
    const banner = panel.element.querySelector('.builder-recommend') as HTMLElement;
    expect(banner.hidden).toBe(false);
    expect(banner.textContent).toContain('data-pins');
  });

  it('switches tabs and generates iframe / npm code', () => {
    const { panel, handlers } = makePanel();
    panel.update(loadedState());

    panel.update(reducer(loadedState(), { type: 'set-export-type', exportType: 'iframe' }));
    let code = panel.element.querySelector('.builder-code code')!;
    expect(code.textContent).toContain('<iframe');
    const active = panel.element.querySelector<HTMLElement>('.builder-tab[data-active="1"]')!;
    expect(active.dataset.exportType).toBe('iframe');

    panel.update(reducer(loadedState(), { type: 'set-export-type', exportType: 'npm' }));
    code = panel.element.querySelector('.builder-code code')!;
    expect(code.textContent).toContain("from 'footprint-globe'");

    // 点击 tab 触发回调
    const tab = panel.element.querySelector<HTMLButtonElement>(
      '.builder-tab[data-export-type="iframe"]',
    )!;
    tab.click();
    expect(handlers.onExportTypeChange).toHaveBeenCalledWith('iframe');
  });

  it('shows switch-to-recommended button for large data', () => {
    const { panel } = makePanel();
    const big = reducer(initialState(), {
      type: 'set-raw',
      raw: JSON.stringify({
        version: 1,
        categories: [
          {
            id: 'travel',
            label: '旅行',
            color: '#f97316',
            pins: Array.from({ length: 400 }, (_, i) => ({
              name: `点位 ${i} 的一个较长名称用于撑大数据体积`,
              coords: [i % 360, i % 180],
            })),
          },
        ],
      }),
    });
    panel.update(big);
    const banner = panel.element.querySelector('.builder-recommend')!;
    expect(banner.textContent).toMatch(/data-src|短链/);
  });

  it('copy uses clipboard when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const { panel } = makePanel();
    panel.update(loadedState());
    (panel.element.querySelector('.builder-btn--copy') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(
      (panel.element.querySelector('.builder-btn--copy') as HTMLButtonElement).textContent,
    ).toContain('已复制');
  });

  it('copy falls back to execCommand', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    const execMock = vi.fn().mockReturnValue(true);
    document.execCommand = execMock as unknown as typeof document.execCommand;
    const { panel } = makePanel();
    panel.update(loadedState());
    (panel.element.querySelector('.builder-btn--copy') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(execMock).toHaveBeenCalledWith('copy'));
  });
});

describe('HeaderActions', () => {
  function makePanel() {
    const handlers = {
      onImportFile: vi.fn(),
      onExportFile: vi.fn(),
      onReset: vi.fn(),
      onNotice: vi.fn(),
    };
    const panel = new HeaderActions(handlers);
    document.body.appendChild(panel.element);
    panel.mount();
    return { panel, handlers };
  }

  it('disables share for empty state', () => {
    const { panel } = makePanel();
    panel.update(initialState());
    const share = panel.element.querySelector<HTMLButtonElement>('[data-action="share"]')!;
    expect(share.disabled).toBe(true);

    panel.update(loadedState());
    expect(share.disabled).toBe(false);
  });

  it('emits export / reset on click', () => {
    const { panel, handlers } = makePanel();
    panel.update(loadedState());
    (panel.element.querySelector('[data-action="export"]') as HTMLButtonElement).click();
    (panel.element.querySelector('[data-action="reset"]') as HTMLButtonElement).click();
    expect(handlers.onExportFile).toHaveBeenCalled();
    expect(handlers.onReset).toHaveBeenCalled();
  });

  it('share copies link via clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const { panel, handlers } = makePanel();
    panel.update(loadedState());
    (panel.element.querySelector('[data-action="share"]') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(handlers.onNotice).toHaveBeenCalledWith('分享链接已复制到剪贴板');
  });

  it('share shows notice when payload too large', async () => {
    const { panel, handlers } = makePanel();
    const big = reducer(initialState(), { type: 'set-raw', raw: 'x'.repeat(20 * 1024) });
    panel.update(big);
    (panel.element.querySelector('[data-action="share"]') as HTMLButtonElement).click();
    await vi.waitFor(() =>
      expect(handlers.onNotice).toHaveBeenCalledWith(expect.stringContaining('4KB')),
    );
  });

  it('emits onImportFile on file selection', () => {
    const { panel, handlers } = makePanel();
    panel.update(loadedState());
    const input = panel.element.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['{}'], 'config.json', { type: 'application/json' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    expect(handlers.onImportFile).toHaveBeenCalledWith(file);
    expect(input.value).toBe('');
  });
});

describe('app state config roundtrip', () => {
  it('reducer output can feed templates', async () => {
    const { generateWebComponent } = await import('../src/templates');
    const s = loadedState();
    const out = generateWebComponent({
      config: s.config as FootprintConfig,
      recommendation: 'inline',
    });
    expect(out).toContain('data-pins=');
  });
});
