from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(relative: str, old: str, new: str) -> None:
    path = ROOT / relative
    source = path.read_text(encoding="utf-8")
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"{relative}: expected exactly one match, found {count}: {old[:120]!r}")
    path.write_text(source.replace(old, new, 1), encoding="utf-8")


# Classic Quiz now uses the same universal ScriptureLink as the rest of the app.
replace_once(
    "frontend/app/quiz-play.tsx",
    "import { TactileButton } from '@/src/components/premium/TactileButton';",
    "import { TactileButton } from '@/src/components/premium/TactileButton';\nimport { ScriptureLink } from '@/src/components/ScriptureLink';",
)
replace_once(
    "frontend/app/quiz-play.tsx",
    "import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';\n",
    "",
)
replace_once(
    "frontend/app/quiz-play.tsx",
    "  const openReference = () => {\n    if (!checked || !question?.verse) return;\n    router.push({ pathname: '/(tabs)/bible', params: { reference: question.verse, fromQuiz: '1' } });\n  };\n\n",
    "",
)
replace_once(
    "frontend/app/quiz-play.tsx",
    """                {question.verse ? (
                  <>
                    <Pressable
                      accessibilityRole=\"link\"
                      accessibilityLabel={`Open ${question.verse} in Bible`}
                      testID=\"quiz-scripture-reference\"
                      onPress={openReference}
                      style={styles.feedbackReferenceButton}
                    >
                      <Text style={styles.feedbackReference}>Source: {question.verse}</Text>
                    </Pressable>
                    <TactileButton compact variant=\"glass\" label=\"Open in Bible\" icon={<Ionicons name=\"book\" size={17} color={colors.onSurface} />} onPress={openReference} />
                  </>
                ) : null}""",
    """                {question.verse ? (
                  <ScriptureLink
                    reference={question.verse}
                    prefix=\"Source:\"
                    returnLabel=\"Return to Quiz\"
                    testID=\"quiz-scripture-reference\"
                  />
                ) : null}""",
)
replace_once(
    "frontend/app/quiz-play.tsx",
    "  feedbackReferenceButton: { alignSelf: 'flex-start', marginTop: 5, marginBottom: 6, borderRadius: radii.sm },\n  feedbackReference: { color: colors.brandSecondary, fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' },\n",
    "",
)

# Daily Challenge question, feedback, and result references.
replace_once(
    "frontend/app/daily-challenge.tsx",
    "import { TactileButton } from '@/src/components/premium/TactileButton';",
    "import { TactileButton } from '@/src/components/premium/TactileButton';\nimport { ScriptureLink } from '@/src/components/ScriptureLink';",
)
replace_once(
    "frontend/app/daily-challenge.tsx",
    "                  {witnessVerse ? <Text style={styles.witnessVerse}>{witnessVerse}</Text> : null}",
    "                  {witnessVerse ? <ScriptureLink reference={witnessVerse} compact returnLabel=\"Return to Results\" /> : null}",
)
replace_once(
    "frontend/app/daily-challenge.tsx",
    "              {question.verse ? <Text style={styles.reference}>{question.verse}</Text> : null}",
    "              {question.verse ? <ScriptureLink reference={question.verse} compact tone=\"muted\" returnLabel=\"Return to Daily Bread\" /> : null}",
)
replace_once(
    "frontend/app/daily-challenge.tsx",
    "                {question.verse ? <Text style={styles.feedbackReference}>Read it in context: {question.verse}</Text> : null}",
    "                {question.verse ? <ScriptureLink reference={question.verse} prefix=\"Read it in context:\" returnLabel=\"Return to Daily Bread\" /> : null}",
)

# Devotional.
replace_once(
    "frontend/app/devotional.tsx",
    "import { ScreenHeader } from '@/src/components/premium/ScreenHeader';",
    "import { ScreenHeader } from '@/src/components/premium/ScreenHeader';\nimport { ScriptureLink } from '@/src/components/ScriptureLink';",
)
replace_once(
    "frontend/app/devotional.tsx",
    "                  <Text style={styles.reference}>{devo.reference}</Text>",
    "                  <ScriptureLink reference={devo.reference} returnLabel=\"Return to Devotional\" />",
)

# Faith Journey.
replace_once(
    "frontend/app/faith-journey.tsx",
    "import { TactileButton } from '@/src/components/premium/TactileButton';",
    "import { TactileButton } from '@/src/components/premium/TactileButton';\nimport { ScriptureLink } from '@/src/components/ScriptureLink';",
)
replace_once(
    "frontend/app/faith-journey.tsx",
    "            <Text style={styles.reference}>{day.reference}</Text>",
    "            <ScriptureLink reference={day.reference} returnLabel=\"Return to Faith Journey\" />",
)

# Stories devotional card.
replace_once(
    "frontend/app/(tabs)/stories.tsx",
    "import { TactileButton } from '@/src/components/premium/TactileButton';",
    "import { TactileButton } from '@/src/components/premium/TactileButton';\nimport { ScriptureLink } from '@/src/components/ScriptureLink';",
)
replace_once(
    "frontend/app/(tabs)/stories.tsx",
    "                <Text style={styles.devotionalReference}>{devo.reference}</Text>",
    "                <ScriptureLink reference={devo.reference} compact returnLabel=\"Return to Stories\" />",
)

# Genesis quiz gray metadata, feedback, and result truth references.
replace_once(
    "frontend/app/genesis-quiz.tsx",
    "import { TactileButton } from '@/src/components/premium/TactileButton';",
    "import { TactileButton } from '@/src/components/premium/TactileButton';\nimport { ScriptureLink } from '@/src/components/ScriptureLink';",
)
replace_once(
    "frontend/app/genesis-quiz.tsx",
    "                <Text style={styles.truthReference}>{question.reference}</Text>",
    "                <ScriptureLink reference={question.reference} compact returnLabel=\"Return to Genesis Results\" />",
)
replace_once(
    "frontend/app/genesis-quiz.tsx",
    "              <Text style={styles.questionReference}>{question.reference}</Text>",
    "              <ScriptureLink reference={question.reference} compact tone=\"muted\" returnLabel=\"Return to Genesis Trial\" />",
)
replace_once(
    "frontend/app/genesis-quiz.tsx",
    "                <Text style={styles.feedbackReference}>{question.reference}</Text>",
    "                <ScriptureLink reference={question.reference} compact returnLabel=\"Return to Genesis Trial\" />",
)

# Verse Memory top-right reference.
replace_once(
    "frontend/app/verse.tsx",
    "import { TactileButton } from '@/src/components/premium/TactileButton';",
    "import { TactileButton } from '@/src/components/premium/TactileButton';\nimport { ScriptureLink } from '@/src/components/ScriptureLink';",
)
replace_once(
    "frontend/app/verse.tsx",
    "        <ScreenHeader back eyebrow=\"VERSE MEMORY\" title={`${verse.reference}`} subtitle={`Passage ${index + 1} of ${verses.length}${verse.translation ? ` · ${verse.translation}` : ''}`} />",
    """        <ScreenHeader
          back
          eyebrow=\"VERSE MEMORY\"
          title=\"Verse Memory\"
          subtitle={`Passage ${index + 1} of ${verses.length}${verse.translation ? ` · ${verse.translation}` : ''}`}
          right={<ScriptureLink reference={verse.reference} compact tone=\"muted\" returnLabel=\"Return to Verse Memory\" />}
        />""",
)

# Bible destination: exact reference, visible failure, and context-aware return.
replace_once(
    "frontend/app/(tabs)/bible.tsx",
    "  const { reference, fromQuiz } = useLocalSearchParams<{ reference?: string; fromQuiz?: string }>();",
    "  const { reference, fromQuiz, fromScriptureLink, returnLabel } = useLocalSearchParams<{ reference?: string; fromQuiz?: string; fromScriptureLink?: string; returnLabel?: string }>();",
)
replace_once(
    "frontend/app/(tabs)/bible.tsx",
    "  const [loading, setLoading] = useState(true);",
    "  const [loading, setLoading] = useState(true);\n  const [referenceError, setReferenceError] = useState<string | null>(null);",
)
replace_once(
    "frontend/app/(tabs)/bible.tsx",
    "      const requestedLocation = reference ? parseBibleReference(String(reference)) : null;\n      const targetLocation = requestedLocation || next.lastLocation;",
    "      const requestedLocation = reference ? parseBibleReference(String(reference)) : null;\n      setReferenceError(reference && !requestedLocation ? `We could not open ${String(reference)}. Your last Bible location is still available.` : null);\n      const targetLocation = requestedLocation || next.lastLocation;",
)
replace_once(
    "frontend/app/(tabs)/bible.tsx",
    "          right={fromQuiz === '1' ? (",
    "          right={(fromQuiz === '1' || fromScriptureLink === '1') && router.canGoBack() ? (",
)
replace_once(
    "frontend/app/(tabs)/bible.tsx",
    "            <Pressable accessibilityRole=\"button\" accessibilityLabel=\"Return to quiz\" onPress={() => router.back()} style={styles.returnQuizButton}>",
    "            <Pressable accessibilityRole=\"button\" accessibilityLabel={String(returnLabel || (fromQuiz === '1' ? 'Return to Quiz' : 'Return'))} onPress={() => router.back()} style={styles.returnQuizButton}>",
)
replace_once(
    "frontend/app/(tabs)/bible.tsx",
    "              <Text style={styles.returnQuizText}>Return to Quiz</Text>",
    "              <Text style={styles.returnQuizText}>{String(returnLabel || (fromQuiz === '1' ? 'Return to Quiz' : 'Return'))}</Text>",
)
replace_once(
    "frontend/app/(tabs)/bible.tsx",
    "        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps=\"handled\">",
    """        {referenceError ? (
          <GlassPanel style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: radii.lg, padding: spacing.md }}>
            <Text accessibilityRole=\"alert\" style={{ color: colors.coral, fontSize: 12.5, lineHeight: 18, fontWeight: '800' }}>{referenceError}</Text>
          </GlassPanel>
        ) : null}
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps=\"handled\">""",
)

# Rewrite compatibility and universal contracts explicitly instead of brittle regex editing.
(ROOT / "frontend/scripts/test-build16-scripture-navigation.ts").write_text(r'''import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function read(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

function requireMatch(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) throw new Error(message);
}

const quiz = read('app/quiz-play.tsx');
const bible = read('app/(tabs)/bible.tsx');
const link = read('src/components/ScriptureLink.tsx');

requireMatch(quiz, /<ScriptureLink[\s\S]*?reference=\{question\.verse\}[\s\S]*?returnLabel="Return to Quiz"/,
  'Quiz feedback must route its exact graded-question reference through ScriptureLink.');
requireMatch(link, /pathname:\s*'\/bible'[\s\S]*?reference[\s\S]*?fromScriptureLink:\s*'1'/,
  'ScriptureLink must route the exact reference to the public Bible page.');
requireMatch(link, /minHeight:\s*44[\s\S]*?minWidth:\s*44/,
  'The visible Scripture source must provide a finger-sized target.');
requireMatch(bible, /reference \? parseBibleReference\(String\(reference\)\) : null/,
  'The Bible tab must parse the incoming reference before selecting the passage.');
requireMatch(bible, /fromScriptureLink === '1'[\s\S]*?router\.canGoBack\(\)[\s\S]*?router\.back\(\)/,
  'The Bible tab must preserve a Return action for Scripture lookups.');

console.log('Build 16 Scripture-reference navigation contract passed through the universal link system.');
''', encoding="utf-8")

(ROOT / "frontend/scripts/test-build17-universal-scripture-links.ts").write_text(r'''import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function path(relativePath: string) {
  return join(process.cwd(), relativePath);
}

function read(relativePath: string) {
  return readFileSync(path(relativePath), 'utf8');
}

function requireMatch(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) throw new Error(message);
}

function requireNoMatch(source: string, pattern: RegExp, message: string) {
  if (pattern.test(source)) throw new Error(message);
}

const linkPath = 'src/components/ScriptureLink.tsx';
if (!existsSync(path(linkPath))) throw new Error('Build 17 requires a shared ScriptureLink component.');

const link = read(linkPath);
const bible = read('app/(tabs)/bible.tsx');
const quiz = read('app/quiz-play.tsx');
const daily = read('app/daily-challenge.tsx');
const devotional = read('app/devotional.tsx');
const faithJourney = read('app/faith-journey.tsx');
const stories = read('app/(tabs)/stories.tsx');
const genesisQuiz = read('app/genesis-quiz.tsx');
const verse = read('app/verse.tsx');

requireMatch(link, /\bPressable\b/, 'ScriptureLink must use a native Pressable.');
requireNoMatch(link, /TactilePressable/, 'ScriptureLink must not use the animated TactilePressable layer.');
requireMatch(link, /parseBibleReference\(reference\)/, 'ScriptureLink must validate references with the bundled parser.');
requireMatch(link, /pathname:\s*'\/bible'/, 'ScriptureLink must navigate to public /bible.');
requireNoMatch(link, /\/\(tabs\)\/bible/, 'ScriptureLink must not use an internal route-group pathname.');
requireMatch(link, /minHeight:\s*44/, 'ScriptureLink must provide a 44-point height.');
requireMatch(link, /minWidth:\s*44/, 'ScriptureLink must provide a 44-point width.');
requireMatch(link, /hitSlop=\{\{\s*top:\s*10,\s*right:\s*10,\s*bottom:\s*10,\s*left:\s*10\s*\}\}/,
  'ScriptureLink must add ten-point hit slop.');
requireMatch(link, /accessibilityRole="link"/, 'ScriptureLink must identify itself as a link.');
requireMatch(link, /accessibilityState=\{\{ disabled: !valid \}\}/,
  'Invalid references must be accessibly disabled.');
requireMatch(link, /router\.push\(/, 'ScriptureLink must push and preserve origin history.');
requireNoMatch(link, /router\.replace\(/, 'ScriptureLink must not replace the origin.');

requireMatch(bible, /const \{ reference, fromQuiz, fromScriptureLink, returnLabel \} = useLocalSearchParams/,
  'Bible must accept universal Scripture-link parameters.');
requireMatch(bible, /reference \? parseBibleReference\(String\(reference\)\) : null/,
  'Bible must parse the incoming reference.');
requireMatch(bible, /fromScriptureLink === '1'/, 'Bible must recognize universal link navigation.');
requireMatch(bible, /router\.canGoBack\(\)/, 'Bible return must verify stack history.');
requireMatch(bible, /referenceError/, 'Bible must visibly handle invalid references.');

const structuredScreens: Array<[string, string]> = [
  ['Classic Quiz', quiz],
  ['Daily Challenge', daily],
  ['Devotional', devotional],
  ['Faith Journey', faithJourney],
  ['Stories', stories],
  ['Genesis Quiz', genesisQuiz],
  ['Verse Memory', verse],
];
for (const [name, source] of structuredScreens) {
  requireMatch(source, /ScriptureLink/, `${name} must use ScriptureLink.`);
}

requireMatch(quiz, /reference=\{question\.verse\}/, 'Classic Quiz must pass the exact source.');
requireMatch(quiz, /returnLabel="Return to Quiz"/, 'Classic Quiz must label its return path.');
requireNoMatch(quiz, /openReference/, 'Classic Quiz must not retain a separate navigation implementation.');
requireNoMatch(quiz, /pathname:\s*'\/\(tabs\)\/bible'/, 'Classic Quiz must not retain the old group route.');

requireMatch(daily, /reference=\{question\.verse\}/, 'Daily Challenge references must be linked.');
requireMatch(daily, /reference=\{witnessVerse\}/, 'Daily Challenge Witness Card must be linked.');
requireMatch(devotional, /reference=\{devo\.reference\}/, 'Devotional reference must be linked.');
requireMatch(faithJourney, /reference=\{day\.reference\}/, 'Faith Journey reference must be linked.');
requireMatch(stories, /reference=\{devo\.reference\}/, 'Stories devotional reference must be linked.');
requireMatch(genesisQuiz, /reference=\{question\.reference\}/, 'Genesis references must be linked.');
requireMatch(verse, /right=\{<ScriptureLink reference=\{verse\.reference\}/,
  'Verse Memory gray header reference must be linked.');

requireNoMatch(quiz, /<Text[^>]*>Source: \{question\.verse\}<\/Text>/,
  'Classic Quiz source must not remain plain text.');
requireNoMatch(daily, /<Text[^>]*>\{question\.verse\}<\/Text>/,
  'Daily Challenge references must not remain plain text.');
requireNoMatch(genesisQuiz, /<Text style=\{styles\.(?:questionReference|feedbackReference|truthReference)\}>\{question\.reference\}<\/Text>/,
  'Genesis gray, feedback, and result references must not remain plain text.');

console.log('Build 17 universal Scripture-link contract passed.');
''', encoding="utf-8")

print("Build 17 Scripture-link patch applied successfully.")
