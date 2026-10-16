/**
 * 足迹地球 · Embed 入口
 * 契约依据：《Sprint 2 执行方案》§4.4、§7 S2-7
 */

import { FootprintGlobe, loadData } from 'footprint-globe';
// core 组件样式（.footprint-globe 容器尺寸/定位约束）
import 'footprint-globe/dist/footprint-globe.css';
import { decodeBase64Data, parseQuery } from './query';
import { reportHeight } from './height-reporter';

function renderError(container: HTMLElement, msg: string): void {
  container.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'footprint-error';
  div.style.padding = '1.2rem';
  div.style.color = '#6b7280';
  div.style.textAlign = 'center';
  div.textContent = msg;
  container.appendChild(div);
}

async function boot(): Promise<void> {
  const container = document.getElementById('globe');
  if (!container) return;

  const q = parseQuery(location.search);

  try {
    let config;
    if (q.id) {
      const r = await loadData({ id: q.id });
      config = r.config;
    } else if (q.src) {
      const r = await loadData({ src: q.src });
      config = r.config;
    } else if (q.data) {
      const decoded = decodeBase64Data(q.data);
      const r = await loadData({ data: decoded });
      config = r.config;
    } else {
      renderError(container, '未提供数据源：请使用 ?id=、?src= 或 ?data=');
      return;
    }

    if (q.config) {
      config = { ...config, config: { ...config.config, ...q.config } };
    }

    if (q.height) {
      container.style.setProperty('--fp-globe-height', `${q.height}px`);
    }

    new FootprintGlobe(container, { config });

    reportHeight(container);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    renderError(container, msg);
  }
}

void boot();
