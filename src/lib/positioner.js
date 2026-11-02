/* =========================================================
   浮层定位引擎
   —— 面板挂到 body（portal），用 position:fixed 定位：
      1) 不受父级 overflow:hidden 裁切
      2) 不受祖先 backdrop-filter / transform 变成包含块的影响
   —— 支持 flip：下方空间不足自动翻到上方
   ========================================================= */

const PORTAL_ID = 'ui-portal';

export const layerCss = `
.ui-layer{
  position:fixed;z-index:300;min-width:120px;padding:6px;
  background:var(--ui-panel);color:var(--ui-text);
  border:var(--ui-border-w) solid var(--ui-line);
  border-radius:var(--ui-radius-lg);
  box-shadow:var(--ui-shadow);
  backdrop-filter:blur(var(--ui-blur));-webkit-backdrop-filter:blur(var(--ui-blur));
  animation:ui-layer-in .16s ease;
}
/* 组件给面板加的 display（flex/grid）会盖掉 UA 的 [hidden]，这里统一兜底 */
.ui-layer[hidden]{display:none}
@keyframes ui-layer-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.ui-layer[data-side="top"]{animation-name:ui-layer-in-up}
@keyframes ui-layer-in-up{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
`;

function injectGlobal(id, css) {
  if (document.querySelector('style[data-lib="' + id + '"]')) return;
  const s = document.createElement('style');
  s.dataset.lib = id;
  s.textContent = css;
  document.head.appendChild(s);
}
injectGlobal('layer', layerCss);

function portal() {
  let p = document.getElementById(PORTAL_ID);
  if (!p) {
    p = document.createElement('div');
    p.id = PORTAL_ID;
    document.body.appendChild(p);
  }
  return p;
}

/** 计算并应用坐标（fixed 坐标系） */
export function place(anchor, panel, placement, offset) {
  const a = anchor.getBoundingClientRect();
  const pw = panel.offsetWidth;
  const ph = panel.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;

  let side = 'bottom';
  let align = 'start';
  const parts = String(placement || 'bottom-start').split('-');
  side = parts[0];
  align = parts[1] || 'start';

  // 垂直翻转
  const spaceBelow = vh - a.bottom - offset;
  const spaceAbove = a.top - offset;
  if (side === 'bottom' && ph > spaceBelow && spaceAbove > spaceBelow) side = 'top';
  else if (side === 'top' && ph > spaceAbove && spaceBelow > spaceAbove) side = 'bottom';

  let top = side === 'bottom' ? a.bottom + offset : a.top - offset - ph;

  let left;
  if (align === 'end') left = a.right - pw;
  else if (align === 'center') left = a.left + a.width / 2 - pw / 2;
  else left = a.left;

  left = Math.max(8, Math.min(left, vw - pw - 8));
  top = Math.max(8, Math.min(top, vh - ph - 8));

  panel.style.top = Math.round(top) + 'px';
  panel.style.left = Math.round(left) + 'px';
  panel.dataset.side = side;
}

export class Layer {
  constructor(className) {
    this.el = document.createElement('div');
    this.el.className = 'ui-layer' + (className ? ' ' + className : '');
    this.el.hidden = true;
    portal().appendChild(this.el);

    this.closable = true;
    this._onDocClick = (e) => {
      if (this.el.hidden) return;
      // 触发本次打开的同一个点击会继续冒泡到 document，用事件引用精确挡掉
      if (e === this._openingEvent) return;
      if (this.el.contains(e.target)) return;
      if (this.anchor && this.anchor.contains(e.target)) return;
      this.hide();
    };
    this._onKey = (e) => {
      if (e.key === 'Escape' && !this.el.hidden) this.hide();
    };
    this._onMove = () => this.reposition();
  }

  setContent(html) {
    this.el.innerHTML = html;
    return this;
  }

  show(anchor, placement, offset, srcEvent) {
    this.anchor = anchor;
    this.placement = placement || 'bottom-start';
    this.offset = offset === undefined ? 6 : offset;
    this._openingEvent = srcEvent || null;
    this.el.hidden = false;
    place(anchor, this.el, this.placement, this.offset);
    // 立即绑定（同一函数引用会被浏览器自动去重）
    document.addEventListener('click', this._onDocClick, true);
    document.addEventListener('keydown', this._onKey);
    window.addEventListener('scroll', this._onMove, true);
    window.addEventListener('resize', this._onMove);
    this.el.dispatchEvent(new CustomEvent('open'));
  }

  hide() {
    if (this.el.hidden) return;
    this.el.hidden = true;
    document.removeEventListener('click', this._onDocClick, true);
    document.removeEventListener('keydown', this._onKey);
    window.removeEventListener('scroll', this._onMove, true);
    window.removeEventListener('resize', this._onMove);
    this.el.dispatchEvent(new CustomEvent('close'));
  }

  reposition() {
    if (!this.el.hidden && this.anchor) place(this.anchor, this.el, this.placement, this.offset);
  }

  toggle(anchor, placement, offset, srcEvent) {
    if (this.el.hidden) this.show(anchor, placement, offset, srcEvent);
    else this.hide();
  }

  destroy() {
    this.hide();
    this.el.remove();
  }
}