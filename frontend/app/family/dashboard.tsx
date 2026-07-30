import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api, storage } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';

type Child = {
  id: string;
  name: string;
  avatar: string;
  mode: string;
  xp: number;
  streak: number;
  badges: string[];
  total_completed: number;
  weekly_xp: number;
  weekly_active_days: number;
  weekly_nodes: string[];
  activities: { date: string; xp_earned?: number; nodes_completed?: number }[];
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function FamilyDashboard() {
  const router = useRouter();
  const { setProfile } = useProfile();
  const [children, setChildren] = useState<Child[]>([]);
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const familyId = await storage.getFamilyId();
    if (!familyId) {
      setLoading(false);
      return;
    }
    try {
      const result = await api.familyDashboard(familyId);
      setChildren(result.children);
      setFamilyName(result.family?.parent_name || 'Parent');
    } catch {
      setError('Family progress could not be opened. The saved profiles remain intact.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const refresh = async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-08']} darkness={0.72}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="FAMILY PROGRESS" title="Kids Dashboard" subtitle={familyName ? `${familyName} family · last seven local days` : 'Last seven local days'} />
        <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}>
          {loading ? <GlassPanel style={styles.loading}><ActivityIndicator color={colors.brand} /><Text style={styles.loadingText}>Preparing family progress…</Text></GlassPanel> : null}
          {error ? <GlassPanel style={styles.errorPanel}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text><TactileButton compact variant="stone" label="Retry" onPress={() => void load()} /></GlassPanel> : null}

          {!loading && children.length === 0 ? (
            <GlassPanel strong style={styles.empty}>
              <Text style={styles.emptyIcon}>👨‍👩‍👧</Text>
              <Text style={styles.emptyTitle}>No kid profiles yet</Text>
              <Text style={styles.emptyCopy}>Add a kid player to begin tracking their local learning activity.</Text>
              <TactileButton label="Add Kid Profile" onPress={() => router.push('/family/add-child')} />
            </GlassPanel>
          ) : null}

          {children.map((child) => (
            <GlassPanel key={child.id} strong style={styles.childCard}>
              <View style={styles.childHeader}>
                <Text style={styles.avatar}>{child.avatar}</Text>
                <View style={styles.childIdentity}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childMode}>{child.mode === 'kids' ? 'Explorer path' : 'Scholar path'}</Text>
                </View>
                <View style={styles.xpPill}><Text style={styles.xp}>{child.xp} XP</Text></View>
              </View>

              <View style={styles.statGrid}>
                <View style={styles.stat}><Text style={styles.statValue}>🔥 {child.streak}</Text><Text style={styles.statLabel}>Streak</Text></View>
                <View style={styles.stat}><Text style={styles.statValue}>⚡ {child.weekly_xp}</Text><Text style={styles.statLabel}>Week XP</Text></View>
                <View style={styles.stat}><Text style={styles.statValue}>📅 {child.weekly_active_days}/7</Text><Text style={styles.statLabel}>Active Days</Text></View>
                <View style={styles.stat}><Text style={styles.statValue}>🏅 {child.badges.length}</Text><Text style={styles.statLabel}>Badges</Text></View>
              </View>

              <View style={styles.activityBlock}>
                <View style={styles.activityHeader}><Text style={styles.activityTitle}>Seven-Day Activity</Text><Text style={styles.activityCount}>{child.total_completed} quests total</Text></View>
                <WeekBars activities={child.activities} />
              </View>

              <TactileButton
                compact
                label={`Play as ${child.name}`}
                icon={<Ionicons name="game-controller" size={18} color={colors.onBrand} />}
                onPress={async () => {
                  const selected = await api.getProfile(child.id);
                  await storage.saveProfileId(child.id);
                  setProfile(selected);
                  router.replace('/(tabs)/journey');
                }}
              />
            </GlassPanel>
          ))}
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

function WeekBars({ activities }: { activities: Child['activities'] }) {
  const map: Record<string, number> = {};
  activities.forEach((item) => { map[item.date] = item.xp_earned || 0; });
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { label: DAYS[date.getDay()], xp: map[iso] || 0 };
  });
  const max = Math.max(1, ...days.map((item) => item.xp));
  return (
    <View style={styles.week}>
      {days.map((day, index) => (
        <View key={`${day.label}-${index}`} style={styles.day}>
          <View style={styles.barTrack}><View style={[styles.barFill, { height: `${Math.max(day.xp ? 12 : 0, (day.xp / max) * 100)}%` }]} /></View>
          <Text style={styles.dayLabel}>{day.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  loading: { minHeight: 120, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: colors.muted, fontWeight: '800' },
  errorPanel: { borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center', gap: spacing.md },
  errorText: { color: colors.coral, textAlign: 'center', fontSize: 12.5, lineHeight: 18, fontWeight: '800' },
  empty: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  emptyIcon: { fontSize: 58 },
  emptyTitle: { color: colors.onSurface, fontSize: 22, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  childCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  childHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { fontSize: 42 },
  childIdentity: { flex: 1 },
  childName: { color: colors.onSurface, fontSize: 20, fontWeight: '900' },
  childMode: { color: colors.muted, fontSize: 11.5, marginTop: 2 },
  xpPill: { borderRadius: radii.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.13)', paddingHorizontal: spacing.md, paddingVertical: 7 },
  xp: { color: colors.brand, fontSize: 13, fontWeight: '900' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { width: '48.5%', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.05)', padding: spacing.md },
  statValue: { color: colors.onSurface, fontSize: 16, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7, marginTop: 3 },
  activityBlock: { gap: spacing.sm },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityTitle: { color: colors.parchment, fontSize: 14, fontWeight: '900' },
  activityCount: { color: colors.muted, fontSize: 10.5, fontWeight: '800' },
  week: { height: 105, flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-end' },
  day: { flex: 1, height: '100%', alignItems: 'center', gap: 5 },
  barTrack: { width: '72%', flex: 1, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 99, backgroundColor: colors.brand },
  dayLabel: { color: colors.muted, fontSize: 9.5, fontWeight: '900' },
});
