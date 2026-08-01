import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import { colors, radii, spacing } from '@/src/theme';
import { PeacefulBackdrop } from '@/src/components/premium/PeacefulBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { loadSeasonProgress, type SeasonProgress } from '@/src/season-progress';
import { BIBLE_JOURNEY_BOOKS, getJourneyBook, isBookFree } from '@/src/bible-journey/catalog';
import { getSequentialBookId, type BibleJourneyProgress } from '@/src/bible-journey/progress-core';
import { loadBibleJourneyProgress, syncGenesisJourneyCompletion } from '@/src/bible-journey/progress';

export default function BibleJourneyHub() {
  const router = useRouter();
  const { profile } = useProfile();
  const [progress, setProgress] = useState<BibleJourneyProgress | null>(null);
  const [genesis, setGenesis] = useState<SeasonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setError(null);
    try {
      const [season, saved] = await Promise.all([
        loadSeasonProgress(profile.id),
        loadBibleJourneyProgress(profile.id),
      ]);
      const synced = await syncGenesisJourneyCompletion(profile.id, season.completedTrials.length);
      setGenesis(season);
      setProgress(synced.progress.completedBookIds.length >= saved.completedBookIds.length ? synced.progress : saved);
    } catch {
      setError('Your Bible Journey could not be opened. Your Genesis Tournament progress is still safe.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const completed = useMemo(() => new Set(progress?.completedBookIds || []), [progress?.completedBookIds]);
  const oldCompleted = BIBLE_JOURNEY_BOOKS.filter((book) => book.testament === 'Old Testament' && completed.has(book.id)).length;
  const newCompleted = BIBLE_JOURNEY_BOOKS.filter((book) => book.testament === 'New Testament' && completed.has(book.id)).length;
  const nextBookId = progress ? getSequentialBookId(progress) : 'GEN';
  const nextBook = nextBookId ? getJourneyBook(nextBookId) : undefined;
  const hasPremium = Boolean(profile?.is_premium);

  const openBook = (bookId: string) => {
    if (bookId === 'GEN') {
      router.push('/(tabs)/journey');
      return;
    }
    if (!isBookFree(bookId) && !hasPremium) {
      router.push('/premium');
      return;
    }
    router.push({ pathname: '/book-season', params: { bookId } });
  };

  if (!profile) return null;

  return (
    <PeacefulBackdrop darkness={0.5}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        >
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>THE COMPLETE BIBLE JOURNEY</Text>
            <Text style={styles.title}>Walk through all 66 books.</Text>
            <Text style={styles.subtitle}>Begin with Genesis and unlock the Bible in order, or choose any available book whenever you want.</Text>
          </View>

          {error ? (
            <GlassPanel strong style={styles.errorCard}>
              <Ionicons name="warning" size={25} color={colors.coral} />
              <Text style={styles.errorText}>{error}</Text>
              <TactileButton compact variant="stone" label="Try Again" onPress={() => void load()} />
            </GlassPanel>
          ) : null}

          <GlassPanel strong style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.bookSeal}><Text style={styles.bookSealText}>{nextBook?.icon || '✺'}</Text></View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroLabel}>{nextBook ? `BOOK ${nextBook.index} OF 66` : 'JOURNEY COMPLETE'}</Text>
                <Text style={styles.heroTitle}>{loading ? 'Opening your journey…' : nextBook?.name || 'Every Book Completed'}</Text>
                <Text style={styles.heroText}>{nextBook?.theme || 'You have walked from Genesis through Revelation.'}</Text>
              </View>
            </View>
            <View style={styles.track}><View style={[styles.trackFill, { width: `${Math.round((completed.size / 66) * 100)}%` }]} /></View>
            <Text style={styles.progressText}>{completed.size} of 66 books completed</Text>
            {nextBook ? (
              <TactileButton
                label="Continue Bible Journey"
                icon={<Ionicons name="arrow-forward-circle" size={20} color={colors.onBrand} />}
                onPress={() => openBook(nextBook.id)}
              />
            ) : (
              <TactileButton label="View My Completed Library" onPress={() => router.push('/book-library')} />
            )}
            <TactileButton variant="glass" label="Choose Any Book" onPress={() => router.push('/book-library')} />
          </GlassPanel>

          <View style={styles.statsRow}>
            <GlassPanel style={styles.statCard}>
              <Text style={styles.statValue}>{oldCompleted}/39</Text>
              <Text style={styles.statLabel}>OLD TESTAMENT</Text>
            </GlassPanel>
            <GlassPanel style={styles.statCard}>
              <Text style={styles.statValue}>{newCompleted}/27</Text>
              <Text style={styles.statLabel}>NEW TESTAMENT</Text>
            </GlassPanel>
            <GlassPanel style={styles.statCard}>
              <Text style={styles.statValue}>{genesis?.completedTrials.length || 0}/10</Text>
              <Text style={styles.statLabel}>GENESIS GATES</Text>
            </GlassPanel>
          </View>

          <GlassPanel style={styles.genesisCard}>
            <View style={styles.genesisIcon}><Text style={styles.genesisIconText}>✦</Text></View>
            <View style={styles.genesisCopy}>
              <Text style={styles.genesisLabel}>SPECIAL FIRST SEASON</Text>
              <Text style={styles.genesisTitle}>Genesis Tournament</Text>
              <Text style={styles.genesisText}>Your original ten-trial Genesis arena remains exactly as built—faction, Manna, rank, choices, scores, and Victory Hall included.</Text>
            </View>
            <TactileButton compact variant="bronze" label="Open Genesis" onPress={() => router.push('/(tabs)/journey')} />
          </GlassPanel>

          <GlassPanel style={styles.accessCard}>
            <Ionicons name={hasPremium ? 'diamond' : 'lock-closed'} size={25} color={colors.brand} />
            <View style={styles.accessCopy}>
              <Text style={styles.accessTitle}>{hasPremium ? 'Complete Journey Unlocked' : 'The first three books are free'}</Text>
              <Text style={styles.accessText}>{hasPremium ? 'All 66 Bible books are available on this player profile.' : 'Play Genesis, Exodus, and Leviticus. Numbers through Revelation unlock with Premium.'}</Text>
            </View>
            {!hasPremium ? <TactileButton compact variant="glass" label="See Premium" onPress={() => router.push('/premium')} /> : null}
          </GlassPanel>

          <Text style={styles.footer}>Progress is stored locally and the Bible Journey is designed for offline play.</Text>
        </ScrollView>
      </SafeAreaView>
    </PeacefulBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 110, gap: spacing.md, maxWidth: 760, width: '100%', alignSelf: 'center' },
  heading: { gap: 5, paddingVertical: spacing.sm },
  eyebrow: { color: colors.brand, fontSize: 9.5, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.onSurface, fontSize: 30, lineHeight: 35, fontWeight: '900' },
  subtitle: { color: colors.parchment, fontSize: 13, lineHeight: 20, maxWidth: 590 },
  heroCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bookSeal: { width: 68, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(232,185,87,0.14)', borderWidth: 1, borderColor: colors.borderStrong },
  bookSealText: { fontSize: 34 },
  heroCopy: { flex: 1 },
  heroLabel: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  heroTitle: { color: colors.onSurface, fontSize: 24, fontWeight: '900', marginTop: 2 },
  heroText: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: 3 },
  track: { height: 8, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.09)' },
  trackFill: { height: '100%', borderRadius: 99, backgroundColor: colors.brand },
  progressText: { color: colors.parchment, fontSize: 11, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, minHeight: 82, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', padding: spacing.sm },
  statValue: { color: colors.onSurface, fontSize: 19, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 7, letterSpacing: 0.7, fontWeight: '900', textAlign: 'center', marginTop: 3 },
  genesisCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  genesisIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandTertiary },
  genesisIconText: { color: colors.brand, fontSize: 29 },
  genesisCopy: { gap: 3 },
  genesisLabel: { color: colors.brand, fontSize: 8.5, fontWeight: '900', letterSpacing: 1.1 },
  genesisTitle: { color: colors.onSurface, fontSize: 20, fontWeight: '900' },
  genesisText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  accessCard: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.md },
  accessCopy: { flex: 1 },
  accessTitle: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  accessText: { color: colors.muted, fontSize: 11.5, lineHeight: 16, marginTop: 2 },
  errorCard: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  errorText: { color: colors.parchment, fontSize: 12, lineHeight: 18 },
  footer: { color: colors.muted, textAlign: 'center', fontSize: 10.5, lineHeight: 15 },
});
