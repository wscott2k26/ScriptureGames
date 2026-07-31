import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme';

function GlassTabBackground() {
  return (
    <View style={styles.tabBackground}>
      <BlurView
        tint="systemUltraThinMaterialDark"
        intensity={76}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        blurReductionFactor={2}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient colors={['rgba(31,46,72,0.68)', 'rgba(6,12,25,0.88)']} style={StyleSheet.absoluteFill} />
      <View style={styles.tabHighlight} />
    </View>
  );
}

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  const TabIcon = ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <View style={[styles.iconShell, focused && styles.iconShellFocused]}>
      <Ionicons name={name} size={focused ? size + 1 : size} color={color} />
      {focused ? <View style={styles.activeDot} /> : null}
    </View>
  );
  TabIcon.displayName = `TabIcon(${name})`;
  return TabIcon;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandLight,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => <GlassTabBackground />,
        tabBarStyle: {
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 8,
          height: 74,
          paddingTop: 5,
          paddingBottom: 8,
          borderRadius: 26,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(255,226,153,0.38)',
          backgroundColor: 'transparent',
          overflow: 'hidden',
          shadowColor: '#000000',
          shadowOpacity: 0.48,
          shadowRadius: 23,
          shadowOffset: { width: 0, height: 11 },
          elevation: 18,
        },
        tabBarItemStyle: { borderRadius: 18, marginHorizontal: 1, overflow: 'hidden' },
        tabBarActiveBackgroundColor: 'rgba(233,188,98,0.10)',
        tabBarLabelStyle: { fontSize: 8.8, fontWeight: '900', letterSpacing: 0.16 },
      }}
    >
      <Tabs.Screen name="journey" options={{ title: 'Tournament', tabBarIcon: tabIcon('map') }} />
      <Tabs.Screen name="quiz" options={{ title: 'Training', tabBarIcon: tabIcon('game-controller') }} />
      <Tabs.Screen name="bible" options={{ title: 'Bible', tabBarIcon: tabIcon('book') }} />
      <Tabs.Screen name="companion" options={{ title: 'Companion', tabBarIcon: tabIcon('chatbubbles') }} />
      <Tabs.Screen name="command" options={{ title: 'Command', tabBarIcon: tabIcon('shield') }} />
      <Tabs.Screen name="stories" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBackground: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', borderRadius: 26 },
  tabHighlight: { position: 'absolute', left: 3, right: 3, top: 2, height: 1, backgroundColor: 'rgba(255,255,255,0.38)' },
  iconShell: { minWidth: 38, height: 31, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  iconShellFocused: { backgroundColor: 'rgba(233,188,98,0.10)' },
  activeDot: { position: 'absolute', bottom: -1, width: 4, height: 4, borderRadius: 99, backgroundColor: colors.brand },
});
