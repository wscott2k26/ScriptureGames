# Scripture Games — Google Play Data Safety Preparation

This document describes the current local-first release candidate only. Reconfirm every answer against the exact signed Android App Bundle before submission.

## Current expected disclosure

### Does the app collect or share required user-data categories?

**Expected answer: No**, based on the current binary design:

- No enabled cloud account or sync
- No analytics or advertising SDK
- No active payment processing
- No location, contacts, camera, microphone, health, financial, browsing, advertising ID, or public social collection
- Local gameplay and family data remain in app storage

A voluntary email sent through the device's email client goes directly to the support mailbox and is handled outside the app's runtime data collection.

### Data sharing

**Expected answer: No.** The current release candidate does not send local gameplay data to advertisers, brokers, or third-party analytics services.

### Security practices

- Data is processed locally in application storage.
- Users can request deletion themselves through the confirmation-gated full-data erase control or uninstall the app.
- No account creation is available, so account-deletion requirements are not applicable to this release.
- HTTPS is used for the public support and privacy pages.

### Children and families

The app includes a local Family Hub. Use truthful target-audience answers in Play Console. Do not claim a child-directed program certification unless every applicable policy and SDK requirement has been separately reviewed.

## Re-review triggers

Rework this document before releasing any of the following:

- Supabase authentication or cloud sync
- Remote AI or companion requests
- Analytics or crash-reporting data collection
- Advertising
- Purchases or subscriptions
- Public profiles, messages, leaderboards, prayer requests, or other user-generated content
- Notifications linked to a remote account
