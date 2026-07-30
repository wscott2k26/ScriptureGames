# Scripture Games TestFlight Readiness

**Release candidate:** RC2 · 1.0.0, build 1  
**Bundle identifier:** `com.willywill.scripturegames`  
**Expo owner:** `wscott2k26`  
**Target:** iPhone and Android internal testing

## Source and product gates completed

- [x] Complete local-first source restored and packaged
- [x] Full Genesis Tournament Season One implemented
- [x] Three factions and ten ordered trials
- [x] 62 Genesis tournament questions
- [x] First-clear reward and replay protection
- [x] Daily Scripture Trial with idempotent rewards
- [x] Command Center and 12-achievement hall
- [x] Five-tab full-app navigation
- [x] 168 training questions across 15 topics
- [x] 15 Explorer/Scholar stories
- [x] 13 WEB Classic memory passages
- [x] Three word-puzzle sets and daily devotionals
- [x] Curated local Bible Companion with history clearing and safety boundaries
- [x] Local leaderboard with no fabricated users
- [x] Family Hub with child profiles, switching, and seven-day activity
- [x] Profile, haptic, cinematic-text, and motion settings
- [x] Scoped Genesis reset and confirmation-gated full data deletion
- [x] Local assets, icon, splash, favicon, and 11 Genesis backgrounds
- [x] iOS privacy-manifest declarations for current local-first behavior
- [x] Production EAS build and submit profiles
- [x] Offline release audit and functional-logic checks
- [x] No embedded API keys, tokens, private keys, or real `.env` files
- [x] Local database, Genesis progress, and Daily Trial writes serialized against concurrent-save loss
- [x] Corrupt local records preserved to recovery backup keys before safe reset
- [x] Recoverable startup error screen without silent player-selection deletion
- [x] Bundled celebration animation replaces an avoidable unverified compatibility dependency
- [x] Development build includes Expo Dev Client
- [x] EAS build images use maintained `latest` workers
- [x] Live support and privacy pages deployed and verified at `scripture-games-support.vercel.app`

## Mandatory connected gates

The following require package registries, Expo services, signing credentials, store accounts, or physical devices and are not certified by the offline source audit:

- [ ] Install dependencies from a clean checkout
- [ ] Run Expo Doctor
- [ ] Run the project’s strict TypeScript check using installed SDK types
- [ ] Run Expo lint
- [ ] Export both iOS and Android bundles with installed SDK dependencies
- [ ] Link the app to the intended Expo project
- [ ] Confirm the iOS bundle identifier and Android package in the intended developer accounts
- [ ] Produce signed EAS preview builds for iOS and Android
- [ ] Install on at least one physical iPhone and one physical Android device
- [ ] Complete the smoke matrix below
- [ ] Upload the approved build to TestFlight and Google Play internal testing
- [ ] Confirm store privacy/data-safety answers against the exact submitted binary
- [ ] Complete internal testing and any required beta review

## Physical-device smoke matrix

### First launch and player management

- [ ] Clean install opens cinematic onboarding
- [ ] New Explorer and Scholar players can be created
- [ ] All three factions can be selected
- [ ] Returning-player selection works
- [ ] Player selection survives force-close and relaunch
- [ ] Profile name, emblem, and reading path can be edited
- [ ] Choose Another Player preserves saved records

### Genesis Tournament

- [ ] Trial 1 is initially open and Trials 2–10 are locked
- [ ] Completing a trial opens only the next gate
- [ ] Each trial shows its correct briefing, decision, questions, and background
- [ ] Story decisions persist on replay
- [ ] Correct and incorrect answer feedback is clear
- [ ] First clear awards Manna and rank points once
- [ ] Replay does not duplicate rewards
- [ ] A better replay updates the best result
- [ ] App relaunch resumes the correct season state
- [ ] Trial 10 opens the Victory Hall
- [ ] Victory sharing opens the native share sheet

### Daily, Command, and achievements

- [ ] Daily Trial presents five questions
- [ ] First daily clear awards 75 XP, 20 Manna, and 10 rank points once
- [ ] Daily replay increments attempts without duplicate rewards
- [ ] A better daily replay updates the best score
- [ ] Command Center totals update after gameplay
- [ ] Seven-day XP reflects recorded local activity
- [ ] Achievement states update at their thresholds

### Training and archive

- [ ] All 15 training topics open
- [ ] Four answer choices remain readable on a small phone
- [ ] All 15 stories load offline in both reading modes
- [ ] All 13 memory passages can be completed and reset
- [ ] All three word-puzzle sets progress without duplicate taps
- [ ] Daily devotional opens offline
- [ ] Leaderboard includes only real local players and sorts correctly

### Companion and safety

- [ ] Curated Scripture questions return appropriate local responses
- [ ] Unknown questions return the limitation message
- [ ] Self-harm, abuse, and immediate-danger wording returns the safety response
- [ ] Empty messages cannot be sent
- [ ] Input is limited to 1,000 characters
- [ ] Conversation history survives relaunch
- [ ] Clear Conversation removes that player’s saved chat

### Family Hub

- [ ] Family Hub can be created with or without optional email
- [ ] Multiple child profiles can be added
- [ ] Play as Child switches to the correct profile
- [ ] Seven-day activity totals and bars match recorded activity
- [ ] Empty, loading, error, and retry states remain usable

### Accessibility and settings

- [ ] VoiceOver/TalkBack announces major controls understandably
- [ ] Larger text does not hide essential actions
- [ ] System motion setting is respected
- [ ] Reduced Motion stops decorative parallax, transitions, button compression, and confetti
- [ ] Full Motion restores the cinematic presentation
- [ ] Haptic Feedback off suppresses app haptics
- [ ] Cinematic Text Reveal off shows complete briefing text immediately
- [ ] Tappable controls meet sensible touch-target sizes

### Lifecycle, offline, and deletion

- [ ] App works in airplane mode after install
- [ ] Background/resume preserves the active screen where expected
- [ ] No unexpected remote-backend errors occur with remote mode disabled
- [ ] Reset Genesis Season Only preserves classic training records
- [ ] Full-data erase requires confirmation
- [ ] Cancel preserves all records
- [ ] Confirm removes players, family data, chat, settings, Daily Trial state, and Genesis state

## Connected release command sequence

From `frontend/`, after registry access is available:

```bash
corepack enable
yarn install
# Preserve and commit the newly generated yarn.lock before release builds.
yarn audit:content
yarn doctor
yarn typecheck
yarn lint
yarn export:ios
yarn export:android
npx eas-cli login
npx eas-cli init
npx eas-cli build --platform all --profile preview
```

Only after preview builds pass physical-device testing:

```bash
npx eas-cli build --platform all --profile production
npx eas-cli submit --platform ios --profile production
npx eas-cli submit --platform android --profile production
```

Keep `EXPO_PUBLIC_USE_REMOTE_API=false` for this local-first release candidate.

## Future paid release warning

This build has no active payment flow. Before charging for digital content, implement platform-compliant in-app purchases, restore purchases, entitlement validation, subscription disclosures, updated privacy/data-safety forms, and store-review notes. Do not add a web checkout or simulated purchase control inside the mobile app.
