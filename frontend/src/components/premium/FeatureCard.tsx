import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '@/src/theme';
import { GlassPanel } from './GlassPanel';
import { MaterialSurface } from './MaterialSurface';
import { TactilePressable } from './TactilePressable';
import { sfx } from '@/src/sfx';


export function FeatureCard({
  title,
  description,
  icon,
  accent = colors.brand,
  onPress,
  badge,
  style,
  disabled = false,
  testID,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  accent?: string;
  onPress: () => void;
  badge?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <TactilePressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={() => { sfx.press(); }}
      onPress={onPress}
      style={[styles.outer, disabled && styles.disabled, style]}
      pressDepth={3}
      pressScale={0.985}
    >
      <GlassPanel strong style={styles.card}>
        <View pointerEvents="none" style={[styles.accentRail, { backgroundColor: accent }]} />
        <MaterialSurface material="bronze" style={[styles.icon, { borderColor: accent }]}>
          <View style={[styles.iconTint, { backgroundColor: `${accent}22` }]} />
          {icon}
        </MaterialSurface>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {badge ? <Text style={[styles.badge, { color: accent, borderColor: `${accent}88` }]}>{badge}</Text> : null}
          </View>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.chevronShell}><Ionicons name="chevron-forward" size={18} color={colors.parchment} /></View>
      </GlassPanel>
    </TactilePressable>
  );
}

export function StatTile({ value, label, icon, accent = colors.brand, style }: { value: string | number; label: string; icon?: ReactNode; accent?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <GlassPanel variant="crystal" style={[styles.stat, style]}>
      <View style={[styles.statGlow, { backgroundColor: accent }]} />
      <View style={styles.statTop}>{icon}<Text style={[styles.statValue, { color: accent }]}>{value}</Text></View>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassPanel>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionTitleWrap}><View style={styles.sectionRule} /><Text style={styles.sectionTitle}>{title}</Text></View>
      {action && onAction ? (
        <TactilePressable accessibilityRole="button" onPress={onAction} pressScale={0.96} pressDepth={1} style={styles.sectionActionButton}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TactilePressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: radii.lg },
  disabled: { opacity: 0.45 },
  card: { minHeight: 96, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  accentRail: { position: 'absolute', left: 0, top: 16, bottom: 16, width: 3, borderRadius: 99, opacity: 0.84 },
  icon: { width: 54, height: 54, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconTint: { ...StyleSheet.absoluteFillObject },
  copy: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  title: { color: colors.onSurface, fontSize: 16.5, fontWeight: '900' },
  description: { color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  badge: { borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 2, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  chevronShell: { width: 30, height: 30, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stat: { minHeight: 88, borderRadius: radii.lg, padding: spacing.md, justifyContent: 'center', gap: 5 },
  statGlow: { position: 'absolute', width: 72, height: 72, borderRadius: 99, right: -28, top: -30, opacity: 0.12 },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sectionRule: { width: 3, height: 20, borderRadius: 99, backgroundColor: colors.brand },
  sectionTitle: { color: colors.parchment, fontSize: 18, fontWeight: '900' },
  sectionActionButton: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6 },
  sectionAction: { color: colors.brand, fontSize: 12, fontWeight: '900' },
});
