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
  assert.match(audio, /if \(!pianoStatus\.isLoaded\) return/);
});

const premiumPage = read('app/premium.tsx');
check('Premium copy names all four free books', () => {
  assert.match(premiumPage, /Genesis, Exodus, Leviticus, and Matthew/);
  assert.match(premiumPage, /Four Full Books/);
});

if (failures.length) {
  throw new Error(`Build 15 regression contract failed:\n- ${failures.join('\n- ')}`);
}

console.log('Build 15 piano, entitlement, and four-free-book regression tests passed.');
