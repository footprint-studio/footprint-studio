#!/usr/bin/env node
/**
 * 版本一致性检查
 * 校验 core 与 web-component 版本号一致。
 * 契约依据：《Sprint 4 执行方案》§8 S4-10
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readPkg(rel) {
  const p = resolve(root, rel);
  return JSON.parse(readFileSync(p, 'utf-8'));
}

const core = readPkg('packages/core/package.json');
const wc = readPkg('packages/web-component/package.json');

const pairs = [
  ['packages/core', core.version],
  ['packages/web-component', wc.version],
];

let ok = true;
let baseline = null;
for (const [name, version] of pairs) {
  if (baseline === null) baseline = version;
  else if (version !== baseline) {
    console.error(`✗ 版本不一致：${name} 为 ${version}，期望 ${baseline}`);
    ok = false;
  } else {
    console.log(`✓ ${name}@${version}`);
  }
}

if (!ok) {
  console.error('\n修复：运行 `pnpm changeset version` 或手动同步版本号。');
  process.exit(1);
}

console.log(`\n所有可发布包版本一致：${baseline}`);
