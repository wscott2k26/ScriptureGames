# Build 17 Universal Scripture Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ad-hoc Scripture-reference text with one reliable, accessible link system that opens the exact offline Bible passage and preserves the originating screen.

**Architecture:** A shared native `ScriptureLink` validates known references and pushes the public `/bible` URL with return metadata. An optional `ScriptureText` links strict references embedded in prose. The Bible tab consumes the common parameters and returns through stack history. A static regression audit verifies touch-target size, public routing, parser use, and coverage of known reference surfaces.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, TypeScript 5.9, bundled World English Bible parser, Node static regression scripts.

## Global Constraints

- Minimum effective touch target: 44 points high and 44 points wide.
- Hit slop: 10 points on every side.
- Navigate to public route `/bible`; do not use `/(tabs)/bible`.
- Validate every destination through `parseBibleReference`.
- Use `router.push`, never `replace`, so origin state remains in history.
- No changes to questions, answer keys, scoring, rewards, Premium, audio, backgrounds, Genesis gameplay, Lumi, profiles, cloud backup, or Kids Mode.
- No EAS build, TestFlight submission, Android cloud build, App Review, merge, or public release without separate explicit authorization.

---

### Task 1: Add the shared Scripture navigation primitive

**Files:**
- Create: `frontend/src/components/ScriptureLink.tsx`
- Test: `frontend/scripts/test-build17-universal-scripture-links.ts`

**Interfaces:**
- Consumes: `parseBibleReference(reference: string)` from `@/src/bible-library`, `useRouter()` from `expo-router`, `sfx.tap()`.
- Produces: `ScriptureLink(props: ScriptureLinkProps)` with `reference`, optional `label`, `prefix`, `returnLabel`, `compact`, `tone`, and `testID`.

- [ ] **Step 1: Write the failing component contract**

```ts
requireMatch(link, /Pressable/,
  'ScriptureLink must use a native Pressable.');
requireMatch(link, /parseBibleReference\(reference\)/,
  'ScriptureLink must validate the reference.');
requireMatch(link, /pathname:\s*'\/bible'/,
  'ScriptureLink must navigate to the public Bible URL.');
requireMatch(link, /minHeight:\s*44/,
  'ScriptureLink must provide a 44-point target.');
requireMatch(link, /hitSlop=\{\{\s*top:\s*10,\s*right:\s*10,\s*bottom:\s*10,\s*left:\s*10\s*\}\}/,
  'ScriptureLink must add 10-point hit slop.');
```

- [ ] **Step 2: Run the test and confirm red**

Run: `cd frontend && node --experimental-strip-types scripts/test-build17-universal-scripture-links.ts`

Expected: failure because `src/components/ScriptureLink.tsx` does not exist.

- [ ] **Step 3: Implement `ScriptureLink`**

```tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { parseBibleReference } from '@/src/bible-library';
import { sfx } from '@/src/sfx';
import { colors, radii, spacing } from '@/src/theme';

export type ScriptureLinkProps = {
  reference: string;
  label?: string;
  prefix?: string;
  returnLabel?: string;
  compact?: boolean;
  tone?: 'brand' | 'muted' | 'light';
  testID?: string;
};

export function ScriptureLink({
  reference,
  label,
  prefix,
  returnLabel = 'Return',
  compact = false,
  tone = 'brand',
  testID,
}: ScriptureLinkProps) {
  const router = useRouter();
  const valid = Boolean(parseBibleReference(reference));
  const text = [prefix, label || reference].filter(Boolean).join(' ');

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={valid ? `Open ${reference} in Bible` : `${reference} is not available`}
      accessibilityState={{ disabled: !valid }}
      disabled={!valid}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      testID={testID}
      onPress={() => {
        if (!valid) return;
        sfx.tap();
        router.push({
          pathname: '/bible',
          params: { reference, fromScriptureLink: '1', returnLabel },
        });
      }}
      style={({ pressed }) => [
        styles.target,
        compact && styles.compact,
        pressed && valid && styles.pressed,
        !valid && styles.disabled,
      ]}
    >
      <View style={styles.row}>
        <Ionicons name="book-outline" size={compact ? 14 : 16} color={toneColor[tone]} />
        <Text style={[styles.text, compact && styles.compactText, { color: toneColor[tone] }]}>{text}</Text>
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 4: Run the focused contract**

Run: `cd frontend && node --experimental-strip-types scripts/test-build17-universal-scripture-links.ts`

Expected: component checks pass; coverage checks remain red.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ScriptureLink.tsx frontend/scripts/test-build17-universal-scripture-links.ts
git commit -m "feat: add accessible Scripture link primitive"
```

### Task 2: Make Bible navigation consume the shared contract

**Files:**
- Modify: `frontend/app/(tabs)/bible.tsx`
- Test: `frontend/scripts/test-build17-universal-scripture-links.ts`

**Interfaces:**
- Consumes params `reference?: string`, `fromScriptureLink?: string`, `returnLabel?: string`.
- Produces exact passage focus and a labeled stack-back action.

- [ ] **Step 1: Extend the failing test**

```ts
requireMatch(bible, /const \{ reference, fromScriptureLink, returnLabel \} = useLocalSearchParams/,
  'Bible must accept the universal link parameters.');
requireMatch(bible, /const requestedLocation = reference \? parseBibleReference\(String\(reference\)\) : null/,
  'Bible must parse the incoming reference.');
requireMatch(bible, /fromScriptureLink === '1'/,
  'Bible must show a return action for universal links.');
requireMatch(bible, /router\.canGoBack\(\)/,
  'Bible return control must verify stack history.');
```

- [ ] **Step 2: Run and confirm red**

Run: `cd frontend && yarn test:build17`

Expected: failure on old `fromQuiz`-only params.

- [ ] **Step 3: Implement the destination contract**

Change params to:

```ts
const { reference, fromScriptureLink, returnLabel } = useLocalSearchParams<{
  reference?: string;
  fromScriptureLink?: string;
  returnLabel?: string;
}>();
```

Add invalid-reference state:

```ts
const [referenceError, setReferenceError] = useState<string | null>(null);
```

During load:

```ts
const rawReference = reference ? String(reference) : '';
const requestedLocation = rawReference ? parseBibleReference(rawReference) : null;
setReferenceError(rawReference && !requestedLocation ? `We could not open ${rawReference}.` : null);
```

Return action:

```tsx
{fromScriptureLink === '1' && router.canGoBack() ? (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={String(returnLabel || 'Return')}
    onPress={() => router.back()}
    style={styles.returnQuizButton}
  >
    <Ionicons name="arrow-back" size={16} color={colors.brand} />
    <Text style={styles.returnQuizText}>{String(returnLabel || 'Return')}</Text>
  </Pressable>
) : <Text style={styles.headerBook}>📖</Text>}
```

Render `referenceError` in a visible card above the reader without changing the restored last location.

- [ ] **Step 4: Run focused test**

Run: `cd frontend && yarn test:build17`

Expected: destination checks pass.

- [ ] **Step 5: Commit**

```bash
git add 'frontend/app/(tabs)/bible.tsx' frontend/scripts/test-build17-universal-scripture-links.ts
git commit -m "fix: open exact passages through public Bible route"
```

### Task 3: Replace quiz and Daily Challenge references

**Files:**
- Modify: `frontend/app/quiz-play.tsx`
- Modify: `frontend/app/daily-challenge.tsx`
- Test: `frontend/scripts/test-build17-universal-scripture-links.ts`

**Interfaces:**
- Consumes: `ScriptureLink`.
- Produces: finger-sized links in quiz feedback, Daily Challenge question metadata, feedback, and result card.

- [ ] **Step 1: Add red coverage assertions**

```ts
requireMatch(quiz, /<ScriptureLink[\s\S]*reference=\{question\.verse\}[\s\S]*returnLabel="Return to Quiz"/,
  'Classic quiz must use ScriptureLink.');
requireNoMatch(quiz, /pathname:\s*'\/\(tabs\)\/bible'/,
  'Classic quiz must not navigate through an internal group route.');
requireMatch(daily, /<ScriptureLink[\s\S]*reference=\{question\.verse\}/,
  'Daily Challenge question references must be linked.');
requireMatch(daily, /<ScriptureLink[\s\S]*reference=\{witnessVerse\}/,
  'Daily Challenge result reference must be linked.');
```

- [ ] **Step 2: Run and confirm red**

Run: `cd frontend && yarn test:build17`

Expected: failure because both screens still use plain text or local handlers.

- [ ] **Step 3: Replace Classic Quiz source**

Remove the local `openReference` handler and custom tiny pressable. Render:

```tsx
<ScriptureLink
  reference={question.verse}
  prefix="Source:"
  returnLabel="Return to Quiz"
  testID="quiz-scripture-reference"
/>
```

Keep the separate **Open in Bible** button only if it renders `ScriptureLink` in button style; do not maintain a second navigation implementation.

- [ ] **Step 4: Replace Daily Challenge references**

Use `ScriptureLink` for:

```tsx
<ScriptureLink reference={question.verse} compact tone="muted" returnLabel="Return to Daily Bread" />
<ScriptureLink reference={question.verse} prefix="Read it in context:" returnLabel="Return to Daily Bread" />
<ScriptureLink reference={witnessVerse} compact returnLabel="Return to Results" />
```

- [ ] **Step 5: Run focused test and commit**

Run: `cd frontend && yarn test:build17`

```bash
git add frontend/app/quiz-play.tsx frontend/app/daily-challenge.tsx frontend/scripts/test-build17-universal-scripture-links.ts
git commit -m "fix: make quiz Scripture references reliably tappable"
```

### Task 4: Cover devotionals, faith journeys, stories, Genesis quiz, verse, and Home

**Files:**
- Modify: `frontend/app/devotional.tsx`
- Modify: `frontend/app/faith-journey.tsx`
- Modify: `frontend/app/(tabs)/stories.tsx`
- Modify: `frontend/app/genesis-quiz.tsx`
- Modify: `frontend/app/verse.tsx`
- Modify: `frontend/app/(tabs)/command.tsx` if a structured reference is rendered there
- Test: `frontend/scripts/test-build17-universal-scripture-links.ts`

**Interfaces:**
- Consumes: `ScriptureLink`.
- Produces: consistent exact-passage navigation from every known structured reference surface.

- [ ] **Step 1: Add one coverage assertion per screen**

```ts
for (const [name, source] of structuredScreens) {
  requireMatch(source, /ScriptureLink/, `${name} must use ScriptureLink.`);
}
```

Add screen-specific checks that the reference property (`reference`, `verse`, or equivalent) is passed to the component and that the correct return label is used.

- [ ] **Step 2: Run and confirm red**

Run: `cd frontend && yarn test:build17`

Expected: failure listing uncovered screens.

- [ ] **Step 3: Replace structured references**

Examples:

```tsx
<ScriptureLink reference={devotional.reference} returnLabel="Return to Devotional" />
<ScriptureLink reference={day.reference} compact tone="muted" returnLabel="Return to Faith Journey" />
<ScriptureLink reference={story.reference} compact returnLabel="Return to Story" />
<ScriptureLink reference={question.reference} compact tone="light" returnLabel="Return to Genesis Trial" />
```

Do not alter surrounding content, answer logic, images, or progression.

- [ ] **Step 4: Run focused test and commit**

Run: `cd frontend && yarn test:build17`

```bash
git add frontend/app/devotional.tsx frontend/app/faith-journey.tsx 'frontend/app/(tabs)/stories.tsx' frontend/app/genesis-quiz.tsx frontend/app/verse.tsx 'frontend/app/(tabs)/command.tsx' frontend/scripts/test-build17-universal-scripture-links.ts
git commit -m "feat: link Scripture references across app experiences"
```

### Task 5: Add strict prose linking only where needed

**Files:**
- Create: `frontend/src/components/ScriptureText.tsx`
- Modify only approved prose surfaces found by the audit
- Test: `frontend/scripts/test-build17-universal-scripture-links.ts`

**Interfaces:**
- Consumes: `ScriptureLink`, `parseBibleReference`.
- Produces: `ScriptureText({ text, returnLabel, textStyle })`.

- [ ] **Step 1: Write parser tests**

Test that `John 3:16` and `Psalm 23:1-4` link, while `3–5 minutes`, `75 XP`, `1,189 chapters`, and dates do not.

- [ ] **Step 2: Run and confirm red**

Run: `cd frontend && yarn test:build17`

- [ ] **Step 3: Implement strict tokenization**

Use a book-name-first regex, then retain only matches accepted by `parseBibleReference`. Render non-matches as ordinary `Text` and valid matches with compact `ScriptureLink`.

- [ ] **Step 4: Apply only to prose that actually contains embedded references**

Do not replace normal paragraphs that contain no references.

- [ ] **Step 5: Run focused test and commit**

```bash
git add frontend/src/components/ScriptureText.tsx frontend/scripts/test-build17-universal-scripture-links.ts
git commit -m "feat: link validated Scripture references in prose"
```

### Task 6: Wire the permanent regression gate and perform full verification

**Files:**
- Modify: `frontend/package.json`
- Modify: `.github/workflows/quality-gate.yml`
- Create: `frontend/BUILD_17_REGRESSION_REPORT_20260801.md`

**Interfaces:**
- Produces: `yarn test:build17` and complete `yarn validate` coverage.

- [ ] **Step 1: Add scripts**

```json
"test:build17": "node --experimental-strip-types scripts/test-build17-universal-scripture-links.ts"
```

Insert `yarn test:build17` after `yarn test:build16` in `validate` and `eas-build-post-install`.

- [ ] **Step 2: Run focused and full gates**

Run:

```bash
cd frontend
yarn test:build17
yarn validate
```

Expected:

- Build 13–17 contracts pass;
- 66 books, 1,189 chapters, 31,098 verses;
- Journey, runtime, content, visual, Premium, cloud, Lumi, and microphone audits pass;
- Expo Doctor 18/18;
- TypeScript and ESLint pass;
- offline iOS and Android exports pass.

- [ ] **Step 3: Review the exact diff**

Confirm there are no EAS/TestFlight workflows, Android cloud-build triggers, App Review actions, question changes, Premium changes, audio changes, Genesis gameplay changes, or Kids Mode changes.

- [ ] **Step 4: Record evidence**

Create a report containing the verified source SHA, Actions run ID, changed files, all pass counts, protected-scope confirmation, and the explicit no-build boundary.

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json .github/workflows/quality-gate.yml frontend/BUILD_17_REGRESSION_REPORT_20260801.md
git commit -m "test: lock universal Scripture link regressions"
```
