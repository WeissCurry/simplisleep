import { nightScore, getWeekId, type SessionStatus, type Rarity } from 'shared';
import { cardNumberFromSlug, CARD_SLUGS } from '../services/chain.js';

export interface SeedUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
  walletAddress: string;
  walletPrivateKeyEnc: string;
}

export interface SeedSleepSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  status: SessionStatus;
  score: number;
  date: string; // YYYY-MM-DD
  weekId: string;
}

export interface SeedUserCard {
  id: string;
  userId: string;
  cardId: string; // slug
  cardNumber: number; // 1-based index
  name: string;
  rarity: Rarity;
  tokenId?: string;
  txHash?: string;
  status: 'minted' | 'pending-mint';
  createdAt: string;
}

export interface SeedLeaderboardCommit {
  weekId: string;
  hash: string;
  txHash: string;
  chainId: number;
  committedAt: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    id: 'budi-santoso',
    name: 'Budi Santoso',
    avatar: '👨‍💻',
    role: 'Engineering Lead',
    email: 'budi.santoso@simplidots.example.com',
    walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    walletPrivateKeyEnc: 'enc:budi:custodial:privatekey:001'
  },
  {
    id: 'siti-rahma',
    name: 'Siti Rahma',
    avatar: '👩‍🔬',
    role: 'Senior QA Engineer',
    email: 'siti.rahma@simplidots.example.com',
    walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    walletPrivateKeyEnc: 'enc:siti:custodial:privatekey:002'
  },
  {
    id: 'adi-wijaya',
    name: 'Adi Wijaya',
    avatar: '🧑‍🎨',
    role: 'Product Designer',
    email: 'adi.wijaya@simplidots.example.com',
    walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    walletPrivateKeyEnc: 'enc:adi:custodial:privatekey:003'
  },
  {
    id: 'dewi-lestari',
    name: 'Dewi Lestari',
    avatar: '👩‍💼',
    role: 'Product Manager',
    email: 'dewi.lestari@simplidots.example.com',
    walletAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    walletPrivateKeyEnc: 'enc:dewi:custodial:privatekey:004'
  },
  {
    id: 'eko-prasetyo',
    name: 'Eko Prasetyo',
    avatar: '🧑‍💻',
    role: 'Backend Developer',
    email: 'eko.prasetyo@simplidots.example.com',
    walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    walletPrivateKeyEnc: 'enc:eko:custodial:privatekey:005'
  },
  {
    id: 'fitri-handayani',
    name: 'Fitri Handayani',
    avatar: '👩‍💻',
    role: 'Frontend Developer',
    email: 'fitri.handayani@simplidots.example.com',
    walletAddress: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    walletPrivateKeyEnc: 'enc:fitri:custodial:privatekey:006'
  },
  {
    id: 'gilang-ramadhan',
    name: 'Gilang Ramadhan',
    avatar: '🧑‍🚀',
    role: 'DevOps Engineer',
    email: 'gilang.ramadhan@simplidots.example.com',
    walletAddress: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    walletPrivateKeyEnc: 'enc:gilang:custodial:privatekey:007'
  },
  {
    id: 'hany-putri',
    name: 'Hany Putri',
    avatar: '👩‍🎤',
    role: 'Customer Success',
    email: 'hany.putri@simplidots.example.com',
    walletAddress: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    walletPrivateKeyEnc: 'enc:hany:custodial:privatekey:008'
  },
  {
    id: 'indra-kusuma',
    name: 'Indra Kusuma',
    avatar: '🧑‍🔧',
    role: 'Data Analyst',
    email: 'indra.kusuma@simplidots.example.com',
    walletAddress: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    walletPrivateKeyEnc: 'enc:indra:custodial:privatekey:009'
  },
  {
    id: 'joko-susilo',
    name: 'Joko Susilo',
    avatar: '🧑‍🏫',
    role: 'Business Development',
    email: 'joko.susilo@simplidots.example.com',
    walletAddress: '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
    walletPrivateKeyEnc: 'enc:joko:custodial:privatekey:010'
  },
  {
    id: 'kartika-sari',
    name: 'Kartika Sari',
    avatar: '👩‍⚕️',
    role: 'Technical Writer',
    email: 'kartika.sari@simplidots.example.com',
    walletAddress: '0x71bE63f330a740544E453808846166018E9B1A6B',
    walletPrivateKeyEnc: 'enc:kartika:custodial:privatekey:011'
  },
  {
    id: 'lukman-hakim',
    name: 'Lukman Hakim',
    avatar: '🧑‍🌾',
    role: 'Security Engineer',
    email: 'lukman.hakim@simplidots.example.com',
    walletAddress: '0xF296134d402da181057C021235123d4B40B51111',
    walletPrivateKeyEnc: 'enc:lukman:custodial:privatekey:012'
  }
];

// Definisi metadata kartu dengan Rarity
export const CARDS_METADATA: Record<string, { name: string; rarity: Rarity }> = {
  'orange-cat': { name: 'Kucing Oren', rarity: 'Common' },
  'sloth': { name: 'Kungkang Santai', rarity: 'Common' },
  'corgi': { name: 'Anjing Corgi', rarity: 'Common' },
  'hamster': { name: 'Hamster Kenyang', rarity: 'Common' },
  'white-rabbit': { name: 'Kelinci Putih', rarity: 'Common' },
  'hedgehog': { name: 'Landak Mini', rarity: 'Common' },
  'yellow-duck': { name: 'Bebek Kuning', rarity: 'Common' },
  'capybara': { name: 'Kapibara Tenang', rarity: 'Common' },
  'red-panda': { name: 'Panda Merah', rarity: 'Common' },
  'otter': { name: 'Berang-berang', rarity: 'Common' },
  'mini-pig': { name: 'Babi Mini', rarity: 'Common' },
  'chick': { name: 'Anak Ayam', rarity: 'Common' },
  'panda': { name: 'Panda Gemoy', rarity: 'Rare' },
  'koala': { name: 'Koala Peluk', rarity: 'Rare' },
  'red-fox': { name: 'Rubah Merah', rarity: 'Rare' },
  'polar-bear': { name: 'Beruang Salju', rarity: 'Rare' },
  'penguin': { name: 'Penguin Dingin', rarity: 'Rare' },
  'raccoon': { name: 'Musang Topeng', rarity: 'Rare' },
  'squirrel': { name: 'Tupai Bantal', rarity: 'Rare' },
  'witch-cat': { name: 'Kucing Sihir', rarity: 'Rare' },
  'owl': { name: 'Burung Hantu', rarity: 'Epic' },
  'blue-whale': { name: 'Paus Biru', rarity: 'Epic' },
  'bat': { name: 'Kelelawar Tidur', rarity: 'Epic' },
  'octopus': { name: 'Gurita Nyenyak', rarity: 'Epic' },
  'white-deer': { name: 'Rusa Putih Mistis', rarity: 'Epic' },
  't-rex': { name: 'T-Rex Si Manja', rarity: 'Legendary' },
  'dragon': { name: 'Naga Lelap Emas', rarity: 'Legendary' },
  'phoenix': { name: 'Burung Phoenix', rarity: 'Legendary' }
};

export const SEED_LEADERBOARD_COMMITS: SeedLeaderboardCommit[] = [
  {
    weekId: '2026-W45',
    hash: '0x94d72efbc489f168e4aec17e89b1a1ac610ed3888e598dd9921d143af3ae70d0',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    chainId: 11155111,
    committedAt: '2026-11-09T08:00:00.000Z'
  }
];

/**
 * Menghasilkan riwayat 3 minggu (21 malam) dari 2026-11-01 s/d 2026-11-21 untuk 12 user.
 * Menggunakan nightScore dari packages/shared.
 * Pola tidur dirancang realistis dan bervariasi sesuai persona (konsisten, begadang, membaik, kebanyakan tidur, dll.)
 * secara deterministik sehingga peringkat jelas tanpa seri banyak dan hash commit stabil.
 */
export function generateSeedSessions(): SeedSleepSession[] {
  const sessions: SeedSleepSession[] = [];
  const baseDate = new Date('2026-11-01T00:00:00Z');

  for (let day = 0; day < 21; day++) {
    const currentDate = new Date(baseDate);
    currentDate.setUTCDate(baseDate.getUTCDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0]!;
    const weekId = getWeekId(currentDate);

    for (const user of SEED_USERS) {
      let durationHours = 8.0;
      let diffMinutes = 35;
      let status: SessionStatus = 'completed';
      let startHour = 23.0;

      switch (user.id) {
        case 'siti-rahma': {
          // Juara Konsisten: durasi 7.5 - 8.1 jam, diff 30 - 45 menit.
          // Hanya 1 hari skor 100, sisanya 94-98. Rata-rata skor ~97
          const durations = [7.8, 8.1, 7.5, 8.0, 7.6, 7.9, 7.7];
          const diffs = [32, 42, 35, 30, 45, 38, 40];
          durationHours = durations[day % 7]!;
          diffMinutes = diffs[day % 7]!;
          startHour = 22.5;
          break;
        }

        case 'budi-santoso': {
          // Konsisten Sehat: durasi 7.3 - 7.9 jam, diff 38 - 54 menit. Rata-rata skor ~95
          const durations = [7.5, 7.8, 7.3, 7.9, 7.6, 7.4, 7.7];
          const diffs = [42, 48, 38, 54, 45, 52, 40];
          durationHours = durations[day % 7]!;
          diffMinutes = diffs[day % 7]!;
          startHour = 23.0;
          break;
        }

        case 'lukman-hakim': {
          // Waspada tapi Teratur: durasi 7.2 - 7.7 jam, diff 46 - 62 menit. Rata-rata skor ~92
          const durations = [7.4, 7.6, 7.2, 7.7, 7.3, 7.5, 7.4];
          const diffs = [50, 58, 46, 62, 54, 60, 48];
          durationHours = durations[day % 7]!;
          diffMinutes = diffs[day % 7]!;
          startHour = 22.75;
          break;
        }

        case 'dewi-lestari': {
          // Sibuk & Terkendali: durasi 6.9 - 7.5 jam, diff 52 - 72 menit. Rata-rata skor ~89
          const durations = [7.2, 6.9, 7.4, 7.0, 7.3, 7.1, 7.5];
          const diffs = [56, 68, 52, 72, 60, 66, 58];
          durationHours = durations[day % 7]!;
          diffMinutes = diffs[day % 7]!;
          startHour = 23.25;
          break;
        }

        case 'kartika-sari': {
          // Teratur Sedang: durasi 6.8 - 7.3 jam, diff 60 - 78 menit. Rata-rata skor ~86
          const durations = [7.0, 6.8, 7.2, 6.9, 7.3, 7.0, 7.1];
          const diffs = [64, 74, 60, 78, 68, 72, 62];
          durationHours = durations[day % 7]!;
          diffMinutes = diffs[day % 7]!;
          startHour = 23.5;
          break;
        }

        case 'hany-putri': {
          // Kadang Lembur: durasi 6.6 - 7.1 jam, diff 66 - 84 menit. Rata-rata skor ~81
          const durations = [6.8, 6.6, 7.1, 6.7, 7.0, 6.8, 6.9];
          const diffs = [70, 80, 66, 84, 74, 78, 72];
          durationHours = durations[day % 7]!;
          diffMinutes = diffs[day % 7]!;
          startHour = 0.0;
          break;
        }

        case 'joko-susilo': {
          // Kebanyakan Tidur di Weekend / Hari Libur (Minggu, day % 7 === 0)
          // Hari biasa 6.8 - 7.2 jam (diff 68-76m), weekend 10.4 jam (label Kebanyakan, diff 75m). Rata-rata ~80
          if (day % 7 === 0) {
            durationHours = 10.4;
            diffMinutes = 75;
          } else {
            const durations = [7.0, 6.8, 7.1, 6.9, 7.2, 7.0];
            const diffs = [70, 76, 68, 74, 72, 75];
            durationHours = durations[(day - 1) % 6]!;
            diffMinutes = diffs[(day - 1) % 6]!;
          }
          startHour = 23.0;
          break;
        }

        case 'adi-wijaya': {
          // Pola tidur goyah, sesi flagged di day 8 (< 2 jam). Rata-rata ~73
          if (day === 8) {
            status = 'flagged';
            durationHours = 1.5;
            diffMinutes = 150;
          } else {
            const durations = [6.6, 6.3, 6.8, 6.4, 6.7, 6.5, 6.6];
            const diffs = [75, 88, 72, 90, 80, 85, 78];
            durationHours = durations[day % 7]!;
            diffMinutes = diffs[day % 7]!;
          }
          startHour = 0.5;
          break;
        }

        case 'fitri-handayani': {
          // Sesi broken (buka app di tengah malam) di day 5 dan 15. Rata-rata ~67
          if (day === 5 || day === 15) {
            status = 'broken';
            durationHours = 5.0;
            diffMinutes = 120;
          } else {
            const durations = [6.7, 6.5, 6.9, 6.6, 6.8, 6.5, 6.7];
            const diffs = [65, 78, 68, 82, 72, 80, 70];
            durationHours = durations[day % 7]!;
            diffMinutes = diffs[day % 7]!;
          }
          startHour = 23.5;
          break;
        }

        case 'indra-kusuma': {
          // Begadang olah data: durasi 5.3 - 5.7 jam (Kurang), diff 80 - 98 menit. Rata-rata ~45
          const durations = [5.5, 5.3, 5.7, 5.4, 5.6, 5.3, 5.5];
          const diffs = [85, 95, 82, 98, 88, 92, 86];
          durationHours = durations[day % 7]!;
          diffMinutes = diffs[day % 7]!;
          startHour = 1.5;
          break;
        }

        case 'gilang-ramadhan': {
          // Persona: Paling Membaik
          // W44-W45 (day 0-7): on-call begadang, durasi 4.8 - 5.2 jam, diff 92 - 106 menit (skor ~30)
          // W46 (day 8-14): perbaikan jadwal shift, durasi 6.3 - 6.7 jam, diff 48 - 62 menit (skor ~71)
          // W47 (day 15-20): konsisten sehat, durasi 7.4 - 7.9 jam, diff 42 - 52 menit (skor ~94, Rank 3 di W47!)
          if (day < 8) {
            const durations = [5.0, 4.8, 5.2, 4.9, 5.1, 4.8, 5.0];
            const diffs = [96, 104, 92, 106, 98, 102, 95];
            durationHours = durations[day % 7]!;
            diffMinutes = diffs[day % 7]!;
            startHour = 2.0;
          } else if (day < 15) {
            const durations = [6.5, 6.3, 6.7, 6.4, 6.6, 6.4, 6.5];
            const diffs = [52, 60, 48, 62, 54, 58, 50];
            durationHours = durations[day % 7]!;
            diffMinutes = diffs[day % 7]!;
            startHour = 23.5;
          } else {
            const durations = [7.6, 7.8, 7.4, 7.9, 7.5, 7.7];
            const diffs = [44, 48, 42, 52, 46, 50];
            durationHours = durations[(day - 15) % 6]!;
            diffMinutes = diffs[(day - 15) % 6]!;
            startHour = 23.0;
          }
          break;
        }

        case 'eko-prasetyo': {
          // Hardcore night-owl begadang: durasi 4.3 - 4.6 jam, diff 105 - 118 menit. Rata-rata ~13
          const durations = [4.4, 4.3, 4.6, 4.4, 4.5, 4.3, 4.5];
          const diffs = [110, 116, 106, 118, 112, 115, 108];
          durationHours = durations[day % 7]!;
          diffMinutes = diffs[day % 7]!;
          startHour = 2.5;
          break;
        }
      }

      const scoreResult = nightScore(durationHours, diffMinutes);
      const calculatedScore = status === 'completed' ? scoreResult.score : 0;
      const durationMinutes = Math.round(durationHours * 60);

      // startHour diinterpretasikan sebagai jam WIB (UTC+7).
      // Untuk waktu malam sebelum tengah malam (startHour >= 12, misal 22.5, 23.0): UTC = startHour - 7 pada hari currentDate.
      // Untuk waktu dini hari lewat tengah malam (startHour < 12, misal 0.0, 2.5): sesi tetap di malam currentDate yang sama,
      // sehingga dalam UTC: (startHour + 24) - 7 = startHour + 17 pada hari currentDate.
      const utcMinutesTotal = Math.round(
        (startHour >= 12 ? startHour - 7 : startHour + 17) * 60
      );
      const utcHours = Math.floor(utcMinutesTotal / 60);
      const utcMinutes = utcMinutesTotal % 60;

      const startTime = new Date(currentDate);
      startTime.setUTCHours(utcHours, utcMinutes, 0, 0);

      const endTime = new Date(startTime.getTime() + durationMinutes * 60_000);

      sessions.push({
        id: `session-${user.id}-${dateStr}`,
        userId: user.id,
        startedAt: startTime.toISOString(),
        endedAt: endTime.toISOString(),
        durationMinutes,
        status,
        score: calculatedScore,
        date: dateStr,
        weekId
      });
    }
  }

  return sessions;
}

/**
 * Menghasilkan kartu koleksi sesuai aturan drop (skor >= 70) dan distribusi rarity.
 * Variasi kepemilikan dirancang masuk akal:
 * - Beberapa kartu Common dimiliki banyak Simplimates (4-5 orang).
 * - Kartu Rare dimiliki 2-3 orang.
 * - Kartu Epic hanya dimiliki 1-2 orang.
 * - Terdapat duplikat salinan (user bisa memiliki lebih dari 1 salinan kartu yang sama).
 * - Minimal 1 Legendary (bahkan 2: T-Rex dan Phoenix) belum ditemukan (owners: 0).
 */
export function generateSeedUserCards(): SeedUserCard[] {
  const cards: SeedUserCard[] = [];
  let cardCounter = 0;

  const addCard = (
    userId: string,
    slug: string,
    status: 'minted' | 'pending-mint',
    tokenId?: string,
    txHash?: string
  ) => {
    cardCounter++;
    const cardNumber = cardNumberFromSlug(slug);
    const meta = CARDS_METADATA[slug] || { name: slug, rarity: 'Common' };
    cards.push({
      id: `card-${userId}-${slug}-${cardCounter}`,
      userId,
      cardId: slug,
      cardNumber,
      name: meta.name,
      rarity: meta.rarity,
      tokenId,
      txHash,
      status,
      createdAt: '2026-11-15T10:00:00.000Z'
    });
  };

  // 1. Siti Rahma (Konsistensi Tertinggi) memiliki koleksi lengkap: Legendary, Epic, Rare, Common
  addCard('siti-rahma', 'dragon', 'minted', '1', '0xaaa1111111111111111111111111111111111111111111111111111111111111');
  addCard('siti-rahma', 'owl', 'minted', '2', '0xaaa2222222222222222222222222222222222222222222222222222222222222');
  addCard('siti-rahma', 'panda', 'pending-mint');
  addCard('siti-rahma', 'koala', 'pending-mint');
  addCard('siti-rahma', 'orange-cat', 'pending-mint');
  addCard('siti-rahma', 'orange-cat', 'pending-mint'); // Duplikat kartu kucing oren
  addCard('siti-rahma', 'sloth', 'pending-mint');
  addCard('siti-rahma', 'corgi', 'pending-mint');

  // 2. Budi Santoso (Engineering Lead)
  addCard('budi-santoso', 'blue-whale', 'minted', '3', '0xaaa3333333333333333333333333333333333333333333333333333333333333');
  addCard('budi-santoso', 'panda', 'pending-mint');
  addCard('budi-santoso', 'red-fox', 'pending-mint');
  addCard('budi-santoso', 'penguin', 'pending-mint');
  addCard('budi-santoso', 'orange-cat', 'pending-mint');
  addCard('budi-santoso', 'corgi', 'pending-mint');
  addCard('budi-santoso', 'hamster', 'pending-mint');
  addCard('budi-santoso', 'white-rabbit', 'pending-mint');
  addCard('budi-santoso', 'hedgehog', 'pending-mint');
  addCard('budi-santoso', 'red-panda', 'pending-mint');

  // 3. Dewi Lestari (Product Manager)
  addCard('dewi-lestari', 'octopus', 'pending-mint');
  addCard('dewi-lestari', 'koala', 'pending-mint');
  addCard('dewi-lestari', 'polar-bear', 'pending-mint');
  addCard('dewi-lestari', 'orange-cat', 'pending-mint');
  addCard('dewi-lestari', 'corgi', 'pending-mint');
  addCard('dewi-lestari', 'yellow-duck', 'pending-mint');
  addCard('dewi-lestari', 'red-panda', 'pending-mint');
  addCard('dewi-lestari', 'otter', 'pending-mint');

  // 4. Gilang Ramadhan (Paling Membaik)
  addCard('gilang-ramadhan', 'penguin', 'pending-mint');
  addCard('gilang-ramadhan', 'raccoon', 'pending-mint');
  addCard('gilang-ramadhan', 'corgi', 'pending-mint');
  addCard('gilang-ramadhan', 'yellow-duck', 'pending-mint');
  addCard('gilang-ramadhan', 'capybara', 'pending-mint');

  // 5. Lukman Hakim (Security Engineer)
  addCard('lukman-hakim', 'bat', 'pending-mint');
  addCard('lukman-hakim', 'polar-bear', 'pending-mint');
  addCard('lukman-hakim', 'squirrel', 'pending-mint');
  addCard('lukman-hakim', 'witch-cat', 'pending-mint');
  addCard('lukman-hakim', 'sloth', 'pending-mint');
  addCard('lukman-hakim', 'hedgehog', 'pending-mint');

  // 6. Joko Susilo (Business Development)
  addCard('joko-susilo', 'panda', 'pending-mint');
  addCard('joko-susilo', 'raccoon', 'pending-mint');
  addCard('joko-susilo', 'orange-cat', 'pending-mint');
  addCard('joko-susilo', 'hamster', 'pending-mint');
  addCard('joko-susilo', 'hedgehog', 'pending-mint');
  addCard('joko-susilo', 'capybara', 'pending-mint');

  // 7. Kartika Sari (Technical Writer)
  addCard('kartika-sari', 'penguin', 'pending-mint');
  addCard('kartika-sari', 'squirrel', 'pending-mint');
  addCard('kartika-sari', 'sloth', 'pending-mint');
  addCard('kartika-sari', 'hamster', 'pending-mint');
  addCard('kartika-sari', 'otter', 'pending-mint');
  addCard('kartika-sari', 'mini-pig', 'pending-mint');
  addCard('kartika-sari', 'chick', 'pending-mint');

  // 8. Hany Putri (Customer Success)
  addCard('hany-putri', 'bat', 'pending-mint');
  addCard('hany-putri', 'sloth', 'pending-mint');
  addCard('hany-putri', 'white-rabbit', 'pending-mint');

  // 9. Adi Wijaya (Product Designer)
  addCard('adi-wijaya', 'red-fox', 'pending-mint');
  addCard('adi-wijaya', 'orange-cat', 'pending-mint');
  addCard('adi-wijaya', 'yellow-duck', 'pending-mint');
  addCard('adi-wijaya', 'mini-pig', 'pending-mint');

  // 10. Fitri Handayani (Frontend Developer)
  addCard('fitri-handayani', 'koala', 'pending-mint');
  addCard('fitri-handayani', 'hamster', 'pending-mint');
  addCard('fitri-handayani', 'white-rabbit', 'pending-mint');

  // 11 & 12. Eko Prasetyo & Indra Kusuma tidak punya kartu karena selalu begadang (skor < 70)

  return cards;
}
