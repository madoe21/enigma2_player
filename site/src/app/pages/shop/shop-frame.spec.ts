import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CONSENT_COOKIE, ConsentStore } from '../../consent/consent-store';
import { PageLanguage } from '../../i18n/page-language';
import { ShopFrame, ShopView } from './shop-frame';
import { Lang } from '../../i18n/locales';

/**
 * The gate in front of the licence server's frame.
 *
 * The point of these tests is that gate. Loading the frame sends the visitor's
 * request and their IP to the licence server, so it must not happen before
 * they accepted - that is what `enigma2_player-vmk` decided for the shop, and
 * an iframe that loads anyway would make the cookie dialog decorative. It is
 * tested here rather than once per page because both pages that frame the shop
 * use this component (enigma2_player-eer); a test per page would check the
 * same code twice and still miss a third page that rolled its own iframe.
 */
@Component({
  imports: [ShopFrame],
  template: `<site-shop-frame [view]="view()" [frameTitle]="'Shop'" />`,
})
class Host {
  readonly view = input.required<ShopView>();
}

describe('ShopFrame', () => {
  function clearCookie(): void {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${new URL(document.baseURI).pathname}`;
  }

  async function render(view: ShopView, lang: Lang = 'de'): Promise<ComponentFixture<Host>> {
    TestBed.resetTestingModule();
    clearCookie();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    // The frame reads the language the page declared, which in the app is set
    // by `PageBase`; here the host has no route, so it is set directly.
    TestBed.inject(PageLanguage).set(lang);
    fixture.componentRef.setInput('view', view);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(clearCookie);

  function frame(fixture: ComponentFixture<Host>): HTMLIFrameElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('iframe');
  }

  async function accept(fixture: ComponentFixture<Host>): Promise<void> {
    TestBed.inject(ConsentStore).accept();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('does not load the frame before consent', async () => {
    const fixture = await render('buy');

    expect(frame(fixture)).toBeNull();
    // And it says why, rather than leaving a hole where the shop should be.
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="note"]')).not.toBeNull();
  });

  it('loads the frame once consent exists', async () => {
    const fixture = await render('buy');
    await accept(fixture);

    const iframe = frame(fixture);
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toContain('/shop/');
    // Lazy even then: after consent it is still only fetched when it is seen.
    expect(iframe?.getAttribute('loading')).toBe('lazy');
    // The licence server has no business knowing which page of ours framed it.
    expect(iframe?.getAttribute('referrerpolicy')).toBe('no-referrer');
    // An iframe without a name is announced as "frame" (WCAG 4.1.2).
    expect(iframe?.getAttribute('title')).toBe('Shop');
  });

  it('keeps the frame out after a refusal', async () => {
    const fixture = await render('account');
    TestBed.inject(ConsentStore).reject();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(frame(fixture)).toBeNull();
  });

  it('frames the account view when asked for it', async () => {
    const fixture = await render('account');
    await accept(fixture);

    expect(frame(fixture)?.getAttribute('src')).toContain('/account/');
  });

  it('passes the page language into the shop', async () => {
    const fixture = await render('buy', 'fr');
    await accept(fixture);

    // Otherwise a French visitor gets a German shop inside a French page.
    expect(frame(fixture)?.getAttribute('src')).toContain('lang=fr');
  });

  it('offers the shop in a new tab as well', async () => {
    const fixture = await render('buy');
    await accept(fixture);

    // The frame can be blocked by the browser or by the licence server's own
    // headers; the link is the way out that does not depend on either.
    const link = (fixture.nativeElement as HTMLElement).querySelector('.shop-fallback a');
    expect(link?.getAttribute('href')).toContain('/shop/');
    expect(link?.getAttribute('rel')).toBe('noopener');
  });
});
