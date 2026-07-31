import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { leagueForWeeklyXp } from '@/src/weekly-league';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { colors, radii, spacing } from '@/src/theme';

type Row = {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  badges: string[];
  weekXp: number;
};

export default function Leaderboard() {
  const { profile } = useProfile();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await api.leaderboard(25);
      const enriched = await Promise.all(result.leaderboard.map(async (row: Omit<Row, 'weekXp'>) => {
        try {
          const activity = await api.getRecentActivity(row.id, 7);
          const weekXp = (activity.activities || []).reduce((sum: number, item: { xp_earned?: number }) => sum + (item.xp_earned || 0), 0);
          return { ...row, weekXp };
        } catch {
          return { ...row, weekXp: 0 };
        }
      }));
      enriched.sort((a, b) => b.weekXp - a.weekXp || b.streak - a.streak || b.xp - a.xp || a.name.localeCompare(b.name));
      setRows(enriched);
    } catch {
      setError('The weekly league could not be opened. No player data was changed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const myRank = profile ? rows.findIndex((row) => row.id === profile.id) : -1;
  const myLeague = myRank >= 0 ? leagueForWeeklyXp(rows[myRank]?.weekXp || 0) : null;

  const refresh = async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-10']} darkness={0.72}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="SEVEN-DAY STANDINGS" title="Weekly Faith League" subtitle="Friendly family competition ranked by XP earned during the last seven days." />
        <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}>
          {loading ? <GlassPanel style={styles.loading}><ActivityIndicator color={colors.brand} /><Text style={styles.loadingText}>Calculating the weekly standings…</Text></GlassPanel> : null}
          {error ? <GlassPanel style={styles.errorPanel}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text></GlassPanel> : null}
          {!loading && myRank >= 0 ? (
            <GlassPanel strong style={styles.myRank}>
              <Text style={styles.myLeagueIcon}>{myLeague?.icon}</Text>
              <View style={styles.myRankCopy}>
                <Text style={styles.myRankEyebrow}>{myLeague?.name.toUpperCase()}</Text>
                <Text style={styles.myRankValue}>#{myRank + 1} this week</Text>
              </View>
              <View style={styles.myXpWrap}><Text style={styles.myRankXp}>{rows[myRank]?.weekXp || 0}</Text><Text style={styles.myXpLabel}>7-DAY XP</Text></View>
            </GlassPanel>
          ) : null}
          {!loading && rows.length === 0 ? <GlassPanel style={styles.empty}><Text style={styles.emptyIcon}>🏛️</Text><Text style={styles.emptyTitle}>No weekly standings yet</Text><Text style={styles.emptyCopy}>Create another player or family profile and earn XP to begin a friendly league.</Text></GlassPanel> : null}
          <GlassPanel style={styles.leagueGuide}>
            <Ionicons name="heart" size={20} color={colors.success} />
            <Text style={styles.leagueGuideText}>Seed, Lamp, Lion, and Crown leagues reward steady growth. Nobody loses progress when the week rolls forward.</Text>
          </GlassPanel>
          <View style={styles.list}>
            {rows.map((row, index) => {
              const isMe = row.id === profile?.id;
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
              const league = leagueForWeeklyXp(row.weekXp);
              return (
                <GlassPanel key={row.id} strong={isMe} style={[styles.row, isMe && styles.rowMe]}>
                  <Text style={styles.rank}>{medal}</Text>
                  <Text style={styles.avatar}>{row.avatar}</Text>
                  <View style={styles.rowCopy}>
                    <Text style={styles.name}>{row.name}{isMe ? ' · You' : ''}</Text>
                    <Text style={styles.sub}>{league.icon} {league.name} · 🔥 {row.streak} day streak</Text>
                  </View>
                  <View style={styles.rowXpWrap}><Text style={styles.xp}>{row.weekXp}</Text><Text style={styles.rowXpLabel}>WEEK XP</Text></View>
                </GlassPanel>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  loading: { minHeight: 120, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: colors.muted, fontWeight: '800' },
  errorPanel: { borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center' },
  errorText: { color: colors.coral, textAlign: 'center', fontSize: 12.5, lineHeight: 18, fontWeight: '800' },
  myRank: { borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  myLeagueIcon: { fontSize: 38 },
  myRankCopy: { flex: 1 },
  myRankEyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  myRankValue: { color: colors.onSurface, fontSize: 24, fontWeight: '900' },
  myXpWrap: { alignItems: 'flex-end' },
  myRankXp: { color: colors.brand, fontSize: 20, fontWeight: '900' },
  myXpLabel: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  empty: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { color: colors.onSurface, fontSize: 20, fontWeight: '900' },
  emptyCopy: { color: colors.muted, textAlign: 'center', fontSize: 13, lineHeight: 19 },
  leagueGuide: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  leagueGuideText: { color: colors.muted, flex: 1, fontSize: 11, lineHeight: 17, fontWeight: '800' },
  list: { gap: spacing.sm },
  row: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowMe: { borderColor: colors.brand },
  rank: { width: 44, color: colors.onSurface, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  avatar: { fontSize: 32 },
  rowCopy: { flex: 1 },
  name: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  sub: { color: colors.muted, fontSize: 10.5, marginTop: 2 },
  rowXpWrap: { alignItems: 'flex-end' },
  xp: { color: colors.brand, fontSize: 17, fontWeight: '900' },
  rowXpLabel: { color: colors.muted, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.7 },
});
