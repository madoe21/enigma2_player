/**
 * Reports keys that are missing from a language, and keys nobody reads.
 *
 * `ui.ts` falls back to German for a missing key, which is the right behaviour
 * at runtime and a trap during development: a page renders, looks finished,
 * and is quietly German. The dictionaries are 475 entries in five languages -
 * nobody notices four missing keys by reading.
 *
 * This is not a failing gate yet, and that is deliberate: es, fr and it are
 * machine translations awaiting a native speaker (`enigma2_player-4dx`), so a
 * red build today would say something everyone already knows. It fails only on
 * a key missing from GERMAN or ENGLISH, which are the two languages this
 * project maintains itself - and on a key no component reads, because that is
 * dead weight either way.
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

/** Every key any source file asks for. */
async function usedKeys() {
  const used = new Set();
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
  }
  return used;
}

const dicts = await dictionaries();
const german = dicts.get('de');
const used = await usedKeys();

let fatal = 0;

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
      fatal += missing.length;
    }
  }
  if (extra.length > 0) {
    console.log(`${lang}: ${extra.length} key(s) not in de - a typo or a leftover`);
    for (const key of extra) {
      console.log(`    ${key}`);
    }
    fatal += extra.length;
  }
}

const unread = [...german].filter((key) => !used.has(key));
if (unread.length > 0) {
  console.log(`\n${unread.length} key(s) no source file reads:`);
  for (const key of unread) {
    console.log(`    ${key}`);
  }
  console.log(
    '  Either a page is missing, or the key is left over from the Astro site. ' +
      'The old repository had 127 of these (enigma2_player_source-gwf).',
  );
}

console.log(
  `\n${german.size} keys in de; ` +
    [...dicts].map(([lang, keys]) => `${lang} ${keys.size}`).join(', ') +
    `; ${used.size} key(s) read by the code.`,
);

if (fatal > 0) {
  console.error(`\n${fatal} finding(s) in a maintained language. That is a defect, not a to-do.`);
  process.exit(1);
}
