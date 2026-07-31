#!/usr/bin/env node
/** Release audit for the generated offline Bible library. */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONTEND = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(FRONTEND, 'src', 'bible-data');
const INDEX = join(FRONTEND, 'src', 'bible.generated.ts');

const EXPECTED = [
  ['GEN', 'Genesis', 50], ['EXO', 'Exodus', 40], ['LEV', 'Leviticus', 27],
  ['NUM', 'Numbers', 36], ['DEU', 'Deuteronomy', 34], ['JOS', 'Joshua', 24],
  ['JDG', 'Judges', 21], ['RUT', 'Ruth', 4], ['1SA', '1 Samuel', 31],
  ['2SA', '2 Samuel', 24], ['1KI', '1 Kings', 22], ['2KI', '2 Kings', 25],
  ['1CH', '1 Chronicles', 29], ['2CH', '2 Chronicles', 36], ['EZR', 'Ezra', 10],
  ['NEH', 'Nehemiah', 13], ['EST', 'Esther', 10], ['JOB', 'Job', 42],
  ['PSA', 'Psalms', 150], ['PRO', 'Proverbs', 31], ['ECC', 'Ecclesiastes', 12],
  ['SNG', 'Song of Solomon', 8], ['ISA', 'Isaiah', 66], ['JER', 'Jeremiah', 52],
  ['LAM', 'Lamentations', 5], ['EZK', 'Ezekiel', 48], ['DAN', 'Daniel', 12],
  ['HOS', 'Hosea', 14], ['JOL', 'Joel', 3], ['AMO', 'Amos', 9],
  ['OBA', 'Obadiah', 1], ['JON', 'Jonah', 4], ['MIC', 'Micah', 7],
  ['NAM', 'Nahum', 3], ['HAB', 'Habakkuk', 3], ['ZEP', 'Zephaniah', 3],
  ['HAG', 'Haggai', 2], ['ZEC', 'Zechariah', 14], ['MAL', 'Malachi', 4],
  ['MAT', 'Matthew', 28], ['MRK', 'Mark', 16], ['LUK', 'Luke', 24],
  ['JHN', 'John', 21], ['ACT', 'Acts', 28], ['ROM', 'Romans', 16],
  ['1CO', '1 Corinthians', 16], ['2CO', '2 Corinthians', 13], ['GAL', 'Galatians', 6],
  ['EPH', 'Ephesians', 6], ['PHP', 'Philippians', 4], ['COL', 'Colossians', 4],
  ['1TH', '1 Thessalonians', 5], ['2TH', '2 Thessalonians', 3], ['1TI', '1 Timothy', 6],
  ['2TI', '2 Timothy', 4], ['TIT', 'Titus', 3], ['PHM', 'Philemon', 1],
  ['HEB', 'Hebrews', 13], ['JAS', 'James', 5], ['1PE', '1 Peter', 5],
  ['2PE', '2 Peter', 3], ['1JN', '1 John', 5], ['2JN', '2 John', 1],
  ['3JN', '3 John', 1], ['JUD', 'Jude', 1], ['REV', 'Revelation', 22],
];

const failures = [];
let totalChapters = 0;
let totalVerses = 0;
const samples = new Map();

if (!existsSync(INDEX)) {
  failures.push('generated Bible index is missing');
} else {
  const index = readFileSync(INDEX, 'utf8');
  for (const required of ['complete: true', 'bookCount: 66', 'chapterCount: 1189', 'publicDomain: true']) {
    if (!index.includes(required)) failures.push(`generated Bible index is missing ${JSON.stringify(required)}`);
  }
  const match = index.match(/verseCount: (\d+)/);
  if (!match || Number(match[1]) < 31_000) {
    failures.push('generated Bible index does not certify at least 31,000 verses');
  }
}

for (const [bookId, expectedName, expectedChapters] of EXPECTED) {
  const path = join(DATA, `${bookId}.json`);
  if (!existsSync(path)) {
    failures.push(`missing book file: ${bookId}`);
    continue;
  }

  let book;
  try {
    book = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push(`${bookId} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }

  if (book.id !== bookId || book.name !== expectedName) failures.push(`${bookId} metadata is incorrect`);
  if (!Array.isArray(book.chapters) || book.chapters.length !== expectedChapters) {
    failures.push(`${expectedName}: expected ${expectedChapters} chapters`);
    continue;
  }

  totalChapters += book.chapters.length;
  book.chapters.forEach((chapter, chapterIndex) => {
    const chapterNumber = chapterIndex + 1;
    if (!Array.isArray(chapter) || chapter.length === 0) {
      failures.push(`${expectedName} ${chapterNumber} has no verses`);
      return;
    }

    const seen = new Set();
    for (const entry of chapter) {
      if (!Array.isArray(entry) || entry.length !== 2) {
        failures.push(`${expectedName} ${chapterNumber} contains malformed verse data`);
        continue;
      }
      const [number, text] = entry;
      if (!Number.isInteger(number) || number < 1 || seen.has(number)) {
        failures.push(`${expectedName} ${chapterNumber} contains invalid verse numbering`);
      }
      seen.add(number);
      if (typeof text !== 'string' || text.trim().length === 0) {
        failures.push(`${expectedName} ${chapterNumber}:${number} is empty`);
      }
      totalVerses += 1;
      samples.set(`${bookId}.${chapterNumber}.${number}`, text);
    }
  });
}

if (totalChapters !== 1189) failures.push(`expected 1189 chapters, found ${totalChapters}`);
if (totalVerses < 31_000) failures.push(`expected at least 31,000 verses, found ${totalVerses}`);
if (!String(samples.get('GEN.1.1') || '').startsWith('In the beginning')) {
  failures.push('Genesis 1:1 sample does not match the WEB text');
}
if (!String(samples.get('JHN.3.16') || '').includes('God so loved the world')) {
  failures.push('John 3:16 sample does not match the WEB text');
}

console.log('SCRIPTURE GAMES FULL BIBLE AUDIT');
console.log('=================================');
console.log(`books: ${EXPECTED.length}, chapters: ${totalChapters}, verses: ${totalVerses}`);

if (failures.length > 0) {
  console.error(`Checks failed: ${failures.length}`);
  for (const failure of failures.slice(0, 50)) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PASS — the complete 66-book public-domain Bible library is present and internally consistent.');
