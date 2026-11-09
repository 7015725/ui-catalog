/* 组件统一注册入口
   导入即注册（副作用），同时导出类表供画廊生成"属性"文档 */
import './form.js';
import './display.js';
import './nav.js';
import './feedback.js';

import { UIButton, UIInput, UITextarea, UISelect, UISwitch, UISlider, UICheckbox, UIRadio } from './form.js';
import { UITag, UIBadge, UIAvatar, UICard, UIStat } from './display.js';
import { UITabs, UIBreadcrumb, UISteps, UIPagination } from './nav.js';
import { UIProgress, UISpinner, UISkeleton, UIEmpty, UIAlert } from './feedback.js';
import { UIDropdown, UITooltip } from './overlay.js';
import { UIDatepicker } from './datepicker.js';
import { UITree } from './tree.js';
import { UIModal } from './modal.js';
import { UIDrawer } from './drawer.js';
import { UIPopover } from './popover.js';
import { UITable } from './table.js';
import { UIAccordion } from './accordion.js';
import { UISegmented, UIRate } from './control.js';
import { UINumber, UITagInput, UIOtp, UIUpload, UIColor, UIChips } from './more-form.js';
import { UITimeline, UIAvatarGroup, UIDescriptions, UIKbd, UIDivider, UICarousel, UICode, UIList } from './more-display.js';
import { UINavbar, UIMenu, UIRing, UIResult } from './more-nav.js';
import { UIPassword, UIRange, UISearch, UIOptionCards } from './more-form2.js';
import { UISparkline, UIBarChart, UIDonut, UIHeatmap } from './charts.js';
import { UIProfile, UIPricing, UIBottomNav, UICommand, UICountdown, UIBanner, UIStatus } from './more-misc.js';
import { UIMultiSelect, UICascader, UITransfer, UIInputGroup } from './more-form3.js';
import { UIImage, UIComment, UICalendar } from './more-display2.js';
import { UILineChart, UIGauge, UIFunnel } from './charts2.js';
import { UIAnchor, UISplitButton, UIContextMenu, UIPopconfirm } from './more-overlay.js';
import { UIReveal, UITypewriter, UICountUp, UIMarquee, UITextAnim, UIRipple, UIFlipCard, UIAnimate, UILoader } from './motion.js';
import { UITilt, UISpotlight, UIGradientBorder, UIAurora, UIGradientText, UIPattern, UIBlob, UIParticles, UIMagnetic, UIShine } from './effects.js';
import * as M2 from './motion2.js';
import * as M3 from './motion3.js';
import * as M4 from './motion4.js';
import * as E2 from './effects2.js';
import * as E3 from './effects3.js';
import './fun.js';
import './fun2.js';
import './canvas-ui.js';

export { cssRegistry } from './base.js';
import { classRegistry } from './base.js';

export const componentClasses = {
  'ui-button': UIButton,
  'ui-input': UIInput,
  'ui-textarea': UITextarea,
  'ui-select': UISelect,
  'ui-switch': UISwitch,
  'ui-slider': UISlider,
  'ui-checkbox': UICheckbox,
  'ui-radio': UIRadio,
  'ui-tag': UITag,
  'ui-badge': UIBadge,
  'ui-avatar': UIAvatar,
  'ui-card': UICard,
  'ui-stat': UIStat,
  'ui-tabs': UITabs,
  'ui-breadcrumb': UIBreadcrumb,
  'ui-steps': UISteps,
  'ui-pagination': UIPagination,
  'ui-progress': UIProgress,
  'ui-spinner': UISpinner,
  'ui-skeleton': UISkeleton,
  'ui-empty': UIEmpty,
  'ui-alert': UIAlert,
  'ui-dropdown': UIDropdown,
  'ui-tooltip': UITooltip,
  'ui-datepicker': UIDatepicker,
  'ui-tree': UITree,
  'ui-modal': UIModal,
  'ui-drawer': UIDrawer,
  'ui-popover': UIPopover,
  'ui-table': UITable,
  'ui-accordion': UIAccordion,
  'ui-segmented': UISegmented,
  'ui-rate': UIRate,
  'ui-number': UINumber,
  'ui-tag-input': UITagInput,
  'ui-otp': UIOtp,
  'ui-upload': UIUpload,
  'ui-color': UIColor,
  'ui-chips': UIChips,
  'ui-timeline': UITimeline,
  'ui-avatar-group': UIAvatarGroup,
  'ui-descriptions': UIDescriptions,
  'ui-kbd': UIKbd,
  'ui-divider': UIDivider,
  'ui-carousel': UICarousel,
  'ui-code': UICode,
  'ui-list': UIList,
  'ui-navbar': UINavbar,
  'ui-menu': UIMenu,
  'ui-ring': UIRing,
  'ui-result': UIResult,
  'ui-password': UIPassword,
  'ui-range': UIRange,
  'ui-search': UISearch,
  'ui-option-cards': UIOptionCards,
  'ui-sparkline': UISparkline,
  'ui-bar-chart': UIBarChart,
  'ui-donut': UIDonut,
  'ui-heatmap': UIHeatmap,
  'ui-profile': UIProfile,
  'ui-pricing': UIPricing,
  'ui-bottom-nav': UIBottomNav,
  'ui-command': UICommand,
  'ui-countdown': UICountdown,
  'ui-banner': UIBanner,
  'ui-status': UIStatus,
  'ui-multi-select': UIMultiSelect,
  'ui-cascader': UICascader,
  'ui-transfer': UITransfer,
  'ui-input-group': UIInputGroup,
  'ui-image': UIImage,
  'ui-comment': UIComment,
  'ui-calendar': UICalendar,
  'ui-line-chart': UILineChart,
  'ui-gauge': UIGauge,
  'ui-funnel': UIFunnel,
  'ui-anchor': UIAnchor,
  'ui-split-button': UISplitButton,
  'ui-context-menu': UIContextMenu,
  'ui-popconfirm': UIPopconfirm,
  'ui-reveal': UIReveal,
  'ui-typewriter': UITypewriter,
  'ui-count-up': UICountUp,
  'ui-marquee': UIMarquee,
  'ui-text-anim': UITextAnim,
  'ui-ripple': UIRipple,
  'ui-flip-card': UIFlipCard,
  'ui-animate': UIAnimate,
  'ui-loader': UILoader,
  'ui-tilt': UITilt,
  'ui-spotlight': UISpotlight,
  'ui-gradient-border': UIGradientBorder,
  'ui-aurora': UIAurora,
  'ui-gradient-text': UIGradientText,
  'ui-pattern': UIPattern,
  'ui-blob': UIBlob,
  'ui-particles': UIParticles,
  'ui-magnetic': UIMagnetic,
  'ui-shine': UIShine
};

/* 其余组件（第二批动效 / 视觉等）直接从注册表补齐，免得手写一长串 */
classRegistry.forEach(function (cls, tag) { if (!componentClasses[tag]) componentClasses[tag] = cls; });
