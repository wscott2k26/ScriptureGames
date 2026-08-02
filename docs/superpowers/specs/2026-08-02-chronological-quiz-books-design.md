# Chronological Quiz Sequencing, Book Mastery, and Bible Book Coverage Design

## Goal

Make every story-based Scripture Games quiz feel like a guided Bible story by presenting selected questions in canonical story order, add at least five unlocked Bible-book quizzes from each Testament, and turn Book Mastery into genuine Scripture-reading practice instead of accidental answer giveaways.

## User Experience

Story-based quizzes must no longer jump backward and forward through chapters or events. A Moses round must move forward through Moses' story, such as Exodus 2, Exodus 3, Exodus 7, Exodus 12, Exodus 14, Exodus 16, Exodus 19, and later books when selected. The exact five questions may still vary between replays, but the chosen questions must be displayed in timeline order.

Answer choices remain shuffled independently so the correct answer does not stay in a predictable position.

General Bible Trivia remains intentionally mixed because it is not a single continuous story.

Book Mastery must reward opening and reading the built-in Bible. It must never reveal a reference above a question when that reference answers or materially hints at the prompt.

## Scope

### Existing story-based topics

Chronological ordering applies to all story-based topic quizzes, including:

- Creation
- Noah and the Covenant
- Moses
- David
- Prophets
- The Nativity
- Miracles of Jesus
- Parables
- Sermon on the Mount
- Apostles
- Resurrection
- Jonah
- Ten Commandments
- Psalms when questions refer to a historical sequence

Topic quizzes that are thematic rather than narrative may use an explicit stable teaching order instead of strict chronology. General Bible Trivia is excluded from chronological ordering.

### New unlocked Bible-book quizzes

The first release of book-specific quizzes will include ten unlocked books.

Old Testament:

1. Genesis
2. Exodus
3. 1 Samuel
4. Daniel
5. Jonah

New Testament:

1. Matthew
2. Mark
3. Luke
4. John
5. Acts

All ten are available in the Scripture Training hub without a premium lock. Every user receives a complete, useful Book Mastery experience for those ten books.

## Book Mastery Question Integrity

### No-answer-giveaway rule

The current mastery gameplay screen displays `question.reference` above every prompt. That presentation is prohibited when the prompt asks the player to identify a verse, chapter, reference, location, speaker, quoted phrase, or event whose answer is exposed by that reference.

Each mastery question must declare how its reference is presented:

```ts
type ReferenceVisibility = 'before' | 'after' | 'reader-only';

type MasteryQuestion = {
  q: string;
  options: readonly string[];
  answer: number;
  reference: string;
  explanation: string;
  referenceVisibility: ReferenceVisibility;
  readerPrompt?: string;
  order: number;
  book: string;
  chapter: number;
  verseStart?: number;
  tier: 'core' | 'premium';
  skill: 'recall' | 'observation' | 'context' | 'sequence' | 'speaker' | 'meaning';
};
```

Rules:

- `before`: The reference may appear before answering only when it does not disclose the answer and the task explicitly asks the player to read that passage.
- `after`: The reference stays hidden until the player locks in an answer, then appears with the explanation.
- `reader-only`: The gameplay screen shows a neutral instruction such as “Open the Bible and read the assigned passage,” while the app opens the Bible reader at the passage. The full reference is available inside the reader and after answering, not as a giveaway above the prompt.
- A question asking “Which verse says…?” or “Where is this written?” must use `after`; it must never show that same answer reference beforehand.
- A question asking what a passage says, who speaks, what happens next, why a response matters, or what detail appears in the text may use `before` or `reader-only` because the player must read the passage to answer.

### Preferred question style

Book Mastery should lean toward questions like the user-approved question 4 pattern: the player opens Scripture, reads the assigned passage, observes the text, and answers from what was read.

Preferred skills:

1. Observation — identify a detail stated in the passage.
2. Sequence — identify what happens immediately before or after an event.
3. Speaker — identify who said a line and to whom.
4. Context — connect a verse to the surrounding event or argument.
5. Meaning — choose the best text-grounded interpretation without inventing doctrine beyond the passage.
6. Recall — use sparingly for foundational facts.

Disallowed or weak patterns:

- The answer is printed in the visible reference or heading.
- The prompt and answer merely repeat the same wording.
- Two questions in one five-question round test the same fact.
- Distractors are obviously silly or unrelated.
- The question can be answered solely from the title card without reading Scripture.
- A question claims one interpretation where the passage supports multiple reasonable readings.

### Reader integration

Book Mastery uses the existing offline Bible reader. A passage-based question includes an “Open Passage” action that routes to the exact book, chapter, and optional verse. Returning to mastery preserves the current question, selected answer state, score, and round order.

The reader action must not mark the answer, advance the question, or reveal the explanation.

## Recommended Architecture

### Quiz question metadata

Extend the shared quiz question model with explicit ordering metadata rather than parsing display text at runtime.

```ts
type QuizQuestion = {
  q: string;
  options: readonly string[];
  answer: number;
  verse?: string;
  difficulty?: number;
  order?: number;
  book?: string;
  chapter?: number;
  verseStart?: number;
};
```

`order` is the authoritative story sequence for a topic or book quiz. `book`, `chapter`, and `verseStart` provide auditability and future filtering. Existing question text and answer choices remain unchanged unless a factual, sequencing, redundancy, giveaway, or quality issue is discovered during audit.

### Selection and ordering flow

For story-based topics and book quizzes:

1. Load the eligible question pool for the player’s access tier.
2. Remove duplicate concepts for the current round.
3. Randomly select up to the requested limit with balanced question skills.
4. Sort the selected questions by `order` ascending.
5. Shuffle answer choices for each question.
6. Return the ordered round.

For General Bible Trivia:

1. Load the general pool.
2. Randomly select up to the requested limit.
3. Sort only by existing difficulty behavior when desired.
4. Shuffle answer choices.

This preserves replay variety without breaking the story timeline.

### Topic configuration

Create a small configuration map that identifies how each topic should be ordered.

```ts
type QuizOrderingMode = 'chronological' | 'teaching' | 'mixed';

const QUIZ_ORDERING: Record<string, QuizOrderingMode> = {
  general: 'mixed',
  creation: 'chronological',
  noah: 'chronological',
  moses: 'chronological',
  david: 'chronological',
  prophets: 'chronological',
  nativity: 'chronological',
  miracles: 'chronological',
  parables: 'teaching',
  sermon: 'teaching',
  apostles: 'chronological',
  resurrection: 'chronological',
  jonah: 'chronological',
  commandments: 'teaching',
  psalms: 'teaching',
  genesis: 'chronological',
  exodus: 'chronological',
  first_samuel: 'chronological',
  daniel: 'chronological',
  matthew: 'chronological',
  mark: 'chronological',
  luke: 'chronological',
  john: 'chronological',
  acts: 'chronological',
};
```

Teaching-mode topics use explicit `order` values but do not claim a single historical timeline where one does not naturally exist.

## Free and Premium Depth

Premium must add genuine depth, not remove the usefulness of the free experience.

### Core access

For each of the ten launch books:

- At least 10 verified core questions.
- Five-question rounds.
- Chronological progression.
- Passage-opening questions.
- Core observation, sequence, speaker, and context skills.
- No advertisements or artificial waiting required to finish a round.

### Premium access

For each of the ten launch books:

- At least 25 total verified questions, including the core questions.
- Longer optional 10-question mastery rounds.
- More difficult context, meaning, cross-chapter sequence, and speaker questions.
- Reduced repetition through concept-aware selection.
- A visible “Deep Study” or “Extended Mastery” entry point, never a deceptive replacement for core mastery.
- Premium questions remain text-grounded and must pass the same giveaway and accuracy audits.

The TestFlight beta may keep all premium content unlocked for testing, consistent with the current beta behavior. Production entitlement handling remains separate from this content feature.

## Content Model

The canonical shared quiz source remains `backend/seed_data.py`. Generated frontend content remains `frontend/src/content.generated.ts` and must be regenerated through the existing generator rather than edited by hand.

Genesis seasonal mastery content currently lives in `frontend/src/genesis-season.ts`. The reusable mastery presentation and question-integrity rules must be applied there and to the new book pools. Where practical, extract shared mastery question types and selection helpers so Genesis and the ten book quizzes cannot drift into different giveaway behavior.

Each of the ten book pools must contain enough questions to support repeated rounds. Core minimum is 10 verified questions per book. Premium target is at least 25 total verified questions per book.

Questions may share biblical events conceptually with existing topic pools, but each pool must be independently auditable and each question must have a stable concept identifier to prevent redundant questions in the same round.

## Training Hub Changes

The Scripture Training hub will add two clearly labeled sections:

- Old Testament Books
- New Testament Books

Each section exposes five book cards. Existing Scripture Fields and Memory & Skill sections remain intact.

Book cards route through the mastery gameplay flow using their topic key. The shared mastery gameplay should support passage opening, reference visibility, core five-question rounds, and premium extended rounds.

## Error Handling

- A topic with no matching pool falls back to General Bible Trivia only when that behavior is already expected by the current API.
- Story-based pools missing `order` metadata must fail an audit rather than silently reverting to random chronology.
- Mastery questions missing `referenceVisibility`, `skill`, `tier`, or concept metadata must fail an audit.
- A hidden-reference question must not render the reference before answer submission.
- Duplicate concept identifiers may not appear in the same round.
- Duplicate `order` values are allowed only when two questions concern the same event; their secondary order is chapter, verse, then source position.
- Malformed chapter or verse metadata must fail validation.
- A core pool with fewer than 10 questions or a premium-complete pool with fewer than 25 total questions must fail the content audit.
- Bible reader navigation failure must leave the player safely on the mastery question with progress intact.

## Testing Strategy

### Unit tests

Add tests that prove:

- Moses questions are returned in forward story order after random selection.
- Answer options are still shuffled while the correct answer index remains accurate.
- General Trivia remains mixed and is not forced into canonical order.
- Every chronological or teaching topic has explicit ordering metadata.
- Each of the ten book quizzes contains at least 10 core questions and at least 25 total questions.
- Exactly five initial Old Testament book topics and five initial New Testament book topics are exposed in the training hub.
- A “Which verse says…” question does not expose its reference before answering.
- Passage-reading questions can open the correct Bible location and return without losing round state.
- No two selected questions in one round share the same concept identifier.
- Core rounds contain five questions; premium extended rounds contain ten.
- Premium question selection includes harder skills without excluding core questions.

### Content audit

Extend the existing audit to verify:

- Required book pools exist.
- Every required core pool is unlocked.
- Every required pool has at least 10 core and 25 total questions.
- Every chronological and teaching question has a finite numeric `order`.
- Book, chapter, and verse metadata are valid where present.
- Every mastery question has a valid reference-visibility mode, skill, tier, and concept identifier.
- No prompt is materially answered by metadata visible before submission.
- Selected rounds are monotonic by order and concept-unique.
- Distractors are non-empty, distinct, and do not duplicate the correct answer.

### Regression verification

Run the existing quality gate, including content generation diff checks, TypeScript, lint, Expo Doctor, Bible audit, premium audit, runtime audit, and export audits. No EAS build, TestFlight upload, Android build, App Review submission, or public release is authorized by this feature work.

## Release Safety

This work is isolated on `feature/chronological-quiz-books`.

The implementation may be committed and tested on the feature branch. It must not be merged into `main` until the feature audit and review pass. It must not trigger EAS, TestFlight, Android, App Review, or production release workflows.

Build 18 remains the current TestFlight build until the user separately authorizes a future iOS build and submission.

## Acceptance Criteria

1. Every story-based quiz round presents its selected questions in forward story order.
2. Answer choices remain randomized without corrupting the correct answer index.
3. General Bible Trivia remains a mixed-topic experience.
4. Five unlocked Old Testament book quizzes are visible: Genesis, Exodus, 1 Samuel, Daniel, and Jonah.
5. Five unlocked New Testament book quizzes are visible: Matthew, Mark, Luke, John, and Acts.
6. Every launch book contains at least 10 core questions and at least 25 total questions including premium depth.
7. No mastery question displays a reference that gives away its own answer.
8. Passage-based mastery questions provide an Open Passage action into the offline Bible and preserve quiz state on return.
9. Core mastery uses five-question rounds; premium offers optional ten-question Extended Mastery rounds.
10. Round selection avoids redundant questions testing the same fact.
11. Automated tests and content audits prove ordering, coverage, unlock status, reference integrity, reader navigation, and premium depth.
12. No paid build, TestFlight submission, Android build, merge, App Review submission, or public release occurs without separate authorization.
