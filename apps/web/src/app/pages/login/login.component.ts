import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { DUMMY_SIMPLIMATES, DummySimplimate } from '../../core/services/mock-data';
import { AVAILABLE_CARD_IMAGE_IDS, cardImageUrl, cardSilhouetteUrl, hasCardImage, onCardImageError } from '../../core/utils/card.util';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ParallaxHeroComponent } from '../../shared/components/parallax-hero/parallax-hero.component';
import { PixelButtonComponent } from '../../shared/components/pixel-button/pixel-button.component';
import { PixelErrorComponent } from '../../shared/components/pixel-error/pixel-error.component';
import { PixelLoadingComponent } from '../../shared/components/pixel-loading/pixel-loading.component';
import { PixelSliderComponent } from '../../shared/components/pixel-slider/pixel-slider.component';
import { RarityBadgeComponent } from '../../shared/components/rarity-badge/rarity-badge.component';
import { CardsService, RarityBoardCard } from '../cards/cards.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AvatarComponent,
    ParallaxHeroComponent,
    PixelSliderComponent,
    RarityBadgeComponent,
    PixelLoadingComponent,
    PixelErrorComponent
  ],
  template: `
    <div class="space-y-12 sm:space-y-16">
      <!-- 1. PARALLAX HERO SECTION (Wizardshock Style - Versi Terang SimpliDOTS) -->
      <section
        class="relative w-full overflow-hidden"
      >
        <app-parallax-hero height="84svh">
          <div class="container-app flex flex-col items-center justify-center text-center select-none py-6">
            <!-- Event Pill Badge (Responsive on 344px, no overflow) -->
            <div
              class="inline-flex items-center gap-1.5 sm:gap-2 bg-brand-50 border-2 border-ink px-2.5 py-1 sm:px-3.5 sm:py-1.5 font-pixel text-[11px] sm:text-xs font-bold text-brand-ink uppercase tracking-wider mb-3 sm:mb-4 pixel-shadow-sm rounded-[6px] max-w-full text-center"
            >
              <span class="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-brand rounded-full inline-block border border-ink shrink-0 animate-pulse"></span>
              <span class="sm:hidden">Anti Begadang Club</span>
              <span class="hidden sm:inline">SimpliDOTS Vibe Coding 2026 • Anti Begadang Club</span>
            </div>

            <!-- Massive Wordmark (clamp font-size, 2 baris di mobile agar muat 312px) -->
            <h1
              class="font-pixel font-black text-ink tracking-tight uppercase leading-none drop-shadow-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
            >
              <span style="font-size: clamp(2.2rem, 12vw, 5.5rem);">SIMPLI</span>
              <span class="text-brand flex items-center justify-center" style="font-size: clamp(2.2rem, 12vw, 5.5rem);">
                SLEEP
                <span
                  class="inline-block w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-brand rounded-full border-2 sm:border-3 border-ink ml-1.5 align-middle"
                  aria-hidden="true"
                ></span>
              </span>
            </h1>

            <!-- Tagline with Solid Chip Background (Legible against building silhouettes at 884/1440px) -->
            <div class="bg-surface/95 border-2 border-ink px-3 sm:px-5 py-2 sm:py-2.5 rounded-[8px] pixel-shadow-sm max-w-xl mx-auto mt-3 sm:mt-5">
              <p
                class="font-pixel text-xs sm:text-sm md:text-base text-brand-deep font-bold uppercase tracking-wider leading-snug"
              >
                Tidur Sehat 7–9 Jam • Bukan Lomba Begadang • Koleksi Kartu Permanen
              </p>
            </div>

            <!-- Chunky CTA Buttons (Full width on mobile, rounded 8px) -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mt-5 sm:mt-8 w-full max-w-md px-2">
              <button
                type="button"
                (click)="scrollToDemo()"
                class="btn-pixel rounded-[8px] text-xs sm:text-sm md:text-base w-full sm:w-auto max-w-full px-5 py-3 cursor-pointer whitespace-nowrap justify-center"
              >
                Coba Akun Demo
              </button>

              <button
                type="button"
                (click)="scrollToGoogle()"
                class="btn-pixel btn-pixel--ghost rounded-[8px] text-xs sm:text-sm md:text-base w-full sm:w-auto max-w-full px-5 py-3 cursor-pointer whitespace-nowrap justify-center"
                [attr.title]="isGoogleAuthAvailable() ? 'Masuk dengan Akun Google' : 'Login Google belum dikonfigurasi'"
              >
                Masuk Google
              </button>
            </div>
          </div>
        </app-parallax-hero>
      </section>

      <!-- 2. LEAD STORY PARAGRAPH (Jujur, Santai & Ringkas) -->
      <section class="container-app">
        <div class="panel-pixel rounded-[12px] p-5 sm:p-8 bg-surface">
          <div class="max-w-xl mx-auto text-center space-y-3 sm:space-y-4">

            <h2 class="font-pixel text-2xl sm:text-3xl lg:text-4xl font-black text-ink uppercase tracking-tight">
              Work HARD, istira'HARD'
            </h2>

            <p class="lead-pixel text-ink-muted text-sm sm:text-base leading-relaxed">
              Bukan lomba begadang. Yang tidur 7–9 jam dengan jadwal konsisten, dia pemenangnya.
            </p>

            <div class="pt-2 sm:pt-3 flex items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-pixel font-bold text-brand-ink uppercase flex-wrap">
              <span>7–9 Jam</span>
              <span class="text-ink-muted select-none" aria-hidden="true">•</span>
              <span>Skor Durasi & Konsistensi</span>
              <span class="text-ink-muted select-none" aria-hidden="true">•</span>
              <span>Tanpa Pantau Jam Tidur</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. CUPLIKAN GALERI KARTU 'SIMPLY IS SLEEPING' (Pixel Slider Dinamis dari Rarity Board) -->
      <section class="container-app space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-3 border-ink pb-3">
          <div>
            <span class="font-pixel text-xs font-bold uppercase tracking-wider text-brand-ink whitespace-nowrap">
              Koleksi Pixel 16-Bit
            </span>
            <h3 class="font-pixel text-2xl sm:text-3xl font-black text-ink uppercase tracking-tight">
              Cuplikan 'Simply is Sleeping'
            </h3>
          </div>

          <a
            routerLink="/cards"
            class="btn-pixel btn-pixel--ghost btn-pixel--sm rounded-[8px] whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Lihat Seluruh 28 Kartu ↗
          </a>
        </div>

        <!-- Reusable Dynamic Pixel Slider -->
        @if (isLoadingCards()) {
          <app-pixel-loading message="Memuat cuplikan kartu Simply is Sleeping..."></app-pixel-loading>
        } @else {
          <app-pixel-slider
            [items]="rarityCards()"
            ariaLabel="Cuplikan Koleksi Kartu Simply is Sleeping"
          >
            <ng-template let-card let-idx="index" let-hidden="hidden">
              @let unlocked = isCardUnlocked(card.cardId);

              <div class="panel-pixel rounded-[12px] p-2.5 sm:p-3 lg:p-3.5 flex flex-col justify-between bg-surface hover:-translate-y-1 transition-transform h-full">
                <!-- Square Image Area (Rounded 8px, Siluet bila belum dibuka) -->
                <div>
                  <div
                    class="relative w-full aspect-square border-2 border-ink overflow-hidden mb-2 sm:mb-2.5 flex items-center justify-center rounded-[8px] p-1.5 sm:p-2"
                    [ngClass]="unlocked ? 'bg-brand-50' : getSoftRarityBgClass(card.rarity)"
                  >
                    @if (unlocked) {
                      <!-- Terbuka (Full Color) -->
                      @if (hasImage(card.cardId)) {
                        <img
                          [src]="getCardUrl(card.cardId)"
                          [alt]="card.name"
                          (error)="onImageError($event, card.name, card.rarity)"
                          class="w-full h-full object-cover pixelated rounded-[8px]"
                        />
                      } @else {
                        <div class="w-full h-full flex flex-col items-center justify-center text-center p-2 select-none">
                          <div class="w-10 h-10 sm:w-12 sm:h-12 border-2 border-ink bg-surface flex items-center justify-center font-pixel text-xl sm:text-2xl font-bold mb-1 rounded-[8px] pixel-shadow-sm text-ink">
                            ?
                          </div>
                          <span class="font-pixel text-[9px] sm:text-[10px] font-bold text-ink uppercase tracking-wider rounded-[6px] whitespace-nowrap">
                            Segera Bangun
                          </span>
                        </div>
                      }
                    } @else if (hasImage(card.cardId) && !failedSilhouettes.has(card.cardId)) {
                      <!-- Siluet Hewan Asli (HANYA muat siluet jika file ada) -->
                      <img
                        [src]="getSilhouetteUrl(card.cardId)"
                        [alt]="'Siluet ' + card.name"
                        (error)="onSilhouetteError(card.cardId)"
                        class="w-full h-full object-contain pixelated rounded-[8px]"
                      />
                    } @else {
                      <!-- Placeholder Pixel '?' -->
                      <div class="w-full h-full flex flex-col items-center justify-center text-center p-2 select-none">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 border-2 border-ink bg-surface flex items-center justify-center font-pixel text-xl sm:text-2xl font-bold mb-1 rounded-[8px] pixel-shadow-sm text-ink">
                          ?
                        </div>
                        <span class="font-pixel text-[9px] sm:text-[10px] font-bold text-ink uppercase tracking-wider rounded-[6px] whitespace-nowrap">
                          Belum Terbuka
                        </span>
                      </div>
                    }

                    <!-- Rarity Badge floating top-right (tidak menimpa gambar) -->
                    <div class="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 z-10 pointer-events-none">
                      <app-rarity-badge [rarity]="card.rarity" size="sm"></app-rarity-badge>
                    </div>

                    <!-- Peringkat Kelangkaan #rank floating bottom-left -->
                    <div
                      class="absolute bottom-1 sm:bottom-1.5 left-1 sm:left-1.5 font-pixel text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 border border-ink font-black rounded-[5px] shadow-[1px_1px_0px_#141414]"
                      [ngClass]="getRankBadgeClass(card.rank)"
                    >
                      #{{ card.rank }}
                    </div>
                  </div>

                  <!-- Card Name as Pixel Heading: Ukuran disesuaikan agar proporsional -->
                  <h4
                    class="font-pixel text-xs sm:text-sm lg:text-base font-bold text-ink uppercase truncate"
                    [title]="unlocked ? card.name : '???'"
                  >
                    {{ unlocked ? card.name : '???' }}
                  </h4>

                  <!-- Kepemilikan Kelangkaan -->
                  <div class="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-ink-muted font-sans min-h-[1.75rem] sm:min-h-[1.5rem] leading-tight">
                    @if (card.owners === 0) {
                      <span class="font-pixel text-[9px] sm:text-[10px] bg-brand-50 text-brand-ink border border-brand-200 px-1.5 py-0.5 font-bold uppercase rounded-[5px] inline-block">
                        Belum Ditemukan
                      </span>
                    } @else {
                      <span class="text-[10px] sm:text-xs leading-tight">
                        Dimiliki <strong class="text-ink font-bold">{{ card.owners }}</strong> dari {{ totalUsers() }} SimpliMates
                      </span>
                    }
                  </div>
                </div>

                <!-- Chunky Action Button: text-[10px] sm:text-xs, flex items-center justify-between gap-1 sm:gap-2 -->
                <div class="mt-2.5 sm:mt-3 pt-1.5 sm:pt-2 border-t-2 border-ink flex items-center justify-between gap-1 sm:gap-2">
                  <span class="font-pixel text-[10px] sm:text-xs font-bold text-brand-ink uppercase whitespace-nowrap shrink-0">
                    {{ card.rarity }}
                  </span>
                  <a
                    routerLink="/cards"
                    class="btn-pixel btn-pixel--sm rounded-[6px] sm:rounded-[8px] whitespace-nowrap text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 shrink-0"
                    [attr.tabindex]="hidden ? -1 : null"
                  >
                    {{ unlocked ? 'Lihat ↗' : 'Koleksi ↗' }}
                  </a>
                </div>
              </div>
            </ng-template>
          </app-pixel-slider>
        }
      </section>

      <!-- 4. DEMO SIMPLIMATE SELECTION SECTION (Logika Login Demo) -->
      <section id="demo-picker" class="container-app scroll-mt-20 space-y-6">
        <div class="border-b-3 border-ink pb-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span class="font-pixel text-xs font-bold uppercase tracking-wider text-brand-ink whitespace-nowrap">
              Coba Tanpa Daftar
            </span>
            <h3 class="font-pixel text-2xl sm:text-3xl font-black text-ink uppercase tracking-tight">
              Pilih salah satu akun demo
            </h3>
          </div>
          <span class="font-pixel text-xs bg-brand-50 border border-brand-200 text-brand-ink px-3 py-1 font-bold rounded-[6px] self-center sm:self-auto whitespace-nowrap">
            Klik akun untuk masuk instan
          </span>
        </div>

        @if (isLoadingDemoUsers()) {
          <app-pixel-loading message="Memuat daftar profil demo..."></app-pixel-loading>
        } @else if (demoUsersError()) {
          <app-pixel-error
            title="Gagal Memuat Profil Demo"
            [message]="demoUsersError()!"
            (retry)="loadDemoUsers()"
          ></app-pixel-error>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (user of demoUsers(); track user.id) {
              <div
                (click)="selectUser(user)"
                tabindex="0"
                role="button"
                (keydown.enter)="selectUser(user)"
                (keydown.space)="$event.preventDefault(); selectUser(user)"
                [attr.aria-label]="user.name + ', ' + user.role + ' — pilih akun demo'"
                class="panel-pixel rounded-[12px] p-4 bg-surface hover:bg-brand-50/70 hover:-translate-y-1 transition-all cursor-pointer flex items-center gap-3.5 select-none focus-visible:outline-3 focus-visible:outline-brand-ink"
              >
                <app-avatar [name]="user.name" [avatar]="user.avatar" size="md"></app-avatar>
                <div class="min-w-0 flex-1">
                  <h4 class="font-pixel text-sm font-bold text-ink truncate uppercase leading-tight">
                    {{ user.name }}
                  </h4>
                  <p class="text-xs text-brand-ink font-medium truncate">{{ user.role }}</p>
                  @if (user.personality && user.personality.trim()) {
                    <p class="text-[11px] text-ink-muted italic truncate mt-0.5">
                      "{{ user.personality }}"
                    </p>
                  }
                  @if (user.baseStreak || user.baseAvgScore) {
                    <div class="flex items-center gap-2 mt-1.5 text-[11px] font-pixel text-ink flex-wrap sm:flex-nowrap">
                      @if (user.baseStreak) {
                        <span class="bg-brand-100 border border-brand-200 px-2 py-0.5 rounded-[6px] whitespace-nowrap">{{ user.baseStreak }}m</span>
                      }
                      @if (user.baseAvgScore) {
                        <span class="bg-sun/30 border border-sun px-2 py-0.5 rounded-[6px] whitespace-nowrap">Skor: {{ user.baseAvgScore }}</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- 5. GOOGLE SIGN-IN BOX (Logika Login Google) -->
      <section id="google-login" class="container-app scroll-mt-20">
        <div class="panel-pixel rounded-[12px] p-5 sm:p-8 max-w-xl mx-auto text-center bg-surface space-y-4">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-brand-50 border-2 border-ink text-brand-ink mb-1 rounded-[8px]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          </div>
          <h4 class="font-pixel text-xl sm:text-2xl font-bold text-ink uppercase tracking-tight">
            Masuk dengan Akun Google
          </h4>
          <p class="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
            @if (isGoogleAuthAvailable()) {
              Masuk menggunakan akun Google resmi untuk menyinkronkan profil dan catatan tidurmu.
            } @else {
              Google Workspace OAuth hanya aktif bila client dan server dikonfigurasi dengan Client ID resmi. Silakan gunakan pilihan akun demo di atas.
            }
          </p>
          <div class="pt-2">
            @if (isGoogleAuthAvailable()) {
              <div class="flex flex-col items-center justify-center gap-2">
                <div id="googleBtnContainer" class="flex justify-center min-h-[44px]"></div>
                @if (isGoogleLoading()) {
                  <span class="text-xs text-ink-muted font-pixel animate-pulse">Menghubungkan ke Google...</span>
                }
              </div>
            } @else {
              <button
                type="button"
                disabled
                title="Login Google belum dikonfigurasi"
                class="btn-pixel btn-pixel--ghost rounded-[8px] whitespace-nowrap text-xs sm:text-sm opacity-60 cursor-not-allowed mx-auto px-5 py-2.5 max-w-full"
              >
                <span class="font-bold mr-2">G</span> Login Google belum dikonfigurasi
              </button>
            }
          </div>
        </div>
      </section>

      <!-- 6. WIZARDSHOCK FOOTER (Satu Baris Sederhana) -->
      <footer class="container-app pt-8 pb-12 border-t-2 border-ink text-center text-xs text-ink-muted font-pixel">
        <p>© 2026 SimpliSleep • Gerakan Tidur Sehat SimpliDOTS • Anti Begadang Club</p>
      </footer>
    </div>
  `,
  styles: [`
    :host .panel-pixel {
      border-radius: 12px;
    }
    :host .btn-pixel {
      border-radius: 8px;
      white-space: nowrap;
    }
  `]
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cardsService = inject(CardsService);
  private toast = inject(ToastService);

  demoUsers = signal<DummySimplimate[]>([]);
  isLoadingDemoUsers = signal<boolean>(true);
  demoUsersError = signal<string | null>(null);

  rarityCards = signal<RarityBoardCard[]>([]);
  isLoadingCards = signal<boolean>(true);
  totalUsers = signal<number>(12);
  failedSilhouettes = new Set<string>();

  // Aset kartu yang memiliki gambar & siluet di assets/cards/web/
  readonly KNOWN_IMAGE_IDS = AVAILABLE_CARD_IMAGE_IDS;

  readonly isGoogleAuthAvailable = signal<boolean>(
    Boolean(environment.googleClientId?.trim() && !environment.useMock)
  );
  readonly isGoogleLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDemoUsers();

    if (this.isGoogleAuthAvailable()) {
      this.initGoogleAuth();
    }

    this.isLoadingCards.set(true);
    this.cardsService.getRarityBoard().subscribe({
      next: (board) => {
        this.totalUsers.set(board.totalUsers);
        this.rarityCards.set(this.orderCardsForShowcase(board.cards));
        this.isLoadingCards.set(false);
      },
      error: (err) => {
        console.error('Failed to load rarity board', err);
        this.isLoadingCards.set(false);
      }
    });
  }

  loadDemoUsers(): void {
    this.isLoadingDemoUsers.set(true);
    this.demoUsersError.set(null);
    this.auth.getDemoUsers().subscribe({
      next: (users) => {
        this.demoUsers.set(users);
        this.isLoadingDemoUsers.set(false);
      },
      error: (err) => {
        console.error('Failed to load demo users', err);
        this.toast.error('Gagal memuat profil demo dari server.', 'Koneksi Error');
        this.demoUsersError.set('Gagal memuat profil demo dari server. Silakan coba lagi.');
        this.isLoadingDemoUsers.set(false);
      }
    });
  }

  hasImage(cardId: string): boolean {
    return hasCardImage(cardId);
  }

  /**
   * Mengatur urutan slide cuplikan landing agar impresi pertama menarik & bervariasi:
   * 1. Mulai dengan kartu terbuka (warna penuh): orange-cat, sloth
   * 2. Siluet kartu yang memiliki aset gambar, diselang-seling per rarity (Legendary, Epic, Rare, Common)
   * 3. Kartu tanpa gambar sama sekali (placeholder '?') diletakkan paling akhir bila ada
   */
  private orderCardsForShowcase(cards: RarityBoardCard[]): RarityBoardCard[] {
    // 1. Kartu terbuka (warna penuh)
    const unlocked = cards.filter((c) => this.isCardUnlocked(c.cardId));

    // 2. Kartu siluet yang memiliki aset gambar
    const silhouettes = cards.filter(
      (c) => !this.isCardUnlocked(c.cardId) && this.KNOWN_IMAGE_IDS.has(c.cardId)
    );

    const legendaries = silhouettes.filter((c) => c.rarity === 'Legendary');
    const epics = silhouettes.filter((c) => c.rarity === 'Epic');
    const rares = silhouettes.filter((c) => c.rarity === 'Rare');
    const commons = silhouettes.filter((c) => c.rarity === 'Common');

    // Selang-seling Legendary, Epic, Rare, Common
    const interleaved: RarityBoardCard[] = [];
    let lIdx = 0;
    let eIdx = 0;
    let rIdx = 0;
    let cIdx = 0;

    while (lIdx < legendaries.length || eIdx < epics.length || rIdx < rares.length || cIdx < commons.length) {
      if (lIdx < legendaries.length) interleaved.push(legendaries[lIdx++]);
      if (eIdx < epics.length) interleaved.push(epics[eIdx++]);
      if (rIdx < rares.length) interleaved.push(rares[rIdx++]);
      if (cIdx < commons.length) interleaved.push(commons[cIdx++]);
    }

    // 3. Kartu tanpa aset gambar sama sekali (placeholder '?') di akhir bila ada
    const placeholders = cards.filter(
      (c) => !this.isCardUnlocked(c.cardId) && !this.KNOWN_IMAGE_IDS.has(c.cardId)
    );

    return [...unlocked, ...interleaved, ...placeholders];
  }

  isCardUnlocked(cardId: string): boolean {
    return cardId === 'orange-cat' || cardId === 'sloth';
  }

  getRankBadgeClass(rank: number): string {
    switch (rank) {
      case 1:
        return 'bg-sun text-ink';
      case 2:
        return 'bg-brand-200 text-brand-ink';
      case 3:
        return 'bg-brand-100 text-brand-ink';
      default:
        return 'bg-paper text-ink';
    }
  }

  selectUser(user: DummySimplimate): void {
    this.auth.loginDemo(user.id, user).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  scrollToDemo(): void {
    const el = document.getElementById('demo-picker');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToGoogle(): void {
    if (!this.isGoogleAuthAvailable()) {
      this.toast.info('Login Google belum dikonfigurasi. Silakan pilih profil demo di bawah.', 'Mode Demo');
    }
    const el = document.getElementById('google-login');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  initGoogleAuth(): void {
    if (!this.isGoogleAuthAvailable()) return;

    this.loadGsiScript()
      .then(() => {
        const google = (window as any).google;
        if (!google?.accounts?.id) return;

        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => {
            if (response?.credential) {
              this.isGoogleLoading.set(true);
              this.auth.loginGoogle(response.credential).subscribe({
                next: () => {
                  this.isGoogleLoading.set(false);
                  this.router.navigate(['/']);
                },
                error: () => {
                  this.isGoogleLoading.set(false);
                }
              });
            }
          }
        });

        const container = document.getElementById('googleBtnContainer');
        if (container) {
          google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
        }
      })
      .catch(() => {
        // Tanpa melempar error console bila pemuatan script GIS gagal
      });
  }

  private loadGsiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return resolve();
      if ((window as any).google?.accounts?.id) {
        return resolve();
      }
      const existingScript = document.getElementById('google-gsi-client');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', (e) => reject(e));
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  getCardUrl(cardId: string): string {
    return cardImageUrl(cardId);
  }

  getSilhouetteUrl(cardId: string): string {
    return cardSilhouetteUrl(cardId);
  }

  onSilhouetteError(cardId: string): void {
    this.failedSilhouettes.add(cardId);
  }

  getSoftRarityBgClass(rarity: any): string {
    switch (rarity) {
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

  onImageError(event: Event, name: string, rarity: any): void {
    onCardImageError(event, name, rarity);
  }
}
