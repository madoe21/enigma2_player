import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { PageLanguage } from '../i18n/page-language';
import { SiteNav } from './site-nav';
import { languageNames, locales } from '../i18n/locales';
import { pageRoutes, routes } from '../app.routes';

describe('SiteNav', () => {
  let fixture: ComponentFixture<SiteNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteNav],
      // The real route tree, because what is being tested is that the nav is
      // built from it - a stub would test the stub.
      providers: [provideRouter(routes)],
    }).compileComponents();
    fixture = TestBed.createComponent(SiteNav);
    await fixture.whenStable();
  });

  function links(selector: string): HTMLAnchorElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll(selector));
  }

  function labels(): string[] {
    return links('.nav__links a').map((link) => link.textContent?.trim() ?? '');
  }

  /**
   * The language entries by the name they are announced under.
   *
   * The visible label is the flag plus a two-letter code; the name is what the
   * link is CALLED, so a test looking for "English" has to look where a screen
   * reader does.
   */
  function langLink(name: string): HTMLAnchorElement | undefined {
    return links('.nav__langs a').find(
      (link) => link.querySelector('.nav__lang-name')?.textContent?.trim() === name,
    );
  }

  it('links the start page by name, not only through the brand', () => {
    // The Astro nav had a "Start" entry; it went missing in the port and the
    // comparison against the old build caught it. The brand is a logo - the
    // entry is what a visitor finds in a list of links.
    expect(labels()[0]).toBe('Start');
  });

  it('links every page that has a nav label, and nothing else', () => {
    const expected = pageRoutes.filter((page) => page.navKey !== undefined).length;

    // +1 for the start page. The count is derived from the definitions, so a
    // new page is in the nav without anyone remembering to add it there - and
    // a page without a label (the legal texts, which live in the footer) stays
    // out.
    expect(labels().length).toBe(expected + 1);
  });

  it('marks the current page for a screen reader, not only in bold', async () => {
    await TestBed.inject(Router).navigateByUrl('/features');
    await fixture.whenStable();

    const current = links('.nav__links a[aria-current="page"]');
    expect(current.length).toBe(1);
    expect(current[0].textContent?.trim()).toBe('Funktionen');
  });

  it('translates the labels', async () => {
    TestBed.inject(PageLanguage).set('en');
    await fixture.whenStable();

    expect(labels()).toContain('Features');
    expect(labels()).toContain('Manual');
    expect(labels()).toContain('Security');
    expect(labels()).not.toContain('Funktionen');
    expect(labels()).not.toContain('Anleitung');
  });

  it('offers every language in its own name', () => {
    const names = links('.nav__langs a').map((link) =>
      link.querySelector('.nav__lang-name')?.textContent?.trim(),
    );

    // The PO asked for flags, and this is the line that keeps that from
    // costing a reader the entry: whatever the eye gets, the name is the
    // language's own (enigma2_player-13h).
    expect(names).toEqual(['Deutsch', 'English', 'Español', 'Français', 'Italiano']);
  });

  it('shows a flag and the language tag, and offers the name as the tooltip', () => {
    const entries = links('.nav__langs a');
    expect(entries.length).toBe(locales.length);

    for (const [index, link] of entries.entries()) {
      const lang = locales[index];
      // One flag per entry, drawn inline rather than fetched.
      expect(link.querySelectorAll('site-lang-flag svg').length, lang).toBe(1);
      expect(link.querySelectorAll('img').length, lang).toBe(0);
      // The code is the language tag itself, not a second list of five.
      expect(link.querySelector('.nav__lang-code')?.textContent?.trim(), lang).toBe(
        lang.toUpperCase(),
      );
      expect(link.getAttribute('title'), lang).toBe(languageNames[lang]);
    }
  });

  it('announces the name rather than the flag or the code', () => {
    for (const link of links('.nav__langs a')) {
      // The flag is decoration and the code is an abbreviation of the name;
      // both are hidden so the entry is announced once, as "Deutsch", not as
      // "image DE Deutsch" (the AC of enigma2_player-13h).
      expect(link.querySelector('site-lang-flag svg')?.getAttribute('aria-hidden')).toBe('true');
      expect(link.querySelector('.nav__lang-code')?.getAttribute('aria-hidden')).toBe('true');
      expect(link.querySelector('.nav__lang-name')?.hasAttribute('aria-hidden')).toBe(false);
      // No `aria-label`: the name is real text, reachable by find-in-page and
      // present with no CSS at all.
      expect(link.hasAttribute('aria-label')).toBe(false);
    }
  });

  it('keeps the visible code inside the accessible name', () => {
    // WCAG 2.5.3: someone saying "Deutsch" to a voice control must hit the
    // link labelled DE. It holds because every endonym starts with its own
    // language tag - a test rather than a comment, because a sixth language
    // could be the one where it stops holding (Suomi/fi would).
    for (const lang of locales) {
      expect(languageNames[lang].toLowerCase().startsWith(lang), lang).toBe(true);
    }
  });

  it('marks each language link with the language it leads to', () => {
    // `hreflang` and `lang` on a language link are what let a screen reader
    // pronounce "Français" in French instead of reading it as German.
    for (const link of links('.nav__langs a')) {
      expect(link.getAttribute('hreflang')).toBe(link.getAttribute('lang'));
      expect(link.getAttribute('hreflang')).toBeTruthy();
    }
  });

  it('keeps the visitor on the page when they switch language', async () => {
    await TestBed.inject(Router).navigateByUrl('/faq');
    await fixture.whenStable();

    // Not back to the start page: someone reading the FAQ who switches
    // language wants the FAQ.
    expect(langLink('English')?.getAttribute('href')).toBe('/en/faq');
  });

  it('falls back to the start page for a page that language does not have', async () => {
    await TestBed.inject(Router).navigateByUrl('/impressum');
    await fixture.whenStable();

    // The legal texts exist in German and English only, deliberately, so the
    // Italian link leads somewhere that exists rather than to a dead URL.
    // `/it` without the trailing slash: the router normalises it in the href.
    expect(langLink('Italiano')?.getAttribute('href')).toBe('/it');
  });
});
