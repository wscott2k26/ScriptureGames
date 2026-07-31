# Scripture Games Optional Cloud Backup — 1.1 Candidate

Last updated: July 31, 2026

## Release boundary

This work lives on `feature/optional-cloud-backup-v1-1`. It must not alter or replace the signed 1.0.0 build 5 while physical-device testing is still underway.

Do not merge this branch or create another EAS build until:

1. Build 5 physical-device testing is complete.
2. A dedicated production Supabase project is configured.
3. The migration and account-deletion function are deployed and tested.
4. The privacy policy and App Store privacy answers are updated.
5. The full GitHub quality gate passes.
6. Cloud backup is tested on two separate real devices with a deliberate conflict/restore checklist.

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

## Required Supabase deployment

1. Create a dedicated production Supabase project for Scripture Games.
2. Apply:
   - `supabase/migrations/20260731150000_scripture_game_cloud_backups.sql`
3. Deploy:
   - `supabase/functions/delete-account/index.ts`
4. Confirm email/password authentication is enabled.
5. Configure the Auth site URL and password-reset redirect destination.
6. Add only these public values to the future EAS production environment:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
7. Never expose `SUPABASE_SERVICE_ROLE_KEY` to Expo, EAS public variables, client source, logs, or GitHub secrets used by mobile code. It belongs only in the Supabase Edge Function environment.

## Database security

The backup table:

- uses `auth.users(id)` as its owner key;
- has row-level security enabled;
- allows authenticated users to select, insert, update, and delete only rows where `auth.uid() = user_id`;
- revokes anonymous access;
- deletes the backup automatically when the auth user is deleted.

## Privacy and App Store impact

Before shipping the account-enabled build, update the privacy policy and App Store Connect disclosures to reflect the exact production behavior. The candidate may process:

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

## Two-device test matrix

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

This branch does not trigger an EAS build. Use GitHub validation, local Expo export checks, and backend tests first. Create one new signed build only after all configuration, policy, and two-device tests are ready for a single deliberate release candidate.
