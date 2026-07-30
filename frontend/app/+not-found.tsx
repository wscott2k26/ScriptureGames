import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { colors, radii, spacing } from '@/src/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.68}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <GlassPanel strong style={styles.card}>
            <Text style={styles.icon}>🧭</Text>
            <Text style={styles.eyebrow}>PATH NOT FOUND</Text>
            <Text style={styles.title}>This trail is not on the map.</Text>
            <Text style={styles.copy}>The requested Scripture Games screen does not exist or is no longer available.</Text>
            <TactileButton label="Return to Tournament" onPress={() => router.replace('/(tabs)/journey')} />
          </GlassPanel>
        </View>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  card: { borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'center' },
  icon: { fontSize: 64 },
  eyebrow: { color: colors.brand, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.onSurface, fontSize: 27, lineHeight: 33, fontWeight: '900', textAlign: 'center' },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
