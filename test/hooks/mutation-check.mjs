#!/usr/bin/env node
// Prove the hook tests are sensitive to defects, not merely green (enigma2_player-3c5).
//
// Hook tests are unusually easy to fake: nearly every branch of a hook ends in `exit 0`, so a
// check that silently does nothing is indistinguishable from a check that passed. That is not a
// hypothetical - the bead-id step skipped itself in silence for months (enigma2_player-aji), the
// formatter formatted nothing on a machine with no global prettier (enigma2_player-38r), and the
// two hook trees drifted apart unnoticed (enigma2_player-puh). A suite that would stay green
// through any of those is worth nothing.
//
// So each mutant below breaks exactly one branch of one hook in a throwaway copy, and the test
// that is supposed to notice is run against it - by name, so the report says which test does the
// noticing. A mutant that survives means that branch is untested: the script fails and names it.
//
// Run: npm run test:hooks:mutate
//
// A `skip`ped test cannot kill a mutant (bats counts it as ok). That is deliberate: if a branch
// cannot be observed on this machine, the honest outcome is a loud survivor, not a pass.
//
// A mutant that dies here and survives in CI means the test never measured that branch. Three did
// (enigma2_player-e1c): they asserted on the output of a whole `git commit`, which runs both
// hooks - and both print the same "bead ids NOT checked" warning, so each hook was the other's
// alibi - while the revert case depended on whether the local git invokes commit-msg during
// `git revert` at all. A test that pins one hook's branch invokes that hook, not git.

import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const bats = join(root, 'node_modules', '.bin', 'bats');

/**
 * One deliberate defect per hook branch.
 *
 * `find` must occur exactly once in the hook, so a mutant cannot quietly stop applying when the
 * hook is reworded; `filter` is the bats test-name pattern that has to go red because of it.
 */
const MUTANTS = [
  {
    branch: 'pre-commit 1: formatted file is not re-staged',
    hook: 'pre-commit',
    find: '  git add "$f" 2>/dev/null || true',
    replace: '  :',
    suite: 'pre-commit.bats',
    filter: 're-stages the result',
  },
  {
    branch: 'pre-commit 1: a file with unstaged changes is formatted anyway',
    hook: 'pre-commit',
    find: `  if printf '%s\\n' "$unstaged" | grep -qxF -- "$f"; then`,
    replace: '  if false; then',
    suite: 'pre-commit.bats',
    filter: 'unstaged changes is not formatted',
  },
  {
    branch: 'pre-commit 1: the missing-prettier note repeats per file',
    hook: 'pre-commit',
    find: '      [ "$prettier_warned" -eq 1 ] && return 0',
    replace: '      :',
    suite: 'pre-commit.bats',
    filter: 'once per commit',
  },
  {
    branch: 'pre-commit 2: the roster guard judges the worktree, not the index',
    hook: 'pre-commit',
    find:
      '    out="$("$py" "$guard" "$stage_dir/.claude/agents" "$stage_dir/.claude/commands" \\\n' +
      '      "$stage_dir/.claude/skills" 2>&1)"; rc=$?',
    replace:
      '    out="$("$py" "$guard" .claude/agents .claude/commands .claude/skills 2>&1)"; rc=$?',
    suite: 'pre-commit.bats',
    filter: 'judges the index',
  },
  {
    branch: 'pre-commit 3: a missing bead-id library is skipped in silence',
    hook: 'pre-commit',
    find: '  echo "  ! no lib-bead-ids.sh next to this hook or in .githooks/ - bead ids NOT checked" >&2',
    replace: '  :',
    suite: 'pre-commit.bats',
    filter: 'lib-bead-ids.sh is in neither location',
  },
  {
    branch: 'pre-commit 4: drift never blocks a commit that changes a hook',
    hook: 'pre-commit',
    find: '      fail "this commit changes a hook and the two copies disagree (see above)"',
    replace: '      :',
    suite: 'pre-commit.bats',
    filter: 'stop a commit that changes a hook',
  },
  {
    branch: 'pre-commit 4: the two hook trees are never compared',
    hook: 'pre-commit',
    find: '    cmp -s "$hooks_tmpl/$h" "$hooks_run/$h" || drift="$drift $h"',
    replace: '    :',
    suite: 'pre-commit.bats',
    filter: 'divergent hook trees warn',
  },
  {
    branch: 'pre-commit 5: the manifest is grepped as text again (enigma2_player-nje)',
    hook: 'pre-commit',
    find:
      '  if have node; then\n' +
      `    node -e 'process.exit(require("./package.json").scripts?.test ? 0 : 1)' 2>/dev/null \\\n` +
      '      && { npm test --silent || fail "npm test failed"; }',
    replace:
      `  if grep -q '"test"' package.json; then\n` +
      '    npm test --silent || fail "npm test failed"',
    suite: 'pre-commit.bats',
    filter: 'DEPENDENCY named test',
  },
  {
    branch: 'commit-msg: any subject is accepted',
    hook: 'commit-msg',
    find: 'if ! printf \'%s\' "$msg" | grep -Eq "$pattern"; then',
    replace: 'if false; then',
    suite: 'commit-msg.bats',
    filter: 'is rejected, with the rule',
  },
  {
    branch: "commit-msg: git's own merge and revert subjects are rejected",
    hook: 'commit-msg',
    find: 'case "$msg" in "Merge "*|"Revert "*) exit 0 ;; esac',
    replace: ':',
    suite: 'commit-msg.bats',
    filter: 'merge or revert subject is let through',
  },
  {
    branch: 'commit-msg: a missing bead-id library is skipped in silence',
    hook: 'commit-msg',
    find: '  echo "  ! no lib-bead-ids.sh next to this hook or in .githooks/ - bead ids NOT checked" >&2',
    replace: '  :',
    suite: 'commit-msg.bats',
    filter: 'library is missing',
  },
  {
    branch: 'pre-push: a direct push to a protected branch is allowed',
    hook: 'pre-push',
    find: `      [ "$branch" = "$p" ] && fail "direct push to protected branch '$branch' is not allowed (merge via Pull Request)"`,
    replace: '      :',
    suite: 'pre-push.bats',
    filter: 'refuses a direct push',
  },
  {
    branch: 'pre-push: any branch name is allowed under strict naming',
    hook: 'pre-push',
    find: `    [ "$ok" = true ] || fail "branch name '$branch' does not match an allowed type ($TYPES)"`,
    replace: '    :',
    suite: 'pre-push.bats',
    filter: 'matching no allowed type',
  },
  {
    branch: 'pre-push: a -SNAPSHOT version may land on main',
    hook: 'pre-push',
    find: `      *-SNAPSHOT) fail "VERSION on main is '$ver' - run 'aiflow release --yes' before pushing main (SNAPSHOT must never land on main)" ;;`,
    replace: '      *-SNAPSHOT) : ;;',
    suite: 'pre-push.bats',
    filter: 'SNAPSHOT version must not reach main',
  },
  {
    // Its own arm of the same `case`, and its own mutant: the bead names both bars, and the two
    // suffixes have already been fixed separately once (-SNAPSHOT belongs to develop, -HOTFIX to
    // hotfix/*), so a mutant that only covers one of them would miss the next such edit.
    branch: 'pre-push: a -HOTFIX version may land on main',
    hook: 'pre-push',
    find: `      *-HOTFIX)   fail "VERSION on main is '$ver' - run 'aiflow release --yes' before pushing main (HOTFIX must never land on main)" ;;`,
    replace: '      *-HOTFIX)   : ;;',
    suite: 'pre-push.bats',
    filter: 'HOTFIX version must not reach main',
  },
  {
    branch: 'pre-push: a forbidden branch may be merged into main',
    hook: 'pre-push',
    find: `          */) [[ "$src" == \${f}* ]] && fail "merge of '$src' into main is not allowed (only develop, hotfix/*, or chore/* may target main)" ;;`,
    replace: '          */) : ;;',
    suite: 'pre-push.bats',
    filter: 'forbidden branch into main',
  },
];

/** Apply one mutant to a fresh copy of the hook tree; returns the copy's path. */
function mutate(mutant) {
  const dir = mkdtempSync(join(tmpdir(), 'hook-mutant-'));
  cpSync(join(root, '.githooks'), dir, { recursive: true });
  const file = join(dir, mutant.hook);
  // The index holds LF, but a Windows worktree with core.autocrlf=true holds CRLF, and a
  // multi-line pattern would then match on Linux and silently go stale here (the mutant would
  // report itself as stale rather than as a false pass - but only after somebody looks).
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const hits = text.split(mutant.find).length - 1;
  if (hits !== 1) {
    rmSync(dir, { recursive: true, force: true });
    throw new Error(
      `the text this mutant replaces occurs ${hits} times in .githooks/${mutant.hook} ` +
        `(expected exactly once) - the hook was reworded, so update the mutant:\n${mutant.find}`,
    );
  }
  writeFileSync(file, text.replace(mutant.find, mutant.replace));
  return dir;
}

/** Run the one test that should notice, against the broken hooks. */
function runSuite(mutant, hooksSrc) {
  const result = spawnSync('bash', [bats, '--filter', mutant.filter, join(here, mutant.suite)], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, HOOKS_SRC: hooksSrc },
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  return { status: result.status, output, matched: !/^1\.\.0\s*$/m.test(output) };
}

let survivors = 0;
let stale = 0;
for (const mutant of MUTANTS) {
  let dir;
  try {
    dir = mutate(mutant);
  } catch (error) {
    console.log(`::error::stale mutant [${mutant.branch}]: ${error.message}`);
    stale += 1;
    continue;
  }
  const { status, output, matched } = runSuite(mutant, dir);
  rmSync(dir, { recursive: true, force: true });

  if (!matched) {
    console.log(
      `::error::no test matched "${mutant.filter}" in ${mutant.suite} [${mutant.branch}] - ` +
        'the test was renamed or removed',
    );
    stale += 1;
  } else if (status === 0) {
    console.log(
      `::error::SURVIVED [${mutant.branch}] - "${mutant.filter}" stayed green:\n${output}`,
    );
    survivors += 1;
  } else {
    console.log(`killed  ${mutant.branch}  <- "${mutant.filter}"`);
  }
}

const verdict = survivors + stale;
console.log(
  `\n${MUTANTS.length} mutants, ${MUTANTS.length - verdict} killed, ` +
    `${survivors} survived, ${stale} stale`,
);
process.exit(verdict === 0 ? 0 : 1);
