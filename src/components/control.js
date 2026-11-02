/* =========================================================
   分段控制器 ui-segmented  +  评分 ui-rate
   ========================================================= */
import { UIElement, register } from './base.js';

/* ---------------- Segmented ---------------- */
export const segmentedCss = `
.ui-seg{
  display:inline-flex;gap:2px;padding:3px;
  background:var(--ui-panel-2);
  border:var(--ui-border-w) solid var(--ui-line);
  border-radius:var(--ui-radius);max-width:100%;
}
.ui-seg button{
  font:inherit;font-size:12.5px;line-height:1;padding:7px 13px;
  border:0;border-radius:calc(var(--ui-radius) - 3px);
  background:none;color:var(--ui-sub);cursor:pointer;
  transition:var(--ui-motion);white-space:nowrap;
}
.ui-seg button:hover{color:var(--ui-text)}
.ui-seg button.on{
  background:var(--ui-panel);color:var(--ui-brand);font-weight:600;
  box-shadow:var(--ui-shadow-sm);
}
.ui-seg button:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--ui-brand)}
html[data-style="brutal"] .ui-seg button.on{background:var(--ui-brand);color:var(--ui-brand-ink)}
`;

export class UISegmented extends UIElement {
  static props = {
    items: { default: '' },
    value: { default: '' }
  };

  template(p) {
    const list = p.items.split(',').filter(Boolean).map(function (s) { return s.trim(); });
    const current = p.value || list[0] || '';
    return '<div class="ui-seg" role="radiogroup">' + list.map(function (t, i) {
      const on = t === current;
      return '<button type="button" role="radio" data-i="' + i + '" data-v="' + t + '"' +
        ' aria-checked="' + (on ? 'true' : 'false') + '" tabindex="' + (on ? '0' : '-1') + '"' +
        (on ? ' class="on"' : '') + '>' + t + '</button>';
    }).join('') + '</div>';
  }

  mounted() {
    const self = this;
    const pick = function (btn, moveFocus) {
      const value = btn.dataset.v;
      self.setAttribute('value', value);
      /* 重渲染后节点已替换，重新取一次 */
      const again = self.querySelector('[data-v="' + value + '"]');
      if (moveFocus && again) again.focus();
      self.dispatchEvent(new CustomEvent('change', { detail: { value: value }, bubbles: true }));
    };

    this.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { pick(b, false); });
    });

    const group = this.querySelector('.ui-seg');
    if (!group) return;
    group.addEventListener('keydown', function (e) {
      const list = Array.prototype.slice.call(self.querySelectorAll('button'));
      const cur = list.indexOf(document.activeElement);
      let next = -1;
      if (e.key === 'ArrowRight') next = (cur + 1) % list.length;
      else if (e.key === 'ArrowLeft') next = (cur - 1 + list.length) % list.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = list.length - 1;
      if (next > -1) { e.preventDefault(); pick(list[next], true); }
    });
  }
}
register('ui-segmented', UISegmented, segmentedCss);

/* ---------------- Rate ---------------- */
export const rateCss = `
.ui-rate{
  display:inline-flex;align-items:center;gap:1px;
  padding:2px;border-radius:var(--ui-radius-sm);
}
.ui-rate__s{
  display:inline-block;user-select:none;
  border:0;background:none;padding:0 1px;cursor:pointer;
  font-size:19px;line-height:1;color:var(--ui-line);
  transition:var(--ui-motion);
}
.ui-rate__s.on{color:var(--ui-warn)}
.ui-rate__s:hover{transform:scale(1.14)}
.ui-rate__s[data-ro]{cursor:default}
.ui-rate__s[data-ro]:hover{transform:none}
.ui-rate:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-rate__n{margin-left:6px;font-size:12px;color:var(--ui-sub);font-variant-numeric:tabular-nums}
`;

export class UIRate extends UIElement {
  static props = {
    value: { default: '0' },
    max: { default: '5' },
    readonly: { type: 'boolean' }
  };

  template(p) {
    const max = Math.max(1, Number(p.max) || 5);
    const v = Math.max(0, Math.min(max, Number(p.value) || 0));
    let stars = '';
    for (let i = 1; i <= max; i++) {
      const on = i <= v;
      /* 外层已经是 role=slider，星星只做鼠标点击目标，不再是可聚焦按钮（避免交互元素嵌套） */
      stars += '<span class="ui-rate__s' + (on ? ' on' : '') + '" data-v="' + i + '" aria-hidden="true"' +
        (p.readonly ? ' data-ro' : '') + '>' + (on ? '★' : '☆') + '</span>';
    }
    return '<div class="ui-rate" role="slider" tabindex="' + (p.readonly ? '-1' : '0') + '"' +
      ' aria-valuemin="0" aria-valuemax="' + max + '" aria-valuenow="' + v + '"' +
      ' aria-valuetext="' + v + ' / ' + max + ' 星"' + (p.readonly ? ' aria-readonly="true"' : '') + ' aria-label="评分">' + stars +
      '<span class="ui-rate__n">' + v + '/' + max + '</span></div>';
  }

  mounted() {
    const self = this;
    const box = this.querySelector('.ui-rate');
    if (!box) return;

    const set = function (v) {
      const max = Number(self.props.max) || 5;
      const val = Math.max(0, Math.min(max, v));
      self.setAttribute('value', String(val));
      self.dispatchEvent(new CustomEvent('change', { detail: { value: val }, bubbles: true }));
    };

    box.querySelectorAll('[data-v]').forEach(function (b) {
      b.addEventListener('click', function () { if (!self.props.readonly) set(Number(b.dataset.v)); });
    });

    if (self.props.readonly) return;
    box.addEventListener('keydown', function (e) {
      const cur = Number(self.props.value) || 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(cur + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(cur - 1); }
      else if (e.key === 'Home') { e.preventDefault(); set(0); }
      else if (e.key === 'End') { e.preventDefault(); set(Number(self.props.max) || 5); }
    });
  }
}
register('ui-rate', UIRate, rateCss);