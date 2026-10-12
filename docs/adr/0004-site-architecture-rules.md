# 4. Architecture rules for the product site (Rule zero)

Date: 2026-10-12

## Status

Accepted. Records the rules `AGENTS.md §2b` had left as template placeholders
(`enigma2_player-4y3`). Bound by [ADR 0002](0002-product-site-angular-prerender.md) (Angular 22,
prerendered) and by [ADR 0001](0001-static-site-astro.md), whose constraints survive its
supersession.

## Context

`AGENTS.md §2c` says a project without architecture rules gets them, and that a task which does
not fit the architecture is not implemented as-is — the agent stops and asks. Both ran idle here:
§2b still read `<dir> -> <dir> -> <dir>`, `Persistence: <db / ORM>`, `DAOs in <dir>`,
`Project error type: <...>`. There was nothing to measure a task against and nothing to violate.

The structure itself was never missing. It is documented in `docs/architecture/arc42.md` and in
`.claude/memory/codebase-map.md` + `conventions.md`, both derived from the code by the onboarder
(`enigma2_player-0ii`). What was missing is the *binding* form: a description can be ignored, a
rule in §2b cannot, and §2c only protects what is written there.

Three of §2a's seams genuinely do not exist in this codebase: there is no request, no data store
and no service call. Leaving those lines as placeholders was the dangerous part. An agent reading
`Persistence: <db / ORM>` either invents an answer or assumes the generic one — a repository
interface, a DTO mapper, a project error type — and every one of those would be dead abstraction
over a page that fetches nothing at runtime. The honest answer is "none, and here is what stands
in its place", which is also the answer that survives review.

## Decision

**The rules in `AGENTS.md §2b` are the recorded architecture, and they describe what the code does
today.** The full text lives there; this ADR states the parts that are decisions rather than
observations, because those are the ones a future change has to argue with:

- **One tree builds the site** (`site/`); the repository root is toolchain-only. Layers are
  `pages/` + `shell/` → `consent/` · `legal/` · `i18n/` → `content/`, dependencies inward, and
  `content`/`i18n` import nothing internal. `app.routes.ts` is a shared fact, not a layer.
- **No runtime I/O.** No HTTP client, no `fetch` from the browser. Data is baked in at build time
  by `tool/*.mjs` and committed. This is the property that makes the site work with JavaScript off
  and lets it load nothing from a third party before consent — it is a privacy and legal
  commitment, not a performance choice.
- **No persistence layer, and therefore no DAO.** The only client-side write is the consent
  cookie, and `consent/consent-store.ts` is the only code that performs it.
- **No DTO layer at runtime**, because nothing crosses a process boundary there. The single wire
  format is mapped once, at build time, in `tool/fetch-site-data.mjs`.
- **No project error type and no error layer.** Absent data is a state; untrusted input is parsed
  defensively; exactly one deliberate `throw` in the application code
  (`legal/legal-links.ts`, a legal link pointing at a route that no longer exists — a defect that
  must be loud); build tools exit non-zero rather than emit a half-built site. The second `throw`
  in the tree, `src/server.ts:56`, is the Angular scaffold's listen-error rethrow in the prerender
  entry, and nothing is deployed as a server.
- **Seams are substitutable by construction** — `SiteContent` over baked data, an `InjectionToken`
  for any module constant a test must swap, `PageBase` for anything page-shaped.
- **i18n and accessibility are structural, not cosmetic.** No reader-visible text in a template,
  languages named in exactly one file, URLs built by one helper, WCAG 2.2 AA enforced by axe-core
  over every page in both consent states.

**What this ADR forbids without a successor:** adding a database, an ORM, a DAO/repository layer,
a runtime HTTP client, or a project error hierarchy. Each of those is a change of kind, not of
degree: the first three give the site state it currently cannot have, the fourth ends the
"works without JavaScript, fetches nothing" property that the cookie policy promises in writing,
and the fifth replaces a deliberate absence with ceremony.

## Consequences

- A task that needs runtime data now has somewhere to collide: the agent stops and asks the PO
  instead of adding a `fetch` and moving on. That was the point of §2c and it now works here.
- The three "none" entries have to stay honest. If a later decision does introduce a store or a
  runtime call, this ADR is superseded explicitly — the §2b lines are not quietly edited, because
  a rule edited without a record is indistinguishable from a rule nobody followed.
- Nothing in the code changed to produce this ADR, so there is nothing to verify beyond the
  existing gates. The claim it makes about the code is checkable: `tsconfig` strictness, the
  absence of `HttpClient`, the single cookie writer and the one `throw` are all greppable.
- `.claude/memory/project-aim.md` carries the same aim as §1, because agents read the memory file
  before they read this repository's rules.
