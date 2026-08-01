# Scripture Games Stability and Premium Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the physical-device navigation and microphone crashes, expose predictable navigation controls, and add safe user-controlled music, sound, haptics, motion, Settings, Back navigation, and sacred headers.

**Architecture:** Add a test-first runtime-integrity audit and isolate native speech/audio coordination behind small modules. Keep route and preference behavior declarative, reuse the existing PreferencesProvider, and reject unsafe native configuration in CI before EAS.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, TypeScript 5.9, expo-speech-recognition 3.1.3, expo-audio ~1.1.1, expo-haptics 15.0.8, GitHub Actions.

## Global Constraints

- Do not trigger EAS while this plan is being implemented.
- Keep typed Lumi chat functional when microphone support fails or is denied.
- Keep all Bible content and personal data available offline.
- Music, sound effects, haptics, and full motion must each be independently disableable.
- Do not request background-audio entitlement.
- Do not persist microphone recordings.
- Android EAS remains skipped.
- Every production change follows red-green verification.

---

### Task 1: Runtime integrity audit

**Files:**
- Create: `frontend/scripts/audit-runtime-stability.mjs`
- Modify: `frontend/package.json`
- Modify: `.github/workflows/quality-gate.yml`

**Interfaces:**
- Produces: `yarn audit:runtime`, a zero-dependency Node audit that scans the app route tree and critical native integration files.

- [ ] Write the audit to fail when: Settings is not a visible tab; literal route targets do not map to files; the companion contains `iosCategory` or `iosVoiceProcessingEnabled`; native speech start lacks a guarded helper; required preference fields are absent; shared Back fallback and DoveMark are absent.
- [ ] Add `audit:runtime` to package scripts and quality gate before Expo Doctor.
- [ ] Run the PR gate and verify failure reports the current known defects.
- [ ] Commit the red test boundary.

### Task 2: Safe speech state machine

**Files:**
- Create: `frontend/src/lumi-voice.ts`
- Create: `frontend/scripts/test-lumi-voice.ts`
- Modify: `frontend/app/(tabs)/companion.tsx`
- Modify: `frontend/package.json`
- Modify: `.github/workflows/quality-gate.yml`

**Interfaces:**
- Produces: `startLumiListening(options): Promise<VoiceStartResult>`, `stopLumiListening(): void`, `abortLumiListening(): void`, `isLumiListening(): boolean`.
- Consumes: audio coordinator pause/resume hooks supplied in Task 4; until then optional callbacks default to no-op.

- [ ] Write tests for unavailable recognizer, denied permission, synchronous native start failure, double-tap suppression, stop/abort safety, and audio restoration after end/error.
- [ ] Verify tests fail against the missing helper.
- [ ] Implement the helper using only stable recognition options: language, interim results, continuous false, punctuation, alternatives, contextual strings, and dictation hint. Do not pass iOS category or voice processing overrides.
- [ ] Replace direct native calls in Companion with the helper and visible nonfatal errors.
- [ ] Verify tests and runtime audit pass this section.
- [ ] Commit.

### Task 3: Route, Settings, and Back repair

**Files:**
- Modify: `frontend/app/(tabs)/_layout.tsx`
- Modify: `frontend/src/components/premium/ScreenHeader.tsx`
- Modify: all user-facing non-tab route files reported by `audit:runtime`
- Create: `frontend/src/navigation-fallback.ts`
- Create: `frontend/scripts/test-navigation-fallback.ts`

**Interfaces:**
- Produces: `goBackOrHome(router)` which calls `router.back()` when history exists and `router.replace('/(tabs)/command')` otherwise.

- [ ] Write failing tests for Back-with-history and Back-without-history.
- [ ] Add visible Settings tab and preserve five primary destinations by moving Settings into the tab set and keeping less-used routes hidden.
- [ ] Update shared ScreenHeader Back to use `goBackOrHome`.
- [ ] Add `back` to every user-facing non-tab screen reported by the route audit, excluding entry/onboarding/faction selection and completion screens whose own CTA is the intended exit.
- [ ] Run route audit and navigation tests until all literal targets and Back coverage pass.
- [ ] Commit.

### Task 4: Audio coordinator and preference migration

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/yarn.lock`
- Create: `frontend/src/audio-coordinator.tsx`
- Modify: `frontend/src/preferences-context.tsx`
- Modify: `frontend/src/sfx.ts`
- Modify: `frontend/app/_layout.tsx`
- Modify: `frontend/app/settings.tsx`
- Create: `frontend/scripts/test-preference-migration.ts`
- Add assets: `frontend/assets/audio/soft-piano.m4a`, `tap.m4a`, `success.m4a`, `error.m4a`

**Interfaces:**
- Preferences adds `musicEnabled: boolean` and `soundEffectsEnabled: boolean`.
- Audio context provides `pauseForVoice()`, `resumeAfterVoice()`, `playFeedback(kind)`, and `setAppActive(active)`.

- [ ] Write migration tests proving old stored preferences load safely with music/SFX disabled and new preferences persist independently.
- [ ] Add exact SDK-54 `expo-audio` dependency and frozen lockfile.
- [ ] Generate local low-volume audio assets with no copyrighted recording.
- [ ] Implement AudioProvider with foreground-only looping piano, independent music/SFX controls, and guaranteed pause during voice recognition.
- [ ] Extend Settings with Music and Sound Effects toggles while retaining Haptics and Motion.
- [ ] Route existing `sfx` calls through optional audio feedback plus existing haptics.
- [ ] Verify audio failures never throw into UI code.
- [ ] Commit.

### Task 5: Motion Off and sacred header system

**Files:**
- Create: `frontend/src/components/premium/DoveMark.tsx`
- Modify: `frontend/src/components/premium/ScreenHeader.tsx`
- Modify: custom tab headers reported by runtime audit
- Modify: `frontend/app/settings.tsx`
- Modify: `frontend/src/hooks/use-reduced-motion.ts`

**Interfaces:**
- DoveMark accepts `size?: number` and `label?: string` and is noninteractive by default.
- Existing `motionMode: 'reduced'` becomes user-facing copy “Motion Off / Reduced”.

- [ ] Add audit assertions for DoveMark in shared headers and explicit Motion Off copy in Settings.
- [ ] Implement static DoveMark with no animation requirement.
- [ ] Ensure reduced mode disables entrance/drift/press-scale effects while preserving state changes and screen usability.
- [ ] Add the mark to custom primary headers that bypass ScreenHeader.
- [ ] Run visual, accessibility-oriented runtime, TypeScript, and lint gates.
- [ ] Commit.

### Task 6: Four-pass full-app verification

**Files:**
- Create: `FULL_APP_4X_STABILITY_REPORT_20260731.md`
- Modify: `TESTFLIGHT_READINESS.md`

**Interfaces:**
- Produces a signed source-level release record with exact commit and remaining physical-device checks.

- [ ] Pass 1: `yarn audit:runtime`, Lumi engine, Lumi voice, navigation, and preference migration tests.
- [ ] Pass 2: Bible, cloud, premium, content, and visual audits.
- [ ] Pass 3: Expo Doctor, TypeScript, ESLint, iOS export, Android export.
- [ ] Pass 4: inspect generated iOS config for microphone/speech/photo descriptions and verify no advanced speech audio-session overrides remain.
- [ ] Document exact results, known limitations, and physical-device matrix.
- [ ] Mark PR ready and merge only when every automated gate is green.
- [ ] Trigger one iOS-only EAS build only after merge and update the existing condition watcher to the new build number.
