/* =========================================================
   扩展组件元数据（第二批）——字段与 catalog.js 完全一致
   wide: true 表示在宽屏下占两列
   ========================================================= */
export const moreCatalog = [
  /* ---------------- 表单 ---------------- */
  {
    id: 'number',
    tag: 'ui-number',
    name: '数字步进器',
    cat: '表单',
    brief: '带加减按钮的数值输入',
    demo:
      '<ui-number label="购买数量" value="2" min="1" max="10"></ui-number>' +
      '<ui-number label="折扣" value="0.8" min="0" max="1" step="0.1"></ui-number>' +
      '<ui-number label="时长" value="30" step="15" suffix="分钟"></ui-number>',
    ai:
      '【组件】数字步进器 <ui-number>\n' +
      '【用途】输入有上下限、有步长的数值\n' +
      '【属性】label；value；min / max（可空）；step 步长（决定小数位）；suffix 单位；disabled\n' +
      '【交互】− / + 按钮按 step 增减，到达边界自动禁用；输入框 ↑↓ 键同样增减；失焦时自动夹取到 [min,max]；派发 change，detail = { value }\n' +
      '【视觉】整体与输入框同高 var(--ui-ctl-h)，按钮与数字间 var(--ui-border-w) 分隔线；focus-within 显示 var(--ui-ring)\n' +
      '【约束】1) 数字用 tabular-nums 等宽；2) 必须给出边界，否则用户会输入离谱值；3) 范围很大（>100 档）时改用输入框或滑块',
    design: {
      purpose: '让小范围数值的调整既可点也可输。',
      when: ['购物数量、人数、重试次数', '需要精确到某个步长的设置'],
      avoid: ['范围极大或无边界的数值', '只需粗略调节时用滑块更直观']
    }
  },
  {
    id: 'tag-input',
    tag: 'ui-tag-input',
    name: '标签输入',
    cat: '表单',
    brief: '回车把输入变成标签',
    demo: '<ui-tag-input label="技能标签" value="设计,前端,增长" max="6" placeholder="输入后回车"></ui-tag-input>',
    ai:
      '【组件】标签输入 <ui-tag-input>\n' +
      '【用途】收集若干个短文本（关键词、邮箱、技能）\n' +
      '【属性】label；value 逗号分隔的初始标签；placeholder；max 最多数量（可空）\n' +
      '【交互】Enter 或逗号添加，重复项忽略；输入为空时 Backspace 删除最后一个；× 删除单个；派发 change，detail = { value: string[] }；输入法组字中（isComposing）不触发添加\n' +
      '【视觉】容器与输入框同风格，可换行；标签为品牌浅底胶囊；达到上限时输入框禁用并显示 n / max\n' +
      '【约束】1) 标签文案不超过 12 字；2) 必须支持键盘删除；3) 有固定候选集合时改用多选 chips',
    design: {
      purpose: '把自由输入的多个值整理成可见、可删的单元。',
      when: ['关键词、收件人、标签分类'],
      avoid: ['候选是固定集合时用筛选标签组', '只有一个值时用普通输入框']
    }
  },
  {
    id: 'otp',
    tag: 'ui-otp',
    name: '验证码输入',
    cat: '表单',
    brief: '分格输入短信/邮箱验证码',
    demo: '<ui-otp length="6"></ui-otp><ui-otp length="4" value="2580"></ui-otp>',
    ai:
      '【组件】验证码输入 <ui-otp>\n' +
      '【属性】length 位数（3-10，默认 6）；value 初值\n' +
      '【交互】只接受数字；输入后自动跳到下一格；空格上 Backspace 回到上一格并清空；←→ 移动；粘贴整串自动分配；全部填满派发 complete，detail = { value }\n' +
      '【视觉】每格 44×52，字号 20 粗体居中；填满后边框与文字转 var(--ui-ok)；窄容器里格子自动收缩\n' +
      '【约束】1) 第一格加 autocomplete="one-time-code" 以便系统自动填充；2) inputmode="numeric" 唤起数字键盘；3) 不要用 type=number（会出现滚轮/箭头）',
    design: {
      purpose: '让短验证码的输入可视、可预期、可一次粘贴。',
      when: ['短信/邮箱登录、二次验证'],
      avoid: ['超过 8 位或包含字母的口令用普通输入框']
    }
  },
  {
    id: 'upload',
    tag: 'ui-upload',
    name: '拖拽上传',
    cat: '表单',
    brief: '点击或拖拽选择文件',
    demo: '<ui-upload multiple accept="image/*,.pdf" tip="支持 PNG / JPG / PDF，单个不超过 10MB"></ui-upload>',
    ai:
      '【组件】拖拽上传 <ui-upload>\n' +
      '【属性】accept 文件类型；multiple 多选；tip 说明文字\n' +
      '【交互】整个区域可点击（透明 input 覆盖）；拖入时高亮；选择后在下方列出文件名与大小；派发 change，detail = { files: File[] }\n' +
      '【视觉】虚线边框 var(--ui-line)，圆角 var(--ui-radius-lg)；hover / 拖入 / 聚焦时边框转品牌色、底色 var(--ui-brand-soft)\n' +
      '【约束】1) tip 里写清格式与大小限制；2) 真正上传与进度由业务处理，组件只负责选择；3) 移动端只保留点击选择',
    design: {
      purpose: '给文件一个明确的「投放点」。',
      when: ['附件、头像、批量导入'],
      avoid: ['表单里只需一个小附件时用普通按钮触发即可']
    }
  },
  {
    id: 'color',
    tag: 'ui-color',
    name: '色板选择',
    cat: '表单',
    brief: '从预设颜色中选一个',
    demo: '<ui-color value="#8b5cf6"></ui-color>',
    ai:
      '【组件】色板选择 <ui-color>\n' +
      '【属性】colors 逗号分隔的颜色值；value 当前颜色\n' +
      '【交互】role=radiogroup，方向键循环切换并跟随焦点；点击选中；派发 change，detail = { value }\n' +
      '【视觉】28px 圆点，外圈 var(--ui-panel) 间隙 + var(--ui-line) 描边；选中态外圈变为 var(--ui-text)\n' +
      '【约束】1) 颜色数量 6-12 个；2) 每个色块需要 aria-label；3) 需要任意颜色时再额外提供取色器',
    design: {
      purpose: '让用户快速给对象打上视觉标记。',
      when: ['标签颜色、日历分类、主题强调色'],
      avoid: ['需要精确品牌色值的场景']
    }
  },
  {
    id: 'chips',
    tag: 'ui-chips',
    name: '筛选标签组',
    cat: '表单',
    brief: '可多选的胶囊按钮',
    demo:
      '<ui-chips items="全部,前端,设计,产品,运营,数据" value="前端,设计"></ui-chips>' +
      '<ui-chips single items="最新,最热,好评" value="最热"></ui-chips>',
    ai:
      '【组件】筛选标签组 <ui-chips>\n' +
      '【属性】items 逗号分隔；value 选中项（逗号分隔）；single 单选模式\n' +
      '【交互】每个按钮 aria-pressed 表示选中；点击切换；派发 change，detail = { value: string[] }\n' +
      '【视觉】胶囊按钮 var(--ui-radius-pill)，选中态品牌浅底 + 品牌描边 + ✓ 前缀\n' +
      '【约束】1) 选项文案 2-4 字；2) 超过 12 个选项改用下拉多选；3) 筛选应即时生效',
    design: {
      purpose: '用一排可点的标签完成多条件筛选。',
      when: ['列表筛选、兴趣选择、快速过滤'],
      avoid: ['选项很多或层级化时用树形选择或下拉']
    }
  },

  /* ---------------- 展示 ---------------- */
  {
    id: 'timeline',
    tag: 'ui-timeline',
    name: '时间线',
    cat: '展示',
    brief: '按时间顺序展示事件',
    demo: `<ui-timeline items='[{"title":"订单已提交","time":"10:02","desc":"系统已收到你的订单"},{"title":"支付成功","time":"10:03","status":"success"},{"title":"仓库拣货中","time":"11:20","status":"warn","desc":"预计今日 18:00 前发出"},{"title":"等待揽收","status":"muted"}]'></ui-timeline>`,
    ai:
      '【组件】时间线 <ui-timeline>\n' +
      '【属性】items 为 JSON 数组：{ title, time?, desc?, status?: brand | success | warn | danger | muted }\n' +
      '【视觉】左侧 14px 空心圆点 + 2px 竖线串联，最后一项无竖线；标题与时间两端对齐，窄时自动换行\n' +
      '【约束】1) 按时间正序或倒序保持一致；2) 未发生的步骤用 muted；3) 描述控制在两行内',
    design: {
      purpose: '让用户看清「发生了什么、发生到哪了」。',
      when: ['物流进度、操作日志、版本记录'],
      avoid: ['需要用户主动推进的流程用步骤条']
    }
  },
  {
    id: 'avatar-group',
    tag: 'ui-avatar-group',
    name: '头像组',
    cat: '展示',
    brief: '叠放多个成员头像',
    demo:
      '<ui-avatar-group names="王磊,李娜,张伟,陈静,刘洋,赵敏" max="4"></ui-avatar-group>' +
      '<ui-avatar-group size="sm" names="周,吴,郑" max="5"></ui-avatar-group>',
    ai:
      '【组件】头像组 <ui-avatar-group>\n' +
      '【属性】names 逗号分隔；max 最多显示几个（默认 4），其余折叠为 +N；size: md | sm\n' +
      '【视觉】头像负间距 -8px 叠放，外圈 2px var(--ui-panel) 描边做分隔；悬停上浮 3px；+N 用 var(--ui-panel-2) 底\n' +
      '【约束】1) title 显示完整姓名；2) +N 的 title 列出被折叠的人；3) 超过 99 人时显示 99+',
    design: {
      purpose: '在很小的空间里表达「有哪些人参与」。',
      when: ['项目成员、文档协作者、活动参与者'],
      avoid: ['需要逐个操作成员时用列表']
    }
  },
  {
    id: 'descriptions',
    tag: 'ui-descriptions',
    name: '描述列表',
    cat: '展示',
    brief: '键值对信息，自动换列',
    wide: true,
    demo: `<ui-descriptions title="订单信息" items='[{"label":"订单号","value":"NO.20261101-0832"},{"label":"下单时间","value":"2026-11-01 10:02"},{"label":"收货人","value":"林小北"},{"label":"支付方式","value":"微信支付"},{"label":"配送方式","value":"顺丰次日达"},{"label":"实付金额","value":"¥ 1,280.00"}]'></ui-descriptions>`,
    ai:
      '【组件】描述列表 <ui-descriptions>\n' +
      '【属性】title 标题；items 为 JSON 数组 { label, value }；min 每列最小宽（默认 150px）\n' +
      '【布局】grid repeat(auto-fit, minmax(min(100%, min), 1fr))：容器宽就多列，窄就自动变一列，无需媒体查询\n' +
      '【视觉】1px 网格线由父级背景色 var(--ui-line) + gap 形成；label 11.5px 次要色，value 13px 正文色\n' +
      '【约束】1) value 只放文本或短标签；2) 长文本单独成块不要放进格子；3) 语义使用 dl / dt / dd',
    design: {
      purpose: '把详情页的零散字段排成整齐、可扫读的网格。',
      when: ['订单详情、用户资料、配置摘要'],
      avoid: ['需要编辑的字段用表单', '多条记录对比用表格']
    }
  },
  {
    id: 'list',
    tag: 'ui-list',
    name: '列表',
    cat: '展示',
    brief: '图标 + 标题 + 描述 + 附加信息',
    demo: `<ui-list hoverable items='[{"icon":"📄","title":"季度报告.pdf","desc":"更新于 2 小时前 · 林小北","extra":"2.4 MB"},{"icon":"🖼️","title":"首页 Banner 设计稿","desc":"更新于昨天 · 设计组","extra":"8.1 MB"},{"icon":"📊","title":"用户增长数据","desc":"更新于 3 天前 · 数据组","extra":"512 KB"}]'></ui-list>`,
    ai:
      '【组件】列表 <ui-list>\n' +
      '【属性】items 为 JSON 数组 { icon?, title, desc?, extra? }；hoverable 行悬停高亮\n' +
      '【视觉】行内边距 10px 12px，行间 1px 分隔线；图标 34px 方块品牌浅底；标题/描述单行省略\n' +
      '【约束】1) 单行信息不超过 3 层；2) 行内操作按钮放在 extra 位置；3) 超过 50 条需分页或虚拟滚动',
    design: {
      purpose: '在窄空间中纵向陈列同类对象，比表格更轻。',
      when: ['文件、消息、通知、移动端记录'],
      avoid: ['需要按列比较数值时用表格']
    }
  },
  {
    id: 'carousel',
    tag: 'ui-carousel',
    name: '轮播',
    cat: '展示',
    brief: '横向切换的多张内容',
    wide: true,
    demo: `<ui-carousel autoplay="4000" slides='[{"title":"双十一预售开启","desc":"全场满 300 减 50，叠加会员折扣"},{"title":"新品发布会","desc":"11 月 18 日 20:00 线上直播"},{"title":"邀请好友得积分","desc":"每邀请 1 人得 200 积分"}]'></ui-carousel>`,
    ai:
      '【组件】轮播 <ui-carousel>\n' +
      '【属性】slides 为 JSON 数组 { title, desc? }；autoplay 自动切换间隔毫秒（空=不自动，最小 1500）；index 当前页\n' +
      '【交互】左右箭头、底部圆点、触屏左右滑动（>40px）切换；鼠标悬停暂停自动播放；prefers-reduced-motion 时关闭动画与自动播放\n' +
      '【视觉】圆角 var(--ui-radius-lg)；每张用品牌色渐变底；当前圆点拉长为 20px 胶囊\n' +
      '【约束】1) 张数 2-5；2) 关键信息不能只放在第 2 张以后；3) 每张需有 aria-label="n / 总数"',
    design: {
      purpose: '在有限的首屏空间轮换展示几条运营信息。',
      when: ['首页 Banner、活动推荐、功能引导'],
      avoid: ['核心信息不要藏在轮播里', '内容多于 5 条用列表或网格']
    }
  },
  {
    id: 'code',
    tag: 'ui-code',
    name: '代码块',
    cat: '展示',
    brief: '带行号与复制按钮',
    demo: `<ui-code language="bash" line-numbers code="npm run dev\\n# 打开 http://127.0.0.1:5173\\n# 改 .css 即时生效，改 .js 自动刷新"></ui-code>`,
    ai:
      '【组件】代码块 <ui-code>\n' +
      '【属性】code 代码文本（\\n 换行）；language 语言标注（不用 lang，那是 HTML 全局属性）；line-numbers 显示行号\n' +
      '【交互】右上角「复制」按钮复制原始代码并反馈「已复制 ✓」\n' +
      '【视觉】等宽字体 var(--ui-mono) 12px，行高 1.7；横向超出时滚动而不是换行；头部三色圆点装饰\n' +
      '【约束】1) 代码按纯文本输出，必须转义；2) 不做语法高亮以保持零依赖，需要时外接高亮库',
    design: {
      purpose: '让用户能读、能复制一段代码或命令。',
      when: ['文档、安装说明、API 示例'],
      avoid: ['行内一个命令用 <code> 即可']
    }
  },
  {
    id: 'kbd',
    tag: 'ui-kbd',
    name: '快捷键',
    cat: '展示',
    brief: '展示键盘组合键',
    demo: '<ui-kbd keys="Ctrl + K"></ui-kbd><ui-kbd keys="⌘ + Shift + P"></ui-kbd><ui-kbd keys="Esc"></ui-kbd>',
    ai:
      '【组件】快捷键 <ui-kbd>\n' +
      '【属性】keys 用 + 分隔的按键\n' +
      '【视觉】每个键为 <kbd>，等宽字体，底边加厚 2px 模拟键帽\n' +
      '【约束】1) Mac 用 ⌘ ⌥ ⇧，Windows 用 Ctrl Alt Shift；2) 不要用它展示非按键文本',
    design: {
      purpose: '让快捷键一眼可辨，而不是混在正文里。',
      when: ['菜单项右侧、帮助文档、空状态提示'],
      avoid: ['移动端没有物理键盘时隐藏']
    }
  },
  {
    id: 'divider',
    tag: 'ui-divider',
    name: '分割线',
    cat: '展示',
    brief: '分隔内容，可带文字',
    demo: '<ui-divider>或使用以下方式登录</ui-divider><ui-divider align="left" dashed>高级设置</ui-divider><ui-divider></ui-divider>',
    ai:
      '【组件】分割线 <ui-divider>\n' +
      '【属性】align: center | left；dashed 虚线；文字写在标签内部（可空）\n' +
      '【视觉】两侧伪元素画线，颜色 var(--ui-line)、粗细 var(--ui-border-w)；文字 12px 次要色\n' +
      '【约束】1) role=separator；2) 能用间距解决的分组不要加线',
    design: {
      purpose: '在同一容器里切开两段不同性质的内容。',
      when: ['登录方式分隔、设置分组'],
      avoid: ['卡片之间已有边界时无需再加']
    }
  },

  /* ---------------- 导航 ---------------- */
  {
    id: 'navbar',
    tag: 'ui-navbar',
    name: '顶部导航栏',
    cat: '导航',
    brief: '容器变窄自动折叠为汉堡菜单',
    wide: true,
    demo:
      '<ui-navbar brand="Acme" items="首页,产品,价格,文档,博客" active="1">' +
      '<ui-button size="sm" variant="primary">登录</ui-button></ui-navbar>' +
      '<div style="width:100%;max-width:340px"><ui-navbar brand="窄容器" items="首页,产品,价格" active="0"></ui-navbar></div>',
    ai:
      '【组件】顶部导航栏 <ui-navbar>\n' +
      '【属性】brand 品牌名；items 逗号分隔的链接；active 当前项索引；标签内部内容放在右侧操作区（如登录按钮）\n' +
      '【自适应】宿主 container-type:inline-size，用 @container (max-width:520px) 判断——注意是「容器宽度」而不是视口宽度，放进侧栏同样会折叠\n' +
      '【交互】窄时出现 ☰ 按钮，点击展开纵向链接列表（aria-expanded 同步）；点击链接设为当前并收起，派发 change，detail = { index, label }\n' +
      '【视觉】当前链接品牌浅底 + 品牌色文字；整条为 var(--ui-panel) + var(--ui-shadow-sm)\n' +
      '【约束】1) 一级链接不超过 6 个；2) 当前页用 aria-current="page"；3) 不要在导航里放表单',
    design: {
      purpose: '给整站一个稳定的顶层入口，并在任何宽度下都可用。',
      when: ['官网、文档站、中小型应用顶栏'],
      avoid: ['层级很深的后台用侧边菜单']
    }
  },
  {
    id: 'menu',
    tag: 'ui-menu',
    name: '侧边菜单',
    cat: '导航',
    brief: '分组 + 二级折叠 + 徽标',
    demo: `<ui-menu active="1" open="3" items='[{"group":"工作台"},{"icon":"🏠","label":"概览"},{"icon":"📥","label":"消息","badge":"12"},{"icon":"📁","label":"项目","children":[{"label":"进行中"},{"label":"已归档"}]},{"group":"系统"},{"icon":"⚙️","label":"设置"}]'></ui-menu>`,
    ai:
      '【组件】侧边菜单 <ui-menu>\n' +
      '【属性】items 为 JSON 数组：{ group } 为分组标题，或 { icon?, label, badge?, children? }；active 当前项 key（顶层为索引，子项为 "父-子"）；open 展开的父项 key（逗号分隔）\n' +
      '【交互】有 children 的项切换展开（aria-expanded）；叶子项设为当前（aria-current=page）并派发 select，detail = { key, label }\n' +
      '【视觉】项高约 34px，圆角 var(--ui-radius-sm)；当前项品牌浅底；子菜单左缩进 22px；▶ 展开时旋转 90°\n' +
      '【约束】1) 最多两级；2) 徽标只放数字或 New；3) 窄屏时收进抽屉，而不是挤压内容',
    design: {
      purpose: '承载后台应用的多模块导航，层级一目了然。',
      when: ['管理后台、工作台、设置中心'],
      avoid: ['少于 4 个入口时用顶部导航或标签页']
    }
  },

  /* ---------------- 反馈 ---------------- */
  {
    id: 'ring',
    tag: 'ui-ring',
    name: '环形进度',
    cat: '反馈',
    brief: '圆环展示完成度',
    demo:
      '<ui-ring value="72" label="完成度"></ui-ring>' +
      '<ui-ring value="100" variant="success" size="64"></ui-ring>' +
      '<ui-ring value="35" variant="warn" size="64"></ui-ring>' +
      '<ui-ring value="12" variant="danger" size="64"></ui-ring>',
    ai:
      '【组件】环形进度 <ui-ring>\n' +
      '【属性】value 0-100；size 直径像素（默认 84，最小 40）；variant: brand | success | warn | danger；label 中心副文案\n' +
      '【实现】SVG 两个 circle，前景用 stroke-dasharray / dashoffset 表示比例，整体旋转 -90° 从 12 点开始\n' +
      '【视觉】线宽 = size/11；中心百分比字号 = size × 0.22；底环 var(--ui-panel-2)\n' +
      '【约束】1) role=progressbar + aria-valuenow；2) 同屏多个环保持同尺寸；3) 精确数值对比用条形进度',
    design: {
      purpose: '在卡片角落用紧凑的形状表达一个比例。',
      when: ['完成率、存储占用、目标达成'],
      avoid: ['多项数值对比用条形图']
    }
  },
  {
    id: 'result',
    tag: 'ui-result',
    name: '结果页',
    cat: '反馈',
    brief: '流程结束后的结果说明',
    demo: '<ui-result variant="success" title="支付成功" desc="订单已提交，预计 2 小时内发货，可在「我的订单」中查看进度。"><ui-button size="sm">查看订单</ui-button><ui-button size="sm" variant="primary">继续购物</ui-button></ui-result>',
    ai:
      '【组件】结果页 <ui-result>\n' +
      '【属性】variant: success | warn | danger | info；title；desc；标签内部放操作按钮\n' +
      '【视觉】居中布局，52px 圆形图标（对应语义色浅底）+ 16px 标题 + 最大 34ch 宽的说明\n' +
      '【约束】1) 标题说结果，说明说下一步；2) 最多两个按钮，主操作在右；3) 失败时说明原因与补救办法',
    design: {
      purpose: '给一段流程一个明确的终点和下一步。',
      when: ['支付/提交/注册完成、操作失败'],
      avoid: ['轻量反馈用 toast']
    }
  }
];
