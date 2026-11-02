#!/usr/bin/env node
// 语法检查：对 src 下所有 .js 运行 node --check（跨平台，替代 Unix 的 find -exec）
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(m?js)$/.test(name)) files.push(p);
  }
})(join(root, 'src'));

let bad = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) { bad++; console.error('✕ ' + relative(root, f) + '\n' + r.stderr); }
}
console.log(bad ? `\n${bad} 个文件有语法错误（共 ${files.length} 个）` : `✓ ${files.length} 个文件语法检查通过`);
process.exit(bad ? 1 : 0);
