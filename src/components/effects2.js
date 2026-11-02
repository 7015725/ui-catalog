/* =========================================================
   视觉（第二批 A）：ui-glass-card / ui-neon-text / ui-grain / ui-mesh-gradient / ui-glitch
                    ui-holo / ui-wave / ui-starfield / ui-grid-beam / ui-border-beam
   ========================================================= */
import { UIElement, register } from './base.js';
import { reduced } from '../lib/motion.js';
import { esc, splitList } from './more-form.js';

const SR = '.ui-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';
/* 可复现的伪随机：同一个 seed 每次渲染位置一致，避免重绘时星星「跳来跳去」 */
const rng = (seed) => { let s = seed || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

/* ---------------- Glass Card 玻璃卡片 ---------------- */
export const glassCardCss = `
ui-glass-card{display:block}
.ui-glc{position:relative;padding:22px;border-radius:var(--ui-radius-lg);overflow:hidden;isolation:isolate;min-height:var(--gl-h,180px);
  display:flex;align-items:center;justify-content:center;background:var(--ui-panel-2)}
.ui-glc__bg{position:absolute;inset:0;z-index:-2}
.ui-glc__bg i{position:absolute;border-radius:50%;filter:blur(2px)}
.ui-glc__bg i:nth-child(1){width:46%;aspect-ratio:1;left:-6%;top:-14%;background:linear-gradient(135deg,var(--ui-brand),#ec4899);animation:ui-glc-f 9s ease-in-out infinite alternate}
.ui-glc__bg i:nth-child(2){width:34%;aspect-ratio:1;right:-4%;bottom:-18%;background:linear-gradient(135deg,var(--ui-ok),#06b6d4);animation:ui-glc-f 11s ease-in-out infinite alternate-reverse}
.ui-glc__bg i:nth-child(3){width:18%;aspect-ratio:1;right:24%;top:8%;background:linear-gradient(135deg,var(--ui-warn),#f97316);animation:ui-glc-f 7s ease-in-out infinite alternate}
@keyframes ui-glc-f{to{transform:translate(12%,10%) rotate(20deg)}}
.ui-glc__card{position:relative;width:min(100%,300px);padding:18px;border-radius:calc(var(--ui-radius-lg) + 4px);color:var(--ui-text);
  background:color-mix(in srgb,var(--ui-panel) var(--gl-tint,55%),transparent);
  backdrop-filter:blur(var(--gl-blur,18px)) saturate(1.5);-webkit-backdrop-filter:blur(var(--gl-blur,18px)) saturate(1.5);
  border:1px solid color-mix(in srgb,#fff 45%,transparent);box-shadow:0 10px 40px -12px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.4)}
@supports not (backdrop-filter:blur(1px)){.ui-glc__card{background:var(--ui-panel)}}
`;

export class UIGlassCard extends UIElement {
  static props = { blur: { default: '18' }, tint: { default: '55' }, height: { default: '180' } };
  template(p) {
    return '<div class="ui-glc ui-mo" style="--gl-blur:' + (Number(p.blur) || 18) + 'px;--gl-tint:' + (Number(p.tint) || 55) + '%;--gl-h:' + (Number(p.height) || 180) + 'px">' +
      '<span class="ui-glc__bg" aria-hidden="true"><i></i><i></i><i></i></span><div class="ui-glc__card"><slot></slot></div></div>';
  }
}
register('ui-glass-card', UIGlassCard, glassCardCss);

/* ---------------- Neon Text 霓虹灯 ---------------- */
export const neonTextCss = `
.ui-neon{display:inline-block;padding:var(--nn-pad,14px 22px);border-radius:var(--ui-radius);background:var(--nn-bg,#0b0d14);line-height:1.1}
.ui-neon--bare{padding:0;background:none}
.ui-neon__t{font-weight:700;color:#fff;letter-spacing:.04em;
  text-shadow:0 0 2px #fff,0 0 6px var(--nn-c),0 0 14px var(--nn-c),0 0 28px var(--nn-c),0 0 48px var(--nn-c)}
.ui-neon--flicker .ui-neon__t{animation:ui-neon-fl 4s infinite}
@keyframes ui-neon-fl{0%,18%,22%,25%,53%,57%,100%{opacity:1}20%,24%,55%{opacity:.35;text-shadow:none}}
`;

export class UINeonText extends UIElement {
  static props = { color: { default: '' }, flicker: { type: 'boolean' }, bare: { type: 'boolean' } };
  template(p) {
    return '<span class="ui-neon ui-mo' + (p.flicker ? ' ui-neon--flicker' : '') + (p.bare ? ' ui-neon--bare' : '') + '" style="--nn-c:' + esc(p.color || '#ff2fb4') + '"><span class="ui-neon__t"><slot></slot></span></span>';
  }
}
register('ui-neon-text', UINeonText, neonTextCss);

/* ---------------- Grain 颗粒质感 ---------------- */
const NOISE = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>');
export const grainCss = `
ui-grain{display:block}
.ui-grain{position:relative;isolation:isolate;border-radius:var(--ui-radius-lg);overflow:hidden}
.ui-grain::after{content:"";position:absolute;inset:-50%;pointer-events:none;z-index:2;background:url("${NOISE}");background-size:200px;opacity:var(--gr-o,.18);mix-blend-mode:overlay}
.ui-grain--anim::after{animation:ui-grain 1s steps(6) infinite}
@keyframes ui-grain{0%{transform:translate(0,0)}20%{transform:translate(-8%,6%)}40%{transform:translate(6%,-10%)}60%{transform:translate(-12%,-4%)}80%{transform:translate(10%,8%)}100%{transform:translate(0,0)}}
`;

export class UIGrain extends UIElement {
  static props = { opacity: { default: '0.18' }, animated: { type: 'boolean' } };
  template(p) { return '<div class="ui-grain ui-mo' + (p.animated ? ' ui-grain--anim' : '') + '" style="--gr-o:' + (Number(p.opacity) || 0.18) + '"><slot></slot></div>'; }
}
register('ui-grain', UIGrain, grainCss);

/* ---------------- Mesh Gradient 网格渐变 ---------------- */
export const meshGradientCss = `
ui-mesh-gradient{display:block}
.ui-mesh{position:relative;border-radius:var(--ui-radius-lg);min-height:var(--mh-h,180px);display:flex;align-items:center;justify-content:center;overflow:hidden;
  background-color:var(--m1);
  background-image:radial-gradient(at 12% 18%,var(--m1) 0,transparent 55%),radial-gradient(at 88% 12%,var(--m2) 0,transparent 55%),
    radial-gradient(at 78% 88%,var(--m3) 0,transparent 55%),radial-gradient(at 18% 92%,var(--m4) 0,transparent 55%),radial-gradient(at 50% 50%,var(--m2) 0,transparent 70%);
  background-size:var(--mh-size,100%) var(--mh-size,100%)}
.ui-mesh--anim{--mh-size:180%;animation:ui-mesh 16s ease-in-out infinite alternate}
@keyframes ui-mesh{0%{background-position:0% 0%}50%{background-position:100% 30%}100%{background-position:40% 100%}}
.ui-mesh__c{position:relative;padding:20px;text-align:center}
`;

export class UIMeshGradient extends UIElement {
  static props = { colors: { default: '' }, height: { default: '180' }, animated: { type: 'boolean' } };
  template(p) {
    const c = splitList(p.colors);
    const d = ['#a78bfa', '#f472b6', '#38bdf8', '#fbbf24'];
    return '<div class="ui-mesh ui-mo' + (p.animated ? ' ui-mesh--anim' : '') + '" style="--mh-h:' + (Number(p.height) || 180) + 'px;' + [0, 1, 2, 3].map((i) => '--m' + (i + 1) + ':' + esc(c[i] || d[i])).join(';') + '"><div class="ui-mesh__c"><slot></slot></div></div>';
  }
}
register('ui-mesh-gradient', UIMeshGradient, meshGradientCss);

/* ---------------- Glitch 故障风 ---------------- */
export const glitchCss = SR + `
.ui-gl{position:relative;display:inline-block;font-weight:900}
.ui-gl > span[aria-hidden]{display:inline-block}
.ui-gl__a,.ui-gl__b{position:absolute;left:0;top:0;width:100%;pointer-events:none;opacity:0}
.ui-gl__a{color:#ff2a6d;transform:translate(-2px,0)}
.ui-gl__b{color:#05d9e8;transform:translate(2px,0)}
.ui-gl.is-run .ui-gl__a{opacity:.85;animation:ui-gl-a var(--gl-dur,1.6s) infinite steps(1)}
.ui-gl.is-run .ui-gl__b{opacity:.85;animation:ui-gl-b var(--gl-dur,1.6s) infinite steps(1)}
.ui-gl.is-run .ui-gl__m{animation:ui-gl-m var(--gl-dur,1.6s) infinite steps(1)}
@keyframes ui-gl-a{0%{clip-path:inset(10% 0 70% 0);transform:translate(-3px,-1px)}20%{clip-path:inset(60% 0 15% 0);transform:translate(3px,1px)}40%{clip-path:inset(35% 0 45% 0);transform:translate(-2px,0)}60%{clip-path:inset(80% 0 5% 0);transform:translate(2px,-1px)}80%{clip-path:inset(5% 0 85% 0);transform:translate(-1px,1px)}100%{clip-path:inset(45% 0 40% 0)}}
@keyframes ui-gl-b{0%{clip-path:inset(70% 0 10% 0);transform:translate(3px,1px)}20%{clip-path:inset(15% 0 70% 0);transform:translate(-3px,0)}40%{clip-path:inset(50% 0 30% 0);transform:translate(2px,1px)}60%{clip-path:inset(5% 0 80% 0);transform:translate(-2px,-1px)}80%{clip-path:inset(85% 0 2% 0);transform:translate(1px,0)}100%{clip-path:inset(30% 0 55% 0)}}
@keyframes ui-gl-m{0%,100%{transform:none}42%{transform:skewX(-6deg)}44%{transform:none}86%{transform:translateX(2px)}88%{transform:none}}
`;

export class UIGlitch extends UIElement {
  static props = { text: { default: '' }, trigger: { default: 'loop' }, speed: { default: '1.6' } };
  template(p) {
    const t = esc(p.text);
    return '<span class="ui-gl ui-mo' + (p.trigger === 'loop' ? ' is-run' : '') + '" style="--gl-dur:' + (Number(p.speed) || 1.6) + 's"><span class="ui-sr">' + t + '</span>' +
      '<span class="ui-gl__m" aria-hidden="true">' + t + '</span><span class="ui-gl__a" aria-hidden="true">' + t + '</span><span class="ui-gl__b" aria-hidden="true">' + t + '</span></span>';
  }
  mounted() {
    if (this.props.trigger !== 'hover') return;
    const g = this.querySelector('.ui-gl');
    g.addEventListener('mouseenter', () => { if (!reduced()) g.classList.add('is-run'); });
    g.addEventListener('mouseleave', () => g.classList.remove('is-run'));
  }
}
register('ui-glitch', UIGlitch, glitchCss);

/* ---------------- Holo 镭射卡 ---------------- */
export const holoCss = `
ui-holo{display:block;perspective:800px}
.ui-holo{position:relative;border-radius:16px;overflow:hidden;isolation:isolate;transition:transform .4s var(--ui-ease,ease);
  background:linear-gradient(135deg,#1c1f2b,#2a2f45);color:#fff;box-shadow:0 18px 40px -16px rgba(0,0,0,.55)}
.ui-holo::before{content:"";position:absolute;inset:-40%;z-index:1;pointer-events:none;mix-blend-mode:color-dodge;opacity:.55;
  background:linear-gradient(115deg,transparent 20%,#ff77e9 32%,#7af7ff 42%,#ffe66d 52%,#8aff8a 62%,transparent 74%);
  background-size:220% 220%;background-position:var(--hx,50%) var(--hy,50%);transition:background-position .15s}
.ui-holo::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;opacity:.35;mix-blend-mode:overlay;
  background:repeating-linear-gradient(55deg,rgba(255,255,255,.18) 0 2px,transparent 2px 6px)}
.ui-holo__c{position:relative;z-index:3}
.ui-holo--idle::before{animation:ui-holo 6s ease-in-out infinite alternate}
@keyframes ui-holo{from{background-position:0% 0%}to{background-position:100% 100%}}
`;

export class UIHolo extends UIElement {
  static props = { tilt: { default: '10' } };
  template() { return '<div class="ui-holo ui-mo ui-holo--idle"><div class="ui-holo__c"><slot></slot></div></div>'; }
  mounted() {
    const self = this;
    const h = this.querySelector('.ui-holo');
    h.addEventListener('pointermove', (e) => {
      if (reduced() || e.pointerType === 'touch') return;
      const r = h.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      const m = Number(self.props.tilt) || 10;
      h.classList.remove('ui-holo--idle');
      h.style.setProperty('--hx', (px * 100).toFixed(1) + '%'); h.style.setProperty('--hy', (py * 100).toFixed(1) + '%');
      h.style.transform = 'rotateX(' + ((0.5 - py) * m).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * m).toFixed(2) + 'deg)';
    });
    h.addEventListener('pointerleave', () => { h.style.transform = ''; h.classList.add('ui-holo--idle'); });
  }
}
register('ui-holo', UIHolo, holoCss);

/* ---------------- Wave 波浪 ---------------- */
export const waveCss = `
ui-wave{display:block}
.ui-wave{position:relative;height:var(--wv-h,90px);overflow:hidden;line-height:0;color:var(--wv-c,var(--ui-brand))}
.ui-wave--flip{transform:scaleY(-1)}
.ui-wave svg{position:absolute;bottom:0;left:0;width:200%;height:100%}
.ui-wave svg:nth-child(1){opacity:.25;animation:ui-wave 14s linear infinite}
.ui-wave svg:nth-child(2){opacity:.45;animation:ui-wave 10s linear infinite reverse}
.ui-wave svg:nth-child(3){opacity:1;animation:ui-wave 7s linear infinite}
@keyframes ui-wave{to{transform:translateX(-50%)}}
`;
const WAVE_PATH = (amp, ph) => {
  let d = 'M0 60 ';
  for (let x = 0; x <= 1200; x += 30) d += 'L' + x + ' ' + (60 + Math.sin((x / 600) * Math.PI * 2 + ph) * amp).toFixed(1) + ' ';
  return d + 'L1200 120 L0 120Z';
};

export class UIWave extends UIElement {
  static props = { height: { default: '90' }, color: { default: '' }, flip: { type: 'boolean' }, layers: { default: '3' } };
  template(p) {
    const n = Math.max(1, Math.min(3, Number(p.layers) || 3));
    const amps = [[18, 0], [14, 1.6], [10, 3.2]].slice(3 - n);
    return '<div class="ui-wave ui-mo' + (p.flip ? ' ui-wave--flip' : '') + '" aria-hidden="true" style="--wv-h:' + (Number(p.height) || 90) + 'px' + (p.color ? ';--wv-c:' + esc(p.color) : '') + '">' +
      amps.map((a) => '<svg viewBox="0 0 1200 120" preserveAspectRatio="none"><path fill="currentColor" d="' + WAVE_PATH(a[0], a[1]) + '"/></svg>').join('') + '</div>';
  }
}
register('ui-wave', UIWave, waveCss);

/* ---------------- Starfield 星空 ---------------- */
export const starfieldCss = `
ui-starfield{display:block}
.ui-star{position:relative;overflow:hidden;isolation:isolate;border-radius:var(--ui-radius-lg);min-height:var(--st-h,200px);
  display:flex;align-items:center;justify-content:center;color:#eef2ff;
  background:radial-gradient(ellipse at 50% 120%,#2b2f6b 0%,#121433 45%,#05060f 100%)}
.ui-star i{position:absolute;border-radius:50%;background:#fff;opacity:var(--o);animation:ui-tw var(--t) ease-in-out infinite;animation-delay:var(--dl)}
@keyframes ui-tw{50%{opacity:calc(var(--o) * .2);transform:scale(.6)}}
.ui-star__shoot{position:absolute;top:18%;left:70%;width:110px;height:1.5px;border-radius:2px;opacity:0;
  background:linear-gradient(90deg,#fff,transparent);transform:rotate(-30deg);animation:ui-shoot 6s ease-in infinite 1.5s}
@keyframes ui-shoot{0%{opacity:0;transform:rotate(-30deg) translateX(0)}3%{opacity:1}12%{opacity:0;transform:rotate(-30deg) translateX(-360px)}100%{opacity:0}}
.ui-star__c{position:relative;z-index:1;padding:20px;text-align:center}
`;

export class UIStarfield extends UIElement {
  static props = { count: { default: '90' }, height: { default: '200' }, seed: { default: '3' }, shooting: { default: 'true' } };
  template(p) {
    const r = rng(Number(p.seed) || 3);
    const n = Math.max(10, Math.min(300, Number(p.count) || 90));
    let stars = '';
    for (let i = 0; i < n; i++) {
      const s = r() < 0.85 ? 1 + r() * 1.2 : 2 + r() * 1.5;
      stars += '<i style="left:' + (r() * 100).toFixed(2) + '%;top:' + (r() * 100).toFixed(2) + '%;width:' + s.toFixed(1) + 'px;height:' + s.toFixed(1) + 'px;--o:' + (0.4 + r() * 0.6).toFixed(2) + ';--t:' + (2 + r() * 4).toFixed(1) + 's;--dl:-' + (r() * 5).toFixed(1) + 's"></i>';
    }
    return '<div class="ui-star ui-mo" style="--st-h:' + (Number(p.height) || 200) + 'px"><span aria-hidden="true">' + stars + (p.shooting !== 'false' ? '<span class="ui-star__shoot"></span>' : '') + '</span><div class="ui-star__c"><slot></slot></div></div>';
  }
}
register('ui-starfield', UIStarfield, starfieldCss);

/* ---------------- Grid Beam 光束网格 ---------------- */
export const gridBeamCss = `
ui-grid-beam{display:block}
.ui-gb2{position:relative;overflow:hidden;isolation:isolate;border-radius:var(--ui-radius-lg);min-height:var(--gbm-h,200px);display:flex;align-items:center;justify-content:center;
  background-color:var(--ui-bg);border:var(--ui-border-w) solid var(--ui-line);--gc:color-mix(in srgb,var(--ui-sub) 22%,transparent);
  background-image:linear-gradient(var(--gc) 1px,transparent 1px),linear-gradient(90deg,var(--gc) 1px,transparent 1px);background-size:var(--gs,32px) var(--gs,32px);background-position:-1px -1px}
.ui-gb2::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(ellipse at center,transparent 30%,var(--ui-bg) 85%)}
.ui-gb2 i{position:absolute;z-index:0;pointer-events:none}
.ui-gb2 i.h{height:1px;width:90px;left:-90px;top:calc(var(--row) * var(--gs,32px) - 1px);
  background:linear-gradient(90deg,transparent,var(--ui-brand));animation:ui-beam-h var(--dur) linear infinite var(--dl)}
.ui-gb2 i.v{width:1px;height:90px;top:-90px;left:calc(var(--col) * var(--gs,32px) - 1px);
  background:linear-gradient(180deg,transparent,var(--ui-brand));animation:ui-beam-v var(--dur) linear infinite var(--dl)}
@keyframes ui-beam-h{to{transform:translateX(calc(100cqw + 180px))}}
@keyframes ui-beam-v{to{transform:translateY(calc(100cqh + 180px))}}
.ui-gb2{container-type:size}
.ui-gb2__c{position:relative;z-index:1;padding:20px;text-align:center}
`;

export class UIGridBeam extends UIElement {
  static props = { height: { default: '200' }, size: { default: '32' }, beams: { default: '6' }, seed: { default: '5' } };
  template(p) {
    const r = rng(Number(p.seed) || 5), gs = Number(p.size) || 32, h = Number(p.height) || 200;
    const rows = Math.max(1, Math.floor(h / gs));
    let beams = '';
    for (let i = 0; i < (Number(p.beams) || 6); i++) {
      const horiz = i % 2 === 0;
      beams += horiz
        ? '<i class="h" style="--row:' + (1 + Math.floor(r() * (rows - 1))) + ';--dur:' + (3 + r() * 3).toFixed(1) + 's;--dl:-' + (r() * 5).toFixed(1) + 's"></i>'
        : '<i class="v" style="--col:' + (1 + Math.floor(r() * 18)) + ';--dur:' + (2.5 + r() * 3).toFixed(1) + 's;--dl:-' + (r() * 5).toFixed(1) + 's"></i>';
    }
    return '<div class="ui-gb2 ui-mo" style="--gbm-h:' + h + 'px;--gs:' + gs + 'px;height:' + h + 'px"><span aria-hidden="true">' + beams + '</span><div class="ui-gb2__c"><slot></slot></div></div>';
  }
}
register('ui-grid-beam', UIGridBeam, gridBeamCss);

/* ---------------- Border Beam 边框光点 ---------------- */
export const borderBeamCss = `
@property --ui-bb-a{syntax:"<angle>";inherits:false;initial-value:0deg}
ui-border-beam{display:block}
.ui-bb{position:relative;border-radius:var(--ui-radius-lg);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);isolation:isolate}
.ui-bb::before{content:"";position:absolute;inset:calc(var(--ui-border-w) * -1 - .5px);border-radius:inherit;padding:var(--bb-w,1.5px);pointer-events:none;
  background:conic-gradient(from var(--ui-bb-a),transparent 0deg,transparent calc(360deg - var(--bb-len,70deg)),var(--bb-c2,#ec4899) calc(360deg - var(--bb-len,70deg) / 2),var(--bb-c1,var(--ui-brand)) 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
  animation:ui-bb var(--bb-dur,5s) linear infinite}
@keyframes ui-bb{to{--ui-bb-a:360deg}}
`;

export class UIBorderBeam extends UIElement {
  static props = { speed: { default: '5' }, width: { default: '1.5' }, length: { default: '70' }, colors: { default: '' } };
  template(p) {
    const c = splitList(p.colors);
    return '<div class="ui-bb ui-mo" style="--bb-dur:' + (Number(p.speed) || 5) + 's;--bb-w:' + (Number(p.width) || 1.5) + 'px;--bb-len:' + (Number(p.length) || 70) + 'deg' +
      (c[0] ? ';--bb-c1:' + esc(c[0]) : '') + (c[1] ? ';--bb-c2:' + esc(c[1]) : '') + '"><slot></slot></div>';
  }
}
register('ui-border-beam', UIBorderBeam, borderBeamCss);
