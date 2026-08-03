# Scripture Games Build 17 — Universal Scripture Links Regression Report

Date: August 1, 2026
Branch: `fix/build-17-universal-scripture-links`
Draft PR: #51
Verified source commit: `12f2d627fd12a7ef9bae7f0f1bf147d319618c0b`
GitHub Actions run: `30724149963`
Result: **SOURCE VERIFICATION PASS**

## Why Build 16 failed physically

Build 16 added an `onPress` wrapper around the blue quiz source, but the visible control was still approximately the height of 11-point text and did not provide a reliable finger-sized iPhone touch target. Its automated contract proved only that an `onPress` property existed in source. It did not prove an accessible touch area or one shared end-to-end navigation implementation.

Build 17 replaces that ad-hoc fix with a shared Scripture navigation system.

## Shared ScriptureLink contract

`frontend/src/components/ScriptureLink.tsx` is now the approved primitive for visible structured Bible references.

It provides:

- a native React Native `Pressable` instead of the animated tactile wrapper that was used by the failed Build 16 label;
- minimum 44-point height and width;
- 10-point hit slop on every side;
- a visible book icon, underlined reference, and open-link icon;
- `accessibilityRole="link"` and a descriptive accessibility label;
- validation through the bundled `parseBibleReference` function before navigation;
- navigation to the public Expo Router URL `/bible` rather than an internal route-group pathname;
- `router.push` so the originating experience remains in stack history;
- an accessible disabled state for references the bundled parser cannot resolve.

## Converted reference surfaces

Known structured visible Scripture references now use the shared link system in:

1. Classic Quiz feedback.
2. Daily Challenge question metadata.
3. Daily Challenge right/wrong feedback.
4. Daily Challenge Witness Card results.
5. Devotionals.
6. Faith Journey days.
7. Stories devotional cards.
8. Genesis quiz gray question metadata.
9. Genesis quiz right/wrong feedback.
10. Genesis quiz result truth cards.
11. Verse Memory’s compact gray header reference.

Command Center currently renders no structured Scripture reference, so no artificial reference was added there.

## Bible destination and return flow

The Bible reader now accepts:

- `reference` — the exact displayed reference;
- `fromScriptureLink` — identifies universal Scripture navigation;
- `returnLabel` — context-aware copy such as `Return to Quiz` or `Return to Devotional`.

The destination:

- parses and opens the exact bundled offline passage;
- focuses the requested verse;
- retains the reader’s bookmark, highlight, share, narration, verse-note, and sermon-note features;
- shows a context-aware Return action only when navigation history exists;
- uses stack-back navigation so quiz answers, scores, feedback, Daily Challenge state, Journey state, devotional state, and story state remain available;
- shows a visible non-blocking warning instead of silently failing when a supplied reference cannot be parsed.

## Protected scope

Build 17 does not modify:

- quiz questions or answer keys;
- scoring, rewards, XP, or progression;
- Premium entitlement logic or the four-free-book boundary;
- piano or sound effects;
- peaceful background selection;
- Genesis questions, scoring, maps, artwork, Manna, ranks, factions, or Victory Hall;
- Lumi responses or microphone behavior;
- profile or cloud-backup data;
- Kids Mode / Explorer Kids Experience.

Kids Mode remains a separate Build 18 project.

## Test-first evidence

- Red run `30723380085` passed the older Build 13–16 protections and failed because the shared Build 17 link system did not exist.
- Guarded source executor run `30723883108` applied the universal implementation only after Build 16 compatibility, the new Build 17 contract, and TypeScript passed.
- Full run `30723934063` exposed an outdated Build 15 test that still required the old local quiz handler; the contract was upgraded to require the stronger shared-link behavior.
- Full run `30724002694` passed Build 13–17 behavior and failed only because the visual audit’s interaction-primitive allowlist predated `ScriptureLink`.
- Guarded audit run `30724112761` registered `ScriptureLink` as an approved interaction primitive after the visual audit passed.
- Final complete run `30724149963` passed end-to-end on source commit `12f2d627fd12a7ef9bae7f0f1bf147d319618c0b`.

## Final verification results

Run `30724149963` passed:

- complete World English Bible generation: 66 books, 1,189 chapters, 31,098 verses;
- optional cloud-backup audit;
- Premium faith and Lumi voice audit;
- Lumi response-engine tests;
- Lumi microphone crash-regression tests;
- Back-navigation fallback tests;
- complete Bible Journey catalog, progress, storage, deterministic questions, route, Premium, scene, motion, and mastery tests;
- Build 13 acceptance contracts;
- Build 14 global audio and background contracts;
- Build 15 piano, entitlement, free-book, quiz-background, and Bible-lookup contracts through the shared system;
- Build 16 Scripture-reference navigation compatibility through the shared system;
- Build 17 universal Scripture-link contract;
- dedicated Journey audit: 90 checks passed;
- runtime/navigation audit: 41 routes and 107 literal navigation targets;
- content/configuration/privacy audit: 1,475 checks passed, 0 failed;
- visual audit: 265 checks passed, 0 failed;
- Expo Doctor: 18/18 checks passed;
- TypeScript;
- ESLint with zero errors and one pre-existing unused-variable warning in `src/lumi-engine.ts`;
- offline iOS export;
- offline Android export.

## Release boundary

This report certifies source verification only.

Not performed:

- EAS iOS build;
- TestFlight submission;
- Android cloud build;
- App Review or public-release submission;
- PR merge;
- physical-device Build 17 acceptance testing.

A separate explicit authorization is required before one paid iOS Build 17 and one TestFlight submission can be started.
