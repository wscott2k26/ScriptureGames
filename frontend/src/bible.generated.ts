// Development fallback. Production and release exports replace this file with the complete 66-book WEBP library.
import type { BibleBook } from './bible-types';

export const BIBLE_BOOKS: BibleBook[] = [];
export const BIBLE_BUILD_META = {
  complete: false,
  translationId: 'WEBP',
  translationName: 'World English Bible',
  sourceName: 'eBible.org',
  publicDomain: true,
  bookCount: 0,
  chapterCount: 0,
  verseCount: 0,
} as const;
