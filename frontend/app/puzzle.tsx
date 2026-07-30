import {
  useEffect,
  useMemo,
  useRef,
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
import { CelebrationBurst } from '@/src/components/premium/CelebrationBurst';

import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { MaterialSurface } from '@/src/components/premium/MaterialSurface';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';

type PuzzleSet = { id: string; title: string; words: readonly string[] };
type Letter = { id: string; char: string };
type Round = { id: string; title: string; word: string; letters: Letter[] };

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function scrambledLetters(setId: string, word: string): Letter[] {
  const source = word.split('').map((char, index) => ({ id: `${setId}-${index}`, char }));
  let shuffled = shuffle(source);
  if (word.length > 1 && shuffled.map((item) => item.char).join('') === word) shuffled = [...shuffled].reverse();
  return shuffled;
}

function buildRounds(sets: readonly PuzzleSet[]): Round[] {
  return sets.map((set) => {
    const word = set.words[Math.floor(Math.random() * set.words.length)];
    return { id: set.id, title: set.title, word, letters: scrambledLetters(set.id, word) };
  });
}

export default function PuzzleScreen() {
  const router = useRouter();
  const { nodeId } = useLocalSearchParams<{ nodeId?: string }>();
  const { profile, refresh } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let active = true;
    const activeTimers = timers.current;
    api.getPuzzles()
      .then((result) => { if (active) setRounds(buildRounds(result.puzzles as readonly PuzzleSet[])); })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      activeTimers.forEach(clearTimeout);
    };
  }, []);

  const round = rounds[roundIndex];
  const selectedLetters = useMemo(() => {
    if (!round) return [];
    return selectedIds.map((id) => round.letters.find((letter) => letter.id === id)).filter((letter): letter is Letter => Boolean(letter));
  }, [round, selectedIds]);

  const finish = async () => {
    setDone(true);
    sfx.win();
    if (profile && nodeId) {
      try {
        await api.completeNode(profile.id, String(nodeId), rounds.length, rounds.length);
        await refresh();
      } catch {
        // The puzzle remains complete locally in this session.
      }
    }
  };

  const resolve = (ids: string[]) => {
    if (!round || ids.length !== round.word.length) return;
    setAttempts((value) => value + 1);
    setResolving(true);
    const answer = ids.map((id) => round.letters.find((letter) => letter.id === id)?.char || '').join('');
    if (answer === round.word) {
      sfx.correct();
      const timer = setTimeout(() => {
        if (roundIndex >= rounds.length - 1) {
          void finish();
        } else {
          setRoundIndex((value) => value + 1);
          setSelectedIds([]);
          setWrong(false);
          setResolving(false);
        }
      }, 520);
      timers.current.push(timer);
      return;
    }
    sfx.wrong();
    setWrong(true);
    const timer = setTimeout(() => {
      setSelectedIds([]);
      setWrong(false);
      setResolving(false);
    }, 820);
    timers.current.push(timer);
  };

  const pick = (letter: Letter) => {
    if (!round || resolving || selectedIds.includes(letter.id)) return;
    sfx.tap();
    const next = [...selectedIds, letter.id];
    setSelectedIds(next);
    resolve(next);
  };

  const remove = (letterId: string) => {
    if (resolving) return;
    sfx.tap();
    setSelectedIds((current) => current.filter((id) => id !== letterId));
  };

  const destination = nodeId ? '/(tabs)/journey' : '/(tabs)/quiz';

  if (loading || loadError || !round) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-04']} darkness={0.74}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <ScreenHeader back eyebrow="WORD FORGE" title="Bible Word Puzzle" />
          <View style={styles.center}>
            <GlassPanel strong style={styles.stateCard}>
              {loading ? <ActivityIndicator color={colors.brand} size="large" /> : <Text style={styles.stateIcon}>🧩</Text>}
              <Text style={styles.stateTitle}>{loading ? 'Forging the word rounds…' : 'Word Forge unavailable'}</Text>
              {!loading ? <TactileButton label="Return to Training" onPress={() => router.replace('/(tabs)/quiz')} /> : null}
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  if (done) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-04']} darkness={0.56}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.center} testID="puzzle-done">
            {!reducedMotion ? <CelebrationBurst colors={[colors.brand, colors.brandSecondary, colors.coral, colors.info, '#FFFFFF']} /> : null}
            <GlassPanel strong style={styles.resultCard}>
              <Text style={styles.resultIcon}>🧩</Text>
              <Text style={styles.resultEyebrow}>WORD FORGE COMPLETE</Text>
              <Text style={styles.resultTitle}>All {rounds.length} rounds solved</Text>
              <Text style={styles.resultCopy}>{attempts} total attempts</Text>
              <TactileButton testID="puzzle-done-continue" label={nodeId ? 'Return to Journey' : 'Return to Training'} onPress={() => router.replace(destination)} />
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-04']} darkness={0.74}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="WORD FORGE" title={round.title} subtitle={`Round ${roundIndex + 1} of ${rounds.length}`} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.progress}><View style={[styles.progressFill, { width: `${((roundIndex + 1) / rounds.length) * 100}%` }]} /></View>
          <GlassPanel strong style={styles.wordCard}>
            <Text style={styles.prompt}>Tap the letters in the correct order</Text>
            <View style={[styles.answerRow, wrong && styles.answerWrong]}>
              {round.word.split('').map((_, slotIndex) => {
                const selectedLetter = selectedLetters[slotIndex];
                return (
                  <Pressable key={`${round.id}-${slotIndex}`} accessibilityRole="button" accessibilityLabel={selectedLetter ? `Remove letter ${selectedLetter.char} from position ${slotIndex + 1}` : `Empty position ${slotIndex + 1}`} accessibilityState={{ disabled: !selectedLetter || resolving }} disabled={!selectedLetter || resolving} onPress={() => selectedLetter && remove(selectedLetter.id)} style={styles.answerPressable}>
                    <MaterialSurface material={selectedLetter ? 'bronze' : 'stone'} selected={Boolean(selectedLetter)} style={styles.answerSlot}>
                      <Text style={styles.answerLetter}>{selectedLetter?.char || '·'}</Text>
                    </MaterialSurface>
                  </Pressable>
                );
              })}
            </View>
            {wrong ? <Text style={styles.wrongText}>Not quite. The letters are resetting.</Text> : <Text style={styles.hint}>Tap a filled slot to return that letter to the pool.</Text>}
          </GlassPanel>

          <View style={styles.letterPool}>
            {round.letters.map((letter) => {
              const used = selectedIds.includes(letter.id);
              return (
                <Pressable key={letter.id} testID={`puzzle-letter-${letter.id}`} accessibilityRole="button" accessibilityLabel={`Choose letter ${letter.char}`} accessibilityState={{ disabled: used || resolving }} disabled={used || resolving} onPress={() => pick(letter)} style={[styles.letterButton, used && styles.letterUsed]}>
                  <MaterialSurface material="gold" style={styles.letterTile}>
                    <Text style={styles.letterText}>{letter.char}</Text>
                  </MaterialSurface>
                </Pressable>
              );
            })}
          </View>

          <TactileButton testID="puzzle-reset" compact variant="glass" label="Reset Current Word" icon={<Ionicons name="refresh" size={18} color={colors.onSurface} />} disabled={!selectedIds.length || resolving} onPress={() => setSelectedIds([])} />
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
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xl },
  progress: { height: 7, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.09)' },
  progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 99 },
  wordCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  prompt: { color: colors.onSurface, fontSize: 19, fontWeight: '900', textAlign: 'center' },
  answerRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, borderRadius: radii.md, padding: spacing.sm },
  answerWrong: { backgroundColor: colors.errorSoft },
  answerPressable: { width: 42, height: 54, borderRadius: 14 },
  answerSlot: { width: 42, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  answerLetter: { color: colors.onSurface, fontSize: 26, fontWeight: '900' },
  wrongText: { color: colors.error, fontSize: 12, fontWeight: '900' },
  hint: { color: colors.muted, fontSize: 11.5, textAlign: 'center' },
  letterPool: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  letterButton: { width: 56, height: 62, borderRadius: 18 },
  letterTile: { width: 56, height: 62, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  letterUsed: { opacity: 0.18 },
  letterText: { color: colors.onBrand, fontSize: 25, fontWeight: '900' },
  resultCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  resultIcon: { fontSize: 72 },
  resultEyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  resultTitle: { color: colors.onSurface, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  resultCopy: { color: colors.muted, fontSize: 14, fontWeight: '800' },
});
