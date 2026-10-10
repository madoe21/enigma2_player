import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { ENTITY, ENTITY_STATUS } from '../../legal/entity';
import { LegalPageComponent, LegalPageId } from './legal-page';

describe('LegalPageComponent', () => {
  async function render(
    which: LegalPageId,
    lang = 'de',
  ): Promise<ComponentFixture<LegalPageComponent>> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [LegalPageComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: routeStub({ lang }) }],
    }).compileComponents();

    const fixture = TestBed.createComponent(LegalPageComponent);
    fixture.componentRef.setInput('which', which);
    await fixture.whenStable();
    return fixture;
  }

  function text(fixture: ComponentFixture<LegalPageComponent>): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('renders the imprint with everything §5 DDG asks for', async () => {
    const fixture = await render('imprint');

    // Each of these is a requirement, not a nicety: provider, representation,
    // fast electronic contact, register entry, VAT id, and the person
    // answerable for the content under §18 MStV.
    for (const heading of [
      'Anbieter',
      'Vertreten durch',
      'Kontakt',
      'Registereintrag',
      'Umsatzsteuer-Identifikationsnummer',
      'Verantwortlich für den Inhalt',
    ]) {
      expect(text(fixture)).toContain(heading);
    }
  });

  it('shows the gaps as gaps, rather than inventing an address', async () => {
    const fixture = await render('imprint');

    expect(ENTITY_STATUS).toBe('PLACEHOLDERS_UNFILLED');
    expect(text(fixture)).toContain(ENTITY.legalName);
    expect(text(fixture)).toContain('⟨');
  });

  it('names the one cookie in the policy, with its legal basis', async () => {
    const fixture = await render('cookies');

    // The policy has to describe what is actually stored. The name, the two
    // possible values, the lifetime and the basis are exactly what the code
    // in consent-store.ts does - a policy that drifts from the code is worse
    // than none, because it is a promise nobody keeps.
    expect(text(fixture)).toContain('e2p_consent');
    expect(text(fixture)).toContain('6 Monate');
    expect(text(fixture)).toContain('TDDDG');
  });

  it('says in the privacy policy who hosts the site', async () => {
    const fixture = await render('privacy');

    expect(text(fixture)).toContain('GitHub');
    expect(text(fixture)).toContain(ENTITY.dpaName);
  });

  it('has one h1 and no skipped heading level', async () => {
    const fixture = await render('privacy');
    const element = fixture.nativeElement as HTMLElement;

    // A long legal text is navigated by its heading list. One h1, the rest h2,
    // nothing in between missing (WCAG 1.3.1).
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.querySelectorAll('h2').length).toBeGreaterThan(2);
    expect(element.querySelectorAll('h3,h4,h5,h6').length).toBe(0);
  });

  it('serves English for a language that has no legal text, and says so', async () => {
    const fixture = await render('imprint', 'fr');

    expect(fixture.componentInstance.hasOwnLanguage()).toBe(false);
    expect(text(fixture)).toContain('Imprint');
    // The fallback is visible rather than silent: a French reader is told the
    // texts exist in German and English, not left wondering.
    expect(text(fixture)).toContain('German and English');
  });

  it('keeps German as the binding version', async () => {
    const fixture = await render('cookies', 'en');

    expect(text(fixture)).toContain('German version is the binding one');
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
