# Scripture Games Optional Cloud Backup — TestFlight Candidate

Last updated: July 31, 2026

## Current authorization and boundary

The cloud-backup implementation lives on `feature/optional-cloud-backup-v1-1`. On July 31, 2026, Will authorized one deliberate iOS production build and App Store Connect/TestFlight upload so the feature can be tested on a real device.

This authorization is **for TestFlight testing only**. Do not submit the cloud-enabled build for App Review or public release until:

1. Cloud backup is tested on two separate real devices.
2. Backup, restore, sign-out, offline use, and in-app account deletion pass.
3. The privacy policy is updated for cloud accounts and stored user data.
4. App Store Connect privacy answers are updated from the earlier local-only “no data collected” position.
5. Required screenshots, review notes, support details, and release metadata are complete.

## Deployed production backend

Production project: Supabase project `kingdom-quest` (`ejlmjmjeszvegutdmgcq`). The Scripture Games cloud objects are namespaced separately from the older Kingdom Quest tables.

Completed July 31, 2026:

- production project restored and verified healthy;
- `scripture_game_backups` migration applied;
- optimized row-level security policies applied;
- anonymous access revoked;
- `delete-account` Edge Function deployed with JWT verification enabled;
- public Supabase URL and publishable client key added to EAS development, preview, and production profiles;
- service-role credentials remain only inside Supabase-managed function secrets;
- legacy Kingdom Quest RPCs restricted to signed-in users;
- Scripture Games-specific Supabase performance warnings cleared.

## Product behavior

- Guest play is the default and requires no account.
- The complete World English Bible remains bundled and available offline.
- Cloud backup is optional.
- The app keeps a local copy even when cloud backup is enabled so gameplay, Bible reading, notes, and study remain available without a connection.
- The cloud payload includes only AsyncStorage keys beginning with `scripture_games_` and explicitly excludes cloud credentials and local cloud metadata.
- The bundled Bible text is not uploaded.
- Backup and restore are explicit actions in this first cloud release; there is no silent last-write-wins merge.
- A safety snapshot is saved locally before a cloud restore replaces local Scripture Games data.

## Authentication choice

The candidate uses Scripture Games email/password accounts through Supabase Auth. It does not add Google, Facebook, or another third-party social login. Guest access remains available.

Account creation is optional. The app includes an in-app **Delete Cloud Account** action that deletes the remote backup and Supabase authentication account while clearly explaining that local data remains unless the separate local erase action is used.

## Database security

The backup table:

- uses `auth.users(id)` as its owner key;
- has row-level security enabled;
- allows authenticated users to select, insert, update, and delete only rows where the signed-in user ID matches `user_id`;
- revokes anonymous access;
- deletes the backup automatically when the auth user is deleted.

The account-deletion function requires a valid JWT, resolves the signed-in user from that JWT, deletes only that user’s backup, and then deletes that same authentication account.

## Privacy and App Store impact

Before public release, update the privacy policy and App Store Connect disclosures to reflect the exact production behavior. The candidate may process:

- email address for account authentication;
- user ID for backup ownership;
- player profiles and game progress;
- Bible bookmarks, highlights, verse notes, sermon notes, reading history, settings, and family records contained in the local Scripture Games snapshot;
- technical backup timestamps and a random app-generated device identifier used only to describe the backup source.

The app still contains no advertising SDK and no advertising tracking. Do not continue using the 1.0.0 “no data collected” App Store answer after cloud accounts are enabled.

## App Review notes for the account-enabled version

- Reviewers can use the full app without creating an account by choosing **Continue on This Device**.
- Cloud backup is optional and available from the launch choice and Settings.
- The app remains functional offline after installation.
- Account deletion is available inside Cloud Backup.
- Deleting a cloud account removes the remote account and backup; deleting local device data remains a separate clearly labeled action in Settings.

## Two-device TestFlight matrix

1. Device A: create a guest profile and complete one Genesis trial.
2. Device A: add a bookmark, highlight, verse note, sermon note, and preference change.
3. Device A: create a cloud account and back up.
4. Device B: install fresh, choose Restore Cloud Backup, sign in, and restore.
5. Device B: confirm the profile, progress, notes, bookmark, highlight, and preference appear.
6. Device B: confirm the complete Bible still works in airplane mode.
7. Device B: modify data and create a new backup.
8. Device A: restore only after the replacement warning and confirm the local safety snapshot is created.
9. Sign out and confirm local play continues.
10. Delete the cloud account in-app and verify the auth user and backup row are gone while local play remains.
11. Confirm a deleted account can no longer sign in.
12. Confirm **Erase All Scripture Games Data** clears local data and the saved cloud session without claiming to delete the cloud account.

## Build-credit rule

Use the guarded `.github/workflows/ios-cloud-update.yml` path for one iOS build and TestFlight upload. Do not build Android for this testing request. Do not trigger a second iOS build unless the first build fails or real-device testing identifies a confirmed blocker.
