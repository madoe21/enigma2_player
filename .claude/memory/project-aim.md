# Project aim

**Goal:** Sell the *Enigma2 Player* desktop client from a product page that is cheap to host,
honest about what it loads, and usable by someone who cannot see it. This repository is the
**website**, in de/en/es/fr/it — the Flutter application itself lives in the private sibling
repository `madoe21/enigma2_player_source`. Buying and account management stay the licence
server's job, framed here in an iframe and blocked until consent exists. The site is not
versioned and stays at 1.0.0.

**Target architecture:** Angular 22, standalone + signals, **prerendered to static HTML** (66
routes) on GitHub Pages under `/enigma2_player/`. Content and release data are baked in at build
time by `site/tool/*.mjs`; there is **no runtime I/O** — no HTTP client, no `fetch` from the
browser — so the pages work with JavaScript off and send nothing to a third party before consent.
Layers: `pages/` + `shell/` → `consent/` · `legal/` · `i18n/` → `content/`, dependencies inward.
No database, no DAO, no DTO layer, no project error type: absent data is a *state*, not an error.
Binding form in `AGENTS.md §2b` + `docs/adr/0004-site-architecture-rules.md`; adding a store or a
runtime call needs a superseding ADR.

**Quality bar:** every page complete in its prerendered HTML in all five languages, WCAG 2.2 AA
(axe-core over all 66 pages in both consent states, keyboard-only with visible focus, NVDA pass
manual — `enigma2_player-iaa`), no reader-visible text outside `content/ui.ts` / `content.ts`,
`strict` + `strictTemplates` on, zero lint/format findings from the one root Prettier.

(Keep this current. Agents read it every session. Detailed view: docs/architecture/arc42.md.)
