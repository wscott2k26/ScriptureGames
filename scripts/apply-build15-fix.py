from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding='utf-8')


def write(path: str, content: str) -> None:
    (ROOT / path).write_text(content, encoding='utf-8')


def replace(path: str, old: str, new: str, expected: int = 1) -> None:
    text = read(path)
    actual = text.count(old)
    if actual != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences, found {actual}: {old[:100]!r}')
    write(path, text.replace(old, new))


def append_once(path: str, marker: str, addition: str) -> None:
    text = read(path)
    if marker not in text:
        write(path, text.rstrip() + '\n\n' + addition.strip() + '\n')

append_once(
    'docs/superpowers/specs/2026-08-01-build-15-piano-premium-quiz-backgrounds-design.md',
    '## Post-answer Bible Reference Flow',
    '''## Post-answer Bible Reference Flow

After an ordinary quiz answer is graded, the feedback panel shows the exact Scripture reference and an **Open in Bible** action. The action is unavailable before grading so the challenge remains honest.

Opening the reference pushes the real Bible tab with the passage selected. The Bible tab shows a **Return to Quiz** control when opened from quiz feedback. Returning uses stack navigation so the active question, selected answer, grading feedback, score, and topic remain intact. Opening the Bible never submits, changes, or advances the answer.

This flow remains offline and uses the bundled World English Bible. Missing or unparsable references hide the action rather than blocking the quiz.
'''
)
append_once(
    'docs/superpowers/plans/2026-08-01-build-15-piano-premium-quiz-backgrounds.md',
    '### Approved Addendum: Post-answer Bible Reference Flow',
    '''### Approved Addendum: Post-answer Bible Reference Flow

**Files:**
- Modify: `frontend/app/quiz-play.tsx`
- Modify: `frontend/app/(tabs)/bible.tsx`
- Test: `frontend/scripts/test-build15-piano-premium.ts`

- [ ] Require the exact source reference and `Open in Bible` only after grading.
- [ ] Push `/(tabs)/bible` with `reference` and `fromQuiz=1` route parameters.
- [ ] Resolve the requested reference through the existing offline parser.
- [ ] Show `Return to Quiz` in the Bible header and use stack back navigation.
- [ ] Verify quiz state is not reset, submitted, or advanced by the lookup action.
'''
)

write('frontend/src/premium-entitlement-core.ts', '''import { getJourneyBook } from './bible-journey/catalog.ts';

export const PREMIUM_PRODUCT_ID = 'com.willywill.scripturegames.premium';
export type PremiumEntitlementSource = 'app-store' | 'play-store';

export type PremiumEntitlementClaim = {
  is_premium?: boolean;
  premium_entitlement_source?: PremiumEntitlementSource;
  premium_product_id?: string;
  premium_expires_at?: string;
};

export function hasValidatedPremiumEntitlement(
  profile: PremiumEntitlementClaim | null | undefined,
): boolean {
  if (!profile?.is_premium) return false;
  if (profile.premium_product_id !== PREMIUM_PRODUCT_ID) return false;
  if (profile.premium_entitlement_source !== 'app-store' && profile.premium_entitlement_source !== 'play-store') return false;
  if (!profile.premium_expires_at) return true;
  const expiresAt = Date.parse(profile.premium_expires_at);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function canAccessJourneyBook(bookId: string, hasPremium: boolean): boolean {
  const book = getJourneyBook(bookId);
  if (!book) return false;
  return book.access === 'free' || hasPremium;
}
''')

replace('frontend/src/profile-context.tsx', "  is_premium?: boolean;\n  premium_expires_at?: string;", "  is_premium?: boolean;\n  premium_entitlement_source?: 'app-store' | 'play-store';\n  premium_product_id?: string;\n  premium_expires_at?: string;")
replace('frontend/src/premium-entitlement.tsx', "import { PREMIUM_PRODUCT_ID } from './premium-entitlement-core';", "import { PREMIUM_PRODUCT_ID, hasValidatedPremiumEntitlement } from './premium-entitlement-core';")
replace('frontend/src/premium-entitlement.tsx', '  const hasPremium = Boolean(profile?.is_premium);', '  const hasPremium = hasValidatedPremiumEntitlement(profile);')

replace('frontend/src/local-api.ts', "import { JOURNEY_NODES, PUZZLES, QUIZ_QUESTIONS, STORIES, VERSES } from './content.generated';", "import { JOURNEY_NODES, PUZZLES, QUIZ_QUESTIONS, STORIES, VERSES } from './content.generated';\nimport { hasValidatedPremiumEntitlement } from './premium-entitlement-core';")
replace('frontend/src/local-api.ts', "  is_premium: boolean;\n  premium_expires_at?: string;", "  is_premium: boolean;\n  premium_entitlement_source?: 'app-store' | 'play-store';\n  premium_product_id?: string;\n  premium_expires_at?: string;")
replace('frontend/src/local-api.ts', "function cloneDb(): LocalDb {\n  return JSON.parse(JSON.stringify(EMPTY_DB));\n}\n\nasync function readDb(): Promise<LocalDb> {", "function cloneDb(): LocalDb {\n  return JSON.parse(JSON.stringify(EMPTY_DB));\n}\n\nfunction normalizeLegacyPremiumProfile(profile: Profile): Profile {\n  if (hasValidatedPremiumEntitlement(profile)) return profile;\n  const { premium_entitlement_source: _source, premium_product_id: _product, premium_expires_at: _expires, ...rest } = profile;\n  return { ...rest, is_premium: false };\n}\n\nasync function readDb(): Promise<LocalDb> {")
replace('frontend/src/local-api.ts', "    const parsed = JSON.parse(raw) as Partial<LocalDb>;\n    return {\n      version: 2,\n      profiles: parsed.profiles || {},\n      families: parsed.families || {},\n      activities: parsed.activities || [],\n      chats: parsed.chats || {},\n    };", "    const parsed = JSON.parse(raw) as Partial<LocalDb>;\n    const rawProfiles = parsed.profiles || {};\n    const profiles = Object.fromEntries(Object.entries(rawProfiles).map(([profileId, profile]) => [profileId, normalizeLegacyPremiumProfile(profile as Profile)]));\n    const normalized: LocalDb = { version: 2, profiles, families: parsed.families || {}, activities: parsed.activities || [], chats: parsed.chats || {} };\n    if (JSON.stringify(profiles) !== JSON.stringify(rawProfiles)) await AsyncStorage.setItem(DB_KEY, JSON.stringify(normalized));\n    return normalized;")
replace('frontend/src/local-api.ts', "      // TestFlight beta ships with all content unlocked. Replace with StoreKit before a paid release.\n      is_premium: true,", "      is_premium: false,")

replace('frontend/src/bible-journey/catalog.ts', 'export const BIBLE_JOURNEY_BOOKS: readonly JourneyBook[] = BOOK_SEEDS.map(', "const FREE_JOURNEY_BOOK_IDS = new Set(['GEN', 'EXO', 'LEV', 'MAT']);\n\nexport const BIBLE_JOURNEY_BOOKS: readonly JourneyBook[] = BOOK_SEEDS.map(")
replace('frontend/src/bible-journey/catalog.ts', "    access: offset < 3 ? 'free' : 'premium',", "    access: FREE_JOURNEY_BOOK_IDS.has(id) ? 'free' : 'premium',")
replace('frontend/scripts/test-bible-journey.ts', "assert.equal(isBookFree('LEV'), true);\nassert.equal(isBookFree('NUM'), false);", "assert.equal(isBookFree('LEV'), true);\nassert.equal(isBookFree('MAT'), true);\nassert.equal(isBookFree('NUM'), false);")
replace('frontend/scripts/audit-bible-journey.mjs', "check(catalog.includes(\"access: offset < 3 ? 'free' : 'premium'\"), 'Books 1–3 are not the exact free access boundary.');", "check(catalog.includes(\"FREE_JOURNEY_BOOK_IDS = new Set(['GEN', 'EXO', 'LEV', 'MAT'])\"), 'Genesis, Exodus, Leviticus, and Matthew are not the exact free access boundary.');")

premium_path = 'frontend/app/premium.tsx'
premium = read(premium_path)
for old, new in {
    "['Books 4–66', 'Genesis, Exodus, and Leviticus remain free. Premium opens Numbers through Revelation.']": "['Remaining 62 Journey Books', 'Genesis, Exodus, Leviticus, and Matthew remain free. Premium opens the other 62 book seasons.']",
    "['Three Full Books', 'Genesis Tournament plus the complete Exodus and Leviticus trial seasons.']": "['Four Full Books', 'Genesis Tournament plus the complete Exodus, Leviticus, and Matthew trial seasons.']",
    "'Go beyond the first three books.'": "'Continue beyond the four free books.'",
    "'Numbers through Revelation and all 50 peaceful backgrounds are available on this player profile.'": "'The remaining 62 Journey books and all 50 peaceful backgrounds are available on this player profile.'",
    "'Genesis, Exodus, and Leviticus are free. Premium opens Numbers through Revelation, all mastery records, and the full peaceful background collection.'": "'Genesis, Exodus, Leviticus, and Matthew are free. Premium opens the remaining 62 Journey books, all mastery records, and the full peaceful background collection.'",
}.items():
    if old not in premium: raise RuntimeError(f'{premium_path}: missing expected copy {old!r}')
    premium = premium.replace(old, new)
write(premium_path, premium)

replace('frontend/src/tutorial-core.ts', "    description: 'Home is your Command Center. It shows the clearest next action without making you search through menus.',", "    description: 'Home is your dashboard for quick games, Bible reading, Lumi, devotionals, and shortcuts.',")
replace('frontend/src/tutorial-core.ts', "    description: 'Journey is the complete 66-book Bible path.',", "    description: 'Journey is the separate book-by-book mastery path with trials, progress, seals, and Premium book seasons.',")
replace('frontend/src/tutorial-core.ts', "      'Genesis, Exodus, and Leviticus are free. Books 4–66 require Premium.',", "      'Genesis, Exodus, Leviticus, and Matthew are free. The remaining 62 Journey books require Premium.',")
replace('frontend/src/tutorial-core.ts', "    description: 'Premium clearly opens Books 4–66 and the Premium peaceful-photo collection once a validated store entitlement exists.',", "    description: 'Premium clearly opens the remaining 62 Journey books and Premium peaceful-photo collection once a validated store entitlement exists.',")

replace('frontend/src/audio-context.tsx', "import { setAudioModeAsync, setIsAudioActiveAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';", "import { setAudioModeAsync, setIsAudioActiveAsync, useAudioPlayer, useAudioPlayerStatus, type AudioPlayer } from 'expo-audio';")
replace('frontend/src/audio-context.tsx', "  const piano = useAudioPlayer(null);\n  const tap = useAudioPlayer(null);", "  const piano = useAudioPlayer(null);\n  const pianoStatus = useAudioPlayerStatus(piano);\n  const tap = useAudioPlayer(null);")
replace('frontend/src/audio-context.tsx', "  const resumeMusic = useCallback(async () => {\n    if (!readyRef.current || !musicEnabledRef.current || appState.current !== 'active') return;", "  const resumeMusic = useCallback(async () => {\n    if (!pianoStatus.isLoaded) return;\n    if (!readyRef.current || !musicEnabledRef.current || appState.current !== 'active') return;")
replace('frontend/src/audio-context.tsx', "  }, [piano]);\n\n  useEffect(() => {\n    if (!ready) return;", "  }, [piano, pianoStatus.isLoaded]);\n\n  useEffect(() => {\n    if (!ready || !pianoStatus.isLoaded) return;")
replace('frontend/src/audio-context.tsx', "  }, [pauseMusic, preferences.musicEnabled, ready, resumeMusic]);", "  }, [pauseMusic, pianoStatus.isLoaded, preferences.musicEnabled, ready, resumeMusic]);")

replace('frontend/app/quiz-play.tsx', "import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';\n", '')
replace('frontend/app/quiz-play.tsx', "  const destination = nodeId ? '/(tabs)/journey' : '/(tabs)/quiz';", "  const destination = nodeId ? '/(tabs)/journey' : '/(tabs)/quiz';\n\n  const openReference = () => {\n    if (!checked || !question?.verse) return;\n    router.push({ pathname: '/(tabs)/bible', params: { reference: question.verse, fromQuiz: '1' } });\n  };")
replace('frontend/app/quiz-play.tsx', "<CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-09']} darkness={0.73}>", '<CinematicBackdrop darkness={0.66}>', expected=2)
replace('frontend/app/quiz-play.tsx', "<CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-09']} darkness={0.55}>", '<CinematicBackdrop darkness={0.5}>')
replace('frontend/app/quiz-play.tsx', "                {question.verse ? <Text style={styles.feedbackReference}>{question.verse}</Text> : null}\n              </View>", "                {question.verse ? (\n                  <>\n                    <Text style={styles.feedbackReference}>Source: {question.verse}</Text>\n                    <TactileButton compact variant=\"glass\" label=\"Open in Bible\" icon={<Ionicons name=\"book\" size={17} color={colors.onSurface} />} onPress={openReference} />\n                  </>\n                ) : null}\n              </View>")
quiz = read('frontend/app/quiz-play.tsx')
for old, new in {
    "stateCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md }": "stateCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(249,242,224,0.93)', borderColor: 'rgba(232,185,87,0.62)' }",
    "stateTitle: { color: colors.onSurface": "stateTitle: { color: '#241C14'",
    "stateCopy: { color: colors.muted": "stateCopy: { color: '#665747'",
    "questionCard: { borderRadius: radii.xl, minHeight: 150, padding: spacing.xl, justifyContent: 'center' }": "questionCard: { borderRadius: radii.xl, minHeight: 150, padding: spacing.xl, justifyContent: 'center', backgroundColor: 'rgba(249,242,224,0.93)', borderColor: 'rgba(232,185,87,0.62)' }",
    "question: { color: colors.onSurface": "question: { color: '#241C14'",
    "feedback: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }": "feedback: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: 'rgba(249,242,224,0.91)' }",
    "feedbackTitle: { color: colors.onSurface": "feedbackTitle: { color: '#241C14'",
    "feedbackText: { color: colors.muted": "feedbackText: { color: '#665747'",
    "resultCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md }": "resultCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(249,242,224,0.93)', borderColor: 'rgba(232,185,87,0.62)' }",
    "resultTitle: { color: colors.onSurface": "resultTitle: { color: '#241C14'",
    "resultCopy: { color: colors.muted": "resultCopy: { color: '#665747'",
}.items():
    if old not in quiz: raise RuntimeError(f'quiz style token missing: {old}')
    quiz = quiz.replace(old, new)
write('frontend/app/quiz-play.tsx', quiz)

replace('frontend/app/(tabs)/bible.tsx', "import { useFocusEffect, useRouter } from 'expo-router';", "import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';")
replace('frontend/app/(tabs)/bible.tsx', "  const router = useRouter();\n  const scrollRef = useRef<ScrollView>(null);", "  const router = useRouter();\n  const { reference, fromQuiz } = useLocalSearchParams<{ reference?: string; fromQuiz?: string }>();\n  const scrollRef = useRef<ScrollView>(null);")
replace('frontend/app/(tabs)/bible.tsx', "      const next = await loadBibleStudy(profile.id);\n      const restoredBook = getBibleBook(next.lastLocation.bookId) || BIBLE_LIBRARY[0];\n      if (restoredBook) {\n        const restoredChapter = Math.max(1, Math.min(restoredBook.chapters.length, next.lastLocation.chapter));\n        setBookId(restoredBook.id);\n        setChapter(restoredChapter);\n        setFocusedVerse(next.lastLocation.verse);\n        setSermonDraft(next.sermonNotes[chapterKey(restoredBook.id, restoredChapter)] || '');", "      const next = await loadBibleStudy(profile.id);\n      const requestedLocation = reference ? parseBibleReference(String(reference)) : null;\n      const targetLocation = requestedLocation || next.lastLocation;\n      const restoredBook = getBibleBook(targetLocation.bookId) || BIBLE_LIBRARY[0];\n      if (restoredBook) {\n        const restoredChapter = Math.max(1, Math.min(restoredBook.chapters.length, targetLocation.chapter));\n        setBookId(restoredBook.id);\n        setChapter(restoredChapter);\n        setFocusedVerse(targetLocation.verse);\n        setSermonDraft(next.sermonNotes[chapterKey(restoredBook.id, restoredChapter)] || '');")
replace('frontend/app/(tabs)/bible.tsx', "  }, [profile]);", "  }, [profile, reference]);", expected=1)
replace('frontend/app/(tabs)/bible.tsx', "          right={<Text style={styles.headerBook}>📖</Text>}\n        />", "          right={fromQuiz === '1' ? (\n            <Pressable accessibilityRole=\"button\" accessibilityLabel=\"Return to quiz\" onPress={() => router.back()} style={styles.returnQuizButton}>\n              <Ionicons name=\"arrow-back\" size={16} color={colors.brand} />\n              <Text style={styles.returnQuizText}>Return to Quiz</Text>\n            </Pressable>\n          ) : <Text style={styles.headerBook}>📖</Text>}\n        />")
bible = read('frontend/app/(tabs)/bible.tsx')
if "  headerBook: {" not in bible: raise RuntimeError('Bible styles missing headerBook')
bible = bible.replace("  headerBook: {", "  returnQuizButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(10,15,24,0.76)', borderWidth: 1, borderColor: colors.borderStrong },\n  returnQuizText: { color: colors.brand, fontSize: 11, fontWeight: '900' },\n  headerBook: {", 1)
write('frontend/app/(tabs)/bible.tsx', bible)

write('frontend/scripts/test-build15-piano-premium.ts', '''import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BIBLE_JOURNEY_BOOKS } from '../src/bible-journey/catalog.ts';
import { PREMIUM_PRODUCT_ID, hasValidatedPremiumEntitlement } from '../src/premium-entitlement-core.ts';
const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const failures: string[] = [];
function check(name: string, run: () => void) { try { run(); } catch (error) { failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`); } }
check('four free books', () => assert.deepEqual(BIBLE_JOURNEY_BOOKS.filter((book) => book.access === 'free').map((book) => book.id), ['GEN', 'EXO', 'LEV', 'MAT']));
check('remaining books Premium', () => { for (const id of ['NUM', 'MRK', 'REV']) assert.equal(BIBLE_JOURNEY_BOOKS.find((book) => book.id === id)?.access, 'premium'); });
check('validated entitlement only', () => {
  assert.equal(hasValidatedPremiumEntitlement({ is_premium: true }), false);
  assert.equal(hasValidatedPremiumEntitlement({ is_premium: true, premium_entitlement_source: 'app-store', premium_product_id: PREMIUM_PRODUCT_ID }), true);
  assert.equal(hasValidatedPremiumEntitlement({ is_premium: true, premium_entitlement_source: 'app-store', premium_product_id: 'wrong' }), false);
});
const localApi = read('src/local-api.ts');
check('honest profile migration', () => { assert.match(localApi, /is_premium:\s*false/); assert.match(localApi, /normalizeLegacyPremiumProfile/); assert.doesNotMatch(localApi, /TestFlight beta ships with all content unlocked/); });
const provider = read('src/premium-entitlement.tsx');
check('provider validates', () => { assert.match(provider, /hasValidatedPremiumEntitlement\(profile\)/); assert.doesNotMatch(provider, /Boolean\(profile\?\.is_premium\)/); });
const audio = read('src/audio-context.tsx');
check('piano load gate', () => { assert.match(audio, /useAudioPlayerStatus/); assert.match(audio, /if \(!pianoStatus\.isLoaded\) return/); });
const quiz = read('app/quiz-play.tsx');
check('quiz selected photo and warm panels', () => { assert.doesNotMatch(quiz, /GENESIS_BACKGROUNDS\['trial-09'\]/); assert.match(quiz, /<CinematicBackdrop darkness=/); assert.match(quiz, /rgba\(249,242,224,0\.93\)/); });
check('post-answer Bible lookup', () => { assert.match(quiz, /if \(!checked \|\| !question\?\.verse\) return/); assert.match(quiz, /label=\"Open in Bible\"/); assert.match(quiz, /pathname: '\/\(tabs\)\/bible'/); assert.match(quiz, /fromQuiz: '1'/); });
const bible = read('app/(tabs)/bible.tsx');
check('Bible return flow', () => { assert.match(bible, /useLocalSearchParams/); assert.match(bible, /parseBibleReference\(String\(reference\)\)/); assert.match(bible, /Return to Quiz/); assert.match(bible, /router\.back\(\)/); });
const premium = read('app/premium.tsx');
const tutorial = read('src/tutorial-core.ts');
check('four-book copy', () => { assert.match(premium, /Genesis, Exodus, Leviticus, and Matthew/); assert.match(premium, /Four Full Books/); assert.match(tutorial, /Genesis, Exodus, Leviticus, and Matthew/); assert.doesNotMatch(`${premium}\n${tutorial}`, /first three|Three Full Books|Books 4.?66|Numbers through Revelation|beyond the first three/i); });
check('Genesis preserved', () => assert.match(read('app/genesis-quiz.tsx'), /preserveSource/));
if (failures.length) throw new Error(`Build 15 regression contract failed:\n- ${failures.join('\n- ')}`);
console.log('Build 15 regression contract passed.');
''')

for path in ['frontend/app/premium.tsx', 'frontend/src/tutorial-core.ts']:
    if re.search(r'first three|Three Full Books|Books 4.?66|Numbers through Revelation|beyond the first three', read(path), re.I):
        raise RuntimeError(f'{path}: stale Premium boundary copy remains')
print('Build 15 guarded patch applied successfully.')
