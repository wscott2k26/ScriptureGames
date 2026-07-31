# Scripture Games iOS Cloud Build 6 Result

Date: July 31, 2026

## Final delivery status

- App version: `1.0.0`
- iOS build number: `6`
- Bundle identifier: `com.willywill.scripturegames`
- EAS build ID: `abed5bf6-4e79-4533-b550-1f56ccdc0a23`
- EAS submission ID: `e8b1975a-425d-4781-a710-2334827b662c`
- App Store Connect app ID: `6795368257`
- Build status: **FINISHED**
- EAS submission status: **FINISHED**
- Apple delivery: uploaded successfully to App Store Connect/TestFlight
- TestFlight availability: Apple processing confirmation pending at the time of this record
- Android: intentionally not built for this update
- App Review/public release: not submitted

## Source and release trail

- Cloud-backup feature merge: `a8c36a3f806c09e5a0fb2278e9e2f359497b9eba`
- Build source commit recorded by EAS: `cfa3fa27fcefe6acaf4b68e691e48919ca993a21`
- Guarded iOS workflow run: `30660261832`
- Signed source passed complete Bible audit, cloud security audit, TypeScript, ESLint, Expo Doctor, iOS export, and Android export before merge.

## Included cloud functionality

- Guest/device-only play remains available with no account.
- Optional Scripture Games email/password cloud account.
- Explicit Back Up This Device and Restore Cloud Backup actions.
- Complete Bible remains bundled and usable offline.
- Cloud payload contains Scripture Games local data but excludes cloud credentials and bundled Bible text.
- Local safety snapshot is created before restore.
- Sign-out keeps local data available.
- In-app Delete Cloud Account removes the remote backup and Supabase authentication account.
- Supabase row-level security restricts each account to its own backup.

## Required TestFlight checks

1. Confirm TestFlight shows `Scripture Games 1.0.0 (6)` before installing.
2. Confirm **Continue on This Device** works without signing in.
3. Create a cloud account and back up the current device.
4. Verify bookmarks, highlights, verse notes, sermon notes, progress, profile, and settings remain available.
5. Turn on airplane mode and confirm Bible reading and local play still work.
6. Sign out of cloud backup and confirm local play remains.
7. On a second device, sign in and restore the cloud backup.
8. Confirm the restore warning appears and the restored data matches.
9. Delete the cloud account in-app and confirm the account can no longer sign in while local data remains.

## Public-release boundary

Do not submit build 6 for App Review until the two-device cloud matrix passes and the privacy policy and App Store Connect privacy disclosures are updated for email authentication and cloud-stored user data.
