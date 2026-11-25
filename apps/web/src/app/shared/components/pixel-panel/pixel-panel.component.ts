import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type PanelVariant = 'default' | 'night' | 'lavender' | 'orange' | 'purple';

@Component({
  selector: 'app-pixel-panel',
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="[
        'panel-pixel rounded-[12px] relative overflow-hidden transition-all',
        variantClasses,
        noBorder ? 'border-0 shadow-none' : ''
      ]"
    >
      <!-- Vintage/Pixel Titlebar jika ada judul -->
      @if (title || icon || badge) {
        <div
          class="px-4 py-2.5 flex items-center justify-between border-b-3 border-ink"
          [ngClass]="headerClasses"
        >
          <div class="flex items-center gap-2 min-w-0">
            @if (icon) {
              <span class="text-lg leading-none shrink-0" aria-hidden="true">{{ icon }}</span>
            }
            <div class="truncate">
              <h3 class="font-pixel text-sm md:text-base font-bold leading-tight truncate uppercase tracking-wider">
                {{ title }}
              </h3>
              @if (subtitle) {
                <p class="text-xs opacity-75 truncate">{{ subtitle }}</p>
              }
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            @if (badge) {
              <span
                class="font-pixel text-xs px-2 py-0.5 border-2 border-current font-bold uppercase rounded-[6px]"
                [ngClass]="badgeClasses"
              >
                {{ badge }}
              </span>
            }
            <ng-content select="[slot=header-action]"></ng-content>
          </div>
        </div>
      }

      <!-- Panel Body -->
      <div [ngClass]="bodyPadding">
        <ng-content></ng-content>
      </div>

      <!-- Optional Footer -->
      <ng-content select="[slot=footer]"></ng-content>
    </div>
  `
})
export class PixelPanelComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() badge?: string;
  @Input() badgeVariant: 'default' | 'orange' | 'purple' | 'green' = 'default';
  @Input() variant: PanelVariant = 'default';
  @Input() noBorder = false;
  @Input() bodyPadding = 'p-4 md:p-5';

  get variantClasses(): string {
    switch (this.variant) {
      case 'night':
        return 'bg-brand-deep text-white';
      case 'lavender':
        return 'bg-brand-50 text-ink';
      case 'orange':
        return 'bg-[#FFF8EE] text-ink';
      case 'purple':
        return 'bg-brand-100 text-ink';
      case 'default':
      default:
        return 'bg-surface text-ink';
    }
  }

  get headerClasses(): string {
    switch (this.variant) {
      case 'night':
        return 'bg-[#6D0E23] text-white';
      case 'lavender':
        return 'bg-brand-100 text-brand-ink';
      case 'orange':
        return 'bg-[#FEEDD5] text-[#9A5200]';
      case 'purple':
        return 'bg-brand-200 text-brand-ink';
      case 'default':
      default:
        return 'bg-brand-50 text-ink';
    }
  }

  get badgeClasses(): string {
    switch (this.badgeVariant) {
      case 'orange':
        return 'bg-[#FFF1DC] text-[#B45309] border-[#B45309]';
      case 'purple':
        return 'bg-brand-100 text-brand-ink border-brand-ink';
      case 'green':
        return 'bg-[#ECFDF5] text-success border-success';
      case 'default':
      default:
        return 'bg-white text-ink border-ink';
    }
  }
}
