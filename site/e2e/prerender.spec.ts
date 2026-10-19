import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

/**
 * What the deployed files actually say.
 *
 * These assertions are about the prerendered HTML, which for a site without a
 * backend is the whole product. The language test is the one
 * enigma2_player_source-w83 asks for: the old site served `/fr` and `/it` with
 * `lang="de"`, so a screen reader read French with a German voice - and no unit
 * test would have caught it, because the content component had the right
 * language all along and only the document did not.
 */
const pages = [
  {
    path: '',
    lang: 'de',
    heading: 'Dein Enigma2-Receiver. Auf jedem Bildschirm.',
    text: 'Durchsuche',
  },
  { path: 'en/', lang: 'en', heading: 'Your Enigma2 receiver. On every screen.', text: 'Browse' },
  {
    path: 'es/',
    lang: 'es',
    heading: 'Tu receptor Enigma2. En cualquier pantalla.',
    text: 'Explora',
  },
  {
    path: 'fr/',
    lang: 'fr',
    heading: 'Votre récepteur Enigma2. Sur tous les écrans.',
    text: 'Parcourez',
  },
  {
    path: 'it/',
    lang: 'it',
    heading: 'Il tuo ricevitore Enigma2. Su ogni schermo.',
    text: 'Sfoglia',
  },
];

for (const entry of pages) {
  test(`/${entry.path} is served as ${entry.lang}`, async ({ page }) => {
    const response = await page.goto(entry.path);
    expect(response?.status(), 'the page has to exist as a file').toBe(200);

    // Read off the document, not off a component: this is what an assistive
    // technology and a crawler look at.
    await expect(page.locator('html')).toHaveAttribute('lang', entry.lang);
    await expect(page.locator('h1')).toHaveText(entry.heading);
    await expect(page.getByText(entry.text).first()).toBeVisible();
  });
}

test('the release notes are markup in the file, not markdown on the page', async () => {
  // The notes come out of the GitHub API as markdown and used to be printed
  // verbatim (enigma2_player-ryy). Checked in the FILE and not through the
  // browser, because the parse happens at build time: a visitor with
  // JavaScript off gets exactly these bytes.
  for (const path of ['changelog', 'en/changelog']) {
    const html = await readFile(`dist/site/enigma2_player/${path}/index.html`, 'utf8');
    const body = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    const text = body.replace(/<[^>]+>/g, ' ');

    expect(body, `/${path} lists the changes as a list`).toContain('<ul');
    expect(body, `/${path} keeps the download table a table`).toContain('scope="col"');
    expect(body, `/${path} emphasises what the note emphasised`).toContain('<strong>');

    for (const marker of ['**', '|---', '### ', '- **']) {
      expect(text, `/${path} still shows the marker ${marker}`).not.toContain(marker);
    }
  }
});

test('the base href is the sub path the site is deployed under', async ({ page }) => {
  // Forgetting this produces a build that works locally and loses every asset
  // once deployed - visible only after deploying.
  await page.goto('');
  await expect(page.locator('base')).toHaveAttribute('href', '/enigma2_player/');
});
