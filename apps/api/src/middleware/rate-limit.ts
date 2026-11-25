import type { MiddlewareHandler } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limiter per IP untuk melindungi endpoint auth dan sleep.
 */
export function rateLimit(options: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
}): MiddlewareHandler {
  const windowMs = options.windowMs ?? 60_000; // 1 menit default
  const maxRequests = options.maxRequests ?? 30; // 30 req/menit default
  const message = options.message ?? 'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.';

  const ipStore = new Map<string, RateLimitRecord>();

  // Pembersihan berkala setiap 5 menit agar tidak bocor memori
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      if (record.resetAt <= now) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60_000).unref();

  return async (c, next) => {
    let remoteIp: string | undefined;
    try {
      const conn = getConnInfo(c);
      remoteIp = conn.remote?.address;
    } catch {
      // Dijalankan di lingkungan test in-memory (app.request) tanpa node server socket
      remoteIp = undefined;
    }

    const trustProxy = process.env.TRUST_PROXY === 'true';
    const proxyIp = trustProxy
      ? c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
        c.req.header('cf-connecting-ip') ||
        c.req.header('x-real-ip')
      : undefined;

    const ip = proxyIp || remoteIp || '127.0.0.1';

    const now = Date.now();
    let record = ipStore.get(ip);

    if (!record || record.resetAt <= now) {
      record = {
        count: 1,
        resetAt: now + windowMs
      };
      ipStore.set(ip, record);
    } else {
      record.count++;
    }

    if (record.count > maxRequests) {
      return c.json(
        {
          error: message,
          retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000)
        },
        429
      );
    }

    await next();
  };
}
