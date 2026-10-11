# Product page — Angular 22

The product page (bead `enigma2_player_source-hsf`). This is the only site in
the repository: the Astro site that used to live in the repository root was
removed at the cutover, together with the deployment switch, in
`enigma2_player-hsf.1`. Both trees existed side by side until then, which was
deliberate rather than untidy — `pages.yml` kept deploying the old site until
the content had moved (`enigma2_player_source-n5j`), so the published page never
showed a half-built replacement.

The repository root now holds repo-level tooling only: the single pinned
Prettier, with the one `.prettierrc` and `.prettierignore` that cover this tree
as well. Run `npm run format` there, not here. Whether this tree moves up to the
root is an open question — see `docs/adr/0002-product-site-angular-prerender.md`.

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

**`strict` and `strictTemplates` are on.** Both in `tsconfig.json`, and they are
not negotiable per file: `tsconfig.app.json` and `tsconfig.spec.json` only
extend it, so the same rules cover the app and the tests. They were switched on
after the fact (`enigma2_player-b3m`) and cost nothing — the code already
satisfied them, `npm run build`, `npm test` and `npm run test:e2e` stayed green
on the same commit. Switching either one off is a decision to let a `null` or a
mistyped template binding compile, not a tooling detail.

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
