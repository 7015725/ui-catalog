/* =========================================================
   系统 APP · 原创风格灵感预览
   只使用本地示例，不接入真实设备、文件或账号。
   共享助手只生成 HTML/CSS；init(root) 始终自包含，供代码面板独立导出。
   ========================================================= */

import { json } from './templates-shared.js';

// 按钮结构由组件库提供，模板只保留场景属性与 slot 内容。
function componentButtons(html) {
  return html.replace(/<button\b([^>]*)>/g, function (_, attributes) {
    const pairs = Array.from(attributes.matchAll(/\s+([\w:-]+)(?:\s*=\s*"([^"]*)")?/g), function (match) {
      return [match[1], match[2] || ''];
    });
    const data = JSON.stringify(pairs).replace(/&/g, '&amp;').replace(/'/g, '&#39;');
    return '<ui-button data-button-attrs=\'' + data + '\'>';
  }).replace(/<\/button>/g, '</ui-button>');
}

function scopedTemplateCSS(id, css) {
  const root = '.t-' + id;
  return css.replace(/(^|\n)(\.t-[^{}\n]+)\{/g, function (_, line, selector) {
    return line + (selector.startsWith(root + '__') ? root + ' ' + selector : selector) + '{';
  });
}

// 每套模板都带一份完整的作用域基础样式，不要求其它系统模板在场。
function mobileCSS(id) {
  const s = '.t-' + id;
  return `
${s},${s} *{box-sizing:border-box}
${s}{text-shadow:none;font-size:var(--ui-font-size-14px)}
${s} [hidden]{display:none!important}
${s} h1,${s} h2,${s} h3,${s} p{margin:0}
${s} button,${s} summary{touch-action:manipulation}
${s} button{min-height:var(--ui-ctl-h);min-width:var(--ui-ctl-h);font:inherit;cursor:pointer}
${s} :is(button,summary,input):focus-visible{outline:var(--ui-size-2px) solid var(--ui-brand);outline-offset:var(--ui-space-3px)}
${s} summary{min-height:var(--ui-ctl-h);cursor:pointer;list-style:none}
${s} summary::-webkit-details-marker{display:none}
${s} ui-input,${s} ui-progress{display:block;min-width:0}
${s} ui-button{display:contents}
${s} .ui-btn{height:auto;min-height:var(--ui-ctl-h);min-width:var(--ui-ctl-h);font:inherit;white-space:normal;
  background:none;border:0;box-shadow:none;padding:0;color:inherit;letter-spacing:normal;text-transform:none}
${s} .ui-btn::before{content:none}
${s} .ui-field{min-width:0}
${s}.t-screen .ui-input{height:var(--ui-ctl-h);border-radius:var(--ui-radius);border-color:var(--ui-line);background:var(--ui-panel-2);box-shadow:none}
${s}.t-screen .ui-input:focus{background:var(--ui-panel);border-color:var(--ui-brand);box-shadow:var(--ui-ring)}
/* 已有祖先风格的品牌标签修饰不应穿透局部模板。 */
${s}.t-screen .ui-tag--brand{color:var(--ui-brand)}
${s} .ui-switch{min-height:var(--ui-ctl-h);min-width:var(--ui-ctl-h);justify-content:center}
${s} .ui-switch__track::after{box-shadow:var(--ui-shadow-sm)}
${s} .ui-check{min-height:var(--ui-ctl-h)}
${s} .m-eyebrow{font-size:var(--ui-font-size-11px);letter-spacing:var(--ui-letter-spacing--09em);color:var(--ui-sub)}
${s} .m-caption{color:var(--ui-sub);font-size:var(--ui-font-size-12px);line-height:var(--ui-line-height-1-6)}
${s} .m-chip{padding:0 var(--ui-space-15px);border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-pill);background:var(--ui-panel);color:var(--ui-sub);white-space:nowrap}
${s} .m-chip[aria-pressed="true"]{background:var(--ui-brand-soft);color:var(--ui-brand);border-color:var(--ui-brand)}
${s} .m-primary{border:0;border-radius:var(--ui-radius-pill);padding:0 var(--ui-space-20px);background:var(--ui-brand);color:var(--ui-brand-ink);font-weight:var(--ui-font-weight-600)}
${s} .m-empty{padding:var(--ui-space-32px) var(--ui-space-20px);color:var(--ui-sub);text-align:center;line-height:var(--ui-line-height-1-7)}
${s} .m-feedback{font-size:var(--ui-font-size-12px);line-height:var(--ui-line-height-1-6);color:var(--ui-sub)}
${s} .m-footnote{padding:var(--ui-space-18px) var(--ui-space-20px) var(--ui-space-22px);font-size:var(--ui-font-size-10-5px);color:var(--ui-sub);line-height:var(--ui-line-height-1-7)}
@media(prefers-reduced-motion:reduce){${s} *,${s} *::before,${s} *::after{transition:none!important;animation:none!important}}
${s}:where([data-motion="reduce"] *) *,${s}:where([data-motion="reduce"] *) *::before,${s}:where([data-motion="reduce"] *) *::after{transition:none!important;animation:none!important}
`;
}

/* ---------------- MIUI / HyperOS · Configure ---------------- */
const miui = {
  id: 'miui-settings', name: 'MIUI / HyperOS · 系统设置', cat: '系统 APP', frame: 'phone', style: 'miui',
  brief: '大标题 + 设备概览 + 分组设置，搜索与开关即时反馈',
  uses: ['ui-input', 'ui-switch', 'ui-accordion'],
  html: `<div class="t-screen t-miui-settings">
<div class="t-scr" tabindex="0" role="region" aria-label="系统设置内容">
<header class="t-miui-settings__head"><p class="m-eyebrow">本地示例 · 设备与偏好</p><h1>设置</h1>
<ui-input data-search type="search" label="搜索设置" placeholder="搜索连接、通知或显示"></ui-input></header>
<ui-accordion class="t-miui-settings__device" open="0" items='${json([{ title: "<span class=\"t-miui-settings__phone\" aria-hidden=\"true\"></span><span><b>我的演示手机</b><small>本地配置概览</small></span><span aria-hidden=\"true\">＋</span>", content: "<dl><div><dt>设备</dt><dd>演示机型 A</dd></div><div><dt>系统</dt><dd>原创预览，不是官方界面</dd></div><div><dt>数据</dt><dd>仅保留在当前页面</dd></div></dl>" }])}'></ui-accordion>
<section class="t-miui-settings__group" data-setting-group aria-label="连接设置"><h2>连接</h2><div class="t-miui-settings__rows">
<div class="t-miui-settings__row" data-setting="无线局域网" data-search-text="无线局域网 网络 WLAN Wi-Fi 连接"><span class="t-miui-settings__icon" aria-hidden="true">⌁</span><span class="t-miui-settings__label"><b>无线局域网</b><small data-state>已开启 · 演示网络</small></span><ui-switch checked><span class="t-sr">无线局域网</span></ui-switch></div>
<div class="t-miui-settings__row" data-setting="蓝牙" data-search-text="蓝牙 Bluetooth 连接"><span class="t-miui-settings__icon" aria-hidden="true">⋈</span><span class="t-miui-settings__label"><b>蓝牙</b><small data-state>已关闭</small></span><ui-switch><span class="t-sr">蓝牙</span></ui-switch></div>
</div></section>
<section class="t-miui-settings__group" data-setting-group aria-label="偏好设置"><h2>个人偏好</h2><div class="t-miui-settings__rows">
<div class="t-miui-settings__row" data-setting="通知提醒" data-search-text="通知提醒 消息 声音"><span class="t-miui-settings__icon" aria-hidden="true">○</span><span class="t-miui-settings__label"><b>通知提醒</b><small data-state>已开启</small></span><ui-switch checked><span class="t-sr">通知提醒</span></ui-switch></div>
<div class="t-miui-settings__row" data-setting="护眼显示" data-search-text="护眼显示 屏幕 亮度"><span class="t-miui-settings__icon" aria-hidden="true">◐</span><span class="t-miui-settings__label"><b>护眼显示</b><small data-state>已关闭</small></span><ui-switch><span class="t-sr">护眼显示</span></ui-switch></div>
<div class="t-miui-settings__row" data-setting="触感反馈" data-search-text="触感反馈 振动 声音"><span class="t-miui-settings__icon" aria-hidden="true">≈</span><span class="t-miui-settings__label"><b>触感反馈</b><small data-state>已开启</small></span><ui-switch checked><span class="t-sr">触感反馈</span></ui-switch></div>
</div></section>
<p class="m-empty" data-empty hidden>没有匹配的设置<br><span class="m-caption">试试「蓝牙」，或清空搜索。</span></p>
<p class="m-feedback t-miui-settings__feedback" data-feedback role="status" aria-live="polite">所有开关仅改变本地示例状态。</p>
<p class="m-footnote">MIUI / HyperOS 风格灵感 · 原创布局，非官方产品。不会修改真实手机设置。</p>
</div></div>`,
  css: mobileCSS('miui-settings') + `
.t-miui-settings__head{padding:var(--ui-space-22px) var(--ui-space-20px) var(--ui-space-16px)}
.t-miui-settings__head h1{font-size:var(--ui-font-size-36px);font-weight:var(--ui-font-weight-700);letter-spacing:var(--ui-letter-spacing-n-06em);margin:var(--ui-space-8px) 0 var(--ui-space-20px);line-height:var(--ui-line-height-1-15)}
.t-miui-settings__device{margin:0 var(--ui-space-16px) var(--ui-space-18px);background:var(--ui-brand-soft);border-radius:var(--ui-radius-lg);overflow:hidden}
.t-miui-settings__device .ui-acc__hd{display:flex;align-items:center;gap:var(--ui-space-14px);padding:var(--ui-space-18px) var(--ui-space-16px);color:var(--ui-brand)}
.t-miui-settings__device .ui-acc__hd > span:first-child{display:flex;align-items:center;gap:var(--ui-space-14px);flex:1;min-width:0}
.t-miui-settings__device .ui-acc__hd > span:first-child > span:nth-child(2){flex:1;min-width:0}
.t-miui-settings__device .ui-acc{gap:0}
.t-miui-settings__device .ui-acc__item{border:0;background:var(--ui-brand-soft);border-radius:var(--ui-radius-lg)}
.t-miui-settings__device .ui-acc__bd{padding:0}
.t-miui-settings__device .ui-acc__ico{display:none}
.t-miui-settings__device b{display:block;font-size:var(--ui-font-size-17px);letter-spacing:var(--ui-letter-spacing-n-02em)}
.t-miui-settings__device small{display:block;color:var(--ui-sub);margin-top:var(--ui-space-4px);font-size:var(--ui-font-size-12px)}
.t-miui-settings__phone{width:var(--ui-size-30px);height:var(--ui-size-46px);flex:0 0 auto;border:var(--ui-size-2px) solid var(--ui-brand);border-radius:var(--ui-radius-sm);position:relative}
.t-miui-settings__phone::after{content:'';position:absolute;bottom:var(--ui-space-4px);left:var(--ui-space-8px);right:var(--ui-space-8px);height:var(--ui-size-2px);background:var(--ui-brand);border-radius:var(--ui-radius-pill)}
.t-miui-settings__device dl{margin:0 var(--ui-space-16px) var(--ui-space-16px);border-top:var(--ui-border-w) solid var(--ui-line);padding-top:var(--ui-space-10px);color:var(--ui-text);font-size:var(--ui-font-size-12px)}
.t-miui-settings__device dl div{display:flex;justify-content:space-between;gap:var(--ui-space-10px);padding:var(--ui-space-4px) 0}
.t-miui-settings__device dt{color:var(--ui-sub)}
.t-miui-settings__device dd{margin:0;text-align:right}
.t-miui-settings__group{margin:0 var(--ui-space-16px) var(--ui-space-18px)}
.t-miui-settings__group h2{font-size:var(--ui-font-size-12px);color:var(--ui-sub);font-weight:var(--ui-font-weight-500);margin:0 var(--ui-space-4px) var(--ui-space-8px)}
.t-miui-settings__rows{background:var(--ui-panel);border-radius:var(--ui-radius-lg);padding:0 var(--ui-space-14px)}
.t-miui-settings__row{display:flex;align-items:center;gap:var(--ui-space-12px);min-height:var(--ui-size-76px);padding:var(--ui-space-8px) 0}
.t-miui-settings__row + .t-miui-settings__row{border-top:var(--ui-border-w) solid var(--ui-line)}
.t-miui-settings__icon{display:grid;place-items:center;width:var(--ui-size-32px);height:var(--ui-size-32px);flex:0 0 auto;border-radius:var(--ui-radius-sm);color:var(--ui-brand);background:var(--ui-brand-soft);font-size:var(--ui-font-size-21px)}
.t-miui-settings__label{flex:1;min-width:0}
.t-miui-settings__label b{display:block;font-size:var(--ui-font-size-14px);font-weight:var(--ui-font-weight-600)}
.t-miui-settings__label small{display:block;color:var(--ui-sub);font-size:var(--ui-font-size-11px);margin-top:var(--ui-space-3px)}
.t-miui-settings__feedback{padding:0 var(--ui-space-20px)}
`,
  init(root) {
    // 恢复的是模板自带的属性，不接收或拼接用户输入；实际控件仍由 UIButton 创建。
    root.querySelectorAll('ui-button[data-button-attrs]').forEach(function (host) {
      const button = host.querySelector('button');
      if (!button) return;
      let pairs;
      try { pairs = JSON.parse(host.getAttribute('data-button-attrs') || '[]'); } catch (_) { return; }
      if (!Array.isArray(pairs)) return;
      pairs.forEach(function (pair) {
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') return;
        const name = pair[0], value = pair[1];
        if (!/^(?:class|type|title|name|value|disabled|tabindex|data-[a-z0-9-]+|aria-[a-z0-9-]+)$/.test(name)) return;
        if (name === 'class') value.split(/\s+/).filter(Boolean).forEach(function (item) { button.classList.add(item); });
        else button.setAttribute(name, value);
      });
      const label = button.getAttribute('aria-label');
      const visible = button.textContent.replace(/\s+/g, ' ').trim();
      if (label && visible && !label.includes(visible)) button.setAttribute('aria-label', label + ' · ' + visible);
      host.removeAttribute('data-button-attrs');
    });

    const search = root.querySelector('[data-search] input');
    const rows = Array.from(root.querySelectorAll('[data-setting]'));
    const feedback = root.querySelector('[data-feedback]');
    search.addEventListener('input', function () {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      rows.forEach(function (row) {
        row.hidden = !row.dataset.searchText.toLowerCase().includes(q);
        if (!row.hidden) shown++;
      });
      root.querySelectorAll('[data-setting-group]').forEach(function (group) {
        group.hidden = !Array.from(group.querySelectorAll('[data-setting]')).some(function (row) { return !row.hidden; });
      });
      root.querySelector('[data-empty]').hidden = shown > 0;
      feedback.textContent = '找到 ' + shown + ' 项本地示例设置';
    });
    root.addEventListener('change', function (event) {
      if (!event.target?.matches?.('input[role="switch"]') || !root.contains(event.target)) return;
      const row = event.target.closest('[data-setting]');
      if (!row || !root.contains(row)) return;
      const state = event.target.checked ? '已开启' : '已关闭';
      row.querySelector('[data-state]').textContent = state + (event.target.checked && row.dataset.setting === '无线局域网' ? ' · 演示网络' : '');
      feedback.textContent = row.dataset.setting + state + '（本地示例）';
    });
  },
  ai: `【模板】MIUI / HyperOS 风格灵感 · 原创系统设置 APP，Configure 表面
【页面目标】快速找到设置并修改偏好；只使用本地示例，不操作真实手机
【整体结构】上部大标题与搜索；横向设备概览可展开；连接与个人偏好分别放进浅底分组卡；底部给出状态反馈和演示说明
【布局】375 宽手机内独立滚动；标题 36px，连接项紧凑、分组间留白；禁止把所有内容做成等大的卡片
【操作逻辑】输入实时过滤设置及分组；无结果给出清空搜索的出口；开关可撤销并同步状态文字；设备概览可键盘展开
【状态】默认、搜索结果、空结果、已开启、已关闭；切换全站明暗不重建当前页面
【无障碍】搜索有 label；开关有设备名与 role=switch；区域可聚焦；反馈 aria-live=polite；触控目标至少 44px，focus-visible 清楚
【约束】仅借鉴大标题与分组的风格灵感，不复制官方页面、商标、截图；颜色/圆角/阴影只用 var(--ui-*)，无图片或字体 CDN；推荐 data-style="miui"`,
  design: {
    purpose: '把「找到偏好—改变状态—确认反馈」作为主路径，以大标题和紧凑分组建立层级。',
    when: ['手机设置、个人偏好、离线配置页', '需要快速搜索大量开关项的工具'],
    avoid: ['大数据报表、营销落地页', '把示例开关当成真实设备控制'],
    tips: ['设备概览与设置列表不同权重，不使用重复卡片网格', '筛选时隐藏空分组，同时保留搜索与空状态', '系统 APP 固定自己的风格，只跟随全站明暗；状态留在当前挂载页面']
  }
};

/* ---------------- COUI · Operate，参考 ColorOS 的卡片与胶囊形态 ---------------- */
const coui = {
  id: 'coui-files', name: 'COUI · 文件管理', cat: '系统 APP', frame: 'phone', style: 'coui',
  brief: '冷青存储概览 + 分类胶囊 + 文件列表，筛选与选中详情',
  uses: ['ui-input', 'ui-ring'],
  html: `<div class="t-screen t-coui-files">
<div class="t-scr" tabindex="0" role="region" aria-label="文件管理内容">
<header class="t-coui-files__head"><p class="m-eyebrow">本地示例 · 不读取设备文件</p><h1>文件</h1><p class="m-caption">把常用的，放在手边。</p></header>
<section class="t-coui-files__storage" aria-label="示例存储概览"><div><p class="m-caption">演示存储空间</p><h2>18.4 <small>/ 64 GB</small></h2><p class="m-caption">仅为界面示意，不是磁盘用量</p></div><ui-ring value="29" size="72"></ui-ring></section>
<div class="t-coui-files__search"><ui-input data-search type="search" label="搜索文件" placeholder="查找示例文件名"></ui-input></div>
<div class="t-coui-files__categories" role="group" aria-label="文件分类">
<button class="m-chip" data-category="all" aria-pressed="true">全部</button><button class="m-chip" data-category="document" aria-pressed="false">文档</button><button class="m-chip" data-category="image" aria-pressed="false">图片</button><button class="m-chip" data-category="audio" aria-pressed="false">音频</button><button class="m-chip" data-category="archive" aria-pressed="false">压缩包</button><button class="m-chip" data-category="video" aria-pressed="false">视频</button></div>
<div class="t-coui-files__listhead"><h2>本地示例库</h2><span class="m-caption" data-file-count>5 个文件</span></div>
<div class="t-coui-files__list">
<article class="t-coui-files__file" data-file data-category="document" data-name="项目简报.pdf" data-size="2.4 MB"><button data-file-select aria-pressed="false" aria-label="选择项目简报.pdf"><span class="t-coui-files__fileicon" aria-hidden="true">文</span><span><b>项目简报.pdf</b><small>文档 · 2.4 MB · 示例</small></span><span aria-hidden="true">›</span></button></article>
<article class="t-coui-files__file" data-file data-category="document" data-name="周末清单.txt" data-size="12 KB"><button data-file-select aria-pressed="false" aria-label="选择周末清单.txt"><span class="t-coui-files__fileicon" aria-hidden="true">文</span><span><b>周末清单.txt</b><small>文档 · 12 KB · 示例</small></span><span aria-hidden="true">›</span></button></article>
<article class="t-coui-files__file" data-file data-category="image" data-name="窗边的光.jpg" data-size="3.8 MB"><button data-file-select aria-pressed="false" aria-label="选择窗边的光.jpg"><span class="t-coui-files__fileicon" aria-hidden="true">图</span><span><b>窗边的光.jpg</b><small>图片 · 3.8 MB · 示例</small></span><span aria-hidden="true">›</span></button></article>
<article class="t-coui-files__file" data-file data-category="audio" data-name="灵感录音.m4a" data-size="1.6 MB"><button data-file-select aria-pressed="false" aria-label="选择灵感录音.m4a"><span class="t-coui-files__fileicon" aria-hidden="true">音</span><span><b>灵感录音.m4a</b><small>音频 · 1.6 MB · 示例</small></span><span aria-hidden="true">›</span></button></article>
<article class="t-coui-files__file" data-file data-category="archive" data-name="素材包.zip" data-size="8.2 MB"><button data-file-select aria-pressed="false" aria-label="选择素材包.zip"><span class="t-coui-files__fileicon" aria-hidden="true">包</span><span><b>素材包.zip</b><small>压缩包 · 8.2 MB · 示例</small></span><span aria-hidden="true">›</span></button></article>
</div>
<p class="m-empty" data-empty hidden>没有匹配的示例文件<br><span class="m-caption">清空搜索，或切换到「全部」。</span></p>
<p class="m-footnote">COUI 原创示例 · 参考 ColorOS 的卡片与胶囊形态的风格灵感，不宣称官方组件或独立规范。</p>
</div>
<footer class="t-coui-files__selection"><div data-file-detail hidden><b data-file-name></b><p class="m-caption" data-file-meta></p></div><p class="m-feedback" data-feedback role="status" aria-live="polite">选择文件可查看本地示例详情。</p></footer>
</div>`,
  css: mobileCSS('coui-files') + `
.t-coui-files__head{padding:var(--ui-space-22px) var(--ui-space-20px) var(--ui-space-16px)}
.t-coui-files__head h1{font-size:var(--ui-font-size-30px);letter-spacing:var(--ui-letter-spacing-n-04em);line-height:var(--ui-line-height-1-2);margin:var(--ui-space-8px) 0 var(--ui-space-6px)}
.t-coui-files__storage{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--ui-space-12px);align-items:center;margin:0 var(--ui-space-16px) var(--ui-space-20px);padding:var(--ui-space-20px) var(--ui-space-18px);background:var(--ui-brand-soft);border-radius:var(--ui-radius-lg)}
.t-coui-files__storage h2{font-size:var(--ui-font-size-26px);letter-spacing:var(--ui-letter-spacing-n-04em);margin:var(--ui-space-5px) 0;font-weight:var(--ui-font-weight-650);font-variant-numeric:tabular-nums}
.t-coui-files__storage h2 small{font-size:var(--ui-font-size-13px);font-weight:var(--ui-font-weight-500);color:var(--ui-sub);letter-spacing:0}
.t-coui-files__storage .m-caption:last-child{font-size:var(--ui-font-size-10px)}
.t-coui-files__search{padding:0 var(--ui-space-20px) var(--ui-space-14px)}
.t-coui-files__categories{display:flex;gap:var(--ui-space-8px);overflow-x:auto;padding:var(--ui-space-2px) var(--ui-space-20px) var(--ui-space-14px);scrollbar-width:thin}
.t-coui-files__categories button{flex:0 0 auto}
.t-coui-files__listhead{display:flex;align-items:center;justify-content:space-between;padding:var(--ui-space-8px) var(--ui-space-20px)}
.t-coui-files__listhead h2{font-size:var(--ui-font-size-13px);font-weight:var(--ui-font-weight-600)}
.t-coui-files__list{padding:0 var(--ui-space-12px) var(--ui-space-8px)}
.t-coui-files__file button{width:100%;display:flex;align-items:center;gap:var(--ui-space-12px);padding:var(--ui-space-12px) var(--ui-space-8px);text-align:left;border:0;border-radius:var(--ui-radius);background:var(--ui-bg)}
.t-coui-files__file + .t-coui-files__file{border-top:var(--ui-border-w) solid var(--ui-line)}
.t-coui-files__file button[aria-pressed="true"]{background:var(--ui-brand-soft)}
.t-coui-files__file button > span:nth-child(2){flex:1;min-width:0}
.t-coui-files__file b{display:block;font-size:var(--ui-font-size-14px);font-weight:var(--ui-font-weight-600);overflow-wrap:anywhere}
.t-coui-files__file small{display:block;font-size:var(--ui-font-size-11px);color:var(--ui-sub);margin-top:var(--ui-space-3px)}
.t-coui-files__fileicon{display:grid;place-items:center;width:var(--ui-size-40px);height:var(--ui-size-46px);flex:0 0 auto;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius-sm);background:var(--ui-panel);color:var(--ui-brand);font-size:var(--ui-font-size-14px)}
.t-coui-files__selection{padding:var(--ui-space-14px) var(--ui-space-20px) var(--ui-space-18px);background:var(--ui-panel);border-top:var(--ui-border-w) solid var(--ui-line);flex:0 0 auto}
.t-coui-files__selection b{font-size:var(--ui-font-size-14px);font-weight:var(--ui-font-weight-600);overflow-wrap:anywhere}
.t-coui-files__selection [data-file-detail]{margin-bottom:var(--ui-space-6px)}
`,
  init(root) {
    // 恢复的是模板自带的属性，不接收或拼接用户输入；实际控件仍由 UIButton 创建。
    root.querySelectorAll('ui-button[data-button-attrs]').forEach(function (host) {
      const button = host.querySelector('button');
      if (!button) return;
      let pairs;
      try { pairs = JSON.parse(host.getAttribute('data-button-attrs') || '[]'); } catch (_) { return; }
      if (!Array.isArray(pairs)) return;
      pairs.forEach(function (pair) {
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') return;
        const name = pair[0], value = pair[1];
        if (!/^(?:class|type|title|name|value|disabled|tabindex|data-[a-z0-9-]+|aria-[a-z0-9-]+)$/.test(name)) return;
        if (name === 'class') value.split(/\s+/).filter(Boolean).forEach(function (item) { button.classList.add(item); });
        else button.setAttribute(name, value);
      });
      const label = button.getAttribute('aria-label');
      const visible = button.textContent.replace(/\s+/g, ' ').trim();
      if (label && visible && !label.includes(visible)) button.setAttribute('aria-label', label + ' · ' + visible);
      host.removeAttribute('data-button-attrs');
    });

    const files = Array.from(root.querySelectorAll('[data-file]'));
    const categories = Array.from(root.querySelectorAll('button[data-category]'));
    const search = root.querySelector('[data-search] input');
    const detail = root.querySelector('[data-file-detail]');
    const feedback = root.querySelector('[data-feedback]');
    let category = 'all';
    let selected = null;
    function apply() {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      files.forEach(function (file) {
        file.hidden = (category !== 'all' && file.dataset.category !== category) || !file.dataset.name.toLowerCase().includes(q);
        if (!file.hidden) shown++;
      });
      if (selected && selected.hidden) selected = null;
      files.forEach(function (file) { file.querySelector('[data-file-select]').setAttribute('aria-pressed', String(file === selected)); });
      detail.hidden = !selected;
      root.querySelector('[data-empty]').hidden = shown > 0;
      root.querySelector('[data-file-count]').textContent = shown + ' 个文件';
      const label = categories.find(function (button) { return button.dataset.category === category; }).textContent;
      feedback.textContent = label + ' · 找到 ' + shown + ' 个本地示例文件';
    }
    categories.forEach(function (button) {
      button.addEventListener('click', function () {
        category = button.dataset.category;
        categories.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
        apply();
      });
    });
    search.addEventListener('input', apply);
    root.addEventListener('click', function (event) {
      const button = event.target.closest('[data-file-select]');
      if (!button || !root.contains(button)) return;
      const file = button.closest('[data-file]');
      if (!file || !root.contains(file)) return;
      selected = file === selected ? null : file;
      apply();
      if (selected) {
        root.querySelector('[data-file-name]').textContent = selected.dataset.name;
        root.querySelector('[data-file-meta]').textContent = selected.dataset.size + ' · 本地示例，不读取或上传真实文件';
        feedback.textContent = '已选择 ' + selected.dataset.name + '（本地示例）';
      }
    });
  },
  ai: `【模板】COUI 文件管理 · 参考 ColorOS 的卡片与胶囊形态的原创示例，Operate 表面
【页面目标】浏览和筛选本地示例库；不读取文件系统、不上传、不宣称官方组件
【整体结构】轻标题；圆润存储概览，比例环只表示演示空间；搜索；横滑分类胶囊；细分隔文件列表；下方固定选中文件详情
【布局】冷青与浅灰不透明层级，不依赖 blur；存储卡横向组合，列表保持密度；375 宽独立滚动
【操作逻辑】类别与搜索按并且关系过滤；分类胶囊同步 aria-pressed；空结果给清空搜索或全部分类出口；文件选择/取消选择改变下方详情；被筛走的选择清除
【状态】全部、分类、组合搜索、空结果、选中与取消；数量与读屏反馈同步
【无障碍】搜索有 label；整行文件按钮与分类目标至少 44px；按钮有名称和 pressed；aria-live=polite 宣布结果；焦点可见
【约束】COUI 命名不代表已核实的独立官方设计规范；仅参考 ColorOS 风格灵感，不复制品牌/官方屏幕；所有数据明确本地示例，颜色/圆角/阴影只用 var(--ui-*)，推荐 data-style="coui"`,
  design: {
    purpose: '以存储概览建立上下文，以分类与列表支撑真正的文件操作路径。',
    when: ['移动文件管理、素材选择器', '少量本地示例内容的浏览与筛选'],
    avoid: ['把空间数字宣称为真实磁盘数据', '把 COUI 命名称作独立官方组件规范'],
    tips: ['参考 ColorOS 的卡片与胶囊形态，不复制官方屏幕', '通透感来自冷青色面与留白，不叠加毛玻璃', '选中详情在拇指区可见，过滤隐藏选中项时同步取消选择']
  }
};

/* ---------------- One UI · Operate：上观览，下交互 ---------------- */
const oneui = {
  id: 'oneui-tasks', name: 'One UI · 提醒事项', cat: '系统 APP', frame: 'phone', style: 'oneui',
  brief: '宽松观览区 + 下部任务区，勾选同步剩余数量与进度',
  uses: ['ui-checkbox', 'ui-segmented', 'ui-progress'],
  html: `<div class="t-screen t-oneui-tasks">
<header class="t-oneui-tasks__head"><p class="m-eyebrow">本地示例 · 今日清单</p><h1>提醒事项</h1><p class="t-oneui-tasks__remaining">还剩 <b data-remaining>3</b> 件小事</p><p class="m-caption">按自己的节奏，一件一件完成。</p></header>
<div class="t-scr t-oneui-tasks__reach" tabindex="0" role="region" aria-label="提醒事项任务区">
<div class="t-oneui-tasks__filter"><ui-segmented items="全部,待办,已完成" value="全部"></ui-segmented></div>
<div class="t-oneui-tasks__list">
<article class="t-oneui-tasks__task" data-task data-initial="false"><ui-checkbox><span class="t-oneui-tasks__tasktext"><b>整理本周的灵感</b><small>09:30 · 本地示例</small></span></ui-checkbox><span class="t-sr" data-task-state>未完成</span></article>
<article class="t-oneui-tasks__task" data-task data-initial="false"><ui-checkbox><span class="t-oneui-tasks__tasktext"><b>给绿植浇水</b><small>12:00 · 本地示例</small></span></ui-checkbox><span class="t-sr" data-task-state>未完成</span></article>
<article class="t-oneui-tasks__task" data-task data-initial="false"><ui-checkbox><span class="t-oneui-tasks__tasktext"><b>散步时听一张专辑</b><small>18:30 · 本地示例</small></span></ui-checkbox><span class="t-sr" data-task-state>未完成</span></article>
<article class="t-oneui-tasks__task done" data-task data-initial="true"><ui-checkbox checked><span class="t-oneui-tasks__tasktext"><b>收好桌上的书</b><small>已完成 · 本地示例</small></span></ui-checkbox><span class="t-sr" data-task-state>已完成</span></article>
</div>
<p class="m-empty" data-empty hidden>这个分组没有提醒事项<br><span class="m-caption">完成了就休息一下，或切回「全部」。</span></p>
<p class="m-footnote">One UI 风格灵感 · 原创任务与布局，非官方提醒应用。没有真实通知或系统日程。</p>
</div>
<footer class="t-oneui-tasks__footer"><ui-progress data-progress value="25" label="示例任务完成进度" show-value></ui-progress><div><p class="m-feedback" data-feedback role="status" aria-live="polite">还剩 3 件本地示例提醒</p><button data-reset aria-label="重置本地示例提醒">重置示例</button></div></footer>
</div>`,
  css: mobileCSS('oneui-tasks') + `
.t-oneui-tasks__head{flex:0 0 auto;min-height:var(--ui-size-232px);padding:var(--ui-space-54px) var(--ui-space-24px) var(--ui-space-28px);display:flex;flex-direction:column;justify-content:flex-end;gap:var(--ui-space-7px)}
.t-oneui-tasks__head h1{font-size:var(--ui-font-size-34px);font-weight:var(--ui-font-weight-700);line-height:var(--ui-line-height-1-2);letter-spacing:var(--ui-letter-spacing-n-05em)}
.t-oneui-tasks__remaining{font-size:var(--ui-font-size-20px);letter-spacing:var(--ui-letter-spacing-n-02em);margin-top:var(--ui-space-9px)!important}
.t-oneui-tasks__remaining b{font-size:var(--ui-font-size-27px);color:var(--ui-brand);font-weight:var(--ui-font-weight-650)}
.t-oneui-tasks__reach{background:var(--ui-panel);border-radius:var(--ui-radius-lg) var(--ui-radius-lg) 0 0}
.t-oneui-tasks__filter{padding:var(--ui-space-18px) var(--ui-space-18px) var(--ui-space-10px)}
.t-oneui-tasks__filter ui-segmented{display:block}
.t-oneui-tasks__filter .ui-seg{width:100%;border:0;border-radius:var(--ui-radius-pill);padding:var(--ui-space-3px)}
.t-oneui-tasks__filter .ui-seg button{flex:1;min-width:0;padding:var(--ui-space-8px);border-radius:var(--ui-radius-pill)}
.t-oneui-tasks.t-screen .ui-seg button.on{background:var(--ui-brand-soft);color:var(--ui-brand);box-shadow:none}
.t-oneui-tasks__list{padding:0 var(--ui-space-22px)}
.t-oneui-tasks__task{min-height:var(--ui-size-76px);padding:var(--ui-space-12px) 0;border-bottom:var(--ui-border-w) solid var(--ui-line)}
.t-oneui-tasks__task ui-checkbox{display:block}
.t-oneui-tasks__task .ui-check{display:flex;gap:var(--ui-space-14px);width:100%;min-height:var(--ui-size-52px)}
.t-oneui-tasks__task .ui-check > span{flex:1;min-width:0}
.t-oneui-tasks__task .ui-check input{width:var(--ui-size-22px);height:var(--ui-size-22px);border-radius:var(--ui-radius-pill);border-color:var(--ui-sub)}
.t-oneui-tasks__task .ui-check input:checked::after{left:calc(var(--ui-space-10px) - var(--ui-space-3px));top:var(--ui-space-3px);width:var(--ui-size-5px);height:var(--ui-size-11px)}
.t-oneui-tasks__tasktext b{display:block;font-size:var(--ui-font-size-15px);font-weight:var(--ui-font-weight-600);overflow-wrap:anywhere}
.t-oneui-tasks__tasktext small{display:block;margin-top:var(--ui-space-4px);font-size:var(--ui-font-size-11px);color:var(--ui-sub)}
.t-oneui-tasks__task.done b{text-decoration:line-through;color:var(--ui-sub);font-weight:var(--ui-font-weight-500)}
.t-oneui-tasks__footer{flex:0 0 auto;padding:var(--ui-space-14px) var(--ui-space-22px) var(--ui-space-20px);background:var(--ui-panel);border-top:var(--ui-border-w) solid var(--ui-line)}
.t-oneui-tasks__footer > div{display:flex;align-items:center;gap:var(--ui-space-12px);justify-content:space-between;margin-top:var(--ui-space-10px)}
.t-oneui-tasks__footer button{background:var(--ui-panel-2);border:0;border-radius:var(--ui-radius-pill);font-size:var(--ui-font-size-12px);white-space:nowrap;padding:0 var(--ui-space-14px);color:var(--ui-sub)}
`,
  init(root) {
    // 恢复的是模板自带的属性，不接收或拼接用户输入；实际控件仍由 UIButton 创建。
    root.querySelectorAll('ui-button[data-button-attrs]').forEach(function (host) {
      const button = host.querySelector('button');
      if (!button) return;
      let pairs;
      try { pairs = JSON.parse(host.getAttribute('data-button-attrs') || '[]'); } catch (_) { return; }
      if (!Array.isArray(pairs)) return;
      pairs.forEach(function (pair) {
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') return;
        const name = pair[0], value = pair[1];
        if (!/^(?:class|type|title|name|value|disabled|tabindex|data-[a-z0-9-]+|aria-[a-z0-9-]+)$/.test(name)) return;
        if (name === 'class') value.split(/\s+/).filter(Boolean).forEach(function (item) { button.classList.add(item); });
        else button.setAttribute(name, value);
      });
      const label = button.getAttribute('aria-label');
      const visible = button.textContent.replace(/\s+/g, ' ').trim();
      if (label && visible && !label.includes(visible)) button.setAttribute('aria-label', label + ' · ' + visible);
      host.removeAttribute('data-button-attrs');
    });

    const tasks = Array.from(root.querySelectorAll('[data-task]'));
    const filter = root.querySelector('ui-segmented');
    const progress = root.querySelector('[data-progress]');
    const feedback = root.querySelector('[data-feedback]');
    function apply() {
      const active = root.querySelector(':focus');
      const activeTask = active && root.contains(active) ? active.closest('[data-task]') : null;
      const selected = filter.getAttribute('value');
      let done = 0, shown = 0;
      tasks.forEach(function (task) {
        const checked = task.querySelector('input').checked;
        if (checked) done++;
        task.classList.toggle('done', checked);
        task.querySelector('[data-task-state]').textContent = checked ? '已完成' : '未完成';
        task.hidden = (selected === '待办' && checked) || (selected === '已完成' && !checked);
        if (!task.hidden) shown++;
      });
      root.querySelector('[data-remaining]').textContent = String(tasks.length - done);
      progress.setAttribute('value', String(Math.round(done / tasks.length * 100)));
      root.querySelector('[data-empty]').hidden = shown > 0;
      filter.querySelector('[role="radiogroup"]').setAttribute('aria-label', '提醒事项筛选');
      feedback.textContent = '还剩 ' + (tasks.length - done) + ' 件本地示例提醒';
      // 当前任务被筛走时先找下一项，再找上一项；空组回到仍可操作的筛选。
      if (activeTask && root.contains(activeTask) && activeTask.hidden) {
        const index = tasks.indexOf(activeTask);
        const next = tasks.slice(index + 1).concat(tasks.slice(0, index).reverse()).find(function (task) { return root.contains(task) && !task.hidden; });
        const target = next ? next.querySelector('input[type="checkbox"]') : filter.querySelector('[role="radio"][aria-checked="true"]');
        if (target && root.contains(target)) target.focus();
      }
    }
    root.addEventListener('change', function (event) {
      if (!event.target?.matches?.('input[type="checkbox"]') || !root.contains(event.target)) return;
      const task = event.target.closest('[data-task]');
      if (!task || !root.contains(task)) return;
      apply();
    });
    filter.addEventListener('change', apply);
    root.querySelector('[data-reset]').addEventListener('click', function () {
      tasks.forEach(function (task) { task.querySelector('input').checked = task.dataset.initial === 'true'; });
      filter.setAttribute('value', '全部');
      apply();
      feedback.textContent = '示例已重置，' + feedback.textContent;
    });
    apply();
  },
  ai: `【模板】One UI 风格灵感 · 原创提醒事项 APP，Operate 表面
【页面目标】先观览今天剩余事项，再在下半部轻松勾选；所有任务均为本地示例
【整体结构】上半部宽松大标题与剩余数量，下半部圆润可触达的任务区；胶囊筛选、原生可读 checkbox；底部进度与重置示例
【布局】观览区不塞按钮，交互区放在下半屏；任务区独立滚动，底部操作固定；不复制官方提醒事项页面
【操作逻辑】勾选可撤销，剩余数量/完成进度/状态文字同步；待办与已完成筛选真实过滤；全部完成时待办组显示空状态；重置恢复本地示例
【状态】未完成、已完成、全部完成、空分组；全站明暗切换保持勾选与滚动位置
【无障碍】checkbox 使用原生 label 与键盘空格；任务行至少 44px；进度暴露 aria-valuenow；反馈 aria-live=polite；焦点清楚
【约束】上观览下交互是风格灵感，不复制官方品牌或屏幕；不用图片/字体 CDN；颜色/圆角/阴影走 var(--ui-*)，推荐 data-style="oneui"`,
  design: {
    purpose: '将观看区和交互区明确分开，让大标题负责理解、下半部负责完成。',
    when: ['提醒事项、轻量任务与待办', '优先单手触达的移动操作页'],
    avoid: ['把上半部留白填成指标或广告', '实时监控与密集多列报表'],
    tips: ['上观览下交互，主路径控制在下半屏', '进度与剩余数量来自同一份 checkbox 状态', '完成状态同时用勾选、删除线与文字表达，不能只换颜色']
  }
};

/* ---------------- HarmonyOS · Operate：设备层级与拇指操作 ---------------- */
const harmonyos = {
  id: 'harmonyos-devices', name: 'HarmonyOS · 设备中心', cat: '系统 APP', frame: 'phone', style: 'harmonyos',
  brief: '主设备关系图 + 可选设备 + 底部连接控制，状态独立保留',
  uses: ['ui-tag'],
  html: `<div class="t-screen t-harmonyos-devices">
<div class="t-scr" tabindex="0" role="region" aria-label="设备中心内容">
<header class="t-harmonyos-devices__head"><p class="m-eyebrow">本地示例 · 不连接真实设备</p><h1>设备中心</h1></header>
<section class="t-harmonyos-devices__hub" aria-label="演示主设备"><div class="t-harmonyos-devices__orbit" aria-hidden="true"><span class="t-harmonyos-devices__phone"></span></div><h2>演示手机 <ui-tag variant="brand">此设备</ui-tag></h2><p class="m-caption" data-connected-count>1 个示例连接</p><span class="t-harmonyos-devices__connector" aria-hidden="true"></span></section>
<div class="t-harmonyos-devices__label"><h2>选择示例设备</h2><span class="m-caption">3 台可用</span></div>
<div class="t-harmonyos-devices__devices" role="group" aria-label="选择需要操作的示例设备">
<button data-device="headphones" data-name="轻听耳机" data-connected="true" aria-pressed="true"><span class="t-harmonyos-devices__deviceicon" aria-hidden="true">◉</span><span><b>轻听耳机</b><small data-device-state>已连接 · 本地示例</small></span><span class="t-harmonyos-devices__selected" aria-hidden="true">✓</span></button>
<button data-device="tablet" data-name="随行平板" data-connected="false" aria-pressed="false"><span class="t-harmonyos-devices__deviceicon" aria-hidden="true">▯</span><span><b>随行平板</b><small data-device-state>未连接 · 本地示例</small></span><span class="t-harmonyos-devices__selected" aria-hidden="true">✓</span></button>
<button data-device="speaker" data-name="书房音箱" data-connected="false" aria-pressed="false"><span class="t-harmonyos-devices__deviceicon" aria-hidden="true">▤</span><span><b>书房音箱</b><small data-device-state>未连接 · 本地示例</small></span><span class="t-harmonyos-devices__selected" aria-hidden="true">✓</span></button>
</div>
<p class="m-footnote">HarmonyOS 风格灵感 · 用原创设备关系与节制蓝色表达层级，不复制官方设备中心。设备名称与连接均为本地演示。</p>
</div>
<footer class="t-harmonyos-devices__operate"><div><h2 data-device-name>轻听耳机</h2><p class="m-caption" data-device-status>已连接 · 本地示例</p></div><button class="m-primary" data-connect aria-pressed="true" aria-label="断开与轻听耳机的示例连接">断开示例连接</button><p class="m-feedback" data-feedback role="status" aria-live="polite">已选择轻听耳机，所有连接仅为本地示例。</p></footer>
</div>`,
  css: mobileCSS('harmonyos-devices') + `
.t-harmonyos-devices__head{padding:var(--ui-space-22px) var(--ui-space-20px) var(--ui-space-12px)}
.t-harmonyos-devices__head h1{font-size:var(--ui-font-size-27px);letter-spacing:var(--ui-letter-spacing-n-04em);line-height:var(--ui-line-height-1-25);margin-top:var(--ui-space-7px)}
.t-harmonyos-devices__hub{display:flex;flex-direction:column;align-items:center;position:relative;margin:0 var(--ui-space-20px) var(--ui-space-4px);padding:var(--ui-space-16px) 0 0;gap:var(--ui-space-8px)}
.t-harmonyos-devices__orbit{display:grid;place-items:center;width:var(--ui-size-94px);height:var(--ui-size-94px);border-radius:var(--ui-radius-pill);border:var(--ui-border-w) solid var(--ui-line);background:var(--ui-panel-2);box-shadow:var(--ui-shadow-sm)}
.t-harmonyos-devices__phone{width:var(--ui-size-31px);height:var(--ui-size-50px);position:relative;border:var(--ui-size-2px) solid var(--ui-brand);border-radius:var(--ui-radius-sm)}
.t-harmonyos-devices__phone::after{content:'';position:absolute;left:var(--ui-space-8px);right:var(--ui-space-8px);bottom:calc(var(--ui-space-8px) - var(--ui-space-3px));height:var(--ui-size-2px);border-radius:var(--ui-radius-pill);background:var(--ui-brand)}
.t-harmonyos-devices__hub h2{display:flex;align-items:center;gap:var(--ui-space-8px);font-size:var(--ui-font-size-16px);font-weight:var(--ui-font-weight-600)}

.t-harmonyos-devices__connector{width:var(--ui-border-w);height:var(--ui-size-24px);background:var(--ui-line)}
.t-harmonyos-devices__label{display:flex;justify-content:space-between;align-items:center;padding:var(--ui-space-8px) var(--ui-space-20px)}
.t-harmonyos-devices__label h2{font-size:var(--ui-font-size-12px);font-weight:var(--ui-font-weight-600)}
.t-harmonyos-devices__devices{display:flex;flex-direction:column;gap:var(--ui-space-8px);padding:0 var(--ui-space-16px)}
.t-harmonyos-devices__devices button{display:flex;align-items:center;gap:var(--ui-space-14px);min-height:var(--ui-size-72px);padding:var(--ui-space-12px) var(--ui-space-14px);text-align:left;border:var(--ui-border-w) solid var(--ui-line);border-radius:var(--ui-radius);background:var(--ui-panel)}
.t-harmonyos-devices__devices button[aria-pressed="true"]{border-color:var(--ui-brand);background:var(--ui-brand-soft)}
.t-harmonyos-devices__devices button > span:nth-child(2){flex:1;min-width:0}
.t-harmonyos-devices__devices b{display:block;font-size:var(--ui-font-size-14px);font-weight:var(--ui-font-weight-600)}
.t-harmonyos-devices__devices small{display:block;margin-top:var(--ui-space-3px);font-size:var(--ui-font-size-11px);color:var(--ui-sub)}
.t-harmonyos-devices__deviceicon{display:grid;place-items:center;width:var(--ui-size-32px);height:var(--ui-size-40px);color:var(--ui-brand);font-size:var(--ui-font-size-27px);flex:0 0 auto}
.t-harmonyos-devices__selected{visibility:hidden;color:var(--ui-brand);font-size:var(--ui-font-size-16px)}
.t-harmonyos-devices__devices button[aria-pressed="true"] .t-harmonyos-devices__selected{visibility:visible}
.t-harmonyos-devices__operate{flex:0 0 auto;padding:var(--ui-space-16px) var(--ui-space-20px) var(--ui-space-18px);background:var(--ui-panel);border-top:var(--ui-border-w) solid var(--ui-line)}
.t-harmonyos-devices__operate h2{font-size:var(--ui-font-size-17px);font-weight:var(--ui-font-weight-600);margin-bottom:var(--ui-space-3px)}
.t-harmonyos-devices__operate button{width:100%;margin:var(--ui-space-12px) 0 var(--ui-space-10px)}
.t-harmonyos-devices__operate .m-feedback{font-size:var(--ui-font-size-11px)}
`,
  init(root) {
    // 恢复的是模板自带的属性，不接收或拼接用户输入；实际控件仍由 UIButton 创建。
    root.querySelectorAll('ui-button[data-button-attrs]').forEach(function (host) {
      const button = host.querySelector('button');
      if (!button) return;
      let pairs;
      try { pairs = JSON.parse(host.getAttribute('data-button-attrs') || '[]'); } catch (_) { return; }
      if (!Array.isArray(pairs)) return;
      pairs.forEach(function (pair) {
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') return;
        const name = pair[0], value = pair[1];
        if (!/^(?:class|type|title|name|value|disabled|tabindex|data-[a-z0-9-]+|aria-[a-z0-9-]+)$/.test(name)) return;
        if (name === 'class') value.split(/\s+/).filter(Boolean).forEach(function (item) { button.classList.add(item); });
        else button.setAttribute(name, value);
      });
      const label = button.getAttribute('aria-label');
      const visible = button.textContent.replace(/\s+/g, ' ').trim();
      if (label && visible && !label.includes(visible)) button.setAttribute('aria-label', label + ' · ' + visible);
      host.removeAttribute('data-button-attrs');
    });

    const devices = Array.from(root.querySelectorAll('[data-device]'));
    const connect = root.querySelector('[data-connect]');
    const feedback = root.querySelector('[data-feedback]');
    let selected = devices[0];
    function render(message) {
      devices.forEach(function (device) {
        device.setAttribute('aria-pressed', String(device === selected));
        device.querySelector('[data-device-state]').textContent = (device.dataset.connected === 'true' ? '已连接' : '未连接') + ' · 本地示例';
      });
      const connected = selected.dataset.connected === 'true';
      root.querySelector('[data-device-name]').textContent = selected.dataset.name;
      root.querySelector('[data-device-status]').textContent = (connected ? '已连接' : '未连接') + ' · 本地示例';
      root.querySelector('[data-connected-count]').textContent = devices.filter(function (device) { return device.dataset.connected === 'true'; }).length + ' 个示例连接';
      connect.setAttribute('aria-pressed', String(connected));
      connect.setAttribute('aria-label', (connected ? '断开示例连接' : '连接示例设备') + ' · ' + selected.dataset.name + '（本地示例）');
      connect.textContent = connected ? '断开示例连接' : '连接示例设备';
      feedback.textContent = message;
    }
    devices.forEach(function (device) {
      device.addEventListener('click', function () {
        selected = device;
        render('已选择' + device.dataset.name + '（本地示例）');
      });
    });
    connect.addEventListener('click', function () {
      const connected = selected.dataset.connected !== 'true';
      selected.dataset.connected = String(connected);
      render(selected.dataset.name + (connected ? '已连接' : '已断开') + '（本地示例，不操作真实设备）');
    });
    render('已选择' + selected.dataset.name + '，所有连接仅为本地示例。');
  },
  ai: `【模板】HarmonyOS 风格灵感 · 原创设备中心，Operate 表面
【页面目标】理解主设备与可选设备的层级，然后在拇指区域切换连接；不发现或连接真实硬件
【整体结构】节制标题；主设备示意与示例连接数量；纵向可选择设备行；底部详情与唯一连接动作
【布局】不用重复的双列卡片，主设备层级高于从设备；连接动作固定在下部，列表独立滚动；节制蓝色与不透明表面
【操作逻辑】选择设备改变详情与动作名称；选中互斥；连接/断开立即改变该设备状态及示例数量；切换设备保留各自状态；全站明暗不重建
【状态】未连接、已连接、选中；所有连接都是本地示例，不模拟网络请求或宣称真实设备在线
【无障碍】选择按钮 aria-pressed 与可读设备名；连接按钮 label 包含当前设备；状态 aria-live=polite；至少 44px 触控，键盘焦点清楚
【约束】设备关系与蓝色节制仅为风格灵感，不复制官方商标/屏幕/设备图；颜色/圆角/阴影只用 var(--ui-*)，推荐 data-style="harmonyos"`,
  design: {
    purpose: '先解释设备关系，再把当前设备的连接动作放到拇指范围内。',
    when: ['设备中心、蓝牙设备示例与 IoT 原型', '需要逐设备独立状态的移动操作页'],
    avoid: ['将演示连接当成真实硬件状态', '需要上百设备批量控制的工业场景'],
    tips: ['用层级与文字说明连接，不用装饰性网络动画', '连接动作 label 始终带当前设备名', '设备切换只更新详情，每台示例设备保留自己的连接状态']
  }
};

/* ---------------- OriginOS · Configure：大小不等的原子日程模块 ---------------- */
const originos = {
  id: 'originos-agenda', name: 'OriginOS · 原子日程', cat: '系统 APP', frame: 'phone', style: 'originos',
  brief: '日期条 + 不同跨度模块 + 今日安排，选择日期同步摘要与空状态',
  uses: ['ui-tag'],
  html: `<div class="t-screen t-originos-agenda">
<div class="t-scr" tabindex="0" role="region" aria-label="原子日程内容">
<header class="t-originos-agenda__head"><p class="m-eyebrow">本地示例 · 2026 年 11 月</p><h1>原子日程</h1></header>
<div class="t-originos-agenda__dates" role="group" aria-label="选择演示日程日期">
<button data-date="2026-11-06" data-label="11 月 6 日 · 周五" aria-label="选择 11 月 6 日的示例日程" aria-pressed="false"><span>五</span><b>6</b></button><button data-date="2026-11-07" data-label="11 月 7 日 · 周六" aria-label="选择 11 月 7 日的示例日程" aria-pressed="true"><span>六</span><b>7</b></button><button data-date="2026-11-08" data-label="11 月 8 日 · 周日" aria-label="选择 11 月 8 日的示例日程" aria-pressed="false"><span>日</span><b>8</b></button><button data-date="2026-11-09" data-label="11 月 9 日 · 周一" aria-label="选择 11 月 9 日的示例日程" aria-pressed="false"><span>一</span><b>9</b></button><button data-date="2026-11-10" data-label="11 月 10 日 · 周二" aria-label="选择 11 月 10 日的示例日程" aria-pressed="false"><span>二</span><b>10</b></button>
</div>
<div class="t-originos-agenda__grid">
<section class="t-originos-agenda__next" aria-label="当日首个示例安排"><ui-tag variant="brand">今日安排</ui-tag><p class="m-caption" data-next-time>09:00 · 第一件事</p><h2 data-next-title>晨间阅读</h2><p class="m-caption">只安排需要记住的事。</p></section>
<section class="t-originos-agenda__day" aria-label="选中的示例日期"><span class="m-caption">11 月</span><b data-date-number>7</b><span class="m-caption" data-date-week>周六</span></section>
<section class="t-originos-agenda__count" aria-label="当日示例安排数量"><b data-agenda-count>3</b><span class="m-caption">件示例安排</span></section>
<section class="t-originos-agenda__agenda" aria-label="选择日期的示例日程"><h2 data-selected-label>11 月 7 日 · 周六</h2><ol data-agenda-list>
<li class="t-originos-agenda__item" data-agenda-item><time>09:00</time><div><b>晨间阅读</b><span>翻开书，留二十分钟给自己</span></div></li><li class="t-originos-agenda__item" data-agenda-item><time>14:00</time><div><b>整理设计草稿</b><span>把零散想法放进同一份笔记</span></div></li><li class="t-originos-agenda__item" data-agenda-item><time>17:30</time><div><b>公园慢走</b><span>本地示例，不是健康建议</span></div></li>
</ol><p class="m-empty" data-empty hidden>这个日期没有示例安排<br><span class="m-caption">给今天留一点空白。</span></p></section>
</div>
<p class="m-feedback t-originos-agenda__feedback" data-feedback role="status" aria-live="polite">11 月 7 日 · 3 件本地示例安排</p>
<p class="m-footnote">OriginOS 风格灵感 · 参考早期华容网格的模块跨度，原创日程，非最新版或官方复刻。所有日期与安排均为本地示例。</p>
</div></div>`,
  css: mobileCSS('originos-agenda') + `
.t-originos-agenda__head{padding:var(--ui-space-22px) var(--ui-space-18px) var(--ui-space-14px)}
.t-originos-agenda__head h1{font-size:var(--ui-font-size-29px);letter-spacing:var(--ui-letter-spacing-n-05em);line-height:var(--ui-line-height-1-2);margin-top:var(--ui-space-7px)}
.t-originos-agenda__dates{display:flex;gap:var(--ui-space-7px);overflow-x:auto;padding:var(--ui-space-3px) var(--ui-space-18px) var(--ui-space-18px);scrollbar-width:thin}
.t-originos-agenda__dates button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--ui-space-4px);flex:1 0 var(--ui-ctl-h);padding:var(--ui-space-8px) var(--ui-space-4px);min-height:var(--ui-size-68px);border:0;border-radius:var(--ui-radius);background:var(--ui-panel-2);color:var(--ui-sub)}
.t-originos-agenda__dates span{font-size:var(--ui-font-size-11px)}
.t-originos-agenda__dates b{font-size:var(--ui-font-size-18px);font-weight:var(--ui-font-weight-600);font-variant-numeric:tabular-nums}
.t-originos-agenda__dates button[aria-pressed="true"]{background:var(--ui-brand);color:var(--ui-brand-ink)}
.t-originos-agenda__grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:var(--ui-space-10px);padding:0 var(--ui-space-16px)}
.t-originos-agenda__grid > section{border-radius:var(--ui-radius-lg);min-width:0}
.t-originos-agenda__next{grid-row:span 2;display:flex;flex-direction:column;align-items:flex-start;gap:var(--ui-space-12px);padding:var(--ui-space-20px) var(--ui-space-16px);background:var(--ui-brand-soft)}
.t-originos-agenda__next h2{font-size:var(--ui-font-size-23px);letter-spacing:var(--ui-letter-spacing-n-04em);line-height:var(--ui-line-height-1-3);overflow-wrap:anywhere;margin:auto 0}
.t-originos-agenda__next .m-caption{font-size:var(--ui-font-size-11px)}
.t-originos-agenda__day{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--ui-space-14px) var(--ui-space-8px);background:var(--ui-panel-2)}
.t-originos-agenda__day b{font-size:var(--ui-font-size-38px);font-weight:var(--ui-font-weight-500);letter-spacing:var(--ui-letter-spacing-n-07em);line-height:var(--ui-line-height-1-15);font-variant-numeric:tabular-nums}
.t-originos-agenda__count{display:flex;align-items:center;justify-content:center;gap:var(--ui-space-8px);flex-wrap:wrap;padding:var(--ui-space-14px) var(--ui-space-10px);background:var(--ui-panel)}
.t-originos-agenda__count b{font-size:var(--ui-font-size-25px);font-weight:var(--ui-font-weight-650);color:var(--ui-brand);font-variant-numeric:tabular-nums}
.t-originos-agenda__count .m-caption{font-size:var(--ui-font-size-10px)}
.t-originos-agenda__agenda{grid-column:1/-1;background:var(--ui-panel);padding:var(--ui-space-18px) var(--ui-space-16px)}
.t-originos-agenda__agenda h2{font-size:var(--ui-font-size-13px);font-weight:var(--ui-font-weight-600);margin-bottom:var(--ui-space-6px)}
.t-originos-agenda__agenda ol{list-style:none;margin:0;padding:0}
.t-originos-agenda__item{display:grid;grid-template-columns:calc(var(--ui-ctl-h) - var(--ui-size-2px)) minmax(0,1fr);gap:var(--ui-space-14px);padding:var(--ui-space-14px) 0}
.t-originos-agenda__item + .t-originos-agenda__item{border-top:var(--ui-border-w) solid var(--ui-line)}
.t-originos-agenda__item time{font-size:var(--ui-font-size-12px);color:var(--ui-brand);font-variant-numeric:tabular-nums}
.t-originos-agenda__item b{display:block;font-size:var(--ui-font-size-14px);font-weight:var(--ui-font-weight-600)}
.t-originos-agenda__item span{display:block;margin-top:var(--ui-space-4px);color:var(--ui-sub);font-size:var(--ui-font-size-11px);line-height:var(--ui-line-height-1-6)}
.t-originos-agenda__feedback{padding:var(--ui-space-14px) var(--ui-space-20px) 0}
`,
  init(root) {
    // 恢复的是模板自带的属性，不接收或拼接用户输入；实际控件仍由 UIButton 创建。
    root.querySelectorAll('ui-button[data-button-attrs]').forEach(function (host) {
      const button = host.querySelector('button');
      if (!button) return;
      let pairs;
      try { pairs = JSON.parse(host.getAttribute('data-button-attrs') || '[]'); } catch (_) { return; }
      if (!Array.isArray(pairs)) return;
      pairs.forEach(function (pair) {
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') return;
        const name = pair[0], value = pair[1];
        if (!/^(?:class|type|title|name|value|disabled|tabindex|data-[a-z0-9-]+|aria-[a-z0-9-]+)$/.test(name)) return;
        if (name === 'class') value.split(/\s+/).filter(Boolean).forEach(function (item) { button.classList.add(item); });
        else button.setAttribute(name, value);
      });
      const label = button.getAttribute('aria-label');
      const visible = button.textContent.replace(/\s+/g, ' ').trim();
      if (label && visible && !label.includes(visible)) button.setAttribute('aria-label', label + ' · ' + visible);
      host.removeAttribute('data-button-attrs');
    });

    const schedules = {
      '2026-11-06': [{ time: '16:00', title: '归档本周笔记', note: '整理之后，安心过周末' }],
      '2026-11-07': [{ time: '09:00', title: '晨间阅读', note: '翻开书，留二十分钟给自己' }, { time: '14:00', title: '整理设计草稿', note: '把零散想法放进同一份笔记' }, { time: '17:30', title: '公园慢走', note: '本地示例，不是健康建议' }],
      '2026-11-08': [{ time: '15:00', title: '整理相册', note: '选出几张喜欢的照片' }],
      '2026-11-09': [],
      '2026-11-10': [{ time: '10:00', title: '选一本新书', note: '从本地示例书单开始' }, { time: '19:00', title: '写下三个想法', note: '让灵感有地方安放' }]
    };
    const dates = Array.from(root.querySelectorAll('[data-date]'));
    const list = root.querySelector('[data-agenda-list]');
    function select(button) {
      const events = schedules[button.dataset.date] || [];
      dates.forEach(function (date) { date.setAttribute('aria-pressed', String(date === button)); });
      root.querySelector('[data-selected-label]').textContent = button.dataset.label;
      root.querySelector('[data-date-number]').textContent = button.querySelector('b').textContent;
      root.querySelector('[data-date-week]').textContent = '周' + button.querySelector('span').textContent;
      root.querySelector('[data-agenda-count]').textContent = String(events.length);
      root.querySelector('[data-next-title]').textContent = events.length ? events[0].title : '给今天留点空白';
      root.querySelector('[data-next-time]').textContent = events.length ? events[0].time + ' · 第一件事' : '自由安排';
      const items = events.map(function (event) {
        const item = root.ownerDocument.createElement('li'); item.className = 't-originos-agenda__item'; item.setAttribute('data-agenda-item', '');
        const time = root.ownerDocument.createElement('time'); time.textContent = event.time; time.dateTime = event.time;
        const body = root.ownerDocument.createElement('div');
        const title = root.ownerDocument.createElement('b'); title.textContent = event.title;
        const note = root.ownerDocument.createElement('span'); note.textContent = event.note;
        body.append(title, note); item.append(time, body); return item;
      });
      list.replaceChildren(...items);
      root.querySelector('[data-empty]').hidden = events.length > 0;
      root.querySelector('[data-feedback]').textContent = button.dataset.label + ' · ' + events.length + ' 件本地示例安排';
    }
    dates.forEach(function (button) { button.addEventListener('click', function () { select(button); }); });
    select(dates.find(function (date) { return date.getAttribute('aria-pressed') === 'true'; }));
  },
  ai: `【模板】OriginOS 风格灵感 · 原创原子日程，Configure 表面
【页面目标】选择日期，快速看见当日安排与留白；所有日期和内容均为本地示例
【整体结构】日期条；不同跨度的模块网格：下一件事占两行、日期小模块、数量模块、全宽日程；底部读屏反馈与来源说明
【布局】借鉴早期华容网格的模块跨度，不宣称最新版复刻；大小不等而非等大卡片换色；暖中性色与克制陶红，内容独立滚动
【操作逻辑】选日期改变安排列表、首项摘要、日期与数量；选择互斥；无安排的日期显示空状态，换回有安排日期恢复内容；不请求真实日历
【状态】默认示例日、其它日期、空日程；明暗切换保留日期与滚动状态
【无障碍】日期按钮有完整 label 和 aria-pressed；日期条可键盘逐项触达；反馈 aria-live=polite；列表有时间与内容文字；最小 44px 点击区域
【约束】仅取模块化网格的风格灵感，不复制官方商标、屏幕或组件；不使用图片/字体 CDN；颜色/圆角/阴影只用 var(--ui-*)，推荐 data-style="originos"`,
  design: {
    purpose: '以模块跨度区分「下一件事、日期、数量、完整安排」，让选择日期后信息一起更新。',
    when: ['轻量日程、日期配置与个人安排', '有不同信息权重的模块化移动页'],
    avoid: ['等大卡片重复堆叠', '把早期网格灵感宣称为最新官方设计'],
    tips: ['不同权重用不同跨度，不只是不同颜色', '列表与摘要由同一份本地日程数据生成', '空日程仍保留日期条，让用户随时切回']
  }
};

/* ---------------- Flyme · Explore：留白、细分隔与轻量笔记 ---------------- */
const flyme = {
  id: 'flyme-notes', name: 'Flyme · 轻量笔记', cat: '系统 APP', frame: 'phone', style: 'flyme',
  brief: '留白笔记列表 + 搜索分类 + 可撤销置顶，筛选与顺序同步',
  uses: ['ui-input'],
  html: `<div class="t-screen t-flyme-notes">
<div class="t-scr" tabindex="0" role="region" aria-label="轻量笔记内容">
<header class="t-flyme-notes__head"><p class="m-eyebrow">本地示例 · 不上传笔记</p><h1>轻记</h1><p class="m-caption">留住一些小事。</p><ui-input data-search type="search" label="搜索笔记" placeholder="标题或正文关键词"></ui-input></header>
<div class="t-flyme-notes__filters" role="group" aria-label="笔记分类与置顶筛选"><button class="m-chip" data-filter="all" aria-pressed="true">全部</button><button class="m-chip" data-filter="idea" aria-pressed="false">灵感</button><button class="m-chip" data-filter="work" aria-pressed="false">工作</button><button class="m-chip" data-filter="life" aria-pressed="false">生活</button><button class="m-chip" data-filter="pinned" aria-pressed="false">已置顶</button></div>
<div class="t-flyme-notes__list" data-note-list>
<article class="t-flyme-notes__note" data-note="walk" data-category="idea" data-order="0" data-pinned="true" data-search-text="晨间散步的想法 街角的光很适合做一张留白海报"><div><h2 data-note-title>晨间散步的想法</h2><p>街角的光很适合做一张留白海报。</p><small><span data-pin-label>置顶 · </span>11 月 7 日 · 灵感</small></div><button data-pin aria-pressed="true" aria-label="取消置顶「晨间散步的想法」"><span aria-hidden="true">↥</span></button></article>
<article class="t-flyme-notes__note" data-note="work" data-category="work" data-order="1" data-pinned="false" data-search-text="项目讨论记录 先把任务写清 再决定按钮放在哪里"><div><h2 data-note-title>项目讨论记录</h2><p>先把任务写清，再决定按钮放在哪里。</p><small><span data-pin-label hidden>置顶 · </span>11 月 6 日 · 工作</small></div><button data-pin aria-pressed="false" aria-label="置顶「项目讨论记录」"><span aria-hidden="true">↥</span></button></article>
<article class="t-flyme-notes__note" data-note="life" data-category="life" data-order="2" data-pinned="false" data-search-text="周末清单 看展 买花 整理书桌"><div><h2 data-note-title>周末清单</h2><p>看展、买花、整理书桌。</p><small><span data-pin-label hidden>置顶 · </span>11 月 5 日 · 生活</small></div><button data-pin aria-pressed="false" aria-label="置顶「周末清单」"><span aria-hidden="true">↥</span></button></article>
<article class="t-flyme-notes__note" data-note="colors" data-category="idea" data-order="3" data-pinned="false" data-search-text="一些配色碎片 青绿和暖白之间 需要一点安静的灰"><div><h2 data-note-title>一些配色碎片</h2><p>青绿和暖白之间，需要一点安静的灰。</p><small><span data-pin-label hidden>置顶 · </span>11 月 4 日 · 灵感</small></div><button data-pin aria-pressed="false" aria-label="置顶「一些配色碎片」"><span aria-hidden="true">↥</span></button></article>
</div>
<p class="m-empty" data-empty hidden>没有匹配的示例笔记<br><span class="m-caption">清空关键词，或切换到「全部」。</span></p>
<p class="m-footnote">Flyme 风格灵感 · 参考 Flyme 8 的留白与低装饰原则，原创笔记，非最新版或官方复刻。不会读取、保存或上传真实笔记。</p>
</div>
<footer class="t-flyme-notes__footer"><span class="m-caption" data-note-count>4 篇本地示例</span><p class="m-feedback" data-feedback role="status" aria-live="polite">搜索、分类与置顶只改变当前示例页面。</p></footer>
</div>`,
  css: mobileCSS('flyme-notes') + `
.t-flyme-notes{background:var(--ui-bg)}
.t-flyme-notes__head{padding:var(--ui-space-30px) var(--ui-space-24px) var(--ui-space-12px)}
.t-flyme-notes__head h1{font-size:var(--ui-font-size-34px);line-height:var(--ui-line-height-1-2);font-weight:var(--ui-font-weight-500);letter-spacing:var(--ui-letter-spacing-n-045em);margin:var(--ui-space-12px) 0 var(--ui-space-8px)}
.t-flyme-notes__head ui-input{margin-top:var(--ui-space-24px)}
.t-flyme-notes.t-screen .ui-input{background:var(--ui-bg);box-shadow:none;border-radius:var(--ui-radius-sm)}
.t-flyme-notes__filters{display:flex;gap:var(--ui-space-2px);overflow-x:auto;padding:0 var(--ui-space-18px) var(--ui-space-12px);scrollbar-width:thin;border-bottom:var(--ui-border-w) solid var(--ui-line);margin:0 var(--ui-space-6px)}
.t-flyme-notes__filters .m-chip{flex:0 0 auto;border:0;border-radius:var(--ui-radius-sm);padding:0 var(--ui-space-10px);background:none;position:relative;font-size:var(--ui-font-size-12px)}
.t-flyme-notes__filters .m-chip[aria-pressed="true"]{background:none;color:var(--ui-brand)}
.t-flyme-notes__filters .m-chip[aria-pressed="true"]::after{content:'';position:absolute;left:var(--ui-space-10px);right:var(--ui-space-10px);bottom:var(--ui-space-3px);height:var(--ui-size-2px);border-radius:var(--ui-radius-pill);background:var(--ui-brand)}
.t-flyme-notes__list{padding:0 var(--ui-space-24px)}
.t-flyme-notes__note{display:flex;align-items:flex-start;gap:var(--ui-space-12px);padding:var(--ui-space-24px) 0;border-bottom:var(--ui-border-w) solid var(--ui-line)}
.t-flyme-notes__note > div{flex:1;min-width:0}
.t-flyme-notes__note h2{font-size:var(--ui-font-size-16px);font-weight:var(--ui-font-weight-550);line-height:var(--ui-line-height-1-5);letter-spacing:var(--ui-letter-spacing-n-02em);overflow-wrap:anywhere}
.t-flyme-notes__note p{color:var(--ui-sub);font-size:var(--ui-font-size-12px);line-height:var(--ui-line-height-1-8);margin:var(--ui-space-6px) 0 var(--ui-space-10px)}
.t-flyme-notes__note small{font-size:var(--ui-font-size-10px);color:var(--ui-sub)}
.t-flyme-notes__note [data-pin-label]{color:var(--ui-brand)}
.t-flyme-notes__note button{display:grid;place-items:center;flex:0 0 auto;width:var(--ui-ctl-h);height:var(--ui-ctl-h);border:0;border-radius:var(--ui-radius-sm);background:none;color:var(--ui-sub);font-size:var(--ui-font-size-22px)}
.t-flyme-notes__note button[aria-pressed="true"]{color:var(--ui-brand);background:var(--ui-brand-soft)}
.t-flyme-notes__footer{flex:0 0 auto;padding:var(--ui-space-14px) var(--ui-space-24px) var(--ui-space-20px);border-top:var(--ui-border-w) solid var(--ui-line);background:var(--ui-bg)}
.t-flyme-notes__footer .m-feedback{font-size:var(--ui-font-size-11px);margin-top:var(--ui-space-4px)}
`,
  init(root) {
    // 恢复的是模板自带的属性，不接收或拼接用户输入；实际控件仍由 UIButton 创建。
    root.querySelectorAll('ui-button[data-button-attrs]').forEach(function (host) {
      const button = host.querySelector('button');
      if (!button) return;
      let pairs;
      try { pairs = JSON.parse(host.getAttribute('data-button-attrs') || '[]'); } catch (_) { return; }
      if (!Array.isArray(pairs)) return;
      pairs.forEach(function (pair) {
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') return;
        const name = pair[0], value = pair[1];
        if (!/^(?:class|type|title|name|value|disabled|tabindex|data-[a-z0-9-]+|aria-[a-z0-9-]+)$/.test(name)) return;
        if (name === 'class') value.split(/\s+/).filter(Boolean).forEach(function (item) { button.classList.add(item); });
        else button.setAttribute(name, value);
      });
      const label = button.getAttribute('aria-label');
      const visible = button.textContent.replace(/\s+/g, ' ').trim();
      if (label && visible && !label.includes(visible)) button.setAttribute('aria-label', label + ' · ' + visible);
      host.removeAttribute('data-button-attrs');
    });

    const search = root.querySelector('[data-search] input');
    const filters = Array.from(root.querySelectorAll('[data-filter]'));
    const list = root.querySelector('[data-note-list]');
    const notes = Array.from(root.querySelectorAll('[data-note]'));
    let filter = 'all';
    function apply(message) {
      const active = root.querySelector(':focus');
      const q = search.value.trim().toLowerCase();
      const sorted = notes.slice().sort(function (a, b) {
        return Number(b.dataset.pinned === 'true') - Number(a.dataset.pinned === 'true') || Number(a.dataset.order) - Number(b.dataset.order);
      });
      let shown = 0;
      sorted.forEach(function (note, index) {
        if (list.children[index] !== note) list.insertBefore(note, list.children[index] || null);
        const pinned = note.dataset.pinned === 'true';
        note.hidden = !note.dataset.searchText.toLowerCase().includes(q) || (filter === 'pinned' ? !pinned : filter !== 'all' && note.dataset.category !== filter);
        const button = note.querySelector('[data-pin]');
        const title = note.querySelector('[data-note-title]').textContent;
        button.setAttribute('aria-pressed', String(pinned));
        button.setAttribute('aria-label', (pinned ? '取消置顶' : '置顶') + '「' + title + '」');
        note.querySelector('[data-pin-label]').hidden = !pinned;
        if (!note.hidden) shown++;
      });
      root.querySelector('[data-empty]').hidden = shown > 0;
      root.querySelector('[data-note-count]').textContent = shown + ' 篇本地示例';
      root.querySelector('[data-feedback]').textContent = message || '找到 ' + shown + ' 篇本地示例笔记';
      // DOM 重排不应丢失键盘焦点；取消置顶后被筛走时回到当前筛选。
      const note = active && root.contains(active) ? active.closest('[data-note]') : null;
      if (note && root.contains(note)) {
        const target = note.hidden ? filters.find(function (button) { return button.dataset.filter === filter; }) : active;
        if (target && root.contains(target)) target.focus({ preventScroll: true });
      }
    }
    search.addEventListener('input', function () { apply(); });
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        filter = button.dataset.filter;
        filters.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
        apply();
      });
    });
    root.addEventListener('click', function (event) {
      const button = event.target.closest('[data-pin]');
      if (!button || !root.contains(button)) return;
      const note = button.closest('[data-note]');
      if (!note || !root.contains(note)) return;
      const pinned = note.dataset.pinned !== 'true';
      note.dataset.pinned = String(pinned);
      apply((pinned ? '已置顶' : '已取消置顶') + '「' + note.querySelector('[data-note-title]').textContent + '」（本地示例）');
    });
    apply();
  },
  ai: `【模板】Flyme 风格灵感 · 原创轻量笔记 APP，Explore 表面
【页面目标】搜索、筛选、置顶本地示例笔记；不读取或上传真实笔记
【整体结构】大留白的轻标题与搜索；低装饰分类；细分隔笔记列表；右侧 44px 置顶按钮；底部数量与反馈
【布局】参考 Flyme 8 的留白与低装饰原则，不宣称最新版复刻；笔记不是卡片堆叠，文字与细线建立层级；克制青绿强调、独立滚动
【操作逻辑】搜索匹配标题与正文，分类按并且关系过滤；已置顶筛选跟随置顶变化；置顶稳定排到前面，取消恢复原顺序；空结果给清空与全部分类出口；重排保留键盘焦点
【状态】默认、组合筛选、空结果、置顶与取消；数量与读屏反馈同步；全站明暗切换不重建
【无障碍】搜索有 label；置顶按钮 aria-label 与 aria-pressed 同步；分类有 pressed；aria-live=polite；44px 触控与可见焦点
【约束】留白与低装饰只是风格灵感，不复制官方笔记、商标、截图；无字体/图片 CDN；所有颜色/圆角/阴影只用 var(--ui-*)，推荐 data-style="flyme"`,
  design: {
    purpose: '把笔记内容放在视觉中心，让筛选和置顶保持轻而清楚。',
    when: ['轻量笔记、灵感收集与文本内容浏览', '不依赖封面图片的移动知识页'],
    avoid: ['大量封面图片或密集操作的管理台', '把 Flyme 8 参考宣称为最新官方界面'],
    tips: ['用留白和细分隔，不为每篇笔记再套卡片', '置顶按钮可撤销，并与已置顶筛选保持同步', 'DOM 排序后恢复焦点，过滤隐藏当前项时回到筛选入口']
  }
};

export const mobileTemplates = [miui, coui, oneui, harmonyos, originos, flyme].map(function (template) {
  const hasButtons = /<button\b/.test(template.html);
  return { ...template, html: componentButtons(template.html), css: scopedTemplateCSS(template.id, template.css),
    uses: hasButtons ? Array.from(new Set(template.uses.concat('ui-button'))) : template.uses };
});
