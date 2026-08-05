# Build 22 — Apple and RevenueCat Credential Addendum

**Date:** 2026-08-05  
**Applies to:** `2026-08-05-build22-revenuecat-apple-premium-design.md`

This addendum completes the credential and automation boundary for Build 22. Where this addendum is more specific, it controls.

## 1. Why two Apple keys are required

Build 22 uses two distinct Apple integrations:

1. **App Store Connect API team key**
   - Role: App Manager
   - Purpose: app metadata, screenshots, TestFlight data, in-app purchase metadata, pricing, availability, and submission automation
   - Values: issuer ID, key ID, and one-time-download `.p8` private key

2. **Apple In-App Purchase key**
   - Created under Users and Access → Integrations → In-App Purchase
   - Purpose: App Store Server API and server-side purchase validation used by RevenueCat
   - Values: issuer ID, key ID, and one-time-download `.p8` private key

These keys are not interchangeable.

## 2. RevenueCat credentials

RevenueCat receives the Apple credentials through its secure app configuration. The app binary receives only RevenueCat's public Apple SDK key.

A RevenueCat V2 secret API key may be created for controlled project setup automation. It must have only the project-configuration permissions needed to create or inspect the Scripture Games app, product, entitlement, and offering. It must not be bundled in the app.

## 3. Chat access bridge

There is no native App Store Connect connector installed in this ChatGPT session. Apple automation will therefore use a narrowly scoped GitHub Actions bridge calling the official App Store Connect API and, where needed, RevenueCat API V2.

The user adds secrets directly through GitHub's encrypted Actions Secrets interface. Secret values are not pasted into chat and are not committed to the repository.

Proposed GitHub Actions secret names:

- `ASC_ISSUER_ID`
- `ASC_KEY_ID`
- `ASC_PRIVATE_KEY_B64`
- `APPLE_IAP_ISSUER_ID`
- `APPLE_IAP_KEY_ID`
- `APPLE_IAP_PRIVATE_KEY_B64`
- `REVENUECAT_V2_SECRET_KEY`
- `REVENUECAT_APPLE_PUBLIC_SDK_KEY`

The public SDK key may later be promoted into an EAS environment value for the client build. The other values remain server-side only.

## 4. Workflow safety controls

The Apple/RevenueCat workflow must:

- default to read-only inspection
- require an explicit manual dispatch for writes
- require an exact action string for product creation, metadata upload, screenshot upload, or submission
- never create an EAS build
- never submit an app version unless the user separately authorizes App Review submission
- print no secret values
- upload sanitized evidence artifacts
- operate only on App Store Connect app ID `6795368257`
- verify bundle ID `com.willywill.scripturegames` before every write
- verify product ID `com.willywill.scripturegames.premium` before every purchase write
- abort on any mismatch

## 5. Access duration

The App Store Connect team key is temporary automation access. After the first approved release is complete, the user may revoke it and create a new key for future releases. Revocation must not affect customers' completed purchases.

The Account Holder remains responsible for Apple legal agreements, banking, and tax information. Those actions are not delegated to the automation key.
