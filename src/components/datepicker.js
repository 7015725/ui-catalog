/* =========================================================
   日期选择 ui-datepicker
   —— 面板走 Layer（portal + fixed），月份切换只重绘面板内容
   ========================================================= */
import { UIElement, register } from './base.js';
import { Layer } from '../lib/positioner.js';
import { esc } from './more-form.js';

const WEEK = ['一', '二', '三', '四', '五', '六', '日'];

const pad = (n) => (n < 10 ? '0' + n : '' + n);
const ymd = (y, m, d) => y + '-' + pad(m + 1) + '-' + pad(d);

function gridHTML(view, value, focusKey) {
  const y = view.y;
  const m = view.m;
  const first = new Date(y, m, 1);
  // 周一为一周起点
  let lead = first.getDay();
  lead = lead === 0 ? 6 : lead - 1;

  const total = new Date(y, m + 1, 0).getDate();
  const now = new Date();
  const todayKey = ymd(now.getFullYear(), now.getMonth(), now.getDate());

  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<span class="ui-dp__cell ui-dp__cell--empty"></span>';
  for (let d = 1; d <= total; d++) {
    const k = ymd(y, m, d);
    const cls = ['ui-dp__cell'];
    const selected = k === value;
    if (selected) cls.push('on');
    if (k === todayKey) cls.push('today');
    cells += '<button type="button" role="gridcell" class="' + cls.join(' ') + '" data-d="' + k +
      '" tabindex="' + (k === focusKey ? '0' : '-1') +
      '" aria-selected="' + (selected ? 'true' : 'false') + '">' + d + '</button>';
  }
  return cells;
}

export const datepickerCss = `
.ui-dp{display:inline-flex;flex-direction:column;gap:5px;min-width:190px;flex:1}
.ui-dp__label{font-size:12px;color:var(--ui-sub)}
.ui-dp__btn{
  display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;
  height:var(--ui-ctl-h);padding:0 12px;
  font:inherit;font-size:14px;color:var(--ui-text);
  background:var(--ui-panel-2);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
  cursor:pointer;transition:var(--ui-motion);
}
.ui-dp__btn:hover{border-color:var(--ui-brand)}
.ui-dp__btn[aria-expanded="true"]{border-color:var(--ui-brand);box-shadow:var(--ui-ring);background:var(--ui-panel)}
.ui-dp__ph{color:var(--ui-sub)}
.ui-dp__ico{font-size:12px;opacity:.6}
.ui-dp__panel{width:254px;padding:8px}
.ui-dp__hd{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:2px 2px 8px}
.ui-dp__hd b{font-size:13px;letter-spacing:.3px}
.ui-dp__nav{
  width:26px;height:26px;display:grid;place-items:center;
  border:0;border-radius:var(--ui-radius-sm);background:none;
  color:var(--ui-sub);cursor:pointer;font:inherit;font-size:13px;transition:var(--ui-motion);
}
.ui-dp__nav:hover{background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-dp__week,.ui-dp__grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.ui-dp__week span{text-align:center;font-size:11px;color:var(--ui-sub);padding:2px 0}
.ui-dp__cell{
  height:30px;display:grid;place-items:center;
  border:1px solid transparent;border-radius:var(--ui-radius-sm);
  background:none;font:inherit;font-size:12.5px;color:var(--ui-text);
  cursor:pointer;transition:var(--ui-motion);font-variant-numeric:tabular-nums;
}
.ui-dp__cell:hover{background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-dp__cell.today{border-color:var(--ui-brand)}
.ui-dp__cell.on{background:var(--ui-brand);border-color:var(--ui-brand);color:var(--ui-brand-ink);font-weight:600}
.ui-dp__cell:focus{outline:none;box-shadow:inset 0 0 0 2px var(--ui-brand)}
.ui-dp__cell.on:focus{box-shadow:inset 0 0 0 2px var(--ui-brand-ink)}
.ui-dp__cell--empty{cursor:default;background:none}
`;

export class UIDatepicker extends UIElement {
  static props = {
    label: { default: '' },
    value: { default: '' },
    placeholder: { default: '选择日期' },
    placement: { default: 'bottom-start' }
  };

  template(p) {
    const label = p.label ? '<span class="ui-dp__label">' + esc(p.label) + '</span>' : '';
    const text = p.value
      ? '<span>' + esc(p.value) + '</span>'
      : '<span class="ui-dp__ph">' + esc(p.placeholder) + '</span>';
    return '<div class="ui-dp">' + label +
      '<button type="button" class="ui-dp__btn" aria-haspopup="dialog" aria-expanded="false"' +
      ' aria-label="' + esc((p.label ? p.label + '，' : '') + (p.value || p.placeholder)) + '">' + text +
      '<span class="ui-dp__ico" aria-hidden="true">📅</span></button></div>';
  }

  mounted(p) {
    const host = this;
    const btn = this.querySelector('.ui-dp__btn');

    if (this._layer) { this._layer.destroy(); this._layer = null; }
    if (!btn) return;

    const base = p.value ? new Date(p.value) : new Date();
    const ok = !isNaN(base.getTime());
    const view = { y: ok ? base.getFullYear() : new Date().getFullYear(),
                   m: ok ? base.getMonth() : new Date().getMonth() };
    /* 键盘焦点所在的日期（roving tabindex） */
    let cursor = ok ? new Date(base.getTime()) : new Date();

    const kOf = (dt) => ymd(dt.getFullYear(), dt.getMonth(), dt.getDate());

    const paint = () => {
      layer.setContent(
        '<div class="ui-dp__hd">' +
        '<button type="button" class="ui-dp__nav" data-nav="-1" aria-label="上个月">‹</button>' +
        '<b aria-live="polite">' + view.y + ' 年 ' + (view.m + 1) + ' 月</b>' +
        '<button type="button" class="ui-dp__nav" data-nav="1" aria-label="下个月">›</button></div>' +
        '<div class="ui-dp__week" role="row">' +
        WEEK.map(function (w) { return '<span role="columnheader">' + w + '</span>'; }).join('') +
        '</div>' +
        '<div class="ui-dp__grid" role="grid" aria-label="' + view.y + ' 年 ' + (view.m + 1) + ' 月">' +
        gridHTML(view, host.props.value, kOf(cursor)) + '</div>'
      );
    };

    const layer = new Layer('ui-dp__panel');
    layer.el.setAttribute('role', 'dialog');
    layer.el.setAttribute('aria-modal', 'false');
    layer.el.setAttribute('aria-label', '选择日期');
    paint();

    const cellOf = (k) => layer.el.querySelector('[data-d="' + k + '"]');

    const focusCell = (k) => {
      const el = cellOf(k);
      if (el) el.focus();
    };

    const pick = (value) => {
      layer.hide();
      host.setAttribute('value', value);
      /* setAttribute 会触发重渲染，旧的 btn 已被替换，必须重新取一次再聚焦 */
      const again = host.querySelector('.ui-dp__btn');
      if (again) again.focus();
      host.dispatchEvent(new CustomEvent('change', { detail: { value: value }, bubbles: true }));
    };

    /* 移动焦点：跨月时重绘，同月内只搬 tabindex */
    const move = (days) => {
      const d = new Date(cursor.getTime());
      d.setDate(d.getDate() + days);
      cursor = d;
      if (d.getMonth() !== view.m || d.getFullYear() !== view.y) {
        view.y = d.getFullYear();
        view.m = d.getMonth();
        paint();
      } else {
        const k = kOf(d);
        layer.el.querySelectorAll('[data-d]').forEach(function (b) {
          b.tabIndex = b.dataset.d === k ? 0 : -1;
        });
      }
      focusCell(kOf(cursor));
    };

    const shiftMonth = (delta) => {
      let m = view.m + delta;
      view.y += Math.floor(m / 12);
      m = ((m % 12) + 12) % 12;
      view.m = m;
      const lastDay = new Date(view.y, m + 1, 0).getDate();
      cursor = new Date(view.y, m, Math.min(cursor.getDate(), lastDay));
      paint();
      focusCell(kOf(cursor));
    };

    layer.el.addEventListener('click', function (e) {
      const nav = e.target.closest('[data-nav]');
      if (nav) {
        view.m += Number(nav.dataset.nav);
        if (view.m < 0) { view.m = 11; view.y -= 1; }
        if (view.m > 11) { view.m = 0; view.y += 1; }
        paint();
        return;
      }
      const day = e.target.closest('[data-d]');
      if (!day) return;
      pick(day.dataset.d);
    });

    layer.el.addEventListener('keydown', function (e) {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); move(-1); break;
        case 'ArrowRight': e.preventDefault(); move(1); break;
        case 'ArrowUp': e.preventDefault(); move(-7); break;
        case 'ArrowDown': e.preventDefault(); move(7); break;
        case 'Home': {
          e.preventDefault();
          const wd = cursor.getDay();
          move(-(wd === 0 ? 6 : wd - 1));
          break;
        }
        case 'End': {
          e.preventDefault();
          const wd = cursor.getDay();
          move(7 - (wd === 0 ? 7 : wd));
          break;
        }
        case 'PageUp': e.preventDefault(); shiftMonth(-1); break;
        case 'PageDown': e.preventDefault(); shiftMonth(1); break;
        case 'Escape': e.preventDefault(); e.stopPropagation(); layer.hide(); btn.focus(); break;
        case 'Enter':
        case ' ': {
          const cell = e.target.closest('[data-d]');
          if (cell) { e.preventDefault(); pick(cell.dataset.d); }
          break;
        }
        default: break;
      }
    });

    layer.el.addEventListener('open', function () { btn.setAttribute('aria-expanded', 'true'); });
    layer.el.addEventListener('close', function () { btn.setAttribute('aria-expanded', 'false'); });

    btn.addEventListener('click', function (e) {
      if (layer.el.hidden) {
        const cur = host.props.value ? new Date(host.props.value) : null;
        if (cur && !isNaN(cur.getTime())) {
          view.y = cur.getFullYear();
          view.m = cur.getMonth();
          cursor = new Date(cur.getTime());
        }
        paint();
        layer.show(btn, p.placement, 6, e);
        focusCell(kOf(cursor));
      } else {
        layer.hide();
      }
    });

    this._layer = layer;
  }

  disconnectedCallback() {
    if (this._layer) { this._layer.destroy(); this._layer = null; }
  }
}
register('ui-datepicker', UIDatepicker, datepickerCss);