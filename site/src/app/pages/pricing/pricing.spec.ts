import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { ConsentStore, CONSENT_COOKIE } from '../../consent/consent-store';
import { Pricing } from './pricing';
import { SiteContent } from '../../content/site-content';
import { getLicenseInfo } from '../../content/content';
import { routeStub } from '../page-route.stub';

/**
 * The merged pricing page: prices, what a licence covers, and the shop.
 *
 * Three pages until `enigma2_player-eer`, so there are three things to check
 * and one of them is new: that all three sections are actually on the page,
 * in one document, with an outline a reader can navigate.
 *
 * As of this build the licence server returns no models for this application -
 * its endpoint answers, the list is simply empty - so the honest test is of
 * both states: what the page says with nothing to sell, and what it renders
 * when the data is there. The second is driven by a fixture rather than by
 * waiting for the shop to be configured.
 */
describe('Pricing', () => {
  function clearCookie(): void {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${new URL(document.baseURI).pathname}`;
  }

  async function render(lang = 'de'): Promise<ComponentFixture<Pricing>> {
    TestBed.resetTestingModule();
    clearCookie();
    await TestBed.configureTestingModule({
      imports: [Pricing],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: routeStub({ lang }) }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Pricing);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(clearCookie);

  async function withModels(fixture: ComponentFixture<Pricing>): Promise<void> {
    TestBed.inject(SiteContent).prices.set([
      { id: 'single', name: 'Single', devices: 1, period: 'yearly', price: 9.5, currency: 'EUR' },
      { id: 'family', name: 'Family', devices: 5, period: 'lifetime', price: 49, currency: 'EUR' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('says so when there is nothing to sell yet', async () => {
    const fixture = await render();
    TestBed.inject(SiteContent).prices.set([]);
    fixture.detectChanges();
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // Not an empty page, and not the spinner the old page left standing when
    // its fetch returned nothing ("Preise werden geladen…").
    expect(text).toContain('Preise sind bald verfügbar');
    expect(text).not.toContain('geladen…');
  });

  it('renders a card per model, with price, period and device count', async () => {
    const fixture = await render();
    await withModels(fixture);

    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('.price-card');
    expect(cards.length).toBe(2);
    const first = cards[0].textContent ?? '';
    // Two decimals, because 9.5 EUR on a price tag reads as unfinished.
    expect(first).toContain('9.50 EUR');
    expect(first).toContain('/ Jahr');
    expect(first).toContain('Geräte');
    expect(cards[1].textContent).toContain('einmalig');
  });

  it('keeps an unknown period readable instead of blank', async () => {
    const fixture = await render();
    TestBed.inject(SiteContent).prices.set([
      { id: 'odd', name: 'Odd', devices: 2, period: 'quarterly', price: 5, currency: 'EUR' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    // A period this build has no word for shows its raw value. The visitor
    // sees something imperfect rather than a card with a hole in it.
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('quarterly');
  });

  it('sends a price card to the buy section of this page', async () => {
    const fixture = await render('en');
    await withModels(fixture);
    const element = fixture.nativeElement as HTMLElement;

    // It used to be a link to `/buy`, which is now this page's last section.
    expect(element.querySelector('.price-card .btn')?.getAttribute('href')).toBe('#buy');
    expect(element.querySelector('#buy')).not.toBeNull();
  });

  it('explains what a licence covers, on the same page', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const blocks = getLicenseInfo('de');

    // The content of the old `/license` page, which no longer exists: if this
    // is empty, the merge lost it.
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(element.textContent).toContain(block.heading);
    }
  });

  it('keeps one h1 and a heading per section', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('h1').length).toBe(1);
    // Two sections under the prices: what a licence covers, and buying it.
    // A price card is deliberately not a heading, so the outline stays the
    // three things the page is about (WCAG 1.3.1, 2.4.10).
    const h2 = Array.from(element.querySelectorAll('h2')).map((node) => node.textContent?.trim());
    expect(h2).toEqual(['Lizenzinfo', 'Lizenz kaufen']);
  });

  it('frames the shop only once the visitor accepted', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('#buy iframe')).toBeNull();

    TestBed.inject(ConsentStore).accept();
    fixture.detectChanges();
    await fixture.whenStable();

    // The shop view, not the account one - same component, different input.
    expect(element.querySelector('#buy iframe')?.getAttribute('src')).toContain('/shop/');
  });

  it('names the frame after the licence server, not after the heading above it', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    TestBed.inject(ConsentStore).accept();
    fixture.detectChanges();
    await fixture.whenStable();

    const title = element.querySelector('#buy iframe')?.getAttribute('title');
    expect(title).toBe('Kauf beim Lizenzserver');
    // The frame sits right under its own h2, and a screen reader reads both:
    // the same words twice say nothing about what is inside the frame
    // (enigma2_player-dp3).
    const headings = Array.from(element.querySelectorAll('h1, h2, h3')).map((heading) =>
      heading.textContent?.trim(),
    );
    expect(headings).not.toContain(title);
  });
});
