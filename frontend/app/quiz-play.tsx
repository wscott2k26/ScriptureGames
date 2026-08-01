import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CelebrationBurst } from '@/src/components/premium/CelebrationBurst';

import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';

type Question = { q: string; options: string[]; answer: number; verse?: string };

function titleCase(topic: string) {
  return topic.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function QuizPlay() {
  const { topic = 'general', nodeId } = useLocalSearchParams<{ topic?: string; nodeId?: string }>();
  const router = useRouter();
  const { profile, refresh } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const winPlayed = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api.getQuiz(String(topic), 5)
      .then((result) => { if (active) setQuestions(result.questions); })
      .catch(() => { if (active) setError('This training field could not be opened.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [topic]);

  useEffect(() => {
    if (done && !winPlayed.current) {
      winPlayed.current = true;
      sfx.win();
    }
  }, [done]);

  const question = questions[index];
  const correctSelection = checked && selected === question?.answer;

  const check = () => {
    if (selected === null || checked || !question) return;
    setChecked(true);
    if (selected === question.answer) {
      setCorrect((value) => value + 1);
      sfx.correct();
    } else {
      sfx.wrong();
    }
  };

  const next = async () => {
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    setSaving(true);
    try {
      if (profile && nodeId) {
        await api.completeNode(profile.id, String(nodeId), correct, questions.length);
        await refresh();
      }
      setDone(true);
    } catch {
      setError('Your score could not be saved, but you may finish or replay the training field.');
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  const destination = nodeId ? '/(tabs)/journey' : '/(tabs)/quiz';

  const openReference = () => {
    if (!checked || !question?.verse) return;
    router.push({ pathname: '/(tabs)/bible', params: { reference: question.verse, fromQuiz: '1' } });
  };

  if (loading || error || !question) {
    return (
      <CinematicBackdrop darkness={0.66}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <ScreenHeader back eyebrow="TRAINING GROUND" title={titleCase(String(topic))} />
          <View style={styles.center}>
            <GlassPanel strong style={styles.stateCard}>
              {loading ? <ActivityIndicator color={colors.brand} size="large" /> : <Text style={styles.stateIcon}>🛡️</Text>}
              <Text style={styles.stateTitle}>{loading ? 'Preparing the questions…' : 'Training field unavailable'}</Text>
              {error ? <Text style={styles.stateCopy}>{error}</Text> : null}
              {!loading ? <TactileButton label="Return to Training" onPress={() => router.replace('/(tabs)/quiz')} /> : null}
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  if (done) {
    const percent = Math.round((correct / questions.length) * 100);
    return (
      <CinematicBackdrop darkness={0.5}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.center} testID="quiz-done">
            {!reducedMotion && percent >= 60 ? <CelebrationBurst colors={[colors.brand, colors.brandSecondary, colors.coral, colors.info, '#FFFFFF']} /> : null}
            <GlassPanel strong style={styles.resultCard}>
              <Text style={styles.resultIcon}>{percent >= 80 ? '🏆' : percent >= 60 ? '📜' : '💪'}</Text>
              <Text style={styles.resultEyebrow}>TRAINING COMPLETE</Text>
              <Text style={styles.resultTitle}>{titleCase(String(topic))}</Text>
              <Text style={styles.resultPercent}>{percent}%</Text>
              <Text style={styles.resultCopy}>{correct} of {questions.length} correct</Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.resultActions}>
                <TactileButton label={nodeId ? 'Return to Journey' : 'Return to Training'} onPress={() => router.replace(destination)} />
                <TactileButton variant="glass" label="Replay This Field" onPress={() => router.replace({ pathname: '/quiz-play', params: { topic: String(topic), ...(nodeId ? { nodeId: String(nodeId) } : {}) } })} />
              </View>
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop darkness={0.66}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="CLASSIC TRAINING" title={titleCase(String(topic))} subtitle={`Question ${index + 1} of ${questions.length}`} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.progress}><View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} /></View>
          <GlassPanel strong style={styles.questionCard}>
            <Text style={styles.question} testID="quiz-question">{question.q}</Text>
          </GlassPanel>
          <View style={styles.options}>
            {question.options.map((option, optionIndex) => {
              const chosen = selected === optionIndex;
              const isAnswer = checked && optionIndex === question.answer;
              const isWrong = checked && chosen && optionIndex !== question.answer;
              return (
                <TactileButton
                  key={`${index}-${optionIndex}`}
                  testID={`option-${optionIndex}`}
                  variant={isAnswer ? 'gold' : isWrong ? 'danger' : chosen ? 'glass' : 'stone'}
                  label={`${String.fromCharCode(65 + optionIndex)}. ${option}`}
                  onPress={() => { if (!checked) setSelected(optionIndex); }}
                  disabled={checked && !isAnswer && !chosen}
                />
              );
            })}
          </View>
          {checked ? (
            <GlassPanel style={[styles.feedback, correctSelection ? styles.feedbackGood : styles.feedbackBad]}>
              <Ionicons name={correctSelection ? 'checkmark-circle' : 'information-circle'} size={22} color={correctSelection ? colors.success : colors.coral} />
              <View style={styles.feedbackCopy}>
                <Text style={styles.feedbackTitle}>{correctSelection ? 'Correct' : 'Not quite'}</Text>
                {!correctSelection ? <Text style={styles.feedbackText}>Correct answer: {question.options[question.answer]}</Text> : null}
                {question.verse ? (
                  <>
                    <Text style={styles.feedbackReference}>Source: {question.verse}</Text>
                    <TactileButton compact variant="glass" label="Open in Bible" icon={<Ionicons name="book" size={17} color={colors.onSurface} />} onPress={openReference} />
                  </>
                ) : null}
              </View>
            </GlassPanel>
          ) : null}
          <TactileButton label={checked ? (index === questions.length - 1 ? 'Finish Training' : 'Next Question') : 'Lock In Answer'} disabled={selected === null || saving} onPress={checked ? next : check} />
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  stateCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(249,242,224,0.93)', borderColor: 'rgba(232,185,87,0.62)' },
  stateIcon: { fontSize: 62 },
  stateTitle: { color: '#241C14', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  stateCopy: { color: '#665747', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  progress: { height: 7, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.09)' },
  progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 99 },
  questionCard: { borderRadius: radii.xl, minHeight: 150, padding: spacing.xl, justifyContent: 'center', backgroundColor: 'rgba(249,242,224,0.93)', borderColor: 'rgba(232,185,87,0.62)' },
  question: { color: '#241C14', fontSize: 23, lineHeight: 31, fontWeight: '900' },
  options: { gap: spacing.md },
  feedback: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: 'rgba(249,242,224,0.91)' },
  feedbackGood: { borderColor: 'rgba(79,181,138,0.55)' },
  feedbackBad: { borderColor: 'rgba(240,131,90,0.55)' },
  feedbackCopy: { flex: 1 },
  feedbackTitle: { color: '#241C14', fontSize: 14, fontWeight: '900' },
  feedbackText: { color: '#665747', fontSize: 12, lineHeight: 18, marginTop: 2 },
  feedbackReference: { color: colors.brandSecondary, fontSize: 11, fontWeight: '800', marginTop: 5 },
  resultCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(249,242,224,0.93)', borderColor: 'rgba(232,185,87,0.62)' },
  resultIcon: { fontSize: 72 },
  resultEyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  resultTitle: { color: '#241C14', fontSize: 25, fontWeight: '900', textAlign: 'center' },
  resultPercent: { color: colors.brand, fontSize: 52, fontWeight: '900' },
  resultCopy: { color: '#665747', fontSize: 14, fontWeight: '800' },
  resultActions: { width: '100%', gap: spacing.md },
  errorText: { color: colors.error, fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '800' },
});
