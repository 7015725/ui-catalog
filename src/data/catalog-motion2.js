/* =========================================================
   动效 / 视觉 第二批（各 20 个）组件元数据
   ========================================================= */
const R = '【减少动效】系统开启「减少动态效果」或 <html data-motion="reduce"> 时，';
const box = (inner, extra) => '<div style="padding:14px;border-radius:var(--ui-radius-lg);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);' + (extra || '') + '">' + inner + '</div>';
const H = (t, sub) => '<div style="font-size:20px;font-weight:800;color:inherit">' + t + '</div>' + (sub ? '<p style="margin:6px 0 0;font-size:12.5px;opacity:.85">' + sub + '</p>' : '');

const M = (id, tag, name, brief, demo, ai, design, wide) => ({ id: id, tag: tag, name: name, cat: '动效', brief: brief, demo: demo, ai: ai, design: design, wide: !!wide });
const V = (id, tag, name, brief, demo, ai, design, wide) => ({ id: id, tag: tag, name: name, cat: '视觉', brief: brief, demo: demo, ai: ai, design: design, wide: !!wide });

export const motionCatalog2 = [
  /* ===================== 动效 ===================== */
  M('scramble', 'ui-scramble', '解码文字', '乱码逐位「破译」成目标文字',
    '<div style="display:flex;flex-direction:column;gap:10px;width:100%">' +
    '<div style="font-family:var(--ui-mono);font-size:20px;font-weight:700;color:var(--ui-text)"><ui-scramble id="scr-demo" text="ACCESS GRANTED" trigger="loop"></ui-scramble></div>' +
    '<div style="font-size:15px;color:var(--ui-sub)">鼠标移上来：<b style="color:var(--ui-brand)"><ui-scramble text="悬停重新解码" trigger="hover"></ui-scramble></b></div></div>',
    '【组件】解码文字 <ui-scramble>\n【属性】text 目标文字；trigger: load（进入视口播一次，默认）| hover | loop；duration 时长 ms（默认 1200）\n' +
    '【实现】requestAnimationFrame 每帧把未「锁定」的字符换成随机符号，每个字符的锁定时间从左到右递增并带随机抖动；未锁定字符用品牌色\n' +
    '【方法】play() 手动播放；结束派发 done\n【无障碍】最终文字放在视觉隐藏节点，乱码部分 aria-hidden\n' + R + '直接显示最终文字\n' +
    '【约束】1) 适合短的英文 / 数字（等宽字体效果最好）；2) 每次 ≤ 1.5 秒；3) 不要用于需要立即阅读的提示',
    { purpose: '营造「系统正在解析」的科技感与仪式感。', when: ['黑客 / 安全 / AI 主题标题', '登录成功、解锁成就'], avoid: ['正文和操作按钮', '中文长句（乱码字符与汉字宽度不一致）'] }),

  M('rotating-text', 'ui-rotating-text', '文字轮换', '一个位置上下滚动切换多个词',
    '<div style="font-size:22px;font-weight:800;color:var(--ui-text)">为 <span style="color:var(--ui-brand)"><ui-rotating-text words="设计师,开发者,产品经理,创业者"></ui-rotating-text></span> 而生</div>',
    '【组件】文字轮换 <ui-rotating-text>\n【属性】words 逗号分隔；interval 切换间隔 ms（默认 2200，最小 1000）\n' +
    '【实现】所有词叠放在同一个 inline-grid 格子里，宽度自动取最长词，切换时不会挤动两侧文字；当前词 translateY(0)，旧词向上滑出，新词从下方滑入；切换派发 change\n' +
    '【无障碍】所有词用顿号连成一句放在视觉隐藏节点里，动态部分 aria-hidden\n' + R + '只显示第一个词，不切换\n' +
    '【约束】1) 词长度尽量接近；2) 3-6 个词；3) 页面隐藏时自动暂停',
    { purpose: '在固定句式里轮换「对象 / 场景」，一句话覆盖多个人群。', when: ['Hero 标题', '功能介绍的副标题'], avoid: ['需要被完整阅读的说明', '同屏多处轮换'] }),

  M('odometer', 'ui-odometer', '滚轮数字', '每一位数字像里程表一样滚动',
    '<div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%">' +
    '<div style="font-size:34px;font-weight:800;color:var(--ui-text)"><ui-odometer id="odo-demo" value="128450"></ui-odometer></div>' +
    '<div style="display:flex;gap:8px"><button class="ui-btn ui-btn--sm" onclick="var o=document.getElementById(\'odo-demo\');o.setAttribute(\'value\',Number(o.getAttribute(\'value\'))+Math.round(Math.random()*9000))">+ 随机增加</button>' +
    '<button class="ui-btn ui-btn--sm" onclick="document.getElementById(\'odo-demo\').setAttribute(\'value\',Math.round(Math.random()*999999))">随机数</button></div></div>',
    '【组件】滚轮数字 <ui-odometer>\n【属性】value 数值（整数）；duration 滚动时长 ms（默认 1200）；separator="false" 关闭千分位\n' +
    '【实现】每一位是一列 0-9 的竖排数字，用 translateY(-n×10%) 定位；value 改变时从旧值滚到新值，各列同时滚动；首次进入视口才从 0 开始滚\n' +
    '【无障碍】当前完整数值放在视觉隐藏节点；数字列 aria-hidden\n' + R + '直接跳到新值\n' +
    '【约束】1) 适合会变化的统计（销量、在线人数）；2) 位数变化时（如 999→1000）整体重新排版，可接受；3) 小数请先换算成整数单位',
    { purpose: '让「数字在变化」这件事本身可感知，比直接替换更有冲击力。', when: ['实时销量 / 在线人数', '活动倒计数、抽奖号码'], avoid: ['需要精确阅读的财务表格'] }),

  M('draw-svg', 'ui-draw-svg', '线条绘制', 'SVG 图标像被笔画出来',
    '<ui-draw-svg icon="check" trigger="loop" label="完成"></ui-draw-svg><ui-draw-svg icon="heart" trigger="loop" duration="1800"></ui-draw-svg>' +
    '<ui-draw-svg icon="rocket" trigger="loop" duration="2200"></ui-draw-svg><ui-draw-svg icon="star" trigger="hover"></ui-draw-svg><ui-draw-svg icon="signature" size="110" stroke="1.6" trigger="loop" duration="2400"></ui-draw-svg>',
    '【组件】线条绘制 <ui-draw-svg>\n【属性】icon: check | heart | star | rocket | bell | signature；size 尺寸 px；stroke 线宽；duration 总时长 ms；trigger: load | hover | loop；label 有则作为图片名称，无则视为装饰\n' +
    '【实现】对每条路径用 getTotalLength() 取长度，设置 stroke-dasharray = stroke-dashoffset = 长度，再过渡到 0；多条路径依次衔接绘制；颜色 currentColor（默认品牌色）\n' +
    '【方法】play() 重画\n' + R + '直接显示完整图形\n' +
    '【约束】1) 只适合线性（stroke）图标；2) 签名 / Logo 绘制控制在 2.5 秒内；3) loop 只用于空状态等装饰位置',
    { purpose: '用「画出来」的过程赋予图标生命感。', when: ['成功页、空状态插图', '品牌签名、Logo 揭示'], avoid: ['工具栏等功能性图标'] }),

  M('morph-icon', 'ui-morph-icon', '图标变形', '菜单↔关闭、播放↔暂停 平滑变形',
    '<ui-morph-icon icon="menu"></ui-morph-icon><ui-morph-icon icon="play"></ui-morph-icon><ui-morph-icon icon="plus"></ui-morph-icon><ui-morph-icon icon="arrow"></ui-morph-icon><ui-morph-icon icon="menu" size="52" pressed></ui-morph-icon>',
    '【组件】图标变形 <ui-morph-icon>\n【属性】icon: menu（汉堡↔×）| play（播放↔暂停）| plus（+↔−）| arrow（→↔←）；pressed 当前状态；size 尺寸；label 自定义无障碍名称\n' +
    '【实现】三根线条用 transform / top 过渡变形；play↔pause 用 clip-path 多边形插值；按钮 aria-pressed 同步，默认 aria-label 随状态变化（「打开菜单」/「关闭菜单」）；派发 change\n' + R + '直接切换形态\n' +
    '【约束】1) 变形前后两个图标语义必须是「一对」；2) 动画 ≤ 350ms；3) 必须有可读名称',
    { purpose: '让「同一个按钮的两种状态」之间的关系一目了然。', when: ['移动端菜单按钮', '播放器、展开/收起控制'], avoid: ['两个状态无关的图标'] }),

  M('like-button', 'ui-like-button', '点赞动效', '心形弹跳 + 彩色粒子迸发',
    '<ui-like-button count="128"></ui-like-button><ui-like-button count="2048" liked></ui-like-button>',
    '【组件】点赞动效 <ui-like-button>\n【属性】count 点赞数；liked 是否已赞；label 名称（默认「点赞」）\n' +
    '【实现】点击切换 liked 并 ±1，心形用弹性曲线放大回弹，同时 8 个彩色圆点沿 45° 间隔向外飞散淡出；颜色取 danger / warn / brand / ok token\n' +
    '【无障碍】aria-pressed 表示状态，aria-label 包含当前人数；派发 change，detail = { liked, count }\n' + R + '只切换颜色，不弹跳、不迸发\n' +
    '【约束】1) 取消点赞不播放迸发；2) 计数由服务端确认后再修正；3) 只给社交类互动用',
    { purpose: '把一次小小的点赞变成有回报感的瞬间，鼓励互动。', when: ['内容社区、评论区', '作品集、灵感站'], avoid: ['严肃的业务后台'] }),

  M('daynight', 'ui-daynight', '昼夜开关', '太阳变月亮、云朵消散、星星出现',
    '<ui-daynight onchange="var b=document.getElementById(\'themeBtn\');if(b)b.click()"></ui-daynight><span style="font-size:12px;color:var(--ui-sub)">（这个开关会真的切换画廊明暗）</span>',
    '【组件】昼夜开关 <ui-daynight>\n【属性】checked 是否为夜间；label 名称（默认「深色模式」）\n' +
    '【实现】role="switch" 按钮；背景从天空蓝渐变到夜空蓝，圆形旋钮弹性滑动并从太阳变为带月牙阴影的月亮，云朵下沉淡出，星星淡入；派发 change，detail = { checked }，由业务决定是否切换主题\n' + R + '直接切换状态\n' +
    '【约束】1) 只用于明暗切换这一个语义；2) 配色固定为天空色，不随风格变化（这是它的辨识度）；3) 尺寸 76×36，不要缩小到 40px 以下',
    { purpose: '把一个功能性开关做成让人想多按几次的小彩蛋。', when: ['个人博客、作品集的主题切换', '面向年轻用户的产品设置'], avoid: ['企业后台（用普通开关更稳重）'] }),

  M('parallax', 'ui-parallax', '视差层', '多层元素随鼠标 / 滚动以不同速度移动',
    '<ui-parallax height="210" style="width:100%">' +
    '<span data-depth="0.15" style="left:8%;top:14%;width:90px;height:90px;border-radius:50%;background:color-mix(in srgb,var(--ui-brand) 30%,transparent)"></span>' +
    '<span data-depth="0.45" style="right:12%;top:18%;font-size:38px" aria-hidden="true">🪐</span>' +
    '<span data-depth="0.7" style="left:22%;bottom:16%;font-size:30px" aria-hidden="true">🚀</span>' +
    '<span data-depth="0.3" style="right:26%;bottom:12%;width:54px;height:54px;border-radius:14px;background:color-mix(in srgb,#ec4899 40%,transparent);rotate:18deg"></span>' +
    '<div data-static style="position:relative;height:210px;display:grid;place-items:center;text-align:center;color:var(--ui-text)"><div>' + H('在鼠标下移动', '每层 data-depth 不同，产生空间感') + '</div></div></ui-parallax>',
    '【组件】视差层 <ui-parallax>\n【结构】标签内的直接子元素都是图层（绝对定位，自己写 left / top），data-depth 0-1 表示深度（越大移动越多）；加 data-static 的子元素不移动（放正文）\n' +
    '【属性】mode: pointer（跟随鼠标，默认）| scroll（跟随页面滚动）；height 最小高度；strength 整体强度倍数\n' +
    '【实现】translate3d 位移 + .25s 缓动；触屏不响应 pointer 模式；scroll 模式监听 window 滚动（passive）\n' + R + '图层静止\n' +
    '【约束】1) 深度差不要太大（≤ 40px 位移）；2) 正文层不要动；3) 一页最多一个视差区',
    { purpose: '用前后景的速度差制造景深，让平面页面「立起来」。', when: ['Hero 区、活动主视觉', '产品故事页'], avoid: ['表单、阅读区'] }, true),

  M('scroll-progress', 'ui-scroll-progress', '阅读进度', '随滚动增长的进度条',
    '<div style="width:100%;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);overflow:hidden;background:var(--ui-panel)">' +
    '<ui-scroll-progress target="#sp-box" height="4"></ui-scroll-progress>' +
    '<div id="sp-box" tabindex="0" role="region" aria-label="示例文章" style="height:150px;overflow:auto;padding:12px 14px;font-size:12.5px;line-height:1.9;color:var(--ui-sub)">' +
    '<b style="color:var(--ui-text)">滚动这段文字试试 ↓</b><br>' + '进度条把「还剩多少」可视化，降低长文阅读的焦虑。'.repeat(14) + '</div></div>',
    '【组件】阅读进度 <ui-scroll-progress>\n【属性】target 滚动容器选择器（不填为整页）；height 粗细 px（默认 3）；fixed 固定在视口顶部；label 无障碍名称\n' +
    '【实现】监听滚动（passive），进度 = scrollTop / (scrollHeight - clientHeight)，用 transform: scaleX 绘制（不触发布局）；role=progressbar + aria-valuenow 实时更新；到 100% 派发 complete\n' +
    '【视觉】品牌色到粉色的渐变；轨道为浅色 line\n' +
    '【约束】1) 只用于长文 / 长表单；2) fixed 模式注意避开固定顶栏；3) 不要和浏览器滚动条重复强调',
    { purpose: '告诉读者「还剩多少」，提高长文的完读率。', when: ['博客文章、文档页', '分步长表单'], avoid: ['短页面', '首页'] }),

  M('card-stack', 'ui-card-stack', '卡片堆叠', '左右滑动卡片，类似探探 / Tinder',
    '<ui-card-stack>' +
    [['🏔️', '徒步 · 四姑娘山', '3 天 2 晚 · 难度中等'], ['🏄', '冲浪 · 万宁日月湾', '新手友好 · 含教练'], ['🏕️', '露营 · 安吉竹林', '周末出发 · 亲子'], ['🚴', '骑行 · 环青海湖', '7 天 · 进阶']].map((c, i) =>
      '<div style="display:flex;flex-direction:column;justify-content:flex-end;padding:16px;border-radius:var(--ui-radius-lg);color:#fff;box-shadow:var(--ui-shadow);' +
      'background:linear-gradient(160deg,hsl(' + (220 + i * 40) + ' 70% 55%),hsl(' + (260 + i * 40) + ' 65% 35%))"><div style="font-size:30px" aria-hidden="true">' + c[0] + '</div><b style="font-size:16px">' + c[1] + '</b><span style="font-size:12px;opacity:.9">' + c[2] + '</span></div>').join('') +
    '</ui-card-stack>',
    '【组件】卡片堆叠 <ui-card-stack>\n【结构】标签内的每个子元素是一张卡（第一个在最上面）\n【属性】width / height 卡片尺寸 px\n' +
    '【交互】拖动顶部卡片：跟手位移 + 旋转，超过 90px 松手即飞出，否则回弹；也可点下方 ✕ / ♥ 按钮（键盘可用）；全部滑完显示空状态，↺ 重置；派发 swipe，detail = { dir: left | right, card }\n' +
    '【实现】后面的卡片按序号缩小、下移、变淡，形成层叠；非顶部卡片 inert，读屏只读到当前卡\n' + R + '卡片直接消失，不做飞出动画\n' +
    '【约束】1) 必须提供按钮作为拖动的替代；2) 卡片内不要放可点击元素；3) 一次加载 ≤ 10 张',
    { purpose: '让「快速二选一」的决策变得轻松、好玩。', when: ['推荐、匹配、选品', '单词记忆、问卷'], avoid: ['需要仔细比较的选择'] }),

  M('expand', 'ui-expand', '展开收起', '长内容折叠，平滑展开到真实高度',
    box('<ui-expand height="64"><p style="margin:0;font-size:13px;line-height:1.8;color:var(--ui-sub)">' +
      '这是一段比较长的介绍文字。展开收起组件会先显示前几行，并在底部加一层渐隐提示「还有更多」。点击按钮后，高度会从当前值平滑过渡到内容的真实高度，结束后自动改为 auto，所以窗口缩放、内容变化时也不会被截断。再次点击会收回到初始高度。' +
      '内容本身没有被隐藏（只是视觉上裁剪），读屏可以完整读到，按钮用 aria-expanded 告诉辅助技术当前状态。</p></ui-expand>', 'width:100%'),
    '【组件】展开收起 <ui-expand>\n【属性】height 收起时的高度 px（默认 72）；more / less 按钮文案；bg 渐隐遮罩颜色（默认 --ui-panel，放在其他底色上时要改）\n' +
    '【实现】高度从当前值过渡到 scrollHeight，过渡结束后设为 auto；收起时先把 auto 换成实际像素再过渡回去；内容不足高度时自动隐藏按钮和遮罩\n' +
    '【无障碍】按钮 aria-expanded + aria-controls；派发 toggle，detail = { open }\n' + R + '高度瞬间变化\n' +
    '【约束】1) 收起高度至少能看到 2-3 行；2) 不要折叠关键信息；3) 渐隐颜色必须与背景一致',
    { purpose: '在保持页面紧凑的同时，不丢失完整内容。', when: ['商品详情、评论长文', '个人简介、FAQ 答案'], avoid: ['用户几乎一定要读的内容'] }),

  M('orbit', 'ui-orbit', '环绕轨道', '图标沿多层轨道环绕中心旋转',
    '<ui-orbit items="⚛️,🟨,🐍,🦀,🐘,☕,🐹,💎" size="220"><div style="width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-weight:800;color:var(--ui-brand-ink);background:var(--ui-brand);box-shadow:var(--ui-shadow)">API</div></ui-orbit>',
    '【组件】环绕轨道 <ui-orbit>\n【属性】items 逗号分隔（emoji / 短文字），按顺序轮流分配到各层轨道；rings 轨道层数 1-3；size 尺寸 px；speed 内圈一圈秒数（外圈更慢、方向相反）；标签内为中心内容\n' +
    '【实现】每层轨道整体旋转，轨道上的元素外层定位到圆周、内层反向旋转保证始终正立；悬停时全部暂停\n' +
    '【无障碍】所有项目连成一句作为 group 的 aria-label，轨道 aria-hidden\n' + R + '静止\n' +
    '【约束】1) 每层 ≤ 6 项；2) 只表达「围绕核心的生态」，不承载可点击项；3) 中心内容要足够醒目',
    { purpose: '直观表达「一个核心 + 很多集成 / 生态」。', when: ['集成生态、技术栈介绍', '团队 / 社区展示'], avoid: ['需要逐个点击的列表'] }),

  M('ping', 'ui-ping', '雷达扩散', '圆点或头像外的扩散波纹',
    '<ui-ping label="在线"></ui-ping><ui-ping variant="danger" size="10" label="有新告警"></ui-ping><ui-ping variant="success" size="18"></ui-ping>' +
    '<ui-ping variant="brand"><span style="display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--ui-brand);color:var(--ui-brand-ink);font-weight:700">林</span></ui-ping>' +
    '<ui-ping variant="warn"><ui-button size="sm">新功能</ui-button></ui-ping>',
    '【组件】雷达扩散 <ui-ping>\n【属性】variant: brand | success | warn | danger 或任意颜色；size 圆点尺寸；label 有则 role=status 播报（实时状态），无则纯装饰\n' +
    '【用法】空标签 = 带波纹的状态点；包住头像 / 按钮 = 在外围扩散波纹（引导注意）\n' +
    '【实现】三圈描边以 .8s 间隔依次放大淡出，循环播放\n' + R + '波纹静止消失，只保留圆点\n' +
    '【约束】1) 一屏只让一个元素扩散；2) 用于「正在发生」或「请看这里」，不是装饰常态；3) 引导完成后应移除',
    { purpose: '表达「实时 / 正在进行」，或者温和地把注意力引到一个点上。', when: ['在线状态、直播中', '新功能引导点'], avoid: ['列表中的每一项都闪'] }),

  M('swap', 'ui-swap', '内容切换', '多段内容轮播：滑动 / 缩放 / 模糊 / 翻转',
    '<ui-swap effect="slide" style="width:100%">' +
    [['「这是我用过最顺手的组件库，换肤只要改一个属性。」', '林小北 · 设计师'], ['「无障碍做得很扎实，读屏和键盘都考虑到了。」', '王磊 · 前端负责人'], ['「零依赖，直接丢进老项目里就能用。」', '陈静 · 独立开发者']].map((q) =>
      box('<p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:var(--ui-text)">' + q[0] + '</p><span style="font-size:12px;color:var(--ui-sub)">— ' + q[1] + '</span>')).join('') + '</ui-swap>',
    '【组件】内容切换 <ui-swap>\n【结构】标签内每个子元素是一段内容（叠放在同一格子，高度取最高者，切换时不跳动）\n' +
    '【属性】effect: slide | zoom | blur | flip | fade；interval 自动切换 ms（0 为不自动）；index 初始项\n' +
    '【交互】底部圆点切换；鼠标悬停暂停，键盘聚焦或手动点击后停止自动播放；派发 change\n【无障碍】非当前项 inert + aria-hidden；容器 aria-live=polite\n' + R + '不自动切换，切换时无动画\n' +
    '【约束】1) 2-5 段；2) 每段停留 ≥ 3.5 秒；3) 与轮播的区别：内容可以是任意结构（评价、数据卡）',
    { purpose: '在同一位置轮流展示同类内容，比轮播更轻量。', when: ['用户评价、媒体报道', '数据亮点轮换'], avoid: ['用户需要对比阅读的内容'] }, true),

  M('hover', 'ui-hover', '悬停效果', '8 种链接 / 按钮悬停动效',
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:14px;width:100%;align-items:center;justify-items:start">' +
    ['underline', 'fill', 'border', 'arrow', 'glow', 'lift', 'skew', 'roll'].map((e) =>
      '<ui-hover effect="' + e + '"><a href="javascript:void 0" style="display:inline-block;padding:6px 10px;border-radius:var(--ui-radius);color:var(--ui-text);text-decoration:none;font-size:13.5px;font-weight:600' + (e === 'glow' || e === 'lift' ? ';background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line)' : '') + '">' + e + '</a></ui-hover>').join('') + '</div>',
    '【组件】悬停效果 <ui-hover>\n【用法】包住一个链接或按钮：<ui-hover effect="underline"><a href="…">文字</a></ui-hover>\n' +
    '【属性】effect: underline（下划线从左生长）| fill（品牌色从左扫入填充）| border（四边依次描绘）| arrow（右侧滑出 →）| glow（品牌色外发光）| lift（上浮 + 阴影）| skew（倾斜放大）| roll（文字上翻出现副本）\n' +
    '【实现】纯 CSS；所有效果在 :focus-within 时同样触发，键盘用户看得到；roll 会把文字包一层并用 data-text 生成副本（副本由伪元素生成，不重复朗读）\n' + R + '过渡瞬间完成\n' +
    '【约束】1) 同一页面统一使用 1-2 种；2) fill 用于导航或按钮，不用于正文链接；3) 悬停效果不能代替可点击的视觉提示',
    { purpose: '给可交互元素一个有个性的「我可以点」反馈。', when: ['导航链接、页脚链接', '营销页的次要按钮'], avoid: ['正文中的大量链接（用 underline 即可）'] }, true),

  M('split-flap', 'ui-split-flap', '翻牌显示', '机场 / 车站翻牌式文字切换',
    '<div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%">' +
    '<ui-split-flap words="TOKYO,PARIS,NEW YORK,SHANGHAI,LONDON" interval="3200"></ui-split-flap>' +
    '<ui-split-flap words="GATE A12,BOARDING,ON TIME" size="15" interval="2600"></ui-split-flap></div>',
    '【组件】翻牌显示 <ui-split-flap>\n【属性】words 逗号分隔（自动转大写，支持 A-Z 0-9 : -）；length 格子数（默认最长词长度）；interval 切换间隔 ms；size 字号 px\n' +
    '【实现】每格独立按字母表顺序翻到目标字符（最多翻十几次），每次翻动带 rotateX 下翻动画并逐格错开 40ms；深色牌面 + 琥珀色字，中间一道分割线\n' +
    '【无障碍】role=status 但 aria-live=off（不打扰），aria-label 始终为当前完整文字\n' + R + '直接显示目标文字\n' +
    '【约束】1) 只用英文大写和数字；2) 文字 ≤ 12 格；3) 切换间隔 ≥ 2.5 秒',
    { purpose: '用机械翻牌的复古感表达「信息在实时更新」。', when: ['旅行、交通类产品', '倒计时、发布会、活动主视觉'], avoid: ['中文内容', '需要频繁阅读的数据'] }),

  M('checkmark', 'ui-checkmark', '结果动画', '圆环绘制 → 勾 / 叉 / 叹号',
    '<ui-checkmark id="ck-demo"></ui-checkmark><ui-checkmark type="error" size="52"></ui-checkmark><ui-checkmark type="warn" size="44"></ui-checkmark>' +
    '<button class="ui-btn ui-btn--sm" onclick="document.getElementById(\'ck-demo\').replay()">重播</button>',
    '【组件】结果动画 <ui-checkmark>\n【属性】type: success | error | warn；size 尺寸 px（默认 64）；label 无障碍名称（默认「成功 / 失败 / 警告」）\n' +
    '【实现】0-0.6s 圆环描边绘制 → 0.5-0.9s 内部符号绘制 → 0.85s 圆底填充并轻微弹跳；颜色取 ok / danger / warn token，符号用 --ui-on-color 保证对比度\n' +
    '【方法】replay() 重播\n' + R + '直接显示最终图形\n' +
    '【约束】1) 配合结果页或对话框使用，旁边必须有文字说明；2) 一次只出现一个；3) 不要循环播放',
    { purpose: '用一个干脆利落的动作告诉用户「结果出来了」。', when: ['支付 / 提交成功页', '上传完成、任务失败提示'], avoid: ['列表里的每行状态'] }),

  M('scroll-hint', 'ui-scroll-hint', '滚动提示', '鼠标滚轮 / 下箭头的引导动画',
    '<ui-scroll-hint></ui-scroll-hint><ui-scroll-hint type="chevron" label="继续浏览"></ui-scroll-hint><ui-scroll-hint type="chevron" label=""></ui-scroll-hint>',
    '【组件】滚动提示 <ui-scroll-hint>\n【属性】type: mouse（鼠标轮廓 + 滚轮下移，默认）| chevron（三个向下箭头依次亮起）；label 文字（空字符串则只显示图形）\n' +
    '【实现】纯 CSS 循环动画，滚轮点用品牌色\n' + R + '静止显示\n' +
    '【约束】1) 只放在首屏底部、确实还有内容的地方；2) 用户开始滚动后可隐藏；3) 移动端用 chevron 更合适',
    { purpose: '提醒用户「下面还有内容」，避免首屏假底部。', when: ['全屏 Hero 的底部', '长图文的开头'], avoid: ['内容已经明显超出首屏的页面'] }),

  M('spring-drag', 'ui-spring-drag', '弹性拖拽', '拖走后松手，带物理回弹',
    '<ui-spring-drag style="width:100%"><span aria-hidden="true">✦</span></ui-spring-drag>',
    '【组件】弹性拖拽 <ui-spring-drag>\n【属性】height 区域高度；stiffness 弹簧刚度（默认 .12）；damping 阻尼（默认 .78）；label 无障碍名称；标签内为球内图标\n' +
    '【实现】pointer 事件拖动（setPointerCapture），记录速度；松手后用弹簧方程 v = (v − x·k)·d 每帧迭代回到中心，速度越大球越鼓；键盘聚焦后方向键推一下也会回弹；松手派发 release\n' +
    R + '直接回到中心\n【约束】1) 纯趣味交互，适合空状态、彩蛋、加载等待；2) 不要放真实功能；3) 移动端 touch-action:none 会阻止区域内滚动，区域不要太大',
    { purpose: '给等待或空白时刻一点可玩性，提升好感。', when: ['空状态、404 页', '加载等待、彩蛋'], avoid: ['表单与业务流程中'] }, true),

  M('grid-wave', 'ui-grid-wave', '网格波动', '点阵从点击处荡开一圈波纹',
    '<ui-grid-wave style="width:100%"></ui-grid-wave>',
    '【组件】网格波动 <ui-grid-wave>\n【属性】cols / rows 列数行数；auto="false" 关闭进入视口时的自动播放\n' +
    '【实现】每个点的 animation-delay = 到波源的欧氏距离 × 55ms，放大 1.9 倍并短暂变成品牌色；点击任意位置从该处发起；方法 wave(x, y)\n' +
    '【无障碍】整体 role=img + 说明，单个点不可聚焦\n' + R + '不播放\n' +
    '【约束】1) 装饰性背景，适合空状态、Hero 角落；2) 点数 ≤ 200；3) 不要放在文字下方',
    { purpose: '用一个简单的点阵制造「涟漪」般的互动惊喜。', when: ['Hero 装饰区、空状态', '数据 / 网络主题的背景'], avoid: ['内容密集区域'] }, true),

  /* ===================== 视觉 ===================== */
  V('glass-card', 'ui-glass-card', '玻璃卡片', '自带彩色背景的毛玻璃卡片',
    '<ui-glass-card style="width:100%">' + H('Pro 会员', '解锁全部 30+ 动效组件') + '<div style="margin-top:12px;font-family:var(--ui-mono);font-size:13px;letter-spacing:.1em">**** 8848</div></ui-glass-card>',
    '【组件】玻璃卡片 <ui-glass-card>\n【属性】blur 模糊半径 px（默认 18）；tint 面板不透明度 %（默认 55）；height 区域最小高度\n' +
    '【实现】容器内自带三个缓慢漂移的彩色圆（品牌色 / ok / warn 渐变）作为背景，卡片用 backdrop-filter: blur + saturate，加 1px 半透明白边和顶部内高光；不支持 backdrop-filter 时回退为不透明面板\n' +
    R + '背景圆静止\n【约束】1) 与 Glassmorphism 风格不同：这个组件在任何风格下都自带背景；2) 卡片上的文字用 --ui-text，tint 不低于 45% 保证可读；3) 一屏 ≤ 2 个',
    { purpose: '在任何风格的页面里局部营造通透、高级的质感。', when: ['会员卡、权益展示', '定价页的推荐方案'], avoid: ['大段文字', '低端设备上的长列表'] }, true),

  V('neon-text', 'ui-neon-text', '霓虹灯', '多层辉光 + 可选的闪烁',
    '<ui-neon-text><span style="font-size:26px">OPEN 24H</span></ui-neon-text><ui-neon-text color="#00e5ff" flicker><span style="font-size:22px">深夜食堂</span></ui-neon-text><ui-neon-text color="#7cff6b"><span style="font-size:18px">LIVE</span></ui-neon-text>',
    '【组件】霓虹灯 <ui-neon-text>\n【属性】color 灯管颜色（默认粉色 #ff2fb4）；flicker 不规则闪烁；bare 去掉自带的深色底板（放在深色背景上时用）\n' +
    '【实现】白色文字 + 5 层由近到远的同色 text-shadow 模拟灯管辉光；默认自带近黑底板，保证在浅色页面上也成立\n' + R + '不闪烁\n' +
    '【约束】1) 只用于 18px 以上的短词；2) 闪烁每秒不超过 3 次（光敏安全）；3) 一屏只放一个霓虹元素',
    { purpose: '用夜店灯牌的氛围制造强烈的情绪与记忆点。', when: ['夜间活动、餐饮、娱乐', 'Cyber / Terminal 风格的标题'], avoid: ['正式商务页面', '正文'] }),

  V('grain', 'ui-grain', '颗粒质感', '给任意区块加一层胶片噪点',
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;width:100%">' +
    '<div style="height:120px;border-radius:var(--ui-radius-lg);background:linear-gradient(135deg,var(--ui-brand),#ec4899);display:grid;place-items:center;color:#fff;font-weight:700">无噪点</div>' +
    '<ui-grain opacity="0.35"><div style="height:120px;background:linear-gradient(135deg,var(--ui-brand),#ec4899);display:grid;place-items:center;color:#fff;font-weight:700">静态颗粒</div></ui-grain>' +
    '<ui-grain opacity="0.4" animated><div style="height:120px;background:linear-gradient(135deg,#0f172a,#334155);display:grid;place-items:center;color:#fff;font-weight:700">动态胶片</div></ui-grain></div>',
    '【组件】颗粒质感 <ui-grain>\n【属性】opacity 噪点强度（默认 .18）；animated 胶片式抖动\n' +
    '【实现】一张内联的 SVG feTurbulence 噪点图（无外部请求）平铺在 ::after 上，mix-blend-mode: overlay；animated 用 steps(6) 快速平移模拟胶片颗粒跳动\n' + R + '颗粒静止\n' +
    '【约束】1) 适合渐变、纯色大色块，让它们不那么「塑料」；2) 文字区强度 ≤ .25；3) 不要叠在照片上（会脏）',
    { purpose: '给数字渐变加上一点「印刷 / 胶片」的物理质感。', when: ['渐变 Hero、海报式卡片', '复古、杂志风页面'], avoid: ['数据图表与表格'] }, true),

  V('mesh-gradient', 'ui-mesh-gradient', '网格渐变', '多点弥散的柔和渐变背景',
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;width:100%">' +
    '<ui-mesh-gradient height="140" animated><div style="color:#1b1f2a;font-weight:800;font-size:18px">Dreamy</div></ui-mesh-gradient>' +
    '<ui-mesh-gradient height="140" colors="#0ea5e9,#22d3ee,#a7f3d0,#6366f1"><div style="color:#0b1324;font-weight:800;font-size:18px">Ocean</div></ui-mesh-gradient>' +
    '<ui-mesh-gradient height="140" colors="#f97316,#facc15,#fb7185,#c026d3"><div style="color:#1b1f2a;font-weight:800;font-size:18px">Sunset</div></ui-mesh-gradient></div>',
    '【组件】网格渐变 <ui-mesh-gradient>\n【属性】colors 四个颜色（逗号分隔，默认紫 / 粉 / 蓝 / 黄）；height 最小高度；animated 缓慢流动\n' +
    '【实现】五层 radial-gradient 分别放在四角与中心叠加，模拟 Figma / iOS 的 Mesh Gradient；animated 时放大背景尺寸并缓慢移动位置\n' + R + '静止\n' +
    '【约束】1) 四个颜色明度要接近，否则会出现脏色；2) 上方文字用深色并校验对比度；3) 适合大面积背景，不适合小按钮',
    { purpose: '比单向渐变更柔和、更有「光」的背景。', when: ['Hero、封面、壁纸', '音乐 / 冥想 / AI 产品'], avoid: ['需要品牌色一致性的严肃页面'] }, true),

  V('glitch', 'ui-glitch', '故障风', '红蓝错位 + 切片抖动的赛博文字',
    '<div style="display:flex;flex-direction:column;gap:12px;width:100%;padding:16px;border-radius:var(--ui-radius-lg);background:#0b0d14;color:#fff">' +
    '<div style="font-size:30px"><ui-glitch text="SYSTEM ERROR"></ui-glitch></div>' +
    '<div style="font-size:18px">悬停触发：<ui-glitch text="HOVER ME" trigger="hover"></ui-glitch></div></div>',
    '【组件】故障风 <ui-glitch>\n【属性】text 文字；trigger: loop（默认）| hover；speed 一轮秒数（默认 1.6）\n' +
    '【实现】叠放三份文字：主体 + 品红 / 青色两份副本，副本用 clip-path: inset() 逐帧切片并左右错位（steps 跳帧），主体偶尔 skew 抖动\n' +
    '【无障碍】真实文字在视觉隐藏节点，三份视觉副本全部 aria-hidden（不使用伪元素 content，避免被重复朗读）\n' + R + '静止显示主体文字\n' +
    '【约束】1) 只用于短标题；2) 深色背景效果最好；3) 抖动不能高频闪烁',
    { purpose: '表达「错误、入侵、未来」等强烈的科技情绪。', when: ['404 / 错误页', '游戏、电竞、赛博主题'], avoid: ['真实的错误提示（用户会以为页面坏了）'] }),

  V('holo', 'ui-holo', '镭射卡', '彩虹镭射反光，随鼠标流动',
    '<ui-holo style="width:100%;max-width:300px;margin:0 auto"><div style="padding:22px">' +
    '<div style="font-size:11px;letter-spacing:.2em;opacity:.8">LIMITED EDITION</div><div style="font-size:24px;font-weight:900;margin:20px 0 4px">✦ 创世徽章</div>' +
    '<div style="font-size:12px;opacity:.85">No. 0001 / 1000</div></div></ui-holo>',
    '【组件】镭射卡 <ui-holo>\n【属性】tilt 跟随鼠标的倾斜角度（默认 10°）；标签内为卡面内容\n' +
    '【实现】深色卡面 + 一层彩虹斜向渐变（color-dodge 混合）+ 一层细斜纹（overlay 混合）；鼠标移动时渐变位置与卡片倾斜跟随指针，离开后进入缓慢的自动流光\n' + R + '静止反光\n' +
    '【约束】1) 只用于收藏 / 稀有 / 会员这类「珍贵感」内容；2) 卡面文字用白色并保持粗体；3) 一屏一张',
    { purpose: '复刻实体镭射卡的稀有感与把玩感。', when: ['数字藏品、成就徽章', '限定会员卡、抽卡结果'], avoid: ['普通信息卡'] }),

  V('wave', 'ui-wave', '波浪分割', '三层错速流动的 SVG 波浪',
    '<div style="width:100%;border-radius:var(--ui-radius-lg);overflow:hidden;background:var(--ui-panel-2)">' +
    '<div style="padding:22px 18px 6px;color:var(--ui-text)">' + H('区块之间的波浪分割', '比直线更柔和') + '</div><ui-wave height="80"></ui-wave></div>',
    '【组件】波浪分割 <ui-wave>\n【属性】height 高度 px（默认 90）；color 颜色（默认品牌色，可写 var(--ui-bg) 与下一个区块衔接）；layers 层数 1-3；flip 上下翻转（放在区块顶部）\n' +
    '【实现】正弦曲线生成的 SVG 路径，宽度 200% 并 translateX(-50%) 无缝循环；三层不同透明度、不同速度、方向交错\n【无障碍】纯装饰 aria-hidden\n' + R + '静止\n' +
    '【约束】1) 用于两个不同底色区块的交界；2) 高度 ≤ 120px；3) 一页 ≤ 2 处',
    { purpose: '让区块之间的过渡更柔和、更有流动感。', when: ['Hero 底部、页脚顶部', '水、音乐、健康相关产品'], avoid: ['严肃的 B 端界面'] }, true),

  V('starfield', 'ui-starfield', '星空', '闪烁星点 + 偶尔划过的流星',
    '<ui-starfield height="200" style="width:100%">' + H('仰望星空', '每颗星的位置由 seed 决定，重绘不会跳') + '</ui-starfield>',
    '【组件】星空 <ui-starfield>\n【属性】count 星星数量（默认 90）；height 最小高度；seed 随机种子（同一个 seed 星图固定）；shooting="false" 关闭流星\n' +
    '【实现】纯 CSS：每颗星是一个绝对定位的小圆点，大小、亮度、闪烁周期、相位都用可复现的伪随机生成；深蓝径向渐变夜空；一颗流星每 6 秒划过一次\n' + R + '星星静止、无流星\n' +
    '【约束】1) 上方文字用浅色；2) 星星 ≤ 200 个；3) 适合大面积背景，不适合小卡片',
    { purpose: '营造宁静、广阔、充满想象的氛围。', when: ['夜间主题 Hero、睡眠 / 冥想产品', '天文、科幻、梦想类主题'], avoid: ['需要明亮活泼氛围的页面'] }, true),

  V('grid-beam', 'ui-grid-beam', '光束网格', '网格线上穿梭的光束',
    '<ui-grid-beam style="width:100%">' + '<div style="color:var(--ui-text)">' + H('Ship faster', '光束沿网格线随机穿梭') + '</div></ui-grid-beam>',
    '【组件】光束网格 <ui-grid-beam>\n【属性】height 高度；size 网格间距 px（默认 32）；beams 光束数量；seed 随机种子\n' +
    '【实现】背景用两条 linear-gradient 画网格，四周径向渐隐；光束是贴着网格线的细渐变条，横向 / 纵向交替，容器查询单位（cqw / cqh）保证从一端穿到另一端\n' + R + '光束静止\n' +
    '【约束】1) 适合深浅两种主题的开发者产品 Hero；2) 光束 ≤ 10 条；3) 上方文字加足够留白',
    { purpose: '表达「精确、速度、基础设施」的工程美感。', when: ['开发者工具、云服务官网', '数据平台 Hero'], avoid: ['温暖、生活化的品牌'] }, true),

  V('border-beam', 'ui-border-beam', '边框光点', '一段光沿着卡片边框循环游走',
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;width:100%">' +
    '<ui-border-beam><div style="padding:16px"><b style="color:var(--ui-text)">AI 正在思考…</b><div style="font-size:12px;color:var(--ui-sub);margin-top:4px">默认 5s 一圈</div></div></ui-border-beam>' +
    '<ui-border-beam speed="3" width="2" length="110" colors="var(--ui-ok),var(--ui-brand)"><div style="padding:16px"><b style="color:var(--ui-text)">同步中</b><div style="font-size:12px;color:var(--ui-sub);margin-top:4px">更快 · 更长 · 自定义色</div></div></ui-border-beam></div>',
    '【组件】边框光点 <ui-border-beam>\n【属性】speed 一圈秒数（默认 5）；width 光线粗细 px；length 光带长度（角度，默认 70°）；colors 头部与尾部颜色\n' +
    '【实现】::before 上一个大部分透明的 conic-gradient，只露出 length 度的彩色弧；mask-composite: exclude 让它只出现在边框上；@property 注册角度变量使其平滑旋转\n' + R + '光带停在原地\n' +
    '【约束】1) 用来表示「正在处理」或「这是特别的」；2) 与流光边框二选一，别叠加；3) 一屏一个',
    { purpose: '比整圈流光更克制地表达「活跃 / 处理中」。', when: ['AI 生成中的输入框 / 卡片', '推荐方案、新功能卡片'], avoid: ['静态信息卡'] }),

  V('meteors', 'ui-meteors', '流星雨', '斜向划过的多颗流星',
    '<ui-meteors style="width:100%">' + H('许个愿吧 ✨', '流星位置与节奏由 seed 决定') + '</ui-meteors>',
    '【组件】流星雨 <ui-meteors>\n【属性】count 流星数量（默认 14）；height 最小高度；seed 随机种子\n' +
    '【实现】每颗流星是带渐隐尾巴的发光小点，统一 215° 方向，起点、速度、尾长、相位伪随机；深色夜空渐变背景\n' + R + '流星不动（不可见）\n' +
    '【约束】1) 数量 ≤ 40；2) 适合深色背景；3) 不与星空、粒子同时出现',
    { purpose: '在深色区块里增加动态与浪漫感。', when: ['节日活动、许愿 / 抽奖页', '深色 Hero 背景'], avoid: ['浅色主题页面'] }, true),

  V('image-compare', 'ui-image-compare', '前后对比', '拖动分隔线对比两张图',
    '<ui-image-compare demo="2" style="width:100%;max-width:560px;margin:0 auto"></ui-image-compare>',
    '【组件】前后对比 <ui-image-compare>\n【属性】before / after 两张图片地址；demo 内置示例图编号（只有一张时「之前」用 CSS 滤镜模拟未修图）；label-before / label-after 标签；ratio 宽高比；value 初始位置 %\n' +
    '【实现】两张图叠放，上层用 clip-path: inset 裁剪；一个透明的原生 range 覆盖全图负责拖动——鼠标、触屏、键盘（←→ / Home / End）天然可用，读屏能读出位置；派发 input\n' +
    '【约束】1) 两张图尺寸与构图必须一致；2) 分隔把手要有足够的点击区域；3) 左右标签说明哪边是哪边',
    { purpose: '让「变化」直观可见，比并排两张图更有说服力。', when: ['修图 / 滤镜效果、装修前后', 'AI 图像增强、重设计案例'], avoid: ['两张图构图不同'] }, true),

  V('lens', 'ui-lens', '放大镜', '鼠标处圆形放大查看细节',
    '<ui-lens demo="4" alt="示例风景" style="width:100%;max-width:360px;margin:0 auto"></ui-lens>',
    '【组件】放大镜 <ui-lens>\n【属性】src 图片地址 / demo 示例图编号；alt 图片描述；zoom 放大倍数（默认 2.5）；size 镜片直径 px；ratio 宽高比\n' +
    '【实现】镜片是一个以同一张图为背景的圆形元素，背景尺寸 = 图片尺寸 × zoom，背景位置跟随指针反向偏移；进入时从 0.6 缩放弹出\n' +
    '【无障碍】原图保留 alt；镜片纯装饰 aria-hidden（需要可访问的细节查看请另外提供大图链接）\n' +
    '【约束】1) 原图分辨率要足够（至少显示尺寸 × zoom）；2) 触屏无效，移动端请用点击放大；3) zoom 2-4 倍为宜',
    { purpose: '不离开页面就能查看商品 / 作品的细节。', when: ['电商商品图、材质细节', '地图、设计稿、证件照审核'], avoid: ['移动端为主的页面'] }),

  V('image-filter', 'ui-image-filter', '图片滤镜', '9 种 CSS 滤镜预设，悬停看原图',
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px;width:100%">' +
    ['vintage', 'mono', 'noir', 'warm', 'cool', 'pop', 'fade', 'duotone', 'blur'].map((f, i) => '<ui-image-filter demo="' + (i % 6) + '" filter="' + f + '" alt="' + f + ' 滤镜示例"></ui-image-filter>').join('') + '</div>',
    '【组件】图片滤镜 <ui-image-filter>\n【属性】src / demo 图片；alt；filter: vintage | mono | noir | warm | cool | pop | fade | blur | duotone；reveal="false" 关闭悬停显示原图；ratio；caption 说明（默认滤镜中文名）\n' +
    '【实现】CSS filter 组合预设；duotone 先去色，再叠加 multiply（品牌色暗部）+ screen（暖色亮部）两层，颜色随风格变化\n' + R + '悬停切换无过渡\n' +
    '【约束】1) 同一组图片统一滤镜；2) 商品图不要用会改变颜色的滤镜（误导）；3) blur 只用于背景',
    { purpose: '让风格不一的图片在视觉上统一，或制造氛围。', when: ['团队照片墙、博客配图统一色调', '作品集、相册'], avoid: ['需要真实还原颜色的商品图'] }, true),

  V('text-3d', 'ui-text-3d', '立体文字', '3D 挤出、长投影、描边、复古等字效',
    '<div style="display:flex;flex-wrap:wrap;gap:18px 28px;align-items:center;width:100%;font-size:30px">' +
    '<ui-text-3d>3D</ui-text-3d><ui-text-3d effect="long">LONG</ui-text-3d><ui-text-3d effect="outline">OUTLINE</ui-text-3d>' +
    '<ui-text-3d effect="retro">RETRO</ui-text-3d><ui-text-3d effect="stack">STACK</ui-text-3d><span style="padding:4px 12px;border-radius:var(--ui-radius);background:var(--ui-panel-2)"><ui-text-3d effect="emboss">EMBOSS</ui-text-3d></span></div>',
    '【组件】立体文字 <ui-text-3d>\n【属性】effect: 3d（品牌色挤出）| long（长投影，depth 控制长度）| outline（描边空心字）| retro（三色错位）| stack（品牌色层叠）| emboss（浮雕）；depth 长投影长度\n' +
    '【实现】多层 text-shadow 叠加（颜色由品牌色 color-mix 计算，随风格变化）；outline 用 -webkit-text-stroke；悬停轻微位移；高对比模式自动回退为普通文字\n' + R + '悬停位移瞬间完成\n' +
    '【约束】1) 只用于 28px 以上的英文 / 数字短标题；2) emboss 需放在 panel-2 底上；3) outline 文字要足够粗',
    { purpose: '不需要图片，用纯 CSS 做出海报级的标题字效。', when: ['活动主视觉、游戏标题', '复古 / 潮流风格页面'], avoid: ['中文长标题、正文'] }, true),

  V('gooey', 'ui-gooey', '融合液滴', '多个色球靠近时像液体一样粘连',
    '<ui-gooey size="200">GOO</ui-gooey>',
    '【组件】融合液滴 <ui-gooey>\n【属性】size 尺寸 px（默认 180）；标签内为中心文字\n' +
    '【实现】经典 SVG goo 滤镜：feGaussianBlur 模糊 → feColorMatrix 把 alpha 对比度拉高（22 / -9），模糊重叠的边缘就会「黏」在一起；五个色球以不同周期往返运动；每个实例的滤镜 id 唯一\n' + R + '色球静止\n' +
    '【约束】1) 纯装饰；2) 滤镜开销较大，一页 ≤ 2 个；3) 中心文字要短',
    { purpose: '用有机、液态的形态表达「融合 / 连接 / 流动」。', when: ['加载等待、品牌装饰', '社交、融合类产品概念图'], avoid: ['性能敏感的列表页'] }),

  V('cursor-trail', 'ui-cursor-trail', '鼠标拖尾', '区域内鼠标经过留下彩色轨迹',
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;width:100%">' +
    '<ui-cursor-trail height="150">在这里移动鼠标</ui-cursor-trail><ui-cursor-trail height="150" shape="star">✨ 星星拖尾</ui-cursor-trail></div>',
    '【组件】鼠标拖尾 <ui-cursor-trail>\n【属性】shape: dot | star；height 区域高度\n' +
    '【实现】pointermove 节流到约 60 次/秒，每次插入一个彩色小元素（品牌 / 粉 / warn / ok 轮换），向下飘散淡出后自动移除；同时存在的粒子上限 80 个\n' + R + '不产生轨迹\n' +
    '【约束】1) 只在限定区域内使用，不要全页面跟随鼠标；2) 纯装饰；3) 不要用于需要精确指向的区域',
    { purpose: '为创意页面增加一点「跟手」的愉悦感。', when: ['作品集、活动页彩蛋', '儿童 / 娱乐产品'], avoid: ['工具、后台、表单'] }, true),

  V('cube', 'ui-cube', '3D 立方体', '六个面的旋转立方体',
    '<ui-cube></ui-cube><ui-cube faces="HTML,CSS,JS,A11Y,UX,UI" size="90" speed="8"></ui-cube>',
    '【组件】3D 立方体 <ui-cube>\n【属性】faces 六个面的文字（逗号分隔）；size 边长 px；speed 一圈秒数\n' +
    '【实现】preserve-3d 容器内六个面分别 rotateX / rotateY + translateZ(边长/2) 组合成立方体，整体绕 Y 轴旋转；各面颜色由品牌色混合出明暗；悬停暂停\n' +
    '【无障碍】role=img，aria-label 列出六个面的内容\n' + R + '静止\n' +
    '【约束】1) 每面文字 ≤ 4 个字符；2) 纯展示，不要放可点击内容；3) 一屏一个',
    { purpose: '用立体感展示「多面」的概念，吸引目光。', when: ['技术栈 / 能力展示', '3D、游戏、教育主题'], avoid: ['信息需要被完整阅读'] }),

  V('ribbon', 'ui-ribbon', '角标丝带', '卡片角上的斜向丝带，带扫光',
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;width:100%">' +
    '<ui-ribbon text="NEW">' + box('<b style="color:var(--ui-text)">新品上架</b><div style="font-size:12px;color:var(--ui-sub);margin-top:4px">右上角 · brand</div>', 'height:110px') + '</ui-ribbon>' +
    '<ui-ribbon text="HOT" variant="danger" position="left">' + box('<div style="text-align:right"><b style="color:var(--ui-text)">爆款</b><div style="font-size:12px;color:var(--ui-sub);margin-top:4px">左上角 · danger</div></div>', 'height:110px') + '</ui-ribbon>' +
    '<ui-ribbon text="-30%" variant="success">' + box('<b style="color:var(--ui-text)">限时优惠</b><div style="font-size:12px;color:var(--ui-sub);margin-top:4px">success</div>', 'height:110px') + '</ui-ribbon></div>',
    '【组件】角标丝带 <ui-ribbon>\n【属性】text 丝带文字（≤ 6 字符）；position: right | left；variant: brand | success | danger | warn\n' +
    '【实现】容器 overflow:hidden，丝带旋转 45° 横跨角落，带投影；一道高光每 3.5 秒扫过一次；文字色用 brand-ink / on-color 保证对比度\n' + R + '不扫光\n' +
    '【约束】1) 同一列表中只给少数卡片加；2) 文字必须很短；3) 丝带下方不要放重要内容',
    { purpose: '在卡片网格里一眼标出「新、热、促销」。', when: ['商品列表、模板市场', '定价卡片的推荐标记'], avoid: ['每张卡都加（失去意义）'] }, true),

  V('snow', 'ui-snow', '飘雪', '摇曳下落的雪花，节日氛围',
    '<ui-snow style="width:100%">' + H('Merry Christmas 🎄', '雪花数量与位置由 seed 决定') + '</ui-snow>',
    '【组件】飘雪 <ui-snow>\n【属性】count 雪花数量（默认 40）；height 最小高度；flake 大雪花字符（可多个，如 "❄❅❆"，也可换成 🌸 🍂 做樱花 / 落叶）；seed 随机种子\n' +
    '【实现】纯 CSS：大小两种雪花，小的是圆点、大的用字符；每片有自己的下落时长、左右摇摆幅度、旋转与相位\n' + R + '雪花静止\n' +
    '【约束】1) 只用于节日 / 季节性活动，活动结束及时下线；2) 数量 ≤ 120；3) 上方文字加阴影保证可读',
    { purpose: '用最低成本营造节日与季节氛围。', when: ['圣诞、春节、冬季活动', '换成花瓣 / 落叶做春秋主题'], avoid: ['日常业务页面长期挂着'] }, true)
];
