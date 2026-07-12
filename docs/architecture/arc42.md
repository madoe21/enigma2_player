# Architecture (arc42) — Enigma2 Player product site

Filled by the onboarder from the code (2026-07-05). Confirmed facts unless
marked TODO. Keep in sync with the code; decisions live in `adr/` and
`../adr/0001-static-site-astro.md`.

## 1. Introduction & goals

The public product page **and** customer portal for the **Enigma2 Player** app
(a cross-platform Flutter client for Enigma2/OpenWebIF receivers, developed in
the separate `madoe21/enigma2_player` repo). Visitors read marketing content
(features, screenshots, FAQ, docs, pricing) in **de/en/es**; customers register,
sign in, buy a license via PayPal, and manage licenses/devices/invoices.

Quality goals (derived from ADR 0001 and bead #13):
1. **Static & cheap to host** — every page is prebuilt HTML on GitHub Pages;
   JS only where interaction demands it (Astro islands).
2. **No secrets in the browser** — the portal works with only a public API base
   URL and a public product API key; sessions are in-memory only.
3. **SEO/i18n correctness** — canonical URLs, hreflang alternates, sitemap,
   `de` default locale with `en`/`es` mirrors and graceful fallback.

Stakeholders: product owner/developer (madoe21), end customers of the app.

## 2. Constraints

- Hosting: **GitHub Pages** (project page) → output must be fully static, site
  served under the `/enigma2_player` base path (until a custom domain, bead #25).
- All privileged logic stays in the separate **license server**; this site may
  only call its public REST API from the browser.
- Languages: de (default, unprefixed), en, es.
- Node 22 toolchain; Astro 5 + TypeScript (ADR `docs/adr/0001-static-site-astro.md`).

## 3. Context & scope

External systems:
- **License server API** (`PUBLIC_LICENSE_API_BASE`, HTTPS): auth
  (register/login/refresh/logout/password), portal (licenses, devices, invoices,
  subscription change, account deletion), pricing, PayPal checkout start.
- **PayPal**: user is redirected to the `approveUrl` returned by the checkout
  endpoints; payment itself never touches this site.
- **GitHub Releases API** of `madoe21/enigma2_player`: feeds the Downloads and
  Changelog pages client-side.
- **GitHub Pages / Actions**: build + deploy pipeline.

Users: anonymous visitors (marketing pages) and authenticated customers
(account/buy pages).

## 4. Solution strategy

- **Astro static-first**: all routes prerendered; interactivity added as islands
  with plain inline scripts (no client framework) — see ADR 0001.
- **Thin pages, shared components**: each locale route file only wraps a shared
  section component with the locale; content lives once.
- **i18n by convention**: `src/i18n/ui.ts` (short strings) + `content.ts`
  (long-form) with fallback to `de`; helpers in `i18n/utils.ts` make every link
  and asset base-path- and locale-aware.
- **Single API client**: `src/lib/licenseApi.ts` is the only code that talks to
  the license server; it owns the in-memory session and token refresh.

## 5. Building blocks

| Block | Responsibility | May depend on |
|---|---|---|
| `src/pages/**` | Routes ×3 locales; thin wrappers; `[page].astro` placeholder for unbuilt sections | layouts, components, i18n |
| `src/layouts/Base.astro` | HTML shell, nav/footer, global CSS, SEO head (canonical, hreflang, OG) | components/SiteNav, i18n |
| `src/components/*` | One component per content section; islands for auth/buy/pricing/downloads/changelog | i18n, lib |
| `src/i18n/*` | Dictionaries (`ui`, `content`), route registry (`routes`), URL/locale helpers (`utils`) | — |
| `src/lib/licenseApi.ts` | Browser client for the license server: auth, portal, purchase; in-memory session | — |
| `public/` | Static assets (favicon, OG image, robots.txt) | — |

Dependency direction: **pages → layouts/components → i18n/lib**; `i18n` and
`lib` depend on nothing internal. No layer skips observed.

## 6. Runtime

- **Sign-in**: AuthPanel island → `licenseApi.login()` → tokens kept in a module
  variable (never persisted) → `authed()` auto-refreshes the access token when
  <60 s to expiry → dashboard loads licenses/devices/invoices in parallel.
- **Purchase**: Buy island → `getPricing()` (public, keyed by
  `PUBLIC_APP_API_KEY`) → requires sign-in → `startCheckout()` picks
  `/checkout/order` (lifetime) vs `/checkout/subscription` → browser redirects
  to PayPal approve URL; return/cancel URLs point back to the site.
- **Downloads/Changelog**: on page load, fetch latest/all releases from the
  public GitHub API; map assets to platform buttons; empty feed ⇒ "coming soon".
- **Unconfigured mode**: without the two `PUBLIC_*` variables the portal/pricing
  areas render a "not connected" note instead of failing.

## 7. Deployment

- Push to `main` → `.github/workflows/pages.yml`: `withastro/action@v3` builds
  (`PUBLIC_LICENSE_API_BASE`, `PUBLIC_APP_API_KEY` injected from repo Actions
  **variables**) → `actions/deploy-pages@v4` publishes `dist/`.
- `.github/workflows/ci.yml`: generic verify on push/PR (prettier warn-only,
  `npm test --if-present` — currently no tests exist).
- Local: `npm run dev` / `build` / `preview` / `check`.
- `docker/` is for headless aiflow agent runs, **not** for serving the site.

## 8. Cross-cutting concerns

- **Auth/security**: no secret in the browser (bead #13); in-memory session
  only; short-lived access token + refresh token; password-reset endpoint never
  reveals whether an account exists; account deletion requires explicit
  `confirm: 'DELETE'` payload.
- **Error handling**: `ApiError(status, message)` thrown by the API client;
  islands render translated error notes; missing config degrades gracefully.
- **i18n**: fallback-to-`de` translator; hreflang alternates per page;
  `x-default` → de. Full en/es translation tracked in bead #23.
- **Logging**: none client-side beyond browser defaults — acceptable for a
  static site; server-side logging is the license server's concern.
- **Config**: build-time public env vars only (`PUBLIC_*` via Astro
  `import.meta.env`).

## 9. Decisions

- `docs/adr/0001-static-site-astro.md` — Astro over Eleventy/plain HTML.
- `docs/architecture/adr/0001-record-architecture-decisions.md` — use ADRs.

## 10. Risks & tech debt

- **No automated tests** (unit or E2E). Highest-value first targets:
  `i18n/utils.ts` URL helpers and `lib/licenseApi.ts` session/refresh logic.
- Partial en/es translations fall back to German (bead #23).
- Custom domain pending (bead #25) — `site`/`base` must change together then.
- Root README documents the aiflow toolkit, not this product — TODO: a short
  site-specific README section or link.
