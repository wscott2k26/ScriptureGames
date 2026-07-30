import type { Profile } from './profile-context';
import type { SeasonProgress } from './season-progress';
import type { DailyChallengeState } from './daily-challenge';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: string;
};

export function getAchievements(profile: Profile, season: SeasonProgress, daily: DailyChallengeState | null): Achievement[] {
  const perfect = Object.values(season.bestResults).some((result) => result.percent === 100);
  const trials = season.completedTrials.length;
  const decisions = Object.keys(season.choices).length;
  return [
    { id: 'declared', title: 'Banner Raised', description: 'Join one of the three Genesis factions.', icon: '🏳️', unlocked: Boolean(season.faction) },
    { id: 'first-gate', title: 'First Gate', description: 'Complete your first Genesis trial.', icon: '🚪', unlocked: trials >= 1, progress: `${Math.min(trials, 1)}/1` },
    { id: 'five-gates', title: 'Halfway Through', description: 'Complete five Genesis trials.', icon: '🗺️', unlocked: trials >= 5, progress: `${Math.min(trials, 5)}/5` },
    { id: 'champion', title: 'Genesis Champion', description: 'Complete all ten Genesis trials.', icon: '👑', unlocked: trials >= 10, progress: `${Math.min(trials, 10)}/10` },
    { id: 'perfect', title: 'Flawless Recall', description: 'Earn a perfect score on any Genesis trial.', icon: '💯', unlocked: perfect },
    { id: 'decision-maker', title: 'Path of Wisdom', description: 'Record five story decisions.', icon: '⚖️', unlocked: decisions >= 5, progress: `${Math.min(decisions, 5)}/5` },
    { id: 'daily', title: 'Daily Bread', description: 'Complete today’s Daily Trial.', icon: '☀️', unlocked: Boolean(daily?.rewarded) },
    { id: 'streak', title: 'Seven-Day Flame', description: 'Reach a seven-day learning streak.', icon: '🔥', unlocked: profile.streak >= 7, progress: `${Math.min(profile.streak, 7)}/7` },
    { id: 'scholar', title: 'Scripture Scholar', description: 'Earn 1,000 total XP.', icon: '📜', unlocked: profile.xp >= 1000, progress: `${Math.min(profile.xp, 1000)}/1000` },
    { id: 'training', title: 'Training Ground', description: 'Finish five classic learning quests.', icon: '🛡️', unlocked: profile.completed_nodes.length >= 5, progress: `${Math.min(profile.completed_nodes.length, 5)}/5` },
    { id: 'week-warrior', title: 'Week Warrior', description: 'Keep showing up with steady faithfulness.', icon: '⚔️', unlocked: profile.badges.includes('week_warrior') },
    { id: 'all-training', title: 'Archive Master', description: 'Complete all ten classic journey nodes.', icon: '🏛️', unlocked: profile.completed_nodes.length >= 10, progress: `${Math.min(profile.completed_nodes.length, 10)}/10` },
  ];
}
