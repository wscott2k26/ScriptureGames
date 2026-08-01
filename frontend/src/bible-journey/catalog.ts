export type JourneyTestament = 'Old Testament' | 'New Testament';
export type JourneyAccessTier = 'free' | 'premium';

export type JourneyBook = {
  id: string;
  index: number;
  name: string;
  testament: JourneyTestament;
  chapterCount: number;
  theme: string;
  icon: string;
  access: JourneyAccessTier;
};

type BookSeed = readonly [
  id: string,
  name: string,
  testament: JourneyTestament,
  chapterCount: number,
  theme: string,
  icon: string,
];

const BOOK_SEEDS: readonly BookSeed[] = [
  ['GEN', 'Genesis', 'Old Testament', 50, 'Beginnings, covenant, and God’s faithfulness', '✦'],
  ['EXO', 'Exodus', 'Old Testament', 40, 'Deliverance, worship, and God’s presence', '🔥'],
  ['LEV', 'Leviticus', 'Old Testament', 27, 'Holiness, sacrifice, and faithful worship', '🕯️'],
  ['NUM', 'Numbers', 'Old Testament', 36, 'Trusting God through the wilderness', '🏜️'],
  ['DEU', 'Deuteronomy', 'Old Testament', 34, 'Remembering and choosing faithful obedience', '📜'],
  ['JOS', 'Joshua', 'Old Testament', 24, 'Courage, promise, and faithful leadership', '🛡️'],
  ['JDG', 'Judges', 'Old Testament', 21, 'Cycles of rebellion, rescue, and mercy', '⚖️'],
  ['RUT', 'Ruth', 'Old Testament', 4, 'Loyal love, redemption, and providence', '🌾'],
  ['1SA', '1 Samuel', 'Old Testament', 31, 'Calling, kingship, and listening to God', '📯'],
  ['2SA', '2 Samuel', 'Old Testament', 24, 'David’s reign, failure, and covenant hope', '👑'],
  ['1KI', '1 Kings', 'Old Testament', 22, 'Wisdom, divided hearts, and prophetic truth', '🏛️'],
  ['2KI', '2 Kings', 'Old Testament', 25, 'Prophetic warning, exile, and enduring hope', '🕊️'],
  ['1CH', '1 Chronicles', 'Old Testament', 29, 'Worship, heritage, and David’s legacy', '🎶'],
  ['2CH', '2 Chronicles', 'Old Testament', 36, 'Temple worship, reform, and return', '⛪'],
  ['EZR', 'Ezra', 'Old Testament', 10, 'Restoration, Scripture, and rebuilding worship', '🧱'],
  ['NEH', 'Nehemiah', 'Old Testament', 13, 'Prayerful leadership and rebuilding together', '🏗️'],
  ['EST', 'Esther', 'Old Testament', 10, 'Courage and providence in hidden places', '⭐'],
  ['JOB', 'Job', 'Old Testament', 42, 'Suffering, wisdom, and trust beyond answers', '🌪️'],
  ['PSA', 'Psalms', 'Old Testament', 150, 'Prayer, praise, lament, and worship', '🎵'],
  ['PRO', 'Proverbs', 'Old Testament', 31, 'Wisdom for faithful everyday living', '💡'],
  ['ECC', 'Ecclesiastes', 'Old Testament', 12, 'Meaning, humility, and life under God', '⌛'],
  ['SNG', 'Song of Solomon', 'Old Testament', 8, 'Covenant love, delight, and devotion', '🌹'],
  ['ISA', 'Isaiah', 'Old Testament', 66, 'Holy judgment, comfort, and promised salvation', '🌅'],
  ['JER', 'Jeremiah', 'Old Testament', 52, 'Warning, grief, and the new covenant', '💧'],
  ['LAM', 'Lamentations', 'Old Testament', 5, 'Grief, mercy, and hope after ruin', '🕯️'],
  ['EZK', 'Ezekiel', 'Old Testament', 48, 'God’s glory, renewal, and a new heart', '🛞'],
  ['DAN', 'Daniel', 'Old Testament', 12, 'Faithfulness under pressure and God’s kingdom', '🦁'],
  ['HOS', 'Hosea', 'Old Testament', 14, 'Covenant love that pursues the unfaithful', '❤️'],
  ['JOL', 'Joel', 'Old Testament', 3, 'Repentance, restoration, and God’s Spirit', '🌧️'],
  ['AMO', 'Amos', 'Old Testament', 9, 'Justice, righteousness, and true worship', '⚖️'],
  ['OBA', 'Obadiah', 'Old Testament', 1, 'Pride judged and God’s kingdom restored', '⛰️'],
  ['JON', 'Jonah', 'Old Testament', 4, 'Mercy for outsiders and reluctant obedience', '🐟'],
  ['MIC', 'Micah', 'Old Testament', 7, 'Justice, mercy, humility, and promised peace', '🕊️'],
  ['NAM', 'Nahum', 'Old Testament', 3, 'Justice against cruelty and refuge in God', '🏰'],
  ['HAB', 'Habakkuk', 'Old Testament', 3, 'Honest questions and faith through uncertainty', '🌄'],
  ['ZEP', 'Zephaniah', 'Old Testament', 3, 'Judgment, purification, and rejoicing restoration', '🎺'],
  ['HAG', 'Haggai', 'Old Testament', 2, 'Putting God first while rebuilding', '🧱'],
  ['ZEC', 'Zechariah', 'Old Testament', 14, 'Return, cleansing, and the coming King', '🐴'],
  ['MAL', 'Malachi', 'Old Testament', 4, 'Faithful worship and the coming messenger', '☀️'],
  ['MAT', 'Matthew', 'New Testament', 28, 'Jesus the promised King and Teacher', '👑'],
  ['MRK', 'Mark', 'New Testament', 16, 'Jesus the serving and suffering Son', '🦁'],
  ['LUK', 'Luke', 'New Testament', 24, 'Jesus the compassionate Savior for all', '🩺'],
  ['JHN', 'John', 'New Testament', 21, 'Believing in Jesus, the Word and Life', '🦅'],
  ['ACT', 'Acts', 'New Testament', 28, 'The Spirit empowers the growing church', '🔥'],
  ['ROM', 'Romans', 'New Testament', 16, 'Grace, faith, salvation, and transformed living', '🛤️'],
  ['1CO', '1 Corinthians', 'New Testament', 16, 'Unity, holiness, love, and resurrection', '🤝'],
  ['2CO', '2 Corinthians', 'New Testament', 13, 'Strength in weakness and generous ministry', '🏺'],
  ['GAL', 'Galatians', 'New Testament', 6, 'Freedom through faith and life by the Spirit', '🕊️'],
  ['EPH', 'Ephesians', 'New Testament', 6, 'Identity in Christ and a united church', '🛡️'],
  ['PHP', 'Philippians', 'New Testament', 4, 'Joy, humility, and steadfast partnership', '🌟'],
  ['COL', 'Colossians', 'New Testament', 4, 'The supremacy of Christ and new life', '👑'],
  ['1TH', '1 Thessalonians', 'New Testament', 5, 'Hopeful holiness while awaiting Christ', '☁️'],
  ['2TH', '2 Thessalonians', 'New Testament', 3, 'Steadfast hope and faithful work', '🕰️'],
  ['1TI', '1 Timothy', 'New Testament', 6, 'Healthy teaching and faithful church leadership', '📖'],
  ['2TI', '2 Timothy', 'New Testament', 4, 'Endurance, Scripture, and finishing faithfully', '🏁'],
  ['TIT', 'Titus', 'New Testament', 3, 'Sound teaching expressed through good works', '🛠️'],
  ['PHM', 'Philemon', 'New Testament', 1, 'Forgiveness, reconciliation, and Christian family', '🤲'],
  ['HEB', 'Hebrews', 'New Testament', 13, 'Jesus our greater covenant and High Priest', '⚓'],
  ['JAS', 'James', 'New Testament', 5, 'Living faith through wisdom and action', '🪞'],
  ['1PE', '1 Peter', 'New Testament', 5, 'Living hope and holiness through suffering', '🪨'],
  ['2PE', '2 Peter', 'New Testament', 3, 'Growing in truth while resisting deception', '🪜'],
  ['1JN', '1 John', 'New Testament', 5, 'Assurance, truth, obedience, and love', '💛'],
  ['2JN', '2 John', 'New Testament', 1, 'Walking in truth and discerning error', '✉️'],
  ['3JN', '3 John', 'New Testament', 1, 'Faithful hospitality and courageous truth', '🏠'],
  ['JUD', 'Jude', 'New Testament', 1, 'Contending for faith with mercy', '🛡️'],
  ['REV', 'Revelation', 'New Testament', 22, 'Jesus victorious and creation made new', '🌈'],
] as const;

const FREE_JOURNEY_BOOK_IDS = new Set(['GEN', 'EXO', 'LEV', 'MAT']);

export const BIBLE_JOURNEY_BOOKS: readonly JourneyBook[] = BOOK_SEEDS.map(
  ([id, name, testament, chapterCount, theme, icon], offset) => ({
    id,
    index: offset + 1,
    name,
    testament,
    chapterCount,
    theme,
    icon,
    access: FREE_JOURNEY_BOOK_IDS.has(id) ? 'free' : 'premium',
  }),
);

const BOOK_BY_ID = new Map(BIBLE_JOURNEY_BOOKS.map((book) => [book.id, book]));

export function getJourneyBook(bookId: string): JourneyBook | undefined {
  return BOOK_BY_ID.get(bookId.trim().toUpperCase());
}

export function getNextJourneyBook(bookId: string): JourneyBook | undefined {
  const book = getJourneyBook(bookId);
  return book ? BIBLE_JOURNEY_BOOKS[book.index] : undefined;
}

export function isBookFree(bookId: string): boolean {
  return getJourneyBook(bookId)?.access === 'free';
}
