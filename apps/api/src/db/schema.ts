import { DatabaseSync } from 'node:sqlite';

/**
 * Sumber tunggal skema database SQLite SimpliSleep.
 * Mendefinisikan tabel-tabel utama serta indeks yang diperlukan untuk performa query.
 */
export function ensureSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      email TEXT,
      wallet_address TEXT,
      wallet_private_key_enc TEXT,
      role TEXT DEFAULT 'Simplimate',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sleep_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      duration_minutes INTEGER,
      status TEXT NOT NULL,
      score INTEGER,
      date TEXT NOT NULL,
      last_heartbeat TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_cards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      card_id TEXT NOT NULL,
      card_number INTEGER NOT NULL,
      name TEXT,
      rarity TEXT,
      token_id TEXT,
      tx_hash TEXT,
      status TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS leaderboard_commits (
      week_id TEXT PRIMARY KEY,
      hash TEXT NOT NULL,
      tx_hash TEXT,
      chain_id INTEGER,
      committed_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sleep_reminders (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read_at TEXT,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (target_id) REFERENCES users(id)
    );

    -- Indeks performa untuk query umum
    CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_date ON sleep_sessions(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_sleep_sessions_date ON sleep_sessions(date);
    CREATE INDEX IF NOT EXISTS idx_sleep_sessions_status ON sleep_sessions(status);
    CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_status ON sleep_sessions(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
    CREATE INDEX IF NOT EXISTS idx_sleep_reminders_pair ON sleep_reminders(sender_id, target_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_sleep_reminders_target_unread ON sleep_reminders(target_id, read_at);

    -- Partial unique index: mencegah lebih dari 1 sesi aktif (ended_at IS NULL) per user
    CREATE UNIQUE INDEX IF NOT EXISTS idx_active_session_per_user ON sleep_sessions(user_id) WHERE ended_at IS NULL;
  `);
}
