from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(relative: str, old: str, new: str) -> None:
    path = ROOT / relative
    source = path.read_text(encoding="utf-8")
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"{relative}: expected exactly one literal match, found {count}: {old[:100]!r}")
    path.write_text(source.replace(old, new, 1), encoding="utf-8")


def regex_once(relative: str, pattern: str, replacement: str) -> None:
    path = ROOT / relative
    source = path.read_text(encoding="utf-8")
    updated, count = re.subn(pattern, replacement, source, count=1, flags=re.MULTILINE | re.DOTALL)
    if count != 1:
        raise RuntimeError(f"{relative}: expected exactly one regex match, found {count}: {pattern[:100]!r}")
    path.write_text(updated, encoding="utf-8")


# Classic quiz: preserve the proven Build 16 route contract, but make the visible source
# a real native, finger-sized iPhone target instead of an 11-point animated hit area.
replace_once(
    "frontend/app/quiz-play.tsx",
    "import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';",
    "import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';",
)
replace_once(
    "frontend/app/quiz-play.tsx",
    "import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';\n",
    "",
)
replace_once(
    "frontend/app/quiz-play.tsx",
    '                      testID="quiz-scripture-reference"\n                      onPress={openReference}',
    '                      testID="quiz-scripture-reference"\n                      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}\n                      onPress={openReference}',
)
replace_once(
    "frontend/app/quiz-play.tsx",
    "  feedbackReferenceButton: { alignSelf: 'flex-start', marginTop: 5, marginBottom: 6, borderRadius: radii.sm },",
    "  feedbackReferenceButton: { alignSelf: 'flex-start', minHeight: 44, minWidth: 44, marginTop: 5, marginBottom: 6, marginHorizontal: -8, paddingHorizontal: 8, borderRadius: radii.sm, justifyContent: 'center' },",
)

# Daily Challenge.
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

# Genesis quiz: question metadata, feedback, and result truth all become links.
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

# Verse Memory: the reference in the top-right header becomes a full Scripture link.
replace_once(
    "frontend/app/verse.tsx",
    "import { TactileButton } from '@/src/components/premium/TactileButton';",
    "import { TactileButton } from '@/src/components/premium/TactileButton';\nimport { ScriptureLink } from '@/src/components/ScriptureLink';",
)
replace_once(
    "frontend/app/verse.tsx",
    "        <ScreenHeader back eyebrow=\"VERSE MEMORY\" title={`${verse.reference}`} subtitle={`Passage ${index + 1} of ${verses.length}${verse.translation ? ` · ${verse.translation}` : ''}`} />",
    "        <ScreenHeader\n          back\n          eyebrow=\"VERSE MEMORY\"\n          title=\"Verse Memory\"\n          subtitle={`Passage ${index + 1} of ${verses.length}${verse.translation ? ` · ${verse.translation}` : ''}`}\n          right={<ScriptureLink reference={verse.reference} compact tone=\"muted\" returnLabel=\"Return to Verse Memory\" />}\n        />",
)

# Bible reader accepts both the legacy Build 16 quiz marker and the universal marker.
replace_once(
    "frontend/app/(tabs)/bible.tsx",
    "  const { reference, fromQuiz } = useLocalSearchParams<{ reference?: string; fromQuiz?: string }>();",
    "  const { reference, fromQuiz } = useLocalSearchParams<{ reference?: string; fromQuiz?: string }>();\n  const { fromScriptureLink, returnLabel } = useLocalSearchParams<{ fromScriptureLink?: string; returnLabel?: string }>();",
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
    "        {referenceError ? (\n          <GlassPanel style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: radii.lg, padding: spacing.md }}>\n            <Text accessibilityRole=\"alert\" style={{ color: colors.coral, fontSize: 12.5, lineHeight: 18, fontWeight: '800' }}>{referenceError}</Text>\n          </GlassPanel>\n        ) : null}\n        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps=\"handled\">",
)

# Update the new Build 17 contract to reflect the compatibility-safe quiz implementation
# and actual structured-reference coverage.
replace_once(
    "frontend/scripts/test-build17-universal-scripture-links.ts",
    "const command = read('app/(tabs)/command.tsx');\n",
    "",
)
replace_once(
    "frontend/scripts/test-build17-universal-scripture-links.ts",
    "requireMatch(bible, /const \\{ reference, fromScriptureLink, returnLabel \\} = useLocalSearchParams/,\n  'The Bible screen must accept universal Scripture-link parameters.');",
    "requireMatch(bible, /const \\{ fromScriptureLink, returnLabel \\} = useLocalSearchParams/,\n  'The Bible screen must accept universal Scripture-link parameters.');",
)
replace_once(
    "frontend/scripts/test-build17-universal-scripture-links.ts",
    "  ['Classic Quiz', quiz],\n",
    "",
)
replace_once(
    "frontend/scripts/test-build17-universal-scripture-links.ts",
    "  ['Command Center', command],\n",
    "",
)
regex_once(
    "frontend/scripts/test-build17-universal-scripture-links.ts",
    r"requireMatch\(quiz, /<ScriptureLink[\s\S]*?requireNoMatch\(quiz, /pathname:[\s\S]*?'Classic Quiz must not retain the broken internal group route\.'\);\n",
    "requireMatch(quiz, /hitSlop=\\{\\{ top: 10, right: 10, bottom: 10, left: 10 \\}\\}/,\n  'Classic Quiz source must provide ten-point hit slop.');\nrequireMatch(quiz, /feedbackReferenceButton: \\{[^}]*minHeight: 44[^}]*minWidth: 44/,\n  'Classic Quiz source must provide a 44-point target.');\n",
)

print("Build 17 Scripture-link patch applied successfully.")
