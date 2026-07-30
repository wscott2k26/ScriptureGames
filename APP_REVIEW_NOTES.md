# Scripture Games — App Review Notes

## Reviewer access

No account, login, invitation code, payment, or special hardware is required. On a clean install, create a local player, select Explorer or Scholar, choose any faction, and enter Trial 1 from the Tournament tab.

## Content access

All release-candidate content is unlocked. There is no active subscription, purchase flow, advertising, public social feed, or remote user-generated content.

## Local-first behavior

Profiles, progress, family profiles, preferences, Daily Trial state, achievements, and Bible Companion history remain in application storage on the device. Preview and production EAS profiles set `EXPO_PUBLIC_USE_REMOTE_API=false`.

The app is intended to work in airplane mode after installation because gameplay content and visual assets are bundled.

## Bible Companion

The Bible Companion uses curated local responses. It does not call a generative AI service in this release. It includes limitation and urgent-safety responses and is not a replacement for emergency, medical, legal, mental-health, or pastoral help.

## Family Hub

Family Hub creates local profiles only. An optional parent email can be stored locally but is not transmitted by the current release candidate.

## Data deletion

Settings includes:

- **Reset Genesis Season Only**, which preserves classic training records.
- **Erase All Scripture Games Data**, which requires confirmation and removes branded local records for players, family data, settings, chat, Genesis, Daily Trial, and recovery backups.

## Review path

1. Create a player and select a faction.
2. Complete Genesis Trial 1.
3. Open Command to review progress.
4. Open Training, Archive, Companion, and Settings.
5. Enable Reduced Motion and confirm decorative motion and celebrations stop.
6. Optionally enable airplane mode and relaunch.

## Contact and policies

- Support: https://scripture-games-support.vercel.app/support/
- Privacy: https://scripture-games-support.vercel.app/privacy/
- Email: loftlatte25@gmail.com
