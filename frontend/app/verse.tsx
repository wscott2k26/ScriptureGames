import {
  useEffect,
  useMemo,
  useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { MaterialSurface } from '@/src/components/premium/MaterialSurface';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';

type Verse = { id: string; reference: string; translation?: string; text: string; blanks: string[] };
type Token = { id: string; word: string };

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export default function VerseMemory() {
  const router = useRouter();
  const { nodeId, verseId } = useLocalSearchParams<{ nodeId?: string; verseId?: string }>();
  const { profile, refresh } = useProfile();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [index, setIndex] = useState(0);
  const [filled, setFilled] = useState<(Token | null)[]>([]);
  const [pool, setPool] = useState<Token[]>([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.getVerses()
      .then((result) => {
        if (!active) return;
        const all = [...result.verses] as Verse[];
        if (verseId) {
          const selected = all.find((item) => item.id === String(verseId));
          setVerses(selected ? [selected] : shuffle(all).slice(0, 3));
        } else {
          setVerses(shuffle(all).slice(0, 3));
        }
      })
      .catch(() => { if (active) setError('The memory passages could not be opened.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [verseId]);

  const verse = verses[index];

  useEffect(() => {
    if (!verse) return;
    setFilled(verse.blanks.map(() => null));
    const distractors = ['believe', 'trust', 'love', 'hope', 'grace', 'faith']
      .filter((word) => !verse.blanks.some((blank) => blank.toLowerCase() === word))
      .slice(0, 2);
    const tokens = [...verse.blanks, ...distractors].map((word, tokenIndex) => ({ id: `${verse.id}-${tokenIndex}-${word}`, word }));
    setPool(shuffle(tokens));
    setChecked(false);
  }, [verse]);

  const parts = useMemo(() => {
    if (!verse) return [] as { type: 'text' | 'blank'; value: string; blankIndex?: number }[];
    const tokens: { type: 'text' | 'blank'; value: string; blankIndex?: number }[] = [];
    let remaining = verse.text;
    verse.blanks.forEach((blank, blankIndex) => {
      const position = remaining.indexOf(blank);
      if (position < 0) return;
      if (position > 0) tokens.push({ type: 'text', value: remaining.slice(0, position) });
      tokens.push({ type: 'blank', value: blank, blankIndex });
      remaining = remaining.slice(position + blank.length);
    });
    if (remaining) tokens.push({ type: 'text', value: remaining });
    return tokens;
  }, [verse]);

  const pick = (token: Token) => {
    if (checked) return;
    const emptyIndex = filled.findIndex((item) => item === null);
    if (emptyIndex < 0) return;
    sfx.tap();
    const next = [...filled];
    next[emptyIndex] = token;
    setFilled(next);
    setPool((current) => current.filter((item) => item.id !== token.id));
  };

  const remove = (blankIndex: number) => {
    if (checked) return;
    const token = filled[blankIndex];
    if (!token) return;
    sfx.tap();
    const next = [...filled];
    next[blankIndex] = null;
    setFilled(next);
    setPool((current) => [...current, token]);
  };

  const allFilled = filled.length > 0 && filled.every(Boolean);
  const perfect = Boolean(verse && verse.blanks.every((blank, blankIndex) => filled[blankIndex]?.word === blank));

  const check = () => {
    if (!allFilled || checked) return;
    setChecked(true);
    if (perfect) {
      setCorrect((value) => value + 1);
      sfx.correct();
    } else {
      sfx.wrong();
    }
  };

  const next = async () => {
    if (index < verses.length - 1) {
      setIndex((value) => value + 1);
      return;
    }
    if (profile && nodeId) {
      try {
        await api.completeNode(profile.id, String(nodeId), correct, verses.length);
        await refresh();
      } catch {
        setError('The score could not be saved, but the memory session is complete.');
      }
    }
    setDone(true);
    sfx.win();
  };

  const destination = nodeId ? '/(tabs)/journey' : '/(tabs)/quiz';

  if (loading || error && !verse || !verse) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-07']} darkness={0.73}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <ScreenHeader back eyebrow="MEMORY HALL" title="Verse Memory" />
          <View style={styles.center}>
            <GlassPanel strong style={styles.stateCard}>
              {loading ? <ActivityIndicator color={colors.brand} size="large" /> : <Text style={styles.stateIcon}>📖</Text>}
              <Text style={styles.stateTitle}>{loading ? 'Preparing the passages…' : 'Memory Hall unavailable'}</Text>
              {error ? <Text style={styles.stateCopy}>{error}</Text> : null}
              {!loading ? <TactileButton label="Return to Training" onPress={() => router.replace('/(tabs)/quiz')} /> : null}
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  if (done) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-07']} darkness={0.58}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.center}>
            <GlassPanel strong style={styles.resultCard}>
              <Text style={styles.resultIcon}>📖</Text>
              <Text style={styles.resultEyebrow}>MEMORY SESSION COMPLETE</Text>
              <Text style={styles.resultTitle}>{correct} of {verses.length} passages restored</Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TactileButton label={nodeId ? 'Return to Journey' : 'Return to Training'} onPress={() => router.replace(destination)} />
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-07']} darkness={0.73}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="VERSE MEMORY" title={`${verse.reference}`} subtitle={`Passage ${index + 1} of ${verses.length}${verse.translation ? ` · ${verse.translation}` : ''}`} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.progress}><View style={[styles.progressFill, { width: `${((index + 1) / verses.length) * 100}%` }]} /></View>
          <GlassPanel strong style={styles.verseCard}>
            <Text style={styles.verseText}>
              {parts.map((part, partIndex) => {
                if (part.type === 'text') return <Text key={`${partIndex}-text`}>{part.value}</Text>;
                const token = filled[part.blankIndex!];
                const right = checked && token?.word === part.value;
                const wrong = checked && token?.word !== part.value;
                return (
                  <Text key={`${partIndex}-blank`} onPress={() => remove(part.blankIndex!)} style={[styles.blank, token ? styles.blankFilled : styles.blankEmpty, right && styles.blankRight, wrong && styles.blankWrong]}>
                    {token?.word || '____'}
                  </Text>
                );
              })}
            </Text>
          </GlassPanel>
          <Text style={styles.poolTitle}>{checked ? (perfect ? 'Passage restored correctly' : 'Review the highlighted blanks') : 'Tap words to fill the blanks'}</Text>
          <View style={styles.pool}>
            {pool.map((token) => (
              <Pressable key={token.id} testID={`word-${token.id}`} accessibilityRole="button" onPress={() => pick(token)} style={styles.wordButton}>
                <MaterialSurface material="sandstone" style={styles.wordChip}>
                  <Text style={styles.wordText}>{token.word}</Text>
                </MaterialSurface>
              </Pressable>
            ))}
          </View>
          {checked && !perfect ? <GlassPanel style={styles.feedback}><Ionicons name="information-circle" size={21} color={colors.coral} /><Text style={styles.feedbackText}>Correct words: {verse.blanks.join(' · ')}</Text></GlassPanel> : null}
          <TactileButton label={checked ? (index === verses.length - 1 ? 'Finish Memory Session' : 'Next Passage') : 'Check Passage'} disabled={!allFilled} onPress={checked ? next : check} />
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  stateCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  stateIcon: { fontSize: 62 },
  stateTitle: { color: colors.onSurface, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  stateCopy: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  progress: { height: 7, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.09)' },
  progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 99 },
  verseCard: { borderRadius: radii.xl, padding: spacing.xl },
  verseText: { color: colors.onSurface, fontSize: 20, lineHeight: 35, fontWeight: '600' },
  blank: { paddingHorizontal: 4, borderRadius: 6, overflow: 'hidden', fontWeight: '900' },
  blankEmpty: { color: colors.muted, backgroundColor: 'rgba(255,255,255,0.08)' },
  blankFilled: { color: colors.brand, backgroundColor: 'rgba(232,185,87,0.14)' },
  blankRight: { color: colors.onBrand, backgroundColor: colors.success },
  blankWrong: { color: '#FFFFFF', backgroundColor: colors.error },
  poolTitle: { color: colors.parchment, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  wordButton: { borderRadius: radii.pill },
  wordChip: { borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  wordText: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  feedback: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  feedbackText: { color: colors.muted, flex: 1, fontSize: 12, lineHeight: 18 },
  resultCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  resultIcon: { fontSize: 72 },
  resultEyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  resultTitle: { color: colors.onSurface, fontSize: 24, lineHeight: 30, fontWeight: '900', textAlign: 'center' },
  errorText: { color: colors.error, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
