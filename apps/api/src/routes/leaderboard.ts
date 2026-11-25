import { Hono } from 'hono';
import { z } from 'zod';
import { getWeeklyLeaderboard } from '../services/leaderboard.js';
import { getDb } from '../db/index.js';

export const leaderboardRouter = new Hono();

const leaderboardQuerySchema = z.object({
  week: z
    .string()
    .regex(/^\d{4}-W\d{2}$/, 'Format minggu harus YYYY-Www (misal 2026-W47)')
    .optional()
});

/**
 * GET /api/leaderboard?week=YYYY-Www
 * Leaderboard mingguan dengan kategori (Paling Konsisten, Paling Membaik, Streak Terpanjang).
 * Menghormati privasi: tidak menampilkan jam tidur detail orang lain.
 */
leaderboardRouter.get('/leaderboard', (c) => {
  const query = c.req.query();
  const parsed = leaderboardQuerySchema.safeParse(query);

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Invalid week format' }, 400);
  }

  const week = parsed.data.week;
  const result = getWeeklyLeaderboard(week);
  return c.json(result);
});

/**
 * GET /api/awake
 * Daftar pengguna yang saat ini masih melek / membuka aplikasi di jam tidur (status broken).
 */
leaderboardRouter.get('/awake', (c) => {
  const db = getDb();

  // Ambil sesi yang berstatus 'broken' dan belum bangun (ended_at IS NULL)
  const rows = db
    .prepare(
      `SELECT s.user_id as userId, u.name, u.avatar, COALESCE(u.role, 'Simplimate') as role, COALESCE(s.last_heartbeat, s.started_at) as since
       FROM sleep_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.status = 'broken' AND s.ended_at IS NULL
       ORDER BY since DESC`
    )
    .all() as {
    userId: string;
    name: string;
    avatar: string;
    role: string;
    since: string;
  }[];

  const now = Date.now();
  const enriched = rows.map((r) => {
    const sinceMs = new Date(r.since).getTime();
    const diffHours = isNaN(sinceMs) ? 0 : Math.max(0, (now - sinceMs) / 3600000);
    const sinceHoursAgo = Math.round(diffHours * 10) / 10;
    return {
      userId: r.userId,
      name: r.name,
      avatar: r.avatar,
      role: r.role || 'Simplimate',
      since: r.since,
      sinceHoursAgo
    };
  });

  return c.json(enriched);
});
