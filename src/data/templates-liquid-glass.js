/* 原生 Web 页面：液态玻璃经营后台。静态标记预生成；init 不依赖这些构造器。 */
import { reduced, loop } from '../lib/motion.js';
const ICONS = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  revenue: '<path d="M4 20V10m6 10V4m6 16v-7m5 7H2m14-13 4-4m-4 0h4v4"/>',
  audience: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>',
  ranking: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5"/>',
  goal: '<path d="M17.5 6.5a8 8 0 1 0 2 6.5M14 8a4.5 4.5 0 1 0 2.5 4m-4.5 0 8-8m-1-1h2v2"/>',
  sources: '<path d="M4 4h16l-6 7v7l-4 2v-9L4 4Z"/>',
  orders: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 4h6m-6 4h6m-6 4h3"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  expand: '<path d="M14 4h6v6m0-6-7 7M4 14v6h6m-6 0 7-7"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  collapse: '<path d="m14 5-7 7 7 7m6-14-7 7 7 7"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
  down: '<path d="m6 9 6 6 6-6"/>'
};
const icon = (name) => `<svg class="lg-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.overview}</svg>`;
const attr = (data) => JSON.stringify(data).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
const metric = (key, value, kind = 'int', cls = '') => {
  if (kind === 'pct' || kind === 'delta') return `<ui-count-up class="lg-number ${cls}" data-metric="${key}" to="${value}" from="${value}" duration="900" decimals="1" ${kind === 'delta' ? 'prefix="+"' : ''} suffix="%"></ui-count-up>`;
  return `${kind === 'currency' ? '<span aria-hidden="true">¥</span><span class="lg-sr">人民币</span>' : ''}<ui-odometer class="lg-number ${cls}" data-metric="${key}" value="${value}" duration="900"></ui-odometer>`;
};
const pages = [['overview', '经营概览'], ['revenue', '收入分析'], ['audience', '客户洞察'], ['ranking', '产品表现'], ['goal', '目标追踪']];
const modules = [['revenue', '收入趋势'], ['audience', '客户结构'], ['goal', '目标追踪'], ['ranking', '产品表现'], ['sources', '收入来源'], ['orders', '订单动态']];
const nav = (dock = false) => pages.map(([key, name]) => `<ui-button variant="ghost" class="lg-nav-item" data-page="${key}">${icon(key)}<span class="${dock ? 'lg-tip' : 'lg-side-label'}">${name}</span>${dock ? '<i class="lg-current-dot" aria-hidden="true"></i>' : ''}</ui-button>`).join('');
const bars = [37, 53, 44, 61, 48, 68, 55, 73, 65, 86, 74, 92, 79, 97];
const contents = {
  revenue: `<div class="lg-legend"><span>本期收入 · 示例走势</span><span>持续增长 ↗</span></div><ui-bar-chart data-chart="revenue" height="142" data='${attr(bars.map((value, i) => ({ label: i % 2 ? '' : ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i / 2], value })))}'></ui-bar-chart><p class="lg-muted lg-card-note">让每一次增长，都有迹可循。</p>`,
  audience: `<ui-donut data-chart="audience" label="活跃客户" size="132" data='${attr([{ label: '新客户', value: 5724 }, { label: '回访客户', value: 2768 }])}'></ui-donut><p class="lg-muted lg-card-note">复购率 <strong>${metric('repeat', 32.6, 'pct')}</strong></p>`,
  goal: `<p class="lg-muted">周期收入达成率</p><div class="lg-goal-value">${metric('goal', 78.3, 'pct')}</div><p class="lg-muted">每一步，都在靠近目标。</p><ui-progress data-chart="goal" value="78.31" label="周期收入目标"></ui-progress><div class="lg-legend"><span>0%</span><span>目标 ${metric('target', 164000, 'currency')}</span></div>`,
  ranking: `<ui-table data-products dense caption="产品收入榜 · 本地示例" columns='${attr([{ key: 'name', title: '产品 / 方案' }, { key: 'revenue', title: '净收入' }, { key: 'delta', title: '环比' }])}' rows='${attr([{ name: 'Pro 年度订阅', revenue: '¥58,200', delta: '+18.2%' }, { name: '团队协作方案', revenue: '¥42,800', delta: '+12.6%' }, { name: '专业版月订阅', revenue: '¥27,430', delta: '+7.4%' }])}'></ui-table>`,
  sources: `<div class="lg-sources">${[['自然搜索', 'source1', 46], ['直接访问', 'source2', 32], ['社交推荐', 'source3', 22]].map(([name, key, value]) => `<ui-progress data-chart="source" data-source="${key}" value="${value}" label="${name}" show-value></ui-progress>`).join('')}</div><p class="lg-muted lg-card-note">好的产品，让增长自然发生。</p>`,
  orders: `<div class="lg-order-value">${metric('orders', 1284)}<small class="lg-muted">笔成交</small></div><p class="lg-muted">平均客单 ${metric('aov', 100, 'currency')}</p><ui-sparkline data-chart="orders" data="20,32,24,47,39,58,52,74,66,87" height="72"></ui-sparkline><p class="lg-muted lg-card-note">一切井然有序 · 固定演示记录</p>`
};
const detailStat = (label, key, value, kind = 'int') => `<div class="lg-detail-stat"><span class="lg-muted">${label}</span><strong>${metric(key, value, kind)}</strong></div>`;
const detailKpi = (label, key, value, kind = 'int') => `<div class="lg-detail-kpi"><p class="lg-muted">${label}</p><strong>${metric(key, value, kind)}</strong></div>`;
const detailContents = {
  revenue: `<div class="lg-detail-columns"><div>${detailKpi('本期净收入', 'revenue', 128430, 'currency')}${contents.revenue}</div><aside class="lg-subpanel" aria-label="收入质量"><h3>收入质量</h3>${detailStat('平均客单价', 'aov', 100, 'currency')}${detailStat('成交转化率', 'conversion', 4.8, 'pct')}${detailStat('退款率', 'refund', 1.2, 'pct')}<p class="lg-muted">切换时间胶囊，数字和图表一起流向新的示例周期。</p></aside></div><h3>产品收入贡献 · 示例数据</h3>${contents.ranking}`,
  audience: `<div class="lg-detail-columns"><div>${detailKpi('周期活跃客户', 'customers', 8492)}${contents.audience}</div><aside class="lg-subpanel" aria-label="客户关系"><h3>关系，比访问更重要</h3>${detailStat('活跃客户增长', 'customersDelta', 6.4, 'delta')}${detailStat('成交转化率', 'conversion', 4.8, 'pct')}${detailStat('新客户', 'newCustomers', 5724)}${detailStat('回访客户', 'returnCustomers', 2768)}<p class="lg-muted">新客户是开始，回访是信任。示例数据不包含真实客户信息。</p></aside></div>`,
  goal: `<div class="lg-detail-columns"><div>${contents.goal}</div><aside class="lg-subpanel" aria-label="收入目标"><h3>下一步，继续向前</h3>${detailStat('已完成收入', 'revenue', 128430, 'currency')}${detailStat('距离目标', 'remaining', 35570, 'currency')}${detailStat('周期目标', 'target', 164000, 'currency')}<p class="lg-muted">完成率按净收入与周期目标计算；筛选同时更新目标与进度。</p></aside></div>`,
  ranking: `<div class="lg-detail-stats">${detailKpi('产品净收入', 'revenue', 128430, 'currency')}${detailKpi('有效订单', 'orders', 1284)}${detailKpi('平均客单价', 'aov', 100, 'currency')}</div><h3>产品收入榜</h3>${contents.ranking}<ui-bar-chart horizontal data-chart="products" title="产品收入贡献" data='${attr([{ label: 'Pro 年度订阅', value: 58200 }, { label: '团队协作方案', value: 42800 }, { label: '专业版月订阅', value: 27430 }])}'></ui-bar-chart><p class="lg-muted">收入贡献条随时间筛选变化；所有金额都是固定演示数据。</p>`,
  sources: `<div class="lg-detail-columns"><div>${detailKpi('渠道贡献净收入', 'revenue', 128430, 'currency')}${contents.sources}</div><aside class="lg-subpanel" aria-label="渠道净收入"><h3>渠道净收入</h3>${detailStat('自然搜索', 'sourceRevenue1', 59078, 'currency')}${detailStat('直接访问', 'sourceRevenue2', 41098, 'currency')}${detailStat('社交推荐', 'sourceRevenue3', 28254, 'currency')}<p class="lg-muted">三类渠道净收入之和始终等于本期净收入。</p></aside></div>`,
  orders: `<div class="lg-detail-stats">${detailKpi('有效成交订单', 'orders', 1284)}${detailKpi('平均客单价', 'aov', 100, 'currency')}${detailKpi('支付成功率', 'paidRate', 98.8, 'pct')}</div><ui-sparkline data-chart="orders" height="94" data="20,32,24,47,39,58,52,74,66,87"></ui-sparkline><ui-table caption="订单示例 · 固定演示记录，非真实交易" columns='${attr([{ key: 'id', title: '订单编号' }, { key: 'name', title: '方案' }, { key: 'status', title: '状态' }])}' rows='${attr([{ id: 'LM-12048', name: 'Pro 年度订阅', status: '已支付' }, { id: 'LM-12047', name: '团队协作方案', status: '已支付' }, { id: 'LM-12046', name: '专业版月订阅', status: '已支付' }, { id: 'LM-12045', name: 'Pro 年度订阅', status: '已支付' }])}'></ui-table>`
};
const thumbValues = { revenue: ['revenue', 128430, 'currency'], audience: ['customers', 8492, 'int'], goal: ['goal', 78.3, 'pct'], ranking: ['product1', 58200, 'currency'], sources: ['source1', 46, 'pct'], orders: ['orders', 1284, 'int'] };
const card = ([key, name]) => `<article class="lg-module lg-${key}" data-module="${key}"><ui-tilt max="2.6" scale="1" glare="false"><ui-spotlight radius="250"><div class="lg-card-body"><header class="lg-card-head"><h2>${name}</h2><ui-button class="lg-open" variant="ghost" data-open="${key}">${icon('expand')}<span class="lg-sr">展开${name}</span></ui-button></header>${contents[key]}</div></ui-spotlight></ui-tilt></article>`;

const liquidGlassDashboard = {
  id: 'liquid-glass-dashboard', name: '液态玻璃后台', cat: 'Web 页面', frame: 'browser',
  url: 'luma.local/dashboard', exportDocument: true, example: './examples/liquid-glass-dashboard.html',
  imports: ["import { reduced, loop } from './src/lib/motion.js';"],
  brief: '悬浮导航、玻璃数据卡、原位详情、时间胶囊与键盘命令',
  uses: ['ui-button', 'ui-tilt', 'ui-spotlight', 'ui-odometer', 'ui-count-up', 'ui-bar-chart', 'ui-donut', 'ui-progress', 'ui-table', 'ui-sparkline', 'ui-avatar', 'ui-command'],
  html: `<div class="t-screen t-liquid-glass-dashboard" tabindex="-1">
<aside class="lg-side lg-glass" aria-label="液态玻璃工作空间">
  <div class="lg-brand"><span class="lg-brand-mark" aria-hidden="true">◒</span><div class="lg-brand-copy"><strong>luma.</strong><small>BUSINESS IN FOCUS</small></div></div>
  <p class="lg-muted lg-side-label">工作空间</p>
  <nav class="lg-side-nav" aria-label="液态玻璃侧边导航"><span class="lg-capsule" aria-hidden="true"></span>${nav()}</nav>
  <div class="lg-workspace"><ui-avatar name="Luma" size="sm"></ui-avatar><span class="lg-side-label">个人工作空间<small class="lg-muted">LOCAL / DEMO</small></span><ui-button class="lg-collapse" variant="ghost" data-collapse>${icon('collapse')}<span class="lg-sr">收起侧边栏</span></ui-button></div>
</aside>
<div class="lg-scroll" tabindex="0" role="region" aria-label="液态玻璃经营数据">
  <div class="lg-main lg-glass">
    <div class="lg-topbar"><span class="lg-muted">工作空间 / <b data-breadcrumb>经营概览</b></span><div class="lg-actions"><span class="lg-demo">DEMO</span><ui-command placeholder="搜索页面、模块或时间范围" hotkey="" items="[]"></ui-command><ui-avatar name="Luma" size="sm"></ui-avatar></div></div>
    <header class="lg-heading"><div><p class="lg-eyebrow" data-eyebrow>THE BIG PICTURE</p><h1 data-title>经营概览</h1><p class="lg-muted" data-subtitle>收入、客户与增长，尽在一屏。</p></div><div class="lg-period"><div class="lg-time-box"><svg class="lg-defs" aria-hidden="true"><defs><filter data-goo-filter color-interpolation-filters="sRGB" x="-40%" y="-100%" width="180%" height="300%"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9" result="goo"/><feComposite in="SourceGraphic" in2="goo" operator="atop"/></filter></defs></svg><ui-button class="lg-time-trigger" data-time variant="ghost">${icon('clock')}<span data-period-label>本周</span>${icon('down')}</ui-button><div class="lg-goo-scene" aria-hidden="true"><i class="lg-goo-base"></i>${[3, 2, 1, 0].map((slot) => `<i class="lg-goo-blob" data-slot="${slot}"></i>`).join('')}</div><div class="lg-filter-options" role="listbox" aria-label="选择示例时间范围" aria-hidden="true" inert>${[['today', '今日'], ['week', '本周'], ['month', '本月'], ['quarter', '本季']].map(([key, label], i) => `<ui-button class="lg-filter-option" data-period="${key}" data-slot="${3 - i}" variant="ghost">${label}</ui-button>`).join('')}</div></div><p class="lg-muted" data-period-note>11月02日 — 11月08日 · 示例周期</p></div></header>
    <section class="lg-metrics" aria-label="核心经营指标">${[['净收入', 'revenue', 128430, 'currency', 'revenueDelta', 12.8], ['成交订单', 'orders', 1284, 'int', 'ordersDelta', 8.2], ['活跃客户', 'customers', 8492, 'int', 'customersDelta', 6.4]].map(([name, key, value, kind, delta, change]) => `<div class="lg-metric"><p class="lg-muted">${icon(key)}${name}</p><div class="lg-metric-value">${metric(key, value, kind)}<span class="lg-delta">${metric(delta, change, 'delta')}</span></div><small class="lg-muted">相比上一示例周期</small></div>`).join('')}</section>
    <section class="lg-stage" aria-label="经营数据模块"><div class="lg-grid">${modules.map(card).join('')}</div>
      <div class="lg-detail-layer" hidden><section class="lg-detail" role="region" aria-label="数据模块详情"><ui-tilt max="2.6" scale="1" glare="false"><ui-spotlight radius="250"><header class="lg-detail-head"><div><p class="lg-eyebrow">IN FOCUS · LOCAL DEMO</p><h2 data-detail-title></h2></div><ui-button class="lg-detail-close" data-detail-close variant="ghost">${icon('close')}<span class="lg-sr">关闭详情，返回模块</span></ui-button></header><div class="lg-detail-scroll" tabindex="0" role="region" aria-label="数据详情内容"><div data-detail-body></div></div></ui-spotlight></ui-tilt></section>
      <div class="lg-thumbnails lg-glass" role="group" aria-label="其他数据模块缩略条">${modules.map(([key, name]) => `<ui-button class="lg-thumb" data-thumb="${key}" variant="ghost">${icon(key)}<span><span class="lg-thumb-name">${name}</span><span class="lg-thumb-value">${metric(...thumbValues[key])}</span></span></ui-button>`).join('')}</div></div>
      ${modules.map(([key]) => `<template data-detail-template="${key}">${detailContents[key]}</template>`).join('')}
    </section>
    <footer class="lg-footer lg-muted"><span>${icon('clock')}示例数据 · 仅用于交互演示</span><span>本地运行，无需整页刷新</span></footer>
  </div>
</div>
<div class="lg-dock lg-glass"><nav class="lg-dock-nav" aria-label="液态玻璃 Dock 导航"><span class="lg-capsule" aria-hidden="true"></span>${nav(true)}</nav><ui-button class="lg-dock-search" data-command variant="ghost">${icon('search')}<span class="lg-tip">搜索 · K</span><span class="lg-sr">打开命令面板</span></ui-button></div>
<p class="lg-sr" data-status role="status" aria-live="polite"></p>
</div>`,
  css: `
.t-liquid-glass-dashboard{display:grid;grid-template-columns:auto minmax(0,1fr);height:100%;min-height:0;overflow:hidden;isolation:isolate;color:var(--ui-text);font-family:var(--ui-font);font-size:var(--ui-font-size-13px);line-height:var(--ui-line-height-1-5);background:radial-gradient(ellipse at 8% 0%,var(--ui-brand-soft),transparent 62%),radial-gradient(ellipse at 94% 100%,color-mix(in srgb,var(--ui-accent) 8%,var(--ui-bg)),transparent 55%),var(--ui-bg)}
.t-liquid-glass-dashboard *{box-sizing:border-box}
.t-liquid-glass-dashboard [hidden]{display:none!important}
.t-liquid-glass-dashboard p{margin:0}
.t-liquid-glass-dashboard h1,.t-liquid-glass-dashboard h2{margin:0;color:var(--ui-text);font-weight:var(--ui-font-weight-600)}
.t-liquid-glass-dashboard h1{font-size:var(--ui-font-size-38px);line-height:var(--ui-line-height-1-2);letter-spacing:var(--ui-letter-spacing-n-06em)}
.t-liquid-glass-dashboard h2{font-size:var(--ui-font-size-14px);line-height:var(--ui-line-height-1-3)}
.t-liquid-glass-dashboard .lg-muted{color:var(--ui-sub);font-size:var(--ui-font-size-12px)}
.t-liquid-glass-dashboard .lg-icon{display:block;flex:0 0 auto;width:var(--ui-size-22px);height:var(--ui-size-22px);fill:none;stroke:var(--ui-text);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.t-liquid-glass-dashboard .lg-sr{position:absolute!important;width:calc(var(--ui-size-2px) / 2);height:calc(var(--ui-size-2px) / 2);padding:0;margin:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.t-liquid-glass-dashboard .lg-glass{background:color-mix(in srgb,var(--ui-panel) 90%,var(--ui-bg));border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);box-shadow:var(--ui-shadow);backdrop-filter:blur(max(var(--ui-blur),var(--ui-space-24px)));-webkit-backdrop-filter:blur(max(var(--ui-blur),var(--ui-space-24px)))}
.t-liquid-glass-dashboard .lg-side{align-self:start;width:calc(var(--ui-size-232px) - var(--ui-space-32px));margin:var(--ui-space-54px) var(--ui-space-16px) var(--ui-space-16px);padding:var(--ui-space-20px) var(--ui-space-10px) var(--ui-space-12px);z-index:3;transition:width calc(var(--ui-motion) * 3) var(--ui-ease)}
.t-liquid-glass-dashboard .lg-brand{display:flex;align-items:center;gap:var(--ui-space-10px);padding:0 var(--ui-space-8px) var(--ui-space-24px)}
.t-liquid-glass-dashboard .lg-brand-mark{display:grid;place-items:center;width:var(--ui-size-32px);height:var(--ui-size-32px);color:var(--ui-brand);font-size:var(--ui-font-size-30px)}
.t-liquid-glass-dashboard .lg-brand-copy strong{display:block;font-size:var(--ui-font-size-26px);letter-spacing:var(--ui-letter-spacing-n-06em)}
.t-liquid-glass-dashboard .lg-brand-copy small{display:block;color:var(--ui-sub);font-size:var(--ui-font-size-10px);letter-spacing:var(--ui-letter-spacing--09em)}
.t-liquid-glass-dashboard .lg-side > p{padding:0 var(--ui-space-12px);margin-bottom:var(--ui-space-12px)}
.t-liquid-glass-dashboard .lg-side-nav{position:relative;display:flex;flex-direction:column;gap:var(--ui-space-6px)}
.t-liquid-glass-dashboard .lg-nav-item{position:relative;z-index:1;display:block;min-width:0}
.t-liquid-glass-dashboard .lg-nav-item .ui-btn{display:flex;width:100%;height:var(--ui-size-46px);padding:0 var(--ui-space-12px);justify-content:flex-start;gap:var(--ui-space-10px);background:transparent;color:var(--ui-sub);border:0;border-radius:var(--ui-radius);box-shadow:none;white-space:nowrap;font-size:var(--ui-font-size-13px);font-weight:var(--ui-font-weight-500)}
.t-liquid-glass-dashboard .lg-nav-item .ui-btn::before{content:none}
.t-liquid-glass-dashboard .lg-nav-item [aria-current="page"]{color:var(--ui-text);font-weight:var(--ui-font-weight-650)}
.t-liquid-glass-dashboard .lg-capsule{position:absolute;top:0;left:0;pointer-events:none;width:100%;height:var(--ui-size-46px);border-radius:var(--ui-radius);background:var(--ui-panel-2);border:var(--ui-border-w) solid var(--ui-line);box-shadow:var(--ui-shadow-sm);transform-origin:center}
.t-liquid-glass-dashboard .lg-workspace{display:flex;align-items:center;gap:var(--ui-space-8px);padding:var(--ui-space-18px) var(--ui-space-4px) 0;margin-top:var(--ui-space-22px);border-top:var(--ui-border-w) solid var(--ui-line);font-size:var(--ui-font-size-11px)}
.t-liquid-glass-dashboard .lg-workspace small{display:block;font-size:var(--ui-font-size-10px)}
.t-liquid-glass-dashboard .lg-collapse{margin-left:auto}
.t-liquid-glass-dashboard .lg-collapse .ui-btn,.t-liquid-glass-dashboard .lg-open .ui-btn,.t-liquid-glass-dashboard .lg-dock-search .ui-btn{width:var(--ui-size-40px);height:var(--ui-size-40px);padding:var(--ui-space-8px);border:0;box-shadow:none;background:transparent;border-radius:var(--ui-radius)}
.t-liquid-glass-dashboard .lg-open .ui-btn,.t-liquid-glass-dashboard .lg-filter-option .ui-btn{transition:var(--ui-motion),visibility 0s}
.t-liquid-glass-dashboard .lg-collapse .ui-btn::before,.t-liquid-glass-dashboard .lg-open .ui-btn::before,.t-liquid-glass-dashboard .lg-dock-search .ui-btn::before{content:none}
.t-liquid-glass-dashboard .lg-scroll{min-width:0;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:var(--ui-space-28px) var(--ui-space-28px) calc(var(--ui-space-54px) * 2) 0}
.t-liquid-glass-dashboard .lg-main{padding:var(--ui-space-24px);min-width:0;min-height:100%}
.t-liquid-glass-dashboard .lg-topbar,.t-liquid-glass-dashboard .lg-actions{display:flex;align-items:center;justify-content:space-between;gap:var(--ui-space-12px)}
.t-liquid-glass-dashboard .lg-topbar{margin-bottom:var(--ui-space-24px)}
.t-liquid-glass-dashboard .lg-demo{color:var(--ui-sub);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);padding:var(--ui-space-4px) var(--ui-space-6px);font-size:var(--ui-font-size-10px);font-weight:var(--ui-font-weight-700);letter-spacing:var(--ui-letter-spacing--09em)}
.t-liquid-glass-dashboard ui-command .ui-cmd-trigger{min-width:0;gap:var(--ui-space-8px);font-size:var(--ui-font-size-12px);padding:0 var(--ui-space-10px);background:var(--ui-panel-2);color:var(--ui-sub);border-radius:var(--ui-radius);box-shadow:var(--ui-shadow-sm)}
.t-liquid-glass-dashboard .lg-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:var(--ui-space-20px)}
.t-liquid-glass-dashboard .lg-eyebrow{font-size:var(--ui-font-size-10px);letter-spacing:var(--ui-letter-spacing--09em);color:var(--ui-sub);margin-bottom:var(--ui-space-8px);font-weight:var(--ui-font-weight-650)}
.t-liquid-glass-dashboard [data-subtitle]{margin-top:var(--ui-space-12px)}
.t-liquid-glass-dashboard .lg-period{text-align:right;max-width:45%;position:relative;z-index:4}
.t-liquid-glass-dashboard .lg-time-trigger .ui-btn{border-radius:var(--ui-radius-pill);background:var(--ui-panel);color:var(--ui-text);gap:var(--ui-space-8px);box-shadow:var(--ui-shadow-sm);height:var(--ui-size-46px);padding:0 var(--ui-space-18px)}
.t-liquid-glass-dashboard .lg-time-trigger .ui-btn::before{content:none}
.t-liquid-glass-dashboard [data-period-note]{margin-top:var(--ui-space-8px);font-size:var(--ui-font-size-11px)}
.t-liquid-glass-dashboard .lg-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--ui-space-24px);padding:var(--ui-space-24px) 0}
.t-liquid-glass-dashboard .lg-metric{min-width:0}
.t-liquid-glass-dashboard .lg-metric > p{display:flex;align-items:center;gap:var(--ui-space-6px);margin-bottom:var(--ui-space-8px)}
.t-liquid-glass-dashboard .lg-metric > p .lg-icon{width:var(--ui-space-16px);height:var(--ui-space-16px);stroke:var(--ui-sub)}
.t-liquid-glass-dashboard .lg-metric-value{display:flex;align-items:baseline;flex-wrap:wrap;font-size:var(--ui-font-size-34px);font-weight:var(--ui-font-weight-600);line-height:var(--ui-line-height-1-2);letter-spacing:var(--ui-letter-spacing-n-045em)}
.t-liquid-glass-dashboard .lg-number{font-variant-numeric:tabular-nums;white-space:nowrap;display:inline-block;max-width:100%}
.t-liquid-glass-dashboard .lg-delta{margin-left:var(--ui-space-10px);font-size:var(--ui-font-size-11px);font-weight:var(--ui-font-weight-600);color:var(--ui-text);letter-spacing:normal}
.t-liquid-glass-dashboard .lg-metric > small{display:block;margin-top:var(--ui-space-6px);font-size:var(--ui-font-size-11px)}
.t-liquid-glass-dashboard .lg-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--ui-space-18px)}
.t-liquid-glass-dashboard .lg-module{min-width:0;grid-column:span 3;position:relative;border-radius:var(--ui-radius-lg)}
.t-liquid-glass-dashboard .lg-revenue{grid-column:span 6}
.t-liquid-glass-dashboard .lg-ranking{grid-column:span 5}
.t-liquid-glass-dashboard .lg-sources{grid-column:span 4}
.t-liquid-glass-dashboard .lg-module > ui-tilt,.t-liquid-glass-dashboard .lg-module .ui-tilt,.t-liquid-glass-dashboard .lg-module ui-spotlight,.t-liquid-glass-dashboard .lg-module .ui-spot{height:100%;min-width:0}
.t-liquid-glass-dashboard .lg-module ui-tilt{perspective:calc(var(--ui-size-232px) * 5)}
.t-liquid-glass-dashboard .lg-module .ui-tilt{transition:transform calc(var(--ui-motion) * 2.7) var(--ui-ease);will-change:auto}
.t-liquid-glass-dashboard .lg-module .ui-tilt.is-active{transition:transform var(--ui-motion) var(--ui-ease);will-change:transform}
.t-liquid-glass-dashboard .lg-module .ui-spot{background:var(--ui-panel);color:var(--ui-text);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);box-shadow:var(--ui-shadow-sm);backdrop-filter:blur(max(var(--ui-blur),var(--ui-space-24px)));-webkit-backdrop-filter:blur(max(var(--ui-blur),var(--ui-space-24px)))}
.t-liquid-glass-dashboard .lg-module .ui-spot::before,.t-liquid-glass-dashboard .lg-module .ui-spot::after{transition:opacity calc(var(--ui-motion) * 2) var(--ui-ease)}
.t-liquid-glass-dashboard .lg-module .ui-spot::after{padding:var(--ui-size-2px);mask:linear-gradient(rgba(255,255,255,1) 0 0) content-box,linear-gradient(rgba(255,255,255,1) 0 0);mask-composite:exclude}
.t-liquid-glass-dashboard .lg-card-body{padding:var(--ui-space-18px);min-width:0}
.t-liquid-glass-dashboard .lg-card-head{display:flex;justify-content:space-between;align-items:center;gap:var(--ui-space-8px);margin-bottom:var(--ui-space-12px)}
.t-liquid-glass-dashboard .lg-open{flex:0 0 auto}
.t-liquid-glass-dashboard .lg-legend{display:flex;justify-content:space-between;gap:var(--ui-space-8px);color:var(--ui-sub);font-size:var(--ui-font-size-11px);margin-bottom:var(--ui-space-14px)}
.t-liquid-glass-dashboard .lg-card-note{margin-top:var(--ui-space-14px)}
.t-liquid-glass-dashboard .lg-goal-value{font-size:var(--ui-font-size-38px);font-weight:var(--ui-font-weight-600);line-height:var(--ui-line-height-1-2);margin:var(--ui-space-8px) 0;letter-spacing:var(--ui-letter-spacing-n-06em)}
.t-liquid-glass-dashboard .lg-goal .ui-spot{background:var(--ui-brand);color:var(--ui-brand-ink);border-color:var(--ui-brand)}
.t-liquid-glass-dashboard .lg-goal h2,.t-liquid-glass-dashboard .lg-goal .lg-muted,.t-liquid-glass-dashboard .lg-goal .lg-legend,.t-liquid-glass-dashboard .lg-goal .ui-progress__head,.t-liquid-glass-dashboard .lg-goal .lg-icon{color:var(--ui-brand-ink);stroke:var(--ui-brand-ink)}
.t-liquid-glass-dashboard .lg-goal ui-progress{display:block;margin:var(--ui-space-20px) 0 var(--ui-space-12px)}
.t-liquid-glass-dashboard .lg-goal .ui-progress__track{height:var(--ui-size-24px);border-radius:var(--ui-radius-sm);background:color-mix(in srgb,var(--ui-brand-ink) 16%,transparent);mask:repeating-linear-gradient(90deg,rgba(255,255,255,1) 0,rgba(255,255,255,1) calc(100% / 28 - var(--ui-size-2px)),transparent calc(100% / 28 - var(--ui-size-2px)),transparent calc(100% / 28))}
.t-liquid-glass-dashboard .lg-goal .ui-progress__bar{background:var(--ui-brand-ink);border-radius:var(--ui-radius-sm)}
.t-liquid-glass-dashboard .lg-sources .ui-progress{margin-bottom:var(--ui-space-20px)}
.t-liquid-glass-dashboard .lg-order-value{display:flex;align-items:baseline;gap:var(--ui-space-8px);font-size:var(--ui-font-size-30px);font-weight:var(--ui-font-weight-600);margin-bottom:var(--ui-space-8px)}
.t-liquid-glass-dashboard .lg-orders ui-sparkline{margin-top:var(--ui-space-12px)}
.t-liquid-glass-dashboard .lg-audience .ui-donut{justify-content:center;gap:var(--ui-space-12px)}
.t-liquid-glass-dashboard .lg-audience .ui-donut__lg{min-width:0;flex:1 1 100%;gap:var(--ui-space-6px)}
.t-liquid-glass-dashboard .lg-audience .ui-donut__lg li{font-size:var(--ui-font-size-11px)}
.t-liquid-glass-dashboard .ui-table caption,.t-liquid-glass-dashboard .ui-table th{font-size:var(--ui-font-size-11px)}
.t-liquid-glass-dashboard .ui-table td{font-size:var(--ui-font-size-12px);overflow-wrap:anywhere}
.t-liquid-glass-dashboard .ui-table th,.t-liquid-glass-dashboard .ui-table td{padding:var(--ui-space-8px) var(--ui-space-6px)}
.t-liquid-glass-dashboard .ui-bar__plot{height:calc(var(--ui-size-72px) * 2);padding-top:var(--ui-space-18px)}
.t-liquid-glass-dashboard .ui-bar__col i{width:min(80%,var(--ui-size-11px));border-radius:var(--ui-radius-pill);background:linear-gradient(var(--ui-brand),var(--ui-accent))}
.t-liquid-glass-dashboard .ui-bar__col i::after{content:none}
.t-liquid-glass-dashboard .ui-bar__x span{font-size:var(--ui-font-size-10px)}
.t-liquid-glass-dashboard .lg-footer{display:flex;align-items:center;justify-content:space-between;gap:var(--ui-space-10px);margin-top:var(--ui-space-20px);font-size:var(--ui-font-size-11px)}
.t-liquid-glass-dashboard .lg-footer > span:first-child{display:flex;align-items:center;gap:var(--ui-space-6px)}
.t-liquid-glass-dashboard .lg-footer .lg-icon{width:var(--ui-space-14px);height:var(--ui-space-14px);stroke:var(--ui-sub)}
.t-liquid-glass-dashboard .lg-dock{position:absolute;left:50%;bottom:var(--ui-space-16px);transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:var(--ui-space-12px);padding:var(--ui-space-8px) var(--ui-space-12px);border-radius:var(--ui-radius-lg)}
.t-liquid-glass-dashboard .lg-dock-nav{display:flex;position:relative;gap:var(--ui-space-6px);align-items:center}
.t-liquid-glass-dashboard .lg-dock .lg-nav-item .ui-btn{width:var(--ui-size-46px);height:var(--ui-size-46px);justify-content:center;padding:var(--ui-space-10px)}
.t-liquid-glass-dashboard .lg-dock .lg-capsule{width:var(--ui-size-46px)}
.t-liquid-glass-dashboard .lg-tip{position:absolute;bottom:calc(100% + var(--ui-space-16px));left:50%;transform:translate(-50%,var(--ui-space-4px));opacity:0;pointer-events:none;white-space:nowrap;color:var(--ui-text);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);box-shadow:var(--ui-shadow-sm);border-radius:var(--ui-radius);padding:var(--ui-space-8px) var(--ui-space-10px);font-size:var(--ui-font-size-11px);transition:opacity var(--ui-motion) var(--ui-ease),transform var(--ui-motion) var(--ui-ease)}
.t-liquid-glass-dashboard .lg-dock .ui-btn:hover .lg-tip,.t-liquid-glass-dashboard .lg-dock .ui-btn:focus-visible .lg-tip{opacity:1;transform:translate(-50%,0)}
.t-liquid-glass-dashboard .lg-current-dot{position:absolute;bottom:var(--ui-space-3px);left:50%;transform:translateX(-50%);width:var(--ui-size-5px);height:var(--ui-size-5px);border-radius:var(--ui-radius-pill);background:var(--ui-text);opacity:0}
.t-liquid-glass-dashboard .lg-dock [aria-current="page"] .lg-current-dot{opacity:1}
.t-liquid-glass-dashboard .ui-btn:focus-visible,.t-liquid-glass-dashboard .ui-cmd-trigger:focus-visible,.t-liquid-glass-dashboard .lg-scroll:focus-visible{outline:var(--ui-size-2px) solid var(--ui-text);outline-offset:var(--ui-space-3px);box-shadow:var(--ui-ring)}
.t-liquid-glass-dashboard .lg-stage{position:relative;min-width:0}
.t-liquid-glass-dashboard .lg-grid{transition:opacity calc(var(--ui-motion) * 2) var(--ui-ease)}
.t-liquid-glass-dashboard .lg-grid.lg-minimized{opacity:0;pointer-events:none}
.t-liquid-glass-dashboard .lg-detail-layer{position:absolute;inset:0;z-index:5;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:var(--ui-space-14px);min-width:0;min-height:0}
.t-liquid-glass-dashboard .lg-detail{min-width:0;min-height:0;transform-origin:0 0;border-radius:var(--ui-radius-lg)}
.t-liquid-glass-dashboard .lg-detail > ui-tilt,.t-liquid-glass-dashboard .lg-detail .ui-tilt,.t-liquid-glass-dashboard .lg-detail ui-spotlight,.t-liquid-glass-dashboard .lg-detail .ui-spot{height:100%;min-width:0;min-height:0}
.t-liquid-glass-dashboard .lg-detail .ui-spot{display:flex;flex-direction:column;background:var(--ui-panel);color:var(--ui-text);box-shadow:var(--ui-shadow);backdrop-filter:blur(max(var(--ui-blur),var(--ui-space-24px)));-webkit-backdrop-filter:blur(max(var(--ui-blur),var(--ui-space-24px)))}
.t-liquid-glass-dashboard .lg-detail .ui-tilt{transition:transform calc(var(--ui-motion) * 2.7) var(--ui-ease);will-change:auto}
.t-liquid-glass-dashboard .lg-detail .ui-spot::after{padding:var(--ui-size-2px);mask:linear-gradient(rgba(255,255,255,1) 0 0) content-box,linear-gradient(rgba(255,255,255,1) 0 0);mask-composite:exclude}
.t-liquid-glass-dashboard .lg-detail-head{display:flex;justify-content:space-between;align-items:flex-start;gap:var(--ui-space-14px);padding:var(--ui-space-24px);flex:0 0 auto}
.t-liquid-glass-dashboard [data-detail-title]{font-size:var(--ui-font-size-26px);letter-spacing:var(--ui-letter-spacing-n-045em)}
.t-liquid-glass-dashboard .lg-detail-close .ui-btn{width:var(--ui-size-40px);height:var(--ui-size-40px);padding:var(--ui-space-8px);border-radius:var(--ui-radius-pill);background:var(--ui-panel-2);color:var(--ui-text);box-shadow:var(--ui-shadow-sm)}
.t-liquid-glass-dashboard .lg-detail-close .ui-btn::before{content:none}
.t-liquid-glass-dashboard .lg-detail-scroll{min-height:0;min-width:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:0 var(--ui-space-24px) var(--ui-space-24px);flex:1}
.t-liquid-glass-dashboard .lg-detail-scroll:focus-visible,.t-liquid-glass-dashboard .lg-thumbnails:focus-visible{outline:var(--ui-size-2px) solid var(--ui-text);outline-offset:calc(var(--ui-size-2px) * -1)}
.t-liquid-glass-dashboard .lg-detail-columns{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(0,1fr);gap:var(--ui-space-24px)}
.t-liquid-glass-dashboard .lg-detail-columns > *{min-width:0}
.t-liquid-glass-dashboard .lg-subpanel{padding:var(--ui-space-18px);border:var(--ui-border-w) solid var(--ui-line);background:var(--ui-panel-2);border-radius:var(--ui-radius-lg)}
.t-liquid-glass-dashboard .lg-detail h3{font-size:var(--ui-font-size-14px);font-weight:var(--ui-font-weight-600);margin:var(--ui-space-12px) 0;color:var(--ui-text)}
.t-liquid-glass-dashboard .lg-detail-stat{display:flex;align-items:center;justify-content:space-between;gap:var(--ui-space-12px);margin:var(--ui-space-18px) 0;font-size:var(--ui-font-size-17px)}
.t-liquid-glass-dashboard .lg-detail-kpi{padding:var(--ui-space-12px) 0 var(--ui-space-16px)}
.t-liquid-glass-dashboard .lg-detail-kpi > strong{display:block;margin-top:var(--ui-space-8px);font-size:var(--ui-font-size-34px);font-weight:var(--ui-font-weight-600);line-height:var(--ui-line-height-1-2);letter-spacing:var(--ui-letter-spacing-n-045em)}
.t-liquid-glass-dashboard .lg-detail-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--ui-space-16px)}
.t-liquid-glass-dashboard .lg-detail-stats .lg-detail-kpi{padding:var(--ui-space-16px);background:var(--ui-panel-2);border-radius:var(--ui-radius-lg)}
.t-liquid-glass-dashboard .lg-detail.lg-goal .ui-spot{background:var(--ui-brand);color:var(--ui-brand-ink)}
.t-liquid-glass-dashboard .lg-detail.lg-goal h3,.t-liquid-glass-dashboard .lg-detail.lg-goal .ui-progress__head{color:var(--ui-brand-ink)}
.t-liquid-glass-dashboard .lg-detail.lg-goal .lg-subpanel{background:color-mix(in srgb,var(--ui-brand) 92%,var(--ui-brand-ink));border-color:var(--ui-brand-ink)}
.t-liquid-glass-dashboard .lg-detail.lg-goal .lg-detail-close .ui-btn{background:transparent;color:var(--ui-brand-ink);border-color:var(--ui-brand-ink)}
.t-liquid-glass-dashboard .lg-thumbnails{display:flex;gap:var(--ui-space-8px);padding:var(--ui-space-10px);overflow:auto;min-width:0;scrollbar-width:thin}
.t-liquid-glass-dashboard .lg-thumb{flex:1 0 0;min-width:0}
.t-liquid-glass-dashboard .lg-thumb .ui-btn{display:flex;align-items:center;justify-content:flex-start;width:100%;height:auto;min-height:var(--ui-size-68px);padding:var(--ui-space-10px);gap:var(--ui-space-10px);background:var(--ui-panel);color:var(--ui-text);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);box-shadow:var(--ui-shadow-sm);text-align:left}
.t-liquid-glass-dashboard .lg-thumb .ui-btn::before{content:none}
.t-liquid-glass-dashboard .lg-thumb-name{display:block;font-size:var(--ui-font-size-11px);color:var(--ui-sub);font-weight:var(--ui-font-weight-500)}
.t-liquid-glass-dashboard .lg-thumb-value{display:block;font-size:var(--ui-font-size-17px);font-weight:var(--ui-font-weight-600);white-space:nowrap;line-height:var(--ui-line-height-1-3);margin-top:var(--ui-space-4px)}
.t-liquid-glass-dashboard .lg-time-box{position:relative;width:calc(var(--ui-size-72px) + var(--ui-size-40px));height:var(--ui-size-46px);margin-left:auto}
.t-liquid-glass-dashboard .lg-defs{position:absolute;width:0;height:0;pointer-events:none}
.t-liquid-glass-dashboard .lg-time-trigger{position:relative;z-index:3;display:block;transition:opacity var(--ui-motion) var(--ui-ease),transform calc(var(--ui-motion) * 3) var(--ui-spring)}
.t-liquid-glass-dashboard .lg-time-trigger .ui-btn{width:100%}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded .lg-time-trigger{opacity:0;pointer-events:none;transform:scale(.8)}
.t-liquid-glass-dashboard .lg-goo-scene,.t-liquid-glass-dashboard .lg-filter-options{position:absolute;top:0;right:0;height:var(--ui-size-46px);width:calc(var(--ui-size-72px) * 4 + var(--ui-space-12px) * 3)}
.t-liquid-glass-dashboard .lg-goo-scene{pointer-events:none;opacity:.6}
.t-liquid-glass-dashboard .lg-goo-base,.t-liquid-glass-dashboard .lg-goo-blob{position:absolute;top:0;right:0;height:var(--ui-size-46px);width:var(--ui-size-72px);border-radius:var(--ui-radius-pill);background:var(--ui-panel);transition:transform calc(var(--ui-motion) * 4) var(--ui-spring),opacity calc(var(--ui-motion) * 3) var(--ui-ease)}
.t-liquid-glass-dashboard .lg-goo-base{width:100%;max-width:calc(var(--ui-size-72px) + var(--ui-size-40px))}
.t-liquid-glass-dashboard .lg-goo-blob{opacity:0;transform:scale(.76)}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded .lg-goo-base{opacity:0;transform:scale(.6)}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded .lg-goo-blob{opacity:1}
.t-liquid-glass-dashboard .lg-filter-options{z-index:2;pointer-events:none}
.t-liquid-glass-dashboard .lg-filter-option{position:absolute;top:0;right:0;width:var(--ui-size-72px);height:var(--ui-size-46px);opacity:0;visibility:hidden;transform:scale(.76);transition:transform calc(var(--ui-motion) * 4) var(--ui-spring),opacity calc(var(--ui-motion) * 2) var(--ui-ease),visibility 0s calc(var(--ui-motion) * 4)}
.t-liquid-glass-dashboard .lg-filter-option .ui-btn{width:100%;height:100%;padding:0 var(--ui-space-8px);background:var(--ui-panel);color:var(--ui-text);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-pill);box-shadow:var(--ui-shadow-sm);font-size:var(--ui-font-size-12px)}
.t-liquid-glass-dashboard .lg-filter-option .ui-btn::before{content:none}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded .lg-filter-option{visibility:visible;opacity:1;pointer-events:auto;transition-delay:0s}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded [data-slot="3"]{transform:translateX(calc((var(--ui-size-72px) + var(--ui-space-12px)) * -3)) scale(1)}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded [data-slot="2"]{transform:translateX(calc((var(--ui-size-72px) + var(--ui-space-12px)) * -2)) scale(1)}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded [data-slot="1"]{transform:translateX(calc((var(--ui-size-72px) + var(--ui-space-12px)) * -1)) scale(1)}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded [data-slot="0"]{transform:translateX(0) scale(1)}
.t-liquid-glass-dashboard .lg-filter-option [aria-selected="true"]{background:var(--ui-panel-2);font-weight:var(--ui-font-weight-700);border-color:var(--ui-text)}
.t-liquid-glass-dashboard.lg-sidebar-collapsed .lg-side{width:var(--ui-size-72px)}
.t-liquid-glass-dashboard.lg-sidebar-collapsed .lg-brand{justify-content:center;padding-inline:0}
.t-liquid-glass-dashboard.lg-sidebar-collapsed .lg-brand-copy,.t-liquid-glass-dashboard.lg-sidebar-collapsed .lg-side-label,.t-liquid-glass-dashboard.lg-sidebar-collapsed .lg-workspace ui-avatar{display:none}
.t-liquid-glass-dashboard.lg-sidebar-collapsed .lg-side-nav .ui-btn{justify-content:center;padding-inline:0}
.t-liquid-glass-dashboard.lg-sidebar-collapsed .lg-collapse{margin-left:0}
.t-liquid-glass-dashboard.lg-sidebar-collapsed .lg-collapse .lg-icon{transform:rotate(180deg)}
@container tpl (max-width:1040px){
.t-liquid-glass-dashboard .lg-side{width:var(--ui-size-72px);padding-inline:var(--ui-space-10px)}
.t-liquid-glass-dashboard .lg-brand{justify-content:center;padding-inline:0}
.t-liquid-glass-dashboard .lg-brand-copy,.t-liquid-glass-dashboard .lg-side-label,.t-liquid-glass-dashboard .lg-workspace ui-avatar{display:none}
.t-liquid-glass-dashboard .lg-side-nav .ui-btn{justify-content:center;padding-inline:0}
.t-liquid-glass-dashboard .lg-workspace{justify-content:center;padding-inline:0}
.t-liquid-glass-dashboard .lg-collapse{margin-left:0}
.t-liquid-glass-dashboard .lg-side .lg-collapse{display:none}
.t-liquid-glass-dashboard .lg-workspace ui-avatar{display:block}
.t-liquid-glass-dashboard .lg-scroll{padding-right:var(--ui-space-16px)}
.t-liquid-glass-dashboard .lg-main{padding:var(--ui-space-20px)}
.t-liquid-glass-dashboard .lg-grid{grid-template-columns:repeat(6,minmax(0,1fr))}
.t-liquid-glass-dashboard .lg-grid > .lg-module{grid-column:span 3}
.t-liquid-glass-dashboard .lg-grid > .lg-revenue,.t-liquid-glass-dashboard .lg-grid > .lg-ranking{grid-column:span 6}
.t-liquid-glass-dashboard .lg-thumbnails .lg-thumb{flex:0 0 auto;min-width:calc(var(--ui-size-232px) - var(--ui-space-54px))}
}
@container tpl (max-width:600px){
.t-liquid-glass-dashboard{grid-template-columns:minmax(0,1fr)}
.t-liquid-glass-dashboard .lg-side{display:none}
.t-liquid-glass-dashboard .lg-scroll{padding:var(--ui-space-12px) var(--ui-space-12px) calc(var(--ui-space-54px) * 2)}
.t-liquid-glass-dashboard .lg-main{padding:var(--ui-space-16px)}
.t-liquid-glass-dashboard .lg-topbar{gap:var(--ui-space-6px);margin-bottom:var(--ui-space-18px)}
.t-liquid-glass-dashboard .lg-actions{gap:var(--ui-space-8px)}
.t-liquid-glass-dashboard .lg-demo{display:none}
.t-liquid-glass-dashboard ui-command .ui-cmd-trigger{width:var(--ui-size-40px);height:var(--ui-size-40px);justify-content:center;padding:var(--ui-space-8px)}
.t-liquid-glass-dashboard ui-command .ui-cmd-trigger span{position:absolute;width:calc(var(--ui-size-2px) / 2);height:calc(var(--ui-size-2px) / 2);overflow:hidden;clip:rect(0,0,0,0)}
.t-liquid-glass-dashboard ui-command .ui-cmd-trigger::after{content:'⌕';font-size:var(--ui-font-size-20px);color:var(--ui-text)}
.t-liquid-glass-dashboard .lg-heading{display:block}
.t-liquid-glass-dashboard h1{font-size:var(--ui-font-size-30px)}
.t-liquid-glass-dashboard .lg-period{max-width:none;margin-top:var(--ui-space-18px)}
.t-liquid-glass-dashboard .lg-metrics{grid-template-columns:minmax(0,1fr);gap:var(--ui-space-18px);padding-block:var(--ui-space-20px)}
.t-liquid-glass-dashboard .lg-grid{grid-template-columns:minmax(0,1fr);gap:var(--ui-space-14px)}
.t-liquid-glass-dashboard .lg-grid > .lg-module{grid-column:1 / -1}
.t-liquid-glass-dashboard .lg-detail-columns,.t-liquid-glass-dashboard .lg-detail-stats{grid-template-columns:minmax(0,1fr)}
.t-liquid-glass-dashboard .lg-detail-head{padding:var(--ui-space-16px)}
.t-liquid-glass-dashboard .lg-detail-scroll{padding:0 var(--ui-space-16px) var(--ui-space-16px)}
.t-liquid-glass-dashboard .lg-footer{flex-wrap:wrap}
.t-liquid-glass-dashboard .lg-dock{gap:var(--ui-space-8px);padding:var(--ui-space-6px);bottom:var(--ui-space-12px)}
.t-liquid-glass-dashboard .lg-dock-nav{gap:var(--ui-space-4px)}
.t-liquid-glass-dashboard .lg-dock .lg-nav-item .ui-btn{width:var(--ui-size-40px);height:var(--ui-size-40px);padding:var(--ui-space-8px)}
.t-liquid-glass-dashboard .lg-goo-scene,.t-liquid-glass-dashboard .lg-filter-options{width:calc(var(--ui-size-32px) * 8 + var(--ui-space-8px))}
.t-liquid-glass-dashboard .lg-goo-blob,.t-liquid-glass-dashboard .lg-filter-option{width:calc(var(--ui-size-32px) * 2 - var(--ui-size-2px) * 2)}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded [data-slot="3"]{transform:translateX(calc((var(--ui-size-32px) * 2 - var(--ui-size-2px) * 2 + var(--ui-space-8px)) * -3)) scale(1)}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded [data-slot="2"]{transform:translateX(calc((var(--ui-size-32px) * 2 - var(--ui-size-2px) * 2 + var(--ui-space-8px)) * -2)) scale(1)}
.t-liquid-glass-dashboard .lg-time-box.lg-expanded [data-slot="1"]{transform:translateX(calc((var(--ui-size-32px) * 2 - var(--ui-size-2px) * 2 + var(--ui-space-8px)) * -1)) scale(1)}
}
`,
  init(root) {
    if (!root) return;
    if (root._liquidGlassMount) return root._liquidGlassMount;
    const $ = (selector) => root.querySelector(selector);
    const $$ = (selector) => [...root.querySelectorAll(selector)];
    $('[data-detail-body]').replaceChildren();
    const pages = {
      overview: ['经营概览', 'THE BIG PICTURE', '收入、客户与增长，尽在一屏。'],
      revenue: ['收入分析', 'FOLLOW THE GROWTH', '从每一笔收入，看见业务的节奏。'],
      audience: ['客户洞察', 'KNOW YOUR PEOPLE', '理解每一位客户，建立长久的连接。'],
      ranking: ['产品表现', 'MADE TO MATTER', '找到最受欢迎的产品与方案。'],
      goal: ['目标追踪', 'A LITTLE CLOSER', '让清晰的目标，变成可见的进度。']
    };
    const moduleNames = { revenue: '收入趋势', audience: '客户结构', goal: '目标追踪', ranking: '产品表现', sources: '收入来源', orders: '订单动态' };
    const base = { revenue: 128430, orders: 1284, customers: 8492, returnCustomers: 2768, target: 164000, revenueDelta: 12.8, ordersDelta: 8.2, customersDelta: 6.4, product1: 58200, product2: 42800, productDelta1: 18.2, productDelta2: 12.6, productDelta3: 7.4, source1: 46, source2: 32, source3: 22, conversion: 4.8, refund: 1.2 };
    function enrich(values) {
      const v = { ...values };
      v.aov = v.revenue / v.orders;
      v.newCustomers = v.customers - v.returnCustomers;
      v.repeat = v.returnCustomers / v.customers * 100;
      v.goal = v.revenue / v.target * 100;
      v.remaining = Math.max(0, v.target - v.revenue);
      v.product3 = v.revenue - v.product1 - v.product2;
      v.sourceRevenue1 = Math.round(v.revenue * v.source1 / 100);
      v.sourceRevenue2 = Math.round(v.revenue * v.source2 / 100);
      v.sourceRevenue3 = v.revenue - v.sourceRevenue1 - v.sourceRevenue2;
      v.paidRate = 98.8;
      return v;
    }
    const periods = {
      today: { label: '今日', note: '11月08日 · 示例周期', values: enrich({ ...base, revenue: 18650, orders: 174, customers: 1420, returnCustomers: 498, target: 25000, revenueDelta: 9.6, ordersDelta: 5.4, customersDelta: 7.2, product1: 9400, product2: 5600, productDelta1: 10.4, productDelta2: 8.3, productDelta3: 5.2, source1: 42, source2: 36, source3: 22, conversion: 5.1, refund: 1.1 }), bars: [28, 42, 33, 50, 61, 47, 71, 68, 90, 66, 80, 70, 89, 78], trend: [18, 35, 25, 49, 42, 62, 48, 73, 67, 81], labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'] },
      week: { label: '本周', note: '11月02日 — 11月08日 · 示例周期', values: enrich(base), bars: [37, 53, 44, 61, 48, 68, 55, 73, 65, 86, 74, 92, 79, 97], trend: [20, 32, 24, 47, 39, 58, 52, 74, 66, 87], labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      month: { label: '本月', note: '11月01日 — 11月30日 · 示例周期', values: enrich({ ...base, revenue: 486280, orders: 4512, customers: 28614, returnCustomers: 10658, target: 600000, revenueDelta: 18.6, ordersDelta: 14.3, customersDelta: 11.8, product1: 216000, product2: 170500, productDelta1: 22.4, productDelta2: 16.5, productDelta3: 12.7, source1: 51, source2: 29, source3: 20, conversion: 5.6, refund: 1 }), bars: [62, 48, 57, 39, 73, 61, 84, 66, 78, 63, 93, 77, 96, 89], trend: [32, 22, 41, 36, 64, 52, 78, 68, 91, 83], labels: ['01日', '05日', '10日', '15日', '20日', '25日', '30日'] },
      quarter: { label: '本季', note: '10月01日 — 12月31日 · 示例周期', values: enrich({ ...base, revenue: 1428600, orders: 13824, customers: 64308, returnCustomers: 26760, target: 1800000, revenueDelta: 24.7, ordersDelta: 19.5, customersDelta: 16.2, product1: 682400, product2: 479600, productDelta1: 28.8, productDelta2: 21.5, productDelta3: 18.4, source1: 48, source2: 33, source3: 19, conversion: 6.3, refund: .9 }), bars: [46, 38, 62, 55, 72, 49, 66, 82, 70, 94, 77, 88, 69, 95], trend: [27, 39, 31, 58, 46, 76, 62, 89, 79, 94], labels: ['10月初', '10月中', '11月初', '11月中', '12月初', '12月中', '12月末'] }
    };
    const uid = 'lg-' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
    $('[data-goo-filter]').id = uid + '-goo';
    $('.lg-goo-scene').style.filter = `url(#${uid}-goo)`;
    $('.lg-filter-options').id = uid + '-periods';
    const timeButton = $('[data-time] button');
    timeButton.setAttribute('aria-haspopup', 'listbox');
    timeButton.setAttribute('aria-controls', uid + '-periods');
    const state = { page: 'overview', period: 'week', detail: null, filter: false };
    let chartState = { ...periods.week.values, bars: [...periods.week.bars], trend: [...periods.week.trend] };
    let stopCharts = null;
    let detailEpoch = 0;
    let detailFocusEpoch = 0;
    let overviewScroll = 0;
    let overviewRects = {};
    const abort = new AbortController();
    const animations = new Set();
    let animationLoop = null;
    let disposed = false;
    const listen = (node, type, handler, options = {}) => node.addEventListener(type, handler, { ...options, signal: abort.signal });
    const command = $('ui-command');
    listen(command, 'click', () => { detailFocusEpoch++; });
    command.setAttribute('items', JSON.stringify([
      ...Object.entries(pages).map(([key, page]) => ({ label: page[0], value: 'page:' + key, group: '菜单' })),
      ...Object.entries(moduleNames).map(([key, label]) => ({ label, value: 'module:' + key, group: '数据模块' })),
      ...Object.entries(periods).map(([key, period]) => ({ label: '切换至' + period.label, value: 'period:' + key, group: '时间范围' }))
    ]));
    listen(command, 'select', (event) => {
      const [action, key] = String(event.detail.value).split(':');
      if (action === 'page') {
        navigate(key);
        if (key === 'overview') closeDetail(); else openDetail(key);
      } else if (action === 'module') openDetail(key);
      else if (action === 'period') setPeriod(key);
    });
    const duration = (multiple = 1) => {
      const token = getComputedStyle(root).getPropertyValue('--ui-motion').trim();
      return Math.max(0, (parseFloat(token) || 0) * (token.endsWith('ms') ? 1 : 1000) * multiple);
    };
    function animate(node, frames, multiple = 4) {
      if (disposed || reduced() || !node.animate || !duration(multiple)) return null;
      const animation = node.animate(frames, { duration: duration(multiple), easing: getComputedStyle(root).getPropertyValue('--ui-ease').trim() });
      animations.add(animation);
      animation.finished.catch(() => {}).finally(() => {
        animations.delete(animation);
        if (!animations.size) { animationLoop?.stop(); animationLoop = null; }
      });
      if (!animationLoop) animationLoop = loop(root, () => {
        if (disposed || !root.isConnected) { queueMicrotask(dispose); return; }
        if (reduced()) animations.forEach((active) => {
          if (active.playState === 'running' || active.playState === 'paused') active.finish();
        });
      });
      return animation;
    }
    const dock = $('.lg-dock');
    const dockItems = [...dock.querySelectorAll('ui-button')];
    function magnifyDock(item) {
      const active = dockItems.indexOf(item);
      dockItems.forEach((button, index) => {
        const scale = active < 0 ? 1 : index === active ? 1.45 : Math.abs(index - active) === 1 ? 1.18 : 1;
        button.querySelector('.lg-icon').style.transform = `scale(${scale})`;
      });
    }
    listen(dock, 'pointerover', (event) => {
      if (event.pointerType === 'touch') return;
      const item = event.target.closest('ui-button');
      if (item && dock.contains(item) && !item.contains(event.relatedTarget)) magnifyDock(item);
    });
    listen(dock, 'pointerleave', () => magnifyDock(null));
    function moveCapsules(instant = false) {
      $$('.lg-side-nav,.lg-dock-nav').forEach((nav) => {
        const active = nav.querySelector('[aria-current="page"]');
        const pill = nav.querySelector('.lg-capsule');
        if (!active || !nav.offsetWidth) return;
        const n = nav.getBoundingClientRect(), r = active.getBoundingClientRect();
        const x = r.left - n.left, y = r.top - n.top;
        const ox = Number(pill.dataset.x ?? x), oy = Number(pill.dataset.y ?? y);
        pill.getAnimations().forEach((a) => a.cancel());
        pill.style.width = r.width + 'px';
        pill.style.height = r.height + 'px';
        pill.style.transform = `translate(${x}px,${y}px)`;
        pill.dataset.x = String(x); pill.dataset.y = String(y);
        if (instant) return;
        const vertical = nav.classList.contains('lg-side-nav');
        const axis = vertical ? 'Y' : 'X';
        const sign = Math.sign(vertical ? y - oy : x - ox) || 1;
        pill.style.transformOrigin = vertical ? `50% ${sign > 0 ? '100%' : '0%'}` : `${sign > 0 ? '100%' : '0%'} 50%`;
        const t = (xx, yy, scale = 1) => `translate(${xx}px,${yy}px) scale${axis}(${scale})`;
        animate(pill, [{ transform: t(ox, oy), offset: 0 }, { transform: t(ox + (x - ox) * .52, oy + (y - oy) * .52, 1.34), offset: .38 }, { transform: t(x + (vertical ? 0 : sign * 5), y + (vertical ? sign * 5 : 0), .94), offset: .75 }, { transform: t(x, y), offset: 1 }]);
      });
    }
    function navigate(page) {
      if (!pages[page]) return;
      state.page = page;
      root.dataset.page = page;
      $('[data-title]').textContent = pages[page][0];
      $('[data-breadcrumb]').textContent = pages[page][0];
      $('[data-eyebrow]').textContent = pages[page][1];
      $('[data-subtitle]').textContent = pages[page][2];
      $$('.lg-nav-item').forEach((item) => {
        const button = item.querySelector('button');
        button.setAttribute('aria-label', pages[item.dataset.page][0]);
        if (item.dataset.page === page) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
      moveCapsules();
      $('[data-status]').textContent = '已切换到' + pages[page][0];
    }
    function prepareProducts(scope = root) {
      const values = periods[state.period].values;
      const localNumber = (key, kind) => kind === 'delta'
        ? `<ui-count-up class="lg-number" data-metric="${key}" to="${values[key]}" from="${values[key]}" decimals="1" prefix="+" suffix="%"></ui-count-up>`
        : `<span aria-hidden="true">¥</span><span class="lg-sr">人民币</span><ui-odometer class="lg-number" data-metric="${key}" value="${Math.round(values[key])}"></ui-odometer>`;
      scope.querySelectorAll('[data-products]').forEach((table) => {
        table.setAttribute('rows', JSON.stringify([
          { name: 'Pro 年度订阅', revenue: localNumber('product1', 'currency'), delta: localNumber('productDelta1', 'delta') },
          { name: '团队协作方案', revenue: localNumber('product2', 'currency'), delta: localNumber('productDelta2', 'delta') },
          { name: '专业版月订阅', revenue: localNumber('product3', 'currency'), delta: localNumber('productDelta3', 'delta') }
        ]));
      });
    }
    function syncNumbers(scope = root) {
      const values = periods[state.period].values;
      scope.querySelectorAll('[data-metric]').forEach((element) => {
        const value = values[element.dataset.metric];
        if (value === undefined) return;
        if (element.localName === 'ui-odometer') {
          element.setAttribute('duration', String(duration(5)));
          element.setAttribute('value', String(Math.round(value)));
        } else if (element.localName === 'ui-count-up') {
          element.setAttribute('from', element.getAttribute('to') || String(value));
          element.setAttribute('duration', String(duration(5)));
          element.setAttribute('to', String(value));
        }
      });
    }
    function drawCharts(frame) {
      const labels = periods[state.period].labels;
      $$('[data-chart="revenue"]').forEach((chart) => chart.setAttribute('data', JSON.stringify(frame.bars.map((value, i) => ({ label: i % 2 ? '' : labels[Math.floor(i / 2)], value })))));
      $$('[data-chart="audience"]').forEach((chart) => chart.setAttribute('data', JSON.stringify([{ label: '新客户', value: frame.newCustomers }, { label: '回访客户', value: frame.returnCustomers }])));
      $$('[data-chart="goal"]').forEach((chart) => chart.setAttribute('value', String(frame.goal)));
      $$('[data-chart="source"]').forEach((chart) => chart.setAttribute('value', String(frame[chart.dataset.source])));
      $$('[data-chart="orders"]').forEach((chart) => chart.setAttribute('data', frame.trend.join(',')));
      $$('[data-chart="products"]').forEach((chart) => chart.setAttribute('data', JSON.stringify([{ label: 'Pro 年度订阅', value: frame.product1 }, { label: '团队协作方案', value: frame.product2 }, { label: '专业版月订阅', value: frame.product3 }])));
    }
    function transitionCharts(target) {
      stopCharts?.();
      const from = chartState;
      const ms = duration(5);
      const changed = Object.entries(target).some(([key, value]) => Array.isArray(value)
        ? value.some((number, index) => number !== from[key][index]) : value !== from[key]);
      if (reduced() || !ms || !changed) {
        chartState = target;
        drawCharts(chartState);
        return;
      }
      // 不播放空关键帧，只让浏览器按当前 --ui-ease 求插值曲线。
      const clock = new Animation(new KeyframeEffect(root, [], {
        duration: ms, fill: 'both', easing: getComputedStyle(root).getPropertyValue('--ui-ease').trim()
      }));
      let elapsed = 0;
      const motion = loop(root, (dt) => {
        if (disposed || !root.isConnected) { queueMicrotask(finish); return; }
        elapsed = Math.min(ms, elapsed + dt);
        clock.currentTime = elapsed;
        const done = reduced() || elapsed >= ms;
        const progress = done ? 1 : clock.effect.getComputedTiming().progress;
        chartState = done ? target : Object.fromEntries(Object.entries(target).map(([key, value]) => [key,
          Array.isArray(value) ? value.map((number, index) => from[key][index] + (number - from[key][index]) * progress)
            : from[key] + (value - from[key]) * progress
        ]));
        drawCharts(chartState);
        // loop 在 frame 返回后才排下一帧，微任务收尾才能取消那条 RAF。
        if (done) queueMicrotask(finish);
      });
      const finish = () => {
        motion.stop();
        clock.cancel();
        if (stopCharts === finish) stopCharts = null;
      };
      stopCharts = finish;
    }
    function setFilterOpen(open, focus = false) {
      detailFocusEpoch++;
      state.filter = open;
      $('.lg-time-box').classList.toggle('lg-expanded', open);
      timeButton.setAttribute('aria-expanded', String(open));
      timeButton.tabIndex = open ? -1 : 0;
      $('.lg-filter-options').toggleAttribute('inert', !open);
      $('.lg-filter-options').setAttribute('aria-hidden', String(!open));
      $$('.lg-filter-option').forEach((option) => {
        const button = option.querySelector('button');
        const current = option.dataset.period === state.period;
        button.setAttribute('role', 'option');
        button.setAttribute('aria-selected', String(current));
        button.tabIndex = open && current ? 0 : -1;
      });
      if (open && focus) $(`.lg-filter-option[data-period="${state.period}"] button`).focus({ preventScroll: true });
    }
    function setPeriod(key) {
      if (!periods[key]) return;
      state.period = key;
      root.dataset.period = key;
      $('[data-period-label]').textContent = periods[key].label;
      $('[data-period-note]').textContent = periods[key].note;
      timeButton.setAttribute('aria-label', '选择时间范围，' + periods[key].label);
      setFilterOpen(false);
      syncNumbers();
      transitionCharts({ ...periods[key].values, bars: [...periods[key].bars], trend: [...periods[key].trend] });
      $('[data-status]').textContent = '时间范围已切换为' + periods[key].label + '，所有指标与图表已更新。';
    }
    function sizeStage() {
      if (!state.detail) return;
      const gridHeight = $('.lg-grid').offsetHeight;
      const minimum = parseFloat(getComputedStyle(root).getPropertyValue('--ui-size-232px')) * 2.6;
      $('.lg-stage').style.height = (root.clientWidth <= 600 ? Math.max(minimum, Math.min(gridHeight, root.clientHeight * .78)) : gridHeight) + 'px';
    }
    function flip(node, from, to, reverse = false) {
      if (!from || !to.width || !to.height) return null;
      const small = `translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width},${from.height / to.height})`;
      const large = 'translate(0,0) scale(1,1)';
      node.getAnimations().forEach((a) => a.cancel());
      return animate(node, reverse ? [{ transform: large, opacity: 1 }, { transform: small, opacity: 0 }] : [{ transform: small, opacity: .8 }, { transform: large, opacity: 1 }], 4);
    }
    function flyCards(opening, key) {
      $$('.lg-module').forEach((card) => {
        if (card.dataset.module === key) return;
        const thumb = $(`[data-thumb="${card.dataset.module}"]`);
        const from = overviewRects[card.dataset.module], to = thumb.getBoundingClientRect();
        if (!from || !from.width || !from.height) return;
        const small = `translate(${to.left - from.left}px,${to.top - from.top}px) scale(${to.width / from.width},${to.height / from.height})`;
        card.getAnimations().forEach((a) => a.cancel());
        card.style.transformOrigin = '0 0';
        animate(card, opening ? [{ transform: 'none', opacity: 1 }, { transform: small, opacity: 0 }] : [{ transform: small, opacity: 0 }, { transform: 'none', opacity: 1 }], 3.8);
      });
    }
    async function openDetail(key) {
      if (!moduleNames[key] || state.detail === key || disposed) return;
      const epoch = ++detailEpoch;
      const focusEpoch = detailFocusEpoch;
      $$('.lg-module').forEach((card) => { card.style.visibility = ''; });
      const wasOpen = !!state.detail;
      if (!wasOpen) {
        overviewScroll = $('.lg-scroll').scrollTop;
        overviewRects = Object.fromEntries($$('.lg-module').map((card) => [card.dataset.module, card.getBoundingClientRect()]));
      }
      state.detail = key;
      root.dataset.detail = key;
      const layer = $('.lg-detail-layer'), detail = $('.lg-detail'), grid = $('.lg-grid');
      if (wasOpen) detail.getAnimations().forEach((animation) => animation.cancel());
      detail.classList.toggle('lg-goal', key === 'goal');
      detail.dataset.module = key;
      detail.setAttribute('aria-label', moduleNames[key] + '详情');
      $('[data-detail-title]').textContent = moduleNames[key];
      $('[data-detail-body]').replaceChildren($(`[data-detail-template="${key}"]`).content.cloneNode(true));
      prepareProducts($('[data-detail-body]'));
      $$('.lg-thumb').forEach((thumb) => {
        thumb.hidden = thumb.dataset.thumb === key;
        thumb.querySelector('button').setAttribute('aria-label', '切换至' + moduleNames[thumb.dataset.thumb]);
      });
      $('.lg-detail-scroll').scrollTop = 0;
      layer.hidden = false;
      grid.setAttribute('inert', '');
      grid.setAttribute('aria-hidden', 'true');
      sizeStage();
      await Promise.resolve();
      if (disposed || epoch !== detailEpoch) return;
      syncNumbers();
      drawCharts(chartState);
      if (!wasOpen) {
        const scroll = $('.lg-scroll');
        const offset = layer.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
        if (offset < 0) scroll.scrollTop += offset;
      }
      const animation = wasOpen
        ? animate(detail, [{ opacity: .7, transform: 'translateY(8px) scale(.987)' }, { opacity: 1, transform: 'none' }], 2)
        : flip(detail, overviewRects[key], detail.getBoundingClientRect());
      if (!wasOpen) {
        flyCards(true, key);
        grid.classList.add('lg-minimized');
        animate($('.lg-thumbnails'), [{ opacity: 0, transform: 'translateY(18px) scale(.96)' }, { opacity: 1, transform: 'none' }], 3);
      }
      if (animation) { try { await animation.finished; } catch {} }
      if (disposed || epoch !== detailEpoch) return;
      if (!state.filter && focusEpoch === detailFocusEpoch) $('[data-detail-close] button').focus({ preventScroll: true });
      $('[data-status]').textContent = '已展开' + moduleNames[key] + '，其他五个模块进入缩略条。';
    }
    async function closeDetail() {
      if (!state.detail || disposed) return;
      const key = state.detail, epoch = ++detailEpoch;
      const detail = $('.lg-detail'), grid = $('.lg-grid');
      const source = $(`.lg-module[data-module="${key}"]`);
      $$('.lg-module').forEach((card) => card.getAnimations().forEach((a) => a.cancel()));
      const animation = flip(detail, source.getBoundingClientRect(), detail.getBoundingClientRect(), true);
      source.style.visibility = 'hidden';
      grid.classList.remove('lg-minimized');
      flyCards(false, key);
      animate($('.lg-thumbnails'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(14px)' }], 2);
      state.detail = null;
      root.removeAttribute('data-detail');
      if (animation) { try { await animation.finished; } catch {} }
      if (disposed || epoch !== detailEpoch) return;
      $('.lg-detail-layer').hidden = true;
      $('[data-detail-body]').replaceChildren();
      grid.removeAttribute('inert');
      grid.removeAttribute('aria-hidden');
      source.style.visibility = '';
      $('.lg-stage').style.height = '';
      $('.lg-scroll').scrollTop = overviewScroll;
      if (state.page !== 'overview') navigate('overview');
      source.querySelector('[data-open] button').focus({ preventScroll: true });
      $('[data-status]').textContent = '已返回经营概览。';
    }
    listen(root, 'click', (event) => {
      const collapse = event.target.closest('[data-collapse]');
      if (collapse) {
        const collapsed = root.classList.toggle('lg-sidebar-collapsed');
        collapse.querySelector('button').setAttribute('aria-label', collapsed ? '展开侧边栏' : '收起侧边栏');
        $('[data-status]').textContent = collapsed ? '侧边栏已收起，仍可用图标导航。' : '侧边栏已展开。';
        return;
      }
      if (event.target.closest('[data-command]')) { setFilterOpen(false); command.show(); return; }
      if (event.target.closest('[data-time]')) { setFilterOpen(!state.filter, true); return; }
      const period = event.target.closest('.lg-filter-option');
      if (period && state.filter) { setPeriod(period.dataset.period); timeButton.focus({ preventScroll: true }); return; }
      if (event.target.closest('[data-detail-close]')) { closeDetail(); return; }
      const item = event.target.closest('.lg-nav-item');
      if (item && root.contains(item)) { navigate(item.dataset.page); if (item.dataset.page !== 'overview') openDetail(item.dataset.page); else closeDetail(); return; }
      const thumb = event.target.closest('[data-thumb]');
      if (thumb && !thumb.hidden) { openDetail(thumb.dataset.thumb); return; }
      const open = event.target.closest('[data-open]');
      const card = event.target.closest('.lg-module');
      if (open || (card && !event.target.closest('a,button,input,select,textarea'))) openDetail(open ? open.dataset.open : card.dataset.module);
    });
    listen(root, 'keydown', (event) => {
      const editable = event.target.closest('input,textarea,select,[contenteditable]');
      if (event.key.toLowerCase() === 'k' && !event.altKey && (!editable || event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setFilterOpen(false);
        command.show();
        return;
      }
      if (event.key === 'Escape' && state.filter) {
        event.preventDefault();
        setFilterOpen(false);
        timeButton.focus({ preventScroll: true });
        return;
      }
      const option = event.target.closest('.lg-filter-option');
      if (state.filter && option) {
        const buttons = $$('.lg-filter-option button');
        const index = buttons.indexOf(event.target.closest('button'));
        let next = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setPeriod(option.dataset.period);
          timeButton.focus({ preventScroll: true });
          return;
        } else return;
        event.preventDefault();
        buttons.forEach((button, i) => { button.tabIndex = i === next ? 0 : -1; });
        buttons[next].focus({ preventScroll: true });
        return;
      }
      if (event.key === 'Escape' && state.detail) { event.preventDefault(); closeDetail(); }
    });
    const resize = new ResizeObserver(() => {
      if (!root.isConnected) { dispose(); return; }
      moveCapsules(true);
      sizeStage();
    });
    resize.observe(root);
    resize.observe($('.lg-side-nav'));
    resize.observe($('.lg-dock-nav'));
    function dispose() {
      if (disposed) return;
      disposed = true;
      abort.abort();
      stopCharts?.();
      animationLoop?.stop();
      animationLoop = null;
      resize.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      const layer = $('.lg-detail-layer'), grid = $('.lg-grid');
      if (!layer.hidden) $('.lg-scroll').scrollTop = overviewScroll;
      layer.hidden = true;
      if (root.isConnected) $('[data-detail-body]').replaceChildren();
      grid.classList.remove('lg-minimized');
      grid.removeAttribute('inert');
      grid.removeAttribute('aria-hidden');
      $$('.lg-module').forEach((card) => { card.style.visibility = ''; });
      $('.lg-stage').style.height = '';
      root.removeAttribute('data-detail');
      delete root._liquidGlassMount;
    }
    root._liquidGlassMount = dispose;
    prepareProducts();
    setPeriod('week');
    navigate('overview');
    moveCapsules(true);
    return dispose;
  },
  ai: `【页面目标】呈现本地经营概览，不接入真实客户或交易。
【整体结构】从上到下安排悬浮岛导航、顶栏与时间胶囊、三项经营指标、收入趋势 / 客户结构 / 目标追踪 / 产品表现 / 收入来源 / 订单动态六个数据模块及底部图标 Dock。
【响应式】按 @container tpl 将桌面多列收为平板两列与手机单列。
【操作逻辑】点侧栏或 Dock 图标切换页面，并让当前项玻璃胶囊沿移动方向拉长、到位回弹；桌面侧栏按钮收起或展开文字。悬停数据卡时柔和光斑跟随光标、边框局部提亮、倾斜不超过 4 度；移出复原。点数据卡或展开按钮原位显示对应详情，其余五模块收为底部缩略条；点缩略图切换详情；关闭或 Esc 沿原路收回并归还焦点。点时间胶囊分裂出今日 / 本周 / 本月 / 本季，选择后融回并同时更新全部指标和图表，不整页刷新。模板内按 K / Ctrl+K 或点搜索打开命令面板；输入实时过滤并高亮，上下键选择、Enter 跳转到页面 / 模块 / 周期，Esc 关闭。Dock 悬停时当前与相邻图标联动放大，显示名称，当前页保留下方圆点。
【状态】所有数字是固定本地示例，直接就绪；空搜索显示未匹配提示。没有外部接口、网络加载或真实交易错误，不用虚构在线结果。
【无障碍】所有按钮具备名称与可见焦点；时间范围支持方向键、Home / End、Enter / Space 和 Esc；命令面板具备焦点陷阱，关闭后还给触发器；状态变化播报。减少动效时直接显示终态，循环离开视口 / 标签页隐藏时暂停，卸载时清理。
【约束】只用 var(--ui-*)，不使用 iframe，不引入外部资源。`,
  design: {
    purpose: '把经营概览与数据钻取放在同一个原生页面里。',
    when: ['经营数据演示', 'SaaS 运营后台', '需要保留上下文的数据钻取'],
    avoid: ['真实交易处理', '需要后端权限控制的生产后台'],
    tips: ['所有数据都是固定本地演示数据', '画廊跟随当前风格与明暗，不强制暖桃配色']
  }
};

export const liquidGlassTemplates = [liquidGlassDashboard];
