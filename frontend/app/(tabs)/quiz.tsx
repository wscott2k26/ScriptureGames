import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { BOOK_MASTERY_BOOKS } from '@/src/book-mastery';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { FeatureCard, SectionTitle } from '@/src/components/premium/FeatureCard';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';

type Game = {
  key: string;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  topic: string;
  group: 'scripture' | 'skills';
};

const GAMES: Game[] = [
  { key: 'trivia', title: 'Bible Trivia', desc: 'A balanced five-question knowledge run.', icon: 'bulb', accent: colors.brandSecondary, topic: 'general', group: 'scripture' },
  { key: 'creation', title: 'Creation', desc: 'The opening chapters of Genesis.', icon: 'sunny', accent: colors.brand, topic: 'creation', group: 'scripture' },
  { key: 'noah', title: 'Noah and the Covenant', desc: 'Flood, ark, mercy, and the rainbow sign.', icon: 'boat', accent: colors.info, topic: 'noah', group: 'scripture' },
  { key: 'moses', title: 'Moses', desc: 'Calling, Exodus, wilderness, and law.', icon: 'flame', accent: colors.coral, topic: 'moses', group: 'scripture' },
  { key: 'david', title: 'David', desc: 'Shepherd, warrior, psalmist, and king.', icon: 'shield', accent: colors.brandDark, topic: 'david', group: 'scripture' },
  { key: 'prophets', title: 'Prophets', desc: 'Elijah, Isaiah, Daniel, and faithful witness.', icon: 'megaphone', accent: '#B98ADB', topic: 'prophets', group: 'scripture' },
  { key: 'nativity', title: 'The Nativity', desc: 'Promises, Bethlehem, and the birth of Jesus.', icon: 'gift', accent: colors.info, topic: 'nativity', group: 'scripture' },
  { key: 'miracles', title: 'Miracles of Jesus', desc: 'Signs of compassion, authority, and faith.', icon: 'sparkles', accent: colors.brandSecondary, topic: 'miracles', group: 'scripture' },
  { key: 'parables', title: 'Parables', desc: 'Kingdom truths carried through memorable stories.', icon: 'chatbubble-ellipses', accent: colors.brand, topic: 'parables', group: 'scripture' },
  { key: 'sermon', title: 'Sermon on the Mount', desc: 'Beatitudes, prayer, trust, and kingdom living.', icon: 'map', accent: '#67B4E7', topic: 'sermon', group: 'scripture' },
  { key: 'apostles', title: 'Apostles', desc: 'The Twelve, Paul, and the early church mission.', icon: 'people', accent: colors.brandSecondary, topic: 'apostles', group: 'scripture' },
  { key: 'resurrection', title: 'Resurrection', desc: 'The empty tomb and the risen Christ.', icon: 'trophy', accent: colors.brand, topic: 'resurrection', group: 'scripture' },
  { key: 'jonah', title: 'Jonah', desc: 'A runaway prophet and God’s wide mercy.', icon: 'fish', accent: colors.info, topic: 'jonah', group: 'scripture' },
  { key: 'commandments', title: 'Ten Commandments', desc: 'Covenant commands and faithful living.', icon: 'library', accent: colors.coral, topic: 'commandments', group: 'scripture' },
  { key: 'psalms', title: 'Psalms', desc: 'Songs, prayers, lament, gratitude, and praise.', icon: 'musical-notes', accent: '#E98BB8', topic: 'psalms', group: 'scripture' },
  { key: 'verse', title: 'Verse Memory', desc: 'Restore missing words across 13 WEB passages.', icon: 'book', accent: colors.brand, topic: 'verse', group: 'skills' },
  { key: 'puzzle', title: 'Word Forge', desc: 'Unscramble Bible names, places, and themes.', icon: 'grid', accent: colors.brandSecondary, topic: 'puzzle', group: 'skills' },
  { key: 'leaderboard', title: 'Device Leaderboard', desc: 'Compare XP and streaks for local players.', icon: 'trophy', accent: colors.success, topic: 'leaderboard', group: 'skills' },
];

export default function QuizHub() {
  const router = useRouter();

  const go = (item: Game) => {
    if (item.topic === 'verse') router.push('/verse');
    else if (item.topic === 'puzzle') router.push('/puzzle');
    else if (item.topic === 'leaderboard') router.push('/leaderboard');
    else router.push({ pathname: '/quiz-play', params: { topic: item.topic } });
  };

  const openBook = (book: (typeof BOOK_MASTERY_BOOKS)[number]) => {
    router.push({ pathname: '/book-mastery', params: { book: book.id, mode: 'core' } });
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-09']} darkness={0.65}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader eyebrow="TRAINING GROUNDS" title="Scripture Training" subtitle="Build skill outside the tournament with quizzes, memory work, and puzzles." />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <GlassPanel strong style={styles.dailyHero}>
            <View style={styles.dailyIcon}><Ionicons name="sunny" size={30} color={colors.brand} /></View>
            <View style={styles.dailyCopy}>
              <Text style={styles.dailyEyebrow}>TODAY’S MISSION</Text>
              <Text style={styles.dailyTitle}>Daily Scripture Trial</Text>
              <Text style={styles.dailyDescription}>Five deterministic questions, refreshed each local day. First clear earns 75 XP and 20 Manna.</Text>
            </View>
            <TactileButton compact label="Enter" onPress={() => router.push('/daily-challenge')} />
          </GlassPanel>

          <SectionTitle title="Scripture Fields" />
          <View style={styles.list}>
            {GAMES.filter((item) => item.group === 'scripture').map((game) => (
              <FeatureCard
                key={game.key}
                testID={`game-${game.key}`}
                title={game.title}
                description={game.desc}
                accent={game.accent}
                icon={<Ionicons name={game.icon} size={25} color={game.accent} />}
                onPress={() => go(game)}
              />
            ))}
          </View>

          <SectionTitle title="Old Testament Books" />
          <View style={styles.list}>
            {BOOK_MASTERY_BOOKS.filter((book) => book.testament === 'old').map((book) => (
              <FeatureCard
                key={book.id}
                testID={`book-mastery-${book.id}`}
                title={book.title}
                description={book.summary}
                accent={colors.brand}
                icon={<Text style={styles.bookIcon}>{book.icon}</Text>}
                badge="5 FREE · 10 DEEP"
                onPress={() => openBook(book)}
              />
            ))}
          </View>

          <SectionTitle title="New Testament Books" />
          <View style={styles.list}>
            {BOOK_MASTERY_BOOKS.filter((book) => book.testament === 'new').map((book) => (
              <FeatureCard
                key={book.id}
                testID={`book-mastery-${book.id}`}
                title={book.title}
                description={book.summary}
                accent={colors.brandSecondary}
                icon={<Text style={styles.bookIcon}>{book.icon}</Text>}
                badge="5 FREE · 10 DEEP"
                onPress={() => openBook(book)}
              />
            ))}
          </View>

          <SectionTitle title="Memory & Skill" />
          <View style={styles.list}>
            {GAMES.filter((item) => item.group === 'skills').map((game) => (
              <FeatureCard
                key={game.key}
                testID={`game-${game.key}`}
                title={game.title}
                description={game.desc}
                accent={game.accent}
                icon={<Ionicons name={game.icon} size={25} color={game.accent} />}
                badge={game.topic === 'verse' ? '13 PASSAGES' : undefined}
                onPress={() => go(game)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 130, gap: spacing.md },
  dailyHero: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  dailyIcon: { width: 56, height: 56, borderRadius: 19, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.13)', alignItems: 'center', justifyContent: 'center' },
  dailyCopy: { gap: 3 },
  dailyEyebrow: { color: colors.brand, fontSize: 9.5, fontWeight: '900', letterSpacing: 1.4 },
  dailyTitle: { color: colors.onSurface, fontSize: 21, fontWeight: '900' },
  dailyDescription: { color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  list: { gap: spacing.md },
  bookIcon: { fontSize: 25 },
});
