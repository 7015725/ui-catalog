/* =========================================================
   展示类组件：ui-tag / ui-badge / ui-avatar / ui-card / ui-stat
   ========================================================= */
import { UIElement, register } from './base.js';

/* ---------------- Tag ---------------- */
export const tagCss = `
.ui-tag{
  display:inline-flex;align-items:center;gap:6px;
  padding:3px 10px;font-size:12px;line-height:1.6;
  border-radius:var(--ui-radius-pill);
  border:var(--ui-border-w) solid transparent;
  background:var(--ui-brand-soft);color:var(--ui-brand);
  transition:var(--ui-motion);
}
.ui-tag--success{background:var(--ui-ok-soft);color:var(--ui-ok)}
.ui-tag--warn{background:var(--ui-warn-soft);color:var(--ui-warn)}
.ui-tag--danger{background:var(--ui-danger-soft);color:var(--ui-danger)}
.ui-tag--plain{background:var(--ui-panel-2);color:var(--ui-sub);border-color:var(--ui-line)}
.ui-tag--outline{background:transparent;border-color:currentColor}
.ui-tag--solid{background:var(--ui-brand);color:var(--ui-brand-ink)}
.ui-tag--success.ui-tag--solid{background:var(--ui-ok);color:var(--ui-on-color)}
.ui-tag--warn.ui-tag--solid{background:var(--ui-warn);color:var(--ui-on-color)}
.ui-tag--danger.ui-tag--solid{background:var(--ui-danger);color:var(--ui-on-color)}
.ui-tag--dot::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.ui-tag--square{border-radius:var(--ui-radius-sm)}
.ui-tag__x{cursor:pointer;opacity:.55;font-size:14px;line-height:1;transition:var(--ui-motion)}
.ui-tag__x:hover{opacity:1;transform:scale(1.15)}
`;

export class UITag extends UIElement {
  static props = {
    variant: { default: 'brand' },
    look: { default: '' },
    closable: { type: 'boolean' }
  };
  template(p) {
    const looks = String(p.look || '').split(/[\s,]+/).filter(Boolean).map(function (l) { return ' ui-tag--' + l; }).join('');
    return '<span class="ui-tag ui-tag--' + p.variant + looks + '"><slot></slot>' +
      (p.closable ? '<span class="ui-tag__x" title="移除">×</span>' : '') + '</span>';
  }
  mounted() {
    const self = this;
    const x = this.querySelector('.ui-tag__x');
    if (x) x.addEventListener('click', function () { self.remove(); });
  }
}
register('ui-tag', UITag, tagCss);

/* ---------------- Badge ---------------- */
export const badgeCss = `
.ui-badge{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:18px;height:18px;padding:0 6px;
  font-size:11px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;
  border-radius:var(--ui-radius-pill);
  background:var(--ui-danger-soft);color:var(--ui-danger);
}
.ui-badge--brand{background:var(--ui-brand-soft);color:var(--ui-brand)}
.ui-badge--success{background:var(--ui-ok-soft);color:var(--ui-ok)}
.ui-badge--warn{background:var(--ui-warn-soft);color:var(--ui-warn)}
.ui-badge--dot{min-width:8px;width:8px;height:8px;padding:0}
`;

export class UIBadge extends UIElement {
  static props = {
    variant: { default: 'danger' },
    dot: { type: 'boolean' }
  };
  template(p) {
    return '<span class="ui-badge ui-badge--' + p.variant + (p.dot ? ' ui-badge--dot' : '') + '"><slot></slot></span>';
  }
}
register('ui-badge', UIBadge, badgeCss);

/* ---------------- Avatar ---------------- */
export const avatarCss = `
.ui-avatar{
  display:inline-grid;place-items:center;flex:0 0 auto;
  width:36px;height:36px;border-radius:50%;
  font-size:13px;font-weight:600;color:var(--ui-brand-ink);
  background:linear-gradient(135deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 45%,#8f5cff));
  box-shadow:var(--ui-shadow-sm);user-select:none;overflow:hidden;
}
.ui-avatar--sm{width:26px;height:26px;font-size:11px}
.ui-avatar--lg{width:48px;height:48px;font-size:16px}
.ui-avatar img{width:100%;height:100%;object-fit:cover}
`;

export class UIAvatar extends UIElement {
  static props = {
    name: { default: '?' },
    size: { default: 'md' },
    src: { default: '' }
  };
  template(p) {
    const inner = p.src
      ? '<img src="' + p.src + '" alt="' + p.name + '">'
      : (p.name || '?').slice(0, 1);
    return '<span class="ui-avatar ui-avatar--' + p.size + '">' + inner + '</span>';
  }
}
register('ui-avatar', UIAvatar, avatarCss);

/* ---------------- Card ---------------- */
export const cardCss = `
.ui-card{
  display:flex;flex-direction:column;width:100%;
  background:var(--ui-panel);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);
  box-shadow:var(--ui-shadow);overflow:hidden;transition:var(--ui-motion);
}
.ui-card:hover{box-shadow:var(--ui-shadow)}
.ui-card--outline{box-shadow:none}
.ui-card--filled{background:var(--ui-panel-2);box-shadow:none;border-color:transparent}
.ui-card--accent{border-top:3px solid var(--ui-brand)}
.ui-card--hoverable{cursor:pointer}
.ui-card--hoverable:hover{transform:translateY(-3px);border-color:var(--ui-brand)}
.ui-card__hd{display:flex;align-items:center;justify-content:space-between;gap:8px;
  padding:12px 14px;border-bottom:1px dashed var(--ui-line)}
.ui-card__t{font-size:13.5px;font-weight:600;color:var(--ui-text)}
.ui-card__bd{padding:14px;font-size:13px;color:var(--ui-sub);line-height:1.7}
.ui-card__ft{padding:10px 14px;border-top:1px dashed var(--ui-line);display:flex;justify-content:flex-end;gap:8px}
`;

export class UICard extends UIElement {
  static props = {
    title: { default: '' },
    extra: { default: '' },
    variant: { default: 'default' },
    hoverable: { type: 'boolean' }
  };
  template(p) {
    const hd = (p.title || p.extra)
      ? '<div class="ui-card__hd"><span class="ui-card__t">' + p.title + '</span><span class="ui-card__e">' + p.extra + '</span></div>'
      : '';
    return '<div class="ui-card ui-card--' + p.variant + (p.hoverable ? ' ui-card--hoverable' : '') + '">' + hd + '<div class="ui-card__bd"><slot></slot></div></div>';
  }
}
register('ui-card', UICard, cardCss);

/* ---------------- Stat ---------------- */
export const statCss = `
.ui-stat{
  display:flex;flex-direction:column;gap:3px;flex:1;min-width:96px;
  padding:12px 14px;background:var(--ui-panel);
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);
}
.ui-stat__v{font-size:20px;font-weight:700;letter-spacing:.4px;color:var(--ui-text);
  font-variant-numeric:tabular-nums;line-height:1.2}
.ui-stat__l{font-size:11.5px;color:var(--ui-sub)}
.ui-stat__d{font-size:11px;font-weight:600;color:var(--ui-sub)}
.ui-stat__d--up{color:var(--ui-ok)}
.ui-stat__d--down{color:var(--ui-danger)}
`;

export class UIStat extends UIElement {
  static props = {
    value: { default: '0' },
    label: { default: '' },
    delta: { default: '' },
    trend: { default: 'flat' }
  };
  template(p) {
    const d = p.delta
      ? '<span class="ui-stat__d ui-stat__d--' + p.trend + '">' + p.delta + '</span>'
      : '';
    return '<div class="ui-stat"><span class="ui-stat__l">' + p.label + '</span>' +
      '<b class="ui-stat__v">' + p.value + '</b>' + d + '</div>';
  }
}
register('ui-stat', UIStat, statCss);