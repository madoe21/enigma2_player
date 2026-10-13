# aiflow bd-close-sync (PowerShell entry point) - run AFTER a Beads issue is closed locally.
# Honours the rule: on every local issue close, ASK whether to push and whether to
# dolt-sync the configured remote (github/gitlab/custom). Never pushes silently.
#
# Usage: powershell -File .aiflow/bd-close-sync.ps1 <issue-id>
# Agents: AGENTS.md section 4 step 9 tells the agent to call this after `bd close`.
#
# THIS FILE IS A SHIM. The procedure lives once, in bd-close-sync.sh, and this hands over to it
# (enigma2_player-jjt). It used to be a second implementation of the same ~90 lines, and that is
# exactly how it went wrong: when enigma2_player-p6p fixed three defects in the shell version,
# the twin had to be fixed by hand in parallel, and only the shell version got the 13-case bats
# suite - so the copy that is MOST likely to run on a Windows machine was the untested one. Two
# implementations of one procedure is the duplication AGENTS.md section 2a forbids; a shim is
# the version of this file that cannot drift.
#
# bash is not an extra dependency here: every git hook in this repository, every other
# .aiflow/*.sh, and the whole test suite already require it, so a checkout without Git Bash
# cannot commit at all.
$ErrorActionPreference = 'Stop'

function Find-Bash {
  $onPath = Get-Command bash -ErrorAction SilentlyContinue
  if ($onPath) { return $onPath.Source }
  foreach ($candidate in @(
      "$env:ProgramFiles\Git\bin\bash.exe",
      "${env:ProgramFiles(x86)}\Git\bin\bash.exe",
      "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe")) {
    if ($candidate -and (Test-Path $candidate)) { return $candidate }
  }
  return $null
}

$bash = Find-Bash
if (-not $bash) {
  [Console]::Error.WriteLine("  ! no bash found - install Git for Windows, or run the script directly:")
  [Console]::Error.WriteLine("      bash .aiflow/bd-close-sync.sh <issue-id>")
  exit 1
}

# A relative path on purpose: handing a Windows path to Git Bash invites MSYS to rewrite it.
# The exit code is passed through unchanged - a caller that cannot tell a refused sync from a
# finished one is the defect this whole pair of scripts was fixed for.
& $bash '.aiflow/bd-close-sync.sh' @args
exit $LASTEXITCODE
