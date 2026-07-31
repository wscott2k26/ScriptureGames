import AsyncStorage from '@react-native-async-storage/async-storage';

import { localDateKey } from './daily-challenge';

export type DailyRhythmState = {
  version: 1;
  completedDates: string[];
  currentStreak: number;
  bestStreak: number;
  graceLeaves: number;
  graceUsedDates: string[];
  milestoneRewards: number[];
  lastCompletedDate?: string;
};

export type DailyRhythmRecord = {
  state: DailyRhythmState;
  firstCompletion: boolean;
  graceUsed: boolean;
  graceEarned: boolean;
};

export type DailyRhythmSnapshot = {
  activeStreak: number;
  atRisk: boolean;
  completedToday: boolean;
  lastSevenDays: { date: string; completed: boolean; grace: boolean }[];
};

const INITIAL: DailyRhythmState = {
  version: 1,
  completedDates: [],
  currentStreak: 0,
  bestStreak: 0,
  graceLeaves: 1,
  graceUsedDates: [],
  milestoneRewards: [],
};

const key = (profileId: string) => `scripture_games_daily_rhythm_v1_${profileId}`;
const corruptKey = (profileId: string) => `scripture_games_daily_rhythm_corrupt_backup_${profileId}`;
const queues = new Map<string, Promise<void>>();

function freshInitial(): DailyRhythmState {
  return { ...INITIAL, completedDates: [], graceUsedDates: [], milestoneRewards: [] };
}

function parseDateKey(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, Math.max(0, month - 1), day);
}

function differenceInDays(later: string, earlier: string): number {
  return Math.round((parseDateKey(later) - parseDateKey(earlier)) / 86_400_000);
}

function addDays(date: string, amount: number): string {
  const value = new Date(parseDateKey(date));
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

function normalize(saved?: Partial<DailyRhythmState> | null): DailyRhythmState {
  const completedDates = Array.isArray(saved?.completedDates)
    ? [...new Set(saved.completedDates.filter((date): date is string => typeof date === 'string'))].sort()
    : [];
  const lastCompletedDate = saved?.lastCompletedDate || completedDates[completedDates.length - 1];
  return {
    version: 1,
    completedDates,
    currentStreak: Math.max(0, Math.round(saved?.currentStreak || 0)),
    bestStreak: Math.max(0, Math.round(saved?.bestStreak || 0)),
    graceLeaves: Math.max(0, Math.min(2, Math.round(saved?.graceLeaves ?? 1))),
    graceUsedDates: Array.isArray(saved?.graceUsedDates) ? saved.graceUsedDates.filter((date): date is string => typeof date === 'string') : [],
    milestoneRewards: Array.isArray(saved?.milestoneRewards) ? saved.milestoneRewards.filter((value): value is number => typeof value === 'number') : [],
    lastCompletedDate,
  };
}

async function read(profileId: string): Promise<DailyRhythmState> {
  const raw = await AsyncStorage.getItem(key(profileId));
  if (!raw) return freshInitial();
  try {
    return normalize(JSON.parse(raw) as Partial<DailyRhythmState>);
  } catch {
    await AsyncStorage.setItem(corruptKey(profileId), raw).catch(() => undefined);
    return freshInitial();
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

export async function loadDailyRhythm(profileId: string): Promise<DailyRhythmState> {
  await (queues.get(profileId) || Promise.resolve());
  return read(profileId);
}

export async function recordDailyCompletion(profileId: string, date = localDateKey()): Promise<DailyRhythmRecord> {
  return serialize(profileId, async () => {
    const current = await read(profileId);
    if (current.completedDates.includes(date)) {
      return { state: current, firstCompletion: false, graceUsed: false, graceEarned: false };
    }

    const gap = current.lastCompletedDate ? differenceInDays(date, current.lastCompletedDate) : 1;
    let currentStreak = current.currentStreak;
    let graceLeaves = current.graceLeaves;
    let graceUsed = false;
    let graceUsedDates = current.graceUsedDates;

    if (!current.lastCompletedDate || gap === 1) {
      currentStreak += 1;
    } else if (gap === 2 && graceLeaves > 0) {
      currentStreak += 1;
      graceLeaves -= 1;
      graceUsed = true;
      graceUsedDates = [...graceUsedDates, addDays(date, -1)];
    } else if (gap > 1) {
      currentStreak = 1;
    }

    const milestone = Math.floor(currentStreak / 7) * 7;
    const milestoneRewards = [...current.milestoneRewards];
    let graceEarned = false;
    if (milestone >= 7 && !milestoneRewards.includes(milestone)) {
      milestoneRewards.push(milestone);
      if (graceLeaves < 2) {
        graceLeaves += 1;
        graceEarned = true;
      }
    }

    const completedDates = [...current.completedDates, date].sort().slice(-120);
    const next: DailyRhythmState = {
      version: 1,
      completedDates,
      currentStreak,
      bestStreak: Math.max(current.bestStreak, currentStreak),
      graceLeaves,
      graceUsedDates: graceUsedDates.slice(-24),
      milestoneRewards,
      lastCompletedDate: date,
    };
    await AsyncStorage.setItem(key(profileId), JSON.stringify(next));
    return { state: next, firstCompletion: true, graceUsed, graceEarned };
  });
}

export function getDailyRhythmSnapshot(state: DailyRhythmState, today = localDateKey()): DailyRhythmSnapshot {
  const gap = state.lastCompletedDate ? differenceInDays(today, state.lastCompletedDate) : Number.POSITIVE_INFINITY;
  const atRisk = gap === 2 && state.graceLeaves > 0;
  const activeStreak = gap <= 1 || atRisk ? state.currentStreak : 0;
  const completed = new Set(state.completedDates);
  const grace = new Set(state.graceUsedDates);
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => addDays(today, index - 6)).map((date) => ({
    date,
    completed: completed.has(date),
    grace: grace.has(date),
  }));
  return {
    activeStreak,
    atRisk,
    completedToday: completed.has(today),
    lastSevenDays,
  };
}
