import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { authRouter } from './routes/auth.js';
import { sleepRouter } from './routes/sleep.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { cardsRouter } from './routes/cards.js';
import { transparencyRouter } from './routes/transparency.js';
import { adminRouter } from './routes/admin.js';
import { reminderRouter } from './routes/reminder.js';
import { getDb } from './db/index.js';

export const app = new Hono();

// Header keamanan HTTP standar (HSTS, X-Frame-Options, X-Content-Type-Options, dll.)
app.use('*', secureHeaders());

// Konfigurasi CORS: mendukung daftar WEB_ORIGIN dipisah koma (default: http://localhost:4200)
const getAllowedOrigins = (): string[] => {
  const raw = process.env.WEB_ORIGIN || 'http://localhost:4200';
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
};

app.use(
  '*',
  cors({
    origin: (origin) => {
      // Request tanpa Origin (misal server-to-server / curl) tidak memerlukan header ACAO
      if (!origin) {
        return null;
      }
      const allowedOrigins = getAllowedOrigins();
      if (allowedOrigins.includes(origin)) {
        return origin;
      }
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-admin-token'],
    credentials: true
  })
);

// Health check endpoint
app.get('/api/health', (c) => {
  let sqliteReady = false;
  try {
    const db = getDb();
    const res = db.prepare('SELECT 1 as alive').get() as { alive: number } | undefined;
    sqliteReady = res?.alive === 1;
  } catch {
    sqliteReady = false;
  }

  return c.json({
    status: 'ok',
    service: 'simplisleep-api',
    time: new Date().toISOString(),
    sqlite: sqliteReady
  });
});

// Mount router API
app.route('/api', authRouter);
app.route('/api', sleepRouter);
app.route('/api', leaderboardRouter);
app.route('/api', cardsRouter);
app.route('/api', transparencyRouter);
app.route('/api', adminRouter);
app.route('/api', reminderRouter);

// Global Error Handler
app.onError((err, c) => {
  console.error('[app error]:', err);
  const isProd = process.env.NODE_ENV === 'production';
  return c.json(
    {
      error: isProd ? 'Terjadi kesalahan pada server' : (err.message || 'Terjadi kesalahan pada server')
    },
    500
  );
});

// 404 Handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Endpoint tidak ditemukan'
    },
    404
  );
});

export default app;
