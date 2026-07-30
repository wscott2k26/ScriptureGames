import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api, storage } from './api';

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  mode: 'kids' | 'adult';
  xp: number;
  streak: number;
  completed_nodes: string[];
  badges: string[];
  last_active: string;
  is_premium?: boolean;
  premium_expires_at?: string;
  bonus_awards?: string[];
};

type Ctx = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  setProfile: (profile: Profile) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const ProfileCtx = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const id = await storage.getProfileId();
      if (!id) {
        setProfile(null);
        return;
      }
      const restored = await api.getProfile(id);
      setProfile(restored);
    } catch (caught) {
      setProfile(null);
      setError(caught instanceof Error ? caught.message : 'Player data could not be restored.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await storage.clear();
    setProfile(null);
    setError(null);
  }, []);

  return (
    <ProfileCtx.Provider value={{ profile, loading, error, setProfile, refresh, logout }}>
      {children}
    </ProfileCtx.Provider>
  );
}

export function useProfile() {
  const value = useContext(ProfileCtx);
  if (!value) throw new Error('useProfile must be used inside ProfileProvider');
  return value;
}
