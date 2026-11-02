/* =========================================================
   动效工具
   —— reduced()：系统「减少动态效果」或页面 data-motion="reduce" 时为 true
   —— onVisible()：进入视口时回调（IntersectionObserver）
   —— loop()：requestAnimationFrame 循环，离开视口 / 标签页隐藏时自动暂停
   —— 全局兜底样式：带 .ui-mo 的组件在减少动效模式下动画瞬间完成
   ========================================================= */

const MQ = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

export function reduced() {
  return MQ.matches || document.documentElement.getAttribute('data-motion') === 'reduce';
}

const OFF = '.ui-mo,.ui-mo *,.ui-mo *::before,.ui-mo *::after,.ui-mo::before,.ui-mo::after{' +
  'animation-duration:.001ms!important;animation-iteration-count:1!important;animation-delay:0s!important;' +
  'transition-duration:.001ms!important;transition-delay:0s!important}';
export const motionCss = `
@media (prefers-reduced-motion: reduce){${OFF}}
${OFF.replace(/\.ui-mo/g, '[data-motion="reduce"] .ui-mo')}
`;
(function inject() {
  if (typeof document === 'undefined' || document.querySelector('style[data-lib="ui-motion"]')) return;
  const s = document.createElement('style');
  s.dataset.lib = 'ui-motion';
  s.textContent = motionCss;
  document.head.appendChild(s);
})();

/** 进入视口时回调；once=true 时触发一次后自动解绑。返回解绑函数 */
export function onVisible(el, cb, opts) {
  const o = Object.assign({ threshold: 0.15, once: true }, opts || {});
  if (typeof IntersectionObserver !== 'function') { cb(true); return function () {}; }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { cb(true); if (o.once) io.disconnect(); }
      else if (!o.once) cb(false);
    });
  }, { threshold: o.threshold, rootMargin: o.rootMargin || '0px' });
  io.observe(el);
  return function () { io.disconnect(); };
}

/**
 * 可暂停的动画循环：元素不在视口或页面隐藏时停止，不白白耗电
 * @returns {{ stop: Function }}
 */
export function loop(el, frame) {
  let raf = 0, visible = false, alive = true, last = 0;
  const tick = function (t) {
    if (!alive) return;
    const dt = last ? Math.min(50, t - last) : 16;
    last = t;
    frame(dt, t);
    raf = requestAnimationFrame(tick);
  };
  const start = function () { if (!raf && alive && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } };
  const pause = function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  const off = onVisible(el, function (v) { visible = v; if (v) start(); else pause(); }, { once: false, threshold: 0 });
  const vis = function () { if (document.hidden) pause(); else start(); };
  document.addEventListener('visibilitychange', vis);
  return {
    stop: function () { alive = false; pause(); off(); document.removeEventListener('visibilitychange', vis); },
    get running() { return !!raf; }
  };
}

/** 读取当前元素所在作用域的 token 颜色（随 data-style / data-theme 变化） */
export function tokenColors(el, names) {
  const cs = getComputedStyle(el);
  return names.map(function (n) { return cs.getPropertyValue('--ui-' + n).trim() || '#888'; });
}
