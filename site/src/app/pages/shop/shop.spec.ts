import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { CONSENT_COOKIE, ConsentStore } from '../../consent/consent-store';
import { Shop } from './shop';
import { routeStub } from '../page-route.stub';

/**
 * The account page, which frames the licence server's account view.
 *
 * The gate in front of that frame is tested once, in `shop-frame.spec.ts`:
 * both pages that embed the shop use the same component since the pricing
 * merge (enigma2_player-eer). What is left here is this page's own job - the
 * right view, the right heading, the right language.
 */
describe('Shop', () => {
  function clearCookie(): void {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${new URL(document.baseURI).pathname}`;
  }

  async function render(lang = 'de'): Promise<ComponentFixture<Shop>> {
    TestBed.resetTestingModule();
    clearCookie();
    await TestBed.configureTestingModule({
      imports: [Shop],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub({ lang, view: 'account' }) },
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

  it('frames the account view, not the shop', async () => {
    const fixture = await render();
    TestBed.inject(ConsentStore).accept();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(frame(fixture)?.getAttribute('src')).toContain('/account/');
  });

  it('waits for consent like every other embed', async () => {
    const fixture = await render();

    expect(frame(fixture)).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="note"]')).not.toBeNull();
  });

  it('names the frame after the licence server, not after its own heading', async () => {
    const fixture = await render();
    TestBed.inject(ConsentStore).accept();
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const title = frame(fixture)?.getAttribute('title');
    expect(title).toBe('Kundenkonto beim Lizenzserver');
    // The defect this replaces: the frame carried the h1's own words, so a
    // screen reader read "heading Mein Konto ... frame Mein Konto" and the
    // embedded application sounded like the heading said twice
    // (enigma2_player-dp3).
    expect(title).not.toBe(element.querySelector('h1')?.textContent?.trim());
  });

  it('is headed as the account, in the page language', async () => {
    const german = (await render()).nativeElement as HTMLElement;
    const english = (await render('en')).nativeElement as HTMLElement;

    // "Mein Konto" rather than "Konto": the nav entry was relabelled so a
    // visitor can tell a page about their own account from a page about
    // licences (enigma2_player-amx).
    expect(german.querySelector('h1')?.textContent?.trim()).toBe('Mein Konto');
    expect(english.querySelector('h1')?.textContent?.trim()).toBe('My Account');
  });
});
