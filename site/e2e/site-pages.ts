/**
 * Every path this site publishes, per language - for the suites that sweep it.
 *
 * `pages.spec.ts`, `a11y.spec.ts` and `reflow.spec.ts` each kept their own copy
 * of the page list. That worked while every slug was the same word in all five
 * languages; `/docs` becoming `/anleitung` and `/sicherheit`
 * (enigma2_player-1zl, -lk7, -6jv) ended that, and three hand-kept copies of a
 * translated list are three chances to sweep a path that no longer exists - a
 * green suite that tested nothing.
 *
 * `app.routes.ts` is the source of truth and is deliberately not imported here:
 * it pulls `@angular/router` into the Playwright process for a list of strings.
 * This file is the one restatement of it, and the suites compare it against the
 * build's own output (`seo.spec.ts` against `prerendered-routes.json`), so a
 * route added there and forgotten here shows up as a failure rather than as a
 * gap.
 */
export const LANGS = ['de', 'en', 'es', 'fr', 'it'] as const;

export type SiteLang = (typeof LANGS)[number];

/** The URL prefix of a language: German sits at the root, the rest under theirs. */
export function prefixOf(lang: SiteLang): string {
  return lang === 'de' ? '' : `${lang}/`;
}

/** A slug that is the same word in every language. */
function everywhere(slug: string): Record<SiteLang, string> {
  return Object.fromEntries(LANGS.map((lang) => [lang, slug])) as Record<SiteLang, string>;
}

/** The product pages, landing page first, each one its own page. */
const CANONICAL_SLUGS: readonly Readonly<Record<SiteLang, string>>[] = [
  everywhere(''),
  everywhere('features'),
  everywhere('screenshots'),
  everywhere('downloads'),
  everywhere('changelog'),
  { de: 'anleitung', en: 'manual', es: 'manual', fr: 'manuel', it: 'manuale' },
  { de: 'sicherheit', en: 'security', es: 'seguridad', fr: 'securite', it: 'sicurezza' },
  everywhere('faq'),
  everywhere('pricing'),
  everywhere('account'),
  everywhere('contact'),
];

/**
 * Paths that are not pages: they render the merged pricing page.
 *
 * `/buy` and `/license` were pages of their own until the PO merged pricing,
 * licence information and buying into one (enigma2_player-eer). They still have
 * to be served - the application links `/buy` and the old sitemap listed both -
 * and they are the kind of path that stops being emitted without anyone
 * noticing, so the sweeps include them. They are separate from the canonical
 * list because they deliberately share the merged page's title and canonical
 * URL, which is a duplicate anywhere else on the site.
 */
const ALIAS_SLUGS: readonly Readonly<Record<SiteLang, string>>[] = [
  everywhere('buy'),
  everywhere('license'),
];

/** The three legal texts, which exist in German and English only. */
const LEGAL_SLUGS: readonly Readonly<Record<SiteLang, string>>[] = [
  { de: 'impressum', en: 'imprint', es: 'aviso-legal', fr: 'mentions-legales', it: 'note-legali' },
  { de: 'datenschutz', en: 'privacy', es: 'privacidad', fr: 'confidentialite', it: 'privacy' },
  everywhere('cookies'),
];

/** The languages the legal texts are published in. */
export const LEGAL_LANGS: readonly SiteLang[] = ['de', 'en'];

/** One language's slugs as paths relative to the base href. */
function pathsOf(
  slugs: readonly Readonly<Record<SiteLang, string>>[],
  lang: SiteLang,
): readonly string[] {
  // The landing page keeps the prefix's trailing slash (`en/`, not `en`): the
  // static server answers the directory, and the bare form relies on a
  // redirect that the deployed host would have to provide.
  return slugs.map((slug) =>
    slug[lang] === '' ? prefixOf(lang) : `${prefixOf(lang)}${slug[lang]}`,
  );
}

/** The pages of one language that are pages in their own right. */
export function canonicalPaths(lang: SiteLang): readonly string[] {
  return pathsOf(CANONICAL_SLUGS, lang);
}

/** The alias paths of one language, which render the merged pricing page. */
export function aliasPaths(lang: SiteLang): readonly string[] {
  return pathsOf(ALIAS_SLUGS, lang);
}

/** Every product path of one language, aliases included. */
export function contentPaths(lang: SiteLang): readonly string[] {
  return [...canonicalPaths(lang), ...aliasPaths(lang)];
}

/** The legal paths of one language - empty for the three it is not published in. */
export function legalPaths(lang: SiteLang): readonly string[] {
  if (!LEGAL_LANGS.includes(lang)) {
    return [];
  }
  return pathsOf(LEGAL_SLUGS, lang);
}

/** Everything one language publishes. */
export function allPaths(lang: SiteLang): readonly string[] {
  return [...contentPaths(lang), ...legalPaths(lang)];
}
