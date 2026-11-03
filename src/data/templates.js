/* =========================================================
   界面模板（整页布局 + 操作逻辑）的统一入口
   字段说明：
   id      —— 唯一标识（样式作用域 .t-<id>）
   name    —— 中文名
   cat     —— 分类：移动 APP / Web 页面 / JS 绘制
   frame   —— 预览外框：phone 手机框 / browser 浏览器框（可切换桌面 / 平板 / 手机宽度）
   url     —— 浏览器框地址栏里显示的示例地址
   fit     —— 浏览器框高度跟随内容（Canvas 模板），否则固定高度、视口内滚动
   brief   —— 一句话说明页面由哪些部分组成
   uses    —— 用到的组件标签
   html    —— 页面结构（直接用组件库标签拼）
   css     —— 模板专属样式，只引用 var(--ui-*)
   init    —— 操作逻辑：init(root) 在模板挂载后调用，root 是这一页的根节点
   ai      —— 给 AI Agent 的整页提示词（结构 / 布局 / 操作逻辑 / 状态 / 无障碍 / 约束）
   design  —— 设计说明：purpose / when / avoid / tips
   ========================================================= */
import { appTemplates } from './templates-app.js';
import { webTemplates } from './templates-web.js';
import { canvasTemplates } from './templates-canvas.js';

export { TPL_BASE_CSS } from './templates-shared.js';
export const TPL_CATS = ['移动 APP', 'Web 页面', 'JS 绘制'];
export const templates = appTemplates.concat(webTemplates, canvasTemplates);
