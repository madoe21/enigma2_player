/**
 * Reports keys that are missing from a language, and keys nobody reads.
 *
 * `ui.ts` falls back to German for a missing key, which is the right behaviour
 * at runtime and a trap during development: a page renders, looks finished,
 * and is quietly German. The dictionaries are 63 keys in five languages, 315
 * entries - nobody notices four missing keys by reading.
 *
 * IT FAILS ON exactly three things, and this list is the whole contract
 * (`enigma2_player-7qz` - the previous version of this comment promised a
 * fourth):
 *  - a key missing from GERMAN or ENGLISH, the two languages this project
 *    maintains itself;
 *  - a key a language has and `de` does not, which is a typo or a leftover;
 *  - a key no source file reads, because that is dead weight either way.
 *
 * It does NOT fail on a key missing from es, fr or it: those three are
 * unreviewed machine translations, accepted as such by the PO on 2026-10-12
 * because the product is sold in Germany only, so a red build there would say
 * something everyone already knows. They are reported, and the report says
 * `falls back to de` rather than `MISSING`.
 *
 * COMPUTED KEYS: a key can be assembled - `of(`legal.${id}`)` in
 * `legal-links.ts` - and a text scan cannot resolve it. Every literal prefix in
 * front of a `${` counts as "the whole prefix is read", so `legal.imprint`,
 * `legal.privacy` and `legal.cookies` are not reported as dead. The cost is
 * honest and deliberate: a genuinely dead `legal.*` key now hides behind that
 * prefix, which is cheaper than three permanent false alarms teaching everyone
 * to ignore the report.
 * The other direction - `${group}.title` - cannot be resolved at all and would
 * show up as unread. If that ever appears, teach this scanner about it; do not
 * delete the key it reads.
 *
 * Usage: npm run check:translations
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const UI = 'src/app/content/ui.ts';
const SOURCE_ROOT = 'src/app';
const MAINTAINED = ['de', 'en'];

/** The keys declared per language, read with a regex rather than by importing. */
async function dictionaries() {
  const source = await readFile(UI, 'utf8');
  const out = new Map();
  // Each language block starts at `  de: {` and ends at the matching `  },`.
  for (const match of source.matchAll(/^ {2}([a-z]{2}): \{$/gm)) {
    const lang = match[1];
    const start = match.index + match[0].length;
    const end = source.indexOf('\n  },', start);
    const block = source.slice(start, end);
    const keys = new Set([...block.matchAll(/^\s{4}'([^']+)':/gm)].map((entry) => entry[1]));
    out.set(lang, keys);
  }
  return out;
}

/**
 * Every key any source file asks for: the literal ones, plus the prefixes of
 * the ones that are assembled at runtime.
 */
async function usedKeys() {
  const used = new Set();
  const prefixes = new Set();
  const files = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (/\.ts$/.test(entry.name) && !path.endsWith('ui.ts')) {
        files.push(path);
      }
    }
  }
  await walk(SOURCE_ROOT);
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    // t('x'), of('x'), group({a: 'x'}) and navKey: 'x' all name a key as a
    // single-quoted dotted string; nothing else in this codebase does.
    for (const match of source.matchAll(/'([a-z][a-z0-9]*(?:\.[a-zA-Z0-9]+)+)'/g)) {
      used.add(match[1]);
    }
    // `legal.${id}` reads one of the `legal.*` keys - which one is decided at
    // runtime, so the literal prefix is as much as a scan can know.
    for (const match of source.matchAll(/`([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)*\.)\$\{/g)) {
      prefixes.add(match[1]);
    }
  }
  return { used, prefixes };
}

/** A key is read when a file names it, or names a prefix it falls under. */
function isRead(key, used, prefixes) {
  return used.has(key) || [...prefixes].some((prefix) => key.startsWith(prefix));
}

const dicts = await dictionaries();
const german = dicts.get('de');
const { used, prefixes } = await usedKeys();

/** One sentence per defect found; empty means the gate is green. */
const defects = [];

for (const [lang, keys] of dicts) {
  const missing = [...german].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !german.has(key));
  const label = MAINTAINED.includes(lang) ? 'MISSING' : 'missing (falls back to de)';
  if (missing.length > 0) {
    console.log(`${lang}: ${missing.length} ${label}`);
    for (const key of missing.slice(0, 12)) {
      console.log(`    ${key}`);
    }
    if (missing.length > 12) {
      console.log(`    … and ${missing.length - 12} more`);
    }
    if (MAINTAINED.includes(lang)) {
      defects.push(`${missing.length} key(s) missing from ${lang}`);
    }
  }
  if (extra.length > 0) {
    console.log(`${lang}: ${extra.length} key(s) not in de - a typo or a leftover`);
    for (const key of extra) {
      console.log(`    ${key}`);
    }
    defects.push(`${extra.length} key(s) in ${lang} but not in de`);
  }
}

const unread = [...german].filter((key) => !isRead(key, used, prefixes));
if (unread.length > 0) {
  console.log(`\n${unread.length} key(s) no source file reads:`);
  for (const key of unread) {
    console.log(`    ${key}`);
  }
  console.log(
    '  Either a page is missing, or the key is left over from the Astro site. ' +
      'The old repository had 127 of these (enigma2_player_source-gwf).',
  );
  defects.push(`${unread.length} key(s) nobody reads`);
}

console.log(
  `\n${german.size} keys in de; ` +
    [...dicts].map(([lang, keys]) => `${lang} ${keys.size}`).join(', ') +
    `; ${used.size} key(s) read by the code` +
    (prefixes.size > 0 ? `, plus ${[...prefixes].map((p) => `${p}*`).join(', ')}` : '') +
    '.',
);

if (defects.length > 0) {
  console.error(`\n${defects.join('; ')}. That is a defect, not a to-do.`);
  process.exit(1);
}
