# Scripture Games — Build 12 TestFlight Delivery Record

Date: 2026-08-01

## Authorized release

Willy Will authorized one conservative iOS physical-device build from the Complete Bible Journey feature branch.

- Repository: `wscott2k26/ScriptureGames`
- Source branch: `feature/complete-bible-journey-upgrade`
- Source commit used by EAS: `67b0a77d84f7752077b884659b9f65dec8d08756`
- App version: `1.0.0`
- iOS build number: `12`
- Distribution: App Store / TestFlight
- Android build: not run

## Pre-build verification

Fresh quality gate run `30701855942` completed successfully before the build trigger. It included:

- complete Bible generation and audit;
- cloud, Premium faith, Lumi, voice, navigation, and Bible Journey tests;
- dedicated Complete Bible Journey audit;
- runtime, content, and visual audits;
- Expo Doctor;
- TypeScript and ESLint;
- offline iOS and Android exports.

## Signed build and submission

- GitHub authorized build workflow run: `30701969765`
- EAS build ID: `e2a4f099-4653-4aaf-bd81-59bb39f2cc09`
- EAS submission ID: `1b68db84-cd2c-4a38-80ac-04420f8fe267`
- Expo submission status: `FINISHED`
- Submission created: `2026-08-01T13:34:59.252Z`
- Submission finished: `2026-08-01T13:42:46.283Z`

The Expo submission status was verified using the repository's established read-only GraphQL submission query. No second build or submission was created.

## Apple confirmation

Apple TestFlight sent the confirmation email:

`Scripture Games (78214d) 1.0.0 (12) for iOS is now available to test.`

- Apple email time: `2026-08-01T13:44:44Z`
- Local time: `2026-08-01 09:44:44 America/New_York`

## Current release boundary

Build 12 is available in TestFlight for real-iPhone acceptance testing. PR #42 remains draft and unmerged. A successful cloud build does not replace physical-device verification of navigation, Lumi microphone behavior, Bible Journey progression, peaceful backgrounds, motion settings, persistence, and Premium messaging.
