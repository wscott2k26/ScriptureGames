# Scripture Games — TestFlight Build 13 Delivery

Date: 2026-08-01

## Delivery result

Apple TestFlight confirmed that **Scripture Games 1.0.0 (13)** is available to test on iOS.

- Apple confirmation timestamp: `2026-08-01T15:45:24Z` (`11:45:24 AM America/New_York`)
- App: `Scripture Games (78214d)`
- Version: `1.0.0`
- Build: `13`
- Distribution: TestFlight / iOS

## Authorized release boundary

The user explicitly authorized one iOS Build 13 and one automatic TestFlight submission.

The release workflow was constrained to:

- iOS only;
- production EAS profile;
- expected build number `13`;
- Expo project `@wscott2k8/scripture-games` / project ID `18710e80-2a62-46ac-8d3a-d1711b7d920a`;
- App Store Connect app ID `6795368257`;
- one automatic TestFlight submission;
- no Android cloud build;
- no App Review or public release submission.

The application source was pinned and validated against correction commit:

`60820dbff3453bc4bc3c9ae49c0a8eb636d3a58d`

The workflow refused to proceed if application files under `frontend`, `backend`, `scripts`, or `support-site` differed from that verified source.

## Source verification before build

The current correction source passed the full quality gate before release, including:

- Build 13 acceptance tests for Lumi composer clearance, explicit Premium gating, the optional tutorial, 50 unique real-photo backgrounds, disk caching, and centralized entitlement;
- complete Bible and Bible Journey tests;
- Lumi response and microphone crash-regression tests;
- navigation, runtime, content, privacy, remote-asset, and visual audits;
- Expo Doctor;
- TypeScript;
- ESLint;
- offline iOS and Android exports.

## Post-delivery safety

After Apple confirmed availability, the one-use Build 13 launcher and its consumed authorization trigger were deleted. Temporary read-only monitor and probe workflows/triggers were also removed. No reusable EAS launcher remains on the correction branch.

## Remaining acceptance gate

Build 13 must be tested on a physical iPhone before merging the correction PR or submitting the app for public App Review. The device test should verify:

1. Lumi’s text composer, Send button, and microphone remain visible above the bottom tab bar.
2. Genesis, Exodus, and Leviticus are free.
3. Numbers through Revelation visibly say `PREMIUM REQUIRED` and cannot be unlocked through progress.
4. Premium entry points are visible from Home, Journey, Book Library, Settings, and locked content.
5. The App Tour & Tutorial can be started, skipped, completed, and replayed from Settings.
6. The 50 real-photo backgrounds load, select, cache, and fall back safely when offline.
7. Genesis gameplay, Manna, rank, faction, scores, and saved progress remain unchanged.
8. Cold launch, relaunch, tab navigation, Back controls, and saved preferences remain stable.

Real Apple/Google purchasing remains unavailable until native billing, product configuration, receipt validation, restore handling, cancellation/refund behavior, and sandbox certification are completed.
