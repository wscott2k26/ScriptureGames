import assert from 'node:assert/strict';

import type { BibleBook } from '../src/bible-types.ts';
import { getJourneyBook } from '../src/bible-journey/catalog.ts';
import { buildBookTrials } from '../src/bible-journey/questions.ts';

function fixtureBook(id: string, name: string, chapterCount: number, versesPerChapter: number): BibleBook {
  return {
    id,
    name,
    testament: id === 'JUD' ? 'New Testament' : 'Old Testament',
    chapters: Array.from({ length: chapterCount }, (_, chapterIndex) =>
      Array.from({ length: versesPerChapter }, (_, verseIndex) => [
        verseIndex + 1,
        `${name} fixture truth from chapter ${chapterIndex + 1}, verse ${verseIndex + 1}, written for deterministic testing.`,
      ] as const),
    ),
  };
}

for (const [book, catalogId] of [
  [fixtureBook('EXO', 'Exodus', 40, 8), 'EXO'],
  [fixtureBook('JUD', 'Jude', 1, 25), 'JUD'],
] as const) {
  const catalog = getJourneyBook(catalogId);
  assert.ok(catalog, `${catalogId} must exist in the journey catalog.`);

  const first = buildBookTrials(book, catalog);
  const second = buildBookTrials(book, catalog);
  assert.deepEqual(first, second, `${book.name} trials must be deterministic across calls.`);
  assert.equal(first.length, 5, `${book.name} must produce five reusable trials.`);
  assert.equal(new Set(first.map((trial) => trial.id)).size, 5, `${book.name} trial ids must be unique.`);

  for (const [trialIndex, trial] of first.entries()) {
    assert.equal(trial.number, trialIndex + 1);
    assert.equal(trial.questions.length, 5, `${trial.title} must include five questions.`);
    assert.equal(trial.title.trim().length > 0, true);
    assert.equal(trial.subtitle.trim().length > 0, true);

    for (const question of trial.questions) {
      assert.equal(question.options.length, 4, 'Every journey question must have four options.');
      assert.equal(new Set(question.options).size, 4, 'Every journey question must have four unique options.');
      assert.equal(question.answer >= 0 && question.answer <= 3, true, 'The answer index must point to one option.');
      assert.equal(question.prompt.trim().length > 0, true);
      assert.equal(question.excerpt.trim().length > 0, true);
      assert.equal(question.explanation.includes(question.reference), true, 'The explanation must ground feedback in the reference.');
      assert.equal(question.reference.startsWith(`${book.name} `), true, 'References must remain inside the selected book.');

      const match = question.reference.match(/ (\d+):(\d+)$/);
      assert.ok(match, `Reference must use chapter:verse format: ${question.reference}`);
      const chapter = Number(match[1]);
      const verse = Number(match[2]);
      assert.equal(chapter >= 1 && chapter <= book.chapters.length, true);
      assert.equal(verse >= 1 && verse <= book.chapters[chapter - 1].length, true);
    }
  }
}

const implementationText = buildBookTrials.toString();
assert.equal(/\bfetch\s*\(/.test(implementationText), false, 'The book engine must not fetch questions from the network.');
assert.equal(/https?:\/\//.test(implementationText), false, 'The book engine must not contain a runtime web endpoint.');

console.log('Bible journey deterministic question tests passed.');
