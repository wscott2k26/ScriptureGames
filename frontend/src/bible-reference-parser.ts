export type BibleReferenceParts = {
  bookText: string;
  chapter: number;
  verse?: number;
};

// Pure syntax seam used by the Bible library and runtime tests.
// This initial extraction intentionally preserves the pre-Build-18 behavior.
export function parseBibleReferenceParts(input: string): BibleReferenceParts | null {
  const match = input.trim().match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/i);
  if (!match) return null;
  return {
    bookText: match[1],
    chapter: Number(match[2]),
    verse: match[3] ? Number(match[3]) : undefined,
  };
}
