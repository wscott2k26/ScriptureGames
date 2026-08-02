export type OrderedQuizQuestion = {
  verse?: string;
  reference?: string;
};

export type QuizPassageLocation = {
  bookId: string;
  chapter: number;
  verse?: number;
};

const BOOKS = [
  ['Genesis', 'GEN'], ['Exodus', 'EXO'], ['Leviticus', 'LEV'], ['Numbers', 'NUM'], ['Deuteronomy', 'DEU'],
  ['Joshua', 'JOS'], ['Judges', 'JDG'], ['Ruth', 'RUT'], ['1 Samuel', '1SA'], ['2 Samuel', '2SA'],
  ['1 Kings', '1KI'], ['2 Kings', '2KI'], ['1 Chronicles', '1CH'], ['2 Chronicles', '2CH'], ['Ezra', 'EZR'],
  ['Nehemiah', 'NEH'], ['Esther', 'EST'], ['Job', 'JOB'], ['Psalms', 'PSA'], ['Proverbs', 'PRO'],
  ['Ecclesiastes', 'ECC'], ['Song of Solomon', 'SNG'], ['Isaiah', 'ISA'], ['Jeremiah', 'JER'], ['Lamentations', 'LAM'],
  ['Ezekiel', 'EZK'], ['Daniel', 'DAN'], ['Hosea', 'HOS'], ['Joel', 'JOL'], ['Amos', 'AMO'],
  ['Obadiah', 'OBA'], ['Jonah', 'JON'], ['Micah', 'MIC'], ['Nahum', 'NAM'], ['Habakkuk', 'HAB'],
  ['Zephaniah', 'ZEP'], ['Haggai', 'HAG'], ['Zechariah', 'ZEC'], ['Malachi', 'MAL'], ['Matthew', 'MAT'],
  ['Mark', 'MRK'], ['Luke', 'LUK'], ['John', 'JHN'], ['Acts', 'ACT'], ['Romans', 'ROM'],
  ['1 Corinthians', '1CO'], ['2 Corinthians', '2CO'], ['Galatians', 'GAL'], ['Ephesians', 'EPH'], ['Philippians', 'PHP'],
  ['Colossians', 'COL'], ['1 Thessalonians', '1TH'], ['2 Thessalonians', '2TH'], ['1 Timothy', '1TI'], ['2 Timothy', '2TI'],
  ['Titus', 'TIT'], ['Philemon', 'PHM'], ['Hebrews', 'HEB'], ['James', 'JAS'], ['1 Peter', '1PE'],
  ['2 Peter', '2PE'], ['1 John', '1JN'], ['2 John', '2JN'], ['3 John', '3JN'], ['Jude', 'JUD'],
  ['Revelation', 'REV'],
] as const;

const BOOK_BY_NAME = new Map<string, { id: string; index: number }>(
  BOOKS.map(([name, id], index) => [name.toLowerCase(), { id, index }]),
);

function parseReference(reference?: string): (QuizPassageLocation & { order: number }) | null {
  if (!reference) return null;
  const normalized = reference.trim().replace(/[–—]/g, '-');
  const book = [...BOOK_BY_NAME.keys()]
    .sort((a, b) => b.length - a.length)
    .find((name) => normalized.toLowerCase().startsWith(`${name} `));
  if (!book) return null;
  const details = normalized.slice(book.length).trim().match(/^(\d+)(?::(\d+))?/);
  if (!details) return null;
  const chapter = Number(details[1]);
  const verse = details[2] ? Number(details[2]) : undefined;
  if (!Number.isInteger(chapter) || chapter < 1 || (verse !== undefined && (!Number.isInteger(verse) || verse < 1))) return null;
  const meta = BOOK_BY_NAME.get(book);
  if (!meta) return null;
  return {
    bookId: meta.id,
    chapter,
    ...(verse === undefined ? {} : { verse }),
    order: meta.index * 1_000_000 + chapter * 1_000 + (verse || 0),
  };
}

export function passageLocationFromReference(reference?: string): QuizPassageLocation | null {
  const parsed = parseReference(reference);
  if (!parsed) return null;
  const { bookId, chapter, verse } = parsed;
  return { bookId, chapter, ...(verse === undefined ? {} : { verse }) };
}

export function sortSelectedQuizQuestions<T extends OrderedQuizQuestion>(topic: string, questions: readonly T[]): T[] {
  if (topic === 'general') return [...questions];
  return questions
    .map((question, originalIndex) => ({ question, originalIndex, parsed: parseReference(question.verse || question.reference) }))
    .sort((a, b) => {
      const aOrder = a.parsed?.order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.parsed?.order ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder || a.originalIndex - b.originalIndex;
    })
    .map(({ question }) => question);
}
