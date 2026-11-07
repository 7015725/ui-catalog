#!/usr/bin/env node
// 画廊级回归：系统 APP 的局部风格、明暗、响应式、复制与独立运行。
// npm run test:mobile -- --url http://127.0.0.1:5173 --output .cache/mobile-smoke
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';
import { styles } from '../src/data/styles.js';
import { templates } from '../src/data/templates.js';

const expected = [
  { id: 'miui-settings', style: 'miui' },
  { id: 'coui-files', style: 'coui' },
  { id: 'oneui-tasks', style: 'oneui' },
  { id: 'harmonyos-devices', style: 'harmonyos' },
  { id: 'originos-agenda', style: 'originos' },
  { id: 'flyme-notes', style: 'flyme' }
];
const original = ['shop', 'food', 'social', 'bank', 'fit', 'home', 'admin', 'landing', 'portal', 'mail', 'cvdash', 'cvgame', 'cvboard'];
const viewportWidths = [1440, 768, 390, 320];
const globalStyles = ['brutal', 'terminal', 'material', 'neumorph', 'luxury'];
const transitions = ['theme:dark', ...globalStyles.map((style) => 'style:' + style), 'style:aurora', 'theme:light'];
const controlProfile = (root) => [...root.querySelectorAll('.ui-btn, .ui-input, .ui-seg button, .ui-chips button, .ui-tag')].map((element) => {
  const css = getComputedStyle(element);
  return { className: element.className, radius: css.borderRadius, font: css.fontFamily,
    transform: css.textTransform, spacing: css.letterSpacing, shadow: css.boxShadow,
    before: getComputedStyle(element, '::before').content };
});
// 只读取用户控件及它们产生的真实结果，不写入任何证明状态用的虚标记。
async function interactionState(root, id) {
  return root.evaluate((element, id) => {
    const text = (selector) => element.querySelector(selector)?.textContent.trim() ?? null;
    const buttons = (selector, field) => [...element.querySelectorAll('button' + selector)].map((button) => ({
      id: button.dataset[field], pressed: button.getAttribute('aria-pressed')
    }));
    const common = { feedback: text('[data-feedback]'), emptyHidden: element.querySelector('[data-empty]')?.hidden ?? null };
    switch (id) {
      case 'miui-settings': return { ...common, search: element.querySelector('[data-search] input').value,
        settings: [...element.querySelectorAll('[data-setting]')].map((row) => ({ name: row.dataset.setting, hidden: row.hidden,
          checked: row.querySelector('input').checked, state: row.querySelector('[data-state]').textContent.trim() })),
        groups: [...element.querySelectorAll('[data-setting-group]')].map((group) => group.hidden) };
      case 'coui-files': return { ...common, search: element.querySelector('[data-search] input').value,
        categories: buttons('[data-category]', 'category'), count: text('[data-file-count]'),
        files: [...element.querySelectorAll('[data-file]')].map((file) => ({ name: file.dataset.name, hidden: file.hidden,
          selected: file.querySelector('[data-file-select]').getAttribute('aria-pressed') })),
        detail: { hidden: element.querySelector('[data-file-detail]').hidden, name: text('[data-file-name]'), meta: text('[data-file-meta]') } };
      case 'oneui-tasks': return { ...common, filter: element.querySelector('ui-segmented').getAttribute('value'),
        remaining: text('[data-remaining]'), progress: element.querySelector('[data-progress]').getAttribute('value'),
        progressNow: element.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'),
        tasks: [...element.querySelectorAll('[data-task]')].map((task) => ({ title: task.querySelector('b').textContent.trim(),
          checked: task.querySelector('input').checked, hidden: task.hidden, done: task.classList.contains('done'), state: task.querySelector('[data-task-state]').textContent.trim() })) };
      case 'harmonyos-devices': return { ...common, devices: [...element.querySelectorAll('button[data-device]')].map((device) => ({
        id: device.dataset.device, connected: device.dataset.connected, pressed: device.getAttribute('aria-pressed'), state: device.querySelector('[data-device-state]').textContent.trim() })),
        name: text('[data-device-name]'), status: text('[data-device-status]'), count: text('[data-connected-count]'),
        connect: { text: text('[data-connect]'), pressed: element.querySelector('[data-connect]').getAttribute('aria-pressed'), label: element.querySelector('[data-connect]').getAttribute('aria-label') } };
      case 'originos-agenda': return { ...common, dates: buttons('[data-date]', 'date'), label: text('[data-selected-label]'),
        date: text('[data-date-number]'), week: text('[data-date-week]'), count: text('[data-agenda-count]'), next: text('[data-next-title]'), time: text('[data-next-time]'),
        items: [...element.querySelectorAll('[data-agenda-item]')].map((item) => item.textContent.trim()) };
      case 'flyme-notes': return { ...common, search: element.querySelector('[data-search] input').value,
        filters: buttons('[data-filter]', 'filter'), count: text('[data-note-count]'),
        notes: [...element.querySelectorAll('[data-note]')].map((note) => ({ id: note.dataset.note, hidden: note.hidden, pinned: note.dataset.pinned,
          pressed: note.querySelector('[data-pin]').getAttribute('aria-pressed'), label: note.querySelector('[data-pin]').getAttribute('aria-label'), pinHidden: note.querySelector('[data-pin-label]').hidden })) };
      default: throw new Error('缺少真实交互状态采集：' + id);
    }
  }, id);
}

async function exerciseTemplate(root, id) {
  const before = await interactionState(root, id);
  switch (id) {
    case 'miui-settings':
      await root.locator('[data-search] input').fill('蓝牙');
      assert.equal(await root.locator('[data-setting]:not([hidden])').count(), 1, id + ' 搜索必须真实过滤');
      await root.locator('[data-setting="蓝牙"] label.ui-switch').click();
      break;
    case 'coui-files':
      await root.locator('button[data-category="document"]').click();
      await root.locator('[data-search] input').fill('简报');
      assert.equal(await root.locator('[data-file]:not([hidden])').count(), 1, id + ' 分类与搜索必须组合过滤');
      await root.locator('[data-file]:not([hidden]) [data-file-select]').click();
      break;
    case 'oneui-tasks':
      await root.locator('[data-task] input').first().click();
      assert.equal(await root.locator('[data-remaining]').innerText(), '2', id + ' 勾选必须更新剩余数量');
      await root.locator('ui-segmented button').filter({ hasText: '待办' }).click();
      break;
    case 'harmonyos-devices':
      await root.locator('button[data-device="tablet"]').click();
      await root.locator('[data-connect]').click();
      break;
    case 'originos-agenda':
      await root.locator('button[data-date="2026-11-08"]').click();
      break;
    case 'flyme-notes':
      await root.locator('[data-note="life"] [data-pin]').click();
      await root.locator('button[data-filter="pinned"]').click();
      await root.locator('[data-search] input').fill('周末');
      break;
  }
  const after = await interactionState(root, id);
  assert.notDeepEqual(after, before, id + ' 关键操作必须改变真实状态');
  if (id === 'miui-settings') {
    assert.equal(after.search, '蓝牙');
    assert.deepEqual(after.settings.filter((row) => !row.hidden).map((row) => row.name), ['蓝牙']);
    assert.equal(after.settings.find((row) => row.name === '蓝牙').checked, true);
    assert.match(after.settings.find((row) => row.name === '蓝牙').state, /已开启/);
    assert.match(after.feedback, /蓝牙已开启/);
  } else if (id === 'coui-files') {
    assert.deepEqual(after.categories.filter((button) => button.pressed === 'true').map((button) => button.id), ['document']);
    assert.equal(after.detail.hidden, false);
    assert.equal(after.detail.name, '项目简报.pdf');
    assert.equal(after.files.filter((file) => file.selected === 'true').length, 1);
    assert.match(after.count, /^1 /);
  } else if (id === 'oneui-tasks') {
    assert.equal(after.tasks[0].checked, true);
    assert.equal(after.tasks[0].done, true);
    assert.equal(after.tasks[0].hidden, true);
    assert.equal(after.filter, '待办');
    assert.equal(after.remaining, '2', id + ' 勾选必须更新剩余数量');
    assert.equal(after.progress, '50');
    assert.equal(after.progressNow, '50');
    assert.equal(after.tasks.filter((task) => !task.hidden).length, 2);
  } else if (id === 'harmonyos-devices') {
    assert.deepEqual(after.devices.filter((device) => device.pressed === 'true').map((device) => device.id), ['tablet']);
    assert.equal(after.devices.find((device) => device.id === 'tablet').connected, 'true');
    assert.equal(after.name, '随行平板');
    assert.equal(after.connect.pressed, 'true');
    assert.match(after.connect.label, /随行平板/);
    assert.match(after.count, /^2 /);
    assert.match(after.feedback, /随行平板已连接/);
  } else if (id === 'originos-agenda') {
    assert.deepEqual(after.dates.filter((date) => date.pressed === 'true').map((date) => date.id), ['2026-11-08']);
    assert.match(after.label, /11 月 8 日/);
    assert.equal(after.next, '整理相册');
    assert.equal(after.count, '1');
    assert.equal(after.items.length, 1);
  } else if (id === 'flyme-notes') {
    assert.deepEqual(after.notes.map((note) => note.id), ['walk', 'life', 'work', 'colors']);
    assert.deepEqual(after.notes.filter((note) => !note.hidden).map((note) => note.id), ['life']);
    assert.equal(after.notes.find((note) => note.id === 'life').pressed, 'true');
    assert.match(after.notes.find((note) => note.id === 'life').label, /取消置顶/);
    assert.equal(after.search, '周末');
    assert.match(after.count, /^1 /);
  }
  return { before, after };
}

async function assertRetained(root, preview, originalRoot, transition) {
  const record = { transition, state: await interactionState(root, preview.id),
    sameRoot: await root.evaluate((element, original) => element === original, originalRoot),
    scrollTop: await root.locator('.t-scr').evaluate((element) => element.scrollTop), passed: false };
  preview.retention.push(record);
  assert.deepEqual(record.state, preview.interaction.after, preview.id + ' / ' + transition + ' 必须保留真实交互状态');
  assert.equal(record.sameRoot, true, preview.id + ' 换肤不能重建模板');
  assert.equal(record.scrollTop, preview.scroll.top, preview.id + ' 换肤不能丢失滚动位置');
  record.passed = true;
}

function coverage(records, expectedKeys, getKey) {
  const counts = new Map();
  records.forEach((record) => counts.set(getKey(record), (counts.get(getKey(record)) || 0) + 1));
  return { expected: expectedKeys.length, collected: records.length,
    missing: expectedKeys.filter((key) => !counts.has(key)),
    duplicates: [...counts].filter(([, count]) => count > 1).map(([key, count]) => ({ key, count })),
    unexpected: [...counts.keys()].filter((key) => !expectedKeys.includes(key)) };
}

function summarizeReport() {
  const ids = expected.map((item) => item.id);
  const retention = report.previews.flatMap((preview) => (preview.retention || []).map((record) => ({ id: preview.id, ...record })));
  report.integrity = {
    previews: coverage(report.previews, ids, (record) => record.id),
    viewports: coverage(report.viewports, viewportWidths, (record) => record.viewport),
    standalone: coverage(report.standalone, ids, (record) => record.id),
    retention: coverage(retention, ids.flatMap((id) => transitions.map((transition) => id + '/' + transition)), (record) => record.id + '/' + record.transition)
  };
  report.counts = {
    previews: report.previews.filter((preview) => preview.light && preview.dark && preview.codeFile && preview.promptCopied &&
      preview.interaction && preview.retention?.length === transitions.length && preview.retention.every((record) => record.passed)).length,
    viewports: report.viewports.filter((record) => record.passed).length,
    standalone: report.standalone.filter((record) => record.initialized && record.interaction && record.passed).length,
    retainedStates: retention.filter((record) => record.passed).length,
    errors: report.errors.length
  };
  return Object.values(report.integrity).every((item) => item.collected === item.expected && !item.missing.length && !item.duplicates.length && !item.unexpected.length) &&
    report.counts.previews === ids.length && report.counts.viewports === viewportWidths.length && report.counts.standalone === ids.length && report.counts.retainedStates === ids.length * transitions.length;
}

const option = (name, fallback) => {
  const indexes = process.argv.flatMap((value, index) => value === name ? [index] : []);
  assert.ok(indexes.length <= 1, name + ' 不能重复');
  const index = indexes[0] ?? -1;
  if (index < 0) return fallback;
  assert.ok(process.argv[index + 1] && !process.argv[index + 1].startsWith('--') && !process.argv[index + 1].includes('\0'), name + ' 缺少参数或参数非法');
  return process.argv[index + 1];
};
let base, output, reportFile, browser;
let stage = 'arguments-output';
const report = { runId: randomUUID(), startedAt: new Date().toISOString(), base: null, expected,
  previews: [], viewports: [], standalone: [], errors: [], status: 'running', passed: false };

try {
  // 先发现合法输出位置；其它参数非法也必须覆盖本轮失败，而不能保留旧成功。
  report.outputSource = option('--output', '.cache/mobile-smoke');
  output = resolve(report.outputSource);
  reportFile = join(output, 'report.json');
  stage = 'output';
  await mkdir(output, { recursive: true });
  summarizeReport();
  stage = 'report-start';
  // 只替换固定旧报告；目录可写时只读旧文件也不能留下成功，不删除其它证据。
  try { await unlink(reportFile); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeFile(reportFile, JSON.stringify(report, null, 2));
  stage = 'arguments';
  for (let index = 2; index < process.argv.length; index += 2) {
    assert.ok(['--url', '--output'].includes(process.argv[index]), '未知参数：' + process.argv[index]);
    option(process.argv[index]);
  }
  const url = option('--url', process.env.TEST_URL ?? 'http://127.0.0.1:5173');
  report.urlSource = url;
  assert.ok(!/[\s\\]/.test(url) && /^https?:\/\/[^/]/i.test(url), '--url 不得含空白或猜修非法 URL');
  const parsed = new URL(url);
  assert.ok(['http:', 'https:'].includes(parsed.protocol) && parsed.hostname, '--url 必须是完整的 HTTP(S) URL');
  base = url.replace(/\/+$/, '') + '/';
  report.base = base;
  stage = 'inventory';
  assert.equal(new Set(styles.map((s) => s.id)).size, styles.length, '风格 ID 不能重复');
  for (const item of expected) {
    assert.ok(styles.some((s) => s.id === item.style), '缺少手机系统风格：' + item.style);
    assert.ok(templates.some((t) => t.id === item.id && t.style === item.style), '缺少配套 APP 模板：' + item.id);
  }
  assert.equal(styles.length, 21, '应保留原 15 套并新增 6 套风格');
  assert.equal(templates.length, 19, '应保留原 13 个并新增 6 个模板');
  original.forEach((id) => assert.ok(templates.some((t) => t.id === id), '原模板丢失：' + id));

  stage = 'launch';
  browser = await chromium.launch();
  stage = 'gallery';
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(base).origin });
  const page = await context.newPage();
  page.on('pageerror', (error) => report.errors.push({ type: 'pageerror', message: error.message }));
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push({ type: 'console', message: message.text() });
  });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('#styleSel option').length === 21);
  report.inventory = { components: await page.locator('.card:not(.tcard)').count(), styles: styles.length, templates: templates.length };
  assert.equal(report.inventory.components, 167, '原组件画廊不能丢组件');
  await page.locator('[data-view="templates"]').click();
  await page.locator('#nav [data-cat="系统 APP"]').click();
  await page.waitForFunction(() => document.querySelectorAll('.tcard').length === 6);

  // 保留原响应式覆盖：在真实交互过滤内容之前，检查全部默认内容。
  for (const width of viewportWidths) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(150);
    const geometry = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      screens: [...document.querySelectorAll('.tcard .t-scr')].map((element) => ({
        id: element.closest('.tcard').dataset.card,
        width: element.clientWidth, scrollWidth: element.scrollWidth
      }))
    }));
    assert.ok(geometry.scrollWidth <= geometry.width + 1, width + ' 宽度时页面不能横向溢出');
    assert.equal(geometry.screens.length, 6);
    geometry.screens.forEach((screen) => assert.ok(screen.width > 0 && screen.scrollWidth <= screen.width + 1, width + ' / ' + screen.id + ' 内容不能横向溢出'));
    report.viewports.push({ viewport: width, ...geometry, passed: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });

  const previewRoots = new Map();
  for (const item of expected) {
    const card = page.locator('[data-card="tpl-' + item.id + '"]');
    const root = card.locator('.t-' + item.id);
    await root.waitFor();
    await page.waitForFunction((id) => document.querySelector('.t-' + id)?.dataset.ready === '1', item.id);
    const local = await root.evaluate((element) => ({
      style: element.closest('[data-style]')?.getAttribute('data-style'),
      theme: element.closest('[data-theme]')?.getAttribute('data-theme'),
      bg: getComputedStyle(element).getPropertyValue('--ui-bg').trim()
    }));
    assert.equal(local.style, item.style, item.id + ' 应默认展示对应系统风格');
    assert.equal(local.theme, 'light');
    const preview = { ...item, name: await card.locator('.card__hd > h2').innerText(), light: local, retention: [] };
    report.previews.push(preview);
    previewRoots.set(item.id, await root.elementHandle());
    preview.interaction = await exerciseTemplate(root, item.id);

    await card.locator('[data-pane="code"]').click();
    const code = await card.locator('[data-body="code"] pre').innerText();
    assert.match(code, new RegExp('data-style=["\\\']' + item.style + '["\\\']'), item.id + ' 导出代码缺少局部风格');
    await card.locator('[data-copy="tpl-code"]').click();
    const copiedCode = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(copiedCode, code, item.id + ' 复制代码应与展示代码一致');
    assert.match(copiedCode, /^\s*<!doctype html>/i, item.id + ' 必须复制完整 HTML 文档');
    const codeFile = join(output, item.id + '.html');
    await writeFile(codeFile, copiedCode);
    report.previews.find((preview) => preview.id === item.id).codeFile = codeFile;
    await card.locator('[data-pane="ai"]').click();
    await card.locator('[data-copy="tpl-ai"]').click();
    const prompt = await page.evaluate(() => navigator.clipboard.readText());
    assert.ok(prompt.includes('【操作逻辑】') && prompt.includes('【依赖组件】'), item.id + ' 提示词应包含操作与依赖');
    preview.promptCopied = true;
  }
  for (const preview of report.previews) {
    preview.scroll = await page.locator('.t-' + preview.id + ' .t-scr').evaluate((element) => {
      const max = element.scrollHeight - element.clientHeight;
      element.scrollTop = Math.min(24, max);
      return { top: element.scrollTop, max };
    });
    assert.ok(preview.scroll.max <= 0 || preview.scroll.top > 0, preview.id + ' 可滚动区域必须实际改变滚动位置');
  }

  await page.locator('#themeBtn').click();
  for (const preview of report.previews) {
    const current = await page.locator('.t-' + preview.id).evaluate((element) => ({
      theme: element.closest('[data-theme]')?.getAttribute('data-theme'),
      bg: getComputedStyle(element).getPropertyValue('--ui-bg').trim()
    }));
    assert.equal(current.theme, 'dark', preview.id + ' 必须跟随全局深色');
    assert.notEqual(current.bg, preview.light.bg, preview.id + ' 深浅底色应不同');
    await assertRetained(page.locator('.t-' + preview.id), preview, previewRoots.get(preview.id), 'theme:dark');
    preview.dark = current;
    preview.dark.controls = await page.locator('.t-' + preview.id).evaluate(controlProfile);
  }
  for (const globalStyle of globalStyles) {
    await page.locator('#styleSel').selectOption(globalStyle);
    await page.waitForTimeout(300);
    for (const item of expected) {
      const root = page.locator('.t-' + item.id);
      const local = await root.evaluate((element) => ({
        style: element.closest('[data-style]')?.getAttribute('data-style')
      }));
      assert.equal(local.style, item.style, '全站风格不能覆盖系统 APP 的专属风格');
      const preview = report.previews.find((preview) => preview.id === item.id);
      await assertRetained(root, preview, previewRoots.get(item.id), 'style:' + globalStyle);
      const baseline = preview.dark.controls;
      assert.deepEqual(await root.evaluate(controlProfile), baseline, globalStyle + ' 的控件修饰不能泄露到 ' + item.id);
    }
  }
  await page.locator('#styleSel').selectOption('aurora');
  for (const preview of report.previews) await assertRetained(page.locator('.t-' + preview.id), preview, previewRoots.get(preview.id), 'style:aurora');
  await page.locator('#themeBtn').click();
  for (const preview of report.previews) {
    const root = page.locator('.t-' + preview.id);
    assert.equal(await root.evaluate((element) => element.closest('[data-theme]')?.getAttribute('data-theme')), 'light');
    await assertRetained(root, preview, previewRoots.get(preview.id), 'theme:light');
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('#styleSel').selectOption('aurora');
  await page.screenshot({ path: join(output, 'gallery.png'), fullPage: true });

  // 每个独立页面仅加载已保存的剪贴板 HTML；不拼装模板，不调用原模板 init。
  // 同源文档路由只提供静态文件，其余模块/样式由真实服务器响应。
  for (const item of expected) {
    const template = templates.find((t) => t.id === item.id);
    const preview = report.previews.find((p) => p.id === item.id);
    const url = new URL('__mobile-export-' + report.runId + '-' + item.id + '.html', base).href;
    const standalone = { ...item, url, codeFile: preview.codeFile, initialized: false, passed: false, resources: [] };
    report.standalone.push(standalone);
    const isolated = await browser.newContext({ viewport: { width: 360, height: 720 }, reducedMotion: 'reduce' });
    try {
      const documentBytes = await readFile(preview.codeFile);
      standalone.documentBytes = documentBytes.length;
      await isolated.route(url, (route) => route.fulfill({ path: preview.codeFile, contentType: 'text/html' }));
      const exported = await isolated.newPage();
      let rejectLoad;
      const loadFailure = new Promise((_, reject) => { rejectLoad = reject; });
      // 事件发生在 goto/ready 之间时也不能遗漏或形成未处理 rejection。
      loadFailure.catch(() => {});
      const recordError = (type, message) => {
        report.errors.push({ type, scope: 'standalone', id: item.id, message });
        rejectLoad(new Error(item.id + ' 已复制文档 ' + type + ': ' + message));
      };
      exported.on('pageerror', (error) => recordError('pageerror', error.message));
      exported.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) recordError('console', message.text());
      });
      exported.on('requestfailed', (request) => recordError('requestfailed', request.url() + ': ' + request.failure()?.errorText));
      exported.on('response', (response) => {
        const resource = { url: response.url(), type: response.request().resourceType(), status: response.status() };
        standalone.resources.push(resource);
        if (response.status() >= 400) recordError('response', response.url() + ': HTTP ' + response.status());
      });
      await Promise.race([exported.goto(url, { waitUntil: 'load' }), loadFailure]);
      assert.equal(await exported.locator('.t-' + item.id).count(), 1, '独立预览根节点应存在');
      await Promise.race([exported.waitForFunction((id) => document.querySelector('.t-' + id)?.dataset.ready === '1', item.id), loadFailure]);
      await Promise.race([exported.waitForFunction((uses) => uses.every((tag) => !!customElements.get(tag)), template.uses), loadFailure]);
      const root = exported.locator('.t-' + item.id);
      standalone.initialized = true;
      standalone.context = await root.evaluate((element) => ({
        style: element.closest('[data-style]')?.getAttribute('data-style'), theme: element.closest('[data-theme]')?.getAttribute('data-theme'),
        bg: getComputedStyle(element).getPropertyValue('--ui-bg').trim()
      }));
      assert.equal(standalone.context.style, item.style);
      assert.equal(standalone.context.theme, 'light');
      assert.equal(standalone.context.bg, preview.light.bg, item.id + ' 独立文档必须加载真实主题资源');
      assert.ok(standalone.resources.some((resource) => resource.type === 'stylesheet' && resource.url.includes('/src/styles/tokens.css') && resource.status === 200));
      assert.ok(standalone.resources.some((resource) => resource.type === 'script' && resource.url.includes('/src/components/index.js') && resource.status === 200));
      const body = await root.innerText();
      assert.ok(body.trim().length > 0);
      standalone.interaction = await exerciseTemplate(root, item.id);
      await exported.screenshot({ path: join(output, item.id + '.png') });
      standalone.passed = !report.errors.some((error) => error.scope === 'standalone' && error.id === item.id);
      preview.standalone = standalone.passed;
    } finally {
      await isolated.close();
    }
  }
  assert.equal(report.errors.length, 0, '画廊与独立模板不能有控制台/脚本错误：' + JSON.stringify(report.errors));
  assert.ok(summarizeReport(), '预览、响应式、独立页及状态保留记录必须完整且不重复：' + JSON.stringify(report.integrity));
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.message;
  report.failureStack = error.stack;
  report.errors.push({ type: 'runner', stage, name: error.name, message: error.message, stack: error.stack });
  console.error('✕ ' + error.message);
  process.exitCode = 1;
} finally {
  if (browser) {
    try { await browser.close(); } catch (error) {
      report.errors.push({ type: 'browser-close', message: error.message });
      report.passed = false;
    }
  }
  report.passed = summarizeReport() && report.passed && report.errors.length === 0;
  report.status = report.passed ? 'passed' : 'failed';
  report.finishedAt = new Date().toISOString();
  if (!report.passed) process.exitCode = 1;
  let reportWritten = false;
  try {
    if (!reportFile) throw new Error('无法定位合法 --output；不猜测或覆盖其它目录');
    await writeFile(reportFile, JSON.stringify(report, null, 2));
    reportWritten = true;
  } catch (error) {
    report.passed = false;
    report.status = 'failed';
    report.errors.push({ type: 'report-write', stage: 'report-write', message: error.message });
    summarizeReport();
    process.exitCode = 1;
    console.error('✕ 报告写入失败：' + error.message);
    if (reportFile) {
      try {
        try { await unlink(reportFile); } catch (error) { if (error.code !== 'ENOENT') throw error; }
        await writeFile(reportFile, JSON.stringify(report, null, 2));
        reportWritten = true;
      } catch (error) { report.errors.push({ type: 'report-write', stage: 'report-write-retry', message: error.message }); }
    }
    summarizeReport();
  }
  if (!reportWritten) console.error('本轮报告无法写入，失败摘要：' + JSON.stringify({ runId: report.runId, passed: false, reportWritten: false,
    reportFile: reportFile || null, counts: report.counts, errors: report.errors }));
  console.log((report.passed ? '✓ ' : '✕ ') + report.counts.previews + ' 个预览；' + report.counts.retainedStates +
    ' 次真实状态保留比较；' + report.counts.standalone + ' 个已复制 HTML 独立页；' + report.counts.viewports + ' 个响应式宽度；错误 ' + report.counts.errors);
  if (report.inventory) console.log('已核验 ' + report.inventory.components + ' 个组件；' + report.inventory.styles + ' 套风格；' + report.inventory.templates + ' 个模板');
  console.log(reportWritten ? '验证报告：' + reportFile : '本轮报告未写入：' + (reportFile || '无合法输出路径'));
}
