# 3. The shop's public API key stays in the tracked site data

Date: 2026-10-12

## Status

Accepted. Decides `enigma2_player-9c9`, which the cutover (`enigma2_player-hsf.1`)
deliberately left open rather than settling it as a side effect of a refactor.

## Context

`site/src/app/content/site-data.json` is tracked and carries the licence server's
shop endpoint together with the application's product API key:

```json
"shop": { "base": "https://license-server-5d7i.onrender.com", "apiKey": "app_…" }
```

The Astro tree held the same value in a repository Actions variable
(`PUBLIC_APP_API_KEY`) and pulled it in at build time — that is what the
`PUBLIC_` prefix was for. The Angular tree reads the value out of the committed
file instead, because a static site's runtime is a browser and a browser has no
environment (`site/src/app/content/shop-config.ts`).

**What this key is.** It is a client-side key by design. It ends up in the
shipped JavaScript, every visitor can read it, and the same key ships inside
every build of the desktop application (`docs/architecture/anti-tamper-concept.md`
in the player repo states this). It is not a leaked server secret, and it was
equally public under Astro — an Actions variable hides a value from the
repository, not from the page it is rendered into.

**What tracking it costs anyway.** Rotation needs a commit and a deployment
rather than an edit in the repository settings, and the value stays in the git
history after a rotation — including if this repository is ever made public.

**Why it needed a decision at all.** `AGENTS.md §7` says never commit secrets.
A key that is published by design is an exception to that rule, and until now
the exception was nowhere written down. An undocumented exception is the one
that gets applied by accident to a real server key next time: the next reader
sees a credential sitting in a tracked file, no objection recorded anywhere, and
concludes that this repository tolerates it.

## Decision

**The key stays in the tracked `site-data.json`. No rotation.**

- The build needs no repository variables, so a clone builds the real site —
  `npm run build` after `git clone` produces the page that is deployed, not a
  degraded "shop not configured" variant.
- One source for all build-time data. Downloads, changelog, pricing and shop
  endpoint are regenerated together by `npm run data:refresh`; splitting one
  field back out into the deployment workflow would mean the deployed site is
  assembled from two places, only one of which is reviewable in a diff.
- Rotation being slower is acceptable for a value that is public by
  construction. There is no confidentiality to restore by rotating it.

**The scope of the exception, which is the part that binds:** it covers exactly
the keys the licence server publishes for client use. Anything that authenticates
a server — licence-server admin credentials, PayPal secrets, signing keys,
GitHub tokens — stays out of the tree under `AGENTS.md §7` without exception. The
test is not "is it low risk" but "is this value already in the hands of every
visitor by design". If the answer needs an argument, it is a no.

## Consequences

- `site-data.json` remains the single build-time config, readable in a diff, and
  CI stays free of secret plumbing for the site build.
- Rotating the product key is a `npm run data:refresh` plus a commit, and the old
  value stays in the history. Whoever rotates it does so because the licence
  server changed it, not to contain a leak.
- `AGENTS.md §7` now points here, so the rule and its one exception are found
  together.
- If the licence server ever issues a key that is *not* meant for clients, this
  ADR does not cover it and a new decision is required.
