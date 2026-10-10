import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { Pricing } from './pricing';
import { SiteContent } from '../../content/site-content';

/**
 * The price table.
 *
 * As of this build the licence server returns no models for this application -
 * its endpoint answers, the list is simply empty - so the honest test is of
 * both states: what the page says with nothing to sell, and what it renders
 * when the data is there. The second is driven by a fixture rather than by
 * waiting for the shop to be configured.
 */
describe('Pricing', () => {
  async function render(lang = 'de'): Promise<ComponentFixture<Pricing>> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Pricing],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: routeStub({ lang }) }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Pricing);
    await fixture.whenStable();
    return fixture;
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
    TestBed.inject(SiteContent).prices.set([
      { id: 'single', name: 'Single', devices: 1, period: 'yearly', price: 9.5, currency: 'EUR' },
      { id: 'family', name: 'Family', devices: 5, period: 'lifetime', price: 49, currency: 'EUR' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

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

  it('sends the visitor to the purchase page in their language', async () => {
    const fixture = await render('en');
    const component = fixture.componentInstance as unknown as { buyHref: () => string };

    expect(component.buyHref()).toBe('/en/buy');
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
