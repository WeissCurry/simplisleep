import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Card, Rarity } from 'shared';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { DUMMY_RARITY_BOARD, RarityBoardCard, RarityBoardResponse } from '../../core/services/mock-data';
import { ToastService } from '../../core/services/toast.service';

export type { RarityBoardCard, RarityBoardResponse };
export { DUMMY_RARITY_BOARD };

export interface CardWithTrivia extends Card {
  trivia?: string;
  triviaType?: 'fakta' | 'jokes';
}

export interface CardCollectionState {
  totalCards: number;
  unlockedCount: number;
  byRarity: Record<Rarity, { unlocked: number; total: number; weight: number }>;
}

export const CARD_TRIVIA_MAP: Record<string, { trivia: string; triviaType: 'fakta' | 'jokes' }> = {
  'orange-cat': {
    triviaType: 'fakta',
    trivia: 'Kucing menghabiskan sekitar 70% hidupnya untuk tidur. Sisanya buat minta makan dan bikin rusuh di jam 3 pagi.'
  },
  'sloth': {
    triviaType: 'fakta',
    trivia: 'Kukang bisa tidur belasan jam sehari. Bahaya terbesarnya bukan tidur, tapi saat turun pohon seminggu sekali buat buang air.'
  },
  'corgi': {
    triviaType: 'fakta',
    trivia: 'Anjing corgi sering tidur telentang karena merasa sangat aman dan untuk mendinginkan perutnya lewat udara sejuk.'
  },
  'hamster': {
    triviaType: 'fakta',
    trivia: 'Hamster adalah hewan krepuskular dan nokturnal. Siang hari molor pulas, giliran kamu tidur dia malah ngebut di roda putar.'
  },
  'white-rabbit': {
    triviaType: 'fakta',
    trivia: 'Kelinci bisa tidur dengan mata terbuka lebar saat waspada! Kalau sudah sangat rileks, mereka tidur \'flop\' telungkup gepeng.'
  },
  'hedgehog': {
    triviaType: 'fakta',
    trivia: 'Landak mini bisa tidur sampai 18 jam sehari, dan di alam liar mereka berhibernasi saat musim dingin. Bangun-bangun langsung cari serangga.'
  },
  'yellow-duck': {
    triviaType: 'fakta',
    trivia: 'Bebek bisa tidur dengan satu mata terbuka dan setengah otak tetap terjaga (tidur unihemisfer) untuk mengawasi bahaya.'
  },
  'capybara': {
    triviaType: 'fakta',
    trivia: 'Kapibara jago berendam berjam-jam dengan cuma hidung yang menyembul, dan sering terlihat ketiduran di pinggir air sambil santai.'
  },
  'red-panda': {
    triviaType: 'fakta',
    trivia: 'Panda merah melingkarkan ekor tebalnya ke seluruh tubuh saat tidur untuk dijadikan selimut alami penahan hawa dingin.'
  },
  'otter': {
    triviaType: 'fakta',
    trivia: 'Berang-berang laut tidur mengapung sambil bergandengan tangan dengan sesamanya agar tidak hanyut terbawa arus ombak.'
  },
  'mini-pig': {
    triviaType: 'fakta',
    trivia: 'Babi suka tidur berdempetan bareng temannya, dan seperti manusia mereka juga mengalami fase tidur REM, fase saat mimpi biasanya terjadi.'
  },
  'chick': {
    triviaType: 'fakta',
    trivia: 'Anak ayam sering ketiduran dengan kepala pelan-pelan menunduk sampai nyaris nyungsep ke tanah, lalu menyelinap ke bawah sayap induknya biar hangat.'
  },
  'panda': {
    triviaType: 'fakta',
    trivia: 'Panda raksasa bisa tidur di posisi apa saja: nyangkut di dahan, duduk, sampai terjungkal setelah kenyang mengunyah bambu.'
  },
  'koala': {
    triviaType: 'fakta',
    trivia: 'Koala tidur hingga 18-22 jam sehari bukan karena pemalas, tapi karena daun eukaliptus sangat rendah kalori dan energi.'
  },
  'red-fox': {
    triviaType: 'fakta',
    trivia: 'Rubah merah tidur melingkar dan menyembunyikan hidungnya di balik ekor lebat agar tetap hangat di tengah salju dingin.'
  },
  'polar-bear': {
    triviaType: 'fakta',
    trivia: 'Beruang kutub bisa tidur siang 7-8 jam sehari demi menghemat energi, sering tidur pulas dengan dagu bertumpu di atas salju.'
  },
  'penguin': {
    triviaType: 'fakta',
    trivia: 'Pinguin chinstrap tidur dengan ribuan microsleep sehari, masing-masing cuma sekitar 4 detik, sambil tetap menjaga telurnya.'
  },
  'raccoon': {
    triviaType: 'fakta',
    trivia: 'Rakun tidur di lubang pohon pada siang hari dan baru aktif menjelajah tempat sampah tetangga saat tengah malam tiba.'
  },
  'squirrel': {
    triviaType: 'fakta',
    trivia: 'Tupai tidur di sarang ranting bernama drey. Mereka juga jago pura-pura mengubur kacang untuk mengecoh tupai lain yang mau nyolong.'
  },
  'witch-cat': {
    triviaType: 'jokes',
    trivia: 'Kucing penyihir tidur di atas buku mantra bukan karena rajin belajar, tapi karena kertas kunonya hangat terkena sihir.'
  },
  'owl': {
    triviaType: 'fakta',
    trivia: 'Burung hantu punya kelopak mata khusus: kelopak atas untuk berkedip, kelopak bawah untuk tidur pulas di siang bolong.'
  },
  'blue-whale': {
    triviaType: 'fakta',
    trivia: 'Paus dan lumba-lumba bisa mengistirahatkan setengah otaknya bergantian, supaya tetap ingat naik ke permukaan untuk bernapas.'
  },
  'bat': {
    triviaType: 'fakta',
    trivia: 'Kelelawar tidur terbalik karena cakar khususnya terkunci otomatis tanpa perlu tenaga otot, siap langsung meluncur terbang.'
  },
  'octopus': {
    triviaType: 'fakta',
    trivia: 'Saat gurita tidur, warna kulitnya bisa berubah-ubah sendiri. Ilmuwan menduga fase ini mirip mimpi, mungkin dia lagi mimpi berburu.'
  },
  'white-deer': {
    triviaType: 'jokes',
    trivia: 'Rusa putih mistis jarang tidur di kasur empuk... takut tanduk bercahayanya nyangkut di kelambu kamar tidur peri.'
  },
  't-rex': {
    triviaType: 'jokes',
    trivia: 'T-Rex tidurnya lama banget... soalnya dia udah punah 66 juta tahun lalu.'
  },
  'dragon': {
    triviaType: 'jokes',
    trivia: 'Naga emas tidur di atas tumpukan koin emas bukan buat pamer kekayaan, tapi kasur busa biasa langsung gosong kena napas api.'
  },
  'phoenix': {
    triviaType: 'jokes',
    trivia: 'Burung phoenix kalau tidur pasang alarm keras-keras... takutnya kalau mati suri kebablasan harus lahir ulang dari abu lagi.'
  }
};

const BASE_28_CARDS: Card[] = [
  // Common (12)
  {
    id: 'orange-cat',
    name: 'Kucing Oren',
    rarity: 'Common',
    image: 'orange-cat.png',
    description: 'Meringkuk bulat seperti donat kayu manis dengan gelembung ingus raksasa kembang-kempis dan air liur menetes ke lantai.'
  },
  {
    id: 'sloth',
    name: 'Kungkang Santai',
    rarity: 'Common',
    image: 'sloth.png',
    description: 'Tidur bergelantungan satu cakar hampir lepas dengan topi tidur melorot menutupi seluruh matanya.'
  },
  {
    id: 'corgi',
    name: 'Anjing Corgi',
    rarity: 'Common',
    image: 'corgi.png',
    description: 'Telentang pasrah dengan empat kaki pendek kaku menghadap langit-langit dan lidah menjulur keluar menyamping.'
  },
  {
    id: 'hamster',
    name: 'Hamster Kenyang',
    rarity: 'Common',
    image: 'hamster.png',
    description: 'Kepala nyungsep ke dasar mangkuk biji bunga matahari, menyisakan pantat bulat dan kaki kecil mencuat ke atas.'
  },
  {
    id: 'white-rabbit',
    name: 'Kelinci Putih',
    rarity: 'Common',
    image: 'white-rabbit.png',
    description: 'Telungkup gepeng bagai adonan pancake gagal dengan telinga panjang kusut menutupi seluruh wajahnya.'
  },
  {
    id: 'hedgehog',
    name: 'Landak Mini',
    rarity: 'Common',
    image: 'hedgehog.png',
    description: 'Tidur telentang di atas daun kering dengan bantal mini kebesaran menimpa dahinya sambil mendengkur halus.'
  },
  {
    id: 'yellow-duck',
    name: 'Bebek Kuning',
    rarity: 'Common',
    image: 'yellow-duck.png',
    description: 'Berdiri oleng satu kaki nyaris tumbang, kepalanya diselipkan terbalik di bawah sayap bersama gelembung tidur besar.'
  },
  {
    id: 'capybara',
    name: 'Kapibara Santuy',
    rarity: 'Common',
    image: 'capybara.png',
    description: 'Duduk kaku dengan ekspresi pasrah tanpa jiwa, sebutir jeruk di atas kepala dan satu lagi di ujung hidungnya.'
  },
  {
    id: 'red-panda',
    name: 'Panda Merah',
    rarity: 'Common',
    image: 'red-panda.png',
    description: 'Tengkurap memeluk erat ekor belangnya sendiri yang ditarik sampai menutupi seluruh tubuhnya seperti selimut tebal.'
  },
  {
    id: 'otter',
    name: 'Berang-berang Apung',
    rarity: 'Common',
    image: 'otter.png',
    description: 'Mengapung telentang memeluk bantal donat mini dengan mulut menganga lebar meneteskan liur ke air.'
  },
  {
    id: 'mini-pig',
    name: 'Babi Mini',
    rarity: 'Common',
    image: 'mini-pig.png',
    description: 'Setengah badannya merosot jatuh dari bantal empuk ke lantai, hidung peseknya mendengkur keras bikin lantai bergetar.'
  },
  {
    id: 'chick',
    name: 'Anak Ayam',
    rarity: 'Common',
    image: 'chick.png',
    description: 'Terjepit terbalik di dalam cangkang telur setengah pecah, hanya kaki kecilnya yang menendang-nendang pelan di udara.'
  },

  // Rare (8)
  {
    id: 'panda',
    name: 'Panda Rebah',
    rarity: 'Rare',
    image: 'panda.png',
    description: 'Merosot di batang bambu sampai dagunya nempel ke perut buncit, tunas bambu masih menggantung di mulut terbukanya.'
  },
  {
    id: 'koala',
    name: 'Koala Eukaliptus',
    rarity: 'Rare',
    image: 'koala.png',
    description: 'Memeluk batang pohon terlalu kencang sampai pipinya gepeng tertekan, masker tidur melorot sampai ke leher.'
  },
  {
    id: 'red-fox',
    name: 'Rubah Merah',
    rarity: 'Rare',
    image: 'red-fox.png',
    description: 'Tertidur melingkar bagai pretzel rumit, ekor lebatnya ditarik menutupi kepala demi memblokir suara alarm dunia nyata.'
  },
  {
    id: 'polar-bear',
    name: 'Beruang Kutub',
    rarity: 'Rare',
    image: 'polar-bear.png',
    description: 'Tidur telentang di bongkahan es mini sampai kakinya menggantung di air, syal merah melilit kepala seperti serban tidur.'
  },
  {
    id: 'penguin',
    name: 'Pinguin Kutub',
    rarity: 'Rare',
    image: 'penguin.png',
    description: 'Berdiri kaku di samping iglo dengan topi tidur panjang yang pom-pomnya masuk ke dalam paruhnya sendiri.'
  },
  {
    id: 'raccoon',
    name: 'Rakun Manis',
    rarity: 'Rare',
    image: 'raccoon.png',
    description: 'Kepala nyungsep ke dalam kardus sempit sampai ekornya doang yang nongol, remahan kue pai berserakan di lantai.'
  },
  {
    id: 'squirrel',
    name: 'Tupai Kacang',
    rarity: 'Rare',
    image: 'squirrel.png',
    description: 'Terjepit padat di dalam lubang pohon penuh timbunan kenari, pipinya melar terhimpit kacang dengan ekspresi tidur lebay.'
  },
  {
    id: 'witch-cat',
    name: 'Kucing Penyihir',
    rarity: 'Rare',
    image: 'witch-cat.png',
    description: 'Tengkurap di atas tumpukan buku mantra, topi penyihir melorot menutup seluruh kepala sampai cuma terlihat ekornya.'
  },

  // Epic (5)
  {
    id: 'owl',
    name: 'Burung Hantu Siang',
    rarity: 'Epic',
    image: 'owl.png',
    description: 'Tidur siang terbalik di dahan pohon dengan satu cakar hampir lepas dan masker tidur malam hari dipakai siang bolong.'
  },
  {
    id: 'blue-whale',
    name: 'Paus Biru Samudra',
    rarity: 'Epic',
    image: 'blue-whale.png',
    description: 'Mengapung vertikal di laut dalam meniup gelembung air liur raksasa bercampur Zzz, topi tidur mini terikat di siripnya.'
  },
  {
    id: 'bat',
    name: 'Kelelawar Kristal',
    rarity: 'Epic',
    image: 'bat.png',
    description: 'Bergelantungan terbalik di kristal ungu dengan sayap terlilit kusut seperti kepompong selimut darurat dan lidah melet.'
  },
  {
    id: 'octopus',
    name: 'Gurita Harta Karun',
    rarity: 'Epic',
    image: 'octopus.png',
    description: 'Tidur di peti harta karun terbuka dengan satu tentakel memeluk cangkir emas seperti boneka tidur kesayangan.'
  },
  {
    id: 'white-deer',
    name: 'Rusa Putih Mistis',
    rarity: 'Epic',
    image: 'white-deer.png',
    description: 'Tidur bersila konyol dengan tanduknya tersangkut tanaman rambat bercahaya dan jamur neon tumbuh di hidung tidurnya.'
  },

  // Legendary (3)
  {
    id: 't-rex',
    name: 'T-Rex Si Manja',
    rarity: 'Legendary',
    image: 't-rex.png',
    description: 'Raja purba telentang pulas dengan tangan mungil kaku memeluk boneka dino mini, mulut menganga dengan liur berkilau emas.'
  },
  {
    id: 'dragon',
    name: 'Naga Emas Kemilau',
    rarity: 'Legendary',
    image: 'dragon.png',
    description: 'Naga agung melingkar di tumpukan emas tapi kepalanya merosot ke lantai, asap tipis Zzz keluar dari hidung yang kembang-kempis.'
  },
  {
    id: 'phoenix',
    name: 'Burung Phoenix Abadi',
    rarity: 'Legendary',
    image: 'phoenix.png',
    description: 'Burung api abadi tidur nyungsep di sarang bara hangat seperti ayam kampung kedinginan, paruh mendengkur dengan percikan api.'
  }
];

export const ALL_28_CARDS: CardWithTrivia[] = BASE_28_CARDS.map((c) => ({
  ...c,
  ...(CARD_TRIVIA_MAP[c.id] || {})
}));

// Mock koleksi awal user yang sudah didapatkan dari sleep streak (Budi Santoso - 10 Kartu)
export const DUMMY_USER_CARDS: CardWithTrivia[] = [
  {
    ...ALL_28_CARDS[21], // blue-whale (Epic)
    status: 'minted',
    tokenId: 103,
    txHash: '0xaaa3333333333333333333333333333333333333333333333333333333333333'
  },
  {
    ...ALL_28_CARDS[12], // panda (Rare)
    status: 'minted',
    tokenId: 102,
    txHash: '0x8127384619283746192837461928374619283746192837461928374619283746'
  },
  {
    ...ALL_28_CARDS[1], // sloth (Common)
    status: 'minted',
    tokenId: 101,
    txHash: '0x4f128bc9a80e1293847fa1098234857b293847f9182347561928374651928374'
  },
  {
    ...ALL_28_CARDS[14], // red-fox (Rare)
    status: 'pending-mint'
  },
  {
    ...ALL_28_CARDS[16], // penguin (Rare)
    status: 'pending-mint'
  },
  {
    ...ALL_28_CARDS[0], // orange-cat (Common)
    status: 'pending-mint'
  },
  {
    ...ALL_28_CARDS[2], // corgi (Common)
    status: 'pending-mint'
  },
  {
    ...ALL_28_CARDS[3], // hamster (Common)
    status: 'pending-mint'
  },
  {
    ...ALL_28_CARDS[4], // white-rabbit (Common)
    status: 'pending-mint'
  },
  {
    ...ALL_28_CARDS[5], // hedgehog (Common)
    status: 'pending-mint'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  /**
   * Mengambil katalog lengkap 28 kartu Simply is Sleeping
   */
  getCatalog(): Observable<CardWithTrivia[]> {
    if (environment.useMock) {
      return of(ALL_28_CARDS);
    }
    return this.http.get<Card[]>(`${environment.apiUrl}/cards/catalog`, {
      headers: this.auth.getAuthHeaders()
    }).pipe(
      map((cards) =>
        cards.map((c) => {
          const cardKey = (c as any).cardId || c.id;
          return {
            ...c,
            ...(CARD_TRIVIA_MAP[cardKey] || {})
          };
        })
      ),
      catchError((err) => {
        this.toast.error('Gagal memuat katalog kartu dari server.', 'Koneksi Error');
        return throwError(() => err);
      })
    );
  }

  /**
   * Mengambil kartu milik user aktif (/api/cards/me)
   */
  getMyCards(): Observable<CardWithTrivia[]> {
    if (environment.useMock) {
      const user = this.auth.currentUser();
      const userId = user?.id;

      if (userId === 'siti-rahma' || userId === 'user-2') {
        return of([
          { ...ALL_28_CARDS[0], status: 'minted', tokenId: 201, txHash: '0x3f58a74e908b9821de837264aefc90226b87201c89320857321ff8b2c4e1a0b3' },
          { ...ALL_28_CARDS[1], status: 'minted', tokenId: 202, txHash: '0x7e8b23a9d18c04e28741369ef995bca2034918e7d23a19f993bcde448821019a' },
          { ...ALL_28_CARDS[2], status: 'pending-mint' },
          { ...ALL_28_CARDS[3], status: 'pending-mint' },
          { ...ALL_28_CARDS[12], status: 'minted', tokenId: 203, txHash: '0x91a25c19e84b721e0481239ab76110f2149021876a3e1b7123efcba129841829' },
          { ...ALL_28_CARDS[13], status: 'pending-mint' },
          { ...ALL_28_CARDS[21], status: 'minted', tokenId: 204, txHash: '0x8821bc09a47ef1294821a084efbc91238476101c89481204817294810238194a' }
        ]);
      }

      if (userId === 'gilang-ramadhan' || userId === 'user-3') {
        return of([
          { ...ALL_28_CARDS[16], status: 'pending-mint' }, // penguin
          { ...ALL_28_CARDS[17], status: 'pending-mint' }, // raccoon
          { ...ALL_28_CARDS[2], status: 'pending-mint' }   // corgi
        ]);
      }

      return of(DUMMY_USER_CARDS);
    }
    if (!this.auth.isAuthenticated() || !this.auth.getToken()) {
      return of([]);
    }
    return this.http.get<Card[]>(`${environment.apiUrl}/cards/me`, {
      headers: this.auth.getAuthHeaders()
    }).pipe(
      map((cards) =>
        cards.map((c) => {
          const cardKey = (c as any).cardId || c.id;
          return {
            ...c,
            id: cardKey,
            cardId: cardKey,
            ...(CARD_TRIVIA_MAP[cardKey] || {})
          };
        })
      ),
      catchError((err) => {
        this.toast.error('Gagal memuat koleksi kartu dari server.', 'Koneksi Error');
        return throwError(() => err);
      })
    );
  }

  /**
   * Mengambil papan kelangkaan 28 kartu (/api/cards/rarity-board)
   */
  getRarityBoard(): Observable<RarityBoardResponse> {
    if (environment.useMock) {
      return of(DUMMY_RARITY_BOARD);
    }
    return this.http.get<RarityBoardResponse>(`${environment.apiUrl}/cards/rarity-board`).pipe(
      catchError((err) => {
        this.toast.error('Gagal memuat papan kelangkaan dari server.', 'Koneksi Error');
        return throwError(() => err);
      })
    );
  }

  /**
   * Menghitung statistik kepemilikan koleksi per rarity
   */
  calculateCollectionState(allCards: Card[], ownedCards: Card[]): CardCollectionState {
    const ownedMap = new Set(ownedCards.map((c) => (c as any).cardId || c.id));
    const rarityWeights: Record<Rarity, number> = {
      Common: 55,
      Rare: 28,
      Epic: 12,
      Legendary: 5
    };

    const byRarity: Record<Rarity, { unlocked: number; total: number; weight: number }> = {
      Common: { unlocked: 0, total: 0, weight: rarityWeights.Common },
      Rare: { unlocked: 0, total: 0, weight: rarityWeights.Rare },
      Epic: { unlocked: 0, total: 0, weight: rarityWeights.Epic },
      Legendary: { unlocked: 0, total: 0, weight: rarityWeights.Legendary }
    };

    allCards.forEach((c) => {
      byRarity[c.rarity].total += 1;
      const key = (c as any).cardId || c.id;
      if (ownedMap.has(key)) {
        byRarity[c.rarity].unlocked += 1;
      }
    });

    return {
      totalCards: allCards.length,
      unlockedCount: ownedCards.length,
      byRarity
    };
  }
}
