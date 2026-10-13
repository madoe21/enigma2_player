# Agent script tests

`.aiflow/bd-close-sync.sh` — the sync gate `AGENTS.md` §4 step 9 tells every agent to run after
`bd close` — under [bats](https://github.com/bats-core/bats-core), one case per branch
(`enigma2_player-p6p`).

```bash
npm run test:aiflow   # the suite (13 cases)

# the same suite against the version that shipped the defect: 8 of the 13 must go red
SYNC_SRC="$PWD/test/aiflow/regressions/bd-close-sync.pre-p6p.sh" npx bats test/aiflow
```

Every case runs in a throwaway repository under `$TMPDIR`, with its own bare origin and a stubbed
`bd` first on `PATH`. That is not tidiness: this script ends in `git push` and `bd dolt push`, so a
case that ran against the real checkout would publish whatever the test happened to build, and one
that ran against the real issue database would push it. The script is copied in from `.aiflow/` —
`$SYNC_SRC` overrides that, which is how the saved pre-fix copy in `regressions/` gets exercised.

**What the cases are for.** One outcome: the script printing `done.` over a sync that did not
happen. Each case therefore asserts on both sides — what the script said, and what the origin and
the work tree actually look like afterwards. The three defects they pin down, all live at once
until 2026-10-13:

- `git pull --rebase` **flattens merge commits**, so a `task/*` branch that had updated itself by
  merging `main` got the merged side replayed commit by commit and landed in a modify/delete
  conflict mid-rebase. `--rebase=merges` recreates the merge and the same branch rebases cleanly;
  the case named "the 2026-10-13 case" builds exactly that shape.
- The failure was then **invisible**: `2>/dev/null || true` threw the conflict and the exit code
  away, `git push` ran against a repository sitting mid-rebase, and the script still said `done.`.
  The dolt half did the same thing one step worse — it reported the failed pull and pushed anyway,
  which is the clobbering its own comment says it exists to prevent.
- **No answer meant yes.** `read … || a=""` fell through to the `[y]` default, so a run with
  neither a terminal nor a readable stdin — CI, a headless Ralph loop, a hook — pushed without
  anyone being asked, in a script whose first line promises it never pushes silently.

**Why there is no `mutation-check.mjs` here.** The hook suite needs one because a hook branch that
does nothing is indistinguishable from one that passed. This script has a real previous version
that shipped all three defects, so the honest mutant already exists: `regressions/`
`bd-close-sync.pre-p6p.sh` is `git show`-n straight out of the commit before the fix. Running the
suite against it is the proof, and it is one command rather than a harness.

Answers are fed through `$AIFLOW_SYNC_TTY` (a file of one answer per line) rather than stdin:
whether `/dev/tty` is readable differs between a developer's terminal, bats, and a CI runner, and
a case that guesses wrong does not fail — it waits forever (§7a). The case that covers the
stdin fallback points `$AIFLOW_SYNC_TTY` at a missing path for the same reason — never at
`/dev/tty` itself, which opens fine on a developer's machine and would park the suite on a
prompt.

That fallback is itself a defect this suite was written too late for: `/dev/tty` **exists** in
Git Bash inside a pipeline and cannot be **opened**, so testing it with `[ -r ]` and then opening
it left fd 3 unborn and printed `3: Bad file descriptor` under both prompts. Each source is now
tried by opening it — `/dev/tty`, then stdin, then `/dev/null` — which is also what makes
`printf 'y\nn\n' | bash .aiflow/bd-close-sync.sh <bead>` work for a caller that has already
decided.

The suite needs `jq`, because the script reads `.aiflow/config.json` through it and takes the
"sync-on-close disabled" exit without it; a case that cannot be observed says so (`skip`) rather
than passing quietly. CI asserts `jq --version` before the step for that reason.

**Not covered: the PowerShell twin.** `.aiflow/bd-close-sync.ps1` carries the same three fixes and
no automated test — bats is bash. It was verified by hand against a throwaway repository instead
(headless: nothing pushed, "assuming no", exit 0; with `y` piped in: pushed). That asymmetry is
`enigma2_player-jjt`, and it points the wrong way: Windows is where the `.ps1` actually runs.
