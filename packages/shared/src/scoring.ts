import { NightScore, SleepLabel } from './types.js';

/**
 * Skor durasi tidur (0 - 100):
 * - 100 jika 7 - 9 jam
 * - Turun linear ke 0 di 4 jam dan di 12 jam
 * - 0 jika < 4 jam atau > 12 jam
 */
export function durationScore(hours: number): number {
  if (hours <= 4 || hours >= 12) {
    return 0;
  }
  if (hours >= 7 && hours <= 9) {
    return 100;
  }
  if (hours > 4 && hours < 7) {
    const raw = ((hours - 4) / 3) * 100;
    return Math.round(raw * 100) / 100;
  }
  // hours > 9 && hours < 12
  const raw = ((12 - hours) / 3) * 100;
  return Math.round(raw * 100) / 100;
}

/**
 * Skor konsistensi (0 - 100):
 * - Bonus/penalti dari selisih jam tidur terhadap median 7 hari terakhir
 * - Selisih <= 30 menit: 100 (penuh)
 * - Selisih >= 120 menit: 0 (nol)
 * - Antara 30 dan 120 menit: turun linear dari 100 ke 0
 */
export function consistencyScore(diffMinutes: number): number {
  const absDiff = Math.abs(diffMinutes);
  if (absDiff <= 30) {
    return 100;
  }
  if (absDiff >= 120) {
    return 0;
  }
  const raw = ((120 - absDiff) / 90) * 100;
  return Math.round(raw * 100) / 100;
}

/**
 * Kategori label tidur berdasarkan durasi jam tidur:
 * - < 7 jam: 'Kurang'
 * - 7 - 9 jam: 'Sehat'
 * - > 9 jam: 'Kebanyakan'
 */
export function getSleepLabel(durationHours: number): SleepLabel {
  if (durationHours < 7) {
    return 'Kurang';
  }
  if (durationHours <= 9) {
    return 'Sehat';
  }
  return 'Kebanyakan';
}

/**
 * Hitung skor malam (0 - 100):
 * round(0.7 * durasi + 0.3 * konsistensi)
 */
export function nightScore(durationHours: number, diffMinutes: number): NightScore {
  const dScore = durationScore(durationHours);
  const cScore = consistencyScore(diffMinutes);
  const total = Math.round(0.7 * dScore + 0.3 * cScore);
  const boundedScore = Math.max(0, Math.min(100, total));
  const label = getSleepLabel(durationHours);

  return {
    score: boundedScore,
    durationScore: dScore,
    consistencyScore: cScore,
    label,
    durationHours
  };
}

/**
 * Menghitung streak malam berturut-turut dengan skor >= 70.
 * Default mengasumsikan urutan kronologis ascending (elemen terakhir adalah yang terbaru).
 * Jika order === 'desc', elemen pertama adalah yang terbaru.
 */
export function calculateStreak(
  scores: Array<number | { score: number }>,
  order: 'asc' | 'desc' = 'asc'
): number {
  if (!scores || scores.length === 0) {
    return 0;
  }

  const rawScores = scores.map((item) => (typeof item === 'number' ? item : item.score));
  const list = order === 'asc' ? [...rawScores].reverse() : [...rawScores];

  let streak = 0;
  for (const s of list) {
    if (s >= 70) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Mengembalikan weekId dalam format YYYY-Www berdasarkan kalender ISO 8601 di zona waktu Asia/Jakarta (Senin - Minggu).
 */
export function getWeekId(dateInput: Date | string | number = new Date()): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateInput}`);
  }

  // Konversi ke tanggal lokal di Asia/Jakarta (WIB: UTC+7)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, number> = {};
  for (const p of parts) {
    if (p.type === 'year' || p.type === 'month' || p.type === 'day') {
      partMap[p.type] = parseInt(p.value, 10);
    }
  }

  const year = partMap['year'];
  const month = partMap['month'];
  const day = partMap['day'];

  // Buat UTC Date object untuk representasi hari lokal tersebut
  const target = new Date(Date.UTC(year, month - 1, day));

  // ISO day: 1 = Senin, ..., 7 = Minggu
  const isoDay = (target.getUTCDay() + 6) % 7 + 1;

  // Kamis minggu berjalan menentukan tahun ISO
  target.setUTCDate(target.getUTCDate() + 4 - isoDay);
  const isoYear = target.getUTCFullYear();

  // 1 Januari tahun ISO tersebut
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const weekNumber = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  const formattedWeek = String(weekNumber).padStart(2, '0');
  return `${isoYear}-W${formattedWeek}`;
}
