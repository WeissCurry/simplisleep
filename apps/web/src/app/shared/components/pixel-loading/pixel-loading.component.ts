import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pixel-loading',
  imports: [CommonModule],
  template: `
    <div class="p-6 text-center flex flex-col items-center justify-center space-y-3 bg-surface border-3 border-ink shadow-[5px_5px_0_#141414] rounded-[12px]">
      <!-- Animated Pixel Moon / Clock (Radius 8px) -->
      <div class="w-12 h-12 bg-brand-50 border-2 border-ink shadow-[2px_2px_0_#141414] rounded-[8px] flex items-center justify-center">
        <svg class="w-6 h-6 text-brand-ink animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <div>
        <p class="font-pixel text-sm font-bold text-brand-ink uppercase tracking-wider">
          {{ message }}
        </p>
        <p class="text-[11px] text-ink-muted mt-0.5">
          Sedang menyelaraskan data dengan server...
        </p>
      </div>
    </div>
  `
})
export class PixelLoadingComponent {
  @Input() message = 'Memuat data...';
}
