/* =========================================================
   扩展组件元数据（第四批）
   ========================================================= */
const j = (v) => JSON.stringify(v).replace(/'/g, '&#39;');

const CAS = j([
  { label: '浙江', children: [{ label: '杭州', children: [{ label: '西湖区' }, { label: '滨江区' }, { label: '余杭区' }] }, { label: '宁波', children: [{ label: '鄞州区' }, { label: '海曙区' }] }] },
  { label: '江苏', children: [{ label: '南京', children: [{ label: '玄武区' }, { label: '鼓楼区' }] }, { label: '苏州', children: [{ label: '姑苏区' }, { label: '工业园区' }] }] },
  { label: '广东', children: [{ label: '深圳', children: [{ label: '南山区' }, { label: '福田区' }] }, { label: '广州', children: [{ label: '天河区' }] }] }
]);

function monthEvents() {
  const d = new Date();
  const ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  const day = (n) => ym + '-' + String(n).padStart(2, '0');
  const t = d.getDate();
  const near = (k) => Math.min(28, Math.max(1, t + k));
  return j([
    { date: day(near(0)), time: '10:00', title: '需求评审' },
    { date: day(near(0)), time: '14:30', title: '设计走查', type: 'success' },
    { date: day(near(0)), time: '17:00', title: '周报', type: 'warn' },
    { date: day(near(2)), time: '09:30', title: '版本发布', type: 'danger' },
    { date: day(near(-3)), title: '团建', type: 'success' },
    { date: day(near(5)), time: '15:00', title: '客户访谈' },
    { date: day(near(9)), title: '季度复盘', type: 'warn' }
  ]);
}

export const moreCatalog3 = [
  /* ---------------- 表单 ---------------- */
  {
    id: 'multi-select',
    tag: 'ui-multi-select',
    name: '多选下拉',
    cat: '表单',
    brief: '可筛选、全选的多选下拉框',
    demo: '<ui-multi-select label="负责城市" options="北京,上海,广州,深圳,杭州,南京,成都,武汉,西安,重庆" value="上海,杭州,深圳,成都" max="3"></ui-multi-select>',
    ai:
      '【组件】多选下拉 <ui-multi-select>\n' +
      '【属性】label；options 逗号分隔；value 已选（逗号分隔）；placeholder；max 触发器里最多显示几个标签，其余折叠为 +N\n' +
      '【交互】点击打开面板（挂到 body portal），顶部筛选框自动聚焦；↑↓ 移动、Enter 勾选、Esc 关闭并归还焦点；底部「全选 / 清空」；触发器上的 × 可直接移除；派发 change，detail = { value: string[] }\n' +
      '【无障碍】触发器 aria-haspopup=listbox + aria-expanded；列表 role=listbox aria-multiselectable；选项 aria-selected\n' +
      '【约束】1) 选项 > 8 个才需要筛选框；2) 已选顺序与 options 一致，不按点击顺序；3) 选项上千时需要虚拟列表',
    design: {
      purpose: '在有限空间里从较多选项中选出若干个。',
      when: ['负责区域、标签、可见范围等多值字段'],
      avoid: ['选项少于 6 个时用复选框或筛选标签组，直接可见更好']
    }
  },
  {
    id: 'cascader',
    tag: 'ui-cascader',
    name: '级联选择',
    cat: '表单',
    brief: '省 / 市 / 区逐级展开',
    demo: `<ui-cascader label="所在地区" value="浙江/杭州/西湖区" options='${CAS}'></ui-cascader>`,
    ai:
      '【组件】级联选择 <ui-cascader>\n' +
      '【属性】label；options 为 JSON 树 [{ label, children? }]；value 用 / 连接的路径；placeholder\n' +
      '【交互】点开后每一级一列，点非叶子展开下一列，点叶子完成选择并关闭；键盘 ↑↓ 同列移动、→/Enter 进入下一级、← 回上一级、Esc 关闭；派发 change，detail = { value, path }\n' +
      '【视觉】每列最小 120px、最大高 240px 可滚动；当前路径项品牌浅底；面板超出视口时横向滚动\n' +
      '【约束】1) 层级 ≤ 4；2) 每一级选项 > 20 时加搜索；3) 只允许选到叶子节点（如需任意级可选需额外配置）',
    design: {
      purpose: '把有层级关系的大量选项拆成几步小选择。',
      when: ['地区、组织架构、商品类目'],
      avoid: ['只有一级时用普通下拉', '用户知道目标名时搜索更快']
    }
  },
  {
    id: 'transfer',
    tag: 'ui-transfer',
    name: '穿梭框',
    cat: '表单',
    brief: '在两栏之间移动选项',
    wide: true,
    demo: '<ui-transfer titles="全部成员,项目成员" options="林小北,王磊,李娜,张伟,陈静,刘洋,赵敏,周杰,吴倩,郑凯" value="王磊,陈静"></ui-transfer>',
    ai:
      '【组件】穿梭框 <ui-transfer>\n' +
      '【属性】options 全部选项（逗号分隔）；value 右侧已选；titles 两栏标题（逗号分隔）\n' +
      '【交互】勾选后点 › / ‹ 移动；表头复选框全选（部分选中时为 indeterminate）；没勾选时移动按钮禁用；派发 change，detail = { value: string[] }\n' +
      '【自适应】容器 < 420px 时两栏上下排列，按钮旋转 90°\n' +
      '【约束】1) 两侧都要显示数量；2) 移动后保持原始顺序；3) 选项上百时每栏加搜索',
    design: {
      purpose: '让「从全集中挑出一批」这件事一目了然。',
      when: ['分配成员、权限、字段显示'],
      avoid: ['选项很少时用复选框组']
    }
  },
  {
    id: 'input-group',
    tag: 'ui-input-group',
    name: '复合输入框',
    cat: '表单',
    brief: '前后缀、图标、内嵌按钮',
    demo:
      '<ui-input-group label="网站地址" prefix="https://" suffix=".com" placeholder="your-site"></ui-input-group>' +
      '<ui-input-group label="订阅邮件" icon="✉" type="email" placeholder="you@example.com" button="订阅"></ui-input-group>' +
      '<ui-input-group label="金额" prefix="¥" suffix="元" type="number" value="199"></ui-input-group>',
    ai:
      '【组件】复合输入框 <ui-input-group>\n' +
      '【属性】label；prefix / suffix 前后缀文字；icon 前置图标；button 内嵌按钮文字；placeholder；type；value\n' +
      '【交互】按钮点击或输入框回车派发 submit，detail = { value }\n' +
      '【视觉】整体一个边框，前后缀用 var(--ui-panel) 底 + 分隔线；focus-within 整体高亮 var(--ui-ring)\n' +
      '【约束】1) 前后缀只放单位/协议这类固定文本；2) 内嵌按钮只放一个主操作；3) 前后缀不要用来写说明文字',
    design: {
      purpose: '把输入值的固定部分和操作放在输入框里，减少歧义。',
      when: ['网址、金额、单位、订阅邮箱'],
      avoid: ['可变的单位应做成下拉选择']
    }
  },

  /* ---------------- 展示 ---------------- */
  {
    id: 'image',
    tag: 'ui-image',
    name: '图片',
    cat: '展示',
    brief: '固定比例、加载占位、点击放大',
    wide: true,
    demo:
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:12px;width:100%">' +
      '<ui-image demo="0" alt="晨光湖畔" caption="晨光湖畔 · 4:3"></ui-image>' +
      '<ui-image demo="1" alt="山谷" ratio="1/1" caption="山谷 · 1:1"></ui-image>' +
      '<ui-image demo="2" alt="黄昏" ratio="16/9" caption="黄昏 · 16:9"></ui-image>' +
      '<ui-image src="data:image/png;base64,AAAA" alt="失败示例" caption="加载失败兜底"></ui-image></div>',
    ai:
      '【组件】图片 <ui-image>\n' +
      '【属性】src；alt（必填）；ratio 宽高比（默认 4/3）；fit: cover | contain；caption 图注；preview="false" 关闭点击预览；demo 内置示例图编号（无需网络）\n' +
      '【行为】aspect-ratio 先占位避免布局跳动；加载中显示骨架闪光；失败显示「图片加载失败」；loading="lazy"；点击打开全屏灯箱（Esc / 点背景关闭，焦点锁定并归还）\n' +
      '【视觉】圆角 var(--ui-radius)，悬停轻微放大 1.04（prefers-reduced-motion 时关闭）\n' +
      '【约束】1) alt 写图片内容而不是「图片」；2) 列表缩略图统一 ratio；3) 大图请提供合适尺寸，不要用原图当缩略图',
    design: {
      purpose: '让图片在加载前后都不打乱布局，并可放大查看。',
      when: ['商品图、相册、文章配图'],
      avoid: ['纯装饰图用 CSS 背景，不需要可点击']
    }
  },
  {
    id: 'comment',
    tag: 'ui-comment',
    name: '评论',
    cat: '展示',
    brief: '楼中楼、点赞、就地回复',
    wide: true,
    demo: `<ui-comment items='${j([
      { author: '林小北', tag: '作者', time: '2 小时前', text: '第三批组件已经上线，欢迎大家试用并反馈问题～', likes: 24, liked: true,
        replies: [{ author: '王磊', time: '1 小时前', text: '命令面板太好用了，Ctrl+K 已经成为肌肉记忆。', likes: 6 },
          { author: '李娜', time: '40 分钟前', text: '能不能加一个级联选择？', likes: 2 }] },
      { author: '陈静', time: '昨天', text: '15 套风格里最喜欢 Nord，长时间看也不累。', likes: 11 }
    ])}'></ui-comment>`,
    ai:
      '【组件】评论 <ui-comment>\n' +
      '【属性】items 为 JSON 数组 { author, text, time?, tag?, likes?, liked?, replies?[] }（可嵌套）\n' +
      '【交互】♡ 点赞切换（aria-pressed）并派发 like，detail = { path, liked }；「回复」就地展开输入框，回车或点发送追加一条回复并派发 reply，Esc 收起\n' +
      '【视觉】34px 头像 + 内容两栏；子回复左侧 2px 竖线缩进；作者标签为品牌浅底小胶囊\n' +
      '【约束】1) 嵌套不超过 2 层，更深的改为「回复 @某人」；2) 文本按纯文本输出（已转义）；3) 时间用相对时间',
    design: {
      purpose: '承载围绕内容的讨论，并清楚地表达谁在回复谁。',
      when: ['文章评论、工单讨论、设计稿批注'],
      avoid: ['实时聊天用消息列表组件']
    }
  },
  {
    id: 'calendar',
    tag: 'ui-calendar',
    name: '日程月历',
    cat: '展示',
    brief: '月视图 + 日程条，窄时变圆点',
    wide: true,
    demo: `<ui-calendar events='${monthEvents()}'></ui-calendar>`,
    ai:
      '【组件】日程月历 <ui-calendar>\n' +
      '【属性】events 为 JSON 数组 { date: "YYYY-MM-DD", title, time?, type?: brand | success | warn | danger }；month 显示月份 YYYY-MM（默认当月）；selected 选中日期\n' +
      '【交互】‹ / 今天 / › 切换月份；点日期选中并在下方列出当日日程，派发 select，detail = { date, events }；方向键 ←→ 按天、↑↓ 按周移动（跨月自动翻页）\n' +
      '【自适应】容器 < 460px 时日程条隐藏、改为小圆点，日程只在下方列表显示\n' +
      '【无障碍】role=grid + row + columnheader + gridcell，roving tabindex，每格 aria-label 含日程数\n' +
      '【约束】1) 每格最多显示 2 条，其余 +N；2) 周一为每周第一天；3) 当天用实心圆标出',
    design: {
      purpose: '按月俯瞰安排，并能快速定位到某一天。',
      when: ['排期、预约、值班表'],
      avoid: ['只选一个日期用日期选择器', '一天内的精细安排用日视图']
    }
  },

  /* ---------------- 图表 ---------------- */
  {
    id: 'line-chart',
    tag: 'ui-line-chart',
    name: '折线图',
    cat: '图表',
    brief: '多序列 + 悬停十字线 + 键盘读数',
    wide: true,
    demo: `<ui-line-chart title="近 12 个月营收" unit="万元" area labels="1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月" series='${j([
      { name: '线上', data: [32, 41, 38, 52, 61, 58, 72, 80, 76, 91, 118, 104] },
      { name: '线下', data: [28, 30, 35, 33, 40, 44, 42, 47, 51, 49, 63, 70] }
    ])}'></ui-line-chart>`,
    ai:
      '【组件】折线图 <ui-line-chart>\n' +
      '【属性】labels 横轴标签（逗号分隔）；series 为 JSON [{ name, data: number[] }]（最多 5 条）；title；unit 单位；height 绘图区高度（默认 180）；area 填充面积\n' +
      '【实现】线条用 SVG viewBox 0 0 100 100 + preserveAspectRatio="none" 拉伸，描边 non-scaling-stroke；坐标轴文字、圆点、提示框都是 HTML，任意宽度下不变形；纵轴上限自动取整（1/2/2.5/5×10ⁿ）\n' +
      '【交互】鼠标移动显示十字线、各序列圆点与提示框；绘图区可 Tab 聚焦，←→ / Home / End 逐点读数\n' +
      '【自适应】横轴标签超过 8 个时自动抽稀；提示框靠右溢出时翻到左侧\n' +
      '【约束】1) 序列 ≤ 5，颜色只用 token；2) role=img 的 aria-label 写出全部数据；3) 非连续类别数据用柱状图',
    design: {
      purpose: '展示连续时间上的变化趋势与多条序列的对比。',
      when: ['营收、流量、性能指标的时间趋势'],
      avoid: ['类别对比用柱状图', '只看走势不看读数时用迷你趋势图']
    }
  },
  {
    id: 'gauge',
    tag: 'ui-gauge',
    name: '仪表盘',
    cat: '图表',
    brief: '半圆刻度，按阈值变色',
    demo:
      '<ui-gauge value="42" label="CPU 使用率" unit="%"></ui-gauge>' +
      '<ui-gauge value="73" label="内存" unit="%"></ui-gauge>' +
      '<ui-gauge value="92" label="健康分" reverse></ui-gauge>',
    ai:
      '【组件】仪表盘 <ui-gauge>\n' +
      '【属性】value；min / max（默认 0-100）；label；unit；thresholds 两个百分比阈值（默认 60,85）；reverse 越高越好（颜色反转）；width 最大宽度（默认 220）\n' +
      '【实现】SVG 半圆弧 stroke-dasharray 表示比例 + 11 根刻度线；数字为 HTML，字号随容器（cqw）缩放\n' +
      '【视觉】低于阈值 1 为 ok 色、阈值之间 warn、高于阈值 2 为 danger（reverse 时相反）\n' +
      '【约束】1) role=meter + aria-valuenow；2) 一屏不超过 4 个；3) 需要看历史变化时配合折线图',
    design: {
      purpose: '让单个指标的「当前处于什么水位」一眼可判。',
      when: ['资源占用、健康分、完成率'],
      avoid: ['多个指标对比用条形图']
    }
  },
  {
    id: 'funnel',
    tag: 'ui-funnel',
    name: '漏斗图',
    cat: '图表',
    brief: '逐层转化率',
    demo: `<ui-funnel title="注册转化漏斗" data='${j([
      { label: '访问', value: 48200 }, { label: '注册', value: 12600 }, { label: '激活', value: 7800 }, { label: '付费', value: 1960 }, { label: '复购', value: 820 }
    ])}'></ui-funnel>`,
    ai:
      '【组件】漏斗图 <ui-funnel>\n' +
      '【属性】data 为 JSON [{ label, value }]（从上到下递减）；title\n' +
      '【视觉】每层宽度 = value / 第一层，居中对齐；层间显示「转化 x%」（相对上一层）；颜色从品牌色渐变到 ok 色\n' +
      '【约束】1) 层数 3-6；2) 数值必须是同一口径的人数/次数；3) 每层最小宽度 8% 保证可读',
    design: {
      purpose: '找出流程中流失最严重的那一步。',
      when: ['注册、下单、招聘等多步骤转化'],
      avoid: ['各层之间没有先后关系时用柱状图']
    }
  },

  /* ---------------- 导航 ---------------- */
  {
    id: 'anchor',
    tag: 'ui-anchor',
    name: '目录锚点',
    cat: '导航',
    brief: '跟随滚动高亮当前章节',
    wide: true,
    demo:
      '<div style="display:grid;grid-template-columns:minmax(0,1fr) 130px;gap:14px;width:100%">' +
      '<div id="anc-box" tabindex="0" role="region" aria-label="文档正文" style="height:200px;overflow:auto;padding:4px 12px 4px 4px;font-size:12.5px;line-height:1.8;color:var(--ui-sub)">' +
      '<h3 id="anc-1" style="margin:0 0 4px;color:var(--ui-text)">1. 快速开始</h3><p style="margin:0 0 16px">运行 npm run dev 启动开发服务器，修改代码后浏览器会自动刷新。所有组件都是原生自定义元素，无需构建。</p>' +
      '<h3 id="anc-2" style="margin:0 0 4px;color:var(--ui-text)">2. 设计变量</h3><p style="margin:0 0 16px">组件只使用 var(--ui-*)，颜色、圆角、阴影都来自 tokens.css。切换 data-style 即可换肤，不需要改组件。</p>' +
      '<h3 id="anc-3" style="margin:0 0 4px;color:var(--ui-text)">3. 自适应</h3><p style="margin:0 0 16px">组件按容器宽度而不是视口宽度自适应，放进侧栏或卡片里同样生效。</p>' +
      '<h3 id="anc-4" style="margin:0 0 4px;color:var(--ui-text)">4. 无障碍</h3><p style="margin:0 0 16px">每个交互组件都实现了 WAI-ARIA 键盘模式。</p>' +
      '<h3 id="anc-5" style="margin:0 0 4px;color:var(--ui-text)">5. 常见问题</h3><p style="margin:0 0 60px">遇到问题先打开 /test.html 跑一遍回归测试。</p></div>' +
      `<ui-anchor title="本页目录" container="#anc-box" items='${j([{ id: 'anc-1', label: '快速开始' }, { id: 'anc-2', label: '设计变量' }, { id: 'anc-3', label: '自适应' }, { id: 'anc-4', label: '无障碍' }, { id: 'anc-5', label: '常见问题' }])}'></ui-anchor></div>`,
    ai:
      '【组件】目录锚点 <ui-anchor>\n' +
      '【属性】items 为 JSON [{ id, label, level?: 1 | 2 }]；container 滚动容器的选择器（不填为整页滚动）；title\n' +
      '【交互】点击平滑滚动到对应标题（拦截默认跳转，不污染 URL）；滚动时根据标题位置高亮当前项（aria-current="location"），滚到底时高亮最后一项；派发 change，detail = { id }\n' +
      '【视觉】左侧 2px 竖线，当前项品牌色竖线 + 品牌色文字；二级缩进 22px\n' +
      '【约束】1) 只放 2 级以内；2) 标题 id 必须唯一；3) 窄屏时收起到页面顶部或抽屉里',
    design: {
      purpose: '在长文档里随时知道「我在哪」，并能跳到想看的部分。',
      when: ['文档、帮助中心、长表单分节'],
      avoid: ['少于 3 个章节不需要目录']
    }
  },

  /* ---------------- 浮层 ---------------- */
  {
    id: 'split-button',
    tag: 'ui-split-button',
    name: '分裂按钮',
    cat: '浮层',
    brief: '主操作 + 下拉更多操作',
    demo:
      '<ui-split-button variant="primary" label="保存" items="保存为草稿,另存为模板,-,导出 PDF" onselect="uiToast(event.detail.label)" onaction="uiToast(\'已保存\')"></ui-split-button>' +
      '<ui-split-button label="分享" items="复制链接,发送邮件,-,删除分享" onselect="uiToast(event.detail.label)"></ui-split-button>',
    ai:
      '【组件】分裂按钮 <ui-split-button>\n' +
      '【属性】label 主操作文字；items 下拉项（逗号分隔，"-" 为分隔线，含「删除/移除」自动标红）；variant: default | primary\n' +
      '【交互】左侧点击派发 action；右侧 ▼ 打开菜单（↑↓ 也可直接打开并聚焦首/末项），菜单内 ↑↓ / Home / End 移动、Enter 选择、Esc 关闭并归还焦点；选择派发 select，detail = { label }\n' +
      '【视觉】两段共享圆角与阴影，中间 1px 分隔；菜单挂到 body portal 右对齐\n' +
      '【约束】1) 主操作必须是最常用的那个；2) 下拉项 ≤ 7；3) 危险操作放最后并用分隔线隔开',
    design: {
      purpose: '把一个高频操作和几个相关的低频操作收在一起。',
      when: ['保存 / 另存为、发布 / 定时发布'],
      avoid: ['几个操作同等重要时并排放按钮']
    }
  },
  {
    id: 'context-menu',
    tag: 'ui-context-menu',
    name: '右键菜单',
    cat: '浮层',
    brief: '在区域内右键弹出操作',
    demo: `<ui-context-menu onselect="uiToast(event.detail.label)" items='${j([
      { icon: '✂', label: '剪切', kbd: 'Ctrl X' }, { icon: '⧉', label: '复制', kbd: 'Ctrl C' }, { icon: '📋', label: '粘贴', kbd: 'Ctrl V', disabled: true },
      { divider: true }, { icon: '✎', label: '重命名', kbd: 'F2' }, { divider: true }, { icon: '🗑', label: '删除', kbd: 'Del', danger: true }
    ])}'><div style="display:grid;place-items:center;height:120px;border:var(--ui-border-w) dashed var(--ui-line);border-radius:var(--ui-radius);font-size:13px;color:var(--ui-sub);background:var(--ui-panel-2)">在这里点击右键（或聚焦后按 Shift + F10）</div></ui-context-menu>`,
    ai:
      '【组件】右键菜单 <ui-context-menu>\n' +
      '【属性】items 为 JSON [{ label, icon?, kbd?, danger?, disabled?, divider? }]；标签内部是可右键的区域\n' +
      '【交互】右键在鼠标位置弹出（靠边自动翻转/夹取）；区域可聚焦，键盘用 ContextMenu 键或 Shift+F10 打开；菜单 ↑↓ / Home / End、Enter 选择、Esc 关闭并归还焦点；页面滚动即关闭；派发 select，detail = { label, item }\n' +
      '【无障碍】role=menu / menuitem / separator；禁用项跳过\n' +
      '【约束】1) 右键菜单只能是「快捷方式」，同样的操作必须在界面上另有入口；2) 项数 ≤ 10；3) 触屏设备改为长按或「更多」按钮',
    design: {
      purpose: '给熟练用户一个就地操作的捷径。',
      when: ['文件管理、画布编辑、表格行操作'],
      avoid: ['操作只能通过右键找到（可发现性差）']
    }
  },
  {
    id: 'popconfirm',
    tag: 'ui-popconfirm',
    name: '气泡确认',
    cat: '浮层',
    brief: '轻量的二次确认',
    demo:
      '<ui-popconfirm danger title="确定删除这条记录？" desc="删除后 30 天内可在回收站恢复。" ok="删除" onconfirm="uiToast(\'已删除\')"><ui-button variant="danger" size="sm">删除</ui-button></ui-popconfirm>' +
      '<ui-popconfirm title="发布到生产环境？" ok="发布" onconfirm="uiToast(\'已发布\')"><ui-button variant="primary" size="sm">发布</ui-button></ui-popconfirm>',
    ai:
      '【组件】气泡确认 <ui-popconfirm>\n' +
      '【属性】title；desc；ok / cancel 按钮文字；danger 危险样式；标签内部放触发元素\n' +
      '【交互】点击触发元素在上方弹出（空间不足翻到下方）；确定派发 confirm、取消派发 cancel；Esc / 点外部关闭；Tab 在两个按钮间循环\n' +
      '【无障碍】面板 role=alertdialog；danger 时默认聚焦「取消」，防止回车误操作\n' +
      '【约束】1) 只用于可撤销或影响范围小的操作；2) 不可逆的大操作用对话框；3) 标题用问句说清后果',
    design: {
      purpose: '在原地拦一下误操作，比对话框更轻。',
      when: ['删除单条记录、移出成员、发布'],
      avoid: ['需要输入确认文字的高危操作用对话框']
    }
  },

  /* ---------------- 反馈 ---------------- */
  {
    id: 'notify',
    tag: 'window.uiNotify',
    name: '通知',
    cat: '反馈',
    brief: 'JS API，右上角带标题的通知',
    demo:
      '<button class="ui-btn ui-btn--primary" onclick="uiNotify({ title: \'导出完成\', desc: \'2026 年第三季度报表.xlsx 已保存到下载目录。\', type: \'success\', action: \'打开文件\' })">成功通知</button>' +
      '<button class="ui-btn" onclick="uiNotify({ title: \'有 3 条新评论\', desc: \'林小北、王磊等人回复了你的设计稿。\' })">普通通知</button>' +
      '<button class="ui-btn ui-btn--danger" onclick="uiNotify({ title: \'同步失败\', desc: \'网络连接中断，请检查后重试。\', type: \'danger\', duration: 0, action: \'重试\' })">常驻错误</button>',
    ai:
      '【组件】通知（函数 API）\n' +
      '【用法】uiNotify({ title, desc?, type?: info | success | warn | danger, duration?: 毫秒（默认 4500，0 为不自动关闭）, action?: 按钮文字, onAction?, onClose? })；返回 { close }\n' +
      '【行为】右上角从新到旧堆叠，最多 4 条；底部进度条显示剩余时间，鼠标悬停或聚焦时暂停；窄屏（<520px）移到底部；danger 用 role=alert，其余 role=status\n' +
      '【视觉】图标圆点 + 标题 + 描述 + 可选操作按钮，右上角 ×；跟随页面当前风格\n' +
      '【约束】1) 用于异步结果、需要更多上下文的提示；2) 只有一句话的成功反馈用 toast；3) 错误通知建议 duration: 0 并提供「重试」',
    design: {
      purpose: '告知后台任务的结果，并给出下一步操作。',
      when: ['导出完成、同步失败、新消息'],
      avoid: ['需要用户立即决定的事用对话框', '一句话反馈用 toast']
    }
  }
];
