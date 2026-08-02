import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  BOOK_MASTERY_BOOKS,
  buildMasteryQuestionPool,
  buildMasteryRoundFromPool,
  type BibleBookForMastery,
} from '../src/book-mastery-core.ts';
import { passageLocationFromReference } from '../src/quiz-ordering.ts';

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

const seedData = readFileSync(new URL('../../backend/seed_data.py', import.meta.url), 'utf8');
const seedReferences = [...seedData.matchAll(/["']verse["']:\s*["']([^"']+)["']/g)].map((match) => match[1]);
assert.ok(seedReferences.length >= 100, 'The canonical quiz seed should contain a substantial set of Scripture references.');
for (const reference of seedReferences) {
  assert.ok(passageLocationFromReference(reference), `Classic quiz reference cannot open: ${reference}`);
}

const genesisSource = readFileSync(new URL('../src/genesis-season.ts', import.meta.url), 'utf8');
const genesisReferences = [...genesisSource.matchAll(/'(Genesis\s+\d+(?::\d+)?(?:[–-]\d+)?)'/g)].map((match) => match[1]);
assert.ok(genesisReferences.length >= 50, 'Genesis season should retain its Scripture-grounded question references.');
for (const reference of genesisReferences) {
  assert.ok(passageLocationFromReference(reference), `Genesis trial reference cannot open: ${reference}`);
}

const classicScreen = readFileSync(new URL('../app/quiz-play.tsx', import.meta.url), 'utf8');
const genesisScreen = readFileSync(new URL('../app/genesis-quiz.tsx', import.meta.url), 'utf8');
const dailyScreen = readFileSync(new URL('../app/daily-challenge.tsx', import.meta.url), 'utf8');
const masteryScreen = readFileSync(new URL('../app/book-mastery.tsx', import.meta.url), 'utf8');
const passageReader = readFileSync(new URL('../app/passage-reader.tsx', import.meta.url), 'utf8');
const quizHub = readFileSync(new URL('../app/(tabs)/quiz.tsx', import.meta.url), 'utf8');

assert.match(classicScreen, /quiz-feedback-scripture/, 'Classic Training must link feedback to Scripture.');
assert.match(genesisScreen, /genesis-feedback-scripture/, 'Genesis trials must link feedback to Scripture.');
assert.match(dailyScreen, /daily-feedback-scripture/, 'Daily Bread must link feedback to Scripture.');
assert.match(masteryScreen, /mastery-feedback-scripture/, 'Book Mastery must link feedback to Scripture.');
assert.doesNotMatch(genesisScreen, />\{question\.reference\}<\/Text>/, 'Genesis must not print the answer reference above the question.');
assert.match(masteryScreen, /Open Passage Before Answering/, 'Book Mastery must provide passage reading before answering.');
assert.match(passageReader, /router\.back\(\)/, 'The passage reader must return without replacing mastery state.');
assert.match(quizHub, /Scripture Fields/, 'Existing Scripture Fields section must remain.');
assert.match(quizHub, /Memory & Skill/, 'Existing Memory & Skill section must remain.');
assert.match(quizHub, /Old Testament Books/, 'Old Testament book shelf is missing.');
assert.match(quizHub, /New Testament Books/, 'New Testament book shelf is missing.');

console.log('Book Mastery and clickable Scripture audit passed.');
