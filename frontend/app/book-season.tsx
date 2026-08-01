import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import { colors, radii, spacing } from '@/src/theme';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { getBibleBook } from '@/src/bible-library';
import { getJourneyBook, isBookFree } from '@/src/bible-journey/catalog';
import { buildBookTrials } from '@/src/bible-journey/questions';
import { loadBibleJourneyProgress, type BibleJourneyProgress } from '@/src/bible-journey/progress';

export default function BookSeasonScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams<{ bookId?: string }>();
  const { profile } = useProfile();
  const [progress, setProgress] = useState<BibleJourneyProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const catalogBook = useMemo(() => getJourneyBook(String(bookId || '')), [bookId]);
  const bibleBook = useMemo(() => catalogBook ? getBibleBook(catalogBook.id) : undefined, [catalogBook]);
  const trials = useMemo(() => catalogBook && bibleBook ? buildBookTrials(bibleBook, catalogBook) : [], [bibleBook, catalogBook]);
  const hasPremium = Boolean(profile?.is_premium);
  const locked = Boolean(catalogBook && !isBookFree(catalogBook.id) && !hasPremium);

  const load = useCallback(async () => {
    if (!profile) return;
    setError(null);
    try {
      setProgress(await loadBibleJourneyProgress(profile.id));
    } catch {
      setError('This book’s saved progress could not be opened. Return to the library and try again.');
    }
  }, [profile]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  if (!profile) return null;

  if (!catalogBook || !bibleBook || trials.length !== 5) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.72}>
        <SafeAreaView style={styles.center}>
          <GlassPanel strong style={styles.fallbackCard}>
            <Ionicons name="warning" size={38} color={colors.coral} />
            <Text style={styles.fallbackTitle}>This Bible book could not be opened.</Text>
            <Text style={styles.fallbackText}>The link may be incomplete or the bundled Bible data may need verification.</Text>
            <TactileButton label="Return to Book Library" onPress={() => router.replace('/book-library')} />
          </GlassPanel>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  if (catalogBook.id === 'GEN') {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.62}>
        <SafeAreaView style={styles.center}>
          <GlassPanel strong style={styles.fallbackCard}>
            <Text style={styles.fallbackMark}>✦</Text>
            <Text style={styles.fallbackTitle}>Genesis has its own Tournament.</Text>
            <Text style={styles.fallbackText}>The original ten-gate Genesis gameplay remains untouched.</Text>
            <TactileButton label="Open Genesis Tournament" onPress={() => router.replace('/(tabs)/journey')} />
            <TactileButton variant="glass" label="Return to Book Library" onPress={() => router.replace('/book-library')} />
          </GlassPanel>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  if (locked) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.72}>
        <SafeAreaView style={styles.center}>
          <GlassPanel strong style={styles.fallbackCard}>
            <Ionicons name="lock-closed" size={42} color={colors.brand} />
            <Text style={styles.fallbackTitle}>{catalogBook.name} is included with Premium.</Text>
            <Text style={styles.fallbackText}>Genesis, Exodus, and Leviticus are free. Premium opens Numbers through Revelation.</Text>
            <TactileButton label="View Premium" onPress={() => router.replace('/premium')} />
            <TactileButton variant="glass" label="Return to Book Library" onPress={() => router.replace('/book-library')} />
          </GlassPanel>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  const bookProgress = progress?.books[catalogBook.id];
  const completedTrials = new Set(bookProgress?.completedTrials || []);
  const bookCompleted = Boolean(progress?.completedBookIds.includes(catalogBook.id));

  const openTrial = (trialIndex: number) => {
    const trial = trials[trialIndex];
    const unlocked = trialIndex === 0 || completedTrials.has(trials[trialIndex - 1].id);
    if (!unlocked) return;
    router.push({ pathname: '/book-trial', params: { bookId: catalogBook.id, trial: String(trial.number) } });
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.67}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader back eyebrow={`BOOK ${catalogBook.index} OF 66`} title={catalogBook.name} subtitle={catalogBook.theme} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GlassPanel strong style={styles.introCard}>
            <View style={styles.introTop}>
              <View style={styles.bookSeal}><Text style={styles.bookIcon}>{catalogBook.icon}</Text></View>
              <View style={styles.introCopy}>
                <Text style={styles.introLabel}>{catalogBook.testament.toUpperCase()}</Text>
                <Text style={styles.introTitle}>{bookCompleted ? `${catalogBook.name} Mastered` : `${completedTrials.size} of 5 trials complete`}</Text>
                <Text style={styles.introText}>{catalogBook.chapterCount} chapter{catalogBook.chapterCount === 1 ? '' : 's'} · Offline Scripture challenges</Text>
              </View>
            </View>
            <View style={styles.track}><View style={[styles.trackFill, { width: `${Math.min(100, completedTrials.size * 20)}%` }]} /></View>
            {bookCompleted || completedTrials.size === 5 ? (
              <TactileButton label="View Book Victory" onPress={() => router.push({ pathname: '/book-victory', params: { bookId: catalogBook.id } })} />
            ) : null}
          </GlassPanel>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Five Book Trials</Text>
            <Text style={styles.offline}>OFFLINE READY</Text>
          </View>

          <View style={styles.trialList}>
            {trials.map((trial, index) => {
              const completed = completedTrials.has(trial.id);
              const unlocked = index === 0 || completedTrials.has(trials[index - 1].id);
              const best = bookProgress?.bestResults[trial.id];
              return (
                <Pressable
                  key={trial.id}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !unlocked }}
                  accessibilityLabel={`${trial.title}. ${completed ? 'Completed' : unlocked ? 'Unlocked' : 'Locked'}.`}
                  onPress={() => openTrial(index)}
                  style={styles.trialPressable}
                >
                  <GlassPanel strong={unlocked && !completed} style={[styles.trialCard, !unlocked && styles.trialLocked]}>
                    <View style={[styles.trialNumber, completed && styles.trialDone]}>
                      {completed ? <Ionicons name="checkmark" size={20} color={colors.onBrand} /> : !unlocked ? <Ionicons name="lock-closed" size={17} color={colors.muted} /> : <Text style={styles.trialNumberText}>{trial.number}</Text>}
                    </View>
                    <View style={styles.trialCopy}>
                      <Text style={styles.trialTitle}>{trial.title}</Text>
                      <Text style={styles.trialText}>{trial.subtitle}</Text>
                      <Text style={styles.trialMeta}>{best ? `${best.percent}% BEST` : '5 Scripture questions'}</Text>
                    </View>
                    <Ionicons name={unlocked ? 'chevron-forward' : 'lock-closed'} size={19} color={unlocked ? colors.parchment : colors.muted} />
                  </GlassPanel>
                </Pressable>
              );
            })}
          </View>

          <TactileButton variant="glass" label="Return to Book Library" onPress={() => router.replace('/book-library')} />
          <Text style={styles.footer}>Trial replays can improve your best score. Completion credit is never duplicated.</Text>
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  fallbackCard: { borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'center', maxWidth: 600, width: '100%', alignSelf: 'center' },
  fallbackMark: { color: colors.brand, fontSize: 48 },
  fallbackTitle: { color: colors.onSurface, fontSize: 23, fontWeight: '900', textAlign: 'center' },
  fallbackText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md, maxWidth: 720, width: '100%', alignSelf: 'center' },
  error: { color: colors.coral, fontSize: 12, lineHeight: 18 },
  introCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  introTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bookSeal: { width: 66, height: 66, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.13)' },
  bookIcon: { fontSize: 33 },
  introCopy: { flex: 1 },
  introLabel: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  introTitle: { color: colors.onSurface, fontSize: 20, fontWeight: '900', marginTop: 2 },
  introText: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 3 },
  track: { height: 8, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' },
  trackFill: { height: '100%', borderRadius: 99, backgroundColor: colors.brand },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  sectionTitle: { color: colors.parchment, fontSize: 19, fontWeight: '900' },
  offline: { color: colors.success, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  trialList: { gap: spacing.sm },
  trialPressable: { borderRadius: radii.lg },
  trialCard: { borderRadius: radii.lg, minHeight: 104, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  trialLocked: { opacity: 0.54 },
  trialNumber: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.05)' },
  trialDone: { backgroundColor: colors.brand, borderColor: colors.brandLight },
  trialNumberText: { color: colors.onSurface, fontSize: 14, fontWeight: '900' },
  trialCopy: { flex: 1 },
  trialTitle: { color: colors.onSurface, fontSize: 16, fontWeight: '900' },
  trialText: { color: colors.muted, fontSize: 11.5, lineHeight: 16, marginTop: 3 },
  trialMeta: { color: colors.brand, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.6, marginTop: 6 },
  footer: { color: colors.muted, fontSize: 10.5, lineHeight: 15, textAlign: 'center' },
});
