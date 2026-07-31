import { BIBLE_BOOKS, BIBLE_BUILD_META } from './bible.generated';
import type { BibleBook, BibleLocation, BibleSearchResult, BibleVerse } from './bible-types';

export { BIBLE_BUILD_META };
export const BIBLE_LIBRARY = BIBLE_BOOKS;

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const BOOK_BY_ID = new Map(BIBLE_BOOKS.map((book) => [book.id, book]));
const BOOK_BY_ALIAS = new Map<string, BibleBook>();

const EXTRA_ALIASES: Record<string, string[]> = {
  GEN: ['gen'], EXO: ['exo', 'ex'], LEV: ['lev'], NUM: ['num'], DEU: ['deut', 'dt'],
  JOS: ['josh'], JDG: ['judg'], RUT: ['ru'], '1SA': ['1sam', 'i samuel'], '2SA': ['2sam', 'ii samuel'],
  '1KI': ['1kgs', 'i kings'], '2KI': ['2kgs', 'ii kings'], '1CH': ['1chr', 'i chronicles'], '2CH': ['2chr', 'ii chronicles'],
  EZR: ['ezr'], NEH: ['neh'], EST: ['est'], JOB: ['job'], PSA: ['ps', 'psalm'], PRO: ['prov', 'prv'],
  ECC: ['eccl', 'qoheleth'], SNG: ['song', 'songs', 'song of songs', 'canticles'], ISA: ['isa'], JER: ['jer'],
  LAM: ['lam'], EZK: ['ezek', 'eze'], DAN: ['dan'], HOS: ['hos'], JOL: ['jl'], AMO: ['amos'],
  OBA: ['obad'], JON: ['jon'], MIC: ['mic'], NAM: ['nah'], HAB: ['hab'], ZEP: ['zeph'], HAG: ['hag'],
  ZEC: ['zech'], MAL: ['mal'], MAT: ['matt', 'mt'], MRK: ['mk'], LUK: ['lk'], JHN: ['jn', 'joh'],
  ACT: ['acts'], ROM: ['rom'], '1CO': ['1cor', 'i corinthians'], '2CO': ['2cor', 'ii corinthians'],
  GAL: ['gal'], EPH: ['eph'], PHP: ['phil', 'php'], COL: ['col'], '1TH': ['1thess', 'i thessalonians'],
  '2TH': ['2thess', 'ii thessalonians'], '1TI': ['1tim', 'i timothy'], '2TI': ['2tim', 'ii timothy'],
  TIT: ['tit'], PHM: ['philem'], HEB: ['heb'], JAS: ['jas'], '1PE': ['1pet', 'i peter'],
  '2PE': ['2pet', 'ii peter'], '1JN': ['1jn', 'i john'], '2JN': ['2jn', 'ii john'],
  '3JN': ['3jn', 'iii john'], JUD: ['jud'], REV: ['rev', 'revelations', 'apocalypse'],
};

for (const book of BIBLE_BOOKS) {
  for (const alias of [book.id, book.name, ...(EXTRA_ALIASES[book.id] || [])]) {
    BOOK_BY_ALIAS.set(normalize(alias), book);
  }
}

export function getBibleBook(bookId: string): BibleBook | undefined {
  return BOOK_BY_ID.get(bookId) || BOOK_BY_ALIAS.get(normalize(bookId));
}

export function getBibleChapter(bookId: string, chapter: number): BibleVerse[] {
  const book = getBibleBook(bookId);
  if (!book) return [];
  return book.chapters[Math.max(0, Math.min(book.chapters.length - 1, chapter - 1))] || [];
}

export function parseBibleReference(input: string): BibleLocation | null {
  const match = input.trim().match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/i);
  if (!match) return null;
  const book = BOOK_BY_ALIAS.get(normalize(match[1]));
  if (!book) return null;
  const chapter = Number(match[2]);
  const verse = match[3] ? Number(match[3]) : undefined;
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters.length) return null;
  if (verse !== undefined && !book.chapters[chapter - 1]?.some(([number]) => number === verse)) return null;
  return { bookId: book.id, chapter, verse };
}

export function formatBibleReference(location: BibleLocation): string {
  const book = getBibleBook(location.bookId);
  const name = book?.name || location.bookId;
  return `${name} ${location.chapter}${location.verse ? `:${location.verse}` : ''}`;
}

export function searchBible(query: string, limit = 80): BibleSearchResult[] {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];
  const reference = parseBibleReference(trimmed);
  if (reference) {
    const book = getBibleBook(reference.bookId);
    if (!book) return [];
    const chapter = book.chapters[reference.chapter - 1] || [];
    return chapter
      .filter(([number]) => reference.verse === undefined || number === reference.verse)
      .slice(0, limit)
      .map(([number, text]) => ({
        bookId: book.id,
        bookName: book.name,
        chapter: reference.chapter,
        verse: number,
        text,
      }));
  }

  const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  const results: BibleSearchResult[] = [];
  for (const book of BIBLE_BOOKS) {
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
      for (const [verse, text] of book.chapters[chapterIndex]) {
        const haystack = text.toLowerCase();
        if (terms.every((term) => haystack.includes(term))) {
          results.push({ bookId: book.id, bookName: book.name, chapter: chapterIndex + 1, verse, text });
          if (results.length >= limit) return results;
        }
      }
    }
  }
  return results;
}

export function verseKey(bookId: string, chapter: number, verse: number): string {
  return `${bookId}.${chapter}.${verse}`;
}

export function chapterKey(bookId: string, chapter: number): string {
  return `${bookId}.${chapter}`;
}
