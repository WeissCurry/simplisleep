import hre from 'hardhat';
import assert from 'node:assert/strict';
import { keccak256, stringToBytes } from 'viem';

describe('LeaderboardCommit', () => {
  const weekId1 = keccak256(stringToBytes('2026-W46'));
  const weekId2 = keccak256(stringToBytes('2026-W47'));
  const hash1 = keccak256(stringToBytes('leaderboard-data-hash-week-46'));
  const hash2 = keccak256(stringToBytes('leaderboard-data-hash-week-47'));

  async function deployFixture() {
    const [owner, nonOwner] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    const leaderboardCommit = await hre.viem.deployContract('LeaderboardCommit', [
      owner.account.address
    ]);

    return { leaderboardCommit, owner, nonOwner, publicClient };
  }

  describe('Deployment', () => {
    it('sets initial owner correctly', async () => {
      const { leaderboardCommit, owner } = await deployFixture();
      const contractOwner = await leaderboardCommit.read.owner();
      assert.equal(contractOwner.toLowerCase(), owner.account.address.toLowerCase());
    });
  });

  describe('Commit functionality', () => {
    it('commit sekali: owner commits successfully and emits Committed event', async () => {
      const { leaderboardCommit, owner, publicClient } = await deployFixture();

      const txHash = await leaderboardCommit.write.commit([weekId1, hash1], {
        account: owner.account
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      assert.equal(receipt.status, 'success');

      // Verify getter and public mapping
      assert.equal(await leaderboardCommit.read.getCommit([weekId1]), hash1);
      assert.equal(await leaderboardCommit.read.commits([weekId1]), hash1);

      // Verify event
      const events = await leaderboardCommit.getEvents.Committed();
      assert.equal(events.length, 1);
      assert.equal(events[0].args.weekId, weekId1);
      assert.equal(events[0].args.hash, hash1);
    });

    it('commit ulang revert: attempting to commit the same weekId twice reverts', async () => {
      const { leaderboardCommit, owner } = await deployFixture();

      // First commit succeeds
      await leaderboardCommit.write.commit([weekId1, hash1], {
        account: owner.account
      });

      // Second commit with same weekId reverts
      await assert.rejects(
        async () => {
          await leaderboardCommit.write.commit([weekId1, hash2], {
            account: owner.account
          });
        },
        /AlreadyCommitted/
      );
    });

    it('non-owner revert: non-owner cannot commit', async () => {
      const { leaderboardCommit, nonOwner } = await deployFixture();

      await assert.rejects(
        async () => {
          await leaderboardCommit.write.commit([weekId1, hash1], {
            account: nonOwner.account
          });
        },
        /OwnableUnauthorizedAccount/
      );
    });

    it('commits for different weekIds succeed independently', async () => {
      const { leaderboardCommit, owner } = await deployFixture();

      await leaderboardCommit.write.commit([weekId1, hash1], {
        account: owner.account
      });
      await leaderboardCommit.write.commit([weekId2, hash2], {
        account: owner.account
      });

      assert.equal(await leaderboardCommit.read.getCommit([weekId1]), hash1);
      assert.equal(await leaderboardCommit.read.getCommit([weekId2]), hash2);
    });

    it('validation: zero weekId or zero hash reverts', async () => {
      const { leaderboardCommit, owner } = await deployFixture();
      const zeroBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

      await assert.rejects(
        async () => {
          await leaderboardCommit.write.commit([zeroBytes32, hash1], {
            account: owner.account
          });
        },
        /InvalidWeekId/
      );

      await assert.rejects(
        async () => {
          await leaderboardCommit.write.commit([weekId1, zeroBytes32], {
            account: owner.account
          });
        },
        /InvalidHash/
      );
    });
  });
});
