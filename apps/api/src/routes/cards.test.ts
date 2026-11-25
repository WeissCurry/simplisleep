import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { app } from '../app.js';
import { setDb, closeDb } from '../db/index.js';
import { runSeed } from '../seed/seed.js';

describe('Cards API Endpoint Tests (apps/api/src/routes/cards.ts)', () => {
  let memDb: DatabaseSync;
  let authToken: string;

  beforeEach(async () => {
    memDb = new DatabaseSync(':memory:');
    setDb(memDb);
    await runSeed(memDb);

    const loginRes = await app.request('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'budi-santoso' })
    });
    const loginBody = await loginRes.json();
    authToken = loginBody.token;
  });

  afterEach(() => {
    closeDb();
  });

  it('GET /api/cards/catalog mengembalikan seluruh 28 kartu katalog dengan id sebagai slug', async () => {
    const res = await app.request('/api/cards/catalog');
    expect(res.status).toBe(200);

    const catalog = await res.json();
    expect(Array.isArray(catalog)).toBe(true);
    expect(catalog.length).toBe(28);
    expect(catalog[0]).toHaveProperty('id');
    expect(catalog[0]).toHaveProperty('name');
    expect(catalog[0]).toHaveProperty('rarity');
    expect(catalog[0]).toHaveProperty('image');
    expect(catalog.map((c: any) => c.id)).toContain('orange-cat');
  });

  it('GET /api/cards/me mengembalikan kartu koleksi user dengan id sebagai slug yang cocok dengan katalog', async () => {
    const res = await app.request('/api/cards/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(res.status).toBe(200);

    const myCards = await res.json();
    expect(Array.isArray(myCards)).toBe(true);
    expect(myCards.length).toBeGreaterThan(0);

    // Verifikasi id adalah slug kartu (misal 'orange-cat', bukan UUID acak)
    for (const card of myCards) {
      expect(card.id).toBeDefined();
      expect(card.cardId).toBeDefined();
      expect(card.id).toBe(card.cardId); // slug kartu sama persis
      expect(card.userCardId).toBeDefined(); // UUID baris user_cards tetap tersimpan
      expect(card.image).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.rarity).toBeDefined();
    }
  });

  it('GET /api/cards/me tanpa token mengembalikan 401 Unauthorized', async () => {
    const res = await app.request('/api/cards/me');
    expect(res.status).toBe(401);
  });
});
