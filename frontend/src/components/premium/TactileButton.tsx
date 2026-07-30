import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { sfx } from '@/src/sfx';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';
import { colors, motion, shadow } from '@/src/theme';
import { GlassPanel } from './GlassPanel';
import { MaterialSurface, type MaterialKind } from './MaterialSurface';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'gold' | 'glass' | 'stone' | 'bronze' | 'sandstone' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  compact?: boolean;
};

export function TactileButton({
  label,
  onPress,
  icon,
  variant = 'gold',
  disabled = false,
  style,
  testID,
  accessibilityLabel,
  compact = false,
}: Props) {
  const reducedMotion = useReducedMotionPreference();
  const pressed = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion || variant !== 'gold') {
      shimmer.value = 0;
      return;
    }
    shimmer.value = withRepeat(
      withSequence(
        withDelay(2300, withTiming(1, { duration: 850, easing: Easing.inOut(Easing.quad) })),
        withTiming(0, { duration: 1 }),
      ),
      -1,
      false,
    );
  }, [reducedMotion, shimmer, variant]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: reducedMotion
      ? []
      : [
          { perspective: 800 },
          { translateY: pressed.value * 5 },
          { scaleX: 1 - pressed.value * 0.018 },
          { scaleY: 1 - pressed.value * 0.045 },
          { rotateX: `${pressed.value * 1.2}deg` },
        ],
  }));

  const depthStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressed.value, [0, 1], [1, 0.28]),
    transform: [{ translateY: interpolate(pressed.value, [0, 1], [0, -3]) }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 0 : interpolate(shimmer.value, [0, 0.12, 0.88, 1], [0, 0.6, 0.6, 0]),
    transform: [{ translateX: -210 + shimmer.value * 520 }, { rotate: '-18deg' }],
  }));

  const faceStyle = [styles.face, compact && styles.compactFace];
  const labelStyle = [styles.label, variant === 'gold' && styles.darkLabel, variant === 'sandstone' && styles.darkLabel];

  const faceContent = (
    <>
      {icon}
      <Text style={labelStyle}>{label}</Text>
      {variant === 'gold' ? <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]} /> : null}
    </>
  );

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={() => {
        pressed.value = reducedMotion ? 0 : withSpring(1, motion.spring);
        sfx.press();
      }}
      onPressOut={() => {
        pressed.value = reducedMotion ? 0 : withSpring(0, motion.spring);
      }}
      onPress={onPress}
      style={[styles.outer, compact && styles.compactOuter, disabled && styles.disabled, animatedStyle, style]}
    >
      <Animated.View pointerEvents="none" style={[styles.depth, compact && styles.compactDepth, variant === 'gold' && styles.goldDepth, depthStyle]} />
      {variant === 'glass' ? (
        <GlassPanel variant="crystal" style={faceStyle}>{faceContent}</GlassPanel>
      ) : (
        <MaterialSurface material={variant as MaterialKind} style={faceStyle}>{faceContent}</MaterialSurface>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    minHeight: 60,
    borderRadius: 19,
    position: 'relative',
    ...shadow.button,
  },
  compactOuter: { minHeight: 47, borderRadius: 15 },
  depth: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 7,
    bottom: -7,
    borderRadius: 19,
    backgroundColor: '#02050B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  compactDepth: { borderRadius: 15, top: 5, bottom: -5 },
  goldDepth: { backgroundColor: '#5A330C', borderColor: 'rgba(249,214,133,0.18)' },
  face: {
    minHeight: 60,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  compactFace: { minHeight: 47, borderRadius: 15, paddingHorizontal: 14 },
  label: { color: colors.onSurface, fontSize: 16.5, fontWeight: '900', letterSpacing: 0.25, textAlign: 'center' },
  darkLabel: { color: colors.onBrand, textShadowColor: 'rgba(255,255,255,0.16)', textShadowRadius: 1 },
  shimmer: {
    position: 'absolute',
    top: -28,
    bottom: -28,
    width: 38,
    backgroundColor: 'rgba(255,255,255,0.48)',
  },
  disabled: { opacity: 0.42, shadowOpacity: 0 },
});
