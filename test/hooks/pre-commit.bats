#!/usr/bin/env bats
# pre-commit, step by step. Each case pins one branch of the hook, and each one is a defect
# this repository actually had: a formatter that silently did nothing (enigma2_player-38r), a
# roster guard that judged the worktree instead of the index (aiflow-5n9), a bead-id check that
# skipped itself in silence (enigma2_player-aji), two hook trees drifting apart unnoticed
# (enigma2_player-puh / -a3q), and `grep '"test"' package.json` blocking a commit over a
# DEPENDENCY named test (enigma2_player-nje).

load helper

setup() { make_repo; }
teardown() { drop_repo; }

# --- step 1: format staged files, then re-stage -------------------------------------------

@test "pre-commit: formats a staged file and re-stages the result" {
  stub_prettier
  stage x.md raw
  run git commit -m "chore: format me"
  [ "$status" -eq 0 ]
  run git show HEAD:x.md
  [ "$output" = "FORMATTED" ]
  run cat "$TEST_REPO/prettier-calls"
  contains "x.md"
}

@test "pre-commit: a file with unstaged changes is not formatted, and only its staged version is committed" {
  stub_prettier
  stage x.md staged-version
  write_file "$TEST_REPO/x.md" worktree-mess
  run git commit -m "chore: half-edited file"
  [ "$status" -eq 0 ]
  contains "x.md has unstaged changes - not formatted"
  run git show HEAD:x.md
  [ "$output" = "staged-version" ]
  # the worktree edit is still there, unformatted and uncommitted
  run cat "$TEST_REPO/x.md"
  [ "$output" = "worktree-mess" ]
}

@test "pre-commit: says once per commit that there is no project-local prettier" {
  if npx --no-install prettier --version >/dev/null 2>&1; then
    skip "a prettier resolves from outside this repository on this machine - the missing-prettier branch cannot be observed"
  fi
  stage one.md a
  stage two.md b
  run git commit -m "chore: two formattable files"
  [ "$status" -eq 0 ]
  contains "no project-local prettier"
  [ "$(occurrences "no project-local prettier")" -eq 1 ]
}

# --- step 2: agent roster guard, against the INDEX ----------------------------------------

@test "pre-commit: broken frontmatter in a staged agent file blocks the commit" {
  working_guard
  stage_agent bad
  run git commit -m "feat(agents): add a tester"
  [ "$status" -ne 0 ]
  contains "invalid frontmatter"
  contains "unquoted value containing"
  # the message names the file as it exists in the repository, not inside the temp checkout
  contains ".claude/agents/tester.md"
  lacks "aiflow-precommit"
}

@test "pre-commit: valid frontmatter in a staged agent file passes" {
  working_guard
  stage_agent good
  run git commit -m "feat(agents): add a tester"
  [ "$status" -eq 0 ]
}

@test "pre-commit: the guard judges the index - a staged fix passes while the worktree is broken" {
  working_guard
  stage_agent good
  write_agent bad
  run git commit -m "fix(agents): quote the description"
  [ "$status" -eq 0 ]
  run git show HEAD:.claude/agents/tester.md
  contains 'description: "two hats'
}

@test "pre-commit: the guard judges the index - a staged break fails while the worktree is fine" {
  working_guard
  stage_agent bad
  write_agent good
  run git commit -m "feat(agents): add a tester"
  [ "$status" -ne 0 ]
  contains "invalid frontmatter"
}

@test "pre-commit: says so when the frontmatter guard cannot run" {
  install_guard
  # An interpreter that fails --selftest is the same branch as no interpreter at all, and it is
  # the one that can be provoked on every platform.
  printf 'import sys\nsys.exit(1)\n' > "$TEST_REPO/.github/scripts/check-frontmatter.py"
  stage_agent bad
  run git commit -m "feat(agents): add a tester"
  [ "$status" -eq 0 ]
  contains "skipping the frontmatter guard"
}

@test "pre-commit: a file outside the roster directories does not invoke the guard" {
  install_guard
  stage notes.txt hello
  run git commit -m "chore: unrelated file"
  [ "$status" -eq 0 ]
  lacks "frontmatter"
}

# --- step 3: bead ids in the added lines --------------------------------------------------

@test "pre-commit: says so when lib-bead-ids.sh is in neither location" {
  rm -f "$TEST_REPO/.githooks/lib-bead-ids.sh"
  stage a.txt hello
  run git commit -m "chore: no library around"
  [ "$status" -eq 0 ]
  contains "no lib-bead-ids.sh"
  contains "bead ids NOT checked"
}

# --- step 4: the two hook trees must not drift apart --------------------------------------

@test "pre-commit: identical hook trees are not reported" {
  make_repo .beads/hooks
  stage a.txt hello
  run git commit -m "chore: nothing to do with hooks"
  [ "$status" -eq 0 ]
  lacks "hook copies disagree"
}

@test "pre-commit: divergent hook trees warn, but let an unrelated commit through" {
  make_repo .beads/hooks
  printf '# appended into the running copy\n' >> "$TEST_REPO/.beads/hooks/pre-commit"
  stage a.txt hello
  run git commit -m "chore: nothing to do with hooks"
  [ "$status" -eq 0 ]
  contains "hook copies disagree: pre-commit"
  contains "copy the intended version over the other"
}

@test "pre-commit: divergent hook trees stop a commit that changes a hook" {
  make_repo .beads/hooks
  printf '# edited in the template only\n' >> "$TEST_REPO/.githooks/pre-push"
  git add -- .githooks/pre-push
  run git commit -m "fix(hooks): edit one copy only"
  [ "$status" -ne 0 ]
  contains "hook copies disagree: pre-push"
  contains "this commit changes a hook and the two copies disagree"
}

@test "pre-commit: reconciling the copies lets the hook change commit" {
  make_repo .beads/hooks
  printf '# edited in both copies\n' >> "$TEST_REPO/.githooks/pre-push"
  cp "$TEST_REPO/.githooks/pre-push" "$TEST_REPO/.beads/hooks/pre-push"
  git add -- .githooks/pre-push .beads/hooks/pre-push
  run git commit -m "fix(hooks): edit both copies"
  [ "$status" -eq 0 ]
  lacks "hook copies disagree"
}

@test "pre-commit: a missing running copy counts as drift" {
  make_repo .beads/hooks
  rm -f "$TEST_REPO/.beads/hooks/commit-msg"
  stage a.txt hello
  run git commit -m "chore: nothing to do with hooks"
  [ "$status" -eq 0 ]
  contains "hook copies disagree: commit-msg"
}

# --- step 5: lint + unit tests by detected stack ------------------------------------------

@test "pre-commit: a DEPENDENCY named test does not block the commit (enigma2_player-nje)" {
  write_file "$TEST_REPO/package.json" '{ "name": "t", "version": "1.0.0", "dependencies": { "test": "1.0.0" } }'
  stage a.txt hello
  run git commit -m "chore: manifest mentions test"
  [ "$status" -eq 0 ]
  lacks "npm test failed"
  lacks "Missing script"
}

@test "pre-commit: a failing npm test blocks the commit" {
  write_file "$TEST_REPO/package.json" '{ "name": "t", "version": "1.0.0", "scripts": { "test": "exit 3" } }'
  stage a.txt hello
  run git commit -m "chore: broken unit tests"
  [ "$status" -ne 0 ]
  contains "npm test failed"
}

@test "pre-commit: a passing npm test lets the commit through" {
  write_file "$TEST_REPO/package.json" '{ "name": "t", "version": "1.0.0", "scripts": { "test": "exit 0" } }'
  stage a.txt hello
  run git commit -m "chore: green unit tests"
  [ "$status" -eq 0 ]
  lacks "npm test failed"
}

@test "pre-commit: says so when there is no node to read the manifest with" {
  subset="$(toolless_path node npm npx)" \
    || skip "needs filesystem symlinks to build a PATH without node (Git-Bash copies instead)"
  write_file "$TEST_REPO/package.json" '{ "name": "t", "version": "1.0.0", "scripts": { "test": "exit 3" } }'
  stage a.txt hello
  run env PATH="$subset" git commit -m "chore: no node here"
  [ "$status" -eq 0 ]
  contains "no node - cannot read package.json scripts"
}

# --- bypass --------------------------------------------------------------------------------

@test "pre-commit: AIFLOW_SKIP_VERIFY=1 skips the whole hook" {
  install_guard
  stage_agent bad
  run env AIFLOW_SKIP_VERIFY=1 git commit -m "feat(agents): bypassed"
  [ "$status" -eq 0 ]
  lacks "pre-commit: format"
}
