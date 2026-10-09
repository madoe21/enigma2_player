/**
 * Fails when a component template carries text a reader would see.
 *
 * The acceptance criterion of `enigma2_player-n5j` is that no component holds
 * translatable text as a literal, and the reason is mechanical rather than
 * stylistic: a component with a German sentence inside it has to be copied to
 * say the same thing in English, and the copy is what drifts. All five
 * languages come from `src/app/content/ui.ts` and `content.ts`, so a sentence
 * anywhere else is a sentence only German readers will ever see.
 *
 * What counts as a finding: text between tags, or inside a `title`,
 * `aria-label`, `alt` or `placeholder` attribute, that is not an interpolation
 * and is not one of the characters below.
 *
 * Usage: npm run check:literals
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const ROOT = 'src/app';

/**
 * Symbols and markers, which are not language.
 *
 * The lightbox's arrows and close cross are the honest case: they are icons
 * typed as characters, and their accessible names come from `ui.ts` right next
 * to them (`gallery.close`, `gallery.previous`, `gallery.next`), so a screen
 * reader gets words and a sighted reader gets a glyph.
 */
const NOT_LANGUAGE = /^[\s0-9.,:;·×✕‹›«»—–\-+*/()[\]{}|&@#%$€£!?"'`~^<>=]*$/u;

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path, out);
    } else if (/\.(ts|html)$/.test(entry.name) && !/\.spec\.ts$/.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}

/** The template of a component file, or the whole file for an .html template. */
function templateOf(source, file) {
  if (file.endsWith('.html')) {
    return source;
  }
  const match = source.match(/template:\s*`([\s\S]*?)`,\n/);
  return match ? match[1] : null;
}

const findings = [];

for (const file of await walk(ROOT)) {
  const source = await readFile(file, 'utf8');
  const template = templateOf(source, file);
  if (template === null) {
    continue;
  }
  const where = relative('.', file).split(sep).join('/');

  // Text nodes: whatever sits between a `>` and the next `<`.
  for (const [, text] of template.matchAll(/>([^<>]+)</g)) {
    const stripped = text.replace(/\{\{[^}]*\}\}/g, '').replace(/@[a-z]+[^{]*\{?/g, '');
    if (!NOT_LANGUAGE.test(stripped)) {
      findings.push({ where, kind: 'text', text: stripped.trim() });
    }
  }

  // Attributes a reader or a screen reader is given verbatim.
  for (const [, name, value] of template.matchAll(
    /\s(title|aria-label|alt|placeholder)="([^"]*)"/g,
  )) {
    if (!NOT_LANGUAGE.test(value.replace(/\{\{[^}]*\}\}/g, ''))) {
      findings.push({ where, kind: name, text: value });
    }
  }
}

for (const finding of findings) {
  console.error(`${finding.where}: ${finding.kind} "${finding.text}"`);
}

if (findings.length > 0) {
  console.error(
    `\n${findings.length} literal(s) a reader would see. Move the text into ` +
      'src/app/content/ui.ts (all five languages) and bind it instead.',
  );
  process.exit(1);
}

console.log('no translatable literals in any component template');
