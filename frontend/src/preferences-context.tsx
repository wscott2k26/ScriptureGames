import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { configureHaptics } from './sfx';
import {
  DEFAULT_PREFERENCES,
  restorePreferences,
  type AppPreferences,
  type VoiceReplyMode,
} from './preferences-core';
import type { MotionMode } from './motion-intensity';

export type { AppPreferences, MotionMode, VoiceReplyMode };

export const PERSISTED_EXPERIENCE_PREFERENCE_FIELDS = [
  'hapticsEnabled',
  'cinematicTextEnabled',
  'motionMode',
] as const;

const STORAGE_KEY = 'scripture_games_preferences_v1';
const freshDefaults = (): AppPreferences => ({ ...DEFAULT_PREFERENCES, favoriteBackgroundIds: [] });

type PreferencesContextValue = {
  preferences: AppPreferences;
  loading: boolean;
  updatePreferences: (patch: Partial<AppPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(freshDefaults);
  const preferencesRef = useRef<AppPreferences>(freshDefaults());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const restored = restorePreferences(JSON.parse(raw) as unknown);
        preferencesRef.current = restored;
        setPreferences(restored);
      })
      .catch(() => {
        const defaults = freshDefaults();
        preferencesRef.current = defaults;
        setPreferences(defaults);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    configureHaptics(preferences.hapticsEnabled);
  }, [preferences.hapticsEnabled]);

  const updatePreferences = useCallback(async (patch: Partial<AppPreferences>) => {
    const next = restorePreferences({ ...preferencesRef.current, ...patch });
    preferencesRef.current = next;
    setPreferences(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const resetPreferences = useCallback(async () => {
    const defaults = freshDefaults();
    preferencesRef.current = defaults;
    setPreferences(defaults);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ preferences, loading, updatePreferences, resetPreferences }), [loading, preferences, resetPreferences, updatePreferences]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('usePreferences must be used inside PreferencesProvider');
  return value;
}
