import crypto from 'node:crypto';
import { nightScore, calculateStreak, type SleepSession, type NightScore } from 'shared';
import { getDb } from '../db/index.js';
import { rollCardDrop, type CardCatalogItem } from './catalog.js';
import { mintCard, cardNumberFromSlug, resolveMintRecipient } from './chain.js';

export interface SleepSessionRecord {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  status: 'active' | 'completed' | 'broken' | 'flagged';
  score: number;
  date: string;
  last_heartbeat?: string | null;
  userId?: string;
  startedAt?: string;
  endedAt?: string | null;
  durationMinutes?: number;
}

/**
 * Memformat SleepSessionRecord ke dalam bentuk camelCase sesuai interface SleepSession web,
 * dengan tetap mempertahankan alias snake_case agar tidak merusak DB mapping / legacy caller.
 */
export function formatSleepSession(record: SleepSessionRecord): SleepSession & SleepSessionRecord {
  const startedAt = record.startedAt || record.started_at;
  const userId = record.userId || record.user_id;
  const endedAt = record.endedAt !== undefined ? record.endedAt : record.ended_at;
  const durationMinutes =
    record.durationMinutes !== undefined ? record.durationMinutes : record.duration_minutes;

  return {
    id: record.id,
    userId,
    startedAt,
    endedAt,
    durationMinutes,
    status: record.status,
    score: record.score,
    date: record.date,
    // snake_case aliases untuk kompatibilitas penuh:
    user_id: userId,
    started_at: startedAt,
    ended_at: endedAt,
    duration_minutes: durationMinutes,
    last_heartbeat: record.last_heartbeat ?? null
  };
}

/**
 * Mengembalikan tanggal lokal saat ini dalam zona waktu Asia/Jakarta (format: YYYY-MM-DD).
 */
export function getJakartaDateStr(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

/**
 * Mengonversi ISO date string ke menit relatif dari jam 12:00 siang WIB.
 * Ini menghindari diskontinuitas jam tidur di sekitar tengah malam (23:30 -> 00:30).
 */
export function toMinutesFromNoonJakarta(isoStr: string): number {
  const d = new Date(isoStr);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric'
  });

  const parts = formatter.formatToParts(d);
  let hour = 0;
  let minute = 0;
  for (const p of parts) {
    if (p.type === 'hour') hour = parseInt(p.value, 10);
    if (p.type === 'minute') minute = parseInt(p.value, 10);
  }

  // Petakan jam 12:00 - 23:59 -> 0 s/d 719 menit
  // Petakan jam 00:00 - 11:59 -> 720 s/d 1439 menit
  const normalizedHour = hour >= 12 ? hour - 12 : hour + 12;
  return normalizedHour * 60 + minute;
}

/**
 * Menghitung selisih (dalam menit) jam mulai tidur terhadap median 7 hari terakhir.
 */
export function calculateBedtimeDiff(userId: string, currentStartIso: string): number {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT started_at FROM sleep_sessions 
       WHERE user_id = ? AND status IN ('completed', 'broken') AND ended_at IS NOT NULL 
       ORDER BY started_at DESC LIMIT 7`
    )
    .all(userId) as { started_at: string }[];

  if (!rows || rows.length === 0) {
    return 0; // Tidak ada riwayat -> konsistensi penuh
  }

  const minutesList = rows.map((r) => toMinutesFromNoonJakarta(r.started_at)).sort((a, b) => a - b);
  const mid = Math.floor(minutesList.length / 2);
  const medianMinutes =
    minutesList.length % 2 !== 0
      ? minutesList[mid]
      : Math.round((minutesList[mid - 1] + minutesList[mid]) / 2);

  const currentMinutes = toMinutesFromNoonJakarta(currentStartIso);
  return Math.abs(currentMinutes - medianMinutes);
}

/**
 * Memulai sesi tidur baru (waktu SERVER).
 */
export function startSleepSession(userId: string): SleepSession & SleepSessionRecord {
  const db = getDb();

  // Pastikan tidak ada sesi aktif yang belum selesai
  const active = db
    .prepare(
      "SELECT * FROM sleep_sessions WHERE user_id = ? AND ended_at IS NULL AND status IN ('active', 'broken') LIMIT 1"
    )
    .get(userId) as SleepSessionRecord | undefined;

  if (active) {
    throw new Error('Pengguna sudah memiliki sesi tidur yang sedang aktif');
  }

  const id = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const dateStr = getJakartaDateStr();

  db.prepare(`
    INSERT INTO sleep_sessions (id, user_id, started_at, ended_at, duration_minutes, status, score, date, last_heartbeat)
    VALUES (?, ?, ?, NULL, 0, 'active', 0, ?, NULL)
  `).run(id, userId, startedAt, dateStr);

  return formatSleepSession({
    id,
    user_id: userId,
    userId,
    started_at: startedAt,
    startedAt,
    ended_at: null,
    endedAt: null,
    duration_minutes: 0,
    durationMinutes: 0,
    status: 'active',
    score: 0,
    date: dateStr,
    last_heartbeat: null
  });
}

/**
 * Menerima heartbeat dari aplikasi: jika pengguna sedang dalam status 'active' tidur,
 * tandai sesi sebagai 'broken' dan catat last_heartbeat.
 */
export function recordHeartbeat(userId: string): { status: 'broken' | 'ok' } {
  const db = getDb();

  const active = db
    .prepare(
      "SELECT * FROM sleep_sessions WHERE user_id = ? AND ended_at IS NULL AND status = 'active' LIMIT 1"
    )
    .get(userId) as SleepSessionRecord | undefined;

  if (active) {
    const now = new Date().toISOString();
    db.prepare('UPDATE sleep_sessions SET status = ?, last_heartbeat = ? WHERE id = ?').run(
      'broken',
      now,
      active.id
    );
    return { status: 'broken' };
  }

  return { status: 'ok' };
}

/**
 * Bangun dari tidur: menghitung durasi, konsistensi, skor malam, dan peluang drop kartu.
 */
export async function wakeSleepSession(
  userId: string,
  options?: { forceDrop?: boolean }
): Promise<{
  session: SleepSession & SleepSessionRecord;
  score: NightScore;
  drop?: {
    card: CardCatalogItem & {
      tokenId?: string;
      txHash?: string;
      status: 'minted' | 'pending-mint';
    };
  };
}> {
  const db = getDb();

  const active = db
    .prepare(
      "SELECT * FROM sleep_sessions WHERE user_id = ? AND ended_at IS NULL AND status IN ('active', 'broken') LIMIT 1"
    )
    .get(userId) as SleepSessionRecord | undefined;

  if (!active) {
    throw new Error('Tidak ada sesi tidur aktif yang ditemukan');
  }

  const endedAt = new Date().toISOString();
  const startTime = new Date(active.started_at).getTime();
  const endTime = new Date(endedAt).getTime();
  const durationMinutes = Math.max(0, Math.round((endTime - startTime) / 60000));
  const durationHours = durationMinutes / 60;

  let finalStatus: 'completed' | 'broken' | 'flagged';
  let finalScore = 0;
  let scoreResult: NightScore;

  // Log janggal (durasi < 2 jam atau > 14 jam) ditandai 'flagged' dan skor 0
  if (durationHours < 2 || durationHours > 14) {
    finalStatus = 'flagged';
    finalScore = 0;
    scoreResult = {
      score: 0,
      durationScore: 0,
      consistencyScore: 0,
      label: 'Kurang',
      durationHours: Math.round(durationHours * 10) / 10
    };
  } else {
    finalStatus = active.status === 'broken' ? 'broken' : 'completed';
    const diffMinutes = calculateBedtimeDiff(userId, active.started_at);
    scoreResult = nightScore(durationHours, diffMinutes);
    finalScore = scoreResult.score;
  }

  db.prepare(`
    UPDATE sleep_sessions
    SET ended_at = ?, duration_minutes = ?, status = ?, score = ?
    WHERE id = ?
  `).run(endedAt, durationMinutes, finalStatus, finalScore, active.id);

  const updatedSession = formatSleepSession({
    id: active.id,
    user_id: userId,
    userId,
    started_at: active.started_at,
    startedAt: active.started_at,
    ended_at: endedAt,
    endedAt,
    duration_minutes: durationMinutes,
    durationMinutes,
    status: finalStatus,
    score: finalScore,
    date: active.date,
    last_heartbeat: active.last_heartbeat
  });

  // Drop kartu jika skor >= 70 (peluang 60%), atau jika forceDrop diaktifkan
  let dropResult: {
    card: CardCatalogItem & {
      tokenId?: string;
      txHash?: string;
      status: 'minted' | 'pending-mint';
    };
  } | undefined = undefined;

  if (finalScore >= 70 || options?.forceDrop) {
    const droppedCard = rollCardDrop(options?.forceDrop ? 1.0 : 0.6);
    if (droppedCard) {
      const user = db.prepare('SELECT wallet_address FROM users WHERE id = ?').get(userId) as
        | { wallet_address: string }
        | undefined;

      const cardNumber =
        droppedCard.cardNumber || cardNumberFromSlug(droppedCard.id) || 1;
      const userCardId = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      // Simpan awal ke DB dengan status 'pending-mint'
      db.prepare(`
        INSERT INTO user_cards (id, user_id, card_id, card_number, name, rarity, token_id, tx_hash, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, 'pending-mint', ?)
      `).run(
        userCardId,
        userId,
        droppedCard.id,
        cardNumber,
        droppedCard.name,
        droppedCard.rarity,
        nowIso
      );

      let mintStatus: 'minted' | 'pending-mint' = 'pending-mint';
      let tokenId: string | undefined;
      let txHash: string | undefined;

      // Coba mint ke Sepolia jika wallet user tersedia (atau jika demo wallet terkonfigurasi untuk user demo)
      const recipientAddress = resolveMintRecipient(user?.wallet_address ?? '', userId);
      if (recipientAddress) {
        try {
          const res = await mintCard(recipientAddress, cardNumber, userId);
          mintStatus = res.status;
          tokenId = res.tokenId;
          txHash = res.txHash;

          if (mintStatus === 'minted') {
            db.prepare(`
              UPDATE user_cards 
              SET token_id = ?, tx_hash = ?, status = 'minted'
              WHERE id = ?
            `).run(tokenId ?? null, txHash ?? null, userCardId);
          }
        } catch {
          // Tetap 'pending-mint' bila gagal panggil chain
        }
      }

      dropResult = {
        card: {
          ...droppedCard,
          tokenId,
          txHash,
          status: mintStatus
        }
      };
    }
  }

  return {
    session: updatedSession,
    score: scoreResult,
    drop: dropResult
  };
}

/**
 * Simulasi tidur 8 jam untuk akun demo resmi:
 * - Menyiapkan sesi tidur mundur 8 jam dari waktu sekarang
 * - Memanggil alur wakeSleepSession dengan forceDrop: true agar kartu PASTI diperoleh
 */
export async function simulateNightSession(userId: string) {
  const db = getDb();

  const active = db
    .prepare(
      "SELECT * FROM sleep_sessions WHERE user_id = ? AND ended_at IS NULL AND status IN ('active', 'broken') LIMIT 1"
    )
    .get(userId) as SleepSessionRecord | undefined;

  const now = new Date();
  const eightHoursAgo = new Date(now.getTime() - 8 * 3600 * 1000).toISOString();
  const dateStr = getJakartaDateStr(now);

  if (active) {
    db.prepare(`
      UPDATE sleep_sessions 
      SET started_at = ?, status = 'active', date = ?
      WHERE id = ?
    `).run(eightHoursAgo, dateStr, active.id);
  } else {
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO sleep_sessions (id, user_id, started_at, ended_at, duration_minutes, status, score, date, last_heartbeat)
      VALUES (?, ?, ?, NULL, 0, 'active', 0, ?, NULL)
    `).run(id, userId, eightHoursAgo, dateStr);
  }

  return wakeSleepSession(userId, { forceDrop: true });
}

/**
 * Menghitung streak aktif user dari riwayat sesi tidur.
 */
export function getUserStreak(userId: string): number {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT score FROM sleep_sessions 
       WHERE user_id = ? AND status IN ('completed', 'broken') AND ended_at IS NOT NULL 
       ORDER BY date ASC, started_at ASC`
    )
    .all(userId) as { score: number }[];

  return calculateStreak(rows.map((r) => r.score));
}
