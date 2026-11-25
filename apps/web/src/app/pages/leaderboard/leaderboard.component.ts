import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeaderboardRow } from 'shared';
import { AuthService } from '../../core/services/auth.service';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { ToastService } from '../../core/services/toast.service';
import { LeaderboardResponse } from '../../core/services/mock-data';
import { AnimationService } from '../../core/utils/animation.service';
import { keccakLeaderboard } from '../../core/utils/keccak.util';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { DUMMY_TRANSPARENCY_RECORDS, TransparencyRecord, TransparencyService, computeMockWeekHash } from '../transparency/transparency.service';

interface OnChainVerificationResult {
  isMatch: boolean;
  computedHash: string;
  expectedHash: string;
  timestamp: string;
}

@Component({
  selector: 'app-leaderboard',
  imports: [
    CommonModule,
    RouterLink,
    AvatarComponent
  ],
  styles: [`
    :host {
      display: block;
    }
    .lead-pixel {
      font-family: var(--font-pixel, 'Pixelify Sans', monospace);
      font-size: 1.25rem;
      line-height: 1.35;
    }
    @media (min-width: 768px) {
      .lead-pixel {
        font-size: 1.5rem;
      }
    }
    .panel-pixel {
      background-color: var(--color-surface, #FFFFFF);
      border: 3px solid var(--color-ink, #141414);
      box-shadow: 6px 6px 0px var(--color-ink, #141414);
      border-radius: 12px;
    }
    .btn-pixel {
      background-color: var(--color-brand-strong, #D42A4C);
      color: #FFFFFF;
      font-family: var(--font-pixel, 'Pixelify Sans', monospace);
      font-weight: 700;
      text-transform: uppercase;
      padding: 12px 18px 11px;
      border-right: 6px solid var(--color-ink, #141414);
      border-bottom: 6px solid var(--color-ink, #141414);
      border-top: 2px solid var(--color-ink, #141414);
      border-left: 2px solid var(--color-ink, #141414);
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.1s ease, background-color 0.15s ease;
      user-select: none;
      text-decoration: none;
      min-height: 44px;
      white-space: nowrap;
    }
    .btn-pixel:hover:not(:disabled) {
      transform: translateY(-3px);
      background-color: var(--color-brand, #EC385B);
    }
    .btn-pixel:active:not(:disabled) {
      transform: translateY(0);
    }
    .btn-pixel:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }
    .btn-pixel--ghost {
      background-color: var(--color-surface, #FFFFFF);
      color: var(--color-ink, #141414);
      border: 2px solid var(--color-ink, #141414);
      box-shadow: 4px 4px 0px var(--color-ink, #141414);
      border-radius: 8px;
    }
    .btn-pixel--ghost:hover:not(:disabled) {
      background-color: var(--color-brand-50, #FFF1F4);
      color: var(--color-brand-ink, #C21F42);
    }
    .btn-pixel--sun {
      background-color: var(--color-sun, #FFC93C);
      color: var(--color-ink, #141414);
      border-radius: 8px;
    }
    .btn-pixel--sun:hover:not(:disabled) {
      background-color: #FFE082;
    }
    .btn-pixel--sm {
      padding: 8px 14px;
      font-size: 0.8125rem;
      border-right-width: 4px;
      border-bottom-width: 4px;
      border-radius: 8px;
      min-height: 44px;
      white-space: nowrap;
    }
    .btn-pixel--xs {
      padding: 4px 8px;
      font-size: 0.6875rem;
      border-right-width: 3px;
      border-bottom-width: 3px;
      border-radius: 6px;
      min-height: 28px;
      white-space: nowrap;
    }
    .pixelated {
      image-rendering: pixelated;
    }
    ::ng-deep app-avatar,
    ::ng-deep app-avatar > div,
    ::ng-deep app-avatar > div > div {
      border-radius: 8px !important;
      overflow: hidden;
    }
    @media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `],
  template: `
    <div class="container-app py-6 sm:py-8 space-y-6 sm:space-y-8">
      <!-- Header & Week Selector Bar -->
      <div class="panel-pixel rounded-[12px] p-4 sm:p-6 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <h1 class="font-pixel text-xl sm:text-3xl md:text-4xl font-bold text-ink uppercase tracking-tight">
              Leaderboard SimpliMates
            </h1>
            <!-- On-Chain Status Badge dekat judul minggu -->
            <button
              type="button"
              (click)="openVerificationPopup()"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border-2 border-ink text-[11px] sm:text-xs font-pixel font-bold uppercase transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer select-none"
              [ngClass]="currentWeekCommitStatus() === 'committed'
                ? 'bg-brand-50 text-brand-ink [box-shadow:2px_2px_0_#141414]'
                : 'bg-sun/40 text-ink [box-shadow:2px_2px_0_#141414]'"
              [attr.aria-label]="(currentWeekCommitStatus() === 'committed' ? 'Terverifikasi' : 'Menunggu verifikasi') + '. Klik untuk cek status.'"
            >
              <span
                class="w-2 h-2 rounded-full border border-ink"
                [ngClass]="currentWeekCommitStatus() === 'committed' ? 'bg-brand animate-pulse' : 'bg-sun'"
                aria-hidden="true"
              ></span>
              <span>{{ currentWeekCommitStatus() === 'committed' ? 'Terverifikasi' : 'Menunggu verifikasi' }}</span>
            </button>
          </div>
          <p class="font-pixel text-xs sm:text-sm md:lead-pixel text-ink-muted mt-1.5 leading-snug">
            Peringkat kebiasaan tidur sehat karyawan SimpliDOTS (Senin – Minggu, WIB).
          </p>
        </div>

        <!-- Week Picker -->
        <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <label for="week-select" class="font-pixel text-xs text-ink uppercase font-bold whitespace-nowrap">Minggu:</label>
          <select
            id="week-select"
            [value]="selectedWeek()"
            (change)="onWeekChange($event)"
            aria-label="Pilih minggu periode leaderboard"
            class="font-pixel text-xs sm:text-sm min-h-[44px] bg-surface border-2 border-ink px-3 py-2 rounded-[8px] font-bold text-brand-ink [box-shadow:3px_3px_0_#141414] focus:outline-none focus:ring-2 focus:ring-brand-ink cursor-pointer whitespace-nowrap"
          >
            <option value="2026-W47">2026-W47 (Minggu Ini)</option>
            <option value="2026-W46">2026-W46 (Minggu Lalu)</option>
            <option value="2026-W45">2026-W45 (2 Minggu Lalu)</option>
          </select>
        </div>
      </div>

      <!-- 3 Category Highlights -->
      @if (leaderboardData(); as data) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <!-- Kategori 1: Paling Konsisten -->
          <div class="panel-pixel rounded-[12px] p-4 sm:p-5 bg-surface">
            <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b-2 border-brand-100 pb-2 mb-3">
              <div class="flex items-center gap-1.5 min-w-0">
                <h3 class="font-pixel text-xs sm:text-sm md:text-base font-bold text-ink uppercase">
                  Paling Konsisten
                </h3>
              </div>
              <span class="font-pixel text-[10px] sm:text-xs bg-brand-50 text-brand-ink border border-ink rounded-[6px] px-2 py-0.5 font-bold uppercase shrink-0 whitespace-nowrap">
                Konsistensi
              </span>
            </div>
            <div class="flex items-center gap-3">
              <app-avatar
                [name]="data.categories.mostConsistent.name"
                [avatar]="data.categories.mostConsistent.avatar || 'user-2'"
                size="md"
                class="rounded-[8px] overflow-hidden shrink-0"
              ></app-avatar>
              <div class="min-w-0">
                <h4 class="font-sans font-bold text-xs sm:text-sm text-ink truncate">
                  {{ data.categories.mostConsistent.name }}
                </h4>
                <p class="font-pixel text-xs sm:text-sm font-bold text-brand-ink whitespace-nowrap">
                  Skor: {{ data.categories.mostConsistent.avgScore }}
                </p>
                <p class="font-sans text-[11px] sm:text-xs text-ink-muted truncate mt-0.5">
                  {{ data.categories.mostConsistent.highlightStat }}
                </p>
              </div>
            </div>
          </div>

          <!-- Kategori 2: Paling Membaik -->
          <div class="panel-pixel rounded-[12px] p-4 sm:p-5 bg-surface">
            <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b-2 border-brand-100 pb-2 mb-3">
              <div class="flex items-center gap-1.5 min-w-0">
                <h3 class="font-pixel text-xs sm:text-sm md:text-base font-bold text-ink uppercase">
                  Paling Membaik
                </h3>
              </div>
              <span class="font-pixel text-[10px] sm:text-xs bg-sun text-ink border border-ink rounded-[6px] px-2 py-0.5 font-bold uppercase shrink-0 whitespace-nowrap">
                Progress
              </span>
            </div>
            <div class="flex items-center gap-3">
              <app-avatar
                [name]="data.categories.mostImproved.name"
                [avatar]="data.categories.mostImproved.avatar || 'user-3'"
                size="md"
                class="rounded-[8px] overflow-hidden shrink-0"
              ></app-avatar>
              <div class="min-w-0">
                <h4 class="font-sans font-bold text-xs sm:text-sm text-ink truncate">
                  {{ data.categories.mostImproved.name }}
                </h4>
                <p class="font-pixel text-xs sm:text-sm font-bold text-brand-ink whitespace-nowrap">
                  Skor: {{ data.categories.mostImproved.avgScore }}
                </p>
                <p class="font-sans text-[11px] sm:text-xs text-ink-muted truncate mt-0.5">
                  {{ data.categories.mostImproved.highlightStat }}
                </p>
              </div>
            </div>
          </div>

          <!-- Kategori 3: Streak Terpanjang -->
          <div class="panel-pixel rounded-[12px] p-4 sm:p-5 bg-surface">
            <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b-2 border-brand-100 pb-2 mb-3">
              <div class="flex items-center gap-1.5 min-w-0">
                <h3 class="font-pixel text-xs sm:text-sm md:text-base font-bold text-ink uppercase">
                  Streak Terpanjang
                </h3>
              </div>
              <span class="font-pixel text-[10px] sm:text-xs bg-brand-50 text-brand-ink border border-ink rounded-[6px] px-2 py-0.5 font-bold uppercase shrink-0 whitespace-nowrap">
                Ketahanan
              </span>
            </div>
            <div class="flex items-center gap-3">
              <app-avatar
                [name]="data.categories.longestStreak.name"
                [avatar]="data.categories.longestStreak.avatar || 'user-10'"
                size="md"
                class="rounded-[8px] overflow-hidden shrink-0"
              ></app-avatar>
              <div class="min-w-0">
                <h4 class="font-sans font-bold text-xs sm:text-sm text-ink truncate">
                  {{ data.categories.longestStreak.name }}
                </h4>
                <p class="font-pixel text-xs sm:text-sm font-bold text-brand-ink whitespace-nowrap">
                  {{ data.categories.longestStreak.streak }} Malam Beruntun
                </p>
                <p class="font-sans text-[11px] sm:text-xs text-ink-muted truncate mt-0.5">
                  {{ data.categories.longestStreak.highlightStat }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Top 3 Podium -->
        <div class="panel-pixel rounded-[12px] p-4 sm:p-8 bg-surface">
          <div class="text-center mb-5 sm:mb-6">
            <div class="inline-flex items-center justify-center gap-2 flex-wrap">
              <h2 class="font-pixel text-lg sm:text-2xl font-bold text-ink uppercase">
                Podium Juara Minggu {{ selectedWeek() }}
              </h2>
              <button
                type="button"
                (click)="openVerificationPopup()"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] border border-ink text-[10px] sm:text-[11px] font-pixel font-bold uppercase cursor-pointer hover:bg-brand-50 transition-colors"
                [ngClass]="currentWeekCommitStatus() === 'committed' ? 'bg-brand-50 text-brand-ink' : 'bg-sun/30 text-ink'"
                aria-label="Cek status verifikasi minggu ini"
              >
                <span>{{ currentWeekCommitStatus() === 'committed' ? 'Terverifikasi' : 'Menunggu verifikasi' }}</span>
              </button>
            </div>
            <p class="font-sans text-xs sm:text-sm text-ink-muted mt-1">
              SimpliMates dengan rata-rata skor tidur tertinggi periode ini
            </p>
          </div>

          <div class="flex items-end justify-center gap-1.5 sm:gap-6 max-w-lg mx-auto pt-4 sm:pt-6">
            <!-- 2nd Place (Silver) -->
            @if (topThree()[1]; as rank2) {
              <div class="flex-1 flex flex-col items-center min-w-0">
                <div class="relative mb-2 text-center w-full">
                  <span class="font-pixel text-[10px] sm:text-xs bg-brand-100 text-brand-deep px-1.5 sm:px-2 py-0.5 font-bold border-2 border-ink rounded-[6px] [box-shadow:2px_2px_0_#141414] inline-block uppercase whitespace-nowrap">
                    #2
                  </span>
                  <div class="mt-1 flex justify-center">
                    <app-avatar [name]="rank2.name" [avatar]="rank2.avatar || 'user-2'" size="sm" class="sm:hidden rounded-[8px] overflow-hidden shrink-0"></app-avatar>
                    <app-avatar [name]="rank2.name" [avatar]="rank2.avatar || 'user-2'" size="md" class="hidden sm:inline-flex rounded-[8px] overflow-hidden shrink-0"></app-avatar>
                  </div>
                  <h4 class="font-sans font-bold text-[11px] sm:text-sm text-ink truncate w-full mt-1">
                    {{ rank2.name }}
                  </h4>
                  <span class="font-pixel text-xs sm:text-sm font-bold text-brand-ink block whitespace-nowrap">
                    {{ rank2.avgScore }}
                  </span>
                </div>
                <div class="w-full h-20 sm:h-28 bg-brand-200 border-3 border-ink rounded-t-[8px] [box-shadow:4px_4px_0_#141414] flex items-center justify-center">
                  <span class="font-pixel text-xl sm:text-3xl font-bold text-ink">2</span>
                </div>
              </div>
            }

            <!-- 1st Place (Gold) -->
            @if (topThree()[0]; as rank1) {
              <div class="flex-1 flex flex-col items-center min-w-0">
                <div class="relative mb-2 text-center w-full">
                  <span class="font-pixel text-[10px] sm:text-xs bg-sun text-ink px-2 sm:px-2.5 py-0.5 font-bold border-2 border-ink rounded-[6px] [box-shadow:2px_2px_0_#141414] block uppercase whitespace-nowrap">
                    #1
                  </span>
                  <div class="mt-1 flex justify-center">
                    <app-avatar [name]="rank1.name" [avatar]="rank1.avatar || 'user-1'" size="md" class="sm:hidden rounded-[8px] overflow-hidden shrink-0"></app-avatar>
                    <app-avatar [name]="rank1.name" [avatar]="rank1.avatar || 'user-1'" size="lg" class="hidden sm:inline-flex rounded-[8px] overflow-hidden shrink-0"></app-avatar>
                  </div>
                  <h4 class="font-sans font-bold text-xs sm:text-base text-ink truncate w-full mt-1">
                    {{ rank1.name }}
                  </h4>
                  <span class="font-pixel text-sm sm:text-base font-extrabold text-brand-ink block whitespace-nowrap">
                    {{ rank1.avgScore }}
                  </span>
                </div>
                <div class="w-full h-28 sm:h-38 bg-sun border-3 border-ink rounded-t-[8px] [box-shadow:6px_6px_0_#141414] flex items-center justify-center">
                  <span class="font-pixel text-2xl sm:text-4xl font-extrabold text-ink">1</span>
                </div>
              </div>
            }

            <!-- 3rd Place (Bronze) -->
            @if (topThree()[2]; as rank3) {
              <div class="flex-1 flex flex-col items-center min-w-0">
                <div class="relative mb-2 text-center w-full">
                  <span class="font-pixel text-[10px] sm:text-xs bg-brand-50 text-brand-deep px-1.5 sm:px-2 py-0.5 font-bold border-2 border-ink rounded-[6px] [box-shadow:2px_2px_0_#141414] inline-block uppercase whitespace-nowrap">
                    #3
                  </span>
                  <div class="mt-1 flex justify-center">
                    <app-avatar [name]="rank3.name" [avatar]="rank3.avatar || 'user-3'" size="sm" class="sm:hidden rounded-[8px] overflow-hidden shrink-0"></app-avatar>
                    <app-avatar [name]="rank3.name" [avatar]="rank3.avatar || 'user-3'" size="md" class="hidden sm:inline-flex rounded-[8px] overflow-hidden shrink-0"></app-avatar>
                  </div>
                  <h4 class="font-sans font-bold text-[11px] sm:text-sm text-ink truncate w-full mt-1">
                    {{ rank3.name }}
                  </h4>
                  <span class="font-pixel text-xs sm:text-sm font-bold text-brand-ink block whitespace-nowrap">
                    {{ rank3.avgScore }}
                  </span>
                </div>
                <div class="w-full h-16 sm:h-22 bg-brand-100 border-3 border-ink rounded-t-[8px] [box-shadow:4px_4px_0_#141414] flex items-center justify-center">
                  <span class="font-pixel text-lg sm:text-2xl font-bold text-ink">3</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Full Leaderboard List -->
        <div class="panel-pixel rounded-[12px] p-0 bg-surface overflow-hidden">
          <div class="p-3.5 sm:p-5 bg-brand-50 border-b-2 border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-pixel text-base sm:text-xl font-bold text-ink uppercase">
                  Daftar Lengkap Skor SimpliMates
                </h3>
              </div>
              <p class="font-sans text-xs text-ink-muted mt-0.5">
                Peringkat dihitung dari rata-rata durasi dan konsistensi jam tidur mingguan.
              </p>
            </div>
          </div>

          <div #rowsContainer class="divide-y-2 divide-brand-100">
            @for (row of data.rows; track row.userId; let idx = $index) {
              <div
                class="leaderboard-row py-2.5 sm:py-3 px-2.5 sm:px-4 flex items-center justify-between gap-2.5 sm:gap-4 transition-colors"
                [ngClass]="[
                  isCurrentUser(row.userId)
                    ? 'bg-brand-100 border-l-4 border-brand-ink font-medium my-0.5'
                    : (idx % 2 === 1 ? 'bg-brand-50 hover:bg-brand-100/60' : 'bg-surface hover:bg-brand-50/60')
                ]"
              >
                <!-- Rank & User Info -->
                <div class="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
                  @if (row.rank === 1) {
                    <span class="font-pixel text-xs sm:text-sm font-bold w-7 sm:w-9 h-6 sm:h-7 flex items-center justify-center bg-sun text-ink border-2 border-ink rounded-[6px] [box-shadow:2px_2px_0_#141414] shrink-0 whitespace-nowrap">
                      #1
                    </span>
                  } @else if (row.rank === 2) {
                    <span class="font-pixel text-xs sm:text-sm font-bold w-7 sm:w-9 h-6 sm:h-7 flex items-center justify-center bg-brand-200 text-ink border-2 border-ink rounded-[6px] [box-shadow:2px_2px_0_#141414] shrink-0 whitespace-nowrap">
                      #2
                    </span>
                  } @else if (row.rank === 3) {
                    <span class="font-pixel text-xs sm:text-sm font-bold w-7 sm:w-9 h-6 sm:h-7 flex items-center justify-center bg-brand-100 text-brand-ink border-2 border-ink rounded-[6px] [box-shadow:2px_2px_0_#141414] shrink-0 whitespace-nowrap">
                      #3
                    </span>
                  } @else {
                    <span class="font-pixel text-xs sm:text-sm font-bold w-7 sm:w-9 text-center text-ink-muted shrink-0 whitespace-nowrap">
                      #{{ row.rank }}
                    </span>
                  }

                  <!-- Avatar -->
                  <app-avatar [name]="row.name" [avatar]="row.avatar || 'user-1'" size="sm" class="rounded-[8px] overflow-hidden shrink-0"></app-avatar>

                  <!-- Name & Current User Indicator -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <h4 class="font-sans font-bold text-xs sm:text-sm text-ink truncate">
                        {{ row.name }}
                      </h4>
                      @if (isCurrentUser(row.userId)) {
                        <span class="font-pixel text-[9px] sm:text-[10px] bg-brand-strong text-white px-1 sm:px-1.5 py-0.5 font-bold uppercase border border-ink rounded-[6px] whitespace-nowrap">
                          Kamu
                        </span>
                      }
                    </div>
                    <div class="flex items-center gap-2 text-[11px] sm:text-xs font-sans text-ink-muted whitespace-nowrap">
                      <span>Streak: {{ row.streak }} malam</span>
                    </div>
                  </div>
                </div>

                <!-- Right Side: Label & Score -->
                <div class="flex items-center gap-2 sm:gap-4 shrink-0 text-right">
                  <span
                    class="hidden sm:inline-block font-pixel text-[11px] px-2.5 py-0.5 font-bold uppercase border rounded-[6px] whitespace-nowrap"
                    [ngClass]="row.label === 'Sehat'
                      ? 'bg-brand-50 text-brand-ink border-brand-ink'
                      : 'bg-sun/40 text-ink border-ink'"
                  >
                    {{ row.label }}
                  </span>

                  <div class="w-14 sm:w-16 text-right">
                    <span class="font-pixel text-base sm:text-xl font-bold text-brand-ink block leading-tight whitespace-nowrap">
                      {{ row.avgScore }}
                    </span>
                    <span class="text-[9px] text-ink-muted font-pixel uppercase block sm:hidden whitespace-nowrap">
                      {{ row.label }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Privacy Callout Footer -->
          <div class="p-3.5 sm:p-4 bg-brand-50 border-t-2 border-ink flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div class="flex items-center gap-2">
              <span class="font-sans text-ink-muted text-xs">
                <strong>Privasi Terlindungi:</strong> Jam tidur mentah rekan kerja tidak dipublikasikan ke publik.
              </span>
            </div>
            <a routerLink="/about" class="btn-pixel btn-pixel--ghost btn-pixel--sm shrink-0 rounded-[8px] whitespace-nowrap text-xs">
              Pelajari Scoring →
            </a>
          </div>
        </div>

        <!-- Status Verifikasi Bar -->
        <div class="panel-pixel rounded-[12px] p-4 sm:p-5 bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-xs">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-pixel font-bold text-ink text-sm sm:text-base uppercase">
                Catatan Publik: Minggu {{ selectedWeek() }}
              </span>
              <span
                class="font-pixel text-[10px] px-1.5 py-0.5 rounded-[4px] border border-ink uppercase font-bold"
                [ngClass]="currentWeekCommitStatus() === 'committed' ? 'bg-brand-50 text-brand-ink' : 'bg-sun/40 text-ink'"
              >
                {{ currentWeekCommitStatus() === 'committed' ? 'Terkunci' : 'Pending' }}
              </span>
            </div>
            @if (currentRecord()?.hash) {
              <p class="font-mono text-xs text-ink-muted mt-1 truncate">
                Kode verifikasi: <span class="select-all">{{ formatTruncatedHash(currentRecord()!.hash) }}</span>
              </p>
            } @else {
              <p class="font-sans text-xs text-ink-muted mt-1">
                Skor akan dicatat permanen secara otomatis saat periode minggu ditutup.
              </p>
            }
          </div>

          <button
            type="button"
            (click)="openVerificationPopup()"
            class="btn-pixel btn-pixel--sm shrink-0 rounded-[8px] whitespace-nowrap text-xs"
          >
            Cek Verifikasi
          </button>
        </div>
      }
    </div>

    <!-- Popup Modal Verifikasi Catatan (Tutup via X/Esc/backdrop, Kunci scroll body, role=dialog) -->
    @if (isVerificationPopupOpen()) {
      <div
        class="fixed inset-0 z-50 bg-ink/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
        (click)="onBackdropClick($event)"
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="verification-popup-title"
          class="relative w-full max-w-md bg-paper border-2 sm:border-3 border-ink shadow-[4px_4px_0_#141414] sm:shadow-[6px_6px_0_#141414] rounded-[10px] sm:rounded-[12px] overflow-hidden my-auto select-none"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Header Bar -->
          <div class="bg-brand-strong text-white px-3.5 py-2.5 sm:px-4 sm:py-3 border-b-2 sm:border-b-3 border-ink flex items-center justify-between gap-2">
            <h3 id="verification-popup-title" class="font-pixel text-xs sm:text-sm md:text-base font-bold uppercase tracking-wide truncate">
              Verifikasi Catatan: Minggu {{ selectedWeek() }}
            </h3>
            <button
              type="button"
              (click)="closeVerificationPopup()"
              class="w-8 h-8 min-w-[32px] min-h-[32px] bg-brand-ink text-white font-pixel font-bold border-2 border-ink shadow-[2px_2px_0_#141414] rounded-[6px] flex items-center justify-center hover:bg-brand-deep cursor-pointer focus-visible:outline-none shrink-0"
              aria-label="Tutup popup verifikasi"
              title="Tutup Popup"
            >
              ✕
            </button>
          </div>

          <!-- Content Body -->
          <div class="p-3.5 sm:p-5 space-y-3 sm:space-y-3.5">
            <!-- Status Badge -->
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span class="font-pixel text-xs text-ink-muted uppercase font-bold">Status:</span>
              @if (currentWeekCommitStatus() === 'committed') {
                <span class="font-pixel text-xs bg-brand-50 text-brand-ink border-2 border-ink px-2.5 py-0.5 rounded-[6px] font-bold uppercase [box-shadow:2px_2px_0_#141414]">
                  ✓ Terverifikasi
                </span>
              } @else {
                <span class="font-pixel text-xs bg-sun/40 text-ink border-2 border-ink px-2.5 py-0.5 rounded-[6px] font-bold uppercase [box-shadow:2px_2px_0_#141414]">
                  Menunggu Verifikasi
                </span>
              }
            </div>

            <!-- Satu Kalimat Penjelasan Awam -->
            <div class="p-3 bg-white border-2 border-ink rounded-[8px] text-xs sm:text-sm text-ink leading-relaxed">
              @if (currentWeekCommitStatus() === 'committed') {
                <p>
                  <strong>Skor minggu ini tercatat permanen</strong> sehingga tidak bisa diubah diam-diam.
                </p>
              } @else {
                <p>
                  Periode minggu ini masih berjalan. Skor akan dicatat permanen setelah periode ditutup Minggu malam pukul 23:59 WIB.
                </p>
              }
            </div>

            <!-- Hash Panjang Dipotong / Disembunyikan -->
            @if (currentRecord()?.hash) {
              <div class="space-y-1">
                <span class="font-pixel text-[11px] font-bold text-ink-muted uppercase block">Kode Verifikasi:</span>
                <div class="p-2 sm:p-2.5 bg-surface border-2 border-ink rounded-[6px] flex items-center justify-between gap-2 font-mono text-xs [box-shadow:2px_2px_0_#141414]">
                  <span class="font-bold text-ink truncate select-all">
                    {{ formatTruncatedHash(currentRecord()!.hash) }}
                  </span>
                  <button
                    type="button"
                    (click)="copyHash(currentRecord()!.hash)"
                    class="btn-pixel btn-pixel--ghost btn-pixel--xs py-1 px-2 text-[10px] shrink-0"
                    title="Salin kode verifikasi"
                  >
                    Salin
                  </button>
                </div>
              </div>
            }

            <!-- Tombol Cek Sekarang -->
            @if (currentWeekCommitStatus() === 'committed') {
              <div>
                <button
                  type="button"
                  (click)="verifyCurrentWeek()"
                  [disabled]="isVerifyingHash()"
                  class="btn-pixel btn-pixel--sun w-full py-2.5 px-3 text-xs sm:text-sm font-pixel font-bold uppercase rounded-[8px]"
                >
                  {{ isVerifyingHash() ? 'Menghitung...' : 'Cek Sekarang' }}
                </button>
              </div>
            }

            <!-- Hasil Verifikasi Cocok / Tidak -->
            @if (verificationResult(); as res) {
              <div
                class="p-3 rounded-[8px] border-2 border-ink space-y-1.5 [box-shadow:2px_2px_0_#141414]"
                [ngClass]="res.isMatch ? 'bg-brand-50 text-brand-ink' : 'bg-red-50 text-red-800'"
              >
                <div class="font-pixel text-xs sm:text-sm font-bold flex items-center justify-between gap-2">
                  <span>{{ res.isMatch ? '✓ Kode Cocok (Terverifikasi)' : '✕ Kode Tidak Cocok' }}</span>
                  <span class="text-[10px] font-mono opacity-80">{{ res.timestamp }}</span>
                </div>
                <p class="font-sans text-xs text-ink leading-normal">
                  {{ res.isMatch
                    ? 'Kode verifikasi skor klasemen identik dengan catatan publik. Peringkat valid dan tidak dimanipulasi.'
                    : 'Kode verifikasi tidak sesuai dengan data pada sistem pencatatan.' }}
                </p>
              </div>
            }

            <!-- Link Lihat di catatan publik bila ada txHash -->
            @if (currentRecord()?.txHash) {
              <div class="pt-0.5 text-center">
                <a
                  [href]="'https://sepolia.etherscan.io/tx/' + currentRecord()!.txHash"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-pixel text-xs text-brand-ink hover:underline font-bold inline-flex items-center gap-1"
                >
                  <span>Lihat catatan publik ↗</span>
                </a>
              </div>
            }
          </div>

          <!-- Modal Footer -->
          <div class="p-2.5 sm:p-3 bg-brand-50 border-t-2 border-ink flex items-center justify-end">
            <button
              type="button"
              (click)="closeVerificationPopup()"
              class="btn-pixel btn-pixel--ghost btn-pixel--sm py-1.5 px-3 text-xs font-pixel font-bold uppercase"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class LeaderboardComponent implements OnInit, AfterViewInit {
  private auth = inject(AuthService);
  private leaderboardService = inject(LeaderboardService);
  private transparencyService = inject(TransparencyService);
  private anim = inject(AnimationService);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);

  @ViewChild('rowsContainer') rowsContainer?: ElementRef<HTMLElement>;

  readonly selectedWeek = signal('2026-W47');
  readonly leaderboardData = signal<LeaderboardResponse | null>(null);
  readonly topThree = signal<LeaderboardRow[]>([]);
  readonly transparencyRecords = signal<TransparencyRecord[]>([]);

  // State Modal Verifikasi On-Chain
  readonly isVerificationPopupOpen = signal<boolean>(false);
  readonly isVerifyingHash = signal<boolean>(false);
  readonly verificationResult = signal<OnChainVerificationResult | null>(null);

  private isDestroyed = false;
  private staggerTimeoutId?: any;
  private verifyTimeoutId?: any;

  // Rekaman on-chain untuk minggu yang aktif dipilih
  readonly currentRecord = computed<TransparencyRecord | null>(() => {
    const week = this.selectedWeek();
    const found = this.transparencyRecords().find((r) => r.week === week);
    if (found && found.hash && !found.hash.includes('pending')) {
      return {
        ...found,
        status: 'committed'
      };
    }

    // Fallback bila data dari leaderboardResponse memuat commit
    const commit = this.leaderboardData()?.commit;
    if (commit && week !== '2026-W47') {
      return {
        week,
        hash: commit.hash,
        txHash: commit.txHash,
        chainId: 11155111,
        committedAt: commit.timestamp || '2026-11-16T00:05:00.000Z',
        blockNumber: 7129841,
        contractAddress: '0x71bE26D1D6FfaB631C4d2C38290352F3918a09bE',
        status: 'committed'
      };
    }

    const dummy = DUMMY_TRANSPARENCY_RECORDS.find((r) => r.week === week);
    if (dummy && dummy.status === 'committed') {
      return {
        ...dummy,
        hash: computeMockWeekHash(week)
      };
    }

    return {
      week,
      hash: '',
      txHash: '',
      chainId: 11155111,
      committedAt: 'Pending Minggu 23:59 WIB',
      blockNumber: 0,
      contractAddress: '0x71bE26D1D6FfaB631C4d2C38290352F3918a09bE',
      status: 'pending'
    };
  });

  readonly currentWeekCommitStatus = computed<'committed' | 'pending'>(() => {
    const rec = this.currentRecord();
    if (rec?.status) return rec.status;
    return this.selectedWeek() === '2026-W47' ? 'pending' : 'committed';
  });

  ngOnInit(): void {
    this.loadWeekData(this.selectedWeek());
    this.loadTransparencyRecords();

    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
      if (this.staggerTimeoutId) {
        clearTimeout(this.staggerTimeoutId);
      }
      if (this.verifyTimeoutId) {
        clearTimeout(this.verifyTimeoutId);
      }
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    });
  }

  ngAfterViewInit(): void {
    this.triggerStaggerAnimation();
  }

  onWeekChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedWeek.set(val);
    this.verificationResult.set(null);
    this.loadWeekData(val);
  }

  openVerificationPopup(): void {
    this.verificationResult.set(null);
    this.isVerificationPopupOpen.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeVerificationPopup(): void {
    this.isVerificationPopupOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event?: Event): void {
    if (this.isVerificationPopupOpen()) {
      event?.preventDefault();
      this.closeVerificationPopup();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeVerificationPopup();
    }
  }

  verifyCurrentWeek(): void {
    const week = this.selectedWeek();
    const record = this.currentRecord();
    if (!record || record.status !== 'committed') {
      return;
    }

    this.isVerifyingHash.set(true);

    if (this.verifyTimeoutId) {
      clearTimeout(this.verifyTimeoutId);
    }
    this.verifyTimeoutId = setTimeout(() => {
      if (this.isDestroyed) return;
      const currentRows = this.leaderboardData()?.rows;
      const rows = currentRows && currentRows.length > 0
        ? currentRows.map((r) => ({ rank: r.rank, userId: r.userId, avgScore: r.avgScore }))
        : this.transparencyService.getPublicLeaderboardRows(week);
      const computedHash = keccakLeaderboard(rows);
      const expectedHash = record.hash;
      const isMatch = Boolean(expectedHash) && computedHash.toLowerCase() === expectedHash.toLowerCase();

      this.verificationResult.set({
        isMatch,
        computedHash: isMatch ? expectedHash : computedHash,
        expectedHash,
        timestamp: new Date().toLocaleTimeString('id-ID')
      });
      this.isVerifyingHash.set(false);

      if (!isMatch) {
        // Tampilkan toast hanya bila terjadi error/gagal; hasil sukses sudah tampil inline di modal
        this.toast.error(
          `Kode verifikasi minggu ${week} tidak cocok dengan sistem pencatatan publik!`,
          'Verifikasi Gagal'
        );
      }
    }, 350);
  }

  formatTruncatedHash(hash: string): string {
    if (!hash) return '';
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  }

  copyHash(hash: string): void {
    if (!hash) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(hash);
    }
    this.toast.success('Kode verifikasi telah disalin!', 'Salin Kode');
  }

  isCurrentUser(userId: string): boolean {
    return this.auth.currentUser().id === userId;
  }

  private loadWeekData(week: string): void {
    this.leaderboardService.getLeaderboard(week).subscribe({
      next: (data) => {
        if (this.isDestroyed) return;
        this.leaderboardData.set(data);
        this.topThree.set(data.rows.slice(0, 3));
        if (this.staggerTimeoutId) {
          clearTimeout(this.staggerTimeoutId);
        }
        this.staggerTimeoutId = setTimeout(() => {
          if (!this.isDestroyed) {
            this.triggerStaggerAnimation();
          }
        }, 50);
      },
      error: () => {
        if (!this.isDestroyed) {
          this.toast.error('Gagal memuat data leaderboard minggu ' + week, 'Error Jaringan');
        }
      }
    });
  }

  private loadTransparencyRecords(): void {
    this.transparencyService.getTransparencyRecords().subscribe({
      next: (records) => {
        if (!this.isDestroyed) {
          this.transparencyRecords.set(records);
        }
      },
      error: () => {
        // Fallback gracefully bila api belum terhubung
      }
    });
  }

  private triggerStaggerAnimation(): void {
    if (this.isDestroyed) return;
    if (this.rowsContainer?.nativeElement) {
      const rows = this.rowsContainer.nativeElement.querySelectorAll<HTMLElement>('.leaderboard-row');
      if (rows.length > 0) {
        try {
          this.anim.animateLeaderboardRows(rows, this.destroyRef, this.rowsContainer.nativeElement);
        } catch {
          // Ignore if view was destroyed during animation trigger
        }
      }
    }
  }
}
