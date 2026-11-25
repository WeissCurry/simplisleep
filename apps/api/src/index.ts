import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { app } from './app.js';
import { getDb } from './db/index.js';
import { validateDemoWalletAddress } from './services/chain.js';

// Muat file .env root jika ada dan belum dimuat oleh flag --env-file
try {
  if (typeof process.loadEnvFile === 'function') {
    const rootEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
    process.loadEnvFile(rootEnv);
  }
} catch {
  // Abaikan bila file .env tidak ditemukan
}

// Fail-fast validasi konfigurasi rahasia wajib di production
if (process.env.NODE_ENV === 'production') {
  const missingSecrets: string[] = [];
  if (!process.env.JWT_SECRET?.trim()) {
    missingSecrets.push('JWT_SECRET');
  }
  if (!process.env.WALLET_ENC_KEY?.trim()) {
    missingSecrets.push('WALLET_ENC_KEY');
  }
  if (missingSecrets.length > 0) {
    throw new Error(
      `[SimpliSleep API] Gagal startup: Variabel lingkungan wajib berikut belum dikonfigurasi di production: ${missingSecrets.join(', ')}`
    );
  }
}

// Pastikan database dan skema terinisialisasi
getDb();

// Validasi konfigurasi DEMO_WALLET_ADDRESS jika ada
validateDemoWalletAddress();

const port = Number(process.env.PORT) || 3100;
const hostname = process.env.HOST || '0.0.0.0';
console.log(`[SimpliSleep API] Server running on http://${hostname}:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname
});

export default app;
