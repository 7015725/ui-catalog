/* =========================================================
   动效第三批（6 个）：展开 / 跟手类交互
   叠放展开、进度清单、横向手风琴、托盘明细、放大坞、下拉摘要
   ========================================================= */
const R = '【减少动效】系统开启「减少动态效果」或 <html data-motion="reduce"> 时，';
const j = (v) => JSON.stringify(v).replace(/'/g, '&#39;');
const M = (id, tag, name, brief, demo, ai, design, wide) => ({ id: id, tag: tag, name: name, cat: '动效', brief: brief, demo: demo, ai: ai, design: design, wide: !!wide });
const out = (id, txt) => '<div id="' + id + '" style="font-size:12.5px;color:var(--ui-sub);min-height:1.4em">' + (txt || '') + '</div>';

const TEAM = ['林晓', '陈默', '王一', '赵青', '周舟', '吴桐', '郑言', '孙悦'];
const CHECK = [{ text: '补全商品主图' }, { text: '填写售后政策', done: true }, { text: '设置运费模板', done: true }, { text: '提交资质审核' }, { text: '预约上线时间' }];
const SEASONS = [
  { title: '春 · 发芽', sub: '3–5 月', body: '新用户注册量回升，适合推出新手任务和邀请奖励。', tone: 'ok' },
  { title: '夏 · 生长', sub: '6–8 月', body: '活跃度全年最高，集中上线大版本与会员活动。', tone: 'warn' },
  { title: '秋 · 收获', sub: '9–11 月', body: '复盘转化漏斗，清理低效渠道，准备年度报告。', tone: 'accent' },
  { title: '冬 · 储备', sub: '12–2 月', body: '降低发布频率，偿还技术债，规划来年路线图。', tone: 'brand' }
];
const BILL = [{ label: '商品金额', value: '¥ 248.00' }, { label: '运费', value: '¥ 12.00' }, { label: '优惠券', value: '− ¥ 20.00' }, { label: '实付', value: '¥ 240.00' }];
const DOCK = [{ icon: '🏠', label: '首页' }, { icon: '🔍', label: '搜索' }, { icon: '💬', label: '消息' }, { icon: '📅', label: '日程' }, { icon: '📁', label: '文件' }, { icon: '🎵', label: '音乐' }, { icon: '⚙️', label: '设置' }];
const STATS = [{ label: '订单', value: '128', sub: '较昨日 +12%' }, { label: '待发货', value: '3', sub: '最早 2 小时前' }, { label: '退款', value: '1', sub: '待审核' }, { label: '营业额', value: '¥ 9,420', sub: '目标 78%' }];

export const motionCatalog3 = [
  M('stack-expand', 'ui-stack-expand', '叠放展开', '互相压住三分之一的叠放头像，点击依次散开并显示名称',
    '<div style="display:flex;flex-direction:column;gap:14px;width:100%">' +
    '<ui-stack-expand label="项目成员" items="' + TEAM.join(',') + '" ontoggle="document.getElementById(\'sx-out\').textContent=\'toggle 事件：\'+(event.detail.open?\'展开\':\'收起\')"></ui-stack-expand>' +
    '<ui-stack-expand label="评审人" size="32" max="3" items=\'' + j([{ name: 'Alice', tone: 'accent' }, { name: 'Bob', tone: 'ok' }, { name: 'Carol', tone: 'warn' }]) + '\'></ui-stack-expand>' +
    out('sx-out') + '</div>',
    '【组件】叠放展开 <ui-stack-expand>\n' +
    '【用途】在一行里用最小宽度表示「一组人 / 一组对象」，需要时再展开看清是谁\n' +
    '【属性】items 逗号分隔的名称，或 JSON [{name, short?, tone?}]（tone: brand | accent | ok | warn | danger，默认按顺序轮换）；max 收起时最多显示几个，默认 4；size 圆形直径 px，默认 40；label 读屏前缀，默认「成员」；open 初始展开\n' +
    '【视觉】圆形底色 = 该项 tone 与 --ui-panel 按 26% 混合，文字 --ui-text；每个圆外圈 2px --ui-panel 描边做分隔；相邻圆左外边距为 -size/3（压住三分之一）；末尾「+N」圆用 --ui-panel-2 底、--ui-sub 字；展开后每项变成 --ui-panel-2 胶囊：圆 + 名称\n' +
    '【交互】整个组件是一个按钮（aria-expanded）。点击 / Enter / Space：展开时各项从左到右依次（每项延迟 45ms）把重叠外边距过渡到 6px 间距，名称宽度从 0 展开并淡入，超出 max 的项也依次出现，「+N」收缩消失；再次点击按相反顺序收回。派发 toggle（detail: open, count）；方法 toggle(force?)；读屏名称为「label，共 N 人：全部名称」\n' +
    R + '直接切换到终态，不做依次延迟\n' +
    '【约束】1) 只展示名称，不在里面放其他可点击元素；2) 超过 12 项改用列表或弹出层；3) 窄容器里展开后自动换行，不得横向溢出',
    { purpose: '收起时省地方、展开时说清楚，同一处完成「概览 → 明细」。', when: ['项目成员、参与者、评审人', '已选标签、共享对象的折叠展示'], avoid: ['每个人都需要单独操作（如移除）的场景，改用标签输入', '人数上百的列表'], tips: ['名称较长时控制 max，避免展开后换太多行'] }),

  M('checklist', 'ui-checklist', '进度清单', '用背景填充宽度表示完成进度，全部完成时整体提亮',
    '<div style="display:flex;flex-direction:column;gap:8px;width:100%">' +
    '<ui-checklist title="店铺上线检查" items=\'' + j(CHECK) + '\' onchange="document.getElementById(\'ck-out\').textContent=\'change 事件：\'+event.detail.count+\'/\'+event.detail.total+(event.detail.complete?\'，全部完成\':\'\')"></ui-checklist>' +
    out('ck-out', '勾完最后两项，看填充推到底并整体提亮') + '</div>',
    '【组件】进度清单 <ui-checklist>\n' +
    '【用途】把「清单」和「进度条」合二为一：不额外占一行进度条，背景本身就是进度\n' +
    '【属性】items 逗号分隔的事项，或 JSON [{text, done?}]；done 逗号分隔的已完成下标（如 "0,2"），与 JSON 里的 done 合并；title 标题，默认「完成进度」\n' +
    '【视觉】容器 --ui-panel 底、--ui-line 边框；底层填充块宽度 = 完成比例，颜色 --ui-brand 13% 透明混合，右边缘 2px --ui-brand 45% 内描边作为「推进线」；标题右侧显示「已完成 / 总数 · 百分比」（等宽数字）；已勾选事项加 --ui-sub 删除线；全部完成时边框混入 --ui-ok，外加 3px --ui-ok 20% 光晕，填充改为 --ui-ok 15%，整体 brightness(1.05) 轻微提亮\n' +
    '【交互】每项是原生 checkbox + label（accent-color: --ui-brand），点击文字也能勾选，Tab / Space 可完成全部操作；勾选或取消 → 填充宽度用 0.7s --ui-ease 平滑推进或回退；派发 change（detail: done 下标数组, count, total, complete）；首次全部完成时额外派发 complete；状态通过 role=status 播报「已完成 3 / 5」或「全部完成」；只读属性 value（已完成下标）、progress（0–1）\n' +
    R + '填充和提亮直接到终态\n' +
    '【约束】1) 事项 3–8 条为宜；2) 填充色只能是浅色混合，不得压低文字对比度；3) 不得只靠颜色表达完成，必须保留勾选框和计数',
    { purpose: '让完成度在扫一眼时就能感知，同时保持清单的可操作性。', when: ['上线 / 发布前检查', '新手引导任务、资料完善度'], avoid: ['事项需要分组、排序或带子任务（用树或看板）', '进度来自后台计算、用户不能勾选的场景（用进度条）'] }),

  M('h-accordion', 'ui-h-accordion', '横向手风琴', '等宽窄条，点击一条变宽显示详情，其余同步收窄',
    '<div style="display:flex;flex-direction:column;gap:8px;width:100%">' +
    '<ui-h-accordion height="230" items=\'' + j(SEASONS) + '\' onchange="document.getElementById(\'ha-out\').textContent=\'change 事件：index = \'+event.detail.index"></ui-h-accordion>' +
    out('ha-out', '点任意一条展开；再点一次收回等宽') + '</div>',
    '【组件】横向手风琴 <ui-h-accordion>\n' +
    '【用途】在一块固定高度里并排放 3–6 个主题，默认只露标题，点开一个看详情\n' +
    '【属性】items JSON [{title, sub?, body?, tone?}]（也可逗号分隔只给标题）；active 初始展开下标，默认 -1（全部等宽）；height 高度 px，默认 240（140–600）\n' +
    '【视觉】每条 --ui-radius-lg 圆角、--ui-line 边框，底色 = 该条 tone 10% 混入 --ui-panel-2；窄条顶部是两位序号（等宽字体），中间是竖排标题，底部是 tone 色小圆点；展开条底色换成 tone 14% 混入 --ui-panel；详情区：大标题、tone 18% 底的副标题胶囊、正文 --ui-text\n' +
    '【交互】每条是一个按钮（aria-expanded / aria-controls），详情区 role=region。点击：被点的条 flex-grow 从 1 过渡到 5，其余同步收窄（0.55s --ui-ease）；竖排标题先淡出，详情在 0.32s 延迟后淡入上移；点已展开的条 → 全部收回等宽；←→ / ↑↓ / Home / End 在条之间移动焦点，Enter / Space 展开；派发 change（detail.index，收回时为 -1）；方法 select(i)\n' +
    '【自适应】容器宽度 < 480px 时改为纵向列表：每条一行（序号 + 横排标题），展开项在下方显示详情\n' +
    R + '宽度与详情直接切换，不做延迟淡入\n' +
    '【约束】1) 3–6 条；2) 标题 ≤ 8 字（竖排太长会被截断）；3) 详情区只放文字，不放可点击元素；4) 不得用于需要同时比较多条内容的场景',
    { purpose: '用很小的面积预告多个主题，并让展开的那一个成为视觉焦点。', when: ['产品特性、季度规划、服务套餐的分段介绍', '作品集分类入口'], avoid: ['需要同时比较内容（用卡片网格或表格）', '条目超过 6 个'] }, true),

  M('tray', 'ui-tray', '托盘明细', '主卡片下垫一层深灰托盘，点击向下展开明细，主卡片不动',
    '<div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:360px">' +
    '<ui-tray summary="4 项费用明细" items=\'' + j(BILL) + '\' ontoggle="document.getElementById(\'tr-out\').textContent=\'toggle 事件：\'+(event.detail.open?\'展开\':\'收起\')">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><div style="font-size:12px;color:var(--ui-sub)">订单 #20261109</div>' +
    '<div style="font-size:22px;font-weight:800;margin-top:2px">¥ 240.00</div></div><ui-tag variant="success">已支付</ui-tag></div></ui-tray>' +
    out('tr-out') + '</div>',
    '【组件】托盘明细 <ui-tray>\n' +
    '【用途】主信息保持原位，次要明细收在下方托盘里，需要时再拉出来\n' +
    '【属性】默认插槽放主卡片内容；summary 托盘露出的那一行文字，默认「查看明细」；items JSON [{label, value}] 或逗号分隔的「名称:值」；open 初始展开\n' +
    '【视觉】主卡片 --ui-panel 底、--ui-radius-lg、z-index 高于托盘；托盘比主卡片左右各窄 10px，顶部用负外边距藏到主卡片下面（藏入深度 = --ui-radius-lg），只露出一行；托盘底色 = --ui-panel-2 与纯黑按 20 : 80 混合（任何风格、明暗下都是深灰），文字 = --ui-panel-2 与纯白按 10 : 90 混合，次要文字 32 : 68；明细行之间是托盘文字色 16% 的分隔线\n' +
    '【交互】露出的那一行是按钮（aria-expanded / aria-controls）。点击 / Enter / Space：托盘高度用 grid-template-rows 0fr → 1fr 向下展开（0.45s），箭头旋转 180°，明细行依次（每行 45ms）下移淡入；主卡片位置保持不动，只有托盘下方的内容被推开；再次点击收回；派发 toggle（detail.open）；方法 toggle(force?)\n' +
    R + '直接展开 / 收起\n' +
    '【约束】1) 托盘里只放「看了更清楚、不看也能完成任务」的信息；2) 明细 ≤ 8 行；3) 不要在托盘里再嵌套托盘',
    { purpose: '用物理隐喻（抽屉 / 托盘）把明细放在主信息「下面」，层级一目了然。', when: ['订单金额下的费用明细', '统计卡片下的口径说明、分项数据'], avoid: ['明细是用户必须核对的内容（直接展示）', '主卡片本身需要频繁变高（托盘会跟着跳动）'] }),

  M('dock', 'ui-dock', '放大坞', '跟随手指放大的图标栏，按距离平滑缩放，松手选中',
    '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%">' +
    '<ui-dock value="0" items=\'' + j(DOCK) + '\' onselect="document.getElementById(\'dk-out\').textContent=\'select 事件：\'+event.detail.label"></ui-dock>' +
    out('dk-out', '鼠标划过或手指按住滑动，松手选中') + '</div>',
    '【组件】放大坞 <ui-dock>\n' +
    '【用途】一排常用入口：平时紧凑，手指 / 鼠标经过时把附近的图标放大，方便看清和点准\n' +
    '【属性】items JSON [{icon, label, tone?}]，或逗号分隔的「图标 名称」；size 基础尺寸 px，默认 44（28–72）；magnify 最大放大倍数，默认 1.8（1–2.5）；value 初始选中下标，默认不选；label 工具栏名称，默认「应用栏」\n' +
    '【视觉】底座是 --ui-panel 86% 半透明 + --ui-blur 毛玻璃 + --ui-shadow，圆角随图标尺寸；图标为 28% 圆角方块，底色 = 该项 tone 24% 混入 --ui-panel；选中项下方 5px --ui-text 圆点；当前最近的图标上方显示 --ui-text 底、--ui-bg 字的名称气泡；组件顶部预留放大所需的空间，放大不会推动上方内容\n' +
    '【交互】role=toolbar，图标是按钮（aria-pressed，名称放在视觉隐藏文字里）。鼠标移动 / 手指按住滑动：每个图标尺寸 = 基础 × (1 + (倍数−1) × (cos(距离 / 半径 × π) + 1) / 2)，半径约 2.6 个图标，用 requestAnimationFrame 节流；改的是实际宽高，相邻图标自然让位；松手（pointerup）→ 选中离手指最近的图标，派发 select（detail: index, label），并播报「已选中 X」；鼠标离开 → 全部回到基础尺寸；键盘：Tab 进入，←→ / Home / End 移动焦点并以焦点图标为中心放大，Enter / Space 选中\n' +
    '【自适应】容器变窄时自动缩小基础尺寸，保证放大后不横向溢出\n' +
    R + '取消尺寸过渡，图标直接到目标大小\n' +
    '【约束】1) 4–8 个图标；2) 每个图标都必须有 label；3) 只做导航 / 切换入口，不放危险操作；4) 放大只是辅助，按钮本身必须可直接点击',
    { purpose: '在有限宽度里放下一排入口，同时用放大反馈帮助用户「瞄准」。', when: ['桌面式应用的启动栏', '创作工具的工具切换栏'], avoid: ['后台表单页（会分散注意力）', '图标含义不直观、必须读文字才懂的入口'] }, true),

  M('pull-summary', 'ui-pull-summary', '下拉摘要', '收起是一行胶囊，下拉跟手展开成统计面板，下方内容下移变暗',
    '<div style="width:100%">' +
    '<ui-pull-summary summary="今日 · 3 单待发货" items=\'' + j(STATS) + '\' ontoggle="document.getElementById(\'ps-out\').textContent=\'toggle 事件：\'+(event.detail.open?\'展开\':\'收起\')">' +
    '<ui-list items=\'' + j([{ title: '订单 #1093 · 已付款', desc: '2 件商品 · 杭州' }, { title: '订单 #1092 · 待发货', desc: '1 件商品 · 成都' }, { title: '订单 #1091 · 已完成', desc: '3 件商品 · 广州' }]) + '\'></ui-list>' +
    '</ui-pull-summary>' + out('ps-out', '按住胶囊向下拖，或直接点击') + '</div>',
    '【组件】下拉摘要 <ui-pull-summary>\n' +
    '【用途】页面顶部常驻一句话摘要，需要时下拉看完整统计，不跳页、不占常驻空间\n' +
    '【属性】默认插槽放下方的页面内容；summary 胶囊文字（也是面板的名称），默认「今日概览」；items JSON [{label, value, sub?}] 或逗号分隔的「名称:值」；open 初始展开；dim 展开时下方内容的最大变暗程度 0–0.8，默认 0.45\n' +
    '【视觉】胶囊高 40px、居中、完全圆角，--ui-panel 底、--ui-line 边框、--ui-shadow；左侧 --ui-brand 小圆点（外圈 22% 光晕），右侧箭头；展开后胶囊横向撑满容器、向下长高成面板，圆角从胶囊过渡到 --ui-radius-lg；面板内统计卡 --ui-panel-2 底，标签和说明 --ui-sub，数值 22px 粗体等宽数字；底部 36×4 的 --ui-line 拖动条；下方内容上盖一层纯黑遮罩，透明度 = dim × 展开进度\n' +
    '【交互】胶囊是按钮（aria-expanded / aria-controls），面板 role=region。按住胶囊向下拖：展开进度 = 下拉距离 / 面板高度，宽度、高度、圆角、面板透明度、遮罩透明度都按进度实时插值（跟手，无过渡）；下方内容随高度同步下移；松手时进度 > 0.35（已展开时向上拖到 < 0.65）则吸附到展开，否则回弹收起（弹性曲线 0.5s）；直接点击 / Enter / Space 切换；↓ 展开、↑ 收起；Esc 或点变暗区域 → 收起并把焦点还给胶囊；派发 toggle（detail.open）；方法 toggle(force?)\n' +
    R + '取消吸附过渡，直接到展开 / 收起终态；拖动仍然跟手\n' +
    '【约束】1) 统计项 2–6 个；2) 一个页面只放一个；3) 摘要文字 ≤ 16 字，必须是最关键的一条信息；4) 面板里不放表单',
    { purpose: '把「看一眼」和「看全部」放在同一个位置，下拉这个动作本身就表达了层级。', when: ['移动端或窄栏页面顶部的当日概览', '订单列表、工单列表上方的统计'], avoid: ['统计需要常驻对比（直接放统计卡）', '页面本身已有下拉刷新（手势冲突）'], tips: ['摘要写成「状态 + 数字」，例如「今日 · 3 单待发货」'] }, true)
];
