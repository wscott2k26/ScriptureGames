import AsyncStorage from '@react-native-async-storage/async-storage';

import { localApi } from './local-api';

const PROFILE_KEY = 'scripture_games_profile_id';
const FAMILY_KEY = 'scripture_games_family_id';
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

// Local-first by default so TestFlight builds work without a temporary preview server.
export const api = USE_REMOTE ? remoteApi : localApi;

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
