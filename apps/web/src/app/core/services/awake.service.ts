import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { AwakeUserItem, DUMMY_AWAKE_USERS } from './mock-data';
import { ToastService } from './toast.service';

/**
 * Durasi cooldown anti-spam pengingat tidur (5 menit = 300 detik).
 * Sumber kebenaran tunggal untuk pembatasan frekuensi pengingat tidur.
 */
export const REMINDER_COOLDOWN_SECONDS = 300;

export interface SendReminderResult {
  success: boolean;
  message: string;
  retryAfterSeconds?: number;
  cooldownSeconds?: number;
}

export interface InAppReminderNotification {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  createdAt: string;
  message: string;
}

const STORAGE_KEY_MOCK_COOLDOWNS = 'simplisleep_reminder_mock_cooldowns';

@Injectable({
  providedIn: 'root'
})
export class AwakeService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  private awakeListSignal = signal<AwakeUserItem[]>(DUMMY_AWAKE_USERS);
  readonly awakeUsers = this.awakeListSignal.asReadonly();

  // Cooldown timer per target userId: { [targetUserId: string]: remainingSeconds }
  private cooldownsSignal = signal<Record<string, number>>({});
  readonly cooldowns = this.cooldownsSignal.asReadonly();

  // Status izin Browser Notification API
  private notificationPermissionSignal = signal<NotificationPermission>(this.getInitialNotificationPermission());
  readonly notificationPermission = this.notificationPermissionSignal.asReadonly();

  readonly hasNotificationSupport = typeof window !== 'undefined' && 'Notification' in window;

  private tickerIntervalId: ReturnType<typeof setInterval> | null = null;
  private pollingIntervalId: ReturnType<typeof setInterval> | null = null;
  private visibilityChangeHandler: (() => void) | null = null;

  constructor() {
    this.startCooldownTicker();
    this.loadCooldowns();
  }

  /**
   * Format detik menjadi representasi mm:ss (contoh: 04:59).
   */
  formatCooldown(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const remSecs = s % 60;
    const mm = mins < 10 ? `0${mins}` : `${mins}`;
    const ss = remSecs < 10 ? `0${remSecs}` : `${remSecs}`;
    return `${mm}:${ss}`;
  }

  /**
   * Cek apakah user sedang dalam masa cooldown pengingat.
   */
  isCooldown(targetUserId: string): boolean {
    return (this.cooldownsSignal()[targetUserId] ?? 0) > 0;
  }

  /**
   * Mengambil sisa detik cooldown untuk target user tertentu.
   */
  getRemainingCooldown(targetUserId: string): number {
    return this.cooldownsSignal()[targetUserId] ?? 0;
  }

  /**
   * Memuat status cooldown agar bertahan saat halaman direload.
   * Mode mock membaca dari localStorage, mode API mengambil dari GET /api/reminders/cooldowns.
   */
  loadCooldowns(): void {
    if (environment.useMock) {
      this.loadMockCooldownsFromStorage();
      return;
    }

    if (!this.auth.getToken()) {
      return;
    }

    this.http
      .get<{ cooldowns: Record<string, number> }>(`${environment.apiUrl}/reminders/cooldowns`, {
        headers: this.auth.getAuthHeaders()
      })
      .pipe(
        catchError(() => of({ cooldowns: {} }))
      )
      .subscribe((res) => {
        if (res?.cooldowns) {
          this.cooldownsSignal.update((current) => ({
            ...current,
            ...res.cooldowns
          }));
        }
      });
  }

  /**
   * Mengirim pengingat tidur ke target user.
   * Menegakkan cooldown 5 menit baik di mode server maupun mode mock.
   */
  sendReminder(targetUserId: string, targetName: string): Observable<SendReminderResult> {
    const remaining = this.getRemainingCooldown(targetUserId);
    if (remaining > 0) {
      return throwError(() => ({
        status: 429,
        retryAfterSeconds: remaining,
        message: `Harap tunggu ${this.formatCooldown(remaining)} sebelum mengingatkan ${targetName} lagi.`
      }));
    }

    if (environment.useMock) {
      this.setCooldown(targetUserId, REMINDER_COOLDOWN_SECONDS);
      this.saveMockCooldownToStorage(targetUserId);

      return of({
        success: true,
        message: `Pengingat tidur santai terkirim ke ${targetName}!`,
        cooldownSeconds: REMINDER_COOLDOWN_SECONDS
      });
    }

    return this.http
      .post<{
        success: boolean;
        message: string;
        cooldownSeconds?: number;
        reminder?: { cooldownSeconds?: number };
      }>(
        `${environment.apiUrl}/reminders`,
        { targetUserId },
        { headers: this.auth.getAuthHeaders() }
      )
      .pipe(
        tap((res) => {
          const cooldownSecs =
            res.cooldownSeconds ?? res.reminder?.cooldownSeconds ?? REMINDER_COOLDOWN_SECONDS;
          this.setCooldown(targetUserId, cooldownSecs);
        }),
        map((res) => ({
          success: true,
          message: res.message || `Pengingat tidur santai terkirim ke ${targetName}!`,
          cooldownSeconds:
            res.cooldownSeconds ?? res.reminder?.cooldownSeconds ?? REMINDER_COOLDOWN_SECONDS
        })),
        catchError((err) => {
          if (err.status === 429 && err.error?.retryAfterSeconds) {
            this.setCooldown(targetUserId, err.error.retryAfterSeconds);
          }
          return throwError(() => err);
        })
      );
  }

  /**
   * Mengambil daftar user yang masih melek malam ini (/api/awake).
   */
  getAwakeUsers(): Observable<AwakeUserItem[]> {
    if (environment.useMock) {
      return of(this.awakeListSignal());
    }

    return this.http.get<AwakeUserItem[]>(`${environment.apiUrl}/awake`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Meminta izin notifikasi browser hanya setelah dipicu oleh interaksi klik pengguna.
   * Tidak pernah dipanggil otomatis saat load.
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.hasNotificationSupport) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermissionSignal.set(permission);
      return permission;
    } catch {
      return 'denied';
    }
  }

  /**
   * Memulai polling ringan (default 30 detik) untuk memeriksa notifikasi pengingat yang masuk.
   * Hanya melakukan polling ketika tab aplikasi sedang aktif/fokus.
   */
  startNotificationPolling(intervalMs = 30000): void {
    this.stopNotificationPolling();

    if (environment.useMock) {
      return;
    }

    // Jalankan pengecekan pertama bila tab sedang aktif
    this.checkUnreadReminders();

    if (typeof window !== 'undefined') {
      this.pollingIntervalId = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          this.checkUnreadReminders();
        }
      }, intervalMs);

      this.visibilityChangeHandler = () => {
        if (document.visibilityState === 'visible') {
          this.checkUnreadReminders();
        }
      };

      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  }

  /**
   * Menghentikan interval polling notifikasi.
   */
  stopNotificationPolling(): void {
    if (this.pollingIntervalId !== null) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
    if (this.visibilityChangeHandler !== null && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  /**
   * Memeriksa notifikasi belum dibaca dari server.
   */
  private checkUnreadReminders(): void {
    if (environment.useMock) {
      return;
    }

    if (!this.auth.getToken()) {
      return;
    }

    this.http
      .get<InAppReminderNotification[]>(`${environment.apiUrl}/reminders/unread`, {
        headers: this.auth.getAuthHeaders()
      })
      .pipe(
        catchError(() => of([]))
      )
      .subscribe((notifications) => {
        if (!notifications || notifications.length === 0) {
          return;
        }

        for (const item of notifications) {
          this.handleIncomingReminder(item);
        }
      });
  }

  /**
   * Menampilkan toast dan browser notification saat menerima pengingat baru,
   * lalu menandai notifikasi tersebut telah dibaca.
   */
  private handleIncomingReminder(item: InAppReminderNotification): void {
    const text = item.message || `${item.senderName} mengingatkan kamu untuk segera tidur!`;

    // 1. Tampilkan feedback via ToastService bersama
    this.toast.info(text, 'Pengingat Tidur');

    // 2. Tampilkan Browser Notification API bila sudah diizinkan oleh user
    if (this.hasNotificationSupport && Notification.permission === 'granted') {
      try {
        new Notification('SimpliSleep - Waktunya Tidur', {
          body: text
        });
      } catch {}
    }

    // 3. Tandai sudah dibaca di server
    if (environment.useMock) {
      return;
    }
    this.http
      .post(`${environment.apiUrl}/reminders/${item.id}/read`, {}, {
        headers: this.auth.getAuthHeaders()
      })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  private setCooldown(targetUserId: string, seconds: number): void {
    this.cooldownsSignal.update((current) => ({
      ...current,
      [targetUserId]: Math.max(0, Math.ceil(seconds))
    }));
  }

  private startCooldownTicker(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.tickerIntervalId = setInterval(() => {
      const current = this.cooldownsSignal();
      let hasChanges = false;
      const updated: Record<string, number> = {};

      for (const [userId, remaining] of Object.entries(current)) {
        if (remaining > 1) {
          updated[userId] = remaining - 1;
          hasChanges = true;
        } else if (remaining === 1) {
          updated[userId] = 0;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        this.cooldownsSignal.set(updated);
      }
    }, 1000);
  }

  private loadMockCooldownsFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY_MOCK_COOLDOWNS);
      if (!raw) return;

      const savedTimestamps: Record<string, number> = JSON.parse(raw);
      const now = Date.now();
      const updated: Record<string, number> = {};

      for (const [userId, timestamp] of Object.entries(savedTimestamps)) {
        const elapsedSecs = Math.floor((now - timestamp) / 1000);
        if (elapsedSecs < REMINDER_COOLDOWN_SECONDS) {
          updated[userId] = REMINDER_COOLDOWN_SECONDS - elapsedSecs;
        }
      }

      this.cooldownsSignal.set(updated);
    } catch {}
  }

  private saveMockCooldownToStorage(targetUserId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY_MOCK_COOLDOWNS);
      const savedTimestamps: Record<string, number> = raw ? JSON.parse(raw) : {};
      savedTimestamps[targetUserId] = Date.now();
      localStorage.setItem(STORAGE_KEY_MOCK_COOLDOWNS, JSON.stringify(savedTimestamps));
    } catch {}
  }

  private getInitialNotificationPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  }
}
