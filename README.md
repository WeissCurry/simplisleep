# SimpliSleep

SimpliSleep adalah platform gamifikasi kebiasaan tidur sehat untuk karyawan SimpliDOTS (SimpliMates). Aplikasi ini memadukan algoritma skor tidur berbasis durasi dan konsistensi, kartu koleksi digital Soulbound NFT (ERC-5192) di jaringan Ethereum Sepolia, dan bukti integritas klasemen mingguan on-chain tanpa mengekspos data privat jam tidur.

## Asal Ide

Aplikasi ini lahir dari satu frasa yang terucap oleh salah satu SimpliMates saat bekerja larut malam:

> "ini aku belum tidur ini... sebentar lagi goyang"

Kalimat tersebut menggambarkan kebiasaan begadang yang kerap dianggap biasa. SimpliSleep dibuat agar tidur cukup menjadi kebiasaan seru yang bisa dilakukan bareng tim melalui skor harian, streak, fitur saling mengingatkan, dan kartu koleksi.

---

## Fitur Utama

- **Pencatatan Jam Tidur Server-Side**: Waktu mulai tidur dan bangun dihitung langsung oleh jam server saat tombol ditekan untuk mencegah manipulasi waktu lokal pada perangkat pengguna.
- **Deteksi Aktivitas Malam ("Masih Melek")**: Heartbeat API mendeteksi aktivitas pengguna di malam hari saat sesi tidur sedang aktif dan menandai sesi sebagai terputus (broken session).
- **Ingatkan Tidur (Peer Reminder)**: Pengguna dapat saling mengirim pengingat tidur kepada rekan yang terdeteksi masih beraktivitas larut malam, dilengkapi jeda (cooldown) 5 menit per pasangan pengirim-target, notifikasi in-app, dan Browser Notification API.
- **Algoritma Skor Tidur Saintifik (0-100)**:
  - 70% Bobot Durasi: Skor optimal 100 pada rentang 7-9 jam, berkurang linear ke 0 pada durasi di bawah 4 jam atau di atas 12 jam (mengacu konsensus AASM dan NSF).
  - 30% Bobot Konsistensi: Penilaian deviasi jam mulai tidur harian terhadap median 7 hari sebelumnya.
  - Streak: Akumulasi hari berturut-turut dengan skor tidur minimal 70.
- **Leaderboard Mingguan Terverifikasi**: Menampilkan klasemen mingguan (kategori Paling Konsisten, Paling Membaik, dan Streak Terpanjang) dengan verifikasi hash on-chain langsung di halaman Leaderboard (halaman transparansi terpisah telah diintegrasikan ke halaman ini). Rekan kerja hanya melihat skor agregat dan label umum tanpa jam tidur spesifik.
- **Kartu Koleksi "Simply is Sleeping"**: 28 varian kartu hewan tidur bergaya pixel art 16-bit dengan 4 tier kelangkaan (12 Common, 8 Rare, 5 Epic, 3 Legendary). Kartu berstatus Soulbound NFT (ERC-5192) terikat ke wallet pengguna.
- **Mode Demo Instan (3 Akun Resmi)**: Tersedia 3 profil pengguna demo dengan data histori dan peran berbeda:
  1. `budi-santoso`: Engineering Lead (10 kartu koleksi, peringkat 2).
  2. `siti-rahma`: Senior QA Engineer (peringkat 1 konsistensi, kartu Legendary Sepolia).
  3. `gilang-ramadhan`: DevOps Engineer (kategori Paling Membaik).

---

## Arsitektur Singkat (On-Chain vs Off-Chain)

SimpliSleep menerapkan arsitektur hybrid yang mengutamakan privasi data tidur (Privacy-by-Design):

- **Off-Chain (Database SQLite & Backend API)**:
  - Seluruh data sensitif disimpan secara off-chain di database internal: jam tidur (`started_at`), jam bangun (`ended_at`), status heartbeat, catatan pengingat tidur, dan profil pengguna.
  - Kunci privat custodial wallet dienkripsi menggunakan AES-256-GCM.
- **On-Chain (Ethereum Sepolia Testnet)**:
  - Hanya menerima artefak kriptografis publik:
    1. **Kartu Soulbound (ERC-5192)**: Token koleksi non-transferable yang di-mint langsung ke alamat wallet pengguna.
    2. **Komitmen Klasemen Mingguan (`LeaderboardCommit.sol`)**: Hash Keccak-256 dari tabel klasemen mingguan yang dinormalisasi, dikunci permanen setiap akhir minggu.

---

## Struktur Monorepo

```text
simplisleep/ (pnpm workspace)
|
|-- apps/
|   |-- web/               # Frontend: Angular 22, Tailwind CSS 4, GSAP (Port dev: 4200)
|   `-- api/               # Backend: Node.js, Hono, node:sqlite bawaan (Port dev: 3100)
|
|-- packages/
|   |-- shared/            # Tipe domain TypeScript, pure scoring logic, dan tes Vitest
|   `-- contracts/         # Hardhat, viem, Solidity (SleepCards.sol & LeaderboardCommit.sol)
|
|-- assets/
|   `-- cards/             # 28 varian kartu hewan tidur (WebP, PNG master, dan metadata)
|
`-- docs/                  # Dokumentasi teknis
    `-- DEPLOY_SEPOLIA.md  # Panduan deployment kontrak cerdas ke Sepolia
```

---

## Prasyarat Sistem

- **Node.js**: Versi `>= 22.22.3` atau `>= 24.15` (Angular CLI 22); API butuh minimal `22.5` untuk `node:sqlite`. Periksa: `node -v`
- **pnpm**: Versi `>= 9.0.0`. Periksa: `pnpm -v`
- **Peramban Web Modern**: Chrome, Edge, Firefox, atau Safari dengan dukungan JavaScript aktif.

---

## Menjalankan Secara Lokal

Aplikasi dapat dijalankan secara lokal tanpa membuat file `.env`. Backend secara otomatis beroperasi dalam mode development/demo (menggunakan database SQLite lokal, ephemeral keys, dan bypass fallback Web3).

### 1. Instalasi Dependensi
```bash
pnpm install
```

### 2. Jalankan Mode Development (Full-Stack)
Jalankan paket shared, backend API, dan frontend web sekaligus:
```bash
pnpm dev
```
- **Web Frontend**: [http://localhost:4200](http://localhost:4200)
- **API Backend**: [http://localhost:3100](http://localhost:3100) (Health check: [http://localhost:3100/api/health](http://localhost:3100/api/health))

### Alternatif: Jalankan Secara Terpisah
Jika ingin menjalankan layanan pada terminal berbeda:
```bash
# Build paket shared terlebih dahulu
pnpm --filter shared build

# Terminal 1: Backend API (port 3100)
pnpm --filter api dev

# Terminal 2: Frontend Web (port 4200)
pnpm --filter web dev
```

### Menjalankan Ulang Data Seed Lokal
Database SQLite `simplisleep.db` diinisialisasi otomatis saat pertama kali API dijalankan. Untuk mereset data demo ke kondisi awal:
```bash
pnpm --filter api seed
```

---

## Demo Statis (Tanpa Backend)

Aplikasi web dapat di-build sebagai SPA statis murni yang menggunakan data mock di sisi peramban (`useMock: true` via `environment.demo.ts`):

```bash
# Build distribusi demo statis
pnpm build:demo
```
Hasil build berada di `apps/web/dist/web/browser`. Konfigurasi rewrite SPA dan proxy API untuk Netlify telah disediakan terpusat pada file `netlify.toml` di root repositori.

---

## Pengujian (Testing)

Semua suite pengujian dapat dijalankan dari root monorepo:

```bash
# Menjalankan seluruh pengujian di semua paket
pnpm test

# Menjalankan unit test modul skor tidur (Vitest)
pnpm --filter shared test

# Menjalankan pengujian integrasi REST API backend (Vitest)
pnpm --filter api test

# Menjalankan unit test frontend Angular (Vitest)
pnpm --filter web test

# Menjalankan pengujian smart contract Solidity (Hardhat)
pnpm --filter contracts test
```

---

## Variabel Lingkungan (Environment Variables)

Variabel lingkungan dibaca dari root `.env` atau environment server. Tabel berikut merangkum seluruh variabel yang dibaca melalui `process.env` pada kode sumber:

| Nama Variabel | Wajib di Prod | Fungsi | Cara Mendapatkan Nilai |
|---|---|---|---|
| `NODE_ENV` | Wajib | Mengaktifkan validasi keamanan ketat di production (`production`). | Diset ke `production` pada konfigurasi hosting. |
| `JWT_SECRET` | Wajib | Kunci penandatanganan token otentikasi JWT (HS256). | Dibuat dengan `openssl rand -hex 32`. |
| `WALLET_ENC_KEY` | Wajib | Kunci enkripsi AES-256-GCM untuk custodial wallet pengguna. | Dibuat dengan `openssl rand -hex 32`. Wajib disimpan permanen agar wallet tidak terkunci. |
| `GOOGLE_CLIENT_ID` | Wajib* | Client ID OAuth 2.0 untuk Google Sign-In produksi (*Wajib jika menggunakan Google Auth). Nilai yang sama wajib diisi pada `googleClientId` di `apps/web/src/environments/environment.ts`. | Diambil dari Google Cloud Console pada menu APIs & Services > Credentials. Origin (*Authorized JavaScript origins*) harus sama persis dengan domain web. |
| `WEB_ORIGIN` | Wajib* | Domain frontend yang diizinkan CORS (*Wajib jika API dan web berbeda domain). Mendukung daftar domain dipisah koma. | URL domain web production (contoh: `https://simplisleep.netlify.app,http://localhost:4200`). |
| `TRUST_PROXY` | Opsional | Mempercayai header `X-Forwarded-For` untuk rate limiter saat di belakang reverse proxy PaaS (`true`/`false`). | Diset `true` bila hosting di Railway, Fly.io, Cloudflare, atau Nginx. |
| `AUTO_SEED` | Opsional | Mengizinkan auto-seed data demo saat tabel users kosong di production (`true`/`false`). Default di prod: nonaktif. | Diset `true` pada hosting jika database baru ingin otomatis diisi data demo Simplimates. |
| `ADMIN_TOKEN` | Wajib | Token rahasia otentikasi endpoint `POST /api/admin/close-week`. | Dibuat acak dengan `openssl rand -hex 24`. |
| `ENABLE_DEMO_LOGIN` | Wajib | Mengaktifkan/menonaktifkan login 3 akun demo tanpa kata sandi. | Diset `false` di production untuk menonaktifkan endpoint demo auth. |
| `DB_PATH` | Opsional | Lokasi file database SQLite. Default: `./simplisleep.db`. | Diset ke path persistent disk volume hosting (contoh: `/data/simplisleep.db`). |
| `PORT` | Opsional | Port listening server API. Default: `3100`. | Otomatis disediakan oleh PaaS (misal Railway/Render) atau diset manual. |
| `SEPOLIA_RPC_URL` | Opsional | Endpoint RPC Ethereum Sepolia untuk minting kartu dan commit mingguan. | Dibuat melalui Alchemy, Infura, atau QuickNode. Bila kosong, Web3 beroperasi dalam status fallback pending. |
| `DEPLOYER_PRIVATE_KEY` | Opsional | Kunci privat wallet relayer transaksi Sepolia (format `0x...`). | Diekspor dari wallet pengelola gas relayer khusus Sepolia. |
| `SLEEP_CARDS_ADDRESS` | Opsional | Alamat kontrak `SleepCards.sol` di Sepolia. | Alamat kontrak hasil deployment ke Sepolia. |
| `LEADERBOARD_COMMIT_ADDRESS` | Opsional | Alamat kontrak `LeaderboardCommit.sol` di Sepolia. | Alamat kontrak hasil deployment ke Sepolia. |
| `ETHERSCAN_API_KEY` | Opsional (Build) | API Key Etherscan untuk verifikasi source code smart contract. | Diambil dari akun Etherscan developer portal. |
| `CARD_IMAGE_BASE_URL` | Opsional (Build) | Base URI gambar metadata IPFS pada script `build-metadata.ts`. | URL IPFS gateway atau CDN aset kartu. Default: `ipfs://TODO/`. |
| `DEMO_WALLET_ADDRESS` | Opsional | Alamat wallet MetaMask/Web3 penerima kartu minting 3 akun demo. | Diisi alamat wallet pribadi (format `0x...`) jika ingin kartu demo masuk ke wallet asli untuk dicek di Sepolia. |

> [!IMPORTANT]
> **Konfigurasi Google Sign-In**:
> - Client ID yang sama (`GOOGLE_CLIENT_ID`) diisi pada `googleClientId` di `apps/web/src/environments/environment.ts` dan `apps/web/src/environments/environment.development.ts`.
> - Untuk dev lokal, `GOOGLE_CLIENT_ID` dibaca dari file `.env` di root repo (dimuat otomatis oleh API via `--env-file-if-exists`).
> - Authorized JavaScript origins di Google Cloud Console harus mencakup `http://localhost:4200` DAN `http://localhost` (Google Identity Services membutuhkan keduanya untuk origin check), serta domain web production tanpa trailing slash (contoh: `https://simplisleep.netlify.app`).
> - Perubahan origin di Google Cloud Console membutuhkan waktu beberapa menit untuk terpropagasi.
> - Bila `googleClientId` kosong atau `useMock: true`, tombol "Masuk Google" akan otomatis berstatus disabled dengan keterangan "Login Google belum dikonfigurasi" tanpa memicu error console.

---

## Deployment Production

### Tautan Live Deployment
- **Frontend Web (Netlify)**: [https://simplisleep.netlify.app](https://simplisleep.netlify.app)
- **Backend API (VPS Ubuntu)**: [https://api-simplisleep.skyshareacademy.id](https://api-simplisleep.skyshareacademy.id)
- **Endpoint Health Check**: [https://api-simplisleep.skyshareacademy.id/api/health](https://api-simplisleep.skyshareacademy.id/api/health)

### 1. Arsitektur Hosting yang Disarankan
- **Frontend Web**: Static Hosting (Netlify, Vercel, Cloudflare Pages). Konfigurasi build monorepo (`base = "apps/web"`, `publish = "dist/web/browser"` yang kompatibel dengan plugin `@netlify/angular-runtime`), headers keamanan, proxy reverse ke API (`/api/*`), dan routing SPA telah disediakan terpusat via `netlify.toml` di root repo.
- **Backend API**: Server Container / VPS dengan Persistent Volume (Railway, Fly.io, Render, atau VPS Ubuntu):
  - Railway / Nixpacks atau container host memerlukan Node.js versi 24 (telah dikonfigurasi via `"engines": { "node": ">=22.22.3" }` di `package.json` root agar runtime memilih versi yang sesuai). Modul bawaan `node:sqlite` membutuhkan Node.js runtime `>= 22.5.0`.
  - SQLite berjalan dalam mode WAL (`simplisleep.db`, `simplisleep.db-wal`, `simplisleep.db-shm`). Arahkan variabel `DB_PATH` ke direktori volume persisten (contoh: `/data/simplisleep.db`) agar data tidak hilang saat restart kontainer.
- **HTTPS Wajib**: Browser Notification API pada fitur "Ingatkan Tidur" hanya aktif pada Secure Context (HTTPS) atau localhost.

### 2. Perintah Build Production
```bash
# Build paket shared dan backend API
pnpm --filter shared build
pnpm --filter api build

# Build paket frontend web standar (non-demo)
pnpm --filter web build
```

### 3. Checklist Penting Sebelum Go-Live
- Set `NODE_ENV=production`.
- Set `ENABLE_DEMO_LOGIN=false` agar autentikasi demo dinonaktifkan (atau `true` bila evaluasi masih memerlukan login demo).
- Pastikan `JWT_SECRET` dan `WALLET_ENC_KEY` telah terisi di environment server.
- Siapkan cron job mingguan setiap Senin pukul 00:05 WIB untuk memicu penutupan minggu klasemen:
  ```bash
  PREV_WEEK=$(date -v-1d +%Y-W%V 2>/dev/null || date -d "yesterday" +%Y-W%V)
  curl -s -X POST "https://api.domain.com/api/admin/close-week?week=${PREV_WEEK}" \
    -H "x-admin-token: ${ADMIN_TOKEN}"
  ```

### 4. Panduan Deployment API ke Railway
SimpliSleep menyertakan konfigurasi `Dockerfile` dan `railway.json` di root repositori untuk deployment container API yang andal di monorepo pnpm:

1. **New Project dari GitHub**:
   - Buka dashboard [Railway](https://railway.app).
   - Buat project baru: **New Project** > **Deploy from GitHub repo** > pilih repositori `simplisleep`.
2. **Otomasi Build via Dockerfile**:
   - Railway otomatis mendeteksi `railway.json` dan `Dockerfile` pada root monorepo.
   - Build container menggunakan image `node:24-slim` dengan modul `node:sqlite` bawaan, menginstal dependensi via `pnpm install --frozen-lockfile --filter api...`, serta melakukan build bertahap pada paket `shared` lalu `api`.
3. **Tambah Persistent Volume mount `/data`**:
   - Pada kartu service API di dashboard Railway, klik **+ Add** > **Volume**.
   - Set **Mount Path** ke `/data`.
   - Ini memastikan file database SQLite (`/data/simplisleep.db`) beserta file WAL tetap persisten dan tidak hilang saat container restart atau redeploy.
4. **Variables dari `.env.production`**:
   - Buka tab **Variables** pada service API di Railway.
   - Masukkan seluruh variabel lingkungan production dari file `.env.production`:
     - `NODE_ENV=production`
     - `PORT=3100` (atau biarkan Railway menyuntikkan port otomatis)
     - `DB_PATH=/data/simplisleep.db`
     - `AUTO_SEED=true` (mengisi data demo otomatis saat database kosong)
     - `TRUST_PROXY=true` (mempercayai proxy IP di belakang Railway)
     - `JWT_SECRET=<secret acak 64 karakter>`
     - `WALLET_ENC_KEY=<secret acak 64 karakter>`
     - `ADMIN_TOKEN=<token rahasia admin>`
     - `WEB_ORIGIN=https://simplisleep.netlify.app`
     - `ENABLE_DEMO_LOGIN=true`
     - Variabel Google Auth & Sepolia jika sudah disiapkan.
5. **Generate Domain**:
   - Buka tab **Settings** > bagian **Networking** > klik **Generate Domain** (misal: `simplisleep-api-production.up.railway.app`).
   - Railway akan otomatis memantau health check deployment melalui path `/api/health` yang didefinisikan di `railway.json`.
6. **Hubungkan ke Frontend Netlify (`netlify.toml`)**:
   - Setelah domain Railway aktif dan mengembalikan respons `ok` di `/api/health`, buka file `netlify.toml` di frontend.
   - Perbarui target URL redirect API dengan domain Railway yang baru dibuat:
     ```toml
     [[redirects]]
       from = "/api/*"
       to = "https://simplisleep-api-production.up.railway.app/api/:splat"
       status = 200
       force = true
     ```

### 5. Panduan Deployment API ke VPS (Production yang Digunakan)
Arsitektur API live SimpliSleep saat ini berjalan di **VPS Ubuntu** menggunakan proses manager **PM2**, reverse proxy **Nginx**, dan sertifikat SSL **Certbot** via branch mandiri **`deploy-api`**:

1. **Build Bundle Mandiri Secara Lokal & Push ke Branch `deploy-api`**:
   Untuk efisiensi memori (VPS RAM 1GB), API dibuild menjadi satu file executable ESM (`index.mjs`, ~2.4 MB) sehingga VPS tidak membutuhkan instalasi dependensi `node_modules` atau `pnpm`:
   ```bash
   # Build bundle mandiri lokal (mengompilasi shared, bundle api via esbuild, salin aset runtime)
   pnpm bundle:api

   # Hasil bundle berada di direktori deploy/api/ dan dipush ke branch khusus: deploy-api
   ```

2. **Clone Branch `deploy-api` di VPS**:
   ```bash
   git clone -b deploy-api https://github.com/WeissCurry/simplisleep.git simplisleep-api
   cd simplisleep-api
   ```

3. **Konfigurasi Environment `.env`**:
   Buat file `.env` di direktori `simplisleep-api` (jangan pernah commit file ini ke repositori):
   ```bash
   NODE_ENV=production
   PORT=3100
   DB_PATH=/var/data/simplisleep.db
   AUTO_SEED=true
   TRUST_PROXY=true
   WEB_ORIGIN=https://simplisleep.netlify.app
   ENABLE_DEMO_LOGIN=true
   # Sertakan JWT_SECRET, WALLET_ENC_KEY, ADMIN_TOKEN, Google Auth, dan konfigurasi Sepolia
   ```

4. **Jalankan API dengan PM2 (`--experimental-sqlite`)**:
   Server dijalankan menggunakan PM2 melalui konfigurasi `ecosystem.config.cjs`:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```
   *Catatan*: File `ecosystem.config.cjs` menyertakan argumen:
   `node_args: '--env-file=.env --experimental-sqlite --max-old-space-size=128'`. Flag `--experimental-sqlite` krusial untuk mengaktifkan modul native `node:sqlite` pada Node.js 22.12 / 22.x LTS.

5. **Konfigurasi Reverse Proxy Nginx**:
   Buat konfigurasi virtual host Nginx (misal `/etc/nginx/sites-available/api-simplisleep.skyshareacademy.id`):
   ```nginx
   server {
       server_name api-simplisleep.skyshareacademy.id;

       location / {
           proxy_pass http://127.0.0.1:3100;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Aktifkan konfigurasi dan reload service Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/api-simplisleep.skyshareacademy.id /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

6. **Amankan dengan HTTPS via Certbot**:
   Pasang dan aktifkan sertifikat SSL/TLS gratis Let's Encrypt secara otomatis:
   ```bash
   sudo certbot --nginx -d api-simplisleep.skyshareacademy.id
   ```

7. **Verifikasi Deployment Live**:
   ```bash
   curl -s https://api-simplisleep.skyshareacademy.id/api/health
   # Respons yang diharapkan:
   # {"status":"ok","service":"simplisleep-api","time":"...","sqlite":true}
   ```

---

## Smart Contract Sepolia

Kontrak pintar SimpliSleep ditulis dalam Solidity 0.8.28 dan diuji menggunakan Hardhat dan viem:

- **`SleepCards.sol`**: Implementasi ERC-721 Soulbound (ERC-5192) yang mengunci token secara permanen ke wallet penerima (non-transferable).
- **`LeaderboardCommit.sol`**: Kontrak pencatat komitmen hash klasemen mingguan (`commitLeaderboard(string weekId, bytes32 hash)`) dengan proteksi anti-overwrite (satu komitmen per minggu).

Untuk langkah deployment lengkap ke jaringan Sepolia, penyediaan gas ETH faucet, dan konfigurasi relayer, silakan baca dokumentasi terpisah di [docs/DEPLOY_SEPOLIA.md](docs/DEPLOY_SEPOLIA.md).

---

## Transparansi & Bukti On-Chain

SimpliSleep menerapkan sistem pembuktian integritas klasemen tidur berbasis smart contract di Ethereum Sepolia. Bagian ini menjelaskan arsitektur kriptografis, prosedur verifikasi independen, serta jaminan privasi data pengguna.

### 1. Alasan Desain & UX Awam
Tantangan dan papan peringkat kantor sering kali rentan terhadap kecurigaan manipulasi data internal (misalnya pengubahan skor atau peringkat secara diam-diam). Untuk menjamin transparansi tanpa membebani pengguna dengan antarmuka Web3 yang rumit, SimpliSleep mengambil pendekatan berikut:
- **UX Terintegrasi**: Halaman teknis terpisah dihapus agar pengguna tidak terdistraksi terminologi rumit. Status komitmen blockchain ditampilkan langsung sebagai badge informatif di dekat periode minggu Leaderboard (`Terverifikasi on-chain` atau `Menunggu commit`).
- **Verifikasi Satu Klik**: Pengguna dapat menekan badge untuk membuka modal penjelasan dan menjalankan verifikasi matematis langsung di peramban (client-side) tanpa perlu memasang wallet ekstensi.
- **Audit Tanpa Kepercayaan Pihak Ketiga (Trustless)**: Setiap orang dapat membuktikan bahwa peringkat mingguan yang diumumkan sama persis dengan yang dikunci di blockchain saat periode berakhir.

### 2. Cara Kerja Hash Keccak-256 Leaderboard JSON
Setiap penutupan minggu (Minggu pukul 23:59 WIB), server mengambil snapshot klasemen akhir dan membuat sidik jari digital unik (hash) menggunakan algoritma **Keccak-256**:
1. **Seleksi Field Publik Minimum**: Setiap baris klasemen dinormalisasi hanya memuat 3 properti kanonikal:
   - `rank`: peringkat integer (`1, 2, 3, ...`)
   - `userId`: identitas pengguna (contoh: `"budi-santoso"`)
   - `avgScore`: nilai rata-rata skor tidur mingguan (contoh: `94.8`)
2. **Pengurutan Deterministik**: Baris selalu diurutkan secara menaik berdasarkan `rank` (`1, 2, 3...`) untuk menjamin urutan payload selalu identik:
   ```json
   [{"rank":1,"userId":"siti-rahma","avgScore":97.2},{"rank":2,"userId":"budi-santoso","avgScore":94.8},{"rank":3,"userId":"gilang-ramadhan","avgScore":88.5}]
   ```
3. **Serialisasi Bersih**: Payload diserialisasikan ke format JSON standar tanpa spasi atau indentasi (`JSON.stringify(normalizedRows)`).
4. **Kalkulasi Hash Keccak-256**: String JSON diubah ke byte UTF-8 dan di-hash menggunakan fungsi Keccak-256 standar EVM:
   $$\text{hash} = \text{keccak256}(\text{UTF8}(\text{JSON}))$$
Jika satu nilai saja dimanipulasi (misal skor diubah dari 94.8 menjadi 95.0), nilai hash yang dihasilkan akan berubah total secara kriptografis (*avalanche effect*).

### 3. Kontrak Smart Contract `LeaderboardCommit.sol`
Kontrak dideploy pada jaringan uji **Ethereum Sepolia**:
- **Fungsi Utama**:
  ```solidity
  function commitLeaderboard(string calldata weekId, bytes32 hash) external onlyOwner;
  ```
- **Prinsip Immutability**: Kontrak menggunakan pemetaan `mapping(string => bytes32) public commitments`. Jika minggu tersebut (`weekId`) sudah pernah memiliki rekaman komitmen, pemanggilan ulang akan ditolak oleh kontrak (`require(commitments[weekId] == bytes32(0))`).
- **Keamanan**: Hash yang sudah tersimpan di blok transaksi Sepolia bersifat permanen dan tidak dapat diedit atau dihapus oleh siapa pun.

### 4. Cara Verifikasi Manual Independen
Siapa saja dapat memverifikasi keabsahan data secara mandiri tanpa mempercayai server SimpliSleep:

#### Melalui Antarmuka SimpliSleep
1. Buka menu **Leaderboard**.
2. Pilih minggu yang sudah ditutup (misal `2026-W46`).
3. Klik badge **"Terverifikasi on-chain"**.
4. Tekan tombol **"Cek Sekarang"** pada modal. Aplikasi akan menghitung hash Keccak-256 dari tabel klasemen lokal dan mencocokkannya dengan hash on-chain.
5. Klik **"Lihat di Etherscan"** untuk memeriksa transaksi langsung di penjelajah blok Sepolia.

#### Verifikasi Mandiri via Script (Node.js / Terminal)
```bash
# 1. Unduh payload leaderboard mingguan
curl -s "http://localhost:3100/api/leaderboard?week=2026-W46" > leaderboard.json

# 2. Hitung hash Keccak-256 menggunakan Node.js dan viem
node -e '
const { keccak256, toBytes } = require("viem");
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("leaderboard.json"));
const rows = data.rows.map(r => ({ rank: r.rank, userId: r.userId, avgScore: r.avgScore }))
                      .sort((a,b) => a.rank - b.rank);
const canonicalJson = JSON.stringify(rows);
console.log("Canonical JSON:", canonicalJson);
console.log("Computed Keccak-256:", keccak256(toBytes(canonicalJson)));
'
```
Bandingkan hash keluaran terminal dengan rekaman hash pada smart contract Sepolia.

### 5. Privasi Terjaga: Data Mentah Tidak Pernah On-Chain
- **Off-Chain Penuh untuk Data Sensitif**: Jam mulai tidur (`started_at`), jam bangun tidur (`ended_at`), status sesi tidur terputus, serta riwayat per malam hanya disimpan di database internal SimpliSleep.
- **On-Chain Hanya Sidik Jari Skor**: Yang dikirim ke blockchain publik hanyalah hash 32-byte dari klasemen agregat. Tidak ada data jam tidur individual atau informasi pribadi yang dapat didekripsi dari hash tersebut.
- **Bukan Sistem Evaluasi HR**: Aplikasi ini tidak terhubung ke evaluasi kinerja, kalender kerja, Slack, atau email perusahaan, sehingga batas privasi Simplimates tetap terlindungi.

---

## Batasan yang Diketahui (Known Limitations)

1. **Storage SQLite Single-Process**: Backend menggunakan modul native `node:sqlite` lokal. SQLite terbatas pada satu file volume fisik dan penulisan proses tunggal (single writer). Jika skala traffic membutuhkan ekspansi horizontal (multi-instance server), database perlu dimigrasikan ke PostgreSQL.
2. **Browser Notification Memerlukan HTTPS**: Notifikasi native peramban pada fitur pengingat tidur membutuhkan konteks aman (HTTPS) atau localhost. Pada koneksi HTTP biasa di production, notifikasi sistem OS akan diblokir oleh browser.
3. **Dispatch Email Notifikasi Masih Stub**: Fungsi dispatch pengingat tidur (`notifyReminder`) di `apps/api/src/services/reminder.ts` saat ini baru mencatat log konsol dan in-app notification; koneksi SMTP/provider email (misal Resend) disiapkan sebagai ekstensi lanjutan.
4. **Custodial Wallet Management**: Private key pengguna dikelola secara terpusat oleh server menggunakan enkripsi AES-256-GCM. Pengguna tidak memegang private key mereka sendiri secara langsung.
5. **Fallback Pending Tanpa Antrean Worker Otomatis**: Jika transaksi RPC Sepolia mengalami timeout atau kehabisan gas, kartu disimpan dengan status `pending-mint`. Belum tersedia background queue worker terjadwal untuk melakukan retry otomatis terhadap transaksi berstatus pending tersebut.
6. **Masa Berlaku Token JWT**: Token otentikasi JWT memiliki masa aktif 7 hari tanpa tabel blacklist/revocation di database.

---

## Dokumentasi Terkait

- [docs/DEPLOY_SEPOLIA.md](docs/DEPLOY_SEPOLIA.md) — Panduan teknis deployment smart contract ke Ethereum Sepolia Testnet.
