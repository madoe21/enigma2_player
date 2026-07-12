# Codebase map — Enigma2 Player product site

Written by the onboarder (2026-07-06) from the code. Structural map so future
sessions don't re-scan. Detail view: `docs/architecture/arc42.md`.

## Stack & commands

- **Astro 5 + TypeScript**, `@astrojs/sitemap`; no client framework — vanilla-JS
  inline `<script>` islands. Node toolchain, npm.
- `npm run dev` / `build` / `preview` / `check` (`astro check`). **No test
  runner exists yet** (`npm test` is not defined) — CI runs `npm test
  --if-present`, which no-ops.
- Config: `astro.config.mjs` — `site: https://madoe21.github.io`,
  `base: /enigma2_player`, i18n locales `de` (default, unprefixed) / `en` / `es`.

## Modules & responsibilities

| Path | Responsibility |
|---|---|
| `src/pages/**` | One route file per section **× 3 locales** (`/`, `/en/`, `/es/`). Each is a thin wrapper: import `Base` + the shared content component, pass `lang`. `[page].astro` (×3) renders a placeholder for sections listed in `i18n/routes.ts` without a dedicated page. |
| `src/layouts/Base.astro` | HTML shell: SEO head (canonical, hreflang alternates + `x-default`→de, OG/Twitter), `SiteNav`, footer, global CSS. |
| `src/components/*.astro` | One component per content section. Static content: `Landing`, `FeaturesContent`, `FaqContent`, `DocsContent`, `ScreenshotsContent`, `ContactContent`, `LicenseContent`. Interactive islands (inline scripts): `AuthPanel` (login/register/forgot + account dashboard), `Buy` (checkout flow), `Pricing`, `Downloads` + `Changelog` (GitHub Releases API of `madoe21/enigma2_player`). |
| `src/i18n/ui.ts` | Short-string dictionaries per locale + `sections` registry; `de` is fallback. |
| `src/i18n/content.ts` | Long-form translated content. |
| `src/i18n/routes.ts` | `builtSections` set — which sections have real pages vs placeholder. New page ⇒ add here. |
| `src/i18n/utils.ts` | `getLangFromUrl`, `useTranslations` (fallback→de), `href(key, lang)`, `routeKey`, `asset`, `baseUrl` — every internal link/asset MUST go through these (base path + locale aware). |
| `src/lib/licenseApi.ts` | **Only** code that talks to the license server: auth (register/login/refresh/logout/password/delete), portal (licenses/devices/invoices/subscription change), pricing, PayPal checkout start. Owns the in-memory session (tokens never persisted; auto-refresh <60 s to expiry). `ApiError(status, message)`. |
| `public/` | favicon.svg, og.svg, robots.txt. |

## Dependency direction

`pages → layouts/components → i18n/lib`; `i18n` and `lib` import nothing
internal. `lib/licenseApi.ts` and `i18n/*` are the only TS modules — everything
else is `.astro`.

## Key flows

- **Auth/portal**: AuthPanel island → `licenseApi.login()` → module-variable
  session → `authed()` refreshes token → dashboard fetches licenses/devices/
  invoices in parallel.
- **Purchase**: Buy island → `getPricing()` (public, `PUBLIC_APP_API_KEY`) →
  sign-in required → `startCheckout()` picks `/checkout/order` (lifetime) vs
  `/checkout/subscription` → redirect to PayPal `approveUrl`.
- **Downloads/Changelog**: client-side fetch of GitHub Releases; empty ⇒
  "coming soon" note.
- **Unconfigured mode**: without `PUBLIC_LICENSE_API_BASE` /
  `PUBLIC_APP_API_KEY` the portal/buy areas render a "not connected" note —
  never crash. Preserve this on any change.

## External systems

License server REST API (`PUBLIC_LICENSE_API_BASE`), PayPal (redirect only),
GitHub Releases API, GitHub Pages/Actions (deploy: `.github/workflows/pages.yml`
injects the two `PUBLIC_*` Actions variables; `ci.yml` generic verify).

## Adding a page (recipe)

1. Shared component in `src/components/<X>Content.astro` (strings via i18n).
2. Three thin wrappers: `src/pages/<x>.astro`, `en/<x>.astro`, `es/<x>.astro`.
3. Add section to `builtSections` in `src/i18n/routes.ts`; strings in `ui.ts`
   (+ `content.ts` for long-form), nav entry follows from `sections`.

## Risks / debt (observed)

- No tests at all — first targets: `i18n/utils.ts` URL helpers,
  `licenseApi.ts` session/refresh.
- en/es translations partially fall back to de (bead #23).
- Custom domain pending (bead #25): change `site` **and** drop `base` together.
- Root README documents the aiflow toolkit, not the product site.
