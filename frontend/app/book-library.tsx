import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import { usePremiumEntitlement } from '@/src/premium-entitlement';
import { colors, radii, spacing } from '@/src/theme';
import { PeacefulBackdrop } from '@/src/components/premium/PeacefulBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { BIBLE_JOURNEY_BOOKS, type JourneyBook, type JourneyTestament } from '@/src/bible-journey/catalog';
import { canOpenJourneyBook, getJourneyAccessLabel } from '@/src/bible-journey/access';
import { loadBibleJourneyProgress, type BibleJourneyProgress } from '@/src/bible-journey/progress';

export default function BookLibraryScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const [query, setQuery] = useState('');
  const [progress, setProgress] = useState<BibleJourneyProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { hasPremium } = usePremiumEntitlement();

  const load = useCallback(async () => {
    if (!profile) return;
    setError(null);
    try {
      setProgress(await loadBibleJourneyProgress(profile.id));
    } catch {
      setError('Your saved book progress could not be loaded. The Bible library is still available.');
    }
  }, [profile]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return BIBLE_JOURNEY_BOOKS;
    return BIBLE_JOURNEY_BOOKS.filter((book) =>
      book.name.toLowerCase().includes(value)
      || book.theme.toLowerCase().includes(value)
      || book.testament.toLowerCase().includes(value),
    );
  }, [query]);

  const openBook = (book: JourneyBook) => {
    if (book.id === 'GEN') {
      router.push('/(tabs)/journey');
      return;
    }
    if (!canOpenJourneyBook(book, hasPremium)) {
      router.push('/premium');
      return;
    }
    router.push({ pathname: '/book-season', params: { bookId: book.id } });
  };

  if (!profile) return null;

  return (
    <PeacefulBackdrop darkness={0.58}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader back eyebrow="66-BOOK LIBRARY" title="Choose Any Bible Book" subtitle="Browse the whole journey without losing your recommended path." />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <GlassPanel strong style={styles.searchPanel}>
            <Ionicons name="search" size={20} color={colors.brand} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search books, themes, or testament"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search the Bible book library"
              style={styles.searchInput}
            />
            {query ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={colors.muted} />
              </Pressable>
            ) : null}
          </GlassPanel>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GlassPanel strong style={styles.premiumPanel}>
            <View style={styles.premiumCopy}>
              <Text style={styles.premiumTitle}>Free books and Premium books</Text>
              <Text style={styles.premiumText}>Genesis, Exodus, and Leviticus are FREE. Every card from Numbers through Revelation is labeled PREMIUM REQUIRED until a validated Premium entitlement is active.</Text>
            </View>
            {!hasPremium ? <TactileButton compact label="View Premium Options" onPress={() => router.push('/premium')} /> : <Text style={styles.premiumActive}>PREMIUM ACTIVE</Text>}
          </GlassPanel>

          {(['Old Testament', 'New Testament'] as JourneyTestament[]).map((testament) => {
            const books = filtered.filter((book) => book.testament === testament);
            if (books.length === 0) return null;
            return (
              <View key={testament} style={styles.testamentSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{testament}</Text>
                  <Text style={styles.sectionCount}>{books.length} shown</Text>
                </View>
                <View style={styles.bookList}>
                  {books.map((book) => {
                    const saved = progress?.books[book.id];
                    const completed = Boolean(progress?.completedBookIds.includes(book.id));
                    const inProgress = !completed && Boolean(saved?.completedTrials.length);
                    const status = completed ? 'Completed' : inProgress ? 'In Progress' : 'Not Started';
                    const locked = !canOpenJourneyBook(book, hasPremium);
                    return (
                      <Pressable
                        key={book.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${book.name}. ${status}. ${locked ? 'Premium required.' : 'Available.'}`}
                        onPress={() => openBook(book)}
                        style={styles.bookPressable}
                      >
                        <GlassPanel strong={completed || inProgress} style={[styles.bookCard, locked && styles.lockedCard]}>
                          <View style={[styles.bookNumber, completed && styles.bookNumberDone]}>
                            {completed ? <Ionicons name="checkmark" size={20} color={colors.onBrand} /> : <Text style={styles.bookNumberText}>{book.index}</Text>}
                          </View>
                          <View style={styles.bookCopy}>
                            <View style={styles.bookTitleRow}>
                              <Text style={styles.bookIcon}>{book.icon}</Text>
                              <Text style={styles.bookTitle}>{book.name}</Text>
                            </View>
                            <Text style={styles.bookTheme}>{book.theme}</Text>
                            <View style={styles.metaRow}>
                              <Text style={[styles.status, completed && styles.completed, inProgress && styles.inProgress]}>{status}</Text>
                              <Text style={styles.dot}>•</Text>
                              <Text style={styles.meta}>{book.chapterCount} chapter{book.chapterCount === 1 ? '' : 's'}</Text>
                              <Text style={styles.dot}>•</Text>
                              <Text style={[styles.meta, locked && styles.premium]}>{getJourneyAccessLabel(book, hasPremium)}</Text>
                            </View>
                          </View>
                          <Ionicons name={locked ? 'lock-closed' : 'chevron-forward'} size={20} color={locked ? colors.brand : colors.parchment} />
                        </GlassPanel>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {filtered.length === 0 ? (
            <GlassPanel style={styles.emptyCard}>
              <Ionicons name="book-outline" size={32} color={colors.muted} />
              <Text style={styles.emptyTitle}>No books matched that search.</Text>
              <Text style={styles.emptyText}>Try the full book name or a theme such as wisdom, courage, prayer, or grace.</Text>
            </GlassPanel>
          ) : null}

          <Text style={styles.footer}>Completing chapters or free books never unlocks Books 4–66. Those books remain Premium-only until a validated entitlement is active.</Text>
        </ScrollView>
      </SafeAreaView>
    </PeacefulBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg, maxWidth: 760, width: '100%', alignSelf: 'center' },
  searchPanel: { borderRadius: radii.lg, paddingHorizontal: spacing.md, minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { flex: 1, color: colors.onSurface, fontSize: 14, minHeight: 50 },
  clearButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.coral, fontSize: 12, lineHeight: 18 },
  premiumPanel: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.md },
  premiumCopy: { gap: 4 },
  premiumTitle: { color: colors.onSurface, fontSize: 16, fontWeight: '900' },
  premiumText: { color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  premiumActive: { color: colors.success, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  testamentSection: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.parchment, fontSize: 20, fontWeight: '900' },
  sectionCount: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  bookList: { gap: spacing.sm },
  bookPressable: { borderRadius: radii.lg },
  bookCard: { borderRadius: radii.lg, minHeight: 108, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  lockedCard: { opacity: 0.82 },
  bookNumber: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.05)' },
  bookNumberDone: { backgroundColor: colors.brand, borderColor: colors.brandLight },
  bookNumberText: { color: colors.parchment, fontSize: 13, fontWeight: '900' },
  bookCopy: { flex: 1 },
  bookTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  bookIcon: { fontSize: 19 },
  bookTitle: { color: colors.onSurface, fontSize: 17, fontWeight: '900' },
  bookTheme: { color: colors.muted, fontSize: 11.5, lineHeight: 16, marginTop: 3 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginTop: 7 },
  status: { color: colors.muted, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  completed: { color: colors.success },
  inProgress: { color: colors.brandSecondary },
  meta: { color: colors.muted, fontSize: 9.5, fontWeight: '700' },
  premium: { color: colors.brand },
  dot: { color: colors.muted, fontSize: 9 },
  emptyCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyTitle: { color: colors.onSurface, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  footer: { color: colors.muted, fontSize: 10.5, lineHeight: 15, textAlign: 'center' },
});
