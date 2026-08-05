import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const workflowsDir = join(root, '.github', 'workflows');
const releaseTriggersDir = join(root, '.github', 'release-triggers');
const files = readdirSync(workflowsDir).filter((name) => /\.ya?ml$/i.test(name));
const violations = [];

const forbidden = [
  /\beas\s+build\b/i,
  /\beas\s+submit\b/i,
  /--auto-submit/i,
  /\bworkflow_run\s*:/i,
  /\bschedule\s*:/i,
  /git\s+push\s+origin\s+HEAD:main/i,
  /gh\s+pr\s+merge/i,
  /gh\s+workflow\s+run/i,
  /gh\s+run\s+rerun/i,
];

for (const file of files) {
  if (file === 'quality-gate.yml') continue;
  const source = readFileSync(join(workflowsDir, file), 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(source)) violations.push(`${file}: ${pattern}`);
  }
}

const unexpected = files.filter((file) => file !== 'quality-gate.yml');
if (unexpected.length) {
  violations.push(`unexpected active workflows: ${unexpected.join(', ')}`);
}

if (existsSync(releaseTriggersDir)) {
  const triggerFiles = readdirSync(releaseTriggersDir);
  if (triggerFiles.length) {
    violations.push(`active release triggers remain: ${triggerFiles.join(', ')}`);
  }
}

if (violations.length) {
  throw new Error(`Unsafe release automation found:\n- ${violations.join('\n- ')}`);
}

console.log('Release automation audit passed: only the source-only quality gate is active.');
