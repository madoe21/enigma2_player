/**
 * The decision branches of `check-placeholders.mjs` (`enigma2_player-rie`).
 *
 * This gate is deliberately quiet today: every ⟨…⟩ placeholder is unresolved on
 * purpose because the company does not exist yet, so it reports and exits 0,
 * and it only fails once `entity.ts` declares `ENTITY_STATUS = 'FILLED'`. That
 * design makes it the one gate here whose green run says the least - "exits 0"
 * is both its normal state and what a completely broken version would do. The
 * branch that matters is the one no run on this tree reaches: FILLED while
 * placeholders remain, which is a published legal text naming nobody.
 *
 * `PLACEHOLDERS_UNFILLED` in the summary also drives the demo warning on the
 * site, so the wording is asserted, not just the exit code.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { dropTree, makeTree, readFromRoot, runGate, write } from './gate-fixture.mjs';

const GATE = 'check-placeholders.mjs';

function tree(t) {
  const made = makeTree();
  t.after(() => dropTree(made));
  return made;
}

/** `entity.ts` with the identity data declared complete, or not. */
function entity(filled, body = '') {
  return `export const ENTITY_STATUS = '${filled ? 'FILLED' : 'PLACEHOLDERS_UNFILLED'}';\n${body}`;
}

test('a placeholder is reported but does not fail while the identity data is unfilled', (t) => {
  const fixture = tree(t);
  write(
    fixture,
    'src/app/legal/entity.ts',
    entity(false, "export const name = '⟨COMPANY_NAME⟩';\n"),
  );

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
  assert.match(output, /src\/app\/legal\/entity\.ts:2/);
  assert.match(output, /⟨COMPANY_NAME⟩/u);
  assert.match(output, /entity status: PLACEHOLDERS_UNFILLED/);
});

test('FILLED with a placeholder left over fails - the legal text would name nobody', (t) => {
  const fixture = tree(t);
  write(
    fixture,
    'src/app/legal/entity.ts',
    entity(true, "export const name = '⟨COMPANY_NAME⟩';\n"),
  );

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 1, output);
  assert.match(output, /entity status: FILLED/);
  assert.match(output, /names nobody/);
});

test('FILLED with nothing left over is green', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/legal/entity.ts', entity(true, "export const name = 'Madoe21 GmbH';\n"));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
  assert.match(output, /0 occurrence\(s\) of 0 distinct placeholder\(s\)/);
  assert.match(output, /entity status: FILLED/);
});

test('a line that explains the convention is not a finding', (t) => {
  const fixture = tree(t);
  // entity.ts documents the form in its own header; without this branch the gate
  // reports the sentence that describes the gate.
  write(
    fixture,
    'src/app/legal/entity.ts',
    `/** Missing values use the ⟨UPPER_SNAKE⟩ form. */\n// also ⟨LIKE_THIS⟩\n${entity(true)}`,
  );

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
  assert.match(output, /0 occurrence\(s\)/);
});

test('angle brackets that are not UPPER_SNAKE are prose, not a placeholder', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/legal/entity.ts', entity(true));
  // The sentence in legal-copy.ts telling readers the gaps stand in ⟨angle
  // brackets⟩ needs no exception, and must not get one by accident.
  write(
    fixture,
    'src/app/legal/legal-copy.ts',
    "export const note = 'Lücken stehen in ⟨spitzen Klammern⟩.';\n",
  );

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
  assert.match(output, /0 occurrence\(s\)/);
});

test('a placeholder outside entity.ts is found too - a template is where it must not survive', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/legal/entity.ts', entity(true));
  write(fixture, 'src/app/legal/imprint.html', '<p>⟨COMPANY_ADDRESS⟩</p>\n');

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 1, output);
  assert.match(output, /imprint\.html:1/);
  assert.match(output, /⟨COMPANY_ADDRESS⟩/u);
});

test('the demo flag is reported as visible when it is on', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/legal/entity.ts', entity(false));
  write(fixture, 'src/app/content/site-flags.ts', 'export const DEMO_MODE = true;\n');

  const { output } = runGate(fixture, GATE);

  assert.match(output, /demo notice: visible/);
});

test('the demo flag is reported as off when it is off', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/legal/entity.ts', entity(false));
  write(fixture, 'src/app/content/site-flags.ts', 'export const DEMO_MODE = false;\n');

  const { output } = runGate(fixture, GATE);

  assert.match(output, /demo notice: off/);
});

test('--write rewrites TODO.md one level above the site, with every place listed', (t) => {
  const fixture = tree(t);
  write(
    fixture,
    'src/app/legal/entity.ts',
    entity(false, "export const name = '⟨COMPANY_NAME⟩';\n"),
  );
  write(fixture, 'src/app/legal/imprint.html', '<p>⟨COMPANY_NAME⟩</p>\n<p>⟨COMPANY_CITY⟩</p>\n');

  const { status, output } = runGate(fixture, GATE, ['--write']);

  assert.equal(status, 0, output);
  assert.match(output, /wrote \.\.\/TODO\.md: 2 placeholder\(s\), demo off/);

  const todo = readFromRoot(fixture, 'TODO.md');
  assert.match(todo, /Nicht von Hand pflegen/);
  // Both occurrences of the same placeholder, in one row - that list is what a
  // human works through at go-live, so a missing place means a missed edit.
  assert.match(todo, /`⟨COMPANY_NAME⟩`.*entity\.ts:2.*imprint\.html:1/u);
  assert.match(todo, /`⟨COMPANY_CITY⟩`.*imprint\.html:2/u);
  assert.match(todo, /2 Platzhalter unten ausfüllen/u);
});

test('without --write nothing is written', (t) => {
  const fixture = tree(t);
  write(
    fixture,
    'src/app/legal/entity.ts',
    entity(false, "export const name = '⟨COMPANY_NAME⟩';\n"),
  );

  const { status } = runGate(fixture, GATE);

  assert.equal(status, 0);
  assert.throws(() => readFromRoot(fixture, 'TODO.md'), /ENOENT/);
});
