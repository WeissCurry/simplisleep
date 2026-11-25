import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import {
  sendSleepReminder,
  getActiveCooldowns,
  getUnreadReminders,
  markReminderAsRead,
  markAllRemindersAsRead,
  ReminderCooldownError
} from '../services/reminder.js';

export const reminderRouter = new Hono();

const sendReminderSchema = z.object({
  targetUserId: z.string().min(1, 'targetUserId wajib diisi')
});

/**
 * POST /api/reminders
 * Mengirim pengingat tidur ke pengguna target.
 * Dibatasi cooldown anti-spam 5 menit per pasangan pengirim-target di sisi server.
 */
reminderRouter.post('/reminders', requireAuth, rateLimit({ maxRequests: 30 }), async (c) => {
  const senderId = c.get('userId');
  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Body JSON tidak valid' }, 400);
  }

  const parsed = sendReminderSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? 'Data pengingat tidak valid' },
      400
    );
  }

  const { targetUserId } = parsed.data;

  try {
    const reminder = await sendSleepReminder(senderId, targetUserId);
    return c.json(
      {
        success: true,
        message: 'Pengingat tidur berhasil dikirim!',
        cooldownSeconds: reminder.cooldownSeconds,
        reminder
      },
      201
    );
  } catch (err: any) {
    if (err instanceof ReminderCooldownError) {
      c.header('Retry-After', String(err.retryAfterSeconds));
      return c.json(
        {
          error: err.message,
          retryAfterSeconds: err.retryAfterSeconds,
          cooldownSeconds: err.cooldownSeconds
        },
        429
      );
    }

    const statusCode = err?.statusCode || 400;
    return c.json(
      {
        error: err?.message || 'Gagal mengirim pengingat tidur'
      },
      statusCode
    );
  }
});

/**
 * GET /api/reminders/cooldowns
 * Mengambil daftar target user yang saat ini sedang dalam status cooldown untuk pengirim ini.
 */
reminderRouter.get('/reminders/cooldowns', requireAuth, (c) => {
  const senderId = c.get('userId');
  const cooldowns = getActiveCooldowns(senderId);
  return c.json({ cooldowns });
});

/**
 * GET /api/reminders/unread
 * Mengambil daftar notifikasi pengingat tidur yang belum dibaca untuk user terautentikasi.
 */
reminderRouter.get('/reminders/unread', requireAuth, (c) => {
  const targetId = c.get('userId');
  const unread = getUnreadReminders(targetId);
  return c.json(unread);
});

/**
 * POST /api/reminders/:id/read
 * Menandai satu notifikasi pengingat tidur sebagai dibaca.
 */
reminderRouter.post('/reminders/:id/read', requireAuth, rateLimit({ maxRequests: 30 }), (c) => {
  const targetId = c.get('userId');
  const reminderId = c.req.param('id');
  const success = markReminderAsRead(targetId, reminderId);

  if (!success) {
    return c.json(
      { error: 'Notifikasi pengingat tidak ditemukan atau sudah dibaca' },
      404
    );
  }

  return c.json({ success: true });
});

/**
 * POST /api/reminders/read-all
 * Menandai seluruh notifikasi pengingat tidur sebagai dibaca.
 */
reminderRouter.post('/reminders/read-all', requireAuth, rateLimit({ maxRequests: 30 }), (c) => {
  const targetId = c.get('userId');
  const count = markAllRemindersAsRead(targetId);
  return c.json({ success: true, count });
});
