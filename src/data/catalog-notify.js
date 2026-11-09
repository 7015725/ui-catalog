/* =========================================================
   通知与弹出（第二批，6 个）
   反馈：堆叠通知、灵动岛通知
   浮层：通知中心、动作面板、输入确认、新手引导
   ========================================================= */
const R = '【减少动效】系统开启「减少动态效果」或 <html data-motion="reduce"> 时，';
const j = (v) => JSON.stringify(v).replace(/'/g, '&#39;');
const E = (id, tag, name, cat, brief, demo, ai, design, wide) => ({ id: id, tag: tag, name: name, cat: cat, brief: brief, demo: demo, ai: ai, design: design, wide: !!wide });
const out = (id, txt) => '<div id="' + id + '" style="font-size:12.5px;color:var(--ui-sub);min-height:1.4em">' + (txt || '') + '</div>';
const btn = (txt, js, v) => '<button type="button" class="ui-btn ui-btn--sm ui-btn--' + (v || 'default') + '" onclick="' + js + '">' + txt + '</button>';
const row = (inner) => '<div style="display:flex;flex-wrap:wrap;gap:8px">' + inner + '</div>';

const T = "document.getElementById('tst-demo')";
const INBOX = [
  { icon: '💬', title: '林晓 回复了你的评论', desc: '「这个交互很顺，周五前能上线吗？」', time: '2 分钟前', tone: 'brand' },
  { icon: '✅', title: '构建 #482 已通过', desc: 'main 分支 · 用时 3 分 12 秒', time: '18 分钟前', tone: 'ok' },
  { icon: '⚠️', title: '存储空间剩余 8%', desc: '超过 95% 后将暂停上传', time: '1 小时前', tone: 'warn' },
  { icon: '📅', title: '明天 10:00 设计评审', desc: '会议室 B · 共 6 人', time: '昨天', tone: 'accent', read: true }
];
const SHEET = [{ label: '分享给好友', icon: '📤' }, { label: '保存到相册', icon: '⬇️' }, { label: '设为封面', icon: '🖼️', disabled: true, desc: '仅横图可用' }, { label: '删除照片', icon: '🗑️', danger: true }];
const TOUR = [
  { target: '#tour-demo-search', title: '全局搜索', body: '按 / 键随时呼出，支持搜索文件、成员和设置。' },
  { target: '#tour-demo-new', title: '新建项目', body: '从模板开始，30 秒就能建好第一个项目。' },
  { target: '#tour-demo-me', title: '个人中心', body: '在这里切换团队、修改通知偏好。', placement: 'top' }
];

export const notifyCatalog = [
  /* ===================== 反馈 ===================== */
  E('toaster', 'ui-toaster', '堆叠通知', '反馈', '多条通知叠成一摞，悬停展开；支持撤销、异步结果与滑动关闭',
    '<ui-toaster id="tst-demo" ondismiss="document.getElementById(\'tst-out\').textContent=\'dismiss 事件：\'+event.detail.reason" onaction="document.getElementById(\'tst-out\').textContent=\'action 事件：\'+event.detail.label"></ui-toaster>' +
    '<div style="display:flex;flex-direction:column;gap:10px;width:100%">' +
    row(btn('成功', T + ".push({type:'success',title:'已保存',desc:'草稿已同步到云端'})") +
      btn('带撤销', T + ".push({title:'已移入回收站',desc:'「Q4 复盘.pptx」',action:'撤销'})") +
      btn('异步结果', T + ".promise(new Promise(function(r,j){setTimeout(Math.random()>.3?r:j,1600)}),{loading:'正在上传…',success:'上传完成',error:{title:'上传失败',desc:'网络中断，请重试'}})") +
      btn('错误', T + ".push({type:'error',title:'支付失败',desc:'银行卡余额不足'})", 'danger')) +
    out('tst-out', '连续点几次看叠放；悬停右下角展开；左右拖动可划走；Alt+T 聚焦通知') + '</div>',
    '【组件】堆叠通知 <ui-toaster>\n' +
    '【用途】同时可能出现多条操作反馈时，用一摞卡片代替一列长条，不遮挡页面；带「撤销」和异步结果\n' +
    '【属性】position: bottom-right（默认）| bottom-left | bottom-center | top-right | top-center；max 收起时可见层数，默认 3；duration 默认停留 ms，默认 4000；label 区域名称，默认「通知」；hotkey 聚焦快捷键，默认 alt+t（空字符串关闭）\n' +
    '【方法】push({ type: info | success | warn | error | loading, title, desc?, action?: "文字" 或 { label, onClick }, duration?, id? }) 返回 id，同 id 再次 push 即更新；update(id, opts)；promise(promise 或函数, { loading, success, error })，success / error 可以是字符串、对象或 (结果) => 文案；dismiss(id)；dismissAll()；只读 count\n' +
    '【视觉】组件把通知区挂到 body（position:fixed，z-index 440，宽 min(356px, 100vw − 32px)）；每条卡片 --ui-panel 底、--ui-line 边框、--ui-radius-lg、--ui-shadow；左侧 22px 圆形图标，类型色作 1.5px 内描边、16% 混入底色；操作按钮用 --ui-text 底 --ui-bg 字；收起时最新一条在最前，后面的每层上移 12px、缩小 5%、只露出边沿；展开后按真实高度依次排开，间距 10px\n' +
    '【交互】新通知从下方滑入；指针移入或焦点进入通知区 → 展开并暂停所有倒计时，离开后按剩余时间继续；点 × / 操作按钮 / Esc（焦点在该条时）关闭；横向拖动超过 70px 松手划走，否则弹回；loading 不自动消失，promise 结束后原地变成成功或失败；超过 8 条时最早的一条直接移除；error 用 role=alert，其余 role=status；Alt+T 把焦点移到第一条的按钮；派发 dismiss（detail: id, reason: timeout | close | action | swipe | api | overflow）与 action（detail: id, label）\n' +
    R + '取消滑入、叠放与展开过渡，直接到终态；拖动仍然跟手\n' +
    '【约束】1) 标题 ≤ 16 字，描述 ≤ 30 字；2) 需要用户处理的错误不要只用通知，配合 Alert 或对话框；3) 撤销操作的停留时间不少于 5 秒；4) 一个页面只放一个 <ui-toaster>',
    { purpose: '多条反馈同时出现时保持页面整洁，并给「刚做的事」一个撤销入口。', when: ['批量操作、上传下载等会连续产生反馈的场景', '删除、归档后提供撤销', '异步任务：先显示进行中，结束后原地变成结果'], avoid: ['必须读完才能继续的信息（用对话框）', '长期有效的状态提示（用 Alert）'], tips: ['和 uiToast 的区别：uiToast 一句话轻提示，堆叠通知用于带操作、会连续出现的反馈'] }),

  E('island', 'ui-island', '灵动岛通知', '反馈', '顶部小胶囊伸展成通知卡片，几秒后缩回',
    '<div style="display:flex;flex-direction:column;gap:12px;width:100%">' +
    '<div style="padding:10px 0 18px;border-radius:var(--ui-radius-lg);background:var(--ui-panel-2)">' +
    '<ui-island id="isl-demo" idle="录音中 00:12" onaction="document.getElementById(\'isl-out\').textContent=\'action 事件：\'+event.detail.label"></ui-island></div>' +
    row(btn('来电', "document.getElementById('isl-demo').notify({icon:'📞',title:'妈妈',desc:'来电 · 手机',action:'接听',tone:'success'})") +
      btn('外卖', "document.getElementById('isl-demo').notify({icon:'🛵',title:'骑手已取餐',desc:'预计 12 分钟送达',tone:'warn'})") +
      btn('连发两条', "var i=document.getElementById('isl-demo');i.notify({icon:'🎧',title:'耳机已连接',desc:'电量 82%',duration:2000});i.notify({icon:'🔋',title:'电量低',desc:'剩余 15%',tone:'danger'})")) +
    out('isl-out', '悬停卡片会暂停计时；点卡片或按 Esc 立即缩回') + '</div>',
    '【组件】灵动岛通知 <ui-island>\n' +
    '【用途】把系统级、短暂的状态变化（来电、计时、连接）收进页面顶部一个固定的小胶囊，需要时伸展成卡片\n' +
    '【属性】idle 空闲时胶囊里的文字（可空，空时只是一颗小胶囊）；duration 默认停留 ms，默认 4000；label 区域名称，默认「系统通知」\n' +
    '【方法】notify({ icon?, title, desc?, action?, tone?: brand | success | warn | danger | accent, duration? })，正在显示时排队；hide() 立即缩回；只读 isOpen\n' +
    '【视觉】胶囊居中，底色为 --ui-text 与纯黑 6 : 94 混合（任何风格都是近黑），文字为 --ui-bg 与纯白 8 : 92 混合；空闲 34px 高、宽度随 idle 文字；空闲文字前有 --ui-ok 小圆点；展开后宽度 = min(380px, 容器宽)、高度 = 卡片内容高、圆角 28px；卡片左侧 38px 圆角方块图标，底色为 tone 与纯黑 45 : 55 混合；操作按钮为浅色胶囊\n' +
    '【交互】notify → 胶囊宽高用弹性曲线（--ui-spring）伸展，空闲内容淡出，卡片内容延迟 0.18s 淡入；同时把「标题，描述」写入 role=status 播报；停留 duration 后缩回；指针悬停或焦点在卡片内时暂停计时；点卡片任意位置 / Esc 立即缩回；点操作按钮派发 action（detail: title, label）后缩回；队列里的下一条在缩回 0.42s 后出现；派发 show / hide\n' +
    R + '尺寸直接切换，队列无间隔\n' +
    '【约束】1) 只放一行标题 + 一行描述 + 至多一个操作；2) 不用于需要确认的危险操作；3) 一个页面只放一个，放在页面或手机框顶部',
    { purpose: '用一个固定位置承载短暂的系统状态，伸缩动作本身就提示「有新情况」。', when: ['移动端 / 类 App 页面的来电、计时、下载、连接状态', '后台任务的阶段性提醒'], avoid: ['桌面后台的业务通知（用堆叠通知或通知中心）', '需要用户长时间阅读的内容'] }),

  /* ===================== 浮层 ===================== */
  E('inbox', 'ui-inbox', '通知中心', '浮层', '铃铛 + 未读角标，点开是可筛选、可全部已读的通知列表',
    '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">' +
    '<ui-inbox id="ib-demo" items=\'' + j(INBOX) + '\' onopen="document.getElementById(\'ib-out\').textContent=\'open 事件：\'+event.detail.item.title"></ui-inbox>' +
    btn('模拟新消息', "document.getElementById('ib-demo').add({icon:'🎉',title:'你的作品被推荐到首页',desc:'获得 128 次浏览',time:'刚刚',tone:'accent'})") +
    '</div>' + out('ib-out', '点铃铛打开；↑↓ 在通知间移动'),
    '【组件】通知中心 <ui-inbox>\n' +
    '【用途】集中收纳不需要立即处理、但需要「之后能找到」的消息，用未读数提醒\n' +
    '【属性】items JSON [{ icon?, title, desc?, time?, tone?: brand | success | warn | danger | accent, read? }]；label 名称，默认「通知」；placement 面板位置，默认 bottom-end\n' +
    '【方法】add(item) 在最前面插入一条未读并让铃铛摇一下；markAllRead()；只读 unread\n' +
    '【视觉】40px 圆形铃铛按钮，--ui-panel 底、--ui-line 边框；未读角标 --ui-danger 底 --ui-on-color 字、2px --ui-panel 外圈，超过 99 显示 99+，为 0 时隐藏；面板挂到 body（浮层定位引擎，下方空间不足自动翻到上方），宽 min(360px, 100vw − 16px)：标题行 +「全部已读」文字按钮 → 「全部 N / 未读 N」两个筛选胶囊（选中为 --ui-text 底 --ui-bg 字）→ 列表；每条：34px 圆形图标（tone 18% 混入 --ui-panel）、标题、描述与时间（--ui-sub）；未读标题加粗，右上角 8px --ui-brand 圆点\n' +
    '【交互】铃铛 aria-haspopup="dialog"、aria-expanded，可访问名称「通知，3 条未读」随数量更新；点击打开，焦点进入第一条；↑↓ / Home / End 在条目间移动；点条目 → 标为已读，派发 open（detail: index, item），关闭面板并把焦点还给铃铛；点「全部已读」→ 全部清零并派发 read，按钮变为不可用；切换筛选只重画列表，焦点留在筛选按钮上；Esc 或点外部关闭并归还焦点；未读条目在读屏里带「未读：」前缀\n' +
    R + '铃铛不摇\n' +
    '【约束】1) 通知中心不能替代需要立即处理的提醒；2) 列表超过 50 条时分页或「查看全部」跳转；3) 未读数必须和列表实际未读一致',
    { purpose: '给「之后再看」的消息一个固定入口，用角标数字控制提醒强度。', when: ['后台、协作工具的评论、审批、系统消息', '消息需要按已读 / 未读筛选的场景'], avoid: ['只有一两条一次性提示（用堆叠通知）', '需要用户马上处理的错误'] }),

  E('action-sheet', 'ui-action-sheet', '动作面板', '浮层', '从底部弹出的操作列表，可下拉关闭',
    '<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">' +
    '<ui-action-sheet title="这张照片" desc="选择要进行的操作" items=\'' + j(SHEET) + '\' onselect="document.getElementById(\'as-out\').textContent=\'select 事件：\'+event.detail.label" oncancel="document.getElementById(\'as-out\').textContent=\'cancel 事件：\'+event.detail.reason">' +
    '<button type="button" class="ui-btn ui-btn--md ui-btn--default">⋯ 更多操作</button></ui-action-sheet>' +
    out('as-out', '按住面板顶部向下拖可以关闭') + '</div>',
    '【组件】动作面板 <ui-action-sheet>\n' +
    '【用途】在移动端给当前对象提供一组操作，拇指够得到，危险项和取消项位置固定\n' +
    '【属性】默认插槽放触发按钮（插槽里第一个按钮点击即打开，并自动加 aria-haspopup="dialog"）；title 标题；desc 说明；items JSON [{ label, icon?, desc?, danger?, disabled? }]，或逗号分隔（前缀 ! 表示危险项）；cancel 取消按钮文字，默认「取消」；open 初始打开\n' +
    '【方法】show()；close()；只读 isOpen\n' +
    '【视觉】遮罩挂到 body，纯黑 45% 渐入；面板贴底居中，宽 min(480px, 100%)，分两块：上块（标题区 + 操作列表）与下块（取消），都是 --ui-panel 底、圆角 --ui-radius-lg + 4px；标题区顶部 38×5 的 --ui-line 拖动条；每个操作 52px 高、居中、之间 1px --ui-line 分隔；危险项 --ui-danger 字加粗；禁用项 --ui-sub 字，可带一行小字说明原因；取消按钮加粗\n' +
    '【交互】打开：面板从屏幕下方滑入（0.36s --ui-ease），焦点落在第一个可用操作，Tab 锁在面板内，页面禁止滚动；点操作 → 关闭并派发 select（detail: index, label）；点取消 / 遮罩 / Esc → 关闭并派发 cancel（detail.reason: cancel | mask | esc | swipe）；按住标题区向下拖，面板跟手下移、遮罩同步变淡，超过面板高度 30% 松手即关闭，否则弹回；关闭后焦点回到触发按钮\n' +
    R + '直接出现 / 消失；拖动仍然跟手\n' +
    '【约束】1) 操作 2–6 项；2) 危险项放最后、标红，不可逆操作点完后还要二次确认；3) 桌面端优先用下拉菜单',
    { purpose: '把操作放在拇指最容易够到的地方，并用固定的「取消」降低误触成本。', when: ['移动端列表项、图片、消息的更多操作', '分享、保存、举报等一组平级操作'], avoid: ['桌面端（用下拉菜单或右键菜单）', '需要填写内容的表单（用抽屉或对话框）'] }),

  E('type-confirm', 'ui-type-confirm', '输入确认', '浮层', '危险操作前要求输入指定文字，匹配后才能确认',
    '<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">' +
    '<ui-type-confirm title="删除项目 ui-catalog？" keyword="ui-catalog" desc="此操作不可撤销，以下内容会被永久删除：" items="全部组件与风格源码,全部提交历史与分支,3 位协作者的访问权限" ' +
    'onconfirm="document.getElementById(\'tc-out\').textContent=\'confirm 事件：已删除\'" oncancel="document.getElementById(\'tc-out\').textContent=\'cancel 事件：\'+event.detail.reason">' +
    '<button type="button" class="ui-btn ui-btn--md ui-btn--danger">删除项目</button></ui-type-confirm>' +
    out('tc-out', '输入框里打出 ui-catalog 后「永久删除」才可用') + '</div>',
    '【组件】输入确认 <ui-type-confirm>\n' +
    '【用途】给不可逆的大操作（删项目、清空数据、转让所有权）加一道「必须看清楚」的门槛\n' +
    '【属性】默认插槽放触发按钮；title 标题；desc 说明；items 逗号分隔的「会被影响的内容」；keyword 必须输入的文字，默认 DELETE，区分大小写；confirm 确认按钮文字，默认「永久删除」；cancel 默认「取消」；open 初始打开\n' +
    '【方法】show()；close()；只读 isOpen\n' +
    '【视觉】遮罩挂到 body，纯黑 50%；对话框宽 min(440px, 100%)，顶边 3px --ui-danger；左上 36px --ui-danger-soft 圆形「!」；影响清单放在 --ui-panel-2 圆角块里；提示「请输入 keyword 以确认」，keyword 用等宽字体、--ui-panel-2 底，可整段选中；输入框等宽字体，匹配后边框变 --ui-danger；底部「取消」默认按钮 +「永久删除」danger 按钮（未匹配时 50% 透明并禁用）\n' +
    '【交互】role="alertdialog"，aria-labelledby 指向标题、aria-describedby 指向说明与清单；打开时焦点进入输入框，Tab 锁在对话框内；输入与 keyword 完全一致（去掉首尾空格）→ 确认按钮可用，并播报「已匹配，可以确认」；在输入框按 Enter：匹配则确认，不匹配则输入框左右抖动并播报「输入不匹配」；确认 → 关闭并派发 confirm（detail.keyword）；取消 / 遮罩 / Esc → 关闭并派发 cancel（detail.reason）；关闭后焦点回到触发按钮\n' +
    R + '不抖动，直接出现 / 消失\n' +
    '【约束】1) 只用于真正不可逆的操作，普通删除用 Popconfirm；2) keyword 用对象自己的名字，而不是通用的「确认」；3) 不得预先填好输入框；4) 不得禁止粘贴',
    { purpose: '用「亲手输入对象名称」逼用户停下来确认自己在删什么。', when: ['删除项目、仓库、团队等不可恢复的对象', '清空数据、转让所有权、关闭账户'], avoid: ['可撤销或影响很小的删除（用气泡确认或撤销通知）', '高频操作'] }),

  E('tour', 'ui-tour', '新手引导', '浮层', '逐步高亮页面元素并配说明气泡',
    '<div style="display:flex;flex-direction:column;gap:12px;width:100%">' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--ui-radius-lg);background:var(--ui-panel-2);flex-wrap:wrap">' +
    '<b style="font-size:14px">📦 Workbench</b>' +
    '<span id="tour-demo-search" style="flex:1;min-width:120px;padding:6px 10px;border-radius:var(--ui-radius);background:var(--ui-panel);border:var(--ui-border-w) solid var(--ui-line);font-size:12.5px;color:var(--ui-sub)">🔍 搜索 /</span>' +
    '<span id="tour-demo-new" style="padding:6px 12px;border-radius:var(--ui-radius);background:var(--ui-brand);color:var(--ui-brand-ink);font-size:12.5px;font-weight:600">＋ 新建</span>' +
    '<span id="tour-demo-me" style="display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--ui-brand-soft);color:var(--ui-text);font-size:12.5px;font-weight:700">林</span></div>' +
    '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><ui-tour steps=\'' + j(TOUR) + '\' onend="document.getElementById(\'tour-out\').textContent=\'end 事件：\'+(event.detail.completed?\'已完成\':\'第 \'+(event.detail.index+1)+\' 步跳过\')">' +
    '<button type="button" class="ui-btn ui-btn--md ui-btn--primary">开始引导</button></ui-tour>' + out('tour-out', '← → 切换步骤，Esc 结束') + '</div></div>',
    '【组件】新手引导 <ui-tour>\n' +
    '【用途】第一次使用或新功能上线时，按顺序指出页面上的关键入口\n' +
    '【属性】默认插槽放触发按钮（点击从第 1 步开始）；steps JSON [{ target: CSS 选择器, title, body?, placement?: bottom | top }]；label 名称，默认「新手引导」\n' +
    '【方法】start(i = 0)；next()；prev()；end()；只读 active（当前步，未开始为 -1）\n' +
    '【视觉】引导层挂到 body：高亮框比目标四周各大 6px，圆角 --ui-radius，用 0 0 0 9999px 纯黑 55% 外阴影压暗其余区域，内侧 2px --ui-brand 描边；高亮框在步骤之间平滑移动；说明气泡宽 min(300px, 100vw − 24px)，--ui-panel 底、--ui-shadow：「2 / 3」→ 标题 → 正文 → 进度点（当前为 16px 长条 --ui-brand）→「跳过」文字按钮 +「上一步」+「下一步 / 完成」主按钮；默认放在目标下方，空间不够或 placement=top 时放上方，水平居中并夹在视口内\n' +
    '【交互】开始 → 记住当前焦点，目标滚动到视口中间，焦点移到气泡（role=dialog，Tab 锁在气泡内）；→ / 下一步、← / 上一步；最后一步按钮为「完成」；Esc / 跳过 → 结束；每步播报「第 2 步，共 3 步：标题」并派发 step（detail: index, title）；页面滚动或窗口缩放时重新定位；目标不存在时不高亮，气泡居中；结束后移除引导层、恢复焦点并派发 end（detail: completed, index）；引导期间页面其余部分不可点击\n' +
    R + '高亮框和气泡直接跳到新位置，滚动不做平滑\n' +
    '【约束】1) 3–5 步；2) 每步正文 ≤ 40 字；3) 必须随时可跳过；4) 同一用户只自动展示一次，之后从帮助菜单手动打开',
    { purpose: '在真实界面上指路，比单独的说明文档更容易记住入口在哪。', when: ['首次登录、改版后的新功能介绍', '复杂工作台的关键入口说明'], avoid: ['每次打开都强制播放', '用来解释本应自解释的普通控件'] }, true)
];
