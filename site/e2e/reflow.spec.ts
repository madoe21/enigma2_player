import { Page, expect, test } from '@playwright/test';

/**
 * The reflow gate: every page at 400 % and at 200 % browser zoom.
 *
 * WCAG 2.2 success criterion 1.4.10 is a measurement, not an opinion: content
 * has to work in a window 320 CSS px wide and 256 CSS px tall without
 * two-dimensional scrolling, because that is what a 1280 px screen at 400 %
 * zoom becomes. 200 % (640x512) is the halfway case a reader with mild low
 * vision actually uses, and it is where a layout that only has a 320 px
 * special case tends to break.
 *
 * Why a test and not a review: zoom is the first thing a redesign breaks and
 * the last thing anybody checks by hand. The three properties below are the
 * ones that can be decided mechanically -
 *
 *   1. the page does not scroll sideways,
 *   2. no element sticks out past the right edge (which is how it starts),
 *   3. no box clips its own text.
 *
 * German first and in full, because German carries the longest words on the
 * site ('plattformübergreifend', 'Receiver-Einstellungen'): a column that
 * survives German survives the other four. The other languages get the three
 * pages whose content differs most in length.
 */

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
  'impressum',
  'datenschutz',
  'cookies',
];

/** 400 % and 200 % zoom on a 1280 px screen, in CSS pixels. */
const VIEWPORTS = [
  { label: '400 % zoom', width: 320, height: 256 },
  { label: '200 % zoom', width: 640, height: 512 },
];

// A sweep is 15 pages x 2 viewports in one test; the 30 s default is sized for
// a test that looks at one page (see a11y.spec.ts for the same reasoning).
test.describe.configure({ timeout: 180_000 });

interface Finding {
  what: string;
  detail: string;
}

/**
 * What does not fit, as a list a human can act on.
 *
 * Measured in the browser rather than from a screenshot: a bounding rectangle
 * is exact, and 'looks fine to me' is how this criterion gets shipped broken.
 * One CSS pixel of tolerance, because sub-pixel rounding in a zoomed viewport
 * is not a defect.
 */
async function findOverflow(page: Page): Promise<Finding[]> {
  return page.evaluate(() => {
    const findings: { what: string; detail: string }[] = [];
    const limit = window.innerWidth + 1;

    if (document.documentElement.scrollWidth > limit) {
      findings.push({
        what: 'the document itself',
        detail: `scrollWidth ${document.documentElement.scrollWidth} > viewport ${window.innerWidth}`,
      });
    }

    // The element as it is written, which is what a11y.spec.ts reports too: a
    // class list alone does not identify an anchor that carries none.
    const name = (element: Element) => element.outerHTML.slice(0, 60).replace(/\s+/g, ' ');

    for (const element of Array.from(document.body.querySelectorAll('*'))) {
      // An iframe holds someone else's document: its own width is ours to
      // check, its contents are not (the shop is a cross-origin frame).
      if (element.closest('iframe')) continue;

      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      const box = element.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;

      // The skip link lives off-canvas to the LEFT until it has focus, which
      // no browser scrolls to in a left-to-right document.
      if (box.right > limit && box.left >= 0) {
        findings.push({
          what: name(element),
          detail: `right edge ${Math.round(box.right)} past the ${window.innerWidth} px viewport`,
        });
      }

      // Text wider than its own box, in a box that hides the overflow: the
      // definition of clipped content.
      const clipsX = style.overflowX === 'hidden' || style.overflowX === 'clip';
      if (clipsX && element.scrollWidth > element.clientWidth + 1) {
        findings.push({
          what: name(element),
          detail: `clips its content: ${element.scrollWidth} px inside ${element.clientWidth} px`,
        });
      }
    }

    // Report each element once, however many times it was measured.
    const seen = new Set<string>();
    return findings.filter((finding) => {
      const key = `${finding.what} ${finding.detail}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });
}

function describe(findings: Finding[]): string {
  return findings.map((finding) => `    ${finding.what} - ${finding.detail}`).join('\n');
}

/** Every control that is not a link inside running prose. */
async function findSmallTargets(page: Page): Promise<Finding[]> {
  return page.evaluate(() => {
    const findings: { what: string; detail: string }[] = [];
    const controls = document.body.querySelectorAll<HTMLElement>(
      'button, .btn, .nav a, .nav__langs a, .site-footer__links a, .consent-dialog a, .shot__button',
    );

    for (const control of Array.from(controls)) {
      const box = control.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;

      // WCAG 2.2 2.5.8 asks for 24 px and exempts a link in a sentence; the PO
      // asked for 44 px, which is the AAA-level figure and what a thumb needs.
      if (box.height < 44 || box.width < 24) {
        findings.push({
          what: control.outerHTML.slice(0, 60).replace(/\s+/g, ' '),
          detail: `${Math.round(box.width)}x${Math.round(box.height)} px, text "${(control.textContent ?? '').trim().slice(0, 24)}"`,
        });
      }
    }
    return findings;
  });
}

async function expectNoOverflow(page: Page, where: string) {
  const findings = await findOverflow(page);
  expect(findings, `${where}\n${describe(findings)}`).toEqual([]);
}

for (const viewport of VIEWPORTS) {
  test(`every page fits at ${viewport.label}, cookie question open`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const path of PAGES) {
      await page.context().clearCookies();
      await page.goto(path);
      await expectNoOverflow(page, `/${path} at ${viewport.width}x${viewport.height}, undecided`);
    }
  });

  test(`every page fits at ${viewport.label}, cookie accepted`, async ({ page, context }) => {
    await context.addCookies([
      { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
    ]);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const path of PAGES) {
      await page.goto(path);
      await expectNoOverflow(page, `/${path} at ${viewport.width}x${viewport.height}, accepted`);
    }
  });
}

test('the detector reports an element that does not fit', async ({ page }) => {
  // A gate that cannot fail is not a gate. Everything above passes, which is
  // either a well-behaved layout or a broken measurement - so here is a box
  // that definitely overflows, and the detector has to name it.
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto('');
  await page.evaluate(() => {
    const wide = document.createElement('div');
    wide.id = 'deliberately-too-wide';
    wide.style.cssText = 'width: 500px; height: 10px; background: red';
    document.body.append(wide);
  });

  const findings = await findOverflow(page);
  expect(findings.some((finding) => finding.what.includes('deliberately-too-wide'))).toBe(true);
  expect(findings.some((finding) => finding.what.includes('the document itself'))).toBe(true);
});

test('the other four languages fit at 400 % zoom', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 256 });

  for (const lang of ['en', 'es', 'fr', 'it']) {
    for (const path of ['', 'changelog', 'downloads', 'faq']) {
      await page.goto(`${lang}/${path}`);
      await expectNoOverflow(page, `/${lang}/${path} at 320x256`);
    }
  }
});

test('the open lightbox fits at 400 % zoom', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto('screenshots');

  // The viewer is the hardest case on the site: a picture between two 44 px
  // controls, inside 320 px, and it is opened by script so no page-load check
  // ever sees it.
  await page.locator('.shot__button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoOverflow(page, 'the lightbox at 320x256');

  const image = page.locator('.lightbox__figure img');
  const box = await image.boundingBox();
  expect(box, 'the lightbox shows no image').not.toBeNull();
  expect(box!.width, 'the picture itself has to stay visible').toBeGreaterThan(80);
});

test('the consent dialog stays operable at 400 % zoom', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto('');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expectNoOverflow(page, 'the consent dialog at 320x256');

  // The question first: focus starts on the title, so the 256 px window shows
  // what is being asked rather than the middle of the legal links.
  await expect(page.locator('.consent-dialog__title')).toBeInViewport();

  // 256 px tall is shorter than the dialog: it has to be scrollable rather
  // than cut off, or the buttons are unreachable and the site is unusable -
  // the one state every first-time visitor is in.
  const reachable = await page.evaluate(() => {
    const accept = document.querySelector<HTMLElement>('.consent-button');
    accept?.scrollIntoView({ block: 'nearest' });
    const box = accept?.getBoundingClientRect();
    return box ? box.top >= 0 && box.bottom <= window.innerHeight + 1 : false;
  });
  expect(reachable, 'the accept button cannot be scrolled into view').toBe(true);

  await page.locator('.consent-button').first().click();
  await expect(dialog).toHaveCount(0);
});

test('every control keeps a usable target at 400 % zoom', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  await page.setViewportSize({ width: 320, height: 256 });

  for (const path of ['', 'downloads', 'screenshots', 'pricing', 'faq']) {
    await page.goto(path);
    const findings = await findSmallTargets(page);
    expect(findings, `/${path}\n${describe(findings)}`).toEqual([]);
  }
});
