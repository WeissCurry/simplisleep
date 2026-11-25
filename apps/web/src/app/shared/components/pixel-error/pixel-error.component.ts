import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PixelButtonComponent } from '../pixel-button/pixel-button.component';

@Component({
  selector: 'app-pixel-error',
  imports: [CommonModule, PixelButtonComponent],
  template: `
    <div class="p-5 bg-brand-50 border-3 border-brand-ink shadow-[5px_5px_0_#8E1631] rounded-[12px] text-center space-y-3">
      <div class="w-10 h-10 mx-auto bg-brand-100 border-2 border-brand-ink text-brand-ink rounded-[8px] flex items-center justify-center font-pixel font-bold text-lg" aria-hidden="true">!</div>
      <div>
        <h4 class="font-pixel text-sm font-bold text-brand-ink uppercase tracking-wider">
          {{ title }}
        </h4>
        <p class="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
          {{ message }}
        </p>
      </div>

      @if (showRetry) {
        <div>
          <app-pixel-button variant="danger" size="sm" (clicked)="retry.emit()">
            Coba Lagi
          </app-pixel-button>
        </div>
      }
    </div>
  `
})
export class PixelErrorComponent {
  @Input() title = 'Gagal Memuat Data';
  @Input() message = 'Terjadi kendala saat menghubungi server. Silakan periksa koneksi atau coba lagi.';
  @Input() showRetry = true;

  @Output() retry = new EventEmitter<void>();
}
