# Scripture Games Privacy Policy

**Effective date: August 5, 2026**

Scripture Games is published by Storm And Me LLC. It provides Bible-learning games, Scripture reading and study, guided Faith Journeys, private prayer tools, family profiles, a typed-and-voice Bible companion, and an optional one-time Premium purchase while collecting as little information as reasonably possible.

## Guest and local-first use

A user can choose **Continue on This Device** and use the app without creating a Scripture Games account. The complete public-domain World English Bible and the core Scripture Games experience remain available locally after installation.

The app may store the following information in its private application storage on the device:

- Player name or nickname, avatar, and kids/adult reading mode
- Quiz, tournament, daily challenge, achievement, league, and Faith Journey progress
- Private Faith Journey journal responses
- Bible bookmarks, highlights, verse notes, sermon notes, reading history, and reader preferences
- Private Prayer Garden requests, categories, details, and answered-prayer history
- Optional Family Hub names and optional parent email entered by the user
- Lumi companion questions and conversation history
- App settings, voice-reply preference, and accessibility preferences

This local information is used to provide app features. Users should avoid entering passwords, payment information, government identifiers, precise location, or other information they do not want stored with their Scripture Games data.

## Optional cloud account and backup

Cloud backup is optional. A user who creates a Scripture Games cloud account provides an email address and password to Supabase Auth. Scripture Games stores a user ID so the backup can be associated with the correct account.

When the user deliberately chooses **Back Up This Device**, the app may transmit a Scripture Games snapshot to the production Supabase backend. That snapshot can include the local app information listed above, including user-created prayer entries, journal responses, notes, companion history, family records, and progress. The bundled public-domain Bible text is not uploaded.

The backup table uses row-level security so an authenticated account can access only its own backup. Cloud credentials and authentication session data are excluded from the backup payload. Backup and restore are explicit actions; Scripture Games does not silently merge competing device copies.

## Complete Bible Journey Premium

Scripture Games offers an optional one-time, non-consumable In-App Purchase called **Complete Bible Journey Premium**.

- Apple processes the purchase and payment information. Scripture Games does not receive or store the user’s full payment card or Apple Account credentials.
- RevenueCat provides purchase validation and restoration for Scripture Games.
- RevenueCat receives an anonymous App User ID and purchase-related information such as the product identifier, transaction or entitlement status, and technical information needed to operate and secure the purchase service.
- This information is used for app functionality, including displaying the available product, validating access, preserving the Premium entitlement, preventing fraud, and restoring an eligible purchase.
- Scripture Games does not use RevenueCat for advertising or cross-app tracking and does not intentionally send RevenueCat player names, optional family email, Bible notes, prayer entries, Lumi messages, quiz answers, bookmarks, highlights, sermon notes, or reading history.

Deleting local Scripture Games data or uninstalling the app does not cancel, refund, or erase an App Store purchase. An eligible purchase can be restored through **Restore Purchase** while using the same Apple Account. Refund requests and payment-account matters are handled through Apple.

## Voice input and spoken replies

Lumi provides optional press-to-talk input and spoken replies.

- Scripture Games requests microphone and speech-recognition permission only when the user chooses press-to-talk.
- Spoken words are converted into text using the speech-recognition service available through the device operating system. Depending on the device and its settings, recognition may be processed on the device or by the operating-system provider’s speech service.
- Scripture Games does not intentionally save microphone audio recordings.
- The recognized text becomes the user’s Lumi question and may be stored in local conversation history and included in an optional cloud backup.
- Spoken replies and Bible chapter narration use voices supplied by the device operating system. Scripture Games does not upload the Bible chapter to its own server to generate the device voice.
- Typed chat remains available when microphone permission is declined or speech recognition is unavailable.

Users should review their device provider’s privacy settings and policies for speech-recognition processing.

## Advertising, analytics, tracking, and sale of data

Scripture Games does not include advertising SDKs, advertising tracking, data-broker SDKs, or third-party marketing analytics. RevenueCat is used for purchase functionality, not advertising. We do not sell or rent personal information.

## Children and families

Scripture Games is designed for family use, but a parent or guardian should supervise children’s use of cloud backup, Lumi, prayer entries, journals, and purchases. Parents should use nicknames rather than full legal names and should not allow a child to enter sensitive personal, medical, safety, school, or contact information.

Lumi is not an emergency service, therapist, medical provider, or substitute for a trusted adult, pastor, counselor, or qualified professional. A child who reports danger or abuse should seek immediate help from a trusted adult or emergency service.

## Security

Local app data is stored in the device’s private application storage. Optional cloud backups are stored through Supabase with authenticated ownership and row-level database security. Purchase entitlement information is transmitted to Apple and RevenueCat using their platform security controls. No storage or transmission method can be guaranteed completely secure, so users should enter only information appropriate for an app or optional backup.

## Data retention and deletion

### Delete a cloud account and backup

1. Open **Settings**.
2. Open **Cloud Backup**.
3. Choose **Delete Cloud Account**.
4. Confirm the deletion.

This action removes the Supabase authentication account and its remote Scripture Games backup. Local device data remains until the separate local erase action is used.

### Delete local Scripture Games data

1. Open **Settings** or the Tournament player menu.
2. Choose **Erase All Scripture Games Data** or **Erase All App Data**.
3. Confirm the deletion.

Deleting the app also removes local application data, subject to the device platform’s backup and restore behavior. It does not erase Apple or RevenueCat purchase records needed to validate or restore an eligible transaction.

For questions about RevenueCat-associated purchase data, contact Scripture Games support at the address below. Payment history, refunds, and Apple Account purchase records are managed through Apple.

## Support messages

If a user voluntarily emails support, Storm And Me LLC receives the information included in that message and uses it to respond and troubleshoot. Users should not include passwords, full payment details, or unnecessary sensitive information.

## Changes to this policy

We may update this policy when the app’s features, vendors, or data practices change. The effective date at the top will be revised when material changes are made.

## Contact

Questions about Scripture Games or this policy may be sent to **loftlatte25@gmail.com**.

Public support page: https://scripture-games-support.vercel.app/support/

Published privacy policy: https://scripture-games-support.vercel.app/privacy/
