# Scripture Games Build 15 — Piano, Premium Boundary, and Quiz Background Design

Date: 2026-08-01
Status: Approved
Branch: `fix/build-15-piano-premium-boundary`
Base: delivered Build 14 source

## Purpose

Build 15 corrects three physical-device findings without changing Scripture Games gameplay:

1. Ambient piano does not begin even though tap/success/error effects work.
2. Local TestFlight profiles can incorrectly appear Premium and unlock all 66 Journey books.
3. Ordinary quiz screens still use a fixed Genesis image instead of the player’s selected peaceful photograph.

The release remains source-only until the user separately authorizes an iOS build and TestFlight upload.

## Locked Product Rules

### Free Journey books

The free Journey set is exactly:

- Genesis
- Exodus
- Leviticus
- Matthew

Matthew provides a complete New Testament sample. Every other Journey book requires a validated Premium entitlement. Completing free books, chapters, trials, quizzes, or Home-page activities never unlocks Premium books.

The complete offline Bible reader remains free for all 66 books; Premium gates only the gamified Journey seasons and Premium atmosphere content.

### Premium truth source

`PremiumEntitlementProvider` remains the sole UI authority for Journey access. A profile field may represent a validated entitlement only after real store/receipt validation exists.

Build 15 must remove the local TestFlight beta behavior that creates profiles with `is_premium: true`.

Existing local profiles created by that beta behavior must be normalized safely:

- preserve profile ID, name, avatar, mode, XP, streak, badges, completed nodes, Journey progress, settings, and chat history;
- remove false beta Premium only when no durable validated-entitlement marker exists;
- do not invent a purchase, receipt, expiration, or restoration result;
- keep the migration idempotent.

Because native Apple/Google billing is not yet installed, no current local profile can be treated as store-validated merely because the legacy Boolean is true.

### Journey versus Home

Home remains the dashboard for quick games, Bible reader, Lumi, devotionals, daily challenges, and shortcuts.

Journey remains a separate book-by-book mastery path with its own per-book progress, trials, seals, sequential path, Choose Any Book library, and Premium access rules.

The tutorial and Premium copy should explain this distinction clearly.

## Ambient Piano Design

### Root cause

The piano file is longer than the feedback cues. The provider replaces the player source and immediately attempts playback before the piano player reports that the source is loaded. Short feedback sounds work because users trigger them later, after loading completes.

### Correct behavior

- Keep the existing shared audio session and `playsInSilentMode: true` behavior.
- Observe the piano player’s real load status using the supported `expo-audio` status hook/event.
- Mark ambient music ready only after the piano source reports loaded.
- Start or resume piano when all conditions are true:
  - app state is active;
  - Music is enabled;
  - audio session is active;
  - piano source is loaded.
- Keep loop and low volume behavior.
- Pause on background and resume on foreground.
- Lumi listening/speaking may pause ambient music and must resume it through the same loaded-state gate.
- SFX remain independent and unchanged.
- Audio errors remain non-fatal and never block gameplay or navigation.

## Ordinary Quiz Background Design

### Scope

The selected peaceful photo must appear in all ordinary quiz states:

- quiz loading/error;
- active question;
- answer feedback;
- completion/results;
- replay.

`frontend/app/quiz-play.tsx` must no longer hard-code the Genesis Trial 9 image.

### Readability treatment

- Use the shared selected-photo path through `CinematicBackdrop`/`PeacefulBackdrop`.
- Use a controlled darker photo scrim behind content.
- Make question, answer, feedback, and results panels slightly lighter and warmer using the existing parchment/glass visual system.
- Preserve accessible contrast and existing semantic success/error colors.
- Do not introduce a second unrelated color theme.

### Protected Genesis experience

These retain their approved artwork and behavior:

- Genesis tournament map;
- Genesis trials;
- Genesis quiz;
- Genesis Victory Hall.

No Genesis questions, answer keys, trial order, Manna, XP, ranks, factions, scoring, rewards, or storage rules may change.

## Data Migration

The local database reader will normalize legacy profile records before exposing them to the app.

Migration requirements:

- defaults missing `is_premium` to false;
- converts legacy beta-created `is_premium: true` to false while billing is not connected;
- preserves all unrelated fields;
- writes the normalized database back once when necessary;
- produces the same result when run repeatedly;
- does not reset Journey progress or app preferences.

A future real entitlement implementation must use a separate durable validation record rather than reviving the ambiguous legacy Boolean by itself.

## Copy Updates

Premium and library copy must consistently state:

- “Genesis, Exodus, Leviticus, and Matthew are free.”
- “Premium opens the remaining 62 Journey books.”
- “All 66 books remain available in the free Bible reader.”

Remove stale phrases such as “first three books,” “Books 4–66,” or “Numbers through Revelation” when they describe the new Premium boundary.

## Testing Strategy

### Build 15 regression contract

The test must fail before implementation and require:

- free IDs exactly `GEN`, `EXO`, `LEV`, `MAT`;
- Numbers, Mark, and Revelation Premium without entitlement;
- progress never bypasses access;
- local profile creation defaults Premium to false;
- legacy beta Premium normalization is idempotent and preserves progress;
- piano start is gated by actual loaded status;
- ordinary quiz source contains no fixed Genesis background;
- ordinary quiz uses selected peaceful background in loading, question, and result states;
- Genesis-specific screens retain explicit source preservation.

### Full regression gate

After the focused contract passes, run:

- complete Bible generation/audit;
- cloud and Premium audits;
- Lumi engine and microphone tests;
- Back-navigation test;
- Complete Bible Journey tests/audit;
- Build 13 and Build 14 contracts;
- runtime/link audit;
- content/privacy/remote-asset audit;
- visual audit;
- Expo Doctor;
- TypeScript;
- ESLint;
- offline iOS export;
- offline Android export.

## Release Boundary

This design does not authorize:

- EAS build;
- TestFlight submission;
- Android cloud build;
- App Review/public release;
- fake local purchase success;
- billing product creation;
- receipt-validation shortcut.

A separate explicit user authorization is required after source verification.

## Acceptance Criteria

Build 15 source is ready only when:

1. Piano starts on a physical iPhone after its source loads, including with the silent switch enabled.
2. SFX continue working.
3. New profiles are not Premium by default.
4. Tracy’s legacy false Premium state is normalized without losing progress.
5. Exactly Genesis, Exodus, Leviticus, and Matthew are free Journey books.
6. The remaining 62 Journey books display and enforce Premium Required.
7. Ordinary quizzes use the selected peaceful photo in every state.
8. Quiz panels remain readable with a lighter warm glass/parchment treatment.
9. Genesis tournament artwork and gameplay remain unchanged.
10. All focused and full regression gates pass.
11. No release trigger exists on the branch.
