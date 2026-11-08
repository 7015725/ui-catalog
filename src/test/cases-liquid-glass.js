/* 液态玻璃 Web 模板：逐个行为 RED → GREEN 的原生浏览器回归。 */
import { describe, it, expect, put, tick } from './harness.js';
import { templates, TPL_BASE_CSS } from '../data/templates.js';

async function mount(host, width = 1440, copies = 1) {
  const template = templates.find((t) => t.id === 'liquid-glass-dashboard');
  await put(host, `<style>${TPL_BASE_CSS}\n${template.css}</style><div class="lg-fixture" style="width:${width}px;height:1000px;container:tpl / inline-size">${template.html.repeat(copies)}</div>`);
  const roots = [...host.querySelectorAll('.t-liquid-glass-dashboard')];
  roots.forEach((root) => template.init(root));
  await tick(0);
  return { template, root: roots[0], roots };
}


async function mountInViewport(host, width = 1440) {
  // 完整回归的结果列表会把沙箱挤出视口；只移动测试夹具，不绕过产品可见性。
  host.style.cssText = 'position:fixed;inset:0;z-index:10000';
  const mounted = await mount(host, Math.min(width, innerWidth));
  host.querySelector('.lg-fixture').style.height = '100vh';
  await tick(50);
  return mounted;
}

async function withReduced(fn) {
  const html = document.documentElement;
  const previous = html.getAttribute('data-motion');
  html.setAttribute('data-motion', 'reduce');
  try { await fn(); } finally {
    if (previous === null) html.removeAttribute('data-motion');
    else html.setAttribute('data-motion', previous);
  }
}

const kd = (node, key, extra = {}) => node.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra }));
const selectPeriod = (root, key) => {
  root.querySelector('[data-time] button').click();
  root.querySelector(`.lg-filter-option[data-period="${key}"] button`).click();
};
const chartValues = (root) => [...root.querySelectorAll('[data-chart]')].flatMap((chart) => {
  if (chart.localName === 'ui-progress') return [Number(chart.getAttribute('value'))];
  if (chart.localName === 'ui-sparkline') return chart.getAttribute('data').split(',').map(Number);
  return JSON.parse(chart.getAttribute('data')).map((item) => item.value);
});
async function until(check) {
  const deadline = performance.now() + 6000;
  while (!check() && performance.now() < deadline) await tick(16);
  expect(check()).toBe(true);
}
async function holdDetailOpening(root) {
  root.style.setProperty('--ui-motion', '250ms');
  expect(document.visibilityState).toBe('visible');
  root.querySelector('[data-open="revenue"] button').click();
  await tick(0);
  const opening = root.querySelector('.lg-detail').getAnimations()[0];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    expect(!!opening).toBe(false);
    return null;
  }
  expect(!!opening).toBe(true);
  await opening.ready;
  await until(() => opening.currentTime > 0);
  const ms = opening.effect.getTiming().duration;
  expect(ms).toBeGreaterThan(0);
  opening.playbackRate = .01;
  opening.currentTime = ms * .1;
  expect(opening.playState).toBe('running');
  expect(opening.currentTime > 0 && opening.currentTime < ms / 2).toBe(true);
  return opening;
}
function interpolated(samples, from, to) {
  const axis = from.findIndex((value, index) => value !== to[index]);
  expect(axis >= 0 && samples.length >= 3).toBe(true);
  let previous = -1;
  samples.forEach((frame) => {
    const progress = (frame[axis] - from[axis]) / (to[axis] - from[axis]);
    expect(progress > 0 && progress < 1 && progress > previous).toBe(true);
    frame.forEach((value, index) => {
      const expected = from[index] + (to[index] - from[index]) * progress;
      expect(Math.abs(value - expected) < 1e-6 * Math.max(1, Math.abs(to[index]))).toBe(true);
    });
    previous = progress;
  });
}

export const LIQUID_GLASS_IDS = ['liquid-glass-dashboard'];

describe('液态玻璃后台', () => {
  it('Web 页面库存包含原生液态玻璃后台', () => {
    const ids = templates.filter((t) => t.cat === 'Web 页面' && t.frame === 'browser').map((t) => t.id);
    expect(ids.includes(LIQUID_GLASS_IDS[0])).toBe(true);
  });

  it('经营概览渲染六个本地数据模块并复用库组件', async (host) => {
    const { template, root } = await mount(host);
    expect([...root.querySelectorAll('.lg-module')].map((card) => card.dataset.module)).toEqual(['revenue', 'audience', 'goal', 'ranking', 'sources', 'orders']);
    expect(root.querySelector('ui-odometer[data-metric="revenue"]').getAttribute('value')).toBe('128430');
    const used = [...new Set([...root.querySelectorAll('*')].map((el) => el.localName).filter((tag) => tag.startsWith('ui-')))];
    expect([...template.uses].sort()).toEqual(used.sort());
    expect(root.querySelector('iframe')).toBe(null);
    expect(root.querySelectorAll('nav[aria-label]').length).toBe(2);
  });

  it('悬浮岛导航切换页面并同步 Dock 当前项和跟随胶囊', async (host) => {
    const { root } = await mount(host);
    root.querySelector('.lg-side [data-page="revenue"] button').click();
    expect(root.querySelector('[data-title]').textContent).toBe('收入分析');
    expect([...root.querySelectorAll('nav [aria-current="page"]')].map((button) => button.closest('[data-page]').dataset.page)).toEqual(['revenue', 'revenue']);
    const capsule = root.querySelector('.lg-side-nav .lg-capsule');
    expect(parseFloat(capsule.dataset.y) > 0).toBe(true);
    expect(root.querySelector('[data-status]').textContent).toContain('收入分析');
  });

  it('Dock 悬停放大当前图标和相邻图标，移出恢复', async (host) => {
    const { root } = await mountInViewport(host);
    const dock = root.querySelector('.lg-dock');
    const buttons = [...dock.querySelectorAll('ui-button button')];
    const widths = () => buttons.map((button) => button.querySelector('.lg-icon').getBoundingClientRect().width);
    const baseline = widths();
    const enter = () => buttons[2].dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
    const leave = () => dock.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse', relatedTarget: host }));
    const magnified = () => {
      const current = widths();
      expect(current[2]).toBeGreaterThan(baseline[2] * 1.25);
      for (const index of [1, 3]) {
        expect(current[index]).toBeGreaterThan(baseline[index] * 1.05);
        expect(current[index] < current[2]).toBe(true);
      }
      for (const index of [0, 4, 5]) expect(Math.abs(current[index] - baseline[index]) < .25).toBe(true);
    };
    const restored = () => widths().forEach((width, index) => expect(Math.abs(width - baseline[index]) < .25).toBe(true));
    try {
      enter();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) magnified();
      await tick(400);
      magnified();
      leave();
      await tick(400);
      restored();
      await withReduced(async () => {
        enter();
        magnified();
        leave();
        restored();
      });
    } finally { root._liquidGlassMount(); }
  });

  it('展开收入卡原位显示详情，其他五模块收为可切换缩略条', async (host) => {
    const { root } = await mount(host);
    const stage = root.querySelector('.lg-stage');
    root.querySelector('[data-open="revenue"] button').click();
    await tick(0);
    const detail = root.querySelector('.lg-detail-layer');
    expect(!!detail && !detail.hidden).toBe(true);
    expect(detail.querySelector('[data-detail-title]').textContent).toBe('收入趋势');
    expect(detail.querySelector('[data-detail-body]').textContent).toContain('收入质量');
    expect(detail.querySelectorAll('[data-thumb]:not([hidden])').length).toBe(5);
    expect(root.querySelector('.lg-grid').getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('.lg-grid').hasAttribute('inert')).toBe(true);
    expect(detail.parentElement).toBe(stage);
    expect(detail.querySelector('.lg-detail').offsetWidth > stage.querySelector('.lg-revenue').offsetWidth).toBe(true);
  });

  it('同一 DOM 展开后 dispose/re-init 还原概览并可再次打开关闭详情', async (host) => {
    await withReduced(async () => {
      const { template, root } = await mountInViewport(host);
      const layer = root.querySelector('.lg-detail-layer');
      const grid = root.querySelector('.lg-grid');
      const stage = root.querySelector('.lg-stage');
      const body = root.querySelector('[data-detail-body]');
      const source = root.querySelector('[data-open="revenue"] button');
      let dispose = template.init(root);
      try {
        source.click();
        await tick(0);
        expect(layer.hidden).toBe(false);
        expect(body.childElementCount).toBeGreaterThan(0);
        expect(stage.style.height !== '').toBe(true);
        dispose();
        const previous = dispose;
        dispose = template.init(root);
        expect(typeof dispose).toBe('function');
        expect(dispose === previous).toBe(false);
        await tick(0);
        expect(root.querySelector('[data-open="revenue"] button')).toBe(source);
        source.focus({ preventScroll: true });
        const rect = source.getBoundingClientRect();
        expect({
          hidden: layer.hidden,
          bodyChildren: body.childElementCount,
          inert: grid.hasAttribute('inert'),
          ariaHidden: grid.getAttribute('aria-hidden'),
          minimized: grid.classList.contains('lg-minimized'),
          stageHeight: stage.style.height,
          detail: root.getAttribute('data-detail'),
          visibleCards: [...grid.querySelectorAll('.lg-module')].every((card) => card.style.visibility !== 'hidden'),
          focused: document.activeElement === source,
          hittable: document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)?.closest('button') === source
        }).toEqual({ hidden: true, bodyChildren: 0, inert: false, ariaHidden: null, minimized: false, stageHeight: '', detail: null, visibleCards: true, focused: true, hittable: true });
        source.click();
        await tick(0);
        expect(layer.hidden).toBe(false);
        expect(root.dataset.detail).toBe('revenue');
        root.querySelector('[data-detail-close] button').click();
        await tick(0);
        expect(layer.hidden).toBe(true);
        expect(grid.hasAttribute('inert')).toBe(false);
        expect(document.activeElement).toBe(source);
      } finally { dispose(); }
    });
  });

  it('首次展开前半程切换缩略项会取消旧 FLIP，切换结束后几何不回退', async (host) => {
    const { root } = await mountInViewport(host);
    root.style.setProperty('--ui-motion', '200ms');
    const detail = root.querySelector('.lg-detail');
    try {
      root.querySelector('[data-open="revenue"] button').click();
      await tick(0);
      const initial = detail.getAnimations();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(initial.length).toBe(0);
        root.querySelector('[data-thumb="audience"] button').click();
        await tick(0);
        expect(detail.getAnimations().length).toBe(0);
        expect(root.dataset.detail).toBe('audience');
        return;
      }
      expect(initial.length).toBe(1);
      const opening = initial[0];
      await opening.ready;
      const openingDuration = opening.effect.getTiming().duration;
      expect(openingDuration).toBeGreaterThan(0);
      opening.currentTime = openingDuration * .1;
      expect(opening.playState).toBe('running');
      expect(opening.currentTime < openingDuration / 2).toBe(true);
      root.querySelector('[data-thumb="audience"] button').click();
      await Promise.resolve();
      const switched = detail.getAnimations();
      const switching = switched.find((animation) => animation !== opening);
      expect(!!switching).toBe(true);
      const during = { animations: switched.length, openingState: opening.playState };
      await switching.finished;
      const rect = detail.getBoundingClientRect();
      const style = getComputedStyle(detail);
      expect({
        during,
        remaining: detail.getAnimations().length,
        openingState: opening.playState,
        transform: style.transform,
        opacity: style.opacity,
        fullWidth: Math.abs(rect.width - detail.offsetWidth) < 1,
        fullHeight: Math.abs(rect.height - detail.offsetHeight) < 1
      }).toEqual({ during: { animations: 1, openingState: 'idle' }, remaining: 0, openingState: 'idle', transform: 'none', opacity: '1', fullWidth: true, fullHeight: true });
      await tick(80);
      const settled = detail.getBoundingClientRect();
      expect(['left', 'top', 'width', 'height'].every((axis) => Math.abs(settled[axis] - rect[axis]) < .25)).toBe(true);
      expect(root.dataset.detail).toBe('audience');
    } finally { root._liquidGlassMount(); }
  });

  it('被动页面减效结束已启动的真实 FLIP 并直接显示终态', async (host) => {
    const { root } = await mountInViewport(host);
    root.style.setProperty('--ui-motion', '250ms');
    const detail = root.querySelector('.lg-detail');
    try {
      expect(document.visibilityState).toBe('visible');
      root.querySelector('[data-open="revenue"] button').click();
      await tick(0);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(detail.getAnimations().length).toBe(0);
        expect(getComputedStyle(detail).transform).toBe('none');
        expect(getComputedStyle(detail).opacity).toBe('1');
        return;
      }
      const opening = detail.getAnimations()[0];
      expect(!!opening).toBe(true);
      await opening.ready;
      await until(() => opening.currentTime > 0);
      const ms = opening.effect.getTiming().duration;
      expect(ms).toBeGreaterThan(0);
      opening.playbackRate = .01;
      opening.currentTime = ms * .1;
      expect(opening.playState).toBe('running');
      expect(opening.currentTime > 0 && opening.currentTime < ms / 2).toBe(true);
      expect(getComputedStyle(detail).transform !== 'none').toBe(true);
      expect(Number(getComputedStyle(detail).opacity) < 1).toBe(true);
      const before = { period: root.dataset.period, detail: root.dataset.detail };
      await withReduced(async () => {
        // 只改变页面偏好，不重选周期或重开模块；在真实渲染帧检查 loop 的收尾。
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        const style = getComputedStyle(detail);
        expect({
          period: root.dataset.period, detail: root.dataset.detail,
          animations: detail.getAnimations().length,
          transform: style.transform, opacity: style.opacity
        }).toEqual({ ...before, animations: 0, transform: 'none', opacity: '1' });
      });
    } finally { root._liquidGlassMount(); }
  });

  it('展开动画中打开时间胶囊并移动选项，完成后保留选择焦点', async (host) => {
    const { root } = await mountInViewport(host);
    root.style.setProperty('--ui-motion', '200ms');
    try {
      root.querySelector('[data-open="revenue"] button').click();
      await tick(0);
      const opening = root.querySelector('.lg-detail').getAnimations()[0];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(!!opening).toBe(true);
        await opening.ready;
        // 真实 WAAPI 降速等待列表 CSS 入场，避免机器负载让展开先结束。
        opening.playbackRate = .1;
        opening.currentTime = opening.effect.getTiming().duration * .1;
        expect(opening.playState).toBe('running');
      }
      const time = root.querySelector('[data-time] button');
      time.click();
      const week = root.querySelector('.lg-filter-option[data-period="week"] button');
      // 可见后验证产品自动入焦，不手工 focus 选项来掩盖缺失。
      await until(() => getComputedStyle(week).visibility === 'visible');
      expect(document.activeElement).toBe(week);
      if (opening) expect(opening.playState).toBe('running');
      kd(document.activeElement, 'ArrowRight');
      expect(document.activeElement).toBe(root.querySelector('.lg-filter-option[data-period="month"] button'));
      if (opening) { opening.playbackRate = 1; await opening.finished; }
      await tick(0);
      expect({
        period: document.activeElement.closest('.lg-filter-option')?.dataset.period ?? null,
        closeFocused: document.activeElement === root.querySelector('[data-detail-close] button'),
        expanded: time.getAttribute('aria-expanded')
      }).toEqual({ period: 'month', closeFocused: false, expanded: 'true' });
      kd(document.activeElement, 'ArrowRight');
      expect(document.activeElement).toBe(root.querySelector('.lg-filter-option[data-period="quarter"] button'));
      kd(document.activeElement, 'Enter');
      expect(root.dataset.period).toBe('quarter');
      expect(time.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(time);
    } finally { root._liquidGlassMount(); }
  });

  it('FLIP 收尾不抢走已完成时间选择的触发器焦点', async (host) => {
    const { root } = await mountInViewport(host);
    try {
      const opening = await holdDetailOpening(root);
      const time = root.querySelector('[data-time] button');
      time.click();
      const week = root.querySelector('.lg-filter-option[data-period="week"] button');
      await until(() => getComputedStyle(week).visibility === 'visible');
      expect(document.activeElement).toBe(week);
      kd(document.activeElement, 'ArrowRight');
      expect(document.activeElement).toBe(root.querySelector('.lg-filter-option[data-period="month"] button'));
      kd(document.activeElement, 'Enter');
      expect(root.dataset.period).toBe('month');
      expect(time.getAttribute('aria-expanded')).toBe('false');
      // 由产品完成选择并归还触发器，再等待真实 finished；不手工补焦。
      expect(document.activeElement).toBe(time);
      if (opening) {
        expect(opening.playState).toBe('running');
        expect(opening.currentTime < opening.effect.getTiming().duration / 2).toBe(true);
        opening.playbackRate = 1;
        await opening.finished;
      }
      await tick(0);
      expect({
        timeFocused: document.activeElement === time,
        closeFocused: document.activeElement === root.querySelector('[data-detail-close] button'),
        expanded: time.getAttribute('aria-expanded'), period: root.dataset.period
      }).toEqual({ timeFocused: true, closeFocused: false, expanded: 'false', period: 'month' });
      time.click();
      const month = root.querySelector('.lg-filter-option[data-period="month"] button');
      await until(() => getComputedStyle(month).visibility === 'visible');
      expect(document.activeElement).toBe(month);
      kd(document.activeElement, 'ArrowRight');
      expect(document.activeElement).toBe(root.querySelector('.lg-filter-option[data-period="quarter"] button'));
      kd(document.activeElement, 'Enter');
      expect(root.dataset.period).toBe('quarter');
      expect(document.activeElement).toBe(time);
    } finally { root._liquidGlassMount(); }
  });

  it('FLIP 收尾不抢走命令面板已获取的 INPUT 焦点', async (host) => {
    const { root } = await mountInViewport(host);
    const command = root.querySelector('ui-command');
    try {
      const opening = await holdDetailOpening(root);
      root.querySelector('[data-command] button').click();
      const input = command._mask.querySelector('input');
      expect(input.tagName).toBe('INPUT');
      expect(document.activeElement).toBe(input);
      expect(command._mask.hidden).toBe(false);
      if (opening) {
        expect(opening.playState).toBe('running');
        expect(opening.currentTime < opening.effect.getTiming().duration / 2).toBe(true);
        opening.playbackRate = 1;
        await opening.finished;
      }
      await tick(0);
      expect({
        inputFocused: document.activeElement === input, activeTag: document.activeElement.tagName,
        closeFocused: document.activeElement === root.querySelector('[data-detail-close] button')
      }).toEqual({ inputFocused: true, activeTag: 'INPUT', closeFocused: false });
      const before = input.getAttribute('aria-activedescendant');
      kd(document.activeElement, 'ArrowDown');
      expect(input.getAttribute('aria-activedescendant') !== before).toBe(true);
      expect(document.activeElement).toBe(input);
      kd(document.activeElement, 'Escape');
      expect(command._mask.hidden).toBe(true);
    } finally { command.close(); root._liquidGlassMount(); }
  });

  it('关闭动画中时间胶囊已移动的选项焦点不被源卡抢走', async (host) => {
    const { root } = await mountInViewport(host);
    root.style.setProperty('--ui-motion', '180ms');
    const detail = root.querySelector('.lg-detail');
    try {
      expect(document.visibilityState).toBe('visible');
      root.querySelector('[data-open="revenue"] button').click();
      await tick(0);
      const opening = detail.getAnimations()[0];
      if (opening) await opening.finished;
      await tick(0);
      expect(document.activeElement).toBe(root.querySelector('[data-detail-close] button'));
      kd(document.activeElement, 'Escape');
      await tick(0);
      const closing = detail.getAnimations()[0];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(!!closing).toBe(true);
        await closing.ready;
        await until(() => closing.currentTime > 0);
        const ms = closing.effect.getTiming().duration;
        expect(ms).toBeGreaterThan(0);
        closing.playbackRate = .01;
        closing.currentTime = ms * .1;
        expect(closing.playState).toBe('running');
      }
      const time = root.querySelector('[data-time] button');
      time.focus({ preventScroll: true });
      time.click();
      const week = root.querySelector('.lg-filter-option[data-period="week"] button');
      await until(() => getComputedStyle(week).visibility === 'visible');
      expect(document.activeElement).toBe(week);
      kd(document.activeElement, 'ArrowDown');
      expect(document.activeElement).toBe(root.querySelector('.lg-filter-option[data-period="month"] button'));
      if (closing) {
        expect(closing.currentTime > 0 && closing.currentTime < closing.effect.getTiming().duration / 2).toBe(true);
        closing.playbackRate = 1;
        await closing.finished;
      }
      await tick(0);
      expect({
        period: document.activeElement.closest('.lg-filter-option')?.dataset.period ?? null,
        source: document.activeElement.closest('[data-open]')?.dataset.open ?? null,
        filter: time.getAttribute('aria-expanded'), hidden: root.querySelector('.lg-detail-layer').hidden
      }).toEqual({ period: 'month', source: null, filter: 'true', hidden: true });
      kd(document.activeElement, 'ArrowDown');
      expect(document.activeElement).toBe(root.querySelector('.lg-filter-option[data-period="quarter"] button'));
      kd(document.activeElement, 'Enter');
      expect(root.dataset.period).toBe('quarter');
      expect(document.activeElement).toBe(time);
    } finally { root._liquidGlassMount(); }
  });

  it('关闭动画收尾不抢走期间打开的命令输入焦点', async (host) => {
    const { root } = await mountInViewport(host);
    root.style.setProperty('--ui-motion', '180ms');
    const detail = root.querySelector('.lg-detail');
    const command = root.querySelector('ui-command');
    try {
      expect(document.visibilityState).toBe('visible');
      root.querySelector('[data-open="revenue"] button').click();
      await tick(0);
      const opening = detail.getAnimations()[0];
      if (opening) await opening.finished;
      await tick(0);
      expect(document.activeElement).toBe(root.querySelector('[data-detail-close] button'));
      kd(document.activeElement, 'Escape');
      await tick(0);
      const closing = detail.getAnimations()[0];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(!!closing).toBe(true);
        await closing.ready;
        await until(() => closing.currentTime > 0);
        const ms = closing.effect.getTiming().duration;
        expect(ms).toBeGreaterThan(0);
        closing.playbackRate = .01;
        closing.currentTime = ms * .1;
        expect(closing.playState).toBe('running');
      }
      root.querySelector('[data-command] button').click();
      const input = command._mask.querySelector('input');
      expect(document.activeElement).toBe(input);
      expect(command._mask.hidden).toBe(false);
      if (closing) {
        expect(closing.currentTime > 0 && closing.currentTime < closing.effect.getTiming().duration / 2).toBe(true);
        closing.playbackRate = 1;
        await closing.finished;
      }
      await tick(0);
      expect({
        inputFocused: document.activeElement === input, activeTag: document.activeElement.tagName,
        source: document.activeElement.closest('[data-open]')?.dataset.open ?? null,
        hidden: root.querySelector('.lg-detail-layer').hidden, commandOpen: !command._mask.hidden
      }).toEqual({ inputFocused: true, activeTag: 'INPUT', source: null, hidden: true, commandOpen: true });
      const before = input.getAttribute('aria-activedescendant');
      kd(document.activeElement, 'ArrowDown');
      expect(input.getAttribute('aria-activedescendant') !== before).toBe(true);
      expect(document.activeElement).toBe(input);
      kd(document.activeElement, 'Escape');
      expect(command._mask.hidden).toBe(true);
    } finally { command.close(); root._liquidGlassMount(); }
  });

  it('展开 FLIP 收尾不抢走期间点击侧栏开关后的焦点', async (host) => {
    const { root } = await mountInViewport(host);
    try {
      const opening = await holdDetailOpening(root);
      const collapse = root.querySelector('[data-collapse] button');
      // 真实指针按下路径；子组件 stopPropagation 时 document 捕获阶段仍必须收到。
      collapse.addEventListener('pointerdown', (event) => event.stopPropagation(), { once: true });
      collapse.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' }));
      collapse.focus({ preventScroll: true });
      collapse.click();
      expect(root.classList.contains('lg-sidebar-collapsed')).toBe(true);
      expect(document.activeElement).toBe(collapse);
      if (opening) {
        expect(opening.playState).toBe('running');
        expect(opening.currentTime < opening.effect.getTiming().duration / 2).toBe(true);
        opening.playbackRate = 1;
        await opening.finished;
      }
      await tick(0);
      expect({
        collapseFocused: document.activeElement === collapse,
        closeFocused: document.activeElement === root.querySelector('[data-detail-close] button'),
        collapsed: root.classList.contains('lg-sidebar-collapsed'),
        hidden: root.querySelector('.lg-detail-layer').hidden
      }).toEqual({ collapseFocused: true, closeFocused: false, collapsed: true, hidden: false });
    } finally { root._liquidGlassMount(); }
  });

  it('关闭动画中详情外 pointerdown 即使被目标停止冒泡也阻止旧回焦', async (host) => {
    const { root } = await mountInViewport(host);
    root.style.setProperty('--ui-motion', '180ms');
    const detail = root.querySelector('.lg-detail');
    const close = root.querySelector('[data-detail-close] button');
    const source = root.querySelector('[data-open="revenue"] button');
    const time = root.querySelector('[data-time] button');
    // reduce 下没有关闭动画窗口，无法构造该竞态；正常动效下必须真实执行。
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      root.querySelector('[data-open="revenue"] button').click();
      await tick(0);
      const opening = detail.getAnimations()[0];
      if (opening) await opening.finished;
      await tick(0);
      expect(document.activeElement).toBe(close);
      kd(close, 'Escape');
      await tick(0);
      const closing = detail.getAnimations()[0];
      expect(!!closing).toBe(true);
      await closing.ready;
      await until(() => closing.currentTime > 0);
      const ms = closing.effect.getTiming().duration;
      expect(ms).toBeGreaterThan(0);
      closing.playbackRate = .01;
      closing.currentTime = ms * .1;
      expect(closing.playState).toBe('running');
      // 焦点先离开详情，再在时间触发器上按下并阻止冒泡：
      // 只有 document 捕获阶段能收到这个 pointerdown，因此能区分 capture 是否生效。
      close.blur();
      expect(document.activeElement).toBe(document.body);
      time.addEventListener('pointerdown', (event) => event.stopPropagation(), { once: true });
      time.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' }));
      expect(document.activeElement).toBe(document.body);
      closing.playbackRate = 1;
      await closing.finished;
      await tick(0);
      expect({
        sourceFocused: document.activeElement === source,
        body: document.activeElement === document.body,
        hidden: root.querySelector('.lg-detail-layer').hidden
      }).toEqual({ sourceFocused: false, body: true, hidden: true });
    } finally { root._liquidGlassMount(); }
  });

  it('时间胶囊打开时关闭详情并双击关闭按钮，焦点归还源卡而非 body', async (host) => {
    const { root } = await mountInViewport(host);
    root.style.setProperty('--ui-motion', '180ms');
    const detail = root.querySelector('.lg-detail');
    const close = root.querySelector('[data-detail-close] button');
    const source = root.querySelector('[data-open="revenue"] button');
    const time = root.querySelector('[data-time] button');
    try {
      root.querySelector('[data-open="revenue"] button').click();
      await tick(0);
      const opening = detail.getAnimations()[0];
      if (opening) await opening.finished;
      await tick(0);
      expect(document.activeElement).toBe(close);
      // 打开时间胶囊，焦点进入选项；这是用户已经生效的新意图。
      time.click();
      const week = root.querySelector('.lg-filter-option[data-period="week"] button');
      await until(() => getComputedStyle(week).visibility === 'visible');
      expect(document.activeElement).toBe(week);
      // 真实点击关闭按钮：pointerdown → focus → click。
      close.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' }));
      close.focus({ preventScroll: true });
      close.click();
      await tick(0);
      const closing = detail.getAnimations()[0];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(!!closing).toBe(true);
        await closing.ready;
        await until(() => closing.currentTime > 0);
        const ms = closing.effect.getTiming().duration;
        expect(ms).toBeGreaterThan(0);
        closing.playbackRate = .01;
        closing.currentTime = ms * .1;
        expect(closing.playState).toBe('running');
      }
      // 双击：第二次 pointerdown 仍落在即将隐藏的关闭按钮上。
      close.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' }));
      close.click();
      if (closing) {
        expect(closing.currentTime > 0 && closing.currentTime < closing.effect.getTiming().duration / 2).toBe(true);
        closing.playbackRate = 1;
        await closing.finished;
      }
      await tick(0);
      expect({
        sourceFocused: document.activeElement === source,
        closeFocused: document.activeElement === close,
        body: document.activeElement === document.body,
        hidden: root.querySelector('.lg-detail-layer').hidden,
        filterOpen: time.getAttribute('aria-expanded')
      }).toEqual({ sourceFocused: true, closeFocused: false, body: false, hidden: true, filterOpen: 'true' });
    } finally { root._liquidGlassMount(); }
  });

  it('关闭动画收尾不抢走期间仅移到时间触发器的焦点', async (host) => {
    const { root } = await mountInViewport(host);
    root.style.setProperty('--ui-motion', '180ms');
    const detail = root.querySelector('.lg-detail');
    try {
      expect(document.visibilityState).toBe('visible');
      root.querySelector('[data-open="revenue"] button').click();
      await tick(0);
      const opening = detail.getAnimations()[0];
      if (opening) await opening.finished;
      await tick(0);
      expect(document.activeElement).toBe(root.querySelector('[data-detail-close] button'));
      kd(document.activeElement, 'Escape');
      await tick(0);
      const closing = detail.getAnimations()[0];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(!!closing).toBe(true);
        await closing.ready;
        await until(() => closing.currentTime > 0);
        const ms = closing.effect.getTiming().duration;
        expect(ms).toBeGreaterThan(0);
        closing.playbackRate = .01;
        closing.currentTime = ms * .1;
        expect(closing.playState).toBe('running');
      }
      const time = root.querySelector('[data-time] button');
      time.focus({ preventScroll: true });
      expect(document.activeElement).toBe(time);
      // 只移动焦点，不展开列表；这同样是用户已经生效的新意图。
      expect(time.getAttribute('aria-expanded')).toBe('false');
      if (closing) {
        expect(closing.currentTime > 0 && closing.currentTime < closing.effect.getTiming().duration / 2).toBe(true);
        closing.playbackRate = 1;
        await closing.finished;
      }
      await tick(0);
      expect({
        timeFocused: document.activeElement === time,
        source: document.activeElement.closest('[data-open]')?.dataset.open ?? null,
        expanded: time.getAttribute('aria-expanded'),
        hidden: root.querySelector('.lg-detail-layer').hidden
      }).toEqual({ timeFocused: true, source: null, expanded: 'false', hidden: true });
    } finally { root._liquidGlassMount(); }
  });

  it('320px 下方模块滚动后展开详情进入视口，关闭归还原滚动', async (host) => {
    const { root } = await mountInViewport(host, 320);
    root.style.setProperty('--ui-motion', '100ms');
    const scroll = root.querySelector('.lg-scroll');
    const source = root.querySelector('[data-open="orders"] button');
    const detail = root.querySelector('.lg-detail');
    const close = root.querySelector('[data-detail-close] button');
    try {
      scroll.scrollTop = scroll.scrollHeight;
      await tick(0);
      const originalScroll = scroll.scrollTop;
      const viewport = scroll.getBoundingClientRect();
      const sourceBefore = source.getBoundingClientRect();
      expect(originalScroll).toBeGreaterThan(0);
      expect(sourceBefore.width > 0 && sourceBefore.height > 0 && sourceBefore.top >= viewport.top && sourceBefore.bottom <= viewport.bottom).toBe(true);
      source.click();
      await tick(0);
      const opening = detail.getAnimations()[0];
      if (opening) await opening.finished;
      await tick(0);
      const visible = scroll.getBoundingClientRect();
      const headRect = root.querySelector('.lg-detail-head').getBoundingClientRect();
      const closeRect = close.getBoundingClientRect();
      const inside = (rect) => rect.width > 0 && rect.height > 0 && rect.left >= visible.left - 1 && rect.right <= visible.right + 1 && rect.top >= visible.top - 1 && rect.bottom <= visible.bottom + 1;
      if (!inside(headRect) || !inside(closeRect)) throw new Error('详情未进入外层可视区：' + JSON.stringify({
        originalScroll, currentScroll: scroll.scrollTop,
        source: { top: sourceBefore.top, bottom: sourceBefore.bottom },
        viewport: { top: visible.top, bottom: visible.bottom },
        head: { top: headRect.top, bottom: headRect.bottom },
        close: { top: closeRect.top, bottom: closeRect.bottom }
      }));
      close.click();
      await tick(0);
      const closing = detail.getAnimations()[0];
      if (closing) await closing.finished;
      await tick(0);
      expect(root.querySelector('.lg-detail-layer').hidden).toBe(true);
      expect(scroll.scrollTop).toBe(originalScroll);
      const returnedSource = root.querySelector('[data-open="orders"] button');
      const returned = returnedSource.getBoundingClientRect();
      expect(inside(returned)).toBe(true);
    } finally { root._liquidGlassMount(); }
  });

  it('360px 底部模块关闭中 Dock 重开后归还首次概览滚动快照', async (host) => {
    const { root } = await mountInViewport(host, 360);
    root.style.setProperty('--ui-motion', '180ms');
    const scroll = root.querySelector('.lg-scroll');
    const detail = root.querySelector('.lg-detail');
    const layer = root.querySelector('.lg-detail-layer');
    const source = root.querySelector('[data-open="orders"] button');
    try {
      expect(document.visibilityState).toBe('visible');
      scroll.scrollTop = scroll.scrollHeight;
      await tick(0);
      const originalScroll = scroll.scrollTop;
      const viewport = scroll.getBoundingClientRect();
      const rect = source.getBoundingClientRect();
      expect(originalScroll).toBeGreaterThan(0);
      expect(rect.width > 0 && rect.height > 0 && rect.top >= viewport.top && rect.bottom <= viewport.bottom).toBe(true);
      source.click();
      await tick(0);
      const opening = detail.getAnimations()[0];
      if (opening) await opening.finished;
      await tick(0);
      const expandedScroll = scroll.scrollTop;
      expect(expandedScroll !== originalScroll).toBe(true);
      expect(document.activeElement).toBe(root.querySelector('[data-detail-close] button'));
      kd(document.activeElement, 'Escape');
      await tick(0);
      const closing = detail.getAnimations()[0];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(!!closing).toBe(true);
        await closing.ready;
        await until(() => closing.currentTime > 0);
        const ms = closing.effect.getTiming().duration;
        expect(ms).toBeGreaterThan(0);
        closing.playbackRate = .01;
        closing.currentTime = ms * .1;
        expect(closing.playState).toBe('running');
        expect(layer.hidden).toBe(false);
        expect(root.getAttribute('data-detail')).toBe(null);
      }
      root.querySelector('.lg-dock [data-page="audience"] button').click();
      await tick(0);
      expect(root.dataset.detail).toBe('audience');
      const reopening = detail.getAnimations()[0];
      if (closing) expect(closing.playState).toBe('idle');
      if (reopening) await reopening.finished;
      await tick(0);
      expect(document.activeElement).toBe(root.querySelector('[data-detail-close] button'));
      kd(document.activeElement, 'Escape');
      await tick(0);
      const finalClosing = detail.getAnimations()[0];
      if (finalClosing) await finalClosing.finished;
      await tick(0);
      expect({
        scrollTop: scroll.scrollTop, hidden: layer.hidden,
        inert: root.querySelector('.lg-grid').hasAttribute('inert'),
        minimized: root.querySelector('.lg-grid').classList.contains('lg-minimized'),
        stageHeight: root.querySelector('.lg-stage').style.height,
        cardsVisible: [...root.querySelectorAll('.lg-module')].every((card) => getComputedStyle(card).visibility === 'visible')
      }).toEqual({ scrollTop: originalScroll, hidden: true, inert: false, minimized: false, stageHeight: '', cardsVisible: true });
    } finally { root._liquidGlassMount(); }
  });

  it('缩略条原位切换全部六模块并保持五个其他模块', async (host) => {
    await withReduced(async () => {
      const { root } = await mount(host);
      root.querySelector('[data-open="revenue"] button').click();
      await tick(0);
      const visited = ['revenue'];
      for (const [key, title] of [['audience', '客户结构'], ['goal', '目标追踪'], ['ranking', '产品表现'], ['sources', '收入来源'], ['orders', '订单动态']]) {
        root.querySelector(`[data-thumb="${key}"] button`).click();
        await tick(0);
        expect(root.querySelector('[data-detail-title]').textContent).toBe(title);
        expect(root.querySelectorAll('[data-thumb]:not([hidden])').length).toBe(5);
        expect(root.querySelector(`[data-thumb="${key}"]`).hidden).toBe(true);
        visited.push(key);
      }
      expect(new Set(visited).size).toBe(6);
      expect(root.querySelector('.lg-detail ui-table').textContent).toContain('LM-12048');
    });
  });

  it('关闭动画未结束时进入另一模块不会把原卡片留成不可见', async (host) => {
    const { root } = await mount(host);
    root.querySelector('[data-open="revenue"] button').click();
    await tick(0);
    root.querySelector('[data-detail-close] button').click();
    root.querySelector('[data-open="audience"] button').click();
    await tick(0);
    expect(root.querySelector('.lg-module[data-module="revenue"]').style.visibility).toBe('');
    expect(root.querySelector('[data-detail-title]').textContent).toBe('客户结构');
    await withReduced(async () => {
      root.querySelector('[data-detail-close] button').click();
      await tick(0);
      expect([...root.querySelectorAll('.lg-module')].every((card) => card.style.visibility !== 'hidden')).toBe(true);
    });
  });

  it('正常关闭动画后由产品自动回焦可见的源按钮', async (host) => {
    const { root } = await mountInViewport(host);
    root.style.setProperty('--ui-motion', '100ms');
    const detail = root.querySelector('.lg-detail');
    try {
      root.querySelector('[data-open="revenue"] button').click();
      await tick(0);
      const opening = detail.getAnimations()[0];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(!!opening).toBe(true);
        expect(opening.effect.getTiming().duration).toBeGreaterThan(0);
      }
      if (opening) await opening.finished;
      await tick(0);
      const close = root.querySelector('[data-detail-close] button');
      expect(document.activeElement).toBe(close);
      close.click();
      await tick(0);
      const closing = detail.getAnimations()[0];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(!!closing).toBe(true);
        expect(closing.effect.getTiming().duration).toBeGreaterThan(0);
      }
      if (closing) await closing.finished;
      const source = root.querySelector('[data-open="revenue"] button');
      await until(() => root.querySelector('.lg-detail-layer').hidden && getComputedStyle(source).visibility === 'visible');
      const rect = source.getBoundingClientRect();
      expect({
        hidden: root.querySelector('.lg-detail-layer').hidden,
        inert: root.querySelector('.lg-grid').hasAttribute('inert'),
        visibility: getComputedStyle(source).visibility,
        width: rect.width, height: rect.height,
        focused: document.activeElement === source, activeTag: document.activeElement.tagName
      }).toEqual({ hidden: true, inert: false, visibility: 'visible', width: 40, height: 40, focused: true, activeTag: 'BUTTON' });
    } finally { root._liquidGlassMount(); }
  });

  it('关闭详情和 Esc 收回模块，归还当前模块的键盘焦点', async (host) => {
    await withReduced(async () => {
      const { root } = await mount(host);
      for (const closeWithEscape of [false, true]) {
        root.querySelector('.lg-side [data-page="audience"] button').click();
        await tick(0);
        const close = root.querySelector('[data-detail-close] button');
        if (closeWithEscape) kd(close, 'Escape'); else close.click();
        await tick(0);
        expect(root.querySelector('.lg-detail-layer').hidden).toBe(true);
        expect(root.querySelector('.lg-grid').hasAttribute('inert')).toBe(false);
        expect(root.querySelector('.lg-grid').getAttribute('aria-hidden')).toBe(null);
        expect(root.querySelector('[data-title]').textContent).toBe('经营概览');
        expect(document.activeElement).toBe(root.querySelector('[data-open="audience"] button'));
        expect(root.querySelector('.lg-stage').style.height).toBe('');
      }
    });
  });

  it('页面减少动效时命令浮层与搜索框不播放入场动画', async (host) => {
    await withReduced(async () => {
      const { root } = await mount(host);
      const command = root.querySelector('ui-command');
      command.show();
      for (const node of [command._mask, command._mask.querySelector('.ui-cmd')]) {
        expect(getComputedStyle(node).animationDuration.split(',').every((value) => parseFloat(value) <= .001)).toBe(true);
      }
      command.close();
    });
  });

  it('页面减少动效时模板外壳与时间胶囊的 CSS 过渡直接到终态', async (host) => {
    await withReduced(async () => {
      const { root } = await mount(host);
      const seconds = (node) => getComputedStyle(node).transitionDuration.split(',').map((value) => parseFloat(value));
      expect(seconds(root.querySelector('.lg-side')).every((value) => value <= .001)).toBe(true);
      root.querySelector('[data-time] button').click();
      expect(seconds(root.querySelector('.lg-filter-option')).every((value) => value <= .001)).toBe(true);
      expect(root.querySelector('[data-time] button').getAttribute('aria-expanded')).toBe('true');
      expect(root.querySelector('.lg-filter-option[data-period="week"] button').getAttribute('aria-selected')).toBe('true');
    });
  });

  it('桌面侧边栏收起与展开改变宽度并保留当前页面', async (host) => {
    const { root } = await mount(host);
    const side = root.querySelector('.lg-side');
    const toggle = root.querySelector('[data-collapse] button');
    const before = side.offsetWidth;
    toggle.click();
    side.getBoundingClientRect();
    await Promise.all(side.getAnimations().map((animation) => animation.finished));
    expect(root.classList.contains('lg-sidebar-collapsed')).toBe(true);
    expect(side.offsetWidth < before).toBe(true);
    expect(toggle.getAttribute('aria-label')).toContain('展开');
    toggle.click();
    side.getBoundingClientRect();
    await Promise.all(side.getAnimations().map((animation) => animation.finished));
    expect(root.classList.contains('lg-sidebar-collapsed')).toBe(false);
    expect(side.offsetWidth).toBe(before);
    expect(root.dataset.page).toBe('overview');
  });

  it('容器宽度让桌面、平板与手机真实换列，320px 内容和 Dock 不溢出', async (host) => {
    const tracks = [];
    for (const width of [1440, 768, 390, 320]) {
      const { root } = await mount(host, width);
      const grid = root.querySelector('.lg-grid');
      tracks.push(getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length);
      const scroll = root.querySelector('.lg-scroll');
      expect(scroll.scrollWidth <= scroll.clientWidth + 1).toBe(true);
      const r = root.getBoundingClientRect();
      const d = root.querySelector('.lg-dock').getBoundingClientRect();
      expect(d.left >= r.left - 1 && d.right <= r.right + 1).toBe(true);
      root._liquidGlassMount();
    }
    expect(tracks).toEqual([12, 6, 1, 1]);
  });

  it('命令空搜索清理失效的活动项，并安全播报无结果', async (host) => {
    const { root } = await mount(host);
    const command = root.querySelector('ui-command');
    command.show();
    const input = command._mask.querySelector('input');
    expect(input.hasAttribute('aria-activedescendant')).toBe(true);
    input.value = 'zz-no-match-<img src=x>';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(command._hits.length).toBe(0);
    expect(input.getAttribute('aria-activedescendant')).toBe(null);
    expect(command._mask.querySelector('.ui-cmd__empty').getAttribute('role')).toBe('option');
    expect(command._mask.querySelector('.ui-cmd__empty').textContent).toContain('<img src=x>');
    expect(command._mask.querySelectorAll('img').length).toBe(0);
    command.close();
  });

  it('重复挂载的命令面板列表与候选项 ID 不冲突', async (host) => {
    const { roots } = await mount(host, 1440, 2);
    const commands = roots.map((root) => root.querySelector('ui-command'));
    commands.forEach((command) => { command.show(); command.close(); });
    const ids = commands.flatMap((command) => [...command._mask.querySelectorAll('[id]')].map((node) => node.id));
    expect(ids.length > 0).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    commands.forEach((command) => {
      const input = command._mask.querySelector('input');
      expect(command._mask.querySelector('#' + input.getAttribute('aria-controls')) !== null).toBe(true);
    });
  });

  it('命令面板实时过滤并高亮匹配文字，Esc 恢复触发焦点', async (host) => {
    const { root } = await mount(host);
    const trigger = root.querySelector('ui-command .ui-cmd-trigger');
    trigger.focus();
    trigger.click();
    const command = root.querySelector('ui-command');
    const input = command._mask.querySelector('input');
    input.value = '客户';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(command._hits.map((item) => item.label)).toEqual(['客户洞察', '客户结构']);
    expect([...command._mask.querySelectorAll('mark')].map((mark) => mark.textContent)).toEqual(['客户', '客户']);
    kd(input, 'Escape');
    expect(command._mask.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  it('模板区域 K 与 Ctrl+K 打开命令面板，筛选后 Enter 跳转', async (host) => {
    await withReduced(async () => {
      const { root } = await mount(host);
      const command = root.querySelector('ui-command');
      for (const modifiers of [{}, { ctrlKey: true }]) {
        root.focus();
        kd(root, 'k', modifiers);
        expect(!!command._mask && !command._mask.hidden).toBe(true);
        const input = command._mask.querySelector('input');
        input.value = '收入分析';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(command._hits.map((item) => item.value)).toEqual(['page:revenue']);
        kd(input, 'ArrowDown');
        kd(input, 'Enter');
        await tick(0);
        expect(root.querySelector('[data-title]').textContent).toBe('收入分析');
        expect(root.dataset.detail).toBe('revenue');
        expect(command._mask.hidden).toBe(true);
        root.querySelector('[data-detail-close] button').click();
        await tick(0);
      }
    });
  });

  it('时间胶囊可见后由产品自动聚焦当前选项', async (host) => {
    const { root } = await mountInViewport(host);
    root.style.setProperty('--ui-motion', '100ms');
    try {
      const trigger = root.querySelector('[data-time] button');
      trigger.focus({ preventScroll: true });
      expect(document.activeElement).toBe(trigger);
      trigger.click();
      const week = root.querySelector('.lg-filter-option[data-period="week"] button');
      await until(() => getComputedStyle(week).visibility === 'visible' && getComputedStyle(week.closest('.lg-filter-option')).opacity === '1');
      const rect = week.getBoundingClientRect();
      expect(rect.width > 0 && rect.height > 0).toBe(true);
      expect({
        expanded: trigger.getAttribute('aria-expanded'),
        inert: root.querySelector('.lg-filter-options').hasAttribute('inert'),
        visibility: getComputedStyle(week).visibility,
        focused: document.activeElement === week,
        period: document.activeElement.closest('.lg-filter-option')?.dataset.period ?? null
      }).toEqual({ expanded: 'true', inert: false, visibility: 'visible', focused: true, period: 'week' });
      kd(document.activeElement, 'ArrowRight');
      expect(document.activeElement).toBe(root.querySelector('.lg-filter-option[data-period="month"] button'));
      kd(document.activeElement, 'Enter');
      expect(root.dataset.period).toBe('month');
      expect(document.activeElement).toBe(trigger);
    } finally { root._liquidGlassMount(); }
  });

  it('时间胶囊支持方向键、Enter 选择与 Esc 归还焦点', async (host) => {
    await withReduced(async () => {
      const { root } = await mount(host);
      const trigger = root.querySelector('[data-time] button');
      trigger.click();
      const week = root.querySelector('.lg-filter-option[data-period="week"] button');
      const month = root.querySelector('.lg-filter-option[data-period="month"] button');
      expect(document.activeElement).toBe(week);
      kd(week, 'ArrowRight');
      expect(document.activeElement).toBe(month);
      kd(month, 'Enter');
      expect(root.dataset.period).toBe('month');
      expect(document.activeElement).toBe(trigger);
      trigger.click();
      kd(month, 'Escape');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(trigger);
    });
  });

  it('时间胶囊分裂为四周期，选择后融回并同步指标和图表', async (host) => {
    await withReduced(async () => {
      const { root } = await mount(host);
      const trigger = root.querySelector('[data-time] button');
      trigger.click();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(root.querySelectorAll('[data-period] button[role="option"]').length).toBe(4);
      root.querySelector('[data-period="month"] button').click();
      await tick(0);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(root.querySelector('[data-period-label]').textContent).toBe('本月');
      expect(root.querySelector('ui-odometer[data-metric="revenue"]').getAttribute('value')).toBe('486280');
      expect(root.querySelector('[data-products] [data-metric="product1"]').getAttribute('value')).toBe('216000');
      expect(JSON.parse(root.querySelector('[data-chart="revenue"]').getAttribute('data'))[0].value).toBe(62);
      expect(root.querySelector('[data-chart="source"][data-source="source1"]').getAttribute('value')).toBe('51');
      expect(root.querySelector('.lg-filter-options').hasAttribute('inert')).toBe(true);
      expect(document.activeElement).toBe(trigger);
      expect(root.querySelector('[data-status]').textContent).toContain('本月');
    });
  });

  it('时间切换图表逐帧插值并从当前帧重定向', async (host) => {
    const { root } = await mountInViewport(host);
    const chart = root.querySelector('[data-chart="revenue"]');
    const rendered = () => ({
      bar: chart.querySelector('.ui-bar__col i').getBoundingClientRect().height,
      spark: root.querySelector('[data-chart="orders"] path.l').getAttribute('d'),
      donut: root.querySelector('[data-chart="audience"] circle.s').getAttribute('stroke-dasharray')
    });
    const nativeRequest = window.requestAnimationFrame;
    const nativeCancel = window.cancelAnimationFrame;
    const pending = new Set();
    window.requestAnimationFrame = (callback) => {
      const id = nativeRequest.call(window, (time) => { pending.delete(id); callback(time); });
      pending.add(id);
      return id;
    };
    window.cancelAnimationFrame = (id) => { pending.delete(id); nativeCancel.call(window, id); };
    let observer, viewportObserver;
    try {
      const rect = chart.getBoundingClientRect();
      expect(rect.top >= 0 && rect.bottom <= innerHeight).toBe(true);
      const targets = {}, pictures = {};
      await withReduced(async () => {
        for (const key of ['month', 'today', 'quarter', 'week']) {
          selectPeriod(root, key);
          targets[key] = chartValues(root);
          pictures[key] = rendered();
        }
      });
      expect(targets.month[0]).toBe(62);
      expect(targets.today[0]).toBe(28);
      expect(targets.week.length).toBeGreaterThan(0);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        selectPeriod(root, 'month');
        expect(chartValues(root)).toEqual(targets.month);
        expect(rendered()).toEqual(pictures.month);
        return;
      }
      let frames = [], shapes = [];
      observer = new MutationObserver(() => { frames.push(chartValues(root)); shapes.push(rendered()); });
      observer.observe(chart, { attributes: true, attributeFilter: ['data'] });
      selectPeriod(root, 'month');
      expect(chartValues(root)).toEqual(targets.week);
      await until(() => frames.length >= 4);
      interpolated(frames, targets.week, targets.month);
      expect(new Set(shapes.map((shape) => shape.bar)).size).toBeGreaterThan(2);
      expect(new Set(shapes.map((shape) => shape.spark)).size).toBeGreaterThan(2);
      expect(new Set(shapes.map((shape) => shape.donut)).size).toBeGreaterThan(2);
      const current = chartValues(root);
      frames = []; shapes = [];
      selectPeriod(root, 'today');
      expect(chartValues(root)).toEqual(current);
      await until(() => frames.length >= 3);
      interpolated(frames, current, targets.today);
      let inViewport = true;
      viewportObserver = new IntersectionObserver((entries) => { inViewport = entries[0].isIntersecting; }, { threshold: 0 });
      viewportObserver.observe(root);
      host.style.transform = 'translateY(200vh)';
      await until(() => !inViewport);
      const paused = chartValues(root);
      await tick(1100);
      expect(chartValues(root)).toEqual(paused);
      frames = [];
      host.style.transform = '';
      await until(() => inViewport);
      await until(() => frames.length > 0);
      expect(frames[0][0] !== targets.today[0]).toBe(true);
      await until(() => JSON.stringify(chartValues(root)) === JSON.stringify(targets.today));
      expect(rendered()).toEqual(pictures.today);
      await tick(100);
      expect(pending.size).toBe(0);
      // 页面减效开启后不再经过中间帧，当前切换直接给出精确终态。
      selectPeriod(root, 'quarter');
      await until(() => chartValues(root)[0] !== targets.today[0]);
      await withReduced(async () => {
        selectPeriod(root, 'month');
        expect(chartValues(root)).toEqual(targets.month);
        expect(rendered()).toEqual(pictures.month);
      });
      // 已挂载的详情产品贡献图同样走数值插值，而非只补概览柱形图。
      await withReduced(async () => {
        selectPeriod(root, 'week');
        root.querySelector('[data-open="ranking"] button').click();
        await tick(0);
      });
      const products = root.querySelector('[data-chart="products"]');
      const readProducts = () => JSON.parse(products.getAttribute('data')).map((item) => item.value);
      const before = readProducts();
      selectPeriod(root, 'month');
      expect(readProducts()).toEqual(before);
      await until(() => readProducts()[0] > before[0] && readProducts()[0] < 216000);
      const productBars = [...products.querySelectorAll('.ui-bar__row i')].map((bar) => parseFloat(bar.style.getPropertyValue('--v')));
      expect(productBars.length).toBe(3);
      expect(productBars[1] > 42800 / 58200 * 100 && productBars[1] < 170500 / 216000 * 100).toBe(true);
      await until(() => JSON.stringify(readProducts()) === JSON.stringify([216000, 170500, 486280 - 216000 - 170500]));
      await tick(100);
      expect(pending.size).toBe(0);
      selectPeriod(root, 'quarter');
      await until(() => readProducts()[0] !== 216000);
      root.remove();
      await tick(80);
      const detached = chartValues(root);
      await tick(200);
      expect(chartValues(root)).toEqual(detached);
      expect(pending.size).toBe(0);
    } finally {
      observer?.disconnect();
      viewportObserver?.disconnect();
      root._liquidGlassMount?.();
      pending.forEach((id) => nativeCancel.call(window, id));
      window.requestAnimationFrame = nativeRequest;
      window.cancelAnimationFrame = nativeCancel;
    }
  });
});
