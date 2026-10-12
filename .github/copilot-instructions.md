# Copilot instructions

Code only, no explanation unless asked. Bullets over paragraphs. Keep responses terse — every
token here and in every reply is billed on every agent step.

Read **`AGENTS.md`** in the repo root before making any change — it is the single, agent-agnostic
source of truth for this project (code style, quality gates, task workflow via Beads, git/branching
rules, definition of done). Sections marked "(Claude Code only)" describe automation you don't
have (subagents, slash-commands, hooks) — follow the same rules and steps manually instead.

Key points from `AGENTS.md` that apply directly to you:
- Work is tracked in Beads (`bd`) — check `bd ready`, claim with `bd update <id> --claim`, close
  with `bd close <id> --reason "…"`. Don't invent your own TODO list.
- Follow the branching model in `docs/branching.md` / `.aiflow/branching.json` — model `simple`:
  permanent `main` + `develop`, one branch type `chore/*`, merges `develop → main`,
  `main → develop`, `chore/* → develop`, `chore/* → main`. No `feature/*`, `bugfix/*` or
  `hotfix/*`, and no `VERSION` file — see `AGENTS.md` §7.
- **Nothing enforces that mechanically here**: the `pre-push` branching checks are switched off by
  the model file and neither branch has GitHub protection, so a push to `main` succeeds and
  deploys the live site. Never merge into `main` without the user's explicit go-ahead for that
  merge. `aiflow release` is not used in this repository; the `v*` tags are the application's.
- Google Style Guides for code, mandatory tests (unit + BDD e2e, >80% coverage), no code smells,
  logging, `.http` files for REST changes — see `AGENTS.md` §3/§3a/§3b/§3c for the full detail.
- Respect `AGENTS.md` §2 architecture rules — layering with inward dependencies, interfaces at
  every seam, DAO for data access, DTO on the wire, domain objects never leaving the domain. §2b
  then says what **this** project has: a static site with no runtime I/O, so there is no store, no
  DAO and no runtime DTO layer, and adding one needs an ADR superseding
  `docs/adr/0004-site-architecture-rules.md`. A task that doesn't fit is **not** built as-is: ask
  first, record the answer.
- Before adding new code/dependencies/abstractions, check `.claude/skills/ponytail/SKILL.md`'s
  decision ladder (needed? already in the codebase? stdlib? platform feature? installed dep? a
  one-liner? only then write it) if `ponytail.enabled` is set in `.aiflow/config.json` — see
  `AGENTS.md` §5/§9.
- Copilot has no skill auto-offer: **open the matching `.claude/skills/<name>/SKILL.md` yourself**
  when the task fits it — `stack-embedded`, `stack-mobile`, `stack-web-frontend`, `stack-backend`,
  `api-design`, `messaging-events`, `data-storage`, `cloud-native`, `security`, `seo-optimization`.
  They are checklists, not reading material; the "typical findings" list at the end is the fastest
  way to use one.

**Token discipline** (this file and `AGENTS.md` are always-on context, billed every step —
see the [Copilot token-optimization guide](https://github.com/olivomarco/github-copilot-token-optimization)):
- Keep this file and `AGENTS.md` to landmines only — non-obvious rules an agent would otherwise
  get wrong. Delete anything discoverable by reading the code; never let generated boilerplate
  accumulate here.
- Default to **Auto** model selection; once in a long thread, keep the model, reasoning effort,
  and tool/MCP set stable — changing any of them discards the cached prompt prefix and the
  cache-discount pricing that comes with it. Start a fresh chat with a short handoff summary
  instead of switching mid-thread.
- On a large repo, prefer scoping additional instructions with `applyTo:` paths over growing this
  file further.
