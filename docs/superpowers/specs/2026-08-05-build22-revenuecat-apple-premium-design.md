# Build 22 — RevenueCat Apple Premium Design

**Date:** 2026-08-05  
**Status:** Proposed for user review  
**Target app:** Scripture Games 1.0.0  
**Protected physical baseline:** TestFlight Build 21  
**Repository:** `wscott2k26/ScriptureGames`

## 1. Purpose

Connect the existing Complete Bible Journey Premium experience to a real Apple non-consumable in-app purchase without changing the proven Build 21 gameplay, Bible reader, Lumi, audio, navigation, quizzes, profiles, backgrounds, or free-content boundary.

The release target is Build 22. Build 21 remains frozen and available as the rollback baseline.

## 2. Product decision

- **Store product type:** Apple non-consumable
- **Product ID:** `com.willywill.scripturegames.premium`
- **Customer promise:** one lifetime purchase unlocks Complete Bible Journey Premium
- **Entitlement scope:** app-wide on the purchaser's Apple account, not one local player profile
- **RevenueCat entitlement identifier:** `premium`
- **Offering:** one current offering containing one lifetime package
- **Free boundary:** Genesis–Deuteronomy and Matthew–Acts remain free; the other 56 Journey books remain Premium
- **Always free:** complete offline Bible, core quizzes, Lumi, Faith Journeys, Prayer Garden, local profiles, and all features already described as free in Build 21

No subscription, trial, consumable currency, advertising, or recurring charge is included.

## 3. Safety boundaries

1. No changes are made directly on `main`.
2. No EAS build, TestFlight upload, App Review submission, Android signed build, or public release occurs during source implementation.
3. Build 21 source behavior is protected by the full existing validation suite plus new purchase-specific regression tests.
4. Store credentials, private API keys, `.p8` files, RevenueCat secret keys, and Apple passwords are never committed, embedded in the app, pasted into source, or stored in Vercel public environment variables.
5. Only the RevenueCat **public Apple SDK key** may be included in the client build.
6. Premium cannot be unlocked by setting a local boolean or editing a player profile.
7. A failed, cancelled, unavailable, or unverified purchase leaves Premium locked.
8. Existing validated access may continue from RevenueCat's cached entitlement when temporarily offline.

## 4. Architecture

### 4.1 Purchase boundary

Create a small store-neutral adapter so app screens do not import RevenueCat directly.

Proposed files:

- `frontend/src/purchases/purchase-types.ts`
- `frontend/src/purchases/purchase-client.ts`
- `frontend/src/purchases/revenuecat-client.native.ts`
- `frontend/src/purchases/revenuecat-client.web.ts`
- `frontend/src/purchases/premium-provider.tsx`
- `frontend/src/purchases/__tests__/...`

The adapter exposes only:

- `configure()`
- `refreshEntitlements()`
- `getLifetimePackage()`
- `purchaseLifetime()`
- `restorePurchases()`
- `getCustomerCenterStatus()` if supported and useful
- normalized purchase state and normalized errors

The rest of Scripture Games consumes a `PremiumEntitlementProvider`, not RevenueCat APIs.

### 4.2 Entitlement source of truth

`hasPremium` is true only when RevenueCat reports the `premium` entitlement active.

The existing profile fields `is_premium`, `premium_product_id`, `premium_entitlement_source`, and `premium_expires_at` must no longer be authoritative for Apple purchase access. They may be retained temporarily only for migration diagnostics and must not create an unlock.

Premium status is app-wide. Switching between local player profiles does not remove or duplicate the entitlement.

### 4.3 Initialization

At app startup:

1. Load the app shell normally.
2. Configure RevenueCat once on native platforms using the public Apple SDK key.
3. Read cached customer information.
4. Refresh entitlement in the background.
5. Render free content immediately; do not block launch on the network.
6. Update Premium-gated screens when entitlement status resolves.

The web build uses a safe unsupported-store implementation that never charges or unlocks Premium.

### 4.4 Purchase flow

When the user taps **Unlock Complete Bible Journey**:

1. Confirm the store is initialized.
2. Fetch the current lifetime package.
3. Display Apple's native purchase sheet through RevenueCat.
4. On verified active entitlement, update provider state and unlock Premium.
5. On cancellation, return to the screen without alarming error text.
6. On pending, unavailable, network, configuration, or store errors, show a clear non-destructive message.
7. Never create an optimistic unlock before verified entitlement is returned.

### 4.5 Restore flow

When the user taps **Restore Purchase**:

1. Call RevenueCat restore.
2. Re-read customer information.
3. Unlock only if `premium` is active.
4. Otherwise explain that no eligible purchase was found for the signed-in Apple account.

Restore remains visible and usable on the Premium screen.

### 4.6 Identity and privacy

Version 1 uses RevenueCat's anonymous app user identity. No Scripture Games account is required.

The design does not send prayer notes, Bible notes, family names, Lumi messages, quiz answers, or Bible-reading history to RevenueCat. RevenueCat receives only purchase-related identifiers and transaction/entitlement data needed for store functionality.

No Supabase dependency is added to the purchase-critical path. A webhook may be added later for operational reporting, but it cannot be required to unlock content in Build 22.

## 5. Apple and RevenueCat configuration

### 5.1 App Store Connect access

Use a role-based App Store Connect **team API key** with the **App Manager** role. The key is intended for app metadata, screenshots, TestFlight, in-app purchases, pricing, and submission tasks. It must not grant Account Holder authority.

Required secure values:

- issuer ID
- key ID
- downloaded `.p8` private key
- App Store Connect app ID `6795368257`
- bundle ID `com.willywill.scripturegames`

The private key is downloaded once and stored only in a secure credential store or service integration. It is never committed.

### 5.2 Apple product

Create:

- Type: Non-Consumable
- Reference name: Complete Bible Journey Premium
- Product ID: `com.willywill.scripturegames.premium`
- Display name: Complete Bible Journey Premium
- Description: Unlock all 66 Bible Journey book seasons, complete mastery records, and the full peaceful scene collection with one lifetime purchase.
- Availability: intended launch territories for Scripture Games
- Price: selected deliberately before sandbox certification
- Review screenshot: genuine Build 22 Premium screen showing the purchase entry point

### 5.3 RevenueCat

Create or connect:

- Scripture Games project
- iOS app using `com.willywill.scripturegames`
- Apple App Store Connect integration
- Product `com.willywill.scripturegames.premium`
- Entitlement `premium`
- Current offering with one lifetime package
- Public iOS SDK key for the app build

RevenueCat secret keys and Apple private credentials stay server-side in RevenueCat or an approved secret store.

## 6. UI behavior

Keep the current Premium design and copy structure. Change only the store-dependent behavior and any inaccurate disclosure text.

Required states:

- loading store information
- lifetime product available with localized Apple price
- purchase in progress
- purchase cancelled
- purchase pending
- Premium active
- restore in progress
- no purchase found
- store unavailable/configuration error
- temporary network failure

The button must show Apple's localized price before purchase where available. The screen must continue to state what remains free and what Premium unlocks.

Remove the current source-build disclaimer that says billing is not connected once Build 22 is store-enabled.

## 7. Error handling

Normalize store errors into user-safe categories. Do not display raw RevenueCat, StoreKit, receipt, or credential errors.

- **Cancelled:** no unlock; gentle cancellation message or silent return
- **Pending:** no unlock until entitlement becomes active
- **Product missing:** lock Premium and report temporary store configuration issue
- **Network unavailable:** preserve cached active entitlement; otherwise remain locked
- **Restore empty:** remain locked and explain no purchase was found
- **Receipt/verification failure:** remain locked and offer retry/support
- **SDK configuration failure:** remain locked and surface a release-blocking diagnostic in development/CI

## 8. Testing strategy

### 8.1 Unit tests

Mock the purchase adapter and verify:

- active entitlement unlocks Premium
- inactive entitlement keeps Premium locked
- cancellation never unlocks
- pending purchase never unlocks early
- store error never unlocks
- restore success unlocks
- restore empty remains locked
- cached active entitlement works offline
- profile switching does not alter Premium
- local legacy flags cannot unlock Premium
- product ID and entitlement ID remain exact

### 8.2 Existing regression suite

Run the full current validation chain, including:

- complete Bible generation and audit
- cloud and Premium audits
- quiz ordering and Book Mastery
- Build 20 recovery contract
- Lumi engine and voice
- navigation
- Complete Bible Journey
- Build 13–21 protections
- runtime, content, and visual audits
- Expo Doctor
- TypeScript
- ESLint
- local iOS export
- local Android export

No existing test is weakened or deleted to make Build 22 pass.

### 8.3 Native sandbox matrix

After explicit authorization for exactly one Build 22 production build and TestFlight upload:

1. Fresh install with no purchase
2. Product and localized price load
3. Purchase success
4. Premium unlock without restart
5. Force-close and relaunch
6. Airplane-mode access after successful validation
7. Switch local profiles
8. Delete/reinstall app and restore purchase
9. Restore on a second eligible test device/account scenario
10. Cancel purchase
11. Simulate interrupted or pending purchase where Apple supports it
12. Confirm all ten free Journey books remain free before purchase
13. Confirm a Premium-only book is locked before and open after purchase
14. Confirm no duplicate charge path
15. Confirm Support and Privacy links load

## 9. Store listing and policy updates

Before App Review:

- update App Store description to disclose the optional lifetime purchase
- update App Review notes with an exact review path
- update App Privacy answers for purchase data and RevenueCat usage
- update the Vercel privacy/support pages
- capture genuine Build 22 screenshots from the final TestFlight binary
- upload the separate IAP review screenshot
- select Build 22, not an older build
- attach the first in-app purchase to the app-version submission
- confirm Paid Apps Agreement, tax, and banking status manually because only the Account Holder can complete legal agreements

## 10. Release gates

Build 22 may be submitted only when every gate is satisfied:

- design approved
- implementation plan approved
- isolated implementation branch used
- all unit and regression tests pass from the final head commit
- no unrelated source changes
- App Store Connect product exists and matches the exact product ID
- RevenueCat entitlement and offering are correct
- Paid Apps Agreement, banking, and tax are ready
- exactly one authorized EAS iOS build succeeds
- TestFlight sandbox purchase and restore pass on a physical iPhone
- screenshots are captured from that exact binary
- metadata, privacy, age rating, review notes, price, and availability are complete
- user explicitly authorizes App Review submission after seeing the final checklist

## 11. Rollback

If Build 22 fails source validation or physical purchase testing:

- do not merge
- do not submit for App Review
- keep Build 21 available in TestFlight
- fix only on the isolated Build 22 branch
- rerun the entire validation matrix
- do not create another paid EAS build without separate explicit authorization

## 12. Out of scope

- subscriptions
- promotional offers
- consumable currency
- family sharing promises unless Apple configuration and sandbox testing prove support
- Android billing release
- Supabase purchase authority
- web purchases
- analytics expansion
- redesign of existing screens
- unrelated refactors
