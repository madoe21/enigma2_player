import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { CONSENT_COOKIE } from './consent/consent-store';

/**
 * The shell, which is almost nothing on purpose - plus the two things that
 * cannot live on a page, because they have to be the same on every page: the
 * cookie question and the way to take the answer back.
 */
describe('App', () => {
  function clearCookie(): void {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${new URL(document.baseURI).pathname}`;
  }

  beforeEach(async () => {
    clearCookie();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(clearCookie);

  it('creates', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('carries the cookie question and the footer control', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="dialog"]')).not.toBeNull();
    expect(element.querySelector('footer button')).not.toBeNull();
  });

  it('puts the question before the page it covers', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    // Document order, not CSS: a keyboard and a screen reader both reach the
    // question first because it comes first in the DOM.
    const dialog = element.querySelector('[role="dialog"]');
    const outlet = element.querySelector('router-outlet');
    expect(dialog && outlet && dialog.compareDocumentPosition(outlet)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('gives the skip link a target that can actually take the focus', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const skip = element.querySelector<HTMLAnchorElement>('a.skip-link');
    const target = element.querySelector<HTMLElement>('#content');
    expect(skip?.getAttribute('href')).toBe('#content');
    // Without a tabindex the hash jump scrolls and the focus stays put, which
    // leaves a screen reader's cursor in the navigation the reader asked to
    // skip (enigma2_player-dp3). -1, so it is reachable by the link and not
    // an extra Tab stop of its own.
    expect(target?.getAttribute('tabindex')).toBe('-1');
    target?.focus();
    expect(document.activeElement).toBe(target);
  });

  it('has exactly one h1 - the page supplies it, not the shell', async () => {
    // The scaffold shell shipped Angular's welcome markup, which gave every
    // page a second h1. Playwright caught that here before a human would.
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    // The dialog's heading is an h2; the shell contributes no h1 of its own.
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('h1').length).toBe(0);
  });
});
