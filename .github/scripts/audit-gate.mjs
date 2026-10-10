#!/usr/bin/env node
/**
 * Fails a build on a high or critical dependency advisory.
 *
 * `npm audit` alone is not a gate: it reports, and a report that nobody reads
 * is how sixteen advisories accumulated unnoticed in this repository until the
 * first `npm install` of the Angular migration (enigma2_player-yrq). The tree
 * was never installed locally, so it was never audited.
 *
 * Two trees live here for the duration of the migration - the Astro site at
 * the repository root and the Angular site under `site/` - and each one is
 * audited on its own terms.
 *
 * `--allow <packages>` accepts a named exception per package. It exists for
 * exactly one situation: an advisory whose fix is a major version bump of a
 * dependency that is about to be deleted, where the vulnerable FEATURE is
 * measurably unused. Every entry has to be justified in the bead it belongs
 * to, and an allowed package still prints - silence is what let this grow.
 * Anything high or critical that is NOT allowed fails the run.
 *
 * Usage:
 *   node .github/scripts/audit-gate.mjs <dir>
 *   node .github/scripts/audit-gate.mjs . --allow astro,sharp
 */
import { execSync } from "node:child_process";

const BLOCKING = new Set(["high", "critical"]);

const [dir = ".", ...rest] = process.argv.slice(2);
const allowIndex = rest.indexOf("--allow");
const allowed = new Set(
  allowIndex === -1
    ? []
    : (rest[allowIndex + 1] ?? "").split(",").filter(Boolean),
);

/**
 * The audit report, or a hard stop.
 *
 * `npm audit` exits non-zero as soon as it finds anything, so a non-zero exit
 * is not an error here - unparseable output is. Exiting 0 on a report that
 * could not be read would turn the gate into decoration.
 */
function audit() {
  let out;
  try {
    // A fixed command string, not an argument array: on Windows `npm` is a
    // `.cmd`, which Node refuses to spawn without a shell (CVE-2024-27980),
    // and passing an args array THROUGH a shell is what DEP0190 warns about.
    // Nothing is interpolated into the string - `dir` is the cwd, not an
    // argument - so there is no injection surface either way.
    out = execSync("npm audit --json", {
      cwd: dir,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    out = error.stdout;
  }
  try {
    return JSON.parse(out);
  } catch {
    console.error(`audit-gate: could not read the audit report for ${dir}`);
    console.error(String(out).slice(0, 2000));
    process.exit(1);
  }
}

const report = audit();
const vulnerabilities = Object.entries(report.vulnerabilities ?? {})
  .filter(([, value]) => BLOCKING.has(value.severity))
  .sort(([a], [b]) => a.localeCompare(b));

const blocking = vulnerabilities.filter(([name]) => !allowed.has(name));

for (const [name, value] of vulnerabilities) {
  const titles = (value.via ?? [])
    .map((via) => (typeof via === "string" ? via : via.title))
    .filter(Boolean);
  const mark = allowed.has(name) ? "allowed" : "BLOCKING";
  console.log(
    `${value.severity.toUpperCase()} ${name} ${value.range ?? ""} [${mark}]`,
  );
  for (const title of titles) {
    console.log(`    ${title}`);
  }
}

const counts = report.metadata?.vulnerabilities ?? {};
console.log(
  `\n${dir}: ${counts.critical ?? 0} critical, ${counts.high ?? 0} high, ` +
    `${counts.moderate ?? 0} moderate, ${counts.low ?? 0} low` +
    (allowed.size > 0 ? ` (allowed: ${[...allowed].join(", ")})` : ""),
);

if (blocking.length > 0) {
  console.error(
    `\naudit-gate: ${blocking.length} unaccepted high/critical advisory(s) in ${dir}: ` +
      `${blocking.map(([name]) => name).join(", ")}`,
  );
  process.exit(1);
}

// An allow list that outlives its reason is worse than no allow list: it keeps
// passing after the advisory is gone and nobody notices it is still there.
const stale = [...allowed].filter(
  (name) => !vulnerabilities.some(([vuln]) => vuln === name),
);
if (stale.length > 0) {
  console.error(
    `\naudit-gate: these packages are allowed but no longer report a high or ` +
      `critical advisory - remove them from --allow: ${stale.join(", ")}`,
  );
  process.exit(1);
}
