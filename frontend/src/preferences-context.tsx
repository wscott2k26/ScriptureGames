import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { configureHaptics } from './sfx';

export type MotionMode = 'system' | 'reduced' | 'full';

export type AppPreferences = {
  hapticsEnabled: boolean;
  cinematicTextEnabled: boolean;
  motionMode: MotionMode;
};

const STORAGE_KEY = 'scripture_games_preferences_v1';
const DEFAULTS: AppPreferences = {
  hapticsEnabled: true,
  cinematicTextEnabled: true,
  motionMode: 'system',
};

type PreferencesContextValue = {
  preferences: AppPreferences;
  loading: boolean;
  updatePreferences: (patch: Partial<AppPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULTS);
  const preferencesRef = useRef<AppPreferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw) as Partial<AppPreferences>;
        const restored: AppPreferences = {
          hapticsEnabled: typeof parsed.hapticsEnabled === 'boolean' ? parsed.hapticsEnabled : DEFAULTS.hapticsEnabled,
          cinematicTextEnabled: typeof parsed.cinematicTextEnabled === 'boolean' ? parsed.cinematicTextEnabled : DEFAULTS.cinematicTextEnabled,
          motionMode: parsed.motionMode === 'reduced' || parsed.motionMode === 'full' ? parsed.motionMode : 'system',
        };
        preferencesRef.current = restored;
        setPreferences(restored);
      })
      .catch(() => {
        preferencesRef.current = DEFAULTS;
        setPreferences(DEFAULTS);
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
    const next = { ...preferencesRef.current, ...patch };
    preferencesRef.current = next;
    setPreferences(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const resetPreferences = useCallback(async () => {
    preferencesRef.current = DEFAULTS;
    setPreferences(DEFAULTS);
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
