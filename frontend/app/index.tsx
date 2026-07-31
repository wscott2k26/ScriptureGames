import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import { colors, spacing } from '@/src/theme';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';

export default function Index() {
  const router = useRouter();
  const { profile, loading, error, refresh, logout } = useProfile();

  useEffect(() => {
    if (loading || error || !profile) return;
    router.replace('/(tabs)/journey');
  }, [error, loading, profile, router]);

  if (error) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.48} testID="startup-recovery-screen">
        <SafeAreaView style={styles.safe}>
          <GlassPanel strong style={styles.panel}>
            <View style={styles.iconShell}><Ionicons name="shield-checkmark" size={30} color={colors.brand} /></View>
            <Text style={styles.eyebrow}>SAFE START</Text>
            <Text style={styles.title}>Your player could not be restored yet.</Text>
            <Text style={styles.copy}>Nothing was erased. Retry the saved player first, or clear only the active-player selection and choose a profile again.</Text>
            <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
            <TactileButton label="Retry Saved Player" onPress={() => void refresh()} />
            <TactileButton
              variant="glass"
              label="Choose a Player Again"
              onPress={() => void logout().then(() => router.replace('/onboarding'))}
            />
          </GlassPanel>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  if (loading || profile) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.45} testID="loading-screen">
        <SafeAreaView style={styles.safe}>
          <GlassPanel variant="crystal" style={styles.loadingPanel}>
            <View style={styles.mark}><Text style={styles.markText}>✦</Text></View>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loading}>Restoring your tournament…</Text>
            <Text style={styles.loadingHint}>Preparing your faction, progress, and Genesis gates.</Text>
          </GlassPanel>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.42} testID="entry-choice-screen">
      <SafeAreaView style={styles.safe}>
        <GlassPanel strong style={styles.entryPanel}>
          <View style={styles.mark}><Text style={styles.markText}>✦</Text></View>
          <Text style={styles.eyebrow}>WELCOME TO SCRIPTURE GAMES</Text>
          <Text style={styles.entryTitle}>Play as a guest or restore your journey.</Text>
          <Text style={styles.entryCopy}>No account is required. Guest play keeps the complete Bible and all features available offline. A Scripture Games account is optional and only backs up or restores your personal data.</Text>
          <View style={styles.entryActions}>
            <TactileButton
              label="Continue on This Device"
              icon={<Ionicons name="phone-portrait" size={19} color={colors.onBrand} />}
              onPress={() => router.push('/onboarding')}
            />
            <TactileButton
              variant="glass"
              label="Restore Cloud Backup"
              icon={<Ionicons name="cloud-download" size={19} color={colors.onSurface} />}
              onPress={() => router.push('/cloud-account')}
            />
          </View>
          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed" size={16} color={colors.success} />
            <Text style={styles.privacyText}>Guest data stays on this phone unless you deliberately enable cloud backup.</Text>
          </View>
        </GlassPanel>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  panel: { width: '100%', maxWidth: 500, borderRadius: 30, padding: spacing.xl, gap: spacing.md },
  loadingPanel: { width: '100%', maxWidth: 390, borderRadius: 30, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  entryPanel: { width: '100%', maxWidth: 500, borderRadius: 30, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  iconShell: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandTertiary, borderWidth: 1, borderColor: colors.borderStrong },
  eyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center' },
  title: { color: colors.onSurface, fontSize: 25, lineHeight: 31, fontWeight: '900' },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  error: { color: colors.error, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  mark: { width: 66, height: 66, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandTertiary, borderWidth: 1, borderColor: colors.borderStrong },
  markText: { color: colors.brand, fontSize: 38, textShadowColor: colors.brand, textShadowRadius: 14 },
  loading: { color: colors.onSurface, marginTop: spacing.xs, fontSize: 16, fontWeight: '900' },
  loadingHint: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  entryTitle: { color: colors.onSurface, fontSize: 27, lineHeight: 33, fontWeight: '900', textAlign: 'center' },
  entryCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  entryActions: { width: '100%', gap: spacing.sm, marginTop: spacing.xs },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  privacyText: { flex: 1, color: colors.muted, fontSize: 11, lineHeight: 16 },
});
