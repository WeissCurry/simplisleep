import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Read env from root monorepo
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL?.trim();
const deployerKey = process.env.DEPLOYER_PRIVATE_KEY?.trim();
const etherscanApiKey = process.env.ETHERSCAN_API_KEY?.trim();

const isSepoliaConfigured = Boolean(sepoliaRpcUrl && deployerKey);

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      evmVersion: 'cancun',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    ...(isSepoliaConfigured
      ? {
          sepolia: {
            url: sepoliaRpcUrl!,
            accounts: [deployerKey!.startsWith('0x') ? deployerKey! : `0x${deployerKey}`]
          }
        }
      : {})
  },
  etherscan: {
    apiKey: {
      sepolia: etherscanApiKey || ''
    }
  }
};

export default config;
