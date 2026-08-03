import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const mastery = read('src/components/premium/MasteryAnswerFeedback.tsx');
for (const token of [
  'useMotionIntensity',
  'withSequence',
  'withSpring',
  "state: 'idle' | 'selected' | 'correct' | 'wrong'",
  'pointerEvents="none"',
]) assert.equal(mastery.includes(token), true, `Mastery feedback must include ${token}.`);
for (const forbidden of ['score', 'answer:', 'recordBibleJourneyTrial', 'completeBibleJourneyBook']) {
  assert.equal(mastery.includes(forbidden), false, `Decorative feedback must not own grading or progress logic: ${forbidden}.`);
}

const trial = read('app/book-trial.tsx');
assert.equal(trial.includes('MasteryAnswerFeedback'), true, 'Reusable book trials must render intentional answer feedback.');
assert.equal(trial.includes("state={right ? 'correct' : wrong ? 'wrong' : chosen ? 'selected' : 'idle'}"), true, 'Feedback state must derive from the existing answer state without changing it.');
assert.equal(trial.includes('question.explanation'), true, 'Explanations must remain visible after feedback.');
assert.equal(trial.includes('recordBibleJourneyTrial'), true, 'The existing save path must remain authoritative.');

const genesis = read('app/genesis-quiz.tsx');
for (const existingRule of [
  'completeSeasonTrial',
  'trial.manna',
  'trial.xp',
  'api.completeNode',
  "material={right ? 'gold' : wrong ? 'danger' : chosen ? 'bronze' : 'stone'}",
]) assert.equal(genesis.includes(existingRule), true, `Genesis gameplay rule must remain present: ${existingRule}.`);

const scanRoots = ['app', 'src'];
const userFacingText: string[] = [];
function walk(path: string) {
  for (const name of readdirSync(resolve(root, path))) {
    const relative = `${path}/${name}`;
    const absolute = resolve(root, relative);
    if (statSync(absolute).isDirectory()) walk(relative);
    else if (/\.(tsx|ts)$/.test(name)) userFacingText.push(read(relative));
  }
}
for (const path of scanRoots) walk(path);
const combined = userFacingText.join('\n').toLowerCase();
for (const forbidden of [
  'you failed god',
  'your faith is weak',
  'pay to repair your streak',
  'buy a streak repair',
]) assert.equal(combined.includes(forbidden), false, `Forbidden guilt or pay-to-win copy found: ${forbidden}.`);

console.log('Bible Journey mastery feedback and healthy-retention safeguards passed.');
