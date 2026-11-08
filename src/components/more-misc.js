/* =========================================================
   第三批：ui-profile / ui-pricing（展示）
          ui-bottom-nav（导航）
          ui-command 命令面板（浮层）
          ui-countdown / ui-banner / ui-status（反馈）
   ========================================================= */
import { UIElement, register } from './base.js';
import { trapTab } from '../lib/focus.js';
import { esc, splitList } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
function parseArr(text) { try { const v = JSON.parse(text || '[]'); return Array.isArray(v) ? v : null; } catch (e) { return null; } }
const jsonErr = (k) => '<div style="font-size:12.5px;color:var(--ui-sub)">' + k + ' 需要是合法 JSON 数组</div>';

/* ---------------- Profile 个人名片 ---------------- */
export const profileCss = `
ui-profile{display:block;width:100%;max-width:340px}
.ui-pf{overflow:hidden;background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);
  border-radius:var(--ui-radius-lg);box-shadow:var(--ui-shadow)}
.ui-pf__cover{height:64px;background:linear-gradient(120deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 35%,var(--ui-accent)) 60%,color-mix(in srgb,var(--ui-ok) 60%,var(--ui-brand)))}
.ui-pf__bd{padding:0 16px 16px;display:flex;flex-direction:column;gap:8px}
.ui-pf__top{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;margin-top:-28px}
.ui-pf__av{width:60px;height:60px;border-radius:50%;display:grid;place-items:center;font-size:22px;font-weight:700;
  color:var(--ui-brand-ink);background:linear-gradient(135deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 45%,var(--ui-accent)));
  border:3px solid var(--ui-panel);box-shadow:var(--ui-shadow-sm);position:relative}
.ui-pf__av[data-on]::after{content:"";position:absolute;right:2px;bottom:2px;width:12px;height:12px;border-radius:50%;
  background:var(--ui-ok);border:2px solid var(--ui-panel)}
.ui-pf__act{display:flex;gap:6px}
.ui-pf__n{font-size:16px;font-weight:700;color:var(--ui-text);display:flex;align-items:center;gap:6px}
.ui-pf__v{display:inline-grid;place-items:center;width:16px;height:16px;border-radius:50%;background:var(--ui-brand);color:var(--ui-brand-ink);font-size:10px}
.ui-pf__r{font-size:12.5px;color:var(--ui-sub);margin-top:-6px}
.ui-pf__bio{margin:0;font-size:12.5px;line-height:1.7;color:var(--ui-sub)}
.ui-pf__st{display:grid;grid-template-columns:repeat(auto-fit,minmax(60px,1fr));border-top:1px dashed var(--ui-line);padding-top:10px;text-align:center}
.ui-pf__st b{display:block;font-size:15px;color:var(--ui-text);font-variant-numeric:tabular-nums}
.ui-pf__st span{font-size:11px;color:var(--ui-sub)}
`;

export class UIProfile extends UIElement {
  static props = { name: { default: '' }, subtitle: { default: '' }, bio: { default: '' }, stats: { default: '' }, verified: { type: 'boolean' }, online: { type: 'boolean' } };
  template(p) {
    const stats = splitList(p.stats).map((s) => { const i = s.indexOf(':'); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]; });
    return '<div class="ui-pf"><div class="ui-pf__cover"></div><div class="ui-pf__bd">' +
      '<div class="ui-pf__top"><span class="ui-pf__av"' + (p.online ? ' data-on title="在线"' : '') + '>' + esc((p.name || '?').slice(0, 1)) + '</span>' +
      '<div class="ui-pf__act"><slot></slot></div></div>' +
      '<div class="ui-pf__n">' + esc(p.name) + (p.verified ? '<span class="ui-pf__v" title="已认证" aria-label="已认证">✓</span>' : '') + '</div>' +
      (p.subtitle ? '<div class="ui-pf__r">' + esc(p.subtitle) + '</div>' : '') +
      (p.bio ? '<p class="ui-pf__bio">' + esc(p.bio) + '</p>' : '') +
      (stats.length ? '<div class="ui-pf__st">' + stats.map((s) => '<div><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>').join('') + '</div>' : '') +
      '</div></div>';
  }
}
register('ui-profile', UIProfile, profileCss);

/* ---------------- Pricing 价格卡 ---------------- */
export const pricingCss = `
ui-pricing{display:block;min-width:0}
.ui-price{position:relative;height:100%;display:flex;flex-direction:column;gap:12px;padding:18px 16px;
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);box-shadow:var(--ui-shadow-sm)}
.ui-price--hot{border-color:var(--ui-brand);box-shadow:0 0 0 1px var(--ui-brand),var(--ui-shadow)}
.ui-price__badge{position:absolute;top:-11px;right:14px;font-size:11px;font-weight:700;padding:3px 10px;
  border-radius:var(--ui-radius-pill);background:var(--ui-brand);color:var(--ui-brand-ink)}
.ui-price__n{font-size:13px;font-weight:600;color:var(--ui-sub);letter-spacing:.04em}
.ui-price__p{display:flex;align-items:baseline;gap:4px;color:var(--ui-text)}
.ui-price__p b{font-size:30px;line-height:1;font-variant-numeric:tabular-nums}
.ui-price__p span{font-size:12px;color:var(--ui-sub)}
.ui-price__d{margin:0;font-size:12px;color:var(--ui-sub);line-height:1.6}
.ui-price ul{list-style:none;margin:0;padding:12px 0 0;border-top:1px dashed var(--ui-line);display:flex;flex-direction:column;gap:7px;flex:1}
.ui-price li{display:flex;gap:8px;font-size:12.5px;color:var(--ui-text);line-height:1.5}
.ui-price li::before{content:"✓";color:var(--ui-ok);font-weight:700}
.ui-price li.no{color:var(--ui-sub);text-decoration:line-through}
.ui-price li.no::before{content:"–";color:var(--ui-sub)}
.ui-price__ft{display:flex}
.ui-price__ft > *{flex:1}
`;

export class UIPricing extends UIElement {
  static props = { name: { default: '' }, price: { default: '' }, period: { default: '/月' }, desc: { default: '' }, features: { default: '' }, badge: { default: '' }, highlight: { type: 'boolean' } };
  template(p) {
    /* 以 ! 开头的特性表示「不包含」 */
    const feats = splitList(p.features);
    return '<div class="ui-price' + (p.highlight ? ' ui-price--hot' : '') + '">' +
      (p.badge ? '<span class="ui-price__badge">' + esc(p.badge) + '</span>' : '') +
      '<div class="ui-price__n">' + esc(p.name) + '</div>' +
      '<div class="ui-price__p"><b>' + esc(p.price) + '</b><span>' + esc(p.period) + '</span></div>' +
      (p.desc ? '<p class="ui-price__d">' + esc(p.desc) + '</p>' : '') +
      '<ul>' + feats.map((f) => f[0] === '!' ? '<li class="no">' + esc(f.slice(1)) + '</li>' : '<li>' + esc(f) + '</li>').join('') + '</ul>' +
      '<div class="ui-price__ft"><slot></slot></div></div>';
  }
}
register('ui-pricing', UIPricing, pricingCss);

/* ---------------- Bottom Nav 底部标签栏 ---------------- */
export const bottomNavCss = `
ui-bottom-nav{display:block;width:100%}
.ui-bn{display:flex;justify-content:space-around;gap:2px;padding:6px 6px calc(6px + env(safe-area-inset-bottom));
  background:var(--ui-panel);border-top:var(--ui-border-w) solid var(--ui-line);box-shadow:0 -4px 16px rgba(0,0,0,.04)}
.ui-bn button{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;
  border:0;background:none;cursor:pointer;font:inherit;font-size:11px;color:var(--ui-sub);border-radius:var(--ui-radius);transition:var(--ui-motion)}
.ui-bn button:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-bn__i{font-size:20px;line-height:1;transition:transform var(--ui-motion)}
.ui-bn button[aria-current="page"]{color:var(--ui-brand);font-weight:600}
.ui-bn button[aria-current="page"] .ui-bn__i{transform:translateY(-2px) scale(1.08)}
.ui-bn button[aria-current="page"]::before{content:"";position:absolute;top:-6px;left:50%;width:22px;height:3px;margin-left:-11px;border-radius:0 0 3px 3px;background:var(--ui-brand)}
.ui-bn__b{position:absolute;top:2px;left:calc(50% + 6px);min-width:16px;height:16px;padding:0 4px;border-radius:99px;
  font-size:10px;line-height:16px;font-weight:700;background:var(--ui-danger);color:var(--ui-on-color);border:2px solid var(--ui-panel);box-sizing:content-box}
`;

export class UIBottomNav extends UIElement {
  static props = { items: { default: '[]' }, active: { default: '0' }, label: { default: '底部导航' } };
  template(p) {
    const list = parseArr(p.items);
    if (!list) return jsonErr('items');
    return '<nav class="ui-bn" aria-label="' + esc(p.label) + '">' + list.map((it, i) =>
      '<button type="button" data-i="' + i + '"' + (String(i) === p.active ? ' aria-current="page"' : '') + '>' +
      '<span class="ui-bn__i" aria-hidden="true">' + esc(it.icon || '•') + '</span>' + esc(it.label) +
      (it.badge ? '<span class="ui-bn__b" aria-label="' + esc(it.badge) + ' 条未读">' + esc(it.badge) + '</span>' : '') + '</button>'
    ).join('') + '</nav>';
  }
  mounted() {
    const self = this;
    this.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      self.setAttribute('active', b.dataset.i);
      const again = self.querySelector('[data-i="' + b.dataset.i + '"]');
      if (again) again.focus();
      emit(self, 'change', { index: Number(b.dataset.i) });
    }));
  }
}
register('ui-bottom-nav', UIBottomNav, bottomNavCss);

/* ---------------- Command 命令面板（⌘K） ---------------- */
export const commandCss = `
ui-command{display:inline-block}
.ui-cmd-trigger{display:inline-flex;align-items:center;gap:10px;min-width:220px;max-width:100%;height:var(--ui-ctl-h);padding:0 8px 0 12px;
  cursor:pointer;font:inherit;font-size:13px;color:var(--ui-sub);background:var(--ui-panel-2);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);transition:var(--ui-motion)}
.ui-cmd-trigger:hover{border-color:var(--ui-brand);color:var(--ui-text)}
.ui-cmd-trigger:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-cmd-trigger span{flex:1;text-align:left}
.ui-cmd-trigger kbd,.ui-cmd kbd{font-family:var(--ui-mono);font-size:11px;padding:1px 6px;color:var(--ui-sub);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);background:var(--ui-panel)}
.ui-cmd-mask{position:fixed;inset:0;z-index:360;display:flex;justify-content:center;align-items:flex-start;padding:12vh 16px 16px;
  background:rgba(0,0,0,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:ui-fade-in .15s ease}
.ui-cmd-mask[hidden]{display:none}
.ui-cmd{width:min(560px,100%);max-height:min(70vh,520px);display:flex;flex-direction:column;overflow:hidden;
  background:var(--ui-panel);color:var(--ui-text);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);
  box-shadow:0 24px 60px rgba(0,0,0,.28);animation:ui-pop-in .18s ease;font-family:var(--ui-font)}
.ui-cmd__in{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:var(--ui-border-w) solid var(--ui-line)}
.ui-cmd__in span{color:var(--ui-sub);font-size:16px}
.ui-cmd__in input{flex:1;min-width:0;border:0;outline:none;background:none;font:inherit;font-size:15px;color:var(--ui-text)}
.ui-cmd__list{list-style:none;margin:0;padding:6px;overflow:auto}
.ui-cmd__g{padding:8px 10px 4px;font-size:11px;letter-spacing:.06em;color:var(--ui-sub)}
.ui-cmd__it{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:var(--ui-radius-sm);cursor:pointer;font-size:13.5px}
.ui-cmd__it[aria-selected="true"]{background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-cmd__it i{width:20px;text-align:center;font-style:normal}
.ui-cmd__it span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ui-cmd__it mark{background:var(--ui-brand-soft);color:var(--ui-text);font-weight:var(--ui-font-weight-700)}
.ui-cmd__empty{padding:28px 10px;text-align:center;font-size:13px;color:var(--ui-sub)}
.ui-cmd__ft{display:flex;gap:14px;padding:8px 14px;border-top:var(--ui-border-w) solid var(--ui-line);font-size:11px;color:var(--ui-sub);background:var(--ui-panel-2)}
@media (max-width:520px){.ui-cmd-mask{padding:10px;align-items:stretch}.ui-cmd{max-height:none}.ui-cmd__ft{display:none}}
@keyframes ui-fade-in{from{opacity:0}to{opacity:1}}
@keyframes ui-pop-in{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
`;

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
let commandSequence = 0;

export class UICommand extends UIElement {
  static props = { items: { default: '[]' }, placeholder: { default: '输入命令或搜索…' }, hotkey: { default: 'k' } };
  template(p) {
    return '<button type="button" class="ui-cmd-trigger" aria-haspopup="dialog"><span>⌕ ' + esc(p.placeholder) + '</span>' +
      (p.hotkey ? '<kbd>' + (isMac ? '⌘' : 'Ctrl') + ' ' + esc(p.hotkey.toUpperCase()) + '</kbd>' : '') + '</button>';
  }
  _list() { return parseArr(this.props.items) || []; }
  mounted() {
    const self = this;
    this.querySelector('.ui-cmd-trigger').addEventListener('click', () => self.show());
    if (this._hot) document.removeEventListener('keydown', this._hot);
    this._hot = (e) => {
      if (!self.props.hotkey || !self.isConnected) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === self.props.hotkey.toLowerCase()) {
        e.preventDefault();
        if (self._mask && !self._mask.hidden) self.close(); else self.show();
      }
    };
    document.addEventListener('keydown', this._hot);
  }
  show() {
    if (!this._mask) {
      this._listId = 'ui-cmd-list-' + (++commandSequence);
      const m = this._mask = document.createElement('div');
      m.className = 'ui-cmd-mask ui-mo';
      m.hidden = true;
      m.innerHTML = '<div class="ui-cmd" role="dialog" aria-modal="true" aria-label="命令面板">' +
        '<div class="ui-cmd__in"><span aria-hidden="true">⌕</span><input role="combobox" aria-expanded="true" aria-controls="' + this._listId + '" aria-autocomplete="list"><kbd>Esc</kbd></div>' +
        '<ul class="ui-cmd__list" id="' + this._listId + '" role="listbox"></ul>' +
        '<div class="ui-cmd__ft"><span>↑↓ 选择</span><span>↵ 执行</span><span>Esc 关闭</span></div></div>';
      document.body.appendChild(m);
      const input = m.querySelector('input');
      m.addEventListener('mousedown', (e) => { if (e.target === m) this.close(); });
      input.addEventListener('input', () => { this._cur = 0; this._draw(); });
      input.addEventListener('keydown', (e) => {
        const n = this._hits.length;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (n) { this._cur = (this._cur + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; this._mark(); }
        } else if (e.key === 'Enter') { e.preventDefault(); this._run(this._cur); }
        else if (e.key === 'Escape') { e.preventDefault(); this.close(); }
      });
      m.querySelector('.ui-cmd__list').addEventListener('click', (e) => {
        const li = e.target.closest('[data-i]'); if (li) this._run(Number(li.dataset.i));
      });
      m.querySelector('.ui-cmd__list').addEventListener('mousemove', (e) => {
        const li = e.target.closest('[data-i]'); if (li && Number(li.dataset.i) !== this._cur) { this._cur = Number(li.dataset.i); this._mark(); }
      });
    }
    if (!this._mask.hidden) return;
    /* 继承当前页面（或最近祖先）的风格与明暗 */
    const scope = this.closest('[data-style]');
    const tscope = this.closest('[data-theme]');
    this._mask.setAttribute('data-style', scope ? scope.getAttribute('data-style') : '');
    this._mask.setAttribute('data-theme', tscope ? tscope.getAttribute('data-theme') : 'light');
    this._ret = document.activeElement;
    this._mask.hidden = false;
    const input = this._mask.querySelector('input');
    input.placeholder = this.props.placeholder;
    input.value = '';
    this._cur = 0;
    this._draw();
    this._untrap = trapTab(this._mask);
    document.documentElement.style.overflow = 'hidden';
    input.focus();
  }
  close() {
    if (!this._mask || this._mask.hidden) return;
    this._mask.hidden = true;
    if (this._untrap) this._untrap();
    document.documentElement.style.overflow = '';
    if (this._ret && this._ret.focus) this._ret.focus();
  }
  _draw() {
    const q = this._mask.querySelector('input').value.trim().toLowerCase();
    const labelHtml = (value) => {
      const text = String(value == null ? '' : value);
      const index = q ? text.toLowerCase().indexOf(q) : -1;
      if (index < 0) return esc(text);
      // 小写转换可能展开字符；先把匹配区间映回原文，再分别转义。
      let start = 0, end = 0, offset = 0;
      for (const char of text) {
        const next = offset + char.toLowerCase().length;
        if (next <= index) start += char.length;
        end += char.length;
        if (next >= index + q.length) break;
        offset = next;
      }
      return esc(text.slice(0, start)) + '<mark>' + esc(text.slice(start, end)) + '</mark>' + esc(text.slice(end));
    };
    const all = this._list();
    this._hits = all.filter((it) => !q || (String(it.label) + ' ' + (it.group || '') + ' ' + (it.keywords || '')).toLowerCase().indexOf(q) > -1);
    const ul = this._mask.querySelector('.ui-cmd__list');
    if (!this._hits.length) {
      this._mask.querySelector('input').removeAttribute('aria-activedescendant');
      ul.innerHTML = '<li class="ui-cmd__empty" role="option" aria-disabled="true"><span role="status">没有找到「' + esc(q) + '」相关的命令</span></li>';
      return;
    }
    let g = null;
    ul.innerHTML = this._hits.map((it, i) => {
      const head = it.group && it.group !== g ? '<li class="ui-cmd__g" role="presentation">' + esc(it.group) + '</li>' : '';
      g = it.group;
      return head + '<li class="ui-cmd__it" role="option" id="' + this._listId + '-o' + i + '" data-i="' + i + '" aria-selected="false"><i aria-hidden="true">' + esc(it.icon || '›') + '</i><span>' + labelHtml(it.label) + '</span>' +
        (it.kbd ? '<kbd>' + esc(it.kbd) + '</kbd>' : '') + '</li>';
    }).join('');
    this._mark();
  }
  _mark() {
    const input = this._mask.querySelector('input');
    this._mask.querySelectorAll('.ui-cmd__it').forEach((li) => {
      const on = Number(li.dataset.i) === this._cur;
      li.setAttribute('aria-selected', String(on));
      if (on) li.scrollIntoView({ block: 'nearest' });
    });
    input.setAttribute('aria-activedescendant', this._listId + '-o' + this._cur);
  }
  _run(i) {
    const it = this._hits && this._hits[i];
    if (!it) return;
    this.close();
    emit(this, 'select', { label: it.label, value: it.value == null ? it.label : it.value, item: it });
  }
  disconnectedCallback() {
    if (this._hot) document.removeEventListener('keydown', this._hot);
    this.close();
    if (this._mask) { this._mask.remove(); this._mask = null; }
  }
}
register('ui-command', UICommand, commandCss);

/* ---------------- Countdown 倒计时 ---------------- */
export const countdownCss = `
.ui-cd{display:inline-flex;align-items:flex-start;gap:6px;font-variant-numeric:tabular-nums}
.ui-cd__u{display:flex;flex-direction:column;align-items:center;gap:4px}
.ui-cd__u b{min-width:44px;padding:8px 6px;text-align:center;font-size:22px;line-height:1;color:var(--ui-text);
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);box-shadow:var(--ui-shadow-sm)}
.ui-cd__u span{font-size:10.5px;color:var(--ui-sub)}
.ui-cd__s{font-size:20px;line-height:38px;color:var(--ui-sub);font-weight:700}
.ui-cd--sm .ui-cd__u b{min-width:30px;padding:4px;font-size:14px}
.ui-cd--sm .ui-cd__s{font-size:14px;line-height:24px}
.ui-cd--sm .ui-cd__u span{display:none}
.ui-cd--end .ui-cd__u b{color:var(--ui-sub)}
`;

export class UICountdown extends UIElement {
  static props = { seconds: { default: '' }, to: { default: '' }, size: { default: 'md' }, days: { type: 'boolean' } };
  _target() {
    if (this.props.to) { const t = Date.parse(this.props.to); if (!isNaN(t)) return t; }
    if (!this._start || this._startFor !== this.props.seconds) { this._start = Date.now(); this._startFor = this.props.seconds; }
    return this._start + (Number(this.props.seconds) || 0) * 1000;
  }
  template(p) {
    const left = Math.max(0, Math.round((this._target() - Date.now()) / 1000));
    const d = Math.floor(left / 86400), h = Math.floor(left % 86400 / 3600), m = Math.floor(left % 3600 / 60), s = left % 60;
    const pad = (n) => String(n).padStart(2, '0');
    const u = (v, t) => '<span class="ui-cd__u"><b>' + pad(v) + '</b><span>' + t + '</span></span>';
    const sep = '<span class="ui-cd__s" aria-hidden="true">:</span>';
    const parts = (p.days || d > 0 ? [u(d, '天')] : []).concat([u(h, '时'), u(m, '分'), u(s, '秒')]);
    return '<span class="ui-cd ui-cd--' + esc(p.size) + (left ? '' : ' ui-cd--end') + '" role="timer" aria-label="剩余 ' + (d ? d + ' 天 ' : '') + h + ' 小时 ' + m + ' 分 ' + s + ' 秒">' + parts.join(sep) + '</span>';
  }
  mounted() {
    clearInterval(this._timer);
    const self = this;
    this._timer = setInterval(() => {
      if (!self.isConnected) { clearInterval(self._timer); return; }
      self._render();
      if (self._target() <= Date.now()) { clearInterval(self._timer); emit(self, 'end', {}); }
    }, 1000);
  }
  disconnectedCallback() { clearInterval(this._timer); }
}
register('ui-countdown', UICountdown, countdownCss);

/* ---------------- Banner 公告横幅 ---------------- */
export const bannerCss = `
ui-banner{display:block;width:100%}
.ui-banner{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px 10px 14px;font-size:13px;
  color:var(--ui-brand-ink);background:var(--ui-brand);border-radius:var(--ui-radius);transition:opacity .2s,transform .2s}
.ui-banner--gradient{color:var(--ui-brand-ink);background:linear-gradient(100deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 55%,var(--ui-accent)))}
.ui-banner--soft{color:var(--ui-text);background:var(--ui-brand-soft);border:var(--ui-border-w) solid color-mix(in srgb,var(--ui-brand) 30%,transparent)}
.ui-banner--warn{color:var(--ui-text);background:var(--ui-warn-soft);border:var(--ui-border-w) solid color-mix(in srgb,var(--ui-warn) 40%,transparent)}
.ui-banner__i{font-size:15px}
.ui-banner__t{flex:1;min-width:160px;line-height:1.5}
.ui-banner__a{font:inherit;font-size:12.5px;font-weight:600;padding:5px 12px;border-radius:var(--ui-radius-pill);cursor:pointer;
  border:1px solid currentColor;background:transparent;color:inherit;white-space:nowrap}
.ui-banner__a:hover{background:rgba(255,255,255,.18)}
.ui-banner__x{width:26px;height:26px;border:0;border-radius:50%;background:none;color:inherit;cursor:pointer;font-size:16px;opacity:.75}
.ui-banner__x:hover{opacity:1;background:rgba(255,255,255,.18)}
.ui-banner--out{opacity:0;transform:translateY(-6px)}
`;

export class UIBanner extends UIElement {
  static props = { variant: { default: 'brand' }, icon: { default: '📣' }, action: { default: '' }, closable: { type: 'boolean' } };
  template(p) {
    return '<div class="ui-banner ui-banner--' + esc(p.variant) + '">' +
      (p.icon ? '<span class="ui-banner__i" aria-hidden="true">' + esc(p.icon) + '</span>' : '') +
      '<span class="ui-banner__t"><slot></slot></span>' +
      (p.action ? '<button type="button" class="ui-banner__a">' + esc(p.action) + '</button>' : '') +
      (p.closable ? '<button type="button" class="ui-banner__x" aria-label="关闭公告">×</button>' : '') + '</div>';
  }
  mounted() {
    const self = this;
    const a = this.querySelector('.ui-banner__a');
    if (a) a.addEventListener('click', () => emit(self, 'action', {}));
    const x = this.querySelector('.ui-banner__x');
    if (x) x.addEventListener('click', () => {
      self.querySelector('.ui-banner').classList.add('ui-banner--out');
      emit(self, 'close', {});
      setTimeout(() => self.remove(), 200);
    });
  }
}
register('ui-banner', UIBanner, bannerCss);

/* ---------------- Status 状态指示 ---------------- */
export const statusCss = `
.ui-status{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;color:var(--ui-text)}
.ui-status__d{position:relative;width:8px;height:8px;border-radius:50%;background:var(--c)}
.ui-status--pulse .ui-status__d::after{content:"";position:absolute;inset:0;border-radius:50%;background:var(--c);animation:ui-pulse 1.6s ease-out infinite}
@keyframes ui-pulse{from{transform:scale(1);opacity:.7}to{transform:scale(2.8);opacity:0}}
@media (prefers-reduced-motion:reduce){.ui-status--pulse .ui-status__d::after{animation:none}}
.ui-status--online{--c:var(--ui-ok)}
.ui-status--busy{--c:var(--ui-danger)}
.ui-status--away{--c:var(--ui-warn)}
.ui-status--offline{--c:var(--ui-sub);color:var(--ui-sub)}
.ui-status--running{--c:var(--ui-brand)}
`;

const STATUS_TEXT = { online: '在线', busy: '忙碌', away: '离开', offline: '离线', running: '运行中' };

export class UIStatus extends UIElement {
  static props = { status: { default: 'online' }, pulse: { type: 'boolean' } };
  template(p) {
    const has = this._lastTpl === undefined ? this.textContent.trim() !== '' : this._has;
    this._has = has;
    return '<span class="ui-status ui-status--' + esc(p.status) + (p.pulse ? ' ui-status--pulse' : '') + '" role="status">' +
      '<span class="ui-status__d" aria-hidden="true"></span>' + (has ? '<slot></slot>' : esc(STATUS_TEXT[p.status] || p.status)) + '</span>';
  }
}
register('ui-status', UIStatus, statusCss);
