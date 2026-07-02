/** i18n helpers: detect the locale from a URL and translate/route by it. */
import {ui, defaultLang, type Lang, type UiKey} from './ui';

/** Reads the active locale from the URL path (`/en/...`, `/es/...` → else de). */
export function getLangFromUrl(url: URL): Lang {
  const [, maybeLang] = url.pathname.replace(baseUrl(), '/').split('/');
  if (maybeLang === 'en' || maybeLang === 'es') return maybeLang;
  return defaultLang;
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
 */
export function routeKey(url: URL): string {
  const segments = url.pathname
    .replace(baseUrl(), '')
    .split('/')
    .filter(Boolean);
  if (segments[0] === 'en' || segments[0] === 'es') segments.shift();
  return segments.join('/');
}

/** Absolute-from-base path to a file in `public/` (e.g. `favicon.svg`). */
export function asset(path: string): string {
  return `${baseUrl()}/${path.replace(/^\/+/, '')}`;
}
