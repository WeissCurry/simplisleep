# Panduan Deployment Smart Contracts ke Ethereum Sepolia Testnet (SimpliSleep)

Dokumen ini adalah panduan langkah demi langkah bagi pemilik proyek untuk melakukan deployment smart contracts (`SleepCards.sol` dan `LeaderboardCommit.sol`) ke jaringan **Ethereum Sepolia Testnet**, mengunggah metadata NFT, memverifikasi kontrak di Etherscan, dan mengonfigurasi API SimpliSleep.

> [!WARNING]
> Langkah-langkah bertanda **`[MANUAL]`** memerlukan intervensi langsung dari pengguna manusia (pemilik proyek). Jangan pernah menyimpan atau memasukkan private key dompet utama (mainnet) ke dalam repositori atau file konfigurasi!

---

## 1. Persiapan Wallet Deployer Khusus `[MANUAL]`

1. Buka browser wallet Anda (misalnya **MetaMask** atau **Rabby**).
2. Buat akun baru (*Create Account*) khusus untuk development/testing testnet.
   - Beri nama misalnya: `SimpliSleep Sepolia Deployer`.
3. **PENTING**: Jangan gunakan akun utama yang menyimpan dana riil (Ethereum Mainnet).
4. Ekspor Private Key dari akun baru tersebut:
   - Di MetaMask: Buka *Account details* -> *Show private key* -> Masukkan kata sandi -> Salin kunci hex (dimulai dengan `0x`).
5. Salin alamat publik dompet (*Public Address*) tersebut.

---

## 2. Mendapatkan Sepolia ETH dari Faucet `[MANUAL]`

Untuk membayar *gas fee* saat deployment di Sepolia, Anda membutuhkan saldo Sepolia ETH (~0.05 – 0.1 ETH sudah lebih dari cukup):

Pilih salah satu faucet resmi dan tepercaya berikut:
- **Google Cloud Web3 Faucet**: [https://cloud.google.com/application/web3/faucet/ethereum/sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) (bebas captchanya mudah dengan akun Google).
- **Alchemy Sepolia Faucet**: [https://sepoliafaucet.com](https://sepoliafaucet.com) (membutuhkan akun Alchemy gratis).
- **Infura Sepolia Faucet**: [https://www.infura.io/faucet/sepolia](https://www.infura.io/faucet/sepolia).
- **PoW Faucet (Mining CPU)**: [https://sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de) (tanpa registrasi).

Pastikan saldo Sepolia ETH sudah masuk ke alamat wallet deployer Anda sebelum melanjutkan.

---

## 3. Konfigurasi Environment Root (`.env`) `[MANUAL]`

Buat atau sunting file `.env` di **root monorepo** (`/Users/curry/Documents/Ngoding/simplisleep/.env`). File `.env` sudah masuk ke dalam `.gitignore` sehingga tidak akan ter-commit ke repositori publik.

Isi variabel-variabel berikut (ganti placeholder dengan nilai milik Anda):

```bash
# RPC Endpoint Sepolia (Dapatkan gratis dari Alchemy / Infura / QuickNode)
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY"

# Private key wallet deployer khusus (dari Langkah 1)
DEPLOYER_PRIVATE_KEY="0xYOUR_TESTNET_PRIVATE_KEY_HERE"

# API Key Etherscan untuk verifikasi source code otomatis (Dapatkan gratis di https://etherscan.io/myapikey)
ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY_HERE"

# Base URL untuk gambar kartu NFT (Opsional, default 'ipfs://TODO/' bila dikosongkan)
# Contoh IPFS: "ipfs://QmYourImageFolderCID/"
# Contoh Web Hosting: "https://simplisleep.app/cards/images/"
CARD_IMAGE_BASE_URL="ipfs://TODO/"
```

---

## 4. Build Metadata Kartu & Kompilasi Kontrak

Jalankan perintah ini di terminal untuk mengompilasi kontrak dan menghasilkan 28 metadata JSON standar OpenSea di `packages/contracts/metadata/`:

```bash
# Generate file metadata 1.json .. 28.json dan kompilasi smart contracts
pnpm --filter contracts run build
```

Hasil file metadata akan tersimpan rapi di:
- `packages/contracts/metadata/1.json` s/d `packages/contracts/metadata/28.json`

---

## 5. Upload Gambar & Metadata NFT `[MANUAL]`

Ada dua opsi untuk menyajikan gambar dan metadata token NFT (`tokenURI`):

### Opsi A: Hosting Statis di Web App (Paling Cepat & Praktis untuk Demo)
1. Salin seluruh file gambar kartu dari `assets/cards/*.png` ke folder publik web:
   ```bash
   mkdir -p apps/web/public/cards/images
   cp assets/cards/*.png apps/web/public/cards/images/
   ```
2. Salin seluruh file metadata ke folder publik web:
   ```bash
   mkdir -p apps/web/public/cards/metadata
   cp packages/contracts/metadata/*.json apps/web/public/cards/metadata/
   ```
3. Base URI Anda adalah:
   `https://<domain-web-kamu>/cards/metadata/` (diakhiri tanda slash `/`).

---

### Opsi B: Desentralisasi via IPFS (Pinata)
1. Buat akun di [Pinata](https://www.pinata.cloud/).
2. **Upload Folder Gambar**:
   - Upload seluruh folder `assets/cards/` ke Pinata.
   - Catat CID folder gambar (misal: `QmImages123...`).
3. **Re-generate Metadata dengan Image CID**:
   - Jalankan terminal:
     ```bash
     CARD_IMAGE_BASE_URL="ipfs://QmImages123.../" pnpm --filter contracts run build:metadata
     ```
4. **Upload Folder Metadata**:
   - Upload folder `packages/contracts/metadata/` ke Pinata.
   - Catat CID folder metadata (misal: `QmMetadata456...`).
5. Base URI Anda adalah:
   `ipfs://QmMetadata456.../` (diakhiri tanda slash `/`).

---

## 6. Jalankan Script Deployment ke Sepolia

Jalankan perintah deployment berikut dari root direktori proyek:

```bash
pnpm --filter contracts run deploy:sepolia
```

Output terminal akan mencetak alamat kontrak yang berhasil di-deploy:
```text
[deploy] Starting deployment on network: sepolia...
[deploy] Deployer address: 0x...
[deploy] Deploying SleepCards...
[deploy] SleepCards deployed to: 0x1111...
[deploy] Deploying LeaderboardCommit...
[deploy] LeaderboardCommit deployed to: 0x2222...
[deploy] Deployment info saved to: .../packages/contracts/deployments/sepolia.json
```

File riwayat deployment otomatis tercatat di:
`packages/contracts/deployments/sepolia.json`

---

## 7. Salin Alamat Kontrak ke Environment API (`apps/api`) `[MANUAL]`

Buka file `.env` root atau konfigurasi environment `apps/api`, lalu masukkan alamat kontrak yang baru diperoleh:

```bash
# Tambahkan alamat hasil deployment Sepolia ke .env
SLEEP_CARDS_ADDRESS="0xAlamatSleepCardsDariLangkah6"
LEADERBOARD_COMMIT_ADDRESS="0xAlamatLeaderboardCommitDariLangkah6"
```

Setelah variabel ini terisi, backend `apps/api` akan otomatis beralih dari status dummy `pending-mint` ke minting NFT on-chain riil di Sepolia saat user mengklaim kartu.

---

## 8. Konfigurasi `baseURI` di Kontrak `SleepCards` `[OPSIONAL]`

Saat pertama kali di-deploy, `baseURI` diatur default ke `https://simplisleep.app/api/cards/metadata/`.
Jika Anda ingin mengubah `baseURI` ke URL hosting Anda sendiri atau link IPFS Pinata dari Langkah 5:

1. Buka kontrak `SleepCards` di Etherscan Sepolia tab **Contract** -> **Write as Proxy / Write Contract**.
2. Hubungkan dompet deployer (yang memiliki `DEFAULT_ADMIN_ROLE`).
3. Panggil fungsi `setBaseURI`:
   - `newBaseURI`: `"https://<domain-kamu>/cards/metadata/"` atau `"ipfs://QmMetadata456.../"`
4. Konfirmasi transaksi di wallet.

---

## 9. Verifikasi Kontrak di Etherscan Sepolia

Verifikasi source code membuat kontrak dapat dibaca dan diaudit secara publik di Etherscan Sepolia.

Gunakan Hardhat CLI dengan memasukkan alamat kontrak dan parameter konstruktor:

```bash
# 1. Verifikasi SleepCards:
# Argumen: <ALAMAT_SLEEPCARDS> "<ALAMAT_DEPLOYER>" "<INITIAL_BASE_URI>"
npx hardhat verify --network sepolia <ALAMAT_SLEEPCARDS> "<ALAMAT_DEPLOYER>" "https://simplisleep.app/api/cards/metadata/"

# 2. Verifikasi LeaderboardCommit:
# Argumen: <ALAMAT_LEADERBOARD_COMMIT> "<ALAMAT_DEPLOYER>"
npx hardhat verify --network sepolia <ALAMAT_LEADERBOARD_COMMIT> "<ALAMAT_DEPLOYER>"
```

Setelah diverifikasi, Anda akan melihat centang hijau (*Contract Source Code Verified*) di halaman Etherscan Sepolia.

---

## 10. Cara Memeriksa & Menguji Kartu Soulbound di Sepolia

Untuk memastikan kartu bersifat **Soulbound (ERC-5192)** dan tidak dapat dipindahtangankan:

1. **Cek Status Kunci (ERC-5192 locked)**:
   - Buka tab **Read Contract** pada kontrak `SleepCards` di Etherscan Sepolia.
   - Panggil fungsi `locked(uint256 tokenId)` dengan ID token yang sudah di-mint (misalnya `1`).
   - Hasil yang dikembalikan harus: `true`.
2. **Cek Dukungan Standar ERC-5192**:
   - Panggil fungsi `supportsInterface(bytes4 interfaceId)` dengan nilai `0xb45a3c0e`.
   - Hasil yang dikembalikan harus: `true`.
3. **Cek Metadata URI**:
   - Panggil fungsi `tokenURI(uint256 tokenId)` -> harus menghasilkan `baseURI + cardNumber + '.json'`.
4. **Uji Penolakan Transfer (Soulbound Protection)**:
   - Masuk ke tab **Write Contract** di Etherscan menggunakan akun pemilik token.
   - Coba panggil `transferFrom(owner, recipient, tokenId)` atau `approve(operator, tokenId)`.
   - Transaksi akan gagal diestimasi gas dan memunculkan error revert: `SoulboundToken()`.
   - Hal ini membuktikan bahwa kartu terikat secara permanen pada wallet karyawan dan tidak dapat diperjualbelikan.
