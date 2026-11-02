#!/usr/bin/env node
// 无头浏览器跑 test.html 的全部回归用例（CI 与本地通用）
// 用法：先 npm run start（或 node dev-server.mjs），再 node scripts/run-tests.mjs [--url http://127.0.0.1:5173]
// 依赖 playwright：npx playwright install chromium 或 npm i -D playwright
import { chromium } from 'playwright';

const arg = process.argv.indexOf('--url');
const base = (arg > -1 ? process.argv[arg + 1] : process.env.TEST_URL) || 'http://127.0.0.1:5173';

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(base + '/test.html');
try {
  await page.waitForFunction(() => !document.getElementById('done').hidden, null, { timeout: 120000 });
} catch (e) {
  /* 超时：打印卡在哪一条、已完成多少、控制台报错，方便定位 */
  const info = await page.evaluate(() => ({
    progress: (document.getElementById('progress') || {}).textContent,
    pass: (document.getElementById('pass') || {}).textContent,
    fail: (document.getElementById('fail') || {}).textContent,
    rows: document.querySelectorAll('#list .row').length,
    last: Array.from(document.querySelectorAll('#list .row')).slice(-2).map((r) => r.innerText.replace(/\s+/g, ' ').trim())
  })).catch(() => ({}));
  console.log('✕ test.html 未在 120 秒内跑完', JSON.stringify(info, null, 1));
  errors.forEach((x) => console.log('  ! 控制台错误：' + x));
  console.log('  浏览器版本：' + browser.version());
  await browser.close();
  process.exit(1);
}

const pass = await page.innerText('#pass');
const fail = await page.innerText('#fail');
const failed = await page.$$eval('.row.fail', (rows) => rows.map((r) => r.innerText.replace(/\s+/g, ' ').trim()));

/* 再打开画廊页，确认 142 个组件全部渲染且无报错 */
await page.goto(base + '/');
await page.waitForTimeout(1500);
const cards = await page.$$eval('.card', (c) => c.length);
await browser.close();

console.log(`回归测试：${pass}，${fail}`);
console.log(`画廊组件：${cards} 个`);
failed.forEach((f) => console.log('  ✕ ' + f));
errors.forEach((e) => console.log('  ! 控制台错误：' + e));
const ok = failed.length === 0 && errors.length === 0 && cards > 0;
console.log(ok ? '✓ 全部通过' : '✕ 存在失败');
process.exit(ok ? 0 : 1);
