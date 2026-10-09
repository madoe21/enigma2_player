import { Routes } from '@angular/router';

import { defaultLang, prefixedLocales } from './i18n/locales';

/**
 * The pages this site has, named once.
 *
 * The route tree is built from this list for every language, so a page cannot
 * exist in German and be missing in Italian - which is the failure the Astro
 * site's one-directory-per-language layout invited (five copies of every page,
 * kept in step by hand).
 */
export const pageRoutes = [
  {
    path: '',
    load: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
] as const;

/**
 * de at the root, every other language under its own prefix.
 *
 * Order matters: the unprefixed routes come first, so `/features` is the German
 * page and not a language called "features". The prefixed branch validates the
 * segment itself, because `/klingon/features` must not render as German under
 * a URL that claims otherwise.
 */
export const routes: Routes = [
  ...pageRoutes.map((page) => ({
    path: page.path,
    loadComponent: page.load,
    data: { lang: defaultLang },
  })),
  ...prefixedLocales.map((lang) => ({
    path: lang,
    children: pageRoutes.map((page) => ({
      path: page.path,
      loadComponent: page.load,
      data: { lang },
    })),
  })),
];
