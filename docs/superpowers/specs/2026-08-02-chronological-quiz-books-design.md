# Chronological Quiz Sequencing and Book Mastery Add-On Design

## Goal

Add chronological story ordering and Scripture-reading Book Mastery without redesigning or replacing the current Scripture Games experience.

## Non-Regression Rule

This feature is additive. Existing navigation, visual identity, Genesis season, Scripture Fields, Daily Scripture Trial, Memory & Skill, Bible reader, rewards, profiles, Lumi, audio, haptics, and TestFlight Build 18 behavior must remain intact unless a targeted change is explicitly listed here.

No broad refactor, screen redesign, release workflow change, build-number change, merge, EAS build, TestFlight submission, Android build, App Review submission, or public release is authorized.

## Chronological Story Ordering

Every story-based quiz must present the five selected questions in forward Bible-story order. The question pool may still be randomized first so replays remain fresh, but the selected questions must then be sorted by Bible book, chapter, and verse/event order.

Example Moses flow:

- Exodus 2
- Exodus 3
- Exodus 7
- Exodus 12
- Exodus 14
- Exodus 16
- Exodus 19

Answer choices remain shuffled. General Bible Trivia remains mixed.

The Genesis seasonal trials must also sort their selected questions by reference after selection instead of showing them in random chapter order.

## Free Book Mastery Shelf

The free shelf must use the first five books of each Testament in Bible order.

### Old Testament

1. Genesis
2. Exodus
3. Leviticus
4. Numbers
5. Deuteronomy

### New Testament

1. Matthew
2. Mark
3. Luke
4. John
5. Acts

All ten book cards are visible and unlocked for core mastery. Existing quiz sections remain visible and unchanged.

## Core and Premium Depth

Core mastery is useful on its own:

- 10 eligible Scripture-grounded questions per book
- 5-question rounds
- chronological ordering
- Open Passage action
- no artificial waiting or advertisement requirement

Premium adds depth rather than taking away the core experience:

- 25 total eligible questions per book, including the 10 core questions
- optional 10-question Extended Mastery rounds
- lower repetition through unique passage/concept selection
- same accuracy and no-giveaway rules

The TestFlight beta may continue treating current profiles as premium-enabled for testing. Production purchase handling is outside this add-on.

## Question Integrity

Book Mastery must make the player read Scripture. The app must not print a verse reference above a question when that reference gives away or materially hints at the answer.

Every Book Mastery question uses one of these reference modes:

- `after`: hide the reference until the player locks in an answer
- `reader-only`: show a neutral Open Passage action; reveal the full reference inside the reader and in feedback
- `before`: permitted only when the visible reference cannot answer the question and the task explicitly requires reading it

Questions such as “Which verse says this?” or “Where is this written?” must never show the answer reference beforehand.

Preferred question behavior:

- open the assigned passage
- read the verse or surrounding chapter
- identify the wording or detail that actually appears
- answer from the text

The same passage/concept may not appear twice in one round.

## Additive Passage Reader

Book Mastery receives a focused passage-reader route backed by the existing offline 66-book WEB Bible data.

The reader:

- opens the exact book, chapter, and optional verse
- shows surrounding context
- highlights the assigned verse
- returns with `router.back()`
- does not submit an answer, alter the score, advance the question, or reset the round

Genesis seasonal mastery also receives an Open Passage action. Its reference remains hidden before answering and visible in feedback afterward.

## Data Architecture

### Chronology helper

Create a pure helper that:

- parses Bible references
- preserves General Trivia order
- sorts all other selected story questions by canonical book, chapter, and verse
- converts a question reference into a Bible reader location

### Book Mastery engine

Use a compact configuration of 25 verified anchor passages per book. Question wording and answer choices are built directly from the existing offline Bible text, making the source text—not hard-coded paraphrase—the authority.

Each anchor produces a unique passage-observation question. The correct option is the actual verse excerpt; distractors are distinct excerpts from other passages in the same book. Core uses the first 10 verified anchors; Extended Mastery may use all 25.

Required book IDs:

- `GEN`, `EXO`, `LEV`, `NUM`, `DEU`
- `MAT`, `MRK`, `LUK`, `JHN`, `ACT`

## Training Hub

Add two sections beneath the existing Scripture Fields:

- Old Testament Books
- New Testament Books

Each card starts the free 5-question mastery round. The card copy may mention that premium profiles can unlock a 10-question Deep Study round, but core mastery must remain immediately playable.

## Testing and Audit Requirements

Automated checks must prove:

1. Moses selections are returned in forward order.
2. Genesis seasonal selections are returned in forward order.
3. General Trivia remains mixed.
4. Answer choices are shuffled without corrupting the correct answer index.
5. Exactly five free Old Testament books are exposed: Genesis through Deuteronomy.
6. Exactly five free New Testament books are exposed: Matthew through Acts.
7. Every book has at least 10 core anchors and 25 total anchors.
8. Core rounds contain 5 unique passages.
9. Extended rounds contain 10 unique passages.
10. Rounds are chronological after selection.
11. Hidden references do not render before submission.
12. Open Passage resolves to a valid offline Bible location.
13. Returning from the passage reader preserves mastery state.
14. No existing feature section is removed.
15. No release or build files change.

## Acceptance Criteria

- All story quizzes flow forward instead of jumping backward through Scripture.
- The first five books of both Testaments are free Book Mastery options.
- Book Mastery requires actual Scripture reading and never displays its own answer as a visible reference.
- Premium adds more questions and longer rounds without weakening free access.
- The current product design remains recognizable and stable.
- The feature remains isolated on `feature/chronological-quiz-books`.
- Build 18 remains the current TestFlight build until separately authorized.
