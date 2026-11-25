import { describe, it, expect } from 'vitest';
import {
  durationScore,
  consistencyScore,
  nightScore,
  getSleepLabel,
  calculateStreak,
  getWeekId
} from '../scoring.js';

describe('durationScore (SPEC: 100 jika 7-9j, turun linear ke 0 di 4j dan di 12j)', () => {
  it('memberikan skor 0 pada batas 4 jam atau kurang', () => {
    expect(durationScore(4)).toBe(0);
    expect(durationScore(3)).toBe(0);
    expect(durationScore(0)).toBe(0);
  });

  it('memberikan skor 100 pada batas 7 jam sampai 9 jam', () => {
    expect(durationScore(7)).toBe(100);
    expect(durationScore(7.5)).toBe(100);
    expect(durationScore(8)).toBe(100);
    expect(durationScore(9)).toBe(100);
  });

  it('memberikan skor 0 pada batas 12 jam atau lebih', () => {
    expect(durationScore(12)).toBe(0);
    expect(durationScore(13)).toBe(0);
    expect(durationScore(14)).toBe(0);
  });

  it('turun linear antara 4 jam dan 7 jam', () => {
    // 5.5 jam adalah tepat di tengah 4 dan 7 -> skor 50
    expect(durationScore(5.5)).toBe(50);
    // 5 jam -> (5 - 4) / 3 * 100 = 33.33
    expect(durationScore(5)).toBeCloseTo(33.33, 1);
  });

  it('turun linear antara 9 jam dan 12 jam', () => {
    // 10.5 jam adalah tepat di tengah 9 dan 12 -> skor 50
    expect(durationScore(10.5)).toBe(50);
    // 10 jam -> (12 - 10) / 3 * 100 = 66.67
    expect(durationScore(10)).toBeCloseTo(66.67, 1);
  });
});

describe('consistencyScore (SPEC: selisih <= 30m penuh 100, >= 120m nol 0)', () => {
  it('memberikan 100 jika selisih <= 30 menit (positif atau negatif)', () => {
    expect(consistencyScore(0)).toBe(100);
    expect(consistencyScore(15)).toBe(100);
    expect(consistencyScore(30)).toBe(100);
    expect(consistencyScore(-30)).toBe(100);
  });

  it('memberikan 0 jika selisih >= 120 menit (positif atau negatif)', () => {
    expect(consistencyScore(120)).toBe(0);
    expect(consistencyScore(150)).toBe(0);
    expect(consistencyScore(-120)).toBe(0);
    expect(consistencyScore(-200)).toBe(0);
  });

  it('turun linear antara 30 dan 120 menit', () => {
    // 75 menit adalah tepat di tengah 30 dan 120 -> skor 50
    expect(consistencyScore(75)).toBe(50);
    expect(consistencyScore(-75)).toBe(50);
  });
});

describe('getSleepLabel (Sehat / Kurang / Kebanyakan)', () => {
  it('mengembalikan "Kurang" untuk durasi < 7 jam', () => {
    expect(getSleepLabel(4)).toBe('Kurang');
    expect(getSleepLabel(6.9)).toBe('Kurang');
  });

  it('mengembalikan "Sehat" untuk durasi 7-9 jam', () => {
    expect(getSleepLabel(7)).toBe('Sehat');
    expect(getSleepLabel(8)).toBe('Sehat');
    expect(getSleepLabel(9)).toBe('Sehat');
  });

  it('mengembalikan "Kebanyakan" untuk durasi > 9 jam', () => {
    expect(getSleepLabel(9.1)).toBe('Kebanyakan');
    expect(getSleepLabel(11)).toBe('Kebanyakan');
  });
});

describe('nightScore (round(0.7*durasi + 0.3*konsistensi))', () => {
  it('menghitung skor gabungan sempurna', () => {
    const res = nightScore(8, 20);
    expect(res.durationScore).toBe(100);
    expect(res.consistencyScore).toBe(100);
    expect(res.score).toBe(100);
    expect(res.label).toBe('Sehat');
  });

  it('menghitung skor gabungan minimal', () => {
    const res = nightScore(4, 120);
    expect(res.durationScore).toBe(0);
    expect(res.consistencyScore).toBe(0);
    expect(res.score).toBe(0);
    expect(res.label).toBe('Kurang');
  });

  it('melakukan pembulatan dengan benar', () => {
    // Durasi 5.5j = 50, Konsistensi 75m = 50 -> 0.7*50 + 0.3*50 = 50
    const res = nightScore(5.5, 75);
    expect(res.score).toBe(50);
  });
});

describe('calculateStreak (jumlah malam berturut-turut skor >= 70)', () => {
  it('menghitung streak dari array ascending', () => {
    expect(calculateStreak([60, 75, 80, 85])).toBe(3);
    expect(calculateStreak([70, 75, 80])).toBe(3);
  });

  it('berhenti jika skor terakhir < 70', () => {
    expect(calculateStreak([80, 90, 65])).toBe(0);
  });

  it('mengembalikan 0 untuk array kosong', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('mendukung objek berformat { score }', () => {
    expect(
      calculateStreak([{ score: 60 }, { score: 70 }, { score: 85 }])
    ).toBe(2);
  });
});

describe('getWeekId Asia/Jakarta (Senin-Minggu format YYYY-Www)', () => {
  it('menghasilkan format yang sesuai', () => {
    const weekId = getWeekId('2026-11-21T10:00:00Z');
    expect(weekId).toMatch(/^\d{4}-W\d{2}$/);
    expect(weekId).toBe('2026-W47');
  });

  it('menghormati pergantian hari di zona waktu Asia/Jakarta (WIB UTC+7)', () => {
    // Minggu 22 Nov 2026 pukul 23:59 WIB = 2026-11-22T16:59:00Z -> W47
    const sundayNight = getWeekId('2026-11-22T16:59:00Z');
    expect(sundayNight).toBe('2026-W47');

    // Senin 23 Nov 2026 pukul 00:01 WIB = 2026-11-22T17:01:00Z -> W48
    const mondayDawn = getWeekId('2026-11-22T17:01:00Z');
    expect(mondayDawn).toBe('2026-W48');
  });
});
