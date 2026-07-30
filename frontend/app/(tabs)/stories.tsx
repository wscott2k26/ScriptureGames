import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { DEVOTIONAL_IMAGE, storyImage } from '@/src/story-images';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { FeatureCard, SectionTitle } from '@/src/components/premium/FeatureCard';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';

type Story = { id: string; title: string; summary: string; image: string; premium?: boolean; character_emoji?: string };
type Devo = { title: string; verse: string; reference: string; reflection: string; prayer: string };

export default function StoriesScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const [stories, setStories] = useState<Story[]>([]);
  const [devo, setDevo] = useState<Devo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setError(null);
    try {
      const [storyResult, devotionalResult] = await Promise.all([api.getStories(), api.getDevotional(profile.mode)]);
      setStories(storyResult.stories);
      setDevo(devotionalResult);
    } catch {
      setError('The Scripture Archive could not be opened. Pull down to try again.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-06']} darkness={0.66}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader eyebrow="SCRIPTURE ARCHIVE" title="Stories & Devotional" subtitle="Read deeply, reflect honestly, and carry one faithful truth into the day." />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
        >
          {loading ? (
            <GlassPanel style={styles.loading}><ActivityIndicator color={colors.brand} /><Text style={styles.loadingText}>Opening the archive…</Text></GlassPanel>
          ) : devo ? (
            <GlassPanel strong style={styles.devotionalCard}>
              <Image source={DEVOTIONAL_IMAGE} style={styles.devotionalImage} contentFit="cover" transition={250} />
              <View style={styles.devotionalContent}>
                <Text style={styles.devotionalEyebrow}>TODAY’S DEVOTIONAL</Text>
                <Text style={styles.devotionalTitle}>{devo.title}</Text>
                <Text style={styles.devotionalVerse}>“{devo.verse}”</Text>
                <Text style={styles.devotionalReference}>{devo.reference}</Text>
                <TactileButton compact label="Read Reflection" onPress={() => router.push('/devotional')} />
              </View>
            </GlassPanel>
          ) : null}

          {error ? <GlassPanel style={styles.errorPanel}><Ionicons name="warning" size={21} color={colors.error} /><Text style={styles.error}>{error}</Text></GlassPanel> : null}

          <SectionTitle title={`Bible Stories · ${stories.length}`} />
          <View style={styles.storyList}>
            {stories.map((story) => (
              <GlassPanel key={story.id} style={styles.storyCard}>
                <Image source={storyImage(story.id)} style={styles.storyImage} contentFit="cover" transition={220} />
                <View style={styles.storyCopy}>
                  <Text style={styles.storyEyebrow}>{story.character_emoji || '📖'} STORY ARCHIVE</Text>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <Text numberOfLines={3} style={styles.storySummary}>{story.summary}</Text>
                  <TactileButton compact variant="glass" label="Open Story" onPress={() => router.push({ pathname: '/story/[id]', params: { id: story.id } })} />
                </View>
              </GlassPanel>
            ))}
          </View>

          <SectionTitle title="Keep Exploring" />
          <FeatureCard title="Verse Memory Hall" description="Practice 13 World English Bible passages with tactile fill-in-the-blank rounds." icon={<Ionicons name="book" size={26} color={colors.brand} />} onPress={() => router.push('/verse')} />
          <FeatureCard title="Ask Lumi" description="Bring a Bible person, passage, doctrine, prayer, or life question to the companion." icon={<Ionicons name="chatbubbles" size={26} color={colors.brandSecondary} />} accent={colors.brandSecondary} onPress={() => router.push('/(tabs)/companion')} />
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 130, gap: spacing.md },
  loading: { minHeight: 120, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: colors.muted, fontWeight: '800' },
  devotionalCard: { borderRadius: radii.xl, overflow: 'hidden' },
  devotionalImage: { width: '100%', height: 190 },
  devotionalContent: { padding: spacing.lg, gap: spacing.sm },
  devotionalEyebrow: { color: colors.brand, fontSize: 9.5, fontWeight: '900', letterSpacing: 1.4 },
  devotionalTitle: { color: colors.onSurface, fontSize: 24, fontWeight: '900' },
  devotionalVerse: { color: colors.parchment, fontSize: 16, lineHeight: 23, fontStyle: 'italic' },
  devotionalReference: { color: colors.brandSecondary, fontSize: 12, fontWeight: '900' },
  errorPanel: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm },
  error: { color: colors.error, flex: 1, fontWeight: '800', lineHeight: 18 },
  storyList: { gap: spacing.md },
  storyCard: { borderRadius: radii.xl, overflow: 'hidden' },
  storyImage: { width: '100%', height: 175 },
  storyCopy: { padding: spacing.lg, gap: spacing.sm },
  storyEyebrow: { color: colors.brand, fontSize: 9.5, fontWeight: '900', letterSpacing: 1.2 },
  storyTitle: { color: colors.onSurface, fontSize: 21, fontWeight: '900' },
  storySummary: { color: colors.muted, fontSize: 12.5, lineHeight: 18 },
});
