import hre from 'hardhat';
import assert from 'node:assert/strict';
import { getAddress, keccak256, toHex, stringToBytes } from 'viem';

describe('SleepCards (Soulbound ERC-721 + ERC-5192)', () => {
  const baseURI = 'https://simplisleep.app/api/cards/metadata/';
  const ERC5192_INTERFACE_ID = '0xb45a3c0e' as const;
  const ERC721_INTERFACE_ID = '0x80ac58cd' as const;

  async function deployFixture() {
    const [admin, minter, user1, user2] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    const sleepCards = await hre.viem.deployContract('SleepCards', [
      admin.account.address,
      baseURI
    ]);

    // Admin grants MINTER_ROLE to minter wallet as well
    const MINTER_ROLE = await sleepCards.read.MINTER_ROLE();
    await sleepCards.write.grantRole([MINTER_ROLE, minter.account.address], {
      account: admin.account
    });

    return { sleepCards, admin, minter, user1, user2, publicClient, MINTER_ROLE };
  }

  describe('Deployment & Interface Support', () => {
    it('initializes with correct name, symbol, baseURI, and roles', async () => {
      const { sleepCards, admin, MINTER_ROLE } = await deployFixture();

      assert.equal(await sleepCards.read.name(), 'SleepCards');
      assert.equal(await sleepCards.read.symbol(), 'SLEEP');
      assert.equal(await sleepCards.read.baseURI(), baseURI);

      const DEFAULT_ADMIN_ROLE = await sleepCards.read.DEFAULT_ADMIN_ROLE();
      assert.equal(await sleepCards.read.hasRole([DEFAULT_ADMIN_ROLE, admin.account.address]), true);
      assert.equal(await sleepCards.read.hasRole([MINTER_ROLE, admin.account.address]), true);
    });

    it('supports ERC-5192 (0xb45a3c0e) and ERC-721 interfaces', async () => {
      const { sleepCards } = await deployFixture();

      assert.equal(await sleepCards.read.supportsInterface([ERC5192_INTERFACE_ID]), true);
      assert.equal(await sleepCards.read.supportsInterface([ERC721_INTERFACE_ID]), true);
    });
  });

  describe('Minting', () => {
    it('mint sukses oleh minter role, saves cardId, sets tokenURI, and emits Locked', async () => {
      const { sleepCards, minter, user1, publicClient } = await deployFixture();
      const cardId = 7n; // e.g. yellow-duck

      const txHash = await sleepCards.write.mint([user1.account.address, cardId], {
        account: minter.account
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      assert.equal(receipt.status, 'success');

      // Verify ownership & balance
      const tokenId = 1n;
      const owner = await sleepCards.read.ownerOf([tokenId]);
      assert.equal(getAddress(owner), getAddress(user1.account.address));
      assert.equal(await sleepCards.read.balanceOf([user1.account.address]), 1n);

      // Verify cardId mapping
      assert.equal(await sleepCards.read.getCardId([tokenId]), cardId);
      assert.equal(await sleepCards.read.cardIdOf([tokenId]), cardId);

      // Verify tokenURI = baseURI + cardId + '.json'
      assert.equal(await sleepCards.read.tokenURI([tokenId]), `${baseURI}${cardId}.json`);

      // Verify ERC-5192 locked returns true
      assert.equal(await sleepCards.read.locked([tokenId]), true);

      // Check events: Locked and Transfer
      const lockedEvents = await sleepCards.getEvents.Locked();
      assert.equal(lockedEvents.length, 1);
      assert.equal(lockedEvents[0].args.tokenId, tokenId);

      const transferEvents = await sleepCards.getEvents.Transfer();
      assert.equal(transferEvents.length, 1);
      assert.equal(transferEvents[0].args.tokenId, tokenId);
      assert.equal(getAddress(transferEvents[0].args.to!), getAddress(user1.account.address));
    });

    it('mint oleh non-minter gagal (reverts)', async () => {
      const { sleepCards, user1, user2 } = await deployFixture();

      await assert.rejects(
        async () => {
          await sleepCards.write.mint([user2.account.address, 1n], {
            account: user1.account
          });
        },
        /AccessControlUnauthorizedAccount/
      );
    });
  });

  describe('Soulbound Restrictions (Transfers and Approvals Blocked)', () => {
    it('transferFrom reverts', async () => {
      const { sleepCards, minter, user1, user2 } = await deployFixture();
      await sleepCards.write.mint([user1.account.address, 1n], {
        account: minter.account
      });

      await assert.rejects(
        async () => {
          await sleepCards.write.transferFrom(
            [user1.account.address, user2.account.address, 1n],
            { account: user1.account }
          );
        },
        /SoulboundToken/
      );
    });

    it('safeTransferFrom reverts', async () => {
      const { sleepCards, minter, user1, user2 } = await deployFixture();
      await sleepCards.write.mint([user1.account.address, 1n], {
        account: minter.account
      });

      // safeTransferFrom(address,address,uint256)
      await assert.rejects(
        async () => {
          const sleepCardsAsUser1 = await hre.viem.getContractAt('SleepCards', sleepCards.address, {
            client: { wallet: user1 }
          });
          // Call safeTransferFrom
          await sleepCardsAsUser1.write.safeTransferFrom([
            user1.account.address,
            user2.account.address,
            1n
          ]);
        },
        /SoulboundToken/
      );
    });

    it('approve reverts', async () => {
      const { sleepCards, minter, user1, user2 } = await deployFixture();
      await sleepCards.write.mint([user1.account.address, 1n], {
        account: minter.account
      });

      await assert.rejects(
        async () => {
          await sleepCards.write.approve([user2.account.address, 1n], {
            account: user1.account
          });
        },
        /SoulboundToken/
      );
    });

    it('setApprovalForAll reverts', async () => {
      const { sleepCards, minter, user1, user2 } = await deployFixture();
      await sleepCards.write.mint([user1.account.address, 1n], {
        account: minter.account
      });

      await assert.rejects(
        async () => {
          await sleepCards.write.setApprovalForAll([user2.account.address, true], {
            account: user1.account
          });
        },
        /SoulboundToken/
      );
    });
  });

  describe('ERC-5192 locked() Specification', () => {
    it('locked returns true for minted tokens', async () => {
      const { sleepCards, minter, user1 } = await deployFixture();
      await sleepCards.write.mint([user1.account.address, 5n], {
        account: minter.account
      });

      assert.equal(await sleepCards.read.locked([1n]), true);
    });

    it('locked reverts for non-existent tokens', async () => {
      const { sleepCards } = await deployFixture();

      await assert.rejects(
        async () => {
          await sleepCards.read.locked([999n]);
        },
        /ERC721NonexistentToken/
      );
    });
  });

  describe('BaseURI Administration', () => {
    it('admin can setBaseURI and updates tokenURI', async () => {
      const { sleepCards, admin, minter, user1 } = await deployFixture();
      await sleepCards.write.mint([user1.account.address, 12n], {
        account: minter.account
      });

      const newBase = 'https://cdn.simplisleep.app/metadata/';
      await sleepCards.write.setBaseURI([newBase], {
        account: admin.account
      });

      assert.equal(await sleepCards.read.baseURI(), newBase);
      assert.equal(await sleepCards.read.tokenURI([1n]), `${newBase}12.json`);
    });

    it('non-admin cannot setBaseURI', async () => {
      const { sleepCards, user1 } = await deployFixture();

      await assert.rejects(
        async () => {
          await sleepCards.write.setBaseURI(['https://hacked.com/'], {
            account: user1.account
          });
        },
        /AccessControlUnauthorizedAccount/
      );
    });
  });
});
