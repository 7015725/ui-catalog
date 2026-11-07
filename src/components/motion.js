/* =========================================================
   动效组件：ui-reveal / ui-typewriter / ui-count-up / ui-marquee / ui-text-anim
            ui-ripple / ui-flip-card / ui-animate / ui-loader + uiConfetti()
   约定：根元素带 .ui-mo，减少动效模式（系统设置或 data-motion="reduce"）下动画瞬间完成；
        JS 驱动的动画在开始前检查 reduced()，直接给出最终状态
   ========================================================= */
import { UIElement, register } from './base.js';
import { reduced, onVisible, tokenColors } from '../lib/motion.js';
import { esc, splitList } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));

/* ---------------- Reveal 滚动入场 ---------------- */
export const revealCss = `
ui-reveal{display:block}
.ui-rv{display:var(--rv-display,block);grid-template-columns:var(--rv-cols,none);gap:var(--rv-gap,10px)}
.ui-rv > *{opacity:0;transition:opacity var(--rv-dur,.6s) var(--ui-ease,ease),transform var(--rv-dur,.6s) var(--ui-ease,ease),filter var(--rv-dur,.6s) ease;
  transition-delay:calc(var(--rv-delay,0ms) + var(--i,0) * var(--rv-stagger,0ms))}
.ui-rv--fade-up > *{transform:translateY(24px)}
.ui-rv--fade-down > *{transform:translateY(-24px)}
.ui-rv--fade-left > *{transform:translateX(28px)}
.ui-rv--fade-right > *{transform:translateX(-28px)}
.ui-rv--zoom > *{transform:scale(.88)}
.ui-rv--flip > *{transform:perspective(600px) rotateX(35deg);transform-origin:top}
.ui-rv--blur > *{filter:blur(10px);transform:scale(1.04)}
.ui-rv--fade > *{transform:none}
.ui-rv.is-in > *{opacity:1;transform:none;filter:none}
`;

export class UIReveal extends UIElement {
  static props = { effect: { default: 'fade-up' }, delay: { default: '0' }, duration: { default: '600' }, stagger: { default: '0' }, once: { default: 'true' }, display: { default: 'block' }, columns: { default: '' } };
  template(p) {
    return '<div class="ui-rv ui-mo ui-rv--' + esc(p.effect) + '" style="--rv-delay:' + (Number(p.delay) || 0) + 'ms;--rv-dur:' + (Number(p.duration) || 600) + 'ms;--rv-stagger:' + (Number(p.stagger) || 0) + 'ms;--rv-display:' + esc(p.display) + (p.columns ? ';--rv-cols:repeat(auto-fit,minmax(min(100%,' + (Number(p.columns) || 160) + 'px),1fr))' : '') + '"><slot></slot></div>';
  }
  mounted() {
    const self = this;
    const box = this.querySelector('.ui-rv');
    Array.from(box.children).forEach((c, i) => c.style.setProperty('--i', i));
    if (this._off) this._off();
    if (reduced()) { box.classList.add('is-in'); return; }
    this._off = onVisible(box, (v) => { box.classList.toggle('is-in', v); if (v) emit(self, 'reveal', {}); }, { once: this.props.once !== 'false', threshold: 0.15 });
  }
  /** 重新播放入场动画 */
  replay() {
    const box = this.querySelector('.ui-rv');
    if (!box) return;
    box.classList.remove('is-in');
    void box.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('is-in')));
  }
  disconnectedCallback() { if (this._off) this._off(); }
}
register('ui-reveal', UIReveal, revealCss);

/* ---------------- Typewriter 打字机 ---------------- */
export const typewriterCss = `
.ui-tw{white-space:pre-wrap}
.ui-tw__c{display:inline-block;width:.08em;min-width:2px;height:1.05em;margin-left:2px;vertical-align:-.15em;background:var(--ui-brand);
  animation:ui-tw-blink 1s steps(1) infinite}
@keyframes ui-tw-blink{50%{opacity:0}}
.ui-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

export class UITypewriter extends UIElement {
  static props = { words: { default: '' }, speed: { default: '90' }, 'delete-speed': { default: '45' }, pause: { default: '1400' }, loop: { default: 'true' }, cursor: { default: 'true' } };
  template(p) {
    const words = splitList(p.words);
    return '<span class="ui-tw ui-mo"><span class="ui-sr">' + esc(words.join('，')) + '</span>' +
      '<span class="ui-tw__t" aria-hidden="true"></span>' + (p.cursor !== 'false' ? '<span class="ui-tw__c" aria-hidden="true"></span>' : '') + '</span>';
  }
  mounted() {
    clearTimeout(this._t);
    const self = this, p = this.props;
    const out = this.querySelector('.ui-tw__t');
    const words = splitList(p.words);
    if (!words.length) return;
    if (reduced()) { out.textContent = words[0]; return; }
    let w = 0, i = 0, del = false;
    const step = () => {
      if (!self.isConnected) return;
      const word = Array.from(words[w]);
      if (!del) {
        i++;
        out.textContent = word.slice(0, i).join('');
        if (i >= word.length) {
          if (p.loop === 'false' && w === words.length - 1) { emit(self, 'done', {}); return; }
          del = true; self._t = setTimeout(step, Number(p.pause) || 1400); return;
        }
        self._t = setTimeout(step, (Number(p.speed) || 90) * (0.7 + Math.random() * 0.6));
      } else {
        i--;
        out.textContent = word.slice(0, i).join('');
        if (i <= 0) { del = false; w = (w + 1) % words.length; self._t = setTimeout(step, 300); return; }
        self._t = setTimeout(step, Number(p['delete-speed']) || 45);
      }
    };
    if (this._off) this._off();
    this._off = onVisible(this, () => { self._t = setTimeout(step, 300); });
  }
  disconnectedCallback() { clearTimeout(this._t); if (this._off) this._off(); }
}
register('ui-typewriter', UITypewriter, typewriterCss);

/* ---------------- Count Up 数字滚动 ---------------- */
export const countUpCss = `
.ui-cu{font-variant-numeric:tabular-nums}
.ui-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

export class UICountUp extends UIElement {
  static props = { to: { default: '0' }, from: { default: '0' }, duration: { default: '1600' }, decimals: { default: '0' }, prefix: { default: '' }, suffix: { default: '' }, separator: { default: 'true' } };
  _fmt(v) {
    const p = this.props;
    const d = Math.max(0, Math.min(6, Number(p.decimals) || 0));
    let s = v.toFixed(d);
    if (p.separator !== 'false') { const parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = parts.join('.'); }
    return p.prefix + s + p.suffix;
  }
  template(p) {
    return '<span class="ui-cu"><span class="ui-sr">' + esc(this._fmt(Number(p.to) || 0)) + '</span><span aria-hidden="true">' + esc(this._fmt(Number(p.from) || 0)) + '</span></span>';
  }
  mounted() {
    const self = this, p = this.props;
    const out = this.querySelector('[aria-hidden]');
    const from = Number(p.from) || 0, to = Number(p.to) || 0, dur = Math.max(200, Number(p.duration) || 1600);
    cancelAnimationFrame(this._raf);
    if (reduced()) { out.textContent = this._fmt(to); return; }
    if (this._off) this._off();
    this._off = onVisible(this, () => {
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        out.textContent = self._fmt(from + (to - from) * e);
        if (k < 1) self._raf = requestAnimationFrame(tick); else emit(self, 'done', {});
      };
      self._raf = requestAnimationFrame(tick);
    });
  }
  disconnectedCallback() { cancelAnimationFrame(this._raf); if (this._off) this._off(); }
}
register('ui-count-up', UICountUp, countUpCss);

/* ---------------- Marquee 无限滚动 ---------------- */
export const marqueeCss = `
ui-marquee{display:block;width:100%;min-width:0}
.ui-mq{display:flex;overflow:hidden;user-select:none;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.ui-mq__track{display:flex;flex:0 0 auto;min-width:100%;animation:ui-mq var(--mq-dur,24s) linear infinite}
.ui-mq--right .ui-mq__track{animation-direction:reverse}
.ui-mq--pause:hover .ui-mq__track,.ui-mq--pause:focus-within .ui-mq__track{animation-play-state:paused}
.ui-mq__g{display:flex;flex:0 0 auto;align-items:center;gap:var(--mq-gap,32px);padding-right:var(--mq-gap,32px)}
@keyframes ui-mq{to{transform:translateX(-50%)}}
`;

export class UIMarquee extends UIElement {
  static props = { speed: { default: '24' }, direction: { default: 'left' }, gap: { default: '32' }, 'pause-on-hover': { default: 'true' } };
  template(p) {
    return '<div class="ui-mq ui-mo' + (p.direction === 'right' ? ' ui-mq--right' : '') + (p['pause-on-hover'] !== 'false' ? ' ui-mq--pause' : '') +
      '" style="--mq-dur:' + (Number(p.speed) || 24) + 's;--mq-gap:' + (Number(p.gap) || 32) + 'px"><div class="ui-mq__track"><div class="ui-mq__g"><slot></slot></div></div></div>';
  }
  mounted() {
    const track = this.querySelector('.ui-mq__track');
    track.querySelectorAll('.ui-mq__g[aria-hidden]').forEach((n) => n.remove());
    const g = track.querySelector('.ui-mq__g');
    /* 复制一份内容，translateX(-50%) 时正好首尾相接；副本对读屏隐藏、不可聚焦 */
    const clone = g.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a,button,input,[tabindex]').forEach((n) => n.setAttribute('tabindex', '-1'));
    clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    track.appendChild(clone);
  }
}
register('ui-marquee', UIMarquee, marqueeCss);

/* ---------------- Text Anim 逐字动画 ---------------- */
export const textAnimCss = `
.ui-ta{display:inline-block}
.ui-ta > span[aria-hidden]{display:inline-block;white-space:pre;animation-duration:.7s;animation-fill-mode:both;animation-timing-function:var(--ui-ease,ease);
  animation-delay:calc(var(--i) * var(--ta-stagger,40ms))}
.ui-ta--loop > span[aria-hidden]{animation-iteration-count:infinite;animation-duration:1.6s}
.ui-ta--wave > span[aria-hidden]{animation-name:ui-ta-wave}
.ui-ta--rise > span[aria-hidden]{animation-name:ui-ta-rise}
.ui-ta--fade > span[aria-hidden]{animation-name:ui-ta-fade}
.ui-ta--blur > span[aria-hidden]{animation-name:ui-ta-blur}
.ui-ta--pop > span[aria-hidden]{animation-name:ui-ta-pop;animation-timing-function:var(--ui-spring,ease)}
.ui-ta--hover > span[aria-hidden]{animation-name:none}
.ui-ta--hover:hover > span[aria-hidden]{animation-name:ui-ta-wave}
@keyframes ui-ta-wave{0%,100%{transform:none}30%{transform:translateY(-.32em)}60%{transform:translateY(.06em)}}
@keyframes ui-ta-rise{from{opacity:0;transform:translateY(.7em) rotate(6deg)}to{opacity:1;transform:none}}
@keyframes ui-ta-fade{from{opacity:0}to{opacity:1}}
@keyframes ui-ta-blur{from{opacity:0;filter:blur(8px);transform:scale(1.3)}to{opacity:1;filter:none;transform:none}}
@keyframes ui-ta-pop{0%{opacity:0;transform:scale(.3)}100%{opacity:1;transform:none}}
`;

export class UITextAnim extends UIElement {
  static props = { text: { default: '' }, effect: { default: 'rise' }, stagger: { default: '40' }, trigger: { default: 'load' } };
  template(p) {
    const chars = Array.from(String(p.text));
    const cls = 'ui-ta ui-mo ui-ta--' + esc(p.effect) + (p.trigger === 'loop' ? ' ui-ta--loop' : '') + (p.trigger === 'hover' ? ' ui-ta--hover' : '');
    return '<span class="' + cls + '" style="--ta-stagger:' + (Number(p.stagger) || 40) + 'ms"><span class="ui-sr">' + esc(p.text) + '</span>' +
      chars.map((c, i) => '<span aria-hidden="true" style="--i:' + i + '">' + esc(c) + '</span>').join('') + '</span>';
  }
  /** 重播：重新插入节点即可重启 CSS 动画 */
  replay() { const t = this._lastTpl; this._lastTpl = null; this._render(); return t; }
}
register('ui-text-anim', UITextAnim, textAnimCss);

/* ---------------- Ripple 水波纹 ---------------- */
export const rippleCss = `
ui-ripple{display:inline-block}
.ui-rp-host{position:relative;overflow:hidden;isolation:isolate}
.ui-rp{position:absolute;border-radius:50%;pointer-events:none;background:var(--rp-c,currentColor);opacity:.28;transform:scale(0);
  animation:ui-rp .6s var(--ui-ease,ease-out) forwards;z-index:0}
@keyframes ui-rp{to{transform:scale(1);opacity:0}}
`;

export class UIRipple extends UIElement {
  static props = { color: { default: '' } };
  template() { return '<span class="ui-mo" style="display:contents"><slot></slot></span>'; }
  mounted() {
    const self = this;
    if (this._bound) return;
    this._bound = true;
    this.addEventListener('pointerdown', (e) => {
      if (reduced()) return;
      const host = self.querySelector('button, a, [role="button"], .ui-card') || self.firstElementChild;
      if (!host || host.disabled) return;
      host.classList.add('ui-rp-host');
      const r = host.getBoundingClientRect();
      const size = Math.hypot(Math.max(e.clientX - r.left, r.right - e.clientX), Math.max(e.clientY - r.top, r.bottom - e.clientY)) * 2;
      const dot = document.createElement('span');
      dot.className = 'ui-rp';
      dot.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px' +
        (self.props.color ? ';--rp-c:' + self.props.color : '');
      host.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
      setTimeout(() => dot.remove(), 900);
    });
  }
}
register('ui-ripple', UIRipple, rippleCss);

/* ---------------- Flip Card 翻转卡片 ---------------- */
export const flipCardCss = `
ui-flip-card{display:block;perspective:1000px}
.ui-flip{display:grid;cursor:pointer;outline:none;border-radius:var(--ui-radius-lg)}
.ui-flip:focus-visible{box-shadow:var(--ui-ring)}
.ui-flip__in{display:grid;transform-style:preserve-3d;transition:transform .7s var(--ui-ease,ease)}
.ui-flip__in > *{grid-area:1/1;backface-visibility:hidden;-webkit-backface-visibility:hidden;min-width:0}
.ui-flip__in > :nth-child(2){transform:rotateY(180deg)}
.ui-flip--hover:hover .ui-flip__in,.ui-flip--hover:focus-visible .ui-flip__in,.ui-flip.is-flipped .ui-flip__in{transform:rotateY(180deg)}
.ui-flip--v .ui-flip__in > :nth-child(2){transform:rotateX(180deg)}
.ui-flip--v.ui-flip--hover:hover .ui-flip__in,.ui-flip--v.ui-flip--hover:focus-visible .ui-flip__in,.ui-flip--v.is-flipped .ui-flip__in{transform:rotateX(180deg)}
/* 减少动效：改为淡入淡出，不做 3D 旋转 */
@media (prefers-reduced-motion: reduce){
  .ui-flip__in,.ui-flip__in > *{transform:none!important}
  .ui-flip__in > :nth-child(2){opacity:0}
  .ui-flip--hover:hover .ui-flip__in > :nth-child(2),.ui-flip.is-flipped .ui-flip__in > :nth-child(2){opacity:1}
  .ui-flip--hover:hover .ui-flip__in > :first-child,.ui-flip.is-flipped .ui-flip__in > :first-child{opacity:0}
}
[data-motion="reduce"] .ui-flip__in,[data-motion="reduce"] .ui-flip__in > *{transform:none!important}
[data-motion="reduce"] .ui-flip__in > :nth-child(2){opacity:0}
[data-motion="reduce"] .ui-flip--hover:hover .ui-flip__in > :nth-child(2),[data-motion="reduce"] .ui-flip.is-flipped .ui-flip__in > :nth-child(2){opacity:1}
[data-motion="reduce"] .ui-flip--hover:hover .ui-flip__in > :first-child,[data-motion="reduce"] .ui-flip.is-flipped .ui-flip__in > :first-child{opacity:0}
`;

export class UIFlipCard extends UIElement {
  static props = { trigger: { default: 'hover' }, direction: { default: 'horizontal' }, label: { default: '翻转卡片' } };
  template(p) {
    const click = p.trigger === 'click';
    return '<div class="ui-flip ui-mo' + (click ? '' : ' ui-flip--hover') + (p.direction === 'vertical' ? ' ui-flip--v' : '') + (this._flipped ? ' is-flipped' : '') + '"' +
      (click ? ' role="button" tabindex="0" aria-pressed="' + !!this._flipped + '" aria-label="' + esc(p.label) + '（点击翻转）"' : ' tabindex="0" aria-label="' + esc(p.label) + '（悬停或聚焦翻转）"') +
      '><div class="ui-flip__in"><slot></slot></div></div>';
  }
  mounted() {
    const self = this;
    const box = this.querySelector('.ui-flip');
    const back = this.querySelector('.ui-flip__in > :nth-child(2)');
    const sync = (on) => { if (back) back.toggleAttribute('inert', !on); const f = self.querySelector('.ui-flip__in > :first-child'); if (f) f.toggleAttribute('inert', !!on); };
    sync(this._flipped);
    if (this.props.trigger !== 'click') {
      box.addEventListener('mouseenter', () => sync(true)); box.addEventListener('mouseleave', () => sync(false));
      box.addEventListener('focus', () => sync(true)); box.addEventListener('blur', () => sync(false));
      return;
    }
    const flip = () => {
      self._flipped = !self._flipped;
      box.classList.toggle('is-flipped', self._flipped);
      box.setAttribute('aria-pressed', String(self._flipped));
      sync(self._flipped);
      emit(self, 'flip', { flipped: self._flipped });
    };
    box.addEventListener('click', (e) => { if (!e.target.closest('a,button,input')) flip(); });
    box.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === box) { e.preventDefault(); flip(); } });
  }
}
register('ui-flip-card', UIFlipCard, flipCardCss);

/* ---------------- Animate 动画预设 ---------------- */
export const animateCss = `
ui-animate{display:inline-block}
.ui-an{display:inline-block;animation-duration:var(--an-dur,.9s);animation-delay:var(--an-delay,0s);animation-fill-mode:both;
  animation-iteration-count:var(--an-n,1);animation-timing-function:ease}
.ui-an.is-on.ui-an--bounce{animation-name:ui-an-bounce;transform-origin:center bottom}
.ui-an.is-on.ui-an--pulse{animation-name:ui-an-pulse}
.ui-an.is-on.ui-an--shake{animation-name:ui-an-shake}
.ui-an.is-on.ui-an--wobble{animation-name:ui-an-wobble}
.ui-an.is-on.ui-an--heartbeat{animation-name:ui-an-heart;animation-timing-function:ease-in-out}
.ui-an.is-on.ui-an--swing{animation-name:ui-an-swing;transform-origin:top center}
.ui-an.is-on.ui-an--jello{animation-name:ui-an-jello}
.ui-an.is-on.ui-an--tada{animation-name:ui-an-tada}
.ui-an.is-on.ui-an--float{animation-name:ui-an-float;animation-timing-function:ease-in-out}
.ui-an.is-on.ui-an--spin{animation-name:ui-an-spin;animation-timing-function:linear}
.ui-an.is-on.ui-an--rubber{animation-name:ui-an-rubber}
.ui-an.is-on.ui-an--flash{animation-name:ui-an-flash}
@keyframes ui-an-bounce{0%,20%,53%,100%{transform:none;animation-timing-function:cubic-bezier(.215,.61,.355,1)}40%,43%{transform:translateY(-22px) scaleY(1.1);animation-timing-function:cubic-bezier(.755,.05,.855,.06)}70%{transform:translateY(-11px) scaleY(1.05)}80%{transform:translateY(0) scaleY(.95)}90%{transform:translateY(-3px)}}
@keyframes ui-an-pulse{50%{transform:scale(1.08)}}
@keyframes ui-an-shake{10%,30%,50%,70%,90%{transform:translateX(-6px)}20%,40%,60%,80%{transform:translateX(6px)}}
@keyframes ui-an-wobble{15%{transform:translateX(-18%) rotate(-5deg)}30%{transform:translateX(12%) rotate(3deg)}45%{transform:translateX(-9%) rotate(-3deg)}60%{transform:translateX(6%) rotate(2deg)}75%{transform:translateX(-3%) rotate(-1deg)}}
@keyframes ui-an-heart{14%,42%{transform:scale(1.18)}28%,70%{transform:scale(1)}}
@keyframes ui-an-swing{20%{transform:rotate(15deg)}40%{transform:rotate(-10deg)}60%{transform:rotate(5deg)}80%{transform:rotate(-5deg)}100%{transform:none}}
@keyframes ui-an-jello{22%{transform:skewX(-12deg) skewY(-12deg)}33%{transform:skewX(6deg) skewY(6deg)}44%{transform:skewX(-3deg) skewY(-3deg)}55%{transform:skewX(1.5deg) skewY(1.5deg)}66%{transform:skewX(-.7deg) skewY(-.7deg)}}
@keyframes ui-an-tada{10%,20%{transform:scale(.9) rotate(-3deg)}30%,50%,70%,90%{transform:scale(1.1) rotate(3deg)}40%,60%,80%{transform:scale(1.1) rotate(-3deg)}}
@keyframes ui-an-float{50%{transform:translateY(-8px)}}
@keyframes ui-an-spin{to{transform:rotate(360deg)}}
@keyframes ui-an-rubber{30%{transform:scale(1.25,.75)}40%{transform:scale(.75,1.25)}50%{transform:scale(1.15,.85)}65%{transform:scale(.95,1.05)}75%{transform:scale(1.05,.95)}}
@keyframes ui-an-flash{25%,75%{opacity:.15}50%{opacity:1}}
`;

export const ANIM_PRESETS = ['bounce', 'pulse', 'shake', 'wobble', 'heartbeat', 'swing', 'jello', 'tada', 'float', 'spin', 'rubber', 'flash'];

export class UIAnimate extends UIElement {
  static props = { effect: { default: 'bounce' }, trigger: { default: 'click' }, duration: { default: '900' }, delay: { default: '0' }, repeat: { default: '1' } };
  template(p) {
    const n = p.trigger === 'loop' ? 'infinite' : (p.repeat === 'infinite' ? 'infinite' : Math.max(1, Number(p.repeat) || 1));
    return '<span class="ui-an ui-mo ui-an--' + esc(p.effect) + (p.trigger === 'load' || p.trigger === 'loop' ? ' is-on' : '') + '" style="--an-dur:' + (Number(p.duration) || 900) + 'ms;--an-delay:' + (Number(p.delay) || 0) + 'ms;--an-n:' + n + '"><slot></slot></span>';
  }
  /** 播放一次（重复调用会从头开始） */
  play() {
    const a = this.querySelector('.ui-an');
    if (!a || reduced()) return;
    a.classList.remove('is-on'); void a.offsetWidth; a.classList.add('is-on');
  }
  mounted() {
    const self = this;
    const a = this.querySelector('.ui-an');
    a.addEventListener('animationend', () => { if (self.props.trigger !== 'loop' && self.props.trigger !== 'load') a.classList.remove('is-on'); emit(self, 'end', {}); });
    if (this.props.trigger === 'hover') a.addEventListener('mouseenter', () => self.play());
    if (this.props.trigger === 'click') a.addEventListener('click', () => self.play());
  }
}
register('ui-animate', UIAnimate, animateCss);

/* ---------------- Loader 加载动画 ---------------- */
export const loaderCss = `
.ui-ld{display:inline-flex;flex-direction:column;align-items:center;gap:8px;color:var(--ui-brand);--s:var(--ld-size,32px)}
.ui-ld__l{font-size:11.5px;color:var(--ui-sub)}
.ui-ld__v{position:relative;width:var(--s);height:var(--s);display:flex;align-items:center;justify-content:center;gap:calc(var(--s) * .1)}
.ui-ld i{display:block;background:currentColor;flex:0 0 auto}
/* dots */
.ui-ld--dots i{width:22%;height:22%;border-radius:50%;animation:ui-ld-dots 1.2s infinite ease-in-out both}
.ui-ld--dots i:nth-child(2){animation-delay:.16s}.ui-ld--dots i:nth-child(3){animation-delay:.32s}
@keyframes ui-ld-dots{0%,80%,100%{transform:scale(.35);opacity:.4}40%{transform:scale(1);opacity:1}}
/* bars */
.ui-ld--bars i{width:12%;height:100%;border-radius:2px;animation:ui-ld-bars 1s infinite ease-in-out}
.ui-ld--bars i:nth-child(2){animation-delay:-.9s}.ui-ld--bars i:nth-child(3){animation-delay:-.8s}.ui-ld--bars i:nth-child(4){animation-delay:-.7s}.ui-ld--bars i:nth-child(5){animation-delay:-.6s}
@keyframes ui-ld-bars{0%,40%,100%{transform:scaleY(.35)}20%{transform:scaleY(1)}}
/* ring */
.ui-ld--ring .ui-ld__v{border-radius:50%;border:calc(var(--s) * .11) solid color-mix(in srgb,currentColor 18%,transparent);border-top-color:currentColor;animation:ui-ld-spin .8s linear infinite}
.ui-ld--ring i{display:none}
@keyframes ui-ld-spin{to{transform:rotate(360deg)}}
/* pulse */
.ui-ld--pulse i{position:absolute;inset:0;border-radius:50%;opacity:0;animation:ui-ld-pulse 1.6s infinite cubic-bezier(.2,.6,.4,1)}
.ui-ld--pulse i:nth-child(2){animation-delay:.8s}
@keyframes ui-ld-pulse{0%{transform:scale(.1);opacity:.9}100%{transform:scale(1);opacity:0}}
/* orbit */
.ui-ld--orbit .ui-ld__v{animation:ui-ld-spin 1.4s linear infinite}
.ui-ld--orbit i{position:absolute;width:24%;height:24%;border-radius:50%}
.ui-ld--orbit i:nth-child(1){top:0;left:38%}
.ui-ld--orbit i:nth-child(2){bottom:8%;left:6%;opacity:.7}
.ui-ld--orbit i:nth-child(3){bottom:8%;right:6%;opacity:.4}
/* wave */
.ui-ld--wave i{width:14%;height:14%;border-radius:50%;animation:ui-ld-wave 1.2s infinite ease-in-out}
.ui-ld--wave i:nth-child(2){animation-delay:.1s}.ui-ld--wave i:nth-child(3){animation-delay:.2s}.ui-ld--wave i:nth-child(4){animation-delay:.3s}
@keyframes ui-ld-wave{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-140%)}}
/* square */
.ui-ld--square i{width:60%;height:60%;border-radius:calc(var(--ui-radius-sm) / 2);animation:ui-ld-square 1.8s infinite ease-in-out}
@keyframes ui-ld-square{0%{transform:perspective(120px) rotateX(0) rotateY(0)}50%{transform:perspective(120px) rotateX(-180deg) rotateY(0)}100%{transform:perspective(120px) rotateX(-180deg) rotateY(-180deg)}}
/* bar（进度条式） */
.ui-ld--line .ui-ld__v{width:calc(var(--s) * 4);height:4px;border-radius:99px;overflow:hidden;background:color-mix(in srgb,currentColor 18%,transparent);display:block}
.ui-ld--line i{width:40%;height:100%;border-radius:99px;animation:ui-ld-line 1.2s infinite cubic-bezier(.6,.1,.4,.9)}
@keyframes ui-ld-line{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
/* 减少动效：保留一个缓慢的透明度呼吸，用户仍能看出「在加载」 */
@media (prefers-reduced-motion: reduce){.ui-ld__v{animation:ui-ld-calm 2s ease-in-out infinite!important}.ui-ld__v i{animation:none!important;transform:none!important;opacity:1}}
[data-motion="reduce"] .ui-ld__v{animation:ui-ld-calm 2s ease-in-out infinite!important}
[data-motion="reduce"] .ui-ld__v i{animation:none!important;transform:none!important;opacity:1}
@keyframes ui-ld-calm{50%{opacity:.35}}
`;

const LD_N = { dots: 3, bars: 5, ring: 0, pulse: 2, orbit: 3, wave: 4, square: 1, line: 1 };

export class UILoader extends UIElement {
  static props = { type: { default: 'dots' }, size: { default: '32' }, label: { default: '' } };
  template(p) {
    const n = LD_N[p.type] == null ? 3 : LD_N[p.type];
    return '<span class="ui-ld ui-ld--' + esc(p.type) + '" role="status" aria-label="' + esc(p.label || '加载中') + '" style="--ld-size:' + (Number(p.size) || 32) + 'px">' +
      '<span class="ui-ld__v" aria-hidden="true">' + '<i></i>'.repeat(n) + '</span>' + (p.label ? '<span class="ui-ld__l" aria-hidden="true">' + esc(p.label) + '</span>' : '') + '</span>';
  }
}
register('ui-loader', UILoader, loaderCss);

/* ---------------- uiConfetti 撒花（函数 API） ---------------- */
/**
 * uiConfetti({ x, y, count, spread, colors, from }) —— x/y 为视口坐标（默认屏幕中上），from 可传一个元素作为发射点
 * 减少动效模式下不播放，返回 false
 */
export function confetti(opts) {
  const o = opts || {};
  if (reduced()) return false;
  let x = o.x, y = o.y;
  if (o.from && o.from.getBoundingClientRect) { const r = o.from.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  if (x == null) x = innerWidth / 2;
  if (y == null) y = innerHeight * 0.35;
  const colors = o.colors || tokenColors(document.documentElement, ['brand', 'ok', 'warn', 'danger', 'accent']);
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999';
  const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  const n = Math.min(400, Number(o.count) || 140);
  const spread = (Number(o.spread) || 70) * Math.PI / 180;
  const ps = Array.from({ length: n }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * spread * 2;
    const v = 6 + Math.random() * 9;
    return { x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: 6 + Math.random() * 6, h: 4 + Math.random() * 6,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, c: colors[(Math.random() * colors.length) | 0], life: 0, shape: Math.random() < 0.3 ? 1 : 0 };
  });
  const t0 = performance.now();
  const tick = (now) => {
    /* 按真实时间推进：低帧率设备上也在 ~4 秒内结束，不会残留画布 */
    const k = Math.min(3, ((now || performance.now()) - (tick.last || t0)) / 16.7); tick.last = now || performance.now();
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = 0;
    ps.forEach((p) => {
      p.vy += 0.28 * k; p.vx *= Math.pow(0.985, k); p.vy *= Math.pow(0.985, k); p.x += p.vx * k; p.y += p.vy * k; p.r += p.vr * k; p.life += k;
      if (p.y < innerHeight + 30) alive++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(0, 1 - p.life / 220);
      ctx.fillStyle = p.c;
      if (p.shape) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2.4, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 1);
      ctx.restore();
    });
    if (alive && performance.now() - t0 < 4200) requestAnimationFrame(tick); else cv.remove();
  };
  requestAnimationFrame(tick);
  return true;
}
if (typeof window !== 'undefined') window.uiConfetti = confetti;
