import type { ReactNode } from 'react';
import { Image, Platform, StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, glass, shadow } from '@/src/theme';
import { useReducedTransparencyPreference } from '@/src/hooks/use-reduced-transparency';

export type GlassVariant = 'soft' | 'panel' | 'strong' | 'navigation' | 'crystal';

const CAUSTICS = require('../../../assets/textures/glass-caustics.png');

const INTENSITY: Record<GlassVariant, number> = {
  soft: glass.soft,
  panel: glass.panel,
  strong: glass.strong,
  navigation: glass.navigation,
  crystal: 58,
};

const GRADIENTS = {
  soft: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.035)', 'rgba(5,10,22,0.28)'] as const,
  panel: ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.045)', 'rgba(5,10,22,0.42)'] as const,
  strong: ['rgba(30,42,67,0.72)', 'rgba(9,16,31,0.72)', 'rgba(3,7,16,0.82)'] as const,
  navigation: ['rgba(22,34,56,0.78)', 'rgba(6,12,25,0.78)', 'rgba(3,7,16,0.88)'] as const,
  crystal: ['rgba(189,236,255,0.18)', 'rgba(255,255,255,0.055)', 'rgba(5,10,22,0.52)'] as const,
};

export function GlassPanel({
  children,
  style,
  strong = false,
  variant,
  intensity,
  testID,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
  variant?: GlassVariant;
  intensity?: number;
  testID?: string;
}) {
  const reduceTransparency = useReducedTransparencyPreference();
  const resolvedVariant = variant ?? (strong ? 'strong' : 'panel');
  const blurIntensity = intensity ?? INTENSITY[resolvedVariant];
  const isStrong = resolvedVariant === 'strong' || resolvedVariant === 'navigation';

  return (
    <View
      testID={testID}
      style={[
        styles.shell,
        isStrong && styles.strongShell,
        resolvedVariant === 'crystal' && styles.crystalShell,
        style,
      ]}
    >
      {reduceTransparency ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, isStrong ? styles.opaqueStrong : styles.opaqueSoft]} />
      ) : (
        <BlurView
          pointerEvents="none"
          tint="systemUltraThinMaterialDark"
          intensity={blurIntensity}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          blurReductionFactor={2}
          style={StyleSheet.absoluteFill}
        />
      )}
      <LinearGradient
        pointerEvents="none"
        colors={GRADIENTS[resolvedVariant]}
        locations={[0, 0.52, 1]}
        start={{ x: 0.04, y: 0 }}
        end={{ x: 0.96, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Image source={CAUSTICS} resizeMode="cover" style={styles.caustics} />
      <View pointerEvents="none" style={styles.topHighlight} />
      <View pointerEvents="none" style={styles.leftHighlight} />
      <View pointerEvents="none" style={styles.bottomShade} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(5,10,22,0.30)',
    ...shadow.card,
  },
  strongShell: {
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(5,10,22,0.58)',
  },
  crystalShell: {
    borderColor: 'rgba(169,230,255,0.38)',
    shadowColor: colors.brandSecondary,
    shadowOpacity: 0.17,
  },
  opaqueSoft: { backgroundColor: 'rgba(15,23,39,0.96)' },
  opaqueStrong: { backgroundColor: 'rgba(8,14,27,0.985)' },
  caustics: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    opacity: 0.58,
  },
  topHighlight: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 1,
    height: 1,
    backgroundColor: colors.glassEdge,
  },
  leftHighlight: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 1,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.17)',
  },
  bottomShade: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.44)',
  },
});
