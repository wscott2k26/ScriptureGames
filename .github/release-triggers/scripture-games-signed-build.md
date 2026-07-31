# Scripture Games Signed Release Trigger

Requested: July 31, 2026

Certified source: `main` at or after `33635560b79bf127a1f715aa5844a769421ae1af`

Release scope:

- Daily Bread and Faith Flame retention upgrade
- Grace Leaves and seven-day faith leagues
- Complete 66-book offline World English Bible
- Bible search, bookmarks, highlights, verse notes, sharing, and history
- Large-text Church Mode and private sermon notes
- Android preview APK
- iOS production build with automatic TestFlight submission

Retry reason:

- The first signed Android attempt confirmed the complete Bible payload was present.
- Its Post-install hook failed only because the EAS Android image did not provide a `python` alias.
- Certified `main` now uses the fully validated Node Bible audit in that hook.

The signed workflow must generate and audit 66 books, 1,189 chapters, and 31,098 verses before invoking EAS.
