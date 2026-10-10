import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { CONSENT_COOKIE, ConsentStore } from '../../consent/consent-store';
import { Shop } from './shop';

/**
 * Buying and the account, both framed from the licence server.
 *
 * The point of these tests is the gate. Loading the frame sends the visitor's
 * request and their IP to the licence server, so it must not happen before
 * they accepted - that is what `enigma2_player-vmk` decided for the shop, and
 * an iframe that loads anyway would make the cookie dialog decorative.
 */
describe('Shop', () => {
  function clearCookie(): void {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${new URL(document.baseURI).pathname}`;
  }

  async function render(view: 'buy' | 'account', lang = 'de'): Promise<ComponentFixture<Shop>> {
    TestBed.resetTestingModule();
    clearCookie();
    await TestBed.configureTestingModule({
      imports: [Shop],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub({ lang, view }) },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Shop);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(clearCookie);

  function frame(fixture: ComponentFixture<Shop>): HTMLIFrameElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('iframe');
  }

  it('does not load the frame before consent', async () => {
    const fixture = await render('buy');

    expect(frame(fixture)).toBeNull();
    // And it says why, rather than leaving a hole where the shop should be.
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="note"]')).not.toBeNull();
  });

  it('loads the frame once consent exists', async () => {
    const fixture = await render('buy');
    TestBed.inject(ConsentStore).accept();
    fixture.detectChanges();
    await fixture.whenStable();

    const iframe = frame(fixture);
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toContain('/shop/');
    // Lazy even then: after consent it is still only fetched when it is seen.
    expect(iframe?.getAttribute('loading')).toBe('lazy');
    // The licence server has no business knowing which page of ours framed it.
    expect(iframe?.getAttribute('referrerpolicy')).toBe('no-referrer');
  });

  it('keeps the frame out after a refusal', async () => {
    const fixture = await render('account');
    TestBed.inject(ConsentStore).reject();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(frame(fixture)).toBeNull();
  });

  it('frames the account view for the account route', async () => {
    const fixture = await render('account');
    TestBed.inject(ConsentStore).accept();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(frame(fixture)?.getAttribute('src')).toContain('/account/');
  });

  it('passes the page language into the shop', async () => {
    const fixture = await render('buy', 'fr');
    TestBed.inject(ConsentStore).accept();
    fixture.detectChanges();
    await fixture.whenStable();

    // Otherwise a French visitor gets a German shop inside a French page.
    expect(frame(fixture)?.getAttribute('src')).toContain('lang=fr');
  });

  it('titles the two views differently', async () => {
    const buy = (await render('buy')).nativeElement as HTMLElement;
    const account = (await render('account')).nativeElement as HTMLElement;

    expect(buy.querySelector('h1')?.textContent?.trim()).toBe('Lizenz kaufen');
    expect(account.querySelector('h1')?.textContent?.trim()).toBe('Konto');
  });
});

/**
 * A route as the pages read it: the data, and the path it was reached under.
 *
 * The path is there because `PageBase` builds the document title, the
 * canonical URL and the hreflang set from it - a stub without it would test a
 * page that cannot say which page it is.
 */
function routeStub(data: Record<string, unknown>) {
  const segments =
    data['lang'] === 'de' || data['lang'] === undefined ? [] : [String(data['lang'])];
  return {
    snapshot: {
      data,
      pathFromRoot: [{ url: segments.map((path) => ({ path })) }],
    },
  };
}
