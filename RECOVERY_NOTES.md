# Scripture Games — Recovery Notes

**Recovery date:** July 30, 2026  
**Status:** Clean source foundation for the premium Genesis rebuild. This package is **not** the finished premium app and is **not** certified for store submission yet.

## What was recovered

- Expo SDK 54 / React Native application source
- 10 journey nodes
- 15 quiz topics containing 168 questions
- 15 stories with Kids and Adult reading modes
- 13 World English Bible memory passages
- 3 word-puzzle sets
- Local profiles, progress, badges, streaks, companion, family, devotional, and leaderboard routes
- EAS, iOS privacy-manifest, App Store metadata, support, and privacy scaffolding
- Canonical project charter and locked production stack

## Why the GitHub reconstruction failed

The repository payload was assembled from two incompatible chunk layouts:

- `part-00` through `part-06` are 18,000-byte chunks from an eleven-part split.
- `part-07` through `part-09` are approximately 19,560-byte chunks from a ten-part split.
- The mixed set omits 10,920 Base64 characters from the intended archive.

The resulting gzip stream still produced a structurally readable TAR with the expected uncompressed length, but its CRC was invalid and a localized section of generated content was damaged. The uploaded ZIP was therefore not safe to reconstruct by merely bypassing its hash checks.

## Repairs completed

1. Extracted the readable TAR without trusting the failed gzip CRC.
2. Repaired two localized content corruptions using the surrounding question/story context:
   - Samuel anointing reference restored to `1 Samuel 10:1; 16:13`.
   - David and Goliath adult story opening restored to `1 Samuel 17 presents...`.
3. Parsed all five content collections as valid JSON.
4. Recreated the missing canonical `backend/seed_data.py` from the repaired content.
5. Regenerated `frontend/src/content.generated.ts` from the backend seed and confirmed an exact byte-for-byte round trip.
6. Replaced the tiny broken/missing image payloads with clearly labeled, dimension-valid recovery artwork.

## Artwork boundary

The exact prior production illustrations were **not present intact** in the uploaded encoded payload. The included story panels, app icon, adaptive icon, splash, and favicon are honest recovery assets labeled for replacement. They keep the project structurally testable but are not the final premium art direction.

During the Genesis premium pass, replace them with the approved ancient-cinematic visual system. Do not present the recovery artwork as final store artwork.

## Verification completed

- Offline release audit: **1,411 passed, 0 failed**
- TypeScript/TSX syntax parse: **28 files, 0 syntax errors**
- Python source compilation: passed
- Content round trip: exact match
- JSON and semantic content checks: passed
- Secret-pattern scan: passed through the release audit
- Fresh ZIP extraction and post-package audit: required before delivery and recorded in `RECOVERY_TEST_RESULTS.txt`

## Remaining gates

These still require dependencies, account access, and real devices:

- Clean dependency installation
- Expo Doctor
- Full dependency-aware TypeScript check and lint
- iOS/Android preview builds
- Physical-device gameplay, accessibility, persistence, and offline testing
- Premium Genesis visual redesign
- Store screenshots, support/privacy publication, signing, TestFlight, and Play testing
