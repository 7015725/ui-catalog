/* =========================================================
   图表：ui-sparkline / ui-bar-chart / ui-donut / ui-heatmap
   零依赖、纯 SVG / CSS；配色全部来自 token，换风格自动换色
   宽度自适应：SVG 用 viewBox + preserveAspectRatio，条形图用 flex
   ========================================================= */
import { UIElement, register } from './base.js';
import { esc } from './more-form.js';

const nums = (s) => String(s || '').split(',').map((x) => x.trim()).filter((x) => x !== '').map(Number).filter((x) => !isNaN(x));
const SERIES = ['var(--ui-brand)', 'var(--ui-ok)', 'var(--ui-warn)', 'var(--ui-danger)',
  'color-mix(in srgb,var(--ui-brand) 50%,var(--ui-sub))', 'color-mix(in srgb,var(--ui-ok) 50%,var(--ui-brand))'];
const COLOR = { brand: SERIES[0], success: SERIES[1], warn: SERIES[2], danger: SERIES[3] };
const fmt = (n) => Math.abs(n) >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, '') + '万' : String(Math.round(n * 100) / 100);
function parseArr(text) { try { const v = JSON.parse(text || '[]'); return Array.isArray(v) ? v : null; } catch (e) { return null; } }

/* ---------------- Sparkline 迷你趋势线 ---------------- */
export const sparklineCss = `
ui-sparkline{display:block;width:100%;min-width:0}
.ui-spark{display:flex;flex-direction:column;gap:4px}
.ui-spark__hd{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:12px;color:var(--ui-sub)}
.ui-spark__hd b{font-size:20px;color:var(--ui-text);font-variant-numeric:tabular-nums}
.ui-spark__d{font-size:11.5px;font-weight:600}
.ui-spark__d--up{color:var(--ui-ok)}.ui-spark__d--down{color:var(--ui-danger)}
.ui-spark svg{display:block;width:100%;height:var(--h,48px);overflow:visible}
.ui-spark path.l{fill:none;stroke:var(--c);stroke-width:2;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}
.ui-spark path.a{fill:var(--c);opacity:.14}
`;

export class UISparkline extends UIElement {
  static props = { data: { default: '' }, label: { default: '' }, color: { default: 'brand' }, height: { default: '48' }, area: { default: 'true' } };
  template(p) {
    const d = nums(p.data);
    if (d.length < 2) return '<div style="font-size:12px;color:var(--ui-sub)">data 至少需要 2 个数字</div>';
    const W = 100, H = 40, min = Math.min.apply(null, d), max = Math.max.apply(null, d), span = max - min || 1;
    const pts = d.map((v, i) => [(i / (d.length - 1)) * W, H - 2 - ((v - min) / span) * (H - 4)]);
    const line = 'M' + pts.map((q) => q[0].toFixed(2) + ' ' + q[1].toFixed(2)).join(' L');
    const last = d[d.length - 1], prev = d[0];
    const pct = prev ? ((last - prev) / Math.abs(prev)) * 100 : 0;
    const c = COLOR[p.color] || esc(p.color);
    return '<div class="ui-spark" style="--c:' + c + ';--h:' + (Number(p.height) || 48) + 'px">' +
      (p.label ? '<div class="ui-spark__hd"><span>' + esc(p.label) + '</span><span class="ui-spark__d ui-spark__d--' + (pct >= 0 ? 'up' : 'down') + '">' +
        (pct >= 0 ? '▲ ' : '▼ ') + Math.abs(pct).toFixed(1) + '%</span></div><div class="ui-spark__hd"><b>' + fmt(last) + '</b></div>' : '') +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + esc(p.label || '趋势') + '：从 ' + fmt(prev) + ' 到 ' + fmt(last) + '">' +
      (p.area !== 'false' ? '<path class="a" d="' + line + ' L' + W + ' ' + H + ' L0 ' + H + 'Z"></path>' : '') +
      '<path class="l" d="' + line + '"></path></svg></div>';
  }
}
register('ui-sparkline', UISparkline, sparklineCss);

/* ---------------- Bar Chart 柱状图 ---------------- */
export const barChartCss = `
ui-bar-chart{display:block;width:100%;min-width:0}
.ui-bar{display:flex;flex-direction:column;gap:8px}
.ui-bar__t{font-size:13px;font-weight:600;color:var(--ui-text)}
.ui-bar__plot{position:relative;display:flex;align-items:flex-end;gap:clamp(4px,2%,14px);height:var(--h,160px);
  padding-top:18px;border-bottom:var(--ui-border-w) solid var(--ui-line);
  background:repeating-linear-gradient(to top,transparent 0,transparent calc(25% - 1px),color-mix(in srgb,var(--ui-line) 60%,transparent) calc(25% - 1px),color-mix(in srgb,var(--ui-line) 60%,transparent) 25%)}
.ui-bar__col{flex:1;min-width:0;height:100%;display:flex;align-items:flex-end;justify-content:center;position:relative}
.ui-bar__col i{display:block;width:min(100%,38px);height:var(--v);border-radius:var(--ui-radius-sm) var(--ui-radius-sm) 0 0;
  background:var(--c,var(--ui-brand));transition:height .5s cubic-bezier(.2,.7,.2,1),filter var(--ui-motion);position:relative}
.ui-bar__col:hover i{filter:brightness(1.12)}
.ui-bar__col i::after{content:attr(data-v);position:absolute;bottom:100%;left:50%;transform:translateX(-50%);
  padding-bottom:3px;font-size:10.5px;font-style:normal;color:var(--ui-sub);white-space:nowrap;font-variant-numeric:tabular-nums}
.ui-bar__x{display:flex;gap:clamp(4px,2%,14px)}
.ui-bar__x span{flex:1;min-width:0;text-align:center;font-size:11px;color:var(--ui-sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ui-bar--h .ui-bar__plot{display:none}
.ui-bar__rows{display:flex;flex-direction:column;gap:8px}
.ui-bar__row{display:grid;grid-template-columns:minmax(48px,max-content) 1fr auto;align-items:center;gap:10px;font-size:12px;color:var(--ui-sub)}
.ui-bar__row div{height:10px;border-radius:99px;background:var(--ui-panel-2);overflow:hidden}
.ui-bar__row div i{display:block;height:100%;width:var(--v);border-radius:inherit;background:var(--c,var(--ui-brand))}
.ui-bar__row b{color:var(--ui-text);font-weight:600;font-variant-numeric:tabular-nums}
@container (max-width:300px){ .ui-bar__col i::after{display:none} }
`;

export class UIBarChart extends UIElement {
  static props = { data: { default: '[]' }, title: { default: '' }, horizontal: { type: 'boolean' }, height: { default: '160' }, multicolor: { type: 'boolean' } };
  template(p) {
    const list = parseArr(p.data);
    if (!list) return '<div style="font-size:12px;color:var(--ui-sub)">data 需要是 JSON 数组：[{ "label", "value" }]</div>';
    const max = Math.max.apply(null, list.map((x) => Number(x.value) || 0).concat(1));
    const color = (i) => p.multicolor ? ' style="--c:' + SERIES[i % SERIES.length] + '"' : '';
    const title = p.title ? '<div class="ui-bar__t">' + esc(p.title) + '</div>' : '';
    const aria = esc(p.title || '柱状图') + '：' + list.map((x) => esc(x.label) + ' ' + fmt(Number(x.value) || 0)).join('，');
    if (p.horizontal) {
      return '<figure class="ui-bar ui-bar--h" role="img" aria-label="' + aria + '" style="margin:0">' + title + '<div class="ui-bar__rows">' + list.map((x, i) =>
        '<div class="ui-bar__row"' + color(i) + '><span>' + esc(x.label) + '</span><div><i style="--v:' + ((Number(x.value) || 0) / max * 100).toFixed(1) + '%"></i></div><b>' + fmt(Number(x.value) || 0) + '</b></div>'
      ).join('') + '</div></figure>';
    }
    return '<figure class="ui-bar" role="img" aria-label="' + aria + '" style="margin:0;container-type:inline-size;--h:' + (Number(p.height) || 160) + 'px">' + title +
      '<div class="ui-bar__plot">' + list.map((x, i) =>
        '<div class="ui-bar__col"' + color(i) + ' title="' + esc(x.label) + '：' + fmt(Number(x.value) || 0) + '"><i data-v="' + fmt(Number(x.value) || 0) + '" style="--v:' + ((Number(x.value) || 0) / max * 100).toFixed(1) + '%"></i></div>'
      ).join('') + '</div><div class="ui-bar__x" aria-hidden="true">' + list.map((x) => '<span>' + esc(x.label) + '</span>').join('') + '</div></figure>';
  }
}
register('ui-bar-chart', UIBarChart, barChartCss);

/* ---------------- Donut 环形图 ---------------- */
export const donutCss = `
ui-donut{display:block;width:100%;min-width:0}
.ui-donut{display:flex;flex-wrap:wrap;align-items:center;gap:16px}
.ui-donut__fig{position:relative;flex:0 0 auto;width:var(--sz,132px);height:var(--sz,132px)}
.ui-donut svg{display:block;width:100%;height:100%;transform:rotate(-90deg)}
.ui-donut circle{fill:none;stroke-width:16;transition:stroke-width var(--ui-motion)}
.ui-donut circle.s:hover{stroke-width:20}
.ui-donut__c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.2}
.ui-donut__c b{font-size:18px;color:var(--ui-text);font-variant-numeric:tabular-nums}
.ui-donut__c small{font-size:11px;color:var(--ui-sub)}
.ui-donut__lg{flex:1;min-width:140px;list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}
.ui-donut__lg li{display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:8px;font-size:12.5px;color:var(--ui-sub)}
.ui-donut__lg i{width:10px;height:10px;border-radius:3px}
.ui-donut__lg b{color:var(--ui-text);font-weight:600;font-variant-numeric:tabular-nums}
`;

export class UIDonut extends UIElement {
  static props = { data: { default: '[]' }, label: { default: '合计' }, size: { default: '132' } };
  template(p) {
    const list = parseArr(p.data);
    if (!list) return '<div style="font-size:12px;color:var(--ui-sub)">data 需要是 JSON 数组：[{ "label", "value" }]</div>';
    const total = list.reduce((s, x) => s + (Number(x.value) || 0), 0) || 1;
    const r = 42, C = 2 * Math.PI * r;
    let acc = 0;
    const segs = list.map((x, i) => {
      const v = (Number(x.value) || 0) / total;
      const gap = list.length > 1 ? Math.min(2, v * C * 0.3) : 0;
      const s = '<circle class="s" cx="50" cy="50" r="' + r + '" stroke="' + SERIES[i % SERIES.length] + '" stroke-dasharray="' + Math.max(0, v * C - gap).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-acc * C).toFixed(2) + '"><title>' + esc(x.label) + ' ' + (v * 100).toFixed(1) + '%</title></circle>';
      acc += v;
      return s;
    }).join('');
    return '<figure class="ui-donut" style="margin:0;--sz:' + (Number(p.size) || 132) + 'px" role="img" aria-label="' + list.map((x) => esc(x.label) + ' ' + ((Number(x.value) || 0) / total * 100).toFixed(0) + '%').join('，') + '">' +
      '<div class="ui-donut__fig"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="' + r + '" stroke="var(--ui-panel-2)"></circle>' + segs + '</svg>' +
      '<div class="ui-donut__c"><b>' + fmt(total) + '</b><small>' + esc(p.label) + '</small></div></div>' +
      '<ul class="ui-donut__lg">' + list.map((x, i) => '<li><i style="background:' + SERIES[i % SERIES.length] + '"></i><span>' + esc(x.label) + '</span><b>' + ((Number(x.value) || 0) / total * 100).toFixed(0) + '%</b></li>').join('') + '</ul></figure>';
  }
}
register('ui-donut', UIDonut, donutCss);

/* ---------------- Heatmap 贡献热力图 ---------------- */
export const heatmapCss = `
ui-heatmap{display:block;width:100%;min-width:0}
.ui-heat{display:flex;flex-direction:column;gap:8px}
.ui-heat__grid{display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,auto);gap:3px;overflow-x:auto;padding-bottom:2px;
  grid-auto-columns:minmax(9px,1fr)}
.ui-heat__grid i{display:block;aspect-ratio:1;border-radius:2px;background:var(--ui-panel-2);min-width:9px;max-width:22px}
.ui-heat i[data-l="1"]{background:color-mix(in srgb,var(--ui-brand) 28%,var(--ui-panel-2))}
.ui-heat i[data-l="2"]{background:color-mix(in srgb,var(--ui-brand) 52%,var(--ui-panel-2))}
.ui-heat i[data-l="3"]{background:color-mix(in srgb,var(--ui-brand) 76%,var(--ui-panel-2))}
.ui-heat i[data-l="4"]{background:var(--ui-brand)}
.ui-heat__ft{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11.5px;color:var(--ui-sub);flex-wrap:wrap}
.ui-heat__lg{display:inline-flex;align-items:center;gap:3px}
.ui-heat__lg i{width:10px;height:10px;border-radius:2px;display:inline-block;background:var(--ui-panel-2)}
`;

export class UIHeatmap extends UIElement {
  static props = { weeks: { default: '20' }, data: { default: '' }, seed: { default: '7' }, label: { default: '' } };
  template(p) {
    const w = Math.min(53, Math.max(4, Number(p.weeks) || 20));
    let levels = nums(p.data).map((v) => Math.max(0, Math.min(4, Math.round(v))));
    if (!levels.length) {
      /* 没给数据时用种子生成稳定的示例数据（同一个 seed 每次一样） */
      let s = Number(p.seed) || 7;
      const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      levels = Array.from({ length: w * 7 }, (_, i) => { const r = rnd() + (i % 7 > 0 && i % 7 < 6 ? 0.15 : -0.2); return r < 0.35 ? 0 : r < 0.6 ? 1 : r < 0.8 ? 2 : r < 0.93 ? 3 : 4; });
    }
    levels = levels.slice(-w * 7);
    const total = levels.filter(Boolean).length;
    return '<div class="ui-heat">' +
      '<div class="ui-heat__grid" role="img" aria-label="' + esc(p.label || '活跃度') + '：' + w + ' 周内 ' + total + ' 天有记录">' +
      levels.map((l) => '<i data-l="' + l + '"></i>').join('') + '</div>' +
      '<div class="ui-heat__ft"><span>' + esc(p.label || ('最近 ' + w + ' 周 · ' + total + ' 天有记录')) + '</span>' +
      '<span class="ui-heat__lg" aria-hidden="true">少 ' + [0, 1, 2, 3, 4].map((l) => '<i data-l="' + l + '"></i>').join('') + ' 多</span></div></div>';
  }
}
register('ui-heatmap', UIHeatmap, heatmapCss);
