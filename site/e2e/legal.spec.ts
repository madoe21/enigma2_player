import { expect, test } from '@playwright/test';

/**
 * The legal pages as deployed files, and the links that have to reach them.
 *
 * §5 DDG wants the imprint "easily recognisable and directly accessible",
 * which is a statement about every page having a link to it - not about the
 * page existing somewhere (enigma2_player-esp).
 */

const pages = [
  { path: 'impressum', lang: 'de', heading: 'Impressum', needs: '§ 5 DDG' },
  { path: 'datenschutz', lang: 'de', heading: 'Datenschutzerklärung', needs: 'DSGVO' },
  { path: 'cookies', lang: 'de', heading: 'Cookie-Richtlinie', needs: 'e2p_consent' },
  { path: 'en/imprint', lang: 'en', heading: 'Imprint', needs: '§5 DDG' },
  { path: 'en/privacy', lang: 'en', heading: 'Privacy policy', needs: 'GDPR' },
  { path: 'en/cookies', lang: 'en', heading: 'Cookie policy', needs: 'e2p_consent' },
];

for (const entry of pages) {
  test(`/${entry.path} exists as a file and says what it must`, async ({ page }) => {
    const response = await page.goto(entry.path);

    expect(response?.status(), 'the page has to exist as a file').toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', entry.lang);
    await expect(page.locator('h1')).toHaveText(entry.heading);
    await expect(page.getByText(entry.needs).first()).toBeVisible();
  });
}

for (const entry of pages) {
  test(`/${entry.path} is readable without answering the cookie question`, async ({
    page,
    context,
  }) => {
    // Undecided: no cookie in the jar. German law is explicit for exactly
    // these pages - the imprint has to be "directly accessible" and the
    // privacy policy is what a visitor reads in order to decide, so a modal
    // in front of either makes the reading conditional on the answer
    // (enigma2_player-dki).
    await context.clearCookies();
    await page.goto(entry.path);

    await expect(page.locator('h1')).toHaveText(entry.heading);
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // And no focus trap: the first Tab from the page body reaches the page
    // itself rather than being pulled back into a dialog.
    await page.keyboard.press('Tab');
    const trapped = await page.evaluate(
      () => document.activeElement?.closest('[cdkTrapFocus], [role="dialog"]') !== null,
    );
    expect(trapped, 'nothing may hold the keyboard on a legal page').toBe(false);
  });
}

test('the footer control still opens the decision on a legal page', async ({ page, context }) => {
  // A control that takes the decision back must not be dead on the three
  // pages that explain the decision.
  await context.clearCookies();
  await page.goto('cookies');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Cookie-Entscheidung ändern' }).click();

  await expect(page.locator('[role="dialog"]')).toBeVisible();
});

test('deciding on a legal page leaves a consistent state', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('datenschutz');

  await page.getByRole('button', { name: 'Cookie-Entscheidung ändern' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Einverstanden' }).click();

  await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  expect((await context.cookies()).map((c) => [c.name, c.value])).toEqual([
    ['e2p_consent', 'accepted'],
  ]);

  // And the answer carries over to the page the visitor goes to next.
  await page.goto('');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);
});

test('every page carries the three legal links in its footer, and they work', async ({
  page,
  context,
}) => {
  // The decision is set in the jar rather than clicked per page. Clicking it
  // raced hydration: the prerendered file contains the dialog, so a check for
  // "is it visible" can be true a moment before the hydrated app removes it,
  // and the click then waits for an element that is already gone. The point of
  // this test is the footer, not the dialog.
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);

  for (const path of ['', 'en/', 'it/', 'impressum', 'en/cookies']) {
    await page.goto(path);
    const footer = page.locator('footer nav');

    await expect(footer.getByRole('link'), `on /${path}`).toHaveCount(3);
    await footer.getByRole('link').first().click();
    await expect(page.locator('h1')).not.toHaveText('Enigma2 Player');
  }
});

test('an undecided visitor can read the legal texts from the dialog itself', async ({ page }) => {
  await page.goto('');

  // The dialog is modal, so the footer is out of reach until a decision is
  // made - and consent to something that cannot be read first is not informed
  // consent. The three links are therefore in the dialog as well.
  const links = page.getByRole('dialog').getByRole('link');
  await expect(links).toHaveCount(4); // three legal texts plus the policy line

  await links.first().click();
  await expect(page.locator('h1')).toHaveText('Impressum');
});

test('a language without its own legal text links to the English one', async ({ page }) => {
  await page.goto('fr/');

  // Not to an unchecked machine translation of a privacy policy, and not to a
  // dead link either.
  const imprint = page.getByRole('dialog').getByRole('link').first();
  await expect(imprint).toHaveAttribute('href', '/enigma2_player/en/imprint');

  await imprint.click();
  await expect(page.locator('h1')).toHaveText('Imprint');
  await expect(page.getByText('German and English')).toBeVisible();
});

test('the cookie dialog links to the policy it is asking about', async ({ page }) => {
  await page.goto('');

  // By its name, not by position: the dialog also carries the three legal
  // links, and "the first link" would be a test that passes for the wrong
  // reason the moment that list changes.
  const link = page.getByRole('dialog').getByRole('link', { name: /Was genau gespeichert wird/ });
  await expect(link).toHaveAttribute('href', '/enigma2_player/cookies');

  // Reachable before the answer is given: consent to something that cannot be
  // read first is not informed consent.
  await link.click();
  await expect(page.locator('h1')).toHaveText('Cookie-Richtlinie');
});

test('the imprint still shows its gaps as gaps', async ({ page }) => {
  await page.goto('impressum');

  // Until the company exists, the fields are visibly open. A deployed imprint
  // with an invented address would be worse than one with a hole in it.
  await expect(page.getByText('⟨COMPANY_LEGAL_NAME⟩')).toBeVisible();
  await expect(page.getByText('Vorlage')).toBeVisible();
});

test('the policy describes the cookie the code actually sets', async ({ page }) => {
  await page.goto('');
  await page.getByRole('dialog').getByRole('button', { name: 'Einverstanden' }).click();

  const cookie = (await page.context().cookies()).find((c) => c.name === 'e2p_consent');
  expect(cookie).toBeDefined();

  await page.goto('cookies');
  // Name, value and lifetime as written in the policy, checked against what is
  // in the jar. A policy that drifts from the code is a promise nobody keeps.
  // The value is matched without its quotation marks: the register is a legal
  // text and its typography is the text's business, the stored word is not.
  await expect(page.getByText('e2p_consent')).toBeVisible();
  await expect(page.getByText(cookie!.value, { exact: false }).first()).toBeVisible();
  await expect(page.locator('main')).toContainText('180 Tage');
  const sixMonthsInSeconds = 180 * 24 * 60 * 60;
  const lifetime = cookie!.expires - Date.now() / 1000;
  expect(Math.abs(lifetime - sixMonthsInSeconds)).toBeLessThan(600);

  // And the register is a definition list, so each fact has its label read out
  // with it rather than sitting in a wall of sentences (WCAG 1.3.1).
  await expect(page.locator('main dl dt')).toHaveCount(9);
  await expect(page.locator('main dl dd')).toHaveCount(9);
});
