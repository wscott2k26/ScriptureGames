import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrayerCategory = 'personal' | 'family' | 'health' | 'work' | 'gratitude' | 'other';

export type PrayerEntry = {
  id: string;
  profileId: string;
  title: string;
  details: string;
  category: PrayerCategory;
  status: 'active' | 'answered';
  createdAt: string;
  updatedAt: string;
  answeredAt?: string;
};

const STORAGE_KEY = 'scripture_games_prayer_garden_v1';

async function readAll(): Promise<PrayerEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PrayerEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(entries: PrayerEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function loadPrayers(profileId: string): Promise<PrayerEntry[]> {
  const entries = await readAll();
  return entries
    .filter((entry) => entry.profileId === profileId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function addPrayer(
  profileId: string,
  title: string,
  details: string,
  category: PrayerCategory,
): Promise<PrayerEntry> {
  const entries = await readAll();
  const now = new Date().toISOString();
  const entry: PrayerEntry = {
    id: `prayer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    profileId,
    title: title.trim().slice(0, 80),
    details: details.trim().slice(0, 1200),
    category,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  await writeAll([entry, ...entries]);
  return entry;
}

export async function setPrayerAnswered(id: string, answered: boolean): Promise<void> {
  const entries = await readAll();
  const now = new Date().toISOString();
  await writeAll(entries.map((entry) => entry.id === id ? {
    ...entry,
    status: answered ? 'answered' : 'active',
    answeredAt: answered ? now : undefined,
    updatedAt: now,
  } : entry));
}

export async function deletePrayer(id: string): Promise<void> {
  const entries = await readAll();
  await writeAll(entries.filter((entry) => entry.id !== id));
}
