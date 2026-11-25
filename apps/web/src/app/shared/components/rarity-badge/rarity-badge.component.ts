import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Rarity } from 'shared';

@Component({
  selector: 'app-rarity-badge',
  imports: [CommonModule],
  template: `
    <span
      [ngClass]="[
        'pixel-badge select-none rounded-[6px] whitespace-nowrap',
        sizeClasses,
        rarityClasses
      ]"
    >
      @if (showIcon) {
        <span class="inline-block leading-none" aria-hidden="true">{{ iconSymbol }}</span>
      }
      <span>{{ rarity }}</span>
    </span>
  `
})
export class RarityBadgeComponent {
  @Input() rarity: Rarity | string = 'Common';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showIcon = true;

  get sizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'text-[10px] px-1.5 py-0.5 rounded-[5px]';
      case 'lg':
        return 'text-sm px-3 py-1 font-extrabold rounded-[7px]';
      case 'md':
      default:
        return 'text-xs px-2 py-0.5 rounded-[6px]';
    }
  }

  get iconSymbol(): string {
    switch (this.rarity) {
      case 'Legendary':
        return '◆';
      case 'Epic':
        return '✦';
      case 'Rare':
        return '★';
      case 'Common':
      default:
        return '•';
    }
  }

  get rarityClasses(): string {
    switch (this.rarity) {
      case 'Legendary':
        return 'bg-[#FFF3D6] text-[#B45309] border-[#B45309] shadow-[2px_2px_0_#B45309]';
      case 'Epic':
        return 'bg-[#F5E8FF] text-[#9333EA] border-[#9333EA] shadow-[2px_2px_0_#9333EA]';
      case 'Rare':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB] shadow-[2px_2px_0_#2563EB]';
      case 'Common':
      default:
        return 'bg-[#F3F4F6] text-[#5C5C5C] border-[#5C5C5C] shadow-[2px_2px_0_#5C5C5C]';
    }
  }
}
