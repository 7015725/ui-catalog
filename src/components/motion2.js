/* =========================================================
   动效（第二批 A）：ui-scramble / ui-rotating-text / ui-odometer / ui-draw-svg / ui-morph-icon
                    ui-like-button / ui-daynight / ui-parallax / ui-scroll-progress / ui-card-stack
   ========================================================= */
import { UIElement, register } from './base.js';
import { reduced, onVisible } from '../lib/motion.js';
import { esc, splitList } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
const SR = '.ui-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';

/* ---------------- Scramble 解码文字 ---------------- */
export const scrambleCss = SR + `
.ui-scr{font-variant-numeric:tabular-nums}
.ui-scr i{font-style:normal;color:var(--ui-brand);opacity:.75}
`;
const GLYPHS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';

export class UIScramble extends UIElement {
  static props = { text: { default: '' }, trigger: { default: 'load' }, duration: { default: '1200' } };
  template(p) {
    return '<span class="ui-scr"><span class="ui-sr">' + esc(p.text) + '</span><span class="ui-scr__o" aria-hidden="true">' + esc(p.text) + '</span></span>';
  }
  /** 播放一次解码动画 */
  play() {
    const out = this.querySelector('.ui-scr__o');
    if (!out) return;
    const target = Array.from(this.props.text);
    cancelAnimationFrame(this._raf);
    if (reduced()) { out.textContent = this.props.text; return; }
    const dur = Math.max(300, Number(this.props.duration) || 1200);
    const ends = target.map((_, i) => (i / Math.max(1, target.length)) * dur * 0.6 + Math.random() * dur * 0.4);
    const t0 = performance.now();
    const tick = (t) => {
      const e = t - t0;
      let html = '', done = 0;
      target.forEach((c, i) => {
        if (e >= ends[i] || c === ' ') { html += esc(c); done++; }
        else html += '<i>' + esc(GLYPHS[(Math.random() * GLYPHS.length) | 0]) + '</i>';
      });
      out.innerHTML = html;
      if (done < target.length) this._raf = requestAnimationFrame(tick); else emit(this, 'done', {});
    };
    this._raf = requestAnimationFrame(tick);
  }
  mounted() {
    const self = this;
    if (this._off) this._off();
    clearInterval(this._iv);
    const tr = this.props.trigger;
    if (tr === 'hover') { this.addEventListener('mouseenter', () => self.play()); this.addEventListener('focusin', () => self.play()); }
    else this._off = onVisible(this, () => self.play());
    if (tr === 'loop') this._iv = setInterval(() => { if (self.isConnected && !document.hidden) self.play(); }, Math.max(2500, (Number(this.props.duration) || 1200) + 2000));
  }
  disconnectedCallback() { cancelAnimationFrame(this._raf); clearInterval(this._iv); if (this._off) this._off(); }
}
register('ui-scramble', UIScramble, scrambleCss);

/* ---------------- Rotating Text 文字轮换 ---------------- */
export const rotatingTextCss = SR + `
.ui-rot{display:inline-grid;vertical-align:bottom;overflow:hidden;padding:0 .05em}
.ui-rot > span[aria-hidden]{grid-area:1/1;transform:translateY(105%);opacity:0;transition:transform .55s var(--ui-ease,ease),opacity .4s;white-space:nowrap}
.ui-rot > span.is-on{transform:none;opacity:1}
.ui-rot > span.is-out{transform:translateY(-105%);opacity:0}
`;

export class UIRotatingText extends UIElement {
  static props = { words: { default: '' }, interval: { default: '2200' } };
  template(p) {
    const w = splitList(p.words);
    return '<span class="ui-rot ui-mo"><span class="ui-sr">' + esc(w.join('、')) + '</span>' + w.map((x, i) => '<span aria-hidden="true"' + (i === 0 ? ' class="is-on"' : '') + '>' + esc(x) + '</span>').join('') + '</span>';
  }
  mounted() {
    const self = this;
    clearInterval(this._iv);
    const items = Array.from(this.querySelectorAll('.ui-rot > span[aria-hidden]'));
    if (items.length < 2 || reduced()) return;
    let i = 0;
    this._iv = setInterval(() => {
      if (!self.isConnected || document.hidden) return;
      items.forEach((s) => s.classList.remove('is-out'));
      items[i].classList.replace('is-on', 'is-out');
      i = (i + 1) % items.length;
      items[i].classList.add('is-on');
      emit(self, 'change', { index: i, word: items[i].textContent });
    }, Math.max(1000, Number(this.props.interval) || 2200));
  }
  disconnectedCallback() { clearInterval(this._iv); }
}
register('ui-rotating-text', UIRotatingText, rotatingTextCss);

/* ---------------- Odometer 滚轮数字 ---------------- */
export const odometerCss = SR + `
.ui-odo{display:inline-flex;align-items:flex-end;font-variant-numeric:tabular-nums;line-height:1.15}
.ui-odo__c{display:inline-block;height:1.15em;overflow:hidden}
.ui-odo__c > span{display:flex;flex-direction:column;transition:transform var(--odo-dur,1.2s) var(--ui-ease,ease)}
.ui-odo__c > span > b{font-weight:inherit;height:1.15em}
.ui-odo__s{display:inline-block}
`;

export class UIOdometer extends UIElement {
  static props = { value: { default: '0' }, duration: { default: '1200' }, separator: { default: 'true' } };
  _str(v) {
    let s = String(Math.round(Number(v) || 0));
    if (this.props.separator !== 'false') s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return s;
  }
  template(p) {
    const s = this._str(p.value);
    const prev = this._prev != null ? this._str(this._prev).padStart(s.length, '0').slice(-s.length) : s.replace(/\d/g, '0');
    return '<span class="ui-odo ui-mo" style="--odo-dur:' + (Number(p.duration) || 1200) + 'ms"><span class="ui-sr">' + esc(s) + '</span><span aria-hidden="true" style="display:contents">' +
      Array.from(s).map((c, i) => /\d/.test(c)
        ? '<span class="ui-odo__c"><span data-d="' + c + '" style="transform:translateY(-' + ((/\d/.test(prev[i]) ? Number(prev[i]) : 0) * 10) + '%)">' + '0123456789'.split('').map((d) => '<b>' + d + '</b>').join('') + '</span></span>'
        : '<span class="ui-odo__s">' + esc(c) + '</span>').join('') + '</span></span>';
  }
  mounted() {
    const self = this;
    const cols = this.querySelectorAll('[data-d]');
    const go = () => requestAnimationFrame(() => requestAnimationFrame(() => cols.forEach((c) => { c.style.transform = 'translateY(-' + Number(c.dataset.d) * 10 + '%)'; })));
    if (this._off) this._off();
    if (this._prev != null || reduced()) go();
    else this._off = onVisible(this, go);
    this._prev = Number(this.props.value) || 0;
  }
  disconnectedCallback() { if (this._off) this._off(); }
}
register('ui-odometer', UIOdometer, odometerCss);

/* ---------------- Draw SVG 线条绘制 ---------------- */
export const drawSvgCss = `
ui-draw-svg{display:inline-block;color:var(--ui-brand)}
.ui-draw svg{display:block;width:var(--dw-size,64px);height:auto;overflow:visible}
.ui-draw path,.ui-draw circle,.ui-draw polyline,.ui-draw line,.ui-draw rect{fill:none;stroke:currentColor;stroke-width:var(--dw-w,2);stroke-linecap:round;stroke-linejoin:round}
`;
const DRAW_ICONS = {
  check: '<circle cx="12" cy="12" r="10"/><polyline points="7.5 12.5 10.5 15.5 16.5 9"/>',
  heart: '<path d="M12 20.5s-7.5-4.6-9.3-9.6C1.4 7.4 3.6 4 7 4c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.9-1.8 5-9.3 9.6-9.3 9.6z"/>',
  star: '<path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8z"/>',
  rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9S5.8 14.3 5 15z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  signature: '<path d="M2 17c3-1 4.5-9 7-9s-1.5 9 1 9 3.5-6 5.5-6-.5 5 1.5 5 3-2.5 5-3" />'
};

export class UIDrawSvg extends UIElement {
  static props = { icon: { default: 'check' }, size: { default: '64' }, duration: { default: '1400' }, stroke: { default: '2' }, trigger: { default: 'load' }, label: { default: '' } };
  template(p) {
    const vb = p.icon === 'signature' ? '0 0 24 24' : '0 0 24 24';
    return '<span class="ui-draw" style="--dw-size:' + (Number(p.size) || 64) + 'px;--dw-w:' + (Number(p.stroke) || 2) + '"' +
      (p.label ? ' role="img" aria-label="' + esc(p.label) + '"' : ' aria-hidden="true"') + '><svg viewBox="' + vb + '">' + (DRAW_ICONS[p.icon] || DRAW_ICONS.check) + '</svg></span>';
  }
  /** 重新绘制一遍 */
  play() {
    const shapes = Array.from(this.querySelectorAll('svg > *'));
    const dur = Math.max(200, Number(this.props.duration) || 1400);
    shapes.forEach((s, i) => {
      const len = s.getTotalLength ? Math.ceil(s.getTotalLength()) + 1 : 200;
      s.style.transition = 'none';
      s.style.strokeDasharray = len;
      s.style.strokeDashoffset = reduced() ? 0 : len;
      if (reduced()) return;
      void s.getBoundingClientRect();
      const per = dur / shapes.length;
      s.style.transition = 'stroke-dashoffset ' + per + 'ms var(--ui-ease, ease) ' + (i * per * 0.85) + 'ms';
      requestAnimationFrame(() => { s.style.strokeDashoffset = 0; });
    });
    emit(this, 'play', {});
  }
  mounted() {
    const self = this;
    if (this._off) this._off();
    clearInterval(this._iv);
    const tr = this.props.trigger;
    if (tr === 'hover') { this.querySelectorAll('svg > *').forEach((s) => { s.style.strokeDashoffset = 0; }); this.addEventListener('mouseenter', () => self.play()); }
    else this._off = onVisible(this, () => self.play());
    if (tr === 'loop') this._iv = setInterval(() => { if (self.isConnected && !document.hidden) self.play(); }, Math.max(2500, (Number(this.props.duration) || 1400) + 1800));
  }
  disconnectedCallback() { clearInterval(this._iv); if (this._off) this._off(); }
}
register('ui-draw-svg', UIDrawSvg, drawSvgCss);

/* ---------------- Morph Icon 图标变形 ---------------- */
export const morphIconCss = `
.ui-mi{position:relative;width:var(--mi-s,40px);height:var(--mi-s,40px);border-radius:var(--ui-radius);border:var(--ui-border-w) solid var(--ui-line);
  background:var(--ui-panel);color:var(--ui-text);cursor:pointer;padding:0;display:inline-grid;place-items:center;transition:var(--ui-motion)}
.ui-mi:hover{border-color:var(--ui-brand);color:var(--ui-brand)}
.ui-mi:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-mi i{position:absolute;left:28%;right:28%;height:2px;border-radius:2px;background:currentColor;transition:transform .35s var(--ui-ease,ease),opacity .2s,top .35s var(--ui-ease,ease)}
/* menu ↔ close */
.ui-mi--menu i:nth-child(1){top:32%}.ui-mi--menu i:nth-child(2){top:calc(50% - 1px)}.ui-mi--menu i:nth-child(3){top:calc(68% - 2px)}
.ui-mi--menu[aria-pressed="true"] i:nth-child(1){top:calc(50% - 1px);transform:rotate(45deg)}
.ui-mi--menu[aria-pressed="true"] i:nth-child(2){opacity:0;transform:scaleX(.2)}
.ui-mi--menu[aria-pressed="true"] i:nth-child(3){top:calc(50% - 1px);transform:rotate(-45deg)}
/* plus ↔ minus */
.ui-mi--plus i:nth-child(1){top:calc(50% - 1px)}.ui-mi--plus i:nth-child(2){top:calc(50% - 1px);transform:rotate(90deg)}.ui-mi--plus i:nth-child(3){display:none}
.ui-mi--plus[aria-pressed="true"] i:nth-child(2){transform:rotate(180deg)}
/* play ↔ pause（用 clip-path 变形） */
.ui-mi--play i{display:none}
.ui-mi--play::before{content:"";width:34%;height:38%;background:currentColor;transition:clip-path .35s var(--ui-ease,ease);
  clip-path:polygon(0 0,50% 25%,50% 75%,0 100%,50% 100%,50% 25%,100% 50%,50% 75%);margin-left:6%}
.ui-mi--play[aria-pressed="true"]::before{clip-path:polygon(0 0,35% 0,35% 100%,0 100%,65% 100%,65% 0,100% 0,100% 100%);margin-left:0}
/* arrow 方向翻转 */
.ui-mi--arrow i:nth-child(1){top:calc(50% - 1px)}
.ui-mi--arrow i:nth-child(2){top:calc(50% - 1px);left:auto;right:28%;width:22%;transform-origin:right center;transform:rotate(40deg)}
.ui-mi--arrow i:nth-child(3){top:calc(50% - 1px);left:auto;right:28%;width:22%;transform-origin:right center;transform:rotate(-40deg)}
.ui-mi--arrow{transition:transform .4s var(--ui-ease,ease)}
.ui-mi--arrow[aria-pressed="true"]{transform:rotate(180deg)}
`;

const MI_LABEL = { menu: ['打开菜单', '关闭菜单'], plus: ['展开', '收起'], play: ['播放', '暂停'], arrow: ['向右', '向左'] };

export class UIMorphIcon extends UIElement {
  static props = { icon: { default: 'menu' }, pressed: { type: 'boolean' }, size: { default: '40' }, label: { default: '' } };
  template(p) {
    const l = MI_LABEL[p.icon] || MI_LABEL.menu;
    return '<button type="button" class="ui-mi ui-mo ui-mi--' + esc(p.icon) + '" style="--mi-s:' + (Number(p.size) || 40) + 'px" aria-pressed="' + p.pressed + '" aria-label="' + esc(p.label || (p.pressed ? l[1] : l[0])) + '"><i></i><i></i><i></i></button>';
  }
  mounted() {
    const self = this;
    this.querySelector('button').addEventListener('click', () => {
      self.toggleAttribute('pressed');
      const b = self.querySelector('button'); if (b) b.focus();
      emit(self, 'change', { pressed: self.hasAttribute('pressed') });
    });
  }
}
register('ui-morph-icon', UIMorphIcon, morphIconCss);

/* ---------------- Like Button 点赞 ---------------- */
export const likeButtonCss = `
.ui-like{position:relative;display:inline-flex;align-items:center;gap:6px;padding:6px 12px 6px 10px;cursor:pointer;font:inherit;font-size:13px;
  color:var(--ui-sub);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-pill);transition:var(--ui-motion)}
.ui-like:hover{border-color:var(--ui-danger);color:var(--ui-danger)}
.ui-like:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-like[aria-pressed="true"]{color:var(--ui-danger);border-color:color-mix(in srgb,var(--ui-danger) 40%,transparent);background:var(--ui-danger-soft)}
.ui-like__h{position:relative;display:inline-grid;place-items:center;width:18px;height:18px}
.ui-like__h svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2}
.ui-like[aria-pressed="true"] .ui-like__h svg{fill:currentColor;animation:ui-like-pop .45s var(--ui-spring,ease)}
@keyframes ui-like-pop{0%{transform:scale(.4)}60%{transform:scale(1.35)}100%{transform:scale(1)}}
.ui-like__b{position:absolute;inset:-12px;pointer-events:none}
.ui-like__b i{position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px;border-radius:50%;background:var(--c);opacity:0}
.ui-like.is-burst .ui-like__b i{animation:ui-like-burst .6s ease-out forwards}
@keyframes ui-like-burst{0%{opacity:1;transform:rotate(var(--a)) translateY(0) scale(1)}100%{opacity:0;transform:rotate(var(--a)) translateY(-22px) scale(.3)}}
.ui-like__n{font-variant-numeric:tabular-nums;min-width:1.5em;text-align:left}
`;

export class UILikeButton extends UIElement {
  static props = { count: { default: '0' }, liked: { type: 'boolean' }, label: { default: '点赞' } };
  template(p) {
    const n = Number(p.count) || 0;
    const colors = ['var(--ui-danger)', 'var(--ui-warn)', 'var(--ui-brand)', 'var(--ui-ok)'];
    return '<button type="button" class="ui-like ui-mo" aria-pressed="' + p.liked + '" aria-label="' + esc(p.label) + '，' + n.toLocaleString() + ' 人">' +
      '<span class="ui-like__h" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.6C1.4 7.4 3.6 4 7 4c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.9-1.8 5-9.3 9.6-9.3 9.6z"/></svg>' +
      '<span class="ui-like__b">' + Array.from({ length: 8 }, (_, i) => '<i style="--a:' + i * 45 + 'deg;--c:' + colors[i % 4] + '"></i>').join('') + '</span></span>' +
      '<span class="ui-like__n" aria-hidden="true">' + n.toLocaleString() + '</span></button>';
  }
  mounted() {
    const self = this;
    this.querySelector('button').addEventListener('click', () => {
      const on = !self.hasAttribute('liked');
      self.setAttribute('count', String((Number(self.props.count) || 0) + (on ? 1 : -1)));
      self.toggleAttribute('liked', on);
      const b = self.querySelector('button');
      if (on && !reduced()) { b.classList.add('is-burst'); setTimeout(() => b.classList.remove('is-burst'), 650); }
      b.focus();
      emit(self, 'change', { liked: on, count: Number(self.props.count) });
    });
  }
}
register('ui-like-button', UILikeButton, likeButtonCss);

/* ---------------- Day / Night 昼夜开关 ---------------- */
export const dayNightCss = `
.ui-dn{position:relative;width:76px;height:36px;padding:0;border:0;border-radius:99px;cursor:pointer;overflow:hidden;
  background:linear-gradient(180deg,#7dc3ff,#bfe3ff);transition:background .6s ease;box-shadow:inset 0 2px 6px rgba(0,0,0,.18)}
.ui-dn:focus-visible{outline:none;box-shadow:inset 0 2px 6px rgba(0,0,0,.18),var(--ui-ring)}
.ui-dn[aria-checked="true"]{background:linear-gradient(180deg,#0e1430,#28306b)}
.ui-dn__k{position:absolute;top:4px;left:4px;width:28px;height:28px;border-radius:50%;background:#ffd23f;
  box-shadow:0 0 0 3px rgba(255,210,63,.35),0 2px 6px rgba(0,0,0,.25);transition:transform .6s var(--ui-spring,ease),background .6s,box-shadow .6s}
.ui-dn[aria-checked="true"] .ui-dn__k{transform:translateX(40px);background:#e9ecf5;box-shadow:inset -6px -3px 0 #c4c9da,0 0 10px rgba(233,236,245,.4)}
.ui-dn__cloud{position:absolute;right:8px;top:14px;width:22px;height:8px;border-radius:8px;background:#fff;transition:transform .6s ease,opacity .4s;opacity:.95}
.ui-dn__cloud::before{content:"";position:absolute;left:5px;top:-5px;width:10px;height:10px;border-radius:50%;background:#fff}
.ui-dn[aria-checked="true"] .ui-dn__cloud{transform:translateY(24px);opacity:0}
.ui-dn__s{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;opacity:0;transform:translateY(-12px);transition:opacity .5s .15s,transform .6s}
.ui-dn[aria-checked="true"] .ui-dn__s{opacity:.9;transform:none}
.ui-dn__s:nth-of-type(1){left:12px;top:10px}.ui-dn__s:nth-of-type(2){left:22px;top:20px}.ui-dn__s:nth-of-type(3){left:30px;top:9px}
`;

export class UIDayNight extends UIElement {
  static props = { checked: { type: 'boolean' }, label: { default: '深色模式' } };
  template(p) {
    return '<button type="button" class="ui-dn ui-mo" role="switch" aria-checked="' + p.checked + '" aria-label="' + esc(p.label) + '">' +
      '<span class="ui-dn__s" aria-hidden="true"></span><span class="ui-dn__s" aria-hidden="true"></span><span class="ui-dn__s" aria-hidden="true"></span>' +
      '<span class="ui-dn__cloud" aria-hidden="true"></span><span class="ui-dn__k" aria-hidden="true"></span></button>';
  }
  mounted() {
    const self = this;
    this.querySelector('button').addEventListener('click', () => {
      self.toggleAttribute('checked');
      const b = self.querySelector('button'); if (b) b.focus();
      emit(self, 'change', { checked: self.hasAttribute('checked') });
    });
  }
}
register('ui-daynight', UIDayNight, dayNightCss);

/* ---------------- Parallax 视差 ---------------- */
export const parallaxCss = `
ui-parallax{display:block}
.ui-px{position:relative;overflow:hidden;border-radius:var(--ui-radius-lg);min-height:var(--px-h,200px);background:var(--ui-panel-2);
  border:var(--ui-border-w) solid var(--ui-line)}
.ui-px > *{position:absolute;transition:transform .25s ease-out;will-change:transform}
.ui-px > [data-static]{position:relative}
`;

export class UIParallax extends UIElement {
  static props = { mode: { default: 'pointer' }, height: { default: '200' }, strength: { default: '1' } };
  template(p) { return '<div class="ui-px ui-mo" style="--px-h:' + (Number(p.height) || 200) + 'px"><slot></slot></div>'; }
  mounted() {
    const self = this;
    const box = this.querySelector('.ui-px');
    const layers = Array.from(box.children).filter((c) => !c.hasAttribute('data-static'));
    const k = Number(this.props.strength) || 1;
    const move = (x, y) => layers.forEach((l) => {
      const d = Number(l.dataset.depth || 0.2) * k;
      l.style.transform = 'translate3d(' + (x * d * 40).toFixed(1) + 'px,' + (y * d * 40).toFixed(1) + 'px,0)';
    });
    if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
    if (this.props.mode === 'scroll') {
      this._onScroll = () => {
        if (reduced()) return;
        const r = box.getBoundingClientRect();
        const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        if (Math.abs(t) < 1.2) move(0, -t);
      };
      window.addEventListener('scroll', this._onScroll, { passive: true });
      this._onScroll();
    } else {
      box.addEventListener('pointermove', (e) => {
        if (reduced() || e.pointerType === 'touch') return;
        const r = box.getBoundingClientRect();
        move((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
      });
      box.addEventListener('pointerleave', () => move(0, 0));
    }
  }
  disconnectedCallback() { if (this._onScroll) window.removeEventListener('scroll', this._onScroll); }
}
register('ui-parallax', UIParallax, parallaxCss);

/* ---------------- Scroll Progress 阅读进度 ---------------- */
export const scrollProgressCss = `
ui-scroll-progress{display:block}
.ui-sp{height:var(--sp-h,3px);background:color-mix(in srgb,var(--ui-line) 70%,transparent);border-radius:99px;overflow:hidden}
.ui-sp i{display:block;height:100%;width:100%;transform-origin:left;transform:scaleX(var(--p,0));
  background:linear-gradient(90deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 55%,var(--ui-accent)));transition:transform .1s linear}
.ui-sp--fixed{position:fixed;top:0;left:0;right:0;z-index:500;border-radius:0}
`;

export class UIScrollProgress extends UIElement {
  static props = { target: { default: '' }, height: { default: '3' }, fixed: { type: 'boolean' }, label: { default: '阅读进度' } };
  template(p) {
    return '<div class="ui-sp' + (p.fixed ? ' ui-sp--fixed' : '') + '" style="--sp-h:' + (Number(p.height) || 3) + 'px" role="progressbar" aria-label="' + esc(p.label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>';
  }
  mounted() {
    const self = this;
    const bar = this.querySelector('.ui-sp');
    const el = this.props.target ? document.querySelector(this.props.target) : null;
    if (this._src) this._src.removeEventListener('scroll', this._fn);
    this._src = el || window;
    let last = -1;
    this._fn = () => {
      const max = el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - innerHeight;
      const top = el ? el.scrollTop : scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, top / max)) : 0;
      bar.style.setProperty('--p', p.toFixed(4));
      const n = Math.round(p * 100);
      if (n !== last) { last = n; bar.setAttribute('aria-valuenow', String(n)); if (n === 100) emit(self, 'complete', {}); }
    };
    this._src.addEventListener('scroll', this._fn, { passive: true });
    this._fn();
  }
  disconnectedCallback() { if (this._src) this._src.removeEventListener('scroll', this._fn); }
}
register('ui-scroll-progress', UIScrollProgress, scrollProgressCss);

/* ---------------- Card Stack 卡片堆叠滑动 ---------------- */
export const cardStackCss = `
ui-card-stack{display:block}
.ui-cs{display:flex;flex-direction:column;align-items:center;gap:14px}
.ui-cs__deck{position:relative;width:min(100%,var(--cs-w,260px));height:var(--cs-h,170px);touch-action:pan-y}
.ui-cs__deck > *{position:absolute;inset:0;transition:transform .45s var(--ui-ease,ease),opacity .45s;user-select:none;
  transform:translateY(calc(var(--k) * 10px)) scale(calc(1 - var(--k) * .05));z-index:calc(10 - var(--k));opacity:calc(1 - var(--k) * .25)}
.ui-cs__deck > :nth-child(n+4){opacity:0}
.ui-cs__deck > .is-top{cursor:grab}
.ui-cs__deck > .is-drag{transition:none;cursor:grabbing}
.ui-cs__deck > .is-gone{pointer-events:none;opacity:0!important}
.ui-cs__ops{display:flex;gap:12px}
.ui-cs__ops button{width:44px;height:44px;border-radius:50%;cursor:pointer;font:inherit;font-size:18px;border:var(--ui-border-w) solid var(--ui-line);
  background:var(--ui-panel);box-shadow:var(--ui-shadow-sm);transition:var(--ui-motion)}
.ui-cs__ops button:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-cs__ops [data-dir="left"]{color:var(--ui-danger)}.ui-cs__ops [data-dir="right"]{color:var(--ui-ok)}
.ui-cs__ops button:hover{transform:scale(1.08)}
.ui-cs__empty{position:absolute;inset:0;display:grid;place-items:center;font-size:13px;color:var(--ui-sub);text-align:center}
`;

export class UICardStack extends UIElement {
  static props = { width: { default: '260' }, height: { default: '170' } };
  template(p) {
    return '<div class="ui-cs ui-mo"><div class="ui-cs__deck" style="--cs-w:' + (Number(p.width) || 260) + 'px;--cs-h:' + (Number(p.height) || 170) + 'px" aria-live="polite"><slot></slot></div>' +
      '<div class="ui-cs__ops"><button type="button" data-dir="left" aria-label="不喜欢（左滑）">✕</button><button type="button" data-act="reset" aria-label="重置">↺</button><button type="button" data-dir="right" aria-label="喜欢（右滑）">♥</button></div></div>';
  }
  _cards() { return Array.from(this.querySelector('.ui-cs__deck').children).filter((c) => !c.classList.contains('ui-cs__empty')); }
  _layout() {
    const live = this._cards().filter((c) => !c.classList.contains('is-gone'));
    live.forEach((c, i) => { c.style.setProperty('--k', i); c.classList.toggle('is-top', i === 0); c.toggleAttribute('inert', i !== 0); c.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false'); });
    const deck = this.querySelector('.ui-cs__deck');
    let empty = deck.querySelector('.ui-cs__empty');
    if (!live.length && !empty) deck.insertAdjacentHTML('beforeend', '<div class="ui-cs__empty">都看完啦<br>点 ↺ 重新开始</div>');
    if (live.length && empty) empty.remove();
    return live;
  }
  swipe(dir) {
    const top = this._layout()[0];
    if (!top) return;
    top.style.transform = 'translateX(' + (dir === 'right' ? 140 : -140) + '%) rotate(' + (dir === 'right' ? 18 : -18) + 'deg)';
    top.classList.add('is-gone');
    emit(this, 'swipe', { dir: dir, card: top });
    setTimeout(() => { top.style.transform = ''; this._layout(); }, reduced() ? 0 : 300);
    if (reduced()) this._layout();
  }
  mounted() {
    const self = this;
    this._layout();
    this.querySelectorAll('[data-dir]').forEach((b) => b.addEventListener('click', () => self.swipe(b.dataset.dir)));
    this.querySelector('[data-act="reset"]').addEventListener('click', () => { self._cards().forEach((c) => c.classList.remove('is-gone')); self._layout(); });
    const deck = this.querySelector('.ui-cs__deck');
    let sx = 0, dx = 0, card = null;
    deck.addEventListener('pointerdown', (e) => {
      card = e.target.closest('.is-top');
      if (!card || reduced()) { card = null; return; }
      sx = e.clientX; dx = 0; card.classList.add('is-drag'); card.setPointerCapture(e.pointerId);
    });
    deck.addEventListener('pointermove', (e) => {
      if (!card) return;
      dx = e.clientX - sx;
      card.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 14) + 'deg)';
    });
    const end = () => {
      if (!card) return;
      card.classList.remove('is-drag');
      const c = card; card = null;
      if (Math.abs(dx) > 90) self.swipe(dx > 0 ? 'right' : 'left');
      else c.style.transform = '';
    };
    deck.addEventListener('pointerup', end);
    deck.addEventListener('pointercancel', end);
  }
}
register('ui-card-stack', UICardStack, cardStackCss);
