/**
 * 足迹地球 · NPM 模板
 * 契约依据：《Sprint 3 执行方案》§4.2
 */

import type { FootprintConfig } from 'footprint-globe';

export interface NpmTemplateOptions {
  config: FootprintConfig;
  /** 容器元素 id，默认 'globe' */
  containerId?: string;
}

export function generateNpm(options: NpmTemplateOptions): string {
  const { config, containerId = 'globe' } = options;

  // 序列化 config，缩进 2 空格
  const configJson = JSON.stringify(config, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : '  ' + line))
    .join('\n');

  return [
    `import { FootprintGlobe } from 'footprint-globe';`,
    `import maplibregl from 'maplibre-gl';`,
    `import 'maplibre-gl/dist/maplibre-gl.css';`,
    `import 'footprint-globe/dist/footprint-globe.css';`,
    '',
    `const container = document.getElementById('${containerId}');`,
    `if (!container) throw new Error('#${containerId} not found');`,
    '',
    `const globe = new FootprintGlobe(container, {`,
    `  config: ${configJson},`,
    `  maplibre: maplibregl,`,
    `});`,
    '',
    `// 销毁：globe.destroy();`,
    `// 更新：globe.update({ config: { theme: 'dark' } });`,
  ].join('\n');
}
