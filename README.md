# Scripture Games — Release-Hardened App Candidate RC2

Scripture Games is a premium biblical competition-adventure for iOS and Android. The app combines a complete Genesis tournament season with training games, story and verse archives, a daily challenge, achievements, local family profiles, and a curated on-device Bible companion.

Built with Expo SDK 54, React Native, TypeScript, Expo Router, Reanimated, and local-first persistence.

## Complete player experience

### Genesis Tournament: Season One

- Cinematic first launch, returning-player selection, and player creation
- Explorer and Scholar reading paths
- Three original factions: Lionguard, Dovebound, and Torchbearers
- Ten sequential Genesis trials spanning Genesis 1–50
- A cinematic briefing and story decision before every trial
- Five-question randomized trial loop with Scripture references and explanations
- 62 reviewed Genesis tournament questions
- Manna, rank points, best scores, first-clear reward protection, and replay handling
- Locked and unlocked gate progression with local resume
- Shareable victory records and a final Genesis Champion Hall

### Full supporting app

- Command Center with player rank, weekly activity, daily mission, and shortcuts
- Daily Scripture Trial with deterministic five-question challenges and idempotent rewards
- Achievement Hall with 12 progress-based honors
- Training Hub with 168 questions across 15 topics
- Story Archive with 15 substantial stories in Explorer and Scholar modes
- 13 World English Bible Classic memory passages
- Three multi-round Bible word-puzzle sets
- Daily devotional with reflection, prayer, and practice
- Curated local Bible Companion with saved per-player history and safety boundaries
- Local leaderboard with no fabricated users
- Family Hub, kid profiles, player switching, and seven-day learning activity
- Player settings for profile editing, haptics, cinematic text, motion, privacy, and data controls
- Not-found, loading, empty, error, offline-ready, locked, replay, success, and destructive-confirmation states

## Premium interaction doctrine

The full app uses the same three design pillars:

1. **Liquid glassmorphism** — layered translucent surfaces with clear contrast and restrained glow.
2. **Tactile maximalism** — material depth, textured environments, haptic feedback, and compressing controls.
3. **Immersive cinematic pacing** — drifting environments, fluid scene transitions, and skippable text reveals.

Reduced-motion, haptic, and cinematic-text preferences apply across the experience.

## Runtime and privacy model

This release candidate is local-first and designed to remain usable offline after installation. Profiles, progress, family records, settings, and companion history are stored on the device. Remote API mode is disabled in preview and production EAS profiles unless intentionally reconfigured.

The build contains no advertising SDK, analytics SDK, active purchase flow, public social wall, or user-generated public content.

## Offline source verification

From the project root:

```bash
python scripts/audit.py
```

After a clean dependency install is possible, run from `frontend/`:

```bash
yarn install
yarn audit:content
yarn doctor
yarn typecheck
yarn lint
yarn export:ios
yarn export:android
```

## Honest release boundary

The full local app source has passed repeated offline content, configuration, asset, TypeScript-target, concurrency, corruption-recovery, functional-logic, import, secret, and package-integrity checks. The official support and privacy site is live at https://scripture-games-support.vercel.app/. It is a **release candidate**, not yet Production.

Production still requires a clean registry-backed dependency installation, Expo Doctor, native export, signed EAS builds, physical iPhone and Android testing, store metadata review, and submission through the owner’s Apple and Google accounts.

See `RELEASE_HARDENING_RC2.md`, `RELEASE_HARDENING_RC2_QA.txt`, `FULL_APP_IMPLEMENTATION.md`, and `TESTFLIGHT_READINESS.md`.

## Cinematic Visual Master RC3

The complete front end now enforces Liquid Glassmorphism, Tactile Maximalism, and Immersive Cinematic Pacing through shared production primitives. See `CINEMATIC_VISUAL_MASTER_RC3.md`. Run `yarn validate` from `frontend` for the full local quality gate.

## RC3 visual review files

- `CINEMATIC_VISUAL_MASTER_RC3.md` — implementation and tool map
- `CINEMATIC_VISUAL_MASTER_RC3_QA.txt` — four-pass verification report
- `docs/previews/visual-review-board.jpg` — six-screen visual review board
- `docs/previews/motion-preview.gif` — short pacing, reveal, press, and victory preview
- `scripts/generate-rc3-assets.py` — deterministic original art and texture generator
