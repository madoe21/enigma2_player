#!/usr/bin/env bats
# pre-push enforces the branching governance model (.aiflow/branching.json). Every case pushes
# into a bare repository next door, so the hook gets its ref lines from git on stdin the way it
# does in anger - called by hand with invented arguments it would prove nothing.
#
# Without jq the hook exits 0 by design, which would make every case below pass without testing
# anything. That is announced as a skip rather than taken as a green.

load helper

setup() {
  make_repo
  add_origin
  stage a.txt hello
  git commit -q -m "chore: base commit"
}

teardown() { drop_repo; }

need_jq() {
  command -v jq >/dev/null 2>&1 || skip "no jq - pre-push exits 0 without it, so nothing would be tested"
}

@test "pre-push: with no branching model the hook stays out of the way" {
  run git push origin HEAD:refs/heads/main
  [ "$status" -eq 0 ]
}

@test "pre-push: PR-only refuses a direct push to a protected branch" {
  need_jq
  branching_model '{ "permanentBranches": ["main", "develop"], "branchTypes": [], "pullRequests": { "required": true } }'
  run git push origin HEAD:refs/heads/develop
  [ "$status" -ne 0 ]
  contains "direct push to protected branch 'develop' is not allowed"
  # and the remote really does not have it
  run git --git-dir="$TEST_REPO/origin.git" rev-parse --verify develop
  [ "$status" -ne 0 ]
}

@test "pre-push: PR-only leaves a topic branch alone" {
  need_jq
  branching_model '{ "permanentBranches": ["main", "develop"], "branchTypes": [], "pullRequests": { "required": true } }'
  run git push origin HEAD:refs/heads/task/vmk-something
  [ "$status" -eq 0 ]
}

@test "pre-push: strict naming refuses a branch matching no allowed type" {
  need_jq
  branching_model '{ "permanentBranches": ["main", "develop"], "branchTypes": ["feature/*", "chore/*"], "branchNaming": "enforced" }'
  run git push origin HEAD:refs/heads/my-branch
  [ "$status" -ne 0 ]
  contains "does not match an allowed type"
}

@test "pre-push: strict naming accepts an allowed type" {
  need_jq
  branching_model '{ "permanentBranches": ["main", "develop"], "branchTypes": ["feature/*", "chore/*"], "branchNaming": "enforced" }'
  run git push origin HEAD:refs/heads/chore/tidy-up
  [ "$status" -eq 0 ]
}

@test "pre-push: a -SNAPSHOT version must not reach main" {
  need_jq
  branching_model '{ "permanentBranches": ["main"], "branchTypes": [] }'
  stage VERSION "1.4.0-SNAPSHOT"
  git commit -q -m "chore: open the next version"
  run git push origin HEAD:refs/heads/main
  [ "$status" -ne 0 ]
  contains "SNAPSHOT must never land on main"
}

@test "pre-push: a -HOTFIX version must not reach main" {
  need_jq
  branching_model '{ "permanentBranches": ["main"], "branchTypes": [] }'
  stage VERSION "1.3.1-HOTFIX"
  git commit -q -m "chore: start the hotfix"
  run git push origin HEAD:refs/heads/main
  [ "$status" -ne 0 ]
  contains "HOTFIX must never land on main"
}

@test "pre-push: a released version reaches main" {
  need_jq
  branching_model '{ "permanentBranches": ["main"], "branchTypes": [] }'
  stage VERSION "1.4.0"
  git commit -q -m "chore: release 1.4.0"
  run git push origin HEAD:refs/heads/main
  [ "$status" -eq 0 ]
}

@test "pre-push: a merge of a forbidden branch into main is refused" {
  need_jq
  branching_model '{ "permanentBranches": ["main"], "branchTypes": [], "mainRestricted": { "forbidden": ["feature/*", "bugfix/*"] } }'
  git push -q origin HEAD:refs/heads/main
  git checkout -q -b feature/x
  stage f.txt feature
  git commit -q -m "feat(x): something"
  git checkout -q main
  git merge -q --no-ff -m "Merge branch 'feature/x'" feature/x
  run git push origin HEAD:refs/heads/main
  [ "$status" -ne 0 ]
  contains "merge of 'feature/x' into main is not allowed"
}

@test "pre-push: a merge of develop into main is allowed" {
  need_jq
  branching_model '{ "permanentBranches": ["main"], "branchTypes": [], "mainRestricted": { "forbidden": ["feature/*", "bugfix/*"] } }'
  git push -q origin HEAD:refs/heads/main
  git checkout -q -b develop
  stage d.txt develop
  git commit -q -m "feat(d): something"
  git checkout -q main
  git merge -q --no-ff -m "Merge branch 'develop'" develop
  run git push origin HEAD:refs/heads/main
  [ "$status" -eq 0 ]
}

@test "pre-push: AIFLOW_ALLOW_DIRECT_PUSH=1 bypasses the model" {
  need_jq
  branching_model '{ "permanentBranches": ["main", "develop"], "branchTypes": [], "pullRequests": { "required": true } }'
  run env AIFLOW_ALLOW_DIRECT_PUSH=1 git push origin HEAD:refs/heads/develop
  [ "$status" -eq 0 ]
}

@test "pre-push: this project's own branching model parses and permits its own branches" {
  need_jq
  mkdir -p "$TEST_REPO/.aiflow"
  cp "$REPO_ROOT/.aiflow/branching.json" "$TEST_REPO/.aiflow/branching.json"
  run git push origin HEAD:refs/heads/chore/some-task
  [ "$status" -eq 0 ]
  lacks "error"
}
