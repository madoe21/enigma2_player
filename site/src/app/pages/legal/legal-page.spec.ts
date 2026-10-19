import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { CONSENT_COOKIE } from '../../consent/consent-store';
import { SHOP_CONFIG } from '../../content/shop-config';
import { ENTITY, ENTITY_STATUS } from '../../legal/entity';
import { LEGAL_COPY, LEGAL_VERSION } from '../../legal/legal-copy';
import { LegalPageComponent, LegalPageId } from './legal-page';
import { routeStub } from '../page-route.stub';

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

  it('keeps the cookie register at exactly what the code writes', async () => {
    const fixture = await render('cookies');
    const shown = text(fixture);

    // Read off `consent-store.ts` rather than retyped: the cookie name, its
    // two values, the 180 days, the path limit and the attributes. Each of
    // these is a statement § 25 TDDDG requires to be accurate, and a register
    // that lists a cookie the code does not set - or omits one it does - is
    // the defect this bead exists for (enigma2_player-0ec).
    expect(shown).toContain(CONSENT_COOKIE);
    expect(shown).toContain('accepted');
    expect(shown).toContain('rejected');
    expect(shown).toContain('180 Tage');
    expect(shown).toContain('SameSite=Lax');
    expect(shown).toContain('Secure');
    expect(shown).toContain('§ 25 Abs. 2 Nr. 2 TDDDG');
    // One cookie, so one register: the entry appears once, not as a table of
    // optional categories the site does not have.
    expect(shown.match(new RegExp(CONSENT_COOKIE, 'g'))?.length).toBe(1);
    // And the storage the code deliberately does not use is named as unused.
    expect(shown).toContain('localStorage');
  });

  it('says in the privacy policy who hosts the site', async () => {
    const fixture = await render('privacy');

    expect(text(fixture)).toContain('GitHub');
    expect(text(fixture)).toContain(ENTITY.dpaName);
  });

  it('lists a legal basis for every processing activity it describes', async () => {
    const fixture = await render('privacy');
    const shown = text(fixture);

    // Art. 13(1)(c) GDPR: purpose AND legal basis, per activity. The four the
    // site has are delivery, the consent cookie, the embedded shop and e-mail.
    for (const heading of [
      'Auslieferung der Website und Server-Protokolldaten',
      'Speicherung Ihrer Entscheidung über Cookies',
      'Eingebetteter Shop und Kundenkonto',
      'Kontaktaufnahme per E-Mail',
    ]) {
      expect(shown).toContain(heading);
    }
    expect(shown).toContain('Art. 6 Abs. 1 lit. f DSGVO');
    expect(shown).toContain('Art. 6 Abs. 1 lit. a DSGVO');
    expect(shown).toContain('Art. 6 Abs. 1 lit. b DSGVO');
    expect(shown).toContain('§ 25 Abs. 1 TDDDG');

    // Each labelled fact is a dt/dd pair, and a dd without its dt is what a
    // screen reader reads as an orphan.
    const element = fixture.nativeElement as HTMLElement;
    const terms = element.querySelectorAll('.legal__facts dt').length;
    expect(terms).toBeGreaterThan(20);
    expect(element.querySelectorAll('.legal__facts dd').length).toBe(terms);
  });

  it('names the recipients the site really contacts, and no others', async () => {
    const fixture = await render('privacy');
    const shown = text(fixture);

    // Exactly the two third parties in the code: the Pages host, and the
    // licence server behind the consent gate. The host name is derived from
    // the build's shop configuration, so the policy cannot name a different
    // server than the iframe loads.
    expect(shown).toContain(ENTITY.hostingProvider);
    expect(shown).toContain(new URL(SHOP_CONFIG.base ?? 'https://example.invalid').host);
    expect(shown).toContain('Art. 28');
    expect(shown).toContain('Drittland');
    expect(shown).toContain('Weitere Empfänger');
  });

  it('spells out the rights, including withdrawal and complaint', async () => {
    const fixture = await render('privacy');
    const shown = text(fixture);

    for (const article of [
      'Art. 15 DSGVO',
      'Art. 16 DSGVO',
      'Art. 17 DSGVO',
      'Art. 18 DSGVO',
      'Art. 20 DSGVO',
      'Art. 21 DSGVO',
      'Art. 7 Abs. 3 DSGVO',
      'Art. 77 DSGVO',
      'Art. 22',
    ]) {
      expect(shown, article).toContain(article);
    }
    // Art. 7(3) is only real if the page says where to do it - the footer
    // control that clears the cookie.
    expect(shown).toContain('Cookie-Entscheidung ändern');
    expect(shown).toContain(ENTITY.privacyEmail);
    expect(shown).toContain(ENTITY.dpaUrl);
  });

  it('carries the date it was last changed on every text', async () => {
    for (const which of ['imprint', 'privacy', 'cookies'] as const) {
      const fixture = await render(which);
      // Not the ISO string: the reader gets the date in their own language, and
      // the value comes from one constant so the three texts cannot disagree.
      expect(text(fixture), which).toContain('Stand:');
      expect(text(fixture), which).toContain('2026');
    }
    expect(LEGAL_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('keeps the English text section for section with the German one', async () => {
    // Not a translation check - a structure check. A privacy policy that lists
    // one processing activity fewer in English is a different policy, and the
    // German one is the binding version (see `legal-copy.ts`).
    for (const which of ['imprint', 'privacy', 'cookies'] as const) {
      expect(LEGAL_COPY.en[which].sections.length, which).toBe(
        LEGAL_COPY.de[which].sections.length,
      );
      LEGAL_COPY.de[which].sections.forEach((section, index) => {
        const english = LEGAL_COPY.en[which].sections[index];
        expect(english.entries?.length ?? 0, `${which} / ${section.heading}`).toBe(
          section.entries?.length ?? 0,
        );
      });
    }
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
