import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BibleLocation } from './bible-types';

export type BibleHighlight = 'gold' | 'sky' | 'mint' | 'rose';
export type BibleFontSize = 'standard' | 'large' | 'church';

export type BibleStudyState = {
  version: 1;
  lastLocation: BibleLocation;
  bookmarks: string[];
  highlights: Record<string, BibleHighlight>;
  verseNotes: Record<string, string>;
  sermonNotes: Record<string, string>;
  history: BibleLocation[];
  churchMode: boolean;
  fontSize: BibleFontSize;
};

const INITIAL: BibleStudyState = {
  version: 1,
  lastLocation: { bookId: 'JHN', chapter: 1 },
  bookmarks: [],
  highlights: {},
  verseNotes: {},
  sermonNotes: {},
  history: [],
  churchMode: false,
  fontSize: 'standard',
};

const key = (profileId: string) => `scripture_games_bible_study_v1_${profileId}`;
const corruptKey = (profileId: string) => `scripture_games_bible_study_corrupt_backup_${profileId}`;
const queues = new Map<string, Promise<void>>();

function fresh(): BibleStudyState {
  return {
    ...INITIAL,
    lastLocation: { ...INITIAL.lastLocation },
    bookmarks: [],
    highlights: {},
    verseNotes: {},
    sermonNotes: {},
    history: [],
  };
}

function normalize(value?: Partial<BibleStudyState> | null): BibleStudyState {
  const base = fresh();
  const fontSize: BibleFontSize = value?.fontSize === 'large' || value?.fontSize === 'church' ? value.fontSize : 'standard';
  return {
    version: 1,
    lastLocation: value?.lastLocation?.bookId && value.lastLocation.chapter > 0 ? value.lastLocation : base.lastLocation,
    bookmarks: Array.isArray(value?.bookmarks) ? [...new Set(value.bookmarks.filter((item): item is string => typeof item === 'string'))].slice(-500) : [],
    highlights: value?.highlights && typeof value.highlights === 'object' ? value.highlights : {},
    verseNotes: value?.verseNotes && typeof value.verseNotes === 'object' ? value.verseNotes : {},
    sermonNotes: value?.sermonNotes && typeof value.sermonNotes === 'object' ? value.sermonNotes : {},
    history: Array.isArray(value?.history) ? value.history.filter((item): item is BibleLocation => Boolean(item?.bookId && item.chapter > 0)).slice(-100) : [],
    churchMode: Boolean(value?.churchMode),
    fontSize,
  };
}

async function read(profileId: string): Promise<BibleStudyState> {
  const raw = await AsyncStorage.getItem(key(profileId));
  if (!raw) return fresh();
  try {
    return normalize(JSON.parse(raw) as Partial<BibleStudyState>);
  } catch {
    await AsyncStorage.setItem(corruptKey(profileId), raw).catch(() => undefined);
    return fresh();
  }
}

function serialize<T>(profileId: string, operation: () => Promise<T>): Promise<T> {
  const previous = queues.get(profileId) || Promise.resolve();
  const task = previous.then(operation);
  const settled = task.then(() => undefined, () => undefined);
  queues.set(profileId, settled);
  void settled.finally(() => {
    if (queues.get(profileId) === settled) queues.delete(profileId);
  });
  return task;
}

export async function loadBibleStudy(profileId: string): Promise<BibleStudyState> {
  await (queues.get(profileId) || Promise.resolve());
  return read(profileId);
}

export async function updateBibleStudy(
  profileId: string,
  updater: (current: BibleStudyState) => BibleStudyState,
): Promise<BibleStudyState> {
  return serialize(profileId, async () => {
    const current = await read(profileId);
    const updated = normalize(updater(current));
    await AsyncStorage.setItem(key(profileId), JSON.stringify(updated));
    return updated;
  });
}

export async function recordBibleLocation(profileId: string, location: BibleLocation): Promise<BibleStudyState> {
  return updateBibleStudy(profileId, (current) => {
    const withoutDuplicate = current.history.filter((item) => !(
      item.bookId === location.bookId && item.chapter === location.chapter && item.verse === location.verse
    ));
    return {
      ...current,
      lastLocation: location,
      history: [...withoutDuplicate, location].slice(-100),
    };
  });
}

export async function toggleBibleBookmark(profileId: string, referenceKey: string): Promise<BibleStudyState> {
  return updateBibleStudy(profileId, (current) => ({
    ...current,
    bookmarks: current.bookmarks.includes(referenceKey)
      ? current.bookmarks.filter((item) => item !== referenceKey)
      : [...current.bookmarks, referenceKey].slice(-500),
  }));
}

const HIGHLIGHT_ORDER: (BibleHighlight | undefined)[] = [undefined, 'gold', 'sky', 'mint', 'rose'];

export async function cycleBibleHighlight(profileId: string, referenceKey: string): Promise<BibleStudyState> {
  return updateBibleStudy(profileId, (current) => {
    const currentIndex = HIGHLIGHT_ORDER.indexOf(current.highlights[referenceKey]);
    const next = HIGHLIGHT_ORDER[(currentIndex + 1) % HIGHLIGHT_ORDER.length];
    const highlights = { ...current.highlights };
    if (next) highlights[referenceKey] = next;
    else delete highlights[referenceKey];
    return { ...current, highlights };
  });
}

export async function saveBibleVerseNote(profileId: string, referenceKey: string, note: string): Promise<BibleStudyState> {
  return updateBibleStudy(profileId, (current) => {
    const verseNotes = { ...current.verseNotes };
    const trimmed = note.trim().slice(0, 4000);
    if (trimmed) verseNotes[referenceKey] = trimmed;
    else delete verseNotes[referenceKey];
    return { ...current, verseNotes };
  });
}

export async function saveSermonNote(profileId: string, chapterReference: string, note: string): Promise<BibleStudyState> {
  return updateBibleStudy(profileId, (current) => {
    const sermonNotes = { ...current.sermonNotes };
    const trimmed = note.slice(0, 12_000);
    if (trimmed.trim()) sermonNotes[chapterReference] = trimmed;
    else delete sermonNotes[chapterReference];
    return { ...current, sermonNotes };
  });
}

export async function setBibleReaderPreferences(
  profileId: string,
  preferences: Partial<Pick<BibleStudyState, 'churchMode' | 'fontSize'>>,
): Promise<BibleStudyState> {
  return updateBibleStudy(profileId, (current) => ({ ...current, ...preferences }));
}
