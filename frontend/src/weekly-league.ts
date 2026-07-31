export type WeeklyLeague = {
  id: 'seed' | 'lamp' | 'lion' | 'crown';
  name: string;
  icon: string;
  floor: number;
  next: number;
  accent: 'success' | 'info' | 'coral' | 'brand';
};

const LEAGUES: WeeklyLeague[] = [
  { id: 'seed', name: 'Seed League', icon: '🌱', floor: 0, next: 150, accent: 'success' },
  { id: 'lamp', name: 'Lamp League', icon: '🪔', floor: 150, next: 400, accent: 'info' },
  { id: 'lion', name: 'Lion League', icon: '🦁', floor: 400, next: 800, accent: 'coral' },
  { id: 'crown', name: 'Crown League', icon: '👑', floor: 800, next: 1200, accent: 'brand' },
];

export function leagueForWeeklyXp(xp: number): WeeklyLeague {
  const safeXp = Math.max(0, Math.round(xp));
  return [...LEAGUES].reverse().find((league) => safeXp >= league.floor) || LEAGUES[0];
}

export function leagueProgress(xp: number, league = leagueForWeeklyXp(xp)): number {
  const range = Math.max(1, league.next - league.floor);
  return Math.max(0, Math.min(100, ((Math.max(0, xp) - league.floor) / range) * 100));
}

export function xpToNextLeague(xp: number, league = leagueForWeeklyXp(xp)): number {
  return Math.max(0, league.next - Math.max(0, Math.round(xp)));
}
