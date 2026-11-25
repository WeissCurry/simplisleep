import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { app } from '../app.js';
import { setDb, closeDb } from '../db/index.js';
import { runSeed } from '../seed/seed.js';

describe('Sleep Reminders API Tests (apps/api/src/routes/reminder.ts)', () => {
  let memDb: DatabaseSync;
  let senderToken: string;
  let targetToken: string;

  beforeEach(async () => {
    vi.useRealTimers();
    memDb = new DatabaseSync(':memory:');
    setDb(memDb);
    await runSeed(memDb);

    // Login Budi Santoso (sender)
    const senderRes = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'budi-santoso' })
    });
    const senderBody = await senderRes.json();
    senderToken = senderBody.token;

    // Login Siti Rahmawati (target)
    const targetRes = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'siti-rahma' })
    });
    const targetBody = await targetRes.json();
    targetToken = targetBody.token;
  });

  afterEach(() => {
    vi.useRealTimers();
    closeDb();
  });

  it('POST /api/reminders tanpa autentikasi mengembalikan 401 Unauthorized', async () => {
    const res = await app.request('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: 'siti-rahma' })
    });

    expect(res.status).toBe(401);
  });

  it('POST /api/reminders ke diri sendiri ditolak dengan 400 Bad Request', async () => {
    const res = await app.request('/api/reminders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${senderToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetUserId: 'budi-santoso' })
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('diri sendiri');
  });

  it('POST /api/reminders ke user yang tidak ada mengembalikan 404 Not Found', async () => {
    const res = await app.request('/api/reminders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${senderToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetUserId: 'user-hantu-999' })
    });

    expect(res.status).toBe(404);
  });

  it('Alur Cooldown 5 Menit: kirim pertama berhasil (201), kirim kedua dalam 5 menit dapat 429, setelah lewat 5 menit berhasil (201)', async () => {
    const initialTime = new Date('2026-11-24T23:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(initialTime);

    // 1. Kirim pertama kali -> Sukses 201
    const firstRes = await app.request('/api/reminders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${senderToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetUserId: 'siti-rahma' })
    });

    expect(firstRes.status).toBe(201);
    const firstBody = await firstRes.json();
    expect(firstBody.success).toBe(true);
    expect(firstBody.cooldownSeconds).toBe(300);
    expect(firstBody.reminder).toBeDefined();
    expect(firstBody.reminder.senderId).toBe('budi-santoso');
    expect(firstBody.reminder.targetId).toBe('siti-rahma');

    // 2. Cek GET /api/reminders/cooldowns -> Siti Rahma tercatat dalam cooldown ~300 detik
    const cooldownRes = await app.request('/api/reminders/cooldowns', {
      headers: { Authorization: `Bearer ${senderToken}` }
    });
    expect(cooldownRes.status).toBe(200);
    const cooldownBody = await cooldownRes.json();
    expect(cooldownBody.cooldowns['siti-rahma']).toBeDefined();
    expect(cooldownBody.cooldowns['siti-rahma']).toBe(300);

    // 3. Maju 2 menit (120 detik) -> Masih dalam 5 menit
    vi.advanceTimersByTime(120 * 1000);

    // Kirim kedua kali dalam rentang 5 menit -> Wajib 429 Too Many Requests
    const secondRes = await app.request('/api/reminders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${senderToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetUserId: 'siti-rahma' })
    });

    expect(secondRes.status).toBe(429);
    expect(secondRes.headers.get('Retry-After')).toBe('180');
    const secondBody = await secondRes.json();
    expect(secondBody.retryAfterSeconds).toBe(180);
    expect(secondBody.cooldownSeconds).toBe(300);
    expect(secondBody.error).toMatch(/tunggu/i);

    // 4. Maju lagi 181 detik (total lewat > 5 menit sejak kirim pertama)
    vi.advanceTimersByTime(181 * 1000);

    // Kirim ketiga kali setelah lewat 5 menit -> Sukses 201
    const thirdRes = await app.request('/api/reminders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${senderToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetUserId: 'siti-rahma' })
    });

    expect(thirdRes.status).toBe(201);
    const thirdBody = await thirdRes.json();
    expect(thirdBody.success).toBe(true);
    expect(thirdBody.reminder.targetId).toBe('siti-rahma');
  });

  it('Cooldown berlaku per target: sender bisa mengingatkan target lain meski target pertama sedang cooldown', async () => {
    const fixedTime = new Date('2026-11-24T23:30:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedTime);

    // Kirim ke Siti Rahma -> 201
    const resSiti = await app.request('/api/reminders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${senderToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetUserId: 'siti-rahma' })
    });
    expect(resSiti.status).toBe(201);

    // Kirim ke Adi Wijaya -> 201 (harus diizinkan karena beda target)
    const resAdi = await app.request('/api/reminders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${senderToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetUserId: 'adi-wijaya' })
    });
    expect(resAdi.status).toBe(201);

    // Cek cooldowns pengirim memiliki kedua target
    const cooldownRes = await app.request('/api/reminders/cooldowns', {
      headers: { Authorization: `Bearer ${senderToken}` }
    });
    const cooldownBody = await cooldownRes.json();
    expect(cooldownBody.cooldowns['siti-rahma']).toBeDefined();
    expect(cooldownBody.cooldowns['adi-wijaya']).toBeDefined();
  });

  it('Kanal Notifikasi: target user dapat mengambil notifikasi belum dibaca (GET) dan menandai telah dibaca (POST)', async () => {
    // 1. Budi mengirim pengingat ke Siti
    const sendRes = await app.request('/api/reminders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${senderToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetUserId: 'siti-rahma' })
    });
    expect(sendRes.status).toBe(201);
    const reminderId = (await sendRes.json()).reminder.id;

    // 2. Siti membuka aplikasi dan cek GET /api/reminders/unread
    const unreadRes = await app.request('/api/reminders/unread', {
      headers: { Authorization: `Bearer ${targetToken}` }
    });
    expect(unreadRes.status).toBe(200);
    const unreadList = await unreadRes.json();
    expect(Array.isArray(unreadList)).toBe(true);
    expect(unreadList.length).toBe(1);
    expect(unreadList[0].id).toBe(reminderId);
    expect(unreadList[0].senderId).toBe('budi-santoso');
    expect(unreadList[0].senderName).toBe('Budi Santoso');
    expect(unreadList[0].message).toContain('mengingatkan');

    // 3. Siti menandai notifikasi telah dibaca via POST /api/reminders/:id/read
    const readRes = await app.request(`/api/reminders/${reminderId}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${targetToken}` }
    });
    expect(readRes.status).toBe(200);
    const readBody = await readRes.json();
    expect(readBody.success).toBe(true);

    // 4. Cek lagi unread -> sekarang kosong
    const unreadAfterRes = await app.request('/api/reminders/unread', {
      headers: { Authorization: `Bearer ${targetToken}` }
    });
    const unreadAfterList = await unreadAfterRes.json();
    expect(unreadAfterList.length).toBe(0);

    // 5. Menandai notifikasi yang sudah dibaca mengembalikan 404
    const duplicateReadRes = await app.request(`/api/reminders/${reminderId}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${targetToken}` }
    });
    expect(duplicateReadRes.status).toBe(404);
  });
});
