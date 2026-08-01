import {
  useEffect,
  useMemo,
  useRef,
  useState } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sfx } from '@/src/sfx';
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { CelebrationBurst } from '@/src/components/premium/CelebrationBurst';

import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { colors } from '@/src/theme';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { ScriptureLink } from '@/src/components/ScriptureLink';
import { MaterialSurface } from '@/src/components/premium/MaterialSurface';
import { getFaction, getTrial, type GenesisQuestion } from '@/src/genesis-season';
import { completeSeasonTrial, loadSeasonProgress, type SeasonProgress } from '@/src/season-progress';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function prepareQuestion(question: GenesisQuestion): GenesisQuestion {
  const choices = shuffle(question.options.map((option, originalIndex) => ({ option, originalIndex })));
  return {
    ...question,
    options: choices.map((choice) => choice.option) as [string, string, string, string],
    answer: choices.findIndex((choice) => choice.originalIndex === question.answer),
  };
}

export default function GenesisQuizScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { profile, refresh } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const trial = useMemo(() => getTrial(String(id || '')), [id]);
  const questions = useMemo(() => trial ? shuffle(trial.questions).slice(0, 5).map(prepareQuestion) : [], [trial]);
  const [season, setSeason] = useState<SeasonProgress | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confettiPlayed = useRef(false);

  useEffect(() => {
    if (!profile) return;
    loadSeasonProgress(profile.id).then(setSeason).catch(() => setError('Season progress could not be loaded.'));
  }, [profile]);

  useEffect(() => {
    if (done && !confettiPlayed.current) {
      confettiPlayed.current = true;
      sfx.win();
    }
  }, [done]);

  if (!profile || !trial || questions.length === 0) {
    return (
      <SafeAreaView style={styles.fallback}>
        <Text style={styles.fallbackTitle}>This challenge could not be opened.</Text>
        <TactileButton variant="stone" label="Return to Genesis Map" onPress={() => router.replace('/(tabs)/journey')} />
      </SafeAreaView>
    );
  }

  const question = questions[index];
  const isCorrect = checked && selected === question.answer;
  const percent = Math.round((correct / questions.length) * 100);
  const faction = getFaction(season?.faction);

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

  const finishTrial = async (finalCorrect: number) => {
    setSaving(true);
    setError(null);
    try {
      const result = await completeSeasonTrial(
        profile.id,
        trial.id,
        finalCorrect,
        questions.length,
        trial.manna,
        trial.xp,
        trial.number === 10,
      );
      setSeason(result.progress);
      setRewarded(result.firstCompletion);
      await api.completeNode(profile.id, `node-${trial.number}`, finalCorrect, questions.length);
      await refresh();
      setDone(true);
    } catch {
      setError('Your score could not be saved. Stay on this screen and try again.');
    } finally {
      setSaving(false);
    }
  };

  const continueChallenge = async () => {
    const finalCorrect = correct;
    if (index + 1 >= questions.length) {
      await finishTrial(finalCorrect);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setChecked(false);
  };

  const shareResult = async () => {
    const rankLine = trial.number === 10 ? 'Genesis Season One completed.' : `Genesis Trial ${trial.number} completed.`;
    await Share.share({
      message: `✦ SCRIPTURE GAMES ✦\n${rankLine}\n${trial.title}: ${correct}/${questions.length} (${percent}%)\nFaction: ${faction?.name || 'Genesis Challenger'}\nEnter the Word. Face the trials. Rise through the ranks.`,
    });
  };

  if (done) {
    const message = percent >= 80 ? 'Gate Conquered' : percent >= 60 ? 'Gate Opened' : 'Trial Completed';
    return (
      <CinematicBackdrop source={trial.background} darkness={0.48} preserveSource>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          {percent >= 60 && !reducedMotion && (
            <CelebrationBurst colors={[colors.brand, colors.brandSecondary, '#F7E7B9', '#FFFFFF', faction?.accent || colors.coral]} />
          )}
          <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
            <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(600)} style={styles.resultHero}>
              <Text style={styles.resultMark}>{trial.number === 10 ? '✺' : '✦'}</Text>
              <Text style={styles.resultEyebrow}>{message.toUpperCase()}</Text>
              <Text style={styles.resultTitle}>{trial.title}</Text>
              <Text style={styles.resultScore}>{correct}<Text style={styles.resultScoreSmall}> / {questions.length}</Text></Text>
              <Text style={styles.resultPercent}>{percent}% accuracy</Text>
            </Animated.View>

            <GlassPanel strong style={styles.victoryCard}>
              <View style={styles.victoryTop}>
                <View>
                  <Text style={styles.victoryLabel}>CHALLENGER</Text>
                  <Text style={styles.victoryName}>{profile.avatar} {profile.name}</Text>
                </View>
                <View style={[styles.victoryFaction, faction && { borderColor: faction.accent, backgroundColor: faction.softAccent }]}>
                  <Text style={styles.victoryFactionText}>{faction?.icon} {faction?.name || 'Challenger'}</Text>
                </View>
              </View>
              <View style={styles.victoryRule} />
              <View style={styles.rewardGrid}>
                <View style={styles.resultReward}>
                  <Text style={styles.rewardIcon}>✧</Text>
                  <Text style={styles.rewardAmount}>{rewarded ? `+${trial.manna}` : '0'}</Text>
                  <Text style={styles.rewardLabel}>MANNA {rewarded ? 'EARNED' : 'REPLAY'}</Text>
                </View>
                <View style={styles.resultReward}>
                  <Ionicons name="flash" size={24} color={colors.brandSecondary} />
                  <Text style={styles.rewardAmount}>{rewarded ? `+${trial.xp}` : '0'}</Text>
                  <Text style={styles.rewardLabel}>RANK POINTS</Text>
                </View>
                <View style={styles.resultReward}>
                  <Ionicons name="map" size={24} color={colors.success} />
                  <Text style={styles.rewardAmount}>{season?.completedTrials.length || trial.number}</Text>
                  <Text style={styles.rewardLabel}>GATES OPEN</Text>
                </View>
              </View>
              {!rewarded ? <Text style={styles.replayNote}>Replay score recorded when it improves your best result. First-clear rewards are not duplicated.</Text> : null}
            </GlassPanel>

            <GlassPanel style={styles.truthCard}>
              <Ionicons name="book" size={22} color={colors.brand} />
              <View style={styles.truthCopy}>
                <Text style={styles.truthLabel}>TRIAL TRUTH</Text>
                <Text style={styles.truthText}>{question.explanation}</Text>
                <ScriptureLink reference={question.reference} compact returnLabel="Return to Genesis Results" />
              </View>
            </GlassPanel>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TactileButton
              label={trial.number === 10 ? 'Enter the Victory Hall' : 'Continue on the Genesis Map'}
              icon={<Ionicons name={trial.number === 10 ? 'trophy' : 'map'} size={20} color={colors.onBrand} />}
              onPress={() => router.replace(trial.number === 10 ? '/season-victory' : '/(tabs)/journey')}
            />
            <TactileButton variant="glass" label="Share My Victory Card" icon={<Ionicons name="share-social" size={19} color={colors.onSurface} />} onPress={() => void shareResult()} />
            <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: '/genesis-trial', params: { id: trial.id } })} style={styles.replayButton}>
              <Text style={styles.replayText}>Replay Trial {trial.number}</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop source={trial.background} darkness={0.5} preserveSource>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.quizTopbar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Exit challenge" onPress={() => router.back()} style={styles.exitButton}>
            <Ionicons name="close" size={23} color={colors.onSurface} />
          </Pressable>
          <View style={styles.progressWrap}>
            <View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{index + 1}/{questions.length}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.quizScroll} showsVerticalScrollIndicator={false}>
          <Animated.View key={`question-${index}`} entering={reducedMotion ? undefined : SlideInRight.springify().damping(20)} exiting={reducedMotion ? undefined : SlideOutLeft.duration(180)}>
            <View style={styles.questionMeta}>
              <Text style={styles.questionEyebrow}>TRIAL {trial.number} · {trial.virtue.toUpperCase()}</Text>
              <ScriptureLink reference={question.reference} compact tone="muted" returnLabel="Return to Genesis Trial" />
            </View>
            <Text style={styles.question}>{question.q}</Text>
            <View style={styles.options}>
              {question.options.map((option, optionIndex) => {
                const chosen = selected === optionIndex;
                const right = checked && optionIndex === question.answer;
                const wrong = checked && chosen && optionIndex !== question.answer;
                return (
                  <Pressable
                    key={`${index}-${optionIndex}`}
                    testID={`genesis-option-${optionIndex}`}
                    accessibilityRole="button"
                    accessibilityLabel={option}
                    accessibilityState={{ selected: chosen, disabled: checked }}
                    disabled={checked}
                    onPress={() => {
                      setSelected(optionIndex);
                      sfx.tap();
                    }}
                  >
                    <MaterialSurface
                      material={right ? 'gold' : wrong ? 'danger' : chosen ? 'bronze' : 'stone'}
                      selected={chosen || right}
                      style={[
                        styles.optionCard,
                        chosen && !checked && styles.optionChosen,
                        right && styles.optionRight,
                        wrong && styles.optionWrong,
                      ]}
                    >
                      <View style={[styles.optionLetter, chosen && !checked && styles.optionLetterChosen, right && styles.optionLetterRight, wrong && styles.optionLetterWrong]}>
                        <Text style={[styles.optionLetterText, (right || wrong) && styles.optionLetterTextActive]}>{String.fromCharCode(65 + optionIndex)}</Text>
                      </View>
                      <Text style={[styles.optionText, right && styles.optionTextDark]}>{option}</Text>
                      {right ? <Ionicons name="checkmark-circle" size={23} color={colors.onBrand} /> : null}
                      {wrong ? <Ionicons name="close-circle" size={23} color="#FFD1CB" /> : null}
                    </MaterialSurface>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {checked && (
            <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(250)} exiting={reducedMotion ? undefined : FadeOut.duration(150)}>
              <GlassPanel strong style={[styles.feedbackPanel, isCorrect ? styles.feedbackGood : styles.feedbackBad]}>
                <View style={styles.feedbackHeading}>
                  <Ionicons name={isCorrect ? 'shield-checkmark' : 'information-circle'} size={25} color={isCorrect ? colors.success : '#F0A49E'} />
                  <Text style={styles.feedbackTitle}>{isCorrect ? 'Correct. The gate responds.' : 'Not this time. Learn the truth.'}</Text>
                </View>
                {!isCorrect ? <Text style={styles.correctAnswer}>Correct answer: {question.options[question.answer]}</Text> : null}
                <Text style={styles.explanation}>{question.explanation}</Text>
                <ScriptureLink reference={question.reference} compact returnLabel="Return to Genesis Trial" />
              </GlassPanel>
            </Animated.View>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          {!checked ? (
            <TactileButton testID="genesis-check-answer" label="Lock In Answer" disabled={selected === null} onPress={checkAnswer} />
          ) : (
            <TactileButton
              testID="genesis-next-question"
              label={saving ? 'Saving the Trial…' : index + 1 >= questions.length ? 'Complete the Trial' : 'Advance'}
              disabled={saving}
              onPress={() => void continueChallenge()}
            />
          )}
        </View>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fallback: { flex: 1, backgroundColor: colors.surface, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 18 },
  fallbackTitle: { color: colors.onSurface, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  quizTopbar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  exitButton: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(7,12,25,0.75)', borderWidth: 1, borderColor: colors.border },
  progressWrap: { flex: 1, height: 8, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.12)' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.brand },
  progressText: { color: colors.parchment, fontSize: 12, fontWeight: '900', width: 34, textAlign: 'right' },
  quizScroll: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 28, gap: 14, maxWidth: 700, width: '100%', alignSelf: 'center' },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  questionEyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.25 },
  questionReference: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  question: { color: colors.onSurface, fontSize: 25, lineHeight: 34, fontWeight: '900', marginBottom: 21 },
  options: { gap: 11 },
  optionCard: { minHeight: 70, borderRadius: 21, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionChosen: { borderColor: colors.brand },
  optionRight: { borderColor: '#FFE9A8' },
  optionWrong: { borderColor: '#F0A49E' },
  optionLetter: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: colors.border },
  optionLetterChosen: { backgroundColor: colors.brandTertiary, borderColor: colors.brand },
  optionLetterRight: { backgroundColor: colors.success, borderColor: '#97E2C3' },
  optionLetterWrong: { backgroundColor: '#B74B50', borderColor: '#F0A49E' },
  optionLetterText: { color: colors.onSurface, fontSize: 13, fontWeight: '900' },
  optionLetterTextActive: { color: '#FFFFFF' },
  optionText: { flex: 1, color: colors.onSurface, fontSize: 15.5, lineHeight: 21, fontWeight: '800' },
  optionTextDark: { color: colors.onBrand },
  feedbackPanel: { borderRadius: 22, padding: 15, gap: 7, marginTop: 14 },
  feedbackGood: { borderColor: 'rgba(79,181,138,0.65)' },
  feedbackBad: { borderColor: 'rgba(212,97,97,0.65)' },
  feedbackHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  feedbackTitle: { color: colors.onSurface, fontSize: 15, fontWeight: '900', flex: 1 },
  correctAnswer: { color: '#F2C3BF', fontSize: 12.5, fontWeight: '800' },
  explanation: { color: colors.parchment, fontSize: 13, lineHeight: 19 },
  feedbackReference: { color: colors.brand, fontSize: 10, fontWeight: '900' },
  footer: { padding: 16, paddingBottom: 18, backgroundColor: 'rgba(5,9,18,0.76)', borderTopWidth: 1, borderTopColor: colors.border },
  error: { color: '#FF9A92', fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
  resultScroll: { flexGrow: 1, padding: 20, paddingBottom: 40, gap: 14, justifyContent: 'center', maxWidth: 680, width: '100%', alignSelf: 'center' },
  resultHero: { alignItems: 'center', gap: 5 },
  resultMark: { color: colors.brand, fontSize: 48, textShadowColor: 'rgba(232,185,87,0.65)', textShadowRadius: 18 },
  resultEyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  resultTitle: { color: colors.onSurface, fontSize: 30, lineHeight: 36, fontWeight: '900', textAlign: 'center' },
  resultScore: { color: colors.onSurface, fontSize: 61, lineHeight: 67, fontWeight: '900', marginTop: 5 },
  resultScoreSmall: { color: colors.muted, fontSize: 24 },
  resultPercent: { color: colors.parchment, fontSize: 14, fontWeight: '800' },
  victoryCard: { borderRadius: 27, padding: 17, gap: 14 },
  victoryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  victoryLabel: { color: colors.muted, fontSize: 8.5, fontWeight: '900', letterSpacing: 1.2 },
  victoryName: { color: colors.onSurface, fontSize: 17, fontWeight: '900', marginTop: 3 },
  victoryFaction: { borderRadius: 99, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  victoryFactionText: { color: colors.parchment, fontSize: 10.5, fontWeight: '900' },
  victoryRule: { height: 1, backgroundColor: colors.divider },
  rewardGrid: { flexDirection: 'row', gap: 5 },
  resultReward: { flex: 1, alignItems: 'center', gap: 3 },
  rewardIcon: { color: colors.brand, fontSize: 25 },
  rewardAmount: { color: colors.onSurface, fontSize: 18, fontWeight: '900' },
  rewardLabel: { color: colors.muted, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.8, textAlign: 'center' },
  replayNote: { color: colors.muted, fontSize: 9.5, lineHeight: 14, textAlign: 'center' },
  truthCard: { borderRadius: 21, padding: 14, flexDirection: 'row', gap: 11 },
  truthCopy: { flex: 1 },
  truthLabel: { color: colors.brand, fontSize: 8.5, letterSpacing: 1.1, fontWeight: '900' },
  truthText: { color: colors.parchment, fontSize: 12.5, lineHeight: 18, marginTop: 4 },
  truthReference: { color: colors.muted, fontSize: 10, fontWeight: '800', marginTop: 3 },
  replayButton: { alignSelf: 'center', padding: 10 },
  replayText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
});
