/* =========================================================
   反馈类组件：ui-progress / ui-spinner / ui-skeleton
              ui-empty / ui-alert
   ========================================================= */
import { UIElement, register } from './base.js';

/* ---------------- Progress ---------------- */
export const progressCss = `
.ui-progress{width:100%;display:flex;flex-direction:column;gap:6px}
.ui-progress__head{display:flex;justify-content:space-between;font-size:12px;color:var(--ui-sub)}
.ui-progress__head b{color:var(--ui-text);font-variant-numeric:tabular-nums}
.ui-progress__track{height:8px;border-radius:var(--ui-radius-pill);
  background:var(--ui-line);overflow:hidden}
.ui-progress__bar{display:block;height:100%;border-radius:inherit;background:var(--ui-brand);
  transition:width .3s ease}
`;

export class UIProgress extends UIElement {
  static props = {
    value: { default: '0' },
    label: { default: '' },
    'show-value': { type: 'boolean' }
  };
  template(p) {
    const v = Math.min(100, Math.max(0, Number(p.value) || 0));
    const head = (p.label || p['show-value'])
      ? '<div class="ui-progress__head"><span>' + p.label + '</span>' +
        (p['show-value'] ? '<b>' + v + '%</b>' : '') + '</div>'
      : '';
    return '<div class="ui-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"' +
      ' aria-valuenow="' + v + '"' + (p.label ? ' aria-label="' + p.label + '"' : '') + '>' + head +
      '<div class="ui-progress__track"><i class="ui-progress__bar" style="width:' + v + '%"></i></div></div>';
  }
}
register('ui-progress', UIProgress, progressCss);

/* ---------------- Spinner ---------------- */
export const spinnerCss = `
.ui-spinner{
  display:inline-block;width:20px;height:20px;flex:0 0 auto;
  border-radius:50%;
  border:2px solid var(--ui-line);
  border-top-color:var(--ui-brand);
  animation:ui-spin .72s linear infinite;
}
.ui-spinner--sm{width:14px;height:14px;border-width:2px}
.ui-spinner--lg{width:30px;height:30px;border-width:3px}
@keyframes ui-spin{to{transform:rotate(360deg)}}
`;

export class UISpinner extends UIElement {
  static props = { size: { default: 'md' } };
  template(p) {
    return '<span class="ui-spinner ui-spinner--' + p.size + '" role="status" aria-label="加载中"></span>';
  }
}
register('ui-spinner', UISpinner, spinnerCss);

/* ---------------- Skeleton ---------------- */
export const skeletonCss = `
.ui-skeleton{display:flex;flex-direction:column;gap:9px;width:100%}
.ui-skeleton i{
  display:block;height:12px;border-radius:var(--ui-radius-sm);
  background:linear-gradient(90deg,var(--ui-line),var(--ui-panel-2),var(--ui-line));
  background-size:200% 100%;animation:ui-sk 1.4s linear infinite;
}
.ui-skeleton i:last-child{width:56%}
@keyframes ui-sk{0%{background-position:200% 0}100%{background-position:-200% 0}}
`;

export class UISkeleton extends UIElement {
  static props = { lines: { default: '3' } };
  template(p) {
    const n = Math.min(8, Math.max(1, Number(p.lines) || 3));
    return '<div class="ui-skeleton">' + '<i></i>'.repeat(n) + '</div>';
  }
}
register('ui-skeleton', UISkeleton, skeletonCss);

/* ---------------- Empty ---------------- */
export const emptyCss = `
.ui-empty{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  width:100%;padding:22px 12px;text-align:center;
  color:var(--ui-sub);font-size:13px;line-height:1.7;
}
.ui-empty__ico{font-size:26px;opacity:.45;line-height:1}
.ui-empty__tip{font-size:12px;opacity:.85}
`;

export class UIEmpty extends UIElement {
  static props = {
    text: { default: '' },
    tip: { default: '' }
  };
  template(p) {
    return '<div class="ui-empty"><span class="ui-empty__ico">🗂️</span>' +
      '<span><slot></slot></span>' +
      (p.tip ? '<span class="ui-empty__tip">' + p.tip + '</span>' : '') + '</div>';
  }
}
register('ui-empty', UIEmpty, emptyCss);

/* ---------------- Alert ---------------- */
export const alertCss = `
.ui-alert{
  display:flex;align-items:flex-start;gap:9px;width:100%;
  padding:11px 13px;font-size:13px;line-height:1.65;
  color:var(--ui-text);
  border:var(--ui-border-w) solid var(--ui-line);
  border-radius:var(--ui-radius);
  background:var(--ui-panel-2);
}
.ui-alert__ico{flex:0 0 auto;font-size:14px;line-height:1.5}
.ui-alert__t{font-weight:600;display:block;margin-bottom:2px}
.ui-alert--info{background:var(--ui-brand-soft);border-color:var(--ui-brand)}
.ui-alert--success{background:var(--ui-ok-soft);border-color:var(--ui-ok)}
.ui-alert--warn{background:var(--ui-warn-soft);border-color:var(--ui-warn)}
.ui-alert--danger{background:var(--ui-danger-soft);border-color:var(--ui-danger)}
`;

const ICONS = { info: 'ⓘ', success: '✓', warn: '!', danger: '✕' };

export class UIAlert extends UIElement {
  static props = {
    variant: { default: 'info' },
    title: { default: '' }
  };
  template(p) {
    const ico = ICONS[p.variant] || ICONS.info;
    const title = p.title ? '<b class="ui-alert__t">' + p.title + '</b>' : '';
    /* danger / warn 用 alert（打断），其余用 status（不打断） */
    const role = (p.variant === 'danger' || p.variant === 'warn') ? 'alert' : 'status';
    return '<div class="ui-alert ui-alert--' + p.variant + '" role="' + role + '">' +
      '<span class="ui-alert__ico" aria-hidden="true">' + ico + '</span>' +
      '<span>' + title + '<slot></slot></span></div>';
  }
}
register('ui-alert', UIAlert, alertCss);