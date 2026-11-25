import type { MiddlewareHandler } from 'hono';
import { verifyAuthToken, type AuthUser } from '../services/auth.js';
import { getDb } from '../db/index.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
    userId: string;
  }
}

/**
 * Middleware untuk memastikan request memiliki Bearer JWT yang valid.
 */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Header Authorization Bearer diperlukan' }, 401);
  }

  const token = authHeader.slice(7).trim();
  const payload = await verifyAuthToken(token);
  if (!payload || !payload.sub) {
    return c.json({ error: 'Unauthorized: Token tidak valid atau sudah kedaluwarsa' }, 401);
  }

  const db = getDb();
  const user = db
    .prepare('SELECT id, name, avatar, email, wallet_address, role FROM users WHERE id = ?')
    .get(payload.sub) as AuthUser | undefined;

  if (!user) {
    return c.json({ error: 'Unauthorized: Pengguna tidak ditemukan' }, 401);
  }

  c.set('user', user);
  c.set('userId', user.id);

  await next();
};
