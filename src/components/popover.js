/* =========================================================
   气泡卡片 ui-popover
   —— 比 tooltip 重、比 modal 轻：可放按钮等可交互内容
   —— trigger="click" | "hover"
   ========================================================= */
import { UIElement, register } from './base.js';
import { Layer } from '../lib/positioner.js';

export const popoverCss = `
.ui-pop{display:inline-flex;align-items:center}
.ui-pop__panel{min-width:160px;max-width:280px;font-size:13px;line-height:1.7;color:var(--ui-text)}
.ui-pop__panel p{margin:0 0 8px}
.ui-pop__panel p:last-child{margin-bottom:0}
`;

export class UIPopover extends UIElement {
  static props = {
    content: { default: '' },
    placement: { default: 'bottom-start' },
    trigger: { default: 'click' }
  };

  template() {
    return '<span class="ui-pop"><slot></slot></span>';
  }

  mounted(p) {
    if (this._layer) { this._layer.destroy(); this._layer = null; }
    const host = this.querySelector('.ui-pop');
    if (!host) return;

    const layer = new Layer();
    layer.setContent('<div class="ui-pop__panel">' + (p.content || '') + '</div>');
    this._layer = layer;

    const open = function () {
      if (layer.el.hidden) layer.show(host, p.placement, 8);
    };
    const close = function () { layer.hide(); };

    if (p.trigger === 'hover') {
      let timer;
      const later = function () { timer = setTimeout(close, 140); };
      const cancel = function () { clearTimeout(timer); };
      host.addEventListener('mouseenter', function () { cancel(); open(); });
      host.addEventListener('mouseleave', later);
      host.addEventListener('focusin', open);
      host.addEventListener('focusout', later);
      layer.el.addEventListener('mouseenter', cancel);
      layer.el.addEventListener('mouseleave', later);
    } else {
      host.addEventListener('click', function (e) {
      e.stopPropagation();
      layer.toggle(host, p.placement, 8, e);
    });
    }
  }

  disconnectedCallback() {
    if (this._layer) { this._layer.destroy(); this._layer = null; }
  }
}
register('ui-popover', UIPopover, popoverCss);