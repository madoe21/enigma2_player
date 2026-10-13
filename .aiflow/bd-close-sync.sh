#!/usr/bin/env bash
# aiflow bd-close-sync - run AFTER a Beads issue is closed locally.
# Honours the rule: on every local issue close, ASK whether to push and whether to
# dolt-sync the configured remote (github/gitlab/custom). Never pushes silently.
#
# Usage: aiflow close-sync <issue-id>   (direct: bash .aiflow/bd-close-sync.sh <issue-id>)
# Agents: the AGENTS.md §Beads-sync rule tells the agent to call this after `bd close`.
set -uo pipefail

ISSUE="${1:-}"
CFG=".aiflow/config.json"
have() { command -v "$1" >/dev/null 2>&1; }
j() { have jq && [ -f "$CFG" ] && jq -r "$1 // empty" "$CFG" 2>/dev/null; }

[ "$(j '.sync.askOnClose')" = "true" ] || { echo "sync-on-close disabled in $CFG"; exit 0; }
REMOTE_TYPE="$(j '.remote.type')"; [ -z "$REMOTE_TYPE" ] && REMOTE_TYPE=github
[ "$REMOTE_TYPE" = none ] && { echo "no remote configured; nothing to sync"; exit 0; }

# The answers come from the terminal, opened ONCE on fd 3 rather than reopened per question:
# reopening a file restarts it, so a scripted sequence of answers would hand its first line to
# every prompt. AIFLOW_SYNC_TTY points the source somewhere else for the tests, which have no
# terminal and must still drive both answers (§7a: nothing here may sit waiting for a human).
#
# Each source is tried by OPENING it, not by testing it. `[ -r /dev/tty ]` is true in Git Bash
# inside a pipeline while the open then fails with "No such device or address" — fd 3 never
# exists, and every prompt answers itself with `3: Bad file descriptor`. Falling through to
# stdin also makes `printf 'y\nn\n' | bd-close-sync.sh` work, which is the only way to drive
# this deliberately from a script that has already decided.
TTY="${AIFLOW_SYNC_TTY:-/dev/tty}"
{ exec 3<"$TTY"; } 2>/dev/null ||
  { exec 3<&0; } 2>/dev/null ||
  exec 3</dev/null

# No readable answer means NO. It used to mean yes — `read -r a <"$TTY" || a=""` fell through
# to the `[y]` default — so a run with neither a terminal nor a readable stdin pushed without
# anyone being asked, in a script whose first promise is "Never pushes silently"
# (enigma2_player-p6p).
ask_yn() {
  local p="$1" a
  printf "  %s (y/n) [y]: " "$p" >&2
  if ! read -r a <&3; then
    printf "  ! no answer available (no terminal) — assuming no.\n" >&2
    return 1
  fi
  case "${a:-y}" in [Yy]*) return 0 ;; *) return 1 ;; esac
}

# Set by any step that could not finish. The script then refuses to claim success: a sync that
# half happened and reported "done." is worse than one that failed loudly, because the next
# thing the agent or the developer does is assume the remote has the work.
FAILED=0

echo "Beads issue ${ISSUE:-<closed>} closed locally."

# 1) push the git branch (issue JSONL + code)
#
# `--rebase=merges`, and the result is CHECKED. This used to be
# `git pull --rebase 2>/dev/null || true` followed by an unconditional `git push`, which had
# two defects at once (enigma2_player-p6p):
#
#   * plain `--rebase` FLATTENS merge commits. A task branch that had legitimately updated
#     itself by merging `main` got every commit of the merged side replayed as a separate
#     patch — so a file `main` had deleted and the branch had touched came back as a
#     modify/delete conflict every single time. Reproduced and fixed: with `--rebase=merges`
#     the merge is recreated and the same branch rebases cleanly.
#   * the failure was then INVISIBLE. `2>/dev/null` threw the conflict away, `|| true` ate the
#     exit code, `git push` ran against a repository sitting mid-rebase on a detached HEAD,
#     and the script still printed "done.".
if [ -d .git ] && ask_yn "Push the current branch to '$REMOTE_TYPE'?"; then
  if git pull --rebase=merges; then
    git push || { echo "  ! git push failed (resolve, then push manually)" >&2; FAILED=1; }
  else
    {
      echo "  ! 'git pull --rebase=merges' stopped — NOT pushing."
      echo "    The repository is most likely mid-rebase. Check with 'git status', then either"
      echo "    'git rebase --abort' to return to where you were, or resolve the conflict,"
      echo "    'git add' the files and 'git rebase --continue'. Push by hand afterwards."
    } >&2
    FAILED=1
  fi
fi

# 2) dolt-sync the Beads DB with the remote (issues live in Dolt; refs/dolt/data on origin).
#    PULL BEFORE PUSH so we merge teammates' issue changes instead of clobbering them — which
#    is why a failed pull now SKIPS the push instead of running it anyway. The old version
#    reported the failed pull and then pushed regardless, i.e. did the exact clobbering the
#    comment above says it is there to prevent. Output is no longer discarded: the message
#    telling you to "resolve conflicts" is useless without the conflict it is talking about.
if have bd && ask_yn "Dolt-sync Beads issues with the remote now?"; then
  if bd dolt pull; then
    bd dolt push || {
      echo "  ! bd dolt push failed — run 'bd dolt pull' (merge) then 'bd dolt push' manually" >&2
      FAILED=1
    }
  else
    echo "  ! bd dolt pull failed — NOT pushing; resolve the conflict, then 'bd dolt push'" >&2
    FAILED=1
  fi
fi

[ "$FAILED" = 0 ] || { echo "NOT done — the sync needs you; see the messages above." >&2; exit 1; }
echo "done."
