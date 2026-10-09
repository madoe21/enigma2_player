import { Routes } from '@angular/router';

import { Lang, defaultLang, locales, localePath } from './i18n/locales';
import { legalLocales } from './legal/legal-copy';

/**
 * A page of this site: what it is called in each language, and who renders it.
 *
 * The slug is per language because a legal page has to be findable under the
 * word a reader would use - `/impressum` in German and `/en/imprint` in
 * English, not `/en/impressum` (enigma2_player-esp). `languages` exists for the
 * same honesty: a page may be published in fewer languages than the site, and
 * the route tree then simply has no route for the others rather than serving
 * them something unchecked.
 */
export interface PageDefinition {
  /** Stable id, used in tests and in the sitemap. */
  readonly id: string;
  /** The URL segment per language. Empty string for the landing page. */
  readonly slug: Readonly<Record<Lang, string>>;
  readonly load: () => Promise<unknown>;
  /** The languages this page exists in. Defaults to all of them. */
  readonly languages?: readonly Lang[];
  /** Extra route data, e.g. which legal text to render. */
  readonly data?: Readonly<Record<string, unknown>>;
}

/** The same slug in every language, for pages whose name does not translate. */
function everywhere(slug: string): Record<Lang, string> {
  return Object.fromEntries(locales.map((lang) => [lang, slug])) as Record<Lang, string>;
}

/**
 * The pages this site has, named once.
 *
 * The route tree is built from this list for every language, so a page cannot
 * exist in German and be missing in Italian by accident - which is the failure
 * the Astro site's one-directory-per-language layout invited (five copies of
 * every page, kept in step by hand). Where a page is deliberately not in every
 * language, it says so in `languages`.
 */
export const pageRoutes: readonly PageDefinition[] = [
  {
    id: 'landing',
    slug: everywhere(''),
    load: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    id: 'imprint',
    slug: {
      de: 'impressum',
      en: 'imprint',
      es: 'aviso-legal',
      fr: 'mentions-legales',
      it: 'note-legali',
    },
    languages: legalLocales,
    data: { which: 'imprint' },
    load: () => import('./pages/legal/legal-page').then((m) => m.LegalPageComponent),
  },
  {
    id: 'privacy',
    slug: {
      de: 'datenschutz',
      en: 'privacy',
      es: 'privacidad',
      fr: 'confidentialite',
      it: 'privacy',
    },
    languages: legalLocales,
    data: { which: 'privacy' },
    load: () => import('./pages/legal/legal-page').then((m) => m.LegalPageComponent),
  },
  {
    id: 'cookies',
    slug: everywhere('cookies'),
    languages: legalLocales,
    data: { which: 'cookies' },
    load: () => import('./pages/legal/legal-page').then((m) => m.LegalPageComponent),
  },
];

/** The languages a page is published in. */
export function languagesOf(page: PageDefinition): readonly Lang[] {
  return page.languages ?? locales;
}

/** The site path of a page in a language, without the base href. */
export function pathOf(page: PageDefinition, lang: Lang): string {
  return localePath(page.slug[lang], lang);
}

/**
 * Every concrete path this site publishes.
 *
 * One list, used by the router, by the prerender configuration and - once
 * `enigma2_player-9v1` lands - by the sitemap. Three enumerations of the same
 * set is how a page ends up routed but never written out as a file, which on a
 * site with no backend means a 404 for a page that works locally.
 */
export function sitePaths(): readonly { readonly path: string; readonly lang: Lang }[] {
  return pageRoutes.flatMap((page) =>
    languagesOf(page).map((lang) => ({ path: pathOf(page, lang), lang })),
  );
}

/**
 * de at the root, every other language under its own prefix.
 *
 * Built from the definitions above rather than written out: the prefixed
 * branch has to validate its own segment, because `/klingon/features` must not
 * render as German under a URL that claims otherwise.
 */
export const routes: Routes = [
  // The default language, unprefixed, first - so `/impressum` is the German
  // page and not a language called "impressum".
  ...pageRoutes
    .filter((page) => languagesOf(page).includes(defaultLang))
    .map((page) => ({
      path: page.slug[defaultLang],
      loadComponent: page.load as never,
      data: { lang: defaultLang, ...page.data },
    })),
  ...locales
    .filter((lang) => lang !== defaultLang)
    .map((lang) => ({
      path: lang,
      children: pageRoutes
        .filter((page) => languagesOf(page).includes(lang))
        .map((page) => ({
          path: page.slug[lang],
          loadComponent: page.load as never,
          data: { lang, ...page.data },
        })),
    })),
];
