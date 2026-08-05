# Scripture Games — App Store Submission Package

Prepared: August 5, 2026  
App version: 1.0.0  
Release target: Build 22  
Protected rollback baseline: Build 21  
Bundle ID: `com.willywill.scripturegames`  
App Store Connect ID: `6795368257`  
Expo project: `@wscott2k8/scripture-games`  
RevenueCat entitlement: `premium`  
Apple product ID: `com.willywill.scripturegames.premium`

## Current source status

Build 22 source adds a RevenueCat-backed Apple non-consumable lifetime purchase while preserving the Build 21 gameplay and visual structure.

Completed source boundaries:

- legacy release automation quarantined
- `react-native-purchases` pinned to `10.4.4`
- exact RevenueCat dependency tree locked
- unsupported platforms fail closed
- Premium authority removed from local player profiles
- trusted RevenueCat entitlement required for Premium access
- Apple localized price displayed on the Premium screen
- real purchase and Restore Purchase methods connected
- ten free Bible Journey books preserved
- remaining 56 Journey books remain Premium
- Build 22 purchase contract, store audit, Build 15 regression, TypeScript, and ESLint passed in the focused source run

Not yet completed and not represented as complete:

- Apple In-App Purchase record
- RevenueCat dashboard product, entitlement, and offering
- RevenueCat public Apple SDK key in the EAS production environment
- Paid Apps Agreement, banking, and tax verification
- paid iOS Build 22
- TestFlight upload
- physical sandbox purchase matrix
- Build 22 screenshots
- App Review submission

## Release authorization rule

The following are separate gates:

1. Exactly one paid iOS Build 22.
2. Upload that existing binary to TestFlight without rebuilding.
3. Submit the final app version and first In-App Purchase to App Review.

Each gate requires separate explicit authorization. Never use `--auto-submit`, never build Android as part of this iOS release, and never automatically retry a paid build.

## Immutable build rule

After the implementation PR is merged and the full source quality gate passes, record the exact approved `main` SHA. The paid Build 22, TestFlight upload, sandbox matrix, screenshots, and App Review submission must all use that same source SHA. Any source change after the build requires a new review and separate authorization before another paid build.

Before starting a build, inspect the EAS remote iOS build number and verify that the next auto-incremented value will be `22`. Stop on any mismatch.

## Product-page metadata

### Name

Scripture Games

### Subtitle

Play. Learn. Live Scripture.

### Promotional text

Turn Bible study into a daily adventure with Scripture challenges, a complete offline Bible, family-friendly play, Church Mode, sermon notes, and a cinematic journey through all 66 books.

### Description

Use the complete description in `APP_STORE_METADATA.md`. It accurately describes the free/Premium boundary, complete offline Bible, Bible Journey, Genesis Tournament, Daily Bread Run, Church Mode, study tools, family profiles, and local-first data model.

### Keywords

Bible,Scripture,Christian,quiz,trivia,church,devotional,study,Genesis,faith,verse,family,offline

### Categories

Primary: Education  
Secondary: Games — Trivia

### Copyright

© 2026 Storm And Me LLC

## Apple In-App Purchase configuration

### Product

- **Type:** Non-Consumable
- **Reference name:** Complete Bible Journey Premium
- **Product ID:** `com.willywill.scripturegames.premium`
- **Display name:** Complete Bible Journey Premium
- **Description:** Unlock all Journey books and peaceful scenes.

The display name is 30 characters and the description is 45 characters, matching Apple’s current metadata limits.

### Unlock boundary

The one-time lifetime purchase unlocks:

- remaining 56 Bible Journey book seasons
- full peaceful scene collection
- complete mastery records and 66-book completion path

Always free:

- Genesis through Deuteronomy
- Matthew through Acts
- complete 66-book offline Bible reader
- core quizzes and training
- Lumi and core faith tools
- Daily Bread Run
- Church Mode, Bible notes, bookmarks, highlights, and sermon notes
- local player and Family Hub features

### RevenueCat dashboard configuration

- Project: Scripture Games
- Platform: App Store
- Bundle ID: `com.willywill.scripturegames`
- Entitlement ID: `premium`
- Offering ID: `default`
- Package type: Lifetime
- Attached product: `com.willywill.scripturegames.premium`
- Current offering: exactly one lifetime package

Only RevenueCat’s public Apple SDK key may be compiled into the app through `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY`. Secret RevenueCat keys and Apple `.p8` private keys must never be committed, placed in `eas.json`, or pasted into chat.

### App Review information for the purchase

Review notes:

Open Scripture Games, create or select a local player, open Complete Bible Journey, and choose any book marked Premium, or open the Premium screen directly. The screen displays Apple’s localized lifetime price. Tap Unlock Forever to open Apple’s confirmation sheet. Tap Restore Purchase to restore an eligible purchase made with the same Apple Account. No app login is required.

Required review screenshot:

Capture the exact TestFlight Build 22 Premium screen showing the localized price, Unlock Forever button, Restore Purchase button, and one-time lifetime disclosure. Do not use a development preview or hard-coded price.

## App Review notes

Use `APP_REVIEW_NOTES.md`. It contains the exact reviewer path, free/Premium boundary, local-first behavior, RevenueCat data boundary, restore behavior, data deletion explanation, and support contacts.

## App Privacy proposal

Do not reuse the previous “No data collected” answer. Apple requires third-party SDK practices to be included.

Confirm against the exact archived Build 22 privacy manifest and active RevenueCat configuration, then declare at minimum when applicable:

- **Identifiers — User ID:** RevenueCat anonymous App User ID; App Functionality; no tracking.
- **Purchases — Purchase History:** product, transaction, and entitlement information; App Functionality; no tracking.
- **Product Interaction:** include only if the final RevenueCat configuration or generated privacy report shows retained offering, paywall, or purchase interaction events.
- **Tracking:** No.
- **Advertising:** None.
- **Required account:** None.

Local player names, optional family email, Bible notes, prayer entries, Lumi messages, quiz answers, bookmarks, highlights, sermon notes, and reading history are not intentionally sent to RevenueCat by the Build 22 source implementation.

Required Privacy Policy URL: `https://scripture-games-support.vercel.app/privacy/`

The public privacy page must be updated before submission to disclose RevenueCat’s role and the purchase data boundary.

## Encryption and export compliance

`ITSAppUsesNonExemptEncryption` remains `false`. Confirm that the App Store Connect export-compliance answer matches the exact processed binary.

## Age-rating proposal

Answer Apple’s current questionnaire from the exact Build 22 experience. The app contains educational religious content and non-graphic references to death, conflict, judgment, crucifixion, and the flood. It contains no realistic graphic violence, gambling, unrestricted web access, public chat, sexual content, advertising, or recurring subscription. It contains one optional non-consumable In-App Purchase.

Do not choose an age rating by guesswork; let App Store Connect calculate it from the completed questionnaire.

## Screenshot capture plan

Capture clean portrait screenshots from the exact processed TestFlight Build 22. Use the highest-resolution supported iPhone screenshot set accepted by App Store Connect and avoid transparent images, misleading device frames, fake rankings, or hard-coded pricing.

Recommended product-page order:

1. Complete Bible Journey map/library — “Journey Through All 66 Books”
2. Daily Bread Run — “Build a Daily Faith Rhythm”
3. Complete Bible reader — “All 66 Books, Available Offline”
4. Church Mode — “Built for Sunday and Every Day”
5. Search, bookmarks, highlights, and notes — “Study Scripture Your Way”
6. Training Hub — “Learn Through Play”
7. Family Hub and weekly activity — “Grow Together”
8. Achievements or Witness Card — “See Your Progress”
9. Premium screen — “Unlock the Complete Journey Forever”

Also upload the separate In-App Purchase review screenshot described above.

## Physical TestFlight matrix

Perform every item on the exact Build 22 TestFlight binary before App Review.

### Installation and free access

- [ ] Fresh install opens without a development server.
- [ ] No purchase is required during onboarding.
- [ ] Ten free Journey books are accessible.
- [ ] A Premium-marked book remains locked before purchase.
- [ ] The complete Bible reader opens all 66 books before purchase.
- [ ] Genesis 1, Psalm 23, John 3, and Revelation 22 display complete verse text.
- [ ] Exact-reference and keyword search work offline.
- [ ] Force-close and relaunch work in airplane mode for bundled free content.

### Apple purchase and restore

- [ ] Apple’s localized lifetime price appears.
- [ ] The purchase button remains disabled until a valid localized price is available.
- [ ] Unlock Forever opens Apple’s confirmation sheet.
- [ ] Cancelling does not unlock Premium.
- [ ] A successful sandbox purchase unlocks Premium without restarting.
- [ ] The remaining 56 Journey books open after purchase.
- [ ] Premium scenes and mastery records unlock after purchase.
- [ ] Force-close and relaunch preserve verified Premium.
- [ ] Switching local player profiles preserves app-wide Premium.
- [ ] Reinstalling and choosing Restore Purchase recovers an eligible purchase.
- [ ] Pending or interrupted purchases do not unlock early.
- [ ] No duplicate-charge path appears.
- [ ] A temporary network failure does not erase previously verified access.

### Bible study tools

- [ ] Bookmark and unbookmark a verse.
- [ ] Cycle through all four highlight colors and remove the highlight.
- [ ] Save, edit, and delete a private verse note.
- [ ] Save and restore a chapter-linked sermon note.
- [ ] Confirm reading history returns to the last location.
- [ ] Share a verse through the native iOS share sheet.
- [ ] Confirm Church Mode enlarges text without hiding controls.

### Daily, Journey, and gameplay

- [ ] Finish one Daily Bread Run.
- [ ] Confirm answers show Scripture references.
- [ ] Verify daily rewards are granted only once.
- [ ] Force-close mid-run and confirm stable recovery.
- [ ] Verify Faith Flame, Grace Leaf, league, and seven-day XP presentation.
- [ ] Complete or replay one Genesis trial without duplicate rewards.
- [ ] Open one free Journey book and one purchased Journey book.
- [ ] Confirm Scripture-answer links return correctly to the originating quiz.

### Lumi, family, accessibility, and lifecycle

- [ ] Lumi answers common greetings, Bible books, exact references, people, and anxiety-related faith questions appropriately.
- [ ] Press-to-talk permission and fallback behavior remain stable.
- [ ] Family Hub creates and switches local profiles.
- [ ] Test larger Dynamic Type settings.
- [ ] Test VoiceOver on tabs, Bible search, navigation, answer choices, purchase, restore, and save buttons.
- [ ] Test Reduced Motion and haptics-off settings.
- [ ] Background and resume from the Bible reader, quiz, and Premium screen.
- [ ] Confirm no clipped text on the smallest supported iPhone available.

### Privacy and deletion

- [ ] No advertising, tracking prompt, public feed, or required login appears.
- [ ] Support and privacy URLs load publicly without authentication.
- [ ] Local notes and profiles persist after relaunch.
- [ ] Full-data deletion requires confirmation and clears local records.
- [ ] Deleting local data does not falsely claim to cancel the App Store purchase.
- [ ] Restore Purchase remains available after local deletion.
- [ ] Reopen after deletion and confirm clean onboarding.

## Submission checklist

### Business and store readiness

- [ ] Paid Apps Agreement is active.
- [ ] Banking information is complete.
- [ ] Tax information is complete.
- [ ] Apple In-App Purchase key is securely connected to RevenueCat.
- [ ] App Store Connect API access, if used, is narrowly scoped and temporary.
- [ ] The non-consumable product is complete in App Store Connect.
- [ ] RevenueCat product, `premium` entitlement, and `default` lifetime offering are verified.
- [ ] EAS production contains only the RevenueCat public Apple SDK key.

### Binary and testing

- [ ] Full source quality gate passes on the implementation PR.
- [ ] Implementation PR is reviewed and merged.
- [ ] Exact approved `main` SHA is recorded.
- [ ] Remote EAS version check confirms the next build is 22.
- [ ] Exactly one authorized iOS production build succeeds.
- [ ] No Android build is created.
- [ ] The resulting binary is version 1.0.0, build 22, with the correct bundle ID and source SHA.
- [ ] Separate authorization is received for TestFlight upload.
- [ ] The existing Build 22 artifact is uploaded without rebuilding.
- [ ] The physical matrix passes on Build 22.

### Listing and review

- [ ] Privacy policy is updated for RevenueCat.
- [ ] App Privacy answers match the exact binary and third-party SDK configuration.
- [ ] Current age-rating questionnaire is complete.
- [ ] Product-page metadata is entered.
- [ ] Build 22 screenshots are captured and uploaded.
- [ ] In-App Purchase review screenshot is uploaded.
- [ ] App Review contact information is current.
- [ ] App Review notes are pasted.
- [ ] The first non-consumable is attached to version 1.0.0 for review.
- [ ] Correct processed Build 22 is selected.
- [ ] Price and availability are reviewed.
- [ ] Release option is deliberately selected.
- [ ] Separate authorization is received before Submit for Review.

## Android boundary

Android billing and Google Play release are outside Build 22. Do not create an Android cloud build or represent Google Play production as complete during this iOS release.
