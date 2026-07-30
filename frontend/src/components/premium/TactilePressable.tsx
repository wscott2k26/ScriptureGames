import type { ComponentProps } from 'react';
import { Pressable as NativePressable, type PressableStateCallbackType, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion } from '@/src/theme';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

const AnimatedPressable = Animated.createAnimatedComponent(NativePressable);
type NativeProps = ComponentProps<typeof NativePressable>;

type Props = Omit<NativeProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  pressScale?: number;
  pressDepth?: number;
};

export function TactilePressable({
  style,
  pressScale = 0.976,
  pressDepth = 3,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: Props) {
  const reducedMotion = useReducedMotionPreference();
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: reducedMotion
      ? []
      : [
          { translateY: pressed.value * pressDepth },
          { scale: 1 - pressed.value * (1 - pressScale) },
        ],
  }));

  const resolveStyle = (state: PressableStateCallbackType) => [
    typeof style === 'function' ? style(state) : style,
    animatedStyle,
  ] as StyleProp<ViewStyle>;

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        pressed.value = reducedMotion ? 0 : withSpring(1, motion.spring);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = reducedMotion ? 0 : withSpring(0, motion.spring);
        onPressOut?.(event);
      }}
      style={resolveStyle as NativeProps['style']}
    />
  );
}
