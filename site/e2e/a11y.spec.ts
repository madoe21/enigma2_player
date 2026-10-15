import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';

/**
 * The accessibility gate: axe-core over every page, in every language.
 *
 * Mechanical rather than a review, because a review happens once and a gate
 * happens on every run (enigma2_player-iaa). axe cannot judge whether a label
 * makes sense - that is what the NVDA pass is for, scripted in
 * `docs/a11y/nvda-protocol.md` - but it catches the whole class of defects that
 * are decidable: contrast below the threshold, a control without a name, a
 * heading level skipped, a missing document title, a landmark nested wrongly.
 *
 * WCAG 2.2 AA is the bar the PO set, so the rule tags are pinned to it. The
 * best-practice rules are included as well: they are not law, but every one
 * that fires here has been a real finding rather than noise.
 */

// Animations off for this file only (enigma2_player-gxc). axe measures contrast
// on what is painted at the moment it looks, and the consent dialog fades in
// over 150 ms (`consent/consent.css`, under `prefers-reduced-motion:
// no-preference`). A scan that lands inside those 150 ms computes the dialog's
// links against the scrim showing through and reports a serious contrast
// violation - which is how this suite went flaky on CI while the settled dialog
// is compliant. `reduce` takes the `@media` guard's other branch, so axe judges
// the state a visitor reads rather than a frame of the transition. Scoped here
// and not in `playwright.config.ts`: the functional specs should keep meeting
// the site the way a visitor's browser does.
test.use({ reducedMotion: 'reduce' });

// One test in this file scans a dozen pages; Playwright's 30 s default is
// sized for a test that touches one. Each run was already within a second or
// two of that cap, and adding the dark-palette pair below pushed several over
// it on a loaded machine - a timeout that says nothing about accessibility and
// would have been a red CI run on a slower runner. The budget is per test, so
// a generous one still bounds a genuine hang.
test.describe.configure({ timeout: 180_000 });

const PAGES = [
  '',
  'features',
  'screenshots',
  'downloads',
  'changelog',
  'docs',
  'faq',
  'pricing',
  'buy',
  'account',
  'license',
  'contact',
];
const LANGS = ['de', 'en', 'es', 'fr', 'it'] as const;

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/** axe over whatever is currently on screen. */
async function scan(page: Page) {
  return new AxeBuilder({ page }).withTags(TAGS).analyze();
}

/** What failed, as something a human can act on without opening a report. */
function describe(violations: Awaited<ReturnType<typeof scan>>['violations']): string {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n` +
        violation.nodes.map((node) => `    ${node.target.join(' ')}`).join('\n'),
    )
    .join('\n');
}

for (const lang of LANGS) {
  const prefix = lang === 'de' ? '' : `${lang}/`;

  test(`every ${lang} page passes axe with the cookie question open`, async ({ page }) => {
    // The undecided state first, because it is what every first-time visitor
    // gets - and it is the state with a modal dialog in it.
    for (const path of PAGES) {
      await page.context().clearCookies();
      await page.goto(`${prefix}${path}`);
      const results = await scan(page);

      expect(results.violations, `/${prefix}${path}\n${describe(results.violations)}`).toEqual([]);
    }
  });

  test(`every ${lang} page passes axe once the cookie is accepted`, async ({ page, context }) => {
    // The other state: no dialog, the shop frame present, the gated regions
    // open. Both have to hold - a page that is only accessible before anyone
    // agrees to anything is not accessible.
    await context.addCookies([
      { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
    ]);
    for (const path of PAGES) {
      await page.goto(`${prefix}${path}`);
      const results = await scan(page);

      expect(results.violations, `/${prefix}${path}\n${describe(results.violations)}`).toEqual([]);
    }
  });
}

/*
 * The palette axe did not see until now (enigma2_player-4t1).
 *
 * The site is dark by default and takes the light palette only for a visitor
 * whose system asks for it - while Playwright's default context IS a light
 * one, so every scan above measures the override and none of them measured the
 * default. One language is enough here: what differs per locale is the length
 * of the text, not its contrast, and the tokens are language-independent.
 */
test.describe('the dark palette', () => {
  test.use({ colorScheme: 'dark' });

  const DARK_PAGES = [...PAGES, 'impressum', 'datenschutz', 'cookies'];

  test('every page passes axe in the dark palette, cookie question open', async ({
    page,
    context,
  }) => {
    for (const path of DARK_PAGES) {
      await context.clearCookies();
      await page.goto(path);
      const results = await scan(page);

      expect(results.violations, `dark /${path}\n${describe(results.violations)}`).toEqual([]);
    }
  });

  test('every page passes axe in the dark palette, cookie accepted', async ({ page, context }) => {
    await context.addCookies([
      { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
    ]);
    for (const path of DARK_PAGES) {
      await page.goto(path);
      const results = await scan(page);

      expect(results.violations, `dark /${path}\n${describe(results.violations)}`).toEqual([]);
    }
  });
});

test('the legal pages pass axe in both languages', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  for (const path of [
    'impressum',
    'datenschutz',
    'cookies',
    'en/imprint',
    'en/privacy',
    'en/cookies',
  ]) {
    await page.goto(path);
    const results = await scan(page);

    expect(results.violations, `/${path}\n${describe(results.violations)}`).toEqual([]);
  }
});

test('the open lightbox passes axe', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  await page.goto('screenshots');
  await page.locator('.shot__button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // A dialog opened by script is where ARIA usually goes wrong, and it is
  // never in the first scan of a page because it is not open yet.
  const results = await scan(page);
  expect(results.violations, describe(results.violations)).toEqual([]);
});

test('every page is reachable by keyboard alone, with the focus visible', async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  await page.goto('');

  // The skip link is the first stop, and it has to become visible when it gets
  // focus - a skip link nobody can see is a skip link nobody uses (WCAG 2.4.1,
  // 2.4.7).
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip-link');
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  const box = await skip.boundingBox();
  expect(box, 'the focused skip link must occupy real space').not.toBeNull();
  expect(box!.height).toBeGreaterThan(10);

  // And it has to actually move the reading position.
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#content$/);

  // Every focusable element must show a focus indicator of its own rather than
  // relying on the browser default being switched off somewhere.
  const outlineless = await page.evaluate(() => {
    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])'),
    );
    return focusable
      .filter((element) => {
        element.focus();
        const style = getComputedStyle(element);
        const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        const hasOtherCue = style.textDecorationLine !== 'none' || style.boxShadow !== 'none';
        return !hasOutline && !hasOtherCue;
      })
      .map((element) => element.outerHTML.slice(0, 60));
  });
  expect(outlineless, 'focusable elements without a visible focus cue').toEqual([]);
});

test('every page has a title of its own', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  const seen = new Map<string, string>();

  // PAGES already starts with the landing page; listing it twice made the
  // test accuse the site of duplicate titles for the same page.
  for (const path of [...PAGES, 'impressum', 'datenschutz', 'cookies']) {
    await page.goto(path);
    const title = await page.title();

    // axe only checks that a <title> exists. The scaffold gave all 66 pages
    // the same one, which passes that check and fails the requirement: the
    // title is the first thing a screen reader reads and the only thing that
    // tells two tabs apart (WCAG 2.4.2).
    expect(title, `/${path} must not be the bare site name`).not.toBe('Site');
    const other = seen.get(title);
    expect(other, `/${path} has the same title as /${other}`).toBeUndefined();
    seen.set(title, path);
  }
});

test('a page change and a language change are announced', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  await page.goto('');

  // The CDK's live region, which is where LiveAnnouncer writes.
  const liveRegion = page.locator('.cdk-live-announcer-element');

  await page.locator('.nav__links').getByRole('link', { name: 'FAQ' }).click();
  await expect(liveRegion).toContainText('FAQ');

  await page.locator('.nav__langs').getByRole('link', { name: 'English' }).click();
  // In the language it switched TO: "Language changed: English" read with a
  // German voice is the joke that tells the user it did not work.
  await expect(liveRegion).toContainText('Language changed: English');
});

test('nothing is announced on the first load', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  await page.goto('features');
  await page.waitForLoadState('networkidle');

  // The browser announces a page load by itself. Talking over it is worse
  // than staying quiet.
  const text = await page.locator('.cdk-live-announcer-element').textContent();
  expect((text ?? '').trim()).toBe('');
});
