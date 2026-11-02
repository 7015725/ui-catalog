/* =========================================================
   动效（第二批 B）：ui-expand / ui-orbit / ui-ping / ui-swap / ui-hover
                    ui-split-flap / ui-checkmark / ui-scroll-hint / ui-spring-drag / ui-grid-wave
   ========================================================= */
import { UIElement, register } from './base.js';
import { reduced, onVisible } from '../lib/motion.js';
import { esc, splitList } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
let uid = 0;

/* ---------------- Expand 展开收起 ---------------- */
export const expandCss = `
ui-expand{display:block}
.ui-ex__body{position:relative;overflow:hidden;transition:height .45s var(--ui-ease,ease)}
.ui-ex__body::after{content:"";position:absolute;left:0;right:0;bottom:0;height:48px;pointer-events:none;
  background:linear-gradient(transparent,var(--ex-bg,var(--ui-panel)));transition:opacity .3s}
.ui-ex.is-open .ui-ex__body::after,.ui-ex.is-short .ui-ex__body::after{opacity:0}
.ui-ex__btn{margin-top:6px;border:0;background:none;padding:4px 0;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;color:var(--ui-brand);
  display:inline-flex;align-items:center;gap:4px}
.ui-ex__btn:focus-visible{outline:none;box-shadow:var(--ui-ring);border-radius:4px}
.ui-ex__btn i{font-style:normal;display:inline-block;transition:transform .3s}
.ui-ex.is-open .ui-ex__btn i{transform:rotate(180deg)}
.ui-ex.is-short .ui-ex__btn{display:none}
`;

export class UIExpand extends UIElement {
  static props = { height: { default: '72' }, more: { default: '展开全文' }, less: { default: '收起' }, bg: { default: '' } };
  template(p) {
    const id = this._id || (this._id = 'ui-ex-' + (++uid));
    return '<div class="ui-ex ui-mo"' + (p.bg ? ' style="--ex-bg:' + esc(p.bg) + '"' : '') + '><div class="ui-ex__body" id="' + id + '" style="height:' + (Number(p.height) || 72) + 'px"><slot></slot></div>' +
      '<button type="button" class="ui-ex__btn" aria-expanded="false" aria-controls="' + id + '"><span>' + esc(p.more) + '</span><i aria-hidden="true">▾</i></button></div>';
  }
  mounted() {
    const self = this;
    const box = this.querySelector('.ui-ex'), body = this.querySelector('.ui-ex__body'), btn = this.querySelector('.ui-ex__btn');
    const min = Number(this.props.height) || 72;
    const check = () => box.classList.toggle('is-short', body.scrollHeight <= min + 4);
    requestAnimationFrame(check);
    btn.addEventListener('click', () => {
      const open = !box.classList.contains('is-open');
      body.style.height = body.offsetHeight + 'px';
      void body.offsetHeight;
      body.style.height = (open ? body.scrollHeight : min) + 'px';
      box.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('span').textContent = open ? self.props.less : self.props.more;
      /* 动画结束后改为 auto，内容变化（窗口缩放）时高度仍正确 */
      const done = () => { if (box.classList.contains('is-open')) body.style.height = 'auto'; };
      if (reduced()) done(); else body.addEventListener('transitionend', done, { once: true });
      emit(self, 'toggle', { open: open });
    });
  }
}
register('ui-expand', UIExpand, expandCss);

/* ---------------- Orbit 环绕轨道 ---------------- */
export const orbitCss = `
ui-orbit{display:inline-block}
.ui-orb{position:relative;width:var(--ob-s,200px);height:var(--ob-s,200px);display:grid;place-items:center}
.ui-orb__ring{position:absolute;left:50%;top:50%;border-radius:50%;border:1px dashed color-mix(in srgb,var(--ui-sub) 45%,transparent);
  width:calc(var(--r) * 2);height:calc(var(--r) * 2);margin:calc(var(--r) * -1);animation:ui-orb var(--d) linear infinite var(--dir)}
.ui-orb:hover .ui-orb__ring,.ui-orb:hover .ui-orb__it > span{animation-play-state:paused}
/* 外层负责摆到圆周上，内层反向旋转，保证图标始终正立 */
.ui-orb__it{position:absolute;left:50%;top:50%;width:var(--it,34px);height:var(--it,34px);margin:calc(var(--it,34px) / -2);
  transform:rotate(var(--a)) translateY(calc(var(--r) * -1)) rotate(calc(var(--a) * -1))}
.ui-orb__it > span{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:var(--ui-panel);
  border:var(--ui-border-w) solid var(--ui-line);box-shadow:var(--ui-shadow-sm);font-size:16px;animation:ui-orb var(--d) linear infinite var(--cdir)}
.ui-orb__c{position:relative;z-index:1}
@keyframes ui-orb{to{transform:rotate(360deg)}}
`;

export class UIOrbit extends UIElement {
  static props = { items: { default: '' }, size: { default: '200' }, speed: { default: '20' }, rings: { default: '2' } };
  template(p) {
    const items = splitList(p.items);
    const S = Number(p.size) || 200, n = Math.max(1, Math.min(3, Number(p.rings) || 2));
    const rings = Array.from({ length: n }, (_, k) => ({ r: (S / 2 - 18) * (k + 1) / n, list: [] }));
    items.forEach((it, i) => rings[i % n].list.push(it));
    return '<div class="ui-orb ui-mo" style="--ob-s:' + S + 'px" role="group" aria-label="' + esc(items.join('、')) + '">' +
      rings.map((rg, k) => {
        const d = (Number(p.speed) || 20) * (1 + k * 0.6);
        const rev = k % 2 === 1;
        return '<div class="ui-orb__ring" aria-hidden="true" style="--r:' + rg.r + 'px;--d:' + d + 's;--dir:' + (rev ? 'reverse' : 'normal') + ';--cdir:' + (rev ? 'normal' : 'reverse') + '">' +
          rg.list.map((it, j) => '<span class="ui-orb__it" style="--a:' + (360 / rg.list.length * j) + 'deg"><span>' + esc(it) + '</span></span>').join('') + '</div>';
      }).join('') + '<div class="ui-orb__c"><slot></slot></div></div>';
  }
}
register('ui-orbit', UIOrbit, orbitCss);

/* ---------------- Ping 雷达扩散 ---------------- */
export const pingCss = `
ui-ping{display:inline-grid}
.ui-ping{position:relative;display:inline-grid;place-items:center;color:var(--pg-c,var(--ui-brand))}
.ui-ping__r{position:absolute;left:50%;top:50%;width:var(--pg-s,14px);height:var(--pg-s,14px);margin:calc(var(--pg-s,14px) / -2);border-radius:50%;
  border:2px solid currentColor;opacity:0;animation:ui-ping 2.4s cubic-bezier(.2,.6,.3,1) infinite;pointer-events:none}
.ui-ping__r:nth-child(2){animation-delay:.8s}.ui-ping__r:nth-child(3){animation-delay:1.6s}
.ui-ping__dot{width:var(--pg-s,14px);height:var(--pg-s,14px);border-radius:50%;background:currentColor;box-shadow:0 0 0 3px var(--ui-panel)}
.ui-ping--wrap .ui-ping__dot{display:none}
.ui-ping--wrap .ui-ping__r{width:100%;height:100%;margin:0;left:0;top:0}
@keyframes ui-ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(var(--pg-scale,3.2));opacity:0}}
`;

export class UIPing extends UIElement {
  static props = { variant: { default: 'brand' }, size: { default: '14' }, label: { default: '' } };
  template(p) {
    const c = { brand: 'var(--ui-brand)', success: 'var(--ui-ok)', warn: 'var(--ui-warn)', danger: 'var(--ui-danger)' }[p.variant] || esc(p.variant);
    const wrap = this._lastTpl === undefined ? this.textContent.trim() !== '' || !!this.firstElementChild : this._wrap;
    this._wrap = wrap;
    return '<span class="ui-ping ui-mo' + (wrap ? ' ui-ping--wrap' : '') + '" style="--pg-c:' + c + ';--pg-s:' + (Number(p.size) || 14) + 'px' + (wrap ? ';--pg-scale:1.5' : '') + '"' +
      (p.label ? ' role="status" aria-label="' + esc(p.label) + '"' : '') + '><i class="ui-ping__r" aria-hidden="true"></i><i class="ui-ping__r" aria-hidden="true"></i><i class="ui-ping__r" aria-hidden="true"></i>' +
      (wrap ? '<slot></slot>' : '<i class="ui-ping__dot" aria-hidden="true"></i>') + '</span>';
  }
}
register('ui-ping', UIPing, pingCss);

/* ---------------- Swap 内容切换过渡 ---------------- */
export const swapCss = `
ui-swap{display:block}
.ui-sw{display:flex;flex-direction:column;gap:10px}
.ui-sw__stage{display:grid;overflow-x:clip}
.ui-sw__stage > *{grid-area:1/1;transition:opacity .5s ease,transform .6s var(--ui-ease,ease),filter .5s;min-width:0}
.ui-sw__stage > :not(.is-on){opacity:0;pointer-events:none}
.ui-sw--slide .ui-sw__stage > :not(.is-on){transform:translateX(40px)}
.ui-sw--slide .ui-sw__stage > .is-prev{transform:translateX(-40px)}
.ui-sw--zoom .ui-sw__stage > :not(.is-on){transform:scale(.92)}
.ui-sw--blur .ui-sw__stage > :not(.is-on){filter:blur(8px)}
.ui-sw--flip .ui-sw__stage{perspective:800px}
.ui-sw--flip .ui-sw__stage > :not(.is-on){transform:rotateX(70deg);transform-origin:center bottom}
.ui-sw__dots{display:flex;gap:6px;justify-content:center}
.ui-sw__dots button{width:8px;height:8px;padding:0;border:0;border-radius:99px;background:var(--ui-line);cursor:pointer;transition:var(--ui-motion)}
.ui-sw__dots button[aria-current="true"]{width:22px;background:var(--ui-brand)}
.ui-sw__dots button:focus-visible{outline:none;box-shadow:var(--ui-ring)}
`;

export class UISwap extends UIElement {
  static props = { effect: { default: 'slide' }, interval: { default: '3500' }, index: { default: '0' } };
  template(p) { return '<div class="ui-sw ui-mo ui-sw--' + esc(p.effect) + '"><div class="ui-sw__stage" aria-live="polite"><slot></slot></div><div class="ui-sw__dots"></div></div>'; }
  go(i) {
    const items = this._items();
    if (!items.length) return;
    const n = items.length, cur = ((i % n) + n) % n;
    items.forEach((el, k) => {
      el.classList.toggle('is-on', k === cur);
      el.classList.toggle('is-prev', k === (cur - 1 + n) % n);
      el.toggleAttribute('inert', k !== cur);
      el.setAttribute('aria-hidden', String(k !== cur));
    });
    this._i = cur;
    this.querySelectorAll('.ui-sw__dots button').forEach((b, k) => b.setAttribute('aria-current', String(k === cur)));
    emit(this, 'change', { index: cur });
  }
  _items() { const st = this.querySelector('.ui-sw__stage'); return st ? Array.from(st.children) : []; }
  mounted() {
    const self = this;
    const items = this._items();
    this.querySelector('.ui-sw__dots').innerHTML = items.map((_, k) => '<button type="button" aria-label="第 ' + (k + 1) + ' 项"></button>').join('');
    this.querySelectorAll('.ui-sw__dots button').forEach((b, k) => b.addEventListener('click', () => { self.go(k); self._paused = true; }));
    this.go(Number(this.props.index) || 0);
    clearInterval(this._iv);
    const ms = Number(this.props.interval);
    if (ms > 0 && !reduced()) {
      this.addEventListener('mouseenter', () => { self._hover = true; });
      this.addEventListener('mouseleave', () => { self._hover = false; });
      this.addEventListener('focusin', () => { self._paused = true; });
      this._iv = setInterval(() => { if (self.isConnected && !self._hover && !self._paused && !document.hidden) self.go((self._i || 0) + 1); }, Math.max(1500, ms));
    }
  }
  disconnectedCallback() { clearInterval(this._iv); }
}
register('ui-swap', UISwap, swapCss);

/* ---------------- Hover 悬停效果 ---------------- */
export const hoverCss = `
ui-hover{display:inline-block}
.ui-hv{position:relative;display:inline-block}
.ui-hv > *{position:relative;transition:color .3s,background-size .35s var(--ui-ease,ease),transform .3s var(--ui-ease,ease),box-shadow .3s,background-color .3s}
/* 下划线生长 */
.ui-hv--underline > *{text-decoration:none;background:linear-gradient(currentColor,currentColor) 0 100%/0 2px no-repeat}
.ui-hv--underline:hover > *,.ui-hv--underline:focus-within > *{background-size:100% 2px}
/* 背景填充（从左扫入） */
.ui-hv--fill > *{background:linear-gradient(var(--ui-brand),var(--ui-brand)) 0 0/0 100% no-repeat;color:var(--ui-text)}
.ui-hv--fill:hover > *,.ui-hv--fill:focus-within > *{background-size:100% 100%;color:var(--ui-brand-ink)}
/* 边框描绘 */
.ui-hv--border::before,.ui-hv--border::after{content:"";position:absolute;width:0;height:0;border:2px solid transparent;pointer-events:none;box-sizing:border-box;border-radius:var(--ui-radius)}
.ui-hv--border::before{top:0;left:0}
.ui-hv--border::after{bottom:0;right:0}
.ui-hv--border:hover::before,.ui-hv--border:focus-within::before{width:100%;height:100%;border-top-color:var(--ui-brand);border-right-color:var(--ui-brand);transition:width .2s ease-out,height .2s ease-out .2s}
.ui-hv--border:hover::after,.ui-hv--border:focus-within::after{width:100%;height:100%;border-bottom-color:var(--ui-brand);border-left-color:var(--ui-brand);transition:border-color 0s .4s,width .2s ease-out .4s,height .2s ease-out .6s}
/* 箭头滑出 */
.ui-hv--arrow{padding-right:0}
.ui-hv--arrow::after{content:"→";position:absolute;right:-4px;top:50%;transform:translate(-6px,-50%);opacity:0;transition:transform .3s var(--ui-ease,ease),opacity .3s;color:var(--ui-brand);pointer-events:none}
.ui-hv--arrow:hover::after,.ui-hv--arrow:focus-within::after{transform:translate(14px,-50%);opacity:1}
.ui-hv--arrow:hover > *,.ui-hv--arrow:focus-within > *{transform:translateX(-4px)}
/* 发光 */
.ui-hv--glow:hover > *,.ui-hv--glow:focus-within > *{box-shadow:0 0 0 3px color-mix(in srgb,var(--ui-brand) 25%,transparent),0 0 24px color-mix(in srgb,var(--ui-brand) 55%,transparent)}
/* 上浮 */
.ui-hv--lift:hover > *,.ui-hv--lift:focus-within > *{transform:translateY(-4px);box-shadow:0 12px 24px -10px color-mix(in srgb,var(--ui-text) 40%,transparent)}
/* 倾斜回弹 */
.ui-hv--skew:hover > *,.ui-hv--skew:focus-within > *{transform:skewX(-8deg) scale(1.04)}
/* 文字上翻（用 data-text 复制一份文字） */
.ui-hv--roll > *{overflow:hidden}
.ui-hv--roll > * > .ui-hv__t{display:inline-block;transition:transform .35s var(--ui-ease,ease)}
.ui-hv--roll > * > .ui-hv__t::after{content:attr(data-text);position:absolute;left:0;right:0;top:100%;text-align:center}
.ui-hv--roll:hover > * > .ui-hv__t,.ui-hv--roll:focus-within > * > .ui-hv__t{transform:translateY(-100%)}
`;

export class UIHover extends UIElement {
  static props = { effect: { default: 'underline' } };
  template(p) { return '<span class="ui-hv ui-mo ui-hv--' + esc(p.effect) + '"><slot></slot></span>'; }
  mounted() {
    if (this.props.effect !== 'roll') return;
    const host = this.querySelector('.ui-hv > *');
    if (!host || host.querySelector('.ui-hv__t')) return;
    const text = host.textContent.trim();
    host.innerHTML = '<span class="ui-hv__t" data-text="' + esc(text) + '">' + esc(text) + '</span>';
  }
}
register('ui-hover', UIHover, hoverCss);

/* ---------------- Split Flap 翻牌 ---------------- */
export const splitFlapCss = `
.ui-sf{display:inline-flex;gap:3px;font-family:var(--ui-mono);font-weight:700;perspective:300px}
.ui-sf__t{position:relative;display:inline-grid;place-items:center;width:1.25em;height:1.6em;border-radius:4px;
  background:#1d2027;color:#f6d36b;font-size:var(--sf-size,20px);box-shadow:inset 0 -1px 0 rgba(255,255,255,.06),0 2px 4px rgba(0,0,0,.3);overflow:hidden}
.ui-sf__t::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,.55)}
.ui-sf__t.is-flip{animation:ui-sf .14s ease-in}
@keyframes ui-sf{0%{transform:rotateX(0)}50%{transform:rotateX(-80deg);filter:brightness(.6)}100%{transform:rotateX(0)}}
`;
const FLAP = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-';

export class UISplitFlap extends UIElement {
  static props = { words: { default: '' }, length: { default: '' }, interval: { default: '3600' }, size: { default: '20' } };
  _words() { return splitList(this.props.words).map((w) => w.toUpperCase()); }
  template(p) {
    const ws = this._words();
    const n = Number(p.length) || Math.max.apply(null, ws.map((w) => w.length).concat(1));
    return '<span class="ui-sf" role="status" aria-live="off" aria-label="' + esc(ws[0] || '') + '" style="--sf-size:' + (Number(p.size) || 20) + 'px">' +
      Array.from({ length: n }, (_, i) => '<span class="ui-sf__t" aria-hidden="true">' + esc((ws[0] || '').padEnd(n)[i]) + '</span>').join('') + '</span>';
  }
  show(word) {
    const tiles = Array.from(this.querySelectorAll('.ui-sf__t'));
    const target = word.toUpperCase().padEnd(tiles.length).slice(0, tiles.length);
    this.querySelector('.ui-sf').setAttribute('aria-label', word);
    tiles.forEach((t, i) => {
      clearTimeout(t._tm);
      if (reduced()) { t.textContent = target[i]; return; }
      let cur = FLAP.indexOf(t.textContent); if (cur < 0) cur = 0;
      const goal = Math.max(0, FLAP.indexOf(target[i]));
      let steps = (goal - cur + FLAP.length) % FLAP.length;
      if (steps === 0) return;
      steps = Math.min(steps, 10 + i); /* 最多翻十几次，避免太久 */
      const flip = () => {
        steps--;
        t.textContent = steps === 0 ? target[i] : FLAP[(FLAP.indexOf(t.textContent) + 1) % FLAP.length];
        t.classList.remove('is-flip'); void t.offsetWidth; t.classList.add('is-flip');
        if (steps > 0) t._tm = setTimeout(flip, 70);
      };
      t._tm = setTimeout(flip, i * 40);
    });
  }
  mounted() {
    const self = this;
    clearInterval(this._iv);
    const ws = this._words();
    if (ws.length < 2) return;
    let i = 0;
    this._iv = setInterval(() => { if (self.isConnected && !document.hidden) { i = (i + 1) % ws.length; self.show(ws[i]); } }, Math.max(2000, Number(this.props.interval) || 3600));
  }
  disconnectedCallback() { clearInterval(this._iv); this.querySelectorAll('.ui-sf__t').forEach((t) => clearTimeout(t._tm)); }
}
register('ui-split-flap', UISplitFlap, splitFlapCss);

/* ---------------- Checkmark 结果动画 ---------------- */
export const checkmarkCss = `
ui-checkmark{display:inline-block}
.ui-ck{display:block;width:var(--ck-s,64px);height:var(--ck-s,64px);color:var(--ck-c)}
.ui-ck circle,.ui-ck path{fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.ui-ck circle{stroke-dasharray:166;stroke-dashoffset:166;animation:ui-ck-draw .6s var(--ui-ease,ease) forwards}
.ui-ck path{stroke-dasharray:60;stroke-dashoffset:60;animation:ui-ck-draw .4s var(--ui-ease,ease) .5s forwards}
.ui-ck .bg{fill:var(--ck-c);opacity:0;stroke:none;animation:ui-ck-bg .4s ease .85s forwards;stroke-dasharray:none}
.ui-ck .mk{stroke:var(--ui-on-color,#fff)}
.ui-ck svg{overflow:visible;animation:ui-ck-pop .35s var(--ui-spring,ease) .85s both}
@keyframes ui-ck-draw{to{stroke-dashoffset:0}}
@keyframes ui-ck-bg{to{opacity:1}}
@keyframes ui-ck-pop{0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}}
`;
const CK = {
  success: { c: 'var(--ui-ok)', p: 'M17 27 l7 7 l14 -16', l: '成功' },
  error: { c: 'var(--ui-danger)', p: 'M19 19 l18 18 M37 19 l-18 18', l: '失败' },
  warn: { c: 'var(--ui-warn)', p: 'M28 16 v14 M28 38 v1', l: '警告' }
};

export class UICheckmark extends UIElement {
  static props = { type: { default: 'success' }, size: { default: '64' }, label: { default: '' } };
  template(p) {
    const k = CK[p.type] || CK.success;
    return '<span class="ui-ck ui-mo" role="img" aria-label="' + esc(p.label || k.l) + '" style="--ck-c:' + k.c + ';--ck-s:' + (Number(p.size) || 64) + 'px">' +
      '<svg viewBox="0 0 56 56" aria-hidden="true"><circle class="bg" cx="28" cy="28" r="26"></circle><circle cx="28" cy="28" r="26"></circle><path class="mk" d="' + k.p + '"></path></svg></span>';
  }
  /** 重新播放 */
  replay() { this._lastTpl = null; this._render(); }
}
register('ui-checkmark', UICheckmark, checkmarkCss);

/* ---------------- Scroll Hint 滚动提示 ---------------- */
export const scrollHintCss = `
.ui-sh{display:inline-flex;flex-direction:column;align-items:center;gap:8px;font-size:11.5px;color:var(--ui-sub);letter-spacing:.08em}
.ui-sh__m{position:relative;width:22px;height:34px;border:2px solid currentColor;border-radius:12px}
.ui-sh__m::before{content:"";position:absolute;left:50%;top:6px;width:3px;height:7px;margin-left:-1.5px;border-radius:2px;background:var(--ui-brand);animation:ui-sh-wheel 1.6s ease-in-out infinite}
.ui-sh__c{display:flex;flex-direction:column;align-items:center}
.ui-sh__c i{width:12px;height:12px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);margin-top:-5px;animation:ui-sh-chev 1.6s ease-in-out infinite;opacity:0}
.ui-sh__c i:nth-child(2){animation-delay:.2s}.ui-sh__c i:nth-child(3){animation-delay:.4s}
@keyframes ui-sh-wheel{0%{transform:translateY(0);opacity:1}70%{transform:translateY(10px);opacity:0}100%{opacity:0}}
@keyframes ui-sh-chev{0%,100%{opacity:0}40%{opacity:1}}
`;

export class UIScrollHint extends UIElement {
  static props = { type: { default: 'mouse' }, label: { default: '向下滚动' } };
  template(p) {
    return '<span class="ui-sh ui-mo">' + (p.type === 'chevron' ? '<span class="ui-sh__c" aria-hidden="true"><i></i><i></i><i></i></span>' : '<span class="ui-sh__m" aria-hidden="true"></span>') +
      (p.label ? '<span>' + esc(p.label) + '</span>' : '') + '</span>';
  }
}
register('ui-scroll-hint', UIScrollHint, scrollHintCss);

/* ---------------- Spring Drag 弹性拖拽 ---------------- */
export const springDragCss = `
ui-spring-drag{display:block}
.ui-spd{position:relative;height:var(--spd-h,160px);border-radius:var(--ui-radius-lg);background:var(--ui-panel-2);border:var(--ui-border-w) dashed var(--ui-line);
  display:grid;place-items:center;overflow:hidden;touch-action:none}
.ui-spd__k{width:56px;height:56px;border-radius:50%;cursor:grab;display:grid;place-items:center;font-size:22px;color:var(--ui-brand-ink);
  background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--ui-brand) 60%,#fff),var(--ui-brand));box-shadow:0 10px 24px -8px var(--ui-brand);
  outline:none;user-select:none;touch-action:none}
.ui-spd__k:focus-visible{box-shadow:var(--ui-ring),0 10px 24px -8px var(--ui-brand)}
.ui-spd__k.is-drag{cursor:grabbing}
.ui-spd__tip{position:absolute;bottom:8px;font-size:11.5px;color:var(--ui-sub)}
`;

export class UISpringDrag extends UIElement {
  static props = { height: { default: '160' }, stiffness: { default: '0.12' }, damping: { default: '0.78' }, label: { default: '弹性小球' } };
  template(p) {
    return '<div class="ui-spd ui-mo" style="--spd-h:' + (Number(p.height) || 160) + 'px"><span class="ui-spd__k" tabindex="0" role="button" aria-label="' + esc(p.label) + '，可拖动或用方向键推动"><slot></slot></span>' +
      '<span class="ui-spd__tip" aria-hidden="true">拖动小球后松手 · 或聚焦后按方向键</span></div>';
  }
  mounted() {
    const self = this;
    const k = this.querySelector('.ui-spd__k');
    let x = 0, y = 0, vx = 0, vy = 0, drag = false, sx = 0, sy = 0;
    const set = () => { k.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + (1 + Math.min(0.15, Math.hypot(vx, vy) / 120)).toFixed(3) + ')'; };
    const spring = () => {
      cancelAnimationFrame(self._raf);
      if (reduced()) { x = y = vx = vy = 0; set(); return; }
      const K = Number(self.props.stiffness) || 0.12, D = Number(self.props.damping) || 0.78;
      const step = () => {
        vx = (vx - x * K) * D; vy = (vy - y * K) * D; x += vx; y += vy; set();
        if (Math.abs(x) + Math.abs(y) + Math.abs(vx) + Math.abs(vy) > 0.2 && self.isConnected) self._raf = requestAnimationFrame(step);
        else { x = y = vx = vy = 0; set(); }
      };
      self._raf = requestAnimationFrame(step);
    };
    k.addEventListener('pointerdown', (e) => { drag = true; cancelAnimationFrame(self._raf); sx = e.clientX - x; sy = e.clientY - y; k.classList.add('is-drag'); k.setPointerCapture(e.pointerId); });
    k.addEventListener('pointermove', (e) => { if (!drag) return; const nx = e.clientX - sx, ny = e.clientY - sy; vx = nx - x; vy = ny - y; x = nx; y = ny; set(); });
    const up = () => { if (!drag) return; drag = false; k.classList.remove('is-drag'); emit(self, 'release', {}); spring(); };
    k.addEventListener('pointerup', up); k.addEventListener('pointercancel', up);
    k.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-50, 0], ArrowRight: [50, 0], ArrowUp: [0, -40], ArrowDown: [0, 40] }[e.key];
      if (!d) return;
      e.preventDefault(); x += d[0]; y += d[1]; vx = d[0] / 4; vy = d[1] / 4; set(); spring();
    });
  }
  disconnectedCallback() { cancelAnimationFrame(this._raf); }
}
register('ui-spring-drag', UISpringDrag, springDragCss);

/* ---------------- Grid Wave 网格波动 ---------------- */
export const gridWaveCss = `
ui-grid-wave{display:block}
.ui-gw{display:grid;grid-template-columns:repeat(var(--gw-c,14),minmax(0,14px));justify-content:space-between;gap:var(--gw-gap,8px);padding:14px;border-radius:var(--ui-radius-lg);
  background:var(--ui-panel-2);border:var(--ui-border-w) solid var(--ui-line);cursor:pointer}
.ui-gw i{aspect-ratio:1;border-radius:50%;background:color-mix(in srgb,var(--ui-sub) 35%,transparent)}
.ui-gw.is-run i{animation:ui-gw .7s ease-out calc(var(--d) * 1ms) both}
@keyframes ui-gw{0%{transform:scale(1)}35%{transform:scale(1.9);background:var(--ui-brand)}100%{transform:scale(1)}}
`;

export class UIGridWave extends UIElement {
  static props = { cols: { default: '14' }, rows: { default: '6' }, auto: { default: 'true' } };
  template(p) {
    const c = Math.max(4, Math.min(30, Number(p.cols) || 14)), r = Math.max(2, Math.min(16, Number(p.rows) || 6));
    return '<div class="ui-gw ui-mo" style="--gw-c:' + c + '" role="img" aria-label="点阵波动动画，点击任意位置从该处发起波纹">' + Array.from({ length: c * r }, (_, i) => '<i data-x="' + (i % c) + '" data-y="' + Math.floor(i / c) + '"></i>').join('') + '</div>';
  }
  /** 从 (x, y) 格子发起一圈波纹 */
  wave(x, y) {
    const g = this.querySelector('.ui-gw');
    if (!g || reduced()) return;
    g.querySelectorAll('i').forEach((d) => d.style.setProperty('--d', Math.round(Math.hypot(d.dataset.x - x, d.dataset.y - y) * 55)));
    g.classList.remove('is-run'); void g.offsetWidth; g.classList.add('is-run');
  }
  mounted() {
    const self = this;
    const g = this.querySelector('.ui-gw');
    g.addEventListener('click', (e) => {
      const d = e.target.closest('i');
      if (d) { self.wave(Number(d.dataset.x), Number(d.dataset.y)); return; }
      const r = g.getBoundingClientRect();
      const c = Number(getComputedStyle(g).getPropertyValue('--gw-c')) || 14;
      self.wave(Math.floor((e.clientX - r.left) / r.width * c), Math.floor((e.clientY - r.top) / r.height * (g.children.length / c)));
    });
    if (this._off) this._off();
    if (this.props.auto !== 'false') {
      const c = Number(this.props.cols) || 14, rr = Number(this.props.rows) || 6;
      this._off = onVisible(this, () => self.wave(Math.floor(c / 2), Math.floor(rr / 2)));
    }
  }
  disconnectedCallback() { if (this._off) this._off(); }
}
register('ui-grid-wave', UIGridWave, gridWaveCss);
