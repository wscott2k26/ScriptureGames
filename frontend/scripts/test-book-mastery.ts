import assert from 'node:assert/strict';

import {
  BOOK_MASTERY_BOOKS,
  buildMasteryRound,
  getMasteryQuestionPool,
} from '../src/book-mastery.ts';

assert.deepEqual(
  BOOK_MASTERY_BOOKS.filter((book) => book.testament === 'old').map((book) => book.title),
  ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'],
  'The first five Old Testament books must be the free mastery shelf.',
);
assert.deepEqual(
  BOOK_MASTERY_BOOKS.filter((book) => book.testament === 'new').map((book) => book.title),
  ['Matthew', 'Mark', 'Luke', 'John', 'Acts'],
  'The first five New Testament books must be the free mastery shelf.',
);

for (const book of BOOK_MASTERY_BOOKS) {
  const pool = getMasteryQuestionPool(book.id);
  const corePool = pool.filter((question) => question.tier === 'core');
  assert.ok(corePool.length >= 10, `${book.title} must provide at least 10 free questions.`);
  assert.ok(pool.length >= 25, `${book.title} must provide at least 25 total questions.`);

  const core = buildMasteryRound(book.id, 'core', 11);
  const extended = buildMasteryRound(book.id, 'extended', 11);
  assert.equal(core.length, 5, `${book.title} core rounds must contain five questions.`);
  assert.equal(extended.length, 10, `${book.title} extended rounds must contain ten questions.`);
  assert.equal(new Set(core.map((question) => question.concept)).size, core.length, `${book.title} core rounds cannot repeat a passage.`);
  assert.equal(new Set(extended.map((question) => question.concept)).size, extended.length, `${book.title} extended rounds cannot repeat a passage.`);
  assert.deepEqual(core.map((question) => question.order), [...core.map((question) => question.order)].sort((a, b) => a - b));
  assert.deepEqual(extended.map((question) => question.order), [...extended.map((question) => question.order)].sort((a, b) => a - b));

  for (const question of pool) {
    assert.equal(question.referenceVisibility, 'reader-only');
    assert.equal(new Set(question.options).size, 4, `${question.id} must have four distinct answers.`);
    assert.ok(question.answer >= 0 && question.answer < 4, `${question.id} needs a valid answer index.`);
  }
}

console.log('Book Mastery tests passed.');
