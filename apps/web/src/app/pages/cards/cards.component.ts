import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { Card, Rarity } from 'shared';
import { AnimationService } from '../../core/utils/animation.service';
import { cardImageUrl, cardSilhouetteUrl, hasCardImage, onCardImageError } from '../../core/utils/card.util';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { RarityBadgeComponent } from '../../shared/components/rarity-badge/rarity-badge.component';
import { CardDetailModalComponent } from './card-detail-modal.component';
import { ALL_28_CARDS, CARD_TRIVIA_MAP, CardCollectionState, CardsService, RarityBoardCard, RarityBoardResponse } from './cards.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [
    CommonModule,
    RarityBadgeComponent,
    CardDetailModalComponent
  ],
  template: `
    <div class="container-app py-5 sm:py-10 space-y-6 sm:space-y-8">
      <!-- 1. Header Banner (Wizardshock Panel-Pixel, Rounded 12px) -->
      <div class="panel-pixel rounded-[12px] p-4 sm:p-8 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div class="flex items-center gap-2.5 sm:gap-3">
            <h1 class="font-pixel text-xl sm:text-3xl font-black text-ink uppercase tracking-tight">
              Koleksi: Simply is Sleeping
            </h1>
          </div>
          <p class="lead-pixel text-ink-muted mt-2 max-w-2xl text-xs sm:text-sm md:text-base">
            28 kartu hewan tidur 16-bit pixel art sebagai penghargaan streak tidur sehatmu. Setiap kartu disimpan permanen sebagai kartu koleksi.
          </p>
        </div>

        <!-- Lihat Semua Kartu & Stats Counter -->
        <div class="flex flex-col sm:items-end gap-2.5 sm:gap-3 shrink-0">
          <div class="flex items-center gap-2">
            <span class="font-pixel text-xs font-bold text-ink uppercase whitespace-nowrap">Koleksi Terbuka:</span>
            <span class="font-pixel text-sm sm:text-lg font-black text-brand-ink px-2.5 py-0.5 sm:px-3 sm:py-1 bg-brand-50 border-2 border-ink rounded-[6px] whitespace-nowrap">
              {{ currentUnlockedCount }} / {{ allCards.length }}
            </span>
          </div>

          <!-- Quick Toggle Lihat Semua Kartu (No Wrap, Full Width in Mobile) -->
          <button
            type="button"
            (click)="toggleJudgeMode()"
            class="btn-pixel btn-pixel--sm rounded-[8px] whitespace-nowrap font-bold uppercase cursor-pointer w-full sm:w-auto justify-center text-xs sm:text-sm"
            [ngClass]="judgeMode ? 'btn-pixel--sun' : 'btn-pixel--ghost'"
            aria-label="Toggle untuk menampilkan seluruh 28 kartu pratinjau"
            title="Mode pratinjau untuk melihat seluruh 28 kartu sekaligus"
          >
            <span>Lihat Semua Kartu:</span>
            <span class="underline ml-1 whitespace-nowrap">{{ judgeMode ? 'Buka Semua (Aktif)' : 'Mode Normal' }}</span>
          </button>
        </div>
      </div>

      <!-- 2. Dual Tab Navigation: 'Koleksiku' vs 'Kelangkaan' (Grid 2 Kolom Sama Lebar) -->
      <div class="grid grid-cols-2 gap-2 sm:gap-4 border-b-3 border-ink pb-3 select-none w-full">
        <button
          type="button"
          (click)="setTab('collection')"
          class="btn-pixel btn-pixel--sm rounded-[8px] whitespace-nowrap cursor-pointer text-xs sm:text-sm w-full justify-center px-1.5 sm:px-4"
          [ngClass]="activeTab === 'collection' ? '' : 'btn-pixel--ghost'"
          aria-label="Lihat tab Koleksiku"
        >
          <span>Koleksiku</span>
          <span class="ml-1 opacity-90 font-mono text-[10px] sm:text-xs">({{ currentUnlockedCount }}/{{ allCards.length }})</span>
        </button>

        <button
          type="button"
          (click)="setTab('rarity')"
          class="btn-pixel btn-pixel--sm rounded-[8px] whitespace-nowrap cursor-pointer text-xs sm:text-sm w-full justify-center px-1.5 sm:px-4"
          [ngClass]="activeTab === 'rarity' ? 'btn-pixel--sun' : 'btn-pixel--ghost'"
          aria-label="Lihat tab Kelangkaan"
        >
          <span>Kelangkaan</span>
          <span class="ml-1 opacity-90 font-mono text-[10px] sm:text-xs">({{ rarityBoard?.cards?.length || 28 }})</span>
        </button>
      </div>

      <!-- ================= TAB 1: KOLEKSIKU ================= -->
      @if (activeTab === 'collection') {
        <!-- Ringkasan Koleksi Berdasarkan Rarity -->
        <div class="panel-pixel rounded-[12px] overflow-hidden bg-surface">
          <div class="px-4 sm:px-5 py-2.5 sm:py-3 border-b-3 border-ink bg-brand-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="font-pixel text-xs sm:text-base font-bold text-ink uppercase tracking-wide">
                Ringkasan Koleksi & Peluang Drop
              </h2>
            </div>
            <span class="font-pixel text-[10px] sm:text-xs bg-brand-100 text-brand-ink border border-brand-200 px-2 py-0.5 font-bold uppercase rounded-[6px] whitespace-nowrap">
              Bobot Rarity
            </span>
          </div>

          <div class="p-3 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <!-- Common -->
            <div
              (click)="setFilter('Common')"
              class="panel-pixel rounded-[12px] p-2.5 sm:p-3 cursor-pointer transition-transform hover:-translate-y-0.5 text-center select-none"
              [ngClass]="activeFilter === 'Common' ? 'bg-brand-50' : 'bg-surface'"
            >
              <div class="flex items-center justify-between text-[11px] sm:text-xs mb-1">
                <span class="font-pixel font-bold text-ink">Common</span>
                <span class="text-[10px] text-ink-muted">55%</span>
              </div>
              <div class="font-pixel text-base sm:text-xl font-black text-ink">
                {{ stats ? stats.byRarity.Common.unlocked : 0 }} / {{ stats ? stats.byRarity.Common.total : 12 }}
              </div>
              <div class="w-full bg-paper border border-ink h-1.5 sm:h-2 overflow-hidden mt-1.5 rounded-[6px]">
                <div
                  class="bg-ink h-full transition-all duration-500 rounded-[6px]"
                  [style.width.%]="stats ? (stats.byRarity.Common.unlocked / stats.byRarity.Common.total) * 100 : 0"
                ></div>
              </div>
            </div>

            <!-- Rare -->
            <div
              (click)="setFilter('Rare')"
              class="panel-pixel rounded-[12px] p-2.5 sm:p-3 cursor-pointer transition-transform hover:-translate-y-0.5 text-center select-none"
              [ngClass]="activeFilter === 'Rare' ? 'bg-brand-50' : 'bg-surface'"
            >
              <div class="flex items-center justify-between text-[11px] sm:text-xs mb-1">
                <span class="font-pixel font-bold text-blue-600">Rare</span>
                <span class="text-[10px] text-ink-muted">28%</span>
              </div>
              <div class="font-pixel text-base sm:text-xl font-black text-blue-700">
                {{ stats ? stats.byRarity.Rare.unlocked : 0 }} / {{ stats ? stats.byRarity.Rare.total : 8 }}
              </div>
              <div class="w-full bg-paper border border-ink h-1.5 sm:h-2 overflow-hidden mt-1.5 rounded-[6px]">
                <div
                  class="bg-blue-600 h-full transition-all duration-500 rounded-[6px]"
                  [style.width.%]="stats ? (stats.byRarity.Rare.unlocked / stats.byRarity.Rare.total) * 100 : 0"
                ></div>
              </div>
            </div>

            <!-- Epic -->
            <div
              (click)="setFilter('Epic')"
              class="panel-pixel rounded-[12px] p-2.5 sm:p-3 cursor-pointer transition-transform hover:-translate-y-0.5 text-center select-none"
              [ngClass]="activeFilter === 'Epic' ? 'bg-brand-50' : 'bg-surface'"
            >
              <div class="flex items-center justify-between text-[11px] sm:text-xs mb-1">
                <span class="font-pixel font-bold text-purple-600">Epic</span>
                <span class="text-[10px] text-ink-muted">12%</span>
              </div>
              <div class="font-pixel text-base sm:text-xl font-black text-purple-700">
                {{ stats ? stats.byRarity.Epic.unlocked : 0 }} / {{ stats ? stats.byRarity.Epic.total : 5 }}
              </div>
              <div class="w-full bg-paper border border-ink h-1.5 sm:h-2 overflow-hidden mt-1.5 rounded-[6px]">
                <div
                  class="bg-purple-600 h-full transition-all duration-500 rounded-[6px]"
                  [style.width.%]="stats ? (stats.byRarity.Epic.unlocked / stats.byRarity.Epic.total) * 100 : 0"
                ></div>
              </div>
            </div>

            <!-- Legendary -->
            <div
              (click)="setFilter('Legendary')"
              class="panel-pixel rounded-[12px] p-2.5 sm:p-3 cursor-pointer transition-transform hover:-translate-y-0.5 text-center select-none"
              [ngClass]="activeFilter === 'Legendary' ? 'bg-brand-50' : 'bg-surface'"
            >
              <div class="flex items-center justify-between text-[11px] sm:text-xs mb-1">
                <span class="font-pixel font-bold text-amber-700">Legendary</span>
                <span class="text-[10px] text-ink-muted">5%</span>
              </div>
              <div class="font-pixel text-base sm:text-xl font-black text-amber-800">
                {{ stats ? stats.byRarity.Legendary.unlocked : 0 }} / {{ stats ? stats.byRarity.Legendary.total : 3 }}
              </div>
              <div class="w-full bg-paper border border-ink h-1.5 sm:h-2 overflow-hidden mt-1.5 rounded-[6px]">
                <div
                  class="bg-sun h-full transition-all duration-500 rounded-[6px]"
                  [style.width.%]="stats ? (stats.byRarity.Legendary.unlocked / stats.byRarity.Legendary.total) * 100 : 0"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs (Chunky Pixel Buttons, Rounded 8px, Scrollable on Mobile <= 344px) -->
        <div class="filter-buttons-row flex items-center gap-2 overflow-x-auto pt-1 pb-2.5 px-0.5 select-none scroll-smooth snap-x">
          <button
            type="button"
            (click)="setFilter('ALL')"
            [attr.aria-pressed]="activeFilter === 'ALL'"
            class="filter-btn snap-start"
            [class.filter-btn--active]="activeFilter === 'ALL'"
          >
            Semua ({{ allCards.length }})
          </button>

          <button
            type="button"
            (click)="setFilter('Common')"
            [attr.aria-pressed]="activeFilter === 'Common'"
            class="filter-btn snap-start"
            [class.filter-btn--active]="activeFilter === 'Common'"
          >
            Common (12)
          </button>

          <button
            type="button"
            (click)="setFilter('Rare')"
            [attr.aria-pressed]="activeFilter === 'Rare'"
            class="filter-btn snap-start"
            [class.filter-btn--active]="activeFilter === 'Rare'"
          >
            Rare (8)
          </button>

          <button
            type="button"
            (click)="setFilter('Epic')"
            [attr.aria-pressed]="activeFilter === 'Epic'"
            class="filter-btn snap-start"
            [class.filter-btn--active]="activeFilter === 'Epic'"
          >
            Epic (5)
          </button>

          <button
            type="button"
            (click)="setFilter('Legendary')"
            [attr.aria-pressed]="activeFilter === 'Legendary'"
            class="filter-btn snap-start"
            [class.filter-btn--active]="activeFilter === 'Legendary'"
          >
            Legendary (3)
          </button>
        </div>

        <!-- WIZARDSHOCK CHARACTER GALLERY (Grid 4 Kolom Laptop/Desktop >=1024 / 3 Kolom 673-1023 / 2 Kolom 360-672 / 1 Kolom <360) -->
        <div #gridContainer class="cards-collection-grid grid grid-cols-1 min-[360px]:grid-cols-2 min-[673px]:grid-cols-3 min-[1024px]:grid-cols-4 gap-3 min-[360px]:gap-4 sm:gap-5">
          @for (card of filteredCards; track card.id) {
            @let unlocked = isCardUnlocked(card.id);

            <div
              class="card-item panel-pixel rounded-[12px] p-3 sm:p-3.5 lg:p-3 xl:p-4 flex flex-col justify-between bg-surface hover:-translate-y-1 transition-all duration-200"
              [ngClass]="unlocked ? '' : 'opacity-95'"
            >
              <!-- Top Section: Square Image + Badges -->
              <div>
                <!-- Square Image (1:1 Ratio, Rounded 8px) -->
                <div
                  class="relative w-full aspect-square border-2 border-ink overflow-hidden mb-2 sm:mb-2.5 flex items-center justify-center rounded-[8px] p-1.5 sm:p-2"
                  [ngClass]="unlocked ? 'bg-brand-50' : getSoftRarityBgClass(card.rarity)"
                >
                  @if (unlocked) {
                    <!-- Unlocked Image (Full Color) -->
                    @if (hasImage(card.id)) {
                      <img
                        [src]="getCardUrl(card.id)"
                        [alt]="card.name"
                        (error)="onGridImageError($event, card)"
                        class="w-full h-full object-cover pixelated rounded-[8px]"
                      />
                    } @else {
                      <div class="w-full h-full flex flex-col items-center justify-center text-center p-2 select-none">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 border-2 border-ink bg-surface flex items-center justify-center font-pixel text-xl sm:text-2xl font-bold mb-1 rounded-[8px] pixel-shadow-sm text-ink">
                          ?
                        </div>
                        <span class="font-pixel text-[9px] sm:text-[10px] font-bold text-ink uppercase tracking-wider rounded-[6px] whitespace-nowrap">
                          Segera Hadir
                        </span>
                      </div>
                    }

                    <!-- Status Pill bottom-left -->
                    @if (getCardStatus(card.id) === 'minted') {
                      <span class="absolute bottom-1.5 left-1.5 font-pixel text-[8px] sm:text-[9px] bg-success text-white px-1 sm:px-1.5 py-0.5 border border-ink font-bold uppercase rounded-[5px] whitespace-nowrap">
                        ✓ Tersimpan
                      </span>
                    }
                  } @else if (hasImage(card.id) && !failedSilhouettes.has(card.id)) {
                    <!-- Locked Animal Silhouette (HANYA muat siluet jika file ada) -->
                    <img
                      [src]="getSilhouetteUrl(card.id)"
                      [alt]="'Siluet ' + card.name"
                      (error)="onSilhouetteError(card.id)"
                      class="w-full h-full object-contain pixelated rounded-[8px]"
                    />
                  } @else {
                    <!-- Locked Placeholder with '?' and Soft Rarity Background -->
                    <div class="w-full h-full flex flex-col items-center justify-center text-center p-2 select-none">
                      <div class="w-10 h-10 sm:w-12 sm:h-12 border-2 border-ink bg-surface flex items-center justify-center font-pixel text-xl sm:text-2xl font-bold mb-1 rounded-[8px] pixel-shadow-sm text-ink">
                        ?
                      </div>
                      <span class="font-pixel text-[9px] sm:text-[10px] font-bold text-ink uppercase tracking-wider rounded-[6px] whitespace-nowrap">
                        Belum Terbuka
                      </span>
                    </div>
                  }

                  <!-- Rarity Badge floating top-right (Selalu Terlihat, Tidak Menimpa Gambar) -->
                  <div class="absolute top-1.5 right-1.5 z-10 pointer-events-none">
                    <app-rarity-badge [rarity]="card.rarity" size="sm"></app-rarity-badge>
                  </div>
                </div>

                <!-- Name as Pixel Heading: Ukuran proporsional agar tidak terpotong saat 4 kolom -->
                <h3
                  class="font-pixel text-xs sm:text-sm lg:text-xs xl:text-sm font-bold text-ink uppercase tracking-wide leading-tight truncate"
                  [title]="unlocked ? card.name : '???'"
                >
                  {{ unlocked ? card.name : '???' }}
                </h3>

                <!-- Chunky 'Lihat' Button (Rounded 8px, No Wrap) -->
                <button
                  type="button"
                  (click)="openCardDetail(card, unlocked)"
                  class="btn-pixel btn-pixel--sm rounded-[8px] whitespace-nowrap w-full my-1.5 sm:my-2 cursor-pointer text-[11px] sm:text-xs py-1 sm:py-1.5"
                  [ngClass]="unlocked ? '' : 'btn-pixel--ghost'"
                  [attr.aria-label]="(unlocked ? 'Lihat detail kartu ' : 'Inspeksi siluet kartu ') + (unlocked ? card.name : 'Misteri')"
                >
                  {{ unlocked ? 'LIHAT' : 'LIHAT SILUET' }}
                </button>

                <!-- Paragraf Bio Lucu (Wizardshock Bio) -->
                <p class="text-[11px] sm:text-xs text-ink-muted leading-relaxed font-sans line-clamp-2 mt-0.5">
                  "{{ unlocked ? card.description : 'Masih ngorok di tempat lain. Tidur sehat buat membangunkannya.' }}"
                </p>
              </div>

              <!-- Card Bottom Bar -->
              <div class="mt-2 pt-1.5 sm:pt-2 border-t-2 border-ink flex items-center justify-between text-[11px] sm:text-xs font-pixel">
                <span class="font-bold uppercase whitespace-nowrap" [ngClass]="getRarityTextColor(card.rarity)">
                  {{ card.rarity }}
                </span>
                <span class="font-mono text-ink-muted text-[10px] sm:text-[11px] whitespace-nowrap">
                  #{{ card.id }}
                </span>
              </div>
            </div>
          }
        </div>
      }

      <!-- ================= TAB 2: PAPAN KELANGKAAN ================= -->
      @if (activeTab === 'rarity') {
        <!-- Penjelasan Papan Kelangkaan -->
        <div class="panel-pixel rounded-[12px] p-4 sm:p-6 bg-surface space-y-2">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-ink pb-2.5">
            <div class="flex items-center gap-2">
              <h2 class="font-pixel text-base sm:text-xl font-black text-ink uppercase tracking-wide">
                Papan Kelangkaan Kartu SimpliSleep
              </h2>
            </div>
            <span class="font-pixel text-xs bg-brand-50 border border-brand-200 text-brand-ink px-2.5 py-1 font-bold uppercase rounded-[6px] self-start sm:self-auto whitespace-nowrap">
              Total: {{ rarityBoard?.totalUsers || 12 }} SimpliMates
            </span>
          </div>

          <p class="text-xs sm:text-sm text-ink leading-relaxed font-sans">
            <strong class="text-brand-ink font-bold">Makin sedikit pemilik, makin tinggi peringkatnya.</strong> Peringkat 1 menandakan kartu paling langka atau bahkan belum ditemukan sama sekali di seluruh ekosistem tidur SimpliDOTS.
          </p>
        </div>

        <!-- Filter Rarity untuk Papan Kelangkaan -->
        <div class="filter-buttons-row flex items-center gap-2 overflow-x-auto pt-1 pb-2.5 px-0.5 select-none scroll-smooth snap-x">
          <button
            type="button"
            (click)="setRarityFilter('ALL')"
            [attr.aria-pressed]="rarityFilter === 'ALL'"
            class="filter-btn snap-start"
            [class.filter-btn--active]="rarityFilter === 'ALL'"
          >
            Semua ({{ rarityBoard?.cards?.length || 28 }})
          </button>

          <button
            type="button"
            (click)="setRarityFilter('Legendary')"
            [attr.aria-pressed]="rarityFilter === 'Legendary'"
            class="filter-btn snap-start"
            [class.filter-btn--active]="rarityFilter === 'Legendary'"
          >
            Legendary (3)
          </button>

          <button
            type="button"
            (click)="setRarityFilter('Epic')"
            [attr.aria-pressed]="rarityFilter === 'Epic'"
            class="filter-btn snap-start"
            [class.filter-btn--active]="rarityFilter === 'Epic'"
          >
            Epic (5)
          </button>

          <button
            type="button"
            (click)="setRarityFilter('Rare')"
            [attr.aria-pressed]="rarityFilter === 'Rare'"
            class="filter-btn snap-start"
            [class.filter-btn--active]="rarityFilter === 'Rare'"
          >
            Rare (8)
          </button>

          <button
            type="button"
            (click)="setRarityFilter('Common')"
            [attr.aria-pressed]="rarityFilter === 'Common'"
            class="filter-btn snap-start"
            [class.filter-btn--active]="rarityFilter === 'Common'"
          >
            Common (12)
          </button>
        </div>

        <!-- Daftar Peringkat Kelangkaan (28 Kartu) -->
        <div class="space-y-3">
          @for (item of filteredRarityCards; track item.cardId) {
            @let unlocked = isCardUnlocked(item.cardId);
            @let isTop1 = item.rank === 1;
            @let isTop2 = item.rank === 2;
            @let isTop3 = item.rank === 3;

            <div
              class="panel-pixel rounded-[12px] p-3 sm:p-4 bg-surface hover:-translate-y-0.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              [ngClass]="{
                'border-sun ring-2 ring-sun/30': isTop1,
                'border-brand-200': isTop2 || isTop3
              }"
            >
              <!-- Kiri: Rank Pill + Thumbnail + Title/Rarity + Ownership -->
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <!-- Rank Pill dengan Aksen untuk Peringkat 1-3 -->
                <div
                  class="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center font-pixel text-xs sm:text-base font-black border-2 border-ink rounded-[6px] shrink-0"
                  [ngClass]="getRankBadgeClass(item.rank)"
                >
                  #{{ item.rank }}
                </div>

                <!-- Thumbnail (Siluet bila belum dimiliki, tanpa muat gambar asli) -->
                <div
                  class="relative w-12 h-12 sm:w-16 sm:h-16 border-2 border-ink rounded-[8px] overflow-hidden shrink-0 flex items-center justify-center p-1"
                  [ngClass]="unlocked ? 'bg-brand-50' : getSoftRarityBgClass(item.rarity)"
                >
                  @if (unlocked) {
                    @if (hasImage(item.cardId)) {
                      <img
                        [src]="getCardUrl(item.cardId)"
                        [alt]="item.name"
                        (error)="onRarityThumbError($event, item)"
                        class="w-full h-full object-cover pixelated rounded-[8px]"
                      />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center font-pixel text-lg sm:text-xl font-bold text-ink">
                        ?
                      </div>
                    }
                  } @else if (hasImage(item.cardId) && !failedSilhouettes.has(item.cardId)) {
                    <img
                      [src]="getSilhouetteUrl(item.cardId)"
                      [alt]="'Siluet ' + item.name"
                      (error)="onSilhouetteError(item.cardId)"
                      class="w-full h-full object-contain pixelated rounded-[8px]"
                    />
                  } @else {
                    <div class="w-full h-full flex items-center justify-center font-pixel text-lg sm:text-xl font-bold text-ink">
                      ?
                    </div>
                  }
                </div>

                <!-- Info Kolom -->
                <div class="min-w-0 flex-1 space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-pixel text-sm sm:text-lg font-bold text-ink uppercase truncate">
                      {{ unlocked ? item.name : '???' }}
                    </h3>
                    <app-rarity-badge [rarity]="item.rarity" size="sm"></app-rarity-badge>

                    @if (item.owners === 0) {
                      <span class="font-pixel text-[10px] sm:text-[11px] bg-brand-50 text-brand-ink border-2 border-brand-200 px-2.5 py-0.5 font-bold uppercase rounded-[6px] whitespace-nowrap">
                        Belum Ditemukan
                      </span>
                    }
                  </div>

                  <!-- Bar & Informasi Kepemilikan -->
                  <div class="flex items-center gap-2 sm:gap-3 flex-wrap text-xs text-ink-muted">
                    <span class="font-sans whitespace-nowrap">
                      Dimiliki <strong class="text-ink font-bold">{{ item.owners }}</strong> dari {{ rarityBoard?.totalUsers || 12 }} SimpliMates
                    </span>

                    <!-- Mini progress bar -->
                    <div class="flex items-center gap-1.5 shrink-0">
                      <div class="w-16 sm:w-24 bg-paper border border-ink h-2 rounded-[6px] overflow-hidden">
                        <div
                          class="h-full bg-brand rounded-[6px]"
                          [style.width.%]="item.ownedPct"
                        ></div>
                      </div>
                      <span class="font-mono text-[10px] sm:text-[11px] text-ink whitespace-nowrap">{{ item.ownedPct }}%</span>
                    </div>

                    @if (item.copies > item.owners) {
                      <span class="text-[10px] text-ink-muted font-mono whitespace-nowrap">
                        ({{ item.copies }} salinan)
                      </span>
                    }
                  </div>
                </div>
              </div>

              <!-- Kanan: Tombol Aksi Chunky -->
              <div class="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink/10">
                <button
                  type="button"
                  (click)="openRarityCardDetail(item)"
                  class="btn-pixel btn-pixel--sm rounded-[8px] whitespace-nowrap w-full sm:w-auto cursor-pointer text-xs sm:text-sm"
                  [ngClass]="unlocked ? '' : 'btn-pixel--ghost'"
                  [attr.aria-label]="(unlocked ? 'Lihat detail ' : 'Inspeksi siluet ') + (unlocked ? item.name : 'kartu misteri')"
                >
                  {{ unlocked ? 'LIHAT' : 'LIHAT SILUET' }}
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Detail Modal (Bisa menampilkan versi terbuka atau versi siluet) -->
      @if (selectedCard) {
        <app-card-detail-modal
          [card]="selectedCard"
          [isUnlocked]="selectedCardUnlocked"
          (close)="closeModal()"
        ></app-card-detail-modal>
      }
    </div>
  `,
  styles: [`
    :host .panel-pixel {
      border-radius: 12px;
    }
    :host .btn-pixel {
      border-radius: 8px;
      white-space: nowrap;
    }
    .filter-buttons-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding-top: 0.25rem;
      padding-bottom: 0.625rem;
      padding-left: 0.125rem;
      padding-right: 0.125rem;
      user-select: none;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      scrollbar-width: thin;
      scrollbar-color: var(--color-ink) transparent;
      -webkit-overflow-scrolling: touch;
    }
    .filter-buttons-row::-webkit-scrollbar {
      height: 4px;
    }
    .filter-buttons-row::-webkit-scrollbar-thumb {
      background: var(--color-ink);
      border-radius: 4px;
    }
    .filter-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 40px;
      height: 40px;
      padding: 0 0.875rem;
      font-family: var(--font-pixel, monospace);
      font-weight: 700;
      font-size: 0.8125rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
      flex-shrink: 0;
      scroll-snap-align: start;
      color: var(--color-ink, #141414);
      background-color: var(--color-surface, #ffffff);
      border: 2px solid var(--color-ink, #141414);
      border-radius: 8px;
      box-shadow: 4px 4px 0px var(--color-ink, #141414);
      cursor: pointer;
      user-select: none;
      transform: translate(0, 0);
      transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.15s ease, color 0.15s ease;
      vertical-align: middle;
      line-height: 1;
      box-sizing: border-box;
    }
    @media (min-width: 640px) {
      .filter-btn {
        padding: 0 1.125rem;
        font-size: 0.875rem;
      }
    }
    .filter-btn:hover:not(.filter-btn--active) {
      background-color: var(--color-brand-50, #fff1f4);
      color: var(--color-brand-ink, #c21f42);
    }
    .filter-btn:active:not(.filter-btn--active) {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0px var(--color-ink, #141414);
    }
    .filter-btn--active {
      background-color: var(--color-sun, #ffc93c) !important;
      color: var(--color-ink, #141414) !important;
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0px var(--color-ink, #141414) !important;
    }
    .filter-btn--active:hover {
      background-color: #ffd866 !important;
    }
    .filter-btn:focus-visible {
      outline: 3px solid var(--color-brand-ink, #c21f42);
      outline-offset: 2px;
    }
    .cards-collection-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 0.75rem;
    }
    @media (min-width: 360px) {
      .cards-collection-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }
    }
    @media (min-width: 673px) {
      .cards-collection-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1.25rem;
      }
    }
    @media (min-width: 1024px) {
      .cards-collection-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1.25rem;
      }
    }
  `]
})
export class CardsComponent implements OnInit, AfterViewInit {
  private cardsService = inject(CardsService);
  private auth = inject(AuthService);
  private anim = inject(AnimationService);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);

  @ViewChild('gridContainer') gridContainer!: ElementRef<HTMLElement>;

  // Tab State: 'collection' | 'rarity'
  activeTab: 'collection' | 'rarity' = 'collection';

  allCards: Card[] = ALL_28_CARDS;
  ownedCards: Card[] = [];
  stats!: CardCollectionState;
  rarityBoard: RarityBoardResponse | null = null;

  activeFilter: 'ALL' | Rarity = 'ALL';
  rarityFilter: 'ALL' | Rarity = 'ALL';

  selectedCard: Card | null = null;
  selectedCardUnlocked = false;
  judgeMode = false;
  failedSilhouettes = new Set<string>();

  get currentUnlockedCount(): number {
    return this.judgeMode ? this.allCards.length : this.ownedCards.length;
  }

  get filteredCards(): Card[] {
    if (this.activeFilter === 'ALL') {
      return this.allCards;
    }
    return this.allCards.filter((c) => c.rarity === this.activeFilter);
  }

  get filteredRarityCards(): RarityBoardCard[] {
    const list = this.rarityBoard?.cards || [];
    if (this.rarityFilter === 'ALL') {
      return list;
    }
    return list.filter((c) => c.rarity === this.rarityFilter);
  }

  hasImage(cardId: string): boolean {
    return hasCardImage(cardId);
  }

  getCardUrl(cardId: string): string {
    return cardImageUrl(cardId);
  }

  getSilhouetteUrl(cardId: string): string {
    return cardSilhouetteUrl(cardId);
  }

  onSilhouetteError(cardId: string): void {
    this.failedSilhouettes.add(cardId);
  }

  getSoftRarityBgClass(rarity: Rarity): string {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-50';
      case 'Epic':
        return 'bg-purple-50';
      case 'Rare':
        return 'bg-blue-50';
      case 'Common':
      default:
        return 'bg-brand-50';
    }
  }

  ngOnInit(): void {
    this.cardsService.getCatalog().subscribe((cards) => {
      this.allCards = cards;
      this.refreshStats();
    });

    if (this.auth.isAuthenticated() && this.auth.getToken()) {
      this.cardsService.getMyCards().subscribe((owned) => {
        this.ownedCards = owned;
        this.refreshStats();
      });
    } else {
      this.ownedCards = [];
      this.refreshStats();
    }

    this.cardsService.getRarityBoard().subscribe((board) => {
      this.rarityBoard = board;
    });
  }

  ngAfterViewInit(): void {
    if (!this.anim.isReducedMotion()) {
      this.anim.animateLeaderboardRows('.card-item', this.destroyRef);
    }
  }

  refreshStats(): void {
    const activeOwned = this.judgeMode ? this.allCards : this.ownedCards;
    this.stats = this.cardsService.calculateCollectionState(this.allCards, activeOwned);
  }

  setTab(tab: 'collection' | 'rarity'): void {
    this.activeTab = tab;
  }

  setFilter(filter: 'ALL' | Rarity): void {
    this.activeFilter = filter;
  }

  setRarityFilter(filter: 'ALL' | Rarity): void {
    this.rarityFilter = filter;
  }

  toggleJudgeMode(): void {
    this.judgeMode = !this.judgeMode;
    this.refreshStats();
    if (this.judgeMode) {
      this.toast.warning('Semua 28 kartu ditampilkan untuk pratinjau.', 'Pratinjau');
    } else {
      this.toast.info('Mode Normal aktif: Hanya kartu milikmu yang terbuka.', 'Mode Normal');
    }
  }

  isCardUnlocked(cardId: string): boolean {
    if (this.judgeMode) return true;
    return this.ownedCards.some((c) => ((c as any).cardId || c.id) === cardId);
  }

  getCardStatus(cardId: string): string | undefined {
    const card = this.ownedCards.find((c) => ((c as any).cardId || c.id) === cardId);
    return card?.status;
  }

  openCardDetail(card: Card, unlocked: boolean): void {
    const cardKey = (card as any).cardId || card.id;
    const owned = this.ownedCards.find((c) => (c as any).cardId === cardKey || c.id === cardKey);
    this.selectedCard = {
      ...(owned || card),
      id: card.id || cardKey,
      ...(CARD_TRIVIA_MAP[cardKey] || {})
    };
    this.selectedCardUnlocked = unlocked;
    if (!unlocked) {
      this.toast.info('Kartu siluet: Belum terbuka di koleksimu.', 'Kartu Terkunci');
    }
  }

  openRarityCardDetail(boardCard: RarityBoardCard): void {
    const card = this.allCards.find((c) => c.id === boardCard.cardId);
    if (card) {
      this.openCardDetail(card, this.isCardUnlocked(card.id));
    }
  }

  closeModal(): void {
    this.selectedCard = null;
  }

  getRarityTextColor(rarity: Rarity): string {
    switch (rarity) {
      case 'Legendary':
        return 'text-amber-800 font-bold';
      case 'Epic':
        return 'text-purple-700 font-bold';
      case 'Rare':
        return 'text-blue-700 font-bold';
      case 'Common':
      default:
        return 'text-ink-muted font-bold';
    }
  }

  getRarityBgClass(rarity: Rarity): string {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-100 border-amber-400 text-amber-900';
      case 'Epic':
        return 'bg-purple-100 border-purple-400 text-purple-900';
      case 'Rare':
        return 'bg-blue-100 border-blue-400 text-blue-900';
      case 'Common':
      default:
        return 'bg-brand-50 border-brand-200 text-brand-ink';
    }
  }

  getRankBadgeClass(rank: number): string {
    switch (rank) {
      case 1:
        return 'bg-sun text-ink shadow-[2px_2px_0px_#141414]';
      case 2:
        return 'bg-brand-200 text-brand-ink shadow-[2px_2px_0px_#141414]';
      case 3:
        return 'bg-brand-100 text-brand-ink shadow-[2px_2px_0px_#141414]';
      default:
        return 'bg-paper text-ink';
    }
  }

  onGridImageError(event: Event, card: Card): void {
    onCardImageError(event, card.name, card.rarity);
  }

  onRarityThumbError(event: Event, item: RarityBoardCard): void {
    onCardImageError(event, item.name, item.rarity);
  }
}
