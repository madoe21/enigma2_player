# 1. Static-site tooling for the product page: Astro

Date: 2026-07-01

## Status

Accepted

## Context

The public `enigma2_player` repo is the product page **and** the customer portal
(register/login/buy/account). Requirements (beads `#1`, `#13`):

- Hosted on **GitHub Pages** — output must be fully static.
- **i18n** de/en/es.
- The portal calls the **license server** API **client-side**, holding **no
  secrets** in the browser (only the public API base URL + Supabase anon key).
- A mix of static marketing pages (landing, features, pricing, FAQ, docs) and a
  few interactive areas (login, account, checkout redirect).
- Downloads/changelog derived from the public GitHub **Releases** feed.

## Decision

Use **Astro**.

Rationale vs the alternatives considered:

- **Astro (chosen).** Static-first: every page renders to HTML at build time
  (ideal for Pages + SEO). Interactivity is added as **islands** — only the
  login/account/checkout widgets ship JS, which `fetch()` the license API at
  runtime; the rest is zero-JS. **Built-in i18n routing** (`defaultLocale` +
  locale folders) covers de/en/es without a plugin. First-class TypeScript,
  Markdown/MDX for docs/FAQ, and an official **GitHub Pages Action**
  (`withastro/action`) for deploys. Best fit for "marketing + portal in one
  static site."
- **Eleventy (11ty).** Excellent static generator, but no component islands —
  the interactive portal would be hand-rolled JS, and i18n needs more manual
  wiring. Better when the site is almost purely static.
- **Plain HTML/CSS/JS.** Zero build, but i18n, the portal, and
  release-driven downloads all become manual and fragile; does not scale past a
  handful of pages.

## Consequences

- Stack: Astro + TypeScript, deployed to GitHub Pages via `withastro/action` +
  `actions/deploy-pages` (`.github/workflows/pages.yml`).
- `astro.config.mjs` sets `site`/`base` (project page under `/enigma2_player`
  until a custom domain lands, bead `#25`) and the `de/en/es` i18n config with
  `de` as the unprefixed default.
- **No secret ever ships to the browser.** Portal islands call the license
  server over HTTPS with the public API base URL + Supabase anon key only
  (server-side privileged calls stay in `license_server`).
- Content structure: `src/pages` for routes, `src/layouts` + `src/components`
  for the shell/nav, `src/i18n` for translation dictionaries. Docs/FAQ can move
  to Markdown/MDX later.
- Downloads/changelog pages will read the public Releases API at build time
  (bead `#7`/`#8`).
