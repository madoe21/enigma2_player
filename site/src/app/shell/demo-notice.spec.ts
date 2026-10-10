import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoNotice } from './demo-notice';
import { PageLanguage } from '../i18n/page-language';

describe('DemoNotice', () => {
  let fixture: ComponentFixture<DemoNotice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DemoNotice] }).compileComponents();
    fixture = TestBed.createComponent(DemoNotice);
    await fixture.whenStable();
  });

  function notice(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('aside.demo-notice');
  }

  it('says that this is a demonstration', () => {
    expect(notice()).not.toBeNull();
    expect(notice()?.textContent).toContain('Demo-Version');
    // And says what the consequence is, not only the label: a visitor who
    // reads "demo" still wonders whether they can buy.
    expect(notice()?.textContent).toContain('Käufe sind noch nicht möglich');
  });

  it('does not catch the keyboard', () => {
    // The requirement, verbatim: read out, but not trapping focus. A banner
    // that takes focus on every page load makes the site unusable with a
    // screen reader, which is the opposite of the point.
    const element = notice()!;
    expect(element.getAttribute('tabindex')).toBeNull();
    expect(element.querySelectorAll('a, button, input, [tabindex]').length).toBe(0);
  });

  it('is a named landmark, not an alert', () => {
    // `role="alert"` would interrupt whatever a screen reader is reading, on
    // every page. This is a standing fact about the site, not an event.
    expect(notice()?.getAttribute('aria-live')).toBeNull();
    expect(notice()?.getAttribute('role')).toBeNull();

    // An <aside> is a `complementary` landmark, and the name is what makes it
    // findable in a landmark list. It was `role="note"` first, which is no
    // landmark at all and put the sentence outside every region on the page.
    expect(notice()?.getAttribute('aria-label')).toBe('Hinweis zur Demo-Version');
  });

  it('speaks the language of the page', async () => {
    TestBed.inject(PageLanguage).set('en');
    await fixture.whenStable();

    expect(notice()?.textContent).toContain('Demonstration');
  });

  it('is switchable from one flag', async () => {
    // What go-live needs is a single edit, which TODO.md names:
    // DEMO_MODE = false in content/site-flags.ts.
    const flags = await import('../content/site-flags');
    expect(flags.DEMO_MODE).toBe(true);

    // The banner is gated by that flag and by nothing else - no second
    // condition that could keep it on the page after the edit. What the edit
    // then produces is asserted in demo-notice-off.spec.ts.
    const component = fixture.componentInstance as unknown as { shown: boolean };
    expect(component.shown).toBe(flags.DEMO_MODE);
  });
});
