#!/usr/bin/env node
// 原生 Web 完整代码出口的真实浏览器回归。
// --fixture-export 只给既有 admin 模板注入明确标记的出口元信息，
// 用于新增 exporter 的 RED/GREEN；不是新增液态玻璃模板验收记录。
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { chromium } from 'playwright';

const index = process.argv.indexOf('--url');
const base = (index >= 0 ? process.argv[index + 1] : process.env.TEST_URL) || 'http://127.0.0.1:5173';
const fixture = process.argv.includes('--fixture-export');
const id = fixture ? 'admin' : 'liquid-glass-dashboard';
const outputIndex = process.argv.indexOf('--output');
const output = resolve(outputIndex >= 0 ? process.argv[outputIndex + 1] : '.cache/liquid-glass');
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
  if (fixture) {
    await page.route('**/src/data/templates.js', async route => {
      const response = await route.fetch();
      const original = await response.text();
      await route.fulfill({ response, contentType: 'text/javascript', body: original + '\n// KNOWN EXPORT-METADATA TEST FIXTURE ONLY\nconst __exportFixture=templates.find(t=>t.id===\'admin\');\n__exportFixture.exportDocument=true;\n__exportFixture.imports=["import { reduced } from \'./src/lib/motion.js\';"];\n__exportFixture.example=\'./examples/liquid-glass-dashboard.html\';\n' });
    });
  }
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-view="templates"]').click();
  const card = page.locator('[data-card="tpl-' + id + '"]');
  await card.waitFor();
  const originalLink = card.getByRole('link', { name: /打开原始单页/ });
  assert.equal(await originalLink.count(), 1, '模板卡片必须提供原始单页入口');
  assert.equal(await originalLink.getAttribute('href'), './examples/liquid-glass-dashboard.html', '入口必须指向仓库内同步的原始 HTML');
  assert.equal(await originalLink.getAttribute('rel'), 'noopener noreferrer', '新标签页不能保留 opener');
  await card.locator('[data-pane="code"]').click();
  const source = await card.locator('[data-body="code"] pre').innerText();
  assert.ok(source.startsWith('<!DOCTYPE html>'), 'Web 模板的复制代码必须是完整 HTML 文档');
  assert.match(source, /import \{ reduced(?:, loop)? \} from '\.\/src\/lib\/motion\.js';/, '代码出口必须携带明确的本地动效依赖');
  assert.match(source, /container:\s*tpl\s*\/\s*inline-size/, '完整 Web 页面要保留容器查询上下文');
  const file = join(output, (fixture ? 'fixture-' : '') + id + '-copied.html');
  await writeFile(file, source);
  await page.route('**/__qa_copied_liquid_glass.html', route => route.fulfill({ status: 200, contentType: 'text/html', body: source }));
  await page.goto(base.replace(/\/$/, '') + '/__qa_copied_liquid_glass.html', { waitUntil: 'domcontentloaded' });
  const root = page.locator('.t-' + id);
  await root.waitFor();
  await page.waitForFunction(id => document.querySelector('.t-' + id)?.dataset.ready === '1', id);
  const geometry = await page.locator('.tpl-export').evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }));
  assert.ok(geometry.width > 1000, 'Web 代码出口不能被手机框 375px 限制');
  assert.equal(geometry.overflow, false, '独立 Web 页面不能横向溢出');
  assert.ok(geometry.scrollWidth <= geometry.width + 1, '独立 Web 导出容器不能横向溢出');
  if (fixture) {
    await root.locator('ui-segmented button').filter({ hasText: '本周' }).click();
    assert.equal(await root.locator('ui-stat').first().getAttribute('value'), '8,930', '字面复制的初始化逻辑必须真实工作');
  }
  assert.deepEqual(errors, [], '复制代码独立运行不应出现控制台错误或警告');
  console.log('✓ ' + (fixture ? '明确标记的 Web 出口 fixture' : '液态玻璃 Web 出口') + '：完整 HTML、真实本地导入、桌面宽度及独立初始化通过');
  console.log('  字面复制源码：' + file);
} finally {
  await browser.close();
}
