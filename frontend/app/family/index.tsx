import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api, storage } from '@/src/api';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { FeatureCard, SectionTitle } from '@/src/components/premium/FeatureCard';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';

type Family = { id: string; parent_name: string; parent_email: string; plan: string; plan_expires_at?: string };

export default function FamilyHome() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const familyId = await storage.getFamilyId();
    if (!familyId) {
      setFamily(null);
      setLoading(false);
      return;
    }
    try {
      setFamily(await api.getFamily(familyId));
    } catch {
      await storage.saveFamilyId('');
      setFamily(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const createFamily = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await api.createFamily(name.trim(), email.trim());
      await storage.saveFamilyId(next.id);
      setFamily(next);
      sfx.win();
    } catch {
      setError('The Family Hub could not be created. Try again without closing this screen.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-01']} darkness={0.71}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="LOCAL FAMILY PROFILES" title="Family Hub" subtitle="Create kid profiles and review their learning activity on this device." />
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {loading ? <GlassPanel style={styles.loading}><ActivityIndicator color={colors.brand} /><Text style={styles.loadingText}>Opening your Family Hub…</Text></GlassPanel> : null}

            {!loading && !family ? (
              <GlassPanel strong style={styles.createCard}>
                <Text style={styles.createIcon}>👨‍👩‍👧‍👦</Text>
                <Text style={styles.createTitle}>Create a local Family Hub</Text>
                <Text style={styles.createCopy}>This beta keeps the parent record, child profiles, progress, and optional email address on this device. No weekly email is sent.</Text>
                <TextInput value={name} onChangeText={setName} maxLength={30} placeholder="Parent or guardian name" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Parent or guardian name" />
                <TextInput value={email} onChangeText={setEmail} maxLength={120} placeholder="Email (optional, local only)" placeholderTextColor={colors.muted} style={styles.input} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="Parent email, optional" />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TactileButton label={busy ? 'Creating Family Hub…' : 'Create Family Hub'} disabled={busy || !name.trim()} onPress={createFamily} />
              </GlassPanel>
            ) : null}

            {!loading && family ? (
              <>
                <GlassPanel strong style={styles.hero}>
                  <View style={styles.heroIcon}><Ionicons name="people" size={32} color={colors.brand} /></View>
                  <Text style={styles.heroEyebrow}>FAMILY HUB ACTIVE</Text>
                  <Text style={styles.heroTitle}>Welcome, {family.parent_name}</Text>
                  {family.parent_email ? <Text style={styles.heroEmail}>{family.parent_email}</Text> : null}
                  <Text style={styles.heroCopy}>All family features are unlocked for this local beta. Child data stays on this device unless a future cloud mode is intentionally enabled.</Text>
                </GlassPanel>

                <SectionTitle title="Family Actions" />
                <FeatureCard title="Kids Dashboard" description="Review XP, streaks, badges, completed quests, and seven-day activity." icon={<Ionicons name="stats-chart" size={26} color={colors.brand} />} onPress={() => router.push('/family/dashboard')} />
                <FeatureCard title="Add Kid Profile" description="Create another local player with an Explorer or Scholar reading path." icon={<Ionicons name="person-add" size={26} color={colors.brandSecondary} />} accent={colors.brandSecondary} onPress={() => router.push('/family/add-child')} />

                <GlassPanel style={styles.note}>
                  <Ionicons name="shield-checkmark" size={22} color={colors.success} />
                  <Text style={styles.noteText}>Family Hub is not a surveillance tool. It shows learning activity saved by this app only and does not collect device location, contacts, browsing, or messages outside Scripture Games.</Text>
                </GlassPanel>
              </>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  loading: { minHeight: 120, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: colors.muted, fontWeight: '800' },
  createCard: { borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md },
  createIcon: { fontSize: 58, textAlign: 'center' },
  createTitle: { color: colors.onSurface, fontSize: 24, lineHeight: 30, fontWeight: '900', textAlign: 'center' },
  createCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  input: { height: 52, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(4,8,16,0.66)', color: colors.onSurface, paddingHorizontal: spacing.md, fontSize: 16, fontWeight: '700' },
  error: { color: colors.error, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  hero: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  heroIcon: { width: 68, height: 68, borderRadius: 23, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.12)', alignItems: 'center', justifyContent: 'center' },
  heroEyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  heroTitle: { color: colors.onSurface, fontSize: 25, fontWeight: '900', textAlign: 'center' },
  heroEmail: { color: colors.brandSecondary, fontSize: 12.5, fontWeight: '800' },
  heroCopy: { color: colors.muted, fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
  note: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  noteText: { color: colors.muted, flex: 1, fontSize: 11.5, lineHeight: 17 },
});
