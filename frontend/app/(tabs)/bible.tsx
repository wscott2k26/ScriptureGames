import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import {
  BIBLE_BUILD_META,
  BIBLE_LIBRARY,
  chapterKey,
  formatBibleReference,
  getBibleBook,
  getBibleChapter,
  parseBibleReference,
  searchBible,
  verseKey,
} from '@/src/bible-library';
import {
  cycleBibleHighlight,
  loadBibleStudy,
  recordBibleLocation,
  saveBibleVerseNote,
  saveSermonNote,
  setBibleReaderPreferences,
  toggleBibleBookmark,
  type BibleHighlight,
  type BibleStudyState,
} from '@/src/bible-study';
import type { BibleLocation, BibleSearchResult } from '@/src/bible-types';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';

const HIGHLIGHT_BACKGROUNDS: Record<BibleHighlight, string> = {
  gold: 'rgba(233,188,98,0.19)',
  sky: 'rgba(121,210,228,0.17)',
  mint: 'rgba(87,195,153,0.17)',
  rose: 'rgba(241,140,99,0.17)',
};

function locationFromResult(result: BibleSearchResult): BibleLocation {
  return { bookId: result.bookId, chapter: result.chapter, verse: result.verse };
}

export default function BibleCompanionScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { profile } = useProfile();
  const [study, setStudy] = useState<BibleStudyState | null>(null);
  const [bookId, setBookId] = useState('JHN');
  const [chapter, setChapter] = useState(1);
  const [focusedVerse, setFocusedVerse] = useState<number | undefined>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BibleSearchResult[]>([]);
  const [showBooks, setShowBooks] = useState(false);
  const [selectedNoteKey, setSelectedNoteKey] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [sermonDraft, setSermonDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const next = await loadBibleStudy(profile.id);
      const restoredBook = getBibleBook(next.lastLocation.bookId) || BIBLE_LIBRARY[0];
      if (restoredBook) {
        const restoredChapter = Math.max(1, Math.min(restoredBook.chapters.length, next.lastLocation.chapter));
        setBookId(restoredBook.id);
        setChapter(restoredChapter);
        setFocusedVerse(next.lastLocation.verse);
        setSermonDraft(next.sermonNotes[chapterKey(restoredBook.id, restoredChapter)] || '');
      }
      setStudy(next);
    } catch {
      Alert.alert('Bible Study Desk', 'Your saved Bible notes could not be restored. No other player data was changed.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const book = useMemo(() => getBibleBook(bookId) || BIBLE_LIBRARY[0], [bookId]);
  const verses = useMemo(() => book ? getBibleChapter(book.id, chapter) : [], [book, chapter]);
  const currentLocation = useMemo<BibleLocation>(() => ({ bookId: book?.id || 'JHN', chapter, verse: focusedVerse }), [book?.id, chapter, focusedVerse]);
  const currentReference = formatBibleReference(currentLocation);
  const selectedVerse = focusedVerse ? verses.find(([number]) => number === focusedVerse) : undefined;
  const fontSize = study?.fontSize === 'church' ? 27 : study?.fontSize === 'large' ? 22 : 18;
  const lineHeight = study?.fontSize === 'church' ? 40 : study?.fontSize === 'large' ? 33 : 28;

  const moveTo = useCallback(async (location: BibleLocation) => {
    if (!profile) return;
    const nextBook = getBibleBook(location.bookId);
    if (!nextBook) return;
    const nextChapter = Math.max(1, Math.min(nextBook.chapters.length, location.chapter));
    setBookId(nextBook.id);
    setChapter(nextChapter);
    setFocusedVerse(location.verse);
    setQuery('');
    setResults([]);
    setShowBooks(false);
    setSelectedNoteKey(null);
    setSermonDraft(study?.sermonNotes[chapterKey(nextBook.id, nextChapter)] || '');
    const next = await recordBibleLocation(profile.id, { bookId: nextBook.id, chapter: nextChapter, verse: location.verse });
    setStudy(next);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: true }));
  }, [profile, study?.sermonNotes]);

  const runSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const reference = parseBibleReference(trimmed);
    if (reference) {
      sfx.tap();
      void moveTo(reference);
      return;
    }
    const found = searchBible(trimmed, 60);
    setResults(found);
    if (!found.length) sfx.warning();
    else sfx.tap();
  };

  const changeChapter = (next: number) => {
    if (!book) return;
    void moveTo({ bookId: book.id, chapter: Math.max(1, Math.min(book.chapters.length, next)) });
  };

  const selectBook = (nextBookId: string) => {
    void moveTo({ bookId: nextBookId, chapter: 1 });
  };

  const toggleBookmark = async (referenceKey: string) => {
    if (!profile) return;
    sfx.tap();
    setStudy(await toggleBibleBookmark(profile.id, referenceKey));
  };

  const cycleHighlight = async (referenceKey: string) => {
    if (!profile) return;
    sfx.tap();
    setStudy(await cycleBibleHighlight(profile.id, referenceKey));
  };

  const openVerseNote = (referenceKey: string) => {
    setSelectedNoteKey(referenceKey);
    setNoteDraft(study?.verseNotes[referenceKey] || '');
  };

  const saveVerseNote = async () => {
    if (!profile || !selectedNoteKey) return;
    setSaving(true);
    try {
      setStudy(await saveBibleVerseNote(profile.id, selectedNoteKey, noteDraft));
      setSelectedNoteKey(null);
      sfx.correct();
    } finally {
      setSaving(false);
    }
  };

  const saveChapterNotes = async () => {
    if (!profile || !book) return;
    setSaving(true);
    try {
      setStudy(await saveSermonNote(profile.id, chapterKey(book.id, chapter), sermonDraft));
      sfx.correct();
    } finally {
      setSaving(false);
    }
  };

  const toggleChurchMode = async () => {
    if (!profile || !study) return;
    const nextMode = !study.churchMode;
    sfx.tap();
    setStudy(await setBibleReaderPreferences(profile.id, {
      churchMode: nextMode,
      fontSize: nextMode ? 'church' : 'standard',
    }));
  };

  const cycleFontSize = async () => {
    if (!profile || !study) return;
    const next = study.fontSize === 'standard' ? 'large' : study.fontSize === 'large' ? 'church' : 'standard';
    setStudy(await setBibleReaderPreferences(profile.id, { fontSize: next, churchMode: next === 'church' }));
  };

  const shareVerse = async (verse: number, text: string) => {
    if (!book) return;
    await Share.share({
      title: `${book.name} ${chapter}:${verse}`,
      message: `“${text}”\n— ${book.name} ${chapter}:${verse} (WEB)`,
    });
  };

  if (!profile) return null;

  if (loading) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-03']} darkness={0.65}>
        <SafeAreaView style={styles.center} edges={['top']}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.loadingText}>Opening your Bible and study desk…</Text>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  if (!BIBLE_BUILD_META.complete || !book) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-03']} darkness={0.68}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScreenHeader eyebrow="BIBLE LIBRARY" title="Release Library Required" subtitle="The development tree has not generated its full offline Bible yet." />
          <View style={styles.unavailableWrap}>
            <GlassPanel strong style={styles.unavailableCard}>
              <Text style={styles.unavailableIcon}>📖</Text>
              <Text style={styles.unavailableTitle}>The release build refuses to fake full Bible access.</Text>
              <Text style={styles.unavailableCopy}>Run the verified Bible generator before export. TestFlight and store builds run it automatically and must pass the 66-book, 1,189-chapter audit.</Text>
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-03']} darkness={study?.churchMode ? 0.78 : 0.68}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          eyebrow={study?.churchMode ? 'CHURCH MODE · OFFLINE' : 'FULL BIBLE · OFFLINE READY'}
          title="Bible & Church Companion"
          subtitle={`${BIBLE_BUILD_META.translationName} · ${BIBLE_BUILD_META.bookCount} books · public domain`}
          right={<Text style={styles.headerBook}>📖</Text>}
        />
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <GlassPanel strong style={styles.searchCard}>
            <View style={styles.searchTop}>
              <View style={styles.searchIdentity}>
                <Text style={styles.searchEyebrow}>QUICK PULPIT LOOKUP</Text>
                <Text style={styles.searchTitle}>{book.name} {chapter}</Text>
              </View>
              <View style={styles.offlineBadge}><Text style={styles.offlineText}>OFFLINE</Text></View>
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={runSearch}
              placeholder="John 3:16 or search ‘grace’"
              placeholderTextColor={colors.muted}
              returnKeyType="search"
              autoCapitalize="words"
              style={styles.searchInput}
              accessibilityLabel="Bible reference or keyword search"
            />
            <View style={styles.searchActions}>
              <TactileButton compact label="Find Scripture" icon={<Ionicons name="search" size={17} color={colors.onBrand} />} onPress={runSearch} />
              <TactileButton compact variant={study?.churchMode ? 'gold' : 'glass'} label={study?.churchMode ? 'Exit Church Mode' : 'Church Mode'} onPress={() => void toggleChurchMode()} />
            </View>
            <View style={styles.toolRow}>
              <Pressable accessibilityRole="button" accessibilityLabel="Choose a Bible book" onPress={() => setShowBooks((value) => !value)} style={styles.toolChip}>
                <Ionicons name="library" size={16} color={colors.brand} />
                <Text style={styles.toolText}>Books</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Change Bible text size" onPress={() => void cycleFontSize()} style={styles.toolChip}>
                <Ionicons name="text" size={16} color={colors.brandSecondary} />
                <Text style={styles.toolText}>Text: {study?.fontSize || 'standard'}</Text>
              </Pressable>
              <View style={styles.toolChip}>
                <Ionicons name="bookmark" size={16} color={colors.coral} />
                <Text style={styles.toolText}>{study?.bookmarks.length || 0} saved</Text>
              </View>
            </View>
          </GlassPanel>

          {showBooks ? (
            <GlassPanel strong style={styles.bookPicker}>
              <View style={styles.bookPickerHeader}>
                <View><Text style={styles.sectionEyebrow}>66-BOOK LIBRARY</Text><Text style={styles.sectionTitle}>Choose a Book</Text></View>
                <Pressable accessibilityRole="button" accessibilityLabel="Close book picker" onPress={() => setShowBooks(false)}><Ionicons name="close" size={24} color={colors.onSurface} /></Pressable>
              </View>
              <Text style={styles.testamentTitle}>OLD TESTAMENT</Text>
              <View style={styles.bookGrid}>
                {BIBLE_LIBRARY.filter((item) => item.testament === 'Old Testament').map((item) => (
                  <Pressable key={item.id} onPress={() => selectBook(item.id)} style={[styles.bookChip, item.id === book.id && styles.bookChipActive]}>
                    <Text style={[styles.bookChipText, item.id === book.id && styles.bookChipTextActive]}>{item.name}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.testamentTitle}>NEW TESTAMENT</Text>
              <View style={styles.bookGrid}>
                {BIBLE_LIBRARY.filter((item) => item.testament === 'New Testament').map((item) => (
                  <Pressable key={item.id} onPress={() => selectBook(item.id)} style={[styles.bookChip, item.id === book.id && styles.bookChipActive]}>
                    <Text style={[styles.bookChipText, item.id === book.id && styles.bookChipTextActive]}>{item.name}</Text>
                  </Pressable>
                ))}
              </View>
            </GlassPanel>
          ) : null}

          {results.length ? (
            <GlassPanel strong style={styles.resultsCard}>
              <View style={styles.resultsHeader}>
                <View><Text style={styles.sectionEyebrow}>SEARCH RESULTS</Text><Text style={styles.sectionTitle}>{results.length} passages found</Text></View>
                <Pressable accessibilityRole="button" accessibilityLabel="Clear search results" onPress={() => setResults([])}><Ionicons name="close" size={23} color={colors.onSurface} /></Pressable>
              </View>
              {results.map((result) => (
                <Pressable key={`${result.bookId}-${result.chapter}-${result.verse}`} onPress={() => void moveTo(locationFromResult(result))} style={styles.resultRow}>
                  <Text style={styles.resultReference}>{result.bookName} {result.chapter}:{result.verse}</Text>
                  <Text numberOfLines={3} style={styles.resultText}>{result.text}</Text>
                </Pressable>
              ))}
            </GlassPanel>
          ) : null}

          {selectedVerse ? (
            <GlassPanel strong style={styles.focusCard}>
              <Text style={styles.focusEyebrow}>FOCUSED VERSE</Text>
              <Text style={styles.focusReference}>{book.name} {chapter}:{selectedVerse[0]}</Text>
              <Text style={[styles.focusText, { fontSize: fontSize + 2, lineHeight: lineHeight + 3 }]}>{selectedVerse[1]}</Text>
            </GlassPanel>
          ) : null}

          <View style={styles.chapterHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Previous chapter" disabled={chapter <= 1} onPress={() => changeChapter(chapter - 1)} style={[styles.chapterArrow, chapter <= 1 && styles.disabled]}>
              <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
            </Pressable>
            <View style={styles.chapterIdentity}>
              <Text style={styles.chapterEyebrow}>{book.testament.toUpperCase()}</Text>
              <Text style={styles.chapterTitle}>{book.name} {chapter}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Next chapter" disabled={chapter >= book.chapters.length} onPress={() => changeChapter(chapter + 1)} style={[styles.chapterArrow, chapter >= book.chapters.length && styles.disabled]}>
              <Ionicons name="chevron-forward" size={22} color={colors.onSurface} />
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterStrip}>
            {book.chapters.map((_item, index) => (
              <Pressable key={index + 1} onPress={() => changeChapter(index + 1)} style={[styles.chapterChip, chapter === index + 1 && styles.chapterChipActive]}>
                <Text style={[styles.chapterChipText, chapter === index + 1 && styles.chapterChipTextActive]}>{index + 1}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <GlassPanel strong style={[styles.scriptureCard, study?.churchMode && styles.scriptureCardChurch]}>
            {verses.map(([verse, text]) => {
              const key = verseKey(book.id, chapter, verse);
              const bookmarked = study?.bookmarks.includes(key);
              const highlight = study?.highlights[key];
              const hasNote = Boolean(study?.verseNotes[key]);
              const selected = focusedVerse === verse;
              return (
                <View key={key} style={[styles.verseWrap, highlight && { backgroundColor: HIGHLIGHT_BACKGROUNDS[highlight] }, selected && styles.verseSelected]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${book.name} ${chapter}:${verse}. ${text}`}
                    onPress={() => { setFocusedVerse(verse); void recordBibleLocation(profile.id, { bookId: book.id, chapter, verse }).then(setStudy); }}
                    style={styles.verseTextRow}
                  >
                    <Text style={[styles.verseNumber, study?.churchMode && styles.verseNumberChurch]}>{verse}</Text>
                    <Text selectable style={[styles.verseText, { fontSize, lineHeight }]}>{text}</Text>
                  </Pressable>
                  {!study?.churchMode ? (
                    <View style={styles.verseActions}>
                      <Pressable accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark verse'} onPress={() => void toggleBookmark(key)} style={styles.verseAction}>
                        <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={17} color={bookmarked ? colors.brand : colors.muted} />
                      </Pressable>
                      <Pressable accessibilityLabel="Cycle highlight color" onPress={() => void cycleHighlight(key)} style={styles.verseAction}>
                        <Ionicons name="color-palette" size={17} color={highlight ? colors.brandSecondary : colors.muted} />
                      </Pressable>
                      <Pressable accessibilityLabel="Write verse note" onPress={() => openVerseNote(key)} style={styles.verseAction}>
                        <Ionicons name={hasNote ? 'create' : 'create-outline'} size={17} color={hasNote ? colors.success : colors.muted} />
                      </Pressable>
                      <Pressable accessibilityLabel="Share verse" onPress={() => void shareVerse(verse, text)} style={styles.verseAction}>
                        <Ionicons name="share-social-outline" size={17} color={colors.muted} />
                      </Pressable>
                    </View>
                  ) : null}
                  {selectedNoteKey === key ? (
                    <GlassPanel style={styles.noteEditor}>
                      <Text style={styles.noteTitle}>Private note · {book.name} {chapter}:{verse}</Text>
                      <TextInput
                        value={noteDraft}
                        onChangeText={setNoteDraft}
                        placeholder="What stood out? What do you want to remember?"
                        placeholderTextColor={colors.muted}
                        multiline
                        maxLength={4000}
                        style={styles.noteInput}
                      />
                      <View style={styles.noteActions}>
                        <TactileButton compact label="Save Note" onPress={() => void saveVerseNote()} disabled={saving} />
                        <TactileButton compact variant="stone" label="Cancel" onPress={() => setSelectedNoteKey(null)} />
                      </View>
                    </GlassPanel>
                  ) : null}
                </View>
              );
            })}
          </GlassPanel>

          <GlassPanel strong style={styles.sermonCard}>
            <View style={styles.sermonHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>CHURCH COMPANION</Text>
                <Text style={styles.sectionTitle}>Sermon Notes · {book.name} {chapter}</Text>
              </View>
              <Ionicons name="mic" size={24} color={colors.brand} />
            </View>
            <TextInput
              value={sermonDraft}
              onChangeText={setSermonDraft}
              placeholder="Pastor’s points, cross-references, questions, prayer notes…"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={12000}
              textAlignVertical="top"
              style={styles.sermonInput}
            />
            <Text style={styles.privateNote}>Stored privately on this device for {profile.name}.</Text>
            <TactileButton compact label="Save Sermon Notes" icon={<Ionicons name="save" size={17} color={colors.onBrand} />} onPress={() => void saveChapterNotes()} disabled={saving} />
          </GlassPanel>

          {!study?.churchMode && study?.history.length ? (
            <GlassPanel style={styles.historyCard}>
              <Text style={styles.sectionEyebrow}>RECENTLY READ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyStrip}>
                {[...study.history].reverse().slice(0, 12).map((location, index) => (
                  <Pressable key={`${location.bookId}-${location.chapter}-${location.verse || 0}-${index}`} onPress={() => void moveTo(location)} style={styles.historyChip}>
                    <Text style={styles.historyText}>{formatBibleReference(location)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </GlassPanel>
          ) : null}

          {!study?.churchMode ? (
            <GlassPanel style={styles.archiveCard}>
              <Ionicons name="albums" size={25} color={colors.brandSecondary} />
              <View style={styles.archiveCopy}><Text style={styles.archiveTitle}>Bible Story Archive</Text><Text style={styles.archiveText}>Step from the full text into the app’s illustrated stories and learning experiences.</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Open Bible story archive" onPress={() => router.push('/(tabs)/stories')}><Ionicons name="chevron-forward" size={22} color={colors.brand} /></Pressable>
            </GlassPanel>
          ) : null}

          <Text style={styles.attribution}>World English Bible · Public Domain · Source text preserved without alteration · Fully bundled for offline reading.</Text>
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  loadingText: { color: colors.parchment, fontWeight: '800' },
  headerBook: { fontSize: 34 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 130, gap: spacing.md },
  searchCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  searchTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  searchIdentity: { flex: 1 },
  searchEyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.25 },
  searchTitle: { color: colors.onSurface, fontSize: 24, fontWeight: '900', marginTop: 3 },
  offlineBadge: { borderWidth: 1, borderColor: 'rgba(87,195,153,0.45)', backgroundColor: 'rgba(87,195,153,0.12)', borderRadius: 99, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  offlineText: { color: colors.success, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  searchInput: { minHeight: 50, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(4,9,20,0.72)', color: colors.onSurface, paddingHorizontal: spacing.md, fontSize: 15, fontWeight: '700' },
  searchActions: { flexDirection: 'row', gap: spacing.sm },
  toolRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  toolChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: 'rgba(255,255,255,0.035)' },
  toolText: { color: colors.onSurface, fontSize: 10, fontWeight: '900' },
  bookPicker: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  bookPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionEyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.25 },
  sectionTitle: { color: colors.onSurface, fontSize: 20, fontWeight: '900', marginTop: 3 },
  testamentTitle: { color: colors.brandSecondary, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: spacing.sm },
  bookGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  bookChip: { width: '31.5%', minHeight: 39, justifyContent: 'center', borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, backgroundColor: 'rgba(255,255,255,0.035)' },
  bookChipActive: { borderColor: colors.brand, backgroundColor: colors.brandTertiary },
  bookChipText: { color: colors.muted, fontSize: 10, lineHeight: 13, fontWeight: '800', textAlign: 'center' },
  bookChipTextActive: { color: colors.brandLight },
  resultsCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  resultRow: { borderTopWidth: 1, borderTopColor: colors.divider, paddingVertical: spacing.md, gap: 4 },
  resultReference: { color: colors.brand, fontSize: 12, fontWeight: '900' },
  resultText: { color: colors.parchment, fontSize: 13, lineHeight: 19 },
  focusCard: { borderRadius: radii.xl, padding: spacing.xl, gap: spacing.sm, borderColor: colors.brand },
  focusEyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  focusReference: { color: colors.onSurface, fontSize: 19, fontWeight: '900' },
  focusText: { color: colors.parchment, fontWeight: '700' },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  chapterArrow: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.glass },
  disabled: { opacity: 0.28 },
  chapterIdentity: { flex: 1, alignItems: 'center' },
  chapterEyebrow: { color: colors.muted, fontSize: 8.5, fontWeight: '900', letterSpacing: 1.2 },
  chapterTitle: { color: colors.onSurface, fontSize: 25, fontWeight: '900', marginTop: 2 },
  chapterStrip: { gap: 7, paddingVertical: spacing.sm },
  chapterChip: { minWidth: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.035)' },
  chapterChipActive: { borderColor: colors.brand, backgroundColor: colors.brandTertiary },
  chapterChipText: { color: colors.muted, fontWeight: '900' },
  chapterChipTextActive: { color: colors.brandLight },
  scriptureCard: { borderRadius: radii.xl, paddingVertical: spacing.sm, overflow: 'hidden' },
  scriptureCardChurch: { borderColor: colors.brand, backgroundColor: 'rgba(3,7,15,0.90)' },
  verseWrap: { borderBottomWidth: 1, borderBottomColor: colors.divider, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  verseSelected: { borderLeftWidth: 3, borderLeftColor: colors.brand, backgroundColor: 'rgba(233,188,98,0.10)' },
  verseTextRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  verseNumber: { width: 25, color: colors.brand, fontSize: 11, lineHeight: 28, fontWeight: '900', textAlign: 'right' },
  verseNumberChurch: { fontSize: 14, lineHeight: 40 },
  verseText: { flex: 1, color: colors.parchment, fontWeight: '600' },
  verseActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 5, marginTop: spacing.sm },
  verseAction: { width: 34, height: 31, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  noteEditor: { marginTop: spacing.md, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  noteTitle: { color: colors.brand, fontSize: 11, fontWeight: '900' },
  noteInput: { minHeight: 110, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(4,9,20,0.70)', color: colors.onSurface, padding: spacing.md, fontSize: 14, lineHeight: 20, textAlignVertical: 'top' },
  noteActions: { flexDirection: 'row', gap: spacing.sm },
  sermonCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  sermonHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sermonInput: { minHeight: 190, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(4,9,20,0.72)', color: colors.onSurface, padding: spacing.md, fontSize: 15, lineHeight: 22 },
  privateNote: { color: colors.muted, fontSize: 10.5, fontStyle: 'italic' },
  historyCard: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  historyStrip: { gap: spacing.sm },
  historyChip: { borderRadius: 99, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: 'rgba(255,255,255,0.035)' },
  historyText: { color: colors.onSurface, fontSize: 10.5, fontWeight: '900' },
  archiveCard: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  archiveCopy: { flex: 1 },
  archiveTitle: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  archiveText: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  attribution: { color: colors.muted, fontSize: 9.5, lineHeight: 15, textAlign: 'center', paddingHorizontal: spacing.lg },
  unavailableWrap: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  unavailableCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  unavailableIcon: { fontSize: 64 },
  unavailableTitle: { color: colors.onSurface, fontSize: 22, lineHeight: 29, fontWeight: '900', textAlign: 'center' },
  unavailableCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
