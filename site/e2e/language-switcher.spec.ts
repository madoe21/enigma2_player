import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { LANGS, prefixOf } from './site-pages';

/**
 * The language switcher: a flag, a code, and a name nobody loses.
 *
 * Given/When/Then, because the PO's request was visual ("show flags") and the
 * risk it carries is not: a flag is a picture, and a picture is either an
 * unlabelled graphic to a screen reader or a request to somebody's CDN. The
 * three tests below are the three ways that could go wrong
 * (enigma2_player-13h).
 */

/** The name every language calls itself, which is the switcher's wording. */
const NAMES: Readonly<Record<string, string>> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
};

test('the flags are drawn in the file, not fetched from anywhere', async () => {
  // GIVEN the deployed files, WHEN the switcher is rendered, THEN its flags
  // are inline SVG - checked in the HTML, because an `<img>` or a sprite here
  // would be a request made before any visitor consented to anything, and
  // every page of this site carries this nav.
  for (const lang of LANGS) {
    const path = `dist/site/enigma2_player/${prefixOf(lang)}faq/index.html`;
    const html = await readFile(path, 'utf8');
    const nav = html.match(/class="nav__langs"[\s\S]*?<\/ul>/)?.[0] ?? '';

    expect(nav, `/${lang} renders the switcher`).not.toBe('');
    expect((nav.match(/<svg/g) ?? []).length, `/${lang} draws five flags`).toBe(LANGS.length);
    expect(nav, `/${lang} fetches nothing for them`).not.toMatch(/<img|url\(|xlink:href/);
    // And the name is text in the file: an `aria-label` would be invisible to
    // find-in-page and gone with the CSS.
    for (const name of Object.values(NAMES)) {
      expect(nav, `/${lang} names ${name}`).toContain(name);
    }
  }
});

test('each entry is called by the language it leads to', async ({ page }) => {
  await page.goto('faq');

  const switcher = page.locator('.nav__langs');
  for (const [lang, name] of Object.entries(NAMES)) {
    // WHEN assistive technology asks what the control is called, THEN it is
    // the language's own name - not "image", and not the bare code.
    const entry = switcher.getByRole('link', { name, exact: true });
    await expect(entry, `${lang} is announced as ${name}`).toBeVisible();
    await expect(entry).toHaveAttribute('lang', lang);
    await expect(entry).toHaveAttribute('hreflang', lang);
    await expect(entry).toHaveAttribute('title', name);

    // AND the flag beside it is drawn at a size a person can see, with the
    // code still legible next to it.
    const flag = entry.locator('site-lang-flag svg');
    const box = await flag.boundingBox();
    expect(box?.width ?? 0, `${lang} flag has width`).toBeGreaterThan(12);
    expect(box?.height ?? 0, `${lang} flag has height`).toBeGreaterThan(8);
    await expect(entry.locator('.nav__lang-code')).toHaveText(lang.toUpperCase());
  }
});

test('switching by flag still announces the new language in that language', async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  await page.goto('');

  // GIVEN the Spanish entry, which now shows a flag and "ES"
  const spanish = page.locator('.nav__langs').getByRole('link', { name: 'Español', exact: true });
  // WHEN it is reached and operated from the keyboard
  await spanish.focus();
  await expect(spanish).toBeFocused();
  const outline = await spanish.evaluate((node) => getComputedStyle(node).outlineWidth);
  expect(parseFloat(outline)).toBeGreaterThan(0);
  await page.keyboard.press('Enter');

  // THEN the page is Spanish and says so, in Spanish
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('.cdk-live-announcer-element')).toContainText('Idioma cambiado');
});
