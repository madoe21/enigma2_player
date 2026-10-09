import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { PageLanguage } from '../i18n/page-language';
import { SiteNav } from './site-nav';
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
    expect(labels()).toContain('Documentation');
    expect(labels()).not.toContain('Funktionen');
  });

  it('offers every language in its own name', () => {
    const names = links('.nav__langs a').map((link) => link.textContent?.trim());

    expect(names).toEqual(['Deutsch', 'English', 'Español', 'Français', 'Italiano']);
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

    const english = links('.nav__langs a').find((link) => link.textContent?.trim() === 'English');
    // Not back to the start page: someone reading the FAQ who switches
    // language wants the FAQ.
    expect(english?.getAttribute('href')).toBe('/en/faq');
  });

  it('falls back to the start page for a page that language does not have', async () => {
    await TestBed.inject(Router).navigateByUrl('/impressum');
    await fixture.whenStable();

    const italian = links('.nav__langs a').find((link) => link.textContent?.trim() === 'Italiano');
    // The legal texts exist in German and English only, deliberately, so the
    // Italian link leads somewhere that exists rather than to a dead URL.
    // `/it` without the trailing slash: the router normalises it in the href.
    expect(italian?.getAttribute('href')).toBe('/it');
  });
});
