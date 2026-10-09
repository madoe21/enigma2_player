# Product page — Angular 22

The Angular version of the product page, replacing the Astro site in the
repository root (bead `enigma2_player_source-hsf`). Both live here for the
duration of the migration, and that is deliberate rather than untidy:
`pages.yml` keeps deploying the Astro site until the content has moved
(`enigma2_player_source-n5j`), so the published page never shows a half-built
replacement. The switch happens in one commit that changes the deployment and
removes Astro together.

## What is decided, and why

**No backend.** `outputMode: static` with every route prerendered. The server
entry under `src/server.ts` exists only so Angular can render the pages while
building; nothing is deployed as a server. A product page lives off search
engines and should be servable as files.

**Standalone components, no NgModule.** `bootstrapApplication`, dependencies
imported on the component or provided in the route.

**Five languages, one build.** German at the root, English, Spanish, French and
Italian under `/en`, `/es`, `/fr`, `/it`. The texts are a typed record per
language (see `src/app/pages/landing/landing.ts`), not `$localize` messages:
the site this replaces already keeps its content that way, so the migration is
a move rather than a conversion, and one build produces all five instead of
five builds. The language list lives in exactly one place,
`src/app/i18n/locales.ts` — the old site kept it in three and one of them was
wrong, which is how `/fr` came to be served as German
(`enigma2_player_source-w83`).

**The sub path is part of the build.** `baseHref` is `/enigma2_player/`,
because that is where GitHub Pages serves this project. The build writes into
`dist/site/enigma2_player/`, so pointing a static server at `dist/site`
reproduces the deployed URLs exactly — a test that served the output at `/`
would pass while the deployment broke.

## Commands

```bash
npm ci
npm start          # ng serve
npm run build      # prerenders all five languages into dist/site/enigma2_player
npm test           # Vitest, the Angular 22 default runner
npm run test:e2e   # Playwright, against the built files
npm run serve:dist # the same static server the e2e tests use
```

`npm run test:e2e` needs a browser once: `npx playwright install chromium`.

Node is pinned in `.node-version` (24.21.0). The Angular 22 CLI refuses
anything below 24.15.0 and only says so at build time, which is why the pin is
next to the code and read by CI rather than written into the workflow.
