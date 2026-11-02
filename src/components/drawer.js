/* =========================================================
   抽屉 ui-drawer
   —— 与 modal 同一套搬运/焦点策略，面板贴边、全高
   ========================================================= */
import { UIElement, register } from './base.js';
import { FOCUSABLE, trapTab } from '../lib/focus.js';

export const drawerCss = `
.ui-drawer-mask{
  position:fixed;inset:0;z-index:340;
  background:rgba(15,18,24,.45);
  animation:ui-fade-in .18s ease;
}
.ui-drawer{
  position:absolute;top:0;bottom:0;right:0;
  width:min(360px,88vw);max-width:100%;
  display:flex;flex-direction:column;
  background:var(--ui-panel);color:var(--ui-text);
  border-left:var(--ui-border-w) solid var(--ui-line);
  box-shadow:var(--ui-shadow);
  animation:ui-slide-in .22s ease;
  outline:none;
}
.ui-drawer[data-side="left"]{
  right:auto;left:0;
  border-left:0;border-right:var(--ui-border-w) solid var(--ui-line);
  animation-name:ui-slide-in-left;
}
.ui-drawer__hd{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:13px 16px;border-bottom:1px dashed var(--ui-line);
}
.ui-drawer__t{font-size:14px;font-weight:600}
.ui-drawer__x{
  flex:0 0 auto;width:26px;height:26px;display:grid;place-items:center;
  border:0;border-radius:var(--ui-radius-sm);background:none;
  color:var(--ui-sub);font:inherit;font-size:17px;line-height:1;cursor:pointer;
  transition:var(--ui-motion);
}
.ui-drawer__x:hover{background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-drawer__bd{flex:1;overflow:auto;padding:16px;font-size:13px;color:var(--ui-sub);line-height:1.75}
@keyframes ui-slide-in{from{transform:translateX(100%)}to{transform:none}}
@keyframes ui-slide-in-left{from{transform:translateX(-100%)}to{transform:none}}
`;

export class UIDrawer extends UIElement {
  static props = {
    title: { default: '抽屉' },
    open: { type: 'boolean' },
    side: { default: 'right' },
    width: { default: '' }
  };

  template() {
    return '<span class="ui-drawer-src" hidden><slot></slot></span>';
  }

  mounted(p) {
    const self = this;
    const src = this.querySelector('.ui-drawer-src');
    if (!src) return;

    if (!this._mask) {
      const mask = document.createElement('div');
      mask.className = 'ui-drawer-mask';
      mask.hidden = true;
      mask.innerHTML = '<div class="ui-drawer" role="dialog" aria-modal="true" tabindex="-1">' +
        '<div class="ui-drawer__hd"><b class="ui-drawer__t"></b>' +
        '<button type="button" class="ui-drawer__x" aria-label="关闭">×</button></div>' +
        '<div class="ui-drawer__bd"></div></div>';
      document.body.appendChild(mask);

      const panel = mask.querySelector('.ui-drawer');
      mask.querySelector('.ui-drawer__x').addEventListener('click', function () { self.close(); });
      mask.addEventListener('mousedown', function (e) {
        if (e.target === mask) self.close();
      });
      this._onKey = function (e) {
        if (e.key === 'Escape') { e.stopPropagation(); self.close(); }
      };

      this._mask = mask;
      this._panel = panel;
      this._bd = mask.querySelector('.ui-drawer__bd');
      this._hd = mask.querySelector('.ui-drawer__hd');
    }

    this._hd.querySelector('.ui-drawer__t').textContent = p.title;
    this._panel.setAttribute('aria-label', p.title);
    this._panel.dataset.side = p.side === 'left' ? 'left' : 'right';
    this._panel.style.width = p.width || '';

    if (p.open) this.show();
    else this.close();
  }

  attributeChangedCallback(name) {
    super.attributeChangedCallback(name);
    if (!this._booted) return;
    if (name === 'open') {
      if (this.props.open) this.show();
      else this.close();
    }
  }

  show() {
    if (!this._mask || !this._mask.hidden) return;
    this._lastFocus = document.activeElement;

    const src = this.querySelector('.ui-drawer-src');
    if (src) Array.from(src.childNodes).forEach((n) => this._bd.appendChild(n));

    this._mask.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this._onKey);
    this._unbindTrap = trapTab(this._panel);

    const first = this._panel.querySelector(FOCUSABLE);
    (first || this._panel).focus();
    this.dispatchEvent(new CustomEvent('open'));
  }

  close() {
    if (!this._mask || this._mask.hidden) return;
    const src = this.querySelector('.ui-drawer-src');
    if (src) Array.from(this._bd.childNodes).forEach((n) => src.appendChild(n));

    this._mask.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._onKey);
    if (this._unbindTrap) { this._unbindTrap(); this._unbindTrap = null; }
    if (this._lastFocus && this._lastFocus.focus) this._lastFocus.focus();
    this.dispatchEvent(new CustomEvent('close'));
  }

  disconnectedCallback() {
    this.close();
    if (this._mask) { this._mask.remove(); this._mask = null; }
  }
}
register('ui-drawer', UIDrawer, drawerCss);