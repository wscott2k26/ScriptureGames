# Scripture Games Build 18 — TestFlight Delivery Record

Date: August 1, 2026 (America/New_York)
App: Scripture Games
Version: `1.0.0`
TestFlight build: `18`

## Apple availability confirmation

Apple TestFlight emailed confirmation at **2026-08-02 03:30:04 UTC**, which is **August 1, 2026 at 11:30:04 PM EDT**, with the subject:

`Scripture Games (78214d) 1.0.0 (18) for iOS is now available to test.`

This confirms Build 18 completed Apple processing and is available in TestFlight.

## Exact release identifiers

- Verified Build 18 product/report source: `4d56670550c810ecf78faae07676a485373e8181`
- Release/authorization commit built by EAS: `b735435933cd0e37a50c7d0b2737729c61ff63f4`
- GitHub Actions release run: `30730418932`
- GitHub release job: `91449687308`
- EAS iOS build ID: `5f47b1ec-3659-414f-bf4f-8e209f068f39`
- EAS iOS submission ID: `fd7ad537-14d2-4a80-bf1d-50be1ea6284d`
- EAS project ID: `18710e80-2a62-46ac-8d3a-d1711b7d920a`
- App Store Connect app ID: `6795368257`
- Bundle identifier: `com.willywill.scripturegames`
- Signed GitHub artifact: `scripture-games-ios-build18-testflight-record`
- Artifact ID: `8827861438`
- Artifact SHA-256: `131336095c6cbe79aa4050e773c3e26be86da7ac4c77710f69642639672ac2e0`

## Release boundary actually performed

Exactly the approved actions were performed:

1. One iOS production EAS build.
2. One automatic iOS TestFlight submission.

Not performed:

- no second iOS build;
- no Android cloud build;
- no App Review submission;
- no public App Store release;
- no pull-request merge;
- no Kids Mode work.

## Verification before the paid build

The one-use release run verified that:

- the approved Build 18 product source was unchanged;
- this was the release workflow's only run;
- the protected Expo credential was present;
- Expo authenticated as `wscott2k8`;
- the linked EAS project and iOS bundle identifier were correct;
- the complete Build 18 source gate passed again before EAS was invoked.

The re-run included Build 13 through Build 18 regression contracts, the complete 66-book Bible audit, Bible Journey tests and audits, runtime/navigation checks, content/privacy checks, visual checks, Expo Doctor, TypeScript, ESLint, and offline iOS and Android exports.

## Build and submission evidence

EAS remotely incremented the iOS build number from 17 to 18 and reported:

- `Build finished`
- `Submitted your app to Apple App Store Connect!`
- `Your binary has been successfully uploaded to App Store Connect!`

The workflow validated that the returned record contained exactly one non-simulator iOS `STORE` build using the `production` profile, version `1.0.0`, build `18`, source commit `b735435933cd0e37a50c7d0b2737729c61ff63f4`, and exactly one iOS submission targeting App Store Connect app `6795368257`.

## EAS billing disclosure

During this authorized release, EAS CLI reported that the Expo account had used **39 builds beyond the included credits this billing period** and showed **$29.00 in overages so far**. No second Build 18 run was performed. Future paid cloud builds require a new explicit authorization.

## Repository state

Draft PR #52 remains open and unmerged pending physical-device acceptance of Build 18. The one-use release launcher, consumed authorization trigger, and temporary release-branch monitor are removed after delivery so they cannot fire again.
