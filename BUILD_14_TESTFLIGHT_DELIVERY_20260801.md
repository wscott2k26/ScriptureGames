# Scripture Games iOS Build 14 — Verified TestFlight Delivery

Date: 2026-08-01

## Delivery result

Apple confirmed **Scripture Games 1.0.0 (14)** is available to test on iOS.

- Apple confirmation time: `2026-08-01T16:25:15Z`
- America/New_York time: `2026-08-01 12:25:15 PM EDT`
- App Store Connect app ID: `6795368257`
- EAS project ID: `18710e80-2a62-46ac-8d3a-d1711b7d920a`
- EAS build ID: `26600417-f294-426c-ac8e-a373cc0ceccf`
- EAS submission ID: `68929a84-8c8d-46f6-907e-426e40674ce1`
- GitHub release run: `30707720573`
- Release artifact: `scripture-games-ios-build14-testflight-record`
- EAS-recorded source commit: `c1c086ed21a79a83c015e00b1ddd90a2eaec8432`
- Verified application/report source: `c45bfefcc5de8f1ee4b50ee6b1a809e1cf96ccb7`

## Authorized boundary honored

- Exactly one authorized iOS production build workflow ran.
- Exactly one TestFlight auto-submission was attached to the build record.
- Build record validated as physical-device iOS, `STORE`, production profile, Version `1.0.0`, Build `14`.
- Android cloud build was not run.
- No App Review or public-release submission was made.

## Source verification before build

The authorized workflow re-ran and passed:

- complete Bible generation and audit;
- cloud backup and Premium faith audits;
- Lumi engine and microphone crash-regression tests;
- Back-navigation checks;
- Complete Bible Journey tests and audit;
- Build 13 acceptance regression contract;
- Build 14 global audio/background regression contract;
- runtime, link, content, privacy, remote-asset, and visual audits;
- Expo Doctor;
- TypeScript;
- ESLint.

The final pre-release source gate was GitHub Actions run `30707621703`, which also passed offline iOS and Android exports.

Full ten-pass evidence is stored at `frontend/BUILD_14_10X_REGRESSION_REPORT_20260801.md`.

## Build 14 correction scope

- App audio now uses one shared active playback session and allows playback while an iPhone's silent switch is enabled.
- Ambient piano, tap/success/error feedback, Settings previews, foreground resume, and Lumi voice restoration use that shared session.
- The selected peaceful photograph is now the default for ordinary app screens using the shared cinematic shell.
- The tutorial follows the selected peaceful background.
- Genesis tournament map, trials, quizzes, and Victory Hall explicitly preserve their approved original artwork.
- A permanent test scans the app for fixed non-gameplay peaceful-scene overrides.

## Cleanup

After Apple confirmation, the one-use Build 14 launcher, consumed authorization trigger, and temporary status/monitor workflows and triggers were removed. They cannot accidentally launch a second Build 14.

PR #45 remains draft and unmerged pending physical-iPhone acceptance testing of Build 14.
