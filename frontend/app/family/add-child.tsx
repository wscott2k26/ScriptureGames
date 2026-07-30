import {
  useState } from 'react';
import {
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
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api, storage } from '@/src/api';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { AVATARS, colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';

export default function AddChild() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [mode, setMode] = useState<'kids' | 'adult'>('kids');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    const familyId = await storage.getFamilyId();
    if (!familyId || !name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.addChild(familyId, name.trim(), avatar, mode);
      sfx.win();
      router.back();
    } catch {
      setError('The kid profile could not be added. The Family Hub remains safe.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-02']} darkness={0.72}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader back eyebrow="FAMILY HUB" title="Add Kid Profile" subtitle="Create a separate local player and reading path." />
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <GlassPanel strong style={styles.panel}>
              <Text style={styles.label}>PLAYER NAME</Text>
              <TextInput value={name} onChangeText={setName} maxLength={30} placeholder="Kid’s name" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Child profile name" />

              <Text style={styles.label}>EMBLEM</Text>
              <View style={styles.avatars}>
                {AVATARS.map((item) => (
                  <Pressable key={item} accessibilityRole="button" accessibilityLabel={`Choose ${item} emblem`} onPress={() => { setAvatar(item); sfx.tap(); }} style={[styles.avatarButton, avatar === item && styles.avatarSelected]}>
                    <Text style={styles.avatar}>{item}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>READING PATH</Text>
              <Pressable accessibilityRole="radio" accessibilityState={{ selected: mode === 'kids' }} onPress={() => setMode('kids')} style={[styles.modeCard, mode === 'kids' && styles.modeSelected]}>
                <Text style={styles.modeIcon}>🧭</Text>
                <View style={styles.modeCopy}><Text style={styles.modeTitle}>Explorer</Text><Text style={styles.modeDescription}>Clearer language and playful guidance for younger readers.</Text></View>
                <Ionicons name={mode === 'kids' ? 'radio-button-on' : 'radio-button-off'} size={22} color={mode === 'kids' ? colors.brand : colors.muted} />
              </Pressable>
              <Pressable accessibilityRole="radio" accessibilityState={{ selected: mode === 'adult' }} onPress={() => setMode('adult')} style={[styles.modeCard, mode === 'adult' && styles.modeSelected]}>
                <Text style={styles.modeIcon}>📜</Text>
                <View style={styles.modeCopy}><Text style={styles.modeTitle}>Scholar</Text><Text style={styles.modeDescription}>Deeper story retellings and devotional reflection for teens and adults.</Text></View>
                <Ionicons name={mode === 'adult' ? 'radio-button-on' : 'radio-button-off'} size={22} color={mode === 'adult' ? colors.brand : colors.muted} />
              </Pressable>

              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TactileButton label={busy ? 'Adding Player…' : 'Add Kid Player'} disabled={busy || !name.trim()} onPress={add} />
            </GlassPanel>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  panel: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  label: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginTop: spacing.sm },
  input: { height: 52, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(4,8,16,0.66)', color: colors.onSurface, paddingHorizontal: spacing.md, fontSize: 16, fontWeight: '700' },
  avatars: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  avatarButton: { width: 50, height: 50, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { borderColor: colors.brand, backgroundColor: 'rgba(232,185,87,0.16)' },
  avatar: { fontSize: 27 },
  modeCard: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.04)', padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  modeSelected: { borderColor: colors.brand, backgroundColor: 'rgba(232,185,87,0.11)' },
  modeIcon: { fontSize: 32 },
  modeCopy: { flex: 1 },
  modeTitle: { color: colors.onSurface, fontSize: 15, fontWeight: '900' },
  modeDescription: { color: colors.muted, fontSize: 11.5, lineHeight: 16, marginTop: 2 },
  error: { color: colors.error, fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
