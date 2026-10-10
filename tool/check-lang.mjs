/**
 * Asserts that every built page declares the language it is written in.
 *
 * Against the BUILD OUTPUT, not against `getLangFromUrl` - that is the whole
 * point of this check. The bug it guards (enigma2_player-w83) passed every
 * reading of the function and every local run: with `base: '/enigma2_player'`
 * the base path was stripped to `/` instead of to nothing, so the deployed
 * `/enigma2_player/en/` became `//en/`, the first path segment was empty, and
 * all five languages were served as `<html lang="de">`. Locally there is no
 * base path, so locally it worked. Only the artefact tells the truth.
 *
 * That matters beyond tidiness: WCAG 2.2 SC 3.1.1 requires the page language
 * to be machine-readable, because a screen reader picks its voice from it.
 * French prose read with a German voice is not untidy, it is unusable.
 *
 * Usage: npm run build && npm run check:lang
 */
import {readFile, readdir} from 'node:fs/promises';
import {join} from 'node:path';

const DIST = 'dist';
const LOCALES = ['de', 'en', 'es', 'fr', 'it'];
const DEFAULT_LOCALE = 'de';

/** Every built page, as a path relative to `dist`. */
async function builtPages(dir = DIST, prefix = '') {
  const out = [];
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      const nested = await builtPages(
        join(dir, entry.name),
        `${prefix}${entry.name}/`,
      );
      out.push(...nested);
    } else if (entry.name === 'index.html') {
      out.push(prefix);
    }
  }
  return out;
}

/**
 * The language a path is supposed to be in, from its own first segment.
 *
 * Derived from the path rather than from the application's own helper: a
 * check that asks the code under test what the answer should be cannot fail.
 */
function expectedLang(path) {
  const [first] = path.split('/').filter(Boolean);
  return LOCALES.includes(first) ? first : DEFAULT_LOCALE;
}

const pages = (await builtPages()).sort();
if (pages.length === 0) {
  console.error('no built pages found in dist/ - run `npm run build` first');
  process.exit(1);
}

const wrong = [];
const seen = new Set();

for (const path of pages) {
  const html = await readFile(join(DIST, path, 'index.html'), 'utf8');
  const declared = /<html[^>]*\blang="([^"]+)"/.exec(html)?.[1];
  const expected = expectedLang(path);
  seen.add(expected);
  if (declared !== expected) {
    wrong.push({path: `/${path}`, declared: declared ?? '(none)', expected});
  }
}

for (const row of wrong) {
  console.error(
    `${row.path}  declares lang="${row.declared}", expected "${row.expected}"`,
  );
}

// One page per locale is not enough to prove the list is complete: the bug was
// a locale MISSING from a hard-coded list, and a check that only looks at the
// locales it happens to find would have been just as silent about it.
const missing = LOCALES.filter(locale => !seen.has(locale));
if (missing.length > 0) {
  console.error(`\nno built pages at all for: ${missing.join(', ')}`);
}

console.log(
  `\n${pages.length} page(s) checked across ${seen.size} locale(s); ` +
    `${wrong.length} with the wrong lang attribute`,
);

if (wrong.length > 0 || missing.length > 0) {
  process.exit(1);
}
