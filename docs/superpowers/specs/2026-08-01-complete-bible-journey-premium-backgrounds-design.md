# Complete Bible Journey, Premium Access, and Peaceful Backgrounds Design

Date: 2026-08-01
Status: Approved design specification
Repository: `wscott2k26/ScriptureGames`

## 1. Goal

Upgrade Scripture Games from a Genesis-only tournament into a complete 66-book Bible journey without changing or destabilizing the gameplay that already works.

The upgrade must add:

- all 66 Bible books in canonical order;
- a sequential path that starts at Genesis and unlocks the next book after completion;
- a separate free-select path that lets users browse all 66 books and open any entitled book;
- free access to Genesis, Exodus, and Leviticus;
- Premium access for Numbers through Revelation;
- a peaceful, user-selectable background system with up to 50 curated offline scenes;
- a default background featuring a cross on a beautiful hill;
- preservation of all existing Genesis progress, scores, Manna, factions, rank, and trial behavior.

This is an additive product upgrade. It is not a rewrite of Genesis Tournament and must not alter established gameplay, navigation behavior, Lumi behavior, audio controls, settings behavior, or working release fixes.

## 2. Non-negotiable safety boundary

### Existing Genesis gameplay remains unchanged

The current Genesis Tournament stays intact as the special Season One experience:

- the same ten Genesis trials;
- the same trial order;
- the same questions and choices;
- the same Manna, rank, faction, scoring, and victory behavior;
- the same storage keys and existing progress data unless a compatible read-only adapter is required;
- the same route behavior for the Genesis trial map and Genesis victory screen.

The new Bible Journey system wraps around Genesis rather than replacing it.

### No destructive migration

The implementation must:

- read existing Genesis progress as the authoritative Genesis record;
- never reset or overwrite Genesis progress during migration;
- use versioned new storage for all-book progress;
- make migration idempotent so reopening the app cannot duplicate or corrupt progress;
- preserve offline play;
- keep cloud-backup compatibility limited to the existing `scripture_games_` data boundary.

### Build safety

Design and source work must not trigger an EAS build automatically. A paid or credit-consuming build is allowed only after source tests, exports, audits, and physical-device release planning are complete.

## 3. User entry modes

The Journey area presents two primary choices.

### A. Continue Bible Journey

This is the recommended sequential experience.

- A new player begins at Genesis.
- Completing Genesis unlocks Exodus.
- Completing Exodus unlocks Leviticus.
- Completing Leviticus completes the free path.
- Numbers and every later book require an active Premium entitlement.
- After each completed book, the victory screen offers a clear `Continue to <Next Book>` action.
- The user can leave the sequence, explore another entitled book, and return without losing the sequential marker.

The Journey dashboard shows:

- current recommended book;
- `x of 66 books completed`;
- Old Testament progress;
- New Testament progress;
- completed-book seals;
- books in progress;
- the next recommended action;
- a `Continue Journey` button;
- a `Choose Any Book` button.

### B. Choose Any Book

This opens the full Bible Book Library.

The library shows all 66 books even when some are locked. Users can:

- browse Old Testament and New Testament sections;
- search by book name;
- filter by All, Not Started, In Progress, Completed, Free, and Premium;
- see each book's progress state;
- see a short book theme and chapter count;
- open Genesis, Exodus, and Leviticus for free;
- open any Premium book when entitled;
- select a locked book to see a respectful Premium explanation and purchase/restore controls.

Selecting books out of order does not advance the sequential recommendation. Sequential progress advances only when the current recommended book is completed.

## 4. Canonical book model

A single canonical metadata source defines all 66 books in Protestant Bible order:

1. Genesis
2. Exodus
3. Leviticus
4. Numbers
5. Deuteronomy
6. Joshua
7. Judges
8. Ruth
9. 1 Samuel
10. 2 Samuel
11. 1 Kings
12. 2 Kings
13. 1 Chronicles
14. 2 Chronicles
15. Ezra
16. Nehemiah
17. Esther
18. Job
19. Psalms
20. Proverbs
21. Ecclesiastes
22. Song of Solomon
23. Isaiah
24. Jeremiah
25. Lamentations
26. Ezekiel
27. Daniel
28. Hosea
29. Joel
30. Amos
31. Obadiah
32. Jonah
33. Micah
34. Nahum
35. Habakkuk
36. Zephaniah
37. Haggai
38. Zechariah
39. Malachi
40. Matthew
41. Mark
42. Luke
43. John
44. Acts
45. Romans
46. 1 Corinthians
47. 2 Corinthians
48. Galatians
49. Ephesians
50. Philippians
51. Colossians
52. 1 Thessalonians
53. 2 Thessalonians
54. 1 Timothy
55. 2 Timothy
56. Titus
57. Philemon
58. Hebrews
59. James
60. 1 Peter
61. 2 Peter
62. 1 John
63. 2 John
64. 3 John
65. Jude
66. Revelation

Each book record contains:

- stable id and canonical index;
- display name and testament;
- bundled Bible-data key;
- chapter count;
- short theme;
- visual icon/seal;
- free or Premium access tier;
- content/trial configuration;
- background recommendation;
- completion and next-book metadata.

The first three books are always marked free. Books 4-66 are marked Premium.

## 5. Gameplay architecture

### Genesis adapter

Genesis uses an adapter that exposes its existing progress to the all-book dashboard while continuing to run the existing Genesis screens and logic.

The adapter may report:

- started state;
- completed-trial count;
- overall completion;
- best scores;
- Manna and rank summary;
- Genesis completion timestamp.

It must not change how Genesis itself is played.

### Reusable Bible Season Engine

Exodus through Revelation use a reusable engine rather than 65 duplicated screen sets.

Each book season includes:

- a book introduction;
- a map of book-specific trials;
- major people, events, themes, and teachings;
- chapter and verse challenges;
- Scripture-grounded questions;
- a final Book Trial;
- a book-completion screen;
- replay support;
- offline operation.

The engine reuses existing app interaction patterns and shared premium components. It must not alter Genesis mechanics to force architectural uniformity.

### Content quality

No placeholder content may ship.

Questions and explanations must be grounded in the bundled Bible text and validated content files. Automated generation may assist development, but all released question records must pass deterministic validation for:

- valid book, chapter, and verse references;
- answer index validity;
- non-empty options;
- unique answer choices;
- no unsupported reference outside the selected book;
- sufficient content coverage;
- no internet requirement at runtime.

## 6. Progress model

New versioned storage keeps separate progress for every player and every book.

Conceptual record:

- schema version;
- player id;
- sequential current-book index;
- completed book ids;
- per-book started/completed state;
- per-book completed trials;
- per-book best results;
- per-book Manna or rewards where applicable;
- last opened book;
- completion timestamps;
- migration marker for existing Genesis data.

Rules:

- Genesis remains authoritative in its current storage and is mirrored only through an adapter or safe migration summary.
- Free-select completion is recorded normally.
- Completing a later book through free-select does not skip the user's sequential path.
- When the sequentially required book is completed, the sequential index advances to the next canonical book.
- Replays can improve scores but do not duplicate completion rewards.

## 7. Premium access design

### Free content

Free users receive complete gameplay for:

- Genesis;
- Exodus;
- Leviticus.

The free experience must feel complete and generous. It must not hide the Bible library or make the app appear empty.

### Premium content

Premium unlocks:

- Numbers through Revelation;
- sequential continuation beyond Leviticus;
- free-select gameplay for Books 4-66;
- the full premium peaceful-background collection;
- future Premium Bible Journey content attached to the same entitlement when appropriate.

### Purchase model

Use one non-consumable lifetime Premium entitlement for the first release of this feature. The product identifier and storefront price are configured in App Store Connect and Google Play Console rather than hardcoded in the app.

Required purchase behavior:

- clear purchase screen;
- Restore Purchases;
- entitlement cached locally for offline access after successful validation;
- graceful storefront-unavailable state;
- no purchase required to keep using Books 1-3;
- no loss of progress if Premium lapses or becomes temporarily unverifiable;
- locked books remain visible and retain any prior saved progress;
- no fake purchase button or simulated success in production.

A purchase integration cannot be considered release-ready until tested with sandbox/TestFlight accounts and platform restore behavior.

## 8. Peaceful background system

### Default scene

The default app background is a peaceful cross on a beautiful hill, using a respectful sacred-art direction with readable foreground contrast.

### Scene library

The system supports up to 50 curated, bundled, offline backgrounds across categories such as:

- Cross and worship;
- Bethlehem and Nativity landscapes;
- Jerusalem and Bible-land settings;
- shepherd fields;
- olive groves;
- desert sunrise;
- mountain sunrise;
- ocean beach;
- quiet lake;
- river;
- waterfall;
- forest path;
- prayer garden;
- soft clouds and sunset skies;
- candlelight or peaceful sanctuary atmosphere.

All imagery must be properly licensed, original, generated for the app, or otherwise safe for commercial use. No copyrighted photography may be copied from the web without rights.

### Access tiers

- Free users receive a curated core set of at least 10 peaceful backgrounds, including the default cross-on-a-hill scene.
- Premium users receive the full collection of up to 50 scenes.
- Locked Premium scenes remain previewable with a tasteful Premium badge.

### Settings controls

Settings adds a dedicated `Background & Atmosphere` section:

- selected background;
- scene picker;
- category filtering;
- favorite/unfavorite scene;
- optional rotation among favorites;
- rotation off by default;
- background motion controlled by the existing Motion preference;
- preview before applying;
- reset to Cross on a Hill;
- clear Free/Premium labels.

The selected background applies throughout compatible app surfaces without replacing specialized Genesis trial art where that art is part of existing gameplay. Existing cinematic Genesis backgrounds remain unchanged unless the user is on a general shell, dashboard, settings, library, or other non-trial screen.

### Readability and performance

Every scene must include:

- an approved darkness/overlay value;
- contrast validation for text and controls;
- optimized mobile dimensions and file size;
- no remote runtime dependency;
- lazy loading or preload strategy that avoids flashing;
- reduced-motion compatibility;
- fallback to the default scene if an asset fails.

## 9. Screen and navigation changes

New or expanded surfaces:

- Bible Journey dashboard;
- 66-book library;
- reusable book-season map for Exodus-Revelation;
- reusable book-trial screen;
- reusable book-victory screen;
- Premium purchase/restore screen;
- peaceful background picker;
- expanded Settings section.

Existing routes remain valid. Genesis continues using its existing route set.

The completion flow becomes:

- Genesis victory: `Continue to Exodus`, `Choose Any Bible Book`, `Replay Genesis`;
- Exodus victory: `Continue to Leviticus`, `Choose Any Bible Book`, `Replay Exodus`;
- Leviticus victory for a free user: `Unlock the Rest of the Journey`, `Choose a Free Book`, `Replay Leviticus`;
- any Premium book victory: `Continue to <Next Book>`, `Choose Any Bible Book`, `Replay <Book>`;
- Revelation victory: complete-Bible celebration and replay/library options.

## 10. Error handling

The upgrade must provide safe outcomes for:

- missing or malformed book content;
- failed local progress reads;
- failed progress writes;
- unavailable purchase storefront;
- purchase cancellation;
- purchase validation failure;
- restore with no prior purchase;
- background asset load failure;
- older progress schema;
- unavailable Premium validation while offline.

The app must never crash or erase progress in these cases. It should fall back to the last safe screen, preserve local state, and give a clear recovery action.

## 11. Testing and release gates

### Unit and deterministic tests

- exactly 66 canonical books;
- exact canonical ordering;
- Books 1-3 free and Books 4-66 Premium;
- next-book calculation;
- sequential progression rules;
- free-select does not skip sequential progress;
- Genesis adapter preserves existing records;
- migration idempotency;
- completion reward idempotency;
- entitlement gating;
- restore-purchase state handling;
- background selection and fallback;
- all background metadata and assets resolve;
- content references remain inside the correct book.

### Integration tests

- complete Genesis and continue to Exodus;
- complete Exodus and continue to Leviticus;
- complete Leviticus as free user and encounter the Premium boundary;
- purchase/restore Premium and open Numbers;
- browse and select any entitled book;
- return to sequential mode without lost progress;
- change backgrounds and restart the app;
- use offline mode with cached entitlement and selected background;
- preserve existing Genesis player data after upgrade.

### Regression protection

The full existing quality suite remains required:

- Bible generation and 66-book audit;
- runtime/navigation audit;
- Lumi tests;
- premium feature audit;
- cloud-backup audit;
- TypeScript;
- ESLint;
- Expo Doctor;
- iOS offline export;
- Android offline export;
- physical-device matrix before public release.

### Build policy

No EAS build is triggered during the design or initial source-development phase. Changes are batched and verified before authorizing a single necessary iOS build. Android cloud builds remain skipped unless specifically required.

## 12. Delivery sequence

Implementation should be divided into safe stages while remaining one coherent feature program:

1. Canonical 66-book metadata, progress model, migration tests, and Genesis adapter.
2. Bible Journey dashboard and Book Library with locked/unlocked states.
3. Reusable season engine and complete Exodus and Leviticus free seasons.
4. Premium entitlement boundary, purchase, and restore flows.
5. Books 4-66 content and validation pipeline.
6. Peaceful background framework, default scene, free set, and full Premium set.
7. Victory-screen continuation actions and complete-Bible achievement.
8. Full regression testing, offline exports, purchase sandbox testing, and physical-device verification.

No stage may weaken the existing Genesis experience.

## 13. Acceptance criteria

The feature is complete only when:

- an existing user retains all Genesis progress after updating;
- Genesis gameplay behaves exactly as before;
- every user can complete Genesis, Exodus, and Leviticus for free;
- a free user cannot play Numbers-Revelation but can browse and preview them;
- a Premium user can play any of all 66 books;
- sequential mode advances correctly from Genesis through Revelation;
- free-select mode never corrupts the sequential path;
- all progress remains available offline;
- the default cross-on-a-hill background is applied to compatible general screens;
- users can choose from the free scene set and Premium users from the full collection;
- background choices survive restart and never reduce readability;
- purchase and restore are verified in platform sandbox environments;
- automated audits and exports pass;
- no unnecessary EAS builds or duplicate paid build runs occur.
