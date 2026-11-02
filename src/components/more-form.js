/* =========================================================
   表单扩展：ui-number / ui-tag-input / ui-otp / ui-upload
            ui-color / ui-chips
   约定同 base.js：视觉值只用 var(--ui-*)，属性即 props
   ========================================================= */
import { UIElement, register } from './base.js';

const AMP = String.fromCharCode(38);
const ESC = { '&': AMP + 'amp;', '<': AMP + 'lt;', '>': AMP + 'gt;', '"': AMP + 'quot;' };
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (m) => ESC[m]);
export const splitList = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
let uid = 0;

/* ---------------- Number 数字步进器 ---------------- */
export const numberCss = `
ui-number{display:inline-block;max-width:100%}
.ui-num{display:inline-flex;flex-direction:column;gap:5px;max-width:100%}
.ui-num__label{font-size:12px;color:var(--ui-sub)}
.ui-num__box{
  display:inline-flex;align-items:stretch;height:var(--ui-ctl-h);max-width:100%;
  background:var(--ui-panel-2);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
  overflow:hidden;transition:var(--ui-motion);
}
.ui-num__box:focus-within{border-color:var(--ui-brand);box-shadow:var(--ui-ring);background:var(--ui-panel)}
.ui-num__btn{
  flex:0 0 auto;width:calc(var(--ui-ctl-h) - 4px);border:0;background:none;cursor:pointer;
  font:inherit;font-size:16px;line-height:1;color:var(--ui-sub);transition:var(--ui-motion);
}
.ui-num__btn:hover:not(:disabled){color:var(--ui-brand);background:var(--ui-brand-soft)}
.ui-num__btn:disabled{opacity:.35;cursor:not-allowed}
.ui-num__in{
  width:64px;min-width:0;border:0;outline:none;background:none;text-align:center;
  font:inherit;font-size:14px;color:var(--ui-text);font-variant-numeric:tabular-nums;
  border-left:var(--ui-border-w) solid var(--ui-line);border-right:var(--ui-border-w) solid var(--ui-line);
  -moz-appearance:textfield;
}
.ui-num__in::-webkit-inner-spin-button,.ui-num__in::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
.ui-num__suffix{align-self:center;padding:0 8px 0 0;font-size:12px;color:var(--ui-sub)}
`;

export class UINumber extends UIElement {
  static props = {
    label: { default: '' },
    value: { default: '0' },
    min: { default: '' },
    max: { default: '' },
    step: { default: '1' },
    suffix: { default: '' },
    disabled: { type: 'boolean' }
  };
  _clamp(v) {
    const p = this.props;
    if (p.min !== '' && v < Number(p.min)) v = Number(p.min);
    if (p.max !== '' && v > Number(p.max)) v = Number(p.max);
    const st = String(p.step);
    const dec = st.indexOf('.') > -1 ? st.split('.')[1].length : 0;
    return Number(v.toFixed(dec));
  }
  template(p) {
    const v = this._clamp(Number(p.value) || 0);
    const atMin = p.min !== '' && v <= Number(p.min);
    const atMax = p.max !== '' && v >= Number(p.max);
    const id = this._id || (this._id = 'ui-num-' + (++uid));
    return '<div class="ui-num">' +
      (p.label ? '<label class="ui-num__label" for="' + id + '">' + esc(p.label) + '</label>' : '') +
      '<div class="ui-num__box">' +
      '<button type="button" class="ui-num__btn" data-d="-1" aria-label="减少"' + (atMin || p.disabled ? ' disabled' : '') + '>−</button>' +
      '<input class="ui-num__in" id="' + id + '" type="number" inputmode="decimal" value="' + v + '"' +
      (p.min !== '' ? ' min="' + esc(p.min) + '"' : '') + (p.max !== '' ? ' max="' + esc(p.max) + '"' : '') +
      ' step="' + esc(p.step) + '"' + (p.disabled ? ' disabled' : '') + '>' +
      (p.suffix ? '<span class="ui-num__suffix">' + esc(p.suffix) + '</span>' : '') +
      '<button type="button" class="ui-num__btn" data-d="1" aria-label="增加"' + (atMax || p.disabled ? ' disabled' : '') + '>+</button>' +
      '</div></div>';
  }
  mounted() {
    const self = this;
    const input = this.querySelector('input');
    const set = (v, refocus) => {
      const val = self._clamp(v);
      self.setAttribute('value', String(val));
      if (refocus) { const i = self.querySelector('input'); if (i) i.focus(); }
      emit(self, 'change', { value: val });
    };
    this.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => {
      /* 以「当前显示的值」（已夹取）为基准，避免越界初值导致第一次点击无效 */
      set(self._clamp(Number(self.props.value) || 0) + Number(b.dataset.d) * (Number(self.props.step) || 1), false);
    }));
    input.addEventListener('change', () => set(Number(input.value) || 0, false));
    input.addEventListener('keydown', (e) => {
      const st = Number(self.props.step) || 1;
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        set((Number(input.value) || 0) + (e.key === 'ArrowUp' ? st : -st), true);
      }
    });
  }
}
register('ui-number', UINumber, numberCss);

/* ---------------- Tag Input 标签输入 ---------------- */
export const tagInputCss = `
ui-tag-input{display:block;width:100%}
.ui-ti{display:flex;flex-direction:column;gap:5px}
.ui-ti__label{font-size:12px;color:var(--ui-sub)}
.ui-ti__box{
  display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-height:var(--ui-ctl-h);
  padding:5px 8px;cursor:text;
  background:var(--ui-panel-2);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
  transition:var(--ui-motion);
}
.ui-ti__box:focus-within{border-color:var(--ui-brand);box-shadow:var(--ui-ring);background:var(--ui-panel)}
.ui-ti__chip{
  display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 9px;
  font-size:12px;line-height:1.6;border-radius:var(--ui-radius-pill);
  background:var(--ui-brand-soft);color:var(--ui-brand);
}
.ui-ti__x{border:0;background:none;color:inherit;cursor:pointer;font:inherit;font-size:13px;line-height:1;
  width:16px;height:16px;border-radius:50%;opacity:.6;padding:0}
.ui-ti__x:hover{opacity:1;background:color-mix(in srgb,var(--ui-brand) 16%,transparent)}
.ui-ti__in{flex:1;min-width:80px;border:0;outline:none;background:none;font:inherit;font-size:13.5px;color:var(--ui-text);height:26px}
.ui-ti__in::placeholder{color:var(--ui-sub);opacity:1}
.ui-ti__hint{font-size:11px;color:var(--ui-sub)}
`;

export class UITagInput extends UIElement {
  static props = {
    label: { default: '' },
    value: { default: '' },
    placeholder: { default: '输入后回车添加' },
    max: { default: '' }
  };
  template(p) {
    const list = splitList(p.value);
    const full = p.max !== '' && list.length >= Number(p.max);
    return '<div class="ui-ti">' +
      (p.label ? '<span class="ui-ti__label">' + esc(p.label) + '</span>' : '') +
      '<div class="ui-ti__box">' + list.map((t, i) =>
        '<span class="ui-ti__chip">' + esc(t) + '<button type="button" class="ui-ti__x" data-i="' + i + '" aria-label="移除 ' + esc(t) + '">×</button></span>'
      ).join('') +
      '<input class="ui-ti__in" aria-label="' + esc(p.label || '添加标签') + '" placeholder="' + (full ? '' : esc(p.placeholder)) + '"' + (full ? ' disabled' : '') + '>' +
      '</div>' + (p.max !== '' ? '<span class="ui-ti__hint">' + list.length + ' / ' + esc(p.max) + '</span>' : '') +
      '</div>';
  }
  mounted() {
    const self = this;
    const input = this.querySelector('.ui-ti__in');
    const write = (list) => {
      self.setAttribute('value', list.join(','));
      const again = self.querySelector('.ui-ti__in');
      if (again && !again.disabled) again.focus();
      emit(self, 'change', { value: list });
    };
    this.querySelector('.ui-ti__box').addEventListener('click', (e) => { if (e.target.classList.contains('ui-ti__box')) input.focus(); });
    this.querySelectorAll('.ui-ti__x').forEach((x) => x.addEventListener('click', () => {
      const list = splitList(self.props.value); list.splice(Number(x.dataset.i), 1); write(list);
    }));
    input.addEventListener('keydown', (e) => {
      const list = splitList(self.props.value);
      if ((e.key === 'Enter' || e.key === ',') && !e.isComposing) {
        e.preventDefault();
        const t = input.value.replace(/,/g, '').trim();
        if (t && list.indexOf(t) < 0) { list.push(t); write(list); } else input.value = '';
      } else if (e.key === 'Backspace' && !input.value && list.length) {
        list.pop(); write(list);
      }
    });
  }
}
register('ui-tag-input', UITagInput, tagInputCss);

/* ---------------- OTP 验证码输入 ---------------- */
export const otpCss = `
ui-otp{display:inline-block;max-width:100%}
.ui-otp{display:flex;gap:8px;max-width:100%}
.ui-otp input{
  width:44px;height:52px;min-width:0;flex:0 1 44px;padding:0;
  text-align:center;font:inherit;font-size:20px;font-weight:600;color:var(--ui-text);
  background:var(--ui-panel-2);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
  outline:none;transition:var(--ui-motion);caret-color:var(--ui-brand);
}
.ui-otp input:focus{border-color:var(--ui-brand);box-shadow:var(--ui-ring);background:var(--ui-panel)}
.ui-otp--done input{border-color:var(--ui-ok);color:var(--ui-text);box-shadow:inset 0 -3px 0 var(--ui-ok)}
`;

export class UIOtp extends UIElement {
  static props = {
    length: { default: '6' },
    value: { default: '' }
  };
  template(p) {
    const n = Math.min(10, Math.max(3, Number(p.length) || 6));
    const v = String(p.value || '').replace(/\D/g, '').slice(0, n);
    let html = '';
    for (let i = 0; i < n; i++) {
      html += '<input inputmode="numeric" autocomplete="' + (i ? 'off' : 'one-time-code') + '" maxlength="1" aria-label="第 ' + (i + 1) + ' 位" value="' + (v[i] || '') + '">';
    }
    return '<div class="ui-otp' + (v.length === n ? ' ui-otp--done' : '') + '" role="group" aria-label="验证码">' + html + '</div>';
  }
  mounted() {
    const self = this;
    const boxes = Array.from(this.querySelectorAll('input'));
    const sync = (focusIdx) => {
      const val = boxes.map((b) => b.value).join('');
      self.setAttribute('value', val);
      const again = Array.from(self.querySelectorAll('input'));
      if (focusIdx != null && again[focusIdx]) again[focusIdx].focus();
      emit(self, 'change', { value: val });
      if (val.length === again.length) emit(self, 'complete', { value: val });
    };
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => {
        b.value = b.value.replace(/\D/g, '').slice(-1);
        sync(b.value ? Math.min(i + 1, boxes.length - 1) : i);
      });
      b.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !b.value && i > 0) { boxes[i - 1].value = ''; e.preventDefault(); sync(i - 1); }
        else if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
        else if (e.key === 'ArrowRight' && i < boxes.length - 1) boxes[i + 1].focus();
      });
      b.addEventListener('paste', (e) => {
        const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
        if (!t) return;
        e.preventDefault();
        boxes.forEach((x, k) => { if (k >= i && t[k - i]) x.value = t[k - i]; });
        sync(Math.min(i + t.length, boxes.length - 1));
      });
      b.addEventListener('focus', () => b.select());
    });
  }
}
register('ui-otp', UIOtp, otpCss);

/* ---------------- Upload 拖拽上传 ---------------- */
export const uploadCss = `
ui-upload{display:block;width:100%}
.ui-up{
  position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  padding:22px 16px;text-align:center;cursor:pointer;
  background:var(--ui-panel-2);color:var(--ui-sub);font-size:12.5px;
  border:var(--ui-border-w) dashed var(--ui-line);border-radius:var(--ui-radius-lg);
  transition:var(--ui-motion);
}
.ui-up:hover,.ui-up:focus-within,.ui-up--over{border-color:var(--ui-brand);color:var(--ui-text);background:var(--ui-brand-soft)}
.ui-up input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%}
.ui-up__ico{font-size:22px;line-height:1;color:var(--ui-brand)}
.ui-up__t{font-size:13.5px;color:var(--ui-text);font-weight:500}
.ui-up__t b{color:var(--ui-brand)}
.ui-up__list{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
.ui-up__list[hidden]{display:none}
.ui-up__list li{
  display:flex;align-items:center;gap:8px;padding:7px 10px;font-size:12.5px;
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);
}
.ui-up__list li span:first-of-type{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ui-text)}
.ui-up__list small{color:var(--ui-sub);font-variant-numeric:tabular-nums}
`;

const fmtSize = (n) => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB';

export class UIUpload extends UIElement {
  static props = {
    accept: { default: '' },
    multiple: { type: 'boolean' },
    tip: { default: '' }
  };
  template(p) {
    return '<label class="ui-up">' +
      '<input type="file"' + (p.accept ? ' accept="' + esc(p.accept) + '"' : '') + (p.multiple ? ' multiple' : '') + '>' +
      '<span class="ui-up__ico" aria-hidden="true">⇪</span>' +
      '<span class="ui-up__t">拖拽文件到这里，或 <b>点击选择</b></span>' +
      (p.tip ? '<span>' + esc(p.tip) + '</span>' : '') +
      '</label><ul class="ui-up__list" hidden></ul>';
  }
  mounted() {
    const self = this;
    const zone = this.querySelector('.ui-up');
    const input = this.querySelector('input');
    const list = this.querySelector('.ui-up__list');
    const show = (files) => {
      const arr = Array.from(files || []);
      list.hidden = !arr.length;
      list.innerHTML = arr.map((f) => '<li><span>📄 ' + esc(f.name) + '</span><small>' + fmtSize(f.size) + '</small></li>').join('');
      emit(self, 'change', { files: arr });
    };
    input.addEventListener('change', () => show(input.files));
    ['dragenter', 'dragover'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add('ui-up--over'); }));
    ['dragleave', 'drop'].forEach((t) => zone.addEventListener(t, () => zone.classList.remove('ui-up--over')));
    zone.addEventListener('drop', (e) => { e.preventDefault(); show(e.dataTransfer.files); });
  }
}
register('ui-upload', UIUpload, uploadCss);

/* ---------------- Color 色板选择 ---------------- */
export const colorCss = `
ui-color{display:inline-block;max-width:100%}
.ui-color{display:flex;flex-wrap:wrap;gap:8px}
.ui-color button{
  width:28px;height:28px;padding:0;cursor:pointer;border-radius:50%;
  border:2px solid var(--ui-panel);
  box-shadow:0 0 0 var(--ui-border-w) var(--ui-line);
  transition:var(--ui-motion);
}
.ui-color button:hover{transform:scale(1.1)}
.ui-color button[aria-checked="true"]{box-shadow:0 0 0 2px var(--ui-text)}
.ui-color button:focus-visible{outline:none;box-shadow:0 0 0 2px var(--ui-panel),0 0 0 4px var(--ui-brand)}
`;

export class UIColor extends UIElement {
  static props = {
    colors: { default: '#4f7cff,#8b5cf6,#ec4899,#f97316,#eab308,#22c55e,#14b8a6,#64748b' },
    value: { default: '' }
  };
  template(p) {
    const list = splitList(p.colors);
    const cur = p.value || list[0];
    return '<div class="ui-color" role="radiogroup" aria-label="颜色">' + list.map((c) => {
      const on = c.toLowerCase() === String(cur).toLowerCase();
      return '<button type="button" role="radio" aria-checked="' + on + '" aria-label="' + esc(c) + '" tabindex="' + (on ? 0 : -1) + '" data-v="' + esc(c) + '" style="background:' + esc(c) + '"></button>';
    }).join('') + '</div>';
  }
  mounted() {
    const self = this;
    const pick = (v, focus) => {
      self.setAttribute('value', v);
      if (focus) { const b = self.querySelector('[data-v="' + v + '"]'); if (b) b.focus(); }
      emit(self, 'change', { value: v });
    };
    const btns = Array.from(this.querySelectorAll('button'));
    btns.forEach((b, i) => {
      b.addEventListener('click', () => pick(b.dataset.v, false));
      b.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (d) { e.preventDefault(); pick(btns[(i + d + btns.length) % btns.length].dataset.v, true); }
      });
    });
  }
}
register('ui-color', UIColor, colorCss);

/* ---------------- Chips 筛选标签组 ---------------- */
export const chipsCss = `
ui-chips{display:block;max-width:100%}
.ui-chips{display:flex;flex-wrap:wrap;gap:8px}
.ui-chips button{
  display:inline-flex;align-items:center;gap:5px;
  font:inherit;font-size:12.5px;line-height:1;padding:7px 12px;cursor:pointer;
  color:var(--ui-sub);background:var(--ui-panel);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-pill);
  transition:var(--ui-motion);
}
.ui-chips button:hover{border-color:var(--ui-brand);color:var(--ui-text)}
.ui-chips button[aria-pressed="true"]{background:var(--ui-brand-soft);border-color:var(--ui-brand);color:var(--ui-brand);font-weight:600}
.ui-chips button[aria-pressed="true"]::before{content:"✓";font-size:11px}
.ui-chips button:focus-visible{outline:none;box-shadow:var(--ui-ring)}
`;

export class UIChips extends UIElement {
  static props = {
    items: { default: '' },
    value: { default: '' },
    single: { type: 'boolean' }
  };
  template(p) {
    const sel = splitList(p.value);
    return '<div class="ui-chips" role="group">' + splitList(p.items).map((t) =>
      '<button type="button" aria-pressed="' + (sel.indexOf(t) > -1) + '" data-v="' + esc(t) + '">' + esc(t) + '</button>'
    ).join('') + '</div>';
  }
  mounted() {
    const self = this;
    this.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.v;
      let sel = splitList(self.props.value);
      if (self.props.single) sel = sel[0] === v ? [] : [v];
      else sel = sel.indexOf(v) > -1 ? sel.filter((x) => x !== v) : sel.concat(v);
      self.setAttribute('value', sel.join(','));
      const again = self.querySelector('[data-v="' + v + '"]');
      if (again) again.focus();
      emit(self, 'change', { value: sel });
    }));
  }
}
register('ui-chips', UIChips, chipsCss);
