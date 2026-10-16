/**
 * 足迹地球 · legacy 复刻示例（new API）
 * 目的：用 footprint-globe 新 API 复刻 examples/legacy 的原始效果。
 * 与 legacy 差异：
 *   - 不再手写 maplibregl.Map / Marker / Popup
 *   - 不再手写 hover / focus / click 事件
 *   - 数据仍走 window.FOOTPRINT_PINS（旧格式），由 loader 自动归一化
 */

import { FootprintGlobe, loadData } from '../../packages/core/dist/index.js';

async function boot() {
  const container = document.getElementById('globe');
  if (!container) return;

  let result;
  try {
    result = await loadData({ globalVar: 'FOOTPRINT_PINS' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[example] loadData failed:', e);
    container.innerHTML =
      '<div style="padding:1.2rem;color:#6b7280">数据加载失败，请查看控制台。</div>';
    return;
  }

  if (result.warnings.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('[example] warnings:', result.warnings);
  }

  const globe = new FootprintGlobe(container, {
    config: result.config,
    // maplibre 由全局 window.maplibregl 提供，无需显式传入
    onReady: () => {
      // eslint-disable-next-line no-console
      console.info('[example] footprint-globe ready');
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('[example] footprint-globe error:', err);
    },
  });

  // 暴露给控制台便于调试
  window.__FP_GLOBE__ = globe;
}

boot();
