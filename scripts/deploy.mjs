#!/usr/bin/env node
/**
 * Cloudflare Pages 部署
 * 契约依据：《Sprint 4 执行方案》§8 S4-12
 *
 * 用法：
 *   pnpm deploy:site      # 部署官网 + Builder + Docs + Examples
 *   pnpm deploy:embed     # 部署 Embed 页
 *
 * 前置：
 *   - wrangler 已登录：`pnpm exec wrangler login`
 *   - 或在 CI 中设置 CLOUDFLARE_API_TOKEN 与 CLOUDFLARE_ACCOUNT_ID
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, opts = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root, ...opts });
}

function header(title) {
  console.log(`\n━━━ ${title} ━━━`);
}

const target = process.argv[2] ?? 'site';

// ============ 检查 wrangler ============
header('检查 wrangler');
try {
  run('pnpm exec wrangler --version');
} catch {
  console.error('未安装 wrangler。请执行：pnpm add -Dw wrangler');
  process.exit(1);
}

if (target === 'site' || target === 'all') {
  header('构建站点');
  run('node scripts/build-site.mjs');

  const siteDir = resolve(root, 'dist-site');
  if (!existsSync(siteDir)) {
    console.error('dist-site 不存在');
    process.exit(1);
  }

  header('部署到 Cloudflare Pages · footprint-studio');
  run(`pnpm exec wrangler pages deploy dist-site --project-name=footprint-studio --branch=main`);

  console.log('\n✓ 站点部署完成');
  console.log('  预览：https://footprint-studio.pages.dev/');
}

if (target === 'embed' || target === 'all') {
  header('构建 Embed');
  run('pnpm --filter @footprint-studio/embed build');

  const embedDir = resolve(root, 'packages/embed/dist');
  if (!existsSync(embedDir)) {
    console.error('embed/dist 不存在');
    process.exit(1);
  }

  header('部署到 Cloudflare Pages · footprint-studio-embed');
  run(
    `pnpm exec wrangler pages deploy ${embedDir} --project-name=footprint-studio-embed --branch=main`,
  );

  console.log('\n✓ Embed 部署完成');
  console.log('  预览：https://footprint-studio-embed.pages.dev/');
}

header('完成');
console.log(`
若为自定义域名，请在 Cloudflare Dashboard → Pages → Custom domains 中添加：
  • footprint-studio.dev
  • embed.footprint-studio.dev

DNS 记录：
  • CNAME @ → footprint-studio.pages.dev
  • CNAME embed → footprint-studio-embed.pages.dev
`);
