import { passageLocationFromReference } from './quiz-ordering.ts';

export type ReferencedQuizQuestion = {
  q: string;
  verse?: string;
};

export const QUIZ_REFERENCE_OVERRIDES: Readonly<Record<string, string>> = {
  'How many books are in most Protestant Bibles?': '2 Timothy 3:16',
  'What is the first book of the Bible?': 'Genesis 1:1',
  'What is the last book of the Bible?': 'Revelation 22:21',
  'Which book comes right after Genesis?': 'Exodus 1:1',
  'How many Gospels are in the New Testament?': 'Matthew 1:1',
  'Which book is a collection of songs and prayers?': 'Psalm 1:1',
  'In how many languages was the Bible originally written?': 'Luke 23:38',
  'In the traditional Hebrew text, which book never directly mentions God’s name?': 'Esther 1:1',
  "What does the word 'gospel' mean?": 'Luke 2:10',
  'Who is traditionally credited with writing many New Testament letters?': 'Romans 1:1',
  'Which apostle is traditionally associated with 1, 2, and 3 John?': '1 John 1:1',
  "Who was known as the 'weeping prophet'?": 'Jeremiah 9:1',
  "Which prophet's name means 'the Lord saves'?": 'Isaiah 12:2',
  'Which king is traditionally associated with many of the Psalms?': 'Psalm 3:1',
  'How many Psalms are there in total?': 'Psalm 150:1',
  'Psalm 119 is famous for being the _____?': 'Psalm 119:1',
  'What kind of writings make up the book of Psalms?': 'Psalm 72:20',
  'What is true about the word ‘Selah’ in the Psalms?': 'Psalm 3:2',
};

const SAFE_FALLBACK_REFERENCE = '2 Timothy 3:16';

export function hasExplicitQuizReferenceOverride(question: string): boolean {
  return Object.prototype.hasOwnProperty.call(QUIZ_REFERENCE_OVERRIDES, question);
}

export function resolveQuizReference(question: string, reference?: string): string {
  const candidate = reference?.trim();
  if (candidate && passageLocationFromReference(candidate)) return candidate;
  return QUIZ_REFERENCE_OVERRIDES[question] || SAFE_FALLBACK_REFERENCE;
}

export function withResolvedQuizReference<T extends ReferencedQuizQuestion>(question: T): T & { verse: string } {
  return {
    ...question,
    verse: resolveQuizReference(question.q, question.verse),
  };
}
