import { Page, expect, test } from '@playwright/test';

import { allPaths, prefixOf } from './site-pages';

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

const PAGES = [...allPaths('de')];

/** 400 % and 200 % zoom on a 1280 px screen, in CSS pixels. */
const VIEWPORTS = [
  { label: '400 % zoom', width: 320, height: 256 },
  { label: '200 % zoom', width: 640, height: 512 },
];

// A sweep is every German page x 2 viewports in one test; the 30 s default is
// sized for a test that looks at one page (see a11y.spec.ts for the same
// reasoning).
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

    /**
     * True when the element sits inside a box that scrolls sideways itself.
     *
     * WCAG 1.4.10 exempts "parts of the content which require two-dimensional
     * layout", and a data table is its own example of that - the release
     * notes carry one of platform, file name and install command
     * (enigma2_player-ryy). The accepted pattern is a container that scrolls
     * and is keyboard-reachable, so the exemption is granted to its contents
     * and only while the container ITSELF fits: the page must still not
     * scroll sideways, which is what the criterion is actually about.
     */
    const insideScroller = (element: Element) => {
      for (let node = element.parentElement; node; node = node.parentElement) {
        const overflow = getComputedStyle(node).overflowX;
        const scrolls = overflow === 'auto' || overflow === 'scroll';
        if (scrolls && node.getBoundingClientRect().right <= limit) return true;
      }
      return false;
    };

    for (const element of Array.from(document.body.querySelectorAll('*'))) {
      // An iframe holds someone else's document: its own width is ours to
      // check, its contents are not (the shop is a cross-origin frame).
      if (element.closest('iframe')) continue;

      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      const box = element.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;

      /*
       * Text that is off the screen on purpose, for a screen reader only.
       *
       * The clipped 1 px box IS that pattern - ours (`.nav__lang-name`, which
       * holds "Deutsch" behind the flag and the code) in its `clip-path`
       * form, and the CDK's live region (`.cdk-visually-hidden`) in the older
       * `clip: rect(...)` one. Clipping is how both work: `display: none`
       * would take the text from the reader as well, so the box is kept and
       * the paint is not. Nothing a sighted reader could lose is in there -
       * and the live region in particular reports a finding only once it has
       * announced something, which made this gate depend on when a test
       * happened to measure. The exemption needs a clip AND a box too small
       * to hold a character, so it stays an exemption rather than a hole.
       */
      const clipped = style.clipPath !== 'none' || style.clip !== 'auto';
      if (clipped && box.width <= 1 && box.height <= 1) continue;

      // The skip link lives off-canvas to the LEFT until it has focus, which
      // no browser scrolls to in a left-to-right document.
      if (box.right > limit && box.left >= 0 && !insideScroller(element)) {
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
    /*
     * The dialog contributes its legal links and its buttons, not every
     * anchor it contains.
     *
     * `.consent-dialog a` used to be the selector, which also caught the
     * policy link - and that one sits in a sentence, the case 2.5.8 exempts
     * by name (consent.css says so where it styles the others). An inline
     * link's rectangle is its line box, so at 320 px the wrapped German
     * label measured about 43.x px across two lines and reported itself as a
     * finding: a verdict decided by where the text happened to break rather
     * than by the size of anything a thumb aims at (enigma2_player-f1p).
     */
    const controls = document.body.querySelectorAll<HTMLElement>(
      'button, .btn, .nav a, .nav__langs a, .site-footer__links a, .consent-dialog__legal a,' +
        ' .shot__button',
    );

    for (const control of Array.from(controls)) {
      const box = control.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;

      // WCAG 2.2 2.5.8 asks for 24 px and exempts a link in a sentence; the PO
      // asked for 44 px, which is the AAA-level figure and what a thumb needs.
      if (box.height < 44 || box.width < 24) {
        findings.push({
          what: control.outerHTML.slice(0, 60).replace(/\s+/g, ' '),
          // Unrounded: the bar is `< 44`, so a box of 43.6 px fails it - and
          // `Math.round` printed that as "44 px", a finding that reads as
          // compliant and sends the next reader looking in the wrong place.
          detail: `${box.width.toFixed(1)}x${box.height.toFixed(1)} px, text "${(control.textContent ?? '').trim().slice(0, 24)}"`,
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

async function expectUsableTargets(page: Page, where: string) {
  const findings = await findSmallTargets(page);
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

test('the header stays the size the PO accepted at 400 % zoom', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto('');

  /*
   * The recorded decision of `enigma2_player-gf5`, as a number.
   *
   * At 320x256 the header is about 386 px tall: eleven page links wrapped
   * into four rows, plus the language row, which the flag-and-code switcher
   * holds to two (enigma2_player-13h). That is more than one screen and it
   * was looked at deliberately: WCAG 1.4.10 permits vertical scrolling, the
   * skip link bypasses the whole block for a keyboard (2.4.1), and the header
   * stops being sticky below 30 rem of height so it does not follow a reader
   * down the page. A disclosure menu would be a new interactive widget with
   * its own keyboard and reader obligations, and it was not worth that.
   *
   * What the decision does not permit is the header growing back quietly.
   * 440 px is the measurement plus one row of headroom: the twelfth nav link
   * is a conversation, not a commit.
   */
  const header = await page.locator('.nav').boundingBox();
  expect(Math.round(header?.height ?? 0), 'the header is taller than agreed').toBeLessThanOrEqual(
    440,
  );
  const langs = await page.locator('.nav__langs').boundingBox();
  expect(Math.round(langs?.height ?? 0), 'the language row needs a third row').toBeLessThanOrEqual(
    100,
  );
});

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

  for (const lang of ['en', 'es', 'fr', 'it'] as const) {
    for (const slug of ['', 'changelog', 'downloads', 'faq']) {
      const path = `${prefixOf(lang)}${slug}`;
      await page.goto(path);
      await expectNoOverflow(page, `/${path} at 320x256`);
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
  await page.setViewportSize({ width: 320, height: 256 });
  const paths = ['', 'downloads', 'screenshots', 'pricing', 'faq'];

  /*
   * Both consent states, and each one waited for.
   *
   * The prerendered HTML carries the dialog whichever cookie the visitor has:
   * it is static, so it cannot know, and the component removes itself only
   * once Angular has hydrated. Measuring between those two moments measures a
   * page nobody is looking at - which is how this test failed at 224 ms and
   * passed at 1.0 s on retry with the site unchanged (enigma2_player-f1p).
   * `toBeVisible` / `toHaveCount(0)` is the wait that makes the sweep land on
   * the state it claims to be checking.
   *
   * Undecided is checked rather than skipped because the dialog is the only
   * thing a first-time visitor can touch, and its own controls had never been
   * measured here at all.
   */
  for (const path of paths) {
    await page.goto(path);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectUsableTargets(page, `/${path} at 320x256, undecided`);
  }

  await context.addCookies([
    { name: 'e2p_consent', value: 'accepted', url: 'http://127.0.0.1:4321/enigma2_player/' },
  ]);
  for (const path of paths) {
    await page.goto(path);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expectUsableTargets(page, `/${path} at 320x256, accepted`);
  }
});

test('the target detector reports a control that is too small', async ({ page }) => {
  // Same reason as the overflow detector above: everything else here passes,
  // and a mistyped class in that selector list would make this gate blind
  // while leaving the suite green - which is the failure this repository has
  // shipped more than once. So the detector is handed a box it has to name.
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto('');
  await page.evaluate(() => {
    const small = document.createElement('button');
    small.id = 'deliberately-too-small';
    small.style.cssText = 'width: 60px; height: 20px';
    document.body.append(small);
  });

  const findings = await findSmallTargets(page);
  const reported = findings.find((finding) => finding.what.includes('deliberately-too-small'));
  expect(reported, 'the detector did not name a 20 px button').toBeDefined();
  // The exact figure, because the rounded one is what hid the real defect.
  expect(reported?.detail).toContain('60.0x20.0 px');
});

test('a link inside running prose is exempt from the target bar', async ({ page }) => {
  // The dialog's policy link sits in a sentence, which 2.5.8 exempts by name,
  // and measuring it is what made this gate flake (enigma2_player-f1p). Two
  // things have to hold: the link is still there - an exemption that works
  // because the link vanished would be a worse bug - and it is not reported.
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto('');
  const link = page.locator('.consent-dialog__policy a');
  await expect(link).toBeVisible();

  /*
   * No assertion on its height, deliberately: the label wraps to two lines at
   * 320 px and the line box that comes out of that is a platform figure -
   * 45.8 px on Windows, 43.x on the Linux runner, from the same markup and
   * the same CSS, because the font stack resolves differently. That spread is
   * the argument for the exemption rather than a detail of it: an inline link
   * in prose cannot be held to a target size that its platform's metrics
   * decide. What has to hold is that it is prose - inside a paragraph, not a
   * control in a row of controls - and that the sweep leaves it alone.
   */
  await expect(link.locator('xpath=..')).toHaveJSProperty('tagName', 'P');
  await expectUsableTargets(page, 'the dialog with its policy link in prose');
});
