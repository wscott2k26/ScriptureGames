# Scripture Games — Build 22 App Review Notes

App version: 1.0.0  
Release target: Build 22  
Bundle ID: `com.willywill.scripturegames`  
App Store Connect ID: `6795368257`

## Reviewer access

No Scripture Games account, login, invitation code, or special hardware is required. On a clean install, create a local player and proceed through onboarding.

## Free and Premium content

The complete offline Bible reader and the app’s core faith and learning tools remain available without purchase.

Ten complete Bible Journey books are free:

- Genesis
- Exodus
- Leviticus
- Numbers
- Deuteronomy
- Matthew
- Mark
- Luke
- John
- Acts

Scripture Games includes one optional non-consumable In-App Purchase:

- **Display name:** Complete Bible Journey Premium
- **Product ID:** `com.willywill.scripturegames.premium`
- **Purchase model:** One-time lifetime purchase
- **Unlocks:** the remaining 56 Bible Journey book seasons, the full peaceful scene collection, and complete mastery records

There is no subscription, advertising, public social feed, or remote user-generated content.

## Purchase review path

1. Launch Scripture Games and create or select a local player.
2. Open **Complete Bible Journey**.
3. Select any book marked **Premium**, or open the **Premium** screen directly.
4. Confirm that Apple’s localized lifetime price appears.
5. Tap **Unlock Forever** to open Apple’s purchase confirmation sheet.
6. Cancel the sheet to confirm that no Premium access is granted.
7. Tap **Restore Purchase** to restore an eligible purchase made with the same Apple Account.

Premium is app-wide for the current Apple purchase identity. It is not attached to one local player profile, so switching local players does not remove a verified purchase.

## Local-first behavior

Profiles, progress, family profiles, preferences, Daily Bread state, achievements, Bible notes, bookmarks, highlights, sermon notes, prayer entries, and Lumi history remain in application storage on the device. The production EAS profile keeps `EXPO_PUBLIC_USE_REMOTE_API=false`.

The full Bible reader, gameplay content, and bundled visual assets are designed to remain usable in airplane mode after installation. A purchase or fresh restore check requires access to Apple and RevenueCat. Previously verified Premium access is cached by the purchase SDK for continuity and must still be confirmed during the physical TestFlight matrix.

## RevenueCat purchase processing

Build 22 uses RevenueCat to retrieve Apple’s localized price, validate the non-consumable transaction, maintain the `premium` entitlement, and restore purchases.

RevenueCat receives an anonymous App User ID and purchase/transaction information for app functionality. Scripture Games does not intentionally send RevenueCat local player names, optional family email, Bible notes, prayer entries, Lumi messages, quiz answers, bookmarks, highlights, sermon notes, or reading history.

Tracking and advertising are not used.

## Lumi

Lumi uses curated app behavior and guarded Scripture-response systems. It is not a replacement for emergency, medical, legal, mental-health, or pastoral help. Do not enter private or sensitive information.

## Family Hub

Family Hub creates local profiles only. An optional parent email can be stored locally but is not intentionally transmitted by the current Build 22 source configuration.

## Data deletion

Settings includes:

- **Reset Genesis Season Only**, which preserves classic training records.
- **Erase All Scripture Games Data**, which requires confirmation and removes local player, family, settings, Lumi, Genesis, Daily Bread, Bible-study, and recovery records.

Deleting local Scripture Games data does not cancel or erase an App Store purchase. The user can restore an eligible purchase with the same Apple Account.

## General review path

1. Create a local player.
2. Open **Bible** and search for `John 3:16`.
3. Test bookmark, highlight, private note, and native sharing actions.
4. Enable **Church Mode** and save a chapter-linked sermon note.
5. Open **Command** and start the Daily Bread Run.
6. Open **Complete Bible Journey** and verify both a free book and a Premium-marked book.
7. Open **Training**, **Family Hub**, **Lumi**, and **Settings**.
8. Enable Reduced Motion and confirm decorative motion and celebrations stop.
9. Optionally enable airplane mode and relaunch to verify bundled free content.

## In-App Purchase review screenshot

Upload a screenshot captured from the exact processed Build 22 binary showing:

- Premium screen
- Apple localized lifetime price
- Unlock Forever button
- Restore Purchase button
- One-time lifetime purchase disclosure

Do not use a development preview or a screenshot with a hard-coded price.

## Contact and policies

- Support: https://scripture-games-support.vercel.app/support/
- Privacy: https://scripture-games-support.vercel.app/privacy/
- Email: loftlatte25@gmail.com

The privacy policy must disclose RevenueCat’s purchase-processing role before App Review submission.
