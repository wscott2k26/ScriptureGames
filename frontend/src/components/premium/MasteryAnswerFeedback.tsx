import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useMotionIntensity } from '@/src/hooks/use-motion-intensity';
import { colors } from '@/src/theme';

type Props = {
  state: 'idle' | 'selected' | 'correct' | 'wrong';
  children: ReactNode;
};

export function MasteryAnswerFeedback({ state, children }: Props) {
  const intensity = useMotionIntensity();
  const pulse = useSharedValue(0);
  const shake = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    pulse.value = 0;
    shake.value = 0;
    glow.value = 0;
    if (intensity === 'off') return;

    if (state === 'correct') {
      const lift = intensity === 'full' ? 1 : 0.55;
      pulse.value = withSequence(
        withTiming(lift, { duration: intensity === 'full' ? 150 : 110, easing: Easing.out(Easing.cubic) }),
        withSpring(0, { damping: 14, stiffness: 180 }),
      );
      glow.value = withSequence(
        withTiming(1, { duration: 120 }),
        withDelay(intensity === 'full' ? 240 : 100, withTiming(0, { duration: 360 })),
      );
    } else if (state === 'wrong') {
      const amount = intensity === 'full' ? 1 : 0.45;
      shake.value = withSequence(
        withTiming(-amount, { duration: 55 }),
        withTiming(amount, { duration: 70 }),
        withTiming(-amount * 0.65, { duration: 60 }),
        withTiming(0, { duration: 80 }),
      );
      glow.value = withSequence(withTiming(0.65, { duration: 100 }), withTiming(0, { duration: 300 }));
    } else if (state === 'selected') {
      glow.value = withTiming(intensity === 'full' ? 0.24 : 0.12, { duration: 150 });
    }
  }, [glow, intensity, pulse, shake, state]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value * (intensity === 'full' ? 8 : 4) },
      { translateY: -pulse.value * (intensity === 'full' ? 4 : 2) },
      { scale: 1 + pulse.value * (intensity === 'full' ? 0.035 : 0.018) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: interpolate(glow.value, [0, 1], [0.98, 1.035]) }],
  }));

  const glowColor = state === 'wrong' ? colors.coral : state === 'correct' ? colors.success : colors.brand;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { borderColor: glowColor, shadowColor: glowColor }, glowStyle]}
      />
      {state === 'correct' && intensity === 'full' ? (
        <View pointerEvents="none" style={styles.sparkleRow}>
          <View style={[styles.sparkle, styles.sparkleOne, { backgroundColor: glowColor }]} />
          <View style={[styles.sparkle, styles.sparkleTwo, { backgroundColor: colors.brandLight }]} />
          <View style={[styles.sparkle, styles.sparkleThree, { backgroundColor: glowColor }]} />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', borderRadius: 20 },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 2,
    shadowOpacity: 0.58,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  sparkleRow: { ...StyleSheet.absoluteFillObject },
  sparkle: { position: 'absolute', width: 5, height: 5, borderRadius: 99, shadowColor: '#FFFFFF', shadowOpacity: 0.75, shadowRadius: 7 },
  sparkleOne: { right: 18, top: 9 },
  sparkleTwo: { right: 39, top: -2, width: 4, height: 4 },
  sparkleThree: { right: 7, top: 31, width: 3, height: 3 },
});
