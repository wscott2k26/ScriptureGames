# Scripture Games Build 10 Blinking Recovery TestFlight Trigger

Authorized by Will Scott on August 1, 2026.

- Certified blinking-recovery merge: `ce95b5505f44580b66ff0cc800df09920f9cc776`
- Regression fixed: Build 10 root-level full-screen navigation overlay and unfrozen, always-mounted inactive tabs causing repeated iOS redraws/blinking
- Recovery: restored native Expo Router tabs, detached and froze inactive screens, removed pathname-wide root rerenders, preserved visible Settings
- Expected corrected iOS build number: 11
- Features retained: grounded Lumi answers, guarded Lumi microphone, offline Bible, cloud backup, Settings, Back fallback, motion controls, optional music/SFX/haptics, and sacred headers
- Purpose: one iOS production build with automatic App Store Connect/TestFlight submission for immediate physical-device validation
- Android EAS build: intentionally skipped to conserve Expo credits
- App Review/public release: not authorized by this trigger
- Duplicate EAS builds: prohibited unless build 11 fails before producing a usable binary or physical-device testing identifies a confirmed blocker
