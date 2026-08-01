import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BIBLE_JOURNEY_BOOKS } from '../src/bible-journey/catalog.ts';
import { PREMIUM_PRODUCT_ID, hasValidatedPremiumEntitlement } from '../src/premium-entitlement-core.ts';
const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const failures: string[] = [];
function check(name: string, run: () => void) { try { run(); } catch (error) { failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`); } }
check('four free books', () => assert.deepEqual(BIBLE_JOURNEY_BOOKS.filter((book) => book.access === 'free').map((book) => book.id), ['GEN', 'EXO', 'LEV', 'MAT']));
check('remaining books Premium', () => { for (const id of ['NUM', 'MRK', 'REV']) assert.equal(BIBLE_JOURNEY_BOOKS.find((book) => book.id === id)?.access, 'premium'); });
check('validated entitlement only', () => {
  assert.equal(hasValidatedPremiumEntitlement({ is_premium: true }), false);
  assert.equal(hasValidatedPremiumEntitlement({ is_premium: true, premium_entitlement_source: 'app-store', premium_product_id: PREMIUM_PRODUCT_ID }), true);
  assert.equal(hasValidatedPremiumEntitlement({ is_premium: true, premium_entitlement_source: 'app-store', premium_product_id: 'wrong' }), false);
});
const localApi = read('src/local-api.ts');
check('honest profile migration', () => { assert.match(localApi, /is_premium:\s*false/); assert.match(localApi, /normalizeLegacyPremiumProfile/); assert.doesNotMatch(localApi, /TestFlight beta ships with all content unlocked/); });
const provider = read('src/premium-entitlement.tsx');
check('provider validates', () => { assert.match(provider, /hasValidatedPremiumEntitlement\(profile\)/); assert.doesNotMatch(provider, /Boolean\(profile\?\.is_premium\)/); });
const audio = read('src/audio-context.tsx');
check('piano load gate', () => { assert.match(audio, /useAudioPlayerStatus/); assert.match(audio, /if \(!pianoStatus\.isLoaded\) return/); });
const quiz = read('app/quiz-play.tsx');
check('quiz selected photo and warm panels', () => { assert.doesNotMatch(quiz, /GENESIS_BACKGROUNDS\['trial-09'\]/); assert.match(quiz, /<CinematicBackdrop darkness=/); assert.match(quiz, /rgba\(249,242,224,0\.93\)/); });
check('post-answer Bible lookup', () => { assert.match(quiz, /if \(!checked \|\| !question\?\.verse\) return/); assert.match(quiz, /label="Open in Bible"/); assert.match(quiz, /pathname: '\/\(tabs\)\/bible'/); assert.match(quiz, /fromQuiz: '1'/); });
const bible = read('app/(tabs)/bible.tsx');
check('Bible return flow', () => { assert.match(bible, /useLocalSearchParams/); assert.match(bible, /parseBibleReference\(String\(reference\)\)/); assert.match(bible, /Return to Quiz/); assert.match(bible, /router\.back\(\)/); });
const premium = read('app/premium.tsx');
const tutorial = read('src/tutorial-core.ts');
check('four-book copy', () => { assert.match(premium, /Genesis, Exodus, Leviticus, and Matthew/); assert.match(premium, /Four Full Books/); assert.match(tutorial, /Genesis, Exodus, Leviticus, and Matthew/); assert.doesNotMatch(`${premium}
${tutorial}`, /first three|Three Full Books|Books 4.?66|Numbers through Revelation|beyond the first three/i); });
check('Genesis preserved', () => assert.match(read('app/genesis-quiz.tsx'), /preserveSource/));
if (failures.length) throw new Error(`Build 15 regression contract failed:
- ${failures.join('
- ')}`);
console.log('Build 15 regression contract passed.');
