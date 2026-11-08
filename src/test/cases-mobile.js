/* 系统 APP：逐套纵向切片的真实挂载、交互、主题与复制出口回归。 */
import './../components/index.js';
import { describe, it, expect, put, tick } from './harness.js';
import { templates, TPL_CATS, TPL_BASE_CSS } from './../data/templates.js';
import { styles } from './../data/styles.js';
import { styleGuides } from './../data/style-guides.js';

// 每添加一个经过 RED→GREEN 的切片就在这里登记；旧 13 个模板另有保留断言。
export const MOBILE_IDS = ['miui-settings', 'coui-files', 'oneui-tasks', 'harmonyos-devices', 'originos-agenda', 'flyme-notes'];

function template(id) {
  const t = templates.find((item) => item.id === id);
  expect(!!t).toBe(true);
  return t;
}

async function mount(host, id, copied = false) {
  const t = template(id);
  await put(host, '<style>' + TPL_BASE_CSS + t.css + '</style><div data-style="' + t.style + '" data-theme="light" style="width:320px;height:640px">' + t.html + '</div>');
  const root = host.querySelector('.t-' + id);
  const init = copied ? new Function('return (' + t.init.toString().replace(/^init\s*\(/, 'function init(') + ')')() : t.init;
  init(root);
  await tick(0);
  return root;
}

function input(root, value) {
  const el = root.querySelector('[data-search] input');
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return el;
}

async function gallery(host, fn) {
  const key = 'ui-gallery:state';
  const previous = localStorage.getItem(key);
  localStorage.setItem(key, JSON.stringify({ view: 'templates', tcat: '系统 APP', theme: 'light', style: 'brutal', motion: 'reduce' }));
  const frame = document.createElement('iframe');
  frame.title = '系统 APP 画廊回归';
  frame.style.cssText = 'width:1100px;height:1000px;position:fixed;left:-2200px;border:0';
  try {
    const loaded = new Promise((resolve) => { frame.onload = resolve; });
    frame.src = './index.html';
    host.appendChild(frame);
    await loaded;
    await tick(50);
    await fn(frame.contentDocument, frame.contentWindow);
  } finally {
    frame.remove();
    if (previous === null) localStorage.removeItem(key); else localStorage.setItem(key, previous);
  }
}

function register(id, styleId, name) {
  describe('系统 APP · ' + name, () => {
    it(name + ' 风格与手机模板可发现，元数据完整且标注本地示例', async () => {
      expect(styles.some((s) => s.id === styleId)).toBe(true);
      const t = template(id);
      expect(t.cat).toBe('系统 APP');
      expect(TPL_CATS.includes(t.cat)).toBe(true);
      expect(t.frame).toBe('phone');
      expect(t.style).toBe(styleId);
      expect(t.html).toContain('class="t-screen t-' + id + '"');
      expect(t.html).toContain('本地示例');
      expect(t.ai).toContain('【操作逻辑】');
      expect(t.ai).toContain('风格灵感');
      expect(t.design.when.length > 0 && t.design.avoid.length > 0 && t.design.tips.length > 0).toBe(true);
      const guide = styleGuides[styleId];
      expect(!!guide).toBe(true);
      expect(guide.ai).toContain('data-style="' + styleId + '"');
      expect(guide.ai).toContain('风格灵感');
      expect(guide.design.when.length > 0 && guide.design.avoid.length > 0 && guide.design.tips.length > 0).toBe(true);
      expect(styles.length).toBe(15 + MOBILE_IDS.length + 1); // + Dusk Glass（液态玻璃后台专属）
    });

    it(name + ' 单页 CSS 可独立复制，init 源码不依赖模块闭包', async (host) => {
      const t = template(id);
      expect(/#[0-9a-f]{3,8}\b|\brgba?\(/i.test(t.css)).toBe(false);
      expect(t.css).toContain('.t-' + id + ' [hidden]');
      const root = await mount(host, id, true);
      t.uses.forEach((tag) => expect(!!customElements.get(tag)).toBe(true));
      expect(root.querySelector('.t-scr').getAttribute('aria-label').length > 0).toBe(true);
      expect(root.querySelector('[aria-live="polite"]') !== null).toBe(true);
      expect(getComputedStyle(root.querySelector('.t-scr')).overflowY).toBe('auto');
      const empty = root.querySelector('[data-empty]');
      if (empty) expect(getComputedStyle(empty).display).toBe('none');
    });

    it(name + ' 浅/深色局部隔离，sub/brand/brand-ink 在实际底色达到 AA', async (host) => {
      template(id);
      const rgb = (color) => {
        const probe = document.createElement('i'); probe.style.color = color; host.appendChild(probe);
        const out = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number); probe.remove(); return out;
      };
      const luminance = (color) => color.slice(0, 3).map((v) => {
        v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const failures = [];
      for (const theme of ['light', 'dark']) {
        await put(host, '<div data-style="terminal" data-theme="dark"><div data-style="' + styleId + '" data-theme="' + theme + '"><ui-input label="局部输入"></ui-input></div></div><div data-style="' + styleId + '" data-theme="' + theme + '"><ui-input label="独立输入"></ui-input></div>');
        const local = host.firstElementChild.firstElementChild;
        const standalone = host.lastElementChild;
        const cs = getComputedStyle(local), own = getComputedStyle(standalone);
        ['bg', 'panel', 'panel-2', 'text', 'sub', 'brand', 'brand-ink', 'font', 'radius-pill', 'border-w', 'shadow', 'ctl-h'].forEach((key) => {
          expect(cs.getPropertyValue('--ui-' + key)).toBe(own.getPropertyValue('--ui-' + key));
        });
        expect(getComputedStyle(local).textShadow).toBe('none');
        expect(getComputedStyle(local.querySelector('input')).height).toBe('44px');
        const v = (key) => rgb(cs.getPropertyValue('--ui-' + key).trim());
        for (const bg of ['bg', 'panel', 'panel-2', 'brand-soft']) {
          for (const fg of ['text', 'sub', 'brand']) {
            const r = ratio(v(fg), v(bg));
            if (r < 4.5) failures.push(theme + ' ' + fg + '/' + bg + ' ' + r.toFixed(2));
          }
        }
        if (ratio(v('brand-ink'), v('brand')) < 4.5) failures.push(theme + ' brand-ink/brand');
      }
      expect(failures).toEqual([]);
    });

    it(name + ' 画廊使用专属风格，全站换风格/明暗不重建且保留交互', async (host) => {
      template(id);
      await gallery(host, async (doc) => {
        const card = doc.querySelector('[data-card="tpl-' + id + '"]');
        expect(!!card).toBe(true);
        expect(doc.querySelectorAll('.tcard').length).toBe(MOBILE_IDS.length);
        const phone = card.querySelector('.tphone');
        expect(phone.dataset.style).toBe(styleId);
        expect(phone.dataset.theme).toBe('light');
        const root = card.querySelector('.t-' + id);
        const action = root.querySelector('[data-setting] input[type="checkbox"], [data-category]:not([aria-pressed="true"]), [data-task] input, [data-device]:not([aria-pressed="true"]), [data-date]:not([aria-pressed="true"]), [data-pin]');
        expect(!!action).toBe(true);
        action.click(); await tick(0);
        const before = root.innerHTML;
        const bg = doc.defaultView.getComputedStyle(root).backgroundColor;
        const scroll = root.querySelector('.t-scr'); scroll.scrollTop = 24;
        const scrollTop = scroll.scrollTop;
        const sel = doc.getElementById('styleSel'); sel.value = 'nord'; sel.dispatchEvent(new Event('change', { bubbles: true }));
        expect(phone.dataset.style).toBe(styleId);
        doc.getElementById('themeBtn').click(); await tick(0);
        expect(phone.dataset.theme).toBe('dark');
        expect(card.querySelector('.t-' + id)).toBe(root);
        expect(root.innerHTML).toBe(before);
        expect(scroll.scrollTop).toBe(scrollTop);
        expect(doc.defaultView.getComputedStyle(root).backgroundColor === bg).toBe(false);
        expect(doc.querySelector('.hint').textContent).toContain('系统 APP 使用各自风格');
      });
    });

    it(name + ' 实际控件不受全站 terminal/material/neumorph/luxury/brutal 修饰穿透', async (host) => {
      template(id);
      await gallery(host, async (doc) => {
        const root = doc.querySelector('.t-' + id);
        const select = doc.getElementById('styleSel');
        select.value = 'aurora'; select.dispatchEvent(new Event('change', { bubbles: true }));
        doc.getElementById('themeBtn').click(); await tick(0);
        const snapshot = () => Array.from(root.querySelectorAll('.ui-btn,.ui-input,.ui-seg button,.ui-chips button,.ui-tag')).map((el) => {
          const cs = doc.defaultView.getComputedStyle(el);
          const before = doc.defaultView.getComputedStyle(el, '::before');
          return ['borderTopLeftRadius', 'fontFamily', 'fontSize', 'fontWeight', 'textTransform', 'letterSpacing', 'boxShadow', 'backgroundColor', 'color'].map((key) => cs[key]).concat(before.content);
        });
        const baseline = snapshot();
        for (const global of ['terminal', 'material', 'neumorph', 'luxury', 'brutal']) {
          select.value = global; select.dispatchEvent(new Event('change', { bubbles: true }));
          expect(snapshot()).toEqual(baseline);
        }
      });
    });

    it(name + ' 画廊 AI/代码携带推荐主题，完整复制后在新页面可运行', async (host) => {
      template(id);
      await gallery(host, async (doc) => {
        const card = doc.querySelector('[data-card="tpl-' + id + '"]');
        const ai = card.querySelector('[data-body="ai"] pre').textContent;
        expect(ai).toContain('data-style="' + styleId + '"');
        expect(ai).toContain('data-theme="light"');
        expect(ai).toContain('风格灵感');
        const code = card.querySelector('[data-body="code"] pre').textContent;
        expect(code).toContain('<!DOCTYPE html>');
        const parsed = new DOMParser().parseFromString(code, 'text/html');
        expect(parsed.documentElement.dataset.style).toBe(styleId);
        expect(parsed.documentElement.dataset.theme).toBe('light');
        expect(parsed.querySelector('link[rel="stylesheet"]').getAttribute('href')).toContain('tokens.css');
        const exported = document.createElement('iframe'); exported.title = name + ' 独立代码出口';
        const loaded = new Promise((resolve) => { exported.onload = resolve; });
        exported.srcdoc = code; host.appendChild(exported); await loaded; await tick(50);
        const root = exported.contentDocument.querySelector('.t-' + id);
        expect(!!root).toBe(true);
        expect(root.querySelector('.t-scr') !== null).toBe(true);
        expect(root.querySelector('input, button') !== null).toBe(true);
        expect(root.dataset.ready).toBe('1');
        if (id === 'miui-settings') {
          expect(!!root.querySelector('ui-accordion .ui-acc__hd')).toBe(true);
          JSON.parse(root.querySelector('ui-accordion').getAttribute('items'));
        }
        exported.remove();
      });
    });
  });
}

register('miui-settings', 'miui', 'MIUI / HyperOS');
register('coui-files', 'coui', 'COUI / ColorOS');
register('oneui-tasks', 'oneui', 'One UI');
register('harmonyos-devices', 'harmonyos', 'HarmonyOS');
register('originos-agenda', 'originos', 'OriginOS');
register('flyme-notes', 'flyme', 'Flyme');

describe('系统 APP · MIUI 设置操作', () => {
  it('MIUI 孤立真实开关没有所属设置时忽略 change，不抛错', async (host) => {
    const root = await mount(host, 'miui-settings', true);
    const feedback = root.querySelector('[data-feedback]');
    const before = feedback.textContent;
    const orphan = document.createElement('ui-switch');
    orphan.textContent = '孤立开关';
    root.appendChild(orphan);
    await tick(0);
    const errors = [], changes = [];
    const onError = (event) => errors.push(event.message);
    orphan.addEventListener('change', (event) => changes.push(event.isTrusted));
    window.addEventListener('error', onError);
    try {
      orphan.querySelector('input').click();
    } finally {
      window.removeEventListener('error', onError);
    }
    expect(orphan.querySelector('input').checked).toBe(true);
    expect(changes).toEqual([true]);
    expect({ feedback: feedback.textContent, errors }).toEqual({ feedback: before, errors: [] });
    const row = root.querySelector('[data-setting="蓝牙"]');
    row.querySelector('input[role="switch"]').click();
    expect(row.querySelector('[data-state]').textContent).toBe('已开启');
    expect(feedback.textContent).toContain('蓝牙已开启');
    expect(feedback.getAttribute('aria-live')).toBe('polite');
  });

  it('MIUI 孤立开关不改写 root 外层诱饵设置的状态与反馈', async (host) => {
    const root = await mount(host, 'miui-settings', true);
    const feedback = root.querySelector('[data-feedback]');
    const before = feedback.textContent;
    const context = root.parentElement;
    const outside = document.createElement('article');
    outside.setAttribute('data-setting', '外层诱饵设置');
    outside.innerHTML = '<small data-state>外层状态保持不变</small><ui-switch>根外开关</ui-switch>';
    context.before(outside);
    outside.appendChild(context);
    const orphan = document.createElement('ui-switch');
    orphan.textContent = '没有根内设置的开关';
    root.appendChild(orphan);
    await tick(0);
    const changes = [];
    orphan.addEventListener('change', (event) => changes.push(event.isTrusted));
    orphan.querySelector('input').click();
    outside.querySelector('ui-switch input').click();
    expect(changes).toEqual([true]);
    expect({ outside: outside.querySelector('[data-state]').textContent, feedback: feedback.textContent }).toEqual({ outside: '外层状态保持不变', feedback: before });
    const row = root.querySelector('[data-setting="无线局域网"]');
    row.querySelector('input[role="switch"]').click();
    expect(row.querySelector('[data-state]').textContent).toBe('已关闭');
    expect(feedback.textContent).toContain('无线局域网已关闭');
    expect(outside.querySelector('[data-state]').textContent).toBe('外层状态保持不变');
  });

  it('MIUI 搜索真实过滤分组，空结果可见，清空后恢复', async (host) => {
    const root = await mount(host, 'miui-settings', true);
    input(root, '蓝牙');
    expect(root.querySelectorAll('[data-setting]:not([hidden])').length).toBe(1);
    expect(root.querySelector('[data-setting]:not([hidden])').textContent).toContain('蓝牙');
    input(root, '不存在的设置');
    expect(root.querySelectorAll('[data-setting]:not([hidden])').length).toBe(0);
    expect(root.querySelector('[data-empty]').hidden).toBe(false);
    expect(getComputedStyle(root.querySelector('[data-empty]')).display === 'none').toBe(false);
    input(root, '');
    expect(root.querySelectorAll('[data-setting]:not([hidden])').length).toBeGreaterThan(3);
    expect(root.querySelector('[data-empty]').hidden).toBe(true);
  });

  it('MIUI 设置开关可撤销，状态文字与读屏反馈同步', async (host) => {
    const root = await mount(host, 'miui-settings', true);
    const row = root.querySelector('[data-setting="无线局域网"]');
    const sw = row.querySelector('input[role="switch"]');
    expect(sw.checked).toBe(true);
    sw.click();
    expect(row.querySelector('[data-state]').textContent).toContain('已关闭');
    expect(root.querySelector('[data-feedback]').textContent).toContain('无线局域网已关闭');
    sw.click();
    expect(row.querySelector('[data-state]').textContent).toContain('已开启');
    expect(root.querySelector('[data-feedback]').getAttribute('aria-live')).toBe('polite');
  });
});

describe('系统 APP · COUI 文件操作', () => {
  it('COUI 委托点击忽略 root 外层的诱饵文件选择控件', async (host) => {
    const root = await mount(host, 'coui-files', true);
    const snapshot = () => ({
      hidden: root.querySelector('[data-file-detail]').hidden,
      name: root.querySelector('[data-file-name]').textContent,
      feedback: root.querySelector('[data-feedback]').textContent
    });
    const before = snapshot();
    root.querySelector('h1').click();
    expect(snapshot()).toEqual(before);
    const context = root.parentElement;
    const outside = document.createElement('article');
    outside.setAttribute('data-file-select', '');
    outside.setAttribute('data-file', '');
    outside.setAttribute('data-name', '外层诱饵文件');
    outside.setAttribute('data-size', '999 MB');
    context.before(outside);
    outside.appendChild(context);
    root.querySelector('h1').click();
    expect(snapshot()).toEqual(before);
    const file = root.querySelector('[data-file]');
    file.querySelector('button[data-file-select] span').click();
    expect(file.querySelector('[data-file-select]').getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-file-name]').textContent).toBe(file.dataset.name);
    expect(outside.dataset.name).toBe('外层诱饵文件');
  });

  it('COUI 孤立选择控件忽略 root 外层或缺失的所属文件', async (host) => {
    const actual = [], expected = [];
    for (const hasRecord of [true, false]) {
      const root = await mount(host, 'coui-files', true);
      const select = root.querySelector('[data-file] [data-file-select]');
      select.click();
      const snapshot = () => ({
        pressed: select.getAttribute('aria-pressed'),
        hidden: root.querySelector('[data-file-detail]').hidden,
        name: root.querySelector('[data-file-name]').textContent,
        feedback: root.querySelector('[data-feedback]').textContent
      });
      expected.push(snapshot());
      const context = root.parentElement;
      const outside = document.createElement('article');
      if (hasRecord) outside.setAttribute('data-file', '');
      outside.setAttribute('data-name', '外层记录文件');
      outside.setAttribute('data-size', '999 MB');
      context.before(outside);
      outside.appendChild(context);
      const orphan = document.createElement('button');
      orphan.setAttribute('data-file-select', '');
      orphan.innerHTML = '<span>孤立选择</span>';
      root.appendChild(orphan);
      orphan.firstElementChild.click();
      actual.push(snapshot());
      expect(outside.dataset.name).toBe('外层记录文件');
    }
    expect(actual).toEqual(expected);
  });

  it('COUI 文件分类与搜索组合过滤，零结果显示空状态', async (host) => {
    const root = await mount(host, 'coui-files', true);
    root.querySelector('[data-category="document"]').click();
    expect(root.querySelectorAll('[data-file]:not([hidden])').length).toBe(2);
    expect(root.querySelector('[data-category="document"]').getAttribute('aria-pressed')).toBe('true');
    input(root, '简报');
    expect(root.querySelectorAll('[data-file]:not([hidden])').length).toBe(1);
    root.querySelector('[data-category="video"]').click();
    expect(root.querySelectorAll('[data-file]:not([hidden])').length).toBe(0);
    expect(root.querySelector('[data-empty]').hidden).toBe(false);
    expect(getComputedStyle(root.querySelector('[data-empty]')).display === 'none').toBe(false);
    input(root, ''); root.querySelector('[data-category="all"]').click();
    expect(root.querySelectorAll('[data-file]:not([hidden])').length).toBe(5);
    expect(root.querySelector('[data-file-count]').textContent).toContain('5');
  });

  it('COUI 文件选择展示本地详情，筛选隐藏选中项后清除选择', async (host) => {
    const root = await mount(host, 'coui-files', true);
    const select = root.querySelector('[data-file] [data-file-select]');
    select.click();
    expect(select.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-file-detail]').hidden).toBe(false);
    expect(root.querySelector('[data-file-name]').textContent).toContain('项目简报.pdf');
    root.querySelector('[data-category="audio"]').click();
    expect(select.getAttribute('aria-pressed')).toBe('false');
    expect(root.querySelector('[data-file-detail]').hidden).toBe(true);
    expect(root.querySelector('[data-feedback]').textContent).toContain('音频');
  });
});

describe('系统 APP · One UI 提醒操作', () => {
  it('One UI 孤立真实 checkbox 的 change 不借用 root 外层待办刷新模板', async (host) => {
    const actual = [], expected = [];
    for (const hasRecord of [true, false]) {
      const root = await mount(host, 'oneui-tasks', true);
      const context = root.parentElement;
      const outside = document.createElement('article');
      if (hasRecord) outside.setAttribute('data-task', '');
      outside.innerHTML = '<ui-checkbox>根外待办</ui-checkbox>';
      context.before(outside);
      outside.appendChild(context);
      const orphan = document.createElement('ui-checkbox');
      orphan.textContent = '没有根内待办的 checkbox';
      root.appendChild(orphan);
      await tick(0);
      root.querySelector('[data-reset]').click();
      const snapshot = () => ({
        remaining: root.querySelector('[data-remaining]').textContent,
        progress: root.querySelector('[data-progress]').getAttribute('value'),
        feedback: root.querySelector('[data-feedback]').textContent,
        tasks: Array.from(root.querySelectorAll('[data-task]')).map((task) => ({ hidden: task.hidden, state: task.querySelector('[data-task-state]').textContent }))
      });
      expected.push(snapshot());
      const changes = [];
      orphan.addEventListener('change', (event) => changes.push(event.isTrusted));
      orphan.querySelector('input').click();
      outside.querySelector('ui-checkbox input').click();
      expect(orphan.querySelector('input').checked).toBe(true);
      expect(changes).toEqual([true]);
      actual.push(snapshot());
      const check = root.querySelector('[data-task] input');
      check.click();
      await tick(0);
      expect(root.querySelector('[data-remaining]').textContent).toBe('2');
      expect(root.querySelector('[data-progress] [role="progressbar"]').getAttribute('aria-valuenow')).toBe('50');
      expect(check.closest('[data-task]').querySelector('[data-task-state]').textContent).toBe('已完成');
      expect(root.querySelector('[data-feedback]').getAttribute('aria-live')).toBe('polite');
    }
    expect(actual).toEqual(expected);
  });

  it('One UI 待办完成后焦点移到可见的相邻任务，空组回到当前筛选', async (host) => {
    const root = await mount(host, 'oneui-tasks', true);
    const checks = Array.from(root.querySelectorAll('[data-task] input'));
    const changes = [];
    root.addEventListener('change', (event) => { if (event.target.matches('input[type="checkbox"]')) changes.push(event.isTrusted); });
    root.querySelector('ui-segmented [data-v="待办"]').click();
    const focus = async () => {
      const focused = root.querySelector(':focus');
      // 正常动效下等实际焦点过渡结束，仍保留可见位置与描边断言。
      if (focused) await Promise.all(focused.getAnimations().map((animation) => animation.finished.catch(() => {})));
      const active = root.querySelector(':focus');
      const css = active && getComputedStyle(active);
      const rect = active && active.getBoundingClientRect();
      const area = root.querySelector('.t-scr').getBoundingClientRect();
      return {
        target: active ? (checks.includes(active) ? checks.indexOf(active) : active.dataset.v) : null,
        visible: !!active && !active.closest('[hidden]') && rect.width > 0 && rect.height > 0 && rect.bottom > area.top && rect.top < area.bottom,
        ring: !!css && active.matches(':focus-visible') && css.outlineStyle !== 'none' && parseFloat(css.outlineWidth) > 0
      };
    };
    checks[0].focus();
    checks[0].click();
    await tick(0);
    expect(changes).toEqual([true]);
    expect(await focus()).toEqual({ target: 1, visible: true, ring: true });
    expect(checks[0].closest('[data-task]').hidden).toBe(true);
    expect(root.querySelector('[data-remaining]').textContent).toBe('2');
    checks[2].focus();
    checks[2].click();
    await tick(0);
    expect(await focus()).toEqual({ target: 1, visible: true, ring: true });
    checks[1].click();
    await tick(0);
    expect(changes).toEqual([true, true, true]);
    expect(await focus()).toEqual({ target: '待办', visible: true, ring: true });
    expect(root.querySelector('[data-empty]').hidden).toBe(false);
    expect(root.querySelector('[data-remaining]').textContent).toBe('0');
    expect(root.querySelector('[data-progress] [role="progressbar"]').getAttribute('aria-valuenow')).toBe('100');
    expect(root.querySelector('ui-segmented [aria-checked="true"]').getAttribute('tabindex')).toBe('0');
    root.querySelector('ui-segmented [data-v="全部"]').click();
    checks[0].focus();
    checks[0].click();
    await tick(0);
    expect(await focus()).toEqual({ target: 0, visible: true, ring: true });
    expect(checks[0].closest('[data-task]').querySelector('[data-task-state]').textContent).toBe('未完成');
    expect(root.querySelector('[data-feedback]').getAttribute('aria-live')).toBe('polite');
  });

  it('One UI 已完成撤销后焦点移到可见任务，最后一项撤销有筛选出口', async (host) => {
    const root = await mount(host, 'oneui-tasks', true);
    const checks = Array.from(root.querySelectorAll('[data-task] input'));
    checks[0].click();
    root.querySelector('ui-segmented [data-v="已完成"]').click();
    const changes = [];
    root.addEventListener('change', (event) => { if (event.target.matches('input[type="checkbox"]')) changes.push(event.isTrusted); });
    const focus = async () => {
      const focused = root.querySelector(':focus');
      // 正常动效下等实际焦点过渡结束，仍保留可见位置与描边断言。
      if (focused) await Promise.all(focused.getAnimations().map((animation) => animation.finished.catch(() => {})));
      const active = root.querySelector(':focus');
      const css = active && getComputedStyle(active);
      const rect = active && active.getBoundingClientRect();
      const area = root.querySelector('.t-scr').getBoundingClientRect();
      return {
        target: active ? (checks.includes(active) ? checks.indexOf(active) : active.dataset.v) : null,
        visible: !!active && !active.closest('[hidden]') && rect.width > 0 && rect.height > 0 && rect.bottom > area.top && rect.top < area.bottom,
        ring: !!css && active.matches(':focus-visible') && css.outlineStyle !== 'none' && parseFloat(css.outlineWidth) > 0
      };
    };
    checks[3].focus();
    checks[3].click();
    await tick(0);
    expect(changes).toEqual([true]);
    expect(await focus()).toEqual({ target: 0, visible: true, ring: true });
    expect(checks[3].closest('[data-task]').hidden).toBe(true);
    expect(checks[3].closest('[data-task]').querySelector('[data-task-state]').textContent).toBe('未完成');
    checks[0].click();
    await tick(0);
    expect(changes).toEqual([true, true]);
    expect(await focus()).toEqual({ target: '已完成', visible: true, ring: true });
    expect(root.querySelector('[data-empty]').hidden).toBe(false);
    expect(root.querySelector('[data-remaining]').textContent).toBe('4');
    expect(root.querySelector('[data-progress] [role="progressbar"]').getAttribute('aria-valuenow')).toBe('0');
    expect(root.querySelector('ui-segmented [aria-checked="true"]').getAttribute('tabindex')).toBe('0');
    expect(root.querySelector('[data-feedback]').textContent).toContain('还剩 4');
    expect(root.querySelector('[data-feedback]').getAttribute('aria-live')).toBe('polite');
  });

  it('One UI 勾选与撤销同步剩余数量、进度及读屏反馈', async (host) => {
    const root = await mount(host, 'oneui-tasks', true);
    expect(root.querySelector('[data-remaining]').textContent).toBe('3');
    expect(root.querySelector('[data-progress]').getAttribute('value')).toBe('25');
    const check = root.querySelector('[data-task] input');
    check.click(); await tick(0);
    expect(root.querySelector('[data-remaining]').textContent).toBe('2');
    expect(root.querySelector('[data-progress] [role="progressbar"]').getAttribute('aria-valuenow')).toBe('50');
    expect(root.querySelector('[data-feedback]').textContent).toContain('还剩 2');
    check.click(); await tick(0);
    expect(root.querySelector('[data-remaining]').textContent).toBe('3');
    expect(root.querySelector('[data-progress]').getAttribute('value')).toBe('25');
  });

  it('One UI 待办筛选支持全部完成的空状态，重置恢复示例', async (host) => {
    const root = await mount(host, 'oneui-tasks', true);
    root.querySelectorAll('[data-task] input:not(:checked)').forEach((check) => check.click());
    await tick(0);
    Array.from(root.querySelectorAll('ui-segmented button')).find((b) => b.textContent === '待办').click(); await tick(0);
    expect(root.querySelectorAll('[data-task]:not([hidden])').length).toBe(0);
    expect(root.querySelector('[data-empty]').hidden).toBe(false);
    expect(root.querySelector('[data-remaining]').textContent).toBe('0');
    expect(root.querySelector('[data-progress]').getAttribute('value')).toBe('100');
    root.querySelector('[data-reset]').click(); await tick(0);
    expect(root.querySelectorAll('[data-task]:not([hidden])').length).toBe(4);
    expect(root.querySelector('[data-remaining]').textContent).toBe('3');
    expect(root.querySelector('[data-progress]').getAttribute('value')).toBe('25');
    expect(root.querySelector('[data-empty]').hidden).toBe(true);
  });
});

describe('系统 APP · HarmonyOS 设备操作', () => {
  it('HarmonyOS 选择设备更新详情与读屏名称，选择状态互斥', async (host) => {
    const root = await mount(host, 'harmonyos-devices', true);
    root.querySelector('[data-device="tablet"]').click();
    expect(root.querySelector('[data-device-name]').textContent).toBe('随行平板');
    expect(root.querySelectorAll('[data-device][aria-pressed="true"]').length).toBe(1);
    expect(root.querySelector('[data-device="tablet"]').getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-connect]').getAttribute('aria-label')).toContain('随行平板');
    expect(root.querySelector('[data-feedback]').textContent).toContain('已选择随行平板');
  });

  it('HarmonyOS 连接可撤销，切换设备仍保留各自本地连接状态', async (host) => {
    const root = await mount(host, 'harmonyos-devices', true);
    const tablet = root.querySelector('[data-device="tablet"]');
    const connect = root.querySelector('[data-connect]');
    tablet.click(); connect.click();
    expect(tablet.dataset.connected).toBe('true');
    expect(tablet.querySelector('[data-device-state]').textContent).toContain('已连接');
    expect(root.querySelector('[data-connected-count]').textContent).toContain('2');
    root.querySelector('[data-device="headphones"]').click();
    tablet.click();
    expect(connect.getAttribute('aria-pressed')).toBe('true');
    connect.click();
    expect(tablet.dataset.connected).toBe('false');
    expect(root.querySelector('[data-device-status]').textContent).toContain('未连接');
    expect(root.querySelector('[data-feedback]').textContent).toContain('随行平板已断开');
    expect(root.querySelector('[data-connected-count]').textContent).toContain('1');
  });
});

describe('系统 APP · OriginOS 日程操作', () => {
  it('OriginOS 选择日期同步安排列表、模块摘要与选中状态', async (host) => {
    const root = await mount(host, 'originos-agenda', true);
    root.querySelector('[data-date="2026-11-08"]').click();
    expect(root.querySelectorAll('[data-agenda-item]').length).toBe(1);
    expect(root.querySelector('[data-next-title]').textContent).toBe('整理相册');
    expect(root.querySelector('[data-selected-label]').textContent).toContain('11 月 8 日');
    expect(root.querySelector('[data-agenda-count]').textContent).toBe('1');
    expect(root.querySelectorAll('[data-date][aria-pressed="true"]').length).toBe(1);
    expect(root.querySelector('[data-feedback]').textContent).toContain('1 件');
  });

  it('OriginOS 无安排日期显示真实空状态，返回默认日恢复三个安排', async (host) => {
    const root = await mount(host, 'originos-agenda', true);
    root.querySelector('[data-date="2026-11-09"]').click();
    expect(root.querySelectorAll('[data-agenda-item]').length).toBe(0);
    expect(root.querySelector('[data-empty]').hidden).toBe(false);
    expect(getComputedStyle(root.querySelector('[data-empty]')).display === 'none').toBe(false);
    expect(root.querySelector('[data-agenda-count]').textContent).toBe('0');
    root.querySelector('[data-date="2026-11-07"]').click();
    expect(root.querySelectorAll('[data-agenda-item]').length).toBe(3);
    expect(root.querySelector('[data-empty]').hidden).toBe(true);
    expect(root.querySelector('[data-agenda-count]').textContent).toBe('3');
  });
});

describe('系统 APP · Flyme 笔记操作', () => {
  it('Flyme 搜索和筛选的焦点恢复不读取 root 外层笔记记录', async (host) => {
    const actual = [], expected = [];
    for (const focusedControl of ['search', 'filter']) {
      const root = await mount(host, 'flyme-notes', true);
      const context = root.parentElement;
      const outside = document.createElement('article');
      outside.setAttribute('data-note', 'outside');
      outside.innerHTML = '<h2 data-note-title>外层笔记记录</h2>';
      context.before(outside);
      outside.appendChild(context);
      let reads = 0;
      Object.defineProperty(outside, 'hidden', {
        configurable: true,
        get() { reads++; return this.hasAttribute('hidden'); }
      });
      const focused = root.querySelector(focusedControl === 'search' ? '[data-search] input' : '[data-filter="life"]');
      focused.focus();
      root.querySelector('[data-filter="life"]').click();
      actual.push({ reads, focus: document.activeElement === focused, shown: root.querySelectorAll('[data-note]:not([hidden])').length });
      expected.push({ reads: 0, focus: true, shown: 1 });
      expect(root.querySelector('[data-filter="life"]').getAttribute('aria-pressed')).toBe('true');
      expect(root.querySelector('[data-feedback]').textContent).toContain('找到 1 篇');
      const note = root.querySelector('[data-note="life"]');
      const pin = note.querySelector('[data-pin]');
      pin.focus();
      pin.click();
      expect(document.activeElement).toBe(pin);
      expect(note.dataset.pinned).toBe('true');
      expect(pin.getAttribute('aria-pressed')).toBe('true');
      expect(root.querySelector('[data-feedback]').getAttribute('aria-live')).toBe('polite');
      expect(outside.dataset.note).toBe('outside');
    }
    expect(actual).toEqual(expected);
  });

  it('Flyme 委托点击忽略 root 外层的诱饵置顶控件', async (host) => {
    const root = await mount(host, 'flyme-notes', true);
    const feedback = root.querySelector('[data-feedback]');
    const before = feedback.textContent;
    root.querySelector('h1').click();
    expect(feedback.textContent).toBe(before);
    const context = root.parentElement;
    const outside = document.createElement('article');
    outside.setAttribute('data-pin', '');
    outside.setAttribute('data-note', 'outside');
    outside.setAttribute('data-pinned', 'false');
    outside.innerHTML = '<h2 data-note-title>外层诱饵笔记</h2>';
    context.before(outside);
    outside.appendChild(context);
    root.querySelector('h1').click();
    expect({ pinned: outside.dataset.pinned, feedback: feedback.textContent }).toEqual({ pinned: 'false', feedback: before });
    const note = root.querySelector('[data-note="work"]');
    note.querySelector('button[data-pin] span').click();
    expect(note.dataset.pinned).toBe('true');
    expect(note.querySelector('[data-pin]').getAttribute('aria-pressed')).toBe('true');
    expect(outside.dataset.pinned).toBe('false');
  });

  it('Flyme 孤立置顶控件忽略 root 外层或缺失的所属笔记', async (host) => {
    const actual = [], expected = [], errors = [];
    const onError = (event) => errors.push(event.message);
    window.addEventListener('error', onError);
    try {
      for (const hasRecord of [true, false]) {
        const root = await mount(host, 'flyme-notes', true);
        const feedback = root.querySelector('[data-feedback]');
        expected.push({ pinned: 'false', feedback: feedback.textContent });
        const context = root.parentElement;
        const outside = document.createElement('article');
        if (hasRecord) outside.setAttribute('data-note', 'outside');
        outside.setAttribute('data-pinned', 'false');
        outside.innerHTML = '<h2 data-note-title>外层记录笔记</h2>';
        context.before(outside);
        outside.appendChild(context);
        const orphan = document.createElement('button');
        orphan.setAttribute('data-pin', '');
        orphan.innerHTML = '<span>孤立置顶</span>';
        root.appendChild(orphan);
        orphan.firstElementChild.click();
        actual.push({ pinned: outside.dataset.pinned, feedback: feedback.textContent });
      }
    } finally {
      window.removeEventListener('error', onError);
    }
    expect({ actual, errors }).toEqual({ actual: expected, errors: [] });
  });

  it('Flyme 搜索与分类真实组合过滤笔记，空结果可以恢复', async (host) => {
    const root = await mount(host, 'flyme-notes', true);
    input(root, '项目');
    expect(root.querySelectorAll('[data-note]:not([hidden])').length).toBe(1);
    root.querySelector('[data-filter="idea"]').click();
    expect(root.querySelectorAll('[data-note]:not([hidden])').length).toBe(0);
    expect(root.querySelector('[data-empty]').hidden).toBe(false);
    expect(getComputedStyle(root.querySelector('[data-empty]')).display === 'none').toBe(false);
    input(root, ''); root.querySelector('[data-filter="all"]').click();
    expect(root.querySelectorAll('[data-note]:not([hidden])').length).toBe(4);
    expect(root.querySelector('[data-note-count]').textContent).toContain('4');
  });

  it('Flyme 置顶切换同步标签与已置顶筛选，全部取消时显示空状态', async (host) => {
    const root = await mount(host, 'flyme-notes', true);
    const pin = root.querySelector('[data-note="work"] [data-pin]');
    pin.click();
    expect(pin.getAttribute('aria-pressed')).toBe('true');
    expect(pin.getAttribute('aria-label')).toContain('取消置顶');
    expect(root.querySelector('[data-feedback]').textContent).toContain('已置顶');
    root.querySelector('[data-filter="pinned"]').click();
    expect(root.querySelectorAll('[data-note]:not([hidden])').length).toBe(2);
    pin.click(); root.querySelector('[data-note="walk"] [data-pin]').click();
    expect(root.querySelectorAll('[data-note]:not([hidden])').length).toBe(0);
    expect(root.querySelector('[data-empty]').hidden).toBe(false);
  });

  it('Flyme 置顶重排保留键盘焦点，取消后恢复稳定原顺序', async (host) => {
    const root = await mount(host, 'flyme-notes', true);
    const pin = root.querySelector('[data-note="life"] [data-pin]');
    pin.focus(); pin.click();
    expect(document.activeElement).toBe(pin);
    expect(Array.from(root.querySelectorAll('[data-note]')).map((n) => n.dataset.note)).toEqual(['walk', 'life', 'work', 'colors']);
    pin.click();
    expect(document.activeElement).toBe(pin);
    expect(Array.from(root.querySelectorAll('[data-note]')).map((n) => n.dataset.note)).toEqual(['walk', 'work', 'life', 'colors']);
  });
});
