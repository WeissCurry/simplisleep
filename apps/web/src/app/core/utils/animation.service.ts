import { DestroyRef, Injectable } from '@angular/core';

export interface GsapScopeResult {
  ctx?: any;
  revert: () => void;
}

/**
 * Utilitas GSAP untuk SimpliSleep (Wizardshock Light + SimpliDOTS):
 * - Menghormati prefers-reduced-motion (WCAG AAA accessibility)
 * - Otomatis membersihkan animasi / tweens saat komponen destroy melalui DestroyRef
 * - Memuat GSAP secara dinamis (lazy load via import('gsap')) agar tidak membebani initial bundle / TBT
 * - Menyediakan helper efek: Zzz melayang, bintang berkelip, stagger leaderboard, skor count-up
 */
@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private gsapPromise?: Promise<any>;

  /**
   * Cek apakah user mengaktifkan reduced-motion pada OS/Browser
   */
  isReducedMotion(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Muat modul gsap secara dinamis hanya jika dibutuhkan dan bukan reduced motion
   */
  private async getGsap(): Promise<any | null> {
    if (typeof window === 'undefined' || this.isReducedMotion()) return null;
    if (!this.gsapPromise) {
      this.gsapPromise = import('gsap').then((m) => m.gsap);
    }
    return this.gsapPromise;
  }

  /**
   * Buat GSAP context dengan auto-cleanup pada DestroyRef (asinkron)
   */
  createScope(scopeElement?: HTMLElement | Element | null, destroyRef?: DestroyRef): GsapScopeResult {
    let ctx: any = null;
    let reverted = false;

    this.getGsap().then((gsap) => {
      if (!gsap || reverted) return;
      ctx = gsap.context(() => {}, scopeElement || undefined);
    });

    const revert = () => {
      reverted = true;
      ctx?.revert();
    };

    if (destroyRef) {
      destroyRef.onDestroy(revert);
    }

    return {
      ctx,
      revert
    };
  }

  /**
   * Animasi bintang berkelip di latar langit senja/malam
   */
  animateTwinklingStars(container: HTMLElement, count = 28, destroyRef?: DestroyRef): void {
    if (!container) return;

    container.innerHTML = '';
    const reduced = this.isReducedMotion();
    const fragment = document.createDocumentFragment();
    const stars: HTMLSpanElement[] = [];

    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      const size = Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1.5;
      const top = Math.floor(Math.random() * 95);
      const left = Math.floor(Math.random() * 98);
      const baseOpacity = 0.25 + Math.random() * 0.4;

      star.className = 'absolute pointer-events-none select-none';
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${top}%`;
      star.style.left = `${left}%`;
      star.style.backgroundColor = Math.random() > 0.3 ? '#EC385B' : '#FFC93C';
      star.style.borderRadius = '0px';
      star.style.opacity = `${baseOpacity}`;

      fragment.appendChild(star);
      stars.push(star);
    }
    container.appendChild(fragment);

    if (reduced) return;

    let ctx: any = null;
    this.getGsap().then((gsap) => {
      if (!gsap) return;
      ctx = gsap.context(() => {
        stars.forEach((star) => {
          const duration = 1.2 + Math.random() * 2.2;
          const delay = Math.random() * 2;
          const targetOpacity = 0.85 + Math.random() * 0.15;

          gsap.to(star, {
            opacity: targetOpacity,
            scale: 1.4,
            repeat: -1,
            yoyo: true,
            duration,
            delay,
            ease: 'power1.inOut'
          });
        });
      }, container);
    });

    if (destroyRef) {
      destroyRef.onDestroy(() => ctx?.revert());
    }
  }

  /**
   * Animasi Zzz melayang naik dari tombol tidur atau avatar
   */
  animateFloatingZzz(
    container: HTMLElement,
    options: {
      count?: number;
      intervalMs?: number;
      color?: string;
      destroyRef?: DestroyRef;
    } = {}
  ): () => void {
    if (!container || this.isReducedMotion()) {
      return () => {};
    }

    const {
      intervalMs = 1800,
      color = '#FFC93C',
      destroyRef
    } = options;

    let isRunning = true;
    let timerId: any = null;
    const activeLetters: HTMLElement[] = [];

    const spawnZ = async () => {
      if (!isRunning || !container) return;
      const gsap = await this.getGsap();
      if (!gsap || !isRunning || !container) return;

      const z = document.createElement('span');
      const sizes = ['text-xs', 'text-sm', 'text-base'];
      const letters = ['z', 'Z', 'Zzz'];
      const randomIdx = Math.floor(Math.random() * letters.length);

      z.innerText = letters[randomIdx];
      z.className = `absolute font-pixel font-bold pointer-events-none select-none ${sizes[randomIdx]}`;
      z.style.color = color;
      z.style.left = `${30 + Math.random() * 40}%`;
      z.style.bottom = '10%';
      z.style.opacity = '0';
      z.style.textShadow = '1px 1px 0px #141414';

      container.appendChild(z);
      activeLetters.push(z);

      const swayOffset = (Math.random() - 0.5) * 40;
      const duration = 2.4 + Math.random() * 0.8;

      gsap.fromTo(
        z,
        {
          opacity: 0,
          y: 0,
          x: 0,
          scale: 0.8
        },
        {
          opacity: 0.9,
          y: -60,
          x: swayOffset,
          scale: 1.25,
          duration: duration * 0.6,
          ease: 'power1.out',
          onComplete: () => {
            gsap.to(z, {
              opacity: 0,
              y: -110,
              x: swayOffset * 1.5,
              scale: 0.9,
              duration: duration * 0.4,
              ease: 'power1.in',
              onComplete: () => {
                if (z.parentNode === container) {
                  container.removeChild(z);
                }
                const idx = activeLetters.indexOf(z);
                if (idx > -1) activeLetters.splice(idx, 1);
              }
            });
          }
        }
      );

      timerId = setTimeout(spawnZ, intervalMs + Math.random() * 600);
    };

    spawnZ();

    const cleanup = () => {
      isRunning = false;
      if (timerId) clearTimeout(timerId);
      this.getGsap().then((gsap) => {
        if (gsap) {
          activeLetters.forEach((el) => gsap.killTweensOf(el));
        }
        activeLetters.forEach((el) => {
          if (el.parentNode === container) {
            container.removeChild(el);
          }
        });
        activeLetters.length = 0;
      });
    };

    if (destroyRef) {
      destroyRef.onDestroy(cleanup);
    }

    return cleanup;
  }

  /**
   * Animasi masuk baris leaderboard (stagger)
   */
  animateLeaderboardRows(
    rows: HTMLElement[] | NodeListOf<HTMLElement> | string,
    destroyRef?: DestroyRef,
    scope?: HTMLElement
  ): void {
    if (this.isReducedMotion()) {
      return;
    }

    let ctx: any = null;
    this.getGsap().then((gsap) => {
      if (!gsap) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          rows,
          {
            opacity: 0,
            y: 18,
            scale: 0.98
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.35,
            stagger: 0.04,
            ease: 'power2.out',
            clearProps: 'transform'
          }
        );
      }, scope);
    });

    if (destroyRef) {
      destroyRef.onDestroy(() => ctx?.revert());
    }
  }

  /**
   * Animasi count-up angka skor (misal 0 -> 92)
   */
  animateScoreCountUp(
    element: HTMLElement,
    targetScore: number,
    duration = 1.1,
    destroyRef?: DestroyRef
  ): void {
    if (!element) return;

    if (this.isReducedMotion()) {
      element.textContent = Math.round(targetScore).toString();
      return;
    }

    let ctx: any = null;
    this.getGsap().then((gsap) => {
      if (!gsap) {
        element.textContent = Math.round(targetScore).toString();
        return;
      }

      const counter = { val: 0 };
      ctx = gsap.context(() => {
        gsap.to(counter, {
          val: targetScore,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            element.textContent = Math.round(counter.val).toString();
          }
        });
      }, element);
    });

    if (destroyRef) {
      destroyRef.onDestroy(() => ctx?.revert());
    }
  }

  /**
   * Animasi glow kartu berdasarkan rarity (Common, Rare, Epic, Legendary)
   * Menghormati prefers-reduced-motion
   */
  animateCardRarityGlow(
    element: HTMLElement,
    rarity: string,
    destroyRef?: DestroyRef
  ): void {
    if (!element) return;

    let maxShadow = '0 0 12px rgba(92, 92, 92, 0.4)';
    let minShadow = '0 0 4px rgba(92, 92, 92, 0.2)';

    switch (rarity) {
      case 'Legendary':
        maxShadow = '0 0 28px rgba(255, 201, 60, 0.95), 0 0 10px rgba(180, 83, 9, 0.6)';
        minShadow = '0 0 12px rgba(255, 201, 60, 0.5)';
        break;
      case 'Epic':
        maxShadow = '0 0 22px rgba(147, 51, 234, 0.9), 0 0 8px rgba(192, 132, 252, 0.6)';
        minShadow = '0 0 8px rgba(147, 51, 234, 0.4)';
        break;
      case 'Rare':
        maxShadow = '0 0 18px rgba(37, 99, 235, 0.85), 0 0 6px rgba(96, 165, 250, 0.5)';
        minShadow = '0 0 6px rgba(37, 99, 235, 0.3)';
        break;
      case 'Common':
      default:
        break;
    }

    if (this.isReducedMotion()) {
      element.style.boxShadow = maxShadow;
      return;
    }

    let ctx: any = null;
    this.getGsap().then((gsap) => {
      if (!gsap) {
        element.style.boxShadow = maxShadow;
        return;
      }

      ctx = gsap.context(() => {
        gsap.fromTo(
          element,
          {
            boxShadow: minShadow,
            scale: 0.99
          },
          {
            boxShadow: maxShadow,
            scale: 1.01,
            duration: 1.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          }
        );
      }, element);
    });

    if (destroyRef) {
      destroyRef.onDestroy(() => ctx?.revert());
    }
  }
}
