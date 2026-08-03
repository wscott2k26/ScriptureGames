import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import {
  buildMasteryRound,
  getBookMastery,
  type BookMasteryBookId,
  type MasteryMode,
} from '@/src/book-mastery';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { CelebrationBurst } from '@/src/components/premium/CelebrationBurst';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { ScriptureLink } from '@/src/components/ScriptureLink';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

export default function BookMasteryScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const params = useLocalSearchParams<{ book?: string; mode?: string; seed?: string }>();
  const book = getBookMastery(String(params.book || ''));
  const requestedMode: MasteryMode = params.mode === 'extended' ? 'extended' : 'core';
  const mode: MasteryMode = requestedMode === 'extended' && !profile?.is_premium ? 'core' : requestedMode;
  const roundSeed = useRef(Number(params.seed) || Date.now()).current;
  const questions = useMemo(
    () => book ? buildMasteryRound(book.id as BookMasteryBookId, mode, roundSeed) : [],
    [book, mode, roundSeed],
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [saving] = useState(false);

  if (!profile || !book || questions.length === 0) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-09']} darkness={0.72}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <ScreenHeader back eyebrow="BOOK MASTERY" title="Field unavailable" />
          <View style={styles.center}>
            <GlassPanel strong style={styles.unavailable}>
              <Text style={styles.unavailableIcon}>📖</Text>
              <Text style={styles.unavailableTitle}>This mastery field could not be prepared.</Text>
              <Text style={styles.unavailableCopy}>No progress was changed. Return to Scripture Training and choose another book.</Text>
              <TactileButton label="Return to Training" onPress={() => router.replace('/(tabs)/quiz')} />
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  const question = questions[index];
  const isCorrect = checked && selected === question.answer;

  const check = () => {
    if (selected === null || checked) return;
    setChecked(true);
    if (selected === question.answer) {
      setCorrect((value) => value + 1);
      sfx.correct();
    } else {
      sfx.wrong();
    }
  };

  const advance = () => {
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    sfx.win();
    setDone(true);
  };

  const replay = (nextMode: MasteryMode) => {
    router.replace({
      pathname: '/book-mastery',
      params: { book: book.id, mode: nextMode, seed: String(Date.now()) },
    });
  };

  if (done) {
    const percent = Math.round((correct / questions.length) * 100);
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-09']} darkness={0.54}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.center}>
            {!reducedMotion && percent >= 60 ? <CelebrationBurst colors={[colors.brand, colors.brandSecondary, colors.coral, colors.info, '#FFFFFF']} /> : null}
            <GlassPanel strong style={styles.resultCard}>
              <Text style={styles.resultIcon}>{percent >= 80 ? '🏆' : percent >= 60 ? '📜' : '🛡️'}</Text>
              <Text style={styles.resultEyebrow}>{mode === 'extended' ? 'EXTENDED MASTERY COMPLETE' : 'BOOK MASTERY COMPLETE'}</Text>
              <Text style={styles.resultTitle}>{book.title}</Text>
              <Text style={styles.resultPercent}>{percent}%</Text>
              <Text style={styles.resultCopy}>{correct} of {questions.length} Scripture-reading questions correct</Text>
              <View style={styles.resultActions}>
                {profile.is_premium && mode === 'core' ? (
                  <TactileButton label="Start 10-Question Deep Study" icon={<Ionicons name="library" size={18} color={colors.onBrand} />} onPress={() => replay('extended')} />
                ) : null}
                <TactileButton variant={profile.is_premium && mode === 'core' ? 'glass' : 'gold'} label="Replay This Book" onPress={() => replay(mode)} />
                <TactileButton variant="stone" label="Return to Scripture Training" onPress={() => router.replace('/(tabs)/quiz')} />
              </View>
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-09']} darkness={0.72}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          back
          eyebrow={mode === 'extended' ? 'PREMIUM DEEP STUDY' : 'FREE BOOK MASTERY'}
          title={book.title}
          subtitle={`Question ${index + 1} of ${questions.length} · Read Scripture before answering`}
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.progress}><View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} /></View>
          <GlassPanel strong style={styles.questionCard}>
            <View style={styles.questionMeta}>
              <Text style={styles.skill}>{question.skill.toUpperCase()}</Text>
              <Text style={styles.noGiveaway}>REFERENCE REVEALED AFTER ANSWER</Text>
            </View>
            <Text style={styles.question}>{question.q}</Text>
          </GlassPanel>

          <View style={styles.options}>
            {question.options.map((option, optionIndex) => {
              const chosen = selected === optionIndex;
              const right = checked && optionIndex === question.answer;
              const wrong = checked && chosen && optionIndex !== question.answer;
              return (
                <TactileButton
                  key={`${question.id}-${optionIndex}`}
                  testID={`mastery-option-${optionIndex}`}
                  variant={right ? 'gold' : wrong ? 'danger' : chosen ? 'glass' : 'stone'}
                  label={`${String.fromCharCode(65 + optionIndex)}. ${option}`}
                  disabled={checked && !chosen && !right}
                  onPress={() => { if (!checked) setSelected(optionIndex); }}
                />
              );
            })}
          </View>

          {checked ? (
            <GlassPanel style={[styles.feedback, isCorrect ? styles.feedbackGood : styles.feedbackBad]}>
              <Ionicons name={isCorrect ? 'checkmark-circle' : 'information-circle'} size={22} color={isCorrect ? colors.success : colors.coral} />
              <View style={styles.feedbackCopy}>
                <Text style={styles.feedbackTitle}>{isCorrect ? 'Correct. That wording is in the passage.' : 'Not quite. Read the matching line below.'}</Text>
                {!isCorrect ? <Text style={styles.correctAnswer}>Correct answer: {question.options[question.answer]}</Text> : null}
                <Text style={styles.explanation}>{question.explanation}</Text>
                <ScriptureLink reference={question.reference} returnLabel="Return to Book Mastery" testID="mastery-feedback-scripture" />
              </View>
            </GlassPanel>
          ) : null}

          <TactileButton
            label={checked ? (index === questions.length - 1 ? 'Complete Mastery' : 'Next Question') : 'Lock In Answer'}
            disabled={selected === null || saving}
            onPress={checked ? advance : check}
          />
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  progress: { height: 7, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.09)' },
  progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 99 },
  questionCard: { borderRadius: radii.xl, minHeight: 190, padding: spacing.xl, justifyContent: 'center', gap: spacing.md },
  questionMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  skill: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  noGiveaway: { flex: 1, color: colors.muted, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.7, textAlign: 'right' },
  question: { color: colors.onSurface, fontSize: 23, lineHeight: 31, fontWeight: '900' },
  options: { gap: spacing.md },
  feedback: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  feedbackGood: { borderColor: 'rgba(79,181,138,0.55)' },
  feedbackBad: { borderColor: 'rgba(240,131,90,0.55)' },
  feedbackCopy: { flex: 1 },
  feedbackTitle: { color: colors.onSurface, fontSize: 14, lineHeight: 20, fontWeight: '900' },
  correctAnswer: { color: colors.parchment, fontSize: 12, lineHeight: 18, fontWeight: '800', marginTop: 4 },
  explanation: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  unavailable: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  unavailableIcon: { fontSize: 58 },
  unavailableTitle: { color: colors.onSurface, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  unavailableCopy: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  resultCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  resultIcon: { fontSize: 68 },
  resultEyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, textAlign: 'center' },
  resultTitle: { color: colors.onSurface, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  resultPercent: { color: colors.brand, fontSize: 50, fontWeight: '900' },
  resultCopy: { color: colors.muted, fontSize: 13, lineHeight: 19, fontWeight: '800', textAlign: 'center' },
  resultActions: { width: '100%', gap: spacing.md },
});
