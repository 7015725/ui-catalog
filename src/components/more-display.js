/* =========================================================
   展示扩展：ui-timeline / ui-avatar-group / ui-descriptions
            ui-kbd / ui-divider / ui-carousel / ui-code / ui-list
   ========================================================= */
import { UIElement, register } from './base.js';
import { esc, splitList } from './more-form.js';

function parseArr(text) {
  try { const v = JSON.parse(text || '[]'); return Array.isArray(v) ? v : null; } catch (e) { return null; }
}
const errBox = (msg) => '<div class="ui-json-err" style="font-size:12.5px;color:var(--ui-sub)">' + msg + '</div>';

/* ---------------- Timeline 时间线 ---------------- */
export const timelineCss = `
ui-timeline{display:block;width:100%}
.ui-tl{list-style:none;margin:0;padding:0}
.ui-tl__it{position:relative;display:grid;grid-template-columns:14px 1fr;column-gap:12px;padding-bottom:16px}
.ui-tl__it:last-child{padding-bottom:0}
.ui-tl__it::before{
  content:"";position:absolute;left:6px;top:16px;bottom:-2px;width:2px;
  background:var(--ui-line);border-radius:2px;
}
.ui-tl__it:last-child::before{display:none}
.ui-tl__dot{
  width:14px;height:14px;margin-top:3px;border-radius:50%;
  background:var(--ui-panel);border:3px solid var(--ui-brand);box-sizing:border-box;
}
.ui-tl__it--success .ui-tl__dot{border-color:var(--ui-ok)}
.ui-tl__it--warn .ui-tl__dot{border-color:var(--ui-warn)}
.ui-tl__it--danger .ui-tl__dot{border-color:var(--ui-danger)}
.ui-tl__it--muted .ui-tl__dot{border-color:var(--ui-line)}
.ui-tl__hd{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:2px 10px}
.ui-tl__t{font-size:13.5px;font-weight:600;color:var(--ui-text)}
.ui-tl__time{font-size:11.5px;color:var(--ui-sub);font-variant-numeric:tabular-nums}
.ui-tl__d{margin-top:2px;font-size:12.5px;color:var(--ui-sub);line-height:1.6}
`;

export class UITimeline extends UIElement {
  static props = { items: { default: '[]' } };
  template(p) {
    const list = parseArr(p.items);
    if (!list) return errBox('items 需要是合法 JSON 数组');
    return '<ol class="ui-tl">' + list.map((it) =>
      '<li class="ui-tl__it ui-tl__it--' + esc(it.status || 'brand') + '"><span class="ui-tl__dot"></span><div>' +
      '<div class="ui-tl__hd"><span class="ui-tl__t">' + esc(it.title) + '</span>' +
      (it.time ? '<time class="ui-tl__time">' + esc(it.time) + '</time>' : '') + '</div>' +
      (it.desc ? '<div class="ui-tl__d">' + esc(it.desc) + '</div>' : '') +
      '</div></li>'
    ).join('') + '</ol>';
  }
}
register('ui-timeline', UITimeline, timelineCss);

/* ---------------- Avatar Group 头像组 ---------------- */
export const avatarGroupCss = `
ui-avatar-group{display:inline-block}
.ui-ag{display:inline-flex;align-items:center;padding-left:8px}
.ui-ag > span{
  display:inline-grid;place-items:center;width:34px;height:34px;margin-left:-8px;
  border-radius:50%;font-size:12.5px;font-weight:600;
  border:2px solid var(--ui-panel);color:var(--ui-brand-ink);
  background:linear-gradient(135deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 45%,#8f5cff));
  transition:var(--ui-motion);position:relative;
}
.ui-ag > span:nth-child(3n+2){background:linear-gradient(135deg,var(--ui-ok),color-mix(in srgb,var(--ui-ok) 50%,var(--ui-brand)))}
.ui-ag > span:nth-child(3n+3){background:linear-gradient(135deg,var(--ui-warn),color-mix(in srgb,var(--ui-warn) 50%,var(--ui-danger)))}
.ui-ag > span:hover{transform:translateY(-3px);z-index:1}
.ui-ag > span.ui-ag__more{background:var(--ui-panel-2);color:var(--ui-text);border-color:var(--ui-panel)}
.ui-ag--sm > span{width:26px;height:26px;font-size:10.5px;margin-left:-6px}
`;

export class UIAvatarGroup extends UIElement {
  static props = { names: { default: '' }, max: { default: '4' }, size: { default: 'md' } };
  template(p) {
    const list = splitList(p.names);
    const max = Math.max(1, Number(p.max) || 4);
    const shown = list.slice(0, max);
    const rest = list.length - shown.length;
    return '<div class="ui-ag ui-ag--' + esc(p.size) + '" role="group" aria-label="' + list.length + ' 位成员">' +
      shown.map((n) => '<span title="' + esc(n) + '">' + esc(n.slice(0, 1)) + '</span>').join('') +
      (rest > 0 ? '<span class="ui-ag__more" title="' + esc(list.slice(max).join('、')) + '">+' + rest + '</span>' : '') +
      '</div>';
  }
}
register('ui-avatar-group', UIAvatarGroup, avatarGroupCss);

/* ---------------- Descriptions 描述列表 ---------------- */
export const descCss = `
ui-descriptions{display:block;width:100%}
.ui-desc__t{font-size:13.5px;font-weight:600;margin:0 0 10px;color:var(--ui-text)}
.ui-desc{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,var(--ui-desc-min,150px)),1fr));
  margin:0;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);overflow:hidden;
  gap:var(--ui-border-w);background:var(--ui-line);
}
.ui-desc > div{display:flex;flex-direction:column;gap:3px;padding:10px 12px;background:var(--ui-panel);min-width:0}
.ui-desc dt{font-size:11.5px;color:var(--ui-sub)}
.ui-desc dd{margin:0;font-size:13px;color:var(--ui-text);word-break:break-word}
`;

export class UIDescriptions extends UIElement {
  static props = { items: { default: '[]' }, title: { default: '' }, min: { default: '150px' } };
  template(p) {
    const list = parseArr(p.items);
    if (!list) return errBox('items 需要是合法 JSON 数组');
    return (p.title ? '<h3 class="ui-desc__t">' + esc(p.title) + '</h3>' : '') +
      '<dl class="ui-desc" style="--ui-desc-min:' + esc(p.min) + '">' + list.map((it) =>
        '<div><dt>' + esc(it.label) + '</dt><dd>' + esc(it.value) + '</dd></div>'
      ).join('') + '</dl>';
  }
}
register('ui-descriptions', UIDescriptions, descCss);

/* ---------------- Kbd 键盘按键 ---------------- */
export const kbdCss = `
.ui-kbd{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--ui-sub)}
.ui-kbd kbd{
  display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;
  font-family:var(--ui-mono);font-size:11.5px;color:var(--ui-text);
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);
  border-bottom-width:calc(var(--ui-border-w) + 2px);border-radius:var(--ui-radius-sm);
}
`;

export class UIKbd extends UIElement {
  static props = { keys: { default: '' } };
  template(p) {
    return '<span class="ui-kbd">' + String(p.keys).split('+').map((k) => k.trim()).filter(Boolean)
      .map((k) => '<kbd>' + esc(k) + '</kbd>').join('<span aria-hidden="true">+</span>') + '</span>';
  }
}
register('ui-kbd', UIKbd, kbdCss);

/* ---------------- Divider 分割线 ---------------- */
export const dividerCss = `
ui-divider{display:block;width:100%}
.ui-divider{display:flex;align-items:center;gap:12px;font-size:12px;color:var(--ui-sub);margin:4px 0}
.ui-divider::before,.ui-divider::after{content:"";flex:1;border-top:var(--ui-border-w) solid var(--ui-line)}
.ui-divider--dashed::before,.ui-divider--dashed::after{border-top-style:dashed}
.ui-divider--left::before{flex:0 0 18px}
.ui-divider--empty{gap:0}
`;

export class UIDivider extends UIElement {
  static props = { align: { default: 'center' }, dashed: { type: 'boolean' } };
  template(p) {
    const has = this._lastTpl === undefined ? this.textContent.trim() !== '' : this._hasText;
    this._hasText = has;
    return '<div class="ui-divider ui-divider--' + esc(p.align) + (p.dashed ? ' ui-divider--dashed' : '') + (has ? '' : ' ui-divider--empty') + '" role="separator"><slot></slot></div>';
  }
}
register('ui-divider', UIDivider, dividerCss);

/* ---------------- Carousel 轮播 ---------------- */
export const carouselCss = `
ui-carousel{display:block;width:100%}
.ui-car{position:relative;overflow:hidden;border-radius:var(--ui-radius-lg);
  border:var(--ui-border-w) solid var(--ui-line);background:var(--ui-panel-2);touch-action:pan-y}
.ui-car__track{display:flex;transition:transform .45s cubic-bezier(.2,.7,.2,1)}
.ui-car__slide{
  flex:0 0 100%;min-height:140px;padding:22px 52px;display:flex;flex-direction:column;justify-content:center;gap:6px;
  color:var(--ui-brand-ink);
  background:linear-gradient(135deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 40%,#a855f7));
}
.ui-car__slide:nth-child(3n+2){background:linear-gradient(135deg,color-mix(in srgb,var(--ui-ok) 85%,#000),color-mix(in srgb,var(--ui-ok) 50%,var(--ui-brand)))}
.ui-car__slide:nth-child(3n+3){background:linear-gradient(135deg,color-mix(in srgb,var(--ui-warn) 90%,#000),color-mix(in srgb,var(--ui-danger) 70%,var(--ui-warn)))}
/* 文字放在半透明深色底上：无论哪种风格的渐变色，白字对比度都 ≥ 4.5 */
.ui-car__cap{align-self:flex-start;max-width:100%;display:flex;flex-direction:column;gap:4px;padding:10px 14px;border-radius:var(--ui-radius);background:rgba(8,10,16,.58)}
.ui-car__slide b{font-size:18px;line-height:1.3;color:#fff}
.ui-car__slide span{font-size:12.5px;color:#fff}
.ui-car__nav{
  position:absolute;top:50%;transform:translateY(-50%);width:30px;height:30px;
  display:grid;place-items:center;border:0;cursor:pointer;border-radius:50%;
  font:inherit;font-size:16px;line-height:1;color:#fff;background:rgba(8,10,16,.58);
  transition:var(--ui-motion);
}
.ui-car__nav:hover{background:rgba(0,0,0,.45)}
.ui-car__nav:focus-visible{outline:2px solid #fff;outline-offset:2px}
.ui-car__prev{left:10px}.ui-car__next{right:10px}
.ui-car__dots{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:6px}
.ui-car__dots button{width:7px;height:7px;padding:0;border:0;border-radius:99px;cursor:pointer;
  background:rgba(255,255,255,.5);transition:var(--ui-motion)}
.ui-car__dots button[aria-current="true"]{width:20px;background:#fff}
@media (max-width:480px){.ui-car__slide{padding:20px 44px}.ui-car__slide b{font-size:16px}}
@media (prefers-reduced-motion:reduce){.ui-car__track{transition:none}}
`;

export class UICarousel extends UIElement {
  static props = { slides: { default: '[]' }, autoplay: { default: '' }, index: { default: '0' } };
  template(p) {
    const list = parseArr(p.slides);
    if (!list) return errBox('slides 需要是合法 JSON 数组');
    if (!list.length) return errBox('请用 slides 提供至少一张');
    const i = ((Number(p.index) || 0) % list.length + list.length) % list.length;
    return '<div class="ui-car" role="region" aria-roledescription="carousel" aria-label="轮播">' +
      '<div class="ui-car__track" style="transform:translateX(' + (-100 * i) + '%)">' + list.map((s, k) =>
        '<div class="ui-car__slide" role="group" aria-roledescription="slide" aria-label="' + (k + 1) + ' / ' + list.length + '"' + (k === i ? '' : ' aria-hidden="true"') + '>' +
        '<div class="ui-car__cap"><b>' + esc(s.title) + '</b>' + (s.desc ? '<span>' + esc(s.desc) + '</span>' : '') + '</div></div>'
      ).join('') + '</div>' +
      (list.length > 1
        ? '<button type="button" class="ui-car__nav ui-car__prev" data-go="-1" aria-label="上一张">‹</button>' +
          '<button type="button" class="ui-car__nav ui-car__next" data-go="1" aria-label="下一张">›</button>' +
          '<div class="ui-car__dots">' + list.map((_, k) => '<button type="button" data-to="' + k + '" aria-label="第 ' + (k + 1) + ' 张"' + (k === i ? ' aria-current="true"' : '') + '></button>').join('') + '</div>'
        : '') +
      '</div>';
  }
  _go(to) {
    const n = (parseArr(this.props.slides) || []).length || 1;
    this.setAttribute('index', String(((to % n) + n) % n));
  }
  mounted() {
    const self = this;
    const cur = () => Number(self.props.index) || 0;
    this.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { self._go(cur() + Number(b.dataset.go)); const a = self.querySelector('[data-go="' + b.dataset.go + '"]'); if (a) a.focus(); }));
    this.querySelectorAll('[data-to]').forEach((b) => b.addEventListener('click', () => self._go(Number(b.dataset.to))));
    const box = this.querySelector('.ui-car');
    if (!box) return;
    let x0 = null;
    box.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    box.addEventListener('pointerup', (e) => {
      if (x0 == null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) self._go(cur() + (dx < 0 ? 1 : -1));
    });
    box.addEventListener('mouseenter', () => { self._hover = true; });
    box.addEventListener('mouseleave', () => { self._hover = false; });
    clearInterval(this._timer);
    const ms = Number(this.props.autoplay);
    if (ms > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._timer = setInterval(() => { if (!self._hover && self.isConnected) self._go(cur() + 1); }, Math.max(1500, ms));
    }
  }
  disconnectedCallback() { clearInterval(this._timer); }
}
register('ui-carousel', UICarousel, carouselCss);

/* ---------------- Code 代码块 ---------------- */
export const codeCss = `
ui-code{display:block;width:100%;min-width:0}
.ui-code{border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);overflow:hidden;background:var(--ui-panel-2)}
.ui-code__hd{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;
  border-bottom:var(--ui-border-w) solid var(--ui-line);font-size:11px;color:var(--ui-sub);font-family:var(--ui-mono)}
.ui-code__hd i{display:inline-flex;gap:5px;font-style:normal}
.ui-code__hd i::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--ui-danger);
  box-shadow:13px 0 0 var(--ui-warn),26px 0 0 var(--ui-ok);margin-right:30px}
.ui-code__cp{font:inherit;font-size:11px;padding:2px 8px;cursor:pointer;color:var(--ui-sub);
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm)}
.ui-code__cp:hover{color:var(--ui-brand);border-color:var(--ui-brand)}
.ui-code pre{margin:0;padding:10px 0;overflow:auto;font-family:var(--ui-mono);font-size:12px;line-height:1.7;counter-reset:ln}
.ui-code pre span{display:block;padding:0 12px;white-space:pre}
.ui-code--ln pre span::before{counter-increment:ln;content:counter(ln);display:inline-block;width:2em;margin-right:12px;
  text-align:right;color:var(--ui-sub);opacity:.55}
`;

export class UICode extends UIElement {
  static props = { code: { default: '' }, language: { default: '' }, 'line-numbers': { type: 'boolean' } };
  template(p) {
    const lines = String(p.code).replace(/\\n/g, '\n').split('\n');
    return '<div class="ui-code' + (p['line-numbers'] ? ' ui-code--ln' : '') + '">' +
      '<div class="ui-code__hd"><i aria-hidden="true"></i><span>' + esc(p.language) + '</span><button type="button" class="ui-code__cp">复制</button></div>' +
      '<pre tabindex="0" aria-label="' + esc((p.language || '') + ' 代码') + '"><code>' + lines.map((l) => '<span>' + (esc(l) || ' ') + '</span>').join('') + '</code></pre></div>';
  }
  mounted() {
    const self = this;
    const btn = this.querySelector('.ui-code__cp');
    btn.addEventListener('click', () => {
      const text = String(self.props.code).replace(/\\n/g, '\n');
      const done = () => { btn.textContent = '已复制 ✓'; setTimeout(() => { btn.textContent = '复制'; }, 1200); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, done);
      else done();
    });
  }
}
register('ui-code', UICode, codeCss);

/* ---------------- List 列表 ---------------- */
export const listCss = `
ui-list{display:block;width:100%}
.ui-list{list-style:none;margin:0;padding:0;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
  background:var(--ui-panel);overflow:hidden}
.ui-list li{display:flex;align-items:center;gap:12px;padding:10px 12px;transition:var(--ui-motion)}
.ui-list li + li{border-top:1px solid var(--ui-line)}
.ui-list--hover li:hover{background:var(--ui-panel-2)}
.ui-list__av{flex:0 0 auto;width:34px;height:34px;display:grid;place-items:center;border-radius:var(--ui-radius);
  background:var(--ui-brand-soft);color:var(--ui-brand);font-size:15px;font-weight:600}
.ui-list__m{flex:1;min-width:0}
.ui-list__t{font-size:13.5px;color:var(--ui-text);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ui-list__d{font-size:12px;color:var(--ui-sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ui-list__x{flex:0 0 auto;font-size:12px;color:var(--ui-sub);font-variant-numeric:tabular-nums}
`;

export class UIList extends UIElement {
  static props = { items: { default: '[]' }, hoverable: { type: 'boolean' } };
  template(p) {
    const list = parseArr(p.items);
    if (!list) return errBox('items 需要是合法 JSON 数组');
    return '<ul class="ui-list' + (p.hoverable ? ' ui-list--hover' : '') + '">' + list.map((it) =>
      '<li>' + (it.icon || it.title ? '<span class="ui-list__av" aria-hidden="true">' + esc(it.icon || String(it.title).slice(0, 1)) + '</span>' : '') +
      '<div class="ui-list__m"><div class="ui-list__t">' + esc(it.title) + '</div>' +
      (it.desc ? '<div class="ui-list__d">' + esc(it.desc) + '</div>' : '') + '</div>' +
      (it.extra ? '<span class="ui-list__x">' + esc(it.extra) + '</span>' : '') + '</li>'
    ).join('') + '</ul>';
  }
}
register('ui-list', UIList, listCss);
