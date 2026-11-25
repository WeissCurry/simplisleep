import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEventLogs,
  stringToHex,
  isAddress,
  type Abi,
  type Hex
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { DEMO_USER_IDS } from 'shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 28 Slug kartu koleksi "Simply is Sleeping" sesuai urutan di assets/cards/cards.json.
 * Nomor kartu (1-based index):
 * 1..12: Common
 * 13..20: Rare
 * 21..25: Epic
 * 26..28: Legendary
 */
export const CARD_SLUGS = [
  'orange-cat',
  'sloth',
  'corgi',
  'hamster',
  'white-rabbit',
  'hedgehog',
  'yellow-duck',
  'capybara',
  'red-panda',
  'otter',
  'mini-pig',
  'chick',
  'panda',
  'koala',
  'red-fox',
  'polar-bear',
  'penguin',
  'raccoon',
  'squirrel',
  'witch-cat',
  'owl',
  'blue-whale',
  'bat',
  'octopus',
  'white-deer',
  't-rex',
  'dragon',
  'phoenix'
] as const;

export type CardSlug = (typeof CARD_SLUGS)[number];

/**
 * Mengonversi slug kartu (e.g. 'orange-cat') ke nomor kartu 1-based (e.g. 1).
 * Mengembalikan 0 jika slug tidak ditemukan.
 */
export function cardNumberFromSlug(slug: string): number {
  const index = CARD_SLUGS.indexOf(slug as CardSlug);
  return index >= 0 ? index + 1 : 0;
}

/**
 * Mengonversi nomor kartu 1-based (e.g. 1) ke slug kartu (e.g. 'orange-cat').
 * Mengembalikan '' jika nomor di luar rentang 1 - 28.
 */
export function slugFromCardNumber(num: number): string {
  if (num < 1 || num > CARD_SLUGS.length) {
    return '';
  }
  return CARD_SLUGS[num - 1] ?? '';
}

// Fallback minimal ABIs bila file tidak dapat dimuat
const FALLBACK_SLEEP_CARDS_ABI: Abi = [
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'cardId', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true }
    ],
    anonymous: false
  }
];

const FALLBACK_LEADERBOARD_COMMIT_ABI: Abi = [
  {
    type: 'function',
    name: 'commit',
    inputs: [
      { name: 'weekId', type: 'bytes32' },
      { name: 'hash', type: 'bytes32' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'event',
    name: 'Committed',
    inputs: [
      { name: 'weekId', type: 'bytes32', indexed: true },
      { name: 'hash', type: 'bytes32', indexed: false }
    ],
    anonymous: false
  }
];

let cachedSleepCardsAbi: Abi | null = null;
let cachedLeaderboardCommitAbi: Abi | null = null;

export function getSleepCardsAbi(): Abi {
  if (cachedSleepCardsAbi) return cachedSleepCardsAbi;

  const candidates = [
    path.resolve(__dirname, '../../../../packages/contracts/abi/SleepCards.json'),
    path.resolve(process.cwd(), 'packages/contracts/abi/SleepCards.json'),
    path.resolve(process.cwd(), '../contracts/abi/SleepCards.json'),
    path.resolve(process.cwd(), '../../packages/contracts/abi/SleepCards.json')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = fs.readFileSync(candidate, 'utf-8');
        cachedSleepCardsAbi = JSON.parse(raw) as Abi;
        return cachedSleepCardsAbi;
      } catch {
        // Abaikan dan coba kandidat berikutnya
      }
    }
  }

  return FALLBACK_SLEEP_CARDS_ABI;
}

export function getLeaderboardCommitAbi(): Abi {
  if (cachedLeaderboardCommitAbi) return cachedLeaderboardCommitAbi;

  const candidates = [
    path.resolve(__dirname, '../../../../packages/contracts/abi/LeaderboardCommit.json'),
    path.resolve(process.cwd(), 'packages/contracts/abi/LeaderboardCommit.json'),
    path.resolve(process.cwd(), '../contracts/abi/LeaderboardCommit.json'),
    path.resolve(process.cwd(), '../../packages/contracts/abi/LeaderboardCommit.json')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = fs.readFileSync(candidate, 'utf-8');
        cachedLeaderboardCommitAbi = JSON.parse(raw) as Abi;
        return cachedLeaderboardCommitAbi;
      } catch {
        // Abaikan dan coba kandidat berikutnya
      }
    }
  }

  return FALLBACK_LEADERBOARD_COMMIT_ABI;
}

interface ChainEnv {
  sepoliaRpcUrl: string;
  deployerPrivateKey: string;
  sleepCardsAddress: string;
  leaderboardCommitAddress: string;
}

let hasLoggedMissingEnv = false;

export function getChainEnv(): ChainEnv | null {
  const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL?.trim();
  const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY?.trim();
  const sleepCardsAddress = process.env.SLEEP_CARDS_ADDRESS?.trim();
  const leaderboardCommitAddress = process.env.LEADERBOARD_COMMIT_ADDRESS?.trim();

  if (!sepoliaRpcUrl || !deployerPrivateKey || !sleepCardsAddress || !leaderboardCommitAddress) {
    if (!hasLoggedMissingEnv) {
      console.log(
        '[chain] Sepolia/Contracts environment variables not fully configured. Operating in pending mode.'
      );
      hasLoggedMissingEnv = true;
    }
    return null;
  }

  return {
    sepoliaRpcUrl,
    deployerPrivateKey,
    sleepCardsAddress,
    leaderboardCommitAddress
  };
}

export function _resetLoggedMissingEnv(): void {
  hasLoggedMissingEnv = false;
}

/**
 * Memvalidasi format alamat DEMO_WALLET_ADDRESS menggunakan isAddress viem.
 * Bila tidak valid, mencetak log peringatan dan mengembalikan null (diabaikan).
 */
export function validateDemoWalletAddress(): string | null {
  const raw = process.env.DEMO_WALLET_ADDRESS?.trim();
  if (!raw) {
    return null;
  }
  if (!isAddress(raw)) {
    console.warn(`[chain] DEMO_WALLET_ADDRESS tidak valid: ${raw}. Mengabaikan konfigurasi.`);
    return null;
  }
  return raw;
}

/**
 * Menentukan alamat penerima kartu:
 * - Jika userId termasuk dalam akun demo (DEMO_USER_IDS) dan DEMO_WALLET_ADDRESS valid terkonfigurasi,
 *   gunakan DEMO_WALLET_ADDRESS.
 * - Jika tidak (user non-demo / Google auth, atau DEMO_WALLET_ADDRESS tidak di-set/tidak valid),
 *   tetap gunakan wallet tujuan default (misal custodial wallet user).
 */
export function resolveMintRecipient(defaultTo: string, userId?: string): string {
  if (userId && (DEMO_USER_IDS as readonly string[]).includes(userId)) {
    const demoWallet = validateDemoWalletAddress();
    if (demoWallet) {
      return demoWallet;
    }
  }
  return defaultTo;
}

/**
 * Mint kartu soulbound ke alamat penerima di Sepolia.
 * Bila konfigurasi env kosong, terjadi error atau timeout, mengembalikan status 'pending-mint'.
 */
export async function mintCard(
  to: string,
  cardId: number,
  userId?: string
): Promise<{ tokenId?: string; txHash?: string; status: 'minted' | 'pending-mint' }> {
  const env = getChainEnv();
  if (!env) {
    return { status: 'pending-mint' };
  }

  const recipient = resolveMintRecipient(to, userId);
  if (!recipient || !isAddress(recipient)) {
    console.warn(`[chain] Alamat penerima tidak valid: ${recipient}`);
    return { status: 'pending-mint' };
  }

  try {
    const formattedKey = (
      env.deployerPrivateKey.startsWith('0x')
        ? env.deployerPrivateKey
        : `0x${env.deployerPrivateKey}`
    ) as Hex;

    const account = privateKeyToAccount(formattedKey);

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(env.sepoliaRpcUrl, { timeout: 15_000 })
    });

    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(env.sepoliaRpcUrl, { timeout: 15_000 })
    });

    const abi = getSleepCardsAbi();

    const txHash = await walletClient.writeContract({
      address: env.sleepCardsAddress as Hex,
      abi,
      functionName: 'mint',
      args: [recipient as Hex, BigInt(cardId)]
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 30_000
    });

    if (receipt.status !== 'success') {
      console.warn(`[chain] mintCard tx reverted: ${txHash}`);
      return { status: 'pending-mint', txHash };
    }

    const transferLogs = parseEventLogs({
      abi,
      logs: receipt.logs,
      eventName: 'Transfer'
    });

    const firstTransfer = transferLogs[0];
    const args = firstTransfer?.args as { tokenId?: bigint; to?: string; from?: string } | undefined;
    const tokenId = args?.tokenId !== undefined ? String(args.tokenId) : undefined;

    return {
      tokenId,
      txHash,
      status: 'minted'
    };
  } catch (error) {
    console.warn('[chain] mintCard encountered an error, falling back to pending-mint:', error);
    return { status: 'pending-mint' };
  }
}

/**
 * Menyimpan hash leaderboard mingguan ke smart contract LeaderboardCommit di Sepolia.
 * weekId 'YYYY-Www' dikonversi menjadi bytes32 menggunakan stringToHex(weekId, { size: 32 }).
 * Bila konfigurasi env kosong, terjadi error atau timeout, mengembalikan status 'pending'.
 */
export async function commitWeek(
  weekId: string,
  hash: string
): Promise<{ txHash?: string; status: 'committed' | 'pending' }> {
  const env = getChainEnv();
  if (!env) {
    return { status: 'pending' };
  }

  try {
    const formattedKey = (
      env.deployerPrivateKey.startsWith('0x')
        ? env.deployerPrivateKey
        : `0x${env.deployerPrivateKey}`
    ) as Hex;

    const account = privateKeyToAccount(formattedKey);

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(env.sepoliaRpcUrl, { timeout: 15_000 })
    });

    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(env.sepoliaRpcUrl, { timeout: 15_000 })
    });

    const abi = getLeaderboardCommitAbi();
    const weekIdHex = stringToHex(weekId, { size: 32 });
    const formattedHash = (hash.startsWith('0x') ? hash : `0x${hash}`) as Hex;

    const txHash = await walletClient.writeContract({
      address: env.leaderboardCommitAddress as Hex,
      abi,
      functionName: 'commit',
      args: [weekIdHex, formattedHash]
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 30_000
    });

    if (receipt.status !== 'success') {
      console.warn(`[chain] commitWeek tx reverted: ${txHash}`);
      return { status: 'pending', txHash };
    }

    return {
      txHash,
      status: 'committed'
    };
  } catch (error) {
    console.warn('[chain] commitWeek encountered an error, falling back to pending:', error);
    return { status: 'pending' };
  }
}
