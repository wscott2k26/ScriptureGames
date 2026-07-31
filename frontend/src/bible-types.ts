export type BibleVerse = readonly [number, string];

export type BibleBook = {
  id: string;
  name: string;
  testament: 'Old Testament' | 'New Testament';
  chapters: BibleVerse[][];
};

export type BibleLocation = {
  bookId: string;
  chapter: number;
  verse?: number;
};

export type BibleSearchResult = BibleLocation & {
  bookName: string;
  text: string;
};

export type BibleBuildMeta = {
  complete: boolean;
  translationId: string;
  translationName: string;
  sourceName: string;
  sourceUrl?: string;
  publicDomain: boolean;
  bookCount: number;
  chapterCount: number;
  verseCount: number;
};
