# Hook tests

The three git hooks this repository ships — `commit-msg`, `pre-commit`, `pre-push` — under
[bats](https://github.com/bats-core/bats-core), one case per branch
(`enigma2_player-3c5`).

```bash
npm run test:hooks          # the suite (44 cases)
npm run test:hooks:mutate   # proves the suite notices defects (16 mutants, ~12 s)
npm run check:hooks         # .githooks/ and .beads/hooks/ must be byte-identical
```

Every case runs in a throwaway repository under `$TMPDIR`: the hooks are what is being
exercised, so a bug in them would otherwise land real commits here, and a suite that needs
the worktree in a particular state cannot run while somebody is working in it. The hooks are
copied in from `.githooks/` — `$HOOKS_SRC` overrides that, which is how the mutation check
points the same suite at a deliberately broken copy.

**Why the mutation check exists.** Nearly every branch of a hook ends in `exit 0`, so a check
that silently does nothing is indistinguishable from a check that passed — and this repository
has shipped that bug three times (`enigma2_player-aji`, `-38r`, `-puh`). A green hook suite is
therefore not evidence by itself. `mutation-check.mjs` breaks one branch of one hook in a temp
copy and runs the one test that should notice, by name; a mutant that survives names the
branch nobody is testing. Both halves run in CI (`.github/workflows/ci.yml`, job `verify`).

**Why there is no `npm test` script here.** `pre-commit` step 5 runs `npm test` whenever the
manifest has one, so wiring the suite to that name would spawn a throwaway repository per case
— around fifty — on every commit in this repository, each running these hooks again. The suite
belongs in CI and on demand.

A case that cannot be observed on the current machine says so (`skip`) rather than passing
quietly: the PATH-without-`node` branch needs real filesystem symlinks, which Git-Bash does
not provide, and `pre-push` is a no-op without `jq`. Both run on Linux in CI.
