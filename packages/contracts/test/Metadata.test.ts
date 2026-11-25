import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { buildMetadata, OpenSeaMetadata } from '../scripts/build-metadata';

describe('NFT Metadata Generator (scripts/build-metadata.ts)', () => {
  const metadataDir = path.resolve(__dirname, '../metadata');
  const cardsJsonPath = path.resolve(__dirname, '../../../assets/cards/cards.json');

  it('menghasilkan 28 file metadata dengan format OpenSea yang valid', () => {
    const results = buildMetadata(metadataDir, 'ipfs://TEST_CID/');
    assert.equal(results.length, 28);

    const cardsRaw = fs.readFileSync(cardsJsonPath, 'utf-8');
    const cards = JSON.parse(cardsRaw);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardNumber = i + 1;
      const metaFilePath = path.join(metadataDir, `${cardNumber}.json`);

      assert.equal(fs.existsSync(metaFilePath), true);

      const metadata: OpenSeaMetadata = JSON.parse(fs.readFileSync(metaFilePath, 'utf-8'));

      // Validasi field utama standar OpenSea
      assert.equal(metadata.name, card.name);
      assert.equal(metadata.description, card.description);
      assert.equal(metadata.image, `ipfs://TEST_CID/${card.id}.webp`);

      // Validasi attributes [Rarity, Set 'Simply is Sleeping', Soulbound true]
      assert.equal(metadata.attributes.length, 3);

      const rarityAttr = metadata.attributes.find((a) => a.trait_type === 'Rarity');
      assert.ok(rarityAttr);
      assert.equal(rarityAttr?.value, card.rarity);

      const setAttr = metadata.attributes.find((a) => a.trait_type === 'Set');
      assert.ok(setAttr);
      assert.equal(setAttr?.value, 'Simply is Sleeping');

      const soulboundAttr = metadata.attributes.find((a) => a.trait_type === 'Soulbound');
      assert.ok(soulboundAttr);
      assert.equal(soulboundAttr?.value, 'true');
    }
  });

  it('konsistensi 1-based cardNumber identik dengan slug urutan cards.json', () => {
    const cards = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf-8'));

    // Verifikasi slug pertama dan terakhir
    assert.equal(cards[0].id, 'orange-cat');
    assert.equal(cards[27].id, 'phoenix');

    for (let i = 0; i < cards.length; i++) {
      const cardNumber = i + 1;
      const metaFilePath = path.join(metadataDir, `${cardNumber}.json`);
      const metadata = JSON.parse(fs.readFileSync(metaFilePath, 'utf-8'));

      // Gambar harus memuat slug id yang sama
      assert.ok(metadata.image.includes(`${cards[i].id}.webp`));
    }
  });
});
