# Scripture Games Mobile App

Expo SDK 54 / React Native / TypeScript source for the complete local-first Scripture Games release candidate.

## Main routes

- `app/onboarding.tsx` — new and returning players
- `app/faction-select.tsx` — Genesis faction declaration
- `app/(tabs)/journey.tsx` — Genesis Tournament map
- `app/genesis-trial.tsx` and `app/genesis-quiz.tsx` — cinematic trial loop
- `app/season-victory.tsx` — Genesis Champion Hall
- `app/(tabs)/quiz.tsx` — complete Training Hub
- `app/(tabs)/stories.tsx` — Story Archive
- `app/(tabs)/companion.tsx` — curated local Bible Companion
- `app/(tabs)/command.tsx` — Command Center
- `app/daily-challenge.tsx` — deterministic Daily Trial
- `app/achievements.tsx` — 12-achievement hall
- `app/settings.tsx` — profile, accessibility, privacy, and data controls
- `app/family/*` — local Family Hub

## Local development

```bash
yarn install
yarn audit:content
yarn doctor
yarn typecheck
yarn lint
yarn start
```

Remote API mode is disabled unless both `EXPO_PUBLIC_USE_REMOTE_API=true` and `EXPO_PUBLIC_BACKEND_URL` are supplied. The current release candidate is intended to run local-first.
