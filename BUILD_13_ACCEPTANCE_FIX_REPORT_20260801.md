# Scripture Games — Build 13 Acceptance-Fix Source Report

Date: 2026-08-01

## Scope

This source correction responds to physical-iPhone findings from TestFlight Build 12:

1. Lumi's typed chat composer existed in source but was hidden beneath the absolute floating tab bar.
2. Books 4–66 were guarded in code, but lock-only presentation made Premium access unclear.
3. Peaceful backgrounds were procedural illustrations rather than the requested real photographs.
4. The app lacked a voluntary guided tour explaining each major section.

## Corrections

### Lumi typed chat

- Measures the real bottom-tab-bar height with `useBottomTabBarHeight`.
- Reserves that height beneath the composer when the keyboard is closed.
- Preserves the existing text field, Send button, microphone safeguards, draft restoration, and chat history.

### Premium access

- Introduces one shared Bible Journey access policy.
- Genesis, Exodus, and Leviticus remain free.
- Numbers through Revelation remain `PREMIUM REQUIRED` unless the authoritative Premium entitlement is active.
- Completing a chapter, trial, or free book cannot bypass the Premium requirement.
- Journey, Book Library, Home, and Settings expose a visible Premium option.
- Book routes and peaceful-background locks use the same central Premium entitlement.
- No local fake Premium flag or simulated purchase path was added.

### Guided tutorial

- Adds an optional nine-part App Tour & Tutorial.
- Explains Home, Journey, Games, Bible, Lumi, Settings, Premium, progress, privacy, and help.
- Includes Not Now, Previous, Next, direct step selection, and Finish Tutorial.
- Can be launched from Home and replayed from Settings.
- Does not alter gameplay or player progress.

### Real peaceful photos

- Adds exactly 50 unique curated Pexels photos.
- Keeps Cross on the Hill as the default.
- Uses smaller 600-pixel requests for picker previews and 1600-pixel requests for selected full-screen backgrounds.
- Uses device disk caching through `expo-image`.
- Retains the procedural scene renderer only as an offline/error fallback.
- Stores the matching Pexels source page for every photo.
- The release audit allows Pexels URLs only inside the reviewed 50-photo catalog; Pexels or other remote asset URLs elsewhere still fail validation.

Important runtime behavior: a real photo needs an internet connection the first time it is viewed. After it loads, the app requests disk caching. If it is not cached and the device is offline, the artistic fallback appears instead of a broken screen.

## Verification

Correction branch:

`fix/build-13-acceptance-regressions`

Draft PR:

`#43 — Fix Build 12 acceptance regressions and add guided tutorial`

Verified source commit:

`43782d41e130c981b669868e9f7ccffc8509d9f5`

Successful GitHub Actions run:

`30705562695`

The successful run passed:

- dependency installation from the lockfile;
- complete 66-book Bible generation and integrity audit;
- optional cloud-backup audit;
- Premium faith and Lumi voice audit;
- Lumi answer-engine tests;
- Lumi microphone crash-regression tests;
- Back-navigation tests;
- Complete Bible Journey catalog, progress, storage, question, route, Premium, scene, motion, and mastery tests;
- Build 13 acceptance tests for visible Lumi composer clearance, explicit Premium access, tutorial routes, 50 unique photos, cache behavior, and centralized entitlement;
- Complete Bible Journey source audit;
- whole-app runtime and literal-link audit;
- current content/configuration/privacy/remote-asset audit;
- visual audit;
- Expo Doctor;
- TypeScript;
- ESLint;
- offline iOS export;
- offline Android export.

## Preserved boundaries

The correction PR does not modify Genesis trial definitions, Genesis question grading, factions, Manna, rank, scoring, season storage, or original trial artwork.

It contains no EAS build launcher, TestFlight release trigger, Android cloud-build trigger, or App Review submission action.

## Remaining gate

Static validation and offline exports cannot prove the corrected composer position or real-photo rendering on a physical iPhone. One separately authorized iOS Build 13 is still required for device acceptance testing. Real Apple/Google Premium purchasing also remains unavailable until native billing, store products, receipt validation, restore behavior, cancellation/refund handling, and sandbox testing are installed and certified.
