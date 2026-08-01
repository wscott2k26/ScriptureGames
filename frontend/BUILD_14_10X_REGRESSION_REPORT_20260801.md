# Scripture Games Build 14 — Ten-Pass Regression Verification

Date: 2026-08-01

Verified application source: `634e6e1474a1ee42cb9973aa0d542727a3f6026a`

Successful full quality run: `30707524701`

## Physical-device findings from Build 13

1. Ambient piano and feedback sounds were silent.
2. The selected peaceful photograph persisted in preferences but was not used by most app screens.

## Root causes

- The app audio session explicitly set `playsInSilentMode: false`, which suppresses playback on a muted iPhone.
- Sound effects replayed players without first restoring the global audio session after Lumi voice activity or other deactivation.
- `CinematicBackdrop` always rendered its old local image source, so the saved peaceful background was visible only on screens already using `PeacefulBackdrop`.
- The tutorial contained one fixed `sceneId` override.

## Corrective implementation

- One `ensureAudioSession()` helper now sets playback mode, allows silent-mode playback, keeps background playback disabled, uses mixing behavior, and activates the audio subsystem.
- Ambient music, tap/success/error effects, Settings previews, app foreground restoration, and Lumi voice restoration all use the shared session path.
- `CinematicBackdrop` now follows the selected peaceful photograph by default.
- The approved Genesis tournament map, trials, quizzes, and Victory Hall explicitly use `preserveSource` so their gameplay artwork remains unchanged.
- The tutorial follows the selected global background.
- The permanent Build 14 regression test recursively rejects fixed `sceneId` overrides anywhere under `frontend/app`.

## Ten verification passes

### Pass 1 — Audio mode and silent switch

- `playsInSilentMode: true` is required by the Build 14 regression test.
- The former `playsInSilentMode: false` setting is forbidden.
- `setIsAudioActiveAsync(true)` is part of the shared activation helper.

Result: PASS.

### Pass 2 — Ambient piano initialization and lifecycle

- All bundled audio files are materialized locally.
- Piano remains looped at the existing low volume.
- Music defaults remain enabled.
- Music pauses outside the active app state and resumes through the shared session when the app becomes active.

Result: PASS.

### Pass 3 — Feedback sounds and Lumi restoration

- Tap, success, error, and Settings preview sounds reactivate the session before replay.
- Lumi can still pause audio safely while listening or speaking.
- Music resumes through the same session after Lumi voice activity.
- Existing Lumi engine and microphone crash-regression tests passed.

Result: PASS.

### Pass 4 — Background preference persistence

- The existing `backgroundId`, favorites, and rotation fields remain stored through the Preferences provider and AsyncStorage.
- No preference schema or storage key was changed.
- Background Premium access still uses the authoritative entitlement provider.

Result: PASS.

### Pass 5 — Global background rendering

- Ordinary screens using `CinematicBackdrop` now render `PeacefulBackdrop` underneath their existing readability overlays and effects.
- Home, Games, Bible, and Lumi are explicitly covered by the Build 14 contract.
- Existing Journey, Library, Settings, Premium, tutorial, and new book screens use the saved peaceful background system.

Result: PASS.

### Pass 6 — Fixed-override scan

- Every `.tsx` file under `frontend/app` is recursively scanned.
- Non-gameplay `sceneId=` overrides are forbidden.
- The one tutorial override was removed.

Result: PASS.

### Pass 7 — Genesis gameplay preservation

Only backdrop-selection flags changed in these files:

- `app/(tabs)/journey.tsx`
- `app/genesis-trial.tsx`
- `app/genesis-quiz.tsx`
- `app/season-victory.tsx`

Questions, answer keys, scoring, Manna, rank points, factions, choices, progress storage, trial order, rewards, and navigation logic were not rewritten.

Result: PASS.

### Pass 8 — Build 13 acceptance features

- Lumi typed composer regression contract passed.
- Premium access and labels passed.
- Tutorial routes and controls passed.
- Fifty unique real-photo sources, thumbnails, caching, and fallbacks passed.
- Complete Bible Journey tests passed.

Result: PASS.

### Pass 9 — Navigation, content, data, and visual integrity

- Complete Bible: 66 books, 1,189 chapters, 31,098 verses.
- Journey audit: 90 checks passed.
- Runtime audit: 41 routes and 107 literal navigation targets scanned.
- Release content audit: 1,475 checks passed, 0 failed.
- Visual audit: 264 passed, 0 failed.
- Cloud backup and Premium faith audits passed.

Result: PASS.

### Pass 10 — Toolchain and package verification

- Expo Doctor: 18/18 checks passed.
- TypeScript: passed.
- ESLint: passed.
- Offline iOS export: passed.
- Offline Android export: passed.

Result: PASS.

## Diff boundary

Compared with the exact Build 13 delivered source, the correction is limited to:

- audio session behavior;
- shared background rendering;
- one tutorial background override;
- explicit Genesis artwork-preservation flags;
- regression tests and CI wiring;
- this evidence report.

No backend, Bible content, question bank, player profile schema, progress database, billing implementation, or release-to-App-Review action changed.

## Authorized release boundary

The user authorized one careful iOS Build 14 and one TestFlight submission after this documented head passes the final full quality gate.

- iOS only.
- Exactly one production EAS build.
- Exactly one automatic TestFlight submission.
- No Android cloud build.
- No App Review or public release submission.
- Remove the one-use launcher and consumed trigger after verified delivery.
