/* =========================================================
   展示扩展（第四批）：ui-image（比例 + 灯箱预览）/ ui-comment / ui-calendar
   ========================================================= */
import { UIElement, register } from './base.js';
import { trapTab } from '../lib/focus.js';
import { esc } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
function parseArr(text) { try { const v = JSON.parse(text || '[]'); return Array.isArray(v) ? v : null; } catch (e) { return null; } }

/* ---------------- Image 图片 + 灯箱 ---------------- */
export const imageCss = `
ui-image{display:block;min-width:0}
.ui-img{margin:0;display:flex;flex-direction:column;gap:6px}
.ui-img__box{position:relative;display:block;width:100%;aspect-ratio:var(--r,4/3);overflow:hidden;padding:0;cursor:zoom-in;
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);background:var(--ui-panel-2);font:inherit}
.ui-img__box:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-img__box img{position:absolute;inset:0;width:100%;height:100%;object-fit:var(--fit,cover);transition:transform .4s ease,opacity .3s}
.ui-img__box:hover img{transform:scale(1.04)}
.ui-img__box img[data-loading]{opacity:0}
.ui-img__ph{position:absolute;inset:0;display:grid;place-items:center;color:var(--ui-sub);font-size:12px;
  background:linear-gradient(110deg,var(--ui-panel-2) 30%,var(--ui-panel) 50%,var(--ui-panel-2) 70%) 0 0/250% 100%;animation:ui-img-sh 1.4s linear infinite}
@keyframes ui-img-sh{to{background-position:-150% 0}}
.ui-img__err{position:absolute;inset:0;display:grid;place-items:center;font-size:12px;color:var(--ui-sub);background:var(--ui-panel-2)}
.ui-img figcaption{font-size:12px;color:var(--ui-sub);line-height:1.5}
.ui-lightbox{position:fixed;inset:0;z-index:380;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;
  background:rgba(8,10,14,.86);animation:ui-fade-in .18s ease}
.ui-lightbox[hidden]{display:none}
.ui-lightbox img{max-width:100%;max-height:calc(100vh - 110px);object-fit:contain;border-radius:6px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.ui-lightbox p{margin:0;color:#e8eaf0;font-size:13px;text-align:center}
.ui-lightbox button{position:absolute;top:14px;right:14px;width:38px;height:38px;border-radius:50%;border:0;cursor:pointer;
  background:rgba(255,255,255,.14);color:#fff;font-size:20px}
.ui-lightbox button:hover{background:rgba(255,255,255,.26)}
.ui-lightbox button:focus-visible{outline:2px solid #fff;outline-offset:2px}
@keyframes ui-fade-in{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.ui-img__ph{animation:none}.ui-img__box:hover img{transform:none}}
`;

/* 内置示例图：用 SVG 渐变生成，避免依赖外网图片 */
export function demoImage(seed, label) {
  const hues = [[222, 280], [160, 200], [20, 340], [45, 15], [265, 200], [190, 140]];
  const h = hues[(Number(seed) || 0) % hues.length];
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h[0] + ',75%,62%)"/><stop offset="1" stop-color="hsl(' + h[1] + ',70%,45%)"/></linearGradient></defs>' +
    '<rect width="800" height="600" fill="url(#g)"/>' +
    '<circle cx="610" cy="170" r="70" fill="rgba(255,255,255,.55)"/>' +
    '<path d="M0 470 L210 300 L360 420 L520 260 L800 500 L800 600 L0 600Z" fill="rgba(255,255,255,.28)"/>' +
    '<path d="M0 520 L180 420 L330 500 L560 380 L800 560 L800 600 L0 600Z" fill="rgba(0,0,0,.18)"/>' +
    (label ? '<text x="40" y="80" font-family="sans-serif" font-size="40" font-weight="700" fill="rgba(255,255,255,.9)">' + String(label).replace(/[<&]/g, '') + '</text>' : '') +
    '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

let lightbox = null;
function openLightbox(src, alt, caption) {
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'ui-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', '图片预览');
    lightbox.hidden = true;
    lightbox.innerHTML = '<button type="button" aria-label="关闭预览">×</button><img alt=""><p></p>';
    document.body.appendChild(lightbox);
    const close = () => {
      lightbox.hidden = true;
      if (lightbox._untrap) lightbox._untrap();
      document.documentElement.style.overflow = '';
      if (lightbox._ret && lightbox._ret.focus) lightbox._ret.focus();
    };
    lightbox._close = close;
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target.tagName === 'BUTTON') close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lightbox.hidden) close(); });
  }
  lightbox._ret = document.activeElement;
  const img = lightbox.querySelector('img');
  img.src = src; img.alt = alt || '';
  lightbox.querySelector('p').textContent = caption || alt || '';
  lightbox.hidden = false;
  lightbox._untrap = trapTab(lightbox);
  document.documentElement.style.overflow = 'hidden';
  lightbox.querySelector('button').focus();
}

export class UIImage extends UIElement {
  static props = { src: { default: '' }, alt: { default: '' }, ratio: { default: '4/3' }, fit: { default: 'cover' }, caption: { default: '' }, demo: { default: '' }, preview: { default: 'true' } };
  _src() { return this.props.src || (this.props.demo !== '' ? demoImage(this.props.demo, this.props.alt) : ''); }
  template(p) {
    const src = this._src();
    const prev = p.preview !== 'false';
    const tag = prev ? 'button type="button" aria-label="预览：' + esc(p.alt || '图片') + '"' : 'span';
    return '<figure class="ui-img"><' + tag + ' class="ui-img__box" style="--r:' + esc(p.ratio) + ';--fit:' + esc(p.fit) + (prev ? '' : ';cursor:default') + '">' +
      '<span class="ui-img__ph" aria-hidden="true">加载中</span>' +
      (src ? '<img src="' + esc(src) + '" alt="' + esc(p.alt) + '" loading="lazy" decoding="async" data-loading>' : '<span class="ui-img__err">未提供图片</span>') +
      '</' + (prev ? 'button' : 'span') + '>' + (p.caption ? '<figcaption>' + esc(p.caption) + '</figcaption>' : '') + '</figure>';
  }
  mounted() {
    const self = this;
    const img = this.querySelector('img');
    const ph = this.querySelector('.ui-img__ph');
    if (img) {
      const done = () => { img.removeAttribute('data-loading'); if (ph) ph.remove(); };
      if (img.complete && img.naturalWidth) done();
      img.addEventListener('load', done);
      img.addEventListener('error', () => {
        if (ph) ph.remove();
        img.remove();
        const box = self.querySelector('.ui-img__box');
        if (box) box.insertAdjacentHTML('beforeend', '<span class="ui-img__err">图片加载失败</span>');
      });
    } else if (ph) ph.remove();
    const box = this.querySelector('button.ui-img__box');
    if (box && img) box.addEventListener('click', () => { openLightbox(self._src(), self.props.alt, self.props.caption); emit(self, 'preview', {}); });
  }
}
register('ui-image', UIImage, imageCss);

/* ---------------- Comment 评论 ---------------- */
export const commentCss = `
ui-comment{display:block;width:100%}
.ui-cm{display:grid;grid-template-columns:34px 1fr;gap:10px}
.ui-cm + .ui-cm{margin-top:14px}
.ui-cm__av{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:600;
  color:var(--ui-brand-ink);background:linear-gradient(135deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 45%,var(--ui-accent)))}
.ui-cm__av--2{background:linear-gradient(135deg,var(--ui-ok),color-mix(in srgb,var(--ui-ok) 50%,var(--ui-brand)))}
.ui-cm__av--3{background:linear-gradient(135deg,var(--ui-warn),color-mix(in srgb,var(--ui-warn) 50%,var(--ui-danger)))}
.ui-cm__body{min-width:0}
.ui-cm__hd{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 8px;font-size:12px;color:var(--ui-sub)}
.ui-cm__hd b{font-size:13px;color:var(--ui-text)}
.ui-cm__tag{font-size:10.5px;padding:0 6px;border-radius:var(--ui-radius-pill);background:var(--ui-brand-soft);color:var(--ui-brand);line-height:1.7}
.ui-cm__txt{margin:4px 0 6px;font-size:13px;line-height:1.7;color:var(--ui-text);word-break:break-word}
.ui-cm__act{display:flex;gap:14px}
.ui-cm__act button{border:0;background:none;padding:2px 0;cursor:pointer;font:inherit;font-size:12px;color:var(--ui-sub);transition:var(--ui-motion)}
.ui-cm__act button:hover{color:var(--ui-brand)}
.ui-cm__act button[aria-pressed="true"]{color:var(--ui-danger)}
.ui-cm__act button:focus-visible{outline:none;box-shadow:var(--ui-ring);border-radius:4px}
.ui-cm__kids{margin-top:12px;padding-left:12px;border-left:2px solid var(--ui-line)}
.ui-cm__reply{display:flex;gap:8px;margin-top:8px}
.ui-cm__reply input{flex:1;min-width:0;height:32px;padding:0 10px;font:inherit;font-size:13px;color:var(--ui-text);
  background:var(--ui-panel-2);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);outline:none}
.ui-cm__reply input:focus{border-color:var(--ui-brand)}
.ui-cm__reply button{height:32px;padding:0 12px;border:0;border-radius:var(--ui-radius-sm);cursor:pointer;font:inherit;font-size:12.5px;
  background:var(--ui-brand);color:var(--ui-brand-ink)}
`;

export class UIComment extends UIElement {
  static props = { items: { default: '[]' } };
  template(p) {
    const list = parseArr(p.items);
    if (!list) return '<div style="font-size:12.5px;color:var(--ui-sub)">items 需要是合法 JSON 数组</div>';
    let n = 0;
    const one = (c, path) => {
      const k = (n++ % 3) + 1;
      return '<article class="ui-cm" data-path="' + path + '"><span class="ui-cm__av ui-cm__av--' + k + '" aria-hidden="true">' + esc(String(c.author || '?').slice(0, 1)) + '</span>' +
        '<div class="ui-cm__body"><div class="ui-cm__hd"><b>' + esc(c.author) + '</b>' + (c.tag ? '<span class="ui-cm__tag">' + esc(c.tag) + '</span>' : '') +
        '<time>' + esc(c.time || '') + '</time></div><p class="ui-cm__txt">' + esc(c.text) + '</p>' +
        '<div class="ui-cm__act"><button type="button" data-like aria-pressed="' + !!c.liked + '">' + (c.liked ? '♥' : '♡') + ' ' + (Number(c.likes) || 0) + '</button>' +
        '<button type="button" data-reply aria-expanded="false">回复</button></div>' +
        (Array.isArray(c.replies) && c.replies.length ? '<div class="ui-cm__kids">' + c.replies.map((r, i) => one(r, path + '.' + i)).join('') + '</div>' : '') +
        '</div></article>';
    };
    return '<div class="ui-cms">' + list.map((c, i) => one(c, String(i))).join('') + '</div>';
  }
  _get(list, path) {
    const idx = path.split('.').map(Number);
    let node = { replies: list };
    for (const i of idx) node = node.replies[i];
    return node;
  }
  mounted() {
    const self = this;
    this.querySelectorAll('[data-like]').forEach((b) => b.addEventListener('click', () => {
      const path = b.closest('.ui-cm').dataset.path;
      const list = parseArr(self.props.items);
      const c = self._get(list, path);
      c.liked = !c.liked;
      c.likes = (Number(c.likes) || 0) + (c.liked ? 1 : -1);
      self.setAttribute('items', JSON.stringify(list));
      const again = self.querySelector('.ui-cm[data-path="' + path + '"] [data-like]');
      if (again) again.focus();
      emit(self, 'like', { path: path, liked: c.liked });
    }));
    this.querySelectorAll('[data-reply]').forEach((b) => b.addEventListener('click', () => {
      const body = b.closest('.ui-cm__body');
      let box = body.querySelector(':scope > .ui-cm__reply');
      if (box) { box.remove(); b.setAttribute('aria-expanded', 'false'); return; }
      b.setAttribute('aria-expanded', 'true');
      b.parentElement.insertAdjacentHTML('afterend', '<div class="ui-cm__reply"><input aria-label="回复内容" placeholder="写下你的回复…"><button type="button">发送</button></div>');
      box = body.querySelector(':scope > .ui-cm__reply');
      const input = box.querySelector('input');
      input.focus();
      const send = () => {
        const t = input.value.trim();
        if (!t) { input.focus(); return; }
        const path = b.closest('.ui-cm').dataset.path;
        const list = parseArr(self.props.items);
        const c = self._get(list, path);
        (c.replies = c.replies || []).push({ author: '我', time: '刚刚', text: t, likes: 0 });
        self.setAttribute('items', JSON.stringify(list));
        emit(self, 'reply', { path: path, text: t });
      };
      box.querySelector('button').addEventListener('click', send);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) send(); if (e.key === 'Escape') { box.remove(); b.setAttribute('aria-expanded', 'false'); b.focus(); } });
    }));
  }
}
register('ui-comment', UIComment, commentCss);

/* ---------------- Calendar 月历 + 日程 ---------------- */
export const calendarCss = `
ui-calendar{display:block;width:100%;container-type:inline-size}
.ui-cal{display:flex;flex-direction:column;gap:8px}
.ui-cal__hd{display:flex;align-items:center;gap:8px}
.ui-cal__hd b{flex:1;font-size:14px;color:var(--ui-text)}
.ui-cal__hd button{min-width:30px;height:30px;padding:0 8px;cursor:pointer;font:inherit;font-size:13px;color:var(--ui-text);
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm)}
.ui-cal__hd button:hover{border-color:var(--ui-brand);color:var(--ui-brand)}
.ui-cal__grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border:var(--ui-border-w) solid var(--ui-line);
  border-radius:var(--ui-radius);overflow:hidden;gap:1px;background:var(--ui-line)}
.ui-cal__wd{padding:6px 4px;text-align:center;font-size:11px;color:var(--ui-sub);background:var(--ui-panel-2)}
.ui-cal__d{min-height:74px;padding:4px;background:var(--ui-panel);display:flex;flex-direction:column;gap:2px;min-width:0;cursor:pointer;
  border:0;text-align:left;font:inherit;color:var(--ui-text)}
.ui-cal__d:focus-visible{outline:2px solid var(--ui-brand);outline-offset:-2px}
.ui-cal__d[data-out]{background:var(--ui-panel-2);color:var(--ui-sub)}
.ui-cal__d[aria-selected="true"]{box-shadow:inset 0 0 0 2px var(--ui-brand)}
.ui-cal__n{font-size:12px;width:22px;height:22px;display:grid;place-items:center;border-radius:50%;font-variant-numeric:tabular-nums}
.ui-cal__d[data-today] .ui-cal__n{background:var(--ui-brand);color:var(--ui-brand-ink);font-weight:700}
.ui-cal__e{display:block;font-size:10.5px;line-height:1.5;padding:0 5px;border-radius:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-cal__e--success{background:var(--ui-ok-soft);color:var(--ui-ok)}
.ui-cal__e--warn{background:var(--ui-warn-soft);color:var(--ui-warn)}
.ui-cal__e--danger{background:var(--ui-danger-soft);color:var(--ui-danger)}
.ui-cal__more{font-size:10.5px;color:var(--ui-sub);padding-left:4px}
.ui-cal__dots{display:none;gap:2px;justify-content:center}
.ui-cal__dots i{width:5px;height:5px;border-radius:50%;background:var(--ui-brand)}
.ui-cal__list{list-style:none;margin:0;padding:8px 10px;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
  background:var(--ui-panel);font-size:12.5px;color:var(--ui-text);display:flex;flex-direction:column;gap:5px}
.ui-cal__list li{display:flex;gap:8px}
.ui-cal__list li::before{content:"●";color:var(--ui-brand);font-size:9px;line-height:19px}
.ui-cal__list .empty{color:var(--ui-sub)}
.ui-cal__list .empty::before{content:none}
/* 窄容器：日程条换成小圆点，选中日的日程在下方列表展示 */
@container (max-width:460px){
  .ui-cal__d{min-height:44px;align-items:center}
  .ui-cal__e,.ui-cal__more{display:none}
  .ui-cal__dots{display:flex}
}
`;

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

export class UICalendar extends UIElement {
  static props = { month: { default: '' }, events: { default: '[]' }, selected: { default: '' } };
  template(p) {
    const events = parseArr(p.events) || [];
    const now = new Date();
    const m = /^(\d{4})-(\d{1,2})$/.exec(p.month || '');
    const y = m ? Number(m[1]) : now.getFullYear();
    const mo = m ? Number(m[2]) - 1 : now.getMonth();
    const first = new Date(y, mo, 1);
    const start = new Date(y, mo, 1 - ((first.getDay() + 6) % 7));
    const today = ymd(now);
    const sel = p.selected || today;
    const byDay = {};
    events.forEach((e) => { (byDay[e.date] = byDay[e.date] || []).push(e); });
    let cells = '';
    for (let i = 0; i < 42; i++) {
      if (i % 7 === 0) cells += (i ? '</div>' : '') + '<div role="row" style="display:contents">';
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = ymd(d);
      const evs = byDay[key] || [];
      cells += '<button type="button" class="ui-cal__d" role="gridcell" data-date="' + key + '" tabindex="' + (key === sel ? 0 : -1) + '"' +
        (d.getMonth() !== mo ? ' data-out' : '') + (key === today ? ' data-today' : '') + ' aria-selected="' + (key === sel) + '"' +
        ' aria-label="' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日' + (evs.length ? '，' + evs.length + ' 个日程' : '') + '">' +
        '<span class="ui-cal__n">' + d.getDate() + '</span>' +
        evs.slice(0, 2).map((e) => '<span class="ui-cal__e ui-cal__e--' + esc(e.type || 'brand') + '">' + esc(e.title) + '</span>').join('') +
        (evs.length > 2 ? '<span class="ui-cal__more">+' + (evs.length - 2) + '</span>' : '') +
        (evs.length ? '<span class="ui-cal__dots" aria-hidden="true">' + evs.slice(0, 3).map(() => '<i></i>').join('') + '</span>' : '') +
        '</button>';
    }
    cells += '</div>';
    const selEvs = byDay[sel] || [];
    return '<div class="ui-cal"><div class="ui-cal__hd"><b aria-live="polite">' + y + ' 年 ' + (mo + 1) + ' 月</b>' +
      '<button type="button" data-go="-1" aria-label="上个月">‹</button><button type="button" data-go="0">今天</button><button type="button" data-go="1" aria-label="下个月">›</button></div>' +
      '<div class="ui-cal__grid" role="grid" aria-label="' + y + ' 年 ' + (mo + 1) + ' 月">' +
      '<div role="row" style="display:contents">' + ['一', '二', '三', '四', '五', '六', '日'].map((w) => '<span class="ui-cal__wd" role="columnheader">' + w + '</span>').join('') + '</div>' + cells + '</div>' +
      '<ul class="ui-cal__list" aria-label="' + sel + ' 的日程">' + (selEvs.length ? selEvs.map((e) => '<li>' + esc((e.time ? e.time + ' ' : '') + e.title) + '</li>').join('') : '<li class="empty">' + sel + ' 没有日程</li>') + '</ul></div>';
  }
  mounted() {
    const self = this;
    const curMonth = () => { const g = self.querySelector('.ui-cal__grid').getAttribute('aria-label'); const m = /(\d+) 年 (\d+) 月/.exec(g); return [Number(m[1]), Number(m[2]) - 1]; };
    this.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
      const go = Number(b.dataset.go);
      let d;
      if (!go) { d = new Date(); self.setAttribute('selected', ymd(d)); }
      else { const c = curMonth(); d = new Date(c[0], c[1] + go, 1); }
      self.setAttribute('month', d.getFullYear() + '-' + pad(d.getMonth() + 1));
      const again = self.querySelector('[data-go="' + go + '"]'); if (again) again.focus();
    }));
    const pick = (date, focus) => {
      const [y, m] = date.split('-').map(Number);
      self.setAttribute('selected', date);
      self.setAttribute('month', y + '-' + pad(m));
      if (focus) { const c = self.querySelector('[data-date="' + date + '"]'); if (c) c.focus(); }
      emit(self, 'select', { date: date, events: (parseArr(self.props.events) || []).filter((e) => e.date === date) });
    };
    this.querySelectorAll('.ui-cal__d').forEach((c) => {
      c.addEventListener('click', () => pick(c.dataset.date, true));
      c.addEventListener('keydown', (e) => {
        const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (!step) return;
        e.preventDefault();
        const [y, m, d] = c.dataset.date.split('-').map(Number);
        pick(ymd(new Date(y, m - 1, d + step)), true);
      });
    });
  }
}
register('ui-calendar', UICalendar, calendarCss);
