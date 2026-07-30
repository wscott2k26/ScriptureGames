import {
  useEffect,
  useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '@/src/profile-context';
import { usePreferences, type MotionMode } from '@/src/preferences-context';
import { api, storage } from '@/src/api';
import { resetSeasonProgress } from '@/src/season-progress';
import { AVATARS, colors, radii, spacing } from '@/src/theme';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';

const MOTION_OPTIONS: { value: MotionMode; label: string; description: string }[] = [
  { value: 'system', label: 'System', description: 'Follow the phone accessibility setting.' },
  { value: 'reduced', label: 'Reduced', description: 'Minimize drifting and transition motion.' },
  { value: 'full', label: 'Full', description: 'Use the full cinematic motion system.' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, setProfile, logout } = useProfile();
  const { preferences, updatePreferences, resetPreferences } = usePreferences();
  const [name, setName] = useState(profile?.name || '');
  const [avatar, setAvatar] = useState(profile?.avatar || AVATARS[0]);
  const [mode, setMode] = useState<'kids' | 'adult'>(profile?.mode || 'kids');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setAvatar(profile.avatar);
    setMode(profile.mode);
  }, [profile]);

  if (!profile) return null;

  const saveProfile = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await api.updateProfile(profile.id, { name, avatar, mode });
      setProfile(updated);
      setSaved(true);
    } catch {
      setError('The player profile could not be saved. Your previous profile remains intact.');
    } finally {
      setSaving(false);
    }
  };

  const choosePlayer = async () => {
    await logout();
    router.replace('/onboarding');
  };

  const openExternalPage = async (url: string, label: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error('Unsupported URL');
      await Linking.openURL(url);
    } catch {
      Alert.alert(`${label} unavailable`, 'The page could not be opened on this device. You can still contact support at loftlatte25@gmail.com.');
    }
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-04']} darkness={0.67}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader back eyebrow="PLAYER CONTROL" title="Settings" subtitle="Profile, accessibility, feedback, privacy, and local data." />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.section}>Player Profile</Text>
          <GlassPanel strong style={styles.panel}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              maxLength={30}
              placeholder="Player name"
              placeholderTextColor={colors.muted}
              style={styles.input}
              accessibilityLabel="Player display name"
            />
            <Text style={styles.label}>EMBLEM</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((item) => (
                <Pressable key={item} accessibilityRole="button" accessibilityLabel={`Choose ${item} emblem`} onPress={() => setAvatar(item)} style={[styles.avatarOption, avatar === item && styles.avatarSelected]}>
                  <Text style={styles.avatar}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>READING PATH</Text>
            <View style={styles.segmentRow}>
              <Pressable accessibilityRole="radio" accessibilityLabel="Explorer reading path" accessibilityState={{ selected: mode === 'kids' }} onPress={() => setMode('kids')} style={[styles.segment, mode === 'kids' && styles.segmentActive]}><Text style={[styles.segmentText, mode === 'kids' && styles.segmentTextActive]}>Explorer</Text></Pressable>
              <Pressable accessibilityRole="radio" accessibilityLabel="Scholar reading path" accessibilityState={{ selected: mode === 'adult' }} onPress={() => setMode('adult')} style={[styles.segment, mode === 'adult' && styles.segmentActive]}><Text style={[styles.segmentText, mode === 'adult' && styles.segmentTextActive]}>Scholar</Text></Pressable>
            </View>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <TactileButton compact label={saving ? 'Saving…' : saved ? 'Profile Saved' : 'Save Player Profile'} disabled={saving || !name.trim()} onPress={saveProfile} />
          </GlassPanel>

          <Text style={styles.section}>Experience</Text>
          <GlassPanel strong style={styles.panel}>
            <SettingToggle
              icon="phone-portrait"
              title="Haptic Feedback"
              description="Touchable controls and answer feedback use physical vibration."
              value={preferences.hapticsEnabled}
              onValueChange={(value) => void updatePreferences({ hapticsEnabled: value })}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="text"
              title="Cinematic Text Reveal"
              description="Story briefings reveal smoothly word by word and remain skippable."
              value={preferences.cinematicTextEnabled}
              onValueChange={(value) => void updatePreferences({ cinematicTextEnabled: value })}
            />
            <View style={styles.divider} />
            <Text style={styles.label}>MOTION</Text>
            <View style={styles.motionList}>
              {MOTION_OPTIONS.map((option) => (
                <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ selected: preferences.motionMode === option.value }} onPress={() => void updatePreferences({ motionMode: option.value })} style={[styles.motionOption, preferences.motionMode === option.value && styles.motionSelected]}>
                  <View style={styles.motionCopy}>
                    <Text style={styles.motionTitle}>{option.label}</Text>
                    <Text style={styles.motionDescription}>{option.description}</Text>
                  </View>
                  <Ionicons name={preferences.motionMode === option.value ? 'radio-button-on' : 'radio-button-off'} size={21} color={preferences.motionMode === option.value ? colors.brand : colors.muted} />
                </Pressable>
              ))}
            </View>
            <TactileButton compact variant="glass" label="Restore Experience Defaults" onPress={() => void resetPreferences()} />
          </GlassPanel>

          <Text style={styles.section}>Privacy & Safety</Text>
          <GlassPanel style={styles.infoPanel}>
            <Ionicons name="lock-closed" size={23} color={colors.success} />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Local-first beta</Text>
              <Text style={styles.infoText}>Profiles, Genesis progress, family records, chat history, and settings stay on this device unless a future cloud mode is deliberately enabled. This build contains no ad tracking and no active payment flow.</Text>
            </View>
          </GlassPanel>
          <GlassPanel style={styles.infoPanel}>
            <Ionicons name="chatbubble-ellipses" size={23} color={colors.brandSecondary} />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Bible Companion boundary</Text>
              <Text style={styles.infoText}>The companion provides general Scripture guidance. It is not emergency, medical, legal, mental-health, or pastoral care. Urgent safety concerns require a trusted nearby person or local emergency support.</Text>
            </View>
          </GlassPanel>
          <View style={styles.policyActions}>
            <TactileButton compact variant="glass" label="Open Privacy Policy" icon={<Ionicons name="shield-checkmark" size={18} color={colors.onSurface} />} onPress={() => void openExternalPage('https://scripture-games-support.vercel.app/privacy/', 'Privacy policy')} />
            <TactileButton compact variant="glass" label="Open Player Support" icon={<Ionicons name="help-circle" size={18} color={colors.onSurface} />} onPress={() => void openExternalPage('https://scripture-games-support.vercel.app/support/', 'Player support')} />
          </View>

          <Text style={styles.section}>Player & Data</Text>
          <View style={styles.actions}>
            <TactileButton variant="glass" label="Choose Another Player" icon={<Ionicons name="people" size={19} color={colors.onSurface} />} onPress={choosePlayer} />
            <TactileButton
              variant="stone"
              label="Reset Genesis Season Only"
              onPress={() => Alert.alert('Reset Genesis Season?', 'This removes faction, Manna, rank points, decisions, trial scores, and season completion for this player. Classic training XP remains.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset Season', style: 'destructive', onPress: async () => { await resetSeasonProgress(profile.id); router.replace('/faction-select'); } },
              ])}
            />
            <TactileButton
              variant="danger"
              label="Erase All Scripture Games Data"
              onPress={() => Alert.alert('Erase everything?', 'This permanently removes every local player, family record, score, chat, setting, and Genesis season from this device.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Erase Everything', style: 'destructive', onPress: async () => { await storage.resetAll(); await logout(); router.replace('/onboarding'); } },
              ])}
            />
          </View>
          <Text style={styles.version}>Scripture Games · Genesis Tournament Season One · Build 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

function SettingToggle({ icon, title, description, value, onValueChange }: { icon: 'phone-portrait' | 'text'; title: string; description: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleIcon}><Ionicons name={icon} size={20} color={colors.brand} /></View>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#39404D', true: '#9E7B2F' }} thumbColor={value ? colors.brand : '#D7D1C6'} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  section: { color: colors.parchment, fontSize: 18, fontWeight: '900', marginTop: spacing.sm },
  panel: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  label: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  error: { color: colors.error, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  input: { height: 52, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(5,9,18,0.62)', color: colors.onSurface, paddingHorizontal: spacing.md, fontSize: 17, fontWeight: '800' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  avatarOption: { width: 50, height: 50, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { borderColor: colors.brand, backgroundColor: 'rgba(232,185,87,0.18)' },
  avatar: { fontSize: 27 },
  segmentRow: { flexDirection: 'row', gap: spacing.sm },
  segment: { flex: 1, minHeight: 46, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  segmentActive: { borderColor: colors.brand, backgroundColor: 'rgba(232,185,87,0.18)' },
  segmentText: { color: colors.muted, fontWeight: '900' },
  segmentTextActive: { color: colors.brand },
  divider: { height: 1, backgroundColor: colors.divider },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toggleIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(232,185,87,0.12)', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  toggleCopy: { flex: 1 },
  toggleTitle: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  toggleDescription: { color: colors.muted, fontSize: 11.5, lineHeight: 16, marginTop: 2 },
  motionList: { gap: spacing.sm },
  motionOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, backgroundColor: 'rgba(255,255,255,0.04)' },
  motionSelected: { borderColor: colors.brand, backgroundColor: 'rgba(232,185,87,0.11)' },
  motionCopy: { flex: 1 },
  motionTitle: { color: colors.onSurface, fontSize: 14, fontWeight: '900' },
  motionDescription: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 2 },
  infoPanel: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  infoCopy: { flex: 1 },
  infoTitle: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  infoText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  policyActions: { gap: spacing.sm },
  actions: { gap: spacing.md },
  version: { color: colors.muted, fontSize: 10.5, lineHeight: 16, textAlign: 'center', marginTop: spacing.sm },
});
