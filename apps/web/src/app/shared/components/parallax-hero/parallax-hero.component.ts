import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-parallax-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #heroContainer
      class="relative w-full overflow-hidden select-none"
      [style.height]="height"
      [style.min-height]="'520px'"
      style="background: transparent; mask-image: linear-gradient(to bottom, black 0%, black 90%, rgba(0,0,0,0.6) 96%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 0%, black 90%, rgba(0,0,0,0.6) 96%, transparent 100%);"
    >
      <!-- Layer 0: Langit Senja SimpliDOTS (Matahari Pixel di Pojok Kanan Atas, awan beranimasi dari ambient-bg) -->
      <div
        #layer0
        class="absolute inset-0 w-full h-full pointer-events-none will-change-transform z-0"
      >
        <svg
          class="w-full h-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          shape-rendering="crispEdges"
        >
          <!-- Pixel Matahari Senja di POJOK KANAN ATAS (Tidak menimpa wordmark di tengah) -->
          <g transform="translate(1010, 20)">
            <!-- Outer Glow -->
            <rect x="15" y="0" width="60" height="90" fill="#FFE0E7" />
            <rect x="0" y="15" width="90" height="60" fill="#FFE0E7" />
            <rect x="7" y="7" width="76" height="76" fill="#FFE0E7" />

            <!-- Mid Sun Circle -->
            <rect x="22" y="7" width="46" height="76" fill="#FFC2CF" />
            <rect x="7" y="22" width="76" height="46" fill="#FFC2CF" />
            <rect x="15" y="15" width="60" height="60" fill="#FFC2CF" />

            <!-- Core Sun Pixel (Warm Sun Color #FFC93C) -->
            <rect x="30" y="15" width="30" height="60" fill="#FFC93C" />
            <rect x="15" y="30" width="60" height="30" fill="#FFC93C" />
            <rect x="22" y="22" width="46" height="46" fill="#FFC93C" />
            <rect x="34" y="34" width="22" height="22" fill="#FFFBF8" />
          </g>
        </svg>
      </div>

      <!-- Layer 1: Bukit & Menara Jauh (#FFE0E7 / #FFC2CF) — Diturunkan ke y>=380 -->
      <div
        #layer1
        class="absolute inset-0 w-full h-full pointer-events-none will-change-transform z-1"
      >
        <svg
          class="w-full h-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          shape-rendering="crispEdges"
        >
          <!-- Bukit Jauh Kiri (Puncak turun ke y=400) -->
          <path
            d="M 0 600
               L 0 510
               H 50 V 490 H 100 V 470 H 150 V 450 H 200 V 430 H 250 V 405
               H 290 V 390 H 330 V 405 H 370 V 430 H 420 V 455 H 480 V 485
               H 540 V 515 H 610 V 545 H 700 V 600 Z"
            fill="#FFE0E7"
          />

          <!-- Menara & Bukit Jauh Kanan (Puncak turun ke y=380) -->
          <path
            d="M 520 600
               L 520 540
               H 570 V 515 H 620 V 485 H 670 V 460 H 710 V 430 H 740 V 400 H 755 V 380
               H 760 V 360 H 765 V 380 H 780 V 400 H 810 V 435 H 860 V 465 H 910 V 495
               H 970 V 525 H 1040 V 555 H 1200 V 580 L 1200 600 Z"
            fill="#FFC2CF"
          />

          <!-- Antena Pemancar Pixel di Puncak Bukit Jauh -->
          <rect x="287" y="365" width="4" height="25" fill="#F58FA3" />
          <rect x="283" y="370" width="12" height="3" fill="#F58FA3" />
          <rect x="285" y="363" width="8" height="3" fill="#EC385B" />
        </svg>
      </div>

      <!-- Layer 2: Kota Kantor & Rumah Midground (#F58FA3) — Diturunkan ke y>=435 -->
      <div
        #layer2
        class="absolute inset-0 w-full h-full pointer-events-none will-change-transform z-2"
      >
        <svg
          class="w-full h-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          shape-rendering="crispEdges"
        >
          <!-- Skyline Kantor & Kompleks Midground (Towers diturunkan ke y>=430) -->
          <path
            d="M 0 600
               L 0 540
               H 40 V 515 H 80 V 490 H 130 V 490 H 130 V 460 H 170 V 460 H 170 V 440
               H 210 V 440 H 210 V 480 H 260 V 480 H 260 V 510 H 310 V 510 H 310 V 470
               H 360 V 470 H 360 V 445 H 400 V 445 H 400 V 435 H 405 V 425 H 410 V 435
               H 415 V 445 H 450 V 445 H 450 V 500 H 500 V 500 H 500 V 470 H 550 V 470
               H 550 V 515 H 610 V 515 H 610 V 480 H 660 V 480 H 660 V 450 H 710 V 450
               H 750 V 450 H 750 V 490 H 800 V 490 H 800 V 460 H 850 V 460 H 850 V 435
               H 895 V 435 H 895 V 485 H 940 V 485 H 940 V 520 H 990 V 520 H 990 V 470
               H 1040 V 470 H 1040 V 445 H 1080 V 445 H 1080 V 495 H 1130 V 495 H 1170 V 530 H 1200 V 600 Z"
            fill="#F58FA3"
          />

          <!-- Jendela Kantor Midground -->
          <rect x="140" y="468" width="7" height="10" fill="#FFE0E7" />
          <rect x="155" y="468" width="7" height="10" fill="#FFE0E7" />
          <rect x="180" y="450" width="8" height="12" fill="#FFE0E7" />
          <rect x="230" y="490" width="8" height="10" fill="#FFC93C" opacity="0.8" />
          <rect x="330" y="480" width="7" height="10" fill="#FFE0E7" />
          <rect x="375" y="455" width="8" height="10" fill="#FFE0E7" />
          <rect x="470" y="480" width="8" height="12" fill="#FFE0E7" />
          <rect x="520" y="480" width="8" height="12" fill="#FFC93C" opacity="0.8" />
          <rect x="675" y="458" width="8" height="10" fill="#FFE0E7" />
          <rect x="860" y="445" width="8" height="11" fill="#FFC93C" opacity="0.8" />
          <rect x="1050" y="455" width="7" height="10" fill="#FFE0E7" />
        </svg>
      </div>

      <!-- Layer 3: Siluet Terdepan Kota SimpliMates Tidur (#8E1631) — Pijakan Dasar y=535-543 -->
      <div
        #layer3
        class="absolute inset-0 w-full h-full pointer-events-none will-change-transform z-3"
      >
        <svg
          class="w-full h-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          shape-rendering="crispEdges"
        >
          <!-- Baris Dasar Kota Penuh Selebar Viewport (#8E1631) Setinggi 8px (y=535-543) -->
          <rect x="0" y="535" width="1200" height="8" fill="#8E1631" />

          <!-- Deretan Rumah & Kantor Terdepan (Menyatu kokoh dengan baris dasar y=535-543) -->
          <path
            d="M 0 543
               L 0 535
               H 30 V 525 H 60 V 515 H 90 V 500 H 120 V 515 H 150 V 525 H 180 V 535
               H 200 V 515 H 210 V 495 H 240 V 495 H 250 V 515 H 250 V 535
               H 280 V 525 H 310 V 525 H 340 V 535
               H 360 V 530 H 380 V 515 H 400 V 500 H 420 V 515 H 440 V 530 H 460 V 535
               H 490 V 510 H 500 V 485 H 510 V 465 H 515 V 455 H 525 V 455 H 530 V 465
               H 540 V 485 H 550 V 510 H 570 V 535
               H 600 V 525 H 630 V 510 H 660 V 525 H 690 V 535
               H 720 V 530 H 750 V 515 H 770 V 495 H 790 V 495 H 810 V 515 H 830 V 530
               H 860 V 535
               H 880 V 535 H 910 V 515 H 940 V 515 H 960 V 535 H 980 V 535
               H 1010 V 525 H 1030 V 505 H 1040 V 485 H 1055 V 485 H 1065 V 505 H 1080 V 525
               H 1110 V 535 H 1130 V 525 H 1160 V 525 H 1180 V 535 H 1200 V 535
               L 1200 543
               Z"
            fill="#8E1631"
          />

          <!-- Pohon-Pohon Pinus Pixel Terdepan (Duduk di baris dasar y=535) -->
          <g transform="translate(15, 505)">
            <rect x="8" y="20" width="4" height="10" fill="#5C0D1E" />
            <rect x="0" y="16" width="20" height="6" fill="#8E1631" />
            <rect x="3" y="10" width="14" height="6" fill="#8E1631" />
            <rect x="6" y="4" width="8" height="6" fill="#8E1631" />
            <rect x="8" y="0" width="4" height="4" fill="#8E1631" />
          </g>

          <g transform="translate(1165, 505)">
            <rect x="8" y="20" width="4" height="10" fill="#5C0D1E" />
            <rect x="0" y="16" width="20" height="6" fill="#8E1631" />
            <rect x="3" y="10" width="14" height="6" fill="#8E1631" />
            <rect x="6" y="4" width="8" height="6" fill="#8E1631" />
            <rect x="8" y="0" width="4" height="4" fill="#8E1631" />
          </g>

          <!-- Jendela-jendela Menyala (#FFC93C) & Padam (#5C0D1E) -->
          <rect x="75" y="515" width="8" height="11" fill="#FFC93C" />
          <rect x="95" y="515" width="8" height="11" fill="#5C0D1E" />
          <rect x="220" y="500" width="10" height="13" fill="#FFC93C" />
          <rect x="390" y="510" width="8" height="10" fill="#5C0D1E" />
          <rect x="515" y="475" width="8" height="12" fill="#FFC93C" />
          <rect x="515" y="495" width="8" height="11" fill="#5C0D1E" />
          <rect x="640" y="515" width="8" height="10" fill="#FFC93C" />
          <rect x="780" y="505" width="10" height="12" fill="#FFC93C" />
          <rect x="925" y="515" width="9" height="11" fill="#5C0D1E" />
          <rect x="1050" y="495" width="8" height="11" fill="#FFC93C" />
        </svg>
      </div>

      <!-- Layer 4: Pantulan Air Kota Vertikal (scaleY(-1), memudar ~40-60% tinggi kota) & Awan Transisi -->
      <div
        #reflectionLayer
        class="absolute inset-0 w-full h-full pointer-events-none will-change-transform z-3"
      >
        <svg
          class="w-full h-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          shape-rendering="crispEdges"
        >
          <defs>
            <!-- SVG Gradient Mask untuk pantulan air: memudar halus dari dasar kota ke transparan penuh -->
            <linearGradient id="heroReflectionMask" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.65" />
              <stop offset="25%" stop-color="#ffffff" stop-opacity="0.40" />
              <stop offset="65%" stop-color="#ffffff" stop-opacity="0.12" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
            </linearGradient>
            <mask id="waterReflectionMask">
              <rect x="0" y="543" width="1200" height="52" fill="url(#heroReflectionMask)" />
            </mask>
          </defs>

          <!-- Pantulan Kota Vertikal (scaleY -1 terhadap garis dasar air y=543, tinggi ~40-50px) -->
          <g mask="url(#waterReflectionMask)">
            <g transform="translate(0, 1086) scale(1, -1)">
              <!-- Pantulan baris dasar kota -->
              <rect x="0" y="535" width="1200" height="8" fill="#8E1631" />

              <path
                d="M 0 543
                   L 0 535
                   H 30 V 525 H 60 V 515 H 90 V 500 H 120 V 515 H 150 V 525 H 180 V 535
                   H 200 V 515 H 210 V 495 H 240 V 495 H 250 V 515 H 250 V 535
                   H 280 V 525 H 310 V 525 H 340 V 535
                   H 360 V 530 H 380 V 515 H 400 V 500 H 420 V 515 H 440 V 530 H 460 V 535
                   H 490 V 510 H 500 V 485 H 510 V 465 H 515 V 455 H 525 V 455 H 530 V 465
                   H 540 V 485 H 550 V 510 H 570 V 535
                   H 600 V 525 H 630 V 510 H 660 V 525 H 690 V 535
                   H 720 V 530 H 750 V 515 H 770 V 495 H 790 V 495 H 810 V 515 H 830 V 530
                   H 860 V 535
                   H 880 V 535 H 910 V 515 H 940 V 515 H 960 V 535 H 980 V 535
                   H 1010 V 525 H 1030 V 505 H 1040 V 485 H 1055 V 485 H 1065 V 505 H 1080 V 525
                   H 1110 V 535 H 1130 V 525 H 1160 V 525 H 1180 V 535 H 1200 V 535
                   L 1200 543
                   Z"
                fill="#8E1631"
              />

              <!-- Pantulan jendela menyala -->
              <rect x="75" y="515" width="8" height="11" fill="#FFC93C" />
              <rect x="220" y="500" width="10" height="13" fill="#FFC93C" />
              <rect x="515" y="475" width="8" height="12" fill="#FFC93C" />
              <rect x="640" y="515" width="8" height="10" fill="#FFC93C" />
              <rect x="780" y="505" width="10" height="12" fill="#FFC93C" />
              <rect x="1050" y="495" width="8" height="11" fill="#FFC93C" />
            </g>

            <!-- Tepat 2 riak air tipis yang sengaja dan low-contrast (tanpa garis scanline banyak) -->
            <rect x="160" y="546" width="280" height="1.5" fill="#FFE0E7" opacity="0.35" />
            <rect x="660" y="550" width="340" height="1.5" fill="#FFE0E7" opacity="0.3" />
          </g>

          <!-- Awan-Awan Pixel Bertangga di Area Pudar Dasar Hero (Menyatu Alami dengan Ambient-BG) -->
          <g opacity="0.75">
            <!-- Awan Bawah Kiri -->
            <rect x="40" y="552" width="170" height="16" fill="#FFE0E7" />
            <rect x="75" y="544" width="95" height="10" fill="#FFE0E7" />
            <rect x="25" y="566" width="190" height="12" fill="#FFC2CF" />
            <rect x="55" y="576" width="130" height="8" fill="#FFC2CF" />

            <!-- Awan Bawah Tengah dengan Zzz -->
            <rect x="440" y="550" width="210" height="18" fill="#FFE0E7" />
            <rect x="480" y="542" width="125" height="10" fill="#FFE0E7" />
            <rect x="420" y="566" width="245" height="12" fill="#FFC2CF" />
            <rect x="455" y="576" width="175" height="8" fill="#FFC2CF" />
            <text x="530" y="563" font-family="'Pixelify Sans', monospace" font-size="11" font-weight="bold" fill="#C21F42" opacity="0.7">Zzz</text>

            <!-- Awan Bawah Kanan -->
            <rect x="860" y="552" width="190" height="17" fill="#FFE0E7" />
            <rect x="900" y="544" width="105" height="10" fill="#FFE0E7" />
            <rect x="840" y="567" width="220" height="12" fill="#FFC2CF" />
            <rect x="875" y="577" width="150" height="8" fill="#FFC2CF" />
          </g>
        </svg>
      </div>

      <!-- Hero Center Content (Ditempatkan di bagian atas langit luas agar bebas tabrakan dengan gedung) -->
      <div
        #heroContent
        class="relative z-10 w-full h-full flex flex-col items-center justify-start pt-6 sm:pt-8 md:pt-10 text-center will-change-transform box-border overflow-visible"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class ParallaxHeroComponent implements AfterViewInit, OnDestroy {
  @Input() height = '88svh';

  @ViewChild('heroContainer') heroContainer!: ElementRef<HTMLElement>;
  @ViewChild('layer0') layer0!: ElementRef<HTMLElement>;
  @ViewChild('layer1') layer1!: ElementRef<HTMLElement>;
  @ViewChild('layer2') layer2!: ElementRef<HTMLElement>;
  @ViewChild('layer3') layer3!: ElementRef<HTMLElement>;
  @ViewChild('reflectionLayer') reflectionLayer?: ElementRef<HTMLElement>;
  @ViewChild('heroContent') heroContent!: ElementRef<HTMLElement>;

  private ctx?: { revert: () => void };
  private isDestroyed = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Hormati prefers-reduced-motion (WCAG AA accessibility)
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    // Dynamic import GSAP + ScrollTrigger setelah first paint (requestIdleCallback / setTimeout)
    // Konten LCP (wordmark hero & CTA) tetap terlihat 100% langsung tanpa delay
    const scheduleInit = (cb: () => void) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(cb, { timeout: 2000 });
      } else {
        setTimeout(cb, 120);
      }
    };

    scheduleInit(async () => {
      if (this.isDestroyed || !this.heroContainer?.nativeElement) return;

      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger')
        ]);

        if (this.isDestroyed || !this.heroContainer?.nativeElement) return;

        gsap.registerPlugin(ScrollTrigger);

        this.ctx = gsap.context(() => {
          const triggerElement = this.heroContainer.nativeElement;

          const baseScrollTrigger = {
            trigger: triggerElement,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5
          };

          // Layer 0: Langit senja (faktor ~0.8)
          if (this.layer0?.nativeElement) {
            gsap.to(this.layer0.nativeElement, {
              yPercent: 12,
              ease: 'none',
              scrollTrigger: baseScrollTrigger
            });
          }

          // Layer 1: Bukit / Gedung Jauh (faktor ~0.6)
          if (this.layer1?.nativeElement) {
            gsap.to(this.layer1.nativeElement, {
              yPercent: 22,
              ease: 'none',
              scrollTrigger: baseScrollTrigger
            });
          }

          // Layer 2: Kota Kantor Midground (faktor ~0.3)
          if (this.layer2?.nativeElement) {
            gsap.to(this.layer2.nativeElement, {
              yPercent: 32,
              ease: 'none',
              scrollTrigger: baseScrollTrigger
            });
          }

          // Layer 3: Siluet Terdepan (faktor ~0 / bergerak minimal)
          if (this.layer3?.nativeElement) {
            gsap.to(this.layer3.nativeElement, {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: baseScrollTrigger
            });
          }

          // Layer 4: Pantulan Air Kota (sinkron sempurna dengan siluet kota terdepan)
          if (this.reflectionLayer?.nativeElement) {
            gsap.to(this.reflectionLayer.nativeElement, {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: baseScrollTrigger
            });
          }

          // Hero Content (Wordmark & CTA) bergerak naik saat scroll (faktor -0.5)
          if (this.heroContent?.nativeElement) {
            gsap.to(this.heroContent.nativeElement, {
              yPercent: -35,
              opacity: 0.2,
              ease: 'none',
              scrollTrigger: baseScrollTrigger
            });
          }
        }, this.heroContainer.nativeElement);
      } catch {
        // Fallback anggun: bila import gagal, hero tetap berfungsi statis
      }
    });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.ctx?.revert();
  }
}
