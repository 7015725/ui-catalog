/* =========================================================
   动效 + 视觉效果组件元数据
   所有动效都遵守：系统「减少动态效果」或页面 data-motion="reduce" 时
   直接呈现最终状态（或改为静止 / 淡入淡出），不会强迫用户看动画
   ========================================================= */
const MOTION_RULE = '【减少动效】系统开启「减少动态效果」或页面 <html data-motion="reduce"> 时，';

const card = (title, desc, icon) =>
  '<div style="padding:12px 14px;border-radius:var(--ui-radius);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);font-size:12.5px;color:var(--ui-sub)">' +
  '<div style="font-size:18px;margin-bottom:4px" aria-hidden="true">' + icon + '</div><b style="display:block;color:var(--ui-text);font-size:13px">' + title + '</b>' + desc + '</div>';

export const motionCatalog = [
  /* ================= 动效 ================= */
  {
    id: 'reveal',
    tag: 'ui-reveal',
    name: '滚动入场',
    cat: '动效',
    brief: '进入视口时淡入 / 上移 / 缩放，可错开',
    wide: true,
    demo:
      '<div style="display:flex;flex-direction:column;gap:10px;width:100%">' +
      '<ui-reveal id="rv-demo" effect="fade-up" stagger="90" display="grid" columns="130">' +
      card('极速', '冷启动 < 1s', '⚡') + card('安全', '端到端加密', '🔒') + card('协作', '多人实时编辑', '👥') + card('开放', '完整 API', '🧩') +
      '</ui-reveal>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      ['fade-up', 'zoom', 'fade-left', 'blur', 'flip'].map((e) => '<button class="ui-btn ui-btn--sm" onclick="var r=document.getElementById(\'rv-demo\');r.setAttribute(\'effect\',\'' + e + '\');r.replay()">' + e + '</button>').join('') +
      '</div></div>',
    ai:
      '【组件】滚动入场 <ui-reveal>\n' +
      '【用途】元素第一次滚动进入视口时播放入场动画，引导视线、制造节奏\n' +
      '【属性】effect: fade-up | fade-down | fade-left | fade-right | zoom | flip | blur | fade；delay 延迟 ms；duration 时长 ms（默认 600）；stagger 子元素依次错开 ms；once="false" 离开后再进入会重播；display 容器布局（block | grid | flex）；columns 配合 grid 使用的列最小宽度 px（自动换列）\n' +
      '【实现】IntersectionObserver（阈值 15%）给容器加 .is-in；每个直接子元素用 transition-delay = delay + 序号 × stagger；只动 opacity / transform / filter，不触发布局\n' +
      '【方法】replay() 重新播放；事件 reveal 在进入时派发\n' +
      MOTION_RULE + '内容直接显示，不做位移\n' +
      '【约束】1) 首屏关键内容（标题、主按钮）不要等动画才出现；2) 位移距离 ≤ 28px，时长 400-700ms；3) 同一屏 stagger 总时长不超过 600ms；4) 不要给长列表的每一行都加入场',
    design: {
      purpose: '让内容「按顺序登场」，用节奏感引导用户的阅读路径。',
      when: ['营销页、产品官网的分屏介绍', '特性卡片网格、数据亮点', '图文混排的长页面'],
      avoid: ['后台表格、表单（用户要立刻看到）', '用户反复往返滚动的列表（once 保持 true）']
    }
  },
  {
    id: 'typewriter',
    tag: 'ui-typewriter',
    name: '打字机',
    cat: '动效',
    brief: '逐字打出、删除、轮播多句话',
    demo: '<div style="font-size:20px;font-weight:700;color:var(--ui-text);line-height:1.5">我们帮你 <span style="color:var(--ui-brand)"><ui-typewriter words="更快上线,少写代码,专注创意,拥抱 AI"></ui-typewriter></span></div>',
    ai:
      '【组件】打字机 <ui-typewriter>\n' +
      '【属性】words 逗号分隔的句子；speed 打字间隔 ms（默认 90，带 ±30% 随机抖动更像真人）；delete-speed 删除间隔（默认 45）；pause 每句停留 ms（默认 1400）；loop="false" 打完最后一句停止并派发 done；cursor="false" 隐藏光标\n' +
      '【无障碍】完整句子放在视觉隐藏的文本里给读屏，逐字变化的部分 aria-hidden，避免读屏一个字一个字地播报\n' +
      '【性能】进入视口后才开始；元素移除时清理定时器\n' +
      MOTION_RULE + '直接显示第一句，不打字\n' +
      '【约束】1) 只用于标题中的「可替换短语」，不要用于正文；2) 每句 ≤ 8 个字；3) 句子 3-5 条；4) 关键信息不要只出现在第 2 句以后',
    design: {
      purpose: '用一个位置轮播多个卖点，制造「还有更多」的好奇心。',
      when: ['首页主标题的可变部分', 'AI / 搜索类产品的输入框占位演示'],
      avoid: ['需要被完整阅读的说明文字', '一屏出现两个以上打字机']
    }
  },
  {
    id: 'count-up',
    tag: 'ui-count-up',
    name: '数字滚动',
    cat: '动效',
    brief: '进入视口时数字从 0 滚动到目标值',
    demo:
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:12px;width:100%;text-align:center">' +
      '<div><div style="font-size:26px;font-weight:800;color:var(--ui-text)"><ui-count-up to="12800" suffix="+"></ui-count-up></div><div style="font-size:12px;color:var(--ui-sub)">团队在用</div></div>' +
      '<div><div style="font-size:26px;font-weight:800;color:var(--ui-text)"><ui-count-up to="99.98" decimals="2" suffix="%"></ui-count-up></div><div style="font-size:12px;color:var(--ui-sub)">可用性</div></div>' +
      '<div><div style="font-size:26px;font-weight:800;color:var(--ui-text)"><ui-count-up to="3.6" decimals="1" prefix="¥" suffix="亿"></ui-count-up></div><div style="font-size:12px;color:var(--ui-sub)">年交易额</div></div></div>',
    ai:
      '【组件】数字滚动 <ui-count-up>\n' +
      '【属性】to 目标值；from 起始值（默认 0）；duration 时长 ms（默认 1600）；decimals 小数位；prefix / suffix 前后缀；separator="false" 关闭千分位\n' +
      '【实现】进入视口后 requestAnimationFrame + easeOutCubic 缓动；数字用 tabular-nums 等宽，滚动时宽度不跳\n' +
      '【无障碍】最终值放在视觉隐藏文本里，读屏直接读到结果；滚动中的数字 aria-hidden\n' +
      MOTION_RULE + '直接显示最终值\n' +
      '【约束】1) 只用于「值得炫耀」的汇总数字；2) 实时变化的数据（如股价）不要用；3) 一屏最多 4 个同时滚动',
    design: {
      purpose: '让关键数字「被看见」，滚动过程本身就在强调量级。',
      when: ['官网数据亮点、年度报告', '活动页成就数据'],
      avoid: ['后台的实时指标（每次刷新都滚很烦）', '需要精确读数的表格']
    }
  },
  {
    id: 'marquee',
    tag: 'ui-marquee',
    name: '无限滚动',
    cat: '动效',
    brief: '客户 Logo / 标签无缝循环',
    wide: true,
    demo:
      '<div style="display:flex;flex-direction:column;gap:12px;width:100%">' +
      '<ui-marquee speed="22">' + ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark', 'Wayne', 'Wonka'].map((n) => '<span style="font-weight:800;font-size:18px;letter-spacing:.04em;color:var(--ui-sub);white-space:nowrap">◆ ' + n + '</span>').join('') + '</ui-marquee>' +
      '<ui-marquee speed="30" direction="right" gap="12">' + ['设计系统', '无障碍', '深色模式', '自适应', '零依赖', 'Web Components', '15 套风格', '动效'].map((n) => '<ui-tag look="outline">' + n + '</ui-tag>').join('') + '</ui-marquee></div>',
    ai:
      '【组件】无限滚动 <ui-marquee>\n' +
      '【属性】speed 一轮秒数（默认 24，数值越大越慢）；direction: left | right；gap 间距 px；pause-on-hover="false" 关闭悬停暂停\n' +
      '【实现】内容自动复制一份，整条轨道 translateX(-50%) 线性无限循环，首尾无缝；两端用 mask 渐隐；副本 aria-hidden 且内部链接 tabindex=-1，避免读屏和键盘重复\n' +
      '【交互】鼠标悬停或键盘聚焦到内部元素时暂停\n' +
      MOTION_RULE + '停止滚动\n' +
      '【约束】1) 内容必须可以「错过」——不要放唯一入口或关键信息；2) 速度适中，一个元素经过视口 ≥ 3 秒；3) 内部可点击元素尽量少',
    design: {
      purpose: '在一行里展示数量很多的同类元素，传达「很多人在用」。',
      when: ['客户 / 合作伙伴 Logo 墙', '技术栈、标签云、用户评价条'],
      avoid: ['公告、通知（会被错过）', '需要用户逐个点击的列表']
    }
  },
  {
    id: 'text-anim',
    tag: 'ui-text-anim',
    name: '逐字动画',
    cat: '动效',
    brief: '标题文字逐字上浮、模糊、弹出、波浪',
    demo:
      '<div style="display:flex;flex-direction:column;gap:12px;width:100%;font-size:22px;font-weight:800;color:var(--ui-text)">' +
      '<ui-text-anim id="ta-demo" text="让界面动起来 ✨" effect="rise"></ui-text-anim>' +
      '<div style="font-size:16px;color:var(--ui-brand)"><ui-text-anim text="鼠标移上来看看波浪" effect="wave" trigger="hover"></ui-text-anim></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + ['rise', 'blur', 'pop', 'fade', 'wave'].map((e) => '<button class="ui-btn ui-btn--sm" onclick="var t=document.getElementById(\'ta-demo\');t.setAttribute(\'effect\',\'' + e + '\');t.replay()">' + e + '</button>').join('') + '</div></div>',
    ai:
      '【组件】逐字动画 <ui-text-anim>\n' +
      '【属性】text 文本；effect: rise | blur | pop | fade | wave；stagger 每字间隔 ms（默认 40）；trigger: load（默认，出现时播一次）| hover（悬停时波浪）| loop（循环）\n' +
      '【实现】按字符（Array.from，正确处理 emoji）拆成 inline-block span，用 CSS 变量 --i 计算 animation-delay；只动 transform / opacity / filter\n' +
      '【方法】replay() 重新播放\n' +
      '【无障碍】完整文本放在视觉隐藏 span 中，拆开的字符全部 aria-hidden，读屏不会逐字读\n' +
      MOTION_RULE + '文字直接完整显示\n' +
      '【约束】1) 只用于短标题（≤ 16 字）；2) loop 模式只能用于装饰性文字；3) 同一屏只用一个',
    design: {
      purpose: '给最重要的一句话一个「登场仪式」。',
      when: ['首屏大标题', '成功页、空状态的主文案'],
      avoid: ['正文、按钮文字', '需要快速扫读的界面']
    }
  },
  {
    id: 'ripple',
    tag: 'ui-ripple',
    name: '水波纹',
    cat: '动效',
    brief: '点击处扩散的波纹反馈',
    demo:
      '<ui-ripple><ui-button variant="primary">点我试试</ui-button></ui-ripple>' +
      '<ui-ripple><ui-button>默认按钮</ui-button></ui-ripple>' +
      '<ui-ripple color="var(--ui-brand)"><ui-button variant="text">品牌色波纹</ui-button></ui-ripple>',
    ai:
      '【组件】水波纹 <ui-ripple>\n' +
      '【用途】包在任意按钮 / 卡片外面，点击时从按下位置扩散一圈波纹（Material 风格）\n' +
      '【属性】color 波纹颜色（默认 currentColor，透明度 .28）\n' +
      '【实现】pointerdown 时在内部第一个 button / a / [role=button] / .ui-card 里插入一个圆形 span，直径 = 到最远角距离 × 2，scale 0→1 同时淡出，动画结束自动移除；宿主自动加 position:relative + overflow:hidden，所以圆角天然被裁剪\n' +
      MOTION_RULE + '不产生波纹\n' +
      '【约束】1) 禁用状态不触发；2) 不要与 hover 大幅位移同时使用；3) 波纹只是反馈，不能代替 focus 样式',
    design: {
      purpose: '让「我点到了」这件事有一个即时、具体的回应。',
      when: ['触屏为主的应用', 'Material 风格的按钮、列表项'],
      avoid: ['已经有明显按下态（如 Brutalism 位移）的风格']
    }
  },
  {
    id: 'flip-card',
    tag: 'ui-flip-card',
    name: '翻转卡片',
    cat: '动效',
    brief: '悬停或点击 3D 翻到背面',
    demo:
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;width:100%">' +
      '<ui-flip-card label="专业版">' +
      '<div style="display:grid;place-items:center;min-height:130px;padding:14px;border-radius:var(--ui-radius-lg);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);text-align:center"><div><div style="font-size:26px" aria-hidden="true">🚀</div><b style="color:var(--ui-text)">专业版</b><div style="font-size:12px;color:var(--ui-sub)">悬停查看详情</div></div></div>' +
      '<div style="display:grid;place-items:center;min-height:130px;padding:14px;border-radius:var(--ui-radius-lg);background:var(--ui-brand);color:var(--ui-brand-ink);text-align:center;font-size:12.5px"><div><b style="font-size:20px">¥49/月</b><br>不限项目 · 团队协作</div></div>' +
      '</ui-flip-card>' +
      '<ui-flip-card trigger="click" direction="vertical" label="单词卡">' +
      '<div style="display:grid;place-items:center;min-height:130px;padding:14px;border-radius:var(--ui-radius-lg);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);text-align:center"><div><b style="font-size:20px;color:var(--ui-text)">Serendipity</b><div style="font-size:12px;color:var(--ui-sub)">点击翻转</div></div></div>' +
      '<div style="display:grid;place-items:center;min-height:130px;padding:14px;border-radius:var(--ui-radius-lg);background:var(--ui-panel-2);border:var(--ui-border-w) solid var(--ui-line);text-align:center;color:var(--ui-text)"><div><b>意外发现美好事物的运气</b><div style="font-size:12px;color:var(--ui-sub)">n. 机缘巧合</div></div></div>' +
      '</ui-flip-card></div>',
    ai:
      '【组件】翻转卡片 <ui-flip-card>\n' +
      '【结构】标签内的第 1 个子元素是正面，第 2 个是背面；两面叠放在同一个 grid 格子里，高度取较高的一面\n' +
      '【属性】trigger: hover（默认，悬停 / 键盘聚焦翻转）| click（点击或 Enter / Space 切换，role=button + aria-pressed）；direction: horizontal | vertical；label 无障碍名称\n' +
      '【实现】perspective + transform-style: preserve-3d + backface-visibility: hidden，旋转 180°；看不到的一面加 inert，键盘不会 Tab 进背面\n' +
      MOTION_RULE + '改为正反面淡入淡出，不做 3D 旋转\n' +
      '【约束】1) 背面信息不能是唯一入口（触屏没有 hover，请用 click 模式）；2) 两面尺寸尽量一致；3) 背面里的按钮在 hover 模式下很难点到',
    design: {
      purpose: '在同一块空间里放「概览 + 详情」，用翻转制造探索感。',
      when: ['记忆卡片、单词卡', '团队成员介绍、套餐亮点'],
      avoid: ['移动端的关键信息（hover 不存在）', '背面需要复杂操作']
    }
  },
  {
    id: 'animate',
    tag: 'ui-animate',
    name: '动画预设',
    cat: '动效',
    brief: '12 种注意力动画：弹跳、摇晃、心跳…',
    wide: true,
    demo:
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:10px;width:100%">' +
      ['bounce', 'pulse', 'shake', 'wobble', 'heartbeat', 'swing', 'jello', 'tada', 'rubber', 'flash', 'float', 'spin'].map((e) =>
        '<ui-animate effect="' + e + '" trigger="' + (e === 'float' || e === 'spin' ? 'loop' : 'click') + '"' + (e === 'spin' ? ' duration="2400"' : e === 'float' ? ' duration="2600"' : '') + '>' +
        '<button class="ui-btn ui-btn--sm" style="width:100%">' + e + '</button></ui-animate>').join('') +
      '</div>',
    ai:
      '【组件】动画预设 <ui-animate>\n' +
      '【属性】effect: bounce | pulse | shake | wobble | heartbeat | swing | jello | tada | rubber | flash | float | spin；trigger: click（默认）| hover | load | loop；duration ms（默认 900）；delay ms；repeat 次数或 infinite\n' +
      '【方法】play() 从头播放一次（可在表单校验失败时调用 shake）；动画结束派发 end\n' +
      '【语义建议】shake = 输入错误；heartbeat / pulse = 提醒关注；tada = 成功庆祝；bounce = 引导点击；float = 装饰性漂浮；spin = 刷新 / 同步中\n' +
      MOTION_RULE + '动画瞬间完成（等于不播放）\n' +
      '【约束】1) 注意力动画只用于需要用户「现在」注意的元素；2) loop 只用于小面积装饰；3) 闪烁（flash）每秒不超过 3 次，避免诱发光敏性癫痫',
    design: {
      purpose: '用约定俗成的动作语言快速传达情绪：错了、成功了、看这里。',
      when: ['表单错误时晃动输入框', '新功能入口的心跳提示', '成功后的庆祝'],
      avoid: ['同时让多个元素抢注意力', '大面积、长时间循环的动画']
    }
  },
  {
    id: 'loader',
    tag: 'ui-loader',
    name: '加载动画',
    cat: '动效',
    brief: '8 种加载样式，减少动效时改为呼吸',
    wide: true,
    demo:
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:14px;width:100%;justify-items:center">' +
      ['dots', 'bars', 'ring', 'pulse', 'orbit', 'wave', 'square', 'line'].map((t) => '<ui-loader type="' + t + '" label="' + t + '"></ui-loader>').join('') + '</div>',
    ai:
      '【组件】加载动画 <ui-loader>\n' +
      '【属性】type: dots | bars | ring | pulse | orbit | wave | square | line；size 尺寸 px（默认 32）；label 文字（同时作为读屏文案，默认「加载中」）\n' +
      '【实现】纯 CSS 动画，颜色 currentColor（默认品牌色，外层改 color 即可换色）\n' +
      '【无障碍】role=status + aria-label\n' +
      '【减少动效】不完全停止（否则用户以为卡死），改为 2s 缓慢的透明度呼吸\n' +
      '【约束】1) 300ms 内能完成的请求不要显示加载动画（避免闪烁）；2) 超过 10 秒的任务改用进度条并说明剩余时间；3) 同一页面统一用一种 type',
    design: {
      purpose: '告诉用户「系统在干活，不是卡住了」。',
      when: ['按钮内、卡片内、整页的等待状态', '无法预估时长的请求'],
      avoid: ['能预估进度的任务（用进度条）', '可以先显示骨架屏的列表']
    }
  },
  {
    id: 'confetti',
    tag: 'window.uiConfetti',
    name: '撒花庆祝',
    cat: '动效',
    brief: 'JS API，从按钮位置喷出彩纸',
    demo:
      '<button class="ui-btn ui-btn--primary" onclick="uiConfetti({ from: this })">🎉 完成任务</button>' +
      '<button class="ui-btn" onclick="uiConfetti({ count: 260, spread: 120 })">大型庆祝</button>' +
      '<button class="ui-btn" onclick="uiConfetti({ from: this, colors: [\'#ffd700\', \'#ffb800\', \'#fff3b0\'] })">金色彩纸</button>',
    ai:
      '【组件】撒花庆祝（函数 API）\n' +
      '【用法】uiConfetti({ from?: 元素, x?, y?: 视口坐标, count?: 数量（默认 140，上限 400）, spread?: 扩散角度（默认 70°）, colors?: 颜色数组 })；返回是否播放\n' +
      '【实现】临时插入一个 pointer-events:none 的全屏 canvas，粒子带重力、空气阻力、旋转，约 4 秒后自动移除，不留 DOM；默认颜色取当前风格的 brand / ok / warn / danger\n' +
      MOTION_RULE + '不播放并返回 false（业务可改用文字提示）\n' +
      '【约束】1) 只用于真正值得庆祝的时刻（首次完成、达成目标、支付成功）；2) 同一会话不要频繁触发；3) 庆祝的同时要有文字结果说明',
    design: {
      purpose: '把一次普通的「完成」变成值得记住的瞬间。',
      when: ['完成新手引导、达成里程碑', '抽奖中奖、订单支付成功'],
      avoid: ['日常高频操作（如每次保存）', '出错或严肃的业务场景']
    }
  },

  /* ================= 视觉 ================= */
  {
    id: 'tilt',
    tag: 'ui-tilt',
    name: '3D 倾斜',
    cat: '视觉',
    brief: '卡片随鼠标倾斜 + 高光',
    demo:
      '<ui-tilt style="width:100%;max-width:280px;margin:0 auto">' +
      '<div style="padding:22px;border-radius:var(--ui-radius-lg);color:var(--ui-brand-ink);background:linear-gradient(135deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 55%,#ec4899));box-shadow:var(--ui-shadow)">' +
      '<div class="ui-tilt__pop" style="font-size:12px;opacity:.85">MEMBER CARD</div><div class="ui-tilt__pop" style="font-size:22px;font-weight:800;margin:18px 0 6px">林小北</div>' +
      '<div style="font-family:var(--ui-mono);font-size:13px;letter-spacing:.12em">**** 2026 1101</div></div></ui-tilt>',
    ai:
      '【组件】3D 倾斜 <ui-tilt>\n' +
      '【属性】max 最大倾斜角度（默认 12°）；scale 悬停放大（默认 1.03）；glare="false" 关闭高光\n' +
      '【实现】pointermove 计算指针在卡片内的相对位置 → rotateX / rotateY；离开后 .5s 缓动回正；高光为跟随指针的径向渐变（mix-blend-mode: soft-light）；子元素加 class="ui-tilt__pop" 可以 translateZ 浮起，产生视差\n' +
      '【交互】触屏（pointerType=touch）不倾斜；纯装饰，不影响内容语义与焦点\n' +
      MOTION_RULE + '不倾斜\n' +
      '【约束】1) 角度 ≤ 15°；2) 卡片内不要放需要精确点击的小按钮；3) 一屏不超过 3 张',
    design: {
      purpose: '给实物感的卡片（会员卡、商品、作品）增加「可以拿在手里」的质感。',
      when: ['会员卡、优惠券、作品集封面', '产品展示的主视觉'],
      avoid: ['包含表单或密集操作的卡片', '列表中的大量卡片']
    }
  },
  {
    id: 'spotlight',
    tag: 'ui-spotlight',
    name: '光标聚光',
    cat: '视觉',
    brief: '鼠标处出现光晕，边框跟随发光',
    wide: true,
    demo:
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;width:100%">' +
      [['⚡', '极速构建', '增量编译，保存即预览'], ['🛡️', '默认安全', '依赖自动审计'], ['🌐', '全球加速', '300+ 边缘节点']].map((x) =>
        '<ui-spotlight><div style="padding:18px"><div style="font-size:22px" aria-hidden="true">' + x[0] + '</div><b style="display:block;margin:6px 0 4px;color:var(--ui-text)">' + x[1] + '</b><span style="font-size:12.5px;color:var(--ui-sub)">' + x[2] + '</span></div></ui-spotlight>').join('') +
      '</div>',
    ai:
      '【组件】光标聚光 <ui-spotlight>\n' +
      '【属性】radius 光晕半径 px（默认 260）\n' +
      '【实现】pointermove 把指针坐标写入 CSS 变量 --x / --y；::before 是面板内的品牌色径向光晕（16%），::after 是同一位置的边框高光（padding 1.5px + mask-composite: exclude 只露出边框）；键盘聚焦到内部元素时顶部也会亮起\n' +
      MOTION_RULE + '不跟随鼠标\n' +
      '【约束】1) 适合深色背景，浅色背景请降低强度；2) 卡片网格使用时每张卡独立计算；3) 光晕只是装饰，hover 态仍需边框或阴影变化',
    design: {
      purpose: '在一组静态卡片里，用光引导用户「正在看哪一张」。',
      when: ['特性网格、定价卡片', '深色风格的产品官网（Linear / Vercel 式）'],
      avoid: ['触屏为主的界面（没有指针）', '信息密集的后台卡片']
    }
  },
  {
    id: 'gradient-border',
    tag: 'ui-gradient-border',
    name: '流光边框',
    cat: '视觉',
    brief: '旋转的渐变描边，可加外发光',
    demo:
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;width:100%">' +
      '<ui-gradient-border><div style="padding:16px;text-align:center"><b style="color:var(--ui-text)">推荐方案</b><div style="font-size:12px;color:var(--ui-sub);margin-top:4px">默认 2px</div></div></ui-gradient-border>' +
      '<ui-gradient-border glow width="3" speed="3"><div style="padding:16px;text-align:center"><b style="color:var(--ui-text)">AI 生成中…</b><div style="font-size:12px;color:var(--ui-sub);margin-top:4px">glow · 3px</div></div></ui-gradient-border></div>',
    ai:
      '【组件】流光边框 <ui-gradient-border>\n' +
      '【属性】colors 三个颜色（逗号分隔，默认 品牌色 / 粉 / ok 色）；width 边框粗细 px（默认 2）；speed 一圈秒数（默认 4）；glow 外发光\n' +
      '【实现】外层 conic-gradient 背景 + padding 形成「边框」，内层用面板色盖住中间；用 @property 注册角度变量 --ui-gb-a，CSS 动画直接对角度做插值（不支持 @property 的浏览器显示静态渐变）；glow 为同一渐变的模糊副本\n' +
      MOTION_RULE + '静止为渐变描边\n' +
      '【约束】1) 一屏只给一个元素用（它就是「最重要的那个」）；2) 不要和阴影、spotlight 叠加；3) 圆角跟随 var(--ui-radius-lg)',
    design: {
      purpose: '把「推荐 / 正在进行 / AI」这类特殊状态从一堆卡片里拎出来。',
      when: ['推荐套餐、AI 处理中的输入框', '活动入口、限时优惠'],
      avoid: ['普通列表项', '同屏多个流光']
    }
  },
  {
    id: 'aurora',
    tag: 'ui-aurora',
    name: '极光背景',
    cat: '视觉',
    brief: '缓慢流动的模糊色块背景',
    wide: true,
    demo:
      '<ui-aurora height="200" style="width:100%">' +
      '<div style="font-size:24px;font-weight:800;color:var(--ui-text)">下一代设计系统</div>' +
      '<p style="margin:6px 0 14px;font-size:13px;color:var(--ui-text)">140+ 组件 · 15 套风格 · 全部可换肤</p>' +
      '<ui-button variant="primary" shape="pill">开始使用</ui-button></ui-aurora>',
    ai:
      '【组件】极光背景 <ui-aurora>\n' +
      '【属性】height 最小高度 px（默认 180）；intensity 色块不透明度（默认 .55）；blur 模糊半径 px（默认 48）\n' +
      '【实现】三个大圆形色块（品牌色 / 粉 / ok 色）+ filter: blur，分别以 14s / 17s / 19s 不同周期 alternate 漂移，叠加出自然流动；内容在上层并带背景色的柔和 text-shadow 以保证可读\n' +
      MOTION_RULE + '色块静止\n' +
      '【约束】1) 只用于首屏 Hero 或大标题区；2) 上方文字使用 --ui-text，对比度要在最亮的色块上也成立；3) 不要在同一页叠加多个极光区',
    design: {
      purpose: '用柔和流动的色彩营造氛围，让首屏有「呼吸感」。',
      when: ['官网 Hero、登录页背景', 'AI 产品的欢迎页'],
      avoid: ['内容区、表单区背景', '对性能敏感的低端设备页面（可降低 blur）']
    }
  },
  {
    id: 'gradient-text',
    tag: 'ui-gradient-text',
    name: '渐变文字',
    cat: '视觉',
    brief: '流动渐变或高光扫过的标题',
    demo:
      '<div style="display:flex;flex-direction:column;gap:8px;width:100%">' +
      '<div style="font-size:28px;font-weight:900;line-height:1.2"><ui-gradient-text>Build faster.</ui-gradient-text></div>' +
      '<div style="font-size:22px;font-weight:800"><ui-gradient-text effect="shine" speed="3">高光扫过的标题</ui-gradient-text></div>' +
      '<div style="font-size:18px;font-weight:700"><ui-gradient-text colors="var(--ui-ok),var(--ui-brand),var(--ui-ok)">自定义颜色</ui-gradient-text></div></div>',
    ai:
      '【组件】渐变文字 <ui-gradient-text>\n' +
      '【属性】effect: flow（渐变横向流动，默认）| shine（正文色 + 一道品牌色高光扫过）；colors 三个颜色（默认 brand / danger / warn，均已在各风格下校验过对比度）；speed 一轮秒数\n' +
      '【实现】background-clip: text + 透明文字；背景尺寸 300%，动画移动 background-position；高对比模式（forced-colors）自动回退为系统文字色\n' +
      MOTION_RULE + '渐变静止\n' +
      '【约束】1) 只用于 24px 以上的粗体标题，渐变中最浅的颜色与背景对比 ≥ 3:1；2) 不要用于正文、链接、按钮文字；3) 一屏最多一处',
    design: {
      purpose: '让主标题本身成为视觉焦点，无需额外插图。',
      when: ['Hero 主标题、品牌口号', '数字亮点、活动名称'],
      avoid: ['小字号文字（可读性差）', '需要被复制、搜索的长文本']
    }
  },
  {
    id: 'pattern',
    tag: 'ui-pattern',
    name: '背景图案',
    cat: '视觉',
    brief: '点阵 / 网格 / 斜线等纯 CSS 底纹',
    wide: true,
    demo:
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;width:100%">' +
      [['dots', ' fade'], ['grid', ' fade moving'], ['lines', ''], ['diagonal', ''], ['checker', ' fade']].map((x) =>
        '<ui-pattern pattern="' + x[0] + '" height="110"' + x[1].replace(/ (\w+)/g, ' $1') + '><b style="font-size:12.5px;color:var(--ui-text)">' + x[0] + (x[1] ? '<br><small style="font-weight:400;color:var(--ui-sub)">' + x[1].trim() + '</small>' : '') + '</b></ui-pattern>').join('') + '</div>',
    ai:
      '【组件】背景图案 <ui-pattern>\n' +
      '【属性】pattern: dots | grid | lines | diagonal | checker；size 图案间距 px（默认 18）；height 最小高度；fade 中心向外渐隐；moving 图案缓慢平移\n' +
      '【实现】全部用 CSS 渐变（radial / linear / repeating / conic-gradient）画在 ::before 上，零图片；线条颜色 = var(--ui-sub) 30%，随风格与明暗自动变化；fade 用径向 mask\n' +
      MOTION_RULE + 'moving 静止\n' +
      '【约束】1) 图案只做底纹，对比度要低，不能干扰上层文字；2) 内容区上方建议加 fade；3) 同一页面只用一种图案',
    design: {
      purpose: '在大面积留白里增加一点质感与结构感，比纯色更精致。',
      when: ['Hero 区、空状态、功能介绍区块的背景', '画布 / 编辑器的网格背景'],
      avoid: ['文字密集的正文区', '已有插图或照片的区域']
    }
  },
  {
    id: 'blob',
    tag: 'ui-blob',
    name: '流体形状',
    cat: '视觉',
    brief: '不断变形的有机色块',
    demo:
      '<ui-blob size="120"><span style="font-size:34px" aria-hidden="true">🎨</span></ui-blob>' +
      '<ui-blob size="90" speed="7" colors="var(--ui-ok),var(--ui-brand)"></ui-blob>' +
      '<ui-blob size="64" speed="5" colors="#f59e0b,#ef4444"></ui-blob>',
    ai:
      '【组件】流体形状 <ui-blob>\n' +
      '【属性】size 尺寸 px（默认 140）；colors 两个渐变色（默认品牌色 → 品牌色与粉的混合）；speed 一轮秒数（默认 9）；标签内可放图标或头像\n' +
      '【实现】8 值 border-radius 关键帧在三种不规则形状间过渡，同时轻微旋转；内部内容反向旋转保持端正；同色系柔和投影\n' +
      MOTION_RULE + '形状静止\n' +
      '【约束】1) 纯装饰，不承载信息；2) 同一视图 ≤ 3 个，大小错落；3) 放图标时注意与背景的对比',
    design: {
      purpose: '用柔软的有机形状打破网格的生硬感，增加亲和力。',
      when: ['Hero 区装饰、头像底衬', '空状态与引导页插画替代'],
      avoid: ['严肃、规整的风格（如 Mono、Bauhaus）', '需要传达精确的数据']
    }
  },
  {
    id: 'particles',
    tag: 'ui-particles',
    name: '粒子背景',
    cat: '视觉',
    brief: '漂浮连线粒子，鼠标靠近会避让',
    wide: true,
    demo:
      '<ui-particles height="220" style="width:100%">' +
      '<div style="font-size:22px;font-weight:800;color:var(--ui-text)">连接每一个想法</div>' +
      '<p style="margin:6px 0 0;font-size:13px;color:var(--ui-sub)">把鼠标移到粒子上试试</p></ui-particles>',
    ai:
      '【组件】粒子背景 <ui-particles>\n' +
      '【属性】count 粒子数（默认 60，上限 200）；link 连线距离 px（默认 110）；speed 速度（默认 0.4）；height 最小高度；interactive="false" 关闭鼠标避让\n' +
      '【实现】canvas 绘制，按 devicePixelRatio（最高 2）缩放保证清晰；ResizeObserver 自适应容器尺寸；颜色每秒从当前风格的 --ui-brand 读取一次（切换风格立即生效）\n' +
      '【性能】requestAnimationFrame 循环在元素离开视口或标签页隐藏时自动暂停；元素移除时停止循环并断开观察器\n' +
      MOTION_RULE + '只绘制一帧静态画面\n' +
      '【约束】1) 粒子数 × 连线是 O(n²)，移动端建议 ≤ 40；2) 上层文字需要足够对比；3) 一页只放一个',
    design: {
      purpose: '用「连接」的隐喻表达网络、协作、AI 等抽象概念。',
      when: ['科技类官网 Hero、登录页', '数据 / 网络 / AI 产品的品牌区'],
      avoid: ['内容阅读区', '低端移动设备的长时间展示']
    }
  },
  {
    id: 'magnetic',
    tag: 'ui-magnetic',
    name: '磁吸按钮',
    cat: '视觉',
    brief: '鼠标靠近时按钮被「吸」过去',
    demo:
      '<ui-magnetic><ui-button variant="primary" shape="pill" size="lg">靠近我 →</ui-button></ui-magnetic>' +
      '<ui-magnetic strength="0.5" range="30"><ui-button shape="circle" aria-label="喜欢">♥</ui-button></ui-magnetic>',
    ai:
      '【组件】磁吸按钮 <ui-magnetic>\n' +
      '【属性】strength 吸附强度 0-1（默认 .35）；range 感应范围 px（默认 24，通过透明内边距扩大热区，不影响布局）\n' +
      '【实现】pointermove 计算指针与内容中心的偏移 × strength → translate；离开后用弹性曲线（--ui-spring）回弹\n' +
      '【交互】只在精确指针设备（hover: hover + pointer: fine）上生效，触屏无效果；不改变按钮的焦点与点击行为\n' +
      MOTION_RULE + '不移动\n' +
      '【约束】1) strength ≤ .5，否则用户很难点准；2) 只给 1-2 个主要 CTA 使用；3) 不要用于表单内按钮',
    design: {
      purpose: '让最重要的按钮「主动迎向」用户，增加趣味和点击欲。',
      when: ['作品集、创意官网的主 CTA', '导航里的少量图标按钮'],
      avoid: ['需要精确、连续点击的操作', '移动端']
    }
  },
  {
    id: 'shine',
    tag: 'ui-shine',
    name: '高光扫过',
    cat: '视觉',
    brief: '按钮 / 卡片上一道光扫过',
    demo:
      '<ui-shine><ui-button variant="primary">悬停出现高光</ui-button></ui-shine>' +
      '<ui-shine trigger="loop" interval="2600"><ui-button variant="gradient" shape="pill">✦ 立即升级 Pro</ui-button></ui-shine>',
    ai:
      '【组件】高光扫过 <ui-shine>\n' +
      '【属性】trigger: hover（默认，悬停或聚焦时扫一次）| loop（定时扫过）；interval 循环间隔 ms（默认 3000，最小 1200）；duration 单次时长 ms\n' +
      '【实现】在内部第一个 button / a / .ui-card 中插入一条倾斜的白色半透明渐变条，从左 -60% 移动到右 130%；宿主自动 overflow:hidden；loop 模式在标签页隐藏时跳过\n' +
      MOTION_RULE + '不扫光\n' +
      '【约束】1) loop 只用于唯一的主要付费 / 转化按钮；2) 深色按钮效果最好，浅色按钮上几乎看不见；3) 间隔不要小于 2 秒',
    design: {
      purpose: '给付费、升级这类「希望被点」的按钮加一点高级感和暗示。',
      when: ['升级 Pro、立即购买、领取优惠', '会员卡、徽章的质感表现'],
      avoid: ['普通操作按钮', '一屏多个扫光元素']
    }
  }
];
