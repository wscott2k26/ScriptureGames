# Scripture Games Build 17 — TestFlight Delivery Record

Date: August 1, 2026 (America/New_York)
App: Scripture Games
Version: `1.0.0`
TestFlight build: `17`

## Apple availability confirmation

Apple TestFlight emailed confirmation at **2026-08-02 01:15:00 UTC**, which is **August 1, 2026 at 9:15 PM EDT**, with the subject:

`Scripture Games (78214d) 1.0.0 (17) for iOS is now available to test.`

This confirms Build 17 completed Apple processing and is available in TestFlight.

## Exact release identifiers

- Verified product source: `f704275813f200822831b6e40be696a6196e4b76`
- Release/authorization commit built by EAS: `b535d83d953aff04d96319b407f817f4a880c4ec`
- GitHub Actions release run: `30726373283`
- EAS iOS build ID: `c1e1a66f-585d-4630-9432-67c1446a3f95`
- EAS iOS submission ID: `f7d08c34-27bf-425d-a23a-de5c4896e7ad`
- EAS project ID: `18710e80-2a62-46ac-8d3a-d1711b7d920a`
- App Store Connect app ID: `6795368257`
- Bundle identifier: `com.willywill.scripturegames`
- Signed GitHub artifact: `scripture-games-ios-build17-testflight-record`
- Artifact ID: `8826571321`
- Artifact SHA-256: `5b4e57eda9f9fa4501ed000a55fafc6d51332b49570261a2958ae948edfefccc`

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
- no Kids Mode / Explorer Kids Experience work.

## Verification before paid build

The one-use release run verified that:

- the approved Build 17 product source was unchanged;
- this was the release workflow's only run;
- the protected Expo credential was present;
- Expo authenticated as `wscott2k8`;
- the linked EAS project and iOS bundle identifier were correct;
- the complete Build 17 source gate passed again before EAS was invoked.

The re-run included Build 13 through Build 17 regression contracts, the complete 66-book Bible audit, Bible Journey tests and audits, runtime/navigation checks, content/privacy checks, visual checks, Expo Doctor, TypeScript, ESLint, and offline iOS and Android exports.

## Build and submission evidence

EAS remotely incremented the iOS build number from 16 to 17, completed the production build, and then reported:

- `Build finished`
- `Submitted your app to Apple App Store Connect!`
- `Your binary has been successfully uploaded to App Store Connect!`

The workflow then validated that the returned record contained exactly one non-simulator iOS `STORE` build using the `production` profile, version `1.0.0`, build `17`, and exactly one iOS submission targeting App Store Connect app `6795368257`.

## EAS billing disclosure

During this authorized release, EAS CLI reported that the Expo account had used **38 builds beyond the included credits this billing period** and showed **$27.00 in overages so far**. No second Build 17 run was performed. Future paid cloud builds still require separate explicit authorization.

## Cleanup and repository state

The one-use Build 17 release launcher and authorization trigger were consumed and removed after successful delivery. Draft PR #51 remains open and unmerged pending physical-device acceptance.
