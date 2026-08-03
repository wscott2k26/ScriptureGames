import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import { usePremiumEntitlement } from '@/src/premium-entitlement';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';
import { PeacefulBackdrop } from '@/src/components/premium/PeacefulBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { MaterialSurface } from '@/src/components/premium/MaterialSurface';
import { MasteryAnswerFeedback } from '@/src/components/premium/MasteryAnswerFeedback';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { ScriptureLink } from '@/src/components/ScriptureLink';
import { getBibleBook } from '@/src/bible-library';
import { getJourneyBook } from '@/src/bible-journey/catalog';
import { canOpenJourneyBook } from '@/src/bible-journey/access';
import { buildBookTrials } from '@/src/bible-journey/questions';
import { recordBibleJourneyTrial } from '@/src/bible-journey/progress';
import { recordDailyCompletion } from '@/src/daily-rhythm';

export default function BookTrialScreen() {
  const router = useRouter();
  const { bookId, trial: trialParam } = useLocalSearchParams<{ bookId?: string; trial?: string }>();
  const { profile } = useProfile();
  const catalogBook = useMemo(() => getJourneyBook(String(bookId || '')), [bookId]);
  const bibleBook = useMemo(() => catalogBook ? getBibleBook(catalogBook.id) : undefined, [catalogBook]);
  const trials = useMemo(() => catalogBook && bibleBook ? buildBookTrials(bibleBook, catalogBook) : [], [bibleBook, catalogBook]);
  const trialNumber = Number(trialParam);
  const trial = Number.isInteger(trialNumber) && trialNumber >= 1 && trialNumber <= 5 ? trials[trialNumber - 1] : undefined;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const completedRef = useRef(false);
  const { hasPremium } = usePremiumEntitlement();
  const locked = Boolean(catalogBook && !canOpenJourneyBook(catalogBook, hasPremium));

  if (!profile) return null;

  const fallback = (title: string, description: string, premium = false) => (
    <PeacefulBackdrop darkness={0.62}>
      <SafeAreaView style={styles.center}>
        <GlassPanel strong style={styles.fallbackCard}>
          <Ionicons name={premium ? 'lock-closed' : 'warning'} size={42} color={premium ? colors.brand : colors.coral} />
          <Text style={styles.fallbackTitle}>{title}</Text>
          <Text style={styles.fallbackText}>{description}</Text>
          {premium ? <TactileButton label="View Premium" onPress={() => router.replace('/premium')} /> : null}
          <TactileButton variant="glass" label="Return to Book Library" onPress={() => router.replace('/book-library')} />
        </GlassPanel>
      </SafeAreaView>
    </PeacefulBackdrop>
  );

  if (!catalogBook || !bibleBook || !trial) {
    return fallback('This trial could not be opened.', 'The book or trial link is incomplete. Return to the library and choose the book again.');
  }
  if (catalogBook.id === 'GEN') {
    return fallback('Genesis uses the original Tournament.', 'Open the ten-gate Genesis arena from the Bible Journey hub.');
  }
  if (locked) {
    return fallback(`${catalogBook.name} requires Premium.`, 'Genesis through Deuteronomy and Matthew through Acts are free. Premium opens the remaining 56 books.', true);
  }

  const question = trial.questions[index];
  const isLastQuestion = index === trial.questions.length - 1;
  const percent = Math.round((correct / trial.questions.length) * 100);

  const checkAnswer = () => {
    if (selected === null || checked) return;
    setChecked(true);
    if (selected === question.answer) {
      setCorrect((value) => value + 1);
      sfx.correct();
    } else {
      sfx.wrong();
    }
  };

  const continueTrial = async () => {
    if (!checked || saving) return;
    if (!isLastQuestion) {
      setIndex((value) => value + 1);
      setSelected(null);
      setChecked(false);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const finalCorrect = correct;
      await recordBibleJourneyTrial(profile.id, catalogBook.id, trial.id, finalCorrect, trial.questions.length);
      await recordDailyCompletion(profile.id).catch(() => undefined);
      completedRef.current = true;
      setDone(true);
      sfx.win();
    } catch {
      setSaveError('Save failed. Your result was not claimed. Stay on this screen and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (done && completedRef.current) {
    const nextRoute = trial.number === 5 ? '/book-victory' : '/book-season';
    return (
      <PeacefulBackdrop darkness={0.48}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.resultMark}>{percent >= 80 ? '✺' : '✦'}</Text>
            <Text style={styles.resultEyebrow}>{catalogBook.name.toUpperCase()} · TRIAL {trial.number}</Text>
            <Text style={styles.resultTitle}>{trial.title} Complete</Text>
            <Text style={styles.resultScore}>{correct}<Text style={styles.resultSmall}> / {trial.questions.length}</Text></Text>
            <Text style={styles.resultPercent}>{percent}% accuracy</Text>

            <GlassPanel strong style={styles.resultCard}>
              <Ionicons name="book" size={25} color={colors.brand} />
              <View style={styles.resultCopy}>
                <Text style={styles.resultLabel}>LAST SCRIPTURE</Text>
                <Text style={styles.resultText}>{question.explanation}</Text>
                <ScriptureLink reference={question.reference} returnLabel={`Return to ${catalogBook.name} Results`} testID="book-trial-result-scripture" />
              </View>
            </GlassPanel>

            <TactileButton
              label={trial.number === 5 ? `Complete ${catalogBook.name}` : `Return to ${catalogBook.name} Trials`}
              onPress={() => router.replace({ pathname: nextRoute, params: { bookId: catalogBook.id } })}
            />
            <TactileButton variant="glass" label="Choose Another Bible Book" onPress={() => router.replace('/book-library')} />
          </ScrollView>
        </SafeAreaView>
      </PeacefulBackdrop>
    );
  }

  return (
    <PeacefulBackdrop darkness={0.58}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topbar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Exit trial" onPress={() => router.back()} style={styles.exitButton}>
            <Ionicons name="close" size={23} color={colors.onSurface} />
          </Pressable>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((index + 1) / trial.questions.length) * 100}%` }]} /></View>
          <Text style={styles.progressText}>{index + 1}/{trial.questions.length}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.quizScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.questionMeta}>
            <Text style={styles.questionEyebrow}>{catalogBook.name.toUpperCase()} · {trial.title.toUpperCase()}</Text>
            {question.kind === 'reference' ? (
              <Text style={styles.questionReference}>REFERENCE REVEALED AFTER ANSWER</Text>
            ) : (
              <ScriptureLink
                reference={question.reference}
                compact
                tone="muted"
                returnLabel={`Return to ${catalogBook.name} Trial`}
                testID="book-trial-question-scripture"
              />
            )}
          </View>
          <Text style={styles.question}>{question.prompt}</Text>

          <View style={styles.options}>
            {question.options.map((option, optionIndex) => {
              const chosen = selected === optionIndex;
              const right = checked && optionIndex === question.answer;
              const wrong = checked && chosen && optionIndex !== question.answer;
              return (
                <Pressable
                  key={`${question.id}-${optionIndex}`}
                  accessibilityRole="button"
                  accessibilityLabel={option}
                  accessibilityState={{ selected: chosen, disabled: checked }}
                  disabled={checked}
                  onPress={() => { setSelected(optionIndex); sfx.tap(); }}
                  style={styles.optionPressable}
                >
                  <MasteryAnswerFeedback state={right ? 'correct' : wrong ? 'wrong' : chosen ? 'selected' : 'idle'}>
                    <MaterialSurface material={right ? 'gold' : wrong ? 'danger' : chosen ? 'bronze' : 'stone'} style={styles.optionSurface}>
                      <View style={[styles.optionLetter, right && styles.optionLetterRight, wrong && styles.optionLetterWrong]}>
                        <Text style={styles.optionLetterText}>{String.fromCharCode(65 + optionIndex)}</Text>
                      </View>
                      <Text style={styles.optionText}>{option}</Text>
                      {right ? <Ionicons name="checkmark-circle" size={23} color={colors.success} /> : wrong ? <Ionicons name="close-circle" size={23} color={colors.coral} /> : null}
                    </MaterialSurface>
                  </MasteryAnswerFeedback>
                </Pressable>
              );
            })}
          </View>

          {checked ? (
            <GlassPanel strong style={styles.explanationCard}>
              <Ionicons name={selected === question.answer ? 'checkmark-circle' : 'book'} size={24} color={selected === question.answer ? colors.success : colors.brand} />
              <View style={styles.explanationCopy}>
                <Text style={styles.explanationLabel}>{selected === question.answer ? 'CORRECT' : 'SCRIPTURE TRUTH'}</Text>
                <Text style={styles.explanationText}>{question.explanation}</Text>
                <ScriptureLink reference={question.reference} returnLabel={`Return to ${catalogBook.name} Trial`} testID="book-trial-feedback-scripture" />
              </View>
            </GlassPanel>
          ) : null}

          {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
          <TactileButton
            label={!checked ? 'Check Answer' : isLastQuestion ? 'Finish Trial' : 'Continue'}
            disabled={selected === null || saving}
            onPress={() => { if (!checked) checkAnswer(); else void continueTrial(); }}
          />
          <TactileButton variant="glass" label="Return to Book Trials" onPress={() => router.replace({ pathname: '/book-season', params: { bookId: catalogBook.id } })} />
        </ScrollView>
      </SafeAreaView>
    </PeacefulBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  fallbackCard: { borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'center', maxWidth: 600, width: '100%', alignSelf: 'center' },
  fallbackTitle: { color: colors.onSurface, fontSize: 23, fontWeight: '900', textAlign: 'center' },
  fallbackText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  exitButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,17,31,0.76)', borderWidth: 1, borderColor: colors.border },
  progressTrack: { flex: 1, height: 9, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.09)' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.brand },
  progressText: { color: colors.parchment, fontSize: 11, fontWeight: '900' },
  quizScroll: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md, maxWidth: 720, width: '100%', alignSelf: 'center' },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  questionEyebrow: { color: colors.brand, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.9, flex: 1 },
  questionReference: { color: colors.parchment, fontSize: 10.5, fontWeight: '800' },
  question: { color: colors.onSurface, fontSize: 24, lineHeight: 32, fontWeight: '900' },
  options: { gap: spacing.sm },
  optionPressable: { borderRadius: radii.lg },
  optionSurface: { minHeight: 74, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  optionLetter: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.05)' },
  optionLetterRight: { borderColor: colors.success, backgroundColor: 'rgba(99,190,143,0.15)' },
  optionLetterWrong: { borderColor: colors.coral, backgroundColor: 'rgba(240,131,90,0.15)' },
  optionLetterText: { color: colors.onSurface, fontSize: 13, fontWeight: '900' },
  optionText: { color: colors.onSurface, fontSize: 14, lineHeight: 20, fontWeight: '800', flex: 1 },
  explanationCard: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md },
  explanationCopy: { flex: 1 },
  explanationLabel: { color: colors.brand, fontSize: 8.5, fontWeight: '900', letterSpacing: 1 },
  explanationText: { color: colors.parchment, fontSize: 12.5, lineHeight: 19, marginTop: 3 },
  explanationReference: { color: colors.brandSecondary, fontSize: 10.5, fontWeight: '900', marginTop: 5 },
  saveError: { color: colors.coral, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  resultScroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md, maxWidth: 650, width: '100%', alignSelf: 'center' },
  resultMark: { color: colors.brand, fontSize: 60, textAlign: 'center' },
  resultEyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, textAlign: 'center' },
  resultTitle: { color: colors.onSurface, fontSize: 30, lineHeight: 35, fontWeight: '900', textAlign: 'center' },
  resultScore: { color: colors.onSurface, fontSize: 55, fontWeight: '900', textAlign: 'center' },
  resultSmall: { color: colors.muted, fontSize: 24 },
  resultPercent: { color: colors.parchment, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  resultCard: { borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', gap: spacing.md },
  resultCopy: { flex: 1 },
  resultLabel: { color: colors.brand, fontSize: 8.5, fontWeight: '900', letterSpacing: 1 },
  resultText: { color: colors.parchment, fontSize: 12.5, lineHeight: 19, marginTop: 3 },
  resultReference: { color: colors.brandSecondary, fontSize: 10.5, fontWeight: '900', marginTop: 5 },
});