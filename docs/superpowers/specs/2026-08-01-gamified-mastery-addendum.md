# Gamified Mastery Addendum

Date: 2026-08-01
Status: Approved
Applies to: `2026-08-01-complete-bible-journey-premium-backgrounds-design.md`

## Goal

Add a premium-feeling mastery and retention layer to Scripture Games without changing the rules, questions, rewards, routes, or saved behavior of the existing Genesis Tournament.

This addendum is additive. Existing gameplay remains authoritative.

## Non-destructive boundary

The implementation must not:

- rewrite Genesis trials;
- change Genesis question content or answer keys;
- alter existing Manna, rank, faction, XP, scoring, or first-clear reward rules;
- replace specialized Genesis cinematic backgrounds;
- remove typed Lumi chat, voice safety, Back behavior, native tabs, audio controls, or reduced-motion behavior;
- trigger an EAS build during source development;
- add public posting, open squads, likes, feeds, or moderation-dependent community features;
- use shame, spiritual guilt, fear, or punitive copy to drive retention.

## Intentional feedback motion

### Correct answer

When full motion is enabled, a correct answer may use a short coordinated sequence:

1. the selected answer surface settles into the existing success state;
2. a warm gold/green edge glow appears;
3. the answer surface lifts or gently pops once;
4. a small Scripture-light ripple or sparkle appears;
5. earned XP or Manna may float upward when a reward is actually granted;
6. the explanation and reference remain readable without waiting for the animation.

The sequence must complete quickly, never block the next action, and never alter answer evaluation.

### Incorrect answer

When full motion is enabled, an incorrect answer may use:

- one restrained horizontal shake;
- a calm bronze/red outline;
- immediate display of the correct answer, explanation, and Scripture reference.

Do not use loud alarms, screen-wide flashes, aggressive vibration, glass shattering, or humiliation copy.

### Celebration levels

Use clear intensity tiers:

- Answer: tiny local glow/ripple only.
- Trial completion: existing standard celebration.
- Book completion: stronger book-seal celebration.
- Testament completion: larger milestone celebration.
- All 66 books: highest complete-Bible celebration.

Celebrations must be idempotent and must not replay repeatedly because a screen rerenders.

## Motion preferences

Settings presents three explicit options:

- `Full Experience`: all intentional motion and celebrations.
- `Gentle Motion`: reduced particles, smaller transforms, and calmer transitions.
- `Motion Off`: no decorative movement; state changes remain immediate and understandable.

System Reduce Motion remains respected. System accessibility reduction overrides decorative full-motion choices where required by platform behavior.

No global full-screen animated overlay may be introduced. Inactive tab screens remain detached/frozen according to the stability recovery.

## Faith Rhythm

The existing daily rhythm remains the storage authority and is presented to users as `Faith Rhythm`.

Qualifying activities may include:

- completing the Daily Challenge;
- completing a Bible trial;
- completing a Faith Journey day;
- completing another explicitly approved Bible-learning activity.

Rules:

- One qualifying completion per local calendar day is sufficient.
- Repeated activity on the same day does not duplicate streak credit.
- Grace Leaves continue to protect occasional missed days.
- Existing current streak, best streak, Grace Leaves, milestone rewards, and saved dates remain intact.
- No existing user loses a streak because of the copy or UI migration.

Approved copy direction:

- `Seven days in the Word`
- `Your Faith Rhythm is growing.`
- `A Grace Leaf protected yesterday. Keep walking.`

Forbidden copy direction:

- `You failed God.`
- `Your faith is weak.`
- threatening countdowns;
- shame-based notifications;
- manipulative loss framing.

## Proof of Work

Mastery is represented through durable, private progress evidence:

- completed-trial records;
- best accuracy;
- completed-book seals;
- Old Testament and New Testament progress;
- Genesis Champion record;
- book mastery records;
- Faith Rhythm milestones;
- complete-Bible certificate;
- optional user-initiated share cards.

Proof-of-work records are earned through completed activity, not likes or popularity.

## Zero-wait interaction

The mastery layer must preserve fast response:

- answer state changes immediately;
- explanations render without waiting for decorative motion;
- the next question is prepared before transition where practical;
- local progress updates optimistically only when the existing save path guarantees reconciliation;
- save errors remain visible and never claim success falsely;
- backgrounds are bundled locally and must not require a network request at runtime;
- heavy animation must not run on hidden or frozen screens.

## Visual direction

Enhance the existing sacred material system rather than replacing it:

- warm gold, parchment, stone, bronze, sunrise, olive, lake, and sky tones;
- tactile depth and strong readable borders;
- restrained glow and light effects;
- peaceful imagery behind contrast-safe overlays;
- no generic corporate-blue redesign;
- no casino-like reward presentation.

## Healthy retention safeguards

- Haptics, sound effects, music, and motion remain independently controllable.
- Progress remains playable offline.
- Users can leave and return without punishment.
- Notifications, if added later, must be opt-in and encouraging.
- No infinite reward loop, loot box, paid streak repair, or pay-to-win mechanic.
- Premium unlocks content and atmosphere choices; it does not sell better scores or easier answers.

## Testing additions

The implementation must add deterministic checks for:

- correct-answer feedback does not change correctness or rewards;
- incorrect-answer feedback does not block explanation content;
- answer, trial, book, testament, and complete-Bible celebration tiers are distinct;
- celebration effects fire once per qualifying event;
- Full, Gentle, and Off motion modes produce the expected intensity;
- system Reduce Motion suppresses decorative motion safely;
- Faith Rhythm preserves existing stored streaks and Grace Leaves;
- multiple activities on one day grant only one rhythm completion;
- no forbidden guilt language appears in user-facing strings;
- hidden tabs do not run global decorative overlays;
- all existing Genesis gameplay and runtime stability audits continue to pass.

## Release boundary

This addendum does not authorize an EAS build. Implementation remains on an isolated branch until all source checks, navigation audits, Bible audits, TypeScript, ESLint, Expo Doctor, offline exports, and the four-pass regression report are complete.