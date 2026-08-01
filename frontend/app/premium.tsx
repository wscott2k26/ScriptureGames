import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { usePremiumEntitlement } from '@/src/premium-entitlement';
import { PeacefulBackdrop } from '@/src/components/premium/PeacefulBackdrop';
import { FeatureCard, SectionTitle } from '@/src/components/premium/FeatureCard';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';

const PREMIUM_FEATURES = [
  ['Books 4–66', 'Genesis, Exodus, and Leviticus remain free. Premium opens Numbers through Revelation.'],
  ['Choose Any Book', 'Open any unlocked Bible season without losing your recommended Genesis-to-Revelation path.'],
  ['Forty Premium Scenes', 'Use the full peaceful atmosphere library, including Bible lands, oceans, mountains, gardens, and worship scenes.'],
  ['Complete Mastery Record', 'Earn private book seals, testament progress, best scores, and a 66-book completion certificate.'],
] as const;

const ALWAYS_FREE = [
  ['Three Full Books', 'Genesis Tournament plus the complete Exodus and Leviticus trial seasons.'],
  ['Complete Bible Reader', 'All 66 public-domain Bible books remain readable offline regardless of Premium status.'],
  ['Lumi and Faith Tools', 'Typed Lumi, guarded voice, Faith Journeys, Prayer Garden, and core training remain available.'],
  ['Healthy Faith Rhythm', 'Daily progress, Grace Leaves, and encouraging milestones are never sold as streak repair.'],
] as const;

export default function Premium() {
  const router = useRouter();
  const { hasPremium, productId, status, message, purchase, restore } = usePremiumEntitlement();
  const busy = status === 'checking';

  return (
    <PeacefulBackdrop darkness={0.5}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="COMPLETE BIBLE JOURNEY" title="Premium" subtitle="Unlock the deeper journey without changing the gameplay that already works." />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <GlassPanel strong style={styles.hero}>
            <View style={[styles.heroIcon, hasPremium && styles.heroIconActive]}>
              <Ionicons name={hasPremium ? 'checkmark-circle' : 'diamond'} size={38} color={hasPremium ? colors.success : colors.brand} />
            </View>
            <Text style={styles.heroEyebrow}>{hasPremium ? 'PREMIUM ACTIVE' : 'ONE COMPLETE JOURNEY'}</Text>
            <Text style={styles.heroTitle}>{hasPremium ? 'All 66 Bible books are unlocked.' : 'Go beyond the first three books.'}</Text>
            <Text style={styles.heroCopy}>{hasPremium
              ? 'Numbers through Revelation and all 50 peaceful backgrounds are available on this player profile.'
              : 'Genesis, Exodus, and Leviticus are free. Premium opens Numbers through Revelation, all mastery records, and the full peaceful background collection.'}</Text>

            {hasPremium ? (
              <TactileButton label="Continue Bible Journey" icon={<Ionicons name="map" size={20} color={colors.onBrand} />} onPress={() => router.replace('/(tabs)/bible-journey')} />
            ) : (
              <TactileButton
                label="Unlock Complete Bible Journey"
                icon={<Ionicons name="diamond" size={20} color={colors.onBrand} />}
                disabled={busy}
                onPress={() => void purchase()}
              />
            )}
            <TactileButton
              variant="glass"
              label={busy ? 'Checking Purchase…' : 'Restore Purchase'}
              icon={<Ionicons name="refresh" size={19} color={colors.onSurface} />}
              disabled={busy}
              onPress={() => void restore()}
            />
          </GlassPanel>

          {message ? (
            <GlassPanel strong style={[styles.statusCard, hasPremium && styles.statusActive]}>
              <Ionicons
                name={hasPremium ? 'shield-checkmark' : status === 'store-unavailable' ? 'information-circle' : 'search'}
                size={24}
                color={hasPremium ? colors.success : colors.brand}
              />
              <View style={styles.statusCopy}>
                <Text style={styles.statusTitle}>{hasPremium ? 'Validated entitlement found' : status === 'store-unavailable' ? 'Store setup is still protected' : 'Restore result'}</Text>
                <Text style={styles.statusText}>{message}</Text>
              </View>
            </GlassPanel>
          ) : null}

          <SectionTitle title="Premium Includes" />
          <View style={styles.list}>
            {PREMIUM_FEATURES.map(([title, description]) => (
              <FeatureCard key={title} title={title} description={description} icon={<Ionicons name="diamond" size={24} color={colors.brand} />} accent={colors.brand} onPress={() => {}} disabled />
            ))}
          </View>

          <SectionTitle title="Always Free" />
          <View style={styles.list}>
            {ALWAYS_FREE.map(([title, description]) => (
              <FeatureCard key={title} title={title} description={description} icon={<Ionicons name="checkmark-circle" size={24} color={colors.success} />} accent={colors.success} onPress={() => {}} disabled />
            ))}
          </View>

          <GlassPanel style={styles.notice}>
            <Ionicons name="shield-checkmark" size={24} color={colors.brandSecondary} />
            <View style={styles.noticeCopy}>
              <Text style={styles.noticeTitle}>Honest store boundary</Text>
              <Text style={styles.noticeText}>This source branch will not create a local fake Premium flag. Until Apple and Google product configuration, native billing, receipt validation, and sandbox testing are connected, tapping unlock reports that the store is unavailable. No charge was attempted.</Text>
              <Text style={styles.productId}>Product: {productId}</Text>
            </View>
          </GlassPanel>

          <TactileButton variant="stone" label="Return to Book Library" onPress={() => router.replace('/book-library')} />
        </ScrollView>
      </SafeAreaView>
    </PeacefulBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md, maxWidth: 720, width: '100%', alignSelf: 'center' },
  hero: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  heroIcon: { width: 76, height: 76, borderRadius: 26, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.13)', alignItems: 'center', justifyContent: 'center' },
  heroIconActive: { backgroundColor: 'rgba(99,190,143,0.13)', borderColor: colors.success },
  heroEyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  heroTitle: { color: colors.onSurface, fontSize: 25, lineHeight: 31, fontWeight: '900', textAlign: 'center' },
  heroCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  statusCard: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  statusActive: { borderColor: colors.success },
  statusCopy: { flex: 1 },
  statusTitle: { color: colors.onSurface, fontSize: 14, fontWeight: '900' },
  statusText: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 3 },
  list: { gap: spacing.md },
  notice: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: colors.onSurface, fontSize: 14, fontWeight: '900' },
  noticeText: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 3 },
  productId: { color: colors.brand, fontSize: 9.5, fontWeight: '800', marginTop: 7 },
});
