#!/usr/bin/env bash
# Shared helper for the git hooks: warn about bead ids that do not exist.
#
# Invented ids are easy to write and hard to notice — they look right, and CI cannot check them
# (no `bd` in the runner, and the issue DB is not a tracked file). Locally `bd` is right there.
#
# WARNS, never blocks: an id can also be missing simply because a teammate's bead has not been
# pulled yet, and a commit is the wrong place to lose that argument. Silently skipped when `bd`
# or `jq` is absent, or outside a beads project.
#
# Usage: . "<this file>"; printf '%s' "$text" | warn_unknown_bead_ids "<where>"
# The caller resolves the path — next to the hook, then .githooks/: `core.hooksPath` can point at
# a directory this file was never installed into (enigma2_player-aji).

# The prefix is read from the issue DB, never hardcoded: a project that renamed its prefix
# (`bd rename-prefix`) must keep working without touching this file. The DB records it, so it is
# asked rather than inferred (enigma2_player-pog) — `--json` because a value must not be confused
# with an error line or a reworded message.
bead_prefix() {
  local p
  p="$(bd config get issue_prefix --json 2>/dev/null | jq -r '.value // empty' 2>/dev/null)"
  [ -n "$p" ] && { printf '%s\n' "$p"; return 0; }

  # Fallback for a DB with no prefix recorded: the MODE of a sample of ids, never a single id. A
  # legacy id such as `<prefix>-1782845428743-11-493621e3` strips down to
  # `<prefix>-1782845428743-11`, which matches no id in the pattern below — the check would then do
  # nothing, in silence, which is the failure this file was just rescued from (enigma2_player-aji).
  # `bd list` documents no order, so "the first id" is not something to build on.
  bd list --all --limit 50 --json 2>/dev/null \
    | jq -r '[.[].id | sub("-[^-]+$"; "")] | group_by(.) | max_by(length) | .[0] // ""' 2>/dev/null
}

# bead_ids_in_text <prefix>; text on stdin, the ids it mentions on stdout, sorted and unique.
#
# `<prefix>-abc` or `<prefix>-abc.1` (bd's sub-task form) — and nothing that merely BEGINS like
# one. The release artefacts this repository hosts are named `<prefix>-windows-x64-setup-*.exe`
# and `<prefix>-linux-x64-*.deb`, whose first three characters after the dash have exactly an
# id's shape, so every commit touching the download data or the release notes warned about
# `-win` and `-lin` (enigma2_player-35d). A guard that cries wolf teaches the reader to ignore
# it, which is the one thing this one must not do. So an id has to END where it ends: the next
# character may not continue the token.
#
# Two greps, because POSIX ERE has no lookahead: the first keeps the delimiter it matched, the
# second drops it again. A period is a delimiter, not a continuation — an id does end a sentence —
# and only `(\.[0-9]+)` makes one part of the id, which grep's leftmost-longest match prefers
# where both could apply (`<prefix>-abc.1` is the sub-task, not `<prefix>-abc` plus a full stop).
bead_ids_in_text() { # <prefix>; text on stdin
  local prefix="$1"
  grep -oE "${prefix}-[a-z0-9]{3}(\.[0-9]+)?([^a-zA-Z0-9_-]|$)" \
    | grep -oE "${prefix}-[a-z0-9]{3}(\.[0-9]+)?" \
    | sort -u
}

warn_unknown_bead_ids() { # <context label>; text on stdin
  local where="${1:-input}" prefix ids missing
  command -v bd >/dev/null 2>&1 || return 0
  command -v jq >/dev/null 2>&1 || return 0
  [ -d .beads ] || return 0

  prefix="$(bead_prefix)"
  [ -n "$prefix" ] || return 0

  ids="$(bead_ids_in_text "$prefix")"
  [ -n "$ids" ] || return 0

  # One lookup for all of them. `bd show` exits 0 even for an unknown id, so the answer is read
  # from the JSON: on success an array of issues, on failure an object with .error.
  missing="$(bd show $ids --json 2>/dev/null \
    | jq -r --arg want "$ids" '
        (if type == "array" then [.[].id] else [] end) as $found
        | ($want | split("\n")) - $found | .[]' 2>/dev/null)"
  [ -n "$missing" ] || return 0

  echo "  ! $where references bead id(s) that do not exist here:" >&2
  for m in $missing; do echo "      $m" >&2; done
  echo "    (typo, or a teammate's bead you have not pulled — 'aiflow sync' to check)" >&2
  return 0
}
