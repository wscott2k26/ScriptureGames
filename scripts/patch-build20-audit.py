from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'frontend/scripts/audit-book-mastery.ts'

TARGET.write_text(r'''import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  BOOK_MASTERY_BOOKS,
  buildMasteryQuestionPool,
  buildMasteryRoundFromPool,
  type BibleBookForMastery,
} from '../src/book-mastery-core.ts';
import { QUIZ_QUESTIONS } from '../src/content.generated.ts';
import {
  QUIZ_REFERENCE_OVERRIDES,
  hasExplicitQuizReferenceOverride,
  resolveQuizReference,
} from '../src/quiz-reference-resolution.ts';
import { passageLocationFromReference } from '../src/quiz-ordering.ts';

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}

function fakeBibleBook(bookId: string, title: string): BibleBookForMastery {
  return {
    id: bookId,
    name: title,
    chapters: Array.from({ length: 30 }, (_, chapterIndex) =>
      Array.from({ length: 20 }, (_, verseIndex) => [
        verseIndex + 1,
        `${title} chapter ${chapterIndex + 1} verse ${verseIndex + 1} contains unique verified audit wording ${bookId}-${chapterIndex}-${verseIndex}.`,
      ] as const),
    ),
  };
}

const expectedOld = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];
const expectedNew = ['Matthew', 'Mark', 'Luke', 'John', 'Acts'];

assert.deepEqual(BOOK_MASTERY_BOOKS.filter((book) => book.testament === 'old').map((book) => book.title), expectedOld);
assert.deepEqual(BOOK_MASTERY_BOOKS.filter((book) => book.testament === 'new').map((book) => book.title), expectedNew);
assert.equal(BOOK_MASTERY_BOOKS.length, 10, 'Exactly ten free Book Mastery fields must ship in this add-on.');

for (const book of BOOK_MASTERY_BOOKS) {
  const pool = buildMasteryQuestionPool(book, fakeBibleBook(book.bookId, book.title));
  const core = pool.filter((question) => question.tier === 'core');
  assert.ok(core.length >= 10, `${book.title} needs at least 10 core questions.`);
  assert.ok(pool.length >= 25, `${book.title} needs at least 25 total questions.`);
  assert.equal(new Set(pool.map((question) => question.id)).size, pool.length, `${book.title} question IDs must be unique.`);
  assert.equal(new Set(pool.map((question) => question.concept)).size, pool.length, `${book.title} concepts must be unique.`);

  for (const question of pool) {
    assert.equal(question.referenceVisibility, 'reader-only', `${question.id} must hide its reference before answering.`);
    assert.ok(passageLocationFromReference(question.reference), `${question.id} must open a valid passage.`);
    assert.equal(question.options.length, 4, `${question.id} must have four options.`);
    assert.equal(new Set(question.options).size, 4, `${question.id} options must be distinct.`);
    assert.ok(question.answer >= 0 && question.answer < question.options.length, `${question.id} answer index is invalid.`);
  }

  for (const mode of ['core', 'extended'] as const) {
    const round = buildMasteryRoundFromPool(pool, mode, 20260802);
    const expectedLength = mode === 'core' ? 5 : 10;
    assert.equal(round.length, expectedLength, `${book.title} ${mode} round length is wrong.`);
    assert.equal(new Set(round.map((question) => question.concept)).size, round.length, `${book.title} ${mode} round repeats a passage.`);
    const order = round.map((question) => question.order);
    assert.deepEqual(order, [...order].sort((a, b) => a - b), `${book.title} ${mode} round is not chronological.`);
  }
}

const quizBanks = QUIZ_QUESTIONS as unknown as Record<string, readonly { q: string; verse?: string }[]>;
const seenQuestions = new Set<string>();
let classicQuestionCount = 0;
for (const [topic, questions] of Object.entries(quizBanks)) {
  for (const [index, question] of questions.entries()) {
    classicQuestionCount += 1;
    seenQuestions.add(question.q);
    const rawReference = question.verse?.trim();
    const rawIsValid = Boolean(rawReference && passageLocationFromReference(rawReference));
    const resolvedReference = resolveQuizReference(question.q, question.verse);
    assert.ok(
      passageLocationFromReference(resolvedReference),
      `${topic} question ${index + 1} cannot open resolved Scripture: ${resolvedReference}`,
    );
    if (!rawIsValid) {
      assert.ok(
        hasExplicitQuizReferenceOverride(question.q),
        `${topic} question ${index + 1} needs an explicit Scripture override: ${question.q}`,
      );
    }
  }
}
assert.ok(classicQuestionCount >= 100, 'The canonical quiz seed should contain a substantial question bank.');
for (const [question, reference] of Object.entries(QUIZ_REFERENCE_OVERRIDES)) {
  assert.ok(seenQuestions.has(question), `Stale Scripture override does not match a quiz question: ${question}`);
  assert.ok(passageLocationFromReference(reference), `Scripture override cannot open: ${question} -> ${reference}`);
}

const genesisSource = readSource('../src/genesis-season.ts');
const genesisReferences = [...genesisSource.matchAll(/'(Genesis\s+\d+(?::\d+)?(?:[–-]\d+)?)'/g)].map((match) => match[1]);
assert.ok(genesisReferences.length >= 50, 'Genesis season should retain its Scripture-grounded question references.');
for (const reference of genesisReferences) {
  assert.ok(passageLocationFromReference(reference), `Genesis trial reference cannot open: ${reference}`);
}

const classicScreen = readSource('../app/quiz-play.tsx');
const genesisScreen = readSource('../app/genesis-quiz.tsx');
const dailyScreen = readSource('../app/daily-challenge.tsx');
const masteryScreen = readSource('../app/book-mastery.tsx');
const scriptureLink = readSource('../src/components/ScriptureLink.tsx');
const bibleScreen = readSource('../app/(tabs)/bible.tsx');
const quizHub = readSource('../app/(tabs)/quiz.tsx');

assert.match(classicScreen, /resolveQuizReference/, 'Classic Training must resolve every Scripture reference.');
assert.match(classicScreen, /quiz-scripture-reference/, 'Classic Training must link right and wrong feedback to Scripture.');
assert.match(dailyScreen, /resolveQuizReference/, 'Daily Bread must resolve every Scripture reference.');
assert.match(dailyScreen, /Read it in context:/, 'Daily Bread feedback must provide a contextual Scripture link.');
assert.ok((dailyScreen.match(/<ScriptureLink/g) || []).length >= 3, 'Daily Bread must retain question, feedback, and Witness Card Scripture links.');
assert.ok((genesisScreen.match(/<ScriptureLink/g) || []).length >= 3, 'Genesis must retain question, feedback, and result Scripture links.');
assert.match(masteryScreen, /from '@\/src\/components\/ScriptureLink'/, 'Book Mastery must reuse the proven ScriptureLink component.');
assert.match(masteryScreen, /mastery-feedback-scripture/, 'Book Mastery must link right and wrong feedback to Scripture.');
assert.match(masteryScreen, /Open Passage Before Answering/, 'Book Mastery must provide passage reading before answering.');
assert.match(masteryScreen, /REFERENCE REVEALED AFTER ANSWER/, 'Book Mastery must not print an answer-giving reference before grading.');

assert.match(scriptureLink, /router\.navigate/, 'Shared Scripture links must preserve the originating screen in navigation history.');
assert.match(scriptureLink, /pathname: '\/\(tabs\)\/bible'/, 'Shared Scripture links must use the proven Bible tab destination.');
assert.match(scriptureLink, /returnLabel/, 'Shared Scripture links must preserve a contextual return label.');
assert.match(bibleScreen, /fromScriptureLink/, 'The Bible tab must recognize shared Scripture-link navigation.');
assert.match(bibleScreen, /returnLabel/, 'The Bible tab must display contextual return behavior.');

assert.match(quizHub, /Scripture Fields/, 'Existing Scripture Fields section must remain.');
assert.match(quizHub, /Memory & Skill/, 'Existing Memory & Skill section must remain.');
assert.match(quizHub, /Old Testament Books/, 'Old Testament book shelf is missing.');
assert.match(quizHub, /New Testament Books/, 'New Testament book shelf is missing.');

console.log('Book Mastery and recovered clickable Scripture audit passed.');
''', encoding='utf-8')

print('Recovered Book Mastery audit now validates the proven Build 18 ScriptureLink/Bible path.')
