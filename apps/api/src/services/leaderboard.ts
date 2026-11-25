import { keccak256, toBytes } from 'viem';
import { DatabaseSync } from 'node:sqlite';
import { getWeekId, getSleepLabel, type SleepLabel } from 'shared';
import { getDb } from '../db/index.js';
import { getUserStreak } from './sleep.js';
import { commitWeek } from './chain.js';

export interface LeaderboardItem {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  avgScore: number;
  label: SleepLabel;
  streak: number;
}

export interface LeaderboardHashRow {
  rank: number;
  userId: string;
  avgScore: number;
}

export interface LeaderboardCategories {
  mostConsistent?: {
    userId: string;
    name: string;
    avatar: string;
    avgScore: number;
    highlightStat?: string;
  };
  mostImproved?: {
    userId: string;
    name: string;
    avatar: string;
    diff: number;
    avgScore?: number;
    highlightStat?: string;
  };
  longestStreak?: {
    userId: string;
    name: string;
    avatar: string;
    streak: number;
    highlightStat?: string;
  };
}

export interface LeaderboardResponse {
  week: string;
  rows: LeaderboardItem[];
  categories: LeaderboardCategories;
  commit?: {
    hash: string;
    txHash?: string;
    timestamp?: string;
  };
}

/**
 * Normalisasi dan urutkan baris leaderboard agar stabil sebelum di-hash:
 * - Urutkan berdasarkan rank ascending (1, 2, 3...)
 * - Setiap objek HANYA memiliki 3 key dengan urutan persis: rank, userId, avgScore.
 * Format ini persis identik dengan apps/web/src/app/core/utils/keccak.util.ts.
 */
export function normalizeLeaderboardRows(
  rows: Array<{ rank: number; userId: string; avgScore: number }>
): LeaderboardHashRow[] {
  return [...rows]
    .sort((a, b) => a.rank - b.rank)
    .map((r) => ({
      rank: r.rank,
      userId: r.userId,
      avgScore: r.avgScore
    }));
}

/**
 * Menghitung hash Keccak-256 dari daftar baris leaderboard dengan format stabil.
 * - Rows diurutkan berdasarkan rank ascending
 * - Setiap row HANYA {rank, userId, avgScore} dengan urutan key persis itu
 * - JSON.stringify tanpa spasi
 * - keccak256(toBytes(json))
 * Format ini IDENTIK dengan web (apps/web/src/app/core/utils/keccak.util.ts).
 */
export function leaderboardHash(
  rows: Array<{ rank: number; userId: string; avgScore: number }>
): `0x${string}` {
  const stableRows = normalizeLeaderboardRows(rows);
  const jsonString = JSON.stringify(stableRows);
  return keccak256(toBytes(jsonString));
}

/**
 * Menghitung rentang tanggal (Senin - Minggu) untuk weekId format YYYY-Www.
 */
export function getWeekDateRange(weekId: string): { startDate: string; endDate: string } {
  const parts = weekId.split('-W');
  if (parts.length !== 2) {
    throw new Error(`Format weekId tidak valid: ${weekId}`);
  }

  const year = parseInt(parts[0]!, 10);
  const week = parseInt(parts[1]!, 10);

  // 4 Januari selalu berada di minggu ke-1 kalender ISO
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = (jan4.getUTCDay() + 6) % 7 + 1; // 1 = Senin, ..., 7 = Minggu
  const mondayW1 = new Date(jan4);
  mondayW1.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1));

  const targetMonday = new Date(mondayW1);
  targetMonday.setUTCDate(mondayW1.getUTCDate() + (week - 1) * 7);

  const targetSunday = new Date(targetMonday);
  targetSunday.setUTCDate(targetMonday.getUTCDate() + 6);

  return {
    startDate: targetMonday.toISOString().split('T')[0]!,
    endDate: targetSunday.toISOString().split('T')[0]!
  };
}

/**
 * Menghitung weekId minggu sebelumnya.
 */
export function getPreviousWeekId(weekId: string): string {
  const { startDate } = getWeekDateRange(weekId);
  const prevDate = new Date(`${startDate}T00:00:00Z`);
  prevDate.setUTCDate(prevDate.getUTCDate() - 3); // Mundur ke hari di minggu sebelumnya
  return getWeekId(prevDate);
}

/**
 * Menghasilkan data leaderboard mingguan.
 * PRIVASI: Menampilkan skor & label kategori, BUKAN jam tidur detail orang lain.
 */
export function getWeeklyLeaderboard(targetWeek?: string, customDb?: DatabaseSync): LeaderboardResponse {
  const week = targetWeek || getWeekId();
  const db = customDb || getDb();
  const { startDate, endDate } = getWeekDateRange(week);

  // Ambil semua sesi dalam rentang minggu tersebut yang statusnya completed / broken
  const sessions = db
    .prepare(
      `SELECT s.user_id, s.score, s.duration_minutes, u.name, u.avatar
       FROM sleep_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.date >= ? AND s.date <= ? AND s.status IN ('completed', 'broken')`
    )
    .all(startDate, endDate) as {
    user_id: string;
    score: number;
    duration_minutes: number;
    name: string;
    avatar: string;
  }[];

  // Kelompokkan per user
  const userMap = new Map<
    string,
    {
      userId: string;
      name: string;
      avatar: string;
      totalScore: number;
      totalDurationMin: number;
      count: number;
      scores: number[];
    }
  >();

  for (const s of sessions) {
    let u = userMap.get(s.user_id);
    if (!u) {
      u = {
        userId: s.user_id,
        name: s.name,
        avatar: s.avatar,
        totalScore: 0,
        totalDurationMin: 0,
        count: 0,
        scores: []
      };
      userMap.set(s.user_id, u);
    }
    u.totalScore += s.score;
    u.totalDurationMin += s.duration_minutes;
    u.count++;
    u.scores.push(s.score);
  }

  // Bentuk baris leaderboard
  const rawRows: {
    userId: string;
    name: string;
    avatar: string;
    avgScore: number;
    avgDurationHours: number;
    streak: number;
    variance: number;
  }[] = [];

  for (const u of userMap.values()) {
    const avgScore = Math.round(u.totalScore / u.count);
    const avgDurationHours = u.totalDurationMin / u.count / 60;
    const streak = getUserStreak(u.userId);

    // Hitung varians untuk kategori Paling Konsisten
    const variance =
      u.scores.length > 1
        ? u.scores.reduce((acc, val) => acc + Math.pow(val - avgScore, 2), 0) / u.scores.length
        : 0;

    rawRows.push({
      userId: u.userId,
      name: u.name,
      avatar: u.avatar,
      avgScore,
      avgDurationHours,
      streak,
      variance
    });
  }

  // Urutkan berdasarkan rata-rata skor tertinggi
  rawRows.sort((a, b) => b.avgScore - a.avgScore);

  const rows: LeaderboardItem[] = rawRows.map((r, index) => ({
    rank: index + 1,
    userId: r.userId,
    name: r.name,
    avatar: r.avatar,
    avgScore: r.avgScore,
    label: getSleepLabel(r.avgDurationHours),
    streak: r.streak
  }));

  // Kategori: Paling Konsisten (rata-rata skor tinggi & varians rendah)
  let mostConsistent: LeaderboardCategories['mostConsistent'] = undefined;
  if (rawRows.length > 0) {
    const consistentCandidates = [...rawRows].sort((a, b) => {
      if (a.variance !== b.variance) return a.variance - b.variance;
      return b.avgScore - a.avgScore;
    });
    const c = consistentCandidates[0];
    if (c) {
      const deviasiPoin = Math.round(Math.sqrt(c.variance) * 10) / 10;
      mostConsistent = {
        userId: c.userId,
        name: c.name,
        avatar: c.avatar,
        avgScore: c.avgScore,
        highlightStat:
          deviasiPoin === 0
            ? 'Konsistensi sempurna tanpa deviasi'
            : `Deviasi hanya ±${deviasiPoin} poin dari rata-rata`
      };
    }
  }

  // Kategori: Paling Membaik (vs minggu lalu)
  let mostImproved: LeaderboardCategories['mostImproved'] = undefined;
  try {
    const prevWeek = getPreviousWeekId(week);
    const { startDate: prevStart, endDate: prevEnd } = getWeekDateRange(prevWeek);
    const prevSessions = db
      .prepare(
        `SELECT user_id, score FROM sleep_sessions 
         WHERE date >= ? AND date <= ? AND status IN ('completed', 'broken')`
      )
      .all(prevStart, prevEnd) as { user_id: string; score: number }[];

    if (prevSessions.length > 0) {
      const prevMap = new Map<string, { total: number; count: number }>();
      for (const ps of prevSessions) {
        let p = prevMap.get(ps.user_id);
        if (!p) {
          p = { total: 0, count: 0 };
          prevMap.set(ps.user_id, p);
        }
        p.total += ps.score;
        p.count++;
      }

      let bestDiff = -Infinity;
      let bestUser: { userId: string; name: string; avatar: string; diff: number; avgScore: number } | null = null;

      for (const curr of rawRows) {
        const prev = prevMap.get(curr.userId);
        if (prev && prev.count > 0) {
          const prevAvg = prev.total / prev.count;
          const diff = Math.round((curr.avgScore - prevAvg) * 10) / 10;
          if (diff > bestDiff) {
            bestDiff = diff;
            bestUser = {
              userId: curr.userId,
              name: curr.name,
              avatar: curr.avatar,
              diff,
              avgScore: curr.avgScore
            };
          }
        }
      }

      if (bestUser && bestUser.diff > 0) {
        mostImproved = {
          userId: bestUser.userId,
          name: bestUser.name,
          avatar: bestUser.avatar,
          diff: bestUser.diff,
          avgScore: bestUser.avgScore,
          highlightStat: `+${bestUser.diff} poin dibanding minggu lalu`
        };
      }
    }
  } catch {
    // Abaikan jika perhitungan minggu lalu gagal
  }

  // Kategori: Streak Terpanjang
  let longestStreak: LeaderboardCategories['longestStreak'] = undefined;
  if (rawRows.length > 0) {
    const streakSorted = [...rawRows].sort((a, b) => b.streak - a.streak);
    const s = streakSorted[0];
    if (s && s.streak > 0) {
      longestStreak = {
        userId: s.userId,
        name: s.name,
        avatar: s.avatar,
        streak: s.streak,
        highlightStat: `${s.streak} malam berturut-turut skor ≥ 70`
      };
    }
  }

  // Cek komitmen on-chain
  const commit = db
    .prepare('SELECT hash, tx_hash, committed_at FROM leaderboard_commits WHERE week_id = ?')
    .get(week) as { hash: string; tx_hash?: string; committed_at?: string } | undefined;

  return {
    week,
    rows,
    categories: {
      mostConsistent,
      mostImproved,
      longestStreak
    },
    commit: commit
      ? {
          hash: commit.hash,
          txHash: commit.tx_hash,
          timestamp: commit.committed_at
        }
      : undefined
  };
}

/**
 * Menutup minggu tertentu, menghitung hash keccak256 dari JSON urutan stabil via leaderboardHash,
 * dan menyimpan komitmen ke smart contract serta database.
 * KOMITMEN TIDAK BOLEH DITIMPA: Jika minggu sudah di-commit, melempar error dengan status 409.
 */
export async function closeAndCommitWeek(
  weekId: string,
  customDb?: DatabaseSync
): Promise<{ week: string; hash: string; txHash?: string; status: 'committed' | 'pending' }> {
  const db = customDb || getDb();

  // 1. Cek apakah minggu sudah pernah di-commit
  const existing = db
    .prepare('SELECT week_id, hash FROM leaderboard_commits WHERE week_id = ?')
    .get(weekId) as { week_id: string; hash: string } | undefined;

  if (existing) {
    const error = new Error(`Minggu ${weekId} sudah pernah di-commit dan tidak boleh ditimpa`);
    (error as unknown as { status: number }).status = 409;
    (error as unknown as { code: string }).code = 'ALREADY_COMMITTED';
    throw error;
  }

  const leaderboard = getWeeklyLeaderboard(weekId, db);

  // Hitung hash dengan format standar leaderboardHash (hanya {rank, userId, avgScore})
  const hash = leaderboardHash(leaderboard.rows);

  // Panggil commitWeek on-chain
  const commitResult = await commitWeek(weekId, hash);
  const nowIso = new Date().toISOString();

  // 2. Simpan dengan INSERT biasa (bukan INSERT OR REPLACE)
  try {
    db.prepare(`
      INSERT INTO leaderboard_commits (week_id, hash, tx_hash, chain_id, committed_at)
      VALUES (?, ?, ?, 11155111, ?)
    `).run(weekId, hash, commitResult.txHash ?? null, nowIso);
  } catch (err: unknown) {
    const sqliteErr = err as { code?: string; message?: string };
    if (sqliteErr.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || sqliteErr.message?.includes('UNIQUE constraint failed')) {
      const error = new Error(`Minggu ${weekId} sudah pernah di-commit dan tidak boleh ditimpa`);
      (error as unknown as { status: number }).status = 409;
      (error as unknown as { code: string }).code = 'ALREADY_COMMITTED';
      throw error;
    }
    throw err;
  }

  return {
    week: weekId,
    hash,
    txHash: commitResult.txHash,
    status: commitResult.status
  };
}
