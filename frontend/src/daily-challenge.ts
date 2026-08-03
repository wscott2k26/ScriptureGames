import AsyncStorage from '@react-native-async-storage/async-storage';
import { QUIZ_QUESTIONS } from './content.generated';
import { withResolvedQuizReference } from './quiz-reference-resolution';

export type DailyQuestion = {
  q: string;
  options: string[];
  answer: number;
  verse?: string;
  difficulty?: number;
  topic?: string;
};

export type DailyChallengeState = {
  date: string;
  topic: string;
  bestScore: number;
  total: number;
  attempts: number;
  completedAt?: string;
  rewarded: boolean;
};

const TOPICS = ['general', 'creation', 'noah', 'moses', 'david', 'prophets', 'psalms', 'parables', 'miracles', 'sermon', 'apostles', 'resurrection'] as const;
const key = (profileId: string) => `scripture_games_daily_challenge_v1_${profileId}`;
const corruptKey = (profileId: string) => `scripture_games_daily_challenge_corrupt_backup_${profileId}`;
const queues = new Map<string, Promise<void>>();

export function localDateKey(value = new Date()): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashText(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const copy = [...items];
  const random = seededRandom(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function shuffleQuestion(question: DailyQuestion, seed: number): DailyQuestion {
  const choices = seededShuffle(
    question.options.map((option, originalIndex) => ({ option, originalIndex })),
    seed,
  );
  return {
    ...question,
    options: choices.map((choice) => choice.option),
    answer: choices.findIndex((choice) => choice.originalIndex === question.answer),
  };
}

export function getDailyChallenge(date = localDateKey()) {
  const daySeed = hashText(date);
  const banks = QUIZ_QUESTIONS as unknown as Record<string, readonly DailyQuestion[]>;
  const start = daySeed % TOPICS.length;
  const chosenTopics = Array.from({ length: 5 }, (_, index) => TOPICS[(start + index * 5) % TOPICS.length]);
  const questions = chosenTopics.map((topic, index) => {
    const pool = banks[topic]?.length ? banks[topic] : banks.general;
    const questionSeed = hashText(`${date}:${topic}:${index}`);
    const question = pool[questionSeed % pool.length];
    const resolved = withResolvedQuizReference({ ...question, topic, options: [...question.options] });
    return shuffleQuestion(resolved, questionSeed + index * 101);
  });
  return { date, topic: 'five-field mix', questions };
}

async function readDailyChallengeState(profileId: string): Promise<DailyChallengeState | null> {
  const raw = await AsyncStorage.getItem(key(profileId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DailyChallengeState;
  } catch {
    await AsyncStorage.setItem(corruptKey(profileId), raw).catch(() => undefined);
    return null;
  }
}

function serializeDaily<T>(profileId: string, operation: () => Promise<T>): Promise<T> {
  const previous = queues.get(profileId) || Promise.resolve();
  const task = previous.then(operation);
  const settled = task.then(() => undefined, () => undefined);
  queues.set(profileId, settled);
  void settled.finally(() => {
    if (queues.get(profileId) === settled) queues.delete(profileId);
  });
  return task;
}

export async function loadDailyChallengeState(profileId: string): Promise<DailyChallengeState | null> {
  await (queues.get(profileId) || Promise.resolve());
  return readDailyChallengeState(profileId);
}

export async function saveDailyChallengeResult(profileId: string, date: string, topic: string, score: number, total: number) {
  return serializeDaily(profileId, async () => {
    const previous = await readDailyChallengeState(profileId);
    const safeTotal = Math.max(0, Math.round(total));
    const safeScore = Math.max(0, Math.min(Math.round(score), safeTotal));
    const sameDay = previous?.date === date;
    const firstCompletion = !sameDay || !previous?.rewarded;
    const next: DailyChallengeState = {
      date,
      topic,
      bestScore: sameDay ? Math.max(previous?.bestScore || 0, safeScore) : safeScore,
      total: safeTotal,
      attempts: sameDay ? (previous?.attempts || 0) + 1 : 1,
      completedAt: previous?.completedAt && sameDay ? previous.completedAt : new Date().toISOString(),
      rewarded: true,
    };
    await AsyncStorage.setItem(key(profileId), JSON.stringify(next));
    return { state: next, firstCompletion };
  });
}
