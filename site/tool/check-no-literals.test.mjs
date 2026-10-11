/**
 * The decision branches of `check-no-literals.mjs` (`enigma2_player-rie`).
 *
 * This gate carries the acceptance criterion of `enigma2_player-n5j`: no
 * component holds translatable text as a literal, because a component with a
 * German sentence in it has to be copied to say the same thing in English, and
 * the copy is what drifts. A green run on this tree proves the tree is clean;
 * it does not prove the gate would object to anything. Each case below hands it
 * one literal in one position and demands it object - and the cases that hand
 * it an interpolation or a glyph demand it stay quiet, because a gate that
 * flags the lightbox arrows gets switched off.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { dropTree, makeTree, runGate, write } from './gate-fixture.mjs';

const GATE = 'check-no-literals.mjs';

function tree(t) {
  const made = makeTree();
  t.after(() => dropTree(made));
  return made;
}

/**
 * A component whose inline template is the given markup.
 *
 * The closing backtick is followed by `,` and a newline on purpose: that is
 * what the gate's `templateOf` regex anchors on, so a fixture written any other
 * way would be skipped as "no template" and pass without testing anything.
 */
function component(markup) {
  return `import { Component } from '@angular/core';\n\n@Component({\n  template: \`\n${markup}\n  \`,\n})\nexport class Thing {}\n`;
}

test('a sentence between tags is a finding', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/thing.ts', component('    <p>Jetzt kaufen</p>'));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 1, output);
  assert.match(output, /src\/app\/thing\.ts: text "Jetzt kaufen"/);
  assert.match(output, /1 literal\(s\) a reader would see/);
});

// One case per attribute the gate claims to read. They are a single regex with
// four alternatives, so a typo in one alternative is invisible in the other three.
for (const attribute of ['title', 'aria-label', 'alt', 'placeholder']) {
  test(`a sentence in ${attribute}= is a finding`, (t) => {
    const fixture = tree(t);
    write(
      fixture,
      'src/app/thing.ts',
      component(`    <img src="a.png" ${attribute}="Ein Bild" />`),
    );

    const { status, output } = runGate(fixture, GATE);

    assert.equal(status, 1, output);
    assert.match(output, new RegExp(`${attribute} "Ein Bild"`));
  });
}

test('an interpolated attribute is not a finding - the text comes from ui.ts', (t) => {
  const fixture = tree(t);
  write(
    fixture,
    'src/app/thing.ts',
    component('    <img src="a.png" alt="{{ t(\'gallery.shot\') }}" />'),
  );

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
  assert.match(output, /no translatable literals/);
});

test('interpolated text between tags is not a finding', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/thing.ts', component("    <p>{{ t('nav.buy') }}</p>"));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
});

test('a glyph is not language - the lightbox arrows stay', (t) => {
  const fixture = tree(t);
  write(
    fixture,
    'src/app/thing.ts',
    component('    <button aria-label="{{ t(\'gallery.next\') }}">›</button>'),
  );

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
});

test('a separate .html template is scanned as a whole', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/thing.html', '<p>Jetzt kaufen</p>\n');

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 1, output);
  assert.match(output, /src\/app\/thing\.html: text "Jetzt kaufen"/);
});

test('a .ts file with no template is skipped, not an error', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/service.ts', "export const label = 'Jetzt kaufen';\n");

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
  assert.match(output, /no translatable literals/);
});

test('a .spec.ts file is not scanned - test fixtures are allowed to hold text', (t) => {
  const fixture = tree(t);
  write(fixture, 'src/app/thing.spec.ts', component('    <p>Jetzt kaufen</p>'));

  const { status, output } = runGate(fixture, GATE);

  assert.equal(status, 0, output);
});
