import { Card, LeaderboardRow, NightScore, Rarity, SleepLabel, SleepSession, User } from 'shared';

export interface DummySimplimate extends User {
  role: string;
  personality: string;
  baseStreak: number;
  baseAvgScore: number;
  medianSleepTime: string; // e.g. '23:30'
}

// 3 Akun Demo Resmi Simplimates (Mode Demo & Mock)
export const DUMMY_SIMPLIMATES: DummySimplimate[] = [
  {
    id: 'budi-santoso',
    name: 'Budi Santoso',
    role: 'Engineering Lead',
    avatar: 'budi',
    walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    personality: 'Penjaga Ritme 23:00 (10 Kartu Koleksi)',
    baseStreak: 7,
    baseAvgScore: 94.8,
    medianSleepTime: '23:00'
  },
  {
    id: 'siti-rahma',
    name: 'Siti Rahma',
    role: 'Senior QA Engineer',
    avatar: 'siti',
    walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    personality: 'Paling Konsisten & Tertib (#1 Leaderboard)',
    baseStreak: 14,
    baseAvgScore: 97.2,
    medianSleepTime: '22:30'
  },
  {
    id: 'gilang-ramadhan',
    name: 'Gilang Ramadhan',
    role: 'DevOps Engineer',
    avatar: 'gilang',
    walletAddress: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    personality: 'Si Paling Membaik (Ex-Kalong)',
    baseStreak: 5,
    baseAvgScore: 88.5,
    medianSleepTime: '23:15'
  }
];

// Sample Awake Users untuk halaman Masih Melek
export interface AwakeUserItem {
  userId: string;
  name: string;
  role: string;
  avatar: string;
  since: string;
  sinceHoursAgo: number;
  reason: string;
}

export const DUMMY_AWAKE_USERS: AwakeUserItem[] = [
  {
    userId: 'user-5',
    name: 'Reza Firmansyah',
    role: 'DevOps Specialist',
    avatar: 'reza',
    since: '01:45',
    sinceHoursAgo: 2.2,
    reason: 'Investigasi log pipeline CI/CD yang merah misterius'
  },
  {
    userId: 'user-11',
    name: 'Eko Prasetyo',
    role: 'Security Engineer',
    avatar: 'eko',
    since: '02:10',
    sinceHoursAgo: 1.8,
    reason: 'Analisis security alert jam 2 pagi sambil ngopi saset'
  },
  {
    userId: 'user-9',
    name: 'Fajar Ramadhan',
    role: 'Mobile Engineer',
    avatar: 'fajar',
    since: '02:35',
    sinceHoursAgo: 1.3,
    reason: 'Scrolling video reel tutorial Flutter sampai mata sepet'
  }
];

// 14 Hari Riwayat Tidur Dummy untuk User Aktif
export interface SleepHistoryItem {
  date: string;
  dayName: string;
  durationMin: number;
  durationHours: number;
  score: number;
  label: SleepLabel;
  status: 'completed' | 'broken' | 'flagged';
  bedTime: string;
  wakeTime: string;
}

export function generate14DaysHistory(): SleepHistoryItem[] {
  const days: SleepHistoryItem[] = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date();

  // 14 hari ke belakang
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayName = dayNames[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];

    // Variasi realistis: sebagian besar 7-8 jam dengan skor bagus (80-95), ada 1 broken, 1 kurang tidur
    let durationHours = 7.5;
    let score = 88;
    let status: 'completed' | 'broken' | 'flagged' = 'completed';
    let label: SleepLabel = 'Sehat';

    if (i === 1) {
      // Kemarin malam
      durationHours = 7.8;
      score = 92;
      label = 'Sehat';
    } else if (i === 2) {
      durationHours = 8.2;
      score = 94;
      label = 'Sehat';
    } else if (i === 4) {
      // Malam kurang tidur
      durationHours = 5.2;
      score = 58;
      label = 'Kurang';
    } else if (i === 7) {
      // Broken session karena buka app
      durationHours = 6.8;
      score = 64;
      status = 'broken';
      label = 'Kurang';
    } else if (i === 10) {
      durationHours = 9.5;
      score = 78;
      label = 'Kebanyakan';
    } else {
      durationHours = 7.2 + ((i * 3) % 10) / 10;
      score = 75 + ((i * 7) % 20);
      label = durationHours >= 7 && durationHours <= 9 ? 'Sehat' : durationHours < 7 ? 'Kurang' : 'Kebanyakan';
    }

    days.push({
      date: dateStr,
      dayName,
      durationMin: Math.round(durationHours * 60),
      durationHours: Math.round(durationHours * 10) / 10,
      score,
      label,
      status,
      bedTime: '23:15',
      wakeTime: '06:55'
    });
  }

  return days;
}

// Data Dummy Leaderboard untuk Minggu 47, 46, 45
export interface LeaderboardCategoryWinner {
  title: string;
  subtitle: string;
  badge: string;
  winner: LeaderboardRow & { role?: string; highlightStat: string };
}

export interface LeaderboardResponse {
  week: string;
  rows: LeaderboardRow[];
  categories: {
    mostConsistent: LeaderboardRow & { highlightStat: string };
    mostImproved: LeaderboardRow & { highlightStat: string };
    longestStreak: LeaderboardRow & { highlightStat: string };
  };
  commit?: {
    hash: string;
    txHash: string;
    timestamp: string;
  };
}

export function generateLeaderboardData(week = '2026-W47'): LeaderboardResponse {
  const isCurrentWeek = week === '2026-W47';

  const rows: LeaderboardRow[] = DUMMY_SIMPLIMATES.map((user, idx) => {
    // Sedikit variasi per minggu
    let avgScore = user.baseAvgScore;
    let streak = user.baseStreak;

    if (!isCurrentWeek) {
      avgScore = Math.max(60, Math.min(99, Math.round((avgScore + ((idx % 3) - 1) * 3.5) * 10) / 10));
      streak = Math.max(1, streak - (week === '2026-W46' ? 1 : 2));
    }

    const label: SleepLabel = avgScore >= 80 ? 'Sehat' : avgScore >= 70 ? 'Sehat' : 'Kurang';

    return {
      rank: idx + 1,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      avgScore,
      label,
      streak
    };
  }).sort((a, b) => b.avgScore - a.avgScore)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const mostConsistent = {
    ...rows.find((r) => r.userId === 'siti-rahma' || r.userId === 'user-2') ?? rows[0],
    highlightStat: 'Deviasi hanya ±8 menit dari median'
  };

  const mostImproved = {
    ...rows.find((r) => r.userId === 'gilang-ramadhan' || r.userId === 'user-3') ?? rows[1],
    highlightStat: '+18.4 poin dibanding minggu lalu'
  };

  const longestStreak = {
    ...rows.find((r) => r.userId === 'budi-santoso' || r.userId === 'user-1' || r.userId === 'user-10') ?? rows[2],
    highlightStat: '14 malam berturut-turut skor ≥ 70'
  };

  return {
    week,
    rows,
    categories: {
      mostConsistent,
      mostImproved,
      longestStreak
    },
    commit: {
      hash: '0x7e8b23a9d18c04e28741369ef995bca2034918e7d23a19f993bcde448821019a',
      txHash: '0x3f58a74e908b9821de837264aefc90226b87201c89320857321ff8b2c4e1a0b3',
      timestamp: '2026-11-16T00:05:00.000Z'
    }
  };
}

// Sample Card Drop dari assets/cards/cards.json
export const SAMPLE_DROP_CARDS: Card[] = [
  {
    id: 'orange-cat',
    name: 'Kucing Oren',
    rarity: 'Common',
    image: 'orange-cat.png',
    description: 'Meringkuk bulat seperti donat kayu manis dengan gelembung ingus raksasa kembang-kempis dan air liur menetes ke lantai.',
    status: 'pending-mint'
  },
  {
    id: 'panda',
    name: 'Panda Rebah',
    rarity: 'Rare',
    image: 'panda.png',
    description: 'Merosot di batang bambu sampai dagunya nempel ke perut buncit, tunas bambu masih menggantung di mulut terbukanya.',
    status: 'pending-mint'
  },
  {
    id: 'owl',
    name: 'Burung Hantu Siang',
    rarity: 'Epic',
    image: 'owl.png',
    description: 'Tidur siang terbalik di dahan pohon dengan satu cakar hampir lepas dan masker tidur malam hari dipakai siang bolong.',
    status: 'pending-mint'
  },
  {
    id: 'blue-whale',
    name: 'Paus Biru Samudra',
    rarity: 'Epic',
    image: 'blue-whale.png',
    description: 'Mengapung vertikal di laut dalam meniup gelembung air liur raksasa bercampur Zzz, topi tidur mini terikat di siripnya.',
    status: 'pending-mint'
  }
];

// Kontrak Papan Kelangkaan Kartu (GET /api/cards/rarity-board)
export interface RarityBoardCard {
  rank: number;
  cardId: string;
  cardNumber: number;
  name: string;
  rarity: Rarity;
  owners: number;
  copies: number;
  ownedPct: number;
}

export interface RarityBoardResponse {
  totalUsers: number;
  updatedAt: string;
  cards: RarityBoardCard[];
}

export const DUMMY_RARITY_BOARD: RarityBoardResponse = {
  totalUsers: 12,
  updatedAt: '2026-11-21T04:00:00.000Z',
  cards: [
    // Rank 1 (0 owners - Belum Ditemukan)
    { rank: 1, cardId: 't-rex', cardNumber: 26, name: 'T-Rex Si Manja', rarity: 'Legendary', owners: 0, copies: 0, ownedPct: 0.0 },
    { rank: 1, cardId: 'dragon', cardNumber: 27, name: 'Naga Emas Kemilau', rarity: 'Legendary', owners: 0, copies: 0, ownedPct: 0.0 },
    { rank: 1, cardId: 'phoenix', cardNumber: 28, name: 'Burung Phoenix Abadi', rarity: 'Legendary', owners: 0, copies: 0, ownedPct: 0.0 },
    { rank: 1, cardId: 'white-deer', cardNumber: 25, name: 'Rusa Putih Mistis', rarity: 'Epic', owners: 0, copies: 0, ownedPct: 0.0 },

    // Rank 2 (1 owner)
    { rank: 2, cardId: 'blue-whale', cardNumber: 22, name: 'Paus Biru Samudra', rarity: 'Epic', owners: 1, copies: 1, ownedPct: 8.3 },
    { rank: 2, cardId: 'bat', cardNumber: 23, name: 'Kelelawar Kristal', rarity: 'Epic', owners: 1, copies: 1, ownedPct: 8.3 },

    // Rank 3 (2 owners)
    { rank: 3, cardId: 'owl', cardNumber: 21, name: 'Burung Hantu Siang', rarity: 'Epic', owners: 2, copies: 3, ownedPct: 16.7 },
    { rank: 3, cardId: 'octopus', cardNumber: 24, name: 'Gurita Harta Karun', rarity: 'Epic', owners: 2, copies: 2, ownedPct: 16.7 },

    // Rank 4 (3 owners)
    { rank: 4, cardId: 'polar-bear', cardNumber: 16, name: 'Beruang Kutub', rarity: 'Rare', owners: 3, copies: 4, ownedPct: 25.0 },
    { rank: 4, cardId: 'squirrel', cardNumber: 19, name: 'Tupai Kacang', rarity: 'Rare', owners: 3, copies: 3, ownedPct: 25.0 },
    { rank: 4, cardId: 'witch-cat', cardNumber: 20, name: 'Kucing Penyihir', rarity: 'Rare', owners: 3, copies: 4, ownedPct: 25.0 },

    // Rank 5 (4 owners)
    { rank: 5, cardId: 'koala', cardNumber: 14, name: 'Koala Eukaliptus', rarity: 'Rare', owners: 4, copies: 5, ownedPct: 33.3 },
    { rank: 5, cardId: 'penguin', cardNumber: 17, name: 'Pinguin Kutub', rarity: 'Rare', owners: 4, copies: 4, ownedPct: 33.3 },
    { rank: 5, cardId: 'raccoon', cardNumber: 18, name: 'Rakun Manis', rarity: 'Rare', owners: 4, copies: 5, ownedPct: 33.3 },

    // Rank 6 (5 owners)
    { rank: 6, cardId: 'panda', cardNumber: 13, name: 'Panda Rebah', rarity: 'Rare', owners: 5, copies: 6, ownedPct: 41.7 },
    { rank: 6, cardId: 'red-fox', cardNumber: 15, name: 'Rubah Merah', rarity: 'Rare', owners: 5, copies: 6, ownedPct: 41.7 },

    // Rank 7 (6 owners)
    { rank: 7, cardId: 'red-panda', cardNumber: 9, name: 'Panda Merah', rarity: 'Common', owners: 6, copies: 8, ownedPct: 50.0 },
    { rank: 7, cardId: 'mini-pig', cardNumber: 11, name: 'Babi Mini', rarity: 'Common', owners: 6, copies: 7, ownedPct: 50.0 },
    { rank: 7, cardId: 'chick', cardNumber: 12, name: 'Anak Ayam', rarity: 'Common', owners: 6, copies: 8, ownedPct: 50.0 },

    // Rank 8 (7 owners)
    { rank: 8, cardId: 'yellow-duck', cardNumber: 7, name: 'Bebek Kuning', rarity: 'Common', owners: 7, copies: 9, ownedPct: 58.3 },
    { rank: 8, cardId: 'capybara', cardNumber: 8, name: 'Kapibara Santuy', rarity: 'Common', owners: 7, copies: 10, ownedPct: 58.3 },
    { rank: 8, cardId: 'otter', cardNumber: 10, name: 'Berang-berang Apung', rarity: 'Common', owners: 7, copies: 9, ownedPct: 58.3 },

    // Rank 9 (8 owners)
    { rank: 9, cardId: 'hamster', cardNumber: 4, name: 'Hamster Kenyang', rarity: 'Common', owners: 8, copies: 10, ownedPct: 66.7 },
    { rank: 9, cardId: 'white-rabbit', cardNumber: 5, name: 'Kelinci Putih', rarity: 'Common', owners: 8, copies: 9, ownedPct: 66.7 },
    { rank: 9, cardId: 'hedgehog', cardNumber: 6, name: 'Landak Mini', rarity: 'Common', owners: 8, copies: 11, ownedPct: 66.7 },

    // Rank 10 (9 owners)
    { rank: 10, cardId: 'corgi', cardNumber: 3, name: 'Anjing Corgi', rarity: 'Common', owners: 9, copies: 12, ownedPct: 75.0 },

    // Rank 11 (10 owners)
    { rank: 11, cardId: 'sloth', cardNumber: 2, name: 'Kungkang Santai', rarity: 'Common', owners: 10, copies: 14, ownedPct: 83.3 },

    // Rank 12 (11 owners)
    { rank: 12, cardId: 'orange-cat', cardNumber: 1, name: 'Kucing Oren', rarity: 'Common', owners: 11, copies: 16, ownedPct: 91.7 }
  ]
};
