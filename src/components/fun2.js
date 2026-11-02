/* =========================================================
   趣味组件（第二批 10 个，偏实用）
   表单：ui-signature 签名板 / ui-knob 旋钮 / ui-pattern-lock 手势锁
         ui-slide-verify 滑块验证 / ui-emoji-rate 表情评分 / ui-hold-button 长按确认
   展示：ui-sortable 拖拽排序 / ui-reactions 表情回应
   图表：ui-radar 雷达图 / ui-word-cloud 词云
   ========================================================= */
import { UIElement, register } from './base.js';
import { esc, splitList } from './more-form.js';
import { reduced, onVisible, tokenColors } from '../lib/motion.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let uid = 0;

/* ---------------- Signature 手写签名板 ---------------- */
export const signatureCss = `
ui-signature{display:block;width:100%;max-width:440px}
.ui-sig{display:flex;flex-direction:column;gap:6px}
.ui-sig__lb{font-size:13px;font-weight:600;color:var(--ui-text)}
.ui-sig__pad{position:relative;height:var(--sg-h,160px);border-radius:var(--ui-radius);background:var(--ui-panel);border:var(--ui-border-w) dashed var(--ui-line)}
.ui-sig__pad canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}
.ui-sig__ph{position:absolute;inset:0;display:grid;place-items:center;font-size:14px;color:var(--ui-sub);pointer-events:none}
.ui-sig__base{position:absolute;left:16px;right:16px;bottom:30px;border-bottom:1px solid var(--ui-line);pointer-events:none}
.ui-sig__base::before{content:"✕";position:absolute;left:0;bottom:2px;font-size:12px;color:var(--ui-sub)}
.ui-sig[data-has] .ui-sig__ph{display:none}
.ui-sig__ft{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:var(--ui-sub)}
.ui-sig__ft > span:last-child{display:flex;gap:4px}
`;
export class UISignature extends UIElement {
  static props = { label: { default: '' }, height: { default: '160' }, placeholder: { default: '在此处签名' } };
  template(p) {
    const id = 'ui-sig-' + (++uid);
    return '<div class="ui-sig">' + (p.label ? '<span class="ui-sig__lb" id="' + id + '">' + esc(p.label) + '</span>' : '') +
      '<div class="ui-sig__pad" style="--sg-h:' + (Number(p.height) || 160) + 'px"><span class="ui-sig__base" aria-hidden="true"></span><span class="ui-sig__ph" aria-hidden="true">' + esc(p.placeholder) + '</span>' +
      '<canvas role="img" aria-label="' + esc(p.label || '签名') + '：未签名"></canvas></div>' +
      '<div class="ui-sig__ft"><span class="st" aria-live="polite">未签名</span><span><button type="button" class="ui-btn ui-btn--sm ui-btn--text un" disabled>撤销</button><button type="button" class="ui-btn ui-btn--sm cl" disabled>清空</button></span></div></div>';
  }
  mounted(p) {
    const self = this, root = this.querySelector('.ui-sig'), pad = root.querySelector('.ui-sig__pad'), cv = pad.querySelector('canvas'), ctx = cv.getContext('2d');
    const st = root.querySelector('.st'), un = root.querySelector('.un'), cl = root.querySelector('.cl');
    this._strokes = this._strokes || [];
    const ink = () => tokenColors(self, ['text'])[0];
    const seg = function (a, b) {
      ctx.lineWidth = (a[2] + b[2]) / 2;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    };
    const redraw = function () {
      const r = pad.getBoundingClientRect(), d = window.devicePixelRatio || 1;
      if (!r.width) return;
      cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.strokeStyle = ink(); ctx.fillStyle = ctx.strokeStyle; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      self._strokes.forEach(function (s) {
        if (s.length === 1) { ctx.beginPath(); ctx.arc(s[0][0], s[0][1], s[0][2] / 2, 0, 7); ctx.fill(); }
        for (let i = 1; i < s.length; i++) seg(s[i - 1], s[i]);
      });
    };
    const state = function () {
      const has = self._strokes.length > 0;
      if (has) root.dataset.has = ''; else delete root.dataset.has;
      un.disabled = cl.disabled = !has;
      st.textContent = has ? '已签名 · ' + self._strokes.length + ' 笔' : '未签名';
      cv.setAttribute('aria-label', (p.label || '签名') + '：' + (has ? '已签名' : '未签名'));
    };
    let cur = null, last = 0;
    const pos = function (e, prev) {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, t = performance.now();
      let w = 2.6;
      if (prev) { const v = Math.hypot(x - prev[0], y - prev[1]) / Math.max(1, t - last); w = clamp(3.4 - v * 1.6, 1.1, 3.4); w = prev[2] * 0.6 + w * 0.4; }
      last = t;
      return [x, y, w];
    };
    cv.addEventListener('pointerdown', function (e) {
      cv.setPointerCapture(e.pointerId);
      ctx.strokeStyle = ink(); ctx.fillStyle = ctx.strokeStyle;
      cur = [pos(e)]; self._strokes.push(cur);
      ctx.beginPath(); ctx.arc(cur[0][0], cur[0][1], cur[0][2] / 2, 0, 7); ctx.fill();
      state();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!cur) return;
      const pt = pos(e, cur[cur.length - 1]);
      seg(cur[cur.length - 1], pt); cur.push(pt);
    });
    const end = function () { if (cur) { cur = null; state(); emit(self, 'change', { empty: false, strokes: self._strokes.length }); } };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    this.undo = function () { self._strokes.pop(); redraw(); state(); emit(self, 'change', { empty: !self._strokes.length, strokes: self._strokes.length }); };
    this.clear = function () { self._strokes = []; redraw(); state(); emit(self, 'change', { empty: true, strokes: 0 }); };
    this.toDataURL = function (type) { return cv.toDataURL(type || 'image/png'); };
    Object.defineProperty(this, 'isEmpty', { configurable: true, get: function () { return !self._strokes.length; } });
    un.addEventListener('click', this.undo); cl.addEventListener('click', this.clear);
    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver(redraw); this._ro.observe(pad);
    if (this._mo) this._mo.disconnect();
    this._mo = new MutationObserver(redraw);
    this._mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-style'] });
    state();
  }
  disconnectedCallback() { if (this._ro) this._ro.disconnect(); if (this._mo) this._mo.disconnect(); }
}
register('ui-signature', UISignature, signatureCss);

/* ---------------- Knob 旋钮 ---------------- */
export const knobCss = `
ui-knob{display:inline-block}
.ui-knob{display:inline-flex;flex-direction:column;align-items:center;gap:6px}
.ui-knob__dial{position:relative;width:var(--kz,96px);height:var(--kz,96px);border-radius:50%;cursor:grab;touch-action:none;user-select:none}
.ui-knob__dial:focus-visible{outline:3px solid var(--ui-ring);outline-offset:3px}
.ui-knob__dial svg{display:block;width:100%;height:100%;overflow:visible}
.ui-knob__trk{fill:none;stroke:var(--ui-panel-2);stroke-width:7;stroke-linecap:round}
.ui-knob__val{fill:none;stroke:var(--ui-brand);stroke-width:7;stroke-linecap:round}
.ui-knob__tk{stroke:var(--ui-line);stroke-width:1.5}
.ui-knob__cap{fill:var(--ui-panel);stroke:var(--ui-line);filter:drop-shadow(0 3px 4px rgba(0,0,0,.18))}
.ui-knob__ptr{stroke:var(--ui-brand);stroke-width:4;stroke-linecap:round}
.ui-knob__v{position:absolute;inset:0;display:grid;place-items:center;padding-top:30%;font-size:12px;font-weight:700;color:var(--ui-text);font-variant-numeric:tabular-nums;pointer-events:none}
.ui-knob__l{font-size:12.5px;color:var(--ui-sub)}
`;
const kPt = (r, deg) => { const a = deg * Math.PI / 180; return (50 + r * Math.sin(a)).toFixed(2) + ' ' + (50 - r * Math.cos(a)).toFixed(2); };
const kArc = (r, a0, a1) => 'M' + kPt(r, a0) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + kPt(r, a1);
export class UIKnob extends UIElement {
  static props = { label: { default: '' }, min: { default: '0' }, max: { default: '100' }, value: { default: '40' }, step: { default: '1' }, size: { default: '96' }, unit: { default: '' } };
  template(p) {
    const id = 'ui-knob-' + (++uid);
    let ticks = '';
    for (let i = 0; i <= 10; i++) { const a = -135 + i * 27; ticks += '<path class="ui-knob__tk" d="M' + kPt(47, a) + ' L' + kPt(50, a) + '"/>'; }
    return '<div class="ui-knob"><div class="ui-knob__dial" role="slider" tabindex="0" style="--kz:' + (Number(p.size) || 96) + 'px"' + (p.label ? ' aria-labelledby="' + id + '"' : ' aria-label="旋钮"') +
      ' aria-valuemin="' + esc(p.min) + '" aria-valuemax="' + esc(p.max) + '"><svg viewBox="0 0 100 100" aria-hidden="true">' + ticks +
      '<path class="ui-knob__trk" d="' + kArc(40, -135, 135) + '"/><path class="ui-knob__val"/><circle class="ui-knob__cap" cx="50" cy="50" r="28"/><line class="ui-knob__ptr" x1="50" y1="30" x2="50" y2="38"/></svg>' +
      '<b class="ui-knob__v" aria-hidden="true"></b></div>' + (p.label ? '<span class="ui-knob__l" id="' + id + '">' + esc(p.label) + '</span>' : '') + '</div>';
  }
  mounted(p) {
    const self = this, dial = this.querySelector('.ui-knob__dial'), val = dial.querySelector('.ui-knob__val'), ptr = dial.querySelector('.ui-knob__ptr'), out = dial.querySelector('.ui-knob__v');
    const min = Number(p.min) || 0, max = Number(p.max) > min ? Number(p.max) : min + 100, step = Number(p.step) > 0 ? Number(p.step) : 1;
    const snap = (v) => clamp(Math.round((v - min) / step) * step + min, min, max);
    this._v = snap(this._v != null && this._lastProps === p.value ? this._v : Number(p.value) || 0);
    this._lastProps = p.value;
    const draw = function () {
      const a = -135 + 270 * (self._v - min) / (max - min);
      val.setAttribute('d', a > -134.9 ? kArc(40, -135, a) : '');
      ptr.setAttribute('transform', 'rotate(' + a.toFixed(2) + ' 50 50)');
      const txt = (+self._v.toFixed(6)) + (p.unit || '');
      out.textContent = txt;
      dial.setAttribute('aria-valuenow', self._v); dial.setAttribute('aria-valuetext', txt);
    };
    const setV = function (v, fire) {
      v = snap(v);
      if (v === self._v) return;
      self._v = v; draw();
      emit(self, 'input', { value: v });
      if (fire) emit(self, 'change', { value: v });
    };
    Object.defineProperty(this, 'value', { configurable: true, get: () => self._v, set: (v) => { self._v = snap(Number(v)); draw(); } });
    let on = false;
    const fromPointer = function (e) {
      const r = dial.getBoundingClientRect();
      let a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
      if (a > 135 || a < -135) a = (self._v - min) / (max - min) > 0.5 ? 135 : -135;
      setV(min + (a + 135) / 270 * (max - min));
    };
    dial.addEventListener('pointerdown', function (e) { on = true; dial.setPointerCapture(e.pointerId); dial.focus(); fromPointer(e); });
    dial.addEventListener('pointermove', function (e) { if (on) fromPointer(e); });
    const end = function () { if (on) { on = false; emit(self, 'change', { value: self._v }); } };
    dial.addEventListener('pointerup', end); dial.addEventListener('pointercancel', end);
    dial.addEventListener('keydown', function (e) {
      const big = Math.max(step, (max - min) / 10);
      const m = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: big, PageDown: -big }[e.key];
      if (m != null) { e.preventDefault(); setV(self._v + m, true); }
      else if (e.key === 'Home') { e.preventDefault(); setV(min, true); }
      else if (e.key === 'End') { e.preventDefault(); setV(max, true); }
    });
    dial.addEventListener('wheel', function (e) { if (document.activeElement !== dial) return; e.preventDefault(); setV(self._v + (e.deltaY < 0 ? step : -step), true); }, { passive: false });
    draw();
  }
}
register('ui-knob', UIKnob, knobCss);

/* ---------------- Pattern Lock 九宫格手势锁 ---------------- */
export const patternLockCss = `
ui-pattern-lock{display:inline-block}
.ui-pl{display:flex;flex-direction:column;align-items:center;gap:8px}
.ui-pl__pad{position:relative;width:min(var(--pl,220px),100%);aspect-ratio:1;display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);
  touch-action:none;user-select:none;border-radius:var(--ui-radius-lg);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line)}
.ui-pl__pad svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.ui-pl__pad polyline,.ui-pl__pad line{fill:none;stroke:var(--pc,var(--ui-brand));stroke-width:5;stroke-linecap:round;stroke-linejoin:round;opacity:.75}
.ui-pl__dot{display:grid;place-items:center;padding:0;border:0;background:none;cursor:pointer;border-radius:50%;z-index:1}
.ui-pl__dot:focus-visible{outline:3px solid var(--ui-ring);outline-offset:-10px}
.ui-pl__dot i{width:14px;height:14px;border-radius:50%;background:var(--ui-sub);transition:transform .2s var(--ui-spring),background .2s,box-shadow .2s}
.ui-pl__dot.on i{background:var(--pc,var(--ui-brand));transform:scale(1.25);box-shadow:0 0 0 9px color-mix(in srgb,var(--pc,var(--ui-brand)) 20%,transparent)}
.ui-pl__pad[data-s="ok"]{--pc:var(--ui-ok)}
.ui-pl__pad[data-s="err"]{--pc:var(--ui-danger);animation:ui-pl-shake .4s}
@keyframes ui-pl-shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.ui-pl__msg{margin:0;min-height:1.4em;font-size:13px;color:var(--ui-sub);text-align:center}
.ui-pl__msg[data-s="ok"]{color:var(--ui-ok)}
.ui-pl__msg[data-s="err"]{color:var(--ui-danger)}
.ui-pl__kb{display:flex;gap:6px}
`;
export class UIPatternLock extends UIElement {
  static props = { size: { default: '220' }, answer: { default: '' }, min: { default: '4' }, hint: { default: '连接至少 4 个点' } };
  template(p) {
    let dots = '';
    for (let i = 1; i <= 9; i++) dots += '<button type="button" class="ui-pl__dot" data-n="' + i + '" aria-label="第 ' + Math.ceil(i / 3) + ' 行第 ' + ((i - 1) % 3 + 1) + ' 个点"><i></i></button>';
    return '<div class="ui-pl ui-mo"><div class="ui-pl__pad" style="--pl:' + (Number(p.size) || 220) + 'px"><svg aria-hidden="true"><polyline points=""/><line/></svg>' + dots + '</div>' +
      '<p class="ui-pl__msg" aria-live="polite">' + esc(p.hint) + '</p><div class="ui-pl__kb"><button type="button" class="ui-btn ui-btn--sm ui-btn--text ok" disabled>确认</button><button type="button" class="ui-btn ui-btn--sm ui-btn--text rs" disabled>重画</button></div></div>';
  }
  mounted(p) {
    const self = this, pad = this.querySelector('.ui-pl__pad'), poly = pad.querySelector('polyline'), tail = pad.querySelector('line');
    const msg = this.querySelector('.ui-pl__msg'), okB = this.querySelector('.ok'), rsB = this.querySelector('.rs');
    const dots = Array.from(pad.querySelectorAll('.ui-pl__dot')), minN = Number(p.min) || 4;
    let seq = [], on = false, timer = 0;
    const center = function (n) { const r = dots[n - 1].getBoundingClientRect(), b = pad.getBoundingClientRect(); return [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2]; };
    const draw = function (tp) {
      poly.setAttribute('points', seq.map((n) => center(n).join(',')).join(' '));
      if (tp && seq.length) { const c = center(seq[seq.length - 1]); tail.setAttribute('x1', c[0]); tail.setAttribute('y1', c[1]); tail.setAttribute('x2', tp[0]); tail.setAttribute('y2', tp[1]); tail.style.display = ''; }
      else tail.style.display = 'none';
      okB.disabled = rsB.disabled = !seq.length;
    };
    const add = function (n) {
      if (seq.indexOf(n) >= 0) return;
      const last = seq[seq.length - 1];
      if (last) {
        const r1 = Math.ceil(last / 3), c1 = (last - 1) % 3, r2 = Math.ceil(n / 3), c2 = (n - 1) % 3;
        if ((r1 + r2) % 2 === 0 && (c1 + c2) % 2 === 0) { const mid = ((r1 + r2) / 2 - 1) * 3 + (c1 + c2) / 2 + 1; if (seq.indexOf(mid) < 0) { seq.push(mid); dots[mid - 1].classList.add('on'); } }
      }
      seq.push(n); dots[n - 1].classList.add('on');
      if (navigator.vibrate && on) try { navigator.vibrate(8); } catch (e) {}
    };
    const reset = function () { clearTimeout(timer); seq = []; dots.forEach((d) => d.classList.remove('on')); delete pad.dataset.s; delete msg.dataset.s; draw(); };
    const say = (s, t) => { msg.textContent = t; if (s) msg.dataset.s = s; else delete msg.dataset.s; if (s) pad.dataset.s = s; };
    const finish = function () {
      if (!seq.length) return;
      const code = seq.join('-');
      if (seq.length < minN) say('err', '至少连接 ' + minN + ' 个点，再试一次');
      else if (p.answer) {
        const ok = code === p.answer.replace(/\s/g, '');
        say(ok ? 'ok' : 'err', ok ? '✓ 解锁成功' : '图案不对，再试一次');
        emit(self, ok ? 'success' : 'fail', { pattern: code });
      } else { say('ok', '已记录图案（' + seq.length + ' 个点）'); }
      emit(self, 'complete', { pattern: code, points: seq.slice() });
      draw();
      timer = setTimeout(function () { reset(); say('', p.hint); }, reduced() ? 900 : 1400);
    };
    const hit = function (e) {
      for (let i = 0; i < 9; i++) { const r = dots[i].getBoundingClientRect(), rad = r.width * 0.34; if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < rad) return i + 1; }
      return 0;
    };
    pad.addEventListener('pointerdown', function (e) {
      const n = hit(e);
      if (!n) return;
      e.preventDefault(); reset(); say('', '…'); on = true; pad.setPointerCapture(e.pointerId); add(n); draw();
    });
    pad.addEventListener('pointermove', function (e) {
      if (!on) return;
      const n = hit(e); if (n) add(n);
      const b = pad.getBoundingClientRect(); draw([e.clientX - b.left, e.clientY - b.top]);
    });
    const up = function () { if (!on) return; on = false; draw(); finish(); };
    pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up);
    /* 键盘：Enter/空格逐个点选，再按「确认」 */
    pad.addEventListener('click', function (e) {
      const d = e.target.closest('.ui-pl__dot');
      if (!d || e.detail !== 0) return;
      if (pad.dataset.s) reset();
      add(+d.dataset.n); draw(); say('', '已选 ' + seq.length + ' 个点');
    });
    okB.addEventListener('click', finish);
    rsB.addEventListener('click', function () { reset(); say('', p.hint); });
    this.reset = function () { reset(); say('', p.hint); };
    draw();
  }
}
register('ui-pattern-lock', UIPatternLock, patternLockCss);

/* ---------------- Slide Verify 滑块验证 ---------------- */
const SCENE = 'radial-gradient(circle at 80% 26%,#fff7c2 0 12px,#fcd34d 13px 20px,transparent 21px),' +
  'radial-gradient(ellipse 34% 46% at 22% 100%,#166534 97%,transparent 100%),radial-gradient(ellipse 40% 52% at 70% 104%,#15803d 97%,transparent 100%),' +
  'radial-gradient(ellipse 70% 40% at 45% 118%,#3f6212 97%,transparent 100%),repeating-linear-gradient(45deg,rgba(255,255,255,.14) 0 6px,transparent 6px 14px),' +
  'linear-gradient(#38bdf8,#bae6fd 62%,#fef3c7)';
export const slideVerifyCss = `
ui-slide-verify{display:block;width:100%;max-width:320px}
.ui-sv{display:flex;flex-direction:column;gap:10px;--pz:44px}
.ui-sv__img{position:relative;height:150px;overflow:hidden;border-radius:var(--ui-radius);background:${SCENE}}
.ui-sv__hole,.ui-sv__pc{position:absolute;width:var(--pz);height:var(--pz);border-radius:9px}
.ui-sv__hole{background:rgba(0,0,0,.45);box-shadow:inset 0 0 0 2px rgba(255,255,255,.75),inset 0 4px 10px rgba(0,0,0,.4)}
.ui-sv__pc{left:0;background:${SCENE};box-shadow:0 0 0 2px #fff,0 4px 12px rgba(0,0,0,.45)}
.ui-sv__rf{position:absolute;right:6px;top:6px;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;font-size:15px;cursor:pointer}
.ui-sv__rf:focus-visible{outline:3px solid var(--ui-ring)}
.ui-sv__trk{position:relative;height:44px;border-radius:var(--ui-radius);background:var(--ui-panel-2);border:var(--ui-border-w) solid var(--ui-line);overflow:hidden;
  display:grid;place-items:center;font-size:13px;color:var(--ui-sub);user-select:none}
.ui-sv__fill{position:absolute;left:0;top:0;bottom:0;width:0;background:color-mix(in srgb,var(--ui-brand) 18%,transparent);border-right:1px solid var(--ui-brand)}
.ui-sv__h{position:absolute;left:0;top:0;width:44px;height:100%;display:grid;place-items:center;padding:0;border:0;border-radius:var(--ui-radius);
  background:var(--ui-panel);box-shadow:var(--ui-shadow-sm);color:var(--ui-text);font-size:16px;cursor:grab;touch-action:none}
.ui-sv__h:focus-visible{outline:3px solid var(--ui-ring);outline-offset:-3px}
.ui-sv.back .ui-sv__h,.ui-sv.back .ui-sv__fill,.ui-sv.back .ui-sv__pc{transition:left .35s var(--ui-ease),width .35s var(--ui-ease)}
.ui-sv[data-s="ok"] .ui-sv__trk{color:var(--ui-ok);background:var(--ui-ok-soft);border-color:var(--ui-ok)}
.ui-sv[data-s="ok"] .ui-sv__fill{background:transparent;border:0}
.ui-sv[data-s="ok"] .ui-sv__h{background:var(--ui-ok);color:var(--ui-on-color);cursor:default}
.ui-sv[data-s="ok"] .ui-sv__hole{opacity:0}
.ui-sv[data-s="err"] .ui-sv__trk{animation:ui-pl-shake .4s}
@keyframes ui-pl-shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
`;
export class UISlideVerify extends UIElement {
  static props = { mode: { default: 'slider' }, text: { default: '' } };
  template(p) {
    const puzzle = p.mode === 'puzzle';
    const text = p.text || (puzzle ? '拖动滑块，把拼图移到缺口处' : '按住滑块，拖到最右边');
    return '<div class="ui-sv ui-mo">' + (puzzle ? '<div class="ui-sv__img"><span class="ui-sv__hole"></span><span class="ui-sv__pc"></span><button type="button" class="ui-sv__rf" aria-label="换一张">↻</button></div>' : '') +
      '<div class="ui-sv__trk"><span class="ui-sv__fill"></span><span class="ui-sv__tx">' + esc(text) + '</span>' +
      '<button type="button" class="ui-sv__h" role="slider" aria-label="' + esc(text) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">→</button></div><span class="ui-sr" aria-live="assertive"></span></div>';
  }
  mounted(p) {
    const self = this, root = this.querySelector('.ui-sv'), trk = root.querySelector('.ui-sv__trk'), h = root.querySelector('.ui-sv__h'), fill = root.querySelector('.ui-sv__fill');
    const img = root.querySelector('.ui-sv__img'), pc = root.querySelector('.ui-sv__pc'), hole = root.querySelector('.ui-sv__hole'), tx = root.querySelector('.ui-sv__tx'), live = root.querySelector('.ui-sr');
    const puzzle = !!img, orig = tx.textContent;
    let x = 0, tX = 0, tY = 0, done = false;
    const maxX = () => trk.clientWidth - h.offsetWidth;
    const layout = function () {
      if (!img) return;
      const W = img.clientWidth, H = img.clientHeight;
      pc.style.backgroundSize = W + 'px ' + H + 'px';
      pc.style.top = tY + 'px'; hole.style.left = tX + 'px'; hole.style.top = tY + 'px';
      pc.style.backgroundPosition = (-tX) + 'px ' + (-tY) + 'px';
    };
    const shuffle = function () {
      if (!img) return;
      const W = img.clientWidth || 300, H = img.clientHeight || 150;
      tX = Math.round(W * 0.38 + Math.random() * (W * 0.62 - 54)); tY = Math.round(12 + Math.random() * (H - 68));
      layout();
    };
    const move = function (v) {
      x = clamp(v, 0, maxX());
      h.style.left = x + 'px'; fill.style.width = (x + h.offsetWidth / 2) + 'px';
      if (pc) pc.style.left = x + 'px';
      h.setAttribute('aria-valuenow', Math.round(x / (maxX() || 1) * 100));
    };
    const back = function () { root.classList.add('back'); move(0); fill.style.width = '0'; setTimeout(() => root.classList.remove('back'), 360); };
    const judge = function () {
      if (done) return;
      const ok = puzzle ? Math.abs(x - tX) <= 6 : x >= maxX() - 2;
      if (ok) {
        done = true; root.dataset.s = 'ok'; h.textContent = '✓'; h.setAttribute('aria-disabled', 'true');
        tx.textContent = '验证通过'; live.textContent = '验证通过';
        emit(self, 'success', { offset: Math.round(x) });
      } else {
        root.dataset.s = 'err'; live.textContent = puzzle ? '没有对准缺口，请重试' : '请拖到最右边';
        emit(self, 'fail', { offset: Math.round(x) });
        setTimeout(function () { delete root.dataset.s; }, 420);
        back();
      }
    };
    let on = false, sx = 0, ox = 0;
    h.addEventListener('pointerdown', function (e) { if (done) return; on = true; sx = e.clientX; ox = x; h.setPointerCapture(e.pointerId); root.classList.remove('back'); });
    h.addEventListener('pointermove', function (e) { if (on) move(ox + e.clientX - sx); });
    const end = function () { if (on) { on = false; judge(); } };
    h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
    h.addEventListener('keydown', function (e) {
      if (done) return;
      const d = { ArrowRight: 4, ArrowLeft: -4, ArrowUp: 4, ArrowDown: -4, PageUp: 30, PageDown: -30 }[e.key];
      if (d) { e.preventDefault(); move(x + d); if (!puzzle && x >= maxX() - 2) judge(); }
      else if (e.key === 'End' && !puzzle) { e.preventDefault(); move(maxX()); judge(); }
      else if (e.key === 'Enter' && puzzle) { e.preventDefault(); judge(); }
    });
    this.reset = function () { done = false; delete root.dataset.s; h.textContent = '→'; h.removeAttribute('aria-disabled'); tx.textContent = orig; live.textContent = ''; move(0); fill.style.width = '0'; shuffle(); };
    if (img) root.querySelector('.ui-sv__rf').addEventListener('click', this.reset);
    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver(function () { if (!tX) shuffle(); else layout(); if (!done) move(x); else move(maxX()); });
    this._ro.observe(trk);
  }
  disconnectedCallback() { if (this._ro) this._ro.disconnect(); }
}
register('ui-slide-verify', UISlideVerify, slideVerifyCss);

/* ---------------- Emoji Rate 表情评分 ---------------- */
export const emojiRateCss = `
ui-emoji-rate{display:inline-block}
.ui-er{display:flex;flex-direction:column;align-items:center;gap:8px}
.ui-er__q{font-size:14px;font-weight:600;color:var(--ui-text)}
.ui-er__row{display:flex;gap:6px}
.ui-er__f{width:46px;height:46px;padding:0;border:0;border-radius:50%;background:none;font-size:30px;line-height:1;cursor:pointer;
  filter:grayscale(1);transform:scale(.9);transition:transform .25s var(--ui-spring),filter .2s,background .2s}
.ui-er__f:hover,.ui-er__f:focus-visible{filter:none;transform:scale(1.12)}
.ui-er__f:focus-visible{outline:3px solid var(--ui-ring);outline-offset:1px}
.ui-er__f[aria-checked="true"]{filter:none;transform:scale(1.28);background:var(--ui-brand-soft);animation:ui-er-pop .4s var(--ui-spring)}
@keyframes ui-er-pop{40%{transform:scale(1.5) rotate(-8deg)}}
.ui-er__t{min-height:1.4em;font-size:13px;color:var(--ui-sub)}
.ui-er__t b{color:var(--ui-text)}
`;
export class UIEmojiRate extends UIElement {
  static props = { label: { default: '这次体验如何？' }, value: { default: '' }, labels: { default: '很差,不太好,一般,不错,超喜欢' }, faces: { default: '😡,😕,😐,🙂,😍' } };
  template(p) {
    const faces = splitList(p.faces), labels = splitList(p.labels), v = Number(p.value) || 0;
    this._v = v;
    return '<div class="ui-er ui-mo" role="radiogroup" aria-label="' + esc(p.label) + '"><div class="ui-er__q" aria-hidden="true">' + esc(p.label) + '</div><div class="ui-er__row">' +
      faces.map((f, i) => '<button type="button" class="ui-er__f" role="radio" data-v="' + (i + 1) + '" aria-checked="' + (v === i + 1) + '" tabindex="' + ((v ? v === i + 1 : i === 0) ? 0 : -1) + '" aria-label="' + esc(labels[i] || String(i + 1)) + '">' + esc(f) + '</button>').join('') +
      '</div><div class="ui-er__t" aria-hidden="true">' + (v ? '<b>' + esc(labels[v - 1] || '') + '</b>' : '点一个表情') + '</div></div>';
  }
  mounted(p) {
    const self = this, labels = splitList(p.labels), btns = Array.from(this.querySelectorAll('.ui-er__f')), t = this.querySelector('.ui-er__t');
    const show = (k, strong) => { t.innerHTML = k ? (strong ? '<b>' + esc(labels[k - 1] || '') + '</b>' : esc(labels[k - 1] || '')) : '点一个表情'; };
    const pick = function (k, focus) {
      self._v = k;
      btns.forEach(function (b, i) { const on = i + 1 === k; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      show(k, true);
      emit(self, 'change', { value: k, label: labels[k - 1] || '' });
    };
    Object.defineProperty(this, 'value', { configurable: true, get: () => self._v, set: (v) => pick(Number(v) || 0) });
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { pick(i + 1); });
      b.addEventListener('mouseenter', function () { show(i + 1, false); });
      b.addEventListener('mouseleave', function () { show(self._v, true); });
      b.addEventListener('keydown', function (e) {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (d) { e.preventDefault(); pick((i + d + btns.length) % btns.length + 1, true); }
      });
    });
  }
}
register('ui-emoji-rate', UIEmojiRate, emojiRateCss);

/* ---------------- Hold Button 长按确认 ---------------- */
export const holdButtonCss = `
ui-hold-button{display:inline-block}
.ui-hold-w{display:inline-flex;flex-direction:column;align-items:center;gap:5px}
.ui-hold{position:relative;overflow:hidden;isolation:isolate;height:var(--ui-ctl-h);padding:0 20px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;
  user-select:none;-webkit-user-select:none;touch-action:none;
  color:var(--ht,var(--hc));background:var(--ui-panel);border:var(--ui-border-w) solid var(--hc);border-radius:var(--ui-radius);transition:transform .15s var(--ui-ease)}
.ui-hold:focus-visible{outline:3px solid var(--ui-ring);outline-offset:2px}
.ui-hold__fill{position:absolute;inset:0;z-index:-1;transform-origin:left;transform:scaleX(0);background:color-mix(in srgb,var(--hc) 20%,var(--ui-panel));
  transition:transform .3s var(--ui-ease)}
.ui-hold.holding{transform:scale(.97)}
.ui-hold.holding .ui-hold__fill{transform:scaleX(1);transition:transform var(--d) linear}
.ui-hold.done{background:var(--hc);color:var(--hd,var(--ui-on-color));cursor:default}
.ui-hold.done .ui-hold__fill{transform:scaleX(0);transition:none}
.ui-hold-w small{font-size:11.5px;color:var(--ui-sub)}
`;
export class UIHoldButton extends UIElement {
  static props = { label: { default: '长按删除' }, done: { default: '已删除' }, duration: { default: '1500' }, variant: { default: 'danger' }, reset: { default: '2400' } };
  template(p) {
    const d = clamp(Number(p.duration) || 1500, 400, 6000), id = 'ui-hold-' + (++uid);
    const c = { danger: 'var(--ui-danger)', primary: 'var(--ui-brand)', success: 'var(--ui-ok)' }[p.variant] || 'var(--ui-danger)';
    /* 品牌色在部分风格里是浅色（如 Brutal 的黄），不能直接当文字色 */
    const ink = p.variant === 'primary' ? ';--ht:var(--ui-text);--hd:var(--ui-brand-ink)' : p.variant === 'success' ? ';--ht:var(--ui-text)' : '';
    return '<span class="ui-hold-w"><button type="button" class="ui-hold" style="--hc:' + c + ink + ';--d:' + d + 'ms" aria-describedby="' + id + '"><span class="ui-hold__fill" aria-hidden="true"></span><span class="ui-hold__t">' + esc(p.label) + '</span></button>' +
      '<small id="' + id + '">按住 ' + (d / 1000) + ' 秒确认</small><span class="ui-sr" aria-live="assertive"></span></span>';
  }
  mounted(p) {
    const self = this, b = this.querySelector('.ui-hold'), t = b.querySelector('.ui-hold__t'), live = this.querySelector('.ui-sr');
    const d = clamp(Number(p.duration) || 1500, 400, 6000);
    let timer = 0;
    const start = function () {
      if (b.classList.contains('done') || timer) return;
      b.classList.add('holding');
      emit(self, 'holdstart', {});
      timer = setTimeout(function () {
        timer = 0; b.classList.remove('holding'); b.classList.add('done'); t.textContent = p.done; live.textContent = p.done;
        if (navigator.vibrate) try { navigator.vibrate(20); } catch (e) {}
        emit(self, 'confirm', {});
        const r = Number(p.reset);
        if (r > 0) setTimeout(function () { b.classList.remove('done'); t.textContent = p.label; live.textContent = ''; }, r);
      }, d);
    };
    const cancel = function () { if (!timer) return; clearTimeout(timer); timer = 0; b.classList.remove('holding'); emit(self, 'holdcancel', {}); };
    b.addEventListener('pointerdown', function (e) { if (e.button) return; b.setPointerCapture(e.pointerId); start(); });
    b.addEventListener('pointerup', cancel); b.addEventListener('pointercancel', cancel); b.addEventListener('lostpointercapture', cancel);
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    b.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } else if (e.key === ' ' || e.key === 'Enter') e.preventDefault(); });
    b.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') cancel(); });
    b.addEventListener('blur', cancel);
  }
}
register('ui-hold-button', UIHoldButton, holdButtonCss);

/* ---------------- Sortable 拖拽排序 ---------------- */
export const sortableCss = `
ui-sortable{display:block;width:100%;max-width:400px}
.ui-sort{position:relative;list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.ui-sort__i{position:relative;display:flex;align-items:center;gap:10px;padding:8px 12px 8px 4px;font-size:13.5px;color:var(--ui-text);
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);box-shadow:var(--ui-shadow-sm)}
.ui-sort__i.drag{z-index:2;box-shadow:var(--ui-shadow),0 0 0 2px var(--ui-brand);cursor:grabbing}
.ui-sort__i.grab{box-shadow:0 0 0 2px var(--ui-brand)}
.ui-sort__h{display:grid;place-items:center;width:26px;height:28px;padding:0;border:0;border-radius:6px;background:none;color:var(--ui-sub);cursor:grab;touch-action:none;font-size:14px;letter-spacing:-2px}
.ui-sort__h:hover{background:var(--ui-panel-2)}
.ui-sort__h:focus-visible{outline:3px solid var(--ui-ring)}
.ui-sort__n{display:grid;place-items:center;width:22px;height:22px;flex:none;border-radius:50%;font-size:11.5px;font-weight:700;background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-sort-hint{margin:8px 0 0;font-size:12px;color:var(--ui-sub)}
`;
export class UISortable extends UIElement {
  static props = { items: { default: '需求评审,设计稿走查,前端开发,联调测试,灰度发布' } };
  template(p) {
    const id = 'ui-sort-' + (++uid);
    this._items = this._items && this._src === p.items ? this._items : splitList(p.items);
    this._src = p.items;
    return '<div><ul class="ui-sort" aria-describedby="' + id + '">' + this._items.map((t, i) => '<li class="ui-sort__i"><button type="button" class="ui-sort__h" aria-label="移动：' + esc(t) + '">⋮⋮</button>' +
      '<span class="ui-sort__n" aria-hidden="true">' + (i + 1) + '</span><span class="ui-sort__t">' + esc(t) + '</span></li>').join('') + '</ul>' +
      '<p class="ui-sort-hint" id="' + id + '">拖动 ⋮⋮ 排序；键盘：空格拿起，↑↓ 移动，空格放下</p><span class="ui-sr" aria-live="assertive"></span></div>';
  }
  mounted() {
    const self = this, ul = this.querySelector('.ui-sort'), live = this.querySelector('.ui-sr');
    const lis = () => Array.from(ul.children);
    const sync = function (fire) {
      lis().forEach((li, i) => { li.querySelector('.ui-sort__n').textContent = i + 1; });
      self._items = lis().map((li) => li.querySelector('.ui-sort__t').textContent);
      if (fire) emit(self, 'change', { order: self._items.slice() });
    };
    const flip = function (fn, skip) {
      const before = new Map(lis().filter((l) => l !== skip).map((l) => [l, l.getBoundingClientRect().top]));
      fn();
      if (reduced()) return;
      before.forEach(function (top, l) {
        const dy = top - l.getBoundingClientRect().top;
        if (!dy) return;
        l.style.transition = 'none'; l.style.transform = 'translateY(' + dy + 'px)';
        l.offsetHeight; l.style.transition = 'transform .2s var(--ui-ease)'; l.style.transform = '';
      });
    };
    let drag = null, sy = 0, sTop = 0;
    ul.addEventListener('pointerdown', function (e) {
      const h = e.target.closest('.ui-sort__h');
      if (!h || e.button) return;
      e.preventDefault();
      drag = h.parentElement; sy = e.clientY; sTop = drag.offsetTop;
      drag.classList.add('drag'); h.setPointerCapture(e.pointerId);
    });
    ul.addEventListener('pointermove', function (e) {
      if (!drag) return;
      const others = lis().filter((l) => l !== drag);
      const mid = drag.getBoundingClientRect().top + drag.offsetHeight / 2;
      let target = null;
      for (const l of others) { const r = l.getBoundingClientRect(); if (mid < r.top + r.height / 2) { target = l; break; } }
      if (target !== drag.nextElementSibling) flip(() => ul.insertBefore(drag, target), drag);
      drag.style.transition = 'none';
      drag.style.transform = 'translateY(' + (e.clientY - sy - (drag.offsetTop - sTop)) + 'px)';
    });
    const end = function () {
      if (!drag) return;
      const d = drag; drag = null;
      d.classList.remove('drag'); d.style.transition = 'transform .2s var(--ui-ease)'; d.style.transform = '';
      sync(true);
    };
    ul.addEventListener('pointerup', end); ul.addEventListener('pointercancel', end);
    ul.addEventListener('keydown', function (e) {
      const h = e.target.closest('.ui-sort__h');
      if (!h) return;
      const li = h.parentElement, name = li.querySelector('.ui-sort__t').textContent;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const on = li.classList.toggle('grab');
        h.setAttribute('aria-pressed', String(on));
        live.textContent = on ? '已拿起「' + name + '」，当前第 ' + (lis().indexOf(li) + 1) + ' 位，用上下方向键移动' : '已放下「' + name + '」，第 ' + (lis().indexOf(li) + 1) + ' 位';
        if (!on) sync(true);
      } else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && li.classList.contains('grab')) {
        e.preventDefault();
        const sib = e.key === 'ArrowUp' ? li.previousElementSibling : li.nextElementSibling;
        if (!sib) return;
        flip(() => ul.insertBefore(li, e.key === 'ArrowUp' ? sib : sib.nextElementSibling));
        h.focus(); sync(false);
        live.textContent = '第 ' + (lis().indexOf(li) + 1) + ' 位';
      } else if (e.key === 'Escape' && li.classList.contains('grab')) {
        li.classList.remove('grab'); h.setAttribute('aria-pressed', 'false'); sync(true); live.textContent = '已放下「' + name + '」';
      }
    });
  }
}
register('ui-sortable', UISortable, sortableCss);

/* ---------------- Reactions 表情回应 ---------------- */
const PICK = ['👍', '❤️', '😂', '🎉', '😮', '😢', '🔥', '👀', '🚀', '🙏', '💯', '🤔'];
export const reactionsCss = `
ui-reactions{display:block}
.ui-react{position:relative;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.ui-react__c,.ui-react__add > button{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;font:inherit;font-size:13px;cursor:pointer;
  color:var(--ui-text);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-pill);transition:transform .15s var(--ui-ease),border-color .15s}
.ui-react__c:hover,.ui-react__add > button:hover{border-color:var(--ui-brand)}
.ui-react__c:focus-visible,.ui-react__add > button:focus-visible,.ui-react__pick button:focus-visible{outline:3px solid var(--ui-ring);outline-offset:1px}
.ui-react__c[aria-pressed="true"]{background:var(--ui-brand-soft);border-color:var(--ui-brand)}
.ui-react__c b{font-weight:600;font-variant-numeric:tabular-nums}
.ui-react__c.pop{animation:ui-react-pop .35s var(--ui-spring)}
@keyframes ui-react-pop{50%{transform:scale(1.18)}}
.ui-react__add{position:relative}
.ui-react__add > button{color:var(--ui-sub)}
.ui-react__pick{position:absolute;left:0;top:calc(100% + 6px);z-index:20;display:grid;grid-template-columns:repeat(6,34px);gap:2px;padding:6px;
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);box-shadow:var(--ui-shadow);animation:ui-react-in .18s var(--ui-ease)}
.ui-react__pick[hidden]{display:none}
@keyframes ui-react-in{from{opacity:0;transform:translateY(-4px) scale(.96)}}
.ui-react__pick button{width:34px;height:34px;padding:0;border:0;border-radius:8px;background:none;font-size:19px;cursor:pointer;transition:transform .15s var(--ui-spring)}
.ui-react__pick button:hover{background:var(--ui-panel-2);transform:scale(1.2)}
`;
export class UIReactions extends UIElement {
  static props = { items: { default: '👍:12,🎉:5,❤️:8,😂:3' }, mine: { default: '' } };
  template(p) {
    const mine = splitList(p.mine);
    this._list = splitList(p.items).map(function (s) { const k = s.lastIndexOf(':'); const e = k > 0 ? s.slice(0, k) : s; return { e: e, n: Math.max(1, Number(s.slice(k + 1)) || 1), me: mine.indexOf(e) >= 0 }; });
    const id = 'ui-react-' + (++uid);
    return '<div class="ui-react ui-mo" role="group" aria-label="表情回应"><span class="ui-react__list" style="display:contents"></span>' +
      '<span class="ui-react__add"><button type="button" aria-label="添加表情回应" aria-haspopup="true" aria-expanded="false" aria-controls="' + id + '">😀＋</button>' +
      '<div class="ui-react__pick" id="' + id + '" role="group" aria-label="选择表情" hidden>' + PICK.map((e) => '<button type="button" aria-label="' + e + '">' + e + '</button>').join('') + '</div></span></div>';
  }
  mounted() {
    const self = this, box = this.querySelector('.ui-react__list'), add = this.querySelector('.ui-react__add > button'), pick = this.querySelector('.ui-react__pick');
    const draw = function (pop) {
      box.innerHTML = self._list.map((r) => '<button type="button" class="ui-react__c' + (r.e === pop ? ' pop' : '') + '" data-e="' + esc(r.e) + '" aria-pressed="' + r.me + '" aria-label="' + esc(r.e) + ' ' + r.n + ' 人' + (r.me ? '，含你' : '') + '"><span aria-hidden="true">' + esc(r.e) + '</span><b aria-hidden="true">' + r.n + '</b></button>').join('');
    };
    const changed = () => emit(self, 'change', { reactions: self._list.map((r) => ({ emoji: r.e, count: r.n, mine: r.me })) });
    const toggle = function (e, forceOn) {
      let r = self._list.find((x) => x.e === e);
      if (!r) { r = { e: e, n: 0, me: false }; self._list.push(r); }
      if (forceOn && r.me) { draw(e); return; }
      r.me = !r.me; r.n += r.me ? 1 : -1;
      if (r.n <= 0) self._list.splice(self._list.indexOf(r), 1);
      draw(r.n > 0 ? e : null); changed();
      const again = box.querySelector('[data-e="' + e + '"]'); return again;
    };
    box.addEventListener('click', function (e) { const c = e.target.closest('.ui-react__c'); if (c) { const n = toggle(c.dataset.e); if (n) n.focus(); else add.focus(); } });
    const outside = function (e) { if (!self.querySelector('.ui-react__add').contains(e.target)) close(); };
    const open = function () { pick.hidden = false; add.setAttribute('aria-expanded', 'true'); pick.querySelector('button').focus(); document.addEventListener('pointerdown', outside, true); };
    const close = function (refocus) { if (pick.hidden) return; pick.hidden = true; add.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', outside, true); if (refocus) add.focus(); };
    this._close = close;
    add.addEventListener('click', function () { if (pick.hidden) open(); else close(); });
    pick.addEventListener('click', function (e) { const b = e.target.closest('button'); if (!b) return; toggle(b.textContent, true); close(true); });
    pick.addEventListener('keydown', function (e) {
      const bs = Array.from(pick.querySelectorAll('button')), i = bs.indexOf(document.activeElement);
      const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 6, ArrowUp: -6 }[e.key];
      if (d) { e.preventDefault(); bs[(i + d + bs.length) % bs.length].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (e.key === 'Tab') close();
    });
    draw();
  }
  disconnectedCallback() { if (this._close) this._close(); }
}
register('ui-reactions', UIReactions, reactionsCss);

/* ---------------- Radar 雷达图 ---------------- */
const RADAR_C = ['var(--ui-brand)', '#f97316', 'var(--ui-ok)', '#a855f7'];
export const radarCss = `
ui-radar{display:block;width:100%;max-width:340px}
.ui-radar svg{display:block;width:100%;height:auto;overflow:visible}
.ui-radar__grid{fill:none;stroke:var(--ui-line)}
.ui-radar__ring:nth-child(odd){fill:color-mix(in srgb,var(--ui-panel-2) 60%,transparent)}
.ui-radar__ax{stroke:var(--ui-line)}
.ui-radar__lb{font-size:12px;fill:var(--ui-sub)}
.ui-radar__s{transform-origin:150px 150px;transform:scale(0);transition:transform .9s var(--ui-spring)}
.ui-radar[data-in] .ui-radar__s{transform:scale(1)}
.ui-radar__s polygon{stroke-width:2;stroke-linejoin:round}
.ui-radar__s circle{stroke:var(--ui-panel);stroke-width:1.5}
.ui-radar__lg{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 14px;margin-top:4px;font-size:12px;color:var(--ui-sub)}
.ui-radar__lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
`;
export class UIRadar extends UIElement {
  static props = { labels: { default: '速度,力量,技巧,耐力,智力,团队' }, values: { default: '' }, series: { default: '' }, max: { default: '100' }, label: { default: '雷达图' } };
  template(p) {
    const L = splitList(p.labels), n = L.length;
    if (n < 3) return '<div style="font-size:12.5px;color:var(--ui-sub)">labels 至少需要 3 个维度</div>';
    let S = [];
    try { const v = JSON.parse(p.series || 'null'); if (Array.isArray(v)) S = v; } catch (e) { /* 忽略 */ }
    if (!S.length) S = [{ name: '', values: splitList(p.values || '80,65,90,70,85,60').map(Number) }];
    const max = Number(p.max) || 100, R = 100, cx = 150, cy = 150;
    const pt = (i, r) => { const a = (i / n) * Math.PI * 2; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
    let grid = '';
    for (let k = 4; k >= 1; k--) grid += '<polygon class="ui-radar__grid ui-radar__ring" points="' + L.map((_, i) => pt(i, R * k / 4).map((x) => x.toFixed(1)).join(',')).join(' ') + '"/>';
    const axes = L.map((_, i) => { const q = pt(i, R); return '<line class="ui-radar__ax" x1="' + cx + '" y1="' + cy + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '"/>'; }).join('');
    const labs = L.map((t, i) => {
      const q = pt(i, R + 18), anc = Math.abs(q[0] - cx) < 4 ? 'middle' : q[0] > cx ? 'start' : 'end';
      return '<text class="ui-radar__lb" x="' + q[0].toFixed(1) + '" y="' + (q[1] + 4).toFixed(1) + '" text-anchor="' + anc + '">' + esc(t) + '</text>';
    }).join('');
    const series = S.map((s, k) => {
      const c = s.color || RADAR_C[k % RADAR_C.length];
      const pts = L.map((_, i) => pt(i, R * clamp(Number((s.values || [])[i]) || 0, 0, max) / max));
      return '<g class="ui-radar__s" style="transition-delay:' + (k * 0.12) + 's"><polygon points="' + pts.map((q) => q.map((x) => x.toFixed(1)).join(',')).join(' ') + '" style="fill:color-mix(in srgb,' + c + ' 20%,transparent);stroke:' + c + '"/>' +
        pts.map((q, i) => '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="3.5" style="fill:' + c + '"><title>' + esc((s.name ? s.name + ' · ' : '') + L[i] + '：' + ((s.values || [])[i] ?? 0)) + '</title></circle>').join('') + '</g>';
    }).join('');
    const desc = S.map((s) => (s.name ? s.name + '：' : '') + L.map((t, i) => t + ' ' + ((s.values || [])[i] ?? 0)).join('，')).join('；');
    return '<div class="ui-radar ui-mo"><svg viewBox="0 0 300 300" role="img" aria-label="' + esc(p.label + '。' + desc) + '">' + grid + axes + series + labs + '</svg>' +
      (S.length > 1 ? '<div class="ui-radar__lg" aria-hidden="true">' + S.map((s, k) => '<span><i style="background:' + (s.color || RADAR_C[k % RADAR_C.length]) + '"></i>' + esc(s.name || '系列 ' + (k + 1)) + '</span>').join('') + '</div>' : '') + '</div>';
  }
  mounted() {
    const box = this.querySelector('.ui-radar');
    if (!box) return;
    if (reduced()) { box.dataset.in = ''; return; }
    onVisible(box, function () { requestAnimationFrame(function () { box.dataset.in = ''; }); });
  }
}
register('ui-radar', UIRadar, radarCss);

/* ---------------- Word Cloud 词云 ---------------- */
export const wordCloudCss = `
ui-word-cloud{display:block;width:100%}
.ui-wc{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:4px 12px;margin:0;padding:12px 8px;list-style:none;line-height:1.1}
.ui-wc li{display:inline-block;font-weight:var(--fw);font-size:var(--fs);color:var(--wc);opacity:0;transform:scale(.6);
  transition:opacity .5s var(--ui-ease),transform .6s var(--ui-spring);transition-delay:var(--dl)}
.ui-wc li.v{writing-mode:vertical-rl;letter-spacing:.08em}
.ui-wc[data-in] li{opacity:1;transform:none}
.ui-wc button{all:unset;cursor:pointer;border-radius:4px;transition:transform .2s var(--ui-spring)}
.ui-wc button:hover{transform:scale(1.12)}
.ui-wc button:focus-visible{outline:2px solid var(--ui-ring);outline-offset:2px}
`;
export class UIWordCloud extends UIElement {
  static props = { words: { default: '设计系统:10,组件:9,无障碍:7,动效:8,主题:6,Token:7,响应式:6,暗色模式:5,Web Components:8,可访问性:4,栅格:3,排版:5,色彩:6,图标:4,交互:7,原型:3,一致性:5,性能:4,对比度:3,微交互:5' }, min: { default: '13' }, max: { default: '36' }, clickable: { type: 'boolean' }, label: { default: '词云' } };
  template(p) {
    const W = splitList(p.words).map((s) => { const k = s.lastIndexOf(':'); return k > 0 ? [s.slice(0, k), Number(s.slice(k + 1)) || 1] : [s, 1]; });
    if (!W.length) return '<div></div>';
    const sorted = W.slice().sort((a, b) => b[1] - a[1]);
    const lo = sorted[sorted.length - 1][1], hi = sorted[0][1];
    const order = [];
    sorted.forEach((w, i) => { if (i % 2) order.push(w); else order.unshift(w); });
    const cols = ['var(--ui-brand)', 'var(--ui-text)', 'var(--ui-sub)', 'color-mix(in srgb,var(--ui-brand) 70%,var(--ui-text))'];
    const mn = Number(p.min) || 13, mx = Number(p.max) || 36;
    return '<ul class="ui-wc ui-mo" aria-label="' + esc(p.label) + '">' + order.map(function (w, i) {
      const t = hi === lo ? 1 : (w[1] - lo) / (hi - lo), fs = Math.round(mn + t * (mx - mn));
      const v = t < 0.35 && i % 4 === 1;
      const inner = p.clickable ? '<button type="button" data-w="' + esc(w[0]) + '">' + esc(w[0]) + '</button>' : esc(w[0]);
      return '<li' + (v ? ' class="v"' : '') + ' title="' + esc(w[0] + '：' + w[1]) + '" style="--fs:' + fs + 'px;--fw:' + (t > 0.6 ? 800 : t > 0.3 ? 600 : 500) + ';--wc:' + cols[(i * 3) % cols.length] + ';--dl:' + (Math.abs(i - order.length / 2) * 0.04).toFixed(2) + 's">' + inner + '</li>';
    }).join('') + '</ul>';
  }
  mounted() {
    const self = this, ul = this.querySelector('.ui-wc');
    if (!ul) return;
    ul.addEventListener('click', function (e) { const b = e.target.closest('button[data-w]'); if (b) emit(self, 'select', { word: b.dataset.w }); });
    if (reduced()) { ul.dataset.in = ''; return; }
    onVisible(ul, function () { requestAnimationFrame(function () { ul.dataset.in = ''; }); });
  }
}
register('ui-word-cloud', UIWordCloud, wordCloudCss);
