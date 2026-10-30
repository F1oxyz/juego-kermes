export interface Player {
  name: string;
  group: string;
}

export type CouponType = 'popcorn' | 'bread';

export interface LeaderboardEntry {
  id: string;
  name: string;
  group: string;
  score: number;
  timestamp: number;
  unlockedReward?: 'popcorn' | 'bread' | 'both' | 'none';
}

export type ScreenState = 'REGISTER' | 'PLAYING' | 'GAME_OVER' | 'LEADERBOARD' | 'COUPONS';
