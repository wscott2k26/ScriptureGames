import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

import { useProfile } from '@/src/profile-context';
import {
  getFaithJourney,
  loadOneFaithJourneyProgress,
  saveFaithJourneyDay,
  type FaithJourneyProgress,
} from '@/src/faith-journeys';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { TactileButton } from '@/src/components/premium/TactileButton';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { colors, radii, spacing } from '@/src/theme';

export default function FaithJourneyScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { profile } = useProfile();
  const journey = useMemo(() => getFaithJourney(params.id), [params.id]);
  const [progress, setProgress] = useState<FaithJourneyProgress | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [journal, setJournal] = useState('');
  const [saving, setSaving] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const load = useCallback(async () => {
    if (!profile || !journey) return;
    const saved = await loadOneFaithJourneyProgress(profile.id, journey.id);
    setProgress(saved);
    const firstOpen = journey.days.findIndex((_, index) => !saved.completedDays.includes(index));
    const nextIndex = firstOpen === -1 ? Math.max(0, journey.days.length - 1) : firstOpen;
    setDayIndex(nextIndex);
    setJournal(saved.journals[String(nextIndex)] || '');
  }, [journey, profile]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => () => { void Speech.stop(); }, []);

  if (!profile || !journey) return null;
  const day = journey.days[dayIndex];
  const complete = Boolean(progress?.completedDays.includes(dayIndex));
  const completedCount = progress?.completedDays.length || 0;

  const chooseDay = (index: number) => {
    setDayIndex(index);
    setJournal(progress?.journals[String(index)] || '');
    void Speech.stop();
    setSpeaking(false);
  };

  const save = async (markComplete: boolean) => {
    setSaving(true);
    try {
      const next = await saveFaithJourneyDay(profile.id, journey.id, dayIndex, markComplete, journal);
      setProgress(next);
      if (markComplete && dayIndex < journey.days.length - 1) {
        const nextIndex = dayIndex + 1;
        setDayIndex(nextIndex);
        setJournal(next.journals[String(nextIndex)] || '');
      }
    } finally {
      setSaving(false);
    }
  };

  const readDay = async () => {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }
    const voices = await Speech.getAvailableVoicesAsync().catch(() => []);
    const enhanced = voices.find((voice) => voice.language.toLowerCase().startsWith('en') && String(voice.quality).toLowerCase().includes('enhanced'));
    setSpeaking(true);
    Speech.speak(`${day.title}. ${day.reference}. ${day.verse}. Reflection. ${day.reflection}. Prayer. ${day.prayer}. Today’s action. ${day.action}`, {
      language: 'en-US',
      voice: enhanced?.identifier,
      rate: 0.91,
      pitch: 1,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-09']} darkness={0.7}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          back
          eyebrow={`FAITH JOURNEY · ${completedCount}/${journey.days.length}`}
          title={journey.title}
          subtitle={journey.subtitle}
          right={
            <Pressable accessibilityRole="button" accessibilityLabel={speaking ? 'Stop reading' : 'Read this day aloud'} onPress={() => void readDay()}>
              <GlassPanel style={styles.voiceButton}><Ionicons name={speaking ? 'stop' : 'volume-high'} size={20} color={colors.brand} /></GlassPanel>
            </Pressable>
          }
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStrip}>
            {journey.days.map((item, index) => {
              const done = Boolean(progress?.completedDays.includes(index));
              const active = index === dayIndex;
              return (
                <Pressable key={item.title} accessibilityRole="button" onPress={() => chooseDay(index)} style={[styles.dayChip, active && styles.dayChipActive, done && styles.dayChipDone]}>
                  <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{done ? '✓' : index + 1}</Text>
                  <Text numberOfLines={1} style={[styles.dayLabel, active && styles.dayLabelActive]}>Day {index + 1}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <GlassPanel strong style={styles.verseCard}>
            <Text style={styles.eyebrow}>DAY {dayIndex + 1}</Text>
            <Text style={styles.dayTitle}>{day.title}</Text>
            <Text style={styles.verse}>“{day.verse}”</Text>
            <Text style={styles.reference}>{day.reference}</Text>
          </GlassPanel>

          <GlassPanel strong style={styles.sectionCard}>
            <View style={styles.sectionHeader}><Ionicons name="leaf" size={21} color={colors.success} /><Text style={styles.sectionTitle}>Reflection</Text></View>
            <Text style={styles.body}>{day.reflection}</Text>
          </GlassPanel>

          <GlassPanel style={styles.sectionCard}>
            <View style={styles.sectionHeader}><Ionicons name="heart" size={21} color={colors.coral} /><Text style={styles.sectionTitle}>Prayer</Text></View>
            <Text style={styles.prayer}>{day.prayer}</Text>
          </GlassPanel>

          <GlassPanel style={styles.actionCard}>
            <View style={styles.sectionHeader}><Ionicons name="footsteps" size={21} color={colors.brand} /><Text style={styles.sectionTitle}>Today’s action</Text></View>
            <Text style={styles.body}>{day.action}</Text>
          </GlassPanel>

          <GlassPanel strong style={styles.journalCard}>
            <Text style={styles.journalTitle}>Private reflection</Text>
            <Text style={styles.prompt}>{day.journalPrompt}</Text>
            <TextInput
              value={journal}
              onChangeText={setJournal}
              multiline
              maxLength={3000}
              placeholder="Write what is true for you today…"
              placeholderTextColor={colors.muted}
              style={styles.input}
              textAlignVertical="top"
            />
            <Text style={styles.privateNote}>Saved privately on this device and included in optional cloud backup.</Text>
          </GlassPanel>

          <View style={styles.actions}>
            <TactileButton
              label={saving ? 'Saving…' : complete ? 'Save Reflection' : 'Complete Day'}
              disabled={saving}
              onPress={() => void save(true)}
            />
            {complete ? <TactileButton variant="stone" label="Mark Incomplete" onPress={() => void save(false)} /> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  voiceButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayStrip: { gap: spacing.sm, paddingVertical: 2 },
  dayChip: { width: 67, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(6,12,24,0.72)', paddingVertical: 10, alignItems: 'center' },
  dayChipActive: { borderColor: colors.brand, backgroundColor: 'rgba(232,185,87,0.16)' },
  dayChipDone: { borderColor: colors.success },
  dayNumber: { color: colors.muted, fontSize: 15, fontWeight: '900' },
  dayNumberActive: { color: colors.brand },
  dayLabel: { color: colors.muted, fontSize: 9.5, fontWeight: '900', marginTop: 2 },
  dayLabelActive: { color: colors.onSurface },
  verseCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm },
  eyebrow: { color: colors.brand, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  dayTitle: { color: colors.onSurface, fontSize: 25, fontWeight: '900' },
  verse: { color: colors.parchment, fontSize: 20, lineHeight: 29, fontWeight: '800', fontStyle: 'italic' },
  reference: { color: colors.brandSecondary, fontSize: 12.5, fontWeight: '900' },
  sectionCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  actionCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md, borderColor: colors.borderStrong },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { color: colors.onSurface, fontSize: 18, fontWeight: '900' },
  body: { color: colors.onSurface, fontSize: 15, lineHeight: 25 },
  prayer: { color: colors.parchment, fontSize: 15, lineHeight: 25, fontStyle: 'italic' },
  journalCard: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm },
  journalTitle: { color: colors.onSurface, fontSize: 18, fontWeight: '900' },
  prompt: { color: colors.brand, fontSize: 13, lineHeight: 19, fontWeight: '800' },
  input: { minHeight: 140, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(3,7,14,0.78)', color: colors.onSurface, padding: spacing.md, fontSize: 14, lineHeight: 21 },
  privateNote: { color: colors.muted, fontSize: 10.5, lineHeight: 15 },
  actions: { gap: spacing.sm },
});
