/**
 * A throwaway source tree to run a gate against (`enigma2_player-rie`).
 *
 * The six tools in this directory are top-level scripts: they read paths
 * relative to the working directory and end in `process.exit`. Nothing is
 * exported, so there is no function to call - which is why none of them had a
 * test. Two ways out: refactor each one into exported parts plus a thin command
 * line, or run the real script against a tree built for the occasion. This is
 * the second, for three reasons:
 *  - it tests the gate that actually ships, exit code included, and the exit
 *    code IS the gate - a check that finds everything and exits 0 is the defect
 *    this repository keeps shipping (enigma2_player-aji, -38r, -a3q, -nje);
 *  - it needs no change to the scripts, so a green suite here says the current
 *    files behave, not that a refactor of them behaves;
 *  - it is the pattern the hook suite already uses (`test/hooks/helper.bash`),
 *    so there is one way of testing a script in this repository, not two.
 *
 * The tree is laid out as `<tmp>/site/` and the gate runs with that as its
 * working directory, because `check-placeholders.mjs --write` writes `../TODO.md`
 * - one level ABOVE the working directory. With a flat fixture that would land
 * in `$TMPDIR` itself; with this layout it lands in the fixture's own root and
 * is removed with it. No test writes into this repository.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOL_DIR = dirname(fileURLToPath(import.meta.url));

/**
 * A fixture rooted at `<tmp>/site`, with the directories every gate walks.
 *
 * @returns {{root: string, site: string}} the outer root and the working directory
 */
export function makeTree() {
  const root = mkdtempSync(join(tmpdir(), 'gate-fixture-'));
  const site = join(root, 'site');
  mkdirSync(join(site, 'src', 'app'), { recursive: true });
  return { root, site };
}

/** Remove a fixture. Safe to call twice; teardown runs even when a test threw. */
export function dropTree(tree) {
  rmSync(tree.root, { recursive: true, force: true });
}

/** Write a file below the fixture's working directory, creating its parents. */
export function write(tree, relativePath, contents) {
  const path = join(tree.site, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
  return path;
}

/** Read a file written by a gate, by path relative to the fixture ROOT. */
export function readFromRoot(tree, relativePath) {
  return readFileSync(join(tree.root, relativePath), 'utf8');
}

/**
 * Run one of this directory's gates against the fixture.
 *
 * The script is taken from this repository rather than copied in: a copy would
 * let the suite stay green over a broken original.
 *
 * @returns {{status: number, output: string}} exit code, and stdout+stderr joined
 *   because a gate's verdict and its reasons are split across both streams
 */
export function runGate(tree, script, args = []) {
  const result = spawnSync(process.execPath, [join(TOOL_DIR, script), ...args], {
    cwd: tree.site,
    encoding: 'utf8',
    // A gate that waits for input would otherwise hang the suite instead of failing it.
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    status: result.status,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

/**
 * A `ui.ts` in the shape `check-translations.mjs` parses.
 *
 * That parser is a regex over the source text, not an import, so the layout
 * matters: a language block opens at exactly two spaces (`  de: {`), its keys
 * carry four, and it closes at `\n  },`. Built here from data so a test states
 * which keys each language has and nothing else.
 *
 * @param {Record<string, string[]>} byLang e.g. `{de: ['nav.buy'], en: ['nav.buy']}`
 */
export function uiSource(byLang) {
  const blocks = Object.entries(byLang).map(([lang, keys]) => {
    const entries = keys.map((key) => `    '${key}': '${lang}-${key}',`).join('\n');
    return `  ${lang}: {\n${entries}\n  },`;
  });
  return `export const ui = {\n${blocks.join('\n')}\n} as const;\n`;
}
