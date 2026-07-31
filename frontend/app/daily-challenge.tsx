import { useMemo, useRef, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useProfile } from '@/src/profile-context';
import { api } from '@/src/api';
import { awardSeasonBonus } from '@/src/season-progress';
import { getDailyChallenge, loadDailyChallengeState, saveDailyChallengeResult } from '@/src/daily-challenge';
import { recordDailyCompletion, type DailyRhythmState } from '@/src/daily-rhythm';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

function readableTopic(topic?: string) {
  return (topic || 'scripture').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function DailyChallengeScreen() {
  const router = useRouter();
  const { profile, refresh } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const challenge = useMemo(() => getDailyChallenge(), []);
  const startedAt = useRef(Date.now());
  const correctPulse = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rhythm, setRhythm] = useState<DailyRhythmState | null>(null);
  const [graceUsed, setGraceUsed] = useState(false);
  const [graceEarned, setGraceEarned] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: correctPulse.value,
    transform: [
      { scale: 0.55 + correctPulse.value * 0.65 },
      { rotate: `${correctPulse.value * 18}deg` },
    ],
  }));

  if (!profile) return null;
  const question = challenge.questions[index];

  const check = () => {
    if (selected === null || checked) return;
    setChecked(true);
    if (selected === question.answer) {
      setCorrect((value) => value + 1);
      sfx.correct();
      if (!reducedMotion) {
        correctPulse.value = 0;
        correctPulse.value = withSequence(
          withSpring(1, { damping: 8, stiffness: 180 }),
          withTiming(0, { duration: 650 }),
        );
      }
    } else {
      sfx.wrong();
    }
  };

  const advance = async () => {
    const finalCorrect = correct;
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
        // Every write is idempotent, so a dropped connection or closed app can be retried safely.
        await Promise.all([
          api.awardBonus(profile.id, `daily:${challenge.date}`, 75, 'daily_bread'),
          awardSeasonBonus(profile.id, `daily:${challenge.date}`, 20, 10),
        ]);
      }
      const [result, rhythmRecord] = await Promise.all([
        saveDailyChallengeResult(profile.id, challenge.date, challenge.topic, finalCorrect, challenge.questions.length),
        recordDailyCompletion(profile.id, challenge.date),
      ]);
      setRewarded(result.firstCompletion);
      setRhythm(rhythmRecord.state);
      setGraceUsed(rhythmRecord.graceUsed);
      setGraceEarned(rhythmRecord.graceEarned);
      if (result.firstCompletion) sfx.win();
      await refresh();
      setElapsedSeconds(Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
      setDone(true);
    } catch {
      setError('Your result could not be saved. Nothing was lost—try again from this screen.');
    } finally {
      setSaving(false);
    }
  };

  const shareWitnessCard = async () => {
    const percent = Math.round((correct / challenge.questions.length) * 100);
    const verse = challenge.questions.find((item) => item.verse)?.verse;
    const flame = rhythm?.currentStreak || profile.streak;
    const message = [
      'SCRIPTURE GAMES · DAILY BREAD',
      `${profile.name} scored ${correct}/${challenge.questions.length} (${percent}%).`,
      `Faith Flame: ${flame} day${flame === 1 ? '' : 's'} 🔥`,
      verse ? `Today’s Scripture trail: ${verse}` : null,
      'A little Word every day builds strong roots. 🌱',
    ].filter(Boolean).join('\n');
    await Share.share({ message, title: 'My Scripture Games Witness Card' });
  };

  if (done) {
    const percent = Math.round((correct / challenge.questions.length) * 100);
    const witnessVerse = challenge.questions.find((item) => item.verse)?.verse;
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-05']} darkness={0.48}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <ScrollView contentContainerStyle={styles.resultScroll}>
            <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)}>
              <GlassPanel strong style={styles.resultCard}>
                <Text style={styles.resultIcon}>{percent === 100 ? '☀️' : percent >= 60 ? '📜' : '🛡️'}</Text>
                <Text style={styles.resultEyebrow}>DAILY BREAD COMPLETE</Text>
                <Text style={styles.resultTitle}>{correct}/{challenge.questions.length} Correct</Text>
                <Text style={styles.resultPercent}>{percent}%</Text>
                <View style={styles.resultStatRow}>
                  <View style={styles.resultStat}><Text style={styles.resultStatValue}>🔥 {rhythm?.currentStreak || profile.streak}</Text><Text style={styles.resultStatLabel}>FAITH FLAME</Text></View>
                  <View style={styles.resultStat}><Text style={styles.resultStatValue}>🍃 {rhythm?.graceLeaves ?? 1}</Text><Text style={styles.resultStatLabel}>GRACE LEAVES</Text></View>
                  <View style={styles.resultStat}><Text style={styles.resultStatValue}>⏱ {formatDuration(elapsedSeconds)}</Text><Text style={styles.resultStatLabel}>TIME</Text></View>
                </View>
                <Text style={styles.resultCopy}>{rewarded ? 'First clear reward secured: 75 XP, 20 Manna, and 10 rank points.' : 'Replay recorded. Daily rewards are protected from duplicate payouts.'}</Text>
                {graceUsed ? <Text style={styles.graceNote}>A Grace Leaf covered yesterday and kept your Faith Flame alive.</Text> : null}
                {graceEarned ? <Text style={styles.graceNote}>Seven faithful days earned you a fresh Grace Leaf.</Text> : null}
                <GlassPanel variant="crystal" style={styles.witnessCard}>
                  <Text style={styles.witnessEyebrow}>WITNESS CARD</Text>
                  <Text style={styles.witnessScore}>{percent}% · {readableTopic(challenge.topic)}</Text>
                  {witnessVerse ? <Text style={styles.witnessVerse}>{witnessVerse}</Text> : null}
                  <Text style={styles.witnessFooter}>A little Word every day builds strong roots.</Text>
                </GlassPanel>
                <View style={styles.resultActions}>
                  <TactileButton label="Share Witness Card" icon={<Ionicons name="share-social" size={18} color={colors.onBrand} />} onPress={() => void shareWitnessCard()} />
                  <TactileButton variant="glass" label="Return to Command Center" onPress={() => router.replace('/(tabs)/command')} />
                  <TactileButton variant="stone" label="Train Again" onPress={() => router.replace('/(tabs)/quiz')} />
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
        <ScreenHeader back eyebrow="DAILY BREAD RUN" title={`Question ${index + 1} of ${challenge.questions.length}`} subtitle="Five fields of Scripture · about 3–5 minutes" />
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.progress}><View style={[styles.progressFill, { width: `${((index + 1) / challenge.questions.length) * 100}%` }]} /></View>
          <Animated.View key={index} entering={reducedMotion ? undefined : FadeIn.duration(240)}>
            <GlassPanel strong style={styles.questionCard}>
              <View style={styles.topicRow}>
                <Text style={styles.topicBadge}>{readableTopic(question.topic)}</Text>
                <Text style={styles.noInterruptions}>NO ADS · NO INTERRUPTIONS</Text>
              </View>
              <Text style={styles.question}>{question.q}</Text>
              {question.verse ? <Text style={styles.reference}>{question.verse}</Text> : null}
              <Animated.View pointerEvents="none" style={[styles.correctHalo, pulseStyle]}>
                <Text style={styles.correctHaloText}>✦</Text>
              </Animated.View>
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
              <View style={styles.feedbackCopy}>
                <Text style={styles.feedbackTitle}>{selected === question.answer ? 'That’s it. Light up the path.' : `Correct answer: ${question.options[question.answer]}`}</Text>
                {question.verse ? <Text style={styles.feedbackReference}>Read it in context: {question.verse}</Text> : null}
              </View>
            </GlassPanel>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TactileButton
            label={checked ? (index === challenge.questions.length - 1 ? 'Complete Daily Bread' : 'Next Question') : 'Lock In Answer'}
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
  questionCard: { borderRadius: radii.xl, padding: spacing.xl, minHeight: 170, justifyContent: 'center', gap: spacing.md, overflow: 'hidden' },
  topicRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  topicBadge: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  noInterruptions: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  question: { color: colors.onSurface, fontSize: 23, lineHeight: 31, fontWeight: '900' },
  reference: { color: colors.brand, fontSize: 12, fontWeight: '900' },
  correctHalo: { position: 'absolute', right: 18, bottom: 8, width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(232,185,87,0.16)', borderWidth: 1, borderColor: 'rgba(232,185,87,0.38)' },
  correctHaloText: { color: colors.brand, fontSize: 46, textShadowColor: colors.brand, textShadowRadius: 15 },
  answers: { gap: spacing.md },
  feedback: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  feedbackCorrect: { borderColor: 'rgba(79,181,138,0.55)' },
  feedbackWrong: { borderColor: 'rgba(240,131,90,0.55)' },
  feedbackCopy: { flex: 1 },
  feedbackTitle: { color: colors.onSurface, fontSize: 13, lineHeight: 19, fontWeight: '900' },
  feedbackReference: { color: colors.brandSecondary, fontSize: 11, lineHeight: 17, fontWeight: '800', marginTop: 4 },
  error: { color: colors.error, textAlign: 'center', fontWeight: '800' },
  resultScroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  resultCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  resultIcon: { fontSize: 68 },
  resultEyebrow: { color: colors.brand, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  resultTitle: { color: colors.onSurface, fontSize: 28, fontWeight: '900' },
  resultPercent: { color: colors.brand, fontSize: 48, fontWeight: '900' },
  resultStatRow: { width: '100%', flexDirection: 'row', gap: spacing.sm },
  resultStat: { flex: 1, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, alignItems: 'center', gap: 3 },
  resultStatValue: { color: colors.onSurface, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  resultStatLabel: { color: colors.muted, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center' },
  resultCopy: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  graceNote: { color: colors.success, fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '900' },
  witnessCard: { width: '100%', borderRadius: radii.xl, padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  witnessEyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  witnessScore: { color: colors.onSurface, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  witnessVerse: { color: colors.parchment, fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '800' },
  witnessFooter: { color: colors.muted, fontSize: 10.5, fontStyle: 'italic', textAlign: 'center' },
  resultActions: { width: '100%', gap: spacing.md, marginTop: spacing.sm },
});
