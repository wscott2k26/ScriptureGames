# Chronological Quiz Sequencing and Bible Book Coverage Design

## Goal

Make every story-based Scripture Games quiz feel like a guided Bible story by presenting selected questions in canonical story order, while adding at least five unlocked Bible-book quizzes from the Old Testament and at least five unlocked Bible-book quizzes from the New Testament.

## User Experience

Story-based quizzes must no longer jump backward and forward through chapters or events. A Moses round must move forward through Moses' story, such as Exodus 2, Exodus 3, Exodus 7, Exodus 12, Exodus 14, Exodus 16, Exodus 19, and later books when selected. The exact five questions may still vary between replays, but the chosen questions must be displayed in timeline order.

Answer choices remain shuffled independently so the correct answer does not stay in a predictable position.

General Bible Trivia remains intentionally mixed because it is not a single continuous story.

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

All ten are available in the Scripture Training hub without a premium lock in the TestFlight beta and remain compatible with the current local-first architecture.

## Recommended Architecture

### Question metadata

Extend each quiz question with explicit ordering metadata rather than parsing display text at runtime.

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

`order` is the authoritative story sequence for a topic or book quiz. `book`, `chapter`, and `verseStart` provide auditability and future filtering. Existing question text and answer choices remain unchanged unless a factual or sequencing issue is discovered during audit.

### Selection and ordering flow

For story-based topics and book quizzes:

1. Load the full question pool.
2. Randomly select up to the requested limit.
3. Sort the selected questions by `order` ascending.
4. Shuffle answer choices for each question.
5. Return the ordered round.

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

## Content Model

The canonical source remains `backend/seed_data.py`. Generated frontend content remains `frontend/src/content.generated.ts` and must be regenerated through the existing generator rather than edited by hand.

Each of the ten book pools must contain enough questions to support repeated five-question rounds. The minimum target is ten verified questions per book, with broader coverage preferred where the canonical content already supports it.

Questions may be shared conceptually with existing topic pools, but the generated data should avoid duplicated mutable objects. Each book pool should be independently auditable.

## Training Hub Changes

The Scripture Training hub will add two clearly labeled sections:

- Old Testament Books
- New Testament Books

Each section exposes five book cards. Existing Scripture Fields and Memory & Skill sections remain intact.

Book cards route through the existing `/quiz-play` screen using their topic key. No new gameplay screen is required.

## Error Handling

- A topic with no matching pool falls back to General Bible Trivia only when that behavior is already expected by the current API.
- Story-based pools missing `order` metadata must fail an audit rather than silently reverting to random chronology.
- Duplicate `order` values are allowed only when two questions concern the same event; their secondary order is chapter, verse, then source position.
- Malformed chapter or verse metadata must fail validation.
- A pool with fewer than five questions must fail the content audit.

## Testing Strategy

### Unit tests

Add tests that prove:

- Moses questions are returned in forward story order after random selection.
- Answer options are still shuffled while the correct answer index remains accurate.
- General Trivia remains mixed and is not forced into canonical order.
- Every chronological or teaching topic has explicit ordering metadata.
- Each of the ten book quizzes contains at least five questions, with a target of ten or more.
- Exactly five initial Old Testament book topics and five initial New Testament book topics are exposed in the training hub.

### Content audit

Extend the existing audit to verify:

- Required book pools exist.
- Every required pool is unlocked.
- Every required pool has at least five questions.
- Every chronological and teaching question has a finite numeric `order`.
- Book, chapter, and verse metadata are valid where present.
- Selected rounds are monotonic by order.

### Regression verification

Run the existing quality gate, including content generation diff checks, TypeScript, lint, Expo Doctor, and export audits. No EAS build, TestFlight upload, Android build, App Review submission, or public release is authorized by this feature work.

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
6. Each required book pool has at least five verified questions, with ten or more as the content target.
7. The existing quiz-play screen remains the sole gameplay screen for these quizzes.
8. Automated tests and content audits prove ordering, coverage, and unlock status.
9. No paid build, TestFlight submission, Android build, merge, App Review submission, or public release occurs without separate authorization.
