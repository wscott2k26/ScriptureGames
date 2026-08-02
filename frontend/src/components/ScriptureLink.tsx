import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { parseBibleReference } from '@/src/bible-library';
import { sfx } from '@/src/sfx';
import { colors, radii, spacing } from '@/src/theme';

export type ScriptureLinkProps = {
  reference: string;
  label?: string;
  prefix?: string;
  returnLabel?: string;
  compact?: boolean;
  tone?: 'brand' | 'muted' | 'light';
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

const toneColor: Record<NonNullable<ScriptureLinkProps['tone']>, string> = {
  brand: colors.brandSecondary,
  muted: colors.muted,
  light: colors.parchment,
};

export function ScriptureLink({
  reference,
  label,
  prefix,
  returnLabel = 'Return',
  compact = false,
  tone = 'brand',
  testID,
  style,
}: ScriptureLinkProps) {
  const router = useRouter();
  const valid = Boolean(parseBibleReference(reference));
  const text = [prefix, label || reference].filter(Boolean).join(' ');
  const color = toneColor[tone];

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Open ${reference} in Bible`}
      accessibilityHint={valid
        ? 'Opens the exact passage and keeps this screen available to return to.'
        : 'Opens the Bible reader, which will explain if the reference cannot be resolved.'}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      testID={testID}
      onPress={() => {
        sfx.tap();
        router.navigate({
          pathname: '/(tabs)/bible',
          params: { reference, fromScriptureLink: '1', returnLabel },
        });
      }}
      style={({ pressed }) => [
        styles.target,
        compact && styles.compact,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View pointerEvents="none" style={styles.row}>
        <Ionicons name="book-outline" size={compact ? 14 : 16} color={color} />
        <Text numberOfLines={compact ? 1 : undefined} style={[styles.text, compact && styles.compactText, { color }]}>
          {text}
        </Text>
        <Ionicons name="open-outline" size={compact ? 12 : 14} color={color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    alignSelf: 'flex-start',
    minHeight: 44,
    minWidth: 44,
    borderRadius: radii.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginHorizontal: -spacing.sm,
  },
  compact: {
    minHeight: 44,
    maxWidth: '100%',
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    flexShrink: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  compactText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  pressed: {
    backgroundColor: 'rgba(121,210,228,0.14)',
    opacity: 0.82,
  },
});
