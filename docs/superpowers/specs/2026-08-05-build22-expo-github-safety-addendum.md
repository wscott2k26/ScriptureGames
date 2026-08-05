# Build 22 — Expo Cost and GitHub Safety Addendum

**Date:** 2026-08-05  
**Applies to:** Build 22 RevenueCat Apple Premium design

This addendum is mandatory. It exists because Expo/EAS builds now incur charges and prior high-volume GitHub automation created account-risk concerns.

## 1. Existing hazards discovered

The current repository contains legacy workflows capable of creating paid builds or automatic TestFlight submissions:

- `.github/workflows/build-submit-rc3.yml` can run after another workflow completes and creates an Android preview plus an iOS production build with automatic submission.
- `.github/workflows/rc3-signed-builds-only.yml` can create both Android and iOS builds and automatically submit iOS.
- `.github/workflows/ios-cloud-update.yml` can create and automatically submit an iOS production build when its trigger file changes.

These are hazardous legacy release paths for Build 22. No Build 22 work may touch their release-trigger files.

## 2. Merge blockade

No Build 22 source branch may merge to `main` while an uncontrolled workflow can create a paid EAS build from an ordinary merge, workflow completion, pull request event, or trigger-file edit.

Before the Build 22 implementation PR becomes mergeable, the legacy release automation must be quarantined using a separately reviewed safety change. The safe state is:

- no `workflow_run` release trigger
- no release build on ordinary `push`
- no release build on ordinary `pull_request`
- no Android build in the iOS release path
- no `--auto-submit`
- no build action without a manual dispatch and exact authorization inputs

## 3. Expo/EAS cost controls

### Source phase

During design, implementation, review, and source validation:

- zero EAS builds
- zero EAS submissions
- zero Android cloud builds
- no TestFlight upload
- no App Review submission
- use static tests, TypeScript, lint, audits, and local Expo export only

### Build phase

After all source gates pass and the user explicitly authorizes one paid build:

- build **iOS only**
- build from one exact approved commit SHA
- production profile only
- expected remote build number: 22
- exactly one `eas build --platform ios`
- do not use `--auto-submit`
- do not build Android
- do not retry automatically
- if the build fails, stop and inspect before any new paid attempt

### Submission phase

TestFlight upload is a separate authorization from the paid EAS build:

- verify build ID, commit SHA, bundle ID, version, build number, and artifact status first
- require a new explicit user authorization to submit that exact build
- submit the existing artifact only; do not rebuild

App Review submission is a third separate authorization after sandbox testing and screenshots.

## 4. One-use authorization contract

Any future release workflow must require manual inputs matching all of the following:

- `authorization`: an exact one-use phrase supplied for that release
- `commit_sha`: the approved immutable source SHA
- `expected_build_number`: `22`
- `platform`: `ios`
- `allow_paid_build`: exact value `YES_ONE_IOS_BUILD`

The workflow must abort before EAS authentication if any value is missing or mismatched.

A consumed authorization cannot be reused. No scheduled, push-based, PR-based, or workflow-chain fallback is allowed.

## 5. GitHub account-safety controls

Build 22 uses a low-volume repository strategy:

- one design branch
- one implementation branch
- one implementation PR
- no probe repositories
- no temporary fork network
- no high-frequency polling
- no repeated workflow dispatches
- no workflow loops that commit back to `main`
- no automated issue spam on each failed step
- no force-pushing shared branches
- no storing binaries in Git history
- no committing credentials or generated secret material

Implementation commits are batched by coherent feature units rather than one commit per tiny edit.

## 6. CI run budget

The implementation branch is not added to the quality gate's push branch list. The complete quality gate should run only when the finished implementation PR is opened or updated for final review.

Target CI budget:

- one primary full quality-gate run
- at most one corrective rerun after a real code correction
- if an isolated infrastructure job fails, rerun only the failed job when possible
- never repeatedly dispatch the entire suite to obtain a passing result

The existing concurrency cancellation remains useful for preventing duplicate validation jobs.

## 7. Safe source-change sequence

1. Approve design and implementation plan.
2. Create one isolated implementation branch from the verified `main` SHA.
3. Add tests before purchase implementation.
4. Implement the adapter and UI integration in batched commits.
5. Perform static inspection before opening a PR.
6. Quarantine hazardous legacy release workflows through the reviewed safety path.
7. Open one Build 22 implementation PR.
8. Run the complete quality gate once.
9. Review the exact diff and successful evidence.
10. Merge only after confirming no release workflow can fire.
11. Create no EAS build until the user explicitly authorizes the one paid iOS build.

## 8. Failure behavior

If any unexpected EAS build, submission, workflow loop, duplicate run, authentication anomaly, or GitHub account warning appears:

- stop all writes
- do not retry automatically
- do not create replacement workflows or repositories
- inspect the exact event and run evidence
- revoke or rotate the affected token if warranted
- preserve Build 21 as the rollback baseline
- report honestly before proceeding
