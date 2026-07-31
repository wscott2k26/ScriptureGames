# Scripture Games — Bible & Church Companion 1.0.0

Scripture Games is a premium, local-first biblical competition-adventure for iOS and Android. It combines a complete Genesis tournament, daily faith practice, Bible training games, family profiles, and a complete offline Bible and church companion.

Built with Expo SDK 54, React Native, TypeScript, Expo Router, Reanimated, and local-first persistence.

## Current release status — July 31, 2026

- Certified source: `33635560b79bf127a1f715aa5844a769421ae1af`
- App version: `1.0.0`
- iOS build: `5`
- Bundle identifier: `com.willywill.scripturegames`
- Android preview APK: built successfully
- iOS production binary: built successfully
- App Store Connect/TestFlight upload: successful
- Apple processing and physical-device testing: final external release gates
- Expo included build credits used after this release: 93%; do not rebuild without a real defect or store blocker

See `SIGNED_RELEASE_RESULT_20260731.md` for exact build and submission IDs. See `APP_STORE_SUBMISSION_1.0.0.md` for product-page copy, App Review notes, privacy guidance, screenshot plan, physical-device matrix, and final submission checklist.

## Complete offline Bible and Church Companion

- Complete public-domain World English Bible
- 66 books, 1,189 chapters, and 31,098 verses
- Offline book and chapter navigation
- Exact-reference lookup and full-text keyword search
- Reading history and Continue Where You Left Off
- Bookmarks and four-color highlights
- Private verse notes
- Chapter-linked private sermon notes
- Native verse sharing
- Large-text Church Mode
- Release audit that refuses an incomplete Bible payload

## Daily faith loop

- Daily Bread Run across five rotating Scripture fields
- Faith Flame daily rhythm
- Forgiving Grace Leaves for an interrupted day
- Seed, Lamp, Lion, and Crown seven-day leagues
- Seven-day XP standings
- Scripture references and explanations after answers
- Stronger correct-answer motion and shareable Witness Cards

## Genesis Tournament: Season One

- Cinematic first launch and local player creation
- Explorer and Scholar reading paths
- Lionguard, Dovebound, and Torchbearers factions
- Ten sequential Genesis trials spanning Genesis 1–50
- Briefings and story decisions before every trial
- Randomized five-question trial loops with Scripture context
- First-clear reward and replay protection
- Locked progression, local resume, victory sharing, and Champion Hall

## Supporting experience

- Command Center, daily mission, achievements, and shortcuts
- Training Hub with 168 questions across 15 topics
- Story Archive with 15 Explorer and Scholar stories
- 13 memory passages
- Three multi-round word-puzzle sets
- Daily devotional
- Family Hub, child profiles, player switching, and seven-day activity
- Local leaderboard containing no fabricated users
- Reduced-motion, haptic, cinematic-text, privacy, and data controls

## Privacy model

Scripture Games is local-first and remains usable offline after installation. Profiles, progress, family records, bookmarks, highlights, notes, settings, and activity remain on the device.

Version 1.0.0 contains no advertising SDK, analytics SDK, external AI service, active purchase flow, public social wall, or public user-generated content. Remote API mode is disabled in preview and production EAS profiles.

Support and privacy site: `https://scripture-games-support.vercel.app/`

## Release quality gate

From `frontend/`, the protected quality workflow runs:

```bash
yarn generate:bible
yarn audit:bible
yarn audit:content
yarn audit:visual
yarn doctor
yarn typecheck
yarn lint
yarn export:ios
yarn export:android
```

The July 31 signed release passed Bible generation and integrity checks, content and visual audits, Expo Doctor, TypeScript, ESLint, iOS export, Android export, Android signing, iOS signing, and App Store Connect upload.

## Honest remaining boundary

Do not call version 1.0.0 ready for App Review until Apple finishes processing build 5 and the physical-device matrix in `APP_STORE_SUBMISSION_1.0.0.md` passes on an actual iPhone. Android store release remains separate and requires Play Console internal testing and listing completion.
