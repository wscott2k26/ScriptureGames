import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { BIBLE_JOURNEY_BOOKS } from '../src/bible-journey/catalog.ts';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const failures: string[] = [];

function check(name: string, run: () => void) {
  try {
    run();
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

check('free journey books cover both Testaments', () => {
  const freeIds = BIBLE_JOURNEY_BOOKS.filter((book) => book.access === 'free').map((book) => book.id);
  assert.deepEqual(freeIds, ['GEN', 'EXO', 'LEV', 'MAT']);
});

check('Numbers and the remaining New Testament stay Premium', () => {
  assert.equal(BIBLE_JOURNEY_BOOKS.find((book) => book.id === 'NUM')?.access, 'premium');
  assert.equal(BIBLE_JOURNEY_BOOKS.find((book) => book.id === 'MRK')?.access, 'premium');
  assert.equal(BIBLE_JOURNEY_BOOKS.find((book) => book.id === 'REV')?.access, 'premium');
});

const localApi = read('src/local-api.ts');
check('new local profiles do not receive beta Premium', () => {
  assert.match(localApi, /is_premium:\s*false/);
  assert.doesNotMatch(localApi, /TestFlight beta ships with all content unlocked/);
});

check('legacy beta Premium is normalized without deleting progress', () => {
  assert.match(localApi, /normalizeLegacyPremiumProfile/);
  assert.match(localApi, /hasValidatedPremiumEntitlement/);
  assert.match(localApi, /completed_nodes/);
  assert.match(localApi, /badges/);
});

const entitlement = read('src/premium-entitlement-core.ts');
check('Premium requires a validated store claim', () => {
  assert.match(entitlement, /hasValidatedPremiumEntitlement/);
  assert.match(entitlement, /premium_entitlement_source/);
  assert.match(entitlement, /premium_product_id/);
});

const provider = read('src/premium-entitlement.tsx');
check('the provider does not trust the legacy boolean alone', () => {
  assert.match(provider, /hasValidatedPremiumEntitlement\(profile\)/);
  assert.doesNotMatch(provider, /Boolean\(profile\?\.is_premium\)/);
});

const audio = read('src/audio-context.tsx');
check('ambient music waits for the piano player to load', () => {
  assert.match(audio, /useAudioPlayerStatus/);
  assert.match(audio, /pianoStatus\.isLoaded/);
  assert.match(audio, /if \([^\n]*!pianoStatus\.isLoaded[^\n]*\) return/);
});

const quiz = read('app/quiz-play.tsx');
check('ordinary quizzes follow the selected peaceful background', () => {
  assert.doesNotMatch(quiz, /GENESIS_BACKGROUNDS\['trial-09'\]/);
  assert.doesNotMatch(quiz, /from '@\/src\/genesis-season'/);
  const wrappers = quiz.match(/<CinematicBackdrop\s+darkness=/g) || [];
  assert.ok(wrappers.length >= 3, `expected at least three selected-photo quiz wrappers, found ${wrappers.length}`);
});

const genesisQuiz = read('app/genesis-quiz.tsx');
check('Genesis quiz keeps its approved artwork', () => {
  assert.match(genesisQuiz, /preserveSource/);
});

const premiumPage = read('app/premium.tsx');
check('Premium copy names all four free books', () => {
  assert.match(premiumPage, /Genesis, Exodus, Leviticus, and Matthew/);
  assert.match(premiumPage, /Four Full Books/);
  assert.match(premiumPage, /remaining 62/i);
});

check('stale three-book boundary copy is removed', () => {
  const files = [
    premiumPage,
    read('app/book-library.tsx'),
    read('app/(tabs)/bible-journey.tsx'),
    read('app/tutorial.tsx'),
  ].join('\n');
  assert.doesNotMatch(files, /first three|Three Full Books|Books 4.?66|Numbers through Revelation|beyond the first three/i);
});

if (failures.length) {
  throw new Error(`Build 15 regression contract failed:\n- ${failures.join('\n- ')}`);
}

console.log('Build 15 piano, entitlement, four-free-book, and quiz-background regression tests passed.');
