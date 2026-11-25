import crypto from 'node:crypto';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

let ephemeralKey: Buffer | null = null;
let hasWarnedMissingKey = false;

/**
 * Mengambil atau membuat kunci enkripsi 32-byte untuk AES-256-GCM.
 * Bila WALLET_ENC_KEY tidak ada di environment, dibuat kunci acak di memori dengan log peringatan.
 */
export function getEncryptionKey(): Buffer {
  const envKey = process.env.WALLET_ENC_KEY?.trim();
  if (envKey) {
    // Normalisasi string menjadi 32 bytes menggunakan SHA-256
    return crypto.createHash('sha256').update(envKey).digest();
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('WALLET_ENC_KEY wajib dikonfigurasi di environment production');
  }

  if (!ephemeralKey) {
    ephemeralKey = crypto.randomBytes(32);
    if (!hasWarnedMissingKey) {
      console.warn(
        '[wallet] PERINGATAN: WALLET_ENC_KEY tidak ditemukan. Menggunakan ephemeral random key di memori untuk sesi dev ini.'
      );
      hasWarnedMissingKey = true;
    }
  }

  return ephemeralKey;
}

/**
 * Enkripsi private key menggunakan AES-256-GCM.
 * Format output: ivHex:tagHex:encryptedHex
 */
export function encryptPrivateKey(privateKey: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV standar untuk GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Dekripsi private key terenkripsi (hanya dipakai internal server, jangan pernah kirim ke client).
 */
export function decryptPrivateKey(encryptedPayload: string): string {
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Format ciphertext private key tidak valid');
  }

  const [ivHex, tagHex, dataHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(dataHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Membuat custodial wallet baru:
 * - Menghasilkan private key acak (viem generatePrivateKey)
 * - Menghitung address publik
 * - Mengenkripsi private key dengan AES-256-GCM
 */
export function createCustodialWallet(): { address: string; privateKeyEnc: string } {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const privateKeyEnc = encryptPrivateKey(privateKey);

  return {
    address: account.address,
    privateKeyEnc
  };
}
