import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme';

export function DoveMark({ size = 34, label }: { size?: number; label?: string }) {
  return (
    <View
      accessible={Boolean(label)}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
      style={[styles.shell, { width: size, height: size, borderRadius: size * 0.34 }]}
    >
      <Text style={[styles.dove, { fontSize: size * 0.63, lineHeight: size * 0.78 }]}>🕊️</Text>
      <View style={styles.glow} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,226,153,0.42)',
    backgroundColor: 'rgba(232,185,87,0.10)',
    overflow: 'hidden',
  },
  dove: { zIndex: 1, textAlign: 'center' },
  glow: {
    position: 'absolute',
    width: '72%',
    height: '72%',
    borderRadius: 999,
    backgroundColor: colors.brand,
    opacity: 0.08,
  },
});
