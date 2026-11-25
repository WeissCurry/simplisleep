import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';

export interface FlowStepDetail {
  id: string;
  stepNumber: string;
  title: string;
  shortLabel: string;
  type: 'off-chain' | 'on-chain';
  badge: string;
  formula?: string;
  points: string[];
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-app py-4 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      <!-- Header Banner Singkat -->
      <header class="panel-pixel rounded-[12px] p-3 sm:p-6 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div class="min-w-0">
          <h1 class="font-pixel text-lg sm:text-2xl font-black text-ink uppercase tracking-tight truncate">
            Tentang SimpliSleep
          </h1>
          <p class="font-sans text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
            Gamifikasi tidur sehat dengan komitmen on-chain dan kartu Soulbound NFT.
          </p>
        </div>

        <div class="btn-pixel btn-pixel--sun btn-pixel--sm rounded-[8px] whitespace-nowrap font-bold uppercase self-start sm:self-auto select-none text-xs shrink-0">
          Anti Begadang Club
        </div>
      </header>

      <!-- ALUR PENGGUNA (FLOWCHART INTERAKSI 6 LANGKAH) -->
      <section id="section-flowchart" class="panel-pixel rounded-[12px] bg-surface overflow-hidden">
        <div class="px-3 sm:px-6 py-3 border-b-3 border-ink bg-brand-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="min-w-0">
            <h2 class="font-pixel text-sm sm:text-lg font-black text-ink uppercase tracking-wide">
              Alur Pengguna
            </h2>
            <p class="text-[11px] sm:text-xs text-ink-muted mt-0.5">
              Dari login sampai skor mingguan tercatat permanen. Ketuk langkah untuk detail.
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] border border-ink bg-brand-100 text-brand-ink font-pixel text-[10px] font-bold uppercase">
              <span class="w-2 h-2 rounded-full bg-brand inline-block"></span>
              Off-Chain
            </span>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] border border-ink bg-purple-100 text-purple-900 font-pixel text-[10px] font-bold uppercase">
              <span class="w-2 h-2 rounded-full bg-purple-600 inline-block"></span>
              On-Chain (Sepolia)
            </span>
          </div>
        </div>

        <div class="p-3 sm:p-6 space-y-3">
          <!-- Hint Navigasi Keyboard Desktop -->
          <div class="flex items-center justify-end gap-2 text-[10px] text-ink-muted font-mono hidden sm:flex">
            <span>Navigasi keyboard: Tab + Enter/Spasi</span>
          </div>

          <!-- FLOWCHART DESKTOP & TABLET (viewBox 940x140, horizontal pipeline, hidden di mobile < 768px) -->
          <div class="hidden md:block w-full">
            <svg class="w-full h-auto max-w-full block" viewBox="0 0 940 140" xmlns="http://www.w3.org/2000/svg" aria-label="Flowchart Alur Pengguna (Desktop)">
              <defs>
                <filter id="flow-shadow" x="-4%" y="-4%" width="112%" height="112%">
                  <feDropShadow dx="2" dy="2" stdDeviation="0" flood-color="#141414" />
                </filter>
                <marker id="fl-sky" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
                  <path d="M0,0 L5,2.5 L0,5 Z" fill="#2563EB" />
                </marker>
                <marker id="fl-purple" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
                  <path d="M0,0 L5,2.5 L0,5 Z" fill="#7E22CE" />
                </marker>
              </defs>

              <!-- Node 1: Login Akun -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 01: Login Akun'"
                (click)="openStepCard('login', $event)"
                (keydown.enter)="openStepCard('login', $event)"
                (keydown.space)="openStepCard('login', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#flow-shadow)"
              >
                <rect x="20" y="20" width="125" height="95" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.8" />
                <rect x="28" y="28" width="68" height="15" rx="3" fill="#FFE0E7" stroke="#141414" stroke-width="1" />
                <text x="62" y="39" font-family="'Pixelify Sans', monospace" font-size="8.5" font-weight="bold" fill="#C21F42" text-anchor="middle">01 · OFF-CHAIN</text>
                <text x="28" y="66" font-family="'Pixelify Sans', monospace" font-size="13" font-weight="bold" fill="#141414">Login Akun</text>
                <text x="28" y="86" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Google / Demo</text>
              </g>

              <path d="M 145 68 L 173 68" stroke="#2563EB" stroke-width="2" fill="none" marker-end="url(#fl-sky)" />

              <!-- Node 2: Rekam Tidur -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 02: Mulai Tidur'"
                (click)="openStepCard('sleep', $event)"
                (keydown.enter)="openStepCard('sleep', $event)"
                (keydown.space)="openStepCard('sleep', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#flow-shadow)"
              >
                <rect x="173" y="20" width="125" height="95" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.8" />
                <rect x="181" y="28" width="68" height="15" rx="3" fill="#FFE0E7" stroke="#141414" stroke-width="1" />
                <text x="215" y="39" font-family="'Pixelify Sans', monospace" font-size="8.5" font-weight="bold" fill="#C21F42" text-anchor="middle">02 · OFF-CHAIN</text>
                <text x="181" y="66" font-family="'Pixelify Sans', monospace" font-size="13" font-weight="bold" fill="#141414">Mulai Tidur</text>
                <text x="181" y="86" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Server Node</text>
              </g>

              <path d="M 298 68 L 326 68" stroke="#2563EB" stroke-width="2" fill="none" marker-end="url(#fl-sky)" />

              <!-- Node 3: Hitung Skor -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 03: Hitung Skor'"
                (click)="openStepCard('score', $event)"
                (keydown.enter)="openStepCard('score', $event)"
                (keydown.space)="openStepCard('score', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#flow-shadow)"
              >
                <rect x="326" y="20" width="125" height="95" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.8" />
                <rect x="334" y="28" width="68" height="15" rx="3" fill="#FFE0E7" stroke="#141414" stroke-width="1" />
                <text x="368" y="39" font-family="'Pixelify Sans', monospace" font-size="8.5" font-weight="bold" fill="#C21F42" text-anchor="middle">03 · OFF-CHAIN</text>
                <text x="334" y="66" font-family="'Pixelify Sans', monospace" font-size="13" font-weight="bold" fill="#141414">Hitung Skor</text>
                <text x="334" y="86" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Durasi & Median</text>
              </g>

              <path d="M 451 68 L 479 68" stroke="#7E22CE" stroke-width="2" fill="none" marker-end="url(#fl-purple)" />

              <!-- Node 4: Mint Kartu (ON-CHAIN) -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 04: Mint Kartu'"
                (click)="openStepCard('mint', $event)"
                (keydown.enter)="openStepCard('mint', $event)"
                (keydown.space)="openStepCard('mint', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#flow-shadow)"
              >
                <rect x="479" y="20" width="125" height="95" rx="8" fill="#FAF5FF" stroke="#7E22CE" stroke-width="2" />
                <rect x="487" y="28" width="68" height="15" rx="3" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1" />
                <text x="521" y="39" font-family="'Pixelify Sans', monospace" font-size="8.5" font-weight="bold" fill="#581C87" text-anchor="middle">04 · ON-CHAIN</text>
                <text x="487" y="66" font-family="'Pixelify Sans', monospace" font-size="13" font-weight="bold" fill="#581C87">Mint Kartu</text>
                <text x="487" y="86" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#141414">SleepCards NFT</text>
              </g>

              <path d="M 604 68 L 632 68" stroke="#64748B" stroke-width="1.8" fill="none" marker-end="url(#fl-sky)" />

              <!-- Node 5: Leaderboard -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 05: Leaderboard'"
                (click)="openStepCard('leaderboard', $event)"
                (keydown.enter)="openStepCard('leaderboard', $event)"
                (keydown.space)="openStepCard('leaderboard', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#flow-shadow)"
              >
                <rect x="632" y="20" width="125" height="95" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.8" />
                <rect x="640" y="28" width="68" height="15" rx="3" fill="#FFE0E7" stroke="#141414" stroke-width="1" />
                <text x="674" y="39" font-family="'Pixelify Sans', monospace" font-size="8.5" font-weight="bold" fill="#C21F42" text-anchor="middle">05 · OFF-CHAIN</text>
                <text x="640" y="66" font-family="'Pixelify Sans', monospace" font-size="13" font-weight="bold" fill="#141414">Leaderboard</text>
                <text x="640" y="86" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Skor Mingguan</text>
              </g>

              <path d="M 757 68 L 785 68" stroke="#7E22CE" stroke-width="2" fill="none" marker-end="url(#fl-purple)" />

              <!-- Node 6: Commit Hash (ON-CHAIN) -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 06: Commit Hash'"
                (click)="openStepCard('commit', $event)"
                (keydown.enter)="openStepCard('commit', $event)"
                (keydown.space)="openStepCard('commit', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#flow-shadow)"
              >
                <rect x="785" y="20" width="125" height="95" rx="8" fill="#FAF5FF" stroke="#7E22CE" stroke-width="2" />
                <rect x="793" y="28" width="68" height="15" rx="3" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1" />
                <text x="827" y="39" font-family="'Pixelify Sans', monospace" font-size="8.5" font-weight="bold" fill="#581C87" text-anchor="middle">06 · ON-CHAIN</text>
                <text x="793" y="66" font-family="'Pixelify Sans', monospace" font-size="13" font-weight="bold" fill="#581C87">Commit Hash</text>
                <text x="793" y="86" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#141414">Keccak-256</text>
              </g>
            </svg>
          </div>

          <!-- FLOWCHART MOBILE (viewBox 240 405, layout vertikal kotak + panah ke bawah, tampil di layar < 768px) -->
          <div class="block md:hidden w-full">
            <svg class="w-full h-auto max-w-full block" viewBox="0 0 240 405" xmlns="http://www.w3.org/2000/svg" aria-label="Flowchart Alur Pengguna (Mobile)">
              <defs>
                <filter id="m-flow-shadow" x="-4%" y="-4%" width="112%" height="112%">
                  <feDropShadow dx="2" dy="2" stdDeviation="0" flood-color="#141414" />
                </filter>
                <marker id="m-fl-sky" markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
                  <path d="M0,0 L4,2 L0,4 Z" fill="#2563EB" />
                </marker>
                <marker id="m-fl-purple" markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
                  <path d="M0,0 L4,2 L0,4 Z" fill="#7E22CE" />
                </marker>
              </defs>

              <!-- Step 1 -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 01: Login Akun'"
                (click)="openStepCard('login', $event)"
                (keydown.enter)="openStepCard('login', $event)"
                (keydown.space)="openStepCard('login', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#m-flow-shadow)"
              >
                <rect x="20" y="10" width="200" height="46" rx="6" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <text x="28" y="24" font-family="'Pixelify Sans', monospace" font-size="8" font-weight="bold" fill="#C21F42">01 · OFF-CHAIN</text>
                <text x="28" y="42" font-family="'Pixelify Sans', monospace" font-size="12" font-weight="bold" fill="#141414">Login Akun</text>
                <text x="120" y="42" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#5C5C5C">Google / Demo</text>
              </g>

              <path d="M 120 56 L 120 72" stroke="#2563EB" stroke-width="1.8" fill="none" marker-end="url(#m-fl-sky)" />

              <!-- Step 2 -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 02: Mulai Tidur'"
                (click)="openStepCard('sleep', $event)"
                (keydown.enter)="openStepCard('sleep', $event)"
                (keydown.space)="openStepCard('sleep', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#m-flow-shadow)"
              >
                <rect x="20" y="74" width="200" height="46" rx="6" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <text x="28" y="88" font-family="'Pixelify Sans', monospace" font-size="8" font-weight="bold" fill="#C21F42">02 · OFF-CHAIN</text>
                <text x="28" y="106" font-family="'Pixelify Sans', monospace" font-size="12" font-weight="bold" fill="#141414">Mulai Tidur</text>
                <text x="120" y="106" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#5C5C5C">Server Node</text>
              </g>

              <path d="M 120 120 L 120 136" stroke="#2563EB" stroke-width="1.8" fill="none" marker-end="url(#m-fl-sky)" />

              <!-- Step 3 -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 03: Hitung Skor'"
                (click)="openStepCard('score', $event)"
                (keydown.enter)="openStepCard('score', $event)"
                (keydown.space)="openStepCard('score', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#m-flow-shadow)"
              >
                <rect x="20" y="138" width="200" height="46" rx="6" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <text x="28" y="152" font-family="'Pixelify Sans', monospace" font-size="8" font-weight="bold" fill="#C21F42">03 · OFF-CHAIN</text>
                <text x="28" y="170" font-family="'Pixelify Sans', monospace" font-size="12" font-weight="bold" fill="#141414">Hitung Skor</text>
                <text x="120" y="170" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#5C5C5C">Durasi & Median</text>
              </g>

              <path d="M 120 184 L 120 200" stroke="#7E22CE" stroke-width="2" fill="none" marker-end="url(#m-fl-purple)" />

              <!-- Step 4 (ON-CHAIN) -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 04: Mint Kartu'"
                (click)="openStepCard('mint', $event)"
                (keydown.enter)="openStepCard('mint', $event)"
                (keydown.space)="openStepCard('mint', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#m-flow-shadow)"
              >
                <rect x="20" y="202" width="200" height="46" rx="6" fill="#FAF5FF" stroke="#7E22CE" stroke-width="1.8" />
                <text x="28" y="216" font-family="'Pixelify Sans', monospace" font-size="8" font-weight="bold" fill="#581C87">04 · ON-CHAIN</text>
                <text x="28" y="234" font-family="'Pixelify Sans', monospace" font-size="12" font-weight="bold" fill="#581C87">Mint Kartu</text>
                <text x="120" y="234" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#141414">SleepCards NFT</text>
              </g>

              <path d="M 120 248 L 120 264" stroke="#64748B" stroke-width="1.5" fill="none" marker-end="url(#m-fl-sky)" />

              <!-- Step 5 -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 05: Leaderboard'"
                (click)="openStepCard('leaderboard', $event)"
                (keydown.enter)="openStepCard('leaderboard', $event)"
                (keydown.space)="openStepCard('leaderboard', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#m-flow-shadow)"
              >
                <rect x="20" y="266" width="200" height="46" rx="6" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <text x="28" y="280" font-family="'Pixelify Sans', monospace" font-size="8" font-weight="bold" fill="#C21F42">05 · OFF-CHAIN</text>
                <text x="28" y="298" font-family="'Pixelify Sans', monospace" font-size="12" font-weight="bold" fill="#141414">Leaderboard</text>
                <text x="120" y="298" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#5C5C5C">Skor Mingguan</text>
              </g>

              <path d="M 120 312 L 120 328" stroke="#7E22CE" stroke-width="2" fill="none" marker-end="url(#m-fl-purple)" />

              <!-- Step 6 (ON-CHAIN) -->
              <g
                tabindex="0"
                role="button"
                [attr.aria-label]="'Detail langkah 06: Commit Hash'"
                (click)="openStepCard('commit', $event)"
                (keydown.enter)="openStepCard('commit', $event)"
                (keydown.space)="openStepCard('commit', $event); $event.preventDefault()"
                class="flow-step-node"
                filter="url(#m-flow-shadow)"
              >
                <rect x="20" y="330" width="200" height="46" rx="6" fill="#FAF5FF" stroke="#7E22CE" stroke-width="1.8" />
                <text x="28" y="344" font-family="'Pixelify Sans', monospace" font-size="8" font-weight="bold" fill="#581C87">06 · ON-CHAIN</text>
                <text x="28" y="362" font-family="'Pixelify Sans', monospace" font-size="12" font-weight="bold" fill="#581C87">Commit Hash</text>
                <text x="120" y="362" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#141414">Keccak-256</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      <!-- ARSITEKTUR SISTEM -->
      <section class="panel-pixel rounded-[12px] bg-surface overflow-hidden">
        <div class="px-3 sm:px-6 py-3 border-b-3 border-ink bg-brand-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="min-w-0">
            <h2 class="font-pixel text-sm sm:text-lg font-black text-ink uppercase tracking-wide">
              Arsitektur Sistem
            </h2>
            <p class="text-[11px] sm:text-xs text-ink-muted mt-0.5">
              Komputasi privat off-chain dan audit publik smart contract Sepolia.
            </p>
          </div>

          <!-- Legend -->
          <div class="flex items-center gap-2 flex-wrap shrink-0 pt-1 sm:pt-0">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] border border-ink bg-brand-100 text-brand-ink font-pixel text-[10px] font-bold uppercase">
              <span class="w-2 h-2 rounded-full bg-brand inline-block border border-ink"></span>
              Off-Chain
            </span>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] border border-ink bg-purple-100 text-purple-900 font-pixel text-[10px] font-bold uppercase">
              <span class="w-2 h-2 rounded-full bg-purple-600 inline-block border border-ink"></span>
              On-Chain (Sepolia)
            </span>
          </div>
        </div>

        <div class="p-3 sm:p-6 space-y-4">
          <!-- RINGKASAN LAYAR KECIL (Galaxy Fold 280px / Z Fold 344px / Mobile < 768px) -->
          <div class="block md:hidden space-y-3">
            <div class="rounded-[8px] border-2 border-ink bg-paper p-3 space-y-2">
              <span class="font-pixel text-xs font-bold uppercase text-ink block border-b border-ink/20 pb-1">
                Komponen Sistem
              </span>
              <div class="space-y-2 text-xs">
                <div class="p-2.5 rounded bg-surface border border-ink/30 space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-brand inline-block"></span>
                    <span class="font-pixel font-bold text-ink text-xs uppercase">Off-Chain</span>
                  </div>
                  <p class="text-[11px] font-mono text-ink leading-snug">
                    Angular SPA · Hono API · SQLite DB (5 Tabel) · Vault AES-256 · Google Auth (3 Demo) · Notifikasi In-App
                  </p>
                </div>
                <div class="p-2.5 rounded bg-purple-50 border border-purple-800 space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-purple-600 inline-block"></span>
                    <span class="font-pixel font-bold text-purple-900 text-xs uppercase">On-Chain (Sepolia)</span>
                  </div>
                  <p class="text-[11px] font-mono text-purple-900 leading-snug">
                    SleepCards (ERC-5192) · LeaderboardCommit · Sepolia Network
                  </p>
                </div>
              </div>
            </div>

            <!-- Satu-satunya tombol di mobile -->
            <button
              type="button"
              (click)="openModal($event)"
              #modalTriggerMobile
              class="w-full py-2.5 px-3 btn-pixel btn-pixel--brand rounded-[8px] font-pixel text-xs font-bold uppercase flex items-center justify-center cursor-pointer select-none"
            >
              Lihat diagram penuh
            </button>
          </div>

          <!-- DIAGRAM DESKTOP & TABLET / FOLD TERBUKA (viewBox 940x470, hidden di mobile < 768px) -->
          <div class="hidden md:block w-full">
            <svg class="w-full h-auto max-w-full block" viewBox="0 0 940 470" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram Arsitektur Sistem SimpliSleep (Desktop)">
              <defs>
                <filter id="d-shadow" x="-4%" y="-4%" width="112%" height="112%">
                  <feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#141414" />
                </filter>
                <filter id="d-shadow-sm" x="-4%" y="-4%" width="112%" height="112%">
                  <feDropShadow dx="2" dy="2" stdDeviation="0" flood-color="#141414" />
                </filter>

                <marker id="d-ah-sky" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#2563EB" />
                </marker>
                <marker id="d-ah-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#7E22CE" />
                </marker>
                <marker id="d-ah-emerald" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#059669" />
                </marker>
                <marker id="d-ah-slate" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#64748B" />
                </marker>
              </defs>

              <!-- ZONE 1: OFF-CHAIN -->
              <rect x="15" y="20" width="535" height="430" rx="12" fill="#FFF1F4" fill-opacity="0.45" stroke="#141414" stroke-width="2" stroke-dasharray="6,4" />
              <rect x="30" y="32" width="220" height="24" rx="6" fill="#FFE0E7" stroke="#141414" stroke-width="1.5" />
              <circle cx="42" cy="44" r="4" fill="#D42A4C" />
              <text x="52" y="48" font-family="'Pixelify Sans', monospace" font-size="11" font-weight="bold" fill="#C21F42" letter-spacing="0.05em">OFF-CHAIN · LAYANAN PRIVAT</text>
              <text x="265" y="48" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Data jam tidur terisolasi murni di database lokal</text>

              <!-- ZONE 2: ON-CHAIN -->
              <rect x="595" y="20" width="330" height="430" rx="12" fill="#FAF5FF" fill-opacity="0.65" stroke="#7E22CE" stroke-width="2" stroke-dasharray="6,4" />
              <rect x="610" y="32" width="210" height="24" rx="6" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1.5" />
              <circle cx="622" cy="44" r="4" fill="#7E22CE" />
              <text x="632" y="48" font-family="'Pixelify Sans', monospace" font-size="11" font-weight="bold" fill="#581C87" letter-spacing="0.05em">ON-CHAIN · SEPOLIA TESTNET</text>
              <text x="612" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#6B21A8">Verifikasi publik immutable tanpa membocorkan privasi</text>

              <!-- WIRES -->
              <path d="M 175 220 L 215 220" stroke="#2563EB" stroke-width="2" fill="none" marker-end="url(#d-ah-sky)" />
              <path d="M 290 165 L 290 137" stroke="#64748B" stroke-width="1.5" fill="none" marker-end="url(#d-ah-slate)" />
              <path d="M 290 275 L 290 305" stroke="#64748B" stroke-width="1.5" fill="none" marker-end="url(#d-ah-slate)" />
              <path d="M 365 185 C 382 185, 382 110, 400 110" stroke="#475569" stroke-width="1.5" fill="none" marker-end="url(#d-ah-slate)" />
              <path d="M 365 255 C 382 255, 382 330, 400 330" stroke="#D97706" stroke-width="1.5" fill="none" marker-end="url(#d-ah-slate)" />
              <path d="M 365 205 C 470 205, 520 137, 620 137" stroke="#7E22CE" stroke-width="2" fill="none" marker-end="url(#d-ah-purple)" />
              <path d="M 365 235 C 470 235, 520 267, 620 267" stroke="#7E22CE" stroke-width="2" fill="none" marker-end="url(#d-ah-purple)" />
              <path d="M 100 275 C 100 425, 500 425, 620 387" stroke="#059669" stroke-width="2" stroke-dasharray="5,4" fill="none" marker-end="url(#d-ah-emerald)" />

              <!-- NODE 1: Web Client -->
              <g filter="url(#d-shadow)">
                <rect x="30" y="165" width="145" height="110" rx="10" fill="#FFFFFF" stroke="#141414" stroke-width="2" />
                <rect x="42" y="177" width="24" height="24" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5" />
                <path d="M46 189 l4 4 l8 -8" stroke="#10B981" stroke-width="2" fill="none" />
                <text x="73" y="193" font-family="'Pixelify Sans', monospace" font-size="12.5" font-weight="bold" fill="#141414">Web Client</text>
                <text x="42" y="218" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" fill="#141414">Angular 22 · SPA</text>
                <text x="42" y="233" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Tailwind · Toast &amp; Notif</text>
                <text x="42" y="258" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="#059669">:4200 · Browser</text>
              </g>

              <!-- NODE 2: Backend API -->
              <g filter="url(#d-shadow)">
                <rect x="215" y="165" width="150" height="110" rx="10" fill="#FFFFFF" stroke="#141414" stroke-width="2" />
                <rect x="227" y="177" width="24" height="24" rx="6" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.5" />
                <circle cx="239" cy="189" r="6" stroke="#2563EB" stroke-width="1.5" fill="none" />
                <path d="M239 185 v4 h3" stroke="#2563EB" stroke-width="1.5" fill="none" />
                <text x="258" y="193" font-family="'Pixelify Sans', monospace" font-size="12.5" font-weight="bold" fill="#141414">Backend API</text>
                <text x="227" y="218" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" fill="#141414">Node.js · Hono REST</text>
                <text x="227" y="233" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Server Time & viem relay</text>
                <text x="227" y="258" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="#2563EB">:3100 · HTTP API</text>
              </g>

              <!-- NODE 3: Google Auth -->
              <g filter="url(#d-shadow-sm)">
                <rect x="215" y="65" width="150" height="72" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <rect x="225" y="75" width="20" height="20" rx="4" fill="#F8FAFC" stroke="#64748B" stroke-width="1.2" />
                <circle cx="235" cy="85" r="4" stroke="#64748B" stroke-width="1.5" fill="none" />
                <text x="252" y="89" font-family="'Pixelify Sans', monospace" font-size="11.5" font-weight="bold" fill="#141414">Google Auth</text>
                <text x="225" y="109" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">google-auth-library</text>
                <text x="225" y="124" font-family="'JetBrains Mono', monospace" font-size="9" fill="#64748B">OAuth 2.0 · 3 Akun Demo</text>
              </g>

              <!-- NODE 4: SQLite Database -->
              <g filter="url(#d-shadow-sm)">
                <rect x="400" y="65" width="130" height="90" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <rect x="410" y="75" width="20" height="20" rx="4" fill="#F1F5F9" stroke="#475569" stroke-width="1.2" />
                <ellipse cx="420" cy="83" rx="5" ry="2" stroke="#475569" stroke-width="1.2" fill="none" />
                <path d="M415 83 v6 c0 1.5 2.2 2 5 2 s5 -0.5 5 -2 v-6" stroke="#475569" stroke-width="1.2" fill="none" />
                <text x="437" y="90" font-family="'Pixelify Sans', monospace" font-size="11.5" font-weight="bold" fill="#141414">SQLite DB</text>
                <text x="410" y="112" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">node:sqlite Sync</text>
                <text x="410" y="127" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">5 Tabel · WAL Mode</text>
                <text x="410" y="145" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" fill="#475569">simplisleep.db</text>
              </g>

              <!-- NODE 5: Custodial Vault -->
              <g filter="url(#d-shadow-sm)">
                <rect x="400" y="285" width="130" height="90" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <rect x="410" y="295" width="20" height="20" rx="4" fill="#FEF3C7" stroke="#D97706" stroke-width="1.2" />
                <path d="M420 300 l4 2 v4 c0 3 -4 5 -4 5 s-4 -2 -4 -5 v-4 z" stroke="#D97706" stroke-width="1.2" fill="none" />
                <text x="437" y="310" font-family="'Pixelify Sans', monospace" font-size="11" font-weight="bold" fill="#141414">Custodial Vault</text>
                <text x="410" y="332" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">AES-256-GCM</text>
                <text x="410" y="347" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">Encrypted Keys</text>
                <text x="410" y="365" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" fill="#D97706">viem signer</text>
              </g>

              <!-- NODE 9: Notifikasi In-App -->
              <g filter="url(#d-shadow-sm)">
                <rect x="215" y="305" width="150" height="72" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <rect x="225" y="315" width="20" height="20" rx="4" fill="#FEF2F2" stroke="#EF4444" stroke-width="1.2" />
                <path d="M235 321 c-2 0 -3 1.5 -3 3 v3 l-1 1 h8 l-1 -1 v-3 c0 -1.5 -1 -3 -3 -3 z M234 329 a1 1 0 0 0 2 0" stroke="#EF4444" stroke-width="1.2" fill="none" />
                <text x="252" y="329" font-family="'Pixelify Sans', monospace" font-size="11.5" font-weight="bold" fill="#141414">Notifikasi In-App</text>
                <text x="225" y="349" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">Pengingat Tidur · 429</text>
                <text x="225" y="364" font-family="'JetBrains Mono', monospace" font-size="9" fill="#64748B">Cooldown 5m · Web Notif</text>
              </g>

              <!-- NODE 6: SleepCards.sol -->
              <g filter="url(#d-shadow)">
                <rect x="620" y="85" width="285" height="105" rx="10" fill="#FFFFFF" stroke="#7E22CE" stroke-width="2" />
                <rect x="632" y="97" width="24" height="24" rx="6" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1.5" />
                <rect x="637" y="102" width="14" height="14" rx="2" stroke="#7E22CE" stroke-width="1.5" fill="none" />
                <circle cx="644" cy="109" r="2" fill="#7E22CE" />
                <text x="663" y="113" font-family="'Pixelify Sans', monospace" font-size="13" font-weight="bold" fill="#581C87">SleepCards.sol</text>
                <text x="632" y="139" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" fill="#141414">ERC-721 + ERC-5192 (Soulbound Locked)</text>
                <text x="632" y="156" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Mint kartu terikat permanen ke wallet custodial</text>
                <text x="632" y="175" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="bold" fill="#7E22CE">Locked(tokenId) · Non-transferable</text>
              </g>

              <!-- NODE 7: LeaderboardCommit.sol -->
              <g filter="url(#d-shadow)">
                <rect x="620" y="215" width="285" height="105" rx="10" fill="#FFFFFF" stroke="#7E22CE" stroke-width="2" />
                <rect x="632" y="227" width="24" height="24" rx="6" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1.5" />
                <path d="M638 234 h12 M638 244 h12 M642 230 v18 M648 230 v18" stroke="#7E22CE" stroke-width="1.5" />
                <text x="663" y="243" font-family="'Pixelify Sans', monospace" font-size="13" font-weight="bold" fill="#581C87">LeaderboardCommit.sol</text>
                <text x="632" y="269" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" fill="#141414">Keccak-256 Weekly Snapshot Hash Commit</text>
                <text x="632" y="286" font-family="'JetBrains Mono', monospace" font-size="9.5" fill="#5C5C5C">commit(bytes32 weekId, bytes32 hash)</text>
                <text x="632" y="305" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="bold" fill="#7E22CE">Immutable: 1x commit per weekId</text>
              </g>

              <!-- NODE 8: Ethereum Sepolia Testnet -->
              <g filter="url(#d-shadow-sm)">
                <rect x="620" y="345" width="285" height="85" rx="8" fill="#FAF5FF" stroke="#9333EA" stroke-width="1.5" />
                <rect x="632" y="357" width="20" height="20" rx="4" fill="#F3E8FF" stroke="#9333EA" stroke-width="1.2" />
                <path d="M642 361 l4 6 l-4 2 l-4 -2 z M642 371 l4 -2 l-4 6 l-4 -6 z" stroke="#9333EA" stroke-width="1.2" fill="none" />
                <text x="659" y="371" font-family="'Pixelify Sans', monospace" font-size="12" font-weight="bold" fill="#581C87">Ethereum Sepolia Testnet</text>
                <text x="632" y="394" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#6B21A8">Validator Node Publik & Sepolia RPC Node</text>
                <text x="632" y="412" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="bold" fill="#7E22CE">Chain ID: 11155111 · Audit Tanpa Gas Karyawan</text>
              </g>

              <!-- WIRE LABELS LAYER -->
              <rect x="181" y="212" width="28" height="15" rx="3" fill="#EFF6FF" stroke="#2563EB" stroke-width="1" />
              <text x="195" y="223" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="bold" fill="#2563EB" text-anchor="middle">REST</text>

              <rect x="274" y="144" width="32" height="14" rx="3" fill="#F8FAFC" stroke="#64748B" stroke-width="1" />
              <text x="290" y="154" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#64748B" text-anchor="middle">OAuth</text>

              <rect x="370" y="140" width="22" height="14" rx="3" fill="#F1F5F9" stroke="#475569" stroke-width="1" />
              <text x="381" y="150" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#475569" text-anchor="middle">SQL</text>

              <rect x="370" y="285" width="22" height="14" rx="3" fill="#FEF3C7" stroke="#D97706" stroke-width="1" />
              <text x="381" y="295" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#D97706" text-anchor="middle">AES</text>

              <rect x="274" y="284" width="32" height="14" rx="3" fill="#F8FAFC" stroke="#64748B" stroke-width="1" />
              <text x="290" y="294" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#64748B" text-anchor="middle">Notif</text>

              <rect x="536" y="148" width="78" height="17" rx="3" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1" />
              <text x="575" y="160" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="bold" fill="#581C87" text-anchor="middle">viem: mint(card)</text>

              <rect x="532" y="242" width="86" height="17" rx="3" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1" />
              <text x="575" y="254" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#581C87" text-anchor="middle">viem: commit(hash)</text>

              <rect x="215" y="415" width="235" height="18" rx="4" fill="#ECFDF5" stroke="#059669" stroke-width="1" />
              <text x="332" y="427" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="bold" fill="#047857" text-anchor="middle">viem di Leaderboard: verifikasi hash (read-only)</text>
            </svg>
          </div>
        </div>
      </section>

      <!-- STACK TEKNOLOGI (CHIPS / BADGES SESUAI PACKAGE.JSON) -->
      <section class="panel-pixel rounded-[12px] bg-surface overflow-hidden">
        <div class="px-3 sm:px-6 py-3 border-b-3 border-ink bg-brand-50">
          <h2 class="font-pixel text-sm sm:text-lg font-black text-ink uppercase tracking-wide">
            Stack Teknologi
          </h2>
          <p class="text-[11px] sm:text-xs text-ink-muted mt-0.5">
            Teknologi dan pustaka monorepo sesuai package.json.
          </p>
        </div>

        <div class="p-3 sm:p-6 space-y-4">
          <!-- Kategori 1: Frontend Web -->
          <div class="space-y-1.5">
            <span class="font-pixel text-xs font-bold text-brand-ink uppercase tracking-wider block">
              Frontend Client (apps/web)
            </span>
            <div class="flex flex-wrap gap-1.5 sm:gap-2">
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">Angular</span>
                <span class="font-mono text-[11px] text-ink-muted">v22.2.0</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">Angular CLI</span>
                <span class="font-mono text-[11px] text-ink-muted">v22.2.6</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">Tailwind CSS</span>
                <span class="font-mono text-[11px] text-ink-muted">v4.0.0</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">GSAP</span>
                <span class="font-mono text-[11px] text-ink-muted">v3.12.7</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">Viem</span>
                <span class="font-mono text-[11px] text-ink-muted">v2.58.1</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">RxJS</span>
                <span class="font-mono text-[11px] text-ink-muted">v7.8.0</span>
              </span>
            </div>
          </div>

          <!-- Kategori 2: Backend API -->
          <div class="space-y-1.5">
            <span class="font-pixel text-xs font-bold text-brand-ink uppercase tracking-wider block">
              Backend REST Server (apps/api)
            </span>
            <div class="flex flex-wrap gap-1.5 sm:gap-2">
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">Node.js</span>
                <span class="font-mono text-[11px] text-ink-muted">&ge; v22.5</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">Hono</span>
                <span class="font-mono text-[11px] text-ink-muted">v4.7.2</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">&#64;hono/node-server</span>
                <span class="font-mono text-[11px] text-ink-muted">v1.13.8</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">SQLite (node:sqlite)</span>
                <span class="font-mono text-[11px] text-ink-muted">Native Sync</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">google-auth-library</span>
                <span class="font-mono text-[11px] text-ink-muted">v11.3.4</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">Zod</span>
                <span class="font-mono text-[11px] text-ink-muted">v4.6.7</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">TSX</span>
                <span class="font-mono text-[11px] text-ink-muted">v4.19.3</span>
              </span>
            </div>
          </div>

          <!-- Kategori 3: Smart Contracts -->
          <div class="space-y-1.5">
            <span class="font-pixel text-xs font-bold text-purple-900 uppercase tracking-wider block">
              Smart Contracts & Web3 (packages/contracts)
            </span>
            <div class="flex flex-wrap gap-1.5 sm:gap-2">
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-purple-50 border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-purple-950">Solidity</span>
                <span class="font-mono text-[11px] text-purple-800">^0.8.28</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-purple-50 border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-purple-950">&#64;openzeppelin/contracts</span>
                <span class="font-mono text-[11px] text-purple-800">v5.2.0</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-purple-50 border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-purple-950">Hardhat</span>
                <span class="font-mono text-[11px] text-purple-800">v2.22.19</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-purple-50 border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-purple-950">ERC-5192</span>
                <span class="font-mono text-[11px] text-purple-800">Soulbound Locked</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-purple-50 border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-purple-950">Ethereum Sepolia</span>
                <span class="font-mono text-[11px] text-purple-800">Testnet</span>
              </span>
            </div>
          </div>

          <!-- Kategori 4: Monorepo & Core Shared -->
          <div class="space-y-1.5">
            <span class="font-pixel text-xs font-bold text-ink uppercase tracking-wider block">
              Workspace & Domain Library (packages/shared)
            </span>
            <div class="flex flex-wrap gap-1.5 sm:gap-2">
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">pnpm Workspace</span>
                <span class="font-mono text-[11px] text-ink-muted">&ge; v9.0.0</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">TypeScript</span>
                <span class="font-mono text-[11px] text-ink-muted">v5.7 / v6.0</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">Vitest</span>
                <span class="font-mono text-[11px] text-ink-muted">v3 / v5</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">Concurrently</span>
                <span class="font-mono text-[11px] text-ink-muted">v9.1.2</span>
              </span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-surface border-2 border-ink rounded-[6px] pixel-shadow-sm text-xs font-medium inline-flex items-center gap-1.5">
                <span class="font-bold text-ink">AES-256-GCM</span>
                <span class="font-mono text-[11px] text-ink-muted">Node Crypto</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer Note Ringkas -->
      <footer class="panel-pixel rounded-[12px] p-3 sm:p-4 bg-surface text-center space-y-1">
        <p class="font-pixel text-xs sm:text-sm font-bold text-ink uppercase">
          SimpliSleep • Anti Begadang Club
        </p>
        <p class="text-[11px] text-ink-muted font-mono">
          "Karena tidur cukup adalah performa kerja terbaikmu."
        </p>
      </footer>
    </div>

  <!-- DETAIL STEP MODAL CARD (POPUP PENJELASAN LANGKAH ALUR) -->
  <div
    *ngIf="activeStep"
    role="dialog"
    aria-modal="true"
    [attr.aria-labelledby]="'step-title-' + activeStep.id"
    (click)="onCardBackdropClick($event)"
    id="step-card-backdrop"
    class="fixed inset-0 z-[99999] bg-ink/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto popup-backdrop-anim"
    [class.is-closing]="isStepClosing"
  >
    <div
      class="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto bg-surface border-3 border-ink rounded-[14px] shadow-[6px_6px_0_#141414] p-4 sm:p-6 space-y-4 my-auto popup-panel-anim"
      [class.is-closing]="isStepClosing"
      (click)="$event.stopPropagation()"
    >
        <!-- Header: Step Pill, Badge, and Accessible Close Button -->
        <div class="flex items-start justify-between gap-3 border-b-2 border-ink pb-3">
          <div class="min-w-0 space-y-1.5">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="px-2 py-0.5 rounded-[5px] border border-ink font-pixel text-[10px] font-bold uppercase tracking-wider"
                [ngClass]="activeStep.type === 'on-chain' ? 'bg-purple-100 text-purple-900 border-purple-800' : 'bg-brand-100 text-brand-ink border-brand-ink'"
              >
                Langkah {{ activeStep.stepNumber }}
              </span>
              <span
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] border border-ink font-pixel text-[10px] font-bold uppercase"
                [ngClass]="activeStep.type === 'on-chain' ? 'bg-purple-50 text-purple-900 border-purple-800' : 'bg-surface text-ink border-ink'"
              >
                <span
                  class="w-2 h-2 rounded-full inline-block border border-ink"
                  [ngClass]="activeStep.type === 'on-chain' ? 'bg-purple-600' : 'bg-brand'"
                ></span>
                {{ activeStep.badge }}
              </span>
            </div>
            <h3 [id]="'step-title-' + activeStep.id" class="font-pixel text-base sm:text-xl font-black text-ink uppercase tracking-tight leading-snug">
              {{ activeStep.title }}
            </h3>
          </div>

          <!-- Close Button (Target Minimal 40px) -->
          <button
            type="button"
            (click)="closeStepCard()"
            #stepCardCloseButton
            class="w-10 h-10 min-w-[40px] min-h-[40px] p-0 rounded-[8px] border-2 border-ink bg-brand hover:bg-brand-strong text-white flex items-center justify-center cursor-pointer shadow-[2px_2px_0_#141414] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all shrink-0 focus-visible:outline-3 focus-visible:outline-brand-ink"
            aria-label="Tutup detail langkah"
          >
            <svg class="w-5 h-5 block" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Formula Box (bila ada rumus atau spesifikasi teknis) -->
        <div *ngIf="activeStep.formula" class="p-2.5 rounded-[8px] border-2 border-ink bg-paper font-mono text-[11px] sm:text-xs text-ink space-y-1">
          <span class="font-pixel text-[10px] uppercase font-bold text-ink-muted block">Rumus / Spesifikasi:</span>
          <p class="font-bold text-brand-ink leading-snug break-words">
            {{ activeStep.formula }}
          </p>
        </div>

        <!-- Detail Points (2-4 poin ringkas dari kode) -->
        <div class="space-y-2">
          <span class="font-pixel text-[10px] uppercase font-bold text-ink-muted block">Detail Implementasi:</span>
          <ul class="space-y-2 text-xs sm:text-sm text-ink leading-relaxed font-sans">
            <li *ngFor="let point of activeStep.points" class="flex items-start gap-2">
              <span
                class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                [ngClass]="activeStep.type === 'on-chain' ? 'bg-purple-600' : 'bg-brand'"
              ></span>
              <span class="leading-normal">{{ point }}</span>
            </li>
          </ul>
        </div>

        <!-- Footer / Dismiss -->
        <div class="pt-2 border-t border-ink/20 flex items-center justify-between text-[11px] text-ink-muted font-mono">
          <span>Esc atau klik luar untuk tutup</span>
          <button
            type="button"
            (click)="closeStepCard()"
            class="font-pixel font-bold uppercase text-brand-ink hover:underline cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
    <!-- MODAL DIAGRAM PENUH (TRUE FULLSCREEN: fixed inset-0, z-[99999], 100dvh, w-screen) -->
    <div
      *ngIf="isModalOpen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      class="fixed inset-0 z-[99999] w-screen h-[100dvh] bg-ink/60 backdrop-blur-xs flex flex-col overflow-hidden m-0 p-0 popup-backdrop-anim"
      [class.is-closing]="isModalClosing"
    >
      <div
        class="w-full h-full bg-surface flex flex-col overflow-hidden popup-panel-anim"
        [class.is-closing]="isModalClosing"
      >
        <!-- Modal Header (Short Title & Zoom Controls & Touch-friendly X Button) -->
        <div class="px-2 sm:px-6 py-2 border-b-3 border-ink bg-brand-50 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
        <div class="min-w-0 pr-1">
          <h3 id="modal-title" class="font-pixel text-[11px] sm:text-sm md:text-base font-black text-ink uppercase tracking-wide whitespace-nowrap">
            Arsitektur Sistem
          </h3>
        </div>

        <!-- Controls: Zoom -/+, Zoom Level, and Accessible 40px X Close Button -->
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div class="flex items-center border-2 border-ink rounded-[8px] bg-surface overflow-hidden shadow-[2px_2px_0_#141414] h-10">
            <button
              type="button"
              (click)="zoomOut()"
              class="w-7 sm:w-9 h-full flex items-center justify-center font-bold text-sm hover:bg-brand-50 active:bg-brand-100 cursor-pointer select-none"
              aria-label="Perkecil diagram"
            >
              -
            </button>
            <span class="font-mono text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 border-x-2 border-ink select-none min-w-[36px] sm:min-w-[42px] text-center leading-none">
              {{ Math.round(zoomLevel * 100) }}%
            </span>
            <button
              type="button"
              (click)="zoomIn()"
              class="w-7 sm:w-9 h-full flex items-center justify-center font-bold text-sm hover:bg-brand-50 active:bg-brand-100 cursor-pointer select-none"
              aria-label="Perbesar diagram"
            >
              +
            </button>
          </div>

          <button
            type="button"
            (click)="closeModal()"
            #closeButton
            class="w-10 h-10 min-w-[40px] min-h-[40px] p-0 rounded-[8px] border-2 border-ink bg-brand hover:bg-brand-strong text-white flex items-center justify-center cursor-pointer shadow-[2px_2px_0_#141414] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all shrink-0 focus-visible:outline-3 focus-visible:outline-brand-ink"
            aria-label="Tutup modal"
          >
            <svg class="w-5 h-5 block" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body (Fit-to-Height on Mobile Portrait, Zoomable & Scrollable Pan) -->
      <div
        id="modal-scrollable-body"
        (click)="onBackdropClick($event)"
        class="overflow-auto flex-1 p-2 sm:p-4 bg-paper/60 cursor-default"
      >
        <div
          class="transition-all duration-150 origin-top-left"
          [style.width]="(zoomLevel * 100) + '%'"
        >
          <div class="p-2 sm:p-3 bg-surface rounded-[8px] border-2 border-ink shadow-[2px_2px_0_#141414]">
            <svg class="w-full h-auto block" viewBox="0 0 940 470" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram Arsitektur Sistem Lengkap">
              <defs>
                <filter id="m-d-shadow" x="-4%" y="-4%" width="112%" height="112%">
                  <feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#141414" />
                </filter>
                <filter id="m-d-shadow-sm" x="-4%" y="-4%" width="112%" height="112%">
                  <feDropShadow dx="2" dy="2" stdDeviation="0" flood-color="#141414" />
                </filter>
                <marker id="m-modal-sky" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#2563EB" />
                </marker>
                <marker id="m-modal-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#7E22CE" />
                </marker>
                <marker id="m-modal-emerald" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#059669" />
                </marker>
                <marker id="m-modal-slate" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#64748B" />
                </marker>
              </defs>

              <!-- ZONE 1: OFF-CHAIN -->
              <rect x="15" y="20" width="535" height="430" rx="12" fill="#FFF1F4" fill-opacity="0.45" stroke="#141414" stroke-width="2" stroke-dasharray="6,4" />
              <rect x="30" y="32" width="220" height="24" rx="6" fill="#FFE0E7" stroke="#141414" stroke-width="1.5" />
              <circle cx="42" cy="44" r="4" fill="#D42A4C" />
              <text x="52" y="48" font-family="'Pixelify Sans', monospace" font-size="11" font-weight="bold" fill="#C21F42" letter-spacing="0.05em">OFF-CHAIN · LAYANAN PRIVAT</text>
              <text x="265" y="48" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Data jam tidur terisolasi murni di database lokal</text>

              <!-- ZONE 2: ON-CHAIN -->
              <rect x="595" y="20" width="330" height="430" rx="12" fill="#FAF5FF" fill-opacity="0.65" stroke="#7E22CE" stroke-width="2" stroke-dasharray="6,4" />
              <rect x="610" y="32" width="210" height="24" rx="6" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1.5" />
              <circle cx="622" cy="44" r="4" fill="#7E22CE" />
              <text x="632" y="48" font-family="'Pixelify Sans', monospace" font-size="11" font-weight="bold" fill="#581C87" letter-spacing="0.05em">ON-CHAIN · SEPOLIA TESTNET</text>
              <text x="612" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#6B21A8">Verifikasi publik immutable tanpa membocorkan privasi</text>

              <!-- WIRES -->
              <path d="M 175 220 L 215 220" stroke="#2563EB" stroke-width="2" fill="none" marker-end="url(#m-modal-sky)" />
              <path d="M 290 165 L 290 137" stroke="#64748B" stroke-width="1.5" fill="none" marker-end="url(#m-modal-slate)" />
              <path d="M 290 275 L 290 305" stroke="#64748B" stroke-width="1.5" fill="none" marker-end="url(#m-modal-slate)" />
              <path d="M 365 185 C 382 185, 382 110, 400 110" stroke="#475569" stroke-width="1.5" fill="none" marker-end="url(#m-modal-slate)" />
              <path d="M 365 255 C 382 255, 382 330, 400 330" stroke="#D97706" stroke-width="1.5" fill="none" marker-end="url(#m-modal-slate)" />
              <path d="M 365 205 C 470 205, 520 137, 620 137" stroke="#7E22CE" stroke-width="2" fill="none" marker-end="url(#m-modal-purple)" />
              <path d="M 365 235 C 470 235, 520 267, 620 267" stroke="#7E22CE" stroke-width="2" fill="none" marker-end="url(#m-modal-purple)" />
              <path d="M 100 275 C 100 425, 500 425, 620 387" stroke="#059669" stroke-width="2" stroke-dasharray="5,4" fill="none" marker-end="url(#m-modal-emerald)" />

              <!-- NODE 1: Web Client -->
              <g filter="url(#m-d-shadow)">
                <rect x="30" y="165" width="145" height="110" rx="10" fill="#FFFFFF" stroke="#141414" stroke-width="2" />
                <rect x="42" y="177" width="24" height="24" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5" />
                <path d="M46 189 l4 4 l8 -8" stroke="#10B981" stroke-width="2" fill="none" />
                <text x="73" y="193" font-family="'Pixelify Sans', monospace" font-size="12.5" font-weight="bold" fill="#141414">Web Client</text>
                <text x="42" y="218" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" fill="#141414">Angular 22 · SPA</text>
                <text x="42" y="233" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Tailwind · Toast &amp; Notif</text>
                <text x="42" y="258" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="#059669">:4200 · Browser</text>
              </g>

              <!-- NODE 2: Backend API -->
              <g filter="url(#m-d-shadow)">
                <rect x="215" y="165" width="150" height="110" rx="10" fill="#FFFFFF" stroke="#141414" stroke-width="2" />
                <rect x="227" y="177" width="24" height="24" rx="6" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.5" />
                <circle cx="239" cy="189" r="6" stroke="#2563EB" stroke-width="1.5" fill="none" />
                <path d="M239 185 v4 h3" stroke="#2563EB" stroke-width="1.5" fill="none" />
                <text x="258" y="193" font-family="'Pixelify Sans', monospace" font-size="12.5" font-weight="bold" fill="#141414">Backend API</text>
                <text x="227" y="218" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" fill="#141414">Node.js · Hono REST</text>
                <text x="227" y="233" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Server Time & viem relay</text>
                <text x="227" y="258" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="#2563EB">:3100 · HTTP API</text>
              </g>

              <!-- NODE 3: Google Auth -->
              <g filter="url(#m-d-shadow-sm)">
                <rect x="215" y="65" width="150" height="72" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <rect x="225" y="75" width="20" height="20" rx="4" fill="#F8FAFC" stroke="#64748B" stroke-width="1.2" />
                <circle cx="235" cy="85" r="4" stroke="#64748B" stroke-width="1.5" fill="none" />
                <text x="252" y="89" font-family="'Pixelify Sans', monospace" font-size="11.5" font-weight="bold" fill="#141414">Google Auth</text>
                <text x="225" y="109" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">google-auth-library</text>
                <text x="225" y="124" font-family="'JetBrains Mono', monospace" font-size="9" fill="#64748B">OAuth 2.0 · 3 Akun Demo</text>
              </g>

              <!-- NODE 4: SQLite Database -->
              <g filter="url(#m-d-shadow-sm)">
                <rect x="400" y="65" width="130" height="90" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <rect x="410" y="75" width="20" height="20" rx="4" fill="#F1F5F9" stroke="#475569" stroke-width="1.2" />
                <ellipse cx="420" cy="83" rx="5" ry="2" stroke="#475569" stroke-width="1.2" fill="none" />
                <path d="M415 83 v6 c0 1.5 2.2 2 5 2 s5 -0.5 5 -2 v-6" stroke="#475569" stroke-width="1.2" fill="none" />
                <text x="437" y="90" font-family="'Pixelify Sans', monospace" font-size="11.5" font-weight="bold" fill="#141414">SQLite DB</text>
                <text x="410" y="112" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">node:sqlite Sync</text>
                <text x="410" y="127" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">5 Tabel · WAL Mode</text>
                <text x="410" y="145" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" fill="#475569">simplisleep.db</text>
              </g>

              <!-- NODE 5: Custodial Vault -->
              <g filter="url(#m-d-shadow-sm)">
                <rect x="400" y="285" width="130" height="90" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <rect x="410" y="295" width="20" height="20" rx="4" fill="#FEF3C7" stroke="#D97706" stroke-width="1.2" />
                <path d="M420 300 l4 2 v4 c0 3 -4 5 -4 5 s-4 -2 -4 -5 v-4 z" stroke="#D97706" stroke-width="1.2" fill="none" />
                <text x="437" y="310" font-family="'Pixelify Sans', monospace" font-size="11" font-weight="bold" fill="#141414">Custodial Vault</text>
                <text x="410" y="332" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">AES-256-GCM</text>
                <text x="410" y="347" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">Encrypted Keys</text>
                <text x="410" y="365" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" fill="#D97706">viem signer</text>
              </g>

              <!-- NODE 9: Notifikasi In-App -->
              <g filter="url(#m-d-shadow-sm)">
                <rect x="215" y="305" width="150" height="72" rx="8" fill="#FFFFFF" stroke="#141414" stroke-width="1.5" />
                <rect x="225" y="315" width="20" height="20" rx="4" fill="#FEF2F2" stroke="#EF4444" stroke-width="1.2" />
                <path d="M235 321 c-2 0 -3 1.5 -3 3 v3 l-1 1 h8 l-1 -1 v-3 c0 -1.5 -1 -3 -3 -3 z M234 329 a1 1 0 0 0 2 0" stroke="#EF4444" stroke-width="1.2" fill="none" />
                <text x="252" y="329" font-family="'Pixelify Sans', monospace" font-size="11.5" font-weight="bold" fill="#141414">Notifikasi In-App</text>
                <text x="225" y="349" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#5C5C5C">Pengingat Tidur · 429</text>
                <text x="225" y="364" font-family="'JetBrains Mono', monospace" font-size="9" fill="#64748B">Cooldown 5m · Web Notif</text>
              </g>

              <!-- NODE 6: SleepCards.sol -->
              <g filter="url(#m-d-shadow)">
                <rect x="620" y="85" width="285" height="105" rx="10" fill="#FFFFFF" stroke="#7E22CE" stroke-width="2" />
                <rect x="632" y="97" width="24" height="24" rx="6" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1.5" />
                <rect x="637" y="102" width="14" height="14" rx="2" stroke="#7E22CE" stroke-width="1.5" fill="none" />
                <circle cx="644" cy="109" r="2" fill="#7E22CE" />
                <text x="663" y="113" font-family="'Pixelify Sans', monospace" font-size="13" font-weight="bold" fill="#581C87">SleepCards.sol</text>
                <text x="632" y="139" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" fill="#141414">ERC-721 + ERC-5192 (Soulbound Locked)</text>
                <text x="632" y="156" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#5C5C5C">Mint kartu terikat permanen ke wallet custodial</text>
                <text x="632" y="175" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="bold" fill="#7E22CE">Locked(tokenId) · Non-transferable</text>
              </g>

              <!-- NODE 7: LeaderboardCommit.sol -->
              <g filter="url(#m-d-shadow)">
                <rect x="620" y="215" width="285" height="105" rx="10" fill="#FFFFFF" stroke="#7E22CE" stroke-width="2" />
                <rect x="632" y="227" width="24" height="24" rx="6" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1.5" />
                <path d="M638 234 h12 M638 244 h12 M642 230 v18 M648 230 v18" stroke="#7E22CE" stroke-width="1.5" />
                <text x="663" y="243" font-family="'Pixelify Sans', monospace" font-size="13" font-weight="bold" fill="#581C87">LeaderboardCommit.sol</text>
                <text x="632" y="269" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" fill="#141414">Keccak-256 Weekly Snapshot Hash Commit</text>
                <text x="632" y="286" font-family="'JetBrains Mono', monospace" font-size="9.5" fill="#5C5C5C">commit(bytes32 weekId, bytes32 hash)</text>
                <text x="632" y="305" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="bold" fill="#7E22CE">Immutable: 1x commit per weekId</text>
              </g>

              <!-- NODE 8: Ethereum Sepolia Testnet -->
              <g filter="url(#m-d-shadow-sm)">
                <rect x="620" y="345" width="285" height="85" rx="8" fill="#FAF5FF" stroke="#9333EA" stroke-width="1.5" />
                <rect x="632" y="357" width="20" height="20" rx="4" fill="#F3E8FF" stroke="#9333EA" stroke-width="1.2" />
                <path d="M642 361 l4 6 l-4 2 l-4 -2 z M642 371 l4 -2 l-4 6 l-4 -6 z" stroke="#9333EA" stroke-width="1.2" fill="none" />
                <text x="659" y="371" font-family="'Pixelify Sans', monospace" font-size="12" font-weight="bold" fill="#581C87">Ethereum Sepolia Testnet</text>
                <text x="632" y="394" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#6B21A8">Validator Node Publik & Sepolia RPC Node</text>
                <text x="632" y="412" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="bold" fill="#7E22CE">Chain ID: 11155111 · Audit Tanpa Gas Karyawan</text>
              </g>

              <!-- WIRE LABELS LAYER -->
              <rect x="181" y="212" width="28" height="15" rx="3" fill="#EFF6FF" stroke="#2563EB" stroke-width="1" />
              <text x="195" y="223" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="bold" fill="#2563EB" text-anchor="middle">REST</text>

              <rect x="274" y="144" width="32" height="14" rx="3" fill="#F8FAFC" stroke="#64748B" stroke-width="1" />
              <text x="290" y="154" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#64748B" text-anchor="middle">OAuth</text>

              <rect x="370" y="140" width="22" height="14" rx="3" fill="#F1F5F9" stroke="#475569" stroke-width="1" />
              <text x="381" y="150" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#475569" text-anchor="middle">SQL</text>

              <rect x="370" y="285" width="22" height="14" rx="3" fill="#FEF3C7" stroke="#D97706" stroke-width="1" />
              <text x="381" y="295" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#D97706" text-anchor="middle">AES</text>

              <rect x="274" y="284" width="32" height="14" rx="3" fill="#F8FAFC" stroke="#64748B" stroke-width="1" />
              <text x="290" y="294" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#64748B" text-anchor="middle">Notif</text>

              <rect x="536" y="148" width="78" height="17" rx="3" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1" />
              <text x="575" y="160" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="bold" fill="#581C87" text-anchor="middle">viem: mint(card)</text>

              <rect x="532" y="242" width="86" height="17" rx="3" fill="#F3E8FF" stroke="#7E22CE" stroke-width="1" />
              <text x="575" y="254" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#581C87" text-anchor="middle">viem: commit(hash)</text>

              <rect x="215" y="415" width="235" height="18" rx="4" fill="#ECFDF5" stroke="#059669" stroke-width="1" />
              <text x="332" y="427" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="bold" fill="#047857" text-anchor="middle">viem di Leaderboard: verifikasi hash (read-only)</text>
            </svg>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-3 py-1.5 border-t-2 border-ink bg-surface flex items-center justify-between text-[10px] text-ink-muted font-mono shrink-0">
        <span class="truncate">Gunakan tombol +/- untuk zoom dan geser diagram</span>
        <span class="hidden sm:inline">Esc untuk tutup</span>
      </div>
    </div>
  </div>

  `,
  styles: [`
    :host {
      display: block;
    }
    .flow-step-node {
      cursor: pointer;
      outline: none;
      transition: transform 0.15s ease, filter 0.15s ease;
    }
    .flow-step-node:hover {
      filter: drop-shadow(0 4px 6px rgba(236, 56, 91, 0.25));
    }
    .flow-step-node:hover rect:first-child {
      stroke: var(--color-brand);
      stroke-width: 2.2;
    }
    .flow-step-node:focus-visible {
      outline: 3px solid var(--color-brand-ink);
      outline-offset: 3px;
      border-radius: 8px;
    }
    .flow-step-node:focus-visible rect:first-child {
      stroke: var(--color-brand-ink);
      stroke-width: 2.5;
    }
    .flow-step-node:active {
      transform: translateY(1px);
    }

    /* Popup Animations */
    @keyframes popupBackdropFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes popupBackdropFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes popupPanelEnter {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(12px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    @keyframes popupPanelLeave {
      from {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      to {
        opacity: 0;
        transform: scale(0.96) translateY(10px);
      }
    }

    .popup-backdrop-anim {
      animation: popupBackdropFadeIn 180ms ease-out forwards;
      will-change: opacity;
    }
    .popup-backdrop-anim.is-closing {
      animation: popupBackdropFadeOut 140ms ease-in forwards;
    }

    .popup-panel-anim {
      animation: popupPanelEnter 220ms ease-out forwards;
      will-change: transform, opacity;
    }
    .popup-panel-anim.is-closing {
      animation: popupPanelLeave 140ms ease-in forwards;
    }

    @media (prefers-reduced-motion: reduce) {
      .popup-backdrop-anim,
      .popup-backdrop-anim.is-closing {
        animation-duration: 0.01ms !important;
      }
      .popup-panel-anim,
      .popup-panel-anim.is-closing {
        animation-duration: 0.01ms !important;
        transform: none !important;
      }
    }
  `]
})
export class AboutComponent implements OnDestroy {
  isModalOpen = false;
  isModalClosing = false;
  zoomLevel = 1;
  readonly Math = Math;

  activeStep: FlowStepDetail | null = null;
  isStepClosing = false;

  private modalAnimTimer?: ReturnType<typeof setTimeout>;
  private stepAnimTimer?: ReturnType<typeof setTimeout>;

  readonly flowSteps: FlowStepDetail[] = [
    {
      id: 'login',
      stepNumber: '01',
      title: 'Login Akun & Custodial Wallet',
      shortLabel: 'Google / Demo',
      type: 'off-chain',
      badge: 'Off-Chain',
      formula: 'Google OAuth 2.0 / 3 Akun Demo Resmi · JWT 7 Hari',
      points: [
        'Login via Google OAuth (google-auth-library) atau pilih salah satu dari 3 akun demo resmi (budi-santoso, siti-rahma, gilang-ramadhan).',
        'Validasi ketat: POST /api/auth/demo menolak akun selain 3 demo resmi dengan kode HTTP 403.',
        'Sesi pengguna diautentikasi dengan JSON Web Token (JWT) 7 hari; interaksi user dipandu umpan balik ToastService.',
        'User baru otomatis dibuatkan custodial wallet EVM; private key dienkripsi AES-256-GCM di database SQLite.'
      ]
    },
    {
      id: 'sleep',
      stepNumber: '02',
      title: 'Mulai Tidur & Heartbeat Sesi',
      shortLabel: 'Server Node',
      type: 'off-chain',
      badge: 'Off-Chain',
      formula: 'Waktu Server Valid (2–14 Jam) · Heartbeat & Pengingat 5m',
      points: [
        'Waktu mulai dicatat di server Node/Hono untuk mencegah manipulasi jam lokal browser.',
        'Proteksi heartbeat: bila aplikasi dibuka saat tidur, sesi otomatis ditandai "broken" (Masih Melek).',
        'Cabang Ingatkan Tidur: rekan kerja dapat mengirim pengingat tidur via POST /api/reminders dengan cooldown 5 menit (HTTP 429 Retry-After).',
        'Notifikasi diterima via polling in-app dan Browser Notification API, serta hook notifyReminder untuk pengiriman email.'
      ]
    },
    {
      id: 'score',
      stepNumber: '03',
      title: 'Hitung Skor Durasi & Konsistensi',
      shortLabel: 'Durasi & Median',
      type: 'off-chain',
      badge: 'Off-Chain',
      formula: 'Skor = round(0.7 × SkorDurasi + 0.3 × SkorKonsistensi)',
      points: [
        'Skor Durasi (bobot 70%): 100 jika 7–9 jam; turun linear di 4–7 jam dan 9–12 jam; 0 jika ≤4 atau ≥12 jam.',
        'Skor Konsistensi (bobot 30%): deviasi waktu mulai tidur terhadap median 7 hari terakhir (≤30m = 100, ≥120m = 0).',
        'Streak malam bertambah 1 untuk setiap sesi tidur berturut-turut yang meraih skor akhir minimal 70 (notifikasi via ToastService).'
      ]
    },
    {
      id: 'mint',
      stepNumber: '04',
      title: 'Sleep Drop & Mint Soulbound NFT',
      shortLabel: 'SleepCards NFT',
      type: 'on-chain',
      badge: 'On-Chain (Sepolia)',
      formula: 'Syarat: Skor ≥ 70 · Peluang Drop 60%',
      points: [
        'Roll peluang 60% via crypto.randomInt saat bangun tidur dengan skor akhir minimal 70.',
        'Distribusi bobot 28 kartu unik: Common 55%, Rare 28%, Epic 12%, dan Legendary 5%.',
        'Dicetak ke smart contract SleepCards (ERC-5192) Sepolia; status locked(tokenId) permanen ke wallet user.'
      ]
    },
    {
      id: 'leaderboard',
      stepNumber: '05',
      title: 'Klasemen Mingguan Agregat',
      shortLabel: 'Skor Mingguan',
      type: 'off-chain',
      badge: 'Off-Chain',
      formula: 'Periode ISO 8601 (YYYY-Www, Senin–Minggu WIB)',
      points: [
        'Peringkat disusun berdasarkan rata-rata skor (avgScore) seluruh sesi valid (completed/broken) dalam minggu itu.',
        'Privasi terjaga: hanya menampilkan nama, avatar, rata-rata skor, kategori tidur, dan streak (bukan jam tidur privat).',
        'Kategori mingguan: Paling Konsisten (rata-rata tinggi & varians terendah), Paling Membaik, dan Streak Terpanjang.'
      ]
    },
    {
      id: 'commit',
      stepNumber: '06',
      title: 'Komitmen Hash Snapshot On-Chain',
      shortLabel: 'Keccak-256',
      type: 'on-chain',
      badge: 'On-Chain (Sepolia)',
      formula: 'hash = keccak256(JSON.stringify(stableRows [{rank, userId, avgScore}]))',
      points: [
        'Saat minggu ditutup, leaderboard dinormalisasi menjadi array stabil {rank, userId, avgScore} urut rank ascending.',
        'Hash Keccak-256 dicatat permanen ke smart contract LeaderboardCommit di Ethereum Sepolia Testnet.',
        'Immutable: hanya 1x commit per weekId; audit publik dapat diverifikasi langsung melalui badge on-chain di halaman Leaderboard (read-only via viem browser).'
      ]
    }
  ];

  private lastActiveElement?: HTMLElement | null = null;
  private lastStepActiveElement?: HTMLElement | null = null;
  private lockedScrollY = 0;
  private origScrollBy?: typeof window.scrollBy;
  private origScrollTo?: typeof window.scrollTo;
  private origScroll?: typeof window.scroll;

  @ViewChild('modalTriggerMobile') modalTriggerMobile?: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButton') closeButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('stepCardCloseButton') stepCardCloseButton?: ElementRef<HTMLButtonElement>;

  private onWindowScroll = () => {
    if (this.isModalOpen && window.scrollY !== this.lockedScrollY) {
      if (this.origScrollTo) {
        this.origScrollTo.call(window, 0, this.lockedScrollY);
      } else {
        window.scrollTo(0, this.lockedScrollY);
      }
    }
  };

  private lockScroll() {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const main = document.querySelector('main');
    const header = document.querySelector('header');
    const mobileNav = document.querySelector('nav[aria-label="Navigasi Menu Mobile"]');
    if (main) main.style.setProperty('z-index', '99999', 'important');
    if (header) (header as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
    if (mobileNav) (mobileNav as HTMLElement).style.setProperty('visibility', 'hidden', 'important');

    if (!this.origScrollBy) {
      this.origScrollBy = window.scrollBy;
      this.origScrollTo = window.scrollTo;
      this.origScroll = window.scroll;
    }
    window.scrollBy = () => {};
    window.scrollTo = () => {};
    window.scroll = () => {};

    window.removeEventListener('scroll', this.onWindowScroll);
    window.addEventListener('scroll', this.onWindowScroll, { passive: false });
  }

  private unlockScroll() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    const main = document.querySelector('main');
    const header = document.querySelector('header');
    const mobileNav = document.querySelector('nav[aria-label="Navigasi Menu Mobile"]');
    if (main) main.style.removeProperty('z-index');
    if (header) (header as HTMLElement).style.removeProperty('visibility');
    if (mobileNav) (mobileNav as HTMLElement).style.removeProperty('visibility');

    if (this.origScrollBy) window.scrollBy = this.origScrollBy;
    if (this.origScrollTo) window.scrollTo = this.origScrollTo;
    if (this.origScroll) window.scroll = this.origScroll;

    window.removeEventListener('scroll', this.onWindowScroll);
  }

  openModal(event?: MouseEvent) {
    if (this.isModalOpen && !this.isModalClosing) return;
    if (this.isModalClosing) {
      if (this.modalAnimTimer) clearTimeout(this.modalAnimTimer);
      this.isModalClosing = false;
    }

    this.lastActiveElement = (event?.currentTarget as HTMLElement) || (document.activeElement as HTMLElement);
    this.lockedScrollY = window.scrollY;

    // Mobile portrait: start with zoom that fills modal body height (~520px)
    const isMobilePortrait = window.innerWidth < 768 && window.innerHeight > window.innerWidth;
    if (isMobilePortrait) {
      const availableHeight = Math.max(340, window.innerHeight - 110);
      const baseFitHeight = Math.max(80, (window.innerWidth - 16) * 0.5);
      const targetHeight = Math.min(520, availableHeight);
      const rawZoom = targetHeight / baseFitHeight;
      this.zoomLevel = Math.max(1, Math.round(rawZoom * 4) / 4);
    } else {
      this.zoomLevel = 1;
    }

    this.isModalOpen = true;
    this.isModalClosing = false;

    this.lockScroll();

    setTimeout(() => {
      this.closeButton?.nativeElement?.focus();
    }, 60);
  }

  closeModal() {
    if (!this.isModalOpen || this.isModalClosing) return;
    this.isModalClosing = true;

    this.unlockScroll();

    if (this.modalAnimTimer) clearTimeout(this.modalAnimTimer);
    this.modalAnimTimer = setTimeout(() => {
      this.isModalOpen = false;
      this.isModalClosing = false;
      this.zoomLevel = 1;

      setTimeout(() => {
        if (this.lastActiveElement && typeof this.lastActiveElement.focus === 'function') {
          this.lastActiveElement.focus();
        } else {
          this.modalTriggerMobile?.nativeElement?.focus();
        }
      }, 20);
    }, 150);
  }

  onBackdropClick(event: MouseEvent) {
    if (this.isModalClosing) return;
    if ((event.target as HTMLElement)?.id === 'modal-scrollable-body') {
      this.closeModal();
    }
  }

  openStepCard(stepId: string, event?: Event) {
    const step = this.flowSteps.find((s) => s.id === stepId);
    if (!step) return;

    if (this.activeStep && !this.isStepClosing && this.activeStep.id === stepId) {
      return;
    }

    if (this.isStepClosing) {
      if (this.stepAnimTimer) clearTimeout(this.stepAnimTimer);
      this.isStepClosing = false;
    }

    this.lastStepActiveElement = (event?.currentTarget as HTMLElement) || (document.activeElement as HTMLElement);
    this.lockedScrollY = window.scrollY;
    this.activeStep = step;
    this.isStepClosing = false;

    this.lockScroll();

    setTimeout(() => {
      this.stepCardCloseButton?.nativeElement?.focus();
    }, 60);
  }

  closeStepCard() {
    if (!this.activeStep || this.isStepClosing) return;
    this.isStepClosing = true;

    if (!this.isModalOpen) {
      this.unlockScroll();
    }

    if (this.stepAnimTimer) clearTimeout(this.stepAnimTimer);
    this.stepAnimTimer = setTimeout(() => {
      this.activeStep = null;
      this.isStepClosing = false;

      setTimeout(() => {
        if (this.lastStepActiveElement && typeof this.lastStepActiveElement.focus === 'function') {
          this.lastStepActiveElement.focus();
        }
      }, 20);
    }, 150);
  }

  onCardBackdropClick(event: MouseEvent) {
    if (this.isStepClosing) return;
    if ((event.target as HTMLElement)?.id === 'step-card-backdrop') {
      this.closeStepCard();
    }
  }

  zoomIn() {
    this.zoomLevel = Math.min(5.0, +(this.zoomLevel + 0.25).toFixed(2));
  }

  zoomOut() {
    this.zoomLevel = Math.max(0.75, +(this.zoomLevel - 0.25).toFixed(2));
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.activeStep && !this.isStepClosing) {
        event.preventDefault();
        this.closeStepCard();
      } else if (this.isModalOpen && !this.isModalClosing) {
        event.preventDefault();
        this.closeModal();
      }
    }
  }

  ngOnDestroy() {
    if (this.modalAnimTimer) clearTimeout(this.modalAnimTimer);
    if (this.stepAnimTimer) clearTimeout(this.stepAnimTimer);
    this.unlockScroll();
  }
}
