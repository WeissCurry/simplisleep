import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [CommonModule],
  template: `
    <div [ngClass]="['relative inline-flex items-center justify-center shrink-0', containerSizeClass]">
      <!-- Pixel Avatar Box (Agak Rounded: 8px) -->
      <div
        [ngClass]="[
          'w-full h-full border-2 border-ink flex items-center justify-center font-pixel font-bold select-none overflow-hidden',
          rounded ? 'rounded-full' : 'rounded-[8px]',
          bgColorClass,
          textColorClass,
          shadowClass
        ]"
      >
        <!-- Pixel Character Face (Generated via SVG based on avatar key or initials) -->
        <svg
          class="w-full h-full p-0.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          shape-rendering="crispEdges"
        >
          <!-- Background Skin Tone -->
          <rect x="5" y="6" width="14" height="13" [attr.fill]="skinColor" />

          <!-- Hair / Cap -->
          <path [attr.d]="hairPath" [attr.fill]="hairColor" />

          <!-- Pixel Eyes -->
          @if (status === 'sleeping') {
            <!-- Sleeping Closed Eyes -->
            <rect x="7" y="11" width="3" height="1" fill="#141414" />
            <rect x="14" y="11" width="3" height="1" fill="#141414" />
          } @else {
            <!-- Awake Bright Eyes -->
            <rect x="8" y="10" width="2" height="3" fill="#141414" />
            <rect x="14" y="10" width="2" height="3" fill="#141414" />
            <rect x="8" y="10" width="1" height="1" fill="#FFFFFF" />
            <rect x="14" y="10" width="1" height="1" fill="#FFFFFF" />
          }

          <!-- Pixel Smile/Mouth -->
          <rect x="10" y="15" width="4" height="1" fill="#EC385B" />

          <!-- Cheeks Blush -->
          <rect x="6" y="13" width="2" height="1" fill="#F58FA3" opacity="0.8" />
          <rect x="16" y="13" width="2" height="1" fill="#F58FA3" opacity="0.8" />
        </svg>
      </div>

      <!-- Status Indicator Badge (Tidur vs Melek, Radius 6px) -->
      @if (status && status !== 'none') {
        <span
          [ngClass]="[
            'absolute -bottom-0.5 -right-0.5 border border-ink flex items-center justify-center',
            rounded ? 'rounded-full' : 'rounded-[6px]',
            statusIndicatorSizeClass,
            statusColorClass
          ]"
          [attr.title]="statusTooltip"
        >
          @if (status === 'sleeping') {
            <svg class="w-2.5 h-2.5 text-brand-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          } @else if (status === 'awake') {
            <svg class="w-2.5 h-2.5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          }
        </span>
      }
    </div>
  `
})
export class AvatarComponent {
  @Input() name = 'Simplimate';
  @Input() avatar = 'user-1';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() status: 'sleeping' | 'awake' | 'none' = 'none';
  @Input() rounded = false;
  @Input() hasShadow = true;

  get containerSizeClass(): string {
    switch (this.size) {
      case 'xs':
        return 'w-6 h-6';
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      case 'md':
      default:
        return 'w-10 h-10';
    }
  }

  get statusIndicatorSizeClass(): string {
    switch (this.size) {
      case 'xs':
      case 'sm':
        return 'w-3.5 h-3.5';
      case 'lg':
      case 'xl':
        return 'w-5 h-5';
      case 'md':
      default:
        return 'w-4 h-4';
    }
  }

  get shadowClass(): string {
    if (!this.hasShadow) return '';
    return this.size === 'xs' || this.size === 'sm' ? 'shadow-[2px_2px_0_#141414]' : 'shadow-[3px_3px_0_#141414]';
  }

  get bgColorClass(): string {
    // Palet warna latar avatar segar berbasis token baru
    const colors = [
      'bg-brand-50',
      'bg-[#FFF3D6]',
      'bg-[#EFF6FF]',
      'bg-[#ECFDF5]',
      'bg-brand-100',
      'bg-[#FDF2F8]'
    ];
    const index = Math.abs(this.hashString(this.name)) % colors.length;
    return colors[index];
  }

  get textColorClass(): string {
    return 'text-ink';
  }

  get skinColor(): string {
    const tones = ['#FFD8A8', '#FEE2C5', '#F5C999', '#DEAA79', '#D08B5B'];
    const idx = Math.abs(this.hashString(this.name + 'skin')) % tones.length;
    return tones[idx];
  }

  get hairColor(): string {
    const colors = ['#141414', '#8E1631', '#C21F42', '#78350F', '#B45309', '#1F8A4C'];
    const idx = Math.abs(this.hashString(this.name + 'hair')) % colors.length;
    return colors[idx];
  }

  get hairPath(): string {
    const hash = Math.abs(this.hashString(this.name)) % 3;
    if (hash === 0) {
      // Rambut poni lurus
      return 'M 5 4 H 19 V 8 H 17 V 6 H 7 V 8 H 5 Z';
    } else if (hash === 1) {
      // Topi tidur nightcap
      return 'M 4 5 H 20 V 8 H 18 V 6 H 6 V 8 H 4 Z M 16 3 H 21 V 5 H 16 Z M 21 5 H 23 V 8 H 21 Z';
    } else {
      // Rambut ikal pixel
      return 'M 4 4 H 20 V 7 H 18 V 9 H 16 V 6 H 8 V 9 H 6 V 7 H 4 Z';
    }
  }

  get statusColorClass(): string {
    switch (this.status) {
      case 'sleeping':
        return 'bg-brand-deep text-white';
      case 'awake':
        return 'bg-sun text-ink';
      default:
        return 'bg-slate-300';
    }
  }

  get statusTooltip(): string {
    if (this.status === 'sleeping') return 'Sedang tidur';
    if (this.status === 'awake') return 'Masih melek';
    return '';
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
