import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import {
  SEED_USERS,
  SEED_LEADERBOARD_COMMITS,
  generateSeedSessions,
  generateSeedUserCards
} from './seed-data.js';
import { ensureSchema } from '../db/schema.js';
import { getWeeklyLeaderboard, leaderboardHash } from '../services/leaderboard.js';
export { ensureSchema };

export interface SeedResult {
  usersCount: number;
  sessionsCount: number;
  cardsCount: number;
  commitsCount: number;
}

/**
 * Menjalankan proses seeding ke database SQLite.
 * Jika customDb diberikan, menggunakan database tersebut (misalnya untuk unit test in-memory).
 * Jika tidak, membuka database dari DB_PATH atau default simplisleep.db.
 */
export async function runSeed(customDb?: DatabaseSync): Promise<SeedResult> {
  let db = customDb;

  if (!db) {
    const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'simplisleep.db');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new DatabaseSync(dbPath);
  }

  // Pastikan skema tabel sudah ada
  ensureSchema(db);

  // Bersihkan data lama agar idempoten
  db.exec('DELETE FROM user_cards');
  db.exec('DELETE FROM sleep_sessions');
  db.exec('DELETE FROM leaderboard_commits');
  db.exec('DELETE FROM users');

  // 1. Insert Users (12 Simplimates FIKTIF)
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, avatar, email, wallet_address, wallet_private_key_enc, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of SEED_USERS) {
    insertUser.run(
      user.id,
      user.name,
      user.avatar,
      user.email,
      user.walletAddress,
      user.walletPrivateKeyEnc,
      user.role
    );
  }

  // 2. Insert Sleep Sessions (3 minggu riwayat bervariasi)
  const sessions = generateSeedSessions();
  const insertSession = db.prepare(`
    INSERT INTO sleep_sessions (id, user_id, started_at, ended_at, duration_minutes, status, score, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of sessions) {
    insertSession.run(
      s.id,
      s.userId,
      s.startedAt,
      s.endedAt,
      s.durationMinutes,
      s.status,
      s.score,
      s.date
    );
  }

  // 3. Insert User Cards
  const cards = generateSeedUserCards();
  const insertCard = db.prepare(`
    INSERT INTO user_cards (id, user_id, card_id, card_number, name, rarity, token_id, tx_hash, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of cards) {
    insertCard.run(
      c.id,
      c.userId,
      c.cardId,
      c.cardNumber,
      c.name,
      c.rarity,
      c.tokenId ?? null,
      c.txHash ?? null,
      c.status,
      c.createdAt
    );
  }

  // 4. Insert Leaderboard Commits (satu minggu yang sudah committed dengan hash asli leaderboardHash)
  const insertCommit = db.prepare(`
    INSERT INTO leaderboard_commits (week_id, hash, tx_hash, chain_id, committed_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const commit of SEED_LEADERBOARD_COMMITS) {
    let commitHash = commit.hash;
    try {
      const lb = getWeeklyLeaderboard(commit.weekId, db);
      if (lb.rows && lb.rows.length > 0) {
        commitHash = leaderboardHash(lb.rows);
      }
    } catch {
      // fallback jika perhitungan gagal
    }

    insertCommit.run(
      commit.weekId,
      commitHash,
      commit.txHash,
      commit.chainId,
      commit.committedAt
    );
  }

  return {
    usersCount: SEED_USERS.length,
    sessionsCount: sessions.length,
    cardsCount: cards.length,
    commitsCount: SEED_LEADERBOARD_COMMITS.length
  };
}

export { runSeed as seed };
export default runSeed;

// CLI execution check
if (
  process.argv[1] &&
  (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'))
) {
  console.log('[seed] Memulai proses seed data dummy SimpliSleep...');
  runSeed()
    .then((result) => {
      console.log('[seed] Seeding selesai dengan sukses!');
      console.log(`- Users: ${result.usersCount}`);
      console.log(`- Sleep Sessions: ${result.sessionsCount}`);
      console.log(`- User Cards: ${result.cardsCount}`);
      console.log(`- Leaderboard Commits: ${result.commitsCount}`);
    })
    .catch((err) => {
      console.error('[seed] Seeding gagal:', err);
      process.exit(1);
    });
}
