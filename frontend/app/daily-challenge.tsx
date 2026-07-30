import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useProfile } from '@/src/profile-context';
import { api } from '@/src/api';
import { awardSeasonBonus } from '@/src/season-progress';
import { getDailyChallenge, loadDailyChallengeState, saveDailyChallengeResult } from '@/src/daily-challenge';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

export default function DailyChallengeScreen() {
  const router = useRouter();
  const { profile, refresh } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const challenge = useMemo(() => getDailyChallenge(), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;
  const question = challenge.questions[index];

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

  const advance = async () => {
    const finalCorrect = correct + (selected === question.answer && !checked ? 1 : 0);
    if (index < challenge.questions.length - 1) {
      setIndex((value) => value + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const previous = await loadDailyChallengeState(profile.id);
      const firstCompletion = previous?.date !== challenge.date || !previous.rewarded;
      if (firstCompletion) {
        // Both awards are idempotent. Saving the completion comes last so an interrupted
        // attempt can be retried without either losing or duplicating rewards.
        await Promise.all([
          api.awardBonus(profile.id, `daily:${challenge.date}`, 75, 'daily_bread'),
          awardSeasonBonus(profile.id, `daily:${challenge.date}`, 20, 10),
        ]);
      }
      const result = await saveDailyChallengeResult(profile.id, challenge.date, challenge.topic, finalCorrect, challenge.questions.length);
      setRewarded(result.firstCompletion);
      if (result.firstCompletion) sfx.win();
      await refresh();
      setCorrect(finalCorrect);
      setDone(true);
    } catch {
      setError('Your result could not be saved. Nothing was lost—try again from this screen.');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    const percent = Math.round((correct / challenge.questions.length) * 100);
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-05']} darkness={0.48}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <ScrollView contentContainerStyle={styles.resultScroll}>
            <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)}>
              <GlassPanel strong style={styles.resultCard}>
                <Text style={styles.resultIcon}>{percent === 100 ? '☀️' : percent >= 60 ? '📜' : '🛡️'}</Text>
                <Text style={styles.resultEyebrow}>DAILY TRIAL COMPLETE</Text>
                <Text style={styles.resultTitle}>{correct}/{challenge.questions.length} Correct</Text>
                <Text style={styles.resultPercent}>{percent}%</Text>
                <Text style={styles.resultCopy}>{rewarded ? 'First clear reward secured: 75 XP, 20 Manna, and 10 rank points.' : 'Replay recorded. Daily rewards are protected from duplicate payouts.'}</Text>
                <View style={styles.resultActions}>
                  <TactileButton label="Return to Command Center" onPress={() => router.replace('/(tabs)/command')} />
                  <TactileButton variant="glass" label="Train Again" onPress={() => router.replace('/(tabs)/quiz')} />
                </View>
              </GlassPanel>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-05']} darkness={0.62}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="DAILY SCRIPTURE TRIAL" title={`Question ${index + 1} of ${challenge.questions.length}`} subtitle={`Today’s field: ${challenge.topic.replace(/_/g, ' ')}`} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.progress}><View style={[styles.progressFill, { width: `${((index + 1) / challenge.questions.length) * 100}%` }]} /></View>
          <Animated.View key={index} entering={reducedMotion ? undefined : FadeIn.duration(240)}>
            <GlassPanel strong style={styles.questionCard}>
              <Text style={styles.question}>{question.q}</Text>
              {question.verse ? <Text style={styles.reference}>{question.verse}</Text> : null}
            </GlassPanel>
          </Animated.View>
          <View style={styles.answers}>
            {question.options.map((option, optionIndex) => {
              const chosen = selected === optionIndex;
              const correctOption = checked && optionIndex === question.answer;
              const wrongOption = checked && chosen && optionIndex !== question.answer;
              return (
                <TactileButton
                  key={`${index}-${option}`}
                  variant={correctOption ? 'gold' : wrongOption ? 'danger' : chosen ? 'glass' : 'stone'}
                  label={`${String.fromCharCode(65 + optionIndex)}. ${option}`}
                  onPress={() => { if (!checked) setSelected(optionIndex); }}
                  disabled={checked && !chosen && !correctOption}
                />
              );
            })}
          </View>
          {checked ? (
            <GlassPanel style={[styles.feedback, selected === question.answer ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Ionicons name={selected === question.answer ? 'checkmark-circle' : 'information-circle'} size={21} color={selected === question.answer ? colors.success : colors.coral} />
              <Text style={styles.feedbackText}>{selected === question.answer ? 'Correct. Keep moving with confidence.' : `The correct answer is ${question.options[question.answer]}.`}</Text>
            </GlassPanel>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TactileButton
            label={checked ? (index === challenge.questions.length - 1 ? 'Complete Daily Trial' : 'Next Question') : 'Lock In Answer'}
            onPress={checked ? advance : check}
            disabled={selected === null || saving}
          />
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  progress: { height: 7, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 99 },
  questionCard: { borderRadius: radii.xl, padding: spacing.xl, minHeight: 150, justifyContent: 'center', gap: spacing.md },
  question: { color: colors.onSurface, fontSize: 23, lineHeight: 31, fontWeight: '900' },
  reference: { color: colors.brand, fontSize: 12, fontWeight: '900' },
  answers: { gap: spacing.md },
  feedback: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  feedbackCorrect: { borderColor: 'rgba(79,181,138,0.55)' },
  feedbackWrong: { borderColor: 'rgba(240,131,90,0.55)' },
  feedbackText: { color: colors.onSurface, flex: 1, fontSize: 13, lineHeight: 20, fontWeight: '700' },
  error: { color: colors.error, textAlign: 'center', fontWeight: '800' },
  resultScroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  resultCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  resultIcon: { fontSize: 68 },
  resultEyebrow: { color: colors.brand, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  resultTitle: { color: colors.onSurface, fontSize: 28, fontWeight: '900' },
  resultPercent: { color: colors.brand, fontSize: 48, fontWeight: '900' },
  resultCopy: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  resultActions: { width: '100%', gap: spacing.md, marginTop: spacing.sm },
});
