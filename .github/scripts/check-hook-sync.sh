#!/usr/bin/env bash
# The same three hooks are versioned twice - .githooks/ is the aiflow template, .beads/hooks/ is
# where core.hooksPath points and therefore what git actually runs. Editing one copy only is
# invisible: a fix in the template changes nothing about the running hook, and a fix in the
# running copy is overwritten by the next `bd hooks install` (enigma2_player-puh).
#
# pre-commit step 4 compares them on every commit, but a hook is exactly the wrong place for the
# only copy of a check: it is skippable, it is not installed on a fresh clone until somebody
# configures core.hooksPath, and it cannot see what arrives through a pull request. So the same
# comparison runs here as a CI step (enigma2_player-3c5), the way the frontmatter guard is both a
# hook step and a CI job.
#
# The directories are arguments with defaults, NOT read from core.hooksPath: that setting is a
# local absolute path ("C:\dev\...\.beads\hooks" on this machine), so it is not a repository fact
# and does not exist in a runner at all. Hardcoded here means a moved tree must be moved here
# too - and until it is, this script fails loudly rather than comparing nothing, which is the
# failure mode it exists to catch (enigma2_player-aji).
#
# Usage: check-hook-sync.sh [<template dir> [<running dir>]]
set -uo pipefail

TEMPLATE="${1:-.githooks}"
RUNNING="${2:-.beads/hooks}"
# lib-bead-ids.sh is deliberately not in this list: it belongs to the template alone, and both
# hooks resolve it from there instead of keeping a second copy (enigma2_player-aji).
HOOKS="commit-msg pre-commit pre-push"

failed=0
err() {
  echo "::error::hook trees: $1" >&2
  failed=1
}

for dir in "$TEMPLATE" "$RUNNING"; do
  [ -d "$dir" ] || err "no such directory: $dir - a renamed or deleted hook tree must not pass as 'in sync'"
done
[ "$failed" -eq 0 ] || exit 1

if [ "$TEMPLATE" = "$RUNNING" ]; then
  echo "hook trees: $TEMPLATE is both template and running copy - nothing to compare"
  exit 0
fi

for h in $HOOKS; do
  for dir in "$TEMPLATE" "$RUNNING"; do
    [ -f "$dir/$h" ] || err "$dir/$h is missing - git silently runs no hook at all when the running copy is gone"
  done
  [ -f "$TEMPLATE/$h" ] && [ -f "$RUNNING/$h" ] || continue
  if ! cmp -s "$TEMPLATE/$h" "$RUNNING/$h"; then
    err "$TEMPLATE/$h and $RUNNING/$h differ - copy the intended version over the other, otherwise a fix or a commit is lost"
    diff -u "$TEMPLATE/$h" "$RUNNING/$h" >&2 || true
  fi
done

# A hook committed without the executable bit is ignored by git on Linux and macOS - with a hint
# nobody reads - so the whole gate disappears for everyone who does not work on Windows, where
# the bit is not tracked at all. Every hook in both trees is checked, beads' own three included:
# the index mode is the only thing a clone can go by.
if git rev-parse --git-dir >/dev/null 2>&1; then
  while read -r mode _ _ path; do
    [ -n "${path:-}" ] || continue
    case "$path" in
      */lib-*.sh) continue ;; # sourced by the hooks, never executed
    esac
    [ "$mode" = 100755 ] || err "$path is mode $mode - git ignores a hook that is not executable (git update-index --chmod=+x '$path')"
  done <<< "$(git ls-files -s -- "$TEMPLATE" "$RUNNING" 2>/dev/null)"
else
  echo "::warning::hook trees: not a git repository - executable bits not checked" >&2
fi

[ "$failed" -eq 0 ] || exit 1
echo "hook trees in sync: $TEMPLATE == $RUNNING ($HOOKS)"
