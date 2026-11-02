/* =========================================================
   树形 ui-tree
   —— data 属性传 JSON（[{label, key?, children?}]），递归渲染
   —— 展开态靠 data-open + group.hidden，选中派发 select
   ========================================================= */
import { UIElement, register } from './base.js';

export const treeCss = `
.ui-tree{width:100%;font-size:13px;color:var(--ui-text)}
.ui-tree__node{
  display:flex;align-items:center;gap:6px;
  padding:5px 8px;border-radius:var(--ui-radius-sm);
  cursor:pointer;transition:var(--ui-motion);user-select:none;
}
.ui-tree__node:hover{background:var(--ui-brand-soft)}
.ui-tree__node.on{background:var(--ui-brand-soft);color:var(--ui-brand);font-weight:600}
.ui-tree__node:focus{outline:none;box-shadow:inset 0 0 0 2px var(--ui-brand)}
.ui-tree__caret{
  width:12px;flex:0 0 auto;font-size:9px;color:var(--ui-sub);
  transition:transform var(--ui-motion);
}
.ui-tree__node[data-open] .ui-tree__caret{transform:rotate(90deg)}
.ui-tree__caret--none{visibility:hidden}
.ui-tree__label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ui-tree__group[hidden]{display:none}
.ui-tree__ico{font-size:12px;opacity:.7}
`;

function renderNodes(list, depth, selected) {
  return list.map(function (node, idx) {
    const label = node.label == null ? '' : String(node.label);
    const key = node.key == null ? label : String(node.key);
    const kids = Array.isArray(node.children) ? node.children : [];
    const hasKids = kids.length > 0;
    const isSel = key === selected;
    const open = !!node.open;
    const indent = 'padding-left:' + (8 + depth * 16) + 'px';
    /* roving tabindex：整棵树只留一个 Tab 落点 */
    const tab = (depth === 0 && idx === 0) ? '0' : '-1';

    return '<div class="ui-tree__item" role="none">' +
      '<div class="ui-tree__node' + (isSel ? ' on' : '') + '" data-key="' + key + '"' +
      ' role="treeitem" aria-level="' + (depth + 1) + '"' +
      ' aria-selected="' + (isSel ? 'true' : 'false') + '"' +
      (hasKids ? ' aria-expanded="' + (open ? 'true' : 'false') + '"' : '') +
      ' tabindex="' + tab + '"' +
      (hasKids ? ' data-branch' : '') + (open ? ' data-open' : '') + ' style="' + indent + '">' +
      '<span class="ui-tree__caret' + (hasKids ? '' : ' ui-tree__caret--none') + '" aria-hidden="true">▶</span>' +
      '<span class="ui-tree__ico" aria-hidden="true">' + (hasKids ? '📁' : '📄') + '</span>' +
      '<span class="ui-tree__label">' + label + '</span></div>' +
      (hasKids
        ? '<div class="ui-tree__group" role="group"' + (open ? '' : ' hidden') + '>' +
          renderNodes(kids, depth + 1, selected) + '</div>'
        : '') +
      '</div>';
  }).join('');
}

export class UITree extends UIElement {
  static props = {
    data: { default: '[]' },
    selected: { default: '' }
  };

  template(p) {
    let list = [];
    try {
      list = JSON.parse(p.data || '[]');
      if (!Array.isArray(list)) list = [];
    } catch (e) {
      list = [];
    }
    if (!list.length) {
      return '<div class="ui-tree" style="color:var(--ui-sub);font-size:12.5px;padding:8px">data 属性需要是合法 JSON 数组</div>';
    }
    return '<div class="ui-tree" role="tree">' + renderNodes(list, 0, p.selected) + '</div>';
  }

  mounted() {
    if (this._bound) return;
    this._bound = true;
    const host = this;

    /* 可见节点序列（跳过折叠组内的节点） */
    const visible = function () {
      return Array.prototype.slice.call(host.querySelectorAll('.ui-tree__node'))
        .filter(function (n) { return !n.closest('.ui-tree__group[hidden]'); });
    };

    const focusNode = function (n) {
      if (!n) return;
      visible().forEach(function (x) { x.tabIndex = x === n ? 0 : -1; });
      n.focus();
    };

    const select = function (node) {
      host.querySelectorAll('.ui-tree__node.on').forEach(function (n) {
        n.classList.remove('on');
        n.setAttribute('aria-selected', 'false');
      });
      node.classList.add('on');
      node.setAttribute('aria-selected', 'true');
      host.dispatchEvent(new CustomEvent('select', {
        detail: { key: node.dataset.key, label: node.querySelector('.ui-tree__label').textContent },
        bubbles: true
      }));
    };

    const toggle = function (node, force) {
      if (!node.hasAttribute('data-branch')) return false;
      const group = node.nextElementSibling;
      if (!group) return false;
      const open = force === undefined ? group.hidden : force;
      group.hidden = !open;
      if (open) {
        node.setAttribute('data-open', '');
        node.setAttribute('aria-expanded', 'true');
      } else {
        node.removeAttribute('data-open');
        node.setAttribute('aria-expanded', 'false');
      }
      return true;
    };

    this.addEventListener('click', function (e) {
      const node = e.target.closest('.ui-tree__node');
      if (!node) return;
      if (e.target.closest('.ui-tree__caret') && node.hasAttribute('data-branch')) {
        toggle(node);
        return;
      }
      focusNode(node);
      select(node);
    });

    /* ← 折叠/回父   → 展开/进子   ↑↓ 上下移动   Enter/Space 选中 */
    this.addEventListener('keydown', function (e) {
      const cur = e.target.closest('.ui-tree__node');
      if (!cur) return;
      const list = visible();
      const i = list.indexOf(cur);
      const group = cur.nextElementSibling;
      const parentGroup = cur.closest('.ui-tree__group');
      const parentNode = parentGroup ? parentGroup.previousElementSibling : null;

      if (e.key === 'ArrowDown') { e.preventDefault(); focusNode(list[i + 1]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusNode(list[i - 1]); }
      else if (e.key === 'Home') { e.preventDefault(); focusNode(list[0]); }
      else if (e.key === 'End') { e.preventDefault(); focusNode(list[list.length - 1]); }
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (cur.hasAttribute('data-branch') && group && group.hidden) toggle(cur, true);
        else focusNode(list[i + 1]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (cur.hasAttribute('data-branch') && group && !group.hidden) toggle(cur, false);
        else focusNode(parentNode);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(cur);
      }
    });
  }
}
register('ui-tree', UITree, treeCss);