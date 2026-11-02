/* =========================================================
   趣味组件元数据（25 个）
   新分类「趣味」15 个 + 表单 6 个 + 展示 2 个 + 图表 2 个
   ========================================================= */
const R = '【减少动效】系统开启「减少动态效果」或 <html data-motion="reduce"> 时，';
const j = (v) => JSON.stringify(v).replace(/'/g, '&#39;');
const E = (id, tag, name, cat, brief, demo, ai, design, wide) => ({ id: id, tag: tag, name: name, cat: cat, brief: brief, demo: demo, ai: ai, design: design, wide: !!wide });
const F = (id, tag, name, brief, demo, ai, design, wide) => E(id, tag, name, '趣味', brief, demo, ai, design, wide);
const out = (id, txt) => '<div id="' + id + '" style="font-size:12.5px;color:var(--ui-sub);min-height:1.4em">' + (txt || '') + '</div>';

export const funCatalog = [
  /* ===================== 趣味 ===================== */
  F('scratch', 'ui-scratch', '刮刮卡', '用手指刮开涂层揭晓奖品',
    '<ui-scratch cover="刮开涂层" onreveal="document.getElementById(\'scr-out\').textContent=\'reveal 事件：\'+event.detail.text">' +
    '<div style="font-size:28px">🎁</div><b style="font-size:17px">恭喜获得 50 元无门槛券</b><span style="font-size:12px;color:var(--ui-sub)">有效期至本月底</span></ui-scratch>' + out('scr-out'),
    '【组件】刮刮卡 <ui-scratch>\n【属性】cover 涂层上的文字；height 高度 px（默认 140）；threshold 刮开比例达到多少自动揭晓（0.1-0.95，默认 0.5）；brush 笔刷直径 px\n' +
    '【内容】默认插槽放奖品内容（揭晓前 aria-hidden）\n' +
    '【实现】canvas 盖在奖品上，先画银色渐变 + 噪点 + 文字；pointer 拖动用 globalCompositeOperation="destination-out" 画粗线擦除；每 10 次移动采样一次 alpha 统计刮开比例，超过 threshold 时淡出整块涂层；尺寸用 ResizeObserver 等布局完成后再绘制\n' +
    '【事件/方法】reveal（detail.text）；reset() 重新盖上涂层\n' +
    '【无障碍】右下角始终有「直接揭开」按钮，键盘与读屏用户不需要刮；揭开后用 aria-live 播报奖品\n' +
    '【约束】1) 奖品结果应由服务端决定，前端只负责展示；2) 涂层文字要说清「刮开」动作；3) 移动端记得 touch-action:none 防止页面跟着滚',
    { purpose: '把「领奖」变成一个有期待感的小动作。', when: ['营销活动、签到奖励', '新用户首单福利'], avoid: ['用户必须立即看到的信息（如订单金额）', '一个页面上放多张'] }),

  F('lucky-wheel', 'ui-lucky-wheel', '幸运大转盘', 'SVG 扇区 + 缓动减速的抽奖转盘',
    '<ui-lucky-wheel size="230" onresult="document.getElementById(\'wh-out\').textContent=\'result 事件：第 \'+(event.detail.index+1)+\' 格「\'+event.detail.prize+\'」\'"></ui-lucky-wheel>' + out('wh-out'),
    '【组件】幸运大转盘 <ui-lucky-wheel>\n【属性】prizes 逗号分隔的奖项（2-12 个，顺时针排列，第 1 个在正上方）；size 直径 px\n' +
    '【实现】SVG 画扇形：每格角度 a=360/n，路径 M 中心 → 弧线；文字按格中心角 rotate；颜色在品牌色 / 浅品牌色之间交替（奇数格数时加第三色避免首尾相同）；中心按钮点击后计算目标角度 = -(k×a + 随机偏移)，在当前角度上再加 6 圈，用 4.4s cubic-bezier(.15,.7,.1,1) 过渡\n' +
    '【事件/方法】result（detail: index, prize）；spin(index?) 可指定中奖格（由服务端返回结果时用）\n' +
    '【无障碍】转盘 role=img，aria-label 列出全部奖项；结果用 aria-live 播报；转动中按钮 disabled\n' + R + '直接给出结果\n' +
    '【约束】1) 中奖结果必须由服务端决定后调用 spin(index)；2) 格子文字 ≤ 6 字；3) 公示中奖概率',
    { purpose: '用「转起来再慢慢停下」的过程制造期待，比直接告诉结果更有参与感。', when: ['抽奖、每日福利', '团队随机点名 / 决定今天吃什么'], avoid: ['涉及真实金额且概率不透明的场景'] }),

  F('slot-machine', 'ui-slot-machine', '老虎机', '三轴滚动，停下后判断是否中奖',
    '<ui-slot-machine luck="0.35"></ui-slot-machine>',
    '【组件】老虎机 <ui-slot-machine>\n【属性】symbols 逗号分隔的符号（emoji 最佳）；reels 轴数 2-5（默认 3）；luck 演示用的强制中奖概率 0-1\n' +
    '【实现】每个轴是 overflow:hidden 的窗口，里面一条竖排符号带；点击时把符号带换成「当前符号 + 14+i×6 个随机符号 + 结果」，再用 translateY 过渡到最后一个，轴越靠右时长越长（1.1s + i×0.45s），缓动带一点回弹；停下后把带子收缩回单个符号，避免 DOM 越滚越长；全部相同时窗口闪金边并撒花\n' +
    '【事件/方法】result（detail: symbols, win）；spin()\n【无障碍】窗口 role=img，aria-label 为当前结果；提示语 aria-live\n' + R + '直接显示结果\n' +
    '【约束】1) 结果应由服务端给出；2) 符号 4-8 种；3) 不要配真实赌博奖励',
    { purpose: '娱乐化的抽奖形式，适合轻松的活动页。', when: ['节日活动、积分小游戏', '彩蛋'], avoid: ['涉及真实金钱的博彩', '严肃业务界面'] }),

  F('dice', 'ui-dice', '3D 骰子', 'CSS 3D 立方体，点一下翻滚出点数',
    '<ui-dice count="2" onroll="document.getElementById(\'dice-out\').textContent=\'roll 事件：\'+event.detail.values.join(\' + \')+\' = \'+event.detail.total"></ui-dice>' + out('dice-out'),
    '【组件】3D 骰子 <ui-dice>\n【属性】count 骰子数 1-6；size 边长 px；value 初始点数（逗号分隔）\n' +
    '【实现】每颗骰子是 transform-style:preserve-3d 的立方体，6 个面分别 rotateX/rotateY 后 translateZ(边长/2)；面内 3×3 网格放点，1 点为红色大点；对面点数之和为 7；掷骰时为每颗累加 2-3 圈的随机整圈数，再加上目标面朝前所需的角度，用带回弹的 1.2s 过渡，骰子之间错开 80ms\n' +
    '【事件/方法】roll（detail: values, total）；roll()\n【无障碍】骰子区 role=img，aria-label 为点数；合计 aria-live\n' + R + '直接显示结果\n' +
    '【约束】1) 父级需要 perspective；2) 面背景用不透明色，否则能看穿；3) 骰子数 ≤ 6',
    { purpose: '给随机结果一个可信、好玩的视觉载体。', when: ['桌游、小游戏', '随机分组 / 抽签'], avoid: ['需要可审计随机性的场景'] }),

  F('flip-clock', 'ui-flip-clock', '翻页时钟', '复古翻牌数字，每秒翻一页',
    '<div style="display:flex;flex-wrap:wrap;gap:22px;align-items:flex-end;justify-content:center;width:100%">' +
    '<ui-flip-clock size="38" label="现在时间"></ui-flip-clock><ui-flip-clock countdown="3725" size="26" label="活动倒计时"></ui-flip-clock></div>',
    '【组件】翻页时钟 <ui-flip-clock>\n【属性】seconds="false" 隐藏秒；countdown 倒计时秒数（设置后显示 时:分:秒 并递减）；size 字号 px；label 下方说明\n' +
    '【实现】每位数字由上半片和下半片组成（各 overflow:hidden 50% 高，里面放 200% 高的数字分别对齐顶 / 底）；数字变化时：静态上半片立即换新、静态下半片保持旧值，插入两张翻页片——旧值上半片 rotateX(0→-90°) 并变暗，新值下半片延迟 0.28s rotateX(90°→0)，结束后更新下半片并移除翻页片\n' +
    '【事件】done（倒计时归零）\n【无障碍】role=timer（默认不播报），视觉隐藏节点同步完整时间文本；数字 DOM aria-hidden\n' + R + '数字直接替换\n' +
    '【约束】1) 只有变化的位才翻；2) 页面离开时清掉 setInterval；3) 用等宽字体',
    { purpose: '用实体翻牌的质感展示时间或倒计时，复古、有仪式感。', when: ['活动倒计时、发布会', '大屏 / 桌面时钟'], avoid: ['表格里的普通时间字段'] }),

  F('pull-lamp', 'ui-pull-lamp', '拉绳台灯', '往下拉灯绳开关灯——一个很有手感的开关',
    '<ui-pull-lamp onchange="document.getElementById(\'lamp-out\').textContent=\'change 事件：\'+(event.detail.on?\'开\':\'关\')"></ui-pull-lamp>' + out('lamp-out'),
    '【组件】拉绳台灯 <ui-pull-lamp>\n【属性】on 是否开灯；label 无障碍名称（默认「台灯」）；width 宽度 px\n' +
    '【实现】纯 CSS 画吊线、灯罩（clip-path 梯形，品牌色）、灯泡和光锥（梯形 + 黄色到透明的渐变）；灯绳是一个按钮，按住往下拖时绳子随手指拉长（最多 40px），松手超过 22px 就切换，并以 spring 缓动弹回；直接点击 / 回车时自动播放一次「拉一下」；开灯时背景从深夜蓝过渡到暖白，灯泡发光\n' +
    '【事件】change（detail.on）；on 属性可读写\n【无障碍】灯绳是 role=switch 的按钮，aria-checked 同步状态\n' + R + '切换无过渡\n' +
    '【约束】1) 作为趣味开关，用在主题切换、彩蛋等轻松场景；2) 普通设置项请用标准开关',
    { purpose: '把「开 / 关」做成一个有物理反馈的小玩具。', when: ['深色 / 浅色主题切换彩蛋', '404、空状态里的互动'], avoid: ['表单里的普通开关项'] }),

  F('coin-flip', 'ui-coin-flip', '抛硬币', '3D 硬币抛起翻转，统计正反次数',
    '<ui-coin-flip onflip="document.getElementById(\'coin-out\').textContent=\'flip 事件：\'+event.detail.label+\'面\'"></ui-coin-flip>' + out('coin-out'),
    '【组件】抛硬币 <ui-coin-flip>\n【属性】heads / tails 两面文字（默认 正 / 反）；size 直径 px\n' +
    '【实现】硬币是 preserve-3d 的圆，两面 backface-visibility:hidden，反面 rotateX(180deg)；点击后在当前角度上累加 5-7 整圈，结果为反面时再多转 180°，1.4s 减速过渡；外层同时播放一次「抛起-落下」的 translateY 动画；金色径向渐变 + 内描边做出币边\n' +
    '【事件/方法】flip（detail: result heads|tails, label, heads, tails 累计次数）；flip()\n【无障碍】硬币 role=img，aria-label 为当前朝上的面；累计结果 aria-live\n' + R + '直接显示结果\n' +
    '【约束】1) 两面文字 1-2 个字；2) 需要公平性证明的场景请由服务端出结果',
    { purpose: '二选一时的轻松决策器。', when: ['「今天谁请客」类小工具', '游戏先后手'], avoid: ['需要可审计随机性的场景'] }),

  F('memory-game', 'ui-memory-game', '翻牌配对', '记忆小游戏：翻开两张相同即配对',
    '<ui-memory-game onwin="document.getElementById(\'mem-out\').textContent=\'win 事件：\'+event.detail.moves+\' 步 / \'+event.detail.seconds+\' 秒\'"></ui-memory-game>' + out('mem-out'),
    '【组件】翻牌配对 <ui-memory-game>\n【属性】symbols 逗号分隔的图案（每个出现两次，最多 10 对）；cols 列数\n' +
    '【实现】洗牌后渲染为按钮网格；卡片用 preserve-3d + rotateY(180deg) 翻面，正反面 backface-visibility:hidden；翻开第二张时比较：相同则标记已配对（绿色底 + 轻微弹跳），不同则锁定 0.8s 后翻回；全部配对时撒花并显示步数与用时\n' +
    '【事件/方法】win（detail: moves, seconds）；restart()\n【无障碍】每张卡是 button，aria-label 随状态变为「第 n 张，🐶 / 背面 / 已配对」；结果 aria-live\n' + R + '翻面无过渡\n' +
    '【约束】1) 4×3 或 4×4 最合适；2) 图案差异要明显；3) 给「重新开始」入口',
    { purpose: '轻量小游戏，用于等待、活动或品牌互动。', when: ['加载等待、活动页彩蛋', '儿童 / 教育产品'], avoid: ['生产力工具的主流程'] }),

  F('piano', 'ui-piano', '迷你钢琴', 'Web Audio 合成音色，鼠标滑奏或键盘弹奏',
    '<ui-piano octaves="1"></ui-piano>',
    '【组件】迷你钢琴 <ui-piano>\n【属性】octaves 八度数 1-3；start 起始八度（默认 4，即 C4）；labels="false" 隐藏键位字母；height 琴键高度 px\n' +
    '【实现】白键 flex 等分，黑键绝对定位在相邻白键交界处（left = 第 n 个白键右沿）；按下时用 Web Audio 生成三角波 + 高八度正弦波，经增益包络（12ms 起音、1.4s 指数衰减）模拟钢琴；按住拖动可滑奏；聚焦后用 A W S E D F T G Y H U J K 弹奏（与常见 DAW 键位一致）\n' +
    '【事件】note（detail: midi, name）\n【无障碍】整体是可聚焦的 group，aria-label 说明键盘玩法；每个键有音名 aria-label，琴键自身不进入 Tab 顺序\n' +
    '【约束】1) AudioContext 必须在用户手势后创建；2) 组件卸载时 close() 释放音频；3) 移动端屏幕窄时只放一个八度',
    { purpose: '有声音的互动最能打动人：音乐教学、品牌彩蛋、声音设计演示。', when: ['音乐教育、乐理工具', '品牌互动彩蛋'], avoid: ['安静的办公场景默认发声'] }),

  F('gift-box', 'ui-gift-box', '拆礼盒', '摇晃的礼物盒，点开后盖子飞起、奖品弹出',
    '<ui-gift-box><div style="font-size:30px">🎟️</div><b style="font-size:16px">年度会员 7 天体验</b><span style="font-size:12px;color:var(--ui-sub)">已放入你的卡包</span></ui-gift-box>',
    '【组件】拆礼盒 <ui-gift-box>\n【属性】label 提示文字；color 盒子颜色（默认玫红，丝带固定金色）\n【内容】默认插槽放礼物内容\n' +
    '【实现】盒身 + 盒盖都是带竖向丝带渐变的方块，蝴蝶结用两个带边框的 ::before/::after 椭圆；待机时每 2.6s 摇晃一次；点击后盖子向上飞出并旋转、盒身缩小淡出，奖品从下方弹出，同时撒花；最后出现「再包一次」\n' +
    '【事件/方法】open；open() / reset()\n【无障碍】盒子是 button，aria-expanded + aria-controls 指向奖品区；打开后焦点移到「再包一次」\n' + R + '直接显示奖品\n' +
    '【约束】1) 奖品内容不要过长；2) 一页最多一个；3) 结果由服务端决定',
    { purpose: '把「获得」包装成「拆开」，提升惊喜感。', when: ['新手礼包、生日福利', '任务完成奖励'], avoid: ['需要立即看到的关键信息'] }),

  F('music-player', 'ui-music-player', '迷你播放器', '黑胶唱片旋转 + 频谱跳动的音乐卡片',
    '<ui-music-player></ui-music-player>',
    '【组件】迷你播放器 <ui-music-player>\n【属性】tracks JSON 数组 [{ title, artist, dur(秒), emoji }]\n' +
    '【实现】左侧黑胶唱片用 repeating-radial-gradient 画纹路、中心标签用品牌色，播放时 rotate 无限循环；频谱是 20 根 scaleY 往返动画的细条，各自时长不同，暂停时 animation-play-state:paused；进度条是原生 range（可拖动跳转），播放到结尾自动下一首；上一首在已播放 >3s 时回到开头\n' +
    '【事件/方法】play / pause / track（detail: index, track）；play() / pause()\n【无障碍】三个控制按钮有 aria-label，播放键的 label 随状态切换；进度条 aria-valuetext 为「1:23 / 3:24」\n' + R + '唱片与频谱静止\n' +
    '【约束】1) 示例为模拟播放，接真实音频时改为监听 <audio> 的 timeupdate；2) 窄容器下自动上下排列',
    { purpose: '在卡片尺寸内完成「正在播放」的完整表达。', when: ['播客 / 音乐 / 有声书', '个人主页的「最近在听」'], avoid: ['需要歌词、列表等完整功能的播放页'] }),

  F('weather', 'ui-weather', '天气卡', '会动的太阳、云、雨、雪、闪电',
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px;width:100%">' +
    '<ui-weather type="sunny" city="杭州" temp="26" range="最高 29° · 最低 19°" forecast="周二:cloudy:27/18,周三:rain:22/17,周四:storm:21/16,周五:sunny:28/19"></ui-weather>' +
    '<ui-weather type="snow" city="哈尔滨" temp="-8" range="最高 -3° · 最低 -15°" forecast="周二:snow:-5/-14,周三:cloudy:-2/-12,周四:sunny:0/-11,周五:snow:-6/-16"></ui-weather></div>',
    '【组件】天气卡 <ui-weather>\n【属性】type: sunny | cloudy | rain | snow | storm；city；temp；desc（不填按 type 自动）；range 最高最低；forecast 逗号分隔「标签:type:温度」\n' +
    '【实现】纯 CSS 天气图标：太阳 = 圆 + 用 repeating-conic-gradient 加径向 mask 做的光芒环慢速旋转；云 = 圆角条 + 两个伪元素圆；雨滴 / 雪花是带负延迟的下落动画；闪电用 clip-path 折线 + steps 闪烁；卡片背景按天气切换深色渐变，文字固定白色（对比度 ≥ 4.5）\n' +
    '【无障碍】整卡 role=group，aria-label「杭州天气：晴，26°」；动画图标 aria-hidden；预报里的 emoji 带文字 aria-label\n' + R + '图标静止\n' +
    '【约束】1) 背景渐变不要用浅色，否则白字不可读；2) 预报最多 5 天；3) 数据来源要标注',
    { purpose: '让天气信息一眼可读，又有一点生动。', when: ['首页小组件、出行 / 活动类产品'], avoid: ['需要逐小时精确数据的专业气象界面'] }),

  F('battery', 'ui-battery', '电池电量', '按电量变色，充电时流光',
    '<ui-battery level="86"></ui-battery><ui-battery level="42"></ui-battery><ui-battery level="12"></ui-battery><ui-battery level="63" charging size="60" label="设备电量"></ui-battery>',
    '【组件】电池 <ui-battery>\n【属性】level 0-100；charging 是否充电；size 宽度 px；label 无障碍名称\n' +
    '【实现】外框 + 右侧正极小块用伪元素；填充宽度 = level%，≤20 红、≤50 橙、其余绿；充电时填充上叠一条 300% 宽的高光渐变横向移动，中间叠闪电 SVG（描边用面板色，任何电量下都看得清）\n' +
    '【无障碍】role=meter + aria-valuenow，aria-valuetext「63%，充电中」\n' + R + '高光不移动\n' +
    '【约束】1) 颜色之外同时显示百分比数字；2) 低电量阈值按业务调整',
    { purpose: '设备类产品里最直观的电量表达。', when: ['IoT 设备列表、蓝牙外设、电动车'], avoid: ['与电量无关的进度（用进度条）'] }),

  F('sticky-notes', 'ui-sticky-notes', '便利贴墙', '可拖动、可编辑、可增删的便利贴',
    '<ui-sticky-notes height="250"></ui-sticky-notes>',
    '【组件】便利贴墙 <ui-sticky-notes>\n【属性】items 逗号分隔「文字|颜色」，颜色 yellow | pink | blue | green | orange；height 墙高 px\n' +
    '【实现】墙是带点阵背景的 relative 容器；每张便利贴绝对定位、带 ±3° 随机倾斜；按住顶部条拖动（拖动时摆正、放大、阴影加深，并置顶 z-index），位置限制在墙内；正文是透明 textarea 可直接编辑；× 删除；「＋ 便利贴」在随机位置新建并聚焦\n' +
    '【事件】change（detail.notes = [{ text, color }]）\n【无障碍】顶部条可聚焦，方向键每次移动 10px；textarea 和删除按钮都有 aria-label\n' +
    '【约束】1) 便利贴底色固定浅色、字固定深色，不随主题变化；2) 需要持久化时监听 change 存储',
    { purpose: '自由摆放的轻量笔记，适合头脑风暴和随手记。', when: ['看板、白板类产品', '个人仪表盘的备忘区'], avoid: ['结构化任务管理（用看板或列表）'] }, true),

  F('joystick', 'ui-joystick', '虚拟摇杆', '拖动摇杆输出 -1~1 的方向向量',
    '<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:center;width:100%">' +
    '<ui-joystick size="130" onmove="var s=document.getElementById(\'joy-ship\');s.style.transform=\'translate(\'+(event.detail.x*70)+\'px,\'+(-event.detail.y*42)+\'px) rotate(\'+(event.detail.distance?90-event.detail.angle:0)+\'deg)\'"></ui-joystick>' +
    '<div aria-hidden="true" style="position:relative;width:180px;height:120px;border-radius:var(--ui-radius-lg);border:var(--ui-border-w) dashed var(--ui-line);display:grid;place-items:center;overflow:hidden">' +
    '<span id="joy-ship" style="font-size:28px;transition:transform .12s linear;display:inline-block">🚀</span></div></div>',
    '【组件】虚拟摇杆 <ui-joystick>\n【属性】size 直径 px；label 无障碍名称\n' +
    '【实现】底座内一个可拖动的圆形摇杆头；pointer 拖动时以底座中心为原点，超出半径（底座 29%）时按比例收回圆周；输出 x、y（上为正）∈[-1,1]、angle（0° 向右，逆时针）、distance∈[0,1]；松手用 spring 缓动回中心并派发 end\n' +
    '【事件】move（detail: x, y, angle, distance）、end\n【无障碍】可聚焦，方向键（可组合成斜向）控制，松开回中\n' +
    '【约束】1) touch-action:none 防止页面滚动；2) 高频事件里不要做重计算，需要时用 rAF 节流；3) 游戏中通常配合 requestAnimationFrame 按速度移动',
    { purpose: '移动端游戏 / 遥控 / 云台控制的标准输入方式。', when: ['H5 小游戏、远程控制、机器人 / 无人机'], avoid: ['桌面端只需选择方向的场景（用方向按钮）'] }),

  /* ===================== 表单 ===================== */
  E('signature', 'ui-signature', '手写签名', '表单', '带笔锋的签名板，支持撤销 / 清空 / 导出',
    '<ui-signature label="请在下方签名" onchange="document.getElementById(\'sig-out\').textContent=event.detail.empty?\'\':\'change 事件：共 \'+event.detail.strokes+\' 笔\'"></ui-signature>' + out('sig-out'),
    '【组件】手写签名 <ui-signature>\n【属性】label；height 画板高度 px；placeholder\n' +
    '【实现】canvas 按 devicePixelRatio 放大；每一笔记录 [x, y, 线宽] 点列，线宽由移动速度决定（越快越细，并与上一点做平滑），形成笔锋；所有笔画保存在内存中，撤销 = 删最后一笔后重绘；尺寸变化（ResizeObserver）和主题切换（监听 html 的 data-theme / data-style）都会重绘，墨色跟随 --ui-text\n' +
    '【事件/方法】change（detail: empty, strokes）；undo() / clear() / toDataURL(type?) / isEmpty\n' +
    '【无障碍】canvas role=img，aria-label 同步「已签名 / 未签名」；状态文字 aria-live；需要提供「输入姓名代替签名」等替代方式给无法手写的用户\n' +
    '【约束】1) 导出前确认 isEmpty 为 false；2) 法律效力需配合身份认证与时间戳，不只是一张图片',
    { purpose: '在线确认 / 签收 / 协议签署时采集手写签名。', when: ['电子合同、快递签收、问卷确认'], avoid: ['仅需「我同意」勾选即可的场景'] }),

  E('knob', 'ui-knob', '旋钮', '表单', '模拟硬件的圆形旋钮，拖动或滚轮调节',
    '<ui-knob label="音量" value="40" unit="%"></ui-knob><ui-knob label="温度" min="16" max="30" step="0.5" value="24" unit="°C"></ui-knob><ui-knob label="混响" value="70" size="72"></ui-knob>',
    '【组件】旋钮 <ui-knob>\n【属性】label；min / max / step / value；unit 单位后缀；size 直径 px\n' +
    '【实现】SVG：底部留 90° 缺口的 270° 轨道（-135° 到 135°），值弧线从 -135° 画到当前角度；中间圆盘 + 指针线随角度旋转；外圈 11 个刻度；拖动时用 atan2 计算指针相对中心的角度映射到值，落在底部死区时吸附到最近端点\n' +
    '【事件】input（拖动中）、change（松手 / 键盘）；value 属性可读写\n' +
    '【无障碍】role=slider + aria-valuemin/max/now/valuetext；方向键 ±step，PageUp/PageDown ±10%，Home/End 到两端；聚焦时滚轮可调\n' +
    '【约束】1) 精确输入的场景旁边配一个数字框；2) 不要在一行放太多旋钮',
    { purpose: '在紧凑空间里调节连续值，带来硬件般的手感。', when: ['音频 / 灯光 / 温控等「调参」界面', '仪表盘式控制面板'], avoid: ['普通表单（滑块更易理解）'] }),

  E('pattern-lock', 'ui-pattern-lock', '手势密码', '表单', '九宫格连线解锁，支持校验与键盘输入',
    '<ui-pattern-lock answer="1-2-3-5-7-8-9" hint="画一个 Z 试试解锁" onsuccess="document.getElementById(\'pl-out\').textContent=\'success 事件：\'+event.detail.pattern"></ui-pattern-lock>' + out('pl-out'),
    '【组件】手势密码 <ui-pattern-lock>\n【属性】answer 正确图案（点序号 1-9 用 - 连接）；min 最少点数（默认 4）；size 尺寸 px；hint 提示语\n' +
    '【实现】3×3 按钮网格 + 覆盖的 SVG：已连接点用 polyline 连线，末端到手指位置用一条跟随线；指针在点的 34% 半径内即命中；跨过中间点（如 1→3）时自动补上中间的 2；松手后判定：点数不足 / 匹配 / 不匹配，分别显示红色抖动或绿色，1.4s 后复位\n' +
    '【事件】complete（detail: pattern, points）、success、fail\n【无障碍】每个点是按钮（第 n 行第 m 个），键盘可用 Enter 逐个选点，再按「确认」；结果 aria-live\n' +
    '【约束】1) 前端不要存明文答案，示例仅演示；2) 失败多次要限流；3) 提供密码等替代解锁方式',
    { purpose: '移动端快速解锁 / 二次确认。', when: ['App 隐私锁、敏感页面二次验证'], avoid: ['唯一的身份认证手段（安全性有限）'] }),

  E('slide-verify', 'ui-slide-verify', '滑块验证', '表单', '拖到最右 / 拼图对准缺口的人机验证',
    '<div style="display:grid;gap:16px;width:100%;max-width:320px">' +
    '<ui-slide-verify mode="puzzle" onsuccess="document.getElementById(\'sv-out\').textContent=\'success 事件：偏移 \'+event.detail.offset+\'px\'"></ui-slide-verify>' + out('sv-out') +
    '<ui-slide-verify></ui-slide-verify></div>',
    '【组件】滑块验证 <ui-slide-verify>\n【属性】mode: slider（拖到最右）| puzzle（拼图）；text 轨道提示语\n' +
    '【实现】轨道 + 44px 手柄，拖动时左侧填充色跟随；puzzle 模式上方是纯 CSS 风景图（多层径向 / 线性渐变），随机位置挖一个半透明缺口，拼图块使用同一背景、background-size 等于图片尺寸、background-position 取缺口坐标的负值，所以图案严丝合缝；拼图块 left 与手柄同步；松手时误差 ≤ 6px 成功，否则抖动并回弹；↻ 换位置\n' +
    '【事件/方法】success / fail（detail.offset）；reset()\n【无障碍】手柄 role=slider，方向键移动、End 到底（slider 模式）、Enter 提交（puzzle 模式）；结果 aria-live assertive\n' + R + '回弹无过渡\n' +
    '【约束】1) 前端滑块只是体验层，真正的校验必须在服务端（轨迹、耗时等）；2) 为视障用户准备短信 / 语音等替代验证',
    { purpose: '在登录 / 注册 / 发送验证码前做轻量人机验证。', when: ['频繁请求的入口前'], avoid: ['把它当作唯一的安全防线'] }),

  E('emoji-rate', 'ui-emoji-rate', '表情评分', '表单', '五个表情代替星星，选中时放大弹跳',
    '<ui-emoji-rate onchange="document.getElementById(\'er-out\').textContent=\'change 事件：\'+event.detail.value+\' 分（\'+event.detail.label+\'）\'"></ui-emoji-rate>' + out('er-out'),
    '【组件】表情评分 <ui-emoji-rate>\n【属性】label 问题；value 1-5；labels 每档文字（逗号分隔）；faces 表情（逗号分隔，默认 😡😕😐🙂😍）\n' +
    '【实现】未选中的表情 grayscale(1) 并略缩小，悬停 / 聚焦时恢复彩色并放大，选中项放大 1.28 倍、加品牌浅色底并播放一次弹跳；下方文字随悬停预览、离开后显示选中项\n' +
    '【事件】change（detail: value, label）；value 属性可读写\n【无障碍】role=radiogroup + 每项 role=radio / aria-checked，漫游 tabindex，方向键切换并选中\n' +
    '【约束】1) 档位 3-5 个；2) 表情含义要从差到好单调递增；3) 不要只用颜色区分',
    { purpose: '让满意度评价更直观、更有情绪，填写率比星级更高。', when: ['NPS / 满意度回访', '客服结束后的评价'], avoid: ['需要精确打分的专业评审'] }),

  E('hold-button', 'ui-hold-button', '长按确认', '表单', '按住进度填满才执行，防止误触危险操作',
    '<ui-hold-button onconfirm="document.getElementById(\'hold-out\').textContent=\'confirm 事件：\'+new Date().toLocaleTimeString()"></ui-hold-button>' +
    '<ui-hold-button variant="primary" label="长按发布" done="已发布 ✓" duration="1000"></ui-hold-button>' + out('hold-out'),
    '【组件】长按确认 <ui-hold-button>\n【属性】label；done 完成后的文字；duration 需要按住的毫秒（400-6000，默认 1500）；variant: danger | primary | success；reset 完成后多久复原（ms，0 表示不复原）\n' +
    '【实现】按钮内一层 scaleX 从 0 到 1 的填充，按住时以 duration 线性过渡，松开时 .3s 快速退回；计时器到点后切换为实心完成态并振动；使用 pointer capture，手指滑出按钮也算松开\n' +
    '【事件】holdstart、holdcancel、confirm\n【无障碍】键盘按住空格 / Enter 同样生效（忽略自动重复）；下方「按住 1.5 秒确认」通过 aria-describedby 关联；完成时 aria-live 播报\n' +
    '【约束】1) 时长 1-2 秒最合适；2) 必须有可见的说明文字；3) 不可撤销的操作仍建议提供撤销入口',
    { purpose: '替代二次确认弹窗，用「坚持一下」过滤误触。', when: ['删除、发布、结束直播等不可逆操作', '移动端单手操作'], avoid: ['高频的普通操作'] }),

  /* ===================== 展示 ===================== */
  E('sortable', 'ui-sortable', '拖拽排序', '展示', '拖手柄重排列表，其它项平滑让位',
    '<ui-sortable onchange="document.getElementById(\'sort-out\').textContent=\'change 事件：\'+event.detail.order.join(\' → \')"></ui-sortable>' + out('sort-out'),
    '【组件】拖拽排序 <ui-sortable>\n【属性】items 逗号分隔\n' +
    '【实现】按住 ⋮⋮ 手柄拖动：被拖项跟手 translateY（偏移 = 指针位移 - 自身 offsetTop 变化，所以 DOM 重排后不会跳）；拖动项中线越过某项中线时立即 insertBefore，其它项用 FLIP（记录前后位置差、先反向 translate 再过渡到 0）平滑让位；序号徽标实时更新\n' +
    '【事件】change（detail.order）\n【无障碍】手柄是按钮：空格 / Enter 拿起，↑↓ 移动，再按空格放下，Esc 也会放下；每一步用 aria-live 播报「已拿起 / 第 n 位」；列表通过 aria-describedby 关联操作说明\n' + R + '让位无过渡\n' +
    '【约束】1) 只让手柄可拖，避免和文字选择冲突；2) 长列表需要拖到边缘时自动滚动；3) 结果要能保存',
    { purpose: '让用户自己决定顺序：优先级、播放列表、菜单顺序。', when: ['任务优先级、导航菜单配置、歌单'], avoid: ['顺序由系统规则决定的列表'] }),

  E('reactions', 'ui-reactions', '表情回应', '展示', '像 Slack / 飞书那样给消息加表情',
    '<div style="display:flex;flex-direction:column;gap:8px;width:100%"><div style="font-size:13px;color:var(--ui-text);padding:10px 12px;border-radius:var(--ui-radius);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line)">' +
    '<b>小林</b> <span style="color:var(--ui-sub);font-size:12px">10:24</span><br>v2.0 已经发到灰度了，大家帮忙看看 🙌</div>' +
    '<ui-reactions items="👍:12,🎉:5,❤️:8,🚀:3" mine="🎉"></ui-reactions></div>',
    '【组件】表情回应 <ui-reactions>\n【属性】items 逗号分隔「表情:人数」；mine 我已点过的表情\n' +
    '【实现】每个表情是一个胶囊按钮，点过的高亮（aria-pressed）；再点一次取消，人数为 0 时移除；「😀＋」打开 12 宫格表情面板（方向键移动、Esc 关闭、点击外部关闭），选中后加入或高亮已有项；数字变化时胶囊弹一下\n' +
    '【事件】change（detail.reactions = [{ emoji, count, mine }]）\n【无障碍】胶囊 aria-label「👍 12 人，含你」；面板 aria-expanded + aria-controls，关闭后焦点回到触发按钮\n' +
    '【约束】1) 人数多时 hover 显示谁点了；2) 表情面板可以接入完整的 emoji 选择器',
    { purpose: '比回复更轻的反馈方式，减少「+1」类消息。', when: ['IM、评论区、文档批注'], avoid: ['需要正式审批意见的场景'] }),

  /* ===================== 图表 ===================== */
  E('radar', 'ui-radar', '雷达图', '图表', '多维能力对比，进入视口时从中心弹开',
    '<ui-radar label="候选人能力对比" labels="沟通,技术,设计,产品,管理,学习" series=\'' + j([{ name: '候选人 A', values: [85, 92, 60, 70, 55, 88] }, { name: '候选人 B', values: [70, 65, 90, 85, 75, 72] }]) + '\'></ui-radar>',
    '【组件】雷达图 <ui-radar>\n【属性】labels 维度（≥3，逗号分隔）；values 单组数值；series JSON [{ name, values, color? }] 多组；max 满分（默认 100）；label 图表名称\n' +
    '【实现】SVG 300×300：4 层同心多边形网格（隔层填浅底色）+ 轴线；每组数据一个多边形（20% 透明填充 + 2px 描边）和顶点圆点（带 <title> 悬停提示）；标签按所在方位自动左 / 中 / 右对齐；进入视口时各组从中心 scale 弹开，组间错开 0.12s；多组时显示图例\n' +
    '【无障碍】svg role=img，aria-label 包含所有维度和数值\n' + R + '直接显示\n' +
    '【约束】1) 维度 3-8 个；2) 系列 ≤ 3 组，否则重叠难读；3) 各维度量纲要统一',
    { purpose: '一眼看出多维度的长板和短板。', when: ['能力模型、产品对比、游戏角色属性'], avoid: ['需要精确比较数值（用条形图）', '维度之间没有可比性'] }),

  E('word-cloud', 'ui-word-cloud', '词云', '图表', '按权重放大关键词，最重的居中',
    '<ui-word-cloud clickable onselect="document.getElementById(\'wc-out\').textContent=\'select 事件：\'+event.detail.word"></ui-word-cloud>' + out('wc-out'),
    '【组件】词云 <ui-word-cloud>\n【属性】words 逗号分隔「词:权重」；min / max 字号范围 px；clickable 可点击（派发 select）；label 名称\n' +
    '【实现】按权重降序后左右交替插入，形成「中间大、两边小」的排列；字号在 min-max 间线性映射，字重分三档；部分小词竖排（writing-mode:vertical-rl）增加错落感；用 flex-wrap 居中布局，天然响应式、不重叠；进入视口时从中心向两边依次弹入\n' +
    '【事件】select（detail.word）\n【无障碍】是一个 ul 列表，读屏按顺序读出；clickable 时每个词是 button；title 显示权重\n' + R + '直接显示\n' +
    '【约束】1) 词数 15-40 个；2) 颜色只用 3-4 种主题色；3) 精确比较请用条形图',
    { purpose: '快速感知文本里的高频主题。', when: ['用户反馈分析、搜索热词、标签概览'], avoid: ['需要精确数值的报告'] }, true)
];
