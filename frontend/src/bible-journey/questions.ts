import type { BibleBook } from '../bible-types.ts';
import type { JourneyBook } from './catalog.ts';

export type JourneyQuestion = {
  id: string;
  kind: 'reference' | 'verse';
  prompt: string;
  options: [string, string, string, string];
  answer: number;
  reference: string;
  excerpt: string;
  explanation: string;
};

export type JourneyTrial = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  questions: JourneyQuestion[];
};

type VerseRecord = {
  chapter: number;
  verse: number;
  text: string;
  reference: string;
};

const TRIAL_COPY = [
  ['Open the Book', 'Meet the words, setting, and movement of this book.'],
  ['Follow the Story', 'Trace the people, promises, warnings, and turning points.'],
  ['Hear the Wisdom', 'Listen closely to what the text teaches and reveals.'],
  ['Hold the Truth', 'Strengthen your memory of the book’s Scripture.'],
  ['Book Mastery', 'Complete the final Scripture challenge for this book.'],
] as const;

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function flattenBook(book: BibleBook): VerseRecord[] {
  return book.chapters.flatMap((chapter, chapterIndex) => chapter.map(([verse, text]) => ({
    chapter: chapterIndex + 1,
    verse,
    text: text.trim(),
    reference: `${book.name} ${chapterIndex + 1}:${verse}`,
  }))).filter((item) => item.text.length > 0);
}

function candidateIndexes(targetIndex: number, size: number, seed: number): number[] {
  const values = [targetIndex];
  let offset = 1 + (seed % Math.max(1, size - 1));
  while (values.length < 4) {
    const candidate = (targetIndex + offset) % size;
    if (!values.includes(candidate)) values.push(candidate);
    offset += 1 + ((seed + values.length * 7) % Math.max(1, size - 1));
  }
  return values;
}

function insertCorrect<T>(candidates: readonly T[], answer: number): [T, T, T, T] {
  const [correct, ...distractors] = candidates;
  const options: T[] = [];
  let distractorIndex = 0;
  for (let index = 0; index < 4; index += 1) {
    if (index === answer) options.push(correct);
    else {
      options.push(distractors[distractorIndex]);
      distractorIndex += 1;
    }
  }
  return options as [T, T, T, T];
}

function uniqueExcerpts(records: readonly VerseRecord[]): [string, string, string, string] {
  const used = new Set<string>();
  return records.map((record) => {
    let value = record.text;
    if (used.has(value)) value = `${value} — ${record.reference}`;
    used.add(value);
    return value;
  }) as [string, string, string, string];
}

export function buildBookTrials(book: BibleBook, catalogBook: JourneyBook): JourneyTrial[] {
  if (book.id !== catalogBook.id) {
    throw new Error(`Bible data ${book.id} does not match journey catalog ${catalogBook.id}.`);
  }
  if (book.chapters.length !== catalogBook.chapterCount) {
    throw new Error(`${catalogBook.name} chapter count does not match the bundled Bible.`);
  }

  const verses = flattenBook(book);
  if (verses.length < 4) {
    throw new Error(`${catalogBook.name} needs at least four Scripture verses to build trials.`);
  }

  const seed = hash(`${catalogBook.id}:${catalogBook.chapterCount}`);

  return TRIAL_COPY.map(([title, subtitle], trialIndex) => {
    const questions = Array.from({ length: 5 }, (_, questionOffset): JourneyQuestion => {
      const questionNumber = trialIndex * 5 + questionOffset;
      const targetIndex = (seed + questionNumber * 17 + trialIndex * 11) % verses.length;
      const indexes = candidateIndexes(targetIndex, verses.length, seed + questionNumber * 31);
      const records = indexes.map((index) => verses[index]);
      const target = records[0];
      const answer = (seed + questionNumber * 3) % 4;
      const kind: JourneyQuestion['kind'] = questionNumber % 2 === 0 ? 'reference' : 'verse';

      if (kind === 'reference') {
        const options = insertCorrect(records.map((record) => record.reference), answer);
        return {
          id: `${catalogBook.id.toLowerCase()}-${trialIndex + 1}-${questionOffset + 1}`,
          kind,
          prompt: `Which Scripture reference matches this line?\n“${target.text}”`,
          options,
          answer,
          reference: target.reference,
          excerpt: target.text,
          explanation: `This line appears at ${target.reference}. Read the surrounding verses to hear it in context.`,
        };
      }

      const excerpts = uniqueExcerpts(records);
      const options = insertCorrect(excerpts, answer);
      return {
        id: `${catalogBook.id.toLowerCase()}-${trialIndex + 1}-${questionOffset + 1}`,
        kind,
        prompt: `Which Scripture line appears at ${target.reference}?`,
        options,
        answer,
        reference: target.reference,
        excerpt: target.text,
        explanation: `${target.reference} contains this line. The full chapter gives its setting and meaning.`,
      };
    });

    return {
      id: `${catalogBook.id.toLowerCase()}-trial-${trialIndex + 1}`,
      number: trialIndex + 1,
      title,
      subtitle,
      questions,
    };
  });
}
