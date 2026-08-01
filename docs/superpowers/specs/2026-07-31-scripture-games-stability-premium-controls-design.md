# Scripture Games Stability and Premium Controls Design

## Goal
Restore trustworthy physical-device behavior across the entire app, eliminate the Lumi microphone crash, make navigation predictable, and add user-controlled motion, music, sound, haptics, Settings, Back navigation, and consistent sacred visual branding.

## Confirmed problems
- Pressing Lumi's microphone can terminate the iOS app and invoke TestFlight crash reporting.
- Home/Command navigation was observed returning to the originating screen until after a crash/relaunch, so every literal route and screen transition must be audited rather than relying on bundle export alone.
- Settings exists but is buried inside Command Center instead of being a persistent navigation destination.
- Existing quality gates validate compilation and static content but do not exercise route integrity or reject crash-prone speech-session configuration.

## Root-cause direction
The companion currently starts `expo-speech-recognition` with an explicit iOS `playAndRecord` audio category, measurement mode, Bluetooth options, and voice processing. The library's own iOS troubleshooting guidance warns that it changes the shared audio session and that multimedia/audio playback combinations can crash without careful session coordination. The recovery will use the smallest stable speech-recognition options, pause app audio before recognition, wrap every native call, and restore audio only after end/error.

## Navigation architecture
- Add a visible Settings tab in the persistent bottom navigation.
- Build a route-integrity audit that scans `frontend/app` and validates every literal `router.push`, `router.replace`, and pathname target against real Expo Router files.
- Require a Back affordance on every user-facing non-tab screen, excluding startup/onboarding screens where Back would be misleading.
- Make the shared Back control fall back to Command Center when no native navigation history exists.
- Keep tab navigation stable; Back should not unexpectedly exit or redirect a tab screen.

## Preferences and audio
- Expand saved preferences with `musicEnabled` and `soundEffectsEnabled`; retain `hapticsEnabled`, cinematic text, and `motionMode`.
- Motion modes remain System, Reduced/Off, and Full. Reduced disables decorative entrance/drift/scale animation while preserving essential state changes.
- Add a low-volume, locally bundled soft-piano loop. Music is off by default for existing users during migration and can be enabled in Settings.
- Add short local feedback tones for tap/success/error. Sound effects are off by default for existing users and independently controllable from haptics.
- Music and sound effects must pause before microphone capture and never compete with the iOS speech audio session.
- No background audio entitlement; piano plays only while the app is active.

## Lumi microphone safety
- Remove advanced iOS audio-session overrides and voice-processing flags from the recognition start call.
- Check availability and permissions before start.
- Catch synchronous and asynchronous native errors.
- Prevent double taps while permission/start is pending.
- Abort/stop only when the recognizer reports an active state.
- Pause ambient audio before capture and restore it on end/error/cancel.
- Typed chat remains fully functional when speech recognition is unavailable.

## Sacred visual system
- Add a reusable DoveMark component.
- Shared ScreenHeader includes the dove/sacred mark by default.
- Custom tab headers that do not use ScreenHeader receive the same mark without redesigning their screen hierarchy.
- The mark is decorative, lightweight, and motion-safe.

## Four-pass verification
1. Static integrity: route targets, Back coverage, Settings visibility, preference schema, native permission/config, no forbidden speech options.
2. Behavioral/unit: Lumi answers, microphone state machine, audio pause/resume, preference migration, navigation fallback.
3. Build quality: Bible/cloud/premium/content/visual audits, Expo Doctor, TypeScript, ESLint, iOS and Android offline exports.
4. Release/device checklist: clean install, upgrade install, every tab and home card, every Back path, airplane mode, persistence, cloud restore, mic grant/deny/cancel/use, music/SFX/haptics/motion toggles, force-close/relaunch.

## Release boundary
No EAS/TestFlight build is triggered until all four software verification passes are green. Only one iOS build will be authorized after the exact merged commit is certified. Android EAS remains skipped to conserve credits.