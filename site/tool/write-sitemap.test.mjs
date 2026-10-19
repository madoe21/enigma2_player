/**
 * What `write-sitemap.mjs` announces - and what it keeps out.
 *
 * The sitemap is the one file on this site whose errors are invisible locally:
 * a page missing from it is simply not crawled, and a page listed wrongly
 * sends a crawler to a URL the page itself disowns. Since the pricing merge
 * (enigma2_player-eer) the build emits two alias files per language that must
 * NOT be announced, and the filter that keeps them out reads the rendered
 * `robots` meta tag - a string match against generated HTML, which is exactly
 * the kind of check that rots quietly when the renderer changes its attribute
 * order.
 *
 * Driven through the real script against a fixture `dist/`, like the other
 * gates in this directory (`gate-fixture.mjs` explains why).
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { dropTree, makeTree, readFromRoot, runGate, write } from './gate-fixture.mjs';

const GATE = 'write-sitemap.mjs';
const DIST = 'dist/site/enigma2_player';

function tree(t) {
  const made = makeTree();
  t.after(() => dropTree(made));
  return made;
}

/** A prerendered page, indexable unless told otherwise. */
function page(fixture, path, { index = true } = {}) {
  const robots = index ? 'index, follow' : 'noindex, follow';
  write(
    fixture,
    `${DIST}/${path}index.html`,
    `<!doctype html><html lang="de"><head><meta name="robots" content="${robots}">` +
      `<title>page</title></head><body></body></html>`,
  );
}

/** A file the script wrote into the fixture's `dist/`. */
function fileOf(fixture, name) {
  return readFromRoot(fixture, `site/${DIST}/${name}`);
}

test('every prerendered page is listed, with its translations', (t) => {
  const fixture = tree(t);
  page(fixture, '');
  page(fixture, 'faq/');
  page(fixture, 'en/faq/');

  const result = runGate(fixture, GATE);

  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /3 url\(s\)/);
  const xml = fileOf(fixture, 'sitemap.xml');
  assert.match(xml, /<loc>https:\/\/madoe21\.github\.io\/enigma2_player\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/madoe21\.github\.io\/enigma2_player\/faq\/<\/loc>/);
  // The same page in two languages has to point at the other one, or a
  // crawler reads two competing pages instead of one in two languages.
  assert.match(xml, /hreflang="de" href="[^"]*\/faq\/"/);
  assert.match(xml, /hreflang="en" href="[^"]*\/en\/faq\/"/);
});

test('a page that says noindex is not announced', (t) => {
  const fixture = tree(t);
  page(fixture, '');
  page(fixture, 'pricing/');
  page(fixture, 'buy/', { index: false });
  page(fixture, 'license/', { index: false });

  const result = runGate(fixture, GATE);

  assert.equal(result.status, 0, result.output);
  const xml = fileOf(fixture, 'sitemap.xml');
  // The alias files exist and are served; the sitemap names the merged page.
  assert.match(xml, /\/pricing\/<\/loc>/);
  assert.doesNotMatch(xml, /\/buy\/<\/loc>/);
  assert.doesNotMatch(xml, /\/license\/<\/loc>/);
  assert.match(result.output, /2 url\(s\)/);
});

test('the robots meta is recognised with its attributes in either order', (t) => {
  const fixture = tree(t);
  page(fixture, '');
  write(
    fixture,
    `${DIST}/buy/index.html`,
    '<!doctype html><html><head><meta content="noindex, follow" name="robots"></head></html>',
  );

  const result = runGate(fixture, GATE);

  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(fileOf(fixture, 'sitemap.xml'), /\/buy\/<\/loc>/);
});

test('an unbuilt site fails instead of writing an empty sitemap', (t) => {
  const fixture = tree(t);
  write(fixture, `${DIST}/.keep`, '');

  const result = runGate(fixture, GATE);

  // A sitemap with no URLs in it is accepted by every validator and tells a
  // crawler the site has no pages, so this has to be an error.
  assert.equal(result.status, 1);
  assert.match(result.output, /build first/);
});

test('robots.txt points at the sitemap this script writes', (t) => {
  const fixture = tree(t);
  page(fixture, '');

  runGate(fixture, GATE);

  const robots = fileOf(fixture, 'robots.txt');
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/madoe21\.github\.io\/enigma2_player\/sitemap\.xml/);
  // Astro's name for it, which the committed file used to carry: following it
  // lands a crawler in a 404.
  assert.doesNotMatch(robots, /sitemap-index\.xml/);
});
