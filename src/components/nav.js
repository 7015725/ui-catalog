/* =========================================================
   导航类组件：ui-tabs / ui-breadcrumb / ui-steps / ui-pagination
   ========================================================= */
import { UIElement, register } from './base.js';

/* ---------------- Tabs ---------------- */
export const tabsCss = `
ui-tabs{display:block;width:100%;min-width:0}
.ui-tabs{display:flex;gap:2px;width:100%;
  border-bottom:var(--ui-border-w) solid var(--ui-line);
  overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.ui-tabs::-webkit-scrollbar{display:none}
.ui-tabs button{
  font:inherit;font-size:13px;padding:9px 13px;
  border:0;background:none;color:var(--ui-sub);cursor:pointer;
  border-bottom:2px solid transparent;
  margin-bottom:calc(var(--ui-border-w) * -1);
  transition:var(--ui-motion);white-space:nowrap;
}
.ui-tabs button:hover{color:var(--ui-text)}
.ui-tabs button.on{color:var(--ui-brand);border-bottom-color:var(--ui-brand);font-weight:600}
.ui-tabs button:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--ui-brand)}
`;

export class UITabs extends UIElement {
  static props = {
    items: { default: '' },
    active: { default: '0' }
  };
  template(p) {
    return '<div class="ui-tabs" role="tablist">' + p.items.split(',').filter(Boolean).map(function (raw, i) {
      const t = raw.trim();
      const on = String(i) === p.active;
      return '<button type="button" role="tab" data-i="' + i + '"' +
        ' aria-selected="' + (on ? 'true' : 'false') + '"' +
        ' tabindex="' + (on ? '0' : '-1') + '"' +
        (on ? ' class="on"' : '') + '>' + t + '</button>';
    }).join('') + '</div>';
  }
  mounted(p) {
    const self = this;
    const activate = function (b, moveFocus) {
      const index = b.dataset.i;
      self.setAttribute('active', index);
      /* 重渲染后节点已替换，重新取一次再聚焦 */
      const again = self.querySelector('[role="tab"][data-i="' + index + '"]');
      if (moveFocus && again) again.focus();
      self.dispatchEvent(new CustomEvent('change', {
        detail: { index: Number(index), label: b.textContent.trim() },
        bubbles: true
      }));
    };

    this.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { activate(b, false); });
    });

    const list = this.querySelector('[role="tablist"]');
    if (!list) return;
    list.addEventListener('keydown', function (e) {
      const tabs = Array.prototype.slice.call(self.querySelectorAll('[role="tab"]'));
      const cur = tabs.indexOf(document.activeElement);
      let next = -1;
      if (e.key === 'ArrowRight') next = (cur + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (cur - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else if (e.key === 'Enter' || e.key === ' ') {
        if (cur > -1) { e.preventDefault(); activate(tabs[cur], false); }
        return;
      }
      if (next > -1) { e.preventDefault(); activate(tabs[next], true); }
    });
  }
}
register('ui-tabs', UITabs, tabsCss);

/* ---------------- Breadcrumb ---------------- */
export const breadCss = `
.ui-bread{display:flex;align-items:center;flex-wrap:wrap;gap:6px;
  font-size:13px;color:var(--ui-sub)}
.ui-bread a{color:var(--ui-sub);text-decoration:none;transition:var(--ui-motion)}
.ui-bread a:hover{color:var(--ui-brand)}
.ui-bread .sep{opacity:.45;user-select:none}
.ui-bread .cur{color:var(--ui-text);font-weight:500}
`;

export class UIBreadcrumb extends UIElement {
  static props = {
    items: { default: '' }
  };
  template(p) {
    const list = p.items.split(',').filter(Boolean).map(function (o) { return o.trim(); });
    return '<div class="ui-bread">' + list.map(function (t, i) {
      const isLast = i === list.length - 1;
      const node = isLast
        ? '<span class="cur">' + t + '</span>'
        : '<a href="javascript:void 0">' + t + '</a>';
      return (i ? '<span class="sep">/</span>' : '') + node;
    }).join('') + '</div>';
  }
}
register('ui-breadcrumb', UIBreadcrumb, breadCss);

/* ---------------- Steps ---------------- */
export const stepsCss = `
.ui-steps{display:flex;align-items:center;gap:6px;width:100%;
  font-size:12px;color:var(--ui-sub)}
.ui-steps__item{display:flex;align-items:center;gap:6px;white-space:nowrap}
.ui-steps__item i{
  width:20px;height:20px;flex:0 0 auto;display:grid;place-items:center;
  font-style:normal;font-size:11px;border-radius:50%;
  background:var(--ui-panel-2);color:var(--ui-sub);
  border:var(--ui-border-w) solid var(--ui-line);
  transition:var(--ui-motion);
}
.ui-steps__item--on{color:var(--ui-text)}
.ui-steps__item--on i{background:var(--ui-brand);border-color:var(--ui-brand);color:var(--ui-brand-ink);font-weight:600}
.ui-steps__line{flex:1;height:2px;min-width:10px;background:var(--ui-line);border-radius:2px}
.ui-steps__line--on{background:var(--ui-brand)}
/* 容器变窄时自动改为纵向 */
ui-steps{display:block;width:100%;container-type:inline-size}
@container (max-width:340px){
  .ui-steps{flex-direction:column;align-items:flex-start;gap:4px}
  .ui-steps__line{flex:0 0 auto;width:2px;height:12px;min-width:0;margin-left:9px}
}
`;

export class UISteps extends UIElement {
  static props = {
    items: { default: '' },
    current: { default: '0' }
  };
  template(p) {
    const list = p.items.split(',').filter(Boolean).map(function (o) { return o.trim(); });
    const cur = Number(p.current) || 0;
    return '<div class="ui-steps">' + list.map(function (t, i) {
      const on = i <= cur ? ' ui-steps__item--on' : '';
      const line = i < list.length - 1
        ? '<span class="ui-steps__line' + (i < cur ? ' ui-steps__line--on' : '') + '"></span>'
        : '';
      return '<span class="ui-steps__item' + on + '"><i>' + (i + 1) + '</i>' + t + '</span>' + line;
    }).join('') + '</div>';
  }
}
register('ui-steps', UISteps, stepsCss);

/* ---------------- Pagination ---------------- */
export const pagerCss = `
.ui-pager{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.ui-pager button{
  min-width:32px;height:32px;padding:0 8px;
  font:inherit;font-size:13px;line-height:1;cursor:pointer;
  color:var(--ui-text);background:var(--ui-panel);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);
  transition:var(--ui-motion);
}
.ui-pager button:hover:not(:disabled){border-color:var(--ui-brand);color:var(--ui-brand)}
.ui-pager button.on{background:var(--ui-brand);border-color:var(--ui-brand);color:var(--ui-brand-ink);font-weight:600}
.ui-pager button:disabled{opacity:.4;cursor:not-allowed}
.ui-pager .gap{color:var(--ui-sub);padding:0 2px;user-select:none}
`;

export class UIPagination extends UIElement {
  static props = {
    total: { default: '5' },
    page: { default: '1' }
  };
  template(p) {
    const total = Math.max(1, Number(p.total) || 1);
    const page = Math.min(total, Math.max(1, Number(p.page) || 1));
    let out = '<button type="button" data-i="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>‹</button>';
    for (let i = 1; i <= total; i++) {
      out += '<button type="button" data-i="' + i + '"' + (i === page ? ' class="on"' : '') + '>' + i + '</button>';
    }
    out += '<button type="button" data-i="' + (page + 1) + '"' + (page === total ? ' disabled' : '') + '>›</button>';
    return '<div class="ui-pager">' + out + '</div>';
  }
  mounted() {
    const self = this;
    this.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        self.setAttribute('page', b.dataset.i);
        self.dispatchEvent(new CustomEvent('change', {
          detail: { page: Number(b.dataset.i) }, bubbles: true
        }));
      });
    });
  }
}
register('ui-pagination', UIPagination, pagerCss);