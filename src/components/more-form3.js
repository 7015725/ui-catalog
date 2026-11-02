/* =========================================================
   表单扩展（第四批）：ui-multi-select / ui-cascader / ui-transfer / ui-input-group
   ========================================================= */
import { UIElement, register } from './base.js';
import { Layer } from '../lib/positioner.js';
import { esc, splitList } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
function parseArr(text) { try { const v = JSON.parse(text || '[]'); return Array.isArray(v) ? v : null; } catch (e) { return null; } }
let uid = 0;

/* 选择器共用的触发器外观 */
const pickerCss = `
.ui-pick{display:flex;flex-direction:column;gap:5px;width:100%}
.ui-pick__label{font-size:12px;color:var(--ui-sub)}
.ui-pick__btn{
  display:flex;align-items:center;flex-wrap:wrap;gap:5px;width:100%;min-height:var(--ui-ctl-h);padding:5px 34px 5px 10px;
  position:relative;text-align:left;cursor:pointer;font:inherit;font-size:14px;color:var(--ui-text);
  background:var(--ui-panel-2);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);transition:var(--ui-motion)}
.ui-pick__btn:hover{border-color:var(--ui-brand)}
.ui-pick__btn:focus-visible,.ui-pick__btn[aria-expanded="true"]{outline:none;border-color:var(--ui-brand);box-shadow:var(--ui-ring);background:var(--ui-panel)}
.ui-pick__btn::after{content:"";position:absolute;right:13px;top:50%;width:7px;height:7px;margin-top:-6px;
  border-right:1.5px solid var(--ui-sub);border-bottom:1.5px solid var(--ui-sub);transform:rotate(45deg);transition:transform var(--ui-motion)}
.ui-pick__btn[aria-expanded="true"]::after{transform:rotate(-135deg);margin-top:-2px}
.ui-pick__ph{color:var(--ui-sub);padding-left:2px}
.ui-pick__chip{display:inline-flex;align-items:center;gap:3px;padding:1px 4px 1px 8px;font-size:12px;line-height:1.7;
  border-radius:var(--ui-radius-pill);background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-pick__chip b{font-weight:400;cursor:pointer;opacity:.6;padding:0 3px}
.ui-pick__chip b:hover{opacity:1}
.ui-pick__more{font-size:12px;color:var(--ui-sub)}
`;

/* ---------------- Multi Select 多选下拉 ---------------- */
export const multiSelectCss = pickerCss + `
ui-multi-select{display:block;width:100%}
.ui-ms-panel{min-width:200px;padding:6px}
.ui-ms-panel input[type="search"]{width:100%;height:32px;padding:0 10px;margin-bottom:6px;font:inherit;font-size:13px;color:var(--ui-text);
  background:var(--ui-panel-2);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);outline:none}
.ui-ms-panel input[type="search"]:focus{border-color:var(--ui-brand)}
.ui-ms-list{list-style:none;margin:0;padding:0;max-height:220px;overflow:auto}
.ui-ms-list li{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:var(--ui-radius-sm);cursor:pointer;font-size:13px;color:var(--ui-text)}
.ui-ms-list li:hover,.ui-ms-list li.cur{background:var(--ui-panel-2)}
.ui-ms-list li i{width:15px;height:15px;flex:0 0 auto;border:1.5px solid var(--ui-line);border-radius:4px;display:grid;place-items:center;
  font-style:normal;font-size:10px;color:var(--ui-brand-ink)}
.ui-ms-list li[aria-selected="true"] i{background:var(--ui-brand);border-color:var(--ui-brand)}
.ui-ms-list li[aria-selected="true"] i::before{content:"✓"}
.ui-ms-empty{padding:12px 8px;font-size:12.5px;color:var(--ui-sub)}
.ui-ms-ft{display:flex;justify-content:space-between;gap:8px;padding:6px 4px 0;margin-top:6px;border-top:1px solid var(--ui-line);font-size:12px}
.ui-ms-ft button{border:0;background:none;color:var(--ui-brand);cursor:pointer;font:inherit;padding:2px 4px}
`;

export class UIMultiSelect extends UIElement {
  static props = { label: { default: '' }, options: { default: '' }, value: { default: '' }, placeholder: { default: '请选择' }, max: { default: '3' } };
  template(p) {
    const sel = splitList(p.value);
    const show = Math.max(1, Number(p.max) || 3);
    const id = this._id || (this._id = 'ui-ms-' + (++uid));
    return '<div class="ui-pick">' + (p.label ? '<span class="ui-pick__label" id="' + id + '-l">' + esc(p.label) + '</span>' : '') +
      '<button type="button" class="ui-pick__btn" aria-haspopup="listbox" aria-expanded="false"' + (p.label ? ' aria-labelledby="' + id + '-l ' + id + '-v"' : '') + '>' +
      '<span id="' + id + '-v" style="display:contents">' +
      (sel.length ? sel.slice(0, show).map((v) => '<span class="ui-pick__chip">' + esc(v) + '<b data-rm="' + esc(v) + '" aria-hidden="true">×</b></span>').join('') +
        (sel.length > show ? '<span class="ui-pick__more">+' + (sel.length - show) + '</span>' : '')
        : '<span class="ui-pick__ph">' + esc(p.placeholder) + '</span>') +
      '</span></button></div>';
  }
  mounted() {
    const self = this;
    const btn = this.querySelector('.ui-pick__btn');
    if (!this._layer) {
      this._layer = new Layer('ui-ms-panel');
      this._layer.el.addEventListener('close', () => { const b = self.querySelector('.ui-pick__btn'); if (b) b.setAttribute('aria-expanded', 'false'); });
    }
    const layer = this._layer;
    const opts = () => splitList(self.props.options);
    let q = '', cur = 0;
    const draw = (keepFocus) => {
      const sel = splitList(self.props.value);
      const list = opts().filter((o) => !q || o.toLowerCase().indexOf(q.toLowerCase()) > -1);
      cur = Math.min(cur, Math.max(0, list.length - 1));
      const lis = list.length ? list.map((o, i) => '<li role="option" data-v="' + esc(o) + '" aria-selected="' + (sel.indexOf(o) > -1) + '"' + (i === cur ? ' class="cur"' : '') + '><i aria-hidden="true"></i>' + esc(o) + '</li>').join('')
        : '<li class="ui-ms-empty" role="presentation">没有匹配项</li>';
      const ul = layer.el.querySelector('.ui-ms-list');
      if (ul && keepFocus) { ul.innerHTML = lis; layer.el.querySelector('.ui-ms-ft span').textContent = '已选 ' + sel.length + ' / ' + opts().length; return; }
      layer.setContent('<input type="search" placeholder="筛选…" aria-label="筛选选项" value="' + esc(q) + '">' +
        '<ul class="ui-ms-list" role="listbox" aria-multiselectable="true">' + lis + '</ul>' +
        '<div class="ui-ms-ft"><span>已选 ' + sel.length + ' / ' + opts().length + '</span><span><button type="button" data-act="all">全选</button><button type="button" data-act="none">清空</button></span></div>');
      const inp = layer.el.querySelector('input');
      inp.addEventListener('input', () => { q = inp.value; cur = 0; draw(true); });
      inp.addEventListener('keydown', (e) => {
        const items = layer.el.querySelectorAll('li[data-v]');
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); if (!items.length) return;
          cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; draw(true);
          const c = layer.el.querySelector('li.cur'); if (c) c.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') { e.preventDefault(); if (items[cur]) toggle(items[cur].dataset.v); }
        else if (e.key === 'Escape') { layer.hide(); const b = self.querySelector('.ui-pick__btn'); if (b) b.focus(); }
      });
    };
    const write = (sel) => {
      self.setAttribute('value', sel.join(','));
      emit(self, 'change', { value: sel });
      if (!layer.el.hidden) { draw(true); const b = self.querySelector('.ui-pick__btn'); if (b) { layer.anchor = b; b.setAttribute('aria-expanded', 'true'); layer.reposition(); } }
    };
    const toggle = (v) => {
      let sel = splitList(self.props.value);
      sel = sel.indexOf(v) > -1 ? sel.filter((x) => x !== v) : sel.concat(v);
      /* 保持与 options 一致的顺序 */
      write(opts().filter((o) => sel.indexOf(o) > -1));
    };
    if (!layer._wired) {
      layer._wired = true;
      layer.el.addEventListener('click', (e) => {
        const li = e.target.closest('li[data-v]');
        if (li) { toggle(li.dataset.v); return; }
        const act = e.target.closest('[data-act]');
        if (act) write(act.dataset.act === 'all' ? opts() : []);
      });
    }
    btn.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-rm]');
      if (rm) { e.stopPropagation(); toggle(rm.dataset.rm); return; }
      if (!layer.el.hidden) { layer.hide(); return; }
      q = ''; cur = 0; draw(false);
      layer.el.style.minWidth = btn.offsetWidth + 'px';
      layer.show(btn, 'bottom-start', 6, e);
      btn.setAttribute('aria-expanded', 'true');
      layer.el.querySelector('input').focus();
    });
  }
  disconnectedCallback() { if (this._layer) { this._layer.destroy(); this._layer = null; } }
}
register('ui-multi-select', UIMultiSelect, multiSelectCss);

/* ---------------- Cascader 级联选择 ---------------- */
export const cascaderCss = `
ui-cascader{display:block;width:100%}
.ui-cas-panel{display:flex;padding:4px;max-width:calc(100vw - 16px);overflow-x:auto}
.ui-cas-col{list-style:none;margin:0;padding:2px;min-width:120px;max-height:240px;overflow:auto}
.ui-cas-col + .ui-cas-col{border-left:1px solid var(--ui-line)}
.ui-cas-col li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;
  font-size:13px;color:var(--ui-text);border-radius:var(--ui-radius-sm);cursor:pointer;white-space:nowrap}
.ui-cas-col li:hover{background:var(--ui-panel-2)}
.ui-cas-col li[aria-selected="true"]{background:var(--ui-brand-soft);color:var(--ui-brand);font-weight:600}
.ui-cas-col li span{color:var(--ui-sub);font-size:10px}
`;

export class UICascader extends UIElement {
  static props = { label: { default: '' }, options: { default: '[]' }, value: { default: '' }, placeholder: { default: '请选择' } };
  _tree() { return parseArr(this.props.options) || []; }
  template(p) {
    if (!parseArr(p.options)) return '<div style="font-size:12.5px;color:var(--ui-sub)">options 需要是合法 JSON 数组</div>';
    const path = String(p.value || '').split('/').filter(Boolean);
    const id = this._id || (this._id = 'ui-cas-' + (++uid));
    return '<div class="ui-pick">' + (p.label ? '<span class="ui-pick__label" id="' + id + '-l">' + esc(p.label) + '</span>' : '') +
      '<button type="button" class="ui-pick__btn" aria-haspopup="tree" aria-expanded="false"' + (p.label ? ' aria-labelledby="' + id + '-l ' + id + '-v"' : '') + '>' +
      '<span id="' + id + '-v">' + (path.length ? esc(path.join(' / ')) : '<span class="ui-pick__ph">' + esc(p.placeholder) + '</span>') + '</span></button></div>';
  }
  mounted() {
    const self = this;
    const btn = this.querySelector('.ui-pick__btn');
    if (!btn) return;
    if (!this._layer) {
      this._layer = new Layer('ui-cas-panel');
      this._layer.el.addEventListener('close', () => { const b = self.querySelector('.ui-pick__btn'); if (b) b.setAttribute('aria-expanded', 'false'); });
      this._layer.el.addEventListener('click', (e) => {
        const li = e.target.closest('li[data-d]');
        if (!li) return;
        const d = Number(li.dataset.d);
        self._path = self._path.slice(0, d).concat(li.dataset.v);
        const node = self._nodeAt(self._path);
        if (node && Array.isArray(node.children) && node.children.length) { self._draw(); self._layer.reposition(); }
        else {
          self._layer.hide();
          const v = self._path.join('/');
          self.setAttribute('value', v);
          const b = self.querySelector('.ui-pick__btn'); if (b) b.focus();
          emit(self, 'change', { value: v, path: self._path.slice() });
        }
      });
      this._layer.el.addEventListener('keydown', (e) => {
        const li = e.target.closest('li[data-d]');
        if (!li) return;
        const col = li.parentElement;
        const items = Array.from(col.children);
        const i = items.indexOf(li);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]; n.focus(); }
        else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault(); li.click();
          const next = self._layer.el.querySelectorAll('.ui-cas-col')[Number(li.dataset.d) + 1];
          if (next && next.firstElementChild) next.firstElementChild.focus();
        } else if (e.key === 'ArrowLeft') {
          const prev = self._layer.el.querySelectorAll('.ui-cas-col')[Number(li.dataset.d) - 1];
          const s = prev && (prev.querySelector('[aria-selected="true"]') || prev.firstElementChild); if (s) s.focus();
        }
      });
    }
    btn.addEventListener('click', (e) => {
      if (!self._layer.el.hidden) { self._layer.hide(); return; }
      self._path = String(self.props.value || '').split('/').filter(Boolean);
      self._draw();
      self._layer.show(btn, 'bottom-start', 6, e);
      btn.setAttribute('aria-expanded', 'true');
      const first = self._layer.el.querySelector('[aria-selected="true"]') || self._layer.el.querySelector('li');
      if (first) first.focus();
    });
  }
  _nodeAt(path) {
    let list = this._tree(), node = null;
    for (const v of path) { node = list.find((n) => String(n.label) === v); if (!node) return null; list = node.children || []; }
    return node;
  }
  _draw() {
    const cols = [];
    let list = this._tree();
    for (let d = 0; list && list.length; d++) {
      const pick = this._path[d];
      cols.push('<ul class="ui-cas-col" role="group">' + list.map((n) =>
        '<li tabindex="-1" role="treeitem" data-d="' + d + '" data-v="' + esc(n.label) + '" aria-selected="' + (String(n.label) === pick) + '"' +
        (n.children && n.children.length ? ' aria-expanded="' + (String(n.label) === pick) + '"' : '') + '>' + esc(n.label) +
        (n.children && n.children.length ? '<span aria-hidden="true">▶</span>' : '') + '</li>').join('') + '</ul>');
      const node = list.find((n) => String(n.label) === pick);
      list = node && node.children;
    }
    this._layer.setContent('<div role="tree" style="display:contents">' + cols.join('') + '</div>');
  }
  disconnectedCallback() { if (this._layer) { this._layer.destroy(); this._layer = null; } }
}
register('ui-cascader', UICascader, cascaderCss);

/* ---------------- Transfer 穿梭框 ---------------- */
export const transferCss = `
ui-transfer{display:block;width:100%;container-type:inline-size}
.ui-tf{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}
.ui-tf__box{display:flex;flex-direction:column;min-width:0;height:220px;background:var(--ui-panel);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);overflow:hidden}
.ui-tf__hd{display:flex;align-items:center;gap:8px;padding:8px 10px;font-size:12.5px;color:var(--ui-text);
  background:var(--ui-panel-2);border-bottom:var(--ui-border-w) solid var(--ui-line)}
.ui-tf__hd span{margin-left:auto;color:var(--ui-sub);font-size:11.5px;font-variant-numeric:tabular-nums}
.ui-tf__list{list-style:none;margin:0;padding:4px;overflow:auto;flex:1}
.ui-tf__list label{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:var(--ui-radius-sm);font-size:13px;color:var(--ui-text);cursor:pointer}
.ui-tf__list label:hover{background:var(--ui-panel-2)}
.ui-tf input[type="checkbox"]{accent-color:var(--ui-brand);width:15px;height:15px;margin:0}
.ui-tf__empty{padding:20px 8px;text-align:center;font-size:12px;color:var(--ui-sub)}
.ui-tf__ops{display:flex;flex-direction:column;gap:8px}
.ui-tf__ops button{width:34px;height:30px;cursor:pointer;font:inherit;font-size:14px;color:var(--ui-text);
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);transition:var(--ui-motion)}
.ui-tf__ops button:hover:not(:disabled){border-color:var(--ui-brand);color:var(--ui-brand)}
.ui-tf__ops button:disabled{opacity:.4;cursor:not-allowed}
@container (max-width:420px){
  .ui-tf{grid-template-columns:1fr}
  .ui-tf__ops{flex-direction:row;justify-content:center}
  .ui-tf__ops button{transform:rotate(90deg)}
  .ui-tf__box{height:170px}
}
`;

export class UITransfer extends UIElement {
  static props = { options: { default: '' }, value: { default: '' }, titles: { default: '待选,已选' } };
  template(p) {
    const all = splitList(p.options);
    const right = splitList(p.value).filter((v) => all.indexOf(v) > -1);
    const left = all.filter((v) => right.indexOf(v) < 0);
    const t = splitList(p.titles);
    const box = (side, title, list) => '<div class="ui-tf__box" data-side="' + side + '">' +
      '<div class="ui-tf__hd"><input type="checkbox" data-all aria-label="全选' + esc(title) + '"' + (list.length ? '' : ' disabled') + '>' + esc(title) + '<span>' + list.length + ' 项</span></div>' +
      '<ul class="ui-tf__list">' + (list.length ? list.map((v) => '<li><label><input type="checkbox" value="' + esc(v) + '">' + esc(v) + '</label></li>').join('') : '<li class="ui-tf__empty">暂无数据</li>') + '</ul></div>';
    return '<div class="ui-tf">' + box('l', t[0] || '待选', left) +
      '<div class="ui-tf__ops"><button type="button" data-mv="r" aria-label="移到右侧" disabled>›</button><button type="button" data-mv="l" aria-label="移到左侧" disabled>‹</button></div>' +
      box('r', t[1] || '已选', right) + '</div>';
  }
  mounted() {
    const self = this;
    const sync = () => {
      ['l', 'r'].forEach((s) => {
        const box = self.querySelector('[data-side="' + s + '"]');
        const items = box.querySelectorAll('li input');
        const n = Array.from(items).filter((x) => x.checked).length;
        const all = box.querySelector('[data-all]');
        all.checked = items.length > 0 && n === items.length;
        all.indeterminate = n > 0 && n < items.length;
        self.querySelector('[data-mv="' + (s === 'l' ? 'r' : 'l') + '"]').disabled = n === 0;
      });
    };
    this.querySelectorAll('[data-all]').forEach((a) => a.addEventListener('change', () => {
      a.closest('.ui-tf__box').querySelectorAll('li input').forEach((x) => { x.checked = a.checked; });
      sync();
    }));
    this.querySelectorAll('li input').forEach((x) => x.addEventListener('change', sync));
    this.querySelectorAll('[data-mv]').forEach((b) => b.addEventListener('click', () => {
      const from = self.querySelector('[data-side="' + (b.dataset.mv === 'r' ? 'l' : 'r') + '"]');
      const picked = Array.from(from.querySelectorAll('li input:checked')).map((x) => x.value);
      let right = splitList(self.props.value);
      right = b.dataset.mv === 'r' ? right.concat(picked) : right.filter((v) => picked.indexOf(v) < 0);
      const order = splitList(self.props.options);
      right = order.filter((v) => right.indexOf(v) > -1);
      self.setAttribute('value', right.join(','));
      const again = self.querySelector('[data-mv="' + b.dataset.mv + '"]');
      const target = self.querySelector('[data-side="' + b.dataset.mv + '"] [data-all]');
      (again && !again.disabled ? again : target).focus();
      emit(self, 'change', { value: right });
    }));
  }
}
register('ui-transfer', UITransfer, transferCss);

/* ---------------- Input Group 复合输入 ---------------- */
export const inputGroupCss = `
ui-input-group{display:block;width:100%}
.ui-ig{display:flex;flex-direction:column;gap:5px}
.ui-ig__label{font-size:12px;color:var(--ui-sub)}
.ui-ig__box{display:flex;align-items:stretch;height:var(--ui-ctl-h);background:var(--ui-panel-2);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);overflow:hidden;transition:var(--ui-motion)}
.ui-ig__box:focus-within{border-color:var(--ui-brand);box-shadow:var(--ui-ring);background:var(--ui-panel)}
.ui-ig__add{display:flex;align-items:center;padding:0 12px;font-size:13px;color:var(--ui-sub);white-space:nowrap;
  background:var(--ui-panel);flex:0 0 auto}
.ui-ig__add:first-child{border-right:var(--ui-border-w) solid var(--ui-line)}
.ui-ig__add:last-child{border-left:var(--ui-border-w) solid var(--ui-line)}
.ui-ig__ico{display:flex;align-items:center;padding-left:12px;color:var(--ui-sub);font-size:14px}
.ui-ig__box input{flex:1;min-width:0;border:0;outline:none;background:none;padding:0 12px;font:inherit;font-size:14px;color:var(--ui-text)}
.ui-ig__box input::placeholder{color:var(--ui-sub);opacity:1}
.ui-ig__btn{flex:0 0 auto;border:0;padding:0 16px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;
  background:var(--ui-brand);color:var(--ui-brand-ink);transition:var(--ui-motion)}
.ui-ig__btn:hover{filter:brightness(1.06)}
.ui-ig__btn:focus-visible{outline:2px solid var(--ui-text);outline-offset:-4px}
`;

export class UIInputGroup extends UIElement {
  static props = { label: { default: '' }, prefix: { default: '' }, suffix: { default: '' }, icon: { default: '' }, button: { default: '' }, placeholder: { default: '' }, type: { default: 'text' }, value: { default: '' } };
  template(p) {
    const id = this._id || (this._id = 'ui-ig-' + (++uid));
    return '<div class="ui-ig">' + (p.label ? '<label class="ui-ig__label" for="' + id + '">' + esc(p.label) + '</label>' : '') +
      '<div class="ui-ig__box">' +
      (p.prefix ? '<span class="ui-ig__add">' + esc(p.prefix) + '</span>' : '') +
      (p.icon ? '<span class="ui-ig__ico" aria-hidden="true">' + esc(p.icon) + '</span>' : '') +
      '<input id="' + id + '" type="' + esc(p.type) + '" placeholder="' + esc(p.placeholder) + '" value="' + esc(p.value) + '"' + (p.label ? '' : ' aria-label="' + esc(p.placeholder || p.prefix || '输入') + '"') + '>' +
      (p.suffix ? '<span class="ui-ig__add">' + esc(p.suffix) + '</span>' : '') +
      (p.button ? '<button type="button" class="ui-ig__btn">' + esc(p.button) + '</button>' : '') +
      '</div></div>';
  }
  mounted() {
    const self = this;
    const input = this.querySelector('input');
    const fire = () => emit(self, 'submit', { value: input.value });
    const b = this.querySelector('.ui-ig__btn');
    if (b) b.addEventListener('click', fire);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) fire(); });
  }
}
register('ui-input-group', UIInputGroup, inputGroupCss);
