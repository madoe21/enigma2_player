import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

/**
 * What a crawler and a shared link see.
 *
 * A framework change is where this disappears quietly: the pages still work,
 * they are simply no longer announced, no longer canonical, and no longer
 * linked to their translations (enigma2_player-9v1). None of it is visible to
 * a visitor, which is why it needs tests rather than a look.
 */

const PAGES = ['', 'features', 'downloads', 'faq', 'pricing', 'contact'];

test('sitemap.xml lists every prerendered page', async () => {
  const [sitemap, routes] = await Promise.all([
    readFile('dist/site/enigma2_player/sitemap.xml', 'utf8'),
    readFile('dist/site/enigma2_player/../prerendered-routes.json', 'utf8').catch(() => null),
  ]);

  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  expect(locations.length).toBe(66);

  // Against the build's own list where it exists, so the two cannot drift.
  if (routes) {
    const declared = Object.keys(JSON.parse(routes).routes ?? {});
    if (declared.length > 0) {
      expect(locations.length).toBe(declared.length);
    }
  }

  // Every language tree, and the translated legal slugs.
  for (const expected of [
    'https://madoe21.github.io/enigma2_player/',
    'https://madoe21.github.io/enigma2_player/en/faq/',
    'https://madoe21.github.io/enigma2_player/it/downloads/',
    'https://madoe21.github.io/enigma2_player/impressum/',
    'https://madoe21.github.io/enigma2_player/en/imprint/',
  ]) {
    expect(locations, `${expected} missing from the sitemap`).toContain(expected);
  }
});

test('the sitemap offers each page its translations', async () => {
  const sitemap = await readFile('dist/site/enigma2_player/sitemap.xml', 'utf8');

  // Five trees of the same content look like five competing pages without
  // this, and the one a crawler picks is not the one a reader wanted.
  const faq = sitemap.slice(
    sitemap.indexOf('<loc>https://madoe21.github.io/enigma2_player/faq/</loc>'),
  );
  const block = faq.slice(0, faq.indexOf('</url>'));
  for (const lang of ['de', 'en', 'es', 'fr', 'it']) {
    expect(block, `hreflang ${lang} missing`).toContain(`hreflang="${lang}"`);
  }

  // The legal pages exist in two languages, so they must claim two and not
  // five: a promised translation that 404s is worse than none.
  const imprint = sitemap.slice(
    sitemap.indexOf('<loc>https://madoe21.github.io/enigma2_player/impressum/</loc>'),
  );
  const imprintBlock = imprint.slice(0, imprint.indexOf('</url>'));
  expect(imprintBlock).toContain('hreflang="de"');
  expect(imprintBlock).toContain('hreflang="en"');
  expect(imprintBlock).not.toContain('hreflang="it"');
});

test('robots.txt allows indexing and points at the sitemap that exists', async () => {
  const robots = await readFile('dist/site/enigma2_player/robots.txt', 'utf8');

  expect(robots).toContain('Allow: /');
  expect(robots).not.toMatch(/^Disallow: \/$/m);
  // The committed file used to name Astro's `sitemap-index.xml`, which this
  // build does not write - a crawler would follow it into a 404.
  expect(robots).toContain('/enigma2_player/sitemap.xml');
  expect(robots).not.toContain('sitemap-index.xml');
});

for (const path of PAGES) {
  test(`/${path} carries canonical, hreflang and the social fields`, async ({ page }) => {
    await page.goto(path);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute(
      'href',
      `https://madoe21.github.io/enigma2_player/${path}`,
    );

    // One alternate per language the page exists in, plus x-default.
    const alternates = page.locator('link[rel="alternate"]');
    await expect(alternates).toHaveCount(6);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

    for (const name of ['description', 'robots']) {
      await expect(page.locator(`meta[name="${name}"]`)).toHaveCount(1);
    }
    for (const property of ['og:title', 'og:description', 'og:url', 'og:image', 'og:locale']) {
      await expect(page.locator(`meta[property="${property}"]`)).toHaveCount(1);
    }
    for (const name of ['twitter:card', 'twitter:title', 'twitter:image']) {
      await expect(page.locator(`meta[name="${name}"]`)).toHaveCount(1);
    }
  });
}

test('the canonical of a prefixed page points at that language, not at German', async ({
  page,
}) => {
  await page.goto('en/features');

  // Getting this wrong tells a crawler the English page is a copy of the
  // German one, which is how a translation drops out of the index.
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://madoe21.github.io/enigma2_player/en/features',
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
});

test('the social image is a file that exists', async ({ page, request }) => {
  await page.goto('');
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toBeTruthy();

  // The URL is absolute and points at the deployed host, so it is checked
  // against the local build by its path - a broken og:image is an empty box
  // in every shared link.
  const path = new URL(image!).pathname.replace('/enigma2_player/', '');
  const response = await request.get(`http://127.0.0.1:4321/enigma2_player/${path}`);
  expect(response.status(), `${path} is referenced but not deployed`).toBe(200);
});
