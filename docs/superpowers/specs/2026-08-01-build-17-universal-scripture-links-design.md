# Build 17 Universal Scripture Links — Design

Date: August 1, 2026
Branch: `fix/build-17-universal-scripture-links`

## Goal

Every visible, valid Scripture reference in Scripture Games must be a reliable, finger-sized link that opens the exact passage in the offline Bible reader, where the player can bookmark, highlight, share, or save notes, and then return to the originating experience without losing state.

## Root cause from Build 16

Build 16 wrapped the blue quiz source in a custom pressable, but the target remained roughly the height of 11-point text. The regression test only proved that an `onPress` prop existed in source; it did not validate a usable iPhone touch target or end-to-end navigation. The route also used the internal group-shaped pathname `/(tabs)/bible` instead of the Bible page's public URL `/bible`.

## Architecture

### Shared `ScriptureLink`

Create `frontend/src/components/ScriptureLink.tsx` as the only approved primitive for a known Bible reference.

Interface:

```ts
type ScriptureLinkProps = {
  reference: string;
  label?: string;
  prefix?: string;
  returnLabel?: string;
  compact?: boolean;
  tone?: 'brand' | 'muted' | 'light';
  testID?: string;
};
```

Behavior:

- Validate the reference with the existing bundled `parseBibleReference` function before enabling navigation.
- Navigate through Expo Router to the public URL `/bible` with params:
  - `reference`: exact reference string;
  - `fromScriptureLink`: `1`;
  - `returnLabel`: context-specific label such as `Return to Quiz`.
- Use a native `Pressable`, not the animated `TactilePressable`, to eliminate animation-layer hit-testing uncertainty.
- Enforce a minimum 44-point height and at least 44-point effective width.
- Add `hitSlop={10}` on every side.
- Use `accessibilityRole="link"`, descriptive accessibility text, and disabled state for invalid references.
- Render a small book/link icon so gray or muted references still look interactive.
- Play the normal tap sound only after a valid press.
- Invalid references remain readable but do not silently navigate; they expose an accessible disabled state.

### Optional `ScriptureText`

Create `frontend/src/components/ScriptureText.tsx` for approved long-form copy that may contain one or more references.

- Detect only strict book + chapter + verse patterns that the existing parser validates.
- Preserve all non-reference text.
- Render each validated match through `ScriptureLink`.
- Do not auto-link ordinary numbers, dates, scores, or chapter-only phrases.

### Bible destination

Update `frontend/app/(tabs)/bible.tsx`:

- Accept `reference`, `fromScriptureLink`, and `returnLabel`.
- Parse and open the exact requested book, chapter, and verse.
- Display a return control when `fromScriptureLink === '1'` and navigation history exists.
- Use the supplied return label, falling back to `Return`.
- Keep the existing reader features: bookmark, highlight, notes, sermon notes, sharing, narration, and offline access.
- Show a visible non-blocking message when a supplied reference cannot be parsed instead of silently opening the last location.

## Initial universal coverage

Known structured reference surfaces must use `ScriptureLink`:

1. Classic quiz feedback and source line.
2. Daily Challenge question reference, feedback reference, and Witness Card reference.
3. Devotional reference labels.
4. Faith Journey day references.
5. Story reference labels.
6. Genesis quiz reference labels without changing Genesis questions, scoring, art, or progression.
7. Standalone verse screen references and calls to open the full Bible.
8. Home/Command Center daily verse reference where present.
9. Any small gray reference shown in card headers or top-right metadata on these screens.

Long-form copy may use `ScriptureText` only where a reference is embedded inside prose.

## State preservation

Navigation uses `router.push('/bible', params)` so the originating screen remains in the root stack. Returning uses `router.back()` and must preserve:

- quiz question index;
- selected answer;
- graded right/wrong state;
- score;
- topic and Journey node;
- Daily Challenge progress;
- devotional or Journey day;
- story selection.

No origin screen may be rebuilt with `replace()` for Scripture lookup.

## Visual behavior

- Standard target: minimum 44 points high.
- Compact gray-header target: visually compact text inside a 44-point transparent touch shell.
- Brand tone: gold/blue link treatment.
- Muted tone: gray text plus book/link icon and underline on press/focus.
- Light tone: high-contrast link over photography.
- References remain legible with Reduced Transparency and Reduced Motion enabled.

## Regression protection

Create `frontend/scripts/test-build17-universal-scripture-links.ts` and add it to `yarn validate`.

The contract must verify:

- `ScriptureLink` uses native `Pressable`;
- public pathname is `/bible`, never `/(tabs)/bible`;
- minimum height is at least 44;
- hit slop is at least 10;
- references are validated by `parseBibleReference`;
- invalid references are disabled and visibly handled;
- Bible screen parses incoming references and renders a return action;
- quiz, Daily Challenge, devotional, Faith Journey, stories, Genesis quiz, verse, and Command Center structured references use `ScriptureLink`;
- no listed screen renders its known reference property in plain `<Text>`;
- Build 13–16 contracts continue to pass;
- full content, navigation, visual, TypeScript, ESLint, Expo Doctor, iOS export, and Android export remain green.

## Protected scope

Build 17 must not alter:

- quiz questions, answer keys, scoring, rewards, or progression;
- Premium entitlement logic or free-book boundary;
- piano or sound-effect behavior;
- selected peaceful backgrounds;
- Genesis gameplay, maps, art, Manna, ranks, factions, or Victory Hall;
- Lumi response or microphone behavior;
- profile or cloud-backup data;
- Kids Mode / Explorer Kids Experience.

Kids Mode remains a separate Build 18 project.

## Release boundary

Implementation and source verification are approved. No EAS build, TestFlight submission, Android cloud build, App Review submission, PR merge, or public release occurs unless separately and explicitly authorized after the exact Build 17 source head passes the complete gate.
