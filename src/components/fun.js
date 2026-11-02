/* =========================================================
   趣味组件（第一批 15 个）
   ui-scratch 刮刮卡 / ui-lucky-wheel 大转盘 / ui-slot-machine 老虎机
   ui-dice 骰子 / ui-flip-clock 翻页时钟 / ui-pull-lamp 拉绳台灯
   ui-coin-flip 抛硬币 / ui-memory-game 翻牌配对 / ui-piano 迷你钢琴
   ui-gift-box 礼盒 / ui-music-player 播放器 / ui-weather 天气卡
   ui-battery 电池 / ui-sticky-notes 便利贴墙 / ui-joystick 摇杆
   ========================================================= */
import { UIElement, register } from './base.js';
import { esc, splitList } from './more-form.js';
import { reduced } from '../lib/motion.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
const celebrate = (from) => { if (typeof window !== 'undefined' && window.uiConfetti) window.uiConfetti({ from: from, count: 90 }); };
const later = (fn, ms) => (reduced() ? fn() : setTimeout(fn, ms));
function parseJSON(text, fallback) { try { const v = JSON.parse(text); return Array.isArray(v) && v.length ? v : fallback; } catch (e) { return fallback; } }
let uid = 0;

/* ---------------- Scratch 刮刮卡 ---------------- */
export const scratchCss = `
ui-scratch{display:block;width:100%;max-width:340px}
.ui-scx{position:relative;height:var(--scr-h,140px);border-radius:var(--ui-radius-lg);overflow:hidden;user-select:none;-webkit-user-select:none;
  border:var(--ui-border-w) solid var(--ui-line);background:var(--ui-panel);box-shadow:var(--ui-shadow-sm)}
.ui-scx__prize{position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:4px;text-align:center;padding:12px;color:var(--ui-text)}
.ui-scx canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab;transition:opacity .6s var(--ui-ease)}
.ui-scx[data-done] canvas{opacity:0;pointer-events:none}
.ui-scx__skip{position:absolute;right:8px;bottom:8px;z-index:2}
.ui-scx[data-done] .ui-scx__skip{display:none}
`;
export class UIScratch extends UIElement {
  static props = { cover: { default: '刮开涂层' }, height: { default: '140' }, threshold: { default: '0.5' }, brush: { default: '24' } };
  template(p) {
    return '<div class="ui-scx ui-mo" style="--scr-h:' + (Number(p.height) || 140) + 'px"><div class="ui-scx__prize" aria-hidden="true"><slot></slot></div>' +
      '<canvas aria-hidden="true"></canvas><button type="button" class="ui-btn ui-btn--sm ui-scx__skip">直接揭开</button><span class="ui-sr" aria-live="polite"></span></div>';
  }
  mounted(p) {
    const self = this, box = this.querySelector('.ui-scx'), cv = box.querySelector('canvas'), ctx = cv.getContext('2d');
    const prize = box.querySelector('.ui-scx__prize'), live = box.querySelector('.ui-sr');
    const brush = Number(p.brush) || 24, thr = Math.min(0.95, Math.max(0.1, Number(p.threshold) || 0.5));
    let painted = false, down = false, last = null, moves = 0;
    this._done = false;
    const paint = function () {
      const r = box.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const d = window.devicePixelRatio || 1;
      cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, '#aeb4bf'); g.addColorStop(0.45, '#e6e9ee'); g.addColorStop(0.55, '#d5d9e0'); g.addColorStop(1, '#9ea5b1');
      ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      for (let i = 0; i < 70; i++) ctx.fillRect((i * 97.3) % r.width, (i * 53.7) % r.height, 2, 2);
      ctx.fillStyle = '#3d434e'; ctx.font = '600 15px system-ui,-apple-system,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✦ ' + p.cover + ' ✦', r.width / 2, r.height / 2);
      return true;
    };
    const reveal = function () {
      if (self._done) return;
      self._done = true; box.dataset.done = '';
      prize.removeAttribute('aria-hidden');
      live.textContent = '已揭开：' + prize.textContent.trim();
      emit(self, 'reveal', { text: prize.textContent.trim() });
    };
    const check = function () {
      if (self._done || !cv.width) return;
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, tot = 0;
      for (let i = 3; i < d.length; i += 64) { tot++; if (d[i] < 10) clear++; }
      if (tot && clear / tot >= thr) reveal();
    };
    const pos = function (e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const stroke = function (a, b) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = brush;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    };
    cv.addEventListener('pointerdown', function (e) {
      if (!painted) return;
      down = true; cv.setPointerCapture(e.pointerId); last = pos(e); stroke(last, [last[0] + 0.1, last[1]]);
    });
    cv.addEventListener('pointermove', function (e) {
      if (!down) return;
      const q = pos(e); stroke(last, q); last = q;
      if (++moves % 10 === 0) check();
    });
    const up = function () { if (down) { down = false; check(); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    box.querySelector('.ui-scx__skip').addEventListener('click', reveal);
    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver(function () { if (!painted && paint()) { painted = true; self._ro.disconnect(); } });
    this._ro.observe(box);
    this.reset = function () { self._done = false; delete box.dataset.done; prize.setAttribute('aria-hidden', 'true'); live.textContent = ''; painted = paint(); };
  }
  disconnectedCallback() { if (this._ro) this._ro.disconnect(); }
}
register('ui-scratch', UIScratch, scratchCss);

/* ---------------- Lucky Wheel 幸运大转盘 ---------------- */
export const luckyWheelCss = `
ui-lucky-wheel{display:inline-block}
.ui-wheel{display:flex;flex-direction:column;align-items:center;gap:10px}
.ui-wheel__box{position:relative;width:var(--wh,240px);max-width:100%;aspect-ratio:1}
.ui-wheel__box::before{content:"";position:absolute;left:50%;top:-6px;z-index:2;transform:translateX(-50%);
  border:11px solid transparent;border-top:20px solid var(--ui-danger);filter:drop-shadow(0 2px 2px rgba(0,0,0,.25))}
.ui-wheel__disc{width:100%;height:100%;border-radius:50%;box-shadow:0 0 0 6px var(--ui-panel),0 0 0 8px var(--ui-line),var(--ui-shadow);
  transition:transform 4.4s cubic-bezier(.15,.7,.1,1)}
.ui-wheel__disc svg{display:block;width:100%;height:100%}
.ui-wheel__go{position:absolute;left:50%;top:50%;width:25%;aspect-ratio:1;transform:translate(-50%,-50%);z-index:2;border-radius:50%;
  border:4px solid var(--ui-panel);background:var(--ui-brand);color:var(--ui-brand-ink);font:inherit;font-weight:800;font-size:14px;cursor:pointer;
  box-shadow:var(--ui-shadow);transition:transform .15s var(--ui-ease)}
.ui-wheel__go:hover{transform:translate(-50%,-50%) scale(1.06)}
.ui-wheel__go:disabled{cursor:progress}
.ui-wheel__go:focus-visible{outline:3px solid var(--ui-ring);outline-offset:2px}
.ui-wheel__res{margin:0;min-height:1.5em;font-size:14px;font-weight:700;color:var(--ui-text)}
`;
export class UILuckyWheel extends UIElement {
  static props = { prizes: { default: '一等奖,谢谢参与,优惠券,再来一次,二等奖,谢谢参与,积分×100,三等奖' }, size: { default: '240' } };
  template(p) {
    const list = splitList(p.prizes).slice(0, 12);
    const n = list.length || 1, a = 360 / n;
    const pt = (t) => { const r = t * Math.PI / 180; return (50 + 50 * Math.sin(r)).toFixed(3) + ' ' + (50 - 50 * Math.cos(r)).toFixed(3); };
    const fills = n % 2 ? ['var(--ui-brand)', 'color-mix(in srgb,var(--ui-brand) 14%,var(--ui-panel))', 'color-mix(in srgb,var(--ui-warn) 24%,var(--ui-panel))']
      : ['var(--ui-brand)', 'color-mix(in srgb,var(--ui-brand) 14%,var(--ui-panel))'];
    let svg = '';
    list.forEach(function (t, i) {
      const k = i % fills.length;
      svg += '<path d="M50 50 L' + pt(i * a - a / 2) + ' A50 50 0 ' + (a > 180 ? 1 : 0) + ' 1 ' + pt(i * a + a / 2) + ' Z" style="fill:' + fills[k] + '"/>' +
        '<text x="50" y="16" transform="rotate(' + (i * a) + ' 50 50)" text-anchor="middle" font-size="' + (n > 8 ? 5 : 6) + '" font-weight="700" style="fill:' + (k === 0 ? 'var(--ui-brand-ink)' : 'var(--ui-text)') + '">' + esc(t.slice(0, 6)) + '</text>';
    });
    return '<div class="ui-wheel"><div class="ui-wheel__box" style="--wh:' + (Number(p.size) || 240) + 'px"><div class="ui-wheel__disc ui-mo">' +
      '<svg viewBox="0 0 100 100" role="img" aria-label="转盘奖项：' + esc(list.join('、')) + '">' + svg + '</svg></div>' +
      '<button type="button" class="ui-wheel__go">抽奖</button></div><p class="ui-wheel__res" aria-live="polite"></p></div>';
  }
  mounted(p) {
    const self = this, list = splitList(p.prizes).slice(0, 12), n = list.length || 1, a = 360 / n;
    const disc = this.querySelector('.ui-wheel__disc'), go = this.querySelector('.ui-wheel__go'), res = this.querySelector('.ui-wheel__res');
    this._rot = this._rot || 0;
    disc.style.transition = 'none'; disc.style.transform = 'rotate(' + this._rot + 'deg)'; disc.offsetWidth; disc.style.transition = '';
    this.spin = function (index) {
      if (go.disabled) return;
      const k = index == null ? Math.floor(Math.random() * n) : Math.max(0, Math.min(n - 1, Number(index)));
      const j = (Math.random() - 0.5) * a * 0.6;
      const target = ((-(k * a + j)) % 360 + 360) % 360;
      self._rot = self._rot - (self._rot % 360) + 360 * 6 + target;
      go.disabled = true; res.textContent = '转动中…';
      disc.style.transform = 'rotate(' + self._rot + 'deg)';
      later(function () {
        go.disabled = false; res.textContent = '🎉 结果：' + list[k];
        emit(self, 'result', { index: k, prize: list[k] });
      }, 4500);
    };
    go.addEventListener('click', function () { self.spin(); });
  }
}
register('ui-lucky-wheel', UILuckyWheel, luckyWheelCss);

/* ---------------- Slot Machine 老虎机 ---------------- */
export const slotMachineCss = `
ui-slot-machine{display:block;width:100%;max-width:300px}
.ui-slot{display:flex;flex-direction:column;align-items:stretch;gap:10px}
.ui-slot__win{display:flex;gap:8px;padding:10px;border-radius:var(--ui-radius-lg);
  background:linear-gradient(160deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 55%,#000));box-shadow:var(--ui-shadow)}
.ui-slot__reel{position:relative;flex:1;height:64px;overflow:hidden;border-radius:var(--ui-radius-sm);background:var(--ui-panel)}
.ui-slot__reel::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(rgba(0,0,0,.22),transparent 28%,transparent 72%,rgba(0,0,0,.22))}
.ui-slot__strip{will-change:transform}
.ui-slot__strip span{display:block;height:64px;line-height:64px;text-align:center;font-size:34px}
.ui-slot__win[data-win]{animation:ui-slot-win .5s 3 var(--ui-ease)}
@keyframes ui-slot-win{50%{box-shadow:0 0 0 4px var(--ui-warn),0 0 26px var(--ui-warn)}}
.ui-slot__ft{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.ui-slot__msg{font-size:13px;color:var(--ui-sub)}
.ui-slot__msg b{color:var(--ui-text)}
`;
export class UISlotMachine extends UIElement {
  static props = { symbols: { default: '🍒,🍋,🔔,⭐,💎,🍀' }, reels: { default: '3' }, luck: { default: '0.25' } };
  template(p) {
    const sy = splitList(p.symbols), n = Math.max(2, Math.min(5, Number(p.reels) || 3));
    this._cur = this._cur && this._cur.length === n ? this._cur : Array.from({ length: n }, (_, i) => sy[(i * 2) % sy.length]);
    return '<div class="ui-slot ui-mo"><div class="ui-slot__win" role="img" aria-label="老虎机：' + esc(this._cur.join(' ')) + '">' +
      this._cur.map((s) => '<div class="ui-slot__reel"><div class="ui-slot__strip"><span>' + esc(s) + '</span></div></div>').join('') + '</div>' +
      '<div class="ui-slot__ft"><span class="ui-slot__msg" aria-live="polite">三个相同即中奖</span><button type="button" class="ui-btn ui-btn--primary ui-btn--sm">🎰 拉一下</button></div></div>';
  }
  mounted(p) {
    const self = this, sy = splitList(p.symbols), H = 64;
    const win = this.querySelector('.ui-slot__win'), msg = this.querySelector('.ui-slot__msg'), btn = this.querySelector('button');
    const strips = Array.from(this.querySelectorAll('.ui-slot__strip'));
    const pick = () => sy[Math.floor(Math.random() * sy.length)];
    this.spin = function () {
      if (btn.disabled) return;
      btn.disabled = true; delete win.dataset.win; msg.textContent = '转动中…';
      const lucky = Math.random() < (Number(p.luck) || 0);
      const same = pick();
      const fin = strips.map(() => (lucky ? same : pick()));
      let longest = 0;
      strips.forEach(function (st, i) {
        const seq = [self._cur[i]];
        for (let k = 0; k < 14 + i * 6; k++) seq.push(pick());
        seq.push(fin[i]);
        const dur = 1.1 + i * 0.45;
        longest = Math.max(longest, dur);
        st.style.transition = 'none'; st.style.transform = 'translateY(0)';
        st.innerHTML = seq.map((s) => '<span>' + esc(s) + '</span>').join('');
        st.offsetHeight;
        st.style.transition = 'transform ' + dur + 's cubic-bezier(.2,.75,.3,1.06)';
        st.style.transform = 'translateY(' + (-(seq.length - 1) * H) + 'px)';
      });
      later(function () {
        self._cur = fin;
        strips.forEach(function (st, i) { st.style.transition = 'none'; st.style.transform = 'none'; st.innerHTML = '<span>' + esc(fin[i]) + '</span>'; });
        const won = fin.every((s) => s === fin[0]);
        win.setAttribute('aria-label', '老虎机：' + fin.join(' '));
        msg.innerHTML = won ? '<b>🎉 中奖！' + esc(fin.join('')) + '</b>' : '差一点：' + esc(fin.join(' '));
        if (won) { win.dataset.win = ''; celebrate(win); }
        btn.disabled = false;
        emit(self, 'result', { symbols: fin, win: won });
      }, longest * 1000 + 80);
    };
    btn.addEventListener('click', function () { self.spin(); });
  }
}
register('ui-slot-machine', UISlotMachine, slotMachineCss);

/* ---------------- Dice 3D 骰子 ---------------- */
const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
const FACE_T = { 1: 'rotateY(0deg)', 2: 'rotateY(90deg)', 3: 'rotateX(90deg)', 4: 'rotateX(-90deg)', 5: 'rotateY(-90deg)', 6: 'rotateY(180deg)' };
const SHOW = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };
export const diceCss = `
ui-dice{display:inline-block}
.ui-dice{display:flex;flex-direction:column;align-items:center;gap:12px}
.ui-dice__row{display:flex;gap:calc(var(--ds,64px) * .5);padding:8px;perspective:600px}
.ui-dice__cube{position:relative;width:var(--ds,64px);height:var(--ds,64px);transform-style:preserve-3d;
  transition:transform 1.2s cubic-bezier(.3,1.25,.5,1)}
.ui-dice__f{position:absolute;inset:0;display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);padding:14%;
  background:var(--ui-panel);border:1px solid var(--ui-line);border-radius:18%;
  box-shadow:inset 0 0 calc(var(--ds,64px) * .18) color-mix(in srgb,var(--ui-text) 12%,transparent);backface-visibility:hidden}
.ui-dice__f i{display:block;margin:auto;width:72%;aspect-ratio:1;border-radius:50%;background:var(--ui-text);visibility:hidden}
.ui-dice__f i.on{visibility:visible}
.ui-dice__f[data-v="1"] i.on{background:#e23b3b;width:96%}
.ui-dice__ft{display:flex;align-items:center;gap:12px;font-size:13px;color:var(--ui-sub)}
.ui-dice__ft b{font-size:18px;color:var(--ui-text);font-variant-numeric:tabular-nums}
`;
export class UIDice extends UIElement {
  static props = { count: { default: '2' }, size: { default: '64' }, value: { default: '' } };
  template(p) {
    const n = Math.max(1, Math.min(6, Number(p.count) || 2)), s = Math.max(32, Number(p.size) || 64);
    const init = splitList(p.value).map(Number);
    this._v = Array.from({ length: n }, (_, i) => (init[i] >= 1 && init[i] <= 6 ? init[i] : [3, 5, 2, 6, 1, 4][i]));
    this._turn = this._v.map(() => [0, 0]);
    const face = (v) => '<div class="ui-dice__f" data-v="' + v + '" style="transform:' + FACE_T[v] + ' translateZ(' + s / 2 + 'px)">' +
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => '<i' + (PIPS[v].indexOf(k) >= 0 ? ' class="on"' : '') + '></i>').join('') + '</div>';
    const cubes = this._v.map((v) => '<div class="ui-dice__cube" style="transform:rotateX(' + SHOW[v][0] + 'deg) rotateY(' + SHOW[v][1] + 'deg)">' + [1, 2, 3, 4, 5, 6].map(face).join('') + '</div>').join('');
    return '<div class="ui-dice ui-mo" style="--ds:' + s + 'px"><div class="ui-dice__row" role="img" aria-label="骰子：' + this._v.join('、') + '">' + cubes + '</div>' +
      '<div class="ui-dice__ft"><button type="button" class="ui-btn ui-btn--sm ui-btn--primary">🎲 掷骰子</button><span aria-live="polite">合计 <b>' + this._v.reduce((a, b) => a + b, 0) + '</b></span></div></div>';
  }
  mounted() {
    const self = this, row = this.querySelector('.ui-dice__row'), cubes = Array.from(this.querySelectorAll('.ui-dice__cube'));
    const btn = this.querySelector('button'), sum = this.querySelector('.ui-dice__ft b');
    this.roll = function () {
      if (btn.disabled) return;
      btn.disabled = true;
      self._v = self._v.map(() => 1 + Math.floor(Math.random() * 6));
      cubes.forEach(function (c, i) {
        const t = self._turn[i];
        t[0] += 2 + Math.floor(Math.random() * 2); t[1] += 2 + Math.floor(Math.random() * 2);
        const v = self._v[i];
        c.style.transitionDelay = (i * 0.08) + 's';
        c.style.transform = 'rotateX(' + (SHOW[v][0] + t[0] * 360) + 'deg) rotateY(' + (SHOW[v][1] + t[1] * 360) + 'deg)';
      });
      later(function () {
        const total = self._v.reduce((a, b) => a + b, 0);
        sum.textContent = total; row.setAttribute('aria-label', '骰子：' + self._v.join('、'));
        btn.disabled = false;
        emit(self, 'roll', { values: self._v.slice(), total: total });
      }, 1300 + cubes.length * 80);
    };
    btn.addEventListener('click', function () { self.roll(); });
  }
}
register('ui-dice', UIDice, diceCss);

/* ---------------- Flip Clock 翻页时钟 ---------------- */
export const flipClockCss = `
ui-flip-clock{display:inline-block}
.ui-fc{display:inline-flex;align-items:center;gap:5px;font:700 var(--fz,40px)/1 var(--ui-mono);font-variant-numeric:tabular-nums}
.ui-fc__g{display:inline-flex;gap:4px}
.ui-fc__sep{color:var(--ui-sub);padding:0 2px;animation:ui-fc-blink 1s steps(1) infinite}
@keyframes ui-fc-blink{50%{opacity:.25}}
.ui-fc__d{position:relative;width:.8em;height:1.25em;perspective:4em;border-radius:.14em;box-shadow:var(--ui-shadow-sm)}
.ui-fc__d > span{position:absolute;left:0;right:0;height:50%;overflow:hidden;background:var(--ui-text);color:var(--ui-bg)}
.ui-fc__d > span b{position:absolute;left:0;right:0;height:200%;display:grid;place-items:center}
.ui-fc__d .u,.ui-fc__d .fu{top:0;border-radius:.14em .14em 0 0;transform-origin:50% 100%}
.ui-fc__d .l,.ui-fc__d .fl{bottom:0;border-radius:0 0 .14em .14em;transform-origin:50% 0}
.ui-fc__d .u b,.ui-fc__d .fu b{top:0}
.ui-fc__d .l b,.ui-fc__d .fl b{bottom:0}
.ui-fc__d::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;z-index:3;background:color-mix(in srgb,var(--ui-bg) 70%,transparent)}
.ui-fc__d .fu{z-index:2;animation:ui-fc-top .28s ease-in forwards;filter:brightness(1)}
.ui-fc__d .fl{z-index:2;transform:rotateX(90deg);animation:ui-fc-bot .28s .28s ease-out forwards}
@keyframes ui-fc-top{to{transform:rotateX(-90deg);filter:brightness(.6)}}
@keyframes ui-fc-bot{from{transform:rotateX(90deg)}to{transform:rotateX(0)}}
.ui-fc__lb{display:block;margin-top:6px;font-size:12px;color:var(--ui-sub);text-align:center;font-family:var(--ui-font);font-weight:400}
`;
export class UIFlipClock extends UIElement {
  static props = { seconds: { default: 'true' }, countdown: { default: '' }, size: { default: '40' }, label: { default: '' } };
  _digits() {
    const pad = (n) => String(n).padStart(2, '0');
    if (this._cd != null) {
      const s = Math.max(0, this._cd);
      return [pad(Math.floor(s / 3600)), pad(Math.floor(s / 60) % 60), pad(s % 60)];
    }
    const d = new Date();
    const g = [pad(d.getHours()), pad(d.getMinutes())];
    if (this._p.seconds !== 'false') g.push(pad(d.getSeconds()));
    return g;
  }
  template(p) {
    this._cd = p.countdown !== '' && !isNaN(Number(p.countdown)) ? Math.floor(Number(p.countdown)) : null;
    const g = this._digits();
    const digit = (c) => '<span class="ui-fc__d"><span class="u"><b>' + c + '</b></span><span class="l"><b>' + c + '</b></span></span>';
    return '<div style="display:inline-block"><div class="ui-fc ui-mo" role="timer" style="--fz:' + (Number(p.size) || 40) + 'px">' +
      g.map((x) => '<span class="ui-fc__g" aria-hidden="true">' + digit(x[0]) + digit(x[1]) + '</span>').join('<span class="ui-fc__sep" aria-hidden="true">:</span>') +
      '<span class="ui-sr"></span></div>' + (p.label ? '<span class="ui-fc__lb">' + esc(p.label) + '</span>' : '') + '</div>';
  }
  mounted() {
    const self = this, cells = Array.from(this.querySelectorAll('.ui-fc__d')), sr = this.querySelector('.ui-fc .ui-sr');
    const say = (g) => { sr.textContent = (self._cd != null ? '剩余 ' : '') + g.join(':'); };
    let prev = this._digits().join('');
    say(this._digits());
    const flip = function (cell, from, to) {
      const u = cell.querySelector('.u b'), l = cell.querySelector('.l b');
      cell.querySelectorAll('.fu,.fl').forEach((x) => x.remove());
      if (reduced()) { u.textContent = to; l.textContent = to; return; }
      u.textContent = to;
      cell.insertAdjacentHTML('beforeend', '<span class="fu"><b>' + from + '</b></span><span class="fl"><b>' + to + '</b></span>');
      setTimeout(function () { l.textContent = to; cell.querySelectorAll('.fu,.fl').forEach((x) => x.remove()); }, 580);
    };
    clearInterval(this._t);
    this._t = setInterval(function () {
      if (self._cd != null) {
        if (self._cd <= 0) { clearInterval(self._t); return; }
        self._cd--;
        if (self._cd === 0) emit(self, 'done', {});
      }
      const g = self._digits(), now = g.join('');
      if (now.length !== prev.length) { self._lastTpl = null; self._render(); return; }
      for (let i = 0; i < now.length; i++) if (now[i] !== prev[i] && cells[i]) flip(cells[i], prev[i], now[i]);
      prev = now; say(g);
    }, 1000);
  }
  disconnectedCallback() { clearInterval(this._t); }
}
register('ui-flip-clock', UIFlipClock, flipClockCss);

/* ---------------- Pull Lamp 拉绳台灯（开关） ---------------- */
export const pullLampCss = `
ui-pull-lamp{display:inline-block}
.ui-lamp{position:relative;width:var(--lw,220px);height:200px;max-width:100%;overflow:hidden;border-radius:var(--ui-radius-lg);
  background:#1c2030;color:#c7cbd6;transition:background .45s var(--ui-ease),color .45s;box-shadow:var(--ui-shadow-sm)}
.ui-lamp[data-on]{background:#fff6dc;color:#4a3a12}
.ui-lamp__wire{position:absolute;left:50%;top:0;width:2px;height:28px;margin-left:-1px;background:#6b7280}
.ui-lamp__shade{position:absolute;left:50%;top:28px;width:92px;height:44px;transform:translateX(-50%);z-index:2;
  background:linear-gradient(90deg,color-mix(in srgb,var(--ui-brand) 75%,#000),var(--ui-brand) 40%,color-mix(in srgb,var(--ui-brand) 80%,#000));
  clip-path:polygon(28% 0,72% 0,100% 100%,0 100%)}
.ui-lamp__bulb{position:absolute;left:50%;top:62px;width:26px;height:26px;margin-left:-13px;border-radius:50%;background:#9ca3af;transition:background .3s,box-shadow .3s}
.ui-lamp[data-on] .ui-lamp__bulb{background:#fde68a;box-shadow:0 0 18px 8px rgba(253,224,71,.7)}
.ui-lamp__cone{position:absolute;left:50%;top:70px;width:240px;height:150px;transform:translateX(-50%);opacity:0;transition:opacity .45s;
  background:linear-gradient(rgba(253,224,71,.5),rgba(253,224,71,0));clip-path:polygon(38% 0,62% 0,100% 100%,0 100%)}
.ui-lamp[data-on] .ui-lamp__cone{opacity:1}
.ui-lamp__cord{position:absolute;left:calc(50% + 30px);top:58px;z-index:3;width:28px;padding:0;border:0;background:none;cursor:grab;touch-action:none;
  display:flex;flex-direction:column;align-items:center;height:calc(var(--pull,44px) + 16px)}
.ui-lamp__cord:focus-visible{outline:2px solid var(--ui-ring);outline-offset:2px;border-radius:6px}
.ui-lamp__cord i{display:block;width:2px;flex:1;background:#9ca3af}
.ui-lamp__cord b{display:block;width:12px;height:16px;border-radius:6px 6px 8px 8px;background:#e5b84b;box-shadow:inset 0 -3px 0 rgba(0,0,0,.2)}
.ui-lamp__cord.back{transition:height .5s var(--ui-spring)}
.ui-lamp__tx{position:absolute;left:0;right:0;bottom:12px;text-align:center;font-size:13px;font-weight:600}
`;
export class UIPullLamp extends UIElement {
  static props = { on: { type: 'boolean' }, label: { default: '台灯' }, width: { default: '220' } };
  template(p) {
    this._on = p.on;
    return '<div class="ui-lamp ui-mo"' + (p.on ? ' data-on' : '') + ' style="--lw:' + (Number(p.width) || 220) + 'px"><span class="ui-lamp__cone" aria-hidden="true"></span><span class="ui-lamp__wire" aria-hidden="true"></span>' +
      '<span class="ui-lamp__shade" aria-hidden="true"></span><span class="ui-lamp__bulb" aria-hidden="true"></span>' +
      '<button type="button" class="ui-lamp__cord" role="switch" aria-checked="' + p.on + '" aria-label="' + esc(p.label) + '开关（拉一下绳子）"><i></i><b></b></button>' +
      '<span class="ui-lamp__tx" aria-hidden="true">' + (p.on ? '开灯啦 ☀' : '拉一下绳子') + '</span></div>';
  }
  mounted(p) {
    const self = this, box = this.querySelector('.ui-lamp'), cord = box.querySelector('.ui-lamp__cord'), tx = box.querySelector('.ui-lamp__tx');
    const set = function (v) {
      self._on = v;
      if (v) box.dataset.on = ''; else delete box.dataset.on;
      cord.setAttribute('aria-checked', String(v)); tx.textContent = v ? '开灯啦 ☀' : '关灯了 🌙';
      emit(self, 'change', { on: v });
    };
    const spring = function (d) { cord.classList.remove('back'); cord.style.setProperty('--pull', (44 + d) + 'px'); };
    const release = function () { cord.offsetHeight; cord.classList.add('back'); cord.style.setProperty('--pull', '44px'); };
    let sy = 0, d = 0, on = false, moved = false;
    cord.addEventListener('pointerdown', function (e) { on = true; moved = false; sy = e.clientY; d = 0; cord.setPointerCapture(e.pointerId); });
    cord.addEventListener('pointermove', function (e) { if (!on) return; d = Math.max(0, Math.min(40, e.clientY - sy)); if (d > 3) moved = true; spring(d); });
    const up = function () { if (!on) return; on = false; if (d > 22) set(!self._on); release(); };
    cord.addEventListener('pointerup', up); cord.addEventListener('pointercancel', up);
    cord.addEventListener('click', function () {
      if (moved) { moved = false; return; }
      spring(28); later(function () { set(!self._on); release(); }, 120);
    });
    Object.defineProperty(this, 'on', { configurable: true, get: () => self._on, set: (v) => set(!!v) });
  }
}
register('ui-pull-lamp', UIPullLamp, pullLampCss);

/* ---------------- Coin Flip 抛硬币 ---------------- */
export const coinFlipCss = `
ui-coin-flip{display:inline-block}
.ui-coin{display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:30px}
.ui-coin__toss{perspective:600px}
.ui-coin__toss.up{animation:ui-coin-toss 1.4s cubic-bezier(.3,.6,.4,1)}
@keyframes ui-coin-toss{0%{transform:translateY(0)}45%{transform:translateY(-70px) scale(1.12)}100%{transform:translateY(0)}}
.ui-coin__c{position:relative;width:var(--cz,92px);height:var(--cz,92px);transform-style:preserve-3d;transition:transform 1.4s cubic-bezier(.25,.8,.35,1)}
.ui-coin__f{position:absolute;inset:0;display:grid;place-items:center;border-radius:50%;backface-visibility:hidden;
  font-size:calc(var(--cz,92px) * .42);font-weight:900;color:#713f12;
  background:radial-gradient(circle at 35% 30%,#fef3c7,#fcd34d 45%,#d99a0b);
  box-shadow:inset 0 0 0 5px #e7a913,inset 0 0 0 8px #fde68a,0 6px 14px -6px rgba(0,0,0,.45)}
.ui-coin__f.t{transform:rotateX(180deg)}
.ui-coin__ft{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px;font-size:13px;color:var(--ui-sub)}
.ui-coin__ft b{color:var(--ui-text);font-variant-numeric:tabular-nums}
`;
export class UICoinFlip extends UIElement {
  static props = { heads: { default: '正' }, tails: { default: '反' }, size: { default: '92' } };
  template(p) {
    return '<div class="ui-coin ui-mo"><div class="ui-coin__toss"><div class="ui-coin__c" role="img" aria-label="硬币：' + esc(p.heads) + '面朝上" style="--cz:' + (Number(p.size) || 92) + 'px">' +
      '<span class="ui-coin__f h" aria-hidden="true">' + esc(p.heads) + '</span><span class="ui-coin__f t" aria-hidden="true">' + esc(p.tails) + '</span></div></div>' +
      '<div class="ui-coin__ft"><button type="button" class="ui-btn ui-btn--sm ui-btn--primary">🪙 抛硬币</button><span aria-live="polite">' + esc(p.heads) + ' <b class="hn">0</b> · ' + esc(p.tails) + ' <b class="tn">0</b></span></div></div>';
  }
  mounted(p) {
    const self = this, toss = this.querySelector('.ui-coin__toss'), coin = this.querySelector('.ui-coin__c'), btn = this.querySelector('button');
    const hn = this.querySelector('.hn'), tn = this.querySelector('.tn');
    let turns = 0, h = 0, t = 0;
    this.flip = function () {
      if (btn.disabled) return;
      btn.disabled = true;
      const heads = Math.random() < 0.5;
      turns += 5 + Math.floor(Math.random() * 3);
      coin.style.transform = 'rotateX(' + (turns * 360 + (heads ? 0 : 180)) + 'deg)';
      toss.classList.remove('up'); toss.offsetWidth; toss.classList.add('up');
      later(function () {
        if (heads) h++; else t++;
        hn.textContent = h; tn.textContent = t;
        coin.setAttribute('aria-label', '硬币：' + (heads ? p.heads : p.tails) + '面朝上');
        btn.disabled = false;
        emit(self, 'flip', { result: heads ? 'heads' : 'tails', label: heads ? p.heads : p.tails, heads: h, tails: t });
      }, 1450);
    };
    btn.addEventListener('click', function () { self.flip(); });
  }
}
register('ui-coin-flip', UICoinFlip, coinFlipCss);

/* ---------------- Memory Game 翻牌配对 ---------------- */
export const memoryGameCss = `
ui-memory-game{display:block;width:100%;max-width:340px}
.ui-mem{display:flex;flex-direction:column;gap:10px}
.ui-mem__hd{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;color:var(--ui-sub)}
.ui-mem__hd b{color:var(--ui-text);font-variant-numeric:tabular-nums}
.ui-mem__grid{display:grid;grid-template-columns:repeat(var(--cols,4),1fr);gap:8px}
.ui-mem__c{aspect-ratio:1;padding:0;border:0;background:none;cursor:pointer;perspective:500px;border-radius:var(--ui-radius)}
.ui-mem__c:focus-visible{outline:3px solid var(--ui-ring);outline-offset:2px}
.ui-mem__in{position:relative;display:block;width:100%;height:100%;transform-style:preserve-3d;transition:transform .45s var(--ui-ease)}
.ui-mem__c.on .ui-mem__in,.ui-mem__c.ok .ui-mem__in{transform:rotateY(180deg)}
.ui-mem__in > span{position:absolute;inset:0;display:grid;place-items:center;border-radius:var(--ui-radius);backface-visibility:hidden}
.ui-mem__bk{background:linear-gradient(135deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 50%,#8f5cff));color:var(--ui-brand-ink);font-size:20px;font-weight:800}
.ui-mem__fr{transform:rotateY(180deg);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);font-size:clamp(22px,7cqw,34px)}
.ui-mem{container-type:inline-size}
.ui-mem__c.ok .ui-mem__fr{background:var(--ui-ok-soft);border-color:var(--ui-ok)}
.ui-mem__c.ok{cursor:default;animation:ui-mem-ok .4s var(--ui-spring)}
@keyframes ui-mem-ok{50%{transform:scale(1.08)}}
.ui-mem__msg{min-height:1.4em;margin:0;font-size:13px;font-weight:600;color:var(--ui-text);text-align:center}
`;
export class UIMemoryGame extends UIElement {
  static props = { symbols: { default: '🐶,🐱,🦊,🐼,🐸,🐵' }, cols: { default: '4' } };
  template(p) {
    const sy = splitList(p.symbols).slice(0, 10);
    return '<div class="ui-mem ui-mo"><div class="ui-mem__hd"><span>步数 <b class="mv">0</b> · 配对 <b class="pr">0</b>/' + sy.length + '</span>' +
      '<button type="button" class="ui-btn ui-btn--sm ui-btn--text">重新开始</button></div>' +
      '<div class="ui-mem__grid" style="--cols:' + (Number(p.cols) || 4) + '"></div><p class="ui-mem__msg" aria-live="polite"></p></div>';
  }
  mounted(p) {
    const self = this, sy = splitList(p.symbols).slice(0, 10);
    const grid = this.querySelector('.ui-mem__grid'), mv = this.querySelector('.mv'), pr = this.querySelector('.pr'), msg = this.querySelector('.ui-mem__msg');
    let first = null, lock = false, moves = 0, pairs = 0, t0 = 0;
    const deal = function () {
      const deck = sy.concat(sy).map((s) => [Math.random(), s]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
      first = null; lock = false; moves = 0; pairs = 0; t0 = 0; mv.textContent = 0; pr.textContent = 0; msg.textContent = '';
      grid.innerHTML = deck.map((s, i) => '<button type="button" class="ui-mem__c" data-s="' + esc(s) + '" aria-label="第 ' + (i + 1) + ' 张，背面"><span class="ui-mem__in" aria-hidden="true">' +
        '<span class="ui-mem__bk">?</span><span class="ui-mem__fr">' + esc(s) + '</span></span></button>').join('');
    };
    const face = (c, show) => { c.classList.toggle('on', show); c.setAttribute('aria-label', c.getAttribute('aria-label').replace(/，.*$/, '') + '，' + (show ? c.dataset.s : '背面')); };
    grid.addEventListener('click', function (e) {
      const c = e.target.closest('.ui-mem__c');
      if (!c || lock || c.classList.contains('on') || c.classList.contains('ok')) return;
      if (!t0) t0 = Date.now();
      face(c, true);
      if (!first) { first = c; return; }
      moves++; mv.textContent = moves;
      const a = first; first = null;
      if (a.dataset.s === c.dataset.s) {
        [a, c].forEach((x) => { x.classList.remove('on'); x.classList.add('ok'); x.setAttribute('aria-label', x.getAttribute('aria-label').replace(/，.*$/, '') + '，已配对 ' + x.dataset.s); });
        pairs++; pr.textContent = pairs;
        if (pairs === sy.length) {
          const sec = Math.round((Date.now() - t0) / 1000);
          msg.textContent = '🎉 全部配对！' + moves + ' 步，用时 ' + sec + ' 秒';
          celebrate(grid);
          emit(self, 'win', { moves: moves, seconds: sec });
        }
      } else {
        lock = true;
        later(function () { face(a, false); face(c, false); lock = false; }, 800);
      }
    });
    this.querySelector('.ui-mem__hd button').addEventListener('click', deal);
    this.restart = deal;
    deal();
  }
}
register('ui-memory-game', UIMemoryGame, memoryGameCss);

/* ---------------- Piano 迷你钢琴 ---------------- */
const NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const KEYMAP = 'awsedftgyhujkolp;\''.split('');
export const pianoCss = `
ui-piano{display:block;width:100%;max-width:460px}
.ui-piano{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:var(--ui-radius-lg);
  background:linear-gradient(#2a2d35,#15171c);box-shadow:var(--ui-shadow)}
.ui-piano:focus-visible{outline:3px solid var(--ui-ring);outline-offset:3px}
.ui-piano__hd{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#c9ced8}
.ui-piano__now{font-family:var(--ui-mono);font-size:13px;color:#7ee2a8;min-width:4ch;text-align:right}
.ui-piano__keys{position:relative;display:flex;height:var(--pk-h,140px);touch-action:none;user-select:none;-webkit-user-select:none}
.ui-piano__w{flex:1;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;margin:0 1px;border:0;border-radius:0 0 6px 6px;cursor:pointer;
  font:600 11px var(--ui-mono);color:#5b6170;background:linear-gradient(#fafafa,#e6e7ea);box-shadow:inset 0 -6px 0 #cfd2d8}
.ui-piano__w.on{background:linear-gradient(#e4ecff,#c9d8ff);box-shadow:inset 0 -2px 0 #aabbe6}
.ui-piano__b{position:absolute;top:0;z-index:2;height:60%;padding:0;transform:translateX(-50%);border:0;border-radius:0 0 4px 4px;cursor:pointer;
  font:600 10px var(--ui-mono);color:#aeb4c0;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;
  background:linear-gradient(#3a3d45,#121318);box-shadow:inset 0 -5px 0 #000,0 3px 4px rgba(0,0,0,.5)}
.ui-piano__b.on{background:linear-gradient(#2c4a8a,#1a2a52);box-shadow:inset 0 -2px 0 #000}
`;
export class UIPiano extends UIElement {
  static props = { octaves: { default: '1' }, start: { default: '4' }, labels: { default: 'true' }, height: { default: '140' } };
  template(p) {
    const oct = Math.max(1, Math.min(3, Number(p.octaves) || 1)), base = 12 * ((Number(p.start) || 4) + 1);
    const notes = [];
    for (let m = base; m <= base + oct * 12; m++) notes.push(m);
    const whites = notes.filter((m) => NOTE[m % 12].length === 1), W = whites.length;
    const name = (m) => NOTE[m % 12] + (Math.floor(m / 12) - 1);
    let wi = -1, kb = 0, html = '';
    const map = {};
    notes.forEach(function (m) {
      const white = NOTE[m % 12].length === 1;
      const k = KEYMAP[kb++];
      if (k) map[k] = m;
      const lab = p.labels !== 'false' && k ? k.toUpperCase() : '';
      if (white) { wi++; html += '<button type="button" tabindex="-1" class="ui-piano__w" data-m="' + m + '" aria-label="' + name(m) + '">' + lab + '</button>'; }
      else html += '<button type="button" tabindex="-1" class="ui-piano__b" data-m="' + m + '" aria-label="' + name(m) + '" style="left:' + ((wi + 1) / W * 100).toFixed(3) + '%;width:' + (62 / W).toFixed(3) + '%">' + lab + '</button>';
    });
    this._map = map;
    return '<div class="ui-piano" tabindex="0" role="group" aria-label="钢琴：点击琴键，或聚焦后用键盘 A–K 演奏" style="--pk-h:' + (Number(p.height) || 140) + 'px">' +
      '<div class="ui-piano__hd"><span>🎹 聚焦后可用键盘弹奏</span><span class="ui-piano__now" aria-live="off">—</span></div><div class="ui-piano__keys">' + html + '</div></div>';
  }
  mounted() {
    const self = this, box = this.querySelector('.ui-piano'), now = this.querySelector('.ui-piano__now');
    const keyEl = (m) => box.querySelector('[data-m="' + m + '"]');
    const play = function (m) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try {
          const ctx = self._ac || (self._ac = new AC());
          if (ctx.state === 'suspended') ctx.resume();
          const f = 440 * Math.pow(2, (m - 69) / 12), t = ctx.currentTime, g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
          g.connect(ctx.destination);
          [['triangle', 1, 1], ['sine', 2, 0.35]].forEach(function (o) {
            const osc = ctx.createOscillator(), og = ctx.createGain();
            osc.type = o[0]; osc.frequency.value = f * o[1]; og.gain.value = o[2];
            osc.connect(og); og.connect(g); osc.start(t); osc.stop(t + 1.45);
          });
        } catch (e) { /* 静音环境下忽略 */ }
      }
      now.textContent = NOTE[m % 12] + (Math.floor(m / 12) - 1);
      emit(self, 'note', { midi: m, name: now.textContent });
    };
    const on = (m) => { const k = keyEl(m); if (k) k.classList.add('on'); play(m); };
    const off = (m) => { const k = keyEl(m); if (k) k.classList.remove('on'); };
    let down = false, cur = null;
    const keys = box.querySelector('.ui-piano__keys');
    keys.addEventListener('pointerdown', function (e) { const k = e.target.closest('[data-m]'); if (!k) return; down = true; cur = +k.dataset.m; on(cur); keys.setPointerCapture(e.pointerId); });
    keys.addEventListener('pointermove', function (e) {
      if (!down) return;
      const el = document.elementFromPoint(e.clientX, e.clientY), k = el && el.closest && el.closest('.ui-piano [data-m]');
      if (k && +k.dataset.m !== cur) { if (cur != null) off(cur); cur = +k.dataset.m; on(cur); }
    });
    const up = function () { if (cur != null) off(cur); down = false; cur = null; };
    keys.addEventListener('pointerup', up); keys.addEventListener('pointercancel', up);
    const held = {};
    box.addEventListener('keydown', function (e) {
      const m = self._map[e.key.toLowerCase()];
      if (m == null || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      if (!held[m]) { held[m] = 1; on(m); }
    });
    box.addEventListener('keyup', function (e) { const m = self._map[e.key.toLowerCase()]; if (m != null) { delete held[m]; off(m); } });
    box.addEventListener('blur', function () { Object.keys(held).forEach(function (m) { off(m); delete held[m]; }); });
  }
  disconnectedCallback() { if (this._ac && this._ac.close) { this._ac.close(); this._ac = null; } }
}
register('ui-piano', UIPiano, pianoCss);

/* ---------------- Gift Box 拆礼盒 ---------------- */
export const giftBoxCss = `
ui-gift-box{display:block;width:100%}
.ui-gift{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;min-height:190px}
.ui-gift__box{position:relative;width:110px;height:110px;padding:0;border:0;background:none;cursor:pointer;animation:ui-gift-wiggle 2.6s ease-in-out infinite}
.ui-gift__box:focus-visible{outline:3px solid var(--ui-ring);outline-offset:6px;border-radius:12px}
@keyframes ui-gift-wiggle{0%,70%,100%{transform:rotate(0)}75%{transform:rotate(-6deg)}80%{transform:rotate(6deg)}85%{transform:rotate(-4deg)}90%{transform:rotate(3deg)}}
.ui-gift__body,.ui-gift__lid{position:absolute;left:50%;transform:translateX(-50%);
  background:linear-gradient(90deg,transparent 42%,#f5c542 42% 58%,transparent 58%),var(--gc,#e8456b)}
.ui-gift__body{bottom:0;width:88px;height:66px;border-radius:4px 4px 8px 8px;box-shadow:inset 0 10px 0 rgba(0,0,0,.12)}
.ui-gift__lid{bottom:62px;width:104px;height:24px;border-radius:5px;box-shadow:0 3px 0 rgba(0,0,0,.12);transition:transform .55s var(--ui-spring),opacity .4s}
.ui-gift__lid::before,.ui-gift__lid::after{content:"";position:absolute;bottom:100%;width:26px;height:20px;border:6px solid #f5c542;border-radius:50% 50% 0 50%}
.ui-gift__lid::before{right:50%;transform:rotate(-12deg)}
.ui-gift__lid::after{left:50%;transform:scaleX(-1) rotate(-12deg)}
.ui-gift[data-open] .ui-gift__box{animation:none;cursor:default}
.ui-gift[data-open] .ui-gift__lid{transform:translate(-30%,-70px) rotate(-28deg);opacity:0}
.ui-gift[data-open] .ui-gift__body{transform:translateX(-50%) scale(.2);opacity:0;transition:transform .45s .15s ease-in,opacity .4s .2s}
.ui-gift__prize{position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:6px;text-align:center;color:var(--ui-text);
  animation:ui-gift-pop .55s .35s var(--ui-spring) both}
.ui-gift__prize[hidden]{display:none}
@keyframes ui-gift-pop{from{opacity:0;transform:translateY(24px) scale(.5)}to{opacity:1;transform:none}}
.ui-gift__hint{margin:0;font-size:13px;color:var(--ui-sub)}
.ui-gift[data-open] .ui-gift__hint{visibility:hidden}
.ui-gift__again{position:absolute;right:0;bottom:0}
`;
export class UIGiftBox extends UIElement {
  static props = { label: { default: '点一下拆开礼物' }, color: { default: '' } };
  template(p) {
    const id = 'ui-gift-' + (++uid);
    return '<div class="ui-gift ui-mo"><button type="button" class="ui-gift__box" aria-expanded="false" aria-controls="' + id + '" aria-label="' + esc(p.label) + '"' + (p.color ? ' style="--gc:' + esc(p.color) + '"' : '') + '>' +
      '<span class="ui-gift__body" aria-hidden="true"></span><span class="ui-gift__lid" aria-hidden="true"></span></button>' +
      '<div class="ui-gift__prize" id="' + id + '" hidden><slot></slot></div><p class="ui-gift__hint" aria-hidden="true">' + esc(p.label) + '</p></div>';
  }
  mounted() {
    const self = this, root = this.querySelector('.ui-gift'), box = root.querySelector('.ui-gift__box'), prize = root.querySelector('.ui-gift__prize');
    this.open = function () {
      if (root.dataset.open != null) return;
      root.dataset.open = ''; box.setAttribute('aria-expanded', 'true');
      prize.hidden = false;
      later(function () { celebrate(box); }, 250);
      later(function () {
        box.hidden = true;
        const again = document.createElement('button');
        again.type = 'button'; again.className = 'ui-btn ui-btn--sm ui-btn--text ui-gift__again'; again.textContent = '↺ 再包一次';
        again.addEventListener('click', function () { self.reset(); });
        root.appendChild(again); again.focus();
      }, 700);
      emit(self, 'open', {});
    };
    this.reset = function () {
      delete root.dataset.open; box.hidden = false; box.setAttribute('aria-expanded', 'false'); prize.hidden = true;
      const a = root.querySelector('.ui-gift__again'); if (a) a.remove();
      box.focus();
    };
    box.addEventListener('click', this.open);
  }
}
register('ui-gift-box', UIGiftBox, giftBoxCss);

/* ---------------- Music Player 迷你播放器 ---------------- */
const MP_DEF = [
  { title: '夏夜晚风', artist: 'Lo-fi Lab', dur: 204, emoji: '🌙' },
  { title: '城市漫游', artist: 'Neon Drive', dur: 187, emoji: '🌆' },
  { title: '海边日记', artist: 'Blue Tape', dur: 231, emoji: '🌊' }
];
const IC = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2.2v12H6zM9.5 12 18 18V6z"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 6H18v12h-2.2zM6 18l8.5-6L6 6z"/></svg>'
};
export const musicPlayerCss = `
ui-music-player{display:block;width:100%;max-width:420px}
.ui-mp{container-type:inline-size}
.ui-mp__in{display:flex;gap:16px;align-items:center;padding:14px;border-radius:var(--ui-radius-lg);
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);box-shadow:var(--ui-shadow)}
.ui-mp__cv{flex:none;width:96px;height:96px;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle,var(--ui-brand) 0 17px,#111 18px 20px,transparent 21px),repeating-radial-gradient(circle,#1b1b1f 0 2px,#26262c 2px 4px);
  box-shadow:0 6px 18px -6px rgba(0,0,0,.6);animation:ui-mp-spin 6s linear infinite;animation-play-state:paused}
.ui-mp__cv span{font-size:20px}
.ui-mp[data-on] .ui-mp__cv{animation-play-state:running}
@keyframes ui-mp-spin{to{transform:rotate(360deg)}}
.ui-mp__bd{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.ui-mp__t b{display:block;font-size:15px;color:var(--ui-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ui-mp__t span{font-size:12px;color:var(--ui-sub)}
.ui-mp__viz{display:flex;align-items:flex-end;gap:2px;height:18px}
.ui-mp__viz i{flex:1;height:100%;border-radius:2px;background:var(--ui-brand);transform-origin:bottom;transform:scaleY(.15);
  animation:ui-mp-bar var(--d) ease-in-out infinite alternate;animation-play-state:paused}
.ui-mp[data-on] .ui-mp__viz i{animation-play-state:running}
@keyframes ui-mp-bar{0%{transform:scaleY(.15)}100%{transform:scaleY(1)}}
.ui-mp__bd input{width:100%;margin:0;accent-color:var(--ui-brand)}
.ui-mp__tm{display:flex;justify-content:space-between;font-size:11px;color:var(--ui-sub);font-variant-numeric:tabular-nums}
.ui-mp__ctl{display:flex;justify-content:center;align-items:center;gap:10px}
.ui-mp__ctl button{display:grid;place-items:center;width:34px;height:34px;padding:0;border:0;border-radius:50%;background:none;color:var(--ui-text);cursor:pointer}
.ui-mp__ctl button:hover{background:var(--ui-panel-2)}
.ui-mp__ctl button:focus-visible{outline:3px solid var(--ui-ring);outline-offset:1px}
.ui-mp__ctl svg{width:20px;height:20px;fill:currentColor}
.ui-mp__ctl .pl{width:42px;height:42px;background:var(--ui-brand);color:var(--ui-brand-ink)}
.ui-mp__ctl .pl:hover{background:var(--ui-brand);filter:brightness(1.08)}
@container (max-width:300px){.ui-mp__in{flex-direction:column;text-align:center}.ui-mp__bd{width:100%}}
`;
export class UIMusicPlayer extends UIElement {
  static props = { tracks: { default: '' } };
  template() {
    let bars = '';
    for (let i = 0; i < 20; i++) bars += '<i style="--d:' + (0.35 + ((i * 37) % 23) / 40).toFixed(2) + 's;animation-delay:-' + ((i * 0.13) % 0.9).toFixed(2) + 's"></i>';
    return '<div class="ui-mp ui-mo"><div class="ui-mp__in"><div class="ui-mp__cv" aria-hidden="true"><span></span></div><div class="ui-mp__bd">' +
      '<div class="ui-mp__t"><b></b><span></span></div><div class="ui-mp__viz" aria-hidden="true">' + bars + '</div>' +
      '<input type="range" min="0" value="0" step="1" aria-label="播放进度"><div class="ui-mp__tm"><span class="a">0:00</span><span class="b">0:00</span></div>' +
      '<div class="ui-mp__ctl"><button type="button" class="pv" aria-label="上一首">' + IC.prev + '</button><button type="button" class="pl" aria-label="播放">' + IC.play + '</button>' +
      '<button type="button" class="nx" aria-label="下一首">' + IC.next + '</button></div></div></div></div>';
  }
  mounted(p) {
    const self = this, root = this.querySelector('.ui-mp'), list = parseJSON(p.tracks, MP_DEF);
    const $ = (s) => root.querySelector(s), range = $('input'), pl = $('.pl');
    const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    let i = 0, t = 0, on = false;
    const load = function (k) {
      i = (k + list.length) % list.length; t = 0;
      const tr = list[i];
      $('.ui-mp__t b').textContent = tr.title; $('.ui-mp__t span').textContent = tr.artist || '';
      $('.ui-mp__cv span').textContent = tr.emoji || '♪';
      range.max = tr.dur || 180; $('.b').textContent = fmt(tr.dur || 180);
      sync();
      emit(self, 'track', { index: i, track: tr });
    };
    const sync = function () { range.value = t; $('.a').textContent = fmt(t); range.setAttribute('aria-valuetext', fmt(t) + ' / ' + fmt(Number(range.max))); };
    const set = function (v) {
      on = v;
      if (on) root.dataset.on = ''; else delete root.dataset.on;
      pl.innerHTML = on ? IC.pause : IC.play; pl.setAttribute('aria-label', on ? '暂停' : '播放');
      clearInterval(self._t);
      if (on) self._t = setInterval(function () { t += 0.5; if (t >= Number(range.max)) { load(i + 1); } else sync(); }, 500);
      emit(self, on ? 'play' : 'pause', { index: i });
    };
    pl.addEventListener('click', function () { set(!on); });
    $('.pv').addEventListener('click', function () { load(t > 3 ? i : i - 1); });
    $('.nx').addEventListener('click', function () { load(i + 1); });
    range.addEventListener('input', function () { t = Number(range.value); sync(); });
    this.play = function () { set(true); }; this.pause = function () { set(false); };
    load(0);
  }
  disconnectedCallback() { clearInterval(this._t); }
}
register('ui-music-player', UIMusicPlayer, musicPlayerCss);

/* ---------------- Weather 天气卡 ---------------- */
const WX_EMOJI = { sunny: '☀️', cloudy: '⛅', rain: '🌧️', snow: '❄️', storm: '⛈️' };
const WX_BG = {
  sunny: 'linear-gradient(160deg,#1e40af,#2563eb 70%)',
  cloudy: 'linear-gradient(160deg,#334155,#5b6b80)',
  rain: 'linear-gradient(160deg,#0f172a,#334155)',
  snow: 'linear-gradient(160deg,#1e3a5f,#4b5f7a)',
  storm: 'linear-gradient(160deg,#111827,#312e81)'
};
export const weatherCss = `
ui-weather{display:block;width:100%;max-width:340px}
.ui-wx{position:relative;overflow:hidden;padding:16px 18px;border-radius:calc(var(--ui-radius-lg) + 4px);color:#fff;box-shadow:var(--ui-shadow)}
.ui-wx__top{display:flex;justify-content:space-between;gap:10px}
.ui-wx__city{font-size:15px;font-weight:700}
.ui-wx__desc{font-size:13px}
.ui-wx__temp{font-size:52px;font-weight:300;line-height:1.05;margin-top:4px;font-variant-numeric:tabular-nums}
.ui-wx__rg{font-size:12.5px}
.ui-wx__fc{display:flex;justify-content:space-between;gap:4px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.25);list-style:none;margin-bottom:0;padding-left:0}
.ui-wx__fc li{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px;min-width:0}
.ui-wx__fc li span:nth-child(2){font-size:18px}
.ui-wx__ic{position:relative;flex:none;width:84px;height:64px}
.ui-wx__sun{position:absolute;right:8px;top:2px;width:40px;height:40px;border-radius:50%;background:#fcd34d;box-shadow:0 0 22px 6px rgba(252,211,77,.55)}
.ui-wx__sun::before{content:"";position:absolute;inset:-12px;border-radius:50%;
  background:repeating-conic-gradient(#fcd34d 0 8deg,transparent 8deg 30deg);
  -webkit-mask:radial-gradient(circle,transparent 25px,#000 26px 32px,transparent 33px);mask:radial-gradient(circle,transparent 25px,#000 26px 32px,transparent 33px);
  animation:ui-wx-spin 14s linear infinite}
@keyframes ui-wx-spin{to{transform:rotate(360deg)}}
.ui-wx__cloud{position:absolute;left:6px;top:24px;width:60px;height:22px;border-radius:12px;background:var(--cl,#f1f5f9);animation:ui-wx-drift 5s ease-in-out infinite alternate}
.ui-wx__cloud::before,.ui-wx__cloud::after{content:"";position:absolute;bottom:8px;border-radius:50%;background:inherit}
.ui-wx__cloud::before{left:8px;width:24px;height:24px}
.ui-wx__cloud::after{left:24px;width:30px;height:30px}
@keyframes ui-wx-drift{to{transform:translateX(8px)}}
.ui-wx__drop{position:absolute;top:46px;width:2px;height:9px;border-radius:2px;background:#93c5fd;animation:ui-wx-rain .8s linear infinite}
@keyframes ui-wx-rain{from{transform:translateY(-4px);opacity:0}30%{opacity:1}to{transform:translateY(16px);opacity:0}}
.ui-wx__flake{position:absolute;top:46px;width:5px;height:5px;border-radius:50%;background:#fff;animation:ui-wx-snow 2.2s linear infinite}
@keyframes ui-wx-snow{from{transform:translate(0,-4px);opacity:0}30%{opacity:1}to{transform:translate(6px,18px);opacity:0}}
.ui-wx__bolt{position:absolute;left:30px;top:40px;width:14px;height:22px;background:#facc15;clip-path:polygon(50% 0,0 55%,45% 55%,30% 100%,100% 40%,55% 40%,75% 0);animation:ui-wx-flash 2.4s steps(1) infinite}
@keyframes ui-wx-flash{0%,40%,48%,100%{opacity:0}42%,46%,52%{opacity:1}}
`;
export class UIWeather extends UIElement {
  static props = { type: { default: 'sunny' }, city: { default: '杭州' }, temp: { default: '26' }, desc: { default: '' }, range: { default: '' }, forecast: { default: '' } };
  template(p) {
    const ty = WX_BG[p.type] ? p.type : 'sunny';
    const names = { sunny: '晴', cloudy: '多云', rain: '小雨', snow: '小雪', storm: '雷阵雨' };
    let ic = '';
    if (ty === 'sunny' || ty === 'cloudy') ic += '<span class="ui-wx__sun"></span>';
    if (ty !== 'sunny') ic += '<span class="ui-wx__cloud" style="--cl:' + (ty === 'storm' ? '#94a3b8' : ty === 'rain' ? '#cbd5e1' : '#f1f5f9') + '"></span>';
    if (ty === 'rain' || ty === 'storm') for (let i = 0; i < 5; i++) ic += '<i class="ui-wx__drop" style="left:' + (14 + i * 10) + 'px;animation-delay:-' + (i * 0.27).toFixed(2) + 's"></i>';
    if (ty === 'snow') for (let i = 0; i < 5; i++) ic += '<i class="ui-wx__flake" style="left:' + (12 + i * 10) + 'px;animation-delay:-' + (i * 0.45).toFixed(2) + 's"></i>';
    if (ty === 'storm') ic += '<i class="ui-wx__bolt"></i>';
    const fc = splitList(p.forecast).map((x) => x.split(':'));
    const desc = p.desc || names[ty];
    return '<div class="ui-wx ui-mo" role="group" aria-label="' + esc(p.city) + '天气：' + esc(desc) + '，' + esc(p.temp) + '°" style="background:' + WX_BG[ty] + '">' +
      '<div class="ui-wx__top"><div><div class="ui-wx__city">📍 ' + esc(p.city) + '</div><div class="ui-wx__desc">' + esc(desc) + '</div>' +
      '<div class="ui-wx__temp">' + esc(p.temp) + '°</div>' + (p.range ? '<div class="ui-wx__rg">' + esc(p.range) + '</div>' : '') + '</div>' +
      '<div class="ui-wx__ic" aria-hidden="true">' + ic + '</div></div>' +
      (fc.length ? '<ul class="ui-wx__fc">' + fc.map((f) => '<li><span>' + esc(f[0]) + '</span><span aria-label="' + esc(names[f[1]] || f[1] || '') + '">' + (WX_EMOJI[f[1]] || '·') + '</span><span>' + esc(f[2] || '') + '</span></li>').join('') + '</ul>' : '') +
      '</div>';
  }
}
register('ui-weather', UIWeather, weatherCss);

/* ---------------- Battery 电池 ---------------- */
export const batteryCss = `
ui-battery{display:inline-block}
.ui-bat{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--ui-text);font-variant-numeric:tabular-nums}
.ui-bat__body{position:relative;width:var(--bw,46px);height:calc(var(--bw,46px) * .48);padding:2px;border:2px solid var(--ui-text);border-radius:5px;display:flex}
.ui-bat__body::after{content:"";position:absolute;right:-6px;top:28%;width:3px;height:44%;border-radius:0 2px 2px 0;background:var(--ui-text)}
.ui-bat__fill{display:block;height:100%;border-radius:2px;background:var(--bc);transition:width .6s var(--ui-ease)}
.ui-bat[data-ch] .ui-bat__fill{background:linear-gradient(90deg,var(--bc) 40%,color-mix(in srgb,var(--bc) 50%,#fff) 50%,var(--bc) 60%) 0 0/300% 100%;animation:ui-bat-ch 1.6s linear infinite}
@keyframes ui-bat-ch{from{background-position:100% 0}to{background-position:-50% 0}}
.ui-bat__bolt{position:absolute;inset:0;display:grid;place-items:center}
.ui-bat__bolt svg{width:44%;height:80%;fill:var(--ui-text);stroke:var(--ui-panel);stroke-width:1.5;paint-order:stroke}
`;
export class UIBattery extends UIElement {
  static props = { level: { default: '72' }, charging: { type: 'boolean' }, label: { default: '电量' }, size: { default: '46' } };
  template(p) {
    const v = Math.max(0, Math.min(100, Math.round(Number(p.level) || 0)));
    const c = v <= 20 ? 'var(--ui-danger)' : v <= 50 ? 'var(--ui-warn)' : 'var(--ui-ok)';
    return '<div class="ui-bat ui-mo"' + (p.charging ? ' data-ch' : '') + ' role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '" aria-label="' + esc(p.label) + '" aria-valuetext="' + v + '%' + (p.charging ? '，充电中' : '') + '" style="--bc:' + c + ';--bw:' + (Number(p.size) || 46) + 'px">' +
      '<span class="ui-bat__body" aria-hidden="true"><span class="ui-bat__fill" style="width:' + v + '%"></span>' +
      (p.charging ? '<span class="ui-bat__bolt"><svg viewBox="0 0 10 16"><path d="M6 0 0 9h4l-1 7 7-10H6z"/></svg></span>' : '') + '</span><span aria-hidden="true">' + v + '%</span></div>';
  }
}
register('ui-battery', UIBattery, batteryCss);

/* ---------------- Sticky Notes 便利贴墙 ---------------- */
const NOTE_C = { yellow: '#fef08a', pink: '#fbcfe8', blue: '#bfdbfe', green: '#bbf7d0', orange: '#fed7aa' };
export const stickyNotesCss = `
ui-sticky-notes{display:block;width:100%}
.ui-notes{display:flex;flex-direction:column;gap:8px}
.ui-notes__wall{position:relative;height:var(--nh,260px);overflow:hidden;border-radius:var(--ui-radius-lg);border:var(--ui-border-w) dashed var(--ui-line);
  background:var(--ui-panel-2) radial-gradient(circle at 1px 1px,var(--ui-line) 1px,transparent 0) 0 0/16px 16px}
.ui-note{position:absolute;width:128px;min-height:104px;display:flex;flex-direction:column;background:var(--nc);color:#1f2937;
  box-shadow:0 6px 14px -6px rgba(0,0,0,.4);transform:rotate(var(--r,0deg));transition:transform .2s var(--ui-ease),box-shadow .2s}
.ui-note.drag{transform:rotate(0) scale(1.04);box-shadow:0 16px 28px -10px rgba(0,0,0,.45);transition:none}
.ui-note__bar{display:flex;justify-content:space-between;align-items:center;height:20px;cursor:grab;touch-action:none;background:rgba(0,0,0,.06)}
.ui-note__grip{padding:0 6px;font-size:12px;line-height:20px;color:#4b5563}
.ui-note__grip:focus-visible{outline:2px solid #1f2937;outline-offset:-2px}
.ui-note.drag .ui-note__bar{cursor:grabbing}
.ui-note__x{width:20px;height:20px;padding:0;border:0;background:none;color:#374151;font-size:15px;line-height:1;cursor:pointer}
.ui-note__x:focus-visible{outline:2px solid #1f2937}
.ui-note textarea{flex:1;min-height:80px;margin:0;padding:6px 9px 9px;border:0;resize:none;background:transparent;color:inherit;
  font:500 13px/1.5 var(--ui-font)}
.ui-note textarea:focus{outline:2px solid rgba(31,41,55,.5);outline-offset:-3px}
.ui-notes__ft{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--ui-sub)}
`;
export class UIStickyNotes extends UIElement {
  static props = { items: { default: '记得给猫买粮 🐟|yellow,周五 18:00 发布 v2|pink,把这个点子写成文档|blue,多喝水！|green' }, height: { default: '260' } };
  template(p) {
    if (!this._notes) {
      this._notes = splitList(p.items).map(function (s, i) {
        const k = s.lastIndexOf('|'), c = k > 0 ? s.slice(k + 1) : '';
        return { text: k > 0 && NOTE_C[c] ? s.slice(0, k) : s, color: NOTE_C[c] ? c : Object.keys(NOTE_C)[i % 5],
          x: 'min(' + (3 + (i % 4) * 24) + '%,calc(100% - 136px))', y: (14 + Math.floor(i / 4) * 124 + (i % 2) * 22) + 'px', r: ((i * 37) % 7) - 3 };
      });
    }
    return '<div class="ui-notes"><div class="ui-notes__wall" style="--nh:' + (Number(p.height) || 260) + 'px"></div>' +
      '<div class="ui-notes__ft"><span>拖动顶部条移动 · 方向键微调</span><button type="button" class="ui-btn ui-btn--sm">＋ 便利贴</button></div></div>';
  }
  mounted() {
    const self = this, wall = this.querySelector('.ui-notes__wall');
    let z = 1;
    const changed = () => emit(self, 'change', { notes: self._notes.map((n) => ({ text: n.text, color: n.color })) });
    const make = function (n) {
      const el = document.createElement('div');
      el.className = 'ui-note';
      el.style.cssText = '--nc:' + NOTE_C[n.color] + ';--r:' + n.r + 'deg;left:' + n.x + ';top:' + n.y + ';z-index:' + (z++);
      el.innerHTML = '<div class="ui-note__bar"><span class="ui-note__grip" tabindex="0" role="button" aria-label="移动便利贴（方向键）">⠿</span><button type="button" class="ui-note__x" aria-label="删除便利贴">×</button></div><textarea aria-label="便利贴内容"></textarea>';
      const ta = el.querySelector('textarea'), bar = el.querySelector('.ui-note__bar'), grip = el.querySelector('.ui-note__grip');
      ta.value = n.text;
      ta.addEventListener('input', function () { n.text = ta.value; });
      ta.addEventListener('change', changed);
      el.querySelector('.ui-note__x').addEventListener('click', function (e) {
        e.stopPropagation();
        self._notes.splice(self._notes.indexOf(n), 1); el.remove(); changed();
      });
      const place = function (x, y) {
        x = Math.max(0, Math.min(wall.clientWidth - el.offsetWidth, x)); y = Math.max(0, Math.min(wall.clientHeight - el.offsetHeight, y));
        n.x = x + 'px'; n.y = y + 'px'; el.style.left = n.x; el.style.top = n.y;
      };
      let sx, sy, ox, oy, on = false;
      bar.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.ui-note__x')) return;
        on = true; sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop;
        el.style.zIndex = z++; el.classList.add('drag'); bar.setPointerCapture(e.pointerId);
      });
      bar.addEventListener('pointermove', function (e) { if (on) place(ox + e.clientX - sx, oy + e.clientY - sy); });
      const end = function () { if (on) { on = false; el.classList.remove('drag'); changed(); } };
      bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
      grip.addEventListener('keydown', function (e) {
        const d = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
        if (!d) return;
        e.preventDefault(); el.style.zIndex = z++; place(el.offsetLeft + d[0], el.offsetTop + d[1]);
      });
      el.addEventListener('pointerdown', function () { el.style.zIndex = z++; });
      wall.appendChild(el);
      return el;
    };
    this._notes.forEach(make);
    this.querySelector('.ui-notes__ft button').addEventListener('click', function () {
      const keys = Object.keys(NOTE_C), i = self._notes.length;
      const n = { text: '', color: keys[i % keys.length], x: Math.round(Math.random() * Math.max(0, wall.clientWidth - 136)) + 'px', y: Math.round(Math.random() * Math.max(0, wall.clientHeight - 112)) + 'px', r: Math.round(Math.random() * 6 - 3) };
      self._notes.push(n);
      make(n).querySelector('textarea').focus();
      changed();
    });
  }
}
register('ui-sticky-notes', UIStickyNotes, stickyNotesCss);

/* ---------------- Joystick 虚拟摇杆 ---------------- */
export const joystickCss = `
ui-joystick{display:inline-block}
.ui-joy{display:flex;flex-direction:column;align-items:center;gap:8px}
.ui-joy__base{position:relative;width:var(--js,140px);height:var(--js,140px);border-radius:50%;touch-action:none;cursor:grab;
  background:radial-gradient(circle,var(--ui-panel) 0 58%,var(--ui-panel-2) 59%);border:var(--ui-border-w) solid var(--ui-line);
  box-shadow:inset 0 4px 12px rgba(0,0,0,.12),var(--ui-shadow-sm)}
.ui-joy__base:focus-visible{outline:3px solid var(--ui-ring);outline-offset:3px}
.ui-joy__base::before{content:"";position:absolute;inset:12%;border-radius:50%;border:1px dashed var(--ui-line)}
.ui-joy__ar{position:absolute;font-size:10px;color:var(--ui-sub);line-height:1}
.ui-joy__knob{position:absolute;left:50%;top:50%;width:42%;height:42%;margin:-21%;border-radius:50%;
  background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--ui-brand) 60%,#fff),var(--ui-brand) 60%,color-mix(in srgb,var(--ui-brand) 70%,#000));
  box-shadow:0 6px 14px -4px color-mix(in srgb,var(--ui-brand) 60%,transparent);transition:transform .35s var(--ui-spring)}
.ui-joy__base.drag .ui-joy__knob{transition:none}
.ui-joy__out{font:12px var(--ui-mono);color:var(--ui-sub);font-variant-numeric:tabular-nums}
`;
export class UIJoystick extends UIElement {
  static props = { size: { default: '140' }, label: { default: '方向摇杆' } };
  template(p) {
    const ar = [['▲', 'left:50%;top:5%;transform:translateX(-50%)'], ['▼', 'left:50%;bottom:5%;transform:translateX(-50%)'], ['◀', 'left:5%;top:50%;transform:translateY(-50%)'], ['▶', 'right:5%;top:50%;transform:translateY(-50%)']];
    return '<div class="ui-joy"><div class="ui-joy__base" tabindex="0" role="group" aria-roledescription="摇杆" aria-label="' + esc(p.label) + '：按住拖动，或用方向键" style="--js:' + (Number(p.size) || 140) + 'px">' +
      ar.map((a) => '<span class="ui-joy__ar" aria-hidden="true" style="' + a[1] + '">' + a[0] + '</span>').join('') + '<span class="ui-joy__knob"></span></div>' +
      '<span class="ui-joy__out" aria-live="off">x 0.00 · y 0.00</span></div>';
  }
  mounted() {
    const self = this, base = this.querySelector('.ui-joy__base'), knob = base.querySelector('.ui-joy__knob'), out = this.querySelector('.ui-joy__out');
    const R = () => base.clientWidth * 0.29;
    const set = function (dx, dy) {
      const r = R(), d = Math.hypot(dx, dy);
      if (d > r) { dx = dx / d * r; dy = dy / d * r; }
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      const x = r ? dx / r : 0, y = r ? -dy / r : 0;
      const dist = Math.min(1, Math.hypot(x, y)), ang = dist ? Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360) : 0;
      out.textContent = 'x ' + x.toFixed(2) + ' · y ' + y.toFixed(2);
      emit(self, 'move', { x: +x.toFixed(3), y: +y.toFixed(3), angle: ang, distance: +dist.toFixed(3) });
    };
    let on = false, cx = 0, cy = 0;
    base.addEventListener('pointerdown', function (e) {
      on = true; const r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      base.classList.add('drag'); base.setPointerCapture(e.pointerId); set(e.clientX - cx, e.clientY - cy);
    });
    base.addEventListener('pointermove', function (e) { if (on) set(e.clientX - cx, e.clientY - cy); });
    const end = function () { if (!on) return; on = false; base.classList.remove('drag'); set(0, 0); emit(self, 'end', {}); };
    base.addEventListener('pointerup', end); base.addEventListener('pointercancel', end);
    const held = {};
    const fromKeys = function () {
      const r = R(), dx = ((held.ArrowRight ? 1 : 0) - (held.ArrowLeft ? 1 : 0)) * r, dy = ((held.ArrowDown ? 1 : 0) - (held.ArrowUp ? 1 : 0)) * r;
      set(dx, dy);
    };
    base.addEventListener('keydown', function (e) { if (/^Arrow/.test(e.key)) { e.preventDefault(); if (!held[e.key]) { held[e.key] = 1; fromKeys(); } } });
    base.addEventListener('keyup', function (e) { if (held[e.key]) { delete held[e.key]; fromKeys(); if (!Object.keys(held).length) emit(self, 'end', {}); } });
    base.addEventListener('blur', function () { for (const k in held) delete held[k]; set(0, 0); });
  }
}
register('ui-joystick', UIJoystick, joystickCss);
