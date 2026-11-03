/* =========================================================
   界面模板的公共部分
   —— TPL_BASE_CSS：所有模板共用的骨架样式（屏幕 / 滚动区 / 区块标题 / 横滑列表 / 占位图）
   —— 小工具：占位图、视觉隐藏文本
   模板样式只引用 var(--ui-*)，切换 data-style / data-theme 时自动换肤
   ========================================================= */

export const TPL_BASE_CSS = `
.t-screen{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--ui-bg);color:var(--ui-text);
  font-family:var(--ui-font);font-size:13px;line-height:1.5;position:relative}
:where(.t-screen) button{font:inherit;color:inherit}
.t-scr{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin}
.t-scr:focus-visible,.t-hs:focus-visible{outline:2px solid var(--ui-brand);outline-offset:-2px}
.t-top{position:sticky;top:0;z-index:3;background:color-mix(in srgb,var(--ui-bg) 92%,transparent);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.t-sec{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:18px 14px 10px}
.t-sec h3{margin:0;font-size:15px;line-height:1.3}
.t-more{font-size:12px;color:var(--ui-sub);background:none;border:0;cursor:pointer;padding:4px 0}
.t-more:hover{color:var(--ui-brand)}
.t-hs{display:flex;gap:10px;overflow-x:auto;padding:2px 14px 8px;scroll-snap-type:x mandatory;scrollbar-width:none}
.t-hs::-webkit-scrollbar{display:none}
.t-hs > *{flex:0 0 auto;scroll-snap-align:start}
.t-ph{display:grid;place-items:center;overflow:hidden;font-size:30px;line-height:1;border-radius:var(--ui-radius);
  background:linear-gradient(135deg,var(--ui-brand-soft),color-mix(in srgb,var(--ui-brand) 28%,var(--ui-panel)))}
.t-panel{background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);box-shadow:var(--ui-shadow-sm)}
.t-sub{color:var(--ui-sub);font-size:12px}
.t-price{color:var(--ui-danger);font-weight:700;font-variant-numeric:tabular-nums}
.t-icobtn{display:grid;place-items:center;width:36px;height:36px;flex:0 0 auto;border:0;border-radius:var(--ui-radius-pill);
  background:var(--ui-panel);box-shadow:var(--ui-shadow-sm);cursor:pointer;font-size:16px;position:relative}
.t-icobtn:focus-visible,.t-tile:focus-visible{outline:2px solid var(--ui-brand);outline-offset:2px}
.t-dot{position:absolute;top:6px;right:7px;width:8px;height:8px;border-radius:50%;background:var(--ui-danger);
  box-shadow:0 0 0 2px var(--ui-panel)}
.t-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px 4px;padding:4px 10px}
.t-grid button{display:flex;flex-direction:column;align-items:center;gap:5px;padding:4px 0;border:0;background:none;cursor:pointer;
  font-size:11.5px;border-radius:var(--ui-radius-sm)}
.t-grid i{display:grid;place-items:center;width:42px;height:42px;font-style:normal;font-size:21px;
  border-radius:var(--ui-radius);background:var(--ui-panel);box-shadow:var(--ui-shadow-sm)}
.t-flex1{flex:1}
.t-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:var(--ui-ctl-h);padding:0 18px;cursor:pointer;
  border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);background:var(--ui-panel);color:var(--ui-text);font-weight:600}
.t-btn:hover:not(:disabled){border-color:var(--ui-brand);color:var(--ui-brand)}
.t-btn--primary{background:var(--ui-brand);border-color:var(--ui-brand);color:var(--ui-brand-ink)}
.t-btn--primary:hover:not(:disabled){filter:brightness(1.06);color:var(--ui-brand-ink)}
.t-btn:disabled{cursor:default;color:var(--ui-sub)}
.t-btn:focus-visible{outline:2px solid var(--ui-brand);outline-offset:2px}
.t-empty{padding:28px 14px;text-align:center;color:var(--ui-sub);font-size:12.5px}
.t-sr{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.t-screen > ui-bottom-nav{flex:0 0 auto}
`;

/** 占位图：渐变底 + emoji，role=img 并带说明，真实项目里换成 <img> */
export function ph(emoji, label, cls, style) {
  return '<div class="t-ph' + (cls ? ' ' + cls : '') + '" role="img" aria-label="' + label + '"' +
    (style ? ' style="' + style + '"' : '') + '>' + emoji + '</div>';
}

/** 把对象数组写进属性：单引号属性值里不能出现单引号 */
export const json = (v) => JSON.stringify(v).replace(/'/g, '&#39;');
