import { type Href, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TactilePressable } from '@/src/components/premium/TactilePressable';
import { colors } from '@/src/theme';

const NAV_ITEMS: {
  key: 'home' | 'journey' | 'games' | 'bible' | 'lumi' | 'settings';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
  matches: string[];
}[] = [
  { key: 'home', label: 'Home', icon: 'home', href: '/(tabs)/command', matches: ['/command', '/leaderboard', '/achievements', '/family', '/premium'] },
  { key: 'journey', label: 'Journey', icon: 'map', href: '/(tabs)/journey', matches: ['/journey', '/genesis-trial', '/season-victory'] },
  { key: 'games', label: 'Games', icon: 'game-controller', href: '/(tabs)/quiz', matches: ['/quiz', '/quiz-play', '/puzzle', '/daily-challenge', '/story'] },
  { key: 'bible', label: 'Bible', icon: 'book', href: '/(tabs)/bible', matches: ['/bible', '/verse', '/devotional'] },
  { key: 'lumi', label: 'Lumi', icon: 'chatbubbles', href: '/(tabs)/companion', matches: ['/companion', '/faith-journeys', '/faith-journey', '/prayer-garden'] },
  { key: 'settings', label: 'Settings', icon: 'settings', href: '/(tabs)/preferences', matches: ['/preferences', '/settings', '/cloud-account'] },
];

function isSectionActive(pathname: string, matches: string[]) {
  return matches.some((match) => pathname === match || pathname.startsWith(`${match}/`));
}

export const GLOBAL_DOCK_HEIGHT = 74;

export function GlobalNavigationDock() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={[styles.dock, { bottom: Math.max(insets.bottom, 7) }]}>
        <BlurView
          tint="systemUltraThinMaterialDark"
          intensity={80}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          blurReductionFactor={2}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient colors={['rgba(34,49,76,0.94)', 'rgba(5,10,21,0.97)']} style={StyleSheet.absoluteFill} />
        <View style={styles.highlight} />
        {NAV_ITEMS.map((item) => {
          const active = isSectionActive(pathname, item.matches);
          return (
            <TactilePressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={() => router.navigate(item.href)}
              pressScale={0.96}
              pressDepth={1}
              style={[styles.item, active && styles.itemActive]}
            >
              <Ionicons name={item.icon} size={active ? 22 : 20} color={active ? colors.brandLight : colors.muted} />
              <Text numberOfLines={1} style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
              {active ? <View style={styles.activeDot} /> : null}
            </TactilePressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000 },
  dock: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: GLOBAL_DOCK_HEIGHT,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,226,153,0.38)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 3,
    paddingVertical: 5,
    shadowColor: '#000000',
    shadowOpacity: 0.52,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 20,
  },
  highlight: { position: 'absolute', left: 4, right: 4, top: 2, height: 1, backgroundColor: 'rgba(255,255,255,0.36)' },
  item: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  itemActive: { backgroundColor: 'rgba(233,188,98,0.12)' },
  label: { color: colors.muted, fontSize: 7.6, fontWeight: '900', letterSpacing: 0.05 },
  labelActive: { color: colors.brandLight },
  activeDot: { width: 4, height: 4, borderRadius: 99, backgroundColor: colors.brand, marginTop: 1 },
});
