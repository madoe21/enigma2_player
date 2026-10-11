# Conventions — as observed in the code (2026-10-11, `enigma2_player-0ii`)

Read off the Angular 22 tree in `site/`, which is the whole site since the
cutover (`enigma2_player-hsf.1`). Match these when writing code here; they
follow Google TS style where the two have an opinion each. Structural map:
`codebase-map.md`.

## Language & formatting

- TypeScript, ESM, **standalone Angular 22 with signals**. 2-space indent,
  single quotes, LF, final newline, no trailing whitespace (`.editorconfig`).
- **Prettier lives once, at the repository root** — `printWidth: 100`,
  `singleQuote: true`, `endOfLine: "auto"`, Angular parser for `*.html`. Run
  `npm run format` at the root; `site/` has no Prettier of its own and must not
  get one back.
- Naming: `lowerCamelCase` members and functions, `PascalCase` types and
  classes, `SCREAMING_SNAKE` for module constants (`CONSENT_COOKIE`, `ENTITY`,
  `SHOP_CONFIG`, `OG_LOCALE`). Files `kebab-case.ts`, one concept per file,
  `*.spec.ts` next to the thing it tests.
- **Class names carry no `Component`/`Service` suffix** — `Landing`, `SiteNav`,
  `Translate`, `ConsentStore`. (`LegalPageComponent` is the single exception;
  don't copy it.) Component selectors are prefixed **`site-`**; only the shell is
  `app-root`, and `angular.json`'s `prefix: "app"` is a scaffold leftover.
- Doc comment on every exported symbol, and **comments say *why*, naming the
  defect they prevent and the bead it came from** — e.g. "`/fr` was served as
  German, which makes a screen reader read French with a German voice
  (`enigma2_player-w83`)". This is the house style and the most useful thing in
  the tree: when you change such code, update the reason, don't delete it.
- No dead code, no commented-out blocks. Where something was removed, the reason
  is written down (see the header of `content/ui.ts`) instead of the code being
  kept "just in case".

## Angular patterns

- **Standalone, no NgModule.** Dependencies in the component's own `imports:`.
- **Inline `template:` backticks** in the `.ts` file; only `app.ts` uses
  `templateUrl`. Styles via `styleUrl`/`styleUrls`, with the shared
  `pages/page.css` first and a per-page file after it.
- `inject()`, never constructor parameter injection. **Visibility is the
  contract**: `protected readonly` = the template reads it, `private readonly` =
  internal, public `readonly` = other code may.
- `signal` / `computed` / `effect`, `toSignal` for router events. No manual
  subscriptions in components, no `async` pipe needed.
- Built-in control flow `@if` / `@for (… ; track …)`, not `NgIf`/`NgFor`.
- Services are `@Injectable({ providedIn: 'root' })`. When a module **constant**
  has to be substitutable in a test, it gets an `InjectionToken` with a factory
  defaulting to the constant (`DEMO_MODE` → `DEMO_MODE_FLAG`) — Angular's test
  runner refuses `vi.mock` for relative imports, so DI is the only seam.
- A page is a component extending **`PageBase`** plus one `PageDefinition` in
  `app.routes.ts`. Never read the language from the URL — it comes from route
  `data.lang`; guessing it is the defect `PageBase` exists to prevent.
- Anything that crosses a boundary goes through something substitutable: baked-in
  data is read through `SiteContent` signals, not imported into pages directly.
- **Accessibility is part of the component, not a later pass**: accessible names
  come from `ui.ts` keys, `routerLinkActive` + `ariaCurrentWhenActive="page"`
  marks the current entry, the dialog traps focus and restores it, route changes
  are announced via the CDK announcer, and a standing notice is *not* a live
  region. WCAG 2.2 AA is the bar.

## i18n rules

- **Never put reader-visible text in a template.** All five languages come from
  `content/ui.ts` (short) or `content/content.ts` (long-form);
  `npm run check:literals` fails the build on text between tags or in `title`,
  `aria-label`, `alt`, `placeholder`.
- **Never name a language outside `i18n/locales.ts`.** That file exists because
  the predecessor kept the list in three places and one disagreed.
- **Never hand-build a URL or a path.** `localePath(route, lang)` and
  `pathOf(page, lang)`; the base href is added by Angular, so it must not appear
  in a path (that is how you get `/enigma2_player/enigma2_player/features`).
- Missing keys fall back to `de` on purpose. `es`/`fr`/`it` are unreviewed
  machine translations (`enigma2_player-60g`; the similar-looking
  `enigma2_player_source-4dx` is about the app's `.lng` files, not these), so
  `check:translations` **fails** on three things and only those: a key missing
  from **de/en**, a key a language has and `de` does not, and a key no source
  file reads. The third one used to be reported without failing, against the
  script's own header, and it reported three false positives — fixed in
  `enigma2_player-7qz`: a literal prefix in front of a `${` counts as read, so
  the computed `legal.${id}` in `legal-links.ts` covers `legal.*`. A computed
  key of the shape `${group}.title` is still unresolvable and would show up as
  unread — teach the scanner about it, never delete the key it reads.
- A surface may be published in fewer languages than the site (the legal texts
  are de/en): declare it in `languages` and the route tree simply has no route
  for the others — never serve an unchecked translation of a legal text.

## Tests

- **Vitest** for units, specs beside the code. `describe`/`it` with behaviour
  sentences as titles ("says so when there is nothing to sell yet"). Globals are
  configured; pure-TS specs import from `vitest` explicitly.
- Components through `TestBed.configureTestingModule({ imports: [X] })` →
  `compileComponents()` → `createComponent` → `await fixture.whenStable()`.
  Pages need a route stub with both `snapshot.data` **and**
  `snapshot.pathFromRoot`, because `PageBase` builds the title and canonical URL
  from the path.
- Test the states the committed data does *not* contain by setting the
  `SiteContent` signals — a page whose only test is "empty today" leaves its
  interesting half unproven.
- **e2e asserts the built files**, never `ng serve`: a static site *is* its
  output, and the defects worth catching (`<html lang>`, base href, consent in
  the prerendered HTML, a page missing from `dist`) are invisible to a dev-server
  test. Playwright serves `dist/site` via `e2e/static-server.mjs` with the real
  sub path; `workers: 2` is measured, not a guess.
- a11y runs axe-core over every page in every language, in **both** consent
  states, plus keyboard-only reachability, per-page titles and announcements.
- Each spec file opens with a doc comment saying what it is for and which defect
  it pins.

## Repo / process

- Conventional Commits + bead id: `feat(site): … (enigma2_player-<id>)`. Beads
  (`bd`) for all tracking; branch per task; `docs/branching.md` binds.
- **A bead id in a comment is a promise, and `pre-commit` checks it.** The hook
  warns when staged content names a bead this tracker does not have — take the
  warning seriously: it is how four comments were caught citing `…-4dx` with
  *this* repo's prefix, when that bead lives in the sibling repo — and is about
  the app's `.lng` files, not this site (`enigma2_player-60g`). Ids are written
  here unprefixed or as `<id>` on purpose, so the hook does not read an example
  as a reference.
- **Before done, in `site/`**: `npm run check` (literals → translations →
  placeholders → unit), `npm run build`, `npm run test:e2e`, `npm run test:a11y`;
  `npm run format`/`check:format` at the root.
- The production **bundle budget is a hard error** (initial 375 kB): a change
  that pulls content into the shell fails the build rather than slowly getting
  heavier. That is how importing `legal-copy.ts` for three footer labels was
  caught.
- `npm run data:refresh` is the only thing that touches the network, and its
  output (`site-data.json`) is committed — a build must never need the network.
- Placeholders `⟨UPPER_SNAKE⟩` mark values that cannot exist yet;
  `check:placeholders` reports them and only fails once
  `legal/entity.ts` declares `ENTITY_STATUS = 'FILLED'`.
