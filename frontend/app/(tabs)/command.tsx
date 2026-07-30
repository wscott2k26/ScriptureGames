import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useProfile } from '@/src/profile-context';
import { api } from '@/src/api';
import { GENESIS_BACKGROUNDS, getFaction, rankFor } from '@/src/genesis-season';
import { loadSeasonProgress, type SeasonProgress } from '@/src/season-progress';
import { loadDailyChallengeState, localDateKey, type DailyChallengeState } from '@/src/daily-challenge';
import { getAchievements } from '@/src/achievements';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { FeatureCard, SectionTitle, StatTile } from '@/src/components/premium/FeatureCard';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

type Activity = { date: string; xp_earned: number; nodes_completed: number };

export default function CommandCenter() {
  const router = useRouter();
  const { profile, refresh } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const [season, setSeason] = useState<SeasonProgress | null>(null);
  const [daily, setDaily] = useState<DailyChallengeState | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const [seasonState, dailyState, activityResult] = await Promise.all([
        loadSeasonProgress(profile.id),
        loadDailyChallengeState(profile.id),
        api.getRecentActivity(profile.id, 7),
      ]);
      setSeason(seasonState);
      setDaily(dailyState?.date === localDateKey() ? dailyState : null);
      setActivity(activityResult.activities || []);
      await refresh();
    } catch {
      setError('Player records could not be refreshed. Your saved progress remains on this device.');
    } finally {
      setLoading(false);
    }
  }, [profile, refresh]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const weekXp = activity.reduce((sum, item) => sum + (item.xp_earned || 0), 0);
  const achievements = useMemo(() => profile && season ? getAchievements(profile, season, daily) : [], [daily, profile, season]);
  const unlockedAchievements = achievements.filter((item) => item.unlocked);

  if (!profile) return null;
  const safeSeason = season || { version: 1, manna: 0, rankPoints: 0, completedTrials: [], bestResults: {}, choices: {}, introSeen: false, bonusAwards: [] };
  const faction = getFaction(safeSeason.faction);
  const rank = rankFor(safeSeason.rankPoints);
  const dailyDone = Boolean(daily?.rewarded);

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-07']} darkness={0.6}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          eyebrow="PLAYER COMMAND"
          title="Command Center"
          subtitle="Your progress, daily mission, achievements, and player controls."
          right={<Text style={styles.avatar}>{profile.avatar}</Text>}
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(320)}>
            <GlassPanel strong style={styles.hero}>
              <View style={styles.heroTop}>
                <View style={styles.identity}>
                  <Text style={styles.name}>{profile.name}</Text>
                  <Text style={[styles.faction, faction && { color: faction.accent }]}>{faction ? `${faction.icon} ${faction.name}` : 'Faction not selected'}</Text>
                </View>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankEyebrow}>RANK</Text>
                  <Text style={styles.rankName}>{rank.name}</Text>
                </View>
              </View>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, (safeSeason.completedTrials.length / 10) * 100)}%` }]} /></View>
              <Text style={styles.progressCopy}>{safeSeason.completedTrials.length} of 10 Genesis gates cleared</Text>
              <TactileButton compact label={safeSeason.completedTrials.length >= 10 ? 'Enter Victory Hall' : 'Continue Tournament'} onPress={() => router.push(safeSeason.completedTrials.length >= 10 ? '/season-victory' : '/(tabs)/journey')} />
            </GlassPanel>
          </Animated.View>

          <View style={styles.statsGrid}>
            <StatTile style={styles.stat} value={profile.xp} label="Total XP" icon={<Ionicons name="flash" size={17} color={colors.brand} />} />
            <StatTile style={styles.stat} value={safeSeason.manna} label="Manna" icon={<Ionicons name="diamond" size={17} color={colors.brandSecondary} />} accent={colors.brandSecondary} />
            <StatTile style={styles.stat} value={profile.streak} label="Day Streak" icon={<Ionicons name="flame" size={17} color={colors.coral} />} accent={colors.coral} />
            <StatTile style={styles.stat} value={weekXp} label="XP This Week" icon={<Ionicons name="calendar" size={17} color={colors.success} />} accent={colors.success} />
          </View>

          <SectionTitle title="Today’s Mission" />
          <FeatureCard
            title={dailyDone ? 'Daily Trial Complete' : 'Daily Scripture Trial'}
            description={dailyDone ? `Best score: ${daily?.bestScore}/${daily?.total}. Replays remain open without duplicate rewards.` : 'Five fresh questions. Earn 75 XP and 20 Manna on your first clear today.'}
            icon={<Ionicons name={dailyDone ? 'checkmark-circle' : 'sunny'} size={27} color={dailyDone ? colors.success : colors.brand} />}
            accent={dailyDone ? colors.success : colors.brand}
            badge={dailyDone ? 'CLEARED' : 'DAILY'}
            onPress={() => router.push('/daily-challenge')}
          />

          <SectionTitle title="Achievement Hall" action="View All" onAction={() => router.push('/achievements')} />
          <GlassPanel style={styles.achievementStrip}>
            {achievements.slice(0, 4).map((achievement) => (
              <View key={achievement.id} style={[styles.achievementMini, !achievement.unlocked && styles.locked]}>
                <Text style={styles.achievementIcon}>{achievement.unlocked ? achievement.icon : '🔒'}</Text>
                <Text numberOfLines={2} style={styles.achievementTitle}>{achievement.title}</Text>
              </View>
            ))}
            <Text style={styles.unlockedCount}>{unlockedAchievements.length}/{achievements.length} unlocked</Text>
          </GlassPanel>

          <SectionTitle title="Player Services" />
          <FeatureCard title="Training Leaderboard" description="Compare XP and streaks across players saved on this device." icon={<Ionicons name="trophy" size={26} color={colors.brand} />} onPress={() => router.push('/leaderboard')} />
          <FeatureCard title="Family Hub" description="Create kid profiles and view seven-day learning progress." icon={<Ionicons name="people" size={26} color={colors.brandSecondary} />} accent={colors.brandSecondary} onPress={() => router.push('/family')} />
          <FeatureCard title="Player Settings" description="Edit profile, motion, haptics, cinematic text, privacy, and local data." icon={<Ionicons name="settings" size={26} color={colors.parchment} />} accent={colors.parchment} onPress={() => router.push('/settings')} />
          <FeatureCard title="Beta Access & Release Notes" description="See exactly what is unlocked and what remains before store production." icon={<Ionicons name="shield-checkmark" size={26} color={colors.success} />} accent={colors.success} onPress={() => router.push('/premium')} />

          {error ? (
            <GlassPanel style={styles.errorPanel}>
              <Ionicons name="warning" size={22} color={colors.coral} />
              <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
              <TactileButton compact variant="stone" label="Retry Refresh" onPress={() => void load()} />
            </GlassPanel>
          ) : null}
          {loading ? <Text style={styles.loading}>Refreshing player records…</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 130, gap: spacing.md },
  avatar: { fontSize: 36 },
  hero: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  identity: { flex: 1 },
  name: { color: colors.onSurface, fontSize: 24, fontWeight: '900' },
  faction: { color: colors.brand, fontSize: 13, fontWeight: '900', marginTop: 4 },
  rankBadge: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'flex-end' },
  rankEyebrow: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  rankName: { color: colors.brand, fontSize: 14, fontWeight: '900' },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.09)', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 99 },
  progressCopy: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { width: '48.5%' },
  achievementStrip: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  achievementMini: { width: '23%', alignItems: 'center', gap: 5 },
  locked: { opacity: 0.45 },
  achievementIcon: { fontSize: 26 },
  achievementTitle: { color: colors.onSurface, fontSize: 9.5, lineHeight: 12, fontWeight: '800', textAlign: 'center' },
  unlockedCount: { width: '100%', color: colors.muted, fontSize: 11, fontWeight: '800', textAlign: 'right', marginTop: 3 },
  errorPanel: { borderRadius: radii.lg, padding: spacing.md, alignItems: 'center', gap: spacing.sm },
  errorText: { color: colors.coral, textAlign: 'center', fontSize: 12, lineHeight: 18, fontWeight: '800' },
  loading: { color: colors.muted, textAlign: 'center', fontSize: 12 },
});
