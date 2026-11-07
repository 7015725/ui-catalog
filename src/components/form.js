/* =========================================================
   表单类组件：ui-button / ui-input / ui-textarea / ui-select
              ui-switch / ui-slider / ui-checkbox / ui-radio
   ========================================================= */
import { UIElement, register } from './base.js';

/* ---------------- Button ---------------- */
export const buttonCss = `
.ui-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  height:var(--ui-ctl-h);padding:0 18px;
  font:inherit;font-size:14px;font-weight:500;line-height:1;
  color:var(--ui-text);background:var(--ui-panel);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
  cursor:pointer;transition:var(--ui-motion);user-select:none;white-space:nowrap;
  box-shadow:var(--ui-shadow-sm);
}
.ui-btn:hover:not(:disabled){border-color:var(--ui-brand);color:var(--ui-brand)}
.ui-btn:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-btn:active:not(:disabled){transform:translateY(1px)}
.ui-btn--primary{background:var(--ui-brand);border-color:var(--ui-brand);color:var(--ui-brand-ink);box-shadow:var(--ui-shadow)}
.ui-btn--primary:hover:not(:disabled){filter:brightness(1.06);color:var(--ui-brand-ink)}
.ui-btn--danger{background:var(--ui-danger-soft);border-color:var(--ui-danger);color:var(--ui-danger)}
.ui-btn--text{background:transparent;border-color:transparent;box-shadow:none;color:var(--ui-brand);padding:0 12px}
.ui-btn--text:hover:not(:disabled){background:var(--ui-brand-soft);border-color:transparent}
.ui-btn--sm{height:calc(var(--ui-ctl-h) - 8px);font-size:12.5px;padding:0 12px}
.ui-btn--lg{height:calc(var(--ui-ctl-h) + 6px);font-size:15px;padding:0 22px}
.ui-btn--block{display:flex;width:100%}
.ui-btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;transform:none}
html[data-style="brutal"] .ui-btn:active:not(:disabled){transform:translate(3px,3px);box-shadow:none}
/* —— 扩展变体 —— */
.ui-btn--outline{background:transparent;border-color:var(--ui-brand);color:var(--ui-brand);box-shadow:none}
.ui-btn--outline:hover:not(:disabled){background:var(--ui-brand-soft)}
.ui-btn--soft{background:var(--ui-brand-soft);border-color:transparent;color:var(--ui-brand);box-shadow:none}
.ui-btn--soft:hover:not(:disabled){border-color:var(--ui-brand)}
.ui-btn--gradient{border-color:transparent;color:var(--ui-brand-ink);box-shadow:var(--ui-shadow);
  background:linear-gradient(135deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 55%,var(--ui-accent)))}
.ui-btn--gradient:hover:not(:disabled){filter:brightness(1.06) saturate(1.1);color:var(--ui-brand-ink)}
.ui-btn--success{background:var(--ui-ok);border-color:var(--ui-ok);color:var(--ui-on-color)}
.ui-btn--success:hover:not(:disabled){filter:brightness(1.06);color:var(--ui-on-color);border-color:var(--ui-ok)}
.ui-btn--pill{border-radius:var(--ui-radius-pill)}
.ui-btn--circle{border-radius:50%;width:var(--ui-ctl-h);padding:0}
.ui-btn--circle.ui-btn--sm{width:calc(var(--ui-ctl-h) - 8px)}
.ui-btn--circle.ui-btn--lg{width:calc(var(--ui-ctl-h) + 6px)}
.ui-btn--loading{pointer-events:none;opacity:.8}
.ui-btn__spin{width:13px;height:13px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;
  animation:ui-btn-spin .7s linear infinite}
@keyframes ui-btn-spin{to{transform:rotate(360deg)}}
`;

export class UIButton extends UIElement {
  static props = {
    variant: { default: 'default' },
    size: { default: 'md' },
    shape: { default: 'default' },
    block: { type: 'boolean' },
    loading: { type: 'boolean' },
    disabled: { type: 'boolean' }
  };
  template(p) {
    const cls = ['ui-btn', 'ui-btn--' + p.variant, 'ui-btn--' + p.size, p.block ? 'ui-btn--block' : '',
      p.shape !== 'default' ? 'ui-btn--' + p.shape : '', p.loading ? 'ui-btn--loading' : '']
      .filter(Boolean).join(' ');
    return '<button type="button" class="' + cls + '"' + (p.disabled ? ' disabled' : '') +
      (p.loading ? ' aria-busy="true"' : '') + '>' +
      (p.loading ? '<span class="ui-btn__spin" aria-hidden="true"></span>' : '') + '<slot></slot></button>';
  }
}
register('ui-button', UIButton, buttonCss);

/* ---------------- Input ---------------- */
export const fieldCss = `
.ui-field{display:flex;flex-direction:column;gap:5px;min-width:190px;flex:1}
.ui-field__label{font-size:12px;color:var(--ui-sub)}
.ui-field__hint{font-size:11px;color:var(--ui-sub);opacity:.9}
.ui-input,.ui-textarea{
  width:100%;font:inherit;font-size:14px;color:var(--ui-text);
  background:var(--ui-panel-2);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
  outline:none;transition:var(--ui-motion);padding:0 12px;height:var(--ui-ctl-h);
}
.ui-textarea{height:auto;min-height:76px;padding:10px 12px;resize:vertical;line-height:1.6}
.ui-input::placeholder,.ui-textarea::placeholder{color:var(--ui-sub);opacity:1}
.ui-input:focus,.ui-textarea:focus{border-color:var(--ui-brand);box-shadow:var(--ui-ring);background:var(--ui-panel)}
.ui-input:disabled,.ui-textarea:disabled{opacity:.5;cursor:not-allowed}
`;

export class UIInput extends UIElement {
  static props = {
    label: { default: '' },
    placeholder: { default: '' },
    type: { default: 'text' },
    value: { default: '' },
    hint: { default: '' },
    disabled: { type: 'boolean' }
  };
  template(p) {
    const label = p.label ? '<span class="ui-field__label">' + p.label + '</span>' : '';
    const hintId = p.hint ? 'ui-hint-' + Math.random().toString(36).slice(2, 8) : '';
    const hint = p.hint ? '<span class="ui-field__hint" id="' + hintId + '">' + p.hint + '</span>' : '';
    return '<label class="ui-field">' + label +
      '<input class="ui-input" type="' + p.type + '" placeholder="' + p.placeholder +
      '" value="' + p.value + '"' + (p.disabled ? ' disabled' : '') +
      (hintId ? ' aria-describedby="' + hintId + '"' : '') + '>' + hint + '</label>';
  }
}
register('ui-input', UIInput, fieldCss);

export class UITextarea extends UIElement {
  static props = {
    label: { default: '' },
    placeholder: { default: '' },
    value: { default: '' },
    rows: { default: '3' }
  };
  template(p) {
    const label = p.label ? '<span class="ui-field__label">' + p.label + '</span>' : '';
    /* textarea 的内容只能是纯文本，不能放 <slot> 占位元素，
       所以直接用 value 属性承载初值 */
    return '<label class="ui-field">' + label +
      '<textarea class="ui-textarea" rows="' + p.rows +
      '" placeholder="' + p.placeholder + '">' + p.value + '</textarea></label>';
  }
}
register('ui-textarea', UITextarea, fieldCss);

/* ---------------- Select ---------------- */
export const selectCss = `
.ui-select{
  width:100%;height:var(--ui-ctl-h);padding:0 34px 0 12px;
  font:inherit;font-size:14px;color:var(--ui-text);
  background-color:var(--ui-panel-2);
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.2' stroke-linecap='round'><path d='M6 9l6 6 6-6'/></svg>");
  background-repeat:no-repeat;background-position:right 12px center;
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
  outline:none;transition:var(--ui-motion);
  -webkit-appearance:none;appearance:none;
}
.ui-select:focus{border-color:var(--ui-brand);box-shadow:var(--ui-ring)}
`;

export class UISelect extends UIElement {
  static props = {
    label: { default: '' },
    options: { default: '' },
    value: { default: '' }
  };
  template(p) {
    const label = p.label ? '<span class="ui-field__label">' + p.label + '</span>' : '';
    const list = p.options.split(',').filter(Boolean).map(function (o) {
      const t = o.trim();
      return '<option' + (t === p.value ? ' selected' : '') + '>' + t + '</option>';
    }).join('');
    return '<label class="ui-field">' + label + '<select class="ui-select"' + (p.label ? '' : ' aria-label="请选择"') + '>' + list + '</select></label>';
  }
}
register('ui-select', UISelect, selectCss);

/* ---------------- Switch ---------------- */
export const switchCss = `
.ui-switch{display:inline-flex;align-items:center;gap:9px;cursor:pointer;font-size:13.5px;user-select:none;color:var(--ui-text)}
.ui-switch input{position:absolute;opacity:0;width:0;height:0}
.ui-switch__track{
  position:relative;width:42px;height:24px;flex:0 0 auto;
  border-radius:var(--ui-radius-pill);background:var(--ui-line);transition:var(--ui-motion);
}
.ui-switch__track::after{
  content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;
  background:var(--ui-panel);box-shadow:0 1px 3px rgba(0,0,0,.25);transition:var(--ui-motion);
}
.ui-switch input:checked+.ui-switch__track{background:var(--ui-brand)}
.ui-switch input:checked+.ui-switch__track::after{transform:translateX(18px);background:var(--ui-brand-ink)}
.ui-switch input:focus-visible+.ui-switch__track{box-shadow:var(--ui-ring)}
.ui-switch:has(input:disabled){opacity:.5;cursor:not-allowed}
`;

export class UISwitch extends UIElement {
  static props = {
    checked: { type: 'boolean' },
    disabled: { type: 'boolean' }
  };
  template(p) {
    return '<label class="ui-switch">' +
      '<input type="checkbox" role="switch"' + (p.checked ? ' checked' : '') +
      (p.disabled ? ' disabled' : '') + '>' +
      '<span class="ui-switch__track" aria-hidden="true"></span><span><slot></slot></span></label>';
  }
}
register('ui-switch', UISwitch, switchCss);

/* ---------------- Slider ---------------- */
export const sliderCss = `
.ui-slider{display:flex;flex-direction:column;gap:7px;min-width:190px;flex:1}
.ui-slider__head{display:flex;justify-content:space-between;font-size:12px;color:var(--ui-sub)}
.ui-slider__val{color:var(--ui-text);font-weight:600;font-variant-numeric:tabular-nums}
.ui-slider input{
  -webkit-appearance:none;appearance:none;width:100%;height:6px;margin:6px 0;
  border-radius:var(--ui-radius-pill);background:var(--ui-line);outline:none;
}
.ui-slider input::-webkit-slider-thumb{
  -webkit-appearance:none;width:18px;height:18px;border-radius:50%;
  background:var(--ui-brand);border:3px solid var(--ui-panel);
  box-shadow:var(--ui-shadow-sm);cursor:pointer;transition:var(--ui-motion);
}
.ui-slider input::-webkit-slider-thumb:hover{transform:scale(1.12)}
.ui-slider input::-moz-range-thumb{
  width:16px;height:16px;border-radius:50%;background:var(--ui-brand);border:3px solid var(--ui-panel);cursor:pointer;
}
.ui-slider input:focus-visible{box-shadow:var(--ui-ring)}
`;

export class UISlider extends UIElement {
  static props = {
    label: { default: '' },
    value: { default: '50' },
    min: { default: '0' },
    max: { default: '100' },
    step: { default: '1' }
  };
  template(p) {
    const id = this._sid || (this._sid = 'ui-slider-' + Math.random().toString(36).slice(2, 8));
    const label = p.label ? '<label for="' + id + '">' + p.label + '</label>' : '<span></span>';
    return '<div class="ui-slider"><div class="ui-slider__head">' + label +
      '<b class="ui-slider__val" aria-hidden="true">' + p.value + '</b></div>' +
      '<input type="range" id="' + id + '" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + p.value + '"' +
      (p.label ? '' : ' aria-label="滑块"') + '></div>';
  }
  mounted() {
    const input = this.querySelector('input');
    const out = this.querySelector('.ui-slider__val');
    if (input && out) {
      input.addEventListener('input', function () { out.textContent = input.value; });
    }
  }
}
register('ui-slider', UISlider, sliderCss);

/* ---------------- Checkbox / Radio ---------------- */
export const checkCss = `
.ui-check{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;cursor:pointer;user-select:none;color:var(--ui-text)}
.ui-check input{
  -webkit-appearance:none;appearance:none;position:relative;flex:0 0 auto;
  width:17px;height:17px;margin:0;cursor:pointer;
  border:var(--ui-border-w) solid var(--ui-line);border-radius:calc(var(--ui-radius-sm) - 3px);
  background:var(--ui-panel);transition:var(--ui-motion);
}
.ui-check input:checked{background:var(--ui-brand);border-color:var(--ui-brand)}
.ui-check input:checked::after{
  content:'';position:absolute;left:5.5px;top:2px;width:4px;height:9px;
  border:solid var(--ui-brand-ink);border-width:0 2px 2px 0;
  transform:rotate(45deg);
}
.ui-check input:focus-visible{box-shadow:var(--ui-ring)}
.ui-check:has(input:disabled){opacity:.5;cursor:not-allowed}
.ui-radio input{border-radius:50%}
.ui-radio input:checked::after{left:auto;top:auto;inset:3.5px;width:auto;height:auto;border:0;border-radius:50%;background:var(--ui-brand-ink);transform:none}
`;

export class UICheckbox extends UIElement {
  static props = {
    checked: { type: 'boolean' },
    disabled: { type: 'boolean' }
  };
  template(p) {
    return '<label class="ui-check"><input type="checkbox"' + (p.checked ? ' checked' : '') +
      (p.disabled ? ' disabled' : '') + '><span><slot></slot></span></label>';
  }
}
register('ui-checkbox', UICheckbox, checkCss);

export class UIRadio extends UIElement {
  static props = {
    name: { default: 'radio' },
    checked: { type: 'boolean' }
  };
  template(p) {
    return '<label class="ui-check ui-radio"><input type="radio" name="' + p.name + '"' +
      (p.checked ? ' checked' : '') + '><span><slot></slot></span></label>';
  }
}
register('ui-radio', UIRadio, checkCss);