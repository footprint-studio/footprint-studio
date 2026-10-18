#!/usr/bin/env node
/**
 * 站点组装
 * 契约依据：《Sprint 4 执行方案》§8 S4-12
 *
 * 将 docs / builder / examples 组装到 dist-site/：
 *   dist-site/
 *   ├── index.html           (来自 docs 首页)
 *   ├── docs/                (来自 docs 其余内容)
 *   ├── builder/             (来自 builder)
 *   └── examples/            (来自 examples)
 *
 * 说明：VitePress 会把 base 视为根路径。
 * 因此我们让 docs 输出到 dist-site/，再移动页面。
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'dist-site');

function log(msg) {
  console.log(`[build-site] ${msg}`);
}

function clean(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}

function ensure(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyDir(from, to) {
  if (!existsSync(from)) {
    console.warn(`[build-site] 警告：源目录不存在 ${from}`);
    return;
  }
  ensure(dirname(to));
  cpSync(from, to, { recursive: true });
}

// ============ 1. 清理 ============
log('清理 dist-site/');
clean(out);
ensure(out);

// ============ 2. 复制 docs（作为站点根） ============
const docsDist = resolve(root, 'packages/docs/.vitepress/dist');
log(`复制 docs → ${out}`);
copyDir(docsDist, out);

// ============ 3. 构建并复制 builder 到 /builder/ ============
// 站点把 builder 挂在 /builder/ 下，必须以 base=/builder/ 构建：默认 base 会让
// index.html 和动态 chunk 引用 /assets/...，在 /builder/ 路径下全部 404（白屏）。
// 这里带环境变量重新构建，不复用 turbo 缓存的产物。
const builderDir = resolve(root, 'packages/builder');
log('构建 builder（base=/builder/）');
execSync('pnpm exec vite build', {
  cwd: builderDir,
  stdio: 'inherit',
  env: { ...process.env, BUILDER_BASE: '/builder/' },
});
const builderDist = resolve(builderDir, 'dist');
log(`复制 builder → ${out}/builder`);
copyDir(builderDist, join(out, 'builder'));

// ============ 4. 复制 examples 到 /examples/ ============
const examplesSrc = resolve(root, 'examples');
log(`复制 examples → ${out}/examples`);
copyDir(examplesSrc, join(out, 'examples'));

// ============ 5. 复制 core dist（供 examples 相对路径引用） ============
// examples 通过 ../../packages/core/dist 引用，在 dist-site 中这些路径不存在。
// 解法：在 dist-site 中创建 packages/ 镜像，仅复制 dist。
// 注意：不再为已删除的 packages/web-component 做兼容镜像，
// 否则残留的旧路径引用会被静默掩盖（视觉夹具曾因此 404 而未被发现）。
const mirrorPkgs = [['packages/core/dist', 'packages/core/dist']];

for (const [from, to] of mirrorPkgs) {
  const src = resolve(root, from);
  if (existsSync(src)) {
    log(`镜像 ${from} → ${out}/${to}`);
    copyDir(src, join(out, to));
  }
}

// ============ 6. 生成 _redirects（Cloudflare Pages SPA 兜底） ============
const redirects = `
# Cloudflare Pages _redirects
# 详见：https://developers.cloudflare.com/pages/configuration/redirects/

# SPA 兜底（若需要）
# /*    /index.html   200
`;
writeFileSync(join(out, '_redirects'), redirects.trim());

// ============ 7. 生成 404.html ============
const notFound = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>页面未找到 · 足迹地球</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 5rem auto; padding: 0 1rem; text-align: center; color: #111827; }
    h1 { font-size: 2rem; margin: 0 0 0.5rem; }
    p { color: #6b7280; margin: 0 0 2rem; }
    a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>页面未找到。</p>
  <a href="/">返回首页</a>
</body>
</html>`;
writeFileSync(join(out, '404.html'), notFound);

// ============ 8. 汇总 ============
log('完成。产物结构：');
function printTree(dir, prefix = '', maxDepth = 2) {
  if (maxDepth < 0) return;
  const entries = readdirSync(dir).sort();
  for (const entry of entries) {
    const p = join(dir, entry);
    const stat = statSync(p);
    console.log(`${prefix}${entry}${stat.isDirectory() ? '/' : ''}`);
    if (stat.isDirectory()) {
      printTree(p, prefix + '  ', maxDepth - 1);
    }
  }
}
printTree(out, '', 2);

log(`\n输出目录：${out}`);
