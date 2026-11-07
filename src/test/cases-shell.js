import { describe, it, expect, put } from './harness.js';
import { styles } from '../data/styles.js';

async function motionGallery(host, fn) {
  const key = 'ui-gallery:state';
  const previous = localStorage.getItem(key);
  localStorage.setItem(key, JSON.stringify({ view: 'templates', tcat: 'Web 页面', style: 'clay', theme: 'dark', motion: 'on' }));
  const frame = document.createElement('iframe');
  frame.title = '减少动效 CSS 回归';
  frame.style.cssText = 'width:1100px;height:1000px;position:fixed;left:-2200px;border:0';
  try {
    const loaded = new Promise((resolve) => { frame.onload = resolve; });
    frame.src = './index.html';
    host.appendChild(frame);
    await loaded;
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    // The same permanent assertions exercise the real system preference
    // when emulated by Playwright, and the page toggle otherwise.
    const systemReduce = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!systemReduce) doc.getElementById('motionBtn').click();
    expect(doc.documentElement.getAttribute('data-motion')).toBe(systemReduce ? null : 'reduce');
    await fn(doc, win);
  } finally {
    frame.remove();
    if (previous === null) localStorage.removeItem(key); else localStorage.setItem(key, previous);
  }
}

describe('减少动效 CSS 过渡', () => {
  it('减少动效时画廊 CSS 过渡直接到终态', async (host) => {
    await motionGallery(host, (doc, win) => {
      const probe = doc.createElement('i');
      probe.style.cssText = 'color:var(--ui-text);background:var(--ui-bg)';
      doc.body.appendChild(probe);
      // Flush the starting style, then assert synchronously after the click.
      win.getComputedStyle(doc.body).color;
      doc.getElementById('themeBtn').click();
      expect(doc.documentElement.dataset.theme).toBe('light');
      const body = win.getComputedStyle(doc.body);
      const target = win.getComputedStyle(probe);
      expect({ color: body.color, background: body.backgroundColor })
        .toEqual({ color: target.color, background: target.backgroundColor });
      expect(win.getComputedStyle(doc.querySelector('.top h1')).color).toBe(target.color);
      doc.querySelector('[data-vw="390"]').click();
      const page = doc.querySelector('.tbrowser__page');
      expect(win.getComputedStyle(page).maxWidth).toBe('390px');
      doc.querySelector('[data-vw="768"]').click();
      expect(win.getComputedStyle(page).maxWidth).toBe('768px');
      for (const element of [doc.body, page]) {
        const css = win.getComputedStyle(element);
        expect(css.transitionDuration).toBe('0s');
        expect(css.transitionDelay).toBe('0s');
      }
    });
  });

  it('减少动效时所有局部风格的控件 CSS 过渡直接到终态，保留加载呼吸', async (host) => {
    await motionGallery(host, async (doc, win) => {
      const fixture = doc.createElement('div');
      fixture.innerHTML = styles.flatMap((style) => ['light', 'dark'].map((theme) =>
        '<div data-style="' + style.id + '" data-theme="' + theme + '" style="width:320px">' +
        '<ui-button>回归按钮</ui-button><ui-input label="回归输入"></ui-input>' +
        '<ui-switch>回归开关</ui-switch><ui-progress value="0" label="回归进度"></ui-progress>' +
        '<ui-loader label="回归加载"></ui-loader></div>')).join('');
      doc.body.appendChild(fixture);
      await Promise.resolve(); // Only flush Web Component mounting, not CSS transitions.
      for (const scope of fixture.children) {
        const probe = doc.createElement('i');
        probe.style.cssText = 'color:var(--ui-default-button-text);background:var(--ui-panel)';
        scope.appendChild(probe);
        const input = scope.querySelector('.ui-input');
        input.focus();
        expect({ style: scope.dataset.style, theme: scope.dataset.theme, background: win.getComputedStyle(input).backgroundColor })
          .toEqual({ style: scope.dataset.style, theme: scope.dataset.theme, background: win.getComputedStyle(probe).backgroundColor });
        const button = scope.querySelector('.ui-btn');
        win.getComputedStyle(button).color;
        scope.dataset.theme = scope.dataset.theme === 'light' ? 'dark' : 'light';
        expect(win.getComputedStyle(button).color).toBe(win.getComputedStyle(probe).color);
        const track = scope.querySelector('.ui-switch__track');
        win.getComputedStyle(track, '::after').transform;
        scope.querySelector('input[role="switch"]').click();
        expect(win.getComputedStyle(track, '::after').transform).toBe('matrix(1, 0, 0, 1, 18, 0)');
        const bar = scope.querySelector('.ui-progress__bar');
        const reference = doc.createElement('i');
        reference.style.cssText = 'display:block;width:75%;height:1px';
        bar.parentNode.appendChild(reference);
        win.getComputedStyle(bar).width;
        bar.style.width = '75%';
        expect(win.getComputedStyle(bar).width).toBe(win.getComputedStyle(reference).width);
        for (const element of [button, input, track, bar]) {
          const css = win.getComputedStyle(element);
          expect(css.transitionDuration).toBe('0s');
          expect(css.transitionDelay).toBe('0s');
        }
        expect(win.getComputedStyle(track, '::after').transitionDuration).toBe('0s');
        const loading = win.getComputedStyle(scope.querySelector('.ui-ld__v'));
        expect(loading.animationName).toBe('ui-ld-calm');
        expect(loading.animationDuration).toBe('2s');
        expect(loading.animationIterationCount).toBe('infinite');
      }
      for (const element of doc.querySelectorAll('.seg button,.ghost,.side button,.card__tabs button,.copy,.sframe__apply')) {
        expect(win.getComputedStyle(element).transitionDuration).toBe('0s');
      }
    });
  });
});

// A local style is an inheritance boundary, including Terminal light.
describe('局部风格文字光晕', () => {
  it('局部风格不继承祖先 Terminal 深色光晕，局部 Terminal 深色仍保留光晕', async (host) => {
    for (const style of styles) {
      for (const theme of ['light', 'dark']) {
        await put(host, '<div data-style="terminal" data-theme="dark"><span>祖先正文</span>' +
          '<div data-style="' + style.id + '" data-theme="' + theme + '"><span>局部正文</span>' +
          '<div data-style="terminal" data-theme="dark"><span>嵌套终端正文</span></div></div></div>');
        const outer = host.firstElementChild;
        const local = outer.lastElementChild;
        const glow = getComputedStyle(outer.firstElementChild).textShadow;
        expect(glow === 'none').toBe(false);
        const expected = style.id === 'terminal' && theme === 'dark' ? glow : 'none';
        expect({ style: style.id, theme, shadow: getComputedStyle(local).textShadow })
          .toEqual({ style: style.id, theme, shadow: expected });
        expect(getComputedStyle(local.firstElementChild).textShadow).toBe(expected);
        expect(getComputedStyle(local.lastElementChild.firstElementChild).textShadow).toBe(glow);
      }
    }
  });
});

// Native probes consume the local public tokens, not button-only aliases.
// In particular, default text is independently checked against --ui-text
// (Material intentionally uses --ui-brand).
const scopedButtonCases = [
  { variant: 'default', shape: 'default' },
  { variant: 'primary', shape: 'default' },
  { variant: 'default', shape: 'pill' },
  { variant: 'primary', shape: 'pill' },
  { variant: 'default', shape: 'circle' },
  { variant: 'primary', shape: 'circle' }
];

function scopedButtons() {
  return scopedButtonCases.map(({ variant, shape }) =>
    '<ui-button variant="' + variant + '" shape="' + shape + '">' + (shape === 'circle' ? '圆' : '局部按钮') + '</ui-button>').join('');
}

async function scopedButtonFixture(host, parentStyle) {
  await put(host, '<div data-motion="reduce">' + ['light', 'dark'].map((parentTheme) =>
    '<div data-parent="' + parentTheme + '" data-style="' + parentStyle + '" data-theme="' + parentTheme + '">' +
    styles.flatMap((style) => ['light', 'dark'].map((theme) =>
      '<section data-local data-style="' + style.id + '" data-theme="' + theme + '">' + scopedButtons() + '</section>')).join('') +
    // A second local boundary must restore the parent style's own effects.
    '<div data-style="miui" data-theme="' + parentTheme + '"><section data-restored data-style="' + parentStyle +
    '" data-theme="' + parentTheme + '">' + scopedButtons() + '</section></div></div>').join('') + '</div>');
  const scopes = [...host.querySelectorAll('[data-local],[data-restored]')];
  expect(host.querySelectorAll('[data-local]').length).toBe(styles.length * 2 * 2);
  expect(host.querySelectorAll('[data-restored]').length).toBe(2);
  expect(scopes.reduce((count, scope) => count + scope.querySelectorAll('.ui-btn').length, 0))
    .toBe(scopes.length * scopedButtonCases.length);
  return scopes;
}

function localButtonExpectation(scope, { variant, shape }, focused = false) {
  const style = scope.dataset.style;
  const dark = scope.dataset.theme === 'dark';
  let shadow = variant === 'primary' ? 'var(--ui-shadow)' : 'var(--ui-shadow-sm)';
  if (variant === 'default' && style === 'material') shadow = 'none';
  // Preserve the other styles' existing intentional primary-button effects.
  if (variant === 'primary' && style === 'cyber' && dark) shadow = '0 0 14px rgba(0,234,255,.5)';
  if (variant === 'primary' && style === 'candy') shadow = '0 4px 0 color-mix(in srgb,var(--ui-brand) 70%,#000)';
  if (variant === 'primary' && style === 'terminal' && dark) shadow = '0 0 14px rgba(51,255,102,.45)';
  const probe = document.createElement('button');
  probe.type = 'button';
  probe.style.color = variant === 'primary' ? 'var(--ui-brand-ink)' : style === 'material' ? 'var(--ui-brand)' : 'var(--ui-text)';
  probe.style.background = variant === 'primary' ? 'var(--ui-brand)' : style === 'material' ? 'transparent' : 'var(--ui-panel)';
  if (variant === 'primary' && style === 'luxury') {
    probe.style.background = 'linear-gradient(135deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 55%,#f5e1a4) 50%,var(--ui-brand))';
  }
  probe.style.borderColor = variant === 'primary' ? 'var(--ui-brand)' : 'var(--ui-line)';
  probe.style.borderRadius = shape === 'circle' ? '50%' : style === 'material' ? '999px' : shape === 'pill' ? 'var(--ui-radius-pill)' : 'var(--ui-radius)';
  probe.style.boxShadow = focused ? 'var(--ui-ring)' : shadow;
  if (style === 'terminal' && dark && variant === 'primary') probe.style.textShadow = 'none';
  scope.appendChild(probe);
  const expected = buttonAppearance(probe);
  probe.remove();
  return expected;
}

function buttonAppearance(button) {
  const css = getComputedStyle(button);
  return { color: css.color, background: css.backgroundColor, image: css.backgroundImage,
    border: css.borderTopColor, radius: css.borderTopLeftRadius, shadow: css.boxShadow, textShadow: css.textShadow };
}

function expectLocalButtons(scope) {
  for (const token of ['button-radius', 'default-button-text', 'default-button-bg', 'default-button-shadow',
    'button-prefix', 'primary-button-shadow', 'primary-button-text-shadow']) {
    expect(getComputedStyle(scope).getPropertyValue('--ui-' + token).trim().length).toBeGreaterThan(0);
  }
  const buttons = [...scope.querySelectorAll('.ui-btn')];
  buttons.forEach((button, index) => {
    const context = { parent: scope.closest('[data-parent]').dataset.parent, style: scope.dataset.style,
      theme: scope.dataset.theme, ...scopedButtonCases[index] };
    expect({ ...context, appearance: buttonAppearance(button) })
      .toEqual({ ...context, appearance: localButtonExpectation(scope, scopedButtonCases[index]) });
  });
}

describe('Material 局部按钮边界', () => {
  it('Material 祖先不改变局部按钮表面、文字、圆角与阴影，重新嵌套仍恢复胶囊透明按钮', async (host) => {
    for (const scope of await scopedButtonFixture(host, 'material')) expectLocalButtons(scope);
  });
});

describe('Terminal 局部按钮边界', () => {
  it('Terminal 前缀与主按钮光晕只属于最近的 Terminal 边界，所有局部按钮保留可见焦点', async (host) => {
    // Focusing a text input establishes :focus-visible even when this page
    // was opened by a mouse click, then programmatic focus preserves it.
    for (const parentStyle of ['terminal', 'material']) {
      const scopes = await scopedButtonFixture(host, parentStyle);
      const keyboardSeed = document.createElement('input');
      keyboardSeed.setAttribute('aria-label', '键盘焦点起点');
      host.appendChild(keyboardSeed);
      keyboardSeed.focus();
      expect(keyboardSeed.matches(':focus-visible')).toBe(true);
      for (const scope of scopes) {
        expectLocalButtons(scope);
        const buttons = [...scope.querySelectorAll('.ui-btn')];
        buttons.forEach((button, index) => {
          const entry = scopedButtonCases[index];
          const context = { parentStyle, parentTheme: scope.closest('[data-parent]').dataset.parent,
            style: scope.dataset.style, theme: scope.dataset.theme, ...entry };
          const prefix = scope.dataset.style === 'terminal' && entry.shape !== 'circle';
          expect({ ...context, before: getComputedStyle(button, '::before').content })
            .toEqual({ ...context, before: prefix ? '"> "' : 'none' });
          if (prefix) expect(getComputedStyle(button, '::before').opacity).toBe('0.6');
          button.focus();
          expect(button.matches(':focus-visible')).toBe(true);
          expect({ ...context, focused: buttonAppearance(button) })
            .toEqual({ ...context, focused: localButtonExpectation(scope, entry, true) });
          expect(getComputedStyle(button).boxShadow === 'none').toBe(false);
          button.blur();
        });
      }
    }
  });
});

describe('局部按钮尺寸与状态', () => {
  it('Material、Terminal 及其局部 MIUI 保留全部按钮变体、尺寸、形状和禁用/加载状态', async (host) => {
    const variants = ['default', 'primary', 'danger', 'text', 'outline', 'soft', 'gradient', 'success'];
    const entries = variants.flatMap((variant) => ['sm', 'md', 'lg'].flatMap((size) => ['default', 'pill', 'circle'].flatMap((shape) =>
      (['default', 'primary'].includes(variant) ? ['normal', 'disabled', 'loading'] : ['normal'])
        .map((state) => ({ variant, size, shape, state })))));
    await put(host, '<div data-motion="reduce">' + ['material', 'terminal'].flatMap((parentStyle) => ['light', 'dark'].map((theme) =>
      '<div data-style="' + parentStyle + '" data-theme="' + theme + '">' + [parentStyle, 'miui'].map((style) =>
        '<section data-button-state data-style="' + style + '" data-theme="' + theme + '">' + entries.map((entry) =>
          '<ui-button variant="' + entry.variant + '" size="' + entry.size + '" shape="' + entry.shape + '"' +
          (entry.state === 'normal' ? '' : ' ' + entry.state) + '>' + (entry.shape === 'circle' ? '圆' : '状态按钮') + '</ui-button>').join('') +
        '</section>').join('') + '</div>')).join('') + '</div>');
    const scopes = [...host.querySelectorAll('[data-button-state]')];
    expect(scopes.length).toBe(8);
    for (const scope of scopes) {
      const buttons = [...scope.querySelectorAll('.ui-btn')];
      expect(buttons.length).toBe(entries.length);
      buttons.forEach((button, index) => {
        const { variant, size, shape, state } = entries[index];
        const material = scope.dataset.style === 'material';
        const terminalDark = scope.dataset.style === 'terminal' && scope.dataset.theme === 'dark';
        const paints = {
          default: [material ? 'var(--ui-brand)' : 'var(--ui-text)', material ? 'transparent' : 'var(--ui-panel)', 'var(--ui-line)', material ? 'none' : 'var(--ui-shadow-sm)'],
          primary: ['var(--ui-brand-ink)', 'var(--ui-brand)', 'var(--ui-brand)', terminalDark ? '0 0 14px rgba(51,255,102,.45)' : 'var(--ui-shadow)'],
          danger: ['var(--ui-danger)', 'var(--ui-danger-soft)', 'var(--ui-danger)', 'var(--ui-shadow-sm)'],
          text: ['var(--ui-brand)', 'transparent', 'transparent', 'none'],
          outline: ['var(--ui-brand)', 'transparent', 'var(--ui-brand)', 'none'],
          soft: ['var(--ui-brand)', 'var(--ui-brand-soft)', 'transparent', 'none'],
          gradient: ['var(--ui-brand-ink)', 'linear-gradient(135deg,var(--ui-brand),color-mix(in srgb,var(--ui-brand) 55%,var(--ui-accent)))', 'transparent', 'var(--ui-shadow)'],
          success: ['var(--ui-on-color)', 'var(--ui-ok)', 'var(--ui-ok)', 'var(--ui-shadow-sm)']
        };
        const [color, background, borderColor, boxShadow] = paints[variant];
        const probe = document.createElement('button');
        Object.assign(probe.style, { color, background, borderColor,
          boxShadow: state === 'disabled' ? 'none' : boxShadow,
          borderRadius: shape === 'circle' ? '50%' : shape === 'pill' || material ? 'var(--ui-radius-pill)' : 'var(--ui-radius)',
          height: size === 'sm' ? 'calc(var(--ui-ctl-h) - 8px)' : size === 'lg' ? 'calc(var(--ui-ctl-h) + 6px)' : 'var(--ui-ctl-h)',
          fontSize: size === 'sm' ? '12.5px' : size === 'lg' ? '15px' : '14px' });
        scope.appendChild(probe);
        const context = { style: scope.dataset.style, theme: scope.dataset.theme, variant, size, shape, state };
        expect({ ...context, appearance: buttonAppearance(button) }).toEqual({ ...context, appearance: buttonAppearance(probe) });
        const css = getComputedStyle(button);
        const reference = getComputedStyle(probe);
        expect(css.height).toBe(reference.height);
        expect(css.fontSize).toBe(reference.fontSize);
        if (shape === 'circle') {
          expect(css.width).toBe(reference.height);
          expect(css.paddingLeft).toBe('0px');
          expect(getComputedStyle(button, '::before').content).toBe('none');
        }
        expect(button.disabled).toBe(state === 'disabled');
        expect(css.opacity).toBe(state === 'disabled' ? '0.45' : state === 'loading' ? '0.8' : '1');
        expect(css.cursor).toBe(state === 'disabled' ? 'not-allowed' : 'pointer');
        expect(button.getAttribute('aria-busy')).toBe(state === 'loading' ? 'true' : null);
        expect(!!button.querySelector('.ui-btn__spin')).toBe(state === 'loading');
        if (state === 'loading') {
          expect(css.pointerEvents).toBe('none');
          expect(getComputedStyle(button, '::before').content).toBe('none');
        }
        probe.remove();
      });
    }
  });
});

// Exercise the actual entry pages and their static icon resource.
// This also prevents an implicit /favicon.ico request from polluting
// the browser runner's console-error gate.
describe('页面静态资源', () => {
  it('入口页和回归页都提供可加载的本地图标', async () => {
    for (const path of ['./', './test.html']) {
      const url = new URL(path, document.baseURI);
      const response = await fetch(url, { cache: 'no-store' });
      expect(response.ok).toBe(true);
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const icon = doc.querySelector('link[rel="icon"]');
      expect(!!icon).toBe(true);
      const iconUrl = new URL(icon.getAttribute('href'), url);
      expect(iconUrl.origin).toBe(location.origin);
      const asset = await fetch(iconUrl, { cache: 'no-store' });
      expect(asset.ok).toBe(true);
      expect(asset.headers.get('Content-Type')).toContain('image/');
    }
  });
});
