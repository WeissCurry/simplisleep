export type SleepLabel = 'Sehat' | 'Kurang' | 'Kebanyakan';

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export type SessionStatus = 'active' | 'completed' | 'broken' | 'flagged';

export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  walletAddress?: string;
  role?: string;
  createdAt?: string;
}

export interface SleepSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string | null;
  durationMinutes?: number;
  status: SessionStatus;
  score?: number;
  date: string;
}

export interface NightScore {
  score: number;
  durationScore: number;
  consistencyScore: number;
  label: SleepLabel;
  durationHours: number;
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  avgScore: number;
  label: SleepLabel;
  streak: number;
}

export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  image: string;
  description: string;
  tokenId?: number | string;
  txHash?: string;
  status?: 'pending-mint' | 'minted';
}

export interface DropResult {
  won: boolean;
  card?: Card;
}

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  Common: 60,
  Rare: 25,
  Epic: 12,
  Legendary: 3
} as const;

export const DROP_CHANCE = 0.6;
export const MIN_SCORE_FOR_DROP = 70;
export const MIN_SCORE_FOR_STREAK = 70;

/**
 * Daftar tunggal ID pengguna demo resmi SimpliSleep.
 * Dibatasi tepat 3 akun dengan peran berbeda dan profil data yang menarik:
 * 1. budi-santoso: Engineering Lead (10 kartu koleksi, peringkat #2)
 * 2. siti-rahma: Senior QA Engineer (#1 leaderboard konsistensi, kartu Legendary Sepolia)
 * 3. gilang-ramadhan: DevOps Engineer (kategori Paling Membaik / Ex-Kalong)
 */
export const DEMO_USER_IDS = ['budi-santoso', 'siti-rahma', 'gilang-ramadhan'] as const;
export type DemoUserId = (typeof DEMO_USER_IDS)[number];

