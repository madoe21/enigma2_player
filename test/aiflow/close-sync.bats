#!/usr/bin/env bats
# .aiflow/bd-close-sync.sh - the sync gate AGENTS.md §4 step 9 runs after every `bd close`
# (enigma2_player-p6p).
#
# What these cases exist to rule out is one specific outcome: the script reporting "done."
# over a sync that did not happen. Every branch below therefore asserts on BOTH sides - what
# the script said, and what the remote and the work tree actually look like afterwards.

load helper

setup() { make_sync_repo; }
teardown() { drop_repo; }

@test "close-sync: a clean branch is rebased and pushed, and says done" {
  answers y n
  write_file "$TEST_REPO/work/new.txt" new
  git add -A
  git commit -qm "local work"

  run_sync

  [ "$status" -eq 0 ]
  contains "done."
  run origin_log
  contains "local work"
}

@test "close-sync: a branch carrying a merge commit survives the pull - the 2026-10-13 case" {
  branch_with_a_merge_commit
  answers y n

  run_sync

  [ "$status" -eq 0 ]
  contains "done."
  mid_rebase && {
    echo "left mid-rebase: $output" >&2
    return 1
  }
  # the merge is still a merge, and main's deletion was not undone by the replay
  run git -C "$TEST_REPO/work" log --format=%p -1 "HEAD^"
  [ "$(printf '%s' "$output" | wc -w)" -eq 2 ]
  [ ! -e "$TEST_REPO/work/wf.yml" ]
  run origin_log task
  contains "work after the merge"
}

@test "close-sync: a conflicting pull stops the push, explains itself, and does NOT say done" {
  upstream_moved_with_a_conflict
  answers y n

  run_sync

  [ "$status" -eq 1 ]
  lacks "done."
  contains "NOT pushing"
  contains "git rebase --abort"
  # the conflicting local commit never reached the remote
  run origin_log
  lacks "we edit base.txt too"
}

@test "close-sync: the conflict is reported, not swallowed into /dev/null" {
  upstream_moved_with_a_conflict
  answers y n

  run_sync

  [ "$status" -eq 1 ]
  contains "CONFLICT"
}

@test "close-sync: answering no pushes nothing at all" {
  answers n n
  write_file "$TEST_REPO/work/new.txt" new
  git add -A
  git commit -qm "local work that must stay local"

  run_sync

  [ "$status" -eq 0 ]
  contains "done."
  run origin_log
  lacks "local work that must stay local"
}

@test "close-sync: with no answer available it assumes no rather than pushing" {
  write_file "$TEST_REPO/work/new.txt" new
  git add -A
  git commit -qm "unconfirmed work"
  # no terminal, no answers file: the old script fell through to the [y] default and pushed
  export AIFLOW_SYNC_TTY="$TEST_REPO/definitely-not-there"

  run bash -c 'exec </dev/null; bash .aiflow/bd-close-sync.sh bead-under-test'

  [ "$status" -eq 0 ]
  contains "assuming no"
  run origin_log
  lacks "unconfirmed work"
}

@test "close-sync: with no terminal the answers are taken from stdin" {
  write_file "$TEST_REPO/work/new.txt" new
  git add -A
  git commit -qm "work answered for on a pipe"
  # An unopenable primary source, which is what /dev/tty IS inside a pipeline, a hook and CI -
  # it exists, `[ -r ]` says yes, and the open fails. Pointed at a missing path rather than at
  # /dev/tty itself because on a developer's machine /dev/tty opens fine and this case would
  # then sit waiting for a human (§7a). The answers on stdin must be used rather than
  # discarded, and no `3: Bad file descriptor` may reach the operator.
  export AIFLOW_SYNC_TTY="$TEST_REPO/no-such-device"

  run bash -c "printf 'y\nn\n' | bash .aiflow/bd-close-sync.sh bead-under-test"

  [ "$status" -eq 0 ]
  contains "done."
  lacks "Bad file descriptor"
  run origin_log
  contains "work answered for on a pipe"
}

@test "close-sync: a failed dolt pull skips the dolt push instead of clobbering it" {
  stub_bd pull-fails
  answers n y

  run_sync

  [ "$status" -eq 1 ]
  lacks "done."
  contains "NOT pushing"
  run bd_calls
  contains "dolt pull"
  lacks "dolt push"
}

@test "close-sync: a rejected git push is reported and does not say done" {
  origin_rejects_pushes
  answers y n
  write_file "$TEST_REPO/work/new.txt" new
  git add -A
  git commit -qm "work the remote will refuse"

  run_sync

  [ "$status" -eq 1 ]
  lacks "done."
  contains "git push failed"
  run origin_log
  lacks "work the remote will refuse"
}

@test "close-sync: a working dolt pull is followed by the push" {
  answers n y

  run_sync

  [ "$status" -eq 0 ]
  contains "done."
  run bd_calls
  contains "dolt pull"
  contains "dolt push"
}

@test "close-sync: a rejected dolt push is reported and does not say done" {
  stub_bd push-fails
  answers n y

  run_sync

  [ "$status" -eq 1 ]
  lacks "done."
  contains "bd dolt push failed"
  run bd_calls
  contains "dolt pull"
  contains "dolt push"
}

@test "close-sync: sync-on-close disabled in the config stops before touching anything" {
  printf '%s\n' '{"sync":{"askOnClose":false},"remote":{"type":"github"}}' > .aiflow/config.json
  answers y y
  write_file "$TEST_REPO/work/new.txt" new
  git add -A
  git commit -qm "must stay local"

  run_sync

  [ "$status" -eq 0 ]
  contains "sync-on-close disabled"
  run origin_log
  lacks "must stay local"
}

@test "close-sync: remote type none stops before touching anything" {
  printf '%s\n' '{"sync":{"askOnClose":true},"remote":{"type":"none"}}' > .aiflow/config.json
  answers y y
  write_file "$TEST_REPO/work/new.txt" new
  git add -A
  git commit -qm "must stay local"

  run_sync

  [ "$status" -eq 0 ]
  contains "nothing to sync"
  run origin_log
  lacks "must stay local"
}
