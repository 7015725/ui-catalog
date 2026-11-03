/* =========================================================
   界面模板 · Web 页面（4 个）
   预览放在浏览器框里，可切换 桌面 / 平板 / 手机 宽度；
   模板内部用 @container tpl (...) 做自适应，所以放进任何容器都能正确响应
   ========================================================= */
import { ph, json } from './templates-shared.js';

/* ---------------- 1. 后台仪表盘 ---------------- */
const KPI = {
  今日: [['1,248', '+12.4%', 'up'], ['¥ 86,320', '+8.1%', 'up'], ['326', '-3.1%', 'down'], ['3.42%', '+0.4%', 'up']],
  本周: [['8,930', '+6.2%', 'up'], ['¥ 612,400', '+11.5%', 'up'], ['2,184', '+1.8%', 'up'], ['3.18%', '-0.2%', 'down']],
  本月: [['36,412', '+18.9%', 'up'], ['¥ 2.46M', '+21.3%', 'up'], ['9,720', '+4.6%', 'up'], ['3.27%', '+0.1%', 'up']]
};
const admin = {
  id: 'admin', name: '后台仪表盘', cat: 'Web 页面', frame: 'browser', url: 'app.example.com/dashboard',
  brief: '可折叠侧边栏 + 顶栏 + 指标卡 + 趋势图 + 占比图 + 订单表 + 动态时间线',
  uses: ['ui-menu', 'ui-breadcrumb', 'ui-search', 'ui-avatar', 'ui-segmented', 'ui-stat', 'ui-line-chart', 'ui-donut', 'ui-table', 'ui-timeline', 'ui-tag'],
  html: `<div class="t-screen t-admin">
<aside class="t-admin__side" aria-label="后台侧边栏" data-side>
<div class="t-admin__brand"><span aria-hidden="true">◆</span><b>Acme 后台</b></div>
<ui-menu active="1" open="" items='${json([{ group: '工作台' }, { icon: '📊', label: '概览' }, { icon: '🧾', label: '订单', badge: '12' }, { icon: '👥', label: '客户' }, { icon: '📦', label: '商品', children: [{ label: '商品列表' }, { label: '库存' }] }, { group: '系统' }, { icon: '⚙️', label: '设置' }])}'></ui-menu>
<div class="t-admin__up"><b>升级到专业版</b><span>解锁自动化报表</span></div>
</aside>
<div class="t-admin__scrim" data-close hidden></div>
<div class="t-admin__main">
<div class="t-admin__top">
<button class="t-icobtn" data-toggle aria-expanded="true" aria-label="收起侧边栏">☰</button>
<ui-breadcrumb items="首页,数据,概览"></ui-breadcrumb>
<span class="t-flex1"></span>
<ui-search placeholder="搜索订单、客户"></ui-search>
<button class="t-icobtn" aria-label="通知，有新消息">🔔<span class="t-dot" aria-hidden="true"></span></button>
<ui-avatar name="林" size="sm"></ui-avatar>
</div>
<div class="t-scr" tabindex="0" role="region" aria-label="仪表盘内容">
<div class="t-admin__head"><div><h3>数据概览</h3><span class="t-sub">更新于 2 分钟前</span></div><ui-segmented items="今日,本周,本月" value="今日"></ui-segmented></div>
<div class="t-admin__kpis" aria-live="polite">${['访问量', '销售额', '新增用户', '转化率'].map((l, i) => '<div class="t-panel"><ui-stat label="' + l + '" value="' + KPI['今日'][i][0] + '" delta="' + KPI['今日'][i][1] + '" trend="' + KPI['今日'][i][2] + '"></ui-stat></div>').join('')}</div>
<div class="t-admin__row">
<div class="t-panel t-admin__box t-admin__wide"><ui-line-chart title="近 7 天访问趋势" unit="次" area labels="周一,周二,周三,周四,周五,周六,周日" series='${json([{ name: '访问', data: [820, 932, 901, 1134, 1290, 1530, 1248] }, { name: '下单', data: [120, 160, 140, 210, 260, 320, 290] }])}'></ui-line-chart></div>
<div class="t-panel t-admin__box"><ui-donut label="订单状态" data='${json([{ label: '已完成', value: 1280 }, { label: '配送中', value: 420 }, { label: '待支付', value: 210 }, { label: '已取消', value: 90 }])}'></ui-donut></div>
</div>
<div class="t-admin__row">
<div class="t-panel t-admin__box t-admin__wide"><ui-table zebra caption="最近订单" columns='${json([{ key: 'no', title: '订单号' }, { key: 'who', title: '客户' }, { key: 'amt', title: '金额' }, { key: 'st', title: '状态' }])}' rows='${json([{ no: 'A-20831', who: '林小北', amt: '¥ 1,280', st: '已完成' }, { no: 'A-20830', who: '周一一', amt: '¥ 356', st: '配送中' }, { no: 'A-20829', who: '王小美', amt: '¥ 2,048', st: '待支付' }, { no: 'A-20828', who: '阿杰', amt: '¥ 99', st: '已取消' }])}'></ui-table></div>
<div class="t-panel t-admin__box"><h4>团队动态</h4><ui-timeline items='${json([{ title: '林小北 发布了 v2.4', time: '10:02', status: 'success' }, { title: '库存预警：耳机 Pro', time: '09:40', status: 'warn', desc: '剩余 12 件' }, { title: '周一一 处理了 18 张工单', time: '昨天' }])}'></ui-timeline></div>
</div>
</div>
</div>
</div>`,
  css: `
.t-admin{flex-direction:row;display:grid;grid-template-columns:auto minmax(0,1fr);overflow:hidden}
.t-admin__side{width:220px;display:flex;flex-direction:column;gap:10px;padding:14px 10px;background:var(--ui-panel);
  border-right:var(--ui-border-w) solid var(--ui-line);transition:width var(--ui-motion),transform .25s var(--ui-ease);overflow:hidden;z-index:5}
.t-admin__brand{display:flex;align-items:center;gap:8px;padding:4px 8px 8px;font-size:15px;white-space:nowrap}
.t-admin__brand span{color:var(--ui-brand);font-size:18px}
.t-admin__side ui-menu{display:block;flex:1}
.t-admin__up{display:flex;flex-direction:column;gap:2px;padding:12px;border-radius:var(--ui-radius);background:var(--ui-brand-soft);font-size:12px;white-space:nowrap}
.t-admin.collapsed .t-admin__side{width:64px}
.t-admin.collapsed .t-admin__brand b,.t-admin.collapsed .ui-menu__l,.t-admin.collapsed .ui-menu__b,.t-admin.collapsed .ui-menu__car,
.t-admin.collapsed .ui-menu__grp,.t-admin.collapsed .t-admin__up{display:none}
.t-admin__main{display:flex;flex-direction:column;min-width:0;min-height:0}
.t-admin__top{display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:var(--ui-border-w) solid var(--ui-line);background:var(--ui-panel)}
.t-admin__top .t-icobtn{box-shadow:none;border:var(--ui-border-w) solid var(--ui-line)}
.t-admin__top ui-search{width:220px;display:block}
.t-admin .t-scr{padding:18px}
.t-admin__head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.t-admin__head h3{margin:0;font-size:18px}
.t-admin__kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:12px}
.t-admin__kpis .t-panel{padding:14px}
.t-admin__kpis ui-stat{display:block}
.t-admin__row{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:12px;margin-bottom:12px}
.t-admin__box{padding:14px;min-width:0}
.t-admin__box h4{margin:0 0 10px;font-size:13.5px}
.t-admin__box > *{display:block}
.t-admin__scrim{position:absolute;inset:0;background:rgba(0,0,0,.35);z-index:4}
@container tpl (max-width:1000px){
  .t-admin__kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
  .t-admin__row{grid-template-columns:minmax(0,1fr)}
  .t-admin__top ui-search{display:none}
}
@container tpl (max-width:760px){
  .t-admin{grid-template-columns:minmax(0,1fr)}
  .t-admin__side{position:absolute;top:0;bottom:0;left:0;transform:translateX(-105%);box-shadow:var(--ui-shadow)}
  .t-admin.open .t-admin__side{transform:none}
  .t-admin.collapsed .t-admin__side{width:220px}
  .t-admin.collapsed .t-admin__brand b,.t-admin.collapsed .ui-menu__l,.t-admin.collapsed .t-admin__up{display:revert}
  .t-admin__top{padding:10px 12px}
  .t-admin__top ui-breadcrumb{display:none}
  .t-admin .t-scr{padding:12px}
}
@container tpl (max-width:420px){ .t-admin__kpis{grid-template-columns:minmax(0,1fr)} }`,
  init(root) {
    const KPI = {
      今日: [['1,248', '+12.4%', 'up'], ['¥ 86,320', '+8.1%', 'up'], ['326', '-3.1%', 'down'], ['3.42%', '+0.4%', 'up']],
      本周: [['8,930', '+6.2%', 'up'], ['¥ 612,400', '+11.5%', 'up'], ['2,184', '+1.8%', 'up'], ['3.18%', '-0.2%', 'down']],
      本月: [['36,412', '+18.9%', 'up'], ['¥ 2.46M', '+21.3%', 'up'], ['9,720', '+4.6%', 'up'], ['3.27%', '+0.1%', 'up']]
    };
    const btn = root.querySelector('[data-toggle]');
    const scrim = root.querySelector('[data-close]');
    const narrow = function () { return root.clientWidth <= 760; };
    /* 宽屏：侧边栏在「展开 / 只剩图标」之间切换；窄屏：侧边栏变抽屉，带遮罩，点遮罩或选菜单后关闭 */
    function sync() {
      const open = narrow() ? root.classList.contains('open') : !root.classList.contains('collapsed');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? '收起侧边栏' : '展开侧边栏');
      scrim.hidden = !(narrow() && open);
    }
    btn.addEventListener('click', function () {
      root.classList.toggle(narrow() ? 'open' : 'collapsed');
      sync();
    });
    scrim.addEventListener('click', function () { root.classList.remove('open'); sync(); });
    root.querySelector('ui-menu').addEventListener('select', function (e) {
      root.querySelector('ui-breadcrumb').setAttribute('items', '首页,数据,' + e.detail.label.replace(/\d+$/, '').trim());
      if (narrow()) { root.classList.remove('open'); sync(); }
    });
    if (window.ResizeObserver) new ResizeObserver(sync).observe(root);
    /* 时间范围：刷新四张指标卡 */
    root.querySelector('ui-segmented').addEventListener('change', function (e) {
      root.querySelectorAll('ui-stat').forEach(function (s, i) {
        const k = KPI[e.detail.value][i];
        s.setAttribute('value', k[0]); s.setAttribute('delta', k[1]); s.setAttribute('trend', k[2]);
      });
    });
    sync();
  },
  ai: `【模板】后台管理仪表盘 · 响应式 Web（桌面优先，平板 / 手机可用）
【页面目标】登录后第一屏：看清核心指标的变化，快速跳到需要处理的订单或告警
【整体结构】左右两栏：
  左：侧边栏 220px（Logo + ui-menu 分组菜单，带角标和二级菜单 + 底部升级卡片）
  右：顶栏（☰ 折叠按钮 + ui-breadcrumb 面包屑 + 弹性空白 + ui-search + 通知铃铛 + 头像）
      内容区（独立滚动）：
      1) 标题「数据概览」+ 更新时间，右侧 ui-segmented（今日 / 本周 / 本月）
      2) 指标卡 4 列：ui-stat（数值 + 涨跌幅 + 趋势方向）
      3) 第二行 2:1：ui-line-chart 双线面积图（访问 / 下单）+ ui-donut 订单状态
      4) 第三行 2:1：ui-table 最近订单（斑马纹）+ ui-timeline 团队动态
【响应式】（按容器宽度，不按屏幕宽度）
  > 1000px：如上；≤ 1000px：指标卡 2 列、图表上下排、隐藏顶栏搜索
  ≤ 760px：侧边栏变左侧抽屉（translateX 滑入）+ 半透明遮罩，隐藏面包屑；≤ 420px：指标卡 1 列
【操作逻辑】
  1) 宽屏点 ☰ → 侧边栏收成 64px 只剩图标；再点展开
  2) 窄屏点 ☰ → 抽屉滑出 + 遮罩；点遮罩或选中菜单项 → 关闭
  3) 选菜单 → 面包屑最后一级同步更新；切换时间范围 → 4 张指标卡同时刷新（aria-live 播报）
【无障碍】☰ 按钮用 aria-expanded 并随状态改 aria-label；侧边栏用 aside + aria-label；内容滚动区可聚焦
【约束】1) 顶栏高度固定，内容区单独滚动；2) 卡片间距统一 12px；3) 图表都要有标题和单位；4) 只用 var(--ui-*) 变量`,
  design: {
    purpose: 'B 端产品最常见的首页骨架：导航稳定在左侧，数据从「总览指标 → 趋势 → 明细」逐层展开。',
    when: ['SaaS 后台、运营 / 数据平台', '电商、CRM、工单系统的管理端', '监控值班系统的总览页'],
    avoid: ['面向普通消费者的前台页面', '只有一两个功能的小工具（侧边栏会显得空）'],
    tips: ['折叠按钮在宽屏和窄屏是两种行为：收窄 vs 抽屉', '指标卡最多 4-6 个，多了就没有重点', '自适应按容器宽度写（@container），嵌进别的页面也不会乱']
  }
};

/* ---------------- 2. 产品落地页 ---------------- */
const PRICE = { 月付: ['¥0', '¥49', '¥199'], 年付: ['¥0', '¥39', '¥159'] };
const landing = {
  id: 'landing', name: '产品落地页', cat: 'Web 页面', frame: 'browser', url: 'nimbus.example.com',
  brief: '吸顶导航 + 首屏价值主张 + 客户墙 + 功能网格 + 月付 / 年付价格 + FAQ + 留资',
  uses: ['ui-navbar', 'ui-button', 'ui-gradient-text', 'ui-sparkline', 'ui-skeleton', 'ui-segmented', 'ui-pricing', 'ui-accordion', 'ui-input'],
  html: `<div class="t-screen t-land t-landing">
<div class="t-top t-land__nav"><ui-navbar brand="Nimbus" items="产品,功能,价格,客户,博客" active="0"></ui-navbar><ui-button size="sm" variant="primary">免费试用</ui-button></div>
<section class="t-land__hero" aria-label="首屏">
<div class="t-land__copy">
<span class="t-land__pill">✨ Nimbus 2.0 全新发布</span>
<h3>让团队的想法 <ui-gradient-text>更快上线</ui-gradient-text></h3>
<p>从需求、设计到发布，一个工作台串起全流程。平均节省 37% 的沟通时间。</p>
<div class="t-land__cta"><ui-button variant="primary" data-go>免费开始</ui-button><ui-button>预约演示</ui-button></div>
<span class="t-sub">无需信用卡 · 14 天全功能试用</span>
</div>
<div class="t-land__shot t-panel" role="img" aria-label="产品界面示意：项目进度和数据趋势">
<div class="t-land__dots" aria-hidden="true"><i></i><i></i><i></i></div>
<div class="t-land__shotbd"><ui-skeleton lines="3"></ui-skeleton><ui-sparkline label="本周交付" data="3,5,4,7,6,9,11"></ui-sparkline></div>
</div>
</section>
<div class="t-land__logos" aria-label="合作客户">${['北辰科技', 'Lumen', '青禾', 'Orbit', '远山资本', 'Kite'].map((x) => '<span>' + x + '</span>').join('')}</div>
<section class="t-land__sec" aria-labelledby="land-f"><h3 id="land-f">一个工作台，替代五个工具</h3>
<div class="t-land__feats">${[['🧭', '需求看板', '拖拽排期，进度一目了然'], ['🎨', '设计协作', '评论直接钉在设计稿上'], ['🤖', 'AI 助手', '自动生成周报和会议纪要'], ['🔗', '200+ 集成', 'GitHub、飞书、Slack 一键连接'], ['🔒', '企业级安全', 'SSO、审计日志、私有部署'], ['📈', '数据洞察', '交付周期、瓶颈自动分析']].map((f) => '<div class="t-panel"><i aria-hidden="true">' + f[0] + '</i><h4>' + f[1] + '</h4><p class="t-sub">' + f[2] + '</p></div>').join('')}</div></section>
<section class="t-land__sec" aria-labelledby="land-p"><h3 id="land-p">简单透明的价格</h3>
<div class="t-land__bill"><ui-segmented items="月付,年付" value="月付"></ui-segmented><span class="t-sub">年付立省 20%</span></div>
<div class="t-land__prices">
<ui-pricing name="个人版" price="${PRICE['月付'][0]}" desc="适合个人试用" features="3 个项目,基础看板,社区支持,!团队协作,!私有部署"></ui-pricing>
<ui-pricing name="团队版" price="${PRICE['月付'][1]}" highlight badge="最受欢迎" desc="每人每月，小团队高效协作" features="不限项目,AI 助手,团队协作,优先支持,!私有部署"></ui-pricing>
<ui-pricing name="企业版" price="${PRICE['月付'][2]}" desc="每人每月，安全与合规" features="不限项目,AI 助手,团队协作,专属客户经理,私有部署"></ui-pricing>
</div></section>
<section class="t-land__sec t-land__faq" aria-labelledby="land-q"><h3 id="land-q">常见问题</h3>
<ui-accordion open="0" items='${json([{ title: '试用结束后会自动扣费吗？', content: '不会。试用期结束后自动降级为个人版，数据全部保留。' }, { title: '可以随时增减成员吗？', content: '可以，按实际人数按天计费，多退少补。' }, { title: '支持私有部署吗？', content: '企业版支持私有部署和 SSO，联系销售获取方案。' }])}'></ui-accordion></section>
<section class="t-land__end" aria-label="订阅试用">
<h3>准备好了吗？</h3><p>留下邮箱，我们发你一份上手指南。</p>
<form class="t-land__form" data-form novalidate><ui-input type="email" placeholder="you@company.com"></ui-input><button class="t-btn t-btn--primary" type="submit">获取指南</button></form>
<p class="t-land__ok" data-ok role="status"></p>
</section>
<div class="t-land__foot t-sub">© 2026 Nimbus · 隐私政策 · 服务条款</div>
</div>`,
  css: `
.t-land{height:auto;min-height:100%}
.t-land__nav{display:flex;align-items:center;gap:10px;padding:0 20px;border-bottom:var(--ui-border-w) solid var(--ui-line)}
.t-land__nav ui-navbar{flex:1;min-width:0;display:block}
.t-land__nav .ui-nb{border:0;background:none;box-shadow:none;padding-left:0;padding-right:0}
.t-land__hero{display:grid;grid-template-columns:1.05fr 1fr;gap:36px;align-items:center;padding:56px 40px 40px;max-width:1100px;margin:0 auto;width:100%}
.t-land__copy{display:flex;flex-direction:column;gap:14px;align-items:flex-start}
.t-land__pill{font-size:12px;padding:4px 12px;border-radius:var(--ui-radius-pill);background:var(--ui-brand-soft);font-weight:600}
.t-land__copy h3{margin:0;font-size:40px;line-height:1.2;letter-spacing:-.5px}
.t-land__copy p{margin:0;font-size:15px;color:var(--ui-sub);max-width:30em}
.t-land__cta{display:flex;gap:10px;flex-wrap:wrap}
.t-land__shot{padding:0;overflow:hidden;box-shadow:var(--ui-shadow);transform:perspective(900px) rotateY(-6deg) rotateX(2deg)}
.t-land__dots{display:flex;gap:5px;padding:9px 12px;border-bottom:var(--ui-border-w) solid var(--ui-line)}
.t-land__dots i{width:8px;height:8px;border-radius:50%;background:var(--ui-line)}
.t-land__shotbd{padding:18px;display:flex;flex-direction:column;gap:18px}
.t-land__shotbd > *{display:block}
.t-land__logos{display:flex;flex-wrap:wrap;justify-content:center;gap:14px 36px;padding:18px 20px;color:var(--ui-sub);font-weight:700;font-size:15px;letter-spacing:.5px;
  border-top:1px dashed var(--ui-line);border-bottom:1px dashed var(--ui-line)}
.t-land__sec{padding:48px 40px 8px;max-width:1100px;margin:0 auto;width:100%}
.t-land__sec > h3{margin:0 0 22px;font-size:26px;text-align:center}
.t-land__feats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.t-land__feats > div{padding:18px}
.t-land__feats i{font-style:normal;font-size:24px}
.t-land__feats h4{margin:8px 0 4px;font-size:15px}
.t-land__feats p{margin:0}
.t-land__bill{display:flex;justify-content:center;align-items:center;gap:10px;margin:-8px 0 18px}
.t-land__prices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-items:stretch}
.t-land__prices ui-pricing{display:block}
.t-land__faq ui-accordion{display:block;max-width:720px;margin:0 auto}
.t-land__end{margin:48px 40px 0;padding:36px 24px;text-align:center;border-radius:var(--ui-radius-lg);background:var(--ui-brand-soft)}
.t-land__end h3{margin:0;font-size:24px}
.t-land__end p{margin:6px 0 16px}
.t-land__form{display:flex;gap:8px;justify-content:center;max-width:460px;margin:0 auto}
.t-land__form ui-input{flex:1;display:block}
.t-land__ok{min-height:1.2em;font-weight:600;margin:10px 0 0!important}
.t-land__foot{text-align:center;padding:24px 0 28px}
@container tpl (max-width:860px){
  .t-land__hero{grid-template-columns:1fr;padding:36px 22px 28px;gap:26px}
  .t-land__shot{transform:none}
  .t-land__copy h3{font-size:32px}
  .t-land__sec{padding:36px 22px 4px}
  .t-land__feats,.t-land__prices{grid-template-columns:minmax(0,1fr)}
  .t-land__end{margin:36px 22px 0}
}
@container tpl (min-width:560px) and (max-width:860px){ .t-land__feats{grid-template-columns:repeat(2,minmax(0,1fr))} }
@container tpl (max-width:520px){
  .t-land__nav{padding:0 12px}
  .t-land__nav > ui-button{display:none}
  .t-land__copy h3{font-size:27px}
  .t-land__form{flex-direction:column}
}`,
  init(root) {
    const PRICE = { 月付: ['¥0', '¥49', '¥199'], 年付: ['¥0', '¥39', '¥159'] };
    /* 月付 / 年付：同时改三张价格卡 */
    root.querySelector('ui-segmented').addEventListener('change', function (e) {
      root.querySelectorAll('ui-pricing').forEach(function (p, i) {
        p.setAttribute('price', PRICE[e.detail.value][i]);
        p.setAttribute('period', e.detail.value === '年付' ? '/月（按年）' : '/月');
      });
    });
    /* 首屏「免费开始」→ 平滑滚动到价格区 */
    root.querySelector('[data-go]').addEventListener('click', function () {
      const sec = root.querySelector('#land-p');
      if (sec) sec.scrollIntoView({ behavior: document.documentElement.dataset.motion === 'reduce' ? 'auto' : 'smooth', block: 'start' });
    });
    /* 留资表单：校验邮箱格式，成功后给出反馈（真实项目里提交到接口） */
    root.querySelector('[data-form]').addEventListener('submit', function (e) {
      e.preventDefault();
      const input = root.querySelector('[data-form] input');
      const ok = root.querySelector('[data-ok]');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value)) {
        ok.textContent = '请填写正确的邮箱地址';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      ok.textContent = '✓ 已发送到 ' + input.value + '，请查收';
      input.value = '';
    });
  },
  ai: `【模板】SaaS 产品落地页 · 响应式 Web（整页滚动）
【页面目标】10 秒内讲清「是什么、为什么选我」，引导点击「免费开始」或留下邮箱
【整体结构】从上到下：
  1) 吸顶导航：ui-navbar（品牌 + 5 个锚点，容器窄时自动折叠成菜单）+ 右侧主按钮「免费试用」
  2) 首屏左右两栏：左边 胶囊徽标（新版本）→ 大标题（40px，关键词用 ui-gradient-text）→ 一句副标题（带具体数字）→ 主次两个按钮 → 「无需信用卡」小字；右边 产品界面示意（窗口外框 + 骨架 + 迷你趋势图，轻微 3D 倾斜）
  3) 客户墙：一行灰色品牌名，上下虚线分隔
  4) 功能网格：3 × 2 卡片（图标 + 标题 + 一句话）
  5) 价格：居中 ui-segmented（月付 / 年付，旁边写「年付立省 20%」）+ 3 张 ui-pricing，中间那张 highlight + 「最受欢迎」
  6) FAQ：ui-accordion，最多 720px 宽
  7) 收尾留资：品牌浅色大卡片，标题 + 邮箱输入 + 提交按钮（原生 submit，回车也能提交），提交结果写在 role=status 里
  8) 页脚版权和链接
【响应式】≤ 860px：首屏变上下排（去掉倾斜）、功能 2 列、价格 1 列；≤ 560px：功能 1 列；≤ 520px：隐藏顶栏按钮、表单竖排、标题 27px
【操作逻辑】
  1) 切换月付 / 年付 → 三张价格卡同时更新价格和计费周期
  2) 「免费开始」→ 平滑滚动到价格区（减少动效时直接跳转）
  3) 提交邮箱 → 前端校验格式；错误时提示并聚焦输入框、aria-invalid；成功后清空并显示「已发送」
【无障碍】每个 section 都有标题或 aria-label；产品示意图 role=img 加说明；表单结果用 role=status 播报
【约束】1) 首屏只放一个主按钮（品牌色），其余是次要按钮；2) 内容最大宽度 1100px 居中；3) 标题层级清楚，每块只有一个标题`,
  design: {
    purpose: '转化导向的单页：每一屏回答一个问题——是什么、能做什么、多少钱、有什么顾虑、怎么开始。',
    when: ['SaaS / 工具产品官网首页', '新品发布、活动报名页', '个人作品集、课程售卖页'],
    avoid: ['登录后的工作界面', '内容需要频繁更新的资讯站'],
    tips: ['首屏副标题写具体数字，比形容词更有说服力', '价格区中间那档高亮，引导选择', '页面底部再放一次行动入口，读完的人最容易转化']
  }
};

/* ---------------- 3. 内容门户 / 博客 ---------------- */
const ARTS = [
  { e: '🤖', c: '科技', t: 'AI 助手进入办公室的第一年', d: '从写周报到排期，我们访谈了 30 个团队', r: '8 分钟' },
  { e: '🎨', c: '设计', t: '深色模式不是把白色换成黑色', d: '对比度、阴影和层级的 7 个细节', r: '6 分钟' },
  { e: '📊', c: '商业', t: '订阅制的下一步是什么', d: '续费率背后的三个关键指标', r: '10 分钟' },
  { e: '🏕️', c: '生活', t: '周末去哪儿：城市近郊露营地', d: '6 个开车一小时内的好去处', r: '5 分钟' },
  { e: '🔋', c: '科技', t: '固态电池离我们还有多远', d: '一文看懂量产时间表', r: '7 分钟' },
  { e: '✏️', c: '设计', t: '一个按钮的 12 种状态', d: '交互设计里最容易被忽视的地方', r: '9 分钟' }
];
const MORE = [
  { e: '🛰️', c: '科技', t: '低轨卫星互联网的新进展', d: '覆盖、延迟与资费', r: '6 分钟' },
  { e: '☕', c: '生活', t: '在家做一杯好喝的手冲', d: '器具、水温和研磨度', r: '4 分钟' },
  { e: '💼', c: '商业', t: '小团队怎么做定价', d: '从成本法到价值定价', r: '8 分钟' }
];
const artCard = (a) => '<article class="t-portal__card t-panel" data-c="' + a.c + '">' + ph(a.e, a.t + ' 配图', '', 'aspect-ratio:16/9;border-radius:0') +
  '<div class="t-portal__cb"><span class="t-portal__cat">' + a.c + '</span><h4>' + a.t + '</h4><p class="t-sub">' + a.d + '</p><span class="t-sub">阅读 ' + a.r + '</span></div></article>';
const portal = {
  id: 'portal', name: '内容门户 / 博客', cat: 'Web 页面', frame: 'browser', url: 'today.example.com',
  brief: '头条大图 + 侧栏热榜 + 分类筛选文章网格 + 加载更多 + 订阅卡',
  uses: ['ui-tabs', 'ui-search', 'ui-button', 'ui-chips', 'ui-input'],
  html: `<div class="t-screen t-portal">
<div class="t-top t-portal__hd"><b class="t-portal__logo">今日观察</b><ui-tabs items="首页,科技,设计,商业,生活" active="0"></ui-tabs><span class="t-flex1"></span><ui-search placeholder="搜索文章"></ui-search><ui-button size="sm" variant="primary">订阅</ui-button></div>
<div class="t-portal__body">
<div class="t-portal__main">
<article class="t-portal__lead">${ph('🌏', '头条配图：城市天际线', 't-portal__leadimg')}<div><span class="t-portal__cat">头条</span><h3>2026 年，哪些新技术真正走进了日常？</h3><p class="t-sub">我们梳理了这一年里改变通勤、办公和消费的 10 项技术，以及它们背后的故事。</p><span class="t-sub">编辑部 · 12 分钟阅读</span></div></article>
<div class="t-sec t-portal__sec"><h3>最新文章</h3><ui-chips single items="全部,科技,设计,商业,生活" value="全部"></ui-chips></div>
<div class="t-portal__grid" data-grid>${ARTS.map(artCard).join('')}</div>
<p class="t-empty" data-empty hidden>这个分类下暂时没有文章</p>
<div class="t-portal__more"><button class="t-btn" data-more>加载更多</button></div>
</div>
<aside class="t-portal__side" aria-label="侧栏">
<div class="t-panel t-portal__box"><h4>🔥 热榜</h4><ol>${['AI 助手进入办公室的第一年', '深色模式不是把白色换成黑色', '固态电池离我们还有多远', '订阅制的下一步是什么', '一个按钮的 12 种状态'].map((x) => '<li><a href="#" onclick="return false">' + x + '</a></li>').join('')}</ol></div>
<div class="t-panel t-portal__box"><h4>📮 每周精选</h4><p class="t-sub">每周五早上，5 篇值得读的文章。</p><ui-input type="email" placeholder="you@example.com"></ui-input><ui-button variant="primary" size="sm">订阅</ui-button></div>
</aside>
</div>
</div>`,
  css: `
.t-portal{height:auto;min-height:100%}
.t-portal__hd{display:flex;align-items:center;gap:14px;padding:8px 24px 0;border-bottom:var(--ui-border-w) solid var(--ui-line)}
.t-portal__logo{font-size:18px;white-space:nowrap;padding-bottom:8px}
.t-portal__hd ui-tabs{display:block;min-width:0;overflow-x:auto}
.t-portal__hd .ui-tabs{border-bottom:0}
.t-portal__hd ui-search{width:200px;display:block;padding-bottom:8px}
.t-portal__hd > ui-button{padding-bottom:8px}
.t-portal__body{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px;padding:22px 24px 30px;max-width:1160px;margin:0 auto;width:100%}
.t-portal__lead{display:grid;grid-template-columns:1.2fr 1fr;gap:20px;align-items:center}
.t-portal__leadimg{aspect-ratio:16/10;font-size:64px;border-radius:var(--ui-radius-lg)}
.t-portal__lead h3{margin:8px 0;font-size:24px;line-height:1.35}
.t-portal__lead p{margin:0 0 8px;font-size:13.5px}
.t-portal__cat{font-size:11px;font-weight:700;color:var(--ui-brand);letter-spacing:.06em}
[data-style="brutal"] .t-portal__cat{color:var(--ui-text)}
.t-portal__sec{margin:28px 0 12px;flex-wrap:wrap}
.t-portal__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.t-portal__card{overflow:hidden;display:flex;flex-direction:column}
.t-portal__card[hidden]{display:none}
.t-portal__cb{padding:10px 12px 12px;display:flex;flex-direction:column;gap:4px}
.t-portal__cb h4{margin:0;font-size:14px;line-height:1.45}
.t-portal__cb p{margin:0}
.t-portal__more{display:flex;justify-content:center;margin-top:18px}
.t-portal__side{display:flex;flex-direction:column;gap:14px}
.t-portal__box{padding:14px;display:flex;flex-direction:column;gap:8px}
.t-portal__box h4{margin:0;font-size:14px}
.t-portal__box ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px}
.t-portal__box li::marker{color:var(--ui-brand);font-weight:700}
.t-portal__box a{color:var(--ui-text);text-decoration:none;font-size:13px}
.t-portal__box a:hover{color:var(--ui-brand);text-decoration:underline}
.t-portal__box p{margin:0}
.t-portal__box ui-input{display:block}
@container tpl (max-width:960px){
  .t-portal__body{grid-template-columns:minmax(0,1fr)}
  .t-portal__side{display:grid;grid-template-columns:1fr 1fr}
  .t-portal__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .t-portal__hd ui-search{display:none}
}
@container tpl (max-width:600px){
  .t-portal__hd{padding:8px 12px 0;gap:8px;flex-wrap:wrap}
  .t-portal__hd > ui-button{display:none}
  .t-portal__hd ui-tabs{order:3;width:100%}
  .t-portal__body{padding:14px 12px 24px}
  .t-portal__lead{grid-template-columns:minmax(0,1fr)}
  .t-portal__lead h3{font-size:20px}
  .t-portal__grid,.t-portal__side{grid-template-columns:minmax(0,1fr)}
}`,
  init(root) {
    const MORE = [
      { e: '🛰️', c: '科技', t: '低轨卫星互联网的新进展', d: '覆盖、延迟与资费', r: '6 分钟' },
      { e: '☕', c: '生活', t: '在家做一杯好喝的手冲', d: '器具、水温和研磨度', r: '4 分钟' },
      { e: '💼', c: '商业', t: '小团队怎么做定价', d: '从成本法到价值定价', r: '8 分钟' }
    ];
    const grid = root.querySelector('[data-grid]');
    const chips = root.querySelector('ui-chips');
    const tabs = root.querySelector('ui-tabs');
    function filter(c) {
      let n = 0;
      grid.querySelectorAll('[data-c]').forEach(function (a) { a.hidden = c !== '全部' && a.dataset.c !== c; if (!a.hidden) n++; });
      root.querySelector('[data-empty]').hidden = n > 0;
    }
    /* 文章分类筛选；顶部频道和筛选标签保持同步 */
    chips.addEventListener('change', function (e) {
      const c = e.detail.value[0] || '全部';
      filter(c);
      tabs.setAttribute('active', String(['全部', '科技', '设计', '商业', '生活'].indexOf(c)));
    });
    tabs.addEventListener('change', function (e) {
      const c = e.detail.index === 0 ? '全部' : e.detail.label;
      chips.setAttribute('value', c);
      filter(c);
    });
    /* 加载更多：追加一批，加载中禁用按钮；没有更多时按钮变为提示 */
    const more = root.querySelector('[data-more]');
    more.addEventListener('click', function () {
      if (more.disabled) return;
      more.disabled = true;
      more.textContent = '加载中…';
      setTimeout(function () {
        MORE.forEach(function (a) {
          const el = document.createElement('div');
          el.innerHTML = '<article class="t-portal__card t-panel" data-c="' + a.c + '"><div class="t-ph" role="img" aria-label="' + a.t + ' 配图" style="aspect-ratio:16/9;border-radius:0">' + a.e + '</div>' +
            '<div class="t-portal__cb"><span class="t-portal__cat">' + a.c + '</span><h4>' + a.t + '</h4><p class="t-sub">' + a.d + '</p><span class="t-sub">阅读 ' + a.r + '</span></div></article>';
          grid.appendChild(el.firstChild);
        });
        filter((chips.getAttribute('value') || '全部'));
        more.textContent = '没有更多了';
      }, 600);
    });
  },
  ai: `【模板】内容门户 / 博客首页 · 响应式 Web（整页滚动）
【页面目标】让读者先被头条吸引，再在分类里找到感兴趣的文章，最后订阅
【整体结构】
  1) 吸顶头部：Logo + ui-tabs 频道（首页 / 科技 / 设计 / 商业 / 生活）+ 弹性空白 + ui-search + 订阅按钮
  2) 主体两栏（最大 1160px 居中）：
     左（主栏）：头条（左大图 16:10 + 右侧 分类小字 / 24px 标题 / 摘要 / 作者与阅读时长）→「最新文章」标题 + ui-chips 单选分类 → 3 列文章卡（16:9 配图 + 分类 + 标题 + 摘要 + 阅读时长）→ 居中「加载更多」
     右（侧栏 280px）：🔥 热榜（有序列表，序号用品牌色）+ 📮 每周精选订阅卡（邮箱输入 + 按钮）
【响应式】≤ 960px：侧栏移到主栏下方并排两块、文章 2 列、隐藏头部搜索；≤ 600px：频道换到第二行、头条上下排、文章 1 列、侧栏 1 列
【操作逻辑】
  1) 点频道或分类标签 → 两者同步，文章网格按分类过滤；为空时显示空状态
  2) 加载更多 → 按钮变「加载中…」并禁用 → 追加一批文章（仍遵守当前分类）→ 没有更多时显示「没有更多了」
  3) 热榜标题悬停下划线，点进文章详情
【无障碍】侧栏用 aside + aria-label；配图 role=img + 文章名；加载状态通过按钮文字体现
【约束】1) 文章卡等宽等高，标题最多两行；2) 分类小字用品牌色、大写字距；3) 头条只有一篇`,
  design: {
    purpose: '以阅读为主的首页：一个强焦点（头条）+ 一个可扫读的列表 + 侧栏承担次要信息与转化。',
    when: ['博客、媒体、资讯站', '企业知识库、帮助中心首页', '社区精选页'],
    avoid: ['需要实时刷新的信息流（用社交动态模板）', '内容很少、更新不频繁的站点'],
    tips: ['频道和分类标签是同一个筛选，要保持同步', '「加载更多」比无限滚动更利于找到页脚', '窄屏时侧栏放到最后，不要挤占阅读区']
  }
};

/* ---------------- 4. 邮件 / 三栏工作台 ---------------- */
const MAILS = [
  { f: '收件箱', from: '林小北', s: '11 月迭代排期确认', p: '附件是最新的排期表，麻烦周三前确认一下各自的模块…', t: '10:24', unread: true, star: true },
  { f: '收件箱', from: 'GitHub', s: '[ui-catalog] CI 通过 #82', p: 'All checks have passed. 82 tests, 0 failures.', t: '09:12', unread: true },
  { f: '收件箱', from: '周一一', s: '周五团建地点投票', p: '大家选一下：A 露营 / B 密室 / C 火锅，周四下班前截止～', t: '昨天' },
  { f: '收件箱', from: '财务部', s: '10 月报销已到账', p: '您提交的 3 笔报销共计 ¥ 1,286.00 已打款，请注意查收。', t: '周一' },
  { f: '已发送', from: '我', s: 'Re: 设计评审意见', p: '收到，按钮状态那块我今天下午改完再发你。', t: '周一' },
  { f: '草稿', from: '我', s: '年终总结（草稿）', p: '今年主要完成了三件事：一是组件库从 0 到 167 个…', t: '上周' }
];
const mailItem = (m, i) => '<li><button class="t-mail__item' + (m.unread ? ' unread' : '') + '" data-mail="' + i + '" data-f="' + m.f + '" aria-current="' + (i === 0) + '">' +
  '<ui-avatar name="' + m.from + '" size="sm"></ui-avatar><span class="t-mail__it"><span class="t-mail__r1"><b>' + m.from + '</b><span class="t-sub">' + m.t + '</span></span>' +
  '<span class="t-mail__s">' + (m.unread ? '<span class="t-sr">未读，</span>' : '') + m.s + '</span><span class="t-sub t-mail__p">' + m.p + '</span></span></button>' +
  '<button class="t-mail__star" data-star="' + i + '" aria-pressed="' + !!m.star + '" aria-label="标星：' + m.s + '">' + (m.star ? '★' : '☆') + '</button></li>';
const mail = {
  id: 'mail', name: '邮件 / 三栏工作台', cat: 'Web 页面', frame: 'browser', url: 'mail.example.com/inbox',
  brief: '文件夹 | 列表 | 阅读区三栏；窄屏变成「列表 → 详情」两级导航',
  uses: ['ui-button', 'ui-search', 'ui-avatar', 'ui-textarea'],
  html: `<div class="t-screen t-mail" data-pane="list">
<div class="t-mail__nav" role="group" aria-label="邮件文件夹">
<ui-button variant="primary" data-compose>✏️ 写邮件</ui-button>
${[['📥', '收件箱', 2], ['⭐', '星标', 0], ['📤', '已发送', 0], ['📝', '草稿', 1], ['🗑️', '垃圾箱', 0]].map((x, i) => '<button data-folder="' + x[1] + '" aria-pressed="' + (i === 0) + '"><i aria-hidden="true">' + x[0] + '</i><span>' + x[1] + '</span>' + (x[2] ? '<em data-cnt>' + x[2] + '</em>' : '') + '</button>').join('')}
</div>
<div class="t-mail__list">
<div class="t-mail__lh"><h3 data-ftitle>收件箱</h3><ui-search placeholder="搜索邮件"></ui-search></div>
<ul class="t-mail__ul" tabindex="0" aria-label="邮件列表">${MAILS.map(mailItem).join('')}</ul>
<p class="t-empty" data-empty hidden>这里没有邮件</p>
</div>
<div class="t-mail__read" tabindex="0" role="region" aria-label="邮件正文" data-read>
<button class="t-mail__back" data-back>‹ 返回列表</button>
<h3 data-rs>${MAILS[0].s}</h3>
<div class="t-mail__from"><ui-avatar name="${MAILS[0].from}"></ui-avatar><div><b data-rf>${MAILS[0].from}</b><div class="t-sub">发给 我 · <span data-rt>${MAILS[0].t}</span></div></div></div>
<div class="t-mail__body" data-rb><p>${MAILS[0].p}</p><p>如果有冲突的地方直接在表格里标注就好，我们周三站会上统一过一遍。</p><p>谢谢！</p></div>
<div class="t-mail__reply"><ui-textarea placeholder="快速回复…" rows="3"></ui-textarea><div><ui-button variant="primary" size="sm" data-send>发送</ui-button><ui-button size="sm">转发</ui-button></div></div>
</div>
</div>`,
  css: `
.t-mail{display:grid;grid-template-columns:190px 320px minmax(0,1fr);overflow:hidden}
.t-mail__nav{display:flex;flex-direction:column;gap:2px;padding:14px 10px;background:var(--ui-panel-2);border-right:var(--ui-border-w) solid var(--ui-line)}
.t-mail__nav ui-button{display:block;margin-bottom:10px}
.t-mail__nav ui-button .ui-btn{width:100%}
.t-mail__nav > button{display:flex;align-items:center;gap:10px;padding:8px 10px;border:0;border-radius:var(--ui-radius-sm);background:none;cursor:pointer;text-align:left;font-size:13px}
.t-mail__nav > button i{font-style:normal}
.t-mail__nav > button span{flex:1}
.t-mail__nav > button em{font-style:normal;font-size:11px;font-weight:700;padding:0 7px;border-radius:var(--ui-radius-pill);background:var(--ui-brand);color:var(--ui-brand-ink)}
.t-mail__nav > button[aria-pressed="true"]{background:var(--ui-brand-soft);font-weight:600}
.t-mail__list{display:flex;flex-direction:column;min-height:0;border-right:var(--ui-border-w) solid var(--ui-line);background:var(--ui-panel)}
.t-mail__lh{padding:12px;display:flex;flex-direction:column;gap:8px;border-bottom:var(--ui-border-w) solid var(--ui-line)}
.t-mail__lh h3{margin:0;font-size:16px}
.t-mail__lh ui-search{display:block}
.t-mail__ul{list-style:none;margin:0;padding:0;overflow-y:auto;flex:1}
.t-mail__ul:focus-visible{outline:2px solid var(--ui-brand);outline-offset:-2px}
.t-mail__ul li{position:relative;border-bottom:1px solid var(--ui-line)}
.t-mail__ul li[hidden]{display:none}
.t-mail__item{display:flex;gap:10px;width:100%;padding:11px 36px 11px 12px;border:0;background:none;cursor:pointer;text-align:left;font-size:13px}
.t-mail__item[aria-current="true"]{background:var(--ui-brand-soft);box-shadow:inset 3px 0 0 var(--ui-brand)}
.t-mail__item[aria-current="true"] .t-sub{color:var(--ui-text)}
.t-mail__item:focus-visible{outline:2px solid var(--ui-brand);outline-offset:-2px}
.t-mail__it{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
.t-mail__r1{display:flex;justify-content:space-between;gap:6px}
.t-mail__r1 b{font-weight:500}
.t-mail__item.unread .t-mail__r1 b,.t-mail__item.unread .t-mail__s{font-weight:700}
.t-mail__item.unread::before{content:"";position:absolute;left:4px;top:20px;width:6px;height:6px;border-radius:50%;background:var(--ui-brand)}
.t-mail__s,.t-mail__p{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.t-mail__star{position:absolute;right:8px;top:9px;border:0;background:none;cursor:pointer;font-size:15px;color:var(--ui-sub);width:26px;height:26px;border-radius:50%}
.t-mail__star[aria-pressed="true"]{color:var(--ui-warn)}
.t-mail__read{padding:22px 28px;overflow-y:auto;min-height:0;display:flex;flex-direction:column;gap:14px}
.t-mail__read:focus-visible{outline:2px solid var(--ui-brand);outline-offset:-2px}
.t-mail__read h3{margin:0;font-size:20px}
.t-mail__from{display:flex;align-items:center;gap:10px}
.t-mail__body{font-size:14px;line-height:1.8}
.t-mail__body p{margin:0 0 8px}
.t-mail__reply{margin-top:auto;display:flex;flex-direction:column;gap:8px;padding-top:14px;border-top:1px dashed var(--ui-line)}
.t-mail__reply ui-textarea{display:block}
.t-mail__reply > div{display:flex;gap:8px}
.t-mail__back{display:none;align-self:flex-start;border:0;background:none;color:var(--ui-brand);cursor:pointer;padding:0;font-size:13px}
@container tpl (max-width:960px){
  .t-mail{grid-template-columns:64px 280px minmax(0,1fr)}
  .t-mail__nav{padding:12px 8px;align-items:center}
  .t-mail__nav > button em{display:none}
  /* 窄屏只显示图标，文字改为视觉隐藏，读屏仍能读到文件夹名 */
  .t-mail__nav > button span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .t-mail__nav > button{justify-content:center;font-size:17px;width:44px;height:40px;padding:0}
  .t-mail__nav ui-button{display:none}
}
@container tpl (max-width:640px){
  .t-mail{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr)}
  .t-mail__nav{flex-direction:row;justify-content:space-around;padding:6px;border-right:0;border-bottom:var(--ui-border-w) solid var(--ui-line)}
  .t-mail__list,.t-mail__read{grid-row:2;grid-column:1}
  .t-mail[data-pane="list"] .t-mail__read{display:none}
  .t-mail[data-pane="read"] .t-mail__list{display:none}
  .t-mail[data-pane="read"] .t-mail__nav{display:none}
  .t-mail[data-pane="read"] .t-mail__read{grid-row:1/-1}
  .t-mail__back{display:inline-block}
  .t-mail__read{padding:14px 16px}
}`,
  init(root) {
    const MAILS = Array.from(root.querySelectorAll('[data-mail]')).map(function (b) {
      return { s: b.querySelector('.t-mail__s').textContent.replace('未读，', ''), from: b.querySelector('b').textContent, t: b.querySelector('.t-mail__r1 .t-sub').textContent, p: b.querySelector('.t-mail__p').textContent };
    });
    const list = root.querySelector('.t-mail__ul');
    let folder = '收件箱';
    let q = '';
    function refresh() {
      let n = 0;
      list.querySelectorAll('li').forEach(function (li) {
        const b = li.querySelector('[data-mail]');
        const star = li.querySelector('[data-star]').getAttribute('aria-pressed') === 'true';
        const inFolder = folder === '星标' ? star : b.dataset.f === folder;
        li.hidden = !(inFolder && b.textContent.indexOf(q) > -1);
        if (!li.hidden) n++;
      });
      root.querySelector('[data-empty]').hidden = n > 0;
      const unread = list.querySelectorAll('.unread[data-f="收件箱"]').length;
      const cnt = root.querySelector('[data-folder="收件箱"] [data-cnt]');
      if (cnt) { cnt.textContent = unread; cnt.hidden = !unread; }
    }
    /* 打开邮件：右侧显示正文、标为已读；窄屏切到「详情」并把焦点移到正文 */
    function open(i) {
      const m = MAILS[i];
      list.querySelectorAll('[data-mail]').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.mail === String(i))); });
      const item = list.querySelector('[data-mail="' + i + '"]');
      item.classList.remove('unread');
      const sr = item.querySelector('.t-sr');
      if (sr) sr.remove();
      root.querySelector('[data-rs]').textContent = m.s;
      root.querySelector('[data-rf]').textContent = m.from;
      root.querySelector('[data-rt]').textContent = m.t;
      root.querySelector('.t-mail__from ui-avatar').setAttribute('name', m.from);
      root.querySelector('[data-rb]').innerHTML = '<p>' + m.p + '</p>';
      root.dataset.pane = 'read';
      if (root.clientWidth <= 640) root.querySelector('[data-read]').focus();
      refresh();
    }
    root.addEventListener('click', function (e) {
      const star = e.target.closest('[data-star]');
      if (star) {
        const on = star.getAttribute('aria-pressed') !== 'true';
        star.setAttribute('aria-pressed', String(on));
        star.textContent = on ? '★' : '☆';
        refresh();
        return;
      }
      const it = e.target.closest('[data-mail]');
      if (it) return open(Number(it.dataset.mail));
      const f = e.target.closest('[data-folder]');
      if (f) {
        folder = f.dataset.folder;
        root.querySelectorAll('[data-folder]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === f)); });
        root.querySelector('[data-ftitle]').textContent = folder;
        root.dataset.pane = 'list';
        refresh();
        return;
      }
      if (e.target.closest('[data-back]')) {
        root.dataset.pane = 'list';
        const cur = list.querySelector('[aria-current="true"]');
        if (cur) cur.focus();
        return;
      }
      if (e.target.closest('[data-send]')) {
        const ta = root.querySelector('.t-mail__reply textarea');
        if (window.uiToast) window.uiToast(ta.value.trim() ? '已发送回复' : '回复内容不能为空');
        if (ta.value.trim()) ta.value = '';
      }
      if (e.target.closest('[data-compose]') && window.uiToast) window.uiToast('打开写邮件窗口（演示）');
    });
    /* 搜索：在当前文件夹内过滤发件人、主题和摘要 */
    root.querySelector('ui-search').addEventListener('input', function (e) {
      q = e.target.value.trim();
      refresh();
    });
    refresh();
  },
  ai: `【模板】邮件 / 三栏工作台 · 响应式 Web（应用型，整屏不滚动，各栏独立滚动）
【页面目标】高频处理消息：左边选文件夹、中间扫列表、右边读和回复，三步不离开页面
【整体结构】三栏 grid：190px | 320px | 剩余
  1) 左栏 文件夹：「写邮件」主按钮 + 收件箱（未读数徽标）/ 星标 / 已发送 / 草稿 / 垃圾箱，当前项 brand-soft 底
  2) 中栏 列表：文件夹标题 + ui-search；邮件项 = 小头像 + 发件人 / 时间 + 主题 + 一行摘要；未读加粗并在左侧小圆点；当前项 brand-soft 底 + 左侧 3px 品牌色条；右上角 ☆ 标星按钮
  3) 右栏 阅读区：主题（20px）+ 发件人信息 + 正文（14px / 1.8 行高）+ 底部快速回复（ui-textarea + 发送 / 转发）
【响应式】≤ 960px：左栏收成 64px 图标栏，隐藏「写邮件」文字按钮；≤ 640px：文件夹变成顶部一行图标，列表和阅读区二选一（「列表 → 详情」两级导航，详情页左上角「‹ 返回列表」）
【操作逻辑】
  1) 点邮件 → 阅读区更新、该邮件标为已读、收件箱未读数 -1；窄屏切到详情并把焦点移到正文
  2) 点 ☆ → 标星 / 取消（warn 色 ★），「星标」文件夹实时反映
  3) 切换文件夹 → 列表过滤、标题更新；窄屏回到列表
  4) 搜索 → 在当前文件夹内即时过滤；没有结果显示空状态
  5) 快速回复为空时提示「回复内容不能为空」，成功后清空输入框
【无障碍】当前邮件 aria-current；未读用视觉隐藏文字「未读，」读出来；文件夹按钮 aria-pressed；返回列表时焦点回到刚才那封邮件
【约束】1) 三栏各自滚动，顶层不滚动；2) 列表行高一致、摘要单行省略；3) 窄屏不要同时显示列表和正文`,
  design: {
    purpose: '「主从」布局的经典形态：导航 → 列表 → 详情。宽屏并排，窄屏逐级进入，同一套代码覆盖桌面和手机。',
    when: ['邮件、工单、客服会话、审批中心', '文件管理、笔记、消息通知中心', '告警列表 + 告警详情'],
    avoid: ['列表项需要大图展示的场景（用卡片网格）', '一次只处理一条、没有「浏览」需求的流程'],
    tips: ['窄屏的「返回」要把焦点还给原来的列表项', '未读状态同时用加粗 + 圆点 + 读屏文字表达', '中栏宽度固定，阅读区吃掉剩余空间']
  }
};

export const webTemplates = [admin, landing, portal, mail];
