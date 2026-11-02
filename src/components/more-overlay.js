/* =========================================================
   第四批：ui-anchor 目录导航（滚动监听）
          ui-split-button / ui-context-menu / ui-popconfirm（浮层）
          uiNotify() 通知（反馈，函数 API）
   ========================================================= */
import { UIElement, register } from './base.js';
import { Layer } from '../lib/positioner.js';
import { esc, splitList } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
function parseArr(text) { try { const v = JSON.parse(text || '[]'); return Array.isArray(v) ? v : null; } catch (e) { return null; } }

/* 浮层菜单（split-button / context-menu 共用） */
const popMenuCss = `
.ui-pmenu{list-style:none;margin:0;padding:0;min-width:168px}
.ui-pmenu li[role="separator"]{height:1px;margin:4px 6px;background:var(--ui-line)}
.ui-pmenu button{width:100%;display:flex;align-items:center;gap:9px;padding:7px 10px;border:0;background:none;cursor:pointer;text-align:left;
  font:inherit;font-size:13px;color:var(--ui-text);border-radius:var(--ui-radius-sm)}
.ui-pmenu button:hover,.ui-pmenu button:focus-visible{outline:none;background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-pmenu button.danger{color:var(--ui-danger)}
.ui-pmenu button.danger:hover,.ui-pmenu button.danger:focus-visible{background:var(--ui-danger-soft);color:var(--ui-danger)}
.ui-pmenu button:disabled{opacity:.45;cursor:not-allowed;background:none;color:var(--ui-text)}
.ui-pmenu i{width:16px;text-align:center;font-style:normal}
.ui-pmenu span{flex:1}
.ui-pmenu kbd{font-family:var(--ui-mono);font-size:11px;color:var(--ui-sub)}
`;
(function inject() {
  if (document.querySelector('style[data-lib="ui-pmenu"]')) return;
  const s = document.createElement('style');
  s.dataset.lib = 'ui-pmenu';
  s.textContent = popMenuCss;
  document.head.appendChild(s);
})();

function menuHTML(items) {
  return '<ul class="ui-pmenu" role="menu">' + items.map((it, i) => it.divider ? '<li role="separator"></li>' :
    '<li role="none"><button type="button" role="menuitem" tabindex="-1" data-i="' + i + '"' + (it.danger ? ' class="danger"' : '') + (it.disabled ? ' disabled' : '') + '>' +
    '<i aria-hidden="true">' + esc(it.icon || '') + '</i><span>' + esc(it.label) + '</span>' + (it.kbd ? '<kbd>' + esc(it.kbd) + '</kbd>' : '') + '</button></li>'
  ).join('') + '</ul>';
}
/** 菜单键盘：↑↓ 循环、Home/End、Esc 关闭并归还焦点、Tab 关闭 */
function wireMenu(layer, items, onPick, getReturn) {
  layer.el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b || b.disabled) return;
    layer.hide();
    const r = getReturn(); if (r) r.focus();
    onPick(items()[Number(b.dataset.i)]);
  });
  layer.el.addEventListener('keydown', (e) => {
    const list = Array.from(layer.el.querySelectorAll('[role="menuitem"]:not(:disabled)'));
    const i = list.indexOf(document.activeElement);
    let n = -1;
    if (e.key === 'ArrowDown') n = (i + 1) % list.length;
    else if (e.key === 'ArrowUp') n = (i - 1 + list.length) % list.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = list.length - 1;
    else if (e.key === 'Escape') { e.preventDefault(); layer.hide(); const r = getReturn(); if (r) r.focus(); return; }
    else if (e.key === 'Tab') { layer.hide(); return; }
    if (n > -1) { e.preventDefault(); list[n].focus(); }
  });
}

/* ---------------- Anchor 目录导航 ---------------- */
export const anchorCss = `
ui-anchor{display:block;min-width:0}
.ui-anchor{list-style:none;margin:0;padding:0 0 0 2px;border-left:2px solid var(--ui-line);display:flex;flex-direction:column;gap:1px}
.ui-anchor a{display:block;margin-left:-2px;padding:5px 10px;font-size:12.5px;color:var(--ui-sub);text-decoration:none;
  border-left:2px solid transparent;transition:var(--ui-motion);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ui-anchor a[data-lv="2"]{padding-left:22px;font-size:12px}
.ui-anchor a:hover{color:var(--ui-text)}
.ui-anchor a[aria-current="location"]{color:var(--ui-brand);border-left-color:var(--ui-brand);font-weight:600}
.ui-anchor a:focus-visible{outline:none;box-shadow:var(--ui-ring);border-radius:2px}
.ui-anchor__t{font-size:11px;letter-spacing:.06em;color:var(--ui-sub);margin:0 0 6px}
`;

export class UIAnchor extends UIElement {
  static props = { items: { default: '[]' }, container: { default: '' }, title: { default: '' } };
  template(p) {
    const list = parseArr(p.items);
    if (!list) return '<div style="font-size:12.5px;color:var(--ui-sub)">items 需要是合法 JSON 数组</div>';
    return '<nav aria-label="' + esc(p.title || '目录') + '">' + (p.title ? '<p class="ui-anchor__t">' + esc(p.title) + '</p>' : '') +
      '<ul class="ui-anchor">' + list.map((it, i) => '<li><a href="#' + esc(it.id) + '" data-id="' + esc(it.id) + '" data-lv="' + (it.level || 1) + '"' + (i === 0 ? ' aria-current="location"' : '') + '>' + esc(it.label) + '</a></li>').join('') + '</ul></nav>';
  }
  _box() {
    if (this.props.container) return document.querySelector(this.props.container);
    return null; /* null 表示整页滚动 */
  }
  mounted() {
    const self = this;
    const links = Array.from(this.querySelectorAll('a[data-id]'));
    const target = (id) => document.getElementById(id);
    const set = (id) => links.forEach((a) => { if (a.dataset.id === id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    links.forEach((a) => a.addEventListener('click', (e) => {
      const el = target(a.dataset.id);
      if (!el) return;
      e.preventDefault();
      const box = self._box();
      if (box) box.scrollTo({ top: el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 4, behavior: 'smooth' });
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      set(a.dataset.id);
      self._lock = Date.now();
      emit(self, 'change', { id: a.dataset.id });
    }));
    const spy = () => {
      if (self._lock && Date.now() - self._lock < 600) return;
      const box = self._box();
      const top = box ? box.getBoundingClientRect().top : 90;
      let cur = links[0] && links[0].dataset.id;
      links.forEach((a) => { const el = target(a.dataset.id); if (el && el.getBoundingClientRect().top - top <= 16) cur = a.dataset.id; });
      if (box && box.scrollTop + box.clientHeight >= box.scrollHeight - 2 && links.length) cur = links[links.length - 1].dataset.id;
      set(cur);
    };
    if (this._scrollEl) this._scrollEl.removeEventListener('scroll', this._spy);
    this._spy = spy;
    this._scrollEl = this._box() || window;
    this._scrollEl.addEventListener('scroll', spy, { passive: true });
  }
  disconnectedCallback() { if (this._scrollEl) this._scrollEl.removeEventListener('scroll', this._spy); }
}
register('ui-anchor', UIAnchor, anchorCss);

/* ---------------- Split Button 分裂按钮 ---------------- */
export const splitButtonCss = `
ui-split-button{display:inline-block}
.ui-split{display:inline-flex;align-items:stretch;border-radius:var(--ui-radius);box-shadow:var(--ui-shadow-sm)}
.ui-split button{height:var(--ui-ctl-h);border:var(--ui-border-w) solid var(--ui-line);background:var(--ui-panel);color:var(--ui-text);
  font:inherit;font-size:14px;cursor:pointer;transition:var(--ui-motion)}
.ui-split button:first-child{padding:0 16px;border-radius:var(--ui-radius) 0 0 var(--ui-radius)}
.ui-split button:last-child{width:34px;margin-left:calc(var(--ui-border-w) * -1);border-radius:0 var(--ui-radius) var(--ui-radius) 0;font-size:11px;color:var(--ui-sub)}
.ui-split button:hover{border-color:var(--ui-brand);color:var(--ui-brand);position:relative;z-index:1}
.ui-split button:focus-visible{outline:none;box-shadow:var(--ui-ring);position:relative;z-index:2}
.ui-split--primary button{background:var(--ui-brand);border-color:var(--ui-brand);color:var(--ui-brand-ink)}
.ui-split--primary button:last-child{color:var(--ui-brand-ink);border-left-color:color-mix(in srgb,var(--ui-brand-ink) 35%,var(--ui-brand))}
.ui-split--primary button:hover{color:var(--ui-brand-ink);filter:brightness(1.06)}
`;

export class UISplitButton extends UIElement {
  static props = { label: { default: '操作' }, items: { default: '' }, variant: { default: 'default' } };
  _items() { return splitList(this.props.items).map((s) => s === '-' ? { divider: true } : { label: s, danger: /删除|移除/.test(s) }); }
  template(p) {
    return '<span class="ui-split ui-split--' + esc(p.variant) + '"><button type="button">' + esc(p.label) + '</button>' +
      '<button type="button" aria-haspopup="menu" aria-expanded="false" aria-label="更多操作">▼</button></span>';
  }
  mounted() {
    const self = this;
    const [main, more] = this.querySelectorAll('button');
    main.addEventListener('click', () => emit(self, 'action', { label: self.props.label }));
    if (!this._layer) {
      this._layer = new Layer();
      this._layer.el.addEventListener('close', () => { const m = self.querySelectorAll('button')[1]; if (m) m.setAttribute('aria-expanded', 'false'); });
      wireMenu(this._layer, () => self._items(), (it) => emit(self, 'select', { label: it.label }), () => self.querySelectorAll('button')[1]);
    }
    const open = (e, focusLast) => {
      self._layer.setContent(menuHTML(self._items()));
      self._layer.show(more, 'bottom-end', 6, e);
      more.setAttribute('aria-expanded', 'true');
      const list = self._layer.el.querySelectorAll('[role="menuitem"]:not(:disabled)');
      if (list.length) list[focusLast ? list.length - 1 : 0].focus();
    };
    more.addEventListener('click', (e) => { if (self._layer.el.hidden) open(e); else self._layer.hide(); });
    more.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(null, e.key === 'ArrowUp'); }
    });
  }
  disconnectedCallback() { if (this._layer) { this._layer.destroy(); this._layer = null; } }
}
register('ui-split-button', UISplitButton, splitButtonCss);

/* ---------------- Context Menu 右键菜单 ---------------- */
export const contextMenuCss = `
ui-context-menu{display:block;width:100%}
.ui-ctx{position:relative;display:block;outline:none;border-radius:var(--ui-radius)}
.ui-ctx:focus-visible{box-shadow:var(--ui-ring)}
`;

export class UIContextMenu extends UIElement {
  static props = { items: { default: '[]' } };
  template() {
    return '<div class="ui-ctx" tabindex="0" aria-haspopup="menu" aria-label="右键（或 Shift+F10）打开菜单"><slot></slot></div>';
  }
  mounted() {
    const self = this;
    const area = this.querySelector('.ui-ctx');
    if (!this._layer) {
      this._layer = new Layer();
      wireMenu(this._layer, () => parseArr(self.props.items) || [], (it) => emit(self, 'select', { label: it.label, item: it }), () => self.querySelector('.ui-ctx'));
      /* 菜单定在鼠标坐标上，页面一滚动就关闭（而不是跟着重新定位） */
      const layer = this._layer;
      layer._onMove = () => layer.hide();
    }
    const open = (x, y, e) => {
      const items = parseArr(self.props.items) || [];
      /* 用一个「虚拟锚点」把菜单定位到鼠标处 */
      const pt = { getBoundingClientRect: () => ({ left: x, right: x, top: y, bottom: y, width: 0, height: 0 }), contains: () => false };
      self._layer.setContent(menuHTML(items));
      self._layer.show(pt, 'bottom-start', 2, e);
      const first = self._layer.el.querySelector('[role="menuitem"]:not(:disabled)');
      if (first) first.focus();
    };
    area.addEventListener('contextmenu', (e) => { e.preventDefault(); open(e.clientX, e.clientY, e); });
    area.addEventListener('keydown', (e) => {
      if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
        e.preventDefault();
        const r = area.getBoundingClientRect();
        open(r.left + 16, r.top + 16, null);
      }
    });
  }
  disconnectedCallback() { if (this._layer) { this._layer.destroy(); this._layer = null; } }
}
register('ui-context-menu', UIContextMenu, contextMenuCss);

/* ---------------- Popconfirm 气泡确认 ---------------- */
export const popconfirmCss = `
ui-popconfirm{display:inline-block}
.ui-pc{max-width:260px;padding:6px 6px 4px}
.ui-pc__t{display:flex;gap:8px;font-size:13px;font-weight:600;color:var(--ui-text);line-height:1.5}
.ui-pc__t span{color:var(--ui-warn);flex:0 0 auto}
.ui-pc__d{margin:4px 0 0 22px;font-size:12px;color:var(--ui-sub);line-height:1.6}
.ui-pc__ft{display:flex;justify-content:flex-end;gap:6px;margin-top:10px}
.ui-pc__ft button{height:28px;padding:0 12px;font:inherit;font-size:12.5px;cursor:pointer;border-radius:var(--ui-radius-sm);
  border:var(--ui-border-w) solid var(--ui-line);background:var(--ui-panel);color:var(--ui-text)}
.ui-pc__ft button:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-pc__ft button.ok{background:var(--ui-brand);border-color:var(--ui-brand);color:var(--ui-brand-ink)}
.ui-pc__ft button.ok.danger{background:var(--ui-danger);border-color:var(--ui-danger);color:var(--ui-on-color)}
`;

export class UIPopconfirm extends UIElement {
  static props = { title: { default: '确定执行此操作？' }, desc: { default: '' }, ok: { default: '确定' }, cancel: { default: '取消' }, danger: { type: 'boolean' } };
  template() { return '<span class="ui-pc-trigger"><slot></slot></span>'; }
  mounted() {
    const self = this;
    const trig = this.querySelector('.ui-pc-trigger');
    if (!this._layer) {
      this._layer = new Layer();
      this._layer.el.setAttribute('role', 'alertdialog');
      this._layer.el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-r]');
        if (!b) return;
        self._layer.hide();
        const f = self.querySelector('button, [tabindex]'); if (f) f.focus();
        emit(self, b.dataset.r === 'ok' ? 'confirm' : 'cancel', {});
      });
      this._layer.el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { const f = self.querySelector('button, [tabindex]'); if (f) f.focus(); }
        if (e.key === 'Tab') {
          const bs = self._layer.el.querySelectorAll('button');
          if (!e.shiftKey && document.activeElement === bs[1]) { e.preventDefault(); bs[0].focus(); }
          else if (e.shiftKey && document.activeElement === bs[0]) { e.preventDefault(); bs[1].focus(); }
        }
      });
    }
    trig.addEventListener('click', (e) => {
      if (!self._layer.el.hidden) { self._layer.hide(); return; }
      const p = self.props;
      self._layer.el.setAttribute('aria-label', p.title);
      self._layer.setContent('<div class="ui-pc"><div class="ui-pc__t"><span aria-hidden="true">⚠</span>' + esc(p.title) + '</div>' +
        (p.desc ? '<p class="ui-pc__d">' + esc(p.desc) + '</p>' : '') +
        '<div class="ui-pc__ft"><button type="button" data-r="cancel">' + esc(p.cancel) + '</button>' +
        '<button type="button" data-r="ok" class="ok' + (p.danger ? ' danger' : '') + '">' + esc(p.ok) + '</button></div></div>');
      self._layer.show(trig, 'top-center', 8, e);
      /* 危险操作默认聚焦「取消」，避免回车误删 */
      self._layer.el.querySelector(p.danger ? '[data-r="cancel"]' : '[data-r="ok"]').focus();
    });
  }
  disconnectedCallback() { if (this._layer) { this._layer.destroy(); this._layer = null; } }
}
register('ui-popconfirm', UIPopconfirm, popconfirmCss);

/* ---------------- uiNotify 通知（函数 API） ---------------- */
export const notifyCss = `
#ui-notify-root{position:fixed;top:16px;right:16px;z-index:420;display:flex;flex-direction:column;gap:10px;width:min(360px,calc(100vw - 32px));pointer-events:none}
.ui-ntf{position:relative;display:grid;grid-template-columns:auto 1fr auto;gap:10px;padding:12px 12px 14px;pointer-events:auto;overflow:hidden;
  background:var(--ui-panel);color:var(--ui-text);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);
  box-shadow:0 12px 32px rgba(0,0,0,.16);font-family:var(--ui-font);animation:ui-ntf-in .25s cubic-bezier(.2,.7,.2,1)}
.ui-ntf--out{animation:ui-ntf-out .2s ease forwards}
@keyframes ui-ntf-in{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
@keyframes ui-ntf-out{to{opacity:0;transform:translateX(24px)}}
.ui-ntf__i{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;
  background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-ntf--success .ui-ntf__i{background:var(--ui-ok-soft);color:var(--ui-ok)}
.ui-ntf--warn .ui-ntf__i{background:var(--ui-warn-soft);color:var(--ui-warn)}
.ui-ntf--danger .ui-ntf__i{background:var(--ui-danger-soft);color:var(--ui-danger)}
.ui-ntf__t{font-size:13.5px;font-weight:600;line-height:1.5}
.ui-ntf__d{margin:2px 0 0;font-size:12.5px;color:var(--ui-sub);line-height:1.6}
.ui-ntf__a{margin-top:8px;font:inherit;font-size:12.5px;font-weight:600;padding:4px 10px;cursor:pointer;
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);background:var(--ui-panel-2);color:var(--ui-brand)}
.ui-ntf__x{width:24px;height:24px;border:0;border-radius:50%;background:none;cursor:pointer;color:var(--ui-sub);font-size:16px;line-height:1}
.ui-ntf__x:hover{background:var(--ui-panel-2);color:var(--ui-text)}
.ui-ntf__bar{position:absolute;left:0;bottom:0;height:3px;width:100%;background:var(--ui-brand);transform-origin:left;
  animation:ui-ntf-bar linear forwards;animation-duration:var(--d,4500ms)}
.ui-ntf--success .ui-ntf__bar{background:var(--ui-ok)}
.ui-ntf--warn .ui-ntf__bar{background:var(--ui-warn)}
.ui-ntf--danger .ui-ntf__bar{background:var(--ui-danger)}
.ui-ntf:hover .ui-ntf__bar,.ui-ntf:focus-within .ui-ntf__bar{animation-play-state:paused}
@keyframes ui-ntf-bar{from{transform:scaleX(1)}to{transform:scaleX(0)}}
@media (max-width:520px){#ui-notify-root{top:auto;bottom:12px;right:12px;left:12px;width:auto}}
@media (prefers-reduced-motion:reduce){.ui-ntf,.ui-ntf--out{animation:none}}
`;

const NTF_ICON = { info: 'i', success: '✓', warn: '!', danger: '✕' };

export function notify(opts) {
  const o = typeof opts === 'string' ? { title: opts } : (opts || {});
  if (!document.querySelector('style[data-lib="ui-notify"]')) {
    const s = document.createElement('style'); s.dataset.lib = 'ui-notify'; s.textContent = notifyCss; document.head.appendChild(s);
  }
  let root = document.getElementById('ui-notify-root');
  if (!root) { root = document.createElement('div'); root.id = 'ui-notify-root'; root.setAttribute('aria-live', 'polite'); document.body.appendChild(root); }
  const type = NTF_ICON[o.type] ? o.type : 'info';
  const dur = o.duration === 0 ? 0 : Math.max(1500, Number(o.duration) || 4500);
  const el = document.createElement('div');
  el.className = 'ui-ntf ui-ntf--' + type;
  el.setAttribute('role', type === 'danger' ? 'alert' : 'status');
  el.innerHTML = '<span class="ui-ntf__i" aria-hidden="true">' + NTF_ICON[type] + '</span>' +
    '<div><div class="ui-ntf__t">' + esc(o.title || '') + '</div>' + (o.desc ? '<p class="ui-ntf__d">' + esc(o.desc) + '</p>' : '') +
    (o.action ? '<button type="button" class="ui-ntf__a">' + esc(o.action) + '</button>' : '') + '</div>' +
    '<button type="button" class="ui-ntf__x" aria-label="关闭通知">×</button>' +
    (dur ? '<span class="ui-ntf__bar" style="--d:' + dur + 'ms"></span>' : '');
  /* 继承当前风格（通知挂在 body 上，自动跟随 html 的 data-style / data-theme） */
  root.prepend(el);
  while (root.children.length > 4) root.lastElementChild.remove();
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    el.classList.add('ui-ntf--out');
    setTimeout(() => el.remove(), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200);
    if (o.onClose) o.onClose();
  };
  el.querySelector('.ui-ntf__x').addEventListener('click', close);
  const a = el.querySelector('.ui-ntf__a');
  if (a) a.addEventListener('click', () => { if (o.onAction) o.onAction(); close(); });
  const bar = el.querySelector('.ui-ntf__bar');
  if (bar) bar.addEventListener('animationend', close);
  return { close: close, el: el };
}
if (typeof window !== 'undefined') window.uiNotify = notify;
