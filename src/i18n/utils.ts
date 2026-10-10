/** i18n helpers: detect the locale from a URL and translate/route by it. */
import {ui, defaultLang, languages, type Lang, type UiKey} from './ui';

/**
 * Whether a path segment names one of the site's locales.
 *
 * Reads `languages`, which is the one place the list exists. Two call sites
 * below used to compare against the literals `'en'` and `'es'`, so `/fr` and
 * `/it` were served as German — the same list written three times
 * (here, `ui.ts`, `astro.config.mjs`) and one of them left behind
 * (enigma2_player-w83).
 */
function isLang(segment: string | undefined): segment is Lang {
  // `hasOwn`, not `in`: `in` walks the prototype, so a path segment called
  // `toString` or `constructor` would pass as a locale.
  return segment !== undefined && Object.hasOwn(languages, segment);
}

/**
 * Reads the active locale from the URL path (`/en/...`, `/fr/...` → else de).
 *
 * The base path is stripped to nothing, not to `/`: with `base:
 * '/enigma2_player'` the old `replace(baseUrl(), '/')` turned
 * `/enigma2_player/en/` into `//en/`, whose first segment after the split is
 * empty. So in a DEPLOYED build the locale check never saw a locale and every
 * prefixed page fell back to German — including `/en` and `/es`, which the
 * two-literal list would have allowed. Locally, where there is no base path,
 * it worked; that is why it went unseen.
 */
export function getLangFromUrl(url: URL): Lang {
  const [, maybeLang] = url.pathname.replace(baseUrl(), '').split('/');
  return isLang(maybeLang) ? maybeLang : defaultLang;
}

/** Returns a translator that falls back to the default locale for missing keys. */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** The configured base path, always without a trailing slash. */
export function baseUrl(): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

/**
 * Builds an absolute site path for a route + locale, honouring the base path.
 * `href('features', 'en')` → `/enigma2_player/en/features`.
 * `href('', 'de')` → `/enigma2_player/`.
 */
export function href(path: string, lang: Lang): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  const tail = clean ? `/${clean}` : '/';
  return `${baseUrl()}${prefix}${tail}`;
}

/**
 * The locale-independent route key for a URL (e.g. `/enigma2_player/en/features`
 * → `features`, home → ''). Used to build hreflang alternates.
 *
 * The default locale is excluded deliberately: `de` is unprefixed, so a `de`
 * segment is a route name and not a locale. Dropping it would make a page
 * called `de` claim the alternates of the start page.
 */
export function routeKey(url: URL): string {
  const segments = url.pathname
    .replace(baseUrl(), '')
    .split('/')
    .filter(Boolean);
  if (isLang(segments[0]) && segments[0] !== defaultLang) segments.shift();
  return segments.join('/');
}

/** Absolute-from-base path to a file in `public/` (e.g. `favicon.svg`). */
export function asset(path: string): string {
  return `${baseUrl()}/${path.replace(/^\/+/, '')}`;
}
