import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const tabs = read('app/(tabs)/_layout.tsx');
assert.match(tabs, /name="bible-journey"[^>]*title: 'Journey'/s, 'The visible Journey tab must point to the additive Bible Journey hub.');
assert.match(tabs, /name="journey"[^>]*href: null/s, 'The existing Genesis map must stay available as a hidden route.');
assert.match(tabs, /detachInactiveScreens/);
assert.match(tabs, /freezeOnBlur: true/);
assert.doesNotMatch(tabs, /detachInactiveScreens=\{false\}/);

const hub = read('app/(tabs)/bible-journey.tsx');
for (const token of [
  'Continue Bible Journey',
  'Choose Any Book',
  "pathname: '/book-season'",
  "router.push('/book-library')",
  "router.push('/(tabs)/journey')",
  'loadBibleJourneyProgress',
  'syncGenesisJourneyCompletion',
  '66',
]) assert.equal(hub.includes(token), true, `Bible Journey hub must include ${token}.`);

const library = read('app/book-library.tsx');
for (const token of [
  'BIBLE_JOURNEY_BOOKS',
  'TextInput',
  'Old Testament',
  'New Testament',
  "router.push('/premium')",
  "pathname: '/book-season'",
  'Not Started',
  'In Progress',
  'Completed',
]) assert.equal(library.includes(token), true, `Book Library must include ${token}.`);

const season = read('app/book-season.tsx');
for (const token of [
  'buildBookTrials',
  'loadBibleJourneyProgress',
  "router.replace('/book-library')",
  "router.replace('/premium')",
  "pathname: '/book-trial'",
  'Return to Book Library',
]) assert.equal(season.includes(token), true, `Book season route must include ${token}.`);

const trial = read('app/book-trial.tsx');
for (const token of [
  'recordBibleJourneyTrial',
  'recordDailyCompletion',
  'question.explanation',
  "router.replace('/book-library')",
  "pathname: '/book-season'",
  'Save failed',
]) assert.equal(trial.includes(token), true, `Book trial route must include ${token}.`);

const victory = read('app/book-victory.tsx');
for (const token of [
  'completeBibleJourneyBook',
  'Continue to',
  'Choose Any Bible Book',
  'Replay',
  "router.replace('/book-library')",
]) assert.equal(victory.includes(token), true, `Book victory route must include ${token}.`);

const genesisVictory = read('app/season-victory.tsx');
assert.equal(genesisVictory.includes('Continue to Exodus'), true, 'Genesis Victory Hall must offer the next canonical book.');
assert.equal(genesisVictory.includes('Choose Any Bible Book'), true, 'Genesis Victory Hall must open the full library.');
assert.equal(genesisVictory.includes("params: { bookId: 'EXO' }"), true, 'Genesis handoff must target Exodus explicitly.');
assert.equal(genesisVictory.includes('Replay the Final Genesis Trial'), true, 'Existing Genesis replay action must remain.');
assert.equal(genesisVictory.includes('Return to Genesis Map'), true, 'Existing Genesis map action must remain.');

console.log('Bible journey route contract tests passed.');
