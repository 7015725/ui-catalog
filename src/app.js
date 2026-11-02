/* =========================================================
   画廊应用：视图切换 / 分类筛选 / 搜索 / 提示词与代码面板
   ========================================================= */
import { cssRegistry } from './components/base.js';
import { componentClasses } from './components/index.js';
import { catalog, CATS } from './data/catalog.js';
import { styles } from './data/styles.js';
import { styleGuides } from './data/style-guides.js';

const nav = document.getElementById('nav');
const main = document.getElementById('main');
const search = document.getElementById('search');
const styleSel = document.getElementById('styleSel');
const themeBtn = document.getElementById('themeBtn');
const motionBtn = document.getElementById('motionBtn');
const viewSeg = document.getElementById('viewSeg');

const layout = document.querySelector('.layout');
const STORE = 'ui-gallery:state';
const state = { view: 'gallery', cat: '全部', q: '', theme: 'light', style: 'aurora', motion: 'on' };

/* 记住上次的视图/风格/主题（实时刷新后不丢失）；存储不可用时静默降级 */
try {
  const saved = JSON.parse(localStorage.getItem(STORE) || '{}');
  ['view', 'cat', 'theme', 'style', 'motion'].forEach(function (k) { if (typeof saved[k] === 'string') state[k] = saved[k]; });
} catch (e) { /* 忽略 */ }
if (!styles.some(function (s) { return s.id === state.style; })) state.style = 'aurora';
if (state.cat !== '全部' && CATS.indexOf(state.cat) < 0) state.cat = '全部';
function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify({ view: state.view, cat: state.cat, theme: state.theme, style: state.style, motion: state.motion }));
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
const TOKEN_KEYS = ['bg', 'panel', 'panel-2', 'text', 'sub', 'line', 'brand', 'brand-ink', 'brand-soft',
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
  const cats = ['全部'].concat(CATS);
  nav.innerHTML = '<div class="t">分类</div>' + cats.map(function (c) {
    const n = c === '全部' ? catalog.length : catalog.filter(function (x) { return x.cat === c; }).length;
    return '<button data-cat="' + c + '"' + (c === state.cat ? ' class="on"' : '') + '>' +
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
  state.cat = b.dataset.cat;
  save();
  renderNav();
  render();
  b = nav.querySelector('[data-cat="' + state.cat + '"]');
  if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center' });
});

search.addEventListener('input', function () {
  state.q = search.value;
  render();
});

viewSeg.addEventListener('click', function (e) {
  const b = e.target.closest('[data-view]');
  if (!b) return;
  state.view = b.dataset.view;
  save();
  syncView();
  window.scrollTo({ top: 0 });
  render();
});

function syncView() {
  viewSeg.querySelectorAll('button').forEach(function (x) {
    x.classList.toggle('on', x.dataset.view === state.view);
  });
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
