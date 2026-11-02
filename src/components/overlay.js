/* =========================================================
   浮层类组件：ui-dropdown / ui-tooltip / ui-toast
   ========================================================= */
import { UIElement, register } from './base.js';
import { Layer } from '../lib/positioner.js';

/* ---------------- Dropdown ---------------- */
export const dropdownCss = `
.ui-dd__caret{font-size:9px;opacity:.55;margin-left:2px;transition:var(--ui-motion)}
.ui-dd[data-open] .ui-dd__caret{transform:rotate(180deg)}
.ui-menu{list-style:none;margin:0;padding:0;min-width:160px}
.ui-menu button{
  display:flex;align-items:center;gap:8px;width:100%;text-align:left;
  font:inherit;font-size:13px;padding:8px 10px;
  border:0;border-radius:var(--ui-radius-sm);
  background:none;color:var(--ui-text);cursor:pointer;transition:var(--ui-motion);
}
.ui-menu button:hover{background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-menu button:focus{background:var(--ui-brand-soft);color:var(--ui-brand);outline:none}
.ui-menu button:focus-visible{box-shadow:inset 0 0 0 2px var(--ui-brand)}
.ui-menu button:disabled{opacity:.4;cursor:not-allowed;background:none;color:var(--ui-sub)}
.ui-menu .danger{color:var(--ui-danger)}
.ui-menu .danger:hover{background:var(--ui-danger-soft);color:var(--ui-danger)}
.ui-menu__sep{height:1px;background:var(--ui-line);margin:4px 6px}
`;

export class UIDropdown extends UIElement {
  static props = {
    items: { default: '' },
    placement: { default: 'bottom-start' },
    variant: { default: 'default' },
    size: { default: 'md' }
  };
  template(p) {
    return '<span class="ui-dd"><button type="button" class="ui-btn ui-btn--' + p.variant +
      ' ui-btn--' + p.size + '" aria-haspopup="menu" aria-expanded="false">' +
      '<slot></slot><span class="ui-dd__caret" aria-hidden="true">▼</span></button></span>';
  }
  mounted(p) {
    const host = this;
    const btn = this.querySelector('button');

    if (this._layer) { this._layer.destroy(); this._layer = null; }
    if (!btn) return;

    const rows = p.items.split(',').filter(Boolean).map(function (raw, i) {
      const t = raw.trim();
      if (t === '-') return '<li class="ui-menu__sep" role="separator"></li>';
      const danger = /^!/.test(t) ? ' class="danger"' : '';
      return '<li role="none"><button type="button" role="menuitem" tabindex="-1" data-i="' + i + '"' +
        danger + '>' + t.replace(/^!/, '') + '</button></li>';
    }).join('');

    const layer = new Layer();
    layer.setContent('<ul class="ui-menu" role="menu">' + rows + '</ul>');

    const items = function () {
      return Array.prototype.slice.call(layer.el.querySelectorAll('[data-i]'));
    };
    const focusAt = function (i) {
      const list = items();
      if (!list.length) return;
      const n = list.length;
      list[((i % n) + n) % n].focus();
    };
    const closeAndReturn = function () {
      layer.hide();
      btn.focus();
    };

    layer.el.addEventListener('click', function (e) {
      const item = e.target.closest('[data-i]');
      if (!item) return;
      host.dispatchEvent(new CustomEvent('select', {
        detail: { index: Number(item.dataset.i), label: item.textContent.trim() },
        bubbles: true
      }));
      layer.hide();
      btn.focus();
    });

    /* 菜单内键盘：↑↓ 循环、Home/End、Esc 关闭并归还焦点 */
    layer.el.addEventListener('keydown', function (e) {
      const list = items();
      const cur = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); focusAt(cur + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusAt(cur - 1); }
      else if (e.key === 'Home') { e.preventDefault(); focusAt(0); }
      else if (e.key === 'End') { e.preventDefault(); focusAt(list.length - 1); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeAndReturn(); }
      else if (e.key === 'Tab') { layer.hide(); }
    });

    layer.el.addEventListener('open', function () {
      host.setAttribute('data-open', '');
      btn.setAttribute('aria-expanded', 'true');
    });
    layer.el.addEventListener('close', function () {
      host.removeAttribute('data-open');
      btn.setAttribute('aria-expanded', 'false');
    });

    btn.addEventListener('click', function (e) {
      layer.toggle(btn, p.placement, 6, e);
    });

    /* ↓ 直接从触发器进入菜单第一项 */
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (layer.el.hidden) layer.show(btn, p.placement, 6);
        focusAt(0);
      }
    });

    this._layer = layer;
  }
  disconnectedCallback() {
    if (this._layer) { this._layer.destroy(); this._layer = null; }
  }
}
register('ui-dropdown', UIDropdown, dropdownCss);

/* ---------------- Tooltip ---------------- */
export const tooltipCss = `
.ui-layer.ui-tip{
  padding:6px 10px;font-size:12px;line-height:1.5;max-width:240px;
  pointer-events:none;border-radius:var(--ui-radius-sm);
  background:var(--ui-text);color:var(--ui-bg);border-color:transparent;
  box-shadow:var(--ui-shadow);
}
.ui-tip-host{display:inline-flex}
`;

export class UITooltip extends UIElement {
  static props = {
    text: { default: '' },
    placement: { default: 'top-center' }
  };
  template() {
    return '<span class="ui-tip-host"><slot></slot></span>';
  }
  mounted(p) {
    if (this._layer) { this._layer.destroy(); this._layer = null; }
    const host = this.querySelector('.ui-tip-host');
    if (!host || !p.text) return;

    const layer = new Layer('ui-tip');
    layer.el.textContent = p.text;
    layer.el.id = 'ui-tip-' + Math.random().toString(36).slice(2, 8);
    layer.el.setAttribute('role', 'tooltip');

    let timer;
    const open = function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        layer.show(host, p.placement, 8);
        host.setAttribute('aria-describedby', layer.el.id);
      }, 120);
    };
    const close = function () {
      clearTimeout(timer);
      layer.hide();
      host.removeAttribute('aria-describedby');
    };

    host.addEventListener('mouseenter', open);
    host.addEventListener('mouseleave', close);
    host.addEventListener('focusin', open);
    host.addEventListener('focusout', close);

    this._layer = layer;
  }
  disconnectedCallback() {
    if (this._layer) { this._layer.destroy(); this._layer = null; }
  }
}
register('ui-tooltip', UITooltip, tooltipCss);

/* ---------------- Toast ---------------- */
export const toastCss = `
#ui-toast-root{
  position:fixed;left:50%;bottom:36px;transform:translateX(-50%);
  z-index:400;display:flex;flex-direction:column;align-items:center;gap:8px;
  pointer-events:none;
}
.ui-toast{
  background:var(--ui-text);color:var(--ui-bg);
  font-size:13px;line-height:1.5;padding:10px 16px;
  border-radius:var(--ui-radius);box-shadow:var(--ui-shadow);
  animation:ui-toast-in .2s ease;
  transition:opacity .2s ease, transform .2s ease;
  max-width:min(320px, 80vw);
}
@keyframes ui-toast-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
`;

/* Toast 不是自定义元素，没有 register() 帮它注入样式，这里手动注入 */
(function injectToastCss() {
  if (document.querySelector('style[data-lib="ui-toast"]')) return;
  const s = document.createElement('style');
  s.dataset.lib = 'ui-toast';
  s.textContent = toastCss;
  document.head.appendChild(s);
})();

function toastRoot() {
  let root = document.getElementById('ui-toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'ui-toast-root';
    document.body.appendChild(root);
  }
  return root;
}

/**
 * 全局轻提示
 * @param {string} message
 * @param {{duration?: number}} [opts]
 */
export function toast(message, opts) {
  const duration = (opts && opts.duration) || 1800;
  const el = document.createElement('div');
  el.className = 'ui-toast';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.textContent = message;
  toastRoot().appendChild(el);
  setTimeout(function () {
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    setTimeout(function () { el.remove(); }, 220);
  }, duration);
}

/* 供 demo / 控制台直接调用 */
if (typeof window !== 'undefined') {
  window.uiToast = toast;
}