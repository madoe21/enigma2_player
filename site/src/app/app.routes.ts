import { Routes } from '@angular/router';

import { Lang, defaultLang, locales, localePath } from './i18n/locales';
import { legalLocales } from './legal/legal-copy';
import { UiKey } from './content/ui';

/**
 * A page of this site: what it is called in each language, and who renders it.
 *
 * The slug is per language where the word matters - `/impressum` in German and
 * `/en/imprint` in English, not `/en/impressum` (enigma2_player-esp). The
 * product pages keep the slugs the Astro site used in every language, because
 * those URLs are linked and indexed and moving them costs placement
 * (enigma2_player-9v1).
 *
 * `languages` is the same kind of honesty: a page may be published in fewer
 * languages than the site, and the route tree then has no route for the others
 * rather than serving them something unchecked.
 */
export interface PageDefinition {
  /** Stable id, used by the navigation, the tests and the sitemap. */
  readonly id: string;
  /** The URL segment per language. Empty string for the landing page. */
  readonly slug: Readonly<Record<Lang, string>>;
  readonly load: () => Promise<unknown>;
  /** The languages this page exists in. Defaults to all of them. */
  readonly languages?: readonly Lang[];
  /** The UI key of its navigation label, or undefined to keep it out of the nav. */
  readonly navKey?: UiKey;
  /** Extra route data, e.g. which legal text or which shop view to render. */
  readonly data?: Readonly<Record<string, unknown>>;
}

/** The same slug in every language, for pages whose name stays as it is. */
function everywhere(slug: string): Record<Lang, string> {
  return Object.fromEntries(locales.map((lang) => [lang, slug])) as Record<Lang, string>;
}

/**
 * The pages this site has, named once.
 *
 * The route tree, the prerender list and the navigation are all built from
 * this one list. The Astro site had three: a directory per language with a
 * file per page, a `sections` array for the navigation, and a `builtSections`
 * set listing which of those sections actually had a page - that third list
 * existed only because the first two could disagree, and a nav entry could
 * lead to a 404.
 */
export const pageRoutes: readonly PageDefinition[] = [
  {
    id: 'landing',
    slug: everywhere(''),
    load: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    id: 'features',
    slug: everywhere('features'),
    navKey: 'nav.features',
    load: () => import('./pages/features/features').then((m) => m.Features),
  },
  {
    id: 'screenshots',
    slug: everywhere('screenshots'),
    navKey: 'nav.screenshots',
    load: () => import('./pages/screenshots/screenshots').then((m) => m.Screenshots),
  },
  {
    id: 'downloads',
    slug: everywhere('downloads'),
    navKey: 'nav.downloads',
    load: () => import('./pages/downloads/downloads').then((m) => m.Downloads),
  },
  {
    id: 'changelog',
    slug: everywhere('changelog'),
    navKey: 'nav.changelog',
    load: () => import('./pages/changelog/changelog').then((m) => m.Changelog),
  },
  {
    id: 'docs',
    slug: everywhere('docs'),
    navKey: 'nav.docs',
    load: () => import('./pages/docs/docs').then((m) => m.Docs),
  },
  {
    id: 'faq',
    slug: everywhere('faq'),
    navKey: 'nav.faq',
    load: () => import('./pages/faq/faq').then((m) => m.Faq),
  },
  {
    id: 'pricing',
    slug: everywhere('pricing'),
    navKey: 'nav.pricing',
    load: () => import('./pages/pricing/pricing').then((m) => m.Pricing),
  },
  {
    id: 'buy',
    slug: everywhere('buy'),
    navKey: 'nav.buy',
    data: { view: 'buy' },
    load: () => import('./pages/shop/shop').then((m) => m.Shop),
  },
  {
    id: 'account',
    slug: everywhere('account'),
    navKey: 'nav.account',
    data: { view: 'account' },
    load: () => import('./pages/shop/shop').then((m) => m.Shop),
  },
  {
    id: 'license',
    slug: everywhere('license'),
    navKey: 'nav.license',
    load: () => import('./pages/license/license').then((m) => m.License),
  },
  {
    id: 'contact',
    slug: everywhere('contact'),
    navKey: 'nav.contact',
    load: () => import('./pages/contact/contact').then((m) => m.Contact),
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

/** The page a site path belongs to, or undefined for an unknown path. */
export function pageOfPath(path: string): PageDefinition | undefined {
  const normalised = `/${path.replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '/');
  return pageRoutes.find((page) =>
    languagesOf(page).some((lang) => pathOf(page, lang).replace(/\/$/, '') === normalised.replace(/\/$/, '')),
  );
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
 * Order matters: the unprefixed routes come first, so `/features` is the
 * German page and not a language called "features". The prefixed branch
 * validates its own segment, because `/klingon/features` must not render as
 * German under a URL that claims otherwise.
 */
export const routes: Routes = [
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
