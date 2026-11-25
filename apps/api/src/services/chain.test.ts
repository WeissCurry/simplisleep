import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mintCard,
  commitWeek,
  cardNumberFromSlug,
  slugFromCardNumber,
  CARD_SLUGS,
  _resetLoggedMissingEnv,
  getSleepCardsAbi,
  getLeaderboardCommitAbi,
  validateDemoWalletAddress,
  resolveMintRecipient
} from './chain.js';

const { mockWriteContract, mockWaitForTransactionReceipt } = vi.hoisted(() => {
  return {
    mockWriteContract: vi.fn(),
    mockWaitForTransactionReceipt: vi.fn()
  };
});

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>();
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      waitForTransactionReceipt: mockWaitForTransactionReceipt
    })),
    createWalletClient: vi.fn(() => ({
      writeContract: mockWriteContract
    }))
  };
});

describe('Chain Service (apps/api/src/services/chain.ts)', () => {
  beforeEach(() => {
    // Pastikan env chain kosong
    delete process.env.SEPOLIA_RPC_URL;
    delete process.env.DEPLOYER_PRIVATE_KEY;
    delete process.env.SLEEP_CARDS_ADDRESS;
    delete process.env.LEADERBOARD_COMMIT_ADDRESS;
    delete process.env.DEMO_WALLET_ADDRESS;
    _resetLoggedMissingEnv();
    mockWriteContract.mockReset();
    mockWaitForTransactionReceipt.mockReset();
  });

  describe('Helper functions: cardNumberFromSlug & slugFromCardNumber', () => {
    it('mengonversi slug ke 1-based cardId secara akurat', () => {
      expect(cardNumberFromSlug('orange-cat')).toBe(1);
      expect(cardNumberFromSlug('sloth')).toBe(2);
      expect(cardNumberFromSlug('chick')).toBe(12);
      expect(cardNumberFromSlug('panda')).toBe(13);
      expect(cardNumberFromSlug('witch-cat')).toBe(20);
      expect(cardNumberFromSlug('owl')).toBe(21);
      expect(cardNumberFromSlug('t-rex')).toBe(26);
      expect(cardNumberFromSlug('phoenix')).toBe(28);
    });

    it('mengonversi nomor kartu ke slug secara akurat', () => {
      expect(slugFromCardNumber(1)).toBe('orange-cat');
      expect(slugFromCardNumber(2)).toBe('sloth');
      expect(slugFromCardNumber(12)).toBe('chick');
      expect(slugFromCardNumber(13)).toBe('panda');
      expect(slugFromCardNumber(21)).toBe('owl');
      expect(slugFromCardNumber(28)).toBe('phoenix');
    });

    it('menangani input tidak valid dengan aman', () => {
      expect(cardNumberFromSlug('non-existent-animal')).toBe(0);
      expect(slugFromCardNumber(0)).toBe('');
      expect(slugFromCardNumber(29)).toBe('');
      expect(slugFromCardNumber(-1)).toBe('');
    });

    it('memiliki total 28 kartu unik', () => {
      expect(CARD_SLUGS.length).toBe(28);
      const uniqueSlugs = new Set(CARD_SLUGS);
      expect(uniqueSlugs.size).toBe(28);
    });
  });

  describe('ABI loading', () => {
    it('memuat ABI SleepCards dan LeaderboardCommit', () => {
      const sleepCardsAbi = getSleepCardsAbi();
      const leaderboardCommitAbi = getLeaderboardCommitAbi();

      expect(Array.isArray(sleepCardsAbi)).toBe(true);
      expect(Array.isArray(leaderboardCommitAbi)).toBe(true);

      const hasMint = sleepCardsAbi.some(
        (x) => x.type === 'function' && 'name' in x && x.name === 'mint'
      );
      expect(hasMint).toBe(true);

      const hasCommit = leaderboardCommitAbi.some(
        (x) => x.type === 'function' && 'name' in x && x.name === 'commit'
      );
      expect(hasCommit).toBe(true);
    });
  });

  describe('Fallback ke pending ketika env kosong', () => {
    it('mintCard mengembalikan status pending-mint tanpa error ketika env kosong', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log');

      const result = await mintCard('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 1);

      expect(result).toEqual({ status: 'pending-mint' });
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      // Pemanggilan kedua tidak boleh mengulang log (log sekali)
      const secondResult = await mintCard('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 2);
      expect(secondResult).toEqual({ status: 'pending-mint' });
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      consoleLogSpy.mockRestore();
    });

    it('commitWeek mengembalikan status pending tanpa error ketika env kosong', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log');

      const result = await commitWeek(
        '2026-W46',
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      );

      expect(result).toEqual({ status: 'pending' });
      // Karena sudah log di mintCard atau awal, log hanya sekali
      consoleLogSpy.mockRestore();
    });
  });

  describe('DEMO_WALLET_ADDRESS & resolveMintRecipient', () => {
    const validMetaMaskWallet = '0x3011d201ac880fce7018B302Fe078De13f3f8A93';
    const fallbackUserWallet = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

    it('validateDemoWalletAddress mengembalikan null bila env tidak di-set', () => {
      delete process.env.DEMO_WALLET_ADDRESS;
      expect(validateDemoWalletAddress()).toBeNull();
    });

    it('validateDemoWalletAddress mengembalikan alamat bila valid', () => {
      process.env.DEMO_WALLET_ADDRESS = validMetaMaskWallet;
      expect(validateDemoWalletAddress()).toBe(validMetaMaskWallet);
    });

    it('validateDemoWalletAddress mengabaikan dan log warning bila alamat tidak valid', () => {
      process.env.DEMO_WALLET_ADDRESS = '0xinvalid_address_123';
      const warnSpy = vi.spyOn(console, 'warn');

      const result = validateDemoWalletAddress();
      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[chain] DEMO_WALLET_ADDRESS tidak valid: 0xinvalid_address_123')
      );

      warnSpy.mockRestore();
    });

    it('resolveMintRecipient mengalihkan ke DEMO_WALLET_ADDRESS untuk user demo', () => {
      process.env.DEMO_WALLET_ADDRESS = validMetaMaskWallet;

      // Ketiga akun demo resmi
      expect(resolveMintRecipient(fallbackUserWallet, 'budi-santoso')).toBe(validMetaMaskWallet);
      expect(resolveMintRecipient(fallbackUserWallet, 'siti-rahma')).toBe(validMetaMaskWallet);
      expect(resolveMintRecipient(fallbackUserWallet, 'gilang-ramadhan')).toBe(validMetaMaskWallet);
    });

    it('resolveMintRecipient tetap memakai wallet user untuk user non-demo (Google auth)', () => {
      process.env.DEMO_WALLET_ADDRESS = validMetaMaskWallet;

      const nonDemoUserWallet = '0x1234567890123456789012345678901234567890';
      const result = resolveMintRecipient(nonDemoUserWallet, 'google-uuid-user-999');
      expect(result).toBe(nonDemoUserWallet);
    });

    it('resolveMintRecipient fallback ke wallet default bila DEMO_WALLET_ADDRESS tidak valid', () => {
      process.env.DEMO_WALLET_ADDRESS = 'bukan-alamat-eth';
      const warnSpy = vi.spyOn(console, 'warn');

      const result = resolveMintRecipient(fallbackUserWallet, 'budi-santoso');
      expect(result).toBe(fallbackUserWallet);

      warnSpy.mockRestore();
    });

    it('resolveMintRecipient fallback ke wallet default bila DEMO_WALLET_ADDRESS tidak di-set', () => {
      delete process.env.DEMO_WALLET_ADDRESS;

      const result = resolveMintRecipient(fallbackUserWallet, 'budi-santoso');
      expect(result).toBe(fallbackUserWallet);
    });
  });

  describe('Minting dengan mocked viem (active chain env)', () => {
    const validMetaMaskWallet = '0x3011d201ac880fce7018B302Fe078De13f3f8A93';
    const fallbackUserWallet = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const mockTxHash = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    beforeEach(() => {
      process.env.SEPOLIA_RPC_URL = 'https://rpc.sepolia.org';
      process.env.DEPLOYER_PRIVATE_KEY =
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      process.env.SLEEP_CARDS_ADDRESS = '0x1111111111111111111111111111111111111111';
      process.env.LEADERBOARD_COMMIT_ADDRESS = '0x2222222222222222222222222222222222222222';

      mockWriteContract.mockResolvedValue(mockTxHash);
      mockWaitForTransactionReceipt.mockResolvedValue({
        status: 'success',
        logs: []
      });
    });

    it('mintCard untuk user demo memanggil writeContract ke DEMO_WALLET_ADDRESS', async () => {
      process.env.DEMO_WALLET_ADDRESS = validMetaMaskWallet;

      const res = await mintCard(fallbackUserWallet, 1, 'budi-santoso');
      expect(res.status).toBe('minted');
      expect(res.txHash).toBe(mockTxHash);

      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '0x1111111111111111111111111111111111111111',
          functionName: 'mint',
          args: [validMetaMaskWallet, 1n]
        })
      );
    });

    it('mintCard untuk user non-demo memanggil writeContract ke wallet user sendiri', async () => {
      process.env.DEMO_WALLET_ADDRESS = validMetaMaskWallet;
      const nonDemoWallet = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

      const res = await mintCard(nonDemoWallet, 5, 'google-uuid-user');
      expect(res.status).toBe('minted');
      expect(res.txHash).toBe(mockTxHash);

      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '0x1111111111111111111111111111111111111111',
          functionName: 'mint',
          args: [nonDemoWallet, 5n]
        })
      );
    });

    it('mintCard dengan DEMO_WALLET_ADDRESS tidak valid mengabaikan demo wallet dan memakai wallet user', async () => {
      process.env.DEMO_WALLET_ADDRESS = 'invalid-hex';
      const warnSpy = vi.spyOn(console, 'warn');

      const res = await mintCard(fallbackUserWallet, 2, 'siti-rahma');
      expect(res.status).toBe('minted');
      expect(res.txHash).toBe(mockTxHash);

      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [fallbackUserWallet, 2n]
        })
      );

      warnSpy.mockRestore();
    });
  });
});
