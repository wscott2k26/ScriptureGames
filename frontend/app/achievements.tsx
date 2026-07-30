import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { useProfile } from '@/src/profile-context';
import { loadSeasonProgress, type SeasonProgress } from '@/src/season-progress';
import { loadDailyChallengeState, localDateKey, type DailyChallengeState } from '@/src/daily-challenge';
import { getAchievements } from '@/src/achievements';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { colors, radii, spacing } from '@/src/theme';
import { TactileButton } from '@/src/components/premium/TactileButton';

export default function AchievementsScreen() {
  const { profile } = useProfile();
  const [season, setSeason] = useState<SeasonProgress | null>(null);
  const [daily, setDaily] = useState<DailyChallengeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const [seasonState, dailyState] = await Promise.all([loadSeasonProgress(profile.id), loadDailyChallengeState(profile.id)]);
      setSeason(seasonState);
      setDaily(dailyState?.date === localDateKey() ? dailyState : null);
    } catch {
      setError('Achievement records could not be opened. Your saved progress remains intact.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const achievements = useMemo(() => profile && season ? getAchievements(profile, season, daily) : [], [daily, profile, season]);
  const unlocked = achievements.filter((item) => item.unlocked).length;
  if (!profile) return null;

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-08']} darkness={0.64}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader back eyebrow="PLAYER LEGACY" title="Achievement Hall" subtitle={`${unlocked} of ${achievements.length} honors unlocked`} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {loading ? <GlassPanel style={styles.statePanel}><ActivityIndicator color={colors.brand} /><Text style={styles.stateText}>Opening the hall…</Text></GlassPanel> : null}
          {error ? <GlassPanel style={styles.statePanel}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text><TactileButton compact variant="stone" label="Retry" onPress={() => void load()} /></GlassPanel> : null}
          {!loading && !error ? <View style={styles.grid}>
            {achievements.map((achievement) => (
              <GlassPanel key={achievement.id} strong={achievement.unlocked} style={[styles.card, !achievement.unlocked && styles.locked]}>
                <Text style={styles.icon}>{achievement.unlocked ? achievement.icon : '🔒'}</Text>
                <Text style={styles.title}>{achievement.title}</Text>
                <Text style={styles.description}>{achievement.description}</Text>
                {achievement.progress ? <Text style={styles.progress}>{achievement.progress}</Text> : null}
                <View style={[styles.status, achievement.unlocked ? styles.statusUnlocked : styles.statusLocked]}>
                  <Text style={styles.statusText}>{achievement.unlocked ? 'UNLOCKED' : 'LOCKED'}</Text>
                </View>
              </GlassPanel>
            ))}
          </View> : null}
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  statePanel: { minHeight: 130, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  stateText: { color: colors.muted, fontWeight: '800' },
  errorText: { color: colors.coral, textAlign: 'center', fontSize: 12.5, lineHeight: 18, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: { width: '47.8%', minHeight: 210, borderRadius: radii.lg, padding: spacing.md, alignItems: 'center', gap: spacing.sm },
  locked: { opacity: 0.62 },
  icon: { fontSize: 42 },
  title: { color: colors.onSurface, fontSize: 15, lineHeight: 19, fontWeight: '900', textAlign: 'center' },
  description: { color: colors.muted, fontSize: 11.5, lineHeight: 16, textAlign: 'center', flex: 1 },
  progress: { color: colors.brand, fontSize: 12, fontWeight: '900' },
  status: { borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1 },
  statusUnlocked: { borderColor: 'rgba(79,181,138,0.55)', backgroundColor: 'rgba(79,181,138,0.12)' },
  statusLocked: { borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.04)' },
  statusText: { color: colors.onSurface, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.8 },
});
