import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { DEVOTIONAL_IMAGE } from '@/src/story-images';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { ScriptureLink } from '@/src/components/ScriptureLink';
import { colors, radii, spacing } from '@/src/theme';

type Devo = { title: string; verse: string; reference: string; reflection: string; prayer: string };

export default function DevotionalScreen() {
  const { profile } = useProfile();
  const [devo, setDevo] = useState<Devo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    api.getDevotional(profile.mode)
      .then((result) => { if (active) setDevo(result); })
      .catch(() => { if (active) setError('Today’s devotional could not be opened.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [profile]);

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-02']} darkness={0.68}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="DAILY DEVOTIONAL" title={devo?.title || 'A Quiet Place With God'} subtitle={profile?.mode === 'kids' ? 'Explorer reflection' : 'Scholar reflection'} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {loading ? <GlassPanel style={styles.loading}><ActivityIndicator color={colors.brand} /><Text style={styles.loadingText}>Preparing today’s reflection…</Text></GlassPanel> : null}
          {error ? <GlassPanel style={styles.errorPanel}><Ionicons name="warning" size={22} color={colors.error} /><Text style={styles.error}>{error}</Text></GlassPanel> : null}
          {devo ? (
            <>
              <GlassPanel strong style={styles.hero}>
                <Image source={DEVOTIONAL_IMAGE} style={styles.image} contentFit="cover" transition={250} />
                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>WORD FOR TODAY</Text>
                  <Text style={styles.verse}>“{devo.verse}”</Text>
                  <ScriptureLink reference={devo.reference} returnLabel="Return to Devotional" />
                </View>
              </GlassPanel>
              <GlassPanel strong style={styles.sectionCard}>
                <View style={styles.sectionHeader}><Ionicons name="leaf" size={21} color={colors.success} /><Text style={styles.sectionTitle}>Reflection</Text></View>
                <Text style={styles.body}>{devo.reflection}</Text>
              </GlassPanel>
              <GlassPanel style={styles.sectionCard}>
                <View style={styles.sectionHeader}><Ionicons name="heart" size={21} color={colors.coral} /><Text style={styles.sectionTitle}>Prayer</Text></View>
                <Text style={styles.prayer}>{devo.prayer}</Text>
              </GlassPanel>
              <GlassPanel style={styles.practiceCard}>
                <Text style={styles.practiceTitle}>Carry it into the day</Text>
                <Text style={styles.practiceText}>Pause once today, remember the verse, and choose one concrete action that matches its truth.</Text>
              </GlassPanel>
            </>
          ) : null}
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
  errorPanel: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm },
  error: { color: colors.error, flex: 1, fontWeight: '800' },
  hero: { borderRadius: radii.xl, overflow: 'hidden' },
  image: { width: '100%', height: 210 },
  heroCopy: { padding: spacing.lg, gap: spacing.sm },
  heroEyebrow: { color: colors.brand, fontSize: 9.5, fontWeight: '900', letterSpacing: 1.4 },
  verse: { color: colors.parchment, fontSize: 21, lineHeight: 30, fontWeight: '800', fontStyle: 'italic' },
  reference: { color: colors.brandSecondary, fontSize: 12.5, fontWeight: '900' },
  sectionCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { color: colors.onSurface, fontSize: 19, fontWeight: '900' },
  body: { color: colors.onSurface, fontSize: 16, lineHeight: 27 },
  prayer: { color: colors.parchment, fontSize: 15.5, lineHeight: 25, fontStyle: 'italic' },
  practiceCard: { borderRadius: radii.lg, padding: spacing.md },
  practiceTitle: { color: colors.brand, fontSize: 14, fontWeight: '900' },
  practiceText: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: 3 },
});
