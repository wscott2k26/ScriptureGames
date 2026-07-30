import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { storyImage } from '@/src/story-images';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { WordRevealText } from '@/src/components/premium/WordRevealText';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';

type Story = { id: string; title: string; image: string; summary: string; text: string; character_emoji?: string };

export default function StoryDetail() {
  const { id, nodeId } = useLocalSearchParams<{ id: string; nodeId?: string }>();
  const router = useRouter();
  const { profile, refresh } = useProfile();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    api.getStory(String(id), profile.mode)
      .then((result) => { if (active) setStory(result); })
      .catch(() => { if (active) setError('This story could not be opened.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, profile]);

  const finish = async () => {
    sfx.win();
    if (profile && nodeId) {
      try {
        await api.completeNode(profile.id, String(nodeId), 1, 1);
        await refresh();
      } catch {
        // Story remains readable even if progress cannot be recorded.
      }
    }
    router.back();
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-07']} darkness={0.72}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="STORY ARCHIVE" title={story?.title || 'Opening Story'} subtitle={story?.summary} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {loading ? <GlassPanel style={styles.loading}><ActivityIndicator color={colors.brand} /><Text style={styles.loadingText}>Opening the story scroll…</Text></GlassPanel> : null}
          {error ? <GlassPanel style={styles.errorPanel}><Text style={styles.error}>{error}</Text></GlassPanel> : null}
          {story ? (
            <>
              <GlassPanel strong style={styles.hero}>
                <Image source={storyImage(story.id)} style={styles.image} contentFit="cover" transition={250} />
                <View style={styles.heroBottom}>
                  <Text style={styles.emoji}>{story.character_emoji || '📖'}</Text>
                  <Text style={styles.heroTitle}>{story.title}</Text>
                  <Text style={styles.summary}>{story.summary}</Text>
                </View>
              </GlassPanel>
              <GlassPanel strong style={styles.storyCard}>
                <WordRevealText text={story.text} speed={28} style={styles.storyText} />
              </GlassPanel>
              <TactileButton label={nodeId ? 'Mark Story Complete' : 'Close Story'} onPress={finish} />
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  loading: { minHeight: 120, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: colors.muted, fontWeight: '800' },
  errorPanel: { borderRadius: radii.lg, padding: spacing.md },
  error: { color: colors.error, textAlign: 'center', fontWeight: '800' },
  hero: { borderRadius: radii.xl, overflow: 'hidden' },
  image: { width: '100%', height: 230 },
  heroBottom: { padding: spacing.lg, gap: spacing.sm },
  emoji: { fontSize: 42 },
  heroTitle: { color: colors.onSurface, fontSize: 25, fontWeight: '900' },
  summary: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  storyCard: { borderRadius: radii.xl, padding: spacing.xl },
  storyText: { color: colors.onSurface, fontSize: 17, lineHeight: 29 },
});
