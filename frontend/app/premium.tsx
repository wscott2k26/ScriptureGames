import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { FeatureCard, SectionTitle } from '@/src/components/premium/FeatureCard';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { colors, radii, spacing } from '@/src/theme';

const COMPLETE = [
  ['Genesis Tournament', 'Ten cinematic trials, 62 Genesis questions, decisions, Manna, rank points, replays, and Victory Hall.'],
  ['Classic Training', '168 questions across 15 topics, 13 memory passages, three puzzle sets, and a local leaderboard.'],
  ['Scripture Archive', '15 stories in Explorer and Scholar reading paths plus rotating daily devotionals.'],
  ['Lumi Companion', 'Local-first curated Bible guidance with restored history and safety boundaries.'],
  ['Family Hub', 'Local family creation, child profiles, weekly activity summaries, and player switching.'],
  ['Accessibility', 'Reduced-motion controls, skippable cinematic text, labels, contrast, and large touch targets.'],
];

const RELEASE_GATES = [
  ['Connected package validation', 'Clean dependency installation, Expo Doctor, full lint, and native export.'],
  ['Signed builds', 'EAS iOS and Android builds tied to the owner’s Expo, Apple, and Google accounts.'],
  ['Physical device test matrix', 'Real iPhone and Android checks across onboarding, resume, offline use, and accessibility.'],
  ['Final licensed audio and reviewed art', 'Replace recovery imagery where needed and add the approved sound library.'],
  ['Production observability', 'Activate Sentry and privacy-conscious analytics only at public-beta readiness.'],
  ['Store commerce later', 'No purchase flow is active. Any future digital subscription must use platform billing.'],
];

export default function Premium() {
  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.62}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="RELEASE RECORD" title="Beta Access & Readiness" subtitle="What is fully implemented, what is unlocked, and what must pass before Production." />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <GlassPanel strong style={styles.hero}>
            <View style={styles.heroIcon}><Ionicons name="shield-checkmark" size={34} color={colors.brand} /></View>
            <Text style={styles.heroEyebrow}>FULL LOCAL BETA ACCESS</Text>
            <Text style={styles.heroTitle}>No paywall. No checkout screen. No hidden locked gameplay.</Text>
            <Text style={styles.heroCopy}>Every embedded Genesis Season One, training, story, memory, puzzle, companion, and Family Hub feature is available in this build while store systems are still being certified.</Text>
          </GlassPanel>

          <SectionTitle title="Implemented in Source" />
          <View style={styles.list}>
            {COMPLETE.map(([title, description]) => (
              <FeatureCard key={title} title={title} description={description} icon={<Ionicons name="checkmark-circle" size={25} color={colors.success} />} accent={colors.success} onPress={() => {}} disabled />
            ))}
          </View>

          <SectionTitle title="Required Before Production" />
          <View style={styles.list}>
            {RELEASE_GATES.map(([title, description]) => (
              <FeatureCard key={title} title={title} description={description} icon={<Ionicons name="construct" size={24} color={colors.brand} />} accent={colors.brand} onPress={() => {}} disabled />
            ))}
          </View>

          <GlassPanel style={styles.notice}>
            <Ionicons name="information-circle" size={23} color={colors.brandSecondary} />
            <Text style={styles.noticeText}>“Full” means the complete local playable application is implemented—not that Apple, Google, EAS, final licensed assets, or physical-device certification have magically completed themselves. Production is declared only after those external gates pass.</Text>
          </GlassPanel>
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  hero: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  heroIcon: { width: 70, height: 70, borderRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.13)', alignItems: 'center', justifyContent: 'center' },
  heroEyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  heroTitle: { color: colors.onSurface, fontSize: 24, lineHeight: 30, fontWeight: '900', textAlign: 'center' },
  heroCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  list: { gap: spacing.md },
  notice: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  noticeText: { color: colors.muted, flex: 1, fontSize: 12, lineHeight: 18 },
});
