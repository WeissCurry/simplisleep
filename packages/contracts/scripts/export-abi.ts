import * as fs from 'fs';
import * as path from 'path';

function exportAbi() {
  const contractsDir = path.resolve(__dirname, '..');
  const artifactsDir = path.join(contractsDir, 'artifacts', 'contracts');
  const abiOutputDir = path.join(contractsDir, 'abi');

  if (!fs.existsSync(abiOutputDir)) {
    fs.mkdirSync(abiOutputDir, { recursive: true });
  }

  const targets = [
    {
      source: path.join(artifactsDir, 'SleepCards.sol', 'SleepCards.json'),
      targetJson: path.join(abiOutputDir, 'SleepCards.json'),
      name: 'SleepCards'
    },
    {
      source: path.join(artifactsDir, 'LeaderboardCommit.sol', 'LeaderboardCommit.json'),
      targetJson: path.join(abiOutputDir, 'LeaderboardCommit.json'),
      name: 'LeaderboardCommit'
    }
  ];

  for (const { source, targetJson, name } of targets) {
    if (!fs.existsSync(source)) {
      throw new Error(`Artifact not found: ${source}. Please compile contracts first.`);
    }
    const artifact = JSON.parse(fs.readFileSync(source, 'utf-8'));
    fs.writeFileSync(targetJson, JSON.stringify(artifact.abi, null, 2));
    console.log(`[export-abi] Exported ABI for ${name} to ${targetJson}`);
  }

  // Also create index.ts for convenient typed imports
  const indexContent = `import SleepCardsAbi from './SleepCards.json';
import LeaderboardCommitAbi from './LeaderboardCommit.json';

export { SleepCardsAbi, LeaderboardCommitAbi };
export const SleepCards = SleepCardsAbi;
export const LeaderboardCommit = LeaderboardCommitAbi;
export default {
  SleepCards: SleepCardsAbi,
  LeaderboardCommit: LeaderboardCommitAbi
};
`;
  fs.writeFileSync(path.join(abiOutputDir, 'index.ts'), indexContent);
  console.log(`[export-abi] Generated ${path.join(abiOutputDir, 'index.ts')}`);
}

exportAbi();
