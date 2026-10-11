/**
 * The decision branches of `.github/scripts/check-encoding.mjs`
 * (`enigma2_player-5rk`).
 *
 * The gate exists because AGENTS.md was silently double-encoded by a tooling
 * upgrade, so the case that matters most is not "does it catch the damage" but
 * **does it leave correct text alone**: a repository whose own rules file is
 * full of em dashes, section signs and box-drawing characters cannot live with
 * a detector that reports any of them. `a correctly encoded file with every
 * character this repository actually uses is green` is that case.
 *
 * Every case asserts the EXIT CODE as well as the text, for the reason this
 * repository has now learnt four times over: a gate that prints every finding
 * and exits 0 reads exactly like a gate that passed (`enigma2_player-rie`).
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const GATE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../.github/scripts/check-encoding.mjs',
);

/** An empty git repository, removed when the case ends, however it ends. */
function tree(t) {
  const dir = mkdtempSync(join(tmpdir(), 'encoding-gate-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  execFileSync('git', ['-C', dir, 'init', '-q']);
  // Not the developer's global setting: with core.autocrlf=true every `git add`
  // below prints a line-ending warning, and a fixture that reads differently on
  // Windows than in CI is the class of problem .gitattributes was written for
  // (`enigma2_player-efi`).
  execFileSync('git', ['-C', dir, 'config', 'core.autocrlf', 'false']);
  return dir;
}

/** Writes the file and stages it, because the gate reads what git tracks. */
function track(dir, path, contents) {
  write(dir, path, contents);
  execFileSync('git', ['-C', dir, 'add', '--', path]);
}

/** Writes the file and leaves it untracked. */
function write(dir, path, contents) {
  const full = join(dir, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
}

/** The real script against that tree: its exit code and everything it said. */
function runGate(dir) {
  try {
    const stdout = execFileSync('node', [GATE, dir], { encoding: 'utf8', stdio: 'pipe' });
    return { status: 0, output: stdout };
  } catch (error) {
    return { status: error.status, output: `${error.stdout}${error.stderr}` };
  }
}

/** The same mangling the aiflow upgrade applied: UTF-8 bytes written as cp1252. */
function doubleEncode(text) {
  const utf8 = Buffer.from(text, 'utf8');
  return new TextDecoder('windows-1252').decode(utf8);
}

test('a correctly encoded file with every character this repository actually uses is green', (t) => {
  const dir = tree(t);
  // Em dash and en dash, section signs, arrows, box drawing, the bullet, the
  // ellipsis, German umlauts, guillemets, an accented capital - all 241
  // non-ASCII lines of AGENTS.md are made of these.
  track(
    dir,
    'AGENTS.md',
    '# Rules — binding\n' +
      '§ 2a → § 2b · see below\n' +
      '┌─┬─┐\n│ │ │\n└─┴─┘\n' +
      'für Müßiggänger « Café » ÄÖÜ – … •\n',
  );

  const { status, output } = runGate(dir);

  assert.equal(status, 0, output);
  assert.match(output, /every tracked text file is UTF-8/);
});

test('a double-encoded file fails, and says which line and what it should be', (t) => {
  const dir = tree(t);
  track(dir, 'AGENTS.md', `# fine\n${doubleEncode('rules — binding')}\n`);

  const { status, output } = runGate(dir);

  assert.equal(status, 1, output);
  assert.match(output, /AGENTS\.md:2:7/);
  assert.match(output, /double-encoded/);
  // The repair, not just the complaint: the em dash is named as the intent.
  assert.match(output, /should be "—"/);
});

test('the reported sequence stops at the run - the ASCII after it is not swallowed', (t) => {
  const dir = tree(t);
  track(dir, 'AGENTS.md', `${doubleEncode('— binding')}\n`);

  const { status, output } = runGate(dir);

  assert.equal(status, 1, output);
  // Exactly the three mangled characters and nothing after them. This was a
  // real defect: windows-1252 maps ASCII to itself, so " bi" decoded along with
  // the dash and the gate reported the dash plus a tail of innocent letters.
  assert.match(output, new RegExp(`double-encoded "${doubleEncode('—')}" should be "—"$`, 'm'));
});

test('a genuine non-ASCII character in front of mangled text does not hide it', (t) => {
  const dir = tree(t);
  // `§` is correctly encoded, sits directly against the damage, and is itself a
  // valid UTF-8 continuation byte in windows-1252 - so the run that starts at it
  // decodes to nothing and the scan has to try the next position.
  track(dir, 'AGENTS.md', `§${doubleEncode('—')}\n`);

  const { status, output } = runGate(dir);

  assert.equal(status, 1, output);
  assert.match(output, /AGENTS\.md:1:2: double-encoded/);
  assert.match(output, /should be "—"/);
});

test('the whole of a mangled file is reported, capped, with the remainder counted', (t) => {
  const dir = tree(t);
  const bad = doubleEncode('— a dash');
  track(dir, 'AGENTS.md', `${`${bad}\n`.repeat(9)}`);

  const { status, output } = runGate(dir);

  assert.equal(status, 1, output);
  assert.equal(output.match(/AGENTS\.md:\d+:\d+: double-encoded/g).length, 5);
  assert.match(output, /and 4 more line\(s\) like it/);
});

test('a UTF-8 BOM fails - bash reads it as part of the shebang', (t) => {
  const dir = tree(t);
  track(dir, 'hook.sh', '﻿#!/usr/bin/env bash\necho hi\n');

  const { status, output } = runGate(dir);

  assert.equal(status, 1, output);
  assert.match(output, /hook\.sh:1: UTF-8 BOM/);
});

test('a file that is not UTF-8 at all fails as itself, not as double-encoding', (t) => {
  const dir = tree(t);
  // A lone 0xFC - cp1252's "ü", and never a valid UTF-8 sequence.
  track(dir, 'notes.txt', Buffer.from([0x66, 0x75, 0xfc, 0x72, 0x0a]));

  const { status, output } = runGate(dir);

  assert.equal(status, 1, output);
  assert.match(output, /notes\.txt: not valid UTF-8/);
  assert.doesNotMatch(output, /double-encoded/);
});

test('a binary file is skipped, however its bytes would read as text', (t) => {
  const dir = tree(t);
  const mangled = Buffer.from(doubleEncode('—'), 'utf8');
  track(dir, 'logo.png', Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00]), mangled]));

  const { status, output } = runGate(dir);

  assert.equal(status, 0, output);
});

test('an untracked file is not scanned - which is why the .bak backups cannot fail CI', (t) => {
  const dir = tree(t);
  track(dir, 'AGENTS.md', '# fine\n');
  write(dir, 'AGENTS.md.bak', `${doubleEncode('rules — binding')}\n`);

  const { status, output } = runGate(dir);

  assert.equal(status, 0, output);
});

test('the exempt telemetry log is skipped, and the exemption is by exact path', (t) => {
  const dir = tree(t);
  const mangled = `{"note":"${doubleEncode('AGENTS.md — doppelt kodiert')}"}\n`;
  track(dir, '.beads/interactions.jsonl', mangled);
  const exempt = runGate(dir);
  assert.equal(exempt.status, 0, exempt.output);

  // Same content one directory over is not exempt, so the entry cannot quietly
  // grow into "anything under .beads/" - the hooks live there too, and one of
  // them was a real finding.
  track(dir, '.beads/hooks/pre-commit', mangled);

  const { status, output } = runGate(dir);

  assert.equal(status, 1, output);
  assert.match(output, /\.beads\/hooks\/pre-commit/);
  assert.doesNotMatch(output, /interactions\.jsonl/);
});
