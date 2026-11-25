import hre from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Baca env root monorepo
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  const networkName = hre.network.name;
  console.log(`[deploy] Starting deployment on network: ${networkName}...`);

  const publicClient = await hre.viem.getPublicClient();
  const [deployer] = await hre.viem.getWalletClients();

  const chainId = await publicClient.getChainId();
  const deployerAddress = deployer.account.address;
  console.log(`[deploy] Deployer address: ${deployerAddress}, Chain ID: ${chainId}`);

  // Base URI default for metadata
  const initialBaseURI = 'https://simplisleep.app/api/cards/metadata/';

  // Deploy SleepCards
  console.log(`[deploy] Deploying SleepCards...`);
  const sleepCards = await hre.viem.deployContract('SleepCards', [deployerAddress, initialBaseURI]);
  console.log(`[deploy] SleepCards deployed to: ${sleepCards.address}`);

  // Deploy LeaderboardCommit
  console.log(`[deploy] Deploying LeaderboardCommit...`);
  const leaderboardCommit = await hre.viem.deployContract('LeaderboardCommit', [deployerAddress]);
  console.log(`[deploy] LeaderboardCommit deployed to: ${leaderboardCommit.address}`);

  // Prepare deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: Number(chainId),
    deployer: deployerAddress,
    SleepCards: sleepCards.address,
    LeaderboardCommit: leaderboardCommit.address,
    contracts: {
      SleepCards: sleepCards.address,
      LeaderboardCommit: leaderboardCommit.address
    },
    deployedAt: new Date().toISOString()
  };

  // Ensure deployments directory exists
  const deploymentsDir = path.resolve(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`[deploy] Deployment info saved to: ${deploymentFile}`);
}

main().catch((error) => {
  console.error('[deploy] Deployment failed:', error);
  process.exitCode = 1;
});
