import { Hono } from 'hono';
import { z } from 'zod';
import { getSleepLabel, DEMO_USER_IDS } from 'shared';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { isDemoLoginEnabled } from './auth.js';
import {
  startSleepSession,
  wakeSleepSession,
  simulateNightSession,
  recordHeartbeat
} from '../services/sleep.js';
import { getDb } from '../db/index.js';

function getDayNameIndo(dateStr: string): string {
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return 'Min';
  const d = new Date(year, month - 1, day, 12, 0, 0);
  return dayNames[d.getDay()] || 'Min';
}

function formatJakartaTime(isoStr: string | null | undefined): string {
  if (!isoStr) return '--:--';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '--:--';
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  return formatter.format(d);
}

export const sleepRouter = new Hono();

/**
 * POST /api/sleep/start
 * Memulai sesi tidur (waktu server).
 */
sleepRouter.post('/sleep/start', requireAuth, rateLimit({ maxRequests: 20 }), (c) => {
  const userId = c.get('userId');

  try {
    const session = startSleepSession(userId);
    return c.json(session, 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

/**
 * POST /api/sleep/wake
 * Mengakhiri sesi tidur (waktu server), menghitung skor malam, dan peluang drop kartu.
 */
sleepRouter.post('/sleep/wake', requireAuth, rateLimit({ maxRequests: 20 }), async (c) => {
  const userId = c.get('userId');

  try {
    const result = await wakeSleepSession(userId);
    return c.json(result);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

/**
 * POST /api/sleep/simulate-night
 * Simulasi tidur 8 jam untuk akun demo resmi (skor >= 70 dan pasti drop kartu).
 */
sleepRouter.post('/sleep/simulate-night', requireAuth, rateLimit({ maxRequests: 20 }), async (c) => {
  const userId = c.get('userId');

  if (!isDemoLoginEnabled() || !(DEMO_USER_IDS as readonly string[]).includes(userId)) {
    return c.json(
      { error: 'Simulasi tidur hanya diizinkan untuk akun demo resmi saat mode demo aktif' },
      403
    );
  }

  try {
    const result = await simulateNightSession(userId);
    return c.json(result);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

/**
 * POST /api/heartbeat
 * Menandai sesi sebagai 'broken' jika dipanggil saat pengguna sedang dalam sesi tidur aktif.
 */
sleepRouter.post('/heartbeat', requireAuth, rateLimit({ maxRequests: 60 }), (c) => {
  const userId = c.get('userId');
  const result = recordHeartbeat(userId);
  return c.json(result);
});

const historyQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(14)
});

/**
 * GET /api/sleep/history?days=14
 * Riwayat tidur pribadi pengguna terautentikasi.
 */
sleepRouter.get('/sleep/history', requireAuth, (c) => {
  const userId = c.get('userId');
  const parsed = historyQuerySchema.safeParse(c.req.query());
  const days = parsed.success ? parsed.data.days : 14;

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT date, duration_minutes as durationMin, score, status, started_at as startedAt, ended_at as endedAt
       FROM sleep_sessions 
       WHERE user_id = ? 
       ORDER BY date DESC, started_at DESC 
       LIMIT ?`
    )
    .all(userId, days) as {
    date: string;
    durationMin: number;
    score: number;
    status: string;
    startedAt: string;
    endedAt: string | null;
  }[];

  const mapped = rows.map((r) => {
    const durationHours = Math.round((r.durationMin / 60) * 10) / 10;
    return {
      ...r,
      durationMinutes: r.durationMin,
      duration_minutes: r.durationMin,
      durationHours,
      dayName: getDayNameIndo(r.date),
      label: getSleepLabel(durationHours),
      bedTime: formatJakartaTime(r.startedAt),
      wakeTime: formatJakartaTime(r.endedAt),
      started_at: r.startedAt,
      ended_at: r.endedAt
    };
  });

  return c.json(mapped);
});
