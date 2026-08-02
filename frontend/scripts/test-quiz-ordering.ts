import assert from 'node:assert/strict';

import {
  passageLocationFromReference,
  sortSelectedQuizQuestions,
} from '../src/quiz-ordering.ts';

const moses = [
  { q: 'Sinai', verse: 'Exodus 19:20' },
  { q: 'First plague', verse: 'Exodus 7:20' },
  { q: 'Burning bush', verse: 'Exodus 3:2' },
  { q: 'Passover', verse: 'Exodus 12:13' },
];

assert.deepEqual(
  sortSelectedQuizQuestions('moses', moses).map((item) => item.q),
  ['Burning bush', 'First plague', 'Passover', 'Sinai'],
  'Moses questions must move forward through Exodus after selection.',
);

const crossBook = [
  { q: 'Acts', verse: 'Acts 2:4' },
  { q: 'Luke', verse: 'Luke 2:11' },
  { q: 'Matthew', verse: 'Matthew 1:21' },
];
assert.deepEqual(
  sortSelectedQuizQuestions('apostles', crossBook).map((item) => item.q),
  ['Matthew', 'Luke', 'Acts'],
  'Story ordering must respect canonical book order before chapter and verse.',
);

const general = [
  { q: 'John', verse: 'John 3:16' },
  { q: 'Genesis', verse: 'Genesis 1:1' },
];
assert.deepEqual(
  sortSelectedQuizQuestions('general', general),
  general,
  'General Bible Trivia must remain mixed.',
);

assert.deepEqual(
  passageLocationFromReference('Genesis 1:3–5'),
  { bookId: 'GEN', chapter: 1, verse: 3 },
  'A ranged reference must open at its first verse.',
);
assert.deepEqual(
  passageLocationFromReference('1 Samuel 17:40'),
  { bookId: '1SA', chapter: 17, verse: 40 },
  'Numbered Bible books must parse correctly.',
);
assert.deepEqual(passageLocationFromReference('Psalms'), { bookId: 'PSA', chapter: 1 });
assert.deepEqual(passageLocationFromReference('Psalm 23:1'), { bookId: 'PSA', chapter: 23, verse: 1 });
assert.deepEqual(passageLocationFromReference('Song of Songs 2:1'), { bookId: 'SNG', chapter: 2, verse: 1 });
assert.deepEqual(passageLocationFromReference('I Samuel 17:40'), { bookId: '1SA', chapter: 17, verse: 40 });

console.log('Quiz ordering tests passed.');
