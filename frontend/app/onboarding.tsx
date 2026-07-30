import {
  useCallback,
  useEffect,
  useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sfx } from '@/src/sfx';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

import { api, storage } from '@/src/api';
import { useProfile, type Profile } from '@/src/profile-context';
import { AVATARS, colors } from '@/src/theme';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { WordRevealText } from '@/src/components/premium/WordRevealText';
import { FACTIONS, GENESIS_BACKGROUNDS, type FactionId } from '@/src/genesis-season';
import { loadSeasonProgress, selectFaction } from '@/src/season-progress';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

const STEPS = 4;

export default function Onboarding() {
  const router = useRouter();
  const { setProfile } = useProfile();
  const reducedMotion = useReducedMotionPreference();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [mode, setMode] = useState<'kids' | 'adult'>('kids');
  const [faction, setFaction] = useState<FactionId>('lionguard');
  const [loading, setLoading] = useState(false);
  const [existingProfiles, setExistingProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      const result = await api.listProfiles();
      setExistingProfiles(result.profiles);
    } catch {
      setExistingProfiles([]);
    }
  }, []);

  useEffect(() => { void loadProfiles(); }, [loadProfiles]);

  const goNext = () => {
    sfx.press();
    setStep((value) => Math.min(STEPS - 1, value + 1));
  };

  const goBack = () => {
    sfx.tap();
    setStep((value) => Math.max(0, value - 1));
  };

  const continueAs = async (selectedProfile: Profile) => {
    setLoading(true);
    setError(null);
    try {
      await storage.saveProfileId(selectedProfile.id);
      setProfile(selectedProfile);
      const season = await loadSeasonProgress(selectedProfile.id);
      sfx.win();
      router.replace(season.faction ? '/(tabs)/journey' : '/faction-select');
    } catch {
      setError('That player could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const profile = await api.createProfile(name.trim(), avatar, mode);
      await storage.saveProfileId(profile.id);
      await selectFaction(profile.id, faction);
      setProfile(profile);
      sfx.win();
      router.replace('/(tabs)/journey');
    } catch {
      setError('We could not create your player. Nothing was lost—please try once more.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.27}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.topbar}>
            {step > 0 ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
              </Pressable>
            ) : <View style={styles.iconSpacer} />}
            <View style={styles.progressTrack} accessibilityLabel={`Onboarding step ${step + 1} of ${STEPS}`}>
              <View style={[styles.progressFill, { width: `${((step + 1) / STEPS) * 100}%` }]} />
            </View>
            <View style={styles.iconSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              key={step}
              entering={reducedMotion ? undefined : step === 0 ? FadeIn.duration(650) : SlideInRight.springify().damping(19)}
              exiting={reducedMotion ? undefined : step === 0 ? FadeOut.duration(220) : SlideOutLeft.duration(220)}
              style={styles.step}
            >
              {step === 0 && (
                <>
                  <View style={styles.seasonBadge}>
                    <Text style={styles.seasonBadgeText}>GENESIS TOURNAMENT · SEASON ONE</Text>
                  </View>
                  <Text style={styles.logoMark}>✦</Text>
                  <Text style={styles.title}>SCRIPTURE{`\n`}GAMES</Text>
                  <Text style={styles.kicker}>Enter the Word. Face the trials. Rise through the ranks.</Text>
                  <GlassPanel strong style={styles.introPanel}>
                    <WordRevealText
                      text="Ten gates stand between the beginning and the final Genesis trial. Every choice tests your discernment. Every challenge strengthens your knowledge. Your story starts where creation itself began."
                      style={styles.introText}
                      speed={35}
                    />
                  </GlassPanel>

                  {existingProfiles.length > 0 && (
                    <View style={styles.returningBlock}>
                      <Text style={styles.sectionLabel}>RETURNING PLAYERS</Text>
                      {existingProfiles.map((saved) => (
                        <Pressable
                          key={saved.id}
                          testID={`continue-profile-${saved.id}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Continue as ${saved.name}`}
                          disabled={loading}
                          onPress={() => void continueAs(saved)}
                        >
                          <GlassPanel style={styles.returningCard}>
                            <Text style={styles.returningAvatar}>{saved.avatar}</Text>
                            <View style={styles.returningCopy}>
                              <Text style={styles.returningName}>{saved.name}</Text>
                              <Text style={styles.returningMeta}>{saved.mode === 'kids' ? 'Explorer' : 'Scholar'} · {saved.xp} XP</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.brand} />
                          </GlassPanel>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <TactileButton
                    testID="onboarding-start-btn"
                    label={existingProfiles.length ? 'Create a New Challenger' : 'Enter the Tournament'}
                    icon={<Ionicons name="arrow-forward" size={20} color={colors.onBrand} />}
                    onPress={goNext}
                    style={styles.fullButton}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <Text style={styles.eyebrow}>CHALLENGER IDENTITY</Text>
                  <Text style={styles.stepTitle}>Who enters the arena?</Text>
                  <Text style={styles.stepCopy}>Choose the name and emblem that will follow you through all ten Genesis trials.</Text>
                  <GlassPanel strong style={styles.formPanel}>
                    <Text style={styles.inputLabel}>PLAYER NAME</Text>
                    <TextInput
                      testID="onboarding-name-input"
                      accessibilityLabel="Player name"
                      style={styles.input}
                      placeholder="Enter your name"
                      placeholderTextColor="rgba(246,241,230,0.45)"
                      value={name}
                      onChangeText={setName}
                      maxLength={20}
                      returnKeyType="done"
                    />
                    <Text style={styles.inputLabel}>PLAYER EMBLEM</Text>
                    <View style={styles.avatarGrid}>
                      {AVATARS.map((item) => (
                        <Pressable
                          key={item}
                          accessibilityRole="button"
                          accessibilityLabel={`Choose ${item} emblem`}
                          accessibilityState={{ selected: avatar === item }}
                          onPress={() => {
                            setAvatar(item);
                            sfx.tap();
                          }}
                          style={[styles.avatarButton, avatar === item && styles.avatarSelected]}
                        >
                          <Text style={styles.avatarEmoji}>{item}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </GlassPanel>
                  <TactileButton
                    testID="onboarding-identity-next"
                    label="Seal My Identity"
                    disabled={!name.trim()}
                    onPress={goNext}
                    style={styles.fullButton}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <Text style={styles.eyebrow}>CHALLENGE DEPTH</Text>
                  <Text style={styles.stepTitle}>Choose your path.</Text>
                  <Text style={styles.stepCopy}>Both paths complete the same tournament. The language and reflections adapt to your selected experience.</Text>
                  <View style={styles.modeList}>
                    <Pressable onPress={() => setMode('kids')} accessibilityRole="radio" accessibilityLabel="Explorer path" accessibilityState={{ selected: mode === 'kids' }}>
                      <GlassPanel strong={mode === 'kids'} style={[styles.modeCard, mode === 'kids' && styles.choiceSelected]}>
                        <Text style={styles.modeIcon}>🛡️</Text>
                        <View style={styles.modeCopy}>
                          <Text style={styles.modeTitle}>Explorer Path</Text>
                          <Text style={styles.modeDescription}>Clear language, strong story moments, and age-friendly reflection.</Text>
                        </View>
                        <Ionicons name={mode === 'kids' ? 'checkmark-circle' : 'ellipse-outline'} size={25} color={mode === 'kids' ? colors.brand : colors.muted} />
                      </GlassPanel>
                    </Pressable>
                    <Pressable onPress={() => setMode('adult')} accessibilityRole="radio" accessibilityLabel="Scholar path" accessibilityState={{ selected: mode === 'adult' }}>
                      <GlassPanel strong={mode === 'adult'} style={[styles.modeCard, mode === 'adult' && styles.choiceSelected]}>
                        <Text style={styles.modeIcon}>📜</Text>
                        <View style={styles.modeCopy}>
                          <Text style={styles.modeTitle}>Scholar Path</Text>
                          <Text style={styles.modeDescription}>Richer context, deeper reflection, and a more mature study tone.</Text>
                        </View>
                        <Ionicons name={mode === 'adult' ? 'checkmark-circle' : 'ellipse-outline'} size={25} color={mode === 'adult' ? colors.brand : colors.muted} />
                      </GlassPanel>
                    </Pressable>
                  </View>
                  <TactileButton label="Continue to Faction Selection" onPress={goNext} style={styles.fullButton} />
                </>
              )}

              {step === 3 && (
                <>
                  <Text style={styles.eyebrow}>FINAL DECLARATION</Text>
                  <Text style={styles.stepTitle}>Choose your faction.</Text>
                  <Text style={styles.stepCopy}>Your faction changes your emblem, color accents, and identity—not the truth of the trials.</Text>
                  <View style={styles.factionList}>
                    {FACTIONS.map((item) => {
                      const selected = faction === item.id;
                      return (
                        <Pressable
                          key={item.id}
                          testID={`faction-${item.id}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Choose ${item.name}`}
                          accessibilityState={{ selected }}
                          onPress={() => {
                            setFaction(item.id);
                            sfx.tap();
                          }}
                        >
                          <GlassPanel strong={selected} style={[styles.factionCard, selected && { borderColor: item.accent }]}>
                            <View style={[styles.factionIcon, { backgroundColor: item.softAccent, borderColor: item.accent }]}>
                              <Text style={styles.factionEmoji}>{item.icon}</Text>
                            </View>
                            <View style={styles.factionCopy}>
                              <Text style={[styles.factionName, selected && { color: item.accent }]}>{item.name}</Text>
                              <Text style={styles.factionMotto}>{item.motto}</Text>
                              <Text style={styles.factionDescription}>{item.description}</Text>
                            </View>
                            <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={selected ? item.accent : colors.muted} />
                          </GlassPanel>
                        </Pressable>
                      );
                    })}
                  </View>
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <TactileButton
                    testID="onboarding-finish"
                    label={loading ? 'Preparing the Arena…' : 'Begin Genesis Season One'}
                    disabled={loading}
                    icon={loading ? <ActivityIndicator color={colors.onBrand} /> : <Ionicons name="sparkles" size={19} color={colors.onBrand} />}
                    onPress={() => void finish()}
                    style={styles.fullButton}
                  />
                </>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingTop: 8 },
  iconButton: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: colors.border },
  iconSpacer: { width: 42 },
  progressTrack: { flex: 1, height: 4, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.12)' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.brand },
  scroll: { flexGrow: 1, padding: 22, paddingBottom: 44, justifyContent: 'center' },
  step: { width: '100%', maxWidth: 620, alignSelf: 'center', alignItems: 'center', gap: 16 },
  seasonBadge: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, backgroundColor: 'rgba(232,185,87,0.13)', borderWidth: 1, borderColor: 'rgba(232,185,87,0.42)' },
  seasonBadgeText: { color: colors.brand, fontWeight: '900', letterSpacing: 1.25, fontSize: 10 },
  logoMark: { color: colors.brand, fontSize: 48, textShadowColor: 'rgba(232,185,87,0.62)', textShadowRadius: 18 },
  title: { color: colors.onSurface, fontSize: 45, lineHeight: 45, fontWeight: '900', textAlign: 'center', letterSpacing: 3 },
  kicker: { color: colors.parchment, fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 430, fontWeight: '700' },
  introPanel: { borderRadius: 25, padding: 20, width: '100%', marginTop: 4 },
  introText: { textAlign: 'center', color: '#EEE4D0', lineHeight: 25, fontSize: 16 },
  returningBlock: { width: '100%', gap: 10, marginTop: 4 },
  sectionLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, textAlign: 'center' },
  returningCard: { borderRadius: 19, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  returningAvatar: { fontSize: 31 },
  returningCopy: { flex: 1 },
  returningName: { color: colors.onSurface, fontWeight: '900', fontSize: 16 },
  returningMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  eyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.7 },
  stepTitle: { color: colors.onSurface, fontSize: 31, lineHeight: 37, fontWeight: '900', textAlign: 'center' },
  stepCopy: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 470 },
  formPanel: { width: '100%', borderRadius: 25, padding: 18, gap: 11 },
  inputLabel: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.25, marginTop: 3 },
  input: { height: 58, borderRadius: 17, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(0,0,0,0.24)', paddingHorizontal: 16, color: colors.onSurface, fontSize: 18, fontWeight: '700' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  avatarButton: { width: 57, height: 57, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: colors.border },
  avatarSelected: { borderColor: colors.brand, backgroundColor: colors.brandTertiary },
  avatarEmoji: { fontSize: 29 },
  modeList: { width: '100%', gap: 12 },
  modeCard: { borderRadius: 23, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 14 },
  choiceSelected: { borderColor: colors.brand },
  modeIcon: { fontSize: 37 },
  modeCopy: { flex: 1 },
  modeTitle: { color: colors.onSurface, fontSize: 18, fontWeight: '900' },
  modeDescription: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 3 },
  factionList: { width: '100%', gap: 11 },
  factionCard: { borderRadius: 23, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13 },
  factionIcon: { width: 55, height: 55, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  factionEmoji: { fontSize: 28 },
  factionCopy: { flex: 1 },
  factionName: { color: colors.onSurface, fontSize: 18, fontWeight: '900' },
  factionMotto: { color: colors.parchment, fontSize: 12, fontWeight: '800', marginTop: 2 },
  factionDescription: { color: colors.muted, fontSize: 11.5, lineHeight: 16, marginTop: 4 },
  fullButton: { width: '100%', marginTop: 5 },
  error: { color: '#FF9A92', textAlign: 'center', fontSize: 13, lineHeight: 18 },
});
