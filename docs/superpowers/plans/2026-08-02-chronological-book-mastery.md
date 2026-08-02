# Chronological Book Mastery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver chronologically ordered story quizzes and ten Scripture-reading Book Mastery fields with five-question core rounds, optional ten-question premium rounds, hidden answer-giving references, and safe offline passage reading.

**Architecture:** Keep existing classic quiz data intact and sort the five selected questions in the UI through a pure reference-ordering helper. Add a separate, reusable Book Mastery engine with compact book blueprints that produce core and premium questions from the existing offline Bible library. Use a focused passage-reader route so mastery state remains mounted and intact while Scripture is opened.

**Tech Stack:** Expo Router 6, React Native 0.81, TypeScript 5.9, AsyncStorage, existing offline WEB Bible library, Node strip-types test scripts, Python/Node audits.

## Global Constraints

- Five unlocked Old Testament books: Genesis, Exodus, 1 Samuel, Daniel, Jonah.
- Five unlocked New Testament books: Matthew, Mark, Luke, John, Acts.
- Core rounds contain exactly 5 questions.
- Premium Extended Mastery rounds contain exactly 10 questions.
- Core has at least 10 eligible questions per book; premium has at least 25 total eligible questions per book.
- Story questions are ordered forward after selection; answer choices remain shuffled.
- General Bible Trivia remains mixed.
- A visible reference must never answer its own question.
- Passage-reader return must preserve mastery question, selection, score, and order.
- Build 18 remains untouched.
- No EAS build, TestFlight submission, Android build, App Review submission, public release, or merge to `main` without separate authorization.

---

### Task 1: Pure chronological ordering helper

**Files:**
- Create: `frontend/src/quiz-ordering.ts`
- Create: `frontend/scripts/test-quiz-ordering.ts`
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: `sortSelectedQuizQuestions<T extends OrderedQuizQuestion>(topic: string, questions: readonly T[]): T[]`
- Produces: `sortSelectedGenesisQuestions<T extends { reference: string }>(questions: readonly T[]): T[]`
- Produces: `isMixedQuizTopic(topic: string): boolean`

- [ ] **Step 1: Write failing ordering tests**

```ts
import assert from 'node:assert/strict';
import { sortSelectedQuizQuestions } from '../src/quiz-ordering';

const moses = [
  { q: 'Sinai', verse: 'Exodus 19:20' },
  { q: 'First plague', verse: 'Exodus 7:20' },
  { q: 'Burning bush', verse: 'Exodus 3:2' },
];

assert.deepEqual(
  sortSelectedQuizQuestions('moses', moses).map((item) => item.q),
  ['Burning bush', 'First plague', 'Sinai'],
);

const general = [
  { q: 'Third', verse: 'John 3:16' },
  { q: 'First', verse: 'Genesis 1:1' },
];
assert.deepEqual(sortSelectedQuizQuestions('general', general), general);
```

- [ ] **Step 2: Run test and verify failure**

Run: `cd frontend && node --experimental-strip-types scripts/test-quiz-ordering.ts`
Expected: FAIL because `quiz-ordering.ts` does not exist.

- [ ] **Step 3: Implement canonical reference parsing and topic modes**

```ts
export type OrderedQuizQuestion = { verse?: string; reference?: string };

const MIXED_TOPICS = new Set(['general']);
const BOOK_ORDER = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];

function referenceKey(reference = ''): number {
  const match = reference.match(/^((?:[1-3]\s)?[A-Za-z]+(?:\sof\s[A-Za-z]+)?)\s+(\d+)(?::(\d+))?/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const book = BOOK_ORDER.indexOf(match[1]);
  return (book < 0 ? 999 : book) * 1_000_000 + Number(match[2]) * 1_000 + Number(match[3] || 0);
}

export function sortSelectedQuizQuestions<T extends OrderedQuizQuestion>(topic: string, questions: readonly T[]): T[] {
  if (MIXED_TOPICS.has(topic)) return [...questions];
  return [...questions].sort((a, b) => referenceKey(a.verse || a.reference) - referenceKey(b.verse || b.reference));
}
```

- [ ] **Step 4: Run test and verify pass**

Run: `cd frontend && node --experimental-strip-types scripts/test-quiz-ordering.ts`
Expected: PASS.

- [ ] **Step 5: Add package script**

Add: `"test:quiz-ordering": "node --experimental-strip-types scripts/test-quiz-ordering.ts"`.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/quiz-ordering.ts frontend/scripts/test-quiz-ordering.ts frontend/package.json
git commit -m "feat: add chronological quiz ordering helper"
```

### Task 2: Apply chronology and remove visible reference giveaways

**Files:**
- Modify: `frontend/app/quiz-play.tsx`
- Modify: `frontend/app/genesis-quiz.tsx`
- Create: `frontend/scripts/test-reference-visibility.ts`

**Interfaces:**
- Consumes: `sortSelectedQuizQuestions`, `sortSelectedGenesisQuestions`
- Produces: `shouldShowReferenceBeforeAnswer(questionText: string): boolean`

- [ ] **Step 1: Write failing visibility tests**

```ts
import assert from 'node:assert/strict';
import { shouldShowReferenceBeforeAnswer } from '../src/quiz-ordering';

assert.equal(shouldShowReferenceBeforeAnswer('Which verse says God spoke to Moses?'), false);
assert.equal(shouldShowReferenceBeforeAnswer('Where is this written?'), false);
assert.equal(shouldShowReferenceBeforeAnswer('Read the passage. What did Moses remove?'), true);
```

- [ ] **Step 2: Run tests and verify failure**

Run: `cd frontend && node --experimental-strip-types scripts/test-reference-visibility.ts`
Expected: FAIL because the function does not exist.

- [ ] **Step 3: Implement visibility rule**

```ts
const REFERENCE_ANSWER_PATTERN = /\b(which|what)\s+(verse|chapter|reference)|where\s+(?:is|was)\s+(?:this|it)\s+written|where\s+does\s+(?:the\s+)?bible\s+say/i;

export function shouldShowReferenceBeforeAnswer(questionText: string): boolean {
  return !REFERENCE_ANSWER_PATTERN.test(questionText);
}
```

- [ ] **Step 4: Sort classic questions after API selection**

Change the `api.getQuiz` success handler to:

```ts
.then((result) => {
  if (active) setQuestions(sortSelectedQuizQuestions(String(topic), result.questions));
})
```

- [ ] **Step 5: Sort Genesis trial questions after random selection**

Change Genesis question preparation to:

```ts
const questions = useMemo(() => {
  if (!trial) return [];
  const selected = shuffle(trial.questions).slice(0, 5);
  return sortSelectedGenesisQuestions(selected).map(prepareQuestion);
}, [trial]);
```

- [ ] **Step 6: Hide answer-giving references before submission**

Render the pre-question reference only when:

```tsx
{shouldShowReferenceBeforeAnswer(question.q) ? (
  <Text style={styles.questionReference}>{question.reference}</Text>
) : null}
```

Continue rendering the reference inside feedback after answer submission.

- [ ] **Step 7: Run ordering and visibility tests**

Run: `cd frontend && yarn test:quiz-ordering && node --experimental-strip-types scripts/test-reference-visibility.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/quiz-ordering.ts frontend/app/quiz-play.tsx frontend/app/genesis-quiz.tsx frontend/scripts/test-reference-visibility.ts
git commit -m "fix: keep story quizzes chronological and hide reference giveaways"
```

### Task 3: Book Mastery data model and premium depth engine

**Files:**
- Create: `frontend/src/book-mastery.ts`
- Create: `frontend/scripts/test-book-mastery.ts`

**Interfaces:**
- Produces: `BOOK_MASTERY_BOOKS: readonly BookMasteryBook[]`
- Produces: `buildMasteryRound(bookId: BookMasteryBookId, mode: 'core' | 'extended', seed?: number): MasteryQuestion[]`
- Produces: `getBookMastery(bookId: string): BookMasteryBook | undefined`

- [ ] **Step 1: Write failing coverage and redundancy tests**

```ts
import assert from 'node:assert/strict';
import { BOOK_MASTERY_BOOKS, buildMasteryRound } from '../src/book-mastery';

assert.equal(BOOK_MASTERY_BOOKS.filter((book) => book.testament === 'old').length, 5);
assert.equal(BOOK_MASTERY_BOOKS.filter((book) => book.testament === 'new').length, 5);

for (const book of BOOK_MASTERY_BOOKS) {
  assert.ok(book.questions.filter((q) => q.tier === 'core').length >= 10, `${book.title} core coverage`);
  assert.ok(book.questions.length >= 25, `${book.title} premium coverage`);
  const core = buildMasteryRound(book.id, 'core', 7);
  const extended = buildMasteryRound(book.id, 'extended', 7);
  assert.equal(core.length, 5);
  assert.equal(extended.length, 10);
  assert.equal(new Set(core.map((q) => q.concept)).size, core.length);
  assert.deepEqual(core.map((q) => q.order), [...core.map((q) => q.order)].sort((a, b) => a - b));
}
```

- [ ] **Step 2: Run test and verify failure**

Run: `cd frontend && node --experimental-strip-types scripts/test-book-mastery.ts`
Expected: FAIL because `book-mastery.ts` does not exist.

- [ ] **Step 3: Define mastery types**

```ts
export type BookMasteryBookId = 'genesis' | 'exodus' | 'first-samuel' | 'daniel' | 'jonah' | 'matthew' | 'mark' | 'luke' | 'john' | 'acts';
export type MasterySkill = 'recall' | 'observation' | 'context' | 'sequence' | 'speaker' | 'meaning';
export type ReferenceVisibility = 'before' | 'after' | 'reader-only';
export type MasteryTier = 'core' | 'premium';

export type MasteryQuestion = {
  id: string;
  concept: string;
  q: string;
  options: [string, string, string, string];
  answer: number;
  reference: string;
  explanation: string;
  referenceVisibility: ReferenceVisibility;
  readerPrompt?: string;
  order: number;
  bookId: string;
  chapter: number;
  verseStart?: number;
  tier: MasteryTier;
  skill: MasterySkill;
};
```

- [ ] **Step 4: Add ten book blueprints**

Each blueprint must include 10 hand-verified core questions and 15 additional premium questions. Passage-reading questions use `before` or `reader-only`; reference-identification questions use `after`.

Required books:

```ts
['genesis', 'exodus', 'first-samuel', 'daniel', 'jonah', 'matthew', 'mark', 'luke', 'john', 'acts']
```

- [ ] **Step 5: Implement concept-aware deterministic selection**

```ts
export function buildMasteryRound(bookId: BookMasteryBookId, mode: 'core' | 'extended', seed = Date.now()): MasteryQuestion[] {
  const book = getBookMastery(bookId);
  if (!book) return [];
  const allowed = mode === 'core' ? book.questions.filter((q) => q.tier === 'core') : book.questions;
  const target = mode === 'core' ? 5 : 10;
  const selected = seededShuffle(allowed, seed).filter((question, index, all) =>
    all.findIndex((candidate) => candidate.concept === question.concept) === index,
  ).slice(0, target);
  return selected.sort((a, b) => a.order - b.order);
}
```

- [ ] **Step 6: Run coverage tests**

Run: `cd frontend && node --experimental-strip-types scripts/test-book-mastery.ts`
Expected: PASS for all ten books.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/book-mastery.ts frontend/scripts/test-book-mastery.ts
git commit -m "feat: add ten-book mastery question engine"
```

### Task 4: Focused offline passage reader

**Files:**
- Create: `frontend/app/passage-reader.tsx`

**Interfaces:**
- Consumes route params: `{ bookId: string; chapter: string; verse?: string; title?: string }`
- Consumes: `getBibleBook`, `getBibleChapter`, `formatBibleReference`

- [ ] **Step 1: Implement safe passage lookup**

Validate the book, clamp chapter and verse, and show an unavailable panel rather than crashing for malformed params.

- [ ] **Step 2: Render the passage using existing Bible data**

```tsx
const verses = getBibleChapter(book.id, chapter);
return verses.map(([number, text]) => (
  <View key={number} style={styles.verseRow}>
    <Text style={styles.verseNumber}>{number}</Text>
    <Text style={styles.verseText}>{text}</Text>
  </View>
));
```

- [ ] **Step 3: Focus and label the assigned verse**

Highlight `verseStart` without hiding surrounding context.

- [ ] **Step 4: Preserve mastery state**

Use `router.back()` as the primary return action. Do not mutate mastery state from the reader.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/passage-reader.tsx
git commit -m "feat: add focused offline passage reader"
```

### Task 5: Book Mastery gameplay screen

**Files:**
- Create: `frontend/app/book-mastery.tsx`

**Interfaces:**
- Consumes route params: `{ book: BookMasteryBookId; mode?: 'core' | 'extended' }`
- Consumes: `buildMasteryRound`, `getBookMastery`
- Routes to: `/passage-reader`

- [ ] **Step 1: Build stable round initialization**

Use `useRef` or lazy state so the round is generated once and is not reshuffled when the screen regains focus.

- [ ] **Step 2: Render reference based on visibility**

```tsx
const showReferenceBefore = question.referenceVisibility === 'before';
const showReaderAction = question.referenceVisibility === 'reader-only' || question.referenceVisibility === 'before';
```

Never render `after` references before answer submission.

- [ ] **Step 3: Add Open Passage action**

```ts
router.push({
  pathname: '/passage-reader',
  params: {
    bookId: question.bookId,
    chapter: String(question.chapter),
    ...(question.verseStart ? { verse: String(question.verseStart) } : {}),
    title: book.title,
  },
});
```

- [ ] **Step 4: Keep core and premium entry points honest**

Core mode always uses 5 questions. Extended mode uses 10 questions and requires `profile.is_premium`; in the TestFlight beta current profiles are premium-enabled.

- [ ] **Step 5: Render feedback after submission**

Show correct answer, explanation, and full reference only after the answer is locked.

- [ ] **Step 6: Add replay and return actions**

Replay replaces the route with a new seed; return goes to `/(tabs)/quiz`.

- [ ] **Step 7: Commit**

```bash
git add frontend/app/book-mastery.tsx
git commit -m "feat: add Scripture-reading Book Mastery gameplay"
```

### Task 6: Training hub book sections

**Files:**
- Modify: `frontend/app/(tabs)/quiz.tsx`

**Interfaces:**
- Consumes: `BOOK_MASTERY_BOOKS`
- Routes to: `/book-mastery?book=<id>&mode=core` and premium extended mode.

- [ ] **Step 1: Add Old Testament Books section**

Render Genesis, Exodus, 1 Samuel, Daniel, and Jonah.

- [ ] **Step 2: Add New Testament Books section**

Render Matthew, Mark, Luke, John, and Acts.

- [ ] **Step 3: Add transparent premium depth copy**

Core card action: `Start 5-Question Mastery`.
Extended action/badge: `10-Question Deep Study` for premium profiles.

- [ ] **Step 4: Keep existing sections intact**

Do not remove Scripture Fields, Daily Scripture Trial, or Memory & Skill.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/(tabs)/quiz.tsx
git commit -m "feat: expose Old and New Testament book mastery"
```

### Task 7: Audits and package integration

**Files:**
- Create: `frontend/scripts/audit-book-mastery.ts`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: `BOOK_MASTERY_BOOKS`, `buildMasteryRound`

- [ ] **Step 1: Add audit assertions**

Assert ten books, five per Testament, core >= 10, total >= 25, distinct options, valid answer index, valid visibility, no duplicate IDs, concept-unique rounds, and monotonic order.

- [ ] **Step 2: Add heuristic giveaway audit**

Fail when a question matching reference-identification language uses `before` or `reader-only`.

- [ ] **Step 3: Add package scripts**

```json
"test:book-mastery": "node --experimental-strip-types scripts/test-book-mastery.ts",
"audit:book-mastery": "node --experimental-strip-types scripts/audit-book-mastery.ts"
```

Add both scripts to `validate` before export commands.

- [ ] **Step 4: Run focused checks**

Run:

```bash
cd frontend
yarn test:quiz-ordering
yarn test:book-mastery
yarn audit:book-mastery
yarn typecheck
yarn lint
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/scripts/audit-book-mastery.ts frontend/package.json
git commit -m "test: audit chronological Book Mastery coverage"
```

### Task 8: Final verification without release actions

**Files:**
- Review only; no release workflow files.

- [ ] **Step 1: Run non-build verification**

Run:

```bash
cd frontend
yarn test:quiz-ordering
yarn test:book-mastery
yarn audit:book-mastery
yarn audit:bible
yarn audit:premium
yarn audit:runtime
yarn audit:content
yarn doctor
yarn typecheck
yarn lint
```

Do not run `yarn validate` because it exports both platforms, and do not run EAS commands.

- [ ] **Step 2: Inspect branch diff**

Confirm no `.github/workflows`, `app.json` build number, `eas.json`, Android release, or TestFlight authorization files changed.

- [ ] **Step 3: Confirm workflow status**

Verify the feature-branch commit has no release workflow or EAS job.

- [ ] **Step 4: Produce review summary**

Report changed files, test evidence, known limitations, and explicitly state that the branch is not merged and Build 18 remains untouched.
