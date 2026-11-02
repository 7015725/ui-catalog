/* 焦点工具：可聚焦元素选择器 + Tab 循环（焦点陷阱） */

export const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

/**
 * 把 Tab 键锁在容器内
 * @param {HTMLElement} container
 * @returns {Function} 解除函数
 */
export function trapTab(container) {
  const onKey = function (e) {
    if (e.key !== 'Tab') return;
    const list = Array.prototype.slice.call(container.querySelectorAll(FOCUSABLE))
      .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
    if (!list.length) {
      e.preventDefault();
      container.focus();
      return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    const outside = !container.contains(active) || active === container;
    if (e.shiftKey && (active === first || outside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || outside)) {
      e.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKey);
  return function () { document.removeEventListener('keydown', onKey); };
}