# aiflow bd-close-sync - run AFTER a Beads issue is closed locally.
# Honours the rule: on every local issue close, ASK whether to push and whether to
# dolt-sync the configured remote (github/gitlab/custom). Never pushes silently.
#
# Usage: aiflow close-sync <issue-id>   (direct: powershell -File .aiflow/bd-close-sync.ps1 <issue-id>)
# Agents: the AGENTS.md par.Beads-sync rule tells the agent to call this after `bd close`.
$ErrorActionPreference = 'Continue'

$issue = if ($args.Count -ge 1) { $args[0] } else { "<closed>" }
$cfgPath = ".aiflow/config.json"

function Have($name) { return [bool](Get-Command $name -ErrorAction SilentlyContinue) }
function Cfg($path) {
  if (-not (Test-Path $cfgPath)) { return $null }
  try {
    $cfg = Get-Content $cfgPath -Raw | ConvertFrom-Json
    $node = $cfg
    foreach ($p in $path -split '\.') { if ($null -eq $node) { return $null }; $node = $node.$p }
    return $node
  } catch { return $null }
}

if (-not (Cfg "sync.askOnClose")) { Write-Output "sync-on-close disabled in $cfgPath"; exit 0 }
$remoteType = Cfg "remote.type"; if (-not $remoteType) { $remoteType = "github" }
if ($remoteType -eq "none") { Write-Output "no remote configured; nothing to sync"; exit 0 }

# Plain stderr, not Write-Error: at $ErrorActionPreference = 'Continue' an error record prints
# the offending source line and a caret ruler under it, which turns four lines of "here is how to
# get out of the rebase" into a wall nobody reads. The shell twin prints these as plain lines and
# signals failure by its exit code; so does this.
function Warn($text) { [Console]::Error.WriteLine($text) }

# No readable answer means NO. Pressing Enter at a real console still takes the `[y]` default -
# that is the prompt's documented contract and a human is standing there - but an empty read from
# a redirected or exhausted stdin is not an answer, it is the absence of one, and it used to be
# treated as yes. A headless run (CI, a Ralph loop, a hook) then pushed without anyone being
# asked, in a script whose first promise is "Never pushes silently" (enigma2_player-p6p).
function Ask-YN($prompt) {
  $answer = $null
  try { $answer = Read-Host "  $prompt (y/n) [y]" } catch { $answer = $null }
  if (($null -eq $answer) -or (('' -eq $answer) -and [Console]::IsInputRedirected)) {
    Warn "  ! no answer available (no terminal) - assuming no."
    return $false
  }
  if (-not $answer) { return $true }
  return $answer -match '^[Yy]'
}

# Set by any step that could not finish; the script then refuses to claim success. Kept in
# lockstep with bd-close-sync.sh - the two are the same procedure for two shells.
$failed = $false

Write-Output "Beads issue $issue closed locally."

# 1) push the git branch (issue JSONL + code)
#
# `--rebase=merges`, and the result is CHECKED. This used to be `git pull --rebase *> $null`
# followed by an unconditional `git push`, which had two defects at once
# (enigma2_player-p6p):
#
#   * plain `--rebase` FLATTENS merge commits. A task branch that had legitimately updated
#     itself by merging `main` got every commit of the merged side replayed as a separate
#     patch, so a file `main` had deleted and the branch had touched came back as a
#     modify/delete conflict every time. With `--rebase=merges` the merge is recreated and
#     the same branch rebases cleanly.
#   * the failure was then invisible, and worse than in the shell twin: `*> $null` discards
#     stdout AND stderr, $LASTEXITCODE was never read after the pull, and the push ran
#     unconditionally against a repository sitting mid-rebase.
if ((Test-Path .git) -and (Ask-YN "Push the current branch to '$remoteType'?")) {
  git pull --rebase=merges
  if ($LASTEXITCODE -ne 0) {
    Warn "  ! 'git pull --rebase=merges' stopped - NOT pushing."
    Warn "    The repository is most likely mid-rebase. Check with 'git status', then either"
    Warn "    'git rebase --abort' to return to where you were, or resolve the conflict,"
    Warn "    'git add' the files and 'git rebase --continue'. Push by hand afterwards."
    $failed = $true
  } else {
    git push
    if ($LASTEXITCODE -ne 0) {
      Warn "  ! git push failed (resolve, then push manually)"
      $failed = $true
    }
  }
}

# 2) dolt-sync the Beads DB with the remote (issues live in Dolt; refs/dolt/data on origin).
#    PULL BEFORE PUSH so we merge teammates' issue changes instead of clobbering them - which
#    is why a failed pull now SKIPS the push instead of running it anyway. The old version
#    reported the failed pull and then pushed regardless, i.e. did the exact clobbering the
#    comment above says it is there to prevent.
if ((Have bd) -and (Ask-YN "Dolt-sync Beads issues with the remote now?")) {
  bd dolt pull
  if ($LASTEXITCODE -ne 0) {
    Warn "  ! bd dolt pull failed - NOT pushing; resolve the conflict, then 'bd dolt push'"
    $failed = $true
  } else {
    bd dolt push
    if ($LASTEXITCODE -ne 0) {
      Warn "  ! bd dolt push failed - run 'bd dolt pull' (merge) then 'bd dolt push' manually"
      $failed = $true
    }
  }
}

if ($failed) {
  Warn "NOT done - the sync needs you; see the messages above."
  exit 1
}
Write-Output "done."
