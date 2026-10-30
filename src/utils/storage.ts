import type { LeaderboardEntry, Player } from '../types/game';

const LEADERBOARD_KEY = 'kermes_halcon_leaderboard_v1';
const PLAYER_KEY = 'kermes_halcon_player_v1';

// Initial default leaderboard entries for a festive Kermés atmosphere
const DEFAULT_SCORES: LeaderboardEntry[] = [
  { id: '1', name: 'Mateo Morales', group: '6° B', score: 24, timestamp: Date.now() - 1000 * 60 * 120, unlockedReward: 'both' },
  { id: '2', name: 'Sofía Jiménez', group: '5° A', score: 18, timestamp: Date.now() - 1000 * 60 * 95, unlockedReward: 'both' },
  { id: '3', name: 'Santiago Ruiz', group: '4° C', score: 14, timestamp: Date.now() - 1000 * 60 * 80, unlockedReward: 'both' },
  { id: '4', name: 'Valeria Cruz', group: '3° A', score: 10, timestamp: Date.now() - 1000 * 60 * 65, unlockedReward: 'popcorn' },
  { id: '5', name: 'Emiliano Díaz', group: '6° A', score: 9, timestamp: Date.now() - 1000 * 60 * 50, unlockedReward: 'bread' },
  { id: '6', name: 'Camila López', group: '2° B', score: 8, timestamp: Date.now() - 1000 * 60 * 42, unlockedReward: 'popcorn' },
  { id: '7', name: 'Leonardo Soto', group: '5° B', score: 7, timestamp: Date.now() - 1000 * 60 * 35, unlockedReward: 'bread' },
  { id: '8', name: 'Mariana Flores', group: '1° A', score: 6, timestamp: Date.now() - 1000 * 60 * 20, unlockedReward: 'popcorn' },
  { id: '9', name: 'Diego Torres', group: '4° B', score: 5, timestamp: Date.now() - 1000 * 60 * 15, unlockedReward: 'bread' },
  { id: '10', name: 'Ximena Gómez', group: '3° B', score: 4, timestamp: Date.now() - 1000 * 60 * 8, unlockedReward: 'none' },
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_SCORES));
      return DEFAULT_SCORES;
    }
    const parsed: LeaderboardEntry[] = JSON.parse(raw);
    return parsed.sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveScore(
  name: string,
  group: string,
  score: number,
  unlockedReward?: 'popcorn' | 'bread' | 'both' | 'none'
): LeaderboardEntry {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    group: group.trim().toUpperCase(),
    score,
    timestamp: Date.now(),
    unlockedReward,
  };

  const updated = [newEntry, ...current].sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  return newEntry;
}

export function getLastPlayer(): Player | null {
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLastPlayer(player: Player) {
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
  } catch {
    // safe
  }
}

export function clearLeaderboard(): void {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));
}
