import { BIBLE_JOURNEY_BOOKS, getJourneyBook } from './catalog.ts';

export type JourneyTrialResult = {
  score: number;
  total: number;
  percent: number;
  completedAt: string;
};

export type JourneyBookProgress = {
  completedTrials: string[];
  bestResults: Record<string, JourneyTrialResult>;
  completedAt?: string;
};

export type BibleJourneyProgress = {
  version: 1;
  sequentialBookId: string | null;
  completedBookIds: string[];
  books: Record<string, JourneyBookProgress>;
  lastSelectedBookId?: string;
};

export type JourneyTrialUpdate = {
  progress: BibleJourneyProgress;
  firstCompletion: boolean;
  improved: boolean;
};

export type JourneyBookUpdate = {
  progress: BibleJourneyProgress;
  firstCompletion: boolean;
};

const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0))];
}

function safeTimestamp(value: unknown, fallback = FALLBACK_DATE): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function normalizeResult(value: unknown): JourneyTrialResult | undefined {
  if (!isRecord(value)) return undefined;
  const rawTotal = typeof value.total === 'number' && Number.isFinite(value.total) ? value.total : 0;
  const total = Math.max(0, Math.round(rawTotal));
  const rawScore = typeof value.score === 'number' && Number.isFinite(value.score) ? value.score : 0;
  const score = Math.max(0, Math.min(Math.round(rawScore), total));
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  return {
    score,
    total,
    percent,
    completedAt: safeTimestamp(value.completedAt),
  };
}

function normalizeBookProgress(value: unknown): JourneyBookProgress {
  const record = isRecord(value) ? value : {};
  const completedTrials = uniqueStrings(record.completedTrials);
  const rawResults = isRecord(record.bestResults) ? record.bestResults : {};
  const bestResults: Record<string, JourneyTrialResult> = {};

  for (const [trialId, result] of Object.entries(rawResults)) {
    if (!trialId.trim()) continue;
    const normalized = normalizeResult(result);
    if (normalized) bestResults[trialId] = normalized;
  }

  const completedAt = typeof record.completedAt === 'string' && record.completedAt.trim().length > 0
    ? record.completedAt
    : undefined;
  return { completedTrials, bestResults, completedAt };
}

function canonicalCompletedIds(value: unknown): string[] {
  const completed = new Set(uniqueStrings(value).filter((bookId) => Boolean(getJourneyBook(bookId))));
  return BIBLE_JOURNEY_BOOKS.filter((book) => completed.has(book.id)).map((book) => book.id);
}

function nextSequentialBookId(completedBookIds: readonly string[]): string | null {
  const completed = new Set(completedBookIds);
  return BIBLE_JOURNEY_BOOKS.find((book) => !completed.has(book.id))?.id ?? null;
}

export function createInitialJourneyProgress(): BibleJourneyProgress {
  return {
    version: 1,
    sequentialBookId: 'GEN',
    completedBookIds: [],
    books: {},
  };
}

export function normalizeJourneyProgress(value: unknown): BibleJourneyProgress {
  const record = isRecord(value) ? value : {};
  const completedBookIds = canonicalCompletedIds(record.completedBookIds);
  const rawBooks = isRecord(record.books) ? record.books : {};
  const books: Record<string, JourneyBookProgress> = {};

  for (const [bookId, bookProgress] of Object.entries(rawBooks)) {
    const book = getJourneyBook(bookId);
    if (!book) continue;
    books[book.id] = normalizeBookProgress(bookProgress);
  }

  const lastSelected = typeof record.lastSelectedBookId === 'string'
    ? getJourneyBook(record.lastSelectedBookId)?.id
    : undefined;

  return {
    version: 1,
    sequentialBookId: nextSequentialBookId(completedBookIds),
    completedBookIds,
    books,
    ...(lastSelected ? { lastSelectedBookId: lastSelected } : {}),
  };
}

function requireBookId(bookId: string): string {
  const book = getJourneyBook(bookId);
  if (!book) throw new Error(`Unknown Bible journey book: ${bookId}`);
  return book.id;
}

export function getSequentialBookId(progress: BibleJourneyProgress): string | undefined {
  return normalizeJourneyProgress(progress).sequentialBookId ?? undefined;
}

export function recordJourneyTrialResult(
  progress: BibleJourneyProgress,
  bookId: string,
  trialId: string,
  score: number,
  total: number,
  completedAt = new Date().toISOString(),
): JourneyTrialUpdate {
  const canonicalBookId = requireBookId(bookId);
  const safeTrialId = trialId.trim();
  if (!safeTrialId) throw new Error('A Bible journey trial id is required.');

  const current = normalizeJourneyProgress(progress);
  const currentBook = current.books[canonicalBookId] || normalizeBookProgress(undefined);
  const safeTotal = Math.max(0, Math.round(Number.isFinite(total) ? total : 0));
  const safeScore = Math.max(0, Math.min(Math.round(Number.isFinite(score) ? score : 0), safeTotal));
  const percent = safeTotal > 0 ? Math.round((safeScore / safeTotal) * 100) : 0;
  const previous = currentBook.bestResults[safeTrialId];
  const firstCompletion = !currentBook.completedTrials.includes(safeTrialId);
  const improved = !previous || percent > previous.percent;
  const result: JourneyTrialResult = {
    score: safeScore,
    total: safeTotal,
    percent,
    completedAt: safeTimestamp(completedAt, new Date().toISOString()),
  };

  const nextBook: JourneyBookProgress = {
    ...currentBook,
    completedTrials: firstCompletion
      ? [...currentBook.completedTrials, safeTrialId]
      : currentBook.completedTrials,
    bestResults: improved
      ? { ...currentBook.bestResults, [safeTrialId]: result }
      : currentBook.bestResults,
  };

  return {
    progress: {
      ...current,
      books: { ...current.books, [canonicalBookId]: nextBook },
      lastSelectedBookId: canonicalBookId,
    },
    firstCompletion,
    improved,
  };
}

export function completeJourneyBook(
  progress: BibleJourneyProgress,
  bookId: string,
  completedAt = new Date().toISOString(),
): JourneyBookUpdate {
  const canonicalBookId = requireBookId(bookId);
  const current = normalizeJourneyProgress(progress);
  const firstCompletion = !current.completedBookIds.includes(canonicalBookId);
  if (!firstCompletion) return { progress: current, firstCompletion: false };

  const completed = new Set([...current.completedBookIds, canonicalBookId]);
  const completedBookIds = BIBLE_JOURNEY_BOOKS.filter((book) => completed.has(book.id)).map((book) => book.id);
  const currentBook = current.books[canonicalBookId] || normalizeBookProgress(undefined);
  const nextBook: JourneyBookProgress = {
    ...currentBook,
    completedAt: safeTimestamp(completedAt, new Date().toISOString()),
  };

  return {
    progress: {
      ...current,
      completedBookIds,
      sequentialBookId: nextSequentialBookId(completedBookIds),
      books: { ...current.books, [canonicalBookId]: nextBook },
      lastSelectedBookId: canonicalBookId,
    },
    firstCompletion: true,
  };
}

export function syncGenesisCompletion(
  progress: BibleJourneyProgress,
  completedTrialCount: number,
  seasonCompletedAt?: string,
): JourneyBookUpdate {
  const current = normalizeJourneyProgress(progress);
  const genesisComplete = Math.max(0, Math.round(completedTrialCount)) >= 10 || Boolean(seasonCompletedAt);
  if (!genesisComplete) return { progress: current, firstCompletion: false };
  return completeJourneyBook(current, 'GEN', seasonCompletedAt || new Date().toISOString());
}
