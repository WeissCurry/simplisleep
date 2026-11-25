import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  computed,
  signal
} from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-pixel-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #containerEl
      class="relative w-full select-none focus:outline-none"
      role="region"
      aria-roledescription="carousel"
      [attr.aria-label]="ariaLabel"
      tabindex="0"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (focusin)="onFocusIn()"
      (focusout)="onFocusOut($event)"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd($event)"
      (touchcancel)="onTouchCancel()"
      (keydown)="onKeyDown($event)"
    >
      <!-- Header Bar: Indikator & Kontrol (Previous, Next) -->
      <div class="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div class="flex items-center gap-2">
          <span
            class="font-pixel text-xs bg-brand-50 border-2 border-ink px-2.5 py-1 font-bold text-ink rounded-[6px] shadow-[2px_2px_0px_#141414]"
          >
            {{ currentSlideDisplay() }} / {{ itemsSignal().length }}
          </span>
          @if (prefersReducedMotion()) {
            <span class="font-pixel text-[11px] text-ink-muted">Mode statis</span>
          }
        </div>

        <!-- Tombol Kontrol (WCAG: min-height 44px, min-width 44px, aria-label) -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Tombol Sebelumnya -->
          <button
            type="button"
            (click)="prev()"
            class="btn-pixel btn-pixel--ghost btn-pixel--sm rounded-[8px] min-w-[44px] min-h-[44px] p-0 flex items-center justify-center cursor-pointer text-sm font-bold active:translate-y-0"
            aria-label="Geser ke kartu sebelumnya"
            title="Geser kartu sebelumnya"
          >
            ◀
          </button>

          <!-- Tombol Berikutnya -->
          <button
            type="button"
            (click)="next(true)"
            class="btn-pixel btn-pixel--ghost btn-pixel--sm rounded-[8px] min-w-[44px] min-h-[44px] p-0 flex items-center justify-center cursor-pointer text-sm font-bold active:translate-y-0"
            aria-label="Geser ke kartu berikutnya"
            title="Geser kartu berikutnya"
          >
            ▶
          </button>
        </div>
      </div>

      <!-- Jendela Carousel Viewport: Ruang leluasa untuk bayangan kartu 6px dan hover translateY -->
      <div
        #windowEl
        class="slider-viewport w-full relative pt-2 pb-5 px-1 select-none"
        [class.reduced-motion]="prefersReducedMotion()"
        [attr.aria-live]="isManual() ? 'polite' : 'off'"
      >
        @if (itemsSignal().length === 0) {
          <!-- Skeleton / Loading State saat data kartu belum selesai dimuat -->
          <div class="w-full py-8 sm:py-12 flex flex-col items-center justify-center text-center bg-surface border-2 border-ink rounded-[12px] p-6 space-y-3">
            <div class="w-12 h-12 bg-brand-50 border-2 border-ink shadow-[2px_2px_0_#141414] rounded-[8px] flex items-center justify-center">
              <svg class="w-6 h-6 text-brand-ink animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
            <p class="font-pixel text-xs sm:text-sm font-bold text-brand-ink uppercase tracking-wider">
              Memuat cuplikan kartu Simply is Sleeping...
            </p>
          </div>
        } @else {
          <div
            #trackEl
            class="flex items-stretch will-change-transform pb-2 pt-1"
            [style.gap.px]="gap()"
          >
            @for (item of displayItems(); track $index) {
              <div
                class="shrink-0 h-auto"
                [class.scroll-snap-slide]="prefersReducedMotion()"
                [style.width.px]="itemWidth()"
                [attr.aria-hidden]="isSlideHidden($index) ? 'true' : null"
                [inert]="isSlideHidden($index)"
                [attr.inert]="isSlideHidden($index) ? '' : null"
                [attr.tabindex]="isSlideHidden($index) ? -1 : null"
              >
                @if (itemTemplate) {
                  <ng-container
                    *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: $index % itemsSignal().length, hidden: isSlideHidden($index) }"
                  ></ng-container>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .slider-viewport {
      overflow-x: clip;
      overflow-y: visible;
      mask-image: linear-gradient(
        to right,
        transparent 0%,
        black 16px,
        black calc(100% - 16px),
        transparent 100%
      );
      -webkit-mask-image: linear-gradient(
        to right,
        transparent 0%,
        black 16px,
        black calc(100% - 16px),
        transparent 100%
      );
    }
    @supports not (overflow-x: clip) {
      .slider-viewport {
        overflow: hidden;
      }
    }
    @media (max-width: 640px) {
      .slider-viewport {
        mask-image: linear-gradient(
          to right,
          transparent 0%,
          black 6px,
          black calc(100% - 8px),
          transparent 100%
        );
        -webkit-mask-image: linear-gradient(
          to right,
          transparent 0%,
          black 6px,
          black calc(100% - 8px),
          transparent 100%
        );
      }
    }
    .slider-viewport.reduced-motion {
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      mask-image: none;
      -webkit-mask-image: none;
    }
    .scroll-snap-slide {
      scroll-snap-align: start;
    }
  `]
})
export class PixelSliderComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  readonly itemsSignal = signal<any[]>([]);

  @Input()
  set items(val: any[]) {
    const list = val || [];
    this._items = list;
    this.itemsSignal.set(list);
    this.handleItemsChange();
  }
  get items(): any[] {
    return this._items;
  }
  private _items: any[] = [];

  @Input() ariaLabel = 'Slider Kartu Simply is Sleeping';
  @Input() speed = 32; // px per second (~25-35 px/detik sesuai continuous marquee)
  @Input() autoAdvanceInterval = 3500;

  @ContentChild(TemplateRef) itemTemplate?: TemplateRef<{ $implicit: any; index: number; hidden?: boolean }>;

  @ViewChild('containerEl') containerEl!: ElementRef<HTMLElement>;
  @ViewChild('windowEl') windowEl!: ElementRef<HTMLElement>;
  @ViewChild('trackEl') trackEl!: ElementRef<HTMLElement>;

  currentIndex = signal(0);
  isHovered = signal(false);
  isFocused = signal(false);
  isInView = signal(true);
  isTabVisible = signal(true);
  prefersReducedMotion = signal(false);

  visibleCount = signal(5);
  itemWidth = signal(200);
  gap = signal(14);

  isTweening = signal(false);
  isManual = signal(false);

  private marqueeTween: gsap.core.Tween | null = null;
  private nudgeTween: gsap.core.Tween | null = null;
  private manualTimeout: any = null;
  private touchPauseTimeout: any = null;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private visibilityHandler?: () => void;
  private windowResizeHandler?: () => void;
  private mediaQueryHandler?: (e: MediaQueryListEvent) => void;
  private mediaQueryList?: MediaQueryList;

  // Touch Swipe State
  private touchStartX = 0;
  private touchStartY = 0;
  isSwiping = false;
  isTouchPaused = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Duplikasi set item dengan jumlah cukup untuk menghasilkan seamless loop tanpa celah
   */
  displayItems = computed(() => {
    const list = this.itemsSignal();
    if (!list || list.length === 0) return [];
    const minNeeded = list.length + (this.visibleCount() || 5) + 2;
    const copies = Math.max(2, Math.ceil(minNeeded / list.length));
    const result: any[] = [];
    for (let i = 0; i < copies; i++) {
      result.push(...list);
    }
    return result;
  });

  currentSlideDisplay = computed(() => {
    const total = this.itemsSignal().length;
    if (total === 0) return 0;
    return (this.currentIndex() % total) + 1;
  });

  /**
   * Menentukan apakah slide tertentu sedang aktif/terlihat di viewport slider.
   * Slide klon ($index >= items.length) selalu dianggap tersembunyi/inert
   * untuk mencegah pelanggaran aria-hidden-focus.
   */
  isSlideInView(index: number): boolean {
    const total = this.itemsSignal().length;
    if (total === 0 || index >= total) {
      return false;
    }
    const current = this.currentIndex();
    const visible = this.visibleCount();
    if (current + visible <= total) {
      return index >= current && index < current + visible;
    }
    return index >= current || index < (current + visible) % total;
  }

  isSlideHidden(index: number): boolean {
    return !this.isSlideInView(index);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.handleItemsChange();
    }
  }

  private handleItemsChange(): void {
    this.currentIndex.set(0);
    if (!this.isBrowser) return;

    requestAnimationFrame(() => {
      if (this.windowEl?.nativeElement) {
        const w = this.windowEl.nativeElement.offsetWidth;
        if (w > 0) {
          this.updateMetrics(w);
        }
      }
      this.setupMarquee();
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // Deteksi prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion.set(this.mediaQueryList.matches);
      this.mediaQueryHandler = (e: MediaQueryListEvent) => {
        this.prefersReducedMotion.set(e.matches);
        this.setupMarquee();
      };
      this.mediaQueryList.addEventListener('change', this.mediaQueryHandler);
    }

    // Deteksi document visibilitychange
    if (typeof document !== 'undefined') {
      this.isTabVisible.set(document.visibilityState === 'visible');
      this.visibilityHandler = () => {
        this.isTabVisible.set(document.visibilityState === 'visible');
        this.updatePlayState();
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    // Deteksi resize window untuk penyesuaian breakpoint responsif
    if (typeof window !== 'undefined') {
      this.windowResizeHandler = () => {
        if (this.windowEl?.nativeElement) {
          this.updateMetrics(this.windowEl.nativeElement.offsetWidth);
        }
      };
      window.addEventListener('resize', this.windowResizeHandler);
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // Ukur lebar kontainer pertama kali
    if (this.windowEl?.nativeElement) {
      this.updateMetrics(this.windowEl.nativeElement.offsetWidth || 344);
    }

    // Pasang ResizeObserver pada viewport (windowEl)
    if (typeof ResizeObserver !== 'undefined' && this.windowEl?.nativeElement) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          if (w > 0) {
            this.updateMetrics(w);
          }
        }
      });
      this.resizeObserver.observe(this.windowEl.nativeElement);
    }

    // Pasang IntersectionObserver untuk pause otomatis saat di luar viewport
    if (typeof IntersectionObserver !== 'undefined' && this.containerEl?.nativeElement) {
      this.intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          this.isInView.set(entry.isIntersecting);
          this.updatePlayState();
        },
        { threshold: 0.1 }
      );
      this.intersectionObserver.observe(this.containerEl.nativeElement);
    }

    this.setupMarquee();
  }

  ngOnDestroy(): void {
    if (this.marqueeTween) {
      this.marqueeTween.kill();
      this.marqueeTween = null;
    }
    if (this.nudgeTween) {
      this.nudgeTween.kill();
      this.nudgeTween = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    if (this.mediaQueryHandler && this.mediaQueryList) {
      this.mediaQueryList.removeEventListener('change', this.mediaQueryHandler);
    }
    if (this.windowResizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.windowResizeHandler);
    }
    if (this.trackEl?.nativeElement) {
      gsap.killTweensOf(this.trackEl.nativeElement);
    }
    if (this.manualTimeout) {
      clearTimeout(this.manualTimeout);
    }
    if (this.touchPauseTimeout) {
      clearTimeout(this.touchPauseTimeout);
      this.touchPauseTimeout = null;
    }
  }

  /**
   * Menghitung metrik slider secara dinamis dan presisi per breakpoint:
   * - Desktop (>= 1024px): 5 kartu terlihat sekaligus
   * - Tablet medium (768px - 1023px): 4 kartu terlihat
   * - Tablet kecil (540px - 767px): 3 kartu terlihat
   * - Mobile (< 540px, misal 344px): ~2 kartu terlihat penuh + sedikit intip kartu berikutnya (peek ~28-35px)
   */
  updateMetrics(width?: number): void {
    const w = width ?? (this.windowEl?.nativeElement?.offsetWidth || 344);
    if (w <= 0) return;

    const screenW = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : w;

    let count: number;
    let g: number;
    let effectiveCount: number;

    if (screenW >= 1024 || w >= 940) {
      count = 5;
      effectiveCount = 5;
      g = 14;
    } else if (screenW >= 768 || w >= 660) {
      count = 4;
      effectiveCount = 4;
      g = 12;
    } else if (screenW >= 540 || w >= 460) {
      count = 3;
      effectiveCount = 3;
      g = 12;
    } else {
      // Mobile: 2 kartu penuh + sedikit intip kartu berikutnya (peek)
      count = 2;
      effectiveCount = 2.22;
      g = screenW <= 320 ? 8 : 10;
    }

    this.visibleCount.set(count);
    this.gap.set(g);

    // Padding horizontal internal viewport (windowEl has px-1 = 8px)
    const horizPadding = 8;
    const availableWidth = Math.max(100, w - horizPadding);

    const visibleGaps = effectiveCount > count ? count : count - 1;
    const gapsTotal = visibleGaps * g;
    const calculatedWidth = (availableWidth - gapsTotal) / effectiveCount;
    this.itemWidth.set(Math.max(90, Math.floor(calculatedWidth)));

    if (this.isBrowser && this.itemsSignal().length > 1) {
      this.setupMarquee();
    }
  }

  /**
   * Menginisialisasi GSAP continuous linear marquee tanpa henti
   */
  private setupMarquee(): void {
    if (!this.isBrowser || !this.trackEl?.nativeElement) return;
    const total = this.itemsSignal().length;

    if (this.nudgeTween) {
      this.nudgeTween.kill();
      this.nudgeTween = null;
    }

    if (total <= 1 || this.prefersReducedMotion()) {
      if (this.marqueeTween) {
        this.marqueeTween.kill();
        this.marqueeTween = null;
      }
      gsap.set(this.trackEl.nativeElement, { x: 0 });
      return;
    }

    const prevProgress = this.marqueeTween ? this.marqueeTween.progress() : 0;
    if (this.marqueeTween) {
      this.marqueeTween.kill();
      this.marqueeTween = null;
    }

    const step = this.itemWidth() + this.gap();
    const oneSetWidth = total * step;
    const duration = oneSetWidth / this.speed;

    gsap.set(this.trackEl.nativeElement, { x: 0 });

    this.marqueeTween = gsap.to(this.trackEl.nativeElement, {
      x: -oneSetWidth,
      duration: duration,
      ease: 'none',
      repeat: -1,
      onUpdate: () => {
        this.updateCurrentSlideCounter();
      }
    });

    if (prevProgress > 0 && prevProgress < 1) {
      this.marqueeTween.progress(prevProgress);
    }

    this.updatePlayState();
  }

  private updateCurrentSlideCounter(): void {
    const total = this.itemsSignal().length;
    if (total === 0 || !this.trackEl?.nativeElement) return;
    const currentX = Math.abs((gsap.getProperty(this.trackEl.nativeElement, 'x') as number) || 0);
    const step = this.itemWidth() + this.gap();
    if (step <= 0) return;
    const index = Math.floor((currentX + 10) / step) % total;
    if (index !== this.currentIndex()) {
      this.currentIndex.set(index);
    }
  }

  shouldBePaused(): boolean {
    const total = this.itemsSignal().length;
    return (
      this.prefersReducedMotion() ||
      this.isHovered() ||
      this.isFocused() ||
      this.isSwiping ||
      this.isTouchPaused ||
      !this.isInView() ||
      !this.isTabVisible() ||
      total <= 1
    );
  }

  private updatePlayState(): void {
    if (!this.marqueeTween) return;
    if (this.shouldBePaused()) {
      this.marqueeTween.pause();
    } else {
      this.marqueeTween.resume();
    }
  }

  /**
   * Geser halus satu kartu ke depan lalu lanjutkan marquee
   */
  next(isManual = false): void {
    const total = this.itemsSignal().length;
    if (!this.isBrowser || total <= 1 || !this.trackEl?.nativeElement) return;
    if (isManual) this.triggerManualLive();

    const step = this.itemWidth() + this.gap();

    if (this.prefersReducedMotion()) {
      const nextIdx = (this.currentIndex() + 1) % total;
      this.currentIndex.set(nextIdx);
      if (this.windowEl?.nativeElement) {
        this.windowEl.nativeElement.scrollTo({
          left: nextIdx * step,
          behavior: 'smooth'
        });
      }
      return;
    }

    if (!this.marqueeTween) return;
    const stepTime = step / this.speed;
    const totalTime = this.marqueeTween.duration();
    let curTime = this.marqueeTween.time() % totalTime;
    let targetTime = curTime + stepTime;

    if (targetTime >= totalTime) {
      curTime = curTime - totalTime;
      this.marqueeTween.time(curTime);
      targetTime = targetTime - totalTime;
    }

    if (this.nudgeTween) {
      this.nudgeTween.kill();
    }

    this.nudgeTween = gsap.to(this.marqueeTween, {
      time: targetTime,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
      onComplete: () => {
        this.updateCurrentSlideCounter();
        this.updatePlayState();
      }
    });
  }

  /**
   * Geser halus satu kartu ke belakang lalu lanjutkan marquee
   */
  prev(): void {
    const total = this.itemsSignal().length;
    if (!this.isBrowser || total <= 1 || !this.trackEl?.nativeElement) return;
    this.triggerManualLive();

    const step = this.itemWidth() + this.gap();

    if (this.prefersReducedMotion()) {
      const prevIdx = (this.currentIndex() - 1 + total) % total;
      this.currentIndex.set(prevIdx);
      if (this.windowEl?.nativeElement) {
        this.windowEl.nativeElement.scrollTo({
          left: prevIdx * step,
          behavior: 'smooth'
        });
      }
      return;
    }

    if (!this.marqueeTween) return;
    const stepTime = step / this.speed;
    const totalTime = this.marqueeTween.duration();
    let curTime = this.marqueeTween.time() % totalTime;
    let targetTime = curTime - stepTime;

    if (targetTime < 0) {
      curTime = curTime + totalTime;
      this.marqueeTween.time(curTime);
      targetTime = targetTime + totalTime;
    }

    if (this.nudgeTween) {
      this.nudgeTween.kill();
    }

    this.nudgeTween = gsap.to(this.marqueeTween, {
      time: targetTime,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
      onComplete: () => {
        this.updateCurrentSlideCounter();
        this.updatePlayState();
      }
    });
  }

  private triggerManualLive(): void {
    this.isManual.set(true);
    if (this.manualTimeout) clearTimeout(this.manualTimeout);
    this.manualTimeout = setTimeout(() => {
      this.isManual.set(false);
    }, 2000);
  }

  // Mouse Hover Handlers
  onMouseEnter(): void {
    this.isHovered.set(true);
    this.updatePlayState();
  }

  onMouseLeave(): void {
    this.isHovered.set(false);
    this.updatePlayState();
  }

  // Keyboard Focus Handlers
  onFocusIn(): void {
    this.isFocused.set(true);
    this.updatePlayState();
  }

  onFocusOut(event: FocusEvent): void {
    const currentTarget = event.currentTarget as HTMLElement | null;
    if (currentTarget && !currentTarget.contains(event.relatedTarget as Node | null)) {
      this.isFocused.set(false);
      this.updatePlayState();
    }
  }

  // Keyboard Arrow Navigation
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next(true);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    }
  }

  // Touch Swipe Handlers (Swipe & Drag di Mobile dengan jeda otomatis sebelum lanjut)
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.isSwiping = true;
    if (this.touchPauseTimeout) {
      clearTimeout(this.touchPauseTimeout);
      this.touchPauseTimeout = null;
    }
    this.isTouchPaused = true;
    this.updatePlayState();
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isSwiping || event.touches.length !== 1) return;
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isSwiping) return;
    this.isSwiping = false;
    if (event.changedTouches && event.changedTouches.length > 0) {
      const diffX = event.changedTouches[0].clientX - this.touchStartX;
      const diffY = event.changedTouches[0].clientY - this.touchStartY;
      const threshold = 35; // minimum jarak geser dalam px
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        if (diffX < 0) {
          this.next(true); // geser ke kiri -> kartu berikutnya
        } else {
          this.prev(); // geser ke kanan -> kartu sebelumnya
        }
      }
    }
    if (this.touchPauseTimeout) {
      clearTimeout(this.touchPauseTimeout);
    }
    this.touchPauseTimeout = setTimeout(() => {
      this.isTouchPaused = false;
      this.updatePlayState();
    }, 2500);
  }

  onTouchCancel(): void {
    if (this.isSwiping) {
      this.isSwiping = false;
    }
    if (this.touchPauseTimeout) {
      clearTimeout(this.touchPauseTimeout);
    }
    this.touchPauseTimeout = setTimeout(() => {
      this.isTouchPaused = false;
      this.updatePlayState();
    }, 2500);
  }
}
