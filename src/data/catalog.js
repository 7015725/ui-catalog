/* =========================================================
   组件元数据（画廊的唯一数据源）
   字段说明：
   id      —— 锚点/存储键
   tag     —— 自定义元素标签名
   name    —— 中文名（画廊标题）
   cat     —— 分类
   brief   —— 一句话用途
   demo    —— 预览用的 HTML（同时作为"代码"面板的一部分）
   ai      —— 给 AI Agent 的提示词（结构化，可直接投喂）
   design  —— 给设计师的说明：目的 / 何时用 / 何时别用
   ========================================================= */

import { moreCatalog } from './catalog-more.js';
import { moreCatalog2 } from './catalog-more2.js';
import { moreCatalog3 } from './catalog-more3.js';
import { motionCatalog } from './catalog-motion.js';
import { motionCatalog2 } from './catalog-motion2.js';
import { funCatalog } from './catalog-fun.js';

export const CATS = ['表单', '展示', '图表', '导航', '反馈', '浮层', '动效', '视觉', '趣味'];

const baseCatalog = [
  /* ---------------- 表单 ---------------- */
  {
    id: 'button',
    tag: 'ui-button',
    name: '按钮',
    cat: '表单',
    brief: '触发一个明确的操作',
    demo:
      '<ui-button variant="primary">保存修改</ui-button>' +
      '<ui-button>取消</ui-button>' +
      '<ui-button variant="text">了解更多</ui-button>' +
      '<ui-button variant="danger" size="sm">删除</ui-button>' +
      '<ui-button disabled>不可用</ui-button>' +
      '<ui-divider dashed>更多样式</ui-divider>' +
      '<ui-button variant="outline">描边</ui-button>' +
      '<ui-button variant="soft">柔和</ui-button>' +
      '<ui-button variant="gradient" shape="pill">渐变胶囊</ui-button>' +
      '<ui-button variant="success">通过</ui-button>' +
      '<ui-button variant="primary" loading>提交中</ui-button>' +
      '<ui-button variant="primary" shape="circle" size="sm">+</ui-button>' +
      '<ui-button size="lg" variant="primary" block>大号通栏按钮</ui-button>',
    ai:
      '【组件】按钮 <ui-button>\n' +
      '【用途】触发单一、明确的操作动作\n' +
      '【属性】variant: default | primary | outline | soft | gradient | success | danger | text；size: sm | md | lg；shape: default | pill | circle；block / loading / disabled 为布尔属性\n' +
      '【视觉】高度 var(--ui-ctl-h)，圆角 var(--ui-radius)，边框 var(--ui-border-w)，全部取自 token\n' +
      '【交互】hover 边框与文字转品牌色；primary hover 亮度 +6%；active 下沉 1px；focus-visible 显示 var(--ui-ring)\n' +
      '【约束】1) 禁止写死颜色/圆角/阴影，只能用 var(--ui-*)；2) 文案写在标签内部；3) 一个区域只保留一个 primary；' +
      '4) 图标与文字间距 6px；5) 禁用态用 disabled 属性而非仅改样式',
    design: {
      purpose: '让用户在页面上有一个明确、可预期的"下一步"。',
      when: ['提交、保存、确认等一次性动作', '同区域并列多个动作时，用 primary 标出主路径'],
      avoid: ['导航跳转应该用链接而不是按钮', '同一屏出现两个以上 primary 会让主次失效']
    }
  },
  {
    id: 'input',
    tag: 'ui-input',
    name: '输入框',
    cat: '表单',
    brief: '单行文本输入，带标签与提示',
    demo:
      '<ui-input label="用户名" placeholder="请输入用户名" hint="3-16 个字符，支持字母数字"></ui-input>' +
      '<ui-input label="邮箱" type="email" placeholder="you@example.com"></ui-input>',
    ai:
      '【组件】输入框 <ui-input>\n' +
      '【用途】收集单行文本/邮箱/密码等\n' +
      '【属性】label 标签文字；placeholder 占位；type 输入类型；value 初值；hint 辅助说明；disabled 布尔\n' +
      '【视觉】高 var(--ui-ctl-h)，圆角 var(--ui-radius)，底色 var(--ui-panel-2)\n' +
      '【交互】focus 时边框转品牌色 + var(--ui-ring) 环绕，底色提亮到 var(--ui-panel)\n' +
      '【约束】1) 必须有 label，不要只靠 placeholder；2) 错误态需额外加 aria-invalid；3) 数值类输入用 inputmode',
    design: {
      purpose: '用最低认知成本拿到用户的一小段结构化信息。',
      when: ['单个字段、长度较短', '需要即时校验并给出提示'],
      avoid: ['超过两行文本用 textarea', '选项固定且少于 8 个时优先用单选/下拉']
    }
  },
  {
    id: 'textarea',
    tag: 'ui-textarea',
    name: '多行文本',
    cat: '表单',
    brief: '长文本输入，可垂直拉伸',
    demo:
      '<ui-textarea label="备注" rows="3" placeholder="补充说明，最多 500 字"></ui-textarea>',
    ai:
      '【组件】多行文本 <ui-textarea>\n' +
      '【属性】label；placeholder；rows 默认 3\n' +
      '【视觉】最小高 76px，内边距 10px 12px，圆角 var(--ui-radius)，可 resize:vertical\n' +
      '【约束】1) 需要展示字数上限；2) 不要固定死高度，允许用户拉伸；3) 长内容要保留换行显示',
    design: {
      purpose: '承载一段自由表述，如备注、反馈、描述。',
      when: ['内容可能超过一行', '用户需要自由组织语言'],
      avoid: ['短字段（如姓名）用多行框会误导用户可以写长']
    }
  },
  {
    id: 'select',
    tag: 'ui-select',
    name: '下拉选择',
    cat: '表单',
    brief: '从预置选项中选一个',
    demo:
      '<ui-select label="城市" options="北京,上海,广州,深圳,杭州" value="上海"></ui-select>',
    ai:
      '【组件】下拉选择 <ui-select>\n' +
      '【用途】在固定选项集合中单选\n' +
      '【属性】label；options 逗号分隔字符串；value 选中项\n' +
      '【视觉】与 ui-input 完全一致，右侧 12px 处内嵌 chevron 图标\n' +
      '【约束】1) 选项少于 4 个时改用单选按钮更直观；2) 超过 15 项应支持搜索；3) 不要用下拉做多选',
    design: {
      purpose: '在有限选项里做一次单选，节省纵向空间。',
      when: ['选项数量 4-15 之间', '选项对用户来说是熟悉的枚举值'],
      avoid: ['选项很少时展开成单选更省一次点击', '展示机型、套餐等需要对比信息的场景应改用卡片']
    }
  },
  {
    id: 'switch',
    tag: 'ui-switch',
    name: '开关',
    cat: '表单',
    brief: '立即生效的二元状态',
    demo: '<ui-switch checked>自动同步</ui-switch><ui-switch>接收推送</ui-switch>',
    ai:
      '【组件】开关 <ui-switch>\n' +
      '【用途】即时生效的开/关设置\n' +
      '【属性】checked / disabled 布尔\n' +
      '【视觉】轨道 42×24px 全圆角，开启时填充 var(--ui-brand)，旋钮 18px 白色（var(--ui-brand-ink)）\n' +
      '【约束】1) 开关表示"立刻改变"，需提交才生效的用 checkbox；2) 必须有文字说明；3) 不用于三态',
    design: {
      purpose: '让设置项的改变即刻可见，减少确认成本。',
      when: ['通知、同步、免打扰等即时生效的偏好'],
      avoid: ['需要点保存才生效的表单里用 checkbox', '危险操作不要用开关（易误触）']
    }
  },
  {
    id: 'slider',
    tag: 'ui-slider',
    name: '滑块',
    cat: '表单',
    brief: '在连续区间内取值',
    demo:
      '<ui-slider label="音量" value="62"></ui-slider>' +
      '<ui-slider label="透明度" value="30" min="0" max="100" step="5"></ui-slider>',
    ai:
      '【组件】滑块 <ui-slider>\n' +
      '【属性】label；value；min 默认 0；max 默认 100；step 默认 1\n' +
      '【视觉】轨道 6px 全圆角，滑块 18px + 3px 底色描边 + 轻投影\n' +
      '【交互】拖动实时回显数值（tabular-nums 等宽数字）\n' +
      '【约束】1) 必须显示当前值；2) 需要精确输入时同时提供数字输入框；3) 区间跨度小（如 1-5）不适用',
    design: {
      purpose: '让用户在连续区间里"试出"一个合适的值。',
      when: ['音量、亮度、预算等连续量', '取值过程本身就是探索'],
      avoid: ['精确数值（如金额）应配输入框', '离散档位建议用分段控制器']
    }
  },
  {
    id: 'checkbox',
    tag: 'ui-checkbox',
    name: '复选框',
    cat: '表单',
    brief: '多选，彼此独立',
    demo:
      '<ui-checkbox checked>邮件通知</ui-checkbox>' +
      '<ui-checkbox>短信通知</ui-checkbox>' +
      '<ui-checkbox disabled>站内信（已下线）</ui-checkbox>',
    ai:
      '【组件】复选框 <ui-checkbox>\n' +
      '【属性】checked / disabled 布尔\n' +
      '【视觉】17px 方框，圆角 calc(var(--ui-radius-sm) - 3px)，选中填充 var(--ui-brand)，对勾用 var(--ui-brand-ink)\n' +
      '【约束】1) 多选互不排斥；2) 选中项超过 3 个时可提供"全选/反选"；3) 需支持半选（indeterminate）表示部分选中',
    design: {
      purpose: '让用户勾选任意多个互不冲突的选项。',
      when: ['订阅渠道、筛选条件、批量操作'],
      avoid: ['只能选一个时必须用单选']
    }
  },
  {
    id: 'radio',
    tag: 'ui-radio',
    name: '单选框',
    cat: '表单',
    brief: '互斥选项，直接可见',
    demo:
      '<ui-radio name="plan" checked>标准版</ui-radio>' +
      '<ui-radio name="plan">专业版</ui-radio>' +
      '<ui-radio name="plan">企业版</ui-radio>',
    ai:
      '【组件】单选框 <ui-radio>\n' +
      '【属性】name 分组名（同一组必须相同）；checked 布尔\n' +
      '【视觉】17px 圆形，选中时中心 11px 实心点（var(--ui-brand)）\n' +
      '【约束】1) 同组 name 必须一致；2) 选项 2-5 个最佳；3) 默认选中要谨慎，可能引导误选',
    design: {
      purpose: '把互斥选项全部摊开，省掉一次点击。',
      when: ['2-5 个选项，需要用户对比后决策'],
      avoid: ['选项多时占空间，改用下拉', '可由系统推断的默认值不要强塞']
    }
  },

  /* ---------------- 展示 ---------------- */
  {
    id: 'tag',
    tag: 'ui-tag',
    name: '标签',
    cat: '展示',
    brief: '轻量的分类/状态标记',
    demo:
      '<ui-tag>Vue</ui-tag><ui-tag variant="success" closable>已完成</ui-tag>' +
      '<ui-tag variant="warn">待审核</ui-tag><ui-tag variant="danger">已驳回</ui-tag>' +
      '<ui-tag variant="plain">草稿</ui-tag>' +
      '<ui-tag look="outline">描边</ui-tag><ui-tag variant="success" look="solid">实心</ui-tag>' +
      '<ui-tag variant="warn" look="dot">进行中</ui-tag><ui-tag variant="danger" look="square outline">方角</ui-tag>',
    ai:
      '【组件】标签 <ui-tag>\n' +
      '【用途】标注分类、状态、关键词\n' +
      '【属性】variant: brand | success | warn | danger | plain；closable 布尔（带 × 可移除）；look 外观（可组合）: outline | solid | dot | square\n' +
      '【视觉】胶囊形 var(--ui-radius-pill)，字号 12px，内边距 3px 10px，底色用对应的 *-soft token\n' +
      '【约束】1) 不用于可点击导航；2) 数量超过 6 个考虑折叠；3) 状态色语义固定：绿=成功、黄=待处理、红=失败',
    design: {
      purpose: '在密集信息中用极小体积传达归属或状态。',
      when: ['列表项的分类、状态', '筛选条件回显（可关闭）'],
      avoid: ['需要点击跳转时用链接或按钮', '整句文案不要塞进标签']
    }
  },
  {
    id: 'badge',
    tag: 'ui-badge',
    name: '徽标',
    cat: '展示',
    brief: '数字或红点提醒',
    demo:
      '<span style="display:inline-flex;gap:14px;align-items:center">消息 <ui-badge>12</ui-badge></span>' +
      '<span style="display:inline-flex;gap:14px;align-items:center">待办 <ui-badge variant="brand">NEW</ui-badge></span>' +
      '<span style="display:inline-flex;gap:14px;align-items:center">在线 <ui-badge variant="success" dot></ui-badge></span>',
    ai:
      '【组件】徽标 <ui-badge>\n' +
      '【属性】variant: danger(默认) | brand | success | warn；dot 布尔（小圆点模式）\n' +
      '【视觉】最小 18px 高、胶囊形、字号 11px 粗体；dot 模式为 8px 圆点\n' +
      '【约束】1) 数字超过 99 显示 99+；2) 用 dot 表示"有新内容"而不给数量；3) 不要与按钮文字重叠',
    design: {
      purpose: '用最小视觉重量提示"这里有新东西/有多少"。',
      when: ['未读消息数', '未完成待办'],
      avoid: ['超过 3 处同时出现徽标会让提醒失效', '不要用颜色区分严重程度，用文案']
    }
  },
  {
    id: 'avatar',
    tag: 'ui-avatar',
    name: '头像',
    cat: '展示',
    brief: '用户/实体的视觉代理',
    demo:
      '<ui-avatar name="张伟"></ui-avatar>' +
      '<ui-avatar name="李娜" size="lg"></ui-avatar>' +
      '<ui-avatar name="Wang" size="sm"></ui-avatar>',
    ai:
      '【组件】头像 <ui-avatar>\n' +
      '【属性】name 取首字回退；src 图片地址；size: sm(26) | md(36) | lg(48)\n' +
      '【视觉】正圆 + 品牌色到紫色的 135° 渐变底，文字用 var(--ui-brand-ink)\n' +
      '【约束】1) 无图时必须回退到首字，不要留空；2) 圆形裁切，图片需 object-fit:cover；3) 组合时最多叠 4 个',
    design: {
      purpose: '在列表与评论区快速指认"是谁"。',
      when: ['用户、团队、项目标识'],
      avoid: ['不要用头像承载状态信息（另加徽标）']
    }
  },
  {
    id: 'card',
    tag: 'ui-card',
    name: '卡片',
    cat: '展示',
    brief: '把一组相关信息装进一个容器',
    demo:
      '<ui-card title="项目概览" extra="v2.1">' +
      '<p style="margin:0">已完成 8 个模块，剩余 3 个模块正在进行中，预计本月底提测。</p></ui-card>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;width:100%">' +
      '<ui-card variant="outline" title="描边"><span>无阴影</span></ui-card>' +
      '<ui-card variant="filled" title="填充"><span>浅底无边</span></ui-card>' +
      '<ui-card variant="accent" hoverable title="强调"><span>悬停上浮</span></ui-card></div>',
    ai:
      '【组件】卡片 <ui-card>\n' +
      '【属性】title 标题；extra 右上角附加信息；variant: default | outline | filled | accent；hoverable 悬停上浮；内容写在标签内部\n' +
      '【视觉】圆角 var(--ui-radius-lg)，边框 var(--ui-border-w) var(--ui-line)，阴影 var(--ui-shadow)，头部与内容间用虚线分隔\n' +
      '【约束】1) 一张卡只讲一件事；2) 整卡可点时要给出 hover 反馈与焦点态；3) 卡片内部不要再嵌套卡片超过一层',
    design: {
      purpose: '用边界把相关信息圈起来，形成可扫读的块。',
      when: ['列表项需要展示多字段', '信息分组，避免大片空白'],
      avoid: ['纯文字段落不需要卡片包裹', '卡片内嵌套卡片易造成层级混乱']
    }
  },
  {
    id: 'stat',
    tag: 'ui-stat',
    name: '指标卡',
    cat: '展示',
    brief: '单个关键数字 + 变化',
    demo:
      '<ui-stat value="1,248" label="总访问" delta="+12.4%" trend="up"></ui-stat>' +
      '<ui-stat value="326" label="活跃用户" delta="-3.1%" trend="down"></ui-stat>' +
      '<ui-stat value="98.2%" label="可用率"></ui-stat>',
    ai:
      '【组件】指标卡 <ui-stat>\n' +
      '【属性】value 主数值；label 名称；delta 变化文案；trend: up | down | flat\n' +
      '【视觉】数值 20px 粗体 + 等宽数字，标签 11.5px 次要色；上涨用 var(--ui-ok)，下跌用 var(--ui-danger)\n' +
      '【约束】1) 必须带单位或百分号；2) 涨跌颜色同时要用箭头/符号冗余表达，不能只靠颜色；3) 同组指标小数位保持一致',
    design: {
      purpose: '让人三秒内看到"现在怎么样、在变好还是变坏"。',
      when: ['仪表盘顶部概览', '报表关键结论'],
      avoid: ['超过 6 个指标会失去焦点', '不要用绿色表示下跌（文化差异）']
    }
  },

  /* ---------------- 导航 ---------------- */
  {
    id: 'tabs',
    tag: 'ui-tabs',
    name: '标签页',
    cat: '导航',
    brief: '同级视图切换',
    demo: '<ui-tabs items="概览,配置,调用日志" active="0"></ui-tabs>',
    ai:
      '【组件】标签页 <ui-tabs>\n' +
      '【属性】items 逗号分隔标题；active 当前索引（0 起）\n' +
      '【视觉】底部 1px 分隔线，选中项文字转 var(--ui-brand) + 2px 下划线，下划线通过负 margin 与分隔线重合\n' +
      '【事件】点击派发 change 事件，detail = { index, label }\n' +
      '【约束】1) 标签 2-6 个；2) 选中态必须唯一；3) 切换不改变 URL 时用 tabs，需要可分享的深链用路由',
    design: {
      purpose: '在同一上下文的多个平级视图之间快速切换。',
      when: ['内容同属一个实体，只是看的角度不同'],
      avoid: ['有先后顺序的内容用步骤条', '层级不同的内容用侧边导航']
    }
  },
  {
    id: 'breadcrumb',
    tag: 'ui-breadcrumb',
    name: '面包屑',
    cat: '导航',
    brief: '展示当前位置与回退路径',
    demo: '<ui-breadcrumb items="首页,组件库,表单,按钮"></ui-breadcrumb>',
    ai:
      '【组件】面包屑 <ui-breadcrumb>\n' +
      '【属性】items 逗号分隔路径，最后一项为当前页\n' +
      '【视觉】字号 13px，上级为次要色且 hover 转品牌色，当前页为正文色不加下划线，分隔符斜杠透明度 .45\n' +
      '【约束】1) 层级不超过 4 级；2) 当前页不可点击；3) 深层页面才需要，一级页面省略',
    design: {
      purpose: '回答"我在哪、怎么回去"。',
      when: ['三级以上层级结构'],
      avoid: ['只有一级的页面显示面包屑是噪音']
    }
  },
  {
    id: 'steps',
    tag: 'ui-steps',
    name: '步骤条',
    cat: '导航',
    brief: '有顺序的多步流程',
    demo: '<ui-steps items="填写信息,确认订单,支付完成" current="1"></ui-steps>',
    ai:
      '【组件】步骤条 <ui-steps>\n' +
      '【属性】items 逗号分隔步骤名；current 当前索引（0 起）\n' +
      '【视觉】序号圆点 20px，已完成/当前填充 var(--ui-brand)，连接线 2px，走过的线段同样填充品牌色\n' +
      '【约束】1) 步骤 2-5 个；2) 已完成步骤应可点击回跳；3) 步骤名称用 2-4 个字',
    design: {
      purpose: '让用户知道"还有几步、现在到哪"。',
      when: ['注册、下单、审批等线性流程'],
      avoid: ['可以任意顺序完成的操作用标签页']
    }
  },
  {
    id: 'pagination',
    tag: 'ui-pagination',
    name: '分页',
    cat: '导航',
    brief: '分页浏览长列表',
    demo: '<ui-pagination total="6" page="2"></ui-pagination>',
    ai:
      '【组件】分页 <ui-pagination>\n' +
      '【属性】total 总页数；page 当前页（1 起）\n' +
      '【视觉】按钮 32×32、圆角 var(--ui-radius-sm)，当前页填充品牌色；首末页对应箭头按钮禁用\n' +
      '【事件】点击派发 change，detail = { page }\n' +
      '【约束】1) 页码超过 7 个时中间用省略号；2) 需要同时显示总数；3) 移动端优先"加载更多"',
    design: {
      purpose: '把长列表切成人能消化的段落。',
      when: ['表格、搜索结果等确定性总量'],
      avoid: ['信息流用无限滚动更自然', '每页数量不要让用户猜，明确显示']
    }
  },

  /* ---------------- 反馈 ---------------- */
  {
    id: 'progress',
    tag: 'ui-progress',
    name: '进度条',
    cat: '反馈',
    brief: '展示任务完成百分比',
    demo:
      '<ui-progress value="62" label="上传进度" show-value></ui-progress>' +
      '<ui-progress value="100" label="已完成"></ui-progress>',
    ai:
      '【组件】进度条 <ui-progress>\n' +
      '【属性】value 0-100；label 说明文字；show-value 布尔（右侧显示百分比）\n' +
      '【视觉】轨道 8px 全圆角 var(--ui-line)，填充 var(--ui-brand)，宽度变化 0.3s ease\n' +
      '【约束】1) 无法估算进度时改用 spinner；2) 必须给出文字说明；3) 不要用纯色块动画伪装进度',
    design: {
      purpose: '降低等待焦虑，让用户判断要不要继续等。',
      when: ['上传、导出、批量处理等有确定总量的任务'],
      avoid: ['耗时 < 1 秒的操作用进度条反而拖慢感知']
    }
  },
  {
    id: 'spinner',
    tag: 'ui-spinner',
    name: '加载指示',
    cat: '反馈',
    brief: '不确定时长的等待',
    demo:
      '<ui-spinner size="sm"></ui-spinner>' +
      '<ui-spinner></ui-spinner>' +
      '<ui-spinner size="lg"></ui-spinner>',
    ai:
      '【组件】加载指示 <ui-spinner>\n' +
      '【属性】size: sm(14) | md(20) | lg(30)\n' +
      '【视觉】2px 环形，轨道 var(--ui-line)，顶弧 var(--ui-brand)，0.72s 匀速旋转\n' +
      '【约束】1) 大于 300ms 才显示，避免闪烁；2) 局部加载放在内容区域而不是全屏遮罩；3) 尊重 prefers-reduced-motion',
    design: {
      purpose: '告诉用户"系统在忙，别走"。',
      when: ['请求耗时未知或 < 10 秒'],
      avoid: ['超过 10 秒应给出可取消入口和进度说明']
    }
  },
  {
    id: 'skeleton',
    tag: 'ui-skeleton',
    name: '骨架屏',
    cat: '反馈',
    brief: '加载中的结构占位',
    demo: '<ui-skeleton lines="3"></ui-skeleton>',
    ai:
      '【组件】骨架屏 <ui-skeleton>\n' +
      '【属性】lines 行数（1-8）\n' +
      '【视觉】12px 高圆角条，渐变 var(--ui-line) → var(--ui-panel-2) 横向 1.4s 扫光，最后一行 56% 宽\n' +
      '【约束】1) 骨架结构要贴近真实内容的排版；2) 不要与 spinner 同时出现；3) 首屏 < 500ms 不需要骨架',
    design: {
      purpose: '用"即将出现的内容形状"减少跳版与空白。',
      when: ['列表、详情页首屏加载'],
      avoid: ['内容高度差异大时骨架反而造成二次跳动']
    }
  },
  {
    id: 'empty',
    tag: 'ui-empty',
    name: '空状态',
    cat: '反馈',
    brief: '没有数据时的说明与出路',
    demo:
      '<ui-empty tip="点击右上角「新建」开始创建">还没有任何数据</ui-empty>',
    ai:
      '【组件】空状态 <ui-empty>\n' +
      '【属性】tip 辅助提示；主文案写在标签内部\n' +
      '【视觉】垂直居中，26px 半透明图标 + 13px 次要色文案，不额外加边框背景\n' +
      '【约束】1) 必须区分"空"与"加载失败"；2) 尽量给一个下一步动作；3) 不要用插画占据超过 40% 视口',
    design: {
      purpose: '把"什么都没有"变成"接下来可以做什么"。',
      when: ['首次使用、筛选无结果、列表被清空'],
      avoid: ['出错要用错误态而不是空状态']
    }
  },
  {
    id: 'alert',
    tag: 'ui-alert',
    name: '提示条',
    cat: '反馈',
    brief: '就地展示重要信息',
    demo:
      '<ui-alert variant="info" title="提示">本次改动将在保存后对全部成员生效。</ui-alert>' +
      '<ui-alert variant="danger" title="删除确认">该操作不可撤销，请确认无误。</ui-alert>',
    ai:
      '【组件】提示条 <ui-alert>\n' +
      '【属性】variant: info | success | warn | danger；title 标题；内容写在标签内部\n' +
      '【视觉】左侧图标 + 正文，底色与边框取对应的 *-soft / 主色 token，圆角 var(--ui-radius)\n' +
      '【约束】1) 一个页面最多 1 条常驻 alert；2) 颜色必须配对图标与标题，不能只靠颜色；3) 需要用户确认的结果用弹窗而不是提示条',
    design: {
      purpose: '在信息发生的位置就地说明影响，避免用户错过。',
      when: ['权限不足、影响范围说明、风险提醒'],
      avoid: ['一次性成功提示用轻提示 toast 更合适']
    }
  },

  /* ---------------- 浮层 ---------------- */
  {
    id: 'dropdown',
    tag: 'ui-dropdown',
    name: '下拉菜单',
    cat: '浮层',
    brief: '点击触发的动作菜单',
    demo:
      '<ui-dropdown items="编辑,复制链接,-,!删除">更多操作</ui-dropdown>' +
      '<ui-dropdown items="按名称排序,按时间排序,按大小排序" size="sm" placement="bottom-end">排序</ui-dropdown>',
    ai:
      '【组件】下拉菜单 <ui-dropdown>\n' +
      '【用途】把一组动作收进一个触发器后面，节省横向空间\n' +
      '【属性】items 逗号分隔菜单项（"-" 渲染分隔线，"!" 前缀标记危险项）；placement: bottom-start | bottom-end | top-start | top-end；variant / size 与 ui-button 一致\n' +
      '【行为】点击触发器开合；选中派发 select 事件 detail = { index, label }；点面板外部或按 Esc 关闭；下方空间不足自动翻转到上方\n' +
      '【视觉】面板取 var(--ui-panel) / var(--ui-line) / var(--ui-shadow)，挂载在 body 的 portal 里，不受父级 overflow 裁切\n' +
      '【约束】1) 表单选择请用 ui-select，不要用菜单；2) 菜单项不超过 8 个；3) 危险项必须用 ! 前缀且排在最后；4) 触发器文案要说清"是什么操作的菜单"',
    design: {
      purpose: '让次要操作在需要时才出现，保持界面清爽。',
      when: ['行内操作超过 3 个', '低频、次要的批量动作'],
      avoid: ['只有一个动作时直接放按钮', '选项之间需要对比信息时改用卡片']
    }
  },
  {
    id: 'tooltip',
    tag: 'ui-tooltip',
    name: '文字提示',
    cat: '浮层',
    brief: '悬停/聚焦时的补充说明',
    demo:
      '<ui-tooltip text="最多 60 个字符" placement="top-center"><ui-button size="sm">悬停查看</ui-button></ui-tooltip>' +
      '<ui-tooltip text="这一项会影响所有成员" placement="right-center"><ui-tag variant="warn">权限说明</ui-tag></ui-tooltip>',
    ai:
      '【组件】文字提示 <ui-tooltip>\n' +
      '【用途】对图标、缩写、危险操作做补充说明\n' +
      '【属性】text 提示正文；placement: top-center | bottom-center | right-center | left-center\n' +
      '【交互】mouseenter / focusin 后 120ms 显示，mouseleave / focusout 立即隐藏；面板 pointer-events:none 不挡鼠标\n' +
      '【视觉】深色底（var(--ui-text)）+ 反色文字，12px，最大宽 240px\n' +
      '【约束】1) 只补充说明，不能承载必须阅读的信息；2) 不超过 30 个汉字；3) 触屏设备没有 hover，关键信息不能只放 tooltip',
    design: {
      purpose: '在不占版面的前提下解释一个陌生的东西。',
      when: ['图标按钮的语义、字段含义、权限说明'],
      avoid: ['长文案、带格式的内容（用 popover）', '移动端的主要信息通道']
    }
  },
  {
    id: 'datepicker',
    tag: 'ui-datepicker',
    name: '日期选择',
    cat: '浮层',
    brief: '月历面板选择单个日期',
    demo: '<ui-datepicker label="起始日期" value="2026-10-31"></ui-datepicker>' +
      '<ui-datepicker label="结束日期" placeholder="选择结束日期"></ui-datepicker>',
    ai:
      '【组件】日期选择 <ui-datepicker>\n' +
      '【用途】选择单个日期（YYYY-MM-DD）\n' +
      '【属性】label；value 形如 2026-10-31；placeholder；placement\n' +
      '【行为】点击打开月历；‹ › 切换月份；点日期后关闭并派发 change，detail = { value }；今天有描边、选中项填充品牌色\n' +
      '【视觉】触发器与 ui-input 一致；面板 254px 宽，7 列等分网格，一周从周一开始\n' +
      '【约束】1) 值必须是 YYYY-MM-DD，不要传中文日期；2) 区间选择需要两个实例并校验先后；3) 时区按本地时间处理，跨时区业务要显式说明',
    design: {
      purpose: '让人在不确定具体日期时也能靠"看日历"选对。',
      when: ['预约、报表区间、生效日期'],
      avoid: ['只需要年份时给下拉', '已知日期可直接输入的场景允许手输更快']
    }
  },
  {
    id: 'tree',
    tag: 'ui-tree',
    name: '树形控件',
    cat: '浮层',
    brief: '层级结构展开与选中',
    demo: `<ui-tree data='[{"label":"src","open":true,"children":[{"label":"components","children":[{"label":"base.js"},{"label":"overlay.js"}]},{"label":"styles"},{"label":"app.js"}]},{"label":"index.html"},{"label":"README.md"}]'></ui-tree>`,
    ai:
      '【组件】树形控件 <ui-tree>\n' +
      '【用途】展示与选择层级数据（目录、组织架构、权限分类）\n' +
      '【属性】data 为 JSON 字符串，节点形如 { label, key?, open?, children? }；selected 指定默认选中项的 key\n' +
      '【行为】点箭头展开/折叠；点文字选中并派发 select，detail = { key, label }\n' +
      '【视觉】行高约 28px，缩进每层 16px，选中行用 var(--ui-brand-soft) 底 + 品牌色文字\n' +
      '【约束】1) data 必须是合法 JSON 且为数组，否则组件显示错误提示；2) 层级建议不超过 4 层；3) 大数据量（>500 节点）需自行做虚拟滚动',
    design: {
      purpose: '用缩进表达从属关系，让层级结构一眼可读。',
      when: ['目录、组织、分类等天然树形数据'],
      avoid: ['扁平数据用列表', '层级深且需要频繁横向对比时用表格']
    }
  },
  {
    id: 'toast',
    tag: 'window.uiToast',
    name: '轻提示 Toast',
    cat: '浮层',
    brief: 'JS API，底部短暂提示',
    demo: `<button class="ui-btn ui-btn--primary" onclick="uiToast('保存成功')">触发轻提示</button><button class="ui-btn" onclick="uiToast('网络异常，请稍后重试', { duration: 2600 })">错误提示</button>`,
    ai:
      '【组件】轻提示（函数 API，不是自定义元素）\n' +
      '【用法】uiToast("保存成功")；可选 uiToast("文案", { duration: 2600 })\n' +
      '【行为】插入到 #ui-toast-root，1.8s 后淡出并自动移除；多条自动纵向堆叠\n' +
      '【视觉】底部居中、深色底反色文字、圆角 var(--ui-radius)；不阻塞点击（pointer-events:none）\n' +
      '【约束】1) 只用于"操作已完成"这类无需回应的反馈；2) 文案不超过 20 字，不带按钮；3) 需要用户确认的用对话框；4) 不要连续弹多条同样内容',
    design: {
      purpose: '确认操作已生效，但不打断当前流程。',
      when: ['保存、复制、删除成功等瞬时反馈'],
      avoid: ['错误需要用户处理时用提示条或对话框', '需要用户点击确认的场景']
    }
  },

  /* ---------------- 新增：表格 / 折叠 / 分段 / 评分 ---------------- */
  {
    id: 'table',
    tag: 'ui-table',
    wide: true,
    name: '数据表格',
    cat: '展示',
    brief: '列定义 + 数据渲染',
    demo: `<ui-table zebra caption="最近订单" columns='[{"key":"name","title":"订单"},{"key":"status","title":"状态"},{"key":"qty","title":"数量"}]' rows='[{"name":"订单 A","status":"已完成","qty":128},{"name":"订单 B","status":"待处理","qty":36},{"name":"订单 C","status":"已完成","qty":92}]'></ui-table>`,
    ai:
      '【组件】数据表格 <ui-table>\n' +
      '【用途】展示结构化的多字段记录\n' +
      '【属性】columns / rows 均为 JSON 数组字符串，columns 项为 { key, title }；caption 表标题；zebra 斑马纹；dense 紧凑行高；empty-text 空数据文案\n' +
      '【视觉】表头 12px 次要色常规字重无背景，行间 1px 分隔线，最后一列去底边；斑马纹用 var(--ui-panel-2)\n' +
      '【约束】1) columns 必须定义才能渲染；2) 空数据自动渲染整行空状态；3) 单元格只输出文本，需要徽章等富内容请自行包一层；4) 列数超过 6 建议加 dense',
    design: {
      purpose: '让多字段记录可横向对比、纵向扫读。',
      when: ['订单、用户、日志等结构化列表', '需要按列对齐比较数值'],
      avoid: ['只有两三个字段用列表/卡片更轻', '移动端窄屏优先卡片列表']
    }
  },
  {
    id: 'accordion',
    tag: 'ui-accordion',
    name: '折叠面板',
    cat: '展示',
    brief: '分组的展开/收起',
    demo: `<ui-accordion open="0" items='[{"title":"这个组件怎么用？","content":"点标题即可展开或收起，内容由 items 的 content 字段提供。"},{"title":"可以同时展开多个吗？","content":"加 multiple 属性即可，默认是单开的手风琴。"},{"title":"键盘能操作吗？","content":"可以：↑↓ 切换标题，Enter/Space 展开收起。"}]'></ui-accordion>`,
    ai:
      '【组件】折叠面板 <ui-accordion>\n' +
      '【用途】把长内容分组折叠，降低首屏高度\n' +
      '【属性】items 为 JSON 数组字符串（{ title, content }）；open 初始展开项索引（多个用逗号）；multiple 允许同时展开\n' +
      '【行为】点击标题切换；单开模式下打开一项会自动收起其它项；派发 change 由宿主自行监听（可选）\n' +
      '【视觉】每项独立边框 + 圆角，标题 13px 中等字重，右侧 ▾ 随展开旋转 180°\n' +
      '【约束】1) 每项标题用疑问句或名词短语，不要写成段落；2) 项数建议 3-8；3) 需要用户对照阅读的内容不要折叠',
    design: {
      purpose: '让用户按需展开，把不关心的内容收起来。',
      when: ['FAQ、设置分组、详情页的长描述'],
      avoid: ['用户几乎一定会看的核心内容不要默认收起', '需要并排对比的内容不适合折叠']
    }
  },
  {
    id: 'segmented',
    tag: 'ui-segmented',
    name: '分段控制器',
    cat: '表单',
    brief: '2-5 个互斥选项的快速切换',
    demo: '<ui-segmented items="日,周,月,年" value="周"></ui-segmented>',
    ai:
      '【组件】分段控制器 <ui-segmented>\n' +
      '【用途】在少量互斥选项中快速切换，并立即生效\n' +
      '【属性】items 逗号分隔；value 当前值（默认为第一项）\n' +
      '【行为】点击即切换并派发 change，detail = { value }；←→ 切换并跟随焦点\n' +
      '【视觉】外层 var(--ui-panel-2) 底 + 内边距 3px，选中项用 var(--ui-panel) 白底 + 品牌色文字 + 轻阴影\n' +
      '【约束】1) 选项 2-5 个，超过 5 个改用下拉；2) 选项文案等宽（都是 2-3 字）；3) 切换应立即生效，需要「确定」按钮的用单选按钮',
    design: {
      purpose: '用一次点击完成模式切换，比下拉少一步。',
      when: ['时间粒度、视图密度、图表区间等高频切换'],
      avoid: ['选项多或文案长短不一时用下拉', '需要提交才生效的表单用单选']
    }
  },
  {
    id: 'rate',
    tag: 'ui-rate',
    name: '评分',
    cat: '表单',
    brief: '星级打分，可只读',
    demo: '<ui-rate value="3"></ui-rate><ui-rate value="4" readonly></ui-rate>',
    ai:
      '【组件】评分 <ui-rate>\n' +
      '【属性】value 当前分值；max 满分（默认 5）；readonly 只读展示\n' +
      '【行为】点星即设值并派发 change，detail = { value }；←→/↑↓ 加减 1、Home/End 到两端；只读时不可操作\n' +
      '【视觉】实心★用 var(--ui-warn)，空心☆用 var(--ui-line)；右侧显示 n/max\n' +
      '【约束】1) 必须显示当前分值文本，不能只靠星星数量；2) 只读场景要加 readonly 而不是仅仅去掉事件；3) 不用评分表达非线性的满意度等级',
    design: {
      purpose: '把主观评价压缩成一次点击。',
      when: ['商品/内容评分、满意度打分'],
      avoid: ['需要解释原因的反馈场景（应配文本框）', '选项含义不等距时用单选']
    }
  },

  /* ---------------- 新增：对话框 / 抽屉 / 气泡 ---------------- */
  {
    id: 'modal',
    tag: 'ui-modal',
    name: '对话框',
    cat: '浮层',
    brief: '需要用户确认的强打断浮层',
    demo: `<ui-modal id="demo-modal" title="删除确认"><p style="margin:0 0 14px">删除后不可恢复，请确认是否继续。</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="ui-btn" onclick="document.getElementById('demo-modal').close()">取消</button><button class="ui-btn ui-btn--danger" onclick="document.getElementById('demo-modal').close()">删除</button></div></ui-modal><button class="ui-btn ui-btn--primary" onclick="document.getElementById('demo-modal').show()">打开对话框</button>`,
    ai:
      '【组件】对话框 <ui-modal>\n' +
      '【属性】title 标题；open 布尔（也可用 JS 调用 show()/close()）；width 面板宽度；no-mask-close 禁止点遮罩关闭\n' +
      '【结构】内容写在标签内，打开时被搬进面板（保留原有事件绑定）\n' +
      '【行为】Esc 关闭、点遮罩关闭、Tab 焦点锁在面板内、关闭后焦点归还触发元素\n' +
      '【视觉】遮罩 rgba(15,18,24,.5) + 2px 模糊，面板圆角 var(--ui-radius-lg)，头部虚线分隔\n' +
      '【约束】1) 只用于必须确认或必须打断的场景；2) 标题说清动作（「删除确认」而不是「提示」）；3) 主按钮放右侧且只有一个；4) 不要嵌套对话框',
    design: {
      purpose: '强制用户对重要动作做出选择，避免误操作。',
      when: ['删除、支付、离开未保存页面等不可逆动作'],
      avoid: ['只是通知用 toast / alert', '内容多且需参考上下文时用抽屉更轻']
    }
  },
  {
    id: 'drawer',
    tag: 'ui-drawer',
    name: '抽屉',
    cat: '浮层',
    brief: '侧滑面板，保留页面上下文',
    demo: `<ui-drawer id="demo-drawer" title="筛选条件"><div style="display:flex;flex-direction:column;gap:10px"><ui-segmented items="全部,进行中,已完成"></ui-segmented><ui-input label="关键字" placeholder="订单号或客户名"></ui-input><div style="display:flex;gap:8px;justify-content:flex-end"><button class="ui-btn" onclick="document.getElementById('demo-drawer').close()">重置</button><button class="ui-btn ui-btn--primary" onclick="document.getElementById('demo-drawer').close()">应用</button></div></div></ui-drawer><button class="ui-btn" onclick="document.getElementById('demo-drawer').show()">打开抽屉</button>`,
    ai:
      '【组件】抽屉 <ui-drawer>\n' +
      '【属性】title 标题；open 布尔；side: right(默认) | left；width 面板宽度\n' +
      '【行为】右侧滑入；Esc 关闭、点遮罩关闭、Tab 焦点锁在面板内、关闭后焦点归还\n' +
      '【视觉】全高、贴边、圆角 0，左侧 1px 分隔线；滑入 0.22s\n' +
      '【约束】1) 用于「设置/筛选/详情」这类可放弃的辅助内容；2) 宽度不超过视口 88%；3) 需要用户做完才发现错误的流程不要用抽屉',
    design: {
      purpose: '在不离开当前页面的前提下处理一段辅助任务。',
      when: ['筛选、设置、行详情、消息面板'],
      avoid: ['必须阻断的危险确认用对话框', '移动端全屏任务用独立页面']
    }
  },
  {
    id: 'popover',
    tag: 'ui-popover',
    name: '气泡卡片',
    cat: '浮层',
    brief: '可放交互内容的小浮层',
    demo: `<ui-popover content='<p style="margin:0 0 8px">这里可以放<b>任意内容</b>，包括按钮和链接。</p><button class="ui-btn ui-btn--primary" style="font-size:12px;padding:6px 12px">知道了</button>'><ui-button size="sm">点击查看</ui-button></ui-popover>`,
    ai:
      '【组件】气泡卡片 <ui-popover>\n' +
      '【用途】承载比 tooltip 重、比对话框轻的交互内容\n' +
      '【属性】content 面板 HTML 字符串；placement 同 tooltip；trigger: click(默认) | hover\n' +
      '【行为】点击开合（hover 模式带 140ms 离开延迟），点外部或 Esc 关闭，下方空间不足自动翻转\n' +
      '【视觉】面板 var(--ui-panel) + var(--ui-shadow)，最小宽 160px\n' +
      '【约束】1) 不要在 content 里放需要长时间操作的表单；2) 面板宽度 `≤280px`；3) 触屏优先用 click 触发',
    design: {
      purpose: '就地展开一小段说明或几个操作，不打断视线。',
      when: ['字段解释 + 快捷操作、图例说明'],
      avoid: ['只是纯文本提示用 tooltip', '内容需要超过一屏用抽屉']
    }
  }
];

export const catalog = baseCatalog.concat(moreCatalog, moreCatalog2, moreCatalog3, motionCatalog, motionCatalog2, funCatalog);
