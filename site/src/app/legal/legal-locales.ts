/**
 * The languages the legal texts are published in.
 *
 * Its own file so the route table and the link helper can ask the question
 * without importing `legal-copy.ts` - which carries the texts themselves and
 * would then sit in the initial bundle of every page (enigma2_player-9v1).
 *
 * Two, and the reason is in `legal-copy.ts`: a machine translation of a
 * privacy policy asserts facts about data processing that nobody here can
 * check.
 */
export const legalLocales = ['de', 'en'] as const;

/** A language a legal text exists in. */
export type LegalLang = (typeof legalLocales)[number];

/** Whether a legal text exists in this language. */
export function isLegalLang(value: string): value is LegalLang {
  return (legalLocales as readonly string[]).includes(value);
}
