import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PeacefulBackdrop } from '@/src/components/premium/PeacefulBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { TUTORIAL_STEPS } from '@/src/tutorial-core';
import { colors, radii, spacing } from '@/src/theme';

const TUTORIAL_COMPLETE_KEY = 'scripture_games_tutorial_completed_v1';
const TOUR_SECTIONS = 'Home · Journey · Games · Bible · Lumi · Settings · Premium';

export default function TutorialScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const step = TUTORIAL_STEPS[index];
  const last = index === TUTORIAL_STEPS.length - 1;
  const progress = useMemo(() => Math.round(((index + 1) / TUTORIAL_STEPS.length) * 100), [index]);

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await AsyncStorage.setItem(TUTORIAL_COMPLETE_KEY, new Date().toISOString());
    } finally {
      router.replace('/(tabs)/command');
    }
  };

  const notNow = () => router.replace('/(tabs)/command');

  return (
    <PeacefulBackdrop darkness={0.54}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader
          back
          eyebrow={`APP TOUR · ${index + 1} OF ${TUTORIAL_STEPS.length}`}
          title="App Tour & Tutorial"
          subtitle="Optional guidance you can replay from Settings at any time."
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.progressRow}>
            <View style={styles.track}><View style={[styles.trackFill, { width: `${progress}%` }]} /></View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          <GlassPanel strong style={styles.card}>
            <View style={styles.iconShell}>
              <Ionicons name={step.icon as keyof typeof Ionicons.glyphMap} size={34} color={colors.brand} />
            </View>
            <Text style={styles.eyebrow}>{step.eyebrow}</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>

            <View style={styles.points}>
              {step.points.map((point) => (
                <View key={point} style={styles.pointRow}>
                  <View style={styles.pointDot}><Ionicons name="checkmark" size={14} color={colors.onBrand} /></View>
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>
          </GlassPanel>

          <View style={styles.dots} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: TUTORIAL_STEPS.length, now: index + 1 }}>
            {TUTORIAL_STEPS.map((item, itemIndex) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Go to tutorial section ${itemIndex + 1}: ${item.title}`}
                onPress={() => setIndex(itemIndex)}
                style={[styles.dot, itemIndex === index && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <TactileButton
              variant="glass"
              label="Not Now"
              onPress={notNow}
            />
            {index > 0 ? (
              <TactileButton
                variant="stone"
                label="Previous"
                onPress={() => setIndex((value) => Math.max(0, value - 1))}
              />
            ) : null}
            <TactileButton
              label={last ? 'Finish Tutorial' : 'Next'}
              disabled={saving}
              onPress={() => {
                if (last) {
                  void finish();
                } else {
                  setIndex((value) => Math.min(TUTORIAL_STEPS.length - 1, value + 1));
                }
              }}
            />
          </View>

          <Text style={styles.sections}>This tour covers: {TOUR_SECTIONS}</Text>
          <Text style={styles.footer}>Welcome to Scripture Games. Nothing in this tutorial changes gameplay or player progress.</Text>
        </ScrollView>
      </SafeAreaView>
    </PeacefulBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg, maxWidth: 700, width: '100%', alignSelf: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  track: { flex: 1, height: 8, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.11)' },
  trackFill: { height: '100%', borderRadius: 99, backgroundColor: colors.brand },
  progressText: { color: colors.parchment, fontSize: 10, fontWeight: '900', minWidth: 34, textAlign: 'right' },
  card: { borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md },
  iconShell: { width: 68, height: 68, borderRadius: 23, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.14)', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.onSurface, fontSize: 30, lineHeight: 35, fontWeight: '900' },
  description: { color: colors.parchment, fontSize: 14, lineHeight: 21 },
  points: { gap: spacing.md, marginTop: spacing.sm },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  pointDot: { width: 24, height: 24, borderRadius: 9, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  pointText: { flex: 1, color: colors.muted, fontSize: 12.5, lineHeight: 19 },
  dots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)' },
  dotActive: { width: 28, backgroundColor: colors.brand },
  actions: { gap: spacing.sm },
  sections: { color: colors.brand, fontSize: 10.5, lineHeight: 16, textAlign: 'center', fontWeight: '800' },
  footer: { color: colors.muted, fontSize: 10.5, lineHeight: 16, textAlign: 'center' },
});
