import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import { FAITH_JOURNEYS, loadFaithJourneyProgress, type FaithJourneyProgress } from '@/src/faith-journeys';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { colors, radii, spacing } from '@/src/theme';

const ACCENTS = {
  brand: colors.brand,
  coral: colors.coral,
  success: colors.success,
  info: colors.info,
};

export default function FaithJourneysScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const [progress, setProgress] = useState<Record<string, FaithJourneyProgress>>({});

  const load = useCallback(async () => {
    if (!profile) return;
    setProgress(await loadFaithJourneyProgress(profile.id));
  }, [profile]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!profile) return null;

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-08']} darkness={0.69}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          back
          eyebrow="GUIDED DISCIPLESHIP"
          title="Faith Journeys"
          subtitle="Private, offline plans with Scripture, prayer, action, and reflection."
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <GlassPanel strong style={styles.hero}>
            <Text style={styles.heroIcon}>🧭</Text>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Go deeper than a daily quote</Text>
              <Text style={styles.heroText}>Each journey gives you one focused step per day. Progress and journal responses stay private and are included in optional cloud backup.</Text>
            </View>
          </GlassPanel>

          {FAITH_JOURNEYS.map((journey) => {
            const saved = progress[journey.id];
            const completed = saved?.completedDays.length || 0;
            const percent = Math.round((completed / journey.days.length) * 100);
            const accent = ACCENTS[journey.accent];
            return (
              <Pressable
                key={journey.id}
                accessibilityRole="button"
                accessibilityLabel={`${journey.title}, ${completed} of ${journey.days.length} days complete`}
                onPress={() => router.push({ pathname: '/faith-journey', params: { id: journey.id } })}
              >
                <GlassPanel strong style={[styles.card, { borderColor: `${accent}99` }]}>
                  <View style={[styles.iconShell, { backgroundColor: `${accent}1F` }]}><Text style={styles.icon}>{journey.icon}</Text></View>
                  <View style={styles.cardCopy}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{journey.title}</Text>
                      <Ionicons name="chevron-forward" size={19} color={accent} />
                    </View>
                    <Text style={[styles.subtitle, { color: accent }]}>{journey.subtitle}</Text>
                    <Text style={styles.description}>{journey.description}</Text>
                    <View style={styles.progressRow}>
                      <View style={styles.track}><View style={[styles.fill, { width: `${percent}%`, backgroundColor: accent }]} /></View>
                      <Text style={styles.progressText}>{completed}/{journey.days.length}</Text>
                    </View>
                    <Text style={styles.status}>{completed === journey.days.length ? 'Journey complete' : completed ? 'Continue journey' : 'Begin journey'}</Text>
                  </View>
                </GlassPanel>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  hero: { borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroIcon: { fontSize: 38 },
  heroCopy: { flex: 1 },
  heroTitle: { color: colors.onSurface, fontSize: 18, fontWeight: '900' },
  heroText: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: 4 },
  card: { borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', gap: spacing.md },
  iconShell: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 29 },
  cardCopy: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, color: colors.onSurface, fontSize: 18, fontWeight: '900' },
  subtitle: { fontSize: 11.5, fontWeight: '900', marginTop: 2 },
  description: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  track: { flex: 1, height: 7, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.09)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99 },
  progressText: { color: colors.parchment, fontSize: 11, fontWeight: '900' },
  status: { color: colors.onSurface, fontSize: 11.5, fontWeight: '900', marginTop: 7 },
});
