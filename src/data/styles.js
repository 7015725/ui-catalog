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
  }
];
