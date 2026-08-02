import { getBibleBook } from './bible-library';
import {
  BOOK_MASTERY_BOOKS,
  buildMasteryQuestionPool,
  buildMasteryRoundFromPool,
  getBookMasteryConfig,
  type BookMasteryBookId,
  type MasteryMode,
  type MasteryQuestion,
} from './book-mastery-core';

export * from './book-mastery-core';

const QUESTION_CACHE = new Map<BookMasteryBookId, MasteryQuestion[]>();

export function getBookMastery(bookId: string) {
  return getBookMasteryConfig(bookId);
}

export function getMasteryQuestionPool(bookId: BookMasteryBookId): MasteryQuestion[] {
  const cached = QUESTION_CACHE.get(bookId);
  if (cached) return cached.map((question) => ({ ...question, options: [...question.options] as [string, string, string, string] }));
  const config = getBookMasteryConfig(bookId);
  if (!config) return [];
  const bibleBook = getBibleBook(config.bookId);
  if (!bibleBook) return [];
  const questions = buildMasteryQuestionPool(config, bibleBook);
  QUESTION_CACHE.set(bookId, questions);
  return questions.map((question) => ({ ...question, options: [...question.options] as [string, string, string, string] }));
}

export function buildMasteryRound(bookId: BookMasteryBookId, mode: MasteryMode, seed = Date.now()): MasteryQuestion[] {
  return buildMasteryRoundFromPool(getMasteryQuestionPool(bookId), mode, seed);
}

export { BOOK_MASTERY_BOOKS };
