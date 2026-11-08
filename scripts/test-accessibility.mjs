#!/usr/bin/env node
// SPEC 验收：全部风格 × 明暗 × 三种宽度 × 画廊/风格/模板。
import assert from 'node:assert/strict';
import { mkdir, writeFile, appendFile, readFile, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { styles } from '../src/data/styles.js';
import { catalog } from '../src/data/catalog.js';
import { templates } from '../src/data/templates.js';
const require = createRequire(import.meta.url);

const arg = (flag, fallback) => {
  const indexes = process.argv.flatMap((value, index) => value === flag ? [index] : []);
  assert.ok(indexes.length <= 1, flag + ' 不能重复');
  const index = indexes[0] ?? -1;
  if (index < 0) return fallback;
  assert.ok(process.argv[index + 1] && !process.argv[index + 1].startsWith('--') && !process.argv[index + 1].includes('\0'), flag + ' 缺少参数或参数非法');
  return process.argv[index + 1];
};
const widths = [360, 820, 1440];
const themes = ['light', 'dark'];
const views = ['gallery', 'styles', 'templates'];
// 独立于可删减的 styles 元数据：当前 SPEC 的 22 套 / 396 组合是下限。
const minimumStyles = 22;
const minimumCombinations = 396;
const requiredStyles = ['aurora', 'brutal', 'glass', 'mono', 'neumorph', 'clay', 'material', 'cyber',
  'paper', 'retro', 'nord', 'luxury', 'bauhaus', 'candy', 'terminal', 'miui', 'coui', 'oneui', 'harmonyos', 'originos', 'flyme', 'dusk'];
const sourceIds = styles.map((style) => style?.id);
const styleIds = [...new Set([...requiredStyles, ...sourceIds.filter((id) => typeof id === 'string')])];
const key = (record) => [record.view, record.width, record.style, record.theme].join('/');
const expectedKeys = views.flatMap((view) => widths.flatMap((width) => styleIds.flatMap((style) =>
  themes.map((theme) => key({ view, width, style, theme })))));
const expected = expectedKeys.length;
const report = { runId: randomUUID(), startedAt: new Date().toISOString(), base: null, styles: styles.length,
  inventory: { minimumStyles, minimumCombinations, required: requiredStyles, actual: styles.length, ids: sourceIds,
    missing: requiredStyles.filter((id) => !sourceIds.includes(id)),
    duplicates: [...new Set(sourceIds.filter((id, index) => sourceIds.indexOf(id) !== index))],
    invalid: sourceIds.filter((id) => typeof id !== 'string' || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id)) },
  widths, themes, views, expected, collected: 0, uniqueCollected: 0, failureCount: 0, failures: [], errors: [],
  workers: views.map((view) => ({ view, status: 'pending', collected: 0 })), workerSettlements: [],
  integrity: { missing: [...expectedKeys], duplicates: [], unexpected: [] }, status: 'running', passed: false };
let base, output, reportFile, browser;
let stage = 'arguments-output';

// 同一读回函数用于条件等待、审计前后及归档；观察值不能由循环变量冒充。
function observeState({ requested, expectedRendered, wait = false }) {
  const html = document.documentElement;
  const main = document.querySelector('#main');
  const counts = { gallery: main.querySelectorAll('.card:not(.tcard)').length,
    styles: main.querySelectorAll('.sframe').length, templates: main.querySelectorAll('.tcard').length };
  const populated = Object.keys(counts).filter((view) => counts[view] > 0);
  const selected = (selector) => [...document.querySelectorAll(selector)].map((button) => button.dataset.view);
  const observed = { view: populated.length === 1 ? populated[0] : null, width: innerWidth,
    style: html.getAttribute('data-style'), theme: html.getAttribute('data-theme'),
    controls: { views: selected('#viewSeg [aria-pressed="true"]'), activeViews: selected('#viewSeg .on'),
      style: document.querySelector('#styleSel').value },
    render: { counts, readyTemplates: main.querySelectorAll('.tcard .t-screen[data-ready="1"]').length,
      activeStyles: [...main.querySelectorAll('.sframe--on')].map((frame) => frame.getAttribute('data-style')),
      frameThemes: [...main.querySelectorAll('.sframe')].map((frame) => frame.getAttribute('data-theme')),
      templateThemes: [...main.querySelectorAll('.tphone[data-template-style]')].map((phone) => phone.getAttribute('data-theme')),
      visible: main.getBoundingClientRect().width > 0 && getComputedStyle(main).display !== 'none' && getComputedStyle(main).visibility === 'visible',
      navHidden: document.querySelector('#nav').hidden, searchHidden: document.querySelector('#search').hidden,
      fullLayout: document.querySelector('.layout').classList.contains('layout--full') },
    mismatches: [] };
  const check = (condition, message) => { if (!condition) observed.mismatches.push(message); };
  // 用目标局部作用域解析同一份真实 tokens.css，独立于 html 当前属性与可见外壳颜色。
  // body 的 Retro/Glass 等背景有专属图案，记录背景但比较正文与品牌标识的实际前背景。
  const probe = document.createElement('div');
  probe.hidden = true;
  probe.setAttribute('data-style', requested.style);
  probe.setAttribute('data-theme', requested.theme);
  probe.style.cssText = 'background-color:var(--ui-bg);color:var(--ui-text)';
  document.body.append(probe);
  try {
    const names = ['--ui-bg', '--ui-panel', '--ui-text', '--ui-brand', '--ui-brand-ink'];
    const tokens = (element) => Object.fromEntries(names.map((name) => [name, getComputedStyle(element).getPropertyValue(name).trim()]));
    const reference = { tokens: tokens(probe), background: getComputedStyle(probe).backgroundColor, text: getComputedStyle(probe).color };
    probe.style.backgroundColor = 'var(--ui-brand)';
    probe.style.color = 'var(--ui-brand-ink)';
    reference.brand = getComputedStyle(probe).backgroundColor;
    reference.brandInk = getComputedStyle(probe).color;
    const body = getComputedStyle(document.body);
    const mark = getComputedStyle(document.querySelector('.brand .mark'));
    observed.colors = { tokens: tokens(html), colorScheme: getComputedStyle(html).colorScheme,
      bodyBackground: body.backgroundColor, text: body.color, brand: mark.backgroundColor, brandInk: mark.color, reference };
    for (const name of names) check(reference.tokens[name] && observed.colors.tokens[name] === reference.tokens[name], 'computed token: ' + name);
    check(observed.colors.colorScheme === requested.theme, 'computed color scheme');
    check(observed.colors.text === reference.text, 'computed body text');
    check(observed.colors.brand === reference.brand, 'computed brand background');
    check(observed.colors.brandInk === reference.brandInk, 'computed brand text');
  } finally { probe.remove(); }
  check(observed.view === requested.view, 'rendered view');
  check(JSON.stringify(observed.controls.views) === JSON.stringify([requested.view]), 'pressed view selector');
  check(JSON.stringify(observed.controls.activeViews) === JSON.stringify([requested.view]), 'active view selector');
  check(observed.width === requested.width, 'viewport width');
  check(observed.style === requested.style, 'html style');
  check(observed.controls.style === requested.style, 'style selector value');
  check(observed.theme === requested.theme, 'html theme');
  if (requested.view === 'styles') check(JSON.stringify(observed.render.activeStyles) === JSON.stringify([requested.style]), 'rendered active style');
  if (requested.view === 'styles') check(observed.render.frameThemes.every((theme) => theme === requested.theme), 'rendered frame themes');
  if (requested.view === 'templates') check(observed.render.templateThemes.every((theme) => theme === requested.theme), 'rendered local template themes');
  check(observed.render.visible, 'visible rendered content');
  for (const view of Object.keys(counts)) check(counts[view] === (view === requested.view ? expectedRendered[view] : 0), 'render inventory: ' + view);
  if (requested.view === 'templates') check(observed.render.readyTemplates === expectedRendered.templates, 'initialized templates');
  check(observed.render.navHidden === (requested.view === 'styles') && observed.render.searchHidden === (requested.view === 'styles') &&
    observed.render.fullLayout === (requested.view === 'styles'), 'view layout');
  return wait ? (observed.mismatches.length ? false : observed) : observed;
}

async function confirmState(page, state, requested) {
  const args = { requested, expectedRendered: { gallery: catalog.length, styles: styles.length, templates: templates.length } };
  let waitingError;
  try {
    const ready = await page.waitForFunction(observeState, { ...args, wait: true }, { timeout: 3000 });
    await ready.dispose();
  } catch (error) { waitingError = error; }
  state.observed = await page.evaluate(observeState, args);
  assert.deepEqual(state.observed.mismatches, [], '实际状态未生效：' + JSON.stringify({ requested, observed: state.observed }));
  if (waitingError) throw waitingError;
  return state.observed;
}

function captureError(error, details) {
  const record = { ...details, name: error.name || 'Error', message: error.message || String(error), stack: error.stack };
  report.errors.push(record);
  console.error('✕ ' + [record.view, record.stage].filter(Boolean).join(' / ') + ': ' + record.message);
}

async function worker(state) {
  const view = state.view;
  const file = join(output, view + '.ndjson');
  let context, failure;
  state.status = 'running';
  state.startedAt = new Date().toISOString();
  state.stage = 'record-file';
  try {
    await writeFile(file, '');
    state.stage = 'context';
    context = await browser.newContext({ reducedMotion: 'reduce' });
    state.stage = 'page';
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) consoleErrors.push(message.text());
    });
    state.stage = 'navigation';
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    state.stage = 'initialization';
    await page.waitForSelector('#styleSel option', { state: 'attached' });
    state.stage = 'inventory';
    state.inventory = await page.locator('#styleSel').evaluate((select) => [...select.options].map((option) => option.value));
    assert.equal(new Set(state.inventory).size, state.inventory.length, '页面风格选择器 ID 不能重复');
    assert.ok(state.inventory.length >= minimumStyles, '页面风格库存也必须至少有 22 套');
    assert.deepEqual([...state.inventory].sort(), [...sourceIds].sort(), '真实页面必须提供准确的全部风格 ID');
    state.stage = 'axe-load';
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    state.stage = 'view';
    await page.locator('[data-view="' + view + '"]').click();
    for (const width of widths) {
      state.stage = 'viewport';
      await page.setViewportSize({ width, height: 1000 });
      for (const style of styles) {
        state.stage = 'style';
        await page.locator('#styleSel').selectOption(style.id);
        for (const theme of themes) {
          state.combination = { view, width, style: style.id, theme };
          state.stage = 'theme';
          if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('#themeBtn').click();
          state.stage = 'actual-state';
          await confirmState(page, state, state.combination);
          state.stage = 'geometry';
          const geometry = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
          state.stage = 'assertion';
          assert.equal(page.frames().length, 1, '新增 iframe 时必须扩展跨 Frame 验收，不得静默漏检');
          state.stage = 'axe';
          const violations = await page.evaluate(async () => {
            const audit = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }, resultTypes: ['violations'] });
            return audit.violations.map((violation) => ({ id: violation.id, impact: violation.impact,
              nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }));
          });
          state.stage = 'actual-state';
          const observed = await confirmState(page, state, state.combination);
          const record = { runId: report.runId, view: observed.view, width: observed.width, style: observed.style, theme: observed.theme,
            requested: state.combination, observed, geometry,
            violations, consoleErrors: [...new Set(consoleErrors)] };
          state.stage = 'record-write';
          await appendFile(file, JSON.stringify(record) + '\n');
          state.collected++;
        }
      }
      console.log(view + ' / ' + width + '：完成全部风格与明暗检查');
    }
  } catch (error) {
    failure = error;
    captureError(error, { stage: state.stage, view, combination: state.combination, observed: state.observed });
  } finally {
    // 每个 worker 先清理自己的 context；任何异常都不能提前关掉其它 worker 的 browser。
    if (context) {
      try { await context.close(); } catch (error) {
        captureError(error, { stage: 'context-close', view });
        failure ||= error;
      }
    }
    state.status = failure ? 'failed' : 'completed';
    state.finishedAt = new Date().toISOString();
  }
  if (failure) throw failure;
}

async function collectRecords() {
  const records = [];
  for (const view of views) {
    const file = join(output, view + '.ndjson');
    try {
      const lines = (await readFile(file, 'utf8')).split('\n').filter(Boolean);
      for (const [index, line] of lines.entries()) {
        try {
          const record = JSON.parse(line);
          assert.equal(record.runId, report.runId, '拒绝非本轮记录');
          assert.ok(Array.isArray(record.violations) && Array.isArray(record.consoleErrors), '审计结果必须完整');
          assert.ok(Number.isFinite(record.geometry?.width) && Number.isFinite(record.geometry?.scrollWidth), '几何结果必须完整');
          assert.equal(record.view, view, '记录必须属于对应 worker');
          assert.deepEqual(record.observed?.mismatches, [], '只计入已确认生效的记录');
          assert.equal(record.view, record.observed.view, '唯一组合必须使用实际视图');
          assert.equal(record.width, record.observed.width, '唯一组合必须使用实际宽度');
          assert.equal(record.style, record.observed.style, '唯一组合必须使用实际风格');
          assert.equal(record.theme, record.observed.theme, '唯一组合必须使用实际主题');
          assert.equal(key(record.requested), key(record.observed), '请求与已确认实际组合必须一致');
          assert.ok(record.observed.colors?.reference && Object.keys(record.observed.colors.tokens).length === 5, '计算颜色读回必须完整');
          records.push(record);
        } catch (error) { captureError(error, { stage: 'record-read', view, file, line: index + 1 }); }
      }
    } catch (error) { captureError(error, { stage: 'record-read', view, file }); }
  }
  const counts = new Map();
  records.forEach((record) => counts.set(key(record.observed), (counts.get(key(record.observed)) || 0) + 1));
  const wanted = new Set(expectedKeys);
  report.collected = records.length;
  report.uniqueCollected = counts.size;
  report.integrity = {
    missing: expectedKeys.filter((item) => !counts.has(item)),
    duplicates: [...counts].filter(([, count]) => count > 1).map(([key, count]) => ({ key, count })),
    unexpected: [...counts.keys()].filter((item) => !wanted.has(item))
  };
  report.failures = records.filter((record) => record.violations.length || record.consoleErrors.length || record.geometry.scrollWidth > record.geometry.width + 1);
  report.failureCount = report.failures.length;
  try {
    assert.ok(counts.size >= minimumCombinations, '独立覆盖下限：至少 396 个已确认唯一组合');
    assert.equal(records.length, expected, '验收组合不能遗漏');
    assert.equal(counts.size, expected, '验收组合不能重复');
    assert.equal(report.integrity.missing.length + report.integrity.unexpected.length, 0, '必须覆盖准确的验收组合');
  } catch (error) { captureError(error, { stage: 'integrity' }); }
}

try {
  // 输出源值合法才解析目录；随后在校验其余参数之前先使旧成功失效。
  report.outputSource = arg('--output', '.cache/accessibility');
  output = resolve(report.outputSource);
  reportFile = join(output, 'report.json');
  stage = 'output';
  await mkdir(output, { recursive: true });
  // 只移除固定报告文件，不递归删除证据目录。开始新一轮后旧成功不可再冒充本轮。
  stage = 'report-start';
  try { await unlink(reportFile); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeFile(reportFile, JSON.stringify(report, null, 2));
  stage = 'arguments';
  for (let index = 2; index < process.argv.length; index += 2) {
    assert.ok(['--url', '--output'].includes(process.argv[index]), '未知参数：' + process.argv[index]);
    arg(process.argv[index]);
  }
  const url = arg('--url', process.env.TEST_URL ?? 'http://127.0.0.1:5173');
  report.urlSource = url;
  assert.ok(!/[\s\\]/.test(url) && /^https?:\/\/[^/]/i.test(url), '--url 不得含空白或猜修非法 URL');
  const parsed = new URL(url);
  assert.ok(['http:', 'https:'].includes(parsed.protocol) && parsed.hostname, '--url 必须是完整的 HTTP(S) URL');
  base = url.replace(/\/+$/, '') + '/';
  report.base = base;
  stage = 'inventory';
  assert.ok(styles.length >= minimumStyles, '独立库存下限：至少保留 22 套风格');
  assert.deepEqual(report.inventory.missing, [], '契约风格 ID 不得丢失');
  assert.deepEqual(report.inventory.duplicates, [], '风格 ID 不能重复');
  assert.deepEqual(report.inventory.invalid, [], '风格 ID 必须合法，不得猜修非法源值');
  assert.ok(expected >= minimumCombinations, '独立矩阵下限：至少 396 个组合');
  stage = 'launch';
  browser = await chromium.launch();
  const settled = await Promise.allSettled(report.workers.map(worker));
  report.workerSettlements = settled.map((result, index) => ({ view: views[index], status: result.status,
    ...(result.status === 'rejected' ? { message: result.reason?.message || String(result.reason) } : {}) }));
} catch (error) {
  captureError(error, { stage });
} finally {
  // allSettled 已完成，才可关闭共享 browser；launch、关闭和 I/O 失败也归档。
  if (browser) {
    try { await browser.close(); } catch (error) { captureError(error, { stage: 'browser-close' }); }
  }
  if (output) await collectRecords();
  report.errorCount = report.errors.length;
  report.passed = report.errorCount === 0 && report.failureCount === 0 && report.collected === expected &&
    report.workerSettlements.length === views.length && report.workerSettlements.every((worker) => worker.status === 'fulfilled');
  report.status = report.passed ? 'passed' : 'failed';
  report.finishedAt = new Date().toISOString();
  let reportWritten = false;
  try {
    if (!reportFile) throw new Error('无法定位合法 --output；不猜测或覆盖其它目录');
    await writeFile(reportFile, JSON.stringify(report, null, 2));
    reportWritten = true;
  } catch (error) {
    report.passed = false;
    report.status = 'failed';
    captureError(error, { stage: 'report-write', file: reportFile });
    report.errorCount = report.errors.length;
    // 目录可写时替换只读/损坏的固定报告，尽力落下当前失败；绝不递归删除输出。
    if (reportFile) {
      try {
        try { await unlink(reportFile); } catch (error) { if (error.code !== 'ENOENT') throw error; }
        await writeFile(reportFile, JSON.stringify(report, null, 2));
        reportWritten = true;
      } catch (error) { captureError(error, { stage: 'report-write-retry', file: reportFile }); }
    }
    report.errorCount = report.errors.length;
  }
  if (!reportWritten) console.error('本轮报告无法写入，失败摘要：' + JSON.stringify({ runId: report.runId, passed: false, reportWritten: false,
    reportFile: reportFile || null, collected: report.collected, missing: report.integrity.missing.length, errors: report.errors }));
  console.log((report.passed ? '✓ ' : '✕ ') + report.collected + '/' + expected + ' 个组合；失败 ' + report.failureCount +
    '；异常 ' + report.errorCount + '；未完成 ' + report.integrity.missing.length + '；' +
    (reportWritten ? '报告 ' + reportFile : '本轮报告未写入：' + (reportFile || '无合法输出路径')));
  if (!report.passed) process.exitCode = 1;
}
