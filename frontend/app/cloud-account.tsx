import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  backupThisDevice,
  cloudBackupConfigured,
  createCloudAccount,
  deleteCloudAccount,
  getCloudBackupState,
  restoreCloudBackup,
  sendCloudPasswordReset,
  signInToCloud,
  signOutOfCloud,
  type CloudBackupState,
} from '@/src/cloud-backup';
import { useProfile } from '@/src/profile-context';
import { colors, radii, spacing } from '@/src/theme';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';

function readableDate(value: string | null): string {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
}

export default function CloudAccountScreen() {
  const router = useRouter();
  const { refresh } = useProfile();
  const [state, setState] = useState<CloudBackupState | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setState(await getCloudBackupState());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Cloud backup status could not be loaded.');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const run = async (operation: () => Promise<void>) => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await operation();
      await reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The cloud action could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  const createAccount = () => run(async () => {
    const session = await createCloudAccount(email, password);
    if (session) {
      const savedAt = await backupThisDevice();
      setMessage(`Account created and this device was backed up at ${readableDate(savedAt)}.`);
    } else {
      setMessage('Account created. Check your email to confirm it, then return here and sign in.');
    }
  });

  const signIn = () => run(async () => {
    await signInToCloud(email, password);
    setPassword('');
    setMessage('Signed in. You can now back up this device or restore an existing backup.');
  });

  const resetPassword = () => run(async () => {
    await sendCloudPasswordReset(email);
    setMessage('Password-reset instructions were sent if that email belongs to an account.');
  });

  const backUp = () => run(async () => {
    const savedAt = await backupThisDevice();
    setMessage(`Cloud backup completed at ${readableDate(savedAt)}.`);
  });

  const restore = () => {
    Alert.alert(
      'Restore cloud backup?',
      'This replaces Scripture Games data on this phone with the cloud copy. A local safety snapshot is kept before the restore.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore Backup',
          style: 'destructive',
          onPress: () => void run(async () => {
            const sourceTime = await restoreCloudBackup();
            await refresh();
            setMessage(`Cloud backup from ${readableDate(sourceTime)} was restored.`);
            router.replace('/');
          }),
        },
      ],
    );
  };

  const signOut = () => run(async () => {
    await signOutOfCloud();
    setPassword('');
    setMessage('Signed out of cloud backup. Local Scripture Games data remains on this phone.');
  });

  const removeAccount = () => {
    Alert.alert(
      'Delete cloud account?',
      'This permanently deletes the cloud account and its remote Scripture Games backup. Data already on this phone remains unless you erase it separately in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Cloud Account',
          style: 'destructive',
          onPress: () => void run(async () => {
            await deleteCloudAccount();
            setPassword('');
            setMessage('The cloud account and remote backup were deleted. Local data remains on this phone.');
          }),
        },
      ],
    );
  };

  const signedIn = Boolean(state?.session);

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-06']} darkness={0.7}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          back
          eyebrow="OPTIONAL ACCOUNT"
          title="Cloud Backup"
          subtitle="Keep playing offline. Sign in only when you want a secure backup or a restore on another device."
        />
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <GlassPanel strong style={styles.heroPanel}>
              <View style={styles.heroIcon}><Ionicons name="cloud-done" size={28} color={colors.brand} /></View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Guest play always stays available</Text>
                <Text style={styles.heroText}>The complete Bible and game continue working offline. Cloud backup stores player data, notes, bookmarks, highlights, settings, and progress—not the bundled Bible text.</Text>
              </View>
            </GlassPanel>

            {!cloudBackupConfigured ? (
              <GlassPanel style={styles.panel}>
                <Text style={styles.eyebrow}>NOT CONNECTED YET</Text>
                <Text style={styles.title}>Cloud backup code is ready, but production credentials are not installed.</Text>
                <Text style={styles.copy}>The app remains fully usable as a guest. This screen activates only after the production Supabase URL, anonymous key, database migration, and delete-account function are configured.</Text>
              </GlassPanel>
            ) : state === null ? (
              <GlassPanel style={styles.loadingPanel}>
                <ActivityIndicator size="large" color={colors.brand} />
                <Text style={styles.copy}>Checking cloud account…</Text>
              </GlassPanel>
            ) : !signedIn ? (
              <GlassPanel strong style={styles.panel}>
                <Text style={styles.eyebrow}>CREATE OR RESTORE</Text>
                <Text style={styles.title}>Use your own Scripture Games account.</Text>
                <Text style={styles.copy}>No social login is required. An account is optional and exists only to protect and restore your game and study data.</Text>
                <Text style={styles.label}>EMAIL</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="you@example.com"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  accessibilityLabel="Cloud account email"
                />
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  textContentType="password"
                  placeholder="At least 8 characters"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  accessibilityLabel="Cloud account password"
                />
                <View style={styles.actions}>
                  <TactileButton label={busy ? 'Working…' : 'Create Account & Back Up'} disabled={busy || !email.trim() || password.length < 8} onPress={createAccount} />
                  <TactileButton variant="glass" label="Sign In to Restore" disabled={busy || !email.trim() || !password} onPress={signIn} />
                  <TactileButton compact variant="stone" label="Email Password Reset" disabled={busy || !email.trim()} onPress={resetPassword} />
                </View>
              </GlassPanel>
            ) : (
              <>
                <GlassPanel strong style={styles.panel}>
                  <Text style={styles.eyebrow}>SIGNED IN</Text>
                  <Text style={styles.title}>{state.email || 'Scripture Games account'}</Text>
                  <View style={styles.statusRow}>
                    <StatusItem label="Cloud copy" value={readableDate(state.remoteUpdatedAt)} />
                    <StatusItem label="Last backup here" value={readableDate(state.lastBackupAt)} />
                    <StatusItem label="Last restore here" value={readableDate(state.lastRestoreAt)} />
                  </View>
                  <View style={styles.actions}>
                    <TactileButton label={busy ? 'Working…' : 'Back Up This Device'} disabled={busy} icon={<Ionicons name="cloud-upload" size={19} color={colors.onBrand} />} onPress={backUp} />
                    <TactileButton variant="glass" label="Restore Cloud Backup" disabled={busy || !state.remoteUpdatedAt} icon={<Ionicons name="cloud-download" size={19} color={colors.onSurface} />} onPress={restore} />
                    <TactileButton compact variant="stone" label="Sign Out of Cloud" disabled={busy} onPress={signOut} />
                  </View>
                </GlassPanel>

                <GlassPanel style={styles.dangerPanel}>
                  <Ionicons name="warning" size={22} color={colors.error} />
                  <View style={styles.dangerCopy}>
                    <Text style={styles.dangerTitle}>Cloud account control</Text>
                    <Text style={styles.copy}>Deleting the account removes the remote backup and authentication record. It does not silently erase local study notes or progress from this phone.</Text>
                    <TactileButton compact variant="danger" label="Delete Cloud Account" disabled={busy} onPress={removeAccount} />
                  </View>
                </GlassPanel>
              </>
            )}

            {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusItem}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  heroPanel: { borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  heroIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandTertiary, borderWidth: 1, borderColor: colors.borderStrong },
  heroCopy: { flex: 1 },
  heroTitle: { color: colors.onSurface, fontSize: 17, lineHeight: 22, fontWeight: '900' },
  heroText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: spacing.xs },
  panel: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  loadingPanel: { borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'center' },
  eyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.onSurface, fontSize: 22, lineHeight: 28, fontWeight: '900' },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  label: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  input: { height: 52, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(5,9,18,0.72)', color: colors.onSurface, paddingHorizontal: spacing.md, fontSize: 16, fontWeight: '700' },
  actions: { gap: spacing.sm },
  statusRow: { gap: spacing.sm },
  statusItem: { borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.05)', padding: spacing.md },
  statusLabel: { color: colors.brand, fontSize: 9.5, fontWeight: '900', letterSpacing: 1.1, textTransform: 'uppercase' },
  statusValue: { color: colors.onSurface, fontSize: 12, lineHeight: 17, fontWeight: '800', marginTop: 3 },
  dangerPanel: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', borderColor: 'rgba(224,106,104,0.35)' },
  dangerCopy: { flex: 1, gap: spacing.sm },
  dangerTitle: { color: colors.error, fontSize: 15, fontWeight: '900' },
  message: { color: colors.success, fontSize: 12, lineHeight: 18, fontWeight: '800', textAlign: 'center' },
  error: { color: colors.error, fontSize: 12, lineHeight: 18, fontWeight: '800', textAlign: 'center' },
});
