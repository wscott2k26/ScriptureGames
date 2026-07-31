import AsyncStorage from '@react-native-async-storage/async-storage';

import { localApi } from './local-api';
import {
  formatBibleReference,
  getBibleBook,
  getBibleChapter,
  parseBibleReference,
  searchBible,
} from './bible-library';
import { createLumiReply, type LumiBibleSource } from './lumi-engine';

const PROFILE_KEY = 'scripture_games_profile_id';
const FAMILY_KEY = 'scripture_games_family_id';
const LOCAL_DB_KEY = 'scripture_games_local_db_v2';
const REMOTE_BASE = process.env.EXPO_PUBLIC_BACKEND_URL?.replace(/\/$/, '');
const USE_REMOTE = process.env.EXPO_PUBLIC_USE_REMOTE_API === 'true' && Boolean(REMOTE_BASE);

async function remoteReq(path: string, opts: RequestInit = {}) {
  if (!REMOTE_BASE) throw new Error('Remote backend URL is not configured');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(`${REMOTE_BASE}/api${path}`, {
      ...opts,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

const remoteApi = {
  createProfile: (name: string, avatar: string, mode: 'kids' | 'adult', family_id?: string) =>
    remoteReq('/profile', { method: 'POST', body: JSON.stringify({ name, avatar, mode, family_id }) }),
  getProfile: (id: string) => remoteReq(`/profile/${id}`),
  listProfiles: async () => ({ profiles: [] }),
  updateProfile: (id: string, data: unknown) =>
    remoteReq(`/profile/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  completeNode: (id: string, node_id: string, correct: number, total: number) =>
    remoteReq(`/profile/${id}/complete-node`, {
      method: 'POST',
      body: JSON.stringify({ node_id, correct_count: correct, total_count: total }),
    }),
  awardBonus: (id: string, award_id: string, xp: number, badge?: string) =>
    remoteReq(`/profile/${id}/bonus`, { method: 'POST', body: JSON.stringify({ award_id, xp, badge }) }),
  getRecentActivity: (id: string, days = 7) => remoteReq(`/profile/${id}/activity?days=${days}`),
  getJourney: () => remoteReq('/journey'),
  getQuiz: (topic: string, limit = 5) => remoteReq(`/quiz/${encodeURIComponent(topic)}?limit=${limit}`),
  getVerses: () => remoteReq('/verses'),
  getStories: () => remoteReq('/stories'),
  getStory: (id: string, mode: 'kids' | 'adult') => remoteReq(`/stories/${encodeURIComponent(id)}?mode=${mode}`),
  getPuzzles: () => remoteReq('/puzzles'),
  getDevotional: (mode: 'kids' | 'adult') => remoteReq(`/devotional/today?mode=${mode}`),
  chat: (profile_id: string, session_id: string, message: string, mode: 'kids' | 'adult') =>
    remoteReq('/chat', { method: 'POST', body: JSON.stringify({ profile_id, session_id, message, mode }) }),
  chatHistory: (session_id: string) => remoteReq(`/chat/${encodeURIComponent(session_id)}`),
  clearChat: (session_id: string) => remoteReq(`/chat/${encodeURIComponent(session_id)}`, { method: 'DELETE' }),
  leaderboard: (limit = 20) => remoteReq(`/leaderboard?limit=${limit}`),
  createFamily: (parent_name: string, parent_email: string) =>
    remoteReq('/family', { method: 'POST', body: JSON.stringify({ parent_name, parent_email }) }),
  getFamily: (id: string) => remoteReq(`/family/${id}`),
  subscribeFamily: (id: string) => remoteReq(`/family/${id}/subscribe`, { method: 'POST' }),
  addChild: (family_id: string, name: string, avatar: string, mode: 'kids' | 'adult') =>
    remoteReq(`/family/${family_id}/children`, {
      method: 'POST',
      body: JSON.stringify({ name, avatar, mode }),
    }),
  familyDashboard: (id: string) => remoteReq(`/family/${id}/dashboard`),
  upgradePremium: (id: string) => remoteReq(`/profile/${id}/upgrade`, { method: 'POST' }),
  listTopics: () => remoteReq('/quiz-topics'),
};

const lumiBibleSource: LumiBibleSource = {
  lookupReference(input) {
    const location = parseBibleReference(input);
    if (!location) return null;
    const book = getBibleBook(location.bookId);
    if (!book) return null;
    const verses = getBibleChapter(book.id, location.chapter);
    if (!verses.length) return null;

    if (location.verse !== undefined) {
      const verse = verses.find(([number]) => number === location.verse);
      if (!verse) return null;
      return {
        reference: formatBibleReference(location),
        text: verse[1],
      };
    }

    const excerpt = verses.slice(0, 3);
    return {
      reference: `${book.name} ${location.chapter}:1–${excerpt.at(-1)?.[0] || 1}`,
      text: excerpt.map(([number, text]) => `${number}. ${text}`).join(' '),
    };
  },
  findVerses(query, limit = 3) {
    return searchBible(query, limit).map((verse) => ({
      reference: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
      text: verse.text,
    }));
  },
};

type StoredChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type StoredLocalDb = {
  chats?: Record<string, StoredChatMessage[]>;
  [key: string]: unknown;
};

let lumiHistoryQueue: Promise<void> = Promise.resolve();

function replaceStoredLumiReply(sessionId: string, reply: string): Promise<void> {
  const task = lumiHistoryQueue.then(async () => {
    const raw = await AsyncStorage.getItem(LOCAL_DB_KEY);
    if (!raw) return;

    let db: StoredLocalDb;
    try {
      db = JSON.parse(raw) as StoredLocalDb;
    } catch {
      return;
    }

    const chats = db.chats || {};
    const messages = chats[sessionId];
    if (!messages?.length) return;

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'assistant') {
        messages[index] = { ...messages[index], content: reply };
        break;
      }
    }

    db.chats = chats;
    await AsyncStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
  });
  lumiHistoryQueue = task.then(() => undefined, () => undefined);
  return task;
}

const enhancedLocalApi = {
  ...localApi,
  async chat(profileId: string, sessionId: string, message: string, mode: 'kids' | 'adult') {
    await localApi.chat(profileId, sessionId, message, mode);
    const reply = createLumiReply(message, mode, lumiBibleSource);
    await replaceStoredLumiReply(sessionId, reply);
    return { reply };
  },
};

// Local-first by default so TestFlight builds work without a temporary preview server.
export const api = USE_REMOTE ? remoteApi : enhancedLocalApi;

export const storage = {
  saveProfileId: (id: string) => AsyncStorage.setItem(PROFILE_KEY, id),
  getProfileId: () => AsyncStorage.getItem(PROFILE_KEY),
  saveFamilyId: (id: string) => (id ? AsyncStorage.setItem(FAMILY_KEY, id) : AsyncStorage.removeItem(FAMILY_KEY)),
  getFamilyId: () => AsyncStorage.getItem(FAMILY_KEY),
  clear: () => AsyncStorage.removeItem(PROFILE_KEY),
  resetAll: async () => {
    const keys = await AsyncStorage.getAllKeys();
    const appDataKeys = keys.filter((item) => item.startsWith('scripture_games_'));
    await AsyncStorage.multiRemove([...new Set([PROFILE_KEY, FAMILY_KEY, ...appDataKeys])]);
  },
};
