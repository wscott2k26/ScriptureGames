# Complete Bible Journey Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a non-destructive 66-book Bible Journey, free Books 1-3, a Premium boundary for Books 4-66, peaceful selectable scenes, and intentional mastery feedback while preserving existing Genesis gameplay and stability fixes.

**Architecture:** Keep Genesis as an adapter-backed special season. Add a canonical book catalog, versioned per-player journey progress, and a reusable offline season engine that generates deterministic Scripture-reference challenges from the bundled public-domain Bible. Add an isolated entitlement boundary and procedural scene system so commerce and art can evolve without coupling to gameplay.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, TypeScript 5.9, AsyncStorage 2.2, React Native Reanimated 4.1, expo-linear-gradient 15.0, generated WEBP Bible JSON, GitHub Actions.

## Global Constraints

- Do not change Genesis questions, answer keys, trial order, Manna, rank, faction, XP, scoring, or first-clear reward rules.
- Do not replace Genesis trial backgrounds.
- Do not introduce a global full-screen animated navigation overlay.
- Keep inactive tabs detached and frozen.
- Keep typed Lumi, microphone guards, Back fallback, audio controls, and offline Bible behavior intact.
- Books 1-3 are free; Books 4-66 require Premium.
- Never simulate a successful production purchase.
- All new gameplay works offline after the Bible bundle is generated.
- No EAS build is triggered by this branch.
- Android cloud builds remain skipped.

---

### Task 1: Canonical 66-book catalog and deterministic audit

**Files:**
- Create: `frontend/src/bible-journey/catalog.ts`
- Create: `frontend/scripts/test-bible-journey.ts`
- Modify: `frontend/package.json`
- Modify: `.github/workflows/quality-gate.yml`

**Interfaces:**
- Produces: `BIBLE_JOURNEY_BOOKS`, `getJourneyBook(id)`, `getNextJourneyBook(id)`, `isBookFree(id)`.
- Book records include stable id, canonical index, name, testament, chapter count, theme, icon, and access tier.

- [ ] Write a test requiring exactly 66 unique books in canonical order, exact chapter totals, Genesis/Exodus/Leviticus free, Numbers-Revelation Premium, and valid next-book links.
- [ ] Run the test and verify failure because the catalog does not exist.
- [ ] Implement the static canonical catalog and helpers.
- [ ] Run `yarn test:bible-journey` and verify the catalog checks pass.
- [ ] Commit.

### Task 2: Versioned journey progress and Genesis adapter

**Files:**
- Create: `frontend/src/bible-journey/progress.ts`
- Extend: `frontend/scripts/test-bible-journey.ts`
- Modify: `frontend/app/season-victory.tsx`

**Interfaces:**
- Produces: `loadBibleJourneyProgress(profileId)`, `recordBookTrialResult(...)`, `completeJourneyBook(...)`, `syncGenesisJourneyCompletion(...)`, `getSequentialBookId(progress)`.
- Storage key: `scripture_games_bible_journey_v1_<profileId>`.

- [ ] Add tests for fresh state, corrupt-state fallback, idempotent completion, replay score improvement without duplicate completion, free-select completion not skipping the sequential marker, and Genesis sync idempotency.
- [ ] Verify tests fail against the missing module.
- [ ] Implement serialized AsyncStorage updates and schema normalization.
- [ ] Add a non-destructive Genesis completion sync to the Victory Hall.
- [ ] Run the journey tests.
- [ ] Commit.

### Task 3: Offline reusable book-season content engine

**Files:**
- Create: `frontend/src/bible-journey/questions.ts`
- Extend: `frontend/scripts/test-bible-journey.ts`

**Interfaces:**
- Produces: `buildBookTrials(book, catalogBook)` returning five deterministic trials with five four-option questions each.
- Questions remain inside the selected book and expose `reference`, `excerpt`, `options`, `answer`, and `explanation`.

- [ ] Add fixture tests for multi-chapter, short, and one-chapter books.
- [ ] Require stable output, unique options, valid answer indexes, references inside the selected book, and no network/runtime generation dependency.
- [ ] Implement deterministic chapter/verse sampling with verse-reference and chapter-location challenge types.
- [ ] Run tests.
- [ ] Commit.

### Task 4: Journey dashboard and 66-book library

**Files:**
- Create: `frontend/src/components/journey/BibleJourneySummary.tsx`
- Create: `frontend/app/book-library.tsx`
- Modify: `frontend/app/(tabs)/journey.tsx`

**Interfaces:**
- Dashboard adds `Continue Bible Journey` and `Choose Any Book` without removing the existing Genesis map.
- Library supports search, Old/New Testament grouping, Free/Premium labels, Not Started/In Progress/Completed state, and locked-book routing to Premium.

- [ ] Add static runtime-audit requirements for the new routes and 66-book library imports.
- [ ] Insert the additive summary above the existing Genesis season content.
- [ ] Implement the full library and entitlement-aware navigation.
- [ ] Verify Genesis map and existing route targets remain unchanged.
- [ ] Commit.

### Task 5: Reusable season, trial, and victory routes

**Files:**
- Create: `frontend/app/book-season.tsx`
- Create: `frontend/app/book-trial.tsx`
- Create: `frontend/app/book-victory.tsx`
- Modify: `frontend/app/season-victory.tsx`

**Interfaces:**
- Route parameters use `bookId` and `trial`.
- Genesis routes remain the existing routes.
- Generic books use five trials and preserve per-book best results.

- [ ] Add route-audit assertions and invalid-param fallback requirements.
- [ ] Implement book introduction/map with sequential trial unlocking.
- [ ] Implement deterministic questions, immediate feedback, safe saves, replays, and Faith Rhythm recording.
- [ ] Implement completion records and Continue/Choose/Replay actions.
- [ ] Add Genesis Victory Hall actions for Exodus and the library without deleting existing actions.
- [ ] Run route and journey audits.
- [ ] Commit.

### Task 6: Premium entitlement boundary

**Files:**
- Create: `frontend/src/premium-entitlement.tsx`
- Modify: `frontend/app/_layout.tsx`
- Replace: `frontend/app/premium.tsx`
- Extend: `frontend/scripts/test-bible-journey.ts`

**Interfaces:**
- Produces: `usePremiumEntitlement()` with `hasPremium`, `status`, `purchase()`, and `restore()`.
- Product id: `com.willywill.scripturegames.premium`.
- Production never grants entitlement without a validated store record.

- [ ] Add tests proving Books 1-3 remain playable without Premium and Books 4-66 reject access.
- [ ] Implement cached entitlement reads, safe unavailable-store behavior, and a provider boundary ready for native StoreKit/Play Billing integration.
- [ ] Implement an honest purchase screen with product id, feature list, Restore control, and explicit unavailable/configuration states; do not simulate success.
- [ ] Keep prior progress visible while locked.
- [ ] Run tests and TypeScript.
- [ ] Commit.

### Task 7: Fifty original peaceful scene presets

**Files:**
- Create: `frontend/src/backgrounds/peaceful-scenes.ts`
- Create: `frontend/src/components/premium/PeacefulBackdrop.tsx`
- Create: `frontend/app/background-picker.tsx`
- Modify: `frontend/src/preferences-context.tsx`
- Modify: `frontend/app/(tabs)/preferences.tsx`
- Extend: `frontend/scripts/test-bible-journey.ts`

**Interfaces:**
- Produces 50 unique original procedural scene presets with categories, Free/Premium tier, gradient palette, silhouette type, overlay, and accessibility label.
- Default scene id: `cross-on-the-hill`.
- Preferences add `backgroundId`, `backgroundRotationEnabled`, and `favoriteBackgroundIds`.

- [ ] Add tests for exactly 50 unique scene ids, at least 10 Free scenes, default Free cross scene, valid categories, safe overlay range, and preference migration.
- [ ] Implement original gradients/silhouettes for cross hill, Bethlehem, Jerusalem, shepherd fields, olive groves, desert, mountains, beaches, lakes, rivers, waterfalls, forests, gardens, clouds, and sanctuary scenes.
- [ ] Implement picker preview, favorites, rotation toggle, Free/Premium labels, and reset.
- [ ] Apply PeacefulBackdrop to new Journey/Library/Premium/Settings surfaces while leaving Genesis trial art locked.
- [ ] Run tests and visual audit.
- [ ] Commit.

### Task 8: Gamified Mastery feedback and healthy Faith Rhythm

**Files:**
- Create: `frontend/src/components/premium/MasteryAnswerFeedback.tsx`
- Create: `frontend/src/hooks/use-motion-intensity.ts`
- Modify: `frontend/src/hooks/use-reduced-motion.ts`
- Modify: `frontend/src/preferences-context.tsx`
- Modify: `frontend/app/(tabs)/preferences.tsx`
- Modify: `frontend/app/book-trial.tsx`
- Modify: `frontend/app/genesis-quiz.tsx`
- Extend: `frontend/scripts/test-bible-journey.ts`

**Interfaces:**
- Motion intensity resolves to `full`, `gentle`, or `off` while respecting system Reduce Motion.
- Feedback never changes correctness or reward values.

- [ ] Add tests for intensity resolution, one-shot celebration keys, same-day Faith Rhythm idempotency, and forbidden guilt-copy scan.
- [ ] Implement local correct glow/pop/ripple and restrained incorrect shake.
- [ ] Keep explanations visible immediately and decorative motion non-blocking.
- [ ] Record qualifying trial completion through the existing daily-rhythm storage authority.
- [ ] Update user-facing copy to `Faith Rhythm` while preserving saved streak data.
- [ ] Run tests.
- [ ] Commit.

### Task 9: Four-pass inside-and-out verification

**Files:**
- Create: `frontend/scripts/audit-bible-journey.mjs`
- Modify: `frontend/package.json`
- Modify: `.github/workflows/quality-gate.yml`
- Create: `FULL_APP_4X_BIBLE_JOURNEY_REPORT_20260801.md`

**Interfaces:**
- Produces `yarn audit:journey` and a source-level release report.

- [ ] Pass 1 — data and behavior: journey tests, progress migration, entitlement gating, scene metadata, motion, Faith Rhythm.
- [ ] Pass 2 — links and navigation: every literal route target, invalid-param fallback, Back controls, Genesis continuation, Premium and background-picker links.
- [ ] Pass 3 — existing product regression: Bible, cloud, premium-faith, Lumi, Lumi voice, navigation, runtime, content, and visual audits.
- [ ] Pass 4 — build quality: Expo Doctor, TypeScript, ESLint, iOS offline export, Android offline export, generated bundle inspection, and no EAS trigger-file change.
- [ ] Document every command/result and remaining physical-device/store-sandbox gates honestly.
- [ ] Open a draft PR; merge only when CI is green and no release trigger changed.
- [ ] Do not authorize an EAS build from this plan.
