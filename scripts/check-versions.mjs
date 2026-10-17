#!/usr/bin/env node
/**
 * 版本一致性检查
 * 合并后仅有一个发布包 footprint-globe（core），校验其存在性与版本号。
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

if (typeof core.version !== 'string' || !/^\d+\.\d+\.\d+/.test(core.version)) {
  console.error(`✗ packages/core 版本号无效：${core.version}`);
  process.exit(1);
}

console.log(`✓ packages/core@${core.version}`);
console.log(`\n唯一发布包版本：${core.version}`);
