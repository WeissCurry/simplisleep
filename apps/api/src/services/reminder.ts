import crypto from 'node:crypto';
import { getDb } from '../db/index.js';

/**
 * Durasi cooldown anti-spam pengingat tidur dalam satuan detik (5 menit).
 * Satu sumber kebenaran untuk pembatasan frekuensi pengingat per pasangan pengirim-target.
 */
export const REMINDER_COOLDOWN_SECONDS = 300;

export interface SleepReminderRecord {
  id: string;
  senderId: string;
  targetId: string;
  createdAt: string;
  readAt: string | null;
  cooldownSeconds: number;
}

export interface UnreadReminderItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  createdAt: string;
  message: string;
}

export interface NotifyReminderParams {
  reminderId: string;
  sender: { id: string; name: string };
  target: { id: string; name: string; email?: string | null };
  createdAt: string;
}

export class ReminderCooldownError extends Error {
  readonly retryAfterSeconds: number;
  readonly cooldownSeconds: number;

  constructor(retryAfterSeconds: number, cooldownSeconds: number = REMINDER_COOLDOWN_SECONDS) {
    super(`Harap tunggu ${retryAfterSeconds} detik sebelum mengingatkan user ini kembali`);
    this.name = 'ReminderCooldownError';
    this.retryAfterSeconds = retryAfterSeconds;
    this.cooldownSeconds = cooldownSeconds;
  }
}

/**
 * Titik kirim terpusat untuk notifikasi pengingat tidur (in-app, browser push, dan email).
 * Email belum aktif karena SMTP env diberikan belakangan; fungsi ini menjadi
 * satu-satunya titik integrasi ketika kredensial SMTP tersedia.
 */
export async function notifyReminder(params: NotifyReminderParams): Promise<void> {
  // Titik ekstensi: saat SMTP env (SMTP_HOST, SMTP_USER, dll.) tersedia di kemudian hari:
  // if (process.env.SMTP_HOST && params.target.email) {
  //   await sendEmailReminder(params);
  // }
  console.log(
    `[reminder] Notifikasi pengingat ${params.reminderId} terkirim dari ${params.sender.name} ke ${params.target.name}`
  );
}

/**
 * Mengirim pengingat tidur dari sender ke target.
 * Dibatasi aturan cooldown 5 menit per pasangan sender-target.
 */
export async function sendSleepReminder(
  senderId: string,
  targetId: string,
  now: Date = new Date()
): Promise<SleepReminderRecord> {
  if (!targetId || typeof targetId !== 'string' || targetId.trim().length === 0) {
    const err = new Error('targetUserId wajib diisi');
    (err as any).statusCode = 400;
    throw err;
  }

  if (targetId === senderId) {
    const err = new Error('Tidak bisa mengirim pengingat tidur ke diri sendiri');
    (err as any).statusCode = 400;
    throw err;
  }

  const db = getDb();

  const senderUser = db
    .prepare('SELECT id, name FROM users WHERE id = ?')
    .get(senderId) as { id: string; name: string } | undefined;

  if (!senderUser) {
    const err = new Error('Pengguna pengirim tidak ditemukan');
    (err as any).statusCode = 401;
    throw err;
  }

  const targetUser = db
    .prepare('SELECT id, name, email FROM users WHERE id = ?')
    .get(targetId) as { id: string; name: string; email?: string } | undefined;

  if (!targetUser) {
    const err = new Error('Pengguna target tidak ditemukan');
    (err as any).statusCode = 404;
    throw err;
  }

  // Cek waktu kirim terakhir per pasangan pengirim-target
  const lastReminder = db
    .prepare(
      `SELECT created_at 
       FROM sleep_reminders 
       WHERE sender_id = ? AND target_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`
    )
    .get(senderId, targetId) as { created_at: string } | undefined;

  if (lastReminder) {
    const lastTime = new Date(lastReminder.created_at).getTime();
    const currentTime = now.getTime();
    const elapsedSeconds = (currentTime - lastTime) / 1000;

    if (elapsedSeconds < REMINDER_COOLDOWN_SECONDS) {
      const retryAfterSeconds = Math.max(1, Math.ceil(REMINDER_COOLDOWN_SECONDS - elapsedSeconds));
      throw new ReminderCooldownError(retryAfterSeconds, REMINDER_COOLDOWN_SECONDS);
    }
  }

  const reminderId = `rem-${crypto.randomUUID()}`;
  const createdAtStr = now.toISOString();

  db.prepare(
    `INSERT INTO sleep_reminders (id, sender_id, target_id, created_at, read_at)
     VALUES (?, ?, ?, ?, NULL)`
  ).run(reminderId, senderId, targetId, createdAtStr);

  await notifyReminder({
    reminderId,
    sender: senderUser,
    target: targetUser,
    createdAt: createdAtStr
  });

  return {
    id: reminderId,
    senderId,
    targetId,
    createdAt: createdAtStr,
    readAt: null,
    cooldownSeconds: REMINDER_COOLDOWN_SECONDS
  };
}

/**
 * Mengambil sisa durasi cooldown (dalam detik) untuk seluruh target user
 * yang pernah diingatkan oleh sender dalam kurun 5 menit terakhir.
 */
export function getActiveCooldowns(
  senderId: string,
  now: Date = new Date()
): Record<string, number> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT target_id, MAX(created_at) as last_sent_at
       FROM sleep_reminders
       WHERE sender_id = ?
       GROUP BY target_id`
    )
    .all(senderId) as { target_id: string; last_sent_at: string }[];

  const cooldowns: Record<string, number> = {};
  const currentTime = now.getTime();

  for (const row of rows) {
    const lastTime = new Date(row.last_sent_at).getTime();
    const elapsedSeconds = (currentTime - lastTime) / 1000;
    if (elapsedSeconds < REMINDER_COOLDOWN_SECONDS) {
      cooldowns[row.target_id] = Math.max(1, Math.ceil(REMINDER_COOLDOWN_SECONDS - elapsedSeconds));
    }
  }

  return cooldowns;
}

/**
 * Mengambil daftar notifikasi pengingat tidur yang belum dibaca untuk user target.
 */
export function getUnreadReminders(targetId: string): UnreadReminderItem[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT r.id, r.sender_id as senderId, u.name as senderName, u.avatar as senderAvatar, r.created_at as createdAt
       FROM sleep_reminders r
       JOIN users u ON r.sender_id = u.id
       WHERE r.target_id = ? AND r.read_at IS NULL
       ORDER BY r.created_at ASC`
    )
    .all(targetId) as {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    createdAt: string;
  }[];

  return rows.map((r) => ({
    ...r,
    message: `${r.senderName} mengingatkan kamu untuk tidur!`
  }));
}

/**
 * Menandai satu notifikasi pengingat sebagai dibaca.
 */
export function markReminderAsRead(
  targetId: string,
  reminderId: string,
  readAt: Date = new Date()
): boolean {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE sleep_reminders 
       SET read_at = ? 
       WHERE id = ? AND target_id = ? AND read_at IS NULL`
    )
    .run(readAt.toISOString(), reminderId, targetId);

  return result.changes > 0;
}

/**
 * Menandai seluruh notifikasi pengingat yang belum dibaca untuk user target sebagai dibaca.
 */
export function markAllRemindersAsRead(
  targetId: string,
  readAt: Date = new Date()
): number {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE sleep_reminders 
       SET read_at = ? 
       WHERE target_id = ? AND read_at IS NULL`
    )
    .run(readAt.toISOString(), targetId);

  return Number(result.changes);
}
