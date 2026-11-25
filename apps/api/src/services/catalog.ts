import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { DatabaseSync } from 'node:sqlite';
import type { Rarity } from 'shared';
import { getDb } from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CardCatalogItem {
  id: string; // slug, e.g. 'orange-cat'
  name: string;
  rarity: Rarity;
  image: string;
  description: string;
  cardNumber?: number;
}

export interface RarityConfigItem {
  weight: number;
  count: number;
}

export type RarityConfig = Record<Rarity, RarityConfigItem>;

export interface RarityBoardCardItem {
  rank: number;
  cardId: string;
  cardNumber: number;
  name: string;
  rarity: Rarity;
  owners: number;
  copies: number;
  ownedPct: number;
}

export interface RarityBoardResponse {
  totalUsers: number;
  updatedAt: string;
  cards: RarityBoardCardItem[];
}

const RARITY_PRIORITY: Record<Rarity, number> = {
  Legendary: 1,
  Epic: 2,
  Rare: 3,
  Common: 4
};

let cachedRarityBoard: {
  db: DatabaseSync;
  timestamp: number;
  data: RarityBoardResponse;
} | null = null;

const CACHE_TTL_MS = 30_000; // 30 detik cache in-memory

export function clearRarityBoardCache(): void {
  cachedRarityBoard = null;
}

let cachedCatalog: CardCatalogItem[] | null = null;
let cachedRarityConfig: RarityConfig | null = null;

function resolvePath(relativePath: string): string {
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(process.cwd(), `../../${relativePath}`),
    path.resolve(__dirname, `../../../../${relativePath}`)
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }

  return candidates[0];
}

/**
 * Membaca daftar kartu dari assets/cards/cards.json.
 */
export function getCardCatalog(): CardCatalogItem[] {
  if (cachedCatalog) return cachedCatalog;

  const catalogPath = resolvePath('assets/cards/cards.json');
  try {
    const raw = fs.readFileSync(catalogPath, 'utf-8');
    const items = JSON.parse(raw) as CardCatalogItem[];
    cachedCatalog = items.map((item, idx) => ({
      ...item,
      cardNumber: idx + 1
    }));
    return cachedCatalog;
  } catch (err) {
    console.error('[catalog] Gagal memuat cards.json:', err);
    return [];
  }
}

/**
 * Membaca bobot kelangkaan dari assets/cards/rarity.json.
 */
export function getRarityConfig(): RarityConfig {
  if (cachedRarityConfig) return cachedRarityConfig;

  const rarityPath = resolvePath('assets/cards/rarity.json');
  try {
    const raw = fs.readFileSync(rarityPath, 'utf-8');
    cachedRarityConfig = JSON.parse(raw) as RarityConfig;
    return cachedRarityConfig;
  } catch {
    // Fallback sesuai SPEC: Common 60, Rare 25, Epic 12, Legendary 3
    cachedRarityConfig = {
      Common: { weight: 55, count: 12 },
      Rare: { weight: 28, count: 8 },
      Epic: { weight: 12, count: 5 },
      Legendary: { weight: 5, count: 3 }
    };
    return cachedRarityConfig;
  }
}

/**
 * Mendapatkan satu kartu berdasarkan ID/slug.
 */
export function getCardById(id: string): CardCatalogItem | undefined {
  const catalog = getCardCatalog();
  return catalog.find((c) => c.id === id);
}

/**
 * Roll kesempatan drop kartu (default peluang 60%).
 * Rarity ditentukan berdasarkan bobot dari rarity.json.
 * Pemilihan kartu dalam tier rarity terpilih dilakukan merata menggunakan crypto.randomInt.
 */
export function rollCardDrop(dropChance = 0.6): CardCatalogItem | null {
  // 1. Cek peluang drop (menggunakan crypto.randomInt)
  const roll = crypto.randomInt(1000);
  if (roll >= Math.round(dropChance * 1000)) {
    return null;
  }

  const catalog = getCardCatalog();
  if (catalog.length === 0) {
    return null;
  }

  const rarityConfig = getRarityConfig();

  // 2. Pilih tier rarity berbobot
  const tiers: { rarity: Rarity; weight: number }[] = [
    { rarity: 'Common', weight: rarityConfig.Common?.weight ?? 55 },
    { rarity: 'Rare', weight: rarityConfig.Rare?.weight ?? 28 },
    { rarity: 'Epic', weight: rarityConfig.Epic?.weight ?? 12 },
    { rarity: 'Legendary', weight: rarityConfig.Legendary?.weight ?? 5 }
  ];

  const totalWeight = tiers.reduce((acc, t) => acc + t.weight, 0);
  let randomWeight = crypto.randomInt(totalWeight);
  let chosenRarity: Rarity = 'Common';

  for (const t of tiers) {
    if (randomWeight < t.weight) {
      chosenRarity = t.rarity;
      break;
    }
    randomWeight -= t.weight;
  }

  // 3. Filter kartu dalam rarity tersebut
  const eligibleCards = catalog.filter((c) => c.rarity === chosenRarity);
  if (eligibleCards.length === 0) {
    // Fallback ke sembarang kartu jika tier kosong
    const randomIdx = crypto.randomInt(catalog.length);
    return catalog[randomIdx];
  }

  // 4. Pilih secara merata menggunakan crypto.randomInt
  const chosenIndex = crypto.randomInt(eligibleCards.length);
  return eligibleCards[chosenIndex];
}

/**
 * Mendapatkan Papan Kelangkaan Kartu (Rarity Board) secara agregat.
 * - Membaca seluruh 28 kartu katalog
 * - Mengagregasikan owners (COUNT(DISTINCT user_id)) dan copies (COUNT(*))
 * - Urutan: owners ASC, rarity (Legendary, Epic, Rare, Common), cardNumber ASC
 * - Rank: dense rank berdasarkan owners
 * - Hasil di-cache in-memory 30 detik untuk efisiensi
 */
export function getRarityBoard(customDb?: DatabaseSync, bypassCache = false): RarityBoardResponse {
  const db = customDb || getDb();
  const now = Date.now();

  if (!bypassCache && cachedRarityBoard && cachedRarityBoard.db === db && now - cachedRarityBoard.timestamp < CACHE_TTL_MS) {
    return cachedRarityBoard.data;
  }

  // 1. Total user terdaftar
  const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number } | undefined;
  const totalUsers = userCountRow?.count ?? 0;

  // 2. Query agregat kepemilikan kartu satu kali
  const cardStats = db.prepare(`
    SELECT card_id as cardId, COUNT(DISTINCT user_id) as owners, COUNT(*) as copies
    FROM user_cards
    GROUP BY card_id
  `).all() as { cardId: string; owners: number; copies: number }[];

  const statsMap = new Map<string, { owners: number; copies: number }>();
  for (const row of cardStats) {
    statsMap.set(row.cardId, {
      owners: row.owners,
      copies: row.copies
    });
  }

  // 3. Gabungkan seluruh 28 kartu dari katalog (owners 0 bila belum ditemukan)
  const catalog = getCardCatalog();
  const rawCards: RarityBoardCardItem[] = catalog.map((item) => {
    const stats = statsMap.get(item.id);
    const owners = stats?.owners ?? 0;
    const copies = stats?.copies ?? 0;
    const ownedPct = totalUsers > 0 ? Math.round((owners / totalUsers) * 100 * 10) / 10 : 0;

    return {
      rank: 0,
      cardId: item.id,
      cardNumber: item.cardNumber ?? 0,
      name: item.name,
      rarity: item.rarity,
      owners,
      copies,
      ownedPct
    };
  });

  // 4. Urutkan: owners ASC, lalu rarity (Legendary, Epic, Rare, Common), lalu cardNumber ASC
  rawCards.sort((a, b) => {
    if (a.owners !== b.owners) {
      return a.owners - b.owners;
    }
    const rA = RARITY_PRIORITY[a.rarity] ?? 99;
    const rB = RARITY_PRIORITY[b.rarity] ?? 99;
    if (rA !== rB) {
      return rA - rB;
    }
    return a.cardNumber - b.cardNumber;
  });

  // 5. Hitung dense rank berdasarkan owners (owners terkecil = rank 1, seri = rank sama tanpa gap)
  let currentRank = 0;
  let lastOwners: number | null = null;
  for (const card of rawCards) {
    if (lastOwners === null || card.owners !== lastOwners) {
      currentRank++;
      lastOwners = card.owners;
    }
    card.rank = currentRank;
  }

  const response: RarityBoardResponse = {
    totalUsers,
    updatedAt: new Date().toISOString(),
    cards: rawCards
  };

  if (!bypassCache) {
    cachedRarityBoard = {
      db,
      timestamp: now,
      data: response
    };
  }

  return response;
}
