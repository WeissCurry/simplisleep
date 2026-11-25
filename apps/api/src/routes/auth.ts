import { Hono } from 'hono';
import { z } from 'zod';
import { DEMO_USER_IDS, type DemoUserId } from 'shared';
import { getDb } from '../db/index.js';
import {
  createAuthToken,
  verifyGoogleToken,
  findOrCreateGoogleUser,
  type AuthUser
} from '../services/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { getUserStreak, formatSleepSession } from '../services/sleep.js';
import { SEED_USERS } from '../seed/seed-data.js';

export { DEMO_USER_IDS, type DemoUserId };

export const authRouter = new Hono();

/**
 * Menentukan apakah mode login demo diaktifkan:
 * - Di production: wajib eksplisit ENABLE_DEMO_LOGIN='true'
 * - Di non-production (dev/test): default aktif kecuali diset 'false' atau '0'
 */
export function isDemoLoginEnabled(): boolean {
  const envVal = process.env.ENABLE_DEMO_LOGIN?.trim().toLowerCase();
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    return envVal === 'true';
  }
  return envVal !== 'false' && envVal !== '0';
}

// Skema validasi request
const demoLoginSchema = z.object({
  userId: z.string().min(1, 'userId diperlukan')
});

const googleLoginSchema = z
  .object({
    idToken: z.string().optional(),
    credential: z.string().optional()
  })
  .refine((data) => Boolean(data.idToken?.trim() || data.credential?.trim()), {
    message: 'idToken atau credential diperlukan'
  });

/**
 * POST /api/auth/demo
 * Login menggunakan mode demo (pilih salah satu Simplimate).
 */
authRouter.post('/auth/demo', rateLimit({ maxRequests: 20 }), async (c) => {
  if (!isDemoLoginEnabled()) {
    return c.json({ error: 'Endpoint tidak ditemukan' }, 404);
  }
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Body JSON tidak valid' }, 400);
  }

  const parsed = demoLoginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, 400);
  }

  // Validasi: hanya tepat 3 akun demo resmi yang diizinkan untuk login demo
  if (!DEMO_USER_IDS.includes(parsed.data.userId as any)) {
    return c.json(
      {
        error:
          'Akses ditolak: akun demo dibatasi hanya untuk akun resmi terpilih (budi-santoso, siti-rahma, gilang-ramadhan)'
      },
      403
    );
  }

  const db = getDb();
  const user = db
    .prepare('SELECT id, name, avatar, email, wallet_address, role FROM users WHERE id = ?')
    .get(parsed.data.userId) as AuthUser | undefined;

  if (!user) {
    return c.json({ error: 'Pengguna demo tidak ditemukan' }, 404);
  }

  const token = await createAuthToken(user);
  return c.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      walletAddress: user.wallet_address,
      role: user.role
    }
  });
});

/**
 * POST /api/auth/google
 * Login opsional via Google Sign-In (hanya aktif bila GOOGLE_CLIENT_ID ada).
 */
authRouter.post('/auth/google', rateLimit({ maxRequests: 20 }), async (c) => {
  if (!process.env.GOOGLE_CLIENT_ID?.trim()) {
    return c.json(
      { error: 'Google Sign-In tidak dikonfigurasi (GOOGLE_CLIENT_ID kosong)' },
      501
    );
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Body JSON tidak valid' }, 400);
  }

  const parsed = googleLoginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, 400);
  }

  try {
    const rawToken = (parsed.data.idToken || parsed.data.credential)!.trim();
    const googleInfo = await verifyGoogleToken(rawToken);
    if (!googleInfo) {
      return c.json({ error: 'Verifikasi Google token gagal' }, 401);
    }

    const user = findOrCreateGoogleUser(googleInfo);
    const token = await createAuthToken(user);

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        walletAddress: user.wallet_address,
        role: user.role
      }
    });
  } catch (err) {
    return c.json({ error: 'Autentikasi Google gagal', details: String(err) }, 401);
  }
});

/**
 * GET /api/demo-users
 * Daftar pengguna demo untuk kemudahan seleksi login juri/evaluator.
 * Dibatasi tepat 3 akun demo resmi.
 */
authRouter.get('/demo-users', (c) => {
  if (!isDemoLoginEnabled()) {
    return c.json({ error: 'Endpoint tidak ditemukan' }, 404);
  }

  const db = getDb();
  const placeholders = DEMO_USER_IDS.map(() => '?').join(',');
  const users = db
    .prepare(
      `SELECT id, name, avatar, role, wallet_address FROM users WHERE id IN (${placeholders})`
    )
    .all(...DEMO_USER_IDS) as {
    id: string;
    name: string;
    avatar: string;
    role: string;
    wallet_address?: string;
  }[];

  // Urutkan konsisten sesuai urutan DEMO_USER_IDS
  users.sort((a, b) => DEMO_USER_IDS.indexOf(a.id as any) - DEMO_USER_IDS.indexOf(b.id as any));

  const enrichedUsers = users.map((user) => {
    const baseStreak = getUserStreak(user.id);

    const scoreRows = db
      .prepare(
        `SELECT score FROM sleep_sessions
         WHERE user_id = ? AND status IN ('completed', 'broken') AND ended_at IS NOT NULL`
      )
      .all(user.id) as { score: number }[];

    const totalScore = scoreRows.reduce((acc, r) => acc + (r.score ?? 0), 0);
    const baseAvgScore =
      scoreRows.length > 0 ? Math.round((totalScore / scoreRows.length) * 10) / 10 : 0;

    const seedUser = SEED_USERS.find((s) => s.id === user.id) as any;
    const personality = (user as any).personality || seedUser?.personality || undefined;

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      walletAddress: user.wallet_address,
      baseStreak,
      baseAvgScore,
      ...(personality ? { personality } : {})
    };
  });

  return c.json(enrichedUsers);
});

/**
 * GET /api/me
 * Mengembalikan profil pengguna terautentikasi, wallet address, status sesi hari ini, dan streak.
 */
authRouter.get('/me', requireAuth, (c) => {
  const user = c.get('user');
  const db = getDb();

  // Cek sesi tidur hari ini / yang sedang aktif
  const activeSession = db
    .prepare(
      "SELECT id, started_at, status, score, date FROM sleep_sessions WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1"
    )
    .get(user.id) as { id: string; started_at: string; status: string; score: number; date: string } | undefined;

  let todayStatus: {
    status: string;
    score?: number;
    startedAt?: string;
    started_at?: string;
    session?: any;
  } = {
    status: 'idle'
  };

  if (activeSession) {
    const formatted = formatSleepSession({
      id: activeSession.id,
      user_id: user.id,
      started_at: activeSession.started_at,
      ended_at: null,
      duration_minutes: 0,
      status: activeSession.status as any,
      score: activeSession.score,
      date: activeSession.date
    });

    todayStatus = {
      status: activeSession.status,
      startedAt: activeSession.started_at,
      started_at: activeSession.started_at,
      session: formatted
    };
  } else {
    // Cek apakah sudah ada sesi selesai hari ini
    const todaySession = db
      .prepare(
        "SELECT id, started_at, ended_at, duration_minutes, status, score, date FROM sleep_sessions WHERE user_id = ? AND ended_at IS NOT NULL ORDER BY ended_at DESC LIMIT 1"
      )
      .get(user.id) as {
        id: string;
        started_at: string;
        ended_at: string;
        duration_minutes: number;
        status: string;
        score: number;
        date: string;
      } | undefined;

    if (todaySession) {
      const formatted = formatSleepSession({
        id: todaySession.id,
        user_id: user.id,
        started_at: todaySession.started_at,
        ended_at: todaySession.ended_at,
        duration_minutes: todaySession.duration_minutes,
        status: todaySession.status as any,
        score: todaySession.score,
        date: todaySession.date
      });

      todayStatus = {
        status: todaySession.status,
        score: todaySession.score,
        startedAt: todaySession.started_at,
        started_at: todaySession.started_at,
        session: formatted
      };
    }
  }

  const streak = getUserStreak(user.id);

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      role: user.role,
      walletAddress: user.wallet_address
    },
    wallet: {
      address: user.wallet_address
    },
    today: todayStatus,
    streak
  });
});
