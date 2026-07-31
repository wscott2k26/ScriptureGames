import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useProfile } from '@/src/profile-context';
import { api } from '@/src/api';
import { GENESIS_BACKGROUNDS, GENESIS_TRIALS, getFaction, rankFor } from '@/src/genesis-season';
import { loadSeasonProgress, type SeasonProgress } from '@/src/season-progress';
import { loadDailyChallengeState, localDateKey, type DailyChallengeState } from '@/src/daily-challenge';
import { getDailyRhythmSnapshot, loadDailyRhythm, type DailyRhythmState } from '@/src/daily-rhythm';
import { leagueForWeeklyXp, leagueProgress, xpToNextLeague } from '@/src/weekly-league';
import { getAchievements } from '@/src/achievements';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { FeatureCard, SectionTitle, StatTile } from '@/src/components/premium/FeatureCard';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

type Activity = { date: string; xp_earned: number; nodes_completed: number };

const EMPTY_RHYTHM: DailyRhythmState = {
  version: 1,
  completedDates: [],
  currentStreak: 0,
  bestStreak: 0,
  graceLeaves: 1,
  graceUsedDates: [],
  milestoneRewards: [],
};

export default function CommandCenter() {
  const router = useRouter();
  const { profile, refresh } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const [season, setSeason] = useState<SeasonProgress | null>(null);
  const [daily, setDaily] = useState<DailyChallengeState | null>(null);
  const [rhythm, setRhythm] = useState<DailyRhythmState>(EMPTY_RHYTHM);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const [seasonState, dailyState, rhythmState, activityResult] = await Promise.all([
        loadSeasonProgress(profile.id),
        loadDailyChallengeState(profile.id),
        loadDailyRhythm(profile.id),
        api.getRecentActivity(profile.id, 7),
      ]);
      setSeason(seasonState);
      setDaily(dailyState?.date === localDateKey() ? dailyState : null);
      setRhythm(rhythmState);
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
  const rhythmSnapshot = getDailyRhythmSnapshot(rhythm);
  const weeklyLeague = leagueForWeeklyXp(weekXp);
  const weeklyLeagueProgress = leagueProgress(weekXp, weeklyLeague);
  const nextTrial = GENESIS_TRIALS.find((trial) => !safeSeason.completedTrials.includes(trial.id));
  const leagueAccent = {
    success: colors.success,
    info: colors.info,
    coral: colors.coral,
    brand: colors.brand,
  }[weeklyLeague.accent];

  const resumeTournament = () => {
    if (safeSeason.completedTrials.length >= GENESIS_TRIALS.length) {
      router.push('/season-victory');
      return;
    }
    if (nextTrial) {
      router.push({ pathname: '/genesis-trial', params: { id: nextTrial.id } });
      return;
    }
    router.push('/(tabs)/journey');
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-07']} darkness={0.6}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          eyebrow="PLAYER COMMAND"
          title="Command Center"
          subtitle="Your next step is waiting—no hunting through menus."
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
              <Text style={styles.resumeEyebrow}>CONTINUE WHERE YOU LEFT OFF</Text>
              <Text style={styles.resumeTitle}>{safeSeason.completedTrials.length >= GENESIS_TRIALS.length ? 'Genesis Victory Hall' : nextTrial?.title || 'Genesis Tournament'}</Text>
              <Text style={styles.resumeCopy}>{safeSeason.completedTrials.length >= GENESIS_TRIALS.length ? 'Your completed season record is ready.' : nextTrial ? `${nextTrial.chapter} · ${nextTrial.virtue} · Gate ${nextTrial.number}` : 'Open your tournament map and choose a gate.'}</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, (safeSeason.completedTrials.length / GENESIS_TRIALS.length) * 100)}%` }]} /></View>
              <Text style={styles.progressCopy}>{safeSeason.completedTrials.length} of {GENESIS_TRIALS.length} Genesis gates cleared</Text>
              <TactileButton compact label={safeSeason.completedTrials.length >= GENESIS_TRIALS.length ? 'Enter Victory Hall' : `Resume Gate ${nextTrial?.number || 1}`} onPress={resumeTournament} />
            </GlassPanel>
          </Animated.View>

          <View style={styles.statsGrid}>
            <StatTile style={styles.stat} value={profile.xp} label="Total XP" icon={<Ionicons name="flash" size={17} color={colors.brand} />} />
            <StatTile style={styles.stat} value={safeSeason.manna} label="Manna" icon={<Ionicons name="diamond" size={17} color={colors.brandSecondary} />} accent={colors.brandSecondary} />
            <StatTile style={styles.stat} value={rhythmSnapshot.activeStreak} label="Faith Flame" icon={<Ionicons name="flame" size={17} color={colors.coral} />} accent={colors.coral} />
            <StatTile style={styles.stat} value={rhythm.graceLeaves} label="Grace Leaves" icon={<Ionicons name="leaf" size={17} color={colors.success} />} accent={colors.success} />
          </View>

          <SectionTitle title="Faith Rhythm" />
          <GlassPanel strong style={styles.rhythmCard}>
            <View style={styles.rhythmTop}>
              <View style={styles.rhythmTitleWrap}>
                <Text style={styles.rhythmEyebrow}>DAILY BREAD RHYTHM</Text>
                <Text style={styles.rhythmTitle}>🔥 {rhythmSnapshot.activeStreak}-day Faith Flame</Text>
              </View>
              <View style={styles.graceChip}><Text style={styles.graceChipText}>🍃 {rhythm.graceLeaves}</Text></View>
            </View>
            <View style={styles.weekRow}>
              {rhythmSnapshot.lastSevenDays.map((day) => (
                <View key={day.date} style={styles.dayWrap}>
                  <View style={[styles.dayDot, day.completed && styles.dayDone, day.grace && styles.dayGrace]}>
                    <Text style={styles.dayIcon}>{day.completed ? '✓' : day.grace ? '🍃' : '·'}</Text>
                  </View>
                  <Text style={styles.dayLabel}>{day.date.slice(8)}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.rhythmCopy}>
              {rhythmSnapshot.completedToday
                ? 'Today is covered. Your flame is safe.'
                : rhythmSnapshot.atRisk
                  ? 'Your flame is waiting. Complete today and a Grace Leaf will cover the missed day.'
                  : 'Complete the Daily Bread Run to light today’s mark.'}
            </Text>
          </GlassPanel>

          <SectionTitle title="Today’s Mission" />
          <FeatureCard
            title={dailyDone ? 'Daily Bread Complete' : 'Daily Bread Run'}
            description={dailyDone ? `Best score: ${daily?.bestScore}/${daily?.total}. Replays remain open without duplicate rewards.` : 'Five rotating Scripture fields, about 3–5 minutes, with no ads or mid-quiz interruptions.'}
            icon={<Ionicons name={dailyDone ? 'checkmark-circle' : 'sunny'} size={27} color={dailyDone ? colors.success : colors.brand} />}
            accent={dailyDone ? colors.success : colors.brand}
            badge={dailyDone ? 'CLEARED' : 'DAILY'}
            onPress={() => router.push('/daily-challenge')}
          />

          <SectionTitle title="Weekly League" action="Standings" onAction={() => router.push('/leaderboard')} />
          <GlassPanel strong style={[styles.leagueCard, { borderColor: leagueAccent }]}>
            <View style={styles.leagueTop}>
              <Text style={styles.leagueIcon}>{weeklyLeague.icon}</Text>
              <View style={styles.leagueCopy}>
                <Text style={[styles.leagueName, { color: leagueAccent }]}>{weeklyLeague.name}</Text>
                <Text style={styles.leagueMeta}>{weekXp} XP earned in the last seven days</Text>
              </View>
              <Text style={styles.leagueNext}>{xpToNextLeague(weekXp, weeklyLeague)} XP to rise</Text>
            </View>
            <View style={styles.leagueTrack}><View style={[styles.leagueFill, { width: `${weeklyLeagueProgress}%`, backgroundColor: leagueAccent }]} /></View>
            <Text style={styles.leagueNote}>Friendly family competition only—growth over pressure, always.</Text>
          </GlassPanel>

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
          <FeatureCard title="Weekly Faith League" description="Compare seven-day XP and streaks across players saved on this device." icon={<Ionicons name="trophy" size={26} color={colors.brand} />} onPress={() => router.push('/leaderboard')} />
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
  resumeEyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  resumeTitle: { color: colors.onSurface, fontSize: 21, fontWeight: '900' },
  resumeCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.09)', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 99 },
  progressCopy: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { width: '48.5%' },
  rhythmCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  rhythmTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rhythmTitleWrap: { flex: 1 },
  rhythmEyebrow: { color: colors.muted, fontSize: 8.5, fontWeight: '900', letterSpacing: 1.2 },
  rhythmTitle: { color: colors.onSurface, fontSize: 20, fontWeight: '900', marginTop: 3 },
  graceChip: { borderRadius: 99, borderWidth: 1, borderColor: 'rgba(79,181,138,0.45)', backgroundColor: 'rgba(79,181,138,0.12)', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  graceChipText: { color: colors.success, fontWeight: '900' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 },
  dayWrap: { alignItems: 'center', gap: 4, flex: 1 },
  dayDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.035)' },
  dayDone: { borderColor: colors.success, backgroundColor: 'rgba(79,181,138,0.18)' },
  dayGrace: { borderColor: colors.brandSecondary, backgroundColor: 'rgba(123,197,215,0.14)' },
  dayIcon: { color: colors.onSurface, fontSize: 13, fontWeight: '900' },
  dayLabel: { color: colors.muted, fontSize: 8.5, fontWeight: '800' },
  rhythmCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  leagueCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  leagueTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  leagueIcon: { fontSize: 38 },
  leagueCopy: { flex: 1 },
  leagueName: { fontSize: 18, fontWeight: '900' },
  leagueMeta: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: 3 },
  leagueNext: { color: colors.onSurface, fontSize: 10, fontWeight: '900', textAlign: 'right', maxWidth: 70 },
  leagueTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  leagueFill: { height: '100%', borderRadius: 99 },
  leagueNote: { color: colors.muted, fontSize: 10.5, lineHeight: 16, fontStyle: 'italic' },
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
