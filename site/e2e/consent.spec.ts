import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

/**
 * The cookie decision, against the built site.
 *
 * These four scenarios are the ones the bead asks for - first visit, accepted,
 * declined, withdrawn - plus the two that only the deployed files can answer:
 * that the question is in the prerendered HTML rather than painted in later,
 * and that the shop starts blocked for a visitor whose JavaScript never runs
 * (enigma2_player-vmk).
 */

const dialog = '[role="dialog"]';
const blocked = '[role="note"]';
// The gated region on the landing page: the way into the purchase, which
// waits for the decision because the shop frame loads from the licence
// server (enigma2_player-n5j).
const shop = '.buy-teaser .btn';

test.describe('the first visit', () => {
  test('asks, and keeps the shop out until it has an answer', async ({ page }) => {
    await page.goto('');

    await expect(page.locator(dialog)).toBeVisible();
    await expect(page.locator(shop)).toHaveCount(0);
    await expect(page.locator(blocked)).toBeVisible();
    // Blocked with a reason, not blocked silently.
    await expect(page.locator(blocked)).toContainText('Zustimmung');
  });

  test('sets no cookie while the question is open', async ({ page, context }) => {
    await page.goto('');
    await expect(page.locator(dialog)).toBeVisible();

    expect(await context.cookies()).toEqual([]);
  });

  test('can be answered with the keyboard alone, and traps focus', async ({ page }) => {
    await page.goto('');
    await expect(page.locator(dialog)).toBeVisible();

    // cdkTrapFocus with auto-capture: focus starts inside, and tabbing cannot
    // walk out into the page the dialog covers.
    for (let i = 0; i < 6; i++) {
      const insideDialog = await page.evaluate(
        () => document.activeElement?.closest('[role="dialog"]') !== null,
      );
      expect(insideDialog, 'focus must not leave the dialog').toBe(true);
      await page.keyboard.press('Tab');
    }

    await page.getByRole('dialog').getByRole('button', { name: 'Einverstanden' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(dialog)).toHaveCount(0);
  });
});

test('accepting unlocks the shop and survives a reload and a language change', async ({
  page,
  context,
}) => {
  await page.goto('');
  await page.getByRole('dialog').getByRole('button', { name: 'Einverstanden' }).click();

  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page.locator(shop)).toBeVisible();

  const cookies = await context.cookies();
  expect(cookies.map((cookie) => cookie.name)).toEqual(['e2p_consent']);
  expect(cookies[0].value).toBe('accepted');
  expect(cookies[0].path, 'scoped to the deployed sub path').toBe('/enigma2_player/');

  await page.reload();
  await expect(page.locator(dialog), 'the question must not come back').toHaveCount(0);
  await expect(page.locator(shop)).toBeVisible();

  await page.goto('en/');
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page.locator(shop)).toBeVisible();
});

test('declining explains the state and leaves the shop blocked', async ({ page, context }) => {
  await page.goto('');
  await page.getByRole('dialog').getByRole('button', { name: 'Ablehnen' }).click();

  await expect(page.locator(dialog)).toHaveCount(0);
  // The page says what state it is in, rather than quietly doing less.
  const notice = page.locator('[role="status"]');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('abgelehnt');
  await expect(page.locator(shop)).toHaveCount(0);
  await expect(page.locator(blocked)).toBeVisible();

  // The record of the refusal is the only thing stored.
  const cookies = await context.cookies();
  expect(cookies.map((cookie) => [cookie.name, cookie.value])).toEqual([
    ['e2p_consent', 'rejected'],
  ]);
});

test('the decision can be withdrawn from the footer at any time', async ({ page, context }) => {
  await page.goto('');
  await page.getByRole('dialog').getByRole('button', { name: 'Einverstanden' }).click();
  await expect(page.locator(shop)).toBeVisible();

  await page.getByRole('button', { name: 'Cookie-Entscheidung ändern' }).click();

  await expect(page.locator(dialog), 'the question comes back').toBeVisible();
  await expect(page.locator(shop)).toHaveCount(0);
  expect(
    (await context.cookies()).filter((cookie) => cookie.value !== ''),
    'nothing is kept after a withdrawal',
  ).toEqual([]);
});

test('each language asks in its own words', async ({ page }) => {
  for (const [path, phrase] of [
    ['', 'ein einziges Cookie'],
    ['en/', 'a single cookie'],
    ['es/', 'una única cookie'],
    ['fr/', 'un seul cookie'],
    ['it/', 'un solo cookie'],
  ]) {
    await page.context().clearCookies();
    await page.goto(path);
    await expect(page.locator(dialog)).toContainText(phrase);
  }
});

test('the question is in the prerendered file, not painted in afterwards', () => {
  // A static site is its files. If the dialog only existed after hydration, a
  // crawler and a visitor with JavaScript disabled would get an open shop -
  // the opposite of the safe state.
  // The build writes into the sub path it is deployed under, so the file a
  // visitor gets is dist/site/enigma2_player/index.html.
  const html = readFileSync('dist/site/enigma2_player/index.html', 'utf8');

  expect(html).toContain('role="dialog"');
  expect(html).toContain('aria-modal="true"');
  expect(html, 'the shop must not be in the file for an undecided visitor').not.toContain(
    'buy-teaser__cta',
  );
});

test('without JavaScript the shop stays blocked', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/enigma2_player/');

  await expect(page.locator(dialog)).toBeVisible();
  await expect(page.locator(shop)).toHaveCount(0);

  await context.close();
});
