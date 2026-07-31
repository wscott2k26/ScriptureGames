# Scripture Games iOS Cloud TestFlight Trigger

Authorized by Will Scott on July 31, 2026.

- Certified cloud feature commit: `a8c36a3f806c09e5a0fb2278e9e2f359497b9eba`
- Workflow identity-parser fix: `341652ada11661bbb15725101d71a48a07e4cc52`
- Purpose: one iOS production build and App Store Connect/TestFlight upload for optional cloud-backup testing
- Retry reason: the first workflow stopped before EAS build because EAS CLI 21.4 printed account details after the username; no build or Expo credit was used
- Android build: intentionally skipped to conserve Expo credits
- App Review/public release: not authorized by this trigger
- Duplicate EAS builds: prohibited unless this actual build fails or device testing identifies a confirmed blocker
