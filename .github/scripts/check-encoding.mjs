#!/usr/bin/env node
/**
 * Every tracked text file is UTF-8, without a BOM, and not double-encoded
 * (`enigma2_player-5rk`).
 *
 * Why this exists: commit 670168b ("chore: upgrade aiflow tooling to 0.8.0")
 * rewrote AGENTS.md - the file loaded into every agent session as this
 * repository's operating rules - through a writer that read UTF-8 and wrote the
 * bytes back as windows-1252. 395 sequences were mangled: every em dash, every
 * section sign, every arrow and the whole box-drawing diagram in section 5. The
 * parent commit is clean, so it arrived in one step, and nothing noticed for
 * four days. It is invisible in exactly the places it matters: a diff viewer
 * shows two changed glyphs per line, Prettier reformats mojibake happily
 * because it is still valid UTF-8, and the agent that reads the file simply
 * gets worse instructions.
 *
 * What double-encoded means here: text that is already UTF-8 gets decoded as
 * windows-1252 and re-encoded, so one character becomes two or three. The
 * damage is detectable because it is reversible - map the characters back to
 * their windows-1252 bytes and the result is valid UTF-8 again, and shorter.
 * That is the test below, and it is why a legitimately encoded file cannot trip
 * it: a lone accented character is never a candidate, because its single
 * windows-1252 byte is not valid UTF-8 by itself - every byte >= 0x80 is either
 * a continuation or a lead that demands one. So the damage needs at least two
 * adjacent non-ASCII characters, and even then only counts when their bytes
 * form valid UTF-8. (The loop therefore stops at length 2 as arithmetic, not as
 * a filter: setting it to 1 changes no outcome, which is why no test in
 * `test/scripts/check-encoding.test.mjs` can tell the two apart.)
 *
 * The known limit: a genuine uppercase-accented character immediately followed
 * by a Latin-1 symbol (the only shape that is both plausible prose and a valid
 * UTF-8 lead/continuation pair) would be reported. None exists in this tree,
 * the report prints the offending text, and the alternative - a hand-written
 * list of mojibake strings - stops at the first sequence nobody thought of.
 *
 * CI only, deliberately: unlike the hook-sync check this has no `pre-commit`
 * twin. The damage does not arrive as a developer edit, it arrives as a
 * wholesale rewrite by an external tool, and a fourth hook branch would owe
 * this repository a bats case, a mutant and a node-missing path in both hook
 * copies (`enigma2_player-3c5`). CI sees pull requests, which is where a
 * tooling upgrade lands.
 *
 * Usage: node .github/scripts/check-encoding.mjs [<dir>]
 * Exit 0 clean, 1 on any finding.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The one file that is exempt, and the criterion for adding another: written by
 * a machine, append-only, and its past lines are history rather than content
 * anybody may edit. `bd` writes interaction telemetry here and mangled a bead
 * note of this very investigation on the way in - a line that cannot be fixed
 * without rewriting the log, and will come back the next time a note quotes a
 * dash. A gate that fails on something no one in this repository can fix is a
 * gate people learn to ignore.
 *
 * Source files do NOT belong here. A comment that needs to show mojibake can
 * spell out the bytes instead; that is what `.githooks/pre-commit` now does.
 */
const EXEMPT = new Set(['.beads/interactions.jsonl']);

/** How many offending lines to print per file before saying "and N more". */
const MAX_LINES_PER_FILE = 5;
/** Longest mojibake run worth testing: one character becomes at most 3-4. */
const MAX_RUN = 6;

/**
 * Character -> windows-1252 byte, built by inverting the decoder rather than
 * typing out a 256-entry table. WHATWG windows-1252 maps all 256 bytes to a
 * distinct character (the five holes of the vendor table decode to their C1
 * control characters), so the inverse is total - which matters, because
 * U+0090 really does occur in mangled box-drawing art.
 */
const TO_CP1252 = (() => {
  const all = new TextDecoder('windows-1252').decode(Uint8Array.from({ length: 256 }, (_, i) => i));
  return new Map([...all].map((ch, i) => [ch, i]));
})();

const STRICT_UTF8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

/** The run's windows-1252 bytes. Every character in a run has one, by `runEnd`. */
function toBytes(run) {
  const out = new Uint8Array(run.length);
  for (let i = 0; i < run.length; i++) out[i] = TO_CP1252.get(run[i]);
  return out;
}

/**
 * Where the run of non-ASCII, windows-1252-representable characters starting at
 * `start` ends.
 *
 * The boundary is the whole reason this is a function: scanning past it drags
 * the following ASCII into the candidate, and since windows-1252 maps ASCII to
 * itself, `"<mojibake> bi"` decodes as happily as the mojibake alone - the gate
 * then reports a sequence with a tail of innocent letters in it, and the two
 * invariants the test below relies on stop holding. Characters above U+00FF
 * (box drawing, arrows) are not in the map and end a run, which is correct:
 * they cannot be the product of this damage.
 */
function runEnd(line, start) {
  let end = start;
  while (end < line.length && line.charCodeAt(end) >= 0x80 && TO_CP1252.has(line[end])) end++;
  return end;
}

/** The text those bytes would be as UTF-8, or null when they are not valid. */
function asUtf8(bytes) {
  try {
    return STRICT_UTF8.decode(bytes);
  } catch {
    return null;
  }
}

/**
 * The first double-encoded run in the line, or null.
 *
 * Longest match first within the run, so a three-character mojibake sequence is
 * reported as the one em dash it was rather than as the two-character prefix
 * that happens to decode as well. A failed run is not skipped past: a genuine
 * non-ASCII character can sit immediately in front of a mangled one, and the
 * match then starts one position further in.
 */
function findMojibake(line) {
  for (let start = 0; start < line.length; start++) {
    if (line.charCodeAt(start) < 0x80) continue;
    const limit = Math.min(MAX_RUN, runEnd(line, start) - start);
    for (let length = limit; length >= 2; length--) {
      const run = line.slice(start, start + length);
      const decoded = asUtf8(toBytes(run));
      // Validity is the whole test, and nothing else needs asserting: every
      // character in a run is non-ASCII, so every one of its windows-1252
      // bytes is >= 0x80, so a valid UTF-8 decode spends at least two of them
      // per character. The result is therefore always shorter than the run and
      // never ASCII - checked exhaustively over all 63360 valid two- and
      // three-byte combinations of high bytes, and arithmetic beyond that.
      // Asserting those two properties as well only looked careful: with the
      // run boundary enforced no input can reach either branch, so no test
      // could ever hold them honest. Without it, both were load-bearing.
      if (decoded === null) continue;
      return { column: start + 1, found: run, should_be: decoded };
    }
  }
  return null;
}

/** Tracked files, as git sees them - never the working tree's leftovers. */
function trackedFiles(root) {
  const out = execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8' });
  return out.split('\0').filter(Boolean);
}

/** Git's own binary heuristic: a NUL byte in the content and it is not text. */
function isBinary(bytes) {
  return bytes.includes(0);
}

const root = process.argv[2] ?? '.';
const findings = [];

for (const path of trackedFiles(root)) {
  if (EXEMPT.has(path)) continue;
  const full = join(root, path);
  let bytes;
  try {
    if (!statSync(full).isFile()) continue; // a submodule, or a path git knows and the disk does not
    bytes = readFileSync(full);
  } catch {
    continue;
  }
  if (isBinary(bytes)) continue;

  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    findings.push(
      `${path}:1: UTF-8 BOM - bash reads it as part of the shebang, JSON parsers reject it`,
    );
    continue;
  }

  const text = asUtf8(bytes);
  if (text === null) {
    findings.push(`${path}: not valid UTF-8 - some tool wrote a legacy single-byte encoding here`);
    continue;
  }

  const lines = text.split('\n');
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const hit = findMojibake(lines[i]);
    if (hit) hits.push({ line: i + 1, ...hit });
  }
  if (!hits.length) continue;

  for (const hit of hits.slice(0, MAX_LINES_PER_FILE)) {
    findings.push(
      `${path}:${hit.line}:${hit.column}: double-encoded ` +
        `${JSON.stringify(hit.found)} should be ${JSON.stringify(hit.should_be)}`,
    );
  }
  if (hits.length > MAX_LINES_PER_FILE) {
    findings.push(`${path}: and ${hits.length - MAX_LINES_PER_FILE} more line(s) like it`);
  }
}

if (findings.length) {
  for (const finding of findings) console.error(`::error::encoding: ${finding}`);
  console.error(
    `\n${findings.length} encoding problem(s). Restore the file from the commit before the ` +
      `tool that wrote it, or repair the sequences; do not hand-edit single glyphs.`,
  );
  process.exit(1);
}

console.log('encoding: every tracked text file is UTF-8, no BOM, no double-encoding');
