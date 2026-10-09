import data from './site-data.json';

/**
 * Where the licence server's shop lives, as the build knew it.
 *
 * Read from the generated `site-data.json` rather than from `process.env` at
 * runtime: this is a static site, so "runtime" is a browser, and a browser has
 * no environment. The values are not secrets - the base URL is public and the
 * api key is the application's PUBLIC key, which is in every shipped build of
 * the app anyway (`docs/architecture/anti-tamper-concept.md` in the player
 * repo says so plainly).
 *
 * Absent when the build had neither: the shop page then says it is not
 * available instead of framing an empty box.
 */
export const SHOP_CONFIG: { readonly base: string | null; readonly apiKey: string | null } = {
  base: (data as { shop?: { base?: string } }).shop?.base ?? null,
  apiKey: (data as { shop?: { apiKey?: string } }).shop?.apiKey ?? null,
};
