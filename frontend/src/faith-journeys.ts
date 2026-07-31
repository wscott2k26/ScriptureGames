import AsyncStorage from '@react-native-async-storage/async-storage';

export type FaithJourneyDay = {
  title: string;
  reference: string;
  verse: string;
  reflection: string;
  prayer: string;
  action: string;
  journalPrompt: string;
};

export type FaithJourney = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: 'brand' | 'coral' | 'success' | 'info';
  days: FaithJourneyDay[];
};

export type FaithJourneyProgress = {
  completedDays: number[];
  journals: Record<string, string>;
  startedAt: string;
  updatedAt: string;
};

type JourneyStore = Record<string, Record<string, FaithJourneyProgress>>;

const STORAGE_KEY = 'scripture_games_faith_journeys_v1';

export const FAITH_JOURNEYS: FaithJourney[] = [
  {
    id: 'peace-over-anxiety',
    title: 'Peace Over Anxiety',
    subtitle: 'Seven days of steadying truth',
    description: 'A gentle Scripture journey for slowing racing thoughts, naming fear honestly, and practicing trust one day at a time.',
    icon: '🕊️',
    accent: 'info',
    days: [
      {
        title: 'God Is Near',
        reference: 'Psalm 46:1 (WEB)',
        verse: 'God is our refuge and strength, a very present help in trouble.',
        reflection: 'Fear often tells us we are alone with the problem. Scripture begins somewhere different: God is present before the situation is solved. Today is not about forcing calm. It is about locating yourself inside God’s nearness.',
        prayer: 'God, meet me in what feels heavy. Help me remember that I am not facing this moment alone. Amen.',
        action: 'Take five slow breaths. With each exhale, quietly say, “You are near.”',
        journalPrompt: 'What feels most urgent, and what changes when you remember God is present?',
      },
      {
        title: 'Name the Weight',
        reference: '1 Peter 5:7 (WEB)',
        verse: 'Casting all your worries on him, because he cares for you.',
        reflection: 'Casting a worry is not pretending it does not exist. It is naming the burden and refusing to carry it as though everything depends on you. God’s care is personal, not theoretical.',
        prayer: 'God, I give You the worry I keep replaying. Hold what I cannot control and guide what I can do. Amen.',
        action: 'Write one worry in a sentence, then write one next step that is actually yours to take.',
        journalPrompt: 'Which part belongs to you, and which part must be released?',
      },
      {
        title: 'Enough for Today',
        reference: 'Matthew 6:34 (WEB)',
        verse: 'Therefore don’t be anxious for tomorrow, for tomorrow will be anxious for itself. Each day’s own evil is sufficient.',
        reflection: 'Anxiety tries to make you live ten tomorrows at once. Jesus returns attention to today. Faithfulness usually looks smaller than fear predicts: one conversation, one meal, one decision, one hour.',
        prayer: 'Jesus, bring my attention back to today. Give me grace for this day instead of imagined strength for every future day. Amen.',
        action: 'Choose the single most important faithful action for today and let the rest wait.',
        journalPrompt: 'What future scenario have you been living before it arrives?',
      },
      {
        title: 'A Guarded Mind',
        reference: 'Philippians 4:6–7 (WEB)',
        verse: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.',
        reflection: 'Prayer does not shame the anxious mind; it gives it somewhere to go. Gratitude does not erase pain, but it keeps pain from becoming the only truth in view.',
        prayer: 'God, receive my requests and guard my heart and mind with Your peace. Help me notice grace without denying difficulty. Amen.',
        action: 'Name one request, one person who can help, and three small gifts from today.',
        journalPrompt: 'What request do you need to say plainly to God?',
      },
      {
        title: 'Strength for the Next Step',
        reference: 'Isaiah 41:10 (WEB)',
        verse: 'Don’t you be afraid, for I am with you. Don’t be dismayed, for I am your God. I will strengthen you.',
        reflection: 'Courage is not the absence of physical fear. It is moving with God while fear is still speaking. You do not need strength for the whole road—only for the next faithful step.',
        prayer: 'God, strengthen me for the next step. Keep fear from deciding for me. Amen.',
        action: 'Do one small task you have delayed because anxiety made it feel larger than it is.',
        journalPrompt: 'What would a courageous next step look like at a manageable size?',
      },
      {
        title: 'Rest Is Faithful',
        reference: 'Mark 6:31 (WEB)',
        verse: 'Come apart into a deserted place, and rest awhile.',
        reflection: 'Jesus did not treat human limits as failure. Rest can be an act of trust: the world continues while you sleep, breathe, eat, and receive care.',
        prayer: 'Jesus, teach me to receive rest without guilt. Restore my body, attention, and hope. Amen.',
        action: 'Create a twenty-minute quiet window without news, work, or scrolling.',
        journalPrompt: 'What makes rest feel unsafe or undeserved to you?',
      },
      {
        title: 'Walk in Peace',
        reference: 'John 14:27 (WEB)',
        verse: 'Peace I leave with you. My peace I give to you; not as the world gives, I give to you.',
        reflection: 'Christ’s peace is not dependent on perfect circumstances. It is a practiced return to His presence, truth, and companionship. The journey continues, but you now carry a rhythm for returning.',
        prayer: 'Jesus, let Your peace become the place I return to. Lead me in wisdom, community, and steady trust. Amen.',
        action: 'Build a personal three-step peace practice using prayer, a trusted person, and one grounding action.',
        journalPrompt: 'Which practice from this week will you continue?',
      },
    ],
  },
  {
    id: 'broken-pieces',
    title: 'Beautiful Broken Pieces',
    subtitle: 'Seven days of healing and rebuilding',
    description: 'For seasons of grief, disappointment, heartbreak, or failure—without rushing pain or pretending every wound is already healed.',
    icon: '🪴',
    accent: 'coral',
    days: [
      {
        title: 'God Meets the Brokenhearted',
        reference: 'Psalm 34:18 (WEB)',
        verse: 'Yahweh is near to those who have a broken heart, and saves those who have a crushed spirit.',
        reflection: 'Scripture does not call a broken heart weak. It names God’s nearness to it. Healing begins with permission to tell the truth about what hurts.',
        prayer: 'God, meet me in the part of this story that still hurts. Keep me from hiding from You or myself. Amen.',
        action: 'Name the loss without minimizing it or explaining it away.',
        journalPrompt: 'What exactly are you grieving?',
      },
      {
        title: 'Lament Is Prayer',
        reference: 'Psalm 13:1 (WEB)',
        verse: 'How long, Yahweh? Will you forget me forever? How long will you hide your face from me?',
        reflection: 'Biblical faith makes room for protest, confusion, and unanswered questions. Lament is not abandoning God; it is bringing pain into the relationship.',
        prayer: 'God, here is what I do not understand and what I wish had been different. Stay with me in the unanswered place. Amen.',
        action: 'Write an honest four-line lament: what happened, how it feels, what you need, and what you still hope.',
        journalPrompt: 'What question have you been afraid to say to God?',
      },
      {
        title: 'No Shame in the Ruins',
        reference: 'Romans 8:1 (WEB)',
        verse: 'There is therefore now no condemnation to those who are in Christ Jesus.',
        reflection: 'Failure and loss often attract shame: “This proves something is wrong with me.” Grace separates truthful responsibility from crushing condemnation.',
        prayer: 'Jesus, show me where conviction leads toward repair and where shame only keeps me hidden. Amen.',
        action: 'Replace one condemning sentence with a truthful, grace-filled sentence.',
        journalPrompt: 'What accusation do you keep repeating against yourself?',
      },
      {
        title: 'Small Beginnings Matter',
        reference: 'Zechariah 4:10 (WEB)',
        verse: 'Indeed, who despises the day of small things?',
        reflection: 'Rebuilding rarely begins with a dramatic breakthrough. It begins with ordinary acts repeated: getting up, asking for help, making one call, keeping one promise.',
        prayer: 'God, help me honor small beginnings and stop measuring healing only by dramatic change. Amen.',
        action: 'Choose one ten-minute rebuilding action and complete it today.',
        journalPrompt: 'Which small beginning deserves more respect than you have given it?',
      },
      {
        title: 'Receive Help',
        reference: 'Galatians 6:2 (WEB)',
        verse: 'Bear one another’s burdens, and so fulfill the law of Christ.',
        reflection: 'Isolation can feel safer after disappointment, but healing is often carried through trustworthy people. Receiving help is not becoming a burden; it is allowing community to be real.',
        prayer: 'God, give me courage to reach toward safe people and wisdom about whom to trust. Amen.',
        action: 'Tell one trusted person what kind of support would help this week.',
        journalPrompt: 'What support do you need but have not clearly requested?',
      },
      {
        title: 'A New Thing Can Grow',
        reference: 'Isaiah 43:19 (WEB)',
        verse: 'Behold, I will do a new thing. It springs out now. Don’t you know it?',
        reflection: 'A new thing does not erase the old story. God can grow life around scars, wisdom from pain, and compassion where certainty once lived.',
        prayer: 'God, open my eyes to the life beginning quietly around me. Amen.',
        action: 'List three signs—however small—that life is still moving.',
        journalPrompt: 'Where might something new already be growing?',
      },
      {
        title: 'Carry the Story Differently',
        reference: '2 Corinthians 4:8–9 (WEB)',
        verse: 'We are pressed on every side, yet not crushed; perplexed, yet not to despair.',
        reflection: 'Healing does not require forgetting. It means the story no longer owns every decision. You can carry what happened with tenderness, boundaries, wisdom, and renewed hope.',
        prayer: 'God, help me carry this story without letting it crush the future. Make me wise, softhearted, and strong. Amen.',
        action: 'Write one boundary, one hope, and one practice you will carry forward.',
        journalPrompt: 'How do you want this experience to shape you without defining you?',
      },
    ],
  },
  {
    id: 'purpose-and-work',
    title: 'Purpose in the Work',
    subtitle: 'Seven days for calling, career, and service',
    description: 'A Scripture path for work decisions, career uncertainty, discipline, integrity, and remembering that purpose is larger than a job title.',
    icon: '🛠️',
    accent: 'brand',
    days: [
      {
        title: 'Made to Cultivate',
        reference: 'Genesis 2:15 (WEB)',
        verse: 'Yahweh God took the man, and put him into the garden of Eden to cultivate and keep it.',
        reflection: 'Work appears in Scripture before the fall. At its best, work cultivates, protects, orders, creates, and serves. Your job may be imperfect, but your capacity to contribute carries dignity.',
        prayer: 'God, show me what I am called to cultivate and protect in this season. Amen.',
        action: 'Name the people or systems that are better when you do your work well.',
        journalPrompt: 'What does your work cultivate beyond a paycheck?',
      },
      {
        title: 'Faithful With What Is Here',
        reference: 'Luke 16:10 (WEB)',
        verse: 'He who is faithful in a very little is faithful also in much.',
        reflection: 'Ambition can make the current assignment feel beneath us. Faithfulness trains character before opportunity arrives. Excellence in small things is not wasted.',
        prayer: 'God, help me be faithful in today’s assignment while I prepare for tomorrow’s opportunity. Amen.',
        action: 'Finish one overlooked task with unusual care.',
        journalPrompt: 'Where has frustration lowered your standard?',
      },
      {
        title: 'Ask for Wisdom',
        reference: 'James 1:5 (WEB)',
        verse: 'But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach.',
        reflection: 'Career decisions are rarely solved by impulse alone. Wisdom combines prayer, facts, counsel, timing, and honest attention to motives.',
        prayer: 'God, give me wisdom that is humble, practical, and brave. Amen.',
        action: 'Write the decision, three facts, two trusted advisers, and one deadline.',
        journalPrompt: 'What information or counsel are you missing?',
      },
      {
        title: 'Work Without Worshiping Work',
        reference: 'Mark 8:36 (WEB)',
        verse: 'For what does it profit a man to gain the whole world, and forfeit his life?',
        reflection: 'Achievement becomes dangerous when it asks for identity, health, family, or integrity as payment. Work is a place of service, not a god.',
        prayer: 'Jesus, keep success from becoming my master. Restore healthy limits and right priorities. Amen.',
        action: 'Choose one boundary that protects health, family, worship, or rest.',
        journalPrompt: 'What has work been asking you to sacrifice?',
      },
      {
        title: 'Integrity in Private',
        reference: 'Proverbs 10:9 (WEB)',
        verse: 'He who walks blamelessly walks surely, but he who perverts his ways will be found out.',
        reflection: 'Integrity reduces the distance between the person people see and the person you are when no one is watching. That wholeness creates durable confidence.',
        prayer: 'God, make me the same person in private and public. Give me courage to correct what is compromised. Amen.',
        action: 'Repair one small integrity gap before it grows.',
        journalPrompt: 'Where do your values and habits currently disagree?',
      },
      {
        title: 'Prepare With Courage',
        reference: 'Proverbs 21:5 (WEB)',
        verse: 'The plans of the diligent surely lead to profit; and everyone who is hasty surely rushes to poverty.',
        reflection: 'Faith does not oppose planning. Diligence turns hope into preparation: learning, practicing, saving, applying, and following through.',
        prayer: 'God, replace vague wishing with patient preparation. Amen.',
        action: 'Spend thirty focused minutes building one skill or completing one application step.',
        journalPrompt: 'What preparation would make you ready when opportunity appears?',
      },
      {
        title: 'Purpose Beyond Position',
        reference: 'Colossians 3:23 (WEB)',
        verse: 'And whatever you do, work heartily, as for the Lord, and not for men.',
        reflection: 'A title can change overnight. Purpose is more durable: love God, serve people, practice truth, develop gifts, and leave places better than you found them.',
        prayer: 'God, root my purpose deeper than position or applause. Let my work become honest service. Amen.',
        action: 'Write a one-sentence purpose statement that still works if your job title changes.',
        journalPrompt: 'What part of your calling cannot be taken away by a layoff or promotion?',
      },
    ],
  },
  {
    id: 'faith-at-home',
    title: 'Faith at Home',
    subtitle: 'Seven days for families and close relationships',
    description: 'Simple practices for grace-filled conversation, forgiveness, prayer, boundaries, and making home a place where faith can be lived honestly.',
    icon: '🏠',
    accent: 'success',
    days: [
      {
        title: 'Begin With Listening',
        reference: 'James 1:19 (WEB)',
        verse: 'Let every man be swift to hear, slow to speak, and slow to anger.',
        reflection: 'Homes become safer when people feel heard before they are corrected. Listening does not mean agreeing with everything; it means understanding before responding.',
        prayer: 'God, slow my reactions and make me attentive to the people I love. Amen.',
        action: 'Ask one person, “What has been heavy or good for you lately?” and do not interrupt.',
        journalPrompt: 'Who in your home may need to feel heard?',
      },
      {
        title: 'Speak Life',
        reference: 'Proverbs 16:24 (WEB)',
        verse: 'Pleasant words are a honeycomb, sweet to the soul, and health to the bones.',
        reflection: 'Encouragement is not flattery. It names what is true and good so people are not forced to live only under correction.',
        prayer: 'God, make my words truthful, kind, and strengthening. Amen.',
        action: 'Give each person in your home one specific encouragement.',
        journalPrompt: 'What good quality have you noticed but not spoken aloud?',
      },
      {
        title: 'Repair Quickly',
        reference: 'Ephesians 4:26 (WEB)',
        verse: 'Be angry, and don’t sin. Don’t let the sun go down on your wrath.',
        reflection: 'Conflict is not proof that a relationship is doomed. Refusing repair is more dangerous. A sincere apology names the harm without defending it.',
        prayer: 'God, give me humility to repair what my words or actions damaged. Amen.',
        action: 'Use this sentence where needed: “I was wrong when I ____. I am sorry. How can I repair it?”',
        journalPrompt: 'Is there a repair conversation you have delayed?',
      },
      {
        title: 'Practice Forgiveness and Boundaries',
        reference: 'Colossians 3:13 (WEB)',
        verse: 'Forgiving each other, if any man has a complaint against any; even as Christ forgave you, so you also do.',
        reflection: 'Forgiveness releases revenge; it does not require pretending harm is harmless. Wise boundaries and forgiveness can exist together.',
        prayer: 'Jesus, free me from revenge and give me wisdom about trust, safety, and boundaries. Amen.',
        action: 'Name one resentment to release and one boundary that protects what is healthy.',
        journalPrompt: 'Where have you confused forgiveness with unlimited access?',
      },
      {
        title: 'Pray Simply Together',
        reference: 'Matthew 18:20 (WEB)',
        verse: 'For where two or three are gathered together in my name, there I am in the middle of them.',
        reflection: 'Family prayer does not need to be long or impressive. A minute of gratitude, honesty, and blessing can build a durable rhythm.',
        prayer: 'God, meet us in simple, honest prayer and teach us to carry one another. Amen.',
        action: 'Pray together for one minute: one thank-you, one need, and one blessing.',
        journalPrompt: 'What would make shared prayer feel natural rather than forced?',
      },
      {
        title: 'Make Room for Joy',
        reference: 'Ecclesiastes 3:4 (WEB)',
        verse: 'A time to weep, and a time to laugh; a time to mourn, and a time to dance.',
        reflection: 'Healthy homes hold grief and joy. Play, laughter, music, and celebration are not distractions from faith; they are ways of receiving life together.',
        prayer: 'God, help us notice and create moments of joy without denying what is hard. Amen.',
        action: 'Plan one free or inexpensive moment of shared fun this week.',
        journalPrompt: 'What brings your people alive together?',
      },
      {
        title: 'Choose the Home You Are Building',
        reference: 'Joshua 24:15 (WEB)',
        verse: 'But as for me and my house, we will serve Yahweh.',
        reflection: 'A household is shaped by repeated choices, not one inspirational moment. Decide what your home will practice when pressure rises.',
        prayer: 'God, shape our home through truth, grace, courage, safety, and love. Amen.',
        action: 'Choose three household values and one weekly practice that makes each value visible.',
        journalPrompt: 'What do you want people to consistently feel and learn in your home?',
      },
    ],
  },
];

async function readStore(): Promise<JourneyStore> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as JourneyStore;
  } catch {
    return {};
  }
}

async function writeStore(store: JourneyStore): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getFaithJourney(id: string | undefined): FaithJourney | undefined {
  return FAITH_JOURNEYS.find((journey) => journey.id === id);
}

export async function loadFaithJourneyProgress(profileId: string): Promise<Record<string, FaithJourneyProgress>> {
  const store = await readStore();
  return store[profileId] || {};
}

export async function loadOneFaithJourneyProgress(profileId: string, journeyId: string): Promise<FaithJourneyProgress> {
  const all = await loadFaithJourneyProgress(profileId);
  return all[journeyId] || {
    completedDays: [],
    journals: {},
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function saveFaithJourneyDay(
  profileId: string,
  journeyId: string,
  dayIndex: number,
  completed: boolean,
  journal: string,
): Promise<FaithJourneyProgress> {
  const store = await readStore();
  const current = store[profileId]?.[journeyId] || {
    completedDays: [],
    journals: {},
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const completedDays = new Set(current.completedDays);
  if (completed) completedDays.add(dayIndex);
  else completedDays.delete(dayIndex);
  const next: FaithJourneyProgress = {
    ...current,
    completedDays: [...completedDays].sort((a, b) => a - b),
    journals: { ...current.journals, [String(dayIndex)]: journal.trim().slice(0, 3000) },
    updatedAt: new Date().toISOString(),
  };
  store[profileId] = { ...(store[profileId] || {}), [journeyId]: next };
  await writeStore(store);
  return next;
}
