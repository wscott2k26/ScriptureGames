import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FactionId } from './genesis-season';

export type TrialResult = {
  score: number;
  total: number;
  percent: number;
  completedAt: string;
};

export type SeasonProgress = {
  version: 1;
  faction?: FactionId;
  manna: number;
  rankPoints: number;
  completedTrials: string[];
  bestResults: Record<string, TrialResult>;
  choices: Record<string, string>;
  introSeen: boolean;
  seasonCompletedAt?: string;
  bonusAwards?: string[];
};

const initial: SeasonProgress = {
  version: 1,
  manna: 0,
  rankPoints: 0,
  completedTrials: [],
  bestResults: {},
  choices: {},
  introSeen: false,
  bonusAwards: [],
};

const key = (profileId: string) => `scripture_games_genesis_season_v1_${profileId}`;
const corruptKey = (profileId: string) => `scripture_games_genesis_season_corrupt_backup_${profileId}`;
const freshInitial = (): SeasonProgress => ({ ...initial, completedTrials: [], bestResults: {}, choices: {}, bonusAwards: [] });
const queues = new Map<string, Promise<void>>();

async function readSeasonProgress(profileId: string): Promise<SeasonProgress> {
  const raw = await AsyncStorage.getItem(key(profileId));
  if (!raw) return freshInitial();
  try {
    const saved = JSON.parse(raw) as Partial<SeasonProgress>;
    return {
      ...initial,
      ...saved,
      completedTrials: Array.isArray(saved.completedTrials) ? saved.completedTrials : [],
      bestResults: saved.bestResults || {},
      choices: saved.choices || {},
      bonusAwards: Array.isArray(saved.bonusAwards) ? saved.bonusAwards : [],
    };
  } catch {
    await AsyncStorage.setItem(corruptKey(profileId), raw).catch(() => undefined);
    return freshInitial();
  }
}

function serializeProgress<T>(profileId: string, operation: () => Promise<T>): Promise<T> {
  const previous = queues.get(profileId) || Promise.resolve();
  const task = previous.then(operation);
  const settled = task.then(() => undefined, () => undefined);
  queues.set(profileId, settled);
  void settled.finally(() => {
    if (queues.get(profileId) === settled) queues.delete(profileId);
  });
  return task;
}

export async function loadSeasonProgress(profileId: string): Promise<SeasonProgress> {
  await (queues.get(profileId) || Promise.resolve());
  return readSeasonProgress(profileId);
}

export async function saveSeasonProgress(profileId: string, progress: SeasonProgress): Promise<void> {
  return serializeProgress(profileId, () => AsyncStorage.setItem(key(profileId), JSON.stringify(progress)));
}

export async function selectFaction(profileId: string, faction: FactionId): Promise<SeasonProgress> {
  return serializeProgress(profileId, async () => {
    const current = await readSeasonProgress(profileId);
    const updated = { ...current, faction, introSeen: true };
    await AsyncStorage.setItem(key(profileId), JSON.stringify(updated));
    return updated;
  });
}

export async function saveTrialChoice(profileId: string, trialId: string, choiceId: string): Promise<SeasonProgress> {
  return serializeProgress(profileId, async () => {
    const current = await readSeasonProgress(profileId);
    const updated = { ...current, choices: { ...current.choices, [trialId]: choiceId } };
    await AsyncStorage.setItem(key(profileId), JSON.stringify(updated));
    return updated;
  });
}

export async function completeSeasonTrial(
  profileId: string,
  trialId: string,
  score: number,
  total: number,
  mannaReward: number,
  rankReward: number,
  isFinal: boolean,
): Promise<{ progress: SeasonProgress; firstCompletion: boolean; improved: boolean }> {
  return serializeProgress(profileId, async () => {
    const current = await readSeasonProgress(profileId);
    const safeTotal = Math.max(0, Math.round(total));
    const safeScore = Math.max(0, Math.min(Math.round(score), safeTotal));
    const percent = safeTotal > 0 ? Math.round((safeScore / safeTotal) * 100) : 0;
    const previous = current.bestResults[trialId];
    const firstCompletion = !current.completedTrials.includes(trialId);
    const improved = !previous || percent > previous.percent;
    const completedTrials = firstCompletion ? [...current.completedTrials, trialId] : current.completedTrials;
    const result = improved
      ? { score: safeScore, total: safeTotal, percent, completedAt: new Date().toISOString() }
      : previous;
    const updated: SeasonProgress = {
      ...current,
      completedTrials,
      bestResults: { ...current.bestResults, [trialId]: result },
      manna: current.manna + (firstCompletion ? Math.max(0, Math.round(mannaReward)) : 0),
      rankPoints: current.rankPoints + (firstCompletion ? Math.max(0, Math.round(rankReward)) : 0),
      seasonCompletedAt: isFinal && firstCompletion ? new Date().toISOString() : current.seasonCompletedAt,
    };
    await AsyncStorage.setItem(key(profileId), JSON.stringify(updated));
    return { progress: updated, firstCompletion, improved };
  });
}

export async function awardSeasonBonus(profileId: string, awardId: string, manna: number, rankPoints = 0): Promise<{ progress: SeasonProgress; firstAward: boolean }> {
  return serializeProgress(profileId, async () => {
    const current = await readSeasonProgress(profileId);
    const awards = current.bonusAwards || [];
    if (awards.includes(awardId)) return { progress: current, firstAward: false };
    const updated: SeasonProgress = {
      ...current,
      manna: current.manna + Math.max(0, Math.round(manna)),
      rankPoints: current.rankPoints + Math.max(0, Math.round(rankPoints)),
      bonusAwards: [...awards, awardId],
    };
    await AsyncStorage.setItem(key(profileId), JSON.stringify(updated));
    return { progress: updated, firstAward: true };
  });
}

export async function resetSeasonProgress(profileId: string): Promise<void> {
  return serializeProgress(profileId, () => AsyncStorage.removeItem(key(profileId)));
}
