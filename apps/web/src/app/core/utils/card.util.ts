/**
 * Utilitas untuk URL aset kartu Simply is Sleeping dan fallback placeholder pixel.
 */

/**
 * Daftar seluruh 28 ID kartu yang memiliki aset gambar dan siluet di assets/cards/web/ dan web/silhouette/
 * Seluruh 28 kartu hewan tidur kini telah memiliki aset ilustrasi warna penuh & siluet transparan.
 */
export const AVAILABLE_CARD_IMAGE_IDS = new Set<string>([
  'orange-cat',
  'sloth',
  'corgi',
  'hamster',
  'white-rabbit',
  'hedgehog',
  'yellow-duck',
  'capybara',
  'red-panda',
  'otter',
  'mini-pig',
  'chick',
  'panda',
  'koala',
  'red-fox',
  'polar-bear',
  'penguin',
  'raccoon',
  'squirrel',
  'witch-cat',
  'owl',
  'blue-whale',
  'bat',
  'octopus',
  'white-deer',
  't-rex',
  'dragon',
  'phoenix'
]);

/**
 * Memeriksa apakah kartu memiliki aset gambar & siluet lokal
 */
export function hasCardImage(id: string): boolean {
  if (!id) return false;
  const cleanId = id.trim().replace(/^silhouette\//, '').replace(/\.(webp|png|jpg)$/, '');
  return AVAILABLE_CARD_IMAGE_IDS.has(cleanId);
}

/**
 * Kembalikan path URL publik aset kartu asli
 * Menggunakan /card-art/ agar tidak bentrok dengan SPA route /cards
 * @param id Atau nama file kartu (misal: 'sloth', 'orange-cat', 'sloth.png')
 */
export function cardImageUrl(id: string): string {
  if (!id) return '';
  const trimmed = id.trim();

  // Jika sudah memiliki ekstensi file
  if (trimmed.endsWith('.webp')) {
    return `/card-art/${trimmed}`;
  }

  // Jika berakhiran .png atau .jpg, ganti ke .webp karena folder card-art hanya berisi .webp
  if (trimmed.endsWith('.png') || trimmed.endsWith('.jpg')) {
    const withoutExt = trimmed.replace(/\.(png|jpg)$/, '');
    return `/card-art/${withoutExt}.webp`;
  }

  // Default ekstensi untuk kartu web adalah .webp
  return `/card-art/${trimmed}.webp`;
}

/**
 * Kembalikan path URL publik aset siluet kartu (latar transparan)
 * Tersaji di /card-art/silhouette/<id>.webp
 * HANYA mengembalikan path jika kartu memiliki aset gambar/siluet asli di AVAILABLE_CARD_IMAGE_IDS
 * @param id Atau nama file kartu (misal: 'sloth', 'orange-cat')
 */
export function cardSilhouetteUrl(id: string): string {
  if (!id) return '';
  const trimmed = id.trim();

  // Bersihkan jika ada path silhouette/ atau ekstensi
  const cleanId = trimmed.replace(/^silhouette\//, '').replace(/\.(webp|png|jpg)$/, '');

  if (!hasCardImage(cleanId)) {
    return '';
  }

  return `/card-art/silhouette/${cleanId}.webp`;
}

/**
 * Generate data URI SVG placeholder bergaya pixel art saat gambar asli belum ada
 */
export function getCardFallbackSvg(name = 'Kartu Tidur', rarity = 'Common'): string {
  let borderColor = '#64748B';
  let badgeColor = '#94A3B8';

  if (rarity === 'Legendary') {
    borderColor = '#B45309';
    badgeColor = '#F59E0B';
  } else if (rarity === 'Epic') {
    borderColor = '#7E22CE';
    badgeColor = '#9333EA';
  } else if (rarity === 'Rare') {
    borderColor = '#1D4ED8';
    badgeColor = '#3B82F6';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" fill="#140F2D" />
    <rect x="8" y="8" width="184" height="184" fill="#1D153D" stroke="${borderColor}" stroke-width="4" rx="4" />
    <circle cx="100" cy="90" r="45" fill="#2C225D" stroke="${borderColor}" stroke-width="2" />
    <!-- Pixel Sleepy Animal Face -->
    <rect x="75" y="80" width="16" height="5" fill="#F9A23B" rx="2" />
    <rect x="109" y="80" width="16" height="5" fill="#F9A23B" rx="2" />
    <rect x="80" y="82" width="6" height="2" fill="#140F2D" />
    <rect x="114" y="82" width="6" height="2" fill="#140F2D" />
    <circle cx="100" cy="96" r="4" fill="#E5334B" />
    <!-- Zzz -->
    <text x="135" y="65" font-family="'Pixelify Sans', monospace" font-size="16" fill="#F9A23B" font-weight="bold">z</text>
    <text x="145" y="52" font-family="'Pixelify Sans', monospace" font-size="19" fill="#F9A23B" font-weight="bold">Z</text>
    <!-- Card Label -->
    <rect x="25" y="148" width="150" height="26" fill="${badgeColor}" rx="2" />
    <text x="100" y="165" font-family="'Pixelify Sans', monospace" font-size="11" fill="#FFFFFF" font-weight="bold" text-anchor="middle">${name}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generate data URI SVG placeholder bergaya pixel art saat aset siluet kartu belum ada
 */
export function getSilhouetteFallbackSvg(rarity = 'Common'): string {
  let borderColor = '#141414';
  let bgColor = '#FFF1F4';
  let badgeColor = '#FFC2CF';

  if (rarity === 'Legendary') {
    bgColor = '#FFFBEB';
    badgeColor = '#FDE68A';
  } else if (rarity === 'Epic') {
    bgColor = '#FAF5FF';
    badgeColor = '#E9D5FF';
  } else if (rarity === 'Rare') {
    bgColor = '#EFF6FF';
    badgeColor = '#BFDBFE';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" fill="${bgColor}" />
    <!-- Pixel question mark box -->
    <rect x="70" y="55" width="60" height="60" fill="#FFFFFF" stroke="${borderColor}" stroke-width="4" rx="8" />
    <text x="100" y="99" font-family="'Pixelify Sans', monospace" font-size="40" fill="${borderColor}" font-weight="bold" text-anchor="middle">?</text>
    <!-- Label -->
    <rect x="35" y="136" width="130" height="24" fill="${badgeColor}" stroke="${borderColor}" stroke-width="2" rx="4" />
    <text x="100" y="152" font-family="'Pixelify Sans', monospace" font-size="10" fill="${borderColor}" font-weight="bold" text-anchor="middle">BELUM TERBUKA</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Event handler onerror untuk tag <img (error)="onCardImageError($event, card.name, card.rarity)">
 */
export function onCardImageError(event: Event, name = 'Kartu Tidur', rarity = 'Common'): void {
  const target = event.target as HTMLImageElement | null;
  if (target) {
    target.src = getCardFallbackSvg(name, rarity);
    target.onerror = null; // Cegah infinite loop
  }
}

/**
 * Event handler onerror untuk siluet kartu <img (error)="onSilhouetteImageError($event, card.rarity)">
 */
export function onSilhouetteImageError(event: Event, rarity = 'Common'): void {
  const target = event.target as HTMLImageElement | null;
  if (target) {
    target.src = getSilhouetteFallbackSvg(rarity);
    target.onerror = null; // Cegah infinite loop
  }
}
