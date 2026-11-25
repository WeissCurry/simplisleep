import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { ensureSchema } from './schema.js';
import { runSeed } from '../seed/seed.js';

let activeDb: DatabaseSync | null = null;

/**
 * Mendapatkan koneksi DatabaseSync aktif.
 * Menginisialisasi skema secara otomatis jika belum ada.
 * Jika tabel user kosong di lingkungan non-test, otomatis menjalankan seed data.
 */
export function getDb(): DatabaseSync {
  if (activeDb) {
    return activeDb;
  }

  const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'simplisleep.db');
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  ensureSchema(db);

  // Jika database baru dibuat dan kosong, seed otomatis untuk kemudahan dev/demo.
  // Di production, auto-seed hanya berjalan bila AUTO_SEED === 'true'.
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowSeed = !isProduction || process.env.AUTO_SEED === 'true';
    if (allowSeed) {
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as
        | { count: number }
        | undefined;
      if (!userCount || userCount.count === 0) {
        runSeed(db);
      }
    }
  } catch {
    // Abaikan error pengecekan seed
  }

  activeDb = db;
  return activeDb;
}

/**
 * Mengganti database aktif (misalnya untuk in-memory SQLite pada unit test).
 */
export function setDb(db: DatabaseSync | null): void {
  if (activeDb && activeDb !== db) {
    try {
      activeDb.close();
    } catch {
      // Abaikan jika sudah tertutup
    }
  }
  activeDb = db;
  if (activeDb) {
    ensureSchema(activeDb);
  }
}

/**
 * Menutup database aktif.
 */
export function closeDb(): void {
  if (activeDb) {
    try {
      activeDb.close();
    } catch {
      // Abaikan error saat close
    }
    activeDb = null;
  }
}
