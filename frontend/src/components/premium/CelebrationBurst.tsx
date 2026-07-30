import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const DEFAULT_COLORS = ['#E8B957', '#7BC5D7', '#F6F1E6', '#F0835A', '#FFFFFF'];

type ParticleSpec = {
  id: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  fall: number;
  rotation: number;
  size: number;
  startOffset: number;
  shape: 'circle' | 'bar';
};

type ParticleProps = {
  spec: ParticleSpec;
  originX: number;
};

const Particle = memo(function Particle({ spec, originX }: ParticleProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      spec.delay,
      withTiming(1, {
        duration: spec.duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [progress, spec.delay, spec.duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const firstLift = interpolate(progress.value, [0, 0.2, 1], [0, -54, spec.fall]);
    return {
      opacity: interpolate(progress.value, [0, 0.08, 0.78, 1], [0, 1, 1, 0]),
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [0, spec.drift]) },
        { translateY: firstLift },
        { rotate: `${interpolate(progress.value, [0, 1], [0, spec.rotation])}deg` },
        { scale: interpolate(progress.value, [0, 0.12, 1], [0.3, 1, 0.72]) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: originX + spec.startOffset,
          width: spec.shape === 'bar' ? spec.size * 0.55 : spec.size,
          height: spec.shape === 'bar' ? spec.size * 1.65 : spec.size,
          borderRadius: spec.shape === 'circle' ? spec.size : Math.max(2, spec.size * 0.18),
          backgroundColor: spec.color,
        },
        animatedStyle,
      ]}
    />
  );
});

type CelebrationBurstProps = {
  colors?: readonly string[];
  intensity?: 'standard' | 'champion';
  testID?: string;
};

function pseudoRandom(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function CelebrationBurst({
  colors = DEFAULT_COLORS,
  intensity = 'standard',
  testID = 'celebration-burst',
}: CelebrationBurstProps) {
  const { width, height } = useWindowDimensions();
  const count = intensity === 'champion' ? 72 : 46;
  const originX = width / 2;

  const particles = useMemo<ParticleSpec[]>(() => {
    const palette = colors.length ? colors : DEFAULT_COLORS;
    return Array.from({ length: count }, (_, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const spread = 70 + pseudoRandom(index, 1) * Math.max(100, width * 0.44);
      return {
        id: index,
        color: palette[index % palette.length],
        delay: Math.round(pseudoRandom(index, 2) * 260),
        duration: Math.round(1900 + pseudoRandom(index, 3) * 1050),
        drift: direction * spread,
        fall: Math.max(420, height * (0.62 + pseudoRandom(index, 4) * 0.35)),
        rotation: direction * (220 + pseudoRandom(index, 5) * 720),
        size: 7 + pseudoRandom(index, 6) * 7,
        startOffset: (pseudoRandom(index, 7) - 0.5) * 54,
        shape: index % 3 === 0 ? 'circle' : 'bar',
      };
    });
  }, [colors, count, height, width]);

  return (
    <View
      testID={testID}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {particles.map((spec) => <Particle key={spec.id} spec={spec} originX={originX} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: -18,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
