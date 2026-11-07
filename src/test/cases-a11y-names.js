import '../components/index.js';
import { describe, it, expect, put, tick } from './harness.js';

// SPEC 2.5.4 / WCAG 2.5.3：语音操作使用的名称必须包含实际可见文本。
describe('可访问名称与可见文本', () => {
  it('日期、图片状态、日程、翻牌和点赞控件的名称包含其显示内容', async (host) => {
    await put(host, `<ui-datepicker label="起始日期" value="2026-11-07"></ui-datepicker>
<ui-datepicker label="结束日期" placeholder="选择结束日期"></ui-datepicker>
<ui-image alt="测试图片"></ui-image>
<ui-calendar month="2026-11" events='[{"date":"2026-11-07","title":"团建"}]'></ui-calendar>
<ui-flip-card trigger="click" label="单词卡"><div>Serendipity</div><div>意外发现</div></ui-flip-card>
<ui-like-button count="2048"></ui-like-button>`);
    const dates = host.querySelectorAll('.ui-dp__btn');
    expect(dates[0].getAttribute('aria-label')).toContain('2026-11-07');
    expect(dates[1].getAttribute('aria-label')).toContain('选择结束日期');
    expect(host.querySelector('.ui-img__box').getAttribute('aria-label')).toContain('未提供图片');
    expect(host.querySelector('.ui-cal__d[data-date="2026-11-07"]').getAttribute('aria-label')).toContain('团建');
    const flip = host.querySelector('.ui-flip');
    expect(flip.getAttribute('aria-label')).toContain('Serendipity');
    flip.click();
    expect(flip.getAttribute('aria-label')).toContain('意外发现');
    const like = host.querySelector('.ui-like');
    expect(like.getAttribute('aria-label')).toContain(like.querySelector('.ui-like__n').textContent);
    like.click(); await tick(0);
    const changed = host.querySelector('.ui-like');
    expect(changed.getAttribute('aria-label')).toContain(changed.querySelector('.ui-like__n').textContent);
  });
});
