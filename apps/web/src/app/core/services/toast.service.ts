import { Injectable, computed, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly maxVisible = 2;
  private readonly defaultDuration = 4000;
  private readonly errorDuration = 6000;

  private counter = 0;
  private readonly _toasts = signal<Toast[]>([]);
  private readonly timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Daftar toast yang sedang aktif ditampilkan di layar (maksimal 2 agar ringkas dan tidak menumpuk).
   */
  readonly activeToasts = computed(() => this._toasts().slice(0, this.maxVisible));

  /**
   * Alias untuk activeToasts agar mudah dikonsumsi komponen.
   */
  readonly toasts = this.activeToasts;

  /**
   * Jumlah toast yang masih berada dalam antrean di luar 3 yang terlihat.
   */
  readonly queuedCount = computed(() => Math.max(0, this._toasts().length - this.maxVisible));

  /**
   * Menampilkan toast sukses (durasi ~4 detik).
   */
  success(message: string, title?: string): string {
    return this.show('success', message, title, this.defaultDuration);
  }

  /**
   * Menampilkan toast error (durasi ~6 detik).
   */
  error(message: string, title?: string): string {
    return this.show('error', message, title, this.errorDuration);
  }

  /**
   * Menampilkan toast info (durasi ~4 detik).
   */
  info(message: string, title?: string): string {
    return this.show('info', message, title, this.defaultDuration);
  }

  /**
   * Menampilkan toast warning (durasi ~4 detik).
   */
  warning(message: string, title?: string): string {
    return this.show('warning', message, title, this.defaultDuration);
  }

  /**
   * Menutup toast tertentu berdasarkan ID.
   */
  dismiss(id: string): void {
    this.clearTimer(id);
    this._toasts.update((list) => list.filter((t) => t.id !== id));
    this.scheduleTimersForActive();
  }

  /**
   * Menghapus seluruh toast (baik aktif maupun antrean).
   */
  clear(): void {
    this.timeouts.forEach((timer) => clearTimeout(timer));
    this.timeouts.clear();
    this._toasts.set([]);
  }

  private show(type: ToastType, message: string, title?: string, duration?: number): string {
    // Deduplikasi: abaikan toast jika judul dan pesan yang identik masih tampil atau mengantre
    const existing = this._toasts().find((t) => t.message === message && t.title === title);
    if (existing) {
      return existing.id;
    }

    const id = `toast-${++this.counter}`;
    const toastDuration = duration ?? (type === 'error' ? this.errorDuration : this.defaultDuration);
    const newToast: Toast = {
      id,
      type,
      message,
      title,
      duration: toastDuration,
      createdAt: Date.now()
    };

    this._toasts.update((list) => [...list, newToast]);
    this.scheduleTimersForActive();
    return id;
  }

  private scheduleTimersForActive(): void {
    const active = this._toasts().slice(0, this.maxVisible);
    for (const toast of active) {
      if (!this.timeouts.has(toast.id)) {
        const timer = setTimeout(() => {
          this.dismiss(toast.id);
        }, toast.duration);
        this.timeouts.set(toast.id, timer);
      }
    }
  }

  private clearTimer(id: string): void {
    const timer = this.timeouts.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timeouts.delete(id);
    }
  }
}
