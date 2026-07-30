import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme';

export type MaterialKind = 'gold' | 'bronze' | 'stone' | 'sandstone' | 'danger';

const TEXTURES: Record<MaterialKind, ImageSourcePropType> = {
  gold: require('../../../assets/textures/polished-gold.png'),
  bronze: require('../../../assets/textures/aged-bronze.png'),
  stone: require('../../../assets/textures/obsidian-stone.png'),
  sandstone: require('../../../assets/textures/carved-sandstone.png'),
  danger: require('../../../assets/textures/obsidian-stone.png'),
};

const GRADIENTS = {
  gold: ['#FFE9A8', '#D9A544', '#8C5516'] as const,
  bronze: ['#D69B59', '#9A5D29', '#45250F'] as const,
  stone: ['#697386', '#313947', '#111723'] as const,
  sandstone: ['#DCB77D', '#9E6A3C', '#50311D'] as const,
  danger: ['#E17670', '#9B4243', '#461923'] as const,
};

export function MaterialSurface({
  children,
  material,
  style,
  selected = false,
}: {
  children?: ReactNode;
  material: MaterialKind;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
}) {
  return (
    <View style={[styles.shell, selected && styles.selected, style]}>
      <LinearGradient colors={GRADIENTS[material]} start={{ x: 0.08, y: 0 }} end={{ x: 0.92, y: 1 }} style={StyleSheet.absoluteFill} />
      <Image source={TEXTURES[material]} resizeMode="repeat" style={styles.texture} />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.03)', 'rgba(0,0,0,0.30)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.topBevel} />
      <View pointerEvents="none" style={styles.bottomBevel} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,236,188,0.44)',
    backgroundColor: colors.obsidian,
  },
  selected: {
    borderColor: colors.brandLight,
    shadowColor: colors.brand,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    opacity: 0.72,
  },
  topBevel: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 2,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.64)',
  },
  bottomBevel: {
    position: 'absolute',
    left: 3,
    right: 3,
    bottom: 2,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
});
