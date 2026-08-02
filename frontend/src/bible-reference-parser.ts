export type BibleReferenceParts = {
  bookText: string;
  chapter: number;
  verse?: number;
};

const TRAILING_TRANSLATION = /\s*\((?:WEB|KJV|NKJV|NIV|ESV|NLT|NASB|CSB|AMP|NRSV(?:UE)?|RSV|ASV)\)\s*$/i;
const DASHES = /[‐‑‒–—―]/g;

export function normalizeBibleReferenceInput(input: string): string {
  return input
    .replace(/\u00a0/g, ' ')
    .replace(TRAILING_TRANSLATION, '')
    .replace(DASHES, '-')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseBibleReferenceParts(input: string): BibleReferenceParts | null {
  const normalized = normalizeBibleReferenceInput(input);
  const match = normalized.match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/i);
  if (!match) return null;

  const chapter = Number(match[2]);
  const verse = match[3] ? Number(match[3]) : undefined;
  if (!Number.isInteger(chapter) || chapter < 1) return null;
  if (verse !== undefined && (!Number.isInteger(verse) || verse < 1)) return null;

  return {
    bookText: match[1],
    chapter,
    verse,
  };
}
