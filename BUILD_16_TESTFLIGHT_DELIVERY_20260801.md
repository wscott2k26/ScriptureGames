# Scripture Games iOS Build 16 — Verified TestFlight Delivery

Date: August 1, 2026

## Delivery result

Apple confirmed **Scripture Games 1.0.0 (16)** is available to test on iOS.

- Apple confirmation time: `2026-08-01T22:43:01Z`
- America/New_York time: `2026-08-01 6:43:01 PM EDT`
- App Store Connect app ID: `6795368257`
- EAS project ID: `18710e80-2a62-46ac-8d3a-d1711b7d920a`
- EAS build ID: `0c725097-3920-49f2-beb6-0ba17bb192a7`
- EAS submission ID: `8ed1030e-bd93-4a5a-b8f1-693da1cbb367`
- GitHub release run: `30721455200`
- Signed-record artifact ID: `8825086628`
- Signed-record artifact digest: `sha256:ab1569b7ee9a31e1b51bfa21786d492f7c9c96c4a2472fb5d33be483c6f947f1`
- EAS-recorded release commit: `b2ba658923fec695574b9ad384222b0896af199d`
- Verified hotfix source ancestor: `48f8ef67b5d09417aba700c6d6b5e18b1367c1da`

## Authorized boundary honored

- Exactly one actual iOS production EAS build was created.
- Exactly one automatic TestFlight submission was attached to that build.
- The signed record identifies physical-device iOS, `STORE` distribution, production profile, Version `1.0.0`, Build `16`.
- Android cloud build was not run.
- App Review or public-release submission was not made.
- Draft PR #49 remains open and unmerged for physical-device acceptance.

## Build 16 hotfix

Build 15 displayed a blue `Source: <verse>` line after quiz grading, but that line was plain text. Tapping it did nothing even though the separate **Open in Bible** handler existed.

Build 16 changes only this navigation surface:

- the visible blue Scripture source is now a tactile pressable control;
- the source text is visibly underlined and has a descriptive accessibility label;
- tapping either the blue verse or **Open in Bible** calls the same exact-reference handler;
- the exact verse reference and `fromQuiz` marker are passed to the Bible tab;
- the Bible tab parses and opens that bundled offline passage;
- **Return to Quiz** uses stack-back navigation so question, selected answer, right/wrong feedback, score, and topic remain intact.

No changes were made to quiz questions, answer keys, scoring, Premium, piano, peaceful backgrounds, Genesis gameplay, Journey progression, Lumi, or profile data.

## Test-first evidence

- Red run `30712893526` passed all earlier Build 13–15 contracts and failed only because the visible Scripture source was not pressable.
- Green run `30712953070` passed the new Scripture-reference contract and the complete quality matrix.
- The release run `30721455200` reran `yarn validate` before spending the iOS build credit and passed again.

The verified matrix included:

- complete World English Bible generation: 66 books, 1,189 chapters, 31,098 verses;
- Lumi engine and microphone regressions;
- Back-navigation fallback;
- complete Bible Journey catalog, progress, storage, question, route, Premium, scene, motion, and mastery checks;
- Build 13 acceptance contracts;
- Build 14 global audio/background contracts;
- Build 15 piano, entitlement, four-free-book, quiz-background, and Bible-reference contracts;
- Build 16 pressable Scripture-reference contract;
- Journey audit: 90 checks passed;
- runtime/navigation audit: 41 routes and 108 literal navigation targets;
- content/configuration/privacy audit: 1,475 passed, 0 failed;
- visual audit: 265 passed, 0 failed;
- Expo Doctor: 18/18;
- TypeScript;
- ESLint with zero errors;
- offline iOS export;
- offline Android export.

## Cleanup

After Apple confirmed availability:

- the one-use Build 16 release workflow was removed;
- the consumed authorization trigger was removed;
- the temporary Build 16 release reporter and its trigger were removed from the app branch;
- no consumed Build 16 path remains on the app branch that can accidentally repeat the build.

## Future work

The Explorer Kids Experience was not included in Build 16. It remains a separate Build 17 project so this navigation hotfix can be physically accepted without unrelated visual or gameplay risk.
