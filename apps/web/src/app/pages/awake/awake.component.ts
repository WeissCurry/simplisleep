import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AwakeService } from '../../core/services/awake.service';
import { AwakeUserItem } from '../../core/services/mock-data';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-awake',
  imports: [
    CommonModule,
    AvatarComponent
  ],
  styles: [`
    :host {
      display: block;
      width: 100%;
      overflow-x: hidden;
    }
    .lead-pixel {
      font-family: var(--font-pixel, 'Pixelify Sans', monospace);
      font-size: 1.125rem;
      line-height: 1.35;
    }
    @media (min-width: 768px) {
      .lead-pixel {
        font-size: 1.375rem;
      }
    }
    .panel-pixel {
      background-color: var(--color-surface, #FFFFFF);
      border: 3px solid var(--color-ink, #141414);
      box-shadow: 4px 4px 0px var(--color-ink, #141414);
      border-radius: 12px;
    }
    @media (min-width: 640px) {
      .panel-pixel {
        box-shadow: 6px 6px 0px var(--color-ink, #141414);
      }
    }
    .btn-pixel {
      background-color: var(--color-brand-strong, #D42A4C);
      color: #FFFFFF;
      font-family: var(--font-pixel, 'Pixelify Sans', monospace);
      font-weight: 700;
      text-transform: uppercase;
      padding: 10px 14px;
      border-right: 5px solid var(--color-ink, #141414);
      border-bottom: 5px solid var(--color-ink, #141414);
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
      min-height: 40px;
      white-space: nowrap;
      box-sizing: border-box;
    }
    .btn-pixel:hover:not(:disabled) {
      transform: translateY(-2px);
      background-color: var(--color-brand, #EC385B);
    }
    .btn-pixel:active:not(:disabled) {
      transform: translateY(0);
    }
    .btn-pixel:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      background-color: #A3A3A3;
      border-color: #525252;
    }
    .btn-pixel--ghost {
      background-color: var(--color-surface, #FFFFFF);
      color: var(--color-ink, #141414);
      border: 2px solid var(--color-ink, #141414);
      box-shadow: 3px 3px 0px var(--color-ink, #141414);
      border-radius: 8px;
    }
    .btn-pixel--ghost:hover:not(:disabled) {
      background-color: var(--color-brand-50, #FFF1F4);
      color: var(--color-brand-ink, #C21F42);
    }
    .btn-pixel--sm {
      padding: 6px 10px;
      font-size: 0.75rem;
      border-right-width: 4px;
      border-bottom-width: 4px;
      border-radius: 8px;
      min-height: 38px;
    }
    @media (min-width: 640px) {
      .btn-pixel--sm {
        padding: 8px 14px;
        font-size: 0.8125rem;
        min-height: 42px;
      }
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
    <div class="container-app py-4 sm:py-8 space-y-4 sm:space-y-6">
      <!-- Header Banner -->
      <div class="panel-pixel p-3.5 sm:p-6 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div class="min-w-0">
          <h1 class="font-pixel text-lg sm:text-2xl md:text-3xl font-bold text-ink uppercase tracking-tight break-words">
            Masih Melek Malam Ini
          </h1>
          <p class="font-pixel text-xs sm:text-sm md:lead-pixel text-ink-muted mt-1 leading-snug break-words">
            Daftar SimpliMates yang belum tidur atau terdeteksi beraktivitas saat jam tidur.
          </p>
        </div>

        <div class="self-start sm:self-auto bg-brand-50 border-2 border-ink px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-[6px] [box-shadow:2px_2px_0_#141414] flex items-center gap-2 whitespace-nowrap shrink-0">
          <span class="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-brand rounded-full animate-ping inline-block"></span>
          <span class="font-pixel text-[11px] sm:text-xs md:text-sm text-brand-ink font-bold uppercase whitespace-nowrap">
            {{ awakeList().length }} Teman Terdeteksi
          </span>
        </div>
      </div>

      <!-- Browser Notification Opt-in Banner (Hanya muncul jika belum diberi izin dan browser mendukung) -->
      @if (hasNotificationSupport && notificationPermission() === 'default') {
        <div class="panel-pixel p-3 sm:p-4 bg-brand-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 [box-shadow:3px_3px_0_#141414]">
          <div class="min-w-0 text-xs sm:text-sm text-ink leading-snug">
            <span class="font-bold font-pixel uppercase text-brand-ink block sm:inline mr-1">Notifikasi Browser:</span>
            Aktifkan notifikasi desktop agar langsung tahu saat rekan mengingatkan tidur.
          </div>
          <button
            type="button"
            class="btn-pixel btn-pixel--ghost btn-pixel--sm w-full sm:w-auto shrink-0"
            (click)="requestNotificationPermission()"
            aria-label="Aktifkan notifikasi desktop"
          >
            Aktifkan Notifikasi
          </button>
        </div>
      }

      <!-- List of Awake Users -->
      @if (awakeList().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          @for (user of awakeList(); track user.userId) {
            <div class="panel-pixel p-3.5 sm:p-5 bg-surface flex flex-col justify-between gap-3 sm:gap-4 overflow-hidden">
              <div class="flex items-start gap-2.5 sm:gap-4 min-w-0">
                <app-avatar
                  [name]="user.name"
                  [avatar]="user.avatar"
                  status="awake"
                  size="md"
                  class="sm:hidden rounded-[8px] overflow-hidden shrink-0"
                ></app-avatar>
                <app-avatar
                  [name]="user.name"
                  [avatar]="user.avatar"
                  status="awake"
                  size="lg"
                  class="hidden sm:inline-flex rounded-[8px] overflow-hidden shrink-0"
                ></app-avatar>

                <div class="min-w-0 flex-1 overflow-hidden">
                  <div class="flex flex-wrap items-center justify-between gap-1">
                    <h3 class="font-sans font-bold text-xs sm:text-base md:text-lg text-ink truncate">
                      {{ user.name }}
                    </h3>
                    <span class="font-pixel text-[9px] sm:text-[11px] bg-brand-100 text-brand-ink border border-ink px-1.5 py-0.5 font-bold uppercase shrink-0 rounded-[4px] whitespace-nowrap">
                      Melek {{ formatSinceTime(user.since) }}
                    </span>
                  </div>

                  <p class="text-[11px] sm:text-xs text-brand-ink font-semibold truncate mt-0.5">
                    {{ user.role || 'SimpliMate' }}
                  </p>

                  <!-- Status Note / Alasan melek -->
                  @if (user.reason && user.reason.trim()) {
                    <div class="mt-2 p-2 sm:p-2.5 bg-brand-50 border border-ink rounded-[6px] text-[11px] sm:text-xs text-ink font-sans italic leading-relaxed break-words">
                      "{{ user.reason }}"
                    </div>
                  }
                </div>
              </div>

              <!-- Footer Action -->
              <div class="pt-2 border-t border-brand-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                <span class="font-pixel text-[11px] sm:text-xs text-ink-muted whitespace-nowrap">
                  Melek ~{{ getSinceHoursAgo(user) }} jam
                </span>

                @if (user.userId === currentUserId()) {
                  <button
                    type="button"
                    class="btn-pixel btn-pixel--sm rounded-[8px] text-xs py-1.5 px-3 w-full sm:w-auto opacity-50 cursor-not-allowed"
                    disabled
                  >
                    Kamu Sendiri
                  </button>
                } @else if (isCooldown(user.userId)) {
                  <button
                    type="button"
                    class="btn-pixel btn-pixel--sm rounded-[8px] text-xs py-1.5 px-3 w-full sm:w-auto"
                    disabled
                    [attr.aria-label]="'Sedang cooldown: tunggu ' + getCooldownText(user.userId) + ' sebelum mengingatkan ' + user.name"
                  >
                    Tunggu {{ getCooldownText(user.userId) }}
                  </button>
                } @else {
                  <button
                    type="button"
                    class="btn-pixel btn-pixel--sm rounded-[8px] text-xs py-1.5 px-3 w-full sm:w-auto"
                    [disabled]="sendingUserId() === user.userId"
                    [attr.aria-label]="'Ingatkan tidur untuk ' + user.name"
                    (click)="remindUser(user)"
                  >
                    {{ sendingUserId() === user.userId ? 'Mengirim...' : 'Ingatkan Tidur' }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Empty State -->
        <div class="panel-pixel p-6 sm:p-12 bg-surface text-center">
          <h3 class="font-pixel text-base sm:text-2xl font-bold text-brand-ink uppercase">
            Semua Rekan Kerja Sudah Tidur
          </h3>
          <p class="font-sans text-xs sm:text-sm text-ink-muted max-w-md mx-auto mt-1.5 leading-relaxed">
            Tidak ada SimpliMates yang terdeteksi masih beraktivitas larut malam. Ritme istirahat terjaga dengan baik.
          </p>
        </div>
      }

      <!-- Explanation Panel -->
      <div class="panel-pixel p-3.5 sm:p-6 bg-brand-50">
        <div class="border-b border-brand-200 pb-2 mb-2">
          <h3 class="font-pixel text-xs sm:text-base font-bold text-ink uppercase">
            Kriteria Masuk Daftar Masih Melek
          </h3>
        </div>
        <div class="text-[11px] sm:text-xs text-ink space-y-1.5 font-sans leading-relaxed">
          <p>
            Pengguna tercatat dalam daftar ini apabila:
          </p>
          <ol class="list-decimal pl-4 space-y-1 text-ink-muted">
            <li>
              Belum menekan tombol "Mau Tidur" setelah melewati jam 23:00 WIB.
            </li>
            <li>
              Membuka aplikasi (memanggil API heartbeat) selama rentang sesi tidur berlangsung.
            </li>
          </ol>
          <p class="font-pixel text-[11px] sm:text-xs text-brand-ink font-bold pt-1">
            Fitur ini bertujuan saling menyemangati secara sehat dan santai.
          </p>
        </div>
      </div>
    </div>
  `
})
export class AwakeComponent implements OnInit {
  private awakeService = inject(AwakeService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  readonly awakeList = this.awakeService.awakeUsers;
  readonly currentUserId = computed(() => this.auth.currentUser()?.id);
  readonly notificationPermission = this.awakeService.notificationPermission;
  readonly hasNotificationSupport = this.awakeService.hasNotificationSupport;

  readonly sendingUserId = signal<string | null>(null);

  ngOnInit(): void {
    this.awakeService.loadCooldowns();
    this.awakeService.startNotificationPolling(30000);

    this.destroyRef.onDestroy(() => {
      this.awakeService.stopNotificationPolling();
    });
  }

  isCooldown(userId: string): boolean {
    return this.awakeService.isCooldown(userId);
  }

  getCooldownText(userId: string): string {
    return this.awakeService.formatCooldown(this.awakeService.getRemainingCooldown(userId));
  }

  remindUser(user: AwakeUserItem): void {
    if (this.isCooldown(user.userId)) {
      const remaining = this.getCooldownText(user.userId);
      this.toast.warning(
        `Harap tunggu ${remaining} sebelum mengingatkan ${user.name} lagi.`,
        'Sedang Cooldown'
      );
      return;
    }

    this.sendingUserId.set(user.userId);

    this.awakeService.sendReminder(user.userId, user.name).subscribe({
      next: (res) => {
        this.sendingUserId.set(null);
        this.toast.success(
          res.message || `Pengingat tidur santai terkirim ke ${user.name}!`,
          'Berhasil'
        );
      },
      error: (err) => {
        this.sendingUserId.set(null);
        if (err.status === 429 || err.retryAfterSeconds) {
          const secs = err.retryAfterSeconds || err.error?.retryAfterSeconds || 300;
          const formatted = this.awakeService.formatCooldown(secs);
          this.toast.warning(
            `Harap tunggu ${formatted} sebelum mengingatkan ${user.name} lagi.`,
            'Sedang Cooldown'
          );
        } else {
          this.toast.error(
            err.error?.error || 'Gagal mengirim pengingat tidur. Coba lagi nanti.',
            'Gagal'
          );
        }
      }
    });
  }

  requestNotificationPermission(): void {
    this.awakeService.requestNotificationPermission().then((permission) => {
      if (permission === 'granted') {
        this.toast.success('Notifikasi desktop diaktifkan.', 'Izin Diberikan');
      } else if (permission === 'denied') {
        this.toast.info('Notifikasi desktop dinonaktifkan. Pengingat tetap muncul di aplikasi.', 'Notifikasi');
      }
    });
  }

  formatSinceTime(since?: string): string {
    if (!since) return '--:--';
    const trimmed = since.trim();
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    try {
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) return trimmed;
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      return formatter.format(d);
    } catch {
      return trimmed;
    }
  }

  getSinceHoursAgo(user: AwakeUserItem): number {
    if (user.sinceHoursAgo != null && !isNaN(user.sinceHoursAgo)) {
      return user.sinceHoursAgo;
    }
    if (user.since) {
      const ms = new Date(user.since).getTime();
      if (!isNaN(ms)) {
        return Math.max(0, Math.round(((Date.now() - ms) / 3600000) * 10) / 10);
      }
    }
    return 0;
  }
}
