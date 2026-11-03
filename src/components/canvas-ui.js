/* =========================================================
   JS 绘制（Canvas）界面组件：整块界面都画在 <canvas> 上
          ui-cv-dash  —— 数据大屏（点位地图 + 实时曲线 + 告警处理）
          ui-cv-game  —— 游戏主菜单 / HUD（菜单 → 游戏 → 暂停 → 结束 的状态机）
          ui-cv-board —— 白板画布（平移缩放、拖拽便签、连线、编辑）
   共同约定：
   1. 颜色、圆角、字体全部从 var(--ui-*) 读取，切换 data-style / data-theme 自动重画
   2. 按设备像素比绘制，容器变宽变窄（ResizeObserver）自动重新布局
   3. 画布可聚焦，键盘能完成全部操作；关键变化写进视觉隐藏的 aria-live 区域
   4. 离开视口 / 标签页隐藏时停止动画循环；减少动效时不做装饰性动画
   ========================================================= */
import { register } from './base.js';
import { reduced, loop } from '../lib/motion.js';

const KEYS = ['bg', 'panel', 'panel-2', 'text', 'sub', 'line', 'brand', 'brand-ink', 'brand-soft', 'ok', 'ok-soft', 'warn', 'warn-soft', 'danger', 'danger-soft', 'radius', 'radius-sm', 'font', 'mono'];
const probe = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;

/** 任意 CSS 颜色 → rgba 字符串（canvas 不认识 color-mix，所以自己算透明度） */
export function alpha(color, a) {
  if (!probe) return color;
  probe.fillStyle = '#000';
  probe.fillStyle = color;
  const c = probe.fillStyle;
  let r, g, b, a0 = 1;
  if (c[0] === '#') { r = parseInt(c.slice(1, 3), 16); g = parseInt(c.slice(3, 5), 16); b = parseInt(c.slice(5, 7), 16); }
  else { const m = c.match(/[\d.]+/g) || [0, 0, 0, 1]; r = m[0]; g = m[1]; b = m[2]; a0 = m[3] === undefined ? 1 : +m[3]; }
  return 'rgba(' + r + ',' + g + ',' + b + ',' + (a0 * a) + ')';
}

function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const baseCss = `
ui-cv-dash,ui-cv-game,ui-cv-board{display:block;position:relative;width:100%;min-width:0}
.ui-cv{display:block;width:100%;touch-action:none;outline:none;border-radius:var(--ui-radius-lg)}
.ui-cv:focus-visible{box-shadow:0 0 0 2px var(--ui-bg),0 0 0 4px var(--ui-brand)}
.ui-cv-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

/** 公共基类：建画布、读变量、监听尺寸 / 主题变化、键盘与指针事件分发 */
class CanvasUI extends HTMLElement {
  static props = {};
  connectedCallback() {
    if (this._cv) return;
    const self = this;
    this._cv = document.createElement('canvas');
    this._cv.className = 'ui-cv';
    this._cv.tabIndex = 0;
    this._sr = document.createElement('div');
    this._sr.className = 'ui-cv-sr';
    this._sr.setAttribute('aria-live', 'polite');
    this.prepend(this._sr);
    this.prepend(this._cv);
    this.ctx = this._cv.getContext('2d');
    this.W = 0; this.H = 0;
    this.setup && this.setup();
    this._ro = new ResizeObserver(function () { self._resize(); });
    this._ro.observe(this);
    /* 风格 / 明暗切换：html 或最近的 data-style 容器属性变化时重读变量 */
    this._mo = new MutationObserver(function () { self._tk = null; self.draw(); });
    this._mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-style', 'data-theme', 'data-motion'] });
    const scope = this.parentElement && this.parentElement.closest('[data-style],[data-theme]');
    if (scope && scope !== document.documentElement) this._mo.observe(scope, { attributes: true, attributeFilter: ['data-style', 'data-theme'] });
    const cv = this._cv;
    const pt = function (e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.addEventListener('pointerdown', function (e) { cv.focus({ preventScroll: true }); if (self.down) { cv.setPointerCapture(e.pointerId); self.down(pt(e), e); } });
    cv.addEventListener('pointermove', function (e) { if (self.move) self.move(pt(e), e); });
    cv.addEventListener('pointerup', function (e) { if (self.up) self.up(pt(e), e); });
    cv.addEventListener('pointerleave', function (e) { if (self.leave) self.leave(pt(e), e); });
    cv.addEventListener('keydown', function (e) { if (self.key && self.key(e) !== false && /^(Arrow|Space| )/.test(e.key)) e.preventDefault(); });
    if (this.wheel) cv.addEventListener('wheel', function (e) { self.wheel(pt(e), e); }, { passive: false });
    if (this.dbl) cv.addEventListener('dblclick', function (e) { self.dbl(pt(e), e); });
    if (this.tick) this._loop = loop(this, function (dt, t) { self.tick(dt, t); });
    this._resize();
  }
  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    if (this._mo) this._mo.disconnect();
    if (this._loop) this._loop.stop();
    if (this.teardown) this.teardown();
    this._cv = null;
  }
  /** 当前风格下的全部变量（缓存，主题变化时清空） */
  get tk() {
    if (this._tk) return this._tk;
    const cs = getComputedStyle(this);
    const o = {};
    KEYS.forEach(function (k) { o[k] = cs.getPropertyValue('--ui-' + k).trim(); });
    o.r = parseFloat(o.radius) || 0;
    o.rs = parseFloat(o['radius-sm']) || 0;
    return (this._tk = o);
  }
  font(size, weight, mono) { return (weight || 400) + ' ' + size + 'px ' + (mono ? this.tk.mono : this.tk.font); }
  /** 子类可以按宽度决定高度（窄屏时纵向堆叠） */
  heightFor(w) { return Number(this.getAttribute('height')) || 420; }
  _resize() {
    if (!this._cv) return;
    const w = Math.max(200, this.clientWidth);
    const h = this.heightFor(w);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w === this.W && h === this.H && dpr === this._dpr) return;
    this.W = w; this.H = h; this._dpr = dpr;
    this._cv.width = Math.round(w * dpr);
    this._cv.height = Math.round(h * dpr);
    this._cv.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.layout) this.layout();
    this.draw();
  }
  say(msg) { if (this._sr) this._sr.textContent = msg; }
  emit(name, detail) { this.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true })); }
  draw() {}
}

/* =========================================================
   ui-cv-dash 数据大屏
   ========================================================= */
const SITES = [
  [0.18, 0.30, '北站枢纽', 'ok'], [0.32, 0.62, '滨江一号', 'warn'], [0.45, 0.22, '科创园 A', 'ok'], [0.52, 0.48, '中心医院', 'danger'],
  [0.64, 0.70, '南湖隧道', 'ok'], [0.72, 0.30, '会展中心', 'warn'], [0.84, 0.55, '东区变电站', 'danger'], [0.26, 0.82, '西城学校', 'ok'],
  [0.60, 0.12, '体育馆', 'ok'], [0.90, 0.20, '物流园', 'ok'], [0.10, 0.58, '水厂', 'ok'], [0.40, 0.88, '地铁 3 号线', 'warn']
];
const ST = { ok: '正常', warn: '预警', danger: '告警' };

export class UICvDash extends CanvasUI {
  static props = { title: { default: '城市运行监控中心' }, height: { default: '480' } };
  setup() {
    this.sites = SITES.map(function (s, i) { return { i: i, x: s[0], y: s[1], name: s[2], st: s[3] }; });
    this.flow = Array.from({ length: 40 }, function (_, i) { return 60 + 18 * Math.sin(i / 4) + 10 * Math.sin(i / 1.7); });
    this.alarms = [['10:42:08', '东区变电站 温度过高', 'danger'], ['10:39:51', '中心医院 烟感触发', 'danger'], ['10:31:17', '会展中心 人流密度预警', 'warn'], ['10:20:02', '滨江一号 门禁离线', 'warn']];
    this.sel = -1; this.hover = -1; this.acc = 0; this.done = 0;
    const cv = this._cv;
    cv.setAttribute('role', 'application');
    cv.setAttribute('aria-roledescription', '数据大屏');
    cv.setAttribute('aria-label', (this.getAttribute('title') || '数据大屏') + '：方向键切换点位，回车处理告警');
  }
  heightFor(w) { return w < 700 ? 1040 : (Number(this.getAttribute('height')) || 480); }
  layout() {
    const W = this.W, H = this.H, p = 14, top = 50;
    if (W < 700) {
      let y = top;
      this.L = { kpi: [p, y, W - 2 * p, 150] }; y += 162;
      this.L.map = [p, y, W - 2 * p, 300]; y += 312;
      this.L.line = [p, y, W - 2 * p, 170]; y += 182;
      this.L.bar = [p, y, W - 2 * p, 150]; y += 162;
      this.L.list = [p, y, W - 2 * p, H - y - p];
    } else {
      const c1 = Math.round((W - 4 * p) * 0.28), c3 = c1, c2 = W - 4 * p - c1 - c3;
      const h = H - top - p;
      this.L = {
        kpi: [p, top, c1, 168], bar: [p, top + 180, c1, h - 180],
        map: [2 * p + c1, top, c2, h],
        line: [3 * p + c1 + c2, top, c3, Math.round(h * 0.46)], list: [3 * p + c1 + c2, top + Math.round(h * 0.46) + 12, c3, h - Math.round(h * 0.46) - 12]
      };
    }
  }
  sitePos(s) { const m = this.L.map; return { x: m[0] + 16 + s.x * (m[2] - 32), y: m[1] + 34 + s.y * (m[3] - 50) }; }
  panel(r, title) {
    const c = this.ctx, t = this.tk;
    rr(c, r[0], r[1], r[2], r[3], t.r);
    c.fillStyle = t.panel; c.fill();
    c.strokeStyle = t.line; c.lineWidth = 1; c.stroke();
    if (title) {
      c.fillStyle = t.brand; c.fillRect(r[0] + 12, r[1] + 13, 3, 12);
      c.fillStyle = t.text; c.font = this.font(13, 600); c.textBaseline = 'middle'; c.textAlign = 'left';
      c.fillText(title, r[0] + 22, r[1] + 19);
    }
  }
  draw() {
    if (!this._cv || !this.L) return;
    const c = this.ctx, t = this.tk, W = this.W, H = this.H, now = performance.now();
    c.clearRect(0, 0, W, H);
    rr(c, 0, 0, W, H, t.r + 4); c.fillStyle = t.bg; c.fill();
    /* 标题栏 */
    c.textBaseline = 'middle'; c.textAlign = 'left';
    c.fillStyle = t.text; c.font = this.font(W < 500 ? 16 : 19, 700);
    c.fillText(this.getAttribute('title') || '城市运行监控中心', 16, 26);
    const d = new Date();
    c.textAlign = 'right'; c.font = this.font(13, 600, true); c.fillStyle = t.sub;
    c.fillText(d.toLocaleDateString('zh-CN') + '  ' + d.toTimeString().slice(0, 8), W - 16, 26);
    c.strokeStyle = alpha(t.brand, 0.5); c.beginPath(); c.moveTo(16, 44); c.lineTo(W - 16, 44); c.stroke();
    this.drawKpi(); this.drawBars(); this.drawMap(now); this.drawLine(); this.drawList();
  }
  drawKpi() {
    const c = this.ctx, t = this.tk, r = this.L.kpi;
    const bad = this.sites.filter(function (s) { return s.st !== 'ok'; }).length;
    const items = [['在线设备', '1,284', t.brand], ['当前告警', String(bad), bad ? t.danger : t.ok], ['今日处理', String(18 + this.done), t.ok], ['平均响应', '3.2 分', t.warn]];
    const gw = (r[2] - 10) / 2, gh = (r[3] - 10) / 2;
    items.forEach((it, i) => {
      const x = r[0] + (i % 2) * (gw + 10), y = r[1] + Math.floor(i / 2) * (gh + 10);
      rr(c, x, y, gw, gh, t.r); c.fillStyle = t.panel; c.fill(); c.strokeStyle = t.line; c.stroke();
      c.fillStyle = it[2]; c.fillRect(x, y + 10, 3, gh - 20);
      c.textAlign = 'left'; c.fillStyle = t.sub; c.font = this.font(12); c.fillText(it[0], x + 14, y + 22);
      c.fillStyle = t.text; c.font = this.font(gw < 120 ? 20 : 24, 700); c.fillText(it[1], x + 14, y + gh - 24);
    });
  }
  drawBars() {
    const c = this.ctx, t = this.tk, r = this.L.bar;
    this.panel(r, '各区告警数');
    const data = [['东区', 9], ['南区', 5], ['西区', 3], ['北区', 6], ['中区', 11]];
    const max = 12, x0 = r[0] + 52, w = r[2] - 88, rowH = Math.min(26, (r[3] - 46) / data.length);
    data.forEach((d, i) => {
      const y = r[1] + 40 + i * rowH;
      c.textAlign = 'right'; c.fillStyle = t.sub; c.font = this.font(12); c.fillText(d[0], x0 - 8, y + rowH / 2);
      rr(c, x0, y + rowH * 0.25, w, rowH * 0.5, 99); c.fillStyle = t['panel-2']; c.fill();
      rr(c, x0, y + rowH * 0.25, Math.max(6, w * d[1] / max), rowH * 0.5, 99); c.fillStyle = d[1] > 8 ? t.danger : t.brand; c.fill();
      c.textAlign = 'left'; c.fillStyle = t.text; c.font = this.font(11, 600);
      c.fillText(String(d[1]), x0 + w + 8, y + rowH / 2);
    });
  }
  drawMap(now) {
    const c = this.ctx, t = this.tk, r = this.L.map;
    this.panel(r, '点位分布（' + this.sites.length + ' 个）');
    c.save(); rr(c, r[0] + 8, r[1] + 32, r[2] - 16, r[3] - 40, t.rs); c.clip();
    c.fillStyle = alpha(t.brand, 0.04); c.fillRect(r[0], r[1], r[2], r[3]);
    c.strokeStyle = alpha(t.line, 0.9); c.lineWidth = 1;
    for (let x = r[0] + 8; x < r[0] + r[2]; x += 28) { c.beginPath(); c.moveTo(x, r[1] + 32); c.lineTo(x, r[1] + r[3]); c.stroke(); }
    for (let y = r[1] + 32; y < r[1] + r[3]; y += 28) { c.beginPath(); c.moveTo(r[0], y); c.lineTo(r[0] + r[2], y); c.stroke(); }
    /* 一条「河」和两条主干道，给地图一点方位感 */
    c.strokeStyle = alpha(t.brand, 0.22); c.lineWidth = 14; c.lineCap = 'round';
    c.beginPath(); c.moveTo(r[0], r[1] + r[3] * 0.72); c.bezierCurveTo(r[0] + r[2] * 0.3, r[1] + r[3] * 0.5, r[0] + r[2] * 0.6, r[1] + r[3] * 0.95, r[0] + r[2], r[1] + r[3] * 0.62); c.stroke();
    c.strokeStyle = alpha(t.sub, 0.25); c.lineWidth = 4;
    c.beginPath(); c.moveTo(r[0] + r[2] * 0.5, r[1] + 32); c.lineTo(r[0] + r[2] * 0.47, r[1] + r[3]); c.stroke();
    c.beginPath(); c.moveTo(r[0], r[1] + r[3] * 0.4); c.lineTo(r[0] + r[2], r[1] + r[3] * 0.36); c.stroke();
    c.restore();
    const still = reduced();
    this.sites.forEach((s) => {
      const p = this.sitePos(s), col = t[s.st];
      if (s.st === 'danger' && !still) {
        const k = (now / 1400 + s.i * 0.13) % 1;
        c.beginPath(); c.arc(p.x, p.y, 6 + k * 18, 0, Math.PI * 2); c.strokeStyle = alpha(col, 1 - k); c.lineWidth = 2; c.stroke();
      }
      c.beginPath(); c.arc(p.x, p.y, s.i === this.sel || s.i === this.hover ? 8 : 6, 0, Math.PI * 2);
      c.fillStyle = col; c.fill(); c.strokeStyle = t.panel; c.lineWidth = 2; c.stroke();
      if (s.i === this.sel) { c.beginPath(); c.arc(p.x, p.y, 12, 0, Math.PI * 2); c.strokeStyle = t.brand; c.lineWidth = 2; c.stroke(); }
    });
    /* 图例 */
    let lx = r[0] + r[2] - 14;
    c.font = this.font(11); c.textAlign = 'right';
    ['danger', 'warn', 'ok'].forEach((k) => {
      c.fillStyle = t.sub; c.fillText(ST[k], lx, r[1] + 19); lx -= c.measureText(ST[k]).width + 6;
      c.beginPath(); c.arc(lx - 3, r[1] + 19, 4, 0, Math.PI * 2); c.fillStyle = t[k]; c.fill(); lx -= 18;
    });
    const tip = this.sel > -1 ? this.sel : this.hover;
    if (tip > -1) this.drawTip(this.sites[tip], tip === this.sel);
  }
  drawTip(s, pinned) {
    const c = this.ctx, t = this.tk, p = this.sitePos(s), r = this.L.map;
    const w = 168, h = pinned && s.st !== 'ok' ? 96 : 62;
    let x = p.x + 14, y = p.y - h / 2;
    if (x + w > r[0] + r[2] - 8) x = p.x - 14 - w;
    y = Math.max(r[1] + 34, Math.min(y, r[1] + r[3] - h - 8));
    c.save(); c.shadowColor = 'rgba(0,0,0,.18)'; c.shadowBlur = 16; c.shadowOffsetY = 4;
    rr(c, x, y, w, h, t.rs); c.fillStyle = t.panel; c.fill(); c.restore();
    rr(c, x, y, w, h, t.rs); c.strokeStyle = t.line; c.lineWidth = 1; c.stroke();
    c.textAlign = 'left'; c.fillStyle = t.text; c.font = this.font(13, 600); c.fillText(s.name, x + 12, y + 18);
    c.beginPath(); c.arc(x + 15, y + 40, 4, 0, Math.PI * 2); c.fillStyle = t[s.st]; c.fill();
    c.fillStyle = t.sub; c.font = this.font(12); c.fillText(ST[s.st] + ' · 设备 ' + (12 + s.i * 7) + ' 台', x + 25, y + 40);
    this.btn = null;
    if (pinned && s.st !== 'ok') {
      const b = [x + 12, y + 56, w - 24, 28];
      rr(c, b[0], b[1], b[2], b[3], t.rs); c.fillStyle = t.brand; c.fill();
      c.fillStyle = t['brand-ink']; c.font = this.font(12, 600); c.textAlign = 'center';
      c.fillText('派单处理（Enter）', b[0] + b[2] / 2, b[1] + 14);
      this.btn = b;
    }
  }
  drawLine() {
    const c = this.ctx, t = this.tk, r = this.L.line, d = this.flow;
    this.panel(r, '实时流量（次/秒）');
    const x0 = r[0] + 14, y0 = r[1] + 40, w = r[2] - 28, h = r[3] - 56;
    const max = 100, min = 20;
    c.textAlign = 'right'; c.font = this.font(18, 700, true); c.fillStyle = t.brand;
    c.fillText(Math.round(d[d.length - 1]), r[0] + r[2] - 14, r[1] + 19);
    c.strokeStyle = t.line; c.lineWidth = 1;
    for (let i = 0; i <= 3; i++) { const y = y0 + h * i / 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + w, y); c.stroke(); }
    const pts = d.map(function (v, i) { return [x0 + w * i / (d.length - 1), y0 + h - (v - min) / (max - min) * h]; });
    c.beginPath(); pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); });
    c.lineTo(x0 + w, y0 + h); c.lineTo(x0, y0 + h); c.closePath();
    const g = c.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, alpha(t.brand, 0.3)); g.addColorStop(1, alpha(t.brand, 0));
    c.fillStyle = g; c.fill();
    c.beginPath(); pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); });
    c.strokeStyle = t.brand; c.lineWidth = 2; c.lineJoin = 'round'; c.stroke();
    const l = pts[pts.length - 1]; c.beginPath(); c.arc(l[0], l[1], 3.5, 0, Math.PI * 2); c.fillStyle = t.brand; c.fill();
  }
  drawList() {
    const c = this.ctx, t = this.tk, r = this.L.list;
    this.panel(r, '最新事件');
    const rowH = 30, n = Math.max(0, Math.floor((r[3] - 40) / rowH));
    this.alarms.slice(0, n).forEach((a, i) => {
      const y = r[1] + 36 + i * rowH;
      if (i % 2 === 0) { c.fillStyle = t['panel-2']; c.fillRect(r[0] + 8, y, r[2] - 16, rowH); }
      c.beginPath(); c.arc(r[0] + 20, y + rowH / 2, 4, 0, Math.PI * 2); c.fillStyle = t[a[2]]; c.fill();
      c.textAlign = 'left'; c.fillStyle = t.sub; c.font = this.font(11, 400, true); c.fillText(a[0], r[0] + 30, y + rowH / 2);
      c.fillStyle = t.text; c.font = this.font(12);
      const tx = r[0] + 96, mw = r[2] - 106;
      let s = a[1];
      while (s.length > 1 && c.measureText(s).width > mw) s = s.slice(0, -1);
      c.fillText(s === a[1] ? s : s.slice(0, -1) + '…', tx, y + rowH / 2);
    });
  }
  tick(dt) {
    if (!this.L) return;
    if (!reduced()) {
      this.acc += dt;
      if (this.acc > 1000) {
        this.acc = 0;
        const last = this.flow[this.flow.length - 1];
        this.flow.push(Math.max(25, Math.min(95, last + (Math.random() - 0.5) * 16)));
        this.flow.shift();
      }
    }
    this.draw();
  }
  hit(p) {
    let best = -1, bd = 14;
    this.sites.forEach((s) => { const q = this.sitePos(s); const dd = Math.hypot(q.x - p.x, q.y - p.y); if (dd < bd) { bd = dd; best = s.i; } });
    return best;
  }
  inBtn(p) { const b = this.btn; return b && p.x >= b[0] && p.x <= b[0] + b[2] && p.y >= b[1] && p.y <= b[1] + b[3]; }
  move(p) {
    if (!this.L) return;
    const h = this.hit(p);
    this.hover = h;
    this._cv.style.cursor = h > -1 || this.inBtn(p) ? 'pointer' : 'default';
    if (reduced()) this.draw();
  }
  leave() { this.hover = -1; this.draw(); }
  down(p) {
    if (this.inBtn(p)) return this.resolve();
    this.select(this.hit(p));
  }
  select(i) {
    this.sel = i;
    if (i > -1) {
      const s = this.sites[i];
      this.say(s.name + '，' + ST[s.st] + (s.st !== 'ok' ? '，按回车派单处理' : ''));
      this.emit('select', { name: s.name, status: s.st });
    }
    this.draw();
  }
  /** 处理当前选中的告警点位：状态变为正常，事件列表追加一条 */
  resolve() {
    const s = this.sites[this.sel];
    if (!s || s.st === 'ok') return;
    s.st = 'ok';
    this.done++;
    this.alarms.unshift([new Date().toTimeString().slice(0, 8), s.name + ' 已派单处理', 'ok']);
    this.say(s.name + ' 已派单处理');
    this.emit('resolve', { name: s.name });
    this.draw();
  }
  key(e) {
    const n = this.sites.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this.select((this.sel + 1) % n);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') this.select((this.sel - 1 + n) % n);
    else if (e.key === 'Enter') this.resolve();
    else if (e.key === 'Escape') this.select(-1);
    else return false;
  }
}
register('ui-cv-dash', UICvDash, baseCss);

/* =========================================================
   ui-cv-game 游戏主菜单 / HUD
   ========================================================= */
export class UICvGame extends CanvasUI {
  static props = { title: { default: 'STAR RUNNER' }, height: { default: '460' } };
  setup() {
    this.scene = 'menu'; this.idx = 0; this.best = 0;
    this.stars = Array.from({ length: 90 }, function () { return { x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7 }; });
    this.menu = ['开始游戏', '操作说明', '最高分'];
    const cv = this._cv;
    cv.setAttribute('role', 'application');
    cv.setAttribute('aria-roledescription', '游戏');
    cv.setAttribute('aria-label', '小游戏：方向键选择菜单，回车确认；游戏中左右键移动，P 暂停');
    this.say('主菜单：开始游戏');
  }
  heightFor(w) { return w < 500 ? 520 : (Number(this.getAttribute('height')) || 460); }
  reset() {
    this.ship = { x: this.W / 2 }; this.items = []; this.score = 0; this.lives = 3; this.time = 0; this.spawn = 0; this.hurt = 0;
  }
  buttons() {
    const bw = Math.min(260, this.W - 60), bh = 44, gap = 12, list = this.scene === 'menu' ? this.menu : this.scene === 'pause' ? ['继续', '返回菜单'] : this.scene === 'over' ? ['再来一局', '返回菜单'] : ['返回'];
    const total = list.length * bh + (list.length - 1) * gap;
    const y0 = this.scene === 'menu' ? this.H * 0.52 : this.H / 2 + 6;
    const top = Math.min(y0, this.H - total - 30);
    return list.map((l, i) => ({ label: l, x: (this.W - bw) / 2, y: top + i * (bh + gap), w: bw, h: bh }));
  }
  draw() {
    if (!this._cv || !this.W) return;
    const c = this.ctx, t = this.tk, W = this.W, H = this.H;
    c.clearRect(0, 0, W, H);
    rr(c, 0, 0, W, H, t.r + 4); c.save(); c.clip();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, t.bg); g.addColorStop(1, alpha(t.brand, 0.18));
    c.fillStyle = t.bg; c.fillRect(0, 0, W, H); c.fillStyle = g; c.fillRect(0, 0, W, H);
    this.stars.forEach(function (s) { c.fillStyle = alpha(t.text, 0.25 + s.z * 0.5); c.fillRect(s.x * W, s.y * H, s.z * 2.2, s.z * 2.2); });
    if (this.scene === 'play' || this.scene === 'pause' || this.scene === 'over') this.drawPlay();
    if (this.scene === 'menu') this.drawMenu();
    if (this.scene === 'help') this.drawHelp();
    if (this.scene === 'pause' || this.scene === 'over') this.drawOverlay();
    c.restore();
  }
  title(text, y, size) {
    const c = this.ctx, t = this.tk;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = this.font(size, 800);
    c.save(); c.shadowColor = alpha(t.brand, 0.7); c.shadowBlur = 24; c.fillStyle = t.brand; c.fillText(text, this.W / 2, y); c.restore();
    c.fillStyle = t.text; c.globalAlpha = 0.9; c.fillText(text, this.W / 2, y - 1); c.globalAlpha = 1;
  }
  drawButtons() {
    const c = this.ctx, t = this.tk;
    this.buttons().forEach((b, i) => {
      const on = i === this.idx;
      rr(c, b.x, b.y, b.w, b.h, t.r);
      c.fillStyle = on ? t.brand : alpha(t.panel, 0.85); c.fill();
      c.strokeStyle = on ? t.brand : t.line; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = on ? t['brand-ink'] : t.text; c.font = this.font(15, 600); c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText((on ? '▶  ' : '') + b.label, b.x + b.w / 2, b.y + b.h / 2);
    });
  }
  drawMenu() {
    const t = this.tk, c = this.ctx;
    this.title(this.getAttribute('title') || 'STAR RUNNER', this.H * 0.26, this.W < 420 ? 30 : 42);
    c.fillStyle = t.sub; c.font = this.font(13); c.fillText('收集星星，躲开陨石', this.W / 2, this.H * 0.26 + 38);
    this.drawButtons();
    c.fillStyle = t.sub; c.font = this.font(11.5); c.fillText('↑ ↓ 选择 · Enter 确认 · 也可以直接点击', this.W / 2, this.H - 18);
  }
  drawHelp() {
    const c = this.ctx, t = this.tk;
    this.title('操作说明', this.H * 0.2, 28);
    const lines = ['← → 或 A / D：左右移动（也可以按住拖动）', '★ 星星 +10 分　● 陨石 扣 1 条命', 'P 或 Esc：暂停　Enter：确认', '屏幕右上角 ❚❚ 也能暂停'];
    c.fillStyle = t.text; c.font = this.font(14);
    lines.forEach((l, i) => c.fillText(l, this.W / 2, this.H * 0.34 + i * 30));
    this.idx = 0; this.drawButtons();
  }
  drawPlay() {
    const c = this.ctx, t = this.tk, W = this.W, H = this.H;
    this.items.forEach(function (it) {
      if (it.k === 'star') {
        c.save(); c.translate(it.x, it.y); c.rotate(it.y / 40); c.fillStyle = t.warn; c.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 4 : 10, a = i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        c.closePath(); c.fill(); c.restore();
      } else {
        c.beginPath(); c.arc(it.x, it.y, it.r, 0, Math.PI * 2); c.fillStyle = t.danger; c.fill();
        c.beginPath(); c.arc(it.x - it.r * 0.3, it.y - it.r * 0.3, it.r * 0.3, 0, Math.PI * 2); c.fillStyle = alpha(t.panel, 0.3); c.fill();
      }
    });
    /* 飞船 */
    const sx = this.ship.x, sy = H - 46;
    c.save(); if (this.hurt > 0 && Math.floor(this.hurt / 80) % 2) c.globalAlpha = 0.35;
    c.fillStyle = t.brand; c.beginPath(); c.moveTo(sx, sy - 18); c.lineTo(sx + 16, sy + 14); c.lineTo(sx, sy + 7); c.lineTo(sx - 16, sy + 14); c.closePath(); c.fill();
    c.fillStyle = alpha(t.warn, 0.9); c.beginPath(); c.moveTo(sx - 6, sy + 10); c.lineTo(sx, sy + 20 + Math.random() * 6); c.lineTo(sx + 6, sy + 10); c.fill();
    c.restore();
    /* HUD：分数 / 时间 / 生命 / 暂停按钮 */
    rr(c, 12, 12, 118, 36, t.r); c.fillStyle = alpha(t.panel, 0.85); c.fill(); c.strokeStyle = t.line; c.lineWidth = 1; c.stroke();
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = t.sub; c.font = this.font(11); c.fillText('SCORE', 22, 30);
    c.fillStyle = t.text; c.font = this.font(17, 700, true); c.fillText(String(this.score), 68, 30);
    c.textAlign = 'center'; c.fillStyle = t.sub; c.font = this.font(13, 600, true);
    c.fillText(Math.floor(this.time / 1000) + 's', W / 2, 30);
    c.textAlign = 'right'; c.font = this.font(16);
    let hs = ''; for (let i = 0; i < 3; i++) hs += i < this.lives ? '♥' : '♡';
    c.fillStyle = t.danger; c.fillText(hs, W - 58, 30);
    this.pauseBtn = { x: W - 48, y: 12, w: 36, h: 36 };
    rr(c, W - 48, 12, 36, 36, t.r); c.fillStyle = alpha(t.panel, 0.85); c.fill(); c.strokeStyle = t.line; c.stroke();
    c.fillStyle = t.text; c.fillRect(W - 36, 22, 4, 16); c.fillRect(W - 28, 22, 4, 16);
  }
  drawOverlay() {
    const c = this.ctx, t = this.tk;
    c.fillStyle = alpha(t.bg, 0.72); c.fillRect(0, 0, this.W, this.H);
    if (this.scene === 'pause') this.title('已暂停', this.H / 2 - 50, 30);
    else {
      this.title('游戏结束', this.H / 2 - 70, 30);
      c.fillStyle = t.text; c.font = this.font(15); c.fillText('得分 ' + this.score + '　最高 ' + this.best, this.W / 2, this.H / 2 - 30);
    }
    this.drawButtons();
  }
  tick(dt) {
    const still = reduced();
    if (this.scene !== 'play') {
      if (!still) this.stars.forEach(function (s) { s.y += s.z * dt / 9000; if (s.y > 1) { s.y = 0; s.x = Math.random(); } });
      if (!still || this._dirty) { this._dirty = false; this.draw(); }
      return;
    }
    this.stars.forEach(function (s) { s.y += s.z * dt / 2500; if (s.y > 1) { s.y = 0; s.x = Math.random(); } });
    const sp = 0.32 * dt;
    if (this.keys && (this.keys.l || this.keys.r)) this.ship.x += (this.keys.r ? sp : 0) - (this.keys.l ? sp : 0);
    this.ship.x = Math.max(18, Math.min(this.W - 18, this.ship.x));
    this.time += dt; this.spawn -= dt; if (this.hurt > 0) this.hurt -= dt;
    const level = 1 + this.time / 20000;
    if (this.spawn <= 0) {
      this.spawn = 520 / level;
      const star = Math.random() < 0.55;
      this.items.push({ k: star ? 'star' : 'rock', x: 20 + Math.random() * (this.W - 40), y: -20, v: (0.09 + Math.random() * 0.08) * level, r: star ? 10 : 9 + Math.random() * 8 });
    }
    const sy = this.H - 46;
    this.items = this.items.filter((it) => {
      it.y += it.v * dt;
      if (Math.abs(it.x - this.ship.x) < it.r + 12 && Math.abs(it.y - sy) < it.r + 12) {
        if (it.k === 'star') { this.score += 10; }
        else if (this.hurt <= 0) {
          this.lives--; this.hurt = 900;
          this.say('撞到陨石，剩余 ' + this.lives + ' 条命');
          if (this.lives <= 0) this.over();
        }
        return false;
      }
      return it.y < this.H + 30;
    });
    this.draw();
  }
  go(scene) {
    this.scene = scene; this.idx = 0; this._dirty = true;
    const msg = { menu: '主菜单：' + this.menu[0], help: '操作说明', play: '游戏开始，左右键移动', pause: '已暂停：继续 / 返回菜单' };
    if (msg[scene]) this.say(msg[scene]);
    this.emit('scene', { scene: scene });
    this.draw();
  }
  over() {
    this.best = Math.max(this.best, this.score);
    this.go('over');
    this.say('游戏结束，得分 ' + this.score + '，最高 ' + this.best);
  }
  /** 菜单项被确认时：状态机的所有跳转都在这里 */
  activate(i) {
    const s = this.scene;
    if (s === 'menu') {
      if (i === 0) { this.reset(); this.go('play'); }
      else if (i === 1) this.go('help');
      else { this.say('最高分 ' + this.best); if (window.uiToast) window.uiToast('最高分：' + this.best); }
    } else if (s === 'help') this.go('menu');
    else if (s === 'pause') { if (i === 0) this.go('play'); else this.go('menu'); }
    else if (s === 'over') { if (i === 0) { this.reset(); this.go('play'); } else this.go('menu'); }
  }
  hitBtn(p) { return this.buttons().findIndex(function (b) { return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h; }); }
  down(p) {
    if (this.scene === 'play') {
      const pb = this.pauseBtn;
      if (pb && p.x >= pb.x && p.y >= pb.y && p.x <= pb.x + pb.w && p.y <= pb.y + pb.h) return this.go('pause');
      this.drag = true; this.ship.x = p.x; return;
    }
    const i = this.hitBtn(p);
    if (i > -1) this.activate(i);
  }
  move(p) {
    if (this.scene === 'play') { if (this.drag) this.ship.x = p.x; this._cv.style.cursor = 'default'; return; }
    const i = this.hitBtn(p);
    this._cv.style.cursor = i > -1 ? 'pointer' : 'default';
    if (i > -1 && i !== this.idx) { this.idx = i; this._dirty = true; this.draw(); }
  }
  up() { this.drag = false; }
  key(e) {
    const k = e.key;
    if (this.scene === 'play') {
      this.keys = this.keys || {};
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') this.keys.l = true;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') this.keys.r = true;
      else if (k === 'p' || k === 'P' || k === 'Escape') this.go('pause');
      else return false;
      return;
    }
    const n = this.buttons().length;
    if (k === 'ArrowDown') this.idx = (this.idx + 1) % n;
    else if (k === 'ArrowUp') this.idx = (this.idx - 1 + n) % n;
    else if (k === 'Enter' || k === ' ') { this.activate(this.idx); return; }
    else if (k === 'Escape' && this.scene !== 'menu') { this.go(this.scene === 'pause' ? 'play' : 'menu'); return; }
    else return false;
    this.say(this.buttons()[this.idx].label);
    this._dirty = true; this.draw();
  }
}
register('ui-cv-game', UICvGame, baseCss);
/* 松开方向键：游戏里用持续按住来移动 */
if (typeof document !== 'undefined') {
  document.addEventListener('keyup', function (e) {
    const g = e.target && e.target.closest && e.target.closest('ui-cv-game');
    if (!g || !g.keys) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') g.keys.l = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') g.keys.r = false;
  });
}

/* =========================================================
   ui-cv-board 白板画布
   ========================================================= */
const NOTE_COLORS = ['brand', 'ok', 'warn', 'danger'];
export class UICvBoard extends CanvasUI {
  static props = { height: { default: '460' }, tool: { default: 'select' } };
  setup() {
    this.nodes = [
      { id: 1, x: 40, y: 50, w: 150, h: 80, text: '用户调研', c: 0 },
      { id: 2, x: 260, y: 30, w: 150, h: 80, text: '需求池', c: 2 },
      { id: 3, x: 260, y: 170, w: 150, h: 80, text: '原型评审', c: 0 },
      { id: 4, x: 480, y: 100, w: 150, h: 80, text: '开发排期', c: 1 },
      { id: 5, x: 40, y: 210, w: 150, h: 80, text: '竞品分析', c: 3 }
    ];
    this.edges = [[1, 2], [2, 3], [3, 4], [5, 3]];
    this.view = { x: 30, y: 30, k: 1 };
    this.sel = null; this.nid = 6; this.tool = this.getAttribute('tool') || 'select';
    const cv = this._cv;
    cv.setAttribute('role', 'application');
    cv.setAttribute('aria-roledescription', '白板');
    cv.setAttribute('aria-label', '白板：Tab 聚焦后用 [ ] 切换便签，方向键移动，Enter 编辑文字，N 新建，Delete 删除，+ / - 缩放');
  }
  heightFor(w) { return w < 500 ? 420 : (Number(this.getAttribute('height')) || 460); }
  /* 用户还没动过视图时，容器变宽变窄都自动「适应画布」 */
  layout() { if (!this._touched) this.fit(true); }
  toWorld(p) { return { x: (p.x - this.view.x) / this.view.k, y: (p.y - this.view.y) / this.view.k }; }
  nodeAt(p) {
    const q = this.toWorld(p);
    for (let i = this.nodes.length - 1; i >= 0; i--) { const n = this.nodes[i]; if (q.x >= n.x && q.x <= n.x + n.w && q.y >= n.y && q.y <= n.y + n.h) return n; }
    return null;
  }
  byId(id) { return this.nodes.find(function (n) { return n.id === id; }); }
  draw() {
    if (!this._cv || !this.W) return;
    const c = this.ctx, t = this.tk, W = this.W, H = this.H, v = this.view;
    c.clearRect(0, 0, W, H);
    rr(c, 0, 0, W, H, t.r + 4); c.save(); c.clip();
    c.fillStyle = t['panel-2']; c.fillRect(0, 0, W, H);
    /* 点阵背景随平移缩放 */
    const step = 24 * v.k;
    if (step > 7) {
      c.fillStyle = alpha(t.sub, 0.35);
      for (let x = ((v.x % step) + step) % step; x < W; x += step) for (let y = ((v.y % step) + step) % step; y < H; y += step) c.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
    }
    c.save(); c.translate(v.x, v.y); c.scale(v.k, v.k);
    c.strokeStyle = t.sub; c.fillStyle = t.sub; c.lineWidth = 1.6 / v.k;
    this.edges.forEach((e) => { const a = this.byId(e[0]), b = this.byId(e[1]); if (a && b) this.arrow(a, b); });
    if (this.linking) {
      const a = this.linking.from, q = this.linking.to;
      c.setLineDash([6 / v.k, 4 / v.k]); c.strokeStyle = t.brand;
      c.beginPath(); c.moveTo(a.x + a.w / 2, a.y + a.h / 2); c.lineTo(q.x, q.y); c.stroke(); c.setLineDash([]);
    }
    this.nodes.forEach((n) => {
      const col = t[NOTE_COLORS[n.c]], soft = t[NOTE_COLORS[n.c] + '-soft'] || t['brand-soft'];
      c.save(); c.shadowColor = 'rgba(0,0,0,.12)'; c.shadowBlur = 10; c.shadowOffsetY = 3;
      rr(c, n.x, n.y, n.w, n.h, t.rs); c.fillStyle = t.panel; c.fill(); c.restore();
      rr(c, n.x, n.y, n.w, n.h, t.rs); c.fillStyle = soft; c.fill();
      c.fillStyle = col; c.fillRect(n.x, n.y + 8, 4, n.h - 16);
      c.fillStyle = t.text; c.font = this.font(14, 600); c.textAlign = 'left'; c.textBaseline = 'middle';
      this.wrap(n.text, n.x + 14, n.y + n.h / 2, n.w - 24);
      if (this.sel === n) {
        rr(c, n.x - 3, n.y - 3, n.w + 6, n.h + 6, t.rs + 3); c.strokeStyle = t.brand; c.lineWidth = 2 / v.k; c.stroke();
        c.fillStyle = t.panel; c.strokeStyle = t.brand;
        [[n.x, n.y], [n.x + n.w, n.y], [n.x, n.y + n.h], [n.x + n.w, n.y + n.h]].forEach(function (h) { c.fillRect(h[0] - 3, h[1] - 3, 6, 6); c.strokeRect(h[0] - 3, h[1] - 3, 6, 6); });
      }
    });
    c.restore();
    /* 右下角：缩放比例 + 计数 */
    const label = Math.round(v.k * 100) + '%  ·  ' + this.nodes.length + ' 便签 · ' + this.edges.length + ' 连线';
    c.font = this.font(11.5, 600); const tw = c.measureText(label).width + 20;
    rr(c, W - tw - 10, H - 34, tw, 24, 99); c.fillStyle = alpha(t.panel, 0.92); c.fill(); c.strokeStyle = t.line; c.lineWidth = 1; c.stroke();
    c.fillStyle = t.sub; c.textAlign = 'center'; c.fillText(label, W - 10 - tw / 2, H - 22);
    if (!this.nodes.length) { c.fillStyle = t.sub; c.font = this.font(14); c.fillText('双击空白处或按 N 新建便签', W / 2, H / 2); }
    c.restore();
  }
  wrap(text, x, cy, maxW) {
    const c = this.ctx, lines = []; let cur = '';
    for (const ch of text) { if (c.measureText(cur + ch).width > maxW && cur) { lines.push(cur); cur = ch; } else cur += ch; }
    lines.push(cur);
    const lh = 18, top = cy - (lines.length - 1) * lh / 2;
    lines.slice(0, 3).forEach(function (l, i) { c.fillText(l, x, top + i * lh); });
  }
  arrow(a, b) {
    const c = this.ctx;
    const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
    /* 线段与目标矩形边缘的交点，箭头停在便签边上 */
    const dx = bx - ax, dy = by - ay;
    const s = Math.min(Math.abs((b.w / 2 + 4) / (dx || 1e-6)), Math.abs((b.h / 2 + 4) / (dy || 1e-6)));
    const ex = bx - dx * s, ey = by - dy * s;
    const s2 = Math.min(Math.abs((a.w / 2) / (dx || 1e-6)), Math.abs((a.h / 2) / (dy || 1e-6)));
    const sx = ax + dx * s2, sy = ay + dy * s2;
    const mx = (sx + ex) / 2, my = (sy + ey) / 2;
    c.beginPath(); c.moveTo(sx, sy);
    if (Math.abs(dx) > Math.abs(dy)) c.bezierCurveTo(mx, sy, mx, ey, ex, ey); else c.bezierCurveTo(sx, my, ex, my, ex, ey);
    c.stroke();
    const ang = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : Math.PI) : (dy > 0 ? Math.PI / 2 : -Math.PI / 2);
    c.beginPath(); c.moveTo(ex, ey);
    c.lineTo(ex - 9 * Math.cos(ang - 0.45), ey - 9 * Math.sin(ang - 0.45));
    c.lineTo(ex - 9 * Math.cos(ang + 0.45), ey - 9 * Math.sin(ang + 0.45)); c.closePath(); c.fill();
  }
  changed(msg) { if (msg) this.say(msg); this.emit('change', { nodes: this.nodes.length, edges: this.edges.length, selected: this.sel ? this.sel.text : '' }); this.draw(); }
  /* ---- 公开方法（工具栏调用） ---- */
  setTool(tool) { this.tool = tool; this.setAttribute('tool', tool); this._cv.style.cursor = tool === 'select' ? 'default' : 'crosshair'; this.say('当前工具：' + ({ select: '选择', note: '便签', link: '连线' }[tool] || tool)); }
  zoom(f, cx, cy) {
    this._touched = true;
    const v = this.view, k = Math.max(0.3, Math.min(2.5, v.k * f));
    cx = cx === undefined ? this.W / 2 : cx; cy = cy === undefined ? this.H / 2 : cy;
    v.x = cx - (cx - v.x) * (k / v.k); v.y = cy - (cy - v.y) * (k / v.k); v.k = k;
    this.say('缩放 ' + Math.round(k * 100) + '%'); this.draw();
  }
  fit(quiet) {
    if (!this.nodes.length) { this.view = { x: 30, y: 30, k: 1 }; return this.draw(); }
    const xs = this.nodes.map(function (n) { return n.x; }), ys = this.nodes.map(function (n) { return n.y; });
    const x1 = Math.min.apply(null, xs), y1 = Math.min.apply(null, ys);
    const x2 = Math.max.apply(null, this.nodes.map(function (n) { return n.x + n.w; })), y2 = Math.max.apply(null, this.nodes.map(function (n) { return n.y + n.h; }));
    const k = Math.max(0.3, Math.min(quiet ? 1 : 1.5, Math.min((this.W - 60) / (x2 - x1), (this.H - 80) / (y2 - y1))));
    this.view = { k: k, x: (this.W - (x2 - x1) * k) / 2 - x1 * k, y: (this.H - (y2 - y1) * k) / 2 - y1 * k - 10 };
    if (!quiet) this.say('已适应画布');
    this.draw();
  }
  addNote(x, y) {
    if (x === undefined) { const q = this.toWorld({ x: this.W / 2, y: this.H / 2 }); x = q.x - 75; y = q.y - 40; }
    const n = { id: this.nid++, x: x, y: y, w: 150, h: 80, text: '新便签', c: this.nodes.length % 4 };
    this.nodes.push(n); this.sel = n;
    this.changed('已新建便签，按 Enter 编辑文字');
    return n;
  }
  remove() {
    const n = this.sel; if (!n) return;
    this.nodes = this.nodes.filter(function (x) { return x !== n; });
    this.edges = this.edges.filter(function (e) { return e[0] !== n.id && e[1] !== n.id; });
    this.sel = null; this.changed('已删除「' + n.text + '」');
  }
  recolor() { if (this.sel) { this.sel.c = (this.sel.c + 1) % 4; this.changed(); } }
  edit(n) {
    n = n || this.sel; if (!n) return;
    const v = this.view, self = this;
    const inp = document.createElement('input');
    inp.value = n.text; inp.setAttribute('aria-label', '编辑便签文字');
    Object.assign(inp.style, { position: 'absolute', left: (v.x + n.x * v.k) + 'px', top: (v.y + (n.y + n.h / 2 - 16) * v.k) + 'px', width: (n.w * v.k) + 'px', height: (32 * v.k) + 'px',
      font: this.font(14 * v.k, 600), padding: '0 10px', border: '2px solid ' + this.tk.brand, borderRadius: this.tk['radius-sm'], background: this.tk.panel, color: this.tk.text, boxSizing: 'border-box', zIndex: 2 });
    this.appendChild(inp); inp.focus(); inp.select();
    let done = false;
    const commit = function (ok) {
      if (done) return; done = true;
      if (ok && inp.value.trim()) n.text = inp.value.trim().slice(0, 40);
      inp.remove(); self._cv.focus(); self.changed(ok ? '已更新为「' + n.text + '」' : '');
    };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') commit(true); if (e.key === 'Escape') commit(false); e.stopPropagation(); });
    inp.addEventListener('blur', function () { commit(true); });
  }
  /* ---- 指针 ---- */
  down(p, e) {
    const n = this.nodeAt(p);
    if (this.tool === 'note' && !n) { const q = this.toWorld(p); this.addNote(q.x - 75, q.y - 40); this.setTool('select'); this.emit('tool', { tool: 'select' }); return; }
    if (this.tool === 'link' && n) { this.linking = { from: n, to: this.toWorld(p) }; return; }
    if (n) {
      this.sel = n; this.nodes.splice(this.nodes.indexOf(n), 1); this.nodes.push(n);
      const q = this.toWorld(p); this.dragN = { n: n, dx: q.x - n.x, dy: q.y - n.y };
      this.changed('选中「' + n.text + '」');
    } else {
      if (this.sel) { this.sel = null; this.changed(); }
      this.pan = { x: p.x - this.view.x, y: p.y - this.view.y }; this._touched = true;
      this._cv.style.cursor = 'grabbing';
    }
  }
  move(p) {
    if (this.dragN) { const q = this.toWorld(p); this.dragN.n.x = Math.round(q.x - this.dragN.dx); this.dragN.n.y = Math.round(q.y - this.dragN.dy); this.draw(); return; }
    if (this.pan) { this.view.x = p.x - this.pan.x; this.view.y = p.y - this.pan.y; this.draw(); return; }
    if (this.linking) { this.linking.to = this.toWorld(p); this.draw(); return; }
    if (this.tool === 'select') this._cv.style.cursor = this.nodeAt(p) ? 'move' : 'grab';
  }
  up(p) {
    if (this.linking) {
      const to = this.nodeAt(p), from = this.linking.from;
      this.linking = null;
      if (to && to !== from && !this.edges.some(function (e) { return e[0] === from.id && e[1] === to.id; })) {
        this.edges.push([from.id, to.id]); this.changed('已连线：' + from.text + ' → ' + to.text);
      } else this.draw();
      return;
    }
    this.dragN = null; this.pan = null;
    if (this.tool === 'select') this._cv.style.cursor = 'default';
  }
  dbl(p) { const n = this.nodeAt(p); if (n) this.edit(n); else { const q = this.toWorld(p); this.addNote(q.x - 75, q.y - 40); } }
  wheel(p, e) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) this.zoom(Math.exp(-e.deltaY / 300), p.x, p.y);
    else { this.view.x -= e.deltaX; this.view.y -= e.deltaY; this._touched = true; this.draw(); }
  }
  key(e) {
    const k = e.key, n = this.sel, step = e.shiftKey ? 1 : 10;
    if (k === ']' || k === '[') {
      if (!this.nodes.length) return;
      const i = n ? this.nodes.indexOf(n) : -1, len = this.nodes.length;
      this.sel = this.nodes[k === ']' ? (i + 1) % len : (i - 1 + len) % len];
      return this.changed('选中「' + this.sel.text + '」');
    }
    if (n && k.indexOf('Arrow') === 0) {
      if (k === 'ArrowLeft') n.x -= step; if (k === 'ArrowRight') n.x += step; if (k === 'ArrowUp') n.y -= step; if (k === 'ArrowDown') n.y += step;
      return this.draw();
    }
    if (!n && k.indexOf('Arrow') === 0) {
      this._touched = true;
      const d = 40; if (k === 'ArrowLeft') this.view.x += d; if (k === 'ArrowRight') this.view.x -= d; if (k === 'ArrowUp') this.view.y += d; if (k === 'ArrowDown') this.view.y -= d;
      return this.draw();
    }
    if (k === 'Enter' && n) { e.preventDefault(); return this.edit(); }
    if ((k === 'Delete' || k === 'Backspace') && n) return this.remove();
    if (k === 'n' || k === 'N') return this.addNote();
    if (k === 'c' || k === 'C') return this.recolor();
    if (k === '+' || k === '=') return this.zoom(1.2);
    if (k === '-') return this.zoom(1 / 1.2);
    if (k === '0') return this.fit();
    if (k === 'Escape') { this.sel = null; return this.changed(); }
    return false;
  }
}
register('ui-cv-board', UICvBoard, baseCss);
