import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-wordmark',
  imports: [CommonModule, RouterLink],
  template: `
    <a
      routerLink="/"
      class="group inline-flex items-center gap-1.5 sm:gap-2 select-none focus:outline-none focus:ring-2 focus:ring-brand rounded-[8px] p-0.5 sm:p-1 transition-transform whitespace-nowrap"
      aria-label="SimpliSleeps Beranda"
    >
      <!-- Logo SimpliDOTS Resmi (Ikon Kotak Merah Sudut Bulat, Vektor Halus) -->
      <picture class="shrink-0 flex items-center">
        <source
          type="image/webp"
          srcset="/brand/simplidots-icon.webp 1x, /brand/simplidots-icon@2x.webp 2x"
        />
        <img
          src="/brand/simplidots-icon.png"
          srcset="/brand/simplidots-icon.png 1x, /brand/simplidots-icon@2x.png 2x"
          alt="SimpliDOTS"
          [attr.width]="iconPxSize"
          [attr.height]="iconPxSize"
          [ngClass]="[
            'shrink-0 object-contain drop-shadow-[2px_2px_0_#141414] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform',
            iconSizeClass
          ]"
          style="image-rendering: auto;"
        />
      </picture>

      <!-- Wordmark Typography: PIXELATED tebal seperti di hero ('Simpli' ink + 'Sleep' brand + titik merah) -->
      <div class="flex flex-col">
        <div class="flex items-center leading-none font-pixel font-black uppercase tracking-tight">
          <span
            [ngClass]="[
              theme === 'night' ? 'text-white' : 'text-ink',
              textSizeClass
            ]"
          >Simpli</span><span
            [ngClass]="[
              sleepColorClass,
              'ml-0.5 sm:ml-1',
              textSizeClass
            ]"
          >Sleeps</span>
          <!-- Titik Merah Ikonik SimpliDOTS -->
          <span
            class="inline-block w-2 sm:w-2.5 h-2 sm:h-2.5 bg-brand rounded-full ml-1 border border-ink align-middle shrink-0"
            aria-hidden="true"
          ></span>
        </div>

        @if (showTagline) {
          <span
            [ngClass]="[
              'text-[9px] sm:text-[10px] font-pixel tracking-wider leading-none mt-0.5 uppercase',
              theme === 'night' ? 'text-brand-100' : 'text-ink-muted'
            ]"
          >
            Anti Begadang Club
          </span>
        }
      </div>
    </a>
  `
})
export class WordmarkComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showTagline = true;
  @Input() theme: 'light' | 'night' = 'light';

  get sleepColorClass(): string {
    if (this.theme === 'night') return 'text-brand-100';
    // Gunakan text-brand-ink (#C21F42, kontras 5.7:1 pass WCAG AA) pada teks kecil/sedang (<24px)
    // Teks besar (lg >= 24px) tetap memakai text-brand (#EC385B)
    return this.size === 'lg' ? 'text-brand' : 'text-brand-ink';
  }

  get iconPxSize(): number {
    switch (this.size) {
      case 'sm':
        return 28;
      case 'lg':
        return 48;
      case 'md':
      default:
        return 36;
    }
  }

  get iconSizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'w-6 h-6 sm:w-7 sm:h-7';
      case 'lg':
        return 'w-10 h-10 md:w-12 md:h-12';
      case 'md':
      default:
        return 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9';
    }
  }

  get textSizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'text-sm sm:text-base';
      case 'lg':
        return 'text-2xl sm:text-3xl';
      case 'md':
      default:
        return 'text-base sm:text-lg md:text-xl';
    }
  }

  get pixelSizeClass(): string {
    return this.textSizeClass;
  }
}
