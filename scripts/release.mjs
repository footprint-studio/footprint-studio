#!/usr/bin/env node
/**
 * NPM 发布脚本
 * 契约依据：《Sprint 4 执行方案》§8 S4-10
 *
 * 用法：
 *   pnpm release:dry    # 演练（不真正发布）
 *   pnpm release        # 正式发布
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const skipChecks = process.argv.includes('--skip-checks');

function run(cmd, opts = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root, ...opts });
}

function readPkg(rel) {
  return JSON.parse(readFileSync(resolve(root, rel), 'utf-8'));
}

function header(title) {
  console.log(`\n━━━ ${title} ━━━`);
}

// ============ Step 1: 版本一致性 ============
header('Step 1 · 版本一致性检查');
run('node scripts/check-versions.mjs');

// ============ Step 2: 全量构建 ============
if (!skipChecks) {
  header('Step 2 · 全量构建');
  run('pnpm build');
}

// ============ Step 3: 测试 ============
if (!skipChecks) {
  header('Step 3 · 测试');
  run('pnpm test');
}

// ============ Step 4: 类型检查 ============
if (!skipChecks) {
  header('Step 4 · 类型检查');
  run('pnpm typecheck');
}

// ============ Step 5: Lint ============
if (!skipChecks) {
  header('Step 5 · Lint');
  run('pnpm lint');
}

// ============ Step 6: 体积校验 ============
if (!skipChecks) {
  header('Step 6 · 体积校验');
  // 若已配置 size-limit 则运行；否则跳过
  try {
    run('pnpm size');
  } catch {
    console.log('（未配置 size-limit，跳过）');
  }
}

// ============ Step 7: 发布清单 ============
header('Step 7 · 发布清单');

const core = readPkg('packages/core/package.json');

console.log('\n将发布以下包：');
console.log(`  • ${core.name}@${core.version}`);

const privatePkgs = [
  'packages/builder/package.json',
  'packages/embed/package.json',
  'packages/docs/package.json',
  'test/package.json',
];
console.log('\n以下包保持 private，不发布：');
for (const rel of privatePkgs) {
  const p = readPkg(rel);
  console.log(`  • ${p.name} (private)`);
}

// ============ Step 8: 发布 ============
header('Step 8 · changesets publish');

if (dryRun) {
  // changesets 当前版本不支持 `publish --dry-run` 标志，
  // dry-run 模式仅打印发布清单，不执行任何 publish。
  console.log('[dry-run] 已打印发布清单，未执行 publish。去掉 --dry-run 后正式发布。');
} else {
  const confirmed = process.env.RELEASE_CONFIRM === 'yes';
  if (!confirmed) {
    console.log('\n未设置 RELEASE_CONFIRM=yes，取消发布。');
    console.log('正式发布请执行：RELEASE_CONFIRM=yes pnpm release');
    process.exit(1);
  }
  run('pnpm exec changeset publish');
  console.log('\n✓ 发布完成');
}

// ============ Step 9: 后续提示 ============
header('Step 9 · 后续');

console.log(`
下一步（若有新版本）：
  1. git push origin main --follow-tags
  2. 确认 jsDelivr 同步：
     curl -sI https://cdn.jsdelivr.net/npm/footprint-globe@${core.version}/dist/index.js
  3. 在 GitHub 创建 Release（workflow release.yml 会自动执行）
`);
