/* =========================================================
   界面模板 · JS 绘制（Canvas，3 个）
   界面主体画在 <canvas> 上（ui-cv-* 组件），外面只留少量 DOM：工具栏、状态说明
   颜色同样来自 var(--ui-*)，切换风格 / 明暗时画布会自动重画
   ========================================================= */

const KEYS_NOTE = 'Canvas 本身没有可访问的 DOM：画布可聚焦（Tab），全部操作都有键盘方式，状态变化写进视觉隐藏的 aria-live 区域';

/* ---------------- 1. 数据大屏 ---------------- */
const dash = {
  id: 'cvdash', name: '监控数据大屏', cat: 'JS 绘制', frame: 'browser', fit: true, url: 'screen.example.com/ops',
  brief: '整块画在 Canvas 上：指标块 + 点位地图（告警脉冲）+ 实时曲线 + 事件列表；点击点位派单处理',
  uses: ['ui-cv-dash', 'ui-tag', 'ui-kbd'],
  html: `<div class="t-screen t-cvdash">
<div class="t-cvdash__bar"><ui-tag variant="danger" look="dot" data-alarm>实时告警</ui-tag><span class="t-sub" data-log aria-live="polite">点地图上的红点，或聚焦画布后按 <ui-kbd keys="→"></ui-kbd> 切换、<ui-kbd keys="Enter"></ui-kbd> 派单</span></div>
<ui-cv-dash title="城市运行监控中心"></ui-cv-dash>
</div>`,
  css: `
.t-cvdash{height:auto;padding:14px;gap:10px}
.t-cvdash__bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:12.5px}`,
  init(root) {
    const log = root.querySelector('[data-log]');
    const screen = root.querySelector('ui-cv-dash');
    /* 画布里的交互通过自定义事件告诉外面的 DOM */
    screen.addEventListener('select', function (e) {
      log.textContent = '已选中：' + e.detail.name + (e.detail.status === 'ok' ? '（正常）' : '（' + (e.detail.status === 'danger' ? '告警' : '预警') + '，点「派单处理」）');
    });
    screen.addEventListener('resolve', function (e) {
      log.textContent = '✓ ' + e.detail.name + ' 已派单处理';
      if (window.uiToast) window.uiToast(e.detail.name + ' 已派单');
    });
  },
  ai: `【模板】监控数据大屏 · JS 绘制（Canvas 2D，响应式，可放进任意宽度容器）
【页面目标】值班人员一眼看到「哪里有问题」，并能直接在大屏上派单处理
【实现方式】整块界面画在一个 <canvas> 里（ui-cv-dash）；外面只有一行 DOM 状态条。颜色全部从 getComputedStyle 读取 --ui-* 变量，监听 <html> 的 data-style / data-theme 变化后重画；按 devicePixelRatio 绘制保证清晰
【画面结构】顶部：标题 + 右侧实时时钟（等宽字体）+ 一条品牌色分隔线
  宽屏三栏（28% | 44% | 28%）：
  左：2×2 指标块（在线设备 / 当前告警 / 今日处理 / 平均响应，左侧 3px 语义色竖条）+ 「各区告警数」横向胶囊条形图（超过阈值变 danger）
  中：点位地图（网格 + 一条河 + 两条主干道做方位感），点位按状态着色 ok / warn / danger，告警点有向外扩散的脉冲圈；右上角图例
  右：实时流量面积曲线（每秒推进一格，右上角显示当前值）+ 最新事件列表（斑马纹、时间等宽、超长省略）
  窄屏（< 700px）：按 指标 → 地图 → 曲线 → 条形图 → 事件 纵向堆叠，画布高度随之变高
【操作逻辑】
  1) 悬停点位 → 光标变手型并显示浮层（名称、状态、设备数）
  2) 点击点位 → 选中（外圈品牌色描边）；如果是告警 / 预警，浮层里出现「派单处理」按钮
  3) 点按钮或按 Enter → 该点位变正常、「当前告警」-1、「今日处理」+1、事件列表顶部插入「已派单处理」
  4) 键盘：画布获得焦点后 ←→↑↓ 循环切换点位，Enter 处理，Esc 取消选中
  5) 组件派发 select / resolve 事件，外部 DOM（状态条、轻提示）据此更新
【性能】用 requestAnimationFrame 循环，画布离开视口或标签页隐藏时停止；减少动效模式下不画脉冲、曲线不推进
【无障碍】${KEYS_NOTE}；canvas role=application + aria-roledescription="数据大屏" + 说明按键的 aria-label
【约束】1) 不用图表库，全部手写 Canvas 2D；2) 所有颜色、圆角、字体来自 --ui-* 变量；3) 文字最小 11px；4) 告警色只用于真正的告警`,
  design: {
    purpose: '大屏的本质是「异常优先」：正常的东西安静，异常的东西会动、会闪、能直接处理。用 Canvas 画可以在一块画布上做出连贯的动效和大量元素。',
    when: ['监控中心、指挥调度、运维值班大屏', '物联网设备分布、门店 / 车辆实时态势', '需要大量动态元素、DOM 会太重的可视化'],
    avoid: ['需要复制文字、被搜索引擎收录的内容', '以表单输入为主的界面（输入框请用 DOM）'],
    tips: ['先画布局网格，再往格子里放模块，宽窄屏只换布局表', '动效只给异常：脉冲、闪烁都留给告警', 'Canvas 不可访问，一定要补键盘操作和 aria-live 播报']
  }
};

/* ---------------- 2. 游戏主菜单 / HUD ---------------- */
const game = {
  id: 'cvgame', name: '游戏菜单 / HUD', cat: 'JS 绘制', frame: 'browser', fit: true, url: 'play.example.com',
  brief: 'Canvas 状态机：主菜单 → 游戏（HUD：分数、时间、生命、暂停）→ 暂停 → 结束',
  uses: ['ui-cv-game', 'ui-kbd'],
  html: `<div class="t-screen t-cvgame">
<ui-cv-game title="STAR RUNNER"></ui-cv-game>
<div class="t-cvgame__keys t-sub"><span>当前场景：<b data-scene aria-live="polite">主菜单</b></span><span><ui-kbd keys="↑"></ui-kbd><ui-kbd keys="↓"></ui-kbd> 选择</span><span><ui-kbd keys="Enter"></ui-kbd> 确认</span><span><ui-kbd keys="←"></ui-kbd><ui-kbd keys="→"></ui-kbd> 移动</span><span><ui-kbd keys="P"></ui-kbd> 暂停</span></div>
</div>`,
  css: `
.t-cvgame{height:auto;padding:14px;gap:10px}
.t-cvgame__keys{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center}
.t-cvgame__keys b{color:var(--ui-text)}`,
  init(root) {
    const NAMES = { menu: '主菜单', help: '操作说明', play: '游戏中', pause: '暂停', over: '游戏结束' };
    const label = root.querySelector('[data-scene]');
    /* 游戏内部是一个状态机，每次切换场景都会派发 scene 事件 */
    root.querySelector('ui-cv-game').addEventListener('scene', function (e) {
      label.textContent = NAMES[e.detail.scene] || e.detail.scene;
    });
  },
  ai: `【模板】游戏主菜单 + HUD · JS 绘制（Canvas 2D）
【页面目标】演示「画出来的界面」如何做导航和状态：菜单、按钮、悬停、选中、弹层，全部在画布里完成
【实现方式】一个 <canvas>（ui-cv-game），内部用状态机管理场景：menu → help / play → pause → over → menu；每个场景有自己的 draw 和输入处理；按钮是「矩形 + 命中检测」，不是 DOM
【画面结构】
  背景：从 --ui-bg 到淡品牌色的竖向渐变 + 视差星空（三层速度）
  主菜单：标题（品牌色发光描边）+ 副标题 + 3 个竖排按钮（开始游戏 / 操作说明 / 最高分），当前项品牌色实底并带 ▶；底部按键提示
  游戏中 HUD：左上角分数卡（SCORE + 等宽数字）、顶部中间计时、右上角 ♥ 生命和 ❚❚ 暂停按钮；底部是玩家飞船，星星（warn 色，+10）和陨石（danger 色，-1 命）从上往下掉
  暂停 / 结束：半透明遮罩 + 标题 + 2 个按钮（继续 / 返回菜单，再来一局 / 返回菜单）
【操作逻辑】
  1) 鼠标悬停按钮 → 高亮该项；点击或 Enter → 跳转对应场景
  2) ↑↓ 在当前场景的按钮间循环；Esc 返回上一级（暂停时 Esc = 继续）
  3) 游戏中：← → / A D 持续按住移动，或按住画布拖动；P / Esc / 点 ❚❚ 暂停
  4) 生命为 0 → 结束场景，记录最高分；难度随时间缓慢上升
  5) 每次切换场景派发 scene 事件，外部 DOM 显示当前场景
【性能】只在画布可见时运行循环；减少动效模式下菜单背景静止（游戏本身由用户主动开始，正常运行）
【无障碍】${KEYS_NOTE}；菜单项切换时播报「开始游戏」等文字
【约束】1) 按钮至少 44px 高，命中区域与绘制区域一致；2) 颜色只来自 --ui-* 变量，换风格整套游戏 UI 跟着变；3) 文本居中对齐用 textAlign / textBaseline，别手算`,
  design: {
    purpose: '游戏、互动展示、可视化编辑器这类界面常常整体用 Canvas 绘制。关键是把「界面」拆成场景状态机 + 可命中的按钮，像做 DOM 界面一样清楚。',
    when: ['H5 小游戏、互动营销页', '需要 60fps 动画的展示界面', '自绘 UI 的嵌入式 / 大屏终端'],
    avoid: ['普通业务表单和设置页', '需要读屏、复制、翻译的长文本'],
    tips: ['每个场景一个 draw + 一个输入处理，状态机比 if 堆栈好维护', 'HUD 放四角，中间留给玩法', '暂停时必须停掉游戏逻辑，只重画遮罩']
  }
};

/* ---------------- 3. 白板画布 ---------------- */
const board = {
  id: 'cvboard', name: '白板 / 画布编辑器', cat: 'JS 绘制', frame: 'browser', fit: true, url: 'board.example.com/flow',
  brief: 'DOM 工具栏 + Canvas 画布：平移缩放、拖拽便签、拉线连接、双击编辑、键盘全操作',
  uses: ['ui-cv-board', 'ui-segmented', 'ui-button', 'ui-kbd'],
  html: `<div class="t-screen t-cvboard">
<div class="t-cvboard__bar">
<ui-segmented items="选择,便签,连线" value="选择"></ui-segmented>
<span class="t-cvboard__sep" aria-hidden="true"></span>
<ui-button size="sm" data-act="add">＋ 便签</ui-button><ui-button size="sm" data-act="color">换色</ui-button><ui-button size="sm" data-act="del" variant="danger">删除</ui-button>
<span class="t-flex1"></span>
<ui-button size="sm" data-act="out">缩小</ui-button><ui-button size="sm" data-act="in">放大</ui-button><ui-button size="sm" data-act="fit">适应画布</ui-button>
</div>
<ui-cv-board></ui-cv-board>
<div class="t-cvboard__tip t-sub"><span data-status aria-live="polite">选中便签后可以拖动、删除或换色</span><span>双击编辑 · 拖空白处平移 · <ui-kbd keys="Ctrl"></ui-kbd> + 滚轮缩放 · <ui-kbd keys="["></ui-kbd><ui-kbd keys="]"></ui-kbd> 切换 · <ui-kbd keys="N"></ui-kbd> 新建</span></div>
</div>`,
  css: `
.t-cvboard{height:auto;padding:14px;gap:10px}
.t-cvboard__bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:6px;border-radius:var(--ui-radius-lg);
  background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);box-shadow:var(--ui-shadow-sm)}
.t-cvboard__sep{width:1px;height:22px;background:var(--ui-line);margin:0 4px}
.t-cvboard__tip{display:flex;justify-content:space-between;gap:6px 16px;flex-wrap:wrap}
@container tpl (max-width:560px){ .t-cvboard__sep,.t-cvboard .t-flex1{display:none} }`,
  init(root) {
    const board = root.querySelector('ui-cv-board');
    const seg = root.querySelector('ui-segmented');
    const status = root.querySelector('[data-status]');
    const TOOL = { 选择: 'select', 便签: 'note', 连线: 'link' };
    const NAME = { select: '选择', note: '便签', link: '连线' };
    const HELP = { select: '拖动便签移动位置，拖空白处平移画布', note: '点击空白处放一张便签', link: '从一张便签拖到另一张，建立连线' };
    /* 工具栏 → 画布 */
    seg.addEventListener('change', function (e) { board.setTool(TOOL[e.detail.value]); status.textContent = HELP[TOOL[e.detail.value]]; });
    root.querySelector('.t-cvboard__bar').addEventListener('click', function (e) {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'add') board.addNote();
      if (act === 'color') board.recolor();
      if (act === 'del') board.remove();
      if (act === 'in') board.zoom(1.2);
      if (act === 'out') board.zoom(1 / 1.2);
      if (act === 'fit') board.fit();
    });
    /* 画布 → 工具栏：放完便签自动切回「选择」；选中状态写到状态条 */
    board.addEventListener('tool', function (e) { seg.setAttribute('value', NAME[e.detail.tool]); });
    board.addEventListener('change', function (e) {
      if (!e.detail || e.detail.nodes === undefined) return; /* 忽略编辑框冒上来的原生 change */
      status.textContent = e.detail.selected ? '已选中「' + e.detail.selected + '」· Enter 编辑 · Delete 删除' : e.detail.nodes + ' 张便签，' + e.detail.edges + ' 条连线';
    });
  },
  ai: `【模板】白板 / 流程画布编辑器 · DOM 工具栏 + Canvas 画布
【页面目标】在无限画布上快速摆放想法并连线：拖、连、改，三种操作都不打断思路
【实现方式】工具栏用 DOM（ui-segmented 工具切换 + ui-button），画布用 <canvas>（ui-cv-board）。画布维护「世界坐标」节点列表 + 视图变换 {x, y, k}，所有命中检测先把屏幕坐标换算成世界坐标；文字编辑时临时放一个绝对定位的 <input> 覆盖在便签上
【画面结构】
  1) 顶部浮动工具栏：工具（选择 / 便签 / 连线）| ＋便签、换色、删除（danger）| 弹性空白 | −、＋、适应画布
  2) 画布：panel-2 底色 + 随缩放的点阵网格；便签 = 圆角卡片（白底 + 语义浅色叠层 + 左侧 4px 色条 + 自动换行文字）；连线 = 贝塞尔曲线 + 实心箭头，箭头停在便签边缘；选中便签有品牌色外框和四角控制点
  3) 右下角胶囊：缩放比例 + 便签数 + 连线数
  4) 底部提示条：当前状态（aria-live）+ 快捷键说明
【操作逻辑】
  1) 选择工具：拖便签移动；拖空白处平移；点空白取消选中；滚轮平移，Ctrl / ⌘ + 滚轮以光标为中心缩放（30%-250%）
  2) 便签工具：点空白放一张新便签，之后自动切回选择工具（工具栏同步）
  3) 连线工具：从一张便签按下拖到另一张松开 → 新增连线（虚线预览，重复连线忽略）
  4) 双击便签编辑文字（Enter 确认、Esc 取消、失焦保存）；双击空白新建便签
  5) 键盘：[ ] 切换选中，方向键移动 10px（Shift 1px），无选中时方向键平移画布，Enter 编辑，Delete 删除（连带删除相关连线），N 新建，C 换色，+ / - 缩放，0 适应画布
  6) 画布派发 change（便签数、连线数、选中项）和 tool 事件，工具栏和状态条据此更新
【无障碍】${KEYS_NOTE}；编辑框有 aria-label；工具栏是标准按钮
【约束】1) 选中的便签移到绘制顺序最后（显示在最上层）；2) 缩放有上下限；3) 颜色、圆角、字体只来自 --ui-* 变量；4) 不使用任何第三方画布库`,
  design: {
    purpose: '编辑器类界面的常见组合：控件用 DOM（可访问、好排版），内容区用 Canvas（元素多、可缩放、性能好）。',
    when: ['白板、思维导图、流程图、看板编排', '低代码搭建器的画布区', '平面图、点位编辑等需要平移缩放的工具'],
    avoid: ['元素少于十几个、不需要缩放的场景（直接用 DOM + 拖拽排序更简单）'],
    tips: ['坐标统一用世界坐标，视图变换只在绘制和命中时用一次', '临时编辑用真实 <input> 覆盖，比在画布里画光标靠谱得多', '工具用完自动回到「选择」，减少模式错误']
  }
};

export const canvasTemplates = [dash, game, board];
