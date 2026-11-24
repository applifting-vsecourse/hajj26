#!/usr/bin/env node
// Fails when a branch removes or rewrites lines in existing tests.
//
//   node scripts/check-test-changes.js <base-ref>     e.g. origin/main
//
// Compares <base-ref>...HEAD (what the branch changed since it forked).
// Adding is always fine — new test files, new tests, new checks in a test.
// A test file with any removed line (deleted, edited or rewritten) is listed
// and the script exits 1. A pure rename with no edits is not a removal.
const { execFileSync } = require('child_process');

const base = process.argv[2];
if (!base) {
  console.error('Usage: node scripts/check-test-changes.js <base-ref>');
  process.exit(2);
}

const TEST_FILE =
  /(\.spec\.ts|\.int-spec\.ts|\.test\.tsx)$|^apps\/frontend\/e2e\//;

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// -z keeps paths verbatim; a rename comes as "added\tdeleted\t" + old + new.
const tokens = git('diff', '--numstat', '-z', '-M', `${base}...HEAD`).split(
  '\0',
);
const added = new Set(
  git('diff', '--name-only', '-z', '--diff-filter=A', `${base}...HEAD`)
    .split('\0')
    .filter(Boolean),
);

const offenders = [];
for (let i = 0; i < tokens.length; i++) {
  if (!tokens[i]) continue;
  const [plus, minus, path] = tokens[i].split('\t');
  const paths = path ? [path] : [tokens[++i], tokens[++i]];
  const current = paths[paths.length - 1];
  if (!paths.some((p) => TEST_FILE.test(p))) continue;

  // Binary files report "-": count them as rewritten unless newly added.
  const removed =
    minus === '-' ? (added.has(current) ? 0 : Infinity) : Number(minus);
  if (removed > 0) offenders.push({ path: paths.join(' → '), plus, minus });
}

if (offenders.length === 0) {
  console.log(`✔ Test files since ${base}: only added lines.`);
  process.exit(0);
}

console.log(`✖ Test files with removed or rewritten lines since ${base}:\n`);
for (const { path, plus, minus } of offenders) {
  console.log(`  ${path}  (+${plus} −${minus})`);
  // Shows up as an annotation on the pull request.
  if (process.env.GITHUB_ACTIONS) {
    console.log(
      `::error file=${path.split(' → ').pop()}::Existing test lines were removed or rewritten (−${minus})`,
    );
  }
}
console.log(
  '\nChanging an existing test changes what "passing" means — make sure that was intended.',
);
process.exit(1);
