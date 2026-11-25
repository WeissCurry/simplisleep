import crypto from 'node:crypto';
import { sign, verify } from 'hono/jwt';
import { OAuth2Client } from 'google-auth-library';
import { getDb } from '../db/index.js';
import { createCustodialWallet } from './wallet.js';

export interface AuthUser {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  wallet_address?: string;
  role?: string;
}

export interface TokenPayload {
  [key: string]: unknown;
  sub: string;
  name: string;
  email?: string;
  role?: string;
  exp: number;
}

let ephemeralJwtSecret: string | null = null;
let hasWarnedJwtSecret = false;

export function getJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();
  if (envSecret) {
    return envSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET wajib dikonfigurasi di environment production');
  }

  if (!ephemeralJwtSecret) {
    ephemeralJwtSecret = crypto.randomBytes(32).toString('hex');
    if (!hasWarnedJwtSecret) {
      console.warn(
        '[auth] PERINGATAN: JWT_SECRET tidak dikonfigurasi. Menggunakan secret acak ephemeral per-proses untuk development.'
      );
      hasWarnedJwtSecret = true;
    }
  }

  return ephemeralJwtSecret;
}

/**
 * Membuat token JWT dengan masa berlaku 7 hari.
 */
export async function createAuthToken(user: AuthUser): Promise<string> {
  const secret = getJwtSecret();
  const payload: TokenPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 hari
  };

  return await sign(payload, secret, 'HS256');
}

/**
 * Memverifikasi token JWT dan mengembalikan payload.
 */
export async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const payload = (await verify(token, secret, 'HS256')) as unknown as TokenPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Verifikasi idToken dari Google Sign-In.
 * Jika GOOGLE_CLIENT_ID tidak diisi di .env, mengembalikan null dan route harus membalas 501.
 */
export async function verifyGoogleToken(
  idToken: string
): Promise<{ email: string; name: string; avatar: string; sub: string } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return null;
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Google token tidak memuat informasi pengguna yang valid');
  }

  // Validasi email terverifikasi
  if (!payload.email_verified) {
    throw new Error('Email Google belum terverifikasi');
  }

  // Validasi issuer Google yang sah
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!payload.iss || !validIssuers.includes(payload.iss)) {
    throw new Error('Issuer Google token tidak valid');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    avatar: payload.picture || '😴'
  };
}

/**
 * Mencari atau mendaftarkan user baru yang login via Google.
 * Jika user baru, otomatis membuat custodial wallet terenkripsi.
 */
export function findOrCreateGoogleUser(googleInfo: {
  email: string;
  name: string;
  avatar: string;
}): AuthUser {
  const db = getDb();

  // Cari user berdasarkan email
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(googleInfo.email) as
    | AuthUser
    | undefined;

  if (existing) {
    return existing;
  }

  // Buat custodial wallet baru
  const { address, privateKeyEnc } = createCustodialWallet();
  const id = `google-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  db.prepare(`
    INSERT INTO users (id, name, avatar, email, wallet_address, wallet_private_key_enc, role)
    VALUES (?, ?, ?, ?, ?, ?, 'Simplimate')
  `).run(id, googleInfo.name, googleInfo.avatar, googleInfo.email, address, privateKeyEnc);

  return {
    id,
    name: googleInfo.name,
    avatar: googleInfo.avatar,
    email: googleInfo.email,
    wallet_address: address,
    role: 'Simplimate'
  };
}
