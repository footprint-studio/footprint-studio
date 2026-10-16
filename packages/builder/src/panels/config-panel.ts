/**
 * 足迹地球 · Builder 配置面板
 * 契约依据：《Sprint 3 执行方案》§7 S3-3 / S3-5
 */

import type { Category, RenderConfig } from 'footprint-globe';
import type { BuilderState } from '../state';

export interface ConfigPanelHandlers {
  onUpdateCategory: (
    id: string,
    patch: Partial<Pick<Category, 'label' | 'color' | 'icon'>>,
  ) => void;
  onAddCategory: () => void;
  onRemoveCategory: (id: string) => void;
  onSetConfig: (patch: Partial<RenderConfig>) => void;
}

const THEMES: Array<{ value: RenderConfig['theme']; label: string }> = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'auto', label: '跟随系统' },
];

const PROJECTIONS: Array<{ value: RenderConfig['projection']; label: string }> = [
  { value: 'globe', label: '3D 地球' },
  { value: 'mercator', label: '平面地图' },
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class ConfigPanel {
  private root: HTMLElement;
  private handlers: ConfigPanelHandlers;
  private categoriesEl: HTMLElement | null = null;
  private categorySignature = '';

  constructor(handlers: ConfigPanelHandlers) {
    this.handlers = handlers;
    this.root = document.createElement('section');
    this.root.className = 'builder-panel builder-panel--config';
    this.root.setAttribute('aria-label', '配置面板');
  }

  get element(): HTMLElement {
    return this.root;
  }

  mount(): void {
    this.root.innerHTML = `
      <header class="builder-panel__header">
        <h2 class="builder-panel__title">配置</h2>
      </header>
      <div class="builder-panel__body">

        <fieldset class="builder-group">
          <legend class="builder-group__legend">分类</legend>
          <div class="builder-categories"></div>
          <button type="button" class="builder-btn builder-btn--ghost builder-add-category">
            + 添加分类
          </button>
        </fieldset>

        <fieldset class="builder-group">
          <legend class="builder-group__legend">主题</legend>
          <div class="builder-radio-group" data-field="theme"></div>
        </fieldset>

        <fieldset class="builder-group">
          <legend class="builder-group__legend">投影</legend>
          <div class="builder-radio-group" data-field="projection"></div>
        </fieldset>

        <fieldset class="builder-group">
          <legend class="builder-group__legend">视角</legend>
          <div class="builder-field-row">
            <label class="builder-field">
              <span class="builder-field__label">经度</span>
              <input type="number" class="builder-input" data-field="center-lng" step="1" />
            </label>
            <label class="builder-field">
              <span class="builder-field__label">纬度</span>
              <input type="number" class="builder-input" data-field="center-lat" step="1" />
            </label>
            <label class="builder-field">
              <span class="builder-field__label">缩放</span>
              <input type="number" class="builder-input" data-field="zoom" step="0.1" min="0" max="20" />
            </label>
          </div>
        </fieldset>

        <fieldset class="builder-group">
          <legend class="builder-group__legend">显示</legend>
          <label class="builder-switch">
            <input type="checkbox" data-field="legend" />
            <span>显示图例</span>
          </label>
          <label class="builder-switch">
            <input type="checkbox" data-field="autorotate" />
            <span>自动旋转</span>
          </label>
        </fieldset>

        <fieldset class="builder-group">
          <legend class="builder-group__legend">隐私</legend>
          <label class="builder-field">
            <span class="builder-field__label">坐标模糊（公里）</span>
            <input type="number" class="builder-input" data-field="privacy-blur" min="0" step="1" />
          </label>
          <label class="builder-switch">
            <input type="checkbox" data-field="privacy-city-only" />
            <span>仅显示城市级坐标</span>
          </label>
        </fieldset>

      </div>
    `;

    this.categoriesEl = this.root.querySelector<HTMLElement>('.builder-categories');

    this.renderRadios('theme', THEMES);
    this.renderRadios('projection', PROJECTIONS);
    this.bindEvents();
  }

  private renderRadios(
    field: string,
    options: Array<{ value: string | undefined; label: string }>,
  ): void {
    const container = this.root.querySelector<HTMLElement>(
      `.builder-radio-group[data-field="${field}"]`,
    );
    if (!container) return;
    container.innerHTML = '';
    for (const opt of options) {
      const id = `builder-${field}-${opt.value ?? 'default'}`;
      const wrapper = document.createElement('label');
      wrapper.className = 'builder-radio';
      wrapper.innerHTML = `
        <input type="radio" name="builder-${field}" id="${id}" value="${opt.value ?? ''}" data-field="${field}" />
        <span>${escapeHtml(opt.label)}</span>
      `;
      container.appendChild(wrapper);
    }
  }

  private bindEvents(): void {
    // 分类区 + 通用字段：事件委托
    this.root.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;
      if (!target.matches('input, select')) return;

      if (target.closest('.builder-categories')) {
        this.handleCategoryInput(target);
        return;
      }

      const field = target.dataset.field;
      if (!field) return;
      this.handleFieldInput(field, target as HTMLInputElement);
    });

    this.root.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('input[type="radio"]')) {
        const field = target.dataset.field;
        if (field === 'theme' || field === 'projection') {
          this.handlers.onSetConfig({
            [field]: (target as HTMLInputElement).value,
          } as Partial<RenderConfig>);
        }
      }
    });

    this.root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      if (target.closest('.builder-add-category')) {
        this.handlers.onAddCategory();
        return;
      }

      const removeBtn = target.closest<HTMLButtonElement>('.builder-remove-category');
      if (removeBtn) {
        const id = removeBtn.dataset.categoryId;
        if (id) this.handlers.onRemoveCategory(id);
      }
    });
  }

  private handleCategoryInput(target: HTMLElement): void {
    const row = target.closest<HTMLElement>('.builder-category-row');
    if (!row) return;
    const id = row.dataset.categoryId;
    if (!id) return;

    const field = target.dataset.catField;
    if (!field) return;

    if (field === 'color') {
      this.handlers.onUpdateCategory(id, { color: (target as HTMLInputElement).value });
    } else if (field === 'label') {
      this.handlers.onUpdateCategory(id, { label: (target as HTMLInputElement).value });
    }
  }

  private handleFieldInput(field: string, el: HTMLInputElement): void {
    if (field === 'center-lng' || field === 'center-lat') {
      const lng = Number(
        this.root.querySelector<HTMLInputElement>('[data-field="center-lng"]')?.value ?? 0,
      );
      const lat = Number(
        this.root.querySelector<HTMLInputElement>('[data-field="center-lat"]')?.value ?? 0,
      );
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        this.handlers.onSetConfig({ center: [lng, lat] });
      }
      return;
    }

    if (field === 'zoom') {
      const zoom = Number(el.value);
      if (Number.isFinite(zoom)) this.handlers.onSetConfig({ zoom });
      return;
    }

    if (field === 'legend' || field === 'autorotate' || field === 'privacy-city-only') {
      const checked = el.checked;
      if (field === 'legend') this.handlers.onSetConfig({ legend: checked });
      else if (field === 'autorotate') this.handlers.onSetConfig({ autorotate: checked });
      else this.handlers.onSetConfig({ privacy: { cityOnly: checked } });
      return;
    }

    if (field === 'privacy-blur') {
      const n = Number(el.value);
      if (Number.isFinite(n) && n >= 0) {
        this.handlers.onSetConfig({ privacy: { blur: n } });
      }
    }
  }

  update(state: BuilderState): void {
    const config = state.config;
    if (!config) {
      this.renderEmpty();
      return;
    }

    this.renderCategories(config.categories);
    this.syncRadios('theme', config.config?.theme ?? 'light');
    this.syncRadios('projection', config.config?.projection ?? 'globe');
    this.syncNumberInput('center-lng', config.config?.center?.[0] ?? 100);
    this.syncNumberInput('center-lat', config.config?.center?.[1] ?? 30);
    this.syncNumberInput('zoom', config.config?.zoom ?? 1.2);
    this.syncCheckbox('legend', config.config?.legend !== false);
    this.syncCheckbox('autorotate', config.config?.autorotate === true);
    this.syncNumberInput('privacy-blur', config.config?.privacy?.blur ?? 0);
    this.syncCheckbox('privacy-city-only', config.config?.privacy?.cityOnly === true);
  }

  private renderEmpty(): void {
    if (this.categoriesEl) this.categoriesEl.innerHTML = '';
    this.categorySignature = '';
  }

  private renderCategories(categories: Category[]): void {
    const sig = JSON.stringify(categories.map((c) => [c.id, c.label, c.color]));
    if (sig === this.categorySignature) return;
    this.categorySignature = sig;

    if (!this.categoriesEl) return;
    this.categoriesEl.innerHTML = '';

    for (const cat of categories) {
      const row = document.createElement('div');
      row.className = 'builder-category-row';
      row.dataset.categoryId = cat.id;
      row.innerHTML = `
        <input
          type="color"
          class="builder-color"
          data-cat-field="color"
          value="${cat.color}"
          aria-label="分类颜色" />
        <input
          type="text"
          class="builder-input builder-input--flex"
          data-cat-field="label"
          value="${escapeHtml(cat.label)}"
          aria-label="分类名称" />
        <span class="builder-category-count" title="标记数">${cat.pins.length}</span>
        <button
          type="button"
          class="builder-btn builder-btn--icon builder-remove-category"
          data-category-id="${cat.id}"
          aria-label="删除分类">×</button>
      `;
      this.categoriesEl.appendChild(row);
    }
  }

  private syncRadios(field: 'theme' | 'projection', value: string): void {
    const radios = this.root.querySelectorAll<HTMLInputElement>(`input[data-field="${field}"]`);
    radios.forEach((r) => {
      r.checked = r.value === value;
    });
  }

  private syncNumberInput(field: string, value: number): void {
    const el = this.root.querySelector<HTMLInputElement>(`[data-field="${field}"]`);
    if (!el) return;
    if (document.activeElement === el) return; // 不打断输入
    if (Number(el.value) !== value) el.value = String(value);
  }

  private syncCheckbox(field: string, checked: boolean): void {
    const el = this.root.querySelector<HTMLInputElement>(`[data-field="${field}"]`);
    if (!el) return;
    if (el.checked !== checked) el.checked = checked;
  }
}
