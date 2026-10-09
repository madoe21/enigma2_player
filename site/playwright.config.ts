import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the BUILT site, not against `ng serve`.
 *
 * The thing worth testing here is the prerendered output: this site has no
 * backend, so what a visitor and a crawler get is the files in `dist`. A test
 * against the dev server would prove that Angular can render the page, which
 * is what the unit tests already say - it would not prove that the file on
 * disk carries the right `<html lang>`, and that is exactly the defect the old
 * site shipped (enigma2_player_source-w83).
 *
 * `baseHref` is `/enigma2_player/`, so the static server is pointed at the
 * parent of that folder and the tests use the full path. Serving the output
 * directly at `/` would pass while the deployed site breaks.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  // Two, measured rather than guessed. The default on a 16-core machine is
  // half the cores, and at that width this suite collapses: 8 workers produced
  // `net::ERR_ABORTED` on most navigations, 4 workers took 34 s with two
  // failures, 2 workers take 4 s and 1 worker 5.5 s. The static server is not
  // the limit - it answers 120 parallel requests in 383 ms with no failures -
  // so what runs out is the room for that many Chromium instances. A suite of
  // fast tests against files on disk gains nothing from more width anyway.
  workers: 2,
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4321/enigma2_player/',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Node's own http, via e2e/static-server.mjs: it listens immediately and
    // depends on nothing that has to be fetched first. `npx --yes http-server`
    // was tried and timed out while resolving the package, which made the
    // suite pass or fail depending on whether a server from an earlier run was
    // still listening - evidence that proves nothing.
    command: 'node e2e/static-server.mjs dist/site 4321',
    url: 'http://127.0.0.1:4321/enigma2_player/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
