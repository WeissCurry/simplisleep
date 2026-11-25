import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import { getCardCatalog, getCardById, getRarityBoard } from '../services/catalog.js';
import { getDb } from '../db/index.js';

export const cardsRouter = new Hono();

/**
 * GET /api/cards/catalog
 * Mengembalikan seluruh katalog kartu hewan tidur beserta metadata.
 */
cardsRouter.get('/cards/catalog', (c) => {
  const catalog = getCardCatalog();
  return c.json(catalog);
});

/**
 * GET /api/cards/rarity-board
 * Papan Kelangkaan Kartu — publik (tanpa auth), hanya data agregat, tanpa userId/nama/wallet.
 */
cardsRouter.get('/cards/rarity-board', (c) => {
  const rarityBoard = getRarityBoard();
  return c.json(rarityBoard);
});

/**
 * GET /api/cards/me
 * Daftar kartu hewan tidur yang telah dikoleksi pengguna terautentikasi.
 */
cardsRouter.get('/cards/me', requireAuth, (c) => {
  const userId = c.get('userId');
  const db = getDb();

  const userCards = db
    .prepare(
      `SELECT id, card_id as cardId, card_number as cardNumber, name, rarity, token_id as tokenId, tx_hash as txHash, status, created_at as createdAt
       FROM user_cards
       WHERE user_id = ?
       ORDER BY created_at DESC`
    )
    .all(userId) as {
    id: string;
    cardId: string;
    cardNumber: number;
    name: string;
    rarity: string;
    tokenId?: string;
    txHash?: string;
    status: string;
    createdAt: string;
  }[];

  // Gabungkan dengan gambar dari katalog
  const enriched = userCards.map((card) => {
    const meta = getCardById(card.cardId);
    return {
      ...card,
      id: card.cardId,
      cardId: card.cardId,
      userCardId: card.id,
      image: meta?.image || `${card.cardId}.png`,
      description: meta?.description || ''
    };
  });

  return c.json(enriched);
});
