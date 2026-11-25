import { keccak256 as viemKeccak, toBytes } from 'viem';

/**
 * =============================================================================
 * TODO KONTRAK FORMAT HASH LEADERBOARD (Harap disamakan dengan apps/api server)
 * =============================================================================
 * Spesifikasi kesepakatan hash keccak256 antara backend dan frontend:
 *
 * 1. Urutan baris: Seluruh baris klasemen harus diurutkan berdasarkan `rank`
 *    secara menaik (ascending: rank 1, 2, 3, ...).
 *
 * 2. Urutan field objek: Setiap baris hanya mengekspor 3 field publik penting:
 *    - "rank": number (contoh: 1)
 *    - "userId": string (contoh: "user-1")
 *    - "avgScore": number (contoh: 92.4)
 *    Urutan key JSON HARUS persis: rank, userId, avgScore.
 *
 * 3. Serialisasi: JSON.stringify(sortedRows) tanpa spasi atau indentasi tambahan.
 *
 * 4. Encoding: toBytes(jsonString, 'utf-8')
 *
 * 5. Hash: keccak256(bytes) -> mengembalikan string hex 0x...
 *
 * Contoh payload JSON stabil:
 * '[{"rank":1,"userId":"user-1","avgScore":92.4},{"rank":2,"userId":"user-2","avgScore":90.8}]'
 *
 * Komitmen on-chain Sepolia (LeaderboardCommit.sol) menyimpan keccak256 dari string ini.
 * =============================================================================
 */

export interface LeaderboardHashRow {
  rank: number;
  userId: string;
  avgScore: number;
}

/**
 * Normalisasi dan urutkan baris leaderboard agar stabil sebelum di-hash
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
 * Hitung hash Keccak-256 dari daftar baris leaderboard dengan format stabil
 */
export function keccakLeaderboard(
  rows: Array<{ rank: number; userId: string; avgScore: number }>
): string {
  const stableRows = normalizeLeaderboardRows(rows);
  const jsonString = JSON.stringify(stableRows);
  return viemKeccak(toBytes(jsonString));
}

/**
 * Helper keccak256 umum untuk string atau Uint8Array
 */
export function keccak256(data: string | Uint8Array): string {
  if (typeof data === 'string') {
    return viemKeccak(toBytes(data));
  }
  return viemKeccak(data);
}
