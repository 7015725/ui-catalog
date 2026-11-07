#!/usr/bin/env node
// 验收脚本自身的永久负例回归；fixture 结果不是产品验收通过记录。
// npm run test:guards -- --url http://127.0.0.1:5173 --output .cache/validation-guards
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer, request as httpRequest } from 'node:http';
import { mkdir, readFile, writeFile, chmod } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  if (index < 0) return fallback;
  assert.ok(process.argv[index + 1] && !process.argv[index + 1].startsWith('--'), name + ' 缺少参数');
  return process.argv[index + 1];
};
const repo = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(option('--output', '.cache/validation-guards'));
const selected = option('--case', 'all');
const base = option('--url', process.env.TEST_URL || 'http://127.0.0.1:5173').replace(/\/+$/, '') + '/';
const evidence = { fixture: true, purpose: 'validation-script regression, not product acceptance', base, cases: [], passed: false };
await mkdir(output, { recursive: true });

async function unavailableURL() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return 'http://127.0.0.1:' + port + '/';
}

async function runScript(name, script, url, { preload, env = {}, argv, defaultOutput, prepare, reportTarget, readonlyReport = false, readonlyDirectory = false } = {}) {
  const dir = join(output, name);
  const artifacts = join(dir, defaultOutput || 'artifacts');
  await mkdir(artifacts, { recursive: true });
  const seededReport = join(artifacts, 'report.json');
  try { await chmod(seededReport, 0o644); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeFile(seededReport, JSON.stringify({ fixture: 'STALE-PASSED-REPORT', passed: true, runId: 'stale-fixture' }));
  const reportFile = reportTarget ? reportTarget(artifacts) : seededReport;
  const sentinel = join(artifacts, 'keep-evidence.txt');
  await writeFile(sentinel, 'validation fixture: unrelated evidence must not be deleted\n');
  if (readonlyReport || readonlyDirectory) await chmod(reportFile, 0o444);
  if (readonlyDirectory) await chmod(artifacts, 0o555);
  if (prepare) await prepare(artifacts);
  const cwd = defaultOutput ? dir : repo;
  const args = [...(preload ? ['--import', preload] : []), join(repo, 'scripts', script),
    ...(argv ? argv(artifacts) : ['--url', url, '--output', artifacts])];
  const command = [process.execPath, ...args];
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    const timer = setTimeout(() => { child.kill('SIGKILL'); }, 180_000);
    child.once('error', reject);
    child.once('close', (exitCode, signal) => { clearTimeout(timer); resolve({ exitCode, signal, stdout, stderr }); });
  });
  if (readonlyDirectory) await chmod(artifacts, 0o755);
  await writeFile(join(dir, 'stdout.log'), result.stdout);
  await writeFile(join(dir, 'stderr.log'), result.stderr);
  const record = { name, fixture: true, command, cwd, readonlyReport, readonlyDirectory, exitCode: result.exitCode, signal: result.signal, reportFile,
    stdout: join(dir, 'stdout.log'), stderr: join(dir, 'stderr.log') };
  await writeFile(join(dir, 'execution.json'), JSON.stringify(record, null, 2));
  let report;
  try { report = JSON.parse(await readFile(reportFile, 'utf8')); } catch (error) { record.reportReadError = error.message; }
  return { dir, artifacts, record, report, sentinel, seededReport };
}

function assertFailedRun(run) {
  assert.equal(run.record.signal, null, 'fixture 子进程必须自行退出，不得靠超时杀死');
  assert.ok(run.record.exitCode !== 0, '已知负例必须返回非 0');
  assert.ok(run.report, '异常也必须生成本轮报告');
  assert.equal(run.report.passed, false, '旧 passed=true 不得残留或被误认为本轮成功');
  assert.notEqual(run.report.runId, 'stale-fixture', '报告必须属于本轮而不是 stale fixture');
  assert.equal(run.report.collected, 0, '首个记录写入前的故障不能虚报已完成组合');
  assert.equal(run.report.expected, 378, '负例不得缩小 21×2×3×3 矩阵');
  assert.equal(run.report.integrity.missing.length, run.report.expected, '必须明确列出未完成组合');
  assert.ok(run.report.errors.length > 0, '必须保留真实异常原因');
}

async function withAppFixture(name, mutate, test) {
  const dir = join(output, name);
  await mkdir(dir, { recursive: true });
  const events = [], errors = [];
  // 只转发已有静态服务器；负例仅修改本地 app.js 副本，绝不伪造 API 或验收结果。
  const server = createServer((request, response) => {
    const fail = (error) => {
      if (response.destroyed) return;
      errors.push(error.message);
      response.writeHead(502, { 'content-type': 'text/plain' });
      response.end('[validation-fixture] proxy error: ' + error.message);
    };
    const upstream = httpRequest(new URL(request.url.replace(/^\//, ''), base), (incoming) => {
      const headers = Object.fromEntries(Object.entries(incoming.headers).filter(([key]) =>
        !['content-length', 'transfer-encoding', 'connection'].includes(key)));
      if (!new URL(request.url, base).pathname.endsWith('/src/app.js')) {
        // 流式转发真正的资源（包括开发服务器 SSE），浏览器关闭时取消上游。
        response.writeHead(incoming.statusCode, headers);
        incoming.pipe(response);
        return;
      }
      const chunks = [];
      incoming.on('data', (chunk) => chunks.push(chunk));
      incoming.on('end', async () => {
        try {
          assert.equal(incoming.statusCode, 200, '必须取得真实 app.js 才能注入负例');
          const body = Buffer.from(mutate(Buffer.concat(chunks).toString('utf8')));
          await writeFile(join(dir, 'app.negative-fixture.js'), body);
          events.push({ fixture: true, path: request.url, injected: true });
          response.writeHead(incoming.statusCode, headers);
          response.end(body);
        } catch (error) { fail(error); }
      });
      incoming.on('error', fail);
    });
    response.once('close', () => upstream.destroy());
    upstream.on('error', fail);
    upstream.end();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    await test('http://127.0.0.1:' + server.address().port + '/');
    assert.ok(events.length > 0, '负例必须实际注入，不能空遍历');
    assert.deepEqual(errors, [], '代理故障不能代替预期验收失败');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await writeFile(join(dir, 'fixture.json'), JSON.stringify({ fixture: true, events, errors }, null, 2));
  }
}

function replaceOnce(source, needle, replacement) {
  assert.equal(source.split(needle).length - 1, 1, '故障注入锚点必须唯一：' + needle);
  return source.replace(needle, replacement);
}

// 固定的空 axe 结果只用于已知负例，加速检查器的假阳性复现；绝不是产品审计。
// 每次仍操作真实页面，并独立保存浏览器读回的状态，不能把请求值当观察值。
async function negativeAuditFixture(name, mutateStyles = '', stopStyle = null) {
  const dir = join(output, name);
  await mkdir(dir, { recursive: true });
  const preload = join(dir, 'negative-audit-fixture.mjs');
  const observations = join(dir, 'negative-audit-observed.ndjson');
  await writeFile(observations, '');
  await writeFile(preload, `// EXPLICIT NEGATIVE FIXTURE: synthetic empty axe results, NOT product acceptance.
import { createRequire } from 'node:module';
import { appendFile } from 'node:fs/promises';
import { styles } from ${JSON.stringify(new URL('../src/data/styles.js', import.meta.url).href)};
${mutateStyles}
const require = createRequire(${JSON.stringify(join(repo, 'package.json'))});
const { chromium } = require('playwright');
const launch = chromium.launch.bind(chromium);
chromium.launch = async (...args) => {
  const browser = await launch(...args);
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...args) => {
    const context = await newContext(...args);
    const newPage = context.newPage.bind(context);
    const close = context.close.bind(context);
    context.newPage = async (...args) => {
      const page = await newPage(...args);
      const addScriptTag = page.addScriptTag.bind(page);
      const waitForTimeout = page.waitForTimeout.bind(page);
      page.waitForTimeout = (ms) => waitForTimeout(Math.min(ms, 10));
      page.addScriptTag = async (...args) => {
        const script = await addScriptTag(...args);
        await page.evaluate(() => {
          window.__negativeAuditStates = [];
          window.axe.run = async () => {
            ${stopStyle ? `if (document.documentElement.getAttribute('data-style') === ${JSON.stringify(stopStyle)}) throw new Error('[validation-fixture] expanded style reached');` : ''}
            const main = document.querySelector('#main');
            const counts = { gallery: main.querySelectorAll('.card:not(.tcard)').length,
              styles: main.querySelectorAll('.sframe').length, templates: main.querySelectorAll('.tcard').length };
            window.__negativeAuditStates.push({ fixture: true, purpose: 'negative-only synthetic audit',
              view: Object.keys(counts).find((view) => counts[view] > 0), counts, width: innerWidth,
              selectedViews: [...document.querySelectorAll('#viewSeg [aria-pressed="true"]')].map((button) => button.dataset.view),
              style: document.documentElement.getAttribute('data-style'), styleSelector: document.querySelector('#styleSel').value,
              theme: document.documentElement.getAttribute('data-theme') });
            return { violations: [] };
          };
        });
        return script;
      };
      return page;
    };
    context.close = async (...args) => {
      for (const page of context.pages()) {
        const records = await page.evaluate(() => window.__negativeAuditStates || []);
        if (records.length) await appendFile(${JSON.stringify(observations)}, records.map((record) => JSON.stringify(record)).join('\\n') + '\\n');
      }
      return await close(...args);
    };
    return context;
  };
  return browser;
};
`);
  return { preload, observations };
}

// 已知负例用最小静态卡片保留真实外壳事件与元数据，避免运行 378 次重型演示。
// 不用于任何正例，也不伪装模板 init；真实产品仍由 mobile-clean 和完整矩阵验收。
function negativeMatrixApp(source) {
  source = replaceOnce(source, 'function cardHTML(item) {', `function cardHTML(item) {
  return '<article class="card" data-card="' + item.id + '">[negative-fixture] component placeholder</article>';`);
  source = replaceOnce(source, 'function styleFrame(s) {', `function styleFrame(s) {
  return '<section class="sframe' + (s.id === state.style ? ' sframe--on' : '') + '" data-style="' + s.id + '" data-theme="' + state.theme + '">[negative-fixture] style placeholder</section>';`);
  source = replaceOnce(source, 'function tplCardHTML(t) {', `function tplCardHTML(t) {
  return '<article class="card tcard" data-card="tpl-' + t.id + '"><div class="tphone"' + (t.style ? ' data-template-style="' + t.style + '" data-style="' + t.style + '" data-theme="' + state.theme + '"' : '') + '><div class="t-screen t-' + t.id + '" data-ready="1">[negative-fixture] template placeholder, no init audited</div></div></article>';`);
  return replaceOnce(source, 'function mountTemplates() {', 'function mountTemplates() {\n  return; // [negative-fixture] static placeholders only, never a product init result');
}

// 用真实 chmod + 真实 writeFile 触发 I/O 失败，不伪造文件系统异常。
async function finalReadonlyFixture(name, blockCall = 2) {
  const dir = join(output, name);
  await mkdir(dir, { recursive: true });
  const preload = join(dir, (blockCall === 1 ? 'initial' : 'final') + '-readonly-fixture.mjs');
  const events = join(dir, 'write-events.ndjson');
  const reportFile = join(dir, 'artifacts', 'report.json');
  await writeFile(events, '');
  await writeFile(preload, `// EXPLICIT NEGATIVE FIXTURE: block a report write with real filesystem permissions.
import fs from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
const write = fs.writeFile.bind(fs);
const append = fs.appendFile.bind(fs);
let calls = 0;
fs.writeFile = async (file, ...args) => {
  if (String(file) !== ${JSON.stringify(reportFile)}) return await write(file, ...args);
  const call = ++calls;
  if (call === ${blockCall}) {
    if (call === 1) await write(file, JSON.stringify({ fixture: 'INITIAL-WRITE-BLOCKED', passed: false }));
    await fs.chmod(file, 0o444);
  }
  try {
    const result = await write(file, ...args);
    await append(${JSON.stringify(events)}, JSON.stringify({ fixture: true, call, code: 'OK' }) + '\\n');
    return result;
  } catch (error) {
    await append(${JSON.stringify(events)}, JSON.stringify({ fixture: true, call, code: error.code }) + '\\n');
    throw error;
  }
};
syncBuiltinESMExports();
`);
  return { preload, events };
}

async function assertUnwrittenFailure(run) {
  assert.equal(run.record.signal, null);
  assert.ok(run.record.exitCode !== 0, '无法写报告的本轮也必须非 0 退出');
  const stderr = await readFile(run.record.stderr, 'utf8');
  const prefix = '本轮报告无法写入，失败摘要：';
  const lines = stderr.split('\n').filter((line) => line.startsWith(prefix));
  assert.equal(lines.length, 1, '不能假报报告已写入，必须给出可解析的当前失败摘要');
  const failure = JSON.parse(lines[0].slice(prefix.length));
  assert.equal(failure.passed, false);
  assert.equal(failure.reportWritten, false);
  assert.ok(failure.runId && failure.runId !== 'stale-fixture');
  assert.ok(failure.errors.length > 0);
  assert.ok((await readFile(run.record.stdout, 'utf8')).includes('本轮报告未写入'));
  run.record.currentFailure = failure;
  return failure;
}

const tests = new Map();
for (const [prefix, script] of [['mobile', 'test-mobile-previews.mjs'], ['matrix', 'test-accessibility.mjs']]) {
  const defaultOutput = prefix === 'matrix' ? '.cache/accessibility' : '.cache/mobile-smoke';
  tests.set(prefix + '-args-default', async () => {
    const run = await runScript(prefix + '-args-default', script, base, { defaultOutput, argv: () => ['--url'] });
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0);
    assert.equal(run.report?.passed, false, '未指定 --output 时默认目录的旧成功也必须先失效');
    assert.notEqual(run.report.runId, 'stale-fixture');
    assert.ok(run.report.errors.some((error) => error.stage === 'arguments' && error.message.includes('--url 缺少参数')));
    assert.equal(await readFile(run.sentinel, 'utf8'), 'validation fixture: unrelated evidence must not be deleted\n');
  });
  tests.set(prefix + '-readonly-directory', async () => {
    const run = await runScript(prefix + '-readonly-directory', script, base, { readonlyDirectory: true });
    evidence.cases.push(run.record);
    assert.equal(run.report?.runId, 'stale-fixture', '不可写目录中确实仍是不可改动的旧文件，不能伪造新报告');
    const failure = await assertUnwrittenFailure(run);
    assert.equal(failure.reportFile, run.record.reportFile);
    assert.ok(failure.errors.some((error) => error.message.includes('EACCES')), '必须捕获实际目录权限错误');
    assert.equal(await readFile(run.sentinel, 'utf8'), 'validation fixture: unrelated evidence must not be deleted\n');
  });
  tests.set(prefix + '-mkdir-file', async () => {
    const name = prefix + '-mkdir-file';
    const blocked = (artifacts) => join(artifacts, 'NOT-A-DIRECTORY.fixture');
    const url = await unavailableURL();
    const run = await runScript(name, script, url, {
      prepare: (artifacts) => writeFile(blocked(artifacts), '[validation-fixture] output is a file, not a directory\n'),
      reportTarget: (artifacts) => join(blocked(artifacts), 'report.json'),
      argv: (artifacts) => ['--url', url, '--output', blocked(artifacts)]
    });
    evidence.cases.push(run.record);
    const failure = await assertUnwrittenFailure(run);
    assert.ok(failure.errors.some((error) => error.stage === 'output' && error.message.includes('EEXIST')), 'mkdir 异常必须纳入当前失败摘要');
    assert.equal(failure.reportFile, run.record.reportFile);
    assert.equal(run.report, undefined, '文件型 output 下不能声称有 report.json');
    assert.equal(await readFile(blocked(run.artifacts), 'utf8'), '[validation-fixture] output is a file, not a directory\n');
    assert.equal(JSON.parse(await readFile(run.seededReport, 'utf8')).runId, 'stale-fixture', '不得改写输出路径之外的旧报告');
  });
  tests.set(prefix + '-output-source-invalid', async () => {
    const url = await unavailableURL();
    const run = await runScript(prefix + '-output-source-invalid', script, url,
      { defaultOutput, argv: () => ['--output', '--url', url] });
    evidence.cases.push(run.record);
    const failure = await assertUnwrittenFailure(run);
    assert.equal(failure.reportFile, null, '非法输出源值不能被猜成 --url 目录或默认目录');
    assert.ok(failure.errors.some((error) => error.stage === 'arguments-output'));
    assert.equal(run.report.runId, 'stale-fixture', '输出未知时不得擅自覆盖默认目录报告');
    await assert.rejects(readFile(join(run.dir, '--url', 'report.json')), (error) => error.code === 'ENOENT', '不得创建猜修目录');
  });
  tests.set(prefix + '-initial-write', async () => {
    const name = prefix + '-initial-write';
    const fixture = await finalReadonlyFixture(name, 1);
    const run = await runScript(name, script, base, fixture);
    evidence.cases.push(run.record);
    const events = (await readFile(fixture.events, 'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);
    assert.ok(events.some((event) => event.call === 1 && event.code === 'EACCES'), '必须实际触发初写失败');
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0);
    assert.equal(run.report?.passed, false);
    assert.ok(run.report.runId && run.report.runId !== 'stale-fixture');
    assert.ok(run.report.errors.some((error) => error.stage === 'report-start'));
    assert.equal(run.report.status, 'failed');
    assert.ok(events.some((event) => event.call > 2 && event.code === 'OK'), '初写失败后可写的当前失败证据必须实际落盘');
  });
  tests.set(prefix + '-url-case-preserved', async () => {
    const url = (await unavailableURL()).replace('http:', 'HTTP:');
    const run = await runScript(prefix + '-url-case-preserved', script, url);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0);
    assert.equal(run.report?.passed, false);
    assert.equal(run.report.urlSource, url, '合法 HTTP scheme 大小写必须原样保留，不改写源 URL');
    assert.equal(run.report.base, url);
    assert.ok(run.report.errors.some((error) => error.message.includes('ERR_CONNECTION_REFUSED')), '合法源值必须进入真实导航，不能被参数校验错误拒绝');
  });
  tests.set(prefix + '-final-readonly', async () => {
    const name = prefix + '-final-readonly';
    const fixture = await finalReadonlyFixture(name);
    const run = await runScript(name, script, await unavailableURL(), fixture);
    evidence.cases.push(run.record);
    const events = (await readFile(fixture.events, 'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);
    assert.ok(events.some((event) => event.call === 2 && event.code === 'EACCES'), '负例必须真的在 final write 遇到只读权限错误');
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0);
    assert.equal(run.report?.passed, false);
    assert.ok(run.report.errors.some((error) => error.stage === 'report-write'), '目录可写时必须替换只读报告，写入本轮 final-write 失败证据');
    assert.equal(run.report.status, 'failed', '不能只留下初写的 running 报告');
    assert.ok(events.some((event) => event.call > 2 && event.code === 'OK'), '必须实际写回可写的当前失败报告');
    assert.equal(await readFile(run.sentinel, 'utf8'), 'validation fixture: unrelated evidence must not be deleted\n');
  });
}

tests.set('mobile-args-missing', async () => {
  const run = await runScript('mobile-args-missing', 'test-mobile-previews.mjs', base,
    { argv: (artifacts) => ['--url', '--output', artifacts] });
  evidence.cases.push(run.record);
  assert.equal(run.record.signal, null);
  assert.ok(run.record.exitCode !== 0, '缺少 URL 参数必须非 0 退出');
  assert.equal(run.report?.passed, false, '参数错误之前必须使已知输出目录的旧成功失效');
  assert.notEqual(run.report.runId, 'stale-fixture');
  assert.ok(run.report.errors.some((error) => error.stage === 'arguments' && error.message.includes('--url 缺少参数')), '必须归档真实参数错误');
  assert.equal(run.report.counts.previews, 0);
  assert.equal(await readFile(run.sentinel, 'utf8'), 'validation fixture: unrelated evidence must not be deleted\n');
});

tests.set('mobile-readonly-report', async () => {
  assert.notEqual(process.getuid?.(), 0, '真实只读文件负例需要非 root 权限，不能伪造 EACCES');
  const run = await runScript('mobile-readonly-report', 'test-mobile-previews.mjs', await unavailableURL(), { readonlyReport: true });
  evidence.cases.push(run.record);
  assert.equal(run.record.signal, null);
  assert.ok(run.record.exitCode !== 0);
  assert.equal(run.report?.passed, false, '目录可写但旧 report 只读时，旧 passed=true 也必须先失效');
  assert.notEqual(run.report.runId, 'stale-fixture');
  assert.ok(run.report.errors.some((error) => error.message.includes('ERR_CONNECTION_REFUSED')), '替换只读旧报告之后仍应执行真实失败路径并归档');
  assert.equal(run.report.counts.previews, 0);
  assert.equal(await readFile(run.sentinel, 'utf8'), 'validation fixture: unrelated evidence must not be deleted\n');
});

tests.set('matrix-args-missing', async () => {
  const run = await runScript('matrix-args-missing', 'test-accessibility.mjs', base,
    { argv: (artifacts) => ['--output', artifacts, '--url'] });
  evidence.cases.push(run.record);
  assert.equal(run.report?.passed, false, 'a11y 参数解析抛错前也必须使已知输出目录的旧成功失效');
  assertFailedRun(run);
  assert.ok(run.report.errors.some((error) => error.stage === 'arguments' && error.message.includes('--url 缺少参数')));
  assert.equal(await readFile(run.sentinel, 'utf8'), 'validation fixture: unrelated evidence must not be deleted\n');
});

tests.set('matrix-inventory-shrink', async () => {
  const name = 'matrix-inventory-shrink';
  const fixture = await negativeAuditFixture(name, `styles.splice(styles.findIndex((style) => style.id === 'flyme'), 1);`);
  await withAppFixture(name, negativeMatrixApp, async (url) => {
    // GREEN 在 launch 前阻断；先独立取回负例副本，证明注入实际发生而非空代理。
    assert.match(await (await fetch(new URL('src/app.js', url))).text(), /\[negative-fixture\]/);
    const run = await runScript(name, 'test-accessibility.mjs', url, fixture);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, '删掉风格后自缩到 360 的矩阵不得假绿');
    assert.equal(run.report?.passed, false, '负例不得把缩小后的规模冒充完整验收');
    assert.equal(run.report.styles, 20, '必须如实记录负例实际库存，不能虚报 21');
    assert.ok(run.report.expected >= 378, '21/378 是独立契约下限，不能随 styles.length 缩小');
    assert.equal(run.report.collected, 0, '库存检查应在浏览器矩阵开始前阻断');
    assert.ok(run.report.errors.some((error) => error.stage === 'inventory'), '必须保存独立库存断言的失败原因');
    assert.ok(run.report.inventory.missing.includes('flyme'), '必须指出缺失的契约风格 ID');
    assert.equal(await readFile(run.sentinel, 'utf8'), 'validation fixture: unrelated evidence must not be deleted\n');
  });
});

tests.set('matrix-inventory-duplicate', async () => {
  const fixture = await negativeAuditFixture('matrix-inventory-duplicate', `styles[styles.length - 1] = { ...styles[styles.length - 1], id: 'originos' };`);
  const run = await runScript('matrix-inventory-duplicate', 'test-accessibility.mjs', base, fixture);
  evidence.cases.push(run.record);
  assert.equal(run.record.signal, null);
  assert.ok(run.record.exitCode !== 0);
  assert.equal(run.report?.passed, false);
  assert.equal(run.report.expected, 378);
  assert.equal(run.report.collected, 0);
  assert.ok(run.report.inventory.duplicates.includes('originos'), '唯一 ID 必须独立检查，不能只看风格数量');
  assert.ok(run.report.errors.some((error) => error.stage === 'inventory'));
});

tests.set('matrix-inventory-expand', async () => {
  const name = 'matrix-inventory-expand';
  const extra = 'validation-extra';
  const addition = `styles.push({ ...styles[0], id: '${extra}' });`;
  const fixture = await negativeAuditFixture(name, addition, extra);
  await withAppFixture(name, (source) => negativeMatrixApp(replaceOnce(source,
    '/* ---- 启动 ---- */', '// [negative-fixture] expanded metadata, never a product style\n' + addition + '\n/* ---- 启动 ---- */')), async (url) => {
    const run = await runScript(name, 'test-accessibility.mjs', url, fixture);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, '在第 22 套风格注入的负例必须实际被遍历，不能截断到原 21 套');
    assert.equal(run.report?.passed, false);
    assert.equal(run.report.styles, 22);
    assert.equal(run.report.expected, 22 * 2 * 3 * 3, '库存扩充后仍生成全量矩阵');
    assert.equal(run.report.workerSettlements.length, 3);
    assert.equal(run.report.errors.filter((error) => error.stage === 'axe' && error.combination?.style === extra && error.message.includes('expanded style reached')).length, 3);
    assert.ok(run.report.integrity.missing.some((key) => key.includes('/' + extra + '/')));
  });
});

tests.set('matrix-view-noop', async () => {
  const name = 'matrix-view-noop';
  const fixture = await negativeAuditFixture(name);
  await withAppFixture(name, (source) => negativeMatrixApp(replaceOnce(source,
    '  state.view = b.dataset.view;', '  return; // [validation-fixture] silent view no-op')), async (url) => {
    const run = await runScript(name, 'test-accessibility.mjs', url, fixture);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, '静默 view 失效不得把同一实际画廊标成三个视图并假绿');
    assert.equal(run.report?.passed, false);
    assert.equal(run.report.expected, 378);
    assert.ok(run.report.errors.some((error) => error.stage === 'actual-state' && error.observed?.view !== error.combination?.view), '必须保存请求视图与实际渲染视图不符的证据');
    assert.ok(run.report.collected < run.report.expected, '未生效组合不能计入已确认覆盖');
  });
});

tests.set('matrix-style-noop', async () => {
  const name = 'matrix-style-noop';
  const fixture = await negativeAuditFixture(name);
  await withAppFixture(name, (source) => negativeMatrixApp(replaceOnce(source,
    '  applyStyle(styleSel.value);', '  /* [validation-fixture] selector changes but style application is a silent no-op */')), async (url) => {
    const run = await runScript(name, 'test-accessibility.mjs', url, fixture);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, '静默 style 失效不得把实际 aurora 冒充 21 套风格并假绿');
    assert.equal(run.report?.passed, false);
    assert.equal(run.report.expected, 378);
    assert.ok(run.report.errors.some((error) => error.stage === 'actual-state' && error.observed?.style !== error.combination?.style), '必须同时读回 html 风格与选择器，而非仅记录所选值');
    assert.ok(run.report.collected < run.report.expected);
  });
});

tests.set('matrix-render-noop', async () => {
  const name = 'matrix-render-noop';
  const fixture = await negativeAuditFixture(name);
  await withAppFixture(name, (source) => negativeMatrixApp(replaceOnce(source,
    'function render() {', 'function render() {\n  if (state.view !== "gallery") return; // [validation-fixture] tabs change, rendered content does not')), async (url) => {
    const run = await runScript(name, 'test-accessibility.mjs', url, fixture);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, '视图按钮已切换但内容未渲染时也必须阻断');
    assert.equal(run.report?.passed, false);
    assert.ok(run.report.errors.some((error) => error.stage === 'actual-state' && error.observed?.view !== error.combination?.view &&
      JSON.stringify(error.observed.controls.views) === JSON.stringify([error.combination.view])), '不能把按钮的请求状态冒充实际渲染视图');
  });
});

tests.set('matrix-selector-stale', async () => {
  const name = 'matrix-selector-stale';
  const fixture = await negativeAuditFixture(name);
  await withAppFixture(name, (source) => negativeMatrixApp(replaceOnce(source,
    '  styleSel.value = id;', "  styleSel.value = 'aurora'; // [validation-fixture] html applies but selector is stale")), async (url) => {
    const run = await runScript(name, 'test-accessibility.mjs', url, fixture);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, 'html 风格生效但选择器值不符时也必须阻断');
    assert.equal(run.report?.passed, false);
    assert.ok(run.report.errors.some((error) => error.stage === 'actual-state' && error.observed?.style === error.combination?.style &&
      error.observed.controls.style !== error.combination.style), '必须独立核验选择器值');
  });
});

tests.set('matrix-theme-noop', async () => {
  const name = 'matrix-theme-noop';
  const fixture = await negativeAuditFixture(name);
  await withAppFixture(name, (source) => negativeMatrixApp(replaceOnce(source,
    "  state.theme = state.theme === 'light' ? 'dark' : 'light';", '  /* [validation-fixture] silent theme no-op */')), async (url) => {
    const run = await runScript(name, 'test-accessibility.mjs', url, fixture);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, '静默 theme 失效不得把实际 light 重复标成明暗两套并假绿');
    assert.equal(run.report?.passed, false);
    assert.equal(run.report.expected, 378);
    assert.ok(run.report.errors.some((error) => error.stage === 'actual-state' && error.observed?.theme !== error.combination?.theme), '必须保存请求主题与实际 html 主题不符的证据');
    assert.ok(run.report.collected < run.report.expected);
  });
});

tests.set('matrix-colors-frozen', async () => {
  const name = 'matrix-colors-frozen';
  const fixture = await negativeAuditFixture(name);
  await withAppFixture(name, (source) => negativeMatrixApp(source) + `
// Explicit negative fixture: attributes and selectors work, but visible shell colors stay at boot values.
const negativeBody = getComputedStyle(document.body);
const negativeMark = getComputedStyle(document.querySelector('.brand .mark'));
const negativeColors = document.createElement('style');
negativeColors.dataset.validationFixture = 'frozen-computed-colors';
negativeColors.textContent = 'body{color:' + negativeBody.color + '!important}.brand .mark{background-color:' + negativeMark.backgroundColor + '!important;color:' + negativeMark.color + '!important}';
document.head.append(negativeColors);
`, async (url) => {
    const run = await runScript(name, 'test-accessibility.mjs', url, fixture);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, '属性已变化但计算颜色冻结时也必须阻断，不得只看标签值');
    assert.equal(run.report?.passed, false);
    assert.ok(run.report.errors.some((error) => error.stage === 'actual-state' && error.observed?.mismatches.some((issue) => issue.startsWith('computed '))), '必须保存实际计算颜色与目标 token 的不符证据');
    assert.equal(run.report.expected, 378);
    assert.ok(run.report.collected < run.report.expected);
  });
});

tests.set('matrix-stale', async () => {
  const run = await runScript('matrix-stale', 'test-accessibility.mjs', await unavailableURL());
  evidence.cases.push(run.record);
  assertFailedRun(run);
  assert.equal(await readFile(run.sentinel, 'utf8'), 'validation fixture: unrelated evidence must not be deleted\n');
  assert.equal(run.report.workerSettlements.length, 3, '三个 worker 必须全部结算');
  assert.ok(run.report.errors.every((error) => error.message.length > 0));
});

tests.set('matrix-workers', async () => {
  const dir = join(output, 'matrix-workers');
  await mkdir(dir, { recursive: true });
  const events = join(dir, 'worker-events.ndjson');
  await writeFile(events, '');
  const preload = join(dir, 'delayed-navigation-fixture.mjs');
  await writeFile(preload, `// Explicit negative fixture: delay real failed navigations, never fake audit results.
import { createRequire } from 'node:module';
import { appendFileSync } from 'node:fs';
const require = createRequire(${JSON.stringify(join(repo, 'package.json'))});
const { chromium } = require('playwright');
const launch = chromium.launch.bind(chromium);
const log = (event) => appendFileSync(${JSON.stringify(events)}, JSON.stringify({ fixture: true, ...event }) + '\\n');
chromium.launch = async (...args) => {
  const browser = await launch(...args);
  const newContext = browser.newContext.bind(browser);
  const close = browser.close.bind(browser);
  let index = 0, active = 0;
  browser.newContext = async (...args) => {
    const worker = index++;
    const context = await newContext(...args);
    const newPage = context.newPage.bind(context);
    context.newPage = async (...args) => {
      const page = await newPage(...args);
      const goto = page.goto.bind(page);
      page.goto = async (...args) => {
        active++;
        log({ type: 'navigation-started', worker });
        try {
          await new Promise((resolve) => setTimeout(resolve, worker * 350));
          return await goto(...args);
        } finally {
          active--;
          log({ type: 'navigation-settled', worker });
        }
      };
      return page;
    };
    return context;
  };
  browser.close = async (...args) => { log({ type: 'browser-close', active }); return await close(...args); };
  return browser;
};
`);
  const run = await runScript('matrix-workers', 'test-accessibility.mjs', await unavailableURL(), { preload });
  evidence.cases.push(run.record);
  const rows = (await readFile(events, 'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);
  const closing = rows.findIndex((row) => row.type === 'browser-close');
  assert.ok(closing >= 0, '必须实际关闭 browser');
  assert.equal(rows[closing].active, 0, 'browser.close 必须等待所有已开始的真实导航结算');
  assert.equal(rows.slice(0, closing).filter((row) => row.type === 'navigation-settled').length, 3, '不能提前关闭其它 worker');
  assertFailedRun(run);
  assert.equal(run.report.workerSettlements.length, 3);
});

tests.set('matrix-launch', async () => {
  const dir = join(output, 'matrix-launch');
  await mkdir(dir, { recursive: true });
  const preload = join(dir, 'missing-browser-fixture.mjs');
  await writeFile(preload, `// Explicit negative fixture: exercise a real launch error with a missing executable.
import { createRequire } from 'node:module';
const require = createRequire(${JSON.stringify(join(repo, 'package.json'))});
const { chromium } = require('playwright');
const launch = chromium.launch.bind(chromium);
chromium.launch = (options = {}) => launch({ ...options, executablePath: ${JSON.stringify(join(dir, 'NONEXISTENT-fixture-chromium'))} });
`);
  const run = await runScript('matrix-launch', 'test-accessibility.mjs', await unavailableURL(), { preload, env: { NODE_OPTIONS: '' } });
  evidence.cases.push(run.record);
  assertFailedRun(run);
  assert.ok(run.report.errors.some((error) => error.stage === 'launch'), 'launch 异常必须归档');
});

tests.set('matrix-io', async () => {
  const artifacts = join(output, 'matrix-io', 'artifacts');
  await mkdir(join(artifacts, 'gallery.ndjson'), { recursive: true });
  const run = await runScript('matrix-io', 'test-accessibility.mjs', await unavailableURL());
  evidence.cases.push(run.record);
  assertFailedRun(run);
  assert.ok(run.report.errors.some((error) => error.view === 'gallery' && error.stage === 'record-file'), 'worker I/O 异常必须归档');
});

for (const mode of ['axe', 'assertion']) {
  tests.set('matrix-' + mode, async () => {
    const name = 'matrix-' + mode;
    const dir = join(output, name);
    await mkdir(dir, { recursive: true });
    const preload = join(dir, mode + '-failure-fixture.mjs');
    const injection = mode === 'axe'
      ? `window.axe.run = () => { throw new Error('[validation-fixture] axe execution failed'); };`
      : `const frame = document.createElement('iframe'); frame.title = '[validation-fixture] unsupported extra frame'; frame.src = 'about:blank'; document.body.append(frame);`;
    await writeFile(preload, `// Explicit local negative fixture: inject an audit exception or a real unsupported frame, not fake results.
import { createRequire } from 'node:module';
const require = createRequire(${JSON.stringify(join(repo, 'package.json'))});
const { chromium } = require('playwright');
const launch = chromium.launch.bind(chromium);
chromium.launch = async (...args) => {
  const browser = await launch(...args);
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...args) => {
    const context = await newContext(...args);
    const newPage = context.newPage.bind(context);
    context.newPage = async (...args) => {
      const page = await newPage(...args);
      const addScriptTag = page.addScriptTag.bind(page);
      page.addScriptTag = async (...args) => {
        const script = await addScriptTag(...args);
        await page.evaluate(() => { ${injection} });
        return script;
      };
      return page;
    };
    return context;
  };
  return browser;
};
`);
    const run = await runScript(name, 'test-accessibility.mjs', base, { preload });
    evidence.cases.push(run.record);
    assertFailedRun(run);
    assert.equal(run.report.workerSettlements.length, 3);
    assert.ok(run.report.errors.filter((error) => error.stage === mode).length === 3, '三个 worker 的 ' + mode + ' 异常都必须归档');
  });
}

tests.set('export-broken-init', async () => {
  await withAppFixture('export-broken-init', (source) => replaceOnce(source,
    '\\ninit(root);\\nroot.dataset.ready',
    '\\nthrow new Error("[validation-fixture] broken copied init");\\ninit(root);\\nroot.dataset.ready'), async (url) => {
    const run = await runScript('export-broken-init', 'test-mobile-previews.mjs', url);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, '复制的完整 HTML 初始化抛错时必须失败；不得用原模板 init 代替');
    assert.equal(run.report?.passed, false);
    assert.ok(run.report.errors.some((error) => error.message.includes('[validation-fixture] broken copied init')), '必须捕获已复制文档自身脚本的真实异常');
  });
});

tests.set('export-no-action', async () => {
  await withAppFixture('export-no-action', (source) => replaceOnce(source,
    '      fnSource(t.init) +',
    '      (t.id === "oneui-tasks" ? "function init(root) { /* [validation-fixture] no exported actions */ }" : fnSource(t.init)) +'), async (url) => {
    const run = await runScript('export-no-action', 'test-mobile-previews.mjs', url);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, '已复制 HTML 虽标 ready 但关键操作失效也必须失败');
    assert.equal(run.report?.passed, false);
    assert.match(run.report.failure, /oneui-tasks.*剩余数量/, '失败应来自独立页的真实任务操作断言');
  });
});

for (const control of ['theme', 'style']) {
  tests.set('state-' + control + '-reset', async () => {
    const name = 'state-' + control + '-reset';
    await withAppFixture(name, (source) => source + `
// Explicit local negative fixture: keep root, controls and any smokeState marker; reset MIUI state only.
(() => {
  const snapshots = new WeakMap();
  const remember = () => document.querySelectorAll('.tcard .t-miui-settings[data-ready="1"]').forEach((root) => {
    if (snapshots.has(root)) return;
    snapshots.set(root, {
      inputs: [...root.querySelectorAll('input')].map((node) => ({ node, value: node.value, checked: node.checked })),
      hidden: [...root.querySelectorAll('[data-setting], [data-setting-group], [data-empty]')].map((node) => ({ node, hidden: node.hidden })),
      texts: [...root.querySelectorAll('[data-state], [data-feedback]')].map((node) => ({ node, text: node.textContent }))
    });
  });
  new MutationObserver(remember).observe(document.querySelector('#main'), {
    subtree: true, childList: true, attributes: true, attributeFilter: ['data-ready']
  });
  remember();
  document.querySelector(${JSON.stringify(control === 'theme' ? '#themeBtn' : '#styleSel')}).addEventListener(${JSON.stringify(control === 'theme' ? 'click' : 'change')}, () => {
    document.querySelectorAll('.tcard .t-miui-settings').forEach((root) => {
      const state = snapshots.get(root);
      if (!state) return;
      state.inputs.forEach(({ node, value, checked }) => { node.value = value; node.checked = checked; });
      state.hidden.forEach(({ node, hidden }) => { node.hidden = hidden; });
      state.texts.forEach(({ node, text }) => { node.textContent = text; });
    });
  });
})();
`, async (url) => {
      const run = await runScript(name, 'test-mobile-previews.mjs', url);
      evidence.cases.push(run.record);
      assert.equal(run.record.signal, null);
      assert.ok(run.record.exitCode !== 0, '全局 ' + control + ' 重置真实状态但保留虚标记时必须失败');
      assert.equal(run.report?.passed, false);
      assert.match(run.report.failure, /miui-settings.*真实交互状态/, '失败必须来自真实结果比较而非 smokeState 虚标记');
      assert.ok(run.report.previews.every((preview) => preview.interaction?.before && preview.interaction?.after), '切换前六个预览都必须已经真实交互');
    });
  });
}

tests.set('layout-default-overflow', async () => {
  await withAppFixture('layout-default-overflow', (source) => source + `
// Explicit local negative fixture: overflow a default row hidden by the later real search.
const validationStyle = document.createElement('style');
validationStyle.dataset.validationFixture = 'default-content-overflow';
validationStyle.textContent = '.t-miui-settings [data-setting="护眼显示"] { min-width: 1600px }';
document.head.append(validationStyle);
`, async (url) => {
    const run = await runScript('layout-default-overflow', 'test-mobile-previews.mjs', url);
    evidence.cases.push(run.record);
    assert.equal(run.record.signal, null);
    assert.ok(run.record.exitCode !== 0, '原默认内容的溢出必须失败，不能只测交互过滤后变小的内容');
    assert.equal(run.report?.passed, false);
    assert.match(run.report.failure, /内容不能横向溢出/, '必须保留原默认内容响应式断言');
  });
});

tests.set('mobile-clean', async () => {
  const run = await runScript('mobile-clean', 'test-mobile-previews.mjs', base);
  run.record.fixture = false;
  evidence.cases.push(run.record);
  assert.equal(run.record.signal, null);
  assert.equal(run.record.exitCode, 0, '真实合规页面必须通过，不能只会拒绝所有输入');
  assert.equal(run.report?.passed, true);
  assert.deepEqual(run.report.errors, []);
  const { previews, viewports, standalone, counts, integrity } = run.report;
  const scrolling = previews.filter((preview) => preview.scroll?.max > 0 && preview.scroll.top > 0);
  assert.ok(scrolling.length > 0, '至少一个真实可滚动预览必须先改变 scrollTop，不能全由 max<=0 空通过');
  for (const preview of scrolling) assert.ok(preview.retention.every((record) => record.scrollTop === preview.scroll.top && record.scrollTop > 0), '有效滚动样本必须在全部既有切换中保留位置');
  assert.equal(previews.length, 6);
  assert.equal(viewports.length, 4);
  assert.equal(standalone.length, 6);
  for (const group of Object.values(integrity)) {
    assert.ok(group.collected > 0, '不得以零检查冒充通过');
    assert.equal(group.collected, group.expected);
    assert.deepEqual(group.missing, []);
    assert.deepEqual(group.duplicates, []);
    assert.deepEqual(group.unexpected, []);
  }
  assert.equal(counts.previews, previews.length, '通过数必须由实际预览记录计算');
  assert.equal(counts.viewports, viewports.filter((record) => record.passed).length);
  assert.equal(counts.standalone, standalone.filter((record) => record.passed).length);
  assert.equal(counts.retainedStates, previews.flatMap((preview) => preview.retention).filter((record) => record.passed).length);
  for (const preview of previews) {
    assert.notDeepEqual(preview.interaction.before, preview.interaction.after, preview.id + ' 必须先进行真实交互');
    for (const retained of preview.retention) {
      assert.equal(retained.passed, true);
      assert.deepEqual(retained.state, preview.interaction.after);
      assert.equal(retained.sameRoot, true);
    }
  }
  for (const record of standalone) {
    assert.equal(record.initialized, true);
    assert.notDeepEqual(record.interaction.before, record.interaction.after);
    const html = await readFile(record.codeFile, 'utf8');
    assert.match(html, /^\s*<!doctype html>/i);
    assert.equal(Buffer.byteLength(html), record.documentBytes);
    assert.ok(record.resources.some((resource) => resource.type === 'stylesheet' && resource.status === 200));
    assert.ok(record.resources.some((resource) => resource.type === 'script' && resource.url.includes('/src/components/index.js') && resource.status === 200));
  }
});

try {
  assert.ok(selected === 'all' || ['matrix', 'export', 'state'].includes(selected) || tests.has(selected), '未知 --case：' + selected);
  evidence.expectedCases = [...tests.keys()].filter((name) => selected === 'all' || selected === name ||
    (['matrix', 'export', 'state'].includes(selected) && name.startsWith(selected + '-')));
  for (const [name, test] of tests) {
    if (selected !== 'all' && !(['matrix', 'export', 'state'].includes(selected) && name.startsWith(selected + '-')) && selected !== name) continue;
    const before = evidence.cases.length;
    try {
      await test();
      evidence.cases.at(-1).guardPassed = true;
      console.log('✓ guard ' + name);
    } catch (error) {
      if (evidence.cases.length === before) evidence.cases.push({ name, fixture: true });
      evidence.cases.at(-1).guardPassed = false;
      evidence.cases.at(-1).failure = error.message;
      console.error('✕ guard ' + name + ': ' + error.message);
      process.exitCode = 1;
    }
  }
  assert.equal(evidence.cases.length, evidence.expectedCases.length, '全部所选永久 guard 必须实际执行');
  assert.equal(new Set(evidence.cases.map((record) => record.name)).size, evidence.expectedCases.length, '永久 guard 不能重复冒充覆盖');
  evidence.passed = evidence.cases.length > 0 && evidence.cases.every((record) => record.guardPassed);
} catch (error) {
  evidence.failure = error.message;
  process.exitCode = 1;
} finally {
  evidence.counts = { executed: evidence.cases.length, passed: evidence.cases.filter((record) => record.guardPassed).length,
    failed: evidence.cases.filter((record) => !record.guardPassed).length };
  await writeFile(join(output, 'report.json'), JSON.stringify(evidence, null, 2));
  console.log('验证 guard 报告：' + join(output, 'report.json'));
}
