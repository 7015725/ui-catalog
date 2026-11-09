/* =========================================================
   动效（第三批）：展开 / 跟手类交互
   ui-stack-expand  叠放展开      ui-checklist     进度清单
   ui-h-accordion   横向手风琴    ui-tray          托盘明细
   ui-dock          放大坞        ui-pull-summary  下拉摘要
   ========================================================= */
import { UIElement, register } from './base.js';
import { reduced } from '../lib/motion.js';
import { esc, splitList } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const SR = '.ui-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';
const TONES = ['brand', 'accent', 'ok', 'warn', 'danger'];
const tone = (t, i) => 'var(--ui-' + (TONES.indexOf(t) > -1 ? t : TONES[i % TONES.length]) + ')';
let uid = 0;

/** 解析 JSON 数组；失败时把逗号分隔的字符串交给 fallback 逐项转换 */
function list(raw, fallback) {
  const s = String(raw || '').trim();
  if (s.charAt(0) === '[') {
    try { const v = JSON.parse(s); if (Array.isArray(v)) return v; } catch (e) { /* 退回逗号分隔 */ }
    return [];
  }
  return splitList(s).map(fallback);
}

/* 元素被移走再插回时（画廊重排、框架移动节点），重新挂上观察器 */
class Live extends UIElement {
  connectedCallback() { super.connectedCallback(); if (this._booted && this._attach) this._attach(); }
  disconnectedCallback() { if (this._detach) this._detach(); }
}

/* ---------------- Stack Expand 叠放展开 ---------------- */
export const stackExpandCss = `
ui-stack-expand{display:inline-block;max-width:100%;vertical-align:middle}
${SR}
.ui-sx{display:flex;flex-wrap:wrap;align-items:center;row-gap:8px;max-width:100%;margin:0;padding:4px;border:0;background:none;
  font:inherit;color:var(--ui-text);text-align:left;cursor:pointer;border-radius:calc(var(--s) / 2 + 6px)}
.ui-sx:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-sx__it,.ui-sx__more{display:inline-flex;align-items:center;flex:none;max-width:16em;margin-left:calc(var(--s) / -3);
  border-radius:var(--ui-radius-pill);transition:margin .42s var(--ui-ease),padding .42s var(--ui-ease),max-width .42s var(--ui-ease),opacity .3s,background-color .3s;
  transition-delay:calc(var(--ri) * 38ms)}
.ui-sx > :first-child{margin-left:0}
.ui-sx__av{display:grid;place-items:center;flex:none;width:var(--s);height:var(--s);border-radius:50%;
  background:color-mix(in srgb,var(--t) 26%,var(--ui-panel));color:var(--ui-text);box-shadow:0 0 0 2px var(--ui-panel);
  font-size:calc(var(--s) * .4);font-weight:700;line-height:1}
.ui-sx__nm{max-width:0;overflow:hidden;opacity:0;white-space:nowrap;font-size:13px;font-weight:600;
  transition:max-width .42s var(--ui-ease),opacity .25s,padding .42s var(--ui-ease);transition-delay:inherit}
.ui-sx__it.is-extra{max-width:0;margin-left:0;opacity:0;overflow:hidden}
.ui-sx__more{justify-content:center;width:var(--s);height:var(--s);overflow:hidden;border-radius:50%;background:var(--ui-panel-2);
  color:var(--ui-sub);box-shadow:0 0 0 2px var(--ui-panel);font-size:calc(var(--s) * .34);font-weight:700}
.ui-sx.is-open .ui-sx__it{margin-left:6px;padding-right:12px;background:var(--ui-panel-2);transition-delay:calc(var(--i) * 45ms)}
.ui-sx.is-open > :first-child{margin-left:0}
.ui-sx.is-open .ui-sx__it.is-extra{max-width:16em;opacity:1}
.ui-sx.is-open .ui-sx__nm{max-width:9em;padding-left:8px;opacity:1}
.ui-sx.is-open .ui-sx__more{max-width:0;width:0;margin-left:0;opacity:0;box-shadow:none}
`;

export class UIStackExpand extends UIElement {
  static props = {
    items: { default: '' }, max: { default: '4' }, size: { default: '40' },
    label: { default: '成员' }, open: { type: 'boolean', default: false }
  };
  template(p) {
    const items = list(p.items, (x) => ({ name: x })).map((x) => (typeof x === 'string' ? { name: x } : x || {})).filter((x) => x.name);
    const n = items.length;
    const max = clamp(Math.round(Number(p.max)) || 4, 1, Math.max(1, n));
    const more = n - max;
    const S = clamp(Number(p.size) || 40, 24, 72);
    this._n = n;
    return '<button type="button" class="ui-sx ui-mo' + (p.open ? ' is-open' : '') + '" aria-expanded="' + p.open + '" style="--s:' + S + 'px">' +
      items.map((it, i) => {
        const ini = Array.from(String(it.short || it.name))[0];
        return '<span class="ui-sx__it' + (i >= max ? ' is-extra' : '') + '" aria-hidden="true" style="--i:' + i + ';--ri:' + (n - 1 - i) + ';--t:' + tone(it.tone, i) + '">' +
          '<span class="ui-sx__av">' + esc(ini) + '</span><span class="ui-sx__nm">' + esc(it.name) + '</span></span>';
      }).join('') +
      (more > 0 ? '<span class="ui-sx__more" style="--ri:0">+' + more + '</span>' : '') +
      '<span class="ui-sr">' + esc(p.label) + '，共 ' + n + ' 人：' + esc(items.map((x) => x.name).join('、')) + '</span></button>';
  }
  mounted() {
    const self = this;
    this.querySelector('.ui-sx').addEventListener('click', () => self.toggle());
  }
  get isOpen() { const b = this.querySelector('.ui-sx'); return !!b && b.classList.contains('is-open'); }
  /** 展开 / 收起；不回写 open 属性，避免重渲染打断过渡 */
  toggle(force) {
    const b = this.querySelector('.ui-sx');
    if (!b) return;
    const open = typeof force === 'boolean' ? force : !b.classList.contains('is-open');
    b.classList.toggle('is-open', open);
    b.setAttribute('aria-expanded', String(open));
    emit(this, 'toggle', { open: open, count: this._n });
  }
}
register('ui-stack-expand', UIStackExpand, stackExpandCss);

/* ---------------- Checklist 进度清单（背景填充即进度） ---------------- */
export const checklistCss = `
ui-checklist{display:block}
${SR}
.ui-cl{position:relative;overflow:hidden;padding:14px 16px 10px;border-radius:var(--ui-radius-lg);background:var(--ui-panel);
  border:var(--ui-border-w) solid var(--ui-line);box-shadow:var(--ui-shadow-sm);color:var(--ui-text);isolation:isolate;
  transition:box-shadow .5s var(--ui-ease),border-color .5s,filter .5s}
.ui-cl__fill{position:absolute;left:0;top:0;bottom:0;z-index:-1;width:var(--pct,0%);
  background:color-mix(in srgb,var(--ui-brand) 13%,transparent);
  box-shadow:inset -2px 0 0 color-mix(in srgb,var(--ui-brand) 45%,transparent);
  transition:width .7s var(--ui-ease),background-color .5s,box-shadow .5s}
.ui-cl__hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:6px}
.ui-cl__t{font-weight:700;font-size:15px}
.ui-cl__n{font-family:var(--ui-mono);font-size:12.5px;font-variant-numeric:tabular-nums;color:var(--ui-text)}
.ui-cl__list{list-style:none;margin:0;padding:0}
.ui-cl__it{display:flex;align-items:center;gap:10px;min-height:36px;cursor:pointer;font-size:14px}
.ui-cl__it input{flex:none;width:18px;height:18px;margin:0;accent-color:var(--ui-brand);cursor:pointer}
.ui-cl__it input:focus-visible{outline:none;box-shadow:var(--ui-ring);border-radius:4px}
.ui-cl__tx{text-decoration:line-through transparent;text-decoration-thickness:1.5px;transition:text-decoration-color .3s}
.ui-cl__it input:checked + .ui-cl__tx{text-decoration-color:var(--ui-sub)}
.ui-cl.is-done{border-color:color-mix(in srgb,var(--ui-ok) 55%,var(--ui-line));filter:brightness(1.05);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--ui-ok) 20%,transparent),var(--ui-shadow-sm)}
.ui-cl.is-done .ui-cl__fill{background:color-mix(in srgb,var(--ui-ok) 15%,transparent);box-shadow:none}
`;

export class UIChecklist extends UIElement {
  static props = { items: { default: '' }, done: { default: '' }, title: { default: '完成进度' } };
  template(p) {
    const items = list(p.items, (x) => ({ text: x })).map((x) => (typeof x === 'string' ? { text: x } : x || {})).filter((x) => x.text);
    const pre = splitList(p.done).map(Number);
    this._items = items;
    this._set = new Set(items.map((x, i) => (x.done || pre.indexOf(i) > -1 ? i : -1)).filter((i) => i > -1));
    const id = this._id || (this._id = 'ui-cl-' + (++uid));
    return '<div class="ui-cl ui-mo"><div class="ui-cl__fill" aria-hidden="true"></div>' +
      '<div class="ui-cl__hd"><span class="ui-cl__t" id="' + id + '">' + esc(p.title) + '</span><span class="ui-cl__n"></span></div>' +
      '<ul class="ui-cl__list" aria-labelledby="' + id + '">' +
      items.map((it, i) => '<li><label class="ui-cl__it"><input type="checkbox" data-i="' + i + '"' + (this._set.has(i) ? ' checked' : '') + '><span class="ui-cl__tx">' + esc(it.text) + '</span></label></li>').join('') +
      '</ul><span class="ui-sr" role="status" aria-live="polite"></span></div>';
  }
  mounted() {
    const self = this;
    this._sync(false);
    this.querySelector('.ui-cl__list').addEventListener('change', (e) => {
      e.stopPropagation(); // 内部 checkbox 的原生 change 不外泄，对外只派发带 detail 的 change
      const i = Number(e.target.dataset.i);
      if (e.target.checked) self._set.add(i); else self._set.delete(i);
      self._sync(true);
    });
  }
  get value() { return Array.from(this._set || []).sort((a, b) => a - b); }
  get progress() { const n = (this._items || []).length; return n ? this._set.size / n : 0; }
  _sync(user) {
    const box = this.querySelector('.ui-cl');
    if (!box) return;
    const n = this._items.length, k = this._set.size, pct = n ? Math.round(k / n * 100) : 0;
    const complete = n > 0 && k === n;
    box.style.setProperty('--pct', pct + '%');
    box.querySelector('.ui-cl__n').textContent = k + ' / ' + n + ' · ' + pct + '%';
    const was = box.classList.contains('is-done');
    box.classList.toggle('is-done', complete);
    if (!user) return;
    box.querySelector('.ui-sr').textContent = complete ? '全部完成' : '已完成 ' + k + ' / ' + n;
    emit(this, 'change', { done: this.value, count: k, total: n, complete: complete });
    if (complete && !was) emit(this, 'complete', { total: n });
  }
}
register('ui-checklist', UIChecklist, checklistCss);

/* ---------------- H-Accordion 横向手风琴 ---------------- */
export const hAccordionCss = `
ui-h-accordion{display:block;container-type:inline-size}
.ui-ha{display:flex;gap:8px;height:var(--h,240px)}
.ui-ha__p{position:relative;flex:1 1 0;min-width:0;overflow:hidden;border-radius:var(--ui-radius-lg);
  background:color-mix(in srgb,var(--t) 10%,var(--ui-panel-2));border:var(--ui-border-w) solid var(--ui-line);
  transition:flex-grow .55s var(--ui-ease),background-color .4s}
.ui-ha__p.is-on{flex-grow:5;background:color-mix(in srgb,var(--t) 14%,var(--ui-panel))}
.ui-ha__btn{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;width:100%;
  padding:14px 0;border:0;border-radius:inherit;background:none;color:var(--ui-text);font:inherit;cursor:pointer}
.ui-ha__btn:focus-visible{outline:2px solid var(--ui-brand);outline-offset:-4px}
.ui-ha__no{font-family:var(--ui-mono);font-size:12px;font-weight:600}
.ui-ha__vt{writing-mode:vertical-rl;white-space:nowrap;font-size:15px;font-weight:700;letter-spacing:.12em}
.ui-ha__no,.ui-ha__vt{transition:opacity .2s .15s}
.ui-ha__p.is-on .ui-ha__no,.ui-ha__p.is-on .ui-ha__vt{opacity:0;transition-delay:0s}
.ui-ha__dot{width:8px;height:8px;border-radius:50%;background:var(--t)}
.ui-ha__c{position:absolute;inset:0;padding:18px 20px;overflow:hidden;pointer-events:none;
  opacity:0;visibility:hidden;transform:translateY(10px);transition:opacity .18s,transform .18s,visibility 0s .18s}
.ui-ha__p.is-on .ui-ha__c{opacity:1;visibility:visible;transform:none;
  transition:opacity .35s .32s,transform .45s .32s var(--ui-ease),visibility 0s .32s}
.ui-ha__in{min-width:200px}
.ui-ha__tt{display:block;font-size:20px;font-weight:800;color:var(--ui-text)}
.ui-ha__sub{display:inline-block;margin-top:6px;padding:2px 8px;border-radius:var(--ui-radius-pill);font-size:12px;font-weight:600;
  background:color-mix(in srgb,var(--t) 18%,var(--ui-panel));color:var(--ui-text)}
.ui-ha__bd{margin:10px 0 0;font-size:13px;line-height:1.65;color:var(--ui-text)}
@container (max-width:479px){
  .ui-ha{flex-direction:column;height:auto}
  .ui-ha__p{flex:none}
  .ui-ha__btn{position:relative;inset:auto;flex-direction:row;justify-content:flex-start;gap:12px;min-height:48px;padding:0 16px}
  .ui-ha__vt{writing-mode:horizontal-tb}
  .ui-ha__dot{margin-left:auto}
  .ui-ha__p.is-on .ui-ha__no,.ui-ha__p.is-on .ui-ha__vt{opacity:1}
  .ui-ha__c{position:static;display:none;padding:0 16px 16px;pointer-events:auto}
  .ui-ha__p.is-on .ui-ha__c{display:block}
  .ui-ha__in{min-width:0}
  .ui-ha__tt{display:none}
}
`;

export class UIHAccordion extends UIElement {
  static props = { items: { default: '' }, active: { default: '-1' }, height: { default: '240' } };
  template(p) {
    const items = list(p.items, (x) => ({ title: x })).map((x) => (typeof x === 'string' ? { title: x } : x || {})).filter((x) => x.title);
    const a = Math.round(Number(p.active));
    const id = this._id || (this._id = 'ui-ha-' + (++uid));
    this._len = items.length;
    return '<div class="ui-ha ui-mo" style="--h:' + clamp(Number(p.height) || 240, 140, 600) + 'px">' +
      items.map((it, i) => {
        const on = i === a;
        return '<div class="ui-ha__p' + (on ? ' is-on' : '') + '" style="--t:' + tone(it.tone, i) + '">' +
          '<button type="button" class="ui-ha__btn" id="' + id + '-b' + i + '" data-i="' + i + '" aria-expanded="' + on + '" aria-controls="' + id + '-c' + i + '">' +
          '<span class="ui-ha__no" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span><span class="ui-ha__vt">' + esc(it.title) + '</span><span class="ui-ha__dot" aria-hidden="true"></span></button>' +
          '<div class="ui-ha__c" id="' + id + '-c' + i + '" role="region" aria-labelledby="' + id + '-b' + i + '"><div class="ui-ha__in">' +
          '<span class="ui-ha__tt" aria-hidden="true">' + esc(it.title) + '</span>' +
          (it.sub ? '<span class="ui-ha__sub">' + esc(it.sub) + '</span>' : '') +
          (it.body ? '<p class="ui-ha__bd">' + esc(it.body) + '</p>' : '') + '</div></div></div>';
      }).join('') + '</div>';
  }
  mounted() {
    const self = this, root = this.querySelector('.ui-ha');
    root.addEventListener('click', (e) => {
      const b = e.target.closest('.ui-ha__btn');
      if (b) self.select(Number(b.dataset.i));
    });
    root.addEventListener('keydown', (e) => {
      const b = e.target.closest('.ui-ha__btn');
      if (!b) return;
      const btns = Array.from(root.querySelectorAll('.ui-ha__btn')), i = btns.indexOf(b);
      const k = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: btns.length - 1 }[e.key];
      if (k == null) return;
      e.preventDefault();
      btns[(k + btns.length) % btns.length].focus();
    });
  }
  get active() { const ps = Array.from(this.querySelectorAll('.ui-ha__p')); return ps.findIndex((x) => x.classList.contains('is-on')); }
  /** 展开第 i 条；再次选中已展开的条目则全部收回等宽 */
  select(i) {
    const ps = Array.from(this.querySelectorAll('.ui-ha__p'));
    const open = !(ps[i] && ps[i].classList.contains('is-on'));
    ps.forEach((p, k) => {
      const on = open && k === i;
      p.classList.toggle('is-on', on);
      p.querySelector('.ui-ha__btn').setAttribute('aria-expanded', String(on));
    });
    emit(this, 'change', { index: open ? i : -1 });
  }
}
register('ui-h-accordion', UIHAccordion, hAccordionCss);

/* ---------------- Tray 托盘明细 ---------------- */
export const trayCss = `
ui-tray{display:block}
.ui-tr{--tray:color-mix(in srgb,var(--ui-panel-2) 20%,#000);--tray-tx:color-mix(in srgb,var(--ui-panel-2) 10%,#fff);
  --tray-sub:color-mix(in srgb,var(--ui-panel-2) 32%,#fff)}
.ui-tr__main{position:relative;z-index:1;padding:16px;border-radius:var(--ui-radius-lg);background:var(--ui-panel);
  border:var(--ui-border-w) solid var(--ui-line);box-shadow:var(--ui-shadow-sm);color:var(--ui-text)}
.ui-tr__tray{margin:calc(var(--ui-radius-lg) * -1) 10px 0;padding-top:var(--ui-radius-lg);border-radius:0 0 var(--ui-radius-lg) var(--ui-radius-lg);
  background:var(--tray);color:var(--tray-tx);box-shadow:var(--ui-shadow-sm)}
.ui-tr__bar{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:40px;padding:8px 14px;
  border:0;border-radius:0 0 var(--ui-radius-lg) var(--ui-radius-lg);background:none;color:inherit;font:inherit;font-size:13px;text-align:left;cursor:pointer}
.ui-tr__bar:focus-visible{outline:2px solid var(--tray-tx);outline-offset:-4px}
.ui-tr__chev{flex:none;transition:transform .4s var(--ui-ease)}
.ui-tr.is-open .ui-tr__chev{transform:rotate(180deg)}
.ui-tr__body{display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows .45s var(--ui-ease),visibility 0s .45s}
.ui-tr.is-open .ui-tr__body{grid-template-rows:1fr;visibility:visible;transition:grid-template-rows .45s var(--ui-ease),visibility 0s}
.ui-tr__clip{min-height:0;overflow:hidden}
.ui-tr__list{list-style:none;margin:0;padding:0 14px 10px}
.ui-tr__list li{display:flex;justify-content:space-between;gap:12px;padding:9px 0;font-size:13px;
  border-top:1px solid color-mix(in srgb,var(--tray-tx) 16%,transparent);opacity:0;transform:translateY(-6px);transition:opacity .2s,transform .2s}
.ui-tr.is-open .ui-tr__list li{opacity:1;transform:none;transition:opacity .3s calc(var(--i) * 45ms + .12s),transform .35s calc(var(--i) * 45ms + .12s) var(--ui-ease)}
.ui-tr__list span{color:var(--tray-sub);min-width:0}
.ui-tr__list b{flex:none;font-weight:600;font-variant-numeric:tabular-nums}
`;

export class UITray extends UIElement {
  static props = { summary: { default: '查看明细' }, items: { default: '' }, open: { type: 'boolean', default: false } };
  template(p) {
    const items = list(p.items, (x) => { const k = x.indexOf(':'); return k > -1 ? { label: x.slice(0, k), value: x.slice(k + 1) } : { label: x, value: '' }; })
      .filter((x) => x && x.label);
    const id = this._id || (this._id = 'ui-tr-' + (++uid));
    return '<div class="ui-tr ui-mo' + (p.open ? ' is-open' : '') + '"><div class="ui-tr__main"><slot></slot></div>' +
      '<div class="ui-tr__tray"><button type="button" class="ui-tr__bar" aria-expanded="' + p.open + '" aria-controls="' + id + '">' +
      '<span>' + esc(p.summary) + '</span><span class="ui-tr__chev" aria-hidden="true">▾</span></button>' +
      '<div class="ui-tr__body" id="' + id + '"><div class="ui-tr__clip"><ul class="ui-tr__list">' +
      items.map((it, i) => '<li style="--i:' + i + '"><span>' + esc(it.label) + '</span><b>' + esc(it.value) + '</b></li>').join('') +
      '</ul></div></div></div></div>';
  }
  mounted() {
    const self = this;
    this.querySelector('.ui-tr__bar').addEventListener('click', () => self.toggle());
  }
  get isOpen() { const r = this.querySelector('.ui-tr'); return !!r && r.classList.contains('is-open'); }
  toggle(force) {
    const r = this.querySelector('.ui-tr');
    if (!r) return;
    const open = typeof force === 'boolean' ? force : !r.classList.contains('is-open');
    r.classList.toggle('is-open', open);
    r.querySelector('.ui-tr__bar').setAttribute('aria-expanded', String(open));
    emit(this, 'toggle', { open: open });
  }
}
register('ui-tray', UITray, trayCss);

/* ---------------- Dock 放大坞 ---------------- */
export const dockCss = `
ui-dock{display:block;width:100%;max-width:100%}
${SR}
.ui-dk{position:relative;display:flex;align-items:flex-end;justify-content:center;gap:var(--g);width:max-content;max-width:100%;margin:0 auto;
  padding:calc(var(--b) * (var(--m) - 1) + 30px) 10px 8px;touch-action:none;user-select:none;-webkit-user-select:none}
.ui-dk::before{content:"";position:absolute;left:0;right:0;bottom:0;height:calc(var(--b) + 16px);
  border-radius:calc(var(--b) * .32 + 8px);background:color-mix(in srgb,var(--ui-panel) 86%,transparent);
  border:var(--ui-border-w) solid var(--ui-line);box-shadow:var(--ui-shadow);backdrop-filter:blur(var(--ui-blur));-webkit-backdrop-filter:blur(var(--ui-blur))}
.ui-dk__it{position:relative;display:grid;place-items:center;flex:none;width:var(--sz,var(--b));height:var(--sz,var(--b));padding:0;
  border:0;border-radius:28%;background:color-mix(in srgb,var(--t) 24%,var(--ui-panel));color:var(--ui-text);cursor:pointer;
  font:inherit;font-size:calc(var(--sz,var(--b)) * .5);line-height:1;box-shadow:var(--ui-shadow-sm);
  transition:width .2s var(--ui-ease),height .2s var(--ui-ease),font-size .2s var(--ui-ease)}
.ui-dk.is-track .ui-dk__it{transition-duration:.07s;transition-timing-function:linear}
.ui-dk__it:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-dk__it.is-sel::after{content:"";position:absolute;left:50%;bottom:-7px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--ui-text)}
.ui-dk__tip{position:absolute;z-index:2;left:0;top:0;padding:3px 9px;border-radius:var(--ui-radius-sm);background:var(--ui-text);color:var(--ui-bg);
  font-size:12px;font-weight:600;white-space:nowrap;pointer-events:none;opacity:0;transform:translateX(-50%);transition:opacity .15s}
.ui-dk__tip.is-on{opacity:1}
`;

export class UIDock extends Live {
  static props = {
    items: { default: '' }, size: { default: '44' }, magnify: { default: '1.8' },
    value: { default: '' }, label: { default: '应用栏' }
  };
  template(p) {
    const items = list(p.items, (x) => { const a = Array.from(x.trim()); const k = x.trim().indexOf(' '); return k > 0 ? { icon: x.trim().slice(0, k), label: x.trim().slice(k + 1) } : { icon: a[0], label: x.trim() }; })
      .map((x) => x || {}).filter((x) => x.label);
    this._items = items;
    const v = p.value === '' ? -1 : Math.round(Number(p.value));
    this._sel = v >= 0 && v < items.length ? v : -1;
    this._m = clamp(Number(p.magnify) || 1.8, 1, 2.5);
    this._size = clamp(Number(p.size) || 44, 28, 72);
    const focus = this._sel > -1 ? this._sel : 0;
    return '<div class="ui-dk ui-mo" role="toolbar" aria-label="' + esc(p.label) + '" style="--b:' + this._size + 'px;--g:' + Math.round(this._size * 0.18) + 'px;--m:' + this._m + '">' +
      '<span class="ui-dk__tip" aria-hidden="true"></span>' +
      items.map((it, i) => '<button type="button" class="ui-dk__it' + (i === this._sel ? ' is-sel' : '') + '" data-i="' + i + '" tabindex="' + (i === focus ? 0 : -1) + '"' +
        ' aria-pressed="' + (i === this._sel) + '" style="--t:' + tone(it.tone, i) + '"><span aria-hidden="true">' + esc(it.icon || '') + '</span><span class="ui-sr">' + esc(it.label) + '</span></button>').join('') +
      '<span class="ui-sr" aria-live="polite"></span></div>';
  }
  mounted() {
    const self = this, root = this.querySelector('.ui-dk');
    let raf = 0, px = null, down = false;
    this._frame = () => raf;
    const flush = () => { raf = 0; if (px !== null) self._magnify(px); };
    const at = (x) => { px = x; if (!raf) raf = requestAnimationFrame(flush); };
    this._cancel = () => { if (raf) cancelAnimationFrame(raf); raf = 0; px = null; };
    root.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || down) at(e.clientX); });
    root.addEventListener('pointerdown', (e) => {
      down = true;
      root.classList.add('is-track');
      try { root.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件没有真实指针 */ }
      at(e.clientX);
    });
    root.addEventListener('pointerup', (e) => {
      if (!down) return;
      down = false;
      root.classList.remove('is-track');
      const i = self._nearest(e.clientX);
      if (i > -1) { self.select(i); self.querySelectorAll('.ui-dk__it')[i].focus({ preventScroll: true }); }
      if (e.pointerType !== 'mouse') self._reset();
    });
    root.addEventListener('pointercancel', () => { down = false; root.classList.remove('is-track'); self._reset(); });
    root.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !down) self._reset(); });
    /* 鼠标点击在 pointerup 里已经处理；这里只处理键盘触发的 click（detail 为 0） */
    root.addEventListener('click', (e) => {
      const b = e.target.closest('.ui-dk__it');
      if (b && e.detail === 0) self.select(Number(b.dataset.i));
    });
    root.addEventListener('keydown', (e) => {
      const btns = Array.from(root.querySelectorAll('.ui-dk__it')), i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      const k = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: btns.length - 1 }[e.key];
      if (k == null) return;
      e.preventDefault();
      self._rove((k + btns.length) % btns.length, true);
    });
    root.addEventListener('focusin', (e) => {
      const b = e.target.closest('.ui-dk__it');
      if (b && b.matches(':focus-visible')) self._focusMagnify(b);
    });
    root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) self._reset(); });
    this._attach();
  }
  _attach() {
    const self = this;
    if (this._ro || typeof ResizeObserver !== 'function' || !this.querySelector('.ui-dk')) return;
    this._ro = new ResizeObserver(() => self._fit());
    this._ro.observe(this);
  }
  _detach() {
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._cancel) this._cancel();
  }
  /** 容器太窄时缩小基础尺寸，保证放大后也不横向溢出 */
  _fit() {
    const root = this.querySelector('.ui-dk');
    const n = this._items.length;
    if (!root || !n) return;
    const avail = this.clientWidth - 20;
    const g = this._size * 0.18;
    const b = Math.max(24, Math.min(this._size, (avail - (n - 1) * g) / (n + 2.3 * (this._m - 1))));
    root.style.setProperty('--b', b.toFixed(1) + 'px');
    root.style.setProperty('--g', Math.round(b * 0.18) + 'px');
    this._b = b;
  }
  _base() { return this._b || this._size; }
  _nearest(x) {
    const btns = Array.from(this.querySelectorAll('.ui-dk__it'));
    let best = -1, d = Infinity;
    btns.forEach((b, i) => { const r = b.getBoundingClientRect(); const dd = Math.abs(r.left + r.width / 2 - x); if (dd < d) { d = dd; best = i; } });
    return best;
  }
  /** 按指针到每个图标中心的距离计算尺寸：余弦衰减，影响半径约 2.6 个图标 */
  _magnify(x) {
    const b = this._base(), R = b * 2.6, M = this._m;
    const btns = Array.from(this.querySelectorAll('.ui-dk__it'));
    const centers = btns.map((el) => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; });
    btns.forEach((el, i) => {
      const d = Math.abs(x - centers[i]);
      const s = d >= R ? 1 : 1 + (M - 1) * (Math.cos(d / R * Math.PI) + 1) / 2;
      el.style.setProperty('--sz', (b * s).toFixed(1) + 'px');
    });
    this._tip(this._nearest(x));
  }
  _focusMagnify(btn) { const r = btn.getBoundingClientRect(); this._magnify(r.left + r.width / 2); }
  _tip(i) {
    const root = this.querySelector('.ui-dk'), tip = root && root.querySelector('.ui-dk__tip');
    const btn = root && root.querySelectorAll('.ui-dk__it')[i];
    if (!tip || !btn) return;
    tip.textContent = this._items[i].label;
    tip.classList.add('is-on');
    const rr = root.getBoundingClientRect(), b = this._base();
    /* 用「放大后的终态」估算位置，避免跟着过渡中的尺寸抖动 */
    const r = btn.getBoundingClientRect();
    tip.style.left = (r.left + r.width / 2 - rr.left) + 'px';
    tip.style.top = Math.max(0, rr.height - 8 - b * this._m - tip.offsetHeight - 8) + 'px';
  }
  _reset() {
    if (this._cancel) this._cancel();
    this.querySelectorAll('.ui-dk__it').forEach((el) => el.style.removeProperty('--sz'));
    const tip = this.querySelector('.ui-dk__tip');
    if (tip) tip.classList.remove('is-on');
  }
  _rove(i, focus) {
    const btns = Array.from(this.querySelectorAll('.ui-dk__it'));
    btns.forEach((b, k) => b.tabIndex = k === i ? 0 : -1);
    if (focus && btns[i]) { btns[i].focus(); this._focusMagnify(btns[i]); }
  }
  get value() { return this._sel; }
  select(i) {
    const btns = Array.from(this.querySelectorAll('.ui-dk__it'));
    if (!btns[i]) return;
    this._sel = i;
    btns.forEach((b, k) => { b.classList.toggle('is-sel', k === i); b.setAttribute('aria-pressed', String(k === i)); });
    this._rove(i, false);
    this.querySelector('.ui-dk > .ui-sr').textContent = '已选中 ' + this._items[i].label;
    emit(this, 'select', { index: i, label: this._items[i].label });
  }
}
register('ui-dock', UIDock, dockCss);

/* ---------------- Pull Summary 下拉摘要 ---------------- */
export const pullSummaryCss = `
ui-pull-summary{display:block}
.ui-ps{position:relative}
.ui-ps__top{position:relative;z-index:2;display:flex;justify-content:center;padding-bottom:10px}
.ui-ps__head{position:relative;overflow:hidden;width:var(--cw,220px);height:40px;max-width:100%;border-radius:20px;
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);box-shadow:var(--ui-shadow);color:var(--ui-text);touch-action:none}
.ui-ps.is-anim .ui-ps__head{transition:width .5s var(--ui-spring,var(--ui-ease)),height .5s var(--ui-spring,var(--ui-ease)),border-radius .45s var(--ui-ease)}
.ui-ps__cap{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:38px;padding:0 16px;border:0;background:none;
  color:inherit;font:inherit;font-size:13.5px;font-weight:600;white-space:nowrap;cursor:grab}
.ui-ps__cap:focus-visible{outline:2px solid var(--ui-brand);outline-offset:-4px;border-radius:18px}
.ui-ps__in{display:inline-flex;align-items:center;gap:8px}
.ui-ps__dot{width:8px;height:8px;border-radius:50%;background:var(--ui-brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--ui-brand) 22%,transparent)}
.ui-ps__chev{font-size:11px;transition:transform .35s var(--ui-ease)}
.ui-ps.is-open .ui-ps__chev{transform:rotate(180deg)}
.ui-ps__panel{position:absolute;left:50%;top:38px;width:var(--fw,100%);transform:translateX(-50%);padding:4px 16px 18px;
  opacity:0;visibility:hidden;transition:visibility 0s .5s}
.ui-ps.is-open .ui-ps__panel,.ui-ps.is-drag .ui-ps__panel{visibility:visible;transition:visibility 0s}
.ui-ps.is-anim .ui-ps__panel{transition:opacity .3s,visibility 0s .5s}
.ui-ps.is-anim.is-open .ui-ps__panel{transition:opacity .35s .12s,visibility 0s}
.ui-ps__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px}
.ui-ps__stat{padding:10px 12px;border-radius:var(--ui-radius);background:var(--ui-panel-2)}
.ui-ps__stat span{display:block;font-size:12px;color:var(--ui-sub)}
.ui-ps__stat b{display:block;margin-top:2px;font-size:22px;font-weight:800;font-variant-numeric:tabular-nums}
.ui-ps__stat small{display:block;margin-top:2px;font-size:11.5px;color:var(--ui-sub)}
.ui-ps__grip{width:36px;height:4px;margin:14px auto 0;border-radius:2px;background:var(--ui-line)}
.ui-ps__body{position:relative}
.ui-ps__dim{position:absolute;inset:-4px;z-index:1;border-radius:var(--ui-radius);background:#000;opacity:0;pointer-events:none}
.ui-ps.is-anim .ui-ps__dim{transition:opacity .45s var(--ui-ease)}
.ui-ps.is-open .ui-ps__dim{pointer-events:auto;cursor:pointer}
`;

export class UIPullSummary extends Live {
  static props = { summary: { default: '今日概览' }, items: { default: '' }, open: { type: 'boolean', default: false }, dim: { default: '0.45' } };
  template(p) {
    const items = list(p.items, (x) => { const k = x.indexOf(':'); return k > -1 ? { label: x.slice(0, k), value: x.slice(k + 1) } : { label: x, value: '' }; })
      .filter((x) => x && x.label);
    const id = this._id || (this._id = 'ui-ps-' + (++uid));
    this._pr = p.open ? 1 : 0;
    this._dim = clamp(Number(p.dim) || 0.45, 0, 0.8);
    return '<div class="ui-ps ui-mo' + (p.open ? ' is-open' : '') + '"><div class="ui-ps__top"><div class="ui-ps__head">' +
      '<button type="button" class="ui-ps__cap" aria-expanded="' + p.open + '" aria-controls="' + id + '"><span class="ui-ps__in">' +
      '<span class="ui-ps__dot" aria-hidden="true"></span><span>' + esc(p.summary) + '</span><span class="ui-ps__chev" aria-hidden="true">▾</span></span></button>' +
      '<div class="ui-ps__panel" id="' + id + '" role="region" aria-label="' + esc(p.summary) + '"><div class="ui-ps__grid">' +
      items.map((it) => '<div class="ui-ps__stat"><span>' + esc(it.label) + '</span><b>' + esc(it.value) + '</b>' + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</div>').join('') +
      '</div><div class="ui-ps__grip" aria-hidden="true"></div></div></div></div>' +
      '<div class="ui-ps__body"><slot></slot><div class="ui-ps__dim" aria-hidden="true"></div></div></div>';
  }
  mounted() {
    const self = this, root = this.querySelector('.ui-ps'), head = root.querySelector('.ui-ps__head'), cap = root.querySelector('.ui-ps__cap');
    let drag = null, moved = false;
    head.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      self._measure();
      drag = { y: e.clientY, p: self._pr };
      moved = false;
      try { head.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件没有真实指针 */ }
    });
    head.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dy = e.clientY - drag.y;
      if (!moved && Math.abs(dy) < 5) return;
      moved = true;
      root.classList.add('is-drag');
      self._apply(clamp(drag.p + dy / Math.max(80, self._m.ph), 0, 1), false);
    });
    const end = () => {
      if (!drag) return;
      root.classList.remove('is-drag');
      if (moved) self.toggle(self._pr > (drag.p ? 0.65 : 0.35));
      drag = null;
    };
    head.addEventListener('pointerup', end);
    head.addEventListener('pointercancel', end);
    /* 拖动之后浏览器仍会补发一次 click，忽略它 */
    cap.addEventListener('click', () => { if (moved) { moved = false; return; } self.toggle(); });
    root.querySelector('.ui-ps__dim').addEventListener('click', () => { self.toggle(false); cap.focus({ preventScroll: true }); });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && self._pr > 0) { e.preventDefault(); self.toggle(false); cap.focus(); }
      else if (e.target === cap && e.key === 'ArrowDown') { e.preventDefault(); self.toggle(true); }
      else if (e.target === cap && e.key === 'ArrowUp') { e.preventDefault(); self.toggle(false); }
    });
    this._measure();
    this._apply(this._pr, false);
    this._attach();
  }
  _attach() {
    const self = this;
    if (this._ro || typeof ResizeObserver !== 'function' || !this.querySelector('.ui-ps')) return;
    let w = 0;
    this._ro = new ResizeObserver(() => {
      if (self.clientWidth === w) return;
      w = self.clientWidth;
      self._measure();
      self._apply(self._pr, false);
    });
    this._ro.observe(this);
  }
  _detach() { if (this._ro) { this._ro.disconnect(); this._ro = null; } }
  /** 量出胶囊宽度、展开宽度与面板高度，拖动时在两者之间插值 */
  _measure() {
    const root = this.querySelector('.ui-ps');
    if (!root) return;
    const top = root.querySelector('.ui-ps__top'), panel = root.querySelector('.ui-ps__panel');
    const fw = Math.max(200, top.clientWidth);
    const cw = Math.min(fw, root.querySelector('.ui-ps__in').offsetWidth + 34);
    panel.style.setProperty('--fw', fw + 'px');
    const rl = parseFloat(getComputedStyle(root).getPropertyValue('--ui-radius-lg')) || 16;
    this._m = { cw: cw, fw: fw, ph: panel.offsetHeight, r: Math.min(20, rl) };
  }
  _apply(p, animate) {
    const root = this.querySelector('.ui-ps');
    if (!root || !this._m) return;
    const m = this._m, head = root.querySelector('.ui-ps__head');
    this._pr = p;
    root.classList.toggle('is-anim', !!animate && !reduced());
    head.style.width = (m.cw + (m.fw - m.cw) * p).toFixed(1) + 'px';
    head.style.height = (40 + m.ph * p).toFixed(1) + 'px';
    head.style.borderRadius = (20 + (m.r - 20) * Math.min(1, p * 2)).toFixed(1) + 'px';
    root.querySelector('.ui-ps__panel').style.opacity = clamp((p - 0.15) / 0.6, 0, 1).toFixed(3);
    root.querySelector('.ui-ps__dim').style.opacity = (this._dim * p).toFixed(3);
  }
  get isOpen() { return this._pr === 1; }
  toggle(force) {
    const root = this.querySelector('.ui-ps');
    if (!root) return;
    const open = typeof force === 'boolean' ? force : this._pr < 1;
    const changed = root.classList.contains('is-open') !== open;
    this._measure();
    root.classList.toggle('is-open', open);
    root.querySelector('.ui-ps__cap').setAttribute('aria-expanded', String(open));
    this._apply(open ? 1 : 0, true);
    if (changed) emit(this, 'toggle', { open: open });
  }
}
register('ui-pull-summary', UIPullSummary, pullSummaryCss);
