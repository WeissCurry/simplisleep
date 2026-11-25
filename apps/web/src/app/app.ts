import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { SleepService } from './core/services/sleep.service';
import { AvatarComponent } from './shared/components/avatar/avatar.component';
import { AmbientBgComponent } from './shared/components/ambient-bg/ambient-bg.component';
import { DemoUserModalComponent } from './shared/components/demo-user-modal/demo-user-modal.component';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { WordmarkComponent } from './shared/components/wordmark/wordmark.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    WordmarkComponent,
    AvatarComponent,
    DemoUserModalComponent,
    AmbientBgComponent,
    ToastContainerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'SimpliSleep';
  private auth = inject(AuthService);
  private router = inject(Router);
  readonly sleepService = inject(SleepService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  private isFirstNavigation = true;

  @ViewChild('mainOutlet') mainOutlet?: ElementRef<HTMLElement>;
  @ViewChild('mobileAvatarBtn') mobileAvatarBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('accountCloseBtn') accountCloseBtn?: ElementRef<HTMLButtonElement>;

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;

  // Track URL rute aktif
  readonly currentUrl = signal(typeof window !== 'undefined' ? window.location.pathname : '/');

  readonly isLoginPage = computed(() => {
    const url = this.currentUrl();
    return url === '/login' || url.startsWith('/login?') || url.startsWith('/login#');
  });

  // User dianggap login aktif jika sudah punya token & bukan di halaman /login
  readonly isUserLoggedIn = computed(() => {
    return this.isAuthenticated() && !this.isLoginPage();
  });

  // Tab bar bawah hanya tampil bila user login dan di luar halaman landing /login
  readonly showBottomNav = computed(() => {
    return this.isUserLoggedIn();
  });

  // 5 Nav Tabs Utama
  readonly navTabs = [
    { path: '/', label: 'Malam', exact: true, ariaLabel: 'Halaman Malam Ini' },
    { path: '/leaderboard', label: 'Klasemen', exact: false, ariaLabel: 'Halaman Klasemen Leaderboard' },
    { path: '/awake', label: 'Melek', exact: false, ariaLabel: 'Halaman Masih Melek' },
    { path: '/cards', label: 'Kartu', exact: false, ariaLabel: 'Halaman Koleksi Kartu' },
    { path: '/about', label: 'Tentang', exact: false, ariaLabel: 'Halaman Tentang' }
  ];

  // Hitung index aktif untuk indikator geser (transform translateX)
  readonly activeTabIndex = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/leaderboard')) return 1;
    if (url.startsWith('/awake')) return 2;
    if (url.startsWith('/cards')) return 3;
    if (url.startsWith('/about')) return 4;
    if (url === '/' || url === '') return 0;
    return -1; // Rute lain di luar 5 tab utama
  });

  // State Modal Demo User
  readonly isDemoModalOpen = signal(false);

  // State Mobile Account Menu (Popover / Bottom Sheet)
  readonly isAccountMenuOpen = signal(false);
  readonly isAccountMenuRendered = signal(false);
  private closeAccountTimer?: any;

  private isReducedMotion(): boolean {
    if (!this.isBrowser || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  openDemoModal(): void {
    this.isDemoModalOpen.set(true);
  }

  closeDemoModal(): void {
    this.isDemoModalOpen.set(false);
  }

  openAccountMenu(): void {
    if (this.closeAccountTimer) {
      clearTimeout(this.closeAccountTimer);
      this.closeAccountTimer = undefined;
    }

    this.isAccountMenuRendered.set(true);

    if (this.isReducedMotion()) {
      this.isAccountMenuOpen.set(true);
      setTimeout(() => this.accountCloseBtn?.nativeElement?.focus(), 20);
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.isAccountMenuOpen.set(true);
        setTimeout(() => this.accountCloseBtn?.nativeElement?.focus(), 50);
      });
    });
  }

  closeAccountMenu(): void {
    if (!this.isAccountMenuRendered()) return;

    this.isAccountMenuOpen.set(false);

    const delay = this.isReducedMotion() ? 0 : 200;
    if (this.closeAccountTimer) {
      clearTimeout(this.closeAccountTimer);
    }

    this.closeAccountTimer = setTimeout(() => {
      this.isAccountMenuRendered.set(false);
      this.closeAccountTimer = undefined;
      if (this.isBrowser) {
        this.mobileAvatarBtn?.nativeElement?.focus();
      }
    }, delay);
  }

  toggleAccountMenu(): void {
    if (this.isAccountMenuOpen()) {
      this.closeAccountMenu();
    } else {
      this.openAccountMenu();
    }
  }

  handleSwitchDemoUser(): void {
    this.closeAccountMenu();
    this.openDemoModal();
  }

  handleLogout(): void {
    this.closeAccountMenu();
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isAccountMenuOpen()) {
      this.closeAccountMenu();
    }
  }

  @HostListener('window:resize')
  @HostListener('window:orientationchange')
  onWindowResize(): void {
    if (this.isBrowser) {
      this.currentUrl.set(this.router.url);
    }
  }

  scrollToDemoPicker(): void {
    if (this.isBrowser && typeof document !== 'undefined') {
      const picker = document.getElementById('demo-picker') || document.querySelector('app-pixel-slider');
      if (picker) {
        picker.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 520, behavior: 'smooth' });
      }
    }
  }

  onAccountMenuKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const menu = document.getElementById('mobile-account-menu');
    if (!menu) return;

    const focusables = menu.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  ngOnInit(): void {
    // Pastikan timer bersih bila komponen di-destroy
    this.destroyRef.onDestroy(() => {
      if (this.closeAccountTimer) {
        clearTimeout(this.closeAccountTimer);
      }
    });

    // 1. Heartbeat saat aplikasi pertama kali dibuka (bila sedang dalam sesi tidur)
    this.checkAndSendHeartbeat();

    // 2. Heartbeat, update URL, tutup account menu, & Animasi Transisi Halaman saat navigasi
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => {
        this.currentUrl.set(e.urlAfterRedirects || e.url);
        this.closeAccountMenu();
        this.checkAndSendHeartbeat();

        // Lewati animasi pada first load agar tidak menunda LCP
        if (this.isFirstNavigation) {
          this.isFirstNavigation = false;
          return;
        }

        if (!this.isBrowser) return;

        // Hormati prefers-reduced-motion
        if (
          typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
          return;
        }

        // GSAP page enter transition: subtle fade + translateY 12px (dimuat dinamis tanpa membebani bootup)
        if (this.mainOutlet?.nativeElement) {
          import('gsap').then(({ gsap }) => {
            if (this.mainOutlet?.nativeElement) {
              const el = this.mainOutlet.nativeElement;
              gsap.killTweensOf(el);
              gsap.fromTo(
                el,
                { opacity: 0, y: 12 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.35,
                  ease: 'power2.out',
                  onStart: () => {
                    el.style.willChange = 'opacity, transform';
                  },
                  onComplete: () => {
                    gsap.set(el, { clearProps: 'all' });
                    el.style.removeProperty('will-change');
                    el.style.removeProperty('transform');
                    el.style.removeProperty('opacity');
                  },
                  onInterrupt: () => {
                    gsap.set(el, { clearProps: 'all' });
                    el.style.removeProperty('will-change');
                    el.style.removeProperty('transform');
                    el.style.removeProperty('opacity');
                  }
                }
              );
            }
          });
        }
      });

    // 3. Heartbeat saat visibilitychange menjadi 'visible' (buka tab/kembali ke app)
    if (typeof document !== 'undefined') {
      const onVisibility = () => {
        if (document.visibilityState === 'visible') {
          this.checkAndSendHeartbeat();
        }
      };
      document.addEventListener('visibilitychange', onVisibility);
      this.destroyRef.onDestroy(() => {
        document.removeEventListener('visibilitychange', onVisibility);
      });
    }
  }

  private checkAndSendHeartbeat(): void {
    const session = this.sleepService.activeSession();
    if (session && session.status === 'active') {
      this.sleepService.heartbeat().subscribe();
    }
  }
}
