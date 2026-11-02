/* =========================================================
   UIElement —— 组件库基类
   约定：
   1. 每个组件 = 一个自定义元素 + 一段 CSS（由 register 注入）
   2. 所有视觉值必须走 var(--ui-*)，由 tokens.css 提供
   3. 内容通过 <slot></slot> 占位，首次连接时快照 innerHTML
   4. 属性 -> props 自动映射，boolean 类型按"存在即真"解析
   ========================================================= */

/** tag -> css 文本，供画廊"代码"面板展示 */
export const cssRegistry = new Map();
/** tag -> 组件类，供画廊生成「可用属性」文档 */
export const classRegistry = new Map();

function inject(tag, css) {
  if (document.querySelector('style[data-cmp="' + tag + '"]')) return;
  const el = document.createElement('style');
  el.setAttribute('data-cmp', tag);
  el.textContent = css;
  document.head.appendChild(el);
}

export function register(tag, cls, css) {
  if (css) {
    inject(tag, css);
    cssRegistry.set(tag, css.trim());
  }
  classRegistry.set(tag, cls);
  if (!customElements.get(tag)) customElements.define(tag, cls);
}

export class UIElement extends HTMLElement {
  static props = {};
  static css = '';

  static get observedAttributes() {
    return Object.keys(this.props || {});
  }

  constructor() {
    super();
    this._p = {};
    this._booted = false;
    this._keep = [];
    /* _lastTpl 保持 undefined，用于识别「首次渲染」 */
  }

  connectedCallback() {
    if (this._booted) return;
    const self = this;
    /* innerHTML 注入时，connectedCallback 会早于子节点解析完成，
       必须等到微任务里再快照原始内容，否则 slot 内容会丢失 */
    queueMicrotask(function () { self._boot(); });
  }

  attributeChangedCallback() {
    this._read();
    if (this._booted) this._render();
  }

  _boot() {
    if (this._booted) return;
    this._booted = true;
    this._bindInlineHandlers();
    this._read();
    this._render();
  }

  /* 让自定义事件也支持内联写法：<ui-popconfirm onconfirm="..."> 。
     原生事件（onclick / onchange / onselect…）浏览器自己处理，这里跳过避免触发两次 */
  _bindInlineHandlers() {
    const self = this;
    Array.prototype.forEach.call(this.attributes, function (a) {
      if (a.name.indexOf('on') !== 0 || a.name.length < 3) return;
      if (a.name in HTMLElement.prototype) return;
      let fn;
      try { fn = new Function('event', a.value); } catch (e) { console.error('[' + self.localName + '] ' + a.name + ' 语法错误', e); return; }
      self.addEventListener(a.name.slice(2), function (ev) { return fn.call(self, ev); });
    });
  }

  _collectSlotNodes() {
    const slot = this.querySelector('slot');
    return slot ? Array.from(slot.childNodes) : (this._keep || []);
  }

  _read() {
    const defs = this.constructor.props || {};
    for (const key of Object.keys(defs)) {
      const def = defs[key];
      if ((def.type || 'string') === 'boolean') {
        this._p[key] = this.hasAttribute(key);
      } else {
        const v = this.getAttribute(key);
        this._p[key] = v === null ? def.default : v;
      }
    }
  }

  get props() {
    return this._p;
  }

  _render() {
    const tpl = this.template(this._p);
    if (tpl == null) return;
    if (this._lastTpl === tpl) return;

    /* 首次渲染：原始子节点在元素自身里；之后重渲染：子节点在 slot 占位处 */
    const keep = this._lastTpl === undefined
      ? Array.from(this.childNodes)
      : this._collectSlotNodes();

    this._lastTpl = tpl;
    this._keep = keep;
    this.innerHTML = tpl;

    const ph = this.querySelector('slot');
    if (ph) {
      if (keep.length) {
        const f = document.createDocumentFragment();
        keep.forEach(function (n) { f.appendChild(n); });
        ph.replaceWith(f);
      } else {
        ph.remove();
      }
    }

    if (this.mounted) this.mounted(this._p);
  }

  /** 子类实现 */
  template() {
    return null;
  }
}

/** 把一段 HTML 字符串变成 DOM 节点，便于 mounted 里精细绑定 */
export function frag(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}
