/* =========================================================
   导航 / 反馈扩展：ui-navbar（容器自适应）/ ui-menu
                  ui-ring / ui-result
   ========================================================= */
import { UIElement, register } from './base.js';
import { esc, splitList } from './more-form.js';

const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
function parseArr(text) {
  try { const v = JSON.parse(text || '[]'); return Array.isArray(v) ? v : null; } catch (e) { return null; }
}

/* ---------------- Navbar 顶部导航（按容器宽度折叠） ---------------- */
export const navbarCss = `
ui-navbar{display:block;width:100%;container-type:inline-size;container-name:ui-navbar}
.ui-nb{
  display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;padding:8px 12px;
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);
  box-shadow:var(--ui-shadow-sm);
}
.ui-nb__brand{display:flex;align-items:center;gap:8px;font-weight:700;font-size:14px;color:var(--ui-text);white-space:nowrap}
.ui-nb__brand i{width:22px;height:22px;border-radius:var(--ui-radius-sm);background:var(--ui-brand);display:inline-block}
.ui-nb__links{display:flex;gap:2px;flex:1;min-width:0}
.ui-nb__links a{
  padding:7px 11px;border-radius:var(--ui-radius-sm);font-size:13px;color:var(--ui-sub);
  text-decoration:none;white-space:nowrap;transition:var(--ui-motion);
}
.ui-nb__links a:hover{color:var(--ui-text);background:var(--ui-panel-2)}
.ui-nb__links a[aria-current="page"]{color:var(--ui-brand);background:var(--ui-brand-soft);font-weight:600}
.ui-nb__links a:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-nb__act{display:flex;align-items:center;gap:8px;margin-left:auto}
.ui-nb__burger{
  display:none;width:34px;height:34px;place-items:center;cursor:pointer;
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);
  background:var(--ui-panel-2);color:var(--ui-text);font:inherit;font-size:16px;line-height:1;
}
@container ui-navbar (max-width:520px){
  .ui-nb__burger{display:grid}
  .ui-nb__links{order:10;flex:1 0 100%;flex-direction:column;gap:2px;padding-top:6px;
    border-top:1px dashed var(--ui-line);display:none}
  .ui-nb--open .ui-nb__links{display:flex}
  .ui-nb__act{margin-left:auto}
}
`;

export class UINavbar extends UIElement {
  static props = { brand: { default: '' }, items: { default: '' }, active: { default: '0' } };
  template(p) {
    const list = splitList(p.items);
    const open = this._open ? ' ui-nb--open' : '';
    return '<nav class="ui-nb' + open + '" aria-label="' + esc(p.brand ? p.brand + ' 导航' : '主导航') + '">' +
      '<span class="ui-nb__brand"><i aria-hidden="true"></i>' + esc(p.brand) + '</span>' +
      '<div class="ui-nb__links">' + list.map((t, i) =>
        '<a href="javascript:void 0" data-i="' + i + '"' + (String(i) === p.active ? ' aria-current="page"' : '') + '>' + esc(t) + '</a>'
      ).join('') + '</div>' +
      '<div class="ui-nb__act"><slot></slot><button type="button" class="ui-nb__burger" aria-label="菜单" aria-expanded="' + !!this._open + '">' + (this._open ? '✕' : '☰') + '</button></div>' +
      '</nav>';
  }
  mounted() {
    const self = this;
    this.querySelector('.ui-nb__burger').addEventListener('click', () => {
      self._open = !self._open;
      self._render();
      self.querySelector('.ui-nb__burger').focus();
    });
    this.querySelectorAll('.ui-nb__links a').forEach((a) => a.addEventListener('click', () => {
      self._open = false;
      self.setAttribute('active', a.dataset.i);
      emit(self, 'change', { index: Number(a.dataset.i), label: a.textContent });
    }));
  }
}
register('ui-navbar', UINavbar, navbarCss);

/* ---------------- Menu 侧边菜单 ---------------- */
export const menuCss = `
ui-menu{display:block;width:100%;max-width:260px}
.ui-menu{list-style:none;margin:0;padding:6px;display:flex;flex-direction:column;gap:2px;
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg)}
.ui-menu ul{list-style:none;margin:2px 0 0;padding:0 0 0 22px;display:flex;flex-direction:column;gap:2px}
.ui-menu ul[hidden]{display:none}
.ui-menu button{
  width:100%;display:flex;align-items:center;gap:9px;padding:8px 10px;cursor:pointer;
  font:inherit;font-size:13px;text-align:left;color:var(--ui-sub);
  background:none;border:0;border-radius:var(--ui-radius-sm);transition:var(--ui-motion);
}
.ui-menu button:hover{background:var(--ui-panel-2);color:var(--ui-text)}
.ui-menu button:focus-visible{outline:none;box-shadow:var(--ui-ring)}
.ui-menu button[aria-current="page"]{background:var(--ui-brand-soft);color:var(--ui-brand);font-weight:600}
.ui-menu__ico{width:18px;text-align:center;flex:0 0 auto}
.ui-menu__l{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ui-menu__b{font-size:10.5px;font-weight:700;padding:1px 6px;border-radius:99px;background:var(--ui-danger-soft);color:var(--ui-danger)}
.ui-menu__car{font-size:10px;transition:transform var(--ui-motion)}
.ui-menu button[aria-expanded="true"] .ui-menu__car{transform:rotate(90deg)}
.ui-menu__grp{padding:10px 10px 4px;font-size:11px;letter-spacing:.06em;color:var(--ui-sub)}
`;

export class UIMenu extends UIElement {
  static props = { items: { default: '[]' }, active: { default: '' }, open: { default: '' } };
  template(p) {
    const list = parseArr(p.items);
    if (!list) return '<div style="font-size:12.5px;color:var(--ui-sub)">items 需要是合法 JSON 数组</div>';
    const opened = splitList(p.open);
    const btn = (it, key) => {
      const kids = Array.isArray(it.children) && it.children.length;
      const isOpen = kids && opened.indexOf(key) > -1;
      return '<li><button type="button" data-k="' + esc(key) + '"' +
        (kids ? ' aria-expanded="' + !!isOpen + '"' : (p.active === key ? ' aria-current="page"' : '')) + '>' +
        '<span class="ui-menu__ico" aria-hidden="true">' + esc(it.icon || '') + '</span>' +
        '<span class="ui-menu__l">' + esc(it.label) + '</span>' +
        (it.badge ? '<span class="ui-menu__b">' + esc(it.badge) + '</span>' : '') +
        (kids ? '<span class="ui-menu__car" aria-hidden="true">▶</span>' : '') + '</button>' +
        (kids ? '<ul' + (isOpen ? '' : ' hidden') + '>' + it.children.map((c, j) => btn(c, key + '-' + j)).join('') + '</ul>' : '') +
        '</li>';
    };
    return '<ul class="ui-menu" role="list">' + list.map((it, i) =>
      it.group ? '<li class="ui-menu__grp">' + esc(it.group) + '</li>' : btn(it, String(i))
    ).join('') + '</ul>';
  }
  mounted() {
    const self = this;
    this.querySelectorAll('button[data-k]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.k;
      if (b.hasAttribute('aria-expanded')) {
        let o = splitList(self.props.open);
        o = o.indexOf(k) > -1 ? o.filter((x) => x !== k) : o.concat(k);
        self.setAttribute('open', o.join(','));
      } else {
        self.setAttribute('active', k);
        emit(self, 'select', { key: k, label: b.textContent.trim() });
      }
      const again = self.querySelector('[data-k="' + k + '"]');
      if (again) again.focus();
    }));
  }
}
register('ui-menu', UIMenu, menuCss);

/* ---------------- Ring 环形进度 ---------------- */
export const ringCss = `
.ui-ring{position:relative;display:inline-grid;place-items:center;flex:0 0 auto}
.ui-ring svg{transform:rotate(-90deg);display:block}
.ui-ring circle{fill:none;stroke-linecap:round;transition:stroke-dashoffset .6s ease}
.ui-ring__bg{stroke:var(--ui-panel-2)}
.ui-ring__fg{stroke:var(--ui-brand)}
.ui-ring--success .ui-ring__fg{stroke:var(--ui-ok)}
.ui-ring--warn .ui-ring__fg{stroke:var(--ui-warn)}
.ui-ring--danger .ui-ring__fg{stroke:var(--ui-danger)}
.ui-ring__v{position:absolute;display:flex;flex-direction:column;align-items:center;line-height:1.15}
.ui-ring__v b{font-size:calc(var(--sz) * .22);color:var(--ui-text);font-variant-numeric:tabular-nums}
.ui-ring__v small{font-size:11px;color:var(--ui-sub)}
`;

export class UIRing extends UIElement {
  static props = { value: { default: '0' }, size: { default: '84' }, variant: { default: 'brand' }, label: { default: '' } };
  template(p) {
    const v = Math.min(100, Math.max(0, Number(p.value) || 0));
    const sz = Math.max(40, Number(p.size) || 84);
    const sw = Math.max(4, Math.round(sz / 11));
    const r = (sz - sw) / 2;
    const c = 2 * Math.PI * r;
    return '<div class="ui-ring ui-ring--' + esc(p.variant) + '" style="--sz:' + sz + 'px" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '"' + ' aria-label="' + esc(p.label || '进度') + '"' + '>' +
      '<svg width="' + sz + '" height="' + sz + '" aria-hidden="true">' +
      '<circle class="ui-ring__bg" cx="' + sz / 2 + '" cy="' + sz / 2 + '" r="' + r + '" stroke-width="' + sw + '"></circle>' +
      '<circle class="ui-ring__fg" cx="' + sz / 2 + '" cy="' + sz / 2 + '" r="' + r + '" stroke-width="' + sw + '" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - v / 100)).toFixed(2) + '"></circle>' +
      '</svg><span class="ui-ring__v"><b>' + v + '%</b>' + (p.label ? '<small>' + esc(p.label) + '</small>' : '') + '</span></div>';
  }
}
register('ui-ring', UIRing, ringCss);

/* ---------------- Result 结果页 ---------------- */
export const resultCss = `
ui-result{display:block;width:100%}
.ui-result{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:18px 12px}
.ui-result__ico{width:52px;height:52px;display:grid;place-items:center;border-radius:50%;font-size:24px;font-weight:700;
  background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-result--success .ui-result__ico{background:var(--ui-ok-soft);color:var(--ui-ok)}
.ui-result--warn .ui-result__ico{background:var(--ui-warn-soft);color:var(--ui-warn)}
.ui-result--danger .ui-result__ico{background:var(--ui-danger-soft);color:var(--ui-danger)}
.ui-result__t{margin:4px 0 0;font-size:16px;font-weight:600;color:var(--ui-text)}
.ui-result__d{margin:0;font-size:12.5px;color:var(--ui-sub);max-width:34ch;line-height:1.7}
.ui-result__act{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:6px}
`;

const RESULT_ICO = { success: '✓', warn: '!', danger: '✕', info: 'i' };

export class UIResult extends UIElement {
  static props = { variant: { default: 'success' }, title: { default: '' }, desc: { default: '' } };
  template(p) {
    return '<div class="ui-result ui-result--' + esc(p.variant) + '" role="status">' +
      '<span class="ui-result__ico" aria-hidden="true">' + (RESULT_ICO[p.variant] || 'i') + '</span>' +
      '<h3 class="ui-result__t">' + esc(p.title) + '</h3>' +
      (p.desc ? '<p class="ui-result__d">' + esc(p.desc) + '</p>' : '') +
      '<div class="ui-result__act"><slot></slot></div></div>';
  }
}
register('ui-result', UIResult, resultCss);
