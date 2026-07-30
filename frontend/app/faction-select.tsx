import {
  useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sfx } from '@/src/sfx';

import { useProfile } from '@/src/profile-context';
import { colors } from '@/src/theme';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { FACTIONS, GENESIS_BACKGROUNDS, type FactionId } from '@/src/genesis-season';
import { selectFaction } from '@/src/season-progress';

export default function FactionSelect() {
  const router = useRouter();
  const { profile } = useProfile();
  const [selected, setSelected] = useState<FactionId>('lionguard');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!profile || saving) return;
    setSaving(true);
    await selectFaction(profile.id, selected);
    sfx.win();
    router.replace('/(tabs)/journey');
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS.opening} darkness={0.35}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerMark}><Text style={styles.headerMarkText}>✦</Text></View>
          <Text style={styles.eyebrow}>GENESIS TOURNAMENT</Text>
          <Text style={styles.title}>Declare your faction.</Text>
          <Text style={styles.copy}>Your faction gives your challenger an identity and accent color. It never changes Scripture, difficulty, or access.</Text>
          <View style={styles.list}>
            {FACTIONS.map((item) => {
              const active = selected === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${item.name}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setSelected(item.id);
                    sfx.tap();
                  }}
                >
                  <GlassPanel strong={active} style={[styles.card, active && { borderColor: item.accent }]}>
                    <View style={[styles.iconWrap, { borderColor: item.accent, backgroundColor: item.softAccent }]}>
                      <Text style={styles.icon}>{item.icon}</Text>
                    </View>
                    <View style={styles.cardCopy}>
                      <Text style={[styles.name, active && { color: item.accent }]}>{item.name}</Text>
                      <Text style={styles.motto}>{item.motto}</Text>
                      <Text style={styles.description}>{item.description}</Text>
                    </View>
                    <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={27} color={active ? item.accent : colors.muted} />
                  </GlassPanel>
                </Pressable>
              );
            })}
          </View>
          <TactileButton label={saving ? 'Sealing Declaration…' : 'Enter the Genesis Arena'} disabled={saving} onPress={() => void save()} />
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: 22, paddingBottom: 38, justifyContent: 'center', gap: 15, maxWidth: 650, width: '100%', alignSelf: 'center' },
  headerMark: { width: 58, height: 58, borderRadius: 20, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandTertiary, borderWidth: 1, borderColor: colors.borderStrong },
  headerMarkText: { color: colors.brand, fontSize: 31 },
  eyebrow: { color: colors.brand, fontSize: 10, letterSpacing: 1.6, fontWeight: '900', textAlign: 'center' },
  title: { color: colors.onSurface, fontSize: 33, fontWeight: '900', textAlign: 'center' },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 4 },
  list: { gap: 11, marginBottom: 5 },
  card: { borderRadius: 23, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13 },
  iconWrap: { width: 58, height: 58, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 29 },
  cardCopy: { flex: 1 },
  name: { color: colors.onSurface, fontSize: 18, fontWeight: '900' },
  motto: { color: colors.parchment, fontSize: 12, fontWeight: '800', marginTop: 2 },
  description: { color: colors.muted, fontSize: 11.5, lineHeight: 16, marginTop: 4 },
});
