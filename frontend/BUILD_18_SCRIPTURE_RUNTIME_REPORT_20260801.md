# Scripture Games Build 18 — Scripture Reference Runtime Report

Date: August 1, 2026 (America/New_York)
Branch: `fix/build-18-scripture-reference-runtime`
Draft PR: #52
Verified product commit: `aeacdd3314004fdd68af7274ab00eb0277823036`
Successful GitHub Actions run: `30728871037`
Result: **SOURCE VERIFICATION PASS**

## Physical-device finding from Build 17

TestFlight Build 17 displayed Scripture references as blue or underlined links, but tapping them could do nothing on an iPhone.

## Confirmed root causes

### Reference-format rejection

The shared link called the bundled Bible parser and disabled itself when parsing failed. The prior parser accepted only a narrow ASCII format. Real app content includes formats such as:

- `Psalm 46:10 (WEB)`
- `1 John 4:19 (WEB)`
- `Genesis 1:3–5`
- `Genesis 6–9`
- references with spaces around the colon

Translation suffixes and Unicode dash characters caused valid-looking references to fail parsing, so React Native disabled the link before its press handler could run.

### Route mismatch

The app's working global Bible navigation uses the registered Expo Router tab destination `/(tabs)/bible`. Build 17's shared link instead pushed `/bible`. Build 18 routes Scripture links through the same registered tab destination and navigation method used by the working dock.

## Build 18 correction

### Pure reference normalizer

A focused parser seam now:

- removes known trailing translation markers such as `(WEB)`;
- converts Unicode hyphen, nonbreaking hyphen, figure dash, en dash, em dash, and horizontal bar characters to `-`;
- normalizes spacing around colons and ranges;
- collapses repeated whitespace;
- preserves the starting chapter and starting verse for passage ranges;
- keeps full book, chapter, and verse validation in the bundled offline Bible library.

### Registered Bible-tab navigation

`ScriptureLink` now uses:

- `router.navigate`;
- pathname `/(tabs)/bible`;
- the original reference value;
- `fromScriptureLink: '1'`;
- the context-specific Return label.

### No silent dead-link state

A visible Scripture reference is no longer silently disabled when a future format cannot be resolved immediately. Tapping still opens the Bible reader, where the existing visible reference-error message can explain the problem. This prevents a link from appearing interactive while ignoring the user.

The existing 44-point minimum target, ten-point hit slop, accessible link role, exact-passage loading, Bible study tools, and context-aware Return action remain intact.

## Test-first evidence

- Initial run `30728640394` exposed a test-harness import issue before assertions; no product conclusion was drawn from it.
- Corrected RED run `30728726196` executed the pure parser seam and failed exactly because `Genesis 1:3–5` returned `null`.
- An intermediate green-attempt run `30728814393` proved normalization worked and exposed only an object-shape mismatch for a chapter-only range.
- Final run `30728871037` passed the complete matrix.

The Build 18 runtime contract executes real shipped formats, not merely source-text patterns. It verifies:

- ASCII verse ranges;
- Unicode en-dash verse ranges;
- Unicode chapter ranges;
- `(WEB)` translation suffixes;
- numbered Bible books;
- flexible colon spacing;
- the pure parser seam is used by the Bible library;
- `router.navigate` targets `/(tabs)/bible`;
- `/bible` is no longer used by the shared link;
- the shared link does not silently disable itself.

## Complete regression result

Run `30728871037` passed:

- complete World English Bible generation: 66 books, 1,189 chapters, 31,098 verses;
- optional cloud-backup audit;
- Premium faith and Lumi voice audit;
- Lumi engine and microphone regressions;
- Back-navigation fallback;
- complete Bible Journey tests;
- Build 13 acceptance contract;
- Build 14 audio/background contract;
- Build 15 piano/Premium/quiz contract;
- Build 16 Scripture-navigation contract;
- Build 17 universal-link contract;
- Build 18 runtime parser and registered-route contract;
- Bible Journey source audit;
- runtime/navigation audit;
- content/privacy audit;
- visual audit;
- Expo Doctor;
- TypeScript;
- ESLint;
- offline iOS export;
- offline Android export.

## Protected scope

No changes were made to questions, answer keys, scoring, rewards, Premium entitlement behavior, audio, backgrounds, Genesis gameplay or art, Lumi, profiles, cloud backup, or Kids Mode.

The changed-file set contains no EAS launcher, TestFlight uploader, Android cloud-build trigger, App Review action, or public-release workflow.

## Release boundary

Not performed:

- EAS iOS build;
- TestFlight submission;
- Android cloud build;
- App Review submission;
- public release;
- pull-request merge;
- physical-device Build 18 acceptance.

A separate explicit authorization is required before any paid cloud build or TestFlight upload. Source verification cannot replace an iPhone test.
