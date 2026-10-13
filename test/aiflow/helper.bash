#!/usr/bin/env bash
# Shared setup for the .aiflow script tests (enigma2_player-p6p).
#
# Every case runs in a THROWAWAY work tree with its own bare origin under $TMPDIR, and with a
# STUBBED `bd` first on PATH. Both are load-bearing rather than tidiness: bd-close-sync.sh
# ends in `git push` and `bd dolt push`, so a case that ran against the real repository or the
# real issue database would publish whatever the test happened to build.
#
# The generic assertions come from the hook suite's helper instead of being written twice
# (AGENTS.md §3a: no new duplication). Sourcing it only defines functions and two paths -
# nothing in it runs until a hook test calls it.

# shellcheck source=../hooks/helper.bash
. "$BATS_TEST_DIRNAME/../hooks/helper.bash"

# Overridable for the same reason the hook suite's HOOKS_SRC is: pointing it at a deliberately
# broken copy and demanding the suite go red is the only way to show these cases detect
# anything. The pre-fix script is kept at test/aiflow/regressions/ for exactly that.
SYNC_SRC="${SYNC_SRC:-$REPO_ROOT/.aiflow/bd-close-sync.sh}"

# need_jq - bd-close-sync.sh reads .aiflow/config.json through jq, and without jq it takes the
# "sync-on-close disabled" exit at the top. Every case below would then pass while testing
# nothing, so the reason is named as a skip instead.
need_jq() {
  command -v jq >/dev/null 2>&1 || skip "bd-close-sync.sh needs jq to read .aiflow/config.json"
}

# stub_bd <ok|pull-fails|push-fails> - a `bd` on PATH that records every call in
# $TEST_REPO/bd-calls.
stub_bd() {
  local mode="$1"
  mkdir -p "$TEST_REPO/.bin"
  cat > "$TEST_REPO/.bin/bd" <<STUB
#!/usr/bin/env bash
printf '%s\n' "\$*" >> "$TEST_REPO/bd-calls"
if [ "$mode" = pull-fails ] && [ "\$1 \$2" = "dolt pull" ]; then
  echo "bd: the issue database has a conflict" >&2
  exit 1
fi
if [ "$mode" = push-fails ] && [ "\$1 \$2" = "dolt push" ]; then
  echo "bd: the remote rejected the push" >&2
  exit 1
fi
exit 0
STUB
  chmod +x "$TEST_REPO/.bin/bd"
}

# origin_rejects_pushes - the remote refuses what it is sent while still serving fetches, which
# is what a protected branch, a full disk or a revoked token look like from here. A server-side
# hook is the only way to get that shape without a server: pointing the remote somewhere
# unreachable would fail the pull too, and then the case would be measuring the wrong branch.
origin_rejects_pushes() {
  printf '%s\n' '#!/bin/sh' 'echo "remote: refusing this push" >&2' 'exit 1' \
    > "$TEST_REPO/origin.git/hooks/pre-receive"
  chmod +x "$TEST_REPO/origin.git/hooks/pre-receive"
}

# make_sync_repo - a work tree on `main`, pushed to a bare origin, carrying the script under
# test and the config that enables it.
make_sync_repo() {
  need_jq
  [ -n "${TEST_REPO:-}" ] && drop_repo
  TEST_REPO="$(mktemp -d)"

  # The machine's own git configuration is kept out, for the reason the hook suite gives: a
  # global autocrlf, hooksPath or commit.gpgsign would otherwise decide what these measure.
  : > "$TEST_REPO/.gitconfig-none"
  export GIT_CONFIG_GLOBAL="$TEST_REPO/.gitconfig-none"
  export GIT_CONFIG_SYSTEM="$TEST_REPO/.gitconfig-none"

  git init -q --bare "$TEST_REPO/origin.git"
  mkdir -p "$TEST_REPO/work"
  cd "$TEST_REPO/work" || return 1
  git init -q -b main .
  git config user.name "Sync Test"
  git config user.email "sync@example.invalid"
  git config commit.gpgsign false
  git remote add origin "$TEST_REPO/origin.git"

  mkdir -p .aiflow
  cp "$SYNC_SRC" .aiflow/bd-close-sync.sh
  cp "$REPO_ROOT/.aiflow/bd-close-sync.ps1" .aiflow/bd-close-sync.ps1
  printf '%s\n' '{"sync":{"askOnClose":true},"remote":{"type":"github"}}' > .aiflow/config.json
  write_file base.txt base
  git add -A
  git commit -qm "base"
  git push -q -u origin main
  # `git init --bare` leaves HEAD on `master`; without this a clone of the origin checks out
  # a branch that does not exist and lands on an empty tree.
  git --git-dir="$TEST_REPO/origin.git" symbolic-ref HEAD refs/heads/main

  stub_bd ok
  export PATH="$TEST_REPO/.bin:$PATH"
}

# answers <line>... - what the prompts are told, one answer per line. Pointing the script's
# answer source at a file is the only deterministic option: whether /dev/tty is readable
# differs between a developer's terminal, bats, and a CI runner, and a case that guesses wrong
# does not fail - it waits forever.
answers() {
  printf '%s\n' "$@" > "$TEST_REPO/answers"
  export AIFLOW_SYNC_TTY="$TEST_REPO/answers"
}

# ps_invocation <script> <arg> - the command line for running a .ps1, or failure when this
# machine has no PowerShell (then the case says `skip` with the reason instead of passing
# quietly). `-ExecutionPolicy` exists only on Windows PowerShell - pwsh on a Linux runner
# rejects it - so it is added per binary rather than written into the case.
ps_invocation() {
  local ps policy=""
  for ps in powershell pwsh; do
    command -v "$ps" >/dev/null 2>&1 && break
    ps=""
  done
  [ -n "$ps" ] || return 1
  [ "$ps" = powershell ] && policy=" -ExecutionPolicy Bypass"
  printf 'MSYS_NO_PATHCONV=1 %s -NoProfile%s -File %s %s' "$ps" "$policy" "$1" "$2"
}

# run_sync - the script under test, from the work tree, the way the rule invokes it.
#
# The placeholder id deliberately does NOT carry this project's bead prefix. `pre-commit` greps
# staged content for `<prefix>-[a-z0-9]{3}` and warns about ids the issue DB does not know
# (.githooks/lib-bead-ids.sh), so a fixture written as `<this project's prefix>-test` makes every
# future commit that touches these files report an invented bead - a false positive in exactly
# the check meant to catch real typos. Which is how this comment is worded too: spelling the id
# out here would trip the same warning from the line explaining it.
run_sync() {
  run bash .aiflow/bd-close-sync.sh "${1:-bead-under-test}"
}

# bd_calls - every `bd` invocation the run made, one per line (empty if none).
bd_calls() {
  cat "$TEST_REPO/bd-calls" 2>/dev/null || true
}

# mid_rebase - whether the work tree was left in the middle of a rebase. Git keeps either
# directory depending on the backend, so both are checked.
mid_rebase() {
  [ -d "$TEST_REPO/work/.git/rebase-merge" ] || [ -d "$TEST_REPO/work/.git/rebase-apply" ]
}

# origin_log - the subjects origin actually received, newest first.
origin_log() {
  git --git-dir="$TEST_REPO/origin.git" log --format=%s "${1:-main}" 2>/dev/null || true
}

# upstream_moved_with_a_conflict - someone else pushed a change to the same line, so the next
# pull cannot rebase cleanly whatever the flag.
upstream_moved_with_a_conflict() {
  git -C "$TEST_REPO/work" show -q --format=%H HEAD > /dev/null
  local other="$TEST_REPO/other"
  git clone -q "$TEST_REPO/origin.git" "$other"
  git -C "$other" config user.name "Someone Else"
  git -C "$other" config user.email "else@example.invalid"
  git -C "$other" config commit.gpgsign false
  printf 'theirs\n' > "$other/base.txt"
  git -C "$other" commit -qam "upstream edits base.txt"
  git -C "$other" push -q origin main
  # ...and our side edits the same line, so the replay collides.
  printf 'ours\n' > "$TEST_REPO/work/base.txt"
  git -C "$TEST_REPO/work" commit -qam "we edit base.txt too"
}

# branch_with_a_merge_commit - the shape that broke on 2026-10-13: a branch whose upstream is
# itself, which updated from main by MERGING, where main had deleted a file the branch had
# modified. Plain `git pull --rebase` replays the merged side commit by commit and hits a
# modify/delete conflict every time; `--rebase=merges` recreates the merge and rebases clean.
branch_with_a_merge_commit() {
  local w="$TEST_REPO/work"
  write_file "$w/wf.yml" keep
  git -C "$w" add -A
  git -C "$w" commit -qm "a workflow file on main"
  git -C "$w" push -q origin main

  git -C "$w" checkout -q -b task
  write_file "$w/wf.yml" modified
  git -C "$w" commit -qam "the task branch edits the workflow file"
  git -C "$w" push -q -u origin task

  # main deletes the file the branch just edited
  git -C "$w" checkout -q main
  git -C "$w" rm -q wf.yml
  git -C "$w" commit -qm "main deletes the workflow file"
  git -C "$w" push -q origin main

  # the branch takes the deletion by merging, which is the allowed way to update it
  git -C "$w" checkout -q task
  git -C "$w" merge main -m "merge main into task" > /dev/null 2>&1 || {
    git -C "$w" rm -q -f wf.yml
    git -C "$w" commit -qm "merge main into task"
  }
  write_file "$w/after.txt" after
  git -C "$w" add -A
  git -C "$w" commit -qm "work after the merge"
}
