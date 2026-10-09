import { languagesOf, pageRoutes, pathOf, sitePaths } from './app.routes';
import { locales } from './i18n/locales';
import { legalLocales } from './legal/legal-copy';
import { serverRoutes } from './app.routes.server';

/**
 * The route tree, which on a site without a backend decides which files exist.
 *
 * A page that is routed but never prerendered is a 404 that works locally -
 * the reason these two lists are derived from one definition and the reason
 * that is worth a test.
 */
describe('the site map', () => {
  it('gives every page a slug in every language it is published in', () => {
    for (const page of pageRoutes) {
      for (const lang of languagesOf(page)) {
        expect(page.slug[lang], `${page.id} in ${lang}`).toBeDefined();
      }
    }
  });

  it('names the legal pages in the language of the reader', () => {
    const imprint = pageRoutes.find((page) => page.id === 'imprint')!;

    expect(pathOf(imprint, 'de')).toBe('/impressum');
    expect(pathOf(imprint, 'en')).toBe('/en/imprint');
    // Not /en/impressum: a legal page has to be findable under the word a
    // reader would use.
    expect(pathOf(imprint, 'en')).not.toContain('impressum');
  });

  it('publishes the landing page in all five languages', () => {
    const landing = pageRoutes.find((page) => page.id === 'landing')!;

    expect(languagesOf(landing)).toEqual(locales);
    expect(pathOf(landing, 'de')).toBe('/');
    expect(pathOf(landing, 'it')).toBe('/it/');
  });

  it('publishes the legal pages in German and English only, deliberately', () => {
    for (const id of ['imprint', 'privacy', 'cookies']) {
      const page = pageRoutes.find((candidate) => candidate.id === id)!;
      expect(languagesOf(page), id).toEqual(legalLocales);
    }
  });

  it('prerenders exactly the paths the router serves', () => {
    const routed = sitePaths()
      .map(({ path }) => path.replace(/^\/+/, ''))
      .sort();
    const prerendered = serverRoutes.map((route) => route.path).sort();

    // Derived from the same list, and this is the test that keeps it that way:
    // two enumerations drift, and the drift is invisible until a deployed page
    // 404s.
    expect(prerendered).toEqual(routed);
  });

  it('has no duplicate paths', () => {
    const paths = sitePaths().map(({ path }) => path);

    expect(new Set(paths).size).toBe(paths.length);
  });
});
