/* =========================================================
   回归用例：把前面几轮手工实测固化成断言
   覆盖 — 属性解析 / 交互行为 / 键盘 / ARIA / 主题隔离 / 错误兜底
   ========================================================= */
import './../components/index.js';
import { toast } from './../components/overlay.js';
import { describe, it, expect, put, tick } from './harness.js';

const key = (k) => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

/* ---------------- 基础属性 ---------------- */
describe('属性与渲染', () => {
  it('ui-button 默认 variant/size 与文案', async (host) => {
    await put(host, '<ui-button>保存</ui-button>');
    const btn = host.querySelector('.ui-btn');
    expect(btn.textContent.trim()).toBe('保存');
    expect(btn.classList.contains('ui-btn--default')).toBe(true);
    expect(btn.classList.contains('ui-btn--md')).toBe(true);
  });

  it('ui-button 布尔属性 disabled 透传到内部 button', async (host) => {
    await put(host, '<ui-button disabled>保存</ui-button>');
    expect(host.querySelector('.ui-btn').disabled).toBe(true);
  });

  it('ui-input 的 hint 通过 aria-describedby 关联', async (host) => {
    await put(host, '<ui-input label="用户名" hint="3-16 个字符"></ui-input>');
    const input = host.querySelector('input');
    const id = input.getAttribute('aria-describedby');
    expect(!!id).toBeTruthy();
    expect(host.querySelector('#' + id).textContent).toBe('3-16 个字符');
  });

  it('ui-switch 使用 role=switch', async (host) => {
    await put(host, '<ui-switch checked>开启</ui-switch>');
    const input = host.querySelector('input');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.checked).toBe(true);
  });

  it('ui-progress 暴露 aria-valuenow 并夹取越界值', async (host) => {
    await put(host, '<ui-progress value="150" label="进度"></ui-progress>');
    const bar = host.querySelector('[role="progressbar"]');
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('ui-alert 按 variant 选择 role', async (host) => {
    await put(host, '<ui-alert variant="danger">危险</ui-alert><ui-alert variant="info">提示</ui-alert>');
    const roles = [...host.querySelectorAll('[role]')].map((n) => n.getAttribute('role'));
    expect(roles).toEqual(['alert', 'status']);
  });
});

/* ---------------- 浮层与键盘 ---------------- */
describe('浮层', () => {
  it('ui-dropdown 的 ↓ 进第一项、↑ 循环、Esc 归还焦点', async (host) => {
    await put(host, '<ui-dropdown items="编辑,复制,-,!删除">更多</ui-dropdown>');
    const dd = host.querySelector('ui-dropdown');
    const btn = dd.querySelector('button');
    btn.focus();
    key('ArrowDown');
    await tick(30);
    expect(dd._layer.el.hidden).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement.textContent.trim()).toBe('编辑');
    key('ArrowDown');
    expect(document.activeElement.textContent.trim()).toBe('复制');
    key('Escape');
    await tick(30);
    expect(dd._layer.el.hidden).toBe(true);
    expect(document.activeElement).toBe(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('ui-dropdown 选中后派发 select 事件并关闭', async (host) => {
    await put(host, '<ui-dropdown items="A,B">菜单</ui-dropdown>');
    const dd = host.querySelector('ui-dropdown');
    let detail = null;
    dd.addEventListener('select', (e) => { detail = e.detail; });
    dd.querySelector('button').click();
    await tick(30);
    click(dd._layer.el.querySelectorAll('[data-i]')[1]);
    await tick(20);
    expect(detail.index).toBe(1);
    expect(detail.label).toBe('B');
    expect(dd._layer.el.hidden).toBe(true);
  });

  it('ui-popover 点击打开、外部点击关闭', async (host) => {
    await put(host, "<ui-popover content='<b>正文</b>'><ui-button>查看</ui-button></ui-popover>");
    const po = host.querySelector('ui-popover');
    click(po.querySelector('.ui-pop'));
    await tick(30);
    expect(po._layer.el.hidden).toBe(false);
    expect(po._layer.el.textContent).toContain('正文');
    document.body.click();
    await tick(30);
    expect(po._layer.el.hidden).toBe(true);
  });

  it('ui-modal 打开锁定滚动与焦点，关闭后归还', async (host) => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    await put(host, '<ui-modal title="确认"><button id="ok">确定</button></ui-modal>');
    const md = host.querySelector('ui-modal');
    md.show();
    await tick(20);
    expect(md._mask.hidden).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
    expect(md._panel.contains(document.activeElement)).toBe(true);
    expect(md._panel.getAttribute('role')).toBe('dialog');

    md.close();
    await tick(20);
    expect(md._mask.hidden).toBe(true);
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('ui-modal 关闭状态下遮罩不占位（[hidden] 未被 display 覆盖）', async (host) => {
    await put(host, '<ui-modal title="确认"><p>正文</p></ui-modal>');
    const md = host.querySelector('ui-modal');
    expect(getComputedStyle(md._mask).display).toBe('none');
    md.show();
    await tick(20);
    expect(getComputedStyle(md._mask).display).toBe('grid');
    md.close();
    await tick(20);
    expect(getComputedStyle(md._mask).display).toBe('none');
  });

  it('ui-drawer 打开后焦点在面板内、关闭归还', async (host) => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    await put(host, '<ui-drawer title="筛选"><button>应用</button></ui-drawer>');
    const dr = host.querySelector('ui-drawer');
    dr.show();
    await tick(20);
    expect(dr._mask.hidden).toBe(false);
    expect(dr._panel.contains(document.activeElement)).toBe(true);
    expect(dr._panel.dataset.side).toBe('right');

    dr.close();
    await tick(20);
    expect(dr._mask.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});

/* ---------------- 复杂控件 ---------------- */
describe('复杂控件', () => {
  it('ui-datepicker 打开后 roving tabindex 唯一，← 退一天并写回', async (host) => {
    await put(host, '<ui-datepicker value="2026-10-31"></ui-datepicker>');
    const dp = host.querySelector('ui-datepicker');
    dp.querySelector('.ui-dp__btn').click();
    await tick(40);
    expect(dp._layer.el.hidden).toBe(false);
    expect(dp._layer.el.querySelectorAll('[data-d][tabindex="0"]').length).toBe(1);
    expect(document.activeElement.dataset.d).toBe('2026-10-31');

    key('ArrowLeft');
    expect(document.activeElement.dataset.d).toBe('2026-10-30');
    key('Enter');
    await tick(40);
    expect(dp.getAttribute('value')).toBe('2026-10-30');
    expect(dp._layer.el.hidden).toBe(true);
  });

  it('ui-tree → 展开、← 折叠、Enter 选中', async (host) => {
    await put(host, "<ui-tree data='[{\"label\":\"src\",\"children\":[{\"label\":\"a.js\"}]}]'></ui-tree>");
    const tr = host.querySelector('ui-tree');
    tr.querySelector('[tabindex="0"]').focus();
    key('ArrowRight');
    await tick(20);
    expect(document.activeElement.getAttribute('aria-expanded')).toBe('true');
    key('Enter');
    expect(tr.querySelectorAll('.ui-tree__node.on').length).toBe(1);
    key('ArrowLeft');
    expect(document.activeElement.getAttribute('aria-expanded')).toBe('false');
  });

  it('ui-tabs → 切换并同步 aria-selected', async (host) => {
    await put(host, '<ui-tabs items="概览,配置,日志" active="0"></ui-tabs>');
    const tabs = host.querySelector('ui-tabs');
    tabs.querySelector('[role="tab"][tabindex="0"]').focus();
    key('ArrowRight');
    await tick(20);
    expect(tabs.querySelector('[role="tab"][aria-selected="true"]').textContent).toBe('配置');
    expect(document.activeElement.textContent).toBe('配置');
  });

  it('ui-accordion 单开模式互斥', async (host) => {
    await put(host, "<ui-accordion open=\"0\" items='[{\"title\":\"一\",\"content\":\"A\"},{\"title\":\"二\",\"content\":\"B\"}]'></ui-accordion>");
    const ac = host.querySelector('ui-accordion');
    const hds = [...ac.querySelectorAll('.ui-acc__hd')];
    expect(hds.map((h) => h.getAttribute('aria-expanded'))).toEqual(['true', 'false']);
    click(hds[1]);
    expect(hds.map((h) => h.getAttribute('aria-expanded'))).toEqual(['false', 'true']);
  });

  it('ui-segmented 点击切换 value 与 aria-checked', async (host) => {
    await put(host, '<ui-segmented items="日,周,月" value="周"></ui-segmented>');
    const sg = host.querySelector('ui-segmented');
    click(sg.querySelectorAll('button')[2]);
    await tick(20);
    expect(sg.getAttribute('value')).toBe('月');
    expect(sg.querySelector('[aria-checked="true"]').textContent).toBe('月');
  });

  it('ui-rate 点星设值并更新 aria-valuenow', async (host) => {
    await put(host, '<ui-rate value="2"></ui-rate>');
    const rt = host.querySelector('ui-rate');
    click(rt.querySelectorAll('[data-v]')[3]);
    await tick(20);
    expect(rt.getAttribute('value')).toBe('4');
    expect(rt.querySelector('[role="slider"]').getAttribute('aria-valuenow')).toBe('4');
    expect(rt.querySelectorAll('.ui-rate__s.on').length).toBe(4);
  });
});

/* ---------------- 数据渲染与兜底 ---------------- */
describe('数据渲染与兜底', () => {
  it('ui-table 按 columns 渲染表头与行', async (host) => {
    await put(host, "<ui-table columns='[{\"key\":\"n\",\"title\":\"名称\"},{\"key\":\"q\",\"title\":\"数量\"}]' rows='[{\"n\":\"A\",\"q\":1},{\"n\":\"B\",\"q\":2}]'></ui-table>");
    const tb = host.querySelector('ui-table');
    expect([...tb.querySelectorAll('th')].map((t) => t.textContent)).toEqual(['名称', '数量']);
    expect(tb.querySelectorAll('tbody tr').length).toBe(2);
    expect(tb.querySelector('tbody tr').textContent).toContain('A');
  });

  it('ui-table 空数据渲染空状态整行', async (host) => {
    await put(host, "<ui-table columns='[{\"key\":\"n\",\"title\":\"名称\"}]' rows='[]' empty-text=\"没有记录\"></ui-table>");
    expect(host.querySelector('.ui-table__empty').textContent).toContain('没有记录');
  });

  it('ui-table 非法 JSON 给出可读提示而不是崩掉', async (host) => {
    await put(host, "<ui-table columns='oops'></ui-table>");
    expect(host.querySelector('.ui-table__err').textContent).toContain('JSON');
  });

  it('ui-tree 非法 JSON 给出可读提示', async (host) => {
    await put(host, "<ui-tree data='oops'></ui-tree>");
    expect(host.querySelector('.ui-tree').textContent).toContain('JSON');
  });

  it('uiToast 插入后按时移除', async (host) => {
    await put(host, '');
    toast('保存成功', { duration: 20 });
    expect(document.querySelectorAll('#ui-toast-root .ui-toast').length).toBe(1);
    expect(document.querySelector('#ui-toast-root .ui-toast').getAttribute('role')).toBe('status');
    await tick(320);
    expect(document.querySelectorAll('#ui-toast-root .ui-toast').length).toBe(0);
  });
});

/* ---------------- 主题隔离 ---------------- */
describe('主题与风格', () => {
  it('局部 data-style=brutal 只影响该子树的 token', async (host) => {
    await put(host, '<div data-style="brutal"><ui-button>x</ui-button></div><ui-button>y</ui-button>');
    const btns = host.querySelectorAll('.ui-btn');
    expect(getComputedStyle(btns[0]).borderTopLeftRadius).toBe('0px');
    expect(getComputedStyle(btns[1]).borderTopLeftRadius).toBe('10px');
  });

  it('data-theme=dark 切换颜色变量', async (host) => {
    await put(host, '<div data-theme="dark" id="darkbox"><ui-tag>t</ui-tag></div>');
    const bg = getComputedStyle(host.querySelector('#darkbox')).getPropertyValue('--ui-bg').trim();
    expect(bg).toBe('#0f1218');
  });
});
/* =========================================================
   第二～四批组件 + 本轮审查修复的回归用例
   ========================================================= */
import { notify } from './../components/more-overlay.js';

const kd = (el, k, extra) => el.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true }, extra || {})));
const shown = (el) => !!el && !el.hidden && getComputedStyle(el).display !== 'none';

describe('表单扩展', () => {
  it('ui-number 夹取到 [min,max] 并在边界禁用按钮', async (host) => {
    await put(host, '<ui-number value="12" min="1" max="10"></ui-number>');
    const n = host.querySelector('ui-number');
    expect(n.querySelector('input').value).toBe('10');
    expect(n.querySelector('[data-d="1"]').disabled).toBe(true);
    click(n.querySelector('[data-d="-1"]'));
    await tick(10);
    expect(n.getAttribute('value')).toBe('9');
  });

  it('ui-tag-input 回车添加（去重）、空输入 Backspace 删除最后一个', async (host) => {
    await put(host, '<ui-tag-input value="a,b"></ui-tag-input>');
    const t = host.querySelector('ui-tag-input');
    let inp = t.querySelector('input');
    inp.value = 'c'; kd(inp, 'Enter'); await tick(10);
    expect(t.getAttribute('value')).toBe('a,b,c');
    inp = t.querySelector('input'); inp.value = 'a'; kd(inp, 'Enter'); await tick(10);
    expect(t.getAttribute('value')).toBe('a,b,c');
    inp = t.querySelector('input'); inp.value = ''; kd(inp, 'Backspace'); await tick(10);
    expect(t.getAttribute('value')).toBe('a,b');
  });

  it('ui-otp 粘贴整串自动分配并派发 complete', async (host) => {
    await put(host, '<ui-otp length="4"></ui-otp>');
    const o = host.querySelector('ui-otp');
    let done = null;
    o.addEventListener('complete', (e) => { done = e.detail.value; });
    const dt = new DataTransfer(); dt.setData('text', '12-34');
    o.querySelector('input').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    await tick(10);
    expect(o.getAttribute('value')).toBe('1234');
    expect(done).toBe('1234');
  });

  it('ui-chips 多选切换 / single 单选互斥', async (host) => {
    await put(host, '<ui-chips items="A,B,C" value="A"></ui-chips><ui-chips single items="X,Y" value="X"></ui-chips>');
    const [m, s] = host.querySelectorAll('ui-chips');
    click(m.querySelector('[data-v="B"]')); await tick(10);
    expect(m.getAttribute('value')).toBe('A,B');
    click(s.querySelector('[data-v="Y"]')); await tick(10);
    expect(s.getAttribute('value')).toBe('Y');
  });

  it('ui-password 按规则计算强度 1-4', async (host) => {
    await put(host, '<ui-password></ui-password>');
    const p = host.querySelector('ui-password');
    const inp = p.querySelector('input');
    inp.value = 'abc'; inp.dispatchEvent(new Event('input'));
    expect(p.querySelector('.ui-pw').dataset.lv).toBe('1');
    inp.value = 'Abcdefg1!'; inp.dispatchEvent(new Event('input'));
    expect(p.querySelector('.ui-pw').dataset.lv).toBe('4');
  });

  it('ui-range 上下限颠倒时自动交换', async (host) => {
    await put(host, '<ui-range min="0" max="100" low="80" high="20"></ui-range>');
    const [a, b] = host.querySelectorAll('ui-range input');
    expect(a.value).toBe('20');
    expect(b.value).toBe('80');
  });

  it('ui-search 过滤联想并在回车时派发 search', async (host) => {
    await put(host, '<ui-search shortcut="" suggestions="北京,上海,杭州,苏州"></ui-search>');
    const s = host.querySelector('ui-search');
    let got = null;
    s.addEventListener('search', (e) => { got = e.detail.value; });
    const inp = s.querySelector('input');
    inp.value = '州'; inp.dispatchEvent(new Event('input')); await tick(10);
    expect(s._layer.el.querySelectorAll('[role="option"]').length).toBe(2);
    kd(inp, 'ArrowDown'); kd(inp, 'Enter'); await tick(10);
    expect(got).toBe('杭州');
    expect(shown(s._layer.el)).toBe(false);
  });

  it('ui-option-cards 单选方向键切换并同步 aria-checked', async (host) => {
    await put(host, `<ui-option-cards value="a" items='[{"value":"a","title":"A"},{"value":"b","title":"B"}]'></ui-option-cards>`);
    const oc = host.querySelector('ui-option-cards');
    kd(oc.querySelector('[data-v="a"]'), 'ArrowRight'); await tick(10);
    expect(oc.getAttribute('value')).toBe('b');
    expect(oc.querySelector('[data-v="b"]').getAttribute('aria-checked')).toBe('true');
  });

  it('ui-multi-select 勾选写回 value，关闭后面板真正隐藏', async (host) => {
    await put(host, '<ui-multi-select options="甲,乙,丙" value="乙"></ui-multi-select>');
    const ms = host.querySelector('ui-multi-select');
    ms.querySelector('.ui-pick__btn').click(); await tick(20);
    expect(shown(ms._layer.el)).toBe(true);
    click(ms._layer.el.querySelector('li[data-v="甲"]')); await tick(10);
    expect(ms.getAttribute('value')).toBe('甲,乙');
    ms._layer.hide();
    expect(shown(ms._layer.el)).toBe(false);
  });

  it('ui-cascader 选到叶子后关闭面板（回归：display:flex 覆盖 [hidden]）', async (host) => {
    await put(host, `<ui-cascader options='[{"label":"浙江","children":[{"label":"杭州"}]}]'></ui-cascader>`);
    const c = host.querySelector('ui-cascader');
    c.querySelector('.ui-pick__btn').click(); await tick(20);
    click(c._layer.el.querySelector('li[data-v="浙江"]')); await tick(10);
    click(c._layer.el.querySelector('li[data-v="杭州"]')); await tick(10);
    expect(c.getAttribute('value')).toBe('浙江/杭州');
    expect(shown(c._layer.el)).toBe(false);
  });

  it('ui-transfer 勾选后移到右侧并保持原始顺序', async (host) => {
    await put(host, '<ui-transfer options="A,B,C,D" value="D"></ui-transfer>');
    const t = host.querySelector('ui-transfer');
    const b = t.querySelector('[data-side="l"] input[value="B"]');
    b.checked = true; b.dispatchEvent(new Event('change'));
    expect(t.querySelector('[data-mv="r"]').disabled).toBe(false);
    click(t.querySelector('[data-mv="r"]')); await tick(10);
    expect(t.getAttribute('value')).toBe('B,D');
  });
});

describe('展示与导航扩展', () => {
  it('ui-carousel 下一张循环回到第一张', async (host) => {
    await put(host, `<ui-carousel slides='[{"title":"1"},{"title":"2"}]'></ui-carousel>`);
    const c = host.querySelector('ui-carousel');
    click(c.querySelector('[data-go="1"]')); await tick(10);
    expect(c.getAttribute('index')).toBe('1');
    click(c.querySelector('[data-go="1"]')); await tick(10);
    expect(c.getAttribute('index')).toBe('0');
  });

  it('ui-menu 父项展开、叶子派发 select', async (host) => {
    await put(host, `<ui-menu items='[{"label":"项目","children":[{"label":"进行中"}]}]'></ui-menu>`);
    const m = host.querySelector('ui-menu');
    let got = null;
    m.addEventListener('select', (e) => { got = e.detail.key; });
    click(m.querySelector('[data-k="0"]')); await tick(10);
    expect(m.querySelector('[data-k="0"]').getAttribute('aria-expanded')).toBe('true');
    click(m.querySelector('[data-k="0-0"]')); await tick(10);
    expect(got).toBe('0-0');
  });

  it('ui-navbar 汉堡按钮切换 aria-expanded', async (host) => {
    await put(host, '<div style="width:300px"><ui-navbar brand="X" items="A,B"></ui-navbar></div>');
    const nb = host.querySelector('ui-navbar');
    click(nb.querySelector('.ui-nb__burger')); await tick(10);
    expect(nb.querySelector('.ui-nb__burger').getAttribute('aria-expanded')).toBe('true');
    expect(nb.querySelector('nav').getAttribute('aria-label')).toBe('X 导航');
  });

  it('ui-table 每个单元格带 data-label（窄容器卡片模式用）', async (host) => {
    await put(host, `<ui-table columns='[{"key":"n","title":"名称"}]' rows='[{"n":"A"}]'></ui-table>`);
    expect(host.querySelector('td').getAttribute('data-label')).toBe('名称');
  });

  it('ui-calendar ↓ 跨月移动选中日并翻页', async (host) => {
    await put(host, '<ui-calendar month="2026-01" selected="2026-01-28"></ui-calendar>');
    const c = host.querySelector('ui-calendar');
    kd(c.querySelector('[data-date="2026-01-28"]'), 'ArrowDown'); await tick(10);
    expect(c.getAttribute('selected')).toBe('2026-02-04');
    expect(c.getAttribute('month')).toBe('2026-02');
  });

  it('ui-heatmap 空 data 时生成示例而不是只画一格（回归）', async (host) => {
    await put(host, '<ui-heatmap weeks="10"></ui-heatmap>');
    expect(host.querySelectorAll('.ui-heat__grid i').length).toBe(70);
  });

  it('图表收到非法 JSON 给出可读提示', async (host) => {
    await put(host, "<ui-bar-chart data='oops'></ui-bar-chart><ui-donut data='oops'></ui-donut><ui-funnel data='oops'></ui-funnel>");
    expect(host.textContent).toContain('JSON');
  });
});

describe('浮层扩展', () => {
  it('ui-command Ctrl+K 打开、过滤、回车执行并归还焦点', async (host) => {
    await put(host, `<button id="before">x</button><ui-command items='[{"label":"打开设置"},{"label":"新建项目"}]'></ui-command>`);
    const cmd = host.querySelector('ui-command');
    let got = null;
    cmd.addEventListener('select', (e) => { got = e.detail.label; });
    const before = host.querySelector('#before');
    before.focus();
    kd(document.body, 'k', { ctrlKey: true }); await tick(20);
    expect(shown(cmd._mask)).toBe(true);
    const inp = cmd._mask.querySelector('input');
    inp.value = '新建'; inp.dispatchEvent(new Event('input'));
    kd(inp, 'Enter'); await tick(20);
    expect(got).toBe('新建项目');
    expect(shown(cmd._mask)).toBe(false);
    expect(document.activeElement).toBe(before);
  });

  it('ui-popconfirm danger 默认聚焦取消；内联 onconfirm 可用（回归）', async (host) => {
    window.__pc = 0;
    await put(host, '<ui-popconfirm danger onconfirm="window.__pc++"><button>删</button></ui-popconfirm>');
    const pc = host.querySelector('ui-popconfirm');
    pc.querySelector('button').click(); await tick(20);
    expect(document.activeElement.dataset.r).toBe('cancel');
    click(pc._layer.el.querySelector('[data-r="ok"]')); await tick(10);
    expect(window.__pc).toBe(1);
    expect(shown(pc._layer.el)).toBe(false);
  });

  it('ui-split-button ↓ 打开菜单并聚焦第一项', async (host) => {
    await put(host, '<ui-split-button label="保存" items="草稿,模板"></ui-split-button>');
    const sb = host.querySelector('ui-split-button');
    kd(sb.querySelectorAll('button')[1], 'ArrowDown'); await tick(20);
    expect(document.activeElement.textContent).toContain('草稿');
    kd(document.activeElement, 'Escape'); await tick(10);
    expect(document.activeElement).toBe(sb.querySelectorAll('button')[1]);
  });

  it('uiNotify 插入通知，close() 后移除', async (host) => {
    await put(host, '');
    const n = notify({ title: '完成', type: 'success', duration: 0 });
    expect(document.querySelectorAll('#ui-notify-root .ui-ntf').length).toBeGreaterThan(0);
    n.close(); await tick(260);
    expect(n.el.isConnected).toBe(false);
  });
});

describe('无障碍与主题（本轮审查）', () => {
  it('ui-rate 的星星不再是嵌套在 slider 里的按钮', async (host) => {
    await put(host, '<ui-rate value="3"></ui-rate>');
    expect(host.querySelectorAll('[role="slider"] button').length).toBe(0);
  });

  it('ui-slider 的 input 与 label 关联', async (host) => {
    await put(host, '<ui-slider label="音量" value="5"></ui-slider>');
    const inp = host.querySelector('input');
    expect(inp.labels.length).toBe(1);
  });

  it('ui-code / ui-profile 不再占用 lang / role 全局属性', async (host) => {
    await put(host, '<ui-code language="js" code="x"></ui-code><ui-profile name="林" subtitle="设计师"></ui-profile>');
    expect(host.querySelector('.ui-code__hd').textContent).toContain('js');
    expect(host.querySelector('.ui-pf__r').textContent).toBe('设计师');
  });

  it('所有 .ui-layer[hidden] 都不可见（统一兜底）', async (host) => {
    await put(host, '');
    const bad = Array.from(document.querySelectorAll('.ui-layer[hidden]')).filter((e) => getComputedStyle(e).display !== 'none');
    expect(bad.length).toBe(0);
  });

  it('15 套风格 × 明暗：次要文字与品牌色对面板的对比度 ≥ 4.5', async (host) => {
    const styles = ['aurora', 'brutal', 'glass', 'mono', 'neumorph', 'clay', 'material', 'cyber', 'paper', 'retro', 'nord', 'luxury', 'bauhaus', 'candy', 'terminal'];
    const rgb = (c) => { const x = document.createElement('i'); x.style.color = c; host.appendChild(x); const m = getComputedStyle(x).color.match(/[\d.]+/g).map(Number); x.remove(); return m; };
    const L = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const over = (fg, bg) => { const a = fg[3] == null ? 1 : fg[3]; return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)); };
    const ratio = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const fails = [];
    for (const s of styles) for (const t of ['light', 'dark']) {
      host.innerHTML = '<div data-style="' + s + '" data-theme="' + t + '"></div>';
      const cs = getComputedStyle(host.firstChild);
      const v = (n) => rgb(cs.getPropertyValue('--ui-' + n).trim());
      const bg = v('bg'); const panel = over(v('panel'), bg); const p2 = over(v('panel-2'), panel);
      const r1 = Math.min(ratio(v('sub'), panel), ratio(v('sub'), p2));
      if (r1 < 4.5) fails.push(s + '/' + t + ' sub ' + r1.toFixed(2));
      if (s !== 'brutal') { const r2 = ratio(v('brand'), panel); if (r2 < 4.5) fails.push(s + '/' + t + ' brand ' + r2.toFixed(2)); }
      const r3 = ratio(v('brand-ink'), v('brand'));
      if (r3 < 4.5) fails.push(s + '/' + t + ' brand-ink ' + r3.toFixed(2));
    }
    expect(fails).toEqual([]);
  });
});

/* ---------------- 动效与视觉 ---------------- */
import { confetti } from './../components/motion.js';

/** 在「减少动效」模式下执行一段用例，结束后恢复 */
async function withReduced(fn) {
  const html = document.documentElement;
  const prev = html.getAttribute('data-motion');
  html.setAttribute('data-motion', 'reduce');
  try { await fn(); } finally { if (prev === null) html.removeAttribute('data-motion'); else html.setAttribute('data-motion', prev); }
}

describe('动效与视觉', () => {
  it('减少动效：reveal 立即显示、count-up 直接给终值、typewriter 显示第一句', async (host) => {
    await withReduced(async () => {
      await put(host, '<ui-reveal><p>A</p></ui-reveal><ui-count-up to="1234"></ui-count-up><ui-typewriter words="你好,世界"></ui-typewriter>');
      await tick(20);
      expect(host.querySelector('.ui-rv').classList.contains('is-in')).toBe(true);
      expect(host.querySelector('.ui-cu [aria-hidden]').textContent).toBe('1,234');
      expect(host.querySelector('.ui-tw__t').textContent).toBe('你好');
    });
  });

  it('减少动效：.ui-mo 内的动画时长被压到几乎为 0', async (host) => {
    await withReduced(async () => {
      await put(host, '<ui-gradient-border><p>x</p></ui-gradient-border>');
      const d = parseFloat(getComputedStyle(host.querySelector('.ui-gb')).animationDuration);
      expect(d < 0.01).toBe(true);
    });
  });

  it('减少动效：uiConfetti 不播放并返回 false', async (host) => {
    await put(host, '');
    await withReduced(async () => { expect(confetti()).toBe(false); });
    expect(document.querySelectorAll('body > canvas').length).toBe(0);
  });

  it('ui-count-up 读屏文本始终是最终值，千分位与前后缀正确', async (host) => {
    await put(host, '<ui-count-up to="1234.5" decimals="1" prefix="¥" suffix="万"></ui-count-up>');
    expect(host.querySelector('.ui-sr').textContent).toBe('¥1,234.5万');
  });

  it('ui-marquee 副本对读屏隐藏且内部链接不可 Tab', async (host) => {
    await put(host, '<ui-marquee><a href="#x" id="m1">链接</a></ui-marquee>');
    const groups = host.querySelectorAll('.ui-mq__g');
    expect(groups.length).toBe(2);
    expect(groups[1].getAttribute('aria-hidden')).toBe('true');
    expect(groups[1].querySelector('a').getAttribute('tabindex')).toBe('-1');
    expect(host.querySelectorAll('#m1').length).toBe(1);
  });

  it('ui-text-anim 拆字符时正确处理 emoji，读屏读完整文本', async (host) => {
    await put(host, '<ui-text-anim text="你好✨"></ui-text-anim>');
    expect(host.querySelector('.ui-sr').textContent).toBe('你好✨');
    expect(host.querySelectorAll('.ui-ta > span[aria-hidden]').length).toBe(3);
  });

  it('ui-flip-card 点击模式切换 aria-pressed，背面在未翻转时 inert', async (host) => {
    await put(host, '<ui-flip-card trigger="click"><div>正</div><div>反<button>b</button></div></ui-flip-card>');
    const box = host.querySelector('.ui-flip');
    const back = host.querySelector('.ui-flip__in > :nth-child(2)');
    expect(back.hasAttribute('inert')).toBe(true);
    click(box); await tick(10);
    expect(box.getAttribute('aria-pressed')).toBe('true');
    expect(back.hasAttribute('inert')).toBe(false);
  });

  it('ui-animate play() 重启动画；ui-ripple 按下时插入波纹', async (host) => {
    await put(host, '<ui-animate effect="shake"><span>x</span></ui-animate><ui-ripple><button>b</button></ui-ripple>');
    host.querySelector('ui-animate').play();
    expect(host.querySelector('.ui-an').classList.contains('is-on')).toBe(true);
    const btn = host.querySelector('ui-ripple button');
    host.querySelector('ui-ripple').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 5, clientY: 5 }));
    expect(btn.querySelectorAll('.ui-rp').length).toBe(1);
  });

  it('ui-loader 有 role=status 与可读名称', async (host) => {
    await put(host, '<ui-loader type="ring"></ui-loader>');
    const s = host.querySelector('[role="status"]');
    expect(s.getAttribute('aria-label')).toBe('加载中');
  });

  it('ui-particles 移除后停止动画循环（不泄漏）', async (host) => {
    await put(host, '<ui-particles count="10" height="80"></ui-particles>');
    const pt = host.querySelector('ui-particles');
    await tick(120);
    pt.remove();
    await tick(30);
    expect(pt.running).toBe(false);
  });
});

/* ---------------- 动效 / 视觉 第二批 ---------------- */
describe('动效与视觉（第二批）', () => {
  it('减少动效：scramble 直接显示原文，split-flap 直接翻到目标', async (host) => {
    await withReduced(async () => {
      await put(host, '<ui-scramble text="HELLO"></ui-scramble><ui-split-flap words="ABC,XYZ"></ui-split-flap>');
      host.querySelector('ui-scramble').play();
      expect(host.querySelector('.ui-scr__o').textContent).toBe('HELLO');
      host.querySelector('ui-split-flap').show('XYZ');
      expect(Array.from(host.querySelectorAll('.ui-sf__t')).map((t) => t.textContent).join('')).toBe('XYZ');
    });
  });

  it('rotating-text / glitch：读屏文本完整，视觉副本 aria-hidden', async (host) => {
    await put(host, '<ui-rotating-text words="甲,乙,丙"></ui-rotating-text><ui-glitch text="ERR"></ui-glitch>');
    expect(host.querySelector('.ui-rot .ui-sr').textContent).toBe('甲、乙、丙');
    expect(host.querySelectorAll('.ui-gl > [aria-hidden="true"]').length).toBe(3);
    expect(host.querySelector('.ui-gl .ui-sr').textContent).toBe('ERR');
  });

  it('ui-odometer 改 value 后读屏数值与列数同步', async (host) => {
    await put(host, '<ui-odometer value="999"></ui-odometer>');
    const o = host.querySelector('ui-odometer');
    o.setAttribute('value', '12345'); await tick(10);
    expect(o.querySelector('.ui-sr').textContent).toBe('12,345');
    expect(o.querySelectorAll('.ui-odo__c').length).toBe(5);
  });

  it('morph-icon / like-button / daynight 切换状态与 ARIA', async (host) => {
    await put(host, '<ui-morph-icon icon="menu"></ui-morph-icon><ui-like-button count="9"></ui-like-button><ui-daynight></ui-daynight>');
    click(host.querySelector('.ui-mi')); await tick(10);
    expect(host.querySelector('.ui-mi').getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('.ui-mi').getAttribute('aria-label')).toBe('关闭菜单');
    click(host.querySelector('.ui-like')); await tick(10);
    expect(host.querySelector('.ui-like').getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('.ui-like__n').textContent).toBe('10');
    click(host.querySelector('.ui-dn')); await tick(10);
    expect(host.querySelector('.ui-dn').getAttribute('aria-checked')).toBe('true');
  });

  it('ui-expand 点击后 aria-expanded=true 且高度变大', async (host) => {
    await put(host, '<ui-expand height="30"><p style="margin:0;line-height:20px">' + '内容'.repeat(200) + '</p></ui-expand>');
    await tick(40);
    const btn = host.querySelector('.ui-ex__btn');
    click(btn); await tick(20);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(parseFloat(host.querySelector('.ui-ex__body').style.height) > 30 || host.querySelector('.ui-ex__body').style.height === 'auto').toBe(true);
  });

  it('ui-card-stack 按钮滑走顶部卡，只有当前卡可交互', async (host) => {
    await put(host, '<ui-card-stack><div>A</div><div>B</div><div>C</div></ui-card-stack>');
    const cs = host.querySelector('ui-card-stack');
    let dir = null;
    cs.addEventListener('swipe', (e) => { dir = e.detail.dir; });
    click(cs.querySelector('[data-dir="right"]')); await tick(350);
    expect(dir).toBe('right');
    const live = Array.from(cs.querySelectorAll('.ui-cs__deck > div')).filter((c) => !c.classList.contains('is-gone'));
    expect(live[0].textContent).toBe('B');
    expect(live[1].hasAttribute('inert')).toBe(true);
  });

  it('ui-swap go() 只显示一项，其余 inert', async (host) => {
    await put(host, '<ui-swap interval="0"><p>1</p><p>2</p><p>3</p></ui-swap>');
    const sw = host.querySelector('ui-swap');
    sw.go(1);
    const ps = sw.querySelectorAll('.ui-sw__stage > p');
    expect(ps[1].classList.contains('is-on')).toBe(true);
    expect(ps[0].hasAttribute('inert') && ps[2].hasAttribute('inert')).toBe(true);
  });

  it('ui-image-compare 用原生 range，拖动同步分隔线位置', async (host) => {
    await put(host, '<ui-image-compare demo="1"></ui-image-compare>');
    const r = host.querySelector('input[type="range"]');
    r.value = '30'; r.dispatchEvent(new Event('input'));
    expect(host.querySelector('.ui-ic').style.getPropertyValue('--pos')).toBe('30%');
  });

  it('3D 立方体与融合液滴有实际尺寸（回归：span 宽高失效）', async (host) => {
    await put(host, '<ui-cube size="80"></ui-cube><ui-gooey size="100"></ui-gooey>');
    expect(host.querySelector('.ui-cube').offsetWidth).toBe(80);
    expect(host.querySelector('.ui-goo').offsetWidth).toBe(100);
  });

  it('多个 ui-gooey 的 SVG 滤镜 id 不冲突', async (host) => {
    await put(host, '<ui-gooey></ui-gooey><ui-gooey></ui-gooey>');
    const ids = Array.from(host.querySelectorAll('filter')).map((f) => f.id);
    expect(ids.length).toBe(2);
    expect(ids[0] !== ids[1]).toBe(true);
  });

  it('星空 / 飘雪按 seed 生成，同一 seed 结果一致', async (host) => {
    await put(host, '<ui-starfield seed="7" count="20"></ui-starfield><ui-starfield seed="7" count="20"></ui-starfield>');
    const s = host.querySelectorAll('.ui-star > span[aria-hidden]');
    expect(s[0].innerHTML).toBe(s[1].innerHTML);
  });
});
