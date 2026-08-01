import AsyncStorage from '@react-native-async-storage/async-storage';

import { JOURNEY_NODES, PUZZLES, QUIZ_QUESTIONS, STORIES, VERSES } from './content.generated';
import { hasValidatedPremiumEntitlement } from './premium-entitlement-core';

type Mode = 'kids' | 'adult';

type QuizQuestion = {
  q: string;
  options: readonly string[];
  answer: number;
  verse?: string;
  difficulty?: number;
};

type Profile = {
  id: string;
  name: string;
  avatar: string;
  mode: Mode;
  xp: number;
  streak: number;
  last_active: string;
  completed_nodes: string[];
  badges: string[];
  family_id?: string;
  is_premium: boolean;
  premium_entitlement_source?: 'app-store' | 'play-store';
  premium_product_id?: string;
  premium_expires_at?: string;
  created_at: string;
  bonus_awards?: string[];
};

type Family = {
  id: string;
  parent_name: string;
  parent_email: string;
  plan: 'free' | 'family';
  plan_started_at?: string;
  plan_expires_at?: string;
  created_at: string;
};

type Activity = {
  profile_id: string;
  date: string;
  xp_earned: number;
  nodes_completed: number;
  node_ids: string[];
};

type LocalDb = {
  version: 2;
  profiles: Record<string, Profile>;
  families: Record<string, Family>;
  activities: Activity[];
  chats: Record<string, { role: 'user' | 'assistant'; content: string; timestamp: string }[]>;
};

const DB_KEY = 'scripture_games_local_db_v2';
const CORRUPT_BACKUP_KEY = 'scripture_games_local_db_corrupt_backup';
const EMPTY_DB: LocalDb = { version: 2, profiles: {}, families: {}, activities: [], chats: {} };
let localApiQueue: Promise<void> = Promise.resolve();

function cloneDb(): LocalDb {
  return JSON.parse(JSON.stringify(EMPTY_DB));
}

function normalizeLegacyPremiumProfile(profile: Profile): Profile {
  if (hasValidatedPremiumEntitlement(profile)) return profile;
  const { premium_entitlement_source: _source, premium_product_id: _product, premium_expires_at: _expires, ...rest } = profile;
  return { ...rest, is_premium: false };
}

async function readDb(): Promise<LocalDb> {
  const raw = await AsyncStorage.getItem(DB_KEY);
  if (!raw) return cloneDb();
  try {
    const parsed = JSON.parse(raw) as Partial<LocalDb>;
    const rawProfiles = parsed.profiles || {};
    const profiles = Object.fromEntries(Object.entries(rawProfiles).map(([profileId, profile]) => [profileId, normalizeLegacyPremiumProfile(profile as Profile)]));
    const normalized: LocalDb = { version: 2, profiles, families: parsed.families || {}, activities: parsed.activities || [], chats: parsed.chats || {} };
    if (JSON.stringify(profiles) !== JSON.stringify(rawProfiles)) await AsyncStorage.setItem(DB_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    await AsyncStorage.setItem(CORRUPT_BACKUP_KEY, raw).catch(() => undefined);
    return cloneDb();
  }
}

function serializeLocalCall<T>(operation: () => Promise<T>): Promise<T> {
  const task = localApiQueue.then(operation);
  localApiQueue = task.then(() => undefined, () => undefined);
  return task;
}

async function writeDb(db: LocalDb): Promise<void> {
  await AsyncStorage.setItem(DB_KEY, JSON.stringify(db));
}

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function localDateKey(value = new Date()): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function today(): string {
  return localDateKey();
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateKey(d);
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuestion(question: QuizQuestion) {
  const choices = shuffle(question.options.map((option, originalIndex) => ({ option, originalIndex })));
  return {
    ...question,
    options: choices.map((choice) => choice.option),
    answer: choices.findIndex((choice) => choice.originalIndex === question.answer),
  };
}

function safeName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  return trimmed.slice(0, 30) || 'Player';
}

const DEVOTIONALS = [
  {
    verse: 'Be still, and know that I am God.',
    reference: 'Psalm 46:10 (WEB)',
    title: 'A Quiet Place With God',
    kids: 'Busy days can feel loud. Take one slow breath and remember that God is near. You do not have to solve everything at once; you can take the next kind and faithful step.',
    adult: 'Stillness is not denial of the day’s demands. It is a deliberate return to the truth that God remains God when our minds race. Pause long enough to let trust become louder than urgency, then carry that steadiness into the next faithful action.',
    prayerKids: 'God, help me slow down, remember You are near, and choose what is good today. Amen.',
    prayerAdult: 'God, quiet the noise within me. Reorder my attention, deepen my trust, and guide my next faithful step. Amen.',
  },
  {
    verse: 'We love him, because he first loved us.',
    reference: '1 John 4:19 (WEB)',
    title: 'Love Starts With God',
    kids: 'God loved you first. That means you can share kindness without waiting for somebody else to go first. A gentle word, a helping hand, or an honest apology can carry God’s love into the room.',
    adult: 'Christian love is response before it is achievement. We receive a love we did not earn, and that grace frees us to move toward others without keeping score. Let one concrete act today become an echo of the love already given to you.',
    prayerKids: 'God, thank You for loving me first. Help me show Your love in one real way today. Amen.',
    prayerAdult: 'God, let the love I have received become patient, courageous love offered to others today. Amen.',
  },
  {
    verse: 'Yahweh is my shepherd; I shall lack nothing.',
    reference: 'Psalm 23:1 (WEB)',
    title: 'Led, Not Lost',
    kids: 'A good shepherd stays close, guides the sheep, and protects them. When you feel unsure, ask God for wisdom and talk with a trusted grown-up. You do not have to walk hard roads alone.',
    adult: 'Psalm 23 does not promise a road without valleys; it promises a Shepherd within them. Guidance often comes one step at a time through Scripture, prayer, wise community, and patient obedience. Today, resist the demand to see the whole path before taking the next step.',
    prayerKids: 'God, guide me today and help me listen to wise people who care about me. Amen.',
    prayerAdult: 'Shepherd of my soul, guide my decisions, steady my fear, and keep me attentive to Your presence. Amen.',
  },
  {
    verse: 'Trust in Yahweh with all your heart, and don’t lean on your own understanding.',
    reference: 'Proverbs 3:5 (WEB)',
    title: 'Trust Beyond What You Can See',
    kids: 'Sometimes we do not understand why something happened. Trust does not mean pretending questions are easy. It means bringing those questions to God and choosing honesty, patience, and wisdom while we wait.',
    adult: 'Trust is not intellectual laziness; it is the refusal to make our limited perspective the final authority. Bring your questions honestly, seek counsel, examine your choices, and remain open to God’s correction. Humility can become a doorway to clearer direction.',
    prayerKids: 'God, I give You my questions. Help me trust You and make a wise choice today. Amen.',
    prayerAdult: 'God, meet me in what I cannot yet understand. Give me humility, discernment, and courage to obey what is clear. Amen.',
  },
];

function devotional(mode: Mode) {
  const dayNumber = Math.floor(new Date().setHours(0, 0, 0, 0) / 86_400_000);
  const index = dayNumber % DEVOTIONALS.length;
  const item = DEVOTIONALS[index];
  return {
    key: `${today()}-${mode}`,
    date: today(),
    mode,
    verse: item.verse,
    reference: item.reference,
    title: item.title,
    reflection: mode === 'kids' ? item.kids : item.adult,
    prayer: mode === 'kids' ? item.prayerKids : item.prayerAdult,
  };
}

function lumiReply(message: string, mode: Mode): string {
  const m = message.toLowerCase();
  const kid = mode === 'kids';

  if (/\b(suicid(?:e|al)?|kill myself|hurt myself|self[- ]harm|want to die|abuse|abused|someone is hurting me|unsafe at home|scared at home|immediate danger)\b/.test(m)) {
    return kid
      ? 'I’m really glad you said something. Please tell a trusted grown-up who is with you right now—like a parent, teacher, counselor, pastor, or emergency helper. You deserve real, nearby help, and this chat cannot keep you safe by itself.'
      : 'I’m glad you spoke up. Please contact a trusted person or local emergency/crisis support now, especially if you may be in immediate danger. This Bible companion cannot provide emergency care or replace a licensed professional.';
  }
  if (m.includes('noah')) {
    return kid
      ? 'Noah trusted God and built the ark even when the task was huge. Genesis 6–9 shows both God’s justice and His mercy, and the rainbow becomes a sign of covenant hope. 🌈'
      : 'Noah’s story in Genesis 6–9 holds judgment and mercy together. Noah’s obedience preserves life, while the covenant and rainbow show God’s commitment to creation even after human failure.';
  }
  if (m.includes('prayer')) {
    return kid
      ? 'Prayer is talking honestly with God—thanking Him, asking for help, saying sorry, and listening quietly. You do not need fancy words; start with, “God, here is what is on my heart.” 🙏'
      : 'Prayer is honest communion with God: adoration, confession, gratitude, petition, and attentive silence. Jesus’ model in Matthew 6:9–13 gives prayer both intimacy and direction.';
  }
  if (m.includes('john 3:16')) {
    return kid
      ? 'John 3:16 says God’s love moved Him to give His Son so people who trust in Jesus can have eternal life. It is a big promise: God’s rescue begins with love. 💛'
      : 'John 3:16 gathers the gospel into one sentence: divine love takes costly action in the giving of the Son, and faith receives life rather than earning it. The surrounding passage also frames this gift as God’s rescue for a world already in darkness.';
  }
  if (m.includes('grace')) {
    return kid
      ? 'Grace is God giving us love and help that we could never earn. We still tell the truth and make things right, but we do it knowing God welcomes us and helps us grow.'
      : 'Grace is God’s unearned favor and transforming presence, not permission to remain unchanged. Ephesians 2:8–10 holds both truths together: salvation is gift, and the saved life is shaped toward good works.';
  }
  if (m.includes('sermon on the mount')) {
    return kid
      ? 'In Matthew 5–7, Jesus teaches about God’s kingdom—being humble, making peace, loving enemies, praying honestly, and building life on His words. It is like a map for a heart that follows Jesus.'
      : 'The Sermon on the Mount in Matthew 5–7 describes the character and practices of God’s kingdom. Jesus moves beneath outward rule-keeping to the heart, calling disciples toward reconciliation, enemy-love, sincere devotion, trust, and obedient wisdom.';
  }
  if (m.includes('read the bible') || m.includes('bible daily')) {
    return kid
      ? 'Start small: read one short story or five verses, ask “What does this show me about God?”, and choose one thing to remember. A little every day grows strong roots. 🌱'
      : 'Choose a sustainable rhythm: a short passage, careful observation, one honest question, and one concrete response. Consistency matters more than volume; begin with a Gospel such as Mark or John and keep brief notes.';
  }
  if (m.includes('jesus')) {
    return kid
      ? 'Jesus is God’s Son, the promised Savior, and the center of the New Testament. He welcomed people, taught God’s truth, gave His life, and rose again. You can begin with the Gospel of Mark to learn His story.'
      : 'The New Testament presents Jesus as Messiah, Son of God, crucified and risen Lord. His teaching, table fellowship, healings, death, and resurrection reveal God’s kingdom and call people to faith, repentance, and discipleship.';
  }
  return kid
    ? 'That is a thoughtful question. Let’s look for what Scripture clearly says, stay humble about what it does not say, and ask a trusted grown-up when the question is important. Try asking me about a Bible person, story, verse, or prayer. 📖'
    : 'That is a worthwhile question. A careful answer should begin with the relevant passage, its context, and humility about points Scripture does not settle directly. Try naming a verse, Bible character, doctrine, or life situation you want to explore.';
}

const unsafeLocalApi = {
  async createProfile(name: string, avatar: string, mode: Mode, family_id?: string) {
    const db = await readDb();
    const now = new Date().toISOString();
    const profile: Profile = {
      id: id('profile'),
      name: safeName(name),
      avatar,
      mode,
      xp: 0,
      streak: 0,
      last_active: today(),
      completed_nodes: [],
      badges: [],
      family_id,
      is_premium: false,
      created_at: now,
      bonus_awards: [],
    };
    db.profiles[profile.id] = profile;
    await writeDb(db);
    return profile;
  },

  async getProfile(profileId: string) {
    const db = await readDb();
    const profile = db.profiles[profileId];
    if (!profile) throw new Error('Profile not found');
    return profile;
  },

  async listProfiles() {
    const db = await readDb();
    return {
      profiles: Object.values(db.profiles).sort((a, b) =>
        a.created_at.localeCompare(b.created_at),
      ),
    };
  },

  async updateProfile(profileId: string, data: Partial<Profile>) {
    const db = await readDb();
    const current = db.profiles[profileId];
    if (!current) throw new Error('Profile not found');
    const allowed = {
      name: data.name ? safeName(data.name) : current.name,
      avatar: data.avatar ?? current.avatar,
      mode: data.mode ?? current.mode,
    };
    const updated = { ...current, ...allowed };
    db.profiles[profileId] = updated;
    await writeDb(db);
    return updated;
  },

  async completeNode(profileId: string, nodeId: string, correctCount: number, totalCount: number) {
    const db = await readDb();
    const profile = db.profiles[profileId];
    if (!profile) throw new Error('Profile not found');
    const node = JOURNEY_NODES.find((n) => n.id === nodeId);
    if (!node) throw new Error('Journey node not found');

    const firstCompletion = !profile.completed_nodes.includes(nodeId);
    const boundedCorrect = Math.max(0, Math.min(correctCount, Math.max(0, totalCount)));
    const accuracy = totalCount > 0 ? boundedCorrect / totalCount : 1;
    const earned = firstCompletion ? Math.round(node.xp_reward * Math.max(0.5, accuracy)) : 0;
    const completed = firstCompletion ? [...profile.completed_nodes, nodeId] : profile.completed_nodes;
    const badges = [...profile.badges];
    if (completed.length >= 1 && !badges.includes('first_step')) badges.push('first_step');
    if (completed.length >= 5 && !badges.includes('explorer')) badges.push('explorer');
    if (completed.length >= JOURNEY_NODES.length && !badges.includes('champion')) badges.push('champion');

    let streak = profile.streak;
    if (profile.last_active === today()) streak = Math.max(1, streak);
    else if (profile.last_active === yesterday()) streak += 1;
    else streak = 1;
    if (streak >= 7 && !badges.includes('week_warrior')) badges.push('week_warrior');

    const updated: Profile = {
      ...profile,
      xp: profile.xp + earned,
      streak,
      last_active: today(),
      completed_nodes: completed,
      badges,
    };
    db.profiles[profileId] = updated;

    let activity = db.activities.find((a) => a.profile_id === profileId && a.date === today());
    if (!activity) {
      activity = { profile_id: profileId, date: today(), xp_earned: 0, nodes_completed: 0, node_ids: [] };
      db.activities.push(activity);
    }
    activity.xp_earned += earned;
    if (firstCompletion) activity.nodes_completed += 1;
    if (!activity.node_ids.includes(nodeId)) activity.node_ids.push(nodeId);
    await writeDb(db);
    return updated;
  },

  async awardBonus(profileId: string, awardId: string, xp: number, badge?: string) {
    const db = await readDb();
    const profile = db.profiles[profileId];
    if (!profile) throw new Error('Profile not found');
    const awards = profile.bonus_awards || [];
    if (awards.includes(awardId)) return { profile, firstAward: false };
    const badges = [...profile.badges];
    if (badge && !badges.includes(badge)) badges.push(badge);
    let streak = profile.streak;
    if (profile.last_active === today()) streak = Math.max(1, streak);
    else if (profile.last_active === yesterday()) streak += 1;
    else streak = 1;
    if (streak >= 7 && !badges.includes('week_warrior')) badges.push('week_warrior');
    const updated: Profile = {
      ...profile,
      xp: profile.xp + Math.max(0, Math.round(xp)),
      streak,
      last_active: today(),
      badges,
      bonus_awards: [...awards, awardId],
    };
    db.profiles[profileId] = updated;
    let activity = db.activities.find((a) => a.profile_id === profileId && a.date === today());
    if (!activity) {
      activity = { profile_id: profileId, date: today(), xp_earned: 0, nodes_completed: 0, node_ids: [] };
      db.activities.push(activity);
    }
    activity.xp_earned += Math.max(0, Math.round(xp));
    await writeDb(db);
    return { profile: updated, firstAward: true };
  },

  async getRecentActivity(profileId: string, days = 7) {
    const db = await readDb();
    const floor = new Date();
    floor.setDate(floor.getDate() - Math.max(1, days) + 1);
    const start = localDateKey(floor);
    return {
      activities: db.activities
        .filter((activity) => activity.profile_id === profileId && activity.date >= start)
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  },

  async getJourney() {
    return { nodes: [...JOURNEY_NODES] };
  },

  async getQuiz(topic: string, limit = 5) {
    const all = QUIZ_QUESTIONS as unknown as Record<string, readonly QuizQuestion[]>;
    const pool = all[topic] || all.general;
    const questions = shuffle(pool)
      .slice(0, Math.max(1, limit))
      .sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1))
      .map(shuffleQuestion);
    return { topic, questions };
  },

  async getVerses() {
    return { verses: [...VERSES] };
  },

  async getStories() {
    return {
      stories: STORIES.map(({ id: storyId, title, summary, image, premium, character_emoji }) => ({
        id: storyId,
        title,
        summary,
        image,
        premium,
        character_emoji,
      })),
    };
  },

  async getStory(storyId: string, mode: Mode) {
    const story = STORIES.find((s) => s.id === storyId);
    if (!story) throw new Error('Story not found');
    return {
      id: story.id,
      title: story.title,
      image: story.image,
      summary: story.summary,
      premium: story.premium,
      character_emoji: story.character_emoji,
      text: mode === 'kids' ? story.kids_text : story.adult_text,
    };
  },

  async getPuzzles() {
    return { puzzles: [...PUZZLES] };
  },

  async getDevotional(mode: Mode) {
    return devotional(mode);
  },

  async chat(profileId: string, sessionId: string, message: string, mode: Mode) {
    const db = await readDb();
    const list = db.chats[sessionId] || [];
    const now = new Date().toISOString();
    list.push({ role: 'user', content: message.slice(0, 1000), timestamp: now });
    const reply = lumiReply(message, mode);
    list.push({ role: 'assistant', content: reply, timestamp: new Date().toISOString() });
    db.chats[sessionId] = list.slice(-40);
    await writeDb(db);
    return { reply };
  },

  async chatHistory(sessionId: string) {
    const db = await readDb();
    return { messages: db.chats[sessionId] || [] };
  },

  async clearChat(sessionId: string) {
    const db = await readDb();
    delete db.chats[sessionId];
    await writeDb(db);
    return { ok: true };
  },

  async leaderboard(limit = 20) {
    const db = await readDb();
    const profiles = Object.values(db.profiles).map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      xp: p.xp,
      streak: p.streak,
      badges: p.badges,
    }));
    return { leaderboard: profiles.sort((a, b) => b.xp - a.xp).slice(0, limit) };
  },

  async createFamily(parentName: string, parentEmail: string) {
    const db = await readDb();
    const now = new Date().toISOString();
    const family: Family = {
      id: id('family'),
      parent_name: safeName(parentName),
      parent_email: parentEmail.trim().slice(0, 120),
      plan: 'family',
      plan_started_at: now,
      created_at: now,
    };
    db.families[family.id] = family;
    await writeDb(db);
    return family;
  },

  async getFamily(familyId: string) {
    const db = await readDb();
    const family = db.families[familyId];
    if (!family) throw new Error('Family not found');
    return family;
  },

  async subscribeFamily(familyId: string) {
    const db = await readDb();
    const family = db.families[familyId];
    if (!family) throw new Error('Family not found');
    const updated: Family = { ...family, plan: 'family', plan_started_at: family.plan_started_at || new Date().toISOString() };
    db.families[familyId] = updated;
    await writeDb(db);
    return updated;
  },

  async addChild(familyId: string, name: string, avatar: string, mode: Mode) {
    const db = await readDb();
    if (!db.families[familyId]) throw new Error('Family not found');
    const profile: Profile = {
      id: id('profile'),
      name: safeName(name),
      avatar,
      mode,
      xp: 0,
      streak: 0,
      last_active: today(),
      completed_nodes: [],
      badges: [],
      family_id: familyId,
      is_premium: true,
      created_at: new Date().toISOString(),
      bonus_awards: [],
    };
    db.profiles[profile.id] = profile;
    await writeDb(db);
    return profile;
  },

  async familyDashboard(familyId: string) {
    const db = await readDb();
    const family = db.families[familyId];
    if (!family) throw new Error('Family not found');
    const weekStartDate = new Date();
    weekStartDate.setDate(weekStartDate.getDate() - 6);
    const weekStart = localDateKey(weekStartDate);
    const children = Object.values(db.profiles)
      .filter((p) => p.family_id === familyId)
      .map((p) => {
        const activities = db.activities.filter((a) => a.profile_id === p.id && a.date >= weekStart);
        return {
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          mode: p.mode,
          xp: p.xp,
          streak: p.streak,
          badges: p.badges,
          total_completed: p.completed_nodes.length,
          weekly_xp: activities.reduce((sum, a) => sum + a.xp_earned, 0),
          weekly_active_days: new Set(activities.map((a) => a.date)).size,
          weekly_nodes: activities.flatMap((a) => a.node_ids),
          activities,
        };
      });
    return { family, children, week_start: weekStart };
  },

  async upgradePremium(profileId: string) {
    const db = await readDb();
    const profile = db.profiles[profileId];
    if (!profile) throw new Error('Profile not found');
    const updated = { ...profile, is_premium: true, premium_expires_at: undefined };
    db.profiles[profileId] = updated;
    await writeDb(db);
    return updated;
  },

  async listTopics() {
    const premium = new Set(['prophets', 'sermon', 'psalms']);
    return {
      topics: Object.entries(QUIZ_QUESTIONS).map(([topic, questions]) => ({
        id: topic,
        count: questions.length,
        premium: premium.has(topic),
      })),
    };
  },
};

const MUTATING_LOCAL_METHODS = new Set<keyof typeof unsafeLocalApi>([
  'createProfile',
  'updateProfile',
  'completeNode',
  'awardBonus',
  'chat',
  'clearChat',
  'createFamily',
  'subscribeFamily',
  'addChild',
  'upgradePremium',
]);

export const localApi = new Proxy(unsafeLocalApi, {
  get(target, property, receiver) {
    const value = Reflect.get(target, property, receiver);
    if (typeof value !== 'function' || typeof property !== 'string') return value;
    const invoke = (...args: unknown[]) => value(...args);
    if (MUTATING_LOCAL_METHODS.has(property as keyof typeof unsafeLocalApi)) {
      return (...args: unknown[]) => serializeLocalCall(() => invoke(...args));
    }
    return (...args: unknown[]) => localApiQueue.then(() => invoke(...args));
  },
}) as typeof unsafeLocalApi;

