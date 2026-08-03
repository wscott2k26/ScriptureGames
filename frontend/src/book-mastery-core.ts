export type BookMasteryBookId =
  | 'genesis'
  | 'exodus'
  | 'leviticus'
  | 'numbers'
  | 'deuteronomy'
  | 'matthew'
  | 'mark'
  | 'luke'
  | 'john'
  | 'acts';

export type MasteryMode = 'core' | 'extended';
export type MasteryTier = 'core' | 'premium';
export type MasterySkill = 'observation' | 'context' | 'sequence' | 'speaker' | 'meaning';
export type ReferenceVisibility = 'reader-only';

export type BookMasteryBook = {
  id: BookMasteryBookId;
  bookId: string;
  title: string;
  testament: 'old' | 'new';
  icon: string;
  summary: string;
};

export type MasteryQuestion = {
  id: string;
  concept: string;
  q: string;
  options: [string, string, string, string];
  answer: number;
  reference: string;
  explanation: string;
  referenceVisibility: ReferenceVisibility;
  order: number;
  bookId: string;
  chapter: number;
  verseStart: number;
  tier: MasteryTier;
  skill: MasterySkill;
};

export type BibleBookForMastery = {
  id: string;
  name: string;
  chapters: readonly (readonly (readonly [number, string])[])[];
};

export const BOOK_MASTERY_BOOKS: readonly BookMasteryBook[] = [
  { id: 'genesis', bookId: 'GEN', title: 'Genesis', testament: 'old', icon: '🌅', summary: 'Beginnings, covenant, family, and promise.' },
  { id: 'exodus', bookId: 'EXO', title: 'Exodus', testament: 'old', icon: '🔥', summary: 'Deliverance, wilderness, covenant, and worship.' },
  { id: 'leviticus', bookId: 'LEV', title: 'Leviticus', testament: 'old', icon: '🕯️', summary: 'Holiness, worship, sacrifice, and faithful living.' },
  { id: 'numbers', bookId: 'NUM', title: 'Numbers', testament: 'old', icon: '🏕️', summary: 'Wilderness journeys, trust, rebellion, and mercy.' },
  { id: 'deuteronomy', bookId: 'DEU', title: 'Deuteronomy', testament: 'old', icon: '📜', summary: 'Remembering the covenant before the promised land.' },
  { id: 'matthew', bookId: 'MAT', title: 'Matthew', testament: 'new', icon: '👑', summary: 'Jesus the promised King and teacher.' },
  { id: 'mark', bookId: 'MRK', title: 'Mark', testament: 'new', icon: '🦁', summary: 'Jesus in action, authority, service, and sacrifice.' },
  { id: 'luke', bookId: 'LUK', title: 'Luke', testament: 'new', icon: '🕊️', summary: 'Good news, compassion, prayer, and salvation.' },
  { id: 'john', bookId: 'JHN', title: 'John', testament: 'new', icon: '✨', summary: 'Signs, belief, life, love, and the Son of God.' },
  { id: 'acts', bookId: 'ACT', title: 'Acts', testament: 'new', icon: '🌍', summary: 'The Spirit, the apostles, and the growing church.' },
] as const;

const BOOK_BY_SLUG = new Map(BOOK_MASTERY_BOOKS.map((book) => [book.id, book]));
const PROMPTS = [
  'Open the assigned passage. Which line appears in the text?',
  'Read the passage carefully. Which wording is actually there?',
  'Look closely at the assigned verse. Which statement matches Scripture?',
  'Use the Bible reader. Which line belongs to this passage?',
  'Read before answering. Which detail is written in the assigned verse?',
];
const SKILLS: readonly MasterySkill[] = ['observation', 'context', 'sequence', 'speaker', 'meaning'];

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function random(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const copy = [...items];
  const next = random(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function excerpt(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length <= 118 ? cleaned : `${cleaned.slice(0, 115).trimEnd()}…`;
}

function chooseAnchorIndexes(totalVerses: number, count: number): number[] {
  if (totalVerses <= count) return Array.from({ length: totalVerses }, (_, index) => index);
  const indexes = new Set<number>();
  for (let index = 0; index < count; index += 1) {
    indexes.add(Math.round((index * (totalVerses - 1)) / (count - 1)));
  }
  for (let index = 0; indexes.size < count && index < totalVerses; index += 1) indexes.add(index);
  return [...indexes].sort((a, b) => a - b).slice(0, count);
}

export function getBookMasteryConfig(bookId: string): BookMasteryBook | undefined {
  return BOOK_BY_SLUG.get(bookId as BookMasteryBookId);
}

export function buildMasteryQuestionPool(bookConfig: BookMasteryBook, bibleBook: BibleBookForMastery): MasteryQuestion[] {
  const verses = bibleBook.chapters.flatMap((chapterVerses, chapterIndex) =>
    chapterVerses.map(([verse, text]) => ({ chapter: chapterIndex + 1, verse, text })),
  );
  if (verses.length < 25) return [];
  const anchors = chooseAnchorIndexes(verses.length, 25).map((index) => verses[index]);
  const corePositions = new Set(chooseAnchorIndexes(anchors.length, 10));

  return anchors.map((anchor, anchorIndex) => {
    const correct = excerpt(anchor.text);
    const distractors: string[] = [];
    for (let offset = 1; distractors.length < 3 && offset < anchors.length; offset += 1) {
      const candidate = excerpt(anchors[(anchorIndex + offset * 7) % anchors.length].text);
      if (candidate !== correct && !distractors.includes(candidate)) distractors.push(candidate);
    }
    for (const verse of verses) {
      if (distractors.length >= 3) break;
      const candidate = excerpt(verse.text);
      if (candidate !== correct && !distractors.includes(candidate)) distractors.push(candidate);
    }
    const choices = seededShuffle([correct, ...distractors.slice(0, 3)], hash(`${bookConfig.id}:${anchor.chapter}:${anchor.verse}`));
    const reference = `${bookConfig.title} ${anchor.chapter}:${anchor.verse}`;
    return {
      id: `${bookConfig.id}-${anchor.chapter}-${anchor.verse}`,
      concept: `${bookConfig.bookId}.${anchor.chapter}.${anchor.verse}`,
      q: PROMPTS[anchorIndex % PROMPTS.length],
      options: choices as [string, string, string, string],
      answer: choices.indexOf(correct),
      reference,
      explanation: `The matching wording is found in ${reference}. Open the passage again to read the surrounding context.`,
      referenceVisibility: 'reader-only',
      order: anchor.chapter * 1_000 + anchor.verse,
      bookId: bookConfig.bookId,
      chapter: anchor.chapter,
      verseStart: anchor.verse,
      tier: corePositions.has(anchorIndex) ? 'core' : 'premium',
      skill: SKILLS[anchorIndex % SKILLS.length],
    };
  });
}

export function buildMasteryRoundFromPool(pool: readonly MasteryQuestion[], mode: MasteryMode, seed = Date.now()): MasteryQuestion[] {
  const eligible = pool.filter((question) => mode === 'extended' || question.tier === 'core');
  const target = mode === 'extended' ? 10 : 5;
  return seededShuffle(eligible, seed)
    .filter((question, index, all) => all.findIndex((candidate) => candidate.concept === question.concept) === index)
    .slice(0, target)
    .sort((a, b) => a.order - b.order);
}
