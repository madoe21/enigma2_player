/**
 * Fetches the data the site shows, at BUILD time, into `src/app/content/site-data.json`.
 *
 * The Astro site fetched three things from the visitor's browser: the price
 * list from the licence server, and the latest release plus the release notes
 * from `api.github.com`. Every one of those sent the visitor's IP address to a
 * third party before they had agreed to anything - and the cookie policy this
 * site now publishes says, correctly, that it loads nothing from anyone else's
 * server. Two ways out of that contradiction: disclose and gate the fetches,
 * or stop making them. The PO chose the second on 2026-10-09.
 *
 * So the data is baked in. Consequences, both of them:
 *  - the pages work with JavaScript switched off, and a visitor who declines
 *    the cookie still sees the prices, the downloads and the changelog;
 *  - the data is as fresh as the last build. For downloads and the changelog
 *    that is exactly right, because a new release *is* a rebuild. A price
 *    change needs a rebuild, which is a workflow run and not a deploy.
 *
 * The result is committed. A build must not need the network - a release that
 * fails because GitHub is slow is a release that fails for no reason - and the
 * committed file is also the record of what a given build showed.
 *
 * Usage:
 *   npm run data:refresh          # fetch and rewrite site-data.json
 *   npm run data:refresh -- --dry # show what would change, write nothing
 *
 * Environment (optional; without them the pricing block stays empty and the
 * pages fall back to their "not available" strings):
 *   LICENSE_API_BASE   e.g. https://license-server-5d7i.onrender.com
 *   APP_API_KEY        the application's PUBLIC api key
 *   GITHUB_TOKEN       only to lift the anonymous rate limit
 */
import { readFile, writeFile } from 'node:fs/promises';

const OUT = 'src/app/content/site-data.json';
const REPO = 'madoe21/enigma2_player';

/**
 * Which release asset belongs to which platform.
 *
 * Desktop only: Android and iOS go through the stores, so the public releases
 * carry no APK or IPA (PO, 2026-07-07). Kept in the same order the Astro site
 * used, because that order is what the page showed.
 */
const PLATFORMS = [
  { id: 'windows', label: 'Windows', match: /\.(exe|msi)$/i },
  { id: 'macos', label: 'macOS', match: /\.(dmg|pkg)$/i },
  { id: 'linux', label: 'Linux', match: /\.(AppImage|deb|rpm|tar\.gz)$/i },
];

async function github(path) {
  const headers = { accept: 'application/vnd.github+json' };
  if (process.env['GITHUB_TOKEN']) {
    headers.authorization = `Bearer ${process.env['GITHUB_TOKEN']}`;
  }
  const response = await fetch(`https://api.github.com/repos/${REPO}${path}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub ${path}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/** The latest release, mapped to per-platform download rows. */
async function latestRelease() {
  const release = await github('/releases/latest');
  const downloads = PLATFORMS.map((platform) => {
    const asset = (release.assets ?? []).find((candidate) => platform.match.test(candidate.name));
    return asset
      ? {
          platform: platform.id,
          label: platform.label,
          file: asset.name,
          url: asset.browser_download_url,
          size: asset.size ?? null,
        }
      : null;
  }).filter((row) => row !== null);

  return {
    version: release.tag_name ?? null,
    publishedAt: release.published_at ?? null,
    url: release.html_url ?? null,
    downloads,
  };
}

/**
 * The releases for the changelog.
 *
 * The body is kept as plain text and rendered as text, exactly as the Astro
 * version did: no markdown parser means no HTML injection path, and a release
 * note is written by us but travels through an API.
 */
async function releaseNotes() {
  const releases = await github('/releases?per_page=20');
  return releases
    .filter((release) => !release.draft)
    .map((release) => ({
      tag: release.tag_name,
      name: release.name ?? release.tag_name,
      publishedAt: release.published_at ?? null,
      url: release.html_url,
      prerelease: Boolean(release.prerelease),
      // HTML comments out. Older published notes carry the release template's
      // own instruction to the maintainer ("Do NOT write release notes by
      // hand..."), which is addressed to us and not to a reader. The player
      // repo stopped emitting it in 192fd38; the releases published before
      // that still have it, and this page shows the released text.
      body: (release.body ?? '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim(),
    }));
}

/** The public price list, by the application's public api key. */
async function pricing() {
  const base = process.env['LICENSE_API_BASE'];
  const key = process.env['APP_API_KEY'];
  if (!base || !key) {
    return { models: [], reason: 'LICENSE_API_BASE or APP_API_KEY not set' };
  }
  const response = await fetch(`${base.replace(/\/+$/, '')}/api/v1/pricing/${key}`);
  if (!response.ok) {
    return { models: [], reason: `pricing endpoint: ${response.status}` };
  }
  const data = await response.json();
  const models = (data.models ?? []).map((model) => ({
    id: model.id,
    name: model.display_name,
    devices: model.device_count,
    period: model.period,
    price: Number(model.price),
    currency: model.currency,
  }));
  return { models, reason: null };
}

/** Each part independently, so one failure does not blank the other two. */
async function attempt(name, task, previous) {
  try {
    return await task();
  } catch (error) {
    console.warn(`! ${name}: ${error.message}`);
    if (previous !== undefined) {
      console.warn(`  keeping the committed ${name} data`);
      return previous;
    }
    return null;
  }
}

const existing = await readFile(OUT, 'utf8')
  .then((raw) => JSON.parse(raw))
  .catch(() => ({}));

const data = {
  /** So a reader of the committed file knows how old it is. */
  fetchedAt: new Date().toISOString(),
  repo: REPO,
  /**
   * Where the shop is framed from. Not a secret: the base URL is public and
   * the api key is the application's PUBLIC key, which ships inside every
   * build of the app anyway. Carried here because a static site has no
   * environment at runtime - a browser is the runtime.
   */
  shop: {
    base: process.env['LICENSE_API_BASE'] ?? existing.shop?.base ?? null,
    apiKey: process.env['APP_API_KEY'] ?? existing.shop?.apiKey ?? null,
  },
  release: await attempt('release', latestRelease, existing.release),
  changelog: await attempt('changelog', releaseNotes, existing.changelog),
  pricing: await attempt('pricing', pricing, existing.pricing),
};

const serialised = `${JSON.stringify(data, null, 2)}\n`;

if (process.argv.includes('--dry')) {
  console.log(serialised);
} else {
  await writeFile(OUT, serialised, 'utf8');
  console.log(
    `wrote ${OUT}: version ${data.release?.version ?? 'none'}, ` +
      `${data.release?.downloads.length ?? 0} download(s), ` +
      `${data.changelog?.length ?? 0} release note(s), ` +
      `${data.pricing?.models.length ?? 0} price model(s)`,
  );
}
