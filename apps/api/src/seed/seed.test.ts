import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { runSeed } from './seed.js';
import {
  SEED_USERS,
  generateSeedSessions,
  generateSeedUserCards,
  SEED_LEADERBOARD_COMMITS,
  CARDS_METADATA
} from './seed-data.js';

describe('Seed Service (apps/api/src/seed)', () => {
  it('menjalankan seed ke database SQLite in-memory dengan sukses', async () => {
    const db = new DatabaseSync(':memory:');
    const result = await runSeed(db);

    expect(result.usersCount).toBe(12);
    expect(result.sessionsCount).toBe(12 * 21); // 12 user * 21 malam (3 minggu)
    expect(result.cardsCount).toBeGreaterThan(0);
    expect(result.commitsCount).toBe(1);

    // Verifikasi jumlah user di database
    const usersInDb = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    expect(usersInDb.count).toBe(12);

    // Verifikasi jumlah sesi di database
    const sessionsInDb = db
      .prepare('SELECT COUNT(*) as count FROM sleep_sessions')
      .get() as { count: number };
    expect(sessionsInDb.count).toBe(12 * 21);

    // Verifikasi commit minggu 2026-W45 ada di database dengan hash asli
    const commitInDb = db
      .prepare('SELECT * FROM leaderboard_commits WHERE week_id = ?')
      .get('2026-W45') as { week_id: string; hash: string } | undefined;
    expect(commitInDb).toBeDefined();
    expect(commitInDb?.week_id).toBe('2026-W45');
    expect(commitInDb?.hash).toBe('0x94d72efbc489f168e4aec17e89b1a1ac610ed3888e598dd9921d143af3ae70d0');
  });

  describe('Validasi 12 Simplimates FIKTIF', () => {
    it('memiliki tepat 12 profil unik dengan nama Indonesia netral', () => {
      expect(SEED_USERS.length).toBe(12);

      const ids = new Set(SEED_USERS.map((u) => u.id));
      expect(ids.size).toBe(12);

      const names = new Set(SEED_USERS.map((u) => u.name));
      expect(names.size).toBe(12);

      // Verifikasi format avatar
      for (const user of SEED_USERS) {
        expect(user.avatar.length).toBeGreaterThan(0);
        expect(user.walletAddress.startsWith('0x')).toBe(true);
        expect(user.email.endsWith('@simplidots.example.com')).toBe(true);
      }
    });
  });

  describe('Validasi Riwayat Tidur 3 Minggu', () => {
    it('mencakup variasi perilaku: konsisten, begadang, membaik, broken, dan flagged', () => {
      const sessions = generateSeedSessions();

      // Harus ada sesi broken
      const brokenSessions = sessions.filter((s) => s.status === 'broken');
      expect(brokenSessions.length).toBeGreaterThanOrEqual(1);

      // Harus ada sesi flagged (durasi < 2 jam)
      const flaggedSessions = sessions.filter((s) => s.status === 'flagged');
      expect(flaggedSessions.length).toBeGreaterThanOrEqual(1);

      // Sesi completed memiliki skor > 0
      const completedSessions = sessions.filter((s) => s.status === 'completed');
      expect(completedSessions.length).toBeGreaterThan(0);
      for (const s of completedSessions) {
        expect(s.score).toBeGreaterThanOrEqual(0);
        expect(s.score).toBeLessThanOrEqual(100);
      }

      // Verifikasi persona 'gilang-ramadhan' (Paling Membaik)
      const gilangSessions = sessions.filter((s) => s.userId === 'gilang-ramadhan');
      const w45Avg =
        gilangSessions.slice(0, 7).reduce((acc, s) => acc + s.score, 0) / 7;
      const w47Avg =
        gilangSessions.slice(14, 21).reduce((acc, s) => acc + s.score, 0) / 7;
      expect(w47Avg).toBeGreaterThan(w45Avg + 30); // Peningkatan signifikan
    });

    it('sesi seed budi-santoso memiliki jam mulai WIB antara 21:00 dan 03:00', () => {
      const sessions = generateSeedSessions();
      const budiSessions = sessions.filter((s) => s.userId === 'budi-santoso');
      expect(budiSessions.length).toBe(21);

      for (const session of budiSessions) {
        const d = new Date(session.startedAt);
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Jakarta',
          hour12: false,
          hour: 'numeric',
          minute: 'numeric'
        }).formatToParts(d);

        const hour = parseInt(parts.find((p) => p.type === 'hour')!.value, 10);
        const minute = parseInt(parts.find((p) => p.type === 'minute')!.value, 10);
        const timeInMinutes = hour * 60 + minute;

        // Antara 21:00 (1260 menit) dan 03:00 (180 menit)
        const isBetween21And03 = timeInMinutes >= 21 * 60 || timeInMinutes <= 3 * 60;
        expect(isBetween21And03).toBe(true);
      }
    });

    it('menghasilkan konsistensi jam tidur (calculateBedtimeDiff) yang wajar terhadap data seed', async () => {
      const { setDb, closeDb } = await import('../db/index.js');
      const { calculateBedtimeDiff } = await import('../services/sleep.js');

      const db = new DatabaseSync(':memory:');
      setDb(db);
      await runSeed(db);

      // Budi konsisten tidur jam 23:00 WIB (16:00 UTC).
      // Saat tidur kembali jam 23:00 WIB, selisih median harus 0 menit.
      const diffExact = calculateBedtimeDiff('budi-santoso', '2026-11-22T16:00:00.000Z');
      expect(diffExact).toBe(0);

      // Saat tidur jam 23:30 WIB (+30 menit), selisih median harus 30 menit.
      const diff30m = calculateBedtimeDiff('budi-santoso', '2026-11-22T16:30:00.000Z');
      expect(diff30m).toBe(30);

      closeDb();
    });
  });

  describe('Validasi Kartu Koleksi & Rarity', () => {
    it('kartu konsisten dengan cards.json dan aturan rarity', () => {
      const cards = generateSeedUserCards();
      expect(cards.length).toBeGreaterThan(0);

      const foundRarities = new Set<string>();

      for (const card of cards) {
        // cardId harus ada di CARDS_METADATA
        const meta = CARDS_METADATA[card.cardId];
        expect(meta).toBeDefined();
        expect(card.rarity).toBe(meta.rarity);
        expect(card.cardNumber).toBeGreaterThanOrEqual(1);
        expect(card.cardNumber).toBeLessThanOrEqual(28);

        // Status harus valid
        expect(['minted', 'pending-mint']).toContain(card.status);

        if (card.status === 'minted') {
          expect(card.tokenId).toBeDefined();
          expect(card.txHash?.startsWith('0x')).toBe(true);
        }

        foundRarities.add(card.rarity);
      }

      // Harus memuat semua 4 tier rarity: Common, Rare, Epic, Legendary
      expect(foundRarities.has('Common')).toBe(true);
      expect(foundRarities.has('Rare')).toBe(true);
      expect(foundRarities.has('Epic')).toBe(true);
      expect(foundRarities.has('Legendary')).toBe(true);
    });
  });
});
