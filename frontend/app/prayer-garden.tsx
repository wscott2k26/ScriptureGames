import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import {
  addPrayer,
  deletePrayer,
  loadPrayers,
  setPrayerAnswered,
  type PrayerCategory,
  type PrayerEntry,
} from '@/src/prayer-garden';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { colors, radii, spacing } from '@/src/theme';

const CATEGORIES: { id: PrayerCategory; label: string; icon: string }[] = [
  { id: 'personal', label: 'Personal', icon: '🙏' },
  { id: 'family', label: 'Family', icon: '🏠' },
  { id: 'health', label: 'Health', icon: '❤️' },
  { id: 'work', label: 'Work', icon: '🛠️' },
  { id: 'gratitude', label: 'Gratitude', icon: '✨' },
  { id: 'other', label: 'Other', icon: '🕊️' },
];

export default function PrayerGardenScreen() {
  const { profile } = useProfile();
  const [entries, setEntries] = useState<PrayerEntry[]>([]);
  const [tab, setTab] = useState<'active' | 'answered'>('active');
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('personal');
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setEntries(await loadPrayers(profile.id));
  }, [profile]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const shown = useMemo(() => entries.filter((entry) => entry.status === tab), [entries, tab]);
  const activeCount = entries.filter((entry) => entry.status === 'active').length;
  const answeredCount = entries.filter((entry) => entry.status === 'answered').length;

  if (!profile) return null;

  const save = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await addPrayer(profile.id, title, details, category);
      setTitle('');
      setDetails('');
      setCategory('personal');
      setFormOpen(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleAnswered = async (entry: PrayerEntry) => {
    await setPrayerAnswered(entry.id, entry.status !== 'answered');
    await refresh();
  };

  const remove = (entry: PrayerEntry) => {
    Alert.alert('Delete this prayer?', 'This removes it from this device and from the next cloud backup.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePrayer(entry.id);
          await refresh();
        },
      },
    ]);
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-04']} darkness={0.72}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          back
          eyebrow="PRIVATE PRAYER LIFE"
          title="Prayer Garden"
          subtitle="Carry requests, remember answers, and pray without a public feed."
          right={
            <Pressable accessibilityRole="button" accessibilityLabel={formOpen ? 'Close prayer form' : 'Add a prayer'} onPress={() => setFormOpen((open) => !open)}>
              <GlassPanel style={styles.addButton}><Ionicons name={formOpen ? 'close' : 'add'} size={25} color={colors.brand} /></GlassPanel>
            </Pressable>
          }
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <GlassPanel strong style={styles.hero}>
            <Text style={styles.heroIcon}>🌿</Text>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>A private place to keep praying</Text>
              <Text style={styles.heroText}>Requests remain on your device and are included only when you deliberately use Scripture Games cloud backup.</Text>
            </View>
          </GlassPanel>

          {formOpen ? (
            <GlassPanel strong style={styles.form}>
              <Text style={styles.formTitle}>Plant a prayer</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                maxLength={80}
                placeholder="Short title, such as Mom’s appointment"
                placeholderTextColor={colors.muted}
                style={styles.titleInput}
              />
              <TextInput
                value={details}
                onChangeText={setDetails}
                maxLength={1200}
                multiline
                textAlignVertical="top"
                placeholder="Add the details you want to remember…"
                placeholderTextColor={colors.muted}
                style={styles.detailsInput}
              />
              <Text style={styles.categoryLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => setCategory(item.id)}
                    style={[styles.categoryChip, category === item.id && styles.categoryChipActive]}
                  >
                    <Text style={styles.categoryIcon}>{item.icon}</Text>
                    <Text style={[styles.categoryText, category === item.id && styles.categoryTextActive]}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
              <TactileButton
                compact
                label={saving ? 'Saving Prayer…' : 'Save Prayer'}
                disabled={!title.trim() || saving}
                onPress={() => void save()}
              />
            </GlassPanel>
          ) : null}

          <View style={styles.tabs}>
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === 'active' }} onPress={() => setTab('active')} style={[styles.tab, tab === 'active' && styles.tabActive]}>
              <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Praying · {activeCount}</Text>
            </Pressable>
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === 'answered' }} onPress={() => setTab('answered')} style={[styles.tab, tab === 'answered' && styles.tabActive]}>
              <Text style={[styles.tabText, tab === 'answered' && styles.tabTextActive]}>Answered · {answeredCount}</Text>
            </Pressable>
          </View>

          {shown.length === 0 ? (
            <GlassPanel style={styles.empty}>
              <Text style={styles.emptyIcon}>{tab === 'active' ? '🌱' : '✨'}</Text>
              <Text style={styles.emptyTitle}>{tab === 'active' ? 'No active prayers yet' : 'Answered prayers will appear here'}</Text>
              <Text style={styles.emptyText}>{tab === 'active' ? 'Use the plus button to add the first request you want to carry.' : 'Mark a prayer answered when you want to remember what changed.'}</Text>
            </GlassPanel>
          ) : null}

          {shown.map((entry) => {
            const categoryInfo = CATEGORIES.find((item) => item.id === entry.category) || CATEGORIES[5];
            return (
              <GlassPanel key={entry.id} strong style={[styles.prayerCard, entry.status === 'answered' && styles.answeredCard]}>
                <View style={styles.prayerTop}>
                  <View style={styles.prayerIdentity}>
                    <Text style={styles.prayerIcon}>{categoryInfo.icon}</Text>
                    <View style={styles.prayerCopy}>
                      <Text style={styles.prayerTitle}>{entry.title}</Text>
                      <Text style={styles.prayerMeta}>{categoryInfo.label} · {new Date(entry.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${entry.title}`} onPress={() => remove(entry)} hitSlop={10}>
                    <Ionicons name="trash-outline" size={19} color={colors.muted} />
                  </Pressable>
                </View>
                {entry.details ? <Text style={styles.prayerDetails}>{entry.details}</Text> : null}
                {entry.answeredAt ? <Text style={styles.answeredDate}>Remembered as answered on {new Date(entry.answeredAt).toLocaleDateString()}</Text> : null}
                <TactileButton
                  compact
                  variant={entry.status === 'answered' ? 'stone' : 'glass'}
                  label={entry.status === 'answered' ? 'Return to Praying' : 'Mark Answered'}
                  onPress={() => void toggleAnswered(entry)}
                />
              </GlassPanel>
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
  addButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroIcon: { fontSize: 38 },
  heroCopy: { flex: 1 },
  heroTitle: { color: colors.onSurface, fontSize: 18, fontWeight: '900' },
  heroText: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: 4 },
  form: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  formTitle: { color: colors.onSurface, fontSize: 20, fontWeight: '900' },
  titleInput: { minHeight: 49, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(3,7,14,0.76)', color: colors.onSurface, paddingHorizontal: spacing.md, fontSize: 14 },
  detailsInput: { minHeight: 115, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(3,7,14,0.76)', color: colors.onSurface, padding: spacing.md, fontSize: 14, lineHeight: 20 },
  categoryLabel: { color: colors.parchment, fontSize: 12, fontWeight: '900' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryChip: { minWidth: '30%', flexGrow: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingVertical: 9, paddingHorizontal: 10, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.035)' },
  categoryChipActive: { borderColor: colors.brand, backgroundColor: 'rgba(232,185,87,0.14)' },
  categoryIcon: { fontSize: 18 },
  categoryText: { color: colors.muted, fontSize: 10.5, fontWeight: '900', marginTop: 2 },
  categoryTextActive: { color: colors.onSurface },
  tabs: { flexDirection: 'row', borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 4, backgroundColor: 'rgba(4,9,18,0.74)' },
  tab: { flex: 1, borderRadius: 14, paddingVertical: 11, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(232,185,87,0.15)' },
  tabText: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  tabTextActive: { color: colors.brand },
  empty: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center' },
  emptyIcon: { fontSize: 38 },
  emptyTitle: { color: colors.onSurface, fontSize: 17, fontWeight: '900', marginTop: spacing.sm },
  emptyText: { color: colors.muted, fontSize: 12.5, lineHeight: 18, textAlign: 'center', marginTop: 4 },
  prayerCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  answeredCard: { borderColor: 'rgba(88,203,140,0.62)' },
  prayerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  prayerIdentity: { flex: 1, flexDirection: 'row', gap: spacing.sm },
  prayerIcon: { fontSize: 24 },
  prayerCopy: { flex: 1 },
  prayerTitle: { color: colors.onSurface, fontSize: 17, fontWeight: '900' },
  prayerMeta: { color: colors.muted, fontSize: 10.5, fontWeight: '800', marginTop: 2 },
  prayerDetails: { color: colors.onSurface, fontSize: 14, lineHeight: 22 },
  answeredDate: { color: colors.success, fontSize: 11, fontWeight: '900' },
});
