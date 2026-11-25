import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ButtonVariant = 'primary' | 'orange' | 'secondary' | 'danger' | 'ghost' | 'night' | 'white';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-pixel-button',
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel || null"
      (click)="onClick($event)"
      [ngClass]="[
        'btn-pixel focus-visible:outline-none select-none whitespace-nowrap',
        sizeClasses,
        variantClasses,
        fullWidth ? 'w-full' : '',
        active ? 'translate-y-[2px] shadow-[2px_2px_0_#141414]' : ''
      ]"
    >
      <span class="inline-flex items-center justify-center gap-2">
        <ng-content select="[slot=icon-left]"></ng-content>
        <ng-content></ng-content>
        <ng-content select="[slot=icon-right]"></ng-content>
      </span>
    </button>
  `
})
export class PixelButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() active = false;
  @Input() ariaLabel?: string;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get sizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'btn-pixel--sm min-h-[44px] rounded-[6px]';
      case 'lg':
        return 'px-6 py-3.5 text-base md:text-lg min-h-[48px] rounded-[8px] shadow-[6px_6px_0_#141414]';
      case 'xl':
        return 'px-8 py-4 text-lg md:text-xl font-bold tracking-wide min-h-[54px] rounded-[10px] shadow-[7px_7px_0_#141414]';
      case 'md':
      default:
        return 'min-h-[44px] rounded-[8px]';
    }
  }

  get variantClasses(): string {
    switch (this.variant) {
      case 'orange':
        return 'btn-pixel--sun';
      case 'secondary':
        return 'btn-pixel--ghost';
      case 'danger':
        return 'bg-brand-ink text-white hover:bg-brand-deep border-ink shadow-[6px_6px_0_#141414]';
      case 'white':
        return 'bg-white text-ink hover:bg-brand-50 border-ink shadow-[6px_6px_0_#141414]';
      case 'night':
        return 'bg-brand-deep text-white hover:bg-[#6D0E23] border-ink shadow-[6px_6px_0_#141414]';
      case 'ghost':
        return 'bg-transparent text-brand-ink hover:bg-brand-50 border-transparent shadow-none hover:shadow-none hover:translate-y-0';
      case 'primary':
      default:
        return 'bg-brand-strong text-white hover:bg-brand border-ink shadow-[6px_6px_0_#141414]';
    }
  }

  onClick(e: MouseEvent): void {
    if (!this.disabled) {
      this.clicked.emit(e);
    }
  }
}
