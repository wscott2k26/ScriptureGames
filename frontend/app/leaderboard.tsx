import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { colors, radii, spacing } from '@/src/theme';

type Row = { id: string; name: string; avatar: string; xp: number; streak: number; badges: string[] };

export default function Leaderboard() {
  const { profile } = useProfile();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await api.leaderboard(50);
      setRows(result.leaderboard);
    } catch {
      setError('The local leaderboard could not be opened. No player data was changed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const myRank = profile ? rows.findIndex((row) => row.id === profile.id) : -1;

  const refresh = async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-10']} darkness={0.72}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="LOCAL RANKINGS" title="Training Leaderboard" subtitle="Players saved on this device, ordered by total classic-training XP." />
        <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}>
          {loading ? <GlassPanel style={styles.loading}><ActivityIndicator color={colors.brand} /><Text style={styles.loadingText}>Calculating the standings…</Text></GlassPanel> : null}
          {error ? <GlassPanel style={styles.errorPanel}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text></GlassPanel> : null}
          {!loading && myRank >= 0 ? (
            <GlassPanel strong style={styles.myRank}>
              <Ionicons name="trophy" size={28} color={colors.brand} />
              <View style={styles.myRankCopy}><Text style={styles.myRankEyebrow}>YOUR DEVICE RANK</Text><Text style={styles.myRankValue}>#{myRank + 1}</Text></View>
              <Text style={styles.myRankXp}>{rows[myRank]?.xp || 0} XP</Text>
            </GlassPanel>
          ) : null}
          {!loading && rows.length === 0 ? <GlassPanel style={styles.empty}><Text style={styles.emptyIcon}>🏛️</Text><Text style={styles.emptyTitle}>No rankings yet</Text><Text style={styles.emptyCopy}>Create a player and complete classic training activities to begin the board.</Text></GlassPanel> : null}
          <View style={styles.list}>
            {rows.map((row, index) => {
              const isMe = row.id === profile?.id;
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
              return (
                <GlassPanel key={row.id} strong={isMe} style={[styles.row, isMe && styles.rowMe]}>
                  <Text style={styles.rank}>{medal}</Text>
                  <Text style={styles.avatar}>{row.avatar}</Text>
                  <View style={styles.rowCopy}>
                    <Text style={styles.name}>{row.name}{isMe ? ' · You' : ''}</Text>
                    <Text style={styles.sub}>🔥 {row.streak} day streak · 🏅 {row.badges.length} badges</Text>
                  </View>
                  <Text style={styles.xp}>{row.xp}</Text>
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
  myRankCopy: { flex: 1 },
  myRankEyebrow: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  myRankValue: { color: colors.onSurface, fontSize: 28, fontWeight: '900' },
  myRankXp: { color: colors.brand, fontSize: 18, fontWeight: '900' },
  empty: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { color: colors.onSurface, fontSize: 20, fontWeight: '900' },
  emptyCopy: { color: colors.muted, textAlign: 'center', fontSize: 13, lineHeight: 19 },
  list: { gap: spacing.sm },
  row: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowMe: { borderColor: colors.brand },
  rank: { width: 44, color: colors.onSurface, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  avatar: { fontSize: 32 },
  rowCopy: { flex: 1 },
  name: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  sub: { color: colors.muted, fontSize: 10.5, marginTop: 2 },
  xp: { color: colors.brand, fontSize: 16, fontWeight: '900' },
});
