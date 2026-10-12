# Codebase map — Enigma2 Player product site

Derived from the code in `site/` on 2026-10-11 (`enigma2_player-0ii`), after the
cutover removed the Astro tree in the repository root (`enigma2_player-hsf.1`).
Structural map so a session does not have to re-scan. Detail view:
`docs/architecture/arc42.md`; the decision behind the shape:
`docs/adr/0002-product-site-angular-prerender.md`.

One tree builds the site: **`site/`**. The repository root carries repo-level
tooling only — the single pinned Prettier (3.9.10) with the one `.prettierrc`
and `.prettierignore` for the whole repository. `npm run format` runs there, not
in `site/`.

## Stack & commands

- **Angular 22 + TypeScript ~6.0**, standalone components, **signals**, no
  NgModule anywhere. `@angular/cdk` for the live announcer, `express` only so
  the prerenderer has a server entry. **No HTTP client, no runtime `fetch`** —
  verified, the only mention of `HttpClient` in the tree is a comment saying why
  there is none.
- Builder `@angular/build:application` with `outputMode: "static"`:
  all **66 routes** are written out as HTML at build time (12 pages × 5
  languages + 3 legal pages × 2). `baseHref: "/enigma2_player/"`,
  `outputPath: { base: "dist/site", browser: "enigma2_player" }` — so a static
  server pointed at `dist/site` reproduces the deployed URLs.
- Budgets in the production configuration: initial bundle 350 kB warn /
  **375 kB error**, per-component styles 4 kB / 8 kB.
- Tests: **Vitest** via `@angular/build:unit-test` (14 `*.spec.ts`, 85 `it()`,
  next to the code), **Playwright** e2e against the *built files* (6 specs in
  `e2e/`, served by `e2e/static-server.mjs`), **axe-core** through
  `@axe-core/playwright` for the a11y gate.
- Node pinned in `site/.node-version` (24.21.0); `engines.node >= 24.15.0`
  because the Angular 22 CLI refuses less and only says so at build time.

| Command (in `site/`) | What it does |
|---|---|
| `npm start` | `ng serve` |
| `npm run build` | `ng build` **plus** `tool/write-sitemap.mjs` |
| `npm test` | Vitest, once (`ng test --watch=false`) |
| `npm run test:e2e` | Playwright against `dist/` (needs `npx playwright install chromium` once) |
| `npm run test:a11y` | only `e2e/a11y.spec.ts` |
| `npm run check` | literals → translations → placeholders → unit tests |
| `npm run data:refresh` | regenerates `src/app/content/site-data.json` (network) |
| `npm run sitemap` / `vitals` / `serve:dist` | sitemap only / Core Web Vitals lab run / the e2e static server |

**`tsconfig.json` sets `"strict"` and `strictTemplates`** (since
`enigma2_player-b3m`, 2026-10-11), and `tsconfig.app.json`/`tsconfig.spec.json`
only extend it, so app and tests run under the same rules. They were switched on
after the fact and cost nothing: the tree already compiled with **zero** errors
under both. Switching either off is a decision to let a `null` or a mistyped
template binding compile.

## Modules & responsibilities

| Path | Responsibility |
|---|---|
| `src/app/app.routes.ts` | **The one page list.** `PageDefinition` per page: id, per-language slug, which languages, lazy `load`, nav key, route `data`. Router tree, `sitePaths()`, nav and sitemap all derive from it. |
| `src/app/app.routes.server.ts` | Turns `sitePaths()` into `RenderMode.Prerender` routes — every path named explicitly, because a wildcard cannot enumerate `:lang`. |
| `src/app/app.ts` + `app.html` | The shell: skip link, cookie dialog, state notice, demo notice, nav, `<router-outlet>`, footer. The **only** component with an external template. |
| `src/app/pages/<x>/<x>.ts` | One component per page; all 12 extend `PageBase`. |
| `src/app/pages/page-base.ts` | What no page may forget: the language from its **route data** (never from the URL) → `PageLanguage`, and the document title/description/canonical/hreflang → `PageMeta`. Applied in an `effect()`, because a base constructor runs before subclass fields exist. |
| `src/app/shell/*` | `SiteNav` (nav + language switcher, built from the route definitions), `SiteFooter` (legal links + withdraw consent), `DemoNotice`. |
| `src/app/i18n/locales.ts` | **The only place that names the languages.** `locales`, `Lang`, `defaultLang='de'`, `prefixedLocales`, `isLang`, `langFromSegment`, `localePath` (never includes the base href — Angular adds it). |
| `src/app/i18n/page-language.ts` | Writes `<html lang>` through `DOCUMENT` (so it lands in the prerendered file) and publishes the language the shell reads. |
| `src/app/i18n/page-meta.ts` | Title, description, robots, canonical, `hreflang` + `x-default`, Open Graph/Twitter. `SITE_ORIGIN`/`BASE_PATH` live here. |
| `src/app/i18n/route-announcer.ts` | Announces page and language changes — an SPA swaps the document without a page load, so nothing is said otherwise. |
| `src/app/i18n/format-date.ts` | `Intl.DateTimeFormat`, not `DatePipe`: the pipe needs `registerLocaleData` and renders **nothing** without it, which blanked every prerendered changelog heading. |
| `src/app/content/ui.ts` | **63** short string keys × 5 languages (315 entries), `UiKey`, `sections`. Both headers carried pre-removal figures (445 here, 475 in `check-translations.mjs`) until `enigma2_player-7qz`; the number to trust is the one `npm run check:translations` prints on every run. |
| `src/app/content/content.ts` | Long-form content × 5 languages: `getFeatures`, `getFaq`, `getLicenseInfo`, `getDocs`, `getScreenshots`, each falling back to `de`. |
| `src/app/content/translate.ts` | `Translate` service: `t(key)` signal, `of(key, lang)`, `group({…})` for a template. Falls back to `de`. |
| `src/app/content/site-data.json` + `site-data.ts` | What the build baked in: latest release + downloads, release notes, price models, shop base/key. A plain **import**, not a request. |
| `src/app/content/site-content.ts` | Injectable seam over that data (signals), so a test can render states the committed file does not contain. |
| `src/app/content/site-flags.ts` | `DEMO_MODE` constant (the switch a human edits, read as text by the placeholder tool) **and** `DEMO_MODE_FLAG` injection token (so a test can prove the post-go-live page). |
| `src/app/content/shop-config.ts` | `SHOP_CONFIG.base`/`.apiKey` read out of the generated data — a browser has no environment. |
| `src/app/legal/entity.ts` | Every identity value an imprint needs, as `⟨UPPER_SNAKE⟩` placeholders + `ENTITY_STATUS`. Nothing invented. |
| `src/app/legal/legal-copy.ts` | The imprint, privacy and cookie texts, **de/en only**. |
| `src/app/legal/legal-locales.ts` | `legalLocales = ['de','en']` — its own file so the route table and link helper need not import the texts into the initial bundle. |
| `src/app/legal/legal-links.ts` | The three legal links for the current page; labels from `ui.ts`, **not** from `legal-copy.ts` (importing the texts into the shell cost 398 KiB on the start page). |
| `src/app/consent/*` | `ConsentStore` (the only code that writes a cookie, `e2p_consent`, scoped to the base path), `ConsentModal`, `ConsentGate` (wraps anything needing consent and explains the block), `ConsentStateNotice`, `consent-copy.ts`. |
| `src/server.ts`, `src/main.server.ts` | Prerender entry only; nothing is deployed as a server. |
| `public/` | `favicon.ico`, `app-icon-32/192.png`, `og.svg`, `robots.txt`, `screenshots/` (13 jpg). |
| `tool/*.mjs` | `write-sitemap` (from the build's **output**), `fetch-site-data`, `check-no-literals`, `check-translations`, `check-placeholders` (also writes `TODO.md`), `measure-vitals`. |
| `e2e/*.spec.ts` | `pages`, `prerender`, `legal`, `consent`, `seo`, `a11y` + `static-server.mjs`. |

Dependency direction: **pages → shell/consent → content/i18n**; `i18n` and
`content` import nothing internal. `app.routes.ts` is imported *by* `page-base`,
`site-nav` and `legal-links` — the page list is the shared fact, not a layer.
No import cycle: `app.routes.ts` reaches into `legal/` only for
`legal-locales.ts` (which imports nothing), while it is `legal-links.ts` that
imports back.

## Key flows

- **Page view**: a prerendered file is served; Angular hydrates
  (`provideClientHydration`). The route's `data.lang` → `PageBase` → `<html lang>`
  and the head. Nothing is fetched.
- **Language switch**: `SiteNav` resolves the *same* page in the other language
  via `pageOfPath` + `pathOf`; where the page does not exist in that language
  (the legal texts) it falls back to that language's landing page rather than
  offering a dead link.
- **Consent**: `ConsentStore` reads the cookie (`undecided` while prerendering,
  so the emitted HTML always contains the modal and a blocked shop). Accept →
  cookie, 180 days, `SameSite=Lax`, path = base href. Revoke → cookie deleted,
  not set to "undecided".
- **Shop/account**: one component, two views from route `data.view`. The iframe
  is **inside** `ConsentGate`, `loading="lazy"`,
  `referrerpolicy="no-referrer"`, URL marked trusted via `DomSanitizer` (every
  part of it is ours). No shop configured → the page says so.
- **Downloads/Changelog/Pricing**: read `SiteContent` signals, i.e. the baked-in
  data — complete in the prerendered HTML, no spinner state.
- **Build**: `ng build` prerenders all 66 routes → `tool/write-sitemap.mjs`
  walks `dist` and writes `sitemap.xml` + `robots.txt` from what actually got
  emitted (exits non-zero if nothing did).

## External systems

- **License server** (`site-data.json → shop.base`): framed on `/buy` and
  `/account`; it must allow this origin (`EMBED_ALLOWED_ORIGINS`). This site
  makes no authenticated call and holds no session.
- **GitHub Releases API** of `madoe21/enigma2_player`: read by
  `tool/fetch-site-data.mjs` at refresh time (`GITHUB_TOKEN` optional,
  `LICENSE_API_BASE` + `APP_API_KEY` for the price list), never from the
  browser. The result is committed, so a build never needs the network.
- **GitHub Pages/Actions**: `.github/workflows/pages.yml` builds in `site/` and
  uploads the *contents* of `site/dist/site/enigma2_player`; `ci.yml` runs the
  site job (audit, build, unit, checks, e2e, a11y) and a repository job
  (`prettier --check .`, root audit).

## Adding a page (recipe)

1. Component in `src/app/pages/<x>/<x>.ts`, inline template, `extends PageBase`,
   `styleUrl: '../page.css'` (plus its own file if it needs one).
2. Strings into `src/app/content/ui.ts` **in all five languages** (long-form
   into `content.ts`); nav label key as `navKey`.
3. One `PageDefinition` in `src/app/app.routes.ts` — `everywhere('<slug>')`, or a
   per-language slug where the word matters. Router, prerender list, nav and
   sitemap follow from it; there is no second list to update.
4. `npm run check` (literals + translations + placeholders + unit), then
   `npm run build && npm run test:e2e`.

## Risks / debt (observed)

- `es`, `fr`, `it` are machine translations nobody has reviewed, which is why
  `check-translations.mjs` only fails on a key missing from **de/en**. Accepted
  as it stands by the PO on 2026-10-12 (`enigma2_player-60g`, closed): the
  product is sold in Germany only. The code comments therefore name no bead at
  all — they used to cite `enigma2_player_source-4dx` (the **app's** `.lng`
  files, wrong subject) and then `-60g` (right subject, but a promise nobody
  had given). A native-speaker pass is the precondition for selling in those
  markets, not an open task.
- The shop's public API key sits in the tracked `site-data.json` **on purpose**
  — not debt, decided in `docs/adr/0003-public-shop-api-key-stays-tracked.md`
  (`enigma2_player-9c9`). Do not "fix" it into an Actions variable; the key is
  published to every visitor either way. The exception covers client-published
  keys only — a server credential in the tree is still a blocker.
- `angular.json` still declares `prefix: "app"` while every component uses
  `site-` (only `app-root` is `app-`) — scaffold leftover, harmless.
- `LegalPageComponent` is the one class carrying a `Component` suffix; the other
  25 do not.
- Identity values in `legal/entity.ts` are placeholders until the company exists;
  `DEMO_MODE = true` says so on every page. Go-live = those two edits.
