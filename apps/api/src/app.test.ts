import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { keccak256, toBytes } from 'viem';
import { app } from './app.js';
import { setDb, closeDb } from './db/index.js';
import { runSeed } from './seed/seed.js';
import { leaderboardHash } from './services/leaderboard.js';
import { getJwtSecret, createAuthToken } from './services/auth.js';
import { getEncryptionKey } from './services/wallet.js';

describe('SimpliSleep API Integration Tests (apps/api)', () => {
  let memDb: DatabaseSync;

  beforeEach(async () => {
    memDb = new DatabaseSync(':memory:');
    setDb(memDb);
    await runSeed(memDb);
  });

  afterEach(() => {
    closeDb();
  });

  it('GET /api/health mengembalikan status ok dan sqlite true', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.sqlite).toBe(true);
  });

  it('GET /api/demo-users mengembalikan tepat 3 pengguna demo resmi Simplimates', async () => {
    const res = await app.request('/api/demo-users');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(3);
    expect(body.map((u: any) => u.id)).toEqual(['budi-santoso', 'siti-rahma', 'gilang-ramadhan']);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('name');
    expect(body[0]).toHaveProperty('avatar');
    expect(body[0]).toHaveProperty('role');
    expect(body[0]).toHaveProperty('baseStreak');
    expect(typeof body[0].baseStreak).toBe('number');
    expect(body[0]).toHaveProperty('baseAvgScore');
    expect(typeof body[0].baseAvgScore).toBe('number');
  });

  it('POST /api/auth/demo mengembalikan token JWT dan data user untuk akun resmi', async () => {
    const res = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'budi-santoso' })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(body.user.id).toBe('budi-santoso');
    expect(body.user.walletAddress).toBeDefined();
    expect(body.user.walletPrivateKeyEnc).toBeUndefined(); // TIDAK pernah dikirim ke klien
  });

  it('POST /api/auth/demo untuk user seed di luar daftar demo resmi ditolak 403', async () => {
    // dewi-lestari ada di data seed (12 user), tetapi bukan akun demo resmi
    const res = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'dewi-lestari' })
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('Akses ditolak');
  });

  it('POST /api/auth/demo dengan userId tidak terdaftar/di luar daftar mengembalikan 403', async () => {
    const res = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-tidak-ada' })
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('Akses ditolak');
  });

  it('ENABLE_DEMO_LOGIN: saat nonaktif membalas 404 pada /api/auth/demo dan /api/demo-users', async () => {
    const prevEnv = process.env.ENABLE_DEMO_LOGIN;
    process.env.ENABLE_DEMO_LOGIN = 'false';

    try {
      const demoRes = await app.request('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'budi-santoso' })
      });
      expect(demoRes.status).toBe(404);

      const usersRes = await app.request('/api/demo-users');
      expect(usersRes.status).toBe(404);
    } finally {
      if (prevEnv !== undefined) {
        process.env.ENABLE_DEMO_LOGIN = prevEnv;
      } else {
        delete process.env.ENABLE_DEMO_LOGIN;
      }
    }
  });

  it('POST /api/auth/google tanpa GOOGLE_CLIENT_ID mengembalikan 501 Not Implemented', async () => {
    const originalClientId = process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_ID;

    const res = await app.request('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'dummy-token' })
    });

    expect(res.status).toBe(501);

    if (originalClientId) {
      process.env.GOOGLE_CLIENT_ID = originalClientId;
    }
  });

  it('Keamanan Startup Production: JWT_SECRET dan WALLET_ENC_KEY wajib ada di NODE_ENV=production', () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevJwt = process.env.JWT_SECRET;
    const prevWalletKey = process.env.WALLET_ENC_KEY;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;
      delete process.env.WALLET_ENC_KEY;

      expect(() => getJwtSecret()).toThrow('JWT_SECRET wajib dikonfigurasi');
      expect(() => getEncryptionKey()).toThrow('WALLET_ENC_KEY wajib dikonfigurasi');
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      if (prevJwt) process.env.JWT_SECRET = prevJwt;
      if (prevWalletKey) process.env.WALLET_ENC_KEY = prevWalletKey;
    }
  });

  it('Alur lengkap: login -> start -> heartbeat broken -> awake list -> wake + skor', async () => {
    // 1. Demo Login
    const loginRes = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'siti-rahma' })
    });
    expect(loginRes.status).toBe(200);
    const { token } = await loginRes.json();
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. GET /api/me
    const meRes = await app.request('/api/me', { headers: authHeaders });
    expect(meRes.status).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.user.id).toBe('siti-rahma');
    expect(meBody.user.walletAddress).toBeDefined();
    expect(meBody.user.walletAddress).toBe(meBody.wallet.address);
    expect(meBody.wallet.address).toBeDefined();
    expect(meBody.streak).toBeGreaterThanOrEqual(0);

    // 3. POST /api/sleep/start (Tombol "Mau tidur")
    const startRes = await app.request('/api/sleep/start', {
      method: 'POST',
      headers: authHeaders
    });
    expect(startRes.status).toBe(201);
    const startBody = await startRes.json();
    expect(startBody.status).toBe('active');
    expect(startBody.started_at).toBeDefined();
    expect(startBody.startedAt).toBeDefined();
    expect(typeof startBody.startedAt).toBe('string');
    expect(isNaN(Date.parse(startBody.startedAt))).toBe(false);
    expect(new Date(startBody.startedAt).toISOString()).toBe(startBody.startedAt);
    expect(startBody.userId).toBe('siti-rahma');

    // 4. Start kedua kali harus ditolak (sudah ada sesi aktif)
    const duplicateStartRes = await app.request('/api/sleep/start', {
      method: 'POST',
      headers: authHeaders
    });
    expect(duplicateStartRes.status).toBe(400);

    // 5. POST /api/heartbeat saat tidur -> sesi ditandai broken
    const heartbeatRes = await app.request('/api/heartbeat', {
      method: 'POST',
      headers: authHeaders
    });
    expect(heartbeatRes.status).toBe(200);
    const heartbeatBody = await heartbeatRes.json();
    expect(heartbeatBody.status).toBe('broken');

    // 6. GET /api/awake -> Siti Rahma harus muncul di daftar "Masih Melek"
    const awakeRes = await app.request('/api/awake');
    expect(awakeRes.status).toBe(200);
    const awakeBody = await awakeRes.json();
    expect(Array.isArray(awakeBody)).toBe(true);
    const sitiInAwake = awakeBody.find((u: { userId: string }) => u.userId === 'siti-rahma');
    expect(sitiInAwake).toBeDefined();
    expect(sitiInAwake?.name).toBe('Siti Rahma');
    expect(sitiInAwake?.role).toBeDefined();
    expect(typeof sitiInAwake?.sinceHoursAgo).toBe('number');
    expect(sitiInAwake?.reason).toBeUndefined();

    // Ubah started_at menjadi 8 jam yang lalu agar durasi valid dan mendapat skor
    const eightHoursAgo = new Date(Date.now() - 8 * 3600 * 1000).toISOString();
    memDb
      .prepare('UPDATE sleep_sessions SET started_at = ? WHERE id = ?')
      .run(eightHoursAgo, startBody.id);

    // 7. POST /api/sleep/wake (Tombol "Bangun")
    const wakeRes = await app.request('/api/sleep/wake', {
      method: 'POST',
      headers: authHeaders
    });
    expect(wakeRes.status).toBe(200);
    const wakeBody = await wakeRes.json();
    expect(wakeBody.session.ended_at).toBeDefined();
    expect(wakeBody.session.endedAt).toBeDefined();
    expect(wakeBody.session.startedAt).toBeDefined();
    expect(wakeBody.session.status).toBe('broken'); // Tetap broken karena sempat kena heartbeat
    expect(wakeBody.score.score).toBeGreaterThan(0);
    expect(wakeBody.score.durationScore).toBeGreaterThanOrEqual(0);
    expect(wakeBody.score.consistencyScore).toBeGreaterThanOrEqual(0);
    expect(wakeBody.score.label).toBeDefined();
    expect(wakeBody.score.durationHours).toBeGreaterThan(0);
    expect(wakeBody.session.duration_minutes).toBeGreaterThanOrEqual(470);
    expect(wakeBody.session.durationMinutes).toBeGreaterThanOrEqual(470);

    // 8. GET /api/awake setelah wake -> Siti Rahma tidak lagi di daftar Masih Melek
    const awakeAfterWake = await app.request('/api/awake');
    const awakeList = await awakeAfterWake.json();
    expect(awakeList.some((u: { userId: string }) => u.userId === 'siti-rahma')).toBe(false);

    // 9. GET /api/sleep/history -> mencakup sesi yang baru selesai
    const historyRes = await app.request('/api/sleep/history?days=7', {
      headers: authHeaders
    });
    expect(historyRes.status).toBe(200);
    const history = await historyRes.json();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    const latestItem = history[0];
    expect(latestItem.dayName).toBeDefined();
    expect(latestItem.durationHours).toBeDefined();
    expect(latestItem.label).toBeDefined();
    expect(latestItem.bedTime).toBeDefined();
    expect(latestItem.wakeTime).toBeDefined();
  });

  it('POST /api/sleep/start dan GET /api/me: respons memuat field camelCase startedAt ISO valid sesuai interface SleepSession', async () => {
    // Login Gilang Ramadhan
    const loginRes = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'gilang-ramadhan' })
    });
    const { token } = await loginRes.json();
    const headers = { Authorization: `Bearer ${token}` };

    // Start sleep
    const startRes = await app.request('/api/sleep/start', {
      method: 'POST',
      headers
    });
    expect(startRes.status).toBe(201);
    const session = await startRes.json();

    // Verifikasi field camelCase SleepSession
    expect(session.id).toBeDefined();
    expect(session.userId).toBe('gilang-ramadhan');
    expect(session.status).toBe('active');
    expect(session.startedAt).toBeDefined();
    expect(typeof session.startedAt).toBe('string');
    expect(isNaN(Date.parse(session.startedAt))).toBe(false);
    expect(new Date(session.startedAt).toISOString()).toBe(session.startedAt);
    expect(session.endedAt).toBeNull();
    expect(session.durationMinutes).toBe(0);

    // Verifikasi GET /api/me todayStatus menyertakan session dengan startedAt valid
    const meRes = await app.request('/api/me', { headers });
    expect(meRes.status).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.today.status).toBe('active');
    expect(meBody.today.startedAt).toBe(session.startedAt);
    expect(meBody.today.session).toBeDefined();
    expect(meBody.today.session.startedAt).toBe(session.startedAt);
    expect(meBody.today.session.userId).toBe('gilang-ramadhan');
  });

  it('Isolasi Data: /api/sleep/history HANYA mengembalikan data milik user yang sedang login', async () => {
    // Login Budi Santoso
    const budiLogin = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'budi-santoso' })
    });
    const { token: budiToken } = await budiLogin.json();

    // Login Siti Rahma
    const sitiLogin = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'siti-rahma' })
    });
    const { token: sitiToken } = await sitiLogin.json();

    // Query riwayat Budi
    const budiHistoryRes = await app.request('/api/sleep/history?days=30', {
      headers: { Authorization: `Bearer ${budiToken}` }
    });
    expect(budiHistoryRes.status).toBe(200);
    const budiHistory = await budiHistoryRes.json();

    // Query riwayat Siti
    const sitiHistoryRes = await app.request('/api/sleep/history?days=30', {
      headers: { Authorization: `Bearer ${sitiToken}` }
    });
    expect(sitiHistoryRes.status).toBe(200);
    const sitiHistory = await sitiHistoryRes.json();

    // Pastikan keduanya memiliki riwayat dari seed
    expect(budiHistory.length).toBeGreaterThan(0);
    expect(sitiHistory.length).toBeGreaterThan(0);

    // Verifikasi di DB bahwa sesi Budi tidak muncul di riwayat Siti
    const budiSessionsInDb = memDb
      .prepare('SELECT id FROM sleep_sessions WHERE user_id = ?')
      .all('budi-santoso') as { id: string }[];
    const budiSessionIds = new Set(budiSessionsInDb.map((s) => s.id));

    // Tidak ada sesi milik Budi yang tercampur ke Siti
    for (const item of sitiHistory) {
      if (item.id) {
        expect(budiSessionIds.has(item.id)).toBe(false);
      }
    }
  });

  it('Partial Unique Index: Database menolak lebih dari 1 sesi aktif (ended_at IS NULL) per user', () => {
    const id1 = 'session-active-1';
    const id2 = 'session-active-2';
    const now = new Date().toISOString();
    const userId = 'budi-santoso';

    // Sesi aktif pertama: sukses
    memDb
      .prepare(`
        INSERT INTO sleep_sessions (id, user_id, started_at, ended_at, duration_minutes, status, score, date)
        VALUES (?, ?, ?, NULL, 0, 'active', 0, '2026-11-21')
      `)
      .run(id1, userId, now);

    // Sesi aktif kedua untuk user yang sama: harus gagal constraint unique index
    expect(() => {
      memDb
        .prepare(`
          INSERT INTO sleep_sessions (id, user_id, started_at, ended_at, duration_minutes, status, score, date)
          VALUES (?, ?, ?, NULL, 0, 'active', 0, '2026-11-21')
        `)
        .run(id2, userId, now);
    }).toThrow(/UNIQUE constraint failed/);
  });

  it('GET /api/leaderboard mengembalikan baris terurut skor, kategori, dan komitmen', async () => {
    const res = await app.request('/api/leaderboard?week=2026-W45');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.week).toBe('2026-W45');
    expect(Array.isArray(body.rows)).toBe(true);
    expect(body.rows.length).toBeGreaterThan(0);

    // Baris terurut menurun berdasarkan skor
    for (let i = 0; i < body.rows.length - 1; i++) {
      expect(body.rows[i].avgScore).toBeGreaterThanOrEqual(body.rows[i + 1].avgScore);
      expect(body.rows[i].rank).toBe(i + 1);
    }

    // Privasi: tidak ada atribut detail jam tidur mentah di baris
    expect(body.rows[0].startedAt).toBeUndefined();
    expect(body.rows[0].endedAt).toBeUndefined();
    expect(body.rows[0]).toHaveProperty('label');
    expect(['Sehat', 'Kurang', 'Kebanyakan']).toContain(body.rows[0].label);

    // Minggu 2026-W45 memiliki komitmen di seed
    expect(body.commit).toBeDefined();
    expect(body.commit.hash.startsWith('0x')).toBe(true);
    expect(body.commit.timestamp).toBeDefined();

    // Verifikasi kategori memuat highlightStat, avgScore, dan diff
    expect(body.categories).toBeDefined();
    if (body.categories.mostConsistent) {
      expect(body.categories.mostConsistent.highlightStat).toBeDefined();
      expect(typeof body.categories.mostConsistent.avgScore).toBe('number');
    }
    if (body.categories.mostImproved) {
      expect(body.categories.mostImproved.highlightStat).toBeDefined();
      expect(typeof body.categories.mostImproved.diff).toBe('number');
      expect(typeof body.categories.mostImproved.avgScore).toBe('number');
    }
    if (body.categories.longestStreak) {
      expect(body.categories.longestStreak.highlightStat).toBeDefined();
      expect(typeof body.categories.longestStreak.streak).toBe('number');
    }
  });

  it('GET /api/cards/catalog dan GET /api/cards/me', async () => {
    // Catalog
    const catalogRes = await app.request('/api/cards/catalog');
    expect(catalogRes.status).toBe(200);
    const catalog = await catalogRes.json();
    expect(Array.isArray(catalog)).toBe(true);
    expect(catalog.length).toBe(28);

    // Login Budi Santoso (memiliki kartu di seed)
    const loginRes = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'budi-santoso' })
    });
    const { token } = await loginRes.json();

    const myCardsRes = await app.request('/api/cards/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(myCardsRes.status).toBe(200);
    const myCards = await myCardsRes.json();
    expect(Array.isArray(myCards)).toBe(true);
    expect(myCards.length).toBeGreaterThan(0);
    expect(myCards[0]).toHaveProperty('image');
  });

  it('GET /api/transparency mengembalikan riwayat komitmen minggu', async () => {
    const res = await app.request('/api/transparency');
    expect(res.status).toBe(200);
    const list = await res.json();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0]).toHaveProperty('week');
    expect(list[0]).toHaveProperty('hash');
  });

  it('leaderboardHash menghasilkan hash identik dengan keccak256(toBytes(...)) langsung', () => {
    const exampleRows = [{ rank: 1, userId: 'user-1', avgScore: 92.4 }];
    const expectedJson = '[{"rank":1,"userId":"user-1","avgScore":92.4}]';
    const directViemHash = keccak256(toBytes(expectedJson));

    const computed = leaderboardHash(exampleRows);
    expect(computed).toBe(directViemHash);

    // Pastikan urutan properti objek selalu persis: rank, userId, avgScore
    const unorganizedInput = [{ avgScore: 92.4, userId: 'user-1', rank: 1 }];
    expect(leaderboardHash(unorganizedInput)).toBe(directViemHash);
  });

  it('Komitmen minggu committed di seed menggunakan hash asli dari leaderboardHash', async () => {
    const res = await app.request('/api/leaderboard?week=2026-W45');
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.commit).toBeDefined();
    const calculatedHash = leaderboardHash(body.rows);
    expect(body.commit.hash).toBe(calculatedHash);
  });

  it('POST /api/admin/close-week: validasi keamanan token (503 bila kosong, 401 bila salah, 409 bila duplikat)', async () => {
    const prevAdminToken = process.env.ADMIN_TOKEN;

    try {
      // 1. Bila ADMIN_TOKEN di environment belum dikonfigurasi -> 503
      delete process.env.ADMIN_TOKEN;
      const noEnvRes = await app.request('/api/admin/close-week?week=2026-W47', {
        method: 'POST',
        headers: { 'x-admin-token': 'any-token' }
      });
      expect(noEnvRes.status).toBe(503);
      const noEnvBody = await noEnvRes.json();
      expect(noEnvBody.error).toContain('belum dikonfigurasi');

      // Set ADMIN_TOKEN rahasia untuk pengujian selanjutnya
      const secretToken = 'super-secret-admin-token-2026';
      process.env.ADMIN_TOKEN = secretToken;

      // 2. Tanpa header token -> 401
      const noHeaderRes = await app.request('/api/admin/close-week?week=2026-W47', {
        method: 'POST'
      });
      expect(noHeaderRes.status).toBe(401);

      // 3. Token salah (panjang berbeda atau nilai berbeda) -> 401
      const wrongTokenRes = await app.request('/api/admin/close-week?week=2026-W47', {
        method: 'POST',
        headers: { 'x-admin-token': 'wrong-token' }
      });
      expect(wrongTokenRes.status).toBe(401);

      // 4. Token benar pertama kali -> 200 OK
      const validRes = await app.request('/api/admin/close-week?week=2026-W47', {
        method: 'POST',
        headers: { 'x-admin-token': secretToken }
      });
      expect(validRes.status).toBe(200);
      const body = await validRes.json();
      expect(body.week).toBe('2026-W47');
      expect(body.hash.startsWith('0x')).toBe(true);

      // 5. Commit kedua kali pada minggu yang sama -> 409 Conflict
      const duplicateRes = await app.request('/api/admin/close-week?week=2026-W47', {
        method: 'POST',
        headers: { 'x-admin-token': secretToken }
      });
      expect(duplicateRes.status).toBe(409);
      const duplicateBody = await duplicateRes.json();
      expect(duplicateBody.error).toContain('sudah pernah di-commit');
    } finally {
      if (prevAdminToken !== undefined) {
        process.env.ADMIN_TOKEN = prevAdminToken;
      } else {
        delete process.env.ADMIN_TOKEN;
      }
    }
  });

  it('GET /api/cards/rarity-board: mengembalikan seluruh 28 kartu, dense rank saat seri, owners 0 muncul, dan privasi terjaga', async () => {
    const res = await app.request('/api/cards/rarity-board');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.totalUsers).toBe(12);
    expect(body.updatedAt).toBeDefined();
    expect(new Date(body.updatedAt).getTime()).not.toBeNaN();
    expect(Array.isArray(body.cards)).toBe(true);
    expect(body.cards.length).toBe(28);

    // 1. Owners 0 tetap muncul dan minimal 1 Legendary belum ditemukan
    const zeroOwnersCards = body.cards.filter((c: { owners: number }) => c.owners === 0);
    expect(zeroOwnersCards.length).toBeGreaterThanOrEqual(1);

    const legendaryZero = zeroOwnersCards.filter((c: { rarity: string }) => c.rarity === 'Legendary');
    expect(legendaryZero.length).toBeGreaterThanOrEqual(1); // Minimal 1 Legendary belum ditemukan

    for (const card of zeroOwnersCards) {
      expect(card.copies).toBe(0);
      expect(card.ownedPct).toBe(0);
      expect(card.rank).toBe(1); // Karena owners 0 adalah yang terkecil, rank-nya harus 1
    }

    // 2. Verifikasi Dense Rank saat seri & urutan terurut naik berdasarkan owners
    const rarityPriority: Record<string, number> = {
      Legendary: 1,
      Epic: 2,
      Rare: 3,
      Common: 4
    };

    expect(body.cards[0].rank).toBe(1);

    for (let i = 1; i < body.cards.length; i++) {
      const prev = body.cards[i - 1];
      const curr = body.cards[i];

      // Urutan: owners ASC
      expect(curr.owners).toBeGreaterThanOrEqual(prev.owners);

      if (curr.owners === prev.owners) {
        // DENSE RANK SAAT SERI: rank harus sama persis
        expect(curr.rank).toBe(prev.rank);

        // Tie-breaker 1: rarity (Legendary < Epic < Rare < Common)
        const prevR = rarityPriority[prev.rarity] ?? 99;
        const currR = rarityPriority[curr.rarity] ?? 99;
        expect(currR).toBeGreaterThanOrEqual(prevR);

        // Tie-breaker 2: jika rarity sama, cardNumber ASC
        if (currR === prevR) {
          expect(curr.cardNumber).toBeGreaterThanOrEqual(prev.cardNumber);
        }
      } else {
        // DENSE RANK: saat nilai owners naik, rank naik tepat +1 (tanpa gap/lompatan)
        expect(curr.rank).toBe(prev.rank + 1);
      }
    }

    // 3. Privasi: TIDAK BOLEH ada field userId, nama user, atau wallet di response
    const jsonStr = JSON.stringify(body);
    expect(jsonStr).not.toContain('budi-santoso');
    expect(jsonStr).not.toContain('siti-rahma');
    expect(jsonStr).not.toContain('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

    for (const card of body.cards) {
      expect(card).not.toHaveProperty('userId');
      expect(card).not.toHaveProperty('user_id');
      expect(card).not.toHaveProperty('userName');
      expect(card).not.toHaveProperty('wallet');
      expect(card).not.toHaveProperty('walletAddress');
      expect(card).not.toHaveProperty('wallet_address');

      // Properti yang harus ada
      expect(card).toHaveProperty('rank');
      expect(card).toHaveProperty('cardId');
      expect(card).toHaveProperty('cardNumber');
      expect(card).toHaveProperty('name'); // nama kartu, mis. "Naga Lelap Emas"
      expect(card).toHaveProperty('rarity');
      expect(card).toHaveProperty('owners');
      expect(card).toHaveProperty('copies');
      expect(card).toHaveProperty('ownedPct');

      // Validasi perhitungan persentase (1 desimal)
      const expectedPct = Math.round((card.owners / body.totalUsers) * 100 * 10) / 10;
      expect(card.ownedPct).toBe(expectedPct);
    }

    // 4. Salinan duplikat ada di dataset (copies > owners untuk setidaknya 1 kartu)
    const duplicateCard = body.cards.find((c: { copies: number; owners: number }) => c.copies > c.owners);
    expect(duplicateCard).toBeDefined();
  });

  it('POST /api/sleep/simulate-night: alur simulasi tidur demo user menghasilkan skor >= 70 dan kartu baru, non-demo 403', async () => {
    // 1. Login demo user
    const loginRes = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'budi-santoso' })
    });
    expect(loginRes.status).toBe(200);
    const { token } = await loginRes.json();
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Simulasi tidur 8 jam
    const simRes = await app.request('/api/sleep/simulate-night', {
      method: 'POST',
      headers: authHeaders
    });
    expect(simRes.status).toBe(200);
    const simBody = await simRes.json();

    // Verifikasi sesi tidur selesai dengan durasi ~8 jam
    expect(simBody.session).toBeDefined();
    expect(simBody.session.status).toBe('completed');
    expect(simBody.session.startedAt).toBeDefined();
    expect(simBody.session.endedAt).toBeDefined();
    expect(simBody.session.durationMinutes).toBeGreaterThanOrEqual(470);

    // Verifikasi skor >= 70
    expect(simBody.score).toBeDefined();
    expect(simBody.score.score).toBeGreaterThanOrEqual(70);
    expect(simBody.score.label).toBeDefined();

    // Verifikasi kartu PASTI drop pada simulasi
    expect(simBody.drop).toBeDefined();
    expect(simBody.drop.card).toBeDefined();
    expect(simBody.drop.card.name).toBeDefined();
    expect(simBody.drop.card.rarity).toBeDefined();

    // 3. Cek non-demo user ditolak 403
    const nonDemoUser = {
      id: 'lukman-hakim',
      name: 'Lukman Hakim',
      avatar: 'lukman',
      role: 'Frontend Engineer'
    };
    const nonDemoToken = await createAuthToken(nonDemoUser);
    const nonDemoRes = await app.request('/api/sleep/simulate-night', {
      method: 'POST',
      headers: { Authorization: `Bearer ${nonDemoToken}` }
    });
    expect(nonDemoRes.status).toBe(403);

    // 4. Cek saat ENABLE_DEMO_LOGIN dinonaktifkan: demo user juga mendapat 403
    const prevEnv = process.env.ENABLE_DEMO_LOGIN;
    process.env.ENABLE_DEMO_LOGIN = 'false';
    try {
      const disabledRes = await app.request('/api/sleep/simulate-night', {
        method: 'POST',
        headers: authHeaders
      });
      expect(disabledRes.status).toBe(403);
    } finally {
      if (prevEnv !== undefined) {
        process.env.ENABLE_DEMO_LOGIN = prevEnv;
      } else {
        delete process.env.ENABLE_DEMO_LOGIN;
      }
    }
  });
});
