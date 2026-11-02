/* =========================================================
   手风琴 ui-accordion
   —— items 传 JSON：{ title, content }
   —— 默认单开，multiple 允许同时展开；open 指定初始展开项索引
   —— ARIA：button[aria-expanded] + region[aria-labelledby]
   ========================================================= */
import { UIElement, register } from './base.js';

export const accordionCss = `
.ui-acc{width:100%;display:flex;flex-direction:column;gap:8px}
.ui-acc__item{
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
  background:var(--ui-panel);overflow:hidden;
}
.ui-acc__hd{
  display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;
  padding:10px 13px;border:0;background:none;cursor:pointer;
  font:inherit;font-size:13px;font-weight:500;color:var(--ui-text);
  text-align:left;transition:var(--ui-motion);
}
.ui-acc__hd:hover{background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-acc__hd:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--ui-brand)}
.ui-acc__ico{
  flex:0 0 auto;font-size:10px;color:var(--ui-sub);
  transition:transform var(--ui-motion);
}
.ui-acc__hd[aria-expanded="true"] .ui-acc__ico{transform:rotate(180deg)}
.ui-acc__bd{
  padding:0 13px 11px;font-size:12.5px;line-height:1.75;color:var(--ui-sub);
}
.ui-acc__bd[hidden]{display:none}
.ui-acc__err{padding:10px;font-size:12.5px;color:var(--ui-sub)}
`;

export class UIAccordion extends UIElement {
  static props = {
    items: { default: '[]' },
    open: { default: '' },
    multiple: { type: 'boolean' }
  };

  template(p) {
    let items = [];
    try {
      items = JSON.parse(p.items || '[]');
    } catch (e) {
      return '<div class="ui-acc__err">items 需要是合法 JSON 数组</div>';
    }
    if (!Array.isArray(items) || !items.length) {
      return '<div class="ui-acc__err">items 为空</div>';
    }

    const openSet = String(p.open).split(',').map(function (s) { return Number(s.trim()); });
    const seed = Math.random().toString(36).slice(2, 7);

    return '<div class="ui-acc">' + items.map(function (it, i) {
      const open = openSet.indexOf(i) > -1;
      const hid = 'ui-acc-h-' + seed + '-' + i;
      const pid = 'ui-acc-p-' + seed + '-' + i;
      return '<div class="ui-acc__item">' +
        '<button type="button" class="ui-acc__hd" id="' + hid + '" data-i="' + i + '"' +
        ' aria-expanded="' + (open ? 'true' : 'false') + '" aria-controls="' + pid + '">' +
        '<span>' + (it.title == null ? '' : it.title) + '</span>' +
        '<span class="ui-acc__ico" aria-hidden="true">▾</span></button>' +
        '<div class="ui-acc__bd" id="' + pid + '" role="region" aria-labelledby="' + hid + '"' +
        (open ? '' : ' hidden') + '>' + (it.content == null ? '' : it.content) + '</div>' +
        '</div>';
    }).join('') + '</div>';
  }

  mounted(p) {
    if (this._bound) return;
    this._bound = true;
    const host = this;

    const heads = function () {
      return Array.prototype.slice.call(host.querySelectorAll('.ui-acc__hd'));
    };

    const toggle = function (btn) {
      const panel = host.querySelector('#' + btn.getAttribute('aria-controls'));
      if (!panel) return;
      const willOpen = panel.hidden;
      if (willOpen && !host.props.multiple) {
        heads().forEach(function (b) {
          if (b === btn) return;
          b.setAttribute('aria-expanded', 'false');
          const other = host.querySelector('#' + b.getAttribute('aria-controls'));
          if (other) other.hidden = true;
        });
      }
      panel.hidden = !willOpen;
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    };

    this.addEventListener('click', function (e) {
      const btn = e.target.closest('.ui-acc__hd');
      if (btn) toggle(btn);
    });

    this.addEventListener('keydown', function (e) {
      const cur = e.target.closest('.ui-acc__hd');
      if (!cur) return;
      const list = heads();
      const i = list.indexOf(cur);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[i + 1] && list[i + 1].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[i - 1] && list[i - 1].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); list[0] && list[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); list[list.length - 1] && list[list.length - 1].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(cur); }
    });
  }
}
register('ui-accordion', UIAccordion, accordionCss);