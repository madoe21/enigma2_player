# 2. Product site on Angular 22 (prerendered); Astro retired

Date: 2026-10-10

## Status

Accepted. Supersedes [ADR 0001](0001-static-site-astro.md).

## Context

ADR 0001 chose Astro for the product page, and it delivered what it promised: a
static, island-interactive, i18n-routed site on GitHub Pages. What changed is
not a shortcoming of Astro but a requirement outside it. On 2026-10-09 the PO
decided (epic `enigma2_player-hsf`) that **both** web projects in this product —
the product site and the license server's UI — run on the same framework,
**Angular 22**, and that this site must additionally be operable with NVDA,
carry an imprint and a privacy text, show a demo notice, and gate the shop
behind a cookie consent dialog.

One framework across both projects is the actual driver: two stacks means every
component, every a11y fix and every legal text is built twice and drifts twice.
The migration ran as the children of `hsf` (workspace, content, a11y, consent,
SEO), with both trees in the repository side by side so each page could be
compared against its predecessor before the old one was removed.

That overlap had a measurable cost, which is what ended it: every style,
security and formatting task had to be done twice. `enigma2_player-bxw` and
`-63s` were one finding in two trees, `-yrq` was a security finding in the Astro
tree alone, and `-63s` had to ship two `.prettierignore` files and two pinned
Prettier versions because Prettier reads one config per invocation directory.

## Decision

**Angular 22, prerendered (SSG), as the only site in this repository.**

- **Prerender, not SSR.** A product site lives on search engines and must stay
  hostable without a Node process; prerendered output is as static as what Astro
  produced, so GitHub Pages remains the deployment target unchanged. The license
  server gets SSR because it serves an API — a separate decision in its own repo.
- **Angular 22 is current** (22.2.2 on npm at the time of writing), so this is
  not a bet on a pre-release (AGENTS.md §3a, production readiness).
- **The site stays in `site/`; the repository root holds only repo-level
  tooling.** The alternative — moving the tree up to the root — produces the
  same URLs and the same build, so it is a question of repository shape, not of
  behaviour, and the PO has not decided it. This order keeps the decision open:
  everything the cutover does (remove Astro, repoint CI and the deploy, dedupe
  the Prettier setup, update the docs) is needed under either shape, so moving
  `site/` to the root later is a `git mv` plus a path sweep and throws none of
  it away. Doing the move first and being wrong would throw away the move.
- **One Prettier, at the root.** The pin (3.9.10, exact) and the only
  `.prettierrc`/`.prettierignore` live at the repository root and check the
  whole repository in one pass, `site/` included. Two copies of an identical
  pin with non-identical configs is what let 36 files drift (`-63s`).

## Consequences

- `src/`, `tool/`, `public/`, `astro.config.mjs`, `tsconfig.json` and the
  `astro`/`@astrojs/*` dependencies are gone from the repository root. The root
  `package.json` holds Prettier and nothing else.
- **URLs are preserved.** The Astro build published 60 pages; the Angular build
  prerenders 66, a strict superset — no previously published address 404s. The
  six new ones are the legal pages (`/impressum/`, `/datenschutz/`,
  `/cookies/` and the `en` equivalents). Verified by diffing the two builds'
  route sets, not by inspection.
- **`.github/workflows/pages.yml`** no longer uses `withastro/action`; it
  installs and builds in `site/` with that tree's pinned Node version and
  uploads `site/dist/site/enigma2_player` — the contents of the base-href
  directory, since the artifact root is served at `/enigma2_player/`.
- The Astro build-time variables `PUBLIC_LICENSE_API_BASE` /
  `PUBLIC_APP_API_KEY` have no consumer any more: the Angular tree reads the
  shop endpoint and the release data from the committed
  `site/src/app/content/site-data.json`, regenerated deliberately by
  `npm run data:refresh`. The Actions variables can be deleted once this is
  deployed. That the API key now sits in a tracked file rather than in a repo
  variable is a change in posture, decided separately in
  [ADR 0003](0003-public-shop-api-key-stays-tracked.md): it stays tracked,
  because it is published to every visitor either way.
- **The declared-page-language guard moved rather than disappearing.** The root
  `npm run check:lang` (`-w83`, WCAG 2.2 SC 3.1.1) is replaced by `<html lang>`
  assertions over every prerendered route in `site/e2e/pages.spec.ts`,
  `prerender.spec.ts` and `legal.spec.ts`.
- **The dependency-audit allow list is gone.** It excused `astro` (critical) and
  `sharp` (high) as unfixable and unexploitable in a static site (`-yrq`); both
  left with the Astro tree. The root now reports zero advisories and the gate
  runs with nothing excused.
- `site/tool/compare-astro.mjs` is deleted with its subject: it compared the two
  builds' text to prove the content had moved over (`-n5j`), and cannot run
  without an Astro build.
- ADR 0001 is **superseded, not wrong**. Its constraints still hold — static
  output, no secret in the browser beyond publishable keys, GitHub Pages — and
  the Angular setup is bound by them just as Astro was.
