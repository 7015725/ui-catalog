/* =========================================================
   极简测试 harness（零依赖）
   describe / it / expect，异步用例串行执行，每条用例独立沙箱
   ========================================================= */

const queue = [];
let currentSuite = '';

export function describe(name, fn) {
  currentSuite = name;
  fn();
  currentSuite = '';
}

export function it(name, fn) {
  queue.push({ suite: currentSuite || '通用', name: name, fn: fn });
}

export const tick = (ms) => new Promise(function (r) { setTimeout(r, ms || 0); });

/** 写入沙箱并等待组件完成首帧渲染（基类用 queueMicrotask 启动） */
export async function put(host, html) {
  host.innerHTML = html;
  await tick(0);
  return host;
}

export class AssertionError extends Error {}

function fail(msg) {
  throw new AssertionError(msg);
}

export function expect(actual) {
  return {
    toBe(v) {
      if (actual !== v) fail('期望 ' + JSON.stringify(v) + '，实际 ' + JSON.stringify(actual));
    },
    toEqual(v) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(v);
      if (a !== b) fail('期望 ' + b + '，实际 ' + a);
    },
    toBeTruthy() {
      if (!actual) fail('期望为真，实际 ' + actual);
    },
    toBeFalsy() {
      if (actual) fail('期望为假，实际 ' + actual);
    },
    toContain(v) {
      if (String(actual).indexOf(v) < 0) fail('期望包含 ' + v + '，实际 ' + actual);
    },
    toBeGreaterThan(v) {
      if (!(actual > v)) fail('期望 > ' + v + '，实际 ' + actual);
    }
  };
}

export function count() {
  return queue.length;
}

/** 串行执行；每条用例一个独立沙箱，结束后整体移除（触发 detached 清理） */
export async function run(onResult) {
  for (let i = 0; i < queue.length; i++) {
    const c = queue[i];
    const host = document.createElement('div');
    host.className = 'test-host';
    document.body.appendChild(host);
    const started = Date.now();
    try {
      await c.fn(host);
      onResult({ ok: true, suite: c.suite, name: c.name, ms: Date.now() - started });
    } catch (e) {
      onResult({
        ok: false,
        suite: c.suite,
        name: c.name,
        ms: Date.now() - started,
        error: (e && e.message) || String(e)
      });
    } finally {
      host.remove();
      /* 兜底：清掉可能挂到 body 上的浮层 */
      document.querySelectorAll('.test-host').forEach(function (n) { n.remove(); });
    }
  }
}