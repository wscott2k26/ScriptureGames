import { useEffect, type ReactNode } from 'react';
import { ImageBackground, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';
import { PeacefulBackdrop } from '@/src/components/premium/PeacefulBackdrop';
import { colors, motion } from '@/src/theme';

const DUST = [
  [7, 13, 2, 0.5], [15, 32, 1, 0.35], [24, 18, 2, 0.65], [33, 44, 1, 0.4], [42, 9, 1, 0.38], [53, 24, 2, 0.58],
  [62, 40, 1, 0.34], [72, 14, 2, 0.6], [82, 35, 1, 0.42], [91, 21, 2, 0.56], [11, 61, 1, 0.36], [28, 70, 2, 0.62],
  [47, 58, 1, 0.38], [67, 75, 2, 0.56], [86, 64, 1, 0.36], [18, 88, 2, 0.55], [39, 92, 1, 0.36], [76, 89, 2, 0.62],
  [94, 78, 1, 0.32], [57, 91, 1, 0.35], [5, 77, 1, 0.28], [49, 37, 1, 0.38],
] as const;

type CinematicBackdropProps = {
  source: ImageSourcePropType;
  children: ReactNode;
  darkness?: number;
  accent?: string;
  testID?: string;
  preserveSource?: boolean;
};

export function CinematicBackdrop({
  source,
  children,
  darkness = 0.38,
  accent = colors.brand,
  testID,
  preserveSource = false,
}: CinematicBackdropProps) {
  const reduced = useReducedMotionPreference();
  const drift = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      drift.value = 0.5;
      breathe.value = 0.5;
      return;
    }
    drift.value = withRepeat(withTiming(1, { duration: motion.ambient, easing: Easing.inOut(Easing.sin) }), -1, true);
    breathe.value = withRepeat(withTiming(1, { duration: 7200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [breathe, drift, reduced]);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: reduced ? 1.055 : 1.045 + drift.value * 0.045 },
      { translateX: reduced ? 0 : -10 + drift.value * 20 },
      { translateY: reduced ? 0 : -7 + drift.value * 14 },
    ],
  }));

  const dustStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: reduced ? 0 : 16 - drift.value * 32 }, { translateX: reduced ? 0 : -5 + breathe.value * 10 }],
    opacity: reduced ? 0.38 : 0.26 + drift.value * 0.34,
  }));

  const lightStyle = useAnimatedStyle(() => ({
    opacity: reduced ? 0.13 : 0.09 + breathe.value * 0.12,
    transform: [
      { translateX: reduced ? 0 : -35 + breathe.value * 70 },
      { rotate: '-16deg' },
      { scale: reduced ? 1 : 0.96 + breathe.value * 0.08 },
    ],
  }));

  const orbOne = useAnimatedStyle(() => ({
    opacity: reduced ? 0.1 : interpolate(breathe.value, [0, 1], [0.07, 0.18]),
    transform: [{ translateX: reduced ? 0 : -18 + breathe.value * 36 }, { scale: reduced ? 1 : 0.9 + breathe.value * 0.22 }],
  }));

  return (
    <View testID={testID} style={styles.root}>
      {preserveSource ? (
        <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
          <ImageBackground source={source} style={styles.image} resizeMode="cover" />
        </Animated.View>
      ) : (
        <PeacefulBackdrop darkness={0} style={StyleSheet.absoluteFill}>
          <View />
        </PeacefulBackdrop>
      )}

      <LinearGradient
        colors={[`rgba(2,5,13,${Math.min(0.96, darkness + 0.12)})`, `rgba(5,10,22,${Math.max(0.08, darkness - 0.16)})`, 'rgba(3,7,16,0.92)']}
        locations={[0, 0.46, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View pointerEvents="none" style={[styles.orb, styles.orbTop, { backgroundColor: accent }, orbOne]} />
      <Animated.View pointerEvents="none" style={[styles.orb, styles.orbBottom, { backgroundColor: colors.brandSecondary }, orbOne]} />

      <Animated.View pointerEvents="none" style={[styles.lightSweep, lightStyle]}>
        <LinearGradient colors={['transparent', 'rgba(255,238,188,0.42)', 'transparent']} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, dustStyle]}>
        {DUST.map(([left, top, size, opacity], index) => (
          <View
            key={index}
            style={[
              styles.dust,
              { left: `${left}%`, top: `${top}%`, width: size, height: size, borderRadius: size, opacity },
            ]}
          />
        ))}
      </Animated.View>

      <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0.34)', 'transparent', 'rgba(0,0,0,0.58)']} locations={[0, 0.48, 1]} style={styles.vignette} />

      <Animated.View entering={reduced ? undefined : FadeIn.duration(motion.cinematic)} style={styles.content}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', backgroundColor: colors.surface },
  image: { flex: 1 },
  content: { flex: 1 },
  dust: {
    position: 'absolute',
    backgroundColor: 'rgba(255,226,160,0.92)',
    shadowColor: '#F4C66A',
    shadowOpacity: 0.72,
    shadowRadius: 5,
  },
  lightSweep: {
    position: 'absolute',
    top: '-18%',
    bottom: '-18%',
    left: '18%',
    width: 160,
  },
  orb: {
    position: 'absolute',
    width: 330,
    height: 330,
    borderRadius: 999,
    opacity: 0.12,
  },
  orbTop: { right: -180, top: -160 },
  orbBottom: { left: -210, bottom: -210 },
  vignette: { ...StyleSheet.absoluteFillObject },
});
