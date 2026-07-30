import {
  useCallback,
  useEffect,
  useMemo,
  useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sfx } from '@/src/sfx';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useProfile } from '@/src/profile-context';
import { colors } from '@/src/theme';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { MaterialSurface } from '@/src/components/premium/MaterialSurface';
import { WordRevealText } from '@/src/components/premium/WordRevealText';
import { GENESIS_TRIALS, getFaction, getTrial } from '@/src/genesis-season';
import { loadSeasonProgress, saveTrialChoice, type SeasonProgress } from '@/src/season-progress';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

export default function GenesisTrialScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { profile } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const trial = useMemo(() => getTrial(String(id || '')), [id]);
  const [season, setSeason] = useState<SeasonProgress | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [storyFinished, setStoryFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const progress = await loadSeasonProgress(profile.id);
      setSeason(progress);
      if (trial && progress.choices[trial.id]) setSelectedChoice(progress.choices[trial.id]);
    } catch {
      setError('This trial could not be prepared. Return to the map and try again.');
    }
  }, [profile, trial]);

  useEffect(() => { void load(); }, [load]);

  if (!profile || !trial) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundTitle}>Trial not found.</Text>
        <TactileButton variant="stone" label="Return to the Map" onPress={() => router.replace('/(tabs)/journey')} />
      </SafeAreaView>
    );
  }

  const trialIndex = GENESIS_TRIALS.findIndex((item) => item.id === trial.id);
  const unlocked = trialIndex === 0 || Boolean(season?.completedTrials.includes(GENESIS_TRIALS[trialIndex - 1].id));
  const alreadyCompleted = Boolean(season?.completedTrials.includes(trial.id));
  const faction = getFaction(season?.faction);

  const begin = async () => {
    if (!selectedChoice || !profile || !unlocked) return;
    await saveTrialChoice(profile.id, trial.id, selectedChoice);
    sfx.win();
    router.push({ pathname: '/genesis-quiz', params: { id: trial.id } });
  };

  return (
    <CinematicBackdrop source={trial.background} darkness={0.32}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topbar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Return to Genesis map" onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.onSurface} />
          </Pressable>
          <View style={styles.topbarCopy}>
            <Text style={styles.topbarEyebrow}>TRIAL {trial.number} OF 10</Text>
            <Text style={styles.topbarTitle}>{trial.chapter}</Text>
          </View>
          <View style={[styles.factionSeal, faction && { borderColor: faction.accent, backgroundColor: faction.softAccent }]}>
            <Text style={styles.factionIcon}>{faction?.icon || '✦'}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={reducedMotion ? undefined : FadeInUp.duration(500)} style={styles.hero}>
            <View style={styles.trialBadge}><Text style={styles.trialBadgeText}>THE {trial.virtue.toUpperCase()} TRIAL</Text></View>
            <Text style={styles.icon}>{trial.icon}</Text>
            <Text style={styles.title}>{trial.title}</Text>
            <Text style={styles.subtitle}>{trial.subtitle}</Text>
          </Animated.View>

          {!unlocked ? (
            <GlassPanel strong style={styles.lockedPanel}>
              <Ionicons name="lock-closed" size={42} color={colors.muted} />
              <Text style={styles.lockedTitle}>This gate is sealed.</Text>
              <Text style={styles.lockedCopy}>Complete Trial {trial.number - 1} before entering this chapter.</Text>
              <TactileButton variant="stone" label="Return to the Map" onPress={() => router.replace('/(tabs)/journey')} />
            </GlassPanel>
          ) : (
            <>
              <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(180).duration(500)}>
                <GlassPanel strong style={styles.storyPanel}>
                  <View style={styles.storyHeader}>
                    <Text style={styles.storyHeaderLabel}>CINEMATIC BRIEFING</Text>
                    <Text style={styles.storyHeaderHint}>Tap text to reveal</Text>
                  </View>
                  <WordRevealText text={trial.story} speed={43} style={styles.storyText} onComplete={() => setStoryFinished(true)} />
                </GlassPanel>
              </Animated.View>

              <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(330).duration(500)} style={styles.decisionBlock}>
                <Text style={styles.decisionEyebrow}>YOUR DECISION</Text>
                <Text style={styles.decisionPrompt}>{trial.prompt}</Text>
                <View style={styles.choiceList}>
                  {trial.choices.map((choice, index) => {
                    const selected = choice.id === selectedChoice;
                    return (
                      <Pressable
                        key={choice.id}
                        testID={`trial-choice-${choice.id}`}
                        accessibilityRole="button"
                        accessibilityLabel={`${choice.label}. ${choice.detail}`}
                        accessibilityState={{ selected }}
                        onPress={() => {
                          setSelectedChoice(choice.id);
                          sfx.tap();
                        }}
                      >
                        <MaterialSurface material={selected ? 'bronze' : 'stone'} selected={selected} style={[styles.choiceCard, selected && styles.choiceSelected]}>
                          <View style={[styles.choiceNumber, selected && styles.choiceNumberSelected]}>
                            <Text style={[styles.choiceNumberText, selected && styles.choiceNumberTextSelected]}>{index + 1}</Text>
                          </View>
                          <View style={styles.choiceCopy}>
                            <Text style={styles.choiceLabel}>{choice.label}</Text>
                            <Text style={styles.choiceDetail}>{choice.detail}</Text>
                          </View>
                          <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={selected ? colors.brandLight : colors.muted} />
                        </MaterialSurface>
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>

              <GlassPanel style={styles.rewardPanel}>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>✧</Text>
                  <View><Text style={styles.rewardValue}>+{trial.manna}</Text><Text style={styles.rewardLabel}>MANNA</Text></View>
                </View>
                <View style={styles.rewardDivider} />
                <View style={styles.rewardItem}>
                  <Ionicons name="flash" size={21} color={colors.brandSecondary} />
                  <View><Text style={styles.rewardValue}>+{trial.xp}</Text><Text style={styles.rewardLabel}>RANK POINTS</Text></View>
                </View>
              </GlassPanel>

              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TactileButton
                testID="begin-genesis-quiz"
                label={alreadyCompleted ? 'Replay the Trial' : 'Begin the Challenge'}
                disabled={!selectedChoice}
                icon={<Ionicons name="shield-checkmark" size={20} color={colors.onBrand} />}
                onPress={() => void begin()}
              />
              {!storyFinished ? <Text style={styles.smallHint}>The briefing is still unfolding. You can choose whenever you are ready.</Text> : null}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  notFound: { flex: 1, backgroundColor: colors.surface, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 18 },
  notFoundTitle: { color: colors.onSurface, fontSize: 25, fontWeight: '900' },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 17, paddingVertical: 9 },
  closeButton: { width: 43, height: 43, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(7,12,25,0.70)', borderWidth: 1, borderColor: colors.border },
  topbarCopy: { flex: 1 },
  topbarEyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.25 },
  topbarTitle: { color: colors.onSurface, fontSize: 14, fontWeight: '800', marginTop: 2 },
  factionSeal: { width: 43, height: 43, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandTertiary },
  factionIcon: { fontSize: 22 },
  scroll: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 38, gap: 16, maxWidth: 700, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', gap: 7, marginBottom: 3 },
  trialBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.brandTertiary },
  trialBadgeText: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  icon: { color: colors.brand, fontSize: 37, textShadowColor: 'rgba(232,185,87,0.48)', textShadowRadius: 14 },
  title: { color: colors.onSurface, fontSize: 34, lineHeight: 39, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.parchment, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  storyPanel: { borderRadius: 26, padding: 19 },
  storyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  storyHeaderLabel: { color: colors.brand, fontSize: 9, letterSpacing: 1.3, fontWeight: '900' },
  storyHeaderHint: { color: colors.muted, fontSize: 9.5 },
  storyText: { color: '#F3E9D5', fontSize: 16.5, lineHeight: 26 },
  decisionBlock: { gap: 11 },
  decisionEyebrow: { color: colors.brand, fontSize: 9, letterSpacing: 1.4, fontWeight: '900', textAlign: 'center' },
  decisionPrompt: { color: colors.onSurface, fontSize: 20, lineHeight: 28, fontWeight: '900', textAlign: 'center', paddingHorizontal: 8 },
  choiceList: { gap: 10 },
  choiceCard: { borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  choiceSelected: { borderColor: colors.brand },
  choiceNumber: { width: 37, height: 37, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: colors.border },
  choiceNumberSelected: { backgroundColor: colors.brand, borderColor: '#F7DD98' },
  choiceNumberText: { color: colors.onSurface, fontSize: 14, fontWeight: '900' },
  choiceNumberTextSelected: { color: colors.onBrand },
  choiceCopy: { flex: 1 },
  choiceLabel: { color: colors.onSurface, fontSize: 16, fontWeight: '900' },
  choiceDetail: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 3 },
  rewardPanel: { borderRadius: 20, padding: 13, flexDirection: 'row', alignItems: 'center' },
  rewardItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  rewardIcon: { color: colors.brand, fontSize: 23 },
  rewardValue: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  rewardLabel: { color: colors.muted, fontSize: 7.5, letterSpacing: 1, fontWeight: '900', marginTop: 1 },
  rewardDivider: { width: 1, height: 32, backgroundColor: colors.divider },
  lockedPanel: { borderRadius: 27, padding: 24, alignItems: 'center', gap: 13 },
  lockedTitle: { color: colors.onSurface, fontSize: 23, fontWeight: '900' },
  lockedCopy: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  error: { color: '#FF9A92', textAlign: 'center', fontSize: 13 },
  smallHint: { color: colors.muted, fontSize: 10.5, textAlign: 'center', lineHeight: 15 },
});
