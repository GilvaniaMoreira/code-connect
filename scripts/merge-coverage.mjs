// Merges Jest (api) and Vitest (web) coverage-final.json reports into a
// combined nyc-generated summary. Run via `pnpm coverage`.
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const apiCoverage = join(root, 'apps/api/coverage/coverage-final.json');
const webCoverage = join(root, 'apps/web/coverage/coverage-final.json');

for (const [label, path] of [
  ['api', apiCoverage],
  ['web', webCoverage],
]) {
  if (!existsSync(path)) {
    console.error(
      `[merge-coverage] ${label} coverage not found at ${path}. ` +
        `Run \`pnpm --filter ${label} test:cov\` first.`,
    );
    process.exit(1);
  }
}

const outDir = join(root, 'coverage');
const tmpDir = join(outDir, 'tmp');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });

copyFileSync(apiCoverage, join(tmpDir, 'api.json'));
copyFileSync(webCoverage, join(tmpDir, 'web.json'));

// nyc report reads every *.json in --temp-dir and merges them internally.
execSync(
  `nyc report --temp-dir "${tmpDir}" --report-dir "${outDir}" ` +
    `--reporter=text-summary --reporter=lcov --reporter=html`,
  { stdio: 'inherit', cwd: root },
);

rmSync(tmpDir, { recursive: true, force: true });
console.log(`\nMerged coverage report written to ${outDir}`);
