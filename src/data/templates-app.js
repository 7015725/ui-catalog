/* =========================================================
   界面模板 · 移动 APP（6 个）
   每个模板：html 结构 + css（以 .t-<id> 作用域）+ init 操作逻辑 + AI 提示词 + 设计说明
   ========================================================= */
import { ph, json } from './templates-shared.js';

const nav = (items, active, label) => "<ui-bottom-nav label='" + label + "' active='" + (active || 0) + "' items='" + json(items) + "'></ui-bottom-nav>";

/* ---------------- 1. 电商首页 ---------------- */
const goods = [
  { e: '🎧', t: '降噪蓝牙耳机 Pro 主动降噪 40 小时续航', p: 399, o: 599, s: '2.3 万', c: '数码' },
  { e: '👟', t: '轻量缓震跑鞋 男女同款', p: 269, o: 459, s: '8600', c: '服饰' },
  { e: '🧴', t: '保湿修护精华 30ml', p: 159, o: 229, s: '1.1 万', c: '美妆' },
  { e: '🪴', t: '北欧风陶瓷花盆 三件套', p: 49, o: 89, s: '5200', c: '家居' },
  { e: '⌚', t: '智能手表 血氧心率监测', p: 899, o: 1299, s: '3400', c: '数码' },
  { e: '🍫', t: '黑巧克力 72% 礼盒装', p: 39.9, o: 59, s: '1.6 万', c: '食品' }
];
const shop = {
  id: 'shop', name: '电商首页', cat: '移动 APP', frame: 'phone',
  brief: '搜索 + 频道 + 轮播 + 金刚区 + 秒杀 + 双列商品流',
  uses: ['ui-search', 'ui-chips', 'ui-carousel', 'ui-countdown', 'ui-progress', 'ui-bottom-nav'],
  html: `<div class="t-screen t-shop">
<div class="t-scr" tabindex="0" role="region" aria-label="电商首页内容">
<div class="t-top t-shop__top">
<div class="t-shop__bar"><b class="t-shop__logo">优选</b>
<ui-search placeholder="搜索商品、品牌" suggestions="降噪耳机,跑鞋,精华,花盆,智能手表,巧克力"></ui-search>
<button class="t-icobtn" aria-label="扫一扫">📷</button></div>
<ui-chips single items="推荐,数码,服饰,美妆,家居,食品" value="推荐"></ui-chips>
</div>
<div class="t-shop__banner"><ui-carousel autoplay="4500" slides='${json([{ title: '双十一预售开启', desc: '全场满 300 减 50，叠加会员折扣' }, { title: '数码焕新周', desc: '以旧换新最高补贴 800 元' }, { title: '新人专享', desc: '首单立减 20 元，包邮到家' }])}'></ui-carousel></div>
<div class="t-grid">${[['🔥', '今日爆款'], ['🎁', '领券中心'], ['🚚', '次日达'], ['💳', '分期免息'], ['🏷️', '9.9 包邮'], ['📱', '手机数码'], ['👗', '女装'], ['🍎', '生鲜'], ['🧸', '母婴'], ['⋯', '全部分类']].map((x) => '<button><i aria-hidden="true">' + x[0] + '</i>' + x[1] + '</button>').join('')}</div>
<div class="t-sec"><h3>限时秒杀 <ui-countdown seconds="5400" size="sm"></ui-countdown></h3><button class="t-more">更多 ›</button></div>
<div class="t-hs">${[['🎮', 129, 299, 76], ['📷', 1999, 2699, 42], ['🧥', 199, 399, 91], ['☕', 59, 99, 58]].map((x, i) =>
    '<button class="t-shop__flash">' + ph(x[0], '秒杀商品图', '', 'height:84px') +
    '<span class="t-price">¥' + x[1] + '</span><s class="t-sub">¥' + x[2] + '</s>' +
    '<ui-progress value="' + x[3] + '" label="已抢 ' + x[3] + '%"></ui-progress></button>').join('')}</div>
<div class="t-sec"><h3>猜你喜欢</h3></div>
<div class="t-shop__feed">${goods.map((g) =>
    '<article class="t-shop__item t-panel" data-c="' + g.c + '">' + ph(g.e, g.t, '', 'aspect-ratio:1/1;border-radius:0') +
    '<div class="t-shop__info"><h4>' + g.t + '</h4><div class="t-shop__row"><span class="t-price">¥' + g.p + '</span>' +
    '<s class="t-sub">¥' + g.o + '</s></div><div class="t-shop__row"><span class="t-sub">已售 ' + g.s + '</span>' +
    '<button class="t-shop__add" data-add aria-label="把「' + g.t + '」加入购物车">＋</button></div></div></article>').join('')}</div>
<p class="t-empty" data-empty hidden>这个频道暂时没有商品</p>
</div>
${nav([{ icon: '🏠', label: '首页' }, { icon: '🗂️', label: '分类' }, { icon: '🛒', label: '购物车', badge: '2' }, { icon: '👤', label: '我的' }], 0, '电商底部导航')}
</div>`,
  css: `
.t-shop__top{padding:10px 14px 8px;display:flex;flex-direction:column;gap:8px}
.t-shop__bar{display:flex;align-items:center;gap:8px}
.t-shop__logo{font-size:17px;color:var(--ui-brand);flex:0 0 auto}
[data-style="brutal"] .t-shop__logo{color:var(--ui-text)}
.t-shop__bar ui-search{flex:1;min-width:0;display:block}
.t-shop__top ui-chips{display:block;overflow-x:auto;scrollbar-width:none}
.t-shop__top .ui-chips{flex-wrap:nowrap}
.t-shop__top .ui-chips button{flex:0 0 auto}
.t-shop__banner{padding:4px 14px 12px}
.t-shop__flash{width:104px;display:flex;flex-direction:column;gap:3px;padding:6px;border:var(--ui-border-w) solid var(--ui-line);
  border-radius:var(--ui-radius);background:var(--ui-panel);cursor:pointer;text-align:left;font-size:13px}
.t-shop__flash s{font-size:11px}
.t-shop__flash ui-progress{display:block;font-size:10.5px}
.t-shop__feed{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 14px 16px}
.t-shop__item{overflow:hidden;display:flex;flex-direction:column}
.t-shop__item[hidden]{display:none}
.t-shop__info{padding:8px 9px 9px;display:flex;flex-direction:column;gap:4px}
.t-shop__info h4{margin:0;font-size:12.5px;font-weight:500;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.t-shop__row{display:flex;align-items:center;gap:6px}
.t-shop__row s{font-size:11px}
.t-shop__add{margin-left:auto;width:28px;height:28px;border:0;border-radius:50%;background:var(--ui-brand);color:var(--ui-brand-ink)!important;
  font-size:16px;cursor:pointer;display:grid;place-items:center}
.t-shop__add:focus-visible{outline:2px solid var(--ui-text);outline-offset:2px}`,
  init(root) {
    const nav = root.querySelector('ui-bottom-nav');
    let cart = 2;
    /* 加入购物车：角标 +1、按钮变 ✓、全局轻提示 */
    root.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-add]');
      if (!btn || btn.dataset.done) return;
      btn.dataset.done = '1';
      btn.textContent = '✓';
      btn.setAttribute('aria-label', '已加入购物车');
      cart += 1;
      const items = JSON.parse(nav.getAttribute('items'));
      items[2].badge = String(cart);
      nav.setAttribute('items', JSON.stringify(items));
      if (window.uiToast) window.uiToast('已加入购物车（共 ' + cart + ' 件）');
    });
    /* 频道切换：只显示对应分类，「推荐」显示全部；没有结果时显示空状态 */
    root.querySelector('ui-chips').addEventListener('change', function (e) {
      const c = e.detail.value[0] || '推荐';
      let shown = 0;
      root.querySelectorAll('[data-c]').forEach(function (el) {
        el.hidden = c !== '推荐' && el.dataset.c !== c;
        if (!el.hidden) shown++;
      });
      root.querySelector('[data-empty]').hidden = shown > 0;
    });
  },
  ai: `【模板】电商首页 · 移动 APP（设计宽度 375，竖屏，可整体滚动）
【页面目标】让用户 3 秒内找到「搜索入口」和「今天值得买的东西」，次要目标是把流量导到活动和分类
【整体结构】从上到下：
  1) 吸顶区：Logo + 搜索框（ui-search，带联想词）+ 扫一扫图标按钮；下面一行频道标签（ui-chips single：推荐/数码/服饰…）
  2) 活动轮播 ui-carousel，自动播放 4-5 秒，3 张以内
  3) 金刚区：5 列 × 2 行图标入口，最后一个固定为「全部分类」
  4) 限时秒杀：标题旁放 ui-countdown（size=sm），横向滑动的商品卡，每张有现价、划线原价、已抢进度 ui-progress
  5) 猜你喜欢：双列商品流，卡片 = 1:1 主图 + 两行标题 + 价格 + 已售 + 圆形「＋」加购按钮
  6) 底部导航 ui-bottom-nav：首页 / 分类 / 购物车（角标）/ 我的
【布局】左右边距 14px，卡片间距 10px；吸顶区半透明 + 毛玻璃；滚动区独立，底部导航始终可见
【操作逻辑】
  1) 点频道标签 → 商品流只显示该分类，「推荐」显示全部；筛完为空时显示空状态文案
  2) 点「＋」→ 购物车角标 +1，按钮变 ✓ 防止重复点，弹轻提示「已加入购物车」
  3) 搜索框输入 → 下拉联想；回车或点联想词 → 跳搜索结果页（触发 search 事件）
  4) 秒杀倒计时归零 → 刷新下一场（或隐藏该区块）
【状态】首屏加载用骨架屏（ui-skeleton）占位；商品图加载失败显示占位色块；网络错误时商品流底部显示「重试」
【无障碍】滚动区 role=region 并可聚焦；图标按钮都要 aria-label（如「把 XX 加入购物车」）；角标数字要能被读出
【约束】1) 价格用 tabular-nums，现价用 danger 色、原价用删除线 + 次要色；2) 商品标题最多两行省略；3) 首屏不超过 1 个轮播；4) 所有颜色只用 var(--ui-*) 变量`,
  design: {
    purpose: '综合型电商的标准首页：搜索是第一入口，活动与推荐流负责「逛」。信息密度高，但层级清楚。',
    when: ['商品多、品类多的商城', '有频繁营销活动的零售 APP', '小程序商城首页'],
    avoid: ['只卖几个 SKU 的品牌店（用落地页式首页更好）', '高客单价、需要讲故事的品牌（豪车、奢侈品）'],
    tips: ['金刚区控制在 8-10 个，入口太多等于没有入口', '「＋」加购要有即时反馈（角标、动画、提示三选二）', '商品流用双列，单列适合内容型种草', '秒杀区横滑，避免把首屏挤得太长']
  }
};

/* ---------------- 2. 外卖 / 本地生活 ---------------- */
const stores = [
  { e: '🍜', n: '老街牛肉面馆', r: 4.8, m: 28, d: '1.2km', sale: '月售 3200', fee: 0, tags: ['满 30 减 8', '免配送费'] },
  { e: '🍔', n: '炭烤汉堡研究所', r: 4.6, m: 35, d: '2.1km', sale: '月售 1800', fee: 3, tags: ['新店', '满 40 减 10'] },
  { e: '🥗', n: '轻食沙拉 · 低卡', r: 4.9, m: 22, d: '0.8km', sale: '月售 5100', fee: 0, tags: ['免配送费', '品质商家'] },
  { e: '🍣', n: '一贯寿司', r: 4.4, m: 42, d: '3.4km', sale: '月售 960', fee: 5, tags: ['满 99 减 20'] },
  { e: '🧋', n: '山野奶茶', r: 4.7, m: 18, d: '0.5km', sale: '月售 9800', fee: 1, tags: ['第二杯半价'] }
];
const food = {
  id: 'food', name: '外卖 / 本地生活', cat: '移动 APP', frame: 'phone',
  brief: '定位 + 品类宫格 + 新人券 + 吸顶筛选 + 商家列表',
  uses: ['ui-search', 'ui-banner', 'ui-segmented', 'ui-chips', 'ui-tag', 'ui-bottom-nav'],
  html: `<div class="t-screen t-food">
<div class="t-scr" tabindex="0" role="region" aria-label="外卖首页内容">
<div class="t-food__head">
<button class="t-food__loc" aria-label="切换收货地址，当前：望京 SOHO">📍 <b>望京 SOHO</b> ▾</button>
<ui-search placeholder="搜索商家、菜品" suggestions="牛肉面,汉堡,沙拉,寿司,奶茶,咖啡"></ui-search>
</div>
<div class="t-grid">${[['🍱', '美食'], ['🍰', '甜点饮品'], ['🛒', '超市便利'], ['🍉', '水果'], ['💊', '买药'], ['🌸', '鲜花'], ['🏃', '跑腿'], ['🥩', '生鲜菜场'], ['☕', '咖啡'], ['⋯', '全部']].map((x) => '<button><i aria-hidden="true">' + x[0] + '</i>' + x[1] + '</button>').join('')}</div>
<div class="t-food__coupon"><ui-banner variant="gradient" icon="🎟️" action="立即领取">新人首单立减 15 元，红包已到账</ui-banner></div>
<div class="t-top t-food__filter">
<ui-segmented items="综合排序,距离最近,销量最高" value="综合排序"></ui-segmented>
<ui-chips items="免配送费,30 分钟内,4.7 分以上"></ui-chips>
</div>
<div class="t-food__list">${stores.map((s, i) =>
    '<article class="t-food__store" data-i="' + i + '" data-fee="' + s.fee + '" data-min="' + s.m + '" data-r="' + s.r + '" data-d="' + parseFloat(s.d) + '" data-sale="' + parseInt(s.sale.replace(/\D/g, ''), 10) + '">' +
    ph(s.e, s.n + ' 店铺头像', 't-food__logo') +
    '<div class="t-food__bd"><h3>' + s.n + '</h3><div class="t-food__meta"><span class="t-food__star"><i aria-hidden="true">★</i> ' + s.r + '</span><span class="t-sub">' + s.sale + '</span>' +
    '<span class="t-sub t-food__eta">' + s.m + ' 分钟 · ' + s.d + '</span></div>' +
    '<div class="t-sub">起送 ¥20 · ' + (s.fee ? '配送 ¥' + s.fee : '免配送费') + '</div>' +
    '<div class="t-food__tags">' + s.tags.map((t) => '<ui-tag look="outline" variant="danger">' + t + '</ui-tag>').join('') + '</div></div></article>').join('')}</div>
<p class="t-empty" data-empty hidden>没有符合条件的商家，换个筛选试试</p>
</div>
${nav([{ icon: '🏠', label: '首页' }, { icon: '🧾', label: '订单', badge: '1' }, { icon: '👤', label: '我的' }], 0, '外卖底部导航')}
</div>`,
  css: `
.t-food__head{padding:10px 14px 6px;display:flex;flex-direction:column;gap:8px;
  background:linear-gradient(180deg,var(--ui-brand-soft),var(--ui-bg))}
.t-food__loc{align-self:flex-start;border:0;background:none;cursor:pointer;font-size:14px;padding:2px 0}
.t-food__head ui-search{display:block}
.t-food__coupon{padding:6px 14px 2px}
.t-food__coupon ui-banner{display:block}
.t-food__filter{padding:10px 14px 8px;display:flex;flex-direction:column;gap:8px;border-bottom:var(--ui-border-w) solid var(--ui-line)}
.t-food__filter ui-segmented{display:block}
.t-food__filter ui-chips{display:block;overflow-x:auto;scrollbar-width:none}
.t-food__filter .ui-chips{flex-wrap:nowrap}
.t-food__filter .ui-chips button{flex:0 0 auto}
.t-food__list{display:flex;flex-direction:column}
.t-food__store{display:flex;gap:12px;padding:12px 14px;border-bottom:1px solid var(--ui-line)}
.t-food__store[hidden]{display:none}
.t-food__logo{width:64px;height:64px;flex:0 0 auto;font-size:28px}
.t-food__bd{min-width:0;flex:1;display:flex;flex-direction:column;gap:3px}
.t-food__bd h3{margin:0;font-size:14px}
.t-food__meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.t-food__star{font-weight:700;font-size:12px}
.t-food__star i{font-style:normal;color:var(--ui-warn)}
.t-food__eta{margin-left:auto}
.t-food__tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:2px}
.t-food__tags ui-tag{font-size:11px}`,
  init(root) {
    const list = root.querySelector('.t-food__list');
    const seg = root.querySelector('ui-segmented');
    const chips = root.querySelector('ui-chips');
    /* 排序 + 多条件筛选：任何一个变化都重新计算一遍 */
    function apply() {
      const sort = seg.getAttribute('value');
      const on = (chips.getAttribute('value') || '').split(',');
      const cards = Array.from(list.children);
      cards.sort(function (a, b) {
        if (sort === '距离最近') return a.dataset.d - b.dataset.d;
        if (sort === '销量最高') return b.dataset.sale - a.dataset.sale;
        return a.dataset.i - b.dataset.i;
      }).forEach(function (c) { list.appendChild(c); });
      let shown = 0;
      cards.forEach(function (c) {
        const ok = (on.indexOf('免配送费') < 0 || c.dataset.fee === '0') &&
          (on.indexOf('30 分钟内') < 0 || Number(c.dataset.min) <= 30) &&
          (on.indexOf('4.7 分以上') < 0 || Number(c.dataset.r) >= 4.7);
        c.hidden = !ok;
        if (ok) shown++;
      });
      root.querySelector('[data-empty]').hidden = shown > 0;
    }
    seg.addEventListener('change', apply);
    chips.addEventListener('change', apply);
  },
  ai: `【模板】外卖 / 本地生活首页 · 移动 APP（375 宽）
【页面目标】先确认「送到哪」，再帮用户最快选出一家店；红包和筛选是转化关键
【整体结构】从上到下：
  1) 头部：左上角收货地址按钮（📍 地址名 ▾），下方搜索框 ui-search；头部背景从 brand-soft 渐变到页面底色
  2) 品类宫格：5 列 × 2 行（美食 / 甜点饮品 / 超市 / 水果 / 买药…），最后一个「全部」
  3) 新人红包横幅 ui-banner variant=gradient，带「立即领取」按钮
  4) 吸顶筛选条：ui-segmented 排序（综合 / 距离 / 销量）+ ui-chips 多选筛选（免配送费 / 30 分钟内 / 4.7 分以上）
  5) 商家列表：左侧 64px 方形店铺图，右侧店名、★评分（★ 用 warn 色，数字用正文色保证对比度）、月售、送达时间 · 距离、起送 / 配送费、优惠标签（ui-tag outline danger）
  6) 底部导航：首页 / 订单（角标）/ 我的
【操作逻辑】
  1) 切换排序 → 列表重排；勾选筛选 → 多条件同时生效（与关系）；筛选结果为空 → 显示空状态和「换个筛选」提示
  2) 筛选条吸顶：滚动到它的位置后固定在顶部，列表在下面继续滚
  3) 点地址 → 打开地址选择（底部抽屉 ui-drawer）；切换地址后整页刷新商家
  4) 点商家 → 进入店铺页；点红包「立即领取」→ 领取成功后横幅变为「已领取」
【无障碍】地址按钮的 aria-label 要包含当前地址；评分用文字「★ 4.8」而不是纯图形
【约束】1) 送达时间、距离右对齐，方便纵向扫读；2) 优惠标签最多 3 个；3) 列表项之间用 1px 分割线而不是卡片，提高密度`,
  design: {
    purpose: '本地生活类首页的核心是「位置 + 筛选」：地址决定能看到什么，吸顶筛选决定能不能快速选出来。',
    when: ['外卖、生鲜到家、跑腿', '团购、到店服务、本地商户聚合'],
    avoid: ['不依赖位置的线上服务', '商家很少（< 10 家）的平台，筛选条反而多余'],
    tips: ['筛选条一定要吸顶，否则用户滚下去就找不到了', '多个筛选条件是「并且」关系，要在空结果时给出口', '评分 + 送达时间 + 配送费是用户最看重的三个数字，放在同一视线内']
  }
};

/* ---------------- 3. 社交动态 ---------------- */
const posts = [
  { n: '林小北', t: '12 分钟前', x: '周末去了趟千岛湖，水真的好清 🌊 推荐骑行环湖线，一圈下来刚好看日落。', img: ['🏞️', '🚴', '🌅'], like: 128, cm: 23 },
  { n: '设计周刊', t: '1 小时前', x: '本周 5 个值得收藏的界面细节：空状态插画、按钮按下的微动效、深色模式下的阴影处理…', img: ['🎨'], like: 342, cm: 56 },
  { n: '周一一', t: '3 小时前', x: '第一次做的戚风蛋糕，居然没塌！🎂', img: [], like: 57, cm: 9 }
];
const social = {
  id: 'social', name: '社交动态', cat: '移动 APP', frame: 'phone',
  brief: '顶部频道 + 快拍头像 + 发布入口 + 信息流（点赞 / 评论 / 分享）',
  uses: ['ui-tabs', 'ui-avatar', 'ui-bottom-nav'],
  html: `<div class="t-screen t-social">
<div class="t-scr" tabindex="0" role="region" aria-label="社交动态内容">
<div class="t-top t-social__top"><ui-tabs items="关注,推荐,同城" active="1"></ui-tabs>
<button class="t-icobtn" aria-label="通知，有新消息">🔔<span class="t-dot" aria-hidden="true"></span></button></div>
<div class="t-hs t-social__stories">
<button class="t-social__story t-social__story--me"><span class="t-social__ring" aria-hidden="true"><ui-avatar name="我"></ui-avatar><b>＋</b></span>我的<span class="t-sr">，发布快拍</span></button>
${['林小北', '周一一', '阿杰', '设计周刊', '王小美', 'Momo'].map((n) => '<button class="t-social__story" data-story><span class="t-social__ring" aria-hidden="true"><ui-avatar name="' + n + '"></ui-avatar></span>' + n + '<span class="t-sr" data-st>的快拍，未读</span></button>').join('')}
</div>
<button class="t-social__compose t-panel"><ui-avatar name="我" size="sm"></ui-avatar><span class="t-sub">分享新鲜事…</span><span aria-hidden="true">🖼️</span></button>
<div class="t-social__feed">${posts.map((p) =>
    '<article class="t-social__post t-panel"><header class="t-social__ph"><ui-avatar name="' + p.n + '"></ui-avatar><div><b>' + p.n + '</b><div class="t-sub">' + p.t + '</div></div>' +
    '<button class="t-more" aria-label="更多操作">⋯</button></header><p>' + p.x + '</p>' +
    (p.img.length ? '<div class="t-social__imgs t-social__imgs--' + p.img.length + '">' + p.img.map((e) => ph(e, p.n + ' 分享的图片')).join('') + '</div>' : '') +
    '<footer class="t-social__act"><button data-like aria-pressed="false" data-n="' + p.like + '">🤍 <span>' + p.like + '</span><span class="t-sr"> 赞</span></button>' +
    '<button>💬 ' + p.cm + '<span class="t-sr"> 条评论</span></button><button>↗ 分享</button></footer></article>').join('')}</div>
</div>
${nav([{ icon: '🏠', label: '首页' }, { icon: '🧭', label: '发现' }, { icon: '➕', label: '发布' }, { icon: '💬', label: '消息', badge: '5' }, { icon: '👤', label: '我' }], 0, '社交底部导航')}
</div>`,
  css: `
.t-social__top{display:flex;align-items:center;gap:8px;padding:6px 10px 0 4px;border-bottom:var(--ui-border-w) solid var(--ui-line)}
.t-social__top ui-tabs{flex:1;min-width:0;display:block}
.t-social__top .ui-tabs{border-bottom:0}
.t-social__stories{padding:12px 14px 10px}
.t-social__story{display:flex;flex-direction:column;align-items:center;gap:4px;width:62px;border:0;background:none;cursor:pointer;font-size:11px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-radius:var(--ui-radius-sm)}
.t-social__ring{position:relative;display:grid;place-items:center;width:56px;height:56px;border-radius:50%;
  background:conic-gradient(var(--ui-brand),var(--ui-danger),var(--ui-warn),var(--ui-brand));padding:3px}
.t-social__ring ui-avatar{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:var(--ui-bg);padding:2px}
.t-social__story.seen .t-social__ring{background:var(--ui-line)}
.t-social__story--me .t-social__ring{background:var(--ui-line)}
.t-social__ring b{position:absolute;right:-1px;bottom:-1px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;
  background:var(--ui-brand);color:var(--ui-brand-ink);font-size:13px;border:2px solid var(--ui-bg)}
.t-social__compose{display:flex;align-items:center;gap:10px;margin:2px 14px 12px;padding:10px 12px;width:calc(100% - 28px);cursor:pointer;text-align:left}
.t-social__compose .t-sub{flex:1}
.t-social__feed{display:flex;flex-direction:column;gap:10px;padding:0 14px 16px}
.t-social__post{padding:12px}
.t-social__ph{display:flex;align-items:center;gap:10px}
.t-social__ph > div{flex:1;min-width:0}
.t-social__post p{margin:8px 0;font-size:13.5px;line-height:1.65}
.t-social__imgs{display:grid;gap:4px}
.t-social__imgs .t-ph{aspect-ratio:1/1;border-radius:var(--ui-radius-sm)}
.t-social__imgs--1 .t-ph{aspect-ratio:16/9;font-size:44px}
.t-social__imgs--2{grid-template-columns:1fr 1fr}
.t-social__imgs--3{grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr}
.t-social__imgs--3 .t-ph:first-child{grid-row:span 2;aspect-ratio:auto}
.t-social__act{display:flex;justify-content:space-around;margin-top:8px;padding-top:6px;border-top:1px dashed var(--ui-line)}
.t-social__act button{border:0;background:none;cursor:pointer;padding:6px 10px;font-size:12.5px;border-radius:var(--ui-radius-sm);color:var(--ui-sub)}
.t-social__act button[aria-pressed="true"]{color:var(--ui-danger);font-weight:600}
.t-social__act button:hover{background:var(--ui-panel-2)}`,
  init(root) {
    root.addEventListener('click', function (e) {
      /* 点赞：切换状态、数字 ±1、心形变红；减少动效模式下不播放弹跳 */
      const like = e.target.closest('[data-like]');
      if (like) {
        const on = like.getAttribute('aria-pressed') !== 'true';
        const n = Number(like.dataset.n) + (on ? 1 : 0);
        like.setAttribute('aria-pressed', String(on));
        like.innerHTML = (on ? '❤️ ' : '🤍 ') + '<span>' + n + '</span><span class="t-sr"> 赞</span>';
        if (on && like.animate && document.documentElement.dataset.motion !== 'reduce') {
          like.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 260 });
        }
        return;
      }
      /* 看过的快拍：彩色圆环变灰 */
      const story = e.target.closest('[data-story]');
      if (story) {
        story.classList.add('seen');
        story.querySelector('[data-st]').textContent = '的快拍，已看';
      }
    });
    /* 频道切换：真实项目里在这里请求对应的信息流；这里只滚回顶部 */
    root.querySelector('ui-tabs').addEventListener('change', function () {
      root.querySelector('.t-scr').scrollTo({ top: 0 });
    });
  },
  ai: `【模板】社交动态首页 · 移动 APP（375 宽）
【页面目标】让用户「刷」：快拍承担即时性，信息流承担沉浸感，发布入口要随手可达
【整体结构】从上到下：
  1) 吸顶频道：ui-tabs（关注 / 推荐 / 同城，默认推荐）+ 右侧通知铃铛（有新消息时红点）
  2) 快拍头像横滑：第一个是「我的」（带 ＋ 号）；其余头像外圈是品牌色到警示色的锥形渐变圆环，看过后变灰
  3) 发布入口：小头像 + 「分享新鲜事…」+ 图片图标，整行可点
  4) 信息流卡片：头像 + 昵称 + 时间 + ⋯ 更多；正文（行高 1.65）；图片 1 张 16:9 / 2 张并排 / 3 张「左大右二」；底部操作栏 点赞 / 评论 / 分享
  5) 底部导航：首页 / 发现 / 发布 / 消息（角标）/ 我
【操作逻辑】
  1) 点赞 → 心形变红、数字 +1、轻微放大回弹；再点取消
  2) 点快拍 → 全屏查看；返回后该头像圆环变灰
  3) 切换频道 → 信息流滚回顶部并刷新；下拉刷新、上拉加载更多
  4) 点 ⋯ → 底部操作菜单（不感兴趣 / 举报 / 复制链接）
【无障碍】点赞按钮用 aria-pressed；数字后面补「赞」「条评论」的视觉隐藏文字；快拍按钮里用视觉隐藏文字标明「未读 / 已看」（头像设 aria-hidden，避免读两遍名字）
【约束】1) 操作栏图标按钮最小 44×44 可点区域；2) 正文超过 6 行折叠「展开」；3) 图片圆角比卡片小一级`,
  design: {
    purpose: '以内容消费为主的首页。顶部轻、内容重，所有操作都在拇指范围内。',
    when: ['社区、兴趣社交、朋友圈类产品', '企业内部动态 / 公告流'],
    avoid: ['工具型产品（用户是来办事的，不是来刷的）', '需要严格时间顺序的场景（用时间线组件更合适）'],
    tips: ['点赞反馈要即时（乐观更新），失败再回滚', '「看过」的状态要可见，否则用户会反复点', '三图布局「左大右二」比九宫格更有节奏感']
  }
};

/* ---------------- 4. 银行 / 理财 ---------------- */
const TREND = { '7 天': '8,9,8.6,9.4,9.1,10.2,10.8', '30 天': '6,6.4,7.1,6.8,7.5,8.2,8,8.9,9.3,9.1,9.8,10.8', '1 年': '3,3.6,4.2,4,5.1,5.8,6.6,7.2,8.1,8.8,9.6,10.8' };
const bank = {
  id: 'bank', name: '银行 / 理财', cat: '移动 APP', frame: 'phone',
  brief: '资产卡（可隐藏金额）+ 快捷功能 + 收益走势 + 资产分布 + 最近交易',
  uses: ['ui-avatar', 'ui-segmented', 'ui-sparkline', 'ui-progress', 'ui-list', 'ui-bottom-nav'],
  html: `<div class="t-screen t-bank">
<div class="t-scr" tabindex="0" role="region" aria-label="理财首页内容">
<div class="t-bank__hi"><ui-avatar name="林"></ui-avatar><div><div class="t-sub">下午好</div><b>林先生</b></div>
<button class="t-icobtn" aria-label="客服">🎧</button><button class="t-icobtn" aria-label="消息，有新消息">🔔<span class="t-dot" aria-hidden="true"></span></button></div>
<section class="t-bank__card" aria-label="总资产">
<div class="t-bank__row"><span>总资产（元）</span><button class="t-bank__eye" data-eye aria-pressed="false" aria-label="隐藏金额">👁</button></div>
<div class="t-bank__total" data-money="128,436.52">128,436.52</div>
<div class="t-bank__row t-bank__mini"><span>昨日收益 <b data-money="+12.36">+12.36</b></span><span>累计收益 <b data-money="+3,208.40">+3,208.40</b></span></div>
</section>
<div class="t-bank__acts">${[['💸', '转账'], ['📥', '收款'], ['💳', '信用卡'], ['📱', '充值缴费']].map((x) => '<button><i aria-hidden="true">' + x[0] + '</i>' + x[1] + '</button>').join('')}</div>
<div class="t-sec"><h3>收益走势</h3><ui-segmented items="7 天,30 天,1 年" value="7 天"></ui-segmented></div>
<div class="t-bank__chart t-panel"><ui-sparkline label="累计收益（千元）" data="${TREND['7 天']}" height="70"></ui-sparkline></div>
<div class="t-sec"><h3>资产分布</h3><button class="t-more">详情 ›</button></div>
<div class="t-bank__dist t-panel">
<ui-progress value="46" label="活期 · 59,080.00" show-value></ui-progress>
<ui-progress value="32" label="稳健理财 · 41,100.00" show-value></ui-progress>
<ui-progress value="22" label="基金 · 28,256.52" show-value></ui-progress>
</div>
<div class="t-sec"><h3>最近交易</h3><button class="t-more">全部 ›</button></div>
<div class="t-bank__tx t-panel"><ui-list items='${json([{ icon: '☕', title: '星巴克', desc: '今天 09:12 · 消费', extra: '-38.00' }, { icon: '💼', title: '工资入账', desc: '11月1日 · 收入', extra: '+18,500.00' }, { icon: '🏠', title: '房租', desc: '10月30日 · 转账', extra: '-4,200.00' }])}'></ui-list></div>
<p class="t-sub t-bank__safe">🔒 资金安全由银行级加密保障</p>
</div>
${nav([{ icon: '🏠', label: '首页' }, { icon: '📈', label: '理财' }, { icon: '🧾', label: '生活' }, { icon: '👤', label: '我的' }], 0, '理财底部导航')}
</div>`,
  css: `
.t-bank__hi{display:flex;align-items:center;gap:10px;padding:12px 14px 6px}
.t-bank__hi > div{flex:1}
.t-bank__hi b{font-size:15px}
.t-bank__card{margin:8px 14px 0;padding:16px;border-radius:var(--ui-radius-lg);color:var(--ui-brand-ink);
  background:radial-gradient(160px 120px at 100% 0%,rgba(255,255,255,.22),transparent 70%),var(--ui-brand);box-shadow:var(--ui-shadow)}
.t-bank__row{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:12.5px}
.t-bank__total{font-size:28px;font-weight:700;margin:6px 0 10px;font-variant-numeric:tabular-nums;letter-spacing:.5px}
.t-bank__mini b{font-variant-numeric:tabular-nums}
.t-bank__eye{border:0;background:rgba(255,255,255,.18);color:inherit!important;border-radius:var(--ui-radius-pill);width:32px;height:28px;cursor:pointer}
.t-bank__eye:focus-visible{outline:2px solid var(--ui-brand-ink);outline-offset:2px}
.t-bank__acts{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:14px 10px 2px}
.t-bank__acts button{display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:none;cursor:pointer;font-size:12px;padding:4px 0;border-radius:var(--ui-radius-sm)}
.t-bank__acts i{font-style:normal;font-size:20px;width:46px;height:46px;display:grid;place-items:center;border-radius:var(--ui-radius-lg);background:var(--ui-brand-soft)}
.t-bank__chart,.t-bank__dist,.t-bank__tx{margin:0 14px;padding:12px}
.t-bank__chart ui-sparkline{display:block}
.t-bank__dist{display:flex;flex-direction:column;gap:10px}
.t-bank__dist ui-progress{display:block}
.t-bank__tx{padding:4px}
.t-bank__tx ui-list{display:block}
.t-bank__safe{text-align:center;margin:16px 0 18px}`,
  init(root) {
    const TREND = { '7 天': '8,9,8.6,9.4,9.1,10.2,10.8', '30 天': '6,6.4,7.1,6.8,7.5,8.2,8,8.9,9.3,9.1,9.8,10.8', '1 年': '3,3.6,4.2,4,5.1,5.8,6.6,7.2,8.1,8.8,9.6,10.8' };
    /* 隐藏金额：所有 [data-money] 换成 ****，再点恢复 */
    const eye = root.querySelector('[data-eye]');
    eye.addEventListener('click', function () {
      const hide = eye.getAttribute('aria-pressed') !== 'true';
      eye.setAttribute('aria-pressed', String(hide));
      eye.setAttribute('aria-label', hide ? '显示金额' : '隐藏金额');
      eye.textContent = hide ? '🙈' : '👁';
      root.querySelectorAll('[data-money]').forEach(function (el) { el.textContent = hide ? '****' : el.dataset.money; });
    });
    /* 切换时间范围：更新走势图数据 */
    root.querySelector('ui-segmented').addEventListener('change', function (e) {
      root.querySelector('ui-sparkline').setAttribute('data', TREND[e.detail.value]);
    });
  },
  ai: `【模板】银行 / 理财首页 · 移动 APP（375 宽）
【页面目标】一眼看清「我有多少钱、最近怎么变」，并能 1 步进入转账等高频操作；安全感优先于花哨
【整体结构】从上到下：
  1) 问候栏：头像 + 「下午好 / 姓名」+ 客服、消息图标按钮
  2) 资产卡：品牌色实底 + 右上角柔光；总资产大号数字（tabular-nums）+ 眼睛按钮隐藏金额；下方昨日收益 / 累计收益
  3) 快捷功能 4 宫格：转账 / 收款 / 信用卡 / 充值缴费（图标放在 brand-soft 圆角方块里）
  4) 收益走势：标题右侧 ui-segmented（7 天 / 30 天 / 1 年），下方 ui-sparkline 面积图
  5) 资产分布：3 条 ui-progress（活期 / 稳健理财 / 基金，带金额和占比）
  6) 最近交易：ui-list，收入 / 支出金额放右侧 extra
  7) 底部安全提示 + 底部导航（首页 / 理财 / 生活 / 我的）
【操作逻辑】
  1) 点眼睛 → 页面上所有金额同时变成 ****，状态记住（下次打开仍隐藏）
  2) 切换时间范围 → 走势图更新数据，不刷新整页
  3) 点快捷功能 → 进入对应流程；敏感操作（转账）前要求验证（指纹 / 密码）
  4) 下拉刷新资产，刷新中金额位置显示骨架，不要显示 0
【无障碍】眼睛按钮用 aria-pressed，并在 aria-label 中写明「隐藏金额 / 显示金额」；资产卡用 section + aria-label
【约束】1) 金额保留两位小数并带千分位；2) 收益正数不要用红色（各地习惯不同，统一用文字 +/-）；3) 资产卡文字用 --ui-brand-ink，保证在品牌色上可读；4) 不放广告轮播`,
  design: {
    purpose: '金融类首页的关键词是「清楚」和「安全」：一个最重要的数字、少量高频操作、可隐藏的隐私信息。',
    when: ['手机银行、钱包、理财 / 基金 APP', '企业财务、报销类应用的首页'],
    avoid: ['需要大量营销曝光的页面（会冲淡安全感）', '数据多到需要表格的专业交易终端'],
    tips: ['隐藏金额是刚需，地铁里也敢打开', '涨跌颜色有地区差异（国内红涨绿跌），用 +/- 文字更稳妥', '资产卡只放 1 个大数字，其余都降一级']
  }
};

/* ---------------- 5. 健身健康 ---------------- */
const fit = {
  id: 'fit', name: '健身健康', cat: '移动 APP', frame: 'phone',
  brief: '今日圆环 + 本周柱状图 + 训练计划横滑 + 喝水打卡',
  uses: ['ui-ring', 'ui-bar-chart', 'ui-tag', 'ui-bottom-nav'],
  html: `<div class="t-screen t-fit">
<div class="t-scr" tabindex="0" role="region" aria-label="健康首页内容">
<div class="t-fit__hd"><div><div class="t-sub">11 月 3 日 · 周二</div><h3>今天也要动起来 💪</h3></div><ui-avatar name="小周"></ui-avatar></div>
<section class="t-fit__rings t-panel" aria-label="今日活动">
<div><ui-ring value="72" size="72"></ui-ring><b>7,215</b><span class="t-sub">步数 / 10,000</span></div>
<div><ui-ring value="54" size="72" variant="warn"></ui-ring><b>324</b><span class="t-sub">千卡 / 600</span></div>
<div><ui-ring value="90" size="72" variant="success"></ui-ring><b>9</b><span class="t-sub">站立 / 10 小时</span></div>
</section>
<div class="t-sec"><h3>本周运动（分钟）</h3><button class="t-more">记录 ›</button></div>
<div class="t-fit__chart t-panel"><ui-bar-chart height="120" data='${json([{ label: '一', value: 32 }, { label: '二', value: 45 }, { label: '三', value: 0 }, { label: '四', value: 28 }, { label: '五', value: 60 }, { label: '六', value: 75 }, { label: '日', value: 20 }])}'></ui-bar-chart></div>
<div class="t-sec"><h3>今日训练</h3><button class="t-more">全部 ›</button></div>
<div class="t-hs">${[['🔥', 'HIIT 燃脂', '20 分钟 · 进阶'], ['🧘', '晨间瑜伽', '15 分钟 · 入门'], ['🏃', '5 公里慢跑', '35 分钟 · 户外']].map((x) =>
    '<article class="t-fit__plan t-panel">' + ph(x[0], x[1] + ' 封面', '', 'height:80px') + '<b>' + x[1] + '</b><span class="t-sub">' + x[2] + '</span>' +
    '<button data-start aria-label="开始 ' + x[1] + '">开始</button></article>').join('')}</div>
<div class="t-sec"><h3>喝水打卡</h3><span class="t-sub" data-water-txt aria-live="polite">已喝 3 / 8 杯</span></div>
<div class="t-fit__water" role="group" aria-label="喝水打卡，点击杯子记录">${Array.from({ length: 8 }, (_, i) => '<button data-cup aria-pressed="' + (i < 3) + '" aria-label="第 ' + (i + 1) + ' 杯">' + (i < 3 ? '💧' : '○') + '</button>').join('')}</div>
<div style="height:16px"></div>
</div>
${nav([{ icon: '☀️', label: '今日' }, { icon: '🏋️', label: '训练' }, { icon: '👥', label: '社区' }, { icon: '👤', label: '我的' }], 0, '健康底部导航')}
</div>`,
  css: `
.t-fit__hd{display:flex;align-items:center;justify-content:space-between;padding:14px 14px 10px}
.t-fit__hd h3{margin:2px 0 0;font-size:19px}
.t-fit__rings{margin:0 14px;padding:14px 8px;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;text-align:center}
.t-fit__rings > div{display:flex;flex-direction:column;align-items:center;gap:2px}
.t-fit__rings b{font-size:16px;font-variant-numeric:tabular-nums;margin-top:4px}
.t-fit__rings .t-sub{font-size:11px}
.t-fit__chart{margin:0 14px;padding:10px 12px}
.t-fit__chart ui-bar-chart{display:block}
.t-fit__plan{width:150px;padding:8px;display:flex;flex-direction:column;gap:3px}
.t-fit__plan button{margin-top:6px;border:0;border-radius:var(--ui-radius-pill);padding:6px 0;cursor:pointer;font-weight:600;
  background:var(--ui-brand);color:var(--ui-brand-ink)!important}
.t-fit__plan button[aria-pressed="true"]{background:var(--ui-ok);color:var(--ui-on-color)!important}
.t-fit__plan button:focus-visible{outline:2px solid var(--ui-text);outline-offset:2px}
.t-fit__water{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;padding:0 14px}
.t-fit__water button{aspect-ratio:3/4;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm) var(--ui-radius-sm) var(--ui-radius) var(--ui-radius);
  background:var(--ui-panel);cursor:pointer;font-size:15px;color:var(--ui-sub)}
.t-fit__water button[aria-pressed="true"]{background:var(--ui-brand-soft);border-color:var(--ui-brand)}`,
  init(root) {
    /* 喝水：点第 n 杯 = 记录到第 n 杯；再点已喝的最后一杯 = 撤销一杯 */
    const cups = Array.from(root.querySelectorAll('[data-cup]'));
    const txt = root.querySelector('[data-water-txt]');
    cups.forEach(function (c, i) {
      c.addEventListener('click', function () {
        const done = cups.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).length;
        const n = done === i + 1 ? i : i + 1;
        cups.forEach(function (x, j) { x.setAttribute('aria-pressed', String(j < n)); x.textContent = j < n ? '💧' : '○'; });
        txt.textContent = '已喝 ' + n + ' / 8 杯' + (n === 8 ? ' 🎉' : '');
      });
    });
    /* 开始训练：按钮切换为「进行中」 */
    root.querySelectorAll('[data-start]').forEach(function (b) {
      b.addEventListener('click', function () {
        const on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(on));
        b.textContent = on ? '进行中 · 暂停' : '开始';
      });
    });
  },
  ai: `【模板】健身健康首页 · 移动 APP（375 宽）
【页面目标】用「完成度」驱动坚持：今天完成了多少、这周趋势、下一步做什么
【整体结构】从上到下：
  1) 头部：日期（次要色）+ 一句鼓励语（19px 粗体）+ 右侧头像
  2) 今日活动卡：三个 ui-ring 并排（步数 / 卡路里 / 站立），圆环下面是数值 + 「/ 目标」
  3) 本周运动：ui-bar-chart，7 根柱（一 ~ 日），休息日为 0
  4) 今日训练：横滑卡片，封面 + 名称 + 时长难度 + 「开始」胶囊按钮
  5) 喝水打卡：8 个杯子按钮，已喝的填充品牌浅色 + 💧
  6) 底部导航：今日 / 训练 / 社区 / 我的
【操作逻辑】
  1) 点第 n 个杯子 → 记录到第 n 杯；再点最后一杯 → 撤销一杯；8 杯全满显示 🎉
  2) 点「开始」→ 按钮变成「进行中 · 暂停」（ok 色）；真实项目里进入训练播放页
  3) 圆环数据每次回到前台时刷新，进度变化用动画过渡（减少动效时直接到位）
【无障碍】喝水按钮 aria-pressed + aria-label「第 n 杯」，计数文案 aria-live；圆环旁必须有数字文本，不能只靠图形
【约束】1) 三个圆环用三种语义色区分，但都附文字；2) 数字用 tabular-nums；3) 鼓励语每天轮换，避免说教`,
  design: {
    purpose: '健康类首页把「目标—进度—行动」放在一屏：先给成就感，再给下一个动作。',
    when: ['运动、健康、习惯养成类 APP', '学习打卡、任务完成度类产品'],
    avoid: ['医疗诊断类（数据需要更严谨的图表和免责声明）'],
    tips: ['圆环最多三个，多了就是仪表盘', '打卡交互要可撤销，误触很常见', '休息日柱子为 0 时仍显示刻度，别让图表「断掉」']
  }
};

/* ---------------- 6. 智能家居 ---------------- */
const devs = [
  { e: '💡', n: '客厅主灯', r: '客厅', on: true, s: '亮度 80%' },
  { e: '❄️', n: '空调', r: '客厅', on: true, s: '制冷', temp: 24 },
  { e: '📺', n: '电视', r: '客厅', on: false, s: '待机' },
  { e: '🛏️', n: '床头灯', r: '卧室', on: false, s: '已关闭' },
  { e: '🪟', n: '窗帘', r: '卧室', on: true, s: '已打开' },
  { e: '🍳', n: '油烟机', r: '厨房', on: false, s: '已关闭' }
];
const home = {
  id: 'home', name: '智能家居', cat: '移动 APP', frame: 'phone',
  brief: '家庭切换 + 一键场景 + 房间筛选 + 设备开关卡 + 用电趋势',
  uses: ['ui-chips', 'ui-switch', 'ui-sparkline', 'ui-bottom-nav'],
  html: `<div class="t-screen t-home">
<div class="t-scr" tabindex="0" role="region" aria-label="智能家居内容">
<div class="t-home__hd"><button class="t-home__fam" aria-label="切换家庭，当前：我的家">我的家 ▾</button>
<span class="t-sub">☀️ 室外 26° · 室内 24° · 湿度 48%</span></div>
<div class="t-sec"><h3>场景</h3><button class="t-more">编辑</button></div>
<div class="t-hs t-home__scenes" role="group" aria-label="一键场景">${[['🏠', '回家'], ['🚪', '离家'], ['🌙', '睡眠'], ['🎬', '观影']].map((x) => '<button data-scene="' + x[1] + '" aria-pressed="false"><i aria-hidden="true">' + x[0] + '</i>' + x[1] + '</button>').join('')}</div>
<div class="t-sec"><h3>设备 <span class="t-sub" data-count aria-live="polite"></span></h3></div>
<div class="t-home__rooms"><ui-chips single items="全部,客厅,卧室,厨房" value="全部"></ui-chips></div>
<div class="t-home__devs">${devs.map((d, i) =>
    '<div class="t-home__dev' + (d.on ? ' on' : '') + '" data-room="' + d.r + '" data-i="' + i + '"><div class="t-home__dt"><i aria-hidden="true">' + d.e + '</i><ui-switch' + (d.on ? ' checked' : '') + '><span class="t-sr">' + d.n + '</span></ui-switch></div>' +
    '<b>' + d.n + '</b><span class="t-sub" data-st>' + d.r + ' · ' + (d.on ? d.s : '已关闭') + '</span>' +
    (d.temp ? '<div class="t-home__temp"><button data-t="-1" aria-label="温度降低">−</button><b data-temp aria-live="polite">' + d.temp + '°</b><button data-t="1" aria-label="温度升高">＋</button></div>' : '') + '</div>').join('')}</div>
<div class="t-sec"><h3>今日用电</h3><span class="t-sub">8.6 kWh · 比昨天少 12%</span></div>
<div class="t-home__energy t-panel"><ui-sparkline label="每小时用电（kWh）" color="success" data="0.2,0.2,0.1,0.1,0.3,0.6,0.8,0.5,0.3,0.3,0.4,0.6,0.7,0.5" height="56"></ui-sparkline></div>
<div style="height:16px"></div>
</div>
${nav([{ icon: '🏠', label: '家' }, { icon: '✨', label: '场景' }, { icon: '🛍️', label: '商城' }, { icon: '👤', label: '我的' }], 0, '智能家居底部导航')}
</div>`,
  css: `
.t-home__hd{padding:14px 14px 0;display:flex;flex-direction:column;gap:2px}
.t-home__fam{align-self:flex-start;border:0;background:none;font-size:20px;font-weight:700;cursor:pointer;padding:0}
.t-home__scenes button{display:flex;align-items:center;gap:8px;padding:10px 14px;border:var(--ui-border-w) solid var(--ui-line);
  border-radius:var(--ui-radius-lg);background:var(--ui-panel);cursor:pointer;font-weight:600;transition:background var(--ui-motion)}
.t-home__scenes i{font-style:normal;font-size:18px}
.t-home__scenes button[aria-pressed="true"]{background:var(--ui-brand);border-color:var(--ui-brand);color:var(--ui-brand-ink)}
.t-home__rooms{padding:0 14px 10px}
.t-home__rooms ui-chips{display:block}
.t-home__devs{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 14px}
.t-home__dev{padding:12px;display:flex;flex-direction:column;gap:2px;border-radius:var(--ui-radius-lg);background:var(--ui-panel);
  border:var(--ui-border-w) solid var(--ui-line);box-shadow:var(--ui-shadow-sm);transition:background var(--ui-motion),border-color var(--ui-motion)}
.t-home__dev[hidden]{display:none}
.t-home__dev.on{background:var(--ui-brand-soft);border-color:color-mix(in srgb,var(--ui-brand) 40%,var(--ui-line))}
.t-home__dt{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.t-home__dt i{font-style:normal;font-size:24px}
.t-home__dev .t-sub{font-size:11.5px}
.t-home__dev.on .t-sub{color:var(--ui-text)}
.t-home__temp{display:flex;align-items:center;justify-content:space-between;margin-top:8px}
.t-home__temp button{width:28px;height:28px;border-radius:50%;border:var(--ui-border-w) solid var(--ui-line);background:var(--ui-panel);cursor:pointer}
.t-home__temp b{font-size:18px;font-variant-numeric:tabular-nums}
.t-home__dev:not(.on) .t-home__temp{opacity:.45;pointer-events:none}
.t-home__energy{margin:0 14px;padding:10px 12px}
.t-home__energy ui-sparkline{display:block}`,
  init(root) {
    const SCENES = { 回家: [1, 1, 0, 0, 1, 0], 离家: [0, 0, 0, 0, 0, 0], 睡眠: [0, 1, 0, 1, 0, 0], 观影: [0, 1, 1, 0, 0, 0] };
    const STATUS = ['亮度 80%', '制冷', '播放中', '暖光 30%', '已打开', '低档'];
    const cards = Array.from(root.querySelectorAll('.t-home__dev'));
    function setDev(card, on) {
      const i = Number(card.dataset.i);
      card.classList.toggle('on', on);
      const sw = card.querySelector('ui-switch');
      if (on) sw.setAttribute('checked', ''); else sw.removeAttribute('checked');
      card.querySelector('[data-st]').textContent = card.dataset.room + ' · ' + (on ? STATUS[i] : '已关闭');
    }
    function count() {
      root.querySelector('[data-count]').textContent = cards.filter(function (c) { return c.classList.contains('on'); }).length + ' 台运行中';
    }
    /* 单个设备开关 */
    root.addEventListener('change', function (e) {
      const card = e.target.closest('.t-home__dev');
      if (card && e.target.matches('input')) { setDev(card, e.target.checked); clearScene(); count(); }
    });
    /* 一键场景：批量设置所有设备，按钮高亮 */
    function clearScene() { root.querySelectorAll('[data-scene]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); }
    root.querySelectorAll('[data-scene]').forEach(function (b) {
      b.addEventListener('click', function () {
        const plan = SCENES[b.dataset.scene];
        cards.forEach(function (c, i) { setDev(c, !!plan[i]); });
        clearScene();
        b.setAttribute('aria-pressed', 'true');
        count();
        if (window.uiToast) window.uiToast('已执行「' + b.dataset.scene + '」场景');
      });
    });
    /* 空调温度 16-30° */
    root.addEventListener('click', function (e) {
      const t = e.target.closest('[data-t]');
      if (!t) return;
      const el = t.parentNode.querySelector('[data-temp]');
      const v = Math.max(16, Math.min(30, parseInt(el.textContent, 10) + Number(t.dataset.t)));
      el.textContent = v + '°';
    });
    /* 房间筛选 */
    root.querySelector('ui-chips').addEventListener('change', function (e) {
      const r = e.detail.value[0] || '全部';
      cards.forEach(function (c) { c.hidden = r !== '全部' && c.dataset.room !== r; });
    });
    count();
  },
  ai: `【模板】智能家居首页 · 移动 APP（375 宽）
【页面目标】「看一眼就知道家里什么开着」，并且 1 次点击完成批量控制
【整体结构】从上到下：
  1) 头部：「我的家 ▾」（切换家庭，20px 粗体）+ 一行环境信息（室外 / 室内温度、湿度）
  2) 场景横滑：回家 / 离家 / 睡眠 / 观影，胶囊卡片，当前场景用品牌色实底
  3) 设备区：标题旁显示「n 台运行中」；ui-chips 单选房间（全部 / 客厅 / 卧室 / 厨房）
  4) 设备卡双列：左上图标、右上 ui-switch；设备名 + 「房间 · 状态」；空调卡额外有 − 温度 ＋；开着的卡片背景变 brand-soft
  5) 今日用电：ui-sparkline（success 色）+ 与昨天对比
  6) 底部导航：家 / 场景 / 商城 / 我的
【操作逻辑】
  1) 拨动开关 → 卡片背景和状态文字立即变化；运行数量实时更新；手动改动后取消场景高亮
  2) 点场景 → 按预设批量开关设备，场景按钮高亮，弹提示「已执行回家场景」
  3) 温度按钮 16°-30° 之间调节；设备关闭时温度控件变灰不可点
  4) 选房间 → 只显示该房间设备
  5) 设备离线 → 卡片灰显并显示「离线」，开关 disabled
【无障碍】每个开关都有设备名作为可读标签（视觉隐藏）；温度数字 aria-live；场景按钮 aria-pressed
【约束】1) 开关是主要操作，点击区域不小于 44px；2) 状态变化不只靠颜色，状态文字同步变化；3) 设备卡等高对齐`,
  design: {
    purpose: '设备控制类首页：状态可见 + 批量操作。场景把「十次点击」变成「一次点击」。',
    when: ['智能家居、IoT 设备管理', '办公室 / 门店设备控制面板', '机房、监控设备的状态总览（换成告警色即可）'],
    avoid: ['设备数量上百的工业场景（改用表格或分组列表）'],
    tips: ['开着的设备用浅品牌色底，扫一眼就能数出来', '场景执行要有反馈，最好能撤销', '离线状态要和「关闭」区分开']
  }
};

export const appTemplates = [shop, food, social, bank, fit, home];
