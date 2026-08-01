import assert from 'node:assert/strict';
import {
  BIBLE_JOURNEY_BOOKS,
  getJourneyBook,
  getNextJourneyBook,
  isBookFree,
} from '../src/bible-journey/catalog.ts';
import {
  completeJourneyBook,
  createInitialJourneyProgress,
  getSequentialBookId,
  normalizeJourneyProgress,
  recordJourneyTrialResult,
  syncGenesisCompletion,
} from '../src/bible-journey/progress-core.ts';
import { createJourneyProgressStore } from '../src/bible-journey/progress-store.ts';

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

{
  const initial = createInitialJourneyProgress();
  assert.equal(initial.version, 1);
  assert.equal(getSequentialBookId(initial), 'GEN');
  assert.deepEqual(initial.completedBookIds, []);
  assert.deepEqual(initial.books, {});
}

{
  const normalized = normalizeJourneyProgress({
    version: 99,
    sequentialBookId: 'NOT-A-BOOK',
    completedBookIds: ['GEN', 'GEN', 'BAD'],
    books: {
      GEN: {
        completedTrials: ['trial-1', 'trial-1', 22],
        bestResults: {
          'trial-1': { score: 99, total: 5, percent: -40, completedAt: '' },
        },
      },
      BAD: { completedTrials: ['x'], bestResults: {} },
    },
  });
  assert.equal(normalized.version, 1);
  assert.equal(getSequentialBookId(normalized), 'EXO', 'Completed Genesis should normalize the sequential marker to Exodus.');
  assert.deepEqual(normalized.completedBookIds, ['GEN']);
  assert.deepEqual(normalized.books.GEN.completedTrials, ['trial-1']);
  assert.equal(normalized.books.GEN.bestResults['trial-1'].score, 5);
  assert.equal(normalized.books.GEN.bestResults['trial-1'].total, 5);
  assert.equal(normalized.books.GEN.bestResults['trial-1'].percent, 100);
  assert.equal(normalized.books.BAD, undefined);
}

{
  const first = recordJourneyTrialResult(createInitialJourneyProgress(), 'EXO', 'trial-1', 3, 5, '2026-08-01T10:00:00.000Z');
  assert.equal(first.firstCompletion, true);
  assert.equal(first.improved, true);
  assert.equal(first.progress.books.EXO.bestResults['trial-1'].percent, 60);
  assert.equal(getSequentialBookId(first.progress), 'GEN', 'Free-select trial play must not skip sequential Genesis progress.');

  const lowerReplay = recordJourneyTrialResult(first.progress, 'EXO', 'trial-1', 1, 5, '2026-08-01T11:00:00.000Z');
  assert.equal(lowerReplay.firstCompletion, false);
  assert.equal(lowerReplay.improved, false);
  assert.equal(lowerReplay.progress.books.EXO.bestResults['trial-1'].percent, 60);
  assert.deepEqual(lowerReplay.progress.books.EXO.completedTrials, ['trial-1']);

  const improvedReplay = recordJourneyTrialResult(lowerReplay.progress, 'EXO', 'trial-1', 5, 5, '2026-08-01T12:00:00.000Z');
  assert.equal(improvedReplay.firstCompletion, false);
  assert.equal(improvedReplay.improved, true);
  assert.equal(improvedReplay.progress.books.EXO.bestResults['trial-1'].percent, 100);
}

{
  const freeSelect = completeJourneyBook(createInitialJourneyProgress(), 'JHN', '2026-08-01T12:00:00.000Z');
  assert.equal(freeSelect.firstCompletion, true);
  assert.equal(getSequentialBookId(freeSelect.progress), 'GEN', 'Completing a freely selected later book must not skip the recommended path.');
  assert.deepEqual(freeSelect.progress.completedBookIds, ['JHN']);

  const genesis = completeJourneyBook(freeSelect.progress, 'GEN', '2026-08-01T13:00:00.000Z');
  assert.equal(genesis.firstCompletion, true);
  assert.equal(getSequentialBookId(genesis.progress), 'EXO');
  assert.deepEqual(genesis.progress.completedBookIds, ['GEN', 'JHN'], 'Completed books must remain canonical, not completion-time ordered.');

  const duplicate = completeJourneyBook(genesis.progress, 'GEN', '2026-08-01T14:00:00.000Z');
  assert.equal(duplicate.firstCompletion, false);
  assert.deepEqual(duplicate.progress.completedBookIds, ['GEN', 'JHN']);
  assert.equal(getSequentialBookId(duplicate.progress), 'EXO');
}

{
  const notYet = syncGenesisCompletion(createInitialJourneyProgress(), 9, undefined);
  assert.equal(notYet.firstCompletion, false);
  assert.equal(getSequentialBookId(notYet.progress), 'GEN');

  const synced = syncGenesisCompletion(notYet.progress, 10, '2026-08-01T15:00:00.000Z');
  assert.equal(synced.firstCompletion, true);
  assert.equal(getSequentialBookId(synced.progress), 'EXO');
  assert.deepEqual(synced.progress.completedBookIds, ['GEN']);

  const syncedAgain = syncGenesisCompletion(synced.progress, 10, '2026-08-01T16:00:00.000Z');
  assert.equal(syncedAgain.firstCompletion, false);
  assert.deepEqual(syncedAgain.progress.completedBookIds, ['GEN']);
}

{
  const revelationReady = normalizeJourneyProgress({
    version: 1,
    sequentialBookId: 'REV',
    completedBookIds: BIBLE_JOURNEY_BOOKS.slice(0, 65).map((book) => book.id),
    books: {},
  });
  const finished = completeJourneyBook(revelationReady, 'REV', '2026-08-01T17:00:00.000Z');
  assert.equal(getSequentialBookId(finished.progress), undefined);
  assert.equal(finished.progress.completedBookIds.length, 66);
}

{
  const memory = new Map<string, string>();
  const storage = {
    getItem: async (key: string) => memory.get(key) ?? null,
    setItem: async (key: string, value: string) => { memory.set(key, value); },
    removeItem: async (key: string) => { memory.delete(key); },
  };
  const store = createJourneyProgressStore(storage);
  const profileId = 'player-1';

  const initial = await store.load(profileId);
  assert.equal(getSequentialBookId(initial), 'GEN');

  const [trialOne, trialTwo] = await Promise.all([
    store.recordTrial(profileId, 'EXO', 'trial-1', 3, 5, '2026-08-01T18:00:00.000Z'),
    store.recordTrial(profileId, 'EXO', 'trial-2', 4, 5, '2026-08-01T18:01:00.000Z'),
  ]);
  assert.equal(trialOne.progress.books.EXO.completedTrials.includes('trial-1'), true);
  assert.equal(trialTwo.progress.books.EXO.completedTrials.includes('trial-2'), true);
  const afterConcurrentWrites = await store.load(profileId);
  assert.deepEqual(afterConcurrentWrites.books.EXO.completedTrials.sort(), ['trial-1', 'trial-2']);

  const completed = await store.completeBook(profileId, 'GEN', '2026-08-01T18:02:00.000Z');
  assert.equal(completed.firstCompletion, true);
  assert.equal(getSequentialBookId(await store.load(profileId)), 'EXO');

  memory.set('scripture_games_bible_journey_v1_corrupt-player', '{broken-json');
  const recovered = await store.load('corrupt-player');
  assert.equal(getSequentialBookId(recovered), 'GEN');
  assert.equal(memory.get('scripture_games_bible_journey_corrupt_backup_corrupt-player'), '{broken-json');

  await store.reset(profileId);
  assert.equal(memory.has('scripture_games_bible_journey_v1_player-1'), false);
}

console.log('Bible journey catalog, progress, and storage tests passed.');
