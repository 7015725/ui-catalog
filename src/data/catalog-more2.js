/* =========================================================
   扩展组件元数据（第三批）——字段与 catalog.js 一致
   ========================================================= */
const CMD_ITEMS = JSON.stringify([
  { group: '页面', icon: '🏠', label: '回到首页', kbd: 'G H' },
  { group: '页面', icon: '📊', label: '打开数据看板', kbd: 'G D' },
  { group: '页面', icon: '⚙️', label: '打开设置', kbd: 'Ctrl ,' },
  { group: '操作', icon: '＋', label: '新建项目', keywords: 'create new' },
  { group: '操作', icon: '👥', label: '邀请成员', keywords: 'invite' },
  { group: '操作', icon: '🌙', label: '切换深色模式', keywords: 'dark theme' },
  { group: '帮助', icon: '⌨️', label: '查看快捷键', kbd: '?' },
  { group: '帮助', icon: '💬', label: '联系客服' }
]).replace(/'/g, '&#39;');

export const moreCatalog2 = [
  /* ---------------- 表单 ---------------- */
  {
    id: 'password',
    tag: 'ui-password',
    name: '密码输入',
    cat: '表单',
    brief: '显隐切换 + 强度条 + 规则提示',
    demo: '<ui-password label="设置密码" placeholder="至少 8 位，含大小写和数字"></ui-password>',
    ai:
      '【组件】密码输入 <ui-password>\n' +
      '【属性】label；placeholder；value；meter="false" 关闭强度条与规则\n' +
      '【交互】右侧 👁 切换明文（aria-pressed 同步）；输入时实时计算 4 条规则（≥8 位 / 大小写 / 数字 / 符号）→ 强度 1-4；派发 change，detail = { value, level }\n' +
      '【视觉】4 段强度条，弱=danger、一般=warn、良好=ok 偏黄、强=ok；规则列表满足项变绿并打 ✓\n' +
      '【约束】1) autocomplete="new-password"；2) 规则通过 aria-describedby 关联给读屏；3) 不要在输入时重绘整个组件（会丢光标），只更新强度条',
    design: {
      purpose: '让用户在设置密码时就知道够不够安全，而不是提交后才报错。',
      when: ['注册、修改密码、设置支付密码'],
      avoid: ['登录场景不需要强度条（meter="false"）']
    }
  },
  {
    id: 'range',
    tag: 'ui-range',
    name: '区间滑块',
    cat: '表单',
    brief: '双滑块选择上下限',
    demo: '<ui-range label="价格区间" min="0" max="2000" step="50" low="300" high="1200" prefix="¥"></ui-range>',
    ai:
      '【组件】区间滑块 <ui-range>\n' +
      '【属性】label；min / max / step；low / high 初始上下限；prefix / suffix 单位\n' +
      '【实现】两个原生 range 叠放，轨道 pointer-events:none、只有滑块可拖；两者交叉时自动夹住\n' +
      '【交互】拖动时派发 input，松手派发 change，detail = { low, high }；键盘 ←→ 原生支持\n' +
      '【约束】1) 拖动中不能 setAttribute 触发重绘（会打断拖动）；2) 当前值要以文本显示；3) 跨度很大时配合两个数字输入框',
    design: {
      purpose: '一次拖动同时定下限和上限。',
      when: ['价格筛选、年龄范围、时间段'],
      avoid: ['只需要一个值时用普通滑块']
    }
  },
  {
    id: 'search',
    tag: 'ui-search',
    name: '搜索框',
    cat: '表单',
    brief: '联想建议 + 高亮匹配 + / 快捷聚焦',
    demo: '<ui-search placeholder="搜索城市，例如：杭" suggestions="北京,上海,广州,深圳,杭州,南京,苏州,成都,重庆,武汉,西安,长沙,厦门,青岛,杭州湾新区"></ui-search>',
    ai:
      '【组件】搜索框 <ui-search>\n' +
      '【属性】placeholder；suggestions 逗号分隔的候选；value；shortcut 聚焦快捷键（默认 /，空字符串关闭）\n' +
      '【交互】输入即过滤候选（最多 8 条），匹配片段 <mark> 高亮；↑↓ 选择、Enter 提交、Esc 关闭；× 一键清空；派发 search，detail = { value }\n' +
      '【无障碍】input role=combobox + aria-expanded / aria-activedescendant；列表 role=listbox\n' +
      '【视觉】左侧 ⌕ 图标，右侧显示快捷键提示；联想面板挂到 body portal，宽度与输入框一致\n' +
      '【约束】1) 在输入框里按 / 不触发聚焦快捷键；2) 无结果时也要给出提示；3) 远程搜索需要防抖（由业务实现）',
    design: {
      purpose: '让用户少打几个字就找到目标。',
      when: ['全站搜索、城市/商品选择'],
      avoid: ['候选很少（<6）时用下拉选择']
    }
  },
  {
    id: 'option-cards',
    tag: 'ui-option-cards',
    name: '选项卡片',
    cat: '表单',
    brief: '带说明的大号单选/多选',
    wide: true,
    demo: `<ui-option-cards value="pro" items='[{"value":"free","icon":"🌱","title":"个人版","desc":"适合个人试用","price":"免费"},{"value":"pro","icon":"🚀","title":"专业版","desc":"小团队协作","price":"¥ 49/月"},{"value":"team","icon":"🏢","title":"企业版","desc":"权限与审计","price":"¥ 199/月"}]'></ui-option-cards>` +
      `<ui-option-cards multiple value="email" items='[{"value":"email","title":"邮件通知"},{"value":"sms","title":"短信通知"},{"value":"push","title":"App 推送"}]'></ui-option-cards>`,
    ai:
      '【组件】选项卡片 <ui-option-cards>\n' +
      '【属性】items 为 JSON 数组 { value, title, icon?, desc?, price? }；value 选中值（多选逗号分隔）；multiple 多选\n' +
      '【交互】单选 role=radiogroup + 方向键切换（roving tabindex）；多选 role=checkbox 逐个 Tab；派发 change\n' +
      '【视觉】网格 repeat(auto-fit, minmax(min(100%,150px),1fr)) 自动换列；选中态品牌描边 + 浅底，右上角单选圆点 / 多选方框 ✓\n' +
      '【约束】1) 选项 2-6 个；2) 每张卡的信息结构保持一致；3) 选项只有一两个字时用分段控制器',
    design: {
      purpose: '当每个选项都需要一句解释时，让选择本身就是比较。',
      when: ['套餐选择、配送方式、通知渠道'],
      avoid: ['选项很多时用下拉或列表']
    }
  },

  /* ---------------- 图表 ---------------- */
  {
    id: 'sparkline',
    tag: 'ui-sparkline',
    name: '迷你趋势图',
    cat: '图表',
    brief: '一行数字画出走势',
    demo:
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:16px;width:100%">' +
      '<ui-sparkline label="日活用户" data="820,932,901,934,1290,1330,1320,1450,1610"></ui-sparkline>' +
      '<ui-sparkline label="退款率" color="danger" data="5.2,4.8,5.6,4.1,3.9,3.4,3.6,2.9"></ui-sparkline>' +
      '<ui-sparkline label="转化" color="success" data="12,14,13,17,16,19,22,21,24" area="false"></ui-sparkline></div>',
    ai:
      '【组件】迷你趋势图 <ui-sparkline>\n' +
      '【属性】data 逗号分隔数字（≥2 个）；label 标题（有则显示最新值与首尾涨跌幅）；color: brand | success | warn | danger 或任意 CSS 颜色；height 默认 48；area="false" 去掉面积\n' +
      '【实现】SVG viewBox 0 0 100 40 + preserveAspectRatio="none" 拉伸到容器宽度；描边 vector-effect:non-scaling-stroke 保证线宽不变\n' +
      '【约束】1) 只表达趋势，不画坐标轴；2) role=img + aria-label 写清起止值；3) 精确读数用柱状图或表格',
    design: {
      purpose: '在指标卡里用最少的空间回答「在涨还是在跌」。',
      when: ['KPI 卡片、表格行内趋势'],
      avoid: ['需要读具体数值或比较多条序列']
    }
  },
  {
    id: 'bar-chart',
    tag: 'ui-bar-chart',
    name: '柱状图',
    cat: '图表',
    brief: '纵向/横向，宽度自适应',
    wide: true,
    demo:
      `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;width:100%">` +
      `<ui-bar-chart title="周销售额（万元）" data='[{"label":"周一","value":12.4},{"label":"周二","value":18.1},{"label":"周三","value":15.6},{"label":"周四","value":22.3},{"label":"周五","value":28.9},{"label":"周六","value":34.2},{"label":"周日","value":26.7}]'></ui-bar-chart>` +
      `<ui-bar-chart horizontal multicolor title="流量来源" data='[{"label":"搜索","value":4820},{"label":"直接访问","value":3210},{"label":"社交媒体","value":2140},{"label":"邮件","value":860}]'></ui-bar-chart></div>`,
    ai:
      '【组件】柱状图 <ui-bar-chart>\n' +
      '【属性】data 为 JSON 数组 { label, value }；title；horizontal 横向条形；multicolor 每根不同色；height 纵向图高度（默认 160）\n' +
      '【实现】纯 HTML + CSS：柱高 = value / max 的百分比，用 CSS 变量 --v 驱动并带过渡动画；背景用 repeating-linear-gradient 画 4 条参考线\n' +
      '【自适应】柱宽随容器伸缩（最大 38px），容器 <300px 时隐藏柱顶数值；横向图标签列自动取最大宽\n' +
      '【约束】1) 类别 ≤12 个，多了改横向；2) figure role=img + aria-label 列出全部数值；3) 颜色只用 token',
    design: {
      purpose: '比较若干类别的数值大小。',
      when: ['按天/按渠道/按地区对比'],
      avoid: ['连续时间趋势用折线', '占比用环形图']
    }
  },
  {
    id: 'donut',
    tag: 'ui-donut',
    name: '环形图',
    cat: '图表',
    brief: '占比 + 图例，窄时自动换行',
    demo: `<ui-donut label="总订单" data='[{"label":"已完成","value":1280},{"label":"配送中","value":420},{"label":"待支付","value":210},{"label":"已取消","value":90}]'></ui-donut>`,
    ai:
      '【组件】环形图 <ui-donut>\n' +
      '【属性】data 为 JSON 数组 { label, value }；label 中心副标题（默认「合计」）；size 直径（默认 132）\n' +
      '【实现】SVG 多个 circle 叠放，每段 stroke-dasharray = 占比 × 周长，stroke-dashoffset 累加；段间留 2px 缝；悬停加粗\n' +
      '【布局】图与图例 flex-wrap：宽时左右，窄时上下\n' +
      '【约束】1) 分段 ≤6，其余合并为「其他」；2) 图例必须显示百分比，不能只靠颜色；3) 不要用于比较两个环',
    design: {
      purpose: '展示整体中各部分的占比。',
      when: ['订单状态分布、预算构成'],
      avoid: ['分段很多或数值接近时用条形图']
    }
  },
  {
    id: 'heatmap',
    tag: 'ui-heatmap',
    name: '热力日历',
    cat: '图表',
    brief: 'GitHub 式活跃度格子',
    wide: true,
    demo: '<ui-heatmap weeks="26" seed="11"></ui-heatmap>',
    ai:
      '【组件】热力日历 <ui-heatmap>\n' +
      '【属性】weeks 周数（4-53）；data 逗号分隔的 0-4 等级（按天，从旧到新）；seed 无数据时生成示例的种子；label 底部说明\n' +
      '【实现】CSS grid grid-auto-flow:column + 7 行，每格 aspect-ratio:1；等级色 = color-mix(brand, panel-2) 28% / 52% / 76% / 100%\n' +
      '【自适应】列宽 minmax(9px,1fr)：宽容器拉伸填满，窄容器保持 9px 并横向滚动\n' +
      '【约束】1) 必须有「少 → 多」图例；2) role=img 写明统计结论；3) 每格可加 title 显示日期与次数（业务扩展）',
    design: {
      purpose: '一眼看出长期的活跃节奏与断档。',
      when: ['打卡、提交记录、学习时长'],
      avoid: ['需要精确数值对比时']
    }
  },

  /* ---------------- 展示 ---------------- */
  {
    id: 'profile',
    tag: 'ui-profile',
    name: '个人名片',
    cat: '展示',
    brief: '封面 + 头像 + 简介 + 数据',
    demo: '<ui-profile name="林小北" subtitle="资深产品设计师 · 杭州" verified online bio="专注 B 端设计系统与数据可视化，喜欢把复杂的事情讲简单。" stats="128:作品,3.2k:关注者,46:关注中"><ui-button size="sm" variant="primary">关注</ui-button><ui-button size="sm">私信</ui-button></ui-profile>',
    ai:
      '【组件】个人名片 <ui-profile>\n' +
      '【属性】name；subtitle 职位/地点（不要用 role，那是 ARIA 保留属性）；bio 简介；stats「数值:标签」逗号分隔；verified 认证标；online 在线绿点；标签内部放操作按钮\n' +
      '【视觉】顶部 64px 品牌渐变封面，60px 头像压住封面下沿并带 3px 面板色描边；底部数据网格 auto-fit 等分\n' +
      '【约束】1) 简介控制在 2 行内；2) 数据项 2-4 个；3) 操作按钮最多两个',
    design: {
      purpose: '在悬停卡、侧栏或列表里快速认识一个人。',
      when: ['作者卡、成员详情、社区主页'],
      avoid: ['完整个人主页用独立页面']
    }
  },
  {
    id: 'pricing',
    tag: 'ui-pricing',
    name: '价格卡',
    cat: '展示',
    brief: '套餐对比，推荐款高亮',
    wide: true,
    demo:
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:14px;width:100%;padding-top:8px">' +
      '<ui-pricing name="个人版" price="¥0" desc="适合个人试用" features="3 个项目,基础组件,社区支持,!团队协作,!私有部署"><ui-button block>免费开始</ui-button></ui-pricing>' +
      '<ui-pricing name="专业版" price="¥49" highlight badge="最受欢迎" desc="小团队高效协作" features="不限项目,全部组件,团队协作,优先支持,!私有部署"><ui-button block variant="primary">立即升级</ui-button></ui-pricing>' +
      '<ui-pricing name="企业版" price="¥199" desc="安全与合规" features="不限项目,全部组件,团队协作,专属客户经理,私有部署"><ui-button block>联系销售</ui-button></ui-pricing></div>',
    ai:
      '【组件】价格卡 <ui-pricing>\n' +
      '【属性】name；price；period（默认 /月）；desc；features 逗号分隔，以 ! 开头表示不包含（删除线）；badge 角标；highlight 推荐高亮；标签内部放按钮\n' +
      '【布局】外层用 grid repeat(auto-fit, minmax(min(100%,190px),1fr))，三列 → 两列 → 一列自动切换；卡片 height:100% 等高，特性列表 flex:1 让按钮对齐底部\n' +
      '【约束】1) 套餐 2-4 个；2) 只高亮一个；3) 各卡特性顺序一致，方便横向对比',
    design: {
      purpose: '让用户在几秒内比较套餐并做决定。',
      when: ['定价页、升级弹窗'],
      avoid: ['特性超过 10 条时改用对比表格']
    }
  },

  /* ---------------- 导航 ---------------- */
  {
    id: 'bottom-nav',
    tag: 'ui-bottom-nav',
    name: '底部标签栏',
    cat: '导航',
    brief: '移动端一级导航',
    demo: `<div style="width:100%;max-width:360px;margin:0 auto;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-lg);overflow:hidden;background:var(--ui-bg)"><div style="height:70px;display:grid;place-items:center;font-size:12px;color:var(--ui-sub)">页面内容</div><ui-bottom-nav active="0" items='[{"icon":"🏠","label":"首页"},{"icon":"🧭","label":"发现"},{"icon":"💬","label":"消息","badge":"3"},{"icon":"👤","label":"我的"}]'></ui-bottom-nav></div>`,
    ai:
      '【组件】底部标签栏 <ui-bottom-nav>\n' +
      '【属性】items 为 JSON 数组 { icon, label, badge? }；active 当前索引；label 导航的无障碍名称（默认「底部导航」，同页有多个时要各不相同）\n' +
      '【交互】点击切换，aria-current="page" 标出当前；派发 change，detail = { index }\n' +
      '【视觉】当前项品牌色 + 图标上浮 2px + 顶部 3px 指示条；未读角标红底白字带面板色描边；底部留 env(safe-area-inset-bottom)\n' +
      '【约束】1) 3-5 个入口；2) 图标 + 文字同时出现；3) 只放一级入口，不放操作按钮',
    design: {
      purpose: '让手机用户单手就能在主要模块间切换。',
      when: ['移动端 App / H5 的一级导航'],
      avoid: ['桌面端用顶部导航或侧边菜单']
    }
  },

  /* ---------------- 浮层 ---------------- */
  {
    id: 'command',
    tag: 'ui-command',
    name: '命令面板',
    cat: '浮层',
    brief: 'Ctrl/⌘ + K 唤起的全局搜索',
    demo: `<ui-command onselect="uiToast('执行：' + event.detail.label)" items='${CMD_ITEMS}'></ui-command>`,
    ai:
      '【组件】命令面板 <ui-command>\n' +
      '【属性】items 为 JSON 数组 { label, group?, icon?, kbd?, keywords?, value? }；placeholder；hotkey 全局快捷键字母（默认 k，配合 Ctrl/⌘；空字符串关闭）\n' +
      '【交互】点触发按钮或按 Ctrl/⌘+K 打开；输入即过滤（匹配 label / group / keywords）；↑↓ 选择、Enter 执行、Esc 或点遮罩关闭；Tab 锁在面板内；关闭后焦点归还；执行时派发 select，detail = { label, value, item }\n' +
      '【视觉】遮罩 + 居中偏上 12vh 的面板，最大 560px；分组标题、右侧快捷键提示；窄屏（<520px）铺满并隐藏底部提示\n' +
      '【约束】1) 面板继承最近的 data-style / data-theme；2) 结果为空时给出明确文案；3) 命令名用动词开头',
    design: {
      purpose: '让熟练用户不碰鼠标就能跳转和执行操作。',
      when: ['后台、编辑器、开发者工具'],
      avoid: ['面向新手的主要入口仍需可见的导航']
    }
  },

  /* ---------------- 反馈 ---------------- */
  {
    id: 'countdown',
    tag: 'ui-countdown',
    name: '倒计时',
    cat: '反馈',
    brief: '活动/验证码剩余时间',
    demo: '<ui-countdown seconds="5400"></ui-countdown><ui-countdown seconds="259200" size="sm"></ui-countdown>',
    ai:
      '【组件】倒计时 <ui-countdown>\n' +
      '【属性】seconds 从现在起的秒数，或 to 目标时间（ISO 字符串，优先）；size: md | sm；days 强制显示「天」\n' +
      '【行为】每秒刷新；归零时派发 end 并变灰；卸载时清理定时器\n' +
      '【视觉】数字等宽 tabular-nums，每个单位一个面板小方块，冒号分隔；sm 尺寸隐藏单位文字\n' +
      '【约束】1) role=timer + aria-label 写全剩余时间；2) 以服务器时间为准，避免本地时间被篡改；3) 超过 30 天直接显示日期',
    design: {
      purpose: '制造紧迫感或告知还要等多久。',
      when: ['限时活动、验证码重发、考试计时'],
      avoid: ['没有真实截止时间时不要制造假倒计时']
    }
  },
  {
    id: 'banner',
    tag: 'ui-banner',
    name: '公告横幅',
    cat: '反馈',
    brief: '页面顶部的全局通知',
    demo:
      '<ui-banner variant="gradient" action="立即查看" closable>双十一大促进行中，全场满 300 减 50！</ui-banner>' +
      '<ui-banner variant="soft" icon="✨">新版本 3.0 已发布，支持深色模式与 10 套主题。</ui-banner>' +
      '<ui-banner variant="warn" icon="⚠️" closable>系统将于今晚 23:00 维护，预计 30 分钟。</ui-banner>',
    ai:
      '【组件】公告横幅 <ui-banner>\n' +
      '【属性】variant: brand | gradient | soft | warn；icon 前置图标；action 右侧按钮文字（点击派发 action）；closable 可关闭（淡出后移除并派发 close）\n' +
      '【视觉】整条圆角 var(--ui-radius)，文字区 flex:1 自动换行，按钮在窄屏时换到下一行\n' +
      '【约束】1) 一个页面同时最多一条；2) 文案一句话说清；3) 关闭状态应由业务记住，不要每次刷新都出现',
    design: {
      purpose: '把影响所有人的消息放在最显眼但不阻断的位置。',
      when: ['活动、版本发布、维护通知'],
      avoid: ['针对单个操作的反馈用 toast 或 alert']
    }
  },
  {
    id: 'status',
    tag: 'ui-status',
    name: '状态指示',
    cat: '反馈',
    brief: '在线/忙碌/运行中的小圆点',
    demo:
      '<ui-status status="online" pulse></ui-status><ui-status status="busy">会议中</ui-status>' +
      '<ui-status status="away"></ui-status><ui-status status="offline"></ui-status>' +
      '<ui-status status="running" pulse>部署中…</ui-status>',
    ai:
      '【组件】状态指示 <ui-status>\n' +
      '【属性】status: online | busy | away | offline | running；pulse 呼吸动画；标签内文字可覆盖默认文案\n' +
      '【视觉】8px 圆点 + 文字，颜色分别取 ok / danger / warn / sub / brand；pulse 用伪元素放大淡出，prefers-reduced-motion 时关闭\n' +
      '【约束】1) 必须带文字，不能只靠颜色；2) 同一列表里只让「需要关注」的状态闪烁',
    design: {
      purpose: '用最小的元素表达实时状态。',
      when: ['成员在线状态、服务健康、任务运行'],
      avoid: ['需要操作的错误状态用 alert']
    }
  }
];
