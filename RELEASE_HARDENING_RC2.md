# Scripture Games — Release Hardening RC2

**Candidate:** 1.0.0 (build 1)  
**Date:** July 30, 2026  
**Mode:** Local-first; remote API disabled in preview and production profiles

## What RC2 hardened

### Persistence and recovery

- Serialized local API mutations so concurrent profile, reward, family, progress, and chat writes cannot silently overwrite one another.
- Added per-player serialization for Genesis and Daily Trial state.
- Preserved malformed local records under branded `corrupt_backup` keys before returning to a safe state.
- Expanded full-data deletion to remove every key beginning with `scripture_games_`, including recovery backups and future branded records.
- Added a recoverable startup screen with Retry and Choose a Player Again instead of silently deleting the selected player when restoration fails.

### Build configuration

- Added Expo Dev Client for the EAS development profile.
- Moved EAS iOS and Android workers to the maintained `latest` image selection.
- Made preview Android builds installable APKs.
- Simplified Metro configuration to Expo's supported default rather than importing a transitive package directly.
- Added `.easignore` to keep local artifacts, credentials, and non-native documentation out of build uploads.
- Added explicit iOS and Android export scripts.

### Runtime dependency reduction

- Replaced the third-party confetti package with a bundled Reanimated celebration system.
- The replacement has standard and champion intensities, deterministic particle placement, no touch interception, and no accessibility announcements.
- Celebration screens continue to obey Reduced Motion.

### Accessibility

- Added roles, labels, selected state, and disabled state to puzzle tiles, reading-path selectors, onboarding controls, and close controls that previously depended too heavily on visual context.
- Startup and data-recovery states now provide explicit actions and do not trap the player.

### Store operations

- Deployed the official support site.
- Verified the following production pages return HTTP 200:
  - https://scripture-games-support.vercel.app/
  - https://scripture-games-support.vercel.app/support/
  - https://scripture-games-support.vercel.app/privacy/
- Added App Review notes and Google Play Data Safety preparation documents.

## Verified offline

The final exact candidate must pass four complete runs of:

- Static product/content/configuration audit
- TypeScript/TSX syntax scan
- Strict offline type validation
- Functional persistence, concurrency, reward, and corruption-recovery tests
- Route, import, asset, and structural assertions
- Secret and forbidden-artifact scan

The packaged ZIP is then extracted into a new empty folder and compared file-for-file and SHA-256 hash-for-hash with the verified candidate.

## Still requires connected certification

RC2 is not Production until a clean registry-backed install creates a lockfile and the installed project passes Expo Doctor, Expo lint, SDK-aware TypeScript, iOS and Android exports, signed EAS preview builds, and physical iPhone/Android testing. Store privacy answers must match the exact submitted binaries.
