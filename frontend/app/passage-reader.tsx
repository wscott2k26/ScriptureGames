import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getBibleBook, getBibleChapter } from '@/src/bible-library';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';

export default function PassageReaderScreen() {
  const router = useRouter();
  const { bookId = '', chapter = '1', verse } = useLocalSearchParams<{ bookId?: string; chapter?: string; verse?: string }>();
  const book = getBibleBook(String(bookId));
  const requestedChapter = Number(chapter);
  const requestedVerse = verse ? Number(verse) : undefined;
  const safeChapter = book && Number.isInteger(requestedChapter)
    ? Math.max(1, Math.min(book.chapters.length, requestedChapter))
    : 1;
  const verses = book ? getBibleChapter(book.id, safeChapter) : [];
  const focusedVerse = requestedVerse && verses.some(([number]) => number === requestedVerse) ? requestedVerse : undefined;

  if (!book || !verses.length) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-03']} darkness={0.72}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <ScreenHeader back eyebrow="SCRIPTURE CONTEXT" title="Passage unavailable" />
          <View style={styles.center}>
            <GlassPanel strong style={styles.unavailable}>
              <Text style={styles.unavailableIcon}>📖</Text>
              <Text style={styles.unavailableTitle}>This passage could not be opened.</Text>
              <Text style={styles.unavailableCopy}>Your quiz progress is still safe. Return to the question and continue.</Text>
              <TactileButton label="Return to Question" onPress={() => router.back()} />
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-03']} darkness={0.7}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          back
          eyebrow="OPEN SCRIPTURE · OFFLINE"
          title={`${book.name} ${safeChapter}`}
          subtitle="World English Bible · Read the verse in its full context"
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <GlassPanel style={styles.guideCard}>
            <Ionicons name="reader" size={22} color={colors.brand} />
            <View style={styles.guideCopy}>
              <Text style={styles.guideTitle}>{focusedVerse ? `Verse ${focusedVerse} is highlighted` : 'Read the full chapter'}</Text>
              <Text style={styles.guideText}>Nothing on this screen submits an answer or changes your score. Read, then return to the same question.</Text>
            </View>
          </GlassPanel>

          <GlassPanel strong style={styles.chapterCard}>
            {verses.map(([number, text]) => {
              const focused = number === focusedVerse;
              return (
                <View key={number} style={[styles.verseRow, focused && styles.focusedVerse]}>
                  <Text style={[styles.verseNumber, focused && styles.focusedNumber]}>{number}</Text>
                  <Text style={[styles.verseText, focused && styles.focusedText]}>{text}</Text>
                </View>
              );
            })}
          </GlassPanel>
          <TactileButton label="Return to Question" icon={<Ionicons name="arrow-back" size={18} color={colors.onBrand} />} onPress={() => router.back()} />
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  guideCard: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  guideCopy: { flex: 1 },
  guideTitle: { color: colors.onSurface, fontSize: 14, fontWeight: '900' },
  guideText: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 3 },
  chapterCard: { borderRadius: radii.xl, padding: spacing.lg, gap: 3 },
  verseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 9, borderRadius: radii.md },
  focusedVerse: { backgroundColor: 'rgba(232,185,87,0.16)', borderWidth: 1, borderColor: 'rgba(232,185,87,0.42)' },
  verseNumber: { width: 28, color: colors.brandSecondary, fontSize: 11, lineHeight: 27, fontWeight: '900', textAlign: 'right' },
  focusedNumber: { color: colors.brand },
  verseText: { flex: 1, color: colors.parchment, fontSize: 18, lineHeight: 28 },
  focusedText: { color: colors.onSurface, fontWeight: '700' },
  unavailable: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  unavailableIcon: { fontSize: 58 },
  unavailableTitle: { color: colors.onSurface, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  unavailableCopy: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
