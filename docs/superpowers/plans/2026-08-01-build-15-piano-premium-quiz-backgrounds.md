# Build 15 Piano, Premium Boundary, and Quiz Backgrounds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ambient piano start reliably after loading, remove false beta Premium unlocks, make Matthew the free New Testament Journey sample, and carry the selected peaceful photograph through ordinary quiz states without changing Genesis gameplay.

**Architecture:** Keep the existing providers and local-first storage. Add a pure entitlement-validation boundary, normalize legacy local profile records while reading the database, drive ambient playback from `expo-audio` player status rather than source assignment timing, and let ordinary quizzes use the shared peaceful backdrop while Genesis-specific routes retain explicit source preservation.

**Tech Stack:** Expo SDK 54, React Native 0.81, Expo Router 6, React 19, TypeScript 5.9, `expo-audio` 1.1, AsyncStorage 2.2, Node test scripts, GitHub Actions.

## Global Constraints

- Free Journey books are exactly Genesis, Exodus, Leviticus, and Matthew.
- The remaining 62 Journey books require a validated Premium entitlement.
- Completing content never bypasses Premium.
- The free Bible reader still includes all 66 books.
- Preserve all profile progress, Journey progress, settings, chats, XP, streaks, badges, and completed nodes during migration.
- Do not trust the legacy `is_premium` Boolean alone.
- Do not create fake purchase success, receipt, expiration, restore result, or entitlement.
- Ordinary quizzes follow the selected peaceful photograph in loading, question, feedback, and result states.
- Genesis tournament map, trials, Genesis quiz, and Victory Hall preserve their approved artwork and gameplay.
- No EAS build, TestFlight submission, Android cloud build, App Review submission, or public release is authorized.

---

## File Map

- `frontend/scripts/test-build15-piano-premium.ts` — focused Build 15 source/behavior contract.
- `frontend/src/premium-entitlement-core.ts` — pure validated-entitlement rules.
- `frontend/src/profile-context.tsx` — profile entitlement metadata type.
- `frontend/src/local-api.ts` — local profile creation and legacy beta normalization.
- `frontend/src/premium-entitlement.tsx` — UI provider consumes validated-entitlement helper.
- `frontend/src/bible-journey/catalog.ts` — canonical free/Premium book metadata.
- `frontend/src/audio-context.tsx` — player status and loaded-state ambient playback.
- `frontend/app/quiz-play.tsx` — ordinary quiz selected-photo rendering and readable panels.
- `frontend/app/premium.tsx` — four-free-book and 62-Premium-book copy.
- `frontend/app/book-library.tsx` — access labels/copy where required.
- `frontend/app/(tabs)/bible-journey.tsx` — Journey summary copy where required.
- `frontend/src/tutorial-core.ts` or `frontend/app/tutorial.tsx` — clarify Home versus Journey and free set where currently described.
- `frontend/package.json` — Build 15 test command and validation wiring.
- `.github/workflows/quality-gate.yml` — focused Build 15 CI step and branch coverage.
- `frontend/BUILD_15_REGRESSION_REPORT_20260801.md` — final evidence record.

---

### Task 1: Lock the Build 15 Red Contract

**Files:**
- Modify: `frontend/scripts/test-build15-piano-premium.ts`
- Modify: `frontend/package.json`
- Modify: `.github/workflows/quality-gate.yml`

**Interfaces:**
- Consumes: current source files as text plus `BIBLE_JOURNEY_BOOKS`.
- Produces: `yarn test:build15`, a deterministic focused regression command used by CI and EAS post-install validation.

- [ ] **Step 1: Extend the failing test with access, migration, piano, and quiz assertions**

Use assertions equivalent to:

```ts
const quiz = read('app/quiz-play.tsx');
assert.doesNotMatch(quiz, /GENESIS_BACKGROUNDS\['trial-09'\]/);
assert.match(quiz, /<CinematicBackdrop darkness=/);

const genesisQuiz = read('app/genesis-quiz.tsx');
assert.match(genesisQuiz, /preserveSource/);

assert.match(localApi, /normalizeLegacyPremiumProfile/);
assert.match(localApi, /premium_entitlement_source/);
assert.match(audio, /useAudioPlayerStatus/);
assert.match(audio, /pianoStatus\.isLoaded/);
```

Also assert:

```ts
assert.deepEqual(
  BIBLE_JOURNEY_BOOKS.filter((book) => book.access === 'free').map((book) => book.id),
  ['GEN', 'EXO', 'LEV', 'MAT'],
);
```

- [ ] **Step 2: Wire the focused command**

Add to `frontend/package.json`:

```json
"test:build15": "node --experimental-strip-types scripts/test-build15-piano-premium.ts"
```

Append `yarn test:build15` after `yarn test:build14` in both `eas-build-post-install` and `validate`.

- [ ] **Step 3: Add the CI step and branch filters**

Add `fix/build-15-piano-premium-boundary` to PR/push branch coverage and add:

```yaml
- name: Test Build 15 piano and Premium boundary
  working-directory: frontend
  run: yarn test:build15
```

- [ ] **Step 4: Run the focused test and verify RED**

Run:

```bash
cd frontend
yarn test:build15
```

Expected: FAIL for the current first-three-free catalog, beta `is_premium: true`, missing validated-entitlement fields/helper, missing `useAudioPlayerStatus`, and fixed Genesis background in `quiz-play.tsx`.

- [ ] **Step 5: Commit the red contract**

```bash
git add frontend/scripts/test-build15-piano-premium.ts frontend/package.json .github/workflows/quality-gate.yml
git commit -m "test: lock Build 15 piano and Premium regressions"
```

---

### Task 2: Establish an Honest Premium Entitlement Boundary

**Files:**
- Modify: `frontend/src/premium-entitlement-core.ts`
- Modify: `frontend/src/profile-context.tsx`
- Modify: `frontend/src/premium-entitlement.tsx`
- Modify: `frontend/src/local-api.ts`
- Test: `frontend/scripts/test-build15-piano-premium.ts`

**Interfaces:**
- Produces:

```ts
export type PremiumEntitlementSource = 'app-store' | 'play-store';

export type PremiumEntitlementClaim = {
  is_premium?: boolean;
  premium_entitlement_source?: PremiumEntitlementSource;
  premium_product_id?: string;
  premium_expires_at?: string;
};

export function hasValidatedPremiumEntitlement(
  profile: PremiumEntitlementClaim | null | undefined,
): boolean;
```

- `hasValidatedPremiumEntitlement` returns true only when `is_premium === true`, source is recognized, product ID equals `PREMIUM_PRODUCT_ID`, and an optional expiration is absent or in the future.

- [ ] **Step 1: Add pure failing behavior assertions**

Extend the focused test to import `hasValidatedPremiumEntitlement` and require:

```ts
assert.equal(hasValidatedPremiumEntitlement({ is_premium: true }), false);
assert.equal(hasValidatedPremiumEntitlement({
  is_premium: true,
  premium_entitlement_source: 'app-store',
  premium_product_id: PREMIUM_PRODUCT_ID,
}), true);
assert.equal(hasValidatedPremiumEntitlement({
  is_premium: true,
  premium_entitlement_source: 'app-store',
  premium_product_id: 'wrong.product',
}), false);
```

- [ ] **Step 2: Run the focused test and confirm the helper is missing**

```bash
cd frontend
yarn test:build15
```

Expected: FAIL because `hasValidatedPremiumEntitlement` and metadata fields do not exist.

- [ ] **Step 3: Implement the pure helper**

In `premium-entitlement-core.ts`:

```ts
export const PREMIUM_PRODUCT_ID = 'com.willywill.scripturegames.premium';
export type PremiumEntitlementSource = 'app-store' | 'play-store';

export type PremiumEntitlementClaim = {
  is_premium?: boolean;
  premium_entitlement_source?: PremiumEntitlementSource;
  premium_product_id?: string;
  premium_expires_at?: string;
};

export function hasValidatedPremiumEntitlement(
  profile: PremiumEntitlementClaim | null | undefined,
): boolean {
  if (!profile?.is_premium) return false;
  if (profile.premium_product_id !== PREMIUM_PRODUCT_ID) return false;
  if (profile.premium_entitlement_source !== 'app-store' && profile.premium_entitlement_source !== 'play-store') return false;
  if (!profile.premium_expires_at) return true;
  const expiresAt = Date.parse(profile.premium_expires_at);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
```

Keep `canAccessJourneyBook` using catalog access plus the validated Boolean supplied by the provider.

- [ ] **Step 4: Extend the Profile type**

Add optional fields in `profile-context.tsx` and the local API `Profile` type:

```ts
premium_entitlement_source?: 'app-store' | 'play-store';
premium_product_id?: string;
```

- [ ] **Step 5: Remove beta Premium from new profile creation**

Change local profile creation to:

```ts
is_premium: false,
```

Do not add entitlement source, product ID, expiration, or purchase metadata.

- [ ] **Step 6: Normalize legacy local profiles during database reads**

Add a pure function near `readDb`:

```ts
function normalizeLegacyPremiumProfile(profile: Profile): Profile {
  const validated = hasValidatedPremiumEntitlement(profile);
  if (validated) return profile;
  const {
    premium_entitlement_source: _source,
    premium_product_id: _product,
    premium_expires_at: _expires,
    ...rest
  } = profile;
  return { ...rest, is_premium: false };
}
```

In `readDb`, normalize every parsed profile and write the database back only when serialized profiles differ. Preserve every unrelated field and keep repeated reads idempotent.

- [ ] **Step 7: Make the provider use only the helper**

Replace:

```ts
const hasPremium = Boolean(profile?.is_premium);
```

with:

```ts
const hasPremium = hasValidatedPremiumEntitlement(profile);
```

- [ ] **Step 8: Run focused tests**

```bash
cd frontend
yarn test:build15
```

Expected: entitlement and profile-default checks PASS; catalog, audio, quiz, and stale-copy checks may still fail.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/premium-entitlement-core.ts frontend/src/profile-context.tsx frontend/src/premium-entitlement.tsx frontend/src/local-api.ts frontend/scripts/test-build15-piano-premium.ts
git commit -m "fix: remove false beta Premium entitlements"
```

---

### Task 3: Make Matthew the Free New Testament Journey Sample

**Files:**
- Modify: `frontend/src/bible-journey/catalog.ts`
- Modify: `frontend/app/premium.tsx`
- Modify: `frontend/app/book-library.tsx`
- Modify: `frontend/app/(tabs)/bible-journey.tsx`
- Modify: `frontend/src/tutorial-core.ts` or `frontend/app/tutorial.tsx`
- Test: `frontend/scripts/test-build15-piano-premium.ts`
- Test: existing Journey tests/audit

**Interfaces:**
- Produces: catalog metadata where free IDs are `GEN`, `EXO`, `LEV`, `MAT` and all other IDs are Premium.

- [ ] **Step 1: Change catalog access calculation explicitly**

Replace the positional `offset < 3` rule with an explicit set:

```ts
const FREE_JOURNEY_BOOK_IDS = new Set(['GEN', 'EXO', 'LEV', 'MAT']);

access: FREE_JOURNEY_BOOK_IDS.has(id) ? 'free' : 'premium',
```

Export `FREE_JOURNEY_BOOK_IDS` as a readonly value only if tests or UI need it; otherwise keep it private.

- [ ] **Step 2: Update Premium copy**

Use these exact product statements:

```ts
['Remaining 62 Journey Books', 'Genesis, Exodus, Leviticus, and Matthew remain free. Premium opens the other 62 book seasons.']
```

```ts
['Four Full Books', 'Genesis Tournament plus the complete Exodus, Leviticus, and Matthew trial seasons.']
```

Hero copy:

```text
Genesis, Exodus, Leviticus, and Matthew are free. Premium opens the remaining 62 Journey books, all mastery records, and the full peaceful background collection.
```

- [ ] **Step 3: Remove stale boundary wording throughout app source**

Search for:

```bash
rg -n "first three|Three Full Books|Books 4.?66|Numbers through Revelation|beyond the first three" frontend/app frontend/src
```

Replace only Journey/Premium-boundary wording. Do not change Bible-reader copy or Scripture content.

- [ ] **Step 4: Clarify Home versus Journey in tutorial copy**

Use concise descriptions:

```text
Home is your dashboard for quick games, Bible reading, Lumi, devotionals, and shortcuts.
```

```text
Journey is the separate book-by-book mastery path with trials, progress, seals, and Premium book seasons.
```

- [ ] **Step 5: Run focused and Journey tests**

```bash
cd frontend
yarn test:build15
yarn test:journey
yarn audit:journey
```

Expected: four-free-book assertions PASS; all access/deep-link tests enforce Premium for Numbers, Mark, and Revelation.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/bible-journey/catalog.ts frontend/app/premium.tsx frontend/app/book-library.tsx frontend/app/'(tabs)'/bible-journey.tsx frontend/src/tutorial-core.ts frontend/app/tutorial.tsx
git commit -m "feat: add Matthew to the free Journey sample"
```

---

### Task 4: Start Ambient Piano Only After It Is Loaded

**Files:**
- Modify: `frontend/src/audio-context.tsx`
- Test: `frontend/scripts/test-build15-piano-premium.ts`
- Test: `frontend/scripts/test-build14-global-experience.ts`

**Interfaces:**
- Consumes: `useAudioPlayer`, `useAudioPlayerStatus`, existing `ensureAudioSession`, app state, and Music preference.
- Produces: a loaded-state-gated ambient player; SFX API remains unchanged.

- [ ] **Step 1: Confirm the installed status hook signature**

Use the Expo Audio SDK 54 type definitions already installed. The implementation should import:

```ts
import {
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  type AudioPlayer,
} from 'expo-audio';
```

- [ ] **Step 2: Add piano status and gate readiness**

After creating the piano player:

```ts
const piano = useAudioPlayer(null);
const pianoStatus = useAudioPlayerStatus(piano);
```

Do not treat source replacement as proof of piano readiness.

- [ ] **Step 3: Separate file materialization from ambient readiness**

Keep SFX players ready after files are materialized, but let piano playback wait on `pianoStatus.isLoaded`.

Set source/loop/volume once as today. Keep `ready` available for SFX; add a `pianoLoadedRef` or derive directly from status for ambient playback.

- [ ] **Step 4: Update resume logic**

Use a status-aware guard:

```ts
const resumeMusic = useCallback(async () => {
  if (!readyRef.current || !pianoStatus.isLoaded || !musicEnabledRef.current || appState.current !== 'active') return;
  try {
    await ensureAudioSession();
    piano.play();
  } catch {
    // Ambient music is optional and never blocks the app.
  }
}, [piano, pianoStatus.isLoaded]);
```

- [ ] **Step 5: Trigger resume when loading completes**

The existing Music preference effect must depend on `pianoStatus.isLoaded` through `resumeMusic`, so a status transition from unloaded to loaded causes the piano to start without requiring a settings toggle or app restart.

- [ ] **Step 6: Preserve pause/resume and Lumi behavior**

Keep:

- pause when app leaves active state;
- resume when active;
- pause for Lumi voice;
- resume after Lumi voice;
- SFX session reactivation;
- silent-switch playback.

- [ ] **Step 7: Run focused, Build 14, type, and lint checks**

```bash
cd frontend
yarn test:build15
yarn test:build14
yarn typecheck
yarn lint
```

Expected: piano load assertions PASS; Build 14 SFX/session/background contract remains green.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/audio-context.tsx frontend/scripts/test-build15-piano-premium.ts
git commit -m "fix: start ambient piano after player load"
```

---

### Task 5: Carry the Selected Photo Through Ordinary Quizzes

**Files:**
- Modify: `frontend/app/quiz-play.tsx`
- Modify only if needed: `frontend/src/components/premium/GlassPanel.tsx`
- Test: `frontend/scripts/test-build15-piano-premium.ts`
- Test: visual/runtime audits

**Interfaces:**
- Consumes: `CinematicBackdrop` default selected-photo behavior.
- Produces: ordinary quiz states with one consistent selected-photo background and warmer readable panels.

- [ ] **Step 1: Remove the fixed Genesis dependency from ordinary quiz**

Delete:

```ts
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
```

Replace all three ordinary quiz wrappers:

```tsx
<CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-09']} darkness={...}>
```

with selected-photo wrappers:

```tsx
<CinematicBackdrop darkness={0.58}>
```

Use approximately `0.62` for active questions/loading and `0.52` for results if contrast testing supports it.

- [ ] **Step 2: Apply a lighter warm panel treatment locally**

Do not redesign global `GlassPanel` unless necessary. Prefer local style overrides on quiz cards:

```ts
questionCard: {
  borderRadius: radii.xl,
  minHeight: 150,
  padding: spacing.xl,
  justifyContent: 'center',
  backgroundColor: 'rgba(45, 36, 28, 0.78)',
  borderColor: 'rgba(255, 224, 166, 0.28)',
},
```

Use the existing text colors and semantic correct/error borders. Keep answer buttons tactile and readable.

- [ ] **Step 3: Keep all quiz states on the same background source**

Verify loading/error, active question, feedback, results, and replay route all use `CinematicBackdrop` without a fixed source or `preserveSource`.

- [ ] **Step 4: Preserve Genesis quiz explicitly**

Do not modify `frontend/app/genesis-quiz.tsx` except to verify its existing `preserveSource` remains present.

- [ ] **Step 5: Run focused and visual/navigation checks**

```bash
cd frontend
yarn test:build15
yarn test:navigation
yarn audit:runtime
yarn audit:visual
yarn typecheck
yarn lint
```

Expected: no fixed Trial 9 source in ordinary quiz, Genesis preservation remains, and visual/runtime audits pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/quiz-play.tsx frontend/scripts/test-build15-piano-premium.ts
git commit -m "fix: use selected backgrounds in ordinary quizzes"
```

---

### Task 6: Full Regression Verification and Evidence

**Files:**
- Create: `frontend/BUILD_15_REGRESSION_REPORT_20260801.md`
- Modify: PR #46 description only after evidence exists.

**Interfaces:**
- Consumes: completed Tasks 1–5.
- Produces: auditable source-ready status with no release trigger.

- [ ] **Step 1: Run the complete validation command**

```bash
cd frontend
yarn validate
```

Expected: PASS for Bible generation/audit, cloud, Premium, Lumi, voice, navigation, Journey, Build 13, Build 14, Build 15, runtime, content, visual, Expo Doctor, TypeScript, ESLint, iOS export, and Android export.

- [ ] **Step 2: Run targeted source searches**

```bash
rg -n "TestFlight beta ships with all content unlocked|is_premium:\s*true|first three|Three Full Books|Books 4.?66|Numbers through Revelation" frontend/src frontend/app
rg -n "GENESIS_BACKGROUNDS\['trial-09'\]" frontend/app/quiz-play.tsx
rg -n "preserveSource" frontend/app/genesis-quiz.tsx frontend/app/genesis-trial.tsx frontend/app/'(tabs)'/journey.tsx frontend/app/season-victory.tsx
```

Expected:

- no beta unlock default;
- no stale three-book Premium boundary copy;
- no fixed Genesis background in ordinary quiz;
- protected Genesis screens still preserve source.

- [ ] **Step 3: Review the branch diff against Build 14**

```bash
git diff --stat fix/build-14-global-audio-backgrounds...HEAD
git diff fix/build-14-global-audio-backgrounds...HEAD -- frontend/src/audio-context.tsx frontend/src/local-api.ts frontend/src/premium-entitlement-core.ts frontend/src/premium-entitlement.tsx frontend/src/bible-journey/catalog.ts frontend/app/quiz-play.tsx
```

Confirm no question bank, scoring, Manna, rank, faction, Genesis answer key, or release workflow changes.

- [ ] **Step 4: Write the evidence report**

Record:

- root causes;
- migration behavior;
- exact free IDs;
- piano loaded-state behavior;
- ordinary quiz background behavior;
- protected Genesis files;
- quality run ID and step results;
- changed-file inventory;
- explicit statement that no EAS/TestFlight trigger exists.

- [ ] **Step 5: Commit the evidence report**

```bash
git add frontend/BUILD_15_REGRESSION_REPORT_20260801.md
git commit -m "docs: record Build 15 regression verification"
```

- [ ] **Step 6: Run one final complete validation from the evidence commit**

```bash
cd frontend
yarn validate
```

Expected: PASS again from the exact documented head.

- [ ] **Step 7: Update draft PR #46**

Document the source commit, green run ID, migration rules, free-book set, piano fix, quiz visuals, and remaining physical-device gate. Keep the PR draft and unmerged.

- [ ] **Step 8: Verify release safety**

List changed files and confirm none match:

```text
.github/workflows/*build*
.github/workflows/*testflight*
.github/release-triggers/**
.github/status-triggers/**
```

Do not create or run a release workflow without a new explicit user authorization.

### Approved Addendum: Post-answer Bible Reference Flow

**Files:**
- Modify: `frontend/app/quiz-play.tsx`
- Modify: `frontend/app/(tabs)/bible.tsx`
- Test: `frontend/scripts/test-build15-piano-premium.ts`

- [ ] Require the exact source reference and `Open in Bible` only after grading.
- [ ] Push `/(tabs)/bible` with `reference` and `fromQuiz=1` route parameters.
- [ ] Resolve the requested reference through the existing offline parser.
- [ ] Show `Return to Quiz` in the Bible header and use stack back navigation.
- [ ] Verify quiz state is not reset, submitted, or advanced by the lookup action.
