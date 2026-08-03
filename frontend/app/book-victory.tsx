import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import { usePremiumEntitlement } from '@/src/premium-entitlement';
import { colors, radii, spacing } from '@/src/theme';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { CelebrationBurst } from '@/src/components/premium/CelebrationBurst';
import { getJourneyBook, getNextJourneyBook } from '@/src/bible-journey/catalog';
import { canOpenJourneyBook } from '@/src/bible-journey/access';
import { completeBibleJourneyBook, loadBibleJourneyProgress, type BibleJourneyProgress } from '@/src/bible-journey/progress';

export default function BookVictoryScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams<{ bookId?: string }>();
  const { profile } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const catalogBook = useMemo(() => getJourneyBook(String(bookId || '')), [bookId]);
  const [progress, setProgress] = useState<BibleJourneyProgress | null>(null);
  const [sealed, setSealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasPremium } = usePremiumEntitlement();

  useEffect(() => {
    if (!profile || !catalogBook || catalogBook.id === 'GEN') return;
    let active = true;
    const load = async () => {
      try {
        const saved = await loadBibleJourneyProgress(profile.id);
        const bookProgress = saved.books[catalogBook.id];
        if ((bookProgress?.completedTrials.length || 0) < 5) {
          if (active) {
            setProgress(saved);
            setSealed(true);
          }
          return;
        }
        const completed = await completeBibleJourneyBook(profile.id, catalogBook.id);
        if (active) setProgress(completed.progress);
      } catch {
        if (active) setError('Your book completion could not be saved. Return to the book trials and try again.');
      }
    };
    void load();
    return () => { active = false; };
  }, [catalogBook, profile]);

  if (!profile) return null;

  const fallback = (title: string, description: string) => (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.72}>
      <SafeAreaView style={styles.center}>
        <GlassPanel strong style={styles.fallbackCard}>
          <Ionicons name="warning" size={40} color={colors.coral} />
          <Text style={styles.fallbackTitle}>{title}</Text>
          <Text style={styles.fallbackText}>{description}</Text>
          <TactileButton variant="glass" label="Choose Any Bible Book" onPress={() => router.replace('/book-library')} />
        </GlassPanel>
      </SafeAreaView>
    </CinematicBackdrop>
  );

  if (!catalogBook || catalogBook.id === 'GEN') {
    return fallback('This victory record could not be opened.', 'Genesis uses its original Victory Hall. Choose another book from the library.');
  }

  if (!canOpenJourneyBook(catalogBook, hasPremium)) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.72}>
        <SafeAreaView style={styles.center}>
          <GlassPanel strong style={styles.fallbackCard}>
            <Ionicons name="lock-closed" size={42} color={colors.brand} />
            <Text style={styles.fallbackTitle}>{catalogBook.name} requires Premium.</Text>
            <Text style={styles.fallbackText}>Restore or unlock Premium to continue this mastery record.</Text>
            <TactileButton label="View Premium" onPress={() => router.replace('/premium')} />
            <TactileButton variant="glass" label="Choose Any Bible Book" onPress={() => router.replace('/book-library')} />
          </GlassPanel>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  if (error) return fallback('Book completion was not saved.', error);

  if (sealed) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.72}>
        <SafeAreaView style={styles.center}>
          <GlassPanel strong style={styles.fallbackCard}>
            <Ionicons name="lock-closed" size={42} color={colors.muted} />
            <Text style={styles.fallbackTitle}>The {catalogBook.name} mastery seal is closed.</Text>
            <Text style={styles.fallbackText}>Complete all five book trials before entering this hall.</Text>
            <TactileButton label={`Return to ${catalogBook.name} Trials`} onPress={() => router.replace({ pathname: '/book-season', params: { bookId: catalogBook.id } })} />
            <TactileButton variant="glass" label="Choose Any Bible Book" onPress={() => router.replace('/book-library')} />
          </GlassPanel>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  if (!progress) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.66}>
        <SafeAreaView style={styles.center}><Text style={styles.loading}>Preparing your book mastery record…</Text></SafeAreaView>
      </CinematicBackdrop>
    );
  }

  const bookProgress = progress.books[catalogBook.id];
  const results = Object.values(bookProgress?.bestResults || {});
  const average = results.length ? Math.round(results.reduce((sum, result) => sum + result.percent, 0) / results.length) : 0;
  const perfects = results.filter((result) => result.percent === 100).length;
  const nextBook = getNextJourneyBook(catalogBook.id);

  const continueJourney = () => {
    if (!nextBook) {
      router.replace('/book-library');
      return;
    }
    if (!canOpenJourneyBook(nextBook, hasPremium)) {
      router.replace('/premium');
      return;
    }
    router.replace({ pathname: '/book-season', params: { bookId: nextBook.id } });
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.58}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {!reducedMotion ? <CelebrationBurst intensity="champion" colors={[colors.brand, colors.brandSecondary, colors.success, '#FFFFFF']} /> : null}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.mark}>{catalogBook.icon}</Text>
          <Text style={styles.eyebrow}>BOOK {catalogBook.index} OF 66 · MASTERED</Text>
          <Text style={styles.title}>{catalogBook.name}{`\n`}Complete</Text>
          <Text style={styles.subtitle}>{catalogBook.theme}</Text>

          <GlassPanel strong style={styles.certificate}>
            <View style={styles.certificateTop}>
              <View style={styles.seal}><Text style={styles.sealText}>✺</Text></View>
              <View style={styles.certificateCopy}>
                <Text style={styles.certificateLabel}>THIS MASTERY RECORD HONORS</Text>
                <Text style={styles.playerName}>{profile.avatar} {profile.name}</Text>
                <Text style={styles.certificateBook}>{catalogBook.testament} · {catalogBook.name}</Text>
              </View>
            </View>
            <View style={styles.rule} />
            <Text style={styles.certificateText}>For completing all five Scripture trials in {catalogBook.name} and preserving a private proof of work in the Complete Bible Journey.</Text>
          </GlassPanel>

          <View style={styles.statsRow}>
            <GlassPanel style={styles.statCard}><Text style={styles.statValue}>{average}%</Text><Text style={styles.statLabel}>BEST AVERAGE</Text></GlassPanel>
            <GlassPanel style={styles.statCard}><Text style={styles.statValue}>{perfects}</Text><Text style={styles.statLabel}>PERFECT TRIALS</Text></GlassPanel>
            <GlassPanel style={styles.statCard}><Text style={styles.statValue}>{progress.completedBookIds.length}/66</Text><Text style={styles.statLabel}>BOOKS COMPLETE</Text></GlassPanel>
          </View>

          <GlassPanel style={styles.truthCard}>
            <Ionicons name="book" size={25} color={colors.brand} />
            <View style={styles.truthCopy}>
              <Text style={styles.truthLabel}>BOOK TRUTH</Text>
              <Text style={styles.truthText}>{catalogBook.theme}. Continue reading the full book in the Bible tab to deepen what the trials introduced.</Text>
            </View>
          </GlassPanel>

          {nextBook ? <TactileButton label={`Continue to ${nextBook.name}`} onPress={continueJourney} /> : <TactileButton label="View My Complete Bible Record" onPress={() => router.replace('/book-library')} />}
          <TactileButton variant="glass" label="Choose Any Bible Book" onPress={() => router.replace('/book-library')} />
          <TactileButton variant="stone" label={`Replay ${catalogBook.name}`} onPress={() => router.replace({ pathname: '/book-season', params: { bookId: catalogBook.id } })} />
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  loading: { color: colors.parchment, fontSize: 15, fontWeight: '800' },
  fallbackCard: { borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'center', maxWidth: 600, width: '100%' },
  fallbackTitle: { color: colors.onSurface, fontSize: 23, fontWeight: '900', textAlign: 'center' },
  fallbackText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md, maxWidth: 680, width: '100%', alignSelf: 'center' },
  mark: { fontSize: 58, textAlign: 'center' },
  eyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.3, textAlign: 'center' },
  title: { color: colors.onSurface, fontSize: 38, lineHeight: 41, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.parchment, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  certificate: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  certificateTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  seal: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(232,185,87,0.15)', borderWidth: 1, borderColor: colors.borderStrong },
  sealText: { color: colors.brand, fontSize: 36 },
  certificateCopy: { flex: 1 },
  certificateLabel: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  playerName: { color: colors.onSurface, fontSize: 20, fontWeight: '900', marginTop: 2 },
  certificateBook: { color: colors.brand, fontSize: 10.5, fontWeight: '900', marginTop: 2 },
  rule: { height: 1, backgroundColor: 'rgba(232,185,87,0.35)' },
  certificateText: { color: colors.parchment, fontSize: 12.5, lineHeight: 19, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, minHeight: 86, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', padding: spacing.sm },
  statValue: { color: colors.onSurface, fontSize: 20, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 7, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center', marginTop: 4 },
  truthCard: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md },
  truthCopy: { flex: 1 },
  truthLabel: { color: colors.brand, fontSize: 8.5, fontWeight: '900', letterSpacing: 1 },
  truthText: { color: colors.parchment, fontSize: 12, lineHeight: 18, marginTop: 3 },
});
