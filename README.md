# Scripture Games — Bible & Church Companion 1.0.0

Scripture Games is a premium, local-first biblical competition-adventure for iOS and Android. It combines a complete Genesis tournament, daily faith practice, Bible training games, family profiles, and a complete offline Bible and church companion.

Built with Expo SDK 54, React Native, TypeScript, Expo Router, Reanimated, local-first persistence, and optional Supabase cloud backup.

## Current release status — July 31, 2026

- Signed local-first TestFlight build: `1.0.0 (5)`
- Cloud-backup TestFlight candidate: prepared on `feature/optional-cloud-backup-v1-1`
- Bundle identifier: `com.willywill.scripturegames`
- Production Supabase cloud backend: deployed and active
- Optional email/password account, backup, restore, sign-out, and in-app account deletion: implemented
- Guest/device-only play remains the default
- Complete Bible remains bundled for offline use
- Guarded iOS-only TestFlight workflow added to conserve Expo credits
- Cloud-enabled build is for TestFlight testing only until privacy disclosures and two-device validation pass

See `SIGNED_RELEASE_RESULT_20260731.md` for the build-5 record, `APP_STORE_SUBMISSION_1.0.0.md` for the original store package, and `CLOUD_BACKUP_1.1_READINESS.md` for the cloud TestFlight boundary and device matrix.

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

## Optional cloud backup

- Continue on This Device requires no account
- Scripture Games email/password account is optional
- Explicit Back Up This Device and Restore Cloud Backup actions
- Local safety snapshot before restore
- Local play remains available after sign-out or when offline
- Cloud payload is limited to Scripture Games app data and excludes cloud credentials
- Bundled Bible text is not uploaded
- Row-level security isolates each user’s backup
- In-app Delete Cloud Account removes the remote backup and authentication account

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

The app remains local-first and usable offline after installation. Cloud backup is optional and requires a user-created account. Before public App Review, the privacy policy and App Store Connect disclosures must describe email authentication and the exact app data stored in the user’s cloud backup.

The app contains no advertising SDK, advertising tracking, or active purchase flow.

Support and privacy site: `https://scripture-games-support.vercel.app/`

## Release quality gate

From `frontend/`, the protected quality workflow runs:

```bash
yarn generate:bible
yarn audit:bible
yarn audit:cloud
yarn audit:content
yarn audit:visual
yarn doctor
yarn typecheck
yarn lint
yarn export:ios
yarn export:android
```

## Honest remaining boundary

The cloud-enabled build may be uploaded to TestFlight for real-device validation. Do not submit it for public App Review until cloud account creation, backup, cross-device restore, offline behavior, sign-out, and account deletion pass, and the privacy disclosures are updated.
