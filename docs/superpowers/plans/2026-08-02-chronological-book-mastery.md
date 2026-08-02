# Chronological Book Mastery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans for future changes. This implementation is isolated on `feature/chronological-quiz-books`.

**Goal:** Add chronological question ordering, Scripture-reading Book Mastery for the first five books of both Testaments, premium depth, and clickable post-answer Scripture links without redesigning existing Scripture Games screens.

**Architecture:** A pure canonical-reference helper orders selected story questions and resolves Scripture links. A pure Book Mastery core builds 10 free and 25 total passage-grounded questions per book, while a small runtime adapter reads from the existing offline Bible. A focused passage-reader route preserves the quiz underneath it and returns with `router.back()`.

**Tech Stack:** Expo Router 6, React Native 0.81, TypeScript 5.9, existing offline WEB Bible library, Node strip-types tests and audits.

## Global Constraints

- Free Old Testament books: Genesis, Exodus, Leviticus, Numbers, Deuteronomy.
- Free New Testament books: Matthew, Mark, Luke, John, Acts.
- Core rounds contain 5 questions from at least 10 eligible passages per book.
- Premium Extended Mastery contains 10 questions from at least 25 eligible passages per book.
- Story questions are selected for variety and then displayed in forward canonical order.
- General Bible Trivia remains mixed.
- References that would reveal an answer are not printed above the question.
- Every right or wrong answer in Classic Training, Genesis trials, Daily Bread, and Book Mastery provides a clickable Scripture link.
- Existing screen structure, rewards, profiles, navigation, audio, haptics, Bible reader, and Genesis visuals remain intact.
- No merge, EAS build, TestFlight submission, Android build, App Review submission, or public release is authorized.

## Completed Tasks

- [x] Add `frontend/src/quiz-ordering.ts` with canonical book/chapter/verse sorting, book-only references, common aliases, and passage routing.
- [x] Add chronology and reference-parser tests in `frontend/scripts/test-quiz-ordering.ts`.
- [x] Sort selected Classic Training questions after the existing API chooses them.
- [x] Sort selected Genesis trial questions after random selection while preserving shuffled answer positions.
- [x] Remove the visible pre-answer Genesis reference giveaway and replace it with a neutral Open Passage action.
- [x] Add pure `frontend/src/book-mastery-core.ts` and runtime `frontend/src/book-mastery.ts`.
- [x] Add the first five Old Testament and first five New Testament books to the existing Scripture Training hub.
- [x] Add 5-question free rounds and optional 10-question premium Deep Study rounds.
- [x] Build mastery questions from real offline Bible wording instead of answer-giving verse-identification prompts.
- [x] Add `frontend/app/book-mastery.tsx` without replacing existing quiz screens.
- [x] Add `frontend/app/passage-reader.tsx` with highlighted verse context and safe return behavior.
- [x] Add reusable `ScriptureReferenceLink` feedback navigation.
- [x] Add clickable post-answer Scripture links to Classic Training, Genesis trials, Daily Bread, and Book Mastery.
- [x] Add pure Book Mastery tests and source-level audits.
- [x] Wire the tests and audit into package quality gates.

## Verification Commands

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

Do not run `yarn validate`, EAS, TestFlight, Android release, App Review, or public-release commands during this branch review.
