import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { BIBLE_JOURNEY_BOOKS } from '../src/bible-journey/catalog.ts';
import { canOpenJourneyBook } from '../src/bible-journey/access.ts';

const root = path.resolve(import.meta.dirname, '..');
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative: string) => fs.existsSync(path.join(root, relative));

function requireText(source: string, needle: string, label: string) {
  if (!source.includes(needle)) throw new Error(`${label} is missing: ${needle}`);
}

const preferences = read('app/(tabs)/preferences.tsx');
const audio = read('src/audio-context.tsx');
const preferenceCore = read('src/preferences-core.ts');
const lumi = read('app/(tabs)/companion.tsx');
const quizHub = read('app/(tabs)/quiz.tsx');
const quizPlay = read('app/quiz-play.tsx');
const localApi = read('src/local-api.ts');
const packageJson = read('package.json');

requireText(preferences, 'Choose Peaceful Background', 'Background picker control');
requireText(preferences, 'Soft Piano', 'Soft Piano option');
requireText(preferences, 'Gentle Rain', 'Gentle Rain option');
requireText(preferences, 'Quiet Reading Room', 'Quiet Reading Room option');
requireText(preferenceCore, "ambientSound: 'piano'", 'Default ambient sound');
requireText(audio, 'SOFT_RAIN_BASE64', 'Bundled rain ambience');
requireText(audio, 'READING_ROOM_BASE64', 'Bundled reading ambience');
requireText(audio, 'configureLumiVoiceAudio', 'Lumi/audio handoff');
requireText(lumi, "useSpeechRecognitionEvent('result'", 'Lumi microphone transcript handling');
requireText(lumi, 'startLumiListening', 'Lumi press-to-talk control');
requireText(lumi, 'TextInput', 'Lumi typed composer');

if (!exists('src/book-mastery-core.ts') || !exists('src/book-mastery.ts') || !exists('app/book-mastery.tsx')) {
  throw new Error('Ten-book Book Mastery files are missing.');
}
const masteryCore = read('src/book-mastery-core.ts');
requireText(quizHub, 'Old Testament Books', 'Old Testament mastery shelf');
requireText(quizHub, 'New Testament Books', 'New Testament mastery shelf');
requireText(masteryCore, "title: 'Genesis', testament: 'old'", 'First free Old Testament book');
requireText(masteryCore, "title: 'Matthew', testament: 'new'", 'First free New Testament book');
requireText(read('app/book-mastery.tsx'), "from '@/src/components/ScriptureLink'", 'Proven Scripture link reuse');
requireText(localApi, 'sortSelectedQuizQuestions', 'Chronological classic quiz ordering');
requireText(quizPlay, 'withResolvedQuizReference', 'Resolved clickable classic references');
requireText(packageJson, 'test:build20', 'Build 20 regression script');
requireText(packageJson, 'test:book-mastery', 'Book Mastery test script');
requireText(packageJson, 'test:quiz-ordering', 'Chronology test script');

const expectedOpenJourneyBooks = ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'MAT', 'MRK', 'LUK', 'JHN', 'ACT'];
assert.deepEqual(
  BIBLE_JOURNEY_BOOKS.filter((book) => book.access === 'free').map((book) => book.id),
  expectedOpenJourneyBooks,
  'Build 21 must open exactly the first five Old Testament and first five New Testament Journey books.',
);
for (const bookId of expectedOpenJourneyBooks) {
  assert.equal(canOpenJourneyBook(bookId, false), true, `${bookId} must open without Premium.`);
}
for (const bookId of ['JOS', 'ROM']) {
  assert.equal(canOpenJourneyBook(bookId, false), false, `${bookId} must remain Premium-gated.`);
}

const bookTrial = read('app/book-trial.tsx');
requireText(bookTrial, "from '@/src/components/ScriptureLink'", 'Shared ScriptureLink in non-Genesis trials');
requireText(bookTrial, "question.kind === 'reference'", 'Explicit reference-question giveaway guard');
requireText(bookTrial, 'REFERENCE REVEALED AFTER ANSWER', 'Hidden label for reference-identification questions');
requireText(bookTrial, 'testID="book-trial-question-scripture"', 'Clickable pre-answer lookup for normal Journey questions');
requireText(bookTrial, 'testID="book-trial-feedback-scripture"', 'Clickable post-answer Journey reference');
requireText(bookTrial, 'testID="book-trial-result-scripture"', 'Clickable completed-trial Journey reference');
if (bookTrial.includes('<Text style={styles.explanationReference}>{question.reference}</Text>')) {
  throw new Error('Non-Genesis post-answer Scripture remains plain text instead of a clickable link.');
}

const masteryScreen = read('app/book-mastery.tsx');
requireText(masteryScreen, 'testID="mastery-question-scripture"', 'Book Mastery pre-answer passage lookup');
requireText(masteryScreen, 'testID="mastery-feedback-scripture"', 'Book Mastery post-answer Scripture lookup');
const masteryLinkCount = (masteryScreen.match(/<ScriptureLink/g) || []).length;
assert.equal(masteryLinkCount, 2, 'Book Mastery must expose one pre-answer lookup and one post-answer reference.');

for (const obsolete of [
  '../.github/workflows/ios-build18-testflight-once.yml',
  '../.github/status-triggers/ios-build18-authorized.md',
  '../.github/workflows/build19-status-watch.yml',
]) {
  if (fs.existsSync(path.resolve(root, obsolete))) throw new Error(`Obsolete release machinery remains: ${obsolete}`);
}

console.log('Build 20/21 recovery contract passed: restored experience, ten open Journey books, conditional pre-answer Scripture visibility, clickable post-answer Scripture, mastery, chronology, and three ambient choices coexist.');
