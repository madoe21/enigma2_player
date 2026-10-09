/**
 * Reports unresolved ⟨…⟩ placeholders in this site's legal texts.
 *
 * Same convention and same reasoning as the licence server's version
 * (`license_server/tool/check-placeholders.mjs`): right now every placeholder
 * is unresolved on purpose, because the company does not exist yet. A check
 * that failed today would be switched off within a week and never switched
 * back on. So it always *reports*, and it only *fails* once
 * `src/app/legal/entity.ts` declares `ENTITY_STATUS = 'FILLED'` - which is
 * exactly the moment a leftover placeholder stops being a to-do and becomes a
 * published document that names nobody.
 *
 * Usage:
 *   npm run check:placeholders            report, and fail only when FILLED
 *   npm run check:placeholders -- --write rewrite ../TODO.md from the findings
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

const ROOT = 'src/app';
const ENTITY = 'src/app/legal/entity.ts';
const TODO = '../TODO.md';
const SOURCE = /\.(ts|html|css|md)$/i;

/** The placeholder form from the convention: ⟨UPPER_SNAKE⟩ or ⟨prose⟩. */
const PLACEHOLDER = /⟨[^⟩\n]{1,80}⟩/g;

/**
 * Files that describe the convention rather than wait on a value.
 *
 * Their own examples are not findings - otherwise the check reports the
 * sentence that explains the check.
 */
const EXPLAINS_ITSELF = [join('src', 'app', 'legal', 'legal-copy.ts')];

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
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

const files = await walk(ROOT);
const findings = [];

for (const file of files) {
  const raw = await readFile(file, 'utf8');
  const lines = raw.split(/\r?\n/);
  const explainsItself = EXPLAINS_ITSELF.some((known) => file.endsWith(known));
  lines.forEach((line, index) => {
    // In the file that documents the convention, only the identity values
    // count - not the sentences about angle brackets.
    if (explainsItself && !/⟨[A-Z0-9_]+⟩/.test(line)) {
      return;
    }
    for (const match of line.match(PLACEHOLDER) ?? []) {
      // Forward slashes, so the generated list is the same file on every
      // platform instead of churning between Windows and CI.
      const where = relative('.', file).split(sep).join('/');
      findings.push({ file: where, line: index + 1, text: match });
    }
  });
}

const unique = [...new Set(findings.map((finding) => finding.text))].sort();

if (process.argv.includes('--write')) {
  const body = [
    '# Offene Stellen der Produktseite',
    '',
    'Erzeugt von `site/tool/check-placeholders.mjs`. **Nicht von Hand pflegen** -',
    'ausfüllen heißt: den Wert in `site/src/app/legal/entity.ts` eintragen und das',
    'Skript erneut laufen lassen.',
    '',
    'Diese Liste steht bewusst hier und nicht in Beads: es sind keine Aufgaben mit',
    'Reihenfolge und Abhängigkeiten, sondern Werte, die erst existieren, wenn das',
    'Unternehmen existiert (`license_server-xwl0`).',
    '',
    `Stand: ${unique.length} offene Platzhalter an ${findings.length} Stellen.`,
    '',
    '| Platzhalter | Stellen |',
    '|---|---|',
    ...unique.map((text) => {
      const places = findings
        .filter((finding) => finding.text === text)
        .map((finding) => `${finding.file}:${finding.line}`)
        .join(', ');
      return `| \`${text}\` | ${places} |`;
    }),
    '',
    'Dieselben Angaben werden im License Server ein zweites Mal gebraucht',
    '(`compliance/legal/entity.yaml`). Zwei Repositorys können keine Datei teilen,',
    'also wird zweimal aus derselben Tatsache ausgefüllt.',
    '',
  ].join('\n');
  await writeFile(resolve(TODO), body, 'utf8');
  console.log(`wrote ${TODO}: ${unique.length} placeholders`);
}

for (const finding of findings) {
  console.log(`${finding.file}:${finding.line}  ${finding.text}`);
}

const filled = await entityIsFilled();
console.log(
  `\n${findings.length} placeholder(s) in ${unique.length} distinct value(s); ` +
    `entity status: ${filled ? 'FILLED' : 'PLACEHOLDERS_UNFILLED'}`,
);

if (filled && findings.length > 0) {
  console.error(
    '\nThe identity data says FILLED while placeholders remain. A published ' +
      'legal text with ⟨…⟩ in it names nobody.',
  );
  process.exit(1);
}
