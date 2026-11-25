import { Hono } from 'hono';
import { z } from 'zod';
import crypto from 'node:crypto';
import { closeAndCommitWeek } from '../services/leaderboard.js';
import { rateLimit } from '../middleware/rate-limit.js';

export const adminRouter = new Hono();

const closeWeekSchema = z.object({
  week: z.string().regex(/^\d{4}-W\d{2}$/, 'Format week harus YYYY-Www (misal 2026-W47)')
});

/**
 * POST /api/admin/close-week?week=YYYY-Www
 * Endpoint khusus admin untuk menutup minggu, menghitung hash keccak256 leaderboard stabil,
 * dan memanggil kontrak commitWeek di Sepolia.
 */
adminRouter.post('/admin/close-week', rateLimit({ maxRequests: 5 }), async (c) => {
  const configuredAdminToken = process.env.ADMIN_TOKEN?.trim();
  if (!configuredAdminToken) {
    return c.json({ error: 'Admin token belum dikonfigurasi' }, 503);
  }

  const rawHeader = c.req.header('x-admin-token') || c.req.header('Authorization');
  let headerToken = rawHeader?.trim();
  if (headerToken?.startsWith('Bearer ')) {
    headerToken = headerToken.slice(7).trim();
  }

  if (!headerToken) {
    return c.json({ error: 'Unauthorized: Admin token tidak cocok' }, 401);
  }

  const a = Buffer.from(headerToken);
  const b = Buffer.from(configuredAdminToken);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return c.json({ error: 'Unauthorized: Admin token tidak cocok' }, 401);
  }

  const queryWeek = c.req.query('week');
  let bodyWeek: string | undefined;

  try {
    const body = await c.req.json();
    bodyWeek = body?.week;
  } catch {
    // query param fallback
  }

  const targetWeek = queryWeek || bodyWeek;
  const parsed = closeWeekSchema.safeParse({ week: targetWeek });

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Invalid week format' }, 400);
  }

  try {
    const result = await closeAndCommitWeek(parsed.data.week);
    return c.json(result);
  } catch (err: unknown) {
    const customErr = err as { status?: number; code?: string; message?: string };
    if (customErr.status === 409 || customErr.code === 'ALREADY_COMMITTED') {
      return c.json({ error: customErr.message || 'Minggu sudah pernah di-commit' }, 409);
    }
    console.error('[admin/close-week error]:', err);
    const isProd = process.env.NODE_ENV === 'production';
    return c.json(
      {
        error: 'Gagal menutup minggu',
        ...(isProd ? {} : { details: (err as Error).message })
      },
      500
    );
  }
});
