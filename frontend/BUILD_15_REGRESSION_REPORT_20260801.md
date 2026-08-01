# Scripture Games Build 15 Regression Report

Date: August 1, 2026
Branch: `fix/build-15-piano-premium-boundary`
Draft PR: #46
Verified product commit: `b9553a52a297f86d728ebcac58c3951f68ee72f7`
GitHub Actions run: `30710500402`
Result: **SOURCE VERIFICATION PASS**

## Approved Scope Delivered

### Ambient piano

- Ambient piano observes the real `expo-audio` player status.
- Playback starts or resumes only after `pianoStatus.isLoaded` is true.
- App-active state, Music preference, audio-session activation, looping, low volume, foreground resume, and Lumi pause/resume remain enforced.
- Tap, correct, wrong, success, and preview sound effects remain independent and unchanged.
- Audio errors remain optional and non-fatal.

### Honest Premium boundary

- New local profiles start with `is_premium: false`.
- The leftover TestFlight beta default that unlocked all 66 Journey books was removed.
- A legacy Boolean alone cannot grant Premium.
- Premium requires a recognized App Store or Play Store entitlement source, the exact product ID `com.willywill.scripturegames.premium`, and a valid optional expiration.
- Legacy unvalidated Premium flags are normalized during database reads.
- The migration is repeatable and preserves player ID, name, avatar, mode, XP, streak, completed nodes, badges, Journey progress, preferences, and chat history.
- No purchase, receipt, expiration, restoration, or fake local entitlement is invented.

### Free Journey books

The free gamified Journey set is exactly:

1. Genesis
2. Exodus
3. Leviticus
4. Matthew

The remaining 62 Journey books require validated Premium. Progress, chapter completion, trial completion, and Home-page activity cannot bypass Premium. The complete 66-book offline Bible reader remains free.

### Ordinary quiz presentation

- Loading, question, feedback, and result states use the selected peaceful photograph through the shared global backdrop.
- The old fixed Genesis Trial 9 quiz image was removed from ordinary quizzes.
- Question, feedback, loading, and result cards use a lighter warm parchment treatment with dark readable text.
- Genesis tournament screens continue to use their explicit protected artwork.

### Post-answer Bible reference

- Scripture lookup appears only after an answer is graded.
- The feedback panel shows the exact question source and an **Open in Bible** action.
- The Bible tab resolves the requested reference using the bundled offline Bible parser.
- **Return to Quiz** uses stack-back navigation, preserving the active question, selected answer, feedback, score, and topic.
- Looking up Scripture does not submit, change, or advance the quiz answer.

### Home and Journey clarity

- Home is described as the dashboard for quick games, Bible reading, Lumi, devotionals, and shortcuts.
- Journey is described as the separate book-by-book mastery path with trials, progress, seals, and Premium seasons.

## Verification Evidence

GitHub Actions run `30710500402` passed every required step:

- frozen dependency installation
- complete World English Bible generation
- 66-book / 1,189-chapter / 31,098-verse Bible audit
- optional cloud-backup audit
- Premium faith and Lumi voice audit
- Lumi response-engine tests
- Lumi microphone crash-regression tests
- Back-navigation fallback test
- complete Bible Journey catalog, progress, storage, question, route, Premium, scene, motion, and mastery tests
- Build 13 acceptance regression contract
- Build 14 global audio/background regression contract
- Build 15 piano, entitlement, four-free-book, quiz-background, and Bible-reference contract
- dedicated Bible Journey audit: 90 checks passed
- runtime/navigation audit: 41 routes and 108 literal navigation targets
- content/configuration/privacy audit: 1,475 checks passed, 0 failed
- visual audit: 264 checks passed, 0 failed
- Expo Doctor: 18/18 checks passed
- TypeScript
- ESLint
- offline iOS export
- offline Android export

## Protected Areas

No Genesis gameplay source file was modified. Genesis questions, answer keys, trial order, Manna, ranks, factions, scoring, rewards, storage rules, map artwork, trial artwork, Genesis quiz artwork, and Victory Hall remain protected.

The changed-file set contains no EAS build workflow, TestFlight uploader, Android cloud-build launcher, App Review action, or release trigger.

## Release Boundary

This report certifies source verification only.

Not performed:

- EAS iOS build
- TestFlight submission
- Android cloud build
- App Store review submission
- physical-device Build 15 acceptance test
- native Premium purchase or receipt validation

A separate explicit authorization is required before any paid/cloud build or TestFlight upload.

## Future Separate Work

Build 16 is reserved for the Explorer Kids Experience. It will remain separate from Build 15 and use a shared underlying question/scoring/progress engine, with clearer Kids Mode naming, larger controls, age-friendly language, friendly mascot guidance, encouraging feedback, parental safety boundaries, and no change to canonical Scripture facts or gameplay truth.
