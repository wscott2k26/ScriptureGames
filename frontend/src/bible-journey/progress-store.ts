import {
  completeJourneyBook,
  createInitialJourneyProgress,
  normalizeJourneyProgress,
  recordJourneyTrialResult,
  syncGenesisCompletion,
  type BibleJourneyProgress,
  type JourneyBookUpdate,
  type JourneyTrialUpdate,
} from './progress-core.ts';

export type JourneyStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export type JourneyProgressStore = {
  load: (profileId: string) => Promise<BibleJourneyProgress>;
  save: (profileId: string, progress: BibleJourneyProgress) => Promise<void>;
  recordTrial: (
    profileId: string,
    bookId: string,
    trialId: string,
    score: number,
    total: number,
    completedAt?: string,
  ) => Promise<JourneyTrialUpdate>;
  completeBook: (profileId: string, bookId: string, completedAt?: string) => Promise<JourneyBookUpdate>;
  syncGenesis: (
    profileId: string,
    completedTrialCount: number,
    seasonCompletedAt?: string,
  ) => Promise<JourneyBookUpdate>;
  reset: (profileId: string) => Promise<void>;
};

const progressKey = (profileId: string) => `scripture_games_bible_journey_v1_${profileId}`;
const corruptKey = (profileId: string) => `scripture_games_bible_journey_corrupt_backup_${profileId}`;

export function createJourneyProgressStore(storage: JourneyStorage): JourneyProgressStore {
  const queues = new Map<string, Promise<void>>();

  async function read(profileId: string): Promise<BibleJourneyProgress> {
    const raw = await storage.getItem(progressKey(profileId));
    if (!raw) return createInitialJourneyProgress();
    try {
      return normalizeJourneyProgress(JSON.parse(raw) as unknown);
    } catch {
      await storage.setItem(corruptKey(profileId), raw).catch(() => undefined);
      return createInitialJourneyProgress();
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

  async function write(profileId: string, progress: BibleJourneyProgress): Promise<void> {
    await storage.setItem(progressKey(profileId), JSON.stringify(normalizeJourneyProgress(progress)));
  }

  return {
    async load(profileId) {
      await (queues.get(profileId) || Promise.resolve());
      return read(profileId);
    },

    save(profileId, progress) {
      return serialize(profileId, () => write(profileId, progress));
    },

    recordTrial(profileId, bookId, trialId, score, total, completedAt) {
      return serialize(profileId, async () => {
        const current = await read(profileId);
        const result = recordJourneyTrialResult(current, bookId, trialId, score, total, completedAt);
        await write(profileId, result.progress);
        return result;
      });
    },

    completeBook(profileId, bookId, completedAt) {
      return serialize(profileId, async () => {
        const current = await read(profileId);
        const result = completeJourneyBook(current, bookId, completedAt);
        await write(profileId, result.progress);
        return result;
      });
    },

    syncGenesis(profileId, completedTrialCount, seasonCompletedAt) {
      return serialize(profileId, async () => {
        const current = await read(profileId);
        const result = syncGenesisCompletion(current, completedTrialCount, seasonCompletedAt);
        await write(profileId, result.progress);
        return result;
      });
    },

    reset(profileId) {
      return serialize(profileId, () => storage.removeItem(progressKey(profileId)));
    },
  };
}
