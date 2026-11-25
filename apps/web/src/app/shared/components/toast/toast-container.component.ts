import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Toast, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="toast-host fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-16 sm:left-auto sm:translate-x-0 sm:right-4 z-60 w-[calc(100%-24px)] max-w-[360px] sm:max-w-[400px] pointer-events-none flex flex-col gap-2"
      role="region"
      aria-label="Pemberitahuan Sistem"
    >
      @for (toast of toasts(); track toast.id) {
        <div
          class="toast-card toast-anim pointer-events-auto rounded-[8px] border-2 sm:border-3 border-ink shadow-[3px_3px_0_#141414] sm:shadow-[4px_4px_0_#141414] p-2.5 sm:p-3 text-ink flex items-start justify-between gap-2.5 transition-all duration-200"
          [ngClass]="getToastBgClass(toast.type)"
          [attr.role]="toast.type === 'error' ? 'alert' : 'status'"
          [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'"
          [attr.aria-atomic]="'true'"
        >
          <!-- Left Bar / Indicator Accent -->
          <div class="flex items-start gap-2 min-w-0 flex-1">
            <span
              class="font-pixel text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] border border-ink shrink-0 leading-tight"
              [ngClass]="getBadgeClass(toast.type)"
            >
              {{ getTypeLabel(toast.type) }}
            </span>

            <div class="min-w-0 flex-1 leading-snug break-words">
              @if (toast.title) {
                <h4 class="font-pixel text-xs sm:text-sm font-bold tracking-wide uppercase truncate mb-0.5">
                  {{ toast.title }}
                </h4>
              }
              <p class="font-sans text-xs text-ink leading-relaxed break-words">
                {{ toast.message }}
              </p>
            </div>
          </div>

          <!-- Close Button -->
          <button
            type="button"
            (click)="dismiss(toast.id)"
            class="shrink-0 w-7 h-7 flex items-center justify-center border-2 border-ink bg-surface hover:bg-brand-50 text-ink font-bold text-xs rounded-[6px] shadow-[2px_2px_0_#141414] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-colors"
            [attr.aria-label]="'Tutup notifikasi: ' + (toast.title || toast.message)"
            title="Tutup Notifikasi"
          >
            ✕
          </button>
        </div>
      }

      <!-- Queue Counter (Jika lebih dari 2 di antrean) -->
      @if (queuedCount() > 0) {
        <div class="toast-anim self-center sm:self-end px-2.5 py-1 bg-surface border-2 border-ink rounded-[6px] shadow-[2px_2px_0_#141414] text-[11px] font-pixel font-bold text-ink-muted uppercase pointer-events-auto">
          +{{ queuedCount() }} notifikasi lagi di antrean
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (min-width: 640px) {
      @keyframes toastSlideIn {
        from {
          opacity: 0;
          transform: translateY(-8px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    }

    .toast-anim {
      animation: toastSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @media (prefers-reduced-motion: reduce) {
      .toast-anim {
        animation: none !important;
        transition: none !important;
      }
    }
  `]
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);

  readonly toasts = this.toastService.activeToasts;
  readonly queuedCount = this.toastService.queuedCount;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  getToastBgClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'bg-[#EDFDF3] border-l-6 sm:border-l-8 border-l-success';
      case 'error':
        return 'bg-[#FFF0F2] border-l-6 sm:border-l-8 border-l-danger';
      case 'warning':
        return 'bg-[#FFF9E6] border-l-6 sm:border-l-8 border-l-sun';
      case 'info':
      default:
        return 'bg-brand-50 border-l-6 sm:border-l-8 border-l-brand-ink';
    }
  }

  getBadgeClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-sun text-ink';
      case 'info':
      default:
        return 'bg-brand text-white';
    }
  }

  getTypeLabel(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'Sukses';
      case 'error':
        return 'Gagal';
      case 'warning':
        return 'Perhatian';
      case 'info':
      default:
        return 'Info';
    }
  }
}
