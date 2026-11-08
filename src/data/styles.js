/* UI 风格预设元信息（真正生效的变量在 styles/tokens.css）
   swatch：风格页与下拉菜单里的代表色（仅用于展示） */
export const styles = [
  {
    id: 'aurora',
    name: 'Aurora 默认',
    swatch: ['#4f7cff', '#f6f7fb', '#1b1f2a'],
    brief: '圆角 + 柔和阴影，最通用的现代 SaaS 观感',
    tags: ['圆角 10px', '柔和阴影', '品牌蓝 #4F7CFF'],
    note: '适合绝大多数 B 端后台与工具型产品，识别成本最低。'
  },
  {
    id: 'brutal',
    name: 'Neo Brutalism',
    swatch: ['#ffd84d', '#ffffff', '#12141a'],
    brief: '硬边框 + 硬投影 + 零圆角，强个性',
    tags: ['零圆角', '2px 黑边', '6px 硬投影'],
    note: '适合作品集、活动页、创意工具；信息密度高的表单里易显噪。'
  },
  {
    id: 'glass',
    name: 'Glassmorphism',
    swatch: ['#4f7cff', '#ffe1f0', '#dbf7ee'],
    brief: '半透明毛玻璃 + 大圆角，层次靠光',
    tags: ['backdrop-filter', '半透明面板', '圆角 14-22px'],
    note: '需要彩色背景衬托，纯白页面上会失效；注意对比度与性能。'
  },
  {
    id: 'mono',
    name: 'Mono 工程风',
    swatch: ['#111318', '#ffffff', '#d6dae2'],
    brief: '等宽字体 + 细边框 + 无阴影，克制',
    tags: ['等宽字体', '无阴影', '单一强调色'],
    note: '适合文档、开发者工具、数据看板；中文等宽字体需额外指定。'
  },
  {
    id: 'neumorph',
    name: 'Neumorphism 新拟态',
    swatch: ['#5b6cff', '#e4e8ef', '#c4c9d3'],
    brief: '同色背景 + 双向光影，元素像从表面凸起',
    tags: ['无边框', '亮暗双阴影', '输入框内凹'],
    note: '适合音乐播放器、智能家居面板等轻交互界面；对比度偏低，不适合信息密集页面。'
  },
  {
    id: 'clay',
    name: 'Claymorphism 黏土',
    swatch: ['#7c5cff', '#f4f0ff', '#ffffff'],
    brief: '超大圆角 + 内高光 + 彩色投影，软萌有体积',
    tags: ['圆角 18-28px', '内外双阴影', '圆体字'],
    note: '适合儿童教育、消费类 App、活动营销；严肃金融/医疗场景慎用。'
  },
  {
    id: 'material',
    name: 'Material You',
    swatch: ['#6750a4', '#fef7ff', '#eaddff'],
    brief: '色调化表面 + 胶囊按钮 + 标准动效曲线',
    tags: ['胶囊按钮', 'Tonal 表面', 'M3 配色'],
    note: '适合 Android 生态与跨平台应用，用户熟悉度高；品牌个性相对弱。'
  },
  {
    id: 'cyber',
    name: 'Cyber Neon 赛博',
    swatch: ['#00eaff', '#07080f', '#e21fbf'],
    brief: '暗底霓虹 + 发光描边 + 等宽字，科技感拉满',
    tags: ['发光阴影', '极小圆角', '深色优先'],
    note: '适合游戏、Web3、开发者活动页；长时间阅读易疲劳，正文区域需降饱和。'
  },
  {
    id: 'paper',
    name: 'Paper 纸张编辑',
    swatch: ['#b4472f', '#f5efe3', '#2b2620'],
    brief: '米色纸张 + 衬线字体 + 赤陶强调色，有书卷气',
    tags: ['衬线字体', '暖色纸底', '几乎无阴影'],
    note: '适合博客、杂志、读书笔记、文化品牌；中文衬线字体需确认系统可用。'
  },
  {
    id: 'retro',
    name: 'Retro 98 复古',
    swatch: ['#000080', '#c0c0c0', '#008080'],
    brief: '立体斜面按钮 + 蓝色标题栏，像素时代的怀旧感',
    tags: ['斜面阴影', '零圆角', '无动效'],
    note: '适合彩蛋、怀旧主题活动、小游戏；作为正式产品主风格时可用性一般。'
  },
  {
    id: 'nord',
    name: 'Nord 北欧冷调',
    swatch: ['#5e81ac', '#eceff4', '#88c0d0'],
    brief: '低饱和冰蓝灰，安静、耐看、长时间不累眼',
    tags: ['Nord 色板', '中等圆角', '柔和阴影'],
    note: '适合编辑器、笔记、开发者工具和需要长时间专注的界面。'
  },
  {
    id: 'luxury',
    name: 'Luxury 黑金',
    swatch: ['#d4af6a', '#0c0c0b', '#f7f4ee'],
    brief: '衬线字体 + 金色强调 + 大写字距，高级克制',
    tags: ['衬线字体', '金色渐变按钮', '近乎直角'],
    note: '适合奢侈品、酒店、珠宝、高端会员页；深色版更有氛围，信息密集页面慎用。'
  },
  {
    id: 'bauhaus',
    name: 'Bauhaus 包豪斯',
    swatch: ['#d6261b', '#1f4fd1', '#f2b705'],
    brief: '红黄蓝三原色 + 粗黑线 + 无阴影，几何秩序感',
    tags: ['三原色', '2px 黑线', '粗体大写'],
    note: '适合设计类活动、展览、品牌官网；比 Brutalism 更规整、更「海报感」。'
  },
  {
    id: 'candy',
    name: 'Candy 糖果',
    swatch: ['#f0458f', '#fff5fa', '#ffd3e7'],
    brief: '粉色系 + 圆体 + 底部实色投影，Q 弹可爱',
    tags: ['圆角 16-24px', '实色下投影', '按下回弹'],
    note: '适合社区、社交、女性向/年轻向消费产品；B 端后台不建议使用。'
  },
  {
    id: 'terminal',
    name: 'Terminal 终端',
    swatch: ['#33ff66', '#040904', '#12801e'],
    brief: '磷光绿等宽字 + 零圆角 + 发光，黑客终端感',
    tags: ['等宽字体', '磷光发光', '按钮带 > 前缀'],
    note: '适合 CLI 工具官网、CTF、技术博客彩蛋；正文阅读建议用浅色版。'
  },
  {
    id: 'miui', name: 'MIUI / HyperOS',
    swatch: ['#2458bf', '#f4f6fa', '#e7efff'],
    brief: '大标题、浅底分组、紧凑连接项的手机系统风格灵感',
    tags: ['分组设置', '留白层级', '44px 触控'],
    note: '原创参考风格，非官方复刻；适合设置与偏好页，系统 APP 预览只跟随全站明暗。'
  },
  {
    id: 'coui', name: 'COUI / ColorOS',
    swatch: ['#00636b', '#f2f7f8', '#def0f0'],
    brief: '参考 ColorOS 的圆润卡片与分类胶囊的原创风格灵感',
    tags: ['冷青层次', '圆润存储卡', '分类胶囊'],
    note: 'COUI 是本目录的风格命名，不宣称独立官方规范或官方组件；适合文件与素材操作页。'
  },
  {
    id: 'oneui', name: 'One UI',
    swatch: ['#2857aa', '#f3f5f9', '#e5edfc'],
    brief: '上部宽松观览、下部可触达操作，柔和胶囊的风格灵感',
    tags: ['上观览下交互', '单手触达', '柔和胶囊'],
    note: '原创参考，不复刻官方应用；适合提醒事项与轻量任务，强调观看区和交互区分离。'
  },
  {
    id: 'harmonyos', name: 'HarmonyOS',
    swatch: ['#1c58b4', '#f3f6fb', '#e2ecfc'],
    brief: '节制蓝色、设备层级、清楚连接状态的原创风格灵感',
    tags: ['设备层级', '节制蓝色', '拇指操作'],
    note: '原创设备中心示例，非官方产品；设备与连接数据仅在本地页面演示。'
  },
  {
    id: 'originos', name: 'OriginOS',
    swatch: ['#a33f34', '#f7f4f1', '#f5e4df'],
    brief: '大小不等的模块跨度、日期条与原子日程的原创风格灵感',
    tags: ['模块跨度', '华容网格灵感', '日期配置'],
    note: '参考早期模块化网格原则，非最新版或官方复刻；适合不同权重的日程与配置页。'
  },
  {
    id: 'flyme', name: 'Flyme',
    swatch: ['#146b56', '#fbfcfb', '#e5f2ed'],
    brief: '大留白、细分隔、低装饰与克制青绿的原创风格灵感',
    tags: ['低装饰', '细分隔', '青绿强调'],
    note: '参考 Flyme 8 的留白原则，非最新版或官方复刻；适合轻量笔记与文本内容浏览。'
  },
  {
    id: 'dusk', name: 'Dusk Glass 晚霞液态玻璃',
    swatch: ['#b66d44', '#e4c0a6', '#ebd7cc'],
    brief: '暖桃晚霞底 + 半透明白磨砂玻璃 + 铜橙强调，柔光大圆角',
    tags: ['backdrop-filter 28px', '铜橙强调', '圆角 12-24px'],
    note: '需要晚霞渐变背景衬托；数据看板、品牌后台适用。铜橙文字已压暗到 4.5:1，亮铜色只用于图形与底色。'
  }
];
