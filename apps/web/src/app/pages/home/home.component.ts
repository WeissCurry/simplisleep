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
import { Card, DEMO_USER_IDS, NightScore } from 'shared';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { SleepHistoryItem } from '../../core/services/mock-data';
import { SleepService, WakeUpResult } from '../../core/services/sleep.service';
import { ToastService } from '../../core/services/toast.service';
import { AnimationService } from '../../core/utils/animation.service';
import { cardImageUrl, onCardImageError } from '../../core/utils/card.util';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { RarityBadgeComponent } from '../../shared/components/rarity-badge/rarity-badge.component';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterLink,
    RarityBadgeComponent,
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
      box-shadow: 6px 6px 0px var(--color-ink, #141414);
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
    .pixelated {
      image-rendering: pixelated;
    }
    ::ng-deep app-avatar,
    ::ng-deep app-avatar > div,
    ::ng-deep app-avatar > div > div {
      border-radius: 8px !important;
      overflow: hidden;
    }
    ::ng-deep app-rarity-badge > span {
      border-radius: 6px !important;
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
      <!-- Greeting Banner (Responsif: di 344px avatar & judul rapi tidak terjepit) -->
      <div class="panel-pixel rounded-[12px] p-4 sm:p-6 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 min-w-0">
          <app-avatar
            [name]="currentUser().name"
            [avatar]="currentUser().avatar"
            [status]="activeSession() ? 'sleeping' : 'awake'"
            size="lg"
            class="rounded-[8px] overflow-hidden shrink-0"
          ></app-avatar>
          <div class="min-w-0 flex-1">
            <h1 class="font-pixel text-xl sm:text-2xl md:text-3xl font-bold text-ink uppercase tracking-tight break-words">
              Halo, {{ currentUser().name }}!
            </h1>
            <p class="font-pixel text-xs sm:text-sm md:lead-pixel text-ink-muted mt-1 leading-snug">
              @if (activeSession()) {
                <span class="text-brand-ink font-bold">Sedang dalam sesi tidur... zzz</span>
              } @else {
                <span>Siap untuk tidur sehat malam ini? Yuk hindari begadang!</span>
              }
            </p>
          </div>
        </div>

        <!-- Quick Streak Badge -->
        <div class="flex items-center gap-2 self-start sm:self-auto bg-brand-50 border-2 border-ink px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-[6px] [box-shadow:3px_3px_0_#141414] whitespace-nowrap shrink-0">
          <div>
            <div class="font-pixel text-[10px] sm:text-xs text-ink-muted uppercase leading-none">Streak Aktif</div>
            <div class="font-pixel text-base sm:text-xl font-bold text-brand-ink leading-tight">
              {{ streakDays() }} Malam
            </div>
          </div>
        </div>
      </div>

      <!-- Main Sleep Control Card (Mau Tidur / Bangun) -->
      <div class="panel-pixel rounded-[12px] p-5 sm:p-8 bg-surface text-ink relative overflow-hidden text-center">
        <!-- Floating Zzz animation container (aktif saat sedang tidur) -->
        <div #zzzContainer class="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true"></div>

        <div class="relative z-20 max-w-xl mx-auto">
          <!-- Status Pill -->
          <div
            class="inline-flex items-center gap-2 px-3 py-1.5 font-pixel text-xs font-bold uppercase tracking-wider mb-5 border-2 border-ink rounded-[6px] [box-shadow:2px_2px_0_#141414] whitespace-nowrap"
            [ngClass]="activeSession() ? 'bg-sun text-ink' : 'bg-brand-50 text-brand-ink'"
          >
            <span
              class="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              [ngClass]="activeSession() ? 'bg-brand-ink animate-ping' : 'bg-success'"
            ></span>
            <span>{{ activeSession() ? 'SESI TIDUR BERLANGSUNG' : 'STATUS: TERJAGA' }}</span>
          </div>

          <!-- Wake Summary Alert -->
          @if (wakeSummary(); as summary) {
            <div class="panel-pixel rounded-[12px] bg-brand-50 border-2 border-ink p-3.5 sm:p-4 mb-5 text-center max-w-md mx-auto [box-shadow:4px_4px_0_#141414]">
              <h3 class="font-pixel text-sm sm:text-base font-bold text-ink uppercase">
                Selamat Pagi! Ringkasan Tidur Malam Ini:
              </h3>
              <div class="flex flex-wrap items-center justify-center gap-3 mt-2 font-pixel text-xs text-ink whitespace-nowrap">
                <span>Skor: <strong class="text-brand-ink text-sm sm:text-base font-bold">{{ summary.score }}</strong></span>
                <span>Durasi: <strong class="font-sans font-bold">{{ summary.durationHours }} Jam</strong></span>
                <span>Status: <strong class="text-success uppercase font-bold">{{ summary.label }}</strong></span>
              </div>
            </div>
          }

          <!-- Big Action Button (Chunky Button - aman di 344px) -->
          <div class="max-w-md mx-auto my-2 sm:my-3">
            @if (!activeSession()) {
              <!-- TOMBOL MAU TIDUR -->
              <button
                type="button"
                class="btn-pixel rounded-[8px] w-full text-base sm:text-xl md:text-2xl py-3.5 sm:py-4 px-4 sm:px-6 gap-2.5 cursor-pointer whitespace-nowrap"
                (click)="handleStartSleep()"
              >
                <span>Mau Tidur Sekarang</span>
              </button>
              <p class="font-sans text-xs text-ink-muted mt-2.5 max-w-sm mx-auto leading-relaxed">
                Waktu mulai dicatat server. Letakkan HP, redupkan lampu, dan selamat istirahat!
              </p>
              @if (isDemoUser()) {
                <div class="mt-4 pt-3 border-t-2 border-brand-100 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    (click)="handleSimulateNight()"
                    class="font-pixel text-xs text-brand-ink hover:underline cursor-pointer py-1 font-bold whitespace-nowrap"
                    title="Simulasi tidur 8 jam langsung untuk mencoba fitur drop kartu"
                  >
                    Simulasi tidur 8 jam
                  </button>
                </div>
              }
            } @else {
              <!-- TOMBOL BANGUN -->
              <button
                type="button"
                class="btn-pixel btn-pixel--sun rounded-[8px] w-full text-base sm:text-xl md:text-2xl py-3.5 sm:py-4 px-4 sm:px-6 gap-2.5 cursor-pointer whitespace-nowrap"
                (click)="handleWakeUp()"
              >
                <span>Bangun Tidur</span>
              </button>
              <div class="mt-3 space-y-1">
                <p class="font-sans text-xs text-ink whitespace-nowrap">
                  Mulai tidur sejak: <strong class="font-pixel text-brand-ink text-sm">{{ sleepStartTimeFormatted() }}</strong>
                </p>
                <p class="font-sans text-[11px] text-ink-muted">
                  Klik begitu bangun untuk menghitung skor tidurmu & raih kartu koleksi baru!
                </p>
              </div>

              <!-- Simulator Heartbeat / Buka App -->
              <div class="mt-4 pt-3 border-t-2 border-brand-100 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  (click)="handleHeartbeatTrigger()"
                  class="font-pixel text-xs text-ink-muted hover:text-brand-ink underline cursor-pointer py-1 whitespace-nowrap"
                  title="Simulasi user membuka aplikasi saat tidur (menandai sesi broken)"
                >
                  Tes Heartbeat (Simulasi Buka HP saat tidur)
                </button>
                @if (isDemoUser()) {
                  <span class="text-ink-muted text-xs select-none">•</span>
                  <button
                    type="button"
                    (click)="handleSimulateNight()"
                    class="font-pixel text-xs text-brand-ink hover:underline cursor-pointer py-1 font-bold whitespace-nowrap"
                    title="Simulasi tidur 8 jam langsung untuk mencoba fitur drop kartu"
                  >
                    Simulasi tidur 8 jam
                  </button>
                }
                @if (activeSession()?.status === 'broken') {
                  <span class="font-pixel text-[11px] bg-danger text-white px-2 py-0.5 border border-ink font-bold uppercase rounded-[6px] whitespace-nowrap">
                    Sesi Broken
                  </span>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Stats Grid: Skor Terakhir & Detail Metrik -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <!-- Card 1: Skor Malam Terakhir (Header flex-wrap & ukuran proporsional agar tidak bertabrakan) -->
        <div class="panel-pixel rounded-[12px] p-4 sm:p-6 bg-surface flex flex-col justify-between">
          <div>
            <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b-2 border-brand-100 pb-2.5">
              <div class="flex items-center gap-1.5 min-w-0">
                <h2 class="font-pixel text-xs sm:text-sm md:text-base font-bold text-ink uppercase">
                  Skor Malam Terakhir
                </h2>
              </div>
              <span class="font-pixel text-[10px] sm:text-xs px-2 py-0.5 bg-brand-50 text-brand-ink border border-ink font-bold uppercase rounded-[6px] whitespace-nowrap shrink-0">
                {{ lastScore()?.label || 'Sehat' }}
              </span>
            </div>

            <div class="text-center py-4">
              <div class="flex items-baseline justify-center gap-1.5">
                <span
                  #scoreNumberEl
                  class="font-pixel text-4xl sm:text-5xl md:text-6xl font-bold text-brand-ink leading-none"
                >
                  {{ lastScore()?.score || 88 }}
                </span>
                <span class="font-pixel text-ink-muted text-sm sm:text-base">/ 100</span>
              </div>
              <p class="font-sans text-xs text-ink-muted mt-2 font-medium">
                Durasi: {{ lastScore()?.durationHours || 7.8 }} Jam
              </p>
            </div>
          </div>

          <div class="pt-3 border-t-2 border-brand-100 grid grid-cols-2 gap-2.5 text-center">
            <div class="bg-brand-50 p-2 sm:p-2.5 border-2 border-ink rounded-[8px]">
              <span class="font-pixel text-[10px] text-ink-muted uppercase block leading-none mb-1">Durasi</span>
              <span class="font-pixel font-bold text-ink text-sm sm:text-base">
                {{ lastScore()?.durationScore || 95 }}
              </span>
            </div>
            <div class="bg-brand-50 p-2 sm:p-2.5 border-2 border-ink rounded-[8px]">
              <span class="font-pixel text-[10px] text-ink-muted uppercase block leading-none mb-1">Konsistensi</span>
              <span class="font-pixel font-bold text-ink text-sm sm:text-base">
                {{ lastScore()?.consistencyScore || 82 }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card 2: Pencapaian Streak (Header flex-wrap agar judul & badge aman) -->
        <div class="panel-pixel rounded-[12px] p-4 sm:p-6 bg-surface flex flex-col justify-between">
          <div>
            <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b-2 border-brand-100 pb-2.5">
              <div class="flex items-center gap-1.5 min-w-0">
                <h2 class="font-pixel text-xs sm:text-sm md:text-base font-bold text-ink uppercase">
                  Pencapaian Streak
                </h2>
              </div>
              <span class="font-pixel text-[10px] sm:text-xs px-2 py-0.5 bg-sun text-ink border border-ink font-bold uppercase rounded-[6px] whitespace-nowrap shrink-0">
                Skor ≥ 70
              </span>
            </div>

            <div class="py-4 text-center">
              <div class="font-pixel text-4xl sm:text-5xl md:text-6xl font-bold text-brand-ink leading-none">
                {{ streakDays() }}
              </div>
              <p class="font-pixel text-xs sm:text-sm text-ink-muted font-bold mt-2 uppercase">
                Malam Berturut-turut
              </p>
            </div>
          </div>

          <div class="p-3 bg-brand-50 border-2 border-ink rounded-[8px] text-xs text-ink-muted leading-relaxed font-sans">
            Tidur konsisten setiap malam memberimu kesempatan memperoleh kartu koleksi 60%!
          </div>
        </div>

        <!-- Card 3: Tips Santai Malam Ini -->
        <div class="panel-pixel rounded-[12px] p-4 sm:p-6 bg-surface flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b-2 border-brand-100 pb-2.5">
              <div class="flex items-center gap-1.5 min-w-0">
                <h2 class="font-pixel text-xs sm:text-sm md:text-base font-bold text-ink uppercase">
                  Tips Anti Begadang
                </h2>
              </div>
            </div>

            <div class="py-3 text-xs text-ink space-y-2 font-sans">
              <p class="font-bold text-ink">
                Aturan Emas SimpliSleeps:
              </p>
              <ul class="space-y-1.5 pl-4 list-disc text-ink-muted text-xs leading-relaxed">
                <li>Tidur 7–9 jam untuk raih skor durasi maksimal 100.</li>
                <li>Jaga jam tidur dalam rentang 30 menit dari median harianmu.</li>
                <li>Jangan buka app di tengah malam agar sesi tidak broken!</li>
              </ul>
            </div>
          </div>

          <div class="pt-2">
            <a routerLink="/about" class="btn-pixel btn-pixel--ghost btn-pixel--sm rounded-[8px] w-full text-center whitespace-nowrap text-xs">
              Baca Panduan Lengkap →
            </a>
          </div>
        </div>
      </div>

      <!-- Riwayat Tidur 14 Hari (Mini Chart SVG Interaktif) -->
      <div class="panel-pixel rounded-[12px] p-4 sm:p-6 bg-surface">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-brand-100 pb-3 mb-4">
          <div class="flex items-center gap-2">
            <div>
              <h2 class="font-pixel text-base sm:text-xl font-bold text-ink uppercase">
                Riwayat 14 Hari Terakhir
              </h2>
              <p class="font-sans text-xs text-ink-muted">
                Grafik tren skor tidur harianmu (Target Sehat: Skor ≥ 70)
              </p>
            </div>
          </div>
          <div class="font-pixel text-xs text-ink-muted self-start sm:self-auto whitespace-nowrap">
            Rata-rata 14 Hari: <strong class="text-brand-ink text-sm sm:text-base font-bold">{{ averageHistoryScore() }}</strong>
          </div>
        </div>

        <div class="py-1">
          <!-- Summary Legend -->
          <div class="flex flex-wrap items-center justify-end gap-3 mb-3 text-xs font-pixel text-ink">
            <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span class="w-3.5 h-3.5 bg-brand border border-ink rounded-[4px] inline-block"></span> Sehat (≥70)
            </span>
            <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span class="w-3.5 h-3.5 bg-sun border border-ink rounded-[4px] inline-block"></span> Kurang (&lt;70)
            </span>
            <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span class="w-3.5 h-3.5 bg-danger border border-ink rounded-[4px] inline-block"></span> Broken
            </span>
          </div>

          <!-- SVG Chart Container -->
          <div class="w-full overflow-x-auto pb-2">
            <div class="min-w-[480px]">
              <svg
                class="w-full h-44 select-none"
                viewBox="0 0 560 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Grid Lines -->
                <line x1="30" y1="20" x2="550" y2="20" stroke="#FFE0E7" stroke-dasharray="3 3" />
                <line x1="30" y1="60" x2="550" y2="60" stroke="#FFE0E7" stroke-dasharray="3 3" />
                <line x1="30" y1="100" x2="550" y2="100" stroke="#FFE0E7" stroke-dasharray="3 3" />
                <line x1="30" y1="130" x2="550" y2="130" stroke="#141414" stroke-width="2" />

                <!-- Target Line (Score 70 = y 56) -->
                <line x1="30" y1="56" x2="550" y2="56" stroke="#EC385B" stroke-width="2" stroke-dasharray="4 2" />
                <text x="548" y="52" text-anchor="end" fill="#C21F42" font-size="9" font-family="'Pixelify Sans', monospace" font-weight="bold">
                  Target: 70
                </text>

                <!-- Y-Axis Labels -->
                <text x="25" y="24" text-anchor="end" fill="#5C5C5C" font-size="9" font-family="'Pixelify Sans', monospace">100</text>
                <text x="25" y="60" text-anchor="end" fill="#5C5C5C" font-size="9" font-family="'Pixelify Sans', monospace">70</text>
                <text x="25" y="100" text-anchor="end" fill="#5C5C5C" font-size="9" font-family="'Pixelify Sans', monospace">35</text>
                <text x="25" y="133" text-anchor="end" fill="#5C5C5C" font-size="9" font-family="'Pixelify Sans', monospace">0</text>

                <!-- Chart Bars (14 hari) with rx/ry 4px -->
                @for (day of history(); track day.date; let idx = $index) {
                  <g
                    class="cursor-pointer group focus-visible:outline-none"
                    (click)="selectedChartDay.set(day)"
                    tabindex="0"
                    role="button"
                    [attr.aria-label]="day.dayName + ' ' + day.date + ', Skor: ' + day.score"
                    (keydown.enter)="selectedChartDay.set(day)"
                    (keydown.space)="$event.preventDefault(); selectedChartDay.set(day)"
                  >
                    <!-- Hit area -->
                    <rect
                      [attr.x]="36 + idx * 36"
                      y="15"
                      width="30"
                      height="125"
                      fill="transparent"
                    />

                    <!-- Actual Bar with rx/ry 4px -->
                    <rect
                      [attr.x]="42 + idx * 36"
                      [attr.y]="130 - (day.score / 100) * 110"
                      width="18"
                      [attr.height]="(day.score / 100) * 110"
                      [attr.fill]="getBarColor(day)"
                      stroke="#141414"
                      stroke-width="1.5"
                      rx="4"
                      ry="4"
                      class="transition-transform group-hover:scale-y-105 origin-bottom"
                    />

                    <!-- Score above bar -->
                    <text
                      [attr.x]="51 + idx * 36"
                      [attr.y]="124 - (day.score / 100) * 110"
                      text-anchor="middle"
                      fill="#141414"
                      font-size="9"
                      font-family="'Pixelify Sans', monospace"
                      font-weight="bold"
                    >
                      {{ day.score }}
                    </text>

                    <!-- Date label below bar -->
                    <text
                      [attr.x]="51 + idx * 36"
                      y="145"
                      text-anchor="middle"
                      fill="#5C5C5C"
                      font-size="8.5"
                      font-family="'Pixelify Sans', monospace"
                    >
                      {{ day.dayName }}
                    </text>
                    <text
                      [attr.x]="51 + idx * 36"
                      y="155"
                      text-anchor="middle"
                      fill="#141414"
                      font-size="7.5"
                      font-family="'Pixelify Sans', monospace"
                    >
                      {{ day.date.slice(8, 10) }}
                    </text>
                  </g>
                }
              </svg>
            </div>
          </div>

          <!-- Tooltip detail hari yang dipilih -->
          @if (selectedChartDay(); as selected) {
            <div class="mt-4 p-3 bg-brand-50 border-2 border-ink rounded-[8px] [box-shadow:3px_3px_0_#141414] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-2">
                <span class="font-pixel font-bold text-sm text-brand-ink whitespace-nowrap">
                  {{ selected.dayName }}, {{ selected.date }}
                </span>
                <span
                  class="px-2 py-0.5 font-pixel text-xs font-bold uppercase border border-ink rounded-[6px] whitespace-nowrap"
                  [ngClass]="selected.label === 'Sehat' ? 'bg-brand text-white' : 'bg-sun text-ink'"
                >
                  {{ selected.label }}
                </span>
                @if (selected.status === 'broken') {
                  <span class="px-2 py-0.5 font-pixel text-[10px] bg-danger text-white font-bold uppercase border border-ink rounded-[6px] whitespace-nowrap">
                    Sesi Terganggu
                  </span>
                }
              </div>
              <div class="flex items-center gap-4 text-ink font-sans whitespace-nowrap">
                <span>Skor: <strong class="font-pixel text-brand-ink text-sm">{{ selected.score }}</strong></span>
                <span>Durasi: <strong>{{ selected.durationHours }} Jam</strong></span>
                <span>Tidur: {{ selected.bedTime }} – {{ selected.wakeTime }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Drop Reward Modal (Ketika bangun dan menang kartu!) -->
      @if (lastDropCard(); as card) {
        <div class="fixed inset-0 z-50 bg-ink/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            #dropModalBox
            role="dialog"
            aria-modal="true"
            aria-labelledby="drop-modal-title"
            class="panel-pixel rounded-[12px] relative w-full max-w-sm bg-surface p-5 sm:p-8 text-center my-auto [box-shadow:8px_8px_0_#141414] border-4 border-ink"
          >
            <!-- Rarity Star Banner -->
            <div class="mb-3">
              <h2 id="drop-modal-title" class="font-pixel text-xl sm:text-2xl font-bold text-brand-ink uppercase mt-2">
                KARTU BARU TERBUKA!
              </h2>
              <p class="font-sans text-xs text-ink-muted mt-1">
                Karena skor tidurmu ≥ 70, kamu memenangkan kartu koleksi baru:
              </p>
            </div>

            <!-- Card Showcase Box with GSAP Glow -->
            <div
              #revealGlowEl
              class="bg-brand-50 border-3 border-ink rounded-[12px] p-4 my-4 [box-shadow:4px_4px_0_#141414]"
            >
              <div class="flex justify-center mb-2">
                <app-rarity-badge [rarity]="card.rarity" size="lg"></app-rarity-badge>
              </div>

              <!-- Animal Image via cardImageUrl with pixel fallback -->
              <div class="w-24 h-24 sm:w-28 sm:h-28 mx-auto my-3 bg-surface border-2 border-ink rounded-[8px] [box-shadow:2px_2px_0_#141414] overflow-hidden flex items-center justify-center p-1">
                <img
                  [src]="getCardImageUrl(card.id)"
                  [alt]="card.name"
                  (error)="handleImageFallback($event, card.name, card.rarity)"
                  class="w-full h-full object-contain pixelated rounded-[8px]"
                />
              </div>

              <h3 class="font-pixel text-lg sm:text-xl font-bold text-ink uppercase">{{ card.name }}</h3>
              <p class="font-sans text-xs text-ink-muted italic mt-1 leading-relaxed">
                "{{ card.description }}"
              </p>
              <div class="mt-2 text-[10px] font-pixel text-brand-ink bg-brand-100 border border-ink py-1 px-2 uppercase font-bold inline-block rounded-[6px] whitespace-nowrap">
                Status: {{ getCardStatusLabel(card.status) }}
              </div>
            </div>

            <div class="space-y-2 pt-1 sm:pt-2">
              <a
                routerLink="/cards"
                (click)="closeDropModal()"
                class="btn-pixel rounded-[8px] w-full min-h-[44px] text-sm whitespace-nowrap"
              >
                Lihat Koleksi
              </a>
              <button
                type="button"
                (click)="closeDropModal()"
                class="font-pixel text-xs text-ink-muted hover:text-ink underline block mx-auto min-h-[44px] py-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-ink whitespace-nowrap"
              >
                Tutup Sementara
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class HomeComponent implements OnInit, AfterViewInit {
  private auth = inject(AuthService);
  private sleepService = inject(SleepService);
  private anim = inject(AnimationService);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);

  @ViewChild('scoreNumberEl') scoreNumberEl?: ElementRef<HTMLElement>;
  @ViewChild('zzzContainer') zzzContainer?: ElementRef<HTMLElement>;
  @ViewChild('revealGlowEl') revealGlowEl?: ElementRef<HTMLElement>;
  @ViewChild('dropModalBox') dropModalBox?: ElementRef<HTMLElement>;

  readonly currentUser = this.auth.currentUser;
  readonly isDemoUser = computed(() => (DEMO_USER_IDS as readonly string[]).includes(this.currentUser().id));
  readonly activeSession = this.sleepService.activeSession;
  readonly history = this.sleepService.history;
  readonly lastScore = this.sleepService.lastScore;

  readonly selectedChartDay = signal<SleepHistoryItem | null>(null);
  readonly lastDropCard = signal<Card | null>(null);
  readonly wakeSummary = signal<NightScore | null>(null);

  private zzzCleanupFn: (() => void) | null = null;
  private dropModalTriggerEl: HTMLElement | null = null;

  readonly streakDays = computed(() => {
    return this.currentUser().baseStreak || 5;
  });

  readonly averageHistoryScore = computed(() => {
    const list = this.history();
    if (list.length === 0) return 0;
    const total = list.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((total / list.length) * 10) / 10;
  });

  readonly sleepStartTimeFormatted = computed(() => {
    const session = this.activeSession();
    if (!session) return '23:00';
    try {
      if (!session.startedAt) return '--:--';
      const d = new Date(session.startedAt);
      if (isNaN(d.getTime())) return '--:--';
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  });

  ngOnInit(): void {
    const list = this.history();
    if (list.length > 0) {
      this.selectedChartDay.set(list[list.length - 1]);
    }

    // Sinkronkan status sesi aktif dengan server saat reload (live mode)
    if (!environment.useMock && this.auth.isAuthenticated()) {
      this.sleepService.getHistory(14).subscribe({
        next: (hist) => {
          if (hist.length > 0) {
            this.selectedChartDay.set(hist[hist.length - 1]);
          }
        },
        error: () => {}
      });

      this.auth.getMe().subscribe({
        next: (me) => {
          if (me.today?.status === 'active' || me.today?.status === 'broken') {
            if (me.today.session) {
              this.sleepService.setActiveSession(me.today.session);
            } else if (me.today.startedAt) {
              this.sleepService.setActiveSession({
                id: `sess-${this.auth.currentUser().id}`,
                userId: this.auth.currentUser().id,
                startedAt: me.today.startedAt,
                date: me.today.startedAt.split('T')[0],
                status: me.today.status as any
              });
            }
          } else if (me.today?.status === 'idle' || me.today?.status === 'completed') {
            if (this.activeSession()) {
              this.sleepService.setActiveSession(null);
            }
          }
        },
        error: () => {}
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.scoreNumberEl?.nativeElement && this.lastScore()) {
      this.anim.animateScoreCountUp(
        this.scoreNumberEl.nativeElement,
        this.lastScore()!.score,
        1.2,
        this.destroyRef
      );
    }

    if (this.activeSession() && this.zzzContainer?.nativeElement) {
      this.startZzzAnimation();
    }
  }

  handleStartSleep(): void {
    this.sleepService.startSleep().subscribe(() => {
      setTimeout(() => {
        this.startZzzAnimation();
      }, 50);
    });
  }

  private processWakeResult(res: WakeUpResult): void {
    this.wakeSummary.set(res.score);
    if (this.scoreNumberEl?.nativeElement) {
      this.anim.animateScoreCountUp(
        this.scoreNumberEl.nativeElement,
        res.score.score,
        1.2,
        this.destroyRef
      );
    }

    if (res.drop?.card) {
      if (typeof document !== 'undefined') {
        this.dropModalTriggerEl = document.activeElement as HTMLElement | null;
      }
      this.lastDropCard.set(res.drop.card);
      setTimeout(() => {
        if (this.revealGlowEl?.nativeElement) {
          this.anim.animateCardRarityGlow(
            this.revealGlowEl.nativeElement,
            res.drop!.card.rarity,
            this.destroyRef
          );
        }
      }, 80);
    }

    if (!environment.useMock) {
      this.sleepService.getHistory(14).subscribe({
        next: (hist) => {
          if (hist.length > 0) {
            this.selectedChartDay.set(hist[hist.length - 1]);
          }
        }
      });
    }
  }

  handleWakeUp(): void {
    this.stopZzzAnimation();
    this.sleepService.wakeUp().subscribe({
      next: (res: WakeUpResult) => {
        this.processWakeResult(res);
      },
      error: () => {}
    });
  }

  handleSimulateNight(): void {
    this.stopZzzAnimation();
    this.sleepService.simulateNight().subscribe({
      next: (res: WakeUpResult) => {
        this.processWakeResult(res);
      },
      error: () => {}
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (this.lastDropCard()) {
      event.preventDefault();
      this.closeDropModal();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.lastDropCard() || event.key !== 'Tab') return;

    const modal = this.dropModalBox?.nativeElement;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex="0"]:not([disabled]), a[href]:not([disabled])'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  getCardImageUrl(id: string): string {
    return cardImageUrl(id);
  }

  handleImageFallback(event: Event, name = 'Kartu Tidur', rarity = 'Common'): void {
    onCardImageError(event, name, rarity);
  }

  handleHeartbeatTrigger(): void {
    this.sleepService.heartbeat().subscribe();
    this.toast.warning('Simulasi heartbeat: aplikasi dibuka saat tidur menandai sesi broken.', 'Simulasi Heartbeat');
  }

  closeDropModal(): void {
    this.lastDropCard.set(null);
    this.toast.success('Kartu baru disimpan di koleksimu!', 'Koleksi Diperbarui');
    if (this.dropModalTriggerEl && typeof this.dropModalTriggerEl.focus === 'function') {
      this.dropModalTriggerEl.focus();
    }
  }

  getCardStatusLabel(status?: string): string {
    if (status === 'minted') return 'Tersimpan';
    if (status === 'pending-mint') return 'Sedang disimpan';
    return status || 'Sedang disimpan';
  }

  getBarColor(day: SleepHistoryItem): string {
    if (day.status === 'broken') return '#C21F42';
    if (day.score >= 70) return '#EC385B';
    return '#FFC93C';
  }

  private startZzzAnimation(): void {
    if (this.zzzCleanupFn) this.zzzCleanupFn();
    if (this.zzzContainer?.nativeElement) {
      this.zzzCleanupFn = this.anim.animateFloatingZzz(this.zzzContainer.nativeElement, {
        destroyRef: this.destroyRef
      });
    }
  }

  private stopZzzAnimation(): void {
    if (this.zzzCleanupFn) {
      this.zzzCleanupFn();
      this.zzzCleanupFn = null;
    }
  }
}
