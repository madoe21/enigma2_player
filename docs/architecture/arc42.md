# Architecture (arc42) — Enigma2 Player product site

Filled by the onboarder from the code (2026-07-05) for the Astro site; the
sections the Angular cutover invalidated were rewritten from the code on
2026-10-10 (`enigma2_player-hsf.1`). Confirmed facts unless marked TODO —
anything the cutover did not verify is marked rather than carried over from the
Astro description, because a document that quietly keeps describing the
predecessor is worse than one that admits a gap. Decisions live in `adr/` and
`../adr/`, currently `../adr/0002-product-site-angular-prerender.md`.

## 1. Introduction & goals

The public product page **and** customer portal for the **Enigma2 Player** app
(a cross-platform Flutter client for Enigma2/OpenWebIF receivers, developed in
the separate `madoe21/enigma2_player` repo). Visitors read marketing content
(features, screenshots, FAQ, docs, pricing) in **de/en/es/fr/it**; buying and
account management happen in the license server's shop, embedded in this site.

Quality goals (derived from ADR 0002 and bead #13):
1. **Static & cheap to host** — every page is prebuilt HTML on GitHub Pages;
   Angular prerender (SSG), no Node process at runtime.
2. **No secrets in the browser** — only a public API base URL and a public
   product API key ever reach the client (see §8 and `enigma2_player-9c9`).
3. **SEO/i18n correctness** — canonical URLs, hreflang alternates, sitemap,
   `de` default locale with `en/es/fr/it` mirrors and graceful fallback.
4. **Operable with a screen reader** — WCAG 2.2 AA, checked by axe-core over
   every prerendered page in both consent states; the NVDA pass is manual
   (`enigma2_player-iaa`).

Stakeholders: product owner/developer (madoe21), end customers of the app.

## 2. Constraints

- Hosting: **GitHub Pages** (project page) → output must be fully static, site
  served under the `/enigma2_player` base path (until a custom domain, bead #25).
- All privileged logic stays in the separate **license server**; this site may
  only reach its public surface from the browser.
- Languages: de (default, unprefixed), en, es, fr, it. The legal texts exist in
  **de and en only** (`src/app/legal/legal-locales.ts`), and the route tree has
  no route for the others rather than serving an unchecked translation.
- Node ≥ 24.15 (pinned in `site/.node-version`; the Angular 22 CLI refuses less);
  Angular 22 + TypeScript, prerendered — ADR
  `docs/adr/0002-product-site-angular-prerender.md`.
- One site tree: `site/`. The repository root holds repo-level tooling only
  (the single pinned Prettier). Whether `site/` moves up to the root is open and
  deliberately so — see ADR 0002.

## 3. Context & scope

External systems:
- **License server** (`site/src/app/content/site-data.json` → `shop.base`): the
  shop and account area are loaded from it into an iframe on `/buy` and
  `/account`; this site itself makes no authenticated API calls.
- **PayPal**: reached inside the shop, i.e. the license server's concern;
  payment never touches this site.
- **GitHub Releases API** of `madoe21/enigma2_player`: feeds the Downloads and
  Changelog pages. Fetched **at data-refresh time** by
  `site/tool/fetch-site-data.mjs` into the committed `site-data.json`, not in
  the browser as the Astro site did.
- **GitHub Pages / Actions**: build + deploy pipeline.

Users: anonymous visitors (marketing pages) and customers (shop iframe).

## 4. Solution strategy

- **Angular 22, prerendered**: all 66 routes written out as HTML at build time
  (12 pages × 5 languages + 3 legal pages × 2) — see ADR 0002.
- **One list of pages, not three.** `src/app/app.routes.ts` declares each page
  once with its per-language slug, and the router, the prerender list, the
  navigation and the sitemap are all derived from it. The Astro site kept three
  separate enumerations, and the third existed only because the first two could
  disagree — which is how a nav entry can lead to a 404.
- **Per-language slugs where the word matters**: `/impressum` in German,
  `/en/imprint` in English. Product pages keep the slugs the Astro site
  published, because those URLs are indexed (`enigma2_player-9v1`).
- **Content as data**: `src/app/content/*` holds the dictionaries and the
  generated site data; templates carry no translatable literals, and
  `tool/check-no-literals.mjs` enforces that.
- **Consent gates the shop**: the iframe is rendered *inside* the consent gate,
  so declining cannot leave a loaded third-party frame behind.

## 5. Building blocks

| Block | Responsibility | May depend on |
|---|---|---|
| `site/src/app/app.routes.ts` | The one page list: ids, per-language slugs, languages, lazy component | i18n, content, legal |
| `site/src/app/pages/**` | One component per page (landing, features, …, shop, legal) | shell, content, i18n, consent |
| `site/src/app/shell/*` | Nav, footer, demo notice — the frame around every page | content, i18n |
| `site/src/app/i18n/*` | Locales/`Lang`, URL+locale helpers, `<html lang>`, page meta, route announcer, date formatting | — |
| `site/src/app/content/*` | Dictionaries (`ui`, `content`, `site-content`), feature flags, shop config, generated `site-data.json` | — |
| `site/src/app/legal/*` | Imprint/privacy/cookie texts and the languages they exist in | i18n |
| `site/src/app/consent/*` | Consent store, modal, gate, state notice | content, i18n |
| `site/public/` | Static assets (icons, OG image, robots.txt, screenshots) | — |
| `site/tool/*` | Build/maintenance scripts: sitemap, site-data refresh, translation/literal/placeholder checks, vitals | — |
| `/` (repo root) | Repo-level tooling only: the single pinned Prettier, its config and ignore file | — |

Dependency direction: **routes/pages → shell/consent → content/i18n**; `i18n`
and `content` depend on nothing internal.

## 6. Runtime

- **Page view**: the request hits a prerendered HTML file; Angular hydrates the
  shell. `<html lang>` is written per route (`i18n/page-language.ts`) and
  asserted for every route by the e2e suite — a page that lies about its
  language makes a screen reader read it in the wrong voice (WCAG 2.2 SC 3.1.1,
  `enigma2_player-w83`).
- **Consent**: the consent store decides whether the shop iframe may load. The
  modal is the gate, not a banner over a loaded frame.
- **Purchase / account**: `/buy` and `/account` render the license server's shop
  in a lazily loaded iframe (`referrerpolicy=no-referrer`), with the language
  passed through. Authentication, pricing and PayPal all happen on the license
  server side.
- **Downloads/Changelog**: rendered from the committed `site-data.json`, so the
  pages are complete in the prerendered HTML instead of filling in after a
  client-side fetch.
- **Unconfigured mode**: without `shop.base`/`shop.apiKey` in the site data the
  shop area renders a notice instead of an iframe.

## 7. Deployment

- Push to `main` → `.github/workflows/pages.yml`: installs and builds in `site/`
  with that tree's pinned Node version, uploads the **contents** of
  `site/dist/site/enigma2_player` (the base-href directory) →
  `actions/deploy-pages@v5` publishes it under `/enigma2_player/`.
- `.github/workflows/ci.yml`, two jobs:
  - **site** — install, dependency audit (hard, no exceptions), build, Vitest
    unit tests, literal/translation/placeholder checks, Playwright e2e, axe-core
    a11y.
  - **verify** — repository-level: `prettier --check .` over the whole
    repository (the single style gate) and the root dependency audit.
- Local: `npm run build` / `test` / `test:e2e` / `check` in `site/`;
  `npm run format` at the root.
- `docker/` is for headless aiflow agent runs, **not** for serving the site.

## 8. Cross-cutting concerns

- **Auth/security**: this site holds no session and performs no authenticated
  call; the shop iframe owns that. The one credential in the client is the
  public product API key (bead #13) — it currently sits in the tracked
  `site-data.json` rather than in an Actions variable, which is filed as
  `enigma2_player-9c9`.
- **Error handling**: TODO — re-derive for the Angular tree; the Astro-era
  `ApiError` client no longer exists.
- **i18n**: fallback-to-`de` translator (`content/translate.ts`); hreflang
  alternates per page; `x-default` → de; `tool/check-translations.mjs` fails on
  a key missing from a maintained language or read by nobody.
- **Logging**: none client-side beyond browser defaults — acceptable for a
  static site with no backend; server-side logging is the license server's
  concern.
- **Config**: build-time only, from the committed `site-data.json`
  (`npm run data:refresh` regenerates it from `LICENSE_API_BASE`/`APP_API_KEY`
  plus the Releases API). The Astro-era `PUBLIC_*` Actions variables have no
  consumer any more.
- **Style**: Prettier 3.9.10, pinned exactly, **once**, at the repository root,
  with one `.prettierrc` and one `.prettierignore` covering the whole repository.

## 9. Decisions

- `docs/adr/0002-product-site-angular-prerender.md` — Angular 22 prerender; one
  framework across both web projects. **Current.**
- `docs/adr/0001-static-site-astro.md` — Astro over Eleventy/plain HTML.
  **Superseded by 0002**; its constraints still bind.
- `docs/architecture/adr/0001-record-architecture-decisions.md` — use ADRs.

## 10. Risks & tech debt

- The repository shape is half-decided: the site lives in `site/` while the root
  is a toolchain-only directory. Deliberate and reversible (ADR 0002), but it is
  a question still open with the PO.
- Legal texts exist in de/en only; the other three languages have no legal route
  at all. Intentional, and visible in `legal-locales.ts`.
- The NVDA pass (`enigma2_player-iaa`) cannot be automated and is still open;
  axe-core covers what a tool can see, which is not the same thing.
- `docs/plugin-api.md` must be published here (`enigma2_player-hsf.2`), and
  blocks on `enigma2_player_source-7nm` first.
- Custom domain pending (bead #25) — `baseHref` and the sitemap base must change
  together then.
- Root README documents the aiflow toolkit, not this product — TODO: a short
  site-specific README section or link.
