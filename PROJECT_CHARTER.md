# Scripture Games Project Charter

## Product Promise
Enter Scripture, survive the trials, master the Word, and rise through the ranks.

Scripture Games is a premium biblical competition-adventure for iOS and Android. It is not a generic trivia collection and it will not imitate another franchise's names, characters, visual identity, or story world.

## First Release
The first public release is **Genesis Tournament: Season One**.

Required release loop:
1. Cinematic first launch
2. Player profile and faction selection
3. Genesis tournament map
4. Ten connected Genesis trials
5. Story decision before each trial
6. Five-question challenge loop
7. Manna, XP, rank, streak, rewards, and progression
8. Final Genesis Trial
9. Shareable victory result
10. Reliable saved progress and resume

Deferred until the core loop is proven:
- Community wall
- Prayer-request moderation
- Real-time PvP matchmaking
- Additional Bible eras
- Marketplace expansion
- Subscription paywall

## Locked Production Stack
These are the only default tools for the initial release.

### Core
- **React Native + Expo + TypeScript** — iOS and Android application
- **Supabase** — authentication, profiles, cloud progress, database, storage, server functions, and later leaderboards
- **GitHub** — canonical source control, issues, branches, pull requests, and release history
- **EAS Build / Submit** — signed iOS and Android builds and store delivery

### Product Design
- **Figma** — source of truth for screens, components, spacing, typography, colors, interaction states, and developer handoff
- **React Native Reanimated** — normal interface transitions and micro-interactions
- **Rive** — only for a small number of signature animated moments where it clearly improves the experience

### Art and Audio
- **Original commissioned or AI-assisted concept art with human review** — environments, character concepts, faction emblems, maps, and story panels
- **Licensed sound library** — interface sounds, ambience, reward cues, and challenge feedback

### Quality and Operations
- **Sentry** — crash and error reporting before public production
- **PostHog** — privacy-conscious product analytics for onboarding, completion, retention, and funnel decisions
- **RevenueCat** — only when subscriptions are ready; not included in the first gameplay proof

## Locked Premium Experience Doctrine
Every Storm and Me app will use these three experience pillars as part of its design language. Their intensity may vary by product and screen, but none of the three may be ignored.

### 1. Liquid Glassmorphism
Interactive menus, buttons, overlays, and status surfaces should feel like smooth translucent panels of floating glass with thin luminous borders. Background colors, environments, and 3D story scenes should shift and blur naturally beneath the interface as the user scrolls or transitions.

Implementation rules:
- Use glass selectively enough to preserve hierarchy and readability
- Maintain strong contrast, accessible text, and reduced-transparency fallbacks
- Avoid stacking multiple blurry layers that harm performance
- Reserve stronger glow for important states, progress, and rewards

### 2. Tactile Maximalism
Important controls should feel physically touchable through rich materials such as clay, polished metal, gold, carved stone, leather, or other materials suited to the product world. Pressed controls should compress, squish, depress, or rebound through micro-animation and haptic feedback rather than merely changing color or disappearing.

Implementation rules:
- Every major button must have visible pressed, disabled, loading, and success states
- Motion must reinforce the action rather than delay it
- Texture and depth must remain consistent with the app's visual identity
- Reduced-motion settings must be respected

### 3. Immersive Cinematic Pacing
Screens should not abruptly snap between unrelated layouts. Major moments should glide, reveal, dissolve, or transition with intentional pacing. Story backgrounds may drift, breathe, or use subtle parallax while text and choices appear progressively and smoothly.

Implementation rules:
- Cinematic motion is strongest during onboarding, story scenes, milestones, battles, and rewards
- Routine utility screens remain fast and direct
- Word-by-word text animation must be skippable and readable
- Parallax and background motion must be subtle enough to prevent nausea or distraction
- Loading transitions must never hide excessive real wait time

The goal is not decoration for decoration's sake. The goal is an interface that feels alive, premium, responsive, and emotionally connected to the app's world.

## Tools Not Approved by Default
Do not add another builder, backend, automation service, animation engine, analytics platform, or asset subscription unless the existing stack cannot meet a documented requirement.

Not required for the first release:
- FlutterFlow
- Make.com
- Zapier
- ElevenLabs
- Multiple AI image subscriptions
- A second backend
- A second analytics platform
- A web-wrapper conversion

## Visual Direction
**Ancient cinematic competition-adventure**

- Dark sandstone, charcoal, warm parchment, refined gold, and deep midnight blue
- Tactile bronze or carved-stone primary controls
- Glass effects reserved for overlays, not every screen
- Controlled light, dust, atmosphere, depth, and environmental motion
- Clear modern typography and accessible contrast
- Original visual identity; no studio-name prompts or direct imitation

## Definition of Done
A feature is not done because a screen opens.

Every release-critical feature must have:
- Real data or an explicitly labeled local-development fixture
- Working primary and secondary actions
- Loading, empty, error, offline, locked, and success states where applicable
- Accessibility labels, readable contrast, scalable text, and sensible touch targets
- Small-screen and large-screen testing
- Reliable back navigation and resume behavior
- Automated tests for critical logic
- Real-device testing on iOS and Android
- No placeholder copy, dead buttons, or fake production claims

Release stages:
**Prototype → Alpha → Beta → Release Candidate → Production**

Only Production may be described as finished.

## Operating Rules
1. Scripture Games and Almost Human are the two flagship products.
2. New product ideas go into the vault; they do not enter active development.
3. Scripture Games receives the current primary build focus.
4. Almost Human development proceeds after its existing source and backend are safely preserved in a canonical private repository.
5. Viral Laundry and StormAndMeOfficial remain separate web properties and do not consume flagship mobile-development time.
6. GameWise remains preserved and parked until a flagship reaches a real beta milestone.
7. Every major change must preserve a rollback point.
8. No broad redesign begins before the existing source is restored, audited, and backed up.

## Current Build Status
The complete local-first Genesis Tournament: Season One source implementation is now present. The next release gate is dependency-aware validation and native-device testing: clean package installation, Expo Doctor, full TypeScript/lint checks, EAS builds, and physical iOS/Android smoke tests. GitHub Actions remains an account-level support issue, so local and connector-based rollback points must remain in place until CI access returns.