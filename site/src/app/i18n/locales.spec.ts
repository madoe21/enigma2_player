import { describe, expect, it } from 'vitest';

import {
  defaultLang,
  isLang,
  langFromSegment,
  locales,
  localePath,
  prefixedLocales,
} from './locales';

/**
 * The language list, which is the thing the old site got wrong
 * (enigma2_player_source-w83): `/fr` and `/it` had pages and content, and a
 * two-literal check in `getLangFromUrl` served them as German - including
 * `<html lang="de">`, which makes a screen reader read French aloud with a
 * German voice.
 *
 * These tests pin the list and the rule that nothing may name languages a
 * second time.
 */
describe('the published languages', () => {
  it('are the five the site has content for', () => {
    expect([...locales]).toEqual(['de', 'en', 'es', 'fr', 'it']);
  });

  it('put German at the root and everything else under a prefix', () => {
    expect(defaultLang).toBe('de');
    expect([...prefixedLocales]).toEqual(['en', 'es', 'fr', 'it']);
  });

  it('recognise every one of them, not just two', () => {
    // The regression this file exists for: fr and it were missing.
    for (const lang of locales) {
      expect(isLang(lang), `${lang} has to be recognised`).toBe(true);
      expect(langFromSegment(lang)).toBe(lang);
    }
  });

  it('fall back to German for anything that is not a language', () => {
    for (const segment of ['features', 'klingon', '', null, undefined]) {
      expect(langFromSegment(segment)).toBe(defaultLang);
    }
  });
});

describe('a site path', () => {
  it('leaves German unprefixed, because the URLs are indexed', () => {
    expect(localePath('', 'de')).toBe('/');
    expect(localePath('features', 'de')).toBe('/features');
  });

  it('prefixes every other language', () => {
    expect(localePath('features', 'en')).toBe('/en/features');
    expect(localePath('', 'it')).toBe('/it/');
  });

  it('never carries the base href, which Angular adds itself', () => {
    // Doing it in both places is how a link ends up at
    // /enigma2_player/enigma2_player/features.
    for (const lang of locales) {
      expect(localePath('features', lang)).not.toContain('enigma2_player');
    }
  });

  it('tolerates a route written with slashes', () => {
    expect(localePath('/features/', 'en')).toBe('/en/features');
  });
});
