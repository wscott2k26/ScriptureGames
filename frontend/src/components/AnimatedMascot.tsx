import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

type Props = {
  size?: number;
  emoji?: string;
  glow?: boolean;
};

export function AnimatedMascot({ size = 96, emoji = '🕊️', glow = true }: Props) {
  const reducedMotion = useReducedMotionPreference();
  const y = useSharedValue(0);
  const rot = useSharedValue(0);
  const scale = useSharedValue(1);
  const glowOp = useSharedValue(0.4);

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(y);
      cancelAnimation(rot);
      cancelAnimation(scale);
      cancelAnimation(glowOp);
      y.value = 0;
      rot.value = 0;
      scale.value = 1;
      glowOp.value = 0.35;
      return;
    }

    y.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    rot.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(6, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    glowOp.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [glowOp, reducedMotion, rot, scale, y]);

  const styleAnim = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { rotateZ: `${rot.value}deg` },
      { scale: scale.value },
    ],
  }));

  const styleGlow = useAnimatedStyle(() => ({ opacity: glowOp.value }));

  return (
    <View style={[styles.wrap, { width: size * 1.4, height: size * 1.4 }]}>
      {glow ? (
        <Animated.View
          style={[
            styles.glow,
            {
              width: size * 1.3,
              height: size * 1.3,
              borderRadius: size,
            },
            styleGlow,
          ]}
        />
      ) : null}
      <Animated.View style={styleAnim}>
        <Text style={{ fontSize: size, lineHeight: size * 1.1 }}>{emoji}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'center' },
  glow: {
    position: 'absolute',
    backgroundColor: '#FFD980',
    shadowColor: '#FFD980',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});
