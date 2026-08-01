import { Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { usePreferences, type MotionMode } from '@/src/preferences-context';
import { useAppAudio } from '@/src/audio-context';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { colors, radii, spacing } from '@/src/theme';

const MOTION_OPTIONS: { value: MotionMode; label: string; description: string }[] = [
  { value: 'system', label: 'System', description: 'Follow the phone accessibility setting.' },
  { value: 'reduced', label: 'Motion Off', description: 'Stop drifting, reveal, and screen-transition motion.' },
  { value: 'full', label: 'Full Motion', description: 'Use the complete cinematic experience.' },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { preferences, updatePreferences, resetPreferences } = usePreferences();
  const { ready, previewSound } = useAppAudio();

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-04']} darkness={0.72}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader eyebrow="PLAYER CONTROL" title="Settings" subtitle="Sound, touch, motion, privacy, cloud backup, and player data." />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.section}>Sound & Touch</Text>
          <GlassPanel strong style={styles.panel}>
            <SettingToggle
              icon="musical-notes"
              title="Soft Piano"
              description="Play quiet original piano ambience. It pauses for Lumi’s microphone and whenever the app leaves the foreground."
              value={preferences.musicEnabled}
              onValueChange={(musicEnabled) => void updatePreferences({ musicEnabled })}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="volume-medium"
              title="Sound Effects"
              description="Play gentle tap, success, and correction cues."
              value={preferences.soundEffectsEnabled}
              onValueChange={(soundEffectsEnabled) => {
                void updatePreferences({ soundEffectsEnabled });
                if (soundEffectsEnabled) setTimeout(() => previewSound('success'), 90);
              }}
            />
            <View style={styles.previewRow}>
              <TactileButton compact variant="glass" label={ready ? 'Preview Success' : 'Audio Preparing…'} disabled={!ready || !preferences.soundEffectsEnabled} onPress={() => previewSound('success')} />
              <TactileButton compact variant="glass" label="Preview Correction" disabled={!ready || !preferences.soundEffectsEnabled} onPress={() => previewSound('error')} />
            </View>
            <View style={styles.divider} />
            <SettingToggle
              icon="phone-portrait"
              title="Haptic Feedback"
              description="Use gentle physical feedback for taps, answers, and achievements."
              value={preferences.hapticsEnabled}
              onValueChange={(hapticsEnabled) => void updatePreferences({ hapticsEnabled })}
            />
          </GlassPanel>

          <Text style={styles.section}>Motion & Reading</Text>
          <GlassPanel strong style={styles.panel}>
            <SettingToggle
              icon="sparkles"
              title="Cinematic Text Reveal"
              description="Reveal story briefings gradually. Every reveal remains skippable."
              value={preferences.cinematicTextEnabled}
              onValueChange={(cinematicTextEnabled) => void updatePreferences({ cinematicTextEnabled })}
            />
            <View style={styles.divider} />
            <Text style={styles.label}>MOTION</Text>
            <View style={styles.motionList}>
              {MOTION_OPTIONS.map((option) => {
                const selected = preferences.motionMode === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => void updatePreferences({
                      motionMode: option.value,
                      ...(option.value === 'reduced' ? { cinematicTextEnabled: false } : {}),
                    })}
                    style={[styles.motionOption, selected && styles.motionSelected]}
                  >
                    <View style={styles.motionCopy}>
                      <Text style={styles.motionTitle}>{option.label}</Text>
                      <Text style={styles.motionDescription}>{option.description}</Text>
                    </View>
                    <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.brand : colors.muted} />
                  </Pressable>
                );
              })}
            </View>
          </GlassPanel>

          <Text style={styles.section}>Account, Privacy & Data</Text>
          <GlassPanel style={styles.infoPanel}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Local-first and private</Text>
              <Text style={styles.infoText}>Guest play stays on this device. Cloud backup is optional. Microphone audio is used only for live speech recognition and is not saved by Scripture Games.</Text>
            </View>
          </GlassPanel>
          <View style={styles.actions}>
            <TactileButton label="Manage Cloud Backup" icon={<Ionicons name="cloud-outline" size={19} color={colors.onSurface} />} variant="glass" onPress={() => router.push('/cloud-account')} />
            <TactileButton label="Player & Data Settings" icon={<Ionicons name="person-circle-outline" size={19} color={colors.onSurface} />} variant="glass" onPress={() => router.push('/settings')} />
            <TactileButton label="Privacy Policy" icon={<Ionicons name="lock-closed-outline" size={19} color={colors.onSurface} />} variant="glass" onPress={() => void Linking.openURL('https://scripture-games-support.vercel.app/privacy/')} />
            <TactileButton label="Restore All Defaults" variant="stone" onPress={() => void resetPreferences()} />
          </View>
          <Text style={styles.footer}>All music and feedback sounds are bundled with the app for offline use.</Text>
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

function SettingToggle({ icon, title, description, value, onValueChange }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
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
  divider: { height: 1, backgroundColor: colors.divider },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toggleIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: 'rgba(232,185,87,0.12)', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  toggleCopy: { flex: 1 },
  toggleTitle: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  toggleDescription: { color: colors.muted, fontSize: 11.5, lineHeight: 16, marginTop: 2 },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  label: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
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
  actions: { gap: spacing.sm },
  footer: { color: colors.muted, textAlign: 'center', fontSize: 10.5, lineHeight: 15, marginTop: spacing.sm },
});
