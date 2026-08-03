export type TutorialStep = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  points: readonly string[];
};

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: 'welcome',
    eyebrow: 'WELCOME',
    title: 'Welcome to Scripture Games',
    description: 'This short optional tour explains the main sections so you always know where to go next.',
    icon: 'sparkles',
    points: [
      'Use the six tabs along the bottom to move through the app.',
      'Your progress is saved to the active player profile.',
      'You can leave this tutorial now and replay it from Settings anytime.',
    ],
  },
  {
    id: 'home',
    eyebrow: 'HOME TAB',
    title: 'Home',
    description: 'Home is your dashboard for quick games, Bible reading, Lumi, devotionals, and shortcuts.',
    icon: 'home',
    points: [
      'Resume your latest Genesis gate or other activity.',
      'See XP, Manna, Faith Rhythm, Grace Leaves, and achievements.',
      'Open family, league, tutorial, and Premium services.',
    ],
  },
  {
    id: 'journey',
    eyebrow: 'JOURNEY TAB',
    title: 'Journey',
    description: 'Journey is the separate book-by-book mastery path with trials, progress, seals, and Premium book seasons.',
    icon: 'map',
    points: [
      'Start with Genesis and continue in Bible order.',
      'Choose Any Book without damaging your recommended path.',
      'Genesis through Deuteronomy and Matthew through Acts are free. The remaining 56 Journey books require Premium.',
    ],
  },
  {
    id: 'games',
    eyebrow: 'GAMES TAB',
    title: 'Games',
    description: 'Games contains Scripture practice and challenges separate from the book-by-book Journey.',
    icon: 'game-controller',
    points: [
      'Practice Bible knowledge in shorter sessions.',
      'Earn progress through real answers rather than random tapping.',
      'Wrong answers explain the Scripture instead of shaming the player.',
    ],
  },
  {
    id: 'bible',
    eyebrow: 'BIBLE TAB',
    title: 'Bible',
    description: 'Bible is the full offline Scripture reader.',
    icon: 'book',
    points: [
      'Open all 66 books and 1,189 chapters.',
      'Read the passages referenced by Journey trials and Lumi.',
      'The bundled Bible remains available without an internet connection.',
    ],
  },
  {
    id: 'lumi',
    eyebrow: 'LUMI TAB',
    title: 'Lumi',
    description: 'Lumi is the private Bible companion for typed or spoken questions.',
    icon: 'chatbubbles',
    points: [
      'Type in the chat box and tap Send, or tap the microphone once.',
      'Voice replies are optional and can be turned off.',
      'Lumi may make mistakes and does not replace trusted professional or pastoral help.',
    ],
  },
  {
    id: 'settings',
    eyebrow: 'SETTINGS TAB',
    title: 'Settings',
    description: 'Settings controls the way Scripture Games looks, sounds, moves, and stores player data.',
    icon: 'settings',
    points: [
      'Choose a real peaceful photo background.',
      'Set Full, Gentle, Off, or System motion.',
      'Manage music, sound effects, haptics, cloud backup, privacy, and this tutorial.',
    ],
  },
  {
    id: 'premium',
    eyebrow: 'OPTIONAL UPGRADE',
    title: 'Premium',
    description: 'Premium clearly opens the remaining 56 Journey books and Premium peaceful-photo collection once a validated store entitlement exists.',
    icon: 'diamond',
    points: [
      'Free progress never silently unlocks Premium books.',
      'A lock labeled PREMIUM REQUIRED always leads to the Premium screen.',
      'Restore Purchase checks for a real validated entitlement; it never creates a fake local unlock.',
    ],
  },
  {
    id: 'ready',
    eyebrow: 'YOU ARE READY',
    title: 'Progress, Privacy, and Help',
    description: 'Your active profile keeps its own progress, settings, and optional cloud backup choices.',
    icon: 'shield-checkmark',
    points: [
      'Closing and reopening the app should preserve completed work.',
      'Guest play remains local unless you choose cloud backup.',
      'Replay App Tour & Tutorial from Settings whenever anything feels confusing.',
    ],
  },
];
