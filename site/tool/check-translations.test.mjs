/**
 * The decision branches of `check-translations.mjs` (`enigma2_player-rie`).
 *
 * Why these and not a smoke test: `enigma2_player-7qz` changed this gate's
 * `isRead` logic and the proof offered was "the run is green and no longer
 * reports the three keys". That shows one path. Which language counts as
 * maintained, what an extra key does, whether a genuinely unread key is still
 * caught - none of those appear on a tree where everything is in order, and
 * those are the branches that decide whether the gate ever fails at all.
 *
 * Each case asserts the EXIT CODE as well as the text. A gate that prints every
 * defect and exits 0 is the failure this repository has shipped four times over
 * in its hooks, and it reads exactly like a gate that passed.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { dropTree, makeTree, runGate, uiSource, write } from './gate-fixture.mjs';

const GATE = 'check-translations.mjs';

/** A fixture removed when the case ends, however it ends. */
function tree(t) {
  const made = makeTree();
  t.after(() => dropTree(made));
  return made;
}

/** A source file that reads the given keys the way the codebase does: `t('x')`. */
function reads(...keys) {
  return `${keys.map((key) => `t('${key}');`).join('\n')}\n`;
}

test('a tree where every language agrees and every key is read is green', (t) => {
  const fixture = tree(t);
  const keys = ['nav.buy', 'footer.note'];
  write(
    fixture,
    'src/app/content/ui.ts',
    uiSource({ de: keys, en: keys, es: keys, fr: keys, it: keys }),
  );
  write(fixture, 'src/app/page.ts', reads(...keys));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
  assert.match(output, /2 keys in de/);
  assert.match(output, /2 key\(s\) read by the code/);
});

test('a key missing from English fails the gate, because en is maintained here', (t) => {
  const fixture = tree(t);
  write(
    fixture,
    'src/app/content/ui.ts',
    uiSource({ de: ['nav.buy', 'footer.note'], en: ['nav.buy'] }),
  );
  write(fixture, 'src/app/page.ts', reads('nav.buy', 'footer.note'));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 1, output);
  assert.match(output, /en: 1 MISSING/);
  assert.match(output, /footer\.note/);
  assert.match(output, /1 key\(s\) missing from en/);
});

test('a key missing from Spanish is reported but does not fail - es is machine-translated', (t) => {
  const fixture = tree(t);
  write(
    fixture,
    'src/app/content/ui.ts',
    uiSource({ de: ['nav.buy', 'footer.note'], en: ['nav.buy', 'footer.note'], es: ['nav.buy'] }),
  );
  write(fixture, 'src/app/page.ts', reads('nav.buy', 'footer.note'));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
  assert.match(output, /es: 1 missing \(falls back to de\)/);
  // The distinction is the whole point: the same shortfall in en is MISSING.
  assert.doesNotMatch(output, /MISSING/);
});

test('a key a language has and de does not fails the gate - a typo or a leftover', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/content/ui.ts', uiSource({ de: ['nav.buy'], en: ['nav.buy', 'nav.by'] }));
  write(fixture, 'src/app/page.ts', reads('nav.buy', 'nav.by'));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 1, output);
  assert.match(output, /en: 1 key\(s\) not in de/);
  assert.match(output, /nav\.by/);
});

test('a key no source file reads fails the gate', (t) => {
  const fixture = tree(t);
  const keys = ['nav.buy', 'nav.forgotten'];
  write(fixture, 'src/app/content/ui.ts', uiSource({ de: keys, en: keys }));
  write(fixture, 'src/app/page.ts', reads('nav.buy'));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 1, output);
  assert.match(output, /1 key\(s\) no source file reads/);
  assert.match(output, /nav\.forgotten/);
});

test('a key assembled from a literal prefix counts as read, for the whole prefix', (t) => {
  const fixture = tree(t);
  const keys = ['legal.imprint', 'legal.privacy', 'nav.buy'];
  write(fixture, 'src/app/content/ui.ts', uiSource({ de: keys, en: keys }));
  // The real shape, from legal-links.ts: which legal.* key is decided at runtime.
  write(fixture, 'src/app/legal-links.ts', 'const label = of(`legal.${id}`);\n' + reads('nav.buy'));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
  assert.doesNotMatch(output, /no source file reads/);
  assert.match(output, /plus legal\.\*/);
});

test('a key assembled from a trailing literal is NOT resolved, and says so by failing', (t) => {
  const fixture = tree(t);
  const keys = ['heading.title', 'nav.buy'];
  write(fixture, 'src/app/content/ui.ts', uiSource({ de: keys, en: keys }));
  // `${group}.title` has no literal prefix to scan for. The gate's own comment
  // states this cost and says to teach the scanner rather than delete the key -
  // so the behaviour is pinned here, and this case turns red the day somebody
  // teaches it, which is the moment to delete this test and keep the lesson.
  write(fixture, 'src/app/sections.ts', 'const label = of(`${group}.title`);\n' + reads('nav.buy'));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 1, output);
  assert.match(output, /heading\.title/);
  assert.match(output, /1 key\(s\) nobody reads/);
});
