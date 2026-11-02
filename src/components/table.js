/* =========================================================
   数据表格 ui-table
   —— columns / rows 都传 JSON，避免用 HTML 字符串拼列
   —— 支持 zebra（斑马纹）、dense（紧凑）、empty 文案
   ========================================================= */
import { UIElement, register } from './base.js';

export const tableCss = `
.ui-table-wrap{width:100%;overflow:auto}
.ui-table{width:100%;border-collapse:collapse;font-size:13px}
.ui-table caption{
  caption-side:top;text-align:left;font-size:12px;color:var(--ui-sub);padding:0 0 8px;
}
.ui-table th{
  text-align:left;font-size:12px;font-weight:500;color:var(--ui-sub);
  padding:9px 10px;white-space:nowrap;
  border-bottom:var(--ui-border-w) solid var(--ui-line);
}
.ui-table td{
  padding:9px 10px;color:var(--ui-text);
  border-bottom:1px solid var(--ui-line);
}
.ui-table tbody tr:last-child td{border-bottom:0}
.ui-table--zebra tbody tr:nth-child(even){background:var(--ui-panel-2)}
.ui-table--dense th,.ui-table--dense td{padding:6px 10px}
.ui-table__empty td{
  text-align:center;color:var(--ui-sub);padding:22px 10px;font-size:12.5px;
}
.ui-table__err{padding:12px;font-size:12.5px;color:var(--ui-sub)}
/* 容器窄于 420px：表格自动变成「卡片列表」，每格前显示列名 */
ui-table{display:block;width:100%;container-type:inline-size}
@container (max-width:420px){
  .ui-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .ui-table tbody tr{display:block;padding:8px 10px;border:1px solid var(--ui-line);border-radius:var(--ui-radius);margin-bottom:8px}
  .ui-table td{display:flex;justify-content:space-between;gap:12px;border:0;padding:4px 0}
  .ui-table td::before{content:attr(data-label);color:var(--ui-sub);font-size:12px}
  .ui-table--zebra tbody tr:nth-child(even){background:var(--ui-panel-2)}
  .ui-table__empty td{display:block}
  .ui-table__empty td::before{content:none}
}
`;

function parse(text, fallback) {
  try {
    const v = JSON.parse(text || '[]');
    return Array.isArray(v) ? v : fallback;
  } catch (e) {
    return null;
  }
}

export class UITable extends UIElement {
  static props = {
    columns: { default: '[]' },
    rows: { default: '[]' },
    caption: { default: '' },
    zebra: { type: 'boolean' },
    dense: { type: 'boolean' },
    'empty-text': { default: '暂无数据' }
  };

  template(p) {
    const cols = parse(p.columns, []);
    const rows = parse(p.rows, []);
    if (cols === null || rows === null) {
      return '<div class="ui-table__err">columns / rows 需要是合法 JSON 数组</div>';
    }
    if (!cols.length) {
      return '<div class="ui-table__err">请先用 columns 定义列</div>';
    }

    const cls = ['ui-table'];
    if (p.zebra) cls.push('ui-table--zebra');
    if (p.dense) cls.push('ui-table--dense');

    const head = '<tr>' + cols.map(function (c) {
      return '<th scope="col">' + (c.title == null ? c.key : c.title) + '</th>';
    }).join('') + '</tr>';

    const body = rows.length
      ? rows.map(function (row) {
        return '<tr>' + cols.map(function (c) {
          const v = row[c.key];
          return '<td data-label="' + String(c.title == null ? c.key : c.title).replace(/"/g, '') + '">' + (v == null ? '' : String(v)) + '</td>';
        }).join('') + '</tr>';
      }).join('')
      : '<tr class="ui-table__empty"><td colspan="' + cols.length + '">' + p['empty-text'] + '</td></tr>';

    const caption = p.caption ? '<caption>' + p.caption + '</caption>' : '';

    return '<div class="ui-table-wrap"><table class="' + cls.join(' ') + '">' +
      caption + '<thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  }
}
register('ui-table', UITable, tableCss);