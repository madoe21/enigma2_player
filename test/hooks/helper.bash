#!/usr/bin/env bash
# Shared setup for the git-hook tests (enigma2_player-3c5).
#
# Every case runs in a THROWAWAY repository under $TMPDIR. A test that commits, merges or
# pushes must never do it in the repository it is testing: the hooks are what is being
# exercised, so a bug in them would land real commits, and a suite that needs the worktree in
# a particular state cannot run while somebody is working in it.
#
# The hooks are COPIED from $HOOKS_SRC (.githooks/ by default). mutation-check.mjs points that
# at a deliberately broken copy and demands the suite go red - a test that stays green over a
# broken hook is the single outcome these tests exist to rule out, and hook tests are unusually
# prone to it: nearly every branch here ends in "exit 0", so a check that silently does nothing
# looks exactly like a check that passed (enigma2_player-aji is that bug, in production, for
# months).

REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
HOOKS_SRC="${HOOKS_SRC:-$REPO_ROOT/.githooks}"
GUARD_SRC="$REPO_ROOT/.github/scripts/check-frontmatter.py"

# make_repo [<hook directory, relative to the work tree>]
#
# With no argument the hooks run from .githooks/ itself, which is the arrangement where the
# drift gate (pre-commit step 4) compares a directory with itself and stays quiet. Pass
# .beads/hooks to get the real two-tree setup: template in .githooks/, running copy elsewhere.
make_repo() {
  local run_dir="${1:-.githooks}"
  # A case that wants the two-tree layout calls this again after setup(); the first tree goes
  # away rather than being left behind in $TMPDIR.
  [ -n "${TEST_REPO:-}" ] && drop_repo
  TEST_REPO="$(mktemp -d)"
  cd "$TEST_REPO" || return 1

  # The machine's own git configuration is kept out: a global core.hooksPath, autocrlf or
  # commit.gpgsign would otherwise decide what these tests measure, differently per developer
  # and differently again in CI. Empty files rather than /dev/null, whose spelling is not
  # portable to Git-Bash.
  : > "$TEST_REPO/.gitconfig-none"
  export GIT_CONFIG_GLOBAL="$TEST_REPO/.gitconfig-none"
  export GIT_CONFIG_SYSTEM="$TEST_REPO/.gitconfig-none"
  # pre-push would try `bd github sync` if a token were exported into the test environment.
  unset GITHUB_TOKEN

  git init -q -b main .
  git config user.name "Hook Test"
  git config user.email "hooks@example.invalid"
  git config commit.gpgsign false
  git config core.hooksPath "$run_dir"

  # lib-bead-ids.sh goes into the template only - that is where it lives, and both hooks
  # resolve it from there rather than keeping a second copy (enigma2_player-aji).
  install_hooks .githooks
  cp "$HOOKS_SRC/lib-bead-ids.sh" "$TEST_REPO/.githooks/" 2>/dev/null || true
  [ "$run_dir" = ".githooks" ] || install_hooks "$run_dir"
}

# install_hooks <directory relative to the work tree> - the three hooks under test
install_hooks() {
  local dest="$TEST_REPO/$1" h
  mkdir -p "$dest"
  for h in commit-msg pre-commit pre-push; do
    cp "$HOOKS_SRC/$h" "$dest/$h"
    chmod +x "$dest/$h"
  done
}

# drop_repo - teardown. cd out first: Windows refuses to delete a directory that is some
# process's working directory, so the removal would fail and leave the tree behind.
drop_repo() {
  cd "$REPO_ROOT" || return 0
  [ -n "${TEST_REPO:-}" ] && rm -rf "$TEST_REPO"
  return 0
}

# contains / lacks <substring> - assertions on $output that print it when they fail, because
# "status 1" alone does not say which of a hook's several exits was taken. Plain bash rather
# than bats-assert: two helpers do not justify two more dependencies (AGENTS.md ponytail).
contains() {
  case "$output" in
    *"$1"*) return 0 ;;
  esac
  printf 'expected output to contain: %s\n--- output ---\n%s\n' "$1" "$output" >&2
  return 1
}

lacks() {
  case "$output" in
    *"$1"*)
      printf 'expected output NOT to contain: %s\n--- output ---\n%s\n' "$1" "$output" >&2
      return 1
      ;;
  esac
  return 0
}

# occurrences <substring> - how many output lines carry it
occurrences() {
  printf '%s\n' "$output" | grep -cF -- "$1"
}

# write_file <path> <content...> - content lines as further arguments
write_file() {
  local path="$1"
  shift
  mkdir -p "$(dirname "$path")"
  printf '%s\n' "$@" > "$path"
}

# stage <path> <content...>
stage() {
  local path="$1"
  shift
  write_file "$path" "$@"
  git add -- "$path"
}

# install_guard - the frontmatter guard where pre-commit step 2 looks for it
install_guard() {
  mkdir -p "$TEST_REPO/.github/scripts"
  cp "$GUARD_SRC" "$TEST_REPO/.github/scripts/check-frontmatter.py"
}

# working_guard - the same, for a case that expects the guard to BLOCK a commit. Without
# python3/python + PyYAML the hook prints a note and lets the commit through, so such a case
# would pass for the wrong reason; the reason is named as a skip instead.
working_guard() {
  local c
  install_guard
  for c in python3 python; do
    command -v "$c" >/dev/null 2>&1 || continue
    "$c" "$GUARD_SRC" --selftest >/dev/null 2>&1 && return 0
  done
  skip "the frontmatter guard cannot run here - needs python3/python + PyYAML"
}

# agent_file <good|bad> - an agent definition whose frontmatter parses, or does not. The bad
# one is the real failure mode: an unquoted description containing ": " reads as a nested
# mapping key, and Claude Code then drops the agent from the roster without a word.
agent_file() {
  if [ "$1" = good ]; then
    printf -- '---\nname: tester\ndescription: "two hats: architect and quality gate"\n---\nbody\n'
  else
    printf -- '---\nname: tester\ndescription: two hats: architect and quality gate\n---\nbody\n'
  fi
}

# write_agent <good|bad> - the agent definition in the worktree, nothing staged
write_agent() {
  mkdir -p "$TEST_REPO/.claude/agents"
  agent_file "$1" > "$TEST_REPO/.claude/agents/tester.md"
}

# stage_agent <good|bad> - the same, staged
stage_agent() {
  write_agent "$1"
  git add -- .claude/agents/tester.md
}

# stub_prettier - a project-local prettier that records its calls and rewrites the file, so a
# test can prove the hook both ran it and re-staged the result. The real binary is not used:
# what is under test is the hook's branching, not prettier's output.
stub_prettier() {
  mkdir -p "$TEST_REPO/node_modules/.bin"
  cat > "$TEST_REPO/node_modules/.bin/prettier" <<'STUB'
#!/usr/bin/env bash
printf '%s\n' "$*" >> prettier-calls
for a in "$@"; do last="$a"; done
printf 'FORMATTED\n' > "$last"
STUB
  chmod +x "$TEST_REPO/node_modules/.bin/prettier"
}

# add_origin - a bare repository to push into, so pre-push runs the way git runs it (with the
# ref lines on stdin) instead of being called by hand with invented arguments.
add_origin() {
  git init -q --bare "$TEST_REPO/origin.git"
  git remote add origin "$TEST_REPO/origin.git"
}

# branching_model <json> - the governance model pre-push reads
branching_model() {
  mkdir -p "$TEST_REPO/.aiflow"
  printf '%s\n' "$1" > "$TEST_REPO/.aiflow/branching.json"
}

# toolless_path <tool-to-omit>...
#
# A PATH holding only what the hooks need, minus the named tools, so the "tool is missing"
# branches can be observed instead of taken on trust. Symlinks, because copying a binary
# leaves its libraries behind; where the filesystem has none (Windows), the caller skips the
# test rather than passing it vacuously.
toolless_path() {
  local omit=" $* " dir="$TEST_REPO/.bin-subset" t p
  rm -rf "$dir"
  mkdir -p "$dir"
  for t in git bash sh env grep sed cmp cat head sort uniq tr awk cut wc mkdir rm cp mv \
    chmod dirname basename xargs find tee true false expr date id uname \
    npm npx node python3 python; do
    case "$omit" in *" $t "*) continue ;; esac
    p="$(command -v "$t" 2>/dev/null)" || continue
    ln -s "$p" "$dir/$t" 2>/dev/null || return 1
    [ -L "$dir/$t" ] || return 1
  done
  printf '%s' "$dir"
}
