# Scripture Games Lumi Real-Answer TestFlight Trigger

Authorized by Will Scott on July 31, 2026.

- Premium faith and voice merge: `0c195133795f23fb0c4a18e221b1d0b845bf4f6e`
- Apple privacy hotfix: `1c79ca18925375f8710866b9f5eb662eeca388ec`
- Lumi real-answer merge: `f25341619acd97db7da875e5949c28dd52e0d129`
- Certified Lumi quality run: `30671665583`
- Confirmed defect in prior candidate: greetings, Bible-book names, and most questions repeated the same canned fallback instead of answering
- Expected corrected iOS build number: 9
- Purpose: one iOS production build and App Store Connect/TestFlight upload containing Faith Journeys, Prayer Garden, visible typed Lumi chat, press-to-talk, spoken replies, optional cloud backup, all-66-book guidance, exact offline Bible-reference answers, major Bible people and life-topic guidance, and honest unknown-answer handling
- Build 8 handling: if its workflow is still active, the existing non-canceling concurrency lock must queue this build behind it; do not run both EAS build steps simultaneously
- Public privacy policy: `https://scripture-games-support.vercel.app/privacy/`
- Android EAS build: intentionally skipped to conserve Expo credits
- App Review/public release: not authorized by this trigger
- Further duplicate EAS builds: prohibited unless build 9 fails before producing a usable binary or physical-device testing identifies a confirmed blocker
