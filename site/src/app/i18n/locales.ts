/**
 * The languages this site is published in - the one place that knows them.
 *
 * The Astro site it replaces kept the list in three places (astro.config.mjs,
 * src/i18n/ui.ts and a two-literal check inside getLangFromUrl), and one of
 * them was wrong: `/fr` and `/it` had pages and content but were served as
 * German, including `<html lang="de">`, which makes a screen reader read
 * French with a German voice (enigma2_player_source-w83). A list repeated three
 * times is a list that disagrees with itself eventually, so here there is one.
 */
export const locales = ['de', 'en', 'es', 'fr', 'it'] as const;

/** A language this site has content for. */
export type Lang = (typeof locales)[number];

/**
 * German, and it has no URL prefix.
 *
 * Keeping `de` at the root is not cosmetic: the site is linked and indexed
 * under those URLs, and moving them would cost placement and break the links
 * in the application, the imprint and the shop.
 */
export const defaultLang: Lang = 'de';

/** The languages that live under a prefix: everything except [defaultLang]. */
export const prefixedLocales: readonly Lang[] = locales.filter((lang) => lang !== defaultLang);

/**
 * The languages in their own names - the accessible name of a switcher entry.
 *
 * "Deutsch", not "German": a language switcher is read by someone looking for
 * their own language, and the only word they are certain to recognise is the
 * one their language calls itself. That is why these are not in the five
 * dictionaries - an endonym does not change with the page's language, and a
 * name repeated five times is a name that disagrees with itself eventually
 * (the lesson at the top of this file).
 *
 * They live here because this file is where languages are named, full stop
 * (AGENTS.md §2b). The visible short code is `lang.toUpperCase()` and is
 * deliberately not a second list: it is the language tag itself, and every one
 * of these names starts with it, which is what keeps the visible label inside
 * the accessible name (WCAG 2.5.3).
 */
export const languageNames: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
};

/** Whether `value` is one of the languages this site publishes. */
export function isLang(value: string | null | undefined): value is Lang {
  return value != null && (locales as readonly string[]).includes(value);
}

/**
 * The language a URL segment names, or [defaultLang].
 *
 * Reads the list above rather than naming languages again - the whole point of
 * this file.
 */
export function langFromSegment(segment: string | null | undefined): Lang {
  return isLang(segment) ? segment : defaultLang;
}

/**
 * The site path for a route in a language, without the base href.
 *
 * `path('features', 'en')` -> `/en/features`, `path('', 'de')` -> `/`.
 * Angular prefixes the configured base href itself, so it must not appear
 * here - doing it in both places is how a link ends up at
 * `/enigma2_player/enigma2_player/features`.
 */
export function localePath(route: string, lang: Lang): string {
  const clean = route.replace(/^\/+|\/+$/g, '');
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  return clean ? `${prefix}/${clean}` : `${prefix}/`;
}
