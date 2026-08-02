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

type BookMeta = { id: string; index: number };
const BOOK_BY_NAME = new Map<string, BookMeta>(
  BOOKS.map(([name, id], index) => [name.toLowerCase(), { id, index }]),
);

const ALIASES: Record<string, string> = {
  psalm: 'Psalms',
  'song of songs': 'Song of Solomon',
  canticles: 'Song of Solomon',
  revelations: 'Revelation',
  'i samuel': '1 Samuel',
  'ii samuel': '2 Samuel',
  'i kings': '1 Kings',
  'ii kings': '2 Kings',
  'i chronicles': '1 Chronicles',
  'ii chronicles': '2 Chronicles',
  'i corinthians': '1 Corinthians',
  'ii corinthians': '2 Corinthians',
  'i thessalonians': '1 Thessalonians',
  'ii thessalonians': '2 Thessalonians',
  'i timothy': '1 Timothy',
  'ii timothy': '2 Timothy',
  'i peter': '1 Peter',
  'ii peter': '2 Peter',
  'i john': '1 John',
  'ii john': '2 John',
  'iii john': '3 John',
};

for (const [alias, canonical] of Object.entries(ALIASES)) {
  const meta = BOOK_BY_NAME.get(canonical.toLowerCase());
  if (meta) BOOK_BY_NAME.set(alias, meta);
}

function parseReference(reference?: string): (QuizPassageLocation & { order: number }) | null {
  if (!reference) return null;
  const normalized = reference.trim().replace(/[–—]/g, '-');
  const lower = normalized.toLowerCase();
  const book = [...BOOK_BY_NAME.keys()]
    .sort((a, b) => b.length - a.length)
    .find((name) => lower === name || lower.startsWith(`${name} `));
  if (!book) return null;
  const meta = BOOK_BY_NAME.get(book);
  if (!meta) return null;
  const remainder = normalized.slice(book.length).trim();
  if (!remainder) {
    return { bookId: meta.id, chapter: 1, order: meta.index * 1_000_000 + 1_000 };
  }
  const details = remainder.match(/^(\d+)(?::(\d+))?/);
  if (!details) return null;
  const chapter = Number(details[1]);
  const verse = details[2] ? Number(details[2]) : undefined;
  if (!Number.isInteger(chapter) || chapter < 1 || (verse !== undefined && (!Number.isInteger(verse) || verse < 1))) return null;
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
