/* =========================================================
   视觉效果：ui-tilt / ui-spotlight / ui-gradient-border / ui-aurora / ui-gradient-text
            ui-pattern / ui-blob / ui-particles / ui-magnetic / ui-shine
   全部是「装饰层」：不改变内容的语义与可访问性，颜色只取 token，
   减少动效模式下静止（鼠标跟随类效果直接关闭）
   ========================================================= */
import { UIElement, register } from './base.js';
import { reduced, loop, tokenColors } from '../lib/motion.js';
import { esc, splitList } from './more-form.js';

const fine = () => typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------------- Tilt 3D 倾斜 ---------------- */
export const tiltCss = `
ui-tilt{display:block;perspective:900px}
.ui-tilt{position:relative;transform-style:preserve-3d;transition:transform .5s var(--ui-ease,ease);will-change:transform;border-radius:var(--ui-radius-lg)}
.ui-tilt.is-active{transition:transform .08s linear}
.ui-tilt__glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s;mix-blend-mode:soft-light;
  background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgba(255,255,255,.75),transparent 55%)}
.ui-tilt.is-active .ui-tilt__glare{opacity:1}
.ui-tilt__pop{transform:translateZ(36px)}
`;

export class UITilt extends UIElement {
  static props = { max: { default: '12' }, scale: { default: '1.03' }, glare: { default: 'true' } };
  template(p) { return '<div class="ui-tilt ui-mo"><slot></slot>' + (p.glare !== 'false' ? '<span class="ui-tilt__glare" aria-hidden="true"></span>' : '') + '</div>'; }
  mounted() {
    const self = this;
    const box = this.querySelector('.ui-tilt');
    box.addEventListener('pointermove', (e) => {
      if (reduced() || e.pointerType === 'touch') return;
      const r = box.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      const m = Number(self.props.max) || 12;
      box.classList.add('is-active');
      box.style.transform = 'rotateX(' + ((0.5 - py) * m * 2).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * m * 2).toFixed(2) + 'deg) scale(' + (Number(self.props.scale) || 1) + ')';
      box.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      box.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    box.addEventListener('pointerleave', () => { box.classList.remove('is-active'); box.style.transform = ''; });
  }
}
register('ui-tilt', UITilt, tiltCss);

/* ---------------- Spotlight 光标聚光 ---------------- */
export const spotlightCss = `
ui-spotlight{display:block}
.ui-spot{position:relative;border-radius:var(--ui-radius-lg);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);overflow:hidden;isolation:isolate}
.ui-spot::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:0;transition:opacity .3s;
  background:radial-gradient(var(--sp-r,260px) circle at var(--x,50%) var(--y,50%),color-mix(in srgb,var(--ui-brand) 16%,transparent),transparent 70%)}
.ui-spot::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s;padding:1.5px;
  background:radial-gradient(calc(var(--sp-r,260px) * .7) circle at var(--x,50%) var(--y,50%),var(--ui-brand),transparent 70%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.ui-spot.is-on::before,.ui-spot.is-on::after{opacity:1}
`;

export class UISpotlight extends UIElement {
  static props = { radius: { default: '260' } };
  template(p) { return '<div class="ui-spot ui-mo" style="--sp-r:' + (Number(p.radius) || 260) + 'px"><slot></slot></div>'; }
  mounted() {
    const box = this.querySelector('.ui-spot');
    box.addEventListener('pointermove', (e) => {
      if (reduced()) return;
      const r = box.getBoundingClientRect();
      box.style.setProperty('--x', (e.clientX - r.left) + 'px');
      box.style.setProperty('--y', (e.clientY - r.top) + 'px');
      box.classList.add('is-on');
    });
    box.addEventListener('pointerleave', () => box.classList.remove('is-on'));
    box.addEventListener('focusin', () => { box.style.setProperty('--x', '50%'); box.style.setProperty('--y', '0%'); box.classList.add('is-on'); });
    box.addEventListener('focusout', () => box.classList.remove('is-on'));
  }
}
register('ui-spotlight', UISpotlight, spotlightCss);

/* ---------------- Gradient Border 流光边框 ---------------- */
export const gradientBorderCss = `
@property --ui-gb-a{syntax:"<angle>";inherits:false;initial-value:0deg}
ui-gradient-border{display:block}
.ui-gb{position:relative;border-radius:var(--ui-radius-lg);padding:var(--gb-w,2px);isolation:isolate;
  background:conic-gradient(from var(--ui-gb-a),var(--gb-c1),var(--gb-c2),var(--gb-c3),var(--gb-c1));
  animation:ui-gb-spin var(--gb-dur,4s) linear infinite}
.ui-gb--glow::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;background:inherit;filter:blur(14px);opacity:.55}
.ui-gb__in{position:relative;border-radius:calc(var(--ui-radius-lg) - var(--gb-w,2px));background:var(--ui-panel);height:100%}
@keyframes ui-gb-spin{to{--ui-gb-a:360deg}}
`;

export class UIGradientBorder extends UIElement {
  static props = { colors: { default: '' }, width: { default: '2' }, speed: { default: '4' }, glow: { type: 'boolean' } };
  template(p) {
    const c = splitList(p.colors);
    const c1 = c[0] || 'var(--ui-brand)', c2 = c[1] || 'var(--ui-accent)', c3 = c[2] || 'var(--ui-ok)';
    return '<div class="ui-gb ui-mo' + (p.glow ? ' ui-gb--glow' : '') + '" style="--gb-w:' + (Number(p.width) || 2) + 'px;--gb-dur:' + (Number(p.speed) || 4) + 's;--gb-c1:' + esc(c1) + ';--gb-c2:' + esc(c2) + ';--gb-c3:' + esc(c3) + '"><div class="ui-gb__in"><slot></slot></div></div>';
  }
}
register('ui-gradient-border', UIGradientBorder, gradientBorderCss);

/* ---------------- Aurora 极光背景 ---------------- */
export const auroraCss = `
ui-aurora{display:block}
.ui-aur{position:relative;overflow:hidden;isolation:isolate;border-radius:var(--ui-radius-lg);background:var(--ui-bg);min-height:var(--aur-h,180px);
  display:flex;align-items:center;justify-content:center}
.ui-aur__b{position:absolute;z-index:-1;width:60%;aspect-ratio:1;border-radius:50%;filter:blur(var(--aur-blur,48px));opacity:var(--aur-o,.55);mix-blend-mode:var(--aur-blend,normal)}
.ui-aur__b:nth-child(1){background:var(--ui-brand);left:-10%;top:-30%;animation:ui-aur-1 14s ease-in-out infinite alternate}
.ui-aur__b:nth-child(2){background:var(--ui-accent);right:-15%;top:-10%;animation:ui-aur-2 17s ease-in-out infinite alternate}
.ui-aur__b:nth-child(3){background:var(--ui-ok);left:20%;bottom:-45%;animation:ui-aur-3 19s ease-in-out infinite alternate}
.ui-aur__c{position:relative;z-index:1;padding:20px;text-align:center;text-shadow:0 1px 14px var(--ui-bg),0 0 2px var(--ui-bg)}
@keyframes ui-aur-1{to{transform:translate(30%,25%) scale(1.2)}}
@keyframes ui-aur-2{to{transform:translate(-35%,30%) scale(.85)}}
@keyframes ui-aur-3{to{transform:translate(25%,-30%) scale(1.15)}}
`;

export class UIAurora extends UIElement {
  static props = { height: { default: '180' }, intensity: { default: '0.55' }, blur: { default: '48' } };
  template(p) {
    return '<div class="ui-aur ui-mo" style="--aur-h:' + (Number(p.height) || 180) + 'px;--aur-o:' + (Number(p.intensity) || 0.55) + ';--aur-blur:' + (Number(p.blur) || 48) + 'px">' +
      '<span class="ui-aur__b" aria-hidden="true"></span><span class="ui-aur__b" aria-hidden="true"></span><span class="ui-aur__b" aria-hidden="true"></span>' +
      '<div class="ui-aur__c"><slot></slot></div></div>';
  }
}
register('ui-aurora', UIAurora, auroraCss);

/* ---------------- Gradient Text 渐变文字 ---------------- */
export const gradientTextCss = `
.ui-gt{background:linear-gradient(90deg,var(--gt-c1),var(--gt-c2),var(--gt-c3),var(--gt-c1));background-size:300% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
.ui-gt--flow{animation:ui-gt-flow var(--gt-dur,6s) linear infinite}
.ui-gt--shine{background:linear-gradient(110deg,var(--ui-text) 40%,var(--gt-c1) 50%,var(--ui-text) 60%);background-size:250% 100%;
  -webkit-background-clip:text;background-clip:text;animation:ui-gt-flow var(--gt-dur,3s) linear infinite}
@keyframes ui-gt-flow{from{background-position:0% 50%}to{background-position:-300% 50%}}
@media (forced-colors: active){.ui-gt{color:CanvasText;-webkit-text-fill-color:CanvasText;background:none}}
`;

export class UIGradientText extends UIElement {
  static props = { colors: { default: '' }, effect: { default: 'flow' }, speed: { default: '6' } };
  template(p) {
    const c = splitList(p.colors);
    return '<span class="ui-gt ui-mo ui-gt--' + esc(p.effect) + '" style="--gt-c1:' + esc(c[0] || 'var(--ui-brand)') + ';--gt-c2:' + esc(c[1] || 'var(--ui-danger)') + ';--gt-c3:' + esc(c[2] || 'var(--ui-warn)') + ';--gt-dur:' + (Number(p.speed) || 6) + 's"><slot></slot></span>';
  }
}
register('ui-gradient-text', UIGradientText, gradientTextCss);

/* ---------------- Pattern 背景图案 ---------------- */
export const patternCss = `
ui-pattern{display:block}
.ui-pat{position:relative;border-radius:var(--ui-radius-lg);border:var(--ui-border-w) solid var(--ui-line);background-color:var(--ui-panel);min-height:var(--pat-h,140px);
  display:flex;align-items:center;justify-content:center;overflow:hidden;--pc:color-mix(in srgb,var(--ui-sub) 30%,transparent);--ps:var(--pat-size,18px)}
.ui-pat::before{content:"";position:absolute;inset:0;pointer-events:none}
.ui-pat--fade::before{-webkit-mask-image:radial-gradient(ellipse at center,#000 30%,transparent 75%);mask-image:radial-gradient(ellipse at center,#000 30%,transparent 75%)}
.ui-pat--dots::before{background:radial-gradient(circle,var(--pc) 1.2px,transparent 1.6px) 0 0/var(--ps) var(--ps)}
.ui-pat--grid::before{background:linear-gradient(var(--pc) 1px,transparent 1px) 0 0/var(--ps) var(--ps),linear-gradient(90deg,var(--pc) 1px,transparent 1px) 0 0/var(--ps) var(--ps)}
.ui-pat--lines::before{background:repeating-linear-gradient(0deg,var(--pc) 0 1px,transparent 1px var(--ps))}
.ui-pat--diagonal::before{background:repeating-linear-gradient(45deg,var(--pc) 0 1px,transparent 1px calc(var(--ps) / 1.6))}
.ui-pat--checker::before{background:conic-gradient(var(--pc) 25%,transparent 0 50%,var(--pc) 0 75%,transparent 0) 0 0/var(--ps) var(--ps);opacity:.6}
.ui-pat--moving::before{animation:ui-pat-move 6s linear infinite}
@keyframes ui-pat-move{to{background-position:var(--ps) var(--ps),var(--ps) var(--ps)}}
.ui-pat__c{position:relative;padding:18px;text-align:center}
`;

export class UIPattern extends UIElement {
  static props = { pattern: { default: 'dots' }, size: { default: '18' }, height: { default: '140' }, fade: { type: 'boolean' }, moving: { type: 'boolean' } };
  template(p) {
    return '<div class="ui-pat ui-mo ui-pat--' + esc(p.pattern) + (p.fade ? ' ui-pat--fade' : '') + (p.moving ? ' ui-pat--moving' : '') + '" style="--pat-size:' + (Number(p.size) || 18) + 'px;--pat-h:' + (Number(p.height) || 140) + 'px"><div class="ui-pat__c"><slot></slot></div></div>';
  }
}
register('ui-pattern', UIPattern, patternCss);

/* ---------------- Blob 流体形状 ---------------- */
export const blobCss = `
.ui-blob{display:inline-grid;place-items:center;width:var(--bl-size,140px);aspect-ratio:1;color:var(--ui-brand-ink);
  background:linear-gradient(135deg,var(--bl-c1),var(--bl-c2));border-radius:42% 58% 63% 37% / 41% 44% 56% 59%;
  animation:ui-blob var(--bl-dur,9s) ease-in-out infinite;box-shadow:0 18px 40px -14px color-mix(in srgb,var(--bl-c1) 60%,transparent)}
.ui-blob > *{animation:ui-blob-counter var(--bl-dur,9s) ease-in-out infinite}
@keyframes ui-blob{
  0%,100%{border-radius:42% 58% 63% 37% / 41% 44% 56% 59%;transform:rotate(0)}
  33%{border-radius:70% 30% 46% 54% / 30% 39% 61% 70%}
  66%{border-radius:31% 69% 39% 61% / 63% 47% 53% 37%;transform:rotate(12deg)}}
@keyframes ui-blob-counter{66%{transform:rotate(-12deg)}}
`;

export class UIBlob extends UIElement {
  static props = { size: { default: '140' }, colors: { default: '' }, speed: { default: '9' } };
  template(p) {
    const c = splitList(p.colors);
    return '<span class="ui-blob ui-mo" style="--bl-size:' + (Number(p.size) || 140) + 'px;--bl-c1:' + esc(c[0] || 'var(--ui-brand)') + ';--bl-c2:' + esc(c[1] || 'color-mix(in srgb,var(--ui-brand) 55%,var(--ui-accent))') + ';--bl-dur:' + (Number(p.speed) || 9) + 's"><span><slot></slot></span></span>';
  }
}
register('ui-blob', UIBlob, blobCss);

/* ---------------- Particles 粒子背景 ---------------- */
export const particlesCss = `
ui-particles{display:block}
.ui-ptc{position:relative;overflow:hidden;border-radius:var(--ui-radius-lg);background:var(--ui-bg);border:var(--ui-border-w) solid var(--ui-line);
  min-height:var(--pt-h,200px);display:flex;align-items:center;justify-content:center;isolation:isolate}
.ui-ptc canvas{position:absolute;inset:0;width:100%;height:100%;z-index:-1}
.ui-ptc__c{position:relative;padding:18px;text-align:center;pointer-events:none}
.ui-ptc__c > *{pointer-events:auto}
`;

export class UIParticles extends UIElement {
  static props = { count: { default: '60' }, link: { default: '110' }, speed: { default: '0.4' }, height: { default: '200' }, interactive: { default: 'true' } };
  template(p) { return '<div class="ui-ptc" style="--pt-h:' + (Number(p.height) || 200) + 'px"><canvas aria-hidden="true"></canvas><div class="ui-ptc__c"><slot></slot></div></div>'; }
  mounted() {
    const self = this, p = this.props;
    if (this._loop) this._loop.stop();
    if (this._ro) this._ro.disconnect();
    const box = this.querySelector('.ui-ptc');
    const cv = box.querySelector('canvas');
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, pts = [], mouse = null;
    const colorOf = () => tokenColors(box, ['brand'])[0];
    let color = colorOf();
    const seed = () => {
      const n = Math.max(10, Math.min(200, Number(p.count) || 60));
      const sp = Number(p.speed) || 0.4;
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * sp, vy: (Math.random() - 0.5) * sp, r: 1 + Math.random() * 1.8 }));
    };
    const size = () => {
      const r = box.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!pts.length) seed();
      draw(0);
    };
    const link = Number(p.link) || 110;
    const draw = (dt) => {
      ctx.clearRect(0, 0, W, H);
      const move = dt && !reduced();
      for (const a of pts) {
        if (move) {
          a.x += a.vx * dt / 16; a.y += a.vy * dt / 16;
          if (a.x < 0 || a.x > W) a.vx *= -1;
          if (a.y < 0 || a.y > H) a.vy *= -1;
          if (mouse) {
            const dx = a.x - mouse.x, dy = a.y - mouse.y, d = Math.hypot(dx, dy);
            if (d < 90 && d > 0.1) { a.x += dx / d * 1.2; a.y += dy / d * 1.2; }
          }
        }
        ctx.globalAlpha = 0.8; ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = color; ctx.lineWidth = 0.8;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) { ctx.globalAlpha = (1 - d / link) * 0.45; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
    };
    this._ro = new ResizeObserver(size);
    this._ro.observe(box);
    if (p.interactive !== 'false') {
      box.addEventListener('pointermove', (e) => { const r = box.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
      box.addEventListener('pointerleave', () => { mouse = null; });
    }
    let n = 0;
    this._loop = loop(box, (dt) => { if (++n % 60 === 0) color = colorOf(); if (!reduced()) draw(dt); });
  }
  /** 测试 / 调试用：当前是否在播放 */
  get running() { return !!(this._loop && this._loop.running); }
  disconnectedCallback() { if (this._loop) this._loop.stop(); if (this._ro) this._ro.disconnect(); }
}
register('ui-particles', UIParticles, particlesCss);

/* ---------------- Magnetic 磁吸 ---------------- */
export const magneticCss = `
ui-magnetic{display:inline-block}
.ui-mag{display:inline-block;padding:var(--mg-pad,24px);margin:calc(var(--mg-pad,24px) * -1)}
.ui-mag__t{display:inline-block;transition:transform .35s var(--ui-spring,ease)}
.ui-mag.is-on .ui-mag__t{transition:transform .12s ease-out}
`;

export class UIMagnetic extends UIElement {
  static props = { strength: { default: '0.35' }, range: { default: '24' } };
  template(p) { return '<span class="ui-mag ui-mo" style="--mg-pad:' + (Number(p.range) || 24) + 'px"><span class="ui-mag__t"><slot></slot></span></span>'; }
  mounted() {
    const self = this;
    const box = this.querySelector('.ui-mag');
    const t = this.querySelector('.ui-mag__t');
    box.addEventListener('pointermove', (e) => {
      if (reduced() || !fine()) return;
      const r = t.getBoundingClientRect();
      const k = Number(self.props.strength) || 0.35;
      box.classList.add('is-on');
      t.style.transform = 'translate(' + ((e.clientX - (r.left + r.width / 2)) * k).toFixed(1) + 'px,' + ((e.clientY - (r.top + r.height / 2)) * k).toFixed(1) + 'px)';
    });
    box.addEventListener('pointerleave', () => { box.classList.remove('is-on'); t.style.transform = ''; });
  }
}
register('ui-magnetic', UIMagnetic, magneticCss);

/* ---------------- Shine 高光扫过 ---------------- */
export const shineCss = `
ui-shine{display:inline-block}
.ui-shine-host{position:relative;overflow:hidden;isolation:isolate}
.ui-shine__s{position:absolute;top:0;bottom:0;left:-60%;width:45%;pointer-events:none;z-index:1;
  background:linear-gradient(105deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-18deg);opacity:0}
.ui-shine__s.is-run{animation:ui-shine var(--sh-dur,.9s) var(--ui-ease,ease)}
@keyframes ui-shine{0%{left:-60%;opacity:1}100%{left:130%;opacity:1}}
`;

export class UIShine extends UIElement {
  static props = { trigger: { default: 'hover' }, interval: { default: '3000' }, duration: { default: '900' } };
  template() { return '<span class="ui-mo" style="display:contents"><slot></slot></span>'; }
  mounted() {
    const self = this;
    const host = this.querySelector('button, a, .ui-card, .ui-btn') || this.querySelector('*');
    if (!host) return;
    host.classList.add('ui-shine-host');
    let s = host.querySelector(':scope > .ui-shine__s');
    if (!s) { s = document.createElement('span'); s.className = 'ui-shine__s'; s.setAttribute('aria-hidden', 'true'); host.appendChild(s); }
    s.style.setProperty('--sh-dur', (Number(this.props.duration) || 900) + 'ms');
    const run = () => { if (reduced()) return; s.classList.remove('is-run'); void s.offsetWidth; s.classList.add('is-run'); };
    s.addEventListener('animationend', () => s.classList.remove('is-run'));
    clearInterval(this._iv);
    if (this.props.trigger === 'loop') this._iv = setInterval(() => { if (self.isConnected && !document.hidden) run(); }, Math.max(1200, Number(this.props.interval) || 3000));
    else { host.addEventListener('mouseenter', run); host.addEventListener('focus', run); }
  }
  disconnectedCallback() { clearInterval(this._iv); }
}
register('ui-shine', UIShine, shineCss);
