# Scripture Games RC3 — Cinematic Visual Master

## Release standard

RC3 treats the three Storm and Me visual pillars as hard release gates across every user-facing route. No route may bypass the shared glass, material, touch, motion, or accessibility primitives.

## Pillar 1 — Liquid Glassmorphism

Implemented through `GlassPanel` and the glass tab navigation:

- Native `expo-blur` background blur on iOS, Android, and web-supported paths.
- Android uses Expo BlurView's experimental native blur method.
- Layered translucent gradients, light caustics, edge highlights, and deep shadows.
- Five glass strengths: soft, panel, strong, navigation, and crystal.
- Reduced-transparency fallback replaces blur with high-contrast opaque surfaces.
- Every user-facing route contains at least one shared glass panel.

## Pillar 2 — Tactile Maximalism

Implemented through `MaterialSurface`, `TactileButton`, and `TactilePressable`:

- Original polished-gold, aged-bronze, obsidian-stone, carved-sandstone, and glass-caustic textures.
- Raised faces, lower depth plates, top bevels, bottom bevels, material gradients, and controlled shine.
- Physical press response uses spring-driven vertical compression, scale compression, and subtle perspective rotation.
- Haptic impact feedback routes through the app's guarded sound/haptic service.
- Raw React Native Pressable imports are forbidden outside the two shared tactile primitives.
- Quiz answers, Genesis decisions, puzzle tiles, verse chips, menus, cards, and navigation interactions use tactile primitives.

## Pillar 3 — Immersive Cinematic Pacing

Implemented through `CinematicBackdrop`, global router transitions, and `WordRevealText`:

- Slowly drifting and breathing story landscapes.
- Ambient light sweeps, floating dust, color orbs, and vignette depth.
- Screen content enters with a shared cinematic timing system.
- Story and Genesis briefing text reveal word by word and can be tapped to complete instantly.
- Global navigation uses a consistent fade-from-bottom transition.
- Reduced Motion and Cinematic Text settings apply globally.

## Route coverage

The visual audit discovers every user-facing route and requires both `CinematicBackdrop` and `GlassPanel` in each one, including:

- Safe start and loading
- Onboarding and faction selection
- Tournament journey and all ten Genesis trials
- Question, result, reward, replay, locked, and victory states
- Training, daily challenge, stories, devotional, verse, and puzzles
- Bible Companion
- Achievements and leaderboard
- Family Hub and child creation
- Command Center, premium information, settings, errors, and not-found state

## Approved visual tools

Only these runtime visual tools are approved in RC3:

- React Native + Expo
- React Native Reanimated
- Expo BlurView
- Expo Linear Gradient
- Expo Haptics

Figma remains the design-source tool for future handoff and asset review. Rive is not installed because RC3 does not require a second runtime animation engine. Midjourney, FlutterFlow, Lottie, Skia, Zapier, Make.com, and other duplicate tools are not part of this build.

## Automated enforcement

- `python scripts/audit.py` verifies content and structural integrity.
- `python scripts/audit-visual-master.py` verifies all three visual pillars, route coverage, accessibility fallbacks, texture integrity, and tool boundaries.
- `.github/workflows/quality.yml` performs dependency installation, both audits, Expo Doctor, TypeScript, lint, and iOS/Android bundle exports on GitHub Actions.

## Deterministic asset certification

`scripts/generate-rc3-assets.py` recreates every RC3 material texture, Genesis landscape, story panel, icon, splash asset, devotional image, and placeholder from source-controlled code. GitHub Actions regenerates the assets and fails if any generated binary differs from the committed version. This prevents accidental asset drift and makes the complete visual build reproducible without remote image services.

## GitHub Actions certification

The account-level Actions restriction was removed on July 30, 2026. The included quality workflow now performs the registry-backed gates that cannot run in the offline packaging workspace: dependency installation, Expo Doctor, installed-SDK TypeScript, lint, and both iOS and Android exports. Local four-pass verification remains required before source is promoted to the canonical branch.
