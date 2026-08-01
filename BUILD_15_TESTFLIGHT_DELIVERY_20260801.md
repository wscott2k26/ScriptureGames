# Scripture Games iOS Build 15 — Verified TestFlight Delivery

Date: August 1, 2026

## Delivery result

Apple confirmed **Scripture Games 1.0.0 (15)** is available to test on iOS.

- Apple confirmation time: `2026-08-01T17:55:46Z`
- America/New_York time: `2026-08-01 1:55:46 PM EDT`
- App Store Connect app ID: `6795368257`
- EAS project ID: `18710e80-2a62-46ac-8d3a-d1711b7d920a`
- EAS build ID: `fbf84fb6-515f-4ffe-a295-e611f056aa26`
- EAS submission ID: `ba25bb84-4f2d-42e9-8460-582edae16029`
- GitHub release run: `30711032104`
- Signed-record artifact ID: `8821958914`
- Signed-record artifact digest: `sha256:d86109f8ebfc58a036d50b96cb808a95ed993d1cad8e42d466648fc5b1774221`
- EAS-recorded source commit: `f3e448c10e7a162e3d9a5741bec679ac57136958`
- Verified product/report source ancestor: `9bcb08ef683fba4091a7ba50f762b9150d751db5`

## Authorized boundary honored

- Exactly one actual iOS production EAS build was created.
- Exactly one automatic TestFlight submission was attached to that build.
- The build record identifies physical-device iOS, `STORE` distribution, production profile, Version `1.0.0`, Build `15`.
- Android cloud build was not run.
- App Review or public-release submission was not made.

## GitHub run clarification

The release workflow's product and cloud steps succeeded:

- source authorization and ancestry verification;
- protected Expo credential verification;
- frozen dependency installation;
- complete Build 15 source validation;
- Expo account and project identity verification;
- one iOS production build and automatic TestFlight submission command;
- signed-build record upload.

GitHub run `30711032104` ended with a `failure` conclusion only after those successful steps because its optional documentation commit could not push to a draft branch that had advanced while the cloud build was running. This was a repository-bookkeeping conflict, not a build, signing, submission, or Apple-processing failure.

Apple's TestFlight email independently confirms that Build 15 completed processing and became available to testers.

An earlier run, `30710824158`, stopped at authorization preflight before Expo setup because two bulleted safety lines were checked as exact whole lines. It created no EAS build, spent no build credit, produced no binary, and made no TestFlight submission.

## Build 15 product changes

### Ambient piano recovery

- Ambient piano now observes the real `expo-audio` player status.
- Playback starts or resumes only after the piano asset reports `isLoaded`.
- App-active state, Music preference, silent-switch playback mode, looping, low volume, foreground resume, and Lumi pause/resume remain enforced.
- Existing sound effects remain independent.

### Honest Premium access

- The leftover TestFlight-beta default that marked new profiles Premium was removed.
- New local profiles begin with Premium off.
- A Boolean `is_premium: true` alone can no longer unlock Premium.
- Premium requires a recognized App Store or Play Store entitlement source and the exact product ID `com.willywill.scripturegames.premium`, with optional expiration validation.
- Legacy unvalidated beta flags are normalized without deleting XP, streaks, badges, completed nodes, Journey progress, preferences, or Lumi chat history.

### Free Journey books

The free gamified Journey books are exactly:

1. Genesis
2. Exodus
3. Leviticus
4. Matthew

The remaining 62 Journey books require validated Premium. Completing chapters, trials, or free books cannot bypass the Premium boundary. The complete 66-book offline Bible reader remains free.

### Ordinary quiz presentation

- Ordinary quiz loading, question, feedback, and result screens use the player's selected peaceful photograph.
- Warm, lighter parchment-style cards improve readability over photographs.
- The old fixed Genesis Trial 9 image was removed from ordinary quizzes.
- Genesis tournament maps, trials, quizzes, and Victory Hall retain their approved original artwork.

### Post-answer Bible reference

- After an answer is graded, the feedback panel shows its exact Scripture reference.
- **Open in Bible** opens that passage in the bundled offline Bible reader.
- **Return to Quiz** uses stack-back navigation and preserves the same question, selected answer, feedback, score, and topic.
- Reference lookup cannot submit, alter, or advance an answer.

### Home and Journey clarity

- Home is described as the dashboard for quick games, Bible reading, Lumi, devotionals, and shortcuts.
- Journey is described as the separate book-by-book mastery path with trials, seals, progress, and Premium seasons.

## Regression verification

Successful complete source runs included `30710500402` and final report-head run `30710592011`.

The verified matrix passed:

- complete World English Bible generation: 66 books, 1,189 chapters, 31,098 verses;
- Lumi engine and microphone regressions;
- Back-navigation behavior;
- complete Bible Journey catalog, progress, storage, deterministic questions, routes, Premium access, scenes, motion, and mastery tests;
- Build 13 acceptance contracts;
- Build 14 global audio/background contracts;
- Build 15 piano, entitlement, four-free-book, quiz-background, and Bible-reference contracts;
- dedicated Journey audit: 90 checks;
- runtime/navigation audit: 41 routes and 108 literal navigation targets;
- content/configuration/privacy audit: 1,475 passed, 0 failed;
- visual audit: 264 passed, 0 failed;
- Expo Doctor: 18/18;
- TypeScript;
- ESLint;
- offline iOS export;
- offline Android export.

## Cleanup

After Apple's confirmation:

- the one-use Build 15 release workflow was removed;
- the consumed authorization trigger was removed;
- temporary release reporters and EAS watchers were removed from the app branch;
- no workflow remaining on the Build 15 app branch can accidentally repeat this build through the consumed path.

Draft PR #46 remains open and unmerged for physical-iPhone acceptance testing. Build 16 Explorer Kids Experience remains separate and is not included in Build 15.
