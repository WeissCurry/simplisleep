import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const deployApiDir = path.resolve(rootDir, 'deploy/api');

// 1. Buat direktori tujuan
const targetCardsDir = path.resolve(deployApiDir, 'assets/cards');
const targetAbiDir = path.resolve(deployApiDir, 'packages/contracts/abi');
fs.mkdirSync(targetCardsDir, { recursive: true });
fs.mkdirSync(targetAbiDir, { recursive: true });

// 2. Salin aset JSON kartu
const srcCardsDir = path.resolve(rootDir, 'assets/cards');
for (const file of ['cards.json', 'rarity.json']) {
  const src = path.resolve(srcCardsDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.resolve(targetCardsDir, file));
  }
}

// 3. Salin ABI smart contract JSON
const srcAbiDir = path.resolve(rootDir, 'packages/contracts/abi');
for (const file of ['SleepCards.json', 'LeaderboardCommit.json']) {
  const src = path.resolve(srcAbiDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.resolve(targetAbiDir, file));
  }
}

// 4. Buat deploy/api/package.json minimal
const pkgJsonContent = {
  type: 'module',
  engines: {
    node: '>=22.5'
  }
};
fs.writeFileSync(
  path.resolve(deployApiDir, 'package.json'),
  JSON.stringify(pkgJsonContent, null, 2) + '\n'
);

// 5. Buat deploy/api/ecosystem.config.cjs untuk PM2
const pm2ConfigContent = `module.exports = {
  apps: [
    {
      name: 'simplisleep-api',
      script: 'index.mjs',
      node_args: '--env-file=.env --experimental-sqlite --max-old-space-size=128',
      env: {
        APP_ROOT: '.'
      },
      max_memory_restart: '200M'
    }
  ]
};
`;
fs.writeFileSync(path.resolve(deployApiDir, 'ecosystem.config.cjs'), pm2ConfigContent);

console.log('[deploy] Aset runtime, package.json, dan ecosystem.config.cjs berhasil disiapkan di deploy/api/');
