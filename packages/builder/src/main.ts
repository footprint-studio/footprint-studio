/**
 * 足迹地球 · Builder 入口
 */

import './styles.css';
// core 组件样式（.footprint-globe 容器尺寸/定位约束），预览必需
import 'footprint-globe/dist/footprint-globe.css';
import { BuilderApp } from './app';

function boot(): void {
  const root = document.getElementById('app');
  if (!root) {
    console.error('[builder] #app not found');
    return;
  }
  const app = new BuilderApp(root);
  app.mount();
  (window as { __FP_BUILDER__?: BuilderApp }).__FP_BUILDER__ = app;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
