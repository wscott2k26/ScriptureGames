import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { TactilePressable } from '@/src/components/premium/TactilePressable';
import { passageLocationFromReference } from '@/src/quiz-ordering';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';

type Props = {
  reference: string;
  label?: string;
  testID?: string;
};

export function ScriptureReferenceLink({ reference, label, testID }: Props) {
  const router = useRouter();
  const location = passageLocationFromReference(reference);

  if (!location) {
    return <Text style={styles.fallback}>{reference}</Text>;
  }

  return (
    <TactilePressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Open ${reference} in the Bible reader`}
      onPress={() => {
        sfx.tap();
        router.push({
          pathname: '/passage-reader',
          params: {
            bookId: location.bookId,
            chapter: String(location.chapter),
            ...(location.verse ? { verse: String(location.verse) } : {}),
          },
        });
      }}
      style={styles.link}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="book" size={15} color={colors.brand} />
      </View>
      <Text style={styles.text}>{label || `Open Scripture · ${reference}`}</Text>
      <Ionicons name="chevron-forward" size={15} color={colors.brandSecondary} />
    </TactilePressable>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: spacing.sm,
    minHeight: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(232,185,87,0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,185,87,0.12)',
  },
  text: { flex: 1, color: colors.brandSecondary, fontSize: 11.5, lineHeight: 16, fontWeight: '900' },
  fallback: { color: colors.brandSecondary, fontSize: 11.5, lineHeight: 16, fontWeight: '800', marginTop: spacing.sm },
});
