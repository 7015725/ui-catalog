import { describe, it, expect, put } from './harness.js';
import { templates, TPL_BASE_CSS } from '../data/templates.js';

function cssDeclarations(host, css) {
  const style = document.createElement('style');
  style.textContent = css;
  host.appendChild(style);
  const declarations = [];
  const inspect = (rules) => {
    for (const rule of rules) {
      if (rule.style) declarations.push({ selector: rule.selectorText, value: rule.style.cssText, outline: rule.style.getPropertyValue('outline') });
      if (rule.cssRules && rule.cssRules.length) inspect(rule.cssRules);
    }
  };
  try { inspect(style.sheet.cssRules); } finally { style.remove(); }
  return declarations;
}

// Token 名中的 -2px 不是 CSS 数值；CSSOM 的 0px 重置可保留，裸值 fallback 仍须拦截。
function hasDesignPixels(value) {
  return Array.from(value.matchAll(/(?:^|[^\w-])([-+]?(?:\d+(?:\.\d+)?|\.\d+))px\b/gi)).some((match) => Number(match[1]) !== 0);
}

function expectTokenCSS(host, template) {
  const rules = cssDeclarations(host, template.css);
  expect(rules.length).toBeGreaterThan(0);
  expect(rules.filter((rule) => hasDesignPixels(rule.value)).map((rule) => rule.selector + ': ' + rule.value)).toEqual([]);
}

async function cssRoot(host, template, theme = 'light') {
  await put(host, '<style>' + TPL_BASE_CSS + template.css + '</style><div data-style="' + template.style + '" data-theme="' + theme + '" data-motion="reduce" style="width:320px;height:640px">' + template.html + '</div>');
  const root = host.querySelector('.t-' + template.id);
  template.init(root);
  return root;
}

// SPEC 2.3 / 3.3：新增模板的设计取值须由 token 驱动，并限定作用域。
describe('系统 APP · SPEC 约束', () => {
  it('系统 APP 焦点描边使用 token，像素检查覆盖复合声明与嵌套规则', async (host) => {
    const dirty = [
      'outline:2px solid var(--ui-brand)',
      'border:2px solid var(--ui-line)',
      'left:-7px;top:.5px',
      'flex:1 0 44px',
      'grid-template-columns:42px minmax(0,1fr)',
      'bottom:var(--ui-space-3px,5px)'
    ];
    const bad = cssDeclarations(host, dirty.map((value, index) => '.t-probe-' + index + '{' + value + '}').join('') + '@media(prefers-reduced-motion:reduce){.t-probe{right:8px}}');
    expect(bad.length).toBe(dirty.length + 1);
    expect(bad.filter((rule) => hasDesignPixels(rule.value)).length).toBe(bad.length);
    const clean = cssDeclarations(host, '.t-probe{outline:var(--ui-size-2px) solid var(--ui-brand);left:calc(var(--ui-space-10px) - var(--ui-space-3px));flex:1 0 var(--ui-ctl-h);grid-template-columns:calc(var(--ui-ctl-h) - var(--ui-size-2px)) minmax(0,1fr)}@media(prefers-reduced-motion:reduce){.t-probe{bottom:var(--ui-space-3px);margin:0}}');
    expect(clean.length).toBe(2);
    expect(clean.filter((rule) => hasDesignPixels(rule.value))).toEqual([]);
    const apps = templates.filter((item) => item.cat === '系统 APP');
    expect(apps.length).toBe(6);
    const failures = [];
    for (const template of apps) {
      const rules = cssDeclarations(host, template.css);
      expect(rules.length).toBeGreaterThan(0);
      const outlines = rules.filter((rule) => rule.outline);
      expect(outlines.length).toBeGreaterThan(0);
      outlines.forEach((rule) => {
        if (hasDesignPixels(rule.outline)) failures.push(template.id + ': ' + rule.outline);
      });
    }
    expect(failures).toEqual([]);
    for (const template of apps) {
      for (const theme of ['light', 'dark']) {
        const root = await cssRoot(host, template, theme);
        const control = root.querySelector('input, button');
        control.focus();
        expect(getComputedStyle(control).outlineWidth).toBe('2px');
        expect(getComputedStyle(control).outlineStyle).toBe('solid');
      }
    }
  });

  it('MIUI 设备描边与装饰位置不写死 px，浅深色保留原尺寸', async (host) => {
    const template = templates.find((item) => item.id === 'miui-settings');
    expectTokenCSS(host, template);
    for (const theme of ['light', 'dark']) {
      const root = await cssRoot(host, template, theme);
      const phone = root.querySelector('.t-miui-settings__phone');
      const decoration = getComputedStyle(phone, '::after');
      expect(getComputedStyle(phone).borderTopWidth).toBe('2px');
      expect([decoration.bottom, decoration.left, decoration.right]).toEqual(['4px', '8px', '8px']);
    }
  });

  it('One UI 勾选标记位置不写死 px，浅深色保留原尺寸', async (host) => {
    const template = templates.find((item) => item.id === 'oneui-tasks');
    expectTokenCSS(host, template);
    for (const theme of ['light', 'dark']) {
      const root = await cssRoot(host, template, theme);
      const check = root.querySelector('[data-task] input');
      check.checked = true;
      const mark = getComputedStyle(check, '::after');
      expect([mark.left, mark.top]).toEqual(['7px', '3px']);
    }
  });

  it('HarmonyOS 设备描边与装饰位置不写死 px，浅深色保留原尺寸', async (host) => {
    const template = templates.find((item) => item.id === 'harmonyos-devices');
    expectTokenCSS(host, template);
    for (const theme of ['light', 'dark']) {
      const root = await cssRoot(host, template, theme);
      const phone = root.querySelector('.t-harmonyos-devices__phone');
      const decoration = getComputedStyle(phone, '::after');
      expect(getComputedStyle(phone).borderTopWidth).toBe('2px');
      expect([decoration.left, decoration.right, decoration.bottom]).toEqual(['8px', '8px', '5px']);
    }
  });

  it('OriginOS 日期基准与时间列不写死 px，浅深色保留原尺寸', async (host) => {
    const template = templates.find((item) => item.id === 'originos-agenda');
    expectTokenCSS(host, template);
    for (const theme of ['light', 'dark']) {
      const root = await cssRoot(host, template, theme);
      expect(getComputedStyle(root.querySelector('button[data-date]')).flexBasis).toBe('44px');
      expect(getComputedStyle(root.querySelector('[data-agenda-item]')).gridTemplateColumns.split(' ')[0]).toBe('42px');
    }
  });

  it('Flyme 分类下划线位置不写死 px，浅深色保留原尺寸', async (host) => {
    const template = templates.find((item) => item.id === 'flyme-notes');
    expectTokenCSS(host, template);
    for (const theme of ['light', 'dark']) {
      const root = await cssRoot(host, template, theme);
      const underline = getComputedStyle(root.querySelector('button[data-filter="all"]'), '::after');
      expect([underline.left, underline.right, underline.bottom]).toEqual(['10px', '10px', '3px']);
    }
  });

  it('新增模板的字体、间距、阴影和控件高度均使用 token，规则不越出模板作用域', (host) => {
    const failures = [];
    const governed = /^(?:(?:padding|margin)(?:-.+)?|gap|row-gap|column-gap|font-size|font-family|font-weight|letter-spacing|line-height|box-shadow|text-shadow|border(?:-.+)?-radius|outline-offset)$/;
    for (const template of templates.filter((item) => item.cat === '系统 APP')) {
      const style = document.createElement('style');
      style.textContent = template.css;
      host.appendChild(style);
      const inspect = (rules) => {
        for (const rule of rules) {
          if (!rule.style && rule.cssRules) { inspect(rule.cssRules); continue; }
          if (!rule.style) continue;
          if (!rule.selectorText.startsWith('.t-' + template.id)) failures.push(template.id + ': unscoped ' + rule.selectorText);
          for (const property of Array.from(rule.style)) {
            const controlSize = /(?:button|input|summary|\.ui-switch|\.ui-check)/.test(rule.selectorText) && /^(?:min-|max-)?(?:height|width)$/.test(property);
            if (!governed.test(property) && !controlSize) continue;
            // CSSOM longhands may be empty when a shorthand contains var().
            const shorthand = property === 'row-gap' || property === 'column-gap' ? 'gap' : property.startsWith('padding-') ? 'padding' : property.startsWith('margin-') ? 'margin' : property.endsWith('-radius') ? 'border-radius' : property;
            const value = (rule.style.getPropertyValue(property) || rule.style.getPropertyValue(shorthand)).trim();
            const reset = /^(?:0(?:px|em|rem|%)?|none|normal|inherit|initial|unset|auto|100%)$/.test(value);
            if (!reset && !value.includes('var(--ui-')) failures.push(template.id + ': ' + property + '=' + value);
          }
        }
      };
      inspect(style.sheet.cssRules);
      style.remove();
    }
    expect(failures).toEqual([]);
  });

  it('init 不访问全局 document，只使用模板根节点及其关联文档', () => {
    const bad = templates.filter((item) => item.cat === '系统 APP' && /\bdocument\s*\./.test(item.init.toString())).map((item) => item.id);
    expect(bad).toEqual([]);
  });

  it('模板中的独立按钮复用 ui-button，而不是重新手写原生按钮组件', () => {
    const ids = ['coui-files', 'oneui-tasks', 'harmonyos-devices', 'originos-agenda', 'flyme-notes'];
    for (const id of ids) {
      const template = templates.find((item) => item.id === id);
      const html = new DOMParser().parseFromString(template.html, 'text/html');
      expect(html.querySelectorAll('button').length).toBe(0);
      expect(!!html.querySelector('ui-button')).toBe(true);
      expect(template.uses.includes('ui-button')).toBe(true);
    }
  });

  it('MIUI 设备概览复用 ui-accordion，支持点击和键盘切换', async (host) => {
    const template = templates.find((item) => item.id === 'miui-settings');
    expect(template.uses.includes('ui-accordion')).toBe(true);
    await put(host, '<style>' + TPL_BASE_CSS + template.css + '</style>' + template.html);
    const root = host.querySelector('.t-miui-settings');
    template.init(root);
    const header = root.querySelector('ui-accordion button');
    const panel = root.querySelector('ui-accordion [role="region"]');
    const initial = panel.hidden;
    header.click();
    expect(panel.hidden).toBe(!initial);
    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(panel.hidden).toBe(initial);
  });
});
