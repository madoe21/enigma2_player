import { expect, test } from '@playwright/test';

/**
 * Every page of the ported site, as a deployed file.
 *
 * The thing worth testing here is what the files say, because a site without a
 * backend is its files. Three properties per page, each of which the Astro
 * build got wrong somewhere: the file exists, it declares the language it is
 * actually written in, and it has exactly one h1 (enigma2_player-n5j, -w83).
 */

const PAGES = [
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

for (const lang of LANGS) {
  const prefix = lang === 'de' ? '' : `${lang}/`;

  test(`/${prefix} and all its pages exist and declare ${lang}`, async ({ page }) => {
    for (const path of ['', ...PAGES]) {
      const response = await page.goto(`${prefix}${path}`);

      expect(response?.status(), `/${prefix}${path} has to exist as a file`).toBe(200);
      // The defect the old site shipped on every prefixed language: the
      // content was translated and the document still claimed German.
      await expect(page.locator('html'), `/${prefix}${path}`).toHaveAttribute('lang', lang);
      await expect(page.locator('h1'), `/${prefix}${path}`).toHaveCount(1);
    }
  });
}

test('the navigation is in the language of the page', async ({ page }) => {
  await page.goto('en/features');
  const nav = page.locator('.nav__links');

  // The old build served the German nav on /en, /es, /fr and /it alike.
  await expect(nav).toContainText('Features');
  await expect(nav).not.toContainText('Funktionen');

  await page.goto('it/features');
  await expect(page.locator('.nav__links')).toContainText('Funzioni');
});

test('switching language stays on the page', async ({ page }) => {
  await page.goto('faq');
  // The dialog is a wall by design - accept, or the site is not usable (PO).
  // So a test that wants to click the page answers it first.
  await page.getByRole('dialog').getByRole('button', { name: 'Einverstanden' }).click();

  await page.locator('.nav__langs').getByRole('link', { name: 'English' }).click();

  await expect(page).toHaveURL(/\/en\/faq$/);
  await expect(page.locator('h1')).toHaveText('FAQ');
});

test('the downloads page offers the files of the latest release', async ({ page }) => {
  await page.goto('downloads');

  // Baked in by the build, so this works without JavaScript and without
  // anyone's IP reaching GitHub (PO, 2026-10-09).
  const rows = page.locator('.download-row');
  await expect(rows).toHaveCount(3);
  for (const platform of ['Windows', 'macOS', 'Linux']) {
    await expect(page.locator('.download-row', { hasText: platform })).toHaveCount(1);
  }
  const first = rows.first().getByRole('link');
  await expect(first).toHaveAttribute('href', /github\.com\/.+\/releases\/download\//);
});

test('the changelog shows the release notes, as text', async ({ page }) => {
  await page.goto('changelog');

  // Scoped to the page: the cookie dialog's title is an h2 as well.
  await expect(page.locator('main h2').first()).toContainText('1.1.1');
  // Rendered as text and never as markup: a release note is ours, but it
  // travels through an API.
  await expect(page.locator('main strong')).toHaveCount(0);
  // And the release template's own instruction to the maintainer is stripped.
  await expect(page.getByText('Do NOT write release notes by hand')).toHaveCount(0);
});

test('the shop is blocked until the cookie is accepted', async ({ page }) => {
  await page.goto('buy');

  // No iframe before the decision: loading it would send the visitor to the
  // licence server before they agreed to anything.
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('[role="note"]')).toBeVisible();

  await page.getByRole('dialog').getByRole('button', { name: 'Einverstanden' }).click();

  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('iframe')).toHaveAttribute('src', /\/shop\/.+lang=de/);
});

test('the gallery opens, walks and closes with the keyboard', async ({ page }) => {
  await page.goto('screenshots');
  await page.getByRole('dialog').getByRole('button', { name: 'Einverstanden' }).click();

  const thumbnails = page.locator('.shot__button');
  await expect(thumbnails.first()).toBeVisible();
  const firstCaption = await page.locator('.shot figcaption').first().innerText();

  await thumbnails.first().click();
  const lightbox = page.getByRole('dialog');
  await expect(lightbox).toBeVisible();
  await expect(lightbox.locator('figcaption')).toHaveText(firstCaption);

  // Arrow keys walk the gallery, Escape leaves it - what these keys do
  // everywhere else.
  await page.keyboard.press('ArrowRight');
  await expect(lightbox.locator('figcaption')).not.toHaveText(firstCaption);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('no page loads anything from another host', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.host !== '127.0.0.1:4321') {
      foreign.push(request.url());
    }
  });

  for (const path of ['', 'downloads', 'changelog', 'pricing', 'features', 'screenshots']) {
    await page.goto(path);
  }

  // The cookie policy says this site loads nothing from anyone else's server.
  // This is that sentence, as a test (PO, 2026-10-09).
  expect(foreign, `requested: ${foreign.join(', ')}`).toEqual([]);
});

test('the demo notice is on every page, and holds nothing up', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);

  for (const path of ['', 'features', 'en/downloads', 'it/faq', 'impressum']) {
    await page.goto(path);
    const notice = page.locator('.demo-notice');

    await expect(notice, `/${path} must say it is a demo`).toBeVisible();
    // Before the content, so it is read early rather than discovered late.
    const order = await page.evaluate(() => {
      const banner = document.querySelector('.demo-notice');
      const content = document.querySelector('#content');
      return banner && content
        ? banner.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING
        : 0;
    });
    expect(order).toBeTruthy();
  }

  // The first Tab still reaches the skip link: the banner is not in the way.
  await page.goto('');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
});
