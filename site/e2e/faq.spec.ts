import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { LANGS, prefixOf } from './site-pages';

/**
 * The FAQ disclosures, against a real engine.
 *
 * Written as Given/When/Then because that is what these are: the behaviour a
 * visitor gets, not the markup we wrote. The three properties the PO's request
 * could have cost us are each one test - the text stays in the file, the
 * keyboard operates the control, and both still hold with JavaScript off
 * (enigma2_player-a23).
 */

/** The dialog is a wall by design: a test that wants the page answers it. */
async function accept(page: import('@playwright/test').Page) {
  await page.getByRole('dialog').getByRole('button', { name: 'Einverstanden' }).click();
}

test('every answer is in the deployed file, collapsed rather than absent', async () => {
  // GIVEN the built site, WHEN no question has been opened, THEN the answers
  // are already in the HTML - checked in the file, because this is what a
  // crawler and a reader with scripting off receive.
  for (const lang of LANGS) {
    const path = `dist/site/enigma2_player/${prefixOf(lang)}faq/index.html`;
    const html = await readFile(path, 'utf8');

    expect(html, `/${lang} renders disclosures`).toContain('<details');
    expect(html, `/${lang} opens none of them`).not.toMatch(/<details[^>]*\sopen/);
    // The answer text itself: a scripted accordion would ship the question and
    // leave this out.
    const answers = html.match(/class="faq__answer"[^>]*>([^<]{20,})/g) ?? [];
    expect(answers.length, `/${lang} ships its answers`).toBeGreaterThan(3);
  }
});

test('a question opens and closes with the keyboard', async ({ page }) => {
  await page.goto('faq');
  await accept(page);

  const first = page.locator('details.faq__item').first();
  const summary = first.locator('summary');

  // GIVEN the first question has focus
  await summary.focus();
  await expect(summary).toBeFocused();
  // AND the ring is visible - a control nobody can see the focus on is not
  // keyboard operable in practice (WCAG 2.4.7).
  const outline = await summary.evaluate((node) => getComputedStyle(node).outlineWidth);
  expect(parseFloat(outline)).toBeGreaterThan(0);

  // WHEN Enter is pressed, THEN the answer is revealed
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('open', '');
  await expect(first.locator('.faq__answer')).toBeVisible();

  // WHEN Enter is pressed again, THEN it collapses, and focus has not moved
  await page.keyboard.press('Enter');
  await expect(first).not.toHaveAttribute('open', '');
  await expect(summary).toBeFocused();

  // AND Space does the same, which is what a reader will try
  await page.keyboard.press(' ');
  await expect(first).toHaveAttribute('open', '');
});

test('opening one question leaves the others alone', async ({ page }) => {
  await page.goto('faq');
  await accept(page);

  const items = page.locator('details.faq__item');
  await items.nth(1).locator('summary').click();

  // No single-open accordion: a reader comparing two answers should not have
  // the first one shut in their face.
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await items.nth(2).locator('summary').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await expect(items.nth(2)).toHaveAttribute('open', '');
  await expect(items.first()).not.toHaveAttribute('open', '');
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the questions still expand', async ({ page }) => {
    await page.goto('faq');

    // GIVEN a browser running no script at all - the prerendered file is the
    // whole page, and the consent dialog cannot be dismissed either.
    const first = page.locator('details.faq__item').first();
    await expect(first).not.toHaveAttribute('open', '');

    // WHEN the control is operated, THEN the answer appears: the behaviour
    // belongs to `<details>`, so nothing of ours has to run.
    await first.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('open', '');
    await expect(first.locator('.faq__answer')).toBeVisible();
  });
});
