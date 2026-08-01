import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import { usePreferences } from '@/src/preferences-context';
import { colors, radii, spacing } from '@/src/theme';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { PeacefulBackdrop, PeacefulScenePreview } from '@/src/components/premium/PeacefulBackdrop';
import {
  DEFAULT_PEACEFUL_SCENE_ID,
  PEACEFUL_SCENES,
  type PeacefulSceneCategory,
} from '@/src/backgrounds/peaceful-scenes';

const CATEGORIES: readonly PeacefulSceneCategory[] = [
  'Cross & Worship',
  'Bible Lands',
  'Water',
  'Mountains',
  'Forest & Garden',
  'Sky & Light',
];

export default function BackgroundPickerScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { preferences, updatePreferences } = usePreferences();
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const hasPremium = Boolean(profile?.is_premium);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return PEACEFUL_SCENES;
    return PEACEFUL_SCENES.filter((scene) =>
      scene.name.toLowerCase().includes(value)
      || scene.category.toLowerCase().includes(value)
      || scene.accessibilityLabel.toLowerCase().includes(value),
    );
  }, [query]);

  if (!profile) return null;

  const selectScene = async (sceneId: string, locked: boolean) => {
    if (locked) {
      router.push('/premium');
      return;
    }
    setSaving(true);
    try {
      await updatePreferences({ backgroundId: sceneId });
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (sceneId: string) => {
    const favorites = new Set(preferences.favoriteBackgroundIds);
    if (favorites.has(sceneId)) favorites.delete(sceneId);
    else favorites.add(sceneId);
    await updatePreferences({ favoriteBackgroundIds: [...favorites] });
  };

  return (
    <PeacefulBackdrop darkness={0.5}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader back eyebrow="PEACEFUL ATMOSPHERES" title="Choose Your Background" subtitle="Fifty original offline scenes for study, prayer, and play." />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <GlassPanel strong style={styles.currentCard}>
            <Text style={styles.currentLabel}>CURRENT EXPERIENCE</Text>
            <Text style={styles.currentTitle}>{PEACEFUL_SCENES.find((scene) => scene.id === preferences.backgroundId)?.name || 'Cross on the Hill'}</Text>
            <Text style={styles.currentText}>The default is a cross on a beautiful hill. Your selection stays on this device and works offline.</Text>
            <View style={styles.actionRow}>
              <TactileButton
                compact
                variant={preferences.backgroundRotationEnabled ? 'gold' : 'glass'}
                label={preferences.backgroundRotationEnabled ? 'Rotation On' : 'Random Rotation'}
                icon={<Ionicons name="shuffle" size={17} color={preferences.backgroundRotationEnabled ? colors.onBrand : colors.onSurface} />}
                onPress={() => void updatePreferences({ backgroundRotationEnabled: !preferences.backgroundRotationEnabled })}
                style={styles.actionButton}
              />
              <TactileButton
                compact
                variant="stone"
                label="Reset Default"
                onPress={() => void updatePreferences({ backgroundId: DEFAULT_PEACEFUL_SCENE_ID, backgroundRotationEnabled: false })}
                style={styles.actionButton}
              />
            </View>
            <Text style={styles.rotationNote}>Rotation changes once per local day and prefers your favorites. Free users rotate only through free scenes.</Text>
          </GlassPanel>

          <GlassPanel style={styles.searchPanel}>
            <Ionicons name="search" size={20} color={colors.brand} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search Bethlehem, lake, ocean, garden…"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search peaceful backgrounds"
              style={styles.searchInput}
            />
            {query ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Clear background search" onPress={() => setQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={colors.muted} />
              </Pressable>
            ) : null}
          </GlassPanel>

          {CATEGORIES.map((category) => {
            const scenes = filtered.filter((scene) => scene.category === category);
            if (!scenes.length) return null;
            return (
              <View key={category} style={styles.categorySection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{category}</Text>
                  <Text style={styles.sectionCount}>{scenes.length}</Text>
                </View>
                <View style={styles.sceneGrid}>
                  {scenes.map((scene) => {
                    const selected = preferences.backgroundId === scene.id;
                    const favorite = preferences.favoriteBackgroundIds.includes(scene.id);
                    const locked = scene.access === 'premium' && !hasPremium;
                    return (
                      <GlassPanel key={scene.id} strong={selected} style={[styles.sceneCard, locked && styles.lockedCard]}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${scene.name}. ${locked ? 'Premium background.' : selected ? 'Selected.' : 'Available.'}`}
                          disabled={saving}
                          onPress={() => void selectScene(scene.id, locked)}
                          style={styles.previewPressable}
                        >
                          <PeacefulScenePreview scene={scene} style={styles.preview} />
                          <View style={styles.sceneBadge}>
                            <Ionicons name={locked ? 'lock-closed' : selected ? 'checkmark-circle' : scene.access === 'free' ? 'leaf' : 'diamond'} size={14} color={locked ? colors.brand : selected ? colors.success : colors.parchment} />
                            <Text style={styles.sceneBadgeText}>{locked ? 'PREMIUM' : selected ? 'SELECTED' : scene.access.toUpperCase()}</Text>
                          </View>
                        </Pressable>
                        <View style={styles.sceneInfo}>
                          <View style={styles.sceneCopy}>
                            <Text style={styles.sceneName}>{scene.name}</Text>
                            <Text style={styles.sceneDescription} numberOfLines={2}>{scene.accessibilityLabel}</Text>
                          </View>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={favorite ? `Remove ${scene.name} from favorites` : `Add ${scene.name} to favorites`}
                            onPress={() => void toggleFavorite(scene.id)}
                            style={styles.favoriteButton}
                          >
                            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={21} color={favorite ? colors.coral : colors.muted} />
                          </Pressable>
                        </View>
                      </GlassPanel>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {filtered.length === 0 ? (
            <GlassPanel style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No peaceful scene matched that search.</Text>
              <TactileButton compact variant="glass" label="Show All 50" onPress={() => setQuery('')} />
            </GlassPanel>
          ) : null}

          <Text style={styles.footer}>These are original procedural scene designs bundled with Scripture Games—not downloaded stock photos.</Text>
        </ScrollView>
      </SafeAreaView>
    </PeacefulBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg, maxWidth: 820, width: '100%', alignSelf: 'center' },
  currentCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm },
  currentLabel: { color: colors.brand, fontSize: 8.5, fontWeight: '900', letterSpacing: 1.1 },
  currentTitle: { color: colors.onSurface, fontSize: 22, fontWeight: '900' },
  currentText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  actionButton: { flex: 1 },
  rotationNote: { color: colors.muted, fontSize: 9.5, lineHeight: 14 },
  searchPanel: { borderRadius: radii.lg, paddingHorizontal: spacing.md, minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { flex: 1, color: colors.onSurface, fontSize: 13.5, minHeight: 50 },
  clearButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  categorySection: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.parchment, fontSize: 19, fontWeight: '900' },
  sectionCount: { color: colors.muted, fontSize: 10, fontWeight: '900' },
  sceneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  sceneCard: { width: '48%', minWidth: 154, flexGrow: 1, borderRadius: radii.lg, padding: spacing.sm, gap: spacing.sm },
  lockedCard: { opacity: 0.84 },
  previewPressable: { borderRadius: 18, overflow: 'hidden' },
  preview: { minHeight: 128 },
  sceneBadge: { position: 'absolute', left: 9, top: 9, minHeight: 27, borderRadius: 99, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(5,10,19,0.78)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  sceneBadgeText: { color: colors.onSurface, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.6 },
  sceneInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sceneCopy: { flex: 1 },
  sceneName: { color: colors.onSurface, fontSize: 14, fontWeight: '900' },
  sceneDescription: { color: colors.muted, fontSize: 9.5, lineHeight: 13, marginTop: 2 },
  favoriteButton: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  emptyCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  emptyTitle: { color: colors.onSurface, fontSize: 16, fontWeight: '900', textAlign: 'center' },
  footer: { color: colors.muted, fontSize: 10.5, lineHeight: 15, textAlign: 'center' },
});
