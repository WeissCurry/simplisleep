import * as fs from 'fs';
import * as path from 'path';

export interface CardAsset {
  id: string;
  name: string;
  rarity: string;
  image: string;
  description: string;
}

export interface OpenSeaAttribute {
  trait_type: string;
  value: string;
}

export interface OpenSeaMetadata {
  name: string;
  description: string;
  image: string;
  attributes: OpenSeaAttribute[];
}

/**
 * Menghasilkan metadata JSON standar OpenSea untuk setiap kartu koleksi di assets/cards/cards.json.
 * Menyimpan hasilnya ke packages/contracts/metadata/<cardNumber>.json (1-based index).
 */
export function buildMetadata(
  outputDirParam?: string,
  imageBaseUrlParam?: string
): Array<{ cardNumber: number; filePath: string; metadata: OpenSeaMetadata }> {
  const rootDir = path.resolve(__dirname, '../../..');
  const cardsJsonPath = path.join(rootDir, 'assets', 'cards', 'cards.json');

  if (!fs.existsSync(cardsJsonPath)) {
    throw new Error(`cards.json not found at ${cardsJsonPath}`);
  }

  const cardsRaw = fs.readFileSync(cardsJsonPath, 'utf-8');
  const cards: CardAsset[] = JSON.parse(cardsRaw);

  const outputDir = outputDirParam || path.resolve(__dirname, '../metadata');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let baseImageUrl =
    imageBaseUrlParam || process.env.CARD_IMAGE_BASE_URL || 'ipfs://TODO/';
  if (!baseImageUrl.endsWith('/')) {
    baseImageUrl += '/';
  }

  const results: Array<{ cardNumber: number; filePath: string; metadata: OpenSeaMetadata }> = [];

  for (let index = 0; index < cards.length; index++) {
    const card = cards[index];
    const cardNumber = index + 1; // 1-based index identik dengan cardNumberFromSlug

    const metadata: OpenSeaMetadata = {
      name: card.name,
      description: card.description,
      image: `${baseImageUrl}${card.id}.webp`,
      attributes: [
        {
          trait_type: 'Rarity',
          value: card.rarity
        },
        {
          trait_type: 'Set',
          value: 'Simply is Sleeping'
        },
        {
          trait_type: 'Soulbound',
          value: 'true'
        }
      ]
    };

    const targetFile = path.join(outputDir, `${cardNumber}.json`);
    fs.writeFileSync(targetFile, JSON.stringify(metadata, null, 2));
    results.push({ cardNumber, filePath: targetFile, metadata });
  }

  console.log(`[build-metadata] Successfully generated ${results.length} metadata files in ${outputDir}`);
  return results;
}

buildMetadata();
