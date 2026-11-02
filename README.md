# UI 组件库 · 画廊

一套**零依赖**的原生 Web Components 组件库，附带一个把「预览 / AI 提示词 / 设计说明 / 代码」放在同一张卡片里的展示页。

## 为什么是零依赖

- 没有构建步骤：组件是原生自定义元素（Custom Elements），浏览器直接跑。
- 没有框架绑定：以后要包成 Vue / React 组件只是加一层壳。
- 换肤靠 CSS 变量：同一份组件代码，改 `data-style` / `data-theme` 就换风格，不改一行组件逻辑。

## 启动（带实时刷新）

需要 Node.js 18+（无需 `npm install`，零依赖）。

```bash
npm run dev          # 启动并自动打开浏览器
# 或：node dev-server.mjs
# Windows 也可以直接双击 start-dev.bat
```

打开 http://127.0.0.1:5173 （测试页：/test.html）。

- 改 `.css` → 样式即时热替换，页面不刷新
- 改 `.js` / `.html` → 页面自动刷新，并保留滚动位置
- 端口被占用时会自动顺延到下一个端口

没装 Node 时的备用方式（无实时刷新）：`python3 -m http.server 5173`

> 必须走 HTTP。直接双击 `index.html` 用 `file://` 打开时，浏览器会因 CORS 拒绝加载 ES Module。

## 目录

```
index.html                 页面外壳（顶栏 / 侧栏 / 主区）
src/
  app.js                   画廊逻辑：视图切换、筛选、搜索、面板、复制
  styles/
    tokens.css             ★ 设计变量：主题(颜色) + 风格(形态)
    app.css                展示页自身的布局样式
  lib/
    positioner.js          Layer：portal + fixed 定位 + 空间不足翻转
    focus.js               FOCUSABLE 选择器 + trapTab 焦点陷阱
    motion.js              reduced() / onVisible() / loop()：减少动效判断、进入视口、可自动暂停的动画循环
  components/
    base.js                UIElement 基类 + register() + cssRegistry
    form.js                ui-button / input / textarea / select / switch / slider / checkbox / radio
    display.js             ui-tag / badge / avatar / card / stat
    nav.js                 ui-tabs / breadcrumb / steps / pagination
    feedback.js            ui-progress / spinner / skeleton / empty / alert
    overlay.js             ui-dropdown / ui-tooltip + toast() 全局 API
    datepicker.js          ui-datepicker（月历面板）
    tree.js                ui-tree（JSON 递归渲染）
    modal.js               ui-modal（遮罩 + 焦点陷阱 + 节点搬运）
    drawer.js              ui-drawer（贴边全高面板）
    popover.js             ui-popover（可放交互内容的气泡）
    table.js               ui-table（columns/rows 传 JSON）
    accordion.js           ui-accordion（单开/多开折叠）
    control.js             ui-segmented / ui-rate
    more-form.js           ui-number / tag-input / otp / upload / color / chips
    more-display.js        ui-timeline / avatar-group / descriptions / list / carousel / code / kbd / divider
    more-nav.js            ui-navbar（容器自适应）/ ui-menu / ui-ring / ui-result
    more-form2.js          ui-password / range（双滑块）/ search（联想）/ option-cards
    charts.js              ui-sparkline / bar-chart / donut / heatmap（零依赖图表）
    more-misc.js           ui-profile / pricing / bottom-nav / command（⌘K）/ countdown / banner / status
    more-form3.js          ui-multi-select / cascader / transfer / input-group
    more-display2.js       ui-image（灯箱）/ comment / calendar
    charts2.js             ui-line-chart / gauge / funnel
    more-overlay.js        ui-anchor / split-button / context-menu / popconfirm + uiNotify()
    motion.js              动效：ui-reveal / typewriter / count-up / marquee / text-anim / ripple / flip-card / animate / loader + uiConfetti()
    effects.js             视觉：ui-tilt / spotlight / gradient-border / aurora / gradient-text / pattern / blob / particles / magnetic / shine
    motion2.js             动效：scramble / rotating-text / odometer / draw-svg / morph-icon / like-button / daynight / parallax / scroll-progress / card-stack
    motion3.js             动效：expand / orbit / ping / swap / hover / split-flap / checkmark / scroll-hint / spring-drag / grid-wave
    effects2.js            视觉：glass-card / neon-text / grain / mesh-gradient / glitch / holo / wave / starfield / grid-beam / border-beam
    effects3.js            视觉：meteors / image-compare / lens / image-filter / text-3d / gooey / cursor-trail / cube / ribbon / snow
    index.js               统一注册 + 类表（供生成属性文档）
  data/
    catalog.js             ★ 唯一数据源：demo + AI 提示词 + 设计说明（第一批）
    catalog-more.js        第二批组件元数据（wide: true 表示宽屏占两列）
    catalog-more2.js       第三批组件元数据（含「图表」分类）
    catalog-more3.js       第四批组件元数据
    catalog-motion.js      「动效」「视觉」第一批（各 10 个）
    catalog-motion2.js     「动效」「视觉」第二批（各 20 个）
scripts/
  check.mjs                跨平台语法检查（npm run check）
    styles.js              风格预设的元信息（含代表色 swatch）
    style-guides.js        每套风格的 AI 提示词 + 设计说明（风格页展示；提示词末尾自动附上从 tokens.css 实时读取的变量值）
```

## 动效与视觉效果

「动效」「视觉」两个分类各 30 个组件，统一遵守三条规则：

1. **尊重减少动效**：系统开启「减少动态效果」，或页面 `<html data-motion="reduce">`（顶栏「✨ 动效」按钮）时，
   CSS 动画瞬间完成、JS 动画直接给出最终状态（打字机显示第一句、数字直接显示终值、粒子静止、撒花不播放）；
   加载动画例外——改为缓慢呼吸，避免用户以为页面卡死。
2. **不白白耗电**：粒子等 `requestAnimationFrame` 循环在离开视口或标签页隐藏时自动暂停，元素移除时停止并断开观察器；
   打字机、数字滚动进入视口后才开始。
3. **只做装饰，不改语义**：逐字动画、数字滚动、打字机都把完整文本放在视觉隐藏节点里给读屏；无限滚动的副本 `aria-hidden` 且不可 Tab。

动效曲线也是 token：`--ui-ease`（入场 / 位移）、`--ui-spring`（回弹）。

## 内联事件（自定义事件也能写在标签上）

原生事件（`onclick`、`onchange`、`onselect`…）浏览器本来就支持；基类额外让**自定义事件**也能内联：

```html
<ui-popconfirm danger onconfirm="uiToast('已删除')">…</ui-popconfirm>
<ui-split-button label="保存" onaction="save()" onselect="console.log(event.detail.label)"></ui-split-button>
```

## 三条硬约定

1. **组件 CSS 只允许 `var(--ui-*)`。** 写死颜色/圆角/阴影会让换肤立刻失效，这是整套方案的地基。
2. **内容走 `<slot></slot>`。** 基类会在微任务里快照原始子节点，再搬进占位处。
3. **属性即 props。** 在类上声明 `static props`，就会自动出现在文档的「可用属性」里。

> 踩过的坑：用 `innerHTML` 注入标记时，`connectedCallback` 早于子节点解析完成，
> 此时读 `innerHTML` 会拿到空值。基类因此用 `queueMicrotask` 延后启动，并改为
> **搬运节点**而不是字符串替换，避免内容丢失。

## 浮层组件（dropdown / tooltip / datepicker）的三条约定

1. **面板一律挂到 body 的 portal，用 `position:fixed`。**
   组件卡本身带 `backdrop-filter`，它会成为 `fixed` 的包含块 —— 面板若留在组件内部，
   坐标会以卡片为参照而不是视口，且会被 `overflow:hidden` 裁掉。
2. **关闭判定要带时间窗。** 触发面板的那次点击会继续冒泡到 document，
   `Layer` 用 `_openedAt` + 60ms 窗口挡掉同一个事件；早期用 `setTimeout(0)` 延迟绑定
   listener，反而造成相邻两次点击状态错乱（面板刚开就被关）。
3. **组件卸载要 `destroy()` 面板。** `disconnectedCallback` 里销毁 Layer，
   否则重渲染会遗留游离节点。

新增浮层组件时，直接复用 `new Layer()`：`setContent(html)` / `show(anchor, placement, offset)` /
`hide()` / `toggle()`，placement 形如 `bottom-start`、`top-center`。

## 内置风格（15 套）

| data-style | 名称 | 特征 |
|---|---|---|
| `aurora` | Aurora 默认 | 圆角 + 柔和阴影 |
| `brutal` | Neo Brutalism | 零圆角、2px 黑边、硬投影 |
| `glass` | Glassmorphism | 半透明毛玻璃、大圆角 |
| `mono` | Mono 工程风 | 等宽字体、无阴影 |
| `neumorph` | Neumorphism 新拟态 | 同色背景 + 亮暗双阴影、输入框内凹 |
| `clay` | Claymorphism 黏土 | 超大圆角 + 内高光 + 彩色投影 |
| `material` | Material You | Tonal 表面、胶囊按钮、M3 配色 |
| `cyber` | Cyber Neon 赛博 | 暗底霓虹、发光描边 |
| `paper` | Paper 纸张编辑 | 米色纸底、衬线字体 |
| `retro` | Retro 98 复古 | 斜面按钮、蓝色标题栏 |
| `nord` | Nord 北欧冷调 | 低饱和冰蓝灰、耐看 |
| `luxury` | Luxury 黑金 | 衬线字体、金色渐变按钮、大写字距 |
| `bauhaus` | Bauhaus 包豪斯 | 红黄蓝三原色、2px 黑线、无阴影 |
| `candy` | Candy 糖果 | 粉色系、圆体、实色下投影 |
| `terminal` | Terminal 终端 | 磷光绿等宽字、按钮带 `>` 前缀 |

每套都有浅色 / 深色两份变量，并且都经过对比度校验：正文、次要文字、品牌色文字、语义色对面板背景均 ≥ 4.5:1（WCAG AA），
`test.html` 里有一条用例对 15 × 2 组合逐一断言，改 token 时如果把对比度改坏了会直接报红。

`--ui-on-color` 是「实心语义色（ok / warn / danger 做底色）上的文字色」：浅色主题为白色、深色主题为近黑色，
靠 CSS 变量继承就近生效，所以深色页面里嵌一块浅色预览也不会取错。

只靠变量表达不了的少量形态差异（如 Material 的胶囊按钮、Retro 的标题栏）
写在 `tokens.css` 末尾的「风格微调」区，仍然只引用 `var(--ui-*)`，并按 `[data-style]` 作用域生效，所以局部换肤照样可用。

## 自适应

- **页面**：≥900px 左侧分类栏；<900px 分类变成可横滑、吸顶的胶囊条；<640px 顶栏工具区自动换行、只让分类条吸顶。
  卡片网格 `repeat(auto-fill, minmax(min(100%, 340px), 1fr))`，从 320px 手机到 4K 都不会横向溢出。
- **风格页**：每张风格卡是一个容器（container query），够宽时浅色/深色左右并排，窄时上下排列。
- **组件本身按「容器宽度」而不是视口宽度自适应**（放进侧栏、卡片里同样生效）：
  - `ui-navbar` 容器 <520px 折叠为 ☰ 菜单
  - `ui-table` 容器 <420px 变成卡片列表，每格前显示列名
  - `ui-steps` 容器 <340px 改为纵向
  - `ui-descriptions` 自动增减列数；`ui-tabs` 超出时横向滑动；`ui-pagination` 自动换行
  - 图表全部按容器宽度伸缩：`ui-sparkline` 拉伸 SVG、`ui-bar-chart` 柱宽自适应（容器 <300px 隐藏柱顶数值）、
    `ui-donut` 图例在窄时换到下方、`ui-heatmap` 宽时拉伸填满 / 窄时横向滚动
  - `ui-option-cards`、价格卡外层网格：三列 → 两列 → 一列自动切换；`ui-command` 在 <520px 时铺满屏幕

## 全局快捷键

- `Ctrl / ⌘ + K`：打开命令面板（`<ui-command hotkey="k">`，设为空字符串可关闭）
- `/`：聚焦搜索框（`<ui-search shortcut="/">`，在其它输入框里打字时不会触发）

> 组件类会在 `register()` 时自动登记到 `classRegistry`，画廊「代码」面板的「可用属性」据此生成；
> 新组件只要调用 `register()` 并在 `components/index.js` 里 import 一次即可，不必再手写类表。

## 新增一个组件（3 步）

1. 在对应的 `src/components/*.js` 里写类并调用 `register`：

```js
export class UIToast extends UIElement {
  static props = { text: { default: '' }, type: { default: 'info' } };
  template(p) {
    return '<div class="ui-toast ui-toast--' + p.type + '">' + p.text + '</div>';
  }
}
register('ui-toast', UIToast, '.ui-toast{background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius)}');
```

2. 在 `src/components/index.js` 里加进 `componentClasses`。
3. 在 `src/data/catalog.js` 里加一条 `{ id, tag, name, cat, brief, demo, ai, design }`。

画廊会自动出现新卡片，代码面板会自动带上属性和 CSS。

## 新增一套 UI 风格

只改 `tokens.css`，加两条规则（浅色 + 深色），组件代码一行不动：

```css
[data-style="paper"]      { --ui-radius: 2px; --ui-shadow: none; --ui-line: #d8d2c4; --ui-font: Georgia, serif; }
[data-style="paper"][data-theme="dark"] { --ui-bg: #14130f; --ui-panel: #1c1a15; }
```

再往 `src/data/styles.js` 里加一条描述，风格页就会自动把它和前 4 套并排展示。

## 提示词的写法（给 Agent 用）

`catalog.ai` 固定五段式，便于 Agent 解析：

```
【组件】按钮 <ui-button>
【用途】…
【属性】variant: default | primary | …；disabled 布尔
【视觉】所有值取自 token，不写死
【交互】hover / active / focus-visible 的行为
【约束】禁止事项（1) 2) 3) …)
```

`catalog.design` 是给人看的：`purpose`（为什么存在）、`when`（什么时候用）、`avoid`（什么时候别用）。

## 无障碍与键盘（打磨阶段新增）

每个交互组件都按 WAI-ARIA 的对应模式实现了键盘操作，不依赖鼠标：

| 组件 | 角色 | 键盘 |
|---|---|---|
| `ui-dropdown` | `button[aria-haspopup=menu]` + `ul[role=menu]` / `li[role=none]` + `button[role=menuitem]` | 触发器 `↓` 直接进第一项；`↑↓` 循环、`Home/End`、`Enter` 选择、`Esc` 关闭并归还焦点、`Tab` 关闭 |
| `ui-datepicker` | `button[aria-haspopup=dialog]` + `div[role=dialog]` + `div[role=grid]` / `[role=row]` + `[role=columnheader]` + `button[role=gridcell][aria-selected]` | `←→` 天、`↑↓` 周、`Home/End` 本周首末、`PageUp/PageDown` 换月、`Enter/Space` 选择、`Esc` 关闭 |
| `ui-tree` | `div[role=tree]` + `[role=treeitem][aria-level][aria-expanded][aria-selected]` + `[role=group]` | `↑↓` 上下、`→` 展开/进子、`←` 折叠/回父、`Home/End`、`Enter/Space` 选中 |
| `ui-tabs` | `div[role=tablist]` + `button[role=tab][aria-selected]` | `←→` 切换并跟随焦点、`Home/End`、`Enter/Space` |
| 表单类 | 原生 `input/select` + `label` 包裹；`ui-switch` 用 `role=switch`；`hint` 通过 `aria-describedby` 关联 | 浏览器原生 |
| 反馈类 | `ui-progress` 用 `role=progressbar` + `aria-valuenow/min/max`；`ui-spinner` 用 `role=status`；`ui-alert` 的 danger/warn 用 `role=alert`、其余 `role=status`；Toast 用 `role=status` + `aria-live=polite` | — |
| `ui-tooltip` | 面板 `role=tooltip`，宿主 `aria-describedby` 指向它 | `focusin/focusout` 同样触发 |

两个容易踩的点：

1. **roving tabindex**：网格/树只保留一个 `tabindex="0"`，其余为 `-1`，Tab 键只落一次，方向键在内部移动。
2. **重渲染后重新聚焦**：`setAttribute` 会触发模板重绘，原来的 DOM 节点已被替换，
   直接 `btn.focus()` 会丢焦点。必须**重绘后再查询新节点**再 focus（日期选择与标签页都踩过）。

## 测试

零依赖回归测试页：`/test.html`（73 条用例：属性渲染、键盘与焦点、浮层开关、数据兜底、无障碍、15 套风格对比度、减少动效与动画循环清理）。
`npm run check` 对 `src` 下所有 JS 做语法检查（Windows / macOS / Linux 通用）。

```bash
python3 -m http.server 5173
# 打开 http://127.0.0.1:5173/test.html
```

- `src/test/harness.js` —— `describe / it / expect` + 独立沙箱（每条用例一个 host，结束整体移除，顺便触发组件的 detached 清理）
- `src/test/cases.js` —— 25 条用例：属性解析、键盘流程、ARIA 角色、浮层开关、数据渲染与兜底、主题隔离
- 页面实时显示 `通过 / 失败 / 耗时`，并把 `{ pass, fail, total, ms }` 挂到 `window.__testResult`，便于外部自动化抓取

当前 **25 / 25 通过，约 900ms**。

> 测试真实抓到两个 bug：
> 1. **`ui-popover` 点外部不关闭** —— `Layer` 原来用 60ms 时间窗挡「打开它的那次点击」，改成**比较事件引用**后精确解决（不再有副作用）。
> 2. **`.ui-modal-mask` 的 `display:grid` 覆盖了 UA 的 `[hidden]{display:none}`** —— 关闭状态下遮罩仍存在并拦截点击。补 `.ui-modal-mask[hidden]{display:none}`，并加专门用例防回归。

## 当前状态

已验证（Playwright 实测，34 个组件 / 6 个分类）：

- 基础 27 个组件渲染、文案、默认态正确
- 下拉菜单：面板 `top:592 / side:top`（下方空间不足自动翻上）、选中后关闭、`-` 分隔线与 `!` 危险项解析正确
- 日期选择：月历 31 格、`‹` 切到 2026 年 9 月、点 15 号后 `value` 变为 `2026-09-15` 并关闭
- 树形：8 节点 2 分支、默认展开 src、点箭头折叠、选中高亮唯一
- 文字提示：`text` 正确、`pointer-events:none`
- Toast：深色反色底、单条/堆叠/1.8s 自动消失
- **数据表格**：3 列 3 行，首行 `订单 A / 已完成 / 128`，`caption` 渲染为表格标题
- **折叠面板**：3 项，点第 2 项后状态为 `false,true,false` —— 单开模式自动收起第 1 项
- **分段控制器**：点「月」后 `value="月"`、`aria-checked` 与焦点同步
- **评分**：点第 5 颗星 → `value="5"`、5 个实心星、右侧文本 `5/5`
- **对话框**：`open=true`、焦点落在面板内、`role=dialog`/`aria-modal`、`body.overflow=hidden`、Tab 被锁在面板内；关闭后 `overflow` 复原且焦点回到触发按钮
- **抽屉**：右侧滑入、焦点在面板内、Tab 锁定；关闭后焦点归还
- **气泡卡片**：点击打开且内含按钮可交互，点外部自动关闭
- 页面无 console 报错；4 套风格同页并存互不污染

键盘与 ARIA（Playwright 实测，全部用合成 KeyboardEvent 驱动，非鼠标）：

- 下拉菜单：`↓` 打开→焦点落在「编辑」→`↓`「复制链接」→`End`「删除」→`Esc` 关闭、`aria-expanded` 回到 false、焦点回到触发器
- 日期选择：打开后焦点在 `2026-10-31` 且 roving tabindex 只有一个；`→` 跨月到 `11-01`（标题同步）；`PageDown`→12 月；`↓`→`12-08`；`Enter` 写回 `value` 并关闭；焦点回到触发器；`←` 每次精确退 1 天
- 树形：`src`→`↓` `components`→`→` 展开（`aria-expanded=true`）→`←` 折叠→`Enter` 选中→`End` 跳末项
- 标签页：`→` 从「概览」切到「配置」，`aria-selected` 与焦点同步
- 角色齐全：`role=switch`、`role=progressbar`(valuenow 62/100)、`role=status`、alert 的 `[status, alert]`、`input[aria-describedby]`、`role=tree`、`role=tooltip`
- 页面无 console 报错

尚未做：

- 多选树（父子联动）、日期区间选择、级联选择
- 虚拟滚动（树 / 表格大数据量）
- 视觉回归（截图对比）与 CI 接入
- `prefers-reduced-motion` 的全局降级
