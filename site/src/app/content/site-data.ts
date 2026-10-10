import data from './site-data.json';

/** One downloadable file of the latest release. */
export interface DownloadRow {
  readonly platform: string;
  readonly label: string;
  readonly file: string;
  readonly url: string;
  readonly size: number | null;
}

/** The latest public release of the product repository. */
export interface ReleaseData {
  readonly version: string | null;
  readonly publishedAt: string | null;
  readonly url: string | null;
  readonly downloads: readonly DownloadRow[];
}

/** One release, for the changelog page. */
export interface ReleaseNote {
  readonly tag: string;
  readonly name: string;
  readonly publishedAt: string | null;
  readonly url: string;
  readonly prerelease: boolean;
  readonly body: string;
}

/** One purchasable licence model. */
export interface PriceModel {
  readonly id: string;
  readonly name: string;
  readonly devices: number;
  readonly period: 'monthly' | 'yearly' | 'lifetime' | string;
  readonly price: number;
  readonly currency: string;
}

/** Everything the build baked in. */
export interface SiteData {
  readonly fetchedAt?: string;
  readonly repo?: string;
  readonly release: ReleaseData | null;
  readonly changelog: readonly ReleaseNote[] | null;
  readonly pricing: {
    readonly models: readonly PriceModel[];
    readonly reason: string | null;
  } | null;
}

/**
 * The data the build fetched, as a plain import.
 *
 * An import rather than an `HttpClient` call, and that is the whole point: the
 * Astro site fetched this from the visitor's browser, which sent their IP to
 * GitHub and to the licence server before they had agreed to anything. Baked
 * in, the pages work without JavaScript and without a network, and the cookie
 * policy's "nothing from anyone else's server" stays true (PO, 2026-10-09).
 *
 * Refreshed by `npm run data:refresh`; see `tool/fetch-site-data.mjs` for what
 * that costs in freshness.
 */
export const SITE_DATA = data as SiteData;

/** The release to offer, or null when there is none to offer. */
export function latestRelease(): ReleaseData | null {
  const release = SITE_DATA.release;
  return release && release.downloads.length > 0 ? release : null;
}

/** The release notes, newest first, or an empty list. */
export function releaseNotes(): readonly ReleaseNote[] {
  return SITE_DATA.changelog ?? [];
}

/** The price models, or an empty list when the shop has none configured. */
export function priceModels(): readonly PriceModel[] {
  return SITE_DATA.pricing?.models ?? [];
}
