import { Hono } from 'hono';
import { getDb } from '../db/index.js';

export const transparencyRouter = new Hono();

/**
 * GET /api/transparency
 * Menampilkan seluruh catatan komitmen hash keccak256 leaderboard mingguan ke Sepolia.
 */
transparencyRouter.get('/transparency', (c) => {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT week_id as week, hash, tx_hash as txHash, chain_id as chainId, committed_at as committedAt
       FROM leaderboard_commits
       ORDER BY week_id DESC`
    )
    .all() as {
    week: string;
    hash: string;
    txHash?: string;
    chainId?: number;
    committedAt: string;
  }[];

  return c.json(rows);
});
