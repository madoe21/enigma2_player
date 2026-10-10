/**
 * Reports unresolved ⟨…⟩ placeholders, and writes the repository's TODO.md.
 *
 * Same convention and same reasoning as the licence server's version
 * (`license_server/tool/check-placeholders.mjs`): right now every placeholder
 * is unresolved on purpose, because the company does not exist yet. A check
 * that failed today would be switched off within a week and never switched
 * back on. So it always *reports*, and it only *fails* once
 * `src/app/legal/entity.ts` declares `ENTITY_STATUS = 'FILLED'` - which is
 * exactly the moment a leftover placeholder stops being a to-do and becomes a
 * published legal text that names nobody.
 *
 * With `--write` it also rewrites `../TODO.md`: the placeholders, the demo
 * flag, and what has to happen at go-live. That list lives in a file and not
 * in Beads deliberately (enigma2_player-q6p) - these are not tasks with an
 * order and dependencies, they are values that cannot exist before the company
 * does, and the technical work is finished.
 *
 * Usage:
 *   npm run check:placeholders              report, and fail only when FILLED
 *   npm run check:placeholders -- --write   rewrite ../TODO.md as well
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

const ROOT = 'src/app';
const ENTITY = 'src/app/legal/entity.ts';
const FLAGS = 'src/app/content/site-flags.ts';
const TODO = '../TODO.md';
const SOURCE = /\.(ts|html|css|md)$/i;

/**
 * A missing identity value: the ⟨UPPER_SNAKE⟩ form of the convention.
 *
 * Deliberately the FORM and not the position in the line. Matching
 * `name: '⟨…⟩'` would only ever find the object properties in `entity.ts` and
 * would stay quiet about a placeholder written straight into a template or
 * into a legal text - which is the one place it must not survive.
 */
const PLACEHOLDER = /⟨[A-Z][A-Z0-9_]*⟩/g;

/**
 * A line that talks ABOUT the convention rather than waiting on it.
 *
 * Without this the check reports the sentence that explains the check:
 * `entity.ts` documents the form as `⟨UPPER_SNAKE⟩` in its own header. The
 * prose in `legal-copy.ts` that tells a reader the gaps stand in
 * ⟨angle brackets⟩ needs no exception - it is not UPPER_SNAKE.
 */
const EXPLAINS_THE_CONVENTION = /^\s*(\*|\/\/|\/\*)/;

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path, out);
    } else if (SOURCE.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}

/**
 * Whether the identity data has been declared complete.
 *
 * Read with a plain regex rather than by importing the module: this script has
 * to run before anything is built, and one line is all it needs.
 */
async function entityIsFilled() {
  try {
    return /ENTITY_STATUS\s*=\s*'FILLED'/.test(await readFile(ENTITY, 'utf8'));
  } catch {
    return false;
  }
}

/** Whether the site still calls itself a demonstration. */
async function demoMode() {
  try {
    return /DEMO_MODE\s*=\s*true/.test(await readFile(FLAGS, 'utf8'));
  } catch {
    return false;
  }
}

const findings = [];

for (const file of await walk(ROOT)) {
  const raw = await readFile(file, 'utf8');
  const where = relative('.', file).split(sep).join('/');
  raw.split(/\r?\n/).forEach((line, index) => {
    if (EXPLAINS_THE_CONVENTION.test(line)) {
      return;
    }
    for (const match of line.match(PLACEHOLDER) ?? []) {
      findings.push({ file: where, line: index + 1, text: match });
    }
  });
}

const unique = [...new Set(findings.map((finding) => finding.text))].sort();
const filled = await entityIsFilled();
const demo = await demoMode();

if (process.argv.includes('--write')) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = unique.map((text) => {
    const places = findings
      .filter((finding) => finding.text === text)
      .map((finding) => `${finding.file}:${finding.line}`)
      .join(', ');
    return `| \`${text}\` | ${places} |`;
  });

  const body = [
    '# Offene Stellen der Produktseite',
    '',
    `Erzeugt am ${today} von \`site/tool/check-placeholders.mjs\`.`,
    '**Nicht von Hand pflegen**: Wert eintragen, dann',
    '`npm run check:placeholders -- --write` erneut laufen lassen.',
    '',
    'Diese Liste steht bewusst hier und nicht in Beads: es sind keine Aufgaben mit',
    'Reihenfolge und Abhängigkeiten, sondern Werte, die erst existieren, wenn das',
    'Unternehmen existiert (`license_server-xwl0`). Technisch funktioniert die',
    'Seite; was hier steht, bringt ein Unternehmen mit.',
    '',
    '## Stand',
    '',
    '| | |',
    '|---|---|',
    `| Demo-Hinweis | ${demo ? '**sichtbar** (`DEMO_MODE = true`)' : 'aus'} |`,
    `| Identitätsangaben | ${filled ? '**ausgefüllt**' : `${unique.length} offen`} |`,
    `| Prüfung scheitert bei Platzhaltern | ${filled ? 'ja' : 'nein, erst ab `FILLED`'} |`,
    '',
    '## Beim Livegang zu tun',
    '',
    `1. **Die ${unique.length} Platzhalter unten ausfüllen**, alle in`,
    '   `site/src/app/legal/entity.ts`. Danach dort `ENTITY_STATUS` auf `FILLED`',
    '   setzen: ab dann **scheitert** die Prüfung bei jedem verbliebenen',
    '   Platzhalter, damit kein Rechtstext mit ⟨…⟩ online geht.',
    '2. **Den Demo-Hinweis abschalten**: `DEMO_MODE = false` in',
    '   `site/src/app/content/site-flags.ts`. Er steht auf jeder Seite und sagt,',
    '   dass noch nichts gekauft werden kann.',
    '3. **Dieselben Angaben im License Server eintragen**, dort in',
    '   `compliance/legal/entity.yaml`. Zwei Repositorys können keine Datei',
    '   teilen, also wird zweimal aus derselben Tatsache ausgefüllt.',
    '4. **Preismodelle anlegen**, sonst sagt die Preisseite weiter „Preise sind',
    '   bald verfügbar": der Endpunkt des License Servers antwortet, seine Liste',
    '   ist leer.',
    '',
    '## Die Platzhalter',
    '',
    '| Platzhalter | Stellen |',
    '|---|---|',
    ...rows,
    '',
  ].join('\n');

  await writeFile(resolve(TODO), body, 'utf8');
  console.log(`wrote ${TODO}: ${unique.length} placeholder(s), demo ${demo ? 'on' : 'off'}`);
}

for (const finding of findings) {
  console.log(`${finding.file}:${finding.line}  ${finding.text}`);
}

console.log(
  `\n${findings.length} occurrence(s) of ${unique.length} distinct placeholder(s); ` +
    `entity status: ${filled ? 'FILLED' : 'PLACEHOLDERS_UNFILLED'}; ` +
    `demo notice: ${demo ? 'visible' : 'off'}`,
);

if (filled && findings.length > 0) {
  console.error(
    '\nThe identity data says FILLED while placeholders remain. A published ' +
      'legal text with ⟨…⟩ in it names nobody.',
  );
  process.exit(1);
}
