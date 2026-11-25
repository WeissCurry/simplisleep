import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject
} from '@angular/core';
import { gsap } from 'gsap';
import { Card } from 'shared';
import { AnimationService } from '../../core/utils/animation.service';
import { cardImageUrl, cardSilhouetteUrl, hasCardImage, onCardImageError } from '../../core/utils/card.util';
import { RarityBadgeComponent } from '../../shared/components/rarity-badge/rarity-badge.component';
import { ToastService } from '../../core/services/toast.service';
import { CARD_TRIVIA_MAP, CardWithTrivia } from './cards.service';

@Component({
  selector: 'app-card-detail-modal',
  standalone: true,
  imports: [CommonModule, RarityBadgeComponent],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-ink/70 backdrop-blur-[2px] transition-opacity select-none"
      (click)="onBackdropClick($event)"
    >
      <div
        #modalBox
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-modal-title"
        class="panel-pixel rounded-[12px] w-full max-w-lg bg-surface flex flex-col relative max-h-[92vh] overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Titlebar (Wizardshock Header) -->
        <div class="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b-3 border-ink flex items-center justify-between bg-brand-50">
          <div class="flex items-center gap-2">
            <h2 id="card-modal-title" class="font-pixel text-xs sm:text-base font-bold text-ink uppercase tracking-wide whitespace-nowrap">
              {{ isUnlocked ? 'Detail Kartu Koleksi' : 'Detail Kartu (Siluet Terkunci)' }}
            </h2>
          </div>

          <button
            #closeBtn
            type="button"
            (click)="close.emit()"
            class="btn-pixel btn-pixel--sm rounded-[8px] whitespace-nowrap bg-danger text-white min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] px-2 sm:px-2.5 py-1 font-bold cursor-pointer text-xs sm:text-sm"
            aria-label="Tutup modal detail kartu"
            title="Tutup Modal"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          <!-- 3D Card Stage with Flip Effect (Fit in 344px) -->
          <div class="perspective-1000 flex justify-center py-1 sm:py-2">
            <div
              #cardFlipper
              (click)="toggleFlip()"
              class="w-44 h-44 sm:w-60 sm:h-60 relative border-3 border-ink cursor-pointer select-none pixel-shadow transition-shadow duration-300 rounded-[8px]"
              style="transform-style: preserve-3d;"
              title="Klik untuk membalik kartu (Flip)"
              tabindex="0"
              (keydown.enter)="toggleFlip()"
              (keydown.space)="$event.preventDefault(); toggleFlip()"
              aria-label="Tampilan kartu, tekan spasi atau enter untuk membalik"
            >
              <!-- Card Face (Front: Image or Silhouette, Rounded 8px) -->
              <div
                class="absolute inset-0 backface-hidden overflow-hidden flex flex-col items-center justify-center p-2.5 sm:p-3 border-2 border-ink rounded-[8px]"
                [ngClass]="isUnlocked ? 'bg-brand-50' : softRarityBgClass"
              >
                @if (isUnlocked) {
                  <!-- Unlocked Image (Hanya dimuat bila kartu sudah terbuka) -->
                  @if (hasCardArt && !imageFailed) {
                    <img
                      [src]="imageSrc"
                      [alt]="card.name"
                      (error)="onImageError($event)"
                      class="w-full h-full object-contain pixelated drop-shadow-md rounded-[8px]"
                    />
                  } @else {
                    <div class="flex flex-col items-center justify-center text-center p-2 text-ink space-y-1.5 sm:space-y-2">
                      <div class="w-12 h-12 sm:w-16 sm:h-16 border-2 border-ink flex items-center justify-center text-2xl sm:text-3xl font-pixel bg-sun text-ink pixel-shadow-sm rounded-[8px]">
                        {{ rarityEmoji }}
                      </div>
                      <div>
                        <span class="font-pixel text-[11px] sm:text-xs font-bold text-brand-ink uppercase block whitespace-nowrap">
                          [PIXEL SPRITE 16-BIT]
                        </span>
                        <span class="text-[10px] sm:text-[11px] text-ink-muted block mt-0.5 whitespace-nowrap">
                          {{ card.id + '.webp' }}
                        </span>
                      </div>
                    </div>
                  }
                } @else {
                  <!-- Silhouette State (HANYA muat siluet jika file ada, jangan bocorkan gambar asli ke devtools) -->
                  @if (hasCardArt && !silhouetteFailed) {
                    <img
                      [src]="silhouetteSrc"
                      alt="Siluet Kartu"
                      (error)="onSilhouetteError()"
                      class="w-full h-full object-contain pixelated drop-shadow-md rounded-[8px]"
                    />
                  } @else {
                    <div class="flex flex-col items-center justify-center text-center p-2 text-ink space-y-1.5 sm:space-y-2">
                      <div class="w-12 h-12 sm:w-16 sm:h-16 border-2 border-ink flex items-center justify-center text-2xl sm:text-3xl font-pixel bg-surface text-ink pixel-shadow-sm rounded-[8px]">
                        ?
                      </div>
                      <div>
                        <span class="font-pixel text-[11px] sm:text-xs font-bold text-brand-ink uppercase block whitespace-nowrap">
                          [BELUM DITEMUKAN]
                        </span>
                        <span class="text-[10px] sm:text-[11px] text-ink-muted block mt-0.5 whitespace-nowrap">
                          Misteri
                        </span>
                      </div>
                    </div>
                  }
                }

                <!-- Tap hint -->
                <div class="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
                  <span class="text-[9px] sm:text-[10px] font-pixel text-ink bg-surface border border-ink px-1.5 py-0.5 pixel-shadow-sm rounded-[6px] whitespace-nowrap">
                    Klik untuk putar
                  </span>
                </div>
              </div>

              <!-- Card Back (Holographic/Retro Pattern, Rounded 8px) -->
              <div
                class="absolute inset-0 backface-hidden bg-ink text-white p-3 sm:p-4 flex flex-col items-center justify-center text-center border-2 border-sun rounded-[8px]"
                style="transform: rotateY(180deg);"
              >
                <div class="w-10 h-10 sm:w-14 sm:h-14 border-2 border-sun flex items-center justify-center mb-1.5 sm:mb-2 bg-brand-deep rounded-[8px]">
                  <svg class="w-5 h-5 sm:w-7 sm:h-7 text-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </div>
                <h4 class="font-pixel text-sm sm:text-base text-sun font-bold uppercase tracking-wider whitespace-nowrap">
                  Simply is Sleeping
                </h4>
                <p class="text-[10px] sm:text-xs text-brand-100 mt-1 font-mono whitespace-nowrap">
                  Kartu Koleksi Permanen
                </p>
                <div class="mt-2 sm:mt-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-surface text-ink border border-ink font-pixel text-[10px] sm:text-xs font-bold rounded-[6px] whitespace-nowrap">
                  Rarity Weight: {{ rarityWeight }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Card Header & Rarity -->
          <div class="text-center space-y-1.5 sm:space-y-2">
            <h3 class="font-pixel text-xl sm:text-3xl font-bold text-ink uppercase tracking-tight">
              {{ isUnlocked ? card.name : '???' }}
            </h3>

            <div class="flex items-center justify-center gap-1.5 sm:gap-2 pt-1 flex-wrap">
              <app-rarity-badge [rarity]="card.rarity" size="md"></app-rarity-badge>

              @if (isUnlocked) {
                <span
                  class="font-pixel text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 border-2 border-ink font-bold uppercase rounded-[6px] whitespace-nowrap cursor-pointer hover:underline"
                  [ngClass]="card.status === 'minted' ? 'bg-brand-100 text-brand-ink' : 'bg-sun/30 text-ink'"
                  (click)="showStatusToast()"
                  title="Klik untuk info status penyimpanan"
                >
                  {{ card.status === 'minted' ? '✓ Tersimpan' : 'Sedang Disimpan' }}
                </span>
              } @else {
                <span class="font-pixel text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 bg-paper text-ink-muted border-2 border-ink font-bold uppercase rounded-[6px] whitespace-nowrap">
                  Siluet (Belum Terbuka)
                </span>
              }
            </div>
          </div>

          <!-- Indonesian Humorous Description (Bio / Silhouette Message) -->
          <div class="panel-pixel rounded-[12px] p-3.5 sm:p-4 bg-brand-50">
            <span class="text-[11px] sm:text-xs font-pixel font-bold text-brand-ink uppercase tracking-wider block mb-1 whitespace-nowrap">
              Catatan Kebiasaan Tidur:
            </span>
            <p class="text-xs sm:text-sm text-ink leading-relaxed font-sans">
              {{ isUnlocked ? ('"' + card.description + '"') : 'Masih ngorok di tempat lain. Tidur sehat buat membangunkannya.' }}
            </p>
          </div>

          <!-- Trivia / Jokes Card Section -->
          @if (isUnlocked && trivia) {
            <div class="panel-pixel rounded-[12px] p-3.5 sm:p-4 bg-brand-50 border-2 border-ink">
              <span class="text-[11px] sm:text-xs font-pixel font-bold text-brand-ink uppercase tracking-wider block mb-1 whitespace-nowrap">
                {{ triviaType === 'jokes' ? 'Jokes Ngantuk:' : 'Tahukah Kamu?' }}
              </span>
              <p class="text-xs sm:text-sm text-ink leading-relaxed font-sans font-medium">
                {{ trivia }}
              </p>
            </div>
          } @else if (!isUnlocked) {
            <div class="panel-pixel rounded-[12px] p-3 sm:p-3.5 bg-brand-50/70 border-2 border-ink/40">
              <span class="text-[10px] sm:text-[11px] font-pixel font-bold text-brand-ink/80 uppercase tracking-wider block mb-1 whitespace-nowrap">
                Trivia Kartu:
              </span>
              <p class="text-xs text-ink-muted italic font-sans">
                Trivia terbuka setelah kartu ini kamu dapatkan.
              </p>
            </div>
          }

          <!-- Detail Catatan Kartu Koleksi -->
          @if (isUnlocked) {
            <div class="panel-pixel rounded-[12px] p-3.5 sm:p-4 bg-surface text-xs space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-ink-muted font-medium whitespace-nowrap">Sistem Pencatatan:</span>
                <span class="font-mono font-bold text-ink whitespace-nowrap">Kartu Koleksi Permanen</span>
              </div>

              <div class="flex items-center justify-between text-xs">
                <span class="text-ink-muted font-medium whitespace-nowrap">Status Catatan:</span>
                <span class="font-medium text-ink flex items-center gap-1.5 whitespace-nowrap">
                  <span class="w-2 h-2 rounded-full bg-brand inline-block"></span>
                  Catatan Publik
                </span>
              </div>

              @if (card.tokenId) {
                <div class="flex items-center justify-between text-xs">
                  <span class="text-ink-muted font-medium whitespace-nowrap">No. Kartu:</span>
                  <span class="font-mono font-bold text-brand-ink whitespace-nowrap">#{{ card.tokenId }}</span>
                </div>
              }

              @if (card.txHash) {
                <div class="pt-2 border-t-2 border-ink flex items-center justify-between text-xs">
                  <span class="text-ink-muted whitespace-nowrap">Kode Verifikasi:</span>
                  <a
                    [href]="'https://sepolia.etherscan.io/tx/' + card.txHash"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-pixel text-brand-ink hover:underline flex items-center gap-1 font-bold whitespace-nowrap"
                  >
                    Lihat Catatan Publik ↗
                  </a>
                </div>
              } @else {
                <div class="pt-2 border-t border-ink/20 text-[11px] sm:text-xs text-brand-ink bg-brand-50 p-2 font-sans rounded-[6px]">
                  Kartu tersimpan di database lokal. Akan otomatis diamankan ke catatan publik saat server terhubung.
                </div>
              }
            </div>
          } @else {
            <div class="panel-pixel rounded-[12px] p-3.5 sm:p-4 bg-surface text-xs space-y-1.5">
              <span class="font-pixel font-bold text-ink uppercase block text-xs">
                Cara Membuka Kartu Ini:
              </span>
              <p class="text-xs text-ink-muted leading-relaxed">
                Kartu ini belum kamu miliki. Capai durasi tidur sehat 7–9 jam dan konsistensi sirkadian tinggi (skor ≥ 70) malam ini untuk memicu drop kartu baru!
              </p>
            </div>
          }
        </div>

        <!-- Modal Footer -->
        <div class="p-3 sm:p-4 bg-brand-50 border-t-3 border-ink flex items-center justify-between gap-2.5 sm:gap-3">
          <button
            type="button"
            (click)="toggleFlip()"
            class="btn-pixel btn-pixel--ghost btn-pixel--sm rounded-[8px] whitespace-nowrap cursor-pointer text-xs sm:text-sm"
            aria-label="Putar kartu untuk melihat sisi belakang"
          >
            Putar Kartu (Flip)
          </button>

          <button
            type="button"
            (click)="close.emit()"
            class="btn-pixel btn-pixel--sm rounded-[8px] whitespace-nowrap cursor-pointer text-xs sm:text-sm"
            aria-label="Tutup dialog detail kartu"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .perspective-1000 {
      perspective: 1000px;
    }
    .backface-hidden {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    :host .panel-pixel {
      border-radius: 12px;
    }
    :host .btn-pixel {
      border-radius: 8px;
      white-space: nowrap;
    }
  `]
})
export class CardDetailModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) card!: CardWithTrivia;
  @Input() isUnlocked = true;
  @Output() close = new EventEmitter<void>();

  @ViewChild('cardFlipper') cardFlipper!: ElementRef<HTMLElement>;
  @ViewChild('modalBox') modalBox!: ElementRef<HTMLElement>;
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;

  private anim = inject(AnimationService);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private triggerElement: HTMLElement | null = null;

  isFlipped = false;
  imageLoaded = true;
  imageFailed = false;
  silhouetteFailed = false;

  get trivia(): string {
    const cardId = (this.card as any)?.cardId || this.card?.id;
    return this.card?.trivia || CARD_TRIVIA_MAP[cardId]?.trivia || '';
  }

  get triviaType(): 'fakta' | 'jokes' {
    const cardId = (this.card as any)?.cardId || this.card?.id;
    return this.card?.triviaType || CARD_TRIVIA_MAP[cardId]?.triviaType || 'fakta';
  }

  get hasCardArt(): boolean {
    return hasCardImage(this.card?.id);
  }

  get imageSrc(): string {
    return cardImageUrl(this.card.id);
  }

  get silhouetteSrc(): string {
    return cardSilhouetteUrl(this.card.id);
  }

  get softRarityBgClass(): string {
    switch (this.card.rarity) {
      case 'Legendary':
        return 'bg-amber-50';
      case 'Epic':
        return 'bg-purple-50';
      case 'Rare':
        return 'bg-blue-50';
      case 'Common':
      default:
        return 'bg-brand-50';
    }
  }

  onImageError(event: Event): void {
    onCardImageError(event, this.card.name, this.card.rarity);
    this.imageFailed = true;
  }

  onSilhouetteError(): void {
    this.silhouetteFailed = true;
  }

  get rarityEmoji(): string {
    switch (this.card.rarity) {
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

  get rarityWeight(): number {
    switch (this.card.rarity) {
      case 'Legendary':
        return 5;
      case 'Epic':
        return 12;
      case 'Rare':
        return 28;
      case 'Common':
      default:
        return 55;
    }
  }

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      this.triggerElement = document.activeElement as HTMLElement | null;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.closeBtn?.nativeElement?.focus();
    }, 50);

    if (!this.anim.isReducedMotion()) {
      gsap.from(this.modalBox.nativeElement, {
        scale: 0.9,
        opacity: 0,
        duration: 0.25,
        ease: 'back.out(1.5)'
      });
    }

    this.destroyRef.onDestroy(() => {
      if (this.cardFlipper?.nativeElement) {
        gsap.killTweensOf(this.cardFlipper.nativeElement);
      }
      if (this.modalBox?.nativeElement) {
        gsap.killTweensOf(this.modalBox.nativeElement);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
      this.triggerElement.focus();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    event.preventDefault();
    this.close.emit();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const modal = this.modalBox?.nativeElement;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex="0"]:not([disabled]), a[href]:not([disabled])'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  showStatusToast(): void {
    if (this.card.status === 'minted') {
      this.toast.success(`Kartu #${this.card.id} telah disimpan permanen di catatan publik.`, 'Kartu Tersimpan');
    } else {
      this.toast.warning('Kartu tersimpan di database lokal. Akan otomatis diamankan ke catatan publik saat server terhubung.', 'Sedang Disimpan');
    }
  }

  toggleFlip(): void {
    if (this.anim.isReducedMotion()) {
      this.isFlipped = !this.isFlipped;
      if (this.cardFlipper?.nativeElement) {
        this.cardFlipper.nativeElement.style.transform = this.isFlipped
          ? 'rotateY(180deg)'
          : 'rotateY(0deg)';
      }
      return;
    }

    const targetRot = this.isFlipped ? 0 : 180;
    gsap.to(this.cardFlipper.nativeElement, {
      rotateY: targetRot,
      duration: 0.6,
      ease: 'back.out(1.4)',
      onComplete: () => {
        this.isFlipped = !this.isFlipped;
      }
    });
  }

  onBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      this.close.emit();
    }
  }
}
