/* =========================================================
   画廊应用：视图切换 / 分类筛选 / 搜索 / 提示词与代码面板
   ========================================================= */
import { cssRegistry } from './components/base.js';
import { componentClasses } from './components/index.js';
import { catalog, CATS } from './data/catalog.js';
import { styles } from './data/styles.js';
import { styleGuides } from './data/style-guides.js';
import { templates, TPL_CATS, TPL_BASE_CSS } from './data/templates.js';

const nav = document.getElementById('nav');
const main = document.getElementById('main');
const search = document.getElementById('search');
const styleSel = document.getElementById('styleSel');
const themeBtn = document.getElementById('themeBtn');
const motionBtn = document.getElementById('motionBtn');
const viewSeg = document.getElementById('viewSeg');

const layout = document.querySelector('.layout');
const STORE = 'ui-gallery:state';
const state = { view: 'gallery', cat: '全部', tcat: '全部', q: '', theme: 'light', style: 'aurora', motion: 'on' };
const VIEWS = ['gallery', 'styles', 'templates'];

/* 记住上次的视图/风格/主题（实时刷新后不丢失）；存储不可用时静默降级 */
try {
  const saved = JSON.parse(localStorage.getItem(STORE) || '{}');
  ['view', 'cat', 'tcat', 'theme', 'style', 'motion'].forEach(function (k) { if (typeof saved[k] === 'string') state[k] = saved[k]; });
} catch (e) { /* 忽略 */ }
if (!styles.some(function (s) { return s.id === state.style; })) state.style = 'aurora';
if (state.cat !== '全部' && CATS.indexOf(state.cat) < 0) state.cat = '全部';
if (state.tcat !== '全部' && TPL_CATS.indexOf(state.tcat) < 0) state.tcat = '全部';
if (VIEWS.indexOf(state.view) < 0) state.view = 'gallery';
function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify({ view: state.view, cat: state.cat, tcat: state.tcat, theme: state.theme, style: state.style, motion: state.motion }));
  } catch (e) { /* 忽略 */ }
}

/* ---- 转义（避免把 demo 的 HTML 当成真标签渲染） ---- */
const AMP = String.fromCharCode(38);
const ESC_MAP = { '&': AMP + 'amp;', '<': AMP + 'lt;', '>': AMP + 'gt;', '"': AMP + 'quot;' };
const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ESC_MAP[m]);

/* ---- 工具 ---- */
function formatHtml(html) {
  return html.replace(/></g, '>\n<');
}

function propsDoc(tag) {
  const cls = componentClasses[tag];
  const defs = (cls && cls.props) || {};
  const keys = Object.keys(defs);
  if (!keys.length) return '（无）';
  return keys.map(function (k) {
    const d = defs[k];
    const type = (d.type || 'string') === 'boolean' ? 'boolean' : 'string';
    const def = d.default === undefined ? '' : ' = ' + d.default;
    return '  ' + k + ' : ' + type + def;
  }).join('\n');
}

function copy(text, btn) {
  const done = function () {
    const old = btn.textContent;
    btn.textContent = '已复制 ✓';
    setTimeout(function () { btn.textContent = old; }, 1200);
  };
  const fallback = function () {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* 忽略 */ }
    ta.remove();
    done();
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(fallback);
  } else {
    fallback();
  }
}

/* ---- 面板 ---- */
function paneAI(item) {
  return '<div class="pane__bar"><span>Prompt for Agent</span>' +
    '<button class="copy" data-copy="ai" data-id="' + item.id + '">复制</button></div>' +
    '<pre>' + esc(item.ai) + '</pre>';
}

function paneDesign(item) {
  const li = (arr) => arr.map((x) => '<li>' + esc(x) + '</li>').join('');
  return '<div class="pane__bar"><span>Design Note</span></div>' +
    '<p style="margin:0 0 8px">' + esc(item.design.purpose) + '</p>' +
    '<h4>什么时候用</h4><ul>' + li(item.design.when) + '</ul>' +
    '<h4 style="margin-top:10px">什么时候别用</h4><ul>' + li(item.design.avoid) + '</ul>';
}

function paneCode(item) {
  const css = cssRegistry.get(item.tag) || '';
  const code = formatHtml(item.demo) +
    '\n\n/* 可用属性（写在标签上） */\n' + propsDoc(item.tag) +
    '\n\n/* 组件 CSS（已自动注入，仅供参考） */\n' + css;
  return '<div class="pane__bar"><span>HTML + CSS</span>' +
    '<button class="copy" data-copy="html" data-id="' + item.id + '">复制 HTML</button></div>' +
    '<pre>' + esc(code) + '</pre>';
}

function cardHTML(item) {
  return '<article class="card' + (item.wide ? ' card--wide' : '') + '" data-card="' + item.id + '" aria-labelledby="t-' + item.id + '">' +
    '<div class="card__hd"><h2 id="t-' + item.id + '">' + esc(item.name) +
    '<code>' + esc(item.tag) + '</code></h2>' +
    '<span class="cat">' + esc(item.cat) + '</span></div>' +
    '<div class="stage">' + item.demo + '</div>' +
    '<div class="card__tabs">' +
    '<button class="on" data-pane="ai">AI 提示词</button>' +
    '<button data-pane="design">设计说明</button>' +
    '<button data-pane="code">代码</button></div>' +
    '<div class="pane" data-body="ai">' + paneAI(item) + '</div>' +
    '<div class="pane" data-body="design" hidden>' + paneDesign(item) + '</div>' +
    '<div class="pane" data-body="code" hidden>' + paneCode(item) + '</div>' +
    '</article>';
}

/* ---- 风格页 ---- */
/* 一个「迷你应用」：同一段标记在每种风格 × 明暗下各渲染一次 */
function showcase(theme, styleId) {
  return '<div class="sdemo" data-style="' + styleId + '" data-theme="' + theme + '">' +
    '<div class="sdemo__hd"><span class="sdemo__mode">' + (theme === 'dark' ? '● 深色' : '○ 浅色') + '</span>' +
    '<b>项目概览</b><ui-tag variant="success" look="dot">进行中</ui-tag></div>' +
    '<ui-tabs items="概览,成员,设置" active="0"></ui-tabs>' +
    '<div class="sdemo__stats">' +
    '<ui-stat label="本周完成" value="128" delta="↑ 12%" trend="up"></ui-stat>' +
    '<ui-ring value="64" size="58"></ui-ring></div>' +
    '<ui-progress value="64" label="迭代进度" show-value></ui-progress>' +
    '<div class="sdemo__form"><ui-input placeholder="搜索成员"></ui-input>' +
    '<ui-select options="全部角色,设计,开发,产品"></ui-select></div>' +
    '<div class="sdemo__row"><ui-switch checked>通知</ui-switch><ui-checkbox checked>只看我的</ui-checkbox>' +
    '<ui-segmented items="日,周,月" value="周"></ui-segmented></div>' +
    '<div class="sdemo__act"><ui-avatar-group size="sm" names="林,周,吴,郑,王" max="3"></ui-avatar-group>' +
    '<span class="sdemo__sp"></span><ui-button size="sm">取消</ui-button>' +
    '<ui-button size="sm" variant="primary">保存</ui-button></div>' +
    '</div>';
}

/* 从 tokens.css 实时读取某个风格的变量取值，拼进提示词，保证与代码一致 */
const TOKEN_KEYS = ['bg', 'panel', 'panel-2', 'text', 'sub', 'line', 'brand', 'brand-ink', 'brand-soft', 'accent',
  'ok', 'warn', 'danger', 'radius-sm', 'radius', 'radius-lg', 'border-w', 'ctl-h', 'shadow-sm', 'shadow', 'font'];
const tokenCache = {};
function readTokens(id) {
  if (tokenCache[id]) return tokenCache[id];
  const out = {};
  ['light', 'dark'].forEach(function (t) {
    const probe = document.createElement('div');
    probe.setAttribute('data-style', id);
    probe.setAttribute('data-theme', t);
    probe.hidden = true;
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    out[t] = {};
    TOKEN_KEYS.forEach(function (k) { out[t][k] = cs.getPropertyValue('--ui-' + k).trim().replace(/\s+/g, ' '); });
    probe.remove();
  });
  return (tokenCache[id] = out);
}

function styleAI(s) {
  const g = styleGuides[s.id] || {};
  const tk = readTokens(s.id);
  const lines = TOKEN_KEYS.map(function (k) {
    const a = tk.light[k], b = tk.dark[k];
    return '  --ui-' + k + ': ' + (a === b ? a : a + '  ｜ 深色：' + b);
  });
  return (g.ai || ('【风格】' + s.name + ' · data-style="' + s.id + '"\n' + s.brief)) +
    '\n【用法】在 <html> 上设置 data-style="' + s.id + '"，明暗用 data-theme="light | dark"；也可以只加在某个容器上做局部换肤' +
    '\n【变量取值】（浅色 ｜ 深色，实时读取自 tokens.css，组件只能引用这些变量）\n' + lines.join('\n');
}

function paneStyleDesign(s) {
  const g = (styleGuides[s.id] || {}).design || {};
  const li = (arr) => (arr || []).map((x) => '<li>' + esc(x) + '</li>').join('');
  return '<div class="pane__bar"><span>Design Note</span></div>' +
    '<p style="margin:0 0 8px">' + esc(g.purpose || s.brief) + '</p>' +
    '<h4>适合</h4><ul>' + li(g.when) + '</ul>' +
    '<h4 style="margin-top:10px">不适合</h4><ul>' + li(g.avoid) + '</ul>' +
    (g.tips && g.tips.length ? '<h4 style="margin-top:10px">落地要点</h4><ul>' + li(g.tips) + '</ul>' : '');
}

function styleFrame(s) {
  const on = s.id === state.style;
  const sw = (s.swatch || []).map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('');
  return '<section class="sframe' + (on ? ' sframe--on' : '') + '" data-style="' + s.id + '" data-theme="' + state.theme + '">' +
    '<header class="sframe__hd"><span class="sframe__sw" aria-hidden="true">' + sw + '</span>' +
    '<div class="sframe__name"><b>' + esc(s.name) + '</b><small>data-style="' + s.id + '"</small></div>' +
    '<button class="sframe__apply" data-apply="' + s.id + '"' + (on ? ' aria-pressed="true"' : '') + '>' +
    (on ? '✓ 当前风格' : '应用到全站') + '</button></header>' +
    '<div class="sframe__body">' + showcase('light', s.id) + showcase('dark', s.id) + '</div>' +
    '<footer class="sframe__note"><b>' + esc(s.brief) + '</b><p>' + esc(s.note) + '</p>' +
    '<div class="sframe__tags">' + (s.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
    '</footer>' +
    '<div class="card__tabs" role="tablist" aria-label="' + esc(s.name) + ' 说明">' +
    '<button class="on" data-pane="ai" role="tab" aria-selected="true">AI 提示词</button>' +
    '<button data-pane="design" role="tab" aria-selected="false">设计说明</button></div>' +
    '<div class="pane" data-body="ai" role="tabpanel"><div class="pane__bar"><span>Prompt for Agent</span>' +
    '<button class="copy" data-copy="style-ai" data-id="' + s.id + '">复制</button></div>' +
    '<pre>' + esc(styleAI(s)) + '</pre></div>' +
    '<div class="pane" data-body="design" role="tabpanel" hidden>' + paneStyleDesign(s) + '</div>' +
    '</section>';
}

/* ---- 界面模板页 ---- */
/* 模板样式统一注入一次（公共骨架 + 各模板的作用域样式） */
(function injectTplCss() {
  const el = document.createElement('style');
  el.setAttribute('data-tpl', '');
  el.textContent = TPL_BASE_CSS + templates.map(function (t) { return t.css; }).join('\n');
  document.head.appendChild(el);
})();

/* init 方法的源码 → 独立的 function，去掉对象里的缩进，放进「代码」面板 */
function fnSource(fn) {
  const src = fn.toString().replace(/^init\s*\(/, 'function init(');
  const lines = src.split('\n');
  const ind = lines.slice(1).filter(function (l) { return l.trim(); })
    .reduce(function (m, l) { return Math.min(m, l.match(/^ */)[0].length); }, 99);
  const cut = ind === 99 ? 0 : ind;
  return lines.map(function (l, i) { return i ? l.slice(Math.min(cut, l.match(/^ */)[0].length)) : l; }).join('\n');
}

function tplAI(t) {
  return t.ai +
    '\n【依赖组件】' + t.uses.join('、') +
    '\n【组件库】ui-catalog 零依赖 Web Components：引入 tokens.css + components/index.js；换风格只改 <html> 上的 data-style / data-theme，模板样式只能用 var(--ui-*) 变量';
}

function tplCode(t) {
  return '<!-- 页面结构 -->\n' + formatHtml(t.html) +
    '\n\n/* 公共骨架样式（所有模板共用） */' + TPL_BASE_CSS +
    '\n/* 模板样式 */' + t.css +
    '\n\n// 操作逻辑：页面挂载后调用一次，参数是这一页的根节点\n' +
    (t.init ? fnSource(t.init) + '\ninit(document.querySelector(\'.t-' + t.id + '\'));' : '// （无）') +
    '\n\n// 依赖组件：' + t.uses.join(', ');
}

function paneTplDesign(t) {
  const g = t.design;
  const li = (arr) => (arr || []).map((x) => '<li>' + esc(x) + '</li>').join('');
  return '<div class="pane__bar"><span>Design Note</span></div>' +
    '<p style="margin:0 0 8px">' + esc(g.purpose) + '</p>' +
    '<h4>适合</h4><ul>' + li(g.when) + '</ul>' +
    '<h4 style="margin-top:10px">不适合</h4><ul>' + li(g.avoid) + '</ul>' +
    (g.tips && g.tips.length ? '<h4 style="margin-top:10px">落地要点</h4><ul>' + li(g.tips) + '</ul>' : '');
}

const VW = [['桌面', ''], ['平板', '768'], ['手机', '390']];
function tplFrame(t) {
  if (t.frame === 'phone') {
    return '<div class="tphone"><div class="tphone__sb" aria-hidden="true"><span>9:41</span><span>▂▄▆ 5G ▭</span></div>' + t.html + '</div>';
  }
  return '<div class="tbrowser' + (t.fit ? ' tbrowser--fit' : '') + '"><div class="tbrowser__bar" aria-hidden="true"><i></i><i></i><i></i><span>' + esc(t.url || 'example.com') + '</span></div>' +
    '<div class="tbrowser__vp"><div class="tbrowser__page" data-page>' + t.html + '</div></div></div>';
}

function tplCardHTML(t) {
  const web = t.frame !== 'phone';
  return '<article class="card tcard' + (web ? ' tcard--web' : '') + '" data-card="tpl-' + t.id + '" aria-labelledby="t-tpl-' + t.id + '">' +
    '<div class="card__hd"><h2 id="t-tpl-' + t.id + '">' + esc(t.name) +
    '<code>' + (web ? (t.cat === 'JS 绘制' ? 'Canvas' : '响应式 Web') : '移动端 · 375 宽') + '</code></h2>' +
    '<span class="cat">' + esc(t.cat) + '</span></div>' +
    '<div class="tcard__bar"><span>' + esc(t.brief) + '</span>' +
    (web ? '<div class="tvw" role="group" aria-label="' + esc(t.name) + ' 预览宽度">' + VW.map(function (v, i) {
      return '<button data-vw="' + v[1] + '" aria-pressed="' + (i === 0) + '">' + v[0] + '</button>';
    }).join('') + '</div>' : '') + '</div>' +
    '<div class="tstage">' + tplFrame(t) + '</div>' +
    '<div class="card__tabs">' +
    '<button class="on" data-pane="ai">AI 提示词</button>' +
    '<button data-pane="design">设计说明</button>' +
    '<button data-pane="code">代码</button></div>' +
    '<div class="pane" data-body="ai"><div class="pane__bar"><span>Prompt for Agent</span>' +
    '<button class="copy" data-copy="tpl-ai" data-id="' + t.id + '">复制</button></div><pre>' + esc(tplAI(t)) + '</pre></div>' +
    '<div class="pane" data-body="design" hidden>' + paneTplDesign(t) + '</div>' +
    '<div class="pane" data-body="code" hidden><div class="pane__bar"><span>HTML + CSS + JS</span>' +
    '<button class="copy" data-copy="tpl-code" data-id="' + t.id + '">复制代码</button></div><pre>' + esc(tplCode(t)) + '</pre></div>' +
    '</article>';
}

/* 挂载后执行每个模板的操作逻辑；等组件完成首次渲染（微任务）再绑定 */
function mountTemplates() {
  setTimeout(function () {
    templates.forEach(function (t) {
      const root = main.querySelector('[data-card="tpl-' + t.id + '"] .t-' + t.id);
      if (root && t.init && !root.dataset.ready) {
        root.dataset.ready = '1';
        try { t.init(root); } catch (e) { console.error('[模板 ' + t.id + '] init 出错', e); }
      }
    });
  }, 0);
}

function filteredTpl() {
  const q = state.q.trim().toLowerCase();
  return templates.filter(function (t) {
    if (state.tcat !== '全部' && t.cat !== state.tcat) return false;
    if (!q) return true;
    return (t.name + ' ' + t.brief + ' ' + t.cat + ' ' + t.ai).toLowerCase().indexOf(q) > -1;
  });
}

/* ---- 渲染 ---- */
function filtered() {
  const q = state.q.trim().toLowerCase();
  return catalog.filter(function (c) {
    const inCat = state.cat === '全部' || c.cat === state.cat;
    if (!inCat) return false;
    if (!q) return true;
    return (c.name + ' ' + c.tag + ' ' + c.brief + ' ' + c.ai).toLowerCase().indexOf(q) > -1;
  });
}

function renderNav() {
  const tpl = state.view === 'templates';
  const src = tpl ? templates : catalog;
  const cur = tpl ? state.tcat : state.cat;
  const cats = ['全部'].concat(tpl ? TPL_CATS : CATS);
  nav.setAttribute('aria-label', tpl ? '模板分类' : '组件分类');
  nav.innerHTML = '<div class="t">' + (tpl ? '模板类型' : '分类') + '</div>' + cats.map(function (c) {
    const n = c === '全部' ? src.length : src.filter(function (x) { return x.cat === c; }).length;
    return '<button data-cat="' + c + '"' + (c === cur ? ' class="on"' : '') + '>' +
      c + '<span class="n"> ' + n + '</span></button>';
  }).join('');
}

function render() {
  layout.classList.toggle('layout--full', state.view === 'styles');
  search.hidden = state.view === 'styles';
  if (state.view === 'styles') {
    nav.hidden = true;
    main.innerHTML = '<p class="hint">' + styles.length + ' 套风格 · 同一套组件代码，只切换 data-style / data-theme 变量。' +
      '每张卡左浅右深（窄屏上下排列），下方有给 AI 的风格提示词和设计说明，点「应用到全站」即可切换整个画廊。</p>' +
      '<div class="styles">' + styles.map(styleFrame).join('') + '</div>';
    return;
  }
  nav.hidden = false;
  if (state.view === 'templates') {
    const tl = filteredTpl();
    main.innerHTML = tl.length
      ? '<p class="hint">' + (state.tcat === '全部' ? '全部模板' : state.tcat) + ' · ' + tl.length + ' 个' +
        (state.q ? '（搜索「' + esc(state.q) + '」）' : '') +
        ' · 整页布局 + 操作逻辑，全部用组件库拼成，切换风格 / 明暗会一起变；预览可以直接点、滑、拖。</p>' +
        '<div class="grid tgrid">' + tl.map(tplCardHTML).join('') + '</div>'
      : '<p class="none">没有匹配的模板，换个关键词试试～</p>';
    mountTemplates();
    return;
  }
  const list = filtered();
  main.innerHTML = list.length
    ? '<p class="hint">' + (state.cat === '全部' ? '全部' : state.cat) + ' · ' + list.length + ' 个组件' +
      (state.q ? '（搜索「' + esc(state.q) + '」）' : '') + '</p>' +
      '<div class="grid">' + list.map(cardHTML).join('') + '</div>'
    : '<p class="none">没有匹配的组件，换个关键词试试～</p>';
}

/* ---- 事件 ---- */
nav.addEventListener('click', function (e) {
  let b = e.target.closest('[data-cat]');
  if (!b) return;
  if (state.view === 'templates') state.tcat = b.dataset.cat; else state.cat = b.dataset.cat;
  save();
  renderNav();
  render();
  b = nav.querySelector('[data-cat="' + (state.view === 'templates' ? state.tcat : state.cat) + '"]');
  if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center' });
});

search.addEventListener('input', function () {
  state.q = search.value;
  render();
});

viewSeg.addEventListener('click', function (e) {
  const b = e.target.closest('[data-view]');
  if (!b) return;
  if (state.view === b.dataset.view) return;
  state.view = b.dataset.view;
  save();
  syncView();
  window.scrollTo({ top: 0 });
  renderNav();
  render();
});

function syncView() {
  viewSeg.querySelectorAll('button').forEach(function (x) {
    x.classList.toggle('on', x.dataset.view === state.view);
    x.setAttribute('aria-pressed', String(x.dataset.view === state.view));
  });
  const ph = state.view === 'templates' ? '搜索模板…' : '搜索组件…';
  search.placeholder = ph;
  search.setAttribute('aria-label', ph.replace('…', ''));
}

function applyStyle(id) {
  state.style = id;
  styleSel.value = id;
  document.documentElement.setAttribute('data-style', id);
  save();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  themeBtn.textContent = state.theme === 'light' ? '🌙 暗色' : '☀️ 亮色';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--ui-bg').trim());
}

function applyMotion() {
  const off = state.motion === 'reduce';
  if (off) document.documentElement.setAttribute('data-motion', 'reduce');
  else document.documentElement.removeAttribute('data-motion');
  motionBtn.setAttribute('aria-pressed', String(!off));
  motionBtn.textContent = off ? '⏸ 动效已关' : '✨ 动效';
}

motionBtn.addEventListener('click', function () {
  state.motion = state.motion === 'reduce' ? 'on' : 'reduce';
  applyMotion();
  save();
  /* JS 驱动的动效（打字机、粒子…）在挂载时读取开关，重渲染让它们按新设置重新开始 */
  const y = window.scrollY;
  render();
  window.scrollTo({ top: y });
});

styleSel.addEventListener('change', function () {
  applyStyle(styleSel.value);
  if (state.view === 'styles') render();
});

themeBtn.addEventListener('click', function () {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  save();
  /* 风格页的外框跟随当前明暗 */
  if (state.view === 'styles') {
    main.querySelectorAll('.sframe').forEach(function (f) { f.setAttribute('data-theme', state.theme); });
  }
});

main.addEventListener('click', function (e) {
  const ap = e.target.closest('[data-apply]');
  if (ap) {
    applyStyle(ap.dataset.apply);
    const y = window.scrollY;
    render();
    window.scrollTo({ top: y });
    return;
  }

  /* 浏览器框：切换预览宽度（桌面 / 平板 / 手机），模板内部用容器查询自适应 */
  const vw = e.target.closest('[data-vw]');
  if (vw) {
    const card = vw.closest('.tcard');
    card.querySelectorAll('[data-vw]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === vw)); });
    const page = card.querySelector('[data-page]');
    page.style.maxWidth = vw.dataset.vw ? vw.dataset.vw + 'px' : '';
    card.classList.toggle('tcard--narrow', !!vw.dataset.vw);
    return;
  }

  const tab = e.target.closest('[data-pane]');
  if (tab) {
    const card = tab.closest('.card, .sframe');
    card.querySelectorAll('.card__tabs button').forEach(function (b) {
      b.classList.toggle('on', b === tab);
      if (b.hasAttribute('aria-selected')) b.setAttribute('aria-selected', String(b === tab));
    });
    card.querySelectorAll('[data-body]').forEach(function (p) {
      p.hidden = p.dataset.body !== tab.dataset.pane;
    });
    return;
  }

  const cp = e.target.closest('[data-copy]');
  if (!cp) return;
  if (cp.dataset.copy === 'tpl-ai' || cp.dataset.copy === 'tpl-code') {
    const t = templates.find(function (x) { return x.id === cp.dataset.id; });
    if (t) copy(cp.dataset.copy === 'tpl-ai' ? tplAI(t) : tplCode(t), cp);
    return;
  }
  if (cp.dataset.copy === 'style-ai') {
    const st = styles.find(function (x) { return x.id === cp.dataset.id; });
    if (st) copy(styleAI(st), cp);
    return;
  }
  const item = catalog.find(function (x) { return x.id === cp.dataset.id; });
  if (!item) return;
  const kind = cp.dataset.copy;
  if (kind === 'ai') copy(item.ai, cp);
  else if (kind === 'html') copy(item.demo, cp);
});

/* ---- 启动 ---- */
styleSel.innerHTML = styles.map(function (s) {
  return '<option value="' + s.id + '"' + (s.id === state.style ? ' selected' : '') + '>' + esc(s.name) + '</option>';
}).join('');

document.documentElement.setAttribute('data-style', state.style);
applyTheme();
applyMotion();
syncView();
renderNav();
render();

/* 顶栏高度会随换行变化：同步给移动端吸顶的分类条 */
const topBar = document.querySelector('.top');
function syncTopH() { document.documentElement.style.setProperty('--top-h', topBar.offsetHeight + 'px'); }
if (window.ResizeObserver) new ResizeObserver(syncTopH).observe(topBar);
syncTopH();
