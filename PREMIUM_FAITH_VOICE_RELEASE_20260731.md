# Scripture Games Premium Faith + Lumi Voice — TestFlight Release Candidate

Prepared: July 31, 2026  
Target: iOS TestFlight build 7  
Bundle ID: `com.willywill.scripturegames`  
Release scope: TestFlight validation only until the physical-device and privacy gates below pass

## Why this release exists

A market benchmark of leading Bible, prayer, study, audio, and Scripture-game apps showed that Scripture Games was already strong in offline Bible access, cinematic progression, daily challenges, family profiles, notes, achievements, and optional cloud backup. The highest-value gaps were guided faith formation, private prayer continuity, and a dependable typed-and-voice companion.

## Product additions

### Guided Faith Journeys

Four seven-day journeys provide 28 total days of structured discipleship:

- Peace Over Anxiety
- Beautiful Broken Pieces
- Purpose in the Work
- Faith at Home

Each day contains:

- a public-domain World English Bible passage;
- a focused reflection;
- a prayer;
- a concrete action;
- a private journal prompt;
- saved completion progress;
- optional read-aloud through the device voice.

Journey progress and journal responses remain local by default and are included only when the user deliberately creates a cloud backup.

### Private Prayer Garden

- Active prayer requests
- Personal, family, health, work, gratitude, and other categories
- Optional private details
- Answered-prayer history and answer date
- Return-to-praying and deletion controls
- Local-first storage and optional cloud-backup coverage
- No public prayer feed, likes, comments, or discoverability

### Lumi typed-and-voice conversation

- Fixes the physical-device layout where the floating tab bar could cover the typed composer
- Typed input remains visible and available at all times
- Native press-to-talk with explicit microphone and speech-recognition permission
- Recognized text appears in the composer before it is sent
- Enhanced operating-system voice is preferred for spoken replies when available
- Per-message Listen/Stop controls
- Optional automatic voice replies
- Voice preference saved locally
- No microphone recording intentionally persisted by Scripture Games
- Typed chat remains available when permission is denied or speech recognition is unavailable

## Honest Lumi boundary

Lumi’s current knowledge engine is curated and local-first. This release improves how users communicate with Lumi; it does not convert Lumi into an unrestricted generative AI, licensed therapist, emergency service, pastor, or authority on every theological question.

A future generative companion requires a server-side model boundary, source-grounded citations, theological review, crisis-response testing, cost controls, privacy updates, and protection against exposing provider secrets. Do not market the current build as having those capabilities.

## Privacy and App Store changes

The old local-only “no data collected” answer is no longer correct for the cloud-enabled binary.

Potential optional cloud-account data includes:

- name or nickname;
- email address;
- Supabase user ID;
- gameplay content and progress;
- product interaction such as saved reading/progress position;
- prayers, journals, notes, sermon notes, companion text, and other user content;
- potentially sensitive religious or health-related text a user chooses to enter.

All declared collection is for app functionality, linked to the cloud account when backed up, not used for tracking, and not used for advertising or analytics.

Speech boundary:

- the device speech-recognition service converts speech into text;
- Scripture Games does not intentionally save microphone audio;
- the recognized text may become companion history and may be included in optional cloud backup;
- operating-system speech processing may occur on-device or through the device provider’s service, depending on the device and settings.

The repository privacy policy and iOS privacy manifest have been updated. The publicly hosted privacy page must be updated to match before App Review.

## App Review notes addendum

Reviewers can use the complete app without an account by choosing **Continue on This Device**.

Recommended premium review path:

1. Launch as a guest or use an existing local player.
2. Open **Companion**.
3. Confirm the typed composer is visible above the floating tab bar.
4. Type `What does John 3:16 mean?` and send it.
5. Tap **Listen** on Lumi’s response.
6. Tap the microphone, grant microphone and speech-recognition permission, speak a Bible question, and confirm the transcript appears in the composer.
7. Open **Faith Journeys** from Lumi and complete one day with a private reflection.
8. Open **Prayer Garden**, add a request, mark it answered, and return it to active status.
9. Open **Settings → Cloud Backup** to confirm guest use remains optional and in-app cloud-account deletion is available.

No reviewer account is required to test the core app. A temporary cloud test account should be supplied in App Review notes only after the exact build and account-deletion flow pass real-device testing.

## App Store Connect privacy-answer proposal

Verify against the processed binary, then publish comprehensive answers for:

- Contact Info → Email Address → App Functionality → Linked to User → Not Tracking
- Identifiers → User ID → App Functionality → Linked to User → Not Tracking
- User Content → Other User Content → App Functionality → Linked to User → Not Tracking
- User Content → Gameplay Content → App Functionality → Linked to User → Not Tracking
- Usage Data → Product Interaction → App Functionality → Linked to User → Not Tracking
- Sensitive Info → App Functionality → Linked to User → Not Tracking
- Health & Fitness → Health, because the Prayer Garden includes an optional health category and free-form details → App Functionality → Linked to User → Not Tracking

Do not declare Audio Data as developer-collected solely because press-to-talk exists: Scripture Games does not intentionally retain the microphone recording. Re-check the final archive and the operating-system speech provider behavior before publishing the answers.

## Physical-device TestFlight matrix

### Upgrade and navigation

- [ ] Upgrade from build 6 without deleting the app.
- [ ] Confirm existing player, Bible notes, highlights, sermon notes, progress, and cloud session remain.
- [ ] Confirm Companion composer is visible on the smallest available supported iPhone.
- [ ] Confirm the floating tab bar does not overlap the composer when the keyboard is closed.
- [ ] Confirm the composer remains usable when the keyboard opens and closes.

### Typed Lumi chat

- [ ] Send a typed question.
- [ ] Confirm the user message and Lumi response appear.
- [ ] Force-close and confirm conversation history restores.
- [ ] Clear the conversation and confirm only that player’s chat is removed.
- [ ] Confirm the safety disclaimer remains visible.

### Spoken Lumi replies

- [ ] Tap Listen on a Lumi response.
- [ ] Confirm Stop ends playback.
- [ ] Enable automatic voice replies and send another question.
- [ ] Disable automatic voice replies and confirm playback stops.
- [ ] Test with the iPhone silent switch both ways; document device behavior.
- [ ] Test speaker, Bluetooth audio, and interruption by a phone call or another audio app where practical.

### Press-to-talk

- [ ] Tap the microphone and review the exact iOS permission prompts.
- [ ] Grant permission and speak a Bible question.
- [ ] Confirm interim/final transcript appears in the composer.
- [ ] Edit the transcript before sending.
- [ ] Deny permission on a clean install and confirm typed chat still works.
- [ ] Re-enable permission in iOS Settings and test again.
- [ ] Confirm no audio file or recording appears in Scripture Games storage or cloud backup.

### Faith Journeys

- [ ] Open all four journeys.
- [ ] Confirm each has seven days and the expected Scripture/reflection/prayer/action/journal sections.
- [ ] Save a private reflection and complete a day.
- [ ] Move between days and confirm progress/journal persistence.
- [ ] Mark a completed day incomplete.
- [ ] Test read-aloud and Stop.
- [ ] Force-close and relaunch to confirm progress remains.

### Prayer Garden

- [ ] Add one prayer in each category.
- [ ] Verify title and detail limits.
- [ ] Mark a request answered and confirm the date appears.
- [ ] Return it to active status.
- [ ] Delete a request and confirm the warning.
- [ ] Force-close and confirm remaining requests persist.

### Cloud backup across two devices

- [ ] Device A: create journey progress, one journal, one prayer, and one Lumi message.
- [ ] Device A: create or sign in to the cloud account and back up.
- [ ] Device B: restore the same backup.
- [ ] Confirm journey progress, journal, prayer, and companion history restore.
- [ ] Confirm the complete Bible remains available offline.
- [ ] Delete the cloud account inside the app and confirm remote access is removed while local data remains until separately erased.

### Accessibility and safety

- [ ] Test VoiceOver labels for mic, send, Listen/Stop, journey days, prayer tabs, and destructive actions.
- [ ] Test Dynamic Type and Reduced Motion.
- [ ] Confirm kids-mode Lumi safety language remains appropriate.
- [ ] Confirm typed chat remains available without microphone access.
- [ ] Confirm no feature claims Lumi is a therapist, emergency service, pastor, or unrestricted AI.

## Build-credit rule

Create only one iOS production build after the final PR head passes the complete Bible audit, cloud audit, premium audit, content audit, visual audit, Expo Doctor, TypeScript, ESLint, iOS export, and Android export. Android EAS build is intentionally skipped for this TestFlight request.

Do not trigger another iOS build unless the first build fails before producing a usable binary or real-device testing identifies a confirmed native blocker.
