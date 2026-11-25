import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PixelButtonComponent } from '../pixel-button/pixel-button.component';

@Component({
  selector: 'app-pixel-empty',
  imports: [CommonModule, PixelButtonComponent],
  template: `
    <div class="p-8 text-center space-y-3 bg-brand-50 border-3 border-dashed border-brand-300 rounded-[12px]">
      @if (icon) {
        <div class="text-4xl leading-none select-none" aria-hidden="true">{{ icon }}</div>
      } @else {
        <div class="w-12 h-12 mx-auto bg-brand-100 border-2 border-ink rounded-[8px] flex items-center justify-center text-ink-muted">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
        </div>
      }
      <div>
        <h4 class="font-pixel text-sm sm:text-base font-bold text-ink uppercase tracking-wider">
          {{ title }}
        </h4>
        <p class="text-xs text-ink-muted mt-1 max-w-md mx-auto">
          {{ message }}
        </p>
      </div>

      @if (actionLabel) {
        <div class="pt-2">
          <app-pixel-button variant="primary" size="sm" (clicked)="action.emit()">
            {{ actionLabel }}
          </app-pixel-button>
        </div>
      }
    </div>
  `
})
export class PixelEmptyComponent {
  @Input() icon = '';
  @Input() title = 'Belum Ada Data';
  @Input() message = 'Data belum tersedia untuk ditampilkan saat ini.';
  @Input() actionLabel?: string;

  @Output() action = new EventEmitter<void>();
}
