/* =========================================================
   图表（第四批）：ui-line-chart（多序列 + 悬停十字线）/ ui-gauge / ui-funnel
   文字全部用 HTML 绘制，SVG 只画线条（preserveAspectRatio="none" 拉伸），
   所以容器任意宽度下文字都不会被压扁
   ========================================================= */
import { UIElement, register } from './base.js';
import { esc } from './more-form.js';

const SERIES = ['var(--ui-brand)', 'var(--ui-ok)', 'var(--ui-warn)', 'var(--ui-danger)',
  'color-mix(in srgb,var(--ui-brand) 50%,var(--ui-sub))'];
function parseArr(text) { try { const v = JSON.parse(text || '[]'); return Array.isArray(v) ? v : null; } catch (e) { return null; } }
const fmt = (n) => Math.abs(n) >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, '') + '万' : String(Math.round(n * 100) / 100);
const splitList = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

/* 取一个「好看」的刻度上限：1 / 2 / 2.5 / 5 × 10^n */
function niceMax(v) {
  if (v <= 0) return 1;
  const e = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / e;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e;
}

/* ---------------- Line Chart 折线图 ---------------- */
export const lineChartCss = `
ui-line-chart{display:block;width:100%;min-width:0}
.ui-lc{display:flex;flex-direction:column;gap:8px}
.ui-lc__hd{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 14px}
.ui-lc__t{font-size:13px;font-weight:600;color:var(--ui-text)}
.ui-lc__lg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11.5px;color:var(--ui-sub)}
.ui-lc__lg span{display:inline-flex;align-items:center;gap:5px}
.ui-lc__lg i{width:10px;height:3px;border-radius:2px;background:var(--c)}
.ui-lc__body{display:grid;grid-template-columns:auto 1fr;gap:0 8px}
.ui-lc__y{display:flex;flex-direction:column-reverse;justify-content:space-between;height:var(--h,180px);font-size:10.5px;color:var(--ui-sub);
  text-align:right;font-variant-numeric:tabular-nums;transform:translateY(0.6em)}
.ui-lc__plot{position:relative;height:var(--h,180px);outline:none;border-radius:2px;
  background:repeating-linear-gradient(to top,color-mix(in srgb,var(--ui-line) 70%,transparent) 0 1px,transparent 1px 25%);
  border-bottom:var(--ui-border-w) solid var(--ui-line)}
.ui-lc__plot:focus-visible{box-shadow:var(--ui-ring)}
.ui-lc__plot svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.ui-lc__plot path.l{fill:none;stroke:var(--c);stroke-width:2.2;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}
.ui-lc__plot path.a{fill:var(--c);opacity:.10}
.ui-lc__guide{position:absolute;top:0;bottom:0;width:1px;background:var(--ui-sub);opacity:.5;pointer-events:none}
.ui-lc__dot{position:absolute;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:var(--ui-panel);border:2px solid var(--c);pointer-events:none;box-sizing:border-box}
.ui-lc__tip{position:absolute;top:4px;z-index:2;min-width:110px;padding:7px 9px;pointer-events:none;font-size:11.5px;color:var(--ui-text);
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);box-shadow:var(--ui-shadow)}
.ui-lc__tip b{display:block;margin-bottom:3px;font-size:11.5px}
.ui-lc__tip div{display:flex;align-items:center;gap:6px;justify-content:space-between}
.ui-lc__tip div span{display:inline-flex;align-items:center;gap:5px;color:var(--ui-sub)}
.ui-lc__tip div span::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--c)}
.ui-lc__tip[hidden],.ui-lc__guide[hidden],.ui-lc__dot[hidden]{display:none}
.ui-lc__x{display:flex;justify-content:space-between;margin-left:var(--yw,0);font-size:10.5px;color:var(--ui-sub)}
.ui-lc__x span{flex:0 0 auto;width:0;display:flex;justify-content:center;white-space:nowrap}
`;

export class UILineChart extends UIElement {
  static props = { labels: { default: '' }, series: { default: '[]' }, title: { default: '' }, height: { default: '180' }, area: { type: 'boolean' }, unit: { default: '' } };
  template(p) {
    const labels = splitList(p.labels);
    const series = parseArr(p.series);
    if (!series || !labels.length) return '<div style="font-size:12px;color:var(--ui-sub)">需要 labels（逗号分隔）与 series（JSON：[{ name, data }]）</div>';
    const n = labels.length;
    const max = niceMax(Math.max.apply(null, series.reduce((a, s) => a.concat((s.data || []).map(Number)), [0])));
    const pts = (s) => (s.data || []).slice(0, n).map((v, i) => [n === 1 ? 50 : (i / (n - 1)) * 100, 100 - (Number(v) || 0) / max * 100]);
    const paths = series.map((s, k) => {
      const pp = pts(s);
      if (!pp.length) return '';
      const d = 'M' + pp.map((q) => q[0].toFixed(2) + ' ' + q[1].toFixed(2)).join(' L');
      return '<g style="--c:' + SERIES[k % SERIES.length] + '">' + (p.area ? '<path class="a" d="' + d + ' L' + pp[pp.length - 1][0] + ' 100 L' + pp[0][0] + ' 100Z"></path>' : '') + '<path class="l" d="' + d + '"></path></g>';
    }).join('');
    /* 标签太密时只显示一部分 */
    const every = Math.max(1, Math.ceil(n / 8));
    const ticks = [0, 1, 2, 3, 4].map((i) => '<span>' + fmt(max / 4 * i) + '</span>').join('');
    const summary = series.map((s) => esc(s.name) + '：' + (s.data || []).map(fmt).join('、')).join('；');
    return '<figure class="ui-lc" style="margin:0;--h:' + (Number(p.height) || 180) + 'px">' +
      '<div class="ui-lc__hd"><span class="ui-lc__t">' + esc(p.title) + (p.unit ? '<small style="font-weight:400;color:var(--ui-sub)">（' + esc(p.unit) + '）</small>' : '') + '</span>' +
      '<span class="ui-lc__lg">' + series.map((s, k) => '<span style="--c:' + SERIES[k % SERIES.length] + '"><i></i>' + esc(s.name) + '</span>').join('') + '</span></div>' +
      '<div class="ui-lc__body"><div class="ui-lc__y" aria-hidden="true">' + ticks + '</div>' +
      '<div class="ui-lc__plot" tabindex="0" role="img" aria-label="' + esc(p.title || '折线图') + '。' + summary + '。可用左右方向键逐点查看">' +
      '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + paths + '</svg>' +
      '<span class="ui-lc__guide" hidden></span>' + series.map((s, k) => '<span class="ui-lc__dot" style="--c:' + SERIES[k % SERIES.length] + '" hidden></span>').join('') +
      '<div class="ui-lc__tip" hidden aria-live="polite"></div></div></div>' +
      '<div class="ui-lc__x" aria-hidden="true">' + labels.map((l, i) => '<span>' + (i % every === 0 || i === n - 1 ? esc(l) : '') + '</span>').join('') + '</div></figure>';
  }
  mounted() {
    const self = this;
    const plot = this.querySelector('.ui-lc__plot');
    if (!plot) return;
    const y = this.querySelector('.ui-lc__y');
    this.querySelector('.ui-lc__x').style.setProperty('--yw', (y.offsetWidth + 8) + 'px');
    const labels = splitList(this.props.labels);
    const series = parseArr(this.props.series) || [];
    const n = labels.length;
    const max = niceMax(Math.max.apply(null, series.reduce((a, s) => a.concat((s.data || []).map(Number)), [0])));
    const guide = plot.querySelector('.ui-lc__guide');
    const dots = plot.querySelectorAll('.ui-lc__dot');
    const tip = plot.querySelector('.ui-lc__tip');
    let cur = -1;
    const show = (i) => {
      cur = Math.max(0, Math.min(n - 1, i));
      const x = n === 1 ? 50 : cur / (n - 1) * 100;
      guide.hidden = false; guide.style.left = x + '%';
      series.forEach((s, k) => {
        const v = Number((s.data || [])[cur]);
        const dot = dots[k];
        if (isNaN(v)) { dot.hidden = true; return; }
        dot.hidden = false; dot.style.left = x + '%'; dot.style.top = (100 - v / max * 100) + '%';
      });
      tip.innerHTML = '<b>' + esc(labels[cur]) + '</b>' + series.map((s, k) => '<div style="--c:' + SERIES[k % SERIES.length] + '"><span>' + esc(s.name) + '</span>' + fmt(Number((s.data || [])[cur]) || 0) + esc(self.props.unit) + '</div>').join('');
      tip.hidden = false;
      const w = plot.clientWidth, tw = tip.offsetWidth, px = x / 100 * w;
      tip.style.left = (px + 12 + tw > w ? Math.max(0, px - 12 - tw) : px + 12) + 'px';
    };
    const hide = () => { cur = -1; guide.hidden = true; tip.hidden = true; dots.forEach((d) => { d.hidden = true; }); };
    plot.addEventListener('pointermove', (e) => {
      const r = plot.getBoundingClientRect();
      show(Math.round((e.clientX - r.left) / r.width * (n - 1)));
    });
    plot.addEventListener('pointerleave', () => { if (document.activeElement !== plot) hide(); });
    plot.addEventListener('focus', () => show(cur < 0 ? n - 1 : cur));
    plot.addEventListener('blur', hide);
    plot.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show((cur < 0 ? n - 1 : cur) + (e.key === 'ArrowRight' ? 1 : -1)); }
      else if (e.key === 'Home') { e.preventDefault(); show(0); }
      else if (e.key === 'End') { e.preventDefault(); show(n - 1); }
    });
  }
}
register('ui-line-chart', UILineChart, lineChartCss);

/* ---------------- Gauge 仪表盘 ---------------- */
export const gaugeCss = `
ui-gauge{display:inline-block;width:100%;max-width:var(--w,220px)}
.ui-gauge{position:relative;margin:0;text-align:center}
.ui-gauge svg{display:block;width:100%;height:auto;overflow:visible}
.ui-gauge .bg{fill:none;stroke:var(--ui-panel-2);stroke-width:14;stroke-linecap:round}
.ui-gauge .fg{fill:none;stroke:var(--c);stroke-width:14;stroke-linecap:round;transition:stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)}
.ui-gauge .tk{stroke:var(--ui-sub);stroke-width:1.5;opacity:.5}
.ui-gauge__v{position:absolute;left:0;right:0;bottom:4%;display:flex;flex-direction:column;align-items:center;line-height:1.1}
.ui-gauge__v b{font-size:clamp(18px,9cqw,30px);color:var(--ui-text);font-variant-numeric:tabular-nums}
.ui-gauge__v small{font-size:11.5px;color:var(--ui-sub);margin-top:2px}
.ui-gauge__mm{display:flex;justify-content:space-between;padding:0 4%;font-size:10.5px;color:var(--ui-sub);font-variant-numeric:tabular-nums}
`;

export class UIGauge extends UIElement {
  static props = { value: { default: '0' }, min: { default: '0' }, max: { default: '100' }, label: { default: '' }, unit: { default: '' }, thresholds: { default: '60,85' }, reverse: { type: 'boolean' }, width: { default: '220' } };
  template(p) {
    const min = Number(p.min) || 0, max = Number(p.max) || 100;
    const v = Math.max(min, Math.min(max, Number(p.value) || 0));
    const pct = (v - min) / (max - min || 1);
    const th = splitList(p.thresholds).map(Number);
    /* 默认：越高越危险（CPU / 占用率）；reverse：越高越好（健康分） */
    const lv = pct * 100 < (th[0] || 60) ? 0 : pct * 100 < (th[1] || 85) ? 1 : 2;
    const colors = p.reverse ? ['var(--ui-danger)', 'var(--ui-warn)', 'var(--ui-ok)'] : ['var(--ui-ok)', 'var(--ui-warn)', 'var(--ui-danger)'];
    const r = 80, L = Math.PI * r;
    let ticks = '';
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * (1 - i / 10);
      const x1 = 100 + Math.cos(a) * (r - 14), y1 = 100 - Math.sin(a) * (r - 14);
      const x2 = 100 + Math.cos(a) * (r - (i % 5 ? 18 : 22)), y2 = 100 - Math.sin(a) * (r - (i % 5 ? 18 : 22));
      ticks += '<line class="tk" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"></line>';
    }
    return '<figure class="ui-gauge" style="--c:' + colors[lv] + ';container-type:inline-size;margin:0" role="meter" aria-valuemin="' + min + '" aria-valuemax="' + max + '" aria-valuenow="' + v + '" aria-label="' + esc(p.label || '仪表') + '">' +
      '<svg viewBox="0 0 200 110" aria-hidden="true"><path class="bg" d="M20 100 A80 80 0 0 1 180 100"></path>' +
      '<path class="fg" d="M20 100 A80 80 0 0 1 180 100" stroke-dasharray="' + L.toFixed(2) + '" stroke-dashoffset="' + (L * (1 - pct)).toFixed(2) + '"></path>' + ticks + '</svg>' +
      '<div class="ui-gauge__v"><b>' + fmt(v) + esc(p.unit) + '</b>' + (p.label ? '<small>' + esc(p.label) + '</small>' : '') + '</div>' +
      '</figure><div class="ui-gauge__mm" aria-hidden="true"><span>' + fmt(min) + '</span><span>' + fmt(max) + '</span></div>';
  }
  connectedCallback() { this.style.setProperty('--w', (Number(this.getAttribute('width')) || 220) + 'px'); super.connectedCallback(); }
}
register('ui-gauge', UIGauge, gaugeCss);

/* ---------------- Funnel 漏斗图 ---------------- */
export const funnelCss = `
ui-funnel{display:block;width:100%;min-width:0}
.ui-fn{margin:0;display:flex;flex-direction:column;gap:4px}
.ui-fn__t{font-size:13px;font-weight:600;color:var(--ui-text);margin-bottom:6px}
.ui-fn__row{display:grid;grid-template-columns:minmax(56px,auto) 1fr;align-items:center;gap:10px}
.ui-fn__l{font-size:12px;color:var(--ui-sub);text-align:right;white-space:nowrap}
.ui-fn__bar{display:flex;justify-content:center}
.ui-fn__bar i{display:flex;align-items:center;justify-content:center;height:30px;width:var(--w);min-width:44px;font-style:normal;
  font-size:12px;font-weight:600;color:var(--ui-brand-ink);background:var(--c);border-radius:var(--ui-radius-sm);font-variant-numeric:tabular-nums;
  transition:width .6s cubic-bezier(.2,.7,.2,1);white-space:nowrap;overflow:hidden}
.ui-fn__cv{grid-column:2;display:flex;justify-content:center;font-size:10.5px;color:var(--ui-sub);line-height:1.2}
.ui-fn__cv::before{content:"↓ ";opacity:.6}
`;

export class UIFunnel extends UIElement {
  static props = { data: { default: '[]' }, title: { default: '' } };
  template(p) {
    const list = parseArr(p.data);
    if (!list || !list.length) return '<div style="font-size:12px;color:var(--ui-sub)">data 需要是 JSON 数组：[{ "label", "value" }]</div>';
    const top = Number(list[0].value) || 1;
    const shades = ['var(--ui-brand)', 'color-mix(in srgb,var(--ui-brand) 85%,var(--ui-ok))', 'color-mix(in srgb,var(--ui-brand) 65%,var(--ui-ok))',
      'color-mix(in srgb,var(--ui-brand) 45%,var(--ui-ok))', 'color-mix(in srgb,var(--ui-brand) 25%,var(--ui-ok))', 'var(--ui-ok)'];
    return '<figure class="ui-fn" role="img" aria-label="' + esc(p.title || '漏斗') + '：' + list.map((x) => esc(x.label) + ' ' + fmt(Number(x.value) || 0)).join('，') + '">' +
      (p.title ? '<div class="ui-fn__t">' + esc(p.title) + '</div>' : '') +
      list.map((x, i) => {
        const v = Number(x.value) || 0;
        const prev = i ? Number(list[i - 1].value) || 1 : 0;
        return (i ? '<div class="ui-fn__row"><span></span><span class="ui-fn__cv">转化 ' + (v / prev * 100).toFixed(1) + '%</span></div>' : '') +
          '<div class="ui-fn__row"><span class="ui-fn__l">' + esc(x.label) + '</span><span class="ui-fn__bar"><i style="--w:' + Math.max(8, v / top * 100).toFixed(1) + '%;--c:' + shades[Math.min(i, shades.length - 1)] + '">' + fmt(v) + '</i></span></div>';
      }).join('') + '</figure>';
  }
}
register('ui-funnel', UIFunnel, funnelCss);
