# Panduan Desain & UI Kit SimpliSleep (`apps/web/DESIGN.md`)

Dokumen ini adalah spesifikasi desain resmi untuk seluruh agent yang mengerjakan modul di `apps/web`.

---

## 1. Filosofi Desain & Anti-AI-Slop

- **Aesthetic**: *Wizardshock Light Edition (Tactile Modern)* dengan identitas warna korporat SimpliDOTS.
  - Memadukan gaya situs retro pixel NFT ([wizardshock.xyz](https://www.wizardshock.xyz)) dengan versi **terang** (*light mode*): merah-pink SimpliDOTS (`#EC385B`), tinta hitam pekat (`#141414`), kanvas krem hangat (`#FFFBF8`), dan aksen matahari (`#FFC93C`).
- **Skala Radius "Agak Rounded" (Tactile Softened)**:
  - **Tombol**: `8px` (`.btn-pixel`, varian `sm` `6px`).
  - **Panel & Kartu**: `12px` (`.panel-pixel`, `.pixel-card`, `.pixel-card-night`).
  - **Badge**: `6px` (`.pixel-badge`, `app-rarity-badge`).
  - **Gambar & Avatar**: `8px` (`.pixelated`, `app-avatar`, wordmark icon).
  - Offset tebal taktil menggunakan `box-shadow: 6px 6px 0px var(--color-ink)` yang secara konsisten dan rapi mengikuti kelengkungan *border-radius*.
  - Hover naik (*translateY(-3px)* dengan shadow bertambah), active klik turun (*translateY(2px)*).
- **Anti-AI-Slop**:
  - ❌ Tidak ada gradien ungu/indigo generik (`from-purple to-indigo`).
  - ❌ Tidak ada font Inter/Geist untuk display.
  - ❌ Tidak ada glassmorphism blur atau neon glow kabur.
  - ❌ Tidak ada sudut membulat `rounded-2xl` seragam ala template SaaS.
  - ❌ Tidak ada animasi tanpa dukungan `prefers-reduced-motion`.
  - ✅ Warna solid dengan hierarki kontras tinggi (WCAG AA 4.5:1 untuk teks normal, 3:1 untuk teks besar/UI).
  - ✅ Gambar pixel art selalu menggunakan utility `.pixelated` (`image-rendering: pixelated; border-radius: 8px;`).

---

## 2. Struktur Navigasi & Shell Navbar

Sesuai arahan revisi user prioritas tertinggi:

1. **Wordmark / Logo Selalu di TENGAH**:
   - Di desktop maupun mobile, ikon dan wordmark SimpliSleep selalu berada tepat di tengah (*center aligned*).
2. **Desktop (> 884px, optimal pada 1024px – 1440px+)**:
   - **Kiri**: Menu terbagi 3 link ("🌙 Malam Ini", "🏆 Leaderboard", "👀 Masih Melek").
   - **Tengah**: Wordmark SimpliSleep dengan titik merah khas SimpliDOTS.
   - **Kanan**: Menu terbagi 3 link ("🃏 Kartu", "⛓️ Transparansi", "💡 Tentang") + tombol akun demo/masuk *chunky*.
   - **Wajib SATU BARIS**: Seluruh label navigasi dan tombol memiliki aturan `white-space: nowrap;` sehingga tidak pernah terlipat menjadi 2 baris pada rentang layar 1024px hingga 1440px.
3. **Mobile & Tablet (<= 884px, rapi hingga 344px Galaxy Fold)**:
   - **Tanpa Hamburger / Drawer**: Navigasi utama mobile murni menggunakan Tab Bar Bawah.
   - **Kiri Header**: Balancer spacer (`w-9 shrink-0`) yang seimbang dengan tombol avatar kanan agar logo tetap tepat di tengah.
   - **Tengah Header**: Wordmark SimpliSleep resmi selalu tepat di tengah viewport, satu baris tanpa terpotong.
   - **Kanan Header**: Tombol akun demo ringkas (`w-9 h-9 min-w-[44px] min-h-[44px]`, avatar tanpa teks/streak, shadow 2px, `aria-haspopup="true"`, `aria-expanded`).
   - **Mobile Account Menu (Popover / Bottom Sheet)**:
     - Dibuka saat avatar kanan ditekan. Menampilkan info user (avatar, nama, streak, tim), tombol 'Ganti Akun Demo', dan tombol 'Keluar'.
     - Transisi halus CSS (~0.2s ease-out saat buka, ~0.18s ease-in saat tutup), elemen DOM baru dilepas (unmounted) setelah animasi tutup selesai.
     - Tutup via tombol `✕`, tombol `Escape`, klik backdrop overlay, atau saat berpindah rute. Fokus otomatis dikembalikan ke tombol avatar saat ditutup.
   - **Mobile Bottom Navigation Bar (5 Item Utama)**:
     - Berisi 5 rute: `🌙 Malam` (`/`), `🏆 Klasemen` (`/leaderboard`), `👀 Melek` (`/awake`), `🃏 Kartu` (`/cards`), `💡 Tentang` (`/about`).
     - **Sliding Active Indicator**: Indikator latar aktif bergeser halus antar tab via `transform: translateX` (CSS transition ~0.25s), ikon tab aktif sedikit naik (`translateY(-2px)`), teks satu baris (*nowrap*), dan `aria-current="page"`.
     - **Kondisional**: Tidak tampil pada halaman landing `/login` atau saat user belum terautentikasi.
     - **Ergonomi**: Target sentuh $\ge 44\text{px}$ (`min-h-[44px]`), padding aman `safe-area-inset-bottom`, dan padding bawah pada `<main>` (`pb-24`) agar konten tidak tertutup.
     - **Reduced Motion**: Pada `prefers-reduced-motion: reduce`, seluruh animasi dinonaktifkan (`transition: none !important`), perpindahan dan penutupan terjadi seketika tanpa jeda.
4. **Transisi Halaman GSAP & Scroll Restoration**:
   - Animasi masuk halaman saat navigasi route (subtle fade + translateY 12px, 0.35s, power2.out via GSAP) pada outlet wrapper shell.
   - Navigasi awal (*first load*) dilewati tanpa animasi agar tidak menunda LCP (*Largest Contentful Paint*).
   - Otomatis dinonaktifkan pada `prefers-reduced-motion: reduce`.
   - Scroll otomatis kembali ke atas (`top`) setiap berpindah halaman via `withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })`.

---

## 3. Token Warna Final (Tailwind CSS v4 `@theme`)

Semua token didefinisikan di `src/styles.css` dan dapat dipakai langsung sebagai utility Tailwind (`bg-brand`, `text-ink`, `border-brand-ink`, dll.):

| Token Tailwind | Nilai Hex | Penggunaan Utama | Kontras WCAG |
|---|---|---|---|
| `--color-brand` | `#EC385B` | Aksen brand SimpliDOTS, dekorasi, teks besar ≥24px | — |
| `--color-brand-strong` | `#D42A4C` | Background tombol primer dengan teks putih | 4.96:1 (Pass AA) |
| `--color-brand-ink` | `#C21F42` | Teks merah/brand di atas latar terang, fokus terlihat | 5.70:1 (Pass AA) |
| `--color-brand-deep` | `#8E1631` | Siluet layer terdepan hero, background footer | Teks putih 8.2:1 |
| `--color-brand-50` | `#FFF1F4` | Latar selang-seling, badge, langit hero layer 0 | Latar terang |
| `--color-brand-100` | `#FFE0E7` | Latar card hover / active, hero layer 1 | Latar lembut |
| `--color-brand-200` | `#FFC2CF` | Border lembut, hero layer 1 | Latar lembut |
| `--color-brand-300` | `#F58FA3` | Siluet kota midground hero layer 2 | Midground |
| `--color-ink` | `#141414` | Teks utama, border utama, offset tombol/kartu | 16.5:1 (Pass AAA) |
| `--color-ink-muted` | `#5C5C5C` | Teks sekunder, label pembantu, keterangan | 4.8:1 (Pass AA) |
| `--color-paper` | `#FFFBF8` | Latar belakang seluruh halaman (*canvas body*) | Latar dasar |
| `--color-surface` | `#FFFFFF` | Latar belakang panel, modal, dan kartu putih | Surface dasar |
| `--color-sun` | `#FFC93C` | Aksen hangat, jendela menyala, streak, Legendary | — |
| `--color-success` | `#1F8A4C` | Status sukses, sesi tidur berjalan baik | Pass AA |
| `--color-warning` | `#B45309` | Peringatan, streak rawan putus | Pass AA |
| `--color-danger` | `#C21F42` | Sesi broken, tombol aksi destruktif | Pass AA |

### Rarity Tokens:
- `--color-rarity-common`: `#5C5C5C` (Common - abu-abu/slate)
- `--color-rarity-rare`: `#2563EB` (Rare - biru cerah)
- `--color-rarity-epic`: `#9333EA` (Epic - ungu magis)
- `--color-rarity-legendary`: `#B45309` (Legendary - emas tembaga) dipadukan aksen `--color-sun` (`#FFC93C`).

---

## 4. Tipografi

1. **Judul, Navigasi, Tombol, Wordmark, Paragraf Cerita Lead**:
   - `Pixelify Sans` / `Silkscreen`
   - Kelas Tailwind: `font-pixel`
   - Karakteristik: Taktil, retro 16-bit, tegas, spasi huruf lega (`letter-spacing: 0.03em`).
2. **Body Text, Data Tabel, Form**:
   - `Plus Jakarta Sans`
   - Kelas Tailwind: `font-sans` (default body)
3. **Hash Komitmen Kriptografi & Data Teknis**:
   - Monospace
   - Kelas Tailwind: `font-mono`

---

## 5. Utilitas Global Bersama

Dibuat di `src/styles.css` dan dapat digunakan di semua template:

- `.btn-pixel`: Tombol chunky primer (`bg-brand-strong text-white border-2 border-ink rounded-[8px] shadow-[6px_6px_0_#141414] whitespace-nowrap`).
- `.btn-pixel--ghost`: Varian sekunder (`bg-surface text-ink border-2 border-ink rounded-[8px] shadow-[6px_6px_0_#141414]`).
- `.btn-pixel--sun`: Varian aksen hangat (`bg-sun text-ink border-2 border-ink rounded-[8px] shadow-[6px_6px_0_#141414]`).
- `.btn-pixel--sm`: Ukuran kompak (`padding: 8px 14px 7px`, `rounded-[6px]`, shadow 4px).
- `.panel-pixel`: Panel kotak retro (`bg-surface border-3 border-ink rounded-[12px] shadow-[6px_6px_0_#141414] overflow-hidden`).
- `.section-wrap`: Container standar (`max-width: 1200px; margin-inline: auto; padding-inline: 4vw;`).
- `.lead-pixel`: Paragraf cerita pembuka besar (`font-pixel 1.5em desktop / 1.25em mobile; line-height: 1.35`).
- `.pixelated`: Menjaga rendering gambar pixel tetap tajam tanpa interpolasi blur (`image-rendering: pixelated; crisp-edges; border-radius: 8px;`).

---

## 6. Komponen Hero Parallax (`<app-parallax-hero>`)

Selector: `<app-parallax-hero>`  
Lokasi: `src/app/shared/components/parallax-hero/parallax-hero.component.ts`

### Fitur & Kontrak:
- **Input**: `height: string` (default: `'88svh'`, minimum `'480px'`).
- **Konten Ditengah**: `<ng-content>` diproyeksikan di tengah layar (wordmark besar, judul cerita lead, satu CTA chunky utama).
- **Ilustrasi SVG Pixel 4 Layer**:
  - **Layer 0**: Langit senja `brand-50` (`#FFF1F4`) dengan matahari/bulan pixel `sun` (`#FFC93C`) dan awan pixel berhuruf "Zzz".
  - **Layer 1**: Bukit & siluet menara jauh (`brand-100` / `brand-200`).
  - **Layer 2**: Kompleks kantor SimpliDOTS & rumah midground (`brand-300`).
  - **Layer 3**: Siluet kota terdepan (`brand-deep` `#8E1631`) dengan jendela-jendela kecil menyala warna `sun` (`#FFC93C`) dan jendela padam (`#5C0D1E`) yang melambangkan Simplimates sedang tidur nyenyak.
  - **Layer 4 (Transisi Seamless)**: Pantulan air kota yang di-mirror vertikal (`scaleY(-1)`) dengan gradient mask yang memudar ke transparan, riak air pixel horizontal, dan awan-awan pixel bertangga di dasar hero yang menyatu mulus ke `ambient-bg`. Garis pemisah hitam tebal di bawah hero dihilangkan secara total sehingga transisi ke konten bawah mengalir alami tanpa tepi keras.
- **Efek Scroll Parallax GSAP**:
  - Terintegrasi dengan `ScrollTrigger`.
  - Layer latar belakang bergerak lambat, siluet terdepan stabil, pantulan air mengikuti parallax kota, konten logo/CTA bergerak naik ke atas (`yPercent: -35`) dan memudar lembut saat di-scroll.
  - **A11y**: Otomatis dinonaktifkan saat user menyalakan `prefers-reduced-motion: reduce`.
  - **Cleanup**: Otomatis membersihkan tween dan ScrollTrigger pada `ngOnDestroy`.

---

## 7. Shared Components UI Kit

### a. `PixelButtonComponent` (`<app-pixel-button>`)
```html
<app-pixel-button
  variant="primary"  <!-- 'primary' | 'orange' | 'secondary' | 'danger' | 'ghost' | 'night' | 'white' -->
  size="md"          <!-- 'sm' | 'md' | 'lg' | 'xl' -->
  [fullWidth]="false"
  [disabled]="false"
  (clicked)="onAction()"
>
  MULAI TIDUR
</app-pixel-button>
```

### b. `PixelPanelComponent` (`<app-pixel-panel>`)
```html
<app-pixel-panel
  title="Koleksi Kartu"
  subtitle="Daftar NFT soulbound kamu"
  icon="🃏"
  variant="default"  <!-- 'default' | 'night' | 'lavender' | 'orange' | 'purple' -->
  badge="28 Slot"
  badgeVariant="purple"
>
  <p>Isi konten di sini...</p>
</app-pixel-panel>
```

### c. `WordmarkComponent` (`<app-wordmark>`)
Wordmark resmi 'SimpliSleep':
Ikon resmi SimpliDOTS (vektor halus non-pixelated dari `/brand/simplidots-icon.png`, sudut membulat transparan) + tulisan pixelated tebal bergaya hero (`font-pixel font-black uppercase tracking-tight`): `Simpli` dalam warna `text-ink` + `Sleep` dalam warna `text-brand` + titik merah ala SimpliDOTS (`bg-brand rounded-full border border-ink`). Selalu satu baris (*single line*).
```html
<app-wordmark [showTagline]="false" size="md"></app-wordmark>
```

### d. `RarityBadgeComponent` (`<app-rarity-badge>`)
Badge berbingkai tajam dengan radius 6px dan bayangan solid 2px:
```html
<app-rarity-badge rarity="Legendary" size="md" [showIcon]="true"></app-rarity-badge>
```

### e. `AvatarComponent` (`<app-avatar>`)
Avatar pixel dengan bingkai border hitam 2px, radius 8px (atau full bila rounded=true), shadow hard, dan indikator tidur/melek (radius 6px):
```html
<app-avatar
  [name]="'Budi Santoso'"
  [avatar]="'user-1'"
  size="md"              <!-- 'xs' | 'sm' | 'md' | 'lg' | 'xl' -->
  status="sleeping"      <!-- 'sleeping' | 'awake' | 'none' -->
></app-avatar>
```

### f. `PixelLoadingComponent`, `PixelEmptyComponent`, `PixelErrorComponent`
Komponen state standar dengan gaya retro chunky agak rounded (radius 12px) dan pesan berbahasa Indonesia akrab.

### g. `AmbientBgComponent` (`<app-ambient-bg>`)
Komponen background dinamis beranimasi fixed full-viewport di belakang seluruh konten aplikasi:
- **Gradasi Lembut**: Transisi halus dari `paper` (`#FFFBF8`) ke `brand-50` (`#FFF1F4`) dan `brand-100` (`#FFE0E7`) di dasar.
- **Pixel Clouds**: Awan stepped pixel melayang perlahan secara horizontal dengan variasi durasi 56s–88s (beberapa membawa teks `Zzz`).
- **Deterministic Pixel Stars**: 18 bintang/titik pixel (`#FFC93C`, `#FFC2CF`, `#FFE0E7`) berkedip lembut dengan delay tetap (SSR-safe tanpa mismatch).
- **Pixel City Horizon**: Siluet kota pixel rendah di dasar viewport (max 18vh) dengan jendela-jendela kecil menyala warna `sun`, ter-offset di atas tab bar mobile pada `<md`.
- **Smooth Parallax Scroll**: Bergerak perlahan saat scroll menggunakan passive listener & `requestAnimationFrame` (GPU accelerated).
- **A11y**: Otomatis menonaktifkan seluruh animasi dan parallax jika `prefers-reduced-motion: reduce` aktif.
```html
<app-ambient-bg></app-ambient-bg>
```

### h. `ParallaxHeroComponent` (`<app-parallax-hero>`)
Hero visual retro multi-layer responsif dengan transisi seamless menyatu ke ambient background:
- **Layer 0 (Sky & Sun)**: Langit luas gradasi memudar ke transparan di dasar ($y=600$), matahari pixel di pojok kanan atas ($x=980, y=28$).
- **Layer 1 (Distant Hills & Tower)**: Siluet bukit dan menara radio pixel jauh warna `brand-100`/`brand-200` ($y \ge 380$).
- **Layer 2 (Midground City)**: Siluet kota kantor & perumahan warna `brand-300` ($y \ge 435$).
- **Layer 3 (Foreground City & Tower)**: Siluet kota terdepan warna `brand-deep` ($y \ge 455$) berpijak kokoh pada baris dasar tanah/dermaga penuh selebar viewport ($y=535-543$).
- **Layer 4 (Water Reflection & Seam Transition)**:
  - Pantulan vertikal kota (`scaleY(-1)` dari garis dasar air $y=543$) memudar halus ke transparan penuh dengan SVG linear gradient mask (tinggi pantulan ~50px atau 50% tinggi gedung) langsung menyambung dari dasar kota tanpa jeda.
  - Tepat 2 riak air tipis horizontal (`#FFE0E7`, opacity 0.25–0.3) tanpa efek scanline glitchy.
  - Awan pixel bertangga di area pudar dasar hero ($y=540-575$) yang berpadu alami dengan `ambient-bg`.
  - Wadah hero menggunakan bottom mask gradient sehingga tidak ada tepi keras horizontal atau border pemotong.
- **GSAP Scroll Parallax**: Parallax multi-kecepatan saat scroll dengan ScrollTrigger dan fallback reduced-motion.
```html
<app-parallax-hero
  [title]="'SIMPLI SLEEP'"
  [tagline]="'Ubah Tidur Berkualitas Jadi Kartu Koleksi Berharga.'"
  [showStats]="true"
></app-parallax-hero>
```

---

## 8. Responsivitas, Performa & Aksesibilitas (WCAG AA)

- **Mobile Viewport**: Wajib tampil rapi di **344px** (Galaxy Fold tertutup), tanpa ada horizontal scroll halaman.
- **Target Sentuh**: Tombol dan link interaktif memiliki target sentuh minimal **44x44px** (`min-h-[44px]`).
- **Focus Indicator**: `:focus-visible` memiliki outline 3px warna `brand-ink` dengan offset 2px.
- **Color Contrast (WCAG AA)**: Span wordmark 'Sleep' kecil di navbar menggunakan `text-brand-ink` (`#C21F42`, kontras 5.7:1 di atas putih) agar lolos kontras minimum 4.5:1 untuk teks < 24px. Teks besar hero ($\ge 24\text{px}$) tetap menggunakan `text-brand` (`#EC385B`).
- **Modern Image Formats**: Aset ikon brand di `<app-wordmark>` disajikan dalam format WebP modern melalui `<picture>` (`simplidots-icon.webp` 1.5KB, `@2x.webp` 3.5KB) dengan fallback PNG teroptimasi dan dimensi eksplisit (`width`/`height`) untuk mencegah layout shift (CLS 0).
- **Lazy GSAP & Zero LCP Blocking**: `gsap` dan `ScrollTrigger` tidak diimpor statis di bundle utama melainkan dimuat dinamis setelah first paint (`requestIdleCallback` dengan fallback `setTimeout`) dan hanya bila bukan `prefers-reduced-motion`. Konten LCP (wordmark hero dan CTA) tampil langsung dengan `opacity: 1` sejak render pertama.
- **Reduced Motion**: Semua animasi GSAP di `AnimationService`, `App`, dan `ParallaxHeroComponent` mematuhi `prefers-reduced-motion: reduce`. Animasi ambient latar menggunakan CSS native.
