import {
  useCallback,
  useMemo,
  useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sfx } from '@/src/sfx';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useProfile } from '@/src/profile-context';
import { storage } from '@/src/api';
import { colors, spacing } from '@/src/theme';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { GENESIS_BACKGROUNDS, GENESIS_TRIALS, getFaction, rankFor } from '@/src/genesis-season';
import { loadSeasonProgress, resetSeasonProgress, type SeasonProgress } from '@/src/season-progress';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

export default function JourneyScreen() {
  const router = useRouter();
  const { profile, refresh, logout } = useProfile();
  const [season, setSeason] = useState<SeasonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const reducedMotion = useReducedMotionPreference();

  const load = useCallback(async () => {
    if (!profile) return;
    setError(null);
    try {
      const next = await loadSeasonProgress(profile.id);
      if (!next.faction) {
        router.replace('/faction-select');
        return;
      }
      setSeason(next);
    } catch {
      setError('Your Genesis season data could not be opened. Your player profile is still safe.');
    } finally {
      setLoading(false);
    }
  }, [profile, router]);

  useFocusEffect(useCallback(() => {
    void Promise.all([load(), refresh()]);
  }, [load, refresh]));

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), refresh()]);
    setRefreshing(false);
  };

  const completedSet = useMemo(() => new Set(season?.completedTrials || []), [season?.completedTrials]);
  const rank = rankFor(season?.rankPoints || 0);
  const rankPercent = Math.max(0, Math.min(100, (((season?.rankPoints || 0) - rank.floor) / Math.max(1, rank.next - rank.floor)) * 100));
  const faction = getFaction(season?.faction);
  const nextTrialIndex = GENESIS_TRIALS.findIndex((trial) => !completedSet.has(trial.id));
  const nextTrial = nextTrialIndex === -1 ? GENESIS_TRIALS[GENESIS_TRIALS.length - 1] : GENESIS_TRIALS[nextTrialIndex];

  const openTrial = (trialId: string, index: number) => {
    const unlocked = index === 0 || completedSet.has(GENESIS_TRIALS[index - 1].id);
    if (!unlocked) {
      sfx.warning();
      return;
    }
    sfx.tap();
    router.push({ pathname: '/genesis-trial', params: { id: trialId } });
  };

  if (!profile) return null;

  if (loading || !season) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.4}>
        <SafeAreaView style={styles.center}>
          <Text style={styles.loadingMark}>✦</Text>
          <Text style={styles.loadingTitle}>Opening the Genesis arena…</Text>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop source={nextTrial.background} darkness={0.47}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            testID="profile-btn"
            accessibilityRole="button"
            accessibilityLabel="Open player panel"
            onPress={() => setShowProfile((value) => !value)}
            style={[styles.avatarChip, faction && { borderColor: faction.accent }]}
          >
            <Text style={styles.avatarText}>{profile.avatar}</Text>
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>GENESIS TOURNAMENT</Text>
            <Text style={styles.headerTitle}>Season One</Text>
          </View>
          <GlassPanel style={styles.mannaChip}>
            <Text style={styles.mannaIcon}>✧</Text>
            <Text style={styles.mannaValue}>{season.manna}</Text>
          </GlassPanel>
        </View>

        {showProfile && (
          <Animated.View entering={reducedMotion ? undefined : FadeInUp.duration(220)} style={styles.profileOverlay}>
            <GlassPanel strong style={styles.profilePanel}>
              <View style={styles.profileTop}>
                <Text style={styles.profileAvatar}>{profile.avatar}</Text>
                <View style={styles.profileCopy}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={[styles.profileFaction, faction && { color: faction.accent }]}>{faction?.icon} {faction?.name}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Close player panel" onPress={() => setShowProfile(false)}>
                  <Ionicons name="close" size={23} color={colors.onSurface} />
                </Pressable>
              </View>
              <View style={styles.profileStats}>
                <View style={styles.profileStat}><Text style={styles.profileStatValue}>{profile.xp}</Text><Text style={styles.profileStatLabel}>XP</Text></View>
                <View style={styles.profileStat}><Text style={styles.profileStatValue}>{profile.streak}</Text><Text style={styles.profileStatLabel}>STREAK</Text></View>
                <View style={styles.profileStat}><Text style={styles.profileStatValue}>{season.completedTrials.length}</Text><Text style={styles.profileStatLabel}>TRIALS</Text></View>
              </View>
              <TactileButton compact variant="glass" label="Leaderboard" icon={<Ionicons name="trophy" size={17} color={colors.onSurface} />} onPress={() => { setShowProfile(false); router.push('/leaderboard'); }} />
              <TactileButton compact variant="stone" label="Choose Another Player" onPress={async () => { await logout(); router.replace('/onboarding'); }} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset Genesis season progress"
                onPress={() => Alert.alert(
                  'Reset Genesis Season?',
                  'This removes faction, Manna, choices, scores, and Genesis trial progress for this player. The player profile and other app data remain.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reset Season', style: 'destructive', onPress: async () => {
                        await resetSeasonProgress(profile.id);
                        setShowProfile(false);
                        router.replace('/faction-select');
                      },
                    },
                  ],
                )}
                style={styles.resetLink}
              >
                <Text style={styles.resetText}>Reset Genesis Season</Text>
              </Pressable>
            </GlassPanel>
          </Animated.View>
        )}

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        >
          {error ? (
            <GlassPanel strong style={styles.errorPanel}>
              <Ionicons name="warning" size={27} color="#FF9A92" />
              <Text style={styles.errorText}>{error}</Text>
              <TactileButton compact variant="stone" label="Try Again" onPress={() => void load()} />
            </GlassPanel>
          ) : null}

          <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(450)}>
            <GlassPanel strong style={styles.seasonCard}>
              <View style={styles.seasonTopline}>
                <View style={styles.factionTag}>
                  <Text style={styles.factionTagIcon}>{faction?.icon}</Text>
                  <Text style={[styles.factionTagText, faction && { color: faction.accent }]}>{faction?.name.toUpperCase()}</Text>
                </View>
                <Text style={styles.seasonProgressText}>{season.completedTrials.length}/10 COMPLETE</Text>
              </View>
              <Text style={styles.seasonTitle}>{season.completedTrials.length === 10 ? 'Genesis Champion' : nextTrial.title}</Text>
              <Text style={styles.seasonSubtitle}>
                {season.completedTrials.length === 10
                  ? 'Every gate has opened. Your final victory record is ready.'
                  : `Next gate · ${nextTrial.chapter} · ${nextTrial.virtue}`}
              </Text>
              <View style={styles.overallTrack}><View style={[styles.overallFill, { width: `${season.completedTrials.length * 10}%` }]} /></View>
              {season.completedTrials.length === 10 ? (
                <TactileButton compact label="View Season Victory" onPress={() => router.push('/season-victory')} />
              ) : (
                <TactileButton compact label={`Enter Trial ${nextTrial.number}`} onPress={() => openTrial(nextTrial.id, nextTrial.number - 1)} />
              )}
            </GlassPanel>
          </Animated.View>

          <View style={styles.rankRow}>
            <GlassPanel style={styles.rankCard}>
              <Text style={styles.rankLabel}>CURRENT RANK</Text>
              <Text style={styles.rankName}>{rank.name}</Text>
              <View style={styles.rankTrack}><View style={[styles.rankFill, { width: `${rankPercent}%` }]} /></View>
              <Text style={styles.rankMeta}>{season.rankPoints} / {rank.next} rank points</Text>
            </GlassPanel>
            <GlassPanel style={styles.smallStatCard}>
              <Text style={styles.smallStatIcon}>✧</Text>
              <Text style={styles.smallStatValue}>{season.manna}</Text>
              <Text style={styles.smallStatLabel}>MANNA</Text>
            </GlassPanel>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>THE TEN GATES</Text>
              <Text style={styles.sectionTitle}>Genesis Trial Map</Text>
            </View>
            <Text style={styles.offlineBadge}>OFFLINE READY</Text>
          </View>

          <View style={styles.path}>
            <View pointerEvents="none" style={styles.pathLine} />
            {GENESIS_TRIALS.map((trial, index) => {
              const completed = completedSet.has(trial.id);
              const unlocked = index === 0 || completedSet.has(GENESIS_TRIALS[index - 1].id);
              const current = !completed && unlocked;
              const best = season.bestResults[trial.id];
              return (
                <Animated.View key={trial.id} entering={reducedMotion ? undefined : FadeInDown.delay(index * 55).duration(350)} style={styles.trialRow}>
                  <Pressable
                    testID={`genesis-trial-${trial.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${trial.title}. ${completed ? 'Completed' : unlocked ? 'Unlocked' : 'Locked'}`}
                    accessibilityState={{ disabled: !unlocked }}
                    onPress={() => openTrial(trial.id, index)}
                    style={styles.trialPressable}
                  >
                    <GlassPanel strong={current} style={[styles.trialCard, current && styles.currentTrialCard, completed && styles.completedTrialCard, !unlocked && styles.lockedTrialCard]}>
                      <View style={[styles.trialNumber, completed && styles.trialNumberDone, current && styles.trialNumberCurrent]}>
                        {completed ? <Ionicons name="checkmark" size={21} color={colors.onBrand} /> : !unlocked ? <Ionicons name="lock-closed" size={18} color={colors.muted} /> : <Text style={styles.trialNumberText}>{trial.number}</Text>}
                      </View>
                      <View style={styles.trialCopy}>
                        <View style={styles.trialTitleRow}>
                          <Text style={[styles.trialTitle, !unlocked && styles.lockedText]}>{trial.title}</Text>
                          <Text style={styles.trialIcon}>{trial.icon}</Text>
                        </View>
                        <Text style={[styles.trialSubtitle, !unlocked && styles.lockedText]}>{trial.subtitle}</Text>
                        <View style={styles.trialMetaRow}>
                          <Text style={styles.trialMeta}>{trial.chapter}</Text>
                          <Text style={styles.metaDot}>•</Text>
                          <Text style={styles.trialMeta}>{trial.virtue}</Text>
                          {best ? <><Text style={styles.metaDot}>•</Text><Text style={styles.bestScore}>{best.percent}% BEST</Text></> : null}
                        </View>
                      </View>
                      <Ionicons name={unlocked ? 'chevron-forward' : 'lock-closed'} size={20} color={unlocked ? colors.brand : colors.muted} />
                    </GlassPanel>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          <GlassPanel style={styles.footerNote}>
            <Ionicons name="shield-checkmark" size={22} color={colors.brand} />
            <Text style={styles.footerNoteText}>Progress is stored on this device and the full Genesis season remains playable without a network connection.</Text>
          </GlassPanel>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Erase all app data"
            onPress={() => Alert.alert(
              'Erase all local app data?',
              'This permanently removes every player, score, season, family profile, streak, and chat stored on this device.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Erase Everything', style: 'destructive', onPress: async () => { await storage.resetAll(); await logout(); router.replace('/onboarding'); } },
              ],
            )}
            style={styles.eraseButton}
          >
            <Text style={styles.eraseText}>Erase All App Data</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  loadingMark: { color: colors.brand, fontSize: 48, textShadowColor: 'rgba(232,185,87,0.55)', textShadowRadius: 17 },
  loadingTitle: { color: colors.parchment, fontSize: 16, fontWeight: '800' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 17, paddingVertical: 10, zIndex: 4 },
  avatarChip: { width: 46, height: 46, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,17,31,0.88)', borderWidth: 1.5, borderColor: colors.brand },
  avatarText: { fontSize: 26 },
  headerTitleWrap: { flex: 1 },
  headerEyebrow: { color: colors.brand, fontSize: 8.5, letterSpacing: 1.35, fontWeight: '900' },
  headerTitle: { color: colors.onSurface, fontSize: 19, fontWeight: '900', marginTop: 1 },
  mannaChip: { minWidth: 74, height: 43, borderRadius: 16, paddingHorizontal: 11, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  mannaIcon: { color: colors.brand, fontSize: 19 },
  mannaValue: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  profileOverlay: { position: 'absolute', zIndex: 20, top: 68, left: 14, right: 14 },
  profilePanel: { borderRadius: 25, padding: 16, gap: 12 },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileAvatar: { fontSize: 40 },
  profileCopy: { flex: 1 },
  profileName: { color: colors.onSurface, fontSize: 20, fontWeight: '900' },
  profileFaction: { color: colors.brand, fontSize: 12, fontWeight: '900', marginTop: 2 },
  profileStats: { flexDirection: 'row', gap: 8 },
  profileStat: { flex: 1, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.06)', padding: 10, alignItems: 'center' },
  profileStatValue: { color: colors.onSurface, fontSize: 17, fontWeight: '900' },
  profileStatLabel: { color: colors.muted, fontSize: 8.5, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  resetLink: { alignSelf: 'center', paddingVertical: 5 },
  resetText: { color: '#D88882', fontSize: 12, fontWeight: '800' },
  scroll: { paddingHorizontal: 16, paddingBottom: 120, gap: 16, maxWidth: 760, width: '100%', alignSelf: 'center' },
  errorPanel: { borderRadius: 22, padding: 16, alignItems: 'center', gap: 10 },
  errorText: { color: '#F4C1BC', textAlign: 'center', lineHeight: 20 },
  seasonCard: { borderRadius: 28, padding: 19, gap: 11 },
  seasonTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  factionTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  factionTagIcon: { fontSize: 15 },
  factionTagText: { color: colors.brand, fontSize: 9, letterSpacing: 1.2, fontWeight: '900' },
  seasonProgressText: { color: colors.muted, fontSize: 9, letterSpacing: 1, fontWeight: '900' },
  seasonTitle: { color: colors.onSurface, fontSize: 29, lineHeight: 34, fontWeight: '900' },
  seasonSubtitle: { color: colors.parchment, fontSize: 13, fontWeight: '700' },
  overallTrack: { height: 7, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.10)', marginVertical: 2 },
  overallFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 99 },
  rankRow: { flexDirection: 'row', gap: 11 },
  rankCard: { flex: 1, minHeight: 111, borderRadius: 22, padding: 15 },
  rankLabel: { color: colors.muted, fontSize: 8.5, letterSpacing: 1.2, fontWeight: '900' },
  rankName: { color: colors.onSurface, fontSize: 17, fontWeight: '900', marginTop: 5 },
  rankTrack: { height: 5, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.10)', marginTop: 11 },
  rankFill: { height: '100%', borderRadius: 99, backgroundColor: colors.brandSecondary },
  rankMeta: { color: colors.muted, fontSize: 9.5, marginTop: 6 },
  smallStatCard: { width: 104, minHeight: 111, borderRadius: 22, padding: 12, alignItems: 'center', justifyContent: 'center' },
  smallStatIcon: { color: colors.brand, fontSize: 22 },
  smallStatValue: { color: colors.onSurface, fontSize: 22, fontWeight: '900', marginTop: 2 },
  smallStatLabel: { color: colors.muted, fontSize: 8, letterSpacing: 1.1, fontWeight: '900', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  sectionEyebrow: { color: colors.brand, fontSize: 8.5, letterSpacing: 1.4, fontWeight: '900' },
  sectionTitle: { color: colors.onSurface, fontSize: 22, fontWeight: '900', marginTop: 3 },
  offlineBadge: { color: colors.success, fontSize: 8, fontWeight: '900', letterSpacing: 1, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99, backgroundColor: 'rgba(79,181,138,0.13)', borderWidth: 1, borderColor: 'rgba(79,181,138,0.35)' },
  path: { gap: 11, position: 'relative', paddingLeft: 4 },
  pathLine: { position: 'absolute', left: 29, top: 28, bottom: 28, width: 2, backgroundColor: 'rgba(232,185,87,0.18)' },
  trialRow: { width: '100%' },
  trialPressable: { width: '100%' },
  trialCard: { minHeight: 94, borderRadius: 22, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  currentTrialCard: { borderColor: colors.brand, shadowColor: colors.brand, shadowOpacity: 0.22, shadowRadius: 18 },
  completedTrialCard: { borderColor: 'rgba(79,181,138,0.42)' },
  lockedTrialCard: { opacity: 0.62, borderColor: 'rgba(255,255,255,0.08)' },
  trialNumber: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: colors.borderStrong, zIndex: 2 },
  trialNumberDone: { backgroundColor: colors.success, borderColor: '#8ED8B8' },
  trialNumberCurrent: { backgroundColor: colors.brandTertiary, borderColor: colors.brand },
  trialNumberText: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  trialCopy: { flex: 1 },
  trialTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  trialTitle: { color: colors.onSurface, fontSize: 16, fontWeight: '900', flexShrink: 1 },
  trialIcon: { color: colors.brand, fontSize: 15 },
  trialSubtitle: { color: colors.parchment, fontSize: 11.5, marginTop: 2, fontWeight: '700' },
  trialMetaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginTop: 6 },
  trialMeta: { color: colors.muted, fontSize: 9.5 },
  metaDot: { color: colors.muted, fontSize: 8 },
  bestScore: { color: colors.success, fontSize: 8.5, fontWeight: '900' },
  lockedText: { color: colors.muted },
  footerNote: { borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  footerNoteText: { color: colors.muted, fontSize: 11.5, lineHeight: 17, flex: 1 },
  eraseButton: { alignSelf: 'center', padding: spacing.md },
  eraseText: { color: '#C97F7A', fontSize: 11, fontWeight: '800' },
});
