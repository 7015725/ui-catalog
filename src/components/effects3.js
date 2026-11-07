/* =========================================================
   视觉（第二批 B）：ui-meteors / ui-image-compare / ui-lens / ui-image-filter / ui-text-3d
                    ui-gooey / ui-cursor-trail / ui-cube / ui-ribbon / ui-snow
   ========================================================= */
import { UIElement, register } from './base.js';
import { reduced } from '../lib/motion.js';
import { esc, splitList } from './more-form.js';
import { demoImage } from './more-display2.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
const rng = (seed) => { let s = seed || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
let uid = 0;
const srcOf = (p) => p.src || (p.demo !== '' && p.demo != null ? demoImage(p.demo, '') : '');

/* ---------------- Meteors 流星雨 ---------------- */
export const meteorsCss = `
ui-meteors{display:block}
.ui-met{position:relative;overflow:hidden;isolation:isolate;border-radius:var(--ui-radius-lg);min-height:var(--mt-h,200px);display:flex;align-items:center;justify-content:center;
  background:linear-gradient(180deg,#0a0c1c,#161a3a);color:#eef2ff}
.ui-met i{position:absolute;top:-10%;width:2px;height:2px;border-radius:50%;background:#fff;box-shadow:0 0 6px 1px rgba(255,255,255,.6);
  transform:rotate(215deg);animation:ui-met var(--t) linear infinite var(--dl);opacity:0}
.ui-met i::after{content:"";position:absolute;top:50%;left:2px;width:var(--len,90px);height:1px;transform:translateY(-50%);
  background:linear-gradient(90deg,rgba(255,255,255,.7),transparent)}
@keyframes ui-met{0%{opacity:1;transform:rotate(215deg) translateX(0)}70%{opacity:1}100%{opacity:0;transform:rotate(215deg) translateX(-520px)}}
.ui-met__c{position:relative;z-index:1;padding:20px;text-align:center}
`;

export class UIMeteors extends UIElement {
  static props = { count: { default: '14' }, height: { default: '200' }, seed: { default: '9' } };
  template(p) {
    const r = rng(Number(p.seed) || 9);
    const n = Math.max(3, Math.min(40, Number(p.count) || 14));
    let m = '';
    for (let i = 0; i < n; i++) m += '<i style="left:' + (10 + r() * 110).toFixed(1) + '%;--t:' + (2.5 + r() * 4).toFixed(1) + 's;--dl:-' + (r() * 6).toFixed(1) + 's;--len:' + (50 + r() * 80).toFixed(0) + 'px"></i>';
    return '<div class="ui-met ui-mo" style="--mt-h:' + (Number(p.height) || 200) + 'px"><span aria-hidden="true">' + m + '</span><div class="ui-met__c"><slot></slot></div></div>';
  }
}
register('ui-meteors', UIMeteors, meteorsCss);

/* ---------------- Image Compare 前后对比 ---------------- */
export const imageCompareCss = `
ui-image-compare{display:block}
.ui-ic{position:relative;aspect-ratio:var(--ic-r,16/9);border-radius:var(--ui-radius-lg);overflow:hidden;user-select:none;background:var(--ui-panel-2);touch-action:pan-y}
.ui-ic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.ui-ic__a{clip-path:inset(0 calc(100% - var(--pos,50%)) 0 0)}
.ui-ic__line{position:absolute;top:0;bottom:0;left:var(--pos,50%);width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.15);pointer-events:none}
.ui-ic__knob{position:absolute;top:50%;left:var(--pos,50%);width:38px;height:38px;margin:-19px;border-radius:50%;background:#fff;color:#222;
  display:grid;place-items:center;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.3);pointer-events:none}
.ui-ic input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize}
.ui-ic input:focus-visible ~ .ui-ic__knob{box-shadow:0 0 0 3px var(--ui-brand),0 4px 14px rgba(0,0,0,.3)}
.ui-ic__tag{position:absolute;top:10px;padding:2px 8px;border-radius:99px;font-size:11px;color:#fff;background:rgba(0,0,0,.55);pointer-events:none}
.ui-ic__tag--a{left:10px}.ui-ic__tag--b{right:10px}
`;

export class UIImageCompare extends UIElement {
  static props = { before: { default: '' }, after: { default: '' }, demo: { default: '' }, 'label-before': { default: '修图前' }, 'label-after': { default: '修图后' }, ratio: { default: '16/9' }, value: { default: '50' } };
  template(p) {
    const base = p.demo !== '' ? demoImage(p.demo, '') : '';
    const after = p.after || base, before = p.before || base;
    const v = Math.max(0, Math.min(100, Number(p.value) || 50));
    /* 只有 demo 时，「之前」用 CSS 滤镜模拟未修图（灰、暗、低对比） */
    const fx = !p.before && base ? ' style="filter:grayscale(.85) brightness(.85) contrast(.85)"' : '';
    return '<div class="ui-ic" style="--pos:' + v + '%;--ic-r:' + esc(p.ratio) + '">' +
      '<img src="' + esc(after) + '" alt="' + esc(p['label-after']) + '">' +
      '<img class="ui-ic__a" src="' + esc(before) + '" alt="' + esc(p['label-before']) + '"' + fx + '>' +
      '<span class="ui-ic__tag ui-ic__tag--a" aria-hidden="true">' + esc(p['label-before']) + '</span><span class="ui-ic__tag ui-ic__tag--b" aria-hidden="true">' + esc(p['label-after']) + '</span>' +
      '<span class="ui-ic__line" aria-hidden="true"></span>' +
      '<input type="range" min="0" max="100" step="1" value="' + v + '" aria-label="对比分隔线位置（左侧' + esc(p['label-before']) + '，右侧' + esc(p['label-after']) + '）">' +
      '<span class="ui-ic__knob" aria-hidden="true">◀▶</span></div>';
  }
  mounted() {
    const self = this;
    const box = this.querySelector('.ui-ic'), input = this.querySelector('input');
    input.addEventListener('input', () => { box.style.setProperty('--pos', input.value + '%'); emit(self, 'input', { value: Number(input.value) }); });
  }
}
register('ui-image-compare', UIImageCompare, imageCompareCss);

/* ---------------- Lens 放大镜 ---------------- */
export const lensCss = `
ui-lens{display:block}
.ui-lens{position:relative;border-radius:var(--ui-radius-lg);overflow:hidden;cursor:zoom-in;aspect-ratio:var(--ls-r,4/3)}
.ui-lens img{display:block;width:100%;height:100%;object-fit:cover}
.ui-lens__g{position:absolute;width:var(--ls-s,140px);height:var(--ls-s,140px);margin:calc(var(--ls-s,140px) / -2);border-radius:50%;pointer-events:none;opacity:0;
  border:3px solid #fff;box-shadow:0 8px 30px rgba(0,0,0,.35),inset 0 0 20px rgba(0,0,0,.15);background-repeat:no-repeat;transition:opacity .2s,transform .2s;transform:scale(.6)}
.ui-lens.is-on .ui-lens__g{opacity:1;transform:none}
`;

export class UILens extends UIElement {
  static props = { src: { default: '' }, demo: { default: '' }, alt: { default: '' }, zoom: { default: '2.5' }, size: { default: '140' }, ratio: { default: '4/3' } };
  template(p) {
    const src = srcOf(p);
    return '<div class="ui-lens" style="--ls-s:' + (Number(p.size) || 140) + 'px;--ls-r:' + esc(p.ratio) + '"><img src="' + esc(src) + '" alt="' + esc(p.alt) + '"><span class="ui-lens__g" aria-hidden="true" style="background-image:url(&quot;' + esc(src) + '&quot;)"></span></div>';
  }
  mounted() {
    const self = this;
    const box = this.querySelector('.ui-lens'), g = this.querySelector('.ui-lens__g');
    box.addEventListener('pointermove', (e) => {
      const r = box.getBoundingClientRect(), z = Number(self.props.zoom) || 2.5;
      const x = e.clientX - r.left, y = e.clientY - r.top, s = g.offsetWidth;
      box.classList.add('is-on');
      g.style.left = x + 'px'; g.style.top = y + 'px';
      g.style.backgroundSize = (r.width * z) + 'px ' + (r.height * z) + 'px';
      g.style.backgroundPosition = (-(x * z - s / 2)) + 'px ' + (-(y * z - s / 2)) + 'px';
    });
    box.addEventListener('pointerleave', () => box.classList.remove('is-on'));
  }
}
register('ui-lens', UILens, lensCss);

/* ---------------- Image Filter 图片滤镜 ---------------- */
export const imageFilterCss = `
ui-image-filter{display:block}
.ui-if{margin:0;display:flex;flex-direction:column;gap:6px}
.ui-if__box{position:relative;border-radius:var(--ui-radius);overflow:hidden;aspect-ratio:var(--if-r,1/1)}
.ui-if__box img{display:block;width:100%;height:100%;object-fit:cover;transition:filter .5s ease}
.ui-if--reveal .ui-if__box:hover img{filter:none!important}
.ui-if__duo{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;background:var(--duo-light);transition:opacity .5s}
.ui-if__duo::before{content:"";position:absolute;inset:0;mix-blend-mode:multiply;background:var(--duo-dark)}
.ui-if--reveal .ui-if__box:hover .ui-if__duo{opacity:0}
.ui-if figcaption{font-size:11.5px;color:var(--ui-sub);text-align:center}
`;
const FILTERS = {
  vintage: 'sepia(.55) contrast(1.05) saturate(1.2) hue-rotate(-10deg)',
  mono: 'grayscale(1) contrast(1.1)',
  noir: 'grayscale(1) contrast(1.6) brightness(.85)',
  warm: 'sepia(.25) saturate(1.4) hue-rotate(-12deg)',
  cool: 'saturate(1.1) hue-rotate(18deg) brightness(1.05)',
  pop: 'saturate(1.9) contrast(1.15)',
  fade: 'contrast(.75) brightness(1.12) saturate(.7)',
  blur: 'blur(3px)',
  duotone: 'grayscale(1) contrast(1.2)'
};
const FILTER_NAME = { vintage: '复古', mono: '黑白', noir: '黑色电影', warm: '暖调', cool: '冷调', pop: '高饱和', fade: '褪色', blur: '模糊', duotone: '双色调' };

export class UIImageFilter extends UIElement {
  static props = { src: { default: '' }, demo: { default: '' }, alt: { default: '' }, filter: { default: 'vintage' }, reveal: { default: 'true' }, ratio: { default: '1/1' }, caption: { default: '' } };
  template(p) {
    const f = FILTERS[p.filter] || FILTERS.vintage;
    const duo = p.filter === 'duotone';
    return '<figure class="ui-if' + (p.reveal !== 'false' ? ' ui-if--reveal' : '') + '"><div class="ui-if__box" style="--if-r:' + esc(p.ratio) + ';--duo-dark:var(--ui-brand);--duo-light:color-mix(in srgb,var(--ui-warn) 70%,#fff)">' +
      '<img src="' + esc(srcOf(p)) + '" alt="' + esc(p.alt) + '" style="filter:' + f + '" loading="lazy">' + (duo ? '<span class="ui-if__duo" aria-hidden="true"></span>' : '') + '</div>' +
      '<figcaption>' + esc(p.caption || FILTER_NAME[p.filter] || p.filter) + '</figcaption></figure>';
  }
}
register('ui-image-filter', UIImageFilter, imageFilterCss);

/* ---------------- Text 3D 立体文字 ---------------- */
export const text3dCss = `
.ui-t3d{display:inline-block;font-weight:900;letter-spacing:.02em;line-height:1.1}
.ui-t3d--3d{color:var(--ui-brand);text-shadow:1px 1px 0 color-mix(in srgb,var(--ui-brand) 80%,#000),2px 2px 0 color-mix(in srgb,var(--ui-brand) 72%,#000),
  3px 3px 0 color-mix(in srgb,var(--ui-brand) 64%,#000),4px 4px 0 color-mix(in srgb,var(--ui-brand) 56%,#000),5px 5px 0 color-mix(in srgb,var(--ui-brand) 48%,#000),
  6px 6px 12px rgba(0,0,0,.35)}
.ui-t3d--long{color:var(--ui-text);text-shadow:var(--long)}
.ui-t3d--outline{color:transparent;-webkit-text-stroke:1.5px var(--ui-text);paint-order:stroke fill}
.ui-t3d--retro{color:#ffd23f;text-shadow:3px 3px 0 #ff4f81,6px 6px 0 #6b4cff,9px 9px 0 rgba(0,0,0,.25)}
.ui-t3d--emboss{color:var(--ui-panel-2);text-shadow:-1px -1px 0 rgba(255,255,255,.7),1px 1px 1px rgba(0,0,0,.35),0 0 1px rgba(0,0,0,.3)}
.ui-t3d--stack{color:var(--ui-text);text-shadow:0 4px 0 color-mix(in srgb,var(--ui-brand) 55%,transparent),0 8px 0 color-mix(in srgb,var(--ui-brand) 30%,transparent),0 12px 0 color-mix(in srgb,var(--ui-brand) 15%,transparent)}
.ui-t3d--hover{transition:transform .35s var(--ui-ease,ease),text-shadow .35s}
.ui-t3d--hover:hover{transform:translate(-3px,-3px)}
@media (forced-colors: active){.ui-t3d{color:CanvasText;-webkit-text-stroke:0;text-shadow:none}}
`;

export class UIText3D extends UIElement {
  static props = { effect: { default: '3d' }, depth: { default: '24' } };
  template(p) {
    let long = '';
    if (p.effect === 'long') {
      const n = Math.max(4, Math.min(60, Number(p.depth) || 24));
      long = ' style="--long:' + Array.from({ length: n }, (_, i) => (i + 1) + 'px ' + (i + 1) + 'px 0 color-mix(in srgb,var(--ui-brand) ' + Math.max(8, 60 - i * (55 / n)).toFixed(0) + '%,transparent)').join(',') + '"';
    }
    return '<span class="ui-t3d ui-mo ui-t3d--hover ui-t3d--' + esc(p.effect) + '"' + long + '><slot></slot></span>';
  }
}
register('ui-text-3d', UIText3D, text3dCss);

/* ---------------- Gooey 融合液滴 ---------------- */
export const gooeyCss = `
ui-gooey{display:inline-block}
.ui-goo{display:block;position:relative;width:var(--goo-s,180px);height:var(--goo-s,180px)}
.ui-goo__f{position:absolute;inset:0;display:block}
.ui-goo__f i{position:absolute;left:50%;top:50%;width:34%;height:34%;margin:-17%;border-radius:50%;background:var(--ui-brand)}
.ui-goo__f i:nth-child(1){width:42%;height:42%;margin:-21%}
.ui-goo__f i:nth-child(2){animation:ui-goo-a 3.4s ease-in-out infinite}
.ui-goo__f i:nth-child(3){animation:ui-goo-b 4.2s ease-in-out infinite;background:color-mix(in srgb,var(--ui-brand) 55%,var(--ui-accent))}
.ui-goo__f i:nth-child(4){animation:ui-goo-c 3.8s ease-in-out infinite;width:24%;height:24%;margin:-12%;background:color-mix(in srgb,var(--ui-brand) 40%,var(--ui-ok))}
.ui-goo__f i:nth-child(5){animation:ui-goo-d 5s ease-in-out infinite;width:20%;height:20%;margin:-10%}
@keyframes ui-goo-a{0%,100%{transform:translate(0,0)}50%{transform:translate(95%,-30%)}}
@keyframes ui-goo-b{0%,100%{transform:translate(0,0)}50%{transform:translate(-90%,40%)}}
@keyframes ui-goo-c{0%,100%{transform:translate(0,0)}50%{transform:translate(30%,130%)}}
@keyframes ui-goo-d{0%,100%{transform:translate(0,0)}50%{transform:translate(-60%,-150%)}}
.ui-goo__c{position:absolute;inset:0;display:grid;place-items:center;color:var(--ui-brand-ink);font-weight:800;font-size:15px;pointer-events:none}
`;

export class UIGooey extends UIElement {
  static props = { size: { default: '180' } };
  template(p) {
    const id = this._fid || (this._fid = 'ui-goo-' + (++uid));
    /* SVG 滤镜：先模糊再提高 alpha 对比度，相邻色块的边缘就会「黏」在一起 */
    return '<span class="ui-goo ui-mo" style="--goo-s:' + (Number(p.size) || 180) + 'px">' +
      '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><filter id="' + id + '"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></svg>' +
      '<span class="ui-goo__f" style="filter:url(#' + id + ')" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="ui-goo__c"><slot></slot></span></span>';
  }
}
register('ui-gooey', UIGooey, gooeyCss);

/* ---------------- Cursor Trail 鼠标拖尾 ---------------- */
export const cursorTrailCss = `
ui-cursor-trail{display:block}
.ui-ct{position:relative;overflow:hidden;border-radius:var(--ui-radius-lg);min-height:var(--ct-h,180px);display:flex;align-items:center;justify-content:center;
  background:var(--ui-panel-2);border:var(--ui-border-w) dashed var(--ui-line);cursor:crosshair}
.ui-ct__p{position:absolute;pointer-events:none;width:var(--sz);height:var(--sz);margin:calc(var(--sz) / -2);border-radius:50%;background:var(--c);
  animation:ui-ct-fade .8s ease-out forwards}
.ui-ct__p.star{border-radius:0;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)}
@keyframes ui-ct-fade{to{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}}
.ui-ct__c{position:relative;font-size:13px;color:var(--ui-sub);pointer-events:none;text-align:center}
`;

export class UICursorTrail extends UIElement {
  static props = { shape: { default: 'dot' }, height: { default: '180' } };
  template(p) { return '<div class="ui-ct ui-mo" style="--ct-h:' + (Number(p.height) || 180) + 'px"><div class="ui-ct__c"><slot></slot></div></div>'; }
  mounted() {
    const self = this;
    const box = this.querySelector('.ui-ct');
    const colors = ['var(--ui-brand)', 'var(--ui-accent)', 'var(--ui-warn)', 'var(--ui-ok)'];
    let last = 0, n = 0;
    box.addEventListener('pointermove', (e) => {
      if (reduced()) return;
      const now = performance.now();
      if (now - last < 16) return;
      last = now;
      if (box.childElementCount > 80) return; /* 上限，防止快速移动时节点过多 */
      const r = box.getBoundingClientRect();
      const d = document.createElement('span');
      const sz = self.props.shape === 'star' ? 10 + Math.random() * 10 : 6 + Math.random() * 8;
      d.className = 'ui-ct__p' + (self.props.shape === 'star' ? ' star' : '');
      d.setAttribute('aria-hidden', 'true');
      d.style.cssText = 'left:' + (e.clientX - r.left) + 'px;top:' + (e.clientY - r.top) + 'px;--sz:' + sz.toFixed(1) + 'px;--c:' + colors[n++ % 4] +
        ';--dx:' + ((Math.random() - 0.5) * 30).toFixed(0) + 'px;--dy:' + (10 + Math.random() * 20).toFixed(0) + 'px';
      box.appendChild(d);
      d.addEventListener('animationend', () => d.remove());
      setTimeout(() => d.remove(), 1200);
    });
  }
}
register('ui-cursor-trail', UICursorTrail, cursorTrailCss);

/* ---------------- Cube 3D 立方体 ---------------- */
export const cubeCss = `
ui-cube{display:inline-block}
.ui-cube{display:block;width:var(--cb-s,120px);height:var(--cb-s,120px);perspective:600px;margin:calc(var(--cb-s,120px) * .15)}
.ui-cube__in{display:block;position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:ui-cube var(--cb-d,12s) linear infinite;transform:rotateX(-22deg) rotateY(30deg)}
.ui-cube:hover .ui-cube__in{animation-play-state:paused}
.ui-cube__in > span{position:absolute;inset:0;display:grid;place-items:center;font-weight:800;font-size:15px;color:var(--ui-brand-ink);
  background:color-mix(in srgb,var(--ui-brand) 82%,transparent);border:1px solid color-mix(in srgb,var(--ui-brand-ink) 40%,transparent);backface-visibility:visible}
.ui-cube__in > span:nth-child(1){transform:translateZ(calc(var(--cb-s,120px) / 2))}
.ui-cube__in > span:nth-child(2){transform:rotateY(180deg) translateZ(calc(var(--cb-s,120px) / 2));background:color-mix(in srgb,var(--ui-brand) 60%,#000)}
.ui-cube__in > span:nth-child(3){transform:rotateY(90deg) translateZ(calc(var(--cb-s,120px) / 2));background:color-mix(in srgb,var(--ui-brand) 70%,var(--ui-accent))}
.ui-cube__in > span:nth-child(4){transform:rotateY(-90deg) translateZ(calc(var(--cb-s,120px) / 2));background:color-mix(in srgb,var(--ui-brand) 70%,var(--ui-ok))}
.ui-cube__in > span:nth-child(5){transform:rotateX(90deg) translateZ(calc(var(--cb-s,120px) / 2));background:color-mix(in srgb,var(--ui-brand) 55%,#fff)}
.ui-cube__in > span:nth-child(6){transform:rotateX(-90deg) translateZ(calc(var(--cb-s,120px) / 2));background:color-mix(in srgb,var(--ui-brand) 50%,#000)}
/* 面上的文字放在品牌色小牌上：任何风格下都与 brand-ink 对比达标（各面明暗不同不影响可读性） */
.ui-cube__in > span > b{padding:2px 7px;border-radius:var(--ui-radius-sm);background:var(--ui-brand);color:var(--ui-brand-ink);font-weight:800}
.ui-cube__in > span > b:empty{display:none}
@keyframes ui-cube{from{transform:rotateX(-22deg) rotateY(0)}to{transform:rotateX(-22deg) rotateY(360deg)}}
`;

export class UICube extends UIElement {
  static props = { faces: { default: 'UI,KIT,CSS,JS,3D,✦' }, size: { default: '120' }, speed: { default: '12' } };
  template(p) {
    const f = splitList(p.faces);
    return '<span class="ui-cube ui-mo" role="img" aria-label="旋转立方体：' + esc(f.join('、')) + '" style="--cb-s:' + (Number(p.size) || 120) + 'px;--cb-d:' + (Number(p.speed) || 12) + 's">' +
      '<span class="ui-cube__in" aria-hidden="true">' + Array.from({ length: 6 }, (_, i) => '<span><b>' + esc(f[i] || '') + '</b></span>').join('') + '</span></span>';
  }
}
register('ui-cube', UICube, cubeCss);

/* ---------------- Ribbon 角标丝带 ---------------- */
export const ribbonCss = `
ui-ribbon{display:block}
.ui-rb{position:relative;overflow:hidden;border-radius:var(--ui-radius-lg)}
.ui-rb__r{position:absolute;z-index:2;top:16px;width:150px;padding:5px 0;text-align:center;font-size:11.5px;font-weight:800;letter-spacing:.08em;
  color:var(--rb-ink,var(--ui-brand-ink));background:var(--rb-c,var(--ui-brand));box-shadow:0 3px 10px -2px rgba(0,0,0,.35);pointer-events:none}
.ui-rb--right .ui-rb__r{right:-40px;transform:rotate(45deg)}
.ui-rb--left .ui-rb__r{left:-40px;transform:rotate(-45deg)}
.ui-rb__r::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%) -200% 0/200% 100% no-repeat;
  animation:ui-rb-shine 3.5s ease-in-out infinite}
@keyframes ui-rb-shine{0%,60%{background-position:-200% 0}100%{background-position:200% 0}}
`;

export class UIRibbon extends UIElement {
  static props = { text: { default: 'NEW' }, position: { default: 'right' }, variant: { default: 'brand' } };
  template(p) {
    const c = { brand: ['var(--ui-brand)', 'var(--ui-brand-ink)'], success: ['var(--ui-ok)', 'var(--ui-on-color)'], danger: ['var(--ui-danger)', 'var(--ui-on-color)'], warn: ['var(--ui-warn)', 'var(--ui-on-color)'] }[p.variant] || ['var(--ui-brand)', 'var(--ui-brand-ink)'];
    return '<div class="ui-rb ui-mo ui-rb--' + esc(p.position) + '" style="--rb-c:' + c[0] + ';--rb-ink:' + c[1] + '"><slot></slot><span class="ui-rb__r">' + esc(p.text) + '</span></div>';
  }
}
register('ui-ribbon', UIRibbon, ribbonCss);

/* ---------------- Snow 飘雪 ---------------- */
export const snowCss = `
ui-snow{display:block}
.ui-snow{position:relative;overflow:hidden;isolation:isolate;border-radius:var(--ui-radius-lg);min-height:var(--sn-h,200px);display:flex;align-items:center;justify-content:center;
  background:linear-gradient(180deg,#1b2a4a,#3a5a8a 70%,#c9d9ee);color:#fff}
.ui-snow i{position:absolute;top:-12px;font-style:normal;color:#fff;opacity:var(--o);font-size:var(--s);animation:ui-snow var(--t) linear infinite var(--dl);text-shadow:0 0 4px rgba(255,255,255,.6)}
@keyframes ui-snow{0%{transform:translate(0,0) rotate(0)}50%{transform:translate(var(--sway),calc(var(--h) / 2)) rotate(180deg)}100%{transform:translate(0,calc(var(--h) + 24px)) rotate(360deg)}}
.ui-snow__c{position:relative;z-index:1;padding:20px;text-align:center;text-shadow:0 1px 8px rgba(0,0,0,.4)}
`;

export class UISnow extends UIElement {
  static props = { count: { default: '40' }, height: { default: '200' }, flake: { default: '❄' }, seed: { default: '4' } };
  template(p) {
    const r = rng(Number(p.seed) || 4), h = Number(p.height) || 200;
    const n = Math.max(5, Math.min(120, Number(p.count) || 40));
    const chars = Array.from(p.flake || '❄');
    let f = '';
    for (let i = 0; i < n; i++) {
      const big = r() < 0.3;
      f += '<i style="left:' + (r() * 100).toFixed(1) + '%;--s:' + (big ? 12 + r() * 8 : 6 + r() * 5).toFixed(0) + 'px;--o:' + (0.5 + r() * 0.5).toFixed(2) + ';--t:' + (big ? 6 + r() * 4 : 9 + r() * 6).toFixed(1) + 's;--dl:-' + (r() * 12).toFixed(1) + 's;--sway:' + ((r() - 0.5) * 60).toFixed(0) + 'px">' + (big ? esc(chars[i % chars.length]) : '•') + '</i>';
    }
    return '<div class="ui-snow ui-mo" style="--sn-h:' + h + 'px;--h:' + h + 'px"><span aria-hidden="true">' + f + '</span><div class="ui-snow__c"><slot></slot></div></div>';
  }
}
register('ui-snow', UISnow, snowCss);
