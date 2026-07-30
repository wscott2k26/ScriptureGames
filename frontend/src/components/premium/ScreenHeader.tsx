import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, motion, spacing } from '@/src/theme';
import { GlassPanel } from './GlassPanel';
import { TactilePressable } from './TactilePressable';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  back = false,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotionPreference();
  return (
    <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(motion.standard)} style={styles.row}>
      {back ? (
        <TactilePressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} pressScale={0.94} pressDepth={2}>
          <GlassPanel variant="crystal" style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </GlassPanel>
        </TactilePressable>
      ) : null}
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.titleRule}><View style={styles.titleRuleGlow} /></View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  backButton: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  eyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.7, marginBottom: 2 },
  title: { color: colors.onSurface, fontSize: 27, lineHeight: 32, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.52)', textShadowRadius: 8 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  titleRule: { width: 72, height: 2, backgroundColor: 'rgba(233,188,98,0.25)', borderRadius: 99, marginTop: 9, overflow: 'hidden' },
  titleRuleGlow: { width: 35, height: 2, backgroundColor: colors.brand, borderRadius: 99 },
  right: { alignItems: 'flex-end', justifyContent: 'center' },
});
