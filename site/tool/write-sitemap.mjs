/**
 * Writes `sitemap.xml` and `robots.txt` into the built site.
 *
 * The Astro site got its sitemap from `@astrojs/sitemap`, and a framework
 * change is exactly where that disappears without anybody noticing: the pages
 * still work, they are simply no longer announced (enigma2_player-9v1).
 *
 * The URL list is the build's OUTPUT, not the route table: every directory in
 * `dist` that holds an `index.html`. Deriving it from `app.routes.ts` would
 * need the TypeScript toolchain in a plain Node script, and worse, it would be
 * a second opinion about what exists - this way the sitemap cannot list a page
 * the build did not emit, which is the one error a sitemap must not contain.
 * No pages found means the build did not run, and the script exits non-zero
 * rather than writing an empty one.
 *
 * `hreflang` alternates are included per URL: five language trees of the same
 * content look like five competing pages to a crawler otherwise, and the one
 * it picks is not the one a reader wanted.
 *
 * Usage: npm run build (runs it) or node tool/write-sitemap.mjs
 */
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist/site/enigma2_player';
const ORIGIN = 'https://madoe21.github.io';
const BASE = '/enigma2_player';

/**
 * Every prerendered page, found in the output rather than derived twice.
 *
 * The build has already decided what exists; walking its output means the
 * sitemap cannot list a page that was not emitted, which is the one error a
 * sitemap must not contain.
 */
async function prerenderedPaths(dir = DIST, prefix = '') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      out.push(...(await prerenderedPaths(join(dir, entry.name), `${prefix}${entry.name}/`)));
    } else if (entry.name === 'index.html') {
      out.push(prefix);
    }
  }
  return out;
}

/** The language a path belongs to, and the page key within that language. */
function split(path) {
  const segments = path.split('/').filter(Boolean);
  const langs = ['en', 'es', 'fr', 'it'];
  if (segments.length > 0 && langs.includes(segments[0])) {
    return { lang: segments[0], key: segments.slice(1).join('/') };
  }
  return { lang: 'de', key: segments.join('/') };
}

const paths = (await prerenderedPaths()).sort();
if (paths.length === 0) {
  console.error('no prerendered pages found - build first');
  process.exit(1);
}

/**
 * The same page in the other languages, by its slug.
 *
 * Built from what exists: the legal pages are published in German and English
 * only, so their entries list two alternates and not five. A sitemap that
 * promises `hreflang="it"` for a page with no Italian version is worse than
 * one that stays quiet about it.
 */
const byKey = new Map();
for (const path of paths) {
  const { lang, key } = split(path);
  // Legal slugs differ per language (impressum / imprint), so they group by
  // neither path nor slug. They are matched by position in the known pairs.
  const group = byKey.get(key) ?? new Map();
  group.set(lang, path);
  byKey.set(key, group);
}

/** Pages whose slug is translated, grouped by hand from the route table. */
const TRANSLATED_GROUPS = [
  ['impressum/', 'en/imprint/'],
  ['datenschutz/', 'en/privacy/'],
];
for (const group of TRANSLATED_GROUPS) {
  const members = new Map();
  for (const path of group) {
    if (paths.includes(path)) {
      members.set(split(path).lang, path);
    }
  }
  for (const path of group) {
    byKey.set(split(path).key, members);
  }
}

function url(path) {
  return `${ORIGIN}${BASE}/${path}`;
}

const today = new Date().toISOString().slice(0, 10);
const entries = paths
  .map((path) => {
    const { key } = split(path);
    const group = byKey.get(key) ?? new Map();
    const alternates = [...group.entries()]
      .map(
        ([lang, target]) =>
          `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url(target)}"/>`,
      )
      .join('\n');
    // The start page is what a crawler should prefer; everything else is
    // equal. 0.5 for the legal texts: they have to be findable, not promoted.
    const priority =
      path === ''
        ? '1.0'
        : /impressum|datenschutz|cookies|imprint|privacy/.test(path)
          ? '0.5'
          : '0.8';
    return [
      '  <url>',
      `    <loc>${url(path)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <priority>${priority}</priority>`,
      alternates,
      '  </url>',
    ]
      .filter((line) => line.length > 0)
      .join('\n');
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;

await writeFile(join(DIST, 'sitemap.xml'), sitemap, 'utf8');

/**
 * robots.txt, pointing at the sitemap that now exists.
 *
 * The committed one pointed at `sitemap-index.xml`, which was Astro's name for
 * it. After the migration that file is not written, so the line named a 404 -
 * a crawler follows it, finds nothing, and the sitemap is simply unused.
 */
const robots = `User-agent: *
Allow: /

Sitemap: ${ORIGIN}${BASE}/sitemap.xml
`;
await writeFile(join(DIST, 'robots.txt'), robots, 'utf8');

console.log(`wrote sitemap.xml with ${paths.length} url(s) and robots.txt`);
