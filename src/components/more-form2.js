/* =========================================================
   表单扩展（第三批）：ui-password / ui-range / ui-search / ui-option-cards
   拖动、输入这类高频交互不走 setAttribute 重绘（会打断拖动/丢光标），
   只在本地更新 DOM，必要时用 _silent 同步属性
   ========================================================= */
import { UIElement, register } from './base.js';
import { Layer } from '../lib/positioner.js';
import { esc, splitList } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
let uid = 0;

/** 只同步属性、不触发重绘 */
function setSilent(el, name, value) {
  el._silent = true;
  el.setAttribute(name, value);
  el._silent = false;
}
class QuietElement extends UIElement {
  attributeChangedCallback() {
    this._read();
    if (this._booted && !this._silent) this._render();
  }
}

/* ---------------- Password 密码 + 强度 ---------------- */
export const passwordCss = `
ui-password{display:block;width:100%}
.ui-pw{display:flex;flex-direction:column;gap:6px}
.ui-pw__label{font-size:12px;color:var(--ui-sub)}
.ui-pw__box{position:relative;display:flex}
.ui-pw__box .ui-input{padding-right:42px}
.ui-pw__eye{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:32px;height:32px;
  border:0;background:none;cursor:pointer;color:var(--ui-sub);font-size:15px;border-radius:var(--ui-radius-sm)}
.ui-pw__eye:hover{color:var(--ui-brand);background:var(--ui-brand-soft)}
.ui-pw__meter{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
.ui-pw__meter i{height:4px;border-radius:99px;background:var(--ui-line);transition:background var(--ui-motion)}
.ui-pw[data-lv="1"] .ui-pw__meter i:nth-child(-n+1){background:var(--ui-danger)}
.ui-pw[data-lv="2"] .ui-pw__meter i:nth-child(-n+2){background:var(--ui-warn)}
.ui-pw[data-lv="3"] .ui-pw__meter i:nth-child(-n+3){background:color-mix(in srgb,var(--ui-ok) 70%,var(--ui-warn))}
.ui-pw[data-lv="4"] .ui-pw__meter i{background:var(--ui-ok)}
.ui-pw__rules{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11.5px;color:var(--ui-sub)}
.ui-pw__rules li::before{content:"○ "}
.ui-pw__rules li.ok{color:var(--ui-ok)}
.ui-pw__rules li.ok::before{content:"✓ "}
.ui-pw__lv{font-size:11.5px;color:var(--ui-sub);text-align:right;min-height:1em}
`;

const PW_RULES = [
  ['至少 8 位', (v) => v.length >= 8],
  ['大小写字母', (v) => /[a-z]/.test(v) && /[A-Z]/.test(v)],
  ['包含数字', (v) => /\d/.test(v)],
  ['包含符号', (v) => /[^\w\s]/.test(v)]
];
const PW_TEXT = ['', '弱', '一般', '良好', '强'];

export class UIPassword extends UIElement {
  static props = { label: { default: '密码' }, placeholder: { default: '请输入密码' }, value: { default: '' }, meter: { default: 'true' } };
  template(p) {
    const id = this._id || (this._id = 'ui-pw-' + (++uid));
    const showMeter = p.meter !== 'false';
    return '<div class="ui-pw" data-lv="0">' +
      '<label class="ui-pw__label" for="' + id + '">' + esc(p.label) + '</label>' +
      '<div class="ui-pw__box"><input class="ui-input" id="' + id + '" type="password" autocomplete="new-password" placeholder="' + esc(p.placeholder) + '" value="' + esc(p.value) + '"' +
      (showMeter ? ' aria-describedby="' + id + '-r"' : '') + '>' +
      '<button type="button" class="ui-pw__eye" aria-label="显示密码" aria-pressed="false">👁</button></div>' +
      (showMeter ? '<div class="ui-pw__meter" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
        '<ul class="ui-pw__rules" id="' + id + '-r">' + PW_RULES.map((r) => '<li>' + r[0] + '</li>').join('') + '</ul>' +
        '<div class="ui-pw__lv" aria-live="polite"></div>' : '') +
      '</div>';
  }
  mounted() {
    const self = this;
    const root = this.querySelector('.ui-pw');
    const input = this.querySelector('input');
    const eye = this.querySelector('.ui-pw__eye');
    const update = () => {
      const v = input.value;
      const passed = PW_RULES.map((r) => r[1](v));
      const lv = v ? Math.max(1, passed.filter(Boolean).length) : 0;
      root.dataset.lv = String(lv);
      self.querySelectorAll('.ui-pw__rules li').forEach((li, i) => li.classList.toggle('ok', passed[i]));
      const t = self.querySelector('.ui-pw__lv');
      if (t) t.textContent = lv ? '强度：' + PW_TEXT[lv] : '';
      return lv;
    };
    input.addEventListener('input', () => emit(self, 'change', { value: input.value, level: update() }));
    eye.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.setAttribute('aria-pressed', String(show));
      eye.setAttribute('aria-label', show ? '隐藏密码' : '显示密码');
      eye.textContent = show ? '🙈' : '👁';
      input.focus();
    });
    update();
  }
}
register('ui-password', UIPassword, passwordCss);

/* ---------------- Range 双滑块区间 ---------------- */
export const rangeCss = `
ui-range{display:block;width:100%}
.ui-rg{display:flex;flex-direction:column;gap:10px}
.ui-rg__hd{display:flex;justify-content:space-between;align-items:baseline;font-size:12px;color:var(--ui-sub)}
.ui-rg__hd b{color:var(--ui-text);font-size:13px;font-variant-numeric:tabular-nums}
.ui-rg__track{position:relative;height:22px}
.ui-rg__track::before,.ui-rg__fill{content:"";position:absolute;top:50%;height:6px;margin-top:-3px;border-radius:99px}
.ui-rg__track::before{left:0;right:0;background:var(--ui-line)}
.ui-rg__fill{background:var(--ui-brand)}
.ui-rg input{position:absolute;inset:0;width:100%;margin:0;background:none;pointer-events:none;
  -webkit-appearance:none;appearance:none;height:22px}
.ui-rg input::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:18px;height:18px;border-radius:50%;
  background:var(--ui-panel);border:2px solid var(--ui-brand);box-shadow:var(--ui-shadow-sm);cursor:grab}
.ui-rg input::-moz-range-thumb{pointer-events:auto;width:14px;height:14px;border-radius:50%;
  background:var(--ui-panel);border:2px solid var(--ui-brand);box-shadow:var(--ui-shadow-sm);cursor:grab}
.ui-rg input:focus-visible::-webkit-slider-thumb{box-shadow:var(--ui-ring)}
.ui-rg input:focus-visible::-moz-range-thumb{box-shadow:var(--ui-ring)}
.ui-rg input::-webkit-slider-runnable-track{background:none}
.ui-rg input::-moz-range-track{background:none}
.ui-rg__ticks{display:flex;justify-content:space-between;font-size:11px;color:var(--ui-sub);font-variant-numeric:tabular-nums}
`;

export class UIRange extends QuietElement {
  static props = {
    label: { default: '' }, min: { default: '0' }, max: { default: '100' }, step: { default: '1' },
    low: { default: '20' }, high: { default: '80' }, prefix: { default: '' }, suffix: { default: '' }
  };
  template(p) {
    const min = Number(p.min) || 0, max = Number(p.max) || 100;
    let lo = Math.max(min, Math.min(max, Number(p.low) || min));
    let hi = Math.max(min, Math.min(max, Number(p.high) || max));
    if (lo > hi) { const t = lo; lo = hi; hi = t; }
    const f = (v) => esc(p.prefix) + v + esc(p.suffix);
    return '<div class="ui-rg">' +
      '<div class="ui-rg__hd"><span>' + esc(p.label) + '</span><b class="ui-rg__val">' + f(lo) + ' – ' + f(hi) + '</b></div>' +
      '<div class="ui-rg__track"><span class="ui-rg__fill"></span>' +
      '<input type="range" data-k="low" min="' + min + '" max="' + max + '" step="' + esc(p.step) + '" value="' + lo + '" aria-label="' + esc(p.label || '区间') + ' 下限">' +
      '<input type="range" data-k="high" min="' + min + '" max="' + max + '" step="' + esc(p.step) + '" value="' + hi + '" aria-label="' + esc(p.label || '区间') + ' 上限">' +
      '</div><div class="ui-rg__ticks"><span>' + f(min) + '</span><span>' + f(max) + '</span></div></div>';
  }
  mounted() {
    const self = this;
    const [a, b] = this.querySelectorAll('input');
    const fill = this.querySelector('.ui-rg__fill');
    const val = this.querySelector('.ui-rg__val');
    const min = Number(a.min), max = Number(a.max);
    const f = (v) => self.props.prefix + v + self.props.suffix;
    const paint = (who) => {
      let lo = Number(a.value), hi = Number(b.value);
      if (lo > hi) { if (who === a) { a.value = hi; lo = hi; } else { b.value = lo; hi = lo; } }
      const pct = (v) => ((v - min) / (max - min || 1)) * 100;
      fill.style.left = pct(lo) + '%';
      fill.style.right = (100 - pct(hi)) + '%';
      val.textContent = f(lo) + ' – ' + f(hi);
      /* 两个滑块重叠在最右端时，让下限滑块在上层，避免卡死 */
      a.style.zIndex = lo >= max - (max - min) * 0.05 ? 2 : 1;
      return [lo, hi];
    };
    [a, b].forEach((inp) => {
      inp.addEventListener('input', () => { const r = paint(inp); emit(self, 'input', { low: r[0], high: r[1] }); });
      inp.addEventListener('change', () => {
        const r = paint(inp);
        setSilent(self, 'low', String(r[0])); setSilent(self, 'high', String(r[1]));
        emit(self, 'change', { low: r[0], high: r[1] });
      });
    });
    paint(null);
  }
}
register('ui-range', UIRange, rangeCss);

/* ---------------- Search 搜索 + 联想 ---------------- */
export const searchCss = `
ui-search{display:block;width:100%}
.ui-search{position:relative;display:flex;align-items:center}
.ui-search__ico{position:absolute;left:12px;color:var(--ui-sub);font-size:15px;pointer-events:none}
.ui-search .ui-input{padding-left:36px;padding-right:62px}
.ui-search .ui-input::-webkit-search-cancel-button{display:none}
.ui-search__x{position:absolute;right:38px;width:22px;height:22px;border:0;border-radius:50%;cursor:pointer;
  background:var(--ui-panel-2);color:var(--ui-sub);font-size:13px;line-height:1}
.ui-search__x[hidden]{display:none}
.ui-search__x:hover{color:var(--ui-text)}
.ui-search__k{position:absolute;right:8px;font-family:var(--ui-mono);font-size:11px;color:var(--ui-sub);
  padding:1px 6px;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);background:var(--ui-panel)}
.ui-sug{list-style:none;margin:0;padding:0;max-height:260px;overflow:auto}
.ui-sug li{display:flex;align-items:center;gap:8px;padding:8px 10px;font-size:13px;border-radius:var(--ui-radius-sm);cursor:pointer;color:var(--ui-text)}
.ui-sug li[aria-selected="true"],.ui-sug li:hover{background:var(--ui-brand-soft)}
.ui-sug li::before{content:"⌕";color:var(--ui-sub)}
.ui-sug mark{background:none;color:var(--ui-brand);font-weight:600}
.ui-sug__empty{padding:10px;font-size:12.5px;color:var(--ui-sub)}
`;

export class UISearch extends QuietElement {
  static props = { placeholder: { default: '搜索…' }, suggestions: { default: '' }, value: { default: '' }, shortcut: { default: '/' }, label: { default: '' } };
  template(p) {
    const id = this._id || (this._id = 'ui-search-' + (++uid));
    return '<div class="ui-search" role="search" aria-label="' + esc(p.label || p.placeholder) + '">' +
      '<span class="ui-search__ico" aria-hidden="true">⌕</span>' +
      '<input class="ui-input" type="search" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="' + id + '-l" ' +
      'placeholder="' + esc(p.placeholder) + '" value="' + esc(p.value) + '" aria-label="' + esc(p.placeholder) + '">' +
      '<button type="button" class="ui-search__x" aria-label="清空"' + (p.value ? '' : ' hidden') + '>×</button>' +
      (p.shortcut ? '<kbd class="ui-search__k" aria-hidden="true">' + esc(p.shortcut) + '</kbd>' : '') +
      '</div>';
  }
  mounted() {
    const self = this;
    const input = this.querySelector('input');
    const x = this.querySelector('.ui-search__x');
    if (this._layer) this._layer.destroy();
    const layer = this._layer = new Layer('ui-search-layer');
    const lid = this._id + '-l';
    let items = [], cur = -1;
    const close = () => { layer.hide(); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); };
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      items = q ? splitList(self.props.suggestions).filter((s) => s.toLowerCase().indexOf(q) > -1).slice(0, 8) : [];
      cur = -1;
      if (!q) { close(); return; }
      const hl = (s) => { const i = s.toLowerCase().indexOf(q); return esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + q.length)) + '</mark>' + esc(s.slice(i + q.length)); };
      layer.setContent(items.length
        ? '<ul class="ui-sug" role="listbox" id="' + lid + '">' + items.map((s, i) => '<li role="option" id="' + lid + '-' + i + '" data-i="' + i + '" aria-selected="false">' + hl(s) + '</li>').join('') + '</ul>'
        : '<div class="ui-sug__empty">没有匹配「' + esc(input.value.trim()) + '」的结果，回车直接搜索</div>');
      layer.el.style.minWidth = input.offsetWidth + 'px';
      if (layer.el.hidden) layer.show(input, 'bottom-start', 6); else layer.reposition();
      input.setAttribute('aria-expanded', 'true');
    };
    const mark = () => {
      layer.el.querySelectorAll('[role="option"]').forEach((li, i) => li.setAttribute('aria-selected', String(i === cur)));
      if (cur > -1) input.setAttribute('aria-activedescendant', lid + '-' + cur); else input.removeAttribute('aria-activedescendant');
    };
    const submit = (v) => {
      input.value = v; x.hidden = !v; close();
      setSilent(self, 'value', v);
      emit(self, 'search', { value: v });
    };
    input.addEventListener('input', () => { x.hidden = !input.value; draw(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!items.length) return;
        e.preventDefault();
        cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; mark();
      } else if (e.key === 'Enter') {
        e.preventDefault(); submit(cur > -1 ? items[cur] : input.value.trim());
      } else if (e.key === 'Escape') close();
    });
    layer.el.addEventListener('mousedown', (e) => e.preventDefault());
    layer.el.addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) submit(items[Number(li.dataset.i)]); });
    input.addEventListener('blur', () => setTimeout(close, 120));
    x.addEventListener('click', () => { input.value = ''; x.hidden = true; close(); input.focus(); setSilent(self, 'value', ''); });
    /* 页面级快捷键：按 shortcut（默认 /）聚焦，输入框里打字时不抢 */
    document.removeEventListener('keydown', this._hot || (() => {}));
    this._hot = (e) => {
      if (!self.props.shortcut || e.key !== self.props.shortcut || !self.isConnected) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (self.getBoundingClientRect().height === 0) return;
      e.preventDefault(); input.focus();
    };
    document.addEventListener('keydown', this._hot);
  }
  disconnectedCallback() {
    if (this._layer) { this._layer.destroy(); this._layer = null; }
    if (this._hot) document.removeEventListener('keydown', this._hot);
  }
}
register('ui-search', UISearch, searchCss);

/* ---------------- Option Cards 选项卡片 ---------------- */
export const optionCardsCss = `
ui-option-cards{display:block;width:100%}
.ui-oc{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:10px}
.ui-oc button{
  position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;
  padding:12px 14px;cursor:pointer;font:inherit;color:var(--ui-text);
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);
  box-shadow:var(--ui-shadow-sm);transition:var(--ui-motion);
}
.ui-oc button:hover{border-color:var(--ui-brand)}
.ui-oc button:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-oc button[aria-checked="true"]{border-color:var(--ui-brand);background:var(--ui-brand-soft);box-shadow:0 0 0 1px var(--ui-brand)}
.ui-oc button::after{content:"";position:absolute;top:12px;right:12px;width:16px;height:16px;border-radius:50%;
  border:var(--ui-border-w) solid var(--ui-line);background:var(--ui-panel);box-sizing:border-box;border-width:max(1px,var(--ui-border-w))}
.ui-oc button[aria-checked="true"]::after{border:5px solid var(--ui-brand)}
.ui-oc--multi button::after{border-radius:var(--ui-radius-sm)}
.ui-oc--multi button[aria-checked="true"]::after{content:"✓";border:0;background:var(--ui-brand);color:var(--ui-brand-ink);
  font-size:11px;display:grid;place-items:center;line-height:16px;text-align:center}
.ui-oc__ico{font-size:20px;line-height:1}
.ui-oc__t{font-size:13.5px;font-weight:600;padding-right:22px}
.ui-oc__d{font-size:12px;color:var(--ui-sub);line-height:1.5}
.ui-oc button[aria-checked="true"] .ui-oc__d{color:var(--ui-text)}
.ui-oc__p{margin-top:4px;font-size:15px;font-weight:700;color:var(--ui-brand);font-variant-numeric:tabular-nums}
`;

export class UIOptionCards extends UIElement {
  static props = { items: { default: '[]' }, value: { default: '' }, multiple: { type: 'boolean' } };
  template(p) {
    let list;
    try { list = JSON.parse(p.items || '[]'); } catch (e) { list = null; }
    if (!Array.isArray(list)) return '<div style="font-size:12.5px;color:var(--ui-sub)">items 需要是合法 JSON 数组</div>';
    const sel = splitList(p.value);
    const first = list.findIndex((it) => sel.indexOf(String(it.value)) > -1);
    return '<div class="ui-oc' + (p.multiple ? ' ui-oc--multi' : '') + '" role="' + (p.multiple ? 'group' : 'radiogroup') + '">' + list.map((it, i) => {
      const on = sel.indexOf(String(it.value)) > -1;
      const tab = p.multiple ? 0 : (on || (first < 0 && i === 0) ? 0 : -1);
      return '<button type="button" role="' + (p.multiple ? 'checkbox' : 'radio') + '" aria-checked="' + on + '" tabindex="' + tab + '" data-v="' + esc(it.value) + '">' +
        (it.icon ? '<span class="ui-oc__ico" aria-hidden="true">' + esc(it.icon) + '</span>' : '') +
        '<span class="ui-oc__t">' + esc(it.title) + '</span>' +
        (it.desc ? '<span class="ui-oc__d">' + esc(it.desc) + '</span>' : '') +
        (it.price ? '<span class="ui-oc__p">' + esc(it.price) + '</span>' : '') + '</button>';
    }).join('') + '</div>';
  }
  mounted() {
    const self = this;
    const btns = Array.from(this.querySelectorAll('button'));
    const pick = (v, focus) => {
      let sel = splitList(self.props.value);
      if (self.props.multiple) sel = sel.indexOf(v) > -1 ? sel.filter((x) => x !== v) : sel.concat(v);
      else sel = [v];
      self.setAttribute('value', sel.join(','));
      const again = self.querySelector('[data-v="' + v + '"]');
      if (again && focus !== false) again.focus();
      emit(self, 'change', { value: self.props.multiple ? sel : v });
    };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => pick(b.dataset.v));
      if (!self.props.multiple) b.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (d) { e.preventDefault(); pick(btns[(i + d + btns.length) % btns.length].dataset.v); }
      });
    });
  }
}
register('ui-option-cards', UIOptionCards, optionCardsCss);
