import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';

interface AmbientStar {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: string;
  duration: string;
}

@Component({
  selector: 'app-ambient-bg',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="ambient-container fixed inset-0 pointer-events-none select-none overflow-hidden z-0 w-full h-full"
      aria-hidden="true"
    >
      <!-- 1. Soft Gradient Canvas: Warm atmospheric dusk/evening palette -->
      <div
        class="absolute inset-0 w-full h-full"
        style="background: linear-gradient(180deg, #FFFBF8 0%, #FFF3F5 35%, #FFE9EF 70%, #FFDDE5 100%);"
      ></div>

      <!-- 2. Deterministic Pixel Stars (Spread across full viewport height 5%-92%, SSR-safe) -->
      <div
        #starsLayer
        class="stars-layer absolute inset-0 w-full h-full will-change-transform z-0"
      >
        @for (star of stars; track $index) {
          <div
            class="ambient-star absolute"
            [style.left.%]="star.x"
            [style.top.%]="star.y"
            [style.width.px]="star.size"
            [style.height.px]="star.size"
            [style.backgroundColor]="star.color"
            [style.animationDelay]="star.delay"
            [style.animationDuration]="star.duration"
          ></div>
        }
      </div>

      <!-- 3. Pixel Clouds Layer (Distributed at multiple heights across full viewport) -->
      <div
        #cloudsLayer
        class="clouds-layer absolute inset-0 w-full h-full will-change-transform z-0"
      >
        <!-- Awan 1 (Tinggi 7%, dengan Zzz, durasi 65s) -->
        <div
          class="ambient-cloud absolute"
          style="top: 7%; animation-duration: 65s; animation-delay: -15s; opacity: 0.7;"
        >
          <svg width="150" height="48" viewBox="0 0 150 48" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="20" y="14" width="110" height="24" fill="#FFE0E7" />
            <rect x="35" y="7" width="70" height="10" fill="#FFE0E7" />
            <rect x="50" y="0" width="40" height="9" fill="#FFE0E7" />
            <rect x="15" y="32" width="115" height="10" fill="#FFC2CF" />
            <rect x="30" y="40" width="85" height="8" fill="#FFC2CF" />
            <text x="62" y="27" font-family="'Pixelify Sans', monospace" font-size="11" font-weight="bold" fill="#C21F42" opacity="0.75">Zzz</text>
          </svg>
        </div>

        <!-- Awan 2 (Tinggi 21%, durasi 85s) -->
        <div
          class="ambient-cloud absolute"
          style="top: 21%; animation-duration: 85s; animation-delay: -48s; opacity: 0.6;"
        >
          <svg width="200" height="54" viewBox="0 0 200 54" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="25" y="16" width="150" height="26" fill="#FFE0E7" />
            <rect x="45" y="8" width="95" height="12" fill="#FFE0E7" />
            <rect x="68" y="0" width="52" height="10" fill="#FFE0E7" />
            <rect x="18" y="36" width="160" height="11" fill="#FFC2CF" />
            <rect x="38" y="45" width="120" height="9" fill="#FFC2CF" />
          </svg>
        </div>

        <!-- Awan 3 (Tinggi 36%, dengan Zzz, durasi 70s) -->
        <div
          class="ambient-cloud absolute"
          style="top: 36%; animation-duration: 70s; animation-delay: -25s; opacity: 0.65;"
        >
          <svg width="140" height="44" viewBox="0 0 140 44" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="16" y="12" width="105" height="22" fill="#FFE0E7" />
            <rect x="30" y="6" width="65" height="8" fill="#FFE0E7" />
            <rect x="45" y="0" width="38" height="7" fill="#FFE0E7" />
            <rect x="12" y="28" width="110" height="9" fill="#FFC2CF" />
            <rect x="26" y="36" width="80" height="8" fill="#FFC2CF" />
            <text x="56" y="24" font-family="'Pixelify Sans', monospace" font-size="10" font-weight="bold" fill="#C21F42" opacity="0.75">Zzz</text>
          </svg>
        </div>

        <!-- Awan 4 (Tinggi 50%, durasi 92s) -->
        <div
          class="ambient-cloud absolute"
          style="top: 50%; animation-duration: 92s; animation-delay: -65s; opacity: 0.6;"
        >
          <svg width="180" height="50" viewBox="0 0 180 50" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="22" y="14" width="135" height="24" fill="#FFE0E7" />
            <rect x="42" y="7" width="85" height="10" fill="#FFE0E7" />
            <rect x="62" y="0" width="48" height="9" fill="#FFE0E7" />
            <rect x="16" y="32" width="145" height="10" fill="#FFC2CF" />
            <rect x="34" y="40" width="105" height="8" fill="#FFC2CF" />
          </svg>
        </div>

        <!-- Awan 5 (Tinggi 66%, dengan Zzz, durasi 58s) -->
        <div
          class="ambient-cloud absolute"
          style="top: 66%; animation-duration: 58s; animation-delay: -10s; opacity: 0.7;"
        >
          <svg width="135" height="42" viewBox="0 0 135 42" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="16" y="12" width="100" height="20" fill="#FFE0E7" />
            <rect x="30" y="6" width="62" height="8" fill="#FFE0E7" />
            <rect x="44" y="0" width="36" height="7" fill="#FFE0E7" />
            <rect x="12" y="26" width="105" height="9" fill="#FFC2CF" />
            <rect x="25" y="34" width="78" height="8" fill="#FFC2CF" />
            <text x="54" y="23" font-family="'Pixelify Sans', monospace" font-size="10" font-weight="bold" fill="#C21F42" opacity="0.75">Zzz</text>
          </svg>
        </div>

        <!-- Awan 6 (Tinggi 80%, durasi 78s) -->
        <div
          class="ambient-cloud absolute"
          style="top: 80%; animation-duration: 78s; animation-delay: -38s; opacity: 0.55;"
        >
          <svg width="190" height="52" viewBox="0 0 190 52" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="24" y="15" width="142" height="24" fill="#FFE0E7" />
            <rect x="44" y="8" width="90" height="11" fill="#FFE0E7" />
            <rect x="65" y="0" width="50" height="9" fill="#FFE0E7" />
            <rect x="18" y="34" width="152" height="10" fill="#FFC2CF" />
            <rect x="36" y="43" width="112" height="8" fill="#FFC2CF" />
          </svg>
        </div>
      </div>

      <!-- 4. Low Pixel City Horizon (Dasar viewport, max 18vh, offset tab bar mobile pada <md) -->
      <div
        #cityLayer
        class="city-layer absolute bottom-0 left-0 right-0 w-full h-[15vh] min-h-[80px] max-h-[18vh] pb-14 md:pb-0 pointer-events-none will-change-transform z-0"
      >
        <svg
          class="w-full h-full"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          shape-rendering="crispEdges"
        >
          <!-- Siluet Belakang #FFE0E7 (brand-100) dengan opacity 0.55 -->
          <path
            d="M 0 100
               L 0 70
               H 30 V 55 H 65 V 45 H 105 V 55 H 135 V 65 H 170 V 40 H 210 V 40 H 210 V 58 H 255 V 32 H 285 V 32 H 285 V 55 H 330 V 48 H 360 V 38 H 395 V 38 H 395 V 60 H 440 V 50 H 475 V 28 H 510 V 28 H 510 V 55 H 555 V 65 H 595 V 42 H 635 V 42 H 635 V 62 H 675 V 35 H 710 V 35 H 710 V 58 H 755 V 48 H 795 V 30 H 830 V 30 H 830 V 52 H 870 V 62 H 915 V 38 H 955 V 38 H 955 V 58 H 995 V 46 H 1030 V 32 H 1070 V 32 H 1070 V 56 H 1115 V 45 H 1155 V 60 H 1200 V 70 L 1200 100 Z"
            fill="#FFE0E7"
            opacity="0.55"
          />

          <!-- Siluet Depan #FFC2CF (brand-200) dengan opacity 0.45 -->
          <path
            d="M 0 100
               L 0 80
               H 45 V 68 H 85 V 68 H 85 V 78 H 145 V 58 H 185 V 58 H 185 V 75 H 230 V 65 H 270 V 50 H 300 V 50 H 300 V 72 H 350 V 60 H 410 V 60 H 410 V 75 H 465 V 58 H 500 V 46 H 530 V 46 H 530 V 72 H 580 V 62 H 620 V 74 H 685 V 55 H 725 V 55 H 725 V 70 H 775 V 62 H 815 V 48 H 850 V 48 H 850 V 70 H 895 V 58 H 940 V 58 H 940 V 74 H 985 V 62 H 1045 V 50 H 1080 V 50 H 1080 V 70 H 1130 V 60 H 1170 V 75 H 1200 V 82 L 1200 100 Z"
            fill="#FFC2CF"
            opacity="0.45"
          />

          <!-- Jendela-jendela Kecil Menyala #FFC93C (sun) -->
          <rect x="70" y="52" width="6" height="8" fill="#FFC93C" opacity="0.75" />
          <rect x="185" y="46" width="6" height="8" fill="#FFC93C" opacity="0.75" />
          <rect x="265" y="38" width="5" height="7" fill="#FFC93C" opacity="0.7" />
          <rect x="375" y="45" width="6" height="8" fill="#FFC93C" opacity="0.75" />
          <rect x="485" y="35" width="6" height="8" fill="#FFC93C" opacity="0.8" />
          <rect x="610" y="48" width="5" height="7" fill="#FFC93C" opacity="0.7" />
          <rect x="690" y="42" width="6" height="8" fill="#FFC93C" opacity="0.75" />
          <rect x="805" y="38" width="6" height="8" fill="#FFC93C" opacity="0.8" />
          <rect x="925" y="45" width="5" height="7" fill="#FFC93C" opacity="0.7" />
          <rect x="1045" y="38" width="6" height="8" fill="#FFC93C" opacity="0.75" />
          <rect x="1130" y="52" width="5" height="7" fill="#FFC93C" opacity="0.7" />
        </svg>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }

    .ambient-star {
      border-radius: 0;
      opacity: 0.35;
      animation: starTwinkle ease-in-out infinite;
    }

    @keyframes starTwinkle {
      0%, 100% {
        opacity: 0.25;
        transform: scale(0.9);
      }
      50% {
        opacity: 0.85;
        transform: scale(1.15);
      }
    }

    .ambient-cloud {
      animation: floatCloud linear infinite;
      will-change: transform;
    }

    @keyframes floatCloud {
      from {
        transform: translate3d(-240px, 0, 0);
      }
      to {
        transform: translate3d(calc(100vw + 240px), 0, 0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ambient-star,
      .ambient-cloud {
        animation: none !important;
      }
    }
  `]
})
export class AmbientBgComponent implements AfterViewInit, OnDestroy {
  @ViewChild('starsLayer') starsLayer?: ElementRef<HTMLElement>;
  @ViewChild('cloudsLayer') cloudsLayer?: ElementRef<HTMLElement>;
  @ViewChild('cityLayer') cityLayer?: ElementRef<HTMLElement>;

  private rafId: number | null = null;
  private isBrowser = false;
  private scrollListener?: () => void;

  readonly stars: readonly AmbientStar[] = [
    { x: 5, y: 8, size: 3, color: '#FFC93C', delay: '0.2s', duration: '3.8s' },
    { x: 18, y: 14, size: 2, color: '#FFC2CF', delay: '1.4s', duration: '4.5s' },
    { x: 32, y: 6, size: 3, color: '#FFE0E7', delay: '2.1s', duration: '4.9s' },
    { x: 45, y: 12, size: 4, color: '#FFC93C', delay: '0.8s', duration: '3.4s' },
    { x: 58, y: 9, size: 2, color: '#FFC2CF', delay: '1.8s', duration: '5.2s' },
    { x: 72, y: 16, size: 3, color: '#FFE0E7', delay: '0.5s', duration: '4.0s' },
    { x: 84, y: 7, size: 3, color: '#FFC93C', delay: '2.6s', duration: '4.3s' },
    { x: 93, y: 15, size: 4, color: '#FFC2CF', delay: '1.2s', duration: '3.6s' },
    { x: 12, y: 28, size: 3, color: '#FFC93C', delay: '1.7s', duration: '4.2s' },
    { x: 26, y: 34, size: 2, color: '#FFC2CF', delay: '0.9s', duration: '3.5s' },
    { x: 39, y: 24, size: 3, color: '#FFE0E7', delay: '2.4s', duration: '4.7s' },
    { x: 62, y: 31, size: 4, color: '#FFC93C', delay: '1.3s', duration: '3.9s' },
    { x: 76, y: 27, size: 2, color: '#FFC2CF', delay: '0.4s', duration: '5.1s' },
    { x: 88, y: 35, size: 3, color: '#FFE0E7', delay: '2.2s', duration: '4.4s' },
    { x: 8, y: 48, size: 3, color: '#FFC93C', delay: '1.1s', duration: '3.7s' },
    { x: 22, y: 44, size: 2, color: '#FFC2CF', delay: '2.7s', duration: '4.8s' },
    { x: 48, y: 49, size: 3, color: '#FFE0E7', delay: '0.6s', duration: '4.3s' },
    { x: 68, y: 43, size: 2, color: '#FFC93C', delay: '1.9s', duration: '3.9s' },
    { x: 82, y: 47, size: 4, color: '#FFC2CF', delay: '0.7s', duration: '4.6s' },
    { x: 95, y: 42, size: 2, color: '#FFE0E7', delay: '2.5s', duration: '5.0s' },
    { x: 14, y: 62, size: 3, color: '#FFC93C', delay: '1.5s', duration: '4.1s' },
    { x: 28, y: 58, size: 2, color: '#FFC2CF', delay: '0.3s', duration: '3.8s' },
    { x: 42, y: 66, size: 3, color: '#FFE0E7', delay: '2.0s', duration: '4.5s' },
    { x: 57, y: 60, size: 4, color: '#FFC93C', delay: '1.2s', duration: '3.6s' },
    { x: 73, y: 64, size: 2, color: '#FFC2CF', delay: '2.3s', duration: '5.3s' },
    { x: 86, y: 59, size: 3, color: '#FFE0E7', delay: '0.8s', duration: '4.0s' },
    { x: 10, y: 78, size: 2, color: '#FFC2CF', delay: '1.6s', duration: '4.7s' },
    { x: 34, y: 74, size: 3, color: '#FFE0E7', delay: '0.5s', duration: '3.9s' },
    { x: 52, y: 82, size: 4, color: '#FFC93C', delay: '2.4s', duration: '4.4s' },
    { x: 79, y: 77, size: 2, color: '#FFC2CF', delay: '1.0s', duration: '5.0s' },
    { x: 91, y: 84, size: 3, color: '#FFE0E7', delay: '1.8s', duration: '4.2s' }
  ];

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    if (typeof window.addEventListener !== 'function') {
      return;
    }

    const onScroll = () => {
      if (this.rafId !== null) return;
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        const scrollY = window.scrollY || window.pageYOffset || 0;

        if (this.starsLayer?.nativeElement) {
          this.starsLayer.nativeElement.style.transform = `translate3d(0, ${-(scrollY * 0.03)}px, 0)`;
        }
        if (this.cloudsLayer?.nativeElement) {
          this.cloudsLayer.nativeElement.style.transform = `translate3d(0, ${-(scrollY * 0.07)}px, 0)`;
        }
        if (this.cityLayer?.nativeElement) {
          this.cityLayer.nativeElement.style.transform = `translate3d(0, ${scrollY * 0.04}px, 0)`;
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    this.scrollListener = () => window.removeEventListener('scroll', onScroll);
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      this.scrollListener();
    }
    if (this.rafId !== null && this.isBrowser) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
