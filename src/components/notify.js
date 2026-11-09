/* =========================================================
   通知与弹出（第二批）
   ui-toaster       堆叠通知（反馈）     ui-island       灵动岛通知（反馈）
   ui-inbox         通知中心（浮层）     ui-action-sheet 动作面板（浮层）
   ui-type-confirm  输入确认（浮层）     ui-tour         新手引导（浮层）
   画廊卡片带 backdrop-filter，会成为 fixed 子元素的包含块，
   所以所有「浮在页面上」的部分都挂到 body，组件移除时一并清理。
   ========================================================= */
import { UIElement, register } from './base.js';
import { reduced } from '../lib/motion.js';
import { FOCUSABLE, trapTab } from '../lib/focus.js';
import { Layer } from '../lib/positioner.js';
import { esc, splitList } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const SR = '.ui-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';
const TONE = { info: 'brand', success: 'ok', ok: 'ok', warn: 'warn', error: 'danger', danger: 'danger', brand: 'brand', accent: 'accent' };
const tone = (t) => 'var(--ui-' + (TONE[t] || 'brand') + ')';
const ICON = { info: 'i', success: '✓', warn: '!', error: '!', loading: '' };
const later = (fn, ms) => (reduced() ? (fn(), 0) : setTimeout(fn, ms));
let uid = 0;

/** JSON 数组；不是 JSON 时按逗号分隔交给 fallback；JSON 写错返回 [] */
function list(raw, fallback) {
  const s = String(raw || '').trim();
  if (s.charAt(0) === '[') {
    try { const v = JSON.parse(s); return Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []; } catch (e) { return []; }
  }
  return splitList(s).map(fallback);
}
/** 插槽里的第一个按钮作为触发器 */
function trigger(host) { return host.querySelector('button, [role="button"], a[href]'); }

/* ================= Toaster 堆叠通知 ================= */
export const toasterCss = `
ui-toaster{display:contents}
${SR}
.ui-tst{position:fixed;z-index:440;width:min(356px,calc(100vw - 32px));pointer-events:none;font-family:var(--ui-font)}
.ui-tst--bottom-right{right:16px;bottom:16px}.ui-tst--bottom-left{left:16px;bottom:16px}
.ui-tst--top-right{right:16px;top:16px}.ui-tst--top-center{left:50%;top:16px;margin-left:max(-178px,calc(-50vw + 16px))}
.ui-tst--bottom-center{left:50%;bottom:16px;margin-left:max(-178px,calc(-50vw + 16px))}
.ui-tst:focus{outline:none}
.ui-tst__list{position:relative;transition:height .35s var(--ui-ease)}
.ui-tst__t{--y:0px;--sx:0px;--sc:1;position:absolute;left:0;right:0;bottom:0;display:grid;grid-template-columns:auto 1fr auto auto;align-items:start;gap:10px;
  padding:12px 12px 12px 14px;pointer-events:auto;overflow:hidden;touch-action:pan-y;user-select:none;
  background:var(--ui-panel);color:var(--ui-text);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);box-shadow:var(--ui-shadow);
  transform-origin:50% 100%;transform:translate3d(var(--sx),calc(var(--y) * -1),0) scale(var(--sc));
  transition:transform .4s var(--ui-ease),opacity .3s,height .35s var(--ui-ease)}
.ui-tst--top-right .ui-tst__t,.ui-tst--top-center .ui-tst__t{bottom:auto;top:0;transform-origin:50% 0;transform:translate3d(var(--sx),var(--y),0) scale(var(--sc))}
.ui-tst__t.is-new{opacity:0;--y:-24px}
.ui-tst--top-right .ui-tst__t.is-new,.ui-tst--top-center .ui-tst__t.is-new{--y:-24px}
.ui-tst__t.is-out{opacity:0;--sc:.92}
.ui-tst__t.is-drag{transition:none}
.ui-tst__t.is-back{height:var(--hh)}
.ui-tst__t.is-back > *{opacity:0;transition:opacity .2s}
.ui-tst__t.is-gone{opacity:0;visibility:hidden}
.ui-tst__ic{display:grid;place-items:center;width:22px;height:22px;margin-top:1px;border-radius:50%;font-size:12px;font-weight:800;
  background:color-mix(in srgb,var(--c) 16%,var(--ui-panel));color:var(--ui-text);box-shadow:inset 0 0 0 1.5px var(--c)}
.ui-tst__t--loading .ui-tst__ic{background:none;box-shadow:none;border:2px solid var(--ui-line);border-top-color:var(--ui-brand);animation:ui-tst-spin .8s linear infinite}
@keyframes ui-tst-spin{to{transform:rotate(360deg)}}
.ui-tst__m{min-width:0}
.ui-tst__ti{display:block;font-size:13.5px;font-weight:600;line-height:1.45}
.ui-tst__d{margin:2px 0 0;font-size:12.5px;line-height:1.55;color:var(--ui-sub)}
.ui-tst__act{align-self:center;padding:5px 10px;border:0;border-radius:var(--ui-radius-sm);background:var(--ui-text);color:var(--ui-bg);
  font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap}
.ui-tst__x{display:grid;place-items:center;width:26px;height:26px;border:0;border-radius:50%;background:none;color:var(--ui-sub);font:inherit;font-size:16px;line-height:1;cursor:pointer}
.ui-tst__x:hover{background:var(--ui-panel-2);color:var(--ui-text)}
.ui-tst__act:focus-visible,.ui-tst__x:focus-visible{outline:none;box-shadow:var(--ui-ring)}
`;

export class UIToaster extends UIElement {
  static props = {
    position: { default: 'bottom-right' }, max: { default: '3' }, duration: { default: '4000' },
    label: { default: '通知' }, hotkey: { default: 'alt+t' }
  };
  template() { return ''; }
  mounted() {
    if (this._root) return;
    const self = this;
    this._items = [];
    this._expanded = false;
    const pos = ['bottom-right', 'bottom-left', 'top-right', 'top-center', 'bottom-center'].indexOf(this.props.position) > -1 ? this.props.position : 'bottom-right';
    const root = document.createElement('section');
    root.className = 'ui-tst ui-mo ui-tst--' + pos;
    root.tabIndex = -1;
    const hk = String(this.props.hotkey || '');
    root.setAttribute('aria-label', this.props.label + (hk ? '（' + hk.replace(/\b\w/g, (m) => m.toUpperCase()) + '）' : ''));
    root.innerHTML = '<div class="ui-tst__list"></div>';
    document.body.appendChild(root);
    this._root = root;
    this._top = pos.indexOf('top') === 0;
    const ol = root.querySelector('.ui-tst__list');
    const expand = (v) => { if (self._expanded === v) return; self._expanded = v; self._layout(); self._timers(!v); };
    ol.addEventListener('pointerenter', () => expand(true));
    ol.addEventListener('pointerleave', () => { if (!root.contains(document.activeElement)) expand(false); });
    root.addEventListener('focusin', () => expand(true));
    root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) expand(false); });
    root.addEventListener('click', (e) => {
      const li = e.target.closest('.ui-tst__t');
      if (!li) return;
      const it = self._find(li.dataset.id);
      if (e.target.closest('.ui-tst__x')) self._remove(it, 'close');
      else if (e.target.closest('.ui-tst__act') && it) {
        emit(self, 'action', { id: it.id, label: it.o.action.label || it.o.action });
        if (typeof it.o.action.onClick === 'function') it.o.action.onClick(it.id);
        self._remove(it, 'action');
      }
    });
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const li = e.target.closest('.ui-tst__t');
      if (!li) return;
      e.stopPropagation();
      self._remove(self._find(li.dataset.id), 'close');
    });
    this._swipe(ol);
    this._onKey = (e) => {
      if (!hk) return;
      const k = hk.toLowerCase().split('+');
      const want = k[k.length - 1];
      if (e.key.toLowerCase() !== want && e.code.toLowerCase() !== 'key' + want) return;
      if (!!e.altKey !== k.includes('alt') || !!e.ctrlKey !== k.includes('ctrl') || !!e.metaKey !== k.includes('meta') || !!e.shiftKey !== k.includes('shift')) return;
      if (!self._items.length) return;
      e.preventDefault();
      self._back = document.activeElement;
      const b = root.querySelector('.ui-tst__t:not(.is-out) button');
      (b || root).focus();
    };
    document.addEventListener('keydown', this._onKey);
  }
  disconnectedCallback() {
    if (this._items) this._items.forEach((it) => clearTimeout(it.timer));
    if (this._onKey) document.removeEventListener('keydown', this._onKey);
    if (this._root) { this._root.remove(); this._root = null; }
  }
  connectedCallback() { super.connectedCallback(); if (this._booted && !this._root) { this._lastTpl = undefined; this._render(); } }
  _find(id) { return (this._items || []).find((x) => String(x.id) === String(id)); }
  _html(it) {
    const o = it.o, type = ICON[o.type] !== undefined ? o.type : 'info';
    const act = o.action ? (typeof o.action === 'string' ? o.action : o.action.label) : '';
    return '<span class="ui-tst__ic" aria-hidden="true">' + ICON[type] + '</span><div class="ui-tst__m"><span class="ui-tst__ti">' + esc(o.title) + '</span>' +
      (o.desc ? '<p class="ui-tst__d">' + esc(o.desc) + '</p>' : '') + '</div>' +
      (act ? '<button type="button" class="ui-tst__act">' + esc(act) + '</button>' : '<span></span>') +
      '<button type="button" class="ui-tst__x" aria-label="关闭通知">×</button>';
  }
  _norm(o) {
    o = typeof o === 'string' ? { title: o } : Object.assign({}, o || {});
    if (typeof o.action === 'string') o.action = { label: o.action };
    if (ICON[o.type] === undefined) o.type = 'info';
    return o;
  }
  /** 新增一条（或用相同 id 更新已有的一条），返回 id */
  push(opts) {
    if (!this._root) return null;
    const o = this._norm(opts);
    const old = o.id != null && this._find(o.id);
    if (old) { this.update(old.id, o); return old.id; }
    const it = { id: o.id != null ? o.id : 't' + (++uid), o: o, left: 0, timer: 0 };
    const li = document.createElement('div');
    li.className = 'ui-tst__t ui-tst__t--' + o.type + ' is-new';
    li.dataset.id = it.id;
    li.style.setProperty('--c', tone(o.type));
    li.setAttribute('role', o.type === 'error' ? 'alert' : 'status');
    li.setAttribute('aria-atomic', 'true');
    li.innerHTML = this._html(it);
    it.el = li;
    this._root.querySelector('.ui-tst__list').appendChild(li);
    this._items.unshift(it);
    while (this._items.length > 8) this._remove(this._items[this._items.length - 1], 'overflow', true);
    this._arm(it);
    this._layout();
    requestAnimationFrame(() => requestAnimationFrame(() => { li.classList.remove('is-new'); this._layout(); }));
    return it.id;
  }
  update(id, opts) {
    const it = this._find(id);
    if (!it) return;
    it.o = this._norm(Object.assign({}, it.o, { action: undefined, desc: undefined }, typeof opts === 'string' ? { title: opts } : opts));
    it.el.className = 'ui-tst__t ui-tst__t--' + it.o.type;
    it.el.style.setProperty('--c', tone(it.o.type));
    it.el.setAttribute('role', it.o.type === 'error' ? 'alert' : 'status');
    it.el.innerHTML = this._html(it);
    clearTimeout(it.timer);
    this._arm(it);
    this._layout();
  }
  /** 加载中 → 成功 / 失败；success / error 可以是字符串或 (结果) => 字符串 / 对象 */
  promise(p, msgs) {
    const m = msgs || {};
    const id = this.push({ type: 'loading', title: m.loading || '处理中…' });
    const pick = (v, r, def) => (typeof v === 'function' ? v(r) : v || def);
    const pr = typeof p === 'function' ? p() : p;
    Promise.resolve(pr).then(
      (r) => this.update(id, Object.assign({ type: 'success' }, this._norm(pick(m.success, r, '已完成')), { type: 'success' })),
      (e) => this.update(id, Object.assign({ type: 'error' }, this._norm(pick(m.error, e, '操作失败')), { type: 'error' }))
    );
    return pr;
  }
  dismiss(id) { const it = this._find(id); if (it) this._remove(it, 'api'); }
  dismissAll() { (this._items || []).slice().forEach((it) => this._remove(it, 'api')); }
  get count() { return (this._items || []).length; }
  _arm(it) {
    const d = it.o.type === 'loading' ? Infinity : Number(it.o.duration != null ? it.o.duration : this.props.duration);
    it.left = d > 0 ? d : Infinity;
    if (!this._expanded) this._start(it);
  }
  _start(it) {
    clearTimeout(it.timer);
    if (!isFinite(it.left)) return;
    it.at = Date.now();
    it.timer = setTimeout(() => this._remove(it, 'timeout'), it.left);
  }
  /** 展开（悬停 / 聚焦）时全部暂停，收起时按剩余时间继续 */
  _timers(run) {
    (this._items || []).forEach((it) => {
      if (run) this._start(it);
      else if (it.timer) { clearTimeout(it.timer); it.timer = 0; if (isFinite(it.left)) it.left = Math.max(400, it.left - (Date.now() - it.at)); }
    });
  }
  _remove(it, reason, now) {
    if (!it || it.out) return;
    it.out = true;
    clearTimeout(it.timer);
    this._items = this._items.filter((x) => x !== it);
    const hadFocus = it.el.contains(document.activeElement);
    it.el.classList.add('is-out');
    if (it.swipe) it.el.style.setProperty('--sx', it.swipe + 'px');
    const done = () => it.el.remove();
    if (now) done(); else later(done, 260);
    this._layout();
    if (hadFocus) {
      const next = this._root && this._root.querySelector('.ui-tst__t:not(.is-out) button');
      if (next) next.focus();
      else if (this._back && this._back.isConnected) this._back.focus();
      else if (this._root) this._root.focus();
    }
    if (!this._items.length) { this._expanded = false; }
    emit(this, 'dismiss', { id: it.id, reason: reason });
  }
  _layout() {
    if (!this._root) return;
    const ol = this._root.querySelector('.ui-tst__list'), items = this._items;
    const max = clamp(Number(this.props.max) || 3, 1, 8), gap = 10, ex = this._expanded;
    items.forEach((it) => { it.el.classList.remove('is-back'); });
    const hs = items.map((it) => it.el.offsetHeight);
    let y = 0;
    items.forEach((it, k) => {
      const s = it.el.style;
      s.zIndex = String(items.length - k);
      if (ex) {
        s.setProperty('--y', (it.el.classList.contains('is-new') ? y - 24 : y) + 'px');
        s.setProperty('--sc', '1');
        it.el.classList.remove('is-gone');
        it.el.removeAttribute('aria-hidden');
        y += hs[k] + gap;
      } else {
        s.setProperty('--y', (it.el.classList.contains('is-new') ? -24 : k * 12) + 'px');
        s.setProperty('--sc', String(1 - 0.05 * Math.min(k, max)));
        if (k > 0) { it.el.style.setProperty('--hh', hs[0] + 'px'); it.el.classList.add('is-back'); }
        it.el.classList.toggle('is-gone', k >= max);
        if (k >= max) it.el.setAttribute('aria-hidden', 'true'); else it.el.removeAttribute('aria-hidden');
      }
    });
    const n = Math.min(items.length, max);
    ol.style.height = (!items.length ? 0 : ex ? y - gap : hs[0] + (n - 1) * 12) + 'px';
  }
  /** 横向拖动超过 70px 划走 */
  _swipe(ol) {
    const self = this;
    let d = null;
    ol.addEventListener('pointerdown', (e) => {
      const li = e.target.closest('.ui-tst__t');
      if (!li || e.target.closest('button') || e.button > 0) return;
      d = { li: li, x: e.clientX, dx: 0 };
      try { li.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件 */ }
    });
    ol.addEventListener('pointermove', (e) => {
      if (!d) return;
      d.dx = e.clientX - d.x;
      if (Math.abs(d.dx) < 4) return;
      d.li.classList.add('is-drag');
      d.li.style.setProperty('--sx', d.dx + 'px');
      d.li.style.opacity = String(1 - Math.min(0.7, Math.abs(d.dx) / 240));
    });
    const end = () => {
      if (!d) return;
      const li = d.li, it = self._find(li.dataset.id), dx = d.dx;
      d = null;
      li.classList.remove('is-drag');
      li.style.opacity = '';
      if (it && Math.abs(dx) > 70) { it.swipe = dx > 0 ? 420 : -420; self._remove(it, 'swipe'); }
      else li.style.setProperty('--sx', '0px');
    };
    ol.addEventListener('pointerup', end);
    ol.addEventListener('pointercancel', end);
  }
}
register('ui-toaster', UIToaster, toasterCss);

/* ================= Island 灵动岛通知 ================= */
export const islandCss = `
ui-island{display:block}
${SR}
.ui-is{display:flex;justify-content:center;padding:6px 0}
.ui-is__pill{--isl:color-mix(in srgb,var(--ui-text) 6%,#000);--isl-tx:color-mix(in srgb,var(--ui-bg) 8%,#fff);--isl-sub:color-mix(in srgb,var(--ui-bg) 30%,#fff);
  position:relative;overflow:hidden;width:120px;height:34px;max-width:100%;border-radius:20px;background:var(--isl);color:var(--isl-tx);
  box-shadow:0 10px 30px rgba(0,0,0,.25);transition:width .5s var(--ui-spring,var(--ui-ease)),height .5s var(--ui-spring,var(--ui-ease)),border-radius .45s var(--ui-ease)}
.ui-is__idle{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 14px;white-space:nowrap;
  font-size:12.5px;font-weight:600;transition:opacity .2s .2s}
.ui-is__idle i{width:7px;height:7px;border-radius:50%;background:var(--ui-ok);box-shadow:0 0 0 3px color-mix(in srgb,var(--ui-ok) 30%,transparent)}
.ui-is.is-open .ui-is__idle{opacity:0;transition-delay:0s}
.ui-is__card{position:absolute;left:0;top:0;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:14px 16px;
  opacity:0;visibility:hidden;transform:scale(.96);transition:opacity .15s,transform .2s,visibility 0s .2s}
.ui-is.is-open .ui-is__card{opacity:1;visibility:visible;transform:none;transition:opacity .3s .18s,transform .4s .18s var(--ui-ease),visibility 0s}
.ui-is__ic{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;font-size:19px;background:color-mix(in srgb,var(--c) 45%,#000)}
.ui-is__ti{display:block;font-size:14px;font-weight:700;line-height:1.35}
.ui-is__d{display:block;margin-top:2px;font-size:12.5px;line-height:1.5;color:var(--isl-sub)}
.ui-is__act{padding:6px 12px;border:0;border-radius:var(--ui-radius-pill);background:var(--isl-tx);color:var(--isl);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}
.ui-is__act:focus-visible{outline:2px solid var(--isl-tx);outline-offset:2px}
`;

export class UIIsland extends UIElement {
  static props = { idle: { default: '' }, duration: { default: '4000' }, label: { default: '系统通知' } };
  template(p) {
    return '<div class="ui-is ui-mo" role="region" aria-label="' + esc(p.label) + '"><div class="ui-is__pill">' +
      '<div class="ui-is__idle">' + (p.idle ? '<i aria-hidden="true"></i><span>' + esc(p.idle) + '</span>' : '') + '</div>' +
      '<div class="ui-is__card"></div></div><span class="ui-sr" role="status" aria-live="polite"></span></div>';
  }
  mounted() {
    const self = this, box = this.querySelector('.ui-is'), pill = box.querySelector('.ui-is__pill');
    this._q = [];
    this._cur = null;
    this._idleSize();
    pill.addEventListener('pointerenter', () => self._pause(true));
    pill.addEventListener('pointerleave', () => { if (!pill.contains(document.activeElement)) self._pause(false); });
    pill.addEventListener('focusin', () => self._pause(true));
    pill.addEventListener('focusout', (e) => { if (!pill.contains(e.relatedTarget)) self._pause(false); });
    pill.addEventListener('click', (e) => {
      if (!self._cur) return;
      const act = e.target.closest('.ui-is__act');
      if (act) emit(self, 'action', { title: self._cur.title, label: act.textContent });
      self.hide();
    });
    box.addEventListener('keydown', (e) => { if (e.key === 'Escape' && self._cur) { e.stopPropagation(); self.hide(); } });
  }
  disconnectedCallback() { clearTimeout(this._t); clearTimeout(this._nx); this._q = []; this._cur = null; }
  _idleSize() {
    const pill = this.querySelector('.ui-is__pill'), idle = this.querySelector('.ui-is__idle span');
    if (!pill) return;
    pill.style.width = Math.max(120, idle ? idle.offsetWidth + 50 : 0) + 'px';
    pill.style.height = '34px';
    pill.style.borderRadius = '20px';
  }
  get isOpen() { return !!this._cur; }
  /** 显示一条通知；正在显示时排队 */
  notify(opts) {
    const o = typeof opts === 'string' ? { title: opts } : Object.assign({}, opts || {});
    if (!o.title) return;
    if (this._cur) { this._q.push(o); return; }
    this._show(o);
  }
  _show(o) {
    const box = this.querySelector('.ui-is');
    if (!box) return;
    const pill = box.querySelector('.ui-is__pill'), card = box.querySelector('.ui-is__card');
    this._cur = o;
    card.style.setProperty('--c', tone(o.tone));
    card.innerHTML = '<span class="ui-is__ic" aria-hidden="true">' + esc(o.icon || '🔔') + '</span><div><span class="ui-is__ti">' + esc(o.title) + '</span>' +
      (o.desc ? '<span class="ui-is__d">' + esc(o.desc) + '</span>' : '') + '</div>' +
      (o.action ? '<button type="button" class="ui-is__act">' + esc(o.action) + '</button>' : '<span></span>');
    const w = Math.min(380, box.clientWidth - 16);
    card.style.width = w + 'px';
    pill.style.width = w + 'px';
    pill.style.height = card.offsetHeight + 'px';
    pill.style.borderRadius = '28px';
    box.classList.add('is-open');
    box.querySelector('.ui-is > .ui-sr').textContent = o.title + (o.desc ? '，' + o.desc : '');
    this._left = Number(o.duration != null ? o.duration : this.props.duration) || 4000;
    if (!this._paused) this._arm();
    emit(this, 'show', { title: o.title });
  }
  _arm() { clearTimeout(this._t); this._at = Date.now(); this._t = setTimeout(() => this.hide(), this._left); }
  _pause(v) {
    this._paused = v;
    if (!this._cur) return;
    if (v) { clearTimeout(this._t); this._left = Math.max(800, this._left - (Date.now() - this._at)); } else this._arm();
  }
  hide() {
    const box = this.querySelector('.ui-is');
    if (!box || !this._cur) return;
    const pill = box.querySelector('.ui-is__pill');
    const had = pill.contains(document.activeElement);
    clearTimeout(this._t);
    const title = this._cur.title;
    this._cur = null;
    box.classList.remove('is-open');
    this._idleSize();
    if (had) pill.blur();
    if (had && document.activeElement && pill.contains(document.activeElement)) document.activeElement.blur();
    emit(this, 'hide', { title: title });
    if (this._q.length) { const n = this._q.shift(); this._nx = setTimeout(() => this._show(n), reduced() ? 0 : 420); }
  }
}
register('ui-island', UIIsland, islandCss);

/* ================= Inbox 通知中心 ================= */
export const inboxCss = `
ui-inbox{display:inline-block}
.ui-ib__bell{position:relative;display:grid;place-items:center;width:40px;height:40px;padding:0;border:var(--ui-border-w) solid var(--ui-line);border-radius:50%;
  background:var(--ui-panel);color:var(--ui-text);font:inherit;font-size:18px;cursor:pointer;box-shadow:var(--ui-shadow-sm)}
.ui-ib__bell:hover{background:var(--ui-panel-2)}
.ui-ib__bell:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-ib__bell[aria-expanded="true"]{background:var(--ui-brand-soft)}
.ui-ib__ico{display:inline-block;transform-origin:50% 10%}
.ui-ib.is-ring .ui-ib__ico{animation:ui-ib-ring .9s var(--ui-ease)}
@keyframes ui-ib-ring{0%,100%{transform:none}15%{transform:rotate(16deg)}30%{transform:rotate(-14deg)}45%{transform:rotate(10deg)}60%{transform:rotate(-6deg)}75%{transform:rotate(3deg)}}
.ui-ib__badge{position:absolute;top:-4px;right:-6px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--ui-danger);color:var(--ui-on-color);
  box-shadow:0 0 0 2px var(--ui-panel);font-size:11px;font-weight:700;line-height:18px;font-variant-numeric:tabular-nums}
.ui-ib__badge[hidden]{display:none}
.ui-ibp-layer{padding:0;width:min(360px,calc(100vw - 16px))}
.ui-ibp__hd{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px 8px}
.ui-ibp__hd b{font-size:14.5px}
.ui-ibp__all{padding:4px 8px;border:0;border-radius:var(--ui-radius-sm);background:none;color:var(--ui-text);font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.ui-ibp__all:disabled{color:var(--ui-sub);cursor:default;text-decoration:none}
.ui-ibp__tabs{display:flex;gap:6px;padding:0 14px 10px;border-bottom:1px solid var(--ui-line)}
.ui-ibp__tabs button{padding:4px 10px;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-pill);background:none;color:var(--ui-text);font:inherit;font-size:12.5px;cursor:pointer}
.ui-ibp__tabs button[aria-pressed="true"]{background:var(--ui-text);border-color:var(--ui-text);color:var(--ui-bg)}
.ui-ibp__list{list-style:none;margin:0;padding:6px;max-height:min(360px,60vh);overflow:auto}
.ui-ibp__it{position:relative;display:grid;grid-template-columns:auto 1fr;gap:10px;width:100%;padding:10px 26px 10px 10px;border:0;border-radius:var(--ui-radius);
  background:none;color:var(--ui-text);font:inherit;text-align:left;cursor:pointer}
.ui-ibp__it:hover{background:var(--ui-panel-2)}
.ui-ibp__all:focus-visible,.ui-ibp__tabs button:focus-visible,.ui-ibp__it:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-ibp__ic{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;font-size:16px;background:color-mix(in srgb,var(--c) 18%,var(--ui-panel))}
.ui-ibp__ti{display:block;font-size:13px;line-height:1.45}
.ui-ibp__it.is-unread .ui-ibp__ti{font-weight:700}
.ui-ibp__d{display:block;margin-top:1px;font-size:12px;line-height:1.5;color:var(--ui-sub)}
.ui-ibp__tm{display:block;margin-top:3px;font-size:11.5px;color:var(--ui-sub)}
.ui-ibp__it.is-unread::after{content:"";position:absolute;right:10px;top:16px;width:8px;height:8px;border-radius:50%;background:var(--ui-brand)}
.ui-ibp__empty{padding:28px 10px;text-align:center;font-size:13px;color:var(--ui-sub)}
`;

export class UIInbox extends UIElement {
  static props = { items: { default: '[]' }, label: { default: '通知' }, placement: { default: 'bottom-end' } };
  template(p) {
    this._list = list(p.items, (x) => ({ title: x })).map((x) => Object.assign({}, x, { read: !!x.read }));
    this._filter = this._filter || 'all';
    return '<span class="ui-ib ui-mo"><button type="button" class="ui-ib__bell" aria-haspopup="dialog" aria-expanded="false">' +
      '<span class="ui-ib__ico" aria-hidden="true">🔔</span><span class="ui-ib__badge"></span></button></span>';
  }
  mounted() {
    const self = this, bell = this.querySelector('.ui-ib__bell');
    if (this._layer) this._layer.destroy ? this._layer.destroy() : this._layer.el.remove();
    const layer = new Layer('ui-ibp-layer');
    this._layer = layer;
    layer.el.addEventListener('close', () => {
      bell.setAttribute('aria-expanded', 'false');
      if (layer.el.contains(document.activeElement) || document.activeElement === document.body) bell.focus();
    });
    bell.addEventListener('click', (e) => {
      if (!layer.el.hidden) { layer.hide(); return; }
      self._panel();
      layer.show(bell, self.props.placement, 8, e);
      bell.setAttribute('aria-expanded', 'true');
      const first = layer.el.querySelector('.ui-ibp__it') || layer.el.querySelector('button');
      if (first) first.focus();
    });
    layer.el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('ui-ibp__all')) { self.markAllRead(); return; }
      if (b.dataset.f) { self._filter = b.dataset.f; self._panel('[data-f="' + b.dataset.f + '"]'); return; }
      if (b.dataset.i != null) {
        const i = Number(b.dataset.i), it = self._list[i];
        it.read = true;
        self._badge();
        emit(self, 'open', { index: i, item: it });
        layer.hide();
      }
    });
    layer.el.addEventListener('keydown', (e) => {
      const its = Array.from(layer.el.querySelectorAll('.ui-ibp__it')), i = its.indexOf(document.activeElement);
      if (i < 0) return;
      const k = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: its.length - 1 }[e.key];
      if (k == null) return;
      e.preventDefault();
      its[(k + its.length) % its.length].focus();
    });
    this._badge();
  }
  disconnectedCallback() {
    if (this._layer) { this._layer.hide(); this._layer.el.remove(); this._layer = null; }
  }
  get unread() { return (this._list || []).filter((x) => !x.read).length; }
  _badge() {
    const bell = this.querySelector('.ui-ib__bell');
    if (!bell) return;
    const n = this.unread, b = bell.querySelector('.ui-ib__badge');
    b.hidden = n === 0;
    b.textContent = n > 99 ? '99+' : String(n);
    bell.setAttribute('aria-label', this.props.label + (n ? '，' + b.textContent + ' 条未读' : '，没有未读'));
    if (this._layer && !this._layer.el.hidden) this._panel();
  }
  /** 重画面板；refocus 为重画后要恢复焦点的选择器 */
  _panel(refocus) {
    const L = this._layer;
    if (!L) return;
    const active = document.activeElement, keep = refocus || (L.el.contains(active) ? (active.dataset.i != null ? '[data-i="' + active.dataset.i + '"]' : active.classList.contains('ui-ibp__all') ? '.ui-ibp__all' : null) : null);
    const all = this._list, unread = this.unread, f = this._filter;
    const rows = all.map((it, i) => ({ it: it, i: i })).filter((x) => f === 'all' || !x.it.read);
    L.setContent('<div role="dialog" aria-label="' + esc(this.props.label) + '"><div class="ui-ibp__hd"><b>' + esc(this.props.label) + '</b>' +
      '<button type="button" class="ui-ibp__all"' + (unread ? '' : ' disabled') + '>全部已读</button></div>' +
      '<div class="ui-ibp__tabs" role="group" aria-label="筛选"><button type="button" data-f="all" aria-pressed="' + (f === 'all') + '">全部 ' + all.length + '</button>' +
      '<button type="button" data-f="unread" aria-pressed="' + (f === 'unread') + '">未读 ' + unread + '</button></div>' +
      (rows.length ? '<ul class="ui-ibp__list">' + rows.map((r) => '<li><button type="button" class="ui-ibp__it' + (r.it.read ? '' : ' is-unread') + '" data-i="' + r.i + '" style="--c:' + tone(r.it.tone) + '">' +
        '<span class="ui-ibp__ic" aria-hidden="true">' + esc(r.it.icon || '🔔') + '</span><span><span class="ui-ibp__ti">' + (r.it.read ? '' : '<span class="ui-sr">未读：</span>') + esc(r.it.title) + '</span>' +
        (r.it.desc ? '<span class="ui-ibp__d">' + esc(r.it.desc) + '</span>' : '') + (r.it.time ? '<span class="ui-ibp__tm">' + esc(r.it.time) + '</span>' : '') + '</span></button></li>').join('') + '</ul>'
        : '<p class="ui-ibp__empty">' + (f === 'unread' ? '没有未读通知' : '暂无通知') + '</p>') + '</div>');
    if (!L.el.hidden) L.reposition();
    if (keep) { const n = L.el.querySelector(keep) || L.el.querySelector('.ui-ibp__it') || L.el.querySelector('[data-f]'); if (n && !n.disabled) n.focus(); else if (n) L.el.querySelector('[data-f]').focus(); }
  }
  markAllRead() {
    (this._list || []).forEach((x) => { x.read = true; });
    this._badge();
    emit(this, 'read', { all: true });
  }
  /** 推入一条新通知（未读），铃铛摇一下 */
  add(item) {
    const it = Object.assign({ read: false }, typeof item === 'string' ? { title: item } : item);
    this._list.unshift(it);
    const box = this.querySelector('.ui-ib');
    if (box && !reduced()) { box.classList.remove('is-ring'); void box.offsetWidth; box.classList.add('is-ring'); }
    this._badge();
  }
}
register('ui-inbox', UIInbox, inboxCss);

/* ---------- 弹出面板公共：挂 body、遮罩、焦点陷阱、归还焦点 ---------- */
/* 多个面板可能同时打开：用计数器锁定 / 恢复页面滚动，避免关闭顺序错乱后页面一直不能滚 */
let locks = 0, savedOverflow = '';
const lockScroll = () => { if (locks++ === 0) { savedOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; } };
const unlockScroll = () => { if (locks > 0 && --locks === 0) document.body.style.overflow = savedOverflow; };
class Popup extends UIElement {
  template() { return '<slot></slot>'; }
  mounted() {
    const self = this, t = trigger(this);
    if (t) { t.setAttribute('aria-haspopup', 'dialog'); t.addEventListener('click', () => self.show()); }
    if (this.props.open) this.show();
  }
  get isOpen() { return !!this._mask; }
  _open(html, cls) {
    if (this._mask) return null;
    this._back = document.activeElement;
    const m = document.createElement('div');
    m.className = cls + ' ui-mo';
    m.innerHTML = html;
    document.body.appendChild(m);
    this._mask = m;
    lockScroll();
    const panel = m.firstElementChild;
    this._untrap = trapTab(panel);
    this._key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); this._dismiss('esc'); } };
    document.addEventListener('keydown', this._key);
    m.addEventListener('mousedown', (e) => { if (e.target === m) this._dismiss('mask'); });
    requestAnimationFrame(() => requestAnimationFrame(() => { if (this._mask === m) m.classList.add('is-in'); }));
    if (reduced()) m.classList.add('is-in');
    emit(this, 'open', {});
    return m;
  }
  /** 关闭：先播退场动画再移除；now=true 时立即移除（组件被移除时） */
  close(now) {
    const m = this._mask;
    if (!m) return;
    this._mask = null;
    if (this._untrap) { this._untrap(); this._untrap = null; }
    document.removeEventListener('keydown', this._key);
    unlockScroll();
    m.classList.remove('is-in');
    m.style.pointerEvents = 'none';
    if (now || reduced()) m.remove(); else setTimeout(() => m.remove(), 300);
    const back = this._back;
    if (!now && back && back.isConnected && back.focus) back.focus();
    emit(this, 'close', {});
  }
  disconnectedCallback() { this.close(true); }
}

/* ================= Action Sheet 动作面板 ================= */
export const actionSheetCss = `
ui-action-sheet{display:inline-block}
.ui-as-mask{position:fixed;inset:0;z-index:360;display:flex;align-items:flex-end;justify-content:center;padding:8px 8px max(10px,env(safe-area-inset-bottom));
  background:rgba(0,0,0,0);transition:background-color .3s}
.ui-as-mask.is-in{background:rgba(0,0,0,.45)}
.ui-as{display:flex;flex-direction:column;gap:8px;width:min(480px,100%);outline:none;transform:translateY(calc(100% + 24px));transition:transform .36s var(--ui-ease)}
.ui-as-mask.is-in .ui-as{transform:translateY(var(--dy,0px))}
.ui-as.is-drag{transition:none}
.ui-as__grp,.ui-as__cancel{background:var(--ui-panel);color:var(--ui-text);border:var(--ui-border-w) solid var(--ui-line);border-radius:calc(var(--ui-radius-lg) + 4px);box-shadow:var(--ui-shadow)}
.ui-as__grp{overflow:hidden}
.ui-as__hd{padding:8px 16px 12px;text-align:center;touch-action:none;cursor:grab}
.ui-as__grip{width:38px;height:5px;margin:0 auto 10px;border-radius:3px;background:var(--ui-line)}
.ui-as__t{display:block;font-size:14px;font-weight:700}
.ui-as__d{margin:4px 0 0;font-size:12.5px;line-height:1.55;color:var(--ui-sub)}
.ui-as__it{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:52px;padding:10px 16px;border:0;border-top:1px solid var(--ui-line);
  background:none;color:var(--ui-text);font:inherit;font-size:15.5px;cursor:pointer}
.ui-as__it:hover{background:color-mix(in srgb,var(--ui-text) 5%,var(--ui-panel))}
.ui-as__it.is-danger{color:var(--ui-danger);font-weight:600}
.ui-as__it.is-danger:hover{background:none;box-shadow:inset 3px 0 0 var(--ui-danger)}
.ui-as__it:disabled{color:var(--ui-sub);cursor:not-allowed;background:none}
.ui-as__it small{display:block;font-size:12px;color:var(--ui-sub);font-weight:400}
.ui-as__cancel{width:100%;min-height:52px;font:inherit;font-size:15.5px;font-weight:700;cursor:pointer}
.ui-as__it:focus-visible,.ui-as__cancel:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--ui-brand)}
`;

export class UIActionSheet extends Popup {
  static props = { title: { default: '' }, desc: { default: '' }, items: { default: '' }, cancel: { default: '取消' }, open: { type: 'boolean', default: false } };
  _items() {
    return list(this.props.items, (x) => ({ label: x.replace(/^!/, ''), danger: x.charAt(0) === '!' })).filter((x) => x.label);
  }
  show() {
    const p = this.props, items = this._items(), id = 'ui-as-' + (++uid);
    const m = this._open('<div class="ui-as" role="dialog" aria-modal="true" tabindex="-1"' + (p.title ? ' aria-labelledby="' + id + '"' : ' aria-label="操作"') + (p.desc ? ' aria-describedby="' + id + 'd"' : '') + '>' +
      '<div class="ui-as__grp"><div class="ui-as__hd"><div class="ui-as__grip" aria-hidden="true"></div>' +
      (p.title ? '<b class="ui-as__t" id="' + id + '">' + esc(p.title) + '</b>' : '') + (p.desc ? '<p class="ui-as__d" id="' + id + 'd">' + esc(p.desc) + '</p>' : '') + '</div>' +
      items.map((it, i) => '<button type="button" class="ui-as__it' + (it.danger ? ' is-danger' : '') + '" data-i="' + i + '"' + (it.disabled ? ' disabled' : '') + '>' +
        (it.icon ? '<span aria-hidden="true">' + esc(it.icon) + '</span>' : '') + '<span>' + esc(it.label) + (it.desc ? '<small>' + esc(it.desc) + '</small>' : '') + '</span></button>').join('') +
      '</div><button type="button" class="ui-as__cancel">' + esc(p.cancel) + '</button></div>', 'ui-as-mask');
    if (!m) return;
    const self = this, sheet = m.querySelector('.ui-as');
    m.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('ui-as__cancel')) { self._dismiss('cancel'); return; }
      const i = Number(b.dataset.i);
      self.close();
      emit(self, 'select', { index: i, label: items[i].label });
    });
    /* 按住顶部向下拖：超过面板高度 30% 松手即关闭，否则弹回 */
    const hd = m.querySelector('.ui-as__hd');
    let d = null;
    hd.addEventListener('pointerdown', (e) => { d = { y: e.clientY, dy: 0 }; try { hd.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件 */ } });
    hd.addEventListener('pointermove', (e) => {
      if (!d) return;
      d.dy = Math.max(0, e.clientY - d.y);
      sheet.classList.add('is-drag');
      sheet.style.setProperty('--dy', d.dy + 'px');
      m.style.backgroundColor = 'rgba(0,0,0,' + (0.45 * (1 - Math.min(1, d.dy / sheet.offsetHeight))).toFixed(3) + ')';
    });
    const end = () => {
      if (!d) return;
      const dy = d.dy;
      d = null;
      sheet.classList.remove('is-drag');
      m.style.backgroundColor = '';
      if (dy > sheet.offsetHeight * 0.3) { sheet.style.setProperty('--dy', dy + 'px'); self._dismiss('swipe'); } else sheet.style.setProperty('--dy', '0px');
    };
    hd.addEventListener('pointerup', end);
    hd.addEventListener('pointercancel', end);
    const first = m.querySelector('.ui-as__it:not(:disabled)') || m.querySelector('.ui-as__cancel');
    first.focus();
  }
  _dismiss(reason) {
    if (!this._mask) return;
    const sheet = this._mask.querySelector('.ui-as');
    if (reason === 'swipe') sheet.style.setProperty('--dy', '0px');
    this.close();
    emit(this, 'cancel', { reason: reason });
  }
}
register('ui-action-sheet', UIActionSheet, actionSheetCss);

/* ================= Type Confirm 输入确认 ================= */
export const typeConfirmCss = `
ui-type-confirm{display:inline-block}
${SR}
.ui-tc-mask{position:fixed;inset:0;z-index:360;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,0);transition:background-color .2s}
.ui-tc-mask.is-in{background:rgba(0,0,0,.5)}
.ui-tc{width:min(440px,100%);max-height:calc(100vh - 40px);overflow:auto;padding:20px;outline:none;background:var(--ui-panel);color:var(--ui-text);
  border:var(--ui-border-w) solid var(--ui-line);border-top:3px solid var(--ui-danger);border-radius:var(--ui-radius-lg);box-shadow:var(--ui-shadow);
  opacity:0;transform:translateY(10px) scale(.98);transition:opacity .2s,transform .25s var(--ui-ease)}
.ui-tc-mask.is-in .ui-tc{opacity:1;transform:none}
.ui-tc__hd{display:flex;gap:12px;align-items:flex-start}
.ui-tc__ic{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--ui-danger-soft);color:var(--ui-danger);font-weight:800;font-size:17px}
.ui-tc__t{margin:6px 0 0;font-size:16px;font-weight:700}
.ui-tc__d{margin:10px 0 0;font-size:13px;line-height:1.7;color:var(--ui-sub)}
.ui-tc__list{margin:10px 0 0;padding:10px 12px 10px 28px;border-radius:var(--ui-radius);background:var(--ui-panel-2);font-size:13px;line-height:1.8}
.ui-tc__lb{display:block;margin:16px 0 6px;font-size:13px}
.ui-tc__lb code{padding:1px 6px;border-radius:4px;background:var(--ui-panel-2);font-family:var(--ui-mono);font-weight:700;user-select:all}
.ui-tc__in{width:100%;height:var(--ui-ctl-h,38px);padding:0 12px;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);background:var(--ui-bg);
  color:var(--ui-text);font-family:var(--ui-mono);font-size:14px;box-sizing:border-box}
.ui-tc__in:focus{outline:none;border-color:var(--ui-brand);box-shadow:var(--ui-ring)}
.ui-tc__in.is-ok{border-color:var(--ui-danger)}
.ui-tc__in.is-shake{animation:ui-tc-shake .35s}
@keyframes ui-tc-shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.ui-tc__ft{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;margin-top:18px}
.ui-tc__ok:disabled{opacity:.5;cursor:not-allowed}
`;

export class UITypeConfirm extends Popup {
  static props = {
    title: { default: '确认删除？' }, desc: { default: '' }, items: { default: '' }, keyword: { default: 'DELETE' },
    confirm: { default: '永久删除' }, cancel: { default: '取消' }, open: { type: 'boolean', default: false }
  };
  show() {
    const p = this.props, id = 'ui-tc-' + (++uid), cons = splitList(p.items), kw = String(p.keyword || 'DELETE');
    const m = this._open('<div class="ui-tc" role="alertdialog" aria-modal="true" tabindex="-1" aria-labelledby="' + id + 't" aria-describedby="' + id + 'd">' +
      '<div class="ui-tc__hd"><span class="ui-tc__ic" aria-hidden="true">!</span><h2 class="ui-tc__t" id="' + id + 't">' + esc(p.title) + '</h2></div>' +
      '<div id="' + id + 'd">' + (p.desc ? '<p class="ui-tc__d">' + esc(p.desc) + '</p>' : '') +
      (cons.length ? '<ul class="ui-tc__list">' + cons.map((c) => '<li>' + esc(c) + '</li>').join('') + '</ul>' : '') + '</div>' +
      '<label class="ui-tc__lb" for="' + id + 'i">请输入 <code>' + esc(kw) + '</code> 以确认</label>' +
      '<input class="ui-tc__in" id="' + id + 'i" autocomplete="off" autocapitalize="off" spellcheck="false">' +
      '<span class="ui-sr" role="status" aria-live="polite"></span>' +
      '<div class="ui-tc__ft"><button type="button" class="ui-btn ui-btn--md ui-btn--default ui-tc__no">' + esc(p.cancel) + '</button>' +
      '<button type="button" class="ui-btn ui-btn--md ui-btn--danger ui-tc__ok" disabled>' + esc(p.confirm) + '</button></div></div>', 'ui-tc-mask');
    if (!m) return;
    const self = this, input = m.querySelector('.ui-tc__in'), ok = m.querySelector('.ui-tc__ok'), live = m.querySelector('.ui-sr');
    const match = () => input.value.trim() === kw;
    input.addEventListener('input', () => { ok.disabled = !match(); input.classList.toggle('is-ok', match()); live.textContent = match() ? '已匹配，可以确认' : ''; });
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (match()) self._confirm();
      else { input.classList.remove('is-shake'); void input.offsetWidth; input.classList.add('is-shake'); live.textContent = '输入不匹配，请输入 ' + kw; }
    });
    ok.addEventListener('click', () => { if (match()) self._confirm(); });
    m.querySelector('.ui-tc__no').addEventListener('click', () => self._dismiss('cancel'));
    input.focus();
  }
  _confirm() { this.close(); emit(this, 'confirm', { keyword: this.props.keyword }); }
  _dismiss(reason) { if (!this._mask) return; this.close(); emit(this, 'cancel', { reason: reason }); }
}
register('ui-type-confirm', UITypeConfirm, typeConfirmCss);

/* ================= Tour 新手引导 ================= */
export const tourCss = `
ui-tour{display:inline-block}
${SR}
.ui-tour{position:fixed;inset:0;z-index:380}
.ui-tour__hole{position:fixed;border-radius:var(--ui-radius);box-shadow:0 0 0 9999px rgba(0,0,0,.55),0 0 0 2px var(--ui-brand) inset;pointer-events:none;
  transition:left .35s var(--ui-ease),top .35s var(--ui-ease),width .35s var(--ui-ease),height .35s var(--ui-ease)}
.ui-tour__hole.is-none{width:0!important;height:0!important;left:50%!important;top:50%!important}
.ui-tour__pop{position:fixed;width:min(300px,calc(100vw - 24px));padding:14px 16px;outline:none;background:var(--ui-panel);color:var(--ui-text);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);box-shadow:var(--ui-shadow);
  transition:left .35s var(--ui-ease),top .35s var(--ui-ease),opacity .2s}
.ui-tour__pop:focus-visible{box-shadow:var(--ui-ring),var(--ui-shadow)}
.ui-tour__n{font-size:12px;font-weight:600;color:var(--ui-sub);font-variant-numeric:tabular-nums}
.ui-tour__t{display:block;margin-top:4px;font-size:15px;font-weight:700}
.ui-tour__b{margin:6px 0 0;font-size:13px;line-height:1.65}
.ui-tour__dots{display:flex;gap:5px;margin-top:12px}
.ui-tour__dots i{width:6px;height:6px;border-radius:3px;background:var(--ui-line);transition:width .3s,background-color .3s}
.ui-tour__dots i.is-on{width:16px;background:var(--ui-brand)}
.ui-tour__ft{display:flex;align-items:center;gap:6px;margin-top:12px}
.ui-tour__ft .ui-tour__skip{margin-right:auto}
`;

export class UITour extends UIElement {
  static props = { steps: { default: '[]' }, label: { default: '新手引导' } };
  template() { return '<slot></slot>'; }
  mounted() {
    const self = this, t = trigger(this);
    if (t) t.addEventListener('click', () => self.start(0));
  }
  disconnectedCallback() { this.end(false, true); }
  get active() { return this._el ? this._i : -1; }
  _steps() { return list(this.props.steps, () => null).filter((s) => s && s.title); }
  start(i) {
    const steps = this._steps();
    if (!steps.length) return;
    if (!this._el) {
      this._back = document.activeElement;
      const el = document.createElement('div');
      el.className = 'ui-tour ui-mo';
      el.innerHTML = '<div class="ui-tour__hole is-none" aria-hidden="true"></div>' +
        '<div class="ui-tour__pop" role="dialog" aria-modal="true" tabindex="-1"></div><span class="ui-sr" aria-live="polite"></span>';
      document.body.appendChild(el);
      this._el = el;
      const pop = el.querySelector('.ui-tour__pop');
      this._untrap = trapTab(pop);
      pop.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.go === 'next') this.next();
        else if (b.dataset.go === 'prev') this.prev();
        else this.end(false);
      });
      this._key = (e) => {
        if (!this._el) return;
        if (e.key === 'Escape') { e.stopPropagation(); this.end(false); }
        else if (e.key === 'ArrowRight' && !/INPUT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); this.next(); }
        else if (e.key === 'ArrowLeft' && !/INPUT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); this.prev(); }
      };
      this._move = () => { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = 0; this._place(); }); };
      document.addEventListener('keydown', this._key);
      window.addEventListener('scroll', this._move, true);
      window.addEventListener('resize', this._move);
    }
    this._go(clamp(i || 0, 0, steps.length - 1));
  }
  next() { const n = this._steps().length; if (!this._el) return; if (this._i >= n - 1) this.end(true); else this._go(this._i + 1); }
  prev() { if (this._el && this._i > 0) this._go(this._i - 1); }
  _go(i) {
    const steps = this._steps(), s = steps[i], n = steps.length, el = this._el, pop = el.querySelector('.ui-tour__pop');
    this._i = i;
    const id = 'ui-tour-' + (++uid);
    pop.setAttribute('aria-labelledby', id);
    pop.innerHTML = '<div class="ui-tour__n">' + (i + 1) + ' / ' + n + '</div><b class="ui-tour__t" id="' + id + '">' + esc(s.title) + '</b>' +
      (s.body ? '<p class="ui-tour__b">' + esc(s.body) + '</p>' : '') +
      '<div class="ui-tour__dots" aria-hidden="true">' + steps.map((x, k) => '<i' + (k === i ? ' class="is-on"' : '') + '></i>').join('') + '</div>' +
      '<div class="ui-tour__ft"><button type="button" class="ui-btn ui-btn--sm ui-btn--text ui-tour__skip" data-go="skip">跳过</button>' +
      (i > 0 ? '<button type="button" class="ui-btn ui-btn--sm ui-btn--default" data-go="prev">上一步</button>' : '') +
      '<button type="button" class="ui-btn ui-btn--sm ui-btn--primary" data-go="next">' + (i === n - 1 ? '完成' : '下一步') + '</button></div>';
    const target = s.target ? document.querySelector(s.target) : null;
    this._target = target;
    if (target) target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    this._place();
    setTimeout(() => this._place(), reduced() ? 0 : 380);
    el.querySelector('.ui-tour > .ui-sr').textContent = '第 ' + (i + 1) + ' 步，共 ' + n + ' 步：' + s.title;
    pop.focus({ preventScroll: true });
    emit(this, 'step', { index: i, title: s.title });
  }
  _place() {
    const el = this._el;
    if (!el) return;
    const hole = el.querySelector('.ui-tour__hole'), pop = el.querySelector('.ui-tour__pop');
    const vw = document.documentElement.clientWidth, vh = window.innerHeight, pw = pop.offsetWidth, ph = pop.offsetHeight, pad = 6, gap = 12;
    const t = this._target && this._target.isConnected ? this._target.getBoundingClientRect() : null;
    if (!t || (!t.width && !t.height)) {
      hole.classList.add('is-none');
      pop.style.left = Math.round((vw - pw) / 2) + 'px';
      pop.style.top = Math.round((vh - ph) / 2) + 'px';
      return;
    }
    hole.classList.remove('is-none');
    Object.assign(hole.style, { left: (t.left - pad) + 'px', top: (t.top - pad) + 'px', width: (t.width + pad * 2) + 'px', height: (t.height + pad * 2) + 'px' });
    const want = (this._steps()[this._i] || {}).placement;
    let top = t.bottom + pad + gap;
    if ((want === 'top' || top + ph > vh - 8) && t.top - pad - gap - ph > 8) top = t.top - pad - gap - ph;
    const left = clamp(t.left + t.width / 2 - pw / 2, 12, vw - pw - 12);
    pop.style.left = Math.round(left) + 'px';
    pop.style.top = Math.round(clamp(top, 8, vh - ph - 8)) + 'px';
  }
  /** 结束引导；completed 表示是否走完了最后一步 */
  end(completed, silent) {
    const el = this._el;
    if (!el) return;
    this._el = null;
    if (this._untrap) { this._untrap(); this._untrap = null; }
    document.removeEventListener('keydown', this._key);
    window.removeEventListener('scroll', this._move, true);
    window.removeEventListener('resize', this._move);
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
    el.remove();
    if (silent) return;
    if (this._back && this._back.isConnected && this._back.focus) this._back.focus();
    emit(this, 'end', { completed: !!completed, index: this._i });
  }
}
register('ui-tour', UITour, tourCss);

/* 控制台 / demo 便捷入口：页面上第一个 <ui-toaster> */
if (typeof window !== 'undefined') {
  window.uiToaster = function () { return document.querySelector('ui-toaster'); };
}
