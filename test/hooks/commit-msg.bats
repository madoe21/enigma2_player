#!/usr/bin/env bats
# commit-msg: accept a Conventional Commit, reject anything else, never block a merge or a
# revert, and SAY SO when the bead-id library is missing instead of skipping in silence.
#
# Bead ids in the fixtures below are written as `bd-12` on purpose: a real-looking
# `<prefix>-xyz` in a test file is read as a reference by the hook that guards this repository
# (.claude/memory/conventions.md).

load helper

setup() { make_repo; }
teardown() { drop_repo; }

@test "commit-msg: a Conventional Commit is accepted" {
  stage a.txt hello
  run git commit -m "feat(site): add a thing (bd-12)"
  [ "$status" -eq 0 ]
}

@test "commit-msg: a subject that is not a Conventional Commit is rejected, with the rule" {
  stage a.txt hello
  run git commit -m "added a thing"
  [ "$status" -ne 0 ]
  contains "not a Conventional Commit"
  contains "Expected: <type>(<scope>): <subject>"
  # and nothing was committed
  run git log --oneline
  [ "$status" -ne 0 ]
}

@test "commit-msg: a known type without a scope is accepted" {
  stage a.txt hello
  run git commit -m "docs: explain the hook"
  [ "$status" -eq 0 ]
}

@test "commit-msg: a breaking-change marker is accepted" {
  stage a.txt hello
  run git commit -m "refactor(api)!: drop the v1 endpoint"
  [ "$status" -eq 0 ]
}

@test "commit-msg: a scope may contain a dot or a slash (aiflow-l40)" {
  stage a.txt hello
  run git commit -m "docs(.aiflow): describe the model"
  [ "$status" -eq 0 ]
  stage b.txt hello
  run git commit -m "feat(api/v2): add the endpoint"
  [ "$status" -eq 0 ]
}

@test "commit-msg: an unknown type is rejected" {
  stage a.txt hello
  run git commit -m "feature(site): wrong type word"
  [ "$status" -ne 0 ]
  contains "not a Conventional Commit"
}

@test "commit-msg: a type with no subject text is rejected" {
  stage a.txt hello
  run git commit -m "fix: "
  [ "$status" -ne 0 ]
}

@test "commit-msg: git's own merge subject is let through" {
  stage a.txt hello
  git commit -q -m "chore: base"
  git checkout -q -b side
  stage b.txt side
  git commit -q -m "chore: on the side"
  git checkout -q main
  stage c.txt main
  git commit -q -m "chore: on main"
  run git merge --no-ff -m "Merge branch 'side'" side
  [ "$status" -eq 0 ]
  run git log -1 --format=%s
  [ "$output" = "Merge branch 'side'" ]
}

@test "commit-msg: a revert subject is let through" {
  stage a.txt hello
  git commit -q -m "chore: base"
  run git revert --no-edit HEAD
  [ "$status" -eq 0 ]
}

@test "commit-msg: the bead-id check says so when its library is missing" {
  rm -f "$TEST_REPO/.githooks/lib-bead-ids.sh"
  stage a.txt hello
  run git commit -m "chore: no library around"
  [ "$status" -eq 0 ]
  contains "no lib-bead-ids.sh"
  contains "bead ids NOT checked"
}

@test "commit-msg: with the library present it says nothing about it" {
  stage a.txt hello
  run git commit -m "chore: library is there (bd-12)"
  [ "$status" -eq 0 ]
  lacks "bead ids NOT checked"
}

@test "commit-msg: AIFLOW_SKIP_COMMIT_LINT=1 bypasses the check" {
  stage a.txt hello
  run env AIFLOW_SKIP_COMMIT_LINT=1 git commit -m "not conventional at all"
  [ "$status" -eq 0 ]
}
