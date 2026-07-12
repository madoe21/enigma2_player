# Conventions — as observed in the code (onboarder, 2026-07-06)

Match these when writing code here; they follow Google TS style.

## Language & formatting

- TypeScript strict, ESM (`"type": "module"`). 2-space indent, single quotes,
  no space inside braces in imports/objects (`{defineConfig}`), semicolons,
  ~80-col lines, trailing commas in multiline literals.
- Naming: `lowerCamelCase` functions/vars, `PascalCase` types/interfaces and
  `.astro` components, `SCREAMING_SNAKE` module constants (`API_BASE`).
- Every exported symbol has a `/** JSDoc */` — one-liners for simple functions;
  comments explain *why* (often referencing bead ids like `(#13)`).

## Astro patterns

- Pages are **thin wrappers**: frontmatter imports `Base` + one shared content
  component, `useTranslations(lang)` for the title, done. Content is written
  once per section in `src/components/`, parameterised by `lang` prop.
- Interactivity = plain inline `<script>` in the component (vanilla DOM:
  `getElementById`, `data-*` attributes, `hidden` attr toggling) — **no client
  framework, no external JS deps**. Server-rendered translated strings are
  passed to scripts via a frontmatter `messages` object.
- Styling: scoped `<style>` per component + small global block in
  `Base.astro`; system font stack, `color-scheme: light dark`.
- Accessibility touches present: `role="status"` + `aria-live="polite"` for
  async messages, `role="tablist"`/`aria-selected` for tabs, proper
  `autocomplete` on auth inputs. Keep that bar.

## i18n rules

- Never hardcode user-facing strings — add keys to `src/i18n/ui.ts` (short) or
  `content.ts` (long-form) in all three locales (de mandatory; en/es may fall
  back).
- Never hand-build URLs/asset paths — use `href(key, lang)` and `asset(path)`
  from `i18n/utils.ts` (they encode base path `/enigma2_player` + locale
  prefix rules).

## API / security

- All license-server traffic goes through `src/lib/licenseApi.ts` — never
  `fetch` the API from a component directly.
- No secrets in the browser: only `PUBLIC_*` build-time env vars; session
  tokens in memory only (no localStorage/cookies). Errors as
  `ApiError(status, message)`; UI shows translated notes.
- Everything must degrade gracefully when `PUBLIC_LICENSE_API_BASE` /
  `PUBLIC_APP_API_KEY` are unset (render a note, don't break).

## Repo/process

- Conventional Commits + bead id, e.g. `feat(site): buy flow (#12)`; beads
  (`bd`) for all tracking; branching per `docs/branching.md`.
- Verify before done: `npm run check` (astro check) + `npm run build`.
  No lint/test scripts exist yet.
