import assert from 'node:assert/strict';
import {
  BIBLE_JOURNEY_BOOKS,
  getJourneyBook,
  getNextJourneyBook,
  isBookFree,
} from '../src/bible-journey/catalog.ts';

assert.equal(BIBLE_JOURNEY_BOOKS.length, 66, 'The journey must expose exactly 66 canonical books.');
assert.equal(new Set(BIBLE_JOURNEY_BOOKS.map((book) => book.id)).size, 66, 'Every journey book id must be unique.');
assert.equal(new Set(BIBLE_JOURNEY_BOOKS.map((book) => book.name)).size, 66, 'Every journey book name must be unique.');

const expectedOrder = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
];
assert.deepEqual(BIBLE_JOURNEY_BOOKS.map((book) => book.id), expectedOrder, 'Canonical order must remain stable.');
assert.equal(BIBLE_JOURNEY_BOOKS.reduce((sum, book) => sum + book.chapterCount, 0), 1189, 'Canonical chapter count must total 1,189.');

for (const book of BIBLE_JOURNEY_BOOKS) {
  assert.equal(book.index >= 1 && book.index <= 66, true, `${book.name} must have a valid canonical index.`);
  assert.equal(book.theme.trim().length > 0, true, `${book.name} must include a theme.`);
  assert.equal(book.icon.trim().length > 0, true, `${book.name} must include an icon.`);
  assert.equal(book.chapterCount > 0, true, `${book.name} must include a positive chapter count.`);
  assert.equal(getJourneyBook(book.id)?.id, book.id, `${book.name} must resolve by id.`);
}

assert.equal(isBookFree('GEN'), true);
assert.equal(isBookFree('EXO'), true);
assert.equal(isBookFree('LEV'), true);
assert.equal(isBookFree('NUM'), false);
assert.equal(isBookFree('REV'), false);
assert.equal(getNextJourneyBook('GEN')?.id, 'EXO');
assert.equal(getNextJourneyBook('LEV')?.id, 'NUM');
assert.equal(getNextJourneyBook('JUD')?.id, 'REV');
assert.equal(getNextJourneyBook('REV'), undefined);
assert.equal(getJourneyBook('missing'), undefined);

console.log('Bible journey catalog tests passed.');
