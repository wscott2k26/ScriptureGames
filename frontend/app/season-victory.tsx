import {
  useEffect,
  useState } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CelebrationBurst } from '@/src/components/premium/CelebrationBurst';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useProfile } from '@/src/profile-context';
import { colors } from '@/src/theme';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { GENESIS_BACKGROUNDS, GENESIS_TRIALS, getFaction, rankFor } from '@/src/genesis-season';
import { loadSeasonProgress, type SeasonProgress } from '@/src/season-progress';
import { syncGenesisJourneyCompletion } from '@/src/bible-journey/progress';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

export default function SeasonVictory() {
  const router = useRouter();
  const { profile } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const [season, setSeason] = useState<SeasonProgress | null>(null);

  useEffect(() => {
    if (!profile) return;
    void loadSeasonProgress(profile.id).then(async (next) => {
      setSeason(next);
      if (next.completedTrials.length >= GENESIS_TRIALS.length) {
        await syncGenesisJourneyCompletion(profile.id, next.completedTrials.length).catch(() => undefined);
      }
    });
  }, [profile]);

  if (!profile || !season) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-10']} darkness={0.5} preserveSource>
        <SafeAreaView style={styles.center}><Text style={styles.loading}>Preparing the victory hall…</Text></SafeAreaView>
      </CinematicBackdrop>
    );
  }

  const completed = season.completedTrials.length;
  const unlocked = completed >= GENESIS_TRIALS.length;
  const faction = getFaction(season.faction);
  const rank = rankFor(season.rankPoints);
  const scores = Object.values(season.bestResults);
  const average = scores.length ? Math.round(scores.reduce((sum, item) => sum + item.percent, 0) / scores.length) : 0;
  const perfects = scores.filter((item) => item.percent === 100).length;

  const share = async () => {
    await Share.share({
      message: `✺ GENESIS CHAMPION ✺\n${profile.name} completed Scripture Games: Genesis Tournament — Season One.\nFaction: ${faction?.name || 'Genesis Challenger'}\nAverage accuracy: ${average}%\nManna earned: ${season.manna}\nRank: ${rank.name}\nEnter the Word. Face the trials. Rise through the ranks.`,
    });
  };

  if (!unlocked) {
    return (
      <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-10']} darkness={0.5} preserveSource>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.lockedWrap}>
            <GlassPanel strong style={styles.lockedPanel}>
              <Ionicons name="lock-closed" size={46} color={colors.muted} />
              <Text style={styles.lockedTitle}>The Victory Hall is sealed.</Text>
              <Text style={styles.lockedCopy}>Complete all ten Genesis trials to open this chamber. You have cleared {completed} of 10.</Text>
              <TactileButton label="Return to the Trial Map" onPress={() => router.replace('/(tabs)/journey')} />
            </GlassPanel>
          </View>
        </SafeAreaView>
      </CinematicBackdrop>
    );
  }

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-10']} darkness={0.35} preserveSource>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {!reducedMotion ? <CelebrationBurst intensity="champion" colors={[colors.brand, '#F9E8B6', colors.brandSecondary, faction?.accent || colors.coral, '#FFFFFF']} /> : null}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={reducedMotion ? undefined : FadeInUp.duration(650)} style={styles.hero}>
            <View style={styles.crown}><Text style={styles.crownText}>✺</Text></View>
            <Text style={styles.eyebrow}>GENESIS TOURNAMENT · SEASON ONE</Text>
            <Text style={styles.title}>GENESIS{`\n`}CHAMPION</Text>
            <Text style={styles.subtitle}>From “Let there be light” to Joseph’s final promise—you opened every gate.</Text>
          </Animated.View>

          <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(180).duration(600)}>
            <GlassPanel strong style={styles.certificate}>
              <View style={styles.certificateTop}>
                <View style={[styles.factionSeal, faction && { borderColor: faction.accent, backgroundColor: faction.softAccent }]}>
                  <Text style={styles.factionIcon}>{faction?.icon}</Text>
                </View>
                <View style={styles.certificateNameWrap}>
                  <Text style={styles.certLabel}>THIS RECORD HONORS</Text>
                  <Text style={styles.certName}>{profile.name}</Text>
                  <Text style={[styles.certFaction, faction && { color: faction.accent }]}>{faction?.name} · {rank.name}</Text>
                </View>
                <Text style={styles.playerAvatar}>{profile.avatar}</Text>
              </View>
              <View style={styles.goldRule} />
              <Text style={styles.certBody}>For completing all ten trials of Genesis Tournament: Season One and demonstrating knowledge across creation, covenant, calling, conflict, forgiveness, and providence.</Text>
              <View style={styles.signatureRow}>
                <View><Text style={styles.signatureValue}>10 / 10</Text><Text style={styles.signatureLabel}>GATES OPENED</Text></View>
                <Text style={styles.signatureMark}>✦</Text>
                <View><Text style={styles.signatureValue}>{season.manna}</Text><Text style={styles.signatureLabel}>MANNA EARNED</Text></View>
              </View>
            </GlassPanel>
          </Animated.View>

          <View style={styles.statsGrid}>
            <GlassPanel style={styles.statCard}><Text style={styles.statValue}>{average}%</Text><Text style={styles.statLabel}>AVERAGE ACCURACY</Text></GlassPanel>
            <GlassPanel style={styles.statCard}><Text style={styles.statValue}>{perfects}</Text><Text style={styles.statLabel}>PERFECT TRIALS</Text></GlassPanel>
            <GlassPanel style={styles.statCard}><Text style={styles.statValue}>{season.rankPoints}</Text><Text style={styles.statLabel}>RANK POINTS</Text></GlassPanel>
          </View>

          <GlassPanel style={styles.legacyPanel}>
            <Ionicons name="book" size={25} color={colors.brand} />
            <View style={styles.legacyCopy}>
              <Text style={styles.legacyLabel}>THE GENESIS LEGACY</Text>
              <Text style={styles.legacyText}>Human choices carry real consequences, yet God’s faithfulness keeps moving through broken families, uncertain roads, long waiting, and even intended harm. The promise is still alive when Genesis closes.</Text>
            </View>
          </GlassPanel>

          <TactileButton label="Continue to Exodus" icon={<Ionicons name="arrow-forward-circle" size={20} color={colors.onBrand} />} onPress={() => router.push({ pathname: '/book-season', params: { bookId: 'EXO' } })} />
          <TactileButton variant="glass" label="Choose Any Bible Book" icon={<Ionicons name="library" size={19} color={colors.onSurface} />} onPress={() => router.push('/book-library')} />
          <TactileButton label="Share My Champion Record" icon={<Ionicons name="share-social" size={20} color={colors.onBrand} />} onPress={() => void share()} />
          <TactileButton variant="glass" label="Return to Genesis Map" icon={<Ionicons name="map" size={19} color={colors.onSurface} />} onPress={() => router.replace('/(tabs)/journey')} />
          <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: '/genesis-trial', params: { id: 'trial-10' } })} style={styles.replayLink}>
            <Text style={styles.replayText}>Replay the Final Genesis Trial</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loading: { color: colors.parchment, fontSize: 16, fontWeight: '800' },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 42, gap: 15, justifyContent: 'center', maxWidth: 720, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', gap: 7 },
  crown: { width: 70, height: 70, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandTertiary, borderWidth: 1, borderColor: colors.borderStrong },
  crownText: { color: colors.brand, fontSize: 44, textShadowColor: 'rgba(232,185,87,0.65)', textShadowRadius: 17 },
  eyebrow: { color: colors.brand, fontSize: 9.5, letterSpacing: 1.5, fontWeight: '900', marginTop: 4 },
  title: { color: colors.onSurface, fontSize: 42, lineHeight: 42, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },
  subtitle: { color: colors.parchment, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 470 },
  certificate: { borderRadius: 28, padding: 18, gap: 14 },
  certificateTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  factionSeal: { width: 54, height: 54, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  factionIcon: { fontSize: 27 },
  certificateNameWrap: { flex: 1 },
  certLabel: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  certName: { color: colors.onSurface, fontSize: 23, fontWeight: '900', marginTop: 2 },
  certFaction: { color: colors.brand, fontSize: 11, fontWeight: '900', marginTop: 2 },
  playerAvatar: { fontSize: 35 },
  goldRule: { height: 1, backgroundColor: 'rgba(232,185,87,0.42)' },
  certBody: { color: colors.parchment, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  signatureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  signatureValue: { color: colors.onSurface, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  signatureLabel: { color: colors.muted, fontSize: 7.5, letterSpacing: 0.9, fontWeight: '900', marginTop: 2 },
  signatureMark: { color: colors.brand, fontSize: 27 },
  statsGrid: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, minHeight: 85, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 9 },
  statValue: { color: colors.onSurface, fontSize: 21, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 7, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center', marginTop: 4 },
  legacyPanel: { borderRadius: 22, padding: 15, flexDirection: 'row', gap: 12 },
  legacyCopy: { flex: 1 },
  legacyLabel: { color: colors.brand, fontSize: 8.5, fontWeight: '900', letterSpacing: 1.1 },
  legacyText: { color: colors.parchment, fontSize: 12.5, lineHeight: 19, marginTop: 4 },
  replayLink: { padding: 10, alignSelf: 'center' },
  replayText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  lockedWrap: { flex: 1, padding: 20, justifyContent: 'center' },
  lockedPanel: { borderRadius: 28, padding: 24, alignItems: 'center', gap: 13, maxWidth: 580, width: '100%', alignSelf: 'center' },
  lockedTitle: { color: colors.onSurface, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  lockedCopy: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
