/* =========================================================
   对话框 ui-modal
   —— 内容以「节点搬运」方式在宿主与遮罩面板之间来回移动，
      保留原有事件绑定（clone 会丢）
   —— Esc 关闭、遮罩点击关闭、Tab 焦点陷阱、关闭后归还焦点
   ========================================================= */
import { UIElement, register } from './base.js';
import { FOCUSABLE, trapTab } from '../lib/focus.js';

export const modalCss = `
.ui-modal-mask{
  position:fixed;inset:0;z-index:350;display:grid;place-items:center;padding:20px;
  background:rgba(15,18,24,.5);
  backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);
  animation:ui-fade-in .18s ease;
}
/* 作者样式里的 display 会覆盖 UA 的 [hidden]{display:none}，必须显式补回 */
.ui-modal-mask[hidden]{display:none}
.ui-modal{
  width:min(420px,92vw);max-height:min(86vh,660px);
  display:flex;flex-direction:column;overflow:hidden;
  background:var(--ui-panel);color:var(--ui-text);
  border:var(--ui-border-w) solid var(--ui-line);
  border-radius:var(--ui-radius-lg);
  box-shadow:var(--ui-shadow);
  animation:ui-pop-in .2s ease;
  outline:none;
}
.ui-modal__hd{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:13px 16px;border-bottom:1px dashed var(--ui-line);
}
.ui-modal__t{font-size:14px;font-weight:600}
.ui-modal__x{
  flex:0 0 auto;width:26px;height:26px;display:grid;place-items:center;
  border:0;border-radius:var(--ui-radius-sm);background:none;
  color:var(--ui-sub);font:inherit;font-size:17px;line-height:1;cursor:pointer;
  transition:var(--ui-motion);
}
.ui-modal__x:hover{background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-modal__bd{padding:16px;overflow:auto;font-size:13px;color:var(--ui-sub);line-height:1.75}
@keyframes ui-fade-in{from{opacity:0}to{opacity:1}}
@keyframes ui-pop-in{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
`;

export class UIModal extends UIElement {
  static props = {
    title: { default: '对话框' },
    open: { type: 'boolean' },
    width: { default: '' },
    'no-mask-close': { type: 'boolean' }
  };

  /* 固定模板：内容先停在隐藏的 src 里，打开时搬进面板 */
  template() {
    return '<span class="ui-modal-src" hidden><slot></slot></span>';
  }

  mounted(p) {
    const self = this;
    const src = this.querySelector('.ui-modal-src');
    if (!src) return;

    if (!this._mask) {
      const mask = document.createElement('div');
      mask.className = 'ui-modal-mask';
      mask.hidden = true;
      mask.innerHTML = '<div class="ui-modal" role="dialog" aria-modal="true" tabindex="-1">' +
        '<div class="ui-modal__hd"><b class="ui-modal__t"></b>' +
        '<button type="button" class="ui-modal__x" aria-label="关闭">×</button></div>' +
        '<div class="ui-modal__bd"></div></div>';
      document.body.appendChild(mask);

      const panel = mask.querySelector('.ui-modal');
      const bd = mask.querySelector('.ui-modal__bd');

      mask.querySelector('.ui-modal__x').addEventListener('click', function () { self.close(); });
      mask.addEventListener('mousedown', function (e) {
        if (e.target === mask && !self.props['no-mask-close']) self.close();
      });
      this._onKey = function (e) {
        if (e.key === 'Escape') { e.stopPropagation(); self.close(); }
      };

      this._mask = mask;
      this._panel = panel;
      this._bd = bd;
      this._hd = mask.querySelector('.ui-modal__hd');
    }

    this._hd.querySelector('.ui-modal__t').textContent = p.title;
    this._panel.setAttribute('aria-label', p.title);
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

    const src = this.querySelector('.ui-modal-src');
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
    const src = this.querySelector('.ui-modal-src');
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
register('ui-modal', UIModal, modalCss);